import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { getEntitlement, type Entitlement } from "@/lib/fns/account";
import { TERMS_VERSION } from "@/lib/brand";

export const Route = createFileRoute("/app/conta")({ component: Conta });

function Conta() {
  const user = useCurrentUser();
  const [ent, setEnt] = useState<Entitlement | null>(null);

  useEffect(() => {
    void getEntitlement().then(setEnt).catch(() => setEnt(null));
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wide">Conta</h1>
      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-mist">Nome</dt>
          <dd>{user?.displayName ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-mist">E-mail</dt>
          <dd>{user?.primaryEmail ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-mist">Créditos</dt>
          <dd>{ent?.hasActiveSubscription ? "Ilimitado no ciclo" : (ent?.credits ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-mist">Termos {TERMS_VERSION}</dt>
          <dd>{ent?.acceptedTerms ? "Aceitos" : "Pendentes na próxima compra"}</dd>
        </div>
      </dl>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/checkout" search={{ plan: "avulsa", currency: "brl" }}>
            Comprar análise avulsa
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/checkout" search={{ plan: "mensal", currency: "brl" }}>
            Assinar mensal
          </Link>
        </Button>
      </div>
    </div>
  );
}
