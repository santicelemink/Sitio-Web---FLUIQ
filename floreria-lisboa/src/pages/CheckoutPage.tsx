import { useEffect, useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Chip, OptionCard } from "@/components/ui/choice";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { DeliveryPicker, deliveryProblem, type DeliveryProblem } from "@/components/cart/DeliveryPicker";
import { FreeShippingBar } from "@/components/cart/FreeShippingBar";
import { PaymentBadges } from "@/components/cart/PaymentBadges";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { isValidArgentinePhone } from "@/lib/phone";
import { cartTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { formatLongDate } from "@/lib/time";
import { cn } from "@/lib/utils";
import { createOrder } from "@/services/orders";
import { createPayment, PAYMENT_LABELS, type PaymentMethod } from "@/services/payments";
import { deliveryDateISO, useCart } from "@/store/cart";

const phone = (empty: string, invalid: string) =>
  z.string().trim().min(1, empty).refine(isValidArgentinePhone, invalid);

const schema = z.object({
  buyerName: z.string().trim().min(2, "Escribí tu nombre y apellido."),
  email: z.string().trim().min(1, "Necesitamos tu email para mandarte el comprobante.").email("Revisá el email: parece incompleto."),
  whatsapp: phone("Dejanos tu WhatsApp: por ahí te mandamos la foto del ramo.", "Revisá el número. Por ejemplo: 11 2345 6789."),
  recipientName: z.string().trim().min(2, "Escribí el nombre de quien recibe el ramo."),
  address: z
    .string()
    .trim()
    .min(5, "Escribí la dirección con calle y altura.")
    .refine((v) => /\d/.test(v), "Sumá la altura de la calle, por ejemplo: Honduras 4800."),
  apartment: z.string().trim().max(40, "Usá menos de 40 caracteres.").optional(),
  recipientPhone: phone("Necesitamos un teléfono por si no responden el timbre.", "Revisá el teléfono. Por ejemplo: 11 2345 6789."),
  notes: z.string().trim().max(200, "Usá menos de 200 caracteres.").optional(),
});

type FormValues = z.infer<typeof schema>;

const PAYMENT_OPTIONS: { id: PaymentMethod; detail: string }[] = [
  { id: "mercadopago", detail: "Dinero en cuenta, tarjetas o hasta 3 cuotas sin interés." },
  { id: "tarjeta", detail: "Visa, Mastercard y American Express." },
  { id: "transferencia", detail: "Te mandamos el CBU por WhatsApp. El pedido se confirma al acreditarse." },
];

function Block({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`bloque-${n}`} className="rounded-panel border border-linea bg-papel p-5 sm:p-8">
      <h2 id={`bloque-${n}`} className="flex items-center gap-3 font-serif text-[26px] leading-tight sm:text-[28px]">
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-malva font-serif text-[17px] text-malva-oscuro">
          {n}
        </span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function CheckoutPage() {
  useDocumentTitle("Finalizar pedido");
  const navigate = useNavigate();
  const ids = useId();
  const items = useCart((s) => s.items);
  const delivery = useCart((s) => s.delivery);
  const placeOrder = useCart((s) => s.placeOrder);
  const normalizeDelivery = useCart((s) => s.normalizeDelivery);
  const totals = cartTotals(items.map((i) => i.price));
  const [method, setMethod] = useState<PaymentMethod>("mercadopago");
  const [installments, setInstallments] = useState<1 | 3>(1);
  const [problem, setProblem] = useState<DeliveryProblem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onTouched" });

  useEffect(() => {
    normalizeDelivery();
  }, [normalizeDelivery]);

  useEffect(() => {
    if (problem && !deliveryProblem(delivery)) setProblem(null);
  }, [delivery, problem]);

  if (items.length === 0 && !submitting) {
    return (
      <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="font-serif text-[40px] leading-tight">Tu pedido está vacío</h1>
        <p className="lead mt-3">Diseñá un ramo o elegí uno de la colección.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/coleccion" className={buttonVariants({ variant: "secondary" })}>
            Ver la colección
          </Link>
          <Link to="/crear" className={buttonVariants()}>
            Diseñar mi ramo
          </Link>
        </div>
      </section>
    );
  }

  const fieldProps = (name: keyof FormValues) => ({
    id: `${ids}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${ids}-${name}-error` : undefined,
    ...register(name),
  });

  // Función de render (no componente) para que los inputs no se remonten en cada render.
  const field = (
    name: keyof FormValues,
    label: string,
    children: React.ReactNode,
    { optional, className }: { optional?: boolean; className?: string } = {},
  ) => (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={`${ids}-${name}`} className="text-[13px] tracking-[0.02em] text-tinta">
        {label}
        {optional && <span className="text-gris-texto"> (opcional)</span>}
      </label>
      <div className="mt-2">{children}</div>
      {errors[name] && (
        <p id={`${ids}-${name}-error`} className="mt-1.5 text-[13px] text-error">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );

  const onValid = async (values: FormValues) => {
    const issue = deliveryProblem(delivery);
    if (issue) {
      setProblem(issue);
      document.querySelector<HTMLElement>(`[data-delivery-field="${issue.field}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const dateISO = deliveryDateISO(delivery);
      const order = await createOrder({
        buyer: { name: values.buyerName, email: values.email, whatsapp: values.whatsapp },
        recipient: {
          name: values.recipientName,
          address: values.address,
          apartment: values.apartment,
          phone: values.recipientPhone,
          notes: values.notes,
        },
        items,
        delivery: { ...delivery, dateISO },
        ...totals,
      });
      await createPayment({ orderId: order.id, amount: totals.total, method, installments: method === "transferencia" ? 1 : installments });
      placeOrder({
        id: order.id,
        number: order.number,
        createdAt: order.createdAt,
        buyerName: values.buyerName.split(" ")[0],
        recipientName: values.recipientName,
        items,
        delivery: { ...delivery, dateISO },
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        paymentLabel:
          method === "transferencia"
            ? PAYMENT_LABELS[method]
            : `${PAYMENT_LABELS[method]}${installments === 3 ? " · 3 cuotas sin interés" : ""}`,
      });
      navigate("/pedido-confirmado", { replace: true });
    } catch {
      toast("No pudimos procesar el pago. Probá de nuevo en unos segundos.");
      setSubmitting(false);
    }
  };

  const onInvalid = () => {
    toast("Revisá los datos marcados para continuar.");
    window.setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), 30);
  };

  return (
    <div className="container pb-20 pt-6 sm:pt-10">
      <Link to="/" className="inline-flex items-center gap-1 rounded-sm text-[13px] uppercase tracking-[0.14em] text-tinta hover:text-malva-oscuro">
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        Seguir comprando
      </Link>
      <header className="mt-6">
        <p className="kicker">Último paso</p>
        <h1 className="section-title mt-3">
          Finalizá tu <em>pedido</em>
        </h1>
      </header>

      <form onSubmit={handleSubmit(onValid, onInvalid)} noValidate className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
        <div className="space-y-5">
          <Block n={1} title="Tus datos">
            <div className="grid gap-4 sm:grid-cols-2">
              {field("buyerName", "Nombre y apellido", <Input {...fieldProps("buyerName")} autoComplete="name" />, { className: "sm:col-span-2" })}
              {field("email", "Email", <Input type="email" inputMode="email" {...fieldProps("email")} autoComplete="email" placeholder="nombre@mail.com" />)}
              {field("whatsapp", "WhatsApp", <Input type="tel" inputMode="tel" {...fieldProps("whatsapp")} autoComplete="tel" placeholder="11 2345 6789" />)}
            </div>
          </Block>

          <Block n={2} title="Quién lo recibe">
            <div className="grid gap-4 sm:grid-cols-2">
              {field("recipientName", "Nombre de quien recibe", <Input {...fieldProps("recipientName")} autoComplete="off" />, { className: "sm:col-span-2" })}
              {field("address", "Dirección", <Input {...fieldProps("address")} autoComplete="street-address" placeholder="Honduras 4800" />)}
              {field("apartment", "Piso o depto", <Input {...fieldProps("apartment")} placeholder="3.° B" />, { optional: true })}
              {field("recipientPhone", "Teléfono de quien recibe", <Input type="tel" inputMode="tel" {...fieldProps("recipientPhone")} placeholder="11 2345 6789" />, { className: "sm:col-span-2" })}
              {field("notes", "Notas para el repartidor", <Textarea {...fieldProps("notes")} className="min-h-[88px]" placeholder="Timbre que no anda, portería, horario preferido…" />, { optional: true, className: "sm:col-span-2" })}
            </div>
            <div className="mt-7 border-t border-linea pt-6">
              <DeliveryPicker problem={problem} />
            </div>
          </Block>

          <Block n={3} title="Pago">
            <div role="group" aria-label="Medio de pago" className="grid gap-3">
              {PAYMENT_OPTIONS.map((p) => (
                <OptionCard key={p.id} selected={method === p.id} onClick={() => setMethod(p.id)} className="pr-12">
                  <span className="block text-[16px] text-tinta">{PAYMENT_LABELS[p.id]}</span>
                  <span className="mt-0.5 block text-[13px] text-gris-texto">{p.detail}</span>
                </OptionCard>
              ))}
            </div>
            {method !== "transferencia" && (
              <fieldset className="mt-5">
                <legend className="text-[12px] uppercase tracking-[0.16em] text-tinta">Cuotas</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Chip selected={installments === 1} onClick={() => setInstallments(1)}>
                    1 pago de {formatPrice(totals.total)}
                  </Chip>
                  <Chip selected={installments === 3} onClick={() => setInstallments(3)}>
                    3 cuotas sin interés de {formatPrice(totals.total / 3)}
                  </Chip>
                </div>
              </fieldset>
            )}
            <p className="mt-5 flex items-start gap-2 rounded-option bg-marfil p-4 text-[13px] leading-relaxed text-gris-texto">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-malva-oscuro" strokeWidth={1.5} aria-hidden="true" />
              Prototipo: el pago está simulado. En el sitio final se completa en Mercado Pago, sin guardar datos de tarjeta acá.
            </p>
            <Button type="submit" className="mt-6 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden="true" />
                  Confirmando tu pedido…
                </>
              ) : (
                <>Confirmar y pagar {formatPrice(totals.total)}</>
              )}
            </Button>
          </Block>
        </div>

        <aside aria-labelledby="resumen-titulo" className="rounded-panel border border-linea bg-papel p-5 sm:p-7 lg:sticky lg:top-24">
          <h2 id="resumen-titulo" className="font-serif text-[26px]">
            Resumen
          </h2>
          <FreeShippingBar className="mt-4" missing={totals.missingForFree} progress={totals.progress} />
          <ul className="mt-2 divide-y divide-linea">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </ul>
          <div className="border-t border-linea pt-4 text-[14px]">
            <p className="text-gris-texto">Entrega</p>
            <p className="mt-1 first-letter:uppercase">
              {formatLongDate(deliveryDateISO(delivery))} · {delivery.slot ?? "elegí una franja"}
              {delivery.barrio ? ` · ${delivery.barrio}` : ""}
            </p>
          </div>
          <dl className="mt-4 space-y-1.5 border-t border-linea pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt className="text-gris-texto">Subtotal</dt>
              <dd className="tabular">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gris-texto">Envío</dt>
              <dd className="tabular">{totals.shipping ? formatPrice(totals.shipping) : <span className="text-malva-oscuro">Sin cargo</span>}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="uppercase tracking-[0.14em]">Total</dt>
              <dd className="tabular font-serif text-[26px] leading-none">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <PaymentBadges className="mt-5" />
        </aside>
      </form>
    </div>
  );
}
