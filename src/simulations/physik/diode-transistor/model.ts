/**
 * Rechenlogik „Diode und Transistor“ (ohne Zeichnen).
 *
 * Diode (Shockley-Gleichung):
 *
 *   I = I_S · (e^{U / (n · U_T)} − 1),   U_T = k · T / e  (≈ 25,85 mV bei 300 K)
 *
 * mit Sättigungsstrom I_S und Emissionskoeffizient n. In Durchlassrichtung
 * wächst der Strom exponentiell (bei n = 1 etwa zehnmal so viel Strom je
 * 60 mV), in Sperrrichtung fließt nur der winzige Sperrstrom I ≈ −I_S.
 *
 * Als „Schleusenspannung“ U_S gilt hier (Vereinbarung dieser Simulation) die
 * Spannung, bei der 10 mA fließen: Silizium ≈ 0,65 V, Germanium ≈ 0,30 V.
 * Für Leuchtdioden ist I_S so gewählt, dass U_S ≈ h · c / (e · λ) gilt –
 * so lässt sich aus Farbe und Schwellspannung das plancksche Wirkungsquantum
 * abschätzen (vereinfachtes Modell).
 *
 * Transistor (npn, Emitterschaltung): Kollektorstrom I_C = B · I_B, bis der
 * Lastwiderstand ihn begrenzt (Sättigung): I_C ≤ (U_B − U_CE,sat) / R_C.
 *
 * Gleichrichter: Dioden mit konstanter Durchlassspannung U_F (Ersatzmodell),
 * Einweg- und Brückenschaltung, wahlweise mit Glättungskondensator.
 *
 * Einheiten: SI (V, A, Ω, F, s, K), wenn nicht anders angegeben.
 */

/* ------------------------------------------------------------------ */
/* Naturkonstanten                                                     */
/* ------------------------------------------------------------------ */

/** Boltzmann-Konstante in J/K (exakt seit 2019). */
export const K_B = 1.380649e-23;
/** Elementarladung in C (exakt). */
export const E_CHARGE = 1.602176634e-19;
/** Plancksches Wirkungsquantum in J·s (exakt). */
export const H_PLANCK = 6.62607015e-34;
/** Lichtgeschwindigkeit in m/s (exakt). */
export const C_LIGHT = 299792458;
/** Raumtemperatur der Simulation in K. */
export const T_ROOM = 300;
/** Bezugsstrom für die Schleusenspannung: 10 mA. */
export const I_REF = 0.01;

/** Temperaturspannung U_T = k · T / e in V. */
export function thermalVoltage(T = T_ROOM): number {
  return (K_B * T) / E_CHARGE;
}

/* ------------------------------------------------------------------ */
/* Dioden                                                              */
/* ------------------------------------------------------------------ */

export type DiodeId = 'si' | 'ge' | 'red' | 'yel' | 'grn' | 'blu';
export const DIODE_IDS: readonly DiodeId[] = ['si', 'ge', 'red', 'yel', 'grn', 'blu'];
export const LED_IDS: readonly DiodeId[] = ['red', 'yel', 'grn', 'blu'];

export interface DiodeSpec {
  id: DiodeId;
  /** Sättigungsstrom in A. */
  Is: number;
  /** Emissionskoeffizient (Idealitätsfaktor). */
  n: number;
  /** Wellenlänge des Lichts in nm (nur Leuchtdioden). */
  lambda: number | null;
  /** Diffusionsspannung des pn-Übergangs in V (für das Halbleiter-Modell). */
  Ud: number;
}

/** Energie eines Photons (in eV) der Wellenlänge λ (in nm): E = h · c / λ. */
export function photonEnergyEV(lambdaNm: number): number {
  return (H_PLANCK * C_LIGHT) / (lambdaNm * 1e-9) / E_CHARGE;
}

/** Sättigungsstrom so, dass bei der Spannung U genau der Strom I fließt. */
export function saturationFor(U: number, I: number, n: number, T = T_ROOM): number {
  return I / Math.expm1(U / (n * thermalVoltage(T)));
}

/** Wellenlängen der Leuchtdioden in nm (typische Werte). */
export const LED_LAMBDA: Record<'red' | 'yel' | 'grn' | 'blu', number> = { red: 625, yel: 590, grn: 565, blu: 470 };

function led(id: 'red' | 'yel' | 'grn' | 'blu'): DiodeSpec {
  const lambda = LED_LAMBDA[id];
  const U = photonEnergyEV(lambda);
  return { id, Is: saturationFor(U, I_REF, 2), n: 2, lambda, Ud: U };
}

export const DIODES: Record<DiodeId, DiodeSpec> = {
  si: { id: 'si', Is: 1e-13, n: 1, lambda: null, Ud: 0.7 },
  ge: { id: 'ge', Is: 1e-7, n: 1, lambda: null, Ud: 0.3 },
  red: led('red'),
  yel: led('yel'),
  grn: led('grn'),
  blu: led('blu'),
};

export function isLed(id: DiodeId): boolean {
  return DIODES[id].lambda !== null;
}

/** Shockley-Gleichung: Strom in A bei der Spannung U (in V) an der Diode. */
export function shockley(U: number, Is: number, n = 1, T = T_ROOM): number {
  return Is * Math.expm1(U / (n * thermalVoltage(T)));
}

/** Strom durch eine Diode des Typs `d` bei der Spannung U. */
export function diodeCurrent(d: DiodeId, U: number, T = T_ROOM): number {
  const s = DIODES[d];
  return shockley(U, s.Is, s.n, T);
}

/** Umkehrung der Shockley-Gleichung: Spannung, bei der der Strom I fließt (I > −I_S). */
export function diodeVoltage(d: DiodeId, I: number, T = T_ROOM): number {
  const s = DIODES[d];
  return s.n * thermalVoltage(T) * Math.log1p(I / s.Is);
}

/** Schleusenspannung U_S: Spannung bei 10 mA. */
export function thresholdVoltage(d: DiodeId, T = T_ROOM): number {
  return diodeVoltage(d, I_REF, T);
}

/** Faktor, um den der Strom bei ΔU mehr Spannung wächst (weit in Durchlassrichtung). */
export function currentFactor(dU: number, n = 1, T = T_ROOM): number {
  return Math.exp(dU / (n * thermalVoltage(T)));
}

/** Spannungszuwachs für zehnfachen Strom: ΔU = n · U_T · ln 10 (≈ 60 mV bei n = 1). */
export function decadeVoltage(n = 1, T = T_ROOM): number {
  return n * thermalVoltage(T) * Math.LN10;
}

export interface DiodeOp {
  /** Spannung an der Diode in V (negativ: Sperrrichtung). */
  Ud: number;
  /** Strom in A (negativ: Sperrstrom). */
  I: number;
  /** Spannung am Vorwiderstand in V. */
  Ur: number;
}

/**
 * Arbeitspunkt einer Diode mit Vorwiderstand R an der Quellenspannung U0
 * (in Durchlassrichtung positiv). Gelöst wird U0 = U_D + I(U_D) · R durch
 * Bisektion (die rechte Seite steigt streng monoton mit U_D).
 */
export function diodeCircuit(d: DiodeId, U0: number, R: number, T = T_ROOM): DiodeOp {
  if (!(R > 0)) {
    const I = diodeCurrent(d, U0, T);
    return { Ud: U0, I, Ur: 0 };
  }
  const f = (u: number) => u + diodeCurrent(d, u, T) * R - U0;
  // U_D liegt zwischen min(U0, 0) und max(U0, 0)
  let lo = Math.min(U0, 0) - 1e-9;
  let hi = Math.max(U0, 0) + 1e-9;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid;
    else lo = mid;
  }
  const Ud = (lo + hi) / 2;
  const I = diodeCurrent(d, Ud, T);
  return { Ud, I, Ur: I * R };
}

/** Quellenspannung, die die Diodenspannung U_D ergibt (zum Ziehen des Arbeitspunkts). */
export function sourceForDiodeVoltage(d: DiodeId, Ud: number, R: number, T = T_ROOM): number {
  return Ud + diodeCurrent(d, Ud, T) * R;
}

/**
 * Breite der Sperrschicht relativ zur Breite ohne äußere Spannung:
 * w / w₀ = √((U_d − U) / U_d) (abrupter pn-Übergang). In Durchlassrichtung
 * schrumpft sie bis auf einen kleinen Rest, in Sperrrichtung wächst sie.
 */
export function depletionWidth(U: number, Udiff: number, minFrac = 0.12): number {
  const r = (Udiff - U) / Udiff;
  return Math.max(minFrac, Math.sqrt(Math.max(0, r)));
}

/* ------------------------------------------------------------------ */
/* Leuchtdioden und h                                                  */
/* ------------------------------------------------------------------ */

/** Frequenz des Lichts in Hz zur Wellenlänge in nm. */
export function frequencyOf(lambdaNm: number): number {
  return C_LIGHT / (lambdaNm * 1e-9);
}

/**
 * Plancksches Wirkungsquantum aus Schwellspannungen und Frequenzen:
 * Steigung der Ausgleichsgeraden durch den Ursprung von e · U über f.
 */
export function planckFromLeds(points: readonly { U: number; f: number }[]): number | null {
  let xy = 0;
  let xx = 0;
  for (const q of points) {
    xy += q.f * q.U * E_CHARGE;
    xx += q.f * q.f;
  }
  return xx > 0 ? xy / xx : null;
}

/* ------------------------------------------------------------------ */
/* Transistor                                                          */
/* ------------------------------------------------------------------ */

/** Betriebsspannung der Transistorschaltungen in V. */
export const U_B = 9;
/** Kollektor-Emitter-Spannung des gesättigten Transistors in V. */
export const U_CE_SAT = 0.2;
/** Sättigungsstrom der Basis-Emitter-Diode in A (U_BE ≈ 0,65 V bei 0,1 mA). */
export const IS_BE = 1e-15;

/** Größter Kollektorstrom, den der Lastwiderstand zulässt: I_C,max = (U_B − U_CE,sat) / R_C. */
export function collectorLimit(RC: number, Ub = U_B): number {
  return Math.max(0, (Ub - U_CE_SAT) / RC);
}

export interface TransistorOp {
  /** Basisstrom in A. */
  IB: number;
  /** Kollektorstrom in A. */
  IC: number;
  /** Kollektor-Emitter-Spannung in V. */
  UCE: number;
  /** Ist der Transistor gesättigt (I_C durch den Lastwiderstand begrenzt)? */
  saturated: boolean;
  /** I_C, wenn es keine Begrenzung gäbe: B · I_B. */
  ICideal: number;
}

/**
 * Kollektorstrom in Emitterschaltung: I_C = B · I_B, höchstens I_C,max.
 * Ein negativer Basisstrom ist nicht möglich (Basis-Emitter-Diode sperrt).
 */
export function transistor(IB: number, B: number, RC: number, Ub = U_B): TransistorOp {
  const ib = Math.max(0, IB);
  const ideal = B * ib;
  const lim = collectorLimit(RC, Ub);
  const saturated = ideal > lim;
  const IC = saturated ? lim : ideal;
  return { IB: ib, IC, UCE: Ub - IC * RC, saturated, ICideal: ideal };
}

/** Basis-Emitter-Spannung beim Basisstrom I_B (Shockley mit IS_BE). */
export function baseEmitterVoltage(IB: number, T = T_ROOM): number {
  return thermalVoltage(T) * Math.log1p(Math.max(0, IB) / IS_BE);
}

/**
 * Basisstrom aus einer Ersatzquelle (Leerlaufspannung Uth, Innenwiderstand Rth)
 * über die Basis-Emitter-Diode: Uth = I_B · Rth + U_BE(I_B). Bisektion.
 */
export function baseCurrent(Uth: number, Rth: number, T = T_ROOM): number {
  if (!(Uth > 0) || !(Rth > 0)) return 0;
  let lo = 0;
  let hi = Uth / Rth;
  const f = (ib: number) => ib * Rth + thermalVoltage(T) * Math.log1p(ib / IS_BE) - Uth;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

/* ---------- Dämmerungsschalter ---------- */

/**
 * Widerstand eines Fotowiderstands (LDR) bei der Beleuchtungsstärke E (in lx):
 * R = R₁₀ · (E / 10 lx)^(−γ), höchstens R_dunkel. Typische Werte eines
 * Bauteils GL5528: etwa 10–20 kΩ bei 10 lx, γ ≈ 0,7, dunkel ≈ 1 MΩ.
 */
export const LDR = { R10: 15e3, gamma: 0.7, Rdark: 1e6 } as const;
export function ldrResistance(E: number): number {
  if (!(E > 0)) return LDR.Rdark;
  return Math.min(LDR.Rdark, LDR.R10 * (E / 10) ** -LDR.gamma);
}

/** Beleuchtungsstärke in lx aus der Helligkeit h (0 … 100 %): 0,1 lx … 1000 lx logarithmisch. */
export function luxFromLevel(h: number): number {
  return 0.1 * 10 ** ((4 * Math.max(0, Math.min(100, h))) / 100);
}

/** Lampe im Kollektorkreis: 9 V / 50 mA, als ohmscher Widerstand. */
export const LAMP_R = 180;
/** Basisvorwiderstand beim Taster in Ω. */
export const RB_KEY = 4700;
/** Basisvorwiderstand hinter dem Spannungsteiler in Ω. */
export const RB_DIV = 1000;
/** Stromverstärkung des Schalttransistors (z. B. BC547B). */
export const B_SWITCH = 300;

export interface SwitchOp extends TransistorOp {
  /** Spannung am Basisanschluss gegen Masse in V. */
  UBE: number;
  /** Widerstand des Fotowiderstands in Ω (nur Dämmerungsschalter). */
  Rldr: number | null;
  /** Leerlaufspannung des Spannungsteilers in V (nur Dämmerungsschalter). */
  Udiv: number | null;
  /** Leuchtet die Lampe merklich (mehr als ein Viertel des Nennstroms)? */
  lampOn: boolean;
}

/**
 * Transistor als Schalter mit Lampe (9 V / 50 mA) im Kollektorkreis.
 *  - Taster: Basis über R_B = 4,7 kΩ an U_B (Taster gedrückt) oder offen.
 *  - Dämmerungsschalter: Spannungsteiler aus R₁ (oben, an U_B) und LDR (unten,
 *    an Masse), Basis über 1 kΩ am Mittelpunkt. Wird es dunkel, steigt der
 *    Widerstand des LDR, die Spannung am Teiler steigt, der Transistor schaltet.
 */
export function switchCircuit(input: { kind: 'key'; pressed: boolean } | { kind: 'ldr'; lux: number; R1: number }, B = B_SWITCH): SwitchOp {
  let IB = 0;
  let Rldr: number | null = null;
  let Udiv: number | null = null;
  if (input.kind === 'key') {
    IB = input.pressed ? baseCurrent(U_B, RB_KEY) : 0;
  } else {
    Rldr = ldrResistance(input.lux);
    Udiv = (U_B * Rldr) / (input.R1 + Rldr);
    const Rth = (input.R1 * Rldr) / (input.R1 + Rldr) + RB_DIV;
    IB = baseCurrent(Udiv, Rth);
  }
  const op = transistor(IB, B, LAMP_R);
  return { ...op, UBE: baseEmitterVoltage(IB), Rldr, Udiv, lampOn: op.IC > 0.25 * (U_B / LAMP_R) };
}

/* ---------- Verstärker: Signal am Arbeitspunkt ---------- */

/** Basisstrom mit Wechselanteil: i_B(t) = I_B + î_B · sin(ωt), nie negativ. */
export function signalBase(IB: number, ib: number, phase: number): number {
  return Math.max(0, IB + ib * Math.sin(phase));
}

/** Schwankung des Kollektorstroms (Spitze-Spitze) bei Aussteuerung um den Arbeitspunkt. */
export function outputSwing(IB: number, ib: number, B: number, RC: number, samples = 360): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let k = 0; k < samples; k++) {
    const ic = transistor(signalBase(IB, ib, (2 * Math.PI * k) / samples), B, RC).IC;
    if (ic < min) min = ic;
    if (ic > max) max = ic;
  }
  return { min, max };
}

/* ------------------------------------------------------------------ */
/* Gleichrichter                                                       */
/* ------------------------------------------------------------------ */

export type RectKind = 'half' | 'bridge';
/** Durchlassspannung einer Siliziumdiode im Ersatzmodell (Gleichrichter) in V. */
export const U_F = 0.7;
/** Netzfrequenz in Hz. */
export const F_NET = 50;
/** Innenwiderstand von Transformator und Leitungen in Ω (nur mit Kondensator wirksam). */
export const R_SOURCE = 2;

/** Anzahl der Dioden, die gleichzeitig leiten: Einweg 1, Brücke 2. */
export function diodesInPath(kind: RectKind): number {
  return kind === 'bridge' ? 2 : 1;
}

/** Spitzenwert der Ausgangsspannung: Û − U_F (Einweg) bzw. Û − 2 U_F (Brücke). */
export function rectPeak(Uhat: number, kind: RectKind, UF = U_F): number {
  return Math.max(0, Uhat - diodesInPath(kind) * UF);
}

/** Ausgangsspannung ohne Kondensator zur Eingangsspannung u (Augenblickswert). */
export function rectOutput(u: number, kind: RectKind, UF = U_F): number {
  const drop = diodesInPath(kind) * UF;
  const v = kind === 'bridge' ? Math.abs(u) : u;
  return Math.max(0, v - drop);
}

/**
 * Mittelwert der Ausgangsspannung ohne Kondensator (über eine Periode):
 * Einweg  ū = (2Û·cos θ₁ − U_F·(π − 2θ₁)) / (2π) mit sin θ₁ = U_F / Û,
 * Brücke  doppelt so viel (mit 2 U_F). Für U_F = 0: Û/π bzw. 2Û/π.
 */
export function rectMean(Uhat: number, kind: RectKind, UF = U_F): number {
  const drop = diodesInPath(kind) * UF;
  if (Uhat <= drop) return 0;
  const t1 = Math.asin(drop / Uhat);
  const half = (2 * Uhat * Math.cos(t1) - drop * (Math.PI - 2 * t1)) / (2 * Math.PI);
  return kind === 'bridge' ? 2 * half : half;
}

/** Effektivwert einer sinusförmigen Wechselspannung: U_eff = Û / √2. */
export function rms(Uhat: number): number {
  return Uhat / Math.SQRT2;
}

export interface RectWave {
  /** Zeitpunkte in s (über `periods` Perioden). */
  t: number[];
  /** Eingangsspannung in V. */
  uin: number[];
  /** Ausgangsspannung in V. */
  uout: number[];
  /** Leiten Dioden in diesem Moment (Stromfluss aus der Quelle)? */
  on: boolean[];
  peak: number;
  min: number;
  mean: number;
  /** Brummspannung (Spitze-Spitze) in V. */
  ripple: number;
}

/**
 * Spannungsverlauf am Lastwiderstand R_L, wahlweise mit Glättungskondensator C.
 * Ohne Kondensator folgt die Spannung der gleichgerichteten Eingangsspannung.
 * Mit Kondensator: Laden über R_SOURCE, solange die gleichgerichtete Spannung
 * höher ist, sonst Entladen über R_L (implizites Euler-Verfahren). Gerechnet
 * wird bis zum eingeschwungenen Zustand; zurückgegeben werden die letzten Perioden.
 */
export function rectifierWave(Uhat: number, kind: RectKind, C: number, RL: number, opts: { periods?: number; samples?: number; f?: number; UF?: number } = {}): RectWave {
  const f = opts.f ?? F_NET;
  const UF = opts.UF ?? U_F;
  const periods = opts.periods ?? 2;
  const n = opts.samples ?? 400;
  const T = 1 / f;
  const dt = T / n;
  const out: RectWave = { t: [], uin: [], uout: [], on: [], peak: 0, min: Infinity, mean: 0, ripple: 0 };
  const drop = diodesInPath(kind) * UF;
  const src = (tt: number) => Uhat * Math.sin(2 * Math.PI * f * tt);
  if (!(C > 0)) {
    for (let i = 0; i <= periods * n; i++) {
      const tt = i * dt;
      const u = src(tt);
      const v = rectOutput(u, kind, UF);
      out.t.push(tt);
      out.uin.push(u);
      out.uout.push(v);
      out.on.push(v > 0);
    }
  } else {
    // Einschwingen: so viele Perioden, bis sich der Kondensator nicht mehr ändert
    const tau = RL * C;
    const settle = Math.min(400, Math.max(6, Math.ceil((5 * tau) / T)));
    // feinere Schritte beim Laden (R_SOURCE · C ist kurz)
    const sub = 8;
    const h = dt / sub;
    let uc = 0;
    let tt = 0;
    const total = (settle + periods) * n;
    for (let i = 0; i <= total; i++) {
      let on = false;
      if (i > 0) {
        for (let k = 0; k < sub; k++) {
          tt += h;
          const u = src(tt);
          const v = (kind === 'bridge' ? Math.abs(u) : u) - drop;
          if (v > uc) {
            uc = (uc + (h / C) * (v / R_SOURCE)) / (1 + (h / C) * (1 / R_SOURCE + 1 / RL));
            on = true;
          } else uc = uc / (1 + h / (RL * C));
        }
      }
      if (i >= settle * n) {
        out.t.push((i - settle * n) * dt);
        out.uin.push(src(tt));
        out.uout.push(uc);
        out.on.push(on);
      }
    }
  }
  let sum = 0;
  let max = -Infinity;
  let min = Infinity;
  // Mittelwert über ganze Perioden (letzter Punkt doppelt zum ersten)
  const m = out.uout.length - 1;
  for (let i = 0; i < m; i++) {
    const v = out.uout[i]!;
    sum += v;
    if (v > max) max = v;
    if (v < min) min = v;
  }
  out.peak = max;
  out.min = min;
  out.mean = sum / m;
  out.ripple = max - min;
  return out;
}

/**
 * Näherung für die Brummspannung mit Kondensator: ΔU ≈ I / (f_B · C) mit dem
 * Laststrom I ≈ Û_aus / R_L und der Brummfrequenz f_B = f (Einweg) bzw. 2f (Brücke).
 */
export function rippleEstimate(Uhat: number, kind: RectKind, C: number, RL: number, f = F_NET, UF = U_F): number {
  if (!(C > 0)) return rectPeak(Uhat, kind, UF);
  const fb = kind === 'bridge' ? 2 * f : f;
  return rectPeak(Uhat, kind, UF) / (RL * fb * C);
}
