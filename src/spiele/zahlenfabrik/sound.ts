/**
 * Töne der Zahlenfabrik: kurze, selbst erzeugte Klänge (Web Audio, keine
 * Dateien, nichts aus dem Netz). Standardmäßig aus; die Einstellung bleibt im
 * Browser. Viele gleiche Töne kurz hintereinander werden zusammengefasst.
 */
export type SoundKind = 'place' | 'remove' | 'deliver' | 'error' | 'win' | 'order' | 'buy';

const STORE = 'spiel:zahlenfabrik:ton';

/** Tonfolgen: [Frequenz in Hz, Dauer in s, Abstand vom Start in s]. */
const NOTES: Record<SoundKind, [number, number, number][]> = {
  place: [[660, 0.06, 0]],
  remove: [[330, 0.07, 0]],
  deliver: [[880, 0.05, 0], [1175, 0.06, 0.05]],
  buy: [[523, 0.08, 0], [784, 0.1, 0.08]],
  error: [[196, 0.18, 0], [165, 0.22, 0.12]],
  win: [[523, 0.1, 0], [659, 0.1, 0.1], [784, 0.1, 0.2], [1047, 0.22, 0.3]],
  order: [[784, 0.08, 0], [988, 0.08, 0.08], [1175, 0.08, 0.16], [1568, 0.25, 0.24]],
};

export interface Sound {
  readonly on: boolean;
  set(on: boolean): void;
  play(kind: SoundKind): void;
}

export function createSound(): Sound {
  let on = false;
  try {
    on = localStorage.getItem(STORE) === '1';
  } catch {
    on = false;
  }
  let ctx: AudioContext | null = null;
  const last: Partial<Record<SoundKind, number>> = {};

  function audio(): AudioContext | null {
    if (ctx) return ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  }

  return {
    get on() {
      return on;
    },
    set(value: boolean) {
      on = value;
      try {
        localStorage.setItem(STORE, value ? '1' : '0');
      } catch {
        // ohne Speicher: nur für diesen Besuch
      }
      if (on) audio()?.resume().catch(() => {});
    },
    play(kind: SoundKind) {
      if (!on) return;
      const now = performance.now();
      // gleiche Töne höchstens alle 90 ms
      if (now - (last[kind] ?? 0) < 90) return;
      last[kind] = now;
      const a = audio();
      if (!a) return;
      const t0 = a.currentTime;
      for (const [freq, dur, at] of NOTES[kind]) {
        const osc = a.createOscillator();
        const gain = a.createGain();
        osc.type = kind === 'error' ? 'sawtooth' : 'triangle';
        osc.frequency.value = freq;
        // weich ein- und ausblenden, leise
        gain.gain.setValueAtTime(0, t0 + at);
        gain.gain.linearRampToValueAtTime(kind === 'error' ? 0.05 : 0.08, t0 + at + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur);
        osc.connect(gain).connect(a.destination);
        osc.start(t0 + at);
        osc.stop(t0 + at + dur + 0.02);
      }
    },
  };
}
