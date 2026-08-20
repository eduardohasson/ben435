import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { analyzeHeuristic } from "@/lib/analysis/heuristic";
import type { AnalysisResult, RiskLevel } from "@/lib/analysis/types";
import { getSql } from "@/lib/db";
import { newId } from "@/lib/ids";

const DISCLAIMER =
  "Este relatório é uma leitura operacional de risco. Não é parecer jurídico, não substitui advogado e não deve ser usado como peça ou opinião legal.";

function periodActive(iso: string | null, status: string | null): boolean {
  if (status !== "active" && status !== "trialing") return false;
  if (!iso) return false;
  return new Date(iso).getTime() > Date.now();
}

function parseAiResult(raw: string): AnalysisResult | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1)) as Partial<AnalysisResult>;
    if (!parsed.summary || !Array.isArray(parsed.clauses)) return null;
    const risk = (parsed.overallRisk ?? "moderado") as RiskLevel;
    return {
      summary: String(parsed.summary),
      overallRisk: risk,
      score: Math.max(0, Math.min(100, Number(parsed.score ?? 40))),
      contractKind: String(parsed.contractKind ?? "Instrumento contratual"),
      partiesHint: String(parsed.partiesHint ?? ""),
      clauses: parsed.clauses.map((c) => ({
        title: String(c.title ?? "Ponto de atenção"),
        excerpt: String(c.excerpt ?? ""),
        category: String(c.category ?? "Geral"),
        risk: (c.risk ?? "moderado") as RiskLevel,
        why: String(c.why ?? ""),
        watch: String(c.watch ?? ""),
      })),
      financialNotes: Array.isArray(parsed.financialNotes)
        ? parsed.financialNotes.map(String)
        : [],
      negotiationNotes: Array.isArray(parsed.negotiationNotes)
        ? parsed.negotiationNotes.map(String)
        : [],
      missingChecks: Array.isArray(parsed.missingChecks)
        ? parsed.missingChecks.map(String)
        : [],
      method: "ai",
      disclaimer: DISCLAIMER,
    };
  } catch {
    return null;
  }
}

async function runAiAnalysis(contractText: string): Promise<AnalysisResult | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Você é um analista operacional de risco contratual para clubes de futebol brasileiros.
NÃO é advogado. NÃO emita parecer jurídico. NÃO diga o que é legal ou ilegal.
Apenas identifique indicadores de risco de gestão (financeiro, devolução, multa, recall, direitos econômicos, imagem, saúde, prazo).

Responda SOMENTE um JSON válido com este formato:
{
  "summary": "string curta",
  "overallRisk": "baixo|moderado|alto|critico",
  "score": 0-100,
  "contractKind": "string",
  "partiesHint": "string",
  "clauses": [{"title":"","excerpt":"","category":"","risk":"baixo|moderado|alto|critico","why":"por que é risco operacional","watch":"o que o clube deve checar internamente"}],
  "financialNotes": ["..."],
  "negotiationNotes": ["..."],
  "missingChecks": ["..."]
}

Texto do contrato:
"""${contractText.slice(0, 18000)}"""`;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.2,
      max_tokens: 1800,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  return parseAiResult(text);
}

export const submitAnalysis = createServerFn({ method: "POST" })
  .validator((input: { title: string; contractText: string }) => {
    const title = input.title.trim().slice(0, 160);
    const contractText = input.contractText.trim();
    if (contractText.length < 80) {
      throw new Error("Cole pelo menos um trecho substancial do contrato.");
    }
    if (contractText.length > 40000) {
      throw new Error("Texto acima do limite (40.000 caracteres).");
    }
    return { title: title || "Contrato sem título", contractText };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const [ent] = await sql<{
      credits: number;
      subscription_status: string | null;
      current_period_end: string | null;
    }>`
      select credits, subscription_status, current_period_end
      from entitlements where user_id = ${context.userId}
    `;
    const unlimited = periodActive(
      ent?.current_period_end ?? null,
      ent?.subscription_status ?? null,
    );
    const credits = ent?.credits ?? 0;
    if (!unlimited && credits < 1) {
      throw new Error("Sem crédito disponível. Contrate uma análise ou o acesso mensal.");
    }

    const id = newId("an");
    await sql`
      insert into analyses (id, user_id, title, contract_text, status)
      values (${id}, ${context.userId}, ${data.title}, ${data.contractText}, ${"running"})
    `;

    let result: AnalysisResult;
    try {
      result = (await runAiAnalysis(data.contractText)) ?? analyzeHeuristic(data.contractText);
    } catch {
      result = analyzeHeuristic(data.contractText);
    }

    if (!unlimited) {
      await sql`
        update entitlements
        set credits = credits - 1, updated_at = now()
        where user_id = ${context.userId} and credits > 0
      `;
    }

    await sql`
      update analyses
      set status = ${"done"},
          overall_risk = ${result.overallRisk},
          score = ${result.score},
          contract_kind = ${result.contractKind},
          result_json = ${JSON.stringify(result)},
          completed_at = now()
      where id = ${id} and user_id = ${context.userId}
    `;

    return { id };
  });
