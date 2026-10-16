import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/common/Section";
import { PitchNotes } from "@/components/pitch/PitchNote";
import { decodeConfig } from "@/lib/bouquet";
import { formatPrice } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";
import { prefersReducedMotion, scrollToId, stripSearchParam } from "@/lib/utils";
import { STEP_COUNT, useConfigurator } from "@/store/configurator";
import { useUI } from "@/store/ui";
import { AnimatedPrice, PreviewDetails, PreviewStage } from "./PreviewPanel";
import { STEP_BODIES } from "./StepBodies";
import { StepProgress } from "./StepProgress";
import { STEPS } from "./steps";
import { useAddConfigToCart } from "./useAddConfigToCart";

/** Carga un diseño compartido por URL (?diseno=...) y limpia el parámetro. */
function useSharedDesign(scrollOnLoad: boolean) {
  const [params] = useSearchParams();
  const loadConfig = useConfigurator((s) => s.loadConfig);
  const encoded = params.get("diseno");
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!encoded || handled.current === encoded) return;
    handled.current = encoded;
    const config = decodeConfig(encoded);
    stripSearchParam("diseno");
    if (!config) {
      toast("No pudimos abrir ese diseño. Empezá uno nuevo desde acá.");
      return;
    }
    loadConfig(config, { step: 0 });
    toast("Cargamos el diseño que te compartieron");
    if (scrollOnLoad) window.setTimeout(() => scrollToId("crear"), 150);
  }, [encoded]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function Configurator({ variant = "section" }: { variant?: "section" | "page" }) {
  const step = useConfigurator((s) => s.step);
  const config = useConfigurator((s) => s.config);
  const { setStep, next, prev } = useConfigurator();
  const addToCart = useAddConfigToCart();
  const setBottomBar = useUI((s) => s.setBottomBar);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const price = calculatePrice(config);
  const Body = STEP_BODIES[step];
  const isLast = step === STEP_COUNT - 1;

  useSharedDesign(variant === "section");

  // Al cambiar de paso, si el inicio del panel quedó fuera de vista, lo traemos.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const panel = panelRef.current;
    if (!panel) return;
    const margin = parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
    if (panel.getBoundingClientRect().top < margin - 4) {
      panel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }, [step]);

  // En mobile la navegación queda fija abajo: avisamos para que los botones flotantes se corran.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setBottomBar(entry.isIntersecting), { threshold: 0 });
    observer.observe(panel);
    return () => {
      observer.disconnect();
      setBottomBar(false);
    };
  }, [setBottomBar]);

  const titleId = variant === "page" ? "crear-titulo" : "crear-titulo-home";
  const StepTitle = variant === "page" ? "h2" : "h3";

  return (
    <section
      id="crear"
      aria-labelledby={titleId}
      className={variant === "page" ? "pb-16 pt-10 sm:pt-14" : "py-20 sm:py-28"}
    >
      <div className="container">
        <SectionHeading
          as={variant === "page" ? "h1" : "h2"}
          id={titleId}
          kicker="Atelier online"
          title={
            <>
              Creá tu ramo, <em>a tu manera</em>
            </>
          }
          lead="Seis decisiones simples. La vista previa cambia con cada elección."
        />
        <PitchNotes ns={[3, 4]} className="mx-auto mt-10 max-w-[1040px]" />

        <div className="mt-10 grid items-start gap-5 [grid-template-areas:'stage'_'steps'_'details'] sm:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-10 lg:[grid-template-areas:'aside_steps']">
          {/* Columna de vista previa: sticky en desktop; en mobile el escenario queda fijo arriba */}
          <div className="contents lg:sticky lg:top-24 lg:block lg:rounded-panel lg:border lg:border-linea lg:bg-papel lg:p-6 lg:[grid-area:aside] xl:p-7">
            <div className="sticky top-[var(--header-h)] z-20 -mx-4 bg-marfil px-4 pb-2 pt-2 [grid-area:stage] sm:-mx-6 sm:px-6 lg:static lg:m-0 lg:bg-transparent lg:p-0">
              <PreviewStage className="mx-auto h-[clamp(200px,32svh,280px)] w-full lg:aspect-square lg:h-auto lg:w-[min(100%,max(340px,calc(100svh-350px)))]" />
            </div>
            <PreviewDetails className="rounded-panel border border-linea bg-papel p-5 [grid-area:details] lg:mt-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0" />
          </div>

          {/* Panel de pasos */}
          <div
            ref={panelRef}
            className="relative scroll-mt-[calc(var(--header-h)+clamp(200px,32svh,280px)+24px)] [grid-area:steps] lg:scroll-mt-28 lg:rounded-panel lg:border lg:border-linea lg:bg-papel lg:p-8 xl:p-10"
          >
            <StepProgress step={step} onSelect={setStep} />
            <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <StepTitle className="font-serif text-[30px] leading-tight sm:text-[34px]" aria-live="polite">
                {STEPS[step].title}
              </StepTitle>
              <p className="text-[11px] uppercase tracking-[0.28em] text-malva-oscuro">
                Paso {step + 1} de {STEP_COUNT}
              </p>
            </div>
            <p className="mt-2 text-[15px] text-gris-texto">{STEPS[step].help}</p>

            <div key={step} className="mt-6 animate-step-in">
              <Body />
            </div>

            {/* Navegación: fija abajo en mobile, al pie del panel en desktop */}
            <div className="sticky bottom-0 z-20 -mx-4 mt-8 border-t border-linea bg-marfil/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:mt-10 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-6 lg:backdrop-blur-none">
              <div className="flex items-center gap-3">
                <div className="mr-auto lg:hidden">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gris-texto">Total</p>
                  <AnimatedPrice value={price} className="font-serif text-[24px] leading-none" />
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={prev}
                  disabled={step === 0}
                  className="px-4 lg:px-5"
                  aria-label="Volver al paso anterior"
                >
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  <span className="hidden sm:inline">Volver</span>
                </Button>
                {isLast ? (
                  <Button onClick={addToCart} className="px-5 lg:ml-auto lg:px-[26px]">
                    <span className="lg:hidden">Agregar al pedido</span>
                    <span className="hidden lg:inline">Agregar al pedido · {formatPrice(price)}</span>
                  </Button>
                ) : (
                  <Button onClick={next} className="px-6 lg:ml-auto">
                    Siguiente
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
