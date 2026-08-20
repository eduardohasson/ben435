import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-line px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.12em] text-gold",
        className,
      )}
      {...props}
    />
  );
}
