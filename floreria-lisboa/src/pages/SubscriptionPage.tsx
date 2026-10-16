import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Faq } from "@/sections/Faq";
import { Subscription } from "@/sections/Subscription";

export function SubscriptionPage() {
  useDocumentTitle("Suscripción");
  return (
    <>
      <Subscription asPage />
      <div className="border-t border-linea">
        <Faq />
      </div>
    </>
  );
}
