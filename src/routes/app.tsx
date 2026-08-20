import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LegalBanner } from "@/components/legal-banner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/app")({
  component: AppShell,
});

function AppShell() {
  const { user, isPending } = useCurrentUserState();

  if (isPending) {
    return (
      <div className="min-h-screen bg-navy text-paper">
        <LegalBanner />
        <SiteHeader variant="app" />
        <div className="mx-auto max-w-5xl px-4 py-16 text-mist">Abrindo sua conta…</div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <div className="min-h-screen bg-navy text-paper">
      <LegalBanner />
      <SiteHeader variant="app" />
      <div className="mx-auto flex max-w-5xl gap-8 px-4 py-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="sticky top-24 space-y-2 text-sm">
            <Link
              to="/app"
              className="block rounded-sm px-3 py-2 text-mist hover:bg-white/5 hover:text-paper"
              activeOptions={{ exact: true }}
              activeProps={{ className: "block rounded-sm bg-white/5 px-3 py-2 text-gold" }}
            >
              Painel
            </Link>
            <Link
              to="/app/analisar"
              className="block rounded-sm px-3 py-2 text-mist hover:bg-white/5 hover:text-paper"
              activeProps={{ className: "block rounded-sm bg-white/5 px-3 py-2 text-gold" }}
            >
              Nova análise
            </Link>
            <Link
              to="/app/conta"
              className="block rounded-sm px-3 py-2 text-mist hover:bg-white/5 hover:text-paper"
              activeProps={{ className: "block rounded-sm bg-white/5 px-3 py-2 text-gold" }}
            >
              Conta e créditos
            </Link>
          </nav>
        </aside>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
