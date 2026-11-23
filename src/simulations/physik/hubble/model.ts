/**
 * Rechenlogik für das expandierende Universum: Hubble-Beziehung,
 * Rotverschiebung von Spektrallinien, Hubble-Zeit und Weltalter, Skalenfaktor
 * a(t) nach den Friedmann-Gleichungen (Strahlung, Materie, Krümmung,
 * Dunkle Energie), Entfernungsmaße, Standardkerzen, Ausgleichsgerade durch den
 * Ursprung, kosmische Hintergrundstrahlung (Planck, Wien) und ein kleines
 * Rosinenkuchen-Modell mit Galaxien in einem mitbewegten Gitter.
 * Geprüft in tests/hubble.test.ts.
 */

/* ------------------------------------------------------------------ */
/* Konstanten                                                           */
/* ------------------------------------------------------------------ */

/** Lichtgeschwindigkeit in km/s */
export const C_KMS = 299_792.458;
/** Megaparsec in km */
export const MPC_KM = 3.085_677_581e19;
/** Lichtjahr in km */
export const LY_KM = 9.460_730_472_58e12;
/** Megaparsec in Millionen Lichtjahren (1 Mpc ≈ 3,26 Mio. Lj) */
export const MPC_MLY = MPC_KM / LY_KM / 1e6;
/** Sekunden pro Jahr (julianisch) */
export const YEAR_S = 365.25 * 86_400;
/** Gyr (Milliarden Jahre) in Sekunden */
export const GYR_S = 1e9 * YEAR_S;
/** Heutige Temperatur der Hintergrundstrahlung in K */
export const T_CMB = 2.7255;
/** Wiensche Verschiebungskonstante in m·K */
export const WIEN_B = 2.897_771_955e-3;
/** Planck-Konstante, Boltzmann-Konstante, Lichtgeschwindigkeit (SI) */
export const H_PLANCK = 6.626_070_15e-34;
export const K_B = 1.380_649e-23;
export const C_SI = 299_792_458;

/* ------------------------------------------------------------------ */
/* Hubble-Beziehung                                                     */
/* ------------------------------------------------------------------ */

/** Fluchtgeschwindigkeit v = H₀·d (km/s, d in Mpc, H₀ in km/(s·Mpc)). */
export const hubbleVelocity = (dMpc: number, H0: number) => H0 * dMpc;
/** Entfernung aus der Fluchtgeschwindigkeit d = v / H₀ (Mpc). */
export const hubbleDistance = (vKms: number, H0: number) => vKms / H0;

/** Hubble-Zeit 1/H₀ in Milliarden Jahren. */
export function hubbleTimeGyr(H0: number): number {
  const perSecond = H0 / MPC_KM; // H₀ in 1/s
  return 1 / perSecond / GYR_S;
}

/** Hubble-Radius c/H₀ in Mpc. */
export const hubbleRadiusMpc = (H0: number) => C_KMS / H0;

/* ------------------------------------------------------------------ */
/* Rotverschiebung                                                      */
/* ------------------------------------------------------------------ */

/** Klassische Näherung z = v/c (nur für v ≪ c). */
export const zClassic = (vKms: number) => vKms / C_KMS;
/** Geschwindigkeit aus z in der klassischen Näherung v = c·z. */
export const vFromZClassic = (z: number) => z * C_KMS;
/** Relativistischer Doppler-Effekt: 1 + z = √((1 + β)/(1 − β)). */
export function zRelativistic(vKms: number): number {
  const b = vKms / C_KMS;
  if (b >= 1) return Infinity;
  return Math.sqrt((1 + b) / (1 - b)) - 1;
}
/** Umkehrung des relativistischen Doppler-Effekts: β = ((1+z)² − 1)/((1+z)² + 1). */
export function betaFromZ(z: number): number {
  const s = (1 + z) * (1 + z);
  return (s - 1) / (s + 1);
}
/** Beobachtete Wellenlänge λ = λ₀·(1 + z). */
export const shifted = (lambda0: number, z: number) => lambda0 * (1 + z);
/** Rotverschiebung aus gemessener und Labor-Wellenlänge. */
export const zFromLambda = (lambdaObs: number, lambda0: number) => lambdaObs / lambda0 - 1;
/** Kosmologisch: 1 + z = a(heute)/a(damals) = 1/a. */
export const zFromScale = (a: number) => 1 / a - 1;
export const scaleFromZ = (z: number) => 1 / (1 + z);

export interface SpectralLine {
  id: string;
  /** Laborwellenlänge in nm */
  lambda: number;
  label: string;
  /** relative Stärke (0 … 1) der Absorptionslinie */
  depth: number;
}

/** Typische Absorptionslinien im Spektrum einer Galaxie (Laborwerte in Luft, nm). */
export const GALAXY_LINES: readonly SpectralLine[] = [
  { id: 'K', lambda: 393.37, label: 'Ca K', depth: 0.85 },
  { id: 'H', lambda: 396.85, label: 'Ca H', depth: 0.8 },
  { id: 'Hd', lambda: 410.17, label: 'Hδ', depth: 0.35 },
  { id: 'Hg', lambda: 434.05, label: 'Hγ', depth: 0.45 },
  { id: 'Hb', lambda: 486.13, label: 'Hβ', depth: 0.55 },
  { id: 'Mg', lambda: 517.27, label: 'Mg', depth: 0.6 },
  { id: 'Na', lambda: 589.0, label: 'Na D', depth: 0.65 },
  { id: 'Ha', lambda: 656.28, label: 'Hα', depth: 0.75 },
];

/** Sichtbarer Bereich in nm. */
export const VISIBLE: readonly [number, number] = [380, 750];

/**
 * Ungefähre Spektralfarbe zu einer Wellenlänge (nm) als RGB 0 … 255,
 * außerhalb des Sichtbaren dunkel (für Spektrenstreifen).
 */
export function wavelengthRGB(nm: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / 60;
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / 50;
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / 20;
  } else if (nm < 580) {
    r = (nm - 510) / 70;
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / 65;
  } else if (nm <= 750) {
    r = 1;
  }
  let f = 0;
  if (nm >= 380 && nm < 420) f = 0.3 + (0.7 * (nm - 380)) / 40;
  else if (nm >= 420 && nm <= 700) f = 1;
  else if (nm > 700 && nm <= 750) f = 0.3 + (0.7 * (750 - nm)) / 50;
  const gam = (c: number) => Math.round(255 * Math.pow(c * f, 0.8));
  return [gam(r), gam(g), gam(b)];
}

/* ------------------------------------------------------------------ */
/* Standardkerzen                                                       */
/* ------------------------------------------------------------------ */

/** Entfernungsmodul m − M = 5·log₁₀(d / 10 pc), d in Mpc. */
export const distanceModulus = (dMpc: number) => 5 * Math.log10((dMpc * 1e6) / 10);
/** Entfernung aus scheinbarer und absoluter Helligkeit (Mpc). */
export const distanceFromModulus = (m: number, M: number) => Math.pow(10, (m - M) / 5 + 1) / 1e6;
/** Absolute Helligkeit einer Supernova vom Typ Ia (Standardkerze) */
export const M_SN_IA = -19.3;
/** Absolute Helligkeit eines typischen Cepheiden (Periode ≈ 30 d) */
export const M_CEPHEID = -6;

/* ------------------------------------------------------------------ */
/* Ausgleichsgerade durch den Ursprung                                  */
/* ------------------------------------------------------------------ */

export interface Pt2 {
  d: number;
  v: number;
}

/**
 * Ausgleichsgerade v = H·d durch den Ursprung (kleinste Quadrate):
 * H = Σ d·v / Σ d². Dazu die Standardabweichung der Steigung und R².
 */
export function fitThroughOrigin(pts: readonly Pt2[]): { H: number; sigma: number; r2: number } | null {
  if (pts.length === 0) return null;
  let sdd = 0;
  let sdv = 0;
  for (const q of pts) {
    sdd += q.d * q.d;
    sdv += q.d * q.v;
  }
  if (sdd <= 0) return null;
  const H = sdv / sdd;
  let ssr = 0;
  let mean = 0;
  for (const q of pts) mean += q.v;
  mean /= pts.length;
  let sst = 0;
  for (const q of pts) {
    ssr += (q.v - H * q.d) ** 2;
    sst += (q.v - mean) ** 2;
  }
  const sigma = pts.length > 1 ? Math.sqrt(ssr / (pts.length - 1) / sdd) : 0;
  return { H, sigma, r2: sst > 0 ? 1 - ssr / sst : 1 };
}

/** Summe der quadrierten Abweichungen bei Steigung H (für „selbst anpassen“). */
export function sumSquares(pts: readonly Pt2[], H: number): number {
  return pts.reduce((s, q) => s + (q.v - H * q.d) ** 2, 0);
}

/* ------------------------------------------------------------------ */
/* Beispieldaten                                                        */
/* ------------------------------------------------------------------ */

export interface Galaxy {
  name: string;
  /** Entfernung in Mpc */
  d: number;
  /** Fluchtgeschwindigkeit in km/s */
  v: number;
}

/**
 * Hubbles Daten von 1929 (Auswahl, gerundet; Entfernungen damals um etwa
 * den Faktor 7 zu klein, daher H ≈ 500 km/(s·Mpc)).
 */
export const HUBBLE_1929: readonly Galaxy[] = [
  { name: 'SMC', d: 0.032, v: 170 },
  { name: 'LMC', d: 0.034, v: 290 },
  { name: 'NGC 6822', d: 0.214, v: -130 },
  { name: 'NGC 598', d: 0.263, v: -70 },
  { name: 'NGC 221', d: 0.275, v: -185 },
  { name: 'NGC 224', d: 0.275, v: -220 },
  { name: 'NGC 5457', d: 0.45, v: 200 },
  { name: 'NGC 4736', d: 0.5, v: 290 },
  { name: 'NGC 5194', d: 0.5, v: 270 },
  { name: 'NGC 4449', d: 0.63, v: 200 },
  { name: 'NGC 4214', d: 0.8, v: 300 },
  { name: 'NGC 3031', d: 0.9, v: -30 },
  { name: 'NGC 3627', d: 0.9, v: 650 },
  { name: 'NGC 4826', d: 0.9, v: 150 },
  { name: 'NGC 5236', d: 0.9, v: 500 },
  { name: 'NGC 1068', d: 1.0, v: 920 },
  { name: 'NGC 5055', d: 1.1, v: 450 },
  { name: 'NGC 7331', d: 1.1, v: 500 },
  { name: 'NGC 4258', d: 1.4, v: 500 },
  { name: 'NGC 4151', d: 1.7, v: 960 },
  { name: 'NGC 4382', d: 2.0, v: 500 },
  { name: 'NGC 4472', d: 2.0, v: 850 },
  { name: 'NGC 4486', d: 2.0, v: 800 },
  { name: 'NGC 4649', d: 2.0, v: 1090 },
];

/**
 * Heutige Beispielwerte (gerundet, aus Entfernungen mit Cepheiden und
 * Supernovae; gekennzeichnet als Beispielwerte): Streuung durch Eigenbewegung.
 */
export const MODERN: readonly Galaxy[] = [
  { name: 'M 31', d: 0.78, v: -300 },
  { name: 'M 81', d: 3.6, v: 250 },
  { name: 'M 101', d: 6.7, v: 450 },
  { name: 'M 51', d: 8.6, v: 600 },
  { name: 'NGC 4258', d: 7.6, v: 450 },
  { name: 'M 87', d: 16.4, v: 1280 },
  { name: 'NGC 4414', d: 17.9, v: 720 },
  { name: 'NGC 1365', d: 18.6, v: 1640 },
  { name: 'NGC 3370', d: 26, v: 1280 },
  { name: 'NGC 1309', d: 31, v: 2140 },
  { name: 'NGC 3021', d: 28, v: 1540 },
  { name: 'NGC 5584', d: 22, v: 1640 },
  { name: 'NGC 4536', d: 15, v: 1810 },
  { name: 'Coma-Haufen', d: 100, v: 6930 },
  { name: 'Perseus-Haufen', d: 75, v: 5370 },
  { name: 'Hydra-Haufen', d: 55, v: 3780 },
  { name: 'Abell 2199', d: 135, v: 9000 },
  { name: 'Abell 1795', d: 270, v: 18_700 },
  { name: 'Abell 2029', d: 340, v: 23_400 },
  { name: 'Abell 2142', d: 400, v: 27_100 },
];

/* ------------------------------------------------------------------ */
/* Zufall                                                               */
/* ------------------------------------------------------------------ */

/** Kleiner, reproduzierbarer Zufallsgenerator (xorshift). */
export function rng(seed: number): () => number {
  let s = (Math.floor(Math.abs(seed)) * 2_654_435_761 + 1013) >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4_294_967_296;
  };
}

/** Normalverteilte Zufallszahl (Box-Muller). */
export function gauss(r: () => number): number {
  const u = Math.max(r(), 1e-12);
  const v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface Observation {
  name: string;
  /** wahre Entfernung (Mpc) */
  dTrue: number;
  /** Eigenbewegung (km/s) */
  pec: number;
  /** wahre Fluchtgeschwindigkeit (km/s) */
  vTrue: number;
  /** Rotverschiebung (exakt aus v, relativistisch) */
  z: number;
  /** scheinbare Helligkeit der Supernova (mag) mit Messfehler */
  m: number;
  /** gemessene Entfernung aus der Standardkerze (Mpc) */
  dMeas: number;
  /** gemessene Geschwindigkeit aus der Rotverschiebung (km/s) */
  vMeas: number;
}

/**
 * Beobachtung Nummer n eines „Himmels“ mit Hubble-Konstante H₀:
 * Entfernung 10 … 400 Mpc, Eigenbewegung ±300 km/s, Helligkeitsfehler
 * σ = 0,15 mag (≈ 7 % in der Entfernung).
 */
export function observe(n: number, H0: number, seed = 1, scatter = 1): Observation {
  const r = rng(n * 9973 + seed * 131 + 7);
  const dTrue = 10 + 390 * Math.pow(r(), 0.8);
  const pec = 300 * gauss(r) * scatter;
  const vTrue = H0 * dTrue + pec;
  const z = zRelativistic(vTrue);
  const m = M_SN_IA + distanceModulus(dTrue) + 0.15 * gauss(r) * scatter;
  const dMeas = distanceFromModulus(m, M_SN_IA);
  const names = ['NGC', 'UGC', 'IC', 'PGC', 'ESO'];
  const name = `${names[Math.floor(r() * names.length) % names.length]} ${1000 + Math.floor(r() * 8999)}`;
  return { name, dTrue, pec, vTrue, z, m, dMeas, vMeas: C_KMS * betaFromZ(z) };
}

/* ------------------------------------------------------------------ */
/* Friedmann-Modelle                                                    */
/* ------------------------------------------------------------------ */

export interface Cosmo {
  H0: number;
  /** Materie (sichtbar + dunkel) */
  Om: number;
  /** Dunkle Energie */
  OL: number;
  /** Strahlung */
  Or: number;
}

/** Krümmungsanteil Ω_k = 1 − Ω_m − Ω_Λ − Ω_r. */
export const omegaK = (c: Cosmo) => 1 - c.Om - c.OL - c.Or;

/** E(a)² = H(a)²/H₀² = Ω_r/a⁴ + Ω_m/a³ + Ω_k/a² + Ω_Λ. */
export function E2(c: Cosmo, a: number): number {
  return c.Or / a ** 4 + c.Om / a ** 3 + omegaK(c) / (a * a) + c.OL;
}

/** H(z) in km/(s·Mpc). */
export const hubbleAt = (c: Cosmo, z: number) => c.H0 * Math.sqrt(Math.max(0, E2(c, 1 / (1 + z))));

/** Beschleunigung ä/(a·H₀²) = −Ω_r/a⁴ − Ω_m/(2a³) + Ω_Λ (Abbremsung durch Materie). */
export const accel = (c: Cosmo, a: number) => -c.Or / a ** 4 - c.Om / (2 * a ** 3) + c.OL;

/** Abbremsparameter heute q₀ = Ω_r + Ω_m/2 − Ω_Λ. */
export const q0 = (c: Cosmo) => c.Or + c.Om / 2 - c.OL;

export interface ScaleHistory {
  /** Zeitpunkte in Gyr relativ zu heute (heute = 0, Vergangenheit negativ) */
  t: number[];
  a: number[];
  /** Zeit des Urknalls relativ zu heute (negativ) oder null (kein Urknall im Bereich) */
  bang: number | null;
  /** Zeit eines Endknalls (a → 0 in der Zukunft) relativ zu heute oder null */
  crunch: number | null;
  /** größtes a (für geschlossene Modelle) */
  aMax: number | null;
}

/**
 * Skalenfaktor a(t) durch Integration von ä = H₀²·a·accel(a) mit a(0) = 1,
 * ȧ(0) = H₀ (RK4), rückwärts bis a → 0 bzw. tPast und vorwärts bis tFuture.
 * Zeiten in Gyr. Hört auf, wenn a sehr klein oder sehr groß wird.
 */
export function scaleHistory(c: Cosmo, tPast = -30, tFuture = 30, dt = 0.01): ScaleHistory {
  const H = 1 / hubbleTimeGyr(c.H0); // in 1/Gyr
  const f = (a: number, v: number): [number, number] => [v, H * H * a * accel(c, a)];
  const run = (sign: 1 | -1, tEnd: number) => {
    const ts: number[] = [0];
    const as: number[] = [1];
    let a = 1;
    let v = H; // ȧ heute
    let t = 0;
    let end: number | null = null;
    let aMax: number | null = null;
    const h = sign * dt;
    while (Math.abs(t) < Math.abs(tEnd)) {
      const k1 = f(a, v);
      const k2 = f(a + (h / 2) * k1[0], v + (h / 2) * k1[1]);
      const k3 = f(a + (h / 2) * k2[0], v + (h / 2) * k2[1]);
      const k4 = f(a + h * k3[0], v + h * k3[1]);
      const an = a + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
      const vn = v + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
      if (sign === 1 && v > 0 && vn <= 0) aMax = an;
      if (an <= 1e-3 || !Number.isFinite(an)) {
        // linear bis a = 0 ergänzen
        const frac = a / Math.max(a - an, 1e-12);
        end = t + h * Math.min(1, Math.max(0, frac));
        ts.push(end);
        as.push(0);
        break;
      }
      a = an;
      v = vn;
      t += h;
      ts.push(t);
      as.push(a);
      if (a > 50) break;
    }
    return { ts, as, end, aMax };
  };
  const back = run(-1, tPast);
  const fwd = run(1, tFuture);
  const t = [...back.ts.slice(1).reverse(), ...fwd.ts];
  const a = [...back.as.slice(1).reverse(), ...fwd.as];
  return { t, a, bang: back.end, crunch: fwd.end, aMax: fwd.aMax };
}

/**
 * Weltalter t₀ = ∫₀¹ da / (a·H(a)) in Gyr (Simpson, Substitution a = u²
 * wegen des Verhaltens bei a → 0). null, wenn H² irgendwo ≤ 0 (kein Urknall).
 */
export function ageGyr(c: Cosmo, n = 4000): number | null {
  const th = hubbleTimeGyr(c.H0);
  // a = u², da = 2u du: ∫ 2u du / (u² · √E2(u²)) = ∫ 2 du / (u √E2)
  const g = (u: number) => {
    if (u === 0) return 0;
    const e2 = E2(c, u * u);
    if (e2 <= 0) return NaN;
    return 2 / (u * Math.sqrt(e2));
  };
  let s = 0;
  const h = 1 / n;
  for (let i = 0; i <= n; i++) {
    const u = i * h;
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    const val = g(u);
    if (Number.isNaN(val)) return null;
    s += w * val;
  }
  return ((s * h) / 3) * th;
}

/** Alter des Universums zur Rotverschiebung z (Gyr): ∫₀^{1/(1+z)} da/(a H). */
export function ageAtZ(c: Cosmo, z: number, n = 2000): number | null {
  const aEnd = 1 / (1 + z);
  const th = hubbleTimeGyr(c.H0);
  const uEnd = Math.sqrt(aEnd);
  let s = 0;
  const h = uEnd / n;
  for (let i = 0; i <= n; i++) {
    const u = i * h;
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    if (u === 0) continue;
    const e2 = E2(c, u * u);
    if (e2 <= 0) return null;
    s += (w * 2) / (u * Math.sqrt(e2));
  }
  return ((s * h) / 3) * th;
}

/** Rückblickzeit (Lichtlaufzeit) zu z in Gyr. */
export function lookbackGyr(c: Cosmo, z: number): number | null {
  const t0 = ageGyr(c);
  const tz = ageAtZ(c, z);
  return t0 === null || tz === null ? null : t0 - tz;
}

/** Mitbewegte Entfernung D_C = c ∫₀^z dz'/H(z') in Mpc (Simpson). */
export function comovingMpc(c: Cosmo, z: number, n = 1000): number {
  if (z <= 0) return 0;
  const h = z / n;
  let s = 0;
  for (let i = 0; i <= n; i++) {
    const zz = i * h;
    const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
    s += w / hubbleAt(c, zz);
  }
  return ((C_KMS * s * h) / 3);
}

/** Leuchtkraftentfernung (flach angenommen) D_L = (1 + z)·D_C. */
export const luminosityMpc = (c: Cosmo, z: number) => (1 + z) * comovingMpc(c, z);

/* ------------------------------------------------------------------ */
/* Hintergrundstrahlung                                                 */
/* ------------------------------------------------------------------ */

/** Temperatur der Hintergrundstrahlung zur Rotverschiebung z: T = T₀·(1 + z). */
export const cmbTemp = (z: number, T0 = T_CMB) => T0 * (1 + z);
/** Wiensches Verschiebungsgesetz λ_max = b/T (m). */
export const wienPeak = (T: number) => WIEN_B / T;

/** Spektrale Strahldichte nach Planck B_λ(λ, T) in W/(m²·sr·m). */
export function planck(lambdaM: number, T: number): number {
  const x = (H_PLANCK * C_SI) / (lambdaM * K_B * T);
  if (x > 700) return 0;
  return (2 * H_PLANCK * C_SI * C_SI) / lambdaM ** 5 / Math.expm1(x);
}

/** Wichtige Stationen der Geschichte des Universums (Rotverschiebung, Text-Schlüssel). */
export const EPOCHS: readonly { id: string; z: number }[] = [
  { id: 'cmb', z: 1090 },
  { id: 'dark', z: 200 },
  { id: 'stars', z: 20 },
  { id: 'reion', z: 7.7 },
  { id: 'peak', z: 2 },
  { id: 'sun', z: 0.45 },
  { id: 'now', z: 0 },
];

/* ------------------------------------------------------------------ */
/* Rosinenkuchen-Modell                                                 */
/* ------------------------------------------------------------------ */

export interface Dot {
  /** mitbewegte Koordinaten (ändern sich nicht bei der Expansion) */
  x: number;
  y: number;
  /** Form/Farbe (0 … 1) */
  hue: number;
  size: number;
  spiral: boolean;
}

/** Galaxien im mitbewegten Raum: leicht gestörtes Gitter in [−R, R]². */
export function makeDots(seed: number, R = 1, n = 9): Dot[] {
  const r = rng(seed);
  const dots: Dot[] = [];
  const step = (2 * R) / (n - 1);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      dots.push({
        x: -R + i * step + (r() - 0.5) * step * 0.6,
        y: -R + j * step + (r() - 0.5) * step * 0.6,
        hue: r(),
        size: 0.6 + r() * 0.8,
        spiral: r() < 0.6,
      });
    }
  }
  return dots;
}

/**
 * Geschwindigkeit eines Punkts relativ zum Heimatpunkt bei Expansion mit
 * Rate H (pro Zeiteinheit): v = H·(r − r_home) – für jeden Heimatpunkt gleich.
 */
export function relVelocity(dot: { x: number; y: number }, home: { x: number; y: number }, a: number, H: number): [number, number] {
  return [H * a * (dot.x - home.x), H * a * (dot.y - home.y)];
}

/**
 * Rotverschiebung zu einer heutigen (mitbewegten) Entfernung D in Mpc:
 * Umkehrung von comovingMpc durch Bisektion. Liefert Infinity jenseits des
 * Teilchenhorizonts (bis z = 1e4 gesucht).
 */
export function zFromComoving(c: Cosmo, D: number): number {
  if (D <= 0) return 0;
  let lo = 0;
  let hi = 1;
  while (comovingMpc(c, hi, 400) < D) {
    hi *= 2;
    if (hi > 1e4) return Infinity;
  }
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (comovingMpc(c, mid, 400) < D) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Standardmodell für Anzeigen: flach, Ω_m = 0,3, Ω_Λ = 0,7. */
export const lcdm = (H0: number): Cosmo => ({ H0, Om: 0.3, OL: 0.7, Or: 0 });

/** Art des Modells für die Anzeige. */
export function modelKind(c: Cosmo): { curvature: 'flat' | 'open' | 'closed'; accelerating: boolean; bang: boolean } {
  const k = omegaK(c);
  return {
    curvature: Math.abs(k) < 0.005 ? 'flat' : k > 0 ? 'open' : 'closed',
    accelerating: q0(c) < 0,
    bang: ageGyr(c, 800) !== null,
  };
}
