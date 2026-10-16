import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Outlet, Route, Routes, useLocation, useSearchParams } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PresentationBanner } from "@/components/pitch/PresentationBanner";
import { PresentationToggle } from "@/components/pitch/PresentationToggle";
import { usePresentation } from "@/store/presentation";
import { prefersReducedMotion, stripSearchParam } from "@/lib/utils";
import { HomePage } from "@/pages/HomePage";
import { CreatePage } from "@/pages/CreatePage";
import { CollectionPage } from "@/pages/CollectionPage";
import { SubscriptionPage } from "@/pages/SubscriptionPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// Páginas fuera del recorrido principal: se cargan bajo demanda.
const ProductPage = lazy(() => import("@/pages/ProductPage").then((m) => ({ default: m.ProductPage })));
const CheckoutPage = lazy(() => import("@/pages/CheckoutPage").then((m) => ({ default: m.CheckoutPage })));
const OrderConfirmedPage = lazy(() =>
  import("@/pages/OrderConfirmedPage").then((m) => ({ default: m.OrderConfirmedPage })),
);

/** Scroll al tope en cada página nueva; si hay #ancla, scroll hasta la sección. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const timer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      }, 60);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}

/** ?pitch=1 activa el modo presentación (y ?pitch=0 lo desactiva) para compartir el link. */
function PitchParam() {
  const [params] = useSearchParams();
  const setActive = usePresentation((s) => s.setActive);
  const pitch = params.get("pitch");
  useEffect(() => {
    if (pitch !== "1" && pitch !== "0") return;
    setActive(pitch === "1");
    // El estado queda guardado; quitamos el parámetro para que el botón mande al recargar.
    stripSearchParam("pitch");
  }, [pitch, setActive]);
  return null;
}

function Layout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#contenido"
        className="sr-only z-[80] rounded-full bg-tinta px-5 py-3 text-marfil focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Saltar al contenido
      </a>
      <ScrollManager />
      <PitchParam />
      <PresentationBanner />
      <AnnouncementBar />
      <Header />
      <main id="contenido" className="flex-1">
        <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <aside aria-label="Accesos rápidos">
        <PresentationToggle />
        <WhatsAppButton />
      </aside>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider delayDuration={150}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="crear" element={<CreatePage />} />
            <Route path="coleccion" element={<CollectionPage />} />
            <Route path="producto/:slug" element={<ProductPage />} />
            <Route path="suscripcion" element={<SubscriptionPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="pedido-confirmado" element={<OrderConfirmedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster />
      </TooltipProvider>
    </BrowserRouter>
  );
}
