import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  airPressure,
  barometerHeight,
  bottomPressure,
  breeze,
  checkTask,
  G,
  hemisphereForce,
  hydraulic,
  hydrostatic,
  makeTask,
  outflowSpeed,
  P0,
  pressure,
  pumpLift,
  tapPressure,
  type PressureTask,
} from './model';

const L = (de: string, en: string) => ({ de, en });

type Mode = 'auflage' | 'hydraulik' | 'wasser' | 'gefaesse' | 'luft' | 'messen' | 'wind' | 'ueben';

/** Auflageflächen in cm² (beide Füße zusammen). */
const AREAS: Record<string, number> = { absatz: 4, schuh: 300, schneeschuh: 2000, ski: 3200 };
/** Hub des kleinen Kolbens (m). */
const STROKE = 0.1;
/** Dauer eines Pumphubs (s). */
const STROKE_T = 0.7;
/** Stockwerke am Wasserturm: Höhe der Hähne (m). */
const TAPS = [0, 8, 16, 24, 32];

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Druck in acht Ansichten: Auflagedruck im Schnee, hydraulische Presse mit
 * Pumphüben, Schweredruck beim Tauchen, verbundene Gefäße und Wasserturm,
 * Luftdruck in der Höhe, Druck messen (Barometer, Magdeburger Halbkugeln),
 * Land-See-Wind und eine Übung mit Rechenaufgaben.
 */
export default defineSimulation({
  id: 'druck',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'auflage', label: L('Druck = Kraft / Fläche', 'Pressure = force / area') },
        { value: 'hydraulik', label: L('Hydraulische Presse', 'Hydraulic press') },
        { value: 'wasser', label: L('Druck im Wasser: Tauchen', 'Pressure in water: diving') },
        { value: 'gefaesse', label: L('Verbundene Gefäße und Wasserturm', 'Connected vessels and water tower') },
        { value: 'luft', label: L('Luftdruck in der Höhe', 'Air pressure at altitude') },
        { value: 'messen', label: L('Druck messen: Barometer, Halbkugeln', 'Measuring pressure: barometer, hemispheres') },
        { value: 'wind', label: L('Wind durch Druckunterschiede', 'Wind from pressure differences') },
        { value: 'ueben', label: L('Üben: Aufgaben zum Druck', 'Practice: pressure tasks') },
      ],
      default: 'auflage',
      display: 'menu',
    },
    { key: 'F', type: 'number', label: L('Gewichtskraft der Person', 'Weight of the person'), min: 200, max: 1000, step: 10, default: 700, unit: 'N', visibleIf: (v) => v.mode === 'auflage' },
    {
      key: 'flaeche',
      type: 'choice',
      label: L('Schuhwerk', 'Footwear'),
      options: [
        { value: 'absatz', label: L('Stöckelschuhe (nur Absätze)', 'high heels (heels only)') },
        { value: 'schuh', label: L('Turnschuhe', 'trainers') },
        { value: 'schneeschuh', label: L('Schneeschuhe', 'snowshoes') },
        { value: 'ski', label: L('Ski', 'skis') },
      ],
      default: 'schuh',
      visibleIf: (v) => v.mode === 'auflage',
    },
    { key: 'F1', type: 'number', label: L('Kraft am kleinen Kolben', 'Force on the small piston'), min: 10, max: 500, step: 10, default: 100, unit: 'N', visibleIf: (v) => v.mode === 'hydraulik' },
    { key: 'd1', type: 'number', label: L('Durchmesser kleiner Kolben', 'Diameter small piston'), min: 1, max: 10, step: 0.5, default: 2, unit: 'cm', visibleIf: (v) => v.mode === 'hydraulik' },
    { key: 'd2', type: 'number', label: L('Durchmesser großer Kolben', 'Diameter large piston'), min: 5, max: 40, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.mode === 'hydraulik' },
    { key: 'h', type: 'number', label: L('Tauchtiefe', 'Diving depth'), min: 0, max: 40, step: 0.5, default: 10, unit: 'm', visibleIf: (v) => v.mode === 'wasser' },
    { key: 'salz', type: 'boolean', label: L('Meerwasser (ρ = 1025 kg/m³)', 'Sea water (ρ = 1025 kg/m³)'), default: false, visibleIf: (v) => v.mode === 'wasser' },
    {
      key: 'gv',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'form', label: L('Gefäße verschiedener Form', 'Vessels of different shapes') },
        { value: 'turm', label: L('Wasserturm', 'Water tower') },
      ],
      default: 'form',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'gefaesse',
    },
    { key: 'fh', type: 'number', label: L('Füllhöhe', 'Filling height'), min: 5, max: 50, step: 1, default: 30, unit: 'cm', visibleIf: (v) => v.mode === 'gefaesse' && v.gv === 'form' },
    { key: 'th', type: 'number', label: L('Wasserspiegel im Turm', 'Water level in the tower'), min: 10, max: 60, step: 1, default: 40, unit: 'm', visibleIf: (v) => v.mode === 'gefaesse' && v.gv === 'turm' },
    { key: 'hoehe', type: 'number', label: L('Höhe über dem Meer', 'Height above sea level'), min: 0, max: 9000, step: 1, default: 2000, unit: 'm', visibleIf: (v) => v.mode === 'luft' },
    {
      key: 'mv',
      type: 'choice',
      label: L('Gerät', 'Device'),
      options: [
        { value: 'baro', label: L('Barometer', 'Barometer') },
        { value: 'magde', label: L('Magdeburger Halbkugeln', 'Magdeburg hemispheres') },
      ],
      default: 'baro',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'messen',
    },
    { key: 'pa', type: 'number', label: L('Luftdruck', 'Air pressure'), min: 900, max: 1060, step: 1, default: 1013, unit: 'hPa', visibleIf: (v) => v.mode === 'messen' && v.mv === 'baro' },
    { key: 'r', type: 'number', label: L('Radius der Halbkugeln', 'Radius of the hemispheres'), min: 5, max: 40, step: 1, default: 25, unit: 'cm', visibleIf: (v) => v.mode === 'messen' && v.mv === 'magde' },
    { key: 'pin', type: 'number', label: L('Druck innen (abgepumpt)', 'Pressure inside (pumped out)'), min: 0, max: 1013, step: 1, default: 50, unit: 'hPa', visibleIf: (v) => v.mode === 'messen' && v.mv === 'magde' },
    { key: 'tag', type: 'boolean', label: L('Tag (Sonne scheint)', 'Day (sun shining)'), default: true, visibleIf: (v) => v.mode === 'wind' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('eine Zahl', 'a number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'auflage'
      ? L('Dieselbe Kraft, verschiedene Flächen: Wie tief sinkt man im Schnee ein?', 'Same force, different areas: how deep do you sink into the snow?')
      : v.mode === 'hydraulik'
        ? L('Der Druck ist in der ganzen Flüssigkeit gleich – am großen Kolben wirkt eine viel größere Kraft. Pumpe und beobachte, wie weit sich die Kolben bewegen.', 'Pressure is the same throughout the liquid – the large piston feels a much larger force. Pump and watch how far the pistons move.')
        : v.mode === 'wasser'
          ? L('Alle 10 m Wassertiefe kommt etwa 1 bar dazu.', 'Every 10 m of water adds about 1 bar.')
          : v.mode === 'gefaesse'
            ? L('Der Druck am Boden hängt nur von der Höhe des Wassers ab – nicht davon, wie viel Wasser im Gefäß ist.', 'The pressure at the bottom depends only on the height of the water – not on how much water is in the vessel.')
            : v.mode === 'luft'
              ? L('Je höher, desto weniger Luft liegt über uns.', 'The higher up, the less air lies above us.')
              : v.mode === 'messen'
                ? L('Der Luftdruck hält einer Flüssigkeitssäule das Gleichgewicht – und drückt luftleere Halbkugeln mit großer Kraft zusammen.', 'Air pressure balances a column of liquid – and presses evacuated hemispheres together with a large force.')
                : v.mode === 'wind'
                  ? L('Wo die Luft warm wird, steigt sie auf; am Boden entsteht tiefer Druck, und Wind strömt nach.', 'Where air gets warm it rises; low pressure forms at the ground and wind flows in.')
                  : L('Rechne und gib die Zahl ein. Komma oder Punkt sind beide in Ordnung.', 'Work it out and enter the number. A comma or a point are both fine.'),
  actions: [
    { id: 'pump', label: L('Pumpen (ein Hub)', 'Pump (one stroke)'), primary: true, visibleIf: (v) => v.mode === 'hydraulik' },
    { id: 'pump10', label: L('10 Hübe', '10 strokes'), visibleIf: (v) => v.mode === 'hydraulik' },
    { id: 'down', label: L('Ablassen', 'Release'), visibleIf: (v) => v.mode === 'hydraulik' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'p', label: L('Druck', 'Pressure'), spoiler: true },
    { key: 'F2', label: L('Kraft', 'Force'), spoiler: true },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'heel', label: L('Stöckelschuh', 'High heel'), values: { mode: 'auflage', flaeche: 'absatz' } },
    { id: 'snow', label: L('Schneeschuh', 'Snowshoe'), values: { mode: 'auflage', flaeche: 'schneeschuh' } },
    { id: 'car', label: L('Auto heben', 'Lift a car'), values: { mode: 'hydraulik', F1: 100, d1: 2, d2: 20 } },
    { id: 'same', label: L('Gleiche Kolben: keine Verstärkung', 'Equal pistons: no gain'), values: { mode: 'hydraulik', F1: 100, d1: 10, d2: 10 } },
    { id: 'dive', label: L('Tauchen 10 m', 'Diving 10 m'), values: { mode: 'wasser', h: 10 } },
    { id: 'dive30', label: L('Tauchen 30 m im Meer', 'Diving 30 m in the sea'), values: { mode: 'wasser', h: 30, salz: true } },
    { id: 'paradox', label: L('Hydrostatisches Paradoxon', 'Hydrostatic paradox'), values: { mode: 'gefaesse', gv: 'form', fh: 30 } },
    { id: 'tower', label: L('Wasserturm 40 m', 'Water tower 40 m'), values: { mode: 'gefaesse', gv: 'turm', th: 40 } },
    { id: 'towerlow', label: L('Turm zu niedrig: oben kein Wasser', 'Tower too low: no water at the top'), values: { mode: 'gefaesse', gv: 'turm', th: 20 } },
    { id: 'zug', label: L('Zugspitze', 'Zugspitze'), values: { mode: 'luft', hoehe: 2962 } },
    { id: 'everest', label: L('Mount Everest', 'Mount Everest'), values: { mode: 'luft', hoehe: 8849 } },
    { id: 'baro', label: L('Barometer: Quecksilber und Wasser', 'Barometer: mercury and water'), values: { mode: 'messen', mv: 'baro', pa: 1013 } },
    { id: 'storm', label: L('Sturmtief 960 hPa', 'Storm low 960 hPa'), values: { mode: 'messen', mv: 'baro', pa: 960 } },
    { id: 'magde', label: L('Magdeburger Halbkugeln (1656)', 'Magdeburg hemispheres (1656)'), values: { mode: 'messen', mv: 'magde', r: 25, pin: 50 } },
    { id: 'day', label: L('Seewind am Tag', 'Sea breeze by day'), values: { mode: 'wind', tag: true } },
    { id: 'night', label: L('Landwind in der Nacht', 'Land breeze at night'), values: { mode: 'wind', tag: false } },
    { id: 'quiz', label: L('Üben: neun Aufgaben', 'Practice: nine tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvas: 'Druck: Person im Schnee, hydraulische Presse, Taucher, Gefäße und Wasserturm, Berg, Barometer und Halbkugeln oder Küste mit Wind; daneben Diagramme',
      canvasQuiz: 'Übungsaufgabe zum Druck mit Rückmeldung',
      pAuflage: 'p = F / A = {F} N / {A} cm² ≈ {p}',
      pHyd: 'p = F₁ / A₁ ≈ {p} (überall in der Flüssigkeit gleich)',
      F2Val: 'F₂ = p · A₂ ≈ {F} N – {k}-mal so groß; dafür bewegt sich der große Kolben nur 1/{k} des Weges.',
      pumpInfo: '{n} Hübe à {s} cm: großer Kolben {h} cm gehoben. Arbeit: F₁ · s₁ = {W1} J = F₂ · s₂',
      pWater: 'p = p_Luft + ρ · g · h ≈ 1,013 bar + {w} bar = {p} bar',
      pVessel: 'p = ρ · g · h ≈ {p} Pa am Boden – in allen Gefäßen gleich',
      FVessel: 'Wassermengen {v1} l, {v2} l, {v3} l – trotzdem gleicher Druck',
      pTower: 'Hahn im Erdgeschoss: {p0} bar, im obersten Stock (32 m): {p4} bar',
      tTower: 'Wo der Hahn höher liegt als der Wasserspiegel im Turm, kommt kein Wasser.',
      pAir: 'p ≈ {p} hPa ({r} % des Drucks auf Meereshöhe)',
      pBaro: 'Quecksilbersäule {hg} mm, Wassersäule {hw} m',
      FMagde: 'F = (p_außen − p_innen) · π · r² ≈ {F} N – so viel wie die Gewichtskraft von {m} kg',
      iBaro: 'Der Luftdruck drückt auf die offene Schale und hält die Säule im Rohr. Über der Säule ist fast Vakuum.',
      iMagde: 'Innen fehlt die Luft, außen drückt sie mit voller Kraft. Otto von Guericke ließ 1656 Pferde daran ziehen.',
      windDay: 'Tagsüber wird das Land wärmer als das Meer. Über dem Land steigt warme Luft auf, am Boden entsteht ein Tief (T). Die Luft strömt vom Hoch (H) über dem Meer zum Land: Seewind.',
      windNight: 'Nachts kühlt das Land schneller ab als das Meer. Jetzt steigt die Luft über dem wärmeren Meer auf, und der Wind weht vom Land aufs Meer: Landwind.',
      kPa: 'p in kPa',
      bar: 'p in bar',
      hPa: 'p in hPa',
      hm: 'h in m',
      hcm: 'h in cm',
      Pa: 'p in Pa',
      zm: 'Höhe des Hahns in m',
      strokes: 'Hübe',
      hLift: 'Hubhöhe in cm',
      kN: 'F in kN',
      pinAx: 'p innen in hPa',
      hgAx: 'Säule in mm',
      land: 'Land',
      sea: 'Meer',
      car: 'Auto',
      floor: 'Stock',
      noWater: 'kein Wasser',
      mercury: 'Quecksilber',
      water: 'Wasser',
      vacuum: 'Vakuum',
      lowP: 'T',
      qTitle: 'Aufgabe {n}',
      qHow: 'Gib deine Antwort ein und drücke „Prüfen“.',
      qOk: 'Richtig!',
      qNo: 'Noch nicht – versuche es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig · Serie {s}',
      qYour: 'Deine Antwort: {a}',
      qBad: 'Bitte eine Zahl eingeben.',
    },
    en: {
      canvas: 'Pressure: person in snow, hydraulic press, diver, vessels and water tower, mountain, barometer and hemispheres or coast with wind; next to it graphs',
      canvasQuiz: 'Practice task on pressure with feedback',
      pAuflage: 'p = F / A = {F} N / {A} cm² ≈ {p}',
      pHyd: 'p = F₁ / A₁ ≈ {p} (the same everywhere in the liquid)',
      F2Val: 'F₂ = p · A₂ ≈ {F} N – {k} times as large; in return the large piston moves only 1/{k} of the distance.',
      pumpInfo: '{n} strokes of {s} cm: large piston raised {h} cm. Work: F₁ · s₁ = {W1} J = F₂ · s₂',
      pWater: 'p = p_air + ρ · g · h ≈ 1.013 bar + {w} bar = {p} bar',
      pVessel: 'p = ρ · g · h ≈ {p} Pa at the bottom – the same in every vessel',
      FVessel: 'amounts of water {v1} l, {v2} l, {v3} l – still the same pressure',
      pTower: 'tap on the ground floor: {p0} bar, on the top floor (32 m): {p4} bar',
      tTower: 'Where the tap is higher than the water level in the tower, no water comes out.',
      pAir: 'p ≈ {p} hPa ({r} % of the pressure at sea level)',
      pBaro: 'mercury column {hg} mm, water column {hw} m',
      FMagde: 'F = (p_out − p_in) · π · r² ≈ {F} N – as much as the weight of {m} kg',
      iBaro: 'Air pressure pushes on the open dish and holds up the column in the tube. Above the column there is almost a vacuum.',
      iMagde: 'Inside there is no air, outside the air pushes with full force. In 1656 Otto von Guericke had horses pull on them.',
      windDay: 'By day the land gets warmer than the sea. Warm air rises over the land, a low (L) forms at the ground. Air flows from the high (H) over the sea to the land: sea breeze.',
      windNight: 'At night the land cools faster than the sea. Now air rises over the warmer sea and the wind blows from land to sea: land breeze.',
      kPa: 'p in kPa',
      bar: 'p in bar',
      hPa: 'p in hPa',
      hm: 'h in m',
      hcm: 'h in cm',
      Pa: 'p in Pa',
      zm: 'height of the tap in m',
      strokes: 'strokes',
      hLift: 'lift in cm',
      kN: 'F in kN',
      pinAx: 'p inside in hPa',
      hgAx: 'column in mm',
      land: 'land',
      sea: 'sea',
      car: 'car',
      floor: 'floor',
      noWater: 'no water',
      mercury: 'mercury',
      water: 'water',
      vacuum: 'vacuum',
      lowP: 'L',
      qTitle: 'Task {n}',
      qHow: 'Enter your answer and press “Check”.',
      qOk: 'Correct!',
      qNo: 'Not yet – try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct · streak {s}',
      qYour: 'Your answer: {a}',
      qBad: 'Please enter a number.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const en = () => ctx.lang === 'en';
    const mode = () => p.mode as Mode;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });
    let anim = 0;

    /* Hydraulik: Hübe und laufender Hub */
    let strokes = 0;
    let queued = 0;
    let strokePhase = 0;

    /* Übung */
    let task: PressureTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };

    const rho = () => (p.salz ? 1025 : 1000);
    const pText = (pa: number) => (pa >= 1e5 ? `${fmt.num(pa / 1e5, 2)} bar` : pa >= 1000 ? `${fmt.num(pa / 1000, 1)} kPa` : `${fmt.num(pa, 0)} Pa`);
    const area = (d: number) => (Math.PI * (d / 100) ** 2) / 4;
    /** Hubhöhe des großen Kolbens in cm (inkl. laufendem Hub). */
    const liftCm = () => pumpLift(strokes + strokePhase, STROKE, area(p.d1), area(p.d2)) * 100;

    function setupPlot(): void {
      const m = mode();
      const pad = { left: 52, right: 14, top: 22, bottom: 24 };
      if (m === 'auflage') {
        plot.setRangePadded([0, 4.6], [0, 3000], pad);
        plot.setAxes({ x: { label: '' }, y: { label: ctx.t('kPa') } });
      } else if (m === 'hydraulik') {
        const k = area(p.d1) / area(p.d2);
        plot.setRangePadded([0, 30], [0, Math.max(1, 30 * STROKE * 100 * k * 1.1)], pad);
        plot.setAxes({ x: { label: ctx.t('strokes'), minStep: 1 }, y: { label: ctx.t('hLift') } });
      } else if (m === 'wasser') {
        plot.setRangePadded([0, 40], [0, 5.5], pad);
        plot.setAxes({ x: { label: ctx.t('hm') }, y: { label: ctx.t('bar') } });
      } else if (m === 'gefaesse') {
        if (p.gv === 'form') {
          plot.setRangePadded([0, 50], [0, 5200], pad);
          plot.setAxes({ x: { label: ctx.t('hcm') }, y: { label: ctx.t('Pa') } });
        } else {
          plot.setRangePadded([0, 40], [0, 6.2], pad);
          plot.setAxes({ x: { label: ctx.t('zm') }, y: { label: ctx.t('bar') } });
        }
      } else if (m === 'luft') {
        plot.setRangePadded([0, 9000], [0, 1100], pad);
        plot.setAxes({ x: { label: ctx.t('hm') }, y: { label: ctx.t('hPa') } });
      } else if (m === 'messen') {
        if (p.mv === 'baro') {
          plot.setRangePadded([0, 1060], [0, 820], pad);
          plot.setAxes({ x: { label: ctx.t('hPa') }, y: { label: ctx.t('hgAx') } });
        } else {
          const Fmax = hemisphereForce(p.r / 100, 0) / 1000;
          plot.setRangePadded([0, 1013], [0, Math.max(0.5, Fmax * 1.12)], pad);
          plot.setAxes({ x: { label: ctx.t('pinAx') }, y: { label: ctx.t('kN') } });
        }
      }
    }

    function updateReadouts(): void {
      for (const k of ['p', 'F2', 'info']) ctx.readout(k, null);
      const m = mode();
      if (m === 'auflage') {
        const A = AREAS[p.flaeche]!;
        ctx.readout('p', tr('pAuflage', { F: fmt.num(p.F, 0), A: fmt.num(A, 0), p: pText(pressure(p.F, A / 1e4)) }));
      } else if (m === 'hydraulik') {
        const h = hydraulic(p.F1, area(p.d1), area(p.d2), 1);
        ctx.readout('p', tr('pHyd', { p: pText(h.p) }));
        ctx.readout('F2', tr('F2Val', { F: fmt.num(h.F2, 0), k: fmt.num(h.F2 / p.F1, 0) }));
        if (strokes > 0) ctx.readout('info', tr('pumpInfo', { n: strokes, s: fmt.num(STROKE * 100, 0), h: fmt.num(liftCm(), 2), W1: fmt.num(p.F1 * STROKE * strokes, 1) }));
      } else if (m === 'wasser') {
        const w = hydrostatic(rho(), p.h) / 1e5;
        ctx.readout('p', tr('pWater', { w: fmt.num(w, 2), p: fmt.num(1.013 + w, 2) }));
      } else if (m === 'gefaesse') {
        if (p.gv === 'form') {
          const b = bottomPressure(1000, p.fh / 100, 0.01);
          ctx.readout('p', tr('pVessel', { p: fmt.num(b.p, 0) }));
          const vols = vesselVolumes();
          ctx.readout('F2', tr('FVessel', { v1: fmt.num(vols[0]!, 1), v2: fmt.num(vols[1]!, 1), v3: fmt.num(vols[2]!, 1) }));
        } else {
          ctx.readout('p', tr('pTower', { p0: fmt.num(tapPressure(p.th, 0) / 1e5, 2), p4: fmt.num(tapPressure(p.th, 32) / 1e5, 2) }));
          ctx.readout('info', ctx.t('tTower'));
        }
      } else if (m === 'luft') {
        const pa = airPressure(p.hoehe);
        ctx.readout('p', tr('pAir', { p: fmt.num(pa, 0), r: fmt.num((100 * pa) / P0, 0) }));
      } else if (m === 'messen') {
        if (p.mv === 'baro') {
          ctx.readout('p', tr('pBaro', { hg: fmt.num(barometerHeight(p.pa, 13546) * 1000, 0), hw: fmt.num(barometerHeight(p.pa, 1000), 2) }));
          ctx.readout('info', ctx.t('iBaro'));
        } else {
          const F = hemisphereForce(p.r / 100, p.pin);
          ctx.readout('F2', tr('FMagde', { F: fmt.num(F, 0), m: fmt.num(F / G, 0) }));
          ctx.readout('info', ctx.t('iMagde'));
        }
      } else if (m === 'wind') {
        ctx.readout('info', ctx.t(p.tag ? 'windDay' : 'windNight'));
      } else {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
      }
    }

    /** Wassermengen der drei Gefäße in Litern (Röhre, Eimer, Trichter-Schüssel). */
    function vesselVolumes(): number[] {
      const h = p.fh / 10; // dm
      const tube = Math.PI * 0.25 ** 2 * h;
      const bucket = Math.PI * 1 ** 2 * h;
      // Schüssel: unten Radius 1 dm, oben weiter (Kegelstumpf, Wand mit 45°)
      const r2 = 1 + h;
      const bowl = (Math.PI * h * (1 + r2 + r2 * r2)) / 3;
      return [tube, bucket, bowl];
    }

    /* ---------- Hilfen ---------- */
    function arrow(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w = 3): void {
      const a = Math.atan2(y1 - y0, x1 - x0);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - 8 * Math.cos(a), y1 - 8 * Math.sin(a));
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - 12 * Math.cos(a) + 6 * Math.sin(a), y1 - 12 * Math.sin(a) - 6 * Math.cos(a));
      g.lineTo(x1 - 12 * Math.cos(a) - 6 * Math.sin(a), y1 - 12 * Math.sin(a) + 6 * Math.cos(a));
      g.closePath();
      g.fill();
    }

    function wrap(g: CanvasRenderingContext2D, s: string, maxW: number): string[] {
      const lines: string[] = [];
      let cur = '';
      for (const w of s.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /* ---------- Auflagedruck ---------- */
    function drawAuflage(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const A = AREAS[p.flaeche]!;
      const pr = pressure(p.F, A / 1e4);
      const snowTop = r.y + r.h * 0.62;
      g.fillStyle = withAlpha(th.muted, th.dark ? 0.35 : 0.18);
      g.fillRect(r.x + 10, snowTop, r.w - 20, r.y + r.h - snowTop - 10);
      // Einsinken: logarithmisch, damit alle Fälle ins Bild passen
      const sink = Math.min(r.h * 0.3, 6 * Math.log10(1 + pr / 200) * 6);
      const cx = r.x + r.w / 2;
      const footW = Math.min(r.w * 0.5, 30 + Math.sqrt(A) * 3.2);
      const foot = snowTop + sink;
      const bodyH = Math.min(r.h * 0.4, 130);
      const top = foot - bodyH - 12;
      g.lineWidth = 5;
      g.strokeStyle = th.text;
      g.beginPath();
      g.arc(cx, top + 12, 12, 0, Math.PI * 2);
      g.moveTo(cx, top + 24);
      g.lineTo(cx, top + bodyH * 0.6);
      g.lineTo(cx - 14, foot - 8);
      g.moveTo(cx, top + bodyH * 0.6);
      g.lineTo(cx + 14, foot - 8);
      g.moveTo(cx - 24, top + 40);
      g.lineTo(cx + 24, top + 40);
      g.stroke();
      g.fillStyle = th.series[0]!;
      if (p.flaeche === 'absatz') {
        g.fillRect(cx - 18, foot - 8, 6, 8);
        g.fillRect(cx + 12, foot - 8, 6, 8);
      } else {
        roundRect(g, cx - footW / 2, foot - 8, footW, 8, 3);
        g.fill();
      }
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(r.x + 10, snowTop);
      g.lineTo(r.x + r.w - 10, snowTop);
      g.stroke();
      g.setLineDash([]);
      arrow(g, cx + footW / 2 + 30, top + 30, cx + footW / 2 + 30, top + 30 + 40 + p.F / 15, th.series[1]!);
      text(g, `F = ${fmt.num(p.F, 0)} N`, cx + footW / 2 + 40, top + 40, { font: `700 13px ${th.font}`, color: th.series[1]!, align: 'left' });
      text(g, `A = ${fmt.num(A, 0)} cm²`, cx, r.y + r.h - 26, { font: `700 13px ${th.font}`, color: th.text });
    }

    function drawAuflageChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const keys = ['absatz', 'schuh', 'schneeschuh', 'ski'];
      const names: Record<string, [string, string]> = { absatz: ['Absatz', 'heel'], schuh: ['Schuh', 'shoe'], schneeschuh: ['Schneeschuh', 'snowshoe'], ski: ['Ski', 'ski'] };
      keys.forEach((k, i) => {
        const v = pressure(p.F, AREAS[k]! / 1e4) / 1000;
        const shown = Math.min(v, 2900);
        const x = 0.6 + i * 1.1;
        plot.polygon(
          [
            [x - 0.35, 0],
            [x + 0.35, 0],
            [x + 0.35, shown],
            [x - 0.35, shown],
          ],
          { fill: k === p.flaeche ? th.series[1]! : withAlpha(th.muted, 0.4) },
        );
        plot.text(x, shown, fmt.num(v, v < 10 ? 1 : 0), { color: th.text, size: 12, weight: 'bold', align: 'center', offset: [0, -8] });
        plot.text(x, shown, names[k]![en() ? 1 : 0], { color: th.muted, size: 11, align: 'center', offset: [0, -24] });
      });
      plot.end();
    }

    /* ---------- Hydraulische Presse ---------- */
    function drawHydraulik(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const h = hydraulic(p.F1, area(p.d1), area(p.d2), 1);
      const base = r.y + r.h - 30;
      const maxW = r.w * 0.42;
      const w2 = Math.max(40, (maxW * p.d2) / 40);
      const w1 = Math.max(10, (maxW * p.d1) / 40);
      const x1 = r.x + r.w * 0.22;
      const x2 = r.x + r.w * 0.66;
      const lvl0 = base - r.h * 0.3;
      // Bewegung: kleiner Kolben geht beim Hub nach unten (Darstellung bis 50 px), großer steigt
      const down = Math.sin(Math.PI * strokePhase) * Math.min(50, r.h * 0.16);
      const ppcm = Math.min(6, (r.h * 0.25) / Math.max(1, (30 * STROKE * 100 * area(p.d1)) / area(p.d2)));
      const up = Math.min(r.h * 0.3, liftCm() * ppcm);
      const l1 = lvl0 + down;
      const l2 = lvl0 - up;
      g.fillStyle = withAlpha(th.series[0]!, 0.35);
      g.fillRect(x1 - w1 / 2, l1, w1, base - l1);
      g.fillRect(x2 - w2 / 2, l2, w2, base - l2);
      g.fillRect(x1 + w1 / 2, base - 24, x2 - w2 / 2 - (x1 + w1 / 2), 24);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      const wallTop = lvl0 - r.h * 0.36;
      g.beginPath();
      g.moveTo(x1 - w1 / 2, wallTop);
      g.lineTo(x1 - w1 / 2, base);
      g.lineTo(x2 + w2 / 2, base);
      g.lineTo(x2 + w2 / 2, wallTop);
      g.moveTo(x1 + w1 / 2, wallTop);
      g.lineTo(x1 + w1 / 2, base - 24);
      g.lineTo(x2 - w2 / 2, base - 24);
      g.lineTo(x2 - w2 / 2, wallTop);
      g.stroke();
      g.fillStyle = th.muted;
      g.fillRect(x1 - w1 / 2, l1 - 8, w1, 8);
      g.fillRect(x2 - w2 / 2, l2 - 8, w2, 8);
      // Auto auf dem großen Kolben
      const cw = Math.min(w2 * 1.6, r.w * 0.3);
      const ch = cw * 0.32;
      const cy = l2 - 8 - ch;
      roundRect(g, x2 - cw / 2, cy + ch * 0.3, cw, ch * 0.5, 6);
      g.fillStyle = th.series[2]!;
      g.fill();
      roundRect(g, x2 - cw * 0.28, cy, cw * 0.5, ch * 0.4, 6);
      g.fill();
      g.fillStyle = th.text;
      for (const wx of [x2 - cw * 0.3, x2 + cw * 0.3]) {
        g.beginPath();
        g.arc(wx, cy + ch * 0.82, ch * 0.18, 0, Math.PI * 2);
        g.fill();
      }
      arrow(g, x1, l1 - 70, x1, l1 - 10, th.series[1]!);
      text(g, `F₁ = ${fmt.num(p.F1, 0)} N`, x1, l1 - 82, { font: `700 13px ${th.font}`, color: th.series[1]! });
      const lF = Math.min(r.h * 0.2, 20 + 8 * Math.log2(1 + h.F2 / p.F1) * 4);
      arrow(g, x2 + cw / 2 + 18, l2 - 8, x2 + cw / 2 + 18, l2 - 8 - lF, th.series[2]!, 4);
      text(g, `F₂ = ${fmt.num(h.F2, 0)} N`, Math.min(r.x + r.w - 50, x2 + cw / 2 + 18), l2 - 20 - lF, { font: `700 13px ${th.font}`, color: th.series[2]! });
      text(g, `${ctx.t('strokes')}: ${strokes}`, x1, base + 16, { font: `600 12px ${th.font}`, color: th.muted });
    }

    function drawHydraulikChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const k = (STROKE * 100 * area(p.d1)) / area(p.d2);
      plot.fn((n) => n * k, { color: withAlpha(th.muted, 0.6), width: 1.5, dash: [6, 5], from: 0, to: 30 });
      const pts: [number, number][] = [];
      for (let n = 0; n <= strokes; n++) pts.push([n, n * k]);
      if (strokePhase > 0) pts.push([strokes + strokePhase, (strokes + strokePhase) * k]);
      plot.polyline(pts, { color: th.series[2]!, width: 3 });
      plot.point(strokes + strokePhase, liftCm(), { color: th.series[2]!, radius: 5 });
      plot.end();
    }

    /* ---------- Tauchen ---------- */
    function drawWasser(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const top = r.y + 30;
      const bot = r.y + r.h - 16;
      g.fillStyle = withAlpha(th.series[0]!, 0.12 + 0.18 * (p.h / 40));
      g.fillRect(r.x + 10, top, r.w - 20, bot - top);
      for (let d = 0; d <= 40; d += 10) {
        const y = top + ((bot - top) * d) / 40;
        g.strokeStyle = withAlpha(th.muted, 0.5);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + 10, y);
        g.lineTo(r.x + 30, y);
        g.stroke();
        text(g, `${d} m`, r.x + 34, y, { font: `11px ${th.font}`, color: th.muted, align: 'left' });
      }
      const y = Math.max(top + 10, Math.min(bot - 10, top + ((bot - top) * p.h) / 40));
      const cx = r.x + r.w / 2;
      g.fillStyle = th.text;
      roundRect(g, cx - 30, y - 8, 60, 16, 8);
      g.fill();
      g.beginPath();
      g.arc(cx + 36, y, 9, 0, Math.PI * 2);
      g.fill();
      // Luftblasen steigen auf
      g.strokeStyle = withAlpha(th.series[0]!, 0.8);
      g.lineWidth = 1.5;
      for (let k = 0; k < 5; k++) {
        const ph = (anim * 0.5 + k / 5) % 1;
        const by = y - 10 - ph * (y - top);
        const rr = 2 + 3 * ph;
        g.beginPath();
        g.arc(cx + 40 + Math.sin(ph * 12 + k) * 5, by, rr, 0, Math.PI * 2);
        g.stroke();
      }
      const len = Math.min(26, 6 + 4 * (1 + hydrostatic(rho(), p.h) / 1e5));
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const ex = cx + Math.cos(a) * 44;
        const ey = y + Math.sin(a) * 18;
        arrow(g, ex + Math.cos(a) * len, ey + Math.sin(a) * len, ex, ey, th.series[1]!, 2);
      }
    }

    /* ---------- Gefäße und Wasserturm ---------- */
    function drawGefaesse(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const base = r.y + r.h - 50;
      const maxH = r.h * 0.6;
      const hpx = (maxH * p.fh) / 50;
      const level = base - hpx;
      const wall = base - maxH - 6;
      const slot = r.w / 3;
      const water = withAlpha(th.series[0]!, 0.4);
      // 1: schmale Röhre, 2: Eimer, 3: Schüssel (oben weiter)
      const shapes: ((x: number) => [number, number][])[] = [
        (x) => [
          [x - 8, wall],
          [x - 8, base],
          [x + 8, base],
          [x + 8, wall],
        ],
        (x) => [
          [x - slot * 0.22, wall],
          [x - slot * 0.22, base],
          [x + slot * 0.22, base],
          [x + slot * 0.22, wall],
        ],
        (x) => [
          [x - slot * 0.42, wall],
          [x - slot * 0.12, base],
          [x + slot * 0.12, base],
          [x + slot * 0.42, wall],
        ],
      ];
      const pBottom = bottomPressure(1000, p.fh / 100, 1).p;
      shapes.forEach((shape, i) => {
        const x = r.x + slot * (i + 0.5);
        const pts = shape(x);
        // Wasser: Polygon bis zur Füllhöhe (Wände linear interpolieren)
        const at = (a: [number, number], b: [number, number], y: number) => a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
        g.fillStyle = water;
        g.beginPath();
        g.moveTo(at(pts[0]!, pts[1]!, level), level);
        g.lineTo(pts[1]![0], pts[1]![1]);
        g.lineTo(pts[2]![0], pts[2]![1]);
        g.lineTo(at(pts[3]!, pts[2]!, level), level);
        g.closePath();
        g.fill();
        g.strokeStyle = th.text;
        g.lineWidth = 3;
        g.beginPath();
        pts.forEach(([px, py], k) => (k ? g.lineTo(px, py) : g.moveTo(px, py)));
        g.stroke();
        // Druckpfeil am Boden (gleich lang in allen Gefäßen)
        arrow(g, x, base + 28, x, base + 4, th.series[1]!, 3);
        text(g, `${fmt.num(pBottom, 0)} Pa`, x, base + 40, { font: `700 ${narrow ? 11 : 12}px ${th.font}`, color: th.series[1]! });
      });
      // gemeinsame Höhenlinie
      g.strokeStyle = withAlpha(th.series[0]!, 0.8);
      g.setLineDash([6, 5]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(r.x + 8, level);
      g.lineTo(r.x + r.w - 8, level);
      g.stroke();
      g.setLineDash([]);
      text(g, `h = ${fmt.num(p.fh, 0)} cm`, r.x + 10, level - 10, { font: `700 12px ${th.font}`, color: th.series[0]!, align: 'left' });
    }

    function drawTurm(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const base = r.y + r.h - 18;
      const top = r.y + 16;
      const yOf = (m: number) => base - ((base - top) * m) / 62;
      // Turm links
      const tx = r.x + (narrow ? 18 : 30);
      const tw = narrow ? 34 : 46;
      g.fillStyle = withAlpha(th.muted, 0.35);
      g.fillRect(tx + tw * 0.35, yOf(p.th), tw * 0.3, base - yOf(p.th));
      roundRect(g, tx, yOf(p.th) - 22, tw, 30, 6);
      g.fillStyle = withAlpha(th.series[0]!, 0.55);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      text(g, `${fmt.num(p.th, 0)} m`, tx + tw / 2, yOf(p.th) - 32, { font: `700 12px ${th.font}`, color: th.series[0]! });
      // Wasserspiegel als gestrichelte Linie
      g.strokeStyle = withAlpha(th.series[0]!, 0.7);
      g.setLineDash([6, 5]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(tx, yOf(p.th) - 14);
      g.lineTo(r.x + r.w - 8, yOf(p.th) - 14);
      g.stroke();
      g.setLineDash([]);
      // Leitung zum Haus
      const hx = r.x + r.w * (narrow ? 0.42 : 0.4);
      const hw = Math.min(r.w * 0.3, 140);
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(tx + tw / 2, base - 2);
      g.lineTo(hx + 6, base - 2);
      g.lineTo(hx + 6, yOf(TAPS[TAPS.length - 1]!) - 6);
      g.stroke();
      // Hochhaus mit Stockwerken
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.strokeRect(hx, yOf(TAPS[TAPS.length - 1]! + 7), hw, base - yOf(TAPS[TAPS.length - 1]! + 7));
      for (const z of TAPS) {
        const y = yOf(z + 1.2);
        const dp = tapPressure(p.th, z + 1.2);
        g.strokeStyle = withAlpha(th.muted, 0.5);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(hx, yOf(z));
        g.lineTo(hx + hw, yOf(z));
        g.stroke();
        // Wasserstrahl: Länge nach Torricelli, Teilchen bewegen sich
        const v = outflowSpeed(p.th - z - 1.2);
        const len = Math.min(hw - 30, v * 3.2);
        if (len > 2) {
          g.strokeStyle = withAlpha(th.series[0]!, 0.75);
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(hx + 10, y);
          g.quadraticCurveTo(hx + 10 + len * 0.7, y - 2, hx + 10 + len, y + 10);
          g.stroke();
          g.fillStyle = th.series[0]!;
          for (let k = 0; k < 3; k++) {
            const f = (anim * 1.4 + k / 3) % 1;
            g.beginPath();
            g.arc(hx + 10 + len * f, y + 10 * f * f, 2.4, 0, Math.PI * 2);
            g.fill();
          }
        }
        const label = dp > 0 ? `${fmt.num(dp / 1e5, 2)} bar` : ctx.t('noWater');
        text(g, label, hx + hw + 6, y - 5, { font: `600 ${narrow ? 10 : 12}px ${th.font}`, color: dp > 0 ? th.text : th.series[3]!, align: 'left' });
      }
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x + 8, base);
      g.lineTo(r.x + r.w - 8, base);
      g.stroke();
    }

    /* ---------- Luftdruck ---------- */
    function drawLuft(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const base = r.y + r.h - 20;
      const top = r.y + 20;
      const yOf = (hm: number) => base - ((base - top) * hm) / 9000;
      for (let i = 0; i < 30; i++) {
        const hm = (i / 30) * 9000;
        g.fillStyle = withAlpha(th.series[0]!, 0.35 * (airPressure(hm) / P0));
        g.fillRect(r.x + 10, yOf(hm + 300), r.w - 20, yOf(hm) - yOf(hm + 300) + 1);
      }
      g.fillStyle = withAlpha(th.muted, th.dark ? 0.7 : 0.55);
      g.beginPath();
      g.moveTo(r.x + 20, base);
      g.lineTo(r.x + r.w * 0.45, yOf(8849));
      g.lineTo(r.x + r.w - 20, base);
      g.closePath();
      g.fill();
      const y = yOf(p.hoehe);
      const x = r.x + 20 + (r.w * 0.45 - 20) * Math.min(1, p.hoehe / 8849);
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.arc(x, y, 7, 0, Math.PI * 2);
      g.fill();
      text(g, `${fmt.num(p.hoehe, 0)} m: ${fmt.num(airPressure(p.hoehe), 0)} hPa`, x + 12, y - 12, { font: `700 13px ${th.font}`, color: th.text, align: 'left' });
    }

    /* ---------- Druck messen ---------- */
    function drawBaro(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const base = r.y + r.h - 34;
      const top = r.y + 26;
      const hg = barometerHeight(p.pa, 13546);
      const hw = barometerHeight(p.pa, 1000);
      // Beide Rohre im selben Maßstab (Wasser ≈ 10 m!): Rohr links Quecksilber (1 m lang), rechts Wasser (11 m)
      const scale = (base - top) / 11;
      const cols: [number, number, string, string][] = [
        [r.x + r.w * 0.28, hg, ctx.t('mercury'), th.muted],
        [r.x + r.w * 0.7, hw, ctx.t('water'), th.series[0]!],
      ];
      for (const [x, h, name, col] of cols) {
        const tubeLen = name === ctx.t('mercury') ? 1 : 11;
        // Schale
        g.fillStyle = withAlpha(col, 0.55);
        g.fillRect(x - 34, base - 8, 68, 12);
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.strokeRect(x - 36, base - 12, 72, 16);
        // Rohr
        g.strokeRect(x - 7, base - tubeLen * scale - 4, 14, tubeLen * scale);
        g.fillStyle = withAlpha(col, 0.85);
        g.fillRect(x - 6, base - 4 - h * scale, 12, h * scale);
        if (tubeLen > 1) text(g, ctx.t('vacuum'), x + 12, base - 4 - h * scale - 10, { font: `500 10px ${th.font}`, color: th.muted, align: 'left' });
        const val = name === ctx.t('mercury') ? `${fmt.num(h * 1000, 0)} mm` : `${fmt.num(h, 2)} m`;
        text(g, `${name}: ${val}`, x, base + 18, { font: `700 ${narrow ? 11 : 12}px ${th.font}`, color: th.text });
        // Luftdruck-Pfeile auf die Schale
        for (const dx of [-24, 24]) arrow(g, x + dx, base - 40, x + dx, base - 14, th.series[1]!, 2);
      }
      text(g, `${fmt.num(p.pa, 0)} hPa`, r.x + r.w / 2, r.y + 14, { font: `700 13px ${th.font}`, color: th.series[1]! });
    }

    function drawMagde(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h * 0.5;
      const R = Math.min(r.w * 0.16, r.h * 0.3) * (0.5 + p.r / 80);
      const F = hemisphereForce(p.r / 100, p.pin);
      // Spalt öffnet sich, wenn kaum Kraft nötig ist (fast gleicher Druck)
      const gap = F < 50 ? 10 * Math.sin(anim * 2) ** 2 : 0;
      const shade = withAlpha(th.series[3]!, 0.75);
      g.fillStyle = shade;
      g.beginPath();
      g.arc(cx - gap, cy, R, Math.PI / 2, (3 * Math.PI) / 2);
      g.closePath();
      g.fill();
      g.beginPath();
      g.arc(cx + gap, cy, R, -Math.PI / 2, Math.PI / 2);
      g.closePath();
      g.fill();
      // Innen: Dichte der Luft als Punkte
      const dots = Math.round(40 * (p.pin / P0));
      g.fillStyle = withAlpha(th.bg, 0.85);
      for (let k = 0; k < dots; k++) {
        const a = k * 2.39996;
        const rr = R * 0.8 * Math.sqrt((k + 0.5) / 40);
        g.beginPath();
        g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2.2, 0, Math.PI * 2);
        g.fill();
      }
      // Außen: Luftdruck-Pfeile rundum
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2 + Math.PI / 12;
        const len = 26;
        arrow(g, cx + Math.cos(a) * (R + len + 8), cy + Math.sin(a) * (R + len + 8), cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6), th.series[1]!, 2);
      }
      // Zugkraft links und rechts
      const lf = Math.max(12, Math.min(r.w / 2 - R - 52, 10 + 8 * Math.log2(1 + F / 100)));
      arrow(g, cx - R - 40, cy, cx - R - 40 - lf, cy, th.series[2]!, 4);
      arrow(g, cx + R + 40, cy, cx + R + 40 + lf, cy, th.series[2]!, 4);
      text(g, `F ≈ ${fmt.num(F / 1000, 1)} kN`, cx, r.y + r.h - 10, { font: `700 14px ${th.font}`, color: th.series[2]! });
      text(g, `${fmt.num(p.pin, 0)} hPa`, cx, cy, { font: `700 13px ${th.font}`, color: th.text });
    }

    function drawMessenChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mv === 'baro') {
        plot.fn((pa) => barometerHeight(pa, 13546) * 1000, { color: th.muted, width: 3, from: 0, to: 1060 });
        plot.point(p.pa, barometerHeight(p.pa, 13546) * 1000, { color: th.series[1]!, radius: 6 });
        plot.vline(1013, { color: withAlpha(th.muted, 0.5), dash: [5, 4], width: 1 });
      } else {
        plot.fn((pin) => hemisphereForce(p.r / 100, pin) / 1000, { color: th.series[2]!, width: 3, from: 0, to: 1013 });
        plot.point(p.pin, hemisphereForce(p.r / 100, p.pin) / 1000, { color: th.series[2]!, radius: 6 });
      }
      plot.end();
    }

    /* ---------- Wind ---------- */
    function drawWind(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const ground = H * 0.72;
      const mid = W / 2;
      const day = p.tag;
      g.fillStyle = day ? withAlpha(th.series[0]!, 0.08) : withAlpha(th.text, th.dark ? 0.05 : 0.18);
      g.fillRect(0, 0, W, ground);
      g.fillStyle = withAlpha(th.series[3]!, day ? 0.65 : 0.45);
      g.fillRect(0, ground, mid, H - ground);
      g.fillStyle = withAlpha(th.series[0]!, 0.6);
      g.fillRect(mid, ground, W - mid, H - ground);
      text(g, `${ctx.t('land')} ${day ? '28' : '12'} °C`, mid / 2, ground + (H - ground) / 2, { font: `700 14px ${th.font}`, color: '#ffffff' });
      text(g, `${ctx.t('sea')} ${day ? '20' : '18'} °C`, mid + mid / 2, ground + (H - ground) / 2, { font: `700 14px ${th.font}`, color: '#ffffff' });
      g.fillStyle = day ? th.series[3]! : withAlpha(th.muted, 0.8);
      g.beginPath();
      g.arc(W * 0.12, H * 0.14, day ? 22 : 16, 0, Math.PI * 2);
      g.fill();
      const b = breeze(day ? 28 : 12, day ? 20 : 18);
      const low = b === 'land' ? mid / 2 : mid + mid / 2;
      const high = b === 'land' ? mid + mid / 2 : mid / 2;
      const yLow = ground - 26;
      const yHigh = H * 0.22;
      const path: [number, number][] = [
        [high, yLow],
        [low, yLow],
        [low, yHigh],
        [high, yHigh],
      ];
      text(g, ctx.t('lowP'), low, ground - 50, { font: `800 26px ${th.font}`, color: th.series[1]! });
      text(g, 'H', high, ground - 50, { font: `800 26px ${th.font}`, color: th.series[0]! });
      g.strokeStyle = withAlpha(th.text, 0.35);
      g.lineWidth = 2;
      g.setLineDash([6, 6]);
      g.beginPath();
      path.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.stroke();
      g.setLineDash([]);
      arrow(g, high + (low - high) * 0.15, yLow, high + (low - high) * 0.85, yLow, th.series[3]!, 5);
      const segs = path.map((pt, i) => [pt, path[(i + 1) % 4]!] as const);
      const lens = segs.map(([a, c]) => Math.hypot(c[0] - a[0], c[1] - a[1]));
      const total = lens.reduce((s, v) => s + v, 0);
      g.fillStyle = th.series[3]!;
      for (let k = 0; k < 16; k++) {
        let d = ((k / 16) * total + anim * 60) % total;
        let i = 0;
        while (d > lens[i]!) {
          d -= lens[i]!;
          i++;
        }
        const [a, c] = segs[i]!;
        const f = d / lens[i]!;
        g.beginPath();
        g.arc(a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, 4, 0, Math.PI * 2);
        g.fill();
      }
    }

    /* ---------- Übung ---------- */
    function drawQuiz(W: number, H: number): void {
      const g = surface.g;
      const th = ctx.theme;
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
      const fs = narrow ? 16 : 21;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 12;
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: `${ans} ${task.unit}` }) : ctx.t('qHow'), pad, y);
      y += 30;
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
        y += 6;
        if (verdict || tries >= 2) {
          g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          g.fillText(`${ctx.t('qSol')}:`, pad, y);
          y += 22;
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          for (const line of wrap(g, task.solution[ctx.lang], maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      const n = Math.min(10, score.all);
      const gap = 20;
      const sx = W / 2 - (9 * gap) / 2;
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(sx + i * gap, H - 24, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      const m = mode();
      if (m === 'auflage') return drawAuflageChart();
      if (m === 'hydraulik') return drawHydraulikChart();
      if (m === 'messen') return drawMessenChart();
      if (m === 'wind' || m === 'ueben') return;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (m === 'wasser') {
        plot.fn((hh) => 1.013 + hydrostatic(rho(), hh) / 1e5, { color: th.series[0]!, width: 3, from: 0, to: 40 });
        plot.point(p.h, 1.013 + hydrostatic(rho(), p.h) / 1e5, { color: th.series[1]!, radius: 6 });
      } else if (m === 'gefaesse') {
        if (p.gv === 'form') {
          plot.fn((hc) => bottomPressure(1000, hc / 100, 1).p, { color: th.series[0]!, width: 3, from: 0, to: 50 });
          plot.point(p.fh, bottomPressure(1000, p.fh / 100, 1).p, { color: th.series[1]!, radius: 6 });
        } else {
          plot.fn((z) => tapPressure(p.th, z) / 1e5, { color: th.series[0]!, width: 3, from: 0, to: 40 });
          for (const z of TAPS) plot.point(z, tapPressure(p.th, z) / 1e5, { color: th.series[1]!, radius: 5 });
        }
      } else {
        plot.fn((hh) => airPressure(hh), { color: th.series[0]!, width: 3, from: 0, to: 9000 });
        plot.point(p.hoehe, airPressure(p.hoehe), { color: th.series[1]!, radius: 6 });
      }
      plot.end();
    }

    /* ---------- Ablauf ---------- */
    function newTask(): void {
      task = makeTask(p.qn);
      verdict = null;
      tries = 0;
      badInput = false;
    }

    function runCheck(): void {
      const r = checkTask(task, p.qa);
      if (r === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = r;
      tries += 1;
      if (tries === 1) score = { right: score.right + (r ? 1 : 0), all: score.all + 1, streak: r ? score.streak + 1 : 0 };
    }

    function queuePump(n: number): void {
      if (prefersReducedMotion()) {
        strokes = Math.min(30, strokes + n);
        strokePhase = 0;
      } else {
        queued += n;
        ctx.clock.play();
      }
      updateReadouts();
    }

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || ['F1', 'd1', 'd2', 'mode'].some((k) => changed.has(k))) {
          strokes = 0;
          queued = 0;
          strokePhase = 0;
        }
        if (source === 'init' || source === 'replace' || changed.has('qn')) newTask();
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        surface.canvas.setAttribute('aria-label', ctx.t(mode() === 'ueben' ? 'canvasQuiz' : 'canvas'));
        setupPlot();
        updateReadouts();
      },
      action(id) {
        if (id === 'pump') queuePump(1);
        else if (id === 'pump10') queuePump(10);
        else if (id === 'down') {
          strokes = 0;
          queued = 0;
          strokePhase = 0;
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        anim += dt;
        if (mode() === 'hydraulik' && (queued > 0 || strokePhase > 0)) {
          strokePhase += dt / STROKE_T;
          if (strokePhase >= 1) {
            strokePhase = 0;
            strokes = Math.min(30, strokes + 1);
            queued = strokes >= 30 ? 0 : Math.max(0, queued - 1);
          }
          updateReadouts();
        }
      },
      resetTime() {
        anim = 0;
      },
      render() {
        surface.begin();
        if (mode() === 'ueben') {
          drawQuiz(surface.width, surface.height);
          return;
        }
        const s = split(surface.width, surface.height);
        plot.resize();
        const m = mode();
        if (m === 'auflage') drawAuflage(s.scene);
        else if (m === 'hydraulik') drawHydraulik(s.scene);
        else if (m === 'wasser') drawWasser(s.scene);
        else if (m === 'gefaesse') (p.gv === 'turm' ? drawTurm : drawGefaesse)(s.scene);
        else if (m === 'luft') drawLuft(s.scene);
        else if (m === 'messen') (p.mv === 'magde' ? drawMagde : drawBaro)(s.scene);
        else drawWind();
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
