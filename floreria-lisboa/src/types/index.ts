export type OccasionId =
  | "cumpleanos"
  | "amor"
  | "aniversario"
  | "nacimiento"
  | "agradecimiento"
  | "condolencias"
  | "porque-si";
export type PaletteId = "rubor" | "lavanda" | "durazno" | "manteca" | "marfil" | "jardin";
export type FlowerId = "rosa" | "peonia" | "tulipan" | "ranunculo" | "lisianthus" | "hortensia";
export type SizeId = "petite" | "clasico" | "abundante";
export type WrapId = "seda-marfil" | "lino-rubor" | "kraft" | "salvia" | "caja";
export type RibbonId = "saten-rubor" | "saten-marfil" | "salvia" | "lavanda" | "dorado";
export type CardDesignId = "clasica" | "acuarela" | "minima";
export type FontId = "clasica" | "manuscrita";
export type ExtraId = "florero" | "vela" | "bombones";

export interface BouquetConfig {
  occasion: OccasionId;
  palette: PaletteId;
  flowers: FlowerId[];
  size: SizeId;
  wrap: WrapId;
  ribbon: RibbonId;
  cardDesign: CardDesignId;
  font: FontId;
  message: string;
  anonymous: boolean;
  extras: ExtraId[];
}

export interface CartItem {
  id: string;
  name: string;
  productSlug?: string;
  config: BouquetConfig;
  price: number;
  addedAt: number;
}

export type DeliveryDay = "hoy" | "manana" | "otra";

export interface DeliveryInfo {
  day: DeliveryDay;
  date: string | null; // YYYY-MM-DD, solo para "otra"
  slot: string | null;
  barrio: string | null;
}

export interface PlacedOrder {
  id: string;
  number: string;
  createdAt: string;
  buyerName: string;
  recipientName: string;
  items: CartItem[];
  delivery: DeliveryInfo & { dateISO: string };
  subtotal: number;
  shipping: number;
  total: number;
  paymentLabel: string;
}
