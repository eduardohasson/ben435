export type Currency = "usd" | "brl";
export type PlanId = "avulsa" | "mensal";

export type PlanPrice = {
  amount: number;
  currency: Currency;
  formatted: string;
};

export type Plan = {
  id: PlanId;
  name: string;
  blurb: string;
  features: string[];
  recommended?: boolean;
  mode: "payment" | "subscription";
  credits: number | "unlimited";
  prices: Record<Currency, PlanPrice>;
};

function money(amount: number, currency: Currency): PlanPrice {
  const formatted =
    currency === "usd"
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(amount / 100)
      : new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          maximumFractionDigits: 0,
        }).format(amount / 100);
  return { amount, currency, formatted };
}

export const PLANS: Record<PlanId, Plan> = {
  avulsa: {
    id: "avulsa",
    name: "Análise avulsa",
    blurb: "Um contrato, um relatório de risco. Ideal antes de assinar.",
    features: [
      "1 análise de risco contratual",
      "Cláusulas sinalizadas por gravidade",
      "Pontos de atenção para o clube",
      "Relatório permanente na sua conta",
    ],
    mode: "payment",
    credits: 1,
    prices: {
      usd: money(3500, "usd"),
      brl: money(18900, "brl"),
    },
  },
  mensal: {
    id: "mensal",
    name: "Acesso mensal",
    blurb: "Análises ilimitadas enquanto a assinatura estiver ativa.",
    features: [
      "Análises ilimitadas no período",
      "Histórico e comparativo de contratos",
      "Alertas de cláusulas recorrentes",
      "Suporte prioritário por e-mail",
    ],
    recommended: true,
    mode: "subscription",
    credits: "unlimited",
    prices: {
      usd: money(11900, "usd"),
      brl: money(64900, "brl"),
    },
  },
};

export const PLAN_IDS = Object.keys(PLANS) as PlanId[];

export function isPlanId(value: string): value is PlanId {
  return value === "avulsa" || value === "mensal";
}

export function isCurrency(value: string): value is Currency {
  return value === "usd" || value === "brl";
}
