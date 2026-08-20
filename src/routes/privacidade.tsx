import { createFileRoute } from "@tanstack/react-router";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CONTACT_EMAIL } from "@/lib/brand";

export const Route = createFileRoute("/privacidade")({ component: Privacidade });

function Privacidade() {
  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-display text-title tracking-[0.04em]">Política de Privacidade</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-paper/90">
          <p>
            Tratamos dados para operar a conta, processar pagamentos (Stripe), registrar o aceite
            dos Termos e gerar o relatório de risco solicitado. Base legal principal: execução de
            contrato e legítimo interesse operacional.
          </p>
          <p>
            Dados típicos: e-mail, nome, clube informado, texto do contrato enviado, IP e
            user-agent no aceite, identificadores de pagamento. Não vendemos dados.
          </p>
          <p>
            Pagamentos em USD e BRL são processados pelo Stripe. O banco de dados de produção
            pode ser um Postgres gerenciado (Supabase). O servidor de aplicação pode rodar em
            Railway. Cada um trata dados conforme seus respectivos termos.
          </p>
          <p>
            Você pode pedir acesso, correção ou exclusão da conta pelo e-mail {CONTACT_EMAIL}.
            Relatórios e aceites podem ser conservados pelo prazo necessário à defesa de direitos
            e obrigações legais.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
