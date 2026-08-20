import { TERMS_VERSION } from "@/lib/brand";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";
import { PLANS, type Currency, type PlanId } from "@/lib/plans";

function appUrl(): string {
  const fromEnv = process.env.APP_URL?.trim() || process.env.BETTER_AUTH_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://127.0.0.1:8080";
}

export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export async function createCheckout(input: {
  userId: string;
  planId: PlanId;
  currency: Currency;
}): Promise<{ url: string; demo: boolean; orderId: string }> {
  const sql = await getSql();
  const accepted = await sql<{ id: string }>`
    select id from terms_acceptances
    where user_id = ${input.userId} and terms_version = ${TERMS_VERSION}
    limit 1
  `;
  if (accepted.length === 0) {
    throw new Error("Aceite os Termos de Uso antes de pagar.");
  }

  const plan = PLANS[input.planId];
  const price = plan.prices[input.currency];
  const orderId = newId("ord");

  await sql`
    insert into orders (id, user_id, plan_id, currency, amount, status, provider, terms_version)
    values (
      ${orderId},
      ${input.userId},
      ${input.planId},
      ${input.currency},
      ${price.amount},
      ${"pending"},
      ${stripeConfigured() ? "stripe" : "demo"},
      ${TERMS_VERSION}
    )
  `;

  if (!stripeConfigured()) {
    return {
      url: `/obrigado?order=${encodeURIComponent(orderId)}&demo=1`,
      demo: true,
      orderId,
    };
  }

  const secret = process.env.STRIPE_SECRET_KEY as string;
  const success = `${appUrl()}/obrigado?order=${encodeURIComponent(orderId)}`;
  const cancel = `${appUrl()}/checkout?plan=${input.planId}&currency=${input.currency}&canceled=1`;

  const body = new URLSearchParams();
  body.set("mode", plan.mode);
  body.set("success_url", success);
  body.set("cancel_url", cancel);
  body.set("client_reference_id", input.userId);
  body.set("metadata[orderId]", orderId);
  body.set("metadata[userId]", input.userId);
  body.set("metadata[planId]", input.planId);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", input.currency);
  body.set("line_items[0][price_data][unit_amount]", String(price.amount));
  body.set("line_items[0][price_data][product_data][name]", `Ben435 — ${plan.name}`);
  body.set(
    "line_items[0][price_data][product_data][description]",
    "Análise operacional de risco contratual. Não constitui parecer jurídico.",
  );
  if (plan.mode === "subscription") {
    body.set("line_items[0][price_data][recurring][interval]", "month");
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Stripe recusou o checkout (${res.status}): ${errText.slice(0, 180)}`);
  }
  const session = (await res.json()) as { id: string; url: string };
  await sql`
    update orders set stripe_session_id = ${session.id} where id = ${orderId} and user_id = ${input.userId}
  `;
  return { url: session.url, demo: false, orderId };
}

export async function fulfillOrder(input: {
  orderId: string;
  userId?: string;
  stripePaymentIntent?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
}): Promise<{ ok: true }> {
  const sql = await getSql();
  const [order] = await sql<{
    id: string;
    user_id: string;
    plan_id: string;
    status: string;
  }>`
    select id, user_id, plan_id, status from orders
    where id = ${input.orderId}
    limit 1
  `;
  if (!order) throw new Error("Pedido não encontrado");
  if (input.userId && order.user_id !== input.userId) {
    throw new Error("Pedido não encontrado");
  }
  if (order.status === "paid") return { ok: true };

  const plan = PLANS[order.plan_id as PlanId];
  if (!plan) throw new Error("Plano inválido");
  const periodEnd =
    plan.mode === "subscription"
      ? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
      : null;
  const paymentIntent = input.stripePaymentIntent ?? null;
  const customerId = input.stripeCustomerId ?? null;
  const subscriptionId = input.stripeSubscriptionId ?? null;

  await sql`
    update orders
    set status = ${"paid"},
        stripe_payment_intent = ${paymentIntent}
    where id = ${order.id}
  `;

  const [ent] = await sql<{ credits: number }>`
    select credits from entitlements where user_id = ${order.user_id}
  `;
  const addCredits = typeof plan.credits === "number" ? plan.credits : 0;
  const nextCredits = (ent?.credits ?? 0) + addCredits;
  const subStatus = plan.mode === "subscription" ? "active" : "none";

  if (ent) {
    await sql`
      update entitlements
      set credits = ${nextCredits},
          plan_id = ${order.plan_id},
          subscription_status = ${subStatus},
          current_period_end = ${periodEnd},
          stripe_customer_id = coalesce(${customerId}, stripe_customer_id),
          stripe_subscription_id = coalesce(${subscriptionId}, stripe_subscription_id),
          updated_at = now()
      where user_id = ${order.user_id}
    `;
  } else {
    await sql`
      insert into entitlements (
        user_id, credits, plan_id, subscription_status, current_period_end,
        stripe_customer_id, stripe_subscription_id
      ) values (
        ${order.user_id},
        ${nextCredits},
        ${order.plan_id},
        ${subStatus},
        ${periodEnd},
        ${customerId},
        ${subscriptionId}
      )
    `;
  }
  return { ok: true };
}

const encoder = new TextEncoder();

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string,
): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k?.trim(), rest.join("=")];
    }),
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const age = Math.abs(Date.now() / 1000 - Number(t));
  if (!Number.isFinite(age) || age > 300) return false;
  const expected = await hmacSha256Hex(secret, `${t}.${payload}`);
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  }
  return diff === 0;
}

export async function fulfillByStripeSession(session: {
  id?: string;
  metadata?: Record<string, string> | null;
  payment_intent?: string | { id: string } | null;
  subscription?: string | { id: string } | null;
  customer?: string | { id: string } | null;
}): Promise<void> {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  const sub =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const customer =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  await fulfillOrder({
    orderId,
    stripePaymentIntent: pi,
    stripeSubscriptionId: sub,
    stripeCustomerId: customer,
  });
}
