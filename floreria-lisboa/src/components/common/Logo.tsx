import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={cn("inline-flex flex-col items-center rounded-sm leading-none", className)} aria-label="Florería Lisboa, ir al inicio">
      <span className={cn("font-serif font-normal tracking-[0.01em] text-tinta", compact ? "text-[24px]" : "text-[28px]")}>
        Florería <em className="font-serif italic text-malva">Lisboa</em>
      </span>
      <span className={cn("mt-1.5 whitespace-nowrap font-sans text-[9.5px] font-normal uppercase tracking-[0.12em] text-tinta sm:tracking-[0.32em]", compact && "sm:tracking-[0.24em]")}>
        Atelier floral · Buenos Aires
      </span>
    </Link>
  );
}
