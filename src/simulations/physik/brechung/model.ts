/**
 * Rechenlogik „Brechung und Totalreflexion“: Brechungsgesetz von Snellius,
 * Grenzwinkel, Fresnel-Formeln (Reflexions- und Transmissionsgrad),
 * Lichtgeschwindigkeit im Stoff, planparallele Platte, Prisma (mit
 * Dispersion nach Cauchy als Näherung), scheinbare Hebung, Auswertung einer
 * Messreihe und ein kleiner Strahlverfolger für Glasfaser, Umlenkprisma und
 * Brillant (2D-Schnitt, Strecken und Kreisbögen als Grenzflächen).
 */

/** Brechzahlen der wählbaren Stoffe (gerundete Tabellenwerte für gelbes Licht, 589 nm). */
export const MEDIA = {
  luft: 1.0,
  wasser: 1.33,
  plexiglas: 1.49,
  glas: 1.52,
  diamant: 2.42,
} as const;
export type MediumId = keyof typeof MEDIA;

/** Lichtgeschwindigkeit im Vakuum in m/s. */
export const C0 = 299_792_458;

export const toRad = (deg: number) => (deg * Math.PI) / 180;
export const toDeg = (rad: number) => (rad * 180) / Math.PI;

/* ------------------------------------------------------------------ */
/* Brechungsgesetz und Grenzwinkel                                      */
/* ------------------------------------------------------------------ */

/** Brechungswinkel β in Grad aus n₁ · sin α = n₂ · sin β oder `null` bei Totalreflexion. */
export function refractionAngle(n1: number, n2: number, alphaDeg: number): number | null {
  const s = (n1 / n2) * Math.sin(toRad(alphaDeg));
  if (Math.abs(s) > 1 + 1e-12) return null;
  return toDeg(Math.asin(Math.max(-1, Math.min(1, s))));
}

/** Grenzwinkel der Totalreflexion in Grad (nur beim Übergang ins optisch dünnere Medium). */
export function criticalAngle(n1: number, n2: number): number | null {
  return n1 > n2 ? toDeg(Math.asin(n2 / n1)) : null;
}

/** Brewster-Winkel in Grad: Reflektiertes Licht ist dort vollständig s-polarisiert (R_p = 0). */
export function brewsterAngle(n1: number, n2: number): number {
  return toDeg(Math.atan(n2 / n1));
}

/** Steigung der Geraden sin β über sin α: n₁/n₂. */
export const sineRatio = (n1: number, n2: number) => n1 / n2;

/* ------------------------------------------------------------------ */
/* Fresnel-Formeln                                                      */
/* ------------------------------------------------------------------ */

export interface Fresnel {
  /** Reflexionsgrade für senkrecht (s) und parallel (p) zur Einfallsebene schwingendes Licht. */
  rs: number;
  rp: number;
  /** Reflexionsgrad für unpolarisiertes Licht (Mittel aus s und p). */
  R: number;
  /** Transmissionsgrade, aus den Amplituden-Durchlasszahlen berechnet (nicht als 1 − R). */
  ts: number;
  tp: number;
  T: number;
  /** Totalreflexion (kein gebrochener Strahl). */
  total: boolean;
}

/** Fresnel-Formeln für eine ebene Grenzfläche (nichtabsorbierende Stoffe). */
export function fresnel(n1: number, n2: number, alphaDeg: number): Fresnel {
  const beta = refractionAngle(n1, n2, alphaDeg);
  if (beta === null) return { rs: 1, rp: 1, R: 1, ts: 0, tp: 0, T: 0, total: true };
  const ca = Math.cos(toRad(alphaDeg));
  const cb = Math.cos(toRad(beta));
  const rsA = (n1 * ca - n2 * cb) / (n1 * ca + n2 * cb);
  const rpA = (n2 * ca - n1 * cb) / (n2 * ca + n1 * cb);
  const tsA = (2 * n1 * ca) / (n1 * ca + n2 * cb);
  const tpA = (2 * n1 * ca) / (n2 * ca + n1 * cb);
  // Leistungsanteile: Transmission mit dem Faktor n₂·cos β / (n₁·cos α) (Strahlquerschnitt und Geschwindigkeit)
  const k = (n2 * cb) / (n1 * ca);
  const rs = rsA * rsA;
  const rp = rpA * rpA;
  const ts = k * tsA * tsA;
  const tp = k * tpA * tpA;
  return { rs, rp, R: (rs + rp) / 2, ts, tp, T: (ts + tp) / 2, total: false };
}

/** Reflektierter Anteil für unpolarisiertes Licht. */
export function reflectance(n1: number, n2: number, alphaDeg: number): number {
  return Math.min(1, fresnel(n1, n2, alphaDeg).R);
}

/** Reflexionsgrad bei senkrechtem Einfall: ((n₂ − n₁)/(n₂ + n₁))². */
export function normalReflectance(n1: number, n2: number): number {
  return ((n2 - n1) / (n2 + n1)) ** 2;
}

/* ------------------------------------------------------------------ */
/* Lichtgeschwindigkeit und Wellenlänge                                 */
/* ------------------------------------------------------------------ */

/** Lichtgeschwindigkeit im Stoff in km/s (wie bisher). */
export function lightSpeed(n: number): number {
  return C0 / 1000 / n;
}

/** Lichtgeschwindigkeit im Stoff in m/s: c = c₀/n. */
export function lightSpeedMs(n: number): number {
  return C0 / n;
}

/** Wellenlänge im Stoff: λ = λ₀/n (die Frequenz bleibt gleich). */
export function wavelengthIn(lambda0: number, n: number): number {
  return lambda0 / n;
}

/* ------------------------------------------------------------------ */
/* Planparallele Platte, Prisma, scheinbare Hebung                      */
/* ------------------------------------------------------------------ */

/** Seitlicher Versatz Δ = d · sin(α − β) / cos β eines Strahls durch eine Platte der Dicke d. */
export function plateShift(alphaDeg: number, nPlate: number, nOut: number, d: number): number {
  const beta = refractionAngle(nOut, nPlate, alphaDeg);
  if (beta === null) return 0;
  return (d * Math.sin(toRad(alphaDeg - beta))) / Math.cos(toRad(beta));
}

export interface PrismPath {
  /** Brechungswinkel an der ersten Fläche, Einfallswinkel und Austrittswinkel an der zweiten (Grad). */
  beta1: number;
  alpha2: number;
  beta2: number;
  /** Gesamtablenkung δ = α₁ + β₂ − γ. */
  delta: number;
}

/**
 * Strahlengang durch ein Prisma mit brechendem Winkel γ (Grad) im Hauptschnitt.
 * `null`, wenn das Licht an der zweiten Fläche totalreflektiert wird.
 */
export function prismPath(apexDeg: number, alphaDeg: number, n: number, nOut = 1): PrismPath | null {
  const beta1 = refractionAngle(nOut, n, alphaDeg)!;
  const alpha2 = apexDeg - beta1;
  const beta2 = refractionAngle(n, nOut, alpha2);
  if (beta2 === null) return null;
  return { beta1, alpha2, beta2, delta: alphaDeg + beta2 - apexDeg };
}

/** Kleinste Ablenkung (symmetrischer Durchgang): δ_min = 2 · arcsin(n · sin(γ/2)) − γ. */
export function minDeviation(apexDeg: number, n: number, nOut = 1): number | null {
  const s = (n / nOut) * Math.sin(toRad(apexDeg / 2));
  if (s > 1) return null;
  return 2 * toDeg(Math.asin(s)) - apexDeg;
}

/** Cauchy-Koeffizienten für ein Kronglas (Näherung, λ in nm): n(λ) = A + B/λ². */
export const CAUCHY_CROWN = { A: 1.5046, B: 4200 };

/** Brechzahl von Kronglas bei der Wellenlänge λ (nm) nach Cauchy – nur eine Näherung im sichtbaren Bereich. */
export function cauchyIndex(lambdaNm: number, c = CAUCHY_CROWN): number {
  return c.A + c.B / (lambdaNm * lambdaNm);
}

/**
 * Scheinbare Tiefe eines Gegenstands in der Tiefe h (Stoff n₁, Licht steigt mit dem
 * Einfallswinkel α zur Oberfläche, Auge im Stoff n₂ darüber). Der zurückverlängerte
 * Strahl schneidet die Senkrechte über dem Gegenstand in der Tiefe h' = h · tan α / tan β.
 * Für α → 0 gilt h' = h · n₂/n₁. `null` bei Totalreflexion.
 */
export function apparentDepth(h: number, n1: number, n2: number, alphaDeg: number): number | null {
  if (alphaDeg < 1e-6) return (h * n2) / n1;
  const beta = refractionAngle(n1, n2, alphaDeg);
  if (beta === null || beta >= 90 - 1e-9) return null;
  return (h * Math.tan(toRad(alphaDeg))) / Math.tan(toRad(beta));
}

/* ------------------------------------------------------------------ */
/* Messreihe: unbekannter Stoff                                         */
/* ------------------------------------------------------------------ */

/** Proben für die Entdeckungsaufgabe (Tabellenwerte für gelbes Licht). */
export const SAMPLES = [
  { n: 1.31, de: 'Eis', en: 'ice' },
  { n: 1.36, de: 'Ethanol', en: 'ethanol' },
  { n: 1.47, de: 'Glycerin', en: 'glycerol' },
  { n: 1.52, de: 'Kronglas', en: 'crown glass' },
  { n: 1.62, de: 'Flintglas', en: 'flint glass' },
  { n: 1.77, de: 'Saphir', en: 'sapphire' },
  { n: 2.15, de: 'Zirkonia', en: 'cubic zirconia' },
  { n: 2.42, de: 'Diamant', en: 'diamond' },
] as const;

/** Ablesung am Winkelmesser: auf halbe Grad gerundet. */
export function readAngle(deg: number, step = 0.5): number {
  return Math.round(deg / step) * step;
}

/** Steigung einer Ursprungsgeraden y = k · x nach der Methode der kleinsten Quadrate. */
export function slopeThroughOrigin(pts: readonly (readonly [number, number])[]): number | null {
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of pts) {
    sxy += x * y;
    sxx += x * x;
  }
  return sxx > 1e-12 ? sxy / sxx : null;
}

/**
 * Brechzahl aus Messpaaren (α, β) beim Übergang aus Luft (n = 1): sin β = sin α / n,
 * also n = 1 / Steigung von sin β über sin α. `null` ohne verwertbare Messung.
 */
export function indexFromSeries(rows: readonly (readonly [number, number])[], nOut = 1): number | null {
  const pts = rows.filter(([a]) => a > 0.5).map(([a, b]) => [Math.sin(toRad(a)), Math.sin(toRad(b))] as const);
  const k = slopeThroughOrigin(pts);
  return k && k > 0 ? nOut / k : null;
}

/** Nächster Tabellenwert zu einer gemessenen Brechzahl. */
export function nearestSample(n: number): number {
  let best = 0;
  SAMPLES.forEach((s, i) => {
    if (Math.abs(s.n - n) < Math.abs(SAMPLES[best]!.n - n)) best = i;
  });
  return best;
}

/* ------------------------------------------------------------------ */
/* Strahlverfolgung                                                     */
/* ------------------------------------------------------------------ */

export type V2 = [number, number];

/** Grenzfläche: Strecke von a nach b oder Kreisbogen um c (Winkel from … to gegen den Uhrzeigersinn). */
export type Edge = { kind: 'seg'; a: V2; b: V2; tag: string } | { kind: 'arc'; c: V2; r: number; from: number; to: number; tag: string };

export interface TraceSeg {
  a: V2;
  b: V2;
  /** Lichtanteil (1 = einfallender Strahl). */
  I: number;
  /** Verläuft im Inneren des Körpers. */
  inside: boolean;
  /** Index des Vorgängers (−1 beim ersten Stück). */
  parent: number;
  /** Endet an einer Grenzfläche (mit Kennung, Einfallswinkel und ob totalreflektiert wird). */
  tag: string | null;
  angle: number;
  tir: boolean;
}

export interface TraceResult {
  segs: TraceSeg[];
  /** Summe der Lichtanteile, die von innen auf Flächen mit der jeweiligen Kennung treffen. */
  arrived: Record<string, number>;
  /** Summe der Lichtanteile, die durch Flächen mit der jeweiligen Kennung nach außen treten. */
  left: Record<string, number>;
}

const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];

/** Schnitt des Strahls p + t·d mit einer Grenzfläche: kleinstes t > ε und Normale. */
function intersect(e: Edge, p: V2, d: V2): { t: number; n: V2 } | null {
  const eps = 1e-7;
  if (e.kind === 'seg') {
    const ex = e.b[0] - e.a[0];
    const ey = e.b[1] - e.a[1];
    const den = d[0] * ey - d[1] * ex;
    if (Math.abs(den) < 1e-12) return null;
    const qx = e.a[0] - p[0];
    const qy = e.a[1] - p[1];
    const t = (qx * ey - qy * ex) / den;
    const u = (qx * d[1] - qy * d[0]) / den;
    if (t <= eps || u < -1e-9 || u > 1 + 1e-9) return null;
    const len = Math.hypot(ex, ey);
    return { t, n: [-ey / len, ex / len] };
  }
  const ox = p[0] - e.c[0];
  const oy = p[1] - e.c[1];
  const b = ox * d[0] + oy * d[1];
  const c = ox * ox + oy * oy - e.r * e.r;
  const disc = b * b - c;
  if (disc < 0) return null;
  const sq = Math.sqrt(disc);
  for (const t of [-b - sq, -b + sq]) {
    if (t <= eps) continue;
    const x = ox + t * d[0];
    const y = oy + t * d[1];
    const two = 2 * Math.PI;
    const ang = (((Math.atan2(y, x) - e.from) % two) + two) % two;
    if (ang <= e.to - e.from + 1e-9) return { t, n: [x / e.r, y / e.r] };
  }
  return null;
}

/**
 * Verfolgt einen Lichtstrahl durch einen Körper (Brechzahl nIn) in einer Umgebung
 * (nOut). An jeder Grenzfläche teilt sich das Licht nach den Fresnel-Formeln in einen
 * reflektierten und einen gebrochenen Anteil; bei Totalreflexion wird alles reflektiert.
 * Sehr schwache Anteile (< minI) werden nicht weiter verfolgt.
 */
export function traceShape(edges: readonly Edge[], nIn: number, nOut: number, start: V2, dir: V2, opts: { inside?: boolean; minI?: number; maxSegs?: number; far?: number } = {}): TraceResult {
  const minI = opts.minI ?? 0.01;
  const maxSegs = opts.maxSegs ?? 400;
  const far = opts.far ?? 40;
  const segs: TraceSeg[] = [];
  const arrived: Record<string, number> = {};
  const left: Record<string, number> = {};
  const len = Math.hypot(dir[0], dir[1]);
  const queue: { p: V2; d: V2; I: number; inside: boolean; parent: number }[] = [{ p: start, d: [dir[0] / len, dir[1] / len], I: 1, inside: opts.inside ?? false, parent: -1 }];
  while (queue.length && segs.length < maxSegs) {
    const ray = queue.shift()!;
    let best: { t: number; n: V2; e: Edge } | null = null;
    for (const e of edges) {
      const h = intersect(e, ray.p, ray.d);
      if (h && (!best || h.t < best.t)) best = { ...h, e };
    }
    if (!best) {
      segs.push({ a: ray.p, b: [ray.p[0] + ray.d[0] * far, ray.p[1] + ray.d[1] * far], I: ray.I, inside: ray.inside, parent: ray.parent, tag: null, angle: 0, tir: false });
      continue;
    }
    const q: V2 = [ray.p[0] + ray.d[0] * best.t, ray.p[1] + ray.d[1] * best.t];
    let nrm = best.n;
    if (dot(ray.d, nrm) > 0) nrm = [-nrm[0], -nrm[1]];
    const cosi = Math.min(1, -dot(ray.d, nrm));
    const angle = toDeg(Math.acos(cosi));
    const n1 = ray.inside ? nIn : nOut;
    const n2 = ray.inside ? nOut : nIn;
    const f = fresnel(n1, n2, angle);
    const idx = segs.length;
    segs.push({ a: ray.p, b: q, I: ray.I, inside: ray.inside, parent: ray.parent, tag: best.e.tag, angle, tir: f.total });
    if (ray.inside) arrived[best.e.tag] = (arrived[best.e.tag] ?? 0) + ray.I;
    const refl: V2 = [ray.d[0] + 2 * cosi * nrm[0], ray.d[1] + 2 * cosi * nrm[1]];
    const rI = ray.I * f.R;
    if (rI >= minI) queue.push({ p: q, d: refl, I: rI, inside: ray.inside, parent: idx });
    if (!f.total) {
      const eta = n1 / n2;
      const k = Math.sqrt(Math.max(0, 1 - eta * eta * (1 - cosi * cosi)));
      const tr: V2 = [eta * ray.d[0] + (eta * cosi - k) * nrm[0], eta * ray.d[1] + (eta * cosi - k) * nrm[1]];
      const tI = ray.I * f.T;
      if (ray.inside) left[best.e.tag] = (left[best.e.tag] ?? 0) + tI;
      if (tI >= minI) queue.push({ p: q, d: tr, I: tI, inside: !ray.inside, parent: idx });
    }
  }
  return { segs, arrived, left };
}

/** Hauptweg: vom ersten Stück aus immer dem hellsten Nachfolger folgen. */
export function mainPath(res: TraceResult): number[] {
  const out: number[] = [];
  let cur = res.segs.findIndex((s) => s.parent === -1);
  while (cur >= 0) {
    out.push(cur);
    let next = -1;
    res.segs.forEach((s, i) => {
      if (s.parent === cur && (next < 0 || s.I > res.segs[next]!.I)) next = i;
    });
    cur = next;
  }
  return out;
}

/* ---------- Körper ---------- */

/** Geschlossenes Vieleck als Grenzflächen (Kennungen je Seite). */
export function polygonEdges(pts: readonly V2[], tags: readonly string[]): Edge[] {
  return pts.map((a, i) => ({ kind: 'seg' as const, a, b: pts[(i + 1) % pts.length]!, tag: tags[i] ?? 'side' }));
}

export interface FiberGeometry {
  /** Dicke d, gerades Stück L₁, Biegeradius R (Mittellinie, 90°-Bogen), gerades Endstück L₂. */
  d: number;
  L1: number;
  R: number;
  L2: number;
}

/**
 * Glasfaser im Längsschnitt: gerades Stück nach rechts, 90°-Bogen nach unten,
 * gerades Endstück. Eintritt links (Kennung „in“), Austritt unten („out“), Wände „wall“.
 */
export function fiberEdges(f: FiberGeometry): Edge[] {
  const { d, L1, R, L2 } = f;
  const h = d / 2;
  const c: V2 = [L1, -R];
  const x0 = L1 + R;
  return [
    { kind: 'seg', a: [0, -h], b: [0, h], tag: 'in' },
    { kind: 'seg', a: [0, h], b: [L1, h], tag: 'wall' },
    { kind: 'arc', c, r: R + h, from: 0, to: Math.PI / 2, tag: 'wall' },
    { kind: 'seg', a: [x0 + h, -R], b: [x0 + h, -R - L2], tag: 'wall' },
    { kind: 'seg', a: [x0 + h, -R - L2], b: [x0 - h, -R - L2], tag: 'out' },
    { kind: 'seg', a: [x0 - h, -R - L2], b: [x0 - h, -R], tag: 'wall' },
    { kind: 'arc', c, r: R - h, from: 0, to: Math.PI / 2, tag: 'wall' },
    { kind: 'seg', a: [L1, -h], b: [0, -h], tag: 'wall' },
  ];
}

/**
 * Licht, das unter dem Winkel θ (Grad, zur Faserachse) an der Stelle y₀ der Stirnfläche
 * (−d/2 < y₀ < d/2) in die Faser fällt.
 */
export function traceFiber(f: FiberGeometry, thetaDeg: number, nCore: number, nClad: number, y0 = 0, nAir = 1): TraceResult & { delivered: number } {
  const t = toRad(thetaDeg);
  const d: V2 = [Math.cos(t), -Math.sin(t)];
  // Eintritt aus Luft: zuerst die Stirnfläche (Brechung aus nAir), danach Faser in der Umgebung nClad
  const entry = fresnel(nAir, nCore, Math.abs(thetaDeg));
  const b1 = toRad(refractionAngle(nAir, nCore, Math.abs(thetaDeg))!) * Math.sign(thetaDeg || 1);
  const res = traceShape(fiberEdges(f), nCore, nClad, [0, y0], [Math.cos(b1), -Math.sin(b1)], { inside: true, minI: 0.004, maxSegs: 500 });
  // Anteil, der nach dem Eintritt die Endfläche erreicht
  const delivered = entry.T * (res.arrived.out ?? 0);
  return { ...res, delivered, segs: [{ a: [-3 * d[0], y0 - 3 * d[1]], b: [0, y0], I: 1, inside: false, parent: -1, tag: 'in', angle: Math.abs(thetaDeg), tir: false }, ...res.segs.map((s) => ({ ...s, I: s.I * entry.T, parent: s.parent + 1 }))] };
}

/** Mittlerer Anteil, der am Ende ankommt, für ein Lichtbündel über die ganze Stirnfläche (9 Strahlen). */
export function fiberDelivery(f: FiberGeometry, thetaDeg: number, nCore: number, nClad: number): number {
  let sum = 0;
  for (let k = -4; k <= 4; k++) sum += traceFiber(f, thetaDeg, nCore, nClad, (k / 10) * f.d).delivered;
  return sum / 9;
}

/**
 * Akzeptanzwinkel einer Stufenindexfaser in Luft: sin θ_max = √(n_Kern² − n_Mantel²)
 * (numerische Apertur). Ist der Wert ≥ 1, wird jeder Winkel bis 90° geführt.
 */
export function acceptanceAngle(nCore: number, nClad: number, nAir = 1): number | null {
  if (nCore <= nClad) return null;
  const na = Math.sqrt(nCore * nCore - nClad * nClad) / nAir;
  return na >= 1 ? 90 : toDeg(Math.asin(na));
}

/** Umlenkprisma: rechtwinklig-gleichschenklig, Schenkel a; Eintritt links, Hypotenuse, Austritt unten. */
export function prismEdges(a: number): Edge[] {
  return polygonEdges(
    [
      [0, 0],
      [0, a],
      [a, 0],
    ],
    ['in', 'hyp', 'out'],
  );
}

/**
 * Querschnitt eines Brillanten (Rundiste mit Durchmesser 2): Tafel 56 % des Durchmessers,
 * Oberteil 34,5°, Unterteil 40,75° – typische Werte eines „idealen“ Schliffs.
 */
export function gemOutline(): V2[] {
  const table = 0.56;
  const crown = (1 - table) * Math.tan(toRad(34.5));
  const pav = Math.tan(toRad(40.75));
  return [
    [-table, crown],
    [table, crown],
    [1, 0],
    [0, -pav],
    [-1, 0],
  ];
}

export function gemEdges(): Edge[] {
  return polygonEdges(gemOutline(), ['top', 'top', 'bottom', 'bottom', 'top']);
}

/** Planparallele Platte der Dicke d (von y = −d/2 bis d/2), sehr breit. */
export function plateEdges(d: number, w = 30): Edge[] {
  return polygonEdges(
    [
      [-w, d / 2],
      [w, d / 2],
      [w, -d / 2],
      [-w, -d / 2],
    ],
    ['top', 'side', 'bottom', 'side'],
  );
}

/** Prisma mit brechendem Winkel γ (Spitze oben), Seitenlänge s, Grundseite auf y = 0. */
export function apexPrism(apexDeg: number, s: number): V2[] {
  const half = toRad(apexDeg / 2);
  return [
    [0, s * Math.cos(half)],
    [s * Math.sin(half), 0],
    [-s * Math.sin(half), 0],
  ];
}
