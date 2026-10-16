import { useMemo, useState } from "react";
import type { OccasionId } from "@/types";
import { OCCASIONS } from "@/data/catalog";
import { PRODUCTS } from "@/data/products";
import { Chip } from "@/components/ui/choice";
import { SectionHeading } from "@/components/common/Section";
import { ProductCard } from "@/components/common/ProductCard";
import { PitchNote } from "@/components/pitch/PitchNote";
import { useProductActions } from "@/hooks/useProductActions";

export function Collection({ asPage = false }: { asPage?: boolean }) {
  const [filter, setFilter] = useState<OccasionId | "todas">("todas");
  const { customize, add } = useProductActions();
  const visible = useMemo(
    () => (filter === "todas" ? PRODUCTS : PRODUCTS.filter((p) => p.occasions.includes(filter))),
    [filter],
  );
  const counts = useMemo(
    () => Object.fromEntries(OCCASIONS.map((o) => [o.id, PRODUCTS.filter((p) => p.occasions.includes(o.id)).length])),
    [],
  );

  return (
    <section
      id="coleccion"
      aria-labelledby="coleccion-titulo"
      className={asPage ? "pb-20 pt-10 sm:pt-14" : "border-y border-linea bg-papel py-20 sm:py-28"}
    >
      <div className="container">
        <SectionHeading
          as={asPage ? "h1" : "h2"}
          id="coleccion-titulo"
          kicker="Colección de estación"
          title={
            <>
              Diseños <em>de la casa</em>
            </>
          }
          lead="Pedilos tal cual o usalos como punto de partida y cambiá lo que quieras."
        />
        <PitchNote n={5} className="mx-auto mt-10 max-w-[620px]" />

        <div role="group" aria-label="Filtrar por ocasión" className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          <Chip selected={filter === "todas"} onClick={() => setFilter("todas")} className="shrink-0">
            Todas
          </Chip>
          {OCCASIONS.map((o) => (
            <Chip
              key={o.id}
              selected={filter === o.id}
              disabled={counts[o.id] === 0}
              onClick={() => setFilter(o.id)}
              className="shrink-0"
            >
              {o.label}
            </Chip>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          {visible.length} {visible.length === 1 ? "diseño" : "diseños"}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
          {visible.map((p) => (
            <div key={p.slug} className="animate-fade-in">
              <ProductCard headingLevel={asPage ? "h2" : "h3"} product={p} onCustomize={() => customize(p)} onAdd={() => add(p)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
