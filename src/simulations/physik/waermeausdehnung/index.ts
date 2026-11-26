import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  airDensity,
  balloonLift,
  ICE_EXPANSION,
  SEA_DENSITY,
  submergedFraction,
  ALPHA,
  cableSag,
  capillaryRise,
  checkTask,
  gapWidth,
  gasVolume,
  GAMMA_LIQ,
  lengthChange,
  liquidVolume,
  makeTask,
  thermostatStep,
  waterDensity,
  type ExpansionTask,
  type LiquidId,
  type SolidId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const T0 = 20;
/** Vergrößerung der Längenänderung in der Zeichnung */
const ZOOM = 400;
/** Alltag: Brücke 100 m (Fuge 40 mm bei 20 °C), Schiene 30 m (Lücke 11 mm), Freileitung 200 m (Durchhang 5 m). */
const BRIDGE = { L: 100, gap0: 0.04 };
const RAIL = { L: 30, gap0: 0.011 };
const LINE = { span: 200, f0: 5 };
/** Thermometer: Kugel 150 mm³, Kapillare mit 0,15 mm Radius. */
const BULB = 150;
const CAP_R = 0.15;
/** Bügeleisen: Heizrate (K/s), Abkühlkonstante (1/s), Dauer (s), Zeitraffer. */
const IRON = { heat: 9, k: 0.025, env: 20, dur: 120, speed: 4 };

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.52);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Wärmeausdehnung: Stäbe und Bimetall, Flüssigkeiten im Thermometer, Gas
 * bei konstantem Druck, Dichteanomalie des Wassers mit Temperaturschichtung
 * eines Sees, Alltag (Brückenfuge, Schiene, Freileitung), Bimetall-Thermostat
 * im Bügeleisen und eine Übung.
 */
export default defineSimulation({
  id: 'waermeausdehnung',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Stoff', 'Substance'),
      options: [
        { value: 'fest', label: L('Feste Körper und Bimetall', 'Solids and bimetal') },
        { value: 'fluessig', label: L('Flüssigkeiten: So funktioniert ein Thermometer', 'Liquids: how a thermometer works') },
        { value: 'gas', label: L('Gas', 'Gas') },
        { value: 'wasser', label: L('Anomalie des Wassers', 'Anomaly of water') },
        { value: 'alltag', label: L('Alltag: Brücke, Schiene, Stromleitung', 'Everyday: bridge, rail, power line') },
        { value: 'thermostat', label: L('Bimetall-Thermostat im Bügeleisen', 'Bimetal thermostat in an iron') },
        { value: 'ballon', label: L('Heißluftballon: warme Luft trägt', 'Hot-air balloon: warm air lifts') },
        { value: 'eis', label: L('Eis: Wasser dehnt sich beim Gefrieren aus', 'Ice: water expands when it freezes') },
        { value: 'ueben', label: L('Üben: Aufgaben zur Wärmeausdehnung', 'Practice: thermal expansion tasks') },
      ],
      default: 'fest',
      display: 'menu',
    },
    {
      key: 'mat',
      type: 'choice',
      label: L('Material des oberen Stabs', 'Material of the upper rod'),
      options: [
        { value: 'aluminium', label: L('Aluminium', 'aluminium') },
        { value: 'copper', label: L('Kupfer', 'copper') },
        { value: 'steel', label: L('Stahl', 'steel') },
        { value: 'glass', label: L('Glas', 'glass') },
        { value: 'invar', label: L('Invar', 'Invar') },
      ],
      default: 'aluminium',
      visibleIf: (v) => v.mode === 'fest',
    },
    {
      key: 't',
      type: 'number',
      label: L('Temperatur', 'Temperature'),
      min: -20,
      max: 100,
      step: 1,
      default: 60,
      unit: '°C',
      visibleIf: (v) => v.mode === 'fest' || v.mode === 'gas' || v.mode === 'fluessig',
    },
    { key: 'L0', type: 'number', label: L('Länge bei 20 °C', 'Length at 20 °C'), min: 1, max: 100, step: 1, default: 1, unit: 'm', visibleIf: (v) => v.mode === 'fest' },
    {
      key: 'av',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: [
        { value: 'bruecke', label: L('Brücke mit Dehnungsfuge', 'Bridge with expansion joint') },
        { value: 'schiene', label: L('Bahnschienen mit Stoßlücke', 'Rails with a gap') },
        { value: 'leitung', label: L('Stromleitung zwischen Masten', 'Power line between pylons') },
      ],
      default: 'bruecke',
      visibleIf: (v) => v.mode === 'alltag',
    },
    { key: 'jt', type: 'number', label: L('Temperatur im Jahreslauf', 'Temperature during the year'), min: -20, max: 50, step: 1, default: 35, unit: '°C', visibleIf: (v) => v.mode === 'alltag' },
    {
      key: 'set',
      type: 'number',
      label: L('Eingestellte Temperatur (Regler)', 'Set temperature (dial)'),
      min: 100,
      max: 220,
      step: 5,
      default: 150,
      unit: '°C',
      visibleIf: (v) => v.mode === 'thermostat',
    },
    {
      key: 'hy',
      type: 'number',
      label: L('Schaltdifferenz des Bimetalls', 'Switching gap of the bimetal'),
      min: 4,
      max: 30,
      step: 1,
      default: 12,
      unit: 'K',
      visibleIf: (v) => v.mode === 'thermostat',
    },
    { key: 'bvol', type: 'number', label: L('Volumen der Hülle', 'Volume of the envelope'), min: 500, max: 4000, step: 100, default: 2500, unit: 'm³', visibleIf: (v) => v.mode === 'ballon' },
    { key: 'bto', type: 'number', label: L('Temperatur draußen', 'Outside temperature'), min: -10, max: 35, step: 1, default: 15, unit: '°C', visibleIf: (v) => v.mode === 'ballon' },
    { key: 'bti', type: 'number', label: L('Temperatur im Ballon', 'Temperature in the balloon'), min: 15, max: 120, step: 1, default: 100, unit: '°C', visibleIf: (v) => v.mode === 'ballon' },
    {
      key: 'blast',
      type: 'number',
      label: L('Hülle, Korb, Brenner und Personen', 'Envelope, basket, burner and people'),
      min: 200,
      max: 1200,
      step: 10,
      default: 600,
      unit: 'kg',
      visibleIf: (v) => v.mode === 'ballon',
    },
    { key: 'ifill', type: 'number', label: L('Flasche gefüllt zu', 'Bottle filled to'), min: 50, max: 100, step: 1, default: 95, unit: '%', visibleIf: (v) => v.mode === 'eis' },
    { key: 'isalt', type: 'boolean', label: L('Eisberg im Meerwasser (salzig)', 'iceberg in sea water (salty)'), default: true, visibleIf: (v) => v.mode === 'eis' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('eine Zahl', 'a number'), visibleIf: (v) => v.mode === 'ueben' },
    {
      key: 'luft',
      type: 'number',
      label: L('Lufttemperatur über dem See', 'Air temperature above the lake'),
      min: -10,
      max: 20,
      step: 1,
      default: 2,
      unit: '°C',
      visibleIf: (v) => v.mode === 'wasser',
    },
  ],
  hint: (v) =>
    v.mode === 'ballon'
      ? L(
          'Warme Luft dehnt sich aus und ist darum leichter als die kalte Luft draußen. Heize auf, bis der Ballon steigt.',
          'Warm air expands and is therefore lighter than the cold air outside. Heat it until the balloon rises.',
        )
      : v.mode === 'eis'
        ? L(
            'Wasser ist eine Ausnahme: Beim Gefrieren dehnt es sich um etwa 9 % aus. Darum schwimmt Eis – und volle Flaschen platzen.',
            'Water is an exception: when it freezes it expands by about 9 %. That is why ice floats – and full bottles burst.',
          )
        : v.mode === 'fest'
          ? L('Die Längenänderung ist stark vergrößert gezeichnet. Unten: Stahl als Vergleich.', 'The change in length is drawn strongly magnified. Below: steel for comparison.')
          : v.mode === 'gas'
            ? L('Gase dehnen sich viel stärker aus als feste Stoffe – alle etwa gleich.', 'Gases expand much more than solids – all of them by about the same amount.')
            : v.mode === 'wasser'
              ? L('Wasser ist bei 4 °C am schwersten. Darum frieren Seen von oben zu.', 'Water is densest at 4 °C. That is why lakes freeze from the top.')
              : v.mode === 'fluessig'
                ? L(
                    'Drei Thermometer mit gleichem Glas, aber verschiedenen Flüssigkeiten. Welche steigt am stärksten – und was macht Wasser unter 4 °C?',
                    'Three thermometers with the same glass but different liquids. Which rises most – and what does water do below 4 °C?',
                  )
                : v.mode === 'alltag'
                  ? L('Schiebe die Temperatur von Winter bis Hochsommer. Warum braucht man Fugen und Lücken?', 'Slide the temperature from winter to midsummer. Why are joints and gaps needed?')
                  : v.mode === 'thermostat'
                    ? L(
                        'Drücke „Einschalten“: Das Bimetall öffnet den Kontakt, wenn es heiß wird, und schließt ihn beim Abkühlen wieder.',
                        'Press “Switch on”: the bimetal opens the contact when it gets hot and closes it again as it cools.',
                      )
                    : L('Rechne oder ordne zu und gib die Zahl ein. Komma oder Punkt sind beide in Ordnung.', 'Work it out or classify and enter the number. A comma or a point are both fine.'),
  actions: [
    { id: 'go', label: L('Einschalten', 'Switch on'), primary: true, visibleIf: (v) => v.mode === 'thermostat' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'dL', label: L('Längenänderung', 'Change in length'), spoiler: true },
    { key: 'V', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'rho', label: L('Dichte', 'Density'), spoiler: true },
    { key: 'lake', label: L('Im See', 'In the lake') },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'alu', label: L('Aluminium gegen Stahl', 'Aluminium vs steel'), values: { mode: 'fest', mat: 'aluminium', t: 80 } },
    { id: 'bridge', label: L('Stahlbrücke 100 m im Sommer', 'Steel bridge 100 m in summer'), values: { mode: 'fest', mat: 'steel', L0: 100, t: 60 } },
    { id: 'gas', label: L('Gas erwärmen', 'Heat a gas'), values: { mode: 'gas', t: 80 } },
    { id: 'cold', label: L('Gas abkühlen', 'Cool a gas'), values: { mode: 'gas', t: -20 } },
    { id: 'autumn', label: L('See im Herbst', 'Lake in autumn'), values: { mode: 'wasser', luft: 8 } },
    { id: 'winter', label: L('See im Winter', 'Lake in winter'), values: { mode: 'wasser', luft: -6 } },
    { id: 'invar', label: L('Invar: dehnt sich kaum', 'Invar: hardly expands'), values: { mode: 'fest', mat: 'invar', t: 100 } },
    { id: 'cold', label: L('Kälte: Stäbe werden kürzer', 'Cold: rods get shorter'), values: { mode: 'fest', mat: 'aluminium', t: -20 } },
    { id: 'thermo', label: L('Thermometer bei 80 °C', 'Thermometer at 80 °C'), values: { mode: 'fluessig', t: 80 } },
    { id: 'thermo2', label: L('Wasser-Thermometer bei 2 °C', 'Water thermometer at 2 °C'), values: { mode: 'fluessig', t: 2 } },
    { id: 'bridgeW', label: L('Brücke im Winter (−20 °C)', 'Bridge in winter (−20 °C)'), values: { mode: 'alltag', av: 'bruecke', jt: -20 } },
    { id: 'bridgeS', label: L('Brücke im Hochsommer (50 °C)', 'Bridge in midsummer (50 °C)'), values: { mode: 'alltag', av: 'bruecke', jt: 50 } },
    { id: 'rail', label: L('Schienen: Lücke schließt sich', 'Rails: the gap closes'), values: { mode: 'alltag', av: 'schiene', jt: 50 } },
    { id: 'line', label: L('Stromleitung im Sommer', 'Power line in summer'), values: { mode: 'alltag', av: 'leitung', jt: 40 } },
    { id: 'iron', label: L('Bügeleisen: Baumwolle (200 °C)', 'Iron: cotton (200 °C)'), values: { mode: 'thermostat', set: 200, hy: 12 } },
    { id: 'silk', label: L('Bügeleisen: Seide (110 °C)', 'Iron: silk (110 °C)'), values: { mode: 'thermostat', set: 110, hy: 12 } },
    { id: 'ballonStart', label: L('Heißluftballon startet', 'Hot-air balloon takes off'), values: { mode: 'ballon', bvol: 2500, bto: 15, bti: 100, blast: 600 } },
    { id: 'ballonSommer', label: L('Heißer Sommertag: zu wenig Auftrieb', 'Hot summer day: not enough lift'), values: { mode: 'ballon', bvol: 2500, bto: 35, bti: 80, blast: 600 } },
    { id: 'flasche', label: L('Volle Flasche im Gefrierfach', 'Full bottle in the freezer'), values: { mode: 'eis', ifill: 95, isalt: true } },
    { id: 'flascheHalb', label: L('Flasche mit Platz', 'Bottle with room'), values: { mode: 'eis', ifill: 80, isalt: false } },
    { id: 'quiz', label: L('Üben: zehn Aufgabenarten', 'Practice: ten kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasB: 'Ein Heißluftballon über dem Boden; die Luft innen ist wärmer und dünner als außen',
      canvasI: 'Links eine Flasche mit Wasser und daneben dieselbe Flasche mit Eis; rechts ein Eisberg, von dem nur ein kleiner Teil aus dem Wasser ragt',
      bRho: 'Luftdichte draußen {o} kg/m³, im Ballon {i} kg/m³',
      bLift: 'Tragkraft der warmen Luft: {m} kg',
      bNet: 'zu tragen: {m} kg',
      bUp: 'Der Ballon steigt.',
      bDown: 'Der Ballon bleibt am Boden.',
      bInfo: 'Warme Luft dehnt sich aus: Dieselbe Menge braucht mehr Platz, ein Kubikmeter ist leichter. Der Unterschied zur kalten Luft draußen trägt den Ballon.',
      iWater: 'Wasser',
      iFrozen: 'gefroren',
      iBurst: 'Das Eis passt nicht mehr hinein – die Flasche platzt.',
      iOk: 'Das Eis hat noch Platz.',
      iAbove: 'Über Wasser: etwa {p} %',
      iInfo:
        'Beim Gefrieren ordnen sich die Wassermoleküle in einem lockeren Gitter: Eis braucht etwa 9 % mehr Platz und ist leichter als Wasser. Darum schwimmt es – vom Eisberg schaut nur gut ein Zehntel heraus.',
      iVol: 'Eis: {v} % des Flaschenvolumens',
      canvas: 'Wärmeausdehnung: zwei Stäbe und ein Bimetallstreifen, ein Kolben mit Gas oder ein See mit Temperaturschichtung; daneben ein Diagramm',
      dLVal: 'ΔL = α · L₀ · ΔT = {a} · 10⁻⁶ 1/K · {L} m · {dT} K ≈ {d}',
      steelVal: 'Stahl zum Vergleich: {d}',
      Vval: 'V = V₀ · T / T₀ = 1 L · {T} K / 293 K ≈ {V} L',
      rhoVal: 'Wasser bei {t} °C: {r} kg/m³ (am dichtesten bei 4 °C: 999,97 kg/m³; Eis: 917 kg/m³)',
      lakeWarm: 'Oben warmes, leichteres Wasser, unten 4 °C.',
      lakeCool: 'Das Oberflächenwasser kühlt ab, wird schwerer und sinkt, bis überall 4 °C herrschen.',
      lakeCold: 'Unter 4 °C wird das Wasser wieder leichter und bleibt oben.',
      lakeIce: 'Oben bildet sich Eis, es schwimmt. Darunter bleibt am Grund 4 °C warmes Wasser – Fische überleben.',
      steel: 'Stahl',
      bimetal: 'Bimetall',
      tC: 'ϑ in °C',
      Vl: 'V in L',
      rho: 'ρ in kg/m³',
      zero: 'absoluter Nullpunkt −273 °C',
      ice: 'Eis',
      bottom: 'Grund',
      zoomNote: 'Längenänderung {z}-fach vergrößert',
      m_aluminium: 'Aluminium',
      m_copper: 'Kupfer',
      m_steel: 'Stahl',
      m_glass: 'Glas',
      m_invar: 'Invar',
      canvasQuiz: 'Übungsaufgabe zur Wärmeausdehnung mit Rückmeldung',
      liqVal: 'Gleiches Glas, gleiche Kugel: Ethanol {e} mm, Quecksilber {q} mm, Wasser {w} mm über der 20-°C-Marke',
      liqInfo: 'Die Flüssigkeit in der Kugel dehnt sich aus und muss in das dünne Rohr – so wird eine kleine Volumenänderung zu einem langen Weg.',
      liq_ethanol: 'Ethanol',
      liq_mercury: 'Quecksilber',
      liq_water: 'Wasser',
      permil: 'ΔV in ‰',
      gapVal: 'Fuge {g} mm breit (bei 20 °C: {g0} mm); Brücke {L} m lang, {d} mm länger als bei 20 °C',
      railVal: 'Lücke {g} mm (bei 20 °C: {g0} mm), Schiene {L} m',
      railBent: 'Lücke geschlossen – die Schienen drücken gegeneinander und können sich verbiegen.',
      lineVal: 'Durchhang {f} m bei {t} °C (bei 20 °C: {f0} m); Seil {L} m Spannweite',
      gapAx: 'Fuge in mm',
      sagAx: 'Durchhang in m',
      season: 'ϑ in °C',
      tsAx: 't in s',
      TAx: 'ϑ in °C',
      thermoOn: 'Heizung an: Bimetall gerade, Kontakt geschlossen',
      thermoOff: 'Heizung aus: Bimetall gebogen, Kontakt offen',
      thermoVal: 'ϑ ≈ {T} °C (schaltet aus bei {hi} °C, ein bei {lo} °C)',
      thermoInfo: 'Das Bimetall biegt sich bei Hitze zur Seite des Metalls, das sich weniger ausdehnt, und öffnet so den Kontakt.',
      contact: 'Kontakt',
      heater: 'Heizung',
      dial: 'Regler',
      on: 'an',
      off: 'aus',
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
      canvasB: 'A hot-air balloon above the ground; the air inside is warmer and thinner than outside',
      canvasI: 'On the left a bottle of water and next to it the same bottle with ice; on the right an iceberg of which only a small part sticks out of the water',
      bRho: 'air density outside {o} kg/m³, in the balloon {i} kg/m³',
      bLift: 'lift of the warm air: {m} kg',
      bNet: 'to be carried: {m} kg',
      bUp: 'The balloon rises.',
      bDown: 'The balloon stays on the ground.',
      bInfo: 'Warm air expands: the same amount takes up more space, so a cubic metre is lighter. The difference from the cold air outside carries the balloon.',
      iWater: 'water',
      iFrozen: 'frozen',
      iBurst: 'The ice no longer fits – the bottle bursts.',
      iOk: 'The ice still has room.',
      iAbove: 'above water: about {p} %',
      iInfo:
        'When water freezes, the molecules arrange themselves in an open lattice: ice takes up about 9 % more space and is lighter than water. That is why it floats – only just over a tenth of an iceberg sticks out.',
      iVol: 'ice: {v} % of the bottle volume',
      canvas: 'Thermal expansion: two rods and a bimetallic strip, a piston with gas or a lake with temperature layers; next to it a graph',
      dLVal: 'ΔL = α · L₀ · ΔT = {a} · 10⁻⁶ 1/K · {L} m · {dT} K ≈ {d}',
      steelVal: 'steel for comparison: {d}',
      Vval: 'V = V₀ · T / T₀ = 1 L · {T} K / 293 K ≈ {V} L',
      rhoVal: 'water at {t} °C: {r} kg/m³ (densest at 4 °C: 999.97 kg/m³; ice: 917 kg/m³)',
      lakeWarm: 'Warm, lighter water on top, 4 °C at the bottom.',
      lakeCool: 'Surface water cools, gets heavier and sinks until it is 4 °C everywhere.',
      lakeCold: 'Below 4 °C water becomes lighter again and stays on top.',
      lakeIce: 'Ice forms on top and floats. Below it 4 °C water remains at the bottom – fish survive.',
      steel: 'steel',
      bimetal: 'bimetal',
      tC: 'ϑ in °C',
      Vl: 'V in L',
      rho: 'ρ in kg/m³',
      zero: 'absolute zero −273 °C',
      ice: 'ice',
      bottom: 'bottom',
      zoomNote: 'change in length magnified {z} times',
      m_aluminium: 'aluminium',
      m_copper: 'copper',
      m_steel: 'steel',
      m_glass: 'glass',
      m_invar: 'Invar',
      canvasQuiz: 'Practice task on thermal expansion with feedback',
      liqVal: 'Same glass, same bulb: ethanol {e} mm, mercury {q} mm, water {w} mm above the 20 °C mark',
      liqInfo: 'The liquid in the bulb expands and has to go into the thin tube – a small change in volume becomes a long distance.',
      liq_ethanol: 'ethanol',
      liq_mercury: 'mercury',
      liq_water: 'water',
      permil: 'ΔV in ‰',
      gapVal: 'joint {g} mm wide (at 20 °C: {g0} mm); bridge {L} m long, {d} mm longer than at 20 °C',
      railVal: 'gap {g} mm (at 20 °C: {g0} mm), rail {L} m',
      railBent: 'Gap closed – the rails push against each other and can buckle.',
      lineVal: 'sag {f} m at {t} °C (at 20 °C: {f0} m); span {L} m',
      gapAx: 'joint in mm',
      sagAx: 'sag in m',
      season: 'ϑ in °C',
      tsAx: 't in s',
      TAx: 'ϑ in °C',
      thermoOn: 'heating on: bimetal straight, contact closed',
      thermoOff: 'heating off: bimetal bent, contact open',
      thermoVal: 'ϑ ≈ {T} °C (switches off at {hi} °C, on at {lo} °C)',
      thermoInfo: 'When hot, the bimetal bends towards the metal that expands less and so opens the contact.',
      contact: 'contact',
      heater: 'heater',
      dial: 'dial',
      on: 'on',
      off: 'off',
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

    /* Thermostat-Zustand */
    let tt = 0;
    let st = { T: IRON.env, on: true };
    let running = false;
    let hist: [number, number, boolean][] = [];
    const thermoOpts = () => ({ set: p.set, hyst: p.hy, heat: IRON.heat, k: IRON.k, env: IRON.env });
    function resetThermo(): void {
      tt = 0;
      st = { T: IRON.env, on: true };
      hist = [[0, st.T, st.on]];
      running = false;
    }
    resetThermo();

    /* Übung */
    let task: ExpansionTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };

    const LIQS: LiquidId[] = ['ethanol', 'mercury', 'water'];
    /** Steighöhe (mm) über der 20-°C-Marke im Thermometer. */
    const rise = (id: LiquidId, t: number) => {
      if (id === 'water') return ((liquidVolume('water', t) - 1) * BULB) / (Math.PI * CAP_R * CAP_R);
      return capillaryRise(id === 'ethanol' ? GAMMA_LIQ.ethanol : GAMMA_LIQ.mercury, BULB, CAP_R, t - T0);
    };

    const len = (m: number) => (m >= 1 ? `${fmt.num(m, 3)} m` : m >= 0.01 || m <= -0.01 ? `${fmt.num(m * 100, 2)} cm` : `${fmt.num(m * 1000, 2)} mm`);

    function setupPlot(): void {
      if (p.mode === 'fest') {
        plot.setRangePadded([-20, 100], [-1.6, 2.2], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: 'ΔL in mm/m' } });
      } else if (p.mode === 'gas') {
        plot.setRangePadded([-280, 110], [0, 1.4], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: ctx.t('Vl') } });
      } else if (p.mode === 'fluessig') {
        plot.setRangePadded([-20, 100], [-25, 90], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: ctx.t('permil') } });
      } else if (p.mode === 'alltag') {
        if (p.av === 'leitung') {
          plot.setRangePadded([-20, 50], [0, 7], { left: 52, right: 14, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('season') }, y: { label: ctx.t('sagAx') } });
        } else {
          const g0 = p.av === 'bruecke' ? BRIDGE.gap0 : RAIL.gap0;
          const L = p.av === 'bruecke' ? BRIDGE.L : RAIL.L;
          plot.setRangePadded([-20, 50], [0, gapWidth(ALPHA.steel, L, g0, -20) * 1000 * 1.1], { left: 52, right: 14, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('season') }, y: { label: ctx.t('gapAx') } });
        }
      } else if (p.mode === 'thermostat') {
        plot.setRangePadded([0, IRON.dur], [0, 250], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tsAx') }, y: { label: ctx.t('TAx') } });
      } else {
        plot.setRangePadded([0, 20], [998, 1000.2], { left: 62, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: ctx.t('rho') } });
      }
    }

    /** Temperaturprofil im See von oben (0) nach unten (1). */
    function lakeProfile(z: number): number {
      const a = p.luft;
      if (a >= 4) return 4 + (a - 4) * Math.max(0, 1 - z / 0.35);
      if (a > 0) return 4 - (4 - a) * Math.max(0, 1 - z / 0.25);
      // unter Eis: 0 °C an der Eisunterseite, 4 °C am Grund
      return Math.min(4, 4 * z ** 0.5);
    }

    function updateReadouts(): void {
      for (const k of ['dL', 'V', 'rho', 'lake', 'info']) ctx.readout(k, null);
      if (p.mode === 'ballon') {
        ctx.readout('rho', tr('bRho', { o: fmt.num(airDensity(p.bto), 3), i: fmt.num(airDensity(p.bti), 3) }));
        ctx.readout('V', `${tr('bLift', { m: fmt.num(balloonLift(p.bvol, p.bto, p.bti), 0) })}, ${tr('bNet', { m: fmt.num(p.blast, 0) })}`);
        ctx.readout('info', ctx.t('bInfo'));
        return;
      }
      if (p.mode === 'eis') {
        ctx.readout('V', tr('iVol', { v: fmt.num((p.ifill / 100) * ICE_EXPANSION * 100, 0) }));
        ctx.readout('rho', tr('iAbove', { p: fmt.num((1 - submergedFraction(p.isalt ? SEA_DENSITY : 1000)) * 100, 0) }));
        ctx.readout('info', ctx.t('iInfo'));
        return;
      }
      if (p.mode === 'fluessig') {
        ctx.readout('V', tr('liqVal', { e: fmt.num(rise('ethanol', p.t), 0), q: fmt.num(rise('mercury', p.t), 0), w: fmt.num(rise('water', p.t), 0) }));
        ctx.readout('info', ctx.t('liqInfo'));
        return;
      }
      if (p.mode === 'alltag') {
        if (p.av === 'leitung') {
          ctx.readout('dL', tr('lineVal', { f: fmt.num(cableSag(LINE.span, LINE.f0, ALPHA.aluminium, p.jt), 2), t: fmt.num(p.jt, 0), f0: fmt.num(LINE.f0, 0), L: LINE.span }));
        } else if (p.av === 'bruecke') {
          const g = gapWidth(ALPHA.steel, BRIDGE.L, BRIDGE.gap0, p.jt);
          ctx.readout('dL', tr('gapVal', { g: fmt.num(g * 1000, 1), g0: fmt.num(BRIDGE.gap0 * 1000, 0), L: BRIDGE.L, d: fmt.num(lengthChange(ALPHA.steel, BRIDGE.L, p.jt - T0) * 1000, 1) }));
        } else {
          const g = gapWidth(ALPHA.steel, RAIL.L, RAIL.gap0, p.jt);
          ctx.readout('dL', g > 0 ? tr('railVal', { g: fmt.num(g * 1000, 1), g0: fmt.num(RAIL.gap0 * 1000, 0), L: RAIL.L }) : ctx.t('railBent'));
        }
        return;
      }
      if (p.mode === 'thermostat') {
        ctx.readout('V', tr('thermoVal', { T: fmt.num(st.T, 0), hi: fmt.num(p.set + p.hy / 2, 0), lo: fmt.num(p.set - p.hy / 2, 0) }));
        ctx.readout('lake', ctx.t(st.on ? 'thermoOn' : 'thermoOff'));
        ctx.readout('info', ctx.t('thermoInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'fest') {
        const a = ALPHA[p.mat as SolidId];
        const d = lengthChange(a, p.L0, p.t - T0);
        ctx.readout(
          'dL',
          `${tr('dLVal', { a: fmt.num(a * 1e6, 1), L: fmt.num(p.L0, 0), dT: fmt.num(p.t - T0, 0), d: len(d) })}; ${tr('steelVal', { d: len(lengthChange(ALPHA.steel, p.L0, p.t - T0)) })}`,
        );
      } else if (p.mode === 'gas') {
        ctx.readout('V', tr('Vval', { T: fmt.num(p.t + 273.15, 0), V: fmt.num(gasVolume(1, T0, p.t), 3) }));
      } else {
        const tt = Math.max(0, p.luft);
        ctx.readout('rho', tr('rhoVal', { t: fmt.num(tt, 0), r: fmt.num(waterDensity(tt), 2) }));
        ctx.readout('lake', ctx.t(p.luft >= 4 ? (p.luft > 6 ? 'lakeWarm' : 'lakeCool') : p.luft > 0 ? 'lakeCold' : 'lakeIce'));
      }
    }

    function tempColor(t: number, lo: number, hi: number): string {
      const th = ctx.theme;
      const k = Math.max(0, Math.min(1, (t - lo) / (hi - lo)));
      return k > 0.5 ? withAlpha(th.series[1]!, 0.25 + 0.7 * (k - 0.5) * 2) : withAlpha(th.series[0]!, 0.25 + 0.7 * (0.5 - k) * 2);
    }

    function drawSolids(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const x0 = r.x + 30;
      const base = r.w * 0.6;
      const dT = p.t - T0;
      const rods: [string, number][] = [
        [ctx.t(`m_${p.mat}`), ALPHA[p.mat as SolidId]],
        [ctx.t('steel'), ALPHA.steel],
      ];
      const yTop = r.y + r.h * 0.18;
      rods.forEach(([name, a], k) => {
        const y = yTop + k * 54;
        const ext = a * dT * ZOOM * base;
        g.fillStyle = tempColor(p.t, -20, 100);
        g.fillRect(x0, y, base + ext, 22);
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        g.strokeRect(x0, y, base + ext, 22);
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(x0 + base, y - 6);
        g.lineTo(x0 + base, y + 28);
        g.stroke();
        g.setLineDash([]);
        text(g, name, x0 + 8, y + 11, { font: `700 12px ${th.font}`, color: th.text, align: 'left' });
      });
      // Wand links
      g.fillStyle = th.muted;
      g.fillRect(x0 - 10, yTop - 10, 10, 54 + 42);
      text(g, tr('zoomNote', { z: ZOOM }), x0, yTop - 22, { font: `${narrow ? 10 : 11}px ${th.font}`, color: th.muted, align: 'left' });
      // Bimetall: oben das gewählte Material, unten Stahl
      const da = (ALPHA[p.mat as SolidId] - ALPHA.steel) * dT;
      const bx = x0;
      const by = r.y + r.h * 0.72;
      const bl = base * 0.9;
      // Krümmung (übertrieben): positiver Wert biegt nach unten (oben dehnt sich mehr)
      const curv = Math.max(-1, Math.min(1, da * 4000));
      const pts = (off: number): [number, number][] => {
        const a: [number, number][] = [];
        for (let i = 0; i <= 40; i++) {
          const s = i / 40;
          a.push([bx + bl * s, by + off + curv * 70 * s * s]);
        }
        return a;
      };
      g.lineWidth = 8;
      g.lineCap = 'butt';
      for (const [off, col] of [
        [-4, th.series[3]!],
        [4, th.muted],
      ] as const) {
        g.strokeStyle = col;
        g.beginPath();
        pts(off).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
      }
      g.fillStyle = th.muted;
      g.fillRect(bx - 10, by - 16, 10, 32);
      text(g, `${ctx.t('bimetal')}: ${ctx.t(`m_${p.mat}`)} / ${ctx.t('steel')}`, bx, by - 28, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.text, align: 'left' });
    }

    function drawGas(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cw = Math.min(r.w * 0.36, 150);
      const cx = r.x + r.w / 2;
      const bottom = r.y + r.h - 30;
      const maxH = r.h - 90;
      const V = gasVolume(1, T0, p.t);
      const h = (maxH * V) / 1.4;
      g.fillStyle = tempColor(p.t, -20, 100);
      g.fillRect(cx - cw / 2, bottom - h, cw, h);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx - cw / 2, bottom - maxH);
      g.lineTo(cx - cw / 2, bottom);
      g.lineTo(cx + cw / 2, bottom);
      g.lineTo(cx + cw / 2, bottom - maxH);
      g.stroke();
      g.fillStyle = th.muted;
      g.fillRect(cx - cw / 2 + 2, bottom - h - 12, cw - 4, 12);
      g.fillRect(cx - 4, bottom - h - 50, 8, 38);
      // Markierung bei 20 °C
      const h0 = maxH / 1.4;
      g.setLineDash([5, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - cw / 2 - 12, bottom - h0);
      g.lineTo(cx + cw / 2 + 12, bottom - h0);
      g.stroke();
      g.setLineDash([]);
      text(g, '20 °C', cx + cw / 2 + 16, bottom - h0, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      text(g, `${fmt.num(V, 2)} L`, cx, bottom - h / 2, { font: `700 14px ${th.font}`, color: th.text });
    }

    function drawLake(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + 20;
      const w = r.w - 40;
      const top = r.y + 50;
      const bot = r.y + r.h - 24;
      const ice = p.luft < 0 ? Math.min(30, 6 + -p.luft * 3) : 0;
      // Wasser in Streifen nach Temperatur
      const n = 40;
      for (let i = 0; i < n; i++) {
        const z = i / n;
        const y = top + ice + (bot - top - ice) * z;
        g.fillStyle = tempColor(lakeProfile(z), 0, 12);
        g.fillRect(x0, y, w, (bot - top - ice) / n + 1);
      }
      if (ice > 0) {
        g.fillStyle = withAlpha(th.bg, 0.92);
        g.fillRect(x0, top, w, ice);
        text(g, `${ctx.t('ice')} 0 °C`, x0 + w / 2, top + ice / 2, { font: `700 12px ${th.font}`, color: th.text });
      }
      // Luft
      text(g, `${fmt.num(p.luft, 0)} °C`, x0 + w / 2, top - 22, { font: `700 14px ${th.font}`, color: th.text });
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.strokeRect(x0, top, w, bot - top);
      // Temperaturen am Rand
      for (const z of [0.1, 0.5, 0.9]) {
        const y = top + ice + (bot - top - ice) * z;
        text(g, `${fmt.num(lakeProfile(z), 1)} °C`, x0 + 8, y, { font: `600 12px ${th.font}`, color: th.text, align: 'left' });
      }
      text(g, ctx.t('bottom'), x0 + w - 8, bot - 10, { font: `600 11px ${th.font}`, color: th.muted, align: 'right' });
    }

    /* ---------- Flüssigkeiten ---------- */
    function drawLiquids(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const cols: Record<LiquidId, string> = { ethanol: th.series[1]!, mercury: th.muted, water: th.series[0]! };
      const top = r.y + 30;
      const bulbY = r.y + r.h - 46;
      const mark = bulbY - (bulbY - top) * 0.32;
      const pxPerMm = ((bulbY - top) * 0.62) / rise('ethanol', 100);
      LIQS.forEach((id, i) => {
        const cx = r.x + (r.w * (i + 0.5)) / 3;
        // Rohr und Kugel
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.strokeRect(cx - 5, top, 10, bulbY - top - 10);
        g.beginPath();
        g.arc(cx, bulbY, 14, 0, Math.PI * 2);
        g.fillStyle = withAlpha(cols[id], 0.85);
        g.fill();
        g.stroke();
        const hy = Math.max(top + 2, Math.min(bulbY - 12, mark - rise(id, p.t) * pxPerMm));
        g.fillStyle = withAlpha(cols[id], 0.85);
        g.fillRect(cx - 3, hy, 6, bulbY - 12 - hy);
        // 20-°C-Marke
        g.strokeStyle = th.muted;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.moveTo(cx - 16, mark);
        g.lineTo(cx + 16, mark);
        g.stroke();
        g.setLineDash([]);
        text(g, ctx.t(`liq_${id}`), cx, bulbY + 26, { font: `700 ${narrow ? 11 : 12}px ${th.font}`, color: th.text });
        text(g, `${fmt.num(rise(id, p.t), 0)} mm`, cx + 12, hy, { font: `600 11px ${th.font}`, color: cols[id] === th.muted ? th.text : cols[id], align: 'left' });
      });
      text(g, `${fmt.num(p.t, 0)} °C`, r.x + r.w / 2, r.y + 14, { font: `700 13px ${th.font}`, color: th.text });
      text(g, '20 °C', r.x + 6, mark - 8, { font: `500 10px ${th.font}`, color: th.muted, align: 'left' });
    }

    /* ---------- Alltag ---------- */
    function drawAlltag(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const warm = tempColor(p.jt, -20, 50);
      text(g, `${fmt.num(p.jt, 0)} °C`, r.x + r.w - 14, r.y + 18, { font: `800 15px ${th.font}`, color: p.jt >= 20 ? th.series[1]! : th.series[0]!, align: 'right' });
      if (p.av === 'leitung') {
        const y0 = r.y + r.h * 0.22;
        const xa = r.x + 30;
        const xb = r.x + r.w - 30;
        const f = cableSag(LINE.span, LINE.f0, ALPHA.aluminium, p.jt);
        const ppm = (r.h * 0.55) / 7;
        for (const x of [xa, xb]) {
          g.strokeStyle = th.text;
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(x, r.y + r.h - 16);
          g.lineTo(x, y0 - 10);
          g.moveTo(x - 14, y0);
          g.lineTo(x + 14, y0);
          g.stroke();
        }
        // Seil bei 20 °C blass, aktuell kräftig
        const cable = (ff: number, col: string, w: number) => {
          g.strokeStyle = col;
          g.lineWidth = w;
          g.beginPath();
          for (let k = 0; k <= 40; k++) {
            const u = k / 40;
            const x = xa + (xb - xa) * u;
            const y = y0 + 4 * ff * ppm * u * (1 - u);
            if (k) g.lineTo(x, y);
            else g.moveTo(x, y);
          }
          g.stroke();
        };
        cable(LINE.f0, withAlpha(th.muted, 0.6), 1.5);
        cable(f, th.series[3]!, 3);
        text(g, `f = ${fmt.num(f, 2)} m`, (xa + xb) / 2, y0 + f * ppm + 18, { font: `700 13px ${th.font}`, color: th.series[3]! });
        g.strokeStyle = withAlpha(th.muted, 0.6);
        g.beginPath();
        g.moveTo(r.x + 10, r.y + r.h - 16);
        g.lineTo(r.x + r.w - 10, r.y + r.h - 16);
        g.stroke();
        return;
      }
      const isBridge = p.av === 'bruecke';
      const L = isBridge ? BRIDGE.L : RAIL.L;
      const g0 = isBridge ? BRIDGE.gap0 : RAIL.gap0;
      const gap = gapWidth(ALPHA.steel, L, g0, p.jt);
      // Übersicht oben: Bauteil, rechts die Fuge
      const y = r.y + r.h * 0.2;
      const x0 = r.x + 20;
      const xEnd = r.x + r.w * 0.7;
      g.fillStyle = warm;
      g.fillRect(x0, y, xEnd - x0, isBridge ? 18 : 10);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(x0, y, xEnd - x0, isBridge ? 18 : 10);
      g.fillStyle = th.muted;
      g.fillRect(xEnd + 10, y - 4, r.x + r.w - 20 - xEnd - 10, isBridge ? 26 : 18);
      text(g, isBridge ? `${L} m` : `${L} m`, (x0 + xEnd) / 2, y - 12, { font: `600 12px ${th.font}`, color: th.muted });
      if (isBridge) {
        g.fillStyle = withAlpha(th.text, 0.25);
        for (const px of [x0 + 30, (x0 + xEnd) / 2, xEnd - 30]) g.fillRect(px - 5, y + 18, 10, r.h * 0.18);
      }
      // Lupe auf die Fuge: 1 mm = k px
      const zy = r.y + r.h * 0.52;
      const zh = r.h * 0.34;
      const zx = r.x + r.w / 2;
      const kpx = Math.min(narrow ? 2.4 : 3, (r.w * 0.36) / (gapWidth(ALPHA.steel, L, g0, -20) * 1000));
      const gpx = gap * 1000 * kpx;
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(xEnd + 4, y + 20);
      g.lineTo(zx, zy - 6);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = warm;
      g.fillRect(r.x + 20, zy, zx - gpx / 2 - r.x - 20, zh);
      g.fillStyle = th.muted;
      g.fillRect(zx + gpx / 2, zy, r.x + r.w - 20 - zx - gpx / 2, zh);
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(r.x + 20, zy, r.w - 40, zh);
      text(g, gap > 0 ? `${fmt.num(gap * 1000, 1)} mm` : ctx.t('railBent'), zx, zy + zh + 18, { font: `700 13px ${th.font}`, color: gap > 0 ? th.text : th.series[3]!, align: 'center' });
    }

    /* ---------- Thermostat ---------- */
    function drawThermostat(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      // Bügeleisen (Seitenansicht)
      const ix = r.x + r.w * 0.08;
      const iw = r.w * 0.6;
      const iy = r.y + r.h * 0.62;
      g.beginPath();
      g.moveTo(ix, iy);
      g.lineTo(ix + iw, iy);
      g.quadraticCurveTo(ix + iw * 1.05, iy - r.h * 0.18, ix + iw * 0.55, iy - r.h * 0.2);
      g.lineTo(ix + iw * 0.1, iy - r.h * 0.2);
      g.closePath();
      g.fillStyle = withAlpha(th.series[0]!, 0.2);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      // Sohle nach Temperatur
      g.fillStyle = tempColor(st.T, 20, 220);
      g.fillRect(ix, iy, iw, 10);
      g.strokeRect(ix, iy, iw, 10);
      // Griff
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(ix + iw * 0.15, iy - r.h * 0.2);
      g.quadraticCurveTo(ix + iw * 0.4, iy - r.h * 0.42, ix + iw * 0.65, iy - r.h * 0.2);
      g.stroke();
      // Bimetall im Inneren: biegt sich mit der Temperatur, öffnet den Kontakt
      const bx = ix + iw * 0.2;
      const by = iy - r.h * 0.08;
      const bl = iw * 0.4;
      const bend = Math.max(0, Math.min(1, (st.T - IRON.env) / (p.set - IRON.env + p.hy)));
      for (const [off, col] of [
        [-3, th.series[3]!],
        [3, th.muted],
      ] as const) {
        g.strokeStyle = col;
        g.lineWidth = 5;
        g.beginPath();
        for (let k = 0; k <= 20; k++) {
          const u = k / 20;
          const x = bx + bl * u;
          const y = by + off - bend * 22 * u * u;
          if (k) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
      }
      // Kontakt am Ende
      const tipY = by - bend * 22;
      g.fillStyle = st.on ? th.series[2]! : th.series[3]!;
      g.beginPath();
      g.arc(bx + bl + 6, st.on ? by : tipY, 4, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = th.text;
      g.fillRect(bx + bl + 2, by + 4, 8, 6);
      text(g, ctx.t('contact'), bx + bl + 16, by + 10, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      // Anzeige
      const lx = r.x + r.w * (narrow ? 0.8 : 0.82);
      g.beginPath();
      g.arc(lx, r.y + r.h * 0.2, 14, 0, Math.PI * 2);
      g.fillStyle = st.on ? th.series[1]! : withAlpha(th.muted, 0.3);
      g.fill();
      text(g, `${ctx.t('heater')}: ${ctx.t(st.on ? 'on' : 'off')}`, lx, r.y + r.h * 0.2 + 28, { font: `700 12px ${th.font}`, color: th.text });
      text(g, `${fmt.num(st.T, 0)} °C`, lx, r.y + r.h * 0.2 + 50, { font: `800 18px ${th.font}`, color: th.text });
      text(g, `${ctx.t('dial')}: ${fmt.num(p.set, 0)} °C`, lx, r.y + r.h * 0.2 + 72, { font: `600 11px ${th.font}`, color: th.muted });
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

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'fest') {
        const a = ALPHA[p.mat as SolidId];
        plot.fn((t) => a * (t - T0) * 1000, { color: th.series[3]!, width: 3, from: -20, to: 100 });
        plot.fn((t) => ALPHA.steel * (t - T0) * 1000, { color: th.muted, width: 2, from: -20, to: 100 });
        plot.point(p.t, a * (p.t - T0) * 1000, { color: th.series[3]!, radius: 6 });
      } else if (p.mode === 'fluessig') {
        const cols: Record<LiquidId, string> = { ethanol: th.series[1]!, mercury: th.muted, water: th.series[0]! };
        for (const id of LIQS) plot.fn((t) => (liquidVolume(id, t) - 1) * 1000, { color: cols[id], width: 3, from: id === 'water' ? 0 : -20, to: 100 });
        for (const id of LIQS) if (id !== 'water' || p.t >= 0) plot.point(p.t, (liquidVolume(id, p.t) - 1) * 1000, { color: cols[id], radius: 5 });
        plot.text(95, (liquidVolume('ethanol', 95) - 1) * 1000, ctx.t('liq_ethanol'), { color: cols.ethanol, size: 11, align: 'right', offset: [0, -10] });
        plot.text(95, (liquidVolume('water', 95) - 1) * 1000, ctx.t('liq_water'), { color: cols.water, size: 11, align: 'right', offset: [0, -10] });
        plot.text(95, (liquidVolume('mercury', 95) - 1) * 1000, ctx.t('liq_mercury'), { color: th.text, size: 11, align: 'right', offset: [0, 12] });
      } else if (p.mode === 'alltag') {
        if (p.av === 'leitung') {
          plot.fn((t) => cableSag(LINE.span, LINE.f0, ALPHA.aluminium, t), { color: th.series[3]!, width: 3, from: -20, to: 50 });
          plot.point(p.jt, cableSag(LINE.span, LINE.f0, ALPHA.aluminium, p.jt), { color: th.series[3]!, radius: 6 });
        } else {
          const L = p.av === 'bruecke' ? BRIDGE.L : RAIL.L;
          const g0 = p.av === 'bruecke' ? BRIDGE.gap0 : RAIL.gap0;
          plot.fn((t) => gapWidth(ALPHA.steel, L, g0, t) * 1000, { color: th.series[3]!, width: 3, from: -20, to: 50 });
          plot.point(p.jt, gapWidth(ALPHA.steel, L, g0, p.jt) * 1000, { color: th.series[3]!, radius: 6 });
        }
      } else if (p.mode === 'thermostat') {
        plot.hline(p.set, { color: withAlpha(th.muted, 0.6), dash: [6, 5], width: 1.5 });
        // Heizphasen hinterlegen
        let start: number | null = null;
        for (const [t, , on] of hist) {
          if (on && start === null) start = t;
          if (!on && start !== null) {
            plot.polygon(
              [
                [start, 0],
                [t, 0],
                [t, 250],
                [start, 250],
              ],
              { fill: withAlpha(th.series[1]!, 0.08) },
            );
            start = null;
          }
        }
        if (start !== null)
          plot.polygon(
            [
              [start, 0],
              [tt, 0],
              [tt, 250],
              [start, 250],
            ],
            { fill: withAlpha(th.series[1]!, 0.08) },
          );
        plot.polyline(
          hist.map(([t, T]) => [t, T] as [number, number]),
          { color: th.series[1]!, width: 3 },
        );
      } else if (p.mode === 'gas') {
        plot.fn((t) => gasVolume(1, T0, t), { color: withAlpha(th.series[1]!, 0.5), width: 2, dash: [6, 5], from: -273.15, to: -20 });
        plot.fn((t) => gasVolume(1, T0, t), { color: th.series[1]!, width: 3, from: -20, to: 100 });
        plot.point(-273.15, 0, { color: th.text, radius: 5 });
        plot.text(-273.15, 0.06, ctx.t('zero'), { color: th.muted, size: 11, offset: [4, -6] });
        plot.point(p.t, gasVolume(1, T0, p.t), { color: th.series[1]!, radius: 6 });
      } else {
        plot.fn((t) => waterDensity(t), { color: th.series[0]!, width: 3, from: 0, to: 20 });
        plot.vline(3.98, { color: withAlpha(th.muted, 0.7), width: 1.5, dash: [5, 4] });
        plot.text(3.98, 1000.05, '4 °C', { color: th.muted, size: 12, offset: [4, -4] });
        const tt = Math.max(0, p.luft);
        plot.point(tt, waterDensity(tt), { color: th.series[0]!, radius: 6 });
      }
      plot.end();
    }

    /* ---------- Heißluftballon ---------- */
    let animT = 0;
    function drawBalloon(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const wide = r.w >= 700;
      const lift = balloonLift(p.bvol, p.bto, p.bti);
      const scene: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.58, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h * 0.6 };
      const ground = scene.y + scene.h - 20;
      // Steigt der Ballon? Netto-Last: Auftrieb minus Hülle, Korb und Personen
      const net = lift - p.blast;
      const rise = net > 0 ? Math.min(1, animT * (0.1 + Math.min(net, 400) / 1000)) : 0;
      const bh = Math.min(scene.h * 0.45, 170);
      const bw = bh * 0.8;
      const cx = scene.x + scene.w / 2;
      const by = ground - 30 - bh / 2 - rise * Math.max(0, Math.min(scene.h * 0.35, ground - 30 - bh - (scene.y + 56)));
      g.fillStyle = withAlpha(th.series[2]!, 0.2);
      g.fillRect(scene.x, ground, scene.w, 20);
      // Hülle: Farbe nach Innentemperatur
      const hot = Math.min(1, Math.max(0, (p.bti - 20) / 100));
      g.beginPath();
      g.ellipse(cx, by, bw / 2, bh / 2, 0, 0, Math.PI * 2);
      g.fillStyle = withAlpha(th.series[3]!, 0.25 + 0.5 * hot);
      g.fill();
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 2;
      g.stroke();
      // Seile und Korb
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx - bw * 0.3, by + bh * 0.4);
      g.lineTo(cx - 14, by + bh / 2 + 26);
      g.moveTo(cx + bw * 0.3, by + bh * 0.4);
      g.lineTo(cx + 14, by + bh / 2 + 26);
      g.stroke();
      g.fillStyle = withAlpha(th.text, 0.7);
      g.fillRect(cx - 16, by + bh / 2 + 26, 32, 18);
      // Flamme
      if (p.bti > p.bto) {
        const fl = 8 + 4 * Math.sin(animT * 12);
        g.beginPath();
        g.moveTo(cx - 5, by + bh / 2 + 22);
        g.lineTo(cx, by + bh / 2 + 22 - fl);
        g.lineTo(cx + 5, by + bh / 2 + 22);
        g.closePath();
        g.fillStyle = th.series[3]!;
        g.fill();
      }
      // Luftteilchen innen (weniger) und außen (mehr)
      const nIn = Math.round((26 * airDensity(p.bti)) / 1.3);
      for (let k = 0; k < nIn; k++) {
        const a = k * 2.399;
        const rr = Math.sqrt((k + 0.5) / nIn) * 0.85;
        g.beginPath();
        g.arc(cx + Math.cos(a) * rr * bw * 0.45, by + Math.sin(a) * rr * bh * 0.45, 2, 0, Math.PI * 2);
        g.fillStyle = withAlpha(th.text, 0.6);
        g.fill();
      }
      text(g, `${fmt.num(p.bti, 0)} °C`, cx, by - bh / 2 - 12, { font: `700 13px ${th.font}`, color: th.series[3]! });
      text(g, ctx.t(net > 0 ? 'bUp' : 'bDown'), scene.x + 14, scene.y + 20, { font: `800 15px ${th.font}`, color: net > 0 ? th.series[2]! : th.muted, align: 'left' });
      // Werte
      const panel: Rect = wide ? { x: scene.w + 20, y: 40, w: r.w - scene.w - 40, h: r.h - 80 } : { x: 16, y: scene.h + 16, w: r.w - 32, h: r.h - scene.h - 20 };
      let y = panel.y;
      const line = (str: string, col: string, weight = 600) => {
        g.font = `${weight} 13px ${th.font}`;
        for (const part of wrap(g, str, panel.w)) {
          text(g, part, panel.x, y, { font: `${weight} 13px ${th.font}`, color: col, align: 'left' });
          y += 18;
        }
        y += 3;
      };
      line(tr('bRho', { o: fmt.num(airDensity(p.bto), 3), i: fmt.num(airDensity(p.bti), 3) }), th.text);
      line(tr('bLift', { m: fmt.num(lift, 0) }), th.series[2]!, 700);
      line(tr('bNet', { m: fmt.num(p.blast, 0) }), th.muted, 500);
    }

    /* ---------- Eis ---------- */
    function drawIce(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const wide = r.w >= 700;
      const half: Rect = wide ? { x: r.x, y: r.y, w: r.w / 2, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h / 2 };
      // Flasche: Füllstand Wasser, daneben nach dem Gefrieren
      const bw = Math.min(70, half.w * 0.18);
      const bh = Math.min(half.h * 0.55, 200);
      const by = half.y + Math.max(64, half.h * 0.25);
      const fill = p.ifill / 100;
      const iceV = fill * ICE_EXPANSION;
      const burst = iceV > 1;
      const bottle = (x: number, level: number, col: string, broken: boolean) => {
        g.fillStyle = withAlpha(col, 0.45);
        const lv = Math.min(1, level);
        g.fillRect(x, by + bh * (1 - lv), bw, bh * lv);
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x + bw * 0.35, by - 24);
        g.lineTo(x + bw * 0.35, by);
        g.lineTo(x, by + 10);
        g.lineTo(x, by + bh);
        g.lineTo(x + bw, by + bh);
        g.lineTo(x + bw, by + 10);
        g.lineTo(x + bw * 0.65, by);
        g.lineTo(x + bw * 0.65, by - 24);
        g.stroke();
        if (broken) {
          g.strokeStyle = th.series[3]!;
          g.lineWidth = 2.5;
          g.beginPath();
          g.moveTo(x + bw * 0.2, by + bh * 0.2);
          g.lineTo(x + bw * 0.5, by + bh * 0.45);
          g.lineTo(x + bw * 0.3, by + bh * 0.6);
          g.lineTo(x + bw * 0.7, by + bh * 0.85);
          g.stroke();
        }
      };
      const x1 = half.x + half.w * 0.22;
      const x2 = half.x + half.w * 0.62;
      bottle(x1, fill, th.series[0]!, false);
      bottle(x2, iceV, th.muted, burst);
      text(g, ctx.t('iWater'), x1 + bw / 2, by + bh + 18, { font: `600 12px ${th.font}`, color: th.text });
      text(g, ctx.t('iFrozen'), x2 + bw / 2, by + bh + 18, { font: `600 12px ${th.font}`, color: th.text });
      text(g, ctx.t(burst ? 'iBurst' : 'iOk'), half.x + half.w / 2, half.y + 22, { font: `800 14px ${th.font}`, color: burst ? th.series[3]! : th.series[2]! });
      // Eisberg
      const sea: Rect = wide ? { x: r.x + r.w / 2, y: r.y, w: r.w / 2, h: r.h } : { x: r.x, y: r.y + r.h / 2, w: r.w, h: r.h / 2 };
      const sub = submergedFraction(p.isalt ? SEA_DENSITY : 1000);
      const wl = sea.y + sea.h * 0.4;
      g.fillStyle = withAlpha(th.series[0]!, 0.25);
      g.fillRect(sea.x + 10, wl, sea.w - 20, sea.y + sea.h - wl - 10);
      const ih = Math.min(sea.h * 0.5, 160);
      const iw = ih * 0.9;
      const icx = sea.x + sea.w / 2;
      const bob = Math.sin(animT * 1.5) * 2;
      const top = wl - ih * (1 - sub) + bob;
      g.beginPath();
      g.moveTo(icx - iw * 0.15, top);
      g.lineTo(icx + iw * 0.2, top + ih * 0.06);
      g.lineTo(icx + iw * 0.5, top + ih * 0.55);
      g.lineTo(icx + iw * 0.3, top + ih);
      g.lineTo(icx - iw * 0.35, top + ih);
      g.lineTo(icx - iw * 0.5, top + ih * 0.5);
      g.closePath();
      g.fillStyle = withAlpha(th.muted, 0.55);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.stroke();
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(sea.x + 10, wl);
      g.lineTo(sea.x + sea.w - 10, wl);
      g.stroke();
      text(g, tr('iAbove', { p: fmt.num((1 - sub) * 100, 0) }), sea.x + sea.w / 2, sea.y + 22, { font: `800 14px ${th.font}`, color: th.text });
    }

    return {
      update(changed, source) {
        if (source === 'init' || ['mode', 'av'].some((k) => changed.has(k))) setupPlot();
        if (source === 'init' || source === 'replace' || ['mode', 'set', 'hy'].some((k) => changed.has(k))) {
          resetThermo();
          ctx.clock.pause();
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
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'ueben' ? 'canvasQuiz' : p.mode === 'ballon' ? 'canvasB' : p.mode === 'eis' ? 'canvasI' : 'canvas'));
        if (changed.has('mode') || changed.has('bti') || changed.has('blast') || changed.has('bto') || changed.has('bvol')) animT = 0;
        if (p.mode === 'ballon' || p.mode === 'eis') {
          if (prefersReducedMotion()) animT = 100;
          else ctx.clock.play();
        }
        updateReadouts();
      },
      action(id) {
        if (id === 'go') {
          resetThermo();
          running = true;
          if (prefersReducedMotion()) {
            while (tt < IRON.dur) {
              st = thermostatStep(st, 0.05, thermoOpts());
              tt += 0.05;
              hist.push([tt, st.T, st.on]);
            }
            running = false;
          } else ctx.clock.play();
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        animT += Math.min(dt, 0.05);
        if (p.mode === 'ballon' || p.mode === 'eis') {
          // Der Ballon braucht die Uhr nur, bis er oben ist
          if (p.mode === 'ballon' && animT > 12) ctx.clock.pause();
          return;
        }
        if (p.mode !== 'thermostat' || !running) {
          ctx.clock.pause();
          return;
        }
        const steps = 10;
        const h = (Math.min(dt, 0.05) * IRON.speed) / steps;
        for (let k = 0; k < steps; k++) {
          st = thermostatStep(st, h, thermoOpts());
          tt += h;
        }
        hist.push([tt, st.T, st.on]);
        if (tt >= IRON.dur) running = false;
        updateReadouts();
      },
      resetTime() {
        resetThermo();
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
        if (p.mode === 'ballon') return drawBalloon({ x: 0, y: 0, w: surface.width, h: surface.height });
        if (p.mode === 'eis') return drawIce({ x: 0, y: 0, w: surface.width, h: surface.height });
        if (p.mode === 'fluessig') drawLiquids(s.scene);
        else if (p.mode === 'alltag') drawAlltag(s.scene);
        else if (p.mode === 'thermostat') drawThermostat(s.scene);
        else if (p.mode === 'fest') drawSolids(s.scene);
        else if (p.mode === 'gas') drawGas(s.scene);
        else drawLake(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
