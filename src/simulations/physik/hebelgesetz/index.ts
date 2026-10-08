import { defineSimulation, ease, FixedStepper, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  balance,
  balancingForce,
  effortForce,
  G,
  HOLE,
  HOLES,
  isBalanced,
  loadForce,
  loadTorque,
  MAX_TILT,
  meterArm,
  meterTorque,
  restAngle,
  stepMotion,
  type Lever,
  type Load,
  type Meter,
  type Motion,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const MAX_PIECES = 8;
/** Messbereich des Kraftmessers in N. */
const METER_MAX = 5;
type Mode = 'lab' | 'daily';
type Obj = 'barrow' | 'opener' | 'nut' | 'seesaw';
type Pt = [number, number];

const ARROWS = ['→', '↗', '↑', '↖', '←', '↙', '↓', '↘'];
const signed = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));

/** Radius der Nuss in cm. */
const NUT_R = 1.4;
/** Lastarm des Flaschenöffners in cm (Abstand Auflagepunkt – Zahn). */
const OPENER_LOAD_ARM = 2;
/** Höhe der Wippenachse und halbe Brettlänge in m. */
const SEESAW_H = 0.5;
const SEESAW_HALF = 2.3;
const SEESAW_MAX = Math.asin(SEESAW_H / SEESAW_HALF);
/** Drehwinkel beim „Anheben“ (Goldene Regel), je Gegenstand in rad. */
const LIFT: Record<Exclude<Obj, 'seesaw'>, number> = { barrow: 0.14, opener: 0.2, nut: 0.075 };

/** Geometrie der Laborszene (für Zeichnen und Zeiger). */
interface LabGeo {
  w: number;
  h: number;
  small: boolean;
  ax: number;
  ay: number;
  /** Pixel je Lochabstand. */
  sp: number;
  beamH: number;
  tableY: number;
  tray: Rect;
  pieceW: number;
  pieceH: number;
  hookH: number;
  meter: { hook: number; ext: number; housing: number; ring: number; width: number };
}

/**
 * Hebelgesetz: Ein Hebel mit Lochraster auf einer Drehachse. Massestücke
 * aufhängen, verschieben, mit dem Kraftmesser ziehen (auch schräg) – der
 * Hebel kippt gedämpft und kommt im Gleichgewicht waagerecht zur Ruhe.
 * Dazu Hebel im Alltag: Schubkarre, Flaschenöffner, Nussknacker und Wippe.
 */
export default defineSimulation({
  id: 'hebelgesetz',
  dragHint: true,
  layout: { aspect: 1.45, aspectNarrow: 0.8 },
  groups: [
    { id: 'w1', label: L('Massestücke (1)', 'Weights (1)') },
    { id: 'w2', label: L('Massestücke (2)', 'Weights (2)') },
    { id: 'meter', label: L('Kraftmesser', 'Spring balance') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Setup'),
      options: [
        { value: 'lab', label: L('Hebel mit Lochraster', 'Lever with holes') },
        { value: 'daily', label: L('Hebel im Alltag', 'Everyday levers') },
      ],
      default: 'lab',
    },
    {
      key: 'obj',
      type: 'choice',
      label: L('Gegenstand', 'Object'),
      options: [
        { value: 'barrow', label: L('Schubkarre', 'Wheelbarrow') },
        { value: 'opener', label: L('Flaschenöffner', 'Bottle opener') },
        { value: 'nut', label: L('Nussknacker', 'Nutcracker') },
        { value: 'seesaw', label: L('Wippe', 'Seesaw') },
      ],
      default: 'barrow',
      visibleIf: (v) => v.mode === 'daily',
    },
    // Labor: zwei Stapel Massestücke und ein Kraftmesser
    {
      key: 'n1',
      type: 'number',
      group: 'w1',
      label: L('Anzahl (je 50 g)', 'Number (50 g each)'),
      help: L('Oder: Massestücke aus dem Kasten auf ein Loch ziehen, Stapel verschieben, antippen zum Abnehmen.', 'Or drag weights from the box onto a hole, move a stack, tap it to remove a weight.'),
      min: 0,
      max: MAX_PIECES,
      step: 1,
      default: 2,
      visibleIf: (v) => v.mode === 'lab',
    },
    {
      key: 'x1',
      type: 'number',
      group: 'w1',
      label: L('Stelle', 'Position'),
      min: -HOLES,
      max: HOLES,
      step: 1,
      default: -6,
      display: (v, lang) => (v === 0 ? (lang === 'de' ? 'Achse' : 'axis') : `${v < 0 ? (lang === 'de' ? 'links' : 'left') : lang === 'de' ? 'rechts' : 'right'} ${Math.abs(v)}`),
      visibleIf: (v) => v.mode === 'lab',
    },
    { key: 'n2', type: 'number', group: 'w2', label: L('Anzahl (je 50 g)', 'Number (50 g each)'), min: 0, max: MAX_PIECES, step: 1, default: 3, visibleIf: (v) => v.mode === 'lab' },
    {
      key: 'x2',
      type: 'number',
      group: 'w2',
      label: L('Stelle', 'Position'),
      min: -HOLES,
      max: HOLES,
      step: 1,
      default: 2,
      display: (v, lang) => (v === 0 ? (lang === 'de' ? 'Achse' : 'axis') : `${v < 0 ? (lang === 'de' ? 'links' : 'left') : lang === 'de' ? 'rechts' : 'right'} ${Math.abs(v)}`),
      visibleIf: (v) => v.mode === 'lab',
    },
    { key: 'km', type: 'boolean', group: 'meter', label: L('Kraftmesser einhängen', 'Attach a spring balance'), default: false, visibleIf: (v) => v.mode === 'lab' },
    {
      key: 'kx',
      type: 'number',
      group: 'meter',
      label: L('Stelle', 'Position'),
      min: -HOLES,
      max: HOLES,
      step: 1,
      default: 6,
      display: (v, lang) => (v === 0 ? (lang === 'de' ? 'Achse' : 'axis') : `${v < 0 ? (lang === 'de' ? 'links' : 'left') : lang === 'de' ? 'rechts' : 'right'} ${Math.abs(v)}`),
      visibleIf: (v) => v.mode === 'lab' && v.km === true,
    },
    {
      key: 'kw',
      type: 'number',
      group: 'meter',
      label: L('Zugrichtung (Winkel zur Waagerechten)', 'Direction of pull (angle to the horizontal)'),
      min: -180,
      max: 180,
      step: 1,
      default: 90,
      display: (v) => `${ARROWS[(((Math.round(v / 45) % 8) + 8) % 8)]} ${signed(v)}°`,
      visibleIf: (v) => v.mode === 'lab' && v.km === true,
    },
    {
      key: 'kf',
      type: 'number',
      group: 'meter',
      label: L('Zugkraft des Kraftmessers', 'Force of the spring balance'),
      help: L('Am Ring des Kraftmessers ziehen: Länge = Kraft, Richtung = Zugrichtung.', 'Pull the ring of the spring balance: length = force, direction = direction of pull.'),
      min: 0,
      max: METER_MAX,
      step: 0.01,
      default: 1,
      unit: 'N',
      visibleIf: (v) => v.mode === 'lab' && v.km === true,
    },
    { key: 'arms', type: 'boolean', group: 'view', label: L('Kraftarme bemaßen', 'Show lever arms'), default: true, visibleIf: (v) => v.mode === 'lab' },
    { key: 'mom', type: 'boolean', group: 'view', label: L('Drehmomente anzeigen', 'Show torques'), default: true, visibleIf: (v) => v.mode === 'lab' },
    { key: 'forces', type: 'boolean', group: 'view', label: L('Kraftpfeile', 'Force arrows'), default: false, visibleIf: (v) => v.mode === 'lab' },
    // Alltag
    { key: 'bm', type: 'number', label: L('Ladung m', 'Load m'), min: 10, max: 150, step: 5, default: 60, unit: 'kg', visibleIf: (v) => v.mode === 'daily' && v.obj === 'barrow' },
    { key: 'bl', type: 'number', label: L('Lastarm', 'Load arm'), min: 20, max: 75, step: 1, default: 40, unit: 'cm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'barrow' },
    { key: 'bk', type: 'number', label: L('Kraftarm', 'Effort arm'), min: 95, max: 150, step: 1, default: 140, unit: 'cm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'barrow' },
    { key: 'of', type: 'number', label: L('Haltekraft des Kronkorkens (Last)', 'Force holding the cap (load)'), min: 10, max: 100, step: 1, default: 40, unit: 'N', visibleIf: (v) => v.mode === 'daily' && v.obj === 'opener' },
    { key: 'ok', type: 'number', label: L('Kraftarm', 'Effort arm'), min: 4, max: 14, step: 0.5, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'opener' },
    { key: 'nf', type: 'number', label: L('Kraft zum Knacken der Nuss (Last)', 'Force needed to crack the nut (load)'), min: 50, max: 800, step: 10, default: 300, unit: 'N', visibleIf: (v) => v.mode === 'daily' && v.obj === 'nut' },
    { key: 'nl', type: 'number', label: L('Lastarm', 'Load arm'), min: 3, max: 10, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'nut' },
    { key: 'nk', type: 'number', label: L('Kraftarm', 'Effort arm'), min: 11, max: 20, step: 0.5, default: 17, unit: 'cm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'nut' },
    { key: 'sm', type: 'number', label: L('Masse links m₁', 'Mass on the left m₁'), min: 15, max: 80, step: 1, default: 40, unit: 'kg', visibleIf: (v) => v.mode === 'daily' && v.obj === 'seesaw' },
    { key: 'sl', type: 'number', label: L('Abstand links a₁', 'Distance on the left a₁'), min: 0.5, max: 2, step: 0.05, default: 1.5, unit: 'm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'seesaw' },
    { key: 'sn', type: 'number', label: L('Masse rechts m₂', 'Mass on the right m₂'), min: 15, max: 80, step: 1, default: 30, unit: 'kg', visibleIf: (v) => v.mode === 'daily' && v.obj === 'seesaw' },
    { key: 'sk', type: 'number', label: L('Abstand rechts a₂', 'Distance on the right a₂'), min: 0.5, max: 2, step: 0.05, default: 1.5, unit: 'm', visibleIf: (v) => v.mode === 'daily' && v.obj === 'seesaw' },
  ],
  actions: [
    { id: 'clear', label: L('Alles abnehmen', 'Remove everything'), visibleIf: (v) => v.mode === 'lab' },
    { id: 'lift', label: L('Anheben', 'Lift'), primary: true, visibleIf: (v) => v.mode === 'daily' && v.obj !== 'seesaw' },
  ],
  readouts: [
    { key: 'law', label: L('Hebelgesetz', 'Law of the lever') },
    { key: 'ccw', label: L('Linksdrehende Drehmomente', 'Anticlockwise torques') },
    { key: 'cw', label: L('Rechtsdrehende Drehmomente', 'Clockwise torques') },
    { key: 'state', label: L('Ergebnis', 'Result') },
    { key: 'need', label: L('Kraft für Gleichgewicht', 'Force for equilibrium'), spoiler: true },
    { key: 'arms', label: L('Kraftarme', 'Lever arms') },
    { key: 'effort', label: L('Nötige Kraft', 'Force needed'), spoiler: true },
    { key: 'golden', label: L('Goldene Regel der Mechanik', 'Golden rule of mechanics') },
    { key: 'where', label: L('Gleichgewicht', 'Balance'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Gleichgewicht finden', 'Find the balance'), values: {} },
    { id: 'balance', label: L('3 · 4 = 2 · 6', '3 · 4 = 2 · 6'), values: { n1: 3, x1: -4, n2: 2, x2: 6 } },
    { id: 'one', label: L('Einseitiger Hebel mit Kraftmesser', 'One-sided lever with spring balance'), values: { n1: 0, n2: 4, x2: 5, km: true, kx: 9, kw: 90, kf: 0.6 } },
    { id: 'oblique', label: L('Schräg ziehen', 'Pulling at an angle'), values: { n1: 3, x1: -4, n2: 0, km: true, kx: 6, kw: -60, kf: 0.98 } },
    { id: 'barrow', label: L('Schubkarre', 'Wheelbarrow'), values: { mode: 'daily', obj: 'barrow' } },
    { id: 'nut', label: L('Nussknacker', 'Nutcracker'), values: { mode: 'daily', obj: 'nut' } },
  ],
  strings: {
    de: {
      canvas: 'Hebel mit Lochraster auf einer Drehachse mit Massestücken und Kraftmesser bzw. Hebel im Alltag mit Drehachse, Last- und Kraftarm',
      ccw: 'linksdrehend',
      cw: 'rechtsdrehend',
      equal: 'Gleichgewicht',
      tipLeft: 'kippt nach links',
      tipRight: 'kippt nach rechts',
      tray: 'Massestücke',
      each: 'je 50 g',
      drag: 'ziehen',
      twoHooks: 'Nur zwei Stapel: hänge an einen vorhandenen Stapel oder nimm einen ab.',
      full: 'Höchstens 8 Massestücke an einem Haken.',
      dropHere: 'Auf ein Loch ziehen',
      range: 'Messbereich überschritten',
      axis: 'Drehachse',
      load: 'Last',
      effort: 'Kraft',
      one: 'einseitiger Hebel',
      two: 'zweiseitiger Hebel',
      barrow: 'Schubkarre',
      opener: 'Flaschenöffner',
      nut: 'Nussknacker',
      seesaw: 'Wippe',
      law: '<var>F</var>₁ · <var>a</var>₁ = <var>F</var>₂ · <var>a</var>₂, also <var>M</var><sub>links</sub> = <var>M</var><sub>rechts</sub> mit dem Drehmoment <var>M</var> = <var>F</var> · <var>a</var>. Ein Massestück: <var>F</var> = 0,05 kg · 9,81 N/kg ≈ 0,49 N.',
      none: 'keine',
      sum: 'Summe',
      stateEq: 'Gleichgewicht: Die Drehmomente sind gleich groß, der Hebel bleibt waagerecht.',
      stateL: 'Der Hebel kippt nach links: Das linksdrehende Drehmoment ist um {d} N·m größer.',
      stateR: 'Der Hebel kippt nach rechts: Das rechtsdrehende Drehmoment ist um {d} N·m größer.',
      needF: 'Gleichgewicht bei F_K = {F} N (wirksamer Kraftarm a_K = {a} cm)',
      needOver: 'Nötig wären {F} N – mehr als der Messbereich von 5 N. Häng den Kraftmesser weiter außen ein.',
      needNone: 'In dieser Zugrichtung lässt sich der Hebel nicht ins Gleichgewicht bringen.',
      needZero: 'Der Hebel ist schon ohne Kraftmesser im Gleichgewicht (F_K = 0 N).',
      armsText: 'Lastarm a_L = {aL} · Kraftarm a_K = {aK}',
      effortText: 'F_K = F_L · a_L / a_K = {FL} N · {aL} / {aK} ≈ {FK} N',
      goldenText: 'Bewegt sich die Hand um {sK} cm, bewegt sich die Last nur um {sL} cm. F_K · s_K = F_L · s_L ≈ {W} J – was man an Kraft spart, muss man an Weg zusetzen.',
      goldenHint: 'Drücke „Anheben“: Die Hand legt einen viel längeren Weg zurück als die Last.',
      seesawNeed: 'Gleichgewicht, wenn das rechte Kind bei a₂ = {a} m sitzt.',
      seesawNone: 'Rechts ist kein Platz für das Gleichgewicht (a₂ wäre {a} m).',
      lift: 'Anheben',
      lower: 'Absenken',
      press: 'Zudrücken',
      release: 'Loslassen',
      sK: 's_K = {s} cm',
      sL: 's_L = {s} cm',
    },
    en: {
      canvas: 'Lever with holes on a pivot with weights and a spring balance, or everyday levers with pivot, load arm and effort arm',
      ccw: 'anticlockwise',
      cw: 'clockwise',
      equal: 'Balanced',
      tipLeft: 'tips to the left',
      tipRight: 'tips to the right',
      tray: 'Weights',
      each: '50 g each',
      drag: 'drag',
      twoHooks: 'Only two stacks: add to an existing stack or remove one.',
      full: 'At most 8 weights on one hook.',
      dropHere: 'Drag onto a hole',
      range: 'Out of range',
      axis: 'pivot',
      load: 'load',
      effort: 'effort',
      one: 'one-sided lever',
      two: 'two-sided lever',
      barrow: 'Wheelbarrow',
      opener: 'Bottle opener',
      nut: 'Nutcracker',
      seesaw: 'Seesaw',
      law: '<var>F</var>₁ · <var>a</var>₁ = <var>F</var>₂ · <var>a</var>₂, i.e. anticlockwise torque = clockwise torque with the torque <var>M</var> = <var>F</var> · <var>a</var>. One weight: <var>F</var> = 0.05 kg · 9.81 N/kg ≈ 0.49 N.',
      none: 'none',
      sum: 'Total',
      stateEq: 'Balanced: the torques are equal, the lever stays horizontal.',
      stateL: 'The lever tips to the left: the anticlockwise torque is larger by {d} N·m.',
      stateR: 'The lever tips to the right: the clockwise torque is larger by {d} N·m.',
      needF: 'Balanced with F_K = {F} N (effective lever arm a_K = {a} cm)',
      needOver: '{F} N would be needed – more than the 5 N range. Attach the spring balance further out.',
      needNone: 'Pulling in this direction cannot balance the lever.',
      needZero: 'The lever is already balanced without the spring balance (F_K = 0 N).',
      armsText: 'Load arm a_L = {aL} · effort arm a_K = {aK}',
      effortText: 'F_K = F_L · a_L / a_K = {FL} N · {aL} / {aK} ≈ {FK} N',
      goldenText: 'When the hand moves {sK} cm, the load moves only {sL} cm. F_K · s_K = F_L · s_L ≈ {W} J – what you save in force you pay for in distance.',
      goldenHint: 'Press “Lift”: the hand travels much further than the load.',
      seesawNeed: 'Balanced when the child on the right sits at a₂ = {a} m.',
      seesawNone: 'There is no balancing position on the right (a₂ would be {a} m).',
      lift: 'Lift',
      lower: 'Lower',
      press: 'Squeeze',
      release: 'Release',
      sK: 's_K = {s} cm',
      sL: 's_L = {s} cm',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const mode = () => p.mode as Mode;
    const obj = () => p.obj as Obj;
    const narrow = () => surface.width < 640;
    const reduced = prefersReducedMotion();

    /* ---------- Zustand Labor ---------- */
    const stacks = (): Load[] => [
      { n: p.n1, x: p.x1 },
      { n: p.n2, x: p.x2 },
    ];
    const meter = (): Meter | null => (p.km ? { x: p.kx, dir: p.kw, F: p.kf } : null);
    const lever = (): Lever => ({ loads: stacks().filter((s) => s.n > 0), meter: meter() });
    let motion: Motion = { phi: 0, omega: 0 };
    let target = 0;
    const stepper = new FixedStepper(0.002);
    let lastFrame = performance.now();
    let geo: LabGeo | null = null;

    type Drag =
      | { kind: 'stack'; which: 1 | 2; x0: number; y0: number; moved: boolean; overTray: boolean }
      | { kind: 'new'; px: number; py: number; hole: number | null }
      | { kind: 'ring'; dx: number; dy: number }
      | { kind: 'meter' };
    let drag: Drag | null = null;
    let hover: string | null = null;
    let hint = '';
    let hintUntil = 0;

    /* ---------- Zustand Alltag ---------- */
    let seesaw: Motion = { phi: 0, omega: 0 };
    let lifted = false;
    const liftTween = new Tween(1100, ease.inOutCubic);
    const liftValue = () => (lifted ? liftTween.value : 1 - liftTween.value);

    const dplot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'daily' ? dailyRegion(w, h) : { x: 0, y: 0, w: 0, h: 0 }),
    });

    function dailyRegion(w: number, h: number): Rect {
      const top = w < 640 ? 44 : 50;
      return { x: 0, y: top, w, h: h - top };
    }

    function showHint(key: string): void {
      hint = ctx.t(key);
      hintUntil = performance.now() + 2800;
      ctx.requestRender();
    }

    /* ---------- Ergebnisse ---------- */
    /** F_K, a_L … in Ergebnissen als Formelzeichen mit Index setzen (nur für eigene, vertrauenswürdige Texte). */
    const subs = (t: string) => ({ html: t.replace(/([FaMs])_([A-Za-z]+)/g, '<var>$1</var><sub>$2</sub>') });
    const cmOf = (holes: number) => fmt.num(Math.abs(holes) * HOLE * 100, 0);
    const Nm = (m: number) => fmt.fixed(m, 3);

    function contribution(label: string, F: number, a: number, M: number): string {
      return `<var>F</var>${label} · <var>a</var>${label} = ${fmt.fixed(F, 2)} N · ${fmt.fixed(a, 2)} m = ${Nm(M)} N·m`;
    }

    function updateLabReadouts(): void {
      ctx.readout('law', { html: ctx.t('law') });
      const ccw: string[] = [];
      const cw: string[] = [];
      let sumCcw = 0;
      let sumCw = 0;
      stacks().forEach((s, i) => {
        if (s.n <= 0) return;
        const M = loadTorque(s);
        const line = contribution(i === 0 ? '₁' : '₂', loadForce(s.n), Math.abs(s.x) * HOLE, Math.abs(M));
        if (M > 0) {
          ccw.push(line);
          sumCcw += M;
        } else if (M < 0) {
          cw.push(line);
          sumCw -= M;
        }
      });
      const m = meter();
      if (m) {
        const M = meterTorque(m);
        const line = contribution('<sub>K</sub>', m.F, meterArm(m), Math.abs(M));
        if (M > 1e-12) {
          ccw.push(line);
          sumCcw += M;
        } else if (M < -1e-12) {
          cw.push(line);
          sumCw -= M;
        }
      }
      const list = (lines: string[], sum: number) =>
        lines.length === 0 ? ctx.t('none') : lines.length === 1 ? lines[0]! : `${lines.join('<br>')}<br><strong>${ctx.t('sum')}: ${Nm(sum)} N·m</strong>`;
      ctx.readout('ccw', { html: list(ccw, sumCcw) });
      ctx.readout('cw', { html: list(cw, sumCw) });
      const lv = lever();
      const b = balance(lv);
      if (isBalanced(lv)) ctx.readout('state', ctx.t('stateEq'));
      else ctx.readout('state', tr(b.net > 0 ? 'stateL' : 'stateR', { d: Nm(Math.abs(b.net)) }));
      if (m) {
        const need = balancingForce(lv.loads, m);
        if (need === null) ctx.readout('need', ctx.t('needNone'));
        else if (need < 0.005) ctx.readout('need', subs(ctx.t('needZero')));
        else if (need > METER_MAX + 1e-9) ctx.readout('need', tr('needOver', { F: fmt.num(need, 2) }));
        else ctx.readout('need', subs(tr('needF', { F: fmt.num(need, 2), a: fmt.num(meterArm(m) * 100, 1) })));
      } else ctx.readout('need', null);
      for (const key of ['arms', 'effort', 'golden', 'where']) ctx.readout(key, null);
    }

    /** Lastkraft, Lastarm und Kraftarm des gewählten Alltagsgegenstands (Kräfte in N, Arme in cm). */
    function dailyLever(): { FL: number; aL: number; aK: number } {
      switch (obj()) {
        case 'barrow':
          return { FL: p.bm * G, aL: p.bl, aK: p.bk };
        case 'opener':
          return { FL: p.of, aL: OPENER_LOAD_ARM, aK: p.ok };
        case 'nut':
          return { FL: p.nf, aL: p.nl, aK: p.nk };
        default:
          return { FL: p.sm * G, aL: p.sl * 100, aK: p.sk * 100 };
      }
    }

    function updateDailyReadouts(): void {
      for (const key of ['ccw', 'cw', 'state', 'need', 'where']) ctx.readout(key, null);
      ctx.readout(
        'law',
        obj() === 'seesaw'
          ? { html: `<var>F</var>₁ · <var>a</var>₁ = <var>F</var>₂ · <var>a</var>₂` }
          : { html: `<var>F</var><sub>K</sub> · <var>a</var><sub>K</sub> = <var>F</var><sub>L</sub> · <var>a</var><sub>L</sub>` },
      );
      const { FL, aL, aK } = dailyLever();
      if (obj() === 'seesaw') {
        const F1 = p.sm * G;
        const F2 = p.sn * G;
        ctx.readout('ccw', { html: `<var>M</var>₁ = <var>F</var>₁ · <var>a</var>₁ = ${fmt.num(F1, 1)} N · ${fmt.num(p.sl, 2)} m = ${fmt.num(F1 * p.sl, 1)} N·m` });
        ctx.readout('cw', { html: `<var>M</var>₂ = <var>F</var>₂ · <var>a</var>₂ = ${fmt.num(F2, 1)} N · ${fmt.num(p.sk, 2)} m = ${fmt.num(F2 * p.sk, 1)} N·m` });
        const a = (p.sm * p.sl) / p.sn;
        ctx.readout('where', tr(a <= 2 + 1e-9 ? 'seesawNeed' : 'seesawNone', { a: fmt.num(a, 2) }));
        for (const key of ['arms', 'effort', 'golden']) ctx.readout(key, null);
        const b = F1 * p.sl - F2 * p.sk;
        ctx.readout('state', Math.abs(b) < 0.25 ? ctx.t('stateEq') : tr(b > 0 ? 'stateL' : 'stateR', { d: fmt.num(Math.abs(b), 1) }));
        return;
      }
      const cm = (v: number) => `${fmt.num(v, 1)} cm`;
      const FK = effortForce(FL, aL, aK);
      ctx.readout('arms', subs(tr('armsText', { aL: cm(aL), aK: cm(aK) })));
      ctx.readout('effort', subs(tr('effortText', { FL: fmt.num(FL, 0), aL: cm(aL), aK: cm(aK), FK: fmt.num(FK, FK < 100 ? 1 : 0) })));
      const delta = LIFT[obj() as Exclude<Obj, 'seesaw'>];
      const sK = aK * delta;
      const sL = aL * delta;
      ctx.readout('golden', subs(tr('goldenText', { sK: fmt.num(sK, 1), sL: fmt.num(sL, 1), W: fmt.num((FK * sK) / 100, 2) })));
    }

    function updateReadouts(): void {
      if (mode() === 'lab') updateLabReadouts();
      else updateDailyReadouts();
      ctx.setAction('clear', { enabled: !ctx.locked && (p.n1 > 0 || p.n2 > 0 || p.km) });
      const liftLabel = obj() === 'nut' ? (lifted ? 'release' : 'press') : lifted ? 'lower' : 'lift';
      ctx.setAction('lift', { label: ctx.t(liftLabel) });
    }

    /* ---------- Geometrie Labor ---------- */
    function labGeo(): LabGeo {
      const w = surface.width;
      const h = surface.height;
      if (geo && geo.w === w && geo.h === h) return geo;
      const small = w < 640;
      const tableY = h - (small ? 22 : 30);
      const trayH = small ? 40 : 48;
      const trayW = small ? 76 : 96;
      const sp = Math.min((w - (small ? 20 : 56)) / 21.6, small ? 18 : 36);
      const pieceH = small ? 10 : 15;
      const hookH = small ? 9 : 12;
      const stackH = MAX_PIECES * (pieceH + 1) + hookH + 4;
      const drop = HOLES * sp * Math.sin(MAX_TILT);
      const ay = Math.min(tableY - trayH - 10 - stackH - drop, h * (small ? 0.5 : 0.49));
      geo = {
        w,
        h,
        small,
        ax: w / 2,
        ay,
        sp,
        beamH: small ? 11 : 16,
        tableY,
        tray: { x: w - trayW - (small ? 8 : 14), y: tableY - trayH, w: trayW, h: trayH },
        pieceW: Math.min(small ? sp - 3 : 28, 28),
        pieceH,
        hookH,
        meter: small ? { hook: 8, ext: 54, housing: 50, ring: 6.5, width: 11 } : { hook: 10, ext: 80, housing: 70, ring: 8, width: 15 },
      };
      return geo;
    }

    /** Lochposition (Pixel) bei der aktuellen Neigung. */
    function holePx(x: number, gg = labGeo()): Pt {
      const c = Math.cos(motion.phi);
      const s = Math.sin(motion.phi);
      return [gg.ax + x * gg.sp * c, gg.ay - x * gg.sp * s];
    }

    /** Lage eines Zeigerpunkts relativ zum Hebel: entlang (in Lochabständen) und senkrecht darunter (px). */
    function beamLocal(px: number, py: number, gg = labGeo()): { along: number; below: number } {
      const dx = px - gg.ax;
      const dy = py - gg.ay;
      const c = Math.cos(motion.phi);
      const s = Math.sin(motion.phi);
      return { along: (dx * c - dy * s) / gg.sp, below: dx * s + dy * c };
    }

    function stackRect(which: 1 | 2, gg = labGeo()): Rect | null {
      const s = which === 1 ? { n: p.n1, x: p.x1 } : { n: p.n2, x: p.x2 };
      if (s.n <= 0) return null;
      const [px, py] = holePx(s.x, gg);
      // Hängen beide Stapel am selben Loch, hängt Stapel 2 unter Stapel 1.
      const shared = which === 2 && p.n1 > 0 && p.x1 === p.x2;
      const top = py + gg.hookH + (shared ? p.n1 * (gg.pieceH + 1) : 0);
      const y0 = shared ? top : py - 4;
      return { x: px - gg.pieceW / 2 - 6, y: y0, w: gg.pieceW + 12, h: top + s.n * (gg.pieceH + 1) + 6 - y0 };
    }

    /** Kraftmesser: Angriffspunkt, Richtung (Pixel), Ringmitte. */
    function meterGeo(gg = labGeo()): { P: Pt; u: Pt; ring: Pt; len: number } | null {
      if (!p.km) return null;
      const P = holePx(p.kx, gg);
      const a = (p.kw * Math.PI) / 180;
      const u: Pt = [Math.cos(a), -Math.sin(a)];
      const m = gg.meter;
      const len = m.hook + (Math.min(p.kf, METER_MAX) / METER_MAX) * m.ext + m.housing + m.ring;
      return { P, u, ring: [P[0] + u[0] * len, P[1] + u[1] * len], len };
    }

    const inRect = (r: Rect | null, x: number, y: number) => !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

    function hitLab(px: number, py: number): string | null {
      if (mode() !== 'lab' || ctx.locked) return null;
      const gg = labGeo();
      const mg = meterGeo(gg);
      if (mg) {
        if (Math.hypot(px - mg.ring[0], py - mg.ring[1]) <= 20) return 'ring';
        const t = (px - mg.P[0]) * mg.u[0] + (py - mg.P[1]) * mg.u[1];
        const d = Math.abs((px - mg.P[0]) * mg.u[1] - (py - mg.P[1]) * mg.u[0]);
        if (t > 4 && t < mg.len - 6 && d < gg.meter.width) return 'meter';
      }
      if (inRect(stackRect(2, gg), px, py)) return 'stack2';
      if (inRect(stackRect(1, gg), px, py)) return 'stack1';
      if (inRect(gg.tray, px, py)) return 'tray';
      return null;
    }

    function setStack(which: 1 | 2, values: { n?: number; x?: number }): void {
      const out: Record<string, number> = {};
      if (values.n !== undefined) out[which === 1 ? 'n1' : 'n2'] = values.n;
      if (values.x !== undefined) out[which === 1 ? 'x1' : 'x2'] = values.x;
      ctx.set(out);
    }

    function dropNew(hole: number): void {
      if (p.n1 > 0 && p.x1 === hole) {
        if (p.n1 >= MAX_PIECES) showHint('full');
        else setStack(1, { n: p.n1 + 1 });
      } else if (p.n2 > 0 && p.x2 === hole) {
        if (p.n2 >= MAX_PIECES) showHint('full');
        else setStack(2, { n: p.n2 + 1 });
      } else if (p.n1 === 0) setStack(1, { n: 1, x: hole });
      else if (p.n2 === 0) setStack(2, { n: 1, x: hole });
      else showHint('twoHooks');
    }

    function newHole(px: number, py: number): number | null {
      const gg = labGeo();
      const { along, below } = beamLocal(px, py, gg);
      if (Math.abs(along) > HOLES + 0.45 || below < -60 || below > MAX_PIECES * (gg.pieceH + 1) + 50) return null;
      const hole = Math.max(-HOLES, Math.min(HOLES, Math.round(along)));
      return hole === 0 ? null : hole;
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitLab(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const hit = hitLab(q.px, q.py);
        if (!hit) return false;
        if (hit === 'ring') {
          const mg = meterGeo();
          drag = { kind: 'ring', dx: mg ? mg.ring[0] - q.px : 0, dy: mg ? mg.ring[1] - q.py : 0 };
        }
        else if (hit === 'meter') drag = { kind: 'meter' };
        else if (hit === 'tray') drag = { kind: 'new', px: q.px, py: q.py, hole: null };
        else drag = { kind: 'stack', which: hit === 'stack1' ? 1 : 2, x0: q.px, y0: q.py, moved: false, overTray: false };
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag) return;
        const gg = labGeo();
        if (drag.kind === 'new') {
          drag.px = q.px;
          drag.py = q.py;
          drag.hole = newHole(q.px, q.py);
        } else if (drag.kind === 'stack') {
          if (!drag.moved && Math.hypot(q.px - drag.x0, q.py - drag.y0) < 6) return;
          drag.moved = true;
          drag.overTray = inRect({ x: gg.tray.x - 10, y: gg.tray.y - 30, w: gg.tray.w + 20, h: gg.tray.h + 40 }, q.px, q.py);
          const { along } = beamLocal(q.px, q.py, gg);
          const hole = Math.max(-HOLES, Math.min(HOLES, Math.round(along)));
          const other = drag.which === 1 ? { n: p.n2, x: p.x2 } : { n: p.n1, x: p.x1 };
          if (hole !== 0 && !(other.n > 0 && other.x === hole) && !drag.overTray) setStack(drag.which, { x: hole });
        } else if (drag.kind === 'meter') {
          const { along } = beamLocal(q.px, q.py, gg);
          const hole = Math.max(-HOLES, Math.min(HOLES, Math.round(along)));
          ctx.set({ kx: hole });
        } else {
          const mg = meterGeo(gg);
          if (!mg) return;
          const dx = q.px + drag.dx - mg.P[0];
          const dy = q.py + drag.dy - mg.P[1];
          let dir = (Math.atan2(-dy, dx) * 180) / Math.PI;
          for (const snap of [-180, -135, -90, -45, 0, 45, 90, 135, 180]) if (Math.abs(dir - snap) < 4) dir = snap;
          dir = Math.round(dir);
          const m = gg.meter;
          let F = ((Math.hypot(dx, dy) - m.hook - m.housing - m.ring) / m.ext) * METER_MAX;
          F = Math.max(0, Math.min(METER_MAX, F));
          const need = balancingForce(stacks().filter((s) => s.n > 0), { x: p.kx, dir });
          if (need !== null && need <= METER_MAX && Math.abs(F - need) < Math.max(0.05, need * 0.05)) F = need;
          ctx.set({ kw: dir, kf: F });
        }
        ctx.requestRender();
      },
      pointerUp: () => {
        if (drag?.kind === 'new' && drag.hole !== null) dropNew(drag.hole);
        else if (drag?.kind === 'stack') {
          const n = drag.which === 1 ? p.n1 : p.n2;
          if (!drag.moved) setStack(drag.which, { n: n - 1 });
          else if (drag.overTray) setStack(drag.which, { n: 0 });
        }
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const hit = q ? hitLab(q.px, q.py) : null;
        if (hit !== hover) {
          hover = hit;
          ctx.requestRender();
        }
        if (q) surface.setCursor(hit === 'ring' || hit === 'meter' || hit === 'tray' || hit?.startsWith('stack') ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Griffe im Alltag ---------- */
    const dailyOn = (o: Obj) => () => mode() === 'daily' && obj() === o && !ctx.locked && !liftTween.running && !lifted;
    const nutTheta = () => Math.atan2(NUT_R, p.nl);
    const yRail = (x: number) => 20 + x * 0.3;
    const yRim = (x: number) => 70 + (x + 12) * (6 / 104);
    dplot.addHandle({ get: () => [p.bl, yRim(p.bl) + 9], set: (x) => ctx.set({ bl: x }), axis: 'x', enabled: dailyOn('barrow'), color: () => ctx.theme.series[1]! });
    dplot.addHandle({ get: () => [p.bk, yRail(p.bk) + 1.5], set: (x) => ctx.set({ bk: x }), axis: 'x', enabled: dailyOn('barrow'), color: () => ctx.theme.series[2]! });
    dplot.addHandle({ get: () => [-0.4 + p.ok, 0.25], set: (x) => ctx.set({ ok: x + 0.4 }), axis: 'x', enabled: dailyOn('opener'), color: () => ctx.theme.series[2]! });
    dplot.addHandle({ get: () => [p.nl, -NUT_R], set: (x) => ctx.set({ nl: x }), axis: 'x', enabled: dailyOn('nut'), color: () => ctx.theme.series[1]! });
    dplot.addHandle({ get: () => [p.nk, 1.4], set: (x) => ctx.set({ nk: x }), axis: 'x', enabled: dailyOn('nut'), color: () => ctx.theme.series[2]! });
    const seatPt = (s: number): Pt => rotateAbout([0, SEESAW_H], seesaw.phi, [s, SEESAW_H + 0.09]);
    dplot.addHandle({
      get: () => {
        const [x, y] = seatPt(-p.sl);
        return [x, y + 0.25];
      },
      set: (x) => ctx.set({ sl: -x / Math.cos(seesaw.phi) }),
      axis: 'x',
      enabled: dailyOn('seesaw'),
      color: () => ctx.theme.series[0]!,
    });
    dplot.addHandle({
      get: () => {
        const [x, y] = seatPt(p.sk);
        return [x, y + 0.25];
      },
      set: (x) => ctx.set({ sk: x / Math.cos(seesaw.phi) }),
      axis: 'x',
      enabled: dailyOn('seesaw'),
      color: () => ctx.theme.series[1]!,
    });

    /* ---------- Zeichenhilfen ---------- */
    function pill(x0: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid = false): number {
      const gx = surface.g;
      const theme = ctx.theme;
      gx.font = `700 ${size}px ${theme.font}`;
      const w = gx.measureText(label).width + 16;
      const h = size + 11;
      const left = Math.max(4, Math.min(surface.width - 4 - w, align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2));
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 1;
      gx.fillStyle = solid ? color : theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(gx, left, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      if (!solid) {
        gx.strokeStyle = withAlpha(color, 0.5);
        gx.lineWidth = 1;
        roundRect(gx, left + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        gx.stroke();
      }
      text(gx, label, left + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: solid ? '#ffffff' : color });
      return w;
    }

    function haloText(label: string, x: number, y: number, color: string, size: number, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle', weight = 700): void {
      const gx = surface.g;
      gx.font = `${weight} ${size}px ${ctx.theme.font}`;
      // nicht über den Rand hinaus (nur ohne Verschiebung/Drehung des Koordinatensystems)
      const m = gx.getTransform();
      if (m.b === 0 && m.c === 0 && m.e === 0 && m.f === 0) {
        const tw = gx.measureText(label).width;
        const left = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
        x += Math.max(0, 4 - left) - Math.max(0, left + tw - (surface.width - 4));
      }
      gx.textAlign = align;
      gx.textBaseline = baseline;
      gx.lineJoin = 'round';
      gx.lineWidth = 3.5;
      gx.strokeStyle = ctx.theme.bg;
      gx.strokeText(label, x, y);
      gx.fillStyle = color;
      gx.fillText(label, x, y);
    }

    /** Kraftpfeil in Pixeln mit weißem Rand. */
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width = 3.2, head = 11): void {
      const gx = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 3) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hl = Math.min(head, len * 0.6);
      const bx = x1 - ux * hl;
      const by = y1 - uy * hl;
      gx.save();
      gx.lineCap = 'round';
      gx.lineJoin = 'round';
      for (const pass of [0, 1]) {
        gx.strokeStyle = pass === 0 ? withAlpha(ctx.theme.bg, 0.85) : color;
        gx.fillStyle = pass === 0 ? withAlpha(ctx.theme.bg, 0.85) : color;
        gx.lineWidth = pass === 0 ? width + 3 : width;
        gx.beginPath();
        gx.moveTo(x0, y0);
        gx.lineTo(bx, by);
        gx.stroke();
        gx.beginPath();
        gx.moveTo(x1 + (pass === 0 ? ux * 1.5 : 0), y1 + (pass === 0 ? uy * 1.5 : 0));
        gx.lineTo(bx - uy * hl * 0.48, by + ux * hl * 0.48);
        gx.lineTo(bx + uy * hl * 0.48, by - ux * hl * 0.48);
        gx.closePath();
        gx.fill();
        if (pass === 0) gx.stroke();
      }
      gx.restore();
    }

    function drawPiece(cx: number, y: number, w: number, h: number, label: string | null): void {
      const gx = surface.g;
      const brass = gx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      brass.addColorStop(0, '#8d6a24');
      brass.addColorStop(0.3, '#f0d27a');
      brass.addColorStop(0.55, '#d4ad4c');
      brass.addColorStop(1, '#7c5b1c');
      gx.fillStyle = brass;
      roundRect(gx, cx - w / 2, y, w, h, Math.min(3, h / 3));
      gx.fill();
      gx.fillStyle = 'rgba(255,255,255,0.28)';
      gx.fillRect(cx - w / 2 + 2, y + 1.2, w - 4, 1.3);
      gx.fillStyle = 'rgba(0,0,0,0.2)';
      gx.fillRect(cx - w / 2 + 2, y + h - 2.2, w - 4, 1.2);
      if (label && h >= 12 && w >= 24) text(gx, label, cx, y + h / 2 + 0.5, { font: `700 ${h >= 15 ? 9.5 : 8.5}px ${ctx.theme.font}`, color: '#3d2a06' });
    }

    function background(r: Rect, tableY: number): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const wall = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f2f5f9');
      wall.addColorStop(1, dark ? '#0f1723' : '#e0e6ee');
      gx.fillStyle = wall;
      gx.fillRect(r.x, r.y, r.w, r.h);
      const table = gx.createLinearGradient(0, tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
      table.addColorStop(1, dark ? '#33281e' : '#9c7349');
      gx.fillStyle = table;
      gx.fillRect(r.x, tableY, r.w, r.y + r.h - tableY);
      gx.fillStyle = 'rgba(255,255,255,0.22)';
      gx.fillRect(r.x, tableY, r.w, 1.5);
    }

    /* ---------- Labor zeichnen ---------- */
    function drawLab(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const gg = labGeo();
      const { ax, ay, sp, small } = gg;
      const r: Rect = { x: 0, y: 0, w: gg.w, h: gg.h };
      background(r, gg.tableY);
      const phi = motion.phi;
      const halfLen = (HOLES + 0.65) * sp;
      const colors = [theme.series[0]!, theme.series[1]!];
      const meterColor = theme.series[2]!;

      // Stativ: Fuß, Stange, Lagerbock
      const metal = (x0: number, w: number) => {
        const m = gx.createLinearGradient(x0, 0, x0 + w, 0);
        m.addColorStop(0, '#5d6570');
        m.addColorStop(0.45, '#d5dae1');
        m.addColorStop(1, '#5d6570');
        return m;
      };
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      gx.fillStyle = dark ? '#2b3340' : '#3c4552';
      roundRect(gx, ax - (small ? 46 : 70), gg.tableY - 9, small ? 92 : 140, 9, 3);
      gx.fill();
      gx.restore();
      const rodW = small ? 7 : 10;
      gx.fillStyle = metal(ax - rodW / 2, rodW);
      gx.fillRect(ax - rodW / 2, ay + 4, rodW, gg.tableY - 9 - ay - 4);

      // Skala für den Zeiger (fest am Stativ)
      const pointerLen = small ? 40 : 60;
      gx.save();
      gx.translate(ax, ay);
      gx.fillStyle = dark ? 'rgba(230,234,240,0.9)' : 'rgba(255,255,255,0.95)';
      gx.strokeStyle = dark ? '#5b6573' : '#9aa4b1';
      gx.lineWidth = 1;
      gx.beginPath();
      gx.arc(0, 0, pointerLen + 7, Math.PI / 2 - MAX_TILT - 0.06, Math.PI / 2 + MAX_TILT + 0.06);
      gx.arc(0, 0, pointerLen - 6, Math.PI / 2 + MAX_TILT + 0.06, Math.PI / 2 - MAX_TILT - 0.06, true);
      gx.closePath();
      gx.fill();
      gx.stroke();
      gx.strokeStyle = '#3d4552';
      for (let k = -2; k <= 2; k++) {
        const a = Math.PI / 2 + (k * MAX_TILT) / 2;
        gx.lineWidth = k === 0 ? 2 : 1;
        gx.beginPath();
        gx.moveTo(Math.cos(a) * (pointerLen - 4), Math.sin(a) * (pointerLen - 4));
        gx.lineTo(Math.cos(a) * (pointerLen + (k === 0 ? 6 : 3)), Math.sin(a) * (pointerLen + (k === 0 ? 6 : 3)));
        gx.stroke();
      }
      gx.restore();

      // Hebel (gedreht)
      gx.save();
      gx.translate(ax, ay);
      gx.rotate(-phi);
      // Zeiger mit Gegengewicht
      gx.strokeStyle = theme.series[1]!;
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(0, 0);
      gx.lineTo(0, pointerLen + 4);
      gx.stroke();
      gx.fillStyle = '#5d6570';
      gx.beginPath();
      gx.arc(0, pointerLen * 0.62, small ? 4 : 5.5, 0, Math.PI * 2);
      gx.fill();
      // Balken
      const bh = gg.beamH;
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 3;
      const bar = gx.createLinearGradient(0, -bh / 2, 0, bh / 2);
      bar.addColorStop(0, '#eef1f5');
      bar.addColorStop(0.45, '#c3cad3');
      bar.addColorStop(1, '#7d8794');
      gx.fillStyle = bar;
      roundRect(gx, -halfLen, -bh / 2, halfLen * 2, bh, 3);
      gx.fill();
      gx.restore();
      gx.strokeStyle = 'rgba(40,48,60,0.45)';
      gx.lineWidth = 1;
      roundRect(gx, -halfLen + 0.5, -bh / 2 + 0.5, halfLen * 2 - 1, bh - 1, 3);
      gx.stroke();
      // Löcher und Zahlen
      for (let k = -HOLES; k <= HOLES; k++) {
        gx.fillStyle = '#2a313b';
        gx.beginPath();
        gx.arc(k * sp, 0, small ? 2.2 : 3, 0, Math.PI * 2);
        gx.fill();
        if (k !== 0 && (!small || k % 2 === 0)) {
          text(gx, String(Math.abs(k)), k * sp, -bh / 2 - (small ? 6 : 8), { font: `600 ${small ? 9 : 10}px ${theme.font}`, color: theme.muted });
        }
      }
      // Kraftarme bemaßen
      if (p.arms) {
        const items: { x: number; label: string; color: string }[] = [];
        stacks().forEach((s, i) => {
          if (s.n > 0 && s.x !== 0) items.push({ x: s.x, label: `a${i === 0 ? '₁' : '₂'} = ${cmOf(s.x)} cm`, color: colors[i]! });
        });
        if (p.km && p.kx !== 0) {
          const straight = Math.abs(Math.abs(Math.sin((p.kw * Math.PI) / 180)) - 1) < 1e-6;
          items.push({ x: p.kx, label: straight ? `a_K = ${cmOf(p.kx)} cm` : `${cmOf(p.kx)} cm`, color: meterColor });
        }
        for (const side of [-1, 1]) {
          items
            .filter((it) => Math.sign(it.x) === side)
            .sort((a, b) => Math.abs(a.x) - Math.abs(b.x))
            .forEach((it, level) => {
              const y = -bh / 2 - (small ? 17 : 22) - level * (small ? 15 : 18);
              const x1 = it.x * sp;
              gx.strokeStyle = it.color;
              gx.lineWidth = 1.6;
              gx.beginPath();
              gx.moveTo(0, y);
              gx.lineTo(x1, y);
              gx.moveTo(0, y - 4);
              gx.lineTo(0, y + 4);
              gx.moveTo(x1, y - 4);
              gx.lineTo(x1, y + 4);
              gx.stroke();
              gx.setLineDash([2, 3]);
              gx.lineWidth = 1;
              gx.beginPath();
              gx.moveTo(x1, y + 4);
              gx.lineTo(x1, -bh / 2);
              gx.stroke();
              gx.setLineDash([]);
              // Beschriftung nicht über die Achse hinweg (sonst überlappen linke und rechte)
              gx.font = `700 ${small ? 10 : 11.5}px ${theme.font}`;
              const tw = gx.measureText(it.label).width;
              const cx = side < 0 ? Math.min(x1 / 2, -8 - tw / 2) : Math.max(x1 / 2, 8 + tw / 2);
              haloText(it.label, cx, y - 2, it.color, small ? 10 : 11.5, 'center', 'bottom');
            });
        }
      }
      gx.restore();

      // Achse (Lagerbock mit Stift)
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 4;
      gx.shadowOffsetY = 1;
      const pin = gx.createRadialGradient(ax - 2, ay - 2, 1, ax, ay, small ? 7 : 9);
      pin.addColorStop(0, '#ffffff');
      pin.addColorStop(0.5, '#b9c1cc');
      pin.addColorStop(1, '#4a5361');
      gx.fillStyle = pin;
      gx.beginPath();
      gx.arc(ax, ay, small ? 6 : 8, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      gx.fillStyle = '#2a313b';
      gx.beginPath();
      gx.arc(ax, ay, 2, 0, Math.PI * 2);
      gx.fill();

      // Massestücke
      const labels: { x: number; y: number; text: string; color: string }[] = [];
      stacks().forEach((s, i) => {
        if (s.n <= 0) return;
        const which = (i + 1) as 1 | 2;
        const [hx, hy] = holePx(s.x, gg);
        const shared = which === 2 && p.n1 > 0 && p.x1 === p.x2;
        let y = hy + gg.hookH;
        if (shared) y += p.n1 * (gg.pieceH + 1);
        const active = (drag?.kind === 'stack' && drag.which === which) || hover === `stack${which}`;
        if (!shared) {
          // Haken
          gx.strokeStyle = dark ? '#c3cbd6' : '#5d6570';
          gx.lineWidth = 1.6;
          gx.beginPath();
          gx.moveTo(hx, hy);
          gx.lineTo(hx, hy + gg.hookH - 4);
          gx.arc(hx + 2.5, hy + gg.hookH - 4, 2.5, Math.PI, Math.PI * 0.1, true);
          gx.stroke();
        }
        if (active && !ctx.locked) {
          gx.fillStyle = withAlpha(colors[i]!, drag ? 0.22 : 0.14);
          roundRect(gx, hx - gg.pieceW / 2 - 6, y - 4, gg.pieceW + 12, s.n * (gg.pieceH + 1) + 8, 7);
          gx.fill();
        }
        gx.save();
        gx.shadowColor = 'rgba(0,0,0,0.22)';
        gx.shadowBlur = 4;
        gx.shadowOffsetY = 2;
        for (let k = 0; k < s.n; k++) drawPiece(hx, y + k * (gg.pieceH + 1), gg.pieceW, gg.pieceH, small ? null : '50 g');
        gx.restore();
        // Farbmarke des Stapels
        gx.fillStyle = colors[i]!;
        gx.fillRect(hx - gg.pieceW / 2, y - 2, gg.pieceW, 2);
        const F = loadForce(s.n);
        labels.push({ x: hx, y: y + s.n * (gg.pieceH + 1) + (small ? 9 : 11), text: `F${i === 0 ? '₁' : '₂'} = ${fmt.fixed(F, 2)} N`, color: colors[i]! });
        if (p.forces) {
          const k = (MAX_PIECES * (gg.pieceH + 1)) / loadForce(MAX_PIECES);
          arrowPx(hx, hy, hx, hy + F * k, colors[i]!, small ? 2.6 : 3.2, small ? 9 : 11);
        }
      });
      // Beschriftungen unter den Stapeln (bei Platzmangel versetzt)
      labels.sort((a, b) => a.x - b.x);
      labels.forEach((lb, i) => {
        const prev = labels[i - 1];
        const y = prev && Math.abs(prev.x - lb.x) < (small ? 64 : 84) && Math.abs(prev.y - lb.y) < 14 ? lb.y + 15 : lb.y;
        lb.y = y;
        haloText(lb.text, lb.x, y, lb.color, small ? 10 : 11.5);
      });

      // Kraftmesser
      const mg = meterGeo(gg);
      if (mg) {
        drawMeter(mg, gg);
        if (p.arms && Math.abs(Math.abs(Math.sin((p.kw * Math.PI) / 180)) - 1) > 1e-6 && p.kx !== 0) drawLineOfAction(mg, gg);
      }

      // Kasten mit Massestücken
      drawTray(gg);

      // getragenes Massestück
      if (drag?.kind === 'new') {
        if (drag.hole !== null) {
          const [hx, hy] = holePx(drag.hole, gg);
          gx.strokeStyle = theme.series[0]!;
          gx.lineWidth = 2;
          gx.beginPath();
          gx.arc(hx, hy, 9, 0, Math.PI * 2);
          gx.stroke();
          gx.setLineDash([3, 3]);
          gx.beginPath();
          gx.moveTo(hx, hy + 9);
          gx.lineTo(drag.px, drag.py - gg.pieceH / 2);
          gx.stroke();
          gx.setLineDash([]);
        } else pill(drag.px, drag.py - gg.pieceH - 34, ctx.t('dropHere'), theme.muted, 'center', 11);
        gx.save();
        gx.shadowColor = 'rgba(0,0,0,0.35)';
        gx.shadowBlur = 8;
        gx.shadowOffsetY = 4;
        drawPiece(drag.px, drag.py - gg.pieceH / 2, gg.pieceW, gg.pieceH, small ? null : '50 g');
        gx.restore();
      }

      if (p.mom) drawTorqueCards(gg);
      if (performance.now() < hintUntil && hint) pill(gg.w / 2, gg.tableY - (small ? 34 : 40), hint, theme.series[3]!, 'center', small ? 10.5 : 12);
    }

    function drawMeter(mg: { P: Pt; u: Pt; ring: Pt; len: number }, gg: LabGeo): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const m = gg.meter;
      const color = theme.series[2]!;
      const ext = (Math.min(p.kf, METER_MAX) / METER_MAX) * m.ext;
      const angle = Math.atan2(mg.u[1], mg.u[0]);
      const active = drag?.kind === 'ring' || hover === 'ring';
      gx.save();
      gx.translate(mg.P[0], mg.P[1]);
      gx.rotate(angle);
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 5;
      gx.shadowOffsetY = 2;
      // Haken
      gx.strokeStyle = theme.dark ? '#c3cbd6' : '#5d6570';
      gx.lineWidth = 1.8;
      gx.beginPath();
      gx.arc(3, 0, 3, Math.PI * 0.6, Math.PI * 1.4, true);
      gx.lineTo(m.hook, 0);
      gx.stroke();
      // ausgezogene Skalenstange
      const w = m.width;
      gx.fillStyle = '#fbfbf7';
      gx.fillRect(m.hook, -w * 0.32, ext + 4, w * 0.64);
      gx.shadowColor = 'transparent';
      gx.strokeStyle = '#2a313b';
      gx.lineWidth = 1;
      for (let k = 0; k <= METER_MAX * 2; k++) {
        const s = m.hook + ext - (k / (METER_MAX * 2)) * m.ext;
        if (s < m.hook) break;
        const big = k % 2 === 0;
        gx.beginPath();
        gx.moveTo(s, -w * 0.32);
        gx.lineTo(s, -w * 0.32 + (big ? w * 0.5 : w * 0.28));
        gx.stroke();
      }
      // Gehäuse
      const h0 = m.hook + ext;
      const tube = gx.createLinearGradient(0, -w / 2, 0, w / 2);
      tube.addColorStop(0, withAlpha(color, 0.55));
      tube.addColorStop(0.35, withAlpha(color, 0.25));
      tube.addColorStop(1, withAlpha(color, 0.75));
      gx.fillStyle = tube;
      roundRect(gx, h0, -w / 2, m.housing, w, 3);
      gx.fill();
      gx.strokeStyle = color;
      gx.lineWidth = 1.4;
      roundRect(gx, h0, -w / 2, m.housing, w, 3);
      gx.stroke();
      // Feder im Gehäuse
      gx.strokeStyle = withAlpha(theme.dark ? '#e6eaf0' : '#2a313b', 0.55);
      gx.lineWidth = 1;
      gx.beginPath();
      const coils = 9;
      for (let k = 0; k <= coils * 2; k++) {
        const s = h0 + 4 + (k / (coils * 2)) * (m.housing - 8);
        const yy = (k % 2 === 0 ? -1 : 1) * w * 0.28;
        if (k === 0) gx.moveTo(s, yy);
        else gx.lineTo(s, yy);
      }
      gx.stroke();
      // Ring
      const rc = h0 + m.housing + m.ring;
      if (active && !ctx.locked) {
        gx.fillStyle = withAlpha(color, drag ? 0.3 : 0.18);
        gx.beginPath();
        gx.arc(rc, 0, m.ring + 8, 0, Math.PI * 2);
        gx.fill();
      }
      gx.strokeStyle = color;
      gx.lineWidth = 2.6;
      gx.beginPath();
      gx.arc(rc, 0, m.ring, 0, Math.PI * 2);
      gx.stroke();
      gx.restore();
      if (!ctx.locked && !active) {
        gx.fillStyle = withAlpha(color, 0.16);
        gx.beginPath();
        gx.arc(mg.ring[0], mg.ring[1], m.ring + 6, 0, Math.PI * 2);
        gx.fill();
      }
      // Anzeige neben dem Gehäuse (auf der von der Achse abgewandten Seite)
      const mid = m.hook + ext + m.housing / 2;
      let nx = -mg.u[1];
      let ny = mg.u[0];
      if (nx * (mg.P[0] - gg.ax) < 0 || (Math.abs(nx) < 1e-6 && ny > 0)) {
        nx = -nx;
        ny = -ny;
      }
      const off = m.width / 2 + 8;
      const lx = mg.P[0] + mg.u[0] * mid + nx * off;
      const ly = mg.P[1] + mg.u[1] * mid + ny * off;
      const size = gg.small ? 10.5 : 12;
      const label = p.kf >= METER_MAX - 1e-9 ? `≥ ${fmt.num(METER_MAX, 0)} N` : `F_K = ${fmt.fixed(p.kf, 2)} N`;
      pill(lx, ly - (size + 11) / 2, label, color, Math.abs(nx) < 0.3 ? 'center' : nx > 0 ? 'left' : 'right', size);
      if (p.forces) {
        const k = (MAX_PIECES * (gg.pieceH + 1)) / loadForce(MAX_PIECES);
        arrowPx(mg.P[0], mg.P[1], mg.P[0] + mg.u[0] * p.kf * k, mg.P[1] + mg.u[1] * p.kf * k, color, gg.small ? 2.6 : 3.2);
      }
      // Winkel zwischen Zugrichtung und Waagerechter (nur bei schrägem Zug)
      if (p.kx !== 0 && Math.abs(Math.abs(Math.sin((p.kw * Math.PI) / 180)) - 1) > 1e-6 && Math.abs(Math.sin((p.kw * Math.PI) / 180)) > 1e-6) {
        const ref = mg.u[0] >= 0 ? 0 : Math.PI;
        let acute = angle - ref;
        while (acute > Math.PI) acute -= 2 * Math.PI;
        while (acute < -Math.PI) acute += 2 * Math.PI;
        const rr = gg.small ? 20 : 26;
        gx.strokeStyle = withAlpha(color, 0.8);
        gx.lineWidth = 1.2;
        gx.setLineDash([3, 3]);
        gx.beginPath();
        gx.moveTo(mg.P[0], mg.P[1]);
        gx.lineTo(mg.P[0] + Math.cos(ref) * (rr + 14), mg.P[1]);
        gx.stroke();
        gx.setLineDash([]);
        gx.lineWidth = 1.6;
        gx.beginPath();
        gx.arc(mg.P[0], mg.P[1], rr, ref, ref + acute, acute < 0);
        gx.stroke();
        const mida = ref + acute / 2;
        const deg = Math.round(Math.abs((acute * 180) / Math.PI));
        haloText(`${deg}°`, mg.P[0] + Math.cos(mida) * (rr + 14), mg.P[1] + Math.sin(mida) * (rr + 14), color, gg.small ? 10 : 11.5);
      }
    }

    /** Wirkungslinie des schräg ziehenden Kraftmessers und ihr Abstand von der Achse (wirksamer Kraftarm). */
    function drawLineOfAction(mg: { P: Pt; u: Pt; len: number }, gg: LabGeo): void {
      const gx = surface.g;
      const color = ctx.theme.series[2]!;
      // Lotfußpunkt von der Achse auf die Wirkungslinie
      const t = (gg.ax - mg.P[0]) * mg.u[0] + (gg.ay - mg.P[1]) * mg.u[1];
      const Q: Pt = [mg.P[0] + mg.u[0] * t, mg.P[1] + mg.u[1] * t];
      const t0 = Math.min(t, 0) - 34;
      const t1 = Math.max(t, mg.len) + 24;
      gx.save();
      gx.strokeStyle = withAlpha(color, 0.75);
      gx.lineWidth = 1.3;
      gx.setLineDash([5, 5]);
      gx.beginPath();
      gx.moveTo(mg.P[0] + mg.u[0] * t0, mg.P[1] + mg.u[1] * t0);
      gx.lineTo(mg.P[0] + mg.u[0] * t1, mg.P[1] + mg.u[1] * t1);
      gx.stroke();
      gx.setLineDash([]);
      const d = Math.hypot(Q[0] - gg.ax, Q[1] - gg.ay);
      if (d > 4) {
        gx.strokeStyle = color;
        gx.lineWidth = 2.6;
        gx.lineCap = 'round';
        gx.beginPath();
        gx.moveTo(gg.ax, gg.ay);
        gx.lineTo(Q[0], Q[1]);
        gx.stroke();
        // rechter Winkel
        const nx = (gg.ax - Q[0]) / d;
        const ny = (gg.ay - Q[1]) / d;
        const s = 8;
        const sg = t > 0 ? -1 : 1;
        gx.lineWidth = 1.3;
        gx.beginPath();
        gx.moveTo(Q[0] + nx * s, Q[1] + ny * s);
        gx.lineTo(Q[0] + nx * s + mg.u[0] * s * sg, Q[1] + ny * s + mg.u[1] * s * sg);
        gx.lineTo(Q[0] + mg.u[0] * s * sg, Q[1] + mg.u[1] * s * sg);
        gx.stroke();
        const a = (d / gg.sp) * HOLE * 100;
        const level = Math.abs(motion.phi) < 0.01;
        haloText(level ? `a_K = ${fmt.num(a, 1)} cm` : 'a_K', Q[0] - nx * 16 + mg.u[0] * 8 * -sg, Q[1] - ny * 16 + mg.u[1] * 8 * -sg, color, gg.small ? 10.5 : 12);
      }
      gx.restore();
    }

    function drawTray(gg: LabGeo): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const t0 = gg.tray;
      const active = hover === 'tray' || drag?.kind === 'new';
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      const box = gx.createLinearGradient(0, t0.y, 0, t0.y + t0.h);
      box.addColorStop(0, dark ? '#5a4632' : '#a77b4d');
      box.addColorStop(1, dark ? '#3e3022' : '#7d5a35');
      gx.fillStyle = box;
      roundRect(gx, t0.x, t0.y + t0.h * 0.42, t0.w, t0.h * 0.58, 4);
      gx.fill();
      gx.restore();
      const cols = 5;
      const pw = (t0.w - 12) / cols;
      const ph = gg.pieceH - 2;
      for (let i = 0; i < 10; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        drawPiece(t0.x + 6 + pw * (col + 0.5), t0.y + t0.h * 0.42 - (row + 1) * (ph - 1) + 2, pw - 2, ph, null);
      }
      text(gx, ctx.t('tray'), t0.x + t0.w / 2, t0.y + t0.h * 0.66, { font: `700 ${gg.small ? 8.5 : 9.5}px ${theme.font}`, color: '#fff3df' });
      text(gx, ctx.t('each'), t0.x + t0.w / 2, t0.y + t0.h * 0.66 + (gg.small ? 10 : 11), { font: `600 ${gg.small ? 8 : 9}px ${theme.font}`, color: 'rgba(255,243,223,0.85)' });
      if (!ctx.locked) {
        if (active) {
          gx.strokeStyle = withAlpha(theme.series[0]!, 0.6);
          gx.lineWidth = 2;
          roundRect(gx, t0.x - 4, t0.y - 4, t0.w + 8, t0.h + 8, 8);
          gx.stroke();
        }
        haloText(`↑ ${ctx.t('drag')}`, t0.x + t0.w / 2, t0.y + t0.h * 0.42 - 2 * (ph - 1) - 9, theme.muted, 10);
      }
    }

    function drawTorqueCards(gg: LabGeo): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const small = gg.small;
      const lv = lever();
      const b = balance(lv);
      const balanced = isBalanced(lv);
      const parts: { M: number; color: string }[] = [];
      stacks().forEach((s, i) => {
        if (s.n > 0) parts.push({ M: loadTorque(s), color: i === 0 ? theme.series[0]! : theme.series[1]! });
      });
      const m = meter();
      if (m) parts.push({ M: meterTorque(m), color: theme.series[2]! });
      const scale = Math.max(b.ccw, b.cw, 0.05);
      const gap = small ? 34 : 64;
      const cw = Math.min(small ? (gg.w - 16 - gap) / 2 : 214, (gg.w - 16 - gap) / 2);
      const ch = small ? 50 : 60;
      const y0 = 8;
      const cards: { x: number; title: string; value: number; sign: 1 | -1 }[] = [
        { x: gg.w / 2 - gap / 2 - cw, title: `↺ ${ctx.t('ccw')}`, value: b.ccw, sign: 1 },
        { x: gg.w / 2 + gap / 2, title: `${ctx.t('cw')} ↻`, value: b.cw, sign: -1 },
      ];
      for (const card of cards) {
        gx.save();
        gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        gx.shadowBlur = 8;
        gx.shadowOffsetY = 2;
        gx.fillStyle = theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
        roundRect(gx, card.x, y0, cw, ch, 10);
        gx.fill();
        gx.restore();
        gx.strokeStyle = withAlpha(theme.muted, 0.25);
        gx.lineWidth = 1;
        roundRect(gx, card.x + 0.5, y0 + 0.5, cw - 1, ch - 1, 10);
        gx.stroke();
        text(gx, card.title, card.x + 10, y0 + (small ? 11 : 13), { font: `700 ${small ? 10 : 11}px ${theme.font}`, color: theme.muted, align: 'left' });
        text(gx, `${small ? '' : 'M = '}${Nm(card.value)} N·m`, card.x + 10, y0 + (small ? 27 : 32), { font: `700 ${small ? 13 : 16}px ${theme.font}`, color: theme.text, align: 'left' });
        // Balken aus den einzelnen Beiträgen
        const bx = card.x + 10;
        const bw = cw - 20;
        const by = y0 + ch - (small ? 12 : 14);
        gx.fillStyle = withAlpha(theme.muted, 0.15);
        roundRect(gx, bx, by, bw, 6, 3);
        gx.fill();
        let x = bx;
        for (const part of parts) {
          if (Math.sign(part.M) !== card.sign || Math.abs(part.M) < 1e-12) continue;
          const len = (Math.abs(part.M) / scale) * bw;
          gx.fillStyle = part.color;
          gx.fillRect(x, by, len, 6);
          x += len;
        }
      }
      // Vergleichszeichen
      const cx = gg.w / 2;
      const cy = y0 + ch / 2;
      const rr = small ? 13 : 17;
      const col = balanced ? theme.series[2]! : theme.series[3]!;
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.18)';
      gx.shadowBlur = 6;
      gx.fillStyle = col;
      gx.beginPath();
      gx.arc(cx, cy, rr, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      text(gx, balanced ? '=' : b.net > 0 ? '>' : '<', cx, cy + 1, { font: `800 ${small ? 17 : 21}px ${theme.font}`, color: '#ffffff' });
      const status = balanced ? ctx.t('equal') : ctx.t(b.net > 0 ? 'tipLeft' : 'tipRight');
      haloText(status, cx, y0 + ch + (small ? 11 : 13), col, small ? 10.5 : 12);
    }

    /* ---------- Alltag zeichnen ---------- */
    function dailyBackground(): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const r = dplot.rect;
      const sky = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      sky.addColorStop(0, dark ? '#162238' : '#e6f0fb');
      sky.addColorStop(1, dark ? '#0f1726' : '#f6f9fc');
      gx.fillStyle = sky;
      gx.fillRect(r.x, r.y, r.w, r.h);
    }

    function ground(y0: number, grass: boolean): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const r = dplot.rect;
      const gy = dplot.py(y0);
      const gr = gx.createLinearGradient(0, gy, 0, r.y + r.h);
      if (grass) {
        gr.addColorStop(0, dark ? '#2f5a2a' : '#6fae4f');
        gr.addColorStop(0.12, dark ? '#24461f' : '#58923d');
        gr.addColorStop(1, dark ? '#3b2f22' : '#8a6a46');
      } else {
        gr.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
        gr.addColorStop(1, dark ? '#33281e' : '#9c7349');
      }
      gx.fillStyle = gr;
      gx.fillRect(r.x, gy, r.w, r.y + r.h - gy);
      gx.fillStyle = 'rgba(255,255,255,0.2)';
      gx.fillRect(r.x, gy, r.w, 1.5);
    }

    /** Drehachse markieren. */
    function axisMark(x: number, y: number, labelBelow: boolean, offset = 0): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const [px, py] = dplot.toPx(x, y);
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.35)';
      gx.shadowBlur = 4;
      gx.fillStyle = '#ffffff';
      gx.beginPath();
      gx.arc(px, py, 6.5, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      gx.strokeStyle = theme.dark ? '#10161f' : '#17202c';
      gx.lineWidth = 2.2;
      gx.beginPath();
      gx.arc(px, py, 6.5, 0, Math.PI * 2);
      gx.stroke();
      gx.fillStyle = gx.strokeStyle;
      gx.beginPath();
      gx.arc(px, py, 2.2, 0, Math.PI * 2);
      gx.fill();
      haloText(ctx.t('axis'), px + offset, py + (labelBelow ? 18 : -18), theme.text, narrow() ? 10.5 : 12);
    }

    /** Angriffspunkt der Kraft (Hand) markieren. */
    function handMark(px: number, py: number, color: string): void {
      const gx = surface.g;
      gx.fillStyle = color;
      gx.strokeStyle = '#ffffff';
      gx.lineWidth = 2;
      gx.beginPath();
      gx.arc(px, py, 5, 0, Math.PI * 2);
      gx.fill();
      gx.stroke();
    }

    /** Waagerechte Bemaßung in Weltkoordinaten. */
    function dimension(x0: number, x1: number, y: number, label: string, color: string, guides: [number, number] | null = null): void {
      const gx = surface.g;
      const [a, py] = dplot.toPx(x0, y);
      const b = dplot.px(x1);
      gx.strokeStyle = color;
      gx.lineWidth = 1.8;
      gx.beginPath();
      gx.moveTo(a, py);
      gx.lineTo(b, py);
      gx.moveTo(a, py - 5);
      gx.lineTo(a, py + 5);
      gx.moveTo(b, py - 5);
      gx.lineTo(b, py + 5);
      gx.stroke();
      if (guides) {
        gx.setLineDash([3, 4]);
        gx.lineWidth = 1;
        gx.beginPath();
        gx.moveTo(a, py);
        gx.lineTo(a, dplot.py(guides[0]));
        gx.moveTo(b, py);
        gx.lineTo(b, dplot.py(guides[1]));
        gx.stroke();
        gx.setLineDash([]);
      }
      haloText(label, (a + b) / 2, py - 3, color, narrow() ? 10.5 : 12, 'center', 'bottom');
    }

    /** Pfeillänge in Pixeln für die Last und daraus die Kraft (maßstäblich zueinander). */
    function arrowLengths(FL: number, FK: number, max = 120): { lL: number; lK: number } {
      const r = dplot.rect;
      const lL = Math.min(r.h * 0.26, max);
      const lK = Math.min(lL * 1.6, (lL * FK) / FL);
      return { lL, lK };
    }

    function rotateAbout(c: Pt, a: number, q: Pt): Pt {
      const co = Math.cos(a);
      const si = Math.sin(a);
      return [c[0] + (q[0] - c[0]) * co - (q[1] - c[1]) * si, c[1] + (q[0] - c[0]) * si + (q[1] - c[1]) * co];
    }

    /** Weg eines Punkts beim Anheben (Bogen) mit Beschriftung. */
    function travelArc(c: Pt, q: Pt, a: number, color: string, label: string, side: 1 | -1, offset: Pt = [side * 10, 0]): void {
      if (Math.abs(a) <= 1e-4) return;
      const gx = surface.g;
      const pts: Pt[] = [];
      for (let i = 0; i <= 24; i++) pts.push(rotateAbout(c, (a * i) / 24, q));
      gx.save();
      gx.strokeStyle = color;
      gx.lineWidth = 2.5;
      gx.setLineDash([4, 4]);
      gx.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? gx.moveTo(dplot.px(x), dplot.py(y)) : gx.lineTo(dplot.px(x), dplot.py(y))));
      gx.stroke();
      gx.setLineDash([]);
      const end = pts[pts.length - 1]!;
      const mid = pts[12]!;
      haloText(label, dplot.px(mid[0]) + offset[0], dplot.py(mid[1]) + offset[1], color, narrow() ? 10.5 : 12, side > 0 ? 'left' : 'right');
      gx.fillStyle = color;
      gx.beginPath();
      gx.arc(dplot.px(end[0]), dplot.py(end[1]), 3, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
    }

    function drawBarrow(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      dplot.setRange([-36, 170], [-24, 112]);
      const k = dplot.scale.x;
      const lift = liftValue() * LIFT.barrow;
      const C: Pt = [0, 20];
      const R = (q: Pt): Pt => rotateAbout(C, lift, q);
      const P = (q: Pt): Pt => {
        const [x, y] = R(q);
        return [dplot.px(x), dplot.py(y)];
      };
      const poly = (pts: Pt[], fill: string | CanvasGradient, stroke?: string) => {
        gx.beginPath();
        pts.forEach((q, i) => {
          const [x, y] = P(q);
          if (i === 0) gx.moveTo(x, y);
          else gx.lineTo(x, y);
        });
        gx.closePath();
        gx.fillStyle = fill;
        gx.fill();
        if (stroke) {
          gx.strokeStyle = stroke;
          gx.lineWidth = 1.2;
          gx.stroke();
        }
      };
      ground(0, true);
      // Rahmen (Holme) und Stütze
      gx.lineCap = 'round';
      gx.strokeStyle = '#3a4250';
      gx.lineWidth = Math.max(3, 3.2 * k);
      gx.beginPath();
      const [r0x, r0y] = P([0, 20]);
      const [r1x, r1y] = P([150, yRail(150)]);
      gx.moveTo(r0x, r0y);
      gx.lineTo(r1x, r1y);
      const [l0x, l0y] = P([72, yRail(72)]);
      const [l1x, l1y] = P([80, 30]);
      gx.moveTo(l0x, l0y);
      gx.lineTo(l1x, l1y);
      gx.stroke();
      const [f0x, f0y] = P([72, 30]);
      gx.lineWidth = Math.max(2.5, 2.4 * k);
      gx.beginPath();
      gx.moveTo(f0x, f0y);
      gx.lineTo(l1x + 4 * k, l1y);
      gx.stroke();
      // Griff
      gx.strokeStyle = '#1d2129';
      gx.lineWidth = Math.max(5, 5 * k);
      gx.beginPath();
      const [g0x, g0y] = P([128, yRail(128)]);
      gx.moveTo(g0x, g0y);
      gx.lineTo(r1x, r1y);
      gx.stroke();
      // Mulde
      const tub: Pt[] = [
        [-12, 70],
        [92, 76],
        [79, yRail(79) + 2],
        [16, yRail(16) + 2],
      ];
      const [t0x, t0y] = P([20, 76]);
      const [t1x, t1y] = P([20, yRail(20)]);
      const tg = gx.createLinearGradient(t0x, t0y, t1x, t1y);
      tg.addColorStop(0, '#3f9a5b');
      tg.addColorStop(1, '#22603a');
      // Sand mit Haufen (Schwerpunkt bei bl)
      const sand: Pt[] = [];
      const left = -10;
      const right = 90;
      for (let i = 0; i <= 40; i++) {
        const x = left + ((right - left) * i) / 40;
        const bump = Math.max(0, 1 - ((x - p.bl) / 32) ** 2);
        sand.push([x, yRim(x) - 1 + 16 * bump * (0.4 + 0.6 * Math.min(1, p.bm / 80))]);
      }
      sand.push([right, yRim(right) - 4], [left, yRim(left) - 4]);
      const [s0x, s0y] = P([p.bl, 92]);
      const sg = gx.createLinearGradient(s0x, s0y, s0x, s0y + 30 * k);
      sg.addColorStop(0, '#e9cf98');
      sg.addColorStop(1, '#c7a265');
      poly(sand, sg);
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      poly(tub, tg, '#1b4a2c');
      gx.restore();
      // Rand der Mulde
      gx.strokeStyle = '#6cc489';
      gx.lineWidth = Math.max(2, 1.8 * k);
      gx.beginPath();
      const [e0x, e0y] = P([-12, 70]);
      const [e1x, e1y] = P([92, 76]);
      gx.moveTo(e0x, e0y);
      gx.lineTo(e1x, e1y);
      gx.stroke();
      // Rad
      const [wx, wy] = P(C);
      const wr = 20 * k;
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      gx.fillStyle = '#1d2129';
      gx.beginPath();
      gx.arc(wx, wy, wr, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      gx.fillStyle = '#c3cad3';
      gx.beginPath();
      gx.arc(wx, wy, wr * 0.62, 0, Math.PI * 2);
      gx.fill();
      gx.strokeStyle = '#7d8794';
      gx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + lift;
        gx.beginPath();
        gx.moveTo(wx, wy);
        gx.lineTo(wx + Math.cos(a) * wr * 0.6, wy + Math.sin(a) * wr * 0.6);
        gx.stroke();
      }

      // Überlagertes Hebelmodell
      const FL = p.bm * G;
      const FK = effortForce(FL, p.bl, p.bk);
      const { lL, lK } = arrowLengths(FL, FK);
      const S = R([p.bl, yRim(p.bl) + 4]);
      const H = R([p.bk, yRail(p.bk) + 1.5]);
      const [sx, sy] = dplot.toPx(S[0], S[1]);
      gx.fillStyle = theme.series[1]!;
      gx.beginPath();
      gx.arc(sx, sy, 4.5, 0, Math.PI * 2);
      gx.fill();
      arrowPx(sx, sy, sx, sy + lL, theme.series[1]!);
      haloText(`F_L = ${fmt.num(FL, 0)} N`, sx + 10, sy + lL * 0.62, theme.series[1]!, narrow() ? 11 : 13, 'left');
      const [hx, hy] = dplot.toPx(H[0], H[1]);
      arrowPx(hx, hy, hx, hy - lK, theme.series[2]!);
      haloText(`F_K = ${fmt.num(FK, 0)} N`, hx - 10, hy - lK * 0.55, theme.series[2]!, narrow() ? 11 : 13, 'right');
      handMark(hx, hy, theme.series[2]!);
      axisMark(C[0], C[1], false);
      const groundDims = lift < 1e-3;
      if (groundDims) {
        dimension(0, p.bl, -8, `a_L = ${fmt.num(p.bl, 0)} cm`, theme.series[1]!, [20, yRim(p.bl)]);
        dimension(0, p.bk, -18, `a_K = ${fmt.num(p.bk, 0)} cm`, theme.series[2]!, [-8, yRail(p.bk)]);
      }
      travelArc(C, [p.bk, yRail(p.bk) + 1.5], lift, theme.series[2]!, tr('sK', { s: fmt.num(p.bk * lift, 1) }), 1);
      travelArc(C, [p.bl, yRim(p.bl) + 4], lift, theme.series[1]!, tr('sL', { s: fmt.num(p.bl * lift, 1) }), -1, [-14, -14]);
    }

    function drawOpener(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      dplot.setRange([-7, 17.5], [-8.5, 6.5]);
      const k = dplot.scale.x;
      const lift = liftValue() * LIFT.opener;
      const F0: Pt = [-0.4, 0];
      const R = (q: Pt): Pt => rotateAbout(F0, lift, q);
      const P = (q: Pt): Pt => {
        const [x, y] = R(q);
        return [dplot.px(x), dplot.py(y)];
      };
      // Flasche
      const r = dplot.rect;
      const neck = 1.35;
      const bottle: Pt[] = [
        [-neck, -0.7],
        [neck, -0.7],
        [neck, -4.2],
        [3.6, -8.6],
        [3.6, -40],
        [-3.6, -40],
        [-3.6, -8.6],
        [-neck, -4.2],
      ];
      const [bx0] = dplot.toPx(-3.6, 0);
      const [bx1] = dplot.toPx(3.6, 0);
      const glass = gx.createLinearGradient(bx0, 0, bx1, 0);
      glass.addColorStop(0, '#3d2410');
      glass.addColorStop(0.3, '#8a5a24');
      glass.addColorStop(0.45, '#c08a45');
      glass.addColorStop(1, '#3d2410');
      gx.save();
      gx.beginPath();
      gx.rect(r.x, r.y, r.w, r.h);
      gx.clip();
      gx.beginPath();
      bottle.forEach(([x, y], i) => (i === 0 ? gx.moveTo(dplot.px(x), dplot.py(y)) : gx.lineTo(dplot.px(x), dplot.py(y))));
      gx.closePath();
      gx.fillStyle = glass;
      gx.fill();
      gx.fillStyle = 'rgba(255,255,255,0.28)';
      gx.fillRect(dplot.px(-0.9), dplot.py(-1), 0.35 * k, 2.8 * k);
      gx.fillRect(dplot.px(-2.8), dplot.py(-9.5), 0.5 * k, 30 * k);
      gx.restore();
      // Kronkorken: kippt mit dem Öffner am Zahn hoch
      const capLift = Math.max(0, lift);
      const capC: Pt = [-1.6, -0.1];
      const Rc = (q: Pt): Pt => rotateAbout(capC, capLift * 0.9, q);
      const cap: Pt[] = [];
      for (let i = 0; i <= 16; i++) {
        const x = -1.6 + (3.2 * i) / 16;
        cap.push([x, i % 2 === 0 ? -0.62 : -0.48]);
      }
      cap.push([1.6, -0.05], [1.45, 0], [-1.45, 0], [-1.6, -0.05]);
      const [c0x, c0y] = dplot.toPx(-1.6, 0);
      const cg = gx.createLinearGradient(c0x, c0y, c0x + 3.2 * k, c0y);
      cg.addColorStop(0, '#8f1d1d');
      cg.addColorStop(0.4, '#e05a4f');
      cg.addColorStop(1, '#7a1717');
      gx.beginPath();
      cap.forEach((q, i) => {
        const [x, y] = Rc(q);
        if (i === 0) gx.moveTo(dplot.px(x), dplot.py(y));
        else gx.lineTo(dplot.px(x), dplot.py(y));
      });
      gx.closePath();
      gx.fillStyle = cg;
      gx.fill();
      // Öffner (Stahl)
      const body: Pt[] = [
        [-1.3, 0.05],
        [1.4, 0.05],
        [1.4, -0.35],
        [1.75, -0.85],
        [2.05, -0.75],
        [1.95, -0.2],
        [2.3, 0.05],
        [5, 0.05],
        [6, -0.25],
        [15.2, -0.25],
        [15.8, 0.4],
        [15.2, 1.05],
        [6, 1.05],
        [5, 0.55],
        [-1.0, 0.55],
        [-1.5, 0.3],
      ];
      const [o0x, o0y] = P([0, 1.05]);
      const [o1x, o1y] = P([0, -0.25]);
      const steel = gx.createLinearGradient(o0x, o0y, o1x, o1y);
      steel.addColorStop(0, '#f2f4f7');
      steel.addColorStop(0.5, '#b4bcc7');
      steel.addColorStop(1, '#6b7584');
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      gx.beginPath();
      body.forEach((q, i) => {
        const [x, y] = P(q);
        if (i === 0) gx.moveTo(x, y);
        else gx.lineTo(x, y);
      });
      gx.closePath();
      gx.fillStyle = steel;
      gx.fill();
      gx.restore();
      gx.strokeStyle = '#4a5361';
      gx.lineWidth = 1;
      gx.stroke();
      // Griffschale
      gx.fillStyle = '#26303d';
      gx.beginPath();
      [
        [6.4, -0.05],
        [15, -0.05],
        [15.45, 0.4],
        [15, 0.85],
        [6.4, 0.85],
      ].forEach((q, i) => {
        const [x, y] = P(q as Pt);
        if (i === 0) gx.moveTo(x, y);
        else gx.lineTo(x, y);
      });
      gx.closePath();
      gx.fill();

      const FL = p.of;
      const FK = effortForce(FL, OPENER_LOAD_ARM, p.ok);
      const { lL, lK } = arrowLengths(FL, FK);
      const T = R([1.6, -0.62]);
      const [tx, ty] = dplot.toPx(T[0], T[1]);
      arrowPx(tx, ty, tx, ty + lL, theme.series[1]!);
      haloText(`F_L = ${fmt.num(FL, 0)} N`, tx + 10, ty + lL * 0.7, theme.series[1]!, narrow() ? 11 : 13, 'left');
      const Hh = R([-0.4 + p.ok, 1.05]);
      const [hx, hy] = dplot.toPx(Hh[0], Hh[1]);
      arrowPx(hx, hy, hx, hy - lK, theme.series[2]!);
      haloText(`F_K = ${fmt.num(FK, 1)} N`, hx + 10, hy - lK * 0.6, theme.series[2]!, narrow() ? 11 : 13, 'left');
      handMark(hx, hy, theme.series[2]!);
      axisMark(F0[0], F0[1], false, -6);
      if (lift < 1e-3) {
        dimension(-0.4, 1.6, 2.6, `a_L = ${fmt.num(OPENER_LOAD_ARM, 0)} cm`, theme.series[1]!, [0.6, 0.6]);
        dimension(-0.4, -0.4 + p.ok, 4.4, `a_K = ${fmt.num(p.ok, 1)} cm`, theme.series[2]!, [0.6, 1.1]);
      }
      travelArc(F0, [-0.4 + p.ok, 1.05], lift, theme.series[2]!, tr('sK', { s: fmt.num(p.ok * lift, 1) }), 1);
      travelArc(F0, [1.6, -0.62], lift, theme.series[1]!, tr('sL', { s: fmt.num(OPENER_LOAD_ARM * lift, 1) }), 1);
    }

    function drawNut(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const theta0 = nutTheta();
      // fester Ausschnitt (auch beim Ziehen der Nuss), passend für den kleinsten Lastarm
      dplot.setRange([-2, 23], [-18, 9.5]);
      const k = dplot.scale.x;
      const small = narrow();
      const close = liftValue() * LIFT.nut;
      const crack = liftValue() > 0.6;
      const armLen = 21;
      // Nuss: berührt den oberen (waagerechten) Schenkel bei x = a_L, Mittelpunkt direkt darunter
      const [nx, ny] = dplot.toPx(p.nl, -NUT_R);
      const nr = NUT_R * k * (crack ? 0.95 : 1);
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 5;
      const ng = gx.createRadialGradient(nx - nr * 0.35, ny - nr * 0.4, nr * 0.1, nx, ny, nr);
      ng.addColorStop(0, '#d9b07a');
      ng.addColorStop(0.6, '#a87440');
      ng.addColorStop(1, '#6b4422');
      gx.fillStyle = ng;
      gx.beginPath();
      gx.arc(nx, ny, nr, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      gx.strokeStyle = 'rgba(70,40,15,0.55)';
      gx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        gx.beginPath();
        gx.ellipse(nx + i * nr * 0.28, ny, nr * 0.18, nr * 0.85, 0, 0, Math.PI * 2);
        gx.stroke();
      }
      if (crack) {
        gx.strokeStyle = '#2b1a0a';
        gx.lineWidth = 2;
        gx.beginPath();
        gx.moveTo(nx - nr, ny - 1);
        gx.lineTo(nx - nr * 0.4, ny + nr * 0.2);
        gx.lineTo(nx - nr * 0.1, ny - nr * 0.25);
        gx.lineTo(nx + nr * 0.4, ny + nr * 0.15);
        gx.lineTo(nx + nr, ny - 2);
        gx.stroke();
      }
      // Schenkel: oberer waagerecht (beim Zudrücken um −close gedreht), unterer um −2θ geneigt
      const arms: { a: number; out: 1 | -1 }[] = [
        { a: -close, out: 1 },
        { a: -2 * theta0 + close, out: -1 },
      ];
      for (const arm of arms) {
        const u: Pt = [Math.cos(arm.a), Math.sin(arm.a)];
        const n: Pt = [-Math.sin(arm.a) * arm.out, Math.cos(arm.a) * arm.out];
        const pt = (s0: number, off: number): Pt => [dplot.px(u[0] * s0 + n[0] * off), dplot.py(u[1] * s0 + n[1] * off)];
        const quad = (s0: number, s1: number, o0: number, o1: number, fill: string | CanvasGradient) => {
          const q = [pt(s0, o0), pt(s1, o0), pt(s1, o1), pt(s0, o1)];
          gx.beginPath();
          q.forEach(([x, y], i) => (i === 0 ? gx.moveTo(x, y) : gx.lineTo(x, y)));
          gx.closePath();
          gx.fillStyle = fill;
          gx.fill();
        };
        gx.save();
        gx.shadowColor = 'rgba(0,0,0,0.3)';
        gx.shadowBlur = 5;
        gx.shadowOffsetY = 2;
        const [a0x, a0y] = pt(0, 0);
        const [a1x, a1y] = pt(0, 1.1);
        const steel = gx.createLinearGradient(a0x, a0y, a1x, a1y);
        steel.addColorStop(0, '#6b7584');
        steel.addColorStop(0.5, '#e5e9ee');
        steel.addColorStop(1, '#7d8794');
        quad(-0.6, armLen, 0, 1.1, steel);
        const wood = gx.createLinearGradient(a0x, a0y, a1x, a1y);
        wood.addColorStop(0, '#6a3b18');
        wood.addColorStop(0.5, '#b8733a');
        wood.addColorStop(1, '#6a3b18');
        quad(11, armLen + 0.4, -0.25, 1.4, wood);
        gx.restore();
      }
      // Gelenk
      const [hx0, hy0] = dplot.toPx(0, 0);
      const jg = gx.createRadialGradient(hx0 - 2, hy0 - 2, 1, hx0, hy0, 1.3 * k);
      jg.addColorStop(0, '#ffffff');
      jg.addColorStop(1, '#5d6570');
      gx.fillStyle = jg;
      gx.beginPath();
      gx.arc(hx0, hy0, 1.25 * k, 0, Math.PI * 2);
      gx.fill();

      const FL = p.nf;
      const FK = effortForce(FL, p.nl, p.nk);
      const { lL, lK } = arrowLengths(FL, FK, small ? 50 : 72);
      const size = small ? 11 : 13;
      // Last: Die Nuss drückt den oberen Schenkel nach oben. Kraft: Die Hand drückt ihn nach unten.
      const C = rotateAbout([0, 0], -close, [p.nl, 0]);
      const [cx, cy] = dplot.toPx(C[0], C[1]);
      arrowPx(cx, cy, cx, cy - lL, theme.series[1]!);
      haloText(`F_L = ${fmt.num(FL, 0)} N`, cx + 9, cy - lL * 0.75, theme.series[1]!, size, 'left');
      const H = rotateAbout([0, 0], -close, [p.nk, 1.4]);
      const [hx, hy] = dplot.toPx(H[0], H[1]);
      arrowPx(hx, hy - lK, hx, hy, theme.series[2]!);
      haloText(`F_K = ${fmt.num(FK, 0)} N`, hx + 9, hy - lK * 0.6, theme.series[2]!, size, 'left');
      handMark(hx, hy, theme.series[2]!);
      // gleich große Gegenkraft am unteren Schenkel (blass)
      const b = -2 * theta0 + close;
      const H2: Pt = [Math.cos(b) * p.nk + Math.sin(b) * 1.4, Math.sin(b) * p.nk - Math.cos(b) * 1.4];
      const [h2x, h2y] = dplot.toPx(H2[0], H2[1]);
      arrowPx(h2x - Math.sin(b) * lK, h2y - Math.cos(b) * lK, h2x, h2y, withAlpha(theme.series[2]!, 0.5));
      axisMark(0, 0, true, -26);
      if (close < 1e-3) {
        dimension(0, p.nl, 5.4, `a_L = ${fmt.num(p.nl, 1)} cm`, theme.series[1]!, [0, 1.1]);
        dimension(0, p.nk, 7.6, `a_K = ${fmt.num(p.nk, 1)} cm`, theme.series[2]!, [5.4, 1.4]);
      } else {
        travelArc([0, 0], [p.nk, 1.4], -close, theme.series[2]!, tr('sK', { s: fmt.num(p.nk * close, 1) }), 1, [12, -18]);
        travelArc([0, 0], [p.nl, 0], -close, theme.series[1]!, tr('sL', { s: fmt.num(p.nl * close, 2) }), -1, [-12, -30]);
      }
    }

    function drawKid(x: number, y: number, mass: number, color: string, facing: 1 | -1, grip: Pt): void {
      const gx = surface.g;
      const f = Math.cbrt(mass / 40);
      const [px, py] = dplot.toPx(x, y);
      const k = dplot.scale.x;
      const bw = 0.34 * f * k;
      const bh = 0.5 * f * k;
      const head = 0.13 * f * k;
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 5;
      gx.shadowOffsetY = 2;
      // Beine (sitzend, zur Mitte)
      gx.strokeStyle = '#2f3a4f';
      gx.lineCap = 'round';
      gx.lineWidth = 0.12 * f * k;
      gx.beginPath();
      gx.moveTo(px, py - 0.06 * k);
      gx.lineTo(px + facing * 0.3 * f * k, py - 0.04 * k);
      gx.lineTo(px + facing * 0.34 * f * k, py + 0.22 * f * k);
      gx.stroke();
      // Körper
      gx.fillStyle = color;
      roundRect(gx, px - bw / 2, py - bh - 0.04 * k, bw, bh, bw * 0.35);
      gx.fill();
      // Kopf
      gx.fillStyle = '#f1c9a0';
      gx.beginPath();
      gx.arc(px, py - bh - 0.04 * k - head * 1.05, head, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      gx.fillStyle = '#4a3020';
      gx.beginPath();
      gx.arc(px, py - bh - 0.04 * k - head * 1.2, head * 1.02, Math.PI * 1.05, Math.PI * 1.95);
      gx.fill();
      // Arm zum Griff
      gx.strokeStyle = '#f1c9a0';
      gx.lineWidth = 0.08 * f * k;
      gx.lineCap = 'round';
      gx.beginPath();
      gx.moveTo(px + facing * bw * 0.15, py - bh * 0.78);
      gx.lineTo(grip[0], grip[1]);
      gx.stroke();
      haloText(`${fmt.num(mass, 0)} kg`, px, py - bh - 0.04 * k - head * 2.2 - 8, color, Math.max(10.5, Math.min(13, 0.1 * k)));
    }

    function drawSeesaw(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      dplot.setRange([-2.75, 2.75], [-0.7, 2.0]);
      const k = dplot.scale.x;
      ground(0, true);
      const C: Pt = [0, SEESAW_H];
      const psi = seesaw.phi;
      // Ständer
      const [c0x, c0y] = dplot.toPx(C[0], C[1]);
      const [b0x, b0y] = dplot.toPx(-0.32, 0);
      const [b1x] = dplot.toPx(0.32, 0);
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 6;
      const stand = gx.createLinearGradient(b0x, 0, b1x, 0);
      stand.addColorStop(0, '#9c3b1f');
      stand.addColorStop(0.5, '#e0703c');
      stand.addColorStop(1, '#9c3b1f');
      gx.fillStyle = stand;
      gx.beginPath();
      gx.moveTo(b0x, b0y);
      gx.lineTo(b1x, b0y);
      gx.lineTo(c0x + 0.07 * k, c0y);
      gx.lineTo(c0x - 0.07 * k, c0y);
      gx.closePath();
      gx.fill();
      gx.restore();
      // Brett
      gx.save();
      gx.translate(c0x, c0y);
      gx.rotate(-psi);
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      const wood = gx.createLinearGradient(0, -0.1 * k, 0, 0);
      wood.addColorStop(0, '#e7b77a');
      wood.addColorStop(1, '#a8723e');
      gx.fillStyle = wood;
      roundRect(gx, -SEESAW_HALF * k, -0.09 * k, SEESAW_HALF * 2 * k, 0.09 * k, 3);
      gx.fill();
      gx.restore();
      // Kinder mit Haltegriff vor sich auf dem Brett
      const kids: { s: number; m: number; color: string; facing: 1 | -1 }[] = [
        { s: -p.sl, m: p.sm, color: theme.series[0]!, facing: 1 },
        { s: p.sk, m: p.sn, color: theme.series[1]!, facing: -1 },
      ];
      const nrm: Pt = [-Math.sin(psi), Math.cos(psi)];
      const seats: Pt[] = [];
      for (const kid of kids) {
        const seat = rotateAbout(C, psi, [kid.s, SEESAW_H + 0.09]);
        seats.push(seat);
        const g0 = rotateAbout(C, psi, [kid.s + kid.facing * 0.42, SEESAW_H + 0.09]);
        const g1: Pt = [g0[0] + nrm[0] * 0.34, g0[1] + nrm[1] * 0.34];
        gx.strokeStyle = '#3a4250';
        gx.lineCap = 'round';
        gx.lineWidth = Math.max(2.5, 0.035 * k);
        gx.beginPath();
        gx.moveTo(dplot.px(g0[0]), dplot.py(g0[1]));
        gx.lineTo(dplot.px(g1[0]), dplot.py(g1[1]));
        gx.lineTo(dplot.px(g1[0] - kid.facing * 0.06), dplot.py(g1[1]));
        gx.stroke();
        drawKid(seat[0], seat[1], kid.m, kid.color, kid.facing, dplot.toPx(g1[0], g1[1] - 0.02));
      }
      // Gewichtskräfte am Schwerpunkt der Kinder
      const F1 = p.sm * G;
      const F2 = p.sn * G;
      const lmax = Math.min(dplot.rect.h * 0.17, 80);
      const kf = lmax / Math.max(F1, F2);
      const size = narrow() ? 11 : 13;
      kids.forEach((kid, i) => {
        const seat = seats[i]!;
        const F = i === 0 ? F1 : F2;
        const f = Math.cbrt(kid.m / 40);
        const [sx, sy] = dplot.toPx(seat[0], seat[1] + 0.26 * f);
        arrowPx(sx, sy, sx, sy + F * kf, kid.color);
        const edge = 0.17 * f * k + 6;
        haloText(`F${i === 0 ? '₁' : '₂'} = ${fmt.num(F, 0)} N`, sx - kid.facing * edge, sy - 0.12 * f * k, kid.color, size, kid.facing > 0 ? 'right' : 'left');
      });
      axisMark(C[0], C[1], false);
      dimension(0, -p.sl * Math.cos(psi), -0.4, `a₁ = ${fmt.num(p.sl, 2)} m`, theme.series[0]!, [SEESAW_H, seats[0]![1]]);
      dimension(0, p.sk * Math.cos(psi), -0.4, `a₂ = ${fmt.num(p.sk, 2)} m`, theme.series[1]!, [SEESAW_H, seats[1]![1]]);
    }

    function drawDaily(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const w = surface.width;
      const top = dailyRegion(w, surface.height).y;
      gx.fillStyle = theme.dark ? '#162238' : '#e6f0fb';
      gx.fillRect(0, 0, w, top);
      dplot.begin();
      dailyBackground();
      const o = obj();
      if (o === 'barrow') drawBarrow();
      else if (o === 'opener') drawOpener();
      else if (o === 'nut') drawNut();
      else drawSeesaw();
      dplot.end();
      // Kopfzeile: Gegenstand und Art des Hebels
      const small = narrow();
      const size = small ? 11.5 : 13;
      const kind = o === 'seesaw' ? 'two' : 'one';
      const wName = pill(10, 10, ctx.t(o), theme.text, 'left', size);
      if (!small) pill(10 + wName + 8, 10, ctx.t(kind), theme.muted, 'left', 12);
      if (o === 'seesaw') {
        const M1 = p.sm * G * p.sl;
        const M2 = p.sn * G * p.sk;
        const eq = Math.abs(M1 - M2) < 0.25;
        const label = `${fmt.num(M1, 0)} N·m ${eq ? '=' : M1 > M2 ? '>' : '<'} ${fmt.num(M2, 0)} N·m`;
        pill(w - 10, 10, label, eq ? theme.series[2]! : theme.series[3]!, 'right', small ? 11 : size);
      } else {
        const { aL, aK } = dailyLever();
        const ratio = aK / aL;
        const label = small ? `F_K = F_L : ${fmt.num(ratio, 1)}` : `F_K = F_L · a_L / a_K = F_L : ${fmt.num(ratio, 1)}`;
        pill(w - 10, 10, label, theme.series[2]!, 'right', small ? 11 : size);
      }
    }

    /* ---------- Bewegung ---------- */
    function stepLab(dt: number): boolean {
      target = restAngle(lever());
      if (reduced) {
        motion = { phi: target, omega: 0 };
        return false;
      }
      const lv = lever();
      stepper.run(dt, (h) => {
        motion = stepMotion(lv, motion, h);
      });
      if (Math.abs(motion.phi - target) < 2e-4 && Math.abs(motion.omega) < 2e-3) {
        motion = { phi: target, omega: 0 };
        return false;
      }
      return true;
    }

    function seesawTarget(): number {
      const net = p.sm * G * p.sl - p.sn * G * p.sk;
      if (Math.abs(net) < 0.25) return 0;
      return net > 0 ? SEESAW_MAX : -SEESAW_MAX;
    }

    function stepSeesaw(dt: number): boolean {
      const tgt = seesawTarget();
      if (reduced) {
        seesaw = { phi: tgt, omega: 0 };
        return false;
      }
      let { phi, omega } = seesaw;
      const steps = Math.ceil(dt / 0.004);
      for (let i = 0; i < steps; i++) {
        const h = dt / steps;
        const acc = tgt === 0 ? -18 * phi - 5 * omega : Math.sign(tgt) * 2.2 - 1.5 * omega;
        omega += acc * h;
        phi += omega * h;
        if (Math.abs(phi) > SEESAW_MAX) {
          phi = Math.sign(phi) * SEESAW_MAX;
          omega = -omega * 0.25;
        }
      }
      seesaw = { phi, omega };
      if (Math.abs(phi - tgt) < 3e-4 && Math.abs(omega) < 3e-3) {
        seesaw = { phi: tgt, omega: 0 };
        return false;
      }
      return true;
    }

    return {
      update(changed, source) {
        if (source === 'init') {
          motion = { phi: restAngle(lever()), omega: 0 };
          seesaw = { phi: seesawTarget(), omega: 0 };
        }
        if (changed.has('mode') || changed.has('obj')) {
          lifted = false;
          liftTween.finish();
          if (changed.has('obj')) seesaw = { phi: seesawTarget(), omega: 0 };
        }
        if (source !== 'sim' && (changed.has('bl') || changed.has('bk') || changed.has('ok') || changed.has('nl') || changed.has('nk'))) {
          lifted = false;
          liftTween.finish();
        }
        target = restAngle(lever());
        lastFrame = performance.now();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'clear') ctx.set({ n1: 0, n2: 0, km: false });
        else if (id === 'lift') {
          lifted = !lifted;
          liftTween.play();
          updateReadouts();
        }
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        let busy = false;
        surface.begin();
        if (mode() === 'lab') {
          busy = stepLab(dt);
          drawLab();
          if (performance.now() < hintUntil) busy = true;
        } else {
          if (obj() === 'seesaw') busy = stepSeesaw(dt);
          dplot.resize();
          drawDaily();
          if (liftTween.running) busy = true;
        }
        if (busy || drag) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
