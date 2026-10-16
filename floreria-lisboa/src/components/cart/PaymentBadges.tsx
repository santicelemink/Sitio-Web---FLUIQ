import { cn } from "@/lib/utils";

const BADGES = ["Mercado Pago", "Tarjetas", "Transferencia", "3 cuotas sin interés"];

export function PaymentBadges({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medios de pago">
      {BADGES.map((b) => (
        <li key={b} className="rounded-full border border-linea bg-papel px-3 py-1 text-[12px] tracking-[0.02em] text-tinta">
          {b}
        </li>
      ))}
    </ul>
  );
}
