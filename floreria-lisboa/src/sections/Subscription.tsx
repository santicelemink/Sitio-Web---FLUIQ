import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PLANS } from "@/data/content";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/Section";
import { PitchNote } from "@/components/pitch/PitchNote";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createSubscription, type PlanId } from "@/services/subscriptions";
import { Reminders } from "./Reminders";

export function Subscription({ asPage = false }: { asPage?: boolean }) {
  const [loading, setLoading] = useState<PlanId | null>(null);
  const PlanHeading = asPage ? "h2" : "h3";

  const choose = async (id: PlanId, name: string) => {
    setLoading(id);
    try {
      await createSubscription(id);
      toast(`Anotamos tu plan ${name}. Te escribimos para coordinar la primera entrega.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="suscripcion" aria-labelledby="suscripcion-titulo" className={asPage ? "pb-20 pt-10 sm:pt-14" : "py-20 sm:py-28"}>
      <div className="container">
        <SectionHeading
          as={asPage ? "h1" : "h2"}
          id="suscripcion-titulo"
          kicker="Flores en casa"
          title={
            <>
              Una suscripción que <em>perfuma la semana</em>
            </>
          }
          lead="Un ramo de estación distinto en cada entrega. Pausás o cancelás cuando quieras."
        />
        <PitchNote n={6} className="mx-auto mt-10 max-w-[620px]" />

        <div className="mx-auto mt-12 grid max-w-[520px] gap-5 lg:max-w-[1080px] lg:grid-cols-3 lg:items-stretch lg:gap-7">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-panel border p-7 sm:p-8",
                plan.featured
                  ? "mt-3 border-malva bg-gradient-to-b from-lavanda to-papel shadow-soft lg:-my-3 lg:py-11"
                  : "border-linea bg-papel",
              )}
            >
              {plan.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-malva-oscuro px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] text-papel">
                  El más elegido
                </span>
              )}
              <PlanHeading className="font-serif text-[30px] leading-none">{plan.name}</PlanHeading>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                <span className="tabular font-serif text-[40px] leading-none">{formatPrice(plan.price)}</span>
                <span className="text-[14px] text-gris-texto">por entrega</span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 border-t border-linea pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] leading-snug">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-malva" strokeWidth={1.5} aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.featured ? "primary" : "secondary"}
                className="mt-8 w-full"
                disabled={loading !== null}
                onClick={() => choose(plan.id, plan.name)}
              >
                {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" /> : null}
                Elegir {plan.name.toLowerCase()}
              </Button>
            </article>
          ))}
        </div>

        <Reminders headingLevel={asPage ? "h2" : "h3"} />
      </div>
    </section>
  );
}
