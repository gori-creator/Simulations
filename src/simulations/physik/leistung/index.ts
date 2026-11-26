import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import {
  checkTask,
  DEVICES,
  ETA_HYDRO,
  energyJ,
  floorsFor,
  FLOOR_H,
  HOUSEHOLD_W,
  hydroPower,
  liftSpeed,
  liftTime,
  makeTask,
  power,
  PRICE_KWH,
  PS,
  REFERENCES,
  toKWh,
  work,
  type DeviceId,
  type PowerTask,
} from './model';

const L = (de: string, en: string) => ({ de, en });
/** Höhe einer Treppenstufe in m. */
const STEP_H = 0.17;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.52);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Arbeit und Leistung: Wer eine Treppe hinaufläuft, verrichtet Hubarbeit.
 * Die Leistung wird mit Geräten und Maschinen verglichen.
 */
export default defineSimulation({
  id: 'leistung',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.8 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'treppe', label: L('Treppe: deine Leistung', 'Stairs: your power') },
        { value: 'heben', label: L('Heben: Kran und Aufzug', 'Lifting: crane and lift') },
        { value: 'diagramm', label: L('Arbeit-Zeit-Diagramm: zwei Läufer', 'Work–time graph: two runners') },
        { value: 'energie', label: L('Energie im Haushalt', 'Energy at home') },
        { value: 'wasser', label: L('Wasserkraftwerk', 'Hydroelectric plant') },
        { value: 'ueben', label: L('Üben: Aufgaben', 'Practice: tasks') },
      ],
      default: 'treppe',
      display: 'menu',
    },
    { key: 'm', type: 'number', label: L('Masse', 'Mass'), min: 20, max: 120, step: 1, default: 55, unit: 'kg', visibleIf: (v) => v.mode === 'treppe' || v.mode === 'energie' },
    {
      key: 'h',
      type: 'number',
      label: L('Höhe der Treppe', 'Height of the stairs'),
      min: 1,
      max: 20,
      step: 0.5,
      default: 6,
      unit: 'm',
      visibleIf: (v) => v.mode === 'treppe' || v.mode === 'diagramm',
    },
    { key: 't', type: 'number', label: L('Zeit', 'Time'), min: 2, max: 60, step: 0.5, default: 8, unit: 's', visibleIf: (v) => v.mode === 'treppe' },
    /* Heben */
    { key: 'lm', type: 'number', label: L('Last', 'Load'), min: 50, max: 2000, step: 50, default: 500, unit: 'kg', visibleIf: (v) => v.mode === 'heben' },
    { key: 'lh', type: 'number', label: L('Hubhöhe', 'Lifting height'), min: 2, max: 40, step: 1, default: 12, unit: 'm', visibleIf: (v) => v.mode === 'heben' },
    { key: 'lp', type: 'number', label: L('Motorleistung', 'Motor power'), min: 500, max: 20000, step: 500, default: 5000, unit: 'W', visibleIf: (v) => v.mode === 'heben' },
    /* Diagramm */
    { key: 'ma', type: 'number', label: L('Anna: Masse', 'Anna: mass'), min: 20, max: 120, step: 1, default: 50, unit: 'kg', visibleIf: (v) => v.mode === 'diagramm' },
    { key: 'ta', type: 'number', label: L('Anna: Zeit', 'Anna: time'), min: 2, max: 30, step: 0.5, default: 6, unit: 's', visibleIf: (v) => v.mode === 'diagramm' },
    { key: 'mb', type: 'number', label: L('Ben: Masse', 'Ben: mass'), min: 20, max: 120, step: 1, default: 80, unit: 'kg', visibleIf: (v) => v.mode === 'diagramm' },
    { key: 'tb', type: 'number', label: L('Ben: Zeit', 'Ben: time'), min: 2, max: 30, step: 0.5, default: 10, unit: 's', visibleIf: (v) => v.mode === 'diagramm' },
    /* Energie */
    {
      key: 'dv',
      type: 'choice',
      label: L('Gerät', 'Device'),
      options: [
        { value: 'handy', label: L('Handy laden (15 W)', 'Charging a phone (15 W)') },
        { value: 'laptop', label: L('Laptop (50 W)', 'Laptop (50 W)') },
        { value: 'tv', label: L('Fernseher (100 W)', 'TV (100 W)') },
        { value: 'staub', label: L('Staubsauger (700 W)', 'Vacuum cleaner (700 W)') },
        { value: 'kocher', label: L('Wasserkocher (2000 W)', 'Kettle (2000 W)') },
        { value: 'wasch', label: L('Waschmaschine (2200 W)', 'Washing machine (2200 W)') },
      ],
      default: 'tv',
      display: 'menu',
      visibleIf: (v) => v.mode === 'energie',
    },
    { key: 'dur', type: 'number', label: L('Laufzeit', 'Running time'), min: 1, max: 240, step: 1, default: 60, unit: 'min', visibleIf: (v) => v.mode === 'energie' },
    /* Wasser */
    { key: 'q', type: 'number', label: L('Wassermenge pro Sekunde', 'Water flow per second'), min: 0.5, max: 100, step: 0.5, default: 10, unit: 'm³/s', visibleIf: (v) => v.mode === 'wasser' },
    { key: 'wh', type: 'number', label: L('Fallhöhe', 'Head (drop height)'), min: 2, max: 300, step: 1, default: 20, unit: 'm', visibleIf: (v) => v.mode === 'wasser' },
    /* Übung */
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 10, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'heben'
      ? L(
          'Die Arbeit hängt nur von Last und Höhe ab. Die Motorleistung bestimmt, wie schnell es geht. Drücke Start.',
          'The work depends only on load and height. The motor power decides how fast it goes. Press play.',
        )
      : v.mode === 'diagramm'
        ? L('Je steiler die Gerade im Arbeit-Zeit-Diagramm, desto größer die Leistung. Drücke Start.', 'The steeper the line in the work–time graph, the greater the power. Press play.')
        : v.mode === 'energie'
          ? L(
              'Energie = Leistung · Zeit. Wie oft müsstest du ein Stockwerk hochsteigen, um diese Energie selbst aufzubringen?',
              'Energy = power · time. How many floors would you have to climb to supply this energy yourself?',
            )
          : v.mode === 'wasser'
            ? L(
                'Jede Sekunde fällt Wasser die Fallhöhe hinunter. Mehr Wasser oder mehr Höhe bedeutet mehr Leistung.',
                'Every second water falls down the head. More water or more height means more power.',
              )
            : v.mode === 'ueben'
              ? L('Gib die Zahl oder die Nummer der Antwort ein und drücke „Prüfen“.', 'Enter the number or the number of the answer and press “Check”.')
              : L(
                  'Miss an einer Treppe: Höhe (Stufen zählen, je etwa 17 cm), Zeit und deine Masse. Drücke Start und vergleiche deine Leistung mit Geräten.',
                  'Measure on real stairs: height (count the steps, about 17 cm each), time and your mass. Press play and compare your power with devices.',
                ),
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'W', label: L('Hubarbeit', 'Work done lifting'), spoiler: true },
    { key: 'P', label: L('Leistung', 'Power'), spoiler: true },
    { key: 'cmp', label: L('Vergleich', 'Comparison') },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'gehen', label: L('Gemütlich gehen', 'Walking calmly'), values: { mode: 'treppe', m: 55, h: 6, t: 15 } },
    { id: 'rennen', label: L('Hochrennen', 'Running up'), values: { mode: 'treppe', m: 55, h: 6, t: 5 } },
    { id: 'turm', label: L('Kirchturm (20 m)', 'Church tower (20 m)'), values: { mode: 'treppe', m: 70, h: 20, t: 60 } },
    { id: 'kran', label: L('Baukran: 1 t auf 20 m', 'Tower crane: 1 t up 20 m'), values: { mode: 'heben', lm: 1000, lh: 20, lp: 10000 } },
    { id: 'aufzug', label: L('Aufzug mit 8 Personen', 'Lift with 8 people'), values: { mode: 'heben', lm: 600, lh: 15, lp: 6000 } },
    { id: 'schwach', label: L('Schwacher Motor: gleiche Arbeit, mehr Zeit', 'Weak motor: same work, more time'), values: { mode: 'heben', lm: 600, lh: 15, lp: 1000 } },
    { id: 'zwei', label: L('Anna gegen Ben', 'Anna versus Ben'), values: { mode: 'diagramm', h: 6, ma: 50, ta: 6, mb: 80, tb: 10 } },
    { id: 'gleich', label: L('Gleiche Leistung, andere Zeit', 'Same power, different time'), values: { mode: 'diagramm', h: 6, ma: 40, ta: 5, mb: 80, tb: 10 } },
    { id: 'handy', label: L('Handy laden: 2 Stunden', 'Charging a phone: 2 hours'), values: { mode: 'energie', dv: 'handy', dur: 120, m: 55 } },
    { id: 'tv', label: L('Fernsehabend', 'An evening of TV'), values: { mode: 'energie', dv: 'tv', dur: 180, m: 55 } },
    { id: 'tee', label: L('Wasserkocher: 3 Minuten', 'Kettle: 3 minutes'), values: { mode: 'energie', dv: 'kocher', dur: 3, m: 55 } },
    { id: 'bach', label: L('Kleines Wasserrad am Bach', 'Small water wheel on a stream'), values: { mode: 'wasser', q: 0.5, wh: 3 } },
    { id: 'fluss', label: L('Flusskraftwerk', 'River power plant'), values: { mode: 'wasser', q: 100, wh: 10 } },
    { id: 'stausee', label: L('Stausee in den Alpen', 'Alpine reservoir'), values: { mode: 'wasser', q: 20, wh: 300 } },
    { id: 'quiz', label: L('Üben: sechs Aufgabenarten', 'Practice: six kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvas: 'Eine Person läuft eine Treppe hinauf, Höhe und Zeit sind angegeben; daneben ein Balkendiagramm, das die Leistung mit Geräten und Maschinen vergleicht',
      WVal: 'W = m·g·h ≈ {W} J',
      PVal: 'P = W/t ≈ {P} W ({ps} PS)',
      cmpVal: 'so viel wie {n} LED-Lampen',
      you: 'du',
      steps: '{n} Stufen',
      axis: 'Leistung in W (jeder Strich: zehnmal so viel)',
      axisShort: 'Leistung in W (Zehnerschritte)',
      canvasH: 'Ein Kran hebt eine Last; daneben Arbeit, Leistung, Zeit und Hubgeschwindigkeit',
      canvasD: 'Arbeit-Zeit-Diagramm für zwei Personen, die eine Treppe hinauflaufen; die Steigung der Geraden ist die Leistung',
      canvasE: 'Energie eines Haushaltsgeräts, umgerechnet in Kosten und in Stockwerke, die man dafür hochsteigen müsste',
      canvasWa: 'Wasserkraftwerk: Wasser fällt aus einem Stausee auf eine Turbine; daneben Leistung und versorgte Haushalte',
      canvasQ: 'Übungsaufgabe zu Arbeit und Leistung mit Rückmeldung und Punktestand',
      hW: 'Arbeit W = m·g·h ≈ {W}',
      hT: 'Zeit t = W : P ≈ {t} s',
      hV: 'Hubgeschwindigkeit v = P : (m·g) ≈ {v} m/s',
      hInfo: 'Doppelte Leistung heißt: gleiche Arbeit in der halben Zeit.',
      dA: 'Anna',
      dB: 'Ben',
      dAxisT: 't in s',
      dAxisW: 'W in kJ',
      dStronger: '{who} hat die größere Leistung.',
      dSame: 'Beide haben (fast) die gleiche Leistung.',
      dInfo: 'Die Steigung der Geraden ist Arbeit pro Zeit, also die Leistung.',
      eE: 'E = P·t = {kWh} kWh = {kJ} kJ',
      eCost: 'Kosten bei 0,35 € pro kWh: {c} €',
      eFloors: 'So oft müsstest du ein Stockwerk ({fh} m) hochsteigen: {n}',
      eFloorsShort: 'Stockwerke hochsteigen',
      eInfo: 'Ein Mensch leistet auf Dauer etwa 100 W – Strom aus der Steckdose ist sehr billige Arbeit.',
      wP: 'Leistung ≈ {P}',
      wHH: 'reicht für etwa {n} Haushalte',
      wInfo: 'P = η·ρ·Q·g·h mit Wirkungsgrad η ≈ 85 %. Ein Haushalt braucht im Mittel etwa 400 W.',
      wLake: 'Stausee',
      wTurb: 'Turbine',
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
      canvas: 'A person runs up a staircase, height and time are given; next to it a bar chart comparing the power with devices and machines',
      WVal: 'W = m·g·h ≈ {W} J',
      PVal: 'P = W/t ≈ {P} W ({ps} hp)',
      cmpVal: 'as much as {n} LED lamps',
      you: 'you',
      steps: '{n} steps',
      axis: 'power in W (each mark: ten times as much)',
      axisShort: 'power in W (steps of ten)',
      canvasH: 'A crane lifts a load; next to it work, power, time and lifting speed',
      canvasD: 'Work–time graph for two people running up the stairs; the slope of each line is the power',
      canvasE: 'Energy of a household device, converted into cost and into floors you would have to climb for it',
      canvasWa: 'Hydroelectric plant: water falls from a reservoir onto a turbine; next to it the power and the number of households supplied',
      canvasQ: 'Practice task on work and power with feedback and score',
      hW: 'Work W = m·g·h ≈ {W}',
      hT: 'Time t = W / P ≈ {t} s',
      hV: 'Lifting speed v = P / (m·g) ≈ {v} m/s',
      hInfo: 'Twice the power means: the same work in half the time.',
      dA: 'Anna',
      dB: 'Ben',
      dAxisT: 't in s',
      dAxisW: 'W in kJ',
      dStronger: '{who} has the greater power.',
      dSame: 'Both have (almost) the same power.',
      dInfo: 'The slope of the line is work per time, i.e. the power.',
      eE: 'E = P·t = {kWh} kWh = {kJ} kJ',
      eCost: 'Cost at €0.35 per kWh: €{c}',
      eFloors: 'Floors ({fh} m) you would have to climb: {n}',
      eFloorsShort: 'floors to climb',
      eInfo: 'A person can deliver about 100 W for a long time – electricity from the socket is very cheap work.',
      wP: 'Power ≈ {P}',
      wHH: 'enough for about {n} households',
      wInfo: 'P = η·ρ·Q·g·h with efficiency η ≈ 85 %. A household needs about 400 W on average.',
      wLake: 'reservoir',
      wTurb: 'turbine',
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
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let t = 0;
    let done = true;

    /* Übung */
    let task: PowerTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    /* Turbine und Wasser */
    let phase = 0;

    /** Leistung mit passender Einheit (W, kW, MW). */
    const watts = (P: number) => (P >= 1e6 ? `${fmt.num(P / 1e6, 1)} MW` : P >= 1e4 ? `${fmt.num(P / 1e3, 0)} kW` : P >= 1e3 ? `${fmt.num(P / 1e3, 1)} kW` : `${fmt.num(P, 0)} W`);
    const joules = (W: number) => (W >= 1e6 ? `${fmt.num(W / 1e6, 2)} MJ` : W >= 1e4 ? `${fmt.num(W / 1e3, 0)} kJ` : `${fmt.num(W, 0)} J`);
    const hidden = () => ctx.hidden;

    function updateReadouts(): void {
      for (const k of ['W', 'P', 'cmp', 'info']) ctx.readout(k, null);
      if (p.mode === 'heben') {
        ctx.readout('W', tr('hW', { W: joules(work(p.lm, p.lh)) }));
        ctx.readout('P', tr('hT', { t: fmt.num(liftTime(p.lm, p.lh, p.lp), 1) }));
        ctx.readout('cmp', tr('hV', { v: fmt.num(liftSpeed(p.lm, p.lp), 2) }));
        ctx.readout('info', ctx.t('hInfo'));
        return;
      }
      if (p.mode === 'diagramm') {
        const PA = power(p.ma, p.h, p.ta);
        const PB = power(p.mb, p.h, p.tb);
        ctx.readout('W', `${ctx.t('dA')}: ${joules(work(p.ma, p.h))}, ${ctx.t('dB')}: ${joules(work(p.mb, p.h))}`);
        ctx.readout('P', `${ctx.t('dA')}: ${fmt.num(PA, 0)} W, ${ctx.t('dB')}: ${fmt.num(PB, 0)} W`);
        ctx.readout('cmp', Math.abs(PA - PB) < 0.02 * Math.max(PA, PB) ? ctx.t('dSame') : tr('dStronger', { who: ctx.t(PA > PB ? 'dA' : 'dB') }));
        ctx.readout('info', ctx.t('dInfo'));
        return;
      }
      if (p.mode === 'energie') {
        const E = energyJ(DEVICES[p.dv as DeviceId].P, p.dur);
        ctx.readout('W', tr('eE', { kWh: fmt.num(toKWh(E), 3), kJ: fmt.num(E / 1000, 0) }));
        ctx.readout('P', tr('eCost', { c: fmt.fixed(toKWh(E) * PRICE_KWH, 2) }));
        ctx.readout('cmp', tr('eFloors', { fh: FLOOR_H, n: fmt.num(floorsFor(E, p.m), 0) }));
        ctx.readout('info', ctx.t('eInfo'));
        return;
      }
      if (p.mode === 'wasser') {
        const P = hydroPower(p.q, p.wh);
        ctx.readout('P', tr('wP', { P: watts(P) }));
        ctx.readout('cmp', tr('wHH', { n: fmt.num(P / HOUSEHOLD_W, 0) }));
        ctx.readout('info', ctx.t('wInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      const P = power(p.m, p.h, p.t);
      ctx.readout('W', tr('WVal', { W: fmt.num(work(p.m, p.h), 0) }));
      ctx.readout('P', tr('PVal', { P: fmt.num(P, 0), ps: fmt.num(P / PS, 2) }));
      ctx.readout('cmp', tr('cmpVal', { n: fmt.num(P / 10, 0) }));
    }

    function drawStairs(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const n = Math.max(1, Math.round(p.h / STEP_H));
      const shown = Math.min(n, 24);
      const left = r.x + 30;
      const right = r.x + r.w - 20;
      const bottom = r.y + r.h - 26;
      const H = Math.max(30, Math.min(70, r.h * 0.28));
      const top = r.y + 26 + H;
      const sw = (right - left) / (shown + 1);
      const sh = Math.min(sw * 0.9, (bottom - top) / shown);
      g.fillStyle = withAlpha(th.muted, 0.18);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(left, bottom);
      for (let i = 0; i < shown; i++) {
        g.lineTo(left + (i + 1) * sw, bottom - i * sh);
        g.lineTo(left + (i + 1) * sw, bottom - (i + 1) * sh);
      }
      g.lineTo(right, bottom - shown * sh);
      g.lineTo(right, bottom);
      g.closePath();
      g.fill();
      g.stroke();
      // Person: Fortschritt entlang der Treppe
      const u = done ? 1 : Math.min(1, t / p.t);
      const k = u * shown;
      const px = left + sw * (k + 0.5);
      const py = bottom - Math.floor(Math.min(k, shown - 1e-6) + 1e-9) * sh - (k >= shown ? sh : 0);
      const swing = Math.sin(k * Math.PI * 2) * 0.35 * (done ? 0 : 1);
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(px, py - H * 0.88, H * 0.1, 0, Math.PI * 2);
      g.moveTo(px, py - H * 0.78);
      g.lineTo(px, py - H * 0.4);
      g.lineTo(px + H * 0.2 * Math.sin(swing + 0.3), py);
      g.moveTo(px, py - H * 0.4);
      g.lineTo(px - H * 0.2 * Math.sin(swing + 0.3), py);
      g.moveTo(px, py - H * 0.7);
      g.lineTo(px + H * 0.2, py - H * 0.5 + H * 0.1 * swing);
      g.moveTo(px, py - H * 0.7);
      g.lineTo(px - H * 0.2, py - H * 0.5 - H * 0.1 * swing);
      g.stroke();
      // Höhenpfeil
      const ax = right + 8;
      g.strokeStyle = th.muted;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(ax, bottom);
      g.lineTo(ax, bottom - shown * sh);
      g.stroke();
      subText(g, `h = ${fmt.num(p.h, 1)} m`, ax - 6, bottom - shown * sh * 0.35, { size: 13, family: th.mathFont, weight: 700, color: th.text, align: 'right', halo: th.bg });
      subText(g, tr('steps', { n }), left, bottom + 16, { size: 12, family: th.font, weight: 600, color: th.muted, align: 'left', halo: th.bg });
      const tt = done ? p.t : Math.min(t, p.t);
      subText(g, `t = ${fmt.num(tt, 1)} s`, left, r.y + 20, { size: 14, family: th.mathFont, weight: 700, color: th.text, align: 'left', halo: th.bg });
    }

    function drawBars(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const P = power(p.m, p.h, p.t);
      const items = [...REFERENCES.map((q) => ({ name: ctx.lang === 'de' ? q.de : q.en, P: q.P, you: false })), { name: ctx.t('you'), P, you: true }].sort((a, b) => a.P - b.P);
      const lMin = 0;
      const lMax = 7;
      const labW = Math.min(150, r.w * 0.38);
      const x0 = r.x + labW + 12;
      const x1 = r.x + r.w - 16;
      const top = r.y + 20;
      const bottom = r.y + r.h - 40;
      const bh = Math.min(26, (bottom - top) / items.length - 6);
      const X = (v: number) => x0 + ((Math.log10(Math.max(v, 1)) - lMin) / (lMax - lMin)) * (x1 - x0);
      // Gitterlinien je Zehnerpotenz
      g.strokeStyle = withAlpha(th.muted, 0.35);
      g.lineWidth = 1;
      for (let e = lMin; e <= lMax; e++) {
        g.beginPath();
        g.moveTo(X(10 ** e), top - 4);
        g.lineTo(X(10 ** e), bottom + 4);
        g.stroke();
        const lab = e === 0 ? '1' : e < 3 ? String(10 ** e) : e < 6 ? `${10 ** (e - 3)}k` : `${10 ** (e - 6)}M`;
        text(g, lab, X(10 ** e), bottom + 16, { font: `500 11px ${th.font}`, color: th.muted });
      }
      g.font = `600 11px ${th.font}`;
      const ax = g.measureText(ctx.t('axis')).width < r.w - 16 ? ctx.t('axis') : ctx.t('axisShort');
      text(g, ax, r.x + r.w / 2, bottom + 32, { font: `600 11px ${th.font}`, color: th.muted });
      items.forEach((it, i) => {
        const y = top + i * ((bottom - top) / items.length);
        g.fillStyle = it.you ? th.series[0]! : withAlpha(th.series[1]!, 0.55);
        g.fillRect(x0, y, Math.max(2, X(it.P) - x0), bh);
        subText(g, it.name, x0 - 8, y + bh / 2, { size: 12, family: th.font, weight: it.you ? 700 : 500, color: it.you ? th.series[0]! : th.text, align: 'right', halo: th.bg });
      });
    }

    /* ---------- Heben ---------- */
    function drawLift(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const scene: Rect = narrow ? { x: 0, y: 0, w: W, h: H * 0.62 } : { x: 0, y: 0, w: W * 0.55, h: H };
      const T = liftTime(p.lm, p.lh, p.lp);
      const u = done ? 1 : Math.min(1, t / T);
      const ground = scene.y + scene.h - 24;
      const topY = scene.y + 40;
      const mastX = scene.x + scene.w * 0.3;
      const jibEnd = scene.x + scene.w * 0.82;
      const hookX = scene.x + scene.w * 0.62;
      // Boden
      g.fillStyle = withAlpha(th.muted, 0.25);
      g.fillRect(scene.x, ground, scene.w, 24);
      // Mast als Gitter
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 2;
      g.strokeRect(mastX - 10, topY, 20, ground - topY);
      for (let y = topY; y < ground - 16; y += 20) {
        g.beginPath();
        g.moveTo(mastX - 10, y);
        g.lineTo(mastX + 10, y + 20);
        g.stroke();
      }
      // Ausleger
      g.beginPath();
      g.moveTo(scene.x + scene.w * 0.12, topY);
      g.lineTo(jibEnd, topY);
      g.moveTo(scene.x + scene.w * 0.12, topY + 12);
      g.lineTo(jibEnd, topY + 12);
      g.stroke();
      // Gegengewicht
      g.fillStyle = th.muted;
      g.fillRect(scene.x + scene.w * 0.12, topY + 12, 26, 22);
      // Last: Höhe in Pixeln
      const span = ground - topY - 80;
      const scale = span / 40;
      const yBase = ground;
      const yNow = yBase - u * p.lh * scale;
      const lab = p.lm >= 1000 ? `${fmt.num(p.lm / 1000, 2)} t` : `${p.lm} kg`;
      g.font = `700 11px ${th.font}`;
      const box = Math.max(24, Math.min(54, 16 + Math.sqrt(p.lm) * 0.9));
      const boxW = Math.max(box, g.measureText(lab).width + 10);
      // Zielhöhe
      const yTarget = yBase - p.lh * scale;
      g.setLineDash([5, 4]);
      g.strokeStyle = th.series[2]!;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(hookX - box, yTarget);
      g.lineTo(scene.x + scene.w - 8, yTarget);
      g.stroke();
      g.setLineDash([]);
      text(g, `h = ${fmt.num(p.lh, 0)} m`, scene.x + scene.w - 10, yTarget - 10, { font: `700 12px ${th.font}`, color: th.series[2]!, align: 'right' });
      // Seil und Last
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(hookX, topY + 12);
      g.lineTo(hookX, yNow - box);
      g.stroke();
      roundRect(g, hookX - boxW / 2, yNow - box, boxW, box, 4);
      g.fillStyle = withAlpha(th.series[0]!, 0.85);
      g.fill();
      text(g, lab, hookX, yNow - box / 2, { font: `700 11px ${th.font}`, color: th.bg });
      text(g, `t = ${fmt.num(done ? T : Math.min(t, T), 1)} s`, scene.x + 14, scene.y + 18, { font: `700 14px ${th.font}`, color: th.text, align: 'left' });

      // Werte daneben
      const panel: Rect = narrow ? { x: 14, y: scene.h + 8, w: W - 28, h: H - scene.h - 8 } : { x: scene.w + 12, y: 30, w: W - scene.w - 24, h: H - 30 };
      let y = panel.y + 14;
      const fs = narrow ? 13 : 15;
      const line = (str: string, col: string, weight = 600) => {
        text(g, str, panel.x, y, { font: `${weight} ${fs}px ${th.font}`, color: col, align: 'left' });
        y += fs * 1.8;
      };
      line(tr('hW', { W: joules(work(p.lm, p.lh)) }), th.text, 700);
      line(`P = ${watts(p.lp)} (${fmt.num(p.lp / PS, 1)} ${ctx.lang === 'de' ? 'PS' : 'hp'})`, th.series[0]!, 700);
      if (!hidden()) {
        line(tr('hT', { t: fmt.num(T, 1) }), th.series[2]!, 700);
        line(tr('hV', { v: fmt.num(liftSpeed(p.lm, p.lp), 2) }), th.muted, 500);
      }
      // Fortschrittsbalken: Arbeit bisher
      const bw = Math.min(panel.w - 80, 300);
      roundRect(g, panel.x, y, bw, 14, 7);
      g.fillStyle = withAlpha(th.muted, 0.2);
      g.fill();
      roundRect(g, panel.x, y, Math.max(14, bw * u), 14, 7);
      g.fillStyle = th.series[2]!;
      g.fill();
      text(g, `${joules(work(p.lm, p.lh) * u)}`, panel.x + bw + 8, y + 7, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
    }

    /* ---------- Arbeit-Zeit-Diagramm ---------- */
    const plotRegion = (w: number, h: number): Rect => (w < 700 ? { x: 0, y: 0, w, h: Math.round(h * 0.72) } : { x: 0, y: 0, w: Math.round(w * 0.66), h });
    const plot = new Plot(surface, { x: [0, 30], y: [0, 10], equalAspect: false, pan: false, zoom: false, controls: false, region: plotRegion });

    function drawGraph(): void {
      const th = ctx.theme;
      const WA = work(p.ma, p.h) / 1000;
      const WB = work(p.mb, p.h) / 1000;
      const tMax = Math.max(p.ta, p.tb) * 1.15;
      const wMax = Math.max(WA, WB) * 1.2;
      plot.setRangePadded([0, tMax], [0, wMax], { left: 48, right: 18, top: 16, bottom: 26 });
      plot.setAxes({ x: { label: ctx.t('dAxisT'), minStep: 1 }, y: { label: ctx.t('dAxisW') } });
      const tt = done ? tMax : Math.min(t, tMax);
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const run = (T: number, Wk: number, col: string) => {
        plot.segment([0, 0], [T, Wk], { color: withAlpha(col, 0.35), width: 2, dash: [5, 4] });
        plot.segment([T, Wk], [tMax, Wk], { color: withAlpha(col, 0.35), width: 2, dash: [5, 4] });
        const now = Math.min(tt, T);
        plot.segment([0, 0], [now, (Wk * now) / T], { color: col, width: 3 });
        plot.point(now, (Wk * now) / T, { color: col, radius: 5 });
        // Steigungsdreieck
        const t1 = T * 0.35;
        const t2 = T * 0.7;
        plot.polygon(
          [
            [t1, (Wk * t1) / T],
            [t2, (Wk * t1) / T],
            [t2, (Wk * t2) / T],
          ],
          { fill: withAlpha(col, 0.12), stroke: withAlpha(col, 0.6), width: 1 },
        );
      };
      run(p.ta, WA, th.series[0]!);
      run(p.tb, WB, th.series[1]!);
      plot.end();

      const g = surface.g;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const reg = plotRegion(W, H);
      const x = narrow ? 14 : reg.w + 16;
      let y = narrow ? reg.h + 18 : 40;
      const fs = narrow ? 13 : 15;
      const line = (str: string, col: string, weight = 600) => {
        text(g, str, x, y, { font: `${weight} ${fs}px ${th.font}`, color: col, align: 'left' });
        y += fs * 1.7;
      };
      const PA = power(p.ma, p.h, p.ta);
      const PB = power(p.mb, p.h, p.tb);
      line(`${ctx.t('dA')}: ${p.ma} kg, ${fmt.num(p.ta, 1)} s → ${fmt.num(PA, 0)} W`, th.series[0]!, 700);
      line(`${ctx.t('dB')}: ${p.mb} kg, ${fmt.num(p.tb, 1)} s → ${fmt.num(PB, 0)} W`, th.series[1]!, 700);
      line(Math.abs(PA - PB) < 0.02 * Math.max(PA, PB) ? ctx.t('dSame') : tr('dStronger', { who: ctx.t(PA > PB ? 'dA' : 'dB') }), th.text, 600);
      if (!narrow) line(`t = ${fmt.num(tt, 1)} s`, th.muted, 500);
    }

    /* ---------- Energie im Haushalt ---------- */
    function drawEnergy(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const d = DEVICES[p.dv as DeviceId];
      const E = energyJ(d.P, p.dur);
      const floors = floorsFor(E, p.m);
      const pad = narrow ? 16 : 32;
      const fs = narrow ? 14 : 17;
      let y = pad + 6;
      text(g, `${ctx.lang === 'de' ? d.de : d.en}: ${d.P} W · ${p.dur} min`, pad, y, { font: `800 ${fs + 2}px ${th.font}`, color: th.series[0]!, align: 'left' });
      y += fs * 2;
      text(g, tr('eE', { kWh: fmt.num(toKWh(E), 3), kJ: fmt.num(E / 1000, 0) }), pad, y, { font: `600 ${fs}px ${th.font}`, color: th.text, align: 'left' });
      y += fs * 1.7;
      text(g, tr('eCost', { c: fmt.fixed(toKWh(E) * PRICE_KWH, 2) }), pad, y, { font: `600 ${fs}px ${th.font}`, color: th.text, align: 'left' });
      y += fs * 2.2;
      // Stockwerke als Treppen-Symbole
      g.font = `800 ${fs + 2}px ${th.font}`;
      for (const part of wrap(g, `${fmt.num(floors, 0)} × ${ctx.t('eFloorsShort')} (${p.m} kg, ${FLOOR_H} m)`, W - 2 * pad)) {
        text(g, part, pad, y, { font: `800 ${fs + 2}px ${th.font}`, color: th.series[2]!, align: 'left' });
        y += (fs + 2) * 1.3;
      }
      y += 4;
      const n = Math.round(floors);
      const per = n > 400 ? Math.ceil(n / 400) : 1;
      const icons = Math.ceil(n / per);
      const size = narrow ? 14 : 18;
      const cols = Math.max(1, Math.floor((W - 2 * pad) / (size + 4)));
      const rowsMax = Math.max(1, Math.floor((H - y - pad - 20) / (size + 4)));
      const showN = Math.min(icons, cols * rowsMax);
      g.strokeStyle = th.series[2]!;
      g.lineWidth = 1.6;
      for (let i = 0; i < showN; i++) {
        const cx = pad + (i % cols) * (size + 4);
        const cy = y + Math.floor(i / cols) * (size + 4);
        g.beginPath();
        g.moveTo(cx, cy + size);
        g.lineTo(cx + size / 3, cy + size);
        g.lineTo(cx + size / 3, cy + (size * 2) / 3);
        g.lineTo(cx + (size * 2) / 3, cy + (size * 2) / 3);
        g.lineTo(cx + (size * 2) / 3, cy + size / 3);
        g.lineTo(cx + size, cy + size / 3);
        g.lineTo(cx + size, cy);
        g.stroke();
      }
      const note = per > 1 ? (ctx.lang === 'de' ? `ein Symbol = ${per} Stockwerke` : `one symbol = ${per} floors`) : '';
      const bottomNote = [note, ctx.t('eInfo')].filter(Boolean).join(' · ');
      g.font = `500 ${narrow ? 11 : 13}px ${th.font}`;
      const lines = wrap(g, bottomNote, W - 2 * pad);
      lines.forEach((l, i) => text(g, l, pad, H - pad / 2 - (lines.length - 1 - i) * 16, { font: `500 ${narrow ? 11 : 13}px ${th.font}`, color: th.muted, align: 'left' }));
    }

    /* ---------- Wasserkraftwerk ---------- */
    function drawHydro(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const scene: Rect = narrow ? { x: 0, y: 0, w: W, h: H * 0.62 } : { x: 0, y: 0, w: W * 0.6, h: H };
      const P = hydroPower(p.q, p.wh);
      const ground = scene.y + scene.h - 20;
      const top = scene.y + 30;
      // Fallhöhe auf der Zeichnung: logarithmisch, damit 2 m und 300 m beide passen
      const frac = 0.15 + 0.85 * (Math.log10(p.wh) / Math.log10(300));
      const lakeY = ground - frac * (ground - top - 20);
      const damX = scene.x + scene.w * 0.38;
      const water = th.series[0]!;
      // See
      g.fillStyle = withAlpha(water, 0.3);
      g.fillRect(scene.x, lakeY, damX - scene.x, ground - lakeY);
      text(g, ctx.t('wLake'), scene.x + 12, lakeY + 16, { font: `600 12px ${th.font}`, color: th.text, align: 'left' });
      // Staumauer
      g.fillStyle = withAlpha(th.muted, 0.6);
      g.beginPath();
      g.moveTo(damX, lakeY - 10);
      g.lineTo(damX + 18, lakeY - 10);
      g.lineTo(damX + 36, ground);
      g.lineTo(damX, ground);
      g.closePath();
      g.fill();
      // Druckrohr
      const pipeW = Math.max(4, Math.min(16, 3 + Math.sqrt(p.q) * 1.3));
      const turbX = scene.x + scene.w * 0.72;
      const turbY = ground - 26;
      g.strokeStyle = withAlpha(th.text, 0.5);
      g.lineWidth = pipeW + 4;
      g.beginPath();
      g.moveTo(damX + 6, lakeY + 8);
      g.lineTo(turbX - 24, turbY);
      g.stroke();
      g.strokeStyle = withAlpha(water, 0.8);
      g.lineWidth = pipeW;
      g.stroke();
      // Wassertropfen im Rohr
      const n = 8;
      for (let i = 0; i < n; i++) {
        const u = (((phase * 0.5 + i / n) % 1) + 1) % 1;
        const x = damX + 6 + (turbX - 24 - damX - 6) * u;
        const y = lakeY + 8 + (turbY - lakeY - 8) * u;
        g.beginPath();
        g.arc(x, y, Math.max(1.5, pipeW / 4), 0, Math.PI * 2);
        g.fillStyle = th.bg;
        g.fill();
      }
      // Turbine
      const R = 22;
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(turbX, turbY, R, 0, Math.PI * 2);
      g.stroke();
      for (let k = 0; k < 6; k++) {
        const a = phase * 2 + (k * Math.PI) / 3;
        g.beginPath();
        g.moveTo(turbX, turbY);
        g.lineTo(turbX + R * Math.cos(a), turbY + R * Math.sin(a));
        g.stroke();
      }
      text(g, ctx.t('wTurb'), turbX, turbY + R + 12, { font: `600 12px ${th.font}`, color: th.text });
      // Abfluss
      g.fillStyle = withAlpha(water, 0.3);
      g.fillRect(turbX + R, ground - 8, scene.x + scene.w - turbX - R, 8);
      // Fallhöhe
      const hx = scene.x + scene.w - 14;
      g.strokeStyle = th.series[2]!;
      g.lineWidth = 1.5;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(scene.x, lakeY);
      g.lineTo(hx, lakeY);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(hx, lakeY);
      g.lineTo(hx, turbY);
      g.stroke();
      const lowHead = turbY - lakeY < 40;
      text(g, `h = ${fmt.num(p.wh, 0)} m`, hx - 6, lowHead ? lakeY - 12 : (lakeY + turbY) / 2, { font: `700 13px ${th.font}`, color: th.series[2]!, align: 'right' });
      // Boden
      g.fillStyle = withAlpha(th.muted, 0.25);
      g.fillRect(scene.x, ground, scene.w, scene.y + scene.h - ground);

      // Werte
      const panel: Rect = narrow ? { x: 14, y: scene.h + 10, w: W - 28, h: H - scene.h - 10 } : { x: scene.w + 14, y: 34, w: W - scene.w - 28, h: H - 34 };
      let y = panel.y + 10;
      const fs = narrow ? 13 : 15;
      const line = (str: string, col: string, weight = 600, size = fs) => {
        text(g, str, panel.x, y, { font: `${weight} ${size}px ${th.font}`, color: col, align: 'left' });
        y += size * 1.7;
      };
      line(`Q = ${fmt.num(p.q, 1)} m³/s  (${fmt.num(p.q * 1000, 0)} kg/s)`, th.text, 600);
      line(`η = ${fmt.num(ETA_HYDRO * 100, 0)} %`, th.muted, 500);
      line(tr('wP', { P: watts(P) }), th.series[0]!, 800, fs + 3);
      line(tr('wHH', { n: fmt.num(P / HOUSEHOLD_W, 0) }), th.series[2]!, 700);
      // Häuser als kleine Symbole (höchstens 60, sonst Maßstab)
      const hh = P / HOUSEHOLD_W;
      const per = hh > 60 ? 10 ** Math.ceil(Math.log10(hh / 60)) : 1;
      const icons = Math.min(60, Math.round(hh / per));
      const sz = 12;
      const cols = Math.max(1, Math.floor(panel.w / (sz + 5)));
      for (let i = 0; i < icons; i++) {
        const cx = panel.x + (i % cols) * (sz + 5);
        const cy = y + Math.floor(i / cols) * (sz + 6);
        if (cy + sz > H - 22) break;
        g.fillStyle = withAlpha(th.series[2]!, 0.8);
        g.beginPath();
        g.moveTo(cx, cy + sz * 0.45);
        g.lineTo(cx + sz / 2, cy);
        g.lineTo(cx + sz, cy + sz * 0.45);
        g.lineTo(cx + sz, cy + sz);
        g.lineTo(cx, cy + sz);
        g.closePath();
        g.fill();
      }
      if (per > 1)
        text(g, ctx.lang === 'de' ? `ein Haus = ${fmt.num(per, 0)} Haushalte` : `one house = ${fmt.num(per, 0)} households`, panel.x, H - 12, {
          font: `500 12px ${th.font}`,
          color: th.muted,
          align: 'left',
        });
    }

    /* ---------- Übung ---------- */
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

    /** Dauer der Animation je Ansicht in s. */
    const duration = () => (p.mode === 'heben' ? liftTime(p.lm, p.lh, p.lp) : p.mode === 'diagramm' ? Math.max(p.ta, p.tb) * 1.15 : p.t);
    const canvasKey = () => ({ heben: 'canvasH', diagramm: 'canvasD', energie: 'canvasE', wasser: 'canvasWa', ueben: 'canvasQ' })[p.mode as string] ?? 'canvas';

    return {
      update(changed, source) {
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
        if (changed.has('mode')) done = true;
        surface.canvas.setAttribute('aria-label', ctx.t(canvasKey()));
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
        const h = Math.min(dt, 0.05);
        if (p.mode === 'wasser') {
          phase += h * (0.4 + Math.log10(1 + hydroPower(p.q, p.wh) / 1000) * 0.5);
          return;
        }
        if (p.mode === 'energie' || p.mode === 'ueben') return;
        if (done) {
          done = false;
          t = 0;
        }
        // lange Vorgänge (Kran mit schwachem Motor) zeitgerafft auf höchstens 12 s
        const T = duration();
        t += p.mode === 'heben' ? h * Math.max(1, T / 12) : h;
        if (prefersReducedMotion()) t = T;
        if (t >= T) {
          done = true;
          ctx.clock.pause();
        }
      },
      resetTime() {
        t = 0;
        done = false;
        phase = 0;
      },
      render() {
        surface.begin();
        if (p.mode === 'heben') return drawLift();
        if (p.mode === 'diagramm') return drawGraph();
        if (p.mode === 'energie') return drawEnergy();
        if (p.mode === 'wasser') return drawHydro();
        if (p.mode === 'ueben') return drawQuiz();
        const sp = split(surface.width, surface.height);
        drawStairs(sp.scene);
        drawBars(sp.chart);
      },
      destroy: () => surface.destroy(),
    };
  },
});
