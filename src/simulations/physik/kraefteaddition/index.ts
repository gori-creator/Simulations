import { defineSimulation, ease, measureSubText, Plot, roundRect, scaledSprite, subText, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { angleBetween, decompose, G, resultant, resultantMagnitude, ropeForce, toVec, type Force, type Vec } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'add' | 'split' | 'lamp';
type Pt = [number, number];

const MAX_F = 10;
/** Messbereich der Federwaagen in N. */
const SCALE_MAX = 100;
const NO_REGION: Rect = { x: 0, y: 0, w: 0, h: 0 };
/**
 * Lage im Foto `lampe.webp` (267 × 447 px): Das Foto wird unterhalb der
 * Kabelstummel abgeschnitten (`top`), die Seile greifen innen oben an den
 * beiden Ösen an (`eyeX` = Abstand von der Mitte, `eyeY`), `bulbY` = Glühlampe.
 */
const LAMP_IMG = { w: 267, h: 447, top: 91, cx: 132.5, eyeX: 31.5, eyeY: 97, bulbY: 280 };
/**
 * T-Shirt `t-shirt.webp` (1220 × 1132 px): Mitte und Abstand der beiden
 * Wäscheklammern (bei x ≈ 290 und 940, Oberkante y ≈ 5) – die Klammern sitzen
 * auf der Leine.
 */
const SHIRT_IMG = { w: 1220, h: 1132, cx: 615, pegX: 325, pegY: 5 };
/**
 * Kraftmesser-Foto `kraftmesser.webp` (1600 × 170 px, Ring links, Haken rechts):
 * Ringmitte, Rohrdurchmesser und Schnittstellen. Gezeichnet wird nur die Hülse
 * mit Ring (die Skalenstange zeichnet die Simulation); gestaucht wird allein
 * das gleichförmige Rohrstück zwischen `capEnd` und `tubeCut`.
 */
const METER_IMG = { h: 170, cy: 85, ringCx: 86, tube: 155, capEnd: 330, tubeCut: 1350, tubeEnd: 1398 };
/** Tischkante `tischkante.webp` (2172 × 271 px, nahtlos kachelbar, oben die Kante der Platte). */
const TABLE_IMG = { w: 2172, h: 271 };

type Source = CanvasImageSource & { width: number; height: number };

/**
 * Kraftmesser-Hülse als Foto in lokalen Koordinaten: Rohrende bei x0,
 * Ringmitte bei x1 (x1 > x0), Rohrmitte auf y = 0, Rohrdurchmesser `width`.
 */
function drawMeterPhoto(g: CanvasRenderingContext2D, img: Source, x0: number, x1: number, width: number, dpr: number): void {
  const M = METER_IMG;
  const s = width / M.tube;
  const H = M.h * s;
  const y = -M.cy * s;
  const ringPart = (M.capEnd - M.ringCx) * s;
  const endW = (M.tubeEnd - M.tubeCut) * s;
  const mid = Math.max(1, x1 - ringPart - (x0 + endW));
  const piece = (cx: number, cw: number, x: number, w: number) =>
    g.drawImage(scaledSprite(img, w, H, dpr, { flipX: true, crop: { x: cx, y: 0, w: cw, h: M.h } }), x, y, w, H);
  piece(M.tubeCut, M.tubeEnd - M.tubeCut, x0, endW + 0.5);
  piece(M.capEnd, M.tubeCut - M.capEnd, x0 + endW, mid + 0.5);
  piece(0, M.capEnd, x1 - ringPart, M.capEnd * s);
}

const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
/** Teilfortschritt einer Animationsphase von a bis b. */
const phase = (t: number, a: number, b: number) => ease.inOutCubic(clamp01((t - a) / (b - a)));
/** Winkel auf „schöne“ Werte einrasten (Vielfache von 15°). */
function snapAngle(d: number): number {
  const r = Math.round(d);
  const s = Math.round(d / 15) * 15;
  const out = Math.abs(d - s) < 3 ? s : r;
  return out <= -180 ? 180 : out;
}
function snapForce(F: number): number {
  const s = Math.round(F * 2) / 2;
  return Math.abs(F - s) < 0.12 ? s : F;
}

/**
 * Kräfte addieren und zerlegen: Kraftpfeile mit gemeinsamem Angriffspunkt
 * ziehen, die Resultierende mit dem Kräfteparallelogramm oder dem
 * Kräftepolygon konstruieren, eine Kraft in zwei Richtungen zerlegen und an
 * einer Lampe bzw. Wäscheleine sehen, wie die Seilkraft bei flachem Seil
 * stark ansteigt.
 */
export default defineSimulation({
  id: 'kraefteaddition',
  dragHint: true,
  layout: { aspect: 1.45, aspectNarrow: 0.82 },
  images: { lamp: 'lampe.webp', shirt: 't-shirt.webp', meter: 'kraftmesser.webp', table: 'tischkante.webp' },
  groups: [
    { id: 'f3', label: L('Dritte Kraft', 'Third force') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Setup'),
      options: [
        { value: 'add', label: L('Addieren', 'Add') },
        { value: 'split', label: L('Zerlegen', 'Resolve') },
        { value: 'lamp', label: L('Lampe an zwei Seilen', 'Lamp on two ropes') },
      ],
      default: 'add',
    },
    { key: 'f1', type: 'number', label: L('Betrag F₁', 'Magnitude F₁'), min: 0, max: MAX_F, step: 0.1, default: 4, unit: 'N', visibleIf: (v) => v.mode === 'add' },
    { key: 'w1', type: 'number', label: L('Richtung von F₁', 'Direction of F₁'), min: -180, max: 180, step: 1, default: 0, unit: '°', visibleIf: (v) => v.mode === 'add' },
    { key: 'f2', type: 'number', label: L('Betrag F₂', 'Magnitude F₂'), min: 0, max: MAX_F, step: 0.1, default: 3, unit: 'N', visibleIf: (v) => v.mode === 'add' },
    { key: 'w2', type: 'number', label: L('Richtung von F₂', 'Direction of F₂'), min: -180, max: 180, step: 1, default: 90, unit: '°', visibleIf: (v) => v.mode === 'add' },
    { key: 'n3', type: 'boolean', group: 'f3', label: L('Dritte Kraft F₃', 'Third force F₃'), default: false, visibleIf: (v) => v.mode === 'add' },
    { key: 'f3', type: 'number', group: 'f3', label: L('Betrag F₃', 'Magnitude F₃'), min: 0, max: MAX_F, step: 0.1, default: 2, unit: 'N', visibleIf: (v) => v.mode === 'add' && v.n3 === true },
    { key: 'w3', type: 'number', group: 'f3', label: L('Richtung von F₃', 'Direction of F₃'), min: -180, max: 180, step: 1, default: 150, unit: '°', visibleIf: (v) => v.mode === 'add' && v.n3 === true },
    { key: 'f', type: 'number', label: L('Betrag F', 'Magnitude F'), min: 0.5, max: MAX_F, step: 0.1, default: 5, unit: 'N', visibleIf: (v) => v.mode === 'split' },
    { key: 'w', type: 'number', label: L('Richtung von F', 'Direction of F'), min: -180, max: 180, step: 1, default: 40, unit: '°', visibleIf: (v) => v.mode === 'split' },
    { key: 'd1', type: 'number', label: L('Richtung 1', 'Direction 1'), min: -180, max: 180, step: 1, default: 0, unit: '°', visibleIf: (v) => v.mode === 'split' },
    { key: 'd2', type: 'number', label: L('Richtung 2', 'Direction 2'), min: -180, max: 180, step: 1, default: 90, unit: '°', visibleIf: (v) => v.mode === 'split' },
    {
      key: 'obj',
      type: 'choice',
      label: L('Gegenstand', 'Object'),
      options: [
        { value: 'lamp', label: L('Lampe', 'Lamp') },
        { value: 'line', label: L('Wäscheleine', 'Clothesline') },
      ],
      default: 'lamp',
      visibleIf: (v) => v.mode === 'lamp',
    },
    { key: 'm', type: 'number', label: L('Masse m', 'Mass m'), min: 0.5, max: 10, step: 0.1, default: 2, unit: 'kg', visibleIf: (v) => v.mode === 'lamp' },
    {
      key: 'a',
      type: 'number',
      label: L('Seilwinkel α gegen die Waagerechte', 'Rope angle α to the horizontal'),
      help: L('Oder: die Last nach oben oder unten ziehen.', 'Or drag the load up or down.'),
      min: 2,
      max: 85,
      step: 1,
      default: 30,
      unit: '°',
      visibleIf: (v) => v.mode === 'lamp',
    },
    {
      key: 'cons',
      type: 'choice',
      group: 'view',
      label: L('Konstruktion', 'Construction'),
      options: [
        { value: 'para', label: L('Kräfteparallelogramm', 'Parallelogram') },
        { value: 'poly', label: L('Aneinanderhängen', 'Head to tail') },
      ],
      default: 'para',
      visibleIf: (v) => v.mode === 'add',
    },
    { key: 'res', type: 'boolean', group: 'view', label: L('Ergebnis zeigen', 'Show the result'), default: true, visibleIf: (v) => v.mode !== 'lamp' },
    { key: 'eq', type: 'boolean', group: 'view', label: L('Gegenkraft (Gleichgewicht)', 'Balancing force (equilibrium)'), default: false, visibleIf: (v) => v.mode === 'add' },
    { key: 'vals', type: 'boolean', group: 'view', label: L('Beträge anzeigen (Pfeile und Federwaagen)', 'Show magnitudes (arrows and spring scales)'), default: true },
  ],
  actions: [
    { id: 'build', label: L('Konstruieren', 'Construct'), primary: true, visibleIf: (v) => v.mode === 'add' },
    { id: 'split', label: L('Zerlegen', 'Resolve'), primary: true, visibleIf: (v) => v.mode === 'split' },
  ],
  readouts: [
    { key: 'res', label: L('Resultierende', 'Resultant'), spoiler: true },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'sum', label: L('Vergleich', 'Comparison'), spoiler: true },
    { key: 'parts', label: L('Komponenten', 'Components'), spoiler: true },
    { key: 'fg', label: L('Gewichtskraft', 'Weight') },
    { key: 'rope', label: L('Seilkraft', 'Rope force'), spoiler: true },
    { key: 'ratio', label: L('Vergleich', 'Comparison'), spoiler: true },
  ],
  resultsParam: 'res',
  presets: [
    { id: 'start', label: L('3 N und 4 N im rechten Winkel', '3 N and 4 N at right angles'), values: {} },
    { id: 'poly', label: L('Drei Kräfte aneinanderhängen', 'Three forces head to tail'), values: { n3: true, cons: 'poly' } },
    { id: 'eq', label: L('Drei Kräfte im Gleichgewicht', 'Three forces in equilibrium'), values: { f1: 4, w1: 90, f2: 4, w2: -30, n3: true, f3: 4, w3: -150, cons: 'poly' } },
    { id: 'split', label: L('Kraft zerlegen', 'Resolving a force'), values: { mode: 'split' } },
    { id: 'lamp', label: L('Lampe an zwei Seilen', 'Lamp on two ropes'), values: { mode: 'lamp' } },
    { id: 'line', label: L('Straff gespannte Wäscheleine', 'Tight clothesline'), values: { mode: 'lamp', obj: 'line', m: 1.5, a: 5 } },
  ],
  strings: {
    de: {
      canvas: 'Kraftpfeile mit gemeinsamem Angriffspunkt, Kräfteparallelogramm und Resultierende bzw. eine Lampe an zwei Seilen mit Federwaagen',
      grid: '1 Kästchen ≙ {s} N',
      para: 'Kräfteparallelogramm',
      poly: 'Kräfte aneinanderhängen',
      splitTitle: 'Kraft in zwei Richtungen zerlegen',
      parallel: 'Die Richtungen sind parallel – so lässt sich die Kraft nicht zerlegen.',
      counter: 'Gegenkraft',
      zero: 'F_R = 0 N: Die Kräfte sind im Gleichgewicht.',
      zeroPoly: 'F_R = 0 N: Das Krafteck ist geschlossen – Gleichgewicht.',
      dir1: 'Richtung 1',
      dir2: 'Richtung 2',
      axis: 'α in °',
      forceAxis: 'F in N',
      rope: 'Seilkraft F_S',
      half: 'F_G / 2',
      equalFG: 'F_S = F_G bei 30°',
      over: 'Messbereich überschritten!',
      resText: 'F_R = {F} N in Richtung {d}°',
      resZero: 'F_R = 0 N – die Kräfte heben sich auf.',
      calcRight: 'Rechter Winkel: F_R = √(F₁² + F₂²) = √({a}² + {b}²) N ≈ {F} N',
      calcGeneral: 'F_R² = F₁² + F₂² + 2 · F₁ · F₂ · cos γ mit γ = {g}° → F_R ≈ {F} N',
      calcSame: 'Gleiche Richtung: F_R = F₁ + F₂ = {F} N',
      calcOpp: 'Entgegengesetzt: F_R = |F₁ − F₂| = {F} N',
      calcComp: 'Komponenten addieren: F_R,x = {x} N, F_R,y = {y} N → F_R = √(F_R,x² + F_R,y²) ≈ {F} N',
      sumText: 'Beträge einfach addiert: {s} N. Die Resultierende ist {F} N groß – Kräfte addiert man wie Pfeile, nicht wie Zahlen.',
      sumSame: 'Nur bei gleicher Richtung ist F_R gleich der Summe der Beträge ({s} N).',
      partsText: 'F₁ = {a} N entlang {d1}° · F₂ = {b} N entlang {d2}°',
      partsRight: 'Senkrechte Richtungen: F₁ = F · cos {g}° = {a} N, F₂ = F · sin {g}° = {b} N',
      partsSum: 'Zusammen {s} N – die Komponenten können zusammen mehr als F = {F} N ergeben.',
      partsSumSmall: 'Zusammen {s} N.',
      fgText: 'F_G = m · g = {m} kg · 9,81 N/kg = {F} N',
      ropeText: 'F_S = F_G / (2 · sin α) = {FG} N / (2 · sin {a}°) ≈ {F} N',
      ratioText: 'Jedes Seil zieht mit dem {k}-Fachen der Gewichtskraft.',
      ratioOne: 'Jedes Seil zieht genau mit der Gewichtskraft.',
      ratioSteep: 'Bei steilen Seilen trägt jedes Seil fast die Hälfte der Gewichtskraft.',
      ratioFlat: 'Je flacher die Seile, desto größer die Seilkraft – ein Seil mit Last lässt sich nie ganz gerade spannen.',
      lampTitle: 'Lampe an zwei Seilen',
      lineTitle: 'Wäscheleine',
      dragLoad: 'ziehen',
    },
    en: {
      canvas: 'Force arrows acting at one point, force parallelogram and resultant, or a lamp hanging on two ropes with spring balances',
      grid: '1 square ≙ {s} N',
      para: 'Parallelogram of forces',
      poly: 'Forces head to tail',
      splitTitle: 'Resolving a force into two directions',
      parallel: 'The directions are parallel – the force cannot be resolved this way.',
      counter: 'balancing force',
      zero: 'F_R = 0 N: the forces are in equilibrium.',
      zeroPoly: 'F_R = 0 N: the polygon of forces is closed – equilibrium.',
      dir1: 'direction 1',
      dir2: 'direction 2',
      axis: 'α in °',
      forceAxis: 'F in N',
      rope: 'rope force F_S',
      half: 'F_G / 2',
      equalFG: 'F_S = F_G at 30°',
      over: 'Out of range!',
      resText: 'F_R = {F} N in direction {d}°',
      resZero: 'F_R = 0 N – the forces cancel out.',
      calcRight: 'Right angle: F_R = √(F₁² + F₂²) = √({a}² + {b}²) N ≈ {F} N',
      calcGeneral: 'F_R² = F₁² + F₂² + 2 · F₁ · F₂ · cos γ with γ = {g}° → F_R ≈ {F} N',
      calcSame: 'Same direction: F_R = F₁ + F₂ = {F} N',
      calcOpp: 'Opposite directions: F_R = |F₁ − F₂| = {F} N',
      calcComp: 'Adding components: F_R,x = {x} N, F_R,y = {y} N → F_R = √(F_R,x² + F_R,y²) ≈ {F} N',
      sumText: 'Simply adding the magnitudes gives {s} N, but the resultant is {F} N – forces add like arrows, not like numbers.',
      sumSame: 'Only for the same direction is F_R equal to the sum of the magnitudes ({s} N).',
      partsText: 'F₁ = {a} N along {d1}° · F₂ = {b} N along {d2}°',
      partsRight: 'Perpendicular directions: F₁ = F · cos {g}° = {a} N, F₂ = F · sin {g}° = {b} N',
      partsSum: 'Together {s} N – the components can add up to more than F = {F} N.',
      partsSumSmall: 'Together {s} N.',
      fgText: 'F_G = m · g = {m} kg · 9.81 N/kg = {F} N',
      ropeText: 'F_S = F_G / (2 · sin α) = {FG} N / (2 · sin {a}°) ≈ {F} N',
      ratioText: 'Each rope pulls with {k} times the weight.',
      ratioOne: 'Each rope pulls with exactly the weight.',
      ratioSteep: 'With steep ropes each rope carries almost half of the weight.',
      ratioFlat: 'The flatter the ropes, the larger the rope force – a rope carrying a load can never be pulled completely straight.',
      lampTitle: 'Lamp on two ropes',
      lineTitle: 'Clothesline',
      dragLoad: 'drag',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    // Platzhalter einsetzen; zwischen Zahl und Einheit ein geschütztes Leerzeichen (kein Zeilenumbruch in „5,0 N“)
    const tr = (key: string, vars: Record<string, string>) =>
      ctx
        .t(key)
        .replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '')
        .replace(/(\d) (?=(?:N\/kg|N|kg)(?![\p{L}]))/gu, '$1\u00a0');
    const subs = (t: string) => ({ html: t.replace(/([F])_([A-Za-z]+(?:,[xy])?)/g, '<var>$1</var><sub>$2</sub>') });
    const mode = () => p.mode as Mode;
    const narrow = () => surface.width < 640;

    function lampRegions(w: number, h: number): { scene: Rect; chart: Rect } {
      const sh = Math.round(h * (w >= 640 ? 0.64 : 0.6));
      return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 8, w, h: h - sh - 8 } };
    }

    /**
     * Lage der Last in der Szene: Bis 85 % der größten Tiefe bleiben
     * die Aufhängepunkte fest; bei steileren Seilen rücken sie zusammen.
     * So stimmt der gezeichnete Winkel immer mit α überein.
     */
    function lampLayout(alpha: number, Wfull: number, maxDepth: number): { W: number; depth: number } {
      const t = Math.tan((alpha * Math.PI) / 180);
      const d1 = 0.85 * maxDepth;
      const aStar = (Math.atan2(d1, Wfull) * 180) / Math.PI;
      if (alpha <= aStar) return { W: Wfull, depth: Wfull * t };
      const depth = d1 + ((maxDepth - d1) * (alpha - aStar)) / Math.max(1e-6, 85 - aStar);
      return { W: depth / t, depth };
    }

    function alphaFromDepth(d: number, Wfull: number, maxDepth: number): number {
      const d1 = 0.85 * maxDepth;
      const aStar = (Math.atan2(d1, Wfull) * 180) / Math.PI;
      if (d <= d1) return (Math.atan2(Math.max(0.5, d), Wfull) * 180) / Math.PI;
      return aStar + ((Math.min(d, maxDepth) - d1) / (maxDepth - d1)) * (85 - aStar);
    }

    const vp = new Plot(surface, {
      x: [-6, 6],
      y: [-4, 4],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'lamp' ? NO_REGION : { x: 0, y: 0, w, h }),
    });
    /** Unsichtbares Koordinatensystem über der Lampenszene (Welt = Pixel, y gespiegelt) für den Griff an der Last. */
    const scene = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'lamp' ? lampRegions(w, h).scene : NO_REGION),
    });
    const chart = new Plot(surface, {
      x: [0, 90],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'lamp' ? lampRegions(w, h).chart : NO_REGION),
      xAxis: { label: ctx.t('axis') },
      yAxis: { label: ctx.t('forceAxis') },
    });

    /* ---------- Zustand ---------- */
    const forces = (): Force[] => {
      const list: Force[] = [
        { F: p.f1, deg: p.w1 },
        { F: p.f2, deg: p.w2 },
      ];
      if (p.n3) list.push({ F: p.f3, deg: p.w3 });
      return list;
    };
    const build = new Tween(1700, ease.linear);
    const splitT = new Tween(1300, ease.linear);
    let view = { cx: 0, cy: 0, s: 6 };
    let lastDrag = 0;
    let lastFrame = performance.now();
    let viewInit = false;
    /** Geometrie der Lampenszene (für den Griff). */
    let lampGeo: { cx: number; ay: number; maxDepth: number; W: number } | null = null;

    /* ---------- Ergebnisse ---------- */
    const N = (v: number) => fmt.num(v, 1);

    function updateReadouts(): void {
      const m = mode();
      for (const key of ['res', 'calc', 'sum', 'parts', 'fg', 'rope', 'ratio']) ctx.readout(key, null);
      if (m === 'add') {
        const list = forces();
        const R = resultant(list);
        ctx.readout('res', subs(R.F < 0.05 ? ctx.t('resZero') : tr('resText', { F: N(R.F), d: fmt.num(R.deg, 0) })));
        const sum = list.reduce((s, f) => s + f.F, 0);
        if (list.length === 2) {
          const [a, b] = list as [Force, Force];
          const g = angleBetween(a.deg, b.deg);
          let calc: string;
          if (g < 0.5) calc = tr('calcSame', { F: N(R.F) });
          else if (g > 179.5) calc = tr('calcOpp', { F: N(R.F) });
          else if (Math.abs(g - 90) < 0.5) calc = tr('calcRight', { a: N(a.F), b: N(b.F), F: N(resultantMagnitude(a.F, b.F, 90)) });
          else calc = tr('calcGeneral', { g: fmt.num(g, 0), F: N(resultantMagnitude(a.F, b.F, g)) });
          ctx.readout('calc', subs(calc));
          ctx.readout('sum', subs(g < 0.5 ? tr('sumSame', { s: N(sum) }) : tr('sumText', { s: N(sum), F: N(R.F) })));
        } else {
          ctx.readout('calc', subs(tr('calcComp', { x: N(R.x), y: N(R.y), F: N(R.F) })));
          ctx.readout('sum', subs(tr('sumText', { s: N(sum), F: N(R.F) })));
        }
      } else if (m === 'split') {
        const d = decompose({ F: p.f, deg: p.w }, p.d1, p.d2);
        if (!d) ctx.readout('parts', ctx.t('parallel'));
        else {
          const g = angleBetween(p.d1, p.d2);
          if (Math.abs(g - 90) < 0.5) {
            // spitzer Winkel zwischen F und der Geraden von Richtung 1 (dann sind cos und sin positiv)
            const g1 = angleBetween(p.w, p.d1);
            const gamma = Math.min(g1, 180 - g1);
            ctx.readout('parts', tr('partsRight', { g: fmt.num(gamma, 0), a: N(Math.abs(d.a)), b: N(Math.abs(d.b)) }));
          } else ctx.readout('parts', tr('partsText', { a: N(Math.abs(d.a)), b: N(Math.abs(d.b)), d1: fmt.num(d.a >= 0 ? p.d1 : p.d1 > 0 ? p.d1 - 180 : p.d1 + 180, 0), d2: fmt.num(d.b >= 0 ? p.d2 : p.d2 > 0 ? p.d2 - 180 : p.d2 + 180, 0) }));
          const s = Math.abs(d.a) + Math.abs(d.b);
          ctx.readout('sum', tr(s > p.f + 0.05 ? 'partsSum' : 'partsSumSmall', { s: N(s), F: N(p.f) }));
        }
      } else {
        const FG = p.m * G;
        const FS = ropeForce(FG, p.a);
        ctx.readout('fg', subs(tr('fgText', { m: fmt.num(p.m, 1), F: N(FG) })));
        ctx.readout('rope', subs(tr('ropeText', { FG: N(FG), a: fmt.num(p.a, 0), F: N(FS) })));
        const k = FS / FG;
        ctx.readout('ratio', `${Math.abs(k - 1) < 0.005 ? ctx.t('ratioOne') : tr('ratioText', { k: fmt.num(k, 2) })} ${ctx.t(p.a >= 60 ? 'ratioSteep' : 'ratioFlat')}`);
      }
    }

    /* ---------- Griffe ---------- */
    const dragged = () => {
      lastDrag = performance.now();
    };
    const addOn = () => mode() === 'add' && !ctx.locked;
    const tipHandle = (fk: 'f1' | 'f2' | 'f3', wk: 'w1' | 'w2' | 'w3', color: () => string, extra: () => boolean = () => true) =>
      vp.addHandle({
        get: () => toVec({ F: p[fk], deg: p[wk] }),
        set: (x, y) => {
          dragged();
          const F = snapForce(Math.min(MAX_F, Math.hypot(x, y)));
          const out: Record<string, number> = { [fk]: F };
          if (F > 0.05) out[wk] = snapAngle((Math.atan2(y, x) * 180) / Math.PI);
          ctx.set(out);
        },
        enabled: () => addOn() && extra(),
        color,
      });
    tipHandle('f1', 'w1', () => ctx.theme.series[0]!);
    tipHandle('f2', 'w2', () => ctx.theme.series[1]!);
    tipHandle('f3', 'w3', () => ctx.theme.series[4]!, () => p.n3);
    const splitOn = () => mode() === 'split' && !ctx.locked;
    vp.addHandle({
      get: () => toVec({ F: p.f, deg: p.w }),
      set: (x, y) => {
        dragged();
        ctx.set({ f: snapForce(Math.max(0.5, Math.min(MAX_F, Math.hypot(x, y)))), w: snapAngle((Math.atan2(y, x) * 180) / Math.PI) });
      },
      enabled: splitOn,
      color: () => ctx.theme.text,
    });
    const dirHandle = (key: 'd1' | 'd2', color: () => string) =>
      vp.addHandle({
        get: () => {
          const r = view.s * 0.62;
          const d = (p[key] * Math.PI) / 180;
          return [r * Math.cos(d), r * Math.sin(d)];
        },
        set: (x, y) => {
          dragged();
          ctx.set({ [key]: snapAngle((Math.atan2(y, x) * 180) / Math.PI) });
        },
        enabled: splitOn,
        color,
      });
    dirHandle('d1', () => ctx.theme.series[0]!);
    dirHandle('d2', () => ctx.theme.series[1]!);
    // Last an den Seilen hoch- und runterziehen
    scene.addHandle({
      get: () => {
        if (!lampGeo) return [NaN, NaN];
        const { depth } = lampLayout(p.a, lampGeo.W, lampGeo.maxDepth);
        return [lampGeo.cx, -(lampGeo.ay + depth)];
      },
      set: (_x, y) => {
        if (!lampGeo) return;
        ctx.set({ a: Math.round(alphaFromDepth(-y - lampGeo.ay, lampGeo.W, lampGeo.maxDepth)) });
      },
      axis: 'y',
      enabled: () => mode() === 'lamp' && !ctx.locked,
      color: () => ctx.theme.series[3]!,
    });
    chart.addHandle({
      get: () => [p.a, ropeForce(p.m * G, p.a)],
      set: (x) => ctx.set({ a: Math.round(x) }),
      axis: 'x',
      enabled: () => mode() === 'lamp' && !ctx.locked,
      color: () => ctx.theme.series[0]!,
    });

    /* ---------- Zeichenhilfen ---------- */
    /** Rechteck einer Beschriftung (wie `haloText`, Grundlinie Mitte) in Pixeln. */
    function textBox(label: string, x: number, y: number, size: number, align: CanvasTextAlign): Rect {
      const w = richWidth(label, size);
      const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      return { x: left - 2, y: y - size / 2 - 2, w: w + 4, h: size + 4 };
    }

    /** Rechteck einer Pille (wie `pill`) in Pixeln. */
    function pillBox(x0: number, y: number, label: string, align: 'left' | 'right' | 'center', size = 12): Rect {
      const w = richWidth(label, size) + 16;
      const left = Math.max(4, Math.min(surface.width - 4 - w, align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2));
      return { x: left, y, w, h: size + 11 };
    }

    /** Abstand eines Rechtecks zu einer Strecke (Näherung über Stützpunkte, Pixel). */
    function boxSegDist(b: Rect, s: readonly [Pt, Pt]): number {
      const n = Math.max(2, Math.ceil(Math.hypot(s[1][0] - s[0][0], s[1][1] - s[0][1]) / 3));
      let best = Infinity;
      for (let i = 0; i <= n; i++) {
        const x = s[0][0] + ((s[1][0] - s[0][0]) * i) / n;
        const y = s[0][1] + ((s[1][1] - s[0][1]) * i) / n;
        best = Math.min(best, Math.hypot(Math.max(0, b.x - x, x - b.x - b.w), Math.max(0, b.y - y, y - b.y - b.h)));
      }
      return best;
    }

    const boxesOverlap = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

    /**
     * Beschriftung an die erste freie Stelle setzen (Kandidaten in der Reihenfolge der
     * Vorliebe): keine Überlappung mit `boxes`, mindestens 3 px Abstand zu `segs`.
     * Gibt die gewählte Stelle samt Rechteck zurück (sonst die erste).
     */
    function freeLabelSpot(label: string, size: number, cands: readonly [number, number, CanvasTextAlign][], boxes: readonly Rect[], segs: readonly (readonly [Pt, Pt])[] = []): { x: number; y: number; align: CanvasTextAlign; box: Rect } {
      for (const [x, y, align] of cands) {
        const box = textBox(label, x, y, size, align);
        if (boxes.some((b) => boxesOverlap(box, b))) continue;
        if (segs.some((sg) => boxSegDist(box, sg) < 3)) continue;
        return { x, y, align, box };
      }
      const [x, y, align] = cands[0]!;
      return { x, y, align, box: textBox(label, x, y, size, align) };
    }

    function pill(x0: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): number {
      const gx = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const left = Math.max(4, Math.min(surface.width - 4 - w, align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2));
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 1;
      gx.fillStyle = theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(gx, left, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      gx.strokeStyle = withAlpha(color, 0.5);
      gx.lineWidth = 1;
      roundRect(gx, left + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      gx.stroke();
      richDraw(label, left + w / 2, y + h / 2 + 0.5, size, 'center', 'middle', null, color);
      return w;
    }

    /** Breite eines Textes mit Index („F_R“, „F_G“), siehe `measureSubText` im Kern. */
    function richWidth(str: string, size: number): number {
      return measureSubText(surface.g, str, { size, weight: 700, family: ctx.theme.font, color: '' });
    }

    /** Text mit tiefgestellten Indizes zeichnen (Kern-Helfer `subText`); `halo`: Farbe des Randes (oder null). */
    function richDraw(str: string, x: number, y: number, size: number, align: CanvasTextAlign, baseline: CanvasTextBaseline, halo: string | null, color: string): void {
      subText(surface.g, str, x, y, { size, weight: 700, family: ctx.theme.font, color, align, baseline, ...(halo ? { halo, haloWidth: 4 } : {}) });
    }

    function haloText(label: string, x: number, y: number, color: string, size: number, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle'): void {
      const tw = richWidth(label, size);
      const left = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
      x += Math.max(0, 4 - left) - Math.max(0, left + tw - (surface.width - 4));
      richDraw(label, x, y, size, align, baseline, ctx.theme.bg, color);
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width = 4, head = 15, alpha = 1): void {
      const gx = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hl = Math.min(head, len * 0.55);
      const bx = x1 - ux * hl;
      const by = y1 - uy * hl;
      gx.save();
      gx.globalAlpha = alpha;
      gx.lineCap = 'round';
      gx.lineJoin = 'round';
      for (const pass of [0, 1]) {
        const c = pass === 0 ? withAlpha(ctx.theme.bg, 0.9) : color;
        gx.strokeStyle = c;
        gx.fillStyle = c;
        gx.lineWidth = pass === 0 ? width + 3.5 : width;
        gx.beginPath();
        gx.moveTo(x0, y0);
        gx.lineTo(bx, by);
        gx.stroke();
        gx.beginPath();
        gx.moveTo(x1, y1);
        gx.lineTo(bx - uy * hl * 0.45, by + ux * hl * 0.45);
        gx.lineTo(bx + uy * hl * 0.45, by - ux * hl * 0.45);
        gx.closePath();
        gx.fill();
        if (pass === 0) gx.stroke();
      }
      gx.restore();
    }

    /** Kraftpfeil in Weltkoordinaten (N), optional nur teilweise gezeichnet. */
    function forceArrow(from: Vec, v: Vec, color: string, width = 4, alpha = 1, part = 1): void {
      if (part <= 0) return;
      const [x0, y0] = vp.toPx(from[0], from[1]);
      const [x1, y1] = vp.toPx(from[0] + v[0] * part, from[1] + v[1] * part);
      arrowPx(x0, y0, x1, y1, color, width, narrow() ? 12 : 15, alpha);
    }

    function dashedPx(a: Pt, b: Pt, color: string, width = 1.6, dash = [6, 5]): void {
      const gx = surface.g;
      gx.save();
      gx.strokeStyle = color;
      gx.lineWidth = width;
      gx.setLineDash(dash);
      gx.beginPath();
      gx.moveTo(a[0], a[1]);
      gx.lineTo(b[0], b[1]);
      gx.stroke();
      gx.restore();
    }

    function dashedWorld(a: Vec, b: Vec, color: string, part = 1): void {
      if (part <= 0) return;
      dashedPx(vp.toPx(a[0], a[1]), vp.toPx(a[0] + (b[0] - a[0]) * part, a[1] + (b[1] - a[1]) * part), color);
    }

    /** Beschriftung an der Pfeilspitze, etwas nach außen versetzt. */
    /** Lage der Beschriftung an der Pfeilspitze (Pixel, Ausrichtung, Schriftgröße). */
    function tipLabelAt(from: Vec, v: Vec): { x: number; y: number; align: CanvasTextAlign; size: number } {
      const len = Math.hypot(v[0], v[1]);
      const [px, py] = vp.toPx(from[0] + v[0], from[1] + v[1]);
      const ux = len > 1e-9 ? v[0] / len : 1;
      const uy = len > 1e-9 ? -v[1] / len : 0;
      const off = narrow() ? 16 : 20;
      const align: CanvasTextAlign = ux > 0.35 ? 'left' : ux < -0.35 ? 'right' : 'center';
      return { x: px + ux * off, y: py + uy * off, align, size: narrow() ? 11.5 : 13.5 };
    }

    function tipLabel(from: Vec, v: Vec, label: string, color: string): void {
      const t = tipLabelAt(from, v);
      haloText(label, t.x, t.y, color, t.size, t.align);
    }

    /** Beschriftung neben der Mitte eines Pfeils, auf der vom Punkt `away` abgewandten Seite. */
    function midLabel(from: Vec, v: Vec, label: string, color: string, away: Vec): void {
      const len = Math.hypot(v[0], v[1]);
      if (len < 1e-9) return;
      const mid: Vec = [from[0] + v[0] / 2, from[1] + v[1] / 2];
      let n: Vec = [-v[1] / len, v[0] / len];
      if ((mid[0] - away[0]) * n[0] + (mid[1] - away[1]) * n[1] < 0) n = [-n[0], -n[1]];
      const [px, py] = vp.toPx(mid[0], mid[1]);
      const off = narrow() ? 14 : 18;
      const align: CanvasTextAlign = n[0] > 0.35 ? 'left' : n[0] < -0.35 ? 'right' : 'center';
      haloText(label, px + n[0] * off, py - n[1] * off, color, narrow() ? 11.5 : 13.5, align);
    }

    function paper(): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const r = vp.rect;
      gx.fillStyle = theme.dark ? '#121a26' : '#fbfcfe';
      gx.fillRect(r.x, r.y, r.w, r.h);
      // Karoraster: 1 N (bei kleinem Maßstab 2 N oder 5 N)
      const k = vp.scale.x;
      const step = k >= 14 ? 1 : k >= 7 ? 2 : 5;
      const { xMin, xMax, yMin, yMax } = vp.bounds;
      gx.lineWidth = 1;
      for (const major of [false, true]) {
        gx.strokeStyle = major ? theme.grid : theme.gridMinor;
        gx.beginPath();
        const st = major ? step * 5 : step;
        for (let x = Math.ceil(xMin / st) * st; x <= xMax; x += st) {
          const px = Math.round(vp.px(x)) + 0.5;
          gx.moveTo(px, r.y);
          gx.lineTo(px, r.y + r.h);
        }
        for (let y = Math.ceil(yMin / st) * st; y <= yMax; y += st) {
          const py = Math.round(vp.py(y)) + 0.5;
          gx.moveTo(r.x, py);
          gx.lineTo(r.x + r.w, py);
        }
        gx.stroke();
      }
      pill(r.x + 10, r.y + r.h - 34, tr('grid', { s: fmt.num(step, 0) }), theme.muted, 'left', narrow() ? 10.5 : 11.5);
    }

    /** Ring als gemeinsamer Angriffspunkt. */
    function ring(): void {
      const gx = surface.g;
      const [cx, cy] = vp.toPx(0, 0);
      const r = narrow() ? 7 : 9;
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 5;
      gx.shadowOffsetY = 1.5;
      gx.strokeStyle = '#8a929e';
      gx.lineWidth = 4;
      gx.beginPath();
      gx.arc(cx, cy, r, 0, Math.PI * 2);
      gx.stroke();
      gx.restore();
      gx.strokeStyle = '#e3e7ec';
      gx.lineWidth = 1.4;
      gx.beginPath();
      gx.arc(cx, cy, r, Math.PI * 1.05, Math.PI * 1.6);
      gx.stroke();
    }

    /** Winkelbogen zwischen zwei Richtungen am Ursprung. */
    function angleArc(d1: number, d2: number, color: string, radius: number, label: string | null, avoid: number | null = null): void {
      const gx = surface.g;
      const [cx, cy] = vp.toPx(0, 0);
      let a = d1;
      let b = d2;
      let diff = (((b - a) % 360) + 360) % 360;
      if (diff > 180) {
        [a, b] = [b, a];
        diff = 360 - diff;
      }
      if (diff < 1) return;
      gx.strokeStyle = color;
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.arc(cx, cy, radius, (-a * Math.PI) / 180, (-(a + diff) * Math.PI) / 180, true);
      gx.stroke();
      if (label) {
        let midDeg = a + diff / 2;
        // nicht unter die Resultierende schreiben
        if (avoid !== null && angleBetween(midDeg, avoid) < 22) midDeg = angleBetween(a + diff * 0.2, avoid) > angleBetween(a + diff * 0.8, avoid) ? a + diff * 0.2 : a + diff * 0.8;
        const mid = (midDeg * Math.PI) / 180;
        haloText(label, cx + Math.cos(mid) * (radius + 14), cy - Math.sin(mid) * (radius + 14), color, narrow() ? 10.5 : 12);
      }
    }

    /** Sichtbaren Bereich an den Inhalt anpassen (weich, nicht während des Ziehens). */
    function fitView(points: Vec[], dt: number): boolean {
      let xMin = 0;
      let xMax = 0;
      let yMin = 0;
      let yMax = 0;
      for (const [x, y] of points) {
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
      }
      const r = vp.rect;
      const aspect = r.w / Math.max(1, r.h);
      const cx = (xMin + xMax) / 2;
      const cy = (yMin + yMax) / 2;
      const pad = 1.1;
      const s = Math.max(2.6, (xMax - xMin) / 2 / aspect + pad * 1.2, (yMax - yMin) / 2 + pad);
      const target = { cx, cy: cy - s * 0.04, s: s * 1.08 };
      if (!viewInit) {
        view = target;
        viewInit = true;
      } else if (performance.now() - lastDrag > 350) {
        const k = Math.min(1, dt * 5);
        view = { cx: view.cx + (target.cx - view.cx) * k, cy: view.cy + (target.cy - view.cy) * k, s: view.s + (target.s - view.s) * k };
        if (Math.abs(view.s - target.s) < 0.003 && Math.hypot(view.cx - target.cx, view.cy - target.cy) < 0.003) view = target;
      }
      vp.setRange([view.cx - view.s * aspect, view.cx + view.s * aspect], [view.cy - view.s, view.cy + view.s]);
      return view !== target;
    }

    /* ---------- Addieren ---------- */
    function drawAdd(dt: number): boolean {
      const theme = ctx.theme;
      const list = forces();
      const vecs = list.map(toVec);
      const colors = [theme.series[0]!, theme.series[1]!, theme.series[4]!];
      const names = ['F₁', 'F₂', 'F₃'];
      const R = resultant(list);
      const Rv: Vec = [R.x, R.y];
      const poly = p.cons === 'poly';
      const anim = build.running;
      const t = anim ? build.t : 1;
      const showRes = p.res || anim;
      // Punkte für den Ausschnitt
      const pts: Vec[] = [[0, 0], ...vecs, Rv];
      let chain: Vec = [0, 0];
      for (const v of vecs) {
        chain = [chain[0] + v[0], chain[1] + v[1]];
        pts.push(chain);
      }
      if (vecs.length === 3) pts.push([vecs[0]![0] + vecs[1]![0], vecs[0]![1] + vecs[1]![1]]);
      if (p.eq && !poly) pts.push([-R.x, -R.y]);
      const moving = fitView(pts, dt);
      vp.begin();
      paper();
      const n = vecs.length;
      // Konstruktion
      if (showRes && !poly) {
        // Kräfteparallelogramm (bei drei Kräften zuerst F₁ + F₂, dann + F₃)
        const steps: { a: Vec; b: Vec; t0: number; t1: number; t2: number; last: boolean }[] =
          n === 2
            ? [{ a: vecs[0]!, b: vecs[1]!, t0: 0, t1: 0.5, t2: 1, last: true }]
            : [
                { a: vecs[0]!, b: vecs[1]!, t0: 0, t1: 0.28, t2: 0.45, last: false },
                { a: [vecs[0]![0] + vecs[1]![0], vecs[0]![1] + vecs[1]![1]], b: vecs[2]!, t0: 0.45, t1: 0.73, t2: 1, last: true },
              ];
        for (const st of steps) {
          const sum: Vec = [st.a[0] + st.b[0], st.a[1] + st.b[1]];
          const k1 = phase(t, st.t0, st.t1);
          if (k1 >= 1) {
            vp.polygon([[0, 0], st.a, sum, st.b], { fill: withAlpha(theme.series[3]!, st.last ? 0.09 : 0.05) });
          }
          dashedWorld(st.a, sum, withAlpha(theme.text, 0.55), k1);
          dashedWorld(st.b, sum, withAlpha(theme.text, 0.55), k1);
          const k2 = phase(t, st.t1, st.t2);
          if (!st.last) forceArrow([0, 0], sum, withAlpha(theme.text, 0.55), 2.2, 1, k2);
        }
      }
      // Einzelkräfte (beim Aneinanderhängen blass am Ursprung, kräftig in der Kette)
      let tail: Vec = [0, 0];
      const lastT = n === 2 ? [0, 0.55] : [0, 0.35, 0.7];
      // Schwerpunkt des Kraftecks: Beschriftungen kommen nach außen
      const centroid: Vec = [pts.reduce((sx, q) => sx + q[0], 0) / pts.length, pts.reduce((sy, q) => sy + q[1], 0) / pts.length];
      vecs.forEach((v, i) => {
        if (list[i]!.F < 1e-9) {
          tail = [tail[0] + v[0], tail[1] + v[1]];
          return;
        }
        const label = `${names[i]} = ${N(list[i]!.F)} N`;
        if (poly && showRes && i > 0) {
          forceArrow([0, 0], v, colors[i]!, 3, 0.28);
          const k = phase(t, lastT[i - 1]!, lastT[i]!);
          const from: Vec = [tail[0] * k, tail[1] * k];
          forceArrow(from, v, colors[i]!, 4);
          if (k >= 1 && p.vals) midLabel(from, v, label, colors[i]!, centroid);
        } else {
          forceArrow([0, 0], v, colors[i]!, 4);
          if (p.vals) {
            if (poly && showRes) midLabel([0, 0], v, label, colors[i]!, centroid);
            else tipLabel([0, 0], v, label, colors[i]!);
          }
        }
        tail = [tail[0] + v[0], tail[1] + v[1]];
      });
      if (!poly && n === 2 && list[0]!.F > 0 && list[1]!.F > 0) {
        const g = angleBetween(p.w1, p.w2);
        if (g > 1 && g < 179) angleArc(p.w1, p.w2, theme.muted, narrow() ? 26 : 34, `γ = ${fmt.num(g, 0)}°`, showRes ? R.deg : null);
      }
      // Resultierende
      const kR = phase(t, n === 2 ? (poly ? 0.55 : 0.5) : poly ? 0.7 : 0.73, 1);
      // Beim Aneinanderhängen mit Gegenkraft schließt diese das Krafteck – F_R läge genau darunter.
      const closed = poly && p.eq && !anim;
      if (showRes && R.F >= 0.05 && !closed) {
        forceArrow([0, 0], Rv, theme.series[3]!, 5, 1, kR);
        if (kR >= 1 && p.vals) {
          if (poly) midLabel([0, 0], Rv, `F_R = ${N(R.F)} N`, theme.series[3]!, centroid);
          else tipLabel([0, 0], Rv, `F_R = ${N(R.F)} N`, theme.series[3]!);
        }
      }
      // Gegenkraft: hält den Ring im Gleichgewicht, schließt das Krafteck
      if (p.eq && R.F >= 0.05) {
        const v: Vec = [-R.x, -R.y];
        if (closed) {
          forceArrow([R.x, R.y], v, theme.series[2]!, 4);
          if (p.vals) midLabel([R.x, R.y], v, `${ctx.t('counter')} ${N(R.F)} N`, theme.series[2]!, centroid);
        } else {
          forceArrow([0, 0], v, theme.series[2]!, 4);
          if (p.vals) tipLabel([0, 0], v, `${ctx.t('counter')} ${N(R.F)} N`, theme.series[2]!);
        }
      }
      ring();
      vp.end();
      pill(10, 10, ctx.t(poly ? 'poly' : 'para'), theme.text, 'left', narrow() ? 11.5 : 12.5);
      if (showRes && !anim && R.F < 0.05 && list.some((f) => f.F > 0)) {
        const r = vp.rect;
        pill(r.x + r.w / 2, r.y + r.h - (narrow() ? 64 : 46), ctx.t(poly ? 'zeroPoly' : 'zero'), theme.series[2]!, 'center', narrow() ? 10.5 : 12);
      }
      return moving || anim;
    }

    /* ---------- Zerlegen ---------- */
    function drawSplit(dt: number): boolean {
      const theme = ctx.theme;
      const F: Vec = toVec({ F: p.f, deg: p.w });
      const d = decompose({ F: p.f, deg: p.w }, p.d1, p.d2);
      const e1: Vec = [Math.cos((p.d1 * Math.PI) / 180), Math.sin((p.d1 * Math.PI) / 180)];
      const e2: Vec = [Math.cos((p.d2 * Math.PI) / 180), Math.sin((p.d2 * Math.PI) / 180)];
      const A: Vec = d ? [e1[0] * d.a, e1[1] * d.a] : [0, 0];
      const B: Vec = d ? [e2[0] * d.b, e2[1] * d.b] : [0, 0];
      const moving = fitView([[0, 0], F, A, B, [e1[0] * 2.5, e1[1] * 2.5], [e2[0] * 2.5, e2[1] * 2.5]], dt);
      vp.begin();
      paper();
      const anim = splitT.running;
      const t = anim ? splitT.t : 1;
      const show = p.res || anim;
      // Richtungsgeraden durch den Angriffspunkt
      const { xMin, xMax, yMin, yMax } = vp.bounds;
      const reach = Math.hypot(xMax - xMin, yMax - yMin);
      const c1 = theme.series[0]!;
      const c2 = theme.series[1]!;
      // Beschriftungen an den Pfeilspitzen (Komponenten und F) vorab bestimmen: Die Namen der
      // Richtungen weichen ihnen aus, wenn eine Spitze am Richtungsgriff liegt
      const labelsShown = d !== null && show && phase(t, 0.5, 1) >= 1 && p.vals;
      const tips: { v: Vec; label: string }[] = [];
      if (labelsShown && d) {
        if (Math.abs(d.a) > 0.05) tips.push({ v: A, label: `F₁ = ${N(Math.abs(d.a))} N` });
        if (Math.abs(d.b) > 0.05) tips.push({ v: B, label: `F₂ = ${N(Math.abs(d.b))} N` });
      }
      if (p.vals) tips.push({ v: F, label: `F = ${N(p.f)} N` });
      const taken: Rect[] = tips.map(({ v, label }) => {
        const at = tipLabelAt([0, 0], v);
        return textBox(label, at.x, at.y, at.size, at.align);
      });
      const o = vp.toPx(0, 0);
      const arrowSegs: [Pt, Pt][] = [F, A, B].map((v) => [o, vp.toPx(v[0], v[1])]);
      const dsize = narrow() ? 10.5 : 11.5;
      for (const [e, c, key] of [
        [e1, c1, 'dir1'],
        [e2, c2, 'dir2'],
      ] as [Vec, string, string][]) {
        dashedPx(vp.toPx(-e[0] * reach, -e[1] * reach), vp.toPx(e[0] * reach, e[1] * reach), withAlpha(c, 0.55), 1.4, [2, 5]);
        const r = view.s * 0.62;
        const [hx, hy] = vp.toPx(e[0] * r, e[1] * r);
        // Senkrechte zur Richtung in Pixeln (Richtung in Pixeln: (e₀, −e₁)), zuerst die obere Seite
        const n2: Pt = e[0] <= 0 ? [e[1], e[0]] : [-e[1], -e[0]];
        const spot = freeLabelSpot(
          ctx.t(key),
          dsize,
          [
            [hx + e[0] * 14, hy - e[1] * 14 - 12, 'center'],
            [hx + e[0] * 14, hy - e[1] * 14 + 14, 'center'],
            [hx + n2[0] * 22, hy + n2[1] * 22, 'center'],
            [hx - n2[0] * 22, hy - n2[1] * 22, 'center'],
            [hx - e[0] * 40, hy + e[1] * 40 - 12, 'center'],
            [hx + e[0] * 50, hy - e[1] * 50 - 12, 'center'],
          ],
          taken,
          arrowSegs,
        );
        haloText(ctx.t(key), spot.x, spot.y, c, dsize, spot.align);
        taken.push(spot.box);
      }
      if (d && show) {
        const sum: Vec = [A[0] + B[0], A[1] + B[1]];
        const k1 = phase(t, 0, 0.5);
        if (k1 >= 1) vp.polygon([[0, 0], A, sum, B], { fill: withAlpha(theme.text, 0.05) });
        dashedWorld(F, A, withAlpha(c1, 0.8), k1);
        dashedWorld(F, B, withAlpha(c2, 0.8), k1);
        const k2 = phase(t, 0.5, 1);
        forceArrow([0, 0], A, c1, 4, 1, k2);
        forceArrow([0, 0], B, c2, 4, 1, k2);
        if (k2 >= 1 && p.vals) {
          if (Math.abs(d.a) > 0.05) tipLabel([0, 0], A, `F₁ = ${N(Math.abs(d.a))} N`, c1);
          if (Math.abs(d.b) > 0.05) tipLabel([0, 0], B, `F₂ = ${N(Math.abs(d.b))} N`, c2);
        }
      }
      forceArrow([0, 0], F, theme.text, 5);
      if (p.vals) tipLabel([0, 0], F, `F = ${N(p.f)} N`, theme.text);
      ring();
      vp.end();
      pill(10, 10, ctx.t('splitTitle'), theme.text, 'left', narrow() ? 11.5 : 12.5);
      if (!d) {
        const r = vp.rect;
        pill(r.x + r.w / 2, r.y + r.h - (narrow() ? 64 : 46), ctx.t('parallel'), theme.series[3]!, 'center', narrow() ? 10.5 : 12);
      }
      return moving || anim;
    }

    /* ---------- Lampe ---------- */
    function drawSpringScale(a: Pt, b: Pt, F: number, color: string, small: boolean): void {
      // Federwaage mittig im Seil zwischen a und b; Gehäuse oben, Skalenstange zieht sich mit der Kraft heraus
      const gx = surface.g;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len = Math.hypot(dx, dy);
      const ang = Math.atan2(dy, dx);
      const housing = Math.min(small ? 46 : 62, len * 0.32);
      const extMax = Math.min(small ? 30 : 40, len * 0.22);
      const ext = (Math.min(F, SCALE_MAX) / SCALE_MAX) * extMax;
      const w = small ? 9 : 12;
      const start = Math.max(8, len * (small ? 0.42 : 0.3) - (housing + ext) / 2);
      gx.save();
      gx.translate(a[0], a[1]);
      gx.rotate(ang);
      // Seil
      gx.strokeStyle = ctx.theme.dark ? '#c9b48f' : '#8a6d3f';
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(0, 0);
      gx.lineTo(start, 0);
      gx.moveTo(start + housing + ext, 0);
      gx.lineTo(len, 0);
      gx.stroke();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 4;
      gx.shadowOffsetY = 1.5;
      // Gehäuse
      const meterImg = ctx.images.get('meter');
      if (meterImg) {
        // Foto: Ring am Seil zur Aufhängung, offenes Rohrende zur Last (gespiegelt gezeichnet)
        gx.save();
        gx.scale(-1, 1);
        drawMeterPhoto(gx, meterImg, -(start + housing), -(start - w * 0.45), w, surface.dpr);
        gx.restore();
        gx.shadowColor = 'transparent';
      } else {
        const tube = gx.createLinearGradient(0, -w / 2, 0, w / 2);
        tube.addColorStop(0, withAlpha(color, 0.6));
        tube.addColorStop(0.4, withAlpha(color, 0.25));
        tube.addColorStop(1, withAlpha(color, 0.8));
        gx.fillStyle = tube;
        roundRect(gx, start, -w / 2, housing, w, 3);
        gx.fill();
        gx.shadowColor = 'transparent';
        gx.strokeStyle = color;
        gx.lineWidth = 1.3;
        roundRect(gx, start, -w / 2, housing, w, 3);
        gx.stroke();
      }
      // Skalenstange
      gx.fillStyle = '#fbfbf7';
      gx.fillRect(start + housing, -w * 0.3, ext, w * 0.6);
      gx.strokeStyle = '#2a313b';
      gx.lineWidth = 1;
      for (let k = 0; k <= 10; k++) {
        const s = start + housing + (k / 10) * extMax;
        if (s > start + housing + ext) break;
        gx.beginPath();
        gx.moveTo(s, -w * 0.3);
        gx.lineTo(s, -w * 0.3 + (k % 5 === 0 ? w * 0.5 : w * 0.25));
        gx.stroke();
      }
      // Feder im Gehäuse
      gx.strokeStyle = withAlpha(ctx.theme.dark ? '#e6eaf0' : '#2a313b', 0.5);
      gx.lineJoin = 'round';
      gx.beginPath();
      for (let k = 0; k <= 14; k++) {
        const s = start + 4 + (k / 14) * (housing - 8);
        const yy = (k % 2 === 0 ? -1 : 1) * w * 0.28;
        if (k === 0) gx.moveTo(s, yy);
        else gx.lineTo(s, yy);
      }
      gx.stroke();
      gx.restore();
    }

    function drawLampScene(r: Rect): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const line = p.obj === 'line';
      const cx = r.x + r.w / 2;
      const groundY = r.y + r.h - (small ? 14 : 18);
      // Hintergrund
      const bg = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      if (line) {
        bg.addColorStop(0, dark ? '#16243a' : '#a9d4f7');
        bg.addColorStop(1, dark ? '#0f1726' : '#eaf5ff');
      } else {
        bg.addColorStop(0, dark ? '#1c2535' : '#f4f0e9');
        bg.addColorStop(1, dark ? '#141c29' : '#e5ded3');
      }
      gx.fillStyle = bg;
      gx.fillRect(r.x, r.y, r.w, r.h);
      const top = r.y + (line ? r.h * 0.24 : small ? 16 : 18);
      // Foto der Lampe etwas größer als die Ersatzgrafik (dann bleiben die Ösen neben den Kraftpfeilen sichtbar)
      const loadH = line ? (small ? 56 : 70) : ctx.images.get('lamp') ? (small ? 100 : 140) : small ? 84 : 104;
      let floorTop = groundY;
      if (line) {
        const grass = gx.createLinearGradient(0, groundY, 0, r.y + r.h);
        grass.addColorStop(0, dark ? '#2f5a2a' : '#6fae4f');
        grass.addColorStop(1, dark ? '#24461f' : '#58923d');
        gx.fillStyle = grass;
        gx.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
      } else {
        // Holzboden und Tisch unter der Lampe
        const floor = gx.createLinearGradient(0, groundY, 0, r.y + r.h);
        floor.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
        floor.addColorStop(1, dark ? '#33281e' : '#9c7349');
        gx.fillStyle = floor;
        gx.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
        const tw = Math.min(r.w * 0.36, 260);
        const th = small ? 26 : 30;
        floorTop = groundY - th;
        gx.save();
        gx.shadowColor = 'rgba(0,0,0,0.25)';
        gx.shadowBlur = 6;
        gx.shadowOffsetY = 2;
        const wood = gx.createLinearGradient(0, floorTop, 0, floorTop + 8);
        wood.addColorStop(0, '#b98552');
        wood.addColorStop(1, '#7d5530');
        gx.fillStyle = wood;
        roundRect(gx, cx - tw / 2, floorTop, tw, 8, 3);
        gx.fill();
        gx.restore();
        const tableImg = ctx.images.get('table');
        if (tableImg) {
          // Foto: Tischkante als Platte (abwechselnd gespiegelt gekachelt, im Dunkelmodus abgedunkelt)
          gx.save();
          roundRect(gx, cx - tw / 2, floorTop, tw, 8, 3);
          gx.clip();
          const tileW = (TABLE_IMG.w * 8) / TABLE_IMG.h;
          for (let i = 0, tx = cx - tw / 2; tx < cx + tw / 2; i++, tx += tileW) {
            gx.drawImage(scaledSprite(tableImg, tileW, 8, surface.dpr, { flipX: i % 2 === 1 }), tx, floorTop, tileW + 0.5, 8);
          }
          if (dark) {
            gx.fillStyle = 'rgba(10,14,22,0.38)';
            gx.fillRect(cx - tw / 2, floorTop, tw, 8);
          }
          gx.restore();
        }
        gx.fillStyle = '#7d5530';
        gx.fillRect(cx - tw / 2 + 12, floorTop + 8, 6, th - 8);
        gx.fillRect(cx + tw / 2 - 18, floorTop + 8, 6, th - 8);
        // Decke
        gx.fillStyle = dark ? '#3a4150' : '#c5cbd4';
        gx.fillRect(r.x, r.y, r.w, top - r.y);
        gx.strokeStyle = withAlpha(theme.muted, 0.55);
        gx.lineWidth = 1;
        gx.beginPath();
        for (let x = r.x - 20; x < r.x + r.w; x += 10) {
          gx.moveTo(x, top);
          gx.lineTo(x + 10, r.y);
        }
        gx.stroke();
        gx.fillStyle = dark ? '#596273' : '#9aa4b1';
        gx.fillRect(r.x, top - 2, r.w, 2);
      }
      const maxDepth = Math.max(30, floorTop - top - loadH - 10);
      const Wfull = r.w * (small ? 0.42 : line ? 0.4 : 0.3);
      // Foto der Lampe: Die Seile enden an den beiden Ösen (Abstand ±eye von der Mitte). Die Lage
      // wird dann für die Ösen bestimmt; der Knoten ist der Schnittpunkt der Seilgeraden (Wirkungslinien),
      // an ihm greifen die (entlang der Wirkungslinien verschobenen) Seilkräfte an. Bei sehr steilen
      // Seilen läge er unter der Lampe; dann bleibt er im oberen Viertel der Lampe (Richtungen bleiben exakt).
      const lampImg = line ? null : ctx.images.get('lamp');
      const lampK = loadH / (LAMP_IMG.h - LAMP_IMG.top);
      const eye = lampImg ? LAMP_IMG.eyeX * lampK : 0;
      const lay = lampLayout(p.a, Wfull - eye, maxDepth);
      lampGeo = { cx, ay: top, maxDepth, W: Wfull - eye };
      const W = lay.W + eye;
      const below = eye * Math.tan((p.a * Math.PI) / 180);
      const clamped = below > loadH * 0.25;
      const depth = lay.depth + Math.min(below, loadH * 0.25);
      const A1: Pt = [cx - W, top];
      const A2: Pt = [cx + W, top];
      const node: Pt = [cx, top + depth];
      const E1: Pt = lampImg ? [cx - eye, top + lay.depth] : node;
      const E2: Pt = lampImg ? [cx + eye, top + lay.depth] : node;
      if (line) {
        for (const A of [A1, A2]) {
          const pw = small ? 7 : 9;
          gx.save();
          gx.shadowColor = 'rgba(0,0,0,0.2)';
          gx.shadowBlur = 4;
          const wood = gx.createLinearGradient(A[0] - pw / 2, 0, A[0] + pw / 2, 0);
          wood.addColorStop(0, '#6a4426');
          wood.addColorStop(0.5, '#b07a49');
          wood.addColorStop(1, '#6a4426');
          gx.fillStyle = wood;
          gx.fillRect(A[0] - pw / 2, A[1] - 8, pw, groundY - A[1] + 8);
          gx.restore();
        }
      }
      // Seile mit Federwaagen
      const FG = p.m * G;
      const FS = ropeForce(FG, p.a);
      const meterColor = FS > SCALE_MAX ? theme.series[3]! : theme.series[0]!;
      drawSpringScale(A1, E1, FS, meterColor, small);
      drawSpringScale(A2, E2, FS, meterColor, small);
      for (const A of [A1, A2]) {
        gx.fillStyle = dark ? '#c3cbd6' : '#4a5361';
        gx.beginPath();
        gx.arc(A[0], A[1], 3.5, 0, Math.PI * 2);
        gx.fill();
      }
      // Last
      if (line) drawShirt(node[0], node[1], loadH, small, depth / W);
      else if (lampImg) {
        drawLampPhoto(lampImg, cx, E1[1], lampK);
        // Wirkungslinien der Seilkräfte bis zum Knoten verlängern
        if (node[1] - E1[1] > 4 && !clamped) {
          dashedPx(E1, node, withAlpha(theme.text, 0.45), 1.2, [3, 3]);
          dashedPx(E2, node, withAlpha(theme.text, 0.45), 1.2, [3, 3]);
        }
      } else drawLamp(node[0], node[1], loadH, small);
      // Kräfte am Knoten: F_G nach unten, Seilkräfte entlang der Seile; ihre Summe hält F_G das Gleichgewicht
      const maxLen = Math.min(small ? 110 : 180, Math.hypot(W, depth) * 0.5);
      const kPx = Math.min((small ? 44 : 56) / FG, maxLen / FS);
      // Richtung der Seilkraft = Richtung des Seils (von der Öse zum Aufhängepunkt)
      const ropeLen = Math.hypot(A1[0] - E1[0], A1[1] - E1[1]);
      const u1: Pt = [(A1[0] - E1[0]) / ropeLen, (A1[1] - E1[1]) / ropeLen];
      const u2: Pt = [-u1[0], u1[1]];
      const t1: Pt = [node[0] + u1[0] * FS * kPx, node[1] + u1[1] * FS * kPx];
      const t2: Pt = [node[0] + u2[0] * FS * kPx, node[1] + u2[1] * FS * kPx];
      const up: Pt = [node[0], node[1] - FG * kPx];
      gx.save();
      gx.fillStyle = withAlpha(theme.series[2]!, 0.12);
      gx.beginPath();
      gx.moveTo(node[0], node[1]);
      gx.lineTo(t1[0], t1[1]);
      gx.lineTo(up[0], up[1]);
      gx.lineTo(t2[0], t2[1]);
      gx.closePath();
      gx.fill();
      gx.restore();
      dashedPx(t1, up, withAlpha(theme.text, 0.5), 1.3);
      dashedPx(t2, up, withAlpha(theme.text, 0.5), 1.3);
      arrowPx(node[0], node[1], up[0], up[1], withAlpha(theme.series[2]!, 0.9), 2.6, 11);
      arrowPx(node[0], node[1], t1[0], t1[1], theme.series[0]!, 3.4, 13);
      arrowPx(node[0], node[1], t2[0], t2[1], theme.series[0]!, 3.4, 13);
      arrowPx(node[0], node[1], node[0], node[1] + FG * kPx, theme.series[1]!, 3.6, 13);
      const fs = small ? 11 : 12.5;
      // Anzeige der Federwaagen über den Seilen
      const size = small ? 10.5 : 12;
      const label = `${N(FS)} N`;
      const sa = Math.sin((p.a * Math.PI) / 180);
      const ca = Math.cos((p.a * Math.PI) / 180);
      const off = small ? 18 : 22;
      const ph = size + 11;
      const at = (A: Pt): Pt => [A[0] + (node[0] - A[0]) * (small ? 0.42 : 0.3), A[1] + (node[1] - A[1]) * (small ? 0.42 : 0.3)];
      const m1 = at(A1);
      const m2 = at(A2);
      const pills: [number, number, 'left' | 'right' | 'center'][] = [
        [m1[0] - sa * off, m1[1] + ca * off - ph / 2, sa > 0.5 ? 'right' : 'center'],
        [m2[0] + sa * off, m2[1] + ca * off - ph / 2, sa > 0.5 ? 'left' : 'center'],
      ];
      // Winkel α am rechten Aufhängepunkt (Lage der Beschriftung vorab, damit die Kraftbeschriftungen ausweichen)
      const ar = small ? 26 : 34;
      const mida = Math.PI - (p.a * Math.PI) / 360;
      const aLabel = `α = ${fmt.num(p.a, 0)}°`;
      const aSize = small ? 10.5 : 12;
      const aPos: Pt = p.a < 18 ? [A2[0] - ar - 18, A2[1] - 10] : [A2[0] + Math.cos(mida) * (ar + 10), A2[1] + Math.sin(mida) * (ar + 10) + 8];
      // Beschriftungen am Knoten: weichen Pillen, α, den anderen Beschriftungen und den Pfeilen aus
      // (bei kleinem α liegen alle Pfeile fast waagerecht und eng beieinander)
      const taken: Rect[] = [textBox(aLabel, aPos[0], aPos[1], aSize, 'right')];
      if (p.vals) for (const [x, y, al] of pills) taken.push(pillBox(x, y, label, al, size));
      const arrows: [Pt, Pt][] = [
        [node, t1],
        [node, t2],
        [node, [node[0], node[1] + FG * kPx]],
      ];
      // Seile mit Federwaagen: Die Namen F₁, F₂ sollen nicht auf den Federwaagen stehen
      const ropes: [Pt, Pt][] = [
        [A1, E1],
        [A2, E2],
      ];
      const gLen = FG * kPx;
      const gLabel = `F_G = ${N(FG)} N`;
      const gSpot = freeLabelSpot(
        gLabel,
        fs,
        [
          [node[0] + 12, node[1] + gLen * 0.75, 'left'],
          [node[0] + 12, node[1] + Math.max(gLen * 0.75, fs + 6), 'left'],
          [node[0], node[1] + gLen + fs, 'center'],
          [node[0], node[1] + Math.max(gLen, 10) + fs + 8, 'center'],
        ],
        taken,
        arrows,
      );
      haloText(gLabel, gSpot.x, gSpot.y, theme.series[1]!, fs, gSpot.align);
      taken.push(gSpot.box);
      if (p.vals) {
        // F₁ und F₂ symmetrisch: die erste Lage, die für beide frei ist
        const cands = (tip: Pt, u: Pt, sx: number): [number, number, CanvasTextAlign][] => [
          [tip[0] + u[0] * 12 + sx * 6, tip[1] + u[1] * 12 + 10, 'center'],
          [tip[0] + u[0] * 12 + sx * 6, tip[1] + u[1] * 12 - 10, 'center'],
          [(node[0] + tip[0]) / 2, (node[1] + tip[1]) / 2 + 12, 'center'],
          [(node[0] + tip[0]) / 2, (node[1] + tip[1]) / 2 - 12, 'center'],
          [node[0] + (tip[0] - node[0]) * 0.3, (node[1] + tip[1]) / 2 + 14, 'center'],
        ];
        const c1s = cands(t1, u1, -1);
        const c2s = cands(t2, u2, 1);
        const segs = [...arrows, ...ropes];
        let pick = 0;
        for (let k = 0; k < c1s.length; k++) {
          const b1 = textBox('F₁', c1s[k]![0], c1s[k]![1], fs, 'center');
          const b2 = textBox('F₂', c2s[k]![0], c2s[k]![1], fs, 'center');
          const free = (bx: Rect) => !taken.some((o) => boxesOverlap(bx, o)) && !segs.some((sg) => boxSegDist(bx, sg) < 3);
          if (free(b1) && free(b2) && !boxesOverlap(b1, b2)) {
            pick = k;
            break;
          }
        }
        haloText('F₁', c1s[pick]![0], c1s[pick]![1], theme.series[0]!, fs, 'center');
        haloText('F₂', c2s[pick]![0], c2s[pick]![1], theme.series[0]!, fs, 'center');
      }
      // unterhalb der Seile, also außerhalb des Winkels α (mit vals=0 verdeckt, z. B. für Aufgaben)
      if (p.vals) for (const [x, y, al] of pills) pill(x, y, label, meterColor, al, size);
      if (FS > SCALE_MAX) pill(cx, groundY - (small ? 30 : 38), ctx.t('over'), theme.series[3]!, 'center', size);
      // Winkel α am rechten Aufhängepunkt
      gx.strokeStyle = theme.series[3]!;
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.arc(A2[0], A2[1], ar, Math.PI, Math.PI - (p.a * Math.PI) / 180, true);
      gx.stroke();
      dashedPx([A2[0] - ar - 14, A2[1]], [A2[0] - 2, A2[1]], withAlpha(theme.series[3]!, 0.7), 1.2, [3, 3]);
      haloText(aLabel, aPos[0], aPos[1], theme.series[3]!, aSize, 'right');
      if (!small) pill(r.x + 10, line ? r.y + 10 : top + 8, ctx.t(line ? 'lineTitle' : 'lampTitle'), theme.text, 'left', 12.5);
    }

    /** Lampe als Foto; (x, eyeY) = Angriffspunkt der Seile an den Ösen, k = Maßstab. */
    function drawLampPhoto(img: HTMLImageElement, x: number, eyeY: number, k: number): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const w = LAMP_IMG.w * k;
      const h = (LAMP_IMG.h - LAMP_IMG.top) * k;
      const top = eyeY - (LAMP_IMG.eyeY - LAMP_IMG.top) * k;
      const bulb: Pt = [x, top + (LAMP_IMG.bulbY - LAMP_IMG.top) * k];
      if (dark) {
        const r = w * 1.25;
        const glow = gx.createRadialGradient(bulb[0], bulb[1], 2, bulb[0], bulb[1], r);
        glow.addColorStop(0, 'rgba(255,214,120,0.42)');
        glow.addColorStop(1, 'rgba(255,214,120,0)');
        gx.fillStyle = glow;
        gx.beginPath();
        gx.arc(bulb[0], bulb[1], r, 0, Math.PI * 2);
        gx.fill();
      }
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.3)';
      gx.shadowBlur = 10;
      gx.shadowOffsetX = 2;
      gx.shadowOffsetY = 4;
      gx.drawImage(scaledSprite(img, w, h, surface.dpr, { crop: { x: 0, y: LAMP_IMG.top, w: LAMP_IMG.w, h: LAMP_IMG.h - LAMP_IMG.top } }), x - LAMP_IMG.cx * k, top, w, h);
      gx.restore();
    }

    function drawLamp(x: number, y: number, h: number, small: boolean): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const cord = h * 0.58;
      gx.strokeStyle = dark ? '#c3cbd6' : '#3a4250';
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.moveTo(x, y);
      gx.lineTo(x, y + cord);
      gx.stroke();
      // Haken
      gx.lineWidth = 2;
      gx.beginPath();
      gx.arc(x, y + 3, 3.5, -Math.PI / 2, Math.PI * 1.2);
      gx.stroke();
      const sw = h * (small ? 0.56 : 0.6);
      const sh = h * 0.42;
      const top = y + cord;
      // Licht
      if (dark) {
        const glow = gx.createRadialGradient(x, top + sh, 2, x, top + sh, sw * 1.4);
        glow.addColorStop(0, 'rgba(255,214,120,0.45)');
        glow.addColorStop(1, 'rgba(255,214,120,0)');
        gx.fillStyle = glow;
        gx.beginPath();
        gx.arc(x, top + sh, sw * 1.4, 0, Math.PI * 2);
        gx.fill();
      }
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 3;
      const shade = gx.createLinearGradient(x - sw / 2, 0, x + sw / 2, 0);
      shade.addColorStop(0, '#1f5f5b');
      shade.addColorStop(0.45, '#3fa79d');
      shade.addColorStop(1, '#1b4e4b');
      gx.fillStyle = shade;
      gx.beginPath();
      gx.moveTo(x - sw * 0.12, top);
      gx.lineTo(x + sw * 0.12, top);
      gx.quadraticCurveTo(x + sw * 0.18, top + sh * 0.35, x + sw / 2, top + sh);
      gx.lineTo(x - sw / 2, top + sh);
      gx.quadraticCurveTo(x - sw * 0.18, top + sh * 0.35, x - sw * 0.12, top);
      gx.closePath();
      gx.fill();
      gx.restore();
      gx.fillStyle = '#fff4c7';
      gx.beginPath();
      gx.ellipse(x, top + sh, sw * 0.24, sh * 0.16, 0, 0, Math.PI);
      gx.fill();
    }

    /** T-Shirt am Knoten (x, y); `slope` = Steigung der Leine (für die Klammern des Fotos). */
    function drawShirt(x: number, y: number, h: number, small: boolean, slope: number): void {
      const gx = surface.g;
      const shirtImg = ctx.images.get('shirt');
      if (shirtImg) {
        // Foto: Die beiden Klammern sitzen auf der Leine, die Mitte des Hemds unter dem Knoten
        const S = SHIRT_IMG;
        const k = (h * 1.05) / S.h;
        const pegY = y - S.pegX * k * slope;
        gx.save();
        gx.shadowColor = 'rgba(0,0,0,0.25)';
        gx.shadowBlur = 6;
        gx.shadowOffsetY = 2;
        gx.drawImage(scaledSprite(shirtImg, S.w * k, S.h * k, surface.dpr), x - S.cx * k, pegY - S.pegY * k - 2, S.w * k, S.h * k);
        gx.restore();
        return;
      }
      const w = h * (small ? 0.9 : 0.95);
      const top = y + 4;
      // Klammer
      gx.fillStyle = '#c8a06a';
      gx.fillRect(x - 2.5, y - 6, 5, 12);
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      const cloth = gx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      cloth.addColorStop(0, '#b0303f');
      cloth.addColorStop(0.5, '#e05a68');
      cloth.addColorStop(1, '#a12a38');
      gx.fillStyle = cloth;
      gx.beginPath();
      gx.moveTo(x - w * 0.18, top);
      gx.lineTo(x - w * 0.5, top + h * 0.12);
      gx.lineTo(x - w * 0.42, top + h * 0.32);
      gx.lineTo(x - w * 0.3, top + h * 0.27);
      gx.lineTo(x - w * 0.3, top + h * 0.88);
      gx.lineTo(x + w * 0.3, top + h * 0.88);
      gx.lineTo(x + w * 0.3, top + h * 0.27);
      gx.lineTo(x + w * 0.42, top + h * 0.32);
      gx.lineTo(x + w * 0.5, top + h * 0.12);
      gx.lineTo(x + w * 0.18, top);
      gx.quadraticCurveTo(x, top + h * 0.12, x - w * 0.18, top);
      gx.closePath();
      gx.fill();
      gx.restore();
      // Tropfen (nass)
      gx.fillStyle = 'rgba(120,180,255,0.8)';
      for (const [dx, dy] of [
        [-0.18, 0.97],
        [0.05, 1.02],
        [0.22, 0.95],
      ] as Pt[]) {
        gx.beginPath();
        gx.ellipse(x + dx * w, top + dy * h, 1.8, 2.8, 0, 0, Math.PI * 2);
        gx.fill();
      }
    }

    function drawLampChart(): void {
      const theme = ctx.theme;
      const FG = p.m * G;
      const FS = ropeForce(FG, p.a);
      const yTop = Math.min(12 * FG, Math.max(4 * FG, FS * 1.18));
      const small = narrow();
      chart.setRangePadded([0, 90], [0, yTop], { left: small ? 44 : 52, right: small ? 14 : 18, top: 26, bottom: 22 });
      const gx = chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      chart.hline(FG / 2, { color: theme.muted, width: 1.2, dash: [5, 4] });
      chart.hline(FG, { color: theme.series[1], width: 1.2, dash: [5, 4], alpha: 0.8 });
      chart.fn((x) => (x > 0.5 ? ropeForce(FG, x) : NaN), { color: theme.series[0], width: 2.6, from: 0.5, to: 90 });
      chart.point(30, FG, { color: theme.series[1], radius: 4 });
      chart.segment([p.a, 0], [p.a, Math.min(FS, yTop)], { color: theme.series[3], width: 1.4, dash: [4, 4] });
      chart.point(p.a, Math.min(FS, yTop), { color: theme.series[0], radius: 6 });
      chart.end();
      // Beschriftungen mit tiefgestelltem Index (F_G, F_S) selbst setzen
      const lab = (x: number, y: number, label: string, color: string, align: CanvasTextAlign, dx: number, dy: number) => {
        const [px, py] = chart.toPx(x, y);
        richDraw(label, px + dx, py + dy, 11, align, 'bottom', theme.bg, color);
      };
      if (!small) lab(88, FG / 2, ctx.t('half'), theme.muted, 'right', 0, -4);
      lab(72, FG, 'F_G', theme.series[1]!, 'right', 0, -4);
      if (!small) lab(30, FG, ctx.t('equalFG'), theme.series[1]!, 'left', 9, -6);
      const r = chart.rect;
      gx.save();
      gx.strokeStyle = theme.grid;
      gx.lineWidth = 1;
      roundRect(gx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      gx.stroke();
      gx.restore();
      if (p.vals) pill(r.x + r.w - 10, r.y + 8, `F_S = ${N(FS)} N`, theme.series[0]!, 'right', small ? 11 : 12.5);
    }

    return {
      update(changed, source) {
        if (source !== 'sim' && changed.has('mode')) viewInit = false;
        if (source === 'replace' || source === 'init') viewInit = false;
        lastFrame = performance.now();
        updateReadouts();
      },

      action(id) {
        if (id === 'build') {
          build.play();
          if (!p.res) ctx.set({ res: true });
        } else if (id === 'split') {
          splitT.play();
          if (!p.res) ctx.set({ res: true });
        }
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        surface.begin();
        let busy = false;
        const m = mode();
        if (m === 'lamp') {
          const reg = lampRegions(surface.width, surface.height);
          scene.resize();
          chart.resize();
          scene.setRange([reg.scene.x, reg.scene.x + reg.scene.w], [-(reg.scene.y + reg.scene.h), -reg.scene.y]);
          scene.begin();
          drawLampScene(reg.scene);
          scene.end();
          drawLampChart();
        } else {
          vp.resize();
          busy = m === 'add' ? drawAdd(dt) : drawSplit(dt);
        }
        if (busy || performance.now() - lastDrag < 400) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
