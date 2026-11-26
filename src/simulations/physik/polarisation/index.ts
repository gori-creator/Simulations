import { defineSimulation, Plot, roundRect, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { brewster, chain, checkTask, criticalAngle, fresnel, glareThroughSunglasses, lcdBrightness, makeTask, malus, refractionAngle, SEGMENTS, wavelengthRatio, type PolTask } from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;
/** Halbe Breite und halbe Höhe des Huygens-Ausschnitts in Wellenlängen λ₁. */
const HX = 5;
const HY = 3.2;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.64);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.6);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Pseudozufälliger Winkel für unpolarisiertes Licht (fest je Stelle und Zeitschritt). */
function hashAngle(i: number, j: number): number {
  const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return (v - Math.floor(v)) * Math.PI;
}

/**
 * Polarisation (Filterkette, Gesetz von Malus) und Brechung im Wellenmodell
 * (Wellenfronten, Elementarwellen nach Huygens, Totalreflexion).
 */
export default defineSimulation({
  id: 'polarisation',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'pol', label: L('Polarisationsfilter', 'Polarising filters') },
        { value: 'huygens', label: L('Brechung im Wellenmodell', 'Refraction in the wave model') },
        { value: 'welle', label: L('Querwelle oder Längswelle?', 'Transverse or longitudinal wave?') },
        { value: 'spiegel', label: L('Reflexion und Sonnenbrille', 'Reflection and sunglasses') },
        { value: 'lcd', label: L('LCD-Anzeige', 'LCD display') },
        { value: 'ueben', label: L('Üben: Aufgaben', 'Practice: tasks') },
      ],
      default: 'pol',
      display: 'menu',
    },
    {
      key: 'wt',
      type: 'choice',
      label: L('Welle', 'Wave'),
      options: [
        { value: 'quer', label: L('Querwelle (Licht, Seil)', 'transverse (light, rope)') },
        { value: 'laengs', label: L('Längswelle (Schall)', 'longitudinal (sound)') },
      ],
      default: 'quer',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'welle',
    },
    {
      key: 'wpol',
      type: 'boolean',
      label: L('Quelle schwingt in allen Richtungen (unpolarisiert)', 'source oscillates in all directions (unpolarised)'),
      default: true,
      visibleIf: (v) => v.mode === 'welle' && v.wt === 'quer',
    },
    { key: 'wf', type: 'number', label: L('Spalt/Filter drehen', 'Turn slit/filter'), min: 0, max: 180, step: 5, default: 90, unit: '°', visibleIf: (v) => v.mode === 'welle' },
    { key: 'ra', type: 'number', label: L('Einfallswinkel', 'Angle of incidence'), min: 0, max: 89, step: 1, default: 53, unit: '°', visibleIf: (v) => v.mode === 'spiegel' },
    {
      key: 'stoff',
      type: 'choice',
      label: L('Oberfläche', 'Surface'),
      options: [
        { value: 'wasser', label: L('Wasser (n = 1,33)', 'water (n = 1.33)') },
        { value: 'glas', label: L('Glas (n = 1,5)', 'glass (n = 1.5)') },
        { value: 'diamant', label: L('Diamant (n = 2,42)', 'diamond (n = 2.42)') },
      ],
      default: 'wasser',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'spiegel',
    },
    { key: 'brille', type: 'boolean', label: L('Polarisations-Sonnenbrille aufsetzen', 'put on polarising sunglasses'), default: false, visibleIf: (v) => v.mode === 'spiegel' },
    { key: 'u', type: 'number', label: L('Spannung am Flüssigkristall', 'Voltage on the liquid crystal'), min: 0, max: 100, step: 5, default: 0, unit: '%', visibleIf: (v) => v.mode === 'lcd' },
    { key: 'ziffer', type: 'number', label: L('Angezeigte Ziffer', 'Digit shown'), min: 0, max: 9, step: 1, default: 4, visibleIf: (v) => v.mode === 'lcd' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 10, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
    { key: 'th1', type: 'number', label: L('Winkel Polarisator', 'Angle of polariser'), min: 0, max: 180, step: 5, default: 0, unit: '°', visibleIf: (v) => v.mode === 'pol' },
    { key: 'mitte', type: 'boolean', label: L('drittes Filter in der Mitte', 'third filter in the middle'), default: false, visibleIf: (v) => v.mode === 'pol' },
    {
      key: 'th3',
      type: 'number',
      label: L('Winkel mittleres Filter', 'Angle of middle filter'),
      min: 0,
      max: 180,
      step: 5,
      default: 45,
      unit: '°',
      visibleIf: (v) => v.mode === 'pol' && v.mitte === true,
    },
    { key: 'th2', type: 'number', label: L('Winkel Analysator', 'Angle of analyser'), min: 0, max: 180, step: 5, default: 60, unit: '°', visibleIf: (v) => v.mode === 'pol' },
    { key: 'alpha', type: 'number', label: L('Einfallswinkel', 'Angle of incidence'), min: 5, max: 80, step: 1, default: 40, unit: '°', visibleIf: (v) => v.mode === 'huygens' },
    { key: 'n', type: 'number', label: L('Brechzahl n = c₁/c₂', 'Refractive index n = c₁/c₂'), min: 0.5, max: 2.5, step: 0.05, default: 1.5, visibleIf: (v) => v.mode === 'huygens' },
  ],
  hint: (v) =>
    v.mode === 'welle'
      ? L(
          'Ein Spalt lässt nur Schwingungen in seiner Richtung durch. Drehe ihn – bei einer Längswelle ändert sich nichts.',
          'A slit lets through only oscillations along it. Turn it – with a longitudinal wave nothing changes.',
        )
      : v.mode === 'spiegel'
        ? L(
            'Spiegelndes Licht ist teilweise polarisiert, beim Brewster-Winkel sogar vollständig. Setz die Sonnenbrille auf!',
            'Reflected light is partly polarised, at Brewster’s angle even completely. Put on the sunglasses!',
          )
        : v.mode === 'lcd'
          ? L(
              'Zwischen gekreuzten Filtern dreht der Flüssigkristall das Licht. Mit Spannung hört er damit auf – das Segment wird dunkel.',
              'Between crossed filters the liquid crystal twists the light. With voltage it stops – the segment goes dark.',
            )
          : v.mode === 'ueben'
            ? L('Gib die Zahl oder die Nummer der Antwort ein und drücke „Prüfen“.', 'Enter the number or the number of the answer and press “Check”.')
            : v.mode === 'huygens'
              ? L(
                  'Drücke Start: Jeder Punkt der Grenzfläche, den die Welle erreicht, sendet eine Elementarwelle aus. Ihre gemeinsame Tangente ist die neue Wellenfront.',
                  'Press play: every point of the boundary the wave reaches sends out a wavelet. Their common tangent is the new wave front.',
                )
              : L(
                  'Drehe den Analysator: Bei 90° zum Polarisator wird es dunkel. Was passiert, wenn du ein drittes Filter dazwischen stellst?',
                  'Turn the analyser: at 90° to the polariser it goes dark. What happens if you put a third filter in between?',
                ),
  readouts: [
    { key: 'I', label: L('Helligkeit am Schirm', 'Brightness on the screen'), spoiler: true },
    { key: 'delta', label: L('Winkel zwischen den Filtern', 'Angle between the filters') },
    { key: 'beta', label: L('Brechungswinkel', 'Angle of refraction'), spoiler: true },
    { key: 'lam', label: L('Wellenlänge und Tempo im 2. Stoff', 'Wavelength and speed in medium 2') },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  presets: [
    { id: 'malus', label: L('Zwei Filter, 60°', 'Two filters, 60°'), values: { mode: 'pol', th1: 0, th2: 60, mitte: false } },
    { id: 'gekreuzt', label: L('Gekreuzte Filter', 'Crossed filters'), values: { mode: 'pol', th1: 0, th2: 90, mitte: false } },
    { id: 'drei', label: L('Drittes Filter dazwischen', 'Third filter in between'), values: { mode: 'pol', th1: 0, th2: 90, mitte: true, th3: 45 } },
    { id: 'glas', label: L('Luft → Glas', 'Air → glass'), values: { mode: 'huygens', alpha: 40, n: 1.5 } },
    { id: 'total', label: L('Glas → Luft: Totalreflexion', 'Glass → air: total internal reflection'), values: { mode: 'huygens', alpha: 50, n: 0.65 } },
    { id: 'seil', label: L('Seilwelle durch einen Spalt', 'Rope wave through a slit'), values: { mode: 'welle', wt: 'quer', wpol: false, wf: 30 } },
    { id: 'unpol', label: L('Unpolarisiertes Licht am Filter', 'Unpolarised light at a filter'), values: { mode: 'welle', wt: 'quer', wpol: true, wf: 90 } },
    { id: 'schall', label: L('Schall lässt sich nicht polarisieren', 'Sound cannot be polarised'), values: { mode: 'welle', wt: 'laengs', wf: 0 } },
    { id: 'see', label: L('Spiegelung auf dem See', 'Reflection on a lake'), values: { mode: 'spiegel', ra: 53, stoff: 'wasser', brille: false } },
    { id: 'brille', label: L('Mit Sonnenbrille beim Brewster-Winkel', 'With sunglasses at Brewster’s angle'), values: { mode: 'spiegel', ra: 53, stoff: 'wasser', brille: true } },
    { id: 'schaufenster', label: L('Schaufenster, flacher Blick', 'Shop window, grazing view'), values: { mode: 'spiegel', ra: 80, stoff: 'glas', brille: true } },
    { id: 'lcdAus', label: L('LCD: ohne Spannung hell', 'LCD: bright without voltage'), values: { mode: 'lcd', u: 0, ziffer: 4 } },
    { id: 'lcdAn', label: L('LCD: volle Spannung', 'LCD: full voltage'), values: { mode: 'lcd', u: 100, ziffer: 7 } },
    { id: 'quiz', label: L('Üben: sechs Aufgabenarten', 'Practice: six kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasPol:
        'Lichtbündel von einer Lampe durch zwei oder drei Polarisationsfilter auf einen Schirm, mit schwingendem elektrischem Feld; daneben Diagramm der Helligkeit über dem Winkel des letzten Filters',
      canvasHuy: 'Ebene Welle trifft schräg auf eine Grenzfläche; Wellenfronten, Elementarwellen und Strahlen zeigen die Brechung',
      IVal: 'I = {p} · I₀ ({pc} %)',
      dVal: 'Δθ = {d}°',
      dVal3: 'Δθ = {a}° und {b}°',
      betaVal: 'β ≈ {b}°',
      betaTR: 'Totalreflexion (Grenzwinkel {g}°)',
      lamVal: 'λ₂ = {r} · λ₁,  c₂ = {r} · c₁',
      lamp: 'Lampe',
      screen: 'Schirm',
      unpol: 'unpolarisiert',
      f1: 'θ₁',
      f2: 'θ₂',
      f3: 'θ₃',
      Irel: 'I / I₀',
      thLast: 'Winkel Analysator in °',
      m1: 'Stoff 1',
      m2: 'Stoff 2',
      lot: 'Lot',
      total: 'Totalreflexion',
      canvasW: 'Eine Welle läuft auf einen drehbaren Spalt zu; Querwellen kommen nur durch, wenn sie in Spaltrichtung schwingen, Längswellen immer',
      canvasS: 'Licht wird an einer Oberfläche gespiegelt; Diagramm der Reflexion für beide Schwingungsrichtungen über dem Einfallswinkel, mit Brewster-Winkel',
      canvasL: 'Aufbau eines LCD-Bildpunkts mit zwei gekreuzten Filtern und Flüssigkristall; daneben eine Sieben-Segment-Anzeige',
      canvasQ: 'Übungsaufgabe zur Polarisation mit Rückmeldung und Punktestand',
      wQuer: 'Querwelle: schwingt quer zur Laufrichtung',
      wLaengs: 'Längswelle: schwingt in Laufrichtung',
      wSlit: 'Spalt',
      wPass: 'kommt durch: {p} %',
      wInfoQ: 'Nur der Anteil der Schwingung in Spaltrichtung kommt durch. Darum lassen sich Querwellen polarisieren.',
      wInfoL: 'Eine Längswelle schwingt in Laufrichtung – jeder Spalt lässt sie gleich durch. Schall lässt sich nicht polarisieren.',
      sAxisA: 'Einfallswinkel in °',
      sAxisR: 'Reflexion',
      sS: 's: senkrecht zur Einfallsebene',
      sP: 'p: parallel zur Einfallsebene',
      sBrewster: 'Brewster-Winkel {b}°',
      sR: 'Gespiegelt: {r} % des Lichts',
      sRs: 'davon {s} % senkrecht schwingend',
      sGlare: 'Mit Brille bleibt {g} % der Spiegelung',
      sInfo: 'Beim Brewster-Winkel (tan θ = n) schwingt das gespiegelte Licht nur noch waagerecht. Polarisations-Sonnenbrillen lassen nur senkrechte Schwingungen durch und schlucken so die Blendung.',
      lFilter1: 'Filter senkrecht',
      lFilter2: 'Filter waagerecht',
      lCrystal: 'Flüssigkristall',
      lTwist: 'Drehung {d}°',
      lInfo: 'Ohne Spannung dreht der Kristall die Schwingungsrichtung um 90° – das Licht passt durch das zweite Filter. Mit Spannung bleibt sie stehen und wird gesperrt.',
      lPix: 'Bildpunkt mit Spannung: {p} % hell',
      qTitle: 'Aufgabe {n}',
      qYour: 'Deine Antwort: {a}',
      qHow: 'Gib die Nummer der richtigen Antwort ein.',
      qHowNum: 'Gib die Zahl ein (ohne Einheit).',
      qBad: 'Bitte eine Zahl eingeben.',
      qOk: 'Richtig!',
      qNo: 'Leider falsch. Versuch es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig, {s} in Folge',
    },
    en: {
      canvasPol:
        'Light beam from a lamp through two or three polarising filters onto a screen, with the oscillating electric field; next to it a graph of brightness against the angle of the last filter',
      canvasHuy: 'A plane wave hits a boundary at an angle; wave fronts, wavelets and rays show the refraction',
      IVal: 'I = {p} · I₀ ({pc} %)',
      dVal: 'Δθ = {d}°',
      dVal3: 'Δθ = {a}° and {b}°',
      betaVal: 'β ≈ {b}°',
      betaTR: 'total internal reflection (critical angle {g}°)',
      lamVal: 'λ₂ = {r} · λ₁,  c₂ = {r} · c₁',
      lamp: 'lamp',
      screen: 'screen',
      unpol: 'unpolarised',
      f1: 'θ₁',
      f2: 'θ₂',
      f3: 'θ₃',
      Irel: 'I / I₀',
      thLast: 'angle of analyser in °',
      m1: 'medium 1',
      m2: 'medium 2',
      lot: 'normal',
      total: 'total internal reflection',
      canvasW: 'A wave travels towards a rotatable slit; transverse waves only pass if they oscillate along the slit, longitudinal waves always',
      canvasS: 'Light is reflected at a surface; graph of the reflection for both directions of oscillation against the angle of incidence, with Brewster’s angle',
      canvasL: 'Structure of an LCD pixel with two crossed filters and liquid crystal; next to it a seven-segment display',
      canvasQ: 'Practice task on polarisation with feedback and score',
      wQuer: 'transverse wave: oscillates across the direction of travel',
      wLaengs: 'longitudinal wave: oscillates along the direction of travel',
      wSlit: 'slit',
      wPass: 'gets through: {p} %',
      wInfoQ: 'Only the part of the oscillation along the slit gets through. That is why transverse waves can be polarised.',
      wInfoL: 'A longitudinal wave oscillates along its direction of travel – every slit lets it through equally. Sound cannot be polarised.',
      sAxisA: 'angle of incidence in °',
      sAxisR: 'reflection',
      sS: 's: perpendicular to the plane of incidence',
      sP: 'p: parallel to the plane of incidence',
      sBrewster: 'Brewster’s angle {b}°',
      sR: 'Reflected: {r} % of the light',
      sRs: '{s} % of it oscillating perpendicular',
      sGlare: 'With sunglasses {g} % of the glare remains',
      sInfo: 'At Brewster’s angle (tan θ = n) the reflected light oscillates only horizontally. Polarising sunglasses let only vertical oscillations through and so block the glare.',
      lFilter1: 'vertical filter',
      lFilter2: 'horizontal filter',
      lCrystal: 'liquid crystal',
      lTwist: 'twist {d}°',
      lInfo: 'Without voltage the crystal twists the direction of oscillation by 90° – the light passes the second filter. With voltage it stays put and is blocked.',
      lPix: 'Pixel with voltage: {p} % bright',
      qTitle: 'Task {n}',
      qYour: 'Your answer: {a}',
      qHow: 'Enter the number of the correct answer.',
      qHowNum: 'Enter the number (without unit).',
      qBad: 'Please enter a number.',
      qOk: 'Correct!',
      qNo: 'Not quite. Try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct, {s} in a row',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasPol'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 180],
      y: [0, 0.55],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    let t = 0;
    /** Startzeit: Die hervorgehobene Wellenfront hat die Grenzfläche schon halb überquert. */
    const t0 = () => (p.mode === 'huygens' ? HX * Math.sin(p.alpha * DEG) + 0.6 : 0);

    const filters = (): number[] => (p.mitte ? [p.th1, p.th3, p.th2] : [p.th1, p.th2]);
    const absDelta = (a: number, b: number) => {
      const d = Math.abs(a - b) % 180;
      return Math.min(d, 180 - d);
    };

    /* Übung */
    let task: PolTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };

    const N_STOFF: Record<string, number> = { wasser: 1.33, glas: 1.5, diamant: 2.42 };
    const nS = () => N_STOFF[p.stoff as string] ?? 1.33;

    /* Diagramm der Reflexion */
    const refRegion = (w: number, h: number): Rect =>
      w >= 700 ? { x: Math.round(w * 0.5) + 6, y: 6, w: Math.round(w * 0.5) - 12, h: h - 12 } : { x: 6, y: Math.round(h * 0.5) + 6, w: w - 12, h: Math.round(h * 0.5) - 12 };
    const refPlot = new Plot(surface, { x: [0, 90], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: refRegion });

    function updateReadouts(): void {
      for (const k of ['I', 'delta', 'beta', 'lam', 'info']) ctx.readout(k, null);
      if (p.mode === 'welle') {
        const pass = p.wt === 'laengs' ? 1 : p.wpol ? 0.5 : malus(p.wf);
        ctx.readout('I', tr('wPass', { p: fmt.num(pass * 100, 0) }));
        ctx.readout('info', ctx.t(p.wt === 'laengs' ? 'wInfoL' : 'wInfoQ'));
        return;
      }
      if (p.mode === 'spiegel') {
        const f = fresnel(p.ra, nS());
        const R = (f.rs + f.rp) / 2;
        ctx.readout('I', `${tr('sR', { r: fmt.num(R * 100, 1) })}, ${tr('sRs', { s: fmt.num((f.rs / (f.rs + f.rp || 1)) * 100, 0) })}`);
        ctx.readout('delta', tr('sBrewster', { b: fmt.num(brewster(nS()), 1) }));
        if (p.brille) ctx.readout('beta', tr('sGlare', { g: fmt.num(glareThroughSunglasses(p.ra, nS()) * 100, 0) }));
        ctx.readout('info', ctx.t('sInfo'));
        return;
      }
      if (p.mode === 'lcd') {
        ctx.readout('I', tr('lPix', { p: fmt.num((lcdBrightness(p.u / 100) / 0.5) * 100, 0) }));
        ctx.readout('delta', tr('lTwist', { d: fmt.num(90 * (1 - p.u / 100), 0) }));
        ctx.readout('info', ctx.t('lInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'pol') {
        const I = chain(filters());
        ctx.readout('I', tr('IVal', { p: fmt.num(I, 3), pc: fmt.num(I * 100, 1) }));
        ctx.readout('delta', p.mitte ? tr('dVal3', { a: fmt.num(absDelta(p.th1, p.th3), 0), b: fmt.num(absDelta(p.th3, p.th2), 0) }) : tr('dVal', { d: fmt.num(absDelta(p.th1, p.th2), 0) }));
        ctx.readout('beta', null);
        ctx.readout('lam', null);
      } else {
        const b = refractionAngle(p.alpha, p.n);
        const g = criticalAngle(p.n);
        ctx.readout('beta', b === null ? tr('betaTR', { g: fmt.num(g ?? 0, 1) }) : tr('betaVal', { b: fmt.num(b, 1) }));
        ctx.readout('lam', tr('lamVal', { r: fmt.num(wavelengthRatio(p.n), 2) }));
        ctx.readout('I', null);
        ctx.readout('delta', null);
      }
    }

    /* ---------------- Polarisation ---------------- */
    function drawPol(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const y0 = r.y + r.h * 0.52;
      const xL = r.x + 46;
      const xR = r.x + r.w - 46;
      const R = Math.max(26, Math.min(r.h * 0.3, r.w * 0.11));
      const P = (x: number, y: number, z: number): [number, number] => [x - 0.42 * z, y0 - y + 0.26 * z];
      const angles = filters();
      const pos = p.mitte ? [0.24, 0.5, 0.76] : [0.3, 0.7];
      const fx = pos.map((u) => xL + (xR - xL) * u);
      const names = p.mitte ? [ctx.t('f1'), ctx.t('f3'), ctx.t('f2')] : [ctx.t('f1'), ctx.t('f2')];
      const fieldColor = th.series[0]!;

      // Lichtbündel als Achse
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(xL, y0);
      g.lineTo(xR, y0);
      g.stroke();
      g.setLineDash([]);

      // Amplituden in den Abschnitten
      const A0 = R * 0.75;
      const amps: number[] = [A0];
      const dirs: number[] = [0];
      for (let i = 0; i < angles.length; i++) {
        if (i === 0) amps.push(A0 / Math.SQRT2);
        else amps.push(amps[i]! * Math.cos((angles[i]! - angles[i - 1]!) * DEG));
        dirs.push(angles[i]! * DEG);
      }
      const edges = [xL + 14, ...fx, xR - 10];
      const k = (2 * Math.PI) / 70;
      const omega = 2 * Math.PI * 0.9;
      const drawFilter = (x: number, ang: number, name: string) => {
        const pts: [number, number][] = [];
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * 2 * Math.PI;
          pts.push(P(x, R * Math.cos(a), R * Math.sin(a)));
        }
        g.fillStyle = withAlpha(th.muted, 0.14);
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        g.beginPath();
        pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.closePath();
        g.fill();
        g.stroke();
        // Durchlassrichtung: parallele Linien
        const c = Math.cos(ang * DEG);
        const s = Math.sin(ang * DEG);
        g.strokeStyle = withAlpha(th.text, 0.55);
        g.lineWidth = 1;
        for (const o of [-0.6, -0.3, 0, 0.3, 0.6]) {
          const half = Math.sqrt(1 - o * o) * R * 0.95;
          // Mittelpunkt der Linie senkrecht zur Durchlassrichtung verschoben
          const oy = -s * o * R;
          const oz = c * o * R;
          const a = P(x, oy - c * half, oz - s * half);
          const b = P(x, oy + c * half, oz + s * half);
          g.beginPath();
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
          g.stroke();
        }
        subText(g, `${name} = ${fmt.num(ang, 0)}°`, x, y0 + R + 22, { size: 13, family: th.mathFont, weight: 600, color: th.text, halo: th.bg });
      };

      // Feld abschnittsweise; die Filter werden dazwischen gezeichnet (Tiefenwirkung)
      for (let seg = 0; seg < edges.length - 1; seg++) {
        const a = edges[seg]!;
        const b = edges[seg + 1]!;
        g.lineWidth = 2;
        for (let x = a + 6; x < b - 4; x += 9) {
          const phase = Math.cos(k * x - omega * t);
          let ang = dirs[seg]!;
          let amp = amps[seg]!;
          if (seg === 0) {
            ang = hashAngle(Math.round(x), Math.floor(t * 5));
            amp = A0;
          }
          const e = amp * phase;
          const tip = P(x, e * Math.cos(ang), e * Math.sin(ang));
          const base = P(x, 0, 0);
          g.strokeStyle = withAlpha(fieldColor, seg === 0 ? 0.45 : 0.9);
          g.beginPath();
          g.moveTo(base[0], base[1]);
          g.lineTo(tip[0], tip[1]);
          g.stroke();
        }
        if (seg < fx.length) drawFilter(fx[seg]!, angles[seg]!, names[seg]!);
      }

      // Lampe
      g.fillStyle = th.series[2]!;
      g.beginPath();
      g.arc(xL, y0, 12, 0, Math.PI * 2);
      g.fill();
      text(g, ctx.t('lamp'), xL, y0 + R + 22, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, ctx.t('unpol'), (edges[0]! + edges[1]!) / 2, y0 - R - 14, { font: `600 12px ${th.font}`, color: th.muted });

      // Schirm mit Helligkeit
      const I = chain(angles) / 0.5;
      const sw = 12;
      const sh = R * 1.6;
      g.fillStyle = withAlpha(th.series[2]!, 0.1 + 0.85 * I);
      g.fillRect(xR - sw / 2, y0 - sh / 2, sw, sh);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(xR - sw / 2, y0 - sh / 2, sw, sh);
      text(g, ctx.t('screen'), xR, y0 + R + 22, { font: `600 12px ${th.font}`, color: th.muted });
    }

    function drawChart(): void {
      const th = ctx.theme;
      const others = p.mitte ? [p.th1, p.th3] : [p.th1];
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((x) => chain([...others, x]), { color: th.series[1]!, width: 2, from: 0, to: 180 });
      plot.point(p.th2, chain(filters()), { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    /* ---------------- Huygens ---------------- */
    function drawHuygens(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = Math.min((r.w - 12) / (2 * HX), (r.h - 12) / (2 * HY));
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const P = (x: number, y: number): [number, number] => [cx + x * s, cy - y * s];
      const left = cx - HX * s;
      const right = cx + HX * s;
      const top = cy - HY * s;
      const bottom = cy + HY * s;
      const a = p.alpha * DEG;
      const sa = Math.sin(a);
      const bDeg = refractionAngle(p.alpha, p.n);
      const tir = bDeg === null;
      const b = (bDeg ?? 0) * DEG;
      const c2 = 1 / p.n;
      const shift = HX * sa;

      // Stoff 2 einfärben
      g.fillStyle = withAlpha(th.series[0]!, 0.09);
      g.fillRect(left, cy, right - left, bottom - cy);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(left, cy);
      g.lineTo(right, cy);
      g.stroke();

      /** Gerade k·r = d im Halbraum (oben/unten) zeichnen. */
      const front = (kx: number, ky: number, d: number, upper: boolean, color: string, width: number, dash: number[] = []) => {
        g.save();
        g.beginPath();
        if (upper) g.rect(left, top, right - left, cy - top);
        else g.rect(left, cy, right - left, bottom - cy);
        g.clip();
        const L2 = 20;
        const ox = d * kx;
        const oy = d * ky;
        const p1 = P(ox - ky * L2, oy + kx * L2);
        const p2 = P(ox + ky * L2, oy - kx * L2);
        g.strokeStyle = color;
        g.lineWidth = width;
        g.setLineDash(dash);
        g.beginPath();
        g.moveTo(p1[0], p1[1]);
        g.lineTo(p2[0], p2[1]);
        g.stroke();
        g.restore();
      };

      const k1: [number, number] = [sa, -Math.cos(a)];
      const k2: [number, number] = [Math.sin(b), -Math.cos(b)];
      const kr: [number, number] = [sa, Math.cos(a)];
      const faint = withAlpha(th.muted, 0.6);
      const cycle = Math.ceil(2 * HX * sa + 3);
      const mH = t - (t % cycle);
      const tau = t - mH;
      const mMin = Math.floor(t) - 30;
      for (let m = mMin; m <= Math.floor(t) + 30; m++) {
        const ph = t - m;
        if (Math.abs(m - mH) < 1e-9) continue;
        front(k1[0], k1[1], ph - shift, true, faint, 1);
        if (!tir) front(k2[0], k2[1], c2 * ph - HX * Math.sin(b), false, faint, 1);
        else front(kr[0], kr[1], ph - shift, true, withAlpha(th.series[3]!, 0.45), 1, [4, 4]);
      }
      // hervorgehobene Wellenfront
      const hi = th.series[1]!;
      front(k1[0], k1[1], tau - shift, true, hi, 3);
      if (!tir) front(k2[0], k2[1], c2 * tau - HX * Math.sin(b), false, hi, 3);
      else front(kr[0], kr[1], tau - shift, true, th.series[3]!, 3);

      // Elementarwellen von der Grenzfläche
      const N = 10;
      const speed2 = tir ? 1 : c2;
      g.save();
      g.beginPath();
      if (tir) g.rect(left, top, right - left, cy - top);
      else g.rect(left, cy, right - left, bottom - cy);
      g.clip();
      for (let j = 0; j <= N; j++) {
        const xj = -HX + (2 * HX * j) / N;
        const tj = (xj + HX) * sa;
        if (tau <= tj) continue;
        const rad = speed2 * (tau - tj) * s;
        const [px, py] = P(xj, 0);
        g.strokeStyle = withAlpha(tir ? th.series[3]! : th.series[0]!, 0.8);
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(px, py, rad, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = th.series[0]!;
        g.beginPath();
        g.arc(px, py, 3, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();

      // Lot und Strahlen
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(cx, top + 6);
      g.lineTo(cx, bottom - 6);
      g.stroke();
      g.setLineDash([]);
      const ray = (dx: number, dy: number, len: number, color: string, outward: boolean) => {
        const o = P(0, 0);
        const e = P(dx * len, dy * len);
        const [from, to] = outward ? [o, e] : [e, o];
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(from[0], from[1]);
        g.lineTo(to[0], to[1]);
        g.stroke();
        const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
        const hx = from[0] + (to[0] - from[0]) * 0.6;
        const hy = from[1] + (to[1] - from[1]) * 0.6;
        g.beginPath();
        g.moveTo(hx + 9 * Math.cos(ang), hy + 9 * Math.sin(ang));
        g.lineTo(hx - 6 * Math.cos(ang) - 5 * Math.sin(ang), hy - 6 * Math.sin(ang) + 5 * Math.cos(ang));
        g.lineTo(hx - 6 * Math.cos(ang) + 5 * Math.sin(ang), hy - 6 * Math.sin(ang) - 5 * Math.cos(ang));
        g.closePath();
        g.fill();
      };
      const rl = Math.min(HY * 0.9, 2.8);
      ray(-sa, Math.cos(a), rl, th.text, false);
      if (!tir) ray(Math.sin(b), -Math.cos(b), rl, th.text, true);
      else ray(sa, Math.cos(a), rl, th.series[3]!, true);

      // Winkelbögen
      const o = P(0, 0);
      const ra = 0.9 * s;
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(o[0], o[1], ra, -Math.PI / 2 - a, -Math.PI / 2);
      g.stroke();
      subText(g, 'α', o[0] - (ra + 12) * Math.sin(a / 2), o[1] - (ra + 12) * Math.cos(a / 2), { size: 14, family: th.mathFont, weight: 700, color: th.text, halo: th.bg });
      if (!tir) {
        g.beginPath();
        g.arc(o[0], o[1], ra, Math.PI / 2 - b, Math.PI / 2);
        g.stroke();
        subText(g, 'β', o[0] + (ra + 12) * Math.sin(b / 2), o[1] + (ra + 12) * Math.cos(b / 2), { size: 14, family: th.mathFont, weight: 700, color: th.text, halo: th.bg });
      }

      // Beschriftung
      text(g, ctx.t('m1'), left + 8, top + 14, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      text(g, ctx.t('m2'), left + 8, cy + 16, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      text(g, ctx.t('lot'), cx + 6, top + 14, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      if (tir) subText(g, ctx.t('total'), right - 8, cy + 18, { size: 13, family: th.font, weight: 700, color: th.series[3]!, align: 'right', halo: th.bg });
    }

    /* ---------------- Querwelle / Längswelle ---------------- */
    function drawWave(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const cy = H * 0.46;
      const x0 = 30;
      const x1 = W - 30;
      const slitX = x0 + (x1 - x0) * 0.5;
      const amp = Math.min(H * 0.22, 80);
      const k = (2 * Math.PI) / Math.max(80, (x1 - x0) / 5);
      const om = 4;
      const fAng = p.wf * DEG;
      const col = th.series[0]!;
      // Laufrichtung
      g.strokeStyle = withAlpha(th.muted, 0.5);
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(x0, cy);
      g.lineTo(x1, cy);
      g.stroke();
      g.setLineDash([]);
      // Spalt (als gedrehter Schlitz, schräg perspektivisch: Kreis mit Strich)
      const R = amp * 1.25;
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(slitX, cy, R * 0.32, R, 0, 0, Math.PI * 2);
      g.stroke();
      const sx = Math.sin(fAng) * R * 0.32;
      const sy = Math.cos(fAng) * R;
      g.strokeStyle = th.series[2]!;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(slitX - sx, cy - sy);
      g.lineTo(slitX + sx, cy + sy);
      g.stroke();
      text(g, `${ctx.t('wSlit')} ${fmt.num(p.wf, 0)}°`, slitX, cy - R - 14, { font: `700 13px ${th.font}`, color: th.series[2]! });
      if (p.wt === 'laengs') {
        // Dichte Streifen: Verdichtungen wandern nach rechts, unverändert hinter dem Spalt
        for (let x = x0; x <= x1; x += 6) {
          const d = Math.sin(k * x - om * t);
          const xx = x + d * 8;
          g.strokeStyle = withAlpha(col, 0.35 + 0.45 * (d + 1) * 0.5);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(xx, cy - amp * 0.6);
          g.lineTo(xx, cy + amp * 0.6);
          g.stroke();
        }
      } else {
        // Querwelle: Auslenkung in Richtung ψ; vor dem Spalt ψ wechselt (unpolarisiert) oder fest 0°
        const step = 10;
        for (let x = x0; x <= x1; x += step) {
          const phase = k * x - om * t;
          let ang: number;
          let a: number;
          if (x < slitX) {
            ang = p.wpol ? hashAngle(Math.floor((x - (om * t) / k) / 40), 0) : 0;
            a = Math.sin(phase);
          } else {
            ang = fAng;
            if (p.wpol) a = Math.sin(phase) * Math.SQRT1_2;
            else a = Math.sin(phase) * Math.cos(fAng);
          }
          // Projektion: senkrechte Komponente nach oben, waagerechte Komponente schräg (Tiefe)
          const dy = -Math.cos(ang) * a * amp;
          const dx = Math.sin(ang) * a * amp * 0.32;
          g.strokeStyle = withAlpha(col, x < slitX ? 0.7 : 0.95);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x, cy);
          g.lineTo(x + dx, cy + dy);
          g.stroke();
          g.beginPath();
          g.arc(x + dx, cy + dy, 2.2, 0, Math.PI * 2);
          g.fillStyle = col;
          g.fill();
        }
      }
      const pass = p.wt === 'laengs' ? 1 : p.wpol ? 0.5 : malus(p.wf);
      const fs = narrow ? 13 : 15;
      text(g, ctx.t(p.wt === 'laengs' ? 'wLaengs' : 'wQuer'), 16, 18, { font: `700 ${fs}px ${th.font}`, color: th.text, align: 'left' });
      text(g, tr('wPass', { p: fmt.num(pass * 100, 0) }), narrow ? 16 : slitX + 20, narrow ? H * 0.74 : H * 0.85, {
        font: `800 ${fs + 3}px ${th.font}`,
        color: pass > 0.05 ? th.series[2]! : th.series[3]!,
        align: 'left',
      });
      g.font = `500 ${fs - 1}px ${th.font}`;
      const lines = wrap(g, ctx.t(p.wt === 'laengs' ? 'wInfoL' : 'wInfoQ'), W - 32);
      lines.forEach((l, j) => text(g, l, 16, H - 14 - (lines.length - 1 - j) * (fs + 3), { font: `500 ${fs - 1}px ${th.font}`, color: th.muted, align: 'left' }));
    }

    /* ---------------- Reflexion und Sonnenbrille ---------------- */
    function drawMirror(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 700;
      const scene: Rect = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: H * 0.5 };
      const n = nS();
      const f = fresnel(p.ra, n);
      const a = p.ra * DEG;
      const sy = scene.y + scene.h * (wide ? 0.62 : 0.78);
      const cx = scene.x + scene.w / 2;
      const L0 = Math.min(scene.w * 0.42, wide ? scene.h * 0.55 : sy - scene.y - 34);
      // Oberfläche
      g.fillStyle = withAlpha(th.series[0]!, 0.18);
      g.fillRect(scene.x + 10, sy, scene.w - 20, scene.y + scene.h - sy - 10);
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(scene.x + 10, sy);
      g.lineTo(scene.x + scene.w - 10, sy);
      g.stroke();
      // Lot
      g.setLineDash([4, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx, sy - L0);
      g.lineTo(cx, sy + 30);
      g.stroke();
      g.setLineDash([]);
      // einfallender Strahl
      const ix = cx - L0 * Math.sin(a);
      const iy = sy - L0 * Math.cos(a);
      const rx = cx + L0 * Math.sin(a);
      const ry = iy;
      const ray = (x1: number, y1: number, x2: number, y2: number, col: string, w: number) => {
        g.strokeStyle = col;
        g.lineWidth = w;
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      };
      ray(ix, iy, cx, sy, th.series[3]!, 4);
      const R = (f.rs + f.rp) / 2;
      ray(cx, sy, rx, ry, withAlpha(th.series[3]!, 0.25 + 0.75 * Math.min(1, R * 4)), 2 + 6 * Math.min(1, R * 4));
      // Schwingungsrichtungen auf dem gespiegelten Strahl: Punkte (s, aus der Ebene) und Striche (p, in der Ebene)
      const len = Math.hypot(rx - cx, ry - sy);
      const ux = (rx - cx) / len;
      const uy = (ry - sy) / len;
      const share = f.rs / (f.rs + f.rp || 1);
      for (let j = 1; j <= 5; j++) {
        const px = cx + ux * len * (j / 6);
        const py = sy + uy * len * (j / 6);
        // s: Punkt-Kreuz
        g.beginPath();
        g.arc(px, py, 2 + 3 * share, 0, Math.PI * 2);
        g.fillStyle = th.series[1]!;
        g.fill();
        // p: Strich senkrecht zum Strahl in der Ebene
        const pl = 12 * (1 - share);
        if (pl > 0.5) {
          g.strokeStyle = th.series[2]!;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(px - uy * pl, py + ux * pl);
          g.lineTo(px + uy * pl, py - ux * pl);
          g.stroke();
        }
      }
      // Sonnenbrille am Ende des Strahls
      if (p.brille) {
        roundRect(g, rx - 22, ry - 30, 44, 22, 8);
        g.fillStyle = withAlpha(th.text, 0.75);
        g.fill();
        const glare = glareThroughSunglasses(p.ra, n);
        text(g, tr('sGlare', { g: fmt.num(glare * 100, 0) }), scene.x + 14, scene.y + (wide ? 56 : 16), { font: `700 13px ${th.font}`, color: th.series[2]!, align: 'left' });
      }
      text(g, `α = ${fmt.num(p.ra, 0)}°`, ix, iy - 12, { font: `700 13px ${th.font}`, color: th.text });
      if (wide) text(g, tr('sR', { r: fmt.num(R * 100, 1) }), scene.x + 14, scene.y + 18, { font: `600 13px ${th.font}`, color: th.text, align: 'left' });
      if (wide) text(g, tr('sRs', { s: fmt.num(share * 100, 0) }), scene.x + 14, scene.y + 36, { font: `500 13px ${th.font}`, color: th.muted, align: 'left' });

      // Diagramm
      refPlot.setRangePadded([0, 90], [0, 1], { left: 40, right: 12, top: 20, bottom: 24 });
      refPlot.setAxes({ x: { label: ctx.t('sAxisA'), minStep: 15 }, y: { label: ctx.t('sAxisR') } });
      refPlot.begin();
      refPlot.grid({ minor: false });
      refPlot.axes();
      refPlot.fn((x) => fresnel(x, n).rs, { color: th.series[1]!, width: 2.5, from: 0, to: 89.9 });
      refPlot.fn((x) => fresnel(x, n).rp, { color: th.series[2]!, width: 2.5, from: 0, to: 89.9 });
      const b = brewster(n);
      refPlot.vline(b, { color: th.muted, width: 1.2, dash: [4, 4] });
      refPlot.text(b, 0.92, tr('sBrewster', { b: fmt.num(b, 1) }), { color: th.muted, align: 'left', offset: [4, 0], size: 12 });
      refPlot.vline(p.ra, { color: th.series[3]!, width: 1.5 });
      refPlot.point(p.ra, f.rs, { color: th.series[1]!, radius: 4.5 });
      refPlot.point(p.ra, f.rp, { color: th.series[2]!, radius: 4.5 });
      refPlot.text(4, 0.62, ctx.t('sS'), { color: th.series[1]!, align: 'left', size: 12 });
      refPlot.text(4, 0.52, ctx.t('sP'), { color: th.series[2]!, align: 'left', size: 12 });
      refPlot.end();
    }

    /* ---------------- LCD ---------------- */
    function drawLcd(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 700;
      const scene: Rect = wide ? { x: 0, y: 0, w: W * 0.6, h: H } : { x: 0, y: 0, w: W, h: H * 0.55 };
      const u = p.u / 100;
      const twist = 90 * (1 - u);
      const cy = scene.y + scene.h * 0.5;
      const xs = [0.12, 0.3, 0.5, 0.7, 0.88].map((f) => scene.x + scene.w * f);
      const hh = Math.min(scene.h * 0.32, 90);
      const col = th.series[0]!;
      // Lampe
      g.beginPath();
      g.arc(xs[0]!, cy, 14, 0, Math.PI * 2);
      g.fillStyle = th.series[4] ?? th.series[3]!;
      g.fill();
      // Filter 1 (senkrecht) und Filter 2 (waagerecht)
      const filter = (x: number, angDeg: number, label: string) => {
        g.fillStyle = withAlpha(th.muted, 0.25);
        g.fillRect(x - 6, cy - hh, 12, hh * 2);
        const a = angDeg * DEG;
        g.strokeStyle = th.text;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x - Math.sin(a) * 18, cy - Math.cos(a) * hh * 0.8);
        g.lineTo(x + Math.sin(a) * 18, cy + Math.cos(a) * hh * 0.8);
        g.stroke();
        text(g, label, x, cy + hh + 14, { font: `600 11px ${th.font}`, color: th.muted });
      };
      filter(xs[1]!, 0, ctx.t('lFilter1'));
      filter(xs[3]!, 90, ctx.t('lFilter2'));
      // Flüssigkristall: kleine Stäbchen, die sich von 0° auf „twist“ drehen
      const cw = (xs[3]! - xs[1]!) * 0.5;
      g.fillStyle = withAlpha(th.series[2]!, 0.1);
      g.fillRect(xs[2]! - cw / 2, cy - hh, cw, hh * 2);
      for (let j = 0; j < 7; j++) {
        const x = xs[2]! - cw / 2 + (cw * (j + 0.5)) / 7;
        const ang = (twist * j) / 6;
        // mit Spannung richten sich die Stäbchen längs (in Laufrichtung) aus
        const len = 16;
        const lx = u > 0.5 ? len * u : Math.sin(ang * DEG) * 6;
        const ly = u > 0.5 ? 2 : Math.cos(ang * DEG) * len;
        g.strokeStyle = th.series[2]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x - lx / 2, cy - ly);
        g.lineTo(x + lx / 2, cy + ly);
        g.stroke();
      }
      text(g, `${ctx.t('lCrystal')} (${tr('lTwist', { d: fmt.num(twist, 0) })})`, xs[2]!, cy - hh - 12, { font: `600 11px ${th.font}`, color: th.series[2]! });
      // Lichtstrahl mit Schwingungsrichtung
      const bright = lcdBrightness(u) / 0.5;
      const seg = (xa: number, xb: number, angDeg: number, amp: number) => {
        for (let x = xa + 8; x < xb - 6; x += 14) {
          const a = angDeg * DEG;
          const s = Math.sin((x - t * 80) * 0.15) * amp * 14;
          g.strokeStyle = withAlpha(col, 0.3 + 0.7 * amp);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x - Math.sin(a) * s * 0.4, cy - Math.cos(a) * s);
          g.lineTo(x + Math.sin(a) * s * 0.4, cy + Math.cos(a) * s);
          g.stroke();
        }
      };
      seg(xs[0]!, xs[1]!, 0, 1);
      seg(xs[1]!, xs[2]! - cw / 2, 0, 0.7);
      seg(xs[2]! + cw / 2, xs[3]!, twist, 0.7);
      if (bright > 0.01) seg(xs[3]!, xs[4]!, 90, 0.7 * bright);
      // Bildpunkt
      roundRect(g, xs[4]! - 16, cy - 30, 32, 60, 6);
      g.fillStyle = withAlpha(th.text, 0.85 * (1 - bright) + 0.05);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.stroke();

      // Sieben-Segment-Anzeige: Segmente der Ziffer bekommen Spannung (dunkel)
      const panel: Rect = wide ? { x: scene.w + 20, y: 30, w: W - scene.w - 40, h: H - 60 } : { x: 20, y: scene.h + 10, w: W - 40, h: H - scene.h - 20 };
      const dh = Math.min(panel.h * 0.85, panel.w * 1.4);
      const dw = dh * 0.55;
      const ox = panel.x + (panel.w - dw) / 2;
      const oy = panel.y + (panel.h - dh) / 2;
      const tk = dw * 0.16;
      roundRect(g, ox - tk, oy - tk, dw + 2 * tk, dh + 2 * tk, 8);
      g.fillStyle = withAlpha(th.series[2]!, 0.1);
      g.fill();
      const on = SEGMENTS[Math.round(p.ziffer)] ?? '';
      const segs: Record<string, [number, number, number, number]> = {
        a: [tk, 0, dw - 2 * tk, tk],
        b: [dw - tk, tk, tk, dh / 2 - 1.5 * tk],
        c: [dw - tk, dh / 2 + tk / 2, tk, dh / 2 - 1.5 * tk],
        d: [tk, dh - tk, dw - 2 * tk, tk],
        e: [0, dh / 2 + tk / 2, tk, dh / 2 - 1.5 * tk],
        f: [0, tk, tk, dh / 2 - 1.5 * tk],
        g: [tk, dh / 2 - tk / 2, dw - 2 * tk, tk],
      };
      for (const [k, [sx, sy, sw, sh]] of Object.entries(segs)) {
        const active = on.includes(k);
        // aktive Segmente bekommen die eingestellte Spannung, die anderen keine
        const bri = active ? lcdBrightness(u) / 0.5 : 1;
        roundRect(g, ox + sx, oy + sy, sw, sh, tk / 2);
        g.fillStyle = withAlpha(th.text, 0.06 + 0.84 * (1 - bri));
        g.fill();
      }
    }

    /* ---------------- Übung ---------------- */
    function wrap(g: CanvasRenderingContext2D, str: string, maxW: number): string[] {
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawQuiz(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const pad = narrow ? 18 : 36;
      const maxW = W - 2 * pad;
      let y = pad;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.series[0]!;
      g.fillText(tr('qTitle', { n: p.qn }), pad, y);
      y += narrow ? 26 : 32;
      const fs = narrow ? 16 : 20;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 8;
      if (task.choices) {
        g.font = `600 ${narrow ? 14 : 16}px ${th.font}`;
        task.choices.forEach((c, i) => {
          g.fillStyle = p.qa.trim() === String(i + 1) ? th.series[0]! : th.text;
          g.fillText(`${i + 1}  ${c[ctx.lang]}`, pad + 12, y);
          y += narrow ? 22 : 26;
        });
        y += 6;
      }
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: ans }) : ctx.t(task.choices ? 'qHow' : 'qHowNum'), pad, y);
      y += 28;
      if (badInput) {
        g.fillStyle = th.series[3]!;
        g.fillText(ctx.t('qBad'), pad, y);
        y += 26;
      }
      if (verdict !== null) {
        g.font = `800 ${narrow ? 20 : 26}px ${th.font}`;
        g.fillStyle = verdict ? th.series[2]! : th.series[3]!;
        for (const line of wrap(g, ctx.t(verdict ? 'qOk' : 'qNo'), maxW)) {
          g.fillText(line, pad, y);
          y += narrow ? 26 : 34;
        }
        y += 4;
        if (verdict || tries >= 2) {
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          for (const line of wrap(g, `${ctx.t('qSol')}: ${task.solution[ctx.lang]}`, maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      const cnt = Math.min(10, score.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 22, 6, 0, Math.PI * 2);
        g.fillStyle = i < cnt ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function runCheck(): void {
      const res = checkTask(task, p.qa);
      if (res === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = res;
      tries += 1;
      if (tries === 1) score = { right: score.right + (res ? 1 : 0), all: score.all + 1, streak: res ? score.streak + 1 : 0 };
    }

    const canvasKey = () => ({ huygens: 'canvasHuy', welle: 'canvasW', spiegel: 'canvasS', lcd: 'canvasL', ueben: 'canvasQ' })[p.mode as string] ?? 'canvasPol';

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode') || changed.has('alpha') || changed.has('n')) t = t0();
        if (source === 'init' || source === 'replace' || changed.has('qn')) {
          task = makeTask(p.qn);
          verdict = null;
          tries = 0;
          badInput = false;
        }
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        surface.canvas.setAttribute('aria-label', ctx.t(canvasKey()));
        plot.setRangePadded([0, 180], [0, 0.55], { left: 40, right: 12, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('thLast') }, y: { label: ctx.t('Irel') } });
        updateReadouts();
      },
      action(id) {
        if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        t += Math.min(dt, 0.05) * (p.mode === 'huygens' ? 0.8 : 1);
      },
      resetTime() {
        t = t0();
      },
      render() {
        surface.begin();
        if (p.mode === 'welle') return drawWave();
        if (p.mode === 'spiegel') {
          refPlot.resize();
          return drawMirror();
        }
        if (p.mode === 'lcd') return drawLcd();
        if (p.mode === 'ueben') return drawQuiz();
        if (p.mode === 'huygens') {
          drawHuygens({ x: 0, y: 0, w: surface.width, h: surface.height });
          return;
        }
        const sp = split(surface.width, surface.height);
        plot.resize();
        drawPol(sp.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
