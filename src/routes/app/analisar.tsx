import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_TITLE } from "@/lib/analysis/sample-contract";
import { getEntitlement, type Entitlement } from "@/lib/fns/account";
import { submitAnalysis } from "@/lib/fns/analyze";

export const Route = createFileRoute("/app/analisar")({ component: Analisar });

function Analisar() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [ent, setEnt] = useState<Entitlement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getEntitlement()
      .then(setEnt)
      .catch(() => setEnt(null));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { id } = await submitAnalysis({ data: { title, contractText: text } });
      await navigate({ to: "/app/relatorio/$id", params: { id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao analisar");
      setBusy(false);
    }
  }

  const blocked = ent !== null && !ent.canAnalyze;

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Nova análise</h1>
      <p className="mt-2 max-w-2xl text-sm text-mist">
        Cole o texto do contrato. O resultado aponta indicadores de risco operacional. Não é
        parecer jurídico e não deve ser encaminhado como opinião de advogado.
      </p>

      {blocked ? (
        <div className="mt-6 rounded-lg border border-gold/40 bg-card p-5">
          <p className="text-sm">Sem crédito nesta conta.</p>
          <Button asChild className="mt-4">
            <Link to="/checkout" search={{ plan: "avulsa", currency: "brl" }}>
              Comprar análise
            </Link>
          </Button>
        </div>
      ) : null}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title">Título interno</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Empréstimo — atleta X — 2026"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="contract">Texto do contrato</Label>
            <button
              type="button"
              className="text-xs text-gold hover:underline"
              onClick={() => {
                setTitle(SAMPLE_CONTRACT_TITLE);
                setText(SAMPLE_CONTRACT);
              }}
            >
              Carregar exemplo fictício
            </button>
          </div>
          <Textarea
            id="contract"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Cole aqui o instrumento…"
          />
          <p className="text-xs text-mist">{text.length.toLocaleString("pt-BR")} caracteres</p>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy || blocked}>
          {busy ? "Lendo o contrato…" : "Gerar relatório de risco"}
        </Button>
      </form>
    </div>
  );
}
