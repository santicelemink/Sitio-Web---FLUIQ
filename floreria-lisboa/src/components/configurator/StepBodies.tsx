import { useId, useState } from "react";
import { Baby, Cake, CalendarHeart, Feather, HandHeart, Heart, Sun, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import type { OccasionId } from "@/types";
import {
  CARD_DESIGNS,
  EXTRAS,
  FLOWERS,
  FONTS,
  MAX_FLOWERS,
  MESSAGE_MAX,
  OCCASIONS,
  OCCASION_BY_ID,
  PALETTES,
  PALETTE_BY_ID,
  RIBBONS,
  RIBBON_BY_ID,
  SIZES,
  WRAPS,
} from "@/data/catalog";
import { Chip, OptionCard } from "@/components/ui/choice";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/input";
import { BouquetPreview } from "@/components/bouquet/BouquetPreview";
import { FlowerIcon } from "@/components/bouquet/flowers";
import { useConfigurator } from "@/store/configurator";
import { calculatePrice } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CardPreview } from "./CardPreview";

const OCCASION_ICONS: Record<OccasionId, LucideIcon> = {
  cumpleanos: Cake,
  amor: Heart,
  aniversario: CalendarHeart,
  nacimiento: Baby,
  agradecimiento: HandHeart,
  condolencias: Feather,
  "porque-si": Sun,
};

const surchargeLabel = (value: number, included = "Incluido") => (value ? `+${formatPrice(value)}` : included);

function Swatches({ colors, size = 20 }: { colors: readonly string[]; size?: number }) {
  return (
    <span className="flex" aria-hidden="true">
      {colors.map((c, i) => (
        <span
          key={i}
          className="rounded-full border border-papel shadow-[0_0_0_1px_rgb(47_42_44/0.08)]"
          style={{ background: c, width: size, height: size, marginLeft: i ? -size * 0.3 : 0 }}
        />
      ))}
    </span>
  );
}

function SubHeading({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h4 id={id} className="text-[12px] uppercase tracking-[0.16em] text-tinta">
      {children}
    </h4>
  );
}

export function StepOccasion() {
  const occasion = useConfigurator((s) => s.config.occasion);
  const setOccasion = useConfigurator((s) => s.setOccasion);
  return (
    <div role="group" aria-label="Ocasión" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {OCCASIONS.map((o) => {
        const Icon = OCCASION_ICONS[o.id];
        const palette = PALETTE_BY_ID[o.palette];
        return (
          <OptionCard
            key={o.id}
            selected={occasion === o.id}
            onClick={() => {
              setOccasion(o.id);
              toast(`Te sugerimos la paleta ${palette.label}`);
            }}
            className="flex min-h-[118px] flex-col justify-between gap-4"
          >
            <Icon className="h-5 w-5 text-malva-oscuro" strokeWidth={1.5} aria-hidden="true" />
            <span>
              <span className="block font-serif text-[20px] leading-tight">{o.label}</span>
              <span className="mt-1.5 flex items-center gap-2 text-[13px] text-gris-texto">
                <Swatches colors={palette.colors} size={12} />
                {palette.label}
              </span>
            </span>
          </OptionCard>
        );
      })}
    </div>
  );
}

export function StepPalette() {
  const { palette, occasion } = useConfigurator((s) => s.config);
  const update = useConfigurator((s) => s.update);
  const suggested = OCCASION_BY_ID[occasion].palette;
  return (
    <div role="group" aria-label="Paleta" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {PALETTES.map((p) => (
        <OptionCard key={p.id} selected={palette === p.id} onClick={() => update({ palette: p.id })} className="flex min-h-[124px] flex-col justify-between gap-4">
          <Swatches colors={p.colors} size={30} />
          <span>
            <span className="block font-serif text-[21px] leading-tight">{p.label}</span>
            {suggested === p.id && <span className="mt-1 block text-[13px] text-malva-oscuro">Sugerida para tu ocasión</span>}
          </span>
        </OptionCard>
      ))}
    </div>
  );
}

export function StepFlowers() {
  const { flowers, palette } = useConfigurator((s) => s.config);
  const toggleFlower = useConfigurator((s) => s.toggleFlower);
  const [notice, setNotice] = useState<string | null>(null);
  const colors = PALETTE_BY_ID[palette].colors;
  const noticeId = useId();
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[14px] text-gris-texto">
          <span className="tabular text-tinta">{flowers.length}</span> de {MAX_FLOWERS} variedades elegidas
        </p>
        <p id={noticeId} aria-live="polite" className="min-h-[20px] text-[13px] text-error">
          {notice}
        </p>
      </div>
      <div role="group" aria-label="Flores" aria-describedby={noticeId} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FLOWERS.map((f) => {
          const selected = flowers.includes(f.id);
          const atMax = !selected && flowers.length >= MAX_FLOWERS;
          return (
            <OptionCard
              key={f.id}
              selected={selected}
              onClick={() => {
                const result = toggleFlower(f.id);
                if (result === "max") setNotice("Podés combinar hasta tres variedades. Quitá una para sumar otra.");
                else if (result === "min") setNotice("Elegí al menos una variedad.");
                else setNotice(null);
              }}
              className={cn("flex flex-col gap-3 pt-4", atMax && "opacity-70")}
            >
              <span className="flex items-start justify-between">
                <FlowerIcon flower={f.id} colors={colors} className="h-14 w-14" />
              </span>
              <span>
                <span className="block font-serif text-[20px] leading-tight">{f.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-gris-texto">{f.description}</span>
                <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[13px]">
                  <span className="tabular text-tinta">{surchargeLabel(f.surcharge, "+$0")}</span>
                  {f.badge && <span className="rounded-full bg-manteca px-2 py-0.5 text-[12px] text-tinta">{f.badge}</span>}
                </span>
              </span>
            </OptionCard>
          );
        })}
      </div>
    </div>
  );
}

export function StepSize() {
  const config = useConfigurator((s) => s.config);
  const update = useConfigurator((s) => s.update);
  return (
    <div role="group" aria-label="Tamaño" className="flex flex-col gap-3">
      {SIZES.map((s) => {
        const price = calculatePrice({ ...config, size: s.id });
        return (
          <OptionCard
            key={s.id}
            selected={config.size === s.id}
            onClick={() => update({ size: s.id })}
            className="flex items-center gap-4 py-3 pr-12 sm:gap-5"
          >
            <span className="h-[72px] w-[60px] shrink-0">
              <BouquetPreview {...config} size={s.id} decorative />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-serif text-[23px] leading-tight">{s.label}</span>
                {s.badge && <span className="rounded-full bg-rubor px-2.5 py-0.5 text-[12px] text-tinta">{s.badge}</span>}
              </span>
              <span className="mt-0.5 block text-[13px] text-gris-texto">{s.detail}</span>
            </span>
            <span className="tabular shrink-0 font-serif text-[21px]">{formatPrice(price)}</span>
          </OptionCard>
        );
      })}
    </div>
  );
}

export function StepWrap() {
  const { wrap, ribbon } = useConfigurator((s) => s.config);
  const update = useConfigurator((s) => s.update);
  const wrapHeading = useId();
  const ribbonHeading = useId();
  return (
    <div className="space-y-7">
      <div>
        <SubHeading id={wrapHeading}>Papel o caja</SubHeading>
        <div role="group" aria-labelledby={wrapHeading} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {WRAPS.map((w) => (
            <OptionCard key={w.id} selected={wrap === w.id} onClick={() => update({ wrap: w.id })} className="flex flex-col gap-3 p-3 pb-4">
              <span
                aria-hidden="true"
                className={cn("block h-12 w-full border border-tinta/[0.06]", w.kind === "box" ? "rounded-[12px_12px_40%_40%/12px_12px_30%_30%]" : "rounded-[10px]")}
                style={{ background: `linear-gradient(135deg, ${w.color}, ${w.color} 60%, rgb(255 255 255 / 0.6))` }}
              />
              <span className="px-1">
                <span className="block font-serif text-[19px] leading-tight">{w.label}</span>
                <span className="tabular mt-0.5 block text-[13px] text-gris-texto">{surchargeLabel(w.surcharge, "Incluido")}</span>
              </span>
            </OptionCard>
          ))}
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <SubHeading id={ribbonHeading}>Cinta</SubHeading>
          <p className="text-[14px] text-gris-texto" aria-live="polite">
            {RIBBON_BY_ID[ribbon].label}
          </p>
        </div>
        <div role="group" aria-labelledby={ribbonHeading} className="mt-3 flex flex-wrap gap-3">
          {RIBBONS.map((r) => {
            const selected = ribbon === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={selected}
                aria-label={`Cinta ${r.label}`}
                title={r.label}
                onClick={() => update({ ribbon: r.id })}
                className={cn(
                  "h-11 w-11 rounded-full border border-tinta/10 transition-[box-shadow,transform] duration-300 ease-atelier hover:scale-105",
                  selected ? "shadow-[0_0_0_3px_rgb(var(--marfil)),0_0_0_4.5px_rgb(var(--malva))]" : "",
                )}
                style={{ background: r.color }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function StepCard() {
  const { cardDesign, font, message, anonymous, extras, occasion } = useConfigurator((s) => s.config);
  const update = useConfigurator((s) => s.update);
  const toggleExtra = useConfigurator((s) => s.toggleExtra);
  const ids = useId();
  const suggestions = OCCASION_BY_ID[occasion].messages;
  return (
    <div className="space-y-7">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <SubHeading id={`${ids}-diseno`}>Diseño de tarjeta</SubHeading>
          <div role="group" aria-labelledby={`${ids}-diseno`} className="mt-3 flex flex-wrap gap-2">
            {CARD_DESIGNS.map((c) => (
              <Chip key={c.id} selected={cardDesign === c.id} onClick={() => update({ cardDesign: c.id })}>
                {c.label}
                <span className={cn("text-[12px]", cardDesign === c.id ? "text-marfil/80" : "text-gris-texto")}>
                  {c.surcharge ? `+${formatPrice(c.surcharge)}` : "Incluida"}
                </span>
              </Chip>
            ))}
          </div>
        </div>
        <div>
          <SubHeading id={`${ids}-letra`}>Letra</SubHeading>
          <div role="group" aria-labelledby={`${ids}-letra`} className="mt-3 flex flex-wrap gap-2">
            {FONTS.map((f) => (
              <Chip key={f.id} selected={font === f.id} onClick={() => update({ font: f.id })}>
                <span className={f.id === "manuscrita" ? "font-script text-[19px] leading-none" : "font-serif text-[17px] leading-none"}>
                  {f.label}
                </span>
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor={`${ids}-mensaje`} className="text-[12px] uppercase tracking-[0.16em] text-tinta">
            Mensaje
          </label>
          <span className="tabular text-[13px] text-gris-texto" aria-live="polite">
            {message.length}/{MESSAGE_MAX}
          </span>
        </div>
        <Textarea
          id={`${ids}-mensaje`}
          className="mt-3"
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => update({ message: e.target.value.slice(0, MESSAGE_MAX) })}
          placeholder="Escribí lo que quieras decir. Nosotros lo pasamos a mano."
          aria-describedby={`${ids}-sugerencias`}
        />
        <div id={`${ids}-sugerencias`} className="mt-3 flex flex-wrap gap-2" aria-label="Mensajes sugeridos" role="group">
          {suggestions.map((s) => (
            <Chip key={s} selected={message === s} onClick={() => update({ message: s })} className="h-auto min-h-[36px] whitespace-normal py-1.5 text-left text-[13px] leading-snug">
              {s}
            </Chip>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 rounded-option border border-linea bg-marfil px-4 py-3">
          <label htmlFor={`${ids}-firma`} className="text-[15px]">
            Enviar sin firma
            <span className="block text-[13px] text-gris-texto">La tarjeta llega sin tu nombre.</span>
          </label>
          <Switch id={`${ids}-firma`} checked={anonymous} onCheckedChange={(checked) => update({ anonymous: checked })} />
        </div>
      </div>

      <div>
        <SubHeading>Así se ve tu tarjeta</SubHeading>
        <CardPreview design={cardDesign} font={font} message={message} anonymous={anonymous} className="mt-3" />
      </div>

      <div>
        <SubHeading id={`${ids}-regalo`}>Completá el regalo</SubHeading>
        <div role="group" aria-labelledby={`${ids}-regalo`} className="mt-3 grid gap-3 sm:grid-cols-3">
          {EXTRAS.map((e) => (
            <OptionCard key={e.id} selected={extras.includes(e.id)} onClick={() => toggleExtra(e.id)} className="flex flex-col justify-between gap-3 pr-10">
              <span className="font-serif text-[18px] leading-snug">{e.label}</span>
              <span className="tabular text-[14px] text-tinta">+{formatPrice(e.price)}</span>
            </OptionCard>
          ))}
        </div>
      </div>
    </div>
  );
}

export const STEP_BODIES = [StepOccasion, StepPalette, StepFlowers, StepSize, StepWrap, StepCard];
