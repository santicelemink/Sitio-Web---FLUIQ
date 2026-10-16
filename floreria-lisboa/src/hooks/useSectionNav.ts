import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollToId } from "@/lib/utils";

/** Navega a una sección de la home: si ya estamos en "/", hace scroll; si no, cambia de página. */
export function useSectionNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return useCallback(
    (id: string) => {
      if (location.pathname === "/" && scrollToId(id)) {
        window.history.replaceState(null, "", `#${id}`);
        return;
      }
      navigate(`/#${id}`);
    },
    [location.pathname, navigate],
  );
}
