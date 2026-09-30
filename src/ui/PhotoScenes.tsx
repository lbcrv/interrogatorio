import { useId } from "react";
import type { Localized } from "@/game/types";

/**
 * The evidence photographs, drawn in code as black-and-white prints.
 * Each frame is 160 x 120. They show only what the evidence text already
 * says, so they never add a clue the player couldn't read.
 */
interface Frame {
  caption: Localized;
  /** The camera's date imprint in the corner. */
  stamp: string;
  draw: (id: string) => React.ReactNode;
}

const INK = "#171513";
const GLASS = "#e8e3d8";

/** Evidence marker tent with its number, as forensic photos have. */
function Marker({ n, x, y }: { n: number; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 14 L4 0 H16 L20 14 Z" fill="#d9d4c8" />
      <path d="M0 14 L20 14 L18 16 H2 Z" fill="#8f8a80" />
      <text x="10" y="11" fontSize="9" fontWeight="600" textAnchor="middle" fill={INK} fontFamily="var(--font-plex-mono), monospace">
        {n}
      </text>
    </g>
  );
}

/** A photo scale: alternating black and white centimetres. */
function Scale({ x, y, cm, vertical = false }: { x: number; y: number; cm: number; vertical?: boolean }) {
  const u = 5;
  return (
    <g transform={`translate(${x} ${y})${vertical ? " rotate(-90)" : ""}`}>
      <rect width={cm * u} height="5" fill="#e6e1d6" />
      {Array.from({ length: cm }, (_, i) => (i % 2 === 0 ? <rect key={i} x={i * u} width={u} height="5" fill={INK} /> : null))}
    </g>
  );
}

/** The gold crown as it reads on black-and-white film. */
function Crown({ fill, stones, x, y, s = 1 }: { fill: string; stones: string; x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-22 -4 L-11 8 L0 -12 L11 8 L22 -4 L19 18 H-19 Z" fill={fill} />
      <rect x="-19" y="20" width="38" height="7" rx="1" fill={fill} />
      <circle cx="-22" cy="-6" r="3" fill={fill} />
      <circle cx="0" cy="-14" r="3" fill={fill} />
      <circle cx="22" cy="-6" r="3" fill={fill} />
      {[-12, -4, 4, 12].map((cx) => (
        <circle key={cx} cx={cx} cy="23.5" r="2.4" fill={stones} />
      ))}
      <circle cx="0" cy="4" r="3.2" fill={stones} />
    </g>
  );
}

export const PHOTO_SCENES: Record<string, Frame[]> = {
  "fotos-escena": [
    {
      caption: { es: "Vitrina, puerta abierta", en: "Case, door open" },
      stamp: "5 22 07:10",
      draw: (id) => (
        <>
          <rect width="160" height="120" fill={`url(#${id}-wall)`} />
          <rect y="92" width="160" height="28" fill="#4a4640" />
          <rect x="20" y="86" width="120" height="7" fill="#2b2825" />
          <rect x="42" y="72" width="76" height="14" fill="#221f1c" />
          {/* The glass case; its front door hangs open to the left. */}
          <rect x="46" y="28" width="68" height="44" fill={GLASS} opacity="0.12" stroke={GLASS} strokeWidth="1.2" />
          <path d="M46 28 L46 72 L24 78 L24 34 Z" fill={GLASS} opacity="0.16" stroke={GLASS} strokeWidth="1" />
          <rect x="110" y="47" width="4" height="7" fill="#cfc9bd" />
          <ellipse cx="80" cy="69" rx="19" ry="5" fill="#1c1a18" />
          <ellipse cx="80" cy="67.5" rx="11" ry="2.6" fill="none" stroke="#4a4540" strokeWidth="1.4" />
          <path d="M60 34 L74 28" stroke="#fff" strokeWidth="1" opacity="0.35" />
          <Marker n={1} x={124} y={96} />
        </>
      ),
    },
    {
      caption: { es: "Cojín, marca de la corona", en: "Cushion, the crown's imprint" },
      stamp: "5 22 07:11",
      draw: () => (
        <>
          <rect width="160" height="120" fill="#24211e" />
          <rect x="26" y="16" width="108" height="74" rx="14" fill="#3c3834" />
          <rect x="26" y="16" width="108" height="74" rx="14" fill="none" stroke="#56514a" strokeWidth="2" />
          {/* Pressed velvet where the crown sat. */}
          <ellipse cx="80" cy="53" rx="30" ry="21" fill="#2f2b28" />
          <ellipse cx="80" cy="53" rx="30" ry="21" fill="none" stroke="#6a645c" strokeWidth="3" opacity="0.7" />
          <ellipse cx="80" cy="53" rx="20" ry="13" fill="none" stroke="#56514a" strokeWidth="1.2" opacity="0.6" />
          <Scale x={30} y={100} cm={14} />
          <Marker n={2} x={124} y={96} />
        </>
      ),
    },
    {
      caption: { es: "Mecha quemada, junto a la vitrina", en: "Burnt fuse, beside the case" },
      stamp: "5 22 07:12",
      draw: () => (
        <>
          <rect width="160" height="120" fill="#6f6a61" />
          {/* Floor tiles in perspective. */}
          <g stroke="#57524b" strokeWidth="1">
            {[-120, -60, 0, 60, 120, 180, 240].map((x) => (
              <line key={x} x1={80} y1={-60} x2={x} y2={120} />
            ))}
            {[22, 44, 72, 108].map((y) => (
              <line key={y} x1="0" y1={y} x2="160" y2={y} />
            ))}
          </g>
          <path d="M52 80 C60 70 68 86 78 76 C86 68 92 80 100 72" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="101" cy="71" r="3.4" fill="#0c0b0a" />
          <g fill="#2a2724">
            <circle cx="106" cy="74" r="0.9" />
            <circle cx="104" cy="67" r="0.7" />
            <circle cx="109" cy="70" r="0.6" />
          </g>
          <Scale x={46} y={92} cm={11} />
          <Scale x={46} y={92} cm={5} vertical />
          <Marker n={3} x={120} y={78} />
        </>
      ),
    },
  ],
  "fotos-lucia": [
    {
      caption: { es: "Luz normal, vitrina cerrada", en: "Normal light, case locked" },
      stamp: "5 21 23:07",
      draw: (id) => (
        <>
          <rect width="160" height="120" fill={`url(#${id}-dark)`} />
          <rect x="30" y="84" width="100" height="14" fill="#1d1b18" />
          <ellipse cx="80" cy="82" rx="30" ry="6" fill="#26231f" />
          <Crown fill="#cdc7ba" stones="#4a4640" x={80} y={56} />
          <rect x="34" y="18" width="92" height="66" fill="none" stroke={GLASS} strokeWidth="1.2" opacity="0.7" />
          <path d="M44 30 L70 20 M48 42 L90 24" stroke="#fff" strokeWidth="1.2" opacity="0.25" />
        </>
      ),
    },
    {
      caption: { es: "Luz ultravioleta", en: "Ultraviolet light" },
      stamp: "5 21 23:09",
      draw: () => (
        <>
          <rect width="160" height="120" fill="#0e0d0c" />
          <ellipse cx="80" cy="60" rx="56" ry="44" fill="#1b1917" />
          {/* Under the lamp the metal glows faintly; the stones stay dead black. */}
          <Crown fill="#5f5a52" stones="#050505" x={80} y={56} />
          <rect x="34" y="18" width="92" height="66" fill="none" stroke={GLASS} strokeWidth="0.8" opacity="0.2" />
          <text x="8" y="14" fontSize="8" fill="#8f8a80" fontFamily="var(--font-plex-mono), monospace">
            UV
          </text>
        </>
      ),
    },
    {
      caption: { es: "Ultravioleta, detalle de las piedras", en: "Ultraviolet, the stones up close" },
      stamp: "5 21 23:11",
      draw: () => (
        <>
          <rect width="160" height="120" fill="#0e0d0c" />
          <rect x="10" y="40" width="140" height="44" rx="4" fill="#5a554d" />
          <rect x="10" y="40" width="140" height="44" rx="4" fill="none" stroke="#7a746a" strokeWidth="1" />
          {[30, 62, 94, 126].map((cx) => (
            <g key={cx}>
              <circle cx={cx} cy="62" r="12" fill="#3a3631" />
              <circle cx={cx} cy="62" r="9" fill="#040404" />
            </g>
          ))}
          <text x="8" y="14" fontSize="8" fill="#8f8a80" fontFamily="var(--font-plex-mono), monospace">
            UV
          </text>
        </>
      ),
    },
  ],
};

/** One print, with film grain, the frame number and the camera's date imprint. */
export function PhotoFrame({ frame, n, showNumber = true }: { frame: Frame; n: number; showNumber?: boolean }) {
  const id = `ph${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <svg viewBox="0 0 160 120" className="block h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9a958b" />
          <stop offset="1" stopColor="#6d685f" />
        </linearGradient>
        <radialGradient id={`${id}-dark`} cx="50%" cy="45%" r="70%">
          <stop offset="0" stopColor="#4a4640" />
          <stop offset="1" stopColor="#1a1816" />
        </radialGradient>
        <filter id={`${id}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.22 0" />
        </filter>
      </defs>
      {frame.draw(id)}
      <rect width="160" height="120" filter={`url(#${id}-grain)`} />
      <text x="154" y="115" fontSize="7" textAnchor="end" fill="#d9544a" opacity="0.9" fontFamily="var(--font-plex-mono), monospace">
        {frame.stamp}
      </text>
      {showNumber && (
        <g transform="translate(4 106)">
          <rect width="10" height="10" fill="#f6f1e3" />
          <text x="5" y="8" fontSize="8" fontWeight="500" textAnchor="middle" fill={INK} fontFamily="var(--font-plex-mono), monospace">
            {n}
          </text>
        </g>
      )}
    </svg>
  );
}

