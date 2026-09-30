import { useId } from "react";
import type { Suspect } from "@/game/types";
import { PaperClip } from "./Doc";

/**
 * Booking photos drawn in code: a faceless silhouette against a height chart,
 * holding the file's name board. No generated portraits, only shapes.
 * Coordinates are in a 200 x 300 frame, 4 px per centimetre, with 190 cm at
 * y=20: a head-and-shoulders crop where each person's crown sits at their height.
 */
const CM = 4;
const TOP_CM = 190;
const TOP_Y = 20;
const yAt = (cm: number) => TOP_Y + (TOP_CM - cm) * CM;
/** The name board is held just under the chin, this far below the crown. */
const BOARD_BELOW_CROWN = 112;

interface Figure {
  heightCm: number;
  /** Solid shapes, drawn with the crown at y=0 and centred on x=100. */
  body: string[];
  /** Light strokes on top of the silhouette, like glasses catching the flash. */
  glints?: string[];
}

/** Neck, sloping trapezius and shoulders; `broad` scales the width. */
function torso(broad: number, neckTop: number, neckHalf: number): string {
  const n = neckHalf;
  const base = neckTop + 20;
  const shoulder = 72 * broad;
  return `M${100 - n} ${neckTop} L${100 - n} ${base}
    C${100 - n - 14} ${base + 8} ${100 - shoulder + 12} ${base + 12} ${100 - shoulder} ${base + 24}
    C${100 - shoulder - 14} ${base + 30} ${100 - shoulder - 20} ${base + 50} ${100 - shoulder - 22} ${base + 80} L${100 - shoulder - 24} 400
    L${100 + shoulder + 24} 400 L${100 + shoulder + 22} ${base + 80}
    C${100 + shoulder + 20} ${base + 50} ${100 + shoulder + 14} ${base + 30} ${100 + shoulder} ${base + 24}
    C${100 + shoulder - 12} ${base + 12} ${100 + n + 14} ${base + 8} ${100 + n} ${base} L${100 + n} ${neckTop} Z`;
}

/** Cranium wider than the jaw, so it reads as a head and not an egg. */
function head(top: number, halfWidth: number, chin: number): string {
  const w = halfWidth;
  return `M100 ${top} C${100 + w + 6} ${top} ${100 + w + 4} ${top + 38} ${100 + w - 2} ${top + 52}
    C${100 + w - 8} ${chin - 10} ${100 + 12} ${chin} 100 ${chin}
    C${100 - 12} ${chin} ${100 - w + 8} ${chin - 10} ${100 - w + 2} ${top + 52}
    C${100 - w - 4} ${top + 38} ${100 - w - 6} ${top} 100 ${top} Z`;
}

function ears(y: number, halfWidth: number, size = 1): string[] {
  const x = halfWidth - 1;
  const h = 16 * size;
  return [
    `M${100 - x} ${y} C${100 - x - 8 * size} ${y - 2} ${100 - x - 9 * size} ${y + h} ${100 - x + 1} ${y + h + 2} Z`,
    `M${100 + x} ${y} C${100 + x + 8 * size} ${y - 2} ${100 + x + 9 * size} ${y + h} ${100 + x - 1} ${y + h + 2} Z`,
  ];
}

const FIGURES: Record<string, Figure> = {
  // 58, broad, the coffee grower's hat with a pinched crown and the brim turned up.
  aurelio: {
    heightCm: 170,
    body: [
      torso(1.08, 78, 15),
      head(14, 31, 94),
      ...ears(46, 31),
      "M73 28 C71 12 80 -2 91 0 C95 4 105 4 109 0 C120 -2 129 12 127 28 Z",
      "M30 32 C38 20 56 27 100 27 C144 27 162 20 170 32 C158 41 42 41 30 32 Z",
    ],
  },
  // 34, slighter, hair up in a bun, glasses.
  lucia: {
    heightCm: 162,
    body: [
      torso(0.82, 82, 11),
      head(16, 27, 94),
      ...ears(50, 27, 0.85),
      "M100 -3 C112 -3 118 5 118 12 C118 20 111 24 100 24 C89 24 82 20 82 12 C82 5 88 -3 100 -3 Z",
      "M73 50 C69 28 82 12 100 12 C118 12 131 28 127 50 C121 34 112 26 100 26 C88 26 79 34 73 50 Z",
    ],
    glints: ["M81 52 a8 7 0 1 0 16 0 a8 7 0 1 0 -16 0", "M103 52 a8 7 0 1 0 16 0 a8 7 0 1 0 -16 0", "M97 51 C99 49 101 49 103 51"],
  },
  // 22, thin, big ears, hair that never saw a comb.
  neto: {
    heightCm: 176,
    body: [
      torso(0.8, 80, 10),
      head(12, 27, 92),
      ...ears(44, 27, 1.15),
      "M72 42 C64 22 76 4 88 8 C90 -2 101 -4 105 5 C111 -3 124 1 121 12 C134 12 136 30 128 42 C124 28 114 22 100 22 C86 22 76 28 72 42 Z",
    ],
  },
};

export function Mugshot({
  suspect,
  index,
  caption = true,
  className = "",
}: {
  suspect: Suspect;
  index: number;
  caption?: boolean;
  className?: string;
}) {
  const figure = FIGURES[suspect.id];
  const surname = suspect.name.split(/\s+/).pop()!.toUpperCase();
  const top = yAt(figure?.heightCm ?? 170);
  // Unique per photo: the page can hold two copies (beside the file and inside the card), and
  // gradients shared by id would resolve to the hidden one and not paint.
  const id = `mug${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <figure className={`relative bg-white p-2 pb-3 shadow-(--shadow) ${className}`}>
      <PaperClip className="absolute -top-4 left-6 z-10 h-12 w-5" />
      <svg viewBox="0 0 200 300" className="anim-develop block w-full" role="img" aria-label={suspect.name}>
        <defs>
          <radialGradient id={`${id}-wall`} cx="42%" cy="38%" r="80%">
            <stop offset="0" stopColor="#d4d0c6" />
            <stop offset="1" stopColor="#99948a" />
          </radialGradient>
          {/* Flash from the left: the near shoulder catches a little light. */}
          <linearGradient id={`${id}-body`} x1="0" x2="1" y1="0" y2="0.2">
            <stop offset="0" stopColor="#35312c" />
            <stop offset="0.45" stopColor="#1d1b17" />
            <stop offset="1" stopColor="#121110" />
          </linearGradient>
          <filter id={`${id}-soft`}>
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>
        <rect width="200" height="300" fill={`url(#${id}-wall)`} />

        {/* Height chart, one line per 5 cm, labelled every 10. */}
        <g stroke="#6f6a61" strokeWidth="0.6">
          {Array.from({ length: 13 }, (_, i) => {
            const cm = 130 + i * 5;
            const y = yAt(cm);
            return <line key={cm} x1={cm % 10 === 0 ? 0 : 10} x2="200" y1={y} y2={y} opacity={cm % 10 === 0 ? 0.9 : 0.45} />;
          })}
        </g>
        <g fill="#4f4b44" fontFamily="var(--font-plex-mono), monospace" fontSize="8">
          {[130, 140, 150, 160, 170, 180, 190].map((cm) => (
            <text key={cm} x="4" y={yAt(cm) - 2}>
              {cm}
            </text>
          ))}
        </g>

        {figure && (
          <>
            {/* The person's shadow on the wall behind them. */}
            <g transform={`translate(12 ${top + 6})`} fill="#1d1b17" opacity="0.28" filter={`url(#${id}-soft)`}>
              {figure.body.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <g transform={`translate(0 ${top})`}>
              <g fill={`url(#${id}-body)`}>
                {figure.body.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              {figure.glints && (
                <g fill="none" stroke="#8f8a80" strokeWidth="1.1" opacity="0.8">
                  {figure.glints.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              )}
            </g>
          </>
        )}

        {/* The name board held under the chin. */}
        <g transform={`translate(46 ${top + BOARD_BELOW_CROWN})`}>
          <rect width="108" height="44" fill="#141311" />
          <rect x="3" y="3" width="102" height="38" fill="none" stroke="#e9e3d3" strokeWidth="0.6" opacity="0.5" />
          <g fill="#e9e3d3" fontFamily="var(--font-plex-mono), monospace" textAnchor="middle">
            <text x="54" y="15" fontSize="7" letterSpacing="1.5">
              FISCALÍA REG.
            </text>
            <text x="54" y="27" fontSize="10" letterSpacing="1" fontWeight="500">
              {surname}
            </text>
            <text x="54" y="37" fontSize="7" letterSpacing="1.5">
              0522-SR · {String(index + 1).padStart(2, "0")}
            </text>
          </g>
        </g>
      </svg>
      {caption && figure && <figcaption className="label mt-2 text-center text-[0.6rem]">{figure.heightCm} cm</figcaption>}
    </figure>
  );
}
