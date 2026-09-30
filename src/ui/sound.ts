/**
 * Office sounds, synthesized with Web Audio: no audio files, nothing to license.
 * key: a typewriter key, for the suspect's reply. bell: the carriage bell at the end of a line.
 * type / space / return: the player's own keys, quieter than the reply, and the carriage
 * pulled back when a question is sent.
 * paper: a sheet handled. slap: a document put down on the table.
 * pen: a few marker strokes. thud: the rubber stamp.
 */
export type Cue = "key" | "bell" | "type" | "space" | "return" | "paper" | "slap" | "pen" | "thud";

const STORAGE_KEY = "interrogatorio:sound";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = true;
let loaded = false;
const listeners = new Set<() => void>();

function loadPreference() {
  if (loaded) return;
  loaded = true;
  try {
    enabled = localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // Storage can be unavailable; sound stays on.
  }
}

export function soundEnabled(): boolean {
  loadPreference();
  return enabled;
}

export function setSoundEnabled(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Remembered for this visit only.
  }
  listeners.forEach((l) => l());
}

export function subscribeSound(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Browsers only allow audio after the player has interacted with the page, so the context is created on first use. */
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Noise through one filter, shaped by a quick envelope. */
function burst(a: AudioContext, at: number, opts: { type: BiquadFilterType; freq: number; q?: number; peak: number; attack: number; decay: number; sweepTo?: number }) {
  const src = a.createBufferSource();
  src.buffer = noise;
  const filter = a.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(opts.freq, at);
  if (opts.sweepTo) filter.frequency.exponentialRampToValueAtTime(opts.sweepTo, at + opts.attack + opts.decay);
  filter.Q.value = opts.q ?? 1;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(opts.peak, at + opts.attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + opts.attack + opts.decay);
  src.connect(filter).connect(gain).connect(master!);
  src.start(at, Math.random() * 0.5, opts.attack + opts.decay + 0.05);
}

/** A short pitched body under the noise, so hits feel like they have weight. */
function tone(a: AudioContext, at: number, opts: { type: OscillatorType; from: number; to?: number; peak: number; decay: number }) {
  const osc = a.createOscillator();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, at);
  if (opts.to) osc.frequency.exponentialRampToValueAtTime(opts.to, at + opts.decay);
  const gain = a.createGain();
  gain.gain.setValueAtTime(opts.peak, at);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + opts.decay);
  osc.connect(gain).connect(master!);
  osc.start(at);
  osc.stop(at + opts.decay + 0.05);
}

export function play(cue: Cue): void {
  if (!soundEnabled()) return;
  const a = audio();
  if (!a || !master || !noise) return;
  const t = a.currentTime + 0.005;
  const r = Math.random();

  switch (cue) {
    case "key":
      burst(a, t, { type: "bandpass", freq: 1900 + r * 1500, q: 1.4, peak: 0.32, attack: 0.002, decay: 0.035 });
      tone(a, t, { type: "triangle", from: 150 + r * 50, peak: 0.18, decay: 0.035 });
      break;
    case "type":
      burst(a, t, { type: "bandpass", freq: 2100 + r * 1600, q: 1.4, peak: 0.15, attack: 0.002, decay: 0.03 });
      tone(a, t, { type: "triangle", from: 160 + r * 60, peak: 0.08, decay: 0.03 });
      break;
    case "space":
      burst(a, t, { type: "bandpass", freq: 900 + r * 200, q: 1, peak: 0.14, attack: 0.003, decay: 0.05 });
      tone(a, t, { type: "triangle", from: 105, peak: 0.1, decay: 0.05 });
      break;
    case "return":
      // The ratchet of the carriage sliding back, then it knocks against the stop.
      for (let i = 0; i < 7; i++) {
        burst(a, t + i * 0.028, { type: "bandpass", freq: 2600 - i * 120, q: 2, peak: 0.07, attack: 0.002, decay: 0.018 });
      }
      burst(a, t, { type: "lowpass", freq: 1800, sweepTo: 600, peak: 0.05, attack: 0.05, decay: 0.16 });
      burst(a, t + 0.22, { type: "lowpass", freq: 1200, peak: 0.3, attack: 0.002, decay: 0.07 });
      tone(a, t + 0.22, { type: "triangle", from: 130, to: 80, peak: 0.16, decay: 0.08 });
      break;
    case "bell":
      tone(a, t, { type: "sine", from: 2093, peak: 0.1, decay: 1.2 });
      tone(a, t, { type: "sine", from: 4186, peak: 0.03, decay: 0.7 });
      break;
    case "paper":
      burst(a, t, { type: "bandpass", freq: 700, sweepTo: 3200, q: 0.7, peak: 0.16, attack: 0.04, decay: 0.24 });
      break;
    case "slap":
      burst(a, t, { type: "lowpass", freq: 1400, peak: 0.45, attack: 0.003, decay: 0.09 });
      tone(a, t, { type: "sine", from: 95, to: 60, peak: 0.3, decay: 0.1 });
      break;
    case "pen":
      for (let i = 0; i < 6; i++) {
        burst(a, t + i * 0.07 + Math.random() * 0.03, { type: "highpass", freq: 2600, peak: 0.05, attack: 0.01, decay: 0.05 });
      }
      break;
    case "thud":
      tone(a, t, { type: "sine", from: 120, to: 45, peak: 0.7, decay: 0.28 });
      burst(a, t, { type: "lowpass", freq: 520, peak: 0.5, attack: 0.004, decay: 0.12 });
      break;
  }
}

/** Plays a cue after `ms`, for sounds that land with an animation. */
export function playAt(cue: Cue, ms: number): () => void {
  const id = window.setTimeout(() => play(cue), ms);
  return () => window.clearTimeout(id);
}
