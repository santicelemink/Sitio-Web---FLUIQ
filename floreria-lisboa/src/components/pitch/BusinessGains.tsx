import { BUSINESS_GAINS } from "@/data/content";
import { usePresentation } from "@/store/presentation";

export function BusinessGains() {
  const active = usePresentation((s) => s.active);
  if (!active) return null;
  return (
    <section aria-labelledby="gana-titulo" className="animate-fade-in bg-lavanda py-20 sm:py-24">
      <div className="container">
        <header className="mx-auto max-w-[640px] text-center">
          <p className="kicker text-malva-profundo">Modo presentación</p>
          <h2 id="gana-titulo" className="section-title mt-4">
            Lo que <em>gana</em> el negocio
          </h2>
        </header>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {BUSINESS_GAINS.map((g) => (
            <article key={g.numeral} className="rounded-panel border border-linea bg-papel p-7 sm:p-8">
              <p className="font-serif text-[40px] italic leading-none text-malva">{g.numeral}.</p>
              <h3 className="mt-5 font-serif text-[26px] leading-tight">{g.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-gris-texto">{g.text}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-[640px] text-center font-serif text-[22px] italic leading-snug text-tinta">
          Siguiente paso propuesto: validar el prototipo con 5 a 10 clientes habituales antes de desarrollar el sitio final.
        </p>
      </div>
    </section>
  );
}
