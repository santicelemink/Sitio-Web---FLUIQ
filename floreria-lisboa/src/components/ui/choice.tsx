import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tarjeta de opción seleccionable: marfil + borde línea; seleccionada: blanco, borde malva y check. */
export const OptionCard = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean; hideCheck?: boolean }
>(({ selected, hideCheck, className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={selected}
    className={cn(
      "relative rounded-option border p-4 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ease-atelier active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50",
      selected
        ? "border-malva bg-papel shadow-soft"
        : "border-linea bg-marfil hover:border-tinta/30 hover:bg-papel",
      className,
    )}
    {...props}
  >
    {children}
    {!hideCheck && (
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-3 top-3 inline-flex h-[22px] w-[22px] items-center justify-center rounded-full transition-all duration-300 ease-atelier",
          selected ? "scale-100 bg-malva text-papel opacity-100" : "scale-75 border border-linea opacity-0",
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    )}
  </button>
));
OptionCard.displayName = "OptionCard";

/** Chip tipo pill para filtros y opciones cortas. Seleccionado: fondo tinta. */
export const Chip = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }
>(({ selected = false, className, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-pressed={selected}
    className={cn(
      "inline-flex min-h-[40px] items-center justify-center gap-2 rounded-full border px-[18px] py-2 text-[14px] font-light transition-[background-color,color,border-color,transform] duration-300 ease-atelier active:scale-[0.98] disabled:cursor-not-allowed disabled:border-linea disabled:bg-transparent disabled:text-gris disabled:opacity-60",
      selected
        ? "border-tinta bg-tinta text-marfil"
        : "border-linea bg-papel text-tinta hover:border-tinta/50",
      className,
    )}
    {...props}
  >
    {children}
  </button>
));
Chip.displayName = "Chip";
