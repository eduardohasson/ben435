import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileSearch, Scale, ShieldAlert } from "lucide-react";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { PLANS, type Currency } from "@/lib/plans";
import { useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [currency, setCurrency] = useState<Currency>("brl");

  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% 20%, rgb(201 168 76 / 0.12), transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pb-24 sm:pt-24">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-gold">
            Análise de risco contratual para clubes
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-display leading-[0.92] tracking-[0.02em]">
            Enxergue o risco do contrato
            <span className="text-gold"> antes de assinar</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-mist">
            A Ben435 lê contratos de atletas, empréstimos e direitos de imagem e
            marca cláusulas que historicamente geram prejuízo. É uma ferramenta
            de gestão — não um parecer de advogado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/checkout" search={{ plan: "avulsa", currency }}>
                Analisar um contrato
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#caso">Ver caso real 2022</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 pb-20 sm:grid-cols-4">
        {[
          ["700+", "Clubes profissionais no Brasil"],
          ["USD + BRL", "Cobrança nas duas moedas"],
          ["2022", "Validação real em campo"],
          ["0", "Parecer jurídico emitido"],
        ].map(([n, l]) => (
          <div key={l} className="rounded-lg border border-line bg-card px-4 py-5 text-center">
            <div className="font-display text-3xl tracking-wide text-gold">{n}</div>
            <div className="mt-1 text-xs text-mist">{l}</div>
          </div>
        ))}
      </section>

      <section id="problema" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-title tracking-[0.04em]">O risco está no texto</h2>
        <p className="mt-2 max-w-xl text-mist">
          A maior parte do prejuízo de um clube menor não começa no gramado. Começa numa cláusula que ninguém isolou.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldAlert,
              t: "Cláusula oculta",
              d: "Devolução em “perfeitas condições”, multa por partida e recall sem carência passam na leitura corrida.",
            },
            {
              icon: FileSearch,
              t: "Leitura manual falha",
              d: "Dirigente e departamento de futebol revisam o PDF à noite. O padrão se perde entre um contrato e outro.",
            },
            {
              icon: Scale,
              t: "Assimetria de mesa",
              d: "Clubes menores aceitam 20–30% de direitos econômicos como se fosse padrão. Falta repertório, não vontade.",
            },
          ].map((item) => (
            <article key={item.t} className="rounded-lg border border-line bg-card p-6">
              <item.icon className="size-5 text-gold" />
              <h3 className="mt-4 text-base font-semibold">{item.t}</h3>
              <p className="mt-2 text-sm text-mist">{item.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como" className="bg-navy-2">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="font-display text-title tracking-[0.04em]">Como a Ben435 trabalha</h2>
          <p className="mt-2 max-w-xl text-mist">
            Três passos. Sem tribunal, sem petição, sem substituição do jurídico do clube.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["01", "Envie o contrato", "Cole o texto do instrumento — atleta, empréstimo ou imagem. A conta autenticada guarda o relatório."],
              ["02", "Leitura de risco", "A plataforma marca cláusulas financeiras, devolução, recall, direitos econômicos e lacunas recorrentes."],
              ["03", "Relatório operacional", "Você recebe gravidade, trechos e o que o clube deve checar internamente — para decidir com o próprio advogado."],
            ].map(([n, t, d]) => (
              <article key={n} className="rounded-lg border border-line bg-navy p-6">
                <div className="font-mono text-xs tracking-[0.14em] text-gold">{n}</div>
                <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-mist">{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="preco" className="mx-auto max-w-6xl px-4 py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-title tracking-[0.04em]">Preço transparente</h2>
            <p className="mt-2 max-w-xl text-mist">
              Pague em real ou dólar. A compra só avança depois do aceite dos Termos.
            </p>
          </div>
          <div className="inline-flex rounded-sm border border-line p-1">
            {(["brl", "usd"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={
                  currency === c
                    ? "rounded-sm bg-gold px-4 py-2 text-xs font-semibold text-navy"
                    : "px-4 py-2 text-xs font-semibold text-mist"
                }
              >
                {c === "brl" ? "BRL" : "USD"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {(Object.values(PLANS) as (typeof PLANS)[keyof typeof PLANS][]).map((plan) => (
            <article
              key={plan.id}
              className={
                plan.recommended
                  ? "relative rounded-xl border border-gold bg-card p-7"
                  : "rounded-xl border border-line bg-card p-7"
              }
            >
              {plan.recommended ? (
                <span className="absolute -top-3 right-6 rounded-sm bg-gold px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-navy">
                  Recomendado
                </span>
              ) : null}
              <p className="text-sm text-mist">{plan.name}</p>
              <p className="mt-2 font-display text-5xl text-gold">
                {plan.prices[currency].formatted}
                <span className="ml-2 font-sans text-base font-normal text-mist">
                  {plan.id === "mensal" ? "/ mês" : "/ contrato"}
                </span>
              </p>
              <p className="mt-3 text-sm text-mist">{plan.blurb}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-gold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild size="full" variant={plan.recommended ? "gold" : "outline"} className="mt-8">
                <Link to="/checkout" search={{ plan: plan.id, currency }}>
                  Contratar {plan.name.toLowerCase()}
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section id="caso" className="mx-auto max-w-6xl px-4 pb-20">
        <h2 className="font-display text-title tracking-[0.04em]">Caso real — 2022</h2>
        <p className="mt-2 max-w-xl text-mist">
          Usada na gestão de um clube profissional. Os achados abaixo são de risco operacional, não de juízo legal.
        </p>
        <div className="mt-8 rounded-lg border-l-4 border-gold bg-card p-6 sm:p-8">
          <h3 className="text-gold">O que foi identificado e tratado internamente</h3>
          <ul className="mt-5 grid gap-3 text-sm text-mist sm:grid-cols-2">
            {[
              "22 contratos de atletas lidos na temporada",
              "Devolução em “perfeitas condições” sem ressalva do estado físico admissional",
              "Multa de R$ 800.000 por partida vista antes da competição",
              "Uso do plano de saúde para lesões anteriores ao contrato",
              "Controle de gastos em clube com orçamento anual abaixo de R$ 100.000",
              "Atleta com problema físico preexistente detectado antes da assinatura",
            ].map((item) => (
              <li key={item} className="pl-4" style={{ textIndent: 0 }}>
                <span className="mr-2 text-gold">▸</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-navy-2">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h2 className="font-display text-title tracking-[0.04em]">Pronto para ler o risco?</h2>
          <p className="mx-auto mt-3 max-w-lg text-mist">
            Construída por quem viveu a gestão de clube. Cada compra exige o aceite dos Termos, para deixar claro o limite do serviço.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/checkout" search={{ plan: "avulsa", currency }}>
                Começar análise
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/termos">Ler os Termos</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
