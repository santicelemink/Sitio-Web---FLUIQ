import { useCallback } from "react";
import { toast } from "sonner";
import { PRODUCT_BY_SLUG } from "@/data/products";
import { configsEqual } from "@/lib/bouquet";
import { useCart } from "@/store/cart";
import { useConfigurator } from "@/store/configurator";

export function itemNameFor(config: ReturnType<typeof useConfigurator.getState>["config"], baseSlug: string | null) {
  const product = baseSlug ? PRODUCT_BY_SLUG[baseSlug] : undefined;
  if (!product) return "Ramo a tu manera";
  return configsEqual(config, product.config) ? product.name : `${product.name}, a tu manera`;
}

/** Agrega el diseño actual: abre el carrito, avisa con un toast y vuelve al paso 1. */
export function useAddConfigToCart() {
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);
  return useCallback(() => {
    const { config, baseProduct, setStep } = useConfigurator.getState();
    addItem({ name: itemNameFor(config, baseProduct), config, productSlug: baseProduct ?? undefined });
    setStep(0);
    openCart();
    toast("Tu diseño agregado al pedido");
  }, [addItem, openCart]);
}
