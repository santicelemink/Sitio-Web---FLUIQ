import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/utils";

/** Interpola suavemente un número (precio) cuando cambia. */
export function useAnimatedNumber(target: number, duration = 350) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const valueRef = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion()) {
      valueRef.current = target;
      setValue(target);
      return;
    }
    fromRef.current = valueRef.current;
    const start = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const t = Math.min(1, (time - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      valueRef.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
