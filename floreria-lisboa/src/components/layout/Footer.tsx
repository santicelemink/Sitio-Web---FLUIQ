import { Link } from "react-router-dom";
import { whatsappLink } from "@/data/catalog";

const linkClass =
  "rounded-sm text-[15px] text-marfil/80 transition-colors duration-300 ease-atelier hover:text-marfil";

export function Footer() {
  return (
    <footer className="bg-tinta text-marfil">
      <div className="container grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-20">
        <div className="sm:col-span-2 lg:col-span-1">
          <p className="font-serif text-[30px] leading-none">Florería Lisboa</p>
          <p className="mt-4 text-[15px] text-marfil/80">Atelier floral en Buenos Aires.</p>
          <p className="mt-2 text-[15px] text-marfil/80">Lunes a sábado de 8 a 20 h · Domingos de 9 a 14 h</p>
        </div>
        <nav aria-labelledby="footer-comprar">
          <h2 id="footer-comprar" className="font-sans text-kicker uppercase text-oro">
            Comprar
          </h2>
          <ul className="mt-5 space-y-3">
            <li><Link className={linkClass} to="/crear">Creá tu ramo</Link></li>
            <li><Link className={linkClass} to="/coleccion">Colección</Link></li>
            <li><Link className={linkClass} to="/suscripcion">Suscripción</Link></li>
            <li>
              <a className={linkClass} href={whatsappLink("Hola, quería pedir un presupuesto para empresas.")} target="_blank" rel="noreferrer">
                Empresas
              </a>
            </li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-ayuda">
          <h2 id="footer-ayuda" className="font-sans text-kicker uppercase text-oro">
            Ayuda
          </h2>
          <ul className="mt-5 space-y-3">
            <li><Link className={linkClass} to="/#preguntas">Zonas de envío</Link></li>
            <li><Link className={linkClass} to="/producto/alfama#cuidados">Cuidado de las flores</Link></li>
            <li><Link className={linkClass} to="/#preguntas">Cambios</Link></li>
            <li>
              <a className={linkClass} href={whatsappLink("Hola, tengo una consulta.")} target="_blank" rel="noreferrer">
                Contacto
              </a>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-marfil/15">
        <div className="container flex flex-col gap-2 py-6 text-[13px] text-marfil/75 sm:flex-row sm:items-center sm:justify-between">
          <p>Prototipo · Precios, reseñas y horarios son de ejemplo.</p>
          <p>Diseño y desarrollo: FLUIQ</p>
        </div>
      </div>
    </footer>
  );
}
