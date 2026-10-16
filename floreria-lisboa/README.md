# Florería Lisboa · prototipo de tienda online

Prototipo de e-commerce para Florería Lisboa, atelier floral de Buenos Aires.
React + Vite + TypeScript + Tailwind + shadcn/ui (Radix), estado con Zustand.

```bash
cd floreria-lisboa
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
```

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Home con todas las secciones (hero, beneficios, configurador, colección, suscripción, reseñas, preguntas) |
| `/crear` | Configurador a pantalla completa |
| `/coleccion` | Diseños de la casa con filtros por ocasión |
| `/producto/:slug` | Ficha de producto (`alfama`, `sintra`, `belem`, `tejo`, `chiado`, `bairro`) |
| `/suscripcion` | Planes y recordatorios |
| `/checkout` | Datos, entrega y pago simulado |
| `/pedido-confirmado` | Número de pedido y resumen |

Links útiles para la presentación:

- `/?pitch=1` abre el sitio con el **modo presentación** activo (notas de UX y sección “Lo que gana el negocio”). `/?pitch=0` lo apaga.
- `Compartir` en el configurador copia un link `/crear?diseno=...` con el ramo codificado.

## Estructura

```
src/
  components/
    bouquet/        BouquetPreview: el ramo se dibuja en SVG a partir de la configuración
    configurator/   Los 6 pasos, vista previa, barra de progreso
    cart/           Drawer del pedido, entrega (corte de las 14 h), envío sin cargo
    pitch/          Modo presentación
    ui/             Componentes shadcn/ui adaptados a la identidad
  data/             Catálogo (ocasiones, paletas, flores, tamaños...), productos y textos
  lib/              Precios, horario de Buenos Aires, formato, almacenamiento seguro
  services/         Mocks async: orders, payments, reminders, subscriptions
  store/            Zustand: carrito, configurador, modo presentación
```

## Conectar backend más adelante

Los servicios de `src/services` devuelven promesas con éxito simulado. Para producción
se reemplaza el cuerpo de cada función (Supabase para pedidos, recordatorios y
suscripciones; Mercado Pago Checkout Pro o Bricks para pagos) manteniendo la firma:
la UI no cambia.

## Notas

- Precio: `base del tamaño + promedio del recargo de flores × (tallos / 11) × 1.4 + envoltorio + tarjeta + extras`, redondeado a la centena.
- Toda la lógica de horarios usa `America/Argentina/Buenos_Aires`.
- Se persisten en `localStorage` (con try/catch) el pedido, el diseño guardado y el modo presentación.
- Para cumplir contraste AA, el texto secundario usa `gris-texto` (#6B6264) y el texto chico en acento usa `malva-oscuro`; el gris #7D7476 y el malva #A8707C quedan para íconos, bordes, placeholders y títulos grandes.
- Deploy en Netlify como sitio aparte: “Base directory” = `floreria-lisboa` (ver `netlify.toml`).
