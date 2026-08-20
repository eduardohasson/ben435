import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { signOut } from "@/lib/auth/client";
import { APP_NAME } from "@/lib/brand";
import { Button } from "@/components/ui/button";

export function SiteHeader({ variant = "marketing" }: { variant?: "marketing" | "app" }) {
  const { user, isPending } = useCurrentUserState();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-navy/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-display text-2xl tracking-[0.14em] text-gold">
          {APP_NAME.toUpperCase()}
        </Link>

        {variant === "marketing" ? (
          <nav className="hidden items-center gap-7 text-sm text-mist md:flex">
            <a href="/#como" className="hover:text-gold">
              Como funciona
            </a>
            <a href="/#preco" className="hover:text-gold">
              Preço
            </a>
            <a href="/#caso" className="hover:text-gold">
              Caso 2022
            </a>
            <Link to="/termos" className="hover:text-gold">
              Termos
            </Link>
          </nav>
        ) : (
          <nav className="hidden items-center gap-7 text-sm text-mist md:flex">
            <Link to="/app" className="hover:text-gold">
              Painel
            </Link>
            <Link to="/app/analisar" className="hover:text-gold">
              Nova análise
            </Link>
            <Link to="/app/conta" className="hover:text-gold">
              Conta
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-sm bg-white/10" />
          ) : user ? (
            <>
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link to="/app">Painel</Link>
              </Button>
              <button
                type="button"
                onClick={() => void signOut("/")}
                className="hidden text-xs text-mist hover:text-paper sm:inline"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/login">Entrar</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/checkout" search={{ plan: "avulsa", currency: "brl" }}>
                  Começar
                </Link>
              </Button>
            </>
          )}
          <button
            type="button"
            className="grid size-11 place-items-center text-paper md:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-paper">
            {variant === "marketing" ? (
              <>
                <a href="/#como" onClick={() => setOpen(false)}>
                  Como funciona
                </a>
                <a href="/#preco" onClick={() => setOpen(false)}>
                  Preço
                </a>
                <a href="/#caso" onClick={() => setOpen(false)}>
                  Caso 2022
                </a>
              </>
            ) : (
              <>
                <Link to="/app" onClick={() => setOpen(false)}>
                  Painel
                </Link>
                <Link to="/app/analisar" onClick={() => setOpen(false)}>
                  Nova análise
                </Link>
              </>
            )}
            <Link to="/termos" onClick={() => setOpen(false)}>
              Termos
            </Link>
            {user ? (
              <button type="button" className="text-left text-mist" onClick={() => void signOut("/")}>
                Sair
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
