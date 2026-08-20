import { Link } from "@tanstack/react-router";
import { APP_NAME, CONTACT_EMAIL } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-mist sm:flex-row sm:items-center sm:justify-between">
        <div className="font-display text-xl tracking-[0.14em] text-gold">{APP_NAME.toUpperCase()}</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link to="/termos" className="hover:text-gold">
            Termos de uso
          </Link>
          <Link to="/privacidade" className="hover:text-gold">
            Privacidade
          </Link>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-gold">
            {CONTACT_EMAIL}
          </a>
        </div>
        <p className="max-w-sm text-xs leading-relaxed">
          © {new Date().getFullYear()} {APP_NAME}. Análise de risco contratual — não é serviço jurídico.
        </p>
      </div>
    </footer>
  );
}
