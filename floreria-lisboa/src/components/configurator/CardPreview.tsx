import type { CardDesignId, FontId } from "@/types";
import { cn } from "@/lib/utils";

export function CardPreview({
  design,
  font,
  message,
  anonymous,
  className,
}: {
  design: CardDesignId;
  font: FontId;
  message: string;
  anonymous: boolean;
  className?: string;
}) {
  const hasMessage = message.trim().length > 0;
  return (
    <figure
      aria-label="Vista previa de la tarjeta"
      className={cn(
        "relative mx-auto flex aspect-[10/7] w-full max-w-[420px] flex-col items-center justify-center overflow-hidden rounded-[14px] border border-linea px-8 py-7 text-center shadow-soft transition-[background] duration-300 ease-atelier",
        design === "acuarela" ? "bg-papel" : "bg-papel",
        className,
      )}
      style={
        design === "acuarela"
          ? {
              background:
                "radial-gradient(60% 70% at 15% 20%, rgb(243 223 224 / 0.95), transparent 70%), radial-gradient(55% 65% at 85% 30%, rgb(233 228 242 / 0.95), transparent 70%), radial-gradient(70% 60% at 50% 100%, rgb(227 234 223 / 0.95), transparent 70%), #FFFFFF",
            }
          : undefined
      }
    >
      {design === "clasica" && <span aria-hidden="true" className="pointer-events-none absolute inset-[10px] rounded-[8px] border border-malva/45" />}
      {design === "minima" && <span aria-hidden="true" className="absolute left-1/2 top-6 h-px w-8 -translate-x-1/2 bg-tinta/25" />}
      <blockquote
        className={cn(
          "relative max-w-full break-words text-pretty",
          font === "manuscrita" ? "font-script text-[26px] leading-[1.35] sm:text-[30px]" : "font-serif text-[21px] italic leading-snug sm:text-[24px]",
          hasMessage ? "text-tinta" : "font-serif text-[18px] not-italic text-gris",
        )}
      >
        {hasMessage ? message : "Tu mensaje va a aparecer acá."}
      </blockquote>
      <figcaption className="relative mt-4 font-sans text-[11px] uppercase tracking-[0.28em] text-malva-oscuro">
        {anonymous ? "Sin firma" : "Con tu nombre"}
      </figcaption>
    </figure>
  );
}
