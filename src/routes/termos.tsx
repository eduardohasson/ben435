import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TERMS_SECTIONS, TERMS_VERSION } from "@/lib/terms";

export const Route = createFileRoute("/termos")({ component: Termos });

function Termos() {
  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-gold">
          Versão {TERMS_VERSION}
        </p>
        <h1 className="mt-3 font-display text-title tracking-[0.04em]">Termos de Uso</h1>
        <p className="mt-4 text-mist">
          A compra de qualquer análise ou assinatura só é concluída depois do aceite expresso
          deste documento. Leia com atenção — o objetivo é afastar qualquer interpretação de
          que a Ben435 presta serviço de advogado.
        </p>
        <div className="mt-10 space-y-10">
          {TERMS_SECTIONS.map((s) => (
            <section key={s.id} id={s.id}>
              <h2 className="text-lg font-semibold text-gold">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-sm leading-relaxed text-paper/90">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <p className="mt-12 text-sm text-mist">
          Também leia a{" "}
          <Link to="/privacidade" className="text-gold underline-offset-2 hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
