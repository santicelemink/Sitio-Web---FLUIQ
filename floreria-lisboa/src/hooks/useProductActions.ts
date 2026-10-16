import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import type { BouquetConfig } from "@/types";
import { scrollToId } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useConfigurator } from "@/store/configurator";

export function useProductActions() {
  const location = useLocation();
  const navigate = useNavigate();
  const loadConfig = useConfigurator((s) => s.loadConfig);
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  /** Carga el diseño en el configurador, en el paso 3 (flores). */
  const customize = useCallback(
    (product: Product, config: BouquetConfig = product.config) => {
      loadConfig(config, { step: 2, baseProduct: product.slug });
      toast(`Cargamos ${product.name}. Cambiá lo que quieras.`);
      if (location.pathname === "/" && document.getElementById("crear")) scrollToId("crear");
      else navigate("/crear");
    },
    [loadConfig, location.pathname, navigate],
  );

  const add = useCallback(
    (product: Product, config: BouquetConfig = product.config) => {
      addItem({ name: product.name, config, productSlug: product.slug });
      openCart();
      toast(`${product.name} agregado al pedido`);
    },
    [addItem, openCart],
  );

  return { customize, add };
}
