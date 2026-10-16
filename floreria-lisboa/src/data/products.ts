import type { BouquetConfig, OccasionId } from "@/types";
import { DEFAULT_CONFIG } from "./catalog";

export interface Product {
  slug: string;
  name: string;
  description: string;
  story: string;
  occasions: OccasionId[];
  tag?: string;
  config: BouquetConfig;
}

const base = (overrides: Partial<BouquetConfig>): BouquetConfig => ({
  ...DEFAULT_CONFIG,
  message: "",
  anonymous: false,
  extras: [],
  ...overrides,
});

export const PRODUCTS: Product[] = [
  {
    slug: "alfama",
    name: "Alfama",
    description: "Rosas y ranúnculos en rubor, papel de lino.",
    story:
      "Como las calles empinadas del barrio más antiguo de Lisboa: capas suaves, curvas y un rosa que se va encendiendo hacia el centro. Un ramo romántico sin ser obvio.",
    occasions: ["amor", "aniversario"],
    tag: "El más pedido",
    config: base({
      occasion: "amor",
      palette: "rubor",
      flowers: ["rosa", "ranunculo"],
      size: "clasico",
      wrap: "lino-rubor",
      ribbon: "saten-rubor",
      font: "manuscrita",
    }),
  },
  {
    slug: "sintra",
    name: "Sintra",
    description: "Peonías y lisianthus en lavanda.",
    story:
      "Inspirado en los jardines de la sierra de Sintra: peonías de estación, lisianthus livianos y una paleta lavanda que se siente fresca y luminosa.",
    occasions: ["nacimiento", "porque-si"],
    tag: "De estación",
    config: base({
      occasion: "nacimiento",
      palette: "lavanda",
      flowers: ["peonia", "lisianthus"],
      size: "clasico",
      wrap: "seda-marfil",
      ribbon: "lavanda",
      cardDesign: "acuarela",
    }),
  },
  {
    slug: "belem",
    name: "Belém",
    description: "Hortensias y rosas marfil, sobrio y luminoso.",
    story:
      "Blanco piedra, como el monasterio frente al río. Hortensias con volumen y rosas marfil para acompañar con delicadeza, sin estridencias.",
    occasions: ["condolencias", "agradecimiento"],
    config: base({
      occasion: "condolencias",
      palette: "marfil",
      flowers: ["hortensia", "rosa"],
      size: "abundante",
      wrap: "salvia",
      ribbon: "salvia",
      cardDesign: "minima",
    }),
  },
  {
    slug: "tejo",
    name: "Tejo",
    description: "Tulipanes durazno con papel kraft.",
    story:
      "El color del atardecer sobre el río Tejo. Tulipanes simples y modernos, papel kraft y una cinta dorada: alegre, directo y fácil de querer.",
    occasions: ["cumpleanos", "agradecimiento"],
    config: base({
      occasion: "cumpleanos",
      palette: "durazno",
      flowers: ["tulipan"],
      size: "clasico",
      wrap: "kraft",
      ribbon: "dorado",
    }),
  },
  {
    slug: "chiado",
    name: "Chiado",
    description: "Mix de jardín en caja sombrerera.",
    story:
      "Elegante y con un toque teatral, como el barrio de los cafés y las librerías. Peonías, rosas y lisianthus en caja sombrerera: llega listo para apoyar sobre una mesa.",
    occasions: ["cumpleanos", "aniversario", "porque-si"],
    tag: "Para regalar",
    config: base({
      occasion: "cumpleanos",
      palette: "jardin",
      flowers: ["peonia", "rosa", "lisianthus"],
      size: "clasico",
      wrap: "caja",
      ribbon: "saten-rubor",
      cardDesign: "acuarela",
      font: "manuscrita",
    }),
  },
  {
    slug: "bairro",
    name: "Bairro",
    description: "Ranúnculos manteca, pequeño y alegre.",
    story:
      "Un ramo chico con mucha personalidad. Ranúnculos y lisianthus en tonos manteca, ideal para decir gracias o alegrar un escritorio.",
    occasions: ["agradecimiento", "porque-si"],
    tag: "Desde $30.000",
    config: base({
      occasion: "agradecimiento",
      palette: "manteca",
      flowers: ["ranunculo", "lisianthus"],
      size: "petite",
      wrap: "seda-marfil",
      ribbon: "saten-marfil",
    }),
  },
];

export const PRODUCT_BY_SLUG = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p])) as Record<string, Product>;
