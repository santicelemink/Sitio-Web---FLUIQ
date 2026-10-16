import { lazy, Suspense, useEffect, useId, useState } from "react";
import { CalendarDays } from "lucide-react";
import { BARRIOS } from "@/data/catalog";
import { Chip } from "@/components/ui/choice";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNow } from "@/hooks/useNow";
import { slotsFor, useCart } from "@/store/cart";
import {
  baDateISO,
  formatShortDate,
  isBeforeCutoff,
  isoToLocalDate,
  localDateToISO,
} from "@/lib/time";
import { cn } from "@/lib/utils";

// El calendario solo se descarga cuando alguien elige "Otra fecha".
const Calendar = lazy(() =>
  import("@/components/ui/calendar").then((m) => ({ default: m.Calendar })),
);

export type DeliveryProblem = {
  field: "date" | "slot" | "barrio";
  message: string;
};

export function DeliveryPicker({
  problem,
  compact = false,
}: {
  problem?: DeliveryProblem | null;
  compact?: boolean;
}) {
  const barrioError = problem?.field === "barrio" ? problem.message : null;
  const delivery = useCart((s) => s.delivery);
  const setDelivery = useCart((s) => s.setDelivery);
  const normalize = useCart((s) => s.normalizeDelivery);
  const now = useNow(15000);
  const todayAvailable = isBeforeCutoff(now);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const ids = useId();
  const barrioId = `${ids}-barrio`;
  const cutoffNoteId = `${ids}-corte`;

  // Si pasa el corte con el carrito abierto, la entrega se corrige sola.
  useEffect(() => {
    normalize();
  }, [todayAvailable, normalize]);

  const slots = slotsFor(delivery.day);
  const tomorrowISO = baDateISO(1);
  const minDate = isoToLocalDate(tomorrowISO);
  const maxDate = isoToLocalDate(baDateISO(60));
  const headingClass = "text-[12px] uppercase tracking-[0.16em] text-tinta";

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      <fieldset>
        <legend className={headingClass}>Día de entrega</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {todayAvailable ? (
            <Chip
              selected={delivery.day === "hoy"}
              onClick={() => setDelivery({ day: "hoy", slot: null })}
            >
              Hoy
            </Chip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  tabIndex={0}
                  className="inline-flex rounded-full"
                  aria-describedby={cutoffNoteId}
                >
                  <Chip disabled aria-disabled="true" tabIndex={-1}>
                    Hoy
                  </Chip>
                </span>
              </TooltipTrigger>
              <TooltipContent>Pasó el corte de las 14 h</TooltipContent>
            </Tooltip>
          )}
          <Chip
            selected={delivery.day === "manana"}
            onClick={() => setDelivery({ day: "manana", date: null })}
          >
            Mañana
          </Chip>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Chip
                selected={delivery.day === "otra"}
                aria-haspopup="dialog"
                aria-expanded={calendarOpen}
                data-delivery-field="date"
              >
                <CalendarDays
                  className="h-4 w-4"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {delivery.day === "otra" && delivery.date
                  ? formatShortDate(delivery.date)
                  : "Otra fecha"}
              </Chip>
            </PopoverTrigger>
            <PopoverContent aria-label="Elegí la fecha de entrega">
              <Suspense
                fallback={
                  <div className="h-[340px] w-[296px]" aria-busy="true" />
                }
              >
                <Calendar
                  mode="single"
                  selected={
                    delivery.date ? isoToLocalDate(delivery.date) : undefined
                  }
                  defaultMonth={
                    delivery.date ? isoToLocalDate(delivery.date) : minDate
                  }
                  startMonth={minDate}
                  endMonth={maxDate}
                  disabled={[{ before: minDate }, { after: maxDate }]}
                  onSelect={(date) => {
                    if (!date) return;
                    const iso = localDateToISO(date);
                    if (iso === tomorrowISO)
                      setDelivery({ day: "manana", date: null });
                    else setDelivery({ day: "otra", date: iso });
                    setCalendarOpen(false);
                  }}
                />
              </Suspense>
            </PopoverContent>
          </Popover>
        </div>
        {!todayAvailable && (
          <p id={cutoffNoteId} className="mt-2 text-[13px] text-gris-texto">
            Pasó el corte de las 14 h: la primera entrega disponible es mañana.
          </p>
        )}
        {problem?.field === "date" && (
          <p className="mt-2 text-[13px] text-error">{problem.message}</p>
        )}
      </fieldset>

      <fieldset>
        <legend className={headingClass}>Franja horaria</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((slot) => (
            <Chip
              key={slot}
              selected={delivery.slot === slot}
              onClick={() => setDelivery({ slot })}
            >
              {slot}
            </Chip>
          ))}
        </div>
        {problem?.field === "slot" && (
          <p className="mt-2 text-[13px] text-error">{problem.message}</p>
        )}
      </fieldset>

      <div>
        <label htmlFor={barrioId} className={headingClass}>
          Barrio
        </label>
        <Select
          value={delivery.barrio ?? ""}
          onValueChange={(barrio) => setDelivery({ barrio })}
        >
          <SelectTrigger
            id={barrioId}
            data-delivery-field="barrio"
            className="mt-3"
            aria-invalid={barrioError ? true : undefined}
            aria-describedby={barrioError ? `${barrioId}-error` : undefined}
          >
            <SelectValue placeholder="Elegí el barrio" />
          </SelectTrigger>
          <SelectContent>
            {BARRIOS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {barrioError && (
          <p id={`${barrioId}-error`} className="mt-2 text-[13px] text-error">
            {barrioError}
          </p>
        )}
      </div>
    </div>
  );
}

/** Devuelve el primer problema de la entrega, en un texto amable, o null si está completa. */
export function deliveryProblem(
  delivery: ReturnType<typeof useCart.getState>["delivery"],
): DeliveryProblem | null {
  if (delivery.day === "otra" && !delivery.date)
    return {
      field: "date",
      message: "Elegí una fecha de entrega en el calendario.",
    };
  if (!delivery.slot)
    return {
      field: "slot",
      message: "Elegí una franja horaria para la entrega.",
    };
  if (!delivery.barrio)
    return {
      field: "barrio",
      message: "Elegí el barrio para coordinar la entrega.",
    };
  return null;
}
