import { usePresentation } from "@/store/presentation";
import { useUI } from "@/store/ui";
import { cn } from "@/lib/utils";

export function PresentationToggle() {
  const { active, toggle } = usePresentation();
  const lifted = useUI((s) => s.bottomBar);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      className={cn(
        "fixed bottom-4 left-4 z-40 inline-flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-[13px] font-normal tracking-[0.02em] shadow-soft transition-[background-color,color,border-color,opacity,transform,visibility] duration-300 ease-atelier sm:bottom-6 sm:left-6",
        // En mobile, mientras se ve la barra fija del configurador, el botón se aparta.
        lifted ? "max-lg:invisible max-lg:translate-y-3 max-lg:opacity-0" : "",
        active
          ? "border-malva-oscuro bg-malva-oscuro text-papel hover:bg-malva-profundo"
          : "border-linea bg-papel/95 text-tinta backdrop-blur hover:border-tinta/40",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-2 w-2 rounded-full transition-colors duration-300", active ? "bg-oro" : "bg-gris/60")}
      />
      Modo presentación
    </button>
  );
}
