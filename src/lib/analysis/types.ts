export type RiskLevel = "baixo" | "moderado" | "alto" | "critico";

export type RiskClause = {
  title: string;
  excerpt: string;
  category: string;
  risk: RiskLevel;
  why: string;
  watch: string;
};

export type AnalysisResult = {
  summary: string;
  overallRisk: RiskLevel;
  score: number;
  contractKind: string;
  partiesHint: string;
  clauses: RiskClause[];
  financialNotes: string[];
  negotiationNotes: string[];
  missingChecks: string[];
  method: "ai" | "heuristic";
  disclaimer: string;
};

export const RISK_ORDER: RiskLevel[] = ["baixo", "moderado", "alto", "critico"];

export const RISK_LABEL: Record<RiskLevel, string> = {
  baixo: "Baixo",
  moderado: "Moderado",
  alto: "Alto",
  critico: "Crítico",
};
