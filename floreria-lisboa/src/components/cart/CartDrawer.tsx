import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { PitchNote } from "@/components/pitch/PitchNote";
import { useCart } from "@/store/cart";
import { cartTotals } from "@/lib/pricing";
import { formatPrice } from "@/lib/format";
import { CartItemRow } from "./CartItemRow";
import { DeliveryPicker, deliveryProblem, type DeliveryProblem } from "./DeliveryPicker";
import { FreeShippingBar } from "./FreeShippingBar";
import { PaymentBadges } from "./PaymentBadges";

export function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, restoreItem, delivery } = useCart();
  const navigate = useNavigate();
  const totals = cartTotals(items.map((i) => i.price));
  const [problem, setProblem] = useState<DeliveryProblem | null>(null);

  // El aviso desaparece apenas se corrige el dato que faltaba.
  useEffect(() => {
    if (problem && !deliveryProblem(delivery)) setProblem(null);
  }, [delivery, problem]);

  const handleRemove = (id: string) => {
    const removed = removeItem(id);
    if (!removed) return;
    toast(`Quitamos ${removed.item.name} del pedido`, {
      action: { label: "Deshacer", onClick: () => restoreItem(removed.item, removed.index) },
    });
  };

  const handleContinue = () => {
    const issue = deliveryProblem(delivery);
    if (issue) {
      setProblem(issue);
      window.setTimeout(() => {
        const field = document.querySelector<HTMLElement>(`[data-delivery-field="${issue.field}"]`);
        field?.scrollIntoView({ block: "center", behavior: "smooth" });
        field?.focus({ preventScroll: true });
      }, 50);
      return;
    }
    setOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" closeLabel="Cerrar pedido" aria-describedby={undefined}>
        <div className="border-b border-linea px-6 pb-5 pt-6">
          <SheetTitle>Tu pedido</SheetTitle>
          {items.length > 0 && (
            <FreeShippingBar className="mt-4 pr-2" missing={totals.missingForFree} progress={totals.progress} />
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-serif text-[30px] leading-tight">Tu pedido está vacío</p>
            <SheetDescription className="mt-3 text-[15px]">Diseñá un ramo o elegí uno de la colección.</SheetDescription>
            <Button
              className="mt-8"
              onClick={() => {
                setOpen(false);
                navigate("/crear");
              }}
            >
              Diseñar mi ramo
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-6">
              <SheetDescription className="sr-only">Revisá los ramos, elegí la entrega y continuá al pago.</SheetDescription>
              <PitchNote n={8} className="mt-5" />
              <ul className="divide-y divide-linea">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} onRemove={() => handleRemove(item.id)} />
                ))}
              </ul>
              <section aria-labelledby="entrega-titulo" className="border-t border-linea py-6">
                <h3 id="entrega-titulo" className="font-serif text-[22px]">
                  Entrega
                </h3>
                <div className="mt-4">
                  <DeliveryPicker problem={problem} compact />
                </div>
              </section>
            </div>

            <div className="border-t border-linea bg-papel px-6 pb-6 pt-5">
              <dl className="space-y-1.5 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-gris-texto">Subtotal</dt>
                  <dd className="tabular">{formatPrice(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gris-texto">Envío</dt>
                  <dd className="tabular">{totals.shipping ? formatPrice(totals.shipping) : <span className="text-malva-oscuro">Sin cargo</span>}</dd>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <dt className="text-[14px] uppercase tracking-[0.14em]">Total</dt>
                  <dd className="tabular font-serif text-[26px] leading-none">{formatPrice(totals.total)}</dd>
                </div>
              </dl>
              <PaymentBadges className="mt-4" />
              {problem && (
                <p className="mt-4 text-[13px] text-error" role="alert">
                  {problem.message}
                </p>
              )}
              <Button className="mt-4 w-full" onClick={handleContinue}>
                Continuar al pago
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
