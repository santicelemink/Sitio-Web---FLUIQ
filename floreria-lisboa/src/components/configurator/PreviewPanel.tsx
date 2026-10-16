import { Bookmark, BookmarkCheck, Link2, RotateCcw, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { BouquetPreview, paletteBackground } from "@/components/bouquet/BouquetPreview";
import { PALETTE_BY_ID, RIBBON_BY_ID, SIZE_BY_ID, WRAP_BY_ID } from "@/data/catalog";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { configsEqual, describeBouquet, encodeConfig, flowersPhrase } from "@/lib/bouquet";
import { capitalize, formatPrice } from "@/lib/format";
import { calculatePrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useConfigurator } from "@/store/configurator";

export function LiveBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full bg-papel/80 px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-tinta backdrop-blur", className)}>
      <span className="h-1.5 w-1.5 animate-live-dot rounded-full bg-[#7AA87A]" aria-hidden="true" />
      Vista previa
    </span>
  );
}

export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const animated = useAnimatedNumber(value);
  return (
    <span className={cn("tabular", className)}>
      <span aria-hidden="true">{formatPrice(animated)}</span>
      <span className="sr-only">{formatPrice(value)}</span>
    </span>
  );
}

/** Escenario cuadrado con fondo radial de la paleta y el ramo en vivo. */
export function PreviewStage({ className }: { className?: string }) {
  const config = useConfigurator((s) => s.config);
  const price = calculatePrice(config);
  return (
    <div
      className={cn("relative overflow-hidden rounded-[22px] border border-linea transition-[background] duration-500 ease-atelier", className)}
      style={{ background: paletteBackground(config.palette) }}
    >
      <LiveBadge className="absolute left-3 top-3 z-10 sm:left-4 sm:top-4" />
      <span className="absolute bottom-3 right-3 z-10 rounded-full bg-papel/85 px-3 py-1 font-serif text-[19px] text-tinta backdrop-blur lg:hidden">
        <AnimatedPrice value={price} />
      </span>
      <div className="absolute inset-0 p-3 sm:p-6">
        <BouquetPreview {...config} label={describeBouquet(config)} />
      </div>
    </div>
  );
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(area);
      return ok;
    } catch {
      return false;
    }
  }
}

export function PreviewDetails({ className }: { className?: string }) {
  const { config, savedDesign, surprise, reset, saveDesign } = useConfigurator();
  const price = calculatePrice(config);
  const isSaved = savedDesign ? configsEqual(savedDesign, config) : false;

  const actions = [
    {
      label: "Sorprendeme",
      icon: Shuffle,
      onClick: () => {
        surprise();
        toast("Te armamos una combinación. Cambiá lo que quieras.");
      },
    },
    {
      label: isSaved ? "Diseño guardado" : "Guardar diseño",
      icon: isSaved ? BookmarkCheck : Bookmark,
      onClick: () => {
        saveDesign();
        toast("Guardamos tu diseño en este dispositivo");
      },
    },
    {
      label: "Compartir",
      icon: Link2,
      onClick: async () => {
        const url = `${window.location.origin}/crear?diseno=${encodeConfig(config)}`;
        const ok = await copyToClipboard(url);
        if (ok) toast("Link copiado. Quien lo abra ve este mismo ramo.");
        else {
          window.history.replaceState(null, "", url.replace(window.location.origin, ""));
          toast("No pudimos copiarlo: el link quedó en la barra del navegador.");
        }
      },
    },
    {
      label: "Empezar de nuevo",
      icon: RotateCcw,
      onClick: () => {
        reset();
        toast("Empezamos de nuevo");
      },
    },
  ];

  return (
    <div className={className}>
      <dl className="space-y-1 text-[14px] leading-snug">
        <div className="flex gap-2">
          <dt className="sr-only">Tamaño y paleta</dt>
          <dd>
            {SIZE_BY_ID[config.size].label} · Paleta {PALETTE_BY_ID[config.palette].label.toLowerCase()}
          </dd>
        </div>
        <div>
          <dt className="sr-only">Flores</dt>
          <dd className="text-gris-texto">{capitalize(flowersPhrase(config))}</dd>
        </div>
        <div>
          <dt className="sr-only">Envoltorio y cinta</dt>
          <dd className="text-gris-texto">
            {WRAP_BY_ID[config.wrap].label} · cinta {RIBBON_BY_ID[config.ribbon].label.toLowerCase()}
          </dd>
        </div>
      </dl>
      <p className="mt-4 flex items-baseline gap-3">
        <span className="text-[12px] uppercase tracking-[0.16em] text-gris-texto">Total</span>
        <AnimatedPrice value={price} className="font-serif text-[40px] leading-none" />
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="inline-flex min-h-[40px] items-center justify-center gap-1.5 whitespace-nowrap rounded-full border border-linea bg-papel px-2.5 py-2 text-[12.5px] text-tinta sm:gap-2 sm:px-4 sm:text-[13px] transition-[border-color,background-color] duration-300 ease-atelier hover:border-tinta/50 active:scale-[0.98]"
          >
            <Icon className="h-4 w-4 text-malva-oscuro" strokeWidth={1.5} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
