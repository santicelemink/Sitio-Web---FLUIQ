import { FAQS } from "@/data/content";
import { SectionHeading } from "@/components/common/Section";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Faq() {
  return (
    <section id="preguntas" aria-labelledby="faq-titulo" className="py-20 sm:py-28">
      <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          align="left"
          id="faq-titulo"
          kicker="Preguntas frecuentes"
          title={
            <>
              Antes de <em>pedir</em>
            </>
          }
          lead="Si te queda alguna duda, escribinos por WhatsApp: respondemos en el día."
        />
        <Accordion type="single" collapsible className="border-t border-linea">
          {FAQS.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
