import { clamp, defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  arrivalTime,
  CHAIN_LENGTH,
  compressionPositions,
  displacement,
  excitationPhaseEnd,
  frontPosition,
  inPhasePartner,
  leadingCrest,
  maxStrain,
  nearestParticle,
  omega,
  particleAt,
  particleVelocity,
  PARTICLES,
  period,
  phaseAt,
  rarefactionPositions,
  relativeDensity,
  restPosition,
  SPACING,
  wavelength,
  type Excitation,
  type Wave,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Größte einstellbare Amplitude in m (bestimmt den Maßstab quer zur Kette). */
const AMP_MAX = 0.15;

type Mode = 'trans' | 'long' | 'both';

/** Zeitfenster des y(t)-Diagramms: gut drei Perioden, auf „glatte“ Werte gerundet. */
function niceWindow(T: number): number {
  const want = Math.max(4, 3.2 * T);
  for (const w of [4, 5, 6, 8, 10, 12, 15, 20, 25, 30]) if (w >= want) return w;
  return 30;
}

interface Layout {
  scene: Rect;
  xy: Rect;
  yt: Rect;
  tall: boolean;
}

interface TransTrack {
  top: number;
  /** Ruhelage (Mittellinie) in Pixeln. */
  cy: number;
  bottom: number;
  /** Platz über/unter der Kette für Wellenberg-Marke und λ-Klammer. */
  markY: number;
  lamY: number;
}

interface LongTrack {
  top: number;
  cy: number;
  /** halbe Höhe des Bandes mit den Teilchen. */
  half: number;
  /** Zeile für λ-Klammer und Nummer (nur ohne Transversalwelle). */
  lamY: number;
  bottom: number;
}

interface Geo {
  r: Rect;
  sm: boolean;
  x0: number;
  x1: number;
  kX: number;
  kY: number;
  ballR: number;
  excCx: number;
  excR: number;
  ph: { cy: number; rad: number; owner: 'trans' | 'long' } | null;
  trans: TransTrack | null;
  long: LongTrack | null;
  frontY: number;
  rulerY: number;
  rulerH: number;
}

/**
 * Transversal- und Longitudinalwellen: Kette aus gekoppelten Teilchen, links
 * angeregt von einem Erreger mit Kurbelscheibe. Wellenfront, markiertes
 * Teilchen mit Schwingungsbereich, λ-Messung zwischen gleichphasigen Stellen,
 * Zeiger an den Teilchen, Momentaufnahme y(x) und Zeitverlauf y(t) mit Zeitmarke.
 */
export default defineSimulation({
  id: 'wellen-ausbreitung',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.12, aspectNarrow: 0.48 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'type',
      type: 'choice',
      label: L('Wellenart', 'Type of wave'),
      options: [
        { value: 'trans', label: L('Transversalwelle', 'Transverse wave') },
        { value: 'long', label: L('Longitudinalwelle', 'Longitudinal wave') },
        { value: 'both', label: L('beide im Vergleich', 'both compared') },
      ],
      default: 'both',
    },
    {
      key: 'exc',
      type: 'choice',
      label: L('Erregung', 'Excitation'),
      options: [
        { value: 'cont', label: L('dauernd', 'continuous') },
        { value: 'pulse', label: L('Einzelpuls', 'single pulse') },
        { value: 'one', label: L('eine Schwingung', 'one oscillation') },
      ],
      default: 'cont',
    },
    { key: 'f', type: 'number', label: L('Frequenz f', 'Frequency f'), help: L('Frequenz des Erregers – alle Teilchen schwingen mit ihr.', 'Frequency of the source – all particles oscillate with it.'), min: 0.2, max: 2, step: 0.05, default: 0.8, unit: 'Hz' },
    {
      key: 'c',
      type: 'number',
      label: L('Ausbreitungsgeschwindigkeit c', 'Wave speed c'),
      help: L('Hängt vom Wellenträger ab (Kopplung und Masse der Teilchen), nicht vom Erreger.', 'Depends on the medium (coupling and mass of the particles), not on the source.'),
      min: 0.2,
      max: 2,
      step: 0.05,
      default: 1.2,
      unit: 'm/s',
    },
    { key: 'amp', type: 'number', label: L('Amplitude ŷ', 'Amplitude ŷ'), min: 1, max: 15, step: 1, default: 10, unit: 'cm' },
    {
      key: 'pm',
      type: 'number',
      label: L('Markiertes Teilchen Nr.', 'Marked particle no.'),
      help: L('Oder: ein Teilchen in der Kette oder in der Momentaufnahme antippen.', 'Or tap a particle in the chain or in the snapshot.'),
      min: 0,
      max: PARTICLES - 1,
      step: 1,
      default: 10,
    },
    { key: 'lam', type: 'boolean', group: 'view', label: L('Wellenlänge λ messen (gleichphasige Stelle)', 'Measure the wavelength λ (point in phase)'), default: true, visibleIf: (v) => v.exc === 'cont' },
    { key: 'ph', type: 'boolean', group: 'view', label: L('Zeiger an den Teilchen', 'Phasors on the particles'), default: false, visibleIf: (v) => v.exc === 'cont' },
    { key: 'crest', type: 'boolean', group: 'view', label: L('Wellenberg bzw. Verdichtung verfolgen', 'Follow a crest or compression'), default: false },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [{ id: 'go', label: L('Neu starten', 'Restart'), primary: true }],
  readouts: [
    { key: 'wave', label: L('Wellenlänge', 'Wavelength'), spoiler: true },
    { key: 'law', label: L('Wellenfunktion', 'Wave function'), spoiler: true },
    { key: 'mark', label: L('Markiertes Teilchen', 'Marked particle'), spoiler: true },
    { key: 'warn', label: L('Hinweis', 'Note') },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Beide Wellenarten im Vergleich', 'Both types compared'), values: {} },
    { id: 'trans', label: L('Transversalwelle: Wellenberg verfolgen', 'Transverse wave: follow a crest'), values: { type: 'trans', crest: true } },
    { id: 'long', label: L('Longitudinalwelle: Verdichtungen', 'Longitudinal wave: compressions'), values: { type: 'long', amp: 12, f: 0.6 } },
    { id: 'pulse', label: L('Einzelpuls läuft durch die Kette', 'A single pulse travels along'), values: { exc: 'pulse', type: 'trans', crest: true, pm: 20 } },
    { id: 'phase', label: L('Zeiger: Phasenunterschied', 'Phasors: phase difference'), values: { type: 'trans', ph: true, f: 1, c: 1.6, pm: 4 } },
    { id: 'short', label: L('Hohe Frequenz, kurze Wellenlänge', 'High frequency, short wavelength'), values: { f: 2, c: 1.2, amp: 5 } },
  ],
  strings: {
    de: {
      canvas: 'Kette aus gekoppelten Teilchen, links angeregt von einem Erreger mit Kurbelscheibe, als Transversal- und Longitudinalwelle mit Maßband; darunter die Momentaufnahme y(x) und der Zeitverlauf y(t) eines markierten Teilchens',
      axisX: 'x in m',
      axisT: 't in s',
      trans: 'Transversalwelle',
      transSub: 'Teilchen schwingen quer zur Ausbreitung',
      transS: 'transversal',
      long: 'Longitudinalwelle',
      longSub: 'Teilchen schwingen längs der Ausbreitung',
      longS: 'longitudinal',
      exciter: 'Erreger',
      front: 'Wellenfront',
      frontS: 'Front',
      rest: 'noch in Ruhe',
      crest: 'Wellenberg',
      comp: 'Verdichtung',
      rare: 'Verdünnung',
      lam: 'λ = {l} m',
      scale: 'quer ×{k}',
      chipXY: 'Momentaufnahme · y in cm',
      chipXYS: 'y(x) in cm',
      chipYT: 'y(t) von Nr. {i}',
      legE: 'Erreger',
      dt: 'Δt = x/c = {d} s',
      dtS: 'Δt',
      nr: 'Nr. {i}',
      tPill: 't = {t} s',
      fc: 'f = {f} Hz · c = {c} m/s',
      overtake: 'ŷ zu groß für λ',
      unitM: 'm',
      scrubHint: 'Zeitmarke – Abspielen setzt fort',
      waveText: '<var>λ</var> = <span class="frac"><span><var>c</var></span><span><var>f</var></span></span> = <span class="frac"><span>{c} m/s</span><span>{f} Hz</span></span> = <strong>{l} m</strong> · <var>T</var> = <span class="frac"><span>1</span><span><var>f</var></span></span> = {T} s<br>In einer Periodendauer <var>T</var> läuft die Welle genau eine Wellenlänge weiter: <var>c</var> = <var>λ</var> · <var>f</var>.',
      wavePulse: '<br>Der Puls ist <var>λ</var>/2 = {h} m lang (halbe Schwingung des Erregers).',
      waveOne: '<br>Der Wellenzug ist genau eine Wellenlänge lang (ein Wellenberg und ein Wellental).',
      lawText: '<var>y</var>(<var>x</var>, <var>t</var>) = <var>ŷ</var> · sin(2π · (<span class="frac"><span><var>t</var></span><span><var>T</var></span></span> − <span class="frac"><span><var>x</var></span><span><var>λ</var></span></span>)) = {a} cm · sin(2π · (<span class="frac"><span><var>t</var></span><span>{T} s</span></span> − <span class="frac"><span><var>x</var></span><span>{l} m</span></span>))',
      lawCont: '<br>für <var>t</var> ≥ <var>x</var>/<var>c</var>; vorher ist <var>y</var> = 0 (Ruhe vor der Wellenfront).',
      lawPulse: '<br>für 0 ≤ <var>t</var> − <var>x</var>/<var>c</var> ≤ <var>T</var>/2, sonst <var>y</var> = 0.',
      lawOne: '<br>für 0 ≤ <var>t</var> − <var>x</var>/<var>c</var> ≤ <var>T</var>, sonst <var>y</var> = 0.',
      markText: 'Nr. {i}, Ruhelage <var>x</var> = {x} m. Die Welle erreicht es nach <var>t</var> = <var>x</var>/<var>c</var> = {ta} s; danach schwingt es mit <var>ŷ</var> = {a} cm und <var>f</var> = {f} Hz um seine Ruhelage – es wandert nicht mit der Welle mit.',
      markPhase: '<br>Es hinkt dem Erreger um Δ<var>φ</var> = 2π · <span class="frac"><span><var>x</var></span><span><var>λ</var></span></span> ≈ {phi}° hinterher ({q} Perioden).',
      markPartner: '<br>Gleichphasig schwingt die Stelle <var>x</var> = {p} m{j} – genau eine Wellenlänge entfernt.',
      markPartnerNr: ' (Nr. {j})',
      markPulse: 'Nr. {i}, Ruhelage <var>x</var> = {x} m. Der Puls erreicht es nach <var>t</var> = <var>x</var>/<var>c</var> = {ta} s und lenkt es einmal aus; danach ruht es wieder an derselben Stelle.',
      warnText: 'Für die Longitudinalwelle ist 2π · <var>ŷ</var>/<var>λ</var> ≈ {s} ≥ 1: Benachbarte Teilchen würden sich überholen. Amplitude verkleinern oder Wellenlänge vergrößern.',
      warnScale: 'Quer zur Kette ist die Transversalwelle {k}-fach überhöht gezeichnet.',
      now: 't = {t} s · {front} · Nr. {i}: y = {y} cm, v = {v} m/s',
      nowScrub: 'Zeitmarke t = {t} s · {front} · Nr. {i}: y = {y} cm, v = {v} m/s',
      frontAt: 'Front bei x = {x} m',
      frontEnd: 'Front hat das Ende erreicht',
      go: 'Neu starten',
      goPulse: 'Puls auslösen',
    },
    en: {
      canvas: 'Chain of coupled particles driven at the left end by a source with a crank disc, as a transverse and a longitudinal wave with a measuring tape; below it the snapshot y(x) and the time graph y(t) of a marked particle',
      axisX: 'x in m',
      axisT: 't in s',
      trans: 'Transverse wave',
      transSub: 'particles oscillate across the direction of travel',
      transS: 'transverse',
      long: 'Longitudinal wave',
      longSub: 'particles oscillate along the direction of travel',
      longS: 'longitudinal',
      exciter: 'source',
      front: 'wave front',
      frontS: 'front',
      rest: 'still at rest',
      crest: 'crest',
      comp: 'compression',
      rare: 'rarefaction',
      lam: 'λ = {l} m',
      scale: 'across ×{k}',
      chipXY: 'Snapshot · y in cm',
      chipXYS: 'y(x) in cm',
      chipYT: 'y(t) of no. {i}',
      legE: 'source',
      dt: 'Δt = x/c = {d} s',
      dtS: 'Δt',
      nr: 'no. {i}',
      tPill: 't = {t} s',
      fc: 'f = {f} Hz · c = {c} m/s',
      overtake: 'ŷ too large for λ',
      unitM: 'm',
      scrubHint: 'time marker – play to continue',
      waveText: '<var>λ</var> = <span class="frac"><span><var>c</var></span><span><var>f</var></span></span> = <span class="frac"><span>{c} m/s</span><span>{f} Hz</span></span> = <strong>{l} m</strong> · <var>T</var> = <span class="frac"><span>1</span><span><var>f</var></span></span> = {T} s<br>During one period <var>T</var> the wave travels exactly one wavelength: <var>c</var> = <var>λ</var> · <var>f</var>.',
      wavePulse: '<br>The pulse is <var>λ</var>/2 = {h} m long (half an oscillation of the source).',
      waveOne: '<br>The wave train is exactly one wavelength long (one crest and one trough).',
      lawText: '<var>y</var>(<var>x</var>, <var>t</var>) = <var>ŷ</var> · sin(2π · (<span class="frac"><span><var>t</var></span><span><var>T</var></span></span> − <span class="frac"><span><var>x</var></span><span><var>λ</var></span></span>)) = {a} cm · sin(2π · (<span class="frac"><span><var>t</var></span><span>{T} s</span></span> − <span class="frac"><span><var>x</var></span><span>{l} m</span></span>))',
      lawCont: '<br>for <var>t</var> ≥ <var>x</var>/<var>c</var>; before that <var>y</var> = 0 (rest ahead of the wave front).',
      lawPulse: '<br>for 0 ≤ <var>t</var> − <var>x</var>/<var>c</var> ≤ <var>T</var>/2, otherwise <var>y</var> = 0.',
      lawOne: '<br>for 0 ≤ <var>t</var> − <var>x</var>/<var>c</var> ≤ <var>T</var>, otherwise <var>y</var> = 0.',
      markText: 'No. {i}, rest position <var>x</var> = {x} m. The wave reaches it after <var>t</var> = <var>x</var>/<var>c</var> = {ta} s; then it oscillates about its rest position with <var>ŷ</var> = {a} cm and <var>f</var> = {f} Hz – it does not travel with the wave.',
      markPhase: '<br>It lags behind the source by Δ<var>φ</var> = 2π · <span class="frac"><span><var>x</var></span><span><var>λ</var></span></span> ≈ {phi}° ({q} periods).',
      markPartner: '<br>The point <var>x</var> = {p} m{j} oscillates in phase – exactly one wavelength away.',
      markPartnerNr: ' (no. {j})',
      markPulse: 'No. {i}, rest position <var>x</var> = {x} m. The pulse reaches it after <var>t</var> = <var>x</var>/<var>c</var> = {ta} s and displaces it once; afterwards it rests at the same place again.',
      warnText: 'For the longitudinal wave 2π · <var>ŷ</var>/<var>λ</var> ≈ {s} ≥ 1: neighbouring particles would overtake each other. Reduce the amplitude or increase the wavelength.',
      warnScale: 'Across the chain the transverse wave is drawn {k} times enlarged.',
      now: 't = {t} s · {front} · no. {i}: y = {y} cm, v = {v} m/s',
      nowScrub: 'time marker t = {t} s · {front} · no. {i}: y = {y} cm, v = {v} m/s',
      frontAt: 'front at x = {x} m',
      frontEnd: 'the front has reached the end',
      go: 'Restart',
      goPulse: 'Trigger pulse',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const small = () => surface.width < 640;
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;

    const mode = () => p.type as Mode;
    const exc = () => p.exc as Excitation;
    const wave = (): Wave => ({ f: p.f, c: p.c, amp: p.amp / 100, exc: exc() });
    const showT = () => mode() !== 'long';
    const showL = () => mode() !== 'trans';
    const lamOn = () => p.lam && exc() === 'cont';
    const phOn = () => p.ph && exc() === 'cont';
    const xm = () => restPosition(p.pm);

    /* ---------- Aufteilung der Bühne ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const tall = w < 640 && h > w * 0.9;
      if (!tall) {
        const single = mode() !== 'both';
        const sh = Math.round(h * (h < 560 ? (single ? 0.54 : 0.6) : single ? 0.48 : 0.56));
        const y = sh + 10;
        const xw = Math.round((w - 10) * 0.56);
        return { scene: { x: 0, y: 0, w, h: sh }, xy: { x: 0, y, w: xw, h: h - y }, yt: { x: xw + 10, y, w: w - xw - 10, h: h - y }, tall };
      }
      const sh = Math.round(h * (mode() === 'both' ? 0.48 : 0.42));
      const each = (h - sh - 20) / 2;
      return { scene: { x: 0, y: 0, w, h: sh }, xy: { x: 0, y: sh + 10, w, h: each }, yt: { x: 0, y: sh + 20 + each, w, h: each }, tall };
    }
    let lay = computeLayout();

    const plotOpts = { equalAspect: false, pan: false, zoom: false, controls: false } as const;
    const plotXY = new Plot(surface, { ...plotOpts, x: [0, CHAIN_LENGTH], y: [-1, 1], region: () => lay.xy, xAxis: { label: ctx.t('axisX') }, yAxis: { label: '', numbers: false } });
    const plotYT = new Plot(surface, { ...plotOpts, x: [0, 5], y: [-1, 1], region: () => lay.yt, xAxis: { label: ctx.t('axisT') }, yAxis: { label: '', numbers: false } });

    /* ---------- Zustand ---------- */
    let t = 0;
    let scrub: number | null = null;
    let geo: Geo | null = null;
    let hoverScene = false;
    let dragMark = false;
    const pop = new Tween(420, ease.outBack);

    /** Startzeit für eine aussagekräftige Momentaufnahme (Front bzw. Puls mitten in der Kette). */
    function tInit(): number {
      const T = period(p);
      if (exc() === 'cont') {
        // Front etwa bei 60 % der Kette, aber hinter der gleichphasigen Stelle (λ-Messung sichtbar)
        const partner = inPhasePartner(p, xm());
        const want = Math.max(0.6 * CHAIN_LENGTH, partner !== null && partner > xm() ? partner + 0.3 : 0);
        return Math.min(want, 0.8 * CHAIN_LENGTH) / p.c;
      }
      const len = exc() === 'pulse' ? T / 2 : T;
      return (0.42 * CHAIN_LENGTH) / p.c + len / 2;
    }

    const viewT = () => scrub ?? t;
    const window0 = () => {
      const W = niceWindow(period(p));
      return { W, t0: Math.max(0, t - 0.86 * W) };
    };

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const w = wave();
      const vt = viewT();
      const fx = frontPosition(w, vt);
      const front = w.c * vt >= CHAIN_LENGTH ? ctx.t('frontEnd') : tr('frontAt', { x: n(fx, 2) });
      ctx.readout('now', tr(scrub !== null ? 'nowScrub' : 'now', { t: fmt.fixed(vt, 2), front, i: String(p.pm), y: n(displacement(w, xm(), vt) * 100, 1), v: n(particleVelocity(w, xm(), vt), 2) }));
    }

    function updateReadouts(): void {
      const w = wave();
      const lam = wavelength(w);
      const T = period(w);
      let html = tr('waveText', { c: n(p.c, 2), f: n(p.f, 2), l: n(lam, 3), T: n(T, 3) });
      if (exc() === 'pulse') html += tr('wavePulse', { h: n(lam / 2, 3) });
      if (exc() === 'one') html += ctx.t('waveOne');
      ctx.readout('wave', { html });
      ctx.readout('law', { html: tr('lawText', { a: n(p.amp, 0), T: n(T, 3), l: n(lam, 3) }) + ctx.t(exc() === 'cont' ? 'lawCont' : exc() === 'pulse' ? 'lawPulse' : 'lawOne') });
      const x = xm();
      const ta = n(arrivalTime(w, x), 2);
      if (exc() === 'cont') {
        let m = tr('markText', { i: String(p.pm), x: n(x, 1), ta, a: n(p.amp, 0), f: n(p.f, 2) });
        if (p.pm > 0) {
          const q = x / lam;
          m += tr('markPhase', { phi: n(q * 360, 0), q: n(q, 2) });
        }
        const partner = inPhasePartner(w, x);
        if (partner !== null) {
          const j = particleAt(partner);
          m += tr('markPartner', { p: n(partner, 2), j: j !== null ? tr('markPartnerNr', { j: String(j) }) : '' });
        }
        ctx.readout('mark', { html: m });
      } else ctx.readout('mark', { html: tr('markPulse', { i: String(p.pm), x: n(x, 1), ta }) });
      const notes: string[] = [];
      const s = maxStrain(w);
      if (showL() && s >= 1) notes.push(tr('warnText', { s: n(s, 2) }));
      if (geo && showT() && Math.abs(geo.kY / geo.kX - 1) > 0.1) notes.push(tr('warnScale', { k: n(geo.kY / geo.kX, 1) }));
      ctx.readout('warn', notes.length ? { html: notes.join('<br>') } : null);
      ctx.setAction('go', { label: ctx.t(exc() === 'cont' ? 'go' : 'goPulse'), enabled: !ctx.locked });
      updateNow();
    }

    /* ---------- Geometrie der Szene ---------- */
    function buildGeo(r: Rect): Geo {
      const sm = r.w < 640;
      const pillH = (sm ? 11 : 12) + 11;
      const top = r.y + 8 + pillH + (sm ? 4 : 8);
      const rulerH = sm ? 24 : 28;
      const rulerY = r.y + r.h - 8 - rulerH;
      const frontH = sm ? 16 : 18;
      const bottom = rulerY - frontH;
      const excW = sm ? 56 : 100;
      const x0 = r.x + (sm ? 8 : 12) + excW + (sm ? 8 : 14);
      const x1 = r.x + r.w - (sm ? 14 : 26);
      const kX = (x1 - x0) / CHAIN_LENGTH;
      const ballR = clamp(kX * SPACING * 0.27, 2.6, 6.5);
      const excR = excW / 2 - 6;
      const titleH = sm ? 15 : 18;
      const phRad = sm ? 8 : 11;
      const phH = phOn() ? 2 * phRad + (sm ? 8 : 12) : 0;
      const gap = sm ? 8 : 12;
      const both = showT() && showL();
      // Longitudinal: Band mit Beschriftungszeilen darüber und darunter
      const rowL = sm ? 13 : 15;
      let half = ballR + (sm ? 9 : 12);
      let longH = showL() ? titleH + rowL + 2 * half + rowL : 0;
      const avail = bottom - top - (both ? gap : 0);
      // Transversal: Zeilen für Wellenberg-Marke und λ-Klammer
      const markRoom = sm ? 18 : 22;
      const lamRoom = sm ? 18 : 22;
      let kY = kX;
      let transH = 0;
      if (showT()) {
        const fixed = titleH + phH + markRoom + lamRoom + 2 * ballR + 4;
        const room = Math.max(8, (avail - longH - fixed) / 2);
        kY = Math.min(room / AMP_MAX, (sm ? 4 : 2.5) * kX);
        transH = fixed + 2 * AMP_MAX * kY;
      } else {
        // nur longitudinal: Band höher, Teilchen in mehreren Reihen
        const extra = avail - longH - phH;
        half += clamp((extra - lamRoom) * 0.35, 0, sm ? 34 : 56);
        longH = titleH + phH + rowL + 2 * half + rowL + lamRoom;
      }
      const used = transH + longH + (both ? gap : 0);
      let y = top + Math.max(0, (avail + (both ? gap : 0) - used) * 0.4);
      let trans: TransTrack | null = null;
      let long: LongTrack | null = null;
      let ph: Geo['ph'] = null;
      if (showT()) {
        const t0 = y;
        if (phOn()) ph = { cy: y + titleH + phRad + 4, rad: phRad, owner: 'trans' };
        const markY = y + titleH + phH + markRoom * 0.5;
        const cy = y + titleH + phH + markRoom + ballR + 2 + AMP_MAX * kY;
        const lamY = cy + AMP_MAX * kY + ballR + 2 + lamRoom * 0.5;
        y += transH;
        trans = { top: t0, cy, bottom: y, markY, lamY };
        if (both) y += gap;
      }
      if (showL()) {
        const t0 = y;
        if (phOn() && !showT()) ph = { cy: y + titleH + phRad + 4, rad: phRad, owner: 'long' };
        const cy = y + titleH + (showT() ? 0 : phH) + rowL + half;
        long = { top: t0, cy, half, lamY: cy + half + rowL + lamRoom * 0.5, bottom: y + longH };
      }
      return { r, sm, x0, x1, kX, kY, ballR, excCx: r.x + (sm ? 8 : 12) + excW / 2, excR, ph, trans, long, frontY: bottom + frontH / 2, rulerY, rulerH };
    }

    const X = (g0: Geo, x: number) => g0.x0 + x * g0.kX;

    /* ---------- Zeichenhilfen ---------- */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }

    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
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

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): number {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center', false);
      return w;
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
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

    /** Kugel mit Glanzlicht. */
    function ball(x: number, y: number, r: number, color: string): void {
      const g = surface.g;
      if (r < 3.2) {
        g.fillStyle = color;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        return;
      }
      const grad = g.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.12, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.62));
      grad.addColorStop(0.55, color);
      grad.addColorStop(1, mixColor(color, '#000000', 0.38));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }

    /** Federn zwischen benachbarten Teilchen (Zickzack, bei engem Abstand gerade Linien). */
    function springs(pts: [number, number][], r: number, coil: boolean): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      g.strokeStyle = dark ? 'rgba(195,203,214,0.75)' : 'rgba(84,96,112,0.7)';
      g.lineWidth = coil ? 1.3 : 1.2;
      g.lineJoin = 'round';
      g.beginPath();
      for (let i = 0; i + 1 < pts.length; i++) {
        const [ax, ay] = pts[i]!;
        const [bx, by] = pts[i + 1]!;
        const len = Math.hypot(bx - ax, by - ay);
        if (!coil || len < 3 * r) {
          g.moveTo(ax, ay);
          g.lineTo(bx, by);
          continue;
        }
        const ux = (bx - ax) / len;
        const uy = (by - ay) / len;
        const s0 = r * 0.9;
        const s1 = len - r * 0.9;
        const zig = 6;
        const a = Math.min(3.2, r * 0.6);
        g.moveTo(ax + ux * s0, ay + uy * s0);
        for (let k = 1; k < zig; k++) {
          const s = s0 + ((s1 - s0) * k) / zig;
          const side = k % 2 ? a : -a;
          g.lineTo(ax + ux * s - uy * side, ay + uy * s + ux * side);
        }
        g.lineTo(ax + ux * s1, ay + uy * s1);
      }
      g.stroke();
    }

    /** Dreieck als Marke (nach unten bzw. oben zeigend). */
    function wedge(x: number, y: number, size: number, color: string, down: boolean, hollow = false): void {
      const g = surface.g;
      const d = down ? 1 : -1;
      g.beginPath();
      g.moveTo(x, y + d * size * 0.5);
      g.lineTo(x - size * 0.62, y - d * size * 0.5);
      g.lineTo(x + size * 0.62, y - d * size * 0.5);
      g.closePath();
      if (hollow) {
        g.strokeStyle = color;
        g.lineWidth = 1.5;
        g.stroke();
      } else {
        g.fillStyle = color;
        g.fill();
      }
    }

    /* ---------- Szene ---------- */
    function drawBackground(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#172131' : '#f3f6fa');
      bg.addColorStop(1, dark ? '#111925' : '#e4e9f0');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
    }

    /** Erreger: Kurbelscheibe mit Kurbelschleife (die Schleife überträgt nur die eine Komponente der Kreisbewegung). */
    function drawExciter(g0: Geo, cy: number, kind: 'trans' | 'long', vt: number, y0px: [number, number]): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const w = wave();
      const cx = g0.excCx;
      const tau = Math.max(0, vt);
      const ph = Math.min(omega(w) * tau, excitationPhaseEnd(w.exc));
      const rd = clamp(w.amp * (kind === 'trans' ? g0.kY : g0.kX) + (g0.sm ? 5 : 7), g0.sm ? 11 : 15, g0.excR);
      // Kurbelradius = Amplitude (bei überhöhter Darstellung so groß, wie die Scheibe erlaubt)
      const rp = Math.min(w.amp * (kind === 'trans' ? g0.kY : g0.kX), rd - 4);
      // Gehäuse (Motor)
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      const disc = g.createRadialGradient(cx - rd * 0.3, cy - rd * 0.35, rd * 0.1, cx, cy, rd);
      disc.addColorStop(0, dark ? '#9aa4b2' : '#f4f6f9');
      disc.addColorStop(0.7, dark ? '#5d6775' : '#c9d0d9');
      disc.addColorStop(1, dark ? '#3d4552' : '#8e98a5');
      g.fillStyle = disc;
      g.beginPath();
      g.arc(cx, cy, rd, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = dark ? '#2b323d' : '#6b7584';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(cx, cy, rd - 0.5, 0, TAU);
      g.stroke();
      // Kreis der Kurbel (Zeigerlänge = Amplitude)
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.setLineDash([3, 3]);
      g.beginPath();
      g.arc(cx, cy, Math.max(rp, 1), 0, TAU);
      g.stroke();
      g.setLineDash([]);
      // Kurbelzapfen: transversal (cos, sin) – longitudinal um 90° gedreht, sodass x = ŷ·sin φ
      const px = kind === 'trans' ? cx + rp * Math.cos(ph) : cx + rp * Math.sin(ph);
      const py = kind === 'trans' ? cy - rp * Math.sin(ph) : cy - rp * Math.cos(ph);
      const metal = dark ? '#c3cbd6' : '#4a5361';
      const [bx, by] = y0px;
      if (kind === 'trans') {
        // waagerechte Kurbelschleife in Höhe des Zapfens bis zum ersten Teilchen
        const yy = py;
        g.fillStyle = dark ? 'rgba(195,203,214,0.9)' : 'rgba(74,83,97,0.92)';
        roundRect(g, cx - rd - 3, yy - 3.5, rd * 2 + 6, 7, 3.5);
        g.fill();
        g.fillStyle = dark ? '#1b2330' : '#e8ecf1';
        roundRect(g, cx - rp - 3.5, yy - 1.6, Math.max(2 * rp + 7, 7), 3.2, 1.6);
        g.fill();
        g.strokeStyle = metal;
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(cx + rd + 2, yy);
        g.lineTo(bx, by);
        g.stroke();
        // Führung des ersten Teilchens
        g.strokeStyle = withAlpha(theme.text, 0.25);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(bx, cy - AMP_MAX * g0.kY - g0.ballR - 2);
        g.lineTo(bx, cy + AMP_MAX * g0.kY + g0.ballR + 2);
        g.stroke();
      } else {
        // senkrechte Kurbelschleife am Zapfen, Schubstange zum ersten Teilchen
        const xx = px;
        g.fillStyle = dark ? 'rgba(195,203,214,0.9)' : 'rgba(74,83,97,0.92)';
        roundRect(g, xx - 3.5, cy - rd - 3, 7, rd * 2 + 6, 3.5);
        g.fill();
        g.fillStyle = dark ? '#1b2330' : '#e8ecf1';
        roundRect(g, xx - 1.6, cy - rp - 3.5, 3.2, Math.max(2 * rp + 7, 7), 1.6);
        g.fill();
        g.strokeStyle = metal;
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(xx, cy + rd + 1);
        g.lineTo(xx, cy + rd + 5);
        g.lineTo(bx, cy + rd + 5);
        g.lineTo(bx, by);
        g.stroke();
      }
      // Achse und Zapfen
      g.fillStyle = dark ? '#1b2330' : '#3c4552';
      g.beginPath();
      g.arc(cx, cy, 2.4, 0, TAU);
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(px, py);
      g.stroke();
      ball(px, py, g0.sm ? 3.2 : 4, dark ? '#e6c35c' : '#c9962a');
      // Drehsinn
      const ra = rd + 4;
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.2;
      const a0 = kind === 'trans' ? -Math.PI * 0.62 : -Math.PI * 0.12;
      g.beginPath();
      g.arc(cx, cy, ra, a0 - 0.5, a0, false);
      g.stroke();
      const ex = cx + ra * Math.cos(a0 - 0.5);
      const ey = cy + ra * Math.sin(a0 - 0.5);
      const ang = a0 - 0.5 - Math.PI / 2;
      g.fillStyle = theme.muted;
      g.beginPath();
      g.moveTo(ex + 4 * Math.cos(ang), ey + 4 * Math.sin(ang));
      g.lineTo(ex + 4 * Math.cos(ang + 2.4), ey + 4 * Math.sin(ang + 2.4));
      g.lineTo(ex + 4 * Math.cos(ang - 2.4), ey + 4 * Math.sin(ang - 2.4));
      g.closePath();
      g.fill();
    }

    function trackTitle(g0: Geo, y: number, kind: 'trans' | 'long'): void {
      const theme = ctx.theme;
      const fs = g0.sm ? 11 : 12;
      const x = g0.sm ? g0.r.x + 8 : g0.x0 - 6;
      const head = ctx.t(g0.sm ? (kind === 'trans' ? 'transS' : 'longS') : kind);
      const w = richText(head, x, y, fs + (g0.sm ? 0 : 1), theme.text, 'left', true, 700);
      // Symbol: Schwingungsrichtung (Doppelpfeil) und Ausbreitung (Pfeil)
      const sx = x + w + 10;
      const col = red();
      if (kind === 'trans') {
        arrowPx(sx, y, sx, y - 6, col, 1.6, 4);
        arrowPx(sx, y, sx, y + 6, col, 1.6, 4);
      } else {
        arrowPx(sx, y, sx - 6, y, col, 1.6, 4);
        arrowPx(sx, y, sx + 6, y, col, 1.6, 4);
      }
      let x2 = sx + 12;
      if (!g0.sm) {
        x2 += richText(ctx.t(kind === 'trans' ? 'transSub' : 'longSub'), x2, y, fs, theme.muted, 'left', true, 600) + 10;
      }
      if (kind === 'trans' && Math.abs(g0.kY / g0.kX - 1) > 0.1) {
        richText(tr('scale', { k: n(g0.kY / g0.kX, 1) }), g0.x1, y, fs - 1, theme.muted, 'right', true, 600);
      }
    }

    function drawTrans(g0: Geo, vt: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const T = g0.trans!;
      const w = wave();
      const cy = T.cy;
      const front = w.c * vt;
      trackTitle(g0, T.top + (g0.sm ? 7 : 9), 'trans');
      // Ruhelage
      g.strokeStyle = withAlpha(theme.text, 0.22);
      g.lineWidth = 1;
      g.setLineDash([4, 5]);
      g.beginPath();
      g.moveTo(X(g0, 0), cy);
      g.lineTo(X(g0, CHAIN_LENGTH) + 8, cy);
      g.stroke();
      g.setLineDash([]);
      // Schwingungsbereich des markierten Teilchens: Es bleibt an seiner Stelle
      const mx = X(g0, xm());
      const A = w.amp * g0.kY;
      g.fillStyle = withAlpha(red(), theme.dark ? 0.2 : 0.13);
      roundRect(g, mx - g0.ballR - 3, cy - A - g0.ballR - 3, 2 * g0.ballR + 6, 2 * A + 2 * g0.ballR + 6, g0.ballR + 3);
      g.fill();
      g.strokeStyle = withAlpha(red(), 0.55);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(mx - g0.ballR - 6, cy);
      g.lineTo(mx + g0.ballR + 6, cy);
      g.stroke();
      // Teilchen und Federn
      const pts: [number, number][] = [];
      for (let i = 0; i < PARTICLES; i++) pts.push([X(g0, restPosition(i)), cy - displacement(w, restPosition(i), vt) * g0.kY]);
      drawExciter(g0, cy, 'trans', vt, pts[0]!);
      springs(pts, g0.ballR, g0.kX * SPACING >= 14);
      const still = theme.dark ? '#6b7584' : '#9aa3af';
      pts.forEach(([x, y], i) => {
        if (i === p.pm) return;
        const reached = restPosition(i) <= front + 1e-9;
        ball(x, y, g0.ballR, reached ? blue() : still);
      });
      // Gleichphasiger Partner (λ)
      drawPartner(g0, vt, (x) => [X(g0, x), cy - displacement(w, x, vt) * g0.kY], 'trans');
      // Markiertes Teilchen
      const [px, py] = pts[p.pm]!;
      drawMarked(g0, px, py, 'trans', vt);
      // Wellenberg verfolgen
      if (p.crest) {
        const xc = leadingCrest(w, vt);
        if (xc !== null) {
          const cx = X(g0, xc);
          const ty = cy - A - g0.ballR - 7;
          wedge(cx, ty, g0.sm ? 9 : 11, purple(), true);
          const lw = richWidth(ctx.t('crest'), g0.sm ? 11 : 12);
          const right = cx + 8 + lw + 22 < g0.x1 + 10;
          richText(ctx.t('crest'), right ? cx + 9 : cx - 9, ty - 1, g0.sm ? 11 : 12, purple(), right ? 'left' : 'right');
          const ax = right ? cx + 9 + lw + 4 : cx - 9 - lw - 22;
          arrowPx(ax, ty, ax + 16, ty, purple(), 2, 6);
        }
      }
    }

    function drawLong(g0: Geo, vt: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const Lt = g0.long!;
      const w = wave();
      const cy = Lt.cy;
      const front = w.c * vt;
      trackTitle(g0, Lt.top + (g0.sm ? 7 : 9), 'long');
      const half = Lt.half;
      const xa = X(g0, 0) - g0.ballR - 4;
      const xb = X(g0, CHAIN_LENGTH) + g0.ballR + 4;
      // Band: Färbung nach der Teilchendichte (dunkel = Verdichtung)
      const grad = g.createLinearGradient(xa, 0, xb, 0);
      const base = blue();
      for (let k = 0; k <= 80; k++) {
        const x = (k / 80) * CHAIN_LENGTH;
        const rho = Math.min(3, relativeDensity(w, x, vt));
        const a = clamp(0.1 + 0.32 * (rho - 1), 0.02, 0.6);
        const pos = clamp((X(g0, x + displacement(w, x, vt)) - xa) / (xb - xa), 0, 1);
        grad.addColorStop(pos, withAlpha(base, theme.dark ? a * 1.25 : a));
      }
      g.fillStyle = grad;
      roundRect(g, xa, cy - half, xb - xa, 2 * half, Math.min(10, half));
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.14);
      g.lineWidth = 1;
      roundRect(g, xa + 0.5, cy - half + 0.5, xb - xa - 1, 2 * half - 1, Math.min(10, half));
      g.stroke();
      // Ruhelagen als kleine Striche am Bandrand
      g.strokeStyle = withAlpha(theme.text, 0.2);
      g.beginPath();
      for (let i = 0; i < PARTICLES; i++) {
        const x = Math.round(X(g0, restPosition(i))) + 0.5;
        g.moveTo(x, cy + half - 4);
        g.lineTo(x, cy + half);
      }
      g.stroke();
      // Schwingungsbereich des markierten Teilchens
      const mx = X(g0, xm());
      const A = w.amp * g0.kX;
      g.fillStyle = withAlpha(red(), theme.dark ? 0.22 : 0.14);
      roundRect(g, mx - A - g0.ballR - 3, cy - g0.ballR - 3, 2 * A + 2 * g0.ballR + 6, 2 * g0.ballR + 6, g0.ballR + 3);
      g.fill();
      g.strokeStyle = withAlpha(red(), 0.65);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(mx, cy - half + 2);
      g.lineTo(mx, cy - g0.ballR - 4);
      g.moveTo(mx, cy + g0.ballR + 4);
      g.lineTo(mx, cy + half - 2);
      g.stroke();
      // weitere Teilchenreihen (wie Luftteilchen) machen Verdichtungen deutlich
      const rows = half > 26 ? [-0.68, -0.36, 0.36, 0.68] : [-0.62, 0.62];
      const xs: number[] = [];
      for (let i = 0; i < PARTICLES; i++) xs.push(X(g0, restPosition(i) + displacement(w, restPosition(i), vt)));
      const still = theme.dark ? '#6b7584' : '#9aa3af';
      g.fillStyle = withAlpha(base, theme.dark ? 0.7 : 0.55);
      const dotR = g0.sm ? 1.6 : 2.1;
      for (const f of rows) {
        g.beginPath();
        for (let i = 0; i < PARTICLES; i++) {
          const xx = xs[i]!;
          const yy = cy + f * half;
          g.moveTo(xx + dotR, yy);
          g.arc(xx, yy, dotR, 0, TAU);
        }
        g.fill();
      }
      const pts: [number, number][] = xs.map((x) => [x, cy]);
      drawExciter(g0, cy, 'long', vt, pts[0]!);
      springs(pts, g0.ballR, g0.kX * SPACING >= 14);
      pts.forEach(([x, y], i) => {
        if (i === p.pm) return;
        ball(x, y, g0.ballR, restPosition(i) <= front + 1e-9 ? blue() : still);
      });
      if (!showT()) drawPartner(g0, vt, (x) => [X(g0, x + displacement(w, x, vt)), cy], 'long');
      else drawPartnerRing(g0, vt, (x) => [X(g0, x + displacement(w, x, vt)), cy]);
      drawMarked(g0, pts[p.pm]![0], cy, 'long', vt);
      // Verdichtungen und Verdünnungen beschriften
      const fs = g0.sm ? 10.5 : 11.5;
      const comps = compressionPositions(w, vt).filter((x) => x > 0.02 && x <= Math.min(front, CHAIN_LENGTH));
      const rares = rarefactionPositions(w, vt).filter((x) => x > 0.02);
      const lam = wavelength(w);
      const roomText = lam * g0.kX > richWidth(ctx.t('comp'), fs, 650) + 14;
      const topRow = cy - half - (g0.sm ? 7 : 8);
      const botRow = cy + half + (g0.sm ? 7 : 8);
      // Text neben die Marke: Verdichtung oben, Verdünnung unten
      labelAtShifted(comps, topRow, 'comp', true);
      labelAtShifted(rares, botRow, 'rare', false);
      function labelAtShifted(list: number[], y: number, key: string, down: boolean): void {
        let best = -1;
        let bestD = Infinity;
        list.forEach((x, k) => {
          const d = Math.abs(x - CHAIN_LENGTH * 0.45);
          if (d < bestD) {
            bestD = d;
            best = k;
          }
        });
        const tw = richWidth(ctx.t(key), fs, 650);
        const used: [number, number][] = [];
        // zuerst die Beschriftung nahe der Mitte, dann die übrigen, sofern sie nicht überlappen
        const order = list.map((_, k) => k).sort((a, b) => (a === best ? -1 : b === best ? 1 : a - b));
        for (const k of order) {
          const x = list[k]!;
          const px = X(g0, x + displacement(w, x, vt));
          wedge(px, y + (down ? 1 : -1), 7, withAlpha(theme.text, 0.6), down, !down);
          if (!(roomText || k === best)) continue;
          const right = px + 7 + tw < g0.x1 + 16;
          const a = right ? px : px - 7 - tw;
          const b = right ? px + 7 + tw : px;
          if (used.some(([u, v]) => a < v + 6 && u < b + 6)) continue;
          used.push([a, b]);
          richText(ctx.t(key), right ? px + 7 : px - 7, y, fs, theme.muted, right ? 'left' : 'right', true, 650);
        }
      }
      // Verdichtung verfolgen
      if (p.crest) {
        const x = trackedCompression(w, vt);
        if (x !== null) {
          const px = X(g0, x + displacement(w, x, vt));
          g.strokeStyle = purple();
          g.lineWidth = 2.4;
          roundRect(g, px - 9, cy - half + 2, 18, 2 * half - 4, 6);
          g.stroke();
        }
      }
    }

    /** Verfolgte Verdichtung: bei Dauererregung die erste hinter der Front, beim Puls die vorderste. */
    function trackedCompression(w: Wave, vt: number): number | null {
      const list = compressionPositions(w, vt).filter((x) => x <= CHAIN_LENGTH && (w.exc !== 'cont' || x < w.c * vt - 1e-9));
      return list.length ? list[0]! : null;
    }

    /** Markiertes Teilchen: rot, größer, mit Geschwindigkeitspfeil und Nummer. */
    function drawMarked(g0: Geo, x: number, y: number, kind: 'trans' | 'long', vt: number): void {
      const g = surface.g;
      const w = wave();
      const r = g0.ballR * 1.45 + 1;
      const k = pop.running ? 1 + 0.35 * Math.sin(Math.PI * pop.t) : 1;
      g.fillStyle = withAlpha(red(), hoverScene || dragMark ? 0.3 : 0.18);
      g.beginPath();
      g.arc(x, y, (r + 5) * k, 0, TAU);
      g.fill();
      ball(x, y, r * k, red());
      // Geschwindigkeitspfeil (Schnelle)
      const v = particleVelocity(w, xm(), vt);
      const vmax = w.amp * omega(w);
      const len = (v / vmax) * (g0.sm ? 18 : 24);
      if (Math.abs(len) > 4) {
        if (kind === 'trans') arrowPx(x + r + 6, y, x + r + 6, y - len, red(), 2, 6);
        else arrowPx(x, y - r - 6, x + len, y - r - 6, red(), 2, 6);
      }
      // Nummer in der Zeile der λ-Klammer, auf der Seite ohne Klammer
      if (kind === 'trans' || !showT()) {
        const lbl = tr('nr', { i: String(p.pm) });
        const fs = g0.sm ? 10.5 : 11.5;
        const ly = kind === 'trans' ? g0.trans!.lamY : g0.long!.lamY;
        const lw = richWidth(lbl, fs);
        const partner = inPhasePartner(w, xm());
        const bracketRight = lamOn() && partner !== null && partner > xm();
        const leftOk = x - 8 - lw > g0.r.x + 6;
        const toLeft = (bracketRight || !lamOn() || partner === null) && leftOk;
        richText(lbl, toLeft ? x - 8 : x + 8, ly, fs, red(), toLeft ? 'right' : 'left');
      }
    }

    /** Gleichphasige Stelle: grüner Ring und Klammer „λ“. */
    function drawPartner(g0: Geo, vt: number, pos: (x: number) => [number, number], kind: 'trans' | 'long'): void {
      if (!lamOn()) return;
      const w = wave();
      const x = xm();
      const partner = inPhasePartner(w, x);
      if (partner === null) return;
      // erst, wenn die Welle beide Stellen erreicht hat
      if (w.c * vt < Math.max(x, partner)) return;
      drawPartnerRing(g0, vt, pos);
      const g = surface.g;
      const theme = ctx.theme;
      const col = green();
      const y = kind === 'trans' ? g0.trans!.lamY : g0.long!.lamY;
      const a = X(g0, Math.min(x, partner));
      const b = X(g0, Math.max(x, partner));
      g.strokeStyle = col;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(a, y - 5);
      g.lineTo(a, y + 5);
      g.moveTo(b, y - 5);
      g.lineTo(b, y + 5);
      g.stroke();
      arrowPx((a + b) / 2, y, a + 1, y, col, 1.6, 6);
      arrowPx((a + b) / 2, y, b - 1, y, col, 1.6, 6);
      // Hilfslinien zu den beiden Teilchen
      g.strokeStyle = withAlpha(col, 0.5);
      g.lineWidth = 1;
      g.setLineDash([2, 3]);
      g.beginPath();
      for (const xx of [x, partner]) {
        const [px, py] = pos(xx);
        g.moveTo(X(g0, xx), y - 5);
        g.lineTo(px, py + (py < y ? g0.ballR + 3 : -g0.ballR - 3));
      }
      g.stroke();
      g.setLineDash([]);
      const label = tr('lam', { l: n(wavelength(w), 2) });
      const fs = g0.sm ? 11 : 12;
      const lw = richWidth(label, fs) + 10;
      const lx = (a + b) / 2;
      if (b - a > lw + 16) {
        const g2 = surface.g;
        g2.fillStyle = theme.dark ? 'rgba(23,33,49,0.95)' : 'rgba(243,246,250,0.95)';
        g2.fillRect(lx - lw / 2, y - fs / 2 - 2, lw, fs + 4);
        richText(label, lx, y + 0.5, fs, col, 'center', false);
      } else richText(label, b + 6, y, fs, col, 'left');
    }

    function drawPartnerRing(g0: Geo, vt: number, pos: (x: number) => [number, number]): void {
      if (!lamOn()) return;
      const w = wave();
      const partner = inPhasePartner(w, xm());
      if (partner === null || w.c * vt < Math.max(xm(), partner)) return;
      const g = surface.g;
      const [px, py] = pos(partner);
      const exact = particleAt(partner) !== null;
      g.strokeStyle = green();
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(px, py, g0.ballR + 4, 0, TAU);
      g.stroke();
      if (!exact) {
        g.fillStyle = green();
        g.beginPath();
        g.arc(px, py, 2.2, 0, TAU);
        g.fill();
      }
    }

    /** Zeiger über einigen Teilchen: Phasenwinkel φ = ω·(t − x/c). */
    function drawPhasors(g0: Geo, vt: number): void {
      const ph = g0.ph;
      if (!ph) return;
      const g = surface.g;
      const theme = ctx.theme;
      const w = wave();
      const every = g0.kX * SPACING * 5 >= 2 * ph.rad + 8 ? 5 : 10;
      const list: number[] = [];
      for (let i = 0; i < PARTICLES; i += every) list.push(i);
      if (!list.includes(p.pm)) list.push(p.pm);
      for (const i of list) {
        const x = restPosition(i);
        const isM = i === p.pm;
        const cx = X(g0, x);
        const cy = ph.cy;
        const r = ph.rad;
        // bei zu engem Abstand zum markierten Teilchen: dessen Zeiger hat Vorrang
        if (!isM && Math.abs(i - p.pm) * g0.kX * SPACING < 2 * r + 4) continue;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.75)' : 'rgba(255,255,255,0.85)';
        g.beginPath();
        g.arc(cx, cy, r, 0, TAU);
        g.fill();
        g.strokeStyle = withAlpha(isM ? red() : theme.text, isM ? 0.8 : 0.3);
        g.lineWidth = 1;
        g.stroke();
        const phi = phaseAt(w, x, vt);
        const col = isM ? red() : blue();
        if (phi === null) {
          g.fillStyle = withAlpha(theme.muted, 0.7);
          g.beginPath();
          g.arc(cx, cy, 1.8, 0, TAU);
          g.fill();
          continue;
        }
        const ex = ph.owner === 'trans' ? cx + (r - 1) * Math.cos(phi) : cx + (r - 1) * Math.sin(phi);
        const ey = ph.owner === 'trans' ? cy - (r - 1) * Math.sin(phi) : cy - (r - 1) * Math.cos(phi);
        arrowPx(cx, cy, ex, ey, col, isM ? 2 : 1.6, g0.sm ? 4 : 5);
      }
    }

    function drawRuler(g0: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const y = g0.rulerY;
      const h = g0.rulerH;
      const xa = X(g0, 0) - 10;
      const xb = X(g0, CHAIN_LENGTH) + 12;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.18)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 2;
      const wood = g.createLinearGradient(0, y, 0, y + h);
      wood.addColorStop(0, dark ? '#cdb878' : '#f8e7a8');
      wood.addColorStop(1, dark ? '#a99558' : '#e3c674');
      g.fillStyle = wood;
      roundRect(g, xa, y, xb - xa, h, 4);
      g.fill();
      g.restore();
      const ink = '#3d2f0c';
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      const step = SPACING;
      for (let i = 0; i < PARTICLES; i++) {
        const xx = Math.round(X(g0, i * step)) + 0.5;
        const major = i % 5 === 0;
        g.moveTo(xx, y);
        g.lineTo(xx, y + (i % 10 === 0 ? h * 0.48 : major ? h * 0.36 : h * 0.22));
      }
      g.stroke();
      const fs = g0.sm ? 9.5 : 10.5;
      const every = g0.kX * 0.5 >= 30 ? 5 : 10;
      for (let i = 0; i < PARTICLES; i += every) {
        const xx = X(g0, i * step);
        const last = i === PARTICLES - 1;
        text(g, last ? `${fmt.num(i * step, 1)} ${ctx.t('unitM')}` : fmt.num(i * step, 1), last ? xx - 4 : xx, y + h * 0.74, { font: `700 ${fs}px ${theme.font}`, color: ink, align: last ? 'left' : 'center' });
      }
      // Marken: markiertes Teilchen und gleichphasige Stelle
      wedge(X(g0, xm()), y - 1, 9, red(), true);
      if (lamOn()) {
        const w = wave();
        const partner = inPhasePartner(w, xm());
        if (partner !== null && w.c * viewT() >= Math.max(xm(), partner)) wedge(X(g0, partner), y - 1, 9, green(), true);
      }
    }

    function drawFront(g0: Geo, vt: number): void {
      const w = wave();
      const xf = w.c * vt;
      if (xf >= CHAIN_LENGTH || vt <= 0) return;
      const g = surface.g;
      const theme = ctx.theme;
      const px = X(g0, xf);
      const top = (g0.trans ?? g0.long)!.top + (g0.sm ? 16 : 20);
      const bot = g0.frontY + 4;
      const col = orange();
      g.strokeStyle = withAlpha(col, 0.85);
      g.lineWidth = 1.6;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(px, top);
      g.lineTo(px, bot);
      g.stroke();
      g.setLineDash([]);
      const fs = g0.sm ? 10.5 : 11.5;
      const label = ctx.t(g0.sm ? 'frontS' : 'front');
      const lw = richWidth(label, fs);
      const right = px + 6 + lw + 20 < g0.x1 + 18;
      const ax = right ? px + 6 : px - 6 - lw - 20;
      richText(label, right ? ax : ax + 0, g0.frontY, fs, col, 'left');
      arrowPx(ax + lw + 4, g0.frontY, ax + lw + 18, g0.frontY, col, 1.8, 6);
      // Hinweis: vor der Front ist noch alles in Ruhe
      const restW = richWidth(ctx.t('rest'), fs, 600);
      const room = X(g0, CHAIN_LENGTH) - px;
      const Tt = g0.trans;
      if (room > restW + 30 && Tt) richText(ctx.t('rest'), px + room / 2 + 6, Tt.cy - (g0.sm ? 12 : 16), fs, theme.muted, 'center', true, 600);
    }

    function drawHeader(r: Rect, vt: number): void {
      const theme = ctx.theme;
      const sm = r.w < 640;
      const size = sm ? 11 : 12;
      const w1 = pill(r.x + 8, r.y + 8, tr('tPill', { t: fmt.fixed(vt, 2) }), scrub !== null ? purple() : theme.text, 'left', size);
      const wR = pill(r.x + r.w - 8, r.y + 8, tr('fc', { f: n(p.f, 2), c: n(p.c, 2) }), theme.text, 'right', size);
      if (showL() && maxStrain(wave()) >= 1) {
        const label = ctx.t('overtake');
        const lw = richWidth(label, size) + 16;
        const left = r.x + 8 + w1 + 8;
        const right = r.x + r.w - 8 - wR - 8;
        if (right - left >= lw) pill((left + right) / 2, r.y + 8, label, red(), 'center', size);
      }
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const g0 = geo!;
      const vt = viewT();
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawBackground(r);
      // senkrechte Hilfslinie durch die Ruhelage des markierten Teilchens
      const mx = X(g0, xm());
      g.strokeStyle = withAlpha(red(), 0.35);
      g.lineWidth = 1;
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(mx, (g0.trans ?? g0.long)!.top + (g0.sm ? 16 : 20));
      g.lineTo(mx, g0.rulerY);
      g.stroke();
      g.setLineDash([]);
      drawRuler(g0);
      drawFront(g0, vt);
      if (g0.trans) drawTrans(g0, vt);
      if (g0.long) drawLong(g0, vt);
      drawPhasors(g0, vt);
      drawHeader(r, vt);
      // Erreger beschriften
      const first = (g0.trans ?? g0.long)!;
      if (!g0.sm) richText(ctx.t('exciter'), g0.excCx, first.top + 9, 12, ctx.theme.muted, 'center', true, 650);
      else if (!g0.long || g0.long.cy + g0.excR + 12 < g0.frontY - 6) richText(ctx.t('exciter'), g0.excCx, g0.frontY, 10.5, ctx.theme.muted, 'center', true, 650);
      g.restore();
    }

    /* ---------- Diagramme ---------- */
    function frame(R0: Rect): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = ctx.theme.grid;
      g.lineWidth = 1;
      roundRect(g, R0.x + 0.5, R0.y + 0.5, R0.w - 1, R0.h - 1, 10);
      g.stroke();
      g.restore();
    }

    function chip(plot: Plot, x: number, label: string, color: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const fs = small() ? 11 : 12;
      const w = richWidth(label, fs) + 12;
      const h = small() ? 18 : 20;
      const R: Rect = { x, y: plot.rect.y + 5, w, h };
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)';
      roundRect(g, R.x, R.y, R.w, R.h, 6);
      g.fill();
      richText(label, R.x + 6, R.y + h / 2 + 0.5, fs, color, 'left', false);
      return R;
    }

    function yTicks(plot: Plot, gutter: number, ymax: number, range: number): void {
      const theme = ctx.theme;
      const p10 = 10 ** Math.floor(Math.log10(ymax));
      const stepY = [5, 2, 1].map((f) => f * p10).find((s) => s <= ymax * (1 + 1e-9)) ?? p10;
      const ticks = [-2, -1, 1, 2].map((k) => k * stepY).filter((yy) => Math.abs(yy) < range * 0.97);
      for (const yy of ticks) plot.hline(yy, { color: theme.grid, width: 1 });
      const tight = Math.abs(plot.py(stepY) - plot.py(0)) < 30;
      const dec = Math.max(0, -Math.floor(Math.log10(stepY) + 1e-9));
      for (const yy of ticks.filter((q) => !tight || q > 0)) plot.textPx(gutter - 6, plot.py(yy), fmt.num(yy, dec), { color: theme.muted, size: 12, align: 'right', baseline: 'middle' });
    }

    function drawXY(R0: Rect): void {
      const plot = plotXY;
      const theme = ctx.theme;
      const sm = small();
      const w = wave();
      const vt = viewT();
      const ymax = p.amp;
      const range = ymax * 1.5;
      plot.setRangePadded([0, CHAIN_LENGTH], [-range, range], { left: sm ? 34 : 40, right: 14, top: 6, bottom: 4 });
      const g = plot.begin();
      plot.grid({ minor: false });
      yTicks(plot, plot.px(0), ymax, range);
      plot.axes();
      // Kurve (bis zur Front genau abgetastet)
      const front = Math.min(CHAIN_LENGTH, w.c * vt);
      const steps = Math.max(80, Math.round(plot.rect.w / 2));
      const pts: [number, number][] = [];
      for (let k = 0; k <= steps; k++) {
        const x = (k / steps) * CHAIN_LENGTH;
        pts.push([x, displacement(w, x, vt) * 100]);
      }
      if (front > 0 && front < CHAIN_LENGTH) {
        pts.push([front - 1e-9, displacement(w, front - 1e-9, vt) * 100], [front, 0]);
        pts.sort((a, b) => a[0] - b[0]);
      }
      // Pulsenden exakt einfügen
      if (exc() !== 'cont') {
        const back = w.c * (vt - excitationPhaseEnd(w.exc) / omega(w));
        if (back > 0 && back < CHAIN_LENGTH) {
          pts.push([back, 0]);
          pts.sort((a, b) => a[0] - b[0]);
        }
      }
      if (front > 0 && front < CHAIN_LENGTH) plot.segment([front, -range * 2], [front, range * 2], { color: orange(), width: 1.5, dash: [5, 4], alpha: 0.85 });
      plot.polyline(pts, { color: blue(), width: 2.6 });
      // Teilchen als Punkte
      const still = theme.dark ? '#6b7584' : '#9aa3af';
      const pr = sm ? 2 : 2.6;
      for (let i = 0; i < PARTICLES; i++) {
        if (i === p.pm) continue;
        const x = restPosition(i);
        plot.point(x, displacement(w, x, vt) * 100, { color: x <= front + 1e-9 ? blue() : still, radius: pr });
      }
      // λ-Klammer
      if (lamOn()) {
        const partner = inPhasePartner(w, xm());
        if (partner !== null && w.c * vt >= Math.max(xm(), partner)) {
          const yb = ymax * 1.22;
          const a = Math.min(xm(), partner);
          const b = Math.max(xm(), partner);
          const lbl = tr('lam', { l: n(wavelength(w), 2) });
          const half = (richWidth(lbl, sm ? 11 : 12) / 2 + 5) / plot.scale.x;
          const mid = (a + b) / 2;
          if (b - a > 2 * half + 0.05) {
            plot.segment([a, yb], [mid - half, yb], { color: green(), width: 1.5 });
            plot.segment([mid + half, yb], [b, yb], { color: green(), width: 1.5 });
          } else plot.segment([a, yb], [b, yb], { color: green(), width: 1.5 });
          for (const xx of [a, b]) plot.segment([xx, yb - range * 0.07], [xx, yb + range * 0.07], { color: green(), width: 1.5 });
          for (const xx of [xm(), partner]) plot.segment([xx, yb], [xx, displacement(w, xx, vt) * 100], { color: green(), width: 1, dash: [2, 3], alpha: 0.6 });
          plot.point(partner, displacement(w, partner, vt) * 100, { color: green(), radius: 4.5, hollow: true });
          plot.textPx(plot.px((a + b) / 2), plot.py(yb), tr('lam', { l: n(wavelength(w), 2) }), { color: green(), size: sm ? 11 : 12, weight: 'bold', align: 'center', baseline: 'middle' });
        }
      }
      if (p.crest) {
        const xc = showT() ? leadingCrest(w, vt) : trackedCompression(w, vt);
        if (xc !== null) {
          const px = plot.px(xc);
          const py = plot.py(showT() ? ymax : ymax * 0.25) - 9;
          g.fillStyle = purple();
          g.beginPath();
          g.moveTo(px, py + 5);
          g.lineTo(px - 5, py - 3);
          g.lineTo(px + 5, py - 3);
          g.closePath();
          g.fill();
        }
      }
      plot.point(xm(), displacement(w, xm(), vt) * 100, { color: red(), radius: 5.5 });
      const c1 = chip(plot, plot.px(0) + 6, ctx.t(sm ? 'chipXYS' : 'chipXY'), blue());
      // Zeit rechts oben
      const tl = tr('tPill', { t: fmt.fixed(vt, 2) });
      const fs = sm ? 11 : 12;
      const tw = richWidth(tl, fs);
      if (plot.rect.x + plot.rect.w - 8 - tw > c1.x + c1.w + 8) richText(tl, plot.rect.x + plot.rect.w - 8, c1.y + c1.h / 2, fs, scrub !== null ? purple() : theme.muted, 'right', true, 700);
      plot.end();
      frame(R0);
    }

    function drawYT(R0: Rect): void {
      const plot = plotYT;
      const theme = ctx.theme;
      const sm = small();
      const w = wave();
      const vt = viewT();
      const { W, t0 } = window0();
      const ymax = p.amp;
      const range = ymax * 1.5;
      plot.setRangePadded([t0, t0 + W], [-range, range], { left: sm ? 34 : 40, right: 10, top: 6, bottom: 4 });
      const g = plot.begin();
      plot.grid({ minor: false });
      const gutter = plot.px(t0);
      yTicks(plot, gutter, ymax, range);
      plot.axes();
      if (t0 > 0) plot.vline(t0, { color: theme.axis, width: 1.5 });
      const steps = Math.max(80, Math.round(plot.rect.w / 1.5));
      const curve = (x: number): [number, number][] => {
        const pts: [number, number][] = [];
        const ta = arrivalTime(w, x);
        for (let k = 0; k <= steps; k++) {
          const tt = t0 + ((t - t0) * k) / steps;
          pts.push([tt, displacement(w, x, tt) * 100]);
        }
        if (ta > t0 && ta < t) pts.push([ta, 0]);
        if (exc() !== 'cont') {
          const te = ta + excitationPhaseEnd(w.exc) / omega(w);
          if (te > t0 && te < t) pts.push([te, 0]);
        }
        return pts.sort((a, b) => a[0] - b[0]);
      };
      // Laufzeit Δt = x/c als Klammer zwischen Erreger-Hochpunkt und Teilchen-Hochpunkt
      const dt = arrivalTime(w, xm());
      const T = period(w);
      if (p.pm > 0) {
        let tc: number | null = null;
        const nMax = exc() === 'cont' ? Math.floor((t - dt - T / 4) / T) : 0;
        for (let k = nMax; k >= 0; k--) {
          const c0 = T / 4 + k * T;
          if (c0 + dt <= t && c0 >= t0) {
            tc = c0;
            break;
          }
        }
        if (tc !== null && plot.px(tc + dt) - plot.px(tc) > 22) {
          const yb = ymax * 1.22;
          const a = tc;
          const b = tc + dt;
          for (const xx of [a, b]) plot.segment([xx, ymax], [xx, yb + range * 0.05], { color: purple(), width: 1, dash: [2, 3], alpha: 0.7 });
          plot.segment([a, yb], [b, yb], { color: purple(), width: 1.5 });
          const pa = plot.px(a);
          const pb = plot.py(yb);
          const pe = plot.px(b);
          g.fillStyle = purple();
          for (const [xx, d] of [
            [pa, 1],
            [pe, -1],
          ] as const) {
            g.beginPath();
            g.moveTo(xx, pb);
            g.lineTo(xx + d * 6, pb - 3);
            g.lineTo(xx + d * 6, pb + 3);
            g.closePath();
            g.fill();
          }
          const full = tr('dt', { d: n(dt, 2) });
          const fs = sm ? 11 : 12;
          const label = pe - pa > richWidth(full, fs) + 10 ? full : ctx.t('dtS');
          plot.textPx((pa + pe) / 2, pb + 3, label, { color: purple(), size: fs, weight: 'bold', align: 'center', baseline: 'top' });
        }
      }
      plot.polyline(curve(0), { color: theme.muted, width: 1.8, dash: [6, 4] });
      plot.polyline(curve(xm()), { color: red(), width: 2.6 });
      // Zeitmarke
      plot.segment([vt, -range * 2], [vt, range * 2], { color: scrub !== null ? purple() : theme.muted, width: scrub !== null ? 2 : 1.2, dash: scrub !== null ? [] : [4, 4], alpha: 0.9 });
      const yv = displacement(w, xm(), vt) * 100;
      plot.point(vt, yv, { color: red(), radius: 5 });
      // Etikett mit Legende
      const fs = sm ? 11 : 12;
      const c1 = chip(plot, gutter + 6, tr('chipYT', { i: String(p.pm) }), red());
      const lx = c1.x + c1.w + 8;
      const leg = ctx.t('legE');
      const lw = richWidth(leg, fs, 650);
      if (lx + 26 + lw < plot.rect.x + plot.rect.w - 6) {
        const cyc = c1.y + c1.h / 2;
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.8;
        g.setLineDash([5, 3]);
        g.beginPath();
        g.moveTo(lx, cyc);
        g.lineTo(lx + 18, cyc);
        g.stroke();
        g.setLineDash([]);
        richText(leg, lx + 22, cyc + 0.5, fs, theme.muted, 'left', true, 650);
      }
      // Wert an der Zeitmarke
      const label = `${n(yv, 1)} cm`;
      const pxm = plot.px(vt);
      const r = plot.rect;
      g.font = `bold ${fs}px ${theme.font}`;
      const labW = g.measureText(label).width;
      const right = pxm < r.x + r.w - labW - 14;
      let base = yv >= 0 ? plot.py(yv) - 8 : plot.py(yv) + fs + 6;
      base = clamp(base, c1.y + c1.h + fs + 2, r.y + r.h - 4);
      plot.textPx(right ? pxm + 8 : pxm - 8 - labW, base, label, { color: red(), size: fs, weight: 'bold', align: 'left' });
      plot.end();
      frame(R0);
    }

    /* ---------- Bedienung ---------- */
    function nearestInScene(px: number): number {
      const g0 = geo;
      if (!g0) return p.pm;
      // in der Longitudinalwelle sind die Teilchen verschoben: nächstes sichtbares Teilchen
      if (!showT()) {
        const w = wave();
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < PARTICLES; i++) {
          const x = restPosition(i);
          const d = Math.abs(X(g0, x + displacement(w, x, viewT())) - px);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        return best;
      }
      return nearestParticle((px - g0.x0) / g0.kX);
    }

    function inChain(px: number, py: number): boolean {
      const g0 = geo;
      if (!g0) return false;
      const sp = g0.kX * SPACING;
      if (px < g0.x0 - sp / 2 - 4 || px > g0.x1 + sp / 2 + 4) return false;
      const top = (g0.trans ?? g0.long)!.top + 14;
      return py >= top && py <= g0.rulerY + g0.rulerH;
    }

    function setMark(i: number): void {
      if (i === p.pm) return;
      ctx.set({ pm: i });
      pop.play();
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && inChain(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked || !inChain(q.px, q.py)) return false;
        dragMark = true;
        setMark(nearestInScene(q.px));
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (dragMark) setMark(nearestInScene(q.px));
      },
      pointerUp: () => {
        dragMark = false;
        surface.setCursor(hoverScene ? 'pointer' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? inChain(q.px, q.py) : false;
        if (h !== hoverScene) {
          hoverScene = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'pointer' : '');
      },
      wheel: () => false,
    });

    const inRect = (R: Rect, px: number, py: number) => px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h;
    // Momentaufnahme antippen: Teilchen markieren
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && inRect(lay.xy, px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked) return false;
        setMark(nearestParticle(plotXY.toWorld(q.px, q.py)[0]));
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => setMark(nearestParticle(plotXY.toWorld(q.px, q.py)[0])),
      pointerUp: () => {},
      hover: (q: { px: number; py: number } | null) => surface.setCursor(q ? 'pointer' : ''),
      wheel: () => false,
    });
    // Zeitverlauf antippen: Zeitmarke setzen (hält an)
    function setScrub(px: number): void {
      const tt = plotYT.toWorld(px, 0)[0];
      const { t0 } = window0();
      scrub = clamp(tt, t0, t);
      updateNow();
      ctx.requestRender();
    }
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && t > 0.05 && inRect(lay.yt, px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked || t <= 0.05) return false;
        ctx.clock.pause();
        setScrub(q.px);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => setScrub(q.px),
      pointerUp: () => {},
      hover: (q: { px: number; py: number } | null) => surface.setCursor(q ? 'ew-resize' : ''),
      wheel: () => false,
    });

    const offClock = ctx.clock.onChange((playing) => {
      if (playing && scrub !== null) {
        scrub = null;
        updateNow();
      }
    });

    function relayout(): void {
      lay = computeLayout();
      plotXY.resize();
      plotYT.resize();
      geo = buildGeo(lay.scene);
    }

    t = tInit();
    relayout();

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace') {
          t = tInit();
          scrub = null;
          ctx.clock.pause();
        } else if (changed.has('exc')) {
          t = tInit();
          scrub = null;
        } else if (changed.has('f') || changed.has('c')) scrub = null;
        if (changed.has('pm') && source === 'input') pop.play();
        relayout();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          t = 0;
          scrub = null;
          updateReadouts();
          ctx.clock.play();
        }
      },

      tick(dt) {
        if (scrub !== null) return;
        t += dt * (p.slow ? 0.25 : 1);
        // Puls hat die Kette verlassen: anhalten
        if (exc() !== 'cont') {
          const w = wave();
          const end = CHAIN_LENGTH / w.c + excitationPhaseEnd(w.exc) / omega(w) + 1.5;
          if (t > end) ctx.clock.pause();
        }
        updateNow();
      },

      resetTime() {
        t = 0;
        scrub = null;
        updateReadouts();
      },

      render() {
        relayout();
        surface.begin();
        drawScene(lay.scene);
        drawXY(lay.xy);
        drawYT(lay.yt);
        if (pop.running && !prefersReducedMotion()) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
