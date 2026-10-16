import { REVIEWS } from "@/data/content";
import { SectionHeading, Stars } from "@/components/common/Section";
import { PitchNote } from "@/components/pitch/PitchNote";

export function Reviews() {
  return (
    <section aria-labelledby="resenas-titulo" className="border-t border-linea bg-papel py-20 sm:py-28">
      <div className="container">
        <SectionHeading
          id="resenas-titulo"
          kicker="Lo que dicen"
          title={
            <>
              Ramos que <em>llegan como se ven</em>
            </>
          }
        />
        <PitchNote n={7} className="mx-auto mt-10 max-w-[620px]" />
        <div className="mx-auto mt-12 grid max-w-[560px] gap-5 lg:max-w-none lg:grid-cols-3 lg:gap-7">
          {REVIEWS.map((r) => (
            <figure key={r.author} className="flex flex-col rounded-card border border-linea bg-marfil p-7">
              <div className="flex items-center justify-between gap-3">
                <Stars />
                <span className="sr-only">5 de 5 estrellas</span>
                <span className="text-[13px] text-gris-texto">[Reseña de ejemplo]</span>
              </div>
              <blockquote className="mt-5 flex-1 font-serif text-[21px] italic leading-snug text-tinta">“{r.quote}”</blockquote>
              <figcaption className="mt-6 text-[12px] uppercase tracking-[0.2em] text-malva-oscuro">{r.author}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
