/**
 * Rechenlogik „Umkehrfunktionen: Spiegeln an y = x“ (Jgst. 12).
 *
 * Eine Funktion f ist umkehrbar, wenn jeder Funktionswert nur einmal
 * angenommen wird (jede waagrechte Gerade schneidet den Graphen höchstens
 * einmal). Hinreichend dafür: f ist streng monoton. Den Term der
 * Umkehrfunktion f⁻¹ erhält man, indem man y = f(x) nach x auflöst und dann
 * x und y tauscht. Graphisch ist das die Spiegelung an der Geraden y = x:
 * Aus P(a | b) wird P′(b | a). Definitions- und Wertemenge tauschen die Rollen.
 *
 * Ableitung der Umkehrfunktion: Beim Spiegeln tauschen die Katheten des
 * Steigungsdreiecks, aus der Steigung m wird 1/m, also
 *   (f⁻¹)′(b) = 1 / f′(a)   mit b = f(a) und f′(a) ≠ 0.
 * Ist f′(a) = 0 (waagrechte Tangente), hat f⁻¹ in (b | a) eine senkrechte
 * Tangente und ist dort nicht differenzierbar.
 *
 * Die Funktionen der Simulation: 2x − 1, x² (mit Einschränkung der
 * Definitionsmenge), 0,5x³, eˣ, 1/x und sin x (mit Einschränkung, Ausblick).
 */

export type FnKey = 'lin' | 'sq' | 'cube' | 'exp' | 'hyp' | 'sin';
/** Einschränkung der Definitionsmenge: steigender Ast, fallender Ast oder ganz ℝ (nur bei x² und sin). */
export type DomKey = 'pos' | 'neg' | 'all';
export type Lang = 'de' | 'en';
export type Mono = 'inc' | 'dec' | 'decPieces' | 'none';

/** Intervall; ±Infinity für unbeschränkte Ränder. */
export interface Interval {
  lo: number;
  hi: number;
  loIn: boolean;
  hiIn: boolean;
}

export interface Fn {
  key: FnKey;
  dom: DomKey;
  f: (x: number) => number;
  /** Ableitung f′ */
  df: (x: number) => number;
  /** Umkehrfunktion f⁻¹ (null: nicht umkehrbar) */
  inv: ((y: number) => number) | null;
  /** Ableitung der Umkehrfunktion in geschlossener Form (null: nicht umkehrbar) */
  dinv: ((y: number) => number) | null;
  /** Definitionsmenge D_f */
  D: Interval[];
  /** Wertemenge W_f */
  W: Interval[];
  /** größtmögliche Definitionsmenge des Terms (für den blassen, nicht benutzten Teil) */
  natural: Interval[];
  /** Monotonie auf D_f */
  mono: Mono;
  /** f⁻¹ = f (Graph symmetrisch zu y = x) */
  selfInverse: boolean;
  /** Bildausschnitt, für beide Achsen gleich (damit die Spiegelung im Bild bleibt) */
  window: [number, number];
  /** erlaubter Bereich für die Stelle a des Punktes P(a | f(a)) */
  pRange: [number, number];
  /** Definitionslücke (1/x: 0) */
  gap?: number;
}

const INF = Infinity;
const I = (lo: number, hi: number, loIn = true, hiIn = true): Interval => ({ lo, hi, loIn: loIn && Number.isFinite(lo), hiIn: hiIn && Number.isFinite(hi) });
const R: Interval[] = [I(-INF, INF)];
const HALF_PI = Math.PI / 2;

/** Hängt die Funktion von der Einschränkung der Definitionsmenge ab? */
export const restricted = (key: FnKey): boolean => key === 'sq' || key === 'sin';

export function makeFn(key: FnKey, dom: DomKey = 'pos'): Fn {
  switch (key) {
    case 'lin':
      return {
        key,
        dom: 'all',
        f: (x) => 2 * x - 1,
        df: () => 2,
        inv: (y) => (y + 1) / 2,
        dinv: () => 0.5,
        D: R,
        W: R,
        natural: R,
        mono: 'inc',
        selfInverse: false,
        window: [-4, 6],
        pRange: [-1.5, 3.5],
      };
    case 'sq': {
      const base = { key, dom, f: (x: number) => x * x, df: (x: number) => 2 * x, W: [I(0, INF)], natural: R, selfInverse: false, window: [-2.6, 5] as [number, number] };
      if (dom === 'pos')
        return { ...base, inv: (y) => (y < 0 ? NaN : Math.sqrt(y)), dinv: (y) => 1 / (2 * Math.sqrt(y)), D: [I(0, INF)], mono: 'inc', pRange: [0, 2.2] };
      if (dom === 'neg')
        return { ...base, inv: (y) => (y < 0 ? NaN : -Math.sqrt(y)), dinv: (y) => -1 / (2 * Math.sqrt(y)), D: [I(-INF, 0)], mono: 'dec', pRange: [-2.2, 0] };
      return { ...base, inv: null, dinv: null, D: R, mono: 'none', pRange: [-2.2, 2.2] };
    }
    case 'cube':
      return {
        key,
        dom: 'all',
        f: (x) => 0.5 * x ** 3,
        df: (x) => 1.5 * x * x,
        inv: (y) => Math.cbrt(2 * y),
        dinv: (y) => 2 / (3 * Math.cbrt(2 * y) ** 2),
        D: R,
        W: R,
        natural: R,
        mono: 'inc',
        selfInverse: false,
        window: [-4.5, 4.5],
        pRange: [-2, 2],
      };
    case 'exp':
      return {
        key,
        dom: 'all',
        f: (x) => Math.exp(x),
        df: (x) => Math.exp(x),
        inv: (y) => (y <= 0 ? NaN : Math.log(y)),
        dinv: (y) => 1 / y,
        D: R,
        W: [I(0, INF, false)],
        natural: R,
        mono: 'inc',
        selfInverse: false,
        window: [-3.5, 5],
        pRange: [-3, 1.5],
      };
    case 'hyp': {
      const D = [I(-INF, 0, true, false), I(0, INF, false, true)];
      return {
        key,
        dom: 'all',
        f: (x) => 1 / x,
        df: (x) => -1 / (x * x),
        inv: (y) => 1 / y,
        dinv: (y) => -1 / (y * y),
        D,
        W: D,
        natural: D,
        mono: 'decPieces',
        selfInverse: true,
        window: [-4, 4],
        pRange: [-3.5, 3.5],
        gap: 0,
      };
    }
    case 'sin': {
      const base = { key, dom, f: Math.sin, df: Math.cos, W: [I(-1, 1)], natural: R, selfInverse: false };
      if (dom === 'pos')
        return {
          ...base,
          inv: (y) => (Math.abs(y) > 1 ? NaN : Math.asin(y)),
          dinv: (y) => 1 / Math.sqrt(1 - y * y),
          D: [I(-HALF_PI, HALF_PI)],
          mono: 'inc',
          window: [-2.4, 2.4] as [number, number],
          pRange: [-1.5, 1.5] as [number, number],
        };
      if (dom === 'neg')
        return {
          ...base,
          inv: (y) => (Math.abs(y) > 1 ? NaN : Math.PI - Math.asin(y)),
          dinv: (y) => -1 / Math.sqrt(1 - y * y),
          D: [I(HALF_PI, 3 * HALF_PI)],
          mono: 'dec',
          window: [-2, 5] as [number, number],
          pRange: [1.6, 4.7] as [number, number],
        };
      return { ...base, inv: null, dinv: null, D: R, mono: 'none', window: [-2, 5] as [number, number], pRange: [-1.5, 4.7] as [number, number] };
    }
  }
}

/** Liegt x in der Vereinigung der Intervalle? */
export function inSet(set: readonly Interval[], x: number): boolean {
  return set.some((s) => (x > s.lo || (s.loIn && x === s.lo)) && (x < s.hi || (s.hiIn && x === s.hi)));
}

export const inDomain = (fn: Fn, x: number): boolean => inSet(fn.D, x);

/** Stelle a für P in den erlaubten Bereich holen (bei 1/x nicht zu nah an die Lücke). */
export function clampA(fn: Fn, a: number): number {
  let x = Math.max(fn.pRange[0], Math.min(fn.pRange[1], a));
  if (fn.gap !== undefined && Math.abs(x - fn.gap) < 0.3) x = x < fn.gap ? fn.gap - 0.3 : fn.gap + 0.3;
  return x;
}

/** Startwert von a beim Wechsel der Funktion bzw. der Definitionsmenge. */
export function startA(key: FnKey, dom: DomKey): number {
  if (key === 'sq') return dom === 'neg' ? -1.5 : 1.5;
  if (key === 'sin') return dom === 'neg' ? 2.6 : 0.5;
  return { lin: 3, cube: 2, exp: 1, hyp: 2 }[key];
}

/* ---------------- Spiegelung ---------------- */

/** Spiegelpunkt an y = x. */
export function mirror(p: readonly [number, number]): [number, number] {
  return [p[1], p[0]];
}

/** Lotfußpunkt auf y = x (Mittelpunkt von P und P′). */
export function footOnDiagonal(p: readonly [number, number]): [number, number] {
  const m = (p[0] + p[1]) / 2;
  return [m, m];
}

/** Abstand eines Punktes von der Geraden y = x. */
export function distToDiagonal(p: readonly [number, number]): number {
  return Math.abs(p[1] - p[0]) / Math.SQRT2;
}

/** Punkt auf dem geraden Weg der Spiegelung (t = 0: P, t = 1: P′), senkrecht zu y = x. */
export function mirrorPath(p: readonly [number, number], t: number): [number, number] {
  return [p[0] + (p[1] - p[0]) * t, p[1] + (p[0] - p[1]) * t];
}

/**
 * Umklappen wie eine Folie: Drehung um die Achse y = x im Raum um den Winkel π·t.
 * Der Abstand d zur Achse bleibt erhalten; in der Ebene bleibt d·cos(πt),
 * aus der Ebene heraus (zum Betrachter) ragt |d|·sin(πt).
 * t = 0: P, t = ½: über der Geraden y = x, t = 1: P′.
 */
export function foldPoint(p: readonly [number, number], t: number): { x: number; y: number; z: number } {
  const [mx] = footOnDiagonal(p);
  // vorzeichenbehafteter Abstand in Richtung n = (−1, 1)/√2
  const d = (p[1] - p[0]) / Math.SQRT2;
  const th = Math.PI * t;
  const inPlane = d * Math.cos(th);
  return { x: mx - inPlane / Math.SQRT2, y: mx + inPlane / Math.SQRT2, z: Math.abs(d) * Math.sin(th) };
}

/* ---------------- Umkehrbarkeit ---------------- */

/**
 * Alle Stellen x in [lo; hi] ∩ D_f mit f(x) = c (Schnittpunkte der waagrechten
 * Geraden y = c mit dem Graphen), aufsteigend. Exakt über die Umkehrterme.
 */
export function levelHits(fn: Fn, c: number, lo: number, hi: number): number[] {
  let xs: number[] = [];
  switch (fn.key) {
    case 'lin':
      xs = [(c + 1) / 2];
      break;
    case 'sq':
      xs = c > 0 ? [-Math.sqrt(c), Math.sqrt(c)] : c === 0 ? [0] : [];
      break;
    case 'cube':
      xs = [Math.cbrt(2 * c)];
      break;
    case 'exp':
      xs = c > 0 ? [Math.log(c)] : [];
      break;
    case 'hyp':
      xs = c !== 0 ? [1 / c] : [];
      break;
    case 'sin': {
      if (Math.abs(c) > 1) break;
      const s = Math.asin(c);
      const k0 = Math.floor((lo - Math.PI) / (2 * Math.PI)) - 1;
      const k1 = Math.ceil(hi / (2 * Math.PI)) + 1;
      for (let k = k0; k <= k1; k++) xs.push(s + 2 * Math.PI * k, Math.PI - s + 2 * Math.PI * k);
      break;
    }
  }
  const out = xs.filter((x) => x >= lo - 1e-12 && x <= hi + 1e-12 && inDomain(fn, x)).sort((u, v) => u - v);
  return out.filter((x, i) => i === 0 || Math.abs(x - out[i - 1]!) > 1e-9);
}

/** Nicht umkehrbar: eine andere Stelle mit gleichem Funktionswert (nächste zu a), sonst null. */
export function partner(key: FnKey, dom: DomKey, a: number): number | null {
  const fn = makeFn(key, dom);
  if (fn.inv) return null;
  const others = levelHits(fn, fn.f(a), fn.window[0] - 4, fn.window[1] + 4).filter((x) => Math.abs(x - a) > 1e-9);
  if (!others.length) return null;
  return others.reduce((best, x) => (Math.abs(x - a) < Math.abs(best - a) ? x : best));
}

/* ---------------- Ableitung der Umkehrfunktion ---------------- */

/**
 * Steigung der Umkehrfunktion im Punkt P′(b | a) über die Spiegelung:
 * (f⁻¹)′(b) = 1 / f′(a). Bei f′(a) = 0: senkrechte Tangente (±Infinity bzw. NaN).
 */
export function invSlopeAt(fn: Fn, a: number): number {
  const m = fn.df(a);
  return 1 / m;
}

/** Steigungsdreieck an P mit waagrechter Kathete dx; gespiegelt tauschen die Katheten. */
export function slopeTriangle(a: number, b: number, m: number, dx: number): { P: [number, number]; Q: [number, number]; C: [number, number] } {
  return { P: [a, b], C: [a + dx, b], Q: [a + dx, b + m * dx] };
}

/* ---------------- Wertetabelle ---------------- */

export interface TableRow {
  x: number;
  y: number;
  /** x ist ein Vielfaches von π/6 (Anzeige als Bruch mit π) */
  pi?: boolean;
}

/** Wertetabelle von f (Stellen im Definitionsbereich). Für f⁻¹ werden die Spalten getauscht. */
export function valueTable(fn: Fn): TableRow[] {
  const P = Math.PI;
  let xs: number[];
  let pi = false;
  switch (fn.key) {
    case 'lin':
      xs = [-1, 0, 1, 2, 3];
      break;
    case 'sq':
      xs = fn.dom === 'pos' ? [0, 0.5, 1, 1.5, 2] : fn.dom === 'neg' ? [-2, -1.5, -1, -0.5, 0] : [-2, -1, 0, 1, 2];
      break;
    case 'cube':
      xs = [-2, -1, 0, 1, 2];
      break;
    case 'exp':
      xs = [-2, -1, 0, 1, 2];
      break;
    case 'hyp':
      xs = [-2, -0.5, 0.5, 1, 2];
      break;
    case 'sin':
      pi = true;
      xs = fn.dom === 'neg' ? [P / 2, (5 * P) / 6, P, (7 * P) / 6, (3 * P) / 2] : fn.dom === 'pos' ? [-P / 2, -P / 6, 0, P / 6, P / 2] : [-P / 2, P / 6, P / 2, (5 * P) / 6, (3 * P) / 2];
      break;
  }
  return xs.map((x) => ({ x, y: fn.f(x), ...(pi ? { pi: true } : {}) }));
}

/** Zwei Zeilen der Tabelle mit gleichem Funktionswert (Zeichen für „nicht umkehrbar“)? */
export function repeatedValues(rows: readonly TableRow[]): [number, number] | null {
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) if (Math.abs(rows[i]!.y - rows[j]!.y) < 1e-9) return [i, j];
  return null;
}

/* ---------------- Rechenweg ---------------- */

export interface Steps {
  /** Funktionsterm mit Definitionsmenge */
  f: string;
  /** Umformungen: Formel und Hinweis (Kurzschrift aus formula.ts) */
  solve: { src: string; note?: string }[];
  /** Ergebnis nach dem Tauschen (leer: nicht umkehrbar) */
  inv: string;
  D: string;
  W: string;
  /** Ableitungen f′ und (f⁻¹)′ */
  d: string;
  dinv: string;
}

/** Zahlen und Intervalle in der Schreibweise der Sprache (DE: 0,5 und [−1; 1]; EN: 0.5 und [−1, 1]). */
export function localize(src: string, lang: Lang): string {
  if (lang === 'de') return src;
  return src.replace(/(\d),(\d)/g, '$1.$2').replace(/; /g, ', ');
}

const RR = '\\t{ℝ}';
/**
 * Rechenweg „nach x auflösen, dann x und y tauschen“ und Ableitungen,
 * in der Kurzschrift von formula.ts (ℝ aufrecht, e aufrecht).
 */
export function stepsOf(key: FnKey, dom: DomKey, lang: Lang): Steps {
  const de = lang === 'de';
  const T = (d: string, e: string) => (de ? d : e);
  let s: Steps;
  switch (key) {
    case 'lin':
      s = {
        f: 'f(x) = 2x − 1',
        solve: [
          { src: 'y = 2x − 1', note: '| + 1' },
          { src: 'y + 1 = 2x', note: '| : 2' },
          { src: 'x = \\f{y + 1}{2}' },
        ],
        inv: 'f^{−1}(x) = \\f{x + 1}{2}',
        D: RR,
        W: RR,
        d: 'f′(x) = 2',
        dinv: '(f^{−1})′(x) = \\f{1}{2}',
      };
      break;
    case 'sq':
      if (dom === 'pos')
        s = {
          f: 'f(x) = x²,  x ≥ 0',
          solve: [{ src: 'y = x²', note: '| \\r{ }' }, { src: 'x = \\r{y}', note: T('(da x ≥ 0)', '(as x ≥ 0)') }],
          inv: 'f^{−1}(x) = \\r{x}',
          D: `${RR}_0^+`,
          W: `${RR}_0^+`,
          d: 'f′(x) = 2x',
          dinv: '(f^{−1})′(x) = \\f{1}{2\\r{x}}',
        };
      else if (dom === 'neg')
        s = {
          f: 'f(x) = x²,  x ≤ 0',
          solve: [{ src: 'y = x²', note: '| \\r{ }' }, { src: 'x = −\\r{y}', note: T('(da x ≤ 0)', '(as x ≤ 0)') }],
          inv: 'f^{−1}(x) = −\\r{x}',
          D: `${RR}_0^−`,
          W: `${RR}_0^+`,
          d: 'f′(x) = 2x',
          dinv: '(f^{−1})′(x) = −\\f{1}{2\\r{x}}',
        };
      else
        s = {
          f: 'f(x) = x²',
          solve: [{ src: 'y = x²' }, { src: 'x = \\r{y}  \\t{' + T('oder', 'or') + '}  x = −\\r{y}', note: T('(zwei Lösungen)', '(two solutions)') }],
          inv: '',
          D: RR,
          W: `${RR}_0^+`,
          d: 'f′(x) = 2x',
          dinv: '',
        };
      break;
    case 'cube':
      s = {
        f: 'f(x) = 0,5x³',
        solve: [
          { src: 'y = 0,5x³', note: '| · 2' },
          { src: '2y = x³', note: '| \\t{∛}' },
          { src: 'x = \\t{∛}(2y)' },
        ],
        inv: 'f^{−1}(x) = \\t{∛}(2x)',
        D: RR,
        W: RR,
        d: 'f′(x) = 1,5x²',
        dinv: '(f^{−1})′(x) = \\f{2}{3 · (\\t{∛}(2x))²}',
      };
      break;
    case 'exp':
      s = {
        f: 'f(x) = \\t{e}^x',
        solve: [{ src: 'y = \\t{e}^x', note: '| \\t{ln}' }, { src: 'x = \\t{ln} y' }],
        inv: 'f^{−1}(x) = \\t{ln} x',
        D: RR,
        W: `${RR}^+`,
        d: 'f′(x) = \\t{e}^x',
        dinv: '(\\t{ln} x)′ = \\f{1}{\\t{e}^{\\t{ln} x}} = \\f{1}{x}',
      };
      break;
    case 'hyp':
      s = {
        f: 'f(x) = \\f{1}{x}',
        solve: [{ src: 'y = \\f{1}{x}', note: '| · x  | : y' }, { src: 'x = \\f{1}{y}' }],
        inv: 'f^{−1}(x) = \\f{1}{x}',
        D: `${RR} \\t{∖} {0}`,
        W: `${RR} \\t{∖} {0}`,
        d: 'f′(x) = −\\f{1}{x²}',
        dinv: '(f^{−1})′(x) = −\\f{1}{x²}',
      };
      break;
    case 'sin':
      if (dom === 'pos')
        s = {
          f: 'f(x) = \\t{sin} x,  −\\f{π}{2} ≤ x ≤ \\f{π}{2}',
          solve: [{ src: 'y = \\t{sin} x' }, { src: 'x = \\t{arcsin} y', note: T('(Hauptwert)', '(principal value)') }],
          inv: 'f^{−1}(x) = \\t{arcsin} x',
          D: '[−\\f{π}{2}; \\f{π}{2}]',
          W: '[−1; 1]',
          d: 'f′(x) = \\t{cos} x',
          dinv: '(f^{−1})′(x) = \\f{1}{\\r{1 − x²}}',
        };
      else if (dom === 'neg')
        s = {
          f: 'f(x) = \\t{sin} x,  \\f{π}{2} ≤ x ≤ \\f{3π}{2}',
          solve: [{ src: 'y = \\t{sin} x' }, { src: 'x = π − \\t{arcsin} y', note: T('(fallender Ast)', '(decreasing branch)') }],
          inv: 'f^{−1}(x) = π − \\t{arcsin} x',
          D: '[\\f{π}{2}; \\f{3π}{2}]',
          W: '[−1; 1]',
          d: 'f′(x) = \\t{cos} x',
          dinv: '(f^{−1})′(x) = −\\f{1}{\\r{1 − x²}}',
        };
      else
        s = {
          f: 'f(x) = \\t{sin} x',
          solve: [{ src: 'y = \\t{sin} x' }, { src: 'x = \\t{arcsin} y + k · 2π  \\t{' + T('oder', 'or') + '}  …', note: T('(unendlich viele Lösungen)', '(infinitely many solutions)') }],
          inv: '',
          D: RR,
          W: '[−1; 1]',
          d: 'f′(x) = \\t{cos} x',
          dinv: '',
        };
      break;
  }
  const L = (v: string) => localize(v, lang);
  return { f: L(s.f), solve: s.solve.map((r) => ({ src: L(r.src), ...(r.note ? { note: L(r.note) } : {}) })), inv: L(s.inv), D: L(s.D), W: L(s.W), d: L(s.d), dinv: L(s.dinv) };
}

/* ---------------- Abtasten der Graphen ---------------- */

/**
 * Graph von f als Punktfolgen (Weltkoordinaten) auf der Menge `set` im
 * Bereich [lo; hi]; Teile mit |y| außerhalb von [ylo; yhi] werden
 * abgeschnitten. Adaptiv: Abschnitte werden halbiert, bis benachbarte Punkte
 * höchstens `maxStep` auseinanderliegen (glatte Kurven auch an steilen Stellen).
 */
export function sampleGraph(f: (x: number) => number, set: readonly Interval[], lo: number, hi: number, ylo: number, yhi: number, maxStep = 0.04): [number, number][][] {
  const parts: [number, number][][] = [];
  for (const s of set) {
    const a = Math.max(lo, s.lo);
    const b = Math.min(hi, s.hi);
    if (!(b > a)) continue;
    // offene Ränder (Definitionslücke) leicht nach innen rücken
    const a0 = s.loIn || a > s.lo ? a : a + 1e-6;
    const b0 = s.hiIn || b < s.hi ? b : b - 1e-6;
    const N = 160;
    let cur: [number, number][] = [];
    const inside = (y: number) => Number.isFinite(y) && y >= ylo && y <= yhi;
    const push = (x: number, y: number) => cur.push([x, y]);
    const refine = (x0: number, y0: number, x1: number, y1: number, depth: number) => {
      if (depth > 9 || Math.hypot(x1 - x0, y1 - y0) <= maxStep) return;
      const xm = (x0 + x1) / 2;
      const ym = f(xm);
      if (!inside(ym)) return;
      refine(x0, y0, xm, ym, depth + 1);
      push(xm, ym);
      refine(xm, ym, x1, y1, depth + 1);
    };
    let px = a0;
    let py = f(a0);
    if (inside(py)) push(px, py);
    for (let i = 1; i <= N; i++) {
      const x = a0 + ((b0 - a0) * i) / N;
      const y = f(x);
      if (inside(y)) {
        if (inside(py)) refine(px, py, x, y, 0);
        else if (Number.isFinite(py)) {
          // Eintritt in den Bildbereich: Randpunkt per Bisektion
          let l = px;
          let r = x;
          for (let k = 0; k < 40; k++) {
            const m = (l + r) / 2;
            if (inside(f(m))) r = m;
            else l = m;
          }
          push(r, f(r));
          refine(r, f(r), x, y, 0);
        }
        push(x, y);
      } else if (cur.length) {
        if (inside(py) && Number.isFinite(y)) {
          let l = px;
          let r = x;
          for (let k = 0; k < 40; k++) {
            const m = (l + r) / 2;
            if (inside(f(m))) l = m;
            else r = m;
          }
          refine(px, py, l, f(l), 0);
          push(l, f(l));
        }
        if (cur.length > 1) parts.push(cur);
        cur = [];
      }
      px = x;
      py = y;
    }
    if (cur.length > 1) parts.push(cur);
  }
  return parts;
}
