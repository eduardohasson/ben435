import { Link } from "@tanstack/react-router";
import { LEGAL_ONE_LINER } from "@/lib/brand";

export function LegalBanner() {
  return (
    <div className="border-b border-line bg-ink/80 px-4 py-2 text-center text-xs leading-relaxed text-mist">
      {LEGAL_ONE_LINER}{" "}
      <Link to="/termos" className="text-gold underline-offset-2 hover:underline">
        Termos
      </Link>
    </div>
  );
}
