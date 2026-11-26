import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  airTransfer,
  BODY_MAKES,
  bodyLoss,
  CLO,
  collectorEfficiency,
  COLLECTOR_AREA,
  checkTask,
  conductionPower,
  conductionStep,
  CONTAINERS,
  cooling,
  coolingTime,
  diffusivity,
  heatLoss,
  makeTask,
  MATERIALS,
  netRadiation,
  radiatedPower,
  uValue,
  wallTemperatures,
  WINDOWS,
  type ContainerId,
  type HeatTask,
  type MaterialId,
  type WindowId,
} from './model';

const L = (de: string, en: string) => ({ de, en });

/** Stab: 20 cm in 41 Stützstellen, Querschnitt 1 cm². */
const ROD_LEN = 0.2;
const N = 41;
const AREA = 1e-4;
/** Wandfläche für die Dämmung (m²). */
const WALL_AREA = 10;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.56);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Wärmetransport: Wärmeleitung im Stab (Materialvergleich), Wärmeströmung im
 * Wassertopf, Wärmestrahlung (Stefan-Boltzmann), Dämmung von Hauswand und
 * Fenster, Abkühlen von Tee in Becher und Thermoskanne und eine Übung.
 */
export default defineSimulation({
  id: 'waermetransport',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.8 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Art des Wärmetransports', 'Kind of heat transfer'),
      options: [
        { value: 'leitung', label: L('Wärmeleitung', 'Conduction') },
        { value: 'stroemung', label: L('Wärmeströmung', 'Convection') },
        { value: 'strahlung', label: L('Wärmestrahlung', 'Radiation') },
        { value: 'daemmung', label: L('Wärmedämmung: Wand und Fenster', 'Insulation: wall and window') },
        { value: 'abkuehlen', label: L('Alltag: Tee im Becher und in der Thermoskanne', 'Everyday: tea in a mug and a vacuum flask') },
        { value: 'koerper', label: L('Alltag: Kleidung und Wind', 'Everyday: clothing and wind') },
        { value: 'kollektor', label: L('Sonnenkollektor auf dem Dach', 'Solar collector on the roof') },
        { value: 'ueben', label: L('Üben: Aufgaben zum Wärmetransport', 'Practice: heat transfer tasks') },
      ],
      default: 'leitung',
      display: 'menu',
    },
    {
      key: 'mat',
      type: 'choice',
      label: L('Material des Stabs', 'Material of the rod'),
      options: [
        { value: 'copper', label: L('Kupfer', 'copper') },
        { value: 'aluminium', label: L('Aluminium', 'aluminium') },
        { value: 'iron', label: L('Eisen', 'iron') },
        { value: 'glass', label: L('Glas', 'glass') },
        { value: 'wood', label: L('Holz', 'wood') },
      ],
      default: 'copper',
      visibleIf: (v) => v.mode === 'leitung',
    },
    { key: 'th', type: 'number', label: L('Temperatur heißes Ende', 'Temperature of hot end'), min: 30, max: 100, step: 5, default: 100, unit: '°C', visibleIf: (v) => v.mode === 'leitung' },
    {
      key: 'raffer',
      type: 'choice',
      label: L('Zeitraffer', 'Time-lapse'),
      options: [
        { value: '100', label: L('100-fach', '100×') },
        { value: '1000', label: L('1000-fach', '1000×') },
        { value: '10000', label: L('10 000-fach', '10,000×') },
      ],
      default: '100',
      visibleIf: (v) => v.mode === 'leitung',
    },
    { key: 'heiz', type: 'number', label: L('Heizleistung', 'Heating power'), min: 0, max: 100, step: 5, default: 60, unit: '%', visibleIf: (v) => v.mode === 'stroemung' },
    { key: 'tk', type: 'number', label: L('Temperatur des Körpers', 'Temperature of the body'), min: 20, max: 800, step: 1, default: 200, unit: '°C', visibleIf: (v) => v.mode === 'strahlung' },
    {
      key: 'surf',
      type: 'choice',
      label: L('Oberfläche', 'Surface'),
      options: [
        { value: '0.95', label: L('matt schwarz', 'matt black') },
        { value: '0.5', label: L('grau', 'grey') },
        { value: '0.05', label: L('blank (Metall)', 'shiny (metal)') },
      ],
      default: '0.95',
      visibleIf: (v) => v.mode === 'strahlung',
    },
    {
      key: 'bau',
      type: 'choice',
      label: L('Bauteil', 'Building part'),
      options: [
        { value: 'wand', label: L('Wand', 'wall') },
        { value: 'fenster', label: L('Fenster', 'window') },
      ],
      default: 'wand',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'daemmung',
    },
    {
      key: 'fen',
      type: 'choice',
      label: L('Verglasung', 'Glazing'),
      options: [
        { value: 'einfach', label: L('Einfachglas', 'single glazing') },
        { value: 'doppel', label: L('Doppelglas (alt)', 'double glazing (old)') },
        { value: 'waerme', label: L('Wärmeschutzglas', 'low-e double glazing') },
        { value: 'dreifach', label: L('Dreifachglas', 'triple glazing') },
      ],
      default: 'einfach',
      visibleIf: (v) => v.mode === 'daemmung' && v.bau === 'fenster',
    },
    { key: 'fa', type: 'number', label: L('Fensterfläche', 'Window area'), min: 1, max: 20, step: 0.5, default: 4, unit: 'm²', visibleIf: (v) => v.mode === 'daemmung' && v.bau === 'fenster' },
    {
      key: 'gef',
      type: 'choice',
      label: L('Gefäß', 'Container'),
      options: [
        { value: 'becher', label: L('Becher, offen', 'mug, open') },
        { value: 'deckel', label: L('Becher mit Deckel', 'mug with lid') },
        { value: 'doppel', label: L('Doppelwandiger Becher', 'double-walled mug') },
        { value: 'thermos', label: L('Thermoskanne', 'vacuum flask') },
      ],
      default: 'becher',
      visibleIf: (v) => v.mode === 'abkuehlen',
    },
    {
      key: 't0',
      type: 'number',
      label: L('Anfangstemperatur des Tees', 'Starting temperature of the tea'),
      min: 50,
      max: 95,
      step: 1,
      default: 85,
      unit: '°C',
      visibleIf: (v) => v.mode === 'abkuehlen',
    },
    {
      key: 'dauer',
      type: 'choice',
      label: L('Beobachtungszeit', 'Observation time'),
      options: [
        { value: '60', label: L('1 Stunde', '1 hour') },
        { value: '360', label: L('6 Stunden', '6 hours') },
      ],
      default: '60',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'abkuehlen',
    },
    { key: 'kclo', type: 'number', label: L('Kleidung', 'Clothing'), min: 0, max: 3, step: 0.5, default: 1, unit: 'clo', visibleIf: (v) => v.mode === 'koerper' },
    { key: 'kta', type: 'number', label: L('Lufttemperatur', 'Air temperature'), min: -20, max: 30, step: 1, default: 5, unit: '°C', visibleIf: (v) => v.mode === 'koerper' },
    { key: 'kv', type: 'number', label: L('Wind', 'Wind'), min: 0, max: 15, step: 0.5, default: 0, unit: 'm/s', visibleIf: (v) => v.mode === 'koerper' },
    {
      key: 'kakt',
      type: 'choice',
      label: L('Tätigkeit', 'Activity'),
      options: [
        { value: 'ruhe', label: L('stehen (100 W)', 'standing (100 W)') },
        { value: 'gehen', label: L('zügig gehen (250 W)', 'brisk walking (250 W)') },
      ],
      default: 'ruhe',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'koerper',
    },
    { key: 'sg', type: 'number', label: L('Sonnenstrahlung G', 'Solar irradiance G'), min: 100, max: 1000, step: 50, default: 800, unit: 'W/m²', visibleIf: (v) => v.mode === 'kollektor' },
    {
      key: 'stc',
      type: 'number',
      label: L('Wassertemperatur im Kollektor', 'Water temperature in the collector'),
      min: 10,
      max: 90,
      step: 5,
      default: 50,
      unit: '°C',
      visibleIf: (v) => v.mode === 'kollektor',
    },
    { key: 'sta', type: 'number', label: L('Lufttemperatur', 'Air temperature'), min: -10, max: 35, step: 1, default: 20, unit: '°C', visibleIf: (v) => v.mode === 'kollektor' },
    { key: 'sglas', type: 'boolean', label: L('Glasabdeckung', 'glass cover'), default: true, visibleIf: (v) => v.mode === 'kollektor' },
    { key: 'sschw', type: 'boolean', label: L('schwarzer Absorber', 'black absorber'), default: true, visibleIf: (v) => v.mode === 'kollektor' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('eine Zahl', 'a number'), visibleIf: (v) => v.mode === 'ueben' },
    {
      key: 'dw',
      type: 'number',
      label: L('Mauerwerk (Ziegel)', 'Masonry (brick)'),
      min: 10,
      max: 50,
      step: 1,
      default: 24,
      unit: 'cm',
      visibleIf: (v) => v.mode === 'daemmung' && v.bau !== 'fenster',
    },
    {
      key: 'di',
      type: 'number',
      label: L('Dämmung (Styropor)', 'Insulation (polystyrene)'),
      min: 0,
      max: 30,
      step: 1,
      default: 0,
      unit: 'cm',
      visibleIf: (v) => v.mode === 'daemmung' && v.bau !== 'fenster',
    },
    { key: 'ta', type: 'number', label: L('Außentemperatur', 'Outside temperature'), min: -20, max: 15, step: 1, default: -5, unit: '°C', visibleIf: (v) => v.mode === 'daemmung' },
  ],
  hint: (v) =>
    v.mode === 'leitung'
      ? L('Das linke Ende wird heiß gehalten, das rechte kalt. Vergleiche die Materialien.', 'The left end is kept hot, the right end cold. Compare the materials.')
      : v.mode === 'stroemung'
        ? L('Das erwärmte Wasser steigt auf und nimmt die Wärme mit.', 'The heated water rises and carries the heat with it.')
        : v.mode === 'strahlung'
          ? L('Jeder Körper strahlt – je heißer, desto viel mehr. Auch durch das Vakuum.', 'Every body radiates – the hotter, the much more. Even through a vacuum.')
          : v.mode === 'daemmung'
            ? L('Innen 20 °C, außen kalt. Wie viel Wärme geht durch Wand oder Fenster verloren?', 'Inside 20 °C, outside cold. How much heat is lost through the wall or window?')
            : v.mode === 'koerper'
              ? L(
                  'Der Körper gibt Wärme über die Haut ab. Kleidung hält eine ruhende Luftschicht fest, Wind bläst sie weg. Wann frierst du?',
                  'The body gives off heat through the skin. Clothing holds a layer of still air, wind blows it away. When do you feel cold?',
                )
              : v.mode === 'kollektor'
                ? L(
                    'Der schwarze Absorber schluckt die Sonnenstrahlung, das Glas hält die warme Luft fest. Je heißer das Wasser, desto mehr Wärme geht wieder verloren.',
                    'The black absorber swallows the sunlight, the glass keeps the warm air in. The hotter the water, the more heat is lost again.',
                  )
                : v.mode === 'abkuehlen'
                  ? L(
                      'Drücke „Start“: Vier Gefäße kühlen gleichzeitig ab. Welches hält den Tee am längsten warm – und warum?',
                      'Press “Start”: four containers cool down at the same time. Which keeps the tea warm longest – and why?',
                    )
                  : L('Rechne oder ordne zu und gib die Zahl ein. Komma oder Punkt sind beide in Ordnung.', 'Work it out or classify and enter the number. A comma or a point are both fine.'),
  actions: [
    { id: 'reset', label: L('Neu starten', 'Restart'), visibleIf: (v) => v.mode === 'leitung' },
    { id: 'go', label: L('Start', 'Start'), primary: true, visibleIf: (v) => v.mode === 'abkuehlen' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'time', label: L('Zeit', 'Time') },
    { key: 'lam', label: L('Wärmeleitfähigkeit', 'Thermal conductivity') },
    { key: 'P', label: L('Wärmestrom', 'Heat flow'), spoiler: true },
    { key: 'rad', label: L('Abgestrahlte Leistung', 'Radiated power'), spoiler: true },
    { key: 'U', label: L('U-Wert', 'U-value'), spoiler: true },
    { key: 'loss', label: L('Wärmeverlust', 'Heat loss'), spoiler: true },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'cu', label: L('Kupfer', 'Copper'), values: { mode: 'leitung', mat: 'copper' } },
    { id: 'wood', label: L('Holz', 'Wood'), values: { mode: 'leitung', mat: 'wood', raffer: '10000' } },
    { id: 'conv', label: L('Wassertopf', 'Pot of water'), values: { mode: 'stroemung' } },
    { id: 'rad', label: L('Herdplatte (500 °C)', 'Hotplate (500 °C)'), values: { mode: 'strahlung', tk: 500 } },
    { id: 'old', label: L('Altbau ohne Dämmung', 'Old wall without insulation'), values: { mode: 'daemmung', dw: 24, di: 0 } },
    { id: 'new', label: L('Mit 16 cm Dämmung', 'With 16 cm insulation'), values: { mode: 'daemmung', dw: 24, di: 16 } },
    { id: 'iron', label: L('Eisen im Zeitraffer', 'Iron in time-lapse'), values: { mode: 'leitung', mat: 'iron', raffer: '1000' } },
    { id: 'shiny', label: L('Blanke Oberfläche strahlt kaum', 'Shiny surface hardly radiates'), values: { mode: 'strahlung', tk: 200, surf: '0.05' } },
    { id: 'body', label: L('Mensch (34 °C Haut)', 'Human (34 °C skin)'), values: { mode: 'strahlung', tk: 34, surf: '0.95' } },
    { id: 'gentle', label: L('Kleine Heizstufe', 'Low heat'), values: { mode: 'stroemung', heiz: 20 } },
    { id: 'win1', label: L('Einfachglas', 'Single glazing'), values: { mode: 'daemmung', bau: 'fenster', fen: 'einfach', fa: 4, ta: -5 } },
    { id: 'win3', label: L('Dreifachglas', 'Triple glazing'), values: { mode: 'daemmung', bau: 'fenster', fen: 'dreifach', fa: 4, ta: -5 } },
    { id: 'tea', label: L('Tee im offenen Becher', 'Tea in an open mug'), values: { mode: 'abkuehlen', gef: 'becher', t0: 85, dauer: '60' } },
    { id: 'flask', label: L('Thermoskanne über 6 Stunden', 'Vacuum flask over 6 hours'), values: { mode: 'abkuehlen', gef: 'thermos', t0: 85, dauer: '360' } },
    { id: 'winter', label: L('Winterspaziergang mit Wind', 'Winter walk in the wind'), values: { mode: 'koerper', kclo: 2, kta: -5, kv: 6, kakt: 'gehen' } },
    { id: 'tshirt', label: L('T-Shirt bei 5 °C', 'T-shirt at 5 °C'), values: { mode: 'koerper', kclo: 0.5, kta: 5, kv: 0, kakt: 'ruhe' } },
    { id: 'sommer', label: L('Kollektor im Sommer', 'Collector in summer'), values: { mode: 'kollektor', sg: 800, stc: 50, sta: 20, sglas: true, sschw: true } },
    { id: 'nackt', label: L('Ohne Glas, blankes Blech', 'No glass, bare sheet metal'), values: { mode: 'kollektor', sg: 800, stc: 50, sta: 20, sglas: false, sschw: false } },
    { id: 'quiz', label: L('Üben: zehn Aufgabenarten', 'Practice: ten kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasB: 'Ein Mensch mit Kleidungsschichten, Wärmepfeile und Wind; daneben ein Diagramm der Wärmeabgabe über der Kleidung',
      canvasC: 'Sonnenkollektor im Querschnitt auf einem Dach mit Sonnenstrahlen und Verlusten; daneben der Wirkungsgrad über der Wassertemperatur',
      bLoss: 'Wärmeabgabe ≈ {P} W (Körper erzeugt {M} W)',
      bCold: 'Du frierst – der Körper verliert mehr Wärme, als er erzeugt.',
      bWarm: 'Zu warm – der Körper muss schwitzen.',
      bOk: 'Angenehm – Wärmeabgabe und Wärmeerzeugung passen.',
      bShare: 'Dämmung: Kleidung {c} %, Luftschicht {a} %',
      bInfo: 'Kleidung wirkt durch die ruhende Luft zwischen den Fasern. Wind bläst die warme Luftschicht an der Oberfläche weg – darum fühlt sich Wind kälter an.',
      bMakes: 'erzeugt',
      bAxX: 'Kleidung in clo',
      bAxY: 'P in W',
      sEta: 'Wirkungsgrad η ≈ {e} %',
      sP: 'Das Wasser nimmt {P} W auf (2 m²)',
      sLoss: 'Verloren: {L} W',
      sInfo:
        'Der schwarze Absorber verwandelt Strahlung in Wärme. Glas lässt das Sonnenlicht durch, hält aber die warme Luft fest und bremst die Wärmestrahlung des heißen Blechs. Je heißer das Wasser, desto größer die Verluste.',
      sSun: 'Sonne',
      sRefl: 'reflektiert',
      sConv: 'Strömung',
      sRad: 'Strahlung',
      sWater: 'Wasser',
      sAxX: 'Wassertemperatur in °C',
      sAxY: 'η in %',
      canvas:
        'Wärmetransport: ein Stab zwischen heißem und kaltem Ende mit Temperaturverlauf, ein beheizter Wassertopf mit Strömung, ein strahlender Körper oder eine Hauswand mit Dämmung und Temperaturverlauf',
      x: 'x in cm',
      T: 'T in °C',
      hot: 'heiß',
      cold: 'kalt',
      inside: 'innen',
      outside: 'außen',
      brick: 'Ziegel',
      insul: 'Dämmung',
      lamVal: 'λ = {v} W/(m · K)',
      Pval: 'P = λ · A · ΔT / l ≈ {P} W (Stab 20 cm, 1 cm², im Gleichgewicht)',
      radVal: 'P = ε · σ · A · T⁴ ≈ {P} W je m² (T = {K} K); Netto an die 20 °C warme Umgebung: {N} W je m²',
      Uval: 'U = 1 / (R_si + d₁/λ₁ + d₂/λ₂ + R_se) ≈ {U} W/(m² · K)',
      lossVal: 'P = U · A · ΔT ≈ {P} W, also {E} kWh pro Tag',
      water: 'Wasser',
      heater: 'Heizplatte',
      vacuum: 'Strahlung braucht keinen Stoff',
      sec: '{s} s',
      min: '{m} min {s} s',
      h: '{h} h {m} min',
      m_copper: 'Kupfer',
      m_aluminium: 'Aluminium',
      m_iron: 'Eisen',
      m_glass: 'Glas',
      m_wood: 'Holz',
      canvasQuiz: 'Übungsaufgabe zum Wärmetransport mit Rückmeldung',
      winLoss: 'P = U · A · ΔT = {U} · {A} · {dT} W ≈ {P} W, also {E} kWh pro Tag',
      winU: 'U ≈ {U} W/(m² · K)',
      winInfo: 'Zwischen den Scheiben steckt Luft oder Edelgas (leitet schlecht), eine dünne Metallschicht spiegelt Wärmestrahlung zurück.',
      cupNow: 'nach {t}: {T} °C im gewählten Gefäß',
      cupInfo: 'Das Vakuum der Thermoskanne verhindert Leitung und Strömung, die Verspiegelung die Strahlung. Ein Deckel stoppt die warme Luft und den Dampf.',
      cupTime: 'Bis 50 °C: Becher {a}, Deckel {b}, doppelwandig {c}, Thermoskanne {d}',
      tMin: 't in min',
      cup_becher: 'Becher',
      cup_deckel: 'Deckel',
      cup_doppel: 'doppelwandig',
      cup_thermos: 'Thermoskanne',
      share: 'Anteile am Verlust',
      sh_leitung: 'Leitung',
      sh_stroemung: 'Strömung',
      sh_strahlung: 'Strahlung',
      win_einfach: 'Einfach',
      win_doppel: 'Doppel',
      win_waerme: 'Wärmeschutz',
      win_dreifach: 'Dreifach',
      wAx: 'P in W',
      never: 'nie',
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
      canvasB: 'A person with layers of clothing, heat arrows and wind; next to it a chart of heat loss against clothing',
      canvasC: 'Cross-section of a solar collector on a roof with sun rays and losses; next to it the efficiency against water temperature',
      bLoss: 'Heat given off ≈ {P} W (body makes {M} W)',
      bCold: 'You are cold – the body loses more heat than it makes.',
      bWarm: 'Too warm – the body has to sweat.',
      bOk: 'Comfortable – heat loss and heat production match.',
      bShare: 'Insulation: clothing {c} %, air layer {a} %',
      bInfo: 'Clothing works through the still air between the fibres. Wind blows away the warm layer of air at the surface – that is why wind feels colder.',
      bMakes: 'makes',
      bAxX: 'clothing in clo',
      bAxY: 'P in W',
      sEta: 'Efficiency η ≈ {e} %',
      sP: 'The water takes up {P} W (2 m²)',
      sLoss: 'Lost: {L} W',
      sInfo:
        'The black absorber turns radiation into heat. Glass lets the sunlight through but keeps the warm air in and holds back the thermal radiation of the hot metal. The hotter the water, the larger the losses.',
      sSun: 'sun',
      sRefl: 'reflected',
      sConv: 'convection',
      sRad: 'radiation',
      sWater: 'water',
      sAxX: 'water temperature in °C',
      sAxY: 'η in %',
      canvas:
        'Heat transfer: a rod between a hot and a cold end with a temperature profile, a heated pot of water with convection, a radiating body or a house wall with insulation and temperature profile',
      x: 'x in cm',
      T: 'T in °C',
      hot: 'hot',
      cold: 'cold',
      inside: 'inside',
      outside: 'outside',
      brick: 'brick',
      insul: 'insulation',
      lamVal: 'λ = {v} W/(m · K)',
      Pval: 'P = λ · A · ΔT / l ≈ {P} W (rod 20 cm, 1 cm², steady state)',
      radVal: 'P = ε · σ · A · T⁴ ≈ {P} W per m² (T = {K} K); net to the 20 °C surroundings: {N} W per m²',
      Uval: 'U = 1 / (R_si + d₁/λ₁ + d₂/λ₂ + R_se) ≈ {U} W/(m² · K)',
      lossVal: 'P = U · A · ΔT ≈ {P} W, i.e. {E} kWh per day',
      water: 'water',
      heater: 'hotplate',
      vacuum: 'radiation needs no material',
      sec: '{s} s',
      min: '{m} min {s} s',
      h: '{h} h {m} min',
      m_copper: 'copper',
      m_aluminium: 'aluminium',
      m_iron: 'iron',
      m_glass: 'glass',
      m_wood: 'wood',
      canvasQuiz: 'Practice task on heat transfer with feedback',
      winLoss: 'P = U · A · ΔT = {U} · {A} · {dT} W ≈ {P} W, i.e. {E} kWh per day',
      winU: 'U ≈ {U} W/(m² · K)',
      winInfo: 'Between the panes there is air or noble gas (a poor conductor), and a thin metal coating reflects heat radiation back.',
      cupNow: 'after {t}: {T} °C in the chosen container',
      cupInfo: 'The vacuum of the flask stops conduction and convection, the silvering stops radiation. A lid stops the warm air and the steam.',
      cupTime: 'Down to 50 °C: mug {a}, lid {b}, double-walled {c}, flask {d}',
      tMin: 't in min',
      cup_becher: 'mug',
      cup_deckel: 'lid',
      cup_doppel: 'double-walled',
      cup_thermos: 'flask',
      share: 'shares of the loss',
      sh_leitung: 'conduction',
      sh_stroemung: 'convection',
      sh_strahlung: 'radiation',
      win_einfach: 'single',
      win_doppel: 'double',
      win_waerme: 'low-e',
      win_dreifach: 'triple',
      wAx: 'P in W',
      never: 'never',
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
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 20],
      y: [0, 100],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const T_COLD = 20;
    let T: number[] = [];
    let time = 0;
    let anim = 0;
    function resetRod(): void {
      T = Array.from({ length: N }, (_, i) => (i === 0 ? p.th : T_COLD));
      time = 0;
    }
    resetRod();

    /* Abkühlen: Zeit in Minuten seit dem Start */
    let tc = 0;
    let cooling_on = false;
    const CUPS: ContainerId[] = ['becher', 'deckel', 'doppel', 'thermos'];
    const tEndCup = () => Number(p.dauer);

    /* Übung */
    let task: HeatTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    const WINS: WindowId[] = ['einfach', 'doppel', 'waerme', 'dreifach'];

    /** Farbe für eine Temperatur zwischen kalt (blau) und heiß (rot). */
    function tempColor(t: number, lo: number, hi: number): string {
      const th = ctx.theme;
      const k = Math.max(0, Math.min(1, (t - lo) / Math.max(1e-9, hi - lo)));
      const a = hexToRgb(th.series[0]!);
      const b = hexToRgb(th.series[1]!);
      const m = (i: number) => Math.round(a[i]! + (b[i]! - a[i]!) * k);
      return `rgb(${m(0)},${m(1)},${m(2)})`;
    }
    function hexToRgb(c: string): number[] {
      const s = c.trim();
      if (s.startsWith('#')) {
        const h = s.length === 4 ? s.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : s;
        return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      }
      const m = s.match(/\d+(\.\d+)?/g);
      return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
    }

    function timeText(s: number): string {
      if (s < 60) return tr('sec', { s: fmt.num(s, 0) });
      if (s < 3600) return tr('min', { m: Math.floor(s / 60), s: Math.floor(s % 60) });
      return tr('h', { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60) });
    }

    function layers() {
      return [
        { lambda: MATERIALS.brick.lambda, d: p.dw / 100 },
        { lambda: MATERIALS.polystyrene.lambda, d: p.di / 100 },
      ];
    }

    function setupPlot(): void {
      if (p.mode === 'leitung') {
        plot.setRangePadded([0, 20], [0, 110], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('x') }, y: { label: ctx.t('T') } });
      } else if (p.mode === 'daemmung' && p.bau === 'fenster') {
        plot.setRangePadded([0, 4.4], [0, heatLoss(WINDOWS.einfach, p.fa, 20 - p.ta) * 1.18], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: '', numbers: false }, y: { label: ctx.t('wAx') } });
      } else if (p.mode === 'abkuehlen') {
        plot.setRangePadded([0, tEndCup()], [0, 100], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tMin') }, y: { label: ctx.t('T') } });
      } else if (p.mode === 'daemmung') {
        const total = (p.dw + p.di) as number;
        plot.setRangePadded([-6, total + 6], [-22, 24], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('x') }, y: { label: ctx.t('T') } });
      } else if (p.mode === 'koerper') {
        const top = Math.max(300, Math.min(800, bodyLoss(0, p.kta, p.kv) * 1.05));
        plot.setRangePadded([0, 3], [0, top], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('bAxX') }, y: { label: ctx.t('bAxY') } });
      } else if (p.mode === 'kollektor') {
        plot.setRangePadded([0, 100], [0, 100], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('sAxX') }, y: { label: ctx.t('sAxY') } });
      } else if (p.mode === 'strahlung') {
        plot.setRangePadded([0, 800], [0, 50], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: 'ϑ in °C' }, y: { label: 'P in kW/m²' } });
      }
    }

    function bodyState(P: number, M: number): string {
      // Ohne Schwitzen gibt der Körper etwa 20 % seiner Wärme auch über den Atem ab
      return P > M * 1.15 ? 'bCold' : P < M * 0.6 ? 'bWarm' : 'bOk';
    }

    function updateReadouts(): void {
      for (const k of ['time', 'lam', 'P', 'rad', 'U', 'loss', 'info']) ctx.readout(k, null);
      if (p.mode === 'koerper') {
        const P = bodyLoss(p.kclo, p.kta, p.kv);
        const M = BODY_MAKES[p.kakt as 'ruhe' | 'gehen'];
        const rc = p.kclo * CLO;
        const ra = 1 / airTransfer(p.kv);
        ctx.readout('P', tr('bLoss', { P: fmt.num(P, 0), M: fmt.num(M, 0) }));
        ctx.readout('loss', ctx.t(bodyState(P, M)));
        ctx.readout('U', tr('bShare', { c: fmt.num((rc / (rc + ra)) * 100, 0), a: fmt.num((ra / (rc + ra)) * 100, 0) }));
        ctx.readout('info', ctx.t('bInfo'));
        return;
      }
      if (p.mode === 'kollektor') {
        const eta = collectorEfficiency(p.sg, p.stc, p.sta, p.sglas, p.sschw);
        ctx.readout('lam', tr('sEta', { e: fmt.num(eta * 100, 0) }));
        ctx.readout('P', tr('sP', { P: fmt.num(eta * p.sg * COLLECTOR_AREA, 0) }));
        ctx.readout('loss', tr('sLoss', { L: fmt.num((1 - eta) * p.sg * COLLECTOR_AREA, 0) }));
        ctx.readout('info', ctx.t('sInfo'));
        return;
      }
      if (p.mode === 'leitung') {
        const m = MATERIALS[p.mat as MaterialId];
        ctx.readout('time', timeText(time));
        ctx.readout('lam', tr('lamVal', { v: fmt.num(m.lambda, m.lambda < 1 ? 2 : 0) }));
        ctx.readout('P', tr('Pval', { P: fmt.num(conductionPower(m.lambda, AREA, p.th - T_COLD, ROD_LEN), 3) }));
      } else if (p.mode === 'strahlung') {
        const K = p.tk + 273.15;
        const eps = Number(p.surf);
        ctx.readout('rad', tr('radVal', { P: fmt.num(radiatedPower(eps, 1, K), 0), K: fmt.num(K, 0), N: fmt.num(netRadiation(eps, 1, K, 293.15), 0) }));
      } else if (p.mode === 'daemmung' && p.bau === 'fenster') {
        const U = WINDOWS[p.fen as WindowId];
        const P = heatLoss(U, p.fa, 20 - p.ta);
        ctx.readout('U', tr('winU', { U: fmt.num(U, 1) }));
        ctx.readout('loss', tr('winLoss', { U: fmt.num(U, 1), A: fmt.num(p.fa, 1), dT: fmt.num(20 - p.ta, 0), P: fmt.num(P, 0), E: fmt.num((P * 24) / 1000, 1) }));
        ctx.readout('info', ctx.t('winInfo'));
      } else if (p.mode === 'abkuehlen') {
        const k = CONTAINERS[p.gef as ContainerId].k;
        ctx.readout('time', cupTimeText(tc));
        ctx.readout('P', tr('cupNow', { t: cupTimeText(tc), T: fmt.num(cooling(p.t0, 20, k, tc), 1) }));
        const tt = (c: ContainerId) => {
          const m = coolingTime(p.t0, 20, CONTAINERS[c].k, 50);
          return Number.isFinite(m) ? cupTimeText(m) : ctx.t('never');
        };
        ctx.readout('loss', tr('cupTime', { a: tt('becher'), b: tt('deckel'), c: tt('doppel'), d: tt('thermos') }));
        ctx.readout('info', ctx.t('cupInfo'));
      } else if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
      } else if (p.mode === 'daemmung') {
        const U = uValue(layers());
        const P = U * WALL_AREA * (20 - p.ta);
        ctx.readout('U', tr('Uval', { U: fmt.num(U, 2) }));
        ctx.readout('loss', tr('lossVal', { P: fmt.num(P, 0), E: fmt.num((P * 24) / 1000, 1) }));
      }
    }

    /* ---------- Wärmeleitung ---------- */
    function drawRod(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + 70;
      const x1 = r.x + r.w - 60;
      const cy = r.y + r.h / 2;
      const hh = Math.min(46, r.h * 0.18);
      // Wärmequelle links, Kühlung rechts
      roundRect(g, r.x + 16, cy - hh * 1.6, 54, hh * 3.2, 10);
      g.fillStyle = tempColor(p.th, T_COLD, 100);
      g.fill();
      text(g, ctx.t('hot'), r.x + 43, cy - hh * 1.6 - 12, { font: `700 13px ${th.font}`, color: th.text });
      text(g, `${fmt.num(p.th, 0)} °C`, r.x + 43, cy, { font: `700 13px ${th.font}`, color: '#ffffff' });
      roundRect(g, x1, cy - hh * 1.6, 44, hh * 3.2, 10);
      g.fillStyle = tempColor(T_COLD, T_COLD, 100);
      g.fill();
      text(g, ctx.t('cold'), x1 + 22, cy - hh * 1.6 - 12, { font: `700 13px ${th.font}`, color: th.text });
      text(g, '20 °C', x1 + 22, cy, { font: `700 12px ${th.font}`, color: '#ffffff' });
      // Stab in Abschnitten
      const seg = (x1 - x0) / (N - 1);
      for (let i = 0; i < N - 1; i++) {
        g.fillStyle = tempColor((T[i]! + T[i + 1]!) / 2, T_COLD, 100);
        g.fillRect(x0 + i * seg, cy - hh / 2, seg + 1, hh);
      }
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(x0, cy - hh / 2, x1 - x0, hh);
      // Teilchen schwingen umso stärker, je wärmer
      g.fillStyle = withAlpha(th.text, 0.75);
      for (let i = 1; i < N - 1; i += 2) {
        const amp = 1 + (4 * (T[i]! - T[COLD_I]!)) / 80;
        for (const row of [-0.25, 0.25]) {
          const ph = anim * (9 + i * 0.37) + row * 7 + i;
          g.beginPath();
          g.arc(x0 + i * seg + amp * Math.sin(ph), cy + row * hh + amp * Math.cos(ph * 1.3), 2.6, 0, Math.PI * 2);
          g.fill();
        }
      }
      text(g, ctx.t(`m_${p.mat}`), (x0 + x1) / 2, cy + hh / 2 + 22, { font: `700 14px ${th.font}`, color: th.text });
    }
    const COLD_I = N - 1;

    function drawRodChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      // Endzustand (linear) gestrichelt
      plot.polyline(
        [
          [0, p.th],
          [20, T_COLD],
        ],
        { color: withAlpha(th.muted, 0.7), width: 1.5, dash: [6, 5] },
      );
      plot.polyline(
        T.map((t, i) => [(i / (N - 1)) * 20, t] as [number, number]),
        { color: th.series[1]!, width: 3 },
      );
      plot.end();
    }

    /* ---------- Wärmeströmung ---------- */
    function drawConvection(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const pw = Math.min(r.w * 0.8, 420);
      const ph = Math.min(r.h * 0.62, 280);
      const px = r.x + (r.w - pw) / 2;
      const py = r.y + (r.h - ph) / 2 - 10;
      // Topf mit Wasser
      g.fillStyle = withAlpha(th.series[0]!, 0.12);
      g.fillRect(px, py + ph * 0.1, pw, ph * 0.9);
      g.strokeStyle = th.text;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px, py + ph);
      g.lineTo(px + pw, py + ph);
      g.lineTo(px + pw, py);
      g.stroke();
      // Heizplatte
      const k = p.heiz / 100;
      roundRect(g, px + pw * 0.3, py + ph + 6, pw * 0.4, 14, 4);
      g.fillStyle = k > 0 ? tempColor(20 + 80 * k, 20, 100) : th.muted;
      g.fill();
      text(g, ctx.t('heater'), px + pw / 2, py + ph + 34, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.muted });
      text(g, ctx.t('water'), px + 30, py + ph * 0.1 + 16, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      // Zwei Walzen: in der Mitte hoch, an den Seiten herunter
      const cells = [
        { cx: px + pw * 0.27, dir: -1 },
        { cx: px + pw * 0.73, dir: 1 },
      ];
      const ry = ph * 0.33;
      const rx = pw * 0.19;
      const cyc = py + ph * 0.55;
      const n = 14;
      for (const c of cells) {
        g.strokeStyle = withAlpha(th.muted, 0.35);
        g.lineWidth = 1.5;
        g.setLineDash([5, 6]);
        g.beginPath();
        g.ellipse(c.cx, cyc, rx, ry, 0, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + c.dir * anim * 0.9 * k;
          const x = c.cx + rx * Math.cos(a);
          const y = cyc + ry * Math.sin(a);
          // innen (zur Mitte) warm, außen kalt
          // zur Topfmitte hin warm (dort steigt das Wasser auf), außen kalt
          const inner = -c.dir * Math.cos(a);
          const temp = 0.5 + 0.5 * inner;
          g.fillStyle = k > 0 ? tempColor(temp, 0, 1) : tempColor(0, 0, 1);
          g.beginPath();
          g.arc(x, y, 6, 0, Math.PI * 2);
          g.fill();
        }
        // Pfeil in der Mitte nach oben
      }
      if (k > 0) {
        const ax = px + pw / 2;
        g.strokeStyle = th.series[1]!;
        g.fillStyle = th.series[1]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(ax, cyc + ry * 0.6);
        g.lineTo(ax, cyc - ry * 0.6);
        g.stroke();
        g.beginPath();
        g.moveTo(ax, cyc - ry * 0.6 - 10);
        g.lineTo(ax - 7, cyc - ry * 0.6 + 2);
        g.lineTo(ax + 7, cyc - ry * 0.6 + 2);
        g.closePath();
        g.fill();
      }
    }

    /* ---------- Wärmestrahlung ---------- */
    function drawRadiation(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w * 0.3;
      const cy = r.y + r.h / 2;
      const rad = Math.min(r.w, r.h) * 0.16;
      const eps = Number(p.surf);
      const K = p.tk + 273.15;
      const glow = Math.max(0, Math.min(1, (p.tk - 500) / 300));
      // Körper
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.fillStyle = eps > 0.9 ? th.text : eps > 0.3 ? th.muted : withAlpha(th.muted, 0.35);
      g.fill();
      if (glow > 0) {
        g.fillStyle = withAlpha(th.series[1]!, 0.25 + 0.6 * glow);
        g.fill();
      }
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      text(g, `${fmt.num(p.tk, 0)} °C`, cx, cy, { font: `700 13px ${th.font}`, color: eps > 0.3 || glow > 0.3 ? th.bg : th.text });
      // Wellige Strahlen, Anzahl/Helligkeit ∝ Leistung
      const P = radiatedPower(eps, 1, K);
      const Pmax = radiatedPower(0.95, 1, 1073.15);
      const strength = Math.sqrt(P / Pmax);
      const rays = 10;
      const len = Math.max(20, Math.min(r.w * 0.3 - 8, r.h / 2 - rad - 14));
      g.strokeStyle = withAlpha(th.series[1]!, 0.25 + 0.75 * strength);
      g.lineWidth = 1.5 + 3 * strength;
      for (let k = 0; k < rays; k++) {
        const a = (k / rays) * Math.PI * 2;
        g.beginPath();
        for (let s = 0; s <= 40; s++) {
          const d = rad + 8 + (s / 40) * len * (0.3 + 0.7 * strength);
          const wob = 5 * Math.sin(s * 0.9 - anim * 6);
          const x = cx + d * Math.cos(a) - wob * Math.sin(a);
          const y = cy + d * Math.sin(a) + wob * Math.cos(a);
          if (s) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
      }
      text(g, ctx.t('vacuum'), r.x + r.w / 2, r.y + r.h - 18, { font: `600 12px ${th.font}`, color: th.muted });
    }

    function drawRadChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const eps = Number(p.surf);
      for (const [e, a] of [
        [0.95, 0.3],
        [0.5, 0.3],
        [0.05, 0.3],
      ] as const) {
        if (e === eps) continue;
        plot.fn((t) => radiatedPower(e, 1, t + 273.15) / 1000, { color: withAlpha(th.muted, a + 0.2), width: 1.5, from: 0, to: 800 });
      }
      plot.fn((t) => radiatedPower(eps, 1, t + 273.15) / 1000, { color: th.series[1]!, width: 3, from: 0, to: 800 });
      plot.point(p.tk, radiatedPower(eps, 1, p.tk + 273.15) / 1000, { color: th.series[1]!, radius: 6 });
      plot.end();
    }

    /* ---------- Dämmung ---------- */
    function drawWall(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const total = p.dw + p.di;
      const scale = Math.min((r.w - 140) / 80, 6);
      const w = total * scale;
      const wx = r.x + (r.w - w) / 2;
      const top = r.y + 40;
      const bot = r.y + r.h - 30;
      // Innen- und Außenraum
      g.fillStyle = withAlpha(th.series[1]!, 0.12);
      g.fillRect(r.x + 8, top, wx - r.x - 8, bot - top);
      g.fillStyle = withAlpha(th.series[0]!, 0.12);
      g.fillRect(wx + w, top, r.x + r.w - 8 - wx - w, bot - top);
      text(g, `${ctx.t('inside')} 20 °C`, (r.x + wx) / 2, top - 14, { font: `700 13px ${th.font}`, color: th.series[1]! });
      text(g, `${ctx.t('outside')} ${fmt.num(p.ta, 0)} °C`, (wx + w + r.x + r.w) / 2, top - 14, { font: `700 13px ${th.font}`, color: th.series[0]! });
      // Ziegel
      const bw = p.dw * scale;
      g.fillStyle = withAlpha(th.series[3]!, 0.85);
      g.fillRect(wx, top, bw, bot - top);
      g.strokeStyle = withAlpha(th.bg, 0.45);
      g.lineWidth = 1;
      for (let y = top; y < bot; y += 14) {
        g.beginPath();
        g.moveTo(wx, y);
        g.lineTo(wx + bw, y);
        g.stroke();
      }
      text(g, ctx.t('brick'), wx + bw / 2, (top + bot) / 2, { font: `700 12px ${th.font}`, color: '#ffffff' });
      if (p.di > 0) {
        const iw = p.di * scale;
        g.fillStyle = withAlpha(th.muted, 0.22);
        g.fillRect(wx + bw, top, iw, bot - top);
        g.fillStyle = withAlpha(th.muted, 0.6);
        for (let y = top + 4; y < bot; y += 9) for (let x = wx + bw + 4; x < wx + bw + iw - 2; x += 9) g.fillRect(x, y, 3, 3);
        if (iw > 40) text(g, ctx.t('insul'), wx + bw + iw / 2, (top + bot) / 2 + 22, { font: `700 12px ${th.font}`, color: th.text });
      }
    }

    function drawWallChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const ts = wallTemperatures(layers(), 20, p.ta);
      const xs = [0, p.dw, p.dw + p.di];
      const pts: [number, number][] = [
        [-6, 20],
        [0, ts[0]!],
      ];
      for (let i = 1; i < ts.length; i++) pts.push([xs[i]!, ts[i]!]);
      pts.push([p.dw + p.di + 6, p.ta]);
      plot.vline(0, { color: withAlpha(th.muted, 0.6), width: 1 });
      plot.vline(p.dw, { color: withAlpha(th.muted, 0.6), width: 1 });
      if (p.di > 0) plot.vline(p.dw + p.di, { color: withAlpha(th.muted, 0.6), width: 1 });
      plot.polyline(pts, { color: th.series[1]!, width: 3 });
      plot.end();
    }

    /* ---------- Abkühlen ---------- */
    function cupTimeText(min: number): string {
      if (min < 60) return `${fmt.num(min, 0)} min`;
      const h = Math.floor(min / 60);
      return `${h} h ${fmt.num(min - 60 * h, 0)} min`;
    }

    function drawCups(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const slot = r.w / 4;
      const base = r.y + r.h * (narrow ? 0.5 : 0.6);
      const cupH = Math.min(r.h * (narrow ? 0.28 : 0.34), 110);
      CUPS.forEach((c, i) => {
        const cx = r.x + slot * (i + 0.5);
        const k = CONTAINERS[c].k;
        const T = cooling(p.t0, 20, k, tc);
        const w = Math.min(slot * 0.62, c === 'thermos' ? 46 : 64);
        const h = c === 'thermos' ? cupH * 1.25 : cupH;
        const x0 = cx - w / 2;
        const y0 = base - h;
        const sel = c === p.gef;
        // Gefäß
        if (c === 'doppel' || c === 'thermos') {
          roundRect(g, x0 - 5, y0 - 2, w + 10, h + 7, 8);
          g.fillStyle = c === 'thermos' ? withAlpha(th.muted, 0.5) : withAlpha(th.muted, 0.25);
          g.fill();
        }
        roundRect(g, x0, y0, w, h, 6);
        g.fillStyle = tempColor(T, 20, 95);
        g.globalAlpha = 0.85;
        g.fill();
        g.globalAlpha = 1;
        g.strokeStyle = sel ? th.series[1]! : th.text;
        g.lineWidth = sel ? 3.5 : 2;
        g.stroke();
        if (c === 'deckel' || c === 'thermos') {
          g.fillStyle = th.text;
          roundRect(g, x0 - 4, y0 - 8, w + 8, 8, 3);
          g.fill();
        }
        if (c !== 'thermos') {
          // Henkel
          g.strokeStyle = th.text;
          g.lineWidth = 3;
          g.beginPath();
          g.arc(x0 + w + 6, y0 + h * 0.45, h * 0.18, -Math.PI / 2, Math.PI / 2);
          g.stroke();
        }
        // Dampf beim offenen Becher, solange heiß
        if (c === 'becher' && T > 45) {
          g.strokeStyle = withAlpha(th.muted, Math.min(0.8, (T - 40) / 50));
          g.lineWidth = 2;
          for (let j = 0; j < 3; j++) {
            const ph = (anim * 0.6 + j / 3) % 1;
            const sx = x0 + w * (0.25 + 0.25 * j);
            g.beginPath();
            for (let q = 0; q <= 10; q++) {
              const yy = y0 - 6 - q * 3 - ph * 12;
              const xx = sx + Math.sin(q * 0.8 + anim * 3 + j) * 4;
              if (q) g.lineTo(xx, yy);
              else g.moveTo(xx, yy);
            }
            g.stroke();
          }
        }
        text(g, `${fmt.num(T, 1)} °C`, cx, base + 18, { font: `800 ${narrow ? 13 : 15}px ${th.font}`, color: th.text });
        text(g, ctx.t(`cup_${c}`), cx, base + (narrow ? 34 : 38), { font: `600 ${narrow ? 10 : 12}px ${th.font}`, color: sel ? th.series[1]! : th.muted });
      });
      // Anteile der Transportarten für das gewählte Gefäß
      const sh = CONTAINERS[p.gef as ContainerId].share;
      const bx = r.x + 16;
      const bw = r.w - 32;
      const by = r.y + r.h - (narrow ? 20 : 30);
      text(g, ctx.t('share'), bx, by - 12, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      let x = bx;
      const cols = [th.series[3]!, th.series[0]!, th.series[1]!];
      (['leitung', 'stroemung', 'strahlung'] as const).forEach((key, i) => {
        const ww = bw * sh[key];
        g.fillStyle = withAlpha(cols[i]!, 0.75);
        g.fillRect(x, by, ww, 14);
        if (ww > 60) text(g, `${ctx.t(`sh_${key}`)} ${fmt.num(sh[key] * 100, 0)} %`, x + ww / 2, by + 7, { font: `600 10px ${th.font}`, color: '#ffffff' });
        x += ww;
      });
      text(g, cupTimeText(tc), r.x + r.w - 12, r.y + 16, { font: `700 13px ${th.font}`, color: th.text, align: 'right' });
    }

    function drawCupChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(50, { color: withAlpha(th.muted, 0.5), dash: [5, 4], width: 1 });
      const cols = [th.series[3]!, th.series[0]!, th.series[2]!, th.series[1]!];
      // Beschriftungen nur, wenn sie nicht auf einer anderen liegen (gewähltes Gefäß zuerst)
      const used: number[] = [];
      const labelOk = (T: number) => {
        if (used.some((u) => Math.abs(u - T) < 5)) return false;
        used.push(T);
        return true;
      };
      labelOk(cooling(p.t0, 20, CONTAINERS[p.gef as ContainerId].k, Math.min(tc, tEndCup())));
      CUPS.forEach((c, i) => {
        const k = CONTAINERS[c].k;
        const sel = c === p.gef;
        plot.fn((t) => cooling(p.t0, 20, k, t), { color: withAlpha(cols[i]!, sel ? 0.35 : 0.15), width: 1.5, from: 0, to: tEndCup() });
        plot.fn((t) => cooling(p.t0, 20, k, t), { color: cols[i]!, width: sel ? 3.5 : 2, from: 0, to: Math.min(tc, tEndCup()) });
        const tl = Math.min(tc, tEndCup());
        if (sel || labelOk(cooling(p.t0, 20, k, tl)))
          plot.text(tl, cooling(p.t0, 20, k, tl), ctx.t(`cup_${c}`), { color: cols[i]!, size: 11, weight: sel ? 'bold' : 'normal', align: 'right', offset: [-4, -10] });
      });
      plot.end();
    }

    /* ---------- Fenster ---------- */
    function drawWindow(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const id = p.fen as WindowId;
      const panes = id === 'einfach' ? 1 : id === 'dreifach' ? 3 : 2;
      const cx = r.x + r.w / 2;
      const top = r.y + 40;
      const bot = r.y + r.h - 40;
      const gap = 24;
      const pw = 12;
      const total = panes * pw + (panes - 1) * gap;
      const x0 = cx - total / 2;
      g.fillStyle = withAlpha(th.series[1]!, 0.12);
      g.fillRect(r.x + 8, top, x0 - r.x - 8, bot - top);
      g.fillStyle = withAlpha(th.series[0]!, 0.12);
      g.fillRect(x0 + total, top, r.x + r.w - 8 - x0 - total, bot - top);
      text(g, `${ctx.t('inside')} 20 °C`, (r.x + x0) / 2, top - 14, { font: `700 13px ${th.font}`, color: th.series[1]! });
      text(g, `${ctx.t('outside')} ${fmt.num(p.ta, 0)} °C`, (x0 + total + r.x + r.w) / 2, top - 14, { font: `700 13px ${th.font}`, color: th.series[0]! });
      for (let i = 0; i < panes; i++) {
        const x = x0 + i * (pw + gap);
        g.fillStyle = withAlpha(th.series[0]!, 0.45);
        g.fillRect(x, top, pw, bot - top);
        if (id === 'waerme' || id === 'dreifach') {
          // Beschichtung auf der Innenseite
          g.fillStyle = withAlpha(th.series[3]!, 0.9);
          g.fillRect(x - 1, top, 2, bot - top);
        }
        if (i < panes - 1) {
          g.fillStyle = withAlpha(th.muted, id === 'doppel' ? 0.1 : 0.22);
          g.fillRect(x + pw, top, gap, bot - top);
        }
      }
      // Wärmepfeile: Breite nach Verlust
      const P = heatLoss(WINDOWS[id], p.fa, 20 - p.ta);
      const Pmax = heatLoss(WINDOWS.einfach, p.fa, 20 - p.ta);
      const n = Math.max(1, Math.round(6 * (P / Math.max(1, Pmax))));
      g.fillStyle = th.series[1]!;
      for (let k = 0; k < n; k++) {
        const y = top + ((k + 0.5) * (bot - top)) / n;
        const ph = (anim * 0.5 + k * 0.17) % 1;
        const x = r.x + 20 + ph * (r.w - 40);
        g.beginPath();
        g.moveTo(x + 10, y);
        g.lineTo(x - 4, y - 6);
        g.lineTo(x - 4, y + 6);
        g.closePath();
        g.fill();
      }
      text(g, `U = ${fmt.num(WINDOWS[id], 1)} W/(m² · K)`, cx, bot + 22, { font: `700 13px ${th.font}`, color: th.text });
    }

    function drawWindowChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      WINS.forEach((w, i) => {
        const P = heatLoss(WINDOWS[w], p.fa, 20 - p.ta);
        const x = i + 0.7;
        plot.polygon(
          [
            [x - 0.35, 0],
            [x + 0.35, 0],
            [x + 0.35, P],
            [x - 0.35, P],
          ],
          { fill: w === p.fen ? th.series[1]! : withAlpha(th.muted, 0.4) },
        );
        plot.text(x, P, fmt.num(P, 0), { color: th.text, size: 12, weight: 'bold', align: 'center', offset: [0, -8] });
        plot.text(x, P, ctx.t(`win_${w}`), { color: th.muted, size: 11, align: 'center', offset: [0, -24] });
      });
      plot.end();
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
      g.fillText(ans ? tr('qYour', { a: `${ans}${task.unit ? ` ${task.unit}` : ''}` }) : ctx.t('qHow'), pad, y);
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
      const sx = W / 2 - 90;
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(sx + i * 20, H - 24, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
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

    /* ---------- Kleidung und Wind ---------- */
    function arrowTo(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, w: number): void {
      const a = Math.atan2(y1 - y0, x1 - x0);
      g.strokeStyle = col;
      g.fillStyle = col;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - Math.cos(a) * w * 2, y1 - Math.sin(a) * w * 2);
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - Math.cos(a - 0.5) * (w * 3 + 4), y1 - Math.sin(a - 0.5) * (w * 3 + 4));
      g.lineTo(x1 - Math.cos(a + 0.5) * (w * 3 + 4), y1 - Math.sin(a + 0.5) * (w * 3 + 4));
      g.closePath();
      g.fill();
    }

    function drawBody(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const P = bodyLoss(p.kclo, p.kta, p.kv);
      const M = BODY_MAKES[p.kakt as 'ruhe' | 'gehen'];
      const state = bodyState(P, M);
      const cx = r.x + r.w * 0.42;
      const s0 = Math.max(0.5, Math.min((r.h - 80) / 240, r.w / 260, 1.5));
      const headY = r.y + 22 + 22 * s0;
      // Kleidungsschichten: je clo ein Ring um den Rumpf
      const torso = (pad: number) => {
        roundRect(g, cx - 30 * s0 - pad, headY + 26 * s0 - pad * 0.5, 60 * s0 + 2 * pad, 110 * s0 + pad, 18 * s0 + pad);
      };
      const layersN = Math.round(p.kclo * 2);
      for (let i = layersN; i >= 1; i--) {
        torso(i * 5 * s0);
        g.fillStyle = withAlpha(th.series[i % 2 === 0 ? 0 : 3]!, 0.18 + 0.06 * i);
        g.fill();
      }
      // Rumpf, Kopf, Beine
      g.fillStyle = withAlpha(th.series[1]!, 0.55);
      torso(0);
      g.fill();
      g.beginPath();
      g.arc(cx, headY, 20 * s0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = withAlpha(th.series[1]!, 0.55);
      g.lineWidth = 14 * s0;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - 14 * s0, headY + 140 * s0);
      g.lineTo(cx - 16 * s0, headY + 200 * s0);
      g.moveTo(cx + 14 * s0, headY + 140 * s0);
      g.lineTo(cx + 16 * s0, headY + 200 * s0);
      g.stroke();
      g.lineCap = 'butt';
      // Wärmepfeile: Stärke nach Wärmeabgabe
      const w = Math.max(1.5, Math.min(7, P / 60));
      const col = state === 'bCold' ? th.series[0]! : state === 'bWarm' ? th.series[1]! : th.series[2]!;
      const pulse = 0.5 + 0.5 * Math.sin(anim * 3);
      for (const [dx, dy] of [
        [1, -0.5],
        [1, 0.3],
        [-1, -0.2],
        [-1, 0.5],
      ] as const) {
        const x0 = cx + dx * (36 * s0 + layersN * 5 * s0);
        const y0 = headY + 80 * s0 + dy * 50 * s0;
        arrowTo(g, x0, y0, x0 + dx * (26 + 10 * pulse) * s0, y0 + dy * 8, withAlpha(col, 0.85), w);
      }
      // Wind von links
      if (p.kv > 0) {
        g.strokeStyle = withAlpha(th.muted, 0.7);
        g.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const y = r.y + r.h * (0.2 + i * 0.12);
          const len = 20 + p.kv * 3;
          const x = r.x + 10 + ((anim * (20 + p.kv * 12) + i * 47) % Math.max(40, cx - r.x - 70 * s0 - len));
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + len, y);
          g.stroke();
        }
      }
      text(g, `${fmt.num(p.kta, 0)} °C`, r.x + r.w - 14, r.y + 22, { font: `800 16px ${th.font}`, color: th.text, align: 'right' });
      const lines = wrap(g, ctx.t(state), r.w - 28);
      g.font = `700 13px ${th.font}`;
      lines.forEach((ln, i) => text(g, ln, r.x + 14, r.y + r.h - 14 - (lines.length - 1 - i) * 17, { font: `700 13px ${th.font}`, color: col, align: 'left' }));
    }

    function drawBodyChart(): void {
      const th = ctx.theme;
      const M = BODY_MAKES[p.kakt as 'ruhe' | 'gehen'];
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(M, { color: th.series[2]!, dash: [5, 4], width: 1.5 });
      plot.text(3, M, `${ctx.t('bMakes')} ${fmt.num(M, 0)} W`, { color: th.series[2]!, size: 11, align: 'right', offset: [-4, -10] });
      plot.fn((c) => bodyLoss(c, p.kta, p.kv), { color: th.series[0]!, width: 2.5, from: 0, to: 3 });
      plot.point(p.kclo, bodyLoss(p.kclo, p.kta, p.kv), { color: th.series[0]!, radius: 6 });
      plot.end();
    }

    /* ---------- Sonnenkollektor ---------- */
    function drawCollector(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const eta = collectorEfficiency(p.sg, p.stc, p.sta, p.sglas, p.sschw);
      // Dach (schräg) mit Kollektor im Querschnitt
      const x0 = r.x + r.w * 0.12;
      const x1 = r.x + r.w * 0.88;
      const y0 = r.y + r.h - 24;
      const y1 = Math.max(r.y + r.h * 0.42, y0 - (x1 - x0) * 0.45);
      const ang = Math.atan2(y1 - y0, x1 - x0);
      const nx = Math.sin(ang);
      const ny = -Math.cos(ang);
      const off = (x: number, y: number, d: number): [number, number] => [x + nx * d, y + ny * d];
      const quad = (d0: number, d1: number, fill: string) => {
        const a = off(x0, y0, d0);
        const b = off(x1, y1, d0);
        const c = off(x1, y1, d1);
        const d = off(x0, y0, d1);
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.lineTo(c[0], c[1]);
        g.lineTo(d[0], d[1]);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
      };
      quad(-14, 0, withAlpha(th.muted, 0.35)); // Dämmung unten
      const hot = Math.max(0, Math.min(1, (p.stc - 10) / 80));
      quad(0, 8, withAlpha(th.series[1]!, 0.3 + 0.6 * hot)); // Wasser
      quad(8, 12, p.sschw ? (th.dark ? withAlpha(th.text, 0.15) : th.text) : withAlpha(th.muted, 0.7)); // Absorber
      if (p.sglas) quad(26, 29, withAlpha(th.series[0]!, 0.45));
      // Sonne und Strahlen
      const sx = r.x + 30;
      const sy = r.y + 30;
      g.fillStyle = th.series[3]!;
      g.beginPath();
      g.arc(sx, sy, 16, 0, Math.PI * 2);
      g.fill();
      text(g, `${ctx.t('sSun')}: ${fmt.num(p.sg, 0)} W/m²`, sx + 24, sy, { font: `700 12px ${th.font}`, color: th.text, align: 'left' });
      const rays = Math.max(2, Math.round(p.sg / 200));
      const t0 = (anim * 0.6) % 1;
      for (let i = 0; i < rays; i++) {
        const f = (i + 0.5) / rays;
        const tx = x0 + (x1 - x0) * (0.25 + 0.6 * f);
        const ty = y0 + (y1 - y0) * (0.25 + 0.6 * f);
        const [ex, ey] = off(tx, ty, 12);
        const k = (t0 + f) % 1;
        g.strokeStyle = withAlpha(th.series[3]!, 0.75);
        g.lineWidth = 2;
        g.setLineDash([6, 6]);
        g.lineDashOffset = -k * 24;
        g.beginPath();
        g.moveTo(sx + (ex - sx) * 0.15, sy + (ey - sy) * 0.15);
        g.lineTo(ex, ey);
        g.stroke();
      }
      g.setLineDash([]);
      g.lineDashOffset = 0;
      // Verluste: Reflexion, Strömung, Strahlung
      const mid = off((x0 + x1) / 2, (y0 + y1) / 2, 34);
      const conv = p.sglas ? 0.35 : 1;
      const lossW = (v: number) => Math.max(1.2, Math.min(6, v));
      const dT = Math.max(0, p.stc - p.sta);
      arrowTo(g, mid[0] - 30, mid[1], mid[0] - 50, mid[1] - 46, withAlpha(th.muted, 0.8), lossW(p.sschw ? 1.2 : 5));
      text(g, ctx.t('sRefl'), mid[0] - 54, mid[1] - 58, { font: `600 11px ${th.font}`, color: th.muted });
      arrowTo(g, mid[0] + 10, mid[1], mid[0] + 20, mid[1] - 50, withAlpha(th.series[1]!, 0.8), lossW((dT / 15) * conv * 2));
      text(g, ctx.t('sConv'), mid[0] + 22, mid[1] - 62, { font: `600 11px ${th.font}`, color: th.series[1]! });
      arrowTo(g, mid[0] + 50, mid[1] - 10, mid[0] + 80, mid[1] - 50, withAlpha(th.series[4] ?? th.series[0]!, 0.8), lossW((dT / 20) * (p.sglas ? 0.6 : 1) * 2));
      text(g, ctx.t('sRad'), mid[0] + 86, mid[1] - 60, { font: `600 11px ${th.font}`, color: th.muted });
      const [wx, wy] = off(x1, y1, -24);
      text(g, `${ctx.t('sWater')} ${fmt.num(p.stc, 0)} °C`, wx - 10, wy + 10, { font: `700 12px ${th.font}`, color: th.series[1]!, align: 'right' });
      text(g, `η ≈ ${fmt.num(eta * 100, 0)} %`, r.x + r.w - 14, r.y + 22, { font: `800 16px ${th.font}`, color: eta > 0.3 ? th.series[2]! : th.muted, align: 'right' });
    }

    function drawCollectorChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const other = (glass: boolean, black: boolean) => (T: number) => 100 * collectorEfficiency(p.sg, T, p.sta, glass, black);
      plot.fn(other(!p.sglas, p.sschw), { color: withAlpha(th.muted, 0.6), width: 1.5, from: Math.max(0, p.sta), to: 100 });
      plot.fn(other(p.sglas, p.sschw), { color: th.series[2]!, width: 2.5, from: Math.max(0, p.sta), to: 100 });
      plot.point(p.stc, 100 * collectorEfficiency(p.sg, p.stc, p.sta, p.sglas, p.sschw), { color: th.series[2]!, radius: 6 });
      plot.end();
    }

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode') || changed.has('mat') || changed.has('th')) resetRod();
        if (source === 'init' || ['mode', 'dw', 'di', 'bau', 'fa', 'ta', 'dauer', 't0', 'kta', 'kv'].some((k) => changed.has(k))) setupPlot();
        if ((p.mode === 'koerper' || p.mode === 'kollektor') && !prefersReducedMotion()) ctx.clock.play();
        if (source === 'init' || source === 'replace' || ['mode', 't0', 'dauer'].some((k) => changed.has(k))) {
          tc = 0;
          cooling_on = false;
        }
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
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'ueben' ? 'canvasQuiz' : p.mode === 'koerper' ? 'canvasB' : p.mode === 'kollektor' ? 'canvasC' : 'canvas'));
        updateReadouts();
      },

      action(id) {
        if (id === 'go') {
          tc = 0;
          if (prefersReducedMotion()) tc = tEndCup();
          else {
            cooling_on = true;
            ctx.clock.play();
          }
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        if (id !== 'reset') {
          updateReadouts();
          ctx.requestRender();
        }
        if (id === 'reset') {
          resetRod();
          ctx.clock.play();
          updateReadouts();
          ctx.requestRender();
        }
      },

      tick(dt) {
        anim += dt;
        if (p.mode === 'abkuehlen' && cooling_on) {
          // ganze Beobachtungszeit in etwa 12 Sekunden
          tc = Math.min(tEndCup(), tc + (dt * tEndCup()) / 12);
          if (tc >= tEndCup()) cooling_on = false;
          updateReadouts();
        }
        if (p.mode === 'leitung') {
          const step = dt * Number(p.raffer);
          conductionStep(T, diffusivity(p.mat as MaterialId), ROD_LEN / (N - 1), step);
          T[0] = p.th;
          time += step;
          updateReadouts();
        }
      },

      resetTime() {
        resetRod();
        anim = 0;
        updateReadouts();
      },

      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        if (p.mode === 'ueben') {
          drawQuiz(surface.width, surface.height);
          return;
        }
        if (p.mode === 'koerper') {
          drawBody(s.scene);
          drawBodyChart();
          return;
        }
        if (p.mode === 'kollektor') {
          drawCollector(s.scene);
          drawCollectorChart();
          return;
        }
        if (p.mode === 'abkuehlen') {
          drawCups(s.scene);
          drawCupChart();
          return;
        }
        if (p.mode === 'daemmung' && p.bau === 'fenster') {
          drawWindow(s.scene);
          drawWindowChart();
          return;
        }
        if (p.mode === 'leitung') {
          drawRod(s.scene);
          drawRodChart();
        } else if (p.mode === 'stroemung') {
          drawConvection({ x: 0, y: 0, w: surface.width, h: surface.height });
        } else if (p.mode === 'strahlung') {
          drawRadiation(s.scene);
          drawRadChart();
        } else {
          drawWall(s.scene);
          drawWallChart();
        }
      },

      destroy: () => surface.destroy(),
    };
  },
});
