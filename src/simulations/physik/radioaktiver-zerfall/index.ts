import { clamp, defineSimulation, drawCard, ease, FixedStepper, mixColor, offscreenCanvas, prefersReducedMotion, roundRect, scaledSprite, seededRandom, shade, Surface, text, textOn, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  atomsPerGram,
  decayBetween,
  decayConstant,
  decayProbability,
  expectedRemaining,
  LN2,
  mean,
  median,
  NUCLIDES,
  raySegment,
  sciParts,
  simulateLifetime,
  specificActivity,
  stepDecay,
  sunflower,
  survivingShare,
  unitSeconds,
  type Nucleus,
  type Nuclide,
  type NuclideId,
  ageFromFraction,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Rechenschritte je Halbwertszeit (p = 1 − e^(−λΔt) mit Δt = T½/200). */
const STEPS = 200;
const H = 1 / STEPS;
const P_STEP = decayProbability(LN2, H);
/** Messpunkte alle 0,1 T½, Aktivität in Klassen zu 0,25 T½. */
const SAMPLE_EVERY = 20;
const BIN = 0.25;
const BIN_STEPS = STEPS * BIN;
/** Nach 10 Halbwertszeiten (weniger als 0,1 %) endet der Versuch. */
const U_END = 10;
/** Histogramm der Lebensdauern: Klassen zu 0,5 T½ bis 5 T½, dazu „> 5“. */
const H_BINS = 10;
const H_W = 0.5;
const MAX_LIVES = 5000;
const MAX_EMISSIONS = 360;
/** Schräglage des Zählrohrs (rad, nach rechts oben). */
const PHI = -0.36;
/** Anteil der Zerfälle, deren Teilchen gezielt ins Zählrohrfenster fliegen (Nachweiswahrscheinlichkeit, gezeichnet). */
const EFF = 0.12;

type Mode = 'many' | 'one';
type Kind = 'a' | 'b' | 'g';

interface Lay {
  side: boolean;
  scene: Rect;
  a: Rect;
  b: Rect;
}

interface Geo {
  r: Rect;
  sm: boolean;
  pad: number;
  eq: Rect;
  A: Rect;
  cx: number;
  cy: number;
  /** Außenradius der Schale und Radius des Bereichs mit Kernen. */
  dishR: number;
  R: number;
  /** Radius einer Kern-Kugel. */
  rb: number;
  /** Zählrohr: Mitte des Fensters, Richtung nach außen, Länge, Radius. */
  wx: number;
  wy: number;
  ux: number;
  uy: number;
  len: number;
  tr: number;
  win: [number, number, number, number];
  box: Rect;
}

interface Emission {
  x: number;
  y: number;
  dx: number;
  dy: number;
  kind: Kind;
  t0: number;
  speed: number;
  range: number;
  hit: number | null;
  done: boolean;
  /** Gehört zum einzelnen Kern (Versuch 2)? */
  one: boolean;
}

interface Sample {
  u: number;
  N: number;
}

interface Flyer {
  life: number;
  t0: number;
  x: number;
  y: number;
}

/**
 * Radioaktiver Zerfall: Ein Präparat aus vielen Kernen (von oben gesehen) zerfällt
 * zufällig – jeder zerfallende Kern blitzt auf, sendet ein α- oder β-Teilchen
 * (teils mit γ-Strahlung) aus und wird zum Tochterkern. Ein Zählrohr registriert
 * die Teilchen, die in sein Fenster fliegen. Live entstehen das N-t-Diagramm
 * (linear oder logarithmisch) mit Theoriekurve und Halbwertszeit-Marken und das
 * Aktivitätsdiagramm. Zweiter Versuch: ein einzelner Kern und die Verteilung
 * seiner Lebensdauer über viele Beobachtungen.
 */
export default defineSimulation({
  id: 'radioaktiver-zerfall',
  animated: true,
  layout: { aspect: 1.55, aspectNarrow: 0.48 },
  images: { tube: 'zaehlrohr.webp', counter: 'zaehlgeraet.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'many', label: L('Präparat mit vielen Kernen', 'Sample with many nuclei') },
        { value: 'one', label: L('Ein einzelner Kern', 'A single nucleus') },
      ],
      default: 'many',
    },
    {
      key: 'nuc',
      type: 'choice',
      label: L('Nuklid', 'Nuclide'),
      options: [
        // Halbwertszeit als Zusatzangabe: im Aufgabenmodus verdeckt (wie im Ergebnis „Nuklid und Zerfall“)
        { value: 'rn220', label: L('Radon-220', 'Radon-220'), detail: L('55,6 s', '55.6 s') },
        { value: 'i131', label: L('Iod-131', 'Iodine-131'), detail: L('8,02 d', '8.02 d') },
        { value: 'cs137', label: L('Cäsium-137', 'Caesium-137'), detail: L('30,1 a', '30.1 a') },
        { value: 'c14', label: L('Kohlenstoff-14', 'Carbon-14'), detail: L('5730 a', '5730 a') },
        { value: 'u238', label: L('Uran-238', 'Uranium-238'), detail: L('4,47 · 10⁹ a', '4.47 · 10⁹ a') },
      ],
      default: 'rn220',
    },
    {
      key: 'N0',
      type: 'number',
      label: L('Anzahl der Kerne N₀', 'Number of nuclei N₀'),
      min: 100,
      max: 2500,
      step: 100,
      default: 500,
      visibleIf: (v) => v.mode === 'many',
    },
    {
      key: 'tl',
      type: 'number',
      label: L('Zeitraffer: eine Halbwertszeit dauert', 'Time-lapse: one half-life takes'),
      help: L('So viele Sekunden im Bild entsprechen einer Halbwertszeit.', 'This many seconds on screen correspond to one half-life.'),
      min: 3,
      max: 30,
      step: 1,
      default: 6,
      unit: 's',
    },
    { key: 'log', type: 'boolean', group: 'view', label: L('N-Achse logarithmisch (Gerade)', 'Logarithmic N axis (straight line)'), default: false, visibleIf: (v) => v.mode === 'many' },
    { key: 'theo', type: 'boolean', group: 'view', label: L('Theoriekurve und Halbwertszeit-Marken', 'Theoretical curve and half-life marks'), default: true },
    { key: 'snd', type: 'boolean', group: 'view', label: L('Knacken des Zählrohrs (Ton)', 'Clicks of the counter (sound)'), default: false },
  ],
  actions: [
    { id: 'new', label: L('Neues Präparat', 'New sample'), primary: true, visibleIf: (v) => v.mode === 'many' },
    { id: 'next', label: L('Nächster Kern', 'Next nucleus'), primary: true, visibleIf: (v) => v.mode === 'one' },
    { id: 'batch', label: L('100 Kerne auswerten', 'Evaluate 100 nuclei'), visibleIf: (v) => v.mode === 'one' },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data'), visibleIf: (v) => v.mode === 'one' },
  ],
  readouts: [
    { key: 'nuc', label: L('Nuklid und Zerfall', 'Nuclide and decay') },
    { key: 'now', label: L('Momentan', 'Right now'), spoiler: true },
    { key: 'act', label: L('Aktivität und Zählrohr', 'Activity and counter'), spoiler: true },
    { key: 'age', label: L('Zeit aus dem Restanteil', 'Time from the remaining fraction'), spoiler: true },
    { key: 'single', label: L('Dieser Kern', 'This nucleus') },
    { key: 'stats', label: L('Viele Beobachtungen', 'Many observations'), spoiler: true },
  ],
  // Tipp je Versuch (Typangabe am Parameter, damit `ctx.params` typisiert bleibt)
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'one'
      ? L(
          'Tipp: Ist der Kern zerfallen, startet Antippen des Kerns oder „Nächster Kern“ die nächste Beobachtung; „100 Kerne auswerten“ zeigt schnell die Verteilung der Lebensdauern.',
          'Tip: once the nucleus has decayed, tap it or use “Next nucleus” to watch the next one; “Evaluate 100 nuclei” quickly shows the distribution of lifetimes.',
        )
      : L(
          'Tipp: Einen Kern antippen und beobachten, wann er zerfällt (Tastatur: Tab bis zur Schale, dann Enter). Auch „linear“/„log“ und der Lautsprecher am Zähler lassen sich antippen.',
          'Tip: tap a nucleus and watch when it decays (keyboard: Tab to the dish, then Enter). “linear”/“log” and the speaker on the counter can be tapped as well.',
        ),
  presets: [
    { id: 'start', label: L('Radon-220: 500 Kerne', 'Radon-220: 500 nuclei'), values: {} },
    { id: 'few', label: L('Nur 100 Kerne: viel Zufall', 'Only 100 nuclei: lots of chance'), values: { N0: 100 } },
    { id: 'log', label: L('Logarithmische Achse: eine Gerade', 'Logarithmic axis: a straight line'), values: { N0: 2500, log: true } },
    { id: 'c14', label: L('C-14: Altersbestimmung', 'C-14: radiocarbon dating'), values: { nuc: 'c14', N0: 1000 } },
    { id: 'iod', label: L('Iod-131 in der Medizin', 'Iodine-131 in medicine'), values: { nuc: 'i131', snd: false } },
    { id: 'one', label: L('Ein einzelner Kern', 'A single nucleus'), values: { mode: 'one' } },
  ],
  strings: {
    de: {
      canvas:
        'Radioaktives Präparat von oben: viele Atomkerne als Kugeln in einer Schale, daneben ein Zählrohr mit Zähler. Zerfällt ein Kern, blitzt er auf, sendet ein α- oder β-Teilchen (bei manchen Nukliden zusätzlich γ-Strahlung) aus und wird zum grauen Tochterkern. Oben die Zerfallsgleichung. Rechts das Diagramm der Anzahl N der Mutterkerne mit Messpunkten, theoretischer Kurve und Halbwertszeit-Marken (linear oder logarithmisch) und darunter die Aktivität. Im zweiten Versuch wird ein einzelner Kern beobachtet; die Lebensdauern vieler Kerne sammeln sich in einem Histogramm.',
      alpha: 'α-Zerfall',
      beta: 'β⁻-Zerfall',
      halfLife: 'T½ = {t}',
      lapse: 'Zeitraffer: 1 s ≙ {t}',
      tube: 'Zählrohr',
      counter: 'Impulse',
      rate: '≈ {z} pro {u}',
      rateNone: 'Zählrate …',
      chartN: 'Anzahl N der Mutterkerne',
      chartNS: 'Mutterkerne N',
      lin: 'linear',
      log: 'log',
      axisT: 't in {u}',
      measured: 'Messwerte',
      theory: 'Theorie',
      marks: ['T½', '2 T½', '3 T½'].join('|'),
      fracs: ['½ N₀', '¼ N₀', '⅛ N₀'].join('|'),
      chartA: 'Aktivität A = λ · N',
      chartAS: 'Aktivität A',
      axisA: 'A in {u}',
      emptyN: '„Abspielen“ – hier entstehen die Messpunkte.',
      emptyNS: 'Abspielen …',
      done: 'Fast alle Kerne zerfallen – „Neues Präparat“',
      doneS: 'Fast alles zerfallen',
      allDone: 'Alle Kerne zerfallen – „Neues Präparat“',
      allDoneS: 'Alle zerfallen',
      watchKey: 'Einen zufälligen Kern beobachten',
      tapHint: 'Tippe einen Kern an: Wann zerfällt er?',
      tapHintS: 'Kern antippen',
      watching: 'Wann zerfällt er?',
      watched: 'zerfallen bei {u} T½',
      mother: 'Mutterkerne',
      daughter: 'Tochterkerne',
      chartH: 'Lebensdauer der beobachteten Kerne',
      chartHS: 'Lebensdauern',
      axisU: 't in T½',
      axisCount: 'Anzahl',
      expected: 'erwartet',
      chartS: 'Anteil noch nicht zerfallen',
      chartSS: 'nicht zerfallen',
      axisPct: 'in %',
      emptyH: 'Hier sammeln sich die Lebensdauern.',
      emptyHS: 'Noch keine Werte',
      aliveLab: 'Kern Nr. {k} · existiert seit {u} T½',
      aliveLabS: 'Nr. {k} · seit {u} T½',
      decLab: 'zerfallen nach {u} T½',
      oneHint: 'Wann zerfällt dieser Kern? Das kann niemand vorhersagen.',
      oneHintS: 'Wann zerfällt er? Unvorhersagbar!',
      nextHint: 'Antippen oder „Nächster Kern“',
      meanLab: 'Ø {m} T½',
      nuc: '{eq}<br>{kind} · Halbwertszeit <var>T</var><sub>½</sub> = <strong>{T}</strong> · Zerfallskonstante <var>λ</var> = <span class="frac"><span>ln 2</span><span><var>T</var><sub>½</sub></span></span>{l}<br>Zum Vergleich: 1 g {name} enthält etwa {atoms} Kerne und hat die Aktivität <var>A</var> ≈ {spec} Bq.{chain}',
      chain: '<br>Der Tochterkern {d} ist selbst radioaktiv (Zerfallsreihe) – hier wird nur der erste Zerfall betrachtet.',
      kindA: 'α-Zerfall: Der Kern sendet einen Heliumkern (2 Protonen, 2 Neutronen) aus.',
      kindB: 'β⁻-Zerfall: Im Kern wandelt sich ein Neutron in ein Proton um; ein Elektron (und ein Antineutrino) wird ausgesandt.',
      kindG: ' Dazu kommt γ-Strahlung.',
      now: '<var>t</var> = {t} = {u} <var>T</var><sub>½</sub> · <var>N</var> = <strong>{N}</strong> von {N0} ({pct} %)<br>Theorie: <var>N</var><sub>0</sub> · (½)<sup><var>t</var> / <var>T</var><sub>½</sub></sup> = {N0} · (½)<sup>{u}</sup> ≈ <strong>{Nth}</strong>',
      act: '<var>A</var> = <var>λ</var> · <var>N</var> ≈ {l} · {N} ≈ <strong>{A}</strong> ({Bq} Bq)<br>Zählrohr: <strong>{k} Impulse</strong> bei {d} Zerfällen – es erfasst nur die Teilchen, die in sein Fenster fliegen.',
      age: 'Restanteil <span class="frac"><span><var>N</var></span><span><var>N</var><sub>0</sub></span></span> = {pct} % ⇒ <var>t</var> = <var>T</var><sub>½</sub> · log<sub>2</sub>(<span class="frac"><span><var>N</var><sub>0</sub></span><span><var>N</var></span></span>) ≈ {T} · {k} ≈ <strong>{est}</strong> (tatsächlich vergangen: {t})',
      ageC14: '<br>So bestimmt die C-14-Methode das Alter von Holz, Knochen oder Stoff: Lebewesen nehmen bis zu ihrem Tod laufend C-14 auf, danach zerfällt es nur noch.',
      ageNone: 'Noch kein Kern zerfallen.',
      ageAll: 'Alle Kerne sind zerfallen – aus dem Restanteil 0 lässt sich keine Zeit mehr bestimmen.',
      singleAlive: 'Kern Nr. {k} existiert seit {t} = {u} <var>T</var><sub>½</sub>.{p}',
      singleP: '<br>Die Wahrscheinlichkeit, dass er in der nächsten Halbwertszeit zerfällt, ist immer <strong>50 %</strong> – egal, wie lange er schon existiert.',
      singleDec: 'Kern Nr. {k} ist nach <strong>{u} <var>T</var><sub>½</sub></strong> ({t}) zerfallen.',
      stats: '{n} Kerne beobachtet · Mittelwert der Lebensdauer: <strong>{m} <var>T</var><sub>½</sub></strong> (Theorie: <span class="frac"><span>1</span><span>ln 2</span></span> <var>T</var><sub>½</sub> ≈ 1,44 <var>T</var><sub>½</sub>) · Median: {md} <var>T</var><sub>½</sub><br>Vor Ablauf einer Halbwertszeit zerfallen: <strong>{h} %</strong> (Theorie: 50 %)',
      statsNone: 'Noch kein Kern beobachtet – warten oder „100 Kerne auswerten“.',
    },
    en: {
      canvas:
        'Radioactive sample seen from above: many atomic nuclei drawn as balls in a dish, next to it a counter tube with a counter. When a nucleus decays it flashes, emits an alpha or beta particle (for some nuclides also gamma radiation) and becomes a grey daughter nucleus. At the top the decay equation. On the right the graph of the number N of parent nuclei with data points, theoretical curve and half-life marks (linear or logarithmic) and below it the activity. In the second experiment a single nucleus is observed; the lifetimes of many nuclei build up a histogram.',
      alpha: 'alpha decay',
      beta: 'beta⁻ decay',
      halfLife: 'T½ = {t}',
      lapse: 'time-lapse: 1 s ≙ {t}',
      tube: 'counter tube',
      counter: 'counts',
      rate: '≈ {z} per {u}',
      rateNone: 'count rate …',
      chartN: 'Number N of parent nuclei',
      chartNS: 'Parent nuclei N',
      lin: 'linear',
      log: 'log',
      axisT: 't in {u}',
      measured: 'measured',
      theory: 'theory',
      marks: ['T½', '2 T½', '3 T½'].join('|'),
      fracs: ['½ N₀', '¼ N₀', '⅛ N₀'].join('|'),
      chartA: 'Activity A = λ · N',
      chartAS: 'Activity A',
      axisA: 'A in {u}',
      emptyN: '“Play” – the data points appear here.',
      emptyNS: 'Play …',
      done: 'Almost all nuclei have decayed – “New sample”',
      doneS: 'Almost all decayed',
      allDone: 'All nuclei have decayed – “New sample”',
      allDoneS: 'All decayed',
      watchKey: 'Watch a random nucleus',
      tapHint: 'Tap a nucleus: when will it decay?',
      tapHintS: 'Tap a nucleus',
      watching: 'When will it decay?',
      watched: 'decayed at {u} T½',
      mother: 'parent nuclei',
      daughter: 'daughter nuclei',
      chartH: 'Lifetimes of the observed nuclei',
      chartHS: 'Lifetimes',
      axisU: 't in T½',
      axisCount: 'number',
      expected: 'expected',
      chartS: 'Share not yet decayed',
      chartSS: 'not decayed',
      axisPct: 'in %',
      emptyH: 'The lifetimes collect here.',
      emptyHS: 'No data yet',
      aliveLab: 'nucleus no. {k} · has existed for {u} T½',
      aliveLabS: 'no. {k} · {u} T½',
      decLab: 'decayed after {u} T½',
      oneHint: 'When will this nucleus decay? Nobody can predict it.',
      oneHintS: 'When will it decay? Unpredictable!',
      nextHint: 'Tap it or “Next nucleus”',
      meanLab: 'mean {m} T½',
      nuc: '{eq}<br>{kind} · half-life <var>T</var><sub>½</sub> = <strong>{T}</strong> · decay constant <var>λ</var> = <span class="frac"><span>ln 2</span><span><var>T</var><sub>½</sub></span></span>{l}<br>For comparison: 1 g of {name} contains about {atoms} nuclei and has the activity <var>A</var> ≈ {spec} Bq.{chain}',
      chain: '<br>The daughter nucleus {d} is itself radioactive (decay series) – only the first decay is considered here.',
      kindA: 'Alpha decay: the nucleus emits a helium nucleus (2 protons, 2 neutrons).',
      kindB: 'Beta⁻ decay: inside the nucleus a neutron turns into a proton; an electron (and an antineutrino) is emitted.',
      kindG: ' Gamma radiation is emitted as well.',
      now: '<var>t</var> = {t} = {u} <var>T</var><sub>½</sub> · <var>N</var> = <strong>{N}</strong> of {N0} ({pct} %)<br>Theory: <var>N</var><sub>0</sub> · (½)<sup><var>t</var> / <var>T</var><sub>½</sub></sup> = {N0} · (½)<sup>{u}</sup> ≈ <strong>{Nth}</strong>',
      act: '<var>A</var> = <var>λ</var> · <var>N</var> ≈ {l} · {N} ≈ <strong>{A}</strong> ({Bq} Bq)<br>Counter tube: <strong>{k} counts</strong> from {d} decays – it only registers the particles that fly into its window.',
      age: 'Remaining fraction <span class="frac"><span><var>N</var></span><span><var>N</var><sub>0</sub></span></span> = {pct} % ⇒ <var>t</var> = <var>T</var><sub>½</sub> · log<sub>2</sub>(<span class="frac"><span><var>N</var><sub>0</sub></span><span><var>N</var></span></span>) ≈ {T} · {k} ≈ <strong>{est}</strong> (time actually elapsed: {t})',
      ageC14: '<br>This is how radiocarbon dating finds the age of wood, bone or cloth: living things keep taking in C-14 until they die; after that it only decays.',
      ageNone: 'No nucleus has decayed yet.',
      ageAll: 'All nuclei have decayed – a remaining fraction of 0 no longer gives a time.',
      singleAlive: 'Nucleus no. {k} has existed for {t} = {u} <var>T</var><sub>½</sub>.{p}',
      singleP: '<br>The probability that it decays within the next half-life is always <strong>50 %</strong> – no matter how long it has already existed.',
      singleDec: 'Nucleus no. {k} decayed after <strong>{u} <var>T</var><sub>½</sub></strong> ({t}).',
      stats: '{n} nuclei observed · mean lifetime: <strong>{m} <var>T</var><sub>½</sub></strong> (theory: <span class="frac"><span>1</span><span>ln 2</span></span> <var>T</var><sub>½</sub> ≈ 1.44 <var>T</var><sub>½</sub>) · median: {md} <var>T</var><sub>½</sub><br>Decayed within one half-life: <strong>{h} %</strong> (theory: 50 %)',
      statsNone: 'No nucleus observed yet – wait or “Evaluate 100 nuclei”.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const mode = (): Mode => (p.mode === 'one' ? 'one' : 'many');
    const nucId = (): NuclideId => (p.nuc === 'i131' || p.nuc === 'cs137' || p.nuc === 'c14' || p.nuc === 'u238' ? p.nuc : 'rn220');
    const nuc = (): Nuclide => NUCLIDES[nucId()];
    const motherCol = () => ctx.theme.series[3]!;
    const daughterCol = () => mixColor(ctx.theme.series[0]!, '#8f9aa8', 0.8);
    const alphaCol = () => ctx.theme.series[1]!;
    const betaCol = () => ctx.theme.series[0]!;
    const gammaCol = () => ctx.theme.series[5]!;
    const markCol = () => ctx.theme.series[2]!;
    const actCol = () => ctx.theme.series[4]!;
    const kindCol = (k: Kind) => (k === 'a' ? alphaCol() : k === 'b' ? betaCol() : gammaCol());

    /* ---------- Zahlen ---------- */
    const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
    const supText = (s: string) => s.replace(/[0-9-]/g, (c) => SUP[c] ?? c);
    /** Tausender mit schmalem Leerzeichen gruppieren (ab 10 000). */
    function group(s: string): string {
      const neg = s.startsWith('−');
      const body = neg ? s.slice(1) : s;
      const [int, frac] = body.split(/[.,]/);
      if (!int || int.length < 5) return s;
      const sep = de ? ',' : '.';
      const g = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return (neg ? '−' : '') + g + (frac !== undefined ? sep + frac : '');
    }
    /** Zahl mit etwa `sig` gültigen Ziffern; sehr große oder kleine Zahlen als Zehnerpotenz. */
    function sig(v: number, digits = 3, html = false): string {
      if (v === 0) return '0';
      const a = Math.abs(v);
      if (a >= 1e6 || a < 1e-3) {
        const { m, e } = sciParts(v);
        const ms = n(m, Math.max(0, digits - 1));
        return html ? `${ms} · 10<sup>${e < 0 ? `−${-e}` : e}</sup>` : `${ms} · 10${supText(String(e))}`;
      }
      const e = Math.floor(Math.log10(a));
      const d = clamp(digits - 1 - e, 0, 6);
      const q = 10 ** (e - digits + 1);
      return group(n(Math.round(v / q) * q, d));
    }
    const unitLabel = (nu: Nuclide) => (nu.unit === 'Ga' ? '10⁹ a' : nu.unit);
    /** Zeiteinheit der Zählrate: Englisch ausgeschrieben („per 10⁹ years“ statt „/10⁹ a“). */
    const EN_RATE_UNIT: Record<string, string> = { s: 's', d: 'day', a: 'year', Ga: '10⁹ years' };
    const rateUnit = (nu: Nuclide) => (ctx.lang === 'de' ? unitLabel(nu) : (EN_RATE_UNIT[nu.unit] ?? nu.unit));
    /** Kehrwert der Zeiteinheit, z. B. „1/s“ oder „1/(10⁹ a)“. */
    const perUnit = (nu: Nuclide) => (nu.unit === 'Ga' ? '1/(10⁹ a)' : `1/${nu.unit}`);
    /** Zeit in der Einheit des Nuklids (u in Halbwertszeiten). */
    function timeStr(u: number, nu: Nuclide = nuc()): string {
      const t = u * nu.halfLife;
      if (nu.unit === 'Ga') return `${fx(t, 2)} · 10⁹ a`;
      if (nu.halfLife >= 1000) return `${group(n(Math.round(t / 10) * 10, 0))} a`;
      return `${fx(t, 1)} ${nu.unit}`;
    }
    function halfLifeStr(nu: Nuclide): string {
      if (nu.unit === 'Ga') return `${fx(nu.halfLife, 2)} · 10⁹ a`;
      return `${group(n(nu.halfLife, 2))} ${nu.unit}`;
    }
    /** Zeitraffer: wie viel Zeit eine Sekunde im Bild darstellt. */
    function lapseStr(nu: Nuclide): string {
      const t = nu.halfLife / p.tl;
      if (nu.unit === 'Ga') return `${sig(t * 1e9, 2)} a`;
      return `${sig(t, 2)} ${nu.unit}`;
    }

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, eps = 1e-3): number {
      const cur = soft.get(key);
      if (cur === undefined || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= eps * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    /** Auffüllen eines neuen Präparats (Kerne erscheinen von innen nach außen). */
    const refill = new Tween(1100, ease.linear);

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.42, 250, 440));
        const ah = Math.round((h - 10) * 0.56);
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, a: { x: w - pw, y: 0, w: pw, h: ah }, b: { x: w - pw, y: ah + 10, w: pw, h: h - ah - 10 } };
      }
      const sh = Math.round(h * 0.5);
      const ah = Math.round((h - sh - 20) * 0.56);
      return { side, scene: { x: 0, y: 0, w, h: sh }, a: { x: 0, y: sh + 10, w, h: ah }, b: { x: 0, y: sh + 20 + ah, w, h: h - sh - 20 - ah } };
    }

    function sceneGeo(r: Rect, count: number): Geo {
      const sm = r.w < 440 || r.h < 380;
      const pad = sm ? 8 : 14;
      const eqH = sm ? 56 : 66;
      const eq: Rect = { x: r.x + pad, y: r.y + pad, w: r.w - 2 * pad, h: eqH };
      const top = eq.y + eqH + (sm ? 8 : 12);
      const A: Rect = { x: r.x + pad, y: top, w: r.w - 2 * pad, h: r.y + r.h - pad - top };
      const len = sm ? 62 : 92;
      const tr = sm ? 10 : 13;
      const gap = sm ? 9 : 13;
      const cos = Math.cos(PHI);
      const sin = Math.sin(PHI);
      const fromW = (A.w - (gap + len) * cos - tr * 1.6 - 8) / (1 + cos);
      const fromH = A.h / 2 - 6;
      const dishR = Math.max(40, Math.min(fromW, fromH));
      const used = dishR + (dishR + gap + len) * cos + tr * 1.6;
      const cx = A.x + Math.max(0, (A.w - used) / 2) + dishR;
      const cy = A.y + A.h / 2;
      const ring = clamp(dishR * 0.07, 6, 12);
      const R = dishR - ring - 4;
      const spacing = R * Math.sqrt(Math.PI / Math.max(1, count));
      const rb = clamp(spacing * 0.43, 1.6, 11);
      const wx = cx + (dishR + gap) * cos;
      const wy = cy + (dishR + gap) * sin;
      const nx = -sin;
      const ny = cos;
      const bw = sm ? 86 : 118;
      const bh = sm ? 58 : 76;
      return {
        r,
        sm,
        pad,
        eq,
        A,
        cx,
        cy,
        dishR,
        R,
        rb,
        wx,
        wy,
        ux: cos,
        uy: sin,
        len,
        tr,
        win: [wx + nx * tr * 0.9, wy + ny * tr * 0.9, wx - nx * tr * 0.9, wy - ny * tr * 0.9],
        box: { x: A.x + A.w - bw, y: A.y + A.h - bh, w: bw, h: bh },
      };
    }

    /* ---------- vorgerenderte Kugeln und Lichtflecken ---------- */
    const sprites = new Map<string, HTMLCanvasElement>();
    function ball(color: string, r: number): HTMLCanvasElement {
      const rr = Math.max(1.5, Math.round(r * 4) / 4);
      const key = `${color}|${rr}|${surface.dpr}`;
      const hit = sprites.get(key);
      if (hit) return hit;
      if (sprites.size > 120) sprites.clear();
      const m = rr * 0.9;
      const size = 2 * (rr + m);
      const { canvas, g } = offscreenCanvas(size, size, surface.dpr);
      const c = rr + m;
      const dpr = surface.dpr;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.55)';
      g.shadowBlur = rr * 0.7 * dpr;
      g.shadowOffsetX = rr * 0.12 * dpr;
      g.shadowOffsetY = rr * 0.3 * dpr;
      g.fillStyle = shade(color, -0.3);
      g.beginPath();
      g.arc(c, c, rr * 0.96, 0, TAU);
      g.fill();
      g.restore();
      const body = g.createRadialGradient(c - rr * 0.38, c - rr * 0.42, rr * 0.08, c, c, rr);
      body.addColorStop(0, mixColor(color, '#ffffff', 0.62));
      body.addColorStop(0.42, color);
      body.addColorStop(1, shade(color, -0.4));
      g.fillStyle = body;
      g.beginPath();
      g.arc(c, c, rr, 0, TAU);
      g.fill();
      const gl = g.createRadialGradient(c - rr * 0.36, c - rr * 0.44, 0, c - rr * 0.36, c - rr * 0.44, rr * 0.5);
      gl.addColorStop(0, 'rgba(255,255,255,0.85)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.beginPath();
      g.arc(c, c, rr, 0, TAU);
      g.fill();
      sprites.set(key, canvas);
      return canvas;
    }
    function drawBall(color: string, x: number, y: number, r: number, scale = 1, alpha = 1): void {
      if (scale <= 0.01 || alpha <= 0.01) return;
      const g = surface.g;
      const sp = ball(color, r);
      const rr = Math.max(1.5, Math.round(r * 4) / 4);
      const half = (rr + rr * 0.9) * scale;
      if (alpha < 1) {
        g.save();
        g.globalAlpha *= alpha;
      }
      g.drawImage(sp, x - half, y - half, 2 * half, 2 * half);
      if (alpha < 1) g.restore();
    }
    const glows = new Map<string, HTMLCanvasElement>();
    /** Weicher Lichtfleck in einer Farbe (weißer Verlauf, danach eingefärbt). */
    function glow(color: string): HTMLCanvasElement {
      const key = `${color}|${surface.dpr}`;
      const hit = glows.get(key);
      if (hit) return hit;
      const size = 48;
      const { canvas, g } = offscreenCanvas(size, size, surface.dpr);
      const gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.3, 'rgba(255,255,255,0.55)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, size, size);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = color;
      g.fillRect(0, 0, size, size);
      glows.set(key, canvas);
      return canvas;
    }
    function drawGlow(color: string, x: number, y: number, rad: number, alpha: number): void {
      if (alpha <= 0.01 || rad <= 0.5) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.drawImage(glow(color), x - rad, y - rad, 2 * rad, 2 * rad);
      g.restore();
    }

    /* ---------- Zeichenhilfen ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
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
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: fill ? textOn(fill, theme) : color });
      return { x: x0, y, w, h };
    }
    function pillWidth(label: string, size = 12): number {
      const g = surface.g;
      g.font = `700 ${size}px ${ctx.theme.font}`;
      return g.measureText(label).width + 16;
    }
    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect): void {
      drawCard(surface.g, r, ctx.theme);
    }
    function haloText(label: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineWidth = 3.5;
      g.lineJoin = 'round';
      g.strokeStyle = ctx.theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
      g.strokeText(label, x, y);
      g.fillStyle = color;
      g.fillText(label, x, y);
    }
    function niceStep(x: number): number {
      const q = 10 ** Math.floor(Math.log10(Math.max(1e-12, x)));
      for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
      return 10 * q;
    }
    function textW(s: string, font: string): number {
      const g = surface.g;
      g.font = font;
      return g.measureText(s).width;
    }

    /* ---------- Kernsymbole mit Massen- und Kernladungszahl ---------- */
    /** Zeichnet z. B. ²²⁰₈₆Rn (Zahlen links übereinander); gibt die Breite zurück. */
    function nuclideSym(x: number, y: number, top: string, bottom: string, sym: string, size: number, color: string, draw = true): number {
      const theme = ctx.theme;
      const fBig = `700 ${size}px ${theme.font}`;
      const fSmall = `600 ${Math.round(size * 0.56)}px ${theme.font}`;
      const wt = textW(top, fSmall);
      const wb = textW(bottom, fSmall);
      const ws = textW(sym, fBig);
      const sw = Math.max(wt, wb);
      if (draw) {
        const g = surface.g;
        text(g, top, x + sw, y - size * 0.36, { font: fSmall, color: withAlpha(color, 0.9), align: 'right' });
        text(g, bottom, x + sw, y + size * 0.4, { font: fSmall, color: withAlpha(color, 0.9), align: 'right' });
        text(g, sym, x + sw + 1.5, y + 1, { font: fBig, color, align: 'left' });
      }
      return sw + 1.5 + ws;
    }
    /** Anzahl unter einem Kernsymbol, mit einer kleinen Kugel in der Farbe der Kerne im Bild. */
    function countLabel(cx: number, y: number, label: string, color: string, ballCol: string, size: number): void {
      const f = `700 ${Math.max(11, size * 0.55)}px ${ctx.theme.font}`;
      const w = textW(label, f);
      const br = Math.max(3.2, size * 0.2);
      const x0 = cx - (w + 2 * br + 4) / 2;
      drawBall(ballCol, x0 + br, y, br);
      text(surface.g, label, x0 + 2 * br + 4, y, { font: f, color, align: 'left' });
    }
    const zStr = (z: number) => (z < 0 ? `−${-z}` : String(z));

    /** Teile der Zerfallsgleichung (Breite messen oder zeichnen). */
    function equation(x: number, y: number, size: number, nu: Nuclide, counts: [string, string] | null, draw: boolean): number {
      const theme = ctx.theme;
      const op = `600 ${size * 0.9}px ${theme.font}`;
      const gap = size * 0.42;
      let xx = x;
      const g = surface.g;
      const mc = motherCol();
      const dc = theme.dark ? mixColor(daughterCol(), '#ffffff', 0.25) : shade(daughterCol(), -0.25);
      const w1 = nuclideSym(xx, y, String(nu.A), String(nu.Z), nu.symbol, size, mc, draw);
      if (draw && counts) countLabel(xx + w1 / 2 + 2, y + size * 1.05, counts[0], mc, motherCol(), size);
      xx += w1 + gap;
      if (draw) text(g, '→', xx, y + 1, { font: op, color: theme.text, align: 'left' });
      xx += textW('→', op) + gap;
      const w2 = nuclideSym(xx, y, String(nu.daughter.A), String(nu.daughter.Z), nu.daughter.symbol, size, dc, draw);
      if (draw && counts) countLabel(xx + w2 / 2 + 2, y + size * 1.05, counts[1], dc, daughterCol(), size);
      xx += w2 + gap;
      if (draw) text(g, '+', xx, y + 1, { font: op, color: theme.text, align: 'left' });
      xx += textW('+', op) + gap;
      if (nu.kind === 'alpha') xx += nuclideSym(xx, y, '4', '2', 'He', size, alphaCol(), draw);
      else {
        xx += nuclideSym(xx, y, '0', zStr(-1), 'e', size, betaCol(), draw);
        // Antineutrino ν̄
        const fs = `600 ${size * 0.72}px ${theme.mathFont}`;
        xx += gap * 0.8;
        if (draw) text(g, '+', xx, y + 1, { font: op, color: theme.muted, align: 'left' });
        xx += textW('+', op) + gap * 0.8;
        const wn = textW('ν', fs);
        if (draw) {
          text(g, 'ν', xx, y + 2, { font: fs, color: theme.muted, align: 'left' });
          g.strokeStyle = theme.muted;
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(xx + 0.5, y - size * 0.32);
          g.lineTo(xx + wn + 0.5, y - size * 0.32);
          g.stroke();
        }
        xx += wn;
      }
      if (nu.gamma) {
        xx += gap;
        if (draw) text(g, '+', xx, y + 1, { font: op, color: theme.text, align: 'left' });
        xx += textW('+', op) + gap;
        const fg = `italic 700 ${size}px ${theme.mathFont}`;
        if (draw) text(g, 'γ', xx, y + 1, { font: fg, color: gammaCol(), align: 'left' });
        xx += textW('γ', fg);
      }
      return xx - x;
    }

    /* ---------- Zustand: Präparat ---------- */
    let seed = 1;
    let rand = seededRandom(seed);
    const vis = seededRandom(97);
    let count = p.N0;
    let alive = new Uint8Array(count).fill(1);
    let decayU = new Float32Array(count).fill(-1);
    let decayMs = new Float64Array(count).fill(-1e9);
    let pos = sunflower(count);
    let N = count;
    let stepIdx = 0;
    let u = 0;
    let finished = false;
    let samples: Sample[] = [{ u: 0, N: count }];
    let bins = new Float64Array(Math.ceil(U_END / BIN) + 1);
    let pulses = 0;
    let pulseU: number[] = [];
    let ledMs = -1e9;
    let winMs = -1e9;
    let emissions: Emission[] = [];
    let tracked = -1;
    let hoverNuc = -1;
    const stepper = new FixedStepper(H);
    let lastGeo: Geo | null = null;
    /** Präparat-Nuklid, für das die Messung läuft (Wechsel startet neu). */
    let sampleNuc: NuclideId = nucId();

    function rebuild(newSeed: boolean, animate: boolean): void {
      if (newSeed) seed = (seed * 7 + 11) % 100003 || 1;
      rand = seededRandom(seed);
      count = p.N0;
      alive = new Uint8Array(count).fill(1);
      decayU = new Float32Array(count).fill(-1);
      decayMs = new Float64Array(count).fill(-1e9);
      pos = sunflower(count);
      N = count;
      stepIdx = 0;
      u = 0;
      finished = false;
      samples = [{ u: 0, N: count }];
      bins = new Float64Array(Math.ceil(U_END / BIN) + 1);
      pulses = 0;
      pulseU = [];
      emissions = emissions.filter((e) => e.one);
      tracked = -1;
      stepper.reset();
      sampleNuc = nucId();
      soft.delete('xmax');
      for (let k = 1; k <= 3; k++) soft.set(`mk${k}`, 0);
      if (animate) refill.play();
    }

    /** Pixelposition eines Kerns. */
    const nx = (G: Geo, i: number) => G.cx + pos[2 * i]! * G.R;
    const ny = (G: Geo, i: number) => G.cy + pos[2 * i + 1]! * G.R;

    function emit(x: number, y: number, kind: Kind, one: boolean, G: Geo | null, scale: number): void {
      // eigene Zufallsfolge für die Darstellung, damit der Zerfallsverlauf reproduzierbar bleibt
      let a = vis() * TAU;
      const speed = (kind === 'a' ? 150 : kind === 'b' ? 290 : 420) * scale;
      let range = kind === 'a' ? (G ? G.dishR * 1.2 : 220 * scale) : 4000;
      let hit: number | null = null;
      if (G && !one) {
        const [ax, ay, bx, by] = G.win;
        // Ein Teil der Teilchen fliegt ins Fenster (im echten Versuch liegt das Zählrohr dicht über dem Präparat)
        if (vis() < EFF) {
          const k = vis();
          a = Math.atan2(ay + (by - ay) * k - y, ax + (bx - ax) * k - x);
        }
        const d = raySegment(x, y, Math.cos(a), Math.sin(a), ax, ay, bx, by);
        if (d !== null) {
          hit = d;
          range = Math.max(range, d + 1);
        }
      }
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      if (emissions.length >= MAX_EMISSIONS || prefersReducedMotion()) {
        if (hit !== null) registerPulse();
        return;
      }
      emissions.push({ x, y, dx, dy, kind, t0: performance.now(), speed, range, hit, done: false, one });
    }

    function registerPulse(): void {
      pulses++;
      pulseU.push(u);
      if (pulseU.length > 4000) pulseU = pulseU.slice(-2000);
      ledMs = performance.now();
      winMs = ledMs;
      click();
    }

    function onDecay(i: number): void {
      decayU[i] = u;
      decayMs[i] = performance.now();
      const G = lastGeo;
      if (!G || mode() !== 'many') return;
      const x = nx(G, i);
      const y = ny(G, i);
      const nu = nuc();
      emit(x, y, nu.kind === 'alpha' ? 'a' : 'b', false, G, G.sm ? 0.8 : 1);
      if (nu.gamma) emit(x, y, 'g', false, G, G.sm ? 0.8 : 1);
    }

    function stepOnce(): void {
      if (finished) return;
      stepIdx++;
      u = stepIdx * H;
      const dec = stepDecay(alive, P_STEP, rand);
      if (dec.length) {
        N -= dec.length;
        const b = Math.floor((stepIdx - 1) / BIN_STEPS);
        if (b < bins.length) bins[b]! += dec.length;
        for (const i of dec) onDecay(i);
      }
      if (stepIdx % SAMPLE_EVERY === 0) samples.push({ u, N });
      if (N === 0 || u >= U_END - 1e-9) {
        finished = true;
        if (stepIdx % SAMPLE_EVERY !== 0) samples.push({ u, N });
        queueMicrotask(() => ctx.clock.pause());
      }
    }

    function tickMany(dt: number): void {
      if (intro.running || refill.running || finished) return;
      stepper.run(dt / p.tl, () => stepOnce(), 4000);
    }

    /* ---------- Zustand: einzelner Kern ---------- */
    let oneSeed = 5;
    let randOne = seededRandom(oneSeed);
    let lives: number[] = [];
    let flyers: Flyer[] = [];
    let single = { k: 1, steps: 0, alive: true, life: 0, decMs: -1e9, bornMs: -1e9 };
    const oneStepper = new FixedStepper(H);
    /** Nukleonen des gezeichneten Kerns (schematisch): Lage auf der Kugel, Proton? */
    let nucleons: { x: number; y: number; z: number; pr: boolean }[] = [];
    let nucleonKey = '';
    const swapNucleon = { idx: -1 };
    let alphaIdx: number[] = [];

    function buildNucleons(nu: Nuclide): void {
      const key = nu.id;
      if (key === nucleonKey) return;
      nucleonKey = key;
      const K = clamp(Math.round(nu.A ** 0.85), 14, 58);
      const r = seededRandom(nu.A * 13 + nu.Z);
      const pts: { x: number; y: number; z: number; pr: boolean }[] = [];
      // Kugelpackung: Punkte zufällig, dann auseinanderschieben
      for (let i = 0; i < K; i++) {
        const t = r() * TAU;
        const c = 2 * r() - 1;
        const rad = Math.cbrt(r());
        const s = Math.sqrt(1 - c * c);
        pts.push({ x: rad * s * Math.cos(t), y: rad * s * Math.sin(t), z: rad * c, pr: false });
      }
      const d0 = 1.6 / Math.cbrt(K);
      for (let it = 0; it < 60; it++) {
        for (let i = 0; i < K; i++)
          for (let j = i + 1; j < K; j++) {
            const a = pts[i]!;
            const b = pts[j]!;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const dz = b.z - a.z;
            const d = Math.hypot(dx, dy, dz) || 1e-6;
            if (d < d0) {
              const f = ((d0 - d) / d) * 0.5;
              a.x -= dx * f;
              a.y -= dy * f;
              a.z -= dz * f;
              b.x += dx * f;
              b.y += dy * f;
              b.z += dz * f;
            }
          }
        for (const q of pts) {
          const l = Math.hypot(q.x, q.y, q.z);
          if (l > 1) {
            q.x /= l;
            q.y /= l;
            q.z /= l;
          }
        }
      }
      const protons = Math.round((K * nu.Z) / nu.A);
      const order = pts.map((_, i) => i).sort(() => r() - 0.5);
      for (let i = 0; i < protons; i++) pts[order[i]!]!.pr = true;
      nucleons = pts;
      // α-Teilchen: 2 Protonen und 2 Neutronen am Rand in Richtung rechts oben
      const outer = pts.map((q, i) => ({ i, s: q.x * 0.7 - q.y * 0.7 + q.z * 0.2, pr: q.pr })).sort((a, b) => b.s - a.s);
      const pa = outer.filter((q) => q.pr).slice(0, 2).map((q) => q.i);
      const na = outer.filter((q) => !q.pr).slice(0, 2).map((q) => q.i);
      alphaIdx = [...pa, ...na];
      swapNucleon.idx = outer.find((q) => !q.pr)?.i ?? -1;
    }

    function startSingle(): void {
      single = { k: lives.length + 1, steps: 0, alive: true, life: 0, decMs: -1e9, bornMs: performance.now() };
      oneStepper.reset();
    }

    let lastOneCenter: [number, number, number] = [0, 0, 1];
    function decaySingle(): void {
      single.alive = false;
      single.life = single.steps * H;
      single.decMs = performance.now();
      if (lives.length < MAX_LIVES) lives.push(single.life);
      const [x, y, s] = lastOneCenter;
      flyers.push({ life: single.life, t0: performance.now() + 500, x, y });
      const nu = nuc();
      const dir = nu.kind === 'alpha' ? -Math.PI / 4 : -Math.PI / 5;
      emissions.push({ x, y, dx: Math.cos(dir), dy: Math.sin(dir), kind: nu.kind === 'alpha' ? 'a' : 'b', t0: performance.now(), speed: 230 * s, range: 4000, hit: null, done: false, one: true });
      if (nu.gamma) emissions.push({ x, y, dx: Math.cos(dir + 2.2), dy: Math.sin(dir + 2.2), kind: 'g', t0: performance.now(), speed: 380 * s, range: 4000, hit: null, done: false, one: true });
      click();
      updateStats();
    }

    function tickOne(dt: number): void {
      if (intro.running) return;
      if (single.alive) {
        oneStepper.run(dt / p.tl, () => {
          if (!single.alive) return;
          single.steps++;
          if (randOne() < P_STEP) decaySingle();
        }, 4000);
      } else if (performance.now() - single.decMs > 1900) startSingle();
    }

    function batch(): void {
      const now = performance.now();
      const [x, y] = lastOneCenter;
      const rm = prefersReducedMotion();
      for (let k = 0; k < 100 && lives.length < MAX_LIVES; k++) {
        const life = simulateLifetime(P_STEP, H, randOne);
        lives.push(life);
        if (!rm) flyers.push({ life, t0: now + k * 14, x, y });
      }
      if (flyers.length > 400) flyers = flyers.slice(-400);
      updateStats();
    }

    /* ---------- Ton (Web Audio, erst nach Bedienung) ---------- */
    let audio: AudioContext | null = null;
    let noise: AudioBuffer | null = null;
    let clicksThisFrame = 0;
    function ensureAudio(): void {
      try {
        if (!audio) {
          audio = new AudioContext();
          const len = Math.round(audio.sampleRate * 0.004);
          noise = audio.createBuffer(1, len, audio.sampleRate);
          const d = noise.getChannelData(0);
          const r = seededRandom(3);
          for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * (1 - i / len) ** 2;
        }
        if (audio.state === 'suspended') void audio.resume();
      } catch {
        audio = null;
      }
    }
    function click(): void {
      if (!p.snd || !audio || !noise || audio.state !== 'running' || clicksThisFrame > 5) return;
      clicksThisFrame++;
      const src = audio.createBufferSource();
      src.buffer = noise;
      const hp = audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1500;
      const gain = audio.createGain();
      gain.gain.value = 0.5;
      src.connect(hp);
      hp.connect(gain);
      gain.connect(audio.destination);
      src.start();
    }

    /* ---------- Zeichnen: Hintergrund und Gleichung ---------- */
    function drawBench(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#172030' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0f1621' : '#dde4ec');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
      const gl = g.createRadialGradient(r.x + r.w * 0.35, r.y + r.h * 0.3, 10, r.x + r.w * 0.35, r.y + r.h * 0.3, Math.max(r.w, r.h) * 0.8);
      gl.addColorStop(0, dark ? 'rgba(120,160,220,0.08)' : 'rgba(255,255,255,0.75)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, r.h);
      // feines Punktraster der Labormatte
      g.fillStyle = dark ? 'rgba(255,255,255,0.035)' : 'rgba(30,50,80,0.05)';
      for (let y = r.y + 10; y < r.y + r.h; y += 16) for (let x = r.x + 10 + ((y / 16) % 2) * 8; x < r.x + r.w; x += 16) g.fillRect(x, y, 1.5, 1.5);
    }

    function drawEqCard(G: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const R = G.eq;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * -10);
      card(R);
      const nu = nuc();
      const eqA = ease2('eqA', 1, 6);
      const sm = G.sm;
      const kindLab = ctx.t(nu.kind === 'alpha' ? 'alpha' : 'beta') + (nu.gamma ? ' + γ' : '');
      const kc = nu.kind === 'alpha' ? alphaCol() : betaCol();
      const kSize = sm ? 11 : 12;
      const hlText = tr('halfLife', { t: ctx.hidden ? '?' : halfLifeStr(nu) });
      const rightW = Math.max(pillWidth(kindLab, kSize), textW(hlText, `600 ${sm ? 11 : 12}px ${theme.font}`) + 4);
      const padX = sm ? 10 : 14;
      let size = sm ? 18 : 22;
      const counts: [string, string] | null = mode() === 'many' ? [String(N), String(count - N)] : null;
      const avail = R.w - 2 * padX - rightW - 10;
      for (let k = 0; k < 8 && equation(0, 0, size, nu, null, false) > avail; k++) size -= 1.5;
      const eqY = R.y + (counts ? R.h * 0.38 : R.h / 2);
      g.save();
      g.globalAlpha *= eqA;
      equation(R.x + padX, eqY, size, nu, counts, true);
      g.restore();
      const rx = R.x + R.w - padX;
      const third = !sm && R.h > 60;
      const ky = R.y + (third ? 8 : 9);
      pill(rx, ky, kindLab, kc, 'right', kSize);
      text(g, hlText, rx - 2, ky + kSize + 11 + (sm ? 10 : 11), { font: `700 ${sm ? 11 : 12}px ${theme.font}`, color: theme.text, align: 'right' });
      if (third && !ctx.hidden) text(g, tr('lapse', { t: lapseStr(nu) }), rx - 2, ky + kSize + 11 + 26, { font: `600 11px ${theme.font}`, color: theme.muted, align: 'right' });
      g.restore();
    }

    /* ---------- Zeichnen: Schale, Kerne, Zählrohr ---------- */
    function drawDish(G: Geo, ik: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const { cx, cy, dishR } = G;
      g.save();
      g.globalAlpha *= ik;
      // Halter (Metall) mit weichem Schatten
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 6;
      const met = g.createLinearGradient(cx - dishR, cy - dishR, cx + dishR, cy + dishR);
      met.addColorStop(0, dark ? '#9aa4b1' : '#f5f7fa');
      met.addColorStop(0.5, dark ? '#5d6672' : '#aab3be');
      met.addColorStop(1, dark ? '#323944' : '#6f7884');
      g.fillStyle = met;
      g.beginPath();
      g.arc(cx, cy, dishR, 0, TAU);
      g.fill();
      g.restore();
      // Vertiefung mit dem Präparat
      const ring = dishR - G.R - 4;
      const inner = dishR - ring;
      const tray = g.createRadialGradient(cx - inner * 0.25, cy - inner * 0.3, inner * 0.1, cx, cy, inner);
      tray.addColorStop(0, dark ? '#273142' : '#3d4858');
      tray.addColorStop(1, dark ? '#121821' : '#1f2630');
      g.fillStyle = tray;
      g.beginPath();
      g.arc(cx, cy, inner, 0, TAU);
      g.fill();
      // Innenschatten am Rand
      const sh = g.createRadialGradient(cx, cy, inner * 0.82, cx, cy, inner);
      sh.addColorStop(0, 'rgba(0,0,0,0)');
      sh.addColorStop(1, 'rgba(0,0,0,0.45)');
      g.fillStyle = sh;
      g.beginPath();
      g.arc(cx, cy, inner, 0, TAU);
      g.fill();
      // Lichtkante
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, dishR - 1, Math.PI * 1.05, Math.PI * 1.65);
      g.stroke();
      // Strahlenwarnzeichen auf dem Rand (klein)
      const tx = cx + Math.cos(2.35) * (dishR - ring / 2);
      const ty = cy + Math.sin(2.35) * (dishR - ring / 2);
      const tr3 = ring * 0.42;
      if (tr3 > 2.5) {
        g.fillStyle = dark ? '#e7c060' : '#f2c94c';
        g.beginPath();
        g.arc(tx, ty, tr3 + 1.2, 0, TAU);
        g.fill();
        g.fillStyle = '#1b1f25';
        for (let k = 0; k < 3; k++) {
          const a0 = -Math.PI / 2 + (k * TAU) / 3 - 0.5;
          g.beginPath();
          g.moveTo(tx, ty);
          g.arc(tx, ty, tr3, a0, a0 + 1);
          g.closePath();
          g.fill();
        }
        g.fillStyle = dark ? '#e7c060' : '#f2c94c';
        g.beginPath();
        g.arc(tx, ty, tr3 * 0.3, 0, TAU);
        g.fill();
        g.fillStyle = '#1b1f25';
        g.beginPath();
        g.arc(tx, ty, tr3 * 0.18, 0, TAU);
        g.fill();
      }
      g.restore();
    }

    function drawNuclei(G: Geo, ik: number): void {
      const g = surface.g;
      const now = performance.now();
      const mc = motherCol();
      const dc = daughterCol();
      const flashCol = ctx.theme.dark ? '#fff2c2' : '#fff6d6';
      const rb = G.rb;
      const cnt = count;
      g.save();
      g.globalAlpha *= ik;
      for (let i = 0; i < cnt; i++) {
        const x = nx(G, i);
        const y = ny(G, i);
        let sc = 1;
        if (intro.running) sc = ease.outBack(clamp((intro.t - 0.08 - (i / cnt) * 0.45) / 0.3, 0, 1));
        else if (refill.running) sc = ease.outBack(clamp((refill.t - (i / cnt) * 0.6) / 0.35, 0, 1));
        if (sc <= 0.01) continue;
        if (alive[i]) {
          drawBall(mc, x, y, rb, sc);
          continue;
        }
        const age = (now - decayMs[i]!) / 650;
        if (age >= 1) {
          drawBall(dc, x, y, rb, sc);
          continue;
        }
        animating = true;
        const k = ease.outCubic(clamp(age, 0, 1));
        drawBall(dc, x, y, rb, sc * (1 + 0.35 * (1 - k)), k);
        drawBall(mc, x, y, rb, sc * (1 + 0.5 * (1 - k)), 1 - k);
      }
      // Lichtblitze der zerfallenden Kerne
      g.globalCompositeOperation = ctx.theme.dark ? 'lighter' : 'source-over';
      for (let i = 0; i < cnt; i++) {
        if (alive[i]) continue;
        const age = (now - decayMs[i]!) / 520;
        if (age >= 1) continue;
        const a = 1 - age;
        drawGlow(flashCol, nx(G, i), ny(G, i), Math.max(8, rb * 5) * (0.6 + 0.6 * age), a * a);
      }
      g.restore();
    }

    /** Fliegende Teilchen und γ-Wellenpakete. */
    function drawEmissions(clip: Rect, one: boolean): void {
      const g = surface.g;
      const now = performance.now();
      g.save();
      g.beginPath();
      g.rect(clip.x, clip.y, clip.w, clip.h);
      g.clip();
      for (const e of emissions) {
        if (e.one !== one || e.done) continue;
        const d = ((now - e.t0) / 1000) * e.speed;
        const stop = e.hit ?? e.range;
        if (e.hit !== null && d >= e.hit) {
          e.done = true;
          if (!e.one) registerPulse();
          continue;
        }
        const x = e.x + e.dx * Math.min(d, stop);
        const y = e.y + e.dy * Math.min(d, stop);
        if (d > e.range || x < clip.x - 30 || x > clip.x + clip.w + 30 || y < clip.y - 30 || y > clip.y + clip.h + 30) {
          e.done = true;
          continue;
        }
        animating = true;
        const fade = e.kind === 'a' ? clamp(1 - (d / e.range - 0.7) / 0.3, 0, 1) : 1;
        const col = kindCol(e.kind);
        const big = one ? 1.7 : 1;
        if (e.kind === 'g') {
          // Wellenpaket senkrecht zur Flugrichtung schwingend
          const Lw = 26 * big;
          g.strokeStyle = withAlpha(col, 0.9 * fade);
          g.lineWidth = 1.8 * big;
          g.lineCap = 'round';
          g.beginPath();
          for (let k = 0; k <= 24; k++) {
            const s = (k / 24) * Lw;
            const env = Math.sin((Math.PI * k) / 24);
            const off = Math.sin(s * 0.9 - d * 0.3) * 4 * big * env;
            const px = x - e.dx * s - e.dy * off;
            const py = y - e.dy * s + e.dx * off;
            if (k) g.lineTo(px, py);
            else g.moveTo(px, py);
          }
          g.stroke();
          continue;
        }
        // Leuchtspur
        const tail = Math.min(d, (e.kind === 'a' ? 14 : 22) * big);
        const grd = g.createLinearGradient(x, y, x - e.dx * tail, y - e.dy * tail);
        grd.addColorStop(0, withAlpha(col, 0.55 * fade));
        grd.addColorStop(1, withAlpha(col, 0));
        g.strokeStyle = grd;
        g.lineWidth = (e.kind === 'a' ? 5 : 3) * big;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - e.dx * tail, y - e.dy * tail);
        g.stroke();
        if (e.kind === 'a') {
          // Heliumkern: zwei Protonen, zwei Neutronen
          const s = 2.3 * big;
          const nc = mixColor(ctx.theme.muted, '#c9d1dc', 0.4);
          drawBall(col, x - s * 0.7, y - s * 0.5, s, 1, fade);
          drawBall(nc, x + s * 0.7, y - s * 0.4, s, 1, fade);
          drawBall(nc, x - s * 0.6, y + s * 0.65, s, 1, fade);
          drawBall(col, x + s * 0.65, y + s * 0.6, s, 1, fade);
        } else drawBall(col, x, y, 2.4 * big, 1, fade);
      }
      emissions = emissions.filter((e) => !e.done);
      g.restore();
    }

    function drawTube(G: Geo, ik: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const { wx, wy, ux, uy, len, tr } = G;
      const now = performance.now();
      const flash = clamp(1 - (now - winMs) / 260, 0, 1);
      if (flash > 0) animating = true;
      g.save();
      g.globalAlpha *= ik;
      // Kabel vom Rohrende zum Zähler
      const ex = wx + ux * (len + 6);
      const ey = wy + uy * (len + 6);
      const bx = G.box.x + G.box.w * 0.5;
      const by = G.box.y + 2;
      const cable = (w: number, c: string) => {
        g.strokeStyle = c;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(ex, ey);
        g.bezierCurveTo(ex + ux * 30, ey + uy * 30 + 10, bx + 10, by - 40, bx, by);
        g.stroke();
      };
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 3;
      cable(G.sm ? 4 : 5, dark ? '#0b0e13' : '#2b3038');
      g.restore();
      cable(1.2, 'rgba(255,255,255,0.18)');
      // Rohr im eigenen Koordinatensystem (x nach außen)
      g.translate(wx, wy);
      g.rotate(Math.atan2(uy, ux));
      const photo = ctx.images.get('tube');
      if (photo) drawTubePhoto(photo, len, tr);
      else {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.32)';
        g.shadowBlur = 12;
        g.shadowOffsetY = 5;
        const body = g.createLinearGradient(0, -tr, 0, tr);
        body.addColorStop(0, dark ? '#c4ccd6' : '#f3f5f8');
        body.addColorStop(0.35, dark ? '#8d96a3' : '#c3cad3');
        body.addColorStop(1, dark ? '#3f4651' : '#6f7884');
        g.fillStyle = body;
        roundRect(g, 0, -tr, len, 2 * tr, tr * 0.5);
        g.fill();
        g.restore();
        // Rillen und Endkappe
        g.fillStyle = dark ? 'rgba(0,0,0,0.3)' : 'rgba(40,50,64,0.22)';
        for (const x of [len * 0.62, len * 0.66]) g.fillRect(x, -tr, 1.5, 2 * tr);
        const capG = g.createLinearGradient(0, -tr, 0, tr);
        capG.addColorStop(0, dark ? '#4a515c' : '#4d5562');
        capG.addColorStop(1, dark ? '#1c2027' : '#262b33');
        g.fillStyle = capG;
        roundRect(g, len - tr * 0.6, -tr * 0.8, tr * 1.2, tr * 1.6, 3);
        g.fill();
        // Fenster (Glimmer) vorn
        const win = g.createLinearGradient(0, -tr, 0, tr);
        win.addColorStop(0, '#3b3a35');
        win.addColorStop(1, '#16150f');
        g.fillStyle = win;
        roundRect(g, -3, -tr * 0.92, 7, tr * 1.84, 3);
        g.fill();
      }
      if (flash > 0) {
        g.globalCompositeOperation = dark ? 'lighter' : 'source-over';
        drawGlow(mixColor(actCol(), '#ffffff', 0.35), 0, 0, tr * 2.2, flash * 0.9);
        g.globalCompositeOperation = 'source-over';
      }
      if (!photo) {
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.fillRect(-1.5, -tr * 0.7, 1.4, tr * 0.6);
      }
      // Beschriftung auf dem Rohr
      const fs = G.sm ? 10.5 : 11.5;
      if (len > textW(ctx.t('tube'), `700 ${fs}px ${ctx.theme.font}`) + 14) text(g, ctx.t('tube'), len * 0.33, 0.5, { font: `700 ${fs}px ${ctx.theme.font}`, color: dark ? '#1a1f26' : '#2c333d' });
      g.restore();
    }

    /**
     * Zählrohr-Foto (zaehlrohr.webp, 1600 × 181): Fenster links, Ende des Rohrs vor
     * der Endkappe, Kappenende (dort beginnt das Kabel) und Höhe des Rohrs (Bildpixel).
     */
    const TUBE_SRC = { win: 200, body: 1300, cap: 1440, top: 6, bottom: 174 };
    /**
     * Rohr im eigenen Koordinatensystem (Fenster bei x = 0, Kabel bei x = len).
     * Das Foto ist schlanker als das Rohr im Aufbau: Fenster und Endkappe bleiben
     * maßstabsgetreu, nur das gleichförmige Mittelstück wird in der Länge gestaucht.
     */
    function drawTubePhoto(img: HTMLImageElement, len: number, tr: number): void {
      const g = surface.g;
      const T = TUBE_SRC;
      const k = (2 * tr) / (T.bottom - T.top);
      const h = img.height * k;
      const y = -img.height * k * 0.5;
      const winW = T.win * k;
      const endW = (img.width - T.body) * k;
      const endX = len - (T.cap - T.body) * k;
      const piece = (sx: number, sw: number, dx: number, dw: number) => {
        if (dw <= 0) return;
        g.drawImage(scaledSprite(img, dw, h, surface.dpr, { crop: { x: sx, y: 0, w: sw, h: img.height } }), dx, y, dw, h);
      };
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.32)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 5;
      piece(T.win, T.body - T.win, winW - 0.5, endX - winW + 1);
      piece(0, T.win, 0, winW);
      piece(T.body, img.width - T.body, endX, endW);
      g.restore();
    }

    /** Zählrate der letzten halben Halbwertszeit als Text (oder „keine“). */
    function rateText(): string {
      const nu = nuc();
      const W = Math.min(0.5, u);
      if (W > 0.05 && mode() === 'many') {
        let k = 0;
        for (let i = pulseU.length - 1; i >= 0 && pulseU[i]! > u - W; i--) k++;
        const z = k / (W * nu.halfLife);
        return tr('rate', { z: sig(z, 2), u: rateUnit(nu) });
      }
      return ctx.t('rateNone');
    }

    /**
     * Zählgerät als Foto: Ziffern und Zählrate stehen im leeren Anzeigefenster,
     * der rote Knopf leuchtet bei jedem Impuls auf, der Schiebeschalter schaltet
     * den Lautsprecher (Symbol daneben).
     */
    function drawCounterPhoto(img: HTMLImageElement, B: Rect, now: number): void {
      const g = surface.g;
      const C = COUNTER_SRC;
      const sm = lastGeo?.sm ?? false;
      const k = Math.min(B.w / img.width, B.h / img.height);
      const w = img.width * k;
      const h = img.height * k;
      const x0 = B.x + (B.w - w) / 2;
      const y0 = B.y + B.h - h;
      const P = (x: number, y: number): [number, number] => [x0 + x * k, y0 + y * k];
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 5;
      g.drawImage(scaledSprite(img, w, h, surface.dpr), x0, y0, w, h);
      g.restore();
      // Anzeigefenster: oben die Ziffern, darunter klein die Zählrate
      const [dx, dy] = P(C.winX0, C.winY0);
      const D: Rect = { x: dx, y: dy, w: (C.winX1 - C.winX0) * k, h: (C.winY1 - C.winY0) * k };
      const digits = String(Math.min(99999, pulses)).padStart(sm ? 4 : 5, '0');
      const dh = D.h * 0.62;
      const fsD = Math.min(dh * 0.8, (D.w - 10) / (digits.length * 0.62));
      g.save();
      g.shadowColor = 'rgba(90,255,160,0.7)';
      g.shadowBlur = 6;
      text(g, digits, D.x + D.w / 2, D.y + dh * 0.55, { font: `700 ${fsD}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`, color: '#7dffb5' });
      g.restore();
      const rate = rateText();
      let fsR = Math.min(D.h * 0.24, sm ? 10.5 : 11.5);
      let rl = rate;
      if (textW(rl, `600 ${fsR}px ${ctx.theme.font}`) > D.w - 8) rl = rate.replace(/ pro | per /, '/');
      const rw = textW(rl, `600 ${fsR}px ${ctx.theme.font}`);
      if (rw > D.w - 8) fsR = Math.max(8, (fsR * (D.w - 8)) / rw);
      text(g, rl, D.x + D.w / 2, D.y + D.h * 0.8, { font: `600 ${fsR}px ${ctx.theme.font}`, color: 'rgba(125,255,181,0.85)' });
      // roter Knopf als Impulsanzeige
      const led = clamp(1 - (now - ledMs) / 180, 0, 1);
      if (led > 0) {
        animating = true;
        const [lx, ly] = P(C.btnX, C.btnY);
        drawGlow('#ff5050', lx, ly, C.btnR * k * 1.8, led);
      }
      // Lautsprecher: Schalter und Symbol rechts daneben
      const [swx, swy] = P(C.swX, C.swY);
      const [spx] = P(C.spkX, 0);
      spkRect = { x: swx - (C.swW / 2) * k, y: swy - (C.swH / 2) * k, w: spx + 8 - (swx - (C.swW / 2) * k), h: C.swH * k };
      const sx = spx;
      const ry = swy;
      g.strokeStyle = p.snd ? '#d9dee5' : 'rgba(217,222,229,0.45)';
      g.fillStyle = g.strokeStyle;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(sx - 4, ry - 2.2);
      g.lineTo(sx - 1.8, ry - 2.2);
      g.lineTo(sx + 1.5, ry - 5);
      g.lineTo(sx + 1.5, ry + 5);
      g.lineTo(sx - 1.8, ry + 2.2);
      g.lineTo(sx - 4, ry + 2.2);
      g.closePath();
      g.fill();
      if (!p.snd) {
        g.beginPath();
        g.moveTo(sx - 5, ry - 6);
        g.lineTo(sx + 4, ry + 6);
        g.stroke();
      }
    }

    function drawCounter(G: Geo, ik: number): void {
      const g = surface.g;
      const B = G.box;
      const theme = ctx.theme;
      const dark = theme.dark;
      const now = performance.now();
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 12);
      const photo = ctx.images.get('counter');
      if (photo) {
        drawCounterPhoto(photo, B, now);
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 5;
      const body = g.createLinearGradient(0, B.y, 0, B.y + B.h);
      body.addColorStop(0, dark ? '#3a424e' : '#4a5361');
      body.addColorStop(1, dark ? '#20252d' : '#2b3139');
      g.fillStyle = body;
      roundRect(g, B.x, B.y, B.w, B.h, 9);
      g.fill();
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.lineWidth = 1;
      roundRect(g, B.x + 0.5, B.y + 0.5, B.w - 1, B.h - 1, 9);
      g.stroke();
      // Anzeige
      const sm = G.sm;
      const D: Rect = { x: B.x + 7, y: B.y + 7, w: B.w - 14, h: B.h * (sm ? 0.52 : 0.5) };
      g.fillStyle = '#0c1410';
      roundRect(g, D.x, D.y, D.w, D.h, 5);
      g.fill();
      const digits = String(Math.min(99999, pulses)).padStart(sm ? 4 : 5, '0');
      const fsD = Math.min(D.h * 0.72, (D.w - 10) / (digits.length * 0.62));
      const df = `700 ${fsD}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      g.save();
      g.shadowColor = 'rgba(90,255,160,0.7)';
      g.shadowBlur = 6;
      text(g, digits, D.x + D.w / 2, D.y + D.h / 2 + 1, { font: df, color: '#7dffb5' });
      g.restore();
      // Zählrate
      const rate = rateText();
      const ry = D.y + D.h + (B.y + B.h - D.y - D.h) / 2;
      const fsR = sm ? 10.5 : 11.5;
      // Platz bis vor den Lautsprecher (B.w − 34) freihalten; zu lang (z. B. „≈ 7.2 per 10⁹ years“):
      // zweizeilig nach „pro“/„per“, erst dann kleiner
      const avail = B.w - 47;
      const rf = (fs: number) => `600 ${fs}px ${theme.font}`;
      let lines = [rate];
      let fsR2 = fsR;
      if (textW(rate, rf(fsR)) > avail) {
        // Deutsch: „≈ 7,2/10⁹ a“ ist üblich und passt in eine Zeile
        if (ctx.lang === 'de') lines = [rate.replace(' pro ', '/')];
        const m = ctx.lang === 'de' ? null : /^(.*? per) (.+)$/.exec(rate);
        if (m) {
          lines = [m[1]!, m[2]!];
          fsR2 = Math.min(fsR, (B.y + B.h - D.y - D.h - 4) / 2.3);
        }
        const lw = Math.max(...lines.map((l) => textW(l, rf(fsR2))));
        if (lw > avail) fsR2 = Math.max(8.5, (fsR2 * avail) / lw);
      }
      lines.forEach((l, i) => text(g, l, B.x + 9, ry + (i - (lines.length - 1) / 2) * fsR2 * 1.15, { font: rf(fsR2), color: '#d9dee5', align: 'left' }));
      // Leuchtdiode und Lautsprecher
      const led = clamp(1 - (now - ledMs) / 180, 0, 1);
      if (led > 0) animating = true;
      const lx = B.x + B.w - 12;
      g.fillStyle = led > 0 ? mixColor('#5a1d1d', '#ff4d4d', led) : '#5a1d1d';
      g.beginPath();
      g.arc(lx, ry, 3.6, 0, TAU);
      g.fill();
      if (led > 0) drawGlow('#ff5050', lx, ry, 10, led);
      spkRect = { x: B.x + B.w - 34, y: ry - 9, w: 18, h: 18 };
      const sx = B.x + B.w - 26;
      g.strokeStyle = p.snd ? '#d9dee5' : 'rgba(217,222,229,0.45)';
      g.fillStyle = g.strokeStyle;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(sx - 4, ry - 2.2);
      g.lineTo(sx - 1.8, ry - 2.2);
      g.lineTo(sx + 1.5, ry - 5);
      g.lineTo(sx + 1.5, ry + 5);
      g.lineTo(sx - 1.8, ry + 2.2);
      g.lineTo(sx - 4, ry + 2.2);
      g.closePath();
      g.fill();
      if (!p.snd) {
        g.beginPath();
        g.moveTo(sx - 5, ry - 6);
        g.lineTo(sx + 4, ry + 6);
        g.stroke();
      }
      g.restore();
    }
    let spkRect: Rect | null = null;
    /** Zählgerät-Foto: leeres Anzeigefenster, roter Knopf, Schiebeschalter, Platz für das Lautsprechersymbol (Bildpixel). */
    const COUNTER_SRC = { winX0: 140, winY0: 125, winX1: 1140, winY1: 470, btnX: 395, btnY: 660, btnR: 72, swX: 900, swY: 665, swW: 100, swH: 150, spkX: 1090 };

    function drawManyScene(r: Rect, alpha: number): Geo {
      const g = surface.g;
      const G = sceneGeo(r, count);
      lastGeo = G;
      const ik = stage(0, 0.45);
      g.save();
      g.globalAlpha *= alpha;
      drawDish(G, ik);
      drawNuclei(G, 1);
      drawTube(G, stage(0.25, 0.5));
      drawCounter(G, stage(0.35, 0.5));
      drawEmissions(r, false);
      // beobachteter Kern
      const theme = ctx.theme;
      const show = tracked >= 0 && tracked < count ? tracked : hoverNuc;
      if (show >= 0 && show < count) {
        const x = nx(G, show);
        const y = ny(G, show);
        const isT = show === tracked;
        const pulse = isT && alive[show] && !prefersReducedMotion() ? 0.5 + 0.5 * Math.sin(performance.now() / 220) : 0;
        if (pulse) animating = true;
        g.strokeStyle = isT ? theme.text : withAlpha(theme.text, 0.55);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x, y, G.rb + 4 + 2 * pulse, 0, TAU);
        g.stroke();
        if (isT) {
          const lab = alive[show] ? ctx.t('watching') : tr('watched', { u: fx(decayU[show]!, 2) });
          const size = G.sm ? 11 : 12;
          const w = pillWidth(lab, size);
          const lx = clamp(x - w / 2, r.x + 4, r.x + r.w - w - 4);
          const ly = y - G.rb - 32 < G.A.y ? y + G.rb + 8 : y - G.rb - 32;
          pill(lx, ly, lab, alive[show] ? motherCol() : theme.text, 'left', size);
        }
      }
      // Hinweise
      const fs = G.sm ? 11 : 11.5;
      const hintA = ease2('hintA', tracked < 0 && !finished ? 1 : 0, 4) * stage(0.6, 0.4);
      if (hintA > 0.01) {
        g.save();
        g.globalAlpha *= hintA;
        const hint = ctx.t(G.sm ? 'tapHintS' : 'tapHint');
        const hw = textW(hint, `600 ${fs}px ${theme.font}`);
        const hx = Math.max(G.A.x + 2, Math.min(G.cx - hw / 2, G.box.x - hw - 10));
        haloText(hint, hx, Math.min(G.cy + G.dishR + 12, G.A.y + G.A.h - 6), `600 ${fs}px ${theme.font}`, theme.muted, 'left');
        g.restore();
      }
      const doneA = ease2('doneA', finished ? 1 : 0, 5);
      if (doneA > 0.01) {
        g.save();
        g.globalAlpha *= doneA;
        const lab = ctx.t(N === 0 ? (G.sm ? 'allDoneS' : 'allDone') : G.sm ? 'doneS' : 'done');
        const w = pillWidth(lab, fs);
        pill(clamp(G.cx - w / 2, r.x + 4, r.x + r.w - w - 4), G.cy - 12, lab, theme.text, 'left', fs);
        g.restore();
      }
      g.restore();
      return G;
    }

    /* ---------- Zeichnen: einzelner Kern ---------- */
    let oneTap: [number, number, number] | null = null;
    function drawOneScene(r: Rect, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const G = sceneGeo(r, 1);
      const A = G.A;
      const nu = nuc();
      buildNucleons(nu);
      const now = performance.now();
      const ringR = Math.min(A.w * 0.4, A.h * 0.36);
      const cx = A.x + A.w / 2;
      const cy = A.y + A.h * 0.44;
      const sc = ringR / 120;
      lastOneCenter = [cx, cy, clamp(sc, 0.6, 1.4)];
      oneTap = [cx, cy, ringR];
      g.save();
      g.globalAlpha *= alpha;
      // Lichtkegel
      const spot = g.createRadialGradient(cx, cy, ringR * 0.2, cx, cy, ringR * 1.35);
      spot.addColorStop(0, theme.dark ? 'rgba(255,190,120,0.10)' : 'rgba(255,255,255,0.85)');
      spot.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = spot;
      g.beginPath();
      g.arc(cx, cy, ringR * 1.35, 0, TAU);
      g.fill();
      // Stoppuhr-Ring: eine Umdrehung = eine Halbwertszeit
      const ik = stage(0.05, 0.5);
      const uNow = single.alive ? single.steps * H : single.life;
      const decayed = !single.alive;
      const decA = ease2('oneDec', decayed ? 1 : 0, 7);
      g.save();
      g.globalAlpha *= ik;
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(20,40,70,0.08)';
      g.lineWidth = 10;
      g.beginPath();
      g.arc(cx, cy, ringR, 0, TAU);
      g.stroke();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1.2;
      g.beginPath();
      for (let k = 0; k < 20; k++) {
        const a = -Math.PI / 2 + (k * TAU) / 20;
        const r0 = ringR + 8;
        const r1 = ringR + (k % 5 === 0 ? 14 : 11);
        g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      }
      g.stroke();
      const turns = Math.floor(uNow);
      const frac = uNow - turns;
      const ringCol = mixColor(markCol(), actCol(), decA);
      if (turns > 0) {
        g.strokeStyle = withAlpha(ringCol, 0.28);
        g.lineWidth = 10;
        g.beginPath();
        g.arc(cx, cy, ringR, 0, TAU);
        g.stroke();
      }
      g.strokeStyle = ringCol;
      g.lineWidth = 10;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + frac * TAU);
      g.stroke();
      // Umläufe als Punkte
      for (let k = 0; k < Math.min(turns, 12); k++) {
        g.fillStyle = ringCol;
        g.beginPath();
        g.arc(cx - ((Math.min(turns, 12) - 1) * 9) / 2 + k * 9, cy + ringR + 24, 3.2, 0, TAU);
        g.fill();
      }
      text(g, '0', cx, cy - ringR - 22, { font: `700 ${G.sm ? 11 : 12}px ${theme.font}`, color: theme.muted });
      text(g, '½ T½', cx, cy + ringR - 22, { font: `600 ${G.sm ? 11 : 11.5}px ${theme.font}`, color: withAlpha(theme.muted, 0.8) });
      g.restore();
      // Kern aus Nukleonen (schematisch), leicht schwingend
      const born = clamp((now - single.bornMs) / 520, 0, 1);
      const pop = intro.running ? ease.outBack(clamp((intro.t - 0.1) / 0.45, 0, 1)) : ease.outBack(born);
      if (born < 1) animating = true;
      const K = nucleons.length;
      const Rc = ringR * 0.5;
      const rb = (Rc / Math.cbrt(K)) * 0.78;
      const t = prefersReducedMotion() ? 0 : now / 1000;
      if (!prefersReducedMotion() && (single.alive || decA < 1)) animating = true;
      const rot = t * 0.35;
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const pc = alphaCol();
      const ncol = mixColor(theme.muted, '#c9d1dc', 0.35);
      const flash = decayed ? clamp(1 - (now - single.decMs) / 700, 0, 1) : 0;
      const proj = nucleons.map((q, i) => {
        const x = q.x * cr + q.z * sr;
        const z = -q.x * sr + q.z * cr;
        const jig = single.alive ? Math.sin(t * 9 + i * 1.7) * 0.025 : 0;
        return { i, x: x + jig, y: q.y + jig * 0.6, z, pr: q.pr };
      });
      proj.sort((a, b) => a.z - b.z);
      const dir = nu.kind === 'alpha' ? -Math.PI / 4 : -Math.PI / 5;
      const leave = decayed ? ease.inCubic(clamp((now - single.decMs) / 900, 0, 1)) : 0;
      g.save();
      g.globalAlpha *= clamp(pop, 0, 1);
      for (const q of proj) {
        const isA = nu.kind === 'alpha' && decayed && alphaIdx.includes(q.i);
        if (isA && leave >= 1) continue;
        let x = cx + q.x * Rc * pop;
        let y = cy + q.y * Rc * pop;
        if (isA) {
          x += Math.cos(dir) * leave * ringR * 1.4;
          y += Math.sin(dir) * leave * ringR * 1.4;
        }
        const depth = 0.82 + 0.18 * (q.z + 1) / 2;
        let col = q.pr ? pc : ncol;
        if (nu.kind === 'beta' && q.i === swapNucleon.idx) col = mixColor(ncol, pc, decA);
        if (decayed) col = mixColor(col, daughterCol(), 0.45 * decA);
        drawBall(col, x, y, rb * depth, pop);
      }
      g.restore();
      if (flash > 0) {
        g.save();
        g.globalCompositeOperation = theme.dark ? 'lighter' : 'source-over';
        drawGlow(theme.dark ? '#fff2c2' : '#fff8e0', cx, cy, Rc * 2.4, flash * flash);
        g.restore();
      }
      drawEmissions(r, true);
      // Beschriftungen
      const fs = G.sm ? 11.5 : 12.5;
      const symW = nuclideSym(0, 0, String(nu.A), String(nu.Z), nu.symbol, G.sm ? 16 : 18, motherCol(), false);
      const sym = decayed ? nu.daughter : nu;
      const symCol = decayed ? (theme.dark ? mixColor(daughterCol(), '#ffffff', 0.25) : shade(daughterCol(), -0.25)) : motherCol();
      const sx = cx - symW / 2;
      const sy = cy - ringR - 44;
      if (sy > A.y + 6) nuclideSym(sx, sy, String(sym.A), String(sym.Z), sym.symbol, G.sm ? 16 : 18, symCol, true);
      const lab = decayed ? tr('decLab', { u: fx(single.life, 2) }) : tr(G.sm ? 'aliveLabS' : 'aliveLab', { k: String(single.k), u: fx(uNow, 2) });
      const w = pillWidth(lab, fs);
      const ly = Math.min(cy + ringR + 34, A.y + A.h - (fs + 11) - 22);
      pill(clamp(cx - w / 2, r.x + 4, r.x + r.w - w - 4), ly, lab, decayed ? actCol() : markCol(), 'left', fs, decayed ? actCol() : undefined);
      const hint = ctx.t(decayed ? 'nextHint' : G.sm ? 'oneHintS' : 'oneHint');
      text(g, hint, cx, Math.min(ly + fs + 24, A.y + A.h - 6), { font: `600 ${G.sm ? 11 : 11.5}px ${theme.font}`, color: theme.muted });
      g.restore();
    }

    /* ---------- Diagramme ---------- */
    let tabRects: { v: boolean; r: Rect }[] = [];
    let tabHover: boolean | null = null;
    function drawTabs(R: Rect, sm: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const size = sm ? 11 : 12;
      const h = size + 11;
      const labs: [boolean, string][] = [
        [false, ctx.t('lin')],
        [true, ctx.t('log')],
      ];
      let x = R.x + R.w - (sm ? 10 : 14);
      const y = R.y + (sm ? 8 : 10);
      tabRects = [];
      for (const [v, lab] of [...labs].reverse()) {
        const w = pillWidth(lab, size);
        x -= w;
        const on = ease2(`tab${v}`, p.log === v ? 1 : 0, 10);
        const col = mixColor(theme.dark ? '#18202b' : '#eef1f5', motherCol(), on * 0.92);
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        g.shadowBlur = 3 + 4 * on;
        g.shadowOffsetY = 1;
        g.fillStyle = col;
        roundRect(g, x, y, w, h, h / 2);
        g.fill();
        g.restore();
        if (tabHover === v && on < 0.5) {
          g.strokeStyle = withAlpha(motherCol(), 0.7);
          g.lineWidth = 1.5;
          roundRect(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, h / 2);
          g.stroke();
        }
        text(g, lab, x + w / 2, y + h / 2 + 0.5, { font: `${on > 0.5 ? 800 : 700} ${size}px ${theme.font}`, color: mixColor(theme.text, textOn(col, theme), on) });
        tabRects.push({ v, r: { x, y, w, h } });
        x -= 5;
      }
    }

    /** Achsenbeschriftung der Zeitachse in der Einheit des Nuklids. */
    function timeTicks(A: Rect, X: (uu: number) => number, xMax: number, fs: number, nu: Nuclide): void {
      const g = surface.g;
      const theme = ctx.theme;
      const tMax = xMax * nu.halfLife;
      const step = niceStep(tMax / (A.w < 240 ? 3 : 5));
      const title = tr('axisT', { u: unitLabel(nu) });
      const font = `${fs}px ${theme.font}`;
      const tw = textW(title, `600 ${fs}px ${theme.font}`);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let t = step; t < tMax - 1e-9; t += step) {
        const xx = Math.round(X(t / nu.halfLife)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      g.font = font;
      for (let t = 0; t < tMax + 1e-9; t += step) {
        const xx = X(t / nu.halfLife);
        const lab = group(n(t, step < 1 ? 1 : 0));
        if (t > 0 && xx + g.measureText(lab).width / 2 > A.x + A.w - tw - 8) continue;
        text(g, lab, xx, A.y + A.h + 11, { font, color: theme.muted });
      }
      text(g, title, A.x + A.w, A.y + A.h + 11, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
    }

    function axesFrame(A: Rect): void {
      const g = surface.g;
      g.strokeStyle = ctx.theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w + 4, A.y + A.h + 0.5);
      g.stroke();
    }

    function emptyNote(A: Rect, msg: string, fs: number, yFrac = 0.5): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `600 ${fs}px ${theme.font}`;
      const w = Math.min(A.w - 8, g.measureText(msg).width + 24);
      const y = A.y + A.h * yFrac - 13;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.92)';
      roundRect(g, A.x + A.w / 2 - w / 2, y, w, 26, 13);
      g.fill();
      text(g, msg, A.x + A.w / 2, y + 13.5, { font: g.font, color: theme.muted });
    }

    /** gemeinsamer Zeitbereich beider Diagramme (in Halbwertszeiten) */
    function xMaxU(): number {
      const target = clamp(Math.ceil(u + 0.6), 4, U_END);
      return ease2('xmax', target, 3);
    }

    function drawNChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 220;
      const fs = sm ? 11 : 11.5;
      const ty = R.y + (sm ? 19 : 22);
      drawTabs(R, sm);
      const tabsW = tabRects.length ? R.x + R.w - tabRects[tabRects.length - 1]!.r.x : 0;
      const title = ctx.t(R.w - tabsW < 250 ? 'chartNS' : 'chartN');
      text(g, title, R.x + 14, ty, { font: `700 ${sm ? 12.5 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      const nu = nuc();
      const padL = sm ? 40 : 46;
      const top = R.y + (sm ? 54 : 60);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 14 : 18), h: R.y + R.h - top - (sm ? 26 : 30) };
      if (A.w < 50 || A.h < 40) {
        g.restore();
        return;
      }
      const xMax = xMaxU();
      const s = ease2('logS', p.log ? 1 : 0, 5);
      const N0s = ease2('n0', count, 6);
      const yMaxLin = N0s * 1.06;
      const logTop = Math.log10(N0s * 1.4);
      const X = (uu: number) => A.x + (uu / xMax) * A.w;
      const Y = (v: number) => {
        const lin = v / yMaxLin;
        const lg = clamp(Math.log10(Math.max(v, 0.02)) / logTop, -0.08, 1);
        return A.y + A.h - A.h * ((1 - s) * lin + s * lg);
      };
      // Gitter: linear und logarithmisch blenden ineinander
      const font = `${fs}px ${theme.font}`;
      if (s < 0.99) {
        const st = niceStep(yMaxLin / (A.h < 140 ? 3 : 5));
        g.save();
        g.globalAlpha *= 1 - s;
        g.strokeStyle = theme.grid;
        g.lineWidth = 1;
        g.beginPath();
        for (let v = st; v < yMaxLin; v += st) {
          const yy = Math.round(Y(v)) + 0.5;
          g.moveTo(A.x, yy);
          g.lineTo(A.x + A.w, yy);
        }
        g.stroke();
        for (let v = 0; v < yMaxLin; v += st) if (Y(v) > A.y + 6) text(g, n(v, 0), A.x - 6, Y(v), { font, color: theme.muted, align: 'right' });
        g.restore();
      }
      if (s > 0.01) {
        g.save();
        g.globalAlpha *= s;
        g.strokeStyle = theme.grid;
        g.lineWidth = 1;
        g.beginPath();
        for (let d = 1; d <= 10000; d *= 10)
          for (let m = 1; m < 10; m++) {
            const v = d * m;
            if (Math.log10(v) > logTop) break;
            const yy = Math.round(Y(v)) + 0.5;
            if (m === 1) {
              g.moveTo(A.x, yy);
              g.lineTo(A.x + A.w, yy);
            }
          }
        g.stroke();
        g.strokeStyle = theme.gridMinor;
        g.beginPath();
        for (let d = 1; d <= 10000; d *= 10)
          for (let m = 2; m < 10; m++) {
            const v = d * m;
            if (Math.log10(v) > logTop) break;
            const yy = Math.round(Y(v)) + 0.5;
            g.moveTo(A.x, yy);
            g.lineTo(A.x + A.w, yy);
          }
        g.stroke();
        for (let d = 1; Math.log10(d) <= logTop; d *= 10) if (Y(d) > A.y + 6) text(g, n(d, 0), A.x - 6, Y(d), { font, color: theme.muted, align: 'right' });
        g.restore();
      }
      timeTicks(A, X, xMax, fs, nu);
      text(g, s > 0.5 ? (de ? 'N (log)' : 'N (log)') : 'N', A.x - padL + 10, A.y - 13, { font: `700 ${fs}px ${theme.font}`, color: motherCol(), align: 'left' });
      text(g, ctx.hidden ? `t = ${timeStr(u)}` : `t = ${timeStr(u)} = ${fx(u, 2)} T½`, A.x + A.w, A.y - 13, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      axesFrame(A);
      const reveal = stage(0.35, 0.8, ease.inOutCubic);
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 8, (A.w + 10) * reveal, A.h + 16);
      g.clip();
      // Halbwertszeit-Marken
      const theoA = ease2('theoA', p.theo ? 1 : 0, 6);
      const marks = ctx.t('marks').split('|');
      const fracs = ctx.t('fracs').split('|');
      for (let k = 1; k <= 3; k++) {
        const a = ease2(`mk${k}`, u >= k - 1e-9 && p.theo ? 1 : 0, 5) * theoA;
        if (a < 0.01 || k > xMax) continue;
        const mx = X(k);
        const my = Y(count / 2 ** k);
        const grow = ease.outCubic(a);
        g.save();
        g.globalAlpha *= a;
        g.strokeStyle = withAlpha(markCol(), 0.85);
        g.lineWidth = 1.4;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(mx, A.y + A.h);
        g.lineTo(mx, A.y + A.h - (A.y + A.h - my) * grow);
        g.moveTo(A.x, my);
        g.lineTo(A.x + (mx - A.x) * grow, my);
        g.stroke();
        g.setLineDash([]);
        const lf = `700 ${fs}px ${theme.font}`;
        haloText(marks[k - 1] ?? '', mx, A.y + A.h - 10, lf, markCol());
        haloText(fracs[k - 1] ?? '', mx + 7, my - 11, lf, markCol(), 'left');
        g.fillStyle = markCol();
        g.beginPath();
        g.arc(mx, my, 3.5, 0, TAU);
        g.fill();
        g.restore();
      }
      // Theoriekurve
      if (theoA > 0.01) {
        g.save();
        g.globalAlpha *= theoA;
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = sm ? 1.8 : 2.1;
        g.setLineDash([7, 5]);
        g.beginPath();
        for (let i = 0; i <= 120; i++) {
          const uu = (i / 120) * xMax;
          const v = expectedRemaining(count, uu, 1);
          const yy = Y(v);
          if (i) g.lineTo(X(uu), yy);
          else g.moveTo(X(uu), yy);
        }
        g.stroke();
        g.setLineDash([]);
        g.restore();
      }
      // Messpunkte
      const mc = motherCol();
      const pr = sm ? 2.6 : 3.1;
      g.fillStyle = mc;
      g.strokeStyle = theme.bg;
      g.lineWidth = 1.2;
      for (const q of samples) {
        if (q.N < 1 && s > 0.5) continue;
        const xx = X(q.u);
        if (xx > A.x + A.w + 4) continue;
        g.beginPath();
        g.arc(xx, Y(q.N), pr, 0, TAU);
        g.fill();
        g.stroke();
      }
      // aktueller Wert
      if (u > 0 && !(N < 1 && s > 0.5)) {
        const hx = X(u);
        const hy = Y(N);
        const pulse = prefersReducedMotion() || !ctx.clock.playing ? 0 : 0.5 + 0.5 * Math.sin(performance.now() / 260);
        if (pulse) animating = true;
        g.fillStyle = withAlpha(mc, 0.2 + 0.12 * pulse);
        g.beginPath();
        g.arc(hx, hy, 8 + 3 * pulse, 0, TAU);
        g.fill();
        g.fillStyle = mc;
        g.beginPath();
        g.arc(hx, hy, 4.5, 0, TAU);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 2;
        g.stroke();
      }
      g.restore();
      // Legende
      const lf = `600 ${fs}px ${theme.font}`;
      const l2 = ctx.t('theory');
      const l1 = ctx.t('measured');
      // linear: oben rechts frei; logarithmisch liegen die Messpunkte oben, frei ist dann unten (über den Marken)
      const logLeg = s > 0.5;
      const legW = 13 + textW(l1, lf) + (theoA > 0.01 ? 34 + textW(l2, lf) : 0);
      // rechtsbündig oben bzw. linksbündig unten
      const right = logLeg ? A.x + 8 + legW : A.x + A.w - 4;
      let lx = right - textW(l2, lf);
      const ly = logLeg ? A.y + A.h - 30 : A.y + 8;
      if (theoA > 0.01) {
        g.save();
        g.globalAlpha *= theoA;
        haloText(l2, lx, ly, lf, theme.muted, 'left');
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 2;
        g.setLineDash([5, 3]);
        g.beginPath();
        g.moveTo(lx - 24, ly);
        g.lineTo(lx - 6, ly);
        g.stroke();
        g.setLineDash([]);
        g.restore();
        lx -= 34 + textW(l1, lf);
      } else lx = right - textW(l1, lf);
      haloText(l1, lx, ly, lf, theme.muted, 'left');
      g.fillStyle = mc;
      g.beginPath();
      g.arc(lx - 9, ly, 3.2, 0, TAU);
      g.fill();
      if (u === 0 && !ctx.clock.playing && !intro.running) emptyNote(A, ctx.t(A.w < 260 ? 'emptyNS' : 'emptyN'), fs, 0.62);
      g.restore();
    }

    function drawAChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 170;
      const fs = sm ? 11 : 11.5;
      const nu = nuc();
      const lam = decayConstant(nu.halfLife);
      const title = ctx.t(R.w < 300 ? 'chartAS' : 'chartA');
      text(g, title, R.x + 14, R.y + (sm ? 19 : 22), { font: `700 ${sm ? 12.5 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      const aNow = lam * N;
      text(g, ctx.hidden ? `A ≈ ? ${perUnit(nu)}` : `A ≈ ${sig(ease2('aNow', aNow, 8), 3)} ${perUnit(nu)}`, R.x + R.w - 14, R.y + (sm ? 19 : 22), { font: `700 ${fs}px ${theme.font}`, color: actCol(), align: 'right' });
      const padL = sm ? 40 : 46;
      const top = R.y + (sm ? 46 : 52);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 14 : 18), h: R.y + R.h - top - (sm ? 26 : 30) };
      if (A.w < 50 || A.h < 30) {
        g.restore();
        return;
      }
      const xMax = xMaxU();
      const A0 = lam * ease2('n0', count, 6);
      const yMax = A0 * 1.3;
      const X = (uu: number) => A.x + (uu / xMax) * A.w;
      const Y = (v: number) => A.y + A.h - (v / yMax) * A.h;
      const st = niceStep(yMax / (A.h < 110 ? 2 : 4));
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let v = st; v < yMax; v += st) {
        const yy = Math.round(Y(v)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      g.stroke();
      const font = `${fs}px ${theme.font}`;
      for (let v = 0; v < yMax; v += st) if (Y(v) > A.y + 6) text(g, sig(v, 2), A.x - 6, Y(v), { font, color: theme.muted, align: 'right' });
      timeTicks(A, X, xMax, fs, nu);
      text(g, tr('axisA', { u: perUnit(nu) }), A.x - padL + 10, A.y - 12, { font: `700 ${fs}px ${theme.font}`, color: actCol(), align: 'left' });
      axesFrame(A);
      const reveal = stage(0.45, 0.8, ease.inOutCubic);
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 4, (A.w + 8) * reveal, A.h + 8);
      g.clip();
      // Säulen: gemessene Zerfälle je Klasse / Klassenbreite
      const ac = actCol();
      const nb = Math.min(bins.length, Math.ceil(u / BIN + 1e-9));
      const bwPx = (BIN / xMax) * A.w;
      for (let b = 0; b < nb; b++) {
        const full = (b + 1) * BIN <= u + 1e-9;
        const v = bins[b]! / (BIN * nu.halfLife);
        const hv = ease2(`ab${b}`, v, full ? 10 : 14);
        const y = Y(Math.min(hv, yMax));
        const x = X(b * BIN) + 1;
        const hh = A.y + A.h - y;
        if (hh < 0.5) continue;
        const gr = g.createLinearGradient(0, y, 0, A.y + A.h);
        gr.addColorStop(0, withAlpha(ac, full ? 0.85 : 0.55));
        gr.addColorStop(1, withAlpha(ac, full ? 0.45 : 0.25));
        g.fillStyle = gr;
        roundRect(g, x, y, Math.max(1, bwPx - 2), hh, Math.min(3, hh / 2));
        g.fill();
      }
      const theoA = ease2('theoA2', p.theo ? 1 : 0, 6);
      if (theoA > 0.01) {
        g.save();
        g.globalAlpha *= theoA;
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = sm ? 1.8 : 2.1;
        g.setLineDash([7, 5]);
        g.beginPath();
        for (let i = 0; i <= 100; i++) {
          const uu = (i / 100) * xMax;
          const yy = Y(A0 * 2 ** -uu);
          if (i) g.lineTo(X(uu), yy);
          else g.moveTo(X(uu), yy);
        }
        g.stroke();
        g.setLineDash([]);
        const lf = `600 ${fs}px ${theme.font}`;
        const l2 = de ? 'Theorie λ · N' : 'theory λ · N';
        const lx = A.x + A.w - 4 - textW(l2, lf);
        haloText(l2, lx, A.y + 8, lf, theme.muted, 'left');
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 2;
        g.setLineDash([5, 3]);
        g.beginPath();
        g.moveTo(lx - 24, A.y + 8);
        g.lineTo(lx - 6, A.y + 8);
        g.stroke();
        g.setLineDash([]);
        g.restore();
      }
      g.restore();
      g.restore();
    }

    /** Histogramm der Lebensdauern (Versuch 2). */
    function drawHist(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 220;
      const fs = sm ? 11 : 11.5;
      const ty = R.y + (sm ? 19 : 22);
      text(g, ctx.t(R.w < 340 ? 'chartHS' : 'chartH'), R.x + 14, ty, { font: `700 ${sm ? 12.5 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      const nObs = landed();
      text(g, `n = ${nObs}`, R.x + R.w - 14, ty, { font: `700 ${fs}px ${theme.font}`, color: actCol(), align: 'right' });
      const padL = sm ? 40 : 46;
      const top = R.y + (sm ? 52 : 58);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 14 : 18), h: R.y + R.h - top - (sm ? 26 : 30) };
      if (A.w < 50 || A.h < 40) {
        g.restore();
        return;
      }
      const counts = histCounts(nObs);
      const xMax = H_BINS * H_W + H_W;
      const X = (uu: number) => A.x + (uu / xMax) * A.w;
      let top2 = 1;
      for (const c of counts) top2 = Math.max(top2, c);
      top2 = Math.max(top2, nObs * decayBetween(0, H_W) * 1.15);
      const yMax = ease2('hmax', Math.max(4, top2 * 1.15), 4);
      const Y = (v: number) => A.y + A.h - (v / yMax) * A.h;
      const st = Math.max(1, niceStep(yMax / (A.h < 140 ? 3 : 4)));
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let v = st; v < yMax; v += st) {
        const yy = Math.round(Y(v)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      g.stroke();
      const font = `${fs}px ${theme.font}`;
      for (let v = 0; v < yMax; v += st) if (Y(v) > A.y + 6) text(g, n(v, 0), A.x - 6, Y(v), { font, color: theme.muted, align: 'right' });
      const title = ctx.t('axisU');
      const tw = textW(title, `600 ${fs}px ${theme.font}`);
      for (let k = 0; k <= 5; k++) {
        const xx = X(k);
        if (xx + 6 > A.x + A.w - tw - 8) continue;
        text(g, n(k, 0), xx, A.y + A.h + 11, { font, color: theme.muted });
      }
      text(g, title, A.x + A.w, A.y + A.h + 11, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      text(g, ctx.t('axisCount'), A.x - padL + 10, A.y - 13, { font: `700 ${fs}px ${theme.font}`, color: actCol(), align: 'left' });
      axesFrame(A);
      // Säulen
      const ac = actCol();
      const bw = (H_W / xMax) * A.w;
      for (let k = 0; k <= H_BINS; k++) {
        const hv = ease2(`hb${k}`, counts[k]!, 9);
        const y = Y(hv);
        const hh = A.y + A.h - y;
        const x = X(k * H_W) + 1.5;
        if (hh >= 0.5) {
          const gr = g.createLinearGradient(0, y, 0, A.y + A.h);
          gr.addColorStop(0, withAlpha(ac, k === H_BINS ? 0.55 : 0.88));
          gr.addColorStop(1, withAlpha(ac, k === H_BINS ? 0.3 : 0.5));
          g.fillStyle = gr;
          roundRect(g, x, y, bw - 3, hh, Math.min(4, hh / 2));
          g.fill();
        }
      }
      haloText('> 5', X(H_BINS * H_W + H_W / 2), Y(ease2(`hb${H_BINS}`, counts[H_BINS]!, 9)) - 9, `600 ${fs}px ${theme.font}`, theme.muted);
      // erwartete Anzahl
      const theoA = ease2('theoH', p.theo && nObs > 0 ? 1 : 0, 6);
      if (theoA > 0.01) {
        g.save();
        g.globalAlpha *= theoA;
        g.strokeStyle = withAlpha(theme.text, 0.65);
        g.lineWidth = 1.8;
        g.setLineDash([5, 4]);
        g.beginPath();
        for (let k = 0; k <= H_BINS; k++) {
          const e = nObs * (k === H_BINS ? 2 ** -(H_BINS * H_W) : decayBetween(k * H_W, (k + 1) * H_W));
          const yy = Y(e);
          if (k) g.lineTo(X(k * H_W), yy);
          else g.moveTo(X(0), yy);
          g.lineTo(X((k + 1) * H_W), yy);
        }
        g.stroke();
        g.setLineDash([]);
        const lab = ctx.t('expected');
        const lf = `600 ${fs}px ${theme.font}`;
        const lx = A.x + A.w - 4 - textW(lab, lf);
        haloText(lab, lx, A.y + 8, lf, theme.muted, 'left');
        g.strokeStyle = withAlpha(theme.text, 0.65);
        g.setLineDash([5, 3]);
        g.beginPath();
        g.moveTo(lx - 24, A.y + 8);
        g.lineTo(lx - 6, A.y + 8);
        g.stroke();
        g.setLineDash([]);
        g.restore();
      }
      // Mittelwert
      if (nObs >= 3) {
        const done = lives.slice(0, nObs);
        const m = mean(done);
        const mx = X(Math.min(m, xMax));
        const ma = ease2('mA', 1, 5);
        const mxs = ease2('mX', mx, 6);
        g.save();
        g.globalAlpha *= ma;
        g.strokeStyle = theme.text;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(mxs, A.y + 22);
        g.lineTo(mxs, A.y + A.h);
        g.stroke();
        const lab = tr('meanLab', { m: fx(m, 2) });
        const lf = `700 ${fs}px ${theme.font}`;
        const lw = textW(lab, lf);
        haloText(lab, clamp(mxs + 6, A.x + 4, A.x + A.w - lw - 4), A.y + 28, lf, theme.text, 'left');
        g.restore();
      } else soft.set('mA', 0);
      if (!nObs) emptyNote(A, ctx.t(A.w < 260 ? 'emptyHS' : 'emptyH'), fs, 0.55);
      g.restore();
    }

    /** Wie viele Lebensdauern sind schon im Histogramm angekommen? */
    function landed(): number {
      const now = performance.now();
      let pending = 0;
      for (const f of flyers) if (now - f.t0 < 700) pending++;
      return Math.max(0, lives.length - pending);
    }
    function histCounts(nObs: number): number[] {
      const c = new Array<number>(H_BINS + 1).fill(0);
      for (let i = 0; i < nObs; i++) {
        const v = lives[i]!;
        const k = Math.min(H_BINS, Math.floor(v / H_W));
        c[k]!++;
      }
      return c;
    }

    let lastHistMap: { A: Rect; xMax: number } | null = null;
    /** Überlebenskurve (Versuch 2). */
    function drawSurvival(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 170;
      const fs = sm ? 11 : 11.5;
      text(g, ctx.t(R.w < 300 ? 'chartSS' : 'chartS'), R.x + 14, R.y + (sm ? 19 : 22), { font: `700 ${sm ? 12.5 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      const padL = sm ? 40 : 46;
      const top = R.y + (sm ? 46 : 52);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 14 : 18), h: R.y + R.h - top - (sm ? 26 : 30) };
      if (A.w < 50 || A.h < 30) {
        g.restore();
        return;
      }
      const xMax = 5;
      lastHistMap = { A, xMax };
      const X = (uu: number) => A.x + (uu / xMax) * A.w;
      const Y = (v: number) => A.y + A.h - (v / 1.05) * A.h;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (const v of [0.25, 0.5, 0.75, 1]) {
        const yy = Math.round(Y(v)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      for (let k = 1; k < 5; k++) {
        const xx = Math.round(X(k)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      const font = `${fs}px ${theme.font}`;
      const yl = A.h < 110 ? [0, 0.5, 1] : [0, 0.25, 0.5, 0.75, 1];
      for (const v of yl) text(g, n(v * 100, 0), A.x - 6, Y(v), { font, color: theme.muted, align: 'right' });
      const title = ctx.t('axisU');
      const tw = textW(title, `600 ${fs}px ${theme.font}`);
      for (let k = 0; k <= 5; k++) {
        const xx = X(k);
        if (xx + 6 > A.x + A.w - tw - 8) continue;
        text(g, n(k, 0), xx, A.y + A.h + 11, { font, color: theme.muted });
      }
      text(g, title, A.x + A.w, A.y + A.h + 11, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      text(g, ctx.t('axisPct'), A.x - padL + 10, A.y - 12, { font: `700 ${fs}px ${theme.font}`, color: motherCol(), align: 'left' });
      axesFrame(A);
      const theoA = ease2('theoS', p.theo ? 1 : 0, 6);
      if (theoA > 0.01) {
        g.save();
        g.globalAlpha *= theoA;
        g.strokeStyle = withAlpha(markCol(), 0.85);
        g.lineWidth = 1.3;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(X(1), A.y + A.h);
        g.lineTo(X(1), Y(0.5));
        g.lineTo(A.x, Y(0.5));
        g.stroke();
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 2;
        g.setLineDash([7, 5]);
        g.beginPath();
        for (let i = 0; i <= 100; i++) {
          const uu = (i / 100) * xMax;
          if (i) g.lineTo(X(uu), Y(2 ** -uu));
          else g.moveTo(X(uu), Y(1));
        }
        g.stroke();
        g.setLineDash([]);
        haloText('50 %', X(1) + 6, Y(0.5) - 10, `700 ${fs}px ${theme.font}`, markCol(), 'left');
        g.restore();
      }
      const nObs = landed();
      if (nObs > 0) {
        const done = lives.slice(0, nObs).sort((a, b) => a - b);
        const sa = ease2('survA', 1, 5);
        g.save();
        g.globalAlpha *= sa;
        g.strokeStyle = motherCol();
        g.lineWidth = sm ? 2.4 : 2.8;
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(X(0), Y(1));
        let prevY = Y(1);
        for (let i = 0; i < done.length; i++) {
          const v = done[i]!;
          if (v > xMax) break;
          const yy = Y(1 - (i + 1) / done.length);
          g.lineTo(X(v), prevY);
          g.lineTo(X(v), yy);
          prevY = yy;
        }
        g.lineTo(X(xMax), prevY);
        g.stroke();
        g.restore();
        const h = survivingShare(done, 1);
        const lab = `${n(Math.round(h * 100), 0)} %`;
        pill(Math.max(A.x + 4, X(1) - pillWidth(lab, fs) - 8), clamp(Y(h) + 8, A.y, A.y + A.h - fs - 14), lab, motherCol(), 'left', fs);
      } else soft.set('survA', 0);
      g.restore();
    }

    /** Lebensdauern, die vom Kern ins Histogramm fliegen. */
    function drawFlyers(histR: Rect): void {
      const g = surface.g;
      const now = performance.now();
      const sm = histR.w < 330 || histR.h < 220;
      const padL = sm ? 40 : 46;
      const top = histR.y + (sm ? 52 : 58);
      const A: Rect = { x: histR.x + padL, y: top, w: histR.w - padL - (sm ? 14 : 18), h: histR.y + histR.h - top - (sm ? 26 : 30) };
      const xMax = H_BINS * H_W + H_W;
      flyers = flyers.filter((f) => now - f.t0 < 700);
      for (const f of flyers) {
        const k = (now - f.t0) / 700;
        if (k < 0) {
          animating = true;
          continue;
        }
        animating = true;
        const e = ease.inOutCubic(k);
        const bin = Math.min(H_BINS, Math.floor(f.life / H_W));
        const x1 = A.x + (((bin + 0.5) * H_W) / xMax) * A.w;
        const y1 = A.y + A.h - 6;
        const cxp = (f.x + x1) / 2;
        const cyp = Math.min(f.y, y1) - 80;
        const x = (1 - e) * (1 - e) * f.x + 2 * (1 - e) * e * cxp + e * e * x1;
        const y = (1 - e) * (1 - e) * f.y + 2 * (1 - e) * e * cyp + e * e * y1;
        g.save();
        g.shadowColor = withAlpha(actCol(), 0.7);
        g.shadowBlur = 10;
        g.fillStyle = actCol();
        g.beginPath();
        g.arc(x, y, 5 - 2 * k, 0, TAU);
        g.fill();
        g.restore();
      }
    }

    /* ---------- Ergebnisse ---------- */
    function eqHtml(nu: Nuclide): string {
      const s = (q: Nucleus | { A: number; Z: number; symbol: string }) => `<sup>${q.A}</sup><sub>${q.Z < 0 ? `−${-q.Z}` : q.Z}</sub>${q.symbol}`;
      const part = nu.kind === 'alpha' ? s({ A: 4, Z: 2, symbol: 'He' }) : `${s({ A: 0, Z: -1, symbol: 'e' })} + ν̄`;
      return `<strong>${s(nu)} → ${s(nu.daughter)} + ${part}${nu.gamma ? ' + γ' : ''}</strong>`;
    }
    const nucName = (nu: Nuclide) => `${nu.symbol}-${nu.A}`;
    const lamStr = (nu: Nuclide, html: boolean) => `${sig(decayConstant(nu.halfLife), 3, html)} ${perUnit(nu)}`;

    let lastKey = '';
    function updateReadouts(force = false): void {
      const nu = nuc();
      const kind = ctx.t(nu.kind === 'alpha' ? 'kindA' : 'kindB') + (nu.gamma ? ctx.t('kindG') : '');
      const nucHtml = tr('nuc', {
        eq: eqHtml(nu),
        kind,
        T: ctx.hidden ? '?' : halfLifeStr(nu),
        l: ctx.hidden ? '' : ` ≈ ${lamStr(nu, true)}`,
        name: nucName(nu),
        atoms: sig(atomsPerGram(nu), 2, true),
        spec: sig(specificActivity(nu), 2, true),
        chain: nu.daughterRadioactive ? tr('chain', { d: `${nu.daughter.symbol}-${nu.daughter.A}` }) : '',
      });
      let now: string | null = null;
      let act: string | null = null;
      let age: string | null = null;
      let singleH: string | null = null;
      let stats: string | null = null;
      if (mode() === 'many') {
        const uq = Math.round(u * 100) / 100;
        now = tr('now', { t: timeStr(uq), u: fx(uq, 2), N: String(N), N0: String(count), pct: fx((100 * N) / count, 1), Nth: n(expectedRemaining(count, uq, 1), 1) });
        const lam = decayConstant(nu.halfLife);
        const bq = (lam / unitSeconds(nu.unit)) * N;
        act = tr('act', { l: lamStr(nu, true), N: String(N), A: `${sig(lam * N, 3, true)} ${perUnit(nu)}`, Bq: sig(bq, 3, true), k: String(pulses), d: String(count - N) });
        if (N === count) age = ctx.t('ageNone');
        else if (N === 0) age = ctx.t('ageAll');
        else {
          const f = N / count;
          const est = ageFromFraction(f, nu.halfLife);
          age = tr('age', { pct: fx(f * 100, 1), T: halfLifeStr(nu), k: fx(Math.log2(1 / f), 2), est: timeStr(est / nu.halfLife), t: timeStr(uq) }) + (nu.id === 'c14' ? ctx.t('ageC14') : '');
        }
      } else {
        const uNow = single.alive ? single.steps * H : single.life;
        const uq = Math.round(uNow * 100) / 100;
        singleH = single.alive ? tr('singleAlive', { k: String(single.k), t: timeStr(uq), u: fx(uq, 2), p: ctx.hidden ? '' : ctx.t('singleP') }) : tr('singleDec', { k: String(single.k), u: fx(uq, 2), t: timeStr(uq) });
        stats = statsHtml;
      }
      const key = [nucHtml, now, act, age, singleH, stats, ctx.hidden].join('|');
      if (!force && key === lastKey) return;
      lastKey = key;
      ctx.readout('nuc', { html: nucHtml });
      ctx.readout('now', now === null ? null : { html: now });
      ctx.readout('act', act === null ? null : { html: act });
      ctx.readout('age', age === null ? null : { html: age });
      ctx.readout('single', singleH === null ? null : { html: singleH });
      ctx.readout('stats', stats === null ? null : { html: stats });
    }
    let statsHtml = '';
    function updateStats(): void {
      if (!lives.length) statsHtml = ctx.t('statsNone');
      else
        statsHtml = tr('stats', {
          n: String(lives.length),
          m: fx(mean(lives), 2),
          md: fx(median(lives), 2),
          h: n(Math.round((1 - survivingShare(lives, 1)) * 100), 0),
        });
      ctx.setAction('clear', { enabled: lives.length > 0 && !ctx.locked });
    }

    /* ---------- Antippen ---------- */
    function hitTab(px: number, py: number): boolean | null {
      if (mode() !== 'many') return null;
      for (const t of tabRects) if (px >= t.r.x - 2 && px <= t.r.x + t.r.w + 2 && py >= t.r.y - 4 && py <= t.r.y + t.r.h + 4) return t.v;
      return null;
    }
    function hitNucleus(px: number, py: number): number {
      const G = lastGeo;
      if (!G || mode() !== 'many') return -1;
      if (Math.hypot(px - G.cx, py - G.cy) > G.R + G.rb + 6) return -1;
      let best = -1;
      let bd = (G.rb + 7) ** 2;
      for (let i = 0; i < count; i++) {
        const d = (nx(G, i) - px) ** 2 + (ny(G, i) - py) ** 2;
        if (d < bd) {
          bd = d;
          best = i;
        }
      }
      return best;
    }
    function hitSpeaker(px: number, py: number): boolean {
      const r = spkRect;
      return mode() === 'many' && !!r && px >= r.x - 4 && px <= r.x + r.w + 4 && py >= r.y - 4 && py <= r.y + r.h + 4;
    }
    function hitOne(px: number, py: number): boolean {
      if (mode() !== 'one' || !oneTap) return false;
      return Math.hypot(px - oneTap[0], py - oneTap[1]) < oneTap[2] * 0.75;
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && (hitTab(px, py) !== null || hitNucleus(px, py) >= 0 || hitSpeaker(px, py) || hitOne(px, py) || (tracked >= 0 && !!lastGeo && Math.hypot(px - lastGeo.cx, py - lastGeo.cy) < lastGeo.dishR)),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked) return false;
        if (p.snd) ensureAudio();
        const t = hitTab(q.px, q.py);
        if (t !== null) {
          if (t !== p.log) ctx.set({ log: t });
          return true;
        }
        if (hitSpeaker(q.px, q.py)) {
          if (!p.snd) ensureAudio();
          ctx.set({ snd: !p.snd });
          return true;
        }
        if (hitOne(q.px, q.py)) {
          if (!single.alive) startSingle();
          else if (!ctx.clock.playing) ctx.clock.play();
          ctx.requestRender();
          return true;
        }
        const i = hitNucleus(q.px, q.py);
        tracked = i;
        ctx.requestRender();
        return true;
      },
      pointerMove: () => undefined,
      pointerUp: () => ctx.requestRender(),
      hover: (q: { px: number; py: number } | null) => {
        const t = q ? hitTab(q.px, q.py) : null;
        const sp = q ? hitSpeaker(q.px, q.py) : false;
        const one = q ? hitOne(q.px, q.py) : false;
        const i = q && t === null && !sp ? hitNucleus(q.px, q.py) : -1;
        if (t !== tabHover || i !== hoverNuc) {
          tabHover = t;
          hoverNuc = i;
          ctx.requestRender();
        }
        surface.setCursor(ctx.locked ? '' : t !== null || sp || i >= 0 || one ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Tastatur: einen Kern zum Beobachten auswählen ---------- */
    let keySig = '';
    function watchRandom(): void {
      if (N === 0) return;
      const start = Math.floor(vis() * count);
      for (let k = 0; k < count; k++) {
        const i = (start + k) % count;
        if (alive[i]) {
          tracked = i;
          break;
        }
      }
      if (!ctx.clock.playing && !finished && !prefersReducedMotion()) ctx.clock.play();
    }
    function updateKeyTargets(): void {
      const G = lastGeo;
      const on = mode() === 'many' && !!G;
      const dis = N === 0 || ctx.locked;
      const sigNow = on && G ? `${Math.round(G.cx)}|${Math.round(G.cy)}|${Math.round(G.dishR)}|${dis}|${ctx.lang}` : 'off';
      if (sigNow === keySig) return;
      keySig = sigNow;
      if (!on || !G) {
        ctx.setKeyTargets([]);
        return;
      }
      ctx.setKeyTargets([
        {
          id: 'watch',
          label: ctx.t('watchKey'),
          rect: { x: G.cx - G.dishR, y: G.cy - G.dishR, w: 2 * G.dishR, h: 2 * G.dishR },
          disabled: dis,
          activate: watchRandom,
        },
      ]);
    }

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => {
      lastKey = '';
      ctx.requestRender();
    });

    function resetOne(clear: boolean): void {
      if (clear) {
        lives = [];
        flyers = [];
        oneSeed = (oneSeed * 5 + 3) % 99991 || 1;
        randOne = seededRandom(oneSeed);
        for (let k = 0; k <= H_BINS; k++) soft.delete(`hb${k}`);
      }
      emissions = emissions.filter((e) => !e.one);
      startSingle();
      updateStats();
    }

    return {
      update(changed, source) {
        if (source === 'init') {
          rebuild(false, false);
          resetOne(false);
          intro.play();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        } else if (source === 'replace') {
          rebuild(false, true);
          resetOne(true);
          if (!prefersReducedMotion()) ctx.clock.play();
        } else {
          if (changed.has('N0') || (changed.has('nuc') && nucId() !== sampleNuc)) {
            rebuild(false, true);
            if (source === 'input' && !prefersReducedMotion() && !ctx.clock.playing) ctx.clock.play();
          }
          if (changed.has('nuc') && mode() === 'one') resetOne(true);
          if (changed.has('mode')) {
            if (mode() === 'one') {
              resetOne(false);
              if (!prefersReducedMotion() && !ctx.clock.playing) ctx.clock.play();
            } else if (finished) rebuild(true, true);
          }
          if (changed.has('snd') && p.snd && source === 'input') ensureAudio();
        }
        updateStats();
        updateReadouts(true);
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (p.snd) ensureAudio();
        if (id === 'new') {
          rebuild(true, true);
          if (!prefersReducedMotion()) ctx.clock.play();
        } else if (id === 'next') {
          startSingle();
          if (!ctx.clock.playing) ctx.clock.play();
        } else if (id === 'batch') batch();
        else if (id === 'clear') resetOne(true);
        updateReadouts(true);
        ctx.requestRender();
      },

      tick(dt) {
        if (mode() === 'many') tickMany(dt);
        else tickOne(dt);
      },

      resetTime() {
        // gleicher Startwert: derselbe Zufallsverlauf noch einmal
        if (mode() === 'many') rebuild(false, true);
        else startSingle();
        updateReadouts(true);
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        clicksThisFrame = 0;
        const lay = computeLayout();
        surface.begin();
        const g = surface.g;
        const oneA = ease2('modeA', mode() === 'one' ? 1 : 0, 6);
        g.save();
        g.beginPath();
        roundRect(g, lay.scene.x, lay.scene.y, lay.scene.w, lay.scene.h, 12);
        g.clip();
        drawBench(lay.scene);
        if (oneA < 0.99) drawManyScene(lay.scene, 1 - oneA);
        if (oneA > 0.01) drawOneScene(lay.scene, oneA);
        const G = lastGeo ?? sceneGeo(lay.scene, count);
        drawEqCard(G, stage(0.1, 0.5));
        g.restore();
        const ia = stage(0.2, 0.5);
        const ib = stage(0.32, 0.5);
        if (oneA < 0.99) {
          g.save();
          g.globalAlpha *= 1 - oneA;
          drawNChart(lay.a, ia);
          drawAChart(lay.b, ib);
          g.restore();
        }
        if (oneA > 0.01) {
          g.save();
          g.globalAlpha *= oneA;
          drawHist(lay.a, ia);
          drawSurvival(lay.b, ib);
          g.restore();
          drawFlyers(lay.a);
        }
        void lastHistMap;
        updateKeyTargets();
        updateReadouts();
        if (animating || intro.running || refill.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        if (audio) void audio.close();
        surface.destroy();
      },
    };
  },
});
