import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Dirigente",
        });
        if (err) throw new Error(err.message);
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message);
      }
      await navigate({ to: "/app" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticação");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader />
      <main className="mx-auto grid max-w-md px-4 py-16">
        <h1 className="font-display text-4xl tracking-wide">Entrar na Ben435</h1>
        <p className="mt-2 text-sm text-mist">
          Conta para clubes e dirigentes. O aceite dos Termos acontece na hora da compra.
        </p>

        {authEnabled ? (
          <div className="mt-8 space-y-3">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="outline"
                size="full"
                onClick={() => void signIn(p.providerId, { callbackURL: "/app" })}
              >
                Continuar com {p.label}
              </Button>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-sm text-mist">Entrada desativada neste ambiente.</p>
        )}

        <div className="my-8 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-mist">
          <span className="h-px flex-1 bg-line" />
          e-mail
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={(e) => void onEmail(e)} className="space-y-4">
          {mode === "up" ? (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome ou clube"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" size="full" disabled={busy}>
            {busy ? "Aguarde…" : mode === "up" ? "Criar conta" : "Entrar"}
          </Button>
        </form>

        <button
          type="button"
          className="mt-4 text-sm text-mist hover:text-gold"
          onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}
        >
          {mode === "in" ? "Não tem conta? Criar agora" : "Já tem conta? Entrar"}
        </button>

        <p className="mt-8 text-xs text-mist">
          Ao criar conta você ainda não compra. A compra exige o aceite dos{" "}
          <Link to="/termos" className="text-gold underline-offset-2 hover:underline">
            Termos de Uso
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
