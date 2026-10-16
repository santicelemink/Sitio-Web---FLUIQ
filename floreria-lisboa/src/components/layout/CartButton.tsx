import { ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const count = useCart((s) => s.items.length);
  const pulse = useCart((s) => s.addPulse);
  const open = useCart((s) => s.open);
  return (
    <button
      type="button"
      onClick={open}
      className={cn(
        "relative inline-flex h-11 items-center gap-2 rounded-full border border-linea bg-papel/70 pl-3.5 pr-2.5 sm:gap-2.5 sm:pl-4 sm:pr-3 text-[13px] uppercase tracking-[0.14em] text-tinta transition-[border-color,background-color] duration-300 ease-atelier hover:border-tinta/50 hover:bg-papel",
        className,
      )}
      aria-label={count ? `Ver pedido, ${count} ${count === 1 ? "ramo" : "ramos"}` : "Ver pedido, vacío"}
    >
      <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
      <span className="hidden sm:inline">Pedido</span>
      <span
        key={pulse}
        aria-hidden="true"
        className={cn(
          "tabular inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[12px] tracking-normal",
          count ? "bg-malva-oscuro text-papel" : "bg-linea text-tinta",
          pulse > 0 && "animate-pop",
        )}
      >
        {count}
      </span>
    </button>
  );
}
