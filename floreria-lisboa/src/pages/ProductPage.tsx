import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { SizeId } from "@/types";
import { OCCASION_BY_ID, SIZES } from "@/data/catalog";
import { CARE_TIPS, SHIPPING_INFO } from "@/data/content";
import { PRODUCTS, PRODUCT_BY_SLUG } from "@/data/products";
import { BouquetPreview, paletteBackground } from "@/components/bouquet/BouquetPreview";
import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";
import { OptionCard } from "@/components/ui/choice";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AnimatedPrice, LiveBadge } from "@/components/configurator/PreviewPanel";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProductActions } from "@/hooks/useProductActions";
import { describeBouquet, summaryLines } from "@/lib/bouquet";
import { formatPrice } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";
import { NotFoundPage } from "./NotFoundPage";

export function ProductPage() {
  const { slug = "" } = useParams();
  const product = PRODUCT_BY_SLUG[slug];
  const location = useLocation();
  const [size, setSize] = useState<SizeId>(product?.config.size ?? "clasico");
  const { customize, add } = useProductActions();
  const [openItems, setOpenItems] = useState<string[]>(location.hash === "#cuidados" ? ["cuidados"] : []);
  useDocumentTitle(product?.name);

  useEffect(() => {
    if (product) setSize(product.config.size);
  }, [product]);

  useEffect(() => {
    if (location.hash === "#cuidados") setOpenItems((items) => (items.includes("cuidados") ? items : [...items, "cuidados"]));
  }, [location.hash]);

  const config = useMemo(() => (product ? { ...product.config, size } : null), [product, size]);
  if (!product || !config) return <NotFoundPage />;

  const price = calculatePrice(config);
  const lines = summaryLines(config);
  const others = PRODUCTS.filter((p) => p.slug !== product.slug).slice(0, 3);

  return (
    <>
      <section className="container pb-16 pt-6 sm:pt-10">
        <Link to="/coleccion" className="inline-flex items-center gap-1 rounded-sm text-[13px] uppercase tracking-[0.14em] text-tinta hover:text-malva-oscuro">
          <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          Colección
        </Link>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-panel border border-linea" style={{ background: paletteBackground(config.palette) }}>
              <LiveBadge className="absolute left-4 top-4 z-10" />
              {product.tag && (
                <span className="absolute right-4 top-4 z-10 rounded-full bg-papel/90 px-3 py-1.5 text-[12px] text-tinta">{product.tag}</span>
              )}
              <div className="absolute inset-0 p-[7%]">
                <BouquetPreview {...config} label={describeBouquet(config)} />
              </div>
            </div>
          </div>

          <div>
            <p className="kicker">{product.occasions.map((o) => OCCASION_BY_ID[o].label).join(" · ")}</p>
            <h1 className="mt-4 font-serif text-[clamp(44px,6vw,64px)] leading-none">{product.name}</h1>
            <p className="mt-4 font-serif text-[22px] italic leading-snug text-malva-oscuro">{product.description}</p>
            <p className="mt-5 text-[16px] leading-relaxed text-gris-texto">{product.story}</p>
            <AnimatedPrice value={price} className="mt-6 block font-serif text-[40px] leading-none" />

            <fieldset className="mt-8">
              <legend className="text-[12px] uppercase tracking-[0.16em] text-tinta">Tamaño</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {SIZES.map((s) => (
                  <OptionCard key={s.id} selected={size === s.id} onClick={() => setSize(s.id)} className="pr-10">
                    <span className="block font-serif text-[20px] leading-tight">{s.label}</span>
                    <span className="mt-0.5 block text-[13px] text-gris-texto">{s.stems} tallos</span>
                    <span className="tabular mt-2 block text-[14px]">{formatPrice(calculatePrice({ ...product.config, size: s.id }))}</span>
                  </OptionCard>
                ))}
              </div>
            </fieldset>

            <dl className="mt-6 space-y-1 rounded-option border border-linea bg-papel p-4 text-[14px]">
              <div><dt className="sr-only">Composición</dt><dd>{lines.main}</dd></div>
              <div><dt className="sr-only">Envoltorio</dt><dd className="text-gris-texto">{lines.wrap}</dd></div>
            </dl>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="sm:flex-1" onClick={() => add(product, config)}>
                Agregar al pedido · {formatPrice(price)}
              </Button>
              <Button variant="secondary" className="sm:flex-1" onClick={() => customize(product, config)}>
                Personalizar este diseño
              </Button>
            </div>
            <p className="mt-3 text-[13px] text-gris-texto">La tarjeta con tu mensaje la escribís al personalizar o en el pedido por WhatsApp.</p>

            <h2 className="sr-only">Cuidados y envíos</h2>
            <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="mt-10 border-t border-linea">
              <AccordionItem value="cuidados" id="cuidados">
                <AccordionTrigger size="md">Cuidados</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5">
                    {CARE_TIPS.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="envios">
                <AccordionTrigger size="md">Envíos</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc space-y-2 pl-5">
                    {SHIPPING_INFO.map((t) => <li key={t}>{t}</li>)}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="estacion">
                <AccordionTrigger size="md">Flores de estación</AccordionTrigger>
                <AccordionContent>
                  Respetamos paleta, flores, tamaño y envoltorio. Si alguna variedad no llega fresca del mercado, la
                  reemplazamos por otra equivalente y te lo contamos en la foto antes de salir.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

      <section aria-labelledby="otros-titulo" className="border-t border-linea bg-papel py-16 sm:py-20">
        <div className="container">
          <h2 id="otros-titulo" className="font-serif text-[34px] leading-tight sm:text-[40px]">
            También te puede <em>gustar</em>
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-7">
            {others.map((p, i) => (
              <div key={p.slug} className={i === 2 ? "hidden lg:block" : undefined}>
                <ProductCard product={p} onCustomize={() => customize(p)} onAdd={() => add(p)} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
