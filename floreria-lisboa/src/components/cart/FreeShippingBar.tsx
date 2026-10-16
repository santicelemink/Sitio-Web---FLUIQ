import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FreeShippingBar({ missing, progress, className }: { missing: number; progress: number; className?: string }) {
  const done = missing <= 0;
  return (
    <div className={className}>
      <p className="text-[14px] text-tinta" aria-live="polite">
        {done ? (
          <>Tu envío es <span className="text-malva-oscuro">sin cargo</span>.</>
        ) : (
          <>
            Te faltan <span className="tabular font-normal text-malva-oscuro">{formatPrice(missing)}</span> para el envío sin cargo.
          </>
        )}
      </p>
      <div
        className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-linea"
        role="progressbar"
        aria-label="Progreso hacia el envío sin cargo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-oro to-malva transition-[width] duration-500 ease-atelier")}
          style={{ width: `${Math.max(progress * 100, progress > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}
