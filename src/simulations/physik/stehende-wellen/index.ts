import { clamp, defineSimulation, ease, measureSubText, mixColor, prefersReducedMotion, roundRect, scaledSprite, subText, Surface, textOn, Tween, withAlpha, type Rect, type SubTextStyle } from '../../../sim-core';
import {
  antinodes,
  DrivenString,
  drivenProfile,
  eigenFrequency,
  eigenNu,
  eigenWavelength,
  frontRamp,
  harmonic,
  modeShape,
  nearestOrder,
  nodes,
  pipeBc,
  pointKind,
  reflectionAmplitude,
  reflectionAntinodes,
  reflectionNodes,
  refFrequency,
  resonanceAmplitude,
  smooth,
  travelling,
  type Bc,
  type EndType,
  type Pipe,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Dauer von T₁ = 2L/c im Bild (s, ohne Zeitlupe). */
const VIS_T1 = 1.5;
/** Höchstens so viele Schwingungen pro T₁ im Bild (darüber läuft die Zeit zusätzlich langsamer). */
const MAX_VIS_NU = 6;
/** Bereich der Resonanzkurve in Vielfachen von c/(2L). */
const NU_MAX = 6.5;
/** Resonanzkurve (Ŷ/a über ν), einmal berechnet. */
const CURVE_STEP = 0.01;
let curveCache: Float64Array | null = null;
function resCurve(): Float64Array {
  if (!curveCache) {
    const n = Math.round(NU_MAX / CURVE_STEP);
    curveCache = new Float64Array(n + 1);
    for (let i = 0; i <= n; i++) curveCache[i] = resonanceAmplitude(i * CURVE_STEP, undefined, 72);
  }
  return curveCache;
}
function curveAt(nu: number): number {
  const c = resCurve();
  const s = clamp(nu / CURVE_STEP, 0, c.length - 1);
  const i = Math.min(c.length - 2, Math.floor(s));
  const q = s - i;
  return c[i]! * (1 - q) + c[i + 1]! * q;
}
/** Ŷ/a im eingeschwungenen Zustand, auch oberhalb des Diagrammbereichs. */
function steadyAmp(nu: number): number {
  return nu <= NU_MAX ? curveAt(nu) : resonanceAmplitude(nu, undefined, 72);
}
/** Resonanzüberhöhung (Ŷ/a bei ν = n). */
const PEAK = 9.05;

type Mode = 'ent' | 'eig' | 'res';
type Med = 'rope' | 'air';

interface Layout {
  scene: Rect;
  info: Rect;
  chart: Rect;
  side: boolean;
}

interface Geo {
  r: Rect;
  sm: boolean;
  /** Enden des Wellenträgers in Pixeln. */
  x0: number;
  x1: number;
  cy: number;
  /** halbe Höhe der Bahn (größte Auslenkung). */
  H: number;
  topRow: number;
  kRow: number;
  brRow: number;
  rulerY: number;
  rulerH: number;
}

interface EigCfg {
  bc: Bc;
  n: number;
  med: Med;
}

/** Marke für Knoten oder Bauch. */
interface Mark {
  x: number;
  node: boolean;
  /** 0 … 1: Sichtbarkeit/Pop. */
  a: number;
}

/**
 * Stehende Wellen: Entstehung durch Überlagerung von hinlaufender und
 * reflektierter Welle (festes und loses Ende), Eigenschwingungen von Seil und
 * Luftsäule mit Knoten und Bäuchen, Erregung mit beliebiger Frequenz und
 * Resonanz wie beim Melde-Versuch (finite Differenzen mit schwacher Dämpfung).
 */
export default defineSimulation({
  id: 'stehende-wellen',
  animated: true,
  dragHint: true,
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'eig'
      ? L('Tipp: Tippe unten eine Eigenfrequenz an, um die Eigenschwingung zu wechseln.', 'Tip: tap a natural frequency below to switch the normal mode.')
      : v.mode === 'res'
        ? L('Tipp: Ziehe in der Resonanzkurve, um die Frequenz des Erregers zu ändern.', 'Tip: drag in the resonance curve to change the driving frequency.')
        : L('Tipp: Ziehe den Punkt P auf dem Seil mit Maus oder Finger.', 'Tip: drag point P along the rope with the mouse or a finger.'),
  layout: { aspect: 1.4, aspectNarrow: 0.54 },
  images: { driver: 'erreger.webp', pulley: 'umlenkrolle.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'ent', label: L('Entstehung durch Reflexion', 'Formation by reflection') },
        { value: 'eig', label: L('Eigenschwingungen', 'Normal modes') },
        { value: 'res', label: L('Erreger und Resonanz', 'Driver and resonance') },
      ],
      default: 'ent',
    },
    {
      key: 'end',
      type: 'choice',
      label: L('Ende des Seils', 'End of the rope'),
      options: [
        { value: 'fix', label: L('festes Ende', 'fixed end') },
        { value: 'free', label: L('loses Ende', 'free end') },
      ],
      default: 'fix',
      visibleIf: (v) => v.mode === 'ent',
    },
    {
      key: 'med',
      type: 'choice',
      label: L('Wellenträger', 'Medium'),
      options: [
        { value: 'rope', label: L('Seil bzw. Saite', 'rope or string') },
        { value: 'air', label: L('Luftsäule im Rohr', 'air column in a pipe') },
      ],
      default: 'rope',
      visibleIf: (v) => v.mode === 'eig',
    },
    {
      key: 'bc',
      type: 'choice',
      label: L('Enden', 'Ends'),
      options: [
        { value: 'ff', label: L('beide fest', 'both fixed') },
        { value: 'fl', label: L('links fest, rechts lose', 'left fixed, right free') },
        { value: 'll', label: L('beide lose', 'both free') },
      ],
      default: 'ff',
      visibleIf: (v) => v.mode === 'eig' && v.med === 'rope',
    },
    {
      key: 'pipe',
      type: 'choice',
      label: L('Rohr', 'Pipe'),
      options: [
        { value: 'open', label: L('beidseitig offen', 'open at both ends') },
        { value: 'closed', label: L('gedackt (links zu)', 'stopped (left closed)') },
        { value: 'shut', label: L('beidseitig geschlossen', 'closed at both ends') },
      ],
      default: 'closed',
      visibleIf: (v) => v.mode === 'eig' && v.med === 'air',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Ordnung n', 'Order n'),
      help: L('n = 1: Grundschwingung, n = 2: 1. Oberschwingung … Oder: unten eine Eigenfrequenz antippen.', 'n = 1: fundamental, n = 2: first overtone … Or tap a natural frequency below.'),
      min: 1,
      max: 6,
      step: 1,
      default: 1,
      visibleIf: (v) => v.mode === 'eig',
    },
    {
      key: 'f',
      type: 'number',
      label: L('Frequenz f des Erregers', 'Frequency f of the driver'),
      help: L('Beim Erreger auch in der Resonanzkurve ziehen – nahe einer Eigenfrequenz rastet sie ein.', 'With the driver you can also drag in the resonance curve – it snaps near a natural frequency.'),
      min: 10,
      max: 1500,
      step: 1,
      default: 660,
      unit: 'Hz',
      visibleIf: (v) => v.mode !== 'eig',
    },
    { key: 'L', type: 'number', label: L('Länge L', 'Length L'), help: L('Länge von Seil, Saite bzw. Rohr.', 'Length of the rope, string or pipe.'), min: 0.3, max: 1.5, step: 0.01, default: 0.65, unit: 'm' },
    {
      key: 'c',
      type: 'number',
      label: L('Ausbreitungsgeschwindigkeit c', 'Wave speed c'),
      help: L('Bei einer Saite wächst c mit der Spannkraft (c = √(F/μ)); in Luft ist c ≈ 340 m/s.', 'For a string c grows with the tension (c = √(F/μ)); in air c ≈ 340 m/s.'),
      min: 100,
      max: 500,
      step: 1,
      default: 286,
      unit: 'm/s',
    },
    {
      key: 'pd',
      type: 'number',
      label: L('Punkt P: Abstand vom Ende', 'Point P: distance from the end'),
      help: L('Oder: P auf dem Seil ziehen.', 'Or drag P along the rope.'),
      min: 0,
      max: 1.5,
      step: 0.01,
      default: 0.11,
      unit: 'm',
      visibleIf: (v) => v.mode === 'ent',
    },
    { key: 'inc', type: 'boolean', group: 'view', label: L('hinlaufende Welle (blau)', 'incident wave (blue)'), default: true, visibleIf: (v) => v.mode === 'ent' },
    { key: 'refl', type: 'boolean', group: 'view', label: L('reflektierte Welle (rot)', 'reflected wave (red)'), default: true, visibleIf: (v) => v.mode === 'ent' },
    { key: 'sum', type: 'boolean', group: 'view', label: L('Überlagerung (grün)', 'superposition (green)'), default: true, visibleIf: (v) => v.mode === 'ent' },
    { key: 'env', type: 'boolean', group: 'view', label: L('Hüllkurve', 'Envelope'), default: true },
    { key: 'kb', type: 'boolean', group: 'view', label: L('Knoten (K) und Bäuche (B) markieren', 'Mark nodes (N) and antinodes (A)'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'go', label: L('Welle neu losschicken', 'Send the wave again'), primary: true, visibleIf: (v) => v.mode !== 'eig' },
    { id: 'snd', label: L('Ton anhören', 'Play sound') },
  ],
  readouts: [
    { key: 'main', label: L('Wellenlänge und Frequenz', 'Wavelength and frequency'), spoiler: true },
    { key: 'kb', label: L('Knoten und Bäuche', 'Nodes and antinodes'), spoiler: true },
    { key: 'p', label: L('Punkt P', 'Point P'), spoiler: true },
    { key: 'res', label: L('Resonanz', 'Resonance'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Reflexion am festen Ende', 'Reflection at a fixed end'), values: {} },
    { id: 'free', label: L('Reflexion am losen Ende', 'Reflection at a free end'), values: { end: 'free', pd: 0.22 } },
    { id: 'guitar', label: L('Gitarrensaite: Grundton 220 Hz', 'Guitar string: fundamental 220 Hz'), values: { mode: 'eig' } },
    { id: 'over', label: L('Saite: 2. Oberschwingung', 'String: second overtone'), values: { mode: 'eig', n: 3 } },
    { id: 'pipe', label: L('Gedackte Pfeife: nur ungerade Vielfache', 'Stopped pipe: odd multiples only'), values: { mode: 'eig', med: 'air', pipe: 'closed', L: 0.5, c: 340, n: 2 } },
    { id: 'melde', label: L('Melde-Versuch: Resonanz bei f₂', 'Melde’s experiment: resonance at f₂'), values: { mode: 'res', f: 440 } },
  ],
  strings: {
    de: {
      canvas:
        'Seil bzw. Luftsäule mit stehender Welle: hinlaufende (blau) und reflektierte Welle (rot) überlagern sich zur stehenden Welle (grün) mit Knoten K und Bäuchen B und Hüllkurve; Eigenschwingungen mit festen und losen Enden bzw. offenen und geschlossenen Rohrenden; Erreger mit einstellbarer Frequenz und Resonanzkurve; darunter Karten mit Formeln, Zeigerdiagramm, Eigenfrequenzen und Diagrammen',
      hdrEnt: 'f = {f} Hz · λ = {l} m',
      hdrEntS: 'λ = {l} m',
      hdrEig: 'f_{{n}} = {f} Hz · λ_{{n}} = {l} m',
      hdrEigS: 'f_{{n}} = {f} Hz',
      hdrRes: 'f = {f} Hz · f_1 = {f1} Hz',
      hdrResS: 'f = {f} Hz',
      slowPill: 'im Bild {k}× langsamer',
      slowPillS: '{k}× langsamer',
      fixEnd: 'festes Ende',
      freeEnd: 'loses Ende',
      closed: 'geschlossen',
      open: 'offen',
      inc: 'hinlaufend',
      refl: 'reflektiert',
      sum: 'Überlagerung',
      K: 'K',
      B: 'B',
      rowMove: 'Bewegung',
      rowPress: 'Druck',
      lam2: 'λ/2 = {l} m',
      lam4: 'λ/4 = {l} m',
      unitD: 'Abstand vom Ende in m',
      unitDS: 'd in m',
      unitX: 'x in m',
      driver: 'Erreger',
      standing: 'stehende Welle',
      cardP: 'Punkt P',
      vNode: 'Knoten',
      vAnti: 'Bauch',
      vMid: 'dazwischen',
      vWait: 'wartet',
      rowD: 'd =',
      rowQ: 'd/λ =',
      ruleFix: 'A = 2ŷ · |sin(2π · d/λ)|',
      ruleFree: 'A = 2ŷ · |cos(2π · d/λ)|',
      notYet: 'reflektierte Welle noch nicht da',
      chartP: 'Schwingung in P',
      chartPS: 'in P',
      now: 'jetzt',
      titleFund: 'Grundschwingung',
      titleOver: '{k}. Oberschwingung',
      harmPill: 'f_{{n}} = {h} · f_1',
      harmPill1: 'f_1',
      lawEq: 'L = {n} · λ/2',
      lawUneq: 'L = {h} · λ/4',
      lamRow: 'λ_{{n}} = {l} m',
      fRow: 'f_{{n}} = c/λ_{{n}} = {f} Hz',
      fRowS: 'f_{{n}} = {f} Hz',
      countRow: '{k} Knoten · {b} Bäuche',
      countRow1: '{k} Knoten · 1 Bauch',
      genEq: 'allgemein: f_n = n · c/(2L)',
      genUneq: 'allgemein: f_n = (2n − 1) · c/(4L)',
      countAir: 'Bewegung: {k} K, {b} B · Druck umgekehrt',
      countAirS: 'Bewegung: {k} K, {b} B',
      ladder: 'Eigenfrequenzen',
      ladderTap: 'antippen',
      allMult: 'alle Vielfachen von f_1',
      oddOnly: 'nur ungerade Vielfache von f_1',
      cardRes: 'Seil am Erreger',
      resYes: 'Resonanz',
      resNo: 'keine Resonanz',
      fNow: 'f = {f} Hz',
      fNext: 'nächste Eigenfrequenz: f_{{n}} = {f} Hz',
      fNextS: 'f_{{n}} = {f} Hz',
      ampBig: 'Ŷ = {a} · a',
      ampSub: 'größte Auslenkung, a = Erreger',
      chartRes: 'Resonanzkurve',
      chartResS: 'Resonanz',
      axisF: 'f in Hz',
      live: 'jetzt',
      theory: 'eingeschwungen',
      mainEnt:
        '<var>λ</var> = <span class="frac"><span><var>c</var></span><span><var>f</var></span></span> = <span class="frac"><span>{c} m/s</span><span>{f} Hz</span></span> = <strong>{l} m</strong> · Abstand benachbarter Knoten: <var>λ</var>/2 = {h} m',
      mainEig:
        '{law} → <var>λ</var><sub>{n}</sub> = {lf} = <strong>{l} m</strong><br><var>f</var><sub>{n}</sub> = <span class="frac"><span><var>c</var></span><span><var>λ</var><sub>{n}</sub></span></span> = <span class="frac"><span>{c} m/s</span><span>{l} m</span></span> = <strong>{f} Hz</strong> = {h} · <var>f</var><sub>1</sub>{odd}',
      lawEqHtml: '<var>L</var> = <var>n</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span>',
      lawUneqHtml: '<var>L</var> = (2<var>n</var> − 1) · <span class="frac"><span><var>λ</var></span><span>4</span></span>',
      lfEq: '<span class="frac"><span>2<var>L</var></span><span>{n}</span></span>',
      lfUneq: '<span class="frac"><span>4<var>L</var></span><span>{h}</span></span>',
      oddNote: '<br>Bei ungleichen Enden gibt es nur ungerade Vielfache: <var>f</var><sub><var>n</var></sub> = (2<var>n</var> − 1) · <span class="frac"><span><var>c</var></span><span>4<var>L</var></span></span>.',
      mainRes:
        'Eigenfrequenzen: <var>f</var><sub><var>n</var></sub> = <var>n</var> · <span class="frac"><span><var>c</var></span><span>2<var>L</var></span></span> = <var>n</var> · {f1} Hz → {list} …<br>Erreger: <var>f</var> = <strong>{f} Hz</strong> = {q} · <var>f</var><sub>1</sub>',
      kbEntFix: 'Am festen Ende wird die Welle mit Phasensprung um π reflektiert: Dort ist immer ein <strong>Knoten</strong>. Knoten im Abstand <var>d</var> = <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span> vom Ende: {nodes}; Bäuche bei <var>d</var> = <span class="frac"><span><var>λ</var></span><span>4</span></span> + <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span>: {anti}.',
      kbEntFree: 'Am losen Ende wird die Welle ohne Phasensprung reflektiert: Dort ist immer ein <strong>Bauch</strong>. Bäuche im Abstand <var>d</var> = <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span> vom Ende: {anti}; Knoten bei <var>d</var> = <span class="frac"><span><var>λ</var></span><span>4</span></span> + <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span>: {nodes}.',
      kbEig: 'Knoten bei <var>x</var> = {nodes} m · Bäuche bei <var>x</var> = {anti} m (gemessen vom linken Ende). Benachbarte Knoten sind <var>λ</var>/2 = {h} m voneinander entfernt.',
      kbAir: 'Bewegung der Luftteilchen (Schnelle): Knoten bei <var>x</var> = {nodes} m, Bäuche bei <var>x</var> = {anti} m. Ein geschlossenes Ende ist ein Schnelleknoten, ein offenes Ende ein Schnellebauch. Der Druck schwankt genau umgekehrt: Druckbäuche an den Schnelleknoten, Druckknoten an den Schnellebäuchen.',
      kbRes: 'Nahe <var>f</var><sub>{n}</sub> bildet sich die {n}. Eigenschwingung aus: Knoten bei <var>x</var> = {nodes} m (der Erreger bewegt sich nur wenig und wirkt fast wie ein Knoten).',
      kbResNo: 'Abseits der Eigenfrequenzen gibt es keine ausgeprägten Knoten und Bäuche – das Seil bewegt sich nur wenig.',
      pText:
        '<var>d</var> = {d} m = {q} · <var>λ</var> → <var>A</var> = 2<var>ŷ</var> · |{fn}(2π · {q})| = <strong>{a} · <var>ŷ</var></strong> – {verdict}',
      pNode: 'Knoten: hinlaufende und reflektierte Welle sind dort immer entgegengesetzt',
      pAnti: 'Bauch: beide Wellen sind dort immer gleichphasig',
      pMid: 'zwischen Knoten und Bauch',
      resText:
        'Größte Auslenkung im eingeschwungenen Zustand: <var>Ŷ</var> ≈ <strong>{a} · <var>a</var></strong> (<var>a</var>: Amplitude des Erregers) – {verdict}',
      resYesText: 'Resonanz: Der Erreger trifft eine Eigenfrequenz, jede Periode verstärkt die stehende Welle.',
      resNoText: 'keine Resonanz: Der Erreger arbeitet mal mit, mal gegen die Bewegung, das Seil bleibt unruhig und klein.',
      resNearText: 'nahe der Resonanz.',
      nowEnt: 't = {t} ms · in P: y_h = {yh} ŷ, y_r = {yr} ŷ, y = {y} ŷ',
      nowEig: 't = {t} ms · Phase {ph}° · Auslenkung am Bauch: {y} · ŷ',
      nowRes: 't = {t} ms · größte Auslenkung jetzt: {y} · a',
      sndOff: 'Ton aus',
      sndOn: 'Ton anhören',
      goEnt: 'Welle neu losschicken',
      goRes: 'Aus der Ruhe starten',
      noneOnRope: 'keine (das Seil ist kürzer)',
    },
    en: {
      canvas:
        'Rope or air column with a standing wave: the incident (blue) and reflected wave (red) superpose to form the standing wave (green) with nodes N, antinodes A and envelope; normal modes with fixed and free ends or open and closed pipe ends; a driver with adjustable frequency and a resonance curve; below, cards with formulas, phasor diagram, natural frequencies and graphs',
      hdrEnt: 'f = {f} Hz · λ = {l} m',
      hdrEntS: 'λ = {l} m',
      hdrEig: 'f_{{n}} = {f} Hz · λ_{{n}} = {l} m',
      hdrEigS: 'f_{{n}} = {f} Hz',
      hdrRes: 'f = {f} Hz · f_1 = {f1} Hz',
      hdrResS: 'f = {f} Hz',
      slowPill: '{k}× slower in the picture',
      slowPillS: '{k}× slower',
      fixEnd: 'fixed end',
      freeEnd: 'free end',
      closed: 'closed',
      open: 'open',
      inc: 'incident',
      refl: 'reflected',
      sum: 'superposition',
      K: 'N',
      B: 'A',
      rowMove: 'motion',
      rowPress: 'pressure',
      lam2: 'λ/2 = {l} m',
      lam4: 'λ/4 = {l} m',
      unitD: 'distance from the end in m',
      unitDS: 'd in m',
      unitX: 'x in m',
      driver: 'driver',
      standing: 'standing wave',
      cardP: 'Point P',
      vNode: 'node',
      vAnti: 'antinode',
      vMid: 'in between',
      vWait: 'waiting',
      rowD: 'd =',
      rowQ: 'd/λ =',
      ruleFix: 'A = 2ŷ · |sin(2π · d/λ)|',
      ruleFree: 'A = 2ŷ · |cos(2π · d/λ)|',
      notYet: 'reflected wave not here yet',
      chartP: 'Oscillation at P',
      chartPS: 'at P',
      now: 'now',
      titleFund: 'Fundamental',
      titleOver: 'Overtone {k}',
      harmPill: 'f_{{n}} = {h} · f_1',
      harmPill1: 'f_1',
      lawEq: 'L = {n} · λ/2',
      lawUneq: 'L = {h} · λ/4',
      lamRow: 'λ_{{n}} = {l} m',
      fRow: 'f_{{n}} = c/λ_{{n}} = {f} Hz',
      fRowS: 'f_{{n}} = {f} Hz',
      countRow: '{k} nodes · {b} antinodes',
      countRow1: '{k} nodes · 1 antinode',
      genEq: 'in general: f_n = n · c/(2L)',
      genUneq: 'in general: f_n = (2n − 1) · c/(4L)',
      countAir: 'motion: {k} N, {b} A · pressure reversed',
      countAirS: 'motion: {k} N, {b} A',
      ladder: 'Natural frequencies',
      ladderTap: 'tap to choose',
      allMult: 'all multiples of f_1',
      oddOnly: 'odd multiples of f_1 only',
      cardRes: 'Rope on the driver',
      resYes: 'resonance',
      resNo: 'no resonance',
      fNow: 'f = {f} Hz',
      fNext: 'nearest natural frequency: f_{{n}} = {f} Hz',
      fNextS: 'f_{{n}} = {f} Hz',
      ampBig: 'Ŷ = {a} · a',
      ampSub: 'largest displacement, a = driver',
      chartRes: 'Resonance curve',
      chartResS: 'Resonance',
      axisF: 'f in Hz',
      live: 'now',
      theory: 'steady state',
      mainEnt:
        '<var>λ</var> = <span class="frac"><span><var>c</var></span><span><var>f</var></span></span> = <span class="frac"><span>{c} m/s</span><span>{f} Hz</span></span> = <strong>{l} m</strong> · distance between neighbouring nodes: <var>λ</var>/2 = {h} m',
      mainEig:
        '{law} → <var>λ</var><sub>{n}</sub> = {lf} = <strong>{l} m</strong><br><var>f</var><sub>{n}</sub> = <span class="frac"><span><var>c</var></span><span><var>λ</var><sub>{n}</sub></span></span> = <span class="frac"><span>{c} m/s</span><span>{l} m</span></span> = <strong>{f} Hz</strong> = {h} · <var>f</var><sub>1</sub>{odd}',
      lawEqHtml: '<var>L</var> = <var>n</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span>',
      lawUneqHtml: '<var>L</var> = (2<var>n</var> − 1) · <span class="frac"><span><var>λ</var></span><span>4</span></span>',
      lfEq: '<span class="frac"><span>2<var>L</var></span><span>{n}</span></span>',
      lfUneq: '<span class="frac"><span>4<var>L</var></span><span>{h}</span></span>',
      oddNote: '<br>With unequal ends there are only odd multiples: <var>f</var><sub><var>n</var></sub> = (2<var>n</var> − 1) · <span class="frac"><span><var>c</var></span><span>4<var>L</var></span></span>.',
      mainRes:
        'Natural frequencies: <var>f</var><sub><var>n</var></sub> = <var>n</var> · <span class="frac"><span><var>c</var></span><span>2<var>L</var></span></span> = <var>n</var> · {f1} Hz → {list} …<br>Driver: <var>f</var> = <strong>{f} Hz</strong> = {q} · <var>f</var><sub>1</sub>',
      kbEntFix: 'At a fixed end the wave is reflected with a phase jump of π: there is always a <strong>node</strong> there. Nodes at a distance <var>d</var> = <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span> from the end: {nodes}; antinodes at <var>d</var> = <span class="frac"><span><var>λ</var></span><span>4</span></span> + <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span>: {anti}.',
      kbEntFree: 'At a free end the wave is reflected without a phase jump: there is always an <strong>antinode</strong> there. Antinodes at a distance <var>d</var> = <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span> from the end: {anti}; nodes at <var>d</var> = <span class="frac"><span><var>λ</var></span><span>4</span></span> + <var>k</var> · <span class="frac"><span><var>λ</var></span><span>2</span></span>: {nodes}.',
      kbEig: 'Nodes at <var>x</var> = {nodes} m · antinodes at <var>x</var> = {anti} m (measured from the left end). Neighbouring nodes are <var>λ</var>/2 = {h} m apart.',
      kbAir: 'Motion of the air particles (velocity): nodes at <var>x</var> = {nodes} m, antinodes at <var>x</var> = {anti} m. A closed end is a velocity node, an open end a velocity antinode. The pressure varies the other way round: pressure antinodes at the velocity nodes, pressure nodes at the velocity antinodes.',
      kbRes: 'Close to <var>f</var><sub>{n}</sub> normal mode {n} builds up: nodes at <var>x</var> = {nodes} m (the driver moves only a little and acts almost like a node).',
      kbResNo: 'Away from the natural frequencies there are no clear nodes and antinodes – the rope moves only a little.',
      pText:
        '<var>d</var> = {d} m = {q} · <var>λ</var> → <var>A</var> = 2<var>ŷ</var> · |{fn}(2π · {q})| = <strong>{a} · <var>ŷ</var></strong> – {verdict}',
      pNode: 'node: the incident and reflected waves are always opposite there',
      pAnti: 'antinode: both waves are always in phase there',
      pMid: 'between node and antinode',
      resText:
        'Largest displacement in the steady state: <var>Ŷ</var> ≈ <strong>{a} · <var>a</var></strong> (<var>a</var>: amplitude of the driver) – {verdict}',
      resYesText: 'resonance: the driver hits a natural frequency, every period reinforces the standing wave.',
      resNoText: 'no resonance: the driver sometimes works with, sometimes against the motion; the rope stays restless and small.',
      resNearText: 'close to resonance.',
      nowEnt: 't = {t} ms · at P: y_i = {yh} ŷ, y_r = {yr} ŷ, y = {y} ŷ',
      nowEig: 't = {t} ms · phase {ph}° · displacement at an antinode: {y} · ŷ',
      nowRes: 't = {t} ms · largest displacement now: {y} · a',
      sndOff: 'Sound off',
      sndOn: 'Play sound',
      goEnt: 'Send the wave again',
      goRes: 'Start from rest',
      noneOnRope: 'none (the rope is shorter)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    /** Frequenz: ab 100 Hz ganzzahlig, darunter mit einer Nachkommastelle (f₁ kann bis 16,7 Hz sinken). */
    const fHz = (f: number) => fmt.fixed(f, f >= 99.95 ? 0 : 1);
    /** Längen in Listen einheitlich mit 3 Nachkommastellen, das Ende selbst als „0“. */
    const len3 = (x: number) => (Math.abs(x) < 5e-13 ? '0' : fmt.fixed(x, 3));
    /** Aufgabenmodus: Frequenzen und Wellenlängen verraten die Lösungen (Ergebnis „Wellenlänge und Frequenz“). */
    const hideF = () => ctx.isHidden('main');
    const lamLbl = (key: 'lam2' | 'lam4', v: number) => (hideF() ? (key === 'lam2' ? 'λ/2' : 'λ/4') : tr(key, { l: n(v, 3) }));
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const teal = () => ctx.theme.series[5]!;

    const mode = () => p.mode as Mode;
    const endType = () => p.end as EndType;
    const med = () => p.med as Med;
    const eigBc = (): Bc => (med() === 'air' ? pipeBc(p.pipe as Pipe) : (p.bc as Bc));
    const curCfg = (): EigCfg => ({ bc: eigBc(), n: p.n, med: med() });
    const f1ref = () => refFrequency(p.L, p.c);
    const nuEnt = () => p.f / f1ref();
    const lamEnt = () => p.c / p.f;

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 9, instant = false): number {
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

    /* ---------- Zeit ---------- */
    const slowF = () => (p.slow ? 0.25 : 1);
    /** τ (in T₁) pro echter Sekunde im Bild. */
    const rateFor = (nu: number) => (1 / VIS_T1) * Math.min(1, MAX_VIS_NU / Math.max(nu, 1e-6)) * slowF();
    /** Simulierte Zeit in ms (echte Zeit des Vorgangs). */
    let simMs = 0;

    // Entstehung
    let tauE = 0;
    let thetaE = 0;
    let sweepSpan = 0;
    let sweepDone = 0;
    // gleichmäßige Ausbreitung, die am Ende weich abbremst (Hermite: Anfangssteigung 1,4, Endsteigung 0)
    const sweep = new Tween(4000, (q) => 1.4 * q + 0.2 * q * q - 0.6 * q * q * q);
    const lockGlow = new Tween(1400, ease.outCubic);
    let locked = false;

    // Eigenschwingungen
    let eigNow: EigCfg = curCfg();
    let eigOld: EigCfg | null = null;
    let thetaN = 0;
    let thetaOld = 0;
    const morph = new Tween(900, ease.inOutCubic);
    const pluck = new Tween(1300, ease.outCubic);

    // Resonanz
    const rope = new DrivenString(120);
    let fdAcc = 0;
    const envArr = new Float64Array(rope.n + 1);
    let ampLive = 0;

    const intro = new Tween(900, ease.outCubic);
    const modeFade = new Tween(520, ease.outCubic);

    function lockThreshold(nu: number): number {
      return 1 + frontRamp(nu);
    }

    function startSweep(): void {
      const nu = nuEnt();
      tauE = 0;
      thetaE = 0;
      locked = false;
      const need = lockThreshold(nu) + 0.12;
      // Endbild: eine Achtelperiode nach dem Maximum – so sind hinlaufende und reflektierte Welle beide zu sehen
      const target = (endType() === 'fix' ? 0 : Math.PI / 2) + Math.PI / 4;
      const base = TAU * nu * need - Math.PI * nu - target;
      const extra = (((Math.PI - (base % Math.PI)) % Math.PI) + Math.PI) % Math.PI;
      sweepSpan = need + extra / (TAU * nu);
      sweepDone = 0;
      const ms = clamp((sweepSpan / rateFor(nu)) * 1000 * 2.4, 4200, 8000);
      sweep.play(prefersReducedMotion() ? 0 : ms);
    }

    /** Fortschritt der Einstiegs-Ausbreitung in τ und θ übernehmen. */
    function advanceSweep(nu: number): void {
      if (!sweepSpan) return;
      const cur = sweep.value * sweepSpan;
      const d = cur - sweepDone;
      sweepDone = cur;
      tauE += d;
      thetaE += TAU * nu * d;
      simMs += (d / f1ref()) * 1000;
      if (!sweep.running) sweepSpan = 0;
    }

    function resetRes(steady: boolean): void {
      rope.theta = 0;
      if (steady) rope.setSteady(nuEnt());
      else rope.rest();
      fdAcc = 0;
      envArr.fill(0);
      if (steady) {
        const Ymax = steadyAmp(nuEnt());
        for (let j = 0; j <= rope.n; j++) envArr[j] = Math.abs(resonanceProfile(j / rope.n));
        ampLive = Ymax;
      } else ampLive = 0;
    }

    /** Betrag des eingeschwungenen Profils |Y(x̂)| für die aktuelle Frequenz. */
    function resonanceProfile(xh: number): number {
      const Y = drivenProfile(nuEnt(), xh);
      return Math.hypot(Y.re, Y.im);
    }

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const sh = Math.round(h * (h < 430 ? 0.6 : 0.61));
        const y = sh + 12;
        const iw = Math.round((w - 12) * 0.43);
        return { scene: { x: 0, y: 0, w, h: sh }, info: { x: 0, y, w: iw, h: h - y }, chart: { x: iw + 12, y, w: w - iw - 12, h: h - y }, side };
      }
      const sh = Math.round(h * 0.44);
      const ih = Math.round(clamp(h * 0.24, 132, 176));
      return { scene: { x: 0, y: 0, w, h: sh }, info: { x: 0, y: sh + 10, w, h: ih }, chart: { x: 0, y: sh + 20 + ih, w, h: h - sh - 20 - ih }, side };
    }
    let lay = computeLayout();

    function buildGeo(r: Rect, Ls: number): Geo {
      const sm = r.w < 560;
      const fs = sm ? 11 : 12;
      const top = r.y + 10 + fs + 11 + (sm ? 6 : 10);
      const rulerH = sm ? 22 : 26;
      const rulerY = r.y + r.h - 10 - rulerH;
      const brH = sm ? 18 : 22;
      const rowH = sm ? 15 : 18;
      const brRow = rulerY - 6 - brH / 2;
      const kRow = brRow - brH / 2 - rowH / 2;
      const topRow = top + rowH / 2;
      const laneTop = top + rowH + 4;
      const laneBot = kRow - rowH / 2 - 4;
      const H = Math.max(14, (laneBot - laneTop) / 2);
      const cy = (laneTop + laneBot) / 2;
      const m = mode();
      const padL = m === 'res' ? (sm ? 58 : 84) : sm ? 26 : 40;
      const padR = m === 'res' ? (sm ? 44 : 64) : sm ? 26 : 40;
      const avail = r.w - padL - padR;
      let x0 = r.x + padL;
      let x1 = r.x + r.w - padR;
      if (m !== 'ent') {
        const frac = 0.62 + 0.38 * clamp((Ls - 0.3) / 1.2, 0, 1);
        const len = avail * frac;
        const cx = r.x + padL + avail / 2;
        x0 = cx - len / 2;
        x1 = cx + len / 2;
      } else {
        x0 = r.x + (sm ? 14 : 22);
      }
      return { r, sm, x0, x1, cy, H, topRow, kRow, brRow, rulerY, rulerH };
    }

    /* Text mit Index über den Kern-Helfer `subText` (Indexgröße wie bisher auf ganze Pixel gerundet). */
    const subStyle = (size: number, color: string, weight: number, align: CanvasTextAlign = 'center'): SubTextStyle => ({
      size,
      family: ctx.theme.font,
      weight,
      color,
      align,
      subScale: Math.round(size * 0.74) / size,
      subShift: 0.3,
    });
    function richWidth(str: string, size: number, weight = 700): number {
      return measureSubText(surface.g, str, subStyle(size, '', weight));
    }
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      return subText(surface.g, str, x, y, { ...subStyle(size, color, weight, align), ...(halo ? { halo: ctx.theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)' } : {}) });
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? textOn(fill, theme) : color, 'center', false);
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

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
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

    /** Seil als Linie mit weichem Schatten und Glanzlicht. */
    function strokeRope(pts: [number, number][], color: string, width: number, shadow = true, glow = 0): void {
      if (pts.length < 2) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      const path = () => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      };
      g.save();
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (glow > 0.01) {
        g.strokeStyle = withAlpha(color, 0.28 * glow);
        g.lineWidth = width + 12 * glow;
        path();
        g.stroke();
      }
      if (shadow) {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,30,50,0.28)';
        g.shadowBlur = 7;
        g.shadowOffsetY = 4;
        g.strokeStyle = color;
        g.lineWidth = width;
        path();
        g.stroke();
        g.restore();
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      path();
      g.stroke();
      if (width >= 3) {
        g.translate(0, -width * 0.22);
        g.strokeStyle = withAlpha('#ffffff', dark ? 0.28 : 0.42);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }

    /** Fläche zwischen +A(x) und −A(x) (Hüllkurve) mit weichem Verlauf. */
    function envelope(xs: number[], amp: number[], cy: number, color: string, alpha: number, H: number): void {
      if (alpha < 0.01 || xs.length < 2) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      const grad = g.createLinearGradient(0, cy - H, 0, cy + H);
      grad.addColorStop(0, withAlpha(color, 0.2));
      grad.addColorStop(0.5, withAlpha(color, 0.06));
      grad.addColorStop(1, withAlpha(color, 0.2));
      g.fillStyle = grad;
      g.beginPath();
      xs.forEach((x, i) => (i ? g.lineTo(x, cy - amp[i]!) : g.moveTo(x, cy - amp[i]!)));
      for (let i = xs.length - 1; i >= 0; i--) g.lineTo(xs[i]!, cy + amp[i]!);
      g.closePath();
      g.fill();
      g.strokeStyle = withAlpha(color, 0.55);
      g.lineWidth = 1.3;
      g.setLineDash([5, 4]);
      for (const sgn of [-1, 1]) {
        g.beginPath();
        xs.forEach((x, i) => (i ? g.lineTo(x, cy + sgn * amp[i]!) : g.moveTo(x, cy + sgn * amp[i]!)));
        g.stroke();
      }
      g.setLineDash([]);
      g.restore();
    }

    /* ---------- Szene: Hintergrund, Enden, Lineal ---------- */
    function drawPanel(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#1a2434' : '#f7f9fc');
      bg.addColorStop(1, dark ? '#121a26' : '#e7ecf3');
      g.fillStyle = bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.fill();
      g.restore();
      // Lichtschein von oben links
      const gl = g.createRadialGradient(r.x + r.w * 0.25, r.y, 10, r.x + r.w * 0.3, r.y + r.h * 0.2, Math.max(r.w, r.h) * 0.8);
      gl.addColorStop(0, dark ? 'rgba(140,180,255,0.07)' : 'rgba(255,255,255,0.7)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.save();
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 14);
      g.clip();
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, r.h);
      g.restore();
      g.strokeStyle = dark ? '#273142' : '#dfe5ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 14);
      g.stroke();
    }

    function metal(g: CanvasRenderingContext2D, x0: number, x1: number): CanvasGradient {
      const dark = ctx.theme.dark;
      const m = g.createLinearGradient(x0, 0, x1, 0);
      m.addColorStop(0, dark ? '#5a6575' : '#b8c2ce');
      m.addColorStop(0.45, dark ? '#9aa6b6' : '#eef2f6');
      m.addColorStop(1, dark ? '#3c4553' : '#8d99a8');
      return m;
    }

    /** Festes Ende: Klemme (Wandblock). side = −1 links, +1 rechts. */
    function drawClamp(x: number, cy: number, H: number, side: -1 | 1, alpha: number): void {
      if (alpha < 0.01) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      const w = 14;
      const h = Math.min(2 * H + 20, 120);
      const bx = side < 0 ? x - w : x;
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      g.fillStyle = metal(g, bx, bx + w);
      roundRect(g, bx, cy - h / 2, w, h, 4);
      g.fill();
      g.restore();
      g.strokeStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(40,52,68,0.35)';
      g.lineWidth = 1;
      roundRect(g, bx + 0.5, cy - h / 2 + 0.5, w - 1, h - 1, 4);
      g.stroke();
      // Schraffur der Wand
      g.save();
      roundRect(g, bx, cy - h / 2, w, h, 4);
      g.clip();
      g.strokeStyle = dark ? 'rgba(0,0,0,0.25)' : 'rgba(40,52,68,0.18)';
      g.lineWidth = 1;
      for (let yy = cy - h / 2 - w; yy < cy + h / 2 + w; yy += 7) {
        g.beginPath();
        g.moveTo(bx, yy + w);
        g.lineTo(bx + w, yy);
        g.stroke();
      }
      g.restore();
      // Klemmbacke
      g.fillStyle = dark ? '#c9d2de' : '#4a5361';
      g.beginPath();
      g.arc(x, cy, 4.2, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Loses Ende: Ring gleitet reibungsfrei an einer senkrechten Stange. */
    function drawRing(x: number, cy: number, H: number, yEnd: number, alpha: number): void {
      if (alpha < 0.01) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      const h = H + 14;
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 6;
      g.shadowOffsetX = 2;
      g.shadowOffsetY = 2;
      g.fillStyle = metal(g, x - 3, x + 3);
      roundRect(g, x - 3, cy - h, 6, 2 * h, 3);
      g.fill();
      g.restore();
      // Ring
      g.lineWidth = 3.2;
      g.strokeStyle = dark ? '#e7c66f' : '#b8860b';
      g.beginPath();
      g.ellipse(x, yEnd, 7.5, 4.6, 0, 0, TAU);
      g.stroke();
      g.lineWidth = 1;
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.beginPath();
      g.ellipse(x, yEnd - 0.8, 6.4, 3.4, 0, Math.PI * 1.05, Math.PI * 1.85);
      g.stroke();
      g.restore();
    }

    /** Erreger (Vibrator) links: Gehäuse mit Stößel, der sich auf und ab bewegt. */
    /** Erreger-Foto (erreger.webp, 839 × 906): Schnitt unter dem Stift und Oberkante des Gehäuses (Bildpixel). */
    const DRIVER_SRC = { cut: 228, housing: 240 };
    /** Umlenkrollen-Foto (umlenkrolle.webp, 491 × 1446): Mitte und Radius der Rolle, Schnitt über der Tischklemme (Bildpixel). */
    const PULLEY_SRC = { cx: 245, cy: 255, r: 244, cut: 945 };
    function drawDriver(x: number, cy: number, y0: number, sm: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const bw = sm ? 34 : 50;
      const bh = sm ? 40 : 54;
      const bx = x - bw - (sm ? 8 : 12);
      const by = cy + (sm ? 16 : 22);
      const photo = ctx.images.get('driver');
      if (!photo) {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 4;
        const body = g.createLinearGradient(bx, by, bx + bw, by + bh);
        body.addColorStop(0, dark ? '#3d4a5e' : '#5b6b82');
        body.addColorStop(1, dark ? '#222b38' : '#36435a');
        g.fillStyle = body;
        roundRect(g, bx, by, bw, bh, 8);
        g.fill();
        g.restore();
        // Lüftungsschlitze
        g.strokeStyle = 'rgba(255,255,255,0.18)';
        g.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const yy = by + bh * 0.55 + i * 6;
          g.beginPath();
          g.moveTo(bx + 9, yy);
          g.lineTo(bx + bw - 9, yy);
          g.stroke();
        }
      }
      // Stößel bis zum Seilanfang
      const sx = bx + bw / 2;
      g.fillStyle = metal(g, sx - 3, sx + 3);
      roundRect(g, sx - 3, cy + y0 - 2, 6, by - (cy + y0) + 4, 2);
      g.fill();
      g.strokeStyle = dark ? '#c3cbd6' : '#4a5361';
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(sx, cy + y0);
      g.lineTo(x, cy + y0);
      g.stroke();
      g.fillStyle = dark ? '#dfe5ee' : '#4a5361';
      g.beginPath();
      g.arc(sx, cy + y0, 3.6, 0, TAU);
      g.fill();
      // Foto des Gehäuses über dem unteren Ende des Stößels (der eigene Stift des Fotos ist abgeschnitten)
      let bottom = by + bh;
      if (photo) {
        const D = DRIVER_SRC;
        const k = bw / photo.width;
        const crop = { x: 0, y: D.cut, w: photo.width, h: photo.height - D.cut };
        const h = crop.h * k;
        const y = by - (D.housing - D.cut) * k;
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 4;
        g.drawImage(scaledSprite(photo, bw, h, surface.dpr, { crop }), bx, y, bw, h);
        g.restore();
        bottom = y + h;
      }
      richText(ctx.t('driver'), bx + bw / 2, bottom + (sm ? 9 : 11), sm ? 11 : 12, theme.muted, 'center', true, 650);
    }

    /** Umlenkrolle mit Gewicht rechts (Melde-Versuch). */
    function drawPulley(x: number, cy: number, sm: boolean): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const R = sm ? 9 : 12;
      const px = x + R;
      const py = cy + R;
      // Seil um die Rolle und senkrecht nach unten
      g.strokeStyle = withAlpha(green(), 0.95);
      g.lineWidth = 2.6;
      g.beginPath();
      g.arc(px, py, R, -Math.PI / 2, 0);
      g.lineTo(px + R, py + (sm ? 26 : 40));
      g.stroke();
      const photo = ctx.images.get('pulley');
      if (photo) {
        // Foto: Rolle genau auf dem Drehpunkt, die Tischklemme unten abgeschnitten
        const P = PULLEY_SRC;
        const k = (R - 1.5) / P.r;
        const w = photo.width * k;
        const h = P.cut * k;
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 2;
        g.drawImage(scaledSprite(photo, w, h, surface.dpr, { crop: { x: 0, y: 0, w: photo.width, h: P.cut } }), px - P.cx * k, py - P.cy * k, w, h);
        g.restore();
      } else {
        // Halter
        g.strokeStyle = dark ? '#7d8899' : '#8d99a8';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px - R * 0.4, py + R * 2.6);
        g.stroke();
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 2;
        const wheel = g.createRadialGradient(px - R * 0.3, py - R * 0.3, 1, px, py, R);
        wheel.addColorStop(0, dark ? '#b5bfcc' : '#f2f5f8');
        wheel.addColorStop(1, dark ? '#4c5665' : '#9aa6b4');
        g.fillStyle = wheel;
        g.beginPath();
        g.arc(px, py, R - 1.5, 0, TAU);
        g.fill();
        g.restore();
        g.fillStyle = dark ? '#2b323d' : '#5d6878';
        g.beginPath();
        g.arc(px, py, 2.2, 0, TAU);
        g.fill();
      }
      // Gewichtsstück
      const wy = py + (sm ? 26 : 40);
      const ww = sm ? 16 : 22;
      const wh = sm ? 18 : 24;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 7;
      g.shadowOffsetY = 3;
      const wg = g.createLinearGradient(px + R - ww / 2, 0, px + R + ww / 2, 0);
      wg.addColorStop(0, dark ? '#6b5a3a' : '#9c7a3c');
      wg.addColorStop(0.45, dark ? '#a58a55' : '#d9b56a');
      wg.addColorStop(1, dark ? '#4d4029' : '#7b5e2b');
      g.fillStyle = wg;
      roundRect(g, px + R - ww / 2, wy, ww, wh, 3);
      g.fill();
      g.restore();
    }

    /** Maßband unter dem Wellenträger (Meter, von links bzw. vom Ende aus). */
    function drawRuler(g0: Geo, Ls: number, fromEnd: boolean, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const { x0, x1, rulerY: y, rulerH: h, sm } = g0;
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const tape = g.createLinearGradient(0, y, 0, y + h);
      tape.addColorStop(0, dark ? '#3b3524' : '#fbefc4');
      tape.addColorStop(1, dark ? '#2c281b' : '#f1dc96');
      g.fillStyle = tape;
      roundRect(g, x0 - 6, y, x1 - x0 + 12, h, 4);
      g.fill();
      g.restore();
      const k = (x1 - x0) / Ls;
      const step = k * 0.05 < 9 ? 0.1 : 0.05;
      const fs = sm ? 10.5 : 11;
      g.strokeStyle = dark ? 'rgba(240,226,180,0.75)' : 'rgba(92,72,20,0.75)';
      g.lineWidth = 1;
      const labEvery = k * 0.1 < 34 ? 0.2 : 0.1;
      let lastLab = -Infinity;
      const unit = fromEnd ? ctx.t(sm ? 'unitDS' : 'unitD') : ctx.t('unitX');
      g.font = `600 ${fs}px ${theme.font}`;
      const uw = g.measureText(unit).width;
      const ux = fromEnd ? x0 + 4 : x1 - 4 - uw;
      for (let i = 0; i * step <= Ls + 1e-9; i++) {
        const d = i * step;
        const xx = fromEnd ? x1 - d * k : x0 + d * k;
        const major = Math.abs(d / 0.1 - Math.round(d / 0.1)) < 1e-6;
        g.beginPath();
        g.moveTo(Math.round(xx) + 0.5, y);
        g.lineTo(Math.round(xx) + 0.5, y + (major ? h * 0.42 : h * 0.25));
        g.stroke();
        const lab = Math.abs(d / labEvery - Math.round(d / labEvery)) < 1e-6;
        if (lab && Math.abs(xx - lastLab) > 24) {
          const txt = d === 0 ? '0' : n(d, 1);
          g.font = `600 ${fs}px ${theme.font}`;
          const tw = g.measureText(txt).width;
          const hitsUnit = xx + tw / 2 > ux - 6 && xx - tw / 2 < ux + uw + 6;
          if (!hitsUnit || d === 0) {
            g.font = `600 ${fs}px ${theme.font}`;
            g.fillStyle = dark ? 'rgba(240,226,180,0.95)' : 'rgba(80,62,16,0.95)';
            g.textAlign = 'center';
            g.textBaseline = 'alphabetic';
            g.fillText(txt, xx, y + h - 4);
            lastLab = xx;
          }
        }
      }
      // Einheit
      g.font = `600 ${fs}px ${theme.font}`;
      g.fillStyle = dark ? '#3b3524' : '#fbefc4';
      g.fillRect(ux - 4, y + h - 4 - fs, uw + 8, fs + 2);
      g.fillStyle = dark ? 'rgba(240,226,180,0.85)' : 'rgba(80,62,16,0.85)';
      g.textAlign = 'left';
      g.fillText(unit, ux, y + h - 4);
      g.restore();
    }

    /** Knoten-/Bauchmarken: Ring auf der Ruhelage, Buchstaben in den Zeilen darüber/darunter. */
    function drawMarks(g0: Geo, marks: Mark[], color: string, rowTop: number, rowBot: number, axisY: number, rings = true): void {
      const g = surface.g;
      const theme = ctx.theme;
      const fs = g0.sm ? 11 : 12.5;
      // zu dicht: erst Buchstaben, dann auch Ringe weglassen
      const nx = marks.filter((m) => m.node).map((m) => m.x).sort((u, v) => u - v);
      let gap = Infinity;
      for (let i = 1; i < nx.length; i++) gap = Math.min(gap, nx[i]! - nx[i - 1]!);
      const letters = gap >= 24;
      if (gap < 9) return;
      // dicht an dicht (hohe Ordnung): kleinere, dünnere Ringe – jeder Knoten bleibt markiert,
      // damit der Abstand λ/2 ablesbar bleibt
      const dense = gap < 18;
      for (const m of marks) {
        if (m.a < 0.01) continue;
        const s = ease.outBack(clamp(m.a, 0, 1));
        g.save();
        g.globalAlpha *= clamp(m.a * 1.6, 0, 1);
        if (m.node) {
          if (rings) {
            g.fillStyle = theme.bg;
            g.strokeStyle = color;
            g.lineWidth = dense ? 1.4 : 2;
            g.beginPath();
            g.arc(m.x, axisY, (dense ? 2.8 : 4.6) * s, 0, TAU);
            g.fill();
            g.stroke();
          }
          const ty = rowBot;
          if (!letters) {
            g.restore();
            continue;
          }
          g.fillStyle = withAlpha(color, 0.16);
          g.beginPath();
          g.arc(m.x, ty, 9 * s, 0, TAU);
          g.fill();
          richText(ctx.t('K'), m.x, ty + 0.5, fs * s, color, 'center', false, 800);
        } else {
          const ty = rowTop;
          if (!letters) {
            g.restore();
            continue;
          }
          g.fillStyle = withAlpha(color, 0.16);
          g.beginPath();
          g.arc(m.x, ty, 9 * s, 0, TAU);
          g.fill();
          richText(ctx.t('B'), m.x, ty + 0.5, fs * s, color, 'center', false, 800);
        }
        g.restore();
      }
    }

    /** Klammer zwischen zwei x-Positionen mit Beschriftung. */
    function bracket(xa: number, xb: number, y: number, label: string, color: string, sm: boolean, alpha: number): void {
      if (alpha < 0.01 || Math.abs(xb - xa) < 10) return;
      const g = surface.g;
      const a = Math.min(xa, xb);
      const b = Math.max(xa, xb);
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(a, y - 5);
      g.lineTo(a, y + 5);
      g.moveTo(b, y - 5);
      g.lineTo(b, y + 5);
      g.stroke();
      const fs = sm ? 11 : 12;
      const w = richWidth(label, fs) + 10;
      if (b - a > w + 24) {
        arrowPx((a + b) / 2 - w / 2, y, a + 1, y, color, 1.5, 6);
        arrowPx((a + b) / 2 + w / 2, y, b - 1, y, color, 1.5, 6);
        richText(label, (a + b) / 2, y + 0.5, fs, color, 'center', true, 750);
      } else {
        arrowPx(a, y, b, y, color, 1.5, 5);
        const R = lay.scene;
        if (b + 6 + w < R.x + R.w - 8) richText(label, b + 6, y + 0.5, fs, color, 'left', true, 750);
        else richText(label, a - 6, y + 0.5, fs, color, 'right', true, 750);
      }
      g.restore();
    }

    /* ---------- Szene: Entstehung ---------- */
    let drawnP: [number, number] = [-100, -100];
    let geoNow: Geo | null = null;

    function samplesX(g0: Geo): number[] {
      const M = Math.round(clamp((g0.x1 - g0.x0) / 3, 90, 260));
      const xs: number[] = [];
      for (let i = 0; i <= M; i++) xs.push(g0.x0 + ((g0.x1 - g0.x0) * i) / M);
      return xs;
    }

    function drawEnt(g0: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const nu = ease2('nuE', nuEnt(), 7);
      const Ls = ease2('L', p.L, 8);
      const lam = (2 / nu) * Ls;
      const xs = samplesX(g0);
      const amp = (g0.H / 2.2) * ik;
      const end = endType();
      const aInc = ease2('aInc', p.inc ? 1 : 0, 7);
      const aRef = ease2('aRef', p.refl ? 1 : 0, 7);
      const aSum = ease2('aSum', p.sum ? 1 : 0, 7);
      const aEnv = ease2('aEnv', p.env ? 1 : 0, 6);
      const aKb = ease2('aKb', p.kb ? 1 : 0, 6);
      const ramp = frontRamp(nu);
      // Ruhelage
      g.strokeStyle = withAlpha(theme.axis, 0.35);
      g.setLineDash([3, 5]);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(g0.r.x + 10, g0.cy + 0.5);
      g.lineTo(g0.x1, g0.cy + 0.5);
      g.stroke();
      g.setLineDash([]);
      // Ende
      if (end === 'fix') drawClamp(g0.x1, g0.cy, g0.H, 1, ik);
      // Hüllkurve: wächst mit der reflektierten Front vom Ende her
      const envA: number[] = [];
      const ph: [number, number][] = [];
      const pr: [number, number][] = [];
      const ps: [number, number][] = [];
      xs.forEach((x) => {
        const xh = (x - g0.x0) / (g0.x1 - g0.x0);
        const est = smooth((2 * tauE - (2 - xh)) / ramp) * smooth((2 * tauE - xh) / ramp);
        const d = (1 - xh) * Ls;
        envA.push(reflectionAmplitude(end, d, lam) * amp * est);
        const w = travelling(end, nu, xh, tauE, thetaE);
        // einzelne Wellen nur dort, wo sie schon angekommen sind
        if (xh <= 2 * tauE + 0.004) ph.push([x, g0.cy - w.yh * amp]);
        if (xh >= 2 - 2 * tauE - 0.004) pr.push([x, g0.cy - w.yr * amp]);
        ps.push([x, g0.cy - (w.yh + w.yr) * amp]);
      });
      envelope(xs, envA, g0.cy, green(), aEnv * aSum * ik, g0.H);
      // Knoten und Bäuche: erscheinen, sobald die reflektierte Welle sie erreicht
      const marks: Mark[] = [];
      const pop = (d: number) => {
        const xh = 1 - d / Ls;
        return clamp((2 * tauE - (2 - xh) - ramp) / (0.45 * ramp) + 0.15, 0, 1);
      };
      for (const d of reflectionNodes(end, lam, Ls)) marks.push({ x: g0.x1 - (d / Ls) * (g0.x1 - g0.x0), node: true, a: pop(d) * aKb });
      for (const d of reflectionAntinodes(end, lam, Ls)) marks.push({ x: g0.x1 - (d / Ls) * (g0.x1 - g0.x0), node: false, a: pop(d) * aKb });
      const keep = marks.filter((m) => m.x >= g0.x0 + 4);
      // Klammer λ/2 am Ende
      const nd = reflectionNodes(end, lam, Ls);
      if (nd.length >= 2) {
        const xa = g0.x1 - (nd[0]! / Ls) * (g0.x1 - g0.x0);
        const xb = g0.x1 - (nd[1]! / Ls) * (g0.x1 - g0.x0);
        bracket(xb, xa, g0.brRow, lamLbl('lam2', lam / 2), theme.text, g0.sm, aKb * Math.min(pop(nd[1]!), 1));
      }
      // Wellen
      const sw = g0.sm ? 2 : 2.4;
      if (aInc > 0.01) {
        g.save();
        g.globalAlpha *= aInc * 0.92;
        strokeRope(ph, blue(), sw, false);
        g.restore();
      }
      if (aRef > 0.01) {
        g.save();
        g.globalAlpha *= aRef * 0.92;
        strokeRope(pr, red(), sw, false);
        g.restore();
      }
      if (aSum > 0.01) {
        g.save();
        g.globalAlpha *= aSum;
        strokeRope(ps, green(), g0.sm ? 3.6 : 4.4, true, lockGlow.running ? 1 - lockGlow.value : 0);
        g.restore();
      }
      if (end === 'free') {
        const last = ps[ps.length - 1]!;
        drawRing(g0.x1, g0.cy, g0.H, last[1], ik);
      }
      drawMarks(g0, keep, theme.text, g0.topRow, g0.kRow, g0.cy);
      // Einblendung von links: Welle kommt aus dem langen Seil
      const fade = g.createLinearGradient(g0.r.x, 0, g0.x0 + 34, 0);
      const bgc = theme.dark ? 'rgba(26,36,52,' : 'rgba(247,249,252,';
      fade.addColorStop(0, bgc + '1)');
      fade.addColorStop(1, bgc + '0)');
      g.fillStyle = fade;
      g.fillRect(g0.r.x + 2, g0.cy - g0.H - 6, g0.x0 + 34 - g0.r.x, 2 * g0.H + 12);
      // Pfeile: Laufrichtungen
      const fs = g0.sm ? 11 : 12;
      const front = 2 * tauE;
      if (aInc > 0.01 && front > 0.02) {
        const xa = g0.x0 + Math.min(front, 1) * (g0.x1 - g0.x0);
        const ya = g0.cy - g0.H - 2;
        g.save();
        g.globalAlpha *= aInc * clamp(1 - (front - 1) * 3, 0, 1);
        arrowPx(xa - 36, ya, xa - 4, ya, blue(), 2.2, 8);
        richText(ctx.t('inc'), xa - 42, ya, fs, blue(), 'right', true, 750);
        g.restore();
      }
      if (aRef > 0.01 && front > 1.05) {
        const xr = g0.x1 - Math.min(front - 1, 1) * (g0.x1 - g0.x0);
        const yr = g0.cy + g0.H + 2;
        g.save();
        g.globalAlpha *= aRef * clamp(1 - (front - 2) * 3, 0, 1);
        arrowPx(xr + 36, yr, xr + 4, yr, red(), 2.2, 8);
        richText(ctx.t('refl'), xr + 42, yr, fs, red(), 'left', true, 750);
        g.restore();
      }
      // Punkt P
      const pdS = ease2('pd', Math.min(p.pd, p.L), 10, dragP);
      const xP = g0.x1 - (pdS / Ls) * (g0.x1 - g0.x0);
      const xhP = (xP - g0.x0) / (g0.x1 - g0.x0);
      const wP = travelling(end, nu, xhP, tauE, thetaE);
      const yP = g0.cy - (aSum > 0.5 ? wP.yh + wP.yr : aInc > 0.5 ? wP.yh : wP.yr) * amp;
      drawnP = [xP, yP];
      g.save();
      g.globalAlpha *= ik;
      g.strokeStyle = withAlpha(purple(), 0.5);
      g.setLineDash([3, 4]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(xP, g0.cy - g0.H + 4);
      g.lineTo(xP, g0.cy + g0.H - 4);
      g.stroke();
      g.setLineDash([]);
      const hot = hoverP || dragP;
      if (hot) {
        g.fillStyle = withAlpha(purple(), 0.25);
        g.beginPath();
        g.arc(xP, yP, 15, 0, TAU);
        g.fill();
      }
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      const bead = g.createRadialGradient(xP - 2.5, yP - 3, 1, xP, yP, 7.5);
      bead.addColorStop(0, mixColor(purple(), '#ffffff', 0.6));
      bead.addColorStop(1, mixColor(purple(), '#000000', 0.25));
      g.fillStyle = bead;
      g.beginPath();
      g.arc(xP, yP, 7.5, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = theme.bg;
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(xP, yP, 7.5, 0, TAU);
      g.stroke();
      const right = xP < g0.x1 - 30;
      richText('P', right ? xP + 12 : xP - 12, yP + (yP < g0.cy ? 10 : -10), g0.sm ? 13 : 14, purple(), right ? 'left' : 'right', true, 800);
      g.restore();
      // Einrasten: kurzer Hinweis
      if (lockGlow.running || locked) {
        const a = lockGlow.running ? Math.min(1, lockGlow.t * 3) * (lockGlow.t > 0.75 ? (1 - lockGlow.t) * 4 : 1) : 0;
        if (a > 0.01 && aSum > 0.5 && !g0.sm) {
          g.save();
          g.globalAlpha *= a;
          g.translate(0, (1 - Math.min(1, lockGlow.t * 4)) * 6);
          pill(g0.r.x + g0.r.w / 2, g0.r.y + 10, ctx.t('standing'), green(), 'center', fs, green());
          g.restore();
        }
      }
      drawRuler(g0, Ls, true, ik);
    }

    /* ---------- Szene: Eigenschwingungen ---------- */
    function shapeOf(cfg: EigCfg, xh: number): number {
      return modeShape(cfg.bc, cfg.n, xh);
    }

    function eigMarks(cfg: EigCfg, g0: Geo, a: number, stagger: number): { k: Mark[]; b: Mark[] } {
      const X = (xh: number) => g0.x0 + xh * (g0.x1 - g0.x0);
      const k = nodes(cfg.bc, cfg.n);
      const b = antinodes(cfg.bc, cfg.n);
      const all = [...k.map((x) => ({ x, node: true })), ...b.map((x) => ({ x, node: false }))].sort((u, v) => u.x - v.x);
      const out = all.map((m, i) => {
        const local = stagger >= 1 ? 1 : clamp((stagger * (all.length * 0.35 + 1) - i * 0.35) / 1, 0, 1);
        return { x: X(m.x), node: m.node, a: a * local };
      });
      return { k: out.filter((m) => m.node), b: out.filter((m) => !m.node) };
    }

    function drawEig(g0: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const s = morph.running ? morph.value : 1;
      const old = eigOld && morph.running ? eigOld : null;
      const pk = pluck.running ? pluck.value : 1;
      const Ls = ease2('L', p.L, 8);
      const aEnv = ease2('aEnv', p.env ? 1 : 0, 6);
      const aKb = ease2('aKb', p.kb ? 1 : 0, 6);
      const sameMed = !old || old.med === eigNow.med;
      const draw = (cfg: EigCfg, alpha: number, shape: (xh: number) => number, env: (xh: number) => number) => {
        if (alpha < 0.01) return;
        g.save();
        g.globalAlpha *= alpha;
        if (cfg.med === 'rope') drawRopeEig(g0, cfg, shape, env, aEnv, pk * ik);
        else drawAir(g0, cfg, shape, env, aEnv, pk * ik);
        g.restore();
      };
      if (old && sameMed) {
        const shape = (xh: number) => (1 - s) * shapeOf(old, xh) * Math.cos(thetaOld) + s * shapeOf(eigNow, xh) * Math.cos(thetaN);
        const env = (xh: number) => (1 - s) * Math.abs(shapeOf(old, xh)) + s * Math.abs(shapeOf(eigNow, xh));
        drawEnds(g0, old, eigNow, s, shape, pk * ik);
        draw(eigNow, 1, shape, env);
      } else {
        if (old) {
          drawEnds(g0, old, old, 0, (xh) => shapeOf(old, xh) * Math.cos(thetaOld), (1 - s) * pk * ik);
          draw(old, 1 - s, (xh) => shapeOf(old, xh) * Math.cos(thetaOld), (xh) => Math.abs(shapeOf(old, xh)));
        }
        drawEnds(g0, eigNow, eigNow, 1, (xh) => shapeOf(eigNow, xh) * Math.cos(thetaN), (old ? s : 1) * pk * ik);
        draw(eigNow, old ? s : 1, (xh) => shapeOf(eigNow, xh) * Math.cos(thetaN), (xh) => Math.abs(shapeOf(eigNow, xh)));
      }
      // Marken: alte verblassen, neue springen gestaffelt auf
      const stagger = pluck.running ? pluck.t * 1.4 : morph.running ? morph.t * 1.3 : 1;
      const air = eigNow.med === 'air';
      const rowTop = air ? g0.topRow : g0.topRow;
      if (old && morph.running) {
        const om = eigMarks(old, g0, aKb * (1 - s), 1);
        drawMarksFor(g0, old, om, rowTop);
      }
      const nm = eigMarks(eigNow, g0, aKb * ik, stagger);
      drawMarksFor(g0, eigNow, nm, rowTop);
      // Klammer λ/2 bzw. λ/4
      const lam = eigenWavelength(eigNow.bc, eigNow.n, Ls);
      const k = nodes(eigNow.bc, eigNow.n);
      const b = antinodes(eigNow.bc, eigNow.n);
      const X = (xh: number) => g0.x0 + xh * (g0.x1 - g0.x0);
      const brA = aKb * ik * (morph.running ? s : 1) * (pluck.running ? clamp(pluck.t * 2 - 0.6, 0, 1) : 1);
      if (k.length >= 2) bracket(X(k[0]!), X(k[1]!), g0.brRow, lamLbl('lam2', lam / 2), theme.text, g0.sm, brA);
      else if (k.length === 1) {
        const bb = b.reduce((best, x) => (Math.abs(x - k[0]!) < Math.abs(best - k[0]!) ? x : best), b[0]!);
        bracket(X(k[0]!), X(bb), g0.brRow, lamLbl('lam4', lam / 4), theme.text, g0.sm, brA);
      }
      drawRuler(g0, Ls, false, ik);
    }

    function drawMarksFor(g0: Geo, cfg: EigCfg, m: { k: Mark[]; b: Mark[] }, rowTop: number): void {
      if (cfg.med === 'rope') {
        drawMarks(g0, [...m.k, ...m.b], ctx.theme.text, rowTop, g0.kRow, g0.cy);
        return;
      }
      // Luftsäule: oben Bewegung (grün), unten Druck (orange, vertauscht)
      const air = airGeo(g0);
      drawMarks(g0, [...m.k, ...m.b], green(), air.moveRow, air.moveRow, g0.cy, false);
      drawMarks(
        g0,
        [...m.k.map((q) => ({ ...q, node: false })), ...m.b.map((q) => ({ ...q, node: true }))],
        orange(),
        air.pressRow,
        air.pressRow,
        g0.cy,
        false,
      );
      // Zeilentitel
      const fs = g0.sm ? 11 : 12;
      const a = Math.max(...[...m.k, ...m.b].map((q) => q.a), 0);
      if (a > 0.01) {
        g0Labels(g0, air, fs, a);
      }
    }

    function g0Labels(g0: Geo, air: { moveRow: number; pressRow: number }, fs: number, a: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= clamp(a, 0, 1);
      const x = g0.r.x + 12;
      if (g0.x0 - x > 70) {
        richText(ctx.t('rowMove'), x, air.moveRow, fs, green(), 'left', true, 700);
        richText(ctx.t('rowPress'), x, air.pressRow, fs, orange(), 'left', true, 700);
      } else {
        richText(ctx.t('rowMove'), g0.r.x + g0.r.w - 12, g0.topRow - 2, fs, green(), 'right', true, 700);
      }
      g.restore();
    }

    function airGeo(g0: Geo): { half: number; moveRow: number; pressRow: number } {
      const half = Math.min(g0.H * 0.78, 54);
      return { half, moveRow: g0.cy - half - (g0.sm ? 13 : 16), pressRow: g0.cy + half + (g0.sm ? 13 : 16) };
    }

    /** Enden des Seils bzw. Rohrs (bei Wechsel weich überblendet). */
    function drawEnds(g0: Geo, a: EigCfg, b: EigCfg, s: number, shape: (xh: number) => number, alpha: number): void {
      const amp = g0.H * 0.9;
      const ends: [0 | 1, number][] = [
        [0, g0.x0],
        [1, g0.x1],
      ];
      for (const [i, x] of ends) {
        const fixA = a.bc[i] === 'f';
        const fixB = b.bc[i] === 'f';
        const side = (i === 0 ? -1 : 1) as -1 | 1;
        if (b.med === 'air' || a.med === 'air') {
          drawPipeEnd(g0, x, side, fixA, fixB, s, alpha);
          continue;
        }
        const y = g0.cy - shape(i) * amp;
        const wFix = (fixA ? 1 - s : 0) + (fixB ? s : 0);
        drawClamp(x, g0.cy, g0.H, side, wFix * alpha);
        drawRing(x, g0.cy, g0.H, y, (1 - wFix) * alpha);
      }
    }

    function drawRopeEig(g0: Geo, _cfg: EigCfg, shape: (xh: number) => number, env: (xh: number) => number, aEnv: number, k: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const xs = samplesX(g0);
      const amp = g0.H * 0.9 * k;
      g.strokeStyle = withAlpha(theme.axis, 0.35);
      g.setLineDash([3, 5]);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(g0.x0, g0.cy + 0.5);
      g.lineTo(g0.x1, g0.cy + 0.5);
      g.stroke();
      g.setLineDash([]);
      const pts: [number, number][] = [];
      const ea: number[] = [];
      for (const x of xs) {
        const xh = (x - g0.x0) / (g0.x1 - g0.x0);
        pts.push([x, g0.cy - shape(xh) * amp]);
        ea.push(env(xh) * amp);
      }
      envelope(xs, ea, g0.cy, green(), aEnv, g0.H);
      strokeRope(pts, green(), g0.sm ? 3.6 : 4.4, true);
    }

    /** Rohrende: geschlossen (Deckel) oder offen (Rand). */
    function drawPipeEnd(g0: Geo, x: number, side: -1 | 1, closedA: boolean, closedB: boolean, s: number, alpha: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const { half } = airGeo(g0);
      const wc = (closedA ? 1 - s : 0) + (closedB ? s : 0);
      g.save();
      g.globalAlpha *= alpha;
      if (wc > 0.01) {
        g.save();
        g.globalAlpha *= wc;
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 2;
        const w = 10;
        const bx = side < 0 ? x - w : x;
        g.fillStyle = metal(g, bx, bx + w);
        roundRect(g, bx, g0.cy - half - 6, w, 2 * half + 12, 3);
        g.fill();
        g.restore();
      }
      if (wc < 0.99) {
        g.save();
        g.globalAlpha *= 1 - wc;
        g.strokeStyle = dark ? 'rgba(190,215,240,0.75)' : 'rgba(70,110,150,0.75)';
        g.lineWidth = 3;
        g.lineCap = 'round';
        for (const sg of [-1, 1]) {
          g.beginPath();
          g.moveTo(x - side * 4, g0.cy + sg * (half + 1.5));
          g.quadraticCurveTo(x, g0.cy + sg * (half + 1.5), x + side * 3, g0.cy + sg * (half + 6));
          g.stroke();
        }
        g.restore();
      }
      g.restore();
    }

    /** Teilchen der Luftsäule: feste Zufallsanordnung (reproduzierbar). */
    const airDots: { u: number; v: number }[] = [];
    {
      let seed = 12345;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      for (let i = 0; i < 900; i++) airDots.push({ u: rnd(), v: rnd() });
    }

    function drawAir(g0: Geo, cfg: EigCfg, shape: (xh: number) => number, env: (xh: number) => number, aEnv: number, k: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const { half } = airGeo(g0);
      const x0 = g0.x0;
      const x1 = g0.x1;
      const len = x1 - x0;
      const top = g0.cy - half;
      // Glasrohr
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      const glass = g.createLinearGradient(0, top, 0, top + 2 * half);
      glass.addColorStop(0, dark ? 'rgba(120,160,200,0.20)' : 'rgba(205,228,248,0.75)');
      glass.addColorStop(0.5, dark ? 'rgba(60,90,120,0.14)' : 'rgba(236,245,253,0.55)');
      glass.addColorStop(1, dark ? 'rgba(120,160,200,0.22)' : 'rgba(190,218,244,0.8)');
      g.fillStyle = glass;
      g.fillRect(x0, top, len, 2 * half);
      g.restore();
      // Druck als Tönung (Überdruck rötlich, Unterdruck bläulich)
      const slices = Math.max(40, Math.round(len / 6));
      // größte Steigung für Normierung; Verschiebung so, dass sich Teilchen nie überholen
      const kk = cfg.bc === 'fl' ? (2 * cfg.n - 1) * (Math.PI / 2) : cfg.n * Math.PI;
      const ampS = Math.min((0.5 * len) / kk, g0.sm ? 16 : 24) * k;
      for (let i = 0; i < slices; i++) {
        const xh = (i + 0.5) / slices;
        // Druck ∝ −∂s/∂x: aus der momentanen Form numerisch
        const h = 0.002;
        const ds = (shape(Math.min(1, xh + h)) - shape(Math.max(0, xh - h))) / (Math.min(1, xh + h) - Math.max(0, xh - h));
        const pr = clamp((-ds / kk) * 1.0, -1, 1);
        const col = pr > 0 ? red() : blue();
        g.fillStyle = withAlpha(col, Math.abs(pr) * (dark ? 0.32 : 0.22));
        g.fillRect(x0 + (i * len) / slices, top, len / slices + 0.6, 2 * half);
      }
      // Teilchen: lockeres Gitter mit kleiner Unordnung, längs verschoben um s(x, t)
      const sx = g0.sm ? 6.5 : 7.5;
      const sy = g0.sm ? 6.5 : 7.5;
      const cols = Math.max(4, Math.floor(len / sx));
      const rows = Math.max(3, Math.floor((2 * half - 6) / sy));
      g.fillStyle = dark ? 'rgba(220,232,245,0.85)' : 'rgba(36,58,88,0.78)';
      const rr = g0.sm ? 1.45 : 1.8;
      g.beginPath();
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const d = airDots[(j * 37 + i * 11) % airDots.length]!;
          const xh = clamp((i + 0.5 + (d.u - 0.5) * 0.5) / cols, 0, 1);
          const xx = x0 + xh * len + shape(xh) * ampS;
          if (xx < x0 + 1.5 || xx > x1 - 1.5) continue;
          const yy = top + 3 + ((j + 0.5 + (d.v - 0.5) * 0.45) / rows) * (2 * half - 6);
          g.moveTo(xx + rr, yy);
          g.arc(xx, yy, rr, 0, TAU);
        }
      }
      g.fill();
      // Auslenkung s(x) als Kurve im Rohr (quer gezeichnet) und Hüllkurve
      const xs = samplesX(g0);
      const amp = half * 0.82 * k;
      const ea: number[] = [];
      const pts: [number, number][] = [];
      for (const x of xs) {
        const xh = (x - x0) / len;
        ea.push(env(xh) * amp);
        pts.push([x, g0.cy - shape(xh) * amp]);
      }
      envelope(xs, ea, g0.cy, green(), aEnv * 0.75, half);
      g.save();
      g.globalAlpha *= 0.8;
      strokeRope(pts, green(), g0.sm ? 2.2 : 2.6, false);
      g.restore();
      // Glasrand und Glanz
      g.strokeStyle = dark ? 'rgba(190,215,240,0.6)' : 'rgba(70,110,150,0.55)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, top);
      g.lineTo(x1, top);
      g.moveTo(x0, top + 2 * half);
      g.lineTo(x1, top + 2 * half);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0 + 6, top + 4);
      g.lineTo(x1 - 6, top + 4);
      g.stroke();
    }

    /* ---------- Szene: Resonanz ---------- */
    function drawRes(g0: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const Ls = ease2('L', p.L, 8);
      const aEnv = ease2('aEnv', p.env ? 1 : 0, 6);
      const aKb = ease2('aKb', p.kb ? 1 : 0, 6);
      const amp = ((g0.H * 0.94) / (PEAK + 0.3)) * ik;
      const X = (xh: number) => g0.x0 + xh * (g0.x1 - g0.x0);
      g.strokeStyle = withAlpha(theme.axis, 0.35);
      g.setLineDash([3, 5]);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(g0.x0, g0.cy + 0.5);
      g.lineTo(g0.x1, g0.cy + 0.5);
      g.stroke();
      g.setLineDash([]);
      const xs: number[] = [];
      const ea: number[] = [];
      const pts: [number, number][] = [];
      for (let j = 0; j <= rope.n; j++) {
        const x = X(j / rope.n);
        xs.push(x);
        ea.push(Math.min(envArr[j]!, PEAK * 1.6) * amp);
        pts.push([x, g0.cy - clamp(rope.y[j]!, -PEAK * 1.6, PEAK * 1.6) * amp]);
      }
      envelope(xs, ea, g0.cy, green(), aEnv, g0.H);
      // Knoten/Bäuche der nächsten Eigenschwingung, je nach Stärke der Resonanz
      const nu = nuEnt();
      // hohe Ordnung (ν bis 45): weniger als 10 Seilpunkte je halber Welle – zwischen den Punkten
      // glatt (Catmull-Rom) feiner zeichnen, sonst wirkt das Seil zackig
      const sub = rope.n / Math.max(1, nu) < 10 ? 4 : 1;
      const line = sub > 1 ? smoothRope(pts, sub) : pts;
      const ord = nearestOrder(nu);
      const strength = ease2('resS', clamp((Math.min(ampLive, steadyAmp(nu)) - 2.5) / 4, 0, 1), 4);
      if (strength > 0.01) {
        const marks: Mark[] = [
          ...nodes('ff', ord).map((x) => ({ x: X(x), node: true, a: strength * aKb })),
          ...antinodes('ff', ord).map((x) => ({ x: X(x), node: false, a: strength * aKb })),
        ];
        drawMarks(g0, marks, theme.text, g0.topRow, g0.kRow, g0.cy);
        const lam = (2 * Ls) / ord;
        bracket(X(0), X(1 / ord), g0.brRow, lamLbl('lam2', lam / 2), theme.text, g0.sm, strength * aKb);
      }
      drawPulley(g0.x1, g0.cy, g0.sm);
      strokeRope(line, green(), g0.sm ? 3.2 : 4, true);
      drawDriver(g0.x0, g0.cy, -rope.y[0]! * amp, g0.sm);
      drawRuler(g0, Ls, false, ik);
    }

    /** Punkte mit gleichem x-Abstand: je Abschnitt `sub` Zwischenpunkte auf einer Catmull-Rom-Kurve. */
    function smoothRope(pts: [number, number][], sub: number): [number, number][] {
      const out: [number, number][] = [];
      const n = pts.length;
      for (let i = 0; i < n - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)]![1];
        const p1 = pts[i]![1];
        const p2 = pts[i + 1]![1];
        const p3 = pts[Math.min(n - 1, i + 2)]![1];
        const x1 = pts[i]![0];
        const x2 = pts[i + 1]![0];
        for (let k = 0; k < sub; k++) {
          const t = k / sub;
          const t2 = t * t;
          const t3 = t2 * t;
          const y = 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
          out.push([x1 + (x2 - x1) * t, y]);
        }
      }
      out.push(pts[n - 1]!);
      return out;
    }

    /* ---------- Kopfzeile der Szene ---------- */
    function drawHeader(g0: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = g0.r;
      const sm = g0.sm;
      const fs = sm ? 11 : 12;
      const m = mode();
      let hdr = '';
      let nuVis = 1;
      if (m === 'ent') {
        const f = ease2('hf', p.f, 8);
        const l = ease2('hl', lamEnt(), 8);
        hdr = tr(sm ? 'hdrEntS' : 'hdrEnt', { f: n(f, 0), l: hideF() ? '?' : n(l, 3) });
        nuVis = nuEnt();
      } else if (m === 'eig') {
        const f = ease2('hf', eigenFrequency(eigNow.bc, eigNow.n, p.L, p.c), 8);
        const l = ease2('hl', eigenWavelength(eigNow.bc, eigNow.n, p.L), 8);
        hdr = tr(sm ? 'hdrEigS' : 'hdrEig', { n: String(eigNow.n), f: hideF() ? '?' : fHz(f), l: hideF() ? '?' : n(l, 3) });
        nuVis = eigenNu(eigNow.bc, eigNow.n);
      } else {
        const f = ease2('hf', p.f, 8);
        const f1 = ease2('hf1', f1ref(), 8);
        hdr = tr(sm ? 'hdrResS' : 'hdrRes', { f: n(f, 0), f1: hideF() ? '?' : fHz(f1) });
        nuVis = nuEnt();
      }
      const kk = ease2('slowK', f1ref() / rateFor(nuVis), 8);
      const hdr2 = tr(sm ? 'slowPillS' : 'slowPill', { k: n(kk, kk >= 100 ? 0 : 1) });
      g.save();
      g.globalAlpha *= ik;
      pill(r.x + 12, r.y + 10, hdr, theme.text, 'left', fs);
      const w2 = richWidth(hdr2, fs) + 16;
      const w1 = richWidth(hdr, fs) + 16;
      if (12 + w1 + 10 + w2 + 12 <= r.w) pill(r.x + r.w - 12, r.y + 10, hdr2, purple(), 'right', fs);
      g.restore();
    }

    /* ---------- Karten ---------- */
    function cardTitle(R: Rect, title: string, color: string, sm: boolean): { y: number; w: number } {
      const g = surface.g;
      const pad = sm ? 12 : 16;
      const ty = R.y + pad + 8;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 5, ty, 5, 0, TAU);
      g.fill();
      const w = richText(title, R.x + pad + 16, ty, (sm ? 12 : 13) + 1, ctx.theme.text, 'left', false, 750);
      return { y: ty, w: w + 16 };
    }

    /** Zeigerdiagramm (hinlaufend, reflektiert, Summe). */
    function drawPhasor(cx: number, cy: number, rad: number, a1: number, l1: number, a2: number, l2: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const u = rad / 2.15;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      g.arc(cx, cy, 2 * u, 0, TAU);
      g.stroke();
      g.setLineDash([2, 3]);
      g.beginPath();
      g.arc(cx, cy, u, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = withAlpha(theme.axis, 0.5);
      g.beginPath();
      g.moveTo(cx - rad, cy);
      g.lineTo(cx + rad, cy);
      g.moveTo(cx, cy - rad);
      g.lineTo(cx, cy + rad);
      g.stroke();
      const ax = cx + u * l1 * Math.cos(a1);
      const ay = cy - u * l1 * Math.sin(a1);
      const bx = ax + u * l2 * Math.cos(a2);
      const by = ay - u * l2 * Math.sin(a2);
      g.strokeStyle = withAlpha(green(), 0.6);
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(cx, by);
      g.stroke();
      g.setLineDash([]);
      arrowPx(cx, cy, ax, ay, blue(), 2.4, 7);
      if (l2 > 0.02) arrowPx(ax, ay, bx, by, red(), 2.4, 7);
      arrowPx(cx, cy, bx, by, green(), 3, 8);
      g.fillStyle = green();
      g.beginPath();
      g.arc(cx, by, 3.5, 0, TAU);
      g.fill();
    }

    function slideIn(R: Rect, ik: number, delay: number): number {
      const k = clamp((ik - delay) / (1 - delay), 0, 1);
      const g = surface.g;
      g.globalAlpha *= k;
      g.translate(0, (1 - k) * 14);
      void R;
      return k;
    }

    function drawInfoEnt(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      slideIn(R, ik, 0.1);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      const fs = sm ? 12 : 13;
      const nu = soft.get('nuE') ?? nuEnt();
      const Ls = soft.get('L') ?? p.L;
      const lam = (2 / nu) * Ls;
      const pd = soft.get('pd') ?? p.pd;
      const end = endType();
      const xh = 1 - pd / Ls;
      const w = travelling(end, nu, xh, tauE, thetaE);
      const arrived = smooth((2 * tauE - (2 - xh)) / frontRamp(nu));
      const A = reflectionAmplitude(end, pd, lam);
      const q = pd / lam;
      const kind = pointKind(end, pd, lam);
      const atNode = kind === 'node';
      const atAnti = kind === 'anti';
      const t0 = cardTitle(R, ctx.t('cardP'), purple(), sm);
      const verdict = arrived < 0.5 ? ctx.t('vWait') : atNode ? ctx.t('vNode') : atAnti ? ctx.t('vAnti') : ctx.t('vMid');
      const vCol = arrived < 0.5 ? theme.muted : atNode ? teal() : atAnti ? orange() : theme.text;
      const vs = sm ? 11 : 12;
      // Zeiger rechts
      const phR = Math.max(26, Math.min((R.h - 2 * pad - 24) / 2, R.w * 0.2, 62));
      const pcx = R.x + R.w - pad - phR;
      const pcy = R.y + R.h / 2 + (sm ? 8 : 10);
      const vw = richWidth(verdict, vs) + 16;
      if (R.x + pad + t0.w + 10 + vw < R.x + R.w - pad) pill(R.x + R.w - pad, t0.y - (vs + 11) / 2, verdict, vCol, 'right', vs, arrived < 0.5 || (!atNode && !atAnti) ? undefined : vCol);
      const eps = end === 'fix' ? Math.PI : 0;
      const a1 = thetaE - Math.PI * nu * xh;
      const a2 = thetaE - Math.PI * nu * (2 - xh) + eps;
      const l1 = smooth((2 * tauE - xh) / frontRamp(nu));
      drawPhasor(pcx, pcy, phR, a1, l1, a2, arrived);
      void w;
      // Werte links
      const lx = R.x + pad;
      const row = sm ? 20 : 24;
      let ly = t0.y + (sm ? 24 : 30);
      const rowTxt = (label: string, value: string, color: string) => {
        const ww = richText(label, lx, ly, fs, color, 'left', false, 750);
        richText(value, lx + ww + 6, ly, fs, theme.text, 'left', false, 600);
        ly += row;
      };
      const dS = ease2('cardD', pd, 10, dragP);
      rowTxt(ctx.t('rowD'), `${n(dS, 2)} m`, purple());
      rowTxt(ctx.t('rowQ'), n(ease2('cardQ', q, 10, dragP), 2), theme.text);
      const big = sm ? 20 : 25;
      const As = ease2('cardA', arrived > 0.5 ? A : NaN, 9, dragP);
      g.font = `800 ${big}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = arrived > 0.5 ? vCol === theme.text ? green() : vCol : theme.muted;
      g.fillText(arrived > 0.5 ? `A = ${n(As, 2)} ŷ` : 'A = ?', lx, ly + 2);
      ly += big / 2 + (sm ? 12 : 16);
      const rule = arrived > 0.5 ? ctx.t(end === 'fix' ? 'ruleFix' : 'ruleFree') : ctx.t('notYet');
      if (ly < R.y + R.h - 8) richText(rule, lx, ly, sm ? 11 : 12, theme.muted, 'left', false, 600);
      g.restore();
    }

    function drawChartEnt(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      slideIn(R, ik, 0.25);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const fs = sm ? 11 : 12;
      const padL = sm ? 34 : 40;
      const padR = sm ? 12 : 16;
      const padT = sm ? 32 : 38;
      const padB = sm ? 22 : 26;
      const A: Rect = { x: R.x + padL, y: R.y + padT, w: R.w - padL - padR, h: R.h - padT - padB };
      const ty = R.y + (sm ? 16 : 19);
      const tw = richText(ctx.t(R.w < 300 ? 'chartPS' : 'chartP'), R.x + 14, ty, fs + 1, theme.text, 'left', false, 750);
      let lx = R.x + R.w - 14;
      for (const [lab, col] of [
        ['y', green()],
        [ctx.lang === 'de' ? 'y_r' : 'y_r', red()],
        [ctx.lang === 'de' ? 'y_h' : 'y_i', blue()],
      ] as const) {
        if (lx - richWidth(lab, fs) - 18 < R.x + 14 + tw + 10) break;
        const w = richText(lab, lx, ty, fs, col, 'right', false, 750);
        g.strokeStyle = col;
        g.lineWidth = lab === 'y' ? 3 : 2;
        g.beginPath();
        g.moveTo(lx - w - 18, ty);
        g.lineTo(lx - w - 5, ty);
        g.stroke();
        lx -= w + 28;
      }
      if (A.w < 40 || A.h < 24) {
        g.restore();
        return;
      }
      const yR = 2.25;
      const Yp = (y: number) => A.y + A.h / 2 - (y / yR) * (A.h / 2);
      const span = 2;
      const Xp = (dn: number) => A.x + A.w + (dn / span) * A.w;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (const yy of [-2, -1, 1, 2]) {
        const py = Math.round(Yp(yy)) + 0.5;
        g.moveTo(A.x, py);
        g.lineTo(A.x + A.w, py);
      }
      for (const dn of [-2, -1.5, -1, -0.5]) {
        const px = Math.round(Xp(dn)) + 0.5;
        g.moveTo(px, A.y);
        g.lineTo(px, A.y + A.h);
      }
      g.stroke();
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(A.x, Yp(0) + 0.5);
      g.lineTo(A.x + A.w, Yp(0) + 0.5);
      g.moveTo(A.x + 0.5, A.y - 2);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.stroke();
      g.font = `${fs}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (const yy of [-2, -1, 1, 2]) g.fillText(`${yy < 0 ? '−' : ''}${Math.abs(yy) === 1 ? '' : '2'}ŷ`, A.x - 6, Yp(yy));
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillText('−2T', Xp(-2) + 10, A.y + A.h + 5);
      g.fillText('−T', Xp(-1), A.y + A.h + 5);
      g.textAlign = 'right';
      g.fillText(ctx.t('now'), A.x + A.w, A.y + A.h + 5);
      const nu = soft.get('nuE') ?? nuEnt();
      const Ls = soft.get('L') ?? p.L;
      const pd = soft.get('pd') ?? p.pd;
      const xh = 1 - pd / Ls;
      const end = endType();
      const at = (dn: number) => travelling(end, nu, xh, tauE + dn / nu, thetaE + TAU * dn);
      const N = Math.max(60, Math.round(A.w / 2));
      const ys: { yh: number; yr: number }[] = [];
      for (let i = 0; i <= N; i++) ys.push(at(-span + (span * i) / N));
      const curve = (pick: (q: { yh: number; yr: number }) => number, color: string, width: number, alpha: number) => {
        g.save();
        g.globalAlpha *= alpha;
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.beginPath();
        ys.forEach((q, i) => {
          const px = Xp(-span + (span * i) / N);
          const py = Yp(pick(q));
          if (i) g.lineTo(px, py);
          else g.moveTo(px, py);
        });
        g.stroke();
        g.restore();
      };
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 4, A.w + 6, A.h + 8);
      g.clip();
      curve((q) => q.yh, blue(), sm ? 1.6 : 1.9, 0.85 * (soft.get('aInc') ?? 1));
      curve((q) => q.yr, red(), sm ? 1.6 : 1.9, 0.85 * (soft.get('aRef') ?? 1));
      curve((q) => q.yh + q.yr, green(), sm ? 2.6 : 3.2, 1);
      g.restore();
      const cur = ys[ys.length - 1]!;
      for (const [y, col, rr] of [
        [cur.yh, blue(), 3.5],
        [cur.yr, red(), 3.5],
        [cur.yh + cur.yr, green(), 5],
      ] as const) {
        g.fillStyle = col;
        g.beginPath();
        g.arc(Xp(0), Yp(y), rr, 0, TAU);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.5;
        g.stroke();
      }
      g.restore();
    }

    function drawInfoEig(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      slideIn(R, ik, 0.1);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      const fs = sm ? 12 : 13;
      const cfg = eigNow;
      const h = harmonic(cfg.bc, cfg.n);
      const title = cfg.n === 1 ? ctx.t('titleFund') : tr('titleOver', { k: String(cfg.n - 1) });
      const fade = morph.running ? clamp(morph.t * 2 - 0.4, 0, 1) : 1;
      g.save();
      g.globalAlpha *= 0.35 + 0.65 * fade;
      const t0 = cardTitle(R, title, green(), sm);
      const hp = h === 1 ? ctx.t('harmPill1') : tr('harmPill', { n: String(cfg.n), h: String(h) });
      const vs = sm ? 11 : 12;
      const vw = richWidth(hp, vs) + 16;
      if (R.x + pad + t0.w + 10 + vw < R.x + R.w - pad) pill(R.x + R.w - pad, t0.y - (vs + 11) / 2, hp, green(), 'right', vs, green());
      const lx = R.x + pad;
      const big = sm ? 19 : 24;
      let ly = t0.y + (sm ? 26 : 34);
      const law = cfg.bc === 'fl' ? tr('lawUneq', { h: String(h) }) : tr('lawEq', { n: String(cfg.n) });
      g.font = `800 ${big}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = theme.text;
      g.fillText(law, lx, ly);
      g.restore();
      ly += big / 2 + (sm ? 14 : 18);
      const row = sm ? 19 : 23;
      const lam = ease2('cLam', eigenWavelength(cfg.bc, cfg.n, p.L), 8);
      const f = ease2('cF', eigenFrequency(cfg.bc, cfg.n, p.L, p.c), 8);
      const sub = String(cfg.n);
      richText(tr('lamRow', { n: sub, l: hideF() ? '?' : n(lam, 3) }), lx, ly, fs, theme.text, 'left', false, 650);
      ly += row;
      const fTxt = tr(R.w < 320 ? 'fRowS' : 'fRow', { n: sub, f: hideF() ? '?' : fHz(f) });
      richText(fTxt, lx, ly, fs + 1, green(), 'left', false, 800);
      ly += row;
      if (ly + row + 7 < R.y + R.h - 4) {
        richText(ctx.t(cfg.bc === 'fl' ? 'genUneq' : 'genEq'), lx, ly, fs, theme.muted, 'left', false, 650);
        ly += row;
      }
      if (ly + 7 < R.y + R.h - 4) {
        const k = nodes(cfg.bc, cfg.n).length;
        const b = antinodes(cfg.bc, cfg.n).length;
        const cnt = cfg.med === 'air' ? tr(R.w < 340 ? 'countAirS' : 'countAir', { k: String(k), b: String(b) }) : tr(b === 1 ? 'countRow1' : 'countRow', { k: String(k), b: String(b) });
        richText(cnt, lx, ly, sm ? 11 : 12, theme.muted, 'left', false, 600);
      }
      g.restore();
    }

    let ladderHits: { n: number; x: number; y0: number; y1: number }[] = [];
    let hoverN: number | null = null;

    function drawLadder(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      slideIn(R, ik, 0.25);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const fs = sm ? 11 : 12;
      const ty = R.y + (sm ? 16 : 19);
      const tw = richText(ctx.t('ladder'), R.x + 14, ty, fs + 1, theme.text, 'left', false, 750);
      const cfg = eigNow;
      const odd = cfg.bc === 'fl';
      const note = ctx.t(odd ? 'oddOnly' : 'allMult');
      if (R.x + 14 + tw + 12 + richWidth(note, fs, 650) < R.x + R.w - 14) richText(note, R.x + R.w - 14, ty, fs, odd ? orange() : theme.muted, 'right', false, 650);
      const A: Rect = { x: R.x + 18, y: R.y + (sm ? 40 : 50), w: R.w - 36, h: R.h - (sm ? 40 : 50) - (sm ? 30 : 36) };
      const f1 = ease2('lf1', eigenFrequency(cfg.bc, 1, p.L, p.c), 8);
      const hMax = ease2('lhMax', harmonic(cfg.bc, 6) + 0.7, 6);
      const Xf = (h: number) => A.x + (h / hMax) * A.w;
      // Achse
      const ay = A.y + A.h;
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(A.x, ay + 0.5);
      g.lineTo(A.x + A.w, ay + 0.5);
      g.stroke();
      arrowPx(A.x + A.w - 10, ay + 0.5, A.x + A.w + 4, ay + 0.5, theme.axis, 1.4, 7);
      g.font = `${fs}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText('0', A.x - 3, ay + 6);
      g.textAlign = 'right';
      g.fillText('f', A.x + A.w + 4, ay + 6);
      ladderHits = [];
      const aOdd = ease2('lOdd', odd ? 1 : 0, 6);
      // fehlende gerade Vielfache (gedackt)
      if (aOdd > 0.01) {
        for (let h = 2; h <= 12; h += 2) {
          if (h > hMax) break;
          const x = Xf(h);
          g.save();
          g.globalAlpha *= aOdd * 0.6;
          g.strokeStyle = theme.muted;
          g.setLineDash([3, 4]);
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(x, ay);
          g.lineTo(x, ay - A.h * 0.4);
          g.stroke();
          g.setLineDash([]);
          g.restore();
        }
      }
      for (let k = 1; k <= 6; k++) {
        const h = harmonic(cfg.bc, k);
        const x = Xf(ease2('lx' + k, h, 7));
        const sel = k === cfg.n;
        const selA = ease2('lsel' + k, sel ? 1 : 0, 8);
        const hov = hoverN === k;
        const top = A.y + A.h * 0.16;
        const col = mixColor(theme.muted, green(), Math.max(selA, hov ? 0.5 : 0));
        g.save();
        if (selA > 0.01) {
          g.strokeStyle = withAlpha(green(), 0.25 * selA);
          g.lineWidth = 12;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x, ay - 2);
          g.lineTo(x, top);
          g.stroke();
        }
        g.strokeStyle = col;
        g.lineWidth = 3 + 2 * selA;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x, ay - 2);
        g.lineTo(x, top);
        g.stroke();
        g.fillStyle = col;
        g.beginPath();
        g.arc(x, top, 4 + 2.5 * selA, 0, TAU);
        g.fill();
        g.restore();
        // Beschriftung: f_k unten, Wert oben (Wert nur, wenn Platz)
        richText(`f_{${k}}`, x, ay + (sm ? 12 : 14), fs, sel ? green() : theme.muted, 'center', false, sel ? 800 : 650);
        const gap = Xf(harmonic(cfg.bc, 2)) - Xf(harmonic(cfg.bc, 1));
        const val = hideF() ? '?' : fHz(f1 * h);
        if (sel || (!hideF() && gap > richWidth(val + ' Hz', fs) + 6)) richText(sel ? `${val} Hz` : val, x, top - (sm ? 11 : 13), fs, sel ? green() : theme.muted, 'center', true, sel ? 800 : 600);
        ladderHits.push({ n: k, x, y0: A.y - 6, y1: ay + 22 });
      }
      g.restore();
    }

    function drawInfoRes(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      slideIn(R, ik, 0.1);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      const fs = sm ? 12 : 13;
      const nu = nuEnt();
      const ord = nearestOrder(nu);
      const steady = steadyAmp(nu);
      const isRes = steady > 4.5;
      const t0 = cardTitle(R, ctx.t('cardRes'), green(), sm);
      const verdict = isRes ? ctx.t('resYes') : ctx.t('resNo');
      const vs = sm ? 11 : 12;
      const vw = richWidth(verdict, vs) + 16;
      if (R.x + pad + t0.w + 10 + vw < R.x + R.w - pad) pill(R.x + R.w - pad, t0.y - (vs + 11) / 2, verdict, isRes ? green() : theme.muted, 'right', vs, isRes ? green() : undefined);
      const lx = R.x + pad;
      let ly = t0.y + (sm ? 24 : 30);
      const row = sm ? 19 : 23;
      const f = ease2('rf', p.f, 9, dragF);
      richText(tr('fNow', { f: n(f, 0) }), lx, ly, fs, purple(), 'left', false, 750);
      ly += row;
      const fn = ease2('rfn', ord * f1ref(), 8);
      richText(tr(R.w < 330 ? 'fNextS' : 'fNext', { n: String(ord), f: hideF() ? '?' : fHz(fn) }), lx, ly, fs, theme.text, 'left', false, 600);
      ly += row + (sm ? 4 : 8);
      const big = sm ? 20 : 25;
      const aS = ease2('ramp', ampLive, 6);
      g.font = `800 ${big}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = aS > 4.5 ? green() : theme.text;
      g.fillText(tr('ampBig', { a: fmt.fixed(aS, 1) }), lx, ly);
      // Balken 0 … Resonanz
      const by = ly + big / 2 + (sm ? 10 : 14);
      if (by + 18 < R.y + R.h) {
        const gx0 = lx;
        const gx1 = R.x + R.w - pad;
        g.fillStyle = withAlpha(theme.muted, 0.22);
        roundRect(g, gx0, by - 3, gx1 - gx0, 6, 3);
        g.fill();
        const bar = g.createLinearGradient(gx0, 0, gx1, 0);
        bar.addColorStop(0, withAlpha(green(), 0.45));
        bar.addColorStop(1, green());
        g.fillStyle = bar;
        roundRect(g, gx0, by - 3, Math.max(6, (gx1 - gx0) * clamp(aS / (PEAK + 1), 0, 1)), 6, 3);
        g.fill();
        if (by + 16 < R.y + R.h - 2) richText(ctx.t('ampSub'), gx0, by + 14, 11, theme.muted, 'left', false, 600);
      }
      g.restore();
    }

    let resChart: { A: Rect; fMax: number } | null = null;

    function drawChartRes(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      slideIn(R, ik, 0.25);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const fs = sm ? 11 : 12;
      const padL = sm ? 30 : 36;
      const padR = sm ? 12 : 16;
      const padT = sm ? 34 : 40;
      const padB = sm ? 24 : 28;
      const A: Rect = { x: R.x + padL, y: R.y + padT, w: R.w - padL - padR, h: R.h - padT - padB };
      const ty = R.y + (sm ? 16 : 19);
      const tw = richText(ctx.t(R.w < 300 ? 'chartResS' : 'chartRes'), R.x + 14, ty, fs + 1, theme.text, 'left', false, 750);
      // Legende
      let lx = R.x + R.w - 14;
      for (const [lab, col, dot] of [
        [ctx.t('live'), green(), true],
        [ctx.t('theory'), theme.muted, false],
      ] as const) {
        const w = richWidth(lab, fs, 650);
        if (lx - w - 20 < R.x + 14 + tw + 10) break;
        richText(lab, lx, ty, fs, col, 'right', false, 650);
        if (dot) {
          g.fillStyle = col;
          g.beginPath();
          g.arc(lx - w - 9, ty, 4.5, 0, TAU);
          g.fill();
        } else {
          g.strokeStyle = col;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(lx - w - 20, ty);
          g.lineTo(lx - w - 5, ty);
          g.stroke();
        }
        lx -= w + 32;
      }
      if (A.w < 40 || A.h < 24) {
        g.restore();
        return;
      }
      const f1 = ease2('cf1', f1ref(), 7);
      const fMax = NU_MAX * f1;
      resChart = { A, fMax };
      const yMax = PEAK * 1.12;
      const Xp = (f: number) => A.x + (f / fMax) * A.w;
      const Yp = (y: number) => A.y + A.h - (y / yMax) * A.h;
      // Gitter und Achsen
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (const yy of [2, 4, 6, 8]) {
        const py = Math.round(Yp(yy)) + 0.5;
        g.moveTo(A.x, py);
        g.lineTo(A.x + A.w, py);
      }
      g.stroke();
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(A.x, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w, A.y + A.h + 0.5);
      g.moveTo(A.x + 0.5, A.y - 2);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.stroke();
      g.font = `${fs}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (const yy of [2, 4, 6, 8]) g.fillText(`${yy}a`, A.x - 5, Yp(yy));
      // Eigenfrequenzen
      g.textAlign = 'center';
      g.textBaseline = 'top';
      for (let k = 1; k <= 6; k++) {
        const x = Xp(k * f1);
        if (x > A.x + A.w) break;
        g.strokeStyle = withAlpha(theme.muted, 0.45);
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(Math.round(x) + 0.5, A.y);
        g.lineTo(Math.round(x) + 0.5, A.y + A.h);
        g.stroke();
        g.setLineDash([]);
        richText(`f_{${k}}`, x, A.y + A.h + (sm ? 11 : 13), fs, theme.muted, 'center', false, 650);
      }
      richText('f', A.x + A.w, A.y + A.h + (sm ? 11 : 13), fs, theme.muted, 'right', false, 650);
      // Kurve mit Fläche
      const N = Math.max(120, Math.round(A.w));
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 2, A.w, A.h + 2);
      g.clip();
      const pts: [number, number][] = [];
      for (let i = 0; i <= N; i++) {
        const nu = (NU_MAX * i) / N;
        pts.push([A.x + (A.w * i) / N, Yp(curveAt(nu))]);
      }
      const area = g.createLinearGradient(0, A.y, 0, A.y + A.h);
      area.addColorStop(0, withAlpha(green(), 0.22));
      area.addColorStop(1, withAlpha(green(), 0.02));
      g.fillStyle = area;
      g.beginPath();
      g.moveTo(A.x, A.y + A.h);
      for (const [x, y] of pts) g.lineTo(x, y);
      g.lineTo(A.x + A.w, A.y + A.h);
      g.closePath();
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.8;
      g.lineJoin = 'round';
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
      // Erregerfrequenz
      const fS = ease2('cfS', p.f, 10, dragF);
      const over = fS > fMax;
      const xf = Math.min(Xp(fS), A.x + A.w);
      g.strokeStyle = purple();
      g.lineWidth = dragF || hoverF ? 2.6 : 2;
      g.beginPath();
      g.moveTo(xf, A.y - 4);
      g.lineTo(xf, A.y + A.h);
      g.stroke();
      // Griff oben
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.fillStyle = purple();
      g.beginPath();
      g.arc(xf, A.y - 4, dragF || hoverF ? 7 : 5.5, 0, TAU);
      g.fill();
      g.restore();
      const steady = curveAt(Math.min(fS / f1, NU_MAX));
      if (!over) {
        g.strokeStyle = theme.bg;
        g.lineWidth = 2;
        g.fillStyle = withAlpha(theme.text, 0.6);
        g.beginPath();
        g.arc(xf, Yp(steady), 4, 0, TAU);
        g.fill();
        g.stroke();
      }
      // gemessener Wert (wächst beim Einschwingen)
      const aS = ease2('cAmp', ampLive, 8);
      g.save();
      g.shadowColor = withAlpha(green(), 0.6);
      g.shadowBlur = 8;
      g.fillStyle = green();
      g.beginPath();
      g.arc(xf, Yp(Math.min(aS, yMax)), 6, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = theme.bg;
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(xf, Yp(Math.min(aS, yMax)), 6, 0, TAU);
      g.stroke();
      const lab = `${n(p.f, 0)} Hz${over ? ' →' : ''}`;
      const lw = richWidth(lab, fs);
      const right = xf + 10 + lw < A.x + A.w;
      richText(lab, right ? xf + 9 : xf - 9, A.y + 8, fs, purple(), right ? 'left' : 'right', true, 750);
      g.restore();
    }

    /* ---------- Ton (Web Audio, nur nach Klick) ---------- */
    interface Rig {
      ac: AudioContext;
      master: GainNode;
      osc: OscillatorNode;
      osc2: OscillatorNode;
      gain: GainNode;
    }
    let rig: Rig | null = null;

    function audioFreq(): number {
      if (mode() === 'eig') return eigenFrequency(eigNow.bc, eigNow.n, p.L, p.c);
      return p.f;
    }
    function audioLevel(): number {
      if (mode() === 'res') return clamp(ampLive / PEAK, 0.06, 1);
      return 1;
    }

    function startAudio(): void {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const AC = w.AudioContext ?? w.webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      const master = ac.createGain();
      master.gain.value = 0;
      master.gain.setTargetAtTime(0.06, ac.currentTime, 0.06);
      master.connect(ac.destination);
      const gain = ac.createGain();
      gain.gain.value = audioLevel();
      gain.connect(master);
      const osc = ac.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = clamp(audioFreq(), 20, 5000);
      osc.connect(gain);
      const osc2 = ac.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.value = clamp(2 * audioFreq(), 20, 10000);
      const g2 = ac.createGain();
      g2.gain.value = 0.18;
      osc2.connect(g2);
      g2.connect(gain);
      osc.start();
      osc2.start();
      rig = { ac, master, osc, osc2, gain };
      void ac.resume();
    }

    function stopAudio(): void {
      if (!rig) return;
      const r = rig;
      rig = null;
      r.master.gain.setTargetAtTime(0, r.ac.currentTime, 0.04);
      window.setTimeout(() => void r.ac.close(), 300);
    }

    function updateAudio(): void {
      ctx.setAction('snd', { label: ctx.t(rig ? 'sndOff' : 'sndOn') });
      if (!rig) return;
      const now = rig.ac.currentTime;
      const f = clamp(audioFreq(), 20, 5000);
      rig.osc.frequency.setTargetAtTime(f, now, 0.03);
      rig.osc2.frequency.setTargetAtTime(2 * f, now, 0.03);
      rig.gain.gain.setTargetAtTime(audioLevel(), now, 0.08);
    }

    /* ---------- Ergebnisse ---------- */
    const list = (xs: number[]) => xs.map(len3).join('; ');

    function updateNow(): void {
      const m = mode();
      const t = fmt.fixed(simMs, simMs < 100 ? 2 : 1);
      if (m === 'ent') {
        const nu = nuEnt();
        const xh = 1 - Math.min(p.pd, p.L) / p.L;
        const w = travelling(endType(), nu, xh, tauE, thetaE);
        ctx.readout('now', tr('nowEnt', { t, yh: fmt.fixed(w.yh, 2), yr: fmt.fixed(w.yr, 2), y: fmt.fixed(w.yh + w.yr, 2) }));
      } else if (m === 'eig') {
        const deg = ((((thetaN * 180) / Math.PI) % 360) + 360) % 360;
        ctx.readout('now', tr('nowEig', { t, ph: fmt.fixed(deg, 0), y: fmt.fixed(Math.cos(thetaN), 2) }));
      } else ctx.readout('now', tr('nowRes', { t, y: fmt.fixed(rope.maxAbs(), 1) }));
    }

    function updateReadouts(): void {
      const m = mode();
      ctx.setAction('go', { label: ctx.t(m === 'res' ? 'goRes' : 'goEnt'), enabled: !ctx.locked });
      if (m === 'ent') {
        const lam = lamEnt();
        ctx.readout('main', { html: tr('mainEnt', { c: n(p.c, 0), f: n(p.f, 0), l: n(lam, 3), h: n(lam / 2, 3) }) });
        const nd = reflectionNodes(endType(), lam, p.L);
        const an = reflectionAntinodes(endType(), lam, p.L);
        const show = (xs: number[]) => (xs.length ? `${list(xs.slice(0, 6))}${xs.length > 6 ? ' …' : ''} m` : ctx.t('noneOnRope'));
        ctx.readout('kb', { html: tr(endType() === 'fix' ? 'kbEntFix' : 'kbEntFree', { nodes: show(nd), anti: show(an) }) });
        const pd = Math.min(p.pd, p.L);
        const q = pd / lam;
        const A = reflectionAmplitude(endType(), pd, lam);
        const kind = pointKind(endType(), pd, lam);
        const atNode = kind === 'node';
        const atAnti = kind === 'anti';
        ctx.readout('p', {
          html: tr('pText', { d: n(pd, 2), q: n(q, 3), fn: endType() === 'fix' ? 'sin' : 'cos', a: n(A, 2), verdict: ctx.t(atNode ? 'pNode' : atAnti ? 'pAnti' : 'pMid') }),
        });
        ctx.readout('res', null);
      } else if (m === 'eig') {
        const cfg = curCfg();
        const h = harmonic(cfg.bc, cfg.n);
        const lam = eigenWavelength(cfg.bc, cfg.n, p.L);
        const f = eigenFrequency(cfg.bc, cfg.n, p.L, p.c);
        const uneq = cfg.bc === 'fl';
        ctx.readout('main', {
          html: tr('mainEig', {
            law: ctx.t(uneq ? 'lawUneqHtml' : 'lawEqHtml'),
            n: String(cfg.n),
            lf: tr(uneq ? 'lfUneq' : 'lfEq', { n: String(cfg.n), h: String(h) }),
            l: n(lam, 3),
            c: n(p.c, 0),
            f: fHz(f),
            h: String(h),
            odd: uneq ? ctx.t('oddNote') : '',
          }),
        });
        const k = nodes(cfg.bc, cfg.n).map((x) => x * p.L);
        const b = antinodes(cfg.bc, cfg.n).map((x) => x * p.L);
        ctx.readout('kb', { html: tr(cfg.med === 'air' ? 'kbAir' : 'kbEig', { nodes: list(k), anti: list(b), h: n(lam / 2, 3) }) });
        ctx.readout('p', null);
        ctx.readout('res', null);
      } else {
        const f1 = f1ref();
        const nu = nuEnt();
        ctx.readout('main', { html: tr('mainRes', { f1: fHz(f1), list: [1, 2, 3, 4].map((k) => `${fHz(k * f1)} Hz`).join(', '), f: n(p.f, 0), q: fmt.fixed(nu, 2) }) });
        const steady = resonanceAmplitude(nu);
        const ord = nearestOrder(nu);
        const isRes = steady > 4.5;
        ctx.readout('kb', { html: isRes ? tr('kbRes', { n: String(ord), nodes: ((xs) => list(xs.slice(0, 7)) + (xs.length > 7 ? ' …' : ''))(nodes('ff', ord).map((x) => x * p.L)) }) : ctx.t('kbResNo') });
        ctx.readout('p', null);
        ctx.readout('res', { html: tr('resText', { a: fmt.fixed(steady, 1), verdict: ctx.t(isRes ? 'resYesText' : steady > 2.5 ? 'resNearText' : 'resNoText') }) });
      }
      updateNow();
      updateAudio();
    }

    /* ---------- Bedienung ---------- */
    let dragP = false;
    let hoverP = false;
    let dragF = false;
    let hoverF = false;

    function hitP(px: number, py: number): boolean {
      if (ctx.locked || mode() !== 'ent' || !geoNow) return false;
      const g0 = geoNow;
      if (Math.hypot(px - drawnP[0], py - drawnP[1]) < 20) return true;
      return Math.abs(px - drawnP[0]) < 12 && py > g0.cy - g0.H && py < g0.cy + g0.H;
    }

    function dragPTo(px: number): void {
      const g0 = geoNow;
      if (!g0) return;
      const Ls = soft.get('L') ?? p.L;
      const d = ((g0.x1 - px) / (g0.x1 - g0.x0)) * Ls;
      ctx.set({ pd: clamp(d, 0, p.L) });
    }

    function hitF(px: number, py: number): boolean {
      if (ctx.locked || mode() !== 'res' || !resChart) return false;
      const A = resChart.A;
      return px >= A.x - 8 && px <= A.x + A.w + 8 && py >= A.y - 14 && py <= A.y + A.h + 24;
    }

    function dragFTo(px: number): void {
      if (!resChart) return;
      const A = resChart.A;
      const f1 = f1ref();
      let f = clamp(((px - A.x) / A.w) * resChart.fMax, 10, 1500);
      // nahe einer Eigenfrequenz einrasten
      const k = Math.round(f / f1);
      if (k >= 1 && Math.abs(Xpx(k * f1) - px) < 7) f = k * f1;
      ctx.set({ f: Math.round(f) });
      function Xpx(ff: number): number {
        return A.x + (ff / resChart!.fMax) * A.w;
      }
    }

    function hitLadder(px: number, py: number): number | null {
      if (ctx.locked || mode() !== 'eig') return null;
      let best: number | null = null;
      let bd = 22;
      for (const h of ladderHits) {
        if (py < h.y0 || py > h.y1) continue;
        const d = Math.abs(px - h.x);
        if (d < bd) {
          bd = d;
          best = h.n;
        }
      }
      return best;
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitP(px, py) || hitF(px, py) || hitLadder(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        if (hitP(q.px, q.py)) {
          dragP = true;
          surface.setCursor('grabbing');
          dragPTo(q.px);
          ctx.requestRender();
          return true;
        }
        if (hitF(q.px, q.py)) {
          dragF = true;
          surface.setCursor('grabbing');
          dragFTo(q.px);
          if (!ctx.clock.playing && !prefersReducedMotion()) ctx.clock.play();
          return true;
        }
        const k = hitLadder(q.px, q.py);
        if (k !== null) {
          ctx.set({ n: k });
          return true;
        }
        return false;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (dragP) dragPTo(q.px);
        else if (dragF) dragFTo(q.px);
      },
      pointerUp: () => {
        dragP = false;
        dragF = false;
        surface.setCursor(hoverP || hoverF ? 'grab' : hoverN !== null ? 'pointer' : '');
        updateReadouts();
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const hp = q ? hitP(q.px, q.py) : false;
        const hf = q ? hitF(q.px, q.py) : false;
        const hn = q ? hitLadder(q.px, q.py) : null;
        if (hp !== hoverP || hf !== hoverF || hn !== hoverN) {
          hoverP = hp;
          hoverF = hf;
          hoverN = hn;
          ctx.requestRender();
        }
        surface.setCursor(hp || hf ? 'grab' : hn !== null ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    function stepRes(dt: number): void {
      const nu = nuEnt();
      const dTau = dt * rateFor(nu);
      fdAcc += dTau;
      let steps = Math.floor(fdAcc / rope.dt);
      steps = Math.min(steps, 4000);
      fdAcc -= steps * rope.dt;
      if (fdAcc > rope.dt) fdAcc = 0;
      const decay = Math.exp(-dTau * Math.max(nu, 0.4) * 1.6);
      for (let i = 0; i < steps; i++) rope.step(nu);
      let mx = 0;
      for (let j = 0; j <= rope.n; j++) {
        const a = Math.abs(rope.y[j]!);
        envArr[j] = Math.max(a, envArr[j]! * decay);
        mx = Math.max(mx, envArr[j]!);
      }
      ampLive = mx;
      simMs += (dTau / f1ref()) * 1000;
    }

    function onModeEnter(): void {
      const m = mode();
      if (m === 'ent') startSweep();
      if (m === 'eig') {
        eigNow = curCfg();
        eigOld = null;
        pluck.play();
      }
      if (m === 'res') resetRes(true);
    }

    return {
      update(changed, source) {
        if (source === 'input') {
          if (changed.has('med')) ctx.set({ c: p.med === 'air' ? 340 : 286 });
        }
        if (source === 'init' || source === 'replace') {
          lay = computeLayout();
          intro.play();
          simMs = 0;
          thetaN = 0;
          onModeEnter();
          soft.clear();
        } else {
          if (changed.has('mode')) {
            modeFade.play();
            simMs = 0;
            onModeEnter();
          } else if (mode() === 'ent') {
            if (changed.has('end')) {
              startSweep();
              simMs = 0;
            }
          } else if (mode() === 'eig') {
            const nc = curCfg();
            if (nc.bc !== eigNow.bc || nc.n !== eigNow.n || nc.med !== eigNow.med) {
              eigOld = eigNow;
              thetaOld = thetaN;
              eigNow = nc;
              morph.play();
            }
          } else if (mode() === 'res') {
            if ((changed.has('f') || changed.has('L') || changed.has('c')) && !ctx.locked) {
              if (prefersReducedMotion() && !ctx.clock.playing) resetRes(true);
              else if (!ctx.clock.playing && source === 'input') ctx.clock.play();
            }
          }
        }
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (id === 'snd') {
          if (rig) stopAudio();
          else startAudio();
          updateAudio();
          return;
        }
        if (ctx.locked) return;
        if (id === 'go') {
          simMs = 0;
          if (mode() === 'ent') {
            startSweep();
            sweep.finish();
            sweepSpan = 0;
            tauE = 0;
            thetaE = 0;
          } else if (mode() === 'res') resetRes(false);
          ctx.clock.play();
          updateReadouts();
        }
      },

      tick(dt) {
        const m = mode();
        if (m === 'ent') {
          const nu = nuEnt();
          const d = dt * rateFor(nu);
          tauE += d;
          thetaE += TAU * nu * d;
          simMs += (d / f1ref()) * 1000;
        } else if (m === 'eig') {
          const nu = eigenNu(eigNow.bc, eigNow.n);
          const d = dt * rateFor(nu);
          thetaN += TAU * nu * d;
          if (eigOld) thetaOld += TAU * eigenNu(eigOld.bc, eigOld.n) * d;
          simMs += (d / f1ref()) * 1000;
        } else stepRes(dt);
        updateNow();
        if (m === 'res' && rig) updateAudio();
      },

      resetTime() {
        simMs = 0;
        if (mode() === 'ent') startSweep();
        else if (mode() === 'eig') thetaN = 0;
        else resetRes(false);
        updateReadouts();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = computeLayout();
        const m = mode();
        const Ls = ease2('L', p.L, 8);
        const g0 = buildGeo(lay.scene, Ls);
        geoNow = g0;
        if (m === 'ent') {
          advanceSweep(ease2('nuE', nuEnt(), 7));
          const thr = lockThreshold(nuEnt());
          if (!locked && tauE >= thr) {
            locked = true;
            if (!prefersReducedMotion()) lockGlow.play();
          }
          if (locked && tauE < thr) locked = false;
        }
        const ik = intro.running ? intro.value : 1;
        const mk = modeFade.running ? modeFade.value : 1;
        const g = surface.begin();
        drawPanel(lay.scene);
        g.save();
        roundRect(g, lay.scene.x + 2, lay.scene.y + 2, lay.scene.w - 4, lay.scene.h - 4, 13);
        g.clip();
        g.globalAlpha = mk;
        if (m === 'ent') drawEnt(g0, ik);
        else if (m === 'eig') drawEig(g0, ik);
        else drawRes(g0, ik);
        g.globalAlpha = 1;
        drawHeader(g0, ik);
        g.restore();
        const ck = Math.min(ik, mk);
        if (m === 'ent') {
          drawInfoEnt(lay.info, ck);
          drawChartEnt(lay.chart, ck);
        } else if (m === 'eig') {
          drawInfoEig(lay.info, ck);
          drawLadder(lay.chart, ck);
        } else {
          drawInfoRes(lay.info, ck);
          drawChartRes(lay.chart, ck);
        }
        if (animating || intro.running || modeFade.running || sweep.running || lockGlow.running || morph.running || pluck.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        stopAudio();
        surface.destroy();
      },
    };
  },
});
