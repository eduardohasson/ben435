import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import type { RiskLevel } from "@/lib/analysis/types";
import { getEntitlement, listAnalyses, type Entitlement } from "@/lib/fns/account";

export const Route = createFileRoute("/app/")({ component: Dashboard });

function Dashboard() {
  const [ent, setEnt] = useState<Entitlement | null>(null);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof listAnalyses>>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([getEntitlement(), listAnalyses()])
      .then(([e, list]) => {
        setEnt(e);
        setRows(list);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Falha ao carregar o painel");
      });
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Painel</h1>
      <p className="mt-2 text-sm text-mist">
        Relatórios da sua conta. Cada um é leitura de risco — não parecer jurídico.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-mist">Créditos</p>
          <p className="mt-1 font-display text-3xl text-gold">
            {ent?.hasActiveSubscription ? "Ilimitado" : (ent?.credits ?? "—")}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-mist">Plano</p>
          <p className="mt-1 text-lg">{ent?.planId ?? "Nenhum"}</p>
        </div>
        <div className="rounded-lg border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-mist">Termos</p>
          <p className="mt-1 text-lg">{ent?.acceptedTerms ? "Aceitos" : "Pendentes"}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/app/analisar">Nova análise</Link>
        </Button>
        {!ent?.canAnalyze ? (
          <Button asChild variant="outline">
            <Link to="/checkout" search={{ plan: "avulsa", currency: "brl" }}>
              Comprar crédito
            </Link>
          </Button>
        ) : null}
      </div>

      {error ? <p className="mt-6 text-sm text-danger">{error}</p> : null}

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-[0.12em] text-mist">
        Relatórios
      </h2>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-mist">Nenhuma análise ainda.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-card">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                to="/app/relatorio/$id"
                params={{ id: row.id }}
                className="flex flex-col gap-1 px-4 py-4 hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{row.title}</p>
                  <p className="text-xs text-mist">
                    {row.contract_kind} · {new Date(row.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {row.overall_risk ? (
                    <RiskBadge risk={row.overall_risk as RiskLevel} />
                  ) : (
                    <span className="text-xs text-mist">{row.status}</span>
                  )}
                  {row.score != null ? (
                    <span className="font-mono text-xs text-gold">{row.score}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
