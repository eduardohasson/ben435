import type { AnalysisResult, RiskClause, RiskLevel } from "./types";

type Pattern = {
  id: string;
  title: string;
  category: string;
  risk: RiskLevel;
  re: RegExp;
  why: string;
  watch: string;
};

const PATTERNS: Pattern[] = [
  {
    id: "perfeitas",
    title: "Devolução em perfeitas condições",
    category: "Empréstimo / devolução",
    risk: "critico",
    re: /perfeit[ao]s?\s+condi[cç][oõ]es|estado\s+de\s+conserva[cç][aã]o|sem\s+ressalva/i,
    why: "Cláusulas de devolução “em perfeitas condições” sem ressalva do estado físico admissional costumam transferir ao clube cessionário o custo de lesões anteriores.",
    watch: "Conferir se há laudo admissional anexo e se o texto exclui lesões preexistentes da obrigação de devolução.",
  },
  {
    id: "multa",
    title: "Multa ou cláusula penal elevada",
    category: "Financeiro",
    risk: "alto",
    re: /multa(?:\s+rescis[oó]ria)?|cl[aá]usula\s+penal|penalidade\s+de/i,
    why: "Multas desproporcionais (por partida, por rescisão ou por descumprimento) podem inviabilizar o elenco no meio da competição.",
    watch: "Isolar o valor, o gatilho e se a multa é recíproca. Confrontar com o orçamento do clube.",
  },
  {
    id: "recall",
    title: "Recall ou retorno imediato",
    category: "Empréstimo",
    risk: "alto",
    re: /recall|retorno\s+imediato|convoca[cç][aã]o\s+de\s+volta|a\s+qualquer\s+tempo/i,
    why: "Recall sem janela mínima deixa o clube sem atleta no meio do estadual ou da Série, sem tempo de reposição.",
    watch: "Exigir carência (ex.: após 90 dias) e janela de transferência como condição do retorno.",
  },
  {
    id: "economicos",
    title: "Cessão de direitos econômicos",
    category: "Direitos econômicos",
    risk: "alto",
    re: /direitos?\s+econ[oô]micos|percentual\s+de\s+\d+\s*%|economia\s+do\s+passe/i,
    why: "Percentuais de 20–30% são frequentemente aceitos como “padrão” sem comparação de mercado, diluindo o ativo do clube.",
    watch: "Registrar o percentual, o fato gerador (venda, empréstimo, renovação) e se há teto.",
  },
  {
    id: "imagem",
    title: "Direitos de imagem",
    category: "Imagem",
    risk: "moderado",
    re: /direitos?\s+de\s+imagem|uso\s+da\s+imagem|publicidade/i,
    why: "Imagem mal delimitada gera pagamento paralelo ao salário e conflito com patrocinadores master do clube.",
    watch: "Ver prazo, território, exclusividade e se o valor é fixo ou variável.",
  },
  {
    id: "saude",
    title: "Plano de saúde e lesão preexistente",
    category: "Saúde",
    risk: "alto",
    re: /plano\s+de\s+sa[uú]de|les[aã]o\s+preexistente|atestado\s+m[eé]dico|exame\s+admissional/i,
    why: "Uso do plano do clube para lesões anteriores e ausência de exame admissional são fontes clássicas de custo oculto.",
    watch: "Exigir exame prévio e exclusão expressa de patologias já existentes.",
  },
  {
    id: "renovacao",
    title: "Renovação automática",
    category: "Prazo",
    risk: "moderado",
    re: /renova[cç][aã]o\s+autom[aá]tica|prorroga[cç][aã]o\s+t[aá]cita|renova(?:r[aá])?\s+por\s+igual/i,
    why: "Renovação tácita prende o clube a um ciclo salarial sem nova análise de desempenho ou caixa.",
    watch: "Definir aviso prévio escrito e data-limite para recusa.",
  },
  {
    id: "exclusividade",
    title: "Exclusividade e restrição de elenco",
    category: "Obrigações",
    risk: "moderado",
    re: /exclusividade|n[aã]o\s+poder[aá]\s+contratar|vedado\s+ao\s+clube/i,
    why: "Restrições a novas contratações ou a uso do atleta em determinadas competições reduzem flexibilidade técnica.",
    watch: "Mapear o que fica proibido e por quanto tempo.",
  },
  {
    id: "luvas",
    title: "Luvas, bônus e variáveis",
    category: "Financeiro",
    risk: "moderado",
    re: /luvas|b[oô]nus|pr[eê]mio\s+por|gratifica[cç][aã]o/i,
    why: "Variáveis mal redigidas (gol, vitória, acesso) explodem a folha sem teto.",
    watch: "Listar cada variável, o teto anual e a fonte de pagamento.",
  },
  {
    id: "foro",
    title: "Foro, arbitragem e lei aplicável",
    category: "Processual",
    risk: "moderado",
    re: /foro\s+da\s+comarca|arbitragem|c[aâ]mara\s+de\s+arbitragem|lei\s+aplic[aá]vel/i,
    why: "Foro distante ou arbitragem cara encarece qualquer disputa. Não é juízo sobre validade — é custo de conflito.",
    watch: "Anotar sede, idioma e quem paga as custas iniciais.",
  },
  {
    id: "fifa",
    title: "Mecanismo de solidariedade / transferência",
    category: "FIFA / CBF",
    risk: "moderado",
    re: /mecanismo\s+de\s+solidariedade|solidarity|indeniza[cç][aã]o\s+de\s+forma[cç][aã]o|fifa/i,
    why: "Transferências internacionais e formação geram obrigações que o clube menor costuma descobrir depois do acerto.",
    watch: "Ver quem assume solidariedade, treinamento e taxas de intermediário.",
  },
  {
    id: "conduta",
    title: "Conduta, doping e imagem institucional",
    category: "Disciplinar",
    risk: "baixo",
    re: /doping|conduta\s+social|fair[\s-]?play|n[aã]o\s+prejudicar\s+a\s+imagem/i,
    why: "Cláusulas disciplinares amplas viram instrumento de rescisão unilateral se não tiverem procedimento.",
    watch: "Checar se há processo interno, defesa e gradação da sanção.",
  },
];

const DISCLAIMER =
  "Este relatório é uma leitura operacional de risco. Não é parecer jurídico, não substitui advogado e não deve ser usado como peça ou opinião legal.";

function excerptAround(text: string, match: RegExpMatchArray): string {
  const idx = match.index ?? 0;
  const start = Math.max(0, idx - 80);
  const end = Math.min(text.length, idx + (match[0]?.length ?? 0) + 80);
  const slice = text.slice(start, end).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${slice}${end < text.length ? "…" : ""}`;
}

function scoreFrom(clauses: RiskClause[]): { score: number; overall: RiskLevel } {
  const weight: Record<RiskLevel, number> = {
    baixo: 8,
    moderado: 16,
    alto: 28,
    critico: 40,
  };
  const raw = Math.min(
    100,
    clauses.reduce((sum, c) => sum + weight[c.risk], 0),
  );
  const score = clauses.length === 0 ? 12 : raw;
  const overall: RiskLevel =
    score >= 70 ? "critico" : score >= 48 ? "alto" : score >= 28 ? "moderado" : "baixo";
  return { score, overall };
}

export function analyzeHeuristic(contractText: string): AnalysisResult {
  const text = contractText.trim();
  const clauses: RiskClause[] = [];

  for (const pattern of PATTERNS) {
    const match = text.match(pattern.re);
    if (!match) continue;
    clauses.push({
      title: pattern.title,
      excerpt: excerptAround(text, match),
      category: pattern.category,
      risk: pattern.risk,
      why: pattern.why,
      watch: pattern.watch,
    });
  }

  const { score, overall } = scoreFrom(clauses);
  const kind = /empr[eé]stimo|cess[aã]o\s+tempor/i.test(text)
    ? "Empréstimo / cessão temporária"
    : /direitos?\s+de\s+imagem/i.test(text)
      ? "Direitos de imagem"
      : /profissional|atleta|jogador/i.test(text)
        ? "Contrato de atleta"
        : "Instrumento contratual";

  return {
    summary:
      clauses.length === 0
        ? "Não foram encontrados os padrões mais comuns de risco da base Ben435. Isso não significa ausência de risco — apenas que o texto não acionou os marcadores conhecidos. Encaminhe o instrumento ao advogado do clube antes de qualquer assinatura."
        : `A leitura operacional encontrou ${clauses.length} ponto(s) de atenção. O recorte prioriza cláusulas que, em clubes brasileiros, já geraram custo, perda de atleta ou assimetria de negociação. Trate cada item como hipótese de risco a ser validada internamente — não como conclusão jurídica.`,
    overallRisk: overall,
    score,
    contractKind: kind,
    partiesHint: /clube|associa[cç][aã]o|futebol/i.test(text)
      ? "O texto menciona clube ou associação de futebol."
      : "Partes não identificadas com segurança pelo marcador automático.",
    clauses,
    financialNotes: clauses
      .filter((c) => c.category === "Financeiro" || c.category === "Direitos econômicos")
      .map((c) => c.title),
    negotiationNotes: [
      "Peça anexo de exame médico admissional datado.",
      "Confirme se multa e recall são recíprocos.",
      "Registre por escrito o percentual de direitos econômicos e o fato gerador.",
    ],
    missingChecks: [
      "Estado físico do atleta no ingresso (laudo).",
      "Teto de variáveis e fonte de pagamento.",
      "Prazo mínimo antes de eventual recall.",
      "Quem assume mecanismo de solidariedade e intermediários.",
    ],
    method: "heuristic",
    disclaimer: DISCLAIMER,
  };
}
