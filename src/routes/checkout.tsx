import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { acceptTerms, getEntitlement, startCheckout } from "@/lib/fns/account";
import { TERMS_VERSION } from "@/lib/brand";
import { isCurrency, isPlanId, PLANS, type Currency, type PlanId } from "@/lib/plans";

type Search = {
  plan: PlanId;
  currency: Currency;
  canceled?: boolean;
};

export const Route = createFileRoute("/checkout")({
  validateSearch: (raw: Record<string, unknown>): Search => ({
    plan: isPlanId(String(raw.plan ?? "")) ? (raw.plan as PlanId) : "avulsa",
    currency: isCurrency(String(raw.currency ?? "")) ? (raw.currency as Currency) : "brl",
    canceled: raw.canceled === "1" || raw.canceled === true,
  }),
  component: Checkout,
});

function Checkout() {
  const { plan: planId, currency, canceled } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyAccepted, setAlreadyAccepted] = useState(false);

  const plan = PLANS[planId];
  const price = plan.prices[currency];

  useEffect(() => {
    if (!user) return;
    void getEntitlement()
      .then((e) => {
        setAlreadyAccepted(e.acceptedTerms);
        if (e.acceptedTerms) setAccepted(true);
      })
      .catch(() => undefined);
  }, [user]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-navy">
        <LegalBanner />
        <SiteHeader />
        <div className="mx-auto max-w-lg px-4 py-20 text-mist">Carregando…</div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function pay() {
    setError(null);
    if (!accepted) {
      setError("É obrigatório aceitar os Termos de Uso para concluir a compra.");
      return;
    }
    setBusy(true);
    try {
      await acceptTerms({ data: { source: "checkout" } });
      const session = await startCheckout({ data: { planId, currency } });
      if (session.demo) {
        await navigate({
          to: "/obrigado",
          search: { order: session.orderId, demo: true },
        });
        return;
      }
      window.location.href = session.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível iniciar o pagamento.");
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-14">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">Checkout</p>
        <h1 className="mt-2 font-display text-4xl tracking-wide">{plan.name}</h1>
        <p className="mt-2 text-mist">{plan.blurb}</p>
        <p className="mt-6 font-display text-5xl text-gold">
          {price.formatted}
          <span className="ml-2 font-sans text-base font-normal text-mist">
            {plan.id === "mensal" ? "/ mês" : " pagamento único"}
          </span>
        </p>

        {canceled ? (
          <p className="mt-4 rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            Pagamento cancelado. Você pode tentar de novo.
          </p>
        ) : null}

        <div className="mt-8 rounded-lg border border-line bg-card p-5 text-sm leading-relaxed text-mist">
          Este produto é análise operacional de risco contratual. Não cria relação
          advogado-cliente e não substitui parecer jurídico.
        </div>

        <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-gold"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>
            Li e aceito os{" "}
            <Link to="/termos" className="text-gold underline-offset-2 hover:underline">
              Termos de Uso
            </Link>{" "}
            (versão {TERMS_VERSION}). Entendo que a Ben435{" "}
            <strong className="font-semibold text-paper">não é serviço de advogado</strong> e que o
            relatório não é parecer jurídico.
            {alreadyAccepted ? (
              <span className="mt-1 block text-xs text-ok">Aceite desta versão já registrado na conta.</span>
            ) : null}
          </span>
        </label>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <Button type="button" size="full" className="mt-8" disabled={busy || !accepted} onClick={() => void pay()}>
          {busy ? "Processando…" : `Pagar ${price.formatted} e liberar`}
        </Button>
        <p className="mt-3 text-center text-xs text-mist">
          Sem chave Stripe neste ambiente, o pagamento é simulado e o crédito é liberado na hora.
          Em produção, o Stripe cobra em {currency.toUpperCase()}.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
