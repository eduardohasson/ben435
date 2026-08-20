import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-navy px-6 text-center text-paper">
      <span className="text-gold" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Algo deu errado</h1>
      <p className="max-w-md text-sm break-words text-mist">
        {error.message || "Erro inesperado. Recarregue a página."}
      </p>
    </main>
  );
}
