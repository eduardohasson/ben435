import { RISK_LABEL, type RiskLevel } from "@/lib/analysis/types";
import { cn } from "@/lib/utils";

const TONE: Record<RiskLevel, string> = {
  baixo: "border-ok/40 bg-ok/10 text-ok",
  moderado: "border-warn/40 bg-warn/10 text-warn",
  alto: "border-gold/50 bg-gold/10 text-gold-2",
  critico: "border-danger/50 bg-danger/15 text-danger",
};

export function RiskBadge({
  risk,
  className,
}: {
  risk: RiskLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]",
        TONE[risk],
        className,
      )}
    >
      {RISK_LABEL[risk]}
    </span>
  );
}
