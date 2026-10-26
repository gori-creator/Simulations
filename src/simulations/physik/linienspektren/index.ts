import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, scaledSprite, seededRandom, Surface, textOn, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  cascade,
  colorNameOf,
  ELEMENTS,
  elementOf,
  frequencyOf,
  hydrogenSeries,
  joule,
  lineOf,
  linesOf,
  randomUpper,
  regionOf,
  resolveTransition,
  wavelengthOf,
  wavelengthToRgb,
  type ElementData,
  type ElementId,
  type TransitionDef,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Ränder der UV- und IR-Zone des Spektrums (nm, logarithmisch gestaucht). */
const UV_LO = 50;
const IR_HI = 2500;
/** Hellste sichtbare Linie je Element (Voreinstellung beim Wechsel). */
const DEFAULT_SEL: Record<ElementId, [number, number]> = { H: [3, 2], He: [7, 4], Na: [2, 1], Hg: [6, 4] };
/** Dauer der Abschnitte eines Sprungs in s (Simulationszeit). */
const T_REST = 0.55;
const T_UP = 0.5;
const T_DWELL = 0.75;
const T_DOWN = 0.38;

type Stage = 'rest' | 'excite' | 'up' | 'dwell' | 'down';
type Kind = 'emit' | 'scatter' | 'lamp' | 'probe' | 'collider';

interface Pt {
  x: number;
  y: number;
}

interface Photon {
  kind: Kind;
  lam: number;
  /** Index der Linie im Element (−1: keine). */
  line: number;
  /** Fortschritt 0 … 1 und Dauer in s. */
  s: number;
  dur: number;
  /** Startpunkt relativ zum Atom (in Atomradien) bzw. Richtung beim Streuen. */
  ox: number;
  oy: number;
  dead: boolean;
}

interface Lay {
  side: boolean;
  scene: Rect;
  term: Rect;
  info: Rect;
}

interface SceneGeo {
  r: Rect;
  sm: boolean;
  ax: number;
  ay: number;
  R: number;
  px: number;
  py: number;
  ps: number;
  sx0: number;
  sx1: number;
  sy: number;
  sh: number;
  uvW: number;
  irW: number;
  lampX: number;
}

interface Arrow {
  t: TransitionDef;
  idx: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface TermGeo {
  A: Rect;
  y: number[];
  /** Linienstücke der Niveaus: x-Anfang, x-Ende. */
  xa: number[];
  xb: number[];
  arrows: Arrow[];
  brk: number | null;
  sm: boolean;
  /** Energie → y in Pixeln (mit Achsenbruch). */
  yOf: (E: number) => number;
}

/**
 * Linienspektren: ein Atom mit Energieniveaus (Bahnen im Modell und
 * Termschema), Elektronensprünge als Animation, das ausgesandte bzw.
 * aufgenommene Photon mit E = h · f fliegt durch ein Prisma auf den Schirm,
 * wo Emissions- bzw. Absorptionslinien entstehen. Wasserstoff (Serien),
 * Helium, Natrium, Quecksilber; Übergänge zum Antippen.
 */
export default defineSimulation({
  id: 'linienspektren',
  animated: true,
  dragHint: false,
  layout: { aspect: 1.5, aspectNarrow: 0.5 },
  images: { prism: 'prisma.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'el',
      type: 'choice',
      label: L('Element', 'Element'),
      options: [
        { value: 'H', label: L('Wasserstoff', 'Hydrogen') },
        { value: 'He', label: L('Helium', 'Helium') },
        { value: 'Na', label: L('Natrium', 'Sodium') },
        { value: 'Hg', label: L('Quecksilber', 'Mercury') },
      ],
      default: 'H',
    },
    {
      key: 'mode',
      type: 'choice',
      label: L('Spektrum', 'Spectrum'),
      options: [
        { value: 'em', label: L('Emission', 'Emission') },
        { value: 'abs', label: L('Absorption', 'Absorption') },
      ],
      default: 'em',
    },
    {
      key: 'u',
      type: 'number',
      label: L('Oberes Niveau (Nummer)', 'Upper level (number)'),
      help: L('1 = Grundzustand. Bei Wasserstoff ist die Nummer die Hauptquantenzahl n. Oder: einen Übergang im Termschema antippen.', '1 = ground state. For hydrogen the number is the principal quantum number n. Or tap a transition in the level diagram.'),
      min: 2,
      max: 10,
      step: 1,
      default: 3,
    },
    { key: 'l', type: 'number', label: L('Unteres Niveau (Nummer)', 'Lower level (number)'), min: 1, max: 9, step: 1, default: 2 },
    {
      key: 'run',
      type: 'choice',
      label: L('Anregung', 'Excitation'),
      options: [
        { value: 'one', label: L('nur dieser Übergang', 'this transition only') },
        { value: 'all', label: L('alle Übergänge (Gas leuchtet)', 'all transitions (glowing gas)') },
      ],
      default: 'one',
    },
    { key: 'slow', type: 'boolean', label: L('Zeitlupe', 'Slow motion'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  actions: [
    { id: 'go', label: L('Elektron anregen', 'Excite the electron'), primary: true },
    { id: 'clear', label: L('Spektrum löschen', 'Clear the spectrum') },
  ],
  readouts: [
    { key: 'trans', label: L('Übergang', 'Transition') },
    { key: 'photon', label: L('Photon: E = h · f', 'Photon: E = h · f'), spoiler: true },
    { key: 'lines', label: L('Sichtbare Linien', 'Visible lines'), spoiler: true },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'start', label: L('Wasserstoff: rote Hα-Linie', 'Hydrogen: red Hα line'), values: {} },
    { id: 'balmer', label: L('Wasserstoff: alle Linien', 'Hydrogen: all lines'), values: { run: 'all' } },
    { id: 'lyman', label: L('Lyman-α: unsichtbar im UV', 'Lyman-α: invisible in the UV'), values: { u: 2, l: 1 } },
    { id: 'na', label: L('Natrium: Absorption der D-Linie', 'Sodium: absorption of the D line'), values: { el: 'Na', mode: 'abs', u: 2, l: 1 } },
    { id: 'hg', label: L('Quecksilberdampflampe', 'Mercury vapour lamp'), values: { el: 'Hg', u: 6, l: 4, run: 'all' } },
    { id: 'he', label: L('Helium: Fingerabdruck', 'Helium: fingerprint'), values: { el: 'He', u: 7, l: 4, run: 'all' } },
  ],
  strings: {
    de: {
      canvas:
        'Atommodell mit Bahnen für die Energieniveaus: Ein Elektron springt zwischen den Niveaus und sendet dabei ein Photon aus bzw. nimmt eines auf. Das Photon fliegt durch ein Prisma auf einen Schirm, auf dem das Linienspektrum entsteht (Emission: helle Linien auf dunklem Grund, Absorption: dunkle Linien im farbigen Spektrum). Daneben das Termschema mit allen Übergängen und die Rechnung ΔE = h · f, λ = c/f.',
      H: 'Wasserstoff',
      He: 'Helium',
      Na: 'Natrium',
      Hg: 'Quecksilber',
      em: 'Emission',
      abs: 'Absorption',
      allEm: 'viele Atome leuchten',
      allAbs: 'weißes Licht durch Gas',
      model: 'Modell, nicht maßstäblich',
      lamp: 'weißes Licht',
      termTitle: 'Energieniveaus',
      termTitleS: 'Niveaus',
      axisE: 'E in eV',
      ion: 'Ionisierung',
      lyman: 'Lyman',
      balmer: 'Balmer',
      paschen: 'Paschen',
      brackett: 'Br.',
      pfund: 'Pf.',
      brackettFull: 'Brackett',
      pfundFull: 'Pfund',
      photonTitle: 'Photon',
      uv: 'UV',
      ir: 'IR',
      violet: 'violett',
      blue: 'blau',
      cyan: 'blaugrün',
      green: 'grün',
      yellow: 'gelb',
      orange: 'orange',
      red: 'rot',
      uvName: 'ultraviolett – unsichtbar',
      irName: 'infrarot – unsichtbar',
      uvShort: 'UV – unsichtbar',
      irShort: 'IR – unsichtbar',
      hint: 'Übergang antippen',
      tapHint: 'Pfeil oder Linie antippen: Übergang wählen',
      levelN: 'Niveau {k}',
      keyT: 'Übergang {u} → {l}',
      trEm: '<strong>Emission:</strong> Das Elektron springt vom Niveau {lu} (<var>E</var> = {Eu} eV) auf das Niveau {ll} (<var>E</var> = {El} eV). Dabei sendet das Atom genau ein Photon aus.{series}',
      trAbs: '<strong>Absorption:</strong> Ein Photon aus dem weißen Licht hebt das Elektron vom Niveau {ll} (<var>E</var> = {El} eV) auf das Niveau {lu} (<var>E</var> = {Eu} eV). Photonen mit genau dieser Energie fehlen danach im Spektrum.{series}',
      series: ' Der Übergang gehört zur <strong>{s}-Serie</strong> (unteres Niveau <var>n</var> = {n}).',
      photon:
        '<var>ΔE</var> = <var>E</var><sub>{su}</sub> − <var>E</var><sub>{sl}</sub> = {Eu} eV − ({El} eV) = <strong>{dE} eV</strong> = {dEJ} J<br><var>f</var> = <span class="frac"><span><var>ΔE</var></span><span><var>h</var></span></span> = <span class="frac"><span>{dEJ} J</span><span>6,626 · 10<sup>−34</sup> J · s</span></span> = <strong>{f} Hz</strong><br><var>λ</var> = <span class="frac"><span><var>c</var></span><span><var>f</var></span></span> = <span class="frac"><span>2,998 · 10<sup>8</sup> m/s</span><span>{f} Hz</span></span> = <strong>{lam} nm</strong> – {color}',
      thL: 'λ in nm',
      thC: 'Farbe',
      thT: 'Übergang',
      noVis: 'keine',
    },
    en: {
      canvas:
        'Atomic model with orbits for the energy levels: an electron jumps between the levels and emits or absorbs a photon. The photon passes through a prism onto a screen where the line spectrum appears (emission: bright lines on a dark background, absorption: dark lines in the coloured spectrum). Next to it the energy level diagram with all transitions and the calculation ΔE = h · f, λ = c/f.',
      H: 'Hydrogen',
      He: 'Helium',
      Na: 'Sodium',
      Hg: 'Mercury',
      em: 'Emission',
      abs: 'Absorption',
      allEm: 'many atoms glow',
      allAbs: 'white light through gas',
      model: 'model, not to scale',
      lamp: 'white light',
      termTitle: 'Energy levels',
      termTitleS: 'Levels',
      axisE: 'E in eV',
      ion: 'ionisation',
      lyman: 'Lyman',
      balmer: 'Balmer',
      paschen: 'Paschen',
      brackett: 'Br.',
      pfund: 'Pf.',
      brackettFull: 'Brackett',
      pfundFull: 'Pfund',
      photonTitle: 'Photon',
      uv: 'UV',
      ir: 'IR',
      violet: 'violet',
      blue: 'blue',
      cyan: 'cyan',
      green: 'green',
      yellow: 'yellow',
      orange: 'orange',
      red: 'red',
      uvName: 'ultraviolet – invisible',
      irName: 'infrared – invisible',
      uvShort: 'UV – invisible',
      irShort: 'IR – invisible',
      hint: 'tap a transition',
      tapHint: 'Tap an arrow or a line to choose a transition',
      levelN: 'level {k}',
      keyT: 'transition {u} → {l}',
      trEm: '<strong>Emission:</strong> the electron jumps from level {lu} (<var>E</var> = {Eu} eV) to level {ll} (<var>E</var> = {El} eV). The atom emits exactly one photon.{series}',
      trAbs: '<strong>Absorption:</strong> a photon from the white light lifts the electron from level {ll} (<var>E</var> = {El} eV) to level {lu} (<var>E</var> = {Eu} eV). Photons with exactly this energy are then missing from the spectrum.{series}',
      series: ' The transition belongs to the <strong>{s} series</strong> (lower level <var>n</var> = {n}).',
      photon:
        '<var>ΔE</var> = <var>E</var><sub>{su}</sub> − <var>E</var><sub>{sl}</sub> = {Eu} eV − ({El} eV) = <strong>{dE} eV</strong> = {dEJ} J<br><var>f</var> = <span class="frac"><span><var>ΔE</var></span><span><var>h</var></span></span> = <span class="frac"><span>{dEJ} J</span><span>6.626 · 10<sup>−34</sup> J · s</span></span> = <strong>{f} Hz</strong><br><var>λ</var> = <span class="frac"><span><var>c</var></span><span><var>f</var></span></span> = <span class="frac"><span>2.998 · 10<sup>8</sup> m/s</span><span>{f} Hz</span></span> = <strong>{lam} nm</strong> – {color}',
      thL: 'λ in nm',
      thC: 'colour',
      thT: 'transition',
      noVis: 'none',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const blue = () => ctx.theme.series[0]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const el = (): ElementData => elementOf(p.el);
    const sel = (): TransitionDef => resolveTransition(el(), p.u, p.l);
    const isAbs = () => p.mode === 'abs';
    /** Werte im Bild zeigen? Aus bei „Werte im Bild anzeigen“ = aus und im Aufgabenmodus, solange die Rechnung verdeckt ist. */
    const showVal = () => !ctx.isHidden('photon');
    const lineIndex = (e: ElementData, t: TransitionDef) => e.transitions.findIndex((q) => q.u === t.u && q.l === t.l);

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, instant = false): number {
      const cur = soft.get(key);
      if (cur === undefined || instant || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-3 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);

    /* ---------- Farben ---------- */
    const rgbCache = new Map<number, string>();
    /** Bildschirmfarbe einer Wellenlänge; unsichtbar: neutral (hell bzw. dunkel). */
    function lamColor(lam: number, onDark = true): string {
      const key = Math.round(lam * 2) + (onDark ? 0 : 1e6);
      const hit = rgbCache.get(key);
      if (hit) return hit;
      const c = wavelengthToRgb(lam);
      let s: string;
      if (c) {
        // sehr dunkle Randfarben etwas aufhellen, damit sie auf dem Schirm sichtbar bleiben
        const m = Math.max(c[0], c[1], c[2]);
        const k = m < 150 ? 150 / Math.max(1, m) : 1;
        s = `rgb(${Math.min(255, Math.round(c[0] * k))},${Math.min(255, Math.round(c[1] * k))},${Math.min(255, Math.round(c[2] * k))})`;
        if (!onDark) s = mixColor(s, '#000000', 0.12);
      } else s = onDark ? (lam < 380 ? '#b9a8ff' : '#ffb59a') : lam < 380 ? purple() : ctx.theme.series[1]!;
      if (rgbCache.size > 2000) rgbCache.clear();
      rgbCache.set(key, s);
      return s;
    }
    /** Farbe mit Deckkraft (für #rrggbb und rgb(…)). */
    const alphaOf = (c: string, a: number) => mixColor(c, c, 0, a);
    /** Farbe für Pfeile und Texte auf dem hellen bzw. dunklen Kartenhintergrund. */
    const cardColor = (lam: number) => {
      if (regionOf(lam) !== 'vis') return ctx.theme.muted;
      const c = lamColor(lam, true);
      if (ctx.theme.dark) return c;
      // gelbe/grüne Töne auf Weiß abdunkeln (Lesbarkeit)
      return mixColor(c, '#1b2330', lam > 500 && lam < 600 ? 0.38 : 0.12);
    };

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.36, 250, 390));
        const th = Math.round((h - 10) * 0.62);
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, term: { x: w - pw, y: 0, w: pw, h: th }, info: { x: w - pw, y: th + 10, w: pw, h: h - th - 10 } };
      }
      const sh = Math.round(h * 0.46);
      const th = Math.round((h - sh - 20) * 0.6);
      return { side, scene: { x: 0, y: 0, w, h: sh }, term: { x: 0, y: sh + 10, w, h: th }, info: { x: 0, y: sh + 20 + th, w, h: h - sh - 20 - th } };
    }

    function sceneGeo(r: Rect): SceneGeo {
      const sm = r.w < 440;
      const sh = sm ? 34 : 44;
      const sy = r.y + r.h - (sm ? 30 : 36) - sh;
      const sx0 = r.x + (sm ? 12 : 16);
      const sx1 = r.x + r.w - (sm ? 12 : 16);
      const top = r.y + (sm ? 40 : 50);
      const bottom = sy - (sm ? 40 : 56);
      const lab = sm ? 14 : 18;
      const ps = clamp(Math.min(r.w * 0.075, (bottom - top) * 0.12), 18, 46);
      const px = r.x + r.w - ps * 0.87 - (sm ? 16 : 26);
      const left = sm ? 44 : 64;
      const R = Math.max(30, Math.min((px - ps * 0.9 - 16 - r.x - left) / 2, (bottom - top - lab) / 2));
      const ay = (top + bottom - lab) / 2;
      const ax = r.x + left + R + Math.max(0, (px - ps * 0.9 - 16 - r.x - left - 2 * R) * 0.35);
      return { r, sm, ax, ay, R, px, py: ay + ps * 0.15, ps, sx0, sx1, sy, sh, uvW: (sx1 - sx0) * 0.1, irW: (sx1 - sx0) * 0.1, lampX: r.x + (sm ? 10 : 14) };
    }

    /** x-Position einer Wellenlänge auf dem Schirm (UV und IR logarithmisch gestaucht). */
    function specX(G: SceneGeo, lam: number): number {
      const visW = G.sx1 - G.sx0 - G.uvW - G.irW;
      if (lam < 380) return G.sx0 + G.uvW * clamp(Math.log(lam / UV_LO) / Math.log(380 / UV_LO), 0.08, 0.92);
      if (lam > 780) return G.sx1 - G.irW + G.irW * clamp(Math.log(lam / 780) / Math.log(IR_HI / 780), 0.08, 0.92);
      return G.sx0 + G.uvW + (visW * (lam - 380)) / 400;
    }

    /* ---------- Bahnen im Atommodell ---------- */
    /** Bahnradius zum Niveau: wie im Bohr-Modell aus n_eff = √(13,6 eV / |E|), linear auf den Platz verteilt. */
    function orbitRadius(e: ElementData, k: number, R: number): number {
      const ne = (E: number) => Math.sqrt(13.6 / Math.max(0.05, -E));
      const lo = ne(e.levels[0]!.E);
      const hi = ne(e.levels[e.levels.length - 1]!.E);
      const q = hi > lo ? (ne(e.levels[k - 1]!.E) - lo) / (hi - lo) : 0;
      return R * (0.26 + 0.74 * q);
    }

    /* ---------- Zustand der Animation ---------- */
    const rand = seededRandom(20261019);
    let stageName: Stage = 'rest';
    let stT = 0;
    /** Elektron: von Niveau → nach Niveau, Fortschritt (Simulationszeit). */
    let eFrom = sel().l;
    let eTo = sel().l;
    let eU = 1;
    let eDur = T_UP;
    let eVia: TransitionDef | null = sel();
    let eAngle = -0.6;
    let queue: TransitionDef[] = [];
    /** Übergang, der gerade „läuft“ (Anregung bzw. Zerfall). */
    let cur: TransitionDef = sel();
    let photons: Photon[] = [];
    let lamAcc = 0;
    let flash = 0;
    let glow = 0;
    /** Helligkeit (Emission) bzw. Dunkelheit (Absorption) der Linien, 0 … 1. */
    let levels = new Float64Array(ELEMENTS[elementOf(p.el).id].transitions.length);
    let hitFlash = new Float64Array(levels.length);
    /** Angezeigter Zustand und Vorgänger (für das Überblenden beim Wechsel). */
    let shownEl: ElementData = el();
    let shownSel: TransitionDef = sel();
    let shownAbs = isAbs();
    let prevEl: ElementData = shownEl;
    let prevSel: TransitionDef = shownSel;
    let prevLevels = new Float64Array(0);
    let prevAbs = shownAbs;
    const swap = new Tween(650, ease.linear);
    const clearFade = new Tween(500, ease.outCubic);
    let clearedLevels = new Float64Array(0);

    function resetCycle(): void {
      const t = sel();
      stageName = 'rest';
      stT = T_REST * 0.6;
      queue = [];
      cur = t;
      eFrom = eTo = t.l;
      eU = 1;
      eVia = t;
      photons = photons.filter((q) => q.kind === 'lamp');
    }

    function fillStatic(): void {
      // ohne Bewegung (oder beim Laden ohne Uhr): sofort das fertige Spektrum
      const e = el();
      if (p.run === 'all') levels.fill(1);
      else {
        const i = lineIndex(e, sel());
        if (i >= 0) levels[i] = 1;
      }
    }

    /** Element oder Art des Spektrums gewechselt: altes Bild ausblenden, neues beginnt leer. */
    function swapTo(): void {
      prevEl = shownEl;
      prevSel = shownSel;
      prevLevels = levels;
      prevAbs = shownAbs;
      shownEl = el();
      shownAbs = isAbs();
      levels = new Float64Array(shownEl.transitions.length);
      hitFlash = new Float64Array(levels.length);
      photons = [];
      swap.play();
    }

    /* ---------- Ablauf eines Sprungs ---------- */
    function spawn(kind: Kind, lam: number, line: number, dur: number, ox = 0, oy = 0): void {
      photons.push({ kind, lam, line, s: 0, dur, ox, oy, dead: false });
    }

    /** Position des Elektrons relativ zum Atommittelpunkt in Atomradien. */
    function electronOffset(R: number): [number, number] {
      const e = el();
      const r0 = orbitRadius(e, eFrom, R);
      const r1 = orbitRadius(e, eTo, R);
      const rr = r0 + (r1 - r0) * ease.inOutCubic(clamp(eU, 0, 1));
      return [(Math.cos(eAngle) * rr) / R, (Math.sin(eAngle) * rr) / R];
    }

    function startJump(from: number, to: number, via: TransitionDef | null, dur: number): void {
      eFrom = from;
      eTo = to;
      eU = 0;
      eDur = dur;
      eVia = via;
    }

    function beginExcitation(): void {
      const e = el();
      if (isAbs()) {
        // Absorption: ein Photon passender Energie kommt aus der Lampe
        const t = p.run === 'all' ? e.transitions[Math.floor(rand() * e.transitions.length)]! : sel();
        cur = t;
        if (eTo !== t.l) startJump(eTo, t.l, null, 0.3);
        spawn('probe', lineOf(e, t.u, t.l).lambda, lineIndex(e, t), 0.75);
        stageName = 'excite';
        stT = 0;
        return;
      }
      // Emission: Stoß eines schnellen Elektrons (Gasentladung) hebt das Elektron an
      if (p.run === 'all') {
        const u = randomUpper(e, rand);
        queue = cascade(e, u, rand);
        cur = queue[0] ?? sel();
      } else {
        cur = sel();
        queue = [cur];
      }
      const ground = p.run === 'all' ? 1 : cur.l;
      if (eTo !== ground) startJump(eTo, ground, null, 0.3);
      spawn('collider', 0, -1, 0.55, -1.9, -1.15);
      stageName = 'excite';
      stT = 0;
    }

    function arrive(q: Photon): void {
      if (q.kind === 'emit' && q.line >= 0) {
        levels[q.line] = Math.min(1, levels[q.line]! + (p.run === 'all' ? 0.3 : 0.5));
        hitFlash[q.line] = 1;
      } else if (q.kind === 'probe') {
        // Photon wird absorbiert: Elektron springt nach oben, die Linie wird dunkler
        flash = 1;
        if (q.line >= 0) {
          levels[q.line] = Math.min(1, levels[q.line]! + (p.run === 'all' ? 0.3 : 0.5));
          hitFlash[q.line] = 1;
        }
        startJump(cur.l, cur.u, cur, T_UP);
        stageName = 'up';
        stT = 0;
      } else if (q.kind === 'collider') {
        flash = 1;
        const top = isAbs() ? cur.u : (queue[0]?.u ?? cur.u);
        startJump(eTo, top, null, T_UP);
        stageName = 'up';
        stT = 0;
      }
    }

    function tickCycle(dt: number): void {
      const e = el();
      stT += dt;
      if (eU < 1) eU = Math.min(1, eU + dt / eDur);
      const [ox, oy] = electronOffset(1);
      eAngle += dt * 2.4 * Math.pow(0.45 / Math.max(0.2, Math.hypot(ox, oy)), 1.5);
      flash = Math.max(0, flash - dt * 2.2);
      glow = Math.max(0, glow - dt * 1.1);
      for (let i = 0; i < hitFlash.length; i++) hitFlash[i] = Math.max(0, hitFlash[i]! - dt * 1.4);
      // „Gas leuchtet“: viele Atome tragen bei – die Linien wachsen gleichmäßig
      if (p.run === 'all') for (let i = 0; i < levels.length; i++) levels[i] = levels[i]! + (1 - levels[i]!) * (1 - Math.exp(-dt * 0.45));
      // Photonen bewegen
      for (const q of photons) {
        q.s += dt / q.dur;
        if (q.s >= 1 && !q.dead) {
          q.dead = true;
          arrive(q);
        }
      }
      photons = photons.filter((q) => !q.dead);
      // weißes Licht der Lampe: ständig Photonen aller Farben
      if (isAbs()) {
        lamAcc += dt;
        while (lamAcc > 0.11) {
          lamAcc -= 0.11;
          spawn('lamp', 395 + rand() * 300, -1, 1.5 + rand() * 0.2, 0, (rand() - 0.5) * 0.5);
        }
      }
      // Abschnitte
      if (stageName === 'rest' && stT >= T_REST) beginExcitation();
      else if (stageName === 'up' && eU >= 1) {
        stageName = 'dwell';
        stT = 0;
      } else if (stageName === 'dwell' && stT >= (isAbs() ? T_DWELL * 0.8 : queue.length && eTo !== queue[0]!.u ? 0 : T_DWELL * (p.run === 'all' ? 0.5 : 1))) {
        const t = isAbs() ? cur : queue.shift();
        if (!t) {
          stageName = 'rest';
          stT = 0;
        } else {
          cur = t;
          startJump(t.u, t.l, t, T_DOWN);
          const ln = lineOf(e, t.u, t.l);
          const [ox, oy] = electronOffset(1);
          if (isAbs()) {
            // erneute Aussendung in irgendeine Richtung – nicht zum Schirm
            const a = -Math.PI / 2 + (rand() - 0.5) * 1.6;
            spawn('scatter', ln.lambda, lineIndex(e, t), 1, Math.cos(a), Math.sin(a));
          } else spawn('emit', ln.lambda, lineIndex(e, t), 1.15, ox, oy);
          glow = 1;
          stageName = 'down';
          stT = 0;
        }
      } else if (stageName === 'down' && eU >= 1) {
        if (!isAbs() && queue.length) {
          stageName = 'dwell';
          stT = 0;
        } else {
          stageName = 'rest';
          stT = 0;
        }
      }
      updateGlow(dt);
    }

    /** Farbe des leuchtenden Gases: Mischung der hellen Linien. */
    let gasColor = '#ffffff';
    function updateGlow(dt: number): void {
      void dt;
      const e = el();
      let r = 0;
      let g = 0;
      let b = 0;
      let sum = 0;
      linesOf(e).forEach((ln, i) => {
        const c = wavelengthToRgb(ln.lambda);
        if (!c) return;
        const k = levels[i]! * (0.35 + 0.65 * ln.w);
        r += c[0] * k;
        g += c[1] * k;
        b += c[2] * k;
        sum += k;
      });
      if (sum > 0) {
        const m = Math.max(r, g, b) / sum || 1;
        gasColor = `rgb(${Math.round((r / sum) * (255 / m))},${Math.round((g / sum) * (255 / m))},${Math.round((b / sum) * (255 / m))})`;
      }
    }

    /* ---------- Zeichenhilfen ---------- */
    interface Part {
      t: string;
      k: 0 | 1 | 2;
    }
    function parts(str: string): Part[] {
      const out: Part[] = [];
      const re = /([_^])\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), k: 0 });
        out.push({ t: mm[2]!, k: mm[1] === '_' ? 1 : 2 });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), k: 0 });
      return out;
    }
    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.k ? Math.round(size * 0.72) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.k ? Math.round(size * 0.72) : size;
          g.font = `${weight} ${s}px ${ctx.theme.font}`;
          const yy = y + (q.k === 1 ? size * 0.3 : q.k === 2 ? -size * 0.36 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = halo!;
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string, onDark = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark || onDark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (onDark ? 'rgba(10,14,22,0.78)' : theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.5);
        if (!color.startsWith('#')) g.strokeStyle = onDark ? 'rgba(255,255,255,0.28)' : 'rgba(120,130,150,0.4)';
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? textOn(fill, theme) : color, 'center');
      return { x: x0, y, w, h };
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }

    /** Zahl in Zehnerpotenz-Schreibweise für die Zeichenfläche: „4,57 · 10^[14]“. */
    /** Mantisse und Exponent; die Mantisse wird vorher gerundet (9,996 · 10¹⁴ → 1,00 · 10¹⁵). */
    function sciParts(v: number, d: number): [string, string] {
      let e = Math.floor(Math.log10(Math.abs(v)));
      let m = v / 10 ** e;
      if (Math.abs(Number(m.toFixed(d))) >= 10) {
        e += 1;
        m /= 10;
      }
      return [fmt.fixed(m, d), e < 0 ? `−${-e}` : String(e)];
    }
    function sciCanvas(v: number, d = 2): string {
      const [m, e] = sciParts(v, d);
      return `${m} · 10^[${e}]`;
    }
    function sciHtml(v: number, d = 2): string {
      const [m, e] = sciParts(v, d);
      return `${m} · 10<sup>${e}</sup>`;
    }
    /** Bezeichnung eines Niveaus im Text: Wasserstoff „n = 3“, sonst „3p“. */
    const levelName = (e: ElementData, k: number) => e.levels[k - 1]!.label;
    /** Index für E im Text: Wasserstoff „3“, sonst die Bezeichnung. */
    const levelSub = (e: ElementData, k: number) => (e.id === 'H' ? String(k) : e.levels[k - 1]!.label);
    const lamText = (lam: number) => (lam >= 1000 ? n(Math.round(lam), 0) : n(lam, lam < 100 ? 1 : 0));
    const colorText = (lam: number) => {
      const c = colorNameOf(lam);
      return c ? ctx.t(c) : ctx.t(lam < 380 ? 'uvName' : 'irName');
    };

    /* ---------- Szene: Dunkelkammer mit Atom, Prisma und Schirm ---------- */
    function drawRoom(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,30,50,0.25)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#0b111b' : '#142033');
      bg.addColorStop(1, dark ? '#070b12' : '#0c1522');
      g.fillStyle = bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.fill();
      g.restore();
      const vg = g.createRadialGradient(r.x + r.w * 0.35, r.y + r.h * 0.38, 10, r.x + r.w * 0.35, r.y + r.h * 0.38, Math.hypot(r.w, r.h) * 0.6);
      vg.addColorStop(0, 'rgba(120,150,210,0.10)');
      vg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = vg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.fill();
      g.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.10)';
      g.lineWidth = 1;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 14);
      g.stroke();
    }

    function drawAtom(G: SceneGeo, e: ElementData, t: TransitionDef, alpha: number, withElectron: boolean, grow: number): void {
      const g = surface.g;
      const { ax, ay, R } = G;
      g.save();
      g.globalAlpha *= alpha;
      // Leuchten des Gases (Emission) – zarter Hof in der Mischfarbe der Linien
      if (!isAbs()) {
        const lit = levels.reduce((a, b) => Math.max(a, b), 0);
        const k = 0.1 * lit + 0.22 * glow;
        if (k > 0.004) {
          const hg = g.createRadialGradient(ax, ay, R * 0.1, ax, ay, R * 1.25);
          hg.addColorStop(0, alphaOf(gasColor, k));
          hg.addColorStop(1, 'rgba(0,0,0,0)');
          g.fillStyle = hg;
          g.beginPath();
          g.arc(ax, ay, R * 1.25, 0, TAU);
          g.fill();
        }
      }
      // Bahnen
      const active = new Set([t.u, t.l]);
      e.levels.forEach((_, i) => {
        const k = i + 1;
        const pop = intro.running ? ease.outBack(clamp((intro.t - 0.08 - i * 0.04) / 0.4, 0, 1)) : 1;
        const rr = orbitRadius(e, k, R) * pop * grow;
        if (rr < 1) return;
        const on = active.has(k);
        g.strokeStyle = on ? (k === t.u ? withAlpha('#ffd08a', 0.85) : withAlpha('#9cc3ff', 0.85)) : 'rgba(170,190,225,0.22)';
        g.lineWidth = on ? 1.8 : 1;
        g.setLineDash(on ? [] : [2, 4]);
        g.beginPath();
        g.arc(ax, ay, rr, 0, TAU);
        g.stroke();
      });
      g.setLineDash([]);
      // Kern
      const kr = clamp(R * 0.085, 5, 11) * (intro.running ? ease.outBack(clamp(intro.t / 0.35, 0, 1)) : 1);
      if (kr > 0.5) {
        const ng = g.createRadialGradient(ax - kr * 0.35, ay - kr * 0.4, kr * 0.1, ax, ay, kr);
        ng.addColorStop(0, '#ffd6c2');
        ng.addColorStop(0.5, '#e8603c');
        ng.addColorStop(1, '#8a2410');
        g.save();
        g.shadowColor = 'rgba(255,110,60,0.55)';
        g.shadowBlur = 12;
        g.fillStyle = ng;
        g.beginPath();
        g.arc(ax, ay, kr, 0, TAU);
        g.fill();
        g.restore();
      }
      // Beschriftung der beiden beteiligten Bahnen (oben auf der Bahn)
      if (withElectron && !intro.running) {
        const fs = G.sm ? 10.5 : 11.5;
        for (const k of [t.l, t.u]) {
          const rr = orbitRadius(e, k, R);
          const a = k === t.u ? -Math.PI / 2 - 0.5 : -Math.PI / 2 + 0.5;
          const lx = ax + Math.cos(a) * rr;
          const ly = ay + Math.sin(a) * rr;
          richText(e.levels[k - 1]!.label, lx + (k === t.u ? -4 : 4), ly - 8, fs, k === t.u ? '#ffd08a' : '#9cc3ff', k === t.u ? 'right' : 'left', 700, 'rgba(8,12,20,0.85)');
        }
      }
      g.restore();
      if (!withElectron) return;
      // Elektron
      const [ox, oy] = electronOffset(R);
      const ex = ax + ox * R;
      const ey = ay + oy * R;
      const er = clamp(R * 0.06, 4.5, 8);
      const ea = stage(0.45, 0.3);
      if (ea < 0.01) return;
      g.save();
      g.globalAlpha *= ea * alpha;
      if (flash > 0.01) {
        g.strokeStyle = `rgba(255,236,170,${0.8 * flash})`;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(ex, ey, er + 4 + (1 - flash) * 22, 0, TAU);
        g.stroke();
      }
      const halo = g.createRadialGradient(ex, ey, 0, ex, ey, er * 3.2);
      halo.addColorStop(0, 'rgba(120,180,255,0.32)');
      halo.addColorStop(1, 'rgba(120,180,255,0)');
      g.fillStyle = halo;
      g.beginPath();
      g.arc(ex, ey, er * 3.2, 0, TAU);
      g.fill();
      const eg = g.createRadialGradient(ex - er * 0.35, ey - er * 0.4, er * 0.1, ex, ey, er);
      eg.addColorStop(0, '#e9f3ff');
      eg.addColorStop(0.5, '#5aa0ff');
      eg.addColorStop(1, '#1d4fbf');
      g.fillStyle = eg;
      g.beginPath();
      g.arc(ex, ey, er, 0, TAU);
      g.fill();
      richText('e^[−]', ex + er + 3, ey - er - 2, G.sm ? 10.5 : 11.5, '#cfe2ff', 'left', 700);
      g.restore();
    }

    /** Glasprisma (prisma.webp, 1244 × 1050): linke und rechte Ecke, Spitze (x) und Grundseite (y) in Bildpixeln. */
    const PRISM_IMG = { x0: 2, x1: 1241, apex: 623, bottom: 1046 };
    function drawPrism(G: SceneGeo, a: number): void {
      const g = surface.g;
      const { px, py, ps } = G;
      g.save();
      g.globalAlpha *= a;
      const pts: [number, number][] = [
        [px, py - ps],
        [px - ps * 0.87, py + ps * 0.5],
        [px + ps * 0.87, py + ps * 0.5],
      ];
      const photo = ctx.images.get('prism');
      if (photo) {
        // Foto (gleichseitig, Spitze oben): Grundseite und Breite genau wie das gezeichnete Dreieck
        const P = PRISM_IMG;
        const k = (2 * 0.87 * ps) / (P.x1 - P.x0);
        const w = photo.width * k;
        const h = photo.height * k;
        g.drawImage(scaledSprite(photo, w, h, surface.dpr), px - P.apex * k, py + 0.5 * ps - P.bottom * k, w, h);
      } else {
        const pg = g.createLinearGradient(px - ps, py - ps, px + ps, py + ps);
        pg.addColorStop(0, 'rgba(210,230,255,0.42)');
        pg.addColorStop(0.5, 'rgba(160,190,230,0.16)');
        pg.addColorStop(1, 'rgba(220,235,255,0.32)');
        g.fillStyle = pg;
        g.beginPath();
        g.moveTo(pts[0]![0], pts[0]![1]);
        g.lineTo(pts[1]![0], pts[1]![1]);
        g.lineTo(pts[2]![0], pts[2]![1]);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(225,238,255,0.75)';
        g.lineWidth = 1.4;
        g.lineJoin = 'round';
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(px - ps * 0.12, py - ps * 0.72);
        g.lineTo(px - ps * 0.55, py + ps * 0.1);
        g.stroke();
      }
      g.restore();
    }

    /** Weg eines Photons zum Schirm: Start → Prisma (links) → Unterseite → Schirm bei λ. */
    function prismPath(G: SceneGeo, start: Pt, lam: number): Pt[] {
      const xs = specX(G, lam);
      const q = clamp((xs - G.sx0) / (G.sx1 - G.sx0), 0, 1);
      const inP = { x: G.px - G.ps * 0.48, y: G.py - G.ps * 0.08 };
      const outP = { x: G.px + G.ps * 0.8 * (q - 0.5), y: G.py + G.ps * 0.5 };
      return [start, inP, outP, { x: xs, y: G.sy }];
    }

    function pathOf(G: SceneGeo, q: Photon): Pt[] {
      const atom = { x: G.ax, y: G.ay };
      if (q.kind === 'emit') return prismPath(G, { x: G.ax + q.ox * G.R, y: G.ay + q.oy * G.R }, q.lam);
      if (q.kind === 'lamp') return prismPath(G, { x: G.lampX + 26, y: G.ay + q.oy * G.R * 0.25 }, q.lam);
      const [ox, oy] = electronOffset(G.R);
      const eP = { x: atom.x + ox * G.R, y: atom.y + oy * G.R };
      if (q.kind === 'probe') return [{ x: G.lampX + 26, y: G.ay }, eP];
      if (q.kind === 'collider') return [{ x: atom.x + q.ox * G.R, y: atom.y + q.oy * G.R }, eP];
      // gestreut: vom Atom weg in die Richtung (ox, oy)
      const d = G.R * 1.9;
      return [eP, { x: eP.x + q.ox * d, y: eP.y + q.oy * d }];
    }

    function pathLen(pts: Pt[]): number {
      let s = 0;
      for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
      return s;
    }
    function pointAt(pts: Pt[], s: number): { x: number; y: number; dx: number; dy: number } {
      let left = s;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1]!;
        const b = pts[i]!;
        const l = Math.hypot(b.x - a.x, b.y - a.y);
        if (left <= l || i === pts.length - 1) {
          const u = l > 0 ? clamp(left / l, 0, 1) : 0;
          return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, dx: l > 0 ? (b.x - a.x) / l : 1, dy: l > 0 ? (b.y - a.y) / l : 0 };
        }
        left -= l;
      }
      const z = pts[pts.length - 1]!;
      return { x: z.x, y: z.y, dx: 1, dy: 0 };
    }

    /** Photon als Wellenpaket; die Wellenlänge im Bild wächst mit λ (rot länger als blau). */
    function drawPhoton(G: SceneGeo, q: Photon): void {
      const g = surface.g;
      if (q.kind === 'collider') {
        const pts = pathOf(G, q);
        const at = pointAt(pts, pathLen(pts) * ease.inCubic(clamp(q.s, 0, 1)));
        g.save();
        for (let k = 1; k <= 5; k++) {
          const b = pointAt(pts, Math.max(0, pathLen(pts) * ease.inCubic(clamp(q.s, 0, 1)) - k * 5));
          g.fillStyle = `rgba(190,205,230,${0.25 * (1 - k / 6)})`;
          g.beginPath();
          g.arc(b.x, b.y, 3.6 - k * 0.4, 0, TAU);
          g.fill();
        }
        g.fillStyle = '#d7e3f5';
        g.beginPath();
        g.arc(at.x, at.y, 3.8, 0, TAU);
        g.fill();
        g.restore();
        return;
      }
      const pts = pathOf(G, q);
      const total = pathLen(pts);
      const s = total * clamp(q.s, 0, 1);
      const vis = regionOf(q.lam) === 'vis';
      const col = lamColor(q.lam);
      const wl = clamp(5 + ((q.lam - 380) / 400) * 9, 3.5, 17);
      const len = q.kind === 'lamp' ? 22 : G.sm ? 40 : 56;
      const amp = q.kind === 'lamp' ? 2.4 : G.sm ? 4.5 : 5.5;
      let fade = 1;
      if (q.kind === 'scatter') fade = 1 - q.s;
      if (q.kind === 'lamp') fade = 0.7;
      g.save();
      g.globalAlpha *= fade;
      g.strokeStyle = col;
      g.lineWidth = q.kind === 'lamp' ? 1.3 : 2.2;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (!vis) g.setLineDash([3, 3]);
      if (q.kind !== 'lamp') {
        g.shadowColor = col;
        g.shadowBlur = vis ? 10 : 4;
      }
      g.beginPath();
      const N = q.kind === 'lamp' ? 10 : 28;
      for (let i = 0; i <= N; i++) {
        const d = -len / 2 + (len * i) / N;
        const at = pointAt(pts, clamp(s + d, 0, total));
        const env = Math.exp(-((d / (len * 0.32)) ** 2));
        const off = amp * env * Math.sin((TAU * (s + d)) / wl);
        const x = at.x - at.dy * off;
        const y = at.y + at.dx * off;
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      g.restore();
    }

    function drawLamp(G: SceneGeo, a: number): void {
      const g = surface.g;
      const x = G.lampX;
      const y = G.ay;
      const h = G.sm ? 34 : 44;
      g.save();
      g.globalAlpha *= a;
      // Lichtbündel durch das Gas zum Prisma
      const beam = g.createLinearGradient(x + 20, 0, G.px, 0);
      beam.addColorStop(0, 'rgba(255,250,235,0.20)');
      beam.addColorStop(1, 'rgba(255,250,235,0.06)');
      g.fillStyle = beam;
      g.beginPath();
      g.moveTo(x + 22, y - h * 0.22);
      g.lineTo(G.px - G.ps * 0.45, y - G.ps * 0.25);
      g.lineTo(G.px - G.ps * 0.45, y + G.ps * 0.12);
      g.lineTo(x + 22, y + h * 0.22);
      g.closePath();
      g.fill();
      // Gehäuse
      const body = g.createLinearGradient(x, y - h / 2, x + 22, y + h / 2);
      body.addColorStop(0, '#59626f');
      body.addColorStop(0.5, '#9aa4b1');
      body.addColorStop(1, '#3d444e');
      g.fillStyle = body;
      roundRect(g, x, y - h / 2, 24, h, 5);
      g.fill();
      const fg = g.createRadialGradient(x + 22, y, 1, x + 22, y, h * 0.55);
      fg.addColorStop(0, 'rgba(255,248,225,0.95)');
      fg.addColorStop(1, 'rgba(255,248,225,0)');
      g.fillStyle = fg;
      g.beginPath();
      g.arc(x + 22, y, h * 0.55, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Lichtfächer vom Prisma zum Schirm (Geometrie des Spektralapparats). */
    function drawFan(G: SceneGeo, a: number): void {
      const g = surface.g;
      const yTop = G.py + G.ps * 0.5;
      g.save();
      g.globalAlpha *= a;
      const xa = specX(G, 380);
      const xb = specX(G, 780);
      const grad = g.createLinearGradient(xa, 0, xb, 0);
      for (let lam = 380; lam <= 780; lam += 25) grad.addColorStop((lam - 380) / 400, lamColor(lam));
      g.fillStyle = grad;
      g.globalAlpha *= isAbs() ? 0.16 : 0.05;
      g.beginPath();
      g.moveTo(G.px - G.ps * 0.4, yTop);
      g.lineTo(G.px + G.ps * 0.4, yTop);
      g.lineTo(xb, G.sy);
      g.lineTo(xa, G.sy);
      g.closePath();
      g.fill();
      g.restore();
    }

    /** Lichtstrahlen der hellen Linien (Emission) bzw. Schatten der fehlenden (Absorption). */
    function drawRays(G: SceneGeo, e: ElementData, lv: Float64Array, a: number): void {
      const g = surface.g;
      const yTop = G.py + G.ps * 0.5;
      g.save();
      g.globalAlpha *= a;
      linesOf(e).forEach((ln, i) => {
        const b = lv[i] ?? 0;
        if (b < 0.02 || isAbs()) return;
        const xs = specX(G, ln.lambda);
        const q = clamp((xs - G.sx0) / (G.sx1 - G.sx0), 0, 1);
        const x0 = G.px + G.ps * 0.8 * (q - 0.5);
        const vis = regionOf(ln.lambda) === 'vis';
        const k = b * (0.4 + 0.6 * ln.w) * (vis ? 0.32 : 0.12);
        const rg = g.createLinearGradient(0, yTop, 0, G.sy);
        rg.addColorStop(0, alphaOf(lamColor(ln.lambda), k * 0.4));
        rg.addColorStop(1, alphaOf(lamColor(ln.lambda), k));
        g.strokeStyle = rg;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, yTop);
        g.lineTo(xs, G.sy);
        g.stroke();
      });
      g.restore();
    }

    function drawSpectrum(G: SceneGeo, a: number): void {
      const g = surface.g;
      const sm = G.sm;
      const reveal = stage(0.25, 0.7, ease.inOutCubic);
      const { sx0, sx1, sy, sh } = G;
      g.save();
      g.globalAlpha *= a;
      // Rahmen des Schirms
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.6)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.fillStyle = '#05070b';
      roundRect(g, sx0 - 4, sy - 4, sx1 - sx0 + 8, sh + 8, 7);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, sx0, sy, sx1 - sx0, sh, 4);
      g.clip();
      g.beginPath();
      g.rect(sx0, sy, (sx1 - sx0) * reveal, sh);
      g.clip();
      const xa = specX(G, 380);
      const xb = specX(G, 780);
      const absK = ease2('absK', isAbs() ? 1 : 0, 6);
      // Hintergrund: Emission schwarz, Absorption kontinuierliches Spektrum
      g.fillStyle = '#030406';
      g.fillRect(sx0, sy, sx1 - sx0, sh);
      if (absK > 0.01) {
        const grad = g.createLinearGradient(xa, 0, xb, 0);
        for (let lam = 380; lam <= 780; lam += 10) grad.addColorStop((lam - 380) / 400, lamColor(lam));
        g.save();
        g.globalAlpha *= absK;
        g.fillStyle = grad;
        g.fillRect(xa, sy, xb - xa, sh);
        // Glanz
        const gl = g.createLinearGradient(0, sy, 0, sy + sh);
        gl.addColorStop(0, 'rgba(255,255,255,0.18)');
        gl.addColorStop(0.5, 'rgba(255,255,255,0)');
        gl.addColorStop(1, 'rgba(0,0,0,0.25)');
        g.fillStyle = gl;
        g.fillRect(xa, sy, xb - xa, sh);
        g.restore();
      }
      // UV- und IR-Zone schraffiert
      for (const [x0, x1] of [
        [sx0, sx0 + G.uvW],
        [sx1 - G.irW, sx1],
      ] as const) {
        g.fillStyle = 'rgba(70,80,100,0.35)';
        g.fillRect(x0, sy, x1 - x0, sh);
        g.strokeStyle = 'rgba(160,175,200,0.16)';
        g.lineWidth = 1;
        g.beginPath();
        for (let x = x0 - sh; x < x1; x += 7) {
          g.moveTo(x, sy + sh);
          g.lineTo(x + sh, sy);
        }
        g.stroke();
      }
      // Linien (alte Elementlinien blenden aus)
      const drawLines = (e: ElementData, lv: Float64Array, alpha: number, abs: boolean, flashes: Float64Array | null) => {
        if (alpha < 0.01) return;
        linesOf(e).forEach((ln, i) => {
          const b = (lv[i] ?? 0) * alpha;
          if (b < 0.01) return;
          const x = specX(G, ln.lambda);
          const vis = regionOf(ln.lambda) === 'vis';
          const k = b * (0.45 + 0.55 * ln.w);
          const fl = flashes ? (flashes[i] ?? 0) : 0;
          if (abs) {
            if (!vis) {
              g.strokeStyle = `rgba(255,255,255,${0.45 * k})`;
              g.setLineDash([3, 3]);
              g.lineWidth = 1.5;
              g.beginPath();
              g.moveTo(x, sy + 2);
              g.lineTo(x, sy + sh - 2);
              g.stroke();
              g.setLineDash([]);
              return;
            }
            g.fillStyle = `rgba(0,0,0,${Math.min(0.92, 0.35 + 0.6 * k)})`;
            g.fillRect(x - (sm ? 1.4 : 1.8), sy, sm ? 2.8 : 3.6, sh);
            return;
          }
          if (!vis) {
            g.strokeStyle = `rgba(220,225,240,${0.5 * k})`;
            g.setLineDash([3, 3]);
            g.lineWidth = 1.6;
            g.beginPath();
            g.moveTo(x, sy + 2);
            g.lineTo(x, sy + sh - 2);
            g.stroke();
            g.setLineDash([]);
            return;
          }
          const col = lamColor(ln.lambda);
          g.save();
          g.globalAlpha *= Math.min(1, 0.2 + k);
          g.shadowColor = col;
          g.shadowBlur = 8 + 10 * fl;
          g.fillStyle = col;
          const w = (sm ? 2.6 : 3.2) + 2 * fl;
          g.fillRect(x - w / 2, sy + 1, w, sh - 2);
          g.fillStyle = `rgba(255,255,255,${0.35 * k + 0.4 * fl})`;
          g.fillRect(x - 0.6, sy + 1, 1.2, sh - 2);
          g.restore();
        });
      };
      if (swap.running) drawLines(prevEl, prevLevels, 1 - swap.value, prevAbs, null);
      if (clearFade.running) drawLines(el(), clearedLevels, 1 - clearFade.value, isAbs(), null);
      drawLines(el(), levels, swap.running ? swap.value : 1, isAbs(), hitFlash);
      g.restore();
      // Markierung des gewählten Übergangs
      const t = sel();
      const ln = lineOf(el(), t.u, t.l);
      const xs = specX(G, ln.lambda);
      const mk = ease2('mkX', xs, 9);
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.moveTo(mk, sy + sh + 3);
      g.lineTo(mk - 5, sy + sh + 10);
      g.lineTo(mk + 5, sy + sh + 10);
      g.closePath();
      g.fill();
      // Achse: sichtbarer Bereich in nm, UV/IR an den Rändern
      const fs = sm ? 10.5 : 11;
      const font = `600 ${fs}px ${ctx.theme.font}`;
      g.font = font;
      g.textBaseline = 'middle';
      const ty = sy + sh + (sm ? 18 : 20);
      const step = sx1 - sx0 < 420 ? 100 : 50;
      // Platz für die λ-Anzeige unter dem Schirm freihalten
      const lamLab = `λ = ${lamText(ln.lambda)} nm`;
      const lw = richWidth(lamLab, fs) + 16;
      const lx0 = clamp(mk - lw / 2, G.r.x + 6, G.r.x + G.r.w - 6 - lw);
      const free = (x: number, w: number) => !showVal() || x + w / 2 < lx0 - 4 || x - w / 2 > lx0 + lw + 4;
      for (let lam = 400; lam <= 750; lam += step) {
        const x = specX(G, lam);
        g.strokeStyle = 'rgba(200,210,230,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x + 0.5, sy + sh + 3);
        g.lineTo(x + 0.5, sy + sh + 7);
        g.stroke();
        if (!free(x, 24) || Math.abs(x - mk) < 14) continue;
        g.textAlign = 'center';
        g.fillStyle = 'rgba(205,215,232,0.85)';
        g.fillText(String(lam), x, ty);
      }
      g.textAlign = 'center';
      g.fillStyle = 'rgba(190,175,255,0.9)';
      if (free(sx0 + G.uvW / 2, 20)) g.fillText(ctx.t('uv'), sx0 + G.uvW / 2, ty);
      g.fillStyle = 'rgba(255,175,150,0.9)';
      if (free(sx1 - G.irW / 2, 20)) g.fillText(ctx.t('ir'), sx1 - G.irW / 2, ty);
      g.restore();
      // λ des gewählten Übergangs unter dem Schirm
      if (showVal()) pill(lx0, sy + sh + (sm ? 9 : 10), lamLab, '#ffffff', 'left', fs, undefined, true);
    }

    function drawScene(G: SceneGeo): void {
      const g = surface.g;
      const r = G.r;
      drawRoom(r);
      g.save();
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.clip();
      const ik = stage(0, 0.5);
      const lampA = ease2('lampA', isAbs() ? 1 : 0, 6) * ik;
      if (lampA > 0.01) drawLamp(G, lampA);
      drawFan(G, ik);
      if (swap.running) drawRays(G, prevEl, prevLevels, 1 - swap.value);
      drawRays(G, el(), levels, swap.running ? swap.value : 1);
      if (swap.running) {
        const u = swap.value;
        drawAtom(G, prevEl, prevSel, 1 - u, false, 1);
        drawAtom(G, el(), sel(), u, true, 0.6 + 0.4 * ease.outCubic(u));
      } else drawAtom(G, el(), sel(), ik, true, 1);
      drawPrism(G, ik);
      for (const q of photons) drawPhoton(G, q);
      drawSpectrum(G, stage(0.2, 0.5));
      // Kopfzeile: Element und Art des Spektrums
      const fs = G.sm ? 11.5 : 12.5;
      const e = el();
      const elLab = `${ctx.t(e.id)} · ${e.id}`;
      const lp = pill(r.x + 12, r.y + 12, elLab, '#ffffff', 'left', fs, undefined, true);
      const modeLab = ctx.t(isAbs() ? 'abs' : 'em') + (p.run === 'all' && !G.sm ? ` · ${ctx.t(isAbs() ? 'allAbs' : 'allEm')}` : '');
      const mw = richWidth(modeLab, fs) + 16;
      const mx = Math.max(lp.x + lp.w + 8, r.x + r.w - 12 - mw);
      pill(mx, r.y + 12, modeLab, '#ffffff', 'left', fs, isAbs() ? withAlpha(blue(), 0.85) : withAlpha(orange(), 0.9), true);
      // Hinweis „Modell“ am Atom
      const hint = ctx.t('model');
      g.save();
      g.globalAlpha *= 0.75 * ik;
      richText(hint, G.ax, G.ay + G.R + (G.sm ? 11 : 14), G.sm ? 10.5 : 11, 'rgba(200,212,232,0.85)', 'center', 600);
      g.restore();
      if (lampA > 0.05) {
        g.save();
        g.globalAlpha *= lampA;
        richText(ctx.t('lamp'), G.lampX, G.ay - (G.sm ? 26 : 32), G.sm ? 10.5 : 11, 'rgba(255,240,210,0.9)', 'left', 600);
        g.restore();
      }
      g.restore();
    }

    /* ---------- Termschema ---------- */
    function termGeo(R: Rect, e: ElementData): TermGeo {
      const sm = R.w < 330 || R.h < 230;
      const isH = e.id === 'H';
      const padL = isH ? (sm ? 48 : 52) : sm ? 40 : 46;
      const padR = isH ? (sm ? 44 : 52) : sm ? 10 : 14;
      const top = R.y + (sm ? 56 : 62) + (e.columns.length ? (sm ? 12 : 14) : 0);
      const bot = R.y + R.h - (sm ? 20 : 24);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - padR, h: bot - top };
      const Es = e.levels.map((q) => q.E);
      const ground = Es[0]!;
      const next = Math.min(...Es.slice(1));
      const brk = next - ground > 0.42 * -ground ? next : null;
      const gap = sm ? 26 : 32;
      const yOf = (E: number) => {
        if (brk === null) return A.y + A.h - ((E - ground) / -ground) * A.h;
        if (E < brk - 1e-9) return A.y + A.h;
        return A.y + A.h - gap - ((E - brk) / -brk) * (A.h - gap);
      };
      const y = Es.map(yOf);
      const cols = Math.max(1, e.columns.length);
      const cw = A.w / cols;
      const xa = e.levels.map((q) => (isH ? A.x : A.x + q.col * cw + cw * 0.14));
      const xb = e.levels.map((q) => (isH ? A.x + A.w : A.x + (q.col + 1) * cw - cw * 0.14));
      const arrows: Arrow[] = [];
      if (isH) {
        // Gruppen nach Serien (unteres Niveau), wie im Lehrbuch nebeneinander
        const groups = new Map<number, TransitionDef[]>();
        e.transitions.forEach((t) => groups.set(t.l, [...(groups.get(t.l) ?? []), t]));
        const total = e.transitions.length + (groups.size - 1) * 1.3 + 1;
        const unit = A.w / total;
        let x = A.x + unit;
        for (const [, list] of [...groups.entries()].sort((a, b) => a[0] - b[0])) {
          for (const t of list.sort((a, b) => a.u - b.u)) {
            arrows.push({ t, idx: e.transitions.indexOf(t), x0: x, y0: y[t.u - 1]!, x1: x, y1: y[t.l - 1]! });
            x += unit;
          }
          x += unit * 1.3;
        }
      } else {
        // Grotrian-Schema: schräge Pfeile zwischen den Spalten, Enden auf den Linien verteilt
        const ends = new Map<string, number[]>();
        e.transitions.forEach((t, i) => {
          const cu = e.levels[t.u - 1]!.col;
          const cl = e.levels[t.l - 1]!.col;
          const su = Math.sign(cl - cu) || 1;
          for (const [k, s] of [
            [t.u, su],
            [t.l, -su],
          ] as const) {
            const key = `${k}|${s}`;
            ends.set(key, [...(ends.get(key) ?? []), i]);
          }
        });
        const endX = (k: number, s: number, i: number) => {
          const list = ends.get(`${k}|${s}`) ?? [i];
          const j = list.indexOf(i);
          const c = (xa[k - 1]! + xb[k - 1]!) / 2;
          const half = (xb[k - 1]! - xa[k - 1]!) / 2;
          return c + s * half * (0.25 + (0.6 * (j + 1)) / (list.length + 1));
        };
        e.transitions.forEach((t, i) => {
          const cu = e.levels[t.u - 1]!.col;
          const cl = e.levels[t.l - 1]!.col;
          const su = Math.sign(cl - cu) || 1;
          arrows.push({ t, idx: i, x0: endX(t.u, su, i), y0: y[t.u - 1]!, x1: endX(t.l, -su, i), y1: y[t.l - 1]! });
        });
      }
      return { A, y, xa, xb, arrows, brk, sm, yOf };
    }

    let lastTerm: TermGeo | null = null;
    let lastScene: SceneGeo | null = null;
    let hoverArrow = -1;

    function drawTermContent(R: Rect, e: ElementData, t: TransitionDef, alpha: number, lv: Float64Array, live: boolean): TermGeo {
      const g = surface.g;
      const theme = ctx.theme;
      const T = termGeo(R, e);
      const { A, sm } = T;
      const fs = sm ? 10.5 : 11.5;
      g.save();
      g.globalAlpha *= alpha;
      // Energieachse
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x - 8.5, A.y - 14);
      g.lineTo(A.x - 8.5, A.y + A.h + 2);
      g.stroke();
      g.fillStyle = theme.axis;
      g.beginPath();
      g.moveTo(A.x - 8.5, A.y - 20);
      g.lineTo(A.x - 12.5, A.y - 12);
      g.lineTo(A.x - 4.5, A.y - 12);
      g.closePath();
      g.fill();
      // „E in eV“: mit Spaltenköpfen über der Pfeilspitze, sonst rechts neben ihr (sonst schneidet der Pfeil den Text)
      if (e.columns.length) richText(ctx.t('axisE'), R.x + 12, A.y - (sm ? 32 : 36), fs, theme.muted, 'left', 600);
      else richText(ctx.t('axisE'), A.x - 2, A.y - 16, fs, theme.muted, 'left', 600);
      // Achsenbruch
      if (T.brk !== null) {
        const yb = A.y + A.h - (sm ? 14 : 17);
        g.strokeStyle = theme.bg;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(A.x - 8.5, yb - 5);
        g.lineTo(A.x - 8.5, yb + 5);
        g.stroke();
        g.strokeStyle = theme.axis;
        g.lineWidth = 1.3;
        for (const dy of [-4, 3]) {
          g.beginPath();
          g.moveTo(A.x - 14, yb + dy + 3);
          g.lineTo(A.x - 3, yb + dy - 3);
          g.stroke();
        }
      }
      // Ionisierungsgrenze E = 0
      const y0 = A.y;
      g.strokeStyle = withAlpha(theme.muted, 0.7);
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(A.x - 8, y0 + 0.5);
      // nur bis zum Ende der Niveaulinien, damit die Beschriftungen rechts frei bleiben
      g.lineTo(A.x + A.w, y0 + 0.5);
      g.stroke();
      g.setLineDash([]);
      // Legende in der Zeile von „E in eV“: gestrichelt = Ionisierung (E = 0)
      const ly = A.y - (e.columns.length ? (sm ? 32 : 36) : sm ? 22 : 24);
      const iw = richText(ctx.t('ion'), R.x + R.w - 12, ly, sm ? 10 : 10.5, theme.muted, 'right', 600);
      g.strokeStyle = withAlpha(theme.muted, 0.7);
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(R.x + R.w - 12 - iw - 30, ly + 0.5);
      g.lineTo(R.x + R.w - 12 - iw - 6, ly + 0.5);
      g.stroke();
      g.setLineDash([]);
      // Achsenbeschriftung: bei Wasserstoff die Werte der Niveaus, sonst ganze eV
      const used: number[] = [];
      const axisLab = (yy: number, txt: string, strong = false) => {
        if (used.some((u) => Math.abs(u - yy) < 11)) return;
        used.push(yy);
        richText(txt, A.x - 12, yy, sm ? 10 : 10.5, strong ? theme.text : theme.muted, 'right', strong ? 750 : 600);
      };
      axisLab(y0, '0');
      if (e.id === 'H') e.levels.forEach((q, i) => axisLab(T.y[i]!, fmt.fixed(q.E, 2), i + 1 === t.u || i + 1 === t.l));
      else {
        axisLab(T.y[0]!, n(e.levels[0]!.E, 1), t.l === 1);
        const lo = T.brk ?? e.levels[0]!.E;
        const stepE = -lo > 4 ? 2 : 1;
        for (let E = -stepE; E > lo + 0.3; E -= stepE) {
          const yy = T.yOf(E);
          g.strokeStyle = theme.axis;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(A.x - 12, yy);
          g.lineTo(A.x - 8, yy);
          g.stroke();
          axisLab(yy, n(E, 0));
        }
      }
      // Spaltenköpfe (Grotrian)
      if (e.columns.length) {
        const cw = A.w / e.columns.length;
        e.columns.forEach((c, i) => richText(c, A.x + (i + 0.5) * cw, A.y - (sm ? 14 : 16), fs, theme.muted, 'center', 700));
      }
      // Niveaus
      const grow = (i: number) => (intro.running && live ? ease.outCubic(clamp((intro.t - 0.2 - i * 0.03) / 0.4, 0, 1)) : 1);
      e.levels.forEach((_, i) => {
        const k = i + 1;
        const on = k === t.u || k === t.l;
        const gx = grow(i);
        if (gx < 0.01) return;
        g.strokeStyle = on ? theme.text : withAlpha(theme.text, 0.55);
        g.lineWidth = on ? 2.6 : 1.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(T.xa[i]!, T.y[i]!);
        g.lineTo(T.xa[i]! + (T.xb[i]! - T.xa[i]!) * gx, T.y[i]!);
        g.stroke();
      });
      // Übergänge
      const selIdx = lineIndex(e, t);
      for (const a of T.arrows) {
        const ln = lineOf(e, a.t.u, a.t.l);
        const isSel = a.idx === selIdx;
        const lit = lv[a.idx] ?? 0;
        const sA = live ? ease2(`sel${a.idx}`, isSel ? 1 : 0, 9) : isSel ? 1 : 0;
        const base = 0.22 + 0.45 * lit * (p.run === 'all' ? 1 : 0.6) + (hoverArrow === a.idx && live ? 0.3 : 0);
        const col = cardColor(ln.lambda);
        const up = isAbs();
        const [xs, ys, xe, ye] = up ? [a.x1, a.y1, a.x0, a.y0] : [a.x0, a.y0, a.x1, a.y1];
        const grow2 = live && intro.running ? ease.outCubic(clamp((intro.t - 0.45 - a.idx * 0.02) / 0.4, 0, 1)) : 1;
        if (grow2 < 0.01) continue;
        const xe2 = xs + (xe - xs) * grow2;
        const ye2 = ys + (ye - ys) * grow2;
        g.save();
        g.globalAlpha *= Math.min(1, base + sA * 0.8);
        if (sA > 0.02) {
          g.shadowColor = col;
          g.shadowBlur = 8 * sA;
        }
        if (regionOf(ln.lambda) !== 'vis') g.setLineDash(isSel ? [5, 3] : [3, 3]);
        arrowPx(xs, ys + (up ? -1 : 1), xe2, ye2 + (up ? 2 : -2), col, 1.3 + 1.9 * sA, 6 + 3 * sA);
        g.restore();
      }
      // Beschriftung der Niveaus: Wasserstoff rechts, sonst über der Linie (ohne Überlappung)
      if (e.id === 'H') {
        let lastY = Infinity;
        for (let i = 0; i < e.levels.length; i++) {
          const k = i + 1;
          let yy = T.y[i]!;
          if (lastY - yy < 12) yy = lastY - 12;
          lastY = yy;
          const on = k === t.u || k === t.l;
          richText(`n = ${k}`, A.x + A.w + 6, yy, sm ? 10.5 : 11, on ? theme.text : theme.muted, 'left', on ? 800 : 600, haloCol());
        }
      } else {
        const placed: Rect[] = [];
        e.levels.forEach((q, i) => {
          const k = i + 1;
          const on = k === t.u || k === t.l;
          const w = richWidth(q.label, fs - 0.5, on ? 800 : 650);
          const cands = [T.xa[i]!, T.xb[i]! - w];
          for (const xx of cands) {
            const rr: Rect = { x: xx, y: T.y[i]! - 13, w, h: 11 };
            if (placed.some((p2) => rr.x < p2.x + p2.w + 3 && p2.x < rr.x + rr.w + 3 && rr.y < p2.y + p2.h + 1 && p2.y < rr.y + rr.h + 1)) continue;
            placed.push(rr);
            richText(q.label, xx, T.y[i]! - 7.5, fs - 0.5, on ? theme.text : theme.muted, 'left', on ? 800 : 650, haloCol());
            break;
          }
        });
      }
      // Serien bei Wasserstoff
      if (e.id === 'H') {
        const groups = new Map<number, Arrow[]>();
        for (const a of T.arrows) groups.set(a.t.l, [...(groups.get(a.t.l) ?? []), a]);
        for (const [l, list] of groups) {
          const s = hydrogenSeries(l);
          if (!s) continue;
          const x0 = list[0]!.x0;
          const x1 = list[list.length - 1]!.x0;
          const name = ctx.t(s);
          const w = richWidth(name, sm ? 10 : 10.5, 700);
          if ((w > x1 - x0 + 24 || sm) && l > 3) continue;
          const on = t.l === l;
          richText(name, (x0 + x1) / 2, T.y[l - 1]! + (sm ? 10 : 11), sm ? 10 : 10.5, on ? theme.text : theme.muted, 'center', on ? 800 : 650, haloCol());
        }
      }
      // λ am gewählten Pfeil
      const aSel = T.arrows.find((a) => a.idx === selIdx);
      if (aSel && live && showVal() && !intro.running) {
        const ln = lineOf(e, t.u, t.l);
        const lab = `${lamText(ln.lambda)} nm`;
        const w = richWidth(lab, fs) + 16;
        const mx = (aSel.x0 + aSel.x1) / 2;
        const my = (aSel.y0 + aSel.y1) / 2;
        const right = mx + 8 + w < R.x + R.w - 6;
        const x0 = right ? mx + 7 : mx - 7 - w;
        const yy = clamp(my - (fs + 11) / 2, A.y - 6, A.y + A.h - fs - 12);
        pill(clamp(x0, R.x + 6, R.x + R.w - 6 - w), yy, lab, cardColor(ln.lambda), 'left', fs);
      }
      g.restore();
      return T;
    }

    /** Position des Elektrons im Termschema (an einem Pfeilende oder in der Mitte der Linie). */
    function termAnchor(T: TermGeo, k: number, via: TransitionDef | null): Pt {
      if (via) {
        const a = T.arrows.find((q) => q.t.u === via.u && q.t.l === via.l);
        if (a && via.u === k) return { x: a.x0, y: a.y0 };
        if (a && via.l === k) return { x: a.x1, y: a.y1 };
      }
      return { x: (T.xa[k - 1]! + T.xb[k - 1]!) / 2, y: T.y[k - 1]! };
    }

    function drawTerm(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 230;
      const ty = R.y + (sm ? 17 : 20);
      const tw = richText(ctx.t(R.w < 300 ? 'termTitleS' : 'termTitle'), R.x + 14, ty, sm ? 12 : 13, theme.text, 'left', 750);
      const e = el();
      const hint = ctx.t(R.w < 360 ? 'hint' : 'tapHint');
      const hw = richWidth(hint, sm ? 10 : 10.5, 600);
      if (R.x + 14 + tw + 12 + hw < R.x + R.w - 12 && !ctx.locked) richText(hint, R.x + R.w - 14, ty, sm ? 10 : 10.5, theme.muted, 'right', 600);
      let T: TermGeo;
      if (swap.running) {
        const u = swap.t;
        if (u < 0.45) drawTermContent(R, prevEl, prevSel, 1 - u / 0.45, prevLevels, false);
        T = drawTermContent(R, e, sel(), u < 0.45 ? 0 : (u - 0.45) / 0.55, levels, true);
      } else T = drawTermContent(R, e, sel(), 1, levels, true);
      lastTerm = T;
      // Tastatur: Pfeile im Termschema wie Antippen
      ctx.setKeyTargets(
        T.arrows.map((a) => ({
          id: `t${a.t.u}-${a.t.l}`,
          label: ctx.t('keyT').replace('{u}', levelName(e, a.t.u)).replace('{l}', levelName(e, a.t.l)),
          rect: { x: Math.min(a.x0, a.x1) - 7, y: Math.min(a.y0, a.y1) - 4, w: Math.abs(a.x1 - a.x0) + 14, h: Math.abs(a.y1 - a.y0) + 8 },
          disabled: ctx.locked,
          activate: () => selectLine(a.idx),
        })),
      );
      // Elektron im Termschema
      const ea = stage(0.6, 0.3) * (swap.running ? clamp((swap.t - 0.45) / 0.55, 0, 1) : 1);
      if (ea > 0.01) {
        const via = eVia ?? sel();
        const a0 = termAnchor(T, eFrom, via);
        const a1 = termAnchor(T, eTo, via);
        const u = ease.inOutCubic(clamp(eU, 0, 1));
        const x = a0.x + (a1.x - a0.x) * u;
        const y = a0.y + (a1.y - a0.y) * u;
        g.save();
        g.globalAlpha *= ea;
        const hg = g.createRadialGradient(x, y, 0, x, y, 14);
        hg.addColorStop(0, withAlpha(blue(), 0.45));
        hg.addColorStop(1, withAlpha(blue(), 0));
        g.fillStyle = hg;
        g.beginPath();
        g.arc(x, y, 14, 0, TAU);
        g.fill();
        g.fillStyle = blue();
        g.beginPath();
        g.arc(x, y, 5, 0, TAU);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.6;
        g.stroke();
        g.restore();
      }
      g.restore();
    }

    /* ---------- Karte „Photon“ ---------- */
    function drawInfo(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 150;
      const pad = sm ? 12 : 16;
      const e = el();
      const t = sel();
      const dE = ease2('dE', lineOf(e, t.u, t.l).dE, 7);
      const lam = wavelengthOf(dE);
      const f = frequencyOf(dE);
      const col = cardColor(lam);
      const ty = R.y + (sm ? 17 : 20);
      // Titel mit Farbtupfer
      const dot = lamColor(lam);
      g.save();
      g.shadowColor = regionOf(lam) === 'vis' ? dot : 'rgba(0,0,0,0)';
      g.shadowBlur = 8;
      g.fillStyle = regionOf(lam) === 'vis' ? dot : theme.muted;
      g.beginPath();
      g.arc(R.x + pad + 6, ty, 6, 0, TAU);
      g.fill();
      g.restore();
      richText(ctx.t('photonTitle'), R.x + pad + 18, ty, sm ? 12 : 13, theme.text, 'left', 750);
      const chip = showVal() ? colorText(lam) : '?';
      const cs = sm ? 10.5 : 11;
      const cw = richWidth(chip, cs) + 16;
      pill(R.x + R.w - pad - cw, ty - (cs + 11) / 2, chip, col, 'left', cs, regionOf(lam) === 'vis' ? col : undefined);
      // Rechnung in drei Zeilen
      const rows = 3;
      const top = ty + (sm ? 16 : 22);
      const waveH = R.h >= 120 ? clamp(R.h - 150, sm ? 22 : 28, 54) : 0;
      const avail = R.y + R.h - top - (sm ? 8 : 12) - waveH;
      const lh = clamp(avail / rows, 16, sm ? 22 : 30);
      const size = clamp(lh * 0.58, 11.5, sm ? 13 : 15);
      const su = levelSub(e, t.u);
      const sl = levelSub(e, t.l);
      const v = showVal();
      const hid = '?';
      const r1 = `ΔE = E_[${su}] − E_[${sl}] = ${v ? `${fmt.fixed(dE, 2)} eV` : hid}`;
      const r2 = `f = ΔE / h = ${v ? `${sciCanvas(f, 2)} Hz` : hid}`;
      const r3 = `λ = c / f = ${v ? `${lamText(lam)} nm` : hid}`;
      let y = top + lh / 2;
      const x = R.x + pad;
      for (const [txt, c] of [
        [r1, theme.text],
        [r2, theme.text],
        [r3, col],
      ] as const) {
        let s = size;
        while (s > 10.5 && richWidth(txt, s, 700) > R.w - 2 * pad) s -= 0.5;
        richText(txt, x, y, s, c, 'left', 700);
        y += lh;
      }
      // kleine Welle: Wellenlänge im Bild proportional zu λ (Maßstab gleich für alle Linien)
      if (waveH > 0) {
        const wy = R.y + R.h - (sm ? 8 : 12) - waveH / 2;
        const x0 = R.x + pad;
        const x1 = R.x + R.w - pad;
        const per = clamp(lam / 22, 9, 90);
        const tt = (performance.now() / 1000) * (prefersReducedMotion() ? 0 : 1.2);
        g.save();
        g.strokeStyle = cardColor(lam);
        if (regionOf(lam) !== 'vis') g.setLineDash([3, 3]);
        g.lineWidth = 2.2;
        g.beginPath();
        for (let xx = x0; xx <= x1; xx += 1.5) {
          const env = Math.min(1, (xx - x0) / 24, (x1 - xx) / 24);
          const yy = wy + Math.sin(TAU * ((xx - x0) / per - tt)) * (waveH * 0.36) * env;
          if (xx === x0) g.moveTo(xx, yy);
          else g.lineTo(xx, yy);
        }
        g.stroke();
        g.restore();
        if (!prefersReducedMotion()) animating = true;
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const e = el();
      const t = sel();
      const ln = lineOf(e, t.u, t.l);
      const Eu = e.levels[t.u - 1]!.E;
      const El = e.levels[t.l - 1]!.E;
      const s = e.id === 'H' ? hydrogenSeries(t.l) : null;
      const series = s ? tr('series', { s: ctx.t(s === 'brackett' || s === 'pfund' ? `${s}Full` : s), n: String(t.l) }) : '';
      const nameOf = (k: number) => (e.id === 'H' ? `<var>n</var> = ${k}` : levelName(e, k));
      const fx = (v: number) => fmt.fixed(v, 2);
      ctx.readout('trans', { html: tr(isAbs() ? 'trAbs' : 'trEm', { lu: nameOf(t.u), ll: nameOf(t.l), Eu: fx(Eu), El: fx(El), series }) });
      const color = colorText(ln.lambda);
      ctx.readout('photon', {
        html: tr('photon', {
          su: levelSub(e, t.u),
          sl: levelSub(e, t.l),
          Eu: fx(Eu),
          El: fx(El),
          dE: fx(ln.dE),
          dEJ: sciHtml(joule(ln.dE), 2),
          f: sciHtml(ln.f, 2),
          lam: lamText(ln.lambda),
          color,
        }),
      });
      const vis = linesOf(e)
        .map((q, i) => ({ q, i }))
        .filter(({ q }) => regionOf(q.lambda) === 'vis')
        .sort((a, b) => a.q.lambda - b.q.lambda);
      const selI = lineIndex(e, t);
      const rows = vis.map(({ q, i }) => `<tr${i === selI ? ' class="is-current"' : ''}><td>${n(q.lambda, 1)}</td><td>${ctx.t(colorNameOf(q.lambda) ?? 'red')}</td><td>${levelName(e, q.u)} → ${levelName(e, q.l)}</td></tr>`);
      ctx.readout('lines', { html: rows.length ? `<table class="mini-table"><tr><th>${ctx.t('thL')}</th><th>${ctx.t('thC')}</th><th>${ctx.t('thT')}</th></tr>${rows.join('')}</table>` : ctx.t('noVis') });
      ctx.setAction('go', { enabled: !ctx.locked });
      ctx.setAction('clear', { enabled: !ctx.locked });
    }

    /* ---------- Antippen ---------- */
    function hitArrow(px: number, py: number): number {
      const T = lastTerm;
      if (!T || ctx.locked) return -1;
      let best = -1;
      let bd = 9;
      for (const a of T.arrows) {
        const dx = a.x1 - a.x0;
        const dy = a.y1 - a.y0;
        const l2 = dx * dx + dy * dy || 1;
        const u = clamp(((px - a.x0) * dx + (py - a.y0) * dy) / l2, 0, 1);
        const d = Math.hypot(px - (a.x0 + dx * u), py - (a.y0 + dy * u));
        if (d < bd) {
          bd = d;
          best = a.idx;
        }
      }
      return best;
    }
    function hitLine(px: number, py: number): number {
      const G = lastScene;
      if (!G || ctx.locked) return -1;
      if (py < G.sy - 6 || py > G.sy + G.sh + 12) return -1;
      let best = -1;
      let bd = 9;
      linesOf(el()).forEach((ln, i) => {
        const d = Math.abs(specX(G, ln.lambda) - px);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    }
    function selectLine(i: number): void {
      const t = el().transitions[i];
      if (!t) return;
      ctx.set({ u: t.u, l: t.l });
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitArrow(px, py) >= 0 || hitLine(px, py) >= 0,
      pointerDown: (q: { px: number; py: number }) => {
        const a = hitArrow(q.px, q.py);
        const i = a >= 0 ? a : hitLine(q.px, q.py);
        if (i < 0) return false;
        selectLine(i);
        return true;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (q: { px: number; py: number } | null) => {
        const a = q ? hitArrow(q.px, q.py) : -1;
        const i = q ? (a >= 0 ? a : hitLine(q.px, q.py)) : -1;
        if (a !== hoverArrow) {
          hoverArrow = a;
          ctx.requestRender();
        }
        surface.setCursor(i >= 0 ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'input' && changed.has('el')) {
          const [u, l] = DEFAULT_SEL[el().id];
          ctx.set({ u, l });
        } else if (source === 'input' && (changed.has('u') || changed.has('l'))) {
          // nicht vorgesehene Wahl auf einen gültigen Übergang bringen
          const t = resolveTransition(el(), p.u, p.l);
          if (t.u !== p.u || t.l !== p.l) ctx.set({ u: t.u, l: t.l });
        }
        const t = sel();
        if (source === 'init') {
          shownEl = el();
          shownAbs = isAbs();
          levels = new Float64Array(shownEl.transitions.length);
          hitFlash = new Float64Array(levels.length);
          intro.play();
          if (prefersReducedMotion()) fillStatic();
          else queueMicrotask(() => ctx.clock.play());
          resetCycle();
        } else if (el() !== shownEl || isAbs() !== shownAbs) {
          swapTo();
          resetCycle();
          if (prefersReducedMotion()) fillStatic();
        } else if (t.u !== shownSel.u || t.l !== shownSel.l || changed.has('run')) {
          resetCycle();
          if (prefersReducedMotion()) fillStatic();
        }
        shownSel = t;
        if (source === 'replace' && !prefersReducedMotion()) ctx.clock.play();
        ctx.clock.speed = p.slow ? 0.35 : 1;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          resetCycle();
          stT = T_REST;
          if (prefersReducedMotion()) fillStatic();
          else if (!ctx.clock.playing) ctx.clock.play();
        } else if (id === 'clear') {
          clearedLevels = levels;
          levels = new Float64Array(el().transitions.length);
          hitFlash = new Float64Array(levels.length);
          clearFade.play();
        }
        ctx.requestRender();
      },

      tick(dt) {
        tickCycle(Math.min(dt, 0.05));
      },

      resetTime() {
        resetCycle();
        photons = [];
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        const lay = computeLayout();
        surface.begin();
        const G = sceneGeo(lay.scene);
        lastScene = G;
        drawScene(G);
        drawTerm(lay.term, stage(0.15, 0.5));
        drawInfo(lay.info, stage(0.3, 0.5));
        if (animating || intro.running || swap.running || clearFade.running || photons.length || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});

