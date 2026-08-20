import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { completeDemoOrder } from "@/lib/fns/account";

export const Route = createFileRoute("/obrigado")({
  validateSearch: (raw: Record<string, unknown>) => ({
    order: typeof raw.order === "string" ? raw.order : "",
    demo: raw.demo === "1" || raw.demo === true,
  }),
  component: Obrigado,
});

function Obrigado() {
  const { order, demo } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !order) return;
    if (!demo && !order) return;
    void completeDemoOrder({ data: order })
      .then(() => {
        setState("ok");
        setMessage("Crédito liberado. Você já pode enviar um contrato.");
      })
      .catch((err: unknown) => {
        setState("err");
        setMessage(err instanceof Error ? err.message : "Não foi possível confirmar o pedido.");
      });
  }, [user, order, demo]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-navy text-paper">
        <LegalBanner />
        <SiteHeader />
        <p className="px-4 py-20 text-center text-mist">Confirmando pagamento…</p>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">Pedido</p>
        <h1 className="mt-3 font-display text-4xl tracking-wide">
          {state === "err" ? "Há um pendência" : "Obrigado"}
        </h1>
        <p className="mt-4 text-mist">
          {state === "idle"
            ? "Estamos liberando o acesso à análise."
            : message || "Pagamento registrado."}
        </p>
        {demo ? (
          <p className="mt-3 text-xs text-mist">
            Ambiente de demonstração — nenhum cartão foi cobrado. No Railway, com a chave Stripe,
            esta etapa vira cobrança real em USD ou BRL.
          </p>
        ) : null}
        <Button asChild className="mt-8">
          <Link to="/app/analisar">Enviar contrato</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
}
