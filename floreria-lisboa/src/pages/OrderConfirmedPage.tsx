import { Link } from "react-router-dom";
import { Camera, Check, Flower2, PackageCheck, Truck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { formatPrice } from "@/lib/format";
import { formatLongDate } from "@/lib/time";
import { useCart } from "@/store/cart";

const TIMELINE = [
  { icon: PackageCheck, label: "Pedido recibido" },
  { icon: Flower2, label: "Lo armamos en el taller" },
  { icon: Camera, label: "Foto por WhatsApp" },
  { icon: Truck, label: "En camino" },
];

export function OrderConfirmedPage() {
  useDocumentTitle("Pedido confirmado");
  const order = useCart((s) => s.lastOrder);

  if (!order) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-[40px] leading-tight">No encontramos un pedido reciente</h1>
        <p className="lead mt-3">Si ya pagaste, revisá tu email o escribinos por WhatsApp.</p>
        <Link to="/" className={buttonVariants({ className: "mt-8" })}>
          Volver al inicio
        </Link>
      </section>
    );
  }

  return (
    <section className="container max-w-[880px] pb-20 pt-10 sm:pt-16">
      <div className="text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-salvia text-tinta">
          <Check className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </span>
        <p className="kicker mt-6">Pedido confirmado</p>
        <h1 className="section-title mt-3">
          Gracias, <em>{order.buyerName}</em>
        </h1>
        <p className="mt-3 text-[15px] text-gris-texto">
          Número de pedido <span className="tabular text-tinta">{order.number}</span>
        </p>
        <p className="lead mx-auto mt-5 max-w-[520px]">Te vamos a mandar una foto del ramo por WhatsApp antes de que salga.</p>
      </div>

      <ol className="mx-auto mt-10 grid max-w-[640px] grid-cols-4 gap-2" aria-label="Estado del pedido">
        {TIMELINE.map(({ icon: Icon, label }, i) => (
          <li key={label} className="flex flex-col items-center text-center">
            <span
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${i === 0 ? "border-oro bg-oro text-papel" : "border-linea bg-papel text-gris"}`}
              aria-hidden="true"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </span>
            <span className={`mt-2 text-[13px] leading-snug ${i === 0 ? "text-tinta" : "text-gris-texto"}`}>{label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-panel border border-linea bg-papel p-5 sm:p-8">
        <h2 className="font-serif text-[26px]">Resumen</h2>
        <ul className="divide-y divide-linea">
          {order.items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </ul>
        <div className="grid gap-4 border-t border-linea pt-5 text-[14px] sm:grid-cols-3">
          <div>
            <p className="text-gris-texto">Entrega</p>
            <p className="mt-1 first-letter:uppercase">{formatLongDate(order.delivery.dateISO)}</p>
            <p>
              {order.delivery.slot} · {order.delivery.barrio}
            </p>
          </div>
          <div>
            <p className="text-gris-texto">Recibe</p>
            <p className="mt-1">{order.recipientName}</p>
          </div>
          <div>
            <p className="text-gris-texto">Pago</p>
            <p className="mt-1">{order.paymentLabel}</p>
          </div>
        </div>
        <dl className="mt-5 space-y-1.5 border-t border-linea pt-5 text-[14px]">
          <div className="flex justify-between">
            <dt className="text-gris-texto">Subtotal</dt>
            <dd className="tabular">{formatPrice(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gris-texto">Envío</dt>
            <dd className="tabular">{order.shipping ? formatPrice(order.shipping) : "Sin cargo"}</dd>
          </div>
          <div className="flex items-baseline justify-between pt-2">
            <dt className="uppercase tracking-[0.14em]">Total</dt>
            <dd className="tabular font-serif text-[26px] leading-none">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/" className={buttonVariants({ variant: "secondary" })}>
          Volver al inicio
        </Link>
        <Link to="/crear" className={buttonVariants()}>
          Diseñar otro ramo
        </Link>
      </div>
    </section>
  );
}
