/**
 * Rechenlogik „Elektromagnetischer Schwingkreis“: Kondensator C, Spule L und
 * Widerstand R in Reihe. Zur Zeit t = 0 ist der Kondensator auf U₀ geladen,
 * es fließt noch kein Strom. Die Ladung q(t) folgt
 *   L · q'' + R · q' + q / C = 0.
 * Dazu die Selbstinduktion beim Ein- und Ausschalten einer Spule.
 */

/** Eigenkreisfrequenz ω₀ = 1/√(LC) in 1/s. */
export function omega0(L: number, C: number): number {
  return 1 / Math.sqrt(L * C);
}

/** Thomson-Gleichung: T = 2π · √(L · C) in s (ungedämpft). */
export function thomsonPeriod(L: number, C: number): number {
  return 2 * Math.PI * Math.sqrt(L * C);
}

/** Abklingkonstante δ = R / (2L) in 1/s. */
export function decay(R: number, L: number): number {
  return R / (2 * L);
}

export type DampingCase = 'none' | 'weak' | 'critical' | 'strong';

/** Art der Dämpfung: ungedämpft, schwach (schwingt), aperiodischer Grenzfall, Kriechfall. */
export function dampingCase(L: number, C: number, R: number): DampingCase {
  if (R <= 0) return 'none';
  const d = decay(R, L);
  const w0 = omega0(L, C);
  if (Math.abs(d - w0) < 1e-9 * w0) return 'critical';
  return d < w0 ? 'weak' : 'strong';
}

/** Gedämpfte Periodendauer T_d = 2π / √(ω₀² − δ²); bei Grenz- und Kriechfall unendlich. */
export function dampedPeriod(L: number, C: number, R: number): number {
  const d = decay(R, L);
  const w0 = omega0(L, C);
  return d < w0 ? (2 * Math.PI) / Math.sqrt(w0 * w0 - d * d) : Infinity;
}

/** Ladung q(t) und Strom i(t) = dq/dt für q(0) = q₀, i(0) = 0. */
export function lcState(L: number, C: number, R: number, q0: number, t: number): { q: number; i: number } {
  const w0 = omega0(L, C);
  const d = decay(R, L);
  if (d < w0 * (1 - 1e-9)) {
    const w = Math.sqrt(w0 * w0 - d * d);
    const e = Math.exp(-d * t);
    const q = q0 * e * (Math.cos(w * t) + (d / w) * Math.sin(w * t));
    const i = -q0 * e * ((w0 * w0) / w) * Math.sin(w * t);
    return { q, i };
  }
  if (d <= w0 * (1 + 1e-9)) {
    const e = Math.exp(-d * t);
    return { q: q0 * e * (1 + d * t), i: -q0 * d * d * t * e };
  }
  const b = Math.sqrt(d * d - w0 * w0);
  const s1 = -d + b;
  const s2 = -d - b;
  const e1 = Math.exp(s1 * t);
  const e2 = Math.exp(s2 * t);
  return { q: (q0 / (s2 - s1)) * (s2 * e1 - s1 * e2), i: ((q0 * s1 * s2) / (s2 - s1)) * (e1 - e2) };
}

/** Energie im Kondensator q²/(2C) und in der Spule L·i²/2 (in J). */
export function energies(L: number, C: number, q: number, i: number): { el: number; mag: number } {
  return { el: (q * q) / (2 * C), mag: 0.5 * L * i * i };
}

/** Federpendel mit derselben Periode: Federhärte D = m · ω₀² (Masse m in kg). */
export function springForSamePeriod(L: number, C: number, m: number): number {
  const w = omega0(L, C);
  return m * w * w;
}

// ───────────────────────── Selbstinduktion ─────────────────────────

/**
 * Zwei gleiche Zweige an der Spannung U₀: Lampe mit Spule (Induktivität L) und
 * Lampe mit Widerstand; jeder Zweig hat den Widerstand R.
 * Einschalten: Im Spulenzweig steigt der Strom mit τ = L/R an, im anderen sofort.
 * Ausschalten: Der Spulenstrom fließt im Kreis durch beide Zweige weiter (2R)
 * und klingt mit τ = L/(2R) ab; die Lampe ohne Spule wird dabei rückwärts durchflossen.
 */
export interface SwitchState {
  /** Strom im Spulenzweig (A) */
  iCoil: number;
  /** Strom im Widerstandszweig (A), positiv in Richtung der Quelle */
  iRes: number;
  /** Spannung an der Spule u_L = L · di/dt (V) */
  uL: number;
}

export function switchOn(U0: number, R: number, L: number, t: number): SwitchState {
  const I0 = U0 / R;
  const tau = L / R;
  const e = Math.exp(-t / tau);
  return { iCoil: I0 * (1 - e), iRes: I0, uL: U0 * e };
}

/** Ausschalten nach vollem Strom I₀ = U₀/R (t ab dem Öffnen des Schalters). */
export function switchOff(U0: number, R: number, L: number, t: number): SwitchState {
  const I0 = U0 / R;
  const tau = L / (2 * R);
  const i = I0 * Math.exp(-t / tau);
  return { iCoil: i, iRes: -i, uL: -2 * R * i };
}

/** Zeitkonstante beim Einschalten τ = L/R in s. */
export function timeConstant(L: number, R: number): number {
  return L / R;
}

/** Energie im Magnetfeld der Spule W = ½ · L · I² in J. */
export function fieldEnergy(L: number, I: number): number {
  return 0.5 * L * I * I;
}

/* ------------------------------------------------------------------ */
/* Radio abstimmen: Resonanz eines Schwingkreises                      */
/* ------------------------------------------------------------------ */

/** Induktivität der Empfangsspule im Radio (H). */
export const RADIO_L = 200e-6;

/** Resonanzfrequenz f₀ = 1 / (2π √(LC)) in Hz. */
export function resonanceFrequency(L: number, C: number): number {
  return 1 / (2 * Math.PI * Math.sqrt(L * C));
}

/**
 * Stromstärke im Reihenschwingkreis relativ zum Maximum, wenn eine Spannung
 * der Frequenz f anliegt: I/I_max = R / √(R² + (ωL − 1/(ωC))²).
 */
export function resonanceResponse(f: number, L: number, C: number, R: number): number {
  const w = 2 * Math.PI * f;
  const X = w * L - 1 / (w * C);
  return R / Math.sqrt(R * R + X * X);
}

/** Kapazität, die für die Frequenz f nötig ist: C = 1 / (4π² f² L). */
export function capacitanceFor(f: number, L: number): number {
  return 1 / (4 * Math.PI * Math.PI * f * f * L);
}

export interface Station {
  id: string;
  /** Frequenz in Hz */
  f: number;
  de: string;
  en: string;
}

/** Ausgedachte Sender auf der Mittelwelle. */
export const STATIONS: readonly Station[] = [
  { id: 'a', f: 600e3, de: 'Nachrichten', en: 'News' },
  { id: 'b', f: 800e3, de: 'Klassik', en: 'Classical' },
  { id: 'c', f: 1000e3, de: 'Pop', en: 'Pop' },
  { id: 'd', f: 1200e3, de: 'Sport', en: 'Sport' },
  { id: 'e', f: 1400e3, de: 'Jazz', en: 'Jazz' },
];

/** Welcher Sender ist am lautesten, und wie stark stören die anderen (Anteil 0…1)? */
export function tuning(C: number, R: number, L = RADIO_L): { best: Station; level: number; crosstalk: number } {
  let best = STATIONS[0]!;
  let level = 0;
  const lv = STATIONS.map((s) => resonanceResponse(s.f, L, C, R));
  lv.forEach((v, i) => {
    if (v > level) {
      level = v;
      best = STATIONS[i]!;
    }
  });
  const others = lv.reduce((sum, v) => sum + v, 0) - level;
  return { best, level, crosstalk: level > 0 ? others / level : 0 };
}

/* ------------------------------------------------------------------ */
/* Rückkopplung (Meißner-Schaltung)                                    */
/* ------------------------------------------------------------------ */

/**
 * Amplitude einer gedämpften Schwingung, der je Periode Energie zugeführt
 * wird: ohne Rückkopplung fällt sie mit e^(−δt), mit Rückkopplung nähert sie
 * sich der Sollamplitude 1 (Verstärker begrenzt).
 */
export function feedbackAmplitude(t: number, delta: number, feedback: boolean, a0 = 1): number {
  if (!feedback) return a0 * Math.exp(-delta * t);
  // logistisches Einschwingen auf 1, Zeitkonstante 1/δ
  const k = delta > 0 ? delta : 0.5;
  return 1 / (1 + (1 / a0 - 1) * Math.exp(-k * t));
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'period' | 'scale' | 'freq' | 'tau' | 'energy' | 'tune';

export interface LcTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** zulässige relative Abweichung (0 = genau) */
  tol: number;
  choices: Loc[] | null;
  solution: Loc;
}

function rng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zahl mit Dezimalkomma (de) bzw. Punkt (en). */
export function numText(x: number, lang: 'de' | 'en', d = 2): string {
  const s = String(Math.round(x * 10 ** d) / 10 ** d);
  return lang === 'de' ? s.replace('.', ',') : s;
}

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): LcTask {
  const r = rng(n * 71 + 3);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['period', 'scale', 'freq', 'tau', 'energy', 'tune'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const nt = numText;
  if (kind === 'period') {
    const L = pick([100, 250, 500, 1000]);
    const C = pick([10, 40, 100]);
    const T = thomsonPeriod(L, C * 1e-6);
    return {
      kind,
      text: {
        de: `Ein Schwingkreis hat L = ${L} H und C = ${C} µF. Wie groß ist die Periodendauer in s? (T = 2π√(LC))`,
        en: `An LC circuit has L = ${L} H and C = ${C} µF. What is the period in s? (T = 2π√(LC))`,
      },
      answer: T,
      tol: 0.03,
      choices: null,
      solution: { de: `T = 2π · √(${L} H · ${C} · 10⁻⁶ F) ≈ ${nt(T, 'de', 2)} s`, en: `T = 2π · √(${L} H · ${C} · 10⁻⁶ F) ≈ ${nt(T, 'en', 2)} s` },
    };
  }
  if (kind === 'scale') {
    const [factor, what]: [number, Loc] = pick([
      [4, { de: 'die Kapazität vervierfacht', en: 'the capacitance is quadrupled' }],
      [4, { de: 'die Induktivität vervierfacht', en: 'the inductance is quadrupled' }],
      [0.25, { de: 'die Kapazität geviertelt', en: 'the capacitance is quartered' }],
    ] as [number, Loc][]);
    const ans = factor === 4 ? 1 : 2;
    return {
      kind,
      text: { de: `Was passiert mit der Periodendauer, wenn man ${what.de}?`, en: `What happens to the period if ${what.en}?` },
      answer: ans,
      tol: 0,
      choices: [
        { de: 'sie verdoppelt sich', en: 'it doubles' },
        { de: 'sie halbiert sich', en: 'it halves' },
        { de: 'sie vervierfacht sich', en: 'it quadruples' },
        { de: 'sie bleibt gleich', en: 'it stays the same' },
      ],
      solution: { de: `T ist proportional zu √(LC). √${factor === 4 ? '4 = 2' : '¼ = ½'}.`, en: `T is proportional to √(LC). √${factor === 4 ? '4 = 2' : '¼ = ½'}.` },
    };
  }
  if (kind === 'freq') {
    const LuH = pick([100, 200, 250]);
    const CpF = pick([100, 250, 400]);
    const f = resonanceFrequency(LuH * 1e-6, CpF * 1e-12) / 1e3;
    return {
      kind,
      text: {
        de: `Ein Radio-Schwingkreis hat L = ${LuH} µH und C = ${CpF} pF. Auf welche Frequenz in kHz ist er abgestimmt?`,
        en: `A radio LC circuit has L = ${LuH} µH and C = ${CpF} pF. Which frequency in kHz is it tuned to?`,
      },
      answer: f,
      tol: 0.03,
      choices: null,
      solution: { de: `f = 1 / (2π√(LC)) ≈ ${nt(f, 'de', 0)} kHz`, en: `f = 1 / (2π√(LC)) ≈ ${nt(f, 'en', 0)} kHz` },
    };
  }
  if (kind === 'tau') {
    const L = pick([100, 200, 500]);
    const R = pick([50, 100, 250]);
    const tau = L / R;
    return {
      kind,
      text: {
        de: `Eine Spule (L = ${L} H) liegt in Reihe mit R = ${R} Ω. Wie groß ist die Zeitkonstante τ = L/R in s?`,
        en: `A coil (L = ${L} H) is in series with R = ${R} Ω. What is the time constant τ = L/R in s?`,
      },
      answer: tau,
      tol: 0.02,
      choices: null,
      solution: {
        de: `τ = ${L} H : ${R} Ω = ${nt(tau, 'de', 2)} s. Nach τ hat der Strom 63 % seines Endwerts erreicht.`,
        en: `τ = ${L} H / ${R} Ω = ${nt(tau, 'en', 2)} s. After τ the current has reached 63 % of its final value.`,
      },
    };
  }
  if (kind === 'energy') {
    const L = pick([100, 200, 500]);
    const I = pick([0.05, 0.1, 0.2]);
    const E = fieldEnergy(L, I);
    return {
      kind,
      text: {
        de: `Durch eine Spule mit L = ${L} H fließen ${nt(I, 'de')} A. Wie viel Energie in J steckt im Magnetfeld? (E = ½ L I²)`,
        en: `A current of ${nt(I, 'en')} A flows through a coil with L = ${L} H. How much energy in J is stored in the magnetic field? (E = ½ L I²)`,
      },
      answer: E,
      tol: 0.02,
      choices: null,
      solution: { de: `E = ½ · ${L} H · (${nt(I, 'de')} A)² = ${nt(E, 'de', 2)} J`, en: `E = ½ · ${L} H · (${nt(I, 'en')} A)² = ${nt(E, 'en', 2)} J` },
    };
  }
  const st = pick(STATIONS.slice(1, 4));
  const higher = r() < 0.5;
  return {
    kind: 'tune',
    text: {
      de: `Das Radio empfängt gerade „${st.de}“ (${st.f / 1e3} kHz). Du willst einen Sender mit ${higher ? 'höherer' : 'niedrigerer'} Frequenz. Wie musst du den Drehkondensator verstellen?`,
      en: `The radio is receiving “${st.en}” (${st.f / 1e3} kHz). You want a station with a ${higher ? 'higher' : 'lower'} frequency. How must you turn the variable capacitor?`,
    },
    answer: higher ? 2 : 1,
    tol: 0,
    choices: [
      { de: 'Kapazität vergrößern', en: 'increase the capacitance' },
      { de: 'Kapazität verkleinern', en: 'decrease the capacitance' },
    ],
    solution: { de: 'f = 1 / (2π√(LC)): Kleineres C ergibt eine höhere Frequenz.', en: 'f = 1 / (2π√(LC)): a smaller C gives a higher frequency.' },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. */
export function checkTask(task: LcTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[a-zA-Z]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
