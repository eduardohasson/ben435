import { createFileRoute } from "@tanstack/react-router";
import { fulfillByStripeSession, verifyStripeSignature } from "@/lib/fns/stripe";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
        if (!secret) {
          return new Response("webhook not configured", { status: 503 });
        }
        const payload = await request.text();
        const header = request.headers.get("stripe-signature") ?? "";
        const ok = await verifyStripeSignature(payload, header, secret);
        if (!ok) return new Response("invalid signature", { status: 400 });

        const event = JSON.parse(payload) as {
          type: string;
          data: { object: Record<string, unknown> };
        };
        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          await fulfillByStripeSession(
            event.data.object as {
              id?: string;
              metadata?: Record<string, string> | null;
              payment_intent?: string | { id: string } | null;
              subscription?: string | { id: string } | null;
              customer?: string | { id: string } | null;
            },
          );
        }
        return new Response(JSON.stringify({ received: true }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
