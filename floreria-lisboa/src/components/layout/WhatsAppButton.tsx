import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/data/catalog";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export function WhatsAppButton() {
  const lifted = useUI((s) => s.bottomBar);
  return (
    <a
      href={whatsappLink("Hola, quería hacer una consulta sobre un ramo.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Consultanos por WhatsApp (se abre en una pestaña nueva)"
      className={cn(
        "fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-malva bg-papel px-4 py-2.5 text-[13px] tracking-[0.02em] text-malva-oscuro shadow-soft transition-[background-color,color,opacity,transform,visibility] duration-300 ease-atelier hover:bg-malva-oscuro hover:text-papel sm:bottom-6 sm:right-6",
        lifted ? "max-lg:invisible max-lg:translate-y-3 max-lg:opacity-0" : "",
      )}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
      Consultanos
    </a>
  );
}
