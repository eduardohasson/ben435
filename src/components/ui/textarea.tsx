import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-48 w-full rounded-md border border-line bg-ink/50 px-3 py-3 text-sm leading-relaxed text-paper placeholder:text-mist/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
        className,
      )}
      {...props}
    />
  );
}
