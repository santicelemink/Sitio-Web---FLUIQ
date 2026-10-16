import type { StateStorage } from "zustand/middleware";

/**
 * localStorage envuelto en try/catch: en modo privado, con el almacenamiento lleno
 * o bloqueado por el navegador, el sitio sigue funcionando sin persistir.
 */
export const safeStorage: StateStorage = {
  getItem(name) {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name, value) {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      /* sin persistencia disponible */
    }
  },
  removeItem(name) {
    try {
      window.localStorage.removeItem(name);
    } catch {
      /* sin persistencia disponible */
    }
  },
};
