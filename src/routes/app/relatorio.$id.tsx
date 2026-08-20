import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RiskBadge } from "@/components/risk-badge";
import type { AnalysisResult } from "@/lib/analysis/types";
import { getAnalysis } from "@/lib/fns/account";

export const Route = createFileRoute("/app/relatorio/$id")({ component: Relatorio });

function Relatorio() {
  const { id } = Route.useParams();
  const [row, setRow] = useState<Awaited<ReturnType<typeof getAnalysis>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getAnalysis({ data: id })
      .then(setRow)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Não foi possível abrir o relatório");
      });
  }, [id]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!row) return <p className="text-sm text-mist">Carregando relatório…</p>;

  const result: AnalysisResult | null = row.result_json
    ? (JSON.parse(row.result_json) as AnalysisResult)
    : null;

  return (
    <article>
      <p className="text-xs text-mist">
        <Link to="/app" className="hover:text-gold">
          Painel
        </Link>{" "}
        / Relatório
      </p>
      <h1 className="mt-2 font-display text-4xl tracking-wide">{row.title}</h1>
      <p className="mt-2 text-sm text-mist">
        {row.contract_kind} · {new Date(row.created_at).toLocaleString("pt-BR")}
        {result ? ` · método ${result.method === "ai" ? "modelo" : "marcadores"}` : null}
      </p>

      {result ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-line bg-card p-5">
            <RiskBadge risk={result.overallRisk} />
            <div>
              <p className="font-mono text-2xl text-gold">{result.score}</p>
              <p className="text-xs text-mist">Índice operacional (0–100)</p>
            </div>
            <p className="basis-full text-sm leading-relaxed sm:basis-auto sm:flex-1">
              {result.summary}
            </p>
          </div>

          <div className="mt-4 rounded-sm border border-gold/30 bg-gold/5 px-4 py-3 text-xs leading-relaxed text-mist">
            {result.disclaimer}
          </div>

          <h2 className="mt-10 font-display text-2xl tracking-wide">Cláusulas sinalizadas</h2>
          {result.clauses.length === 0 ? (
            <p className="mt-3 text-sm text-mist">Nenhum marcador clássico acionado neste texto.</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {result.clauses.map((c) => (
                <li key={c.title} className="rounded-lg border border-line bg-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">{c.title}</h3>
                    <RiskBadge risk={c.risk} />
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-mist">{c.category}</p>
                  {c.excerpt ? (
                    <blockquote className="mt-3 border-l-2 border-gold/50 pl-3 text-sm italic text-paper/85">
                      {c.excerpt}
                    </blockquote>
                  ) : null}
                  <p className="mt-3 text-sm">{c.why}</p>
                  <p className="mt-2 text-sm text-mist">
                    <span className="text-gold">Checar no clube:</span> {c.watch}
                  </p>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <NoteList title="Notas financeiras" items={result.financialNotes} />
            <NoteList title="Pontos de mesa" items={result.negotiationNotes} />
            <NoteList title="O que costuma faltar" items={result.missingChecks} />
          </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-mist">Este relatório ainda não tem resultado estruturado.</p>
      )}
    </article>
  );
}

function NoteList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg border border-line bg-card p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-mist">—</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-xs text-mist">
          {items.map((item) => (
            <li key={item}>▸ {item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
