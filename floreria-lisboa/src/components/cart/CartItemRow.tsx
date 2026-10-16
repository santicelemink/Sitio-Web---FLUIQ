import type { CartItem } from "@/types";
import { BouquetPreview, paletteBackground } from "@/components/bouquet/BouquetPreview";
import { describeBouquet, summaryLines } from "@/lib/bouquet";
import { formatPrice } from "@/lib/format";

export function CartThumb({ item, className = "h-[84px] w-[70px]" }: { item: CartItem; className?: string }) {
  return (
    <div className={`${className} shrink-0 overflow-hidden rounded-[14px] border border-linea`} style={{ background: paletteBackground(item.config.palette) }}>
      <BouquetPreview {...item.config} label={describeBouquet(item.config)} />
    </div>
  );
}

export function CartItemRow({ item, onRemove }: { item: CartItem; onRemove?: () => void }) {
  const lines = summaryLines(item.config);
  return (
    <li className="flex gap-4 py-5">
      <CartThumb item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[21px] leading-tight">{item.name}</h3>
          <p className="tabular shrink-0 font-serif text-[19px] leading-tight">{formatPrice(item.price)}</p>
        </div>
        <p className="mt-1 text-[13px] leading-snug text-gris-texto">{lines.main}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-gris-texto">{lines.wrap}</p>
        <p className="mt-0.5 text-[13px] leading-snug text-gris-texto">{lines.card}</p>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="mt-2 rounded-sm text-[13px] text-malva-oscuro underline decoration-1 underline-offset-4 transition-colors hover:text-tinta"
            aria-label={`Quitar ${item.name} del pedido`}
          >
            Quitar
          </button>
        )}
      </div>
    </li>
  );
}
