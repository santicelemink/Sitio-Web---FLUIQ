import { usePresentation } from "@/store/presentation";

export function PresentationBanner() {
  const active = usePresentation((s) => s.active);
  if (!active) return null;
  return (
    <section aria-label="Modo presentación" className="animate-fade-in bg-tinta text-marfil">
      <div className="container py-7 sm:py-8">
        <p className="font-sans text-kicker uppercase text-oro">Modo presentación</p>
        <h2 className="mt-3 max-w-[760px] font-serif text-[28px] leading-tight sm:text-[34px]">
          Propuesta de tienda online para <em className="italic text-oro">Florería Lisboa</em>
        </h2>
        <p className="mt-3 max-w-[720px] text-[15px] leading-relaxed text-marfil/80">
          Cada recuadro punteado explica la técnica de UX aplicada y qué le aporta al negocio. Desactivalo abajo a la
          izquierda para ver el sitio como lo vería un cliente.
        </p>
      </div>
    </section>
  );
}
