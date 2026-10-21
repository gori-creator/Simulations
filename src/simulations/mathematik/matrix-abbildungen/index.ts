import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  apply,
  charPoly,
  describe,
  det,
  dominant,
  eigen,
  equal,
  figure,
  IDENTITY,
  inverse,
  isScalar,
  iterate,
  kernel,
  matrixOf,
  morphMat,
  mul,
  signedArea,
  sinAngle,
  singular,
  stationary,
  type Description,
  type FigKey,
  type Figure,
  type Mat,
  type TypeKey,
  type Vec,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

type Mode = 'map' | 'comp' | 'det' | 'eig' | 'inv' | 'pow';
type ExKey = 'none' | 'sprite' | 'italic' | 'shadow' | 'mirror' | 'kaleido' | 'zoom' | 'wide' | 'pop' | 'popg' | 'market';
type Lng = 'de' | 'en';
const MODES: Mode[] = ['map', 'comp', 'det', 'eig', 'inv', 'pow'];
/** Dauer der Morph-Animation E → A (ms). */
const MORPH_MS = 1700;
/** Schwelle, ab der zwei Richtungen als parallel gelten (sin des Winkels). */
const PAR = 0.012;

/**
 * Mehrere Etappen hintereinander als eine Easing-Funktion für Chan.glide(to):
 * parts = [Dauer in ms, Zielwert]; gleicher Zielwert wie zuvor = Pause.
 */
function stages(from: number, to: number, parts: [number, number][]): { dur: number; e: (t: number) => number } {
  const dur = parts.reduce((s, [d]) => s + d, 0);
  const rel = (pos: number) => (pos - from) / (to - from || 1);
  return {
    dur,
    e: (t) => {
      let x = t * dur;
      let pos = from;
      for (const [d, target] of parts) {
        if (x <= d) return rel(lerp(pos, target, d > 0 ? ease.inOutCubic(x / d) : 1));
        x -= d;
        pos = target;
      }
      return rel(pos);
    },
  };
}

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number; e: (t: number) => number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, delay: number, now: number, e: (t: number) => number = ease.inOutCubic): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur: Math.max(1, dur), e };
  }
  get busy(): boolean {
    return this.tw !== null || this.v !== this.goal;
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, tw.e(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Texte eines Alltagsbeispiels. */
interface ExMeta {
  title: Txt;
  note: Txt;
  /** Ergebnis-Satz zur Notiz; erscheint nur bei „Werte zeigen“ (sonst verrät er die Aufgabe) */
  result?: Txt;
  /** Achsenbeschriftungen (Iteration) */
  ax?: Txt;
  ay?: Txt;
  /** Namen der beiden Größen (Iteration) */
  vx?: string;
  vy?: string;
}

const EX_META: Record<Exclude<ExKey, 'none'>, ExMeta> = {
  sprite: {
    title: L('Computerspiel: Raumschiff drehen', 'Computer game: rotating a spaceship'),
    note: L(
      'Grafikprogramme drehen eine Figur, indem sie jeden Eckpunkt mit der Drehmatrix multiplizieren. Bei φ = 30° ist cos 30° ≈ 0,87 und sin 30° = 0,5. Form und Größe bleiben erhalten (det A = 1).',
      'Graphics programs rotate a sprite by multiplying every corner by the rotation matrix. For φ = 30°, cos 30° ≈ 0.87 and sin 30° = 0.5. Shape and size are preserved (det A = 1).',
    ),
  },
  italic: {
    title: L('Schräge Schrift als Scherung', 'Slanted letters as a shear'),
    note: L(
      'Aus einem aufrechten Buchstaben wird ein schräger: (x | y) ↦ (x + 0,25y | y). Die Grundlinie bleibt liegen, je höher ein Punkt, desto weiter rückt er nach rechts. Der Flächeninhalt bleibt gleich (det A = 1).',
      'An upright letter becomes a slanted one: (x | y) ↦ (x + 0.25y | y). The baseline stays put; the higher a point, the further it moves to the right. The area is unchanged (det A = 1).',
    ),
  },
  shadow: {
    title: L('Schatten auf dem Boden', 'Shadow on the ground'),
    note: L(
      'Die Sonne scheint unter 45° von rechts oben. Jeder Punkt (x | y) wirft seinen Schatten nach (x − y | 0) auf den Boden. Das ist eine Parallelprojektion: det A = 0, alle Punkte auf einem Lichtstrahl haben denselben Schatten.',
      'The sun shines at 45° from the upper right. Every point (x | y) casts its shadow onto the ground at (x − y | 0). This is a parallel projection: det A = 0, all points on one light ray share the same shadow.',
    ),
  },
  mirror: {
    title: L('Spiegelbild im See', 'Reflection in a lake'),
    note: L(
      'Die ruhige Wasseroberfläche (x-Achse) spiegelt das Haus: (x | y) ↦ (x | −y). Längen und Flächen bleiben gleich, aber det A = −1: Der Umlaufsinn kehrt sich um.',
      'The calm water surface (x-axis) reflects the house: (x | y) ↦ (x | −y). Lengths and areas stay the same, but det A = −1: the orientation is reversed.',
    ),
  },
  kaleido: {
    title: L('Kaleidoskop: zwei Spiegel', 'Kaleidoscope: two mirrors'),
    note: L(
      'Zwei Spiegel stehen unter 60° zueinander. Erst an der x-Achse spiegeln (B), dann an der Geraden unter 60° (A): Das ergibt eine Drehung um 2 · 60° = 120°. In der anderen Reihenfolge dreht es um −120°.',
      'Two mirrors meet at 60°. Reflect in the x-axis first (B), then in the line at 60° (A): the result is a rotation by 2 · 60° = 120°. In the other order it rotates by −120°.',
    ),
  },
  zoom: {
    title: L('Karten-App: drehen und zoomen', 'Map app: rotate and zoom'),
    note: L(
      'Die Karte wird um 30° gedreht und mit dem Faktor 1,5 vergrößert (Drehstreckung). Alle Längen werden 1,5-mal so lang, alle Flächen 1,5² = 2,25-mal so groß: det A = 2,25.',
      'The map is rotated by 30° and enlarged by the factor 1.5 (rotation with scaling). All lengths become 1.5 times as long, all areas 1.5² = 2.25 times as large: det A = 2.25.',
    ),
  },
  wide: {
    title: L('Foto auf Breitbild strecken', 'Stretching a photo to widescreen'),
    note: L(
      'Das Bild wird nur in die Breite gezogen: (x | y) ↦ (1,5x | y). Kreise werden zu Ellipsen, und jede Fläche wird 1,5-mal so groß (det A = 1,5).',
      'The picture is only stretched horizontally: (x | y) ↦ (1.5x | y). Circles become ellipses and every area becomes 1.5 times as large (det A = 1.5).',
    ),
  },
  pop: {
    title: L('Tierpopulation: stabil', 'Animal population: stable'),
    note: L(
      'Jungtiere J und erwachsene Tiere E (in Hundert), jedes Jahr gezählt: Jedes erwachsene Tier bekommt im Schnitt 1 Junges, die Hälfte der Jungtiere wird erwachsen, die Hälfte der Erwachsenen überlebt. J′ = E, E′ = 0,5J + 0,5E.',
      'Young animals J and adults E (in hundreds), counted every year: each adult has 1 young on average, half of the young become adults, half of the adults survive. J′ = E, E′ = 0.5J + 0.5E.',
    ),
    result: L('Langfristig gibt es gleich viele Jungtiere und Erwachsene: Fixvektor (1 | 1) zum Eigenwert 1.', 'In the long run there are as many young as adults: fixed vector (1 | 1) for the eigenvalue 1.'),
    ax: L('J', 'J'),
    ay: L('E', 'E'),
    vx: 'J',
    vy: 'E',
  },
  popg: {
    title: L('Tierpopulation: wachsend', 'Animal population: growing'),
    note: L(
      'Jetzt bekommt jedes erwachsene Tier 2 Junge: J′ = 2E, E′ = 0,5J + 0,5E.',
      'Now each adult has 2 young: J′ = 2E, E′ = 0.5J + 0.5E.',
    ),
    result: L(
      'Der betragsgrößte Eigenwert λ ≈ 1,28 ist der jährliche Wachstumsfaktor (+28 %), das Verhältnis J : E nähert sich 2 : 1,28 ≈ 1,56 : 1.',
      'The eigenvalue of largest absolute value, λ ≈ 1.28, is the yearly growth factor (+28 %), and the ratio J : E approaches 2 : 1.28 ≈ 1.56 : 1.',
    ),
    ax: L('J', 'J'),
    ay: L('E', 'E'),
    vx: 'J',
    vy: 'E',
  },
  market: {
    title: L('Kundenwanderung zwischen zwei Anbietern', 'Customers switching between two providers'),
    note: L(
      'Jedes Jahr bleiben 90 % der Kunden von Anbieter P treu und 10 % wechseln zu Q; von Q wechseln 20 % zu P. Jede Spalte der Übergangsmatrix hat die Summe 1.',
      'Each year 90 % of the customers of provider P stay and 10 % switch to Q; of Q’s customers 20 % switch to P. Every column of the transition matrix adds up to 1.',
    ),
    result: L('Egal wie es startet: Langfristig hat P 2/3 und Q 1/3 der Kunden.', 'Whatever the start: in the long run P has 2/3 and Q 1/3 of the customers.'),
    ax: L('p', 'p'),
    ay: L('q', 'q'),
    vx: 'p',
    vy: 'q',
  },
};

/** Einstellungen der Alltagsbeispiele (auch für die Beispiel-Schaltflächen). */
const EX_VALUES = {
  sprite: { ex: 'sprite', mode: 'map', typ: 'rot', phi: 30, fig: 'rocket' },
  italic: { ex: 'italic', mode: 'map', typ: 'shear', k: 0.25, sd: 'x', fig: 'f' },
  shadow: { ex: 'shadow', mode: 'map', typ: 'free', a: 1, b: -1, c: 0, d: 0, fig: 'house', eig: false },
  mirror: { ex: 'mirror', mode: 'map', typ: 'refl', al: 0, fig: 'house' },
  kaleido: { ex: 'kaleido', mode: 'comp', typ: 'refl', al: 60, ba: 1, bb: 0, bc: 0, bd: -1, fig: 'f' },
  zoom: { ex: 'zoom', mode: 'map', typ: 'rs', phi: 30, r: 1.5, fig: 'house' },
  wide: { ex: 'wide', mode: 'det', typ: 'scale', kx: 1.5, ky: 1, fig: 'smile' },
  pop: { ex: 'pop', mode: 'pow', typ: 'free', a: 0, b: 1, c: 0.5, d: 0.5, x0: 4, y0: 0, n: 8 },
  popg: { ex: 'popg', mode: 'pow', typ: 'free', a: 0, b: 2, c: 0.5, d: 0.5, x0: 1, y0: 1, n: 8 },
  market: { ex: 'market', mode: 'pow', typ: 'free', a: 0.9, b: 0.2, c: 0.1, d: 0.8, x0: 1, y0: 0, n: 10 },
} as const;

/**
 * Matrizen als lineare Abbildungen der Ebene in sechs Ansichten: Abbildung
 * (Gitter, Einheitsquadrat und Figur verformen sich stetig von E zu A, Bilder
 * der Einheitsvektoren ziehbar, Art der Abbildung mit Achse/Winkel), Verkettung
 * (zwei Etappen, Produkt mit Rechenweg, AB ≠ BA), Determinante (orientierter
 * Flächeninhalt, Grundseite · Höhe, Kern bei det = 0), Eigenvektoren
 * (rotierender Testvektor, charakteristisches Polynom, komplexe Eigenwerte,
 * Diagramm sin∠(v, Av)), Inverse (Hin- und Rückweg, Probe) und Iteration Aⁿ·x
 * (Fixvektor, stationäre Verteilung, Wachstum). Die Matrix entsteht frei aus
 * a, b, c, d oder aus einem Abbildungstyp mit Winkel bzw. Faktor; zehn
 * Alltagsbeispiele.
 */
export default defineSimulation({
  id: 'matrix-abbildungen',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.46 },
  groups: [
    { id: 'mat', label: L('Matrix A', 'Matrix A') },
    { id: 'matB', label: L('Matrix B', 'Matrix B') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'map', label: L('Abbildung: E verformt sich zu A', 'Map: E deforms into A') },
        { value: 'comp', label: L('Verkettung A · B', 'Composition A · B') },
        { value: 'det', label: L('Determinante als Fläche', 'Determinant as area') },
        { value: 'eig', label: L('Eigenvektoren', 'Eigenvectors') },
        { value: 'inv', label: L('Inverse Matrix', 'Inverse matrix') },
        { value: 'pow', label: L('Iteration Aⁿ · x', 'Iteration Aⁿ · x') },
      ],
      default: 'map',
    },
    {
      key: 'ex',
      type: 'choice',
      label: L('Beispiel aus dem Alltag', 'Everyday example'),
      help: L('Lädt Matrix, Ansicht und Figur passend zum Beispiel.', 'Loads matrix, view and figure for the example.'),
      options: [
        { value: 'none', label: L('keines', 'none') },
        { value: 'sprite', label: L('Raumschiff drehen', 'Rotate a spaceship') },
        { value: 'italic', label: L('Schräge Schrift', 'Slanted letters') },
        { value: 'shadow', label: L('Schatten', 'Shadow') },
        { value: 'mirror', label: L('Spiegelbild im See', 'Reflection in a lake') },
        { value: 'kaleido', label: L('Kaleidoskop', 'Kaleidoscope') },
        { value: 'zoom', label: L('Karte drehen und zoomen', 'Rotate and zoom a map') },
        { value: 'wide', label: L('Foto auf Breitbild', 'Photo to widescreen') },
        { value: 'pop', label: L('Population stabil', 'Population stable') },
        { value: 'popg', label: L('Population wachsend', 'Population growing') },
        { value: 'market', label: L('Kundenwanderung', 'Customers switching') },
      ],
      default: 'none',
    },
    {
      key: 'typ',
      type: 'choice',
      group: 'mat',
      label: L('Matrix A festlegen durch', 'Define matrix A by'),
      options: [
        { value: 'free', label: L('Einträge a, b, c, d', 'Entries a, b, c, d') },
        { value: 'rot', label: L('Drehung um φ', 'Rotation by φ') },
        { value: 'refl', label: L('Spiegelung an einer Achse', 'Reflection in a line') },
        { value: 'scale', label: L('Streckung entlang der Achsen', 'Scaling along the axes') },
        { value: 'shear', label: L('Scherung', 'Shear') },
        { value: 'proj', label: L('senkrechte Projektion', 'Orthogonal projection') },
        { value: 'rs', label: L('Drehstreckung', 'Rotation with scaling') },
      ],
      default: 'free',
    },
    { key: 'a', type: 'number', group: 'mat', label: L('a₁₁', 'a₁₁'), help: L('Auch die Pfeilspitzen von A·e₁ und A·e₂ im Bild ziehen.', 'You can also drag the tips of A·e₁ and A·e₂ in the picture.'), min: -4, max: 4, step: 0.01, default: 2, visibleIf: (v) => v.typ === 'free' },
    { key: 'b', type: 'number', group: 'mat', label: L('a₁₂', 'a₁₂'), min: -4, max: 4, step: 0.01, default: 1, visibleIf: (v) => v.typ === 'free' },
    { key: 'c', type: 'number', group: 'mat', label: L('a₂₁', 'a₂₁'), min: -4, max: 4, step: 0.01, default: 0, visibleIf: (v) => v.typ === 'free' },
    { key: 'd', type: 'number', group: 'mat', label: L('a₂₂', 'a₂₂'), min: -4, max: 4, step: 0.01, default: 1, visibleIf: (v) => v.typ === 'free' },
    { key: 'phi', type: 'number', group: 'mat', label: L('Drehwinkel φ', 'Angle of rotation φ'), help: L('Positiv: gegen den Uhrzeigersinn.', 'Positive: anticlockwise.'), min: -180, max: 180, step: 1, default: 90, unit: '°', visibleIf: (v) => v.typ === 'rot' || v.typ === 'rs' },
    { key: 'r', type: 'number', group: 'mat', label: L('Streckfaktor r', 'Scale factor r'), min: 0, max: 3, step: 0.05, default: 1.5, visibleIf: (v) => v.typ === 'rs' },
    { key: 'al', type: 'number', group: 'mat', label: L('Winkel α der Achse', 'Angle α of the line'), help: L('Gerade durch den Ursprung, α gegen die x-Achse.', 'Line through the origin, α measured from the x-axis.'), min: 0, max: 180, step: 1, default: 45, unit: '°', visibleIf: (v) => v.typ === 'refl' || v.typ === 'proj' },
    { key: 'kx', type: 'number', group: 'mat', label: L('Faktor in x-Richtung', 'Factor in x-direction'), min: -3, max: 3, step: 0.05, default: 2, visibleIf: (v) => v.typ === 'scale' },
    { key: 'ky', type: 'number', group: 'mat', label: L('Faktor in y-Richtung', 'Factor in y-direction'), min: -3, max: 3, step: 0.05, default: 0.5, visibleIf: (v) => v.typ === 'scale' },
    { key: 'k', type: 'number', group: 'mat', label: L('Scherfaktor k', 'Shear factor k'), min: -3, max: 3, step: 0.05, default: 1, visibleIf: (v) => v.typ === 'shear' },
    {
      key: 'sd',
      type: 'choice',
      group: 'mat',
      label: L('Scherung', 'Shear'),
      options: [
        { value: 'x', label: L('in x-Richtung', 'in x-direction') },
        { value: 'y', label: L('in y-Richtung', 'in y-direction') },
      ],
      default: 'x',
      visibleIf: (v) => v.typ === 'shear',
    },
    { key: 'ba', type: 'number', group: 'matB', label: L('b₁₁', 'b₁₁'), min: -4, max: 4, step: 0.01, default: 0, visibleIf: (v) => v.mode === 'comp' },
    { key: 'bb', type: 'number', group: 'matB', label: L('b₁₂', 'b₁₂'), min: -4, max: 4, step: 0.01, default: 1, visibleIf: (v) => v.mode === 'comp' },
    { key: 'bc', type: 'number', group: 'matB', label: L('b₂₁', 'b₂₁'), min: -4, max: 4, step: 0.01, default: 1, visibleIf: (v) => v.mode === 'comp' },
    { key: 'bd', type: 'number', group: 'matB', label: L('b₂₂', 'b₂₂'), min: -4, max: 4, step: 0.01, default: 0, visibleIf: (v) => v.mode === 'comp' },
    {
      key: 'ord',
      type: 'choice',
      group: 'matB',
      label: L('Reihenfolge', 'Order'),
      options: [
        { value: 'ab', label: L('erst B, dann A: A · B', 'first B, then A: A · B') },
        { value: 'ba', label: L('erst A, dann B: B · A', 'first A, then B: B · A') },
      ],
      default: 'ab',
      visibleIf: (v) => v.mode === 'comp',
    },
    { key: 'w', type: 'number', label: L('Richtung des Testvektors v', 'Direction of the test vector v'), help: L('Auch die Spitze von v im Bild ziehen.', 'You can also drag the tip of v in the picture.'), min: 0, max: 360, step: 1, default: 20, unit: '°', visibleIf: (v) => v.mode === 'eig' },
    { key: 'x0', type: 'number', label: L('Startvektor x₀: erste Koordinate', 'Start vector x₀: first coordinate'), help: L('Auch den Startpunkt im Bild ziehen.', 'You can also drag the start point in the picture.'), min: -5, max: 5, step: 0.05, default: 2, visibleIf: (v) => v.mode === 'pow' },
    { key: 'y0', type: 'number', label: L('Startvektor x₀: zweite Koordinate', 'Start vector x₀: second coordinate'), min: -5, max: 5, step: 0.05, default: 1, visibleIf: (v) => v.mode === 'pow' },
    { key: 'n', type: 'number', label: L('Anzahl der Schritte n', 'Number of steps n'), min: 0, max: 30, step: 1, default: 6, visibleIf: (v) => v.mode === 'pow' },
    { key: 't', type: 'number', label: L('Anteil t der Abbildung (E → A)', 'Share t of the map (E → A)'), help: L('t = 0: nichts passiert, t = 1: ganz abgebildet.', 't = 0: nothing happens, t = 1: fully mapped.'), min: 0, max: 1, step: 0.01, default: 1, visibleIf: (v) => v.mode === 'map' || v.mode === 'det' },
    {
      key: 'fig',
      type: 'choice',
      label: L('Figur', 'Figure'),
      options: [
        { value: 'f', label: L('Buchstabe F', 'Letter F') },
        { value: 'house', label: L('Haus', 'House') },
        { value: 'circle', label: L('Einheitskreis', 'Unit circle') },
        { value: 'smile', label: L('Smiley', 'Smiley') },
        { value: 'rocket', label: L('Raumschiff', 'Spaceship') },
        { value: 'cloud', label: L('Punktwolke', 'Point cloud') },
      ],
      default: 'f',
      visibleIf: (v) => v.mode !== 'pow' && v.mode !== 'eig',
    },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Bildgitter zeigen', 'Show the transformed grid'), default: true, visibleIf: (v) => v.mode !== 'pow' },
    { key: 'eig', type: 'boolean', group: 'view', label: L('Eigenrichtungen zeigen', 'Show eigendirections'), default: true, visibleIf: (v) => v.mode !== 'comp' && v.mode !== 'inv' },
    { key: 'orig', type: 'boolean', group: 'view', label: L('Urbild zeigen', 'Show the original'), default: true, visibleIf: (v) => v.mode !== 'pow' && v.mode !== 'eig' },
    { key: 'uc', type: 'boolean', group: 'view', label: L('Einheitskreis und Bildellipse', 'Unit circle and image ellipse'), default: false, visibleIf: (v) => v.mode === 'map' || v.mode === 'det' },
    { key: 'cmp', type: 'boolean', group: 'view', label: L('Andere Reihenfolge zum Vergleich', 'Other order for comparison'), default: true, visibleIf: (v) => v.mode === 'comp' },
    { key: 'hgt', type: 'boolean', group: 'view', label: L('Grundseite und Höhe', 'Base and height'), default: false, visibleIf: (v) => v.mode === 'det' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Ergebnisse im Bild durch „?“ ersetzt (für Aufgaben).', 'Off: results in the picture replaced by “?” (for tasks).'), default: true },
  ],
  actions: [
    { id: 'morph', label: L('Abbildung abspielen', 'Play the transformation'), primary: true, visibleIf: (v) => v.mode === 'map' || v.mode === 'det' },
    { id: 'comp', label: L('Nacheinander abspielen', 'Play one after the other'), primary: true, visibleIf: (v) => v.mode === 'comp' },
    { id: 'swap', label: L('Reihenfolge tauschen', 'Swap the order'), visibleIf: (v) => v.mode === 'comp' },
    { id: 'sweep', label: L('v einmal herumdrehen', 'Turn v once around'), primary: true, visibleIf: (v) => v.mode === 'eig' },
    { id: 'snap', label: L('Zur nächsten Eigenrichtung', 'To the next eigendirection'), visibleIf: (v) => v.mode === 'eig' },
    { id: 'trip', label: L('Hin mit A, zurück mit A⁻¹', 'There with A, back with A⁻¹'), primary: true, visibleIf: (v) => v.mode === 'inv' },
    { id: 'steps', label: L('Schritt für Schritt abspielen', 'Play step by step'), primary: true, visibleIf: (v) => v.mode === 'pow' },
    { id: 'next', label: L('Ein Schritt mehr', 'One more step'), visibleIf: (v) => v.mode === 'pow' },
  ],
  readouts: [
    { key: 'mat', label: L('Matrix A', 'Matrix A') },
    { key: 'kind', label: L('Art der Abbildung', 'Type of map'), spoiler: true },
    { key: 'det', label: L('Determinante', 'Determinant'), spoiler: true },
    { key: 'eig', label: L('Eigenwerte', 'Eigenvalues'), spoiler: true },
    { key: 'prod', label: L('Produkt', 'Product'), spoiler: true },
    { key: 'inv', label: L('Inverse', 'Inverse'), spoiler: true },
    { key: 'lim', label: L('Langfristig', 'In the long run'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'gen', label: L('Allgemein', 'General'), values: {} },
    { id: 'rot', label: L('Drehung um 90°', 'Rotation by 90°'), values: { typ: 'rot', phi: 90 } },
    { id: 'refl', label: L('Spiegelung an y = x', 'Reflection in y = x'), values: { typ: 'refl', al: 45 } },
    { id: 'scale', label: L('Streckung: Kreis → Ellipse', 'Scaling: circle → ellipse'), values: { typ: 'scale', kx: 2, ky: 0.5, fig: 'circle', uc: true } },
    { id: 'shear', label: L('Scherung', 'Shear'), values: { typ: 'shear', k: 1 } },
    { id: 'proj', label: L('Projektion: det = 0', 'Projection: det = 0'), values: { mode: 'det', typ: 'proj', al: 30, fig: 'house' } },
    { id: 'detneg', label: L('Negative Determinante: Umlaufsinn kehrt sich um', 'Negative determinant: orientation reverses'), values: { mode: 'det', a: 1, b: 2, c: 2, d: 1, hgt: true } },
    { id: 'sym', label: L('Symmetrisch: zwei senkrechte Eigenrichtungen', 'Symmetric: two perpendicular eigendirections'), values: { mode: 'eig', a: 2, b: 1, c: 1, d: 2 } },
    { id: 'eigrot', label: L('Drehung: komplexe Eigenwerte', 'Rotation: complex eigenvalues'), values: { mode: 'eig', typ: 'rot', phi: 60 } },
    { id: 'eigshear', label: L('Scherung: nur eine Eigenrichtung', 'Shear: only one eigendirection'), values: { mode: 'eig', typ: 'shear', k: 1 } },
    { id: 'abba', label: L('AB ≠ BA', 'AB ≠ BA'), values: { mode: 'comp', a: 1, b: 2, c: 3, d: 4 } },
    { id: 'inv', label: L('Inverse von (2 1; 1 1)', 'Inverse of (2 1; 1 1)'), values: { mode: 'inv', a: 2, b: 1, c: 1, d: 1, fig: 'house' } },
    { id: 'sing', label: L('Nicht umkehrbar: det = 0', 'Not invertible: det = 0'), values: { mode: 'inv', a: 1, b: 2, c: 0.5, d: 1 } },
    { id: 'sprite', label: L('Computerspiel: Raumschiff drehen', 'Computer game: rotate a spaceship'), values: EX_VALUES.sprite },
    { id: 'italic', label: L('Schräge Schrift: Scherung', 'Slanted letters: shear'), values: EX_VALUES.italic },
    { id: 'shadow', label: L('Schatten auf dem Boden: Projektion', 'Shadow on the ground: projection'), values: EX_VALUES.shadow },
    { id: 'mirror', label: L('Spiegelbild im See', 'Reflection in a lake'), values: EX_VALUES.mirror },
    { id: 'kaleido', label: L('Kaleidoskop: zwei Spiegel = Drehung', 'Kaleidoscope: two mirrors = rotation'), values: EX_VALUES.kaleido },
    { id: 'zoom', label: L('Karten-App: drehen und zoomen', 'Map app: rotate and zoom'), values: EX_VALUES.zoom },
    { id: 'wide', label: L('Foto auf Breitbild strecken', 'Photo stretched to widescreen'), values: EX_VALUES.wide },
    { id: 'pop', label: L('Tierpopulation: Fixvektor', 'Animal population: fixed vector'), values: EX_VALUES.pop },
    { id: 'popg', label: L('Tierpopulation: Wachstum', 'Animal population: growth'), values: EX_VALUES.popg },
    { id: 'market', label: L('Kundenwanderung: stationäre Verteilung', 'Customers switching: stationary distribution'), values: EX_VALUES.market },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatenebene mit Gitter, Einheitsquadrat und einer Figur vor und nach der Abbildung mit der Matrix A; die Bilder der Einheitsvektoren lassen sich ziehen. Je nach Ansicht verformt sich die Ebene stetig von E zu A, zwei Matrizen werden nacheinander angewendet (Verkettung), die Determinante erscheint als orientierter Flächeninhalt, ein Testvektor dreht sich auf der Suche nach Eigenrichtungen, die Inverse bildet zurück ab oder ein Startvektor wird wiederholt abgebildet. Rechts Karten mit Rechenweg, Diagramm und Deutung.',
    },
    en: {
      canvas:
        'Coordinate plane with grid, unit square and a figure before and after the map with the matrix A; the images of the unit vectors can be dragged. Depending on the view the plane deforms continuously from E to A, two matrices are applied one after the other (composition), the determinant appears as signed area, a test vector turns in search of eigendirections, the inverse maps back, or a start vector is mapped again and again. On the right cards with working, chart and interpretation.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: Txt) => s[lang];
    const T2 = (de: string, en: string) => (lang === 'de' ? de : en);
    const editable = () => !ctx.locked;
    const mode = () => p.mode as Mode;
    const exKey = () => p.ex as ExKey;
    const exMeta = (): ExMeta | null => (exKey() === 'none' ? null : EX_META[exKey() as Exclude<ExKey, 'none'>]);
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);
    const show = () => p.show;
    const S = (s: string) => (show() ? s : '?');

    /* ---------- Farben ---------- */
    const col = {
      e1: () => th().series[1]!,
      e2: () => th().series[0]!,
      sq: () => th().series[2]!,
      fig: () => th().series[4]!,
      eig: () => th().series[3]!,
      mid: () => th().series[5]!,
      v: () => th().series[5]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      orb: () => th().series[0]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eqs = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    /** Zahl als Formeltext: abbrechende Dezimalzahl oder kleiner Bruch. */
    function q(v: number): string {
      if (isExact(v, 3)) return N(v, 3);
      for (let dd = 2; dd <= 12; dd++) {
        const n0 = v * dd;
        if (Math.abs(n0 - Math.round(n0)) < 1e-7) return `${v < 0 ? '−' : ''}\\f{${Math.abs(Math.round(n0))}}{${dd}}`;
      }
      return N(v, 2);
    }
    /** Zahl in Klammern, wenn negativ (für Produkte im Rechenweg). */
    const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

    /* ---------- exakte Matrizen ---------- */
    const typeParams = () => ({ phi: p.phi, al: p.al, kx: p.kx, ky: p.ky, k: p.k, sd: p.sd as 'x' | 'y', r: p.r });
    const freeA = (): Mat => ({ a: p.a, b: p.b, c: p.c, d: p.d });
    const exactA = (): Mat => matrixOf(p.typ as TypeKey, typeParams(), freeA());
    const exactB = (): Mat => ({ a: p.ba, b: p.bb, c: p.bc, d: p.bd });
    /** Verkettung: R wird zuerst angewendet, L danach; Produkt L · R. */
    function chain(A: Mat, B: Mat): { L: Mat; R: Mat; nL: string; nR: string } {
      return p.ord === 'ab' ? { L: A, R: B, nL: 'A', nR: 'B' } : { L: B, R: A, nL: 'B', nR: 'A' };
    }

    /* ---------- angezeigter Zustand ---------- */
    const A0 = exactA();
    const B0 = exactB();
    const AC = [new Chan(A0.a), new Chan(A0.b), new Chan(A0.c), new Chan(A0.d)];
    const BC = [new Chan(B0.a), new Chan(B0.b), new Chan(B0.c), new Chan(B0.d)];
    const Ashown = (): Mat => ({ a: AC[0]!.v, b: AC[1]!.v, c: AC[2]!.v, d: AC[3]!.v });
    const Bshown = (): Mat => ({ a: BC[0]!.v, b: BC[1]!.v, c: BC[2]!.v, d: BC[3]!.v });
    const T = new Chan(p.t);
    /** Verkettung: Etappe 0 … 2 (0 – 1: erste Matrix, 1 – 2: zweite) */
    const CK = new Chan(2);
    /** Inverse: 0 … 2 (0 – 1 Hinweg mit A, 1 – 2 Rückweg mit A⁻¹); Ruhe bei 1 */
    const TR = new Chan(1);
    const W = new Chan(p.w);
    const X0 = new Chan(p.x0);
    const Y0 = new Chan(p.y0);
    /** Iteration: Anzahl der sichtbaren Schritte (gleitend) */
    const NC = new Chan(p.n);
    const box = { x0: new Chan(-3), x1: new Chan(3), y0: new Chan(-3), y1: new Chan(3) };
    const mw = Object.fromEntries(MODES.map((m) => [m, new Chan(m === p.mode ? 1 : 0)])) as Record<Mode, Chan>;
    const kGrid = new Chan(p.grid ? 1 : 0);
    const kEig = new Chan(p.eig ? 1 : 0);
    const kOrig = new Chan(p.orig ? 1 : 0);
    const kUc = new Chan(p.uc ? 1 : 0);
    const kCmp = new Chan(p.cmp ? 1 : 0);
    const kHgt = new Chan(p.hgt ? 1 : 0);
    const kShow = new Chan(p.show ? 1 : 0);
    let fig: Figure = figure(p.fig as FigKey);
    let figFrom: { fig: Figure; t0: number } | null = null;
    let intro: number | null = null;
    let cardFade: number | null = null;
    let sweep: { t0: number; dur: number; from: number } | null = null;
    let stepRun: { t0: number; per: number; n: number } | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    const grab = () => {
      lastDrag = performance.now();
    };
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let prevMode: Mode = mode();
    /** Ein Alltagsbeispiel wurde über die Auswahl geladen (nächstes update spielt die Animation). */
    let exLoad = false;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    /** Zahl, die im Bild und in den Karten weich zu ihrem Wert zählt. */
    function cnt(key: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(key);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(key, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (!Number.isFinite(e.c.v) || Math.abs(e.c.v - v) > 60 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() ? 0.05 : 0.2);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    const cntMat = (key: string, m: Mat): Mat => ({ a: cnt(`${key}a`, m.a), b: cnt(`${key}b`, m.b), c: cnt(`${key}c`, m.c), d: cnt(`${key}d`, m.d) });

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { plot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.36, 240, 380));
        return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 1.04, 300, h * 0.52));
      return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-3, 3], pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Matrizen für das Bild ---------- */
    /** Matrix, mit der in der aktuellen Ansicht Gitter, Quadrat und Figur gezeichnet werden. */
    function viewMatrix(m: Mode): Mat {
      const A = Ashown();
      if (m === 'map' || m === 'det') return morphMat(A, clamp01(T.v));
      if (m === 'comp') {
        const ch = chain(A, Bshown());
        const s = CK.v;
        if (s <= 1) return morphMat(ch.R, clamp01(s));
        return mul(morphMat(ch.L, clamp01(s - 1)), ch.R);
      }
      if (m === 'inv') {
        const s = TR.v;
        return s <= 1 ? morphMat(A, clamp01(s)) : morphMat(A, clamp01(2 - s));
      }
      return A;
    }
    const busyStory = () => sweep !== null || stepRun !== null || T.busy || CK.busy || TR.busy;

    /* ---------- Griffe ---------- */
    const snap1 = (v: number) => Math.round(clamp(v, -4, 4) * 10) / 10;
    /** Spalte ziehen: wird die Matrix aus einem Typ erzeugt, auf „Einträge“ umschalten. */
    function dragColumn(col2: 0 | 1, x: number, y: number): void {
      grab();
      const A = exactA();
      const r2 = (v: number) => Math.round(v * 100) / 100;
      const vals: Record<string, number | string> = { typ: 'free', a: r2(A.a), b: r2(A.b), c: r2(A.c), d: r2(A.d) };
      if (col2 === 0) {
        vals.a = snap1(x);
        vals.c = snap1(y);
      } else {
        vals.b = snap1(x);
        vals.d = snap1(y);
      }
      if (p.typ === 'free') delete vals.typ;
      setP(vals as Record<string, number | string>);
    }
    const colHandlesOn = () => editable() && mode() !== 'comp' && mode() !== 'pow' && !busyStory() && T.v > 0.999 && Math.abs(TR.v - 1) < 1e-3;
    plot.addHandle({
      get: () => [AC[0]!.v, AC[2]!.v],
      set: (x, y) => dragColumn(0, x, y),
      enabled: colHandlesOn,
      color: () => col.e1(),
    });
    plot.addHandle({
      get: () => [AC[1]!.v, AC[3]!.v],
      set: (x, y) => dragColumn(1, x, y),
      enabled: colHandlesOn,
      color: () => col.e2(),
    });
    // Testvektor v (Eigenvektoren)
    plot.addHandle({
      get: () => [vLen() * Math.cos(W.v * DEG), vLen() * Math.sin(W.v * DEG)],
      set: (x, y) => {
        grab();
        let a = Math.round(Math.atan2(y, x) / DEG);
        if (a < 0) a += 360;
        setP({ w: a % 360 });
      },
      enabled: () => editable() && mode() === 'eig' && !sweep,
      color: () => col.v(),
    });
    // Startvektor x₀ (Iteration)
    plot.addHandle({
      get: () => [X0.v, Y0.v],
      set: (x, y) => {
        grab();
        setP({ x0: Math.round(clamp(x, -5, 5) * 20) / 20, y0: Math.round(clamp(y, -5, 5) * 20) / 20 });
      },
      enabled: () => editable() && mode() === 'pow' && !stepRun,
      color: () => col.orb(),
    });
    /** Länge des Testvektors im Bild: 1, aber bei großem Ausschnitt etwas länger, damit man ihn greifen kann. */
    function vLen(): number {
      const span = Math.min(box.x1.v - box.x0.v, box.y1.v - box.y0.v);
      return Math.max(1, span / 7);
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { r: col.e1(), b: col.e2(), s: col.sq(), f: col.fig(), e: col.eig(), t: col.mid(), m: th().muted, p: col.pos(), n: col.neg(), o: col.orb(), v: col.v() },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let bx = formula(g, src, fstyle(s, color, weight));
      while (bx.w > maxW && s > 9.5) {
        s -= 0.5;
        bx = formula(g, src, fstyle(s, color, weight));
      }
      return bx;
    }
    /** 2×2-Matrix als Formeltext; Spalten wahlweise farbig. */
    function matSrc(m: Mat, c1 = '', c2 = '', d = 2): string {
      const w1 = (s: string) => (c1 ? `\\c{${c1}}{${s}}` : s);
      const w2 = (s: string) => (c2 ? `\\c{${c2}}{${s}}` : s);
      return `\\m{${w1(N(m.a, d))}}{${w2(N(m.b, d))}}{${w1(N(m.c, d))}}{${w2(N(m.d, d))}}`;
    }
    /** Richtungsvektor mit „schönem“ Vorzeichen (erste Koordinate ≥ 0). */
    const nice = (v: Vec): Vec => (v[0] < -1e-9 || (Math.abs(v[0]) < 1e-9 && v[1] < 0) ? [-v[0] + 0, -v[1] + 0] : v);
    const vecSrc = (v: Vec, c = '', d = 2) => (c ? `\\c{${c}}{\\v{${N(v[0], d)}}{${N(v[1], d)}}}` : `\\v{${N(v[0], d)}}{${N(v[1], d)}}`);
    const matHtml = (m: Mat, d = 2) => `(${N(m.a, d)}  ${N(m.b, d)}; ${N(m.c, d)}  ${N(m.d, d)})`;

    /* ---------- Zeichenhilfen ---------- */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; bounds?: Rect; weight?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const wgt = opts.weight ?? 700;
      const bx = opts.maxW ? fit(src, opts.maxW, size, color, wgt) : formula(g, src, fstyle(size, color, wgt));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - bx.w : x - bx.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - bx.w - 10);
      let base = y + (bx.asc - bx.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + bx.asc + 7, opts.bounds.y + opts.bounds.h - bx.desc - 7);
      const rr = { x: left - 8, y: base - bx.asc - 5, w: bx.w + 16, h: bx.asc + bx.desc + 10 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      bx.draw(g, left, base);
      g.restore();
      return rr;
    }

    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(y) || !Number.isFinite(x)) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.45));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
      g.restore();
    }
    /** Leuchtender Hof um einen Punkt. */
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(y) || !Number.isFinite(x)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.42 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Pfeil in Pixeln, auf Wunsch mit weichem Schatten. */
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, opts: { head?: number; alpha?: number; glow?: boolean; dash?: number[] } = {}): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      const a = opts.alpha ?? 1;
      if (len < 1.5 || a <= 0.01) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(opts.head ?? 12, len * 0.5);
      g.save();
      g.globalAlpha *= a;
      if (opts.glow) {
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : mixColor(color, '#ffffff', 0.35, 0.55);
        g.shadowBlur = th().dark ? 8 : 6;
        g.shadowOffsetY = 2;
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5);
      g.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5);
      g.closePath();
      g.fill();
      g.restore();
    }
    /** Pfeil in Weltkoordinaten. */
    function arrowW(from: Vec, to: Vec, color: string, width: number, opts: { head?: number; alpha?: number; glow?: boolean; dash?: number[] } = {}): void {
      const [x0, y0] = plot.toPx(from[0], from[1]);
      const [x1, y1] = plot.toPx(to[0], to[1]);
      arrowPx(x0, y0, x1, y1, color, width, opts);
    }

    /** Polygon in Weltkoordinaten (nach der Abbildung m) als Pfad. */
    function pathPoly(m: Mat, pts: Vec[], close = true): void {
      const g = surface.g;
      g.beginPath();
      pts.forEach((v, i) => {
        const w = apply(m, v);
        const x = plot.px(w[0]);
        const y = plot.py(w[1]);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      if (close) g.closePath();
    }
    /** Gefülltes Polygon mit Verlauf, weichem Schatten und Rand. */
    function fillPoly(m: Mat, pts: Vec[], color: string, opts: { alpha?: number; fillA?: number; width?: number; dash?: number[]; shadow?: boolean; noFill?: boolean } = {}): void {
      const a = opts.alpha ?? 1;
      if (a <= 0.01 || pts.length < 2) return;
      const g = surface.g;
      const dark = th().dark;
      g.save();
      g.globalAlpha *= a;
      g.lineJoin = 'round';
      if (!opts.noFill) {
        const fa = opts.fillA ?? (dark ? 0.42 : 0.3);
        if (opts.shadow) {
          g.save();
          g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : withAlpha(color, 0.35);
          g.shadowBlur = 10;
          g.shadowOffsetY = 3;
          pathPoly(m, pts);
          g.fillStyle = withAlpha(color, fa * 0.6);
          g.fill();
          g.restore();
        }
        pathPoly(m, pts);
        g.fillStyle = withAlpha(color, fa);
        g.fill();
      }
      pathPoly(m, pts);
      g.strokeStyle = color;
      g.lineWidth = opts.width ?? 2.2;
      if (opts.dash) g.setLineDash(opts.dash);
      g.stroke();
      g.restore();
    }
    function strokeLine(m: Mat, pts: Vec[], color: string, width: number, alpha = 1, dash?: number[]): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      pathPoly(m, pts, false);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.stroke();
      g.restore();
    }
    /** Gerade durch den Ursprung mit Richtung u (gestrichelt, über den ganzen Ausschnitt). */
    function lineThrough(u: Vec, color: string, width: number, alpha: number, dash: number[] = [8, 6], through: Vec = [0, 0]): void {
      if (alpha <= 0.01) return;
      const big = 60;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(plot.px(through[0] - u[0] * big), plot.py(through[1] - u[1] * big));
      g.lineTo(plot.px(through[0] + u[0] * big), plot.py(through[1] + u[1] * big));
      g.stroke();
      g.restore();
    }
    /** Punkt am Bildrand (eingerückt) in Richtung u vom Ursprung aus – für Beschriftungen an Geraden. */
    function edgePoint(u: Vec, inset: number): [number, number] {
      const r = plot.rect;
      const [ox, oy] = plot.toPx(0, 0);
      const dx = u[0];
      const dy = -u[1];
      let tMax = Infinity;
      if (dx > 1e-9) tMax = Math.min(tMax, (r.x + r.w - inset - ox) / dx);
      if (dx < -1e-9) tMax = Math.min(tMax, (r.x + inset - ox) / dx);
      if (dy > 1e-9) tMax = Math.min(tMax, (r.y + r.h - inset - oy) / dy);
      if (dy < -1e-9) tMax = Math.min(tMax, (r.y + inset + 30 - oy) / dy);
      if (!Number.isFinite(tMax) || tMax < 0) tMax = 0;
      return [ox + dx * tMax, oy + dy * tMax];
    }

    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      if (accent) {
        const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + Math.min(80, r.h));
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.13 : 0.075));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function cardTitle(R: Rect, title: string, color: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      const room0 = R.w - 2 * pad - 15;
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 10.5) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = str.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      /** Gitterlinien wachsen von der Mitte aus */
      grid: number;
      /** Einheitsvektoren wachsen */
      vec: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, grid: 1, vec: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3600) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 420)),
        grid: ease.inOutCubic(clamp01((t - 80) / 900)),
        vec: ease.outBack(clamp01((t - 550) / 650)),
        labels: ease.outCubic(clamp01((t - 2200) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1600),
      };
    }

    /* ---------- Bereich des Bildes ---------- */
    function figPoints(f: Figure): Vec[] {
      return [...f.fills.flat(), ...f.lines.flat(), ...f.dots];
    }
    const SQ: Vec[] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    const CIRCLE: Vec[] = Array.from({ length: 96 }, (_, i) => [Math.cos((i / 96) * TAU), Math.sin((i / 96) * TAU)] as Vec);
    function retargetBox(now: number, instant: boolean): void {
      const A = exactA();
      const B = exactB();
      const m = mode();
      const pts: Vec[] = [
        [0, 0],
        [1, 1],
        [-0.6, -0.6],
      ];
      const add = (M: Mat, list: Vec[]) => {
        for (const v of list) pts.push(apply(M, v));
      };
      const fp = figPoints(figure(p.fig as FigKey));
      if (m === 'map' || m === 'det' || m === 'inv') {
        add(A, SQ);
        add(A, fp);
        if (p.orig) add(IDENTITY, fp);
        if (p.uc && m !== 'inv') add(A, CIRCLE.filter((_, i) => i % 6 === 0));
        if (m === 'inv') {
          add(IDENTITY, fp);
          const Ai = inverse(A);
          if (Ai && Math.abs(det(A)) > 0.15) add(Ai, fp);
        }
      } else if (m === 'comp') {
        const ch = chain(A, B);
        add(IDENTITY, fp);
        add(ch.R, fp);
        add(mul(ch.L, ch.R), fp);
        add(mul(ch.L, ch.R), SQ);
        if (p.cmp) add(mul(ch.R, ch.L), fp);
      } else if (m === 'eig') {
        add(A, CIRCLE.filter((_, i) => i % 4 === 0));
        add(IDENTITY, CIRCLE.filter((_, i) => i % 8 === 0).map((v) => [v[0] * 1.7, v[1] * 1.7] as Vec));
        add(IDENTITY, [
          [A.a, A.c],
          [A.b, A.d],
        ]);
      } else {
        const orbit = iterate(A, [p.x0, p.y0], p.n);
        add(IDENTITY, orbit);
        const st = stationary(A);
        if (st) pts.push(st);
      }
      let x0 = Infinity;
      let x1 = -Infinity;
      let y0 = Infinity;
      let y1 = -Infinity;
      for (const v of pts) {
        if (!Number.isFinite(v[0]) || !Number.isFinite(v[1])) continue;
        x0 = Math.min(x0, clamp(v[0], -40, 40));
        x1 = Math.max(x1, clamp(v[0], -40, 40));
        y0 = Math.min(y0, clamp(v[1], -40, 40));
        y1 = Math.max(y1, clamp(v[1], -40, 40));
      }
      // Rand und Mindestgröße
      const minSpan = m === 'pow' ? 1.6 : 4.4;
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const hw = Math.max(minSpan / 2, ((x1 - x0) / 2) * 1.14 + 0.25);
      const hh = Math.max(minSpan / 2, ((y1 - y0) / 2) * 1.14 + 0.25);
      // oben Platz für die Matrix-Anzeige
      const top = hh * 0.22;
      let bx0 = cx - hw;
      let bx1 = cx + hw;
      let by0 = cy - hh;
      let by1 = cy + hh + top;
      if (m === 'pow') {
        // Ursprung nicht am Rand (Achsenbeschriftung), rechts Platz für die Achsenbezeichnung
        bx0 = Math.min(bx0, -0.16 * (bx1 - bx0));
        by0 = Math.min(by0, -0.14 * (by1 - by0));
        bx1 += 0.16 * (bx1 - bx0);
        by1 += 0.08 * (by1 - by0);
      }
      const goals: [Chan, number][] = [
        [box.x0, bx0],
        [box.x1, bx1],
        [box.y0, by0],
        [box.y1, by1],
      ];
      for (const [c, v] of goals) {
        if (instant || reduced()) c.jump(v);
        else if (dragging()) c.follow(v, 0.35);
        else c.glide(v, 900, 0, now);
      }
    }

    /* ---------- Bausteine im Bild ---------- */
    /** Bild des Gitters: Geraden x = k und y = k nach der Abbildung m. */
    function drawImageGrid(m: Mat, alpha: number, reveal: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const dark = th().dark;
      const G = 14;
      const L0 = G * reveal;
      g.save();
      g.lineCap = 'round';
      for (let k = -G; k <= G; k++) {
        const ak = alpha * clamp01(reveal * 2.4 - (Math.abs(k) / G) * 1.4);
        if (ak <= 0.01) continue;
        const axis = k === 0;
        g.globalAlpha = ak;
        // Bild der senkrechten Geraden x = k (Richtung A·e₂) und der waagrechten y = k (Richtung A·e₁)
        g.lineWidth = axis ? 2 : 1.1;
        g.strokeStyle = axis ? withAlpha(col.e2(), dark ? 0.75 : 0.6) : withAlpha(col.fig(), dark ? 0.34 : 0.24);
        pathPoly(m, [
          [k, -L0],
          [k, L0],
        ], false);
        g.stroke();
        g.strokeStyle = axis ? withAlpha(col.e1(), dark ? 0.75 : 0.6) : withAlpha(col.fig(), dark ? 0.34 : 0.24);
        pathPoly(m, [
          [-L0, k],
          [L0, k],
        ], false);
        g.stroke();
      }
      g.restore();
    }

    /** Figur nach der Abbildung m; beim Wechsel der Figur blendet die alte aus. */
    function drawFigure(m: Mat, color: string, alpha: number, opts: { dash?: number[]; outline?: boolean; fillA?: number; shadow?: boolean } = {}): void {
      const now = frameNow;
      if (figFrom) {
        const t = clamp01((now - figFrom.t0) / 600);
        if (t < 1) drawFigureOf(figFrom.fig, m, color, alpha * (1 - ease.outCubic(t)), opts);
        drawFigureOf(fig, m, color, alpha * ease.outCubic(t), opts);
        return;
      }
      drawFigureOf(fig, m, color, alpha, opts);
    }
    function drawFigureOf(f: Figure, m: Mat, color: string, alpha: number, opts: { dash?: number[]; outline?: boolean; fillA?: number; shadow?: boolean }): void {
      if (alpha <= 0.01) return;
      const theme = th();
      f.fills.forEach((poly, i) => {
        // Augen des Smileys und Flügel nur umrandet bzw. kräftiger
        const fa = opts.fillA ?? (theme.dark ? 0.42 : 0.3);
        fillPoly(m, poly, color, { alpha, fillA: i === 0 ? fa : Math.min(0.9, fa * 1.9), width: opts.outline ? 1.6 : 2.2, dash: opts.dash, noFill: opts.outline, shadow: opts.shadow && i === 0 });
      });
      for (const ln of f.lines) strokeLine(m, ln, color, opts.outline ? 1.6 : 2.2, alpha, opts.dash);
      if (f.dots.length) {
        const g = surface.g;
        g.save();
        g.globalAlpha *= alpha;
        for (const v of f.dots) {
          const w = apply(m, v);
          // Farbe nach dem Winkel des Urbilds: zeigt, wohin welcher Teil der Ebene wandert
          const hue = (Math.atan2(v[1], v[0]) / TAU + 1) % 1;
          const c = hue < 0.25 ? col.e1() : hue < 0.5 ? col.eig() : hue < 0.75 ? col.sq() : col.e2();
          const x = plot.px(w[0]);
          const y = plot.py(w[1]);
          if (opts.outline) {
            g.strokeStyle = c;
            g.lineWidth = 1.2;
            g.beginPath();
            g.arc(x, y, 3, 0, TAU);
            g.stroke();
          } else {
            g.fillStyle = c;
            g.beginPath();
            g.arc(x, y, 3.6, 0, TAU);
            g.fill();
          }
        }
        g.restore();
      }
    }

    /** Einheitsquadrat (bzw. sein Bild) mit Füllung. */
    function drawSquare(m: Mat, alpha: number, fillA?: number): void {
      fillPoly(m, SQ, col.sq(), { alpha, fillA: fillA ?? (th().dark ? 0.26 : 0.18), width: 2 });
    }

    /** Bilder der Einheitsvektoren mit Beschriftung. */
    function drawBasis(m: Mat, k: Intro, alpha: number, labels = true): void {
      if (alpha <= 0.01) return;
      const s = k.vec;
      const e1 = apply(m, [s, 0]);
      const e2 = apply(m, [0, s]);
      arrowW([0, 0], e1, col.e1(), 3.4, { glow: true, alpha });
      arrowW([0, 0], e2, col.e2(), 3.4, { glow: true, alpha });
      if (!labels || k.labels <= 0.01) return;
      const r = plot.rect;
      const [ax, ay] = plot.toPx(e1[0], e1[1]);
      const [bx, by] = plot.toPx(e2[0], e2[1]);
      const off = (x: number, y: number): [number, number] => {
        const [ox, oy] = plot.toPx(0, 0);
        const dx = x - ox;
        const dy = y - oy;
        const l = Math.hypot(dx, dy) || 1;
        return [x + (dx / l) * 22, y + (dy / l) * 18];
      };
      const [lx, ly] = off(ax, ay);
      const [mx, my] = off(bx, by);
      const close = Math.hypot(lx - mx, ly - my) < 40;
      fpill(lx, ly, '\\c{r}{A·e_1}', { size: fs(12.5, 11.5), alpha: alpha * k.labels, bounds: r, border: withAlpha(col.e1(), 0.5) });
      fpill(mx, my + (close ? 26 : 0), '\\c{b}{A·e_2}', { size: fs(12.5, 11.5), alpha: alpha * k.labels, bounds: r, border: withAlpha(col.e2(), 0.5) });
    }

    /** Eigenrichtungen als gestrichelte Geraden mit λ am Rand. */
    function drawEigenLines(m: Mat, alpha: number, labels: boolean): void {
      if (alpha <= 0.01) return;
      if (isScalar(m, 1e-6)) return;
      const e = eigen(m);
      const r = plot.rect;
      e.forEach((qv, i) => {
        lineThrough(qv.vector, col.eig(), 2.2, alpha * 0.9, [9, 6]);
        if (!labels) return;
        const u: Vec = qv.vector[0] < -1e-9 || (Math.abs(qv.vector[0]) < 1e-9 && qv.vector[1] < 0) ? [-qv.vector[0], -qv.vector[1]] : qv.vector;
        const [ex, ey] = edgePoint(u, 34 + i * 6);
        fpill(ex, ey, `\\c{e}{λ_${e.length > 1 ? i + 1 : ''} = ${S(N(qv.value, 2))}}`, { size: fs(12.5, 11.5), alpha, bounds: r, border: withAlpha(col.eig(), 0.55) });
      });
    }

    /** Matrix-Anzeige oben links im Bild. */
    function matrixPill(src: string, alpha: number, border: string): void {
      const r = plot.rect;
      const bx = fit(src, r.w * 0.62, fs(14, 12.5), th().text, 700);
      fpill(r.x + 14 + bx.w / 2 + 2, r.y + 14 + (bx.asc + bx.desc) / 2, src, { alpha, size: fs(14, 12.5), maxW: r.w * 0.62, border });
    }

    /** Kenngrößen des Typs: Drehwinkel, Spiegelachse, Projektionsgerade, Scherachse. */
    function drawTypeHints(m: Mat, A: Mat, alpha: number, k: Intro): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const D = describe(A, 1e-6);
      const r = plot.rect;
      const [ox, oy] = plot.toPx(0, 0);
      const a2 = alpha * k.labels;
      if (D.kind === 'reflection' && D.axis !== undefined) {
        const u: Vec = [Math.cos(D.axis * DEG), Math.sin(D.axis * DEG)];
        lineThrough(u, th().text, 2, a2 * 0.55, [3, 5]);
        const [ex, ey] = edgePoint(u, 110);
        fpill(ex, ey + 24, T2('\\t{Spiegelachse}', '\\t{mirror line}'), { size: fs(12, 11), alpha: a2, bounds: r, color: th().muted });
      }
      if ((D.kind === 'rotation' || D.kind === 'rotscale') && D.angle !== undefined) {
        // Winkelbogen von e₁ zu A·e₁
        const cur = Math.atan2(m.c, m.a);
        const rad = 30;
        g.save();
        g.globalAlpha *= a2;
        g.strokeStyle = col.e1();
        g.lineWidth = 2;
        g.beginPath();
        g.arc(ox, oy, rad, 0, -cur, cur > 0);
        g.stroke();
        g.restore();
        const mid = -cur / 2;
        fpill(ox + Math.cos(mid) * (rad + 24), oy + Math.sin(mid) * (rad + 18), `\\c{r}{φ = ${S(`${N(cur / DEG, 0)}°`)}}`, { size: fs(12, 11), alpha: a2, bounds: r });
      }
      if (D.kind === 'projection' && D.axis !== undefined && D.proj !== 'zero') {
        const u: Vec = [Math.cos(D.axis * DEG), Math.sin(D.axis * DEG)];
        lineThrough(u, col.fig(), 2.4, a2 * 0.8, [2, 0]);
        const kv = kernel(A);
        // Projektionsstrahlen von einigen Eckpunkten der Figur (z. B. Lichtstrahlen beim Schatten)
        if (kv) {
          const pts = figPoints(fig).filter((_, i) => i % Math.max(1, Math.floor(figPoints(fig).length / 6)) === 0).slice(0, 7);
          for (const v of pts) {
            const w = apply(m, v);
            const [x0, y0] = plot.toPx(v[0], v[1]);
            const [x1, y1] = plot.toPx(w[0], w[1]);
            arrowPx(x0, y0, x1, y1, withAlpha(exKey() === 'shadow' ? col.eig() : th().muted, 0.85), 1.4, { head: 7, alpha: a2 * 0.8, dash: [4, 4] });
          }
        }
      }
      if (D.kind === 'shear' && D.shearDir) {
        const u: Vec = D.shearDir === 'x' ? [1, 0] : [0, 1];
        lineThrough(u, col.eig(), 2.6, a2 * 0.6, [2, 0]);
      }
    }

    /** Hintergrundszene der Alltagsbeispiele. */
    function drawScenery(alpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const dark = th().dark;
      const ex = exKey();
      const [, oy] = plot.toPx(0, 0);
      g.save();
      g.globalAlpha *= alpha;
      if (ex === 'shadow') {
        // Boden unterhalb der x-Achse und Sonne rechts oben
        const yb = clamp(oy, r.y, r.y + r.h);
        const grad = g.createLinearGradient(0, yb, 0, r.y + r.h);
        grad.addColorStop(0, dark ? 'rgba(120,96,60,0.35)' : 'rgba(176,142,92,0.28)');
        grad.addColorStop(1, dark ? 'rgba(120,96,60,0.08)' : 'rgba(176,142,92,0.06)');
        g.fillStyle = grad;
        g.fillRect(r.x, yb, r.w, r.y + r.h - yb);
        const sx = r.x + r.w - 44;
        const sy = r.y + 70;
        const sg = g.createRadialGradient(sx, sy, 2, sx, sy, 40);
        sg.addColorStop(0, 'rgba(255,214,90,0.95)');
        sg.addColorStop(0.45, 'rgba(255,196,60,0.55)');
        sg.addColorStop(1, 'rgba(255,196,60,0)');
        g.fillStyle = sg;
        g.beginPath();
        g.arc(sx, sy, 40, 0, TAU);
        g.fill();
        g.fillStyle = '#ffc93c';
        g.beginPath();
        g.arc(sx, sy, 13, 0, TAU);
        g.fill();
      } else if (ex === 'mirror') {
        const yb = clamp(oy, r.y, r.y + r.h);
        const grad = g.createLinearGradient(0, yb, 0, r.y + r.h);
        grad.addColorStop(0, dark ? 'rgba(60,130,200,0.32)' : 'rgba(90,160,225,0.26)');
        grad.addColorStop(1, dark ? 'rgba(30,70,130,0.12)' : 'rgba(90,160,225,0.06)');
        g.fillStyle = grad;
        g.fillRect(r.x, yb, r.w, r.y + r.h - yb);
        g.strokeStyle = dark ? 'rgba(150,200,255,0.25)' : 'rgba(255,255,255,0.7)';
        g.lineWidth = 1.4;
        for (let i = 1; i <= 6; i++) {
          const y = yb + i * 18;
          if (y > r.y + r.h) break;
          g.beginPath();
          for (let x = r.x; x <= r.x + r.w; x += 8) {
            const yy = y + Math.sin((x + i * 30) / 14) * 2;
            if (x === r.x) g.moveTo(x, yy);
            else g.lineTo(x, yy);
          }
          g.stroke();
        }
      } else if (ex === 'sprite') {
        // ein paar Sterne
        let s = 11;
        const rnd = () => {
          s = (s * 16807) % 2147483647;
          return s / 2147483647;
        };
        g.fillStyle = dark ? 'rgba(220,230,255,0.7)' : 'rgba(80,90,140,0.35)';
        for (let i = 0; i < 46; i++) {
          const x = r.x + rnd() * r.w;
          const y = r.y + rnd() * r.h;
          const rr = 0.6 + rnd() * 1.4;
          g.beginPath();
          g.arc(x, y, rr, 0, TAU);
          g.fill();
        }
      } else if (ex === 'italic') {
        // Schreiblinien
        g.strokeStyle = withAlpha(col.e2(), dark ? 0.4 : 0.3);
        g.lineWidth = 1.2;
        for (const y of [0.2, 2.5]) {
          const py = plot.py(y);
          g.beginPath();
          g.moveTo(r.x, py);
          g.lineTo(r.x + r.w, py);
          g.stroke();
        }
      } else if (ex === 'kaleido') {
        // die beiden Spiegel als silberne Linien
        for (const a of [0, 60]) {
          const u: Vec = [Math.cos(a * DEG), Math.sin(a * DEG)];
          g.save();
          g.lineCap = 'round';
          g.strokeStyle = dark ? 'rgba(210,220,235,0.55)' : 'rgba(120,135,160,0.55)';
          g.lineWidth = 6;
          g.beginPath();
          g.moveTo(plot.px(-u[0] * 40), plot.py(-u[1] * 40));
          g.lineTo(plot.px(u[0] * 40), plot.py(u[1] * 40));
          g.stroke();
          g.strokeStyle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.9)';
          g.lineWidth = 1.6;
          g.stroke();
          g.restore();
        }
      }
      g.restore();
    }

    /* ---------- Ansichten im Bild ---------- */
    /** Abbildung: Gitter, Einheitsquadrat, Figur, Bilder der Einheitsvektoren. */
    function drawMap(alpha: number, k: Intro): void {
      const A = Ashown();
      const m = viewMatrix('map');
      const theme = th();
      drawImageGrid(m, alpha * kGrid.v, k.grid);
      if (kUc.v > 0.01) {
        fillPoly(IDENTITY, CIRCLE, theme.muted, { alpha: alpha * kUc.v * 0.7, noFill: true, width: 1.4, dash: [4, 4] });
        fillPoly(m, CIRCLE, col.eig(), { alpha: alpha * kUc.v, fillA: theme.dark ? 0.16 : 0.1, width: 2 });
      }
      if (kOrig.v > 0.01) {
        fillPoly(IDENTITY, SQ, theme.muted, { alpha: alpha * kOrig.v * 0.8, noFill: true, width: 1.4, dash: [4, 4] });
        drawFigure(IDENTITY, theme.muted, alpha * kOrig.v * 0.75, { outline: true, dash: [4, 4] });
      }
      drawSquare(m, alpha * k.vec);
      // beim Schatten-Beispiel ist das Bild ein dunkler Schatten
      const figCol = exKey() === 'shadow' ? mixColor(theme.text, col.fig(), 0.25) : col.fig();
      drawFigure(m, figCol, alpha * clamp01(k.vec * 1.5), { shadow: true });
      drawTypeHints(m, A, alpha * clamp01((T.v - 0.85) / 0.15), k);
      if (p.eig) drawEigenLines(A, alpha * kEig.v * clamp01((T.v - 0.9) / 0.1) * k.labels, show());
      drawBasis(m, k, alpha);
      // Matrix oben links (während des Abspielens mit t)
      const tt = T.v;
      const Am = cntMat('pm', A);
      const src = tt < 0.999 ? `\\c{m}{t = ${N(tt, 2)}:}  ${matSrc(m, 'r', 'b')}` : `A = ${matSrc(Am, 'r', 'b')}`;
      matrixPill(src, alpha * k.panel, withAlpha(col.fig(), 0.4));
    }

    /** Verkettung: erst die rechte, dann die linke Matrix. */
    function drawComp(alpha: number, k: Intro): void {
      const theme = th();
      const A = Ashown();
      const B = Bshown();
      const ch = chain(A, B);
      const s = CK.v;
      const m = viewMatrix('comp');
      const P = mul(ch.L, ch.R);
      const Q = mul(ch.R, ch.L);
      drawImageGrid(m, alpha * kGrid.v * 0.85, k.grid);
      if (kOrig.v > 0.01) drawFigure(IDENTITY, theme.muted, alpha * kOrig.v * 0.7, { outline: true, dash: [4, 4] });
      // Zwischenstand R·F (nach der ersten Etappe)
      const kMid = clamp01((s - 0.6) / 0.4);
      if (kMid > 0.01) drawFigure(ch.R, col.mid(), alpha * kMid * (s > 1 ? 0.85 : 1), { outline: s > 1.05, dash: s > 1.05 ? [6, 4] : undefined });
      // Vergleich: andere Reihenfolge
      if (kCmp.v > 0.01 && s > 1.98) {
        drawFigure(Q, col.neg(), alpha * kCmp.v * 0.9, { outline: true, dash: [2, 4] });
      }
      drawSquare(m, alpha * k.vec);
      drawFigure(m, col.fig(), alpha, { shadow: true });
      drawBasis(m, k, alpha, false);
      // Beschriftungen an den Figuren
      const r = plot.rect;
      const centroid = (M: Mat) => {
        const pts = figPoints(fig).map((v) => apply(M, v));
        const cx = pts.reduce((u, v) => u + v[0], 0) / pts.length;
        const cy = pts.reduce((u, v) => u + v[1], 0) / pts.length;
        return plot.toPx(cx, cy);
      };
      const lab = (M: Mat, src: string, color: string, a: number, dy = 0) => {
        const [x, y] = centroid(M);
        fpill(x, y + dy, src, { size: fs(12.5, 11.5), alpha: a, bounds: r, border: withAlpha(color, 0.55) });
      };
      if (kMid > 0.01) lab(ch.R, `\\c{t}{${ch.nR}·F}`, col.mid(), alpha * kMid * k.labels);
      if (s > 1.02) lab(m, `\\c{f}{${ch.nL}·${ch.nR}·F}`, col.fig(), alpha * clamp01((s - 1) * 3) * k.labels, 0);
      if (kCmp.v > 0.01 && s > 1.98) lab(Q, `\\c{n}{${ch.nR}·${ch.nL}·F}`, col.neg(), alpha * kCmp.v * k.labels * 0.95, 0);
      // Etappe
      const stage = s < 1 ? `1. \\c{t}{${ch.nR}} ${T2('wirkt', 'acts')}` : s < 1.999 ? `2. \\c{f}{${ch.nL}} ${T2('wirkt', 'acts')}` : '';
      if (stage && CK.busy) fpill(r.x + r.w / 2, r.y + r.h - 22, `\\t{${stage}}`, { size: fs(13, 12), alpha, bounds: r });
      const Pm = cntMat('pc', P);
      matrixPill(`${ch.nL}·${ch.nR} = ${matSrc(Pm, 'r', 'b')}`, alpha * k.panel, withAlpha(col.fig(), 0.4));
    }

    /** Determinante: orientierter Flächeninhalt. */
    function drawDet(alpha: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const A = Ashown();
      const m = viewMatrix('det');
      const D = det(m);
      const r = plot.rect;
      const sign = D > 1e-6 ? 1 : D < -1e-6 ? -1 : 0;
      const cc = sign > 0 ? col.pos() : sign < 0 ? col.neg() : th().muted;
      drawImageGrid(m, alpha * kGrid.v * 0.7, k.grid);
      if (kUc.v > 0.01) fillPoly(m, CIRCLE, col.eig(), { alpha: alpha * kUc.v, fillA: theme.dark ? 0.14 : 0.08, width: 1.8 });
      if (kOrig.v > 0.01) {
        fillPoly(IDENTITY, SQ, theme.muted, { alpha: alpha * kOrig.v * 0.8, noFill: true, width: 1.4, dash: [4, 4] });
        drawFigure(IDENTITY, theme.muted, alpha * kOrig.v * 0.6, { outline: true, dash: [4, 4] });
      }
      drawFigure(m, col.fig(), alpha * 0.55, { fillA: theme.dark ? 0.22 : 0.14 });
      // Parallelogramm in der Farbe des Vorzeichens
      fillPoly(m, SQ, cc, { alpha, fillA: theme.dark ? 0.4 : 0.28, width: 2.6, shadow: true });
      // Umlaufsinn: Bogen von A·e₁ nach A·e₂
      const [ox, oy] = plot.toPx(0, 0);
      const a1 = Math.atan2(m.c, m.a);
      const a2 = Math.atan2(m.d, m.b);
      if (sign !== 0 && Math.hypot(m.a, m.c) > 0.05 && Math.hypot(m.b, m.d) > 0.05) {
        let dA = a2 - a1;
        while (dA > Math.PI) dA -= TAU;
        while (dA < -Math.PI) dA += TAU;
        const rad = clamp(Math.min(Math.hypot(m.a, m.c), Math.hypot(m.b, m.d)) * plot.scale.x * 0.42, 16, 44);
        g.save();
        g.globalAlpha *= alpha * k.labels;
        g.strokeStyle = cc;
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath();
        const from = -a1;
        const to = -(a1 + dA * 0.92);
        g.arc(ox, oy, rad, from, to, dA > 0);
        g.stroke();
        const tx = ox + Math.cos(to) * rad;
        const ty = oy + Math.sin(to) * rad;
        const tang = to + (dA > 0 ? -Math.PI / 2 : Math.PI / 2);
        g.fillStyle = cc;
        g.beginPath();
        g.moveTo(tx + Math.cos(tang) * 8, ty + Math.sin(tang) * 8);
        g.lineTo(tx + Math.cos(tang + 2.5) * 8, ty + Math.sin(tang + 2.5) * 8);
        g.lineTo(tx + Math.cos(tang - 2.5) * 8, ty + Math.sin(tang - 2.5) * 8);
        g.closePath();
        g.fill();
        g.restore();
      }
      // Grundseite und Höhe
      if (kHgt.v > 0.01 && sign !== 0) {
        const u: Vec = [m.a, m.c];
        const lu = Math.hypot(u[0], u[1]);
        if (lu > 0.05) {
          const v: Vec = [m.b, m.d];
          const tt = (v[0] * u[0] + v[1] * u[1]) / (lu * lu);
          const foot: Vec = [u[0] * tt, u[1] * tt];
          lineThrough([u[0] / lu, u[1] / lu], th().muted, 1.2, alpha * kHgt.v * 0.6, [3, 4]);
          const [fx, fy] = plot.toPx(foot[0], foot[1]);
          const [vx, vy] = plot.toPx(v[0], v[1]);
          g.save();
          g.globalAlpha *= alpha * kHgt.v;
          g.strokeStyle = col.eig();
          g.lineWidth = 2.4;
          g.setLineDash([6, 4]);
          g.beginPath();
          g.moveTo(fx, fy);
          g.lineTo(vx, vy);
          g.stroke();
          g.setLineDash([]);
          // rechter Winkel
          const ex = (u[0] / lu) * 9;
          const ey = (-u[1] / lu) * 9;
          const hx = (vx - fx) / (Math.hypot(vx - fx, vy - fy) || 1) * 9;
          const hy = (vy - fy) / (Math.hypot(vx - fx, vy - fy) || 1) * 9;
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(fx + ex, fy + ey);
          g.lineTo(fx + ex + hx, fy + ey + hy);
          g.lineTo(fx + hx, fy + hy);
          g.stroke();
          g.restore();
          fpill((fx + vx) / 2 + 14, (fy + vy) / 2, `\\c{e}{h ≈ ${S(N(Math.abs(D) / lu, 2))}}`, { size: fs(12, 11), alpha: alpha * kHgt.v, bounds: r, align: 'left' });
          const [gx, gy] = plot.toPx(u[0] / 2, u[1] / 2);
          fpill(gx, gy + 18, `\\c{r}{g ≈ ${S(N(lu, 2))}}`, { size: fs(12, 11), alpha: alpha * kHgt.v, bounds: r });
        }
      }
      // Kern und Bildgerade bei det = 0
      if (sign === 0 && T.v > 0.98) {
        const kv = kernel(A);
        if (kv) {
          lineThrough(kv, col.neg(), 2.4, alpha * k.labels, [7, 5]);
          const [ex, ey] = edgePoint(kv[0] < 0 ? [-kv[0], -kv[1]] : kv, 44);
          fpill(ex, ey, T2('\\c{n}{\\t{Kern: wird zu 0}}', '\\c{n}{\\t{kernel: maps to 0}}'), { size: fs(12, 11), alpha: alpha * k.labels, bounds: r });
        }
      }
      drawBasis(m, k, alpha, true);
      // Flächeninhalt in der Mitte des Parallelogramms
      const cxy = apply(m, [0.5, 0.5]);
      const [cx, cy] = plot.toPx(cxy[0], cxy[1]);
      const Dc = cnt('pd', D);
      fpill(cx, cy + (sign === 0 ? 30 : 0), `\\c{${sign > 0 ? 'p' : sign < 0 ? 'n' : 'm'}}{\\t{det} = ${S(N(Dc, 2))}}`, { size: fs(13, 12), alpha: alpha * k.labels, bounds: r, border: withAlpha(cc, 0.6) });
      if (p.eig) drawEigenLines(A, alpha * kEig.v * clamp01((T.v - 0.9) / 0.1) * k.labels * 0.7, false);
      const Am = cntMat('pm', A);
      matrixPill(T.v < 0.999 ? `\\c{m}{t = ${N(T.v, 2)}:}  ${matSrc(m, 'r', 'b')}` : `A = ${matSrc(Am, 'r', 'b')}`, alpha * k.panel, withAlpha(cc, 0.45));
    }

    /** Eigenvektoren: Testvektor v, Bild A·v, Einheitskreis → Ellipse. */
    function drawEig(alpha: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const A = Ashown();
      const r = plot.rect;
      drawImageGrid(A, alpha * kGrid.v * 0.5, k.grid);
      // Einheitskreis und Bildellipse
      fillPoly(IDENTITY, CIRCLE.map((v) => [v[0] * vLen(), v[1] * vLen()] as Vec), theme.muted, { alpha: alpha * 0.7, noFill: true, width: 1.4, dash: [4, 4] });
      fillPoly(A, CIRCLE.map((v) => [v[0] * vLen(), v[1] * vLen()] as Vec), col.fig(), { alpha: alpha * k.vec, fillA: theme.dark ? 0.14 : 0.08, width: 1.8 });
      drawBasis(A, k, alpha * 0.55, false);
      if (p.eig) drawEigenLines(A, alpha * kEig.v * k.labels, show());
      // Testvektor
      const w = W.v * DEG;
      const L0 = vLen();
      const v: Vec = [L0 * Math.cos(w), L0 * Math.sin(w)];
      const Av = apply(A, v);
      const sa = sinAngle(A, v);
      const lenAv = Math.hypot(Av[0], Av[1]);
      const parallel = Math.abs(sa) < PAR && lenAv > 1e-6;
      const lam = (Av[0] * v[0] + Av[1] * v[1]) / (L0 * L0);
      // Gerade in Richtung v (zeigt, ob A·v darauf liegt)
      lineThrough([Math.cos(w), Math.sin(w)], col.v(), 1.4, alpha * 0.5, [2, 5]);
      const [vx, vy] = plot.toPx(v[0], v[1]);
      const [ax, ay] = plot.toPx(Av[0], Av[1]);
      if (parallel) {
        halo(ax, ay, col.eig(), 46, alpha);
        halo(vx, vy, col.eig(), 30, alpha * 0.8);
      }
      arrowW([0, 0], Av, col.fig(), 3.6, { glow: true, alpha });
      arrowW([0, 0], v, col.v(), 3.4, { glow: true, alpha });
      // Winkel zwischen v und A·v
      const [ox, oy] = plot.toPx(0, 0);
      if (!parallel && lenAv > 1e-6) {
        const a1 = -w;
        const a2 = -Math.atan2(Av[1], Av[0]);
        let dA = a2 - a1;
        while (dA > Math.PI) dA -= TAU;
        while (dA < -Math.PI) dA += TAU;
        g.save();
        g.globalAlpha *= alpha * 0.85;
        g.fillStyle = withAlpha(col.v(), theme.dark ? 0.25 : 0.16);
        g.beginPath();
        g.moveTo(ox, oy);
        g.arc(ox, oy, 26, a1, a1 + dA, dA < 0);
        g.closePath();
        g.fill();
        g.restore();
      }
      const lab = (x: number, y: number, src: string, color: string) => {
        const dx = x - ox;
        const dy = y - oy;
        const l = Math.hypot(dx, dy) || 1;
        fpill(x + (dx / l) * 22, y + (dy / l) * 18, src, { size: fs(12.5, 11.5), alpha: alpha * k.labels, bounds: r, border: withAlpha(color, 0.55) });
      };
      lab(vx, vy, '\\c{v}{v}', col.v());
      lab(ax, ay, parallel ? `\\c{f}{A·v = ${S(N(lam, 2))}·v}` : '\\c{f}{A·v}', col.fig());
      const Am = cntMat('pm', A);
      matrixPill(`A = ${matSrc(Am, 'r', 'b')}`, alpha * k.panel, withAlpha(col.eig(), 0.45));
    }

    /** Inverse: Hinweg mit A, Rückweg mit A⁻¹. */
    function drawInv(alpha: number, k: Intro): void {
      const A = Ashown();
      const m = viewMatrix('inv');
      const Ai = inverse(A, 1e-6);
      const r = plot.rect;
      const s = TR.v;
      drawImageGrid(m, alpha * kGrid.v * 0.8, k.grid);
      // Urbild (Ausgangsfigur)
      drawFigure(IDENTITY, col.e2(), alpha * (0.35 + 0.4 * kOrig.v), { outline: true, dash: [5, 4] });
      // A⁻¹·F allein (hell)
      if (Ai && Math.abs(det(A)) > 0.15 && TR.v > 0.999 && TR.v < 1.001) drawFigure(Ai, col.mid(), alpha * 0.55 * k.labels, { outline: true, dash: [2, 4] });
      drawSquare(m, alpha * k.vec * 0.8);
      drawFigure(m, col.fig(), alpha, { shadow: true });
      // Zuordnungspfeile von einigen Eckpunkten zu ihren Bildern
      if (Math.abs(s - 1) < 0.02) {
        const pts = figPoints(fig);
        const pick = pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 5)) === 0).slice(0, 5);
        for (const v of pick) {
          const w = apply(A, v);
          arrowW(v, w, withAlpha(col.fig(), 0.9), 1.4, { head: 7, alpha: alpha * 0.55 * k.labels, dash: [3, 4] });
        }
      }
      drawBasis(m, k, alpha, false);
      // Nicht umkehrbar: zwei Punkte mit demselben Bild
      if (!Ai) {
        const kv = kernel(A);
        if (kv) {
          const P: Vec = [1.4, 0.6];
          const Q: Vec = [P[0] + kv[0] * 1.6, P[1] + kv[1] * 1.6];
          const R = apply(A, P);
          lineThrough(kv, col.neg(), 2, alpha * 0.8 * k.labels, [7, 5], P);
          const [px, py] = plot.toPx(P[0], P[1]);
          const [qx, qy] = plot.toPx(Q[0], Q[1]);
          const [rx, ry] = plot.toPx(R[0], R[1]);
          arrowPx(px, py, rx, ry, col.neg(), 1.8, { head: 8, alpha: alpha * k.labels, dash: [4, 3] });
          arrowPx(qx, qy, rx, ry, col.neg(), 1.8, { head: 8, alpha: alpha * k.labels, dash: [4, 3] });
          dot(px, py, col.e2(), 5.5, alpha * k.labels);
          dot(qx, qy, col.e2(), 5.5, alpha * k.labels);
          dot(rx, ry, col.neg(), 6, alpha * k.labels);
          fpill(px - 14, py - 16, '\\c{b}{P}', { size: fs(12, 11), alpha: alpha * k.labels, bounds: r });
          fpill(qx - 14, qy - 16, '\\c{b}{Q}', { size: fs(12, 11), alpha: alpha * k.labels, bounds: r });
          fpill(rx + 18, ry + 16, T2('\\c{n}{\\t{gleiches Bild}}', '\\c{n}{\\t{same image}}'), { size: fs(12, 11), alpha: alpha * k.labels, bounds: r, align: 'left' });
        }
      }
      // Beschriftung der Etappe
      const stage = s < 0.999 ? T2('\\t{Hinweg: } \\c{f}{x ↦ A·x}', '\\t{there: } \\c{f}{x ↦ A·x}') : s > 1.001 ? T2('\\t{Rückweg: } \\c{t}{y ↦ A^{−1}·y}', '\\t{back: } \\c{t}{y ↦ A^{−1}·y}') : '';
      if (stage) fpill(r.x + r.w / 2, r.y + r.h - 22, stage, { size: fs(13, 12), alpha, bounds: r });
      const Am = cntMat('pm', A);
      matrixPill(`A = ${matSrc(Am, 'r', 'b')}`, alpha * k.panel, withAlpha(col.fig(), 0.4));
    }

    /** Iteration x, A·x, A²·x, … */
    function drawPow(alpha: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const A = Ashown();
      const r = plot.rect;
      const x0: Vec = [X0.v, Y0.v];
      const nShow = NC.v;
      const all = iterate(A, x0, Math.ceil(nShow) + 1);
      const st = stationary(A);
      const dom = dominant(A);
      // Gerade x + y = 1 bei Übergangsmatrizen
      if (st) {
        g.save();
        g.globalAlpha *= alpha * 0.7;
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.4;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(plot.px(-20), plot.py(21));
        g.lineTo(plot.px(21), plot.py(-20));
        g.stroke();
        g.restore();
      }
      if (p.eig && dom) {
        lineThrough(dom.vector, col.eig(), 2, alpha * kEig.v * 0.85 * k.labels, [9, 6]);
        const [ex, ey] = edgePoint(dom.vector, 40);
        if (!st) fpill(ex, ey, `\\c{e}{λ = ${S(N(dom.value, 2))}}`, { size: fs(12, 11), alpha: alpha * kEig.v * k.labels, bounds: r, border: withAlpha(col.eig(), 0.55) });
      }
      // Bahn
      const pts = all.map((v) => plot.toPx(v[0], v[1]));
      const full = Math.floor(nShow + 1e-9);
      const frac = nShow - full;
      g.save();
      g.lineJoin = 'round';
      for (let i = 0; i < full && i + 1 < pts.length; i++) {
        const [x1, y1] = pts[i]!;
        const [x2, y2] = pts[i + 1]!;
        const age = full - i;
        arrowPx(x1, y1, x2, y2, col.orb(), 2.2, { head: 9, alpha: alpha * clamp(1 - age * 0.05, 0.35, 1) });
      }
      if (frac > 0.01 && full + 1 < pts.length) {
        const [x1, y1] = pts[full]!;
        const [x2, y2] = pts[full + 1]!;
        const e = ease.inOutCubic(frac);
        arrowPx(x1, y1, lerp(x1, x2, e), lerp(y1, y2, e), col.orb(), 2.2, { head: 9, alpha });
      }
      g.restore();
      for (let i = 0; i <= full && i < pts.length; i++) {
        const [x, y] = pts[i]!;
        const last = i === full;
        if (last) halo(x, y, col.orb(), 26, alpha);
        dot(x, y, i === 0 ? col.e2() : col.orb(), last ? 6.5 : i === 0 ? 6 : 4.5, alpha);
      }
      // Stationärer Punkt
      if (st) {
        const [sx, sy] = plot.toPx(st[0], st[1]);
        dot(sx, sy, col.eig(), 7.5, alpha * k.labels, true);
        if (show()) fpill(sx - 14, sy - 22, `\\c{e}{s = (${q(st[0])} | ${q(st[1])})}`, { size: fs(12, 11), alpha: alpha * k.labels, bounds: r, align: 'right' });
      }
      // Beschriftungen x₀ und x_n
      const lbl = (i: number, src: string) => {
        const pt = pts[i];
        if (!pt) return;
        fpill(pt[0] + 14, pt[1] - 16, src, { size: fs(12, 11), alpha: alpha * k.labels, bounds: r, align: 'left' });
      };
      lbl(0, '\\c{b}{x_0}');
      if (full > 0) lbl(full, `\\c{o}{x_{${full}}}`);
      const Am = cntMat('pm', A);
      matrixPill(`A = ${matSrc(Am)}`, alpha * k.panel, withAlpha(col.orb(), 0.4));
    }

    /* ---------- Karten ---------- */
    interface RowSpec {
      src: string;
      size?: number;
      color?: string;
      hl?: string;
      text?: boolean;
      gap?: number;
      weight?: number;
      at?: number;
    }
    type CardFn = (R: Rect, measure: boolean) => number;

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[]): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, lines, font, h: lines.length * size * 1.3 };
        }
        const bx = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600);
        return { box: bx, lines: [] as string[], font: '', h: bx.asc + bx.desc };
      });
      const h = 36 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent);
      let y = R.y + 36;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = row.at ?? clamp01(k.stagger * (rows.length + 2) - i);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = (1 - ease.outCubic(a)) * 10;
        if (it.box) it.box.draw(g, R.x + pad + dx, y + it.box.asc);
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, R.x + pad + dx, y + size * 0.65 + j * size * 1.3));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return h;
    }
    const note = (de: string, en: string, size = fs(12, 11)): RowSpec => ({ src: T2(de, en), text: true, size, color: th().muted, gap: 6 });

    /** Name und Kenngrößen der Abbildung. */
    function kindText(D: Description, A: Mat): { name: string; detail: string } {
      const n = (v: number | undefined, d = 1) => (v === undefined ? '' : N(v, d));
      switch (D.kind) {
        case 'identity':
          return { name: T2('Identität (Einheitsmatrix E)', 'identity (identity matrix E)'), detail: T2('Jeder Punkt bleibt, wo er ist.', 'Every point stays where it is.') };
        case 'rotation':
          return Math.abs(Math.abs(D.angle ?? 0) - 180) < 1e-6
            ? { name: T2('Punktspiegelung am Ursprung', 'point reflection in the origin'), detail: T2('= Drehung um 180°', '= rotation by 180°') }
            : { name: T2(`Drehung um ${n(D.angle)}°`, `rotation by ${n(D.angle)}°`), detail: T2('Längen, Winkel und Flächen bleiben erhalten.', 'Lengths, angles and areas are preserved.') };
        case 'reflection':
          return { name: T2(`Spiegelung an der Achse unter ${n(D.axis)}°`, `reflection in the line at ${n(D.axis)}°`), detail: T2('Längen bleiben, der Umlaufsinn kehrt sich um.', 'Lengths stay, the orientation is reversed.') };
        case 'scaling':
          return D.factor !== undefined
            ? { name: T2(`zentrische Streckung mit k = ${n(D.factor, 2)}`, `central dilation with k = ${n(D.factor, 2)}`), detail: T2('Jede Richtung ist Eigenrichtung.', 'Every direction is an eigendirection.') }
            : { name: T2(`Streckung: x · ${n(D.kx, 2)}, y · ${n(D.ky, 2)}`, `scaling: x · ${n(D.kx, 2)}, y · ${n(D.ky, 2)}`), detail: T2('Die Achsen bleiben Eigenrichtungen.', 'The axes stay eigendirections.') };
        case 'shear':
          return {
            name: T2(`Scherung in ${D.shearDir}-Richtung, k = ${n(D.shear, 2)}`, `shear in ${D.shearDir}-direction, k = ${n(D.shear, 2)}`),
            detail: T2(`Die ${D.shearDir === 'x' ? 'x' : 'y'}-Achse bleibt fest, Flächen bleiben gleich (det = 1).`, `The ${D.shearDir === 'x' ? 'x' : 'y'}-axis stays fixed, areas are preserved (det = 1).`),
          };
        case 'rotscale':
          return { name: T2(`Drehstreckung: ${n(D.angle)}°, Faktor ${n(D.factor, 2)}`, `rotation with scaling: ${n(D.angle)}°, factor ${n(D.factor, 2)}`), detail: T2('Winkel bleiben, Längen · r, Flächen · r².', 'Angles stay, lengths · r, areas · r².') };
        case 'projection':
          if (D.proj === 'zero') return { name: T2('Nullabbildung', 'zero map'), detail: T2('Alles landet im Ursprung.', 'Everything lands in the origin.') };
          if (D.proj === 'orth') return { name: T2(`senkrechte Projektion auf die Gerade unter ${n(D.axis)}°`, `orthogonal projection onto the line at ${n(D.axis)}°`), detail: T2('Nicht umkehrbar (det = 0).', 'Not invertible (det = 0).') };
          if (D.proj === 'oblique') return { name: T2(`Parallelprojektion auf die Gerade unter ${n(D.axis)}°`, `parallel projection onto the line at ${n(D.axis)}°`), detail: T2('Schräg projiziert, nicht umkehrbar (det = 0).', 'Projected obliquely, not invertible (det = 0).') };
          return { name: T2(`Abbildung auf die Gerade unter ${n(D.axis)}°`, `map onto the line at ${n(D.axis)}°`), detail: T2('Die Ebene fällt auf eine Gerade (det = 0).', 'The plane collapses onto a line (det = 0).') };
        default: {
          const D0 = det(A);
          return {
            name: T2('allgemeine lineare Abbildung', 'general linear map'),
            detail: D0 < 0 ? T2('Umlaufsinn kehrt sich um.', 'Orientation is reversed.') : T2('Geraden bleiben Geraden, Parallelen bleiben parallel.', 'Lines stay lines, parallels stay parallel.'),
          };
        }
      }
    }

    /** Formel des Typs (Bauplan der Matrix). */
    function typeSrc(): string | null {
      switch (p.typ as TypeKey) {
        case 'rot':
          return `\\t{${T2('Drehung', 'rotation')}:} \\m{\\t{cos} φ}{−\\t{sin} φ}{\\t{sin} φ}{\\t{cos} φ},  φ = ${N(p.phi, 0)}°`;
        case 'refl':
          return `\\t{${T2('Spiegelung', 'reflection')}:} \\m{\\t{cos} 2α}{\\t{sin} 2α}{\\t{sin} 2α}{−\\t{cos} 2α},  α = ${N(p.al, 0)}°`;
        case 'scale':
          return `\\t{${T2('Streckung', 'scaling')}:} \\m{k_x}{0}{0}{k_y}`;
        case 'shear':
          return p.sd === 'x' ? `\\t{${T2('Scherung', 'shear')}:} \\m{1}{k}{0}{1},  k = ${N(p.k, 2)}` : `\\t{${T2('Scherung', 'shear')}:} \\m{1}{0}{k}{1},  k = ${N(p.k, 2)}`;
        case 'proj':
          return `\\t{${T2('Projektion', 'projection')}:} \\m{\\t{cos}²α}{\\t{sin}α \\t{cos}α}{\\t{sin}α \\t{cos}α}{\\t{sin}²α},  α = ${N(p.al, 0)}°`;
        case 'rs':
          return `r · \\m{\\t{cos} φ}{−\\t{sin} φ}{\\t{sin} φ}{\\t{cos} φ},  r = ${N(p.r, 2)}, φ = ${N(p.phi, 0)}°`;
        default:
          return null;
      }
    }

    function matrixCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = cntMat('cA', exactA());
        const rows: RowSpec[] = [{ src: `A = ${matSrc(A, 'r', 'b')}`, size: fs(15, 13.5), gap: 10 }];
        const ts = typeSrc();
        if (ts) rows.push({ src: ts, size: fs(12.5, 11.5), color: th().muted, gap: 10 });
        rows.push({ src: `\\c{r}{A·e_1 = ${vecSrc([A.a, A.c])}}    \\c{b}{A·e_2 = ${vecSrc([A.b, A.d])}}`, size: fs(13, 12) });
        rows.push({ src: `A·\\v{x}{y} = x·${vecSrc([A.a, A.c], 'r')} + y·${vecSrc([A.b, A.d], 'b')}`, size: fs(12.5, 11.5) });
        rows.push(note('Die Spalten sind die Bilder der Einheitsvektoren.', 'The columns are the images of the unit vectors.'));
        return formulaCard(R, measure, k, T2('Matrix A', 'Matrix A'), col.fig(), rows);
      };
    }

    function kindCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const D = describe(A, 1e-6);
        const kt = kindText(D, A);
        const d0 = det(A);
        const dC = cnt('cdet', d0);
        const e = eigen(A);
        const rows: RowSpec[] = [];
        rows.push({ src: show() ? kt.name : '?', text: true, size: fs(13.5, 12.5), weight: 750, color: th().text, hl: col.fig(), gap: 6 });
        if (show()) rows.push({ src: kt.detail, text: true, size: fs(12, 11), color: th().muted, gap: 8 });
        rows.push({ src: `\\t{det} A = ${S(N(dC, 2))}   \\t{${T2('Spur', 'trace')}} = ${S(N(cnt('ctr', A.a + A.d), 2))}`, size: fs(13, 12) });
        const eigSrc = !show() ? 'λ = ?' : isScalar(A, 1e-9) ? `λ = ${N(A.a, 2)} \\c{m}{(${T2('jede Richtung', 'every direction')})}` : e.length ? e.map((qv, i) => `λ_${e.length > 1 ? i + 1 : ''} = ${N(qv.value, 2)}`).join(',  ') : `\\c{m}{\\t{${T2('keine reellen Eigenwerte', 'no real eigenvalues')}}}`;
        rows.push({ src: `\\c{e}{${eigSrc}}`, size: fs(13, 12) });
        if (p.uc || p.fig === 'circle') {
          const [s1, s2] = singular(A);
          rows.push({ src: `\\c{e}{\\t{${T2('Kreis → Ellipse, Halbachsen', 'circle → ellipse, semi-axes')}} ${S(N(s1, 2))} \\t{${T2('und', 'and')}} ${S(N(s2, 2))}}`, size: fs(12.5, 11.5) });
        }
        rows.push({ src: `\\t{${Math.abs(d0) < 1e-9 ? T2('nicht umkehrbar', 'not invertible') : T2('umkehrbar', 'invertible')}}`, size: fs(12.5, 11.5), color: Math.abs(d0) < 1e-9 ? col.neg() : col.pos(), weight: 700 });
        return formulaCard(R, measure, k, T2('Art der Abbildung', 'Type of map'), col.e2(), rows);
      };
    }

    /** Linearität am Eckpunkt (1 | 1) des Einheitsquadrats. */
    function linCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = cntMat('cA', exactA());
        const rows: RowSpec[] = [
          { src: `A·\\v{1}{1} = \\c{r}{A·e_1} + \\c{b}{A·e_2} = ${vecSrc([A.a, A.c], 'r')} + ${vecSrc([A.b, A.d], 'b')} = \\c{s}{${S(vecSrc([A.a + A.b, A.c + A.d]))}}`, size: fs(13, 12) },
          note('Linear: A·(x + y) = A·x + A·y und A·(k·x) = k·A·x. Darum wird das Gitter zu einem Gitter aus Parallelogrammen.', 'Linear: A·(x + y) = A·x + A·y and A·(k·x) = k·A·x. That is why the grid becomes a grid of parallelograms.'),
        ];
        return formulaCard(R, measure, k, T2('Ecke (1 | 1) des Quadrats', 'Corner (1 | 1) of the square'), col.sq(), rows);
      };
    }

    function exCard(k: Intro): CardFn | null {
      const m = exMeta();
      if (!m) return null;
      return (R, measure) => formulaCard(R, measure, k, say(m.title), col.eig(), [{ src: m.result && show() ? `${say(m.note)} ${say(m.result)}` : say(m.note), text: true, size: fs(12, 11), color: th().text, weight: 500 }]);
    }

    function morphCard(k: Intro): CardFn {
      return (R, measure) => {
        const tt = T.v;
        const m = viewMatrix('map');
        const rs = asRotScaleLike();
        const rows: RowSpec[] = [
          rs
            ? { src: `M(t): \\t{${T2('Drehung um', 'rotation by')}} t·φ, \\t{${T2('Faktor', 'factor')}} r^t,  t = ${N(tt, 2)}`, size: fs(12.5, 11.5) }
            : { src: `M(t) = (1 − t)·E + t·A,  t = ${N(tt, 2)}`, size: fs(12.5, 11.5) },
          { src: `M = ${matSrc(m, 'r', 'b')}`, size: fs(13.5, 12.5) },
        ];
        if (rs) rows.push(note('Bei Drehungen wächst der Winkel gleichmäßig – so bleibt jeder Zwischenschritt eine Drehung.', 'For rotations the angle grows evenly – so every step in between is a rotation.'));
        return formulaCard(R, measure, k, T2('Zwischenstand', 'In between'), col.mid(), rows);
      };
    }
    const asRotScaleLike = () => {
      const A = exactA();
      return Math.abs(A.a - A.d) < 1e-9 && Math.abs(A.b + A.c) < 1e-9 && Math.hypot(A.a, A.c) > 1e-9;
    };

    /* Verkettung */
    function compCard(k: Intro): CardFn {
      return (R, measure) => {
        const ch = chain(cntMat('cA', exactA()), cntMat('cB', exactB()));
        const P = mul(ch.L, ch.R);
        const rows: RowSpec[] = [
          { src: `\\t{${T2('erst', 'first')}} \\c{t}{${ch.nR} = ${matSrc(ch.R)}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\t{${T2('dann', 'then')}} \\c{f}{${ch.nL} = ${matSrc(ch.L)}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: `\\b{${ch.nL}·${ch.nR} = ${show() ? matSrc(P, 'r', 'b') : '?'}}`, size: fs(14, 13), hl: col.fig() },
          note('Die zuerst angewendete Matrix steht rechts.', 'The matrix applied first stands on the right.'),
        ];
        return formulaCard(R, measure, k, T2('Verkettung', 'Composition'), col.mid(), rows);
      };
    }
    function entryCard(k: Intro): CardFn {
      return (R, measure) => {
        const ch = chain(exactA(), exactB());
        const Lm = ch.L;
        const Rm = ch.R;
        const P = mul(Lm, Rm);
        // während der zweiten Etappe läuft die Hervorhebung über die vier Einträge
        const active = CK.busy && CK.v > 1 ? Math.min(3, Math.floor((CK.v - 1) * 4)) : -1;
        const e = (i: number, j: number) => {
          const l1 = i === 0 ? Lm.a : Lm.c;
          const l2 = i === 0 ? Lm.b : Lm.d;
          const r1 = j === 0 ? Rm.a : Rm.b;
          const r2 = j === 0 ? Rm.c : Rm.d;
          const v = i === 0 ? (j === 0 ? P.a : P.b) : j === 0 ? P.c : P.d;
          return `p_{${i + 1}${j + 1}} = ${par(N(l1))}·${par(N(r1))} + ${par(N(l2))}·${par(N(r2))} = ${S(N(v))}`;
        };
        const rows: RowSpec[] = [
          { src: `\\t{${T2('Zeile', 'row')} i ${T2('von', 'of')}} \\c{f}{${ch.nL}} · \\t{${T2('Spalte', 'column')}} j ${T2('von', 'of')} \\c{t}{${ch.nR}}`, size: fs(12, 11), color: th().muted },
          ...[0, 1, 2, 3].map((idx) => ({ src: e(Math.floor(idx / 2), idx % 2), size: fs(12.5, 11.5), hl: idx === active ? col.fig() : undefined, gap: 7 })),
        ];
        return formulaCard(R, measure, k, T2('Rechenweg: Zeile mal Spalte', 'Working: row times column'), col.fig(), rows);
      };
    }
    function compareCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const B = exactB();
        const ch = chain(A, B);
        const P = mul(ch.L, ch.R);
        const Q = mul(ch.R, ch.L);
        const same = equal(P, Q, 1e-9);
        const rows: RowSpec[] = [
          { src: `\\c{n}{${ch.nR}·${ch.nL} = ${show() ? matSrc(Q) : '?'}}`, size: fs(13.5, 12.5), gap: 10 },
          { src: show() ? (same ? `${ch.nL}·${ch.nR} = ${ch.nR}·${ch.nL} \\c{m}{(${T2('hier vertauschbar', 'commute here')})}` : `${ch.nL}·${ch.nR} ≠ ${ch.nR}·${ch.nL}`) : '?', size: fs(13.5, 12.5), weight: 750, hl: same ? col.pos() : col.neg() },
          { src: `\\t{det}(A·B) = \\t{det} A · \\t{det} B = ${N(det(A), 2)} · ${N(det(B), 2)} = ${S(N(det(A) * det(B), 2))}`, size: fs(12.5, 11.5) },
        ];
        const D = describe(P, 1e-6);
        if (show() && (D.kind === 'rotation' || D.kind === 'reflection')) rows.push({ src: `${ch.nL}·${ch.nR}: ${kindText(D, P).name}`, text: true, size: fs(12, 11), color: th().muted });
        return formulaCard(R, measure, k, T2('Reihenfolge vertauscht', 'Order swapped'), col.neg(), rows);
      };
    }

    /* Determinante */
    function detCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = cntMat('cA', exactA());
        const D0 = det(exactA());
        const dC = cnt('cdet', D0);
        const sgn = D0 > 1e-9 ? 1 : D0 < -1e-9 ? -1 : 0;
        const rows: RowSpec[] = [
          { src: `\\t{det} A = \\c{r}{a}·\\c{b}{d} − \\c{b}{b}·\\c{r}{c}`, size: fs(13, 12) },
          { src: `= ${par(N(A.a))}·${par(N(A.d))} − ${par(N(A.b))}·${par(N(A.c))} = \\b{${S(N(dC, 2))}}`, size: fs(14, 13), hl: sgn > 0 ? col.pos() : sgn < 0 ? col.neg() : th().muted },
        ];
        if (show()) {
          if (sgn === 0) rows.push(note('det A = 0: Das Einheitsquadrat wird zu einer Strecke (oder einem Punkt). Flächeninhalt 0, A ist nicht umkehrbar.', 'det A = 0: the unit square becomes a segment (or a point). Area 0, A is not invertible.'));
          else {
            rows.push({ src: `\\t{${T2('Flächenfaktor', 'area factor')}} |\\t{det} A| = ${N(Math.abs(dC), 2)}`, size: fs(13, 12) });
            rows.push(sgn > 0 ? note('det A > 0: Der Umlaufsinn bleibt (e₁ → e₂ gegen den Uhrzeigersinn).', 'det A > 0: the orientation is kept (e₁ → e₂ anticlockwise).') : note('det A < 0: Der Umlaufsinn kehrt sich um – die Figur ist gespiegelt.', 'det A < 0: the orientation is reversed – the figure is mirrored.'));
          }
        }
        return formulaCard(R, measure, k, T2('Determinante', 'Determinant'), sgn > 0 ? col.pos() : sgn < 0 ? col.neg() : th().muted, rows);
      };
    }
    function areaCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const m = viewMatrix('det');
        const f = fig;
        const area0 = f.fills.length ? Math.abs(signedArea(f.fills[0]!)) - f.fills.slice(1).reduce((s, poly) => s + (p.fig === 'smile' ? Math.abs(signedArea(poly)) : 0), 0) : 0;
        const hasArea = f.fills.length > 0 && p.fig !== 'cloud';
        const dNow = det(m);
        const rows: RowSpec[] = [
          { src: `\\c{s}{\\t{${T2('Einheitsquadrat', 'unit square')}}: 1 → ${S(N(cnt('ca1', Math.abs(dNow)), 2))}}`, size: fs(13, 12) },
        ];
        if (hasArea) {
          const fA = p.fig === 'rocket' ? f.fills.reduce((s, poly) => s + Math.abs(signedArea(poly)), 0) : area0;
          rows.push({ src: `\\c{f}{\\t{${T2('Figur', 'figure')}}: ${N(fA, 2)} → ${S(N(cnt('ca2', fA * Math.abs(dNow)), 2))}}`, size: fs(13, 12) });
        }
        if (kHgt.v > 0.5) {
          const lu = Math.hypot(A.a, A.c);
          if (lu > 1e-6 && Math.abs(det(A)) > 1e-9) rows.push({ src: `g · h = ${N(lu, 2)} · ${N(Math.abs(det(A)) / lu, 2)} ${eqs(Math.abs(det(A)), 2)} ${S(N(Math.abs(det(A)), 2))}`, size: fs(13, 12), color: col.eig() });
        }
        rows.push(note('Jeder Flächeninhalt wird mit |det A| multipliziert.', 'Every area is multiplied by |det A|.'));
        return formulaCard(R, measure, k, T2('Flächeninhalte', 'Areas'), col.sq(), rows);
      };
    }
    function kernelCard(k: Intro): CardFn | null {
      const A = exactA();
      if (Math.abs(det(A)) > 1e-9) return null;
      const kv = kernel(A);
      if (!kv) return null;
      return (R, measure) => {
        const rows: RowSpec[] = [
          { src: `\\c{n}{\\t{${T2('Kern', 'kernel')}}: x = s·${vecSrc([kv[0], kv[1]])}}`, size: fs(13, 12) },
          note('Alle Punkte dieser Geraden landen im Ursprung. Punkte, die sich nur um ein Vielfaches davon unterscheiden, haben dasselbe Bild.', 'All points of this line land in the origin. Points that differ only by a multiple of it have the same image.'),
        ];
        return formulaCard(R, measure, k, T2('Was geht verloren?', 'What is lost?'), col.neg(), rows);
      };
    }

    /* Eigenvektoren */
    function testCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const w = W.v * DEG;
        const v: Vec = [Math.cos(w), Math.sin(w)];
        const Av = apply(A, v);
        const sa = sinAngle(A, v);
        const lenAv = Math.hypot(Av[0], Av[1]);
        const parallel = Math.abs(sa) < PAR && lenAv > 1e-6;
        const lam = Av[0] * v[0] + Av[1] * v[1];
        let ang = (Math.acos(clamp((v[0] * Av[0] + v[1] * Av[1]) / (lenAv || 1), -1, 1)) / DEG) | 0;
        if (lenAv < 1e-6) ang = 0;
        const rows: RowSpec[] = [
          { src: `\\c{v}{v = ${vecSrc(v)}}   \\c{f}{A·v = ${vecSrc([cnt('cav1', Av[0]), cnt('cav2', Av[1])])}}`, size: fs(13, 12) },
          { src: `\\t{${T2('Winkel zwischen v und A·v', 'angle between v and A·v')}}: ${N(cnt('cang', ang), 0)}°`, size: fs(12.5, 11.5) },
          parallel
            ? { src: `\\b{\\c{e}{A·v = ${S(N(lam, 2))} · v}}  \\t{– ${T2('Eigenvektor!', 'eigenvector!')}}`, size: fs(13.5, 12.5), hl: col.eig() }
            : { src: `\\t{${T2('nicht parallel – kein Eigenvektor', 'not parallel – no eigenvector')}}`, size: fs(12.5, 11.5), color: th().muted },
        ];
        return formulaCard(R, measure, k, T2('Testvektor v', 'Test vector v'), col.v(), rows);
      };
    }
    function polyCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const cp = charPoly(A);
        const tr = cp.tr;
        const D = cp.det;
        const rows: RowSpec[] = [
          { src: `\\t{det}(A − λE) = (${N(A.a)} − λ)(${N(A.d)} − λ) − ${par(N(A.b))}·${par(N(A.c))}`, size: fs(12.5, 11.5) },
          { src: `= λ² ${tr >= 0 ? '−' : '+'} ${N(Math.abs(tr))}λ ${D >= 0 ? '+' : '−'} ${N(Math.abs(D))} = 0`, size: fs(13.5, 12.5), gap: 10 },
          { src: `λ_{1,2} = \\f{${N(tr)}}{2} ± \\r{\\f{${N(tr * tr)}}{4} − ${par(N(D))}}`, size: fs(13, 12), gap: 10 },
        ];
        if (!show()) rows.push({ src: 'λ = ?', size: fs(13.5, 12.5) });
        else if (cp.real.length === 0) {
          rows.push({ src: `\\c{n}{λ = ${N(cp.re)} ± ${N(cp.im)}·i}`, size: fs(14, 13), hl: col.neg(), weight: 750 });
          rows.push(note('Diskriminante < 0: komplexe Eigenwerte – keine Richtung bleibt erhalten (Drehanteil).', 'Discriminant < 0: complex eigenvalues – no direction is preserved (rotation part).'));
        } else if (cp.real.length === 1) {
          rows.push({ src: `\\c{e}{λ = ${N(cp.real[0]!)} \\t{(${T2('doppelt', 'double')})}}`, size: fs(14, 13), hl: col.eig(), weight: 750 });
          const e = eigen(A);
          if (isScalar(A, 1e-9)) rows.push(note('A = λ·E: Jede Richtung ist Eigenrichtung.', 'A = λ·E: every direction is an eigendirection.'));
          else if (e[0]) rows.push({ src: `\\c{e}{v = ${vecSrc(nice(e[0].vector))}}  \\c{m}{\\t{(${T2('nur eine Eigenrichtung', 'only one eigendirection')})}}`, size: fs(12.5, 11.5) });
        } else {
          const e = eigen(A);
          rows.push({ src: `\\c{e}{λ_1 = ${N(cp.real[0]!)},  λ_2 = ${N(cp.real[1]!)}}`, size: fs(14, 13), hl: col.eig(), weight: 750 });
          rows.push({ src: `\\c{e}{v_1 = ${vecSrc(nice(e[0]!.vector))},   v_2 = ${vecSrc(nice(e[1]!.vector))}}`, size: fs(12.5, 11.5), gap: 6 });
        }
        return formulaCard(R, measure, k, T2('Charakteristisches Polynom', 'Characteristic polynomial'), col.eig(), rows);
      };
    }
    /** Diagramm sin∠(v, A·v) über der Richtung von v: Nullstellen = Eigenrichtungen. */
    function angleChartCard(k: Intro): CardFn {
      return (R, measure) => {
        const pad = fs(14, 12);
        const ch = fs(78, 74);
        const h = 34 + ch + 26;
        if (measure) return h;
        const g = surface.g;
        const theme = th();
        card({ ...R, h }, col.v());
        cardTitle(R, T2('sin ∠(v, A·v) über der Richtung', 'sin ∠(v, A·v) over the direction'), col.v());
        const cx0 = R.x + pad + 22;
        const cx1 = R.x + R.w - pad;
        const cy0 = R.y + 34;
        const cy1 = cy0 + ch;
        const X = (deg: number) => cx0 + ((cx1 - cx0) * deg) / 180;
        const Y = (v: number) => (cy0 + cy1) / 2 - (v * (cy1 - cy0)) / 2.3;
        const A = Ashown();
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3));
        // Achsen
        g.strokeStyle = theme.dark ? '#2a3546' : '#e3e8ef';
        g.lineWidth = 1;
        for (const v of [-1, 1]) {
          g.beginPath();
          g.moveTo(cx0, Y(v));
          g.lineTo(cx1, Y(v));
          g.stroke();
        }
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(cx0, Y(0));
        g.lineTo(cx1, Y(0));
        g.moveTo(cx0, cy0);
        g.lineTo(cx0, cy1);
        g.stroke();
        g.font = `600 ${fs(11, 10.5)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText('1', cx0 - 5, Y(1));
        g.fillText('0', cx0 - 5, Y(0));
        g.fillText(fmt.num(-1, 0), cx0 - 5, Y(-1));
        g.textAlign = 'center';
        g.textBaseline = 'top';
        for (const d of [0, 45, 90, 135, 180]) g.fillText(`${d}°`, X(d), cy1 + 5);
        // Kurve
        g.strokeStyle = col.v();
        g.lineWidth = 2.4;
        g.lineJoin = 'round';
        g.beginPath();
        for (let i = 0; i <= 180; i++) {
          const v = sinAngle(A, [Math.cos(i * DEG), Math.sin(i * DEG)]);
          if (i === 0) g.moveTo(X(i), Y(v));
          else g.lineTo(X(i), Y(v));
        }
        g.stroke();
        // Eigenrichtungen
        if (show()) {
          for (const e of eigen(A)) {
            let a = Math.atan2(e.vector[1], e.vector[0]) / DEG;
            a = ((a % 180) + 180) % 180;
            dot(X(a), Y(0), col.eig(), 5);
          }
        }
        // aktuelle Richtung
        const wd = ((W.v % 180) + 180) % 180;
        const sv = sinAngle(A, [Math.cos(wd * DEG), Math.sin(wd * DEG)]);
        g.strokeStyle = withAlpha(col.v(), 0.5);
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(X(wd), cy0);
        g.lineTo(X(wd), cy1);
        g.stroke();
        g.setLineDash([]);
        g.restore();
        dot(X(wd), Y(sv), col.v(), 6);
        return h;
      };
    }

    /* Inverse */
    function invCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = cntMat('cA', exactA());
        const D = det(exactA());
        const Ai = inverse(exactA(), 1e-9);
        const rows: RowSpec[] = [{ src: `A^{−1} = \\f{1}{\\t{det} A} · \\m{\\c{b}{d}}{−\\c{b}{b}}{−\\c{r}{c}}{\\c{r}{a}}`, size: fs(13.5, 12.5), gap: 10 }];
        if (!Ai) {
          rows.push({ src: `\\t{det} A = ${N(A.a)}·${par(N(A.d))} − ${par(N(A.b))}·${par(N(A.c))} = ${S('0')}`, size: fs(13, 12) });
          rows.push({ src: show() ? T2('Keine Inverse: Man kann durch 0 nicht teilen.', 'No inverse: you cannot divide by 0.') : '?', text: true, size: fs(12.5, 11.5), weight: 700, color: col.neg(), hl: col.neg() });
        } else {
          rows.push({ src: `= \\f{1}{${N(D)}} · \\m{${N(A.d)}}{${N(-A.b)}}{${N(-A.c)}}{${N(A.a)}}`, size: fs(13.5, 12.5), gap: 10 });
          rows.push({ src: `\\b{\\c{t}{A^{−1} = ${show() ? matSrc(Ai) : '?'}}}`, size: fs(14.5, 13.5), hl: col.mid() });
        }
        return formulaCard(R, measure, k, T2('Inverse Matrix', 'Inverse matrix'), col.mid(), rows);
      };
    }
    function checkCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const Ai = inverse(A, 1e-9);
        const rows: RowSpec[] = [];
        if (Ai) {
          rows.push({ src: `A · A^{−1} = ${matSrc(A)} · ${matSrc(Ai)}`, size: fs(12.5, 11.5), gap: 10 });
          rows.push({ src: `= ${S(matSrc(mul(A, Ai)))} = E`, size: fs(13.5, 12.5), hl: col.pos() });
          rows.push(note('Erst A, dann A⁻¹: Jeder Punkt kommt wieder an seinen Platz.', 'First A, then A⁻¹: every point returns to its place.'));
        } else {
          rows.push(note('P und Q haben dasselbe Bild. Eine Rückabbildung müsste diesem einen Bildpunkt zwei Urbilder zuordnen – das geht nicht.', 'P and Q have the same image. A map back would have to send this one point to two points – impossible.'));
        }
        return formulaCard(R, measure, k, Ai ? T2('Probe', 'Check') : T2('Warum nicht umkehrbar?', 'Why not invertible?'), Ai ? col.pos() : col.neg(), rows);
      };
    }

    /* Iteration */
    function iterCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const m = exMeta();
        const n = Math.round(p.n);
        const orbit = iterate(A, [p.x0, p.y0], n);
        const vx = m?.vx ?? 'x';
        const vy = m?.vy ?? 'y';
        const rows: RowSpec[] = [{ src: `x_{n+1} = A · x_n,   x_n = \\v{${vx}_n}{${vy}_n}`, size: fs(13, 12), gap: 10 }];
        const shownN = Math.floor(NC.v + 1e-9);
        const first = Math.max(0, Math.min(shownN, n) - 3);
        for (let i = first; i <= Math.min(shownN, n); i++) {
          const v = orbit[i]!;
          const hide = !show() && i > 0;
          rows.push({ src: `x_{${i}} = \\v{${hide ? '?' : N(v[0], 3)}}{${hide ? '?' : N(v[1], 3)}}${i > 0 ? `  \\c{m}{= A·x_{${i - 1}}}` : ''}`, size: fs(12.5, 11.5), hl: i === shownN ? col.orb() : undefined, gap: 6 });
        }
        return formulaCard(R, measure, k, T2('Iteration', 'Iteration'), col.orb(), rows);
      };
    }
    /** Diagramm der beiden Koordinaten über n. */
    function seriesCard(k: Intro): CardFn {
      return (R, measure) => {
        const pad = fs(14, 12);
        const chH = fs(104, 92);
        const h = 36 + chH + 30;
        if (measure) return h;
        const g = surface.g;
        const theme = th();
        const A = Ashown();
        const m = exMeta();
        const n = Math.max(1, Math.round(p.n));
        const orbit = iterate(A, [X0.v, Y0.v], n);
        card({ ...R, h }, col.orb());
        cardTitle(R, T2(`${m?.vx ?? 'x'}_n und ${m?.vy ?? 'y'}_n über n`, `${m?.vx ?? 'x'}_n and ${m?.vy ?? 'y'}_n over n`), col.orb());
        let lo = 0;
        let hi = 0;
        for (const v of orbit) {
          lo = Math.min(lo, v[0], v[1]);
          hi = Math.max(hi, v[0], v[1]);
        }
        if (hi - lo < 1e-9) hi = lo + 1;
        const cx0 = R.x + pad + 26;
        const cx1 = R.x + R.w - pad - 4;
        const cy0 = R.y + 40;
        const cy1 = cy0 + chH;
        const X = (i: number) => cx0 + ((cx1 - cx0) * i) / n;
        const Y = (v: number) => cy1 - ((v - lo) / (hi - lo)) * (cy1 - cy0);
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3));
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(cx0, cy0);
        g.lineTo(cx0, cy1);
        g.moveTo(cx0, Y(0));
        g.lineTo(cx1, Y(0));
        g.stroke();
        g.font = `600 ${fs(11, 10.5)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(N(hi, hi >= 10 ? 0 : 2), cx0 - 5, cy0);
        if (lo < -1e-9) g.fillText(N(lo, Math.abs(lo) >= 10 ? 0 : 2), cx0 - 5, cy1);
        g.fillText('0', cx0 - 5, Y(0));
        g.textAlign = 'center';
        g.textBaseline = 'top';
        const stepT = n <= 10 ? 1 : n <= 20 ? 2 : 5;
        for (let i = 0; i <= n; i += stepT) g.fillText(String(i), X(i), cy1 + 5);
        const st = stationary(A);
        if (st && show()) {
          g.setLineDash([4, 4]);
          g.strokeStyle = withAlpha(col.eig(), 0.8);
          for (const v of st) {
            g.beginPath();
            g.moveTo(cx0, Y(v));
            g.lineTo(cx1, Y(v));
            g.stroke();
          }
          g.setLineDash([]);
        }
        const upto = Math.min(n, NC.v);
        for (const [j, color] of [
          [0, col.e1()],
          [1, col.e2()],
        ] as const) {
          g.strokeStyle = color;
          g.lineWidth = 2.2;
          g.lineJoin = 'round';
          g.beginPath();
          for (let i = 0; i <= Math.floor(upto); i++) {
            const v = orbit[i]![j];
            if (i === 0) g.moveTo(X(i), Y(v));
            else g.lineTo(X(i), Y(v));
          }
          const fl = Math.floor(upto);
          if (upto - fl > 0.01 && fl + 1 <= n) {
            const a = orbit[fl]![j];
            const b = orbit[fl + 1]![j];
            const e = upto - fl;
            g.lineTo(lerp(X(fl), X(fl + 1), e), Y(lerp(a, b, e)));
          }
          g.stroke();
          for (let i = 0; i <= Math.floor(upto); i++) {
            g.fillStyle = color;
            g.beginPath();
            g.arc(X(i), Y(orbit[i]![j]), 2.6, 0, TAU);
            g.fill();
          }
        }
        // Legende
        g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillStyle = col.e2();
        g.fillText(m?.vy ?? 'y', cx1, cy0 + 2);
        g.fillStyle = col.e1();
        g.fillText(m?.vx ?? 'x', cx1 - 22, cy0 + 2);
        g.restore();
        return h;
      };
    }
    function longCard(k: Intro): CardFn {
      return (R, measure) => {
        const A = exactA();
        const st = stationary(A);
        const dom = dominant(A);
        const cp = charPoly(A);
        const rows: RowSpec[] = [];
        if (st) {
          rows.push({ src: `\\t{${T2('Übergangsmatrix', 'transition matrix')}: ${T2('Spaltensummen', 'column sums')}} 1`, size: fs(12.5, 11.5), color: th().muted });
          rows.push({ src: `A·s = s,  ${T2('Anteile', 'shares')} s_1 + s_2 = 1`, size: fs(13, 12) });
          rows.push({ src: `\\b{\\c{e}{s = ${show() ? `\\v{${q(st[0])}}{${q(st[1])}}` : '?'}}}  \\c{m}{${show() ? `≈ (${N(st[0] * 100, 1)} % | ${N(st[1] * 100, 1)} %)` : ''}}`, size: fs(14, 13), hl: col.eig() });
        } else if (cp.real.length === 0) {
          rows.push({ src: `\\c{n}{λ = ${N(cp.re)} ± ${N(cp.im)}·i}`, size: fs(13.5, 12.5) });
          rows.push(note('Komplexe Eigenwerte: Die Punkte laufen spiralförmig um den Ursprung.', 'Complex eigenvalues: the points spiral around the origin.'));
          rows.push({ src: `|λ| = \\r{\\t{det} A} = ${S(N(Math.sqrt(Math.max(0, cp.det)), 2))}`, size: fs(13, 12) });
        } else if (dom) {
          const l = dom.value;
          rows.push({ src: `\\c{e}{${T2('betragsgrößter Eigenwert', 'dominant eigenvalue')}  λ = ${S(N(l, 3))}}`, size: fs(13.5, 12.5), hl: col.eig() });
          rows.push({ src: `\\c{e}{v = ${vecSrc(dom.vector)}}`, size: fs(13, 12) });
          const txt =
            Math.abs(l - 1) < 1e-6
              ? T2('λ = 1: Der Eigenvektor ist ein Fixvektor (A·v = v) – der Zustand pendelt sich ein.', 'λ = 1: the eigenvector is a fixed vector (A·v = v) – the state settles down.')
              : Math.abs(l) > 1
                ? T2(`|λ| > 1: Auf lange Sicht wächst x_n pro Schritt etwa um den Faktor ${N(Math.abs(l), 2)}, und zwar in Richtung v.`, `|λ| > 1: in the long run x_n grows by about the factor ${N(Math.abs(l), 2)} per step, in the direction of v.`)
                : T2('|λ| < 1: Alles schrumpft auf den Ursprung zu.', '|λ| < 1: everything shrinks towards the origin.');
          rows.push({ src: show() ? txt : '?', text: true, size: fs(12, 11), color: th().muted });
        } else {
          rows.push(note('Kein eindeutiges Langzeitverhalten (gleich große Eigenwertbeträge).', 'No unique long-term behaviour (eigenvalues of equal size).'));
        }
        return formulaCard(R, measure, k, T2('Langfristig', 'In the long run'), col.eig(), rows);
      };
    }

    function cardsFor(m: Mode, k: Intro): CardFn[] {
      const ex = exCard(k);
      const list: (CardFn | null)[] = [];
      if (m === 'map') list.push(matrixCard(k), T.v < 0.999 ? morphCard(k) : null, kindCard(k), ex ?? linCard(k));
      else if (m === 'comp') list.push(compCard(k), entryCard(k), compareCard(k), ex);
      else if (m === 'det') list.push(detCard(k), areaCard(k), kernelCard(k), ex);
      else if (m === 'eig') list.push(testCard(k), polyCard(k), angleChartCard(k));
      else if (m === 'inv') list.push(invCard(k), checkCard(k), matrixCard(k));
      else list.push(ex, iterCard(k), seriesCard(k), longCard(k));
      return list.filter((c): c is CardFn => c !== null);
    }

    function drawColumn(C: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const list = cardsFor(mode(), k);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && C.w >= 460;
      const place = (fn: CardFn, R: Rect, i: number) => {
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        fn({ ...R, h: Math.min(hh, R.h) }, false);
        g.restore();
        return hh;
      };
      if (two) {
        const cw = (C.w - gap) / 2;
        let yL = C.y;
        let yR = C.y;
        list.forEach((fn, i) => {
          const leftCol = yL <= yR;
          const x = leftCol ? C.x : C.x + cw + gap;
          const y = leftCol ? yL : yR;
          const hh = place(fn, { x, y, w: cw, h: C.y + C.h - y }, i);
          if (hh < 0) return;
          if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        });
        return;
      }
      let y = C.y;
      list.forEach((fn, i) => {
        const hh = place(fn, { x: C.x, y, w: C.w, h: C.y + C.h - y }, i);
        if (hh >= 0) y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const A = exactA();
      const md = mode();
      ctx.readout('mat', `A = ${matHtml(A)}`);
      const D = describe(A, 1e-6);
      ctx.readout('kind', md === 'pow' ? null : kindText(D, A).name);
      const d0 = det(A);
      ctx.readout('det', { html: `det <var>A</var> = ${N(d0, 3)}${Math.abs(d0) > 1e-9 ? `; ${T2('Flächenfaktor', 'area factor')} ${N(Math.abs(d0), 3)}${d0 < 0 ? `, ${T2('Umlaufsinn umgekehrt', 'orientation reversed')}` : ''}` : `; ${T2('nicht umkehrbar', 'not invertible')}`}` });
      const cp = charPoly(A);
      const e = eigen(A);
      ctx.readout('eig', {
        html: isScalar(A, 1e-9)
          ? `λ = ${N(A.a, 3)} (${T2('jede Richtung', 'every direction')})`
          : cp.real.length === 0
            ? `λ = ${N(cp.re, 3)} ± ${N(cp.im, 3)}·<var>i</var> (${T2('keine reelle Eigenrichtung', 'no real eigendirection')})`
            : e.map((qv) => `λ = ${N(qv.value, 3)}: <var>v</var> = (${N(nice(qv.vector)[0], 3)} | ${N(nice(qv.vector)[1], 3)})`).join('; '),
      });
      if (md === 'comp') {
        const ch = chain(A, exactB());
        const P = mul(ch.L, ch.R);
        const Q = mul(ch.R, ch.L);
        ctx.readout('prod', { html: `${ch.nL}·${ch.nR} = ${matHtml(P)}; ${ch.nR}·${ch.nL} = ${matHtml(Q)}${equal(P, Q) ? '' : `; ${T2('also', 'so')} ${ch.nL}·${ch.nR} ≠ ${ch.nR}·${ch.nL}`}` });
      } else ctx.readout('prod', null);
      if (md === 'inv') {
        const Ai = inverse(A, 1e-9);
        ctx.readout('inv', { html: Ai ? `<var>A</var><sup>−1</sup> = ${matHtml(Ai, 3)}` : T2('keine Inverse (det A = 0)', 'no inverse (det A = 0)') });
      } else ctx.readout('inv', null);
      if (md === 'pow') {
        const st = stationary(A);
        const dom = dominant(A);
        const xn = iterate(A, [p.x0, p.y0], Math.round(p.n))[Math.round(p.n)]!;
        const base = `<var>x</var><sub>${Math.round(p.n)}</sub> = (${N(xn[0], 3)} | ${N(xn[1], 3)})`;
        ctx.readout('lim', {
          html: st
            ? `${base}; ${T2('stationäre Verteilung', 'stationary distribution')} (${N(st[0], 4)} | ${N(st[1], 4)})`
            : dom
              ? `${base}; λ = ${N(dom.value, 3)}, ${T2('Richtung', 'direction')} (${N(dom.vector[0], 3)} | ${N(dom.vector[1], 3)})`
              : base,
        });
      } else ctx.readout('lim', null);
    }

    /* ---------- Rendern ---------- */
    let plotFade: { t0: number; from: Mode } | null = null;
    function drawMode(m: Mode, alpha: number, k: Intro): void {
      if (alpha <= 0.01) return;
      if (m === 'map') drawMap(alpha, k);
      else if (m === 'comp') drawComp(alpha, k);
      else if (m === 'det') drawDet(alpha, k);
      else if (m === 'eig') drawEig(alpha, k);
      else if (m === 'inv') drawInv(alpha, k);
      else drawPow(alpha, k);
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      let anim = false;
      const chans: Chan[] = [...AC, ...BC, T, CK, TR, W, X0, Y0, NC, kGrid, kEig, kOrig, kUc, kCmp, kHgt, kShow, ...Object.values(box), ...Object.values(mw)];
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (sweep && now - sweep.t0 > sweep.dur) {
        sweep = null;
        W.jump(p.w);
      }
      if (stepRun && !NC.busy) stepRun = null;
      if (figFrom && now - figFrom.t0 > 600) figFrom = null;
      if (plotFade && now - plotFade.t0 > 560) plotFade = null;
      if (sweep || stepRun || figFrom || plotFade || intro !== null || dragging()) anim = true;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      // Bildausschnitt
      plot.setRange([box.x0.v, box.x1.v], [box.y0.v, box.y1.v]);
      plot.resize();
      const ex = exMeta();
      plot.setAxes({ x: { label: mode() === 'pow' && ex?.ax ? say(ex.ax) : 'x' }, y: { label: mode() === 'pow' && ex?.ay ? say(ex.ay) : 'y' } });
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      plot.begin();
      plot.grid();
      drawScenery(clamp01(k.grid * 1.5));
      plot.axes();
      const fIn = plotFade ? ease.outCubic(clamp01((now - plotFade.t0) / 560)) : 1;
      if (plotFade && fIn < 1) drawMode(plotFade.from, 1 - fIn, k);
      drawMode(mode(), fIn, k);
      plot.end();
      g.restore();
      drawColumn(R.col, k, now);
      if (cardFade !== null || numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retargetAll(now: number, instant: boolean, source: string, changed: ReadonlySet<string>): void {
      const A = exactA();
      const B = exactB();
      const quick = source === 'input' || source === 'sim';
      const typeSwitch = changed.has('typ') || changed.has('mode') || changed.has('ex') || changed.has('sd');
      [A.a, A.b, A.c, A.d].forEach((v, i) => {
        const c = AC[i]!;
        if (instant || reduced()) c.jump(v);
        else if (dragging()) c.follow(v, 0.04);
        else if (quick && !typeSwitch) c.follow(v, 0.16);
        else if (c.goal !== v) c.glide(v, 850, i * 50, now);
      });
      [B.a, B.b, B.c, B.d].forEach((v, i) => {
        const c = BC[i]!;
        if (instant || reduced()) c.jump(v);
        else if (quick) c.follow(v, 0.16);
        else if (c.goal !== v) c.glide(v, 850, i * 50, now);
      });
      const scal: [Chan, number][] = [
        [X0, p.x0],
        [Y0, p.y0],
      ];
      for (const [c, v] of scal) {
        if (instant || reduced()) c.jump(v);
        else if (dragging()) c.follow(v, 0.04);
        else c.follow(v, 0.18);
      }
      if (!sweep) {
        if (instant || reduced()) W.jump(p.w);
        else if (dragging()) W.follow(p.w, 0.04);
        else {
          // kürzester Weg auf dem Kreis
          let target = p.w;
          while (target - W.v > 180) target -= 360;
          while (W.v - target > 180) target += 360;
          W.glide(target, 600, 0, now, ease.outCubic);
        }
      }
      if (!stepRun) {
        if (instant || reduced()) NC.jump(p.n);
        else NC.glide(p.n, 500 + 60 * Math.abs(p.n - NC.v), 0, now, ease.outCubic);
      }
      if (!(changed.has('t') && source === 'sim')) {
        if (instant || reduced()) T.jump(p.t);
        else if (changed.has('t')) T.follow(p.t, 0.1);
      }
      for (const m of MODES) {
        const goal = m === mode() ? 1 : 0;
        if (instant || reduced()) mw[m].jump(goal);
        else if (mw[m].goal !== goal) mw[m].glide(goal, 560, goal ? 120 : 0, now);
      }
      const flags: [Chan, boolean][] = [
        [kGrid, p.grid],
        [kEig, p.eig],
        [kOrig, p.orig],
        [kUc, p.uc],
        [kCmp, p.cmp],
        [kHgt, p.hgt],
        [kShow, p.show],
      ];
      for (const [c, on] of flags) {
        if (instant || reduced()) c.jump(on ? 1 : 0);
        else c.follow(on ? 1 : 0, 0.18);
      }
    }

    function cancelStories(): void {
      if (sweep) {
        sweep = null;
        W.jump(p.w);
      }
      stepRun = null;
    }

    /** Morph E → A neu abspielen (auch beim Laden eines Beispiels). */
    function playMorph(now: number, delay = 0, dur = MORPH_MS): void {
      if (reduced()) {
        T.jump(p.t);
        return;
      }
      T.jump(0);
      T.glide(p.t, dur, delay, now);
    }
    function playComp(now: number, delay = 0): void {
      if (reduced()) {
        CK.jump(2);
        return;
      }
      // erste Etappe, kurze Pause, zweite Etappe
      const st = stages(0, 2, [
        [1500, 1],
        [380, 1],
        [1700, 2],
      ]);
      CK.jump(0);
      CK.glide(2, st.dur, delay, now, st.e);
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init';
        // Alltagsbeispiel gewählt: passende Einstellungen laden
        if (source === 'input' && changed.has('ex') && exKey() !== 'none') {
          const vals: Record<string, number | string | boolean> = { ...EX_VALUES[exKey() as Exclude<ExKey, 'none'>] };
          exLoad = true;
          setP({ t: 1, ...vals });
          return;
        }
        const loaded = exLoad;
        exLoad = false;
        if (source === 'input' && (changed.has('mode') || changed.has('typ')) && exKey() !== 'none') setP({ ex: 'none' });
        // Figur wechselt: alte ausblenden
        if (changed.has('fig')) {
          if (!instant && !reduced()) figFrom = { fig, t0: now };
          fig = figure(p.fig as FigKey);
        }
        const user = source === 'input' || source === 'replace';
        if (user && [...changed].some((key) => !['show', 'grid', 'eig', 'orig', 'uc', 'cmp', 'hgt'].includes(key))) cancelStories();
        retargetAll(now, instant, source, changed);
        const modeChanged = changed.has('mode') && mode() !== prevMode;
        if (!instant && !reduced() && modeChanged) {
          plotFade = { t0: now, from: prevMode };
          cardFade = now;
        }
        // Beispiel geladen oder Ansicht gewechselt: passende Animation
        if (!instant && !reduced() && (source === 'replace' || modeChanged || loaded)) {
          if (mode() === 'map' || mode() === 'det') playMorph(now, 250);
          else if (mode() === 'comp') playComp(now, 250);
          else if (mode() === 'pow') {
            NC.jump(0);
            NC.glide(p.n, 700 + 180 * p.n, 300, now, ease.inOutCubic);
            stepRun = { t0: now, per: 180, n: p.n };
          } else if (mode() === 'inv') {
            TR.jump(0);
            TR.glide(1, 1500, 250, now);
          }
        }
        retargetBox(now, instant);
        if (source === 'init' && !reduced()) {
          intro = now;
          if (mode() === 'map' || mode() === 'det') playMorph(now, 1000);
          else if (mode() === 'comp') playComp(now, 900);
          else if (mode() === 'inv') {
            TR.jump(0);
            TR.glide(1, 1500, 1000, now);
          } else if (mode() === 'eig') {
            W.jump(p.w - 120);
            W.glide(p.w, 2000, 900, now);
          } else {
            NC.jump(0);
            NC.glide(p.n, 700 + 180 * p.n, 900, now, ease.inOutCubic);
            stepRun = { t0: now, per: 180, n: p.n };
          }
        }
        prevMode = mode();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        cancelStories();
        if (id === 'morph') {
          if (p.t < 1) setP({ t: 1 });
          playMorph(now, 0, MORPH_MS + 300);
        } else if (id === 'comp') playComp(now);
        else if (id === 'swap') {
          setP({ ord: p.ord === 'ab' ? 'ba' : 'ab' });
          playComp(performance.now(), 100);
        } else if (id === 'sweep') {
          if (!reduced()) {
            sweep = { t0: now, dur: 8000, from: W.v };
            W.glide(W.v + 360, 8000, 0, now, ease.inOutCubic);
          }
        } else if (id === 'snap') {
          const A = exactA();
          const dirs: number[] = [];
          for (const e of eigen(A)) {
            const a = Math.atan2(e.vector[1], e.vector[0]) / DEG;
            for (const s of [0, 180]) dirs.push((((a + s) % 360) + 360) % 360);
          }
          if (dirs.length) {
            const cur = ((p.w % 360) + 360) % 360;
            const ahead = dirs.map((d) => ((d - cur - 0.5 + 360) % 360) + 0.5).sort((u, v) => u - v);
            const next = Math.round(cur + ahead[0]!) % 360;
            setP({ w: next });
          }
        } else if (id === 'trip') {
          if (!reduced()) {
            // hin (0 → 1), Pause, zurück (1 → 2), Pause, wieder zur Ruhestellung
            const st = stages(0, 1, [
              [1500, 1],
              [450, 1],
              [1500, 2],
              [800, 2],
              [1000, 1],
            ]);
            TR.jump(0);
            TR.glide(1, st.dur, 0, now, st.e);
          }
        } else if (id === 'steps') {
          if (!reduced()) {
            NC.jump(0);
            NC.glide(p.n, 600 + 420 * p.n, 0, now, ease.linear);
            stepRun = { t0: now, per: 420, n: p.n };
          }
        } else if (id === 'next') {
          if (p.n < 30) setP({ n: p.n + 1 });
        }
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
