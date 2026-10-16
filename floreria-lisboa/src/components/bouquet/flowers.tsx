import type { ReactElement } from "react";
import type { FlowerId } from "@/types";
import { mix, shade, tint } from "@/lib/color";

/**
 * Funciones de dibujo por variedad. Cada una dibuja la flor centrada en (0, 0)
 * con radio `r`, rellena con `color` y trazos en una versión más oscura del relleno.
 */
export interface FlowerDrawProps {
  r: number;
  color: string;
  seed?: number;
}

const GOLD = "#C4AB82";
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (angleDeg: number, dist: number) => [Math.cos(rad(angleDeg)) * dist, Math.sin(rad(angleDeg)) * dist] as const;
const n = (v: number) => Math.round(v * 100) / 100;

export function Rose({ r, color, seed = 0 }: FlowerDrawProps) {
  const stroke = shade(color, 0.34);
  const inner = shade(color, 0.08);
  const arcs = [0.6, 0.47, 0.34, 0.21].map((k, i) => {
    const R = r * k;
    const a0 = seed * 360 + i * 97;
    const a1 = a0 + 255;
    const [x0, y0] = pt(a0, R);
    const [x1, y1] = pt(a1, R);
    const off = r * 0.025 * i;
    return (
      <path
        key={i}
        d={`M ${n(x0 + off)} ${n(y0)} A ${n(R)} ${n(R)} 0 1 1 ${n(x1 + off)} ${n(y1)}`}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25 - i * 0.12}
        strokeLinecap="round"
        strokeOpacity={0.75}
      />
    );
  });
  return (
    <g>
      {[0, 1, 2, 3, 4].map((k) => {
        const [x, y] = pt(seed * 360 + k * 72, r * 0.36);
        return (
          <circle key={k} cx={n(x)} cy={n(y)} r={n(r * 0.66)} fill={color} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.35} />
        );
      })}
      <circle r={n(r * 0.7)} fill={color} />
      <circle r={n(r * 0.58)} fill={inner} fillOpacity={0.55} />
      {arcs}
      <circle r={n(r * 0.09)} fill={shade(color, 0.28)} />
    </g>
  );
}

export function Peony({ r, color, seed = 0 }: FlowerDrawProps) {
  const stroke = shade(color, 0.3);
  const light = tint(color, 0.22);
  return (
    <g>
      {Array.from({ length: 10 }, (_, k) => {
        const a = seed * 360 + k * 36;
        const [x, y] = pt(a, r * 0.44);
        return (
          <ellipse
            key={k}
            cx={n(x)}
            cy={n(y)}
            rx={n(r * 0.54)}
            ry={n(r * 0.38)}
            transform={`rotate(${n(a)} ${n(x)} ${n(y)})`}
            fill={k % 2 ? color : light}
            stroke={stroke}
            strokeWidth={0.8}
            strokeOpacity={0.35}
          />
        );
      })}
      <circle r={n(r * 0.42)} fill={color} />
      {Array.from({ length: 7 }, (_, k) => {
        const a = seed * 200 + k * (360 / 7);
        const [x, y] = pt(a, r * 0.17);
        return (
          <ellipse
            key={k}
            cx={n(x)}
            cy={n(y)}
            rx={n(r * 0.24)}
            ry={n(r * 0.15)}
            transform={`rotate(${n(a + 90)} ${n(x)} ${n(y)})`}
            fill={k % 2 ? shade(color, 0.08) : light}
            stroke={stroke}
            strokeWidth={0.7}
            strokeOpacity={0.4}
          />
        );
      })}
      <circle r={n(r * 0.07)} fill={mix(color, GOLD, 0.5)} />
    </g>
  );
}

export function Tulip({ r, color }: FlowerDrawProps) {
  const stroke = shade(color, 0.34);
  const s = (v: number) => n(v * r);
  const outer = `M 0 ${s(0.82)} C ${s(-0.6)} ${s(0.8)} ${s(-0.84)} ${s(0.1)} ${s(-0.6)} ${s(-0.76)} Q ${s(-0.42)} ${s(-0.5)} ${s(-0.26)} ${s(-0.44)} Q ${s(-0.14)} ${s(-0.76)} 0 ${s(-0.94)} Q ${s(0.14)} ${s(-0.76)} ${s(0.26)} ${s(-0.44)} Q ${s(0.42)} ${s(-0.5)} ${s(0.6)} ${s(-0.76)} C ${s(0.84)} ${s(0.1)} ${s(0.6)} ${s(0.8)} 0 ${s(0.82)} Z`;
  const front = `M 0 ${s(0.82)} C ${s(-0.46)} ${s(0.76)} ${s(-0.54)} ${s(0)} ${s(-0.34)} ${s(-0.46)} Q 0 ${s(-0.22)} ${s(0.34)} ${s(-0.46)} C ${s(0.54)} ${s(0)} ${s(0.46)} ${s(0.76)} 0 ${s(0.82)} Z`;
  return (
    <g>
      <path d={outer} fill={shade(color, 0.07)} stroke={stroke} strokeWidth={1} strokeOpacity={0.5} strokeLinejoin="round" />
      <path d={front} fill={tint(color, 0.12)} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.45} />
      <path d={`M 0 ${s(0.7)} Q ${s(0.03)} ${s(0.2)} 0 ${s(-0.3)}`} fill="none" stroke={stroke} strokeWidth={0.9} strokeOpacity={0.55} strokeLinecap="round" />
    </g>
  );
}

export function Ranunculus({ r, color }: FlowerDrawProps) {
  const stroke = shade(color, 0.3);
  const tones = [color, shade(color, 0.1), tint(color, 0.18), shade(color, 0.16), tint(color, 0.08)];
  return (
    <g>
      {[1, 0.8, 0.6, 0.41, 0.24].map((k, i) => (
        <circle
          key={i}
          cy={n(r * 0.035 * i)}
          r={n(r * k)}
          fill={tones[i]}
          stroke={stroke}
          strokeWidth={0.8}
          strokeOpacity={0.4}
        />
      ))}
      <circle cy={n(r * 0.16)} r={n(r * 0.11)} fill="#B3C39B" stroke="#8FA586" strokeWidth={0.6} />
    </g>
  );
}

export function Lisianthus({ r, color, seed = 0 }: FlowerDrawProps) {
  const stroke = shade(color, 0.32);
  return (
    <g>
      {[0, 1, 2, 3, 4].map((k) => {
        const a = seed * 360 + k * 72;
        const [x, y] = pt(a, r * 0.44);
        return (
          <ellipse
            key={k}
            cx={n(x)}
            cy={n(y)}
            rx={n(r * 0.5)}
            ry={n(r * 0.39)}
            transform={`rotate(${n(a)} ${n(x)} ${n(y)})`}
            fill={color}
            stroke={stroke}
            strokeWidth={0.85}
            strokeOpacity={0.45}
          />
        );
      })}
      <circle r={n(r * 0.28)} fill={tint(color, 0.65)} />
      {[0, 1, 2, 3, 4].map((k) => {
        const [x, y] = pt(seed * 360 + 36 + k * 72, r * 0.16);
        return <circle key={k} cx={n(x)} cy={n(y)} r={n(r * 0.035)} fill={shade(color, 0.3)} fillOpacity={0.6} />;
      })}
      <circle r={n(r * 0.1)} fill={GOLD} />
    </g>
  );
}

export function Hydrangea({ r, color, seed = 0 }: FlowerDrawProps) {
  const stroke = shade(color, 0.3);
  const light = tint(color, 0.28);
  const florets = Array.from({ length: 13 }, (_, i) => {
    const t = Math.sqrt((i + 0.5) / 13);
    const a = i * 137.508 + seed * 360;
    const [x, y] = pt(a, t * r * 0.72);
    return { x, y, a, fill: i % 2 ? color : light };
  });
  return (
    <g>
      <circle r={r} fill={shade(color, 0.07)} stroke={stroke} strokeWidth={0.8} strokeOpacity={0.3} />
      {florets.map((f, i) => (
        <g key={i} transform={`translate(${n(f.x)} ${n(f.y)}) rotate(${n(f.a)})`}>
          {[0, 90, 180, 270].map((deg) => {
            const [px, py] = pt(deg + 45, r * 0.11);
            return (
              <circle key={deg} cx={n(px)} cy={n(py)} r={n(r * 0.12)} fill={f.fill} stroke={stroke} strokeWidth={0.5} strokeOpacity={0.35} />
            );
          })}
          <circle r={n(r * 0.035)} fill={shade(color, 0.35)} />
        </g>
      ))}
    </g>
  );
}

export const FLOWER_DRAW: Record<FlowerId, (props: FlowerDrawProps) => ReactElement> = {
  rosa: Rose,
  peonia: Peony,
  tulipan: Tulip,
  ranunculo: Ranunculus,
  lisianthus: Lisianthus,
  hortensia: Hydrangea,
};

/** Escala relativa de cada variedad dentro del ramo. */
export const FLOWER_SCALE: Record<FlowerId, number> = {
  rosa: 1,
  peonia: 1.14,
  tulipan: 0.92,
  ranunculo: 0.96,
  lisianthus: 0.94,
  hortensia: 1.12,
};

/** Ícono de una flor para las tarjetas de opción, pintado con la paleta actual. */
export function FlowerIcon({ flower, colors, className }: { flower: FlowerId; colors: [string, string, string]; className?: string }) {
  const Draw = FLOWER_DRAW[flower];
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      <circle r="48" fill={tint(colors[2], 0.4)} />
      <g transform="translate(14 14)" opacity="0.9">
        <Draw r={20} color={colors[2]} seed={0.4} />
      </g>
      <Draw r={30} color={colors[0]} seed={0.15} />
    </svg>
  );
}
