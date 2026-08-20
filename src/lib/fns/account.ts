import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { TERMS_VERSION } from "@/lib/brand";
import { isCurrency, isPlanId, type Currency, type PlanId } from "@/lib/plans";
import { newId } from "@/lib/ids";

export type Entitlement = {
  credits: number;
  planId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  hasActiveSubscription: boolean;
  canAnalyze: boolean;
  acceptedTerms: boolean;
  termsVersion: string;
};

function periodActive(iso: string | null, status: string | null): boolean {
  if (status !== "active" && status !== "trialing") return false;
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
}

export const getEntitlement = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Entitlement> => {
    const sql = await getSql();
    const [ent] = await sql<{
      credits: number;
      plan_id: string | null;
      subscription_status: string | null;
      current_period_end: string | null;
    }>`
      select credits, plan_id, subscription_status, current_period_end
      from entitlements where user_id = ${context.userId}
    `;
    const [terms] = await sql<{ terms_version: string }>`
      select terms_version from terms_acceptances
      where user_id = ${context.userId} and terms_version = ${TERMS_VERSION}
      order by accepted_at desc limit 1
    `;
    const credits = ent?.credits ?? 0;
    const status = ent?.subscription_status ?? null;
    const end = ent?.current_period_end ?? null;
    const hasActiveSubscription = periodActive(end, status);
    return {
      credits,
      planId: ent?.plan_id ?? null,
      subscriptionStatus: status,
      currentPeriodEnd: end,
      hasActiveSubscription,
      canAnalyze: hasActiveSubscription || credits > 0,
      acceptedTerms: Boolean(terms),
      termsVersion: TERMS_VERSION,
    };
  });

export const acceptTerms = createServerFn({ method: "POST" })
  .validator((input: { source?: string }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<{ id: string }>`
      select id from terms_acceptances
      where user_id = ${context.userId} and terms_version = ${TERMS_VERSION}
      limit 1
    `;
    if (existing.length === 0) {
      await sql`
        insert into terms_acceptances (id, user_id, terms_version, source)
        values (${newId("terms")}, ${context.userId}, ${TERMS_VERSION}, ${data.source ?? "checkout"})
      `;
    }
    return { ok: true as const, version: TERMS_VERSION };
  });

export const listAnalyses = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string;
      title: string;
      contract_kind: string;
      status: string;
      overall_risk: string | null;
      score: number | null;
      created_at: string;
    }>`
      select id, title, contract_kind, status, overall_risk, score, created_at
      from analyses
      where user_id = ${context.userId}
      order by created_at desc
      limit 40
    `;
  });

export const getAnalysis = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const [row] = await sql<{
      id: string;
      title: string;
      contract_text: string;
      contract_kind: string;
      status: string;
      overall_risk: string | null;
      score: number | null;
      result_json: string | null;
      error_message: string | null;
      created_at: string;
      completed_at: string | null;
    }>`
      select id, title, contract_text, contract_kind, status, overall_risk, score,
             result_json, error_message, created_at, completed_at
      from analyses
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
    return row ?? null;
  });

export const startCheckout = createServerFn({ method: "POST" })
  .validator((input: { planId: string; currency: string }) => {
    if (!isPlanId(input.planId)) throw new Error("Plano inválido");
    if (!isCurrency(input.currency)) throw new Error("Moeda inválida");
    return input as { planId: PlanId; currency: Currency };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const { createCheckout } = await import("@/lib/fns/stripe");
    return createCheckout({
      userId: context.userId,
      planId: data.planId,
      currency: data.currency,
    });
  });

export const completeDemoOrder = createServerFn({ method: "POST" })
  .validator((orderId: string) => orderId)
  .middleware([authMiddleware])
  .handler(async ({ context, data: orderId }) => {
    const { fulfillOrder } = await import("@/lib/fns/stripe");
    return fulfillOrder({ orderId, userId: context.userId });
  });
