/**
 * Rechenlogik „Magnete und Kompass“.
 *
 * Ein Stabmagnet wird durch zwei Pole (magnetische „Ladungen“ +q am Nordpol,
 * −q am Südpol) beschrieben. Das Feld eines Pols fällt wie 1/r² ab, das des
 * ganzen Magneten in großer Entfernung wie 1/r³ (Dipol). Längen in cm, die
 * Feldstärke in willkürlichen Einheiten (für Klasse 5–7 genügt „stärker“
 * und „schwächer“).
 */

export type V2 = readonly [number, number];

export interface Magnet {
  /** Mittelpunkt in cm */
  x: number;
  y: number;
  /** Richtung vom Süd- zum Nordpol (Bogenmaß, 0 = nach rechts) */
  ang: number;
  /** Länge in cm */
  len: number;
  /** Polstärke (willkürliche Einheit) */
  q: number;
}

export interface Pole {
  x: number;
  y: number;
  /** +q: Nordpol, −q: Südpol */
  q: number;
}

/** Pole eines Stabmagneten (die Pole sitzen etwas innerhalb der Enden). */
export function poles(m: Magnet, inset = 0.12): [Pole, Pole] {
  const h = (m.len / 2) * (1 - inset);
  const ux = Math.cos(m.ang);
  const uy = Math.sin(m.ang);
  return [
    { x: m.x + ux * h, y: m.y + uy * h, q: m.q },
    { x: m.x - ux * h, y: m.y - uy * h, q: -m.q },
  ];
}

/** Feld einzelner Pole; soft verhindert Unendlich direkt am Pol. */
export function polesField(ps: readonly Pole[], x: number, y: number, soft = 0.25): V2 {
  let bx = 0;
  let by = 0;
  for (const p of ps) {
    const dx = x - p.x;
    const dy = y - p.y;
    const r2 = dx * dx + dy * dy + soft * soft;
    const k = p.q / (r2 * Math.sqrt(r2));
    bx += k * dx;
    by += k * dy;
  }
  return [bx, by];
}

/** Feld mehrerer Stabmagnete (Überlagerung), optional ohne Magnet `skip`. */
export function magnetsField(ms: readonly Magnet[], x: number, y: number, skip = -1): V2 {
  const ps: Pole[] = [];
  ms.forEach((m, i) => {
    if (i !== skip) ps.push(...poles(m));
  });
  return polesField(ps, x, y);
}

/**
 * Exaktes Feld eines punktförmigen Dipols mit Moment (mx | my) im Ursprung:
 * B = (3·(m·r̂)·r̂ − m) / r³.
 */
export function dipoleField(mx: number, my: number, x: number, y: number): V2 {
  const r = Math.hypot(x, y);
  if (r === 0) return [0, 0];
  const ux = x / r;
  const uy = y / r;
  const mr = mx * ux + my * uy;
  const r3 = r * r * r;
  return [(3 * mr * ux - mx) / r3, (3 * mr * uy - my) / r3];
}

/** Betrag eines Vektors. */
export const mag = (v: V2) => Math.hypot(v[0], v[1]);

/**
 * Kraft und Drehmoment (um den Mittelpunkt) auf Magnet i durch alle anderen.
 * Kraft auf einen Pol: F = q · B. Positives Drehmoment dreht gegen den Uhrzeigersinn.
 */
export function forceOn(ms: readonly Magnet[], i: number): { F: V2; torque: number } {
  const m = ms[i]!;
  let fx = 0;
  let fy = 0;
  let t = 0;
  for (const p of poles(m)) {
    const [bx, by] = magnetsField(ms, p.x, p.y, i);
    const px = p.q * bx;
    const py = p.q * by;
    fx += px;
    fy += py;
    t += (p.x - m.x) * py - (p.y - m.y) * px;
  }
  return { F: [fx, fy], torque: t };
}

/** Anziehung (+1), Abstoßung (−1) oder nichts (0) entlang der Verbindungslinie von a nach b. */
export function interaction(ms: readonly Magnet[], i: number, j: number): -1 | 0 | 1 {
  const { F } = forceOn(ms, j);
  const dx = ms[i]!.x - ms[j]!.x;
  const dy = ms[i]!.y - ms[j]!.y;
  const along = F[0] * dx + F[1] * dy;
  if (Math.abs(along) < 1e-12) return 0;
  return along > 0 ? 1 : -1;
}

/* ------------------------------------------------------------------ */
/* Kompass                                                              */
/* ------------------------------------------------------------------ */

/**
 * Richtung, in die der Nordpol einer Kompassnadel zeigt: Winkel gegen
 * „oben“ (Norden), im Uhrzeigersinn. Die Nadel stellt sich in Feldrichtung.
 * earth: zusätzliches, nach oben gerichtetes Erdfeld.
 */
export function compassAngle(bx: number, by: number, earth = 0): number {
  return Math.atan2(bx, by + earth);
}

/* ------------------------------------------------------------------ */
/* Feldlinien                                                           */
/* ------------------------------------------------------------------ */

export interface TraceOpts {
  step: number;
  maxSteps: number;
  box: { x0: number; x1: number; y0: number; y1: number };
  /** Abbruch in der Nähe dieser Punkte (Südpole) */
  stops?: readonly { x: number; y: number; r: number }[];
}

/** Feldlinie mit Runge-Kutta in Richtung des Feldes (dir = 1) oder dagegen. */
export function traceLine(field: (x: number, y: number) => V2, x0: number, y0: number, o: TraceOpts, dir: 1 | -1 = 1): V2[] {
  const pts: V2[] = [[x0, y0]];
  const f = (x: number, y: number): V2 => {
    const [bx, by] = field(x, y);
    const L = Math.hypot(bx, by);
    if (!(L > 0) || !Number.isFinite(L)) return [0, 0];
    return [(dir * bx) / L, (dir * by) / L];
  };
  let x = x0;
  let y = y0;
  const h = o.step;
  for (let i = 0; i < o.maxSteps; i++) {
    const k1 = f(x, y);
    if (k1[0] === 0 && k1[1] === 0) break;
    const k2 = f(x + (h / 2) * k1[0], y + (h / 2) * k1[1]);
    const k3 = f(x + (h / 2) * k2[0], y + (h / 2) * k2[1]);
    const k4 = f(x + h * k3[0], y + h * k3[1]);
    x += (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    pts.push([x, y]);
    if (x < o.box.x0 || x > o.box.x1 || y < o.box.y0 || y > o.box.y1) break;
    if (o.stops?.some((s) => Math.hypot(x - s.x, y - s.y) < s.r)) break;
  }
  return pts;
}

/** Startpunkte für Feldlinien: im Kreis um jeden Nordpol. */
export function seeds(ms: readonly Magnet[], perPole: number, r = 0.55): V2[] {
  const out: V2[] = [];
  for (const m of ms) {
    const [n] = poles(m);
    for (let k = 0; k < perPole; k++) {
      const a = m.ang + ((k + 0.5) / perPole) * 2 * Math.PI;
      out.push([n.x + r * Math.cos(a), n.y + r * Math.sin(a)]);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Elementarmagnete                                                     */
/* ------------------------------------------------------------------ */

export interface Domain {
  x: number;
  y: number;
  /** Richtung des kleinen Nordpols (Bogenmaß) */
  a: number;
}

/** Zufallszahlen mit festem Startwert (gleiche Bilder bei gleichem Link). */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/** Gitter aus cols × rows Elementarmagneten mit zufälliger Richtung. */
export function makeDomains(cols: number, rows: number, seed: number): Domain[] {
  const r = rng(seed);
  const out: Domain[] = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) out.push({ x: (i + 0.5) / cols, y: (j + 0.5) / rows, a: r() * 2 * Math.PI });
  return out;
}

/** Mittlere Ausrichtung: Vektor (mx | my) und Betrag 0 … 1 (Magnetisierung). */
export function magnetization(ds: readonly Domain[]): { mx: number; my: number; M: number } {
  if (!ds.length) return { mx: 0, my: 0, M: 0 };
  let mx = 0;
  let my = 0;
  for (const d of ds) {
    mx += Math.cos(d.a);
    my += Math.sin(d.a);
  }
  mx /= ds.length;
  my /= ds.length;
  return { mx, my, M: Math.hypot(mx, my) };
}

/** Kürzeste Drehung von a nach b (−π … π). */
export const angDiff = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/**
 * Streichen mit einem Magneten: Elementarmagnete im Bereich [x0, x1] drehen
 * sich um den Anteil k in Richtung target (etwas Zufall bleibt).
 */
export function align(ds: Domain[], target: number, k: number, x0 = 0, x1 = 1, r?: () => number): void {
  for (const d of ds) {
    if (d.x < x0 || d.x > x1) continue;
    const noise = r ? (r() - 0.5) * 0.3 : 0;
    d.a += angDiff(d.a, target) * Math.min(1, k) + noise * (1 - Math.min(1, k));
  }
}

/** Erschüttern (Hammer) oder Erhitzen: zufällige Drehung um bis zu ±amount. */
export function shake(ds: Domain[], amount: number, r: () => number): void {
  for (const d of ds) d.a += (r() - 0.5) * 2 * amount;
}

/** Wie viele Büroklammern ein Nagel mit Magnetisierung M (0 … 1) ungefähr hält. */
export function paperclips(M: number): number {
  if (M < 0.2) return 0;
  return Math.min(8, Math.floor(((M - 0.2) / 0.8) * 8.999));
}

/** Teilt einen Magneten in n gleich lange Stücke – jedes ist wieder ein ganzer Magnet. */
export function breakMagnet(m: Magnet, n: number, gap = 0.6): Magnet[] {
  const ux = Math.cos(m.ang);
  const uy = Math.sin(m.ang);
  const piece = m.len / n;
  const total = m.len + gap * (n - 1);
  const out: Magnet[] = [];
  for (let k = 0; k < n; k++) {
    const s = -total / 2 + piece / 2 + k * (piece + gap);
    out.push({ x: m.x + ux * s, y: m.y + uy * s, ang: m.ang, len: piece, q: m.q });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Erdmagnetfeld                                                        */
/* ------------------------------------------------------------------ */

/**
 * Inklination eines Dipolfeldes an der magnetischen Breite φ:
 * tan I = 2 · tan φ (Grad). Am Äquator waagerecht, an den Polen senkrecht.
 */
export function inclination(latDeg: number): number {
  return (Math.atan(2 * Math.tan((latDeg * Math.PI) / 180)) * 180) / Math.PI;
}

/** Verhältnis der Feldstärke an der Breite φ zu der am Äquator: √(1 + 3·sin²φ). */
export const fieldRatio = (latDeg: number) => Math.sqrt(1 + 3 * Math.sin((latDeg * Math.PI) / 180) ** 2);

/**
 * Erdfeld als Dipol im Erdmittelpunkt. Der magnetische Südpol liegt
 * beim geografischen Nordpol, deshalb zeigt das Moment nach unten (Süden).
 * tilt: Neigung der Magnetachse gegen die Drehachse (Bogenmaß).
 */
export function earthField(x: number, y: number, tilt: number): V2 {
  return dipoleField(Math.sin(tilt), -Math.cos(tilt), x, y);
}

/* ------------------------------------------------------------------ */
/* Was zieht ein Magnet an?                                             */
/* ------------------------------------------------------------------ */

export interface Thing {
  id: string;
  de: string;
  en: string;
  magnetic: boolean;
  /** Begründung */
  whyDe: string;
  whyEn: string;
}

export const THINGS: readonly Thing[] = [
  { id: 'nail', de: 'Eisennagel', en: 'iron nail', magnetic: true, whyDe: 'Eisen ist ferromagnetisch.', whyEn: 'Iron is ferromagnetic.' },
  { id: 'clip', de: 'Büroklammer', en: 'paper clip', magnetic: true, whyDe: 'Sie ist aus Stahl, also vor allem aus Eisen.', whyEn: 'It is made of steel, which is mostly iron.' },
  { id: 'cent', de: '1-Cent-Münze', en: '1 cent coin', magnetic: true, whyDe: 'Innen Stahl, nur außen mit Kupfer überzogen.', whyEn: 'Steel inside, only coated with copper.' },
  { id: 'euro', de: '1-Euro-Münze', en: '1 euro coin', magnetic: true, whyDe: 'Im Kern steckt Nickel – der Magnet zieht schwach.', whyEn: 'The core contains nickel – the magnet pulls weakly.' },
  { id: 'scissors', de: 'Schere (Stahl)', en: 'scissors (steel)', magnetic: true, whyDe: 'Die Klingen sind aus Stahl.', whyEn: 'The blades are made of steel.' },
  { id: 'can', de: 'Konservendose', en: 'tin can', magnetic: true, whyDe: 'Weißblech ist Stahl mit dünnem Zinn darauf.', whyEn: 'Tinplate is steel with a thin layer of tin.' },
  { id: 'foil', de: 'Alufolie', en: 'aluminium foil', magnetic: false, whyDe: 'Aluminium ist ein Metall, wird aber nicht angezogen.', whyEn: 'Aluminium is a metal, but it is not attracted.' },
  { id: 'wire', de: 'Kupferdraht', en: 'copper wire', magnetic: false, whyDe: 'Kupfer wird nicht angezogen.', whyEn: 'Copper is not attracted.' },
  { id: 'ring', de: 'Goldring', en: 'gold ring', magnetic: false, whyDe: 'Gold wird nicht angezogen.', whyEn: 'Gold is not attracted.' },
  { id: 'eraser', de: 'Radiergummi', en: 'eraser', magnetic: false, whyDe: 'Kein Metall.', whyEn: 'Not a metal.' },
  { id: 'pencil', de: 'Bleistift', en: 'pencil', magnetic: false, whyDe: 'Holz und Grafit werden nicht angezogen.', whyEn: 'Wood and graphite are not attracted.' },
  { id: 'glass', de: 'Glasmurmel', en: 'glass marble', magnetic: false, whyDe: 'Glas wird nicht angezogen.', whyEn: 'Glass is not attracted.' },
];

/** Reihenfolge der Gegenstände für Runde n (fest, aber gemischt). */
export function thingOrder(n: number): Thing[] {
  const r = rng(1000 + n * 7919);
  const arr = [...THINGS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Ein Stück Eisen im Feld wird selbst zum Magneten (Influenz): Es richtet sich
 * nach dem Feld an seinem Ort aus, die Polstärke wächst mit dem Feld (bis qMax).
 * Deshalb wird Eisen von beiden Polen angezogen.
 */
export function induced(ms: readonly Magnet[], x: number, y: number, len: number, k: number, qMax = 1): Magnet {
  const [bx, by] = magnetsField(ms, x, y);
  return { x, y, ang: Math.atan2(by, bx), len, q: Math.min(qMax, k * Math.hypot(bx, by)) };
}
