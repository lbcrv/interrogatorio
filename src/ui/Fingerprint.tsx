/** Small seeded PRNG (mulberry32) so a suspect always gets the same print. */
function rng(seed: string) {
  let h = 1779033703;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 3432918353);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ridges as broken, wobbling loops around a drifting core. */
function ridges(seed: string): string[] {
  const rand = rng(seed);
  const phase = [rand() * 6.28, rand() * 6.28, rand() * 6.28];
  const drift = 0.3 + rand() * 0.5;
  const paths: string[] = [];

  for (let ring = 0; ring < 15; ring++) {
    const r = 2.5 + ring * 2.1;
    const cy = 30 - ring * drift;
    let d = "";
    let pen = false;
    for (let step = 0; step <= 72; step++) {
      const a = (step / 72) * Math.PI * 2;
      // A gap here and there so ridges end and fork like real ones.
      if (rand() < 0.05) {
        pen = false;
        continue;
      }
      const wobble = 1 + 0.07 * Math.sin(3 * a + phase[0]) + 0.05 * Math.sin(5 * a + phase[1] + ring * 0.4) + 0.03 * Math.sin(8 * a + phase[2]);
      const x = 25 + Math.cos(a) * r * 0.78 * wobble;
      const y = cy + Math.sin(a) * r * wobble;
      d += `${pen ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
      pen = true;
    }
    paths.push(d);
  }
  return paths;
}

export function Fingerprint({ seed, className = "" }: { seed: string; className?: string }) {
  const id = `fp-${seed.replace(/\W/g, "")}`;
  return (
    <svg viewBox="0 0 50 60" className={className} aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <ellipse cx="25" cy="30" rx="19" ry="25" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`} fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" opacity="0.72">
        {ridges(seed).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
