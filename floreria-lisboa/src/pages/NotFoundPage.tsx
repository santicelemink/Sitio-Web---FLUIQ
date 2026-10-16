import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function NotFoundPage() {
  useDocumentTitle("Página no encontrada");
  return (
    <section className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="kicker">Error 404</p>
      <h1 className="section-title mt-4">
        Esta página <em>no florece</em>
      </h1>
      <p className="lead mt-4 max-w-[460px]">Puede que el link esté incompleto. Volvé al inicio o diseñá un ramo desde cero.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className={buttonVariants({ variant: "secondary" })}>
          Volver al inicio
        </Link>
        <Link to="/crear" className={buttonVariants()}>
          Diseñar mi ramo
        </Link>
      </div>
    </section>
  );
}
