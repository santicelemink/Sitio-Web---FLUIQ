import { memo, useId, useMemo } from "react";
import type { FlowerId, PaletteId, RibbonId, SizeId, WrapId } from "@/types";
import { PALETTE_BY_ID, RIBBON_BY_ID, SIZE_BY_ID, WRAP_BY_ID } from "@/data/catalog";
import { describeBouquet } from "@/lib/bouquet";
import { shade, tint } from "@/lib/color";
import { cn } from "@/lib/utils";
import { FLOWER_DRAW, FLOWER_SCALE } from "./flowers";

export interface BouquetPreviewProps {
  palette: PaletteId;
  flowers: FlowerId[];
  size: SizeId;
  wrap: WrapId;
  ribbon: RibbonId;
  className?: string;
  /** Texto alternativo; por defecto se genera a partir de la configuración. */
  label?: string;
  /** Oculta el ramo a lectores de pantalla cuando ya hay un texto equivalente al lado. */
  decorative?: boolean;
}

const W = 400;
const H = 480;
const CX = W / 2;
const GOLDEN = 2.39996;
const LEAF_A = "#A9BFA0";
const LEAF_B = "#93AC8C";
const STEM = "#8DA684";

/** Pseudoaleatorio determinístico: el mismo ramo siempre se dibuja igual. */
function hash(i: number, salt = 0) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const RX: Record<SizeId, number> = { petite: 96, clasico: 116, abundante: 138 };
const r2 = (v: number) => Math.round(v * 10) / 10;

interface PlacedFlower {
  key: number;
  kind: FlowerId;
  x: number;
  y: number;
  r: number;
  rotate: number;
  color: string;
  seed: number;
}

function layoutFlowers(flowers: FlowerId[], colors: string[], size: SizeId, cy: number, squash: number) {
  const count = SIZE_BY_ID[size].stems;
  const rx = RX[size];
  const ry = rx * 0.74 * squash;
  const flowerR = Math.sqrt((Math.PI * rx * ry) / count / Math.PI) * 1.24;
  const placed: PlacedFlower[] = [];
  for (let i = 0; i < count; i++) {
    const t = Math.sqrt((i + 0.5) / count);
    const angle = i * GOLDEN;
    const kind = flowers[i % flowers.length];
    const isTulip = kind === "tulipan";
    const scale = FLOWER_SCALE[kind] * (1 - 0.13 * t) * (0.92 + hash(i, 1) * 0.16);
    placed.push({
      key: i,
      kind,
      x: CX + Math.cos(angle) * t * rx * 0.8,
      y: cy + Math.sin(angle) * t * ry * 0.8,
      r: flowerR * scale,
      rotate: isTulip ? (hash(i, 2) - 0.5) * 36 : hash(i, 2) * 360,
      color: colors[(i + Math.floor(i / 3)) % 3],
      seed: hash(i, 3),
    });
  }
  // Ordenadas por Y: las de abajo quedan delante y se superponen con naturalidad.
  placed.sort((a, b) => a.y - b.y);
  return { placed, rx, ry, flowerR };
}

function Eucalyptus({ x, y, angle, length, seed }: { x: number; y: number; angle: number; length: number; seed: number }) {
  const bend = (seed - 0.5) * length * 0.5;
  const leaves = [0.18, 0.32, 0.46, 0.6, 0.74, 0.88, 1];
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${r2(angle)})`}>
      <path d={`M 0 0 Q ${r2(bend)} ${r2(-length / 2)} ${r2(bend * 0.6)} ${r2(-length)}`} fill="none" stroke={shade(LEAF_B, 0.25)} strokeWidth={1.4} strokeLinecap="round" />
      {leaves.map((t, i) => {
        const side = i % 2 ? 1 : -1;
        const lx = bend * 2 * t * (1 - t) + bend * 0.6 * t * t + side * (7 - t * 2.5);
        const ly = -length * t;
        const lr = 8.6 - t * 3.6;
        return (
          <circle
            key={i}
            cx={r2(lx)}
            cy={r2(ly)}
            r={r2(lr)}
            fill={i % 2 ? LEAF_A : LEAF_B}
            stroke={shade(LEAF_B, 0.3)}
            strokeWidth={0.6}
            strokeOpacity={0.35}
          />
        );
      })}
    </g>
  );
}

function Foliage({ cy, rx, ry, count }: { cy: number; rx: number; ry: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        // Abanico de ramas desde el centro hacia afuera, sobre todo arriba y a los costados.
        const spread = 250;
        const angle = -spread / 2 + (spread / (count - 1)) * i + (hash(i, 5) - 0.5) * 14;
        const radA = ((angle - 90) * Math.PI) / 180;
        const dist = 0.55;
        return (
          <Eucalyptus
            key={i}
            x={CX + Math.cos(radA) * rx * dist}
            y={cy + Math.sin(radA) * ry * dist}
            angle={angle}
            length={rx * (0.52 + hash(i, 6) * 0.2)}
            seed={hash(i, 7)}
          />
        );
      })}
    </g>
  );
}

function Filler({ cy, rx, ry, count }: { cy: number; rx: number; ry: number; count: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + hash(i, 8) * 0.5 - Math.PI / 2;
        const x = CX + Math.cos(a) * rx * 0.86;
        const y = cy + Math.sin(a) * ry * 0.86;
        return (
          <g key={i}>
            {[0, 1, 2, 3].map((k) => (
              <circle
                key={k}
                cx={r2(x + Math.cos(k * 1.7 + i) * 6)}
                cy={r2(y + Math.sin(k * 1.7 + i) * 6)}
                r={2.4}
                fill="#FFFFFF"
                stroke="#D9D0C2"
                strokeWidth={0.6}
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}

function Flowers({ placed }: { placed: PlacedFlower[] }) {
  return (
    <g>
      {placed.map((f) => {
        const Draw = FLOWER_DRAW[f.kind];
        return (
          <g key={f.key} transform={`translate(${r2(f.x)} ${r2(f.y)})`}>
            <circle cy={r2(f.r * 0.12)} r={r2(f.r * 0.96)} fill="#2F2A2C" fillOpacity={0.06} />
            <g transform={`rotate(${r2(f.rotate)})`}>
              <Draw r={f.r} color={f.color} seed={f.seed} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

function Bow({ x, y, color, scale = 1 }: { x: number; y: number; color: string; scale?: number }) {
  const stroke = shade(color, 0.32);
  const light = tint(color, 0.3);
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) scale(${scale})`}>
      {/* colas */}
      <path d="M -3 2 L -19 46 L -11 41 L -6 48 L 3 3 Z" fill={color} stroke={stroke} strokeWidth={0.8} strokeOpacity={0.5} strokeLinejoin="round" />
      <path d="M 3 2 L 22 43 L 13 40 L 9 47 L -2 3 Z" fill={shade(color, 0.06)} stroke={stroke} strokeWidth={0.8} strokeOpacity={0.5} strokeLinejoin="round" />
      {/* lazos */}
      <path d="M 0 0 C -16 -22 -44 -20 -40 -4 C -37 9 -14 8 0 0 Z" fill={color} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.55} />
      <path d="M 0 0 C 16 -22 44 -20 40 -4 C 37 9 14 8 0 0 Z" fill={color} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.55} />
      <path d="M -4 -1 C -14 -12 -30 -12 -31 -5" fill="none" stroke={light} strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
      <path d="M 4 -1 C 14 -12 30 -12 31 -5" fill="none" stroke={light} strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />
      <ellipse rx={6.5} ry={7.5} fill={shade(color, 0.08)} stroke={stroke} strokeWidth={0.9} strokeOpacity={0.6} />
    </g>
  );
}

function PaperBack({ cy, rx, ry, neckY, color }: { cy: number; rx: number; ry: number; neckY: number; color: string }) {
  const back = shade(color, 0.1);
  const L = CX - rx * 1.22;
  const R = CX + rx * 1.22;
  const sideY = cy - ry * 0.42;
  const d = `M ${CX - 28} ${neckY} L ${r2(L)} ${r2(sideY)} Q ${r2(CX - rx * 0.72)} ${r2(cy - ry * 1.32)} ${CX} ${r2(cy - ry * 1.1)} Q ${r2(CX + rx * 0.72)} ${r2(cy - ry * 1.32)} ${r2(R)} ${r2(sideY)} L ${CX + 28} ${neckY} Z`;
  return (
    <g>
      <path d={d} fill={back} stroke={shade(color, 0.3)} strokeWidth={1} strokeOpacity={0.35} strokeLinejoin="round" />
      <path d={`M ${CX} ${neckY - 6} L ${CX} ${r2(cy - ry * 1.05)}`} stroke={shade(color, 0.22)} strokeWidth={0.8} strokeOpacity={0.25} />
    </g>
  );
}

function PaperFront({ cy, rx, ry, neckY, color }: { cy: number; rx: number; ry: number; neckY: number; color: string }) {
  const stroke = shade(color, 0.3);
  const lightFlap = tint(color, 0.25);
  const topL = cy + ry * 0.5;
  const right = `M ${r2(CX + rx * 1.06)} ${r2(topL)} Q ${r2(CX + rx * 0.3)} ${r2(cy + ry * 0.86)} ${r2(CX - rx * 0.32)} ${r2(cy + ry * 1.02)} L ${CX - 26} ${neckY} L ${CX + 30} ${neckY} Z`;
  const left = `M ${r2(CX - rx * 1.06)} ${r2(topL)} Q ${r2(CX - rx * 0.25)} ${r2(cy + ry * 0.84)} ${r2(CX + rx * 0.42)} ${r2(cy + ry * 0.96)} L ${CX + 24} ${neckY} L ${CX - 30} ${neckY} Z`;
  const pleats = [0.25, 0.5, 0.75].map((t, i) => {
    const x0 = CX - rx * 1.06 + (rx * 1.48) * t;
    const y0 = topL + (cy + ry * 0.96 - topL) * t * 0.95 + 4;
    return <path key={i} d={`M ${r2(x0)} ${r2(y0)} L ${r2(CX - 16 + t * 30)} ${neckY - 2}`} stroke={stroke} strokeWidth={0.8} strokeOpacity={0.28} />;
  });
  return (
    <g>
      <path d={right} fill={color} stroke={stroke} strokeWidth={1} strokeOpacity={0.4} strokeLinejoin="round" />
      <path d={left} fill={lightFlap} stroke={stroke} strokeWidth={1} strokeOpacity={0.45} strokeLinejoin="round" />
      {pleats}
    </g>
  );
}

function Stems({ neckY }: { neckY: number }) {
  return (
    <g>
      {[-15, -9, -3, 3, 9, 15].map((dx, i) => (
        <path
          key={i}
          d={`M ${CX + dx * 0.6} ${neckY - 12} L ${r2(CX + dx * 1.45)} ${r2(neckY + 70 + hash(i, 9) * 14)}`}
          stroke={i % 2 ? STEM : shade(STEM, 0.12)}
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      ))}
    </g>
  );
}

function HatBox({
  part,
  yTop,
  half,
  color,
  ribbon,
  gradientId,
}: {
  part: "back" | "front";
  yTop: number;
  half: number;
  color: string;
  ribbon: string;
  gradientId: string;
}) {
  const e = half * 0.22;
  const height = half * 1.12;
  const yBot = yTop + height;
  const L = CX - half;
  const R = CX + half;
  if (part === "back") {
    return <ellipse cx={CX} cy={yTop} rx={half} ry={e} fill={shade(color, 0.2)} stroke={shade(color, 0.32)} strokeWidth={1} strokeOpacity={0.4} />;
  }
  const bandY = yTop + 22;
  const bandH = 15;
  const stroke = shade(color, 0.3);
  return (
    <g>
      <ellipse cx={CX} cy={yBot + e + 6} rx={half * 0.92} ry={9} fill="#2F2A2C" fillOpacity={0.07} />
      <path
        d={`M ${L} ${yTop} A ${half} ${e} 0 0 0 ${R} ${yTop} L ${R} ${yBot} A ${half} ${e} 0 0 1 ${L} ${yBot} Z`}
        fill={`url(#${gradientId})`}
        stroke={stroke}
        strokeWidth={1}
        strokeOpacity={0.4}
      />
      <path d={`M ${L} ${yTop} A ${half} ${e} 0 0 0 ${R} ${yTop}`} fill="none" stroke={tint(color, 0.6)} strokeWidth={2.2} />
      <path
        d={`M ${L} ${bandY} A ${half} ${e} 0 0 0 ${R} ${bandY} L ${R} ${bandY + bandH} A ${half} ${e} 0 0 1 ${L} ${bandY + bandH} Z`}
        fill={ribbon}
        stroke={shade(ribbon, 0.3)}
        strokeWidth={0.8}
        strokeOpacity={0.45}
      />
      <text
        x={CX}
        y={r2(yTop + e + height * 0.58)}
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontStyle="italic"
        fontSize={r2(half * 0.34)}
        fill={shade(color, 0.5)}
        letterSpacing="0.5"
      >
        Lisboa
      </text>
      <Bow x={CX + half * 0.52} y={bandY + bandH / 2 + e * 0.82} color={ribbon} scale={0.62} />
    </g>
  );
}

function BouquetPreviewBase({ palette, flowers, size, wrap, ribbon, className, label, decorative }: BouquetPreviewProps) {
  const rawId = useId();
  const gradientId = `box-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const colors = PALETTE_BY_ID[palette].colors;
  const wrapInfo = WRAP_BY_ID[wrap];
  const ribbonColor = RIBBON_BY_ID[ribbon].color;
  const isBox = wrapInfo.kind === "box";

  const scene = useMemo(() => {
    const cy = isBox ? 196 : 176;
    const { placed, rx, ry } = layoutFlowers(flowers, colors, size, cy, isBox ? 0.78 : 1);
    const neckY = Math.round(cy + ry + 58 + rx * 0.24);
    const foliageCount = size === "petite" ? 6 : size === "clasico" ? 8 : 10;
    return { cy, placed, rx, ry, neckY, foliageCount };
  }, [flowers, colors, size, isBox]);

  const { cy, placed, rx, ry, neckY, foliageCount } = scene;
  const boxHalf = rx * 1.04;
  const boxTop = cy + ry * 0.42;
  const description = label ?? describeBouquet({ palette, flowers, size, wrap });
  const renderKey = `${palette}-${flowers.join(".")}-${size}-${wrap}-${ribbon}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn("block h-full w-full", className)}
      {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": description })}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={shade(wrapInfo.color, 0.1)} />
          <stop offset="0.35" stopColor={tint(wrapInfo.color, 0.35)} />
          <stop offset="0.7" stopColor={wrapInfo.color} />
          <stop offset="1" stopColor={shade(wrapInfo.color, 0.12)} />
        </linearGradient>
      </defs>
      <g key={renderKey} className="animate-fade-in">
        {isBox ? (
          <HatBox part="back" yTop={boxTop} half={boxHalf} color={wrapInfo.color} ribbon={ribbonColor} gradientId={gradientId} />
        ) : (
          <PaperBack cy={cy} rx={rx} ry={ry} neckY={neckY} color={wrapInfo.color} />
        )}
        <Foliage cy={cy} rx={rx} ry={ry} count={foliageCount} />
        <Filler cy={cy} rx={rx} ry={ry} count={foliageCount + 2} />
        {!isBox && <Stems neckY={neckY} />}
        <Flowers placed={placed} />
        {isBox ? (
          <HatBox part="front" yTop={boxTop} half={boxHalf} color={wrapInfo.color} ribbon={ribbonColor} gradientId={gradientId} />
        ) : (
          <>
            <PaperFront cy={cy} rx={rx} ry={ry} neckY={neckY} color={wrapInfo.color} />
            <rect x={CX - 31} y={neckY - 9} width={62} height={10} rx={3} fill={ribbonColor} stroke={shade(ribbonColor, 0.3)} strokeWidth={0.8} strokeOpacity={0.45} />
            <Bow x={CX} y={neckY - 4} color={ribbonColor} />
          </>
        )}
      </g>
    </svg>
  );
}

export const BouquetPreview = memo(BouquetPreviewBase);

/** Fondo radial tomado de la paleta, para escenarios y miniaturas. */
export function paletteBackground(palette: PaletteId) {
  const [a, , c] = PALETTE_BY_ID[palette].colors;
  return `radial-gradient(120% 95% at 50% 32%, #FFFFFF 0%, ${tint(c, 0.25)} 38%, ${tint(a, 0.35)} 100%)`;
}
