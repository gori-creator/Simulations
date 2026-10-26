import { clamp, defineSimulation, ease, measureSubText, mixColor, prefersReducedMotion, roundRect, subText, Surface, textOn, Tween, withAlpha, type Rect, type SubTextStyle } from '../../../sim-core';
import { classify, farFieldAngle, frequency, frontEnvelope, hyperbola, maxLines, minLines, paths, phaseRad, WAVE_SPEED, type Line } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Sichtbarer Ausschnitt der Wellenwanne mindestens (cm): Breite, Höhe, davon unterhalb der Verbindungsachse. */
const VIEW_W = 24;
const VIEW_H = 21.5;
const AXIS_BELOW = 3.5;
/** Dauer einer Periode im Bild in echten Sekunden (ohne Zeitlupe). */
const VIS_PERIOD = 1;
/** Dauer der „Ausbreitungs“-Animation beim Laden und Neustart (ms). */
const SWEEP_MS = 5000;
/** Tabelle für sin (schnelle Berechnung des Wellenfelds). */
const LUT_N = 4096;
const SIN = new Float32Array(LUT_N + 1);
for (let i = 0; i <= LUT_N; i++) SIN[i] = Math.sin((TAU * i) / LUT_N);

type Grab = 'e1' | 'e2' | 'p';

interface Layout {
  tank: Rect;
  info: Rect;
  chart: Rect;
  side: boolean;
}

interface Geo {
  r: Rect;
  sm: boolean;
  /** Pixel pro cm. */
  k: number;
  /** Mitte M zwischen den Erregern in Pixeln. */
  cx: number;
  ay: number;
  /** sichtbarer Bereich in cm. */
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Angezeigter (weich nachgeführter) Zustand. */
interface View {
  d: number;
  lam: number;
  ph: number;
  px: number;
  py: number;
  n: number;
  R: number;
  mix: number;
}

/**
 * Interferenz zweier Kreiswellen in der Wellenwanne (Draufsicht): Das
 * Überlagerungsfeld wird pixelweise als Wasseroberfläche mit Lichtreflexen
 * gezeichnet (Momentbild) oder als zeitlich gemitteltes Amplitudenbild.
 * Ziehbare Erreger E₁, E₂ und Messpunkt P mit Wegstrecken, Gangunterschied,
 * Zeigerdiagramm und y(t)-Verlauf, Knoten- und Bauchlinien als Hyperbeln mit
 * Ordnung k, Fernfeld-Richtungen sin α_k ≈ k · λ/d.
 */
export default defineSimulation({
  id: 'interferenz',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.5 },
  groups: [
    { id: 'view', label: L('Anzeige', 'Display') },
    { id: 'p', label: L('Messpunkt P', 'Measuring point P') },
  ],
  params: [
    {
      key: 'lam',
      type: 'number',
      label: L('Wellenlänge λ', 'Wavelength λ'),
      help: L('Die Erreger schwingen mit f = c/λ; in der Wellenwanne ist c ≈ 20 cm/s.', 'The sources oscillate at f = c/λ; in the ripple tank c ≈ 20 cm/s.'),
      min: 1,
      max: 4,
      step: 0.1,
      default: 2,
      unit: 'cm',
    },
    { key: 'd', type: 'number', label: L('Abstand der Erreger d', 'Distance between the sources d'), help: L('Oder: E₁ oder E₂ im Bild ziehen.', 'Or drag E₁ or E₂ in the picture.'), min: 0.5, max: 14, step: 0.1, default: 6, unit: 'cm' },
    {
      key: 'ph',
      type: 'number',
      label: L('Phasenunterschied Δφ der Erreger', 'Phase difference Δφ of the sources'),
      help: L('E₂ eilt E₁ um Δφ voraus. 0° = gleichphasig, 180° = gegenphasig.', 'E₂ leads E₁ by Δφ. 0° = in phase, 180° = in antiphase.'),
      min: 0,
      max: 360,
      step: 15,
      default: 0,
      unit: '°',
    },
    {
      key: 'view',
      type: 'choice',
      label: L('Darstellung', 'Display'),
      options: [
        { value: 'wave', label: L('Momentbild', 'Snapshot') },
        { value: 'amp', label: L('Amplitudenbild', 'Amplitude pattern') },
      ],
      default: 'wave',
    },
    { key: 'slow', type: 'boolean', label: L('Zeitlupe', 'Slow motion'), default: false },
    {
      key: 'lines',
      type: 'choice',
      group: 'view',
      label: L('Interferenzlinien', 'Interference lines'),
      options: [
        { value: 'none', label: L('keine', 'none') },
        { value: 'min', label: L('Knotenlinien', 'nodal lines') },
        { value: 'max', label: L('Bauchlinien', 'antinodal lines') },
        { value: 'both', label: L('beide', 'both') },
      ],
      default: 'min',
    },
    { key: 'path', type: 'boolean', group: 'view', label: L('Wegstrecken s₁ und s₂ zu P', 'Path lengths s₁ and s₂ to P'), default: true },
    { key: 'far', type: 'boolean', group: 'view', label: L('Fernfeld: Richtungen mit sin α_k ≈ k · λ/d', 'Far field: directions with sin α_k ≈ k · λ/d'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
    { key: 'px', type: 'number', group: 'p', label: L('x-Koordinate von P', 'x coordinate of P'), help: L('Oder: P im Bild ziehen. 0 = Mittelsenkrechte.', 'Or drag P in the picture. 0 = perpendicular bisector.'), min: -10.5, max: 10.5, step: 0.1, default: 3, unit: 'cm' },
    { key: 'py', type: 'number', group: 'p', label: L('y-Koordinate von P', 'y coordinate of P'), help: L('Abstand von der Verbindungslinie der Erreger.', 'Distance from the line through the sources.'), min: -3, max: 17, step: 0.1, default: 10, unit: 'cm' },
  ],
  actions: [{ id: 'go', label: L('Wellen neu starten', 'Restart the waves'), primary: true }],
  readouts: [
    { key: 'ds', label: L('Gangunterschied in P', 'Path difference at P'), spoiler: true },
    { key: 'amp', label: L('Amplitude in P', 'Amplitude at P'), spoiler: true },
    { key: 'lines', label: L('Interferenzlinien', 'Interference lines'), spoiler: true },
    { key: 'far', label: L('Fernfeld', 'Far field'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'start', label: L('Gleichphasig, d = 3λ', 'In phase, d = 3λ'), values: {} },
    { id: 'amp', label: L('Amplitudenbild mit allen Linien', 'Amplitude pattern with all lines'), values: { view: 'amp', lines: 'both' } },
    { id: 'anti', label: L('Gegenphasig: Mitte wird Knotenlinie', 'Antiphase: the centre becomes a nodal line'), values: { ph: 180, lines: 'both', px: 0, py: 12 } },
    { id: 'close', label: L('d < λ/2: keine Knotenlinie', 'd < λ/2: no nodal line'), values: { d: 0.8, lam: 2.4, lines: 'both', view: 'amp' } },
    { id: 'many', label: L('Großer Abstand: viele Linien', 'Large distance: many lines'), values: { d: 12, lam: 1.5, lines: 'max', view: 'amp', px: 6, py: 14 } },
    { id: 'far', label: L('Fernfeld: Brücke zum Doppelspalt', 'Far field: link to the double slit'), values: { d: 4, lam: 1.2, lines: 'max', far: true, view: 'amp', px: 7, py: 15 } },
  ],
  strings: {
    de: {
      canvas:
        'Wellenwanne von oben: Zwei Erreger E₁ und E₂ senden Kreiswellen aus, die sich überlagern; helle und dunkle Bereiche zeigen Wellenberge und -täler bzw. die Amplitude. Knoten- und Bauchlinien als Hyperbeln, ein ziehbarer Messpunkt P mit den Wegstrecken s₁ und s₂; daneben Gangunterschied, Amplitude, Zeigerdiagramm und der zeitliche Verlauf der Schwingungen in P',
      fc: 'f = {f} Hz · c = {c} cm/s',
      fcS: 'f = {f} Hz',
      slowPill: 'im Bild {k}× langsamer',
      slowPillS: '{k}× langsamer',
      lamBar: 'λ = {l} cm',
      dBar: 'd = {d} cm',
      dBarS: 'd',
      kLab: 'k = {k}',
      legMax: 'Bauchlinie',
      legMin: 'Knotenlinie',
      alpha: 'α_{{k}} = {a}°',
      alphaS: 'α_{{k}}',
      farNote: 'sin α_k ≈ k · λ/d',
      cardTitle: 'Messpunkt P',
      vMax: 'Maximum',
      vMin: 'Minimum',
      vUp: 'verstärkt',
      vDown: 'abgeschwächt',
      vHidden: '?',
      single: 'eine Welle',
      chartTitle: 'Schwingungen in P',
      chartTitleS: 'in P',
      now: 'jetzt',
      hidden: '?',
      dsText:
        '<var>s</var><sub>1</sub> = {s1} cm, <var>s</var><sub>2</sub> = {s2} cm<br>Δ<var>s</var> = <var>s</var><sub>1</sub> − <var>s</var><sub>2</sub> = {ds} cm = <strong>{q} · <var>λ</var></strong>',
      ampText:
        'Phasenunterschied in P: <var>δ</var> = 2π · <span class="frac"><span>Δ<var>s</var></span><span><var>λ</var></span></span> + Δ<var>φ</var> ≙ {deg}°<br><var>A</var> = 2<var>ŷ</var> · |cos(<var>δ</var>/2)| = <strong>{a} · <var>ŷ</var></strong> – {verdict}',
      verdictMax: 'Verstärkung (Maximum, Bauchlinie)',
      verdictMin: 'Auslöschung (Minimum, Knotenlinie)',
      verdictUp: 'teilweise Verstärkung',
      verdictDown: 'teilweise Abschwächung',
      linesText:
        '<var>f</var> = <span class="frac"><span><var>c</var></span><span><var>λ</var></span></span> = <span class="frac"><span>20 cm/s</span><span>{l} cm</span></span> = {f} Hz · <var>d</var> = {d} cm = {q} · <var>λ</var><br>Bauchlinien: Δ<var>s</var> = <var>k</var> · <var>λ</var> mit |Δ<var>s</var>| ≤ <var>d</var>, also |<var>k</var>| ≤ <span class="frac"><span><var>d</var></span><span><var>λ</var></span></span> → <var>k</var> = {kmin} … {kmax}: <strong>{nmax} Bauchlinien</strong>{axis}<br>Knotenlinien: Δ<var>s</var> = (<var>k</var> + ½) · <var>λ</var> → <strong>{nmin} Knotenlinien</strong>',
      linesTextPh:
        '<var>f</var> = <span class="frac"><span><var>c</var></span><span><var>λ</var></span></span> = <span class="frac"><span>20 cm/s</span><span>{l} cm</span></span> = {f} Hz · <var>d</var> = {d} cm = {q} · <var>λ</var><br>Bauchlinien: Δ<var>s</var> = (<var>k</var> − <span class="frac"><span>Δ<var>φ</var></span><span>360°</span></span>) · <var>λ</var> = (<var>k</var> − {s}) · <var>λ</var> mit |Δ<var>s</var>| ≤ <var>d</var> → <strong>{nmax} Bauchlinien</strong>{axis}<br>Knotenlinien: Δ<var>s</var> = (<var>k</var> + ½ − {s}) · <var>λ</var> → <strong>{nmin} Knotenlinien</strong>',
      axisNote: ' (davon {n} auf der Verbindungsachse außerhalb der Erreger)',
      noneMin: '<br>Für <var>d</var> &lt; <var>λ</var>/2 gibt es keine Knotenlinie.',
      noneMinPh: '<br>Bei diesem Abstand gibt es keine Knotenlinie.',
      farText: 'Weit weg von den Erregern laufen die Hyperbeln auf Geraden durch die Mitte zu: sin <var>α</var><sub><var>k</var></sub> = <span class="frac"><span>Δ<var>s</var><sub><var>k</var></sub></span><span><var>d</var></span></span>{simple}.<br>{list}',
      farSimple: ' = <var>k</var> · <span class="frac"><span><var>λ</var></span><span><var>d</var></span></span> = <var>k</var> · {q}',
      farNone: 'Für <var>λ</var> &gt; <var>d</var> gibt es außer der Mittelsenkrechten keine weitere Bauchlinie.',
      farNoneAll: 'Bei diesem Abstand und Phasenunterschied gibt es keine Bauchlinie.',
      farPhNote: ' (Winkel links der Mittelsenkrechten negativ)',
      farItem: '<var>α</var><sub>{k}</sub> = {a}°',
      nowText: 't = {t} s · in P: y₁ = {y1} ŷ, y₂ = {y2} ŷ, y = y₁ + y₂ = {y} ŷ',
    },
    en: {
      canvas:
        'Ripple tank seen from above: two sources E₁ and E₂ send out circular waves that overlap; light and dark areas show crests and troughs or the amplitude. Nodal and antinodal lines as hyperbolas, a draggable measuring point P with the path lengths s₁ and s₂; next to it the path difference, amplitude, phasor diagram and the oscillations at P over time',
      fc: 'f = {f} Hz · c = {c} cm/s',
      fcS: 'f = {f} Hz',
      slowPill: '{k}× slower in the picture',
      slowPillS: '{k}× slower',
      lamBar: 'λ = {l} cm',
      dBar: 'd = {d} cm',
      dBarS: 'd',
      kLab: 'k = {k}',
      legMax: 'antinodal line',
      legMin: 'nodal line',
      alpha: 'α_{{k}} = {a}°',
      alphaS: 'α_{{k}}',
      farNote: 'sin α_k ≈ k · λ/d',
      cardTitle: 'Measuring point P',
      vMax: 'maximum',
      vMin: 'minimum',
      vUp: 'reinforced',
      vDown: 'weakened',
      vHidden: '?',
      single: 'one wave',
      chartTitle: 'Oscillations at P',
      chartTitleS: 'at P',
      now: 'now',
      hidden: '?',
      dsText:
        '<var>s</var><sub>1</sub> = {s1} cm, <var>s</var><sub>2</sub> = {s2} cm<br>Δ<var>s</var> = <var>s</var><sub>1</sub> − <var>s</var><sub>2</sub> = {ds} cm = <strong>{q} · <var>λ</var></strong>',
      ampText:
        'Phase difference at P: <var>δ</var> = 2π · <span class="frac"><span>Δ<var>s</var></span><span><var>λ</var></span></span> + Δ<var>φ</var> ≙ {deg}°<br><var>A</var> = 2<var>ŷ</var> · |cos(<var>δ</var>/2)| = <strong>{a} · <var>ŷ</var></strong> – {verdict}',
      verdictMax: 'constructive interference (maximum, antinodal line)',
      verdictMin: 'destructive interference (minimum, nodal line)',
      verdictUp: 'partly reinforced',
      verdictDown: 'partly weakened',
      linesText:
        '<var>f</var> = <span class="frac"><span><var>c</var></span><span><var>λ</var></span></span> = <span class="frac"><span>20 cm/s</span><span>{l} cm</span></span> = {f} Hz · <var>d</var> = {d} cm = {q} · <var>λ</var><br>Antinodal lines: Δ<var>s</var> = <var>k</var> · <var>λ</var> with |Δ<var>s</var>| ≤ <var>d</var>, so |<var>k</var>| ≤ <span class="frac"><span><var>d</var></span><span><var>λ</var></span></span> → <var>k</var> = {kmin} … {kmax}: <strong>{nmax} antinodal lines</strong>{axis}<br>Nodal lines: Δ<var>s</var> = (<var>k</var> + ½) · <var>λ</var> → <strong>{nmin} nodal lines</strong>',
      linesTextPh:
        '<var>f</var> = <span class="frac"><span><var>c</var></span><span><var>λ</var></span></span> = <span class="frac"><span>20 cm/s</span><span>{l} cm</span></span> = {f} Hz · <var>d</var> = {d} cm = {q} · <var>λ</var><br>Antinodal lines: Δ<var>s</var> = (<var>k</var> − <span class="frac"><span>Δ<var>φ</var></span><span>360°</span></span>) · <var>λ</var> = (<var>k</var> − {s}) · <var>λ</var> with |Δ<var>s</var>| ≤ <var>d</var> → <strong>{nmax} antinodal lines</strong>{axis}<br>Nodal lines: Δ<var>s</var> = (<var>k</var> + ½ − {s}) · <var>λ</var> → <strong>{nmin} nodal lines</strong>',
      axisNote: ' ({n} of them on the line through the sources, outside the sources)',
      noneMin: '<br>For <var>d</var> &lt; <var>λ</var>/2 there is no nodal line.',
      noneMinPh: '<br>At this distance there is no nodal line.',
      farText: 'Far from the sources the hyperbolas approach straight lines through the centre: sin <var>α</var><sub><var>k</var></sub> = <span class="frac"><span>Δ<var>s</var><sub><var>k</var></sub></span><span><var>d</var></span></span>{simple}.<br>{list}',
      farSimple: ' = <var>k</var> · <span class="frac"><span><var>λ</var></span><span><var>d</var></span></span> = <var>k</var> · {q}',
      farNone: 'For <var>λ</var> &gt; <var>d</var> there is no antinodal line apart from the perpendicular bisector.',
      farNoneAll: 'At this distance and phase difference there is no antinodal line.',
      farPhNote: ' (angles left of the perpendicular bisector negative)',
      farItem: '<var>α</var><sub>{k}</sub> = {a}°',
      nowText: 't = {t} s · at P: y₁ = {y1} ŷ, y₂ = {y2} ŷ, y = y₁ + y₂ = {y} ŷ',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const teal = () => ctx.theme.series[5]!;
    const dphi = () => phaseRad(p.ph);
    /** Gleichphasige Erreger (0° oder 360°)? */
    const inPhase = () => p.ph % 360 === 0;
    /** Feste Nachkommastellen für Messwerte (gleich breite Anzeige). */
    const fx = (v: number, d: number) => fmt.fixed(v, d);

    /* ---------- Zeit und Wellenfront ---------- */
    /** Perioden seit Beginn (Phase der Erreger) und Radius der Wellenfront in cm. */
    let nBase = 0.3;
    let RBase = 0;
    let sweepN = 0;
    const sweep = new Tween(SWEEP_MS, (q) => 1 - (1 - q) * (1 - q));
    let linesReady = false;
    let simT = 0;

    const intro = new Tween(900, ease.outCubic);
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;

    /** Weich nachgeführter Wert (Zahlen zählen, Linien gleiten, Bilder blenden über). */
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

    /* ---------- Ziehen ---------- */
    let grab: Grab | null = null;
    let hover: Grab | null = null;
    let drawnE1: [number, number] = [0, 0];
    let drawnE2: [number, number] = [0, 0];
    let drawnP: [number, number] = [0, 0];

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        // mittlere Breiten (iPad quer): schmalere Seitenspalte, damit die Wanne größer wird
        const mid = w < 760;
        const pw = Math.round(mid ? clamp(w * 0.32, 206, 228) : clamp(w * 0.33, 228, 330));
        const tank: Rect = { x: 0, y: 0, w: w - pw - (mid ? 10 : 12), h };
        const ih = Math.round(Math.min(pw < 300 ? 182 : 204, h * 0.5));
        return { tank, info: { x: w - pw, y: 0, w: pw, h: ih }, chart: { x: w - pw, y: ih + 10, w: pw, h: h - ih - 10 }, side };
      }
      const th = Math.round(Math.min(w * 0.95, h * 0.52));
      const ih = 124;
      return { tank: { x: 0, y: 0, w, h: th }, info: { x: 0, y: th + 10, w, h: ih }, chart: { x: 0, y: th + 20 + ih, w, h: h - th - 20 - ih }, side };
    }
    let lay = computeLayout();

    function geoOf(r: Rect): Geo {
      const sm = r.w < 520;
      const k = Math.min(r.w / VIEW_W, r.h / VIEW_H);
      const extra = r.h - VIEW_H * k;
      const ay = r.y + r.h - AXIS_BELOW * k - extra * 0.3;
      return { r, sm, k, cx: r.x + r.w / 2, ay, xMin: -r.w / 2 / k, xMax: r.w / 2 / k, yMin: -(r.y + r.h - ay) / k, yMax: (ay - r.y) / k };
    }
    const X = (g0: Geo, x: number) => g0.cx + x * g0.k;
    const Y = (g0: Geo, y: number) => g0.ay - y * g0.k;

    /** Wie viele Perioden braucht die Front, bis sie die ganze Wanne erreicht hat? */
    function sweepPeriods(): number {
      const g0 = geoOf(lay.tank);
      const far = Math.hypot(Math.max(-g0.xMin, g0.xMax) + p.d / 2, Math.max(g0.yMax, -g0.yMin)) + 1;
      return Math.ceil(far / p.lam) + 1;
    }

    function startSweep(): void {
      const cur = viewWave(p.lam);
      sweepN = sweepPeriods();
      nBase = cur.n;
      RBase = 0;
      sweep.play(prefersReducedMotion() ? 0 : SWEEP_MS);
    }

    function viewWave(lam: number): { n: number; R: number } {
      const q = sweepN ? sweep.value : 0;
      return { n: nBase + sweepN * q, R: RBase + sweepN * lam * q };
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
      return subText(surface.g, str, x, y, { ...subStyle(size, color, weight, align), ...(halo ? { halo: color === '#ffffff' ? 'rgba(4,24,44,0.7)' : ctx.theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)' } : {}) });
    }

    /** Pille mit Text; gibt das belegte Rechteck zurück. */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
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

    const overlaps = (a: Rect, b: Rect, m = 3) => a.x < b.x + b.w + m && b.x < a.x + a.w + m && a.y < b.y + b.h + m && b.y < a.y + a.h + m;

    /* ---------- Wellenfeld (pixelweise, in reduzierter Auflösung) ---------- */
    const field = document.createElement('canvas');
    const fg = field.getContext('2d')!;
    let img: ImageData | null = null;

    interface Pal {
      trough: number[];
      mid: number[];
      crest: number[];
      node: number[];
      anti: number[];
    }
    const palette = (): Pal =>
      ctx.theme.dark
        ? { trough: [3, 18, 32], mid: [14, 58, 90], crest: [92, 172, 214], node: [2, 10, 20], anti: [112, 200, 238] }
        : { trough: [10, 62, 104], mid: [42, 124, 172], crest: [176, 228, 248], node: [8, 38, 68], anti: [196, 238, 252] };

    function renderField(g0: Geo, v: View): void {
      const r = g0.r;
      const fs = r.w < 520 ? 2 : 2.5;
      const fw = Math.max(8, Math.ceil(r.w / fs));
      const fh = Math.max(8, Math.ceil(r.h / fs));
      if (field.width !== fw || field.height !== fh || !img) {
        field.width = fw;
        field.height = fh;
        img = fg.createImageData(fw, fh);
      }
      const data = img.data;
      const pal = palette();
      const k = g0.k;
      const lam = v.lam;
      const x1s = -v.d / 2;
      const x2s = v.d / 2;
      const ph2 = v.ph / TAU;
      const mix = v.mix;
      const allIn = v.R > 1e3;
      const half = 0.5 * lam;
      // Licht von links oben (Weltkoordinaten: y nach oben)
      const lx = -0.6;
      const ly = 0.8;
      const [tr0, tg0, tb0] = pal.trough as [number, number, number];
      const [mr, mg, mb] = pal.mid as [number, number, number];
      const [cr, cg, cb] = pal.crest as [number, number, number];
      const [nr, ng, nb] = pal.node as [number, number, number];
      const [ar, ag, ab] = pal.anti as [number, number, number];
      const dark = ctx.theme.dark;
      const specK = dark ? 150 : 120;
      let o = 0;
      for (let j = 0; j < fh; j++) {
        const y = (g0.ay - (r.y + (j + 0.5) * fs)) / k;
        const y2 = y * y;
        for (let i = 0; i < fw; i++) {
          const x = (r.x + (i + 0.5) * fs - g0.cx) / k;
          const dx1 = x - x1s;
          const dx2 = x - x2s;
          const r1 = Math.sqrt(dx1 * dx1 + y2) + 1e-6;
          const r2 = Math.sqrt(dx2 * dx2 + y2) + 1e-6;
          let e1 = 1;
          let e2 = 1;
          if (!allIn) {
            let q = (v.R - r1) / half;
            q = q <= 0 ? 0 : q >= 1 ? 1 : q;
            e1 = q * q * (3 - 2 * q);
            q = (v.R - r2) / half;
            q = q <= 0 ? 0 : q >= 1 ? 1 : q;
            e2 = q * q * (3 - 2 * q);
          }
          let u1 = v.n - r1 / lam;
          u1 -= Math.floor(u1);
          let u2 = v.n - r2 / lam + ph2;
          u2 -= Math.floor(u2);
          const a1 = (u1 * LUT_N) | 0;
          const a2 = (u2 * LUT_N) | 0;
          const s1 = SIN[a1]!;
          const c1 = SIN[(a1 + LUT_N / 4) & (LUT_N - 1)]!;
          const s2 = SIN[a2]!;
          const c2 = SIN[(a2 + LUT_N / 4) & (LUT_N - 1)]!;
          let R = 0;
          let G = 0;
          let B = 0;
          if (mix < 0.999) {
            // Momentbild: Höhe → Helligkeit, Neigung → Licht und Glanz
            const h = (e1 * s1 + e2 * s2) * 0.5;
            const hv = h < 0 ? -Math.pow(-h, 0.8) : Math.pow(h, 0.8);
            if (hv < 0) {
              R = mr + (tr0 - mr) * -hv;
              G = mg + (tg0 - mg) * -hv;
              B = mb + (tb0 - mb) * -hv;
            } else {
              R = mr + (cr - mr) * hv;
              G = mg + (cg - mg) * hv;
              B = mb + (cb - mb) * hv;
            }
            // Gradient der Oberfläche (ohne Faktor 2π/λ): −Σ e·cos θ · (Einheitsvektor vom Erreger)
            const gx = -(e1 * c1 * dx1) / r1 - (e2 * c2 * dx2) / r2;
            const gy = -(e1 * c1 * y) / r1 - (e2 * c2 * y) / r2;
            const shade = -(gx * lx + gy * ly) * 0.5;
            R += shade * 38;
            G += shade * 42;
            B += shade * 40;
            if (shade > 0.45) {
              const sp = (shade - 0.45) / 0.55;
              const s = sp * sp * specK;
              R += s;
              G += s;
              B += s;
            }
          }
          if (mix > 0.001) {
            // Amplitudenbild: A/(2ŷ) aus der Zeigeraddition (mit Wellenfront-Hülle)
            const cosd = c1 * c2 + s1 * s2;
            const A2 = e1 * e1 + e2 * e2 + 2 * e1 * e2 * cosd;
            const a = Math.sqrt(A2 > 0 ? A2 : 0) * 0.5;
            const av = Math.pow(a, 1.15);
            const AR = nr + (ar - nr) * av;
            const AG = ng + (ag - ng) * av;
            const AB = nb + (ab - nb) * av;
            R = R + (AR - R) * mix;
            G = G + (AG - G) * mix;
            B = B + (AB - B) * mix;
          }
          data[o] = R;
          data[o + 1] = G;
          data[o + 2] = B;
          data[o + 3] = 255;
          o += 4;
        }
      }
      fg.putImageData(img, 0, 0);
      const g = surface.g;
      g.save();
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(field, 0, 0, fw, fh, r.x, r.y, fw * fs, fh * fs);
      g.restore();
    }

    /* ---------- Wellenwanne ---------- */
    function drawTankFrame(r: Rect, before: boolean): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      if (before) {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,30,50,0.28)';
        g.shadowBlur = 18;
        g.shadowOffsetY = 5;
        g.fillStyle = dark ? '#0b1622' : '#1d4f74';
        roundRect(g, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 14);
        g.fill();
        g.restore();
        return;
      }
      // Tiefe: dunkler Rand innen (Wannenwand), heller Schimmer oben links
      const vg = g.createRadialGradient(r.x + r.w * 0.45, r.y + r.h * 0.4, Math.min(r.w, r.h) * 0.3, r.x + r.w / 2, r.y + r.h / 2, Math.hypot(r.w, r.h) * 0.62);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, dark ? 'rgba(0,6,14,0.5)' : 'rgba(4,30,56,0.32)');
      g.fillStyle = vg;
      g.fillRect(r.x, r.y, r.w, r.h);
      const gl = g.createLinearGradient(r.x, r.y, r.x + r.w * 0.6, r.y + r.h * 0.6);
      gl.addColorStop(0, dark ? 'rgba(160,210,255,0.10)' : 'rgba(255,255,255,0.16)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, r.h);
      // innerer Schatten der Wand
      g.save();
      roundRect(g, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 14);
      g.clip();
      g.shadowColor = dark ? 'rgba(0,0,0,0.85)' : 'rgba(5,30,55,0.55)';
      g.shadowBlur = 16;
      g.strokeStyle = 'rgba(0,0,0,1)';
      g.lineWidth = 10;
      roundRect(g, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 18);
      g.stroke();
      g.restore();
      // Rahmen
      const rim = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      rim.addColorStop(0, dark ? '#4b5b6e' : '#c9d6e2');
      rim.addColorStop(1, dark ? '#273342' : '#8fa4b8');
      g.strokeStyle = rim;
      g.lineWidth = 4;
      roundRect(g, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 14);
      g.stroke();
      g.strokeStyle = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)';
      g.lineWidth = 1;
      roundRect(g, r.x + 4.5, r.y + 4.5, r.w - 9, r.h - 9, 12);
      g.stroke();
    }

    /** Hyperbelast als Pixel-Polylinie (beide Hälften, von der Achse aus wachsend). */
    function linePx(g0: Geo, v: View, ln: Line, grow: number): [number, number][][] {
      const out: [number, number][][] = [];
      const xEdge = Math.max(-g0.xMin, g0.xMax) + 1;
      if (ln.axis || Math.abs(ln.ds) >= v.d - 1e-6) {
        const sgn = ln.ds >= 0 ? 1 : -1;
        const x0 = (sgn * v.d) / 2;
        const x1 = x0 + sgn * (xEdge - Math.abs(x0)) * grow;
        out.push([
          [X(g0, x0), Y(g0, 0)],
          [X(g0, x1), Y(g0, 0)],
        ]);
        return out;
      }
      for (const yEnd of [g0.yMax + 1, g0.yMin - 1]) {
        const pts = hyperbola(v.d, ln.ds, 0, yEnd * grow, 56);
        out.push(pts.map(([x, y]) => [X(g0, x), Y(g0, y)]));
      }
      return out;
    }

    function strokePolys(polys: [number, number][][], color: string, width: number, dash: number[], halo: string): void {
      const g = surface.g;
      g.save();
      g.lineJoin = 'round';
      g.lineCap = 'round';
      for (const [w, c] of [
        [width + 3.5, halo],
        [width, color],
      ] as const) {
        g.strokeStyle = c;
        g.lineWidth = w;
        g.setLineDash(dash);
        for (const pl of polys) {
          if (pl.length < 2) continue;
          g.beginPath();
          pl.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
        }
      }
      g.setLineDash([]);
      g.restore();
    }

    /** Wo verlässt die Linie den Beschriftungsbereich? Letzter Punkt im Innenrechteck. */
    function labelAnchor(polys: [number, number][][], box: Rect): [number, number] | null {
      let best: [number, number] | null = null;
      const pl = polys[0];
      if (!pl) return null;
      for (const [x, y] of pl) {
        if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) best = [x, y];
        else if (best) break;
      }
      return best;
    }

    function drawLines(g0: Geo, v: View): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = g0.sm;
      const wantMax = p.lines === 'max' || p.lines === 'both';
      const wantMin = p.lines === 'min' || p.lines === 'both';
      const aMax = ease2('aMax', wantMax && linesReady ? 1 : 0, 5);
      const aMin = ease2('aMin', wantMin && linesReady ? 1 : 0, 5);
      const vph = ((v.ph % TAU) + TAU) % TAU;
      const lab: { ln: Line; polys: [number, number][][]; max: boolean; a: number }[] = [];
      const halo = theme.dark ? 'rgba(2,10,20,0.55)' : 'rgba(4,30,56,0.38)';
      if (aMin > 0.01) {
        g.save();
        g.globalAlpha = aMin;
        for (const ln of minLines(v.d, v.lam, vph)) {
          const polys = linePx(g0, v, ln, ease.outCubic(aMin));
          strokePolys(polys, 'rgba(240,248,255,0.92)', sm ? 1.8 : 2.1, [7, 6], halo);
          lab.push({ ln, polys, max: false, a: aMin });
        }
        g.restore();
      }
      if (aMax > 0.01) {
        g.save();
        g.globalAlpha = aMax;
        for (const ln of maxLines(v.d, v.lam, vph)) {
          const polys = linePx(g0, v, ln, ease.outCubic(aMax));
          strokePolys(polys, orange(), sm ? 2.4 : 2.8, [], halo);
          lab.push({ ln, polys, max: true, a: aMax });
        }
        g.restore();
      }
      lineLabels = p.lines === 'both' ? lab.filter((it) => it.max) : lab;
    }

    type LineLabel = { ln: Line; polys: [number, number][][]; max: boolean; a: number };
    let lineLabels: LineLabel[] = [];
    let farLabel: { txt: string; x: number; y: number; a: number } | null = null;

    /** Beschriftung der Ordnung k am äußeren Ende (kleine |k| zuerst); verdeckt nichts, was schon steht. */
    function drawLineLabels(g0: Geo, used: Rect[]): void {
      const g = surface.g;
      const r = g0.r;
      const sm = g0.sm;
      const fsz = sm ? 11 : 12;
      if (farLabel) {
        const w = richWidth(farLabel.txt, fsz) + 16;
        const rect: Rect = { x: clamp(farLabel.x, r.x + 8, r.x + r.w - 8 - w), y: clamp(farLabel.y - 11, r.y + 44, r.y + r.h - 40), w, h: fsz + 11 };
        g.save();
        g.globalAlpha = farLabel.a;
        pill(rect.x, rect.y, farLabel.txt, ctx.theme.text, 'left', fsz);
        g.restore();
        used.push(rect);
      }
      const box: Rect = { x: r.x + 14, y: r.y + (sm ? 42 : 48), w: r.w - 28, h: r.h - (sm ? 42 : 48) - 14 };
      const lab = [...lineLabels].sort((a, b) => Number(b.max) - Number(a.max) || Math.abs(a.ln.ds) - Math.abs(b.ln.ds));
      // Viele Linien (großer Abstand, kleine Wellenlänge): nur jede zweite Ordnung beschriften,
      // sonst stehen die Schilder dicht an dicht
      const many = (max: boolean) => lab.filter((it) => it.max === max).length > (sm ? 24 : 18);
      const thin = { max: many(true), min: many(false) };
      for (const it of lab) {
        const k = it.ln.k;
        if ((it.max ? thin.max : thin.min) && Math.abs(k) % 2 === 1) continue;
        const at = labelAnchor(it.polys, box);
        if (!at) continue;
        const kTxt = k < 0 ? `−${-k}` : String(k);
        const txt = sm ? kTxt : tr('kLab', { k: kTxt });
        const w = richWidth(txt, fsz) + 16;
        const h = fsz + 11;
        const place = (q: [number, number]): Rect => ({ x: clamp(q[0] - w / 2, r.x + 8, r.x + r.w - 8 - w), y: clamp(q[1] - h / 2, box.y - h / 2, r.y + r.h - 8 - h), w, h });
        let rect = place(at);
        if (used.some((u) => overlaps(u, rect))) {
          // weiter innen auf der Linie versuchen (bis etwa zur halben Höhe)
          const pl = it.polys[0]!;
          let found: Rect | null = null;
          const i0 = pl.findIndex((q) => q[0] === at[0] && q[1] === at[1]);
          for (let i = i0 - 1; i >= 0; i--) {
            const q = pl[i]!;
            if (Math.abs(q[1] - at[1]) > r.h * 0.4 || Math.abs(q[0] - at[0]) > r.w * 0.4) break;
            const c = place(q);
            if (!used.some((u) => overlaps(u, c))) {
              found = c;
              break;
            }
          }
          if (!found) continue;
          rect = found;
        }
        const x0 = rect.x;
        const y0 = rect.y;
        used.push(rect);
        g.save();
        g.globalAlpha = it.a;
        if (it.max) pill(x0, y0, txt, orange(), 'left', fsz, orange());
        else pill(x0, y0, txt, teal(), 'left', fsz);
        g.restore();
      }
    }

    function drawFarField(g0: Geo, v: View): void {
      farLabel = null;
      const a = ease2('aFar', p.far && linesReady ? 1 : 0, 5);
      if (a < 0.01) return;
      const g = surface.g;
      const theme = ctx.theme;
      const sm = g0.sm;
      const mx = X(g0, 0);
      const my = Y(g0, 0);
      const len = Math.hypot(g0.r.w, g0.r.h) * ease.outCubic(a);
      g.save();
      g.globalAlpha = a;
      g.setLineDash([2, 6]);
      g.lineCap = 'round';
      const list = maxLines(v.d, v.lam, ((v.ph % TAU) + TAU) % TAU);
      for (const ln of list) {
        const al = farFieldAngle(ln.ds, v.d);
        if (al === null) continue;
        const ex = mx + Math.sin(al) * len;
        const ey = my - Math.cos(al) * len;
        g.strokeStyle = theme.dark ? 'rgba(255,236,200,0.9)' : 'rgba(255,248,230,0.95)';
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(mx, my);
        g.lineTo(ex, ey);
        g.stroke();
      }
      g.setLineDash([]);
      // Winkel der ersten Ordnung rechts von der Mitte
      const first = list.filter((l) => l.ds > 1e-9).sort((p1, p2) => p1.ds - p2.ds)[0];
      const al = first ? farFieldAngle(first.ds, v.d) : null;
      if (first && al !== null && al > 0.03) {
        const ra = sm ? 44 : 62;
        g.strokeStyle = withAlpha(theme.dark ? '#ffffff' : '#ffffff', 0.85);
        g.lineWidth = 1.4;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(mx, my);
        g.lineTo(mx, my - ra * 1.5);
        g.stroke();
        g.setLineDash([]);
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(mx, my, ra, -Math.PI / 2, -Math.PI / 2 + al);
        g.stroke();
        const mid = -Math.PI / 2 + al / 2;
        const txt = !ctx.isHidden('far') ? tr('alpha', { k: String(first.k), a: fx((al * 180) / Math.PI, 1) }) : tr('alphaS', { k: String(first.k) });
        farLabel = { txt, x: mx + Math.cos(mid) * (ra + 10), y: my + Math.sin(mid) * (ra + 10) - 20, a };
      }
      g.restore();
    }

    function drawSource(x: number, y: number, color: string, label: string, side: -1 | 1, phase: number, hot: boolean, sm: boolean, alpha: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const rad = sm ? 7 : 8.5;
      g.save();
      g.globalAlpha = alpha;
      if (hot) {
        g.fillStyle = withAlpha(color, 0.28);
        g.beginPath();
        g.arc(x, y, rad + 9, 0, TAU);
        g.fill();
      }
      // kleiner Puls im Takt der Schwingung
      const pulse = prefersReducedMotion() ? 0 : 0.5 + 0.5 * Math.sin(TAU * phase);
      g.strokeStyle = withAlpha(color, 0.35 + 0.35 * pulse);
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, y, rad + 3 + 2.5 * pulse, 0, TAU);
      g.stroke();
      // Tauchstift von oben: Metallkugel mit Schatten
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.7)' : 'rgba(3,25,45,0.5)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 2;
      g.shadowOffsetY = 3;
      const ball = g.createRadialGradient(x - rad * 0.35, y - rad * 0.4, 1, x, y, rad);
      ball.addColorStop(0, '#ffffff');
      ball.addColorStop(0.45, mixColor(color, '#ffffff', 0.35));
      ball.addColorStop(1, mixColor(color, '#000000', 0.35));
      g.fillStyle = ball;
      g.beginPath();
      g.arc(x, y, rad, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.9)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, rad, 0, TAU);
      g.stroke();
      const fsz = sm ? 12 : 13;
      richText(label, x + side * (rad + 6), y - rad - 6, fsz, '#ffffff', side < 0 ? 'right' : 'left', false, 800);
      g.restore();
    }

    function drawScene(g0: Geo, v: View, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = g0.r;
      const sm = g0.sm;
      drawTankFrame(r, true);
      g.save();
      roundRect(g, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 14);
      g.clip();
      renderField(g0, v);
      drawTankFrame(r, false);
      const used: Rect[] = [];
      // Kopfzeile
      const fsz = sm ? 11 : 12;
      const f = frequency(v.lam);
      const kk = (f * VIS_PERIOD) / (p.slow ? 0.25 : 1);
      const hdr1 = tr(sm ? 'fcS' : 'fc', { f: n(f, 1), c: n(WAVE_SPEED, 0) });
      const hdr2 = tr(sm ? 'slowPillS' : 'slowPill', { k: kk >= 10 ? n(kk, 0) : n(kk, 1) });
      const hw1 = richWidth(hdr1, fsz) + 16;
      const hw2 = richWidth(hdr2, fsz) + 16;
      used.push({ x: r.x + 12, y: r.y + 12, w: hw1, h: fsz + 11 }, { x: r.x + r.w - 12 - hw2, y: r.y + 12, w: hw2, h: fsz + 11 });
      // Fußzeile freihalten (λ-Maßstab links, Legende rechts)
      used.push({ x: r.x + 8, y: r.y + r.h - 34, w: Math.min(r.w * 0.4, v.lam * g0.k + 110), h: 30 });
      if (p.lines !== 'none' && (!sm || p.lines !== 'both')) used.push({ x: r.x + r.w - (sm ? 150 : 250), y: r.y + r.h - 34, w: sm ? 142 : 242, h: 30 });

      drawLines(g0, v);
      drawFarField(g0, v);

      // Erreger, Abstand d
      const e1: [number, number] = [X(g0, -v.d / 2), Y(g0, 0)];
      const e2: [number, number] = [X(g0, v.d / 2), Y(g0, 0)];
      drawnE1 = e1;
      drawnE2 = e2;
      const by = e1[1] + (sm ? 22 : 28);
      const dl = e2[0] - e1[0];
      g.save();
      g.globalAlpha = ik;
      g.strokeStyle = 'rgba(255,255,255,0.9)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(e1[0], by - 6);
      g.lineTo(e1[0], by + 6);
      g.moveTo(e2[0], by - 6);
      g.lineTo(e2[0], by + 6);
      g.stroke();
      if (dl > 16) {
        arrowPx((e1[0] + e2[0]) / 2, by, e1[0] + 1, by, '#ffffff', 1.5, 6);
        arrowPx((e1[0] + e2[0]) / 2, by, e2[0] - 1, by, '#ffffff', 1.5, 6);
      }
      // als Pille, damit Linien durch die Mitte die Beschriftung nicht durchkreuzen
      const dTxt = tr(dl > 70 || !sm ? 'dBar' : 'dBarS', { d: n(v.d, 1) });
      used.push(pill((e1[0] + e2[0]) / 2, by + 4, dTxt, theme.text, 'center', fsz));
      g.restore();

      // Wegstrecken und Messpunkt P
      const P: [number, number] = [X(g0, v.px), Y(g0, v.py)];
      drawnP = P;
      const pth = paths(v.px, v.py, v.d);
      const pathA = ease2('aPath', p.path ? 1 : 0, 6);
      if (pathA > 0.01) {
        g.save();
        g.globalAlpha = pathA * ik;
        for (const [src, col, idx] of [
          [e1, blue(), 1],
          [e2, red(), 2],
        ] as const) {
          const qx = src[0] + (P[0] - src[0]) * ease.outCubic(pathA);
          const qy = src[1] + (P[1] - src[1]) * ease.outCubic(pathA);
          g.strokeStyle = 'rgba(255,255,255,0.9)';
          g.lineWidth = 5;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(src[0], src[1]);
          g.lineTo(qx, qy);
          g.stroke();
          g.strokeStyle = col;
          g.lineWidth = 2.6;
          g.beginPath();
          g.moveTo(src[0], src[1]);
          g.lineTo(qx, qy);
          g.stroke();
          // Beschriftung neben der Strecke, nach außen versetzt
          const mx = src[0] + (P[0] - src[0]) * 0.5;
          const my = src[1] + (P[1] - src[1]) * 0.5;
          const len = Math.hypot(P[0] - src[0], P[1] - src[1]);
          if (len > 40) {
            let nx = -(P[1] - src[1]) / len;
            let ny = (P[0] - src[0]) / len;
            const out = idx === 1 ? -1 : 1;
            if (nx * out < 0) {
              nx = -nx;
              ny = -ny;
            }
            const s = idx === 1 ? pth.s1 : pth.s2;
            const txt = !ctx.isHidden('ds') && !sm ? `s_{${idx}} = ${fx(s, 2)} cm` : `s_{${idx}}`;
            const w = richWidth(txt, fsz) + 16;
            const cxp = clamp(mx + nx * (w / 2 + 6), r.x + 8 + w / 2, r.x + r.w - 8 - w / 2);
            const cyp = clamp(my + ny * 16, r.y + 44, r.y + r.h - 30);
            const rect = pill(cxp, cyp - (fsz + 11) / 2, txt, col, 'center', fsz);
            used.push(rect);
          }
        }
        g.restore();
      }

      drawSource(e1[0], e1[1], blue(), 'E_1', -1, v.n, hover === 'e1' || grab === 'e1', sm, ik);
      drawSource(e2[0], e2[1], red(), 'E_2', 1, v.n + v.ph / TAU, hover === 'e2' || grab === 'e2', sm, ik);

      // Korken als Messpunkt: hebt und senkt sich mit der Überlagerung
      const y1 = waveAt(v, pth.s1, 0, v.n);
      const y2 = waveAt(v, pth.s2, v.ph, v.n);
      const ys = (y1 + y2) / 2;
      const pr = (sm ? 8 : 9.5) * (1 + 0.14 * ys);
      g.save();
      g.globalAlpha = ik;
      if (hover === 'p' || grab === 'p') {
        g.fillStyle = withAlpha(green(), 0.3);
        g.beginPath();
        g.arc(P[0], P[1], pr + 10, 0, TAU);
        g.fill();
      }
      g.strokeStyle = withAlpha(green(), 0.9);
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(P[0], P[1], pr + 4.5, 0, TAU);
      g.stroke();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.7)' : 'rgba(3,25,45,0.5)';
      g.shadowBlur = 6 + 4 * (1 + ys);
      g.shadowOffsetX = 2 + 2 * (1 + ys);
      g.shadowOffsetY = 3 + 2 * (1 + ys);
      const cork = g.createRadialGradient(P[0] - pr * 0.35, P[1] - pr * 0.4, 1, P[0], P[1], pr);
      cork.addColorStop(0, '#f6e2c0');
      cork.addColorStop(0.6, '#d7a96e');
      cork.addColorStop(1, '#a87741');
      g.fillStyle = cork;
      g.beginPath();
      g.arc(P[0], P[1], pr, 0, TAU);
      g.fill();
      g.restore();
      const pLab = 'P';
      const right = P[0] + pr + 34 < r.x + r.w;
      richText(pLab, right ? P[0] + pr + 8 : P[0] - pr - 8, P[1] - pr - 4, sm ? 13 : 14, '#ffffff', right ? 'left' : 'right', false, 800);
      // Gangunterschied direkt an P
      if (!ctx.isHidden('ds')) {
        const q = pth.ds / v.lam;
        const txt = `Δs = ${fx(q, 2)} λ`;
        const w = richWidth(txt, fsz) + 16;
        const h = fsz + 11;
        let x0 = right ? P[0] + pr + 10 : P[0] - pr - 10 - w;
        x0 = clamp(x0, r.x + 8, r.x + r.w - 8 - w);
        const y0 = clamp(P[1] + 4, r.y + 44, r.y + r.h - 8 - h);
        used.push(pill(x0, y0, txt, theme.text, 'left', fsz));
      }
      g.restore();

      // Beschriftungen der Linien zuletzt (nichts verdecken) und Kopfzeile
      used.push({ x: e1[0] - 30, y: e1[1] - 26, w: e2[0] - e1[0] + 60, h: 56 });
      used.push({ x: P[0] - 24, y: P[1] - 30, w: 56, h: 52 });
      drawLineLabels(g0, used);
      pill(r.x + 12, r.y + 12, hdr1, theme.text, 'left', fsz);
      pill(r.x + r.w - 12, r.y + 12, hdr2, ctx.theme.series[4]!, 'right', fsz);

      // Fußzeile: λ-Maßstab und Legende
      g.save();
      g.globalAlpha = ik;
      const bw = v.lam * g0.k;
      const bx = r.x + 16;
      const byy = r.y + r.h - 16;
      g.strokeStyle = '#ffffff';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bx, byy - 5);
      g.lineTo(bx, byy);
      g.lineTo(bx + bw, byy);
      g.lineTo(bx + bw, byy - 5);
      g.stroke();
      richText(tr('lamBar', { l: n(v.lam, 1) }), bx + bw + 8, byy - 3, fsz, '#ffffff', 'left', true, 750);
      if (!sm || p.lines !== 'both') {
        let lx = r.x + r.w - 16;
        const ly = byy - 3;
        const item = (txt: string, max: boolean, a: number) => {
          if (a < 0.02) return;
          g.globalAlpha = ik * a;
          const tw = richText(txt, lx, ly, fsz, '#ffffff', 'right', true, 650);
          const x1 = lx - tw - 8;
          g.strokeStyle = max ? orange() : 'rgba(240,248,255,0.95)';
          g.lineWidth = max ? 2.8 : 2.1;
          g.setLineDash(max ? [] : [5, 4]);
          g.beginPath();
          g.moveTo(x1 - 22, ly);
          g.lineTo(x1, ly);
          g.stroke();
          g.setLineDash([]);
          lx = x1 - 36;
        };
        item(ctx.t('legMin'), false, soft.get('aMin') ?? 0);
        item(ctx.t('legMax'), true, soft.get('aMax') ?? 0);
      }
      g.restore();
      g.restore();
    }

    /** Auslenkung (in ŷ) einer Welle am Abstand s, Phase φ₀, zur Periodenzahl nn (mit Wellenfront). */
    function waveAt(v: View, s: number, phi0: number, nn: number): number {
      const R = v.R - (v.n - nn) * v.lam;
      return Math.sin(TAU * (nn - s / v.lam) + phi0) * frontEnvelope(R - s, v.lam);
    }

    /* ---------- Karte „Messpunkt P“ ---------- */
    function drawInfo(R: Rect, v: View, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha = ik;
      g.translate((1 - ik) * 16, 0);
      card(R);
      const sm = R.w < 300 || R.h < 160;
      const pad = sm ? 12 : 16;
      const fs = sm ? 12 : 13;
      const pth = paths(v.px, v.py, v.d);
      const q = pth.ds / v.lam;
      const A = Math.abs(Math.cos(Math.PI * q + v.ph / 2)) * 2;
      const kind = classify(A / 2);
      const vColor = kind === 'max' ? orange() : kind === 'min' ? teal() : theme.text;
      // Titel, rechts daneben die Einordnung
      const ty = R.y + pad + 8;
      g.fillStyle = green();
      g.beginPath();
      g.arc(R.x + pad + 5, ty, 5, 0, TAU);
      g.fill();
      const tw = richText(ctx.t('cardTitle'), R.x + pad + 16, ty, fs + 1, theme.text, 'left', false, 750);
      const showA = !ctx.isHidden('amp');
      const showDs = !ctx.isHidden('ds');
      if (showA) {
        const verdict = kind === 'max' ? ctx.t('vMax') : kind === 'min' ? ctx.t('vMin') : A > 1 ? ctx.t('vUp') : ctx.t('vDown');
        const vs = sm ? 11 : 12;
        const vw = richWidth(verdict, vs) + 16;
        if (R.x + pad + 16 + tw + 10 + vw < R.x + R.w - pad) pill(R.x + R.w - pad, ty - (vs + 11) / 2, verdict, vColor, 'right', vs, kind === 'partial' ? undefined : vColor);
      }
      // Zeilen links, Zeiger rechts daneben, Balken darunter (falls Platz)
      const row = sm ? 19 : 23;
      const big = sm ? 20 : 26;
      const top = ty + (sm ? 21 : 27);
      const aRow = top + 3 * row + (sm ? 2 : 6);
      const barY = aRow + big / 2 + (sm ? 16 : 20);
      const showBar = barY + (R.w >= 240 ? 22 : 8) <= R.y + R.h - 4;
      const phTop = top - row / 2;
      const phBot = aRow + big / 2;
      const phR = Math.max(24, Math.min((phBot - phTop) / 2 + 6, R.w * 0.2, 60));
      const pcx = R.x + R.w - pad - phR - 2;
      const pcy = (phTop + phBot) / 2;
      drawPhasor(pcx, pcy, phR, v, pth.s1, pth.s2);
      // Werte links
      const lx = R.x + pad;
      const maxW = pcx - phR - 8 - lx;
      let ly = top;
      const rowTxt = (label: string, value: string, color: string) => {
        const w = richText(label, lx, ly, fs, color, 'left', false, 750);
        richText(value, lx + w + 6, ly, fs, theme.text, 'left', false, 600);
        ly += row;
      };
      rowTxt('s_1 =', showDs ? `${fx(pth.s1, 2)} cm` : ctx.t('hidden'), blue());
      rowTxt('s_2 =', showDs ? `${fx(pth.s2, 2)} cm` : ctx.t('hidden'), red());
      let dsTxt = showDs ? `${fx(pth.ds, 2)} cm = ${fx(q, 2)} λ` : ctx.t('hidden');
      if (richWidth(`Δs = ${dsTxt}`, fs, 650) > maxW) dsTxt = showDs ? `${fx(q, 2)} λ` : dsTxt;
      rowTxt('Δs =', dsTxt, theme.text);
      // Amplitude groß
      const ay = aRow;
      g.font = `800 ${big}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = showA ? vColor : theme.muted;
      g.fillText(showA ? `A = ${fx(A, 2)} ŷ` : 'A = ?', lx, ay);
      // Balken 0 … 2ŷ über die ganze Breite
      if (showBar) {
        const gy = barY;
        const gx0 = lx + 4;
        const gx1 = R.x + R.w - pad - 4;
        const bar = g.createLinearGradient(gx0, 0, gx1, 0);
        bar.addColorStop(0, withAlpha(teal(), 0.85));
        bar.addColorStop(0.5, withAlpha(theme.muted, 0.4));
        bar.addColorStop(1, withAlpha(orange(), 0.9));
        g.fillStyle = bar;
        roundRect(g, gx0, gy - 3, gx1 - gx0, 6, 3);
        g.fill();
        const xm = (gx0 + gx1) / 2;
        g.strokeStyle = theme.text;
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(xm, gy - 7);
        g.lineTo(xm, gy + 7);
        g.stroke();
        if (R.w >= 240) {
          richText('0', gx0, gy + 16, 11, theme.muted, 'left', false, 650);
          richText(`ŷ (${ctx.t('single')})`, xm, gy + 16, 11, theme.muted, 'center', false, 650);
          richText('2ŷ', gx1, gy + 16, 11, theme.muted, 'right', false, 650);
        }
        if (showA) {
          const xa = gx0 + (A / 2) * (gx1 - gx0);
          g.save();
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
          g.shadowBlur = 5;
          g.shadowOffsetY = 1;
          g.fillStyle = green();
          g.beginPath();
          g.arc(xa, gy, 7, 0, TAU);
          g.fill();
          g.restore();
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(xa, gy, 7, 0, TAU);
          g.stroke();
        }
      }
      g.restore();
    }

    /** Zeigerdiagramm: Zeiger von y₁ (blau) und y₂ (rot) hintereinander, Summe (grün). */
    function drawPhasor(cx: number, cy: number, rad: number, v: View, s1: number, s2: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const u = rad / 2.15;
      const th1 = TAU * (v.n - s1 / v.lam);
      const th2 = TAU * (v.n - s2 / v.lam) + v.ph;
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
      const ax = cx + u * Math.cos(th1);
      const ay = cy - u * Math.sin(th1);
      const bx = ax + u * Math.cos(th2);
      const by = ay - u * Math.sin(th2);
      // Projektion der Summe auf die senkrechte Achse = momentane Auslenkung
      g.strokeStyle = withAlpha(green(), 0.6);
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(cx, by);
      g.stroke();
      g.setLineDash([]);
      arrowPx(cx, cy, ax, ay, blue(), 2.4, 7);
      arrowPx(ax, ay, bx, by, red(), 2.4, 7);
      arrowPx(cx, cy, bx, by, green(), 3, 8);
      g.fillStyle = green();
      g.beginPath();
      g.arc(cx, by, 3.5, 0, TAU);
      g.fill();
    }

    /* ---------- Diagramm y(t) in P ---------- */
    function drawChart(R: Rect, v: View, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha = ik;
      g.translate((1 - ik) * 16, 0);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const fs = sm ? 11 : 12;
      const padL = sm ? 34 : 40;
      const padR = sm ? 12 : 16;
      const padT = sm ? 32 : 38;
      const padB = sm ? 22 : 26;
      const A: Rect = { x: R.x + padL, y: R.y + padT, w: R.w - padL - padR, h: R.h - padT - padB };
      // Titel und Legende
      const ty = R.y + (sm ? 16 : 19);
      const tw = richText(ctx.t(R.w < 260 ? 'chartTitleS' : 'chartTitle'), R.x + 14, ty, fs + 1, theme.text, 'left', false, 750);
      let lx = R.x + R.w - 14;
      for (const [lab, col] of [
        ['y', green()],
        ['y_2', red()],
        ['y_1', blue()],
      ] as const) {
        const w = richText(lab, lx, ty, fs, col, 'right', false, 750);
        g.strokeStyle = col;
        g.lineWidth = lab === 'y' ? 3 : 2;
        g.beginPath();
        g.moveTo(lx - w - 18, ty);
        g.lineTo(lx - w - 5, ty);
        g.stroke();
        lx -= w + 28;
        if (lx < R.x + 14 + tw + 10) break;
      }
      if (A.w < 40 || A.h < 24) {
        g.restore();
        return;
      }
      const yR = 2.25;
      const Yp = (y: number) => A.y + A.h / 2 - (y / yR) * (A.h / 2);
      const span = 2;
      const Xp = (dn: number) => A.x + A.w + (dn / span) * A.w;
      // Gitter
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
      for (const yy of [-2, -1, 1, 2]) {
        const lab = `${yy < 0 ? '−' : ''}${Math.abs(yy) === 1 ? '' : '2'}ŷ`;
        g.fillText(lab, A.x - 6, Yp(yy));
      }
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillText('−2T', Xp(-2) + 10, A.y + A.h + 5);
      g.fillText('−T', Xp(-1), A.y + A.h + 5);
      g.textAlign = 'right';
      g.fillText(ctx.t('now'), A.x + A.w, A.y + A.h + 5);
      // Kurven
      const pth = paths(v.px, v.py, v.d);
      const N = Math.max(60, Math.round(A.w / 2));
      const curve = (fn: (nn: number) => number, color: string, width: number, alpha: number) => {
        g.save();
        g.globalAlpha *= alpha;
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.beginPath();
        for (let i = 0; i <= N; i++) {
          const dn = -span + (span * i) / N;
          const y = fn(v.n + dn);
          const px = Xp(dn);
          const py = Yp(y);
          if (i) g.lineTo(px, py);
          else g.moveTo(px, py);
        }
        g.stroke();
        g.restore();
      };
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 4, A.w + 6, A.h + 8);
      g.clip();
      const f1 = (nn: number) => waveAt(v, pth.s1, 0, nn);
      const f2 = (nn: number) => waveAt(v, pth.s2, v.ph, nn);
      curve(f1, blue(), sm ? 1.6 : 1.9, 0.85);
      curve(f2, red(), sm ? 1.6 : 1.9, 0.85);
      curve((nn) => f1(nn) + f2(nn), green(), sm ? 2.6 : 3.2, 1);
      g.restore();
      // aktuelle Werte als Punkte am rechten Rand
      for (const [y, col, rr] of [
        [f1(v.n), blue(), 3.5],
        [f2(v.n), red(), 3.5],
        [f1(v.n) + f2(v.n), green(), 5],
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

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const w = viewWave(p.lam);
      const v: View = { d: p.d, lam: p.lam, ph: dphi(), px: p.px, py: p.py, n: w.n, R: w.R, mix: 0 };
      const pth = paths(p.px, p.py, p.d);
      const y1 = waveAt(v, pth.s1, 0, w.n);
      const y2 = waveAt(v, pth.s2, dphi(), w.n);
      ctx.readout('now', tr('nowText', { t: fx(simT, 2), y1: fx(y1, 2), y2: fx(y2, 2), y: fx(y1 + y2, 2) }));
    }

    function updateReadouts(): void {
      const pth = paths(p.px, p.py, p.d);
      const q = pth.ds / p.lam;
      ctx.readout('ds', { html: tr('dsText', { s1: fx(pth.s1, 2), s2: fx(pth.s2, 2), ds: fx(pth.ds, 2), q: fx(q, 2) }) });
      const delta = TAU * q + dphi();
      const A = 2 * Math.abs(Math.cos(delta / 2));
      const kind = classify(A / 2);
      const verdict = ctx.t(kind === 'max' ? 'verdictMax' : kind === 'min' ? 'verdictMin' : A > 1 ? 'verdictUp' : 'verdictDown');
      let deg = (((delta * 180) / Math.PI) % 360 + 360) % 360;
      if (deg > 359.95) deg = 0;
      ctx.readout('amp', { html: tr('ampText', { deg: fx(deg, 1), a: fx(A, 2), verdict }) });
      const mx = maxLines(p.d, p.lam, dphi());
      const mn = minLines(p.d, p.lam, dphi());
      const nAx = mx.filter((l) => l.axis).length;
      const axis = nAx ? tr('axisNote', { n: String(nAx) }) : '';
      const ks = mx.map((l) => l.k);
      const kFmt = (k: number) => (k < 0 ? `−${-k}` : String(k));
      const base = { l: n(p.lam, 1), f: n(frequency(p.lam), 1), d: n(p.d, 1), q: n(p.d / p.lam, 2), nmax: String(mx.length), nmin: String(mn.length), axis };
      let html =
        inPhase()
          ? tr('linesText', { ...base, kmin: kFmt(Math.min(...ks)), kmax: kFmt(Math.max(...ks)) })
          : tr('linesTextPh', { ...base, s: n(p.ph / 360, 3) });
      if (!mn.length) html += ctx.t(inPhase() ? 'noneMin' : 'noneMinPh');
      ctx.readout('lines', { html });
      // gleichphasig symmetrisch: nur k > 0; sonst alle Linien mit Vorzeichen (Muster verschoben)
      const pos = inPhase() ? mx.filter((l) => l.ds > 1e-9).sort((a, b) => a.ds - b.ds) : [...mx].sort((a, b) => a.ds - b.ds);
      const list = pos
        .slice(0, inPhase() ? 4 : 7)
        .map((l) => {
          const a = farFieldAngle(l.ds, p.d);
          return a === null ? '' : tr('farItem', { k: kFmt(l.k), a: fx((a * 180) / Math.PI, 1) });
        })
        .filter(Boolean)
        .join(' · ');
      const simple = inPhase() ? tr('farSimple', { q: n(p.lam / p.d, 3) }) : ctx.t('farPhNote');
      ctx.readout('far', { html: pos.length ? tr('farText', { simple, list }) : ctx.t(inPhase() ? 'farNone' : 'farNoneAll') });
      ctx.setAction('go', { enabled: !ctx.locked });
      updateNow();
    }

    /* ---------- Ziehen der Erreger und des Messpunkts ---------- */
    function hitTest(px: number, py: number): Grab | null {
      if (ctx.locked) return null;
      const rad = surface.width < 640 ? 24 : 20;
      const dP = Math.hypot(px - drawnP[0], py - drawnP[1]);
      const d1 = Math.hypot(px - drawnE1[0], py - drawnE1[1]);
      const d2 = Math.hypot(px - drawnE2[0], py - drawnE2[1]);
      const best = Math.min(dP, d1, d2);
      if (best > rad) return null;
      return best === dP ? 'p' : best === d2 ? 'e2' : 'e1';
    }

    function dragTo(px: number, py: number): void {
      const g0 = geoOf(lay.tank);
      const x = (px - g0.cx) / g0.k;
      const y = (g0.ay - py) / g0.k;
      if (grab === 'p') ctx.set({ px: clamp(x, -10.5, 10.5), py: clamp(y, -3, 17) });
      else if (grab === 'e2') ctx.set({ d: clamp(2 * x, 0.5, 14) });
      else if (grab === 'e1') ctx.set({ d: clamp(-2 * x, 0.5, 14) });
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitTest(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const h = hitTest(q.px, q.py);
        if (!h) return false;
        grab = h;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (grab) dragTo(q.px, q.py);
      },
      pointerUp: () => {
        grab = null;
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitTest(q.px, q.py) : null;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'init') {
          lay = computeLayout();
          intro.play();
          linesReady = false;
          startSweep();
        }
        updateReadouts();
        ctx.requestRender();
        void changed;
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          startSweep();
          simT = 0;
          ctx.clock.play();
          updateReadouts();
        }
      },

      tick(dt) {
        const dn = (dt * (p.slow ? 0.25 : 1)) / VIS_PERIOD;
        nBase += dn;
        RBase = Math.min(RBase + dn * p.lam, 2000);
        simT += dn / frequency(p.lam);
        updateNow();
      },

      resetTime() {
        startSweep();
        simT = 0;
        updateReadouts();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = computeLayout();
        const g0 = geoOf(lay.tank);
        // Wellenfront: nach Ende der Ausbreitung in die Grundwerte übernehmen
        if (sweepN && !sweep.running) {
          nBase += sweepN;
          RBase = Math.min(RBase + sweepN * p.lam, 2000);
          sweepN = 0;
        }
        if (!linesReady && (!sweep.running || sweep.t > 0.62)) linesReady = true;
        const dragP = grab === 'p';
        const dragE = grab === 'e1' || grab === 'e2';
        const lam = ease2('lam', p.lam, 7);
        const w = viewWave(lam);
        // Phase auf dem kürzesten Weg nachführen
        const phT = dphi();
        const phC = soft.get('ph') ?? phT;
        const phTarget = phC + ((((phT - phC) % TAU) + 3 * Math.PI) % TAU) - Math.PI;
        const v: View = {
          d: ease2('d', p.d, 8, dragE),
          lam,
          ph: ease2('ph', phTarget, 7),
          px: ease2('px', p.px, 9, dragP),
          py: ease2('py', p.py, 9, dragP),
          n: w.n,
          R: w.R,
          mix: ease2('mix', p.view === 'amp' ? 1 : 0, 5),
        };
        const ik = intro.running ? intro.value : 1;
        surface.begin();
        drawScene(g0, v, ik);
        drawInfo(lay.info, v, ik);
        drawChart(lay.chart, v, ik);
        if (animating || intro.running || sweep.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
