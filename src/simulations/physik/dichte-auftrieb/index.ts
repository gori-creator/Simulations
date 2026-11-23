import {
  clamp,
  defineSimulation,
  drawCard,
  ease,
  FixedStepper,
  measureSubText,
  mixColor,
  Plot,
  prefersReducedMotion,
  roundRect,
  seededRandom,
  shade,
  subText,
  Surface,
  text,
  textOn,
  Tween,
  withAlpha,
  type Rect,
} from '../../../sim-core';
import {
  airDensity,
  balloonEquipment,
  balloonForces,
  box,
  buoyancy,
  cm3,
  cube,
  cylinderReading,
  displacedInCylinder,
  equilibriumAltitude,
  equilibriumDepth,
  floatState,
  G,
  hoverFill,
  identify,
  KELVIN,
  liftOffTemperature,
  LIQUID_DENSITY,
  LIQUIDS,
  M_AIR,
  MATERIAL_DENSITY,
  MATERIALS,
  meterRange,
  P0,
  pressureAt,
  R_GAS,
  scaleHeight,
  SHIP,
  shipInflow,
  SHIP_INNER,
  shipState,
  sloshOmega,
  steelVolume,
  stepBalloon,
  stepBody,
  stepOverflow,
  SUB,
  subMass,
  subShape,
  tankLevel,
  toSI,
  weight,
  type BalloonMotion,
  type FloatState,
  type LiquidId,
  type MaterialId,
  type Motion,
  type Overflow,
  type Shape,
  type TankBody,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
type Mode = 'float' | 'arch' | 'rho' | 'ball';
type Obj = 'block' | 'ship' | 'sub';
type Probe = 'mat' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
type Pos = 'table' | 'scale' | 'cyl';
type Pt = [number, number];

/** Becken im Versuch „Schwimmen, Schweben, Sinken“ (m): Breite, Tiefe (in den Bildschirm), Höhe, Füllhöhe ohne Körper. */
const TANK = { W: 0.3, D: 0.12, H: 0.25, h0: 0.15 };
/** Überlaufgefäß (m): Innenradius, Höhe, Höhe des Ausgusses; es steht auf einem 10 cm hohen Klotz. */
const VESSEL = { R: 0.075, H: 0.2, spout: 0.15, block: 0.1 };
const VESSEL_AREA = Math.PI * VESSEL.R * VESSEL.R;
/** Auffangbecher (m) auf der Waage: Innenradius, Höhe; Waage 4,5 cm hoch. */
const BEAKER = { R: 0.05, H: 0.13, scaleH: 0.045 };
/** Messzylinder: Innenradius (m), Höhe (m), Anfangsfüllung und Fassungsvermögen (ml). */
const CYL = { R: 0.025, H: 0.28, V1: 200, cap: 500 };
const CYL_AREA_CM2 = Math.PI * 2.5 * 2.5;
/** Lage von Waage, Ablage auf dem Tisch und Messzylinder (m, von links). */
const RHO_X = { scale: 0.09, table: 0.215, cyl: 0.335, width: 0.48 };
/** Zeitraffer beim Heißluftballon: 1 s im Bild entspricht 40 s. */
const BALLOON_LAPSE = 40;
/** Schräge Darstellung der Tiefe: Verschiebung je Meter Tiefe (in Pixeln je Pixel Maßstab). */
const OBL: Pt = [0.36, -0.22];
/** Stehende Wellen im Becken: Anzahl der Eigenschwingungen, Abklingrate (1/s), Verstärkung nur fürs Bild. */
const MODES = 7;
const SLOSH_DECAY = 0.55;
const SLOSH_GAIN = 3.2;

/** Unbekannte Proben im Versuch „Dichte bestimmen“. */
const PROBES: Record<Exclude<Probe, 'mat'>, Exclude<MaterialId, 'own'>> = {
  A: 'alu',
  B: 'wood',
  C: 'copper',
  D: 'wax',
  E: 'iron',
  F: 'pvc',
};

const MAT_NAME: Record<MaterialId, Loc> = {
  styro: L('Styropor', 'Polystyrene foam'),
  cork: L('Kork', 'Cork'),
  wood: L('Holz', 'Wood'),
  wax: L('Kerzenwachs', 'Candle wax'),
  ice: L('Eis', 'Ice'),
  pe: L('Polyethylen (PE)', 'Polyethylene (PE)'),
  pvc: L('PVC', 'PVC'),
  glass: L('Glas', 'Glass'),
  alu: L('Aluminium', 'Aluminium'),
  iron: L('Eisen', 'Iron'),
  copper: L('Kupfer', 'Copper'),
  lead: L('Blei', 'Lead'),
  gold: L('Gold', 'Gold'),
  own: L('eigene Dichte', 'custom density'),
};
const MAT_SHORT: Partial<Record<MaterialId, Loc>> = {
  pe: L('PE', 'PE'),
  styro: L('Styropor', 'Foam'),
  wax: L('Wachs', 'Wax'),
};

const LIQ_NAME: Record<LiquidId, Loc> = {
  spirit: L('Spiritus (Ethanol)', 'Spirit (ethanol)'),
  oil: L('Speiseöl', 'Cooking oil'),
  fresh: L('Süßwasser', 'Fresh water'),
  salt: L('Meerwasser', 'Sea water'),
  dead: L('Totes Meer', 'Dead Sea'),
  mercury: L('Quecksilber', 'Mercury'),
};

const dec = (x: number) => String(x).replace('.', ',');
const MAT_OPTIONS: { value: MaterialId; label: Loc; detail?: Loc }[] = [
  ...MATERIALS.map((id) => ({
    value: id as MaterialId,
    label: MAT_NAME[id],
    detail: L(`ρ = ${dec(MATERIAL_DENSITY[id])} g/cm³`, `ρ = ${MATERIAL_DENSITY[id]} g/cm³`),
  })),
  { value: 'own', label: MAT_NAME.own },
];
const LIQ_OPTIONS: { value: LiquidId; label: Loc; detail: Loc }[] = LIQUIDS.map((id) => ({
  value: id,
  label: LIQ_NAME[id],
  detail: L(`ρ = ${dec(LIQUID_DENSITY[id])} g/cm³`, `ρ = ${LIQUID_DENSITY[id]} g/cm³`),
}));

/** Aussehen der Stoffe (Naturfarben, in beiden Farbschemata lesbar). */
type Look = 'wood' | 'cork' | 'beads' | 'metal' | 'ice' | 'glass' | 'wax' | 'plastic';
const LOOK: Record<Exclude<MaterialId, 'own'>, { c: string; kind: Look }> = {
  styro: { c: '#f2f4f6', kind: 'beads' },
  cork: { c: '#b07b4b', kind: 'cork' },
  wood: { c: '#d7a463', kind: 'wood' },
  wax: { c: '#f0e1b8', kind: 'wax' },
  ice: { c: '#cfe9f6', kind: 'ice' },
  pe: { c: '#e4ebef', kind: 'plastic' },
  pvc: { c: '#7e8995', kind: 'plastic' },
  glass: { c: '#bfe3d6', kind: 'glass' },
  alu: { c: '#c9d0d8', kind: 'metal' },
  iron: { c: '#6b7179', kind: 'metal' },
  copper: { c: '#c8784a', kind: 'metal' },
  lead: { c: '#7b8594', kind: 'metal' },
  gold: { c: '#e2b23c', kind: 'metal' },
};
const LIQ_LOOK: Record<LiquidId, { c: string; a: number }> = {
  spirit: { c: '#a59fe6', a: 0.2 },
  oil: { c: '#e2b12c', a: 0.48 },
  fresh: { c: '#4b9ad6', a: 0.3 },
  salt: { c: '#3b98b4', a: 0.34 },
  dead: { c: '#37ada6', a: 0.36 },
  mercury: { c: '#aeb6c0', a: 0.95 },
};

interface Lay {
  side: boolean;
  scene: Rect;
  panel: Rect;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  wob: number;
}

/**
 * Dichte, Schwimmen und Auftrieb: Körper aus verschiedenen Stoffen ins Becken
 * legen oder hineinziehen (schwimmen, schweben, sinken – mit Kraftpfeilen,
 * Wellen und steigendem Wasserstand), Stahlschiff und U-Boot; Archimedes mit
 * Kraftmesser und Überlaufgefäß; Dichte mit Waage und Messzylinder bestimmen;
 * Heißluftballon mit Luftdichte aus der Gasgleichung.
 */
export default defineSimulation({
  id: 'dichte-auftrieb',
  dragHint: true,
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'float'
      ? L(
          'Tipp: Zieh den Körper ins Wasser, drück ihn unter oder wirf ihn hinein. Stoffe auf der Dichteskala antippen.',
          'Tip: Drag the body into the water, push it under or drop it in. Tap materials on the density scale.',
        )
      : v.mode === 'arch'
        ? L('Tipp: Zieh am Kraftmesser, um den Körper tiefer einzutauchen.', 'Tip: Drag the spring balance to lower the body deeper.')
        : v.mode === 'rho'
          ? L('Tipp: Tippe auf die Waage oder den Messzylinder – oder zieh die Probe dorthin.', 'Tip: Tap the balance or the measuring cylinder – or drag the sample there.')
          : L('Tipp: Tippe auf die Flamme (Brenner) oder oben auf die Hülle (Ventil).', 'Tip: Tap the flame (burner) or the top of the envelope (vent).'),
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        {
          value: 'float',
          label: L('Schwimmen, Schweben, Sinken', 'Floating, hovering, sinking'),
        },
        {
          value: 'arch',
          label: L('Archimedes: Überlaufgefäß', 'Archimedes: overflow can'),
        },
        { value: 'rho', label: L('Dichte bestimmen', 'Measuring density') },
        { value: 'ball', label: L('Heißluftballon', 'Hot-air balloon') },
      ],
      default: 'float',
    },
    {
      key: 'obj',
      type: 'choice',
      label: L('Körper', 'Body'),
      options: [
        {
          value: 'block',
          label: L('Würfel aus einem Stoff', 'Cube of one material'),
        },
        { value: 'ship', label: L('Schiff aus Stahl', 'Steel ship') },
        { value: 'sub', label: L('U-Boot', 'Submarine') },
      ],
      default: 'block',
      visibleIf: (v) => v.mode === 'float',
    },
    {
      key: 'probe',
      type: 'choice',
      label: L('Probe', 'Sample'),
      options: [
        { value: 'mat', label: L('bekannter Stoff', 'known material') },
        { value: 'A', label: L('Probe A', 'Sample A') },
        { value: 'B', label: L('Probe B', 'Sample B') },
        { value: 'C', label: L('Probe C', 'Sample C') },
        { value: 'D', label: L('Probe D', 'Sample D') },
        { value: 'E', label: L('Probe E', 'Sample E') },
        { value: 'F', label: L('Probe F', 'Sample F') },
      ],
      default: 'mat',
      visibleIf: (v) => v.mode === 'rho',
    },
    {
      key: 'mat',
      type: 'choice',
      label: L('Stoff', 'Material'),
      options: MAT_OPTIONS,
      default: 'wood',
      visibleIf: (v) => (v.mode === 'float' && v.obj === 'block') || v.mode === 'arch' || (v.mode === 'rho' && v.probe === 'mat'),
    },
    {
      key: 'rk',
      type: 'number',
      label: L('Dichte des Körpers ρ_K', 'Density of the body ρ_K'),
      min: 0.05,
      max: 20,
      step: 0.01,
      default: 1,
      unit: 'g/cm³',
      visibleIf: (v) => v.mat === 'own' && ((v.mode === 'float' && v.obj === 'block') || v.mode === 'arch' || (v.mode === 'rho' && v.probe === 'mat')),
    },
    {
      key: 'V',
      type: 'number',
      label: L('Volumen des Würfels V', 'Volume of the cube V'),
      min: 10,
      max: 1000,
      step: 5,
      default: 125,
      unit: 'cm³',
      visibleIf: (v) => (v.mode === 'float' && v.obj === 'block') || v.mode === 'arch',
    },
    {
      key: 'Vp',
      type: 'number',
      label: L('Volumen der Probe', 'Volume of the sample'),
      min: 5,
      max: 150,
      step: 1,
      default: 30,
      unit: 'cm³',
      visibleIf: (v) => v.mode === 'rho',
    },
    {
      key: 'liq',
      type: 'choice',
      label: L('Flüssigkeit', 'Liquid'),
      options: LIQ_OPTIONS,
      default: 'fresh',
      visibleIf: (v) => v.mode === 'float' || v.mode === 'arch',
    },
    {
      key: 'load',
      type: 'number',
      label: L('Ladung im Schiff', 'Cargo in the ship'),
      help: L('Der leere Rumpf aus Stahlblech wiegt 300 g, außen 20 cm × 10 cm × 6 cm.', 'The empty sheet-steel hull weighs 300 g, outside 20 cm × 10 cm × 6 cm.'),
      min: 0,
      max: 1200,
      step: 10,
      default: 300,
      unit: 'g',
      visibleIf: (v) => v.mode === 'float' && v.obj === 'ship',
    },
    {
      key: 'fill',
      type: 'number',
      label: L('Tauchzelle geflutet', 'Ballast tank flooded'),
      help: L('U-Boot: 600 cm³, Rumpf 450 g, Tauchzelle 300 cm³. Die Pumpe braucht etwas Zeit.', 'Submarine: 600 cm³, hull 450 g, ballast tank 300 cm³. The pump takes a moment.'),
      min: 0,
      max: 100,
      step: 1,
      default: 30,
      unit: '%',
      visibleIf: (v) => v.mode === 'float' && v.obj === 'sub',
    },
    {
      key: 'd',
      type: 'number',
      label: L('Eintauchtiefe (Anteil der Würfelhöhe)', 'Depth of immersion (share of the cube height)'),
      help: L('Oder: am Kraftmesser ziehen.', 'Or drag the spring balance.'),
      min: 0,
      max: 100,
      step: 1,
      default: 100,
      unit: '%',
      visibleIf: (v) => v.mode === 'arch',
    },
    {
      key: 'pos',
      type: 'choice',
      label: L('Die Probe liegt', 'The sample is'),
      options: [
        { value: 'table', label: L('auf dem Tisch', 'on the table') },
        { value: 'scale', label: L('auf der Waage', 'on the balance') },
        {
          value: 'cyl',
          label: L('im Messzylinder', 'in the measuring cylinder'),
        },
      ],
      default: 'table',
      visibleIf: (v) => v.mode === 'rho',
    },
    {
      key: 'push',
      type: 'boolean',
      label: L('Schwimmende Probe mit einem Draht ganz untertauchen', 'Push a floating sample fully under with a wire'),
      default: true,
      visibleIf: (v) => v.mode === 'rho',
    },
    {
      key: 'Vb',
      type: 'number',
      label: L('Volumen der Hülle V', 'Volume of the envelope V'),
      min: 1000,
      max: 5000,
      step: 100,
      default: 2500,
      unit: 'm³',
      visibleIf: (v) => v.mode === 'ball',
    },
    {
      key: 'Ti',
      type: 'number',
      label: L('Lufttemperatur in der Hülle ϑ_i', 'Air temperature inside ϑ_i'),
      help: L(
        'Der Brenner heizt nach, die Luft in der Hülle braucht etwas Zeit. Die Hülle verträgt höchstens etwa 120 °C.',
        'The burner heats; the air in the envelope takes a while. The envelope withstands about 120 °C at most.',
      ),
      min: 20,
      max: 120,
      step: 1,
      default: 90,
      unit: '°C',
      visibleIf: (v) => v.mode === 'ball',
    },
    {
      key: 'Ta',
      type: 'number',
      label: L('Außentemperatur ϑ_a', 'Outside temperature ϑ_a'),
      min: -10,
      max: 35,
      step: 1,
      default: 15,
      unit: '°C',
      visibleIf: (v) => v.mode === 'ball',
    },
    {
      key: 'ml',
      type: 'number',
      label: L('Zuladung (Personen, Gepäck)', 'Payload (people, luggage)'),
      help: L('Dazu kommen Hülle, Korb, Brenner und Gasflaschen (bei 2500 m³ etwa 315 kg).', 'Plus envelope, basket, burner and gas cylinders (about 315 kg at 2500 m³).'),
      min: 0,
      max: 800,
      step: 10,
      default: 240,
      unit: 'kg',
      visibleIf: (v) => v.mode === 'ball',
    },
    {
      key: 'arrows',
      type: 'boolean',
      group: 'view',
      label: L('Kraftpfeile', 'Force arrows'),
      default: true,
      visibleIf: (v) => v.mode !== 'rho',
    },
    {
      key: 'slow',
      type: 'boolean',
      group: 'view',
      label: L('Zeitlupe', 'Slow motion'),
      default: false,
      visibleIf: (v) => v.mode === 'float' || v.mode === 'arch',
    },
  ],
  actions: [
    {
      id: 'drop',
      label: L('Fallen lassen', 'Drop it'),
      primary: true,
      visibleIf: (v) => v.mode === 'float',
    },
    {
      id: 'dunk',
      label: L('Unter Wasser drücken', 'Push under'),
      visibleIf: (v) => v.mode === 'float',
    },
    {
      id: 'down',
      label: L('Eintauchen', 'Lower in'),
      primary: true,
      visibleIf: (v) => v.mode === 'arch',
    },
    {
      id: 'up',
      label: L('Herausziehen', 'Pull out'),
      visibleIf: (v) => v.mode === 'arch',
    },
    {
      id: 'refill',
      label: L('Gefäß neu füllen', 'Refill the can'),
      visibleIf: (v) => v.mode === 'arch',
    },
    {
      id: 'next',
      label: L('Nächster Schritt', 'Next step'),
      primary: true,
      visibleIf: (v) => v.mode === 'rho',
    },
    {
      id: 'new',
      label: L('Neue Rätselprobe', 'New mystery sample'),
      visibleIf: (v) => v.mode === 'rho',
    },
    {
      id: 'land',
      label: L('Neu starten (am Boden)', 'Restart (on the ground)'),
      primary: true,
      visibleIf: (v) => v.mode === 'ball',
    },
  ],
  readouts: [
    { key: 'cmp', label: L('Vergleich der Dichten', 'Comparing densities') },
    { key: 'forces', label: L('Kräfte', 'Forces') },
    { key: 'frac', label: L('Eintauchen', 'Immersion'), spoiler: true },
    { key: 'level', label: L('Wasserstand', 'Water level') },
    { key: 'meter', label: L('Kraftmesser', 'Spring balance') },
    { key: 'disp', label: L('Verdrängte Flüssigkeit', 'Displaced liquid') },
    {
      key: 'archi',
      label: L('Prinzip des Archimedes', 'Archimedes’ principle'),
      spoiler: true,
    },
    { key: 'mass', label: L('1. Masse', '1. Mass') },
    { key: 'vol', label: L('2. Volumen', '2. Volume') },
    { key: 'rho', label: L('3. Dichte', '3. Density'), spoiler: true },
    { key: 'ident', label: L('Stoff', 'Material'), spoiler: true },
    { key: 'tab', label: L('Dichtetabelle', 'Density table') },
    { key: 'air', label: L('Luftdichte', 'Air density') },
    { key: 'lift', label: L('Tragkraft', 'Lifting capacity'), spoiler: true },
    { key: 'eq', label: L('Schwebehöhe', 'Hovering altitude'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Holz schwimmt', 'Wood floats'), values: {} },
    {
      id: 'ship',
      label: L('Stahlschiff mit Ladung', 'Steel ship with cargo'),
      values: { obj: 'ship', load: 600 },
    },
    {
      id: 'sub',
      label: L('U-Boot schwebt', 'Submarine hovers'),
      values: { obj: 'sub', fill: 50 },
    },
    {
      id: 'arch',
      label: L('Archimedes: Aluminium', 'Archimedes: aluminium'),
      values: { mode: 'arch', mat: 'alu', V: 200 },
    },
    {
      id: 'rho',
      label: L('Dichte einer Probe bestimmen', 'Density of a sample'),
      values: { mode: 'rho', probe: 'A', pos: 'scale' },
    },
    {
      id: 'ball',
      label: L('Heißluftballon', 'Hot-air balloon'),
      values: { mode: 'ball' },
    },
  ],
  strings: {
    de: {
      canvas:
        'Versuche zu Dichte und Auftrieb: ein Glasbecken mit Flüssigkeit, in dem ein Würfel, ein Stahlschiff oder ein U-Boot schwimmt, schwebt oder sinkt, mit Kraftpfeilen und einer Dichteskala; ein Überlaufgefäß mit Kraftmesser, Auffangbecher und Waage; Waage und Messzylinder zum Bestimmen der Dichte; ein Heißluftballon mit Höhenskala.',
      float: 'schwimmt',
      hover: 'schwebt',
      sink: 'sinkt',
      floats: 'Der Körper schwimmt.',
      hovers: 'Der Körper schwebt.',
      sinks: 'Der Körper sinkt.',
      ladder: 'Dichte in g/cm³',
      ladderS: 'ρ in g/cm³',
      zoneUp: 'leichter als die Flüssigkeit',
      zoneDown: 'schwerer als die Flüssigkeit',
      liquids: 'Flüssigkeiten',
      solids: 'Stoffe',
      under: '{p} % unter der Oberfläche',
      rise: 'Flüssigkeitsstand +{h} mm (– – vorher)',
      before: 'vorher',
      hand: 'F_Hand = {F} N',
      lump: '300 g Stahl als Würfel',
      lumpSinks: 'sinkt (38 cm³)',
      flooded: 'vollgelaufen!',
      inHull: 'Wasser im Rumpf: {v} cm³',
      freeboard: 'Freibord {f} cm',
      tank: 'Tauchzelle {p} %',
      pump: 'Pumpe läuft …',
      drag: 'ziehen',
      ownDens: 'eigene',
      meterTitle: 'Kraftmesser beim Eintauchen',
      meterTitleS: 'Kraftmesser',
      axisS: 's in cm',
      axisF: 'F in N',
      lgFG: 'F_G (in Luft)',
      lgFA: 'F_A',
      lgFK: 'F (Anzeige)',
      slack: 'Faden locker – der Körper schwimmt',
      range: 'Messbereich {r} N',
      tare: 'Becher tariert',
      displaced: 'verdrängt: {v} cm³',
      protocol: 'Messprotokoll',
      step1: '1  Masse (Waage)',
      step2: '2  Volumen (Messzylinder)',
      step3: '3  Dichte ausrechnen',
      notYet: 'noch nicht gemessen',
      tableTitle: 'Dichtetabelle (g/cm³)',
      probeName: 'Probe {p}',
      probeUnknown: 'Probe {p} (unbekannt)',
      floatsCyl: 'Die Probe schwimmt – sie verdrängt nur {v} cm³!',
      wire: 'Draht',
      tapScale: 'Waage antippen',
      tapCyl: 'Messzylinder antippen',
      inside: 'innen {t} °C',
      outside: 'außen {t} °C',
      altitude: 'Höhe in m',
      hoverLine: 'Schwebehöhe ≈ {h} m',
      ground: 'am Boden',
      burner: 'Brenner +5 °C',
      vent: 'Ventil −5 °C',
      lapse: 'Zeitraffer: 1 s ≙ 40 s',
      cardBall: 'Kräfte am Ballon',
      cardBallS: 'Kräfte',
      barFA: 'Auftrieb F_A',
      barAir: 'warme Luft',
      barLoad: 'Ballon + Zuladung',
      barWeights: 'warme Luft + Ballon',
      rises: 'steigt',
      falls: 'sinkt',
      hovering: 'schwebt',
      onGround: 'bleibt am Boden',
      historyT: 'Höhe der letzten 2 Minuten',
      kN: 'kN',
      nowRising: 'steigt mit {v} m/s',
      nowFalling: 'sinkt mit {v} m/s',
    },
    en: {
      canvas:
        'Experiments on density and buoyancy: a glass tank with liquid in which a cube, a steel ship or a submarine floats, hovers or sinks, with force arrows and a density scale; an overflow can with a spring balance, a catch beaker and a balance; a balance and a measuring cylinder to find the density; a hot-air balloon with an altitude scale.',
      float: 'floats',
      hover: 'hovers',
      sink: 'sinks',
      floats: 'The body floats.',
      hovers: 'The body hovers.',
      sinks: 'The body sinks.',
      ladder: 'Density in g/cm³',
      ladderS: 'ρ in g/cm³',
      zoneUp: 'lighter than the liquid',
      zoneDown: 'heavier than the liquid',
      liquids: 'Liquids',
      solids: 'Materials',
      under: '{p} % below the surface',
      rise: 'liquid level +{h} mm (– – before)',
      before: 'before',
      hand: 'F_hand = {F} N',
      lump: '300 g of steel as a cube',
      lumpSinks: 'sinks (38 cm³)',
      flooded: 'flooded!',
      inHull: 'water in the hull: {v} cm³',
      freeboard: 'freeboard {f} cm',
      tank: 'ballast tank {p} %',
      pump: 'pump running …',
      drag: 'drag',
      ownDens: 'custom',
      meterTitle: 'Spring balance while lowering',
      meterTitleS: 'Spring balance',
      axisS: 's in cm',
      axisF: 'F in N',
      lgFG: 'F_G (in air)',
      lgFA: 'F_B',
      lgFK: 'F (reading)',
      slack: 'thread slack – the body floats',
      range: 'range {r} N',
      tare: 'beaker tared',
      displaced: 'displaced: {v} cm³',
      protocol: 'Lab record',
      step1: '1  Mass (balance)',
      step2: '2  Volume (cylinder)',
      step3: '3  Work out the density',
      notYet: 'not measured yet',
      tableTitle: 'Density table (g/cm³)',
      probeName: 'Sample {p}',
      probeUnknown: 'Sample {p} (unknown)',
      floatsCyl: 'The sample floats – it displaces only {v} cm³!',
      wire: 'wire',
      tapScale: 'tap the balance',
      tapCyl: 'tap the cylinder',
      inside: 'inside {t} °C',
      outside: 'outside {t} °C',
      altitude: 'altitude in m',
      hoverLine: 'hovering altitude ≈ {h} m',
      ground: 'on the ground',
      burner: 'burner +5 °C',
      vent: 'vent −5 °C',
      lapse: 'time-lapse: 1 s ≙ 40 s',
      cardBall: 'Forces on the balloon',
      cardBallS: 'Forces',
      barFA: 'buoyancy F_B',
      barAir: 'warm air',
      barLoad: 'balloon + payload',
      barWeights: 'warm air + balloon',
      rises: 'rises',
      falls: 'sinks',
      hovering: 'hovers',
      onGround: 'stays on the ground',
      historyT: 'Altitude over the last 2 minutes',
      kN: 'kN',
      nowRising: 'rising at {v} m/s',
      nowFalling: 'sinking at {v} m/s',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const loc = (l: Loc) => l[ctx.lang];
    const mode = (): Mode => p.mode as Mode;
    const obj = (): Obj => p.obj as Obj;
    const probe = (): Probe => p.probe as Probe;
    const liq = (): LiquidId => p.liq as LiquidId;
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const n = (v: number, d: number) => fmt.num(v, d);
    /** Zahl mit fester Stellenzahl (Nullen bleiben stehen, damit Rechnungen nachvollziehbar sind). */
    const f = (v: number, d: number) => fmt.fixed(v, d);
    /** Kraft mit drei gültigen Ziffern (mindestens zwei Nachkommastellen). */
    const fN = (F: number) => fmt.fixed(F, F >= 100 ? 1 : F >= 10 ? 2 : F >= 1 ? 2 : 3);

    /* ---------- weiche Werte und Einstiegsanimation ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, instant = false): number {
      const cur = soft.get(key);
      if (cur === undefined || instant || prefersReducedMotion() || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-4 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1200, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    const liqFade = new Tween(700, ease.inOutCubic);
    let liqFrom: LiquidId = 'fresh';
    const matFade = new Tween(500, ease.inOutCubic);
    let matFrom: MaterialId = 'wood';

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.3, 214, 330));
        return {
          side,
          scene: { x: 0, y: 0, w: w - pw - 12, h },
          panel: { x: w - pw, y: 0, w: pw, h },
        };
      }
      const sh = Math.round(h * 0.57);
      return {
        side,
        scene: { x: 0, y: 0, w, h: sh },
        panel: { x: 0, y: sh + 10, w, h: h - sh - 10 },
      };
    }
    let lay: Lay = computeLayout();
    const small = () => !lay.side || lay.scene.w < 480;

    /* ---------- Stoffe ---------- */
    /** Dichte des Körpers in g/cm³ (je nach Versuch). */
    function bodyRho(): number {
      if (mode() === 'rho' && probe() !== 'mat') return MATERIAL_DENSITY[PROBES[probe() as Exclude<Probe, 'mat'>]];
      return p.mat === 'own' ? p.rk : MATERIAL_DENSITY[p.mat as Exclude<MaterialId, 'own'>];
    }
    function bodyMat(): MaterialId {
      if (mode() === 'rho' && probe() !== 'mat') return PROBES[probe() as Exclude<Probe, 'mat'>];
      return p.mat as MaterialId;
    }
    const liqRho = () => LIQUID_DENSITY[liq()];
    /** Dichte mit zwei Nachkommastellen, mit drei, wenn der Tabellenwert sie hat (0,917; 1,025). */
    const rhoStr = (x: number) => (Math.abs(x * 100 - Math.round(x * 100)) > 1e-9 ? f(x, 3) : f(x, 2));
    const gStr = `${n(G, 2)} N/kg`;
    let lastLiq: LiquidId | null = null;
    let lastMat: MaterialId | null = null;
    let lastPos: Pos | null = null;
    function matColor(id: MaterialId): string {
      return id === 'own' ? mixColor(purple(), '#ffffff', ctx.theme.dark ? 0.15 : 0.35) : LOOK[id].c;
    }
    function matName(id: MaterialId): string {
      if (id === 'own') return de ? `ρ = ${n(p.rk, 2)} g/cm³` : `ρ = ${n(p.rk, 2)} g/cm³`;
      return loc(MAT_NAME[id]);
    }
    function liquidColor(): { c: string; a: number } {
      const to = LIQ_LOOK[liq()];
      if (!liqFade.running) return to;
      const from = LIQ_LOOK[liqFrom];
      const t = liqFade.value;
      return { c: mixColor(from.c, to.c, t), a: from.a + (to.a - from.a) * t };
    }
    const stateWord = (s: FloatState) => ctx.t(s);
    const stateColor = (s: FloatState) => (s === 'float' ? green() : s === 'hover' ? purple() : orange());

    /* ---------- Zeichenhilfen ---------- */
    const g = () => surface.g;
    function sub(
      str: string,
      x: number,
      y: number,
      size: number,
      color: string,
      align: CanvasTextAlign = 'center',
      weight: number | string = 700,
      halo: string | null = null,
      baseline: CanvasTextBaseline = 'middle',
    ): number {
      return subText(g(), str, x, y, {
        size,
        weight,
        family: ctx.theme.font,
        color,
        align,
        baseline,
        ...(halo ? { halo, haloWidth: 3.5 } : {}),
      });
    }
    const subW = (str: string, size: number, weight: number | string = 700) =>
      measureSubText(g(), str, {
        size,
        weight,
        family: ctx.theme.font,
        color: '',
      });
    /** Beschriftung mit Rand, an den Rand der Fläche geklemmt. */
    function label(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', bounds: Rect | null = null): void {
      const w = subW(str, size);
      const b = bounds ?? { x: 0, y: 0, w: surface.width, h: surface.height };
      let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      left = clamp(left, b.x + 4, b.x + b.w - 4 - w);
      sub(str, left, clamp(y, b.y + size * 0.6, b.y + b.h - size * 0.6), size, color, 'left', 700, ctx.theme.bg);
    }
    function pill(x: number, y: number, str: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid = false, bounds: Rect | null = null): Rect {
      const gx = g();
      const theme = ctx.theme;
      const w = subW(str, size) + 18;
      const h = size + 11;
      const b = bounds ?? { x: 0, y: 0, w: surface.width, h: surface.height };
      const left = clamp(align === 'left' ? x : align === 'right' ? x - w : x - w / 2, b.x + 4, b.x + b.w - 4 - w);
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 7;
      gx.shadowOffsetY = 1.5;
      gx.fillStyle = solid ? color : theme.dark ? 'rgba(16,22,31,0.93)' : 'rgba(255,255,255,0.96)';
      roundRect(gx, left, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      if (!solid) {
        gx.strokeStyle = withAlpha(color, 0.5);
        gx.lineWidth = 1;
        roundRect(gx, left + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        gx.stroke();
      }
      sub(str, left + w / 2, y + h / 2 + 0.5, size, solid ? textOn(color, theme) : color);
      return { x: left, y, w, h };
    }
    /** Kraftpfeil (Pixel) mit hellem Rand. */
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width = 3.2, head = 11): void {
      const gx = g();
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hl = Math.min(head, len * 0.6);
      const bx = x1 - ux * hl;
      const by = y1 - uy * hl;
      gx.save();
      gx.lineCap = 'round';
      gx.lineJoin = 'round';
      for (const pass of [0, 1]) {
        const c = pass === 0 ? withAlpha(ctx.theme.bg, 0.8) : color;
        gx.strokeStyle = c;
        gx.fillStyle = c;
        gx.lineWidth = pass === 0 ? width + 3 : width;
        gx.beginPath();
        gx.moveTo(x0, y0);
        gx.lineTo(bx, by);
        gx.stroke();
        gx.beginPath();
        gx.moveTo(x1 + (pass === 0 ? ux * 1.5 : 0), y1 + (pass === 0 ? uy * 1.5 : 0));
        gx.lineTo(bx - uy * hl * 0.5, by + ux * hl * 0.5);
        gx.lineTo(bx + uy * hl * 0.5, by - ux * hl * 0.5);
        gx.closePath();
        gx.fill();
        if (pass === 0) gx.stroke();
      }
      gx.restore();
    }
    function card(r: Rect, accent?: string): void {
      drawCard(g(), r, ctx.theme, accent);
    }
    function wallAndTable(r: Rect, tableY: number): void {
      const gx = g();
      const dark = ctx.theme.dark;
      const wall = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f2f5f9');
      wall.addColorStop(1, dark ? '#0f1723' : '#e1e7ee');
      gx.fillStyle = wall;
      gx.fillRect(r.x, r.y, r.w, r.h);
      const table = gx.createLinearGradient(0, tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
      table.addColorStop(1, dark ? '#33281e' : '#9c7349');
      gx.fillStyle = table;
      gx.fillRect(r.x, tableY, r.w, r.y + r.h - tableY);
      gx.fillStyle = 'rgba(255,255,255,0.22)';
      gx.fillRect(r.x, tableY, r.w, 1.5);
    }
    /** Senkrechte Bemaßung mit Klammer (Pixel). */
    function bracket(x: number, y0: number, y1: number, color: string, side: 1 | -1): void {
      const gx = g();
      gx.save();
      gx.strokeStyle = color;
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.moveTo(x - side * 5, y0);
      gx.lineTo(x, y0);
      gx.lineTo(x, y1);
      gx.lineTo(x - side * 5, y1);
      gx.stroke();
      gx.restore();
    }

    /** Würfel bzw. Quader eines Stoffs in Schrägansicht: Vorderseite (x, yBottom − h … yBottom), Tiefe d (Pixel). */
    function drawBlock(x: number, yBottom: number, w: number, h: number, d: number, mat: MaterialId, alpha = 1, seed = 3): void {
      const gx = g();
      const dark = ctx.theme.dark;
      const look = mat === 'own' ? { c: matColor('own'), kind: 'plastic' as Look } : LOOK[mat];
      const base = look.c;
      const ox = d * OBL[0];
      const oy = d * OBL[1];
      const y0 = yBottom - h;
      const clear = look.kind === 'ice' || look.kind === 'glass';
      gx.save();
      gx.globalAlpha *= alpha * (clear ? 0.82 : 1);
      // Schatten nach unten
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 3;
      gx.fillStyle = base;
      gx.fillRect(x, y0, w, h);
      gx.restore();
      // rechte Seite
      gx.fillStyle = shade(base, -0.24);
      gx.beginPath();
      gx.moveTo(x + w, y0);
      gx.lineTo(x + w + ox, y0 + oy);
      gx.lineTo(x + w + ox, yBottom + oy);
      gx.lineTo(x + w, yBottom);
      gx.closePath();
      gx.fill();
      // Oberseite
      gx.fillStyle = mixColor(base, '#ffffff', 0.28);
      gx.beginPath();
      gx.moveTo(x, y0);
      gx.lineTo(x + ox, y0 + oy);
      gx.lineTo(x + w + ox, y0 + oy);
      gx.lineTo(x + w, y0);
      gx.closePath();
      gx.fill();
      // Vorderseite
      const front = gx.createLinearGradient(x, y0, x + w, yBottom);
      front.addColorStop(0, mixColor(base, '#ffffff', 0.12));
      front.addColorStop(1, shade(base, -0.1));
      gx.fillStyle = front;
      gx.fillRect(x, y0, w, h);
      // Oberfläche je Stoff
      gx.save();
      gx.beginPath();
      gx.rect(x, y0, w, h);
      gx.clip();
      const rnd = seededRandom(seed * 977 + Math.round(w));
      if (look.kind === 'wood') {
        gx.strokeStyle = withAlpha('#7a4a1c', 0.32);
        gx.lineWidth = Math.max(0.8, w / 70);
        for (let i = 0; i < 7; i++) {
          const yy = y0 + ((i + 0.5) / 7) * h;
          gx.beginPath();
          for (let s = 0; s <= 12; s++) {
            const xx = x + (s / 12) * w;
            const yv = yy + Math.sin(s * 0.9 + i * 1.7) * h * 0.025 + Math.sin(s * 0.33 + i) * h * 0.02;
            if (s === 0) gx.moveTo(xx, yv);
            else gx.lineTo(xx, yv);
          }
          gx.stroke();
        }
      } else if (look.kind === 'cork') {
        for (let i = 0; i < Math.round((w * h) / 22); i++) {
          gx.fillStyle = rnd() < 0.5 ? 'rgba(70,40,15,0.35)' : 'rgba(255,235,200,0.25)';
          gx.beginPath();
          gx.arc(x + rnd() * w, y0 + rnd() * h, 0.6 + rnd() * 1.4, 0, Math.PI * 2);
          gx.fill();
        }
      } else if (look.kind === 'beads') {
        gx.strokeStyle = 'rgba(120,130,145,0.28)';
        gx.lineWidth = 0.8;
        const r = Math.max(2.2, w / 16);
        for (let yy = y0 + r; yy < yBottom + r; yy += r * 1.7) {
          for (let xx = x + (Math.round((yy - y0) / r) % 2) * r * 0.85; xx < x + w + r; xx += r * 1.7) {
            gx.beginPath();
            gx.arc(xx, yy, r * 0.8, 0, Math.PI * 2);
            gx.stroke();
          }
        }
      } else if (look.kind === 'metal') {
        const sheen = gx.createLinearGradient(x, 0, x + w, 0);
        sheen.addColorStop(0, 'rgba(255,255,255,0)');
        sheen.addColorStop(0.32, 'rgba(255,255,255,0.32)');
        sheen.addColorStop(0.45, 'rgba(255,255,255,0.05)');
        sheen.addColorStop(1, 'rgba(0,0,0,0.12)');
        gx.fillStyle = sheen;
        gx.fillRect(x, y0, w, h);
        gx.strokeStyle = 'rgba(255,255,255,0.12)';
        gx.lineWidth = 0.6;
        for (let i = 0; i < 14; i++) {
          const yy = y0 + rnd() * h;
          gx.beginPath();
          gx.moveTo(x, yy);
          gx.lineTo(x + w, yy + (rnd() - 0.5) * 2);
          gx.stroke();
        }
      } else if (look.kind === 'ice' || look.kind === 'glass') {
        const hi = gx.createLinearGradient(x, y0, x + w, yBottom);
        hi.addColorStop(0, 'rgba(255,255,255,0.55)');
        hi.addColorStop(0.35, 'rgba(255,255,255,0.05)');
        hi.addColorStop(0.7, 'rgba(255,255,255,0.18)');
        hi.addColorStop(1, 'rgba(255,255,255,0)');
        gx.fillStyle = hi;
        gx.fillRect(x, y0, w, h);
        if (look.kind === 'ice') {
          gx.strokeStyle = 'rgba(255,255,255,0.55)';
          gx.lineWidth = 0.9;
          for (let i = 0; i < 3; i++) {
            gx.beginPath();
            let cx = x + rnd() * w;
            let cy = y0 + rnd() * h;
            gx.moveTo(cx, cy);
            for (let s = 0; s < 3; s++) {
              cx += (rnd() - 0.5) * w * 0.35;
              cy += (rnd() - 0.3) * h * 0.3;
              gx.lineTo(cx, cy);
            }
            gx.stroke();
          }
          for (let i = 0; i < 5; i++) {
            gx.fillStyle = 'rgba(255,255,255,0.6)';
            gx.beginPath();
            gx.arc(x + rnd() * w, y0 + rnd() * h, 0.8 + rnd() * 1.2, 0, Math.PI * 2);
            gx.fill();
          }
        }
      } else {
        const hi = gx.createRadialGradient(x + w * 0.3, y0 + h * 0.25, 1, x + w * 0.3, y0 + h * 0.25, Math.max(w, h) * 0.8);
        hi.addColorStop(0, 'rgba(255,255,255,0.35)');
        hi.addColorStop(1, 'rgba(255,255,255,0)');
        gx.fillStyle = hi;
        gx.fillRect(x, y0, w, h);
      }
      gx.restore();
      // Kanten
      gx.strokeStyle = shade(base, -0.42, 0.7);
      gx.lineWidth = 1;
      gx.strokeRect(x + 0.5, y0 + 0.5, w - 1, h - 1);
      gx.beginPath();
      gx.moveTo(x, y0);
      gx.lineTo(x + ox, y0 + oy);
      gx.lineTo(x + w + ox, y0 + oy);
      gx.lineTo(x + w + ox, yBottom + oy);
      gx.lineTo(x + w, yBottom);
      gx.moveTo(x + w + ox, y0 + oy);
      gx.lineTo(x + w, y0);
      gx.stroke();
      // Docht der Kerze
      if (look.kind === 'wax') {
        const cx = x + w / 2 + ox / 2;
        const cy = y0 + oy / 2;
        gx.strokeStyle = '#2b2118';
        gx.lineWidth = Math.max(1.4, w / 30);
        gx.lineCap = 'round';
        gx.beginPath();
        gx.moveTo(cx, cy);
        gx.quadraticCurveTo(cx + w * 0.03, cy - h * 0.08, cx - w * 0.01, cy - Math.max(5, h * 0.13));
        gx.stroke();
      }
      gx.restore();
    }

    /* ================================================================== */
    /* Versuch 1: Schwimmen, Schweben, Sinken                              */
    /* ================================================================== */
    const tank = () => ({
      area: TANK.W * TANK.D,
      liquid: TANK.W * TANK.D * TANK.h0 - (obj() === 'ship' ? shipWater : 0),
      rho: toSI(liqRho()),
    });
    let mo: Motion = { z: TANK.H + 0.04, v: 0 };
    let bx = TANK.W * 0.46;
    /** Wasser, das über die Bordwand ins Schiff gelaufen ist (m³). */
    let shipWater = 0;
    const flooded = () => shipWater > 2e-6;
    let fillAct = p.fill / 100;
    const stepper = new FixedStepper(0.0005);
    /** Amplitude (m) und Geschwindigkeit der stehenden Wellen 1 … MODES. */
    const waveA = new Float64Array(MODES + 1);
    const waveV = new Float64Array(MODES + 1);
    let lastSub = 0;
    let droplets: Droplet[] = [];
    let bubbles: Bubble[] = [];
    let wasUnder = false;
    let floatDrag: {
      dx: number;
      dz: number;
      lastX: number;
      lastZ: number;
      vz: number;
      t: number;
    } | null = null;

    /** Abmessungen (m) des Körpers im Becken: Breite im Bild, Tiefe, Höhe. */
    function floatDims(): { w: number; d: number; h: number } {
      if (obj() === 'ship') return { w: SHIP.L, d: SHIP.B, h: SHIP.H };
      if (obj() === 'sub') return { w: 2 * SUB.R + SUB.Lc, d: 2 * SUB.R, h: 2 * SUB.R };
      const a = Math.cbrt(cm3(p.V));
      return { w: a, d: a, h: a };
    }

    /** Masse und Form des Körpers im Becken. */
    function floatBody(): TankBody {
      const rhoFl = toSI(liqRho());
      if (obj() === 'ship') {
        // Wasser im Rumpf zählt zur Masse; verdrängt wird mit dem ganzen Außenvolumen
        return {
          massKg: SHIP.hullKg + p.load / 1000 + shipWater * rhoFl,
          shape: box(SHIP.L, SHIP.B, SHIP.H),
        };
      }
      if (obj() === 'sub') return { massKg: subMass(fillAct, rhoFl), shape: subShape() };
      const V = cm3(p.V);
      return { massKg: toSI(bodyRho()) * V, shape: cube(V) };
    }

    /** Mittlere Dichte des Körpers in g/cm³ (Schiff: Masse durch Außenvolumen). */
    function floatMeanRho(): number {
      if (obj() === 'ship') return (SHIP.hullKg + p.load / 1000) / (SHIP.L * SHIP.B * SHIP.H) / 1000;
      if (obj() === 'sub') return subMass(p.fill / 100, toSI(liqRho())) / subShape().volume / 1000;
      return bodyRho();
    }
    function floatTargetState(): FloatState {
      if (obj() === 'ship') return shipState(p.load / 1000, toSI(liqRho())).draught === null ? 'sink' : 'float';
      if (obj() === 'sub') {
        const hf = hoverFill(toSI(liqRho()));
        if (hf !== null && Math.abs(p.fill / 100 - hf) < 5e-3) return 'hover';
      }
      return floatState(floatMeanRho(), liqRho());
    }

    function floatLevel(): number {
      return tankLevel(tank().liquid, tank().area, floatBody().shape, mo.z);
    }

    function resetWaves(): void {
      waveA.fill(0);
      waveV.fill(0);
      droplets = [];
      bubbles = [];
    }

    /** Ruhelage (für reduzierte Bewegung und zum Prüfen, ob noch etwas läuft). */
    function floatRest(): number {
      const body = floatBody();
      const t = tank();
      const dEq = equilibriumDepth(body.shape, body.massKg, t.rho);
      if (dEq === null || floatTargetState() === 'sink') return 0;
      const level = (t.liquid + body.shape.submerged(dEq)) / t.area;
      return Math.max(0, level - dEq);
    }

    function dropBody(fromAbove = true): void {
      floatDrag = null;
      if (obj() === 'ship') shipWater = 0;
      if (prefersReducedMotion()) {
        mo = { z: floatRest(), v: 0 };
        resetWaves();
      } else
        mo = {
          z: fromAbove ? (obj() === 'ship' ? floatRest() + 0.006 : TANK.H + 0.03) : mo.z,
          v: 0,
        };
      lastSub = floatBody().shape.submerged(floatLevel() - mo.z);
      ctx.requestRender();
    }

    function dunkBody(): void {
      floatDrag = null;
      const level = floatLevel();
      const h = floatDims().h;
      mo = { z: Math.max(0.01, level - h - 0.04), v: 0 };
      if (prefersReducedMotion()) {
        mo = { z: floatRest(), v: 0 };
        resetWaves();
      }
      lastSub = floatBody().shape.submerged(floatLevel() - mo.z);
      ctx.requestRender();
    }

    /** Bewegung, Wellen, Tropfen und Blasen um dt (s) weiterrechnen. */
    function stepFloat(dt: number): boolean {
      const t = tank();
      const dims = floatDims();
      const rate = p.slow ? 0.25 : 1;
      const h = dt * rate;
      // Pumpe des U-Boots (20 % je Sekunde)
      const fillTarget = p.fill / 100;
      if (obj() === 'sub' && Math.abs(fillAct - fillTarget) > 1e-6) {
        const stepF = 0.2 * h;
        fillAct = Math.abs(fillTarget - fillAct) <= stepF || prefersReducedMotion() ? fillTarget : fillAct + Math.sign(fillTarget - fillAct) * stepF;
      }
      let body = floatBody();
      if (prefersReducedMotion() && !floatDrag) {
        mo = { z: floatRest(), v: 0 };
        resetWaves();
        return false;
      }
      if (!floatDrag) {
        stepper.run(h, (hh) => {
          mo = stepBody(body, t, mo, hh);
        });
      }
      // Schiff läuft voll, wenn Wasser über die Bordwand steigt; gehoben läuft es wieder leer
      const level = tankLevel(t.liquid, t.area, body.shape, mo.z);
      if (obj() === 'ship') {
        const head = level - mo.z - SHIP.H;
        if (head > 0) shipWater = Math.min(SHIP_INNER, shipWater + shipInflow(head) * h);
        else if (mo.z > level + 0.003 && shipWater > 0) shipWater = Math.max(0, shipWater - 0.002 * h);
        body = floatBody();
      }
      // Wellen: Volumenstrom durch die Oberfläche regt die Eigenschwingungen an
      const subNow = body.shape.submerged(level - mo.z);
      const q = h > 0 ? (subNow - lastSub) / h : 0;
      lastSub = subNow;
      const k0 = Math.PI / TANK.W;
      const depth = level;
      const halfW = dims.w / 2;
      const substeps = Math.max(1, Math.ceil(h / 0.004));
      const hh = h / substeps;
      for (let s = 0; s < substeps; s++) {
        for (let m = 1; m <= MODES; m++) {
          const k = k0 * m;
          const om = sloshOmega(m, TANK.W, depth);
          // Quelle über die Breite des Körpers verteilt (Mittelwert von cos(kx)); der
          // gleichmäßige Anteil (mittlerer Wasserstand) steckt schon in tankLevel
          const src = Math.abs(k * halfW) > 1e-9 ? (Math.sin(k * (bx + halfW)) - Math.sin(k * (bx - halfW))) / (2 * k * halfW) : Math.cos(k * bx);
          const source = ((2 * SLOSH_GAIN) / (TANK.W * TANK.D)) * q * src;
          const a0 = waveA[m] ?? 0;
          const v0 = waveV[m] ?? 0;
          const v1 = v0 + (-om * om * a0 - 2 * SLOSH_DECAY * v0) * hh;
          waveV[m] = v1;
          waveA[m] = clamp(a0 + (v1 + source) * hh, -0.012, 0.012);
        }
      }
      // Spritzer beim schnellen Eintauchen, Blasen beim Untertauchen
      const under = level - mo.z > dims.h;
      const crossing = level - mo.z > 0 && level - mo.z < dims.h;
      if (crossing && mo.v < -0.35 && droplets.length < 60 && !floatDrag) {
        const count = Math.round(clamp(-mo.v * 10, 2, 9));
        for (let i = 0; i < count; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          droplets.push({
            x: bx + side * (halfW + 0.004),
            y: level,
            vx: side * (0.15 + Math.random() * 0.5) * -mo.v * 0.7,
            vy: (0.4 + Math.random() * 0.8) * -mo.v * 0.75,
            r: 0.0015 + Math.random() * 0.0025,
          });
        }
      }
      if (under && !wasUnder && bubbles.length < 30) {
        for (let i = 0; i < 7; i++)
          bubbles.push({
            x: bx + (Math.random() - 0.5) * dims.w * 0.8,
            y: mo.z + dims.h,
            r: 0.002 + Math.random() * 0.003,
            vy: 0.12 + Math.random() * 0.1,
            wob: Math.random() * 6,
          });
      }
      wasUnder = under;
      if (obj() === 'sub' && Math.abs(fillAct - p.fill / 100) > 1e-6 && fillAct > p.fill / 100 && bubbles.length < 40 && Math.random() < 0.5) {
        bubbles.push({
          x: bx - dims.w * 0.1 + (Math.random() - 0.5) * 0.02,
          y: mo.z + dims.h * 0.3,
          r: 0.0015 + Math.random() * 0.002,
          vy: 0.15,
          wob: Math.random() * 6,
        });
      }
      droplets = droplets.filter((dp) => {
        dp.vy -= G * h;
        dp.x += dp.vx * h;
        dp.y += dp.vy * h;
        return dp.y > level - 0.002 && dp.x > 0 && dp.x < TANK.W;
      });
      bubbles = bubbles.filter((b) => {
        b.y += b.vy * h;
        b.wob += h * 8;
        return b.y < level;
      });
      const waves = waveA.some((a, i) => i > 0 && Math.abs(a) > 2e-5) || waveV.some((v, i) => i > 0 && Math.abs(v) > 2e-4);
      const moving = Math.abs(mo.v) > 2e-4 || Math.abs(mo.z - floatRest()) > 2e-4;
      const pumping = obj() === 'sub' && Math.abs(fillAct - p.fill / 100) > 1e-6;
      return waves || moving || droplets.length > 0 || bubbles.length > 0 || pumping || !!floatDrag;
    }

    /** Auslenkung der Oberfläche an der Stelle x (m). */
    function eta(x: number): number {
      let s = 0;
      for (let m = 1; m <= MODES; m++) s += (waveA[m] ?? 0) * Math.cos((m * Math.PI * x) / TANK.W);
      return s;
    }

    interface FloatGeo {
      r: Rect;
      k: number;
      /** Pixel der vorderen unteren linken Innenecke des Beckens. */
      x0: number;
      y0: number;
      ox: number;
      oy: number;
      /** Vorderseite des Körpers (Pixel) und Verschiebung seiner Vorderseite gegenüber der Beckenvorderseite. */
      body: Rect;
      bodyShift: Pt;
    }
    let fgeo: FloatGeo | null = null;

    function floatGeo(r: Rect): FloatGeo {
      const sm = small();
      const top = sm ? 44 : 56;
      const bottom = sm ? 26 : 34;
      const extraTop = 0.07;
      const k = Math.min((r.w - (sm ? 24 : 56)) / (TANK.W + TANK.D * OBL[0]), (r.h - top - bottom) / (TANK.H + extraTop - TANK.D * OBL[1]));
      const ox = TANK.D * k * OBL[0];
      const oy = TANK.D * k * OBL[1];
      const x0 = r.x + (r.w - (TANK.W * k + ox)) / 2;
      const y0 = r.y + r.h - bottom;
      const dims = floatDims();
      const frac = (TANK.D - dims.d) / 2 / TANK.D;
      const shift: Pt = [ox * frac, oy * frac];
      const bxPx = x0 + (bx - dims.w / 2) * k + shift[0];
      const byPx = y0 - (mo.z + dims.h) * k + shift[1];
      return {
        r,
        k,
        x0,
        y0,
        ox,
        oy,
        body: { x: bxPx, y: byPx, w: dims.w * k, h: dims.h * k },
        bodyShift: shift,
      };
    }

    function drawShip(x: number, yBottom: number, w: number, h: number, d: number, alpha: number, waterInside: number): void {
      const gx = g();
      const dark = ctx.theme.dark;
      const ox = d * OBL[0];
      const oy = d * OBL[1];
      const y0 = yBottom - h;
      const steel = dark ? '#8a97a6' : '#7d8b9b';
      gx.save();
      gx.globalAlpha *= alpha;
      // Innenraum (oben offen): Rückwand und Boden innen
      gx.fillStyle = shade(steel, -0.45);
      gx.beginPath();
      gx.moveTo(x + 3, y0);
      gx.lineTo(x + 3 + ox, y0 + oy);
      gx.lineTo(x + w - 3 + ox, y0 + oy);
      gx.lineTo(x + w - 3, y0);
      gx.closePath();
      gx.fill();
      // Wasser im Rumpf
      if (waterInside > 0) {
        const lc = liquidColor();
        gx.fillStyle = withAlpha(lc.c, Math.min(0.9, lc.a + 0.3));
        const wy = y0 + (1 - waterInside) * h * 0.85;
        gx.beginPath();
        gx.moveTo(x + 3, wy);
        gx.lineTo(x + 3 + ox, wy + oy);
        gx.lineTo(x + w - 3 + ox, wy + oy);
        gx.lineTo(x + w - 3, wy);
        gx.closePath();
        gx.fill();
      }
      // Ladung: Massestücke im Rumpf
      const pieces = Math.min(12, Math.round(p.load / 100));
      for (let i = 0; i < pieces; i++) {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const pw = (w - 16) / 6;
        const px = x + 8 + col * pw + ox * 0.5;
        const py = y0 + oy * 0.5 - row * 6 - 4;
        const brass = gx.createLinearGradient(px, 0, px + pw - 2, 0);
        brass.addColorStop(0, '#8d6a24');
        brass.addColorStop(0.35, '#f0d27a');
        brass.addColorStop(1, '#7c5b1c');
        gx.fillStyle = brass;
        roundRect(gx, px, py, pw - 2, 6, 1.5);
        gx.fill();
      }
      // rechte Seite (Heck rechts? Bug rechts, abgeschrägt)
      gx.fillStyle = shade(steel, -0.25);
      gx.beginPath();
      gx.moveTo(x + w, y0);
      gx.lineTo(x + w + ox, y0 + oy);
      gx.lineTo(x + w + ox - h * 0.25, yBottom + oy);
      gx.lineTo(x + w - h * 0.25, yBottom);
      gx.closePath();
      gx.fill();
      // Bordwand vorn
      const front = gx.createLinearGradient(0, y0, 0, yBottom);
      front.addColorStop(0, mixColor(steel, '#ffffff', 0.25));
      front.addColorStop(0.5, steel);
      front.addColorStop(1, shade(steel, -0.3));
      gx.fillStyle = front;
      gx.beginPath();
      gx.moveTo(x, y0);
      gx.lineTo(x + w, y0);
      gx.lineTo(x + w - h * 0.25, yBottom);
      gx.lineTo(x + h * 0.12, yBottom);
      gx.closePath();
      gx.fill();
      gx.strokeStyle = shade(steel, -0.5, 0.8);
      gx.lineWidth = 1;
      gx.stroke();
      // Reling-Kante und Nieten
      gx.fillStyle = 'rgba(255,255,255,0.35)';
      gx.fillRect(x + 1, y0 + 1, w - 2, 1.5);
      gx.fillStyle = shade(steel, -0.5, 0.7);
      for (let i = 1; i < 10; i++) {
        gx.beginPath();
        gx.arc(x + (i / 10) * w, y0 + 4, 1, 0, Math.PI * 2);
        gx.fill();
      }
      // roter Unterwasseranstrich
      gx.save();
      gx.beginPath();
      gx.moveTo(x, y0);
      gx.lineTo(x + w, y0);
      gx.lineTo(x + w - h * 0.25, yBottom);
      gx.lineTo(x + h * 0.12, yBottom);
      gx.closePath();
      gx.clip();
      gx.fillStyle = dark ? 'rgba(190,70,60,0.55)' : 'rgba(180,55,45,0.55)';
      gx.fillRect(x, yBottom - h * 0.42, w, h * 0.42);
      gx.restore();
      gx.restore();
    }

    function drawSub(x: number, yBottom: number, w: number, h: number, d: number, alpha: number): void {
      const gx = g();
      const dark = ctx.theme.dark;
      const R = h / 2;
      const cy = yBottom - R;
      const yellow = dark ? '#e7bb3a' : '#f0c234';
      gx.save();
      gx.globalAlpha *= alpha;
      void d;
      // Turm
      const tw = w * 0.2;
      const tx = x + w * 0.52;
      gx.fillStyle = shade(yellow, -0.08);
      roundRect(gx, tx, cy - R - R * 0.55, tw, R * 0.75, 4);
      gx.fill();
      gx.strokeStyle = shade(yellow, -0.45);
      gx.lineWidth = 1;
      gx.stroke();
      gx.strokeStyle = shade(yellow, -0.5);
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.moveTo(tx + tw * 0.6, cy - R - R * 0.55);
      gx.lineTo(tx + tw * 0.6, cy - R - R * 0.95);
      gx.lineTo(tx + tw * 0.85, cy - R - R * 0.95);
      gx.stroke();
      // Rumpf (Kapsel)
      const body = gx.createLinearGradient(0, cy - R, 0, cy + R);
      body.addColorStop(0, mixColor(yellow, '#ffffff', 0.45));
      body.addColorStop(0.4, yellow);
      body.addColorStop(1, shade(yellow, -0.35));
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 3;
      gx.fillStyle = body;
      roundRect(gx, x, cy - R, w, 2 * R, R);
      gx.fill();
      gx.restore();
      gx.strokeStyle = shade(yellow, -0.45);
      gx.lineWidth = 1;
      roundRect(gx, x + 0.5, cy - R + 0.5, w - 1, 2 * R - 1, R);
      gx.stroke();
      // Tauchzelle als Sichtfenster mit Wasserstand
      const cw = w * 0.36;
      const cx0 = x + w * 0.12;
      const ch = R * 1.05;
      const cy0 = cy - ch / 2;
      gx.fillStyle = dark ? 'rgba(20,28,40,0.85)' : 'rgba(240,246,250,0.9)';
      roundRect(gx, cx0, cy0, cw, ch, 4);
      gx.fill();
      const lc = LIQ_LOOK[liq()];
      gx.fillStyle = withAlpha(lc.c, Math.min(0.95, lc.a + 0.35));
      const fh = ch * fillAct;
      gx.save();
      roundRect(gx, cx0, cy0, cw, ch, 4);
      gx.clip();
      gx.fillRect(cx0, cy0 + ch - fh, cw, fh);
      gx.restore();
      gx.strokeStyle = shade(yellow, -0.5);
      gx.lineWidth = 1.2;
      roundRect(gx, cx0, cy0, cw, ch, 4);
      gx.stroke();
      // Bullaugen
      for (let i = 0; i < 2; i++) {
        const px = x + w * (0.62 + i * 0.13);
        gx.fillStyle = dark ? '#2b3a4c' : '#3a5468';
        gx.beginPath();
        gx.arc(px, cy, R * 0.22, 0, Math.PI * 2);
        gx.fill();
        gx.strokeStyle = shade(yellow, -0.5);
        gx.lineWidth = 1.4;
        gx.stroke();
        gx.fillStyle = 'rgba(255,255,255,0.45)';
        gx.beginPath();
        gx.arc(px - R * 0.07, cy - R * 0.07, R * 0.07, 0, Math.PI * 2);
        gx.fill();
      }
      // Schraube
      gx.fillStyle = shade(yellow, -0.4);
      gx.beginPath();
      gx.ellipse(x - 3, cy, 3, R * 0.55, 0, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
    }

    function drawFloatScene(r: Rect): void {
      const gx = g();
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = small();
      const geo = floatGeo(r);
      fgeo = geo;
      const { k, x0, y0, ox, oy } = geo;
      const X = (x: number) => x0 + x * k;
      const Y = (z: number) => y0 - z * k;
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      wallAndTable(r, y0 + 8);
      const appear = stage(0, 0.5);
      gx.globalAlpha = appear;
      const body = floatBody();
      const t = tank();
      const level = tankLevel(t.liquid, t.area, body.shape, mo.z);
      const dims = floatDims();
      const lc = liquidColor();
      // Schatten des Beckens
      gx.save();
      gx.fillStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(30,40,55,0.16)';
      gx.beginPath();
      gx.ellipse(X(TANK.W / 2) + ox / 2, y0 + 9, (TANK.W * k) / 2 + 26, 7, 0, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
      // Rückwand und Boden des Beckens (Glas)
      const glassBack = dark ? 'rgba(190,215,235,0.06)' : 'rgba(200,225,240,0.22)';
      gx.fillStyle = glassBack;
      gx.fillRect(X(0) + ox, Y(TANK.H) + oy, TANK.W * k, TANK.H * k);
      gx.fillStyle = dark ? 'rgba(190,215,235,0.1)' : 'rgba(180,205,225,0.35)';
      gx.beginPath();
      gx.moveTo(X(0), y0);
      gx.lineTo(X(0) + ox, y0 + oy);
      gx.lineTo(X(TANK.W) + ox, y0 + oy);
      gx.lineTo(X(TANK.W), y0);
      gx.closePath();
      gx.fill();
      // Flüssigkeit hinten (Rückwand) und Oberfläche
      const surf = (x: number) => Y(level + eta(x));
      const NS = 48;
      gx.fillStyle = withAlpha(lc.c, lc.a * 0.75);
      gx.beginPath();
      gx.moveTo(X(0) + ox, y0 + oy);
      for (let i = 0; i <= NS; i++) {
        const x = (i / NS) * TANK.W;
        gx.lineTo(X(x) + ox, surf(x) + oy);
      }
      gx.lineTo(X(TANK.W) + ox, y0 + oy);
      gx.closePath();
      gx.fill();
      // Oberfläche (von schräg oben gesehen)
      const top = gx.createLinearGradient(0, Y(level) + oy, 0, Y(level));
      top.addColorStop(0, withAlpha(mixColor(lc.c, '#ffffff', 0.5), Math.min(1, lc.a + 0.25)));
      top.addColorStop(1, withAlpha(mixColor(lc.c, '#ffffff', 0.2), Math.min(1, lc.a + 0.15)));
      gx.fillStyle = top;
      gx.beginPath();
      for (let i = 0; i <= NS; i++) {
        const x = (i / NS) * TANK.W;
        if (i === 0) gx.moveTo(X(x), surf(x));
        else gx.lineTo(X(x), surf(x));
      }
      for (let i = NS; i >= 0; i--) {
        const x = (i / NS) * TANK.W;
        gx.lineTo(X(x) + ox, surf(x) + oy);
      }
      gx.closePath();
      gx.fill();
      // Wasserstand ohne Körper (gestrichelt an der Rückwand)
      const rise = (level - TANK.h0) * 1000;
      if (rise > 0.4) {
        gx.save();
        gx.strokeStyle = withAlpha(theme.muted, 0.8);
        gx.setLineDash([4, 4]);
        gx.lineWidth = 1.2;
        gx.beginPath();
        gx.moveTo(X(TANK.W) - 70, Y(TANK.h0));
        gx.lineTo(X(TANK.W) - 3, Y(TANK.h0));
        gx.stroke();
        gx.restore();
      }

      // Vergleichswürfel beim Schiff: gleicher Stahl als Klumpen
      if (obj() === 'ship') {
        const a = Math.cbrt(steelVolume());
        const lx = X(TANK.W - 0.045) - (a * k) / 2 + geo.bodyShift[0];
        drawBlock(lx, y0 + geo.bodyShift[1] * 0.2, a * k, a * k, a * k, 'iron', 1, 11);
      }

      // Körper
      const bRect = geo.body;
      const bAlpha = 1;
      const bodyBottomPx = bRect.y + bRect.h;
      if (obj() === 'ship') {
        const inside = clamp(shipWater / SHIP_INNER, 0, 1);
        drawShip(bRect.x, bodyBottomPx, bRect.w, bRect.h, dims.d * k, bAlpha, inside);
      } else if (obj() === 'sub') drawSub(bRect.x, bodyBottomPx, bRect.w, bRect.h, dims.d * k, bAlpha);
      else {
        const mat = bodyMat();
        if (matFade.running) {
          drawBlock(bRect.x, bodyBottomPx, bRect.w, bRect.h, dims.d * k, matFrom, 1 - matFade.value, 5);
          drawBlock(bRect.x, bodyBottomPx, bRect.w, bRect.h, dims.d * k, mat, matFade.value, 5);
        } else drawBlock(bRect.x, bodyBottomPx, bRect.w, bRect.h, dims.d * k, mat, bAlpha, 5);
      }
      // Flüssigkeit vor dem Körper: eingetauchten Teil tönen (nur die Umrisse des Körpers)
      const wl = Y(level) + geo.bodyShift[1];
      if (wl < bodyBottomPx) {
        const dpx = dims.d * k;
        gx.save();
        gx.beginPath();
        if (obj() === 'sub') roundRect(gx, bRect.x - 4, bRect.y - bRect.h * 0.5, bRect.w + 6, bRect.h * 1.5 + 2, bRect.h / 2);
        else {
          gx.moveTo(bRect.x, bodyBottomPx);
          gx.lineTo(bRect.x, bRect.y);
          gx.lineTo(bRect.x + dpx * OBL[0], bRect.y + dpx * OBL[1]);
          gx.lineTo(bRect.x + bRect.w + dpx * OBL[0], bRect.y + dpx * OBL[1]);
          gx.lineTo(bRect.x + bRect.w + dpx * OBL[0], bodyBottomPx + dpx * OBL[1]);
          gx.lineTo(bRect.x + bRect.w, bodyBottomPx);
          gx.closePath();
        }
        gx.clip();
        gx.fillStyle = withAlpha(lc.c, liq() === 'mercury' ? 0.85 : lc.a * 0.55);
        gx.fillRect(bRect.x - 8, wl, bRect.w + dpx + 16, bodyBottomPx - wl + 4);
        gx.restore();
      }
      // Blasen und Tropfen
      for (const b of bubbles) {
        const px = X(b.x + Math.sin(b.wob) * 0.002) + geo.bodyShift[0];
        const py = Y(b.y) + geo.bodyShift[1];
        gx.strokeStyle = 'rgba(255,255,255,0.75)';
        gx.lineWidth = 1;
        gx.beginPath();
        gx.arc(px, py, Math.max(1.5, b.r * k), 0, Math.PI * 2);
        gx.stroke();
      }
      // Flüssigkeit vorn
      const front = gx.createLinearGradient(0, Y(level), 0, y0);
      front.addColorStop(0, withAlpha(lc.c, lc.a * 0.75));
      front.addColorStop(1, withAlpha(shade(lc.c, -0.25), Math.min(1, lc.a * 1.25)));
      gx.fillStyle = front;
      gx.beginPath();
      gx.moveTo(X(0), y0);
      for (let i = 0; i <= NS; i++) {
        const x = (i / NS) * TANK.W;
        gx.lineTo(X(x), surf(x));
      }
      gx.lineTo(X(TANK.W), y0);
      gx.closePath();
      gx.fill();
      gx.strokeStyle = withAlpha(mixColor(lc.c, '#ffffff', 0.55), 0.9);
      gx.lineWidth = 1.6;
      gx.beginPath();
      for (let i = 0; i <= NS; i++) {
        const x = (i / NS) * TANK.W;
        if (i === 0) gx.moveTo(X(x), surf(x));
        else gx.lineTo(X(x), surf(x));
      }
      gx.stroke();
      for (const dp of droplets) {
        gx.fillStyle = withAlpha(mixColor(lc.c, '#ffffff', 0.35), Math.min(1, lc.a + 0.4));
        gx.beginPath();
        gx.arc(X(dp.x) + geo.bodyShift[0], Y(dp.y) + geo.bodyShift[1], Math.max(1.6, dp.r * k), 0, Math.PI * 2);
        gx.fill();
      }
      // Glas vorn: Kanten und Glanzlichter
      gx.strokeStyle = dark ? 'rgba(200,225,245,0.55)' : 'rgba(90,120,145,0.55)';
      gx.lineWidth = 1.4;
      gx.strokeRect(X(0), Y(TANK.H), TANK.W * k, TANK.H * k);
      gx.beginPath();
      gx.moveTo(X(0), Y(TANK.H));
      gx.lineTo(X(0) + ox, Y(TANK.H) + oy);
      gx.lineTo(X(TANK.W) + ox, Y(TANK.H) + oy);
      gx.lineTo(X(TANK.W), Y(TANK.H));
      gx.moveTo(X(TANK.W) + ox, Y(TANK.H) + oy);
      gx.lineTo(X(TANK.W) + ox, y0 + oy);
      gx.lineTo(X(TANK.W), y0);
      gx.stroke();
      const gl = gx.createLinearGradient(X(0), 0, X(0) + TANK.W * k * 0.25, 0);
      gl.addColorStop(0, 'rgba(255,255,255,0.32)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      gx.fillStyle = gl;
      gx.fillRect(X(0) + 3, Y(TANK.H) + 3, TANK.W * k * 0.2, TANK.H * k - 6);
      // Sockel
      gx.fillStyle = dark ? '#2b3340' : '#3c4552';
      roundRect(gx, X(0) - 6, y0, TANK.W * k + 12, 6, 2);
      gx.fill();

      // Steigung des Wasserstands
      if (rise > 0.4) {
        label(tr('rise', { h: n(rise, 1) }), X(TANK.W) - 6, Y(TANK.H) + (sm ? 12 : 15), sm ? 10.5 : 11.5, theme.muted, 'right', r);
      }

      // Kraftpfeile
      // Kraftpfeile und Eintauchanteil: Etiketten weichen einander und den Pfeilen aus
      const labs: Lab[] = [];
      const obstacles: Rect[] = [];
      if (p.arrows) drawFloatForces(geo, level, labs, obstacles);
      const st = floatTargetState();
      const depthNow = level - mo.z;
      const atRest = !floatDrag && Math.abs(mo.v) < 0.004 && Math.abs(mo.z - floatRest()) < 0.002;
      if (atRest && st === 'float' && depthNow > 0 && depthNow < dims.h && !ctx.isHidden('frac')) {
        const dEq = equilibriumDepth(body.shape, body.massKg, t.rho) ?? depthNow;
        const pct = (body.shape.submerged(dEq) / body.shape.volume) * 100;
        const bxp = bRect.x - 10;
        bracket(bxp, Y(level) + geo.bodyShift[1], bodyBottomPx, green(), 1);
        labs.push({ text: tr('under', { p: n(pct, 1) }), x: bxp - 6, y: (Y(level) + geo.bodyShift[1] + bodyBottomPx) / 2, align: 'right', color: green(), size: sm ? 10.5 : 12 });
      }
      const dpx = dims.d * k;
      obstacles.push({ x: bRect.x, y: bRect.y + dpx * OBL[1], w: bRect.w + dpx * OBL[0], h: bRect.h - dpx * OBL[1] });
      placeLabels(labs, obstacles, r);
      // Schiff: Freibord bzw. vollgelaufen; U-Boot: Tauchzelle
      if (obj() === 'ship') {
        if (shipWater > 0.95 * SHIP_INNER) pill(bRect.x + bRect.w / 2, bRect.y - (sm ? 30 : 36), ctx.t('flooded'), orange(), 'center', sm ? 10.5 : 11.5, false, r);
        else if (flooded()) pill(bRect.x + bRect.w / 2, bRect.y - (sm ? 30 : 36), tr('inHull', { v: n(shipWater * 1e6, 0) }), orange(), 'center', sm ? 10.5 : 11.5, false, r);
        else if (atRest && !flooded())
          label(
            tr('freeboard', {
              f: n(Math.max(0, (SHIP.H - depthNow) * 100), 1),
            }),
            bRect.x + bRect.w / 2,
            bRect.y - 12,
            sm ? 10.5 : 11.5,
            theme.muted,
            'center',
            r,
          );
        const a = Math.cbrt(steelVolume()) * k;
        const lx = X(TANK.W - 0.045) + geo.bodyShift[0];
        label(ctx.t('lump'), lx, y0 - a - (sm ? 26 : 30), sm ? 10 : 11, theme.muted, 'center', r);
        label(ctx.t('lumpSinks'), lx, y0 - a - (sm ? 13 : 15), sm ? 10 : 11, orange(), 'center', r);
      } else if (obj() === 'sub') {
        const pumping = Math.abs(fillAct - p.fill / 100) > 1e-6;
        label(pumping ? ctx.t('pump') : tr('tank', { p: n(fillAct * 100, 0) }), bRect.x + bRect.w * 0.3, bRect.y - 10, sm ? 10.5 : 11.5, pumping ? purple() : theme.muted, 'center', r);
      }

      // Kopfzeile: Zustand und Vergleich der Dichten
      const rhoK = floatMeanRho();
      const rhoF = liqRho();
      const cmp = st === 'hover' ? '=' : rhoK < rhoF ? '<' : '>';
      const head = sm ? `ρ_K ${cmp} ρ_Fl` : `ρ_K = ${rhoStr(rhoK)} g/cm³ ${cmp} ρ_Fl = ${rhoStr(rhoF)} g/cm³`;
      const size = sm ? 11 : 12.5;
      const left = pill(r.x + 10, r.y + 10, stateWord(st), stateColor(st), 'left', size, true, r);
      pill(left.x + left.w + 8, r.y + 10, head, theme.text, 'left', size, false, r);
      gx.restore();
    }

    interface Lab {
      text: string;
      x: number;
      y: number;
      align: 'left' | 'right' | 'center';
      color: string;
      size: number;
    }
    const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

    /**
     * Etiketten der Reihe nach setzen: Liegt eines auf einem schon gesetzten oder
     * einem Hindernis (Pfeil, Körper), wird es abwechselnd nach unten und oben
     * versetzt; alles bleibt innerhalb der Fläche.
     */
    function placeLabels(labs: Lab[], obstacles: Rect[], bounds: Rect): void {
      const placed = [...obstacles];
      for (const lb of labs) {
        const w = subW(lb.text, lb.size);
        const h = lb.size + 5;
        let rect: Rect = { x: 0, y: 0, w, h };
        for (let kTry = 0; kTry < 16; kTry++) {
          const dy = kTry === 0 ? 0 : (kTry % 2 === 1 ? 1 : -1) * Math.ceil(kTry / 2) * (h * 0.6);
          const y = clamp(lb.y + dy, bounds.y + h, bounds.y + bounds.h - h);
          const left = clamp(lb.align === 'left' ? lb.x : lb.align === 'right' ? lb.x - w : lb.x - w / 2, bounds.x + 4, bounds.x + bounds.w - 4 - w);
          rect = { x: left, y: y - h / 2, w, h };
          if (!placed.some((q) => overlaps(q, rect))) break;
        }
        placed.push(rect);
        sub(lb.text, rect.x, rect.y + h / 2, lb.size, lb.color, 'left', 700, ctx.theme.bg);
      }
    }

    /** Pfeil als Hindernis für Etiketten. */
    const arrowBox = (x: number, y0: number, y1: number): Rect => ({ x: x - 6, y: Math.min(y0, y1) - 2, w: 12, h: Math.abs(y1 - y0) + 4 });

    function drawFloatForces(geo: FloatGeo, level: number, labs: Lab[], obstacles: Rect[]): void {
      const sm = small();
      const body = floatBody();
      const t = tank();
      const depth = level - mo.z;
      const disp = body.shape.submerged(depth);
      const FG = weight(body.massKg);
      const FA = buoyancy(t.rho, disp);
      const FAmax = buoyancy(t.rho, body.shape.volume);
      const b = geo.body;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const bottom = geo.r.y + geo.r.h - 8;
      // Maßstab: gleich für alle Pfeile; F_G darf nicht aus dem Bild ragen
      const scale = Math.min((sm ? 70 : 100) / Math.max(FG, FAmax, 1e-6), Math.max(20, bottom - cy - 4) / Math.max(FG, 1e-6));
      const size = sm ? 10.5 : 11.5;
      const lw = sm ? 2.6 : 3.2;
      const off = Math.min(12, b.w * 0.18);
      const right = b.x + b.w + floatDims().d * geo.k * OBL[0] + 8;
      const left = b.x - 8;
      // Gewichtskraft am Schwerpunkt; Etikett rechts neben dem Körper auf Höhe der Pfeilspitze
      const lenG = Math.max(6, FG * scale);
      arrowPx(cx - off, cy, cx - off, cy + lenG, red(), lw);
      obstacles.push(arrowBox(cx - off, cy, cy + lenG));
      labs.push({ text: `F_G = ${fN(FG)} N`, x: right, y: Math.min(cy + lenG - 4, bottom - 6), align: 'left', color: red(), size });
      // Auftrieb am Mittelpunkt des eingetauchten Teils; Etikett links auf Höhe der Pfeilspitze
      if (FA > 1e-6) {
        const yb = b.y + b.h - (Math.min(depth, body.shape.height) * geo.k) / 2;
        const lenA = Math.max(6, FA * scale);
        arrowPx(cx + off, yb, cx + off, yb - lenA, blue(), lw);
        obstacles.push(arrowBox(cx + off, yb, yb - lenA));
        labs.push({ text: `F_A = ${fN(FA)} N`, x: left, y: Math.min(yb - lenA + 4, b.y - 4), align: 'right', color: blue(), size });
      }
      // Boden trägt den Rest (Pfeil rechts neben dem Körper)
      if (mo.z <= 1e-6 && !floatDrag && FG > FA + 1e-6) {
        const FN = FG - FA;
        const len = Math.max(6, FN * scale);
        const xN = right;
        arrowPx(xN, b.y + b.h, xN, b.y + b.h - len, green(), lw * 0.85, 9);
        obstacles.push(arrowBox(xN, b.y + b.h, b.y + b.h - len));
        labs.push({ text: `F_N = ${fN(FN)} N`, x: xN + 10, y: b.y + b.h - len + 6, align: 'left', color: green(), size });
      }
      // Hand beim Festhalten
      if (floatDrag) {
        const FH = FG - FA;
        if (Math.abs(FH) * scale > 4) {
          const len = Math.abs(FH) * scale;
          if (FH > 0) arrowPx(cx, b.y, cx, b.y - len, purple(), lw * 0.9, 9);
          else arrowPx(cx, b.y - len, cx, b.y, purple(), lw * 0.9, 9);
          obstacles.push(arrowBox(cx, b.y, b.y - len));
          labs.push({ text: tr('hand', { F: fN(Math.abs(FH)) }) + (FH > 0 ? ' ↑' : ' ↓'), x: cx, y: b.y - len - 10, align: 'center', color: purple(), size });
        }
      }
    }

    /* ---------- Dichteskala ---------- */
    interface LadderItem {
      id: string;
      rect: Rect;
    }
    let ladderItems: LadderItem[] = [];
    const LOG_LO = Math.log10(0.02);
    const LOG_HI = Math.log10(25);

    /** Senkrechte Abstände der Beschriftungen herstellen (mindestens `gap`), innerhalb [lo, hi]. */
    function spread(ys: number[], gap: number, lo: number, hi: number): number[] {
      const out = [...ys];
      for (let it = 0; it < 4; it++) {
        for (let i = 1; i < out.length; i++) out[i] = Math.max(out[i]!, out[i - 1]! + gap);
        if (out.length) out[out.length - 1] = Math.min(out[out.length - 1]!, hi);
        for (let i = out.length - 2; i >= 0; i--) out[i] = Math.min(out[i]!, out[i + 1]! - gap);
        if (out.length) out[0] = Math.max(out[0]!, lo);
      }
      return out;
    }

    function drawLadder(r: Rect, appear: number): void {
      const gx = g();
      const theme = ctx.theme;
      const sm = r.h < 300 || r.w < 240;
      gx.save();
      gx.globalAlpha = appear;
      card(r, blue());
      const title = sm ? ctx.t('ladderS') : ctx.t('ladder');
      text(gx, title, r.x + 14, r.y + 18, {
        font: `700 ${sm ? 12 : 13}px ${theme.font}`,
        color: theme.text,
        align: 'left',
      });
      const top = r.y + (sm ? 40 : 48);
      const bottom = r.y + r.h - (sm ? 14 : 22);
      const axisX = Math.round(r.x + r.w * 0.45);
      const yOf = (rho: number) => top + ((Math.log10(clamp(rho, 0.02, 25)) - LOG_LO) / (LOG_HI - LOG_LO)) * (bottom - top);
      const rhoF = liqRho();
      const yF = yOf(rhoF);
      // Zonen: leichter (oben) schwimmt, schwerer (unten) sinkt
      gx.fillStyle = withAlpha(green(), theme.dark ? 0.12 : 0.08);
      gx.fillRect(r.x + 8, top - 6, r.w - 16, yF - top + 6);
      gx.fillStyle = withAlpha(orange(), theme.dark ? 0.12 : 0.08);
      gx.fillRect(r.x + 8, yF, r.w - 16, bottom - yF + 6);
      // Achse mit Teilung
      gx.strokeStyle = withAlpha(theme.text, 0.35);
      gx.lineWidth = 1.5;
      gx.beginPath();
      gx.moveTo(axisX, top);
      gx.lineTo(axisX, bottom);
      gx.stroke();
      for (const v of [0.1, 1, 10]) {
        const y = yOf(v);
        gx.beginPath();
        gx.moveTo(axisX - 5, y);
        gx.lineTo(axisX + 5, y);
        gx.stroke();
      }
      ladderItems = [];
      const fs = sm ? 11 : 11.5;
      const gap = sm ? 12.5 : 14.5;
      // Flüssigkeiten links
      const liqs = LIQUIDS.map((id) => ({ id, y: yOf(LIQUID_DENSITY[id]) }));
      const ly = spread(
        liqs.map((q) => q.y),
        gap,
        top,
        bottom,
      );
      liqs.forEach((q, i) => {
        const cur = q.id === liq();
        const y = ly[i]!;
        const lab = `${loc(LIQ_NAME[q.id]).replace(' (Ethanol)', '').replace(' (ethanol)', '')} ${rhoStr(LIQUID_DENSITY[q.id])}`;
        const col = cur ? blue() : theme.muted;
        gx.strokeStyle = withAlpha(col, cur ? 1 : 0.6);
        gx.lineWidth = cur ? 2.2 : 1;
        gx.beginPath();
        gx.moveTo(axisX - 12, y);
        gx.lineTo(axisX - 4, q.y);
        gx.lineTo(axisX, q.y);
        gx.stroke();
        const w = subW(lab, fs, cur ? 700 : 500);
        const right = axisX - 15;
        const focus = ctx.keyFocus === `liq:${q.id}`;
        if (focus) {
          gx.strokeStyle = blue();
          gx.lineWidth = 1.5;
          roundRect(gx, right - w - 5, y - fs * 0.75, w + 10, fs * 1.5, 5);
          gx.stroke();
        }
        sub(lab, right, y, fs, col, 'right', cur ? 700 : 500);
        ladderItems.push({
          id: `liq:${q.id}`,
          rect: { x: right - w - 6, y: y - gap / 2, w: w + 14, h: gap },
        });
      });
      // aktuelle Flüssigkeit als Linie quer über die Karte
      gx.strokeStyle = blue();
      gx.lineWidth = 2;
      gx.setLineDash([5, 4]);
      gx.beginPath();
      gx.moveTo(axisX, yF);
      gx.lineTo(r.x + r.w - 10, yF);
      gx.stroke();
      gx.setLineDash([]);
      // Stoffe rechts
      const mats = MATERIALS.map((id) => ({
        id: id as MaterialId,
        y: yOf(MATERIAL_DENSITY[id]),
      }));
      const my = spread(
        mats.map((q) => q.y),
        gap,
        top,
        bottom,
      );
      const curMat = obj() === 'block' ? bodyMat() : null;
      mats.forEach((q, i) => {
        const cur = q.id === curMat;
        const y = my[i]!;
        const rho = MATERIAL_DENSITY[q.id as Exclude<MaterialId, 'own'>];
        const full = loc(MAT_NAME[q.id]).replace(' (PE)', '');
        const nm = MAT_SHORT[q.id] && (sm || full.length > 13) ? loc(MAT_SHORT[q.id]!) : full;
        const lab = `${nm} ${rhoStr(rho)}`;
        const floats = rho < rhoF;
        const dot = floats ? green() : orange();
        gx.fillStyle = cur ? dot : withAlpha(dot, 0.75);
        gx.beginPath();
        gx.arc(axisX, q.y, cur ? 5 : 3.2, 0, Math.PI * 2);
        gx.fill();
        if (cur) {
          gx.strokeStyle = theme.text;
          gx.lineWidth = 1.5;
          gx.beginPath();
          gx.arc(axisX, q.y, 8, 0, Math.PI * 2);
          gx.stroke();
        }
        gx.strokeStyle = withAlpha(theme.muted, 0.5);
        gx.lineWidth = 1;
        gx.beginPath();
        gx.moveTo(axisX + 4, q.y);
        gx.lineTo(axisX + 10, y);
        gx.lineTo(axisX + 14, y);
        gx.stroke();
        const w = subW(lab, fs, cur ? 700 : 500);
        const focus = ctx.keyFocus === `mat:${q.id}`;
        if (focus) {
          gx.strokeStyle = blue();
          gx.lineWidth = 1.5;
          roundRect(gx, axisX + 12, y - fs * 0.75, w + 10, fs * 1.5, 5);
          gx.stroke();
        }
        sub(lab, axisX + 17, y, fs, cur ? theme.text : withAlpha(theme.text, obj() === 'block' ? 0.82 : 0.4), 'left', cur ? 700 : 500);
        ladderItems.push({
          id: `mat:${q.id}`,
          rect: { x: axisX + 8, y: y - gap / 2, w: w + 16, h: gap },
        });
      });
      // eigene Dichte
      if (obj() === 'block' && p.mat === 'own') {
        const y = yOf(p.rk);
        gx.fillStyle = purple();
        gx.beginPath();
        gx.moveTo(axisX, y - 6);
        gx.lineTo(axisX + 6, y);
        gx.lineTo(axisX, y + 6);
        gx.lineTo(axisX - 6, y);
        gx.closePath();
        gx.fill();
      }
      // mittlere Dichte von Schiff und U-Boot
      if (obj() !== 'block') {
        const rho = floatMeanRho();
        const y = yOf(rho);
        gx.fillStyle = purple();
        gx.beginPath();
        gx.arc(axisX, y, 5.5, 0, Math.PI * 2);
        gx.fill();
        pill(axisX + 12, y - (fs + 11) / 2, `${obj() === 'ship' ? (de ? 'Schiff' : 'ship') : de ? 'U-Boot' : 'sub'} ${rhoStr(rho)}`, purple(), 'left', fs, true, r);
      }
      // Zonen beschriften
      if (!sm) {
        text(gx, `↑ ${ctx.t('zoneUp')}`, r.x + 14, top - 2 + 0, {
          font: `600 10.5px ${theme.font}`,
          color: green(),
          align: 'left',
        });
        text(gx, `↓ ${ctx.t('zoneDown')}`, r.x + 14, bottom + 10, {
          font: `600 10.5px ${theme.font}`,
          color: orange(),
          align: 'left',
        });
      }
      gx.restore();
    }

    /* ================================================================== */
    /* Versuch 2: Archimedes mit Überlaufgefäß                             */
    /* ================================================================== */
    let ov: Overflow = { inside: VESSEL_AREA * VESSEL.spout, caught: 0 };
    let dAct = 0;
    let archDrag: { y0: number; d0: number } | null = null;
    const archStepper = new FixedStepper(0.002);
    let shownF = 0;

    function archBody(): TankBody {
      const V = cm3(p.V);
      return { massKg: toSI(bodyRho()) * V, shape: cube(V) };
    }

    /** Lage der Unterkante (m über dem Gefäßboden), Wasserstand und ob der Faden locker ist. */
    function archState(): {
      z: number;
      level: number;
      slack: boolean;
      depth: number;
      FA: number;
      FG: number;
      F: number;
    } {
      const body = archBody();
      const rho = toSI(liqRho());
      const a = body.shape.height;
      const zHook = VESSEL.spout - (dAct / 100) * a;
      let z = zHook;
      let level = tankLevel(ov.inside, VESSEL_AREA, body.shape, z);
      let slack = false;
      const dEq = equilibriumDepth(body.shape, body.massKg, rho);
      if (dEq !== null && dEq < a && level - z > dEq) {
        // der Körper schwimmt: Unterkante in der Schwimmlage
        level = (ov.inside + body.shape.submerged(dEq)) / VESSEL_AREA;
        z = level - dEq;
        slack = z > zHook + 1e-6;
        if (!slack) {
          z = zHook;
          level = tankLevel(ov.inside, VESSEL_AREA, body.shape, z);
        }
      }
      const depth = clamp(level - z, 0, a);
      const FA = buoyancy(rho, body.shape.submerged(level - z));
      const FG = weight(body.massKg);
      return { z, level, slack, depth, FA, FG, F: Math.max(0, FG - FA) };
    }

    function refill(): void {
      const body = archBody();
      const a = body.shape.height;
      const z = VESSEL.spout - (dAct / 100) * a;
      ov = {
        inside: VESSEL_AREA * VESSEL.spout - body.shape.submerged(VESSEL.spout - z),
        caught: 0,
      };
      if (archState().slack) {
        const st = archState();
        ov = {
          inside: VESSEL_AREA * VESSEL.spout - body.shape.submerged(VESSEL.spout - st.z),
          caught: 0,
        };
      }
    }

    function resetArch(lower: boolean): void {
      dAct = 0;
      ov = { inside: VESSEL_AREA * VESSEL.spout, caught: 0 };
      if (!lower || prefersReducedMotion()) {
        dAct = p.d;
        settleArch();
      }
    }

    /** Sofort in den Endzustand (reduzierte Bewegung): Überlauf vollständig. */
    function settleArch(): void {
      for (let i = 0; i < 400; i++) {
        const st = archState();
        ov = stepOverflow(ov, VESSEL_AREA, VESSEL.spout, archBody().shape, st.z, 0.05);
      }
      shownF = archState().F;
    }

    function stepArch(dt: number): boolean {
      const rate = p.slow ? 0.25 : 1;
      const h = dt * rate;
      const target = p.d;
      if (prefersReducedMotion()) {
        dAct = target;
        settleArch();
        return false;
      }
      if (!archDrag && Math.abs(dAct - target) > 1e-6) {
        const sp = 45 * h; // 45 % der Würfelhöhe je Sekunde
        dAct = Math.abs(target - dAct) <= sp ? target : dAct + Math.sign(target - dAct) * sp;
      }
      let flowing = false;
      archStepper.run(h, (hh) => {
        const st = archState();
        const before = ov.caught;
        ov = stepOverflow(ov, VESSEL_AREA, VESSEL.spout, archBody().shape, st.z, hh);
        if (ov.caught - before > 1e-6 * hh) flowing = true;
      });
      const st = archState();
      shownF = shownF + (st.F - shownF) * (1 - Math.exp(-h * 9));
      if (Math.abs(shownF - st.F) < 1e-5) shownF = st.F;
      archFlow = flowing ? Math.min(1, archFlow + h * 6) : Math.max(0, archFlow - h * 4);
      return flowing || archFlow > 0 || Math.abs(dAct - target) > 1e-6 || Math.abs(shownF - st.F) > 1e-5 || !!archDrag;
    }
    let archFlow = 0;

    interface ArchGeo {
      k: number;
      floorY: number;
      vx: number;
      vBottom: number;
      hang: Rect;
      bodyRect: Rect;
    }
    let ageo: ArchGeo | null = null;

    function drawArchScene(r: Rect): void {
      const gx = g();
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = small();
      const appear = stage(0, 0.5);
      const body = archBody();
      const st = archState();
      const a = body.shape.height;
      const top = sm ? 40 : 50;
      const bottom = sm ? 22 : 30;
      const worldH = VESSEL.block + VESSEL.spout + 0.1 + 0.03 + 0.22;
      const worldW = 0.62;
      const k = Math.min((r.w - (sm ? 16 : 40)) / worldW, (r.h - top - bottom) / worldH);
      const floorY = r.y + r.h - bottom;
      const x0 = r.x + (r.w - worldW * k) / 2;
      const X = (x: number) => x0 + x * k;
      const Y = (z: number) => floorY - z * k;
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      wallAndTable(r, floorY + 2);
      gx.globalAlpha = appear;
      const lc = liquidColor();
      // Stativ
      const rodX = X(0.03);
      const metal = (xa: number, w: number) => {
        const m = gx.createLinearGradient(xa, 0, xa + w, 0);
        m.addColorStop(0, '#5d6570');
        m.addColorStop(0.45, '#d5dae1');
        m.addColorStop(1, '#5d6570');
        return m;
      };
      gx.fillStyle = dark ? '#2b3340' : '#3c4552';
      roundRect(gx, rodX - 18, floorY - 6, 0.16 * k, 8, 3);
      gx.fill();
      gx.fillStyle = metal(rodX - 4, 8);
      gx.fillRect(rodX - 4, r.y + top - 18, 8, floorY - 6 - (r.y + top - 18));
      // Klotz und Gefäß
      const vcx = X(0.2);
      const vR = VESSEL.R * k;
      const blockTop = Y(VESSEL.block);
      const wood = gx.createLinearGradient(0, blockTop, 0, floorY);
      wood.addColorStop(0, dark ? '#8a6640' : '#c89a64');
      wood.addColorStop(1, dark ? '#6b4e30' : '#a77b4b');
      gx.fillStyle = wood;
      roundRect(gx, vcx - vR - 10, blockTop, 2 * vR + 20, floorY - blockTop, 3);
      gx.fill();
      const vBottom = blockTop;
      const VY = (z: number) => vBottom - z * k;
      const ry = Math.max(3, vR * 0.16);
      // Flüssigkeit im Gefäß (hinter dem Körper)
      gx.fillStyle = withAlpha(lc.c, lc.a * 0.7);
      gx.fillRect(vcx - vR, VY(st.level), 2 * vR, st.level * k);
      gx.fillStyle = withAlpha(mixColor(lc.c, '#ffffff', 0.4), Math.min(1, lc.a + 0.2));
      gx.beginPath();
      gx.ellipse(vcx, VY(st.level), vR, ry, 0, 0, Math.PI * 2);
      gx.fill();
      // Körper
      const ap = a * k;
      const bodyBottom = VY(st.z);
      const bodyRect: Rect = {
        x: vcx - ap / 2 - ap * OBL[0] * 0.5,
        y: bodyBottom - ap,
        w: ap,
        h: ap,
      };
      drawBlock(bodyRect.x, bodyBottom, ap, ap, ap, bodyMat(), 1, 7);
      // eingetauchter Teil getönt
      const wl = VY(st.level);
      if (wl < bodyBottom) {
        gx.fillStyle = withAlpha(lc.c, liq() === 'mercury' ? 0.85 : lc.a * 0.85);
        gx.fillRect(bodyRect.x - 1, Math.max(wl, bodyRect.y + ap * OBL[1]), ap + ap * OBL[0] + 2, bodyBottom - Math.max(wl, bodyRect.y + ap * OBL[1]));
      }
      // Gefäßwand (Glas) und Ausguss
      gx.strokeStyle = dark ? 'rgba(200,225,245,0.6)' : 'rgba(90,120,145,0.6)';
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.moveTo(vcx - vR, VY(VESSEL.H));
      gx.lineTo(vcx - vR, vBottom);
      gx.ellipse(vcx, vBottom, vR, ry, 0, Math.PI, 0, true);
      gx.lineTo(vcx + vR, VY(VESSEL.H));
      gx.stroke();
      gx.beginPath();
      gx.ellipse(vcx, VY(VESSEL.H), vR, ry, 0, 0, Math.PI * 2);
      gx.stroke();
      const glare = gx.createLinearGradient(vcx - vR, 0, vcx - vR * 0.4, 0);
      glare.addColorStop(0, 'rgba(255,255,255,0.35)');
      glare.addColorStop(1, 'rgba(255,255,255,0)');
      gx.fillStyle = glare;
      gx.fillRect(vcx - vR + 2, VY(VESSEL.H) + 4, vR * 0.4, VESSEL.H * k - 8);
      // Flüssigkeit vorn
      gx.fillStyle = withAlpha(lc.c, lc.a * 0.6);
      gx.fillRect(vcx - vR, VY(st.level), 2 * vR, st.level * k);
      // Ausguss
      const spY = VY(VESSEL.spout);
      const spX0 = vcx + vR;
      const spX1 = spX0 + 0.06 * k;
      const spY1 = spY + 0.025 * k;
      gx.strokeStyle = dark ? 'rgba(200,225,245,0.75)' : 'rgba(90,120,145,0.75)';
      gx.lineWidth = Math.max(5, 0.012 * k);
      gx.lineCap = 'round';
      gx.beginPath();
      gx.moveTo(spX0 - 2, spY);
      gx.lineTo(spX1, spY1);
      gx.stroke();
      gx.lineCap = 'butt';
      // Waage mit Becher
      const bcx = X(0.47);
      const bR = BEAKER.R * k;
      const scaleTop = Y(BEAKER.scaleH);
      const sw = 0.18 * k;
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      gx.fillStyle = dark ? '#3a4452' : '#e9edf2';
      roundRect(gx, bcx - sw / 2, scaleTop, sw, floorY - scaleTop, 6);
      gx.fill();
      gx.restore();
      gx.fillStyle = dark ? '#5a6575' : '#c6cdd6';
      roundRect(gx, bcx - sw * 0.38, scaleTop - 4, sw * 0.76, 5, 2);
      gx.fill();
      // Anzeige der Waage
      const caughtG = ov.caught * 1e6 * liqRho();
      const lcdW = sw * 0.62;
      const lcdH = Math.max(14, (floorY - scaleTop) * 0.55);
      const lcdX = bcx - lcdW / 2;
      const lcdY = scaleTop + (floorY - scaleTop - lcdH) / 2;
      gx.fillStyle = dark ? '#1b2a22' : '#cfe3c8';
      roundRect(gx, lcdX, lcdY, lcdW, lcdH, 3);
      gx.fill();
      text(gx, `${f(caughtG, 1)} g`, lcdX + lcdW - 5, lcdY + lcdH / 2 + 0.5, {
        font: `700 ${Math.min(14, lcdH * 0.7)}px ${theme.font}`,
        color: dark ? '#9be7a5' : '#1f3b22',
        align: 'right',
      });
      // Becher
      const beakerBottom = scaleTop - 4;
      const BY = (z: number) => beakerBottom - z * k;
      const caughtH = ov.caught / (Math.PI * BEAKER.R * BEAKER.R);
      gx.fillStyle = withAlpha(lc.c, Math.min(0.95, lc.a + 0.15));
      gx.fillRect(bcx - bR, BY(caughtH), 2 * bR, caughtH * k);
      gx.strokeStyle = dark ? 'rgba(200,225,245,0.6)' : 'rgba(90,120,145,0.6)';
      gx.lineWidth = 1.4;
      gx.beginPath();
      gx.moveTo(bcx - bR, BY(BEAKER.H));
      gx.lineTo(bcx - bR, beakerBottom);
      gx.lineTo(bcx + bR, beakerBottom);
      gx.lineTo(bcx + bR, BY(BEAKER.H));
      gx.stroke();
      // Strahl aus dem Ausguss
      if (archFlow > 0.01) {
        gx.strokeStyle = withAlpha(mixColor(lc.c, '#ffffff', 0.15), Math.min(1, lc.a + 0.35) * archFlow);
        gx.lineWidth = 2 + archFlow * 3;
        gx.lineCap = 'round';
        gx.beginPath();
        gx.moveTo(spX1, spY1);
        const yEnd = BY(caughtH);
        gx.bezierCurveTo(spX1 + 0.025 * k, spY1, bcx - bR * 0.2, spY1 + (yEnd - spY1) * 0.2, bcx - bR * 0.15, yEnd);
        gx.stroke();
        gx.lineCap = 'butt';
      }
      // Kraftmesser über dem Körper
      const range = meterRange(st.FG);
      const hookTopY = bodyRect.y + ap * OBL[1] * 0.5 - 0.02 * k;
      const meterW = sm ? 14 : 18;
      const housingH = 0.13 * k;
      const extMax = 0.045 * k;
      const ext = (shownF / range) * extMax;
      const mcx = vcx;
      const rodBottom = hookTopY - 6;
      const housingBottom = rodBottom - ext - 4;
      const housingTop = housingBottom - housingH;
      // Faden
      const bodyTopY = bodyRect.y + ap * OBL[1] * 0.5;
      gx.strokeStyle = dark ? '#d8dde5' : '#4a5361';
      gx.lineWidth = 1.2;
      gx.beginPath();
      if (st.slack) {
        const zHookPx = VY(VESSEL.spout - (dAct / 100) * a) - ap;
        gx.moveTo(mcx, rodBottom);
        gx.bezierCurveTo(mcx + 10, (rodBottom + bodyTopY) / 2 + 6, mcx - 10, zHookPx, mcx, bodyTopY);
      } else {
        gx.moveTo(mcx, rodBottom);
        gx.lineTo(mcx, bodyTopY);
      }
      gx.stroke();
      // Haken und ausgezogene Skalenstange
      gx.fillStyle = '#fbfbf7';
      gx.fillRect(mcx - meterW * 0.28, housingBottom - 2, meterW * 0.56, ext + 6);
      gx.strokeStyle = red();
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(mcx - meterW * 0.28, housingBottom + ext * 0 + 1);
      gx.stroke();
      gx.strokeStyle = dark ? '#c3cbd6' : '#5d6570';
      gx.lineWidth = 1.8;
      gx.beginPath();
      gx.moveTo(mcx, housingBottom + ext + 4);
      gx.lineTo(mcx, rodBottom);
      gx.arc(mcx + 3, rodBottom, 3, Math.PI, Math.PI * 0.2, true);
      gx.stroke();
      // Gehäuse mit Skala
      const tube = gx.createLinearGradient(mcx - meterW / 2, 0, mcx + meterW / 2, 0);
      tube.addColorStop(0, withAlpha(green(), 0.75));
      tube.addColorStop(0.35, withAlpha(green(), 0.35));
      tube.addColorStop(1, withAlpha(green(), 0.85));
      gx.fillStyle = tube;
      roundRect(gx, mcx - meterW / 2, housingTop, meterW, housingH, 4);
      gx.fill();
      gx.strokeStyle = green();
      gx.lineWidth = 1.2;
      roundRect(gx, mcx - meterW / 2, housingTop, meterW, housingH, 4);
      gx.stroke();
      // Skala im Gehäuse: 0 oben, Messbereich unten
      gx.fillStyle = 'rgba(255,255,255,0.9)';
      gx.fillRect(mcx - meterW * 0.3, housingTop + 6, meterW * 0.6, housingH - 12);
      const scale0 = housingTop + 10;
      const scale1 = housingBottom - 10;
      gx.strokeStyle = '#2a313b';
      gx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = scale0 + ((scale1 - scale0) * i) / 10;
        gx.beginPath();
        gx.moveTo(mcx - meterW * 0.3, y);
        gx.lineTo(mcx - meterW * 0.3 + (i % 5 === 0 ? meterW * 0.4 : meterW * 0.22), y);
        gx.stroke();
      }
      // Zeiger (Marke an der Stange)
      const markY = scale0 + (scale1 - scale0) * clamp(shownF / range, 0, 1);
      gx.fillStyle = red();
      gx.beginPath();
      gx.moveTo(mcx + meterW * 0.32, markY);
      gx.lineTo(mcx + meterW * 0.62, markY - 4);
      gx.lineTo(mcx + meterW * 0.62, markY + 4);
      gx.closePath();
      gx.fill();
      gx.strokeStyle = red();
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(mcx - meterW * 0.3, markY);
      gx.lineTo(mcx + meterW * 0.34, markY);
      gx.stroke();
      // Ring und Arm
      const ringY = housingTop - 7;
      gx.strokeStyle = green();
      gx.lineWidth = 2.4;
      gx.beginPath();
      gx.arc(mcx, ringY, 5, 0, Math.PI * 2);
      gx.stroke();
      const armY = ringY - 9;
      gx.fillStyle = metal(0, 1);
      const arm = gx.createLinearGradient(0, armY - 3, 0, armY + 3);
      arm.addColorStop(0, '#d5dae1');
      arm.addColorStop(1, '#5d6570');
      gx.fillStyle = arm;
      gx.fillRect(rodX, armY - 3, mcx - rodX + 8, 6);
      gx.fillStyle = dark ? '#6b7584' : '#4a5361';
      roundRect(gx, rodX - 8, armY - 8, 16, 16, 3);
      gx.fill();
      gx.strokeStyle = dark ? '#c3cbd6' : '#5d6570';
      gx.lineWidth = 1.8;
      gx.beginPath();
      gx.moveTo(mcx, armY + 3);
      gx.lineTo(mcx, ringY - 5);
      gx.stroke();
      // Griff zum Ziehen
      const hang: Rect = {
        x: mcx - meterW / 2 - 14,
        y: housingTop - 18,
        w: meterW + 28,
        h: bodyBottom - housingTop + 18,
      };
      if (!ctx.locked) {
        gx.fillStyle = withAlpha(green(), archDrag ? 0.22 : 0.1);
        gx.beginPath();
        gx.arc(mcx, ringY, archDrag ? 15 : 12, 0, Math.PI * 2);
        gx.fill();
      }
      ageo = { k, floorY, vx: vcx, vBottom, hang, bodyRect };
      // Anzeigen
      const size = sm ? 11 : 12.5;
      const lx = mcx + meterW / 2 + 10;
      pill(lx, (housingTop + housingBottom) / 2 - (size + 11) / 2, `F = ${fN(shownF)} N`, green(), 'left', size, false, r);
      sub(tr('range', { r: n(range, 1) }), lx + 4, (housingTop + housingBottom) / 2 + size + 4, sm ? 10 : 11, theme.muted, 'left', 600, theme.bg);
      if (st.slack) pill(vcx, VY(VESSEL.H) - (sm ? 22 : 26), ctx.t('slack'), orange(), 'center', sm ? 10 : 11.5, false, r);
      label(tr('displaced', { v: n(ov.caught * 1e6, 1) }), bcx, BY(BEAKER.H) - 12, sm ? 10.5 : 11.5, blue(), 'center', r);
      sub(ctx.t('tare'), bcx, floorY + (sm ? 12 : 16), sm ? 10 : 10.5, theme.muted, 'center', 600);
      // Kraftpfeile am Körper
      if (p.arrows) {
        const scl = (sm ? 55 : 80) / Math.max(st.FG, buoyancy(toSI(liqRho()), body.shape.volume), 1e-6);
        const cx = bodyRect.x + ap / 2;
        const cy = bodyRect.y + ap / 2;
        const off = Math.min(10, ap * 0.2);
        arrowPx(cx - off, cy, cx - off, cy + Math.max(6, st.FG * scl), red(), sm ? 2.4 : 3);
        label(`F_G = ${fN(st.FG)} N`, cx - ap / 2 - 8, cy + 14, sm ? 10.5 : 11.5, red(), 'right', r);
        if (st.FA > 1e-6) {
          const yb = bodyBottom - (st.depth * k) / 2;
          arrowPx(cx + off, yb, cx + off, yb - Math.max(6, st.FA * scl), blue(), sm ? 2.4 : 3);
          label(`F_A = ${fN(st.FA)} N`, cx - ap / 2 - 8, cy - 4, sm ? 10.5 : 11.5, blue(), 'right', r);
        }
      }
      // Kopfzeile
      const head = `${matName(bodyMat())} · V = ${n(p.V, 0)} cm³ · ${loc(LIQ_NAME[liq()])}`;
      pill(r.x + 10, r.y + 10, head, theme.text, 'left', sm ? 11 : 12.5, false, r);
      gx.restore();
    }

    /* ---------- Diagramm Kraftmesser ---------- */
    const chart = new Plot(surface, {
      x: [0, 6],
      y: [0, 2],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => chartRegion(),
      xAxis: { label: ctx.t('axisS') },
      yAxis: { label: ctx.t('axisF') },
    });
    function chartRegion(): Rect {
      if (mode() !== 'arch') return { x: 0, y: 0, w: 0, h: 0 };
      const pr = lay.panel;
      const titleH = lay.side ? 40 : 30;
      const legendH = lay.side ? 64 : 0;
      return {
        x: pr.x + 6,
        y: pr.y + titleH,
        w: pr.w - 12,
        h: pr.h - titleH - legendH - 6,
      };
    }

    function drawArchChart(appear: number): void {
      const gx = g();
      const theme = ctx.theme;
      const pr = lay.panel;
      gx.save();
      gx.globalAlpha = appear;
      card(pr, green());
      text(gx, lay.side ? ctx.t('meterTitle') : ctx.t('meterTitleS'), pr.x + 14, pr.y + 18, {
        font: `700 ${lay.side ? 13 : 12}px ${theme.font}`,
        color: theme.text,
        align: 'left',
      });
      const body = archBody();
      const a = body.shape.height * 100;
      const rho = toSI(liqRho());
      const FG = weight(body.massKg);
      const FAfull = buoyancy(rho, body.shape.volume);
      const FA = (s: number) => buoyancy(rho, (body.shape.volume * clamp(s, 0, a)) / a);
      const sFloat = FAfull > FG ? (a * FG) / FAfull : null;
      const yMax = Math.max(FG, FAfull) * 1.18;
      chart.setRangePadded([0, a * 1.08], [0, yMax], {
        left: lay.side ? 46 : 42,
        right: 12,
        top: 10,
        bottom: 22,
      });
      chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      const sEnd = sFloat ?? a;
      chart.segment([0, FG], [a * 1.08, FG], {
        color: red(),
        width: 1.6,
        dash: [6, 4],
      });
      chart.polyline([[0, 0], [sEnd, FA(sEnd)], ...(sFloat === null ? ([[a * 1.08, FA(a)]] as [number, number][]) : [])], { color: blue(), width: 2.4 });
      chart.polyline([[0, FG], [sEnd, Math.max(0, FG - FA(sEnd))], ...(sFloat === null ? ([[a * 1.08, FG - FA(a)]] as [number, number][]) : [])], { color: green(), width: 2.6 });
      const st = archState();
      const s = st.depth * 100;
      chart.point(s, st.FA, { color: blue(), radius: 5 });
      chart.point(s, shownF, { color: green(), radius: 5.5 });
      if (sFloat !== null)
        chart.text(sFloat, 0, ctx.t('float'), {
          color: orange(),
          size: 11,
          weight: 'bold',
          align: 'right',
          baseline: 'bottom',
          offset: [-6, -18],
        });
      chart.end();
      // Legende
      if (lay.side) {
        const lx = pr.x + 16;
        let ly = pr.y + pr.h - 52;
        const items: [string, string, boolean][] = [
          [ctx.t('lgFG'), red(), true],
          [ctx.t('lgFA'), blue(), false],
          [ctx.t('lgFK'), green(), false],
        ];
        for (const [lab, col, dash] of items) {
          gx.strokeStyle = col;
          gx.lineWidth = 2.4;
          gx.setLineDash(dash ? [5, 3] : []);
          gx.beginPath();
          gx.moveTo(lx, ly);
          gx.lineTo(lx + 20, ly);
          gx.stroke();
          gx.setLineDash([]);
          sub(lab, lx + 28, ly, 11.5, theme.text, 'left', 600);
          ly += 16;
        }
      }
      gx.restore();
    }

    /* ================================================================== */
    /* Versuch 3: Dichte bestimmen (Waage und Messzylinder)                */
    /* ================================================================== */
    let posFrom: Pos = 'table';
    /** Startpunkt des Übergangs, wenn die Probe gezogen und losgelassen wurde. */
    let pathStart: { x: number; z: number } | null = null;
    const posTween = new Tween(1100, ease.inOutCubic);
    let weighed = false;
    let measuredV = false;
    let rhoDrag: { px: number; py: number; dx: number; dy: number } | null = null;
    let rhoGeoCache: {
      k: number;
      floorY: number;
      X: (x: number) => number;
      Y: (z: number) => number;
      scaleRect: Rect;
      cylRect: Rect;
      tableRect: Rect;
      bodyRect: Rect;
    } | null = null;

    /** Abmessungen der Probe (cm): Breite, Höhe (rundlicher Klumpen, Volumenfaktor 0,62). */
    function lumpDims(): { w: number; h: number; dep: number } {
      const V = p.Vp;
      const w = Math.min(4, 1.1 * Math.cbrt(V));
      const h = V / (w * w * 0.62);
      return { w, h, dep: V / (w * h) };
    }
    function lumpShape(): Shape {
      const d = lumpDims();
      return box(d.w / 100, d.dep / 100, d.h / 100);
    }
    /** Lage der Unterkante (m über dem Tisch bzw. dem Zylinderboden) und x-Mitte (m) je Ort. */
    function placeOf(pos: Pos): { x: number; z: number } {
      if (pos === 'scale') return { x: RHO_X.scale, z: 0.052 };
      if (pos === 'cyl') return { x: RHO_X.cyl, z: cylBodyZ() + 0.012 };
      return { x: RHO_X.table, z: 0 };
    }
    /** Unterkante der Probe im Zylinder (über dem Zylinderboden). */
    function cylBodyZ(): number {
      const rhoK = bodyRho();
      if (p.push || rhoK >= 1) return 0.002;
      const d = lumpDims();
      const disp = displacedInCylinder(rhoK, p.Vp, 1, false);
      const level = (CYL.V1 + disp) / CYL_AREA_CM2 / 100;
      return Math.max(0.002, level - (disp / p.Vp) * (d.h / 100));
    }
    /** Ablesung am Messzylinder (ml), abhängig davon, wie weit die Probe gerade eingetaucht ist. */
    function cylReading(zBottom: number | null): number {
      if (zBottom === null) return CYL.V1;
      const shape = lumpShape();
      const rhoK = bodyRho();
      const level0 = CYL.V1 / CYL_AREA_CM2 / 100;
      let disp = shape.submerged(level0 - (zBottom - 0.012)) * 1e6;
      // iterieren, weil der Wasserstand mit dem eingetauchten Volumen steigt
      for (let i = 0; i < 20; i++) disp = shape.submerged((CYL.V1 + disp) / CYL_AREA_CM2 / 100 - (zBottom - 0.012)) * 1e6;
      const full = displacedInCylinder(rhoK, p.Vp, 1, p.push);
      return cylinderReading(CYL.V1, Math.min(disp, full));
    }
    /** Weg der Probe zwischen zwei Orten (angehoben, damit sie über den Zylinderrand kommt). */
    function lumpPath(t: number): { x: number; z: number } {
      const a = pathStart ?? placeOf(posFrom);
      const b = placeOf(p.pos as Pos);
      const viaCyl = posFrom === 'cyl' || p.pos === 'cyl';
      const lift = Math.max(a.z, b.z + 0.03, viaCyl ? CYL.H + 0.03 : 0.1);
      // drei Abschnitte (hoch, rüber, runter), Anteile nach ihrer Länge
      const l1 = lift - a.z;
      const l2 = Math.abs(b.x - a.x);
      const l3 = lift - b.z;
      const total = Math.max(1e-6, l1 + l2 + l3);
      const s = clamp(t, 0, 1) * total;
      if (s < l1) return { x: a.x, z: a.z + s };
      if (s < l1 + l2) return { x: a.x + Math.sign(b.x - a.x) * (s - l1), z: lift };
      return { x: b.x, z: lift - (s - l1 - l2) };
    }
    function lumpNow(): { x: number; z: number } {
      if (rhoDrag && rhoGeoCache) {
        const c = rhoGeoCache;
        return {
          x: (rhoDrag.px + rhoDrag.dx - c.X(0)) / c.k,
          z: (c.floorY - (rhoDrag.py + rhoDrag.dy)) / c.k,
        };
      }
      return posTween.running ? lumpPath(posTween.value) : placeOf(p.pos as Pos);
    }

    function lumpPathD(seed: number, w: number, h: number): Path2D {
      const rnd = seededRandom(seed);
      const pts: Pt[] = [];
      const N = 14;
      const amp = Array.from({ length: N }, () => 0.9 + rnd() * 0.16);
      for (let i = 0; i < N; i++) {
        const t = (i / N) * Math.PI * 2;
        pts.push([Math.cos(t) * (w / 2) * amp[i]!, Math.sin(t) * (h / 2) * amp[(i + 3) % N]!]);
      }
      const path = new Path2D();
      for (let i = 0; i < N; i++) {
        const p0 = pts[i]!;
        const p1 = pts[(i + 1) % N]!;
        const mid: Pt = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        if (i === 0) path.moveTo(mid[0], mid[1]);
        else path.quadraticCurveTo(p0[0], p0[1], mid[0], mid[1]);
      }
      const p0 = pts[0]!;
      const m0: Pt = [(p0[0] + pts[1]![0]) / 2, (p0[1] + pts[1]![1]) / 2];
      path.quadraticCurveTo(p0[0], p0[1], m0[0], m0[1]);
      return path;
    }

    function drawLump(cx: number, yBottom: number, wpx: number, hpx: number): void {
      const gx = g();
      const mat = bodyMat();
      const base = matColor(mat);
      const kind = mat === 'own' ? 'plastic' : LOOK[mat].kind;
      const seed = (MATERIALS.indexOf(mat as Exclude<MaterialId, 'own'>) + 2) * 31;
      const path = lumpPathD(seed, wpx, hpx);
      gx.save();
      gx.translate(cx, yBottom - hpx / 2);
      gx.save();
      gx.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 3;
      gx.globalAlpha *= kind === 'ice' || kind === 'glass' ? 0.85 : 1;
      const grad = gx.createRadialGradient(-wpx * 0.2, -hpx * 0.25, 1, 0, 0, Math.max(wpx, hpx) * 0.7);
      grad.addColorStop(0, mixColor(base, '#ffffff', kind === 'metal' ? 0.55 : 0.35));
      grad.addColorStop(0.55, base);
      grad.addColorStop(1, shade(base, -0.35));
      gx.fillStyle = grad;
      gx.fill(path);
      gx.restore();
      gx.save();
      gx.clip(path);
      if (kind === 'wood') {
        gx.strokeStyle = withAlpha('#7a4a1c', 0.3);
        gx.lineWidth = 1;
        for (let i = -3; i <= 3; i++) {
          gx.beginPath();
          gx.ellipse(wpx * 0.1, hpx * 0.1, wpx * (0.15 + Math.abs(i) * 0.08), hpx * (0.2 + Math.abs(i) * 0.1), 0.3, 0, Math.PI * 2);
          gx.stroke();
        }
      } else if (kind === 'metal') {
        gx.fillStyle = 'rgba(255,255,255,0.18)';
        gx.fillRect(-wpx * 0.35, -hpx / 2, wpx * 0.12, hpx);
      }
      gx.restore();
      gx.strokeStyle = shade(base, -0.45, 0.8);
      gx.lineWidth = 1;
      gx.stroke(path);
      gx.restore();
    }

    function drawRhoScene(r: Rect): void {
      const gx = g();
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = small();
      const appear = stage(0, 0.5);
      const top = sm ? 44 : 54;
      const bottom = sm ? 24 : 30;
      const worldW = RHO_X.width;
      const worldH = CYL.H + 0.06;
      const k = Math.min((r.w - (sm ? 16 : 40)) / worldW, (r.h - top - bottom) / worldH);
      const floorY = r.y + r.h - bottom;
      const x0 = r.x + (r.w - worldW * k) / 2;
      const X = (x: number) => x0 + x * k;
      const Y = (z: number) => floorY - z * k;
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      wallAndTable(r, floorY + 2);
      gx.globalAlpha = appear;
      const ld = lumpDims();
      const wpx = (ld.w / 100) * k;
      const hpx = (ld.h / 100) * k;
      const now = lumpNow();
      // Waage
      const sx = X(RHO_X.scale);
      const sw = 0.15 * k;
      const scaleTop = Y(0.045);
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 3;
      gx.fillStyle = dark ? '#3a4452' : '#e9edf2';
      roundRect(gx, sx - sw / 2, scaleTop, sw, floorY - scaleTop, 7);
      gx.fill();
      gx.restore();
      gx.fillStyle = dark ? '#6a7585' : '#c3cad3';
      roundRect(gx, sx - sw * 0.42, Y(0.052), sw * 0.84, 0.007 * k, 3);
      gx.fill();
      const onScale = !rhoDrag && !posTween.running && p.pos === 'scale';
      const massG = bodyRho() * p.Vp;
      const shownM = ease2('scaleM', onScale ? massG : 0, 10);
      const lcdW = sw * 0.66;
      const lcdH = Math.max(15, (floorY - scaleTop) * 0.56);
      const lcdX = sx - lcdW / 2;
      const lcdY = scaleTop + (floorY - scaleTop - lcdH) / 2 + 1;
      gx.fillStyle = dark ? '#1b2a22' : '#cfe3c8';
      roundRect(gx, lcdX, lcdY, lcdW, lcdH, 3);
      gx.fill();
      text(gx, `${f(shownM, 1)} g`, lcdX + lcdW - 5, lcdY + lcdH / 2 + 0.5, {
        font: `700 ${Math.min(15, lcdH * 0.72)}px ${theme.font}`,
        color: dark ? '#9be7a5' : '#1f3b22',
        align: 'right',
      });
      const scaleRect: Rect = {
        x: sx - sw / 2 - 6,
        y: Y(0.052) - 0.06 * k,
        w: sw + 12,
        h: floorY - Y(0.052) + 0.06 * k,
      };
      // Messzylinder
      const cx = X(RHO_X.cyl);
      const cR = CYL.R * k;
      const baseW = 0.085 * k;
      gx.fillStyle = dark ? 'rgba(200,225,245,0.18)' : 'rgba(150,180,205,0.35)';
      roundRect(gx, cx - baseW / 2, floorY - 0.008 * k, baseW, 0.008 * k, 2);
      gx.fill();
      const cylBottom = floorY - 0.012 * k;
      const CY = (zml: number) => cylBottom - (zml / CYL_AREA_CM2 / 100) * k;
      const inCyl = !rhoDrag && (p.pos === 'cyl' || (posTween.running && posFrom === 'cyl')) && now.x > RHO_X.cyl - 0.03;
      const reading = cylReading(inCyl ? now.z : null);
      const shownV = ease2('cylV', reading, 7);
      // Wasser hinten
      const lc = LIQ_LOOK.fresh;
      gx.fillStyle = withAlpha(lc.c, lc.a * 0.75);
      gx.fillRect(cx - cR, CY(shownV), 2 * cR, cylBottom - CY(shownV));
      // Probe
      const bodyCx = X(now.x);
      const bodyBottom = Y(now.z);
      drawLump(bodyCx, bodyBottom, wpx, hpx);
      const bodyRect: Rect = {
        x: bodyCx - wpx / 2 - 6,
        y: bodyBottom - hpx - 6,
        w: wpx + 12,
        h: hpx + 12,
      };
      // Draht
      if (p.push && bodyRho() < 1 && (p.pos === 'cyl' || inCyl)) {
        gx.strokeStyle = dark ? '#c9ced6' : '#5d6570';
        gx.lineWidth = 1.6;
        gx.beginPath();
        gx.moveTo(bodyCx + 2, bodyBottom - hpx + 2);
        gx.lineTo(bodyCx + 6, Y(CYL.H + 0.04));
        gx.lineTo(bodyCx + 18, Y(CYL.H + 0.045));
        gx.stroke();
        sub(ctx.t('wire'), bodyCx + 22, Y(CYL.H + 0.045), sm ? 10 : 11, theme.muted, 'left', 600, theme.bg);
      }
      // Wasser vorn, Meniskus
      if (inCyl) {
        gx.fillStyle = withAlpha(lc.c, lc.a * 0.6);
        const wl = CY(shownV);
        gx.fillRect(cx - cR, Math.max(wl, bodyBottom - hpx), 2 * cR, Math.max(0, Math.min(bodyBottom, cylBottom) - Math.max(wl, bodyBottom - hpx)));
      }
      gx.fillStyle = withAlpha(lc.c, lc.a * 0.45);
      gx.fillRect(cx - cR, CY(shownV), 2 * cR, cylBottom - CY(shownV));
      gx.strokeStyle = withAlpha(shade(lc.c, -0.2), 0.9);
      gx.lineWidth = 1.5;
      gx.beginPath();
      gx.moveTo(cx - cR, CY(shownV) - 2.5);
      gx.quadraticCurveTo(cx, CY(shownV) + 2, cx + cR, CY(shownV) - 2.5);
      gx.stroke();
      // Glas und Skala
      gx.strokeStyle = dark ? 'rgba(200,225,245,0.65)' : 'rgba(90,120,145,0.65)';
      gx.lineWidth = 1.5;
      gx.beginPath();
      gx.moveTo(cx - cR, Y(CYL.H));
      gx.lineTo(cx - cR, cylBottom);
      gx.lineTo(cx + cR, cylBottom);
      gx.lineTo(cx + cR, Y(CYL.H));
      gx.stroke();
      gx.beginPath();
      gx.moveTo(cx + cR, Y(CYL.H));
      gx.lineTo(cx + cR + 5, Y(CYL.H) - 4);
      gx.stroke();
      gx.strokeStyle = withAlpha(theme.text, 0.75);
      gx.lineWidth = 1;
      for (let v = 0; v <= CYL.cap; v += 10) {
        const y = Math.round(CY(v)) + 0.5;
        const major = v % 50 === 0;
        gx.beginPath();
        gx.moveTo(cx - cR, y);
        gx.lineTo(cx - cR + (major ? cR * 0.7 : cR * 0.35), y);
        gx.stroke();
        if (major && v > 0 && (!sm || v % 100 === 0))
          text(gx, String(v), cx + cR + 6, y, {
            font: `600 ${sm ? 9.5 : 10.5}px ${theme.font}`,
            color: theme.muted,
            align: 'left',
          });
      }
      text(gx, 'ml', cx + cR + 8, Y(CYL.H) - 10, {
        font: `700 ${sm ? 9.5 : 10.5}px ${theme.font}`,
        color: theme.muted,
        align: 'left',
      });
      const cylRect: Rect = {
        x: cx - cR - 10,
        y: Y(CYL.H) - 10,
        w: 2 * cR + 30,
        h: cylBottom - Y(CYL.H) + 14,
      };
      const tableRect: Rect = {
        x: X(RHO_X.table - 0.05),
        y: Y(0.07),
        w: 0.1 * k,
        h: 0.08 * k,
      };
      rhoGeoCache = {
        k,
        floorY,
        X,
        Y,
        scaleRect,
        cylRect,
        tableRect,
        bodyRect,
      };
      // Lupe an der Ablesestelle
      if (!sm || r.w > 300) {
        const lr = sm ? 30 : 40;
        const right = cx + cR + (sm ? 30 : 36) + lr;
        const lx = right + lr <= r.x + r.w - 4 ? right : cx - cR - 12 - lr;
        const ly = clamp(CY(shownV), Y(CYL.H) + lr + 4, cylBottom - lr - 4);
        gx.save();
        gx.beginPath();
        gx.arc(lx, ly, lr, 0, Math.PI * 2);
        gx.fillStyle = dark ? '#121a26' : '#ffffff';
        gx.fill();
        gx.clip();
        const zoom = 4;
        const zy = (v: number) => ly + (shownV - v) * ((k / CYL_AREA_CM2 / 100) * zoom);
        gx.fillStyle = withAlpha(lc.c, lc.a * 1.1);
        gx.fillRect(lx - lr, zy(shownV), lr * 2, lr * 2);
        gx.strokeStyle = withAlpha(theme.text, 0.85);
        for (let v = Math.floor((shownV - 30) / 2) * 2; v <= shownV + 30; v += 2) {
          const y = zy(v);
          const major = v % 10 === 0;
          gx.lineWidth = major ? 1.4 : 0.9;
          gx.beginPath();
          gx.moveTo(lx - lr, y);
          gx.lineTo(lx - lr + (major ? lr * 0.9 : v % 5 === 0 ? lr * 0.6 : lr * 0.4), y);
          gx.stroke();
          if (major)
            text(gx, String(v), lx + 4, y, {
              font: `700 ${sm ? 10 : 11}px ${theme.font}`,
              color: theme.text,
              align: 'left',
            });
        }
        gx.strokeStyle = shade(lc.c, -0.3);
        gx.lineWidth = 2;
        gx.beginPath();
        gx.moveTo(lx - lr, zy(shownV) - 5);
        gx.quadraticCurveTo(lx - lr * 0.2, zy(shownV) + 2, lx + lr * 0.2, zy(shownV) + 2);
        gx.stroke();
        gx.restore();
        gx.strokeStyle = withAlpha(theme.text, 0.5);
        gx.lineWidth = 2.5;
        gx.beginPath();
        gx.arc(lx, ly, lr, 0, Math.PI * 2);
        gx.stroke();
        gx.lineWidth = 1;
        gx.setLineDash([3, 3]);
        gx.beginPath();
        gx.moveTo(lx > cx ? lx - lr : lx + lr, ly);
        gx.lineTo(lx > cx ? cx + cR : cx - cR, CY(shownV));
        gx.stroke();
        gx.setLineDash([]);
      }
      // Anleitung in drei Schritten (der aktuelle hervorgehoben)
      const guideW = Math.min(300, cx - cR - r.x - 40);
      if (!sm && guideW > 180) {
        const steps = de
          ? ['Auf die Waage legen → m', 'In den Messzylinder → V = V_2 − V_1', 'Dichte ausrechnen: ρ = m / V']
          : ['Put it on the balance → m', 'Into the cylinder → V = V_2 − V_1', 'Work out the density: ρ = m / V'];
        const cur = !weighed ? 0 : !measuredV ? 1 : 2;
        const gr: Rect = {
          x: r.x + 10,
          y: r.y + 46,
          w: guideW,
          h: 26 + steps.length * 24,
        };
        card(gr, blue());
        steps.forEach((st, i) => {
          const yy = gr.y + 24 + i * 24;
          const done = i < cur || (i === 2 && weighed && measuredV);
          const col = i === cur ? blue() : done ? green() : theme.muted;
          gx.fillStyle = i === cur ? blue() : done ? green() : withAlpha(theme.muted, 0.35);
          gx.beginPath();
          gx.arc(gr.x + 18, yy, 9, 0, Math.PI * 2);
          gx.fill();
          text(gx, done && i !== cur ? '✓' : String(i + 1), gr.x + 18, yy + 0.5, {
            font: `700 11px ${theme.font}`,
            color: textOn(i === cur ? blue() : done ? green() : theme.muted, theme),
          });
          sub(st, gr.x + 34, yy, 12, i === cur ? theme.text : col, 'left', i === cur ? 700 : 600);
        });
      }
      // Hinweise und Beschriftungen
      const size = sm ? 10.5 : 11.5;
      const nm = probe() === 'mat' ? matName(bodyMat()) : tr('probeUnknown', { p: probe() });
      pill(r.x + 10, r.y + 10, `${nm} · V = ${n(p.Vp, 0)} cm³`, theme.text, 'left', sm ? 11 : 12.5, false, r);
      if (!ctx.locked && !posTween.running && !rhoDrag) {
        if (p.pos !== 'scale') label(`↓ ${ctx.t('tapScale')}`, sx, Y(0.052) - 0.05 * k, size, theme.muted, 'center', r);
        if (p.pos !== 'cyl') label(`↓ ${ctx.t('tapCyl')}`, cx, Y(CYL.H) - 12, size, theme.muted, 'center', r);
      }
      if (p.pos === 'cyl' && !posTween.running && !p.push && bodyRho() < 1) {
        pill(
          cx,
          Y(CYL.H) - (sm ? 40 : 46),
          tr('floatsCyl', {
            v: n(displacedInCylinder(bodyRho(), p.Vp, 1, false), 1),
          }),
          orange(),
          'center',
          sm ? 10 : 11,
          false,
          r,
        );
      }
      if (ctx.keyFocus === 'scale' || ctx.keyFocus === 'cyl' || ctx.keyFocus === 'table') {
        const fr = ctx.keyFocus === 'scale' ? scaleRect : ctx.keyFocus === 'cyl' ? cylRect : tableRect;
        gx.strokeStyle = blue();
        gx.lineWidth = 2;
        gx.setLineDash([4, 3]);
        roundRect(gx, fr.x, fr.y, fr.w, fr.h, 8);
        gx.stroke();
        gx.setLineDash([]);
      }
      gx.restore();
    }

    function drawProtocol(appear: number): void {
      const gx = g();
      const theme = ctx.theme;
      const pr = lay.panel;
      const sm = !lay.side;
      gx.save();
      gx.globalAlpha = appear;
      card(pr, purple());
      const x = pr.x + 14;
      let y = pr.y + 20;
      text(gx, ctx.t('protocol'), x, y, {
        font: `700 ${sm ? 12.5 : 13.5}px ${theme.font}`,
        color: theme.text,
        align: 'left',
      });
      y += sm ? 22 : 28;
      const fs = sm ? 11.5 : 12.5;
      const line = sm ? 17 : 20;
      const m = bodyRho() * p.Vp;
      const step = (title: string, done: boolean) => {
        gx.fillStyle = done ? green() : withAlpha(theme.muted, 0.5);
        gx.beginPath();
        gx.arc(x + 5, y, 5, 0, Math.PI * 2);
        gx.fill();
        sub(title, x + 16, y, fs, theme.text, 'left', 700);
        y += line;
      };
      step(ctx.t('step1'), weighed);
      sub(weighed ? `m = ${f(m, 1)} g` : ctx.t('notYet'), x + 16, y, fs, weighed ? theme.text : theme.muted, 'left', 600);
      y += line + (sm ? 4 : 8);
      step(ctx.t('step2'), measuredV);
      if (measuredV) {
        const V2 = cylinderReading(CYL.V1, displacedInCylinder(bodyRho(), p.Vp, 1, p.push));
        const Vd = V2 - CYL.V1;
        sub(`V_1 = ${n(CYL.V1, 0)} ml · V_2 = ${n(V2, 1)} ml`, x + 16, y, fs, theme.text, 'left', 600);
        y += line;
        sub(`V = V_2 − V_1 = ${n(Vd, 1)} cm³`, x + 16, y, fs, theme.text, 'left', 600);
      } else sub(ctx.t('notYet'), x + 16, y, fs, theme.muted, 'left', 600);
      y += line + (sm ? 4 : 8);
      step(ctx.t('step3'), weighed && measuredV);
      if (weighed && measuredV) {
        const V2 = cylinderReading(CYL.V1, displacedInCylinder(bodyRho(), p.Vp, 1, p.push));
        const Vd = V2 - CYL.V1;
        const rho = m / Vd;
        if (ctx.isHidden('rho')) sub(`ρ = m / V = ?`, x + 16, y, fs, theme.text, 'left', 700);
        else sub(`ρ = ${f(m, 1)} g / ${n(Vd, 1)} cm³ ${fmt.rel(rho, 2)} ${f(rho, 2)} g/cm³`, x + 16, y, fs, purple(), 'left', 700);
        y += line;
        if (!ctx.isHidden('ident') || probe() === 'mat') {
          const id = identify(rho);
          const wrong = Math.abs(rho / bodyRho() - 1) > 0.02;
          sub(`→ ${loc(MAT_NAME[id]).replace(' (PE)', '')} (${rhoStr(MATERIAL_DENSITY[id])} g/cm³)`, x + 16, y, fs, wrong ? orange() : green(), 'left', 700);
          if (wrong) {
            y += line;
            sub(de ? 'falsch: nicht ganz untergetaucht!' : 'wrong: not fully under water!', x + 16, y, fs - 0.5, orange(), 'left', 700);
          }
        }
      } else sub(ctx.t('notYet'), x + 16, y, fs, theme.muted, 'left', 600);
      y += line + (sm ? 6 : 14);
      // kleine Dichtetabelle
      const room = pr.y + pr.h - y - 10;
      const rowH = 15.5;
      if (lay.side && room > rowH * 8) {
        text(gx, ctx.t('tableTitle'), x, y, {
          font: `700 12px ${theme.font}`,
          color: theme.text,
          align: 'left',
        });
        y += 18;
        const rows = Math.min(MATERIALS.length, Math.floor((room - 18) / rowH));
        const list = MATERIALS.slice(MATERIALS.length - rows >= 0 ? 0 : 0, rows);
        for (const id of list) {
          sub(loc(MAT_NAME[id]), x, y, 11.5, withAlpha(theme.text, 0.85), 'left', 500);
          sub(rhoStr(MATERIAL_DENSITY[id]), pr.x + pr.w - 16, y, 11.5, theme.text, 'right', 600);
          y += rowH;
        }
      }
      gx.restore();
    }

    function setPos(pos: Pos): void {
      if (ctx.locked || pos === p.pos) return;
      pathStart = null;
      ctx.set({ pos });
    }

    /* ================================================================== */
    /* Versuch 4: Heißluftballon                                           */
    /* ================================================================== */
    let bm: BalloonMotion = { h: 0, v: 0, TIn: KELVIN + 15 };
    const balloonStepper = new FixedStepper(0.05);
    let history: { t: number; h: number }[] = [];
    let simT = 0;
    let lastSample = -1;
    let ballGeo: { burner: Rect; vent: Rect } | null = null;

    function resetBalloon(cold: boolean): void {
      bm = { h: 0, v: 0, TIn: cold ? KELVIN + p.Ta : KELVIN + p.Ti };
      if (prefersReducedMotion())
        bm = {
          h: equilibriumAltitude(p.Vb, KELVIN + p.Ta, KELVIN + p.Ti, p.ml),
          v: 0,
          TIn: KELVIN + p.Ti,
        };
      history = [];
      simT = 0;
      lastSample = -1;
    }

    function stepBall(dt: number): boolean {
      const TOut = KELVIN + p.Ta;
      const TT = KELVIN + p.Ti;
      if (prefersReducedMotion()) {
        bm = { h: equilibriumAltitude(p.Vb, TOut, TT, p.ml), v: 0, TIn: TT };
        return false;
      }
      const h = dt * BALLOON_LAPSE;
      balloonStepper.run(h, (hh) => {
        bm = stepBalloon(bm, p.Vb, TOut, TT, p.ml, hh);
        simT += hh;
      });
      if (simT - lastSample >= 1 || lastSample < 0) {
        history.push({ t: simT, h: bm.h });
        if (history.length > 400) history = history.slice(-400);
        lastSample = simT;
      }
      const heq = equilibriumAltitude(p.Vb, TOut, TT, p.ml);
      return Math.abs(bm.v) > 0.01 || Math.abs(bm.TIn - TT) > 0.05 || (heq > 0 && Math.abs(bm.h - heq) > 0.5);
    }

    function drawBalloonScene(r: Rect): void {
      const ballLabs: Lab[] = [];
      const gx = g();
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = small();
      const appear = stage(0, 0.6);
      const TOut = KELVIN + p.Ta;
      const heq = equilibriumAltitude(p.Vb, TOut, KELVIN + p.Ti, p.ml);
      const viewTarget = clamp(Math.ceil((Math.max(heq, bm.h, 300) * 1.35) / 250) * 250, 750, 5000);
      const view = ease2('view', viewTarget, 2.5);
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      // Himmel
      const sky = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      sky.addColorStop(0, dark ? '#0f1c33' : '#7fb4e6');
      sky.addColorStop(0.7, dark ? '#24365a' : '#cfe4f7');
      sky.addColorStop(1, dark ? '#3a3f5c' : '#f4ead8');
      gx.fillStyle = sky;
      gx.fillRect(r.x, r.y, r.w, r.h);
      const groundH = sm ? 36 : 48;
      const groundY = r.y + r.h - groundH;
      const topY = r.y + (sm ? 40 : 52);
      const balloonPx = Math.min(sm ? 44 : 66, r.h * 0.13);
      const usable = groundY - topY - balloonPx * 2.6;
      const yOf = (alt: number) => groundY - (alt / view) * usable;
      // Wolken in festen Höhen
      const clouds: [number, number, number][] = [
        [500, 0.72, 1],
        [1300, 0.25, 1.3],
        [2100, 0.62, 1.1],
        [3200, 0.18, 1.4],
        [4300, 0.55, 1.2],
      ];
      for (const [alt, fx, s] of clouds) {
        const y = yOf(alt);
        if (y < r.y - 20 || y > groundY - 10) continue;
        const cx = r.x + r.w * fx;
        gx.fillStyle = dark ? 'rgba(200,210,230,0.16)' : 'rgba(255,255,255,0.82)';
        for (const [dx, dy, rr] of [
          [0, 0, 18],
          [20, -6, 14],
          [-20, -3, 13],
          [38, 2, 11],
          [-36, 3, 10],
        ] as [number, number, number][]) {
          gx.beginPath();
          gx.ellipse(cx + dx * s, y + dy * s, rr * s * 1.3, rr * s * 0.8, 0, 0, Math.PI * 2);
          gx.fill();
        }
      }
      // Boden: Hügel und Wiese
      gx.fillStyle = dark ? '#22382a' : '#8cc06b';
      gx.beginPath();
      gx.moveTo(r.x, groundY + 6);
      for (let i = 0; i <= 20; i++) {
        const x = r.x + (i / 20) * r.w;
        gx.lineTo(x, groundY - 10 - Math.sin(i * 0.8) * 8 - Math.sin(i * 0.31) * 6);
      }
      gx.lineTo(r.x + r.w, groundY + 6);
      gx.closePath();
      gx.fill();
      const grass = gx.createLinearGradient(0, groundY, 0, r.y + r.h);
      grass.addColorStop(0, dark ? '#2f5a2a' : '#6fae4f');
      grass.addColorStop(1, dark ? '#1f3a1d' : '#4f8a37');
      gx.fillStyle = grass;
      gx.fillRect(r.x, groundY, r.w, groundH);
      // Höhenskala links
      const axX = r.x + (sm ? 40 : 54);
      gx.strokeStyle = withAlpha(theme.text, 0.45);
      gx.lineWidth = 1.2;
      gx.beginPath();
      gx.moveTo(axX, yOf(0));
      gx.lineTo(axX, yOf(view));
      gx.stroke();
      const tick = view > 3000 ? 1000 : view > 1500 ? 500 : 250;
      for (let alt = 0; alt <= view + 1; alt += tick) {
        const y = yOf(alt);
        gx.beginPath();
        gx.moveTo(axX - 5, y);
        gx.lineTo(axX, y);
        gx.stroke();
        text(gx, fmt.num(alt, 0), axX - 8, y, {
          font: `600 ${sm ? 10 : 11}px ${theme.font}`,
          color: theme.text,
          align: 'right',
        });
      }
      text(gx, ctx.t('altitude'), axX - 4, yOf(view) - 14, {
        font: `700 ${sm ? 10 : 11}px ${theme.font}`,
        color: theme.text,
        align: 'left',
      });
      // Schwebehöhe
      if (heq > 0 && !ctx.isHidden('eq')) {
        const y = yOf(Math.min(heq, view));
        gx.strokeStyle = withAlpha(purple(), 0.9);
        gx.setLineDash([6, 5]);
        gx.lineWidth = 1.5;
        gx.beginPath();
        gx.moveTo(axX, y);
        gx.lineTo(r.x + r.w - 10, y);
        gx.stroke();
        gx.setLineDash([]);
        if (heq <= view) ballLabs.push({ text: tr('hoverLine', { h: fmt.num(Math.round(heq / 10) * 10, 0) }), x: axX + 8, y: y - 10, align: 'left', color: purple(), size: sm ? 10.5 : 11.5 });
      }
      gx.globalAlpha = appear;
      // Ballon
      const bx = r.x + r.w * (sm ? 0.6 : 0.56);
      const basketH = balloonPx * 0.36;
      const basketW = balloonPx * 0.46;
      const basketBottom = yOf(bm.h) + (bm.h <= 0.01 ? 0 : 0);
      const R = balloonPx;
      const cy = basketBottom - basketH - balloonPx * 0.62 - R;
      const heat = clamp((bm.TIn - TOut) / 100, 0, 1);
      // Hülle: Tropfenform mit Bahnen
      const env = new Path2D();
      env.moveTo(bx - R * 0.32, cy + R * 1.18);
      env.bezierCurveTo(bx - R * 1.25, cy + R * 0.55, bx - R * 1.15, cy - R * 1.02, bx, cy - R);
      env.bezierCurveTo(bx + R * 1.15, cy - R * 1.02, bx + R * 1.25, cy + R * 0.55, bx + R * 0.32, cy + R * 1.18);
      env.closePath();
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      gx.shadowBlur = 14;
      gx.shadowOffsetY = 5;
      gx.fillStyle = red();
      gx.fill(env);
      gx.restore();
      gx.save();
      gx.clip(env);
      const gores = 8;
      for (let i = 0; i < gores; i++) {
        const x0 = bx - R * 1.25 + (i * 2.5 * R) / gores;
        gx.fillStyle = i % 2 === 0 ? red() : i % 4 === 1 ? orange() : mixColor(orange(), '#ffffff', 0.55);
        gx.beginPath();
        gx.moveTo(bx + (x0 - bx) * 0.25, cy + R * 1.2);
        gx.bezierCurveTo(x0, cy + R * 0.4, x0, cy - R * 0.6, bx + (x0 - bx) * 0.05, cy - R * 1.05);
        const x1 = x0 + (2.5 * R) / gores;
        gx.bezierCurveTo(x1, cy - R * 0.6, x1, cy + R * 0.4, bx + (x1 - bx) * 0.25, cy + R * 1.2);
        gx.closePath();
        gx.fill();
      }
      const shine = gx.createRadialGradient(bx - R * 0.4, cy - R * 0.45, R * 0.1, bx, cy, R * 1.4);
      shine.addColorStop(0, 'rgba(255,255,255,0.38)');
      shine.addColorStop(0.5, 'rgba(255,255,255,0)');
      shine.addColorStop(1, 'rgba(0,0,0,0.28)');
      gx.fillStyle = shine;
      gx.fillRect(bx - R * 1.4, cy - R * 1.2, R * 2.8, R * 2.5);
      // warme Luft innen
      if (heat > 0.02) {
        const glow = gx.createRadialGradient(bx, cy + R * 0.9, 2, bx, cy + R * 0.3, R * 1.3);
        glow.addColorStop(0, `rgba(255,190,80,${0.45 * heat})`);
        glow.addColorStop(1, 'rgba(255,190,80,0)');
        gx.fillStyle = glow;
        gx.fillRect(bx - R * 1.4, cy - R * 1.2, R * 2.8, R * 2.5);
      }
      gx.restore();
      // Ventil oben
      const ventR: Rect = {
        x: bx - R * 0.45,
        y: cy - R * 1.15,
        w: R * 0.9,
        h: R * 0.5,
      };
      gx.fillStyle = withAlpha('#ffffff', 0.5);
      gx.beginPath();
      gx.ellipse(bx, cy - R * 0.93, R * 0.22, R * 0.07, 0, 0, Math.PI * 2);
      gx.fill();
      // Seile, Brenner, Korb
      const mouthY = cy + R * 1.18;
      const basketTop = basketBottom - basketH;
      gx.strokeStyle = dark ? '#9aa4b1' : '#5b4630';
      gx.lineWidth = 1.2;
      gx.beginPath();
      gx.moveTo(bx - R * 0.32, mouthY);
      gx.lineTo(bx - basketW / 2, basketTop);
      gx.moveTo(bx + R * 0.32, mouthY);
      gx.lineTo(bx + basketW / 2, basketTop);
      gx.stroke();
      const burning = bm.TIn < KELVIN + p.Ti - 0.3;
      const burnerY = (mouthY + basketTop) / 2 + 3;
      gx.fillStyle = dark ? '#aab3bf' : '#6b7584';
      roundRect(gx, bx - 6, burnerY, 12, 5, 2);
      gx.fill();
      if (burning) {
        const tt = performance.now() / 90;
        const fh = R * (0.45 + 0.12 * Math.sin(tt) + 0.06 * Math.sin(tt * 2.7));
        const flame = gx.createLinearGradient(0, burnerY, 0, burnerY - fh);
        flame.addColorStop(0, 'rgba(90,140,255,0.95)');
        flame.addColorStop(0.3, 'rgba(255,200,60,0.95)');
        flame.addColorStop(1, 'rgba(255,90,30,0)');
        gx.fillStyle = flame;
        gx.beginPath();
        gx.moveTo(bx - 5, burnerY);
        gx.quadraticCurveTo(bx - 8, burnerY - fh * 0.5, bx, burnerY - fh);
        gx.quadraticCurveTo(bx + 8, burnerY - fh * 0.5, bx + 5, burnerY);
        gx.closePath();
        gx.fill();
        animating = true;
      }
      const wick = gx.createLinearGradient(0, basketTop, 0, basketBottom);
      wick.addColorStop(0, '#b0804a');
      wick.addColorStop(1, '#7a5228');
      gx.fillStyle = wick;
      roundRect(gx, bx - basketW / 2, basketTop, basketW, basketH, 3);
      gx.fill();
      gx.strokeStyle = 'rgba(60,35,10,0.45)';
      gx.lineWidth = 0.8;
      for (let i = 1; i < 4; i++) {
        gx.beginPath();
        gx.moveTo(bx - basketW / 2, basketTop + (i * basketH) / 4);
        gx.lineTo(bx + basketW / 2, basketTop + (i * basketH) / 4);
        gx.stroke();
      }
      const burner: Rect = {
        x: bx - 24,
        y: burnerY - R * 0.6,
        w: 48,
        h: R * 0.6 + basketH + 10,
      };
      ballGeo = { burner, vent: ventR };
      // Temperaturen
      const size = sm ? 10.5 : 11.5;
      label(tr('inside', { t: n(bm.TIn - KELVIN, 0) }), bx, cy + R * 0.25, size, theme.dark ? '#fff1d6' : '#5a1e08', 'center', r);
      // Hinweise zum Antippen
      if (!ctx.locked) {
        ballLabs.push({ text: ctx.t('burner'), x: bx - basketW / 2 - 10, y: burnerY - 2, align: 'right', color: orange(), size: sm ? 10 : 10.5 });
        ballLabs.push({ text: ctx.t('vent'), x: bx, y: cy - R * 1.12 - 12, align: 'center', color: blue(), size: sm ? 10 : 10.5 });
      }
      // Schwebehöhe, Brenner und Ventil dürfen sich nicht überdecken
      placeLabels(ballLabs, [{ x: bx - R * 1.05, y: cy - R, w: R * 2.1, h: R * 2.1 }], r);
      // Kraftpfeile
      if (p.arrows) {
        const fo = balloonForces(p.Vb, TOut, bm.TIn, p.ml, bm.h);
        const scl = (R * 1.5) / Math.max(fo.FA, 1);
        const ax = bx + R * 1.3;
        arrowPx(ax, cy + R * 0.2, ax, cy + R * 0.2 - fo.FA * scl, blue(), sm ? 2.6 : 3.2);
        label(`F_A = ${f(fo.FA / 1000, 1)} kN`, ax + 8, cy + R * 0.2 - fo.FA * scl * 0.75, size, blue(), 'left', r);
        const air = fo.FAir * scl;
        const load = fo.FLoad * scl;
        arrowPx(ax + 16, cy + R * 0.2, ax + 16, cy + R * 0.2 + air, orange(), sm ? 2.4 : 2.8, 9);
        label(`F_G,Luft = ${f(fo.FAir / 1000, 1)} kN`, ax + 24, cy + R * 0.2 + air * 0.55, size, orange(), 'left', r);
        arrowPx(bx, basketBottom, bx, basketBottom + load, red(), sm ? 2.4 : 2.8, 9);
        label(`F_G = ${f(fo.FLoad / 1000, 2)} kN`, bx + 8, basketBottom + Math.min(load, groundH) * 0.6 + 4, size, red(), 'left', r);
      }
      // Kopfzeile
      const fo0 = balloonForces(p.Vb, TOut, bm.TIn, p.ml, bm.h);
      const stateKey = bm.h <= 0.01 && fo0.net <= 0 ? 'onGround' : Math.abs(bm.v) < 0.05 ? 'hovering' : bm.v > 0 ? 'rises' : 'falls';
      const col = stateKey === 'rises' ? green() : stateKey === 'falls' ? orange() : stateKey === 'hovering' ? purple() : theme.muted;
      const left = pill(r.x + 10, r.y + 10, ctx.t(stateKey), col, 'left', sm ? 11 : 12.5, true, r);
      pill(left.x + left.w + 8, r.y + 10, `h = ${fmt.num(Math.round(bm.h), 0)} m`, theme.text, 'left', sm ? 11 : 12.5, false, r);
      pill(r.x + r.w - 10, r.y + (sm ? 40 : 10), tr('outside', { t: n(p.Ta, 0) }), theme.text, 'right', sm ? 11 : 12.5, false, r);
      sub(ctx.t('lapse'), r.x + r.w - 12, r.y + r.h - 12, sm ? 10 : 11, dark ? 'rgba(230,240,230,0.85)' : 'rgba(20,50,20,0.8)', 'right', 600);
      gx.restore();
    }

    function drawBalloonCard(appear: number): void {
      const gx = g();
      const theme = ctx.theme;
      const pr = lay.panel;
      const sm = !lay.side;
      gx.save();
      gx.globalAlpha = appear;
      card(pr, orange());
      const TOut = KELVIN + p.Ta;
      const fo = balloonForces(p.Vb, TOut, bm.TIn, p.ml, bm.h);
      const x = pr.x + 14;
      let y = pr.y + 20;
      text(gx, sm ? ctx.t('cardBallS') : ctx.t('cardBall'), x, y, {
        font: `700 ${sm ? 12.5 : 13.5}px ${theme.font}`,
        color: theme.text,
        align: 'left',
      });
      y += sm ? 20 : 28;
      const fs = sm ? 11 : 12;
      // Balken: Auftrieb gegen die Gewichtskräfte
      const barW = pr.w - 28;
      const maxF = Math.max(fo.FA, fo.FAir + fo.FLoad) * 1.05;
      const bh = sm ? 14 : 18;
      const bar = (yy: number, parts: [number, string][], title: string, value: string) => {
        sub(title, x, yy, fs, theme.text, 'left', 600);
        sub(value, pr.x + pr.w - 14, yy, fs, theme.text, 'right', 700);
        let xx = x;
        for (const [v, c] of parts) {
          const w = (v / maxF) * barW;
          gx.fillStyle = c;
          roundRect(gx, xx, yy + 9, Math.max(0, w - 1), bh, 3);
          gx.fill();
          xx += w;
        }
      };
      bar(y, [[fo.FA, blue()]], ctx.t('barFA'), `${f(fo.FA / 1000, 2)} kN`);
      y += bh + (sm ? 24 : 30);
      bar(
        y,
        [
          [fo.FAir, orange()],
          [fo.FLoad, red()],
        ],
        ctx.t('barWeights'),
        `${f((fo.FAir + fo.FLoad) / 1000, 2)} kN`,
      );
      y += bh + (sm ? 22 : 30);
      const lines = [
        `ρ_${de ? 'außen' : 'out'} = ${f(fo.rhoOut, 3)} kg/m³`,
        `ρ_${de ? 'innen' : 'in'} = ${f(fo.rhoIn, 3)} kg/m³ (${n(bm.TIn - KELVIN, 0)} °C)`,
        `${de ? 'Tragkraft' : 'Lift'} = ${ctx.isHidden('lift') ? '?' : fmt.num(Math.round(fo.liftKg), 0)} kg`,
        `${de ? 'Ballon + Zuladung' : 'Balloon + payload'} = ${fmt.num(balloonEquipment(p.Vb) + p.ml, 0)} kg`,
      ];
      for (const ln of lines) {
        sub(ln, x, y, fs - 0.5, theme.text, 'left', 600);
        y += sm ? 16 : 19;
      }
      y += sm ? 2 : 8;
      // Verlauf der Höhe
      const chartH = pr.y + pr.h - y - 14;
      if (chartH > 60) {
        text(gx, ctx.t('historyT'), x, y, {
          font: `600 11px ${theme.font}`,
          color: theme.muted,
          align: 'left',
        });
        y += 10;
        const cr: Rect = { x: x, y: y, w: pr.w - 28, h: chartH - 10 };
        gx.strokeStyle = withAlpha(theme.text, 0.18);
        gx.lineWidth = 1;
        roundRect(gx, cr.x, cr.y, cr.w, cr.h, 6);
        gx.stroke();
        const span = 120;
        const t1 = Math.max(simT, span);
        const hmax = Math.max(100, ...history.map((q) => q.h), equilibriumAltitude(p.Vb, TOut, KELVIN + p.Ti, p.ml)) * 1.1;
        gx.strokeStyle = green();
        gx.lineWidth = 2;
        gx.beginPath();
        let first = true;
        for (const q of history) {
          if (q.t < t1 - span) continue;
          const px = cr.x + ((q.t - (t1 - span)) / span) * cr.w;
          const py = cr.y + cr.h - (q.h / hmax) * (cr.h - 6) - 3;
          if (first) gx.moveTo(px, py);
          else gx.lineTo(px, py);
          first = false;
        }
        gx.stroke();
        text(gx, `${fmt.num(Math.round(hmax / 10) * 10, 0)} m`, cr.x + 4, cr.y + 9, { font: `600 10px ${theme.font}`, color: theme.muted, align: 'left' });
      }
      gx.restore();
    }

    /* ================================================================== */
    /* Ergebnisse                                                          */
    /* ================================================================== */
    const lastOut = new Map<string, string>();
    function out(key: string, value: string | null, html = true): void {
      const k = value ?? '\u0000';
      if (lastOut.get(key) === k) return;
      lastOut.set(key, k);
      ctx.readout(key, value === null ? null : html ? { html: value } : value);
    }
    const v = (s: string) => `<var>${s}</var>`;
    const sb = (s: string, i: string) => `<var>${s}</var><sub>${i}</sub>`;
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const ALL = ['cmp', 'forces', 'frac', 'level', 'meter', 'disp', 'archi', 'mass', 'vol', 'rho', 'ident', 'tab', 'air', 'lift', 'eq', 'now'];

    function readoutsFloat(): void {
      const rhoF = liqRho();
      const st = floatTargetState();
      const word = `<strong>${ctx.t(st === 'float' ? 'floats' : st === 'hover' ? 'hovers' : 'sinks')}</strong>`;
      const t = tank();
      const g0 = 'g/cm³';
      if (obj() === 'block') {
        const rhoK = bodyRho();
        const m = rhoK * p.V;
        const FG = weight(m / 1000);
        const sign = st === 'hover' ? '=' : rhoK < rhoF ? '&lt;' : '&gt;';
        out('cmp', `${sb('ρ', 'K')} = ${rhoStr(rhoK)} ${g0} ${sign} ${sb('ρ', 'Fl')} = ${rhoStr(rhoF)} ${g0} → ${word}`);
        const mDisp = st === 'sink' || st === 'hover' ? rhoF * p.V : m;
        const Vd = mDisp / rhoF;
        const FA = weight(mDisp / 1000);
        let forces = `${sb('F', 'G')} = ${v('m')} · ${v('g')} = ${f(m / 1000, 4)} kg · ${gStr} ${fmt.rel(FG, 3)} ${fN(FG)} N<br>${sb('F', 'A')} = ${sb('ρ', 'Fl')} · ${sb('V', de ? 'verdr' : 'displ')} · ${v('g')} = ${f(rhoF, 3)} ${g0} · ${n(Vd, 1)} cm³ · ${gStr} ${fmt.rel(FA, 3)} ${fN(FA)} N`;
        if (st === 'sink') forces += `<br>${de ? 'Am Boden' : 'On the bottom'}: ${sb('F', 'N')} = ${sb('F', 'G')} − ${sb('F', 'A')} = ${fN(FG - FA)} N`;
        else forces += `<br>${de ? 'Im Gleichgewicht' : 'In equilibrium'}: ${sb('F', 'A')} = ${sb('F', 'G')}`;
        out('forces', forces);
        if (st === 'float')
          out(
            'frac',
            `${de ? 'Eintauchanteil' : 'Share below the surface'} = ${frac(sb('ρ', 'K'), sb('ρ', 'Fl'))} = ${frac(`${f(rhoK, 2)} ${g0}`, `${f(rhoF, 3)} ${g0}`)} ${fmt.rel((rhoK / rhoF) * 100, 1)} ${n((rhoK / rhoF) * 100, 1)} % → ${sb('V', de ? 'verdr' : 'displ')} = ${n(Vd, 1)} cm³`,
          );
        else
          out(
            'frac',
            st === 'hover'
              ? de
                ? 'Ganz eingetaucht, aber ohne Bodenberührung: Der Körper bleibt in jeder Tiefe stehen.'
                : 'Fully under, but not touching the bottom: the body stays at any depth.'
              : de
                ? `Ganz eingetaucht: ${sb('V', 'verdr')} = ${v('V')} = ${n(p.V, 0)} cm³`
                : `Fully under: ${sb('V', 'displ')} = ${v('V')} = ${n(p.V, 0)} cm³`,
          );
        out(
          'level',
          `Δ${v('h')} = ${frac(sb('V', de ? 'verdr' : 'displ'), v('A'))} = ${frac(`${n(Vd, 1)} cm³`, `${n(t.area * 1e4, 0)} cm²`)} ${fmt.rel(Vd / (t.area * 1e4), 2)} ${f(Vd / (t.area * 1e4), 2)} cm`,
        );
      } else if (obj() === 'ship') {
        const s = shipState(p.load / 1000, toSI(rhoF));
        const m = s.massKg * 1000;
        out(
          'cmp',
          `${de ? 'mittlere Dichte' : 'mean density'} ${sb('ρ', 'S')} = ${frac(v('m'), sb('V', de ? 'außen' : 'out'))} = ${frac(`${n(m, 0)} g`, '1200 cm³')} ${fmt.rel(m / 1200, 3)} ${f(m / 1200, 3)} ${g0} ${s.draught === null ? '&gt;' : '&lt;'} ${sb('ρ', 'Fl')} = ${f(rhoF, 3)} ${g0} → ${word}`,
        );
        const FG = weight(s.massKg);
        out(
          'forces',
          `${sb('F', 'G')} = ${f(s.massKg, 3)} kg · ${gStr} ${fmt.rel(FG, 3)} ${fN(FG)} N · ${de ? 'Stahl allein' : 'steel alone'}: ${de ? 'Würfel' : 'cube'} ${n(steelVolume() * 1e6, 1)} cm³ → ${sb('F', 'A')} = ${fN(buoyancy(toSI(rhoF), steelVolume()))} N, ${de ? 'sinkt' : 'sinks'}`,
        );
        out(
          'frac',
          s.draught === null
            ? de
              ? `Größte Ladung ${n(Math.max(0, s.maxLoad * 1000), 0)} g – das Schiff läuft voll und sinkt.`
              : `Largest cargo ${n(Math.max(0, s.maxLoad * 1000), 0)} g – the ship floods and sinks.`
            : `${de ? 'Tiefgang' : 'Draught'} ${v('t')} = ${frac(v('m'), `${sb('ρ', 'Fl')} · ${v('L')} · ${v('B')}`)} = ${frac(`${n(m, 0)} g`, `${f(rhoF, 3)} ${g0} · 20 cm · 10 cm`)} ${fmt.rel(s.draught * 100, 2)} ${f(s.draught * 100, 2)} cm · ${de ? 'größte Ladung' : 'largest cargo'} ${n(s.maxLoad * 1000, 0)} g`,
        );
        out('level', null);
      } else {
        const rho = toSI(rhoF);
        const m = subMass(p.fill / 100, rho) * 1000;
        const hf = hoverFill(rho);
        out(
          'cmp',
          `${de ? 'mittlere Dichte' : 'mean density'} = ${frac(v('m'), v('V'))} = ${frac(`${n(m, 1)} g`, '600 cm³')} ${fmt.rel(m / 600, 3)} ${f(m / 600, 3)} ${g0} · ${sb('ρ', 'Fl')} = ${f(rhoF, 3)} ${g0} → ${word}`,
        );
        out(
          'forces',
          `${v('m')} = 450 g + ${n(p.fill, 0)} % · 300 cm³ · ${f(rhoF, 3)} ${g0} = ${n(m, 1)} g · ${sb('F', 'A')} (${de ? 'ganz unter Wasser' : 'fully under'}) = ${fN(buoyancy(rho, subShape().volume))} N`,
        );
        out(
          'frac',
          hf === null
            ? de
              ? 'In dieser Flüssigkeit kann das U-Boot nicht schweben.'
              : 'The submarine cannot hover in this liquid.'
            : de
              ? `Schweben bei ${n(hf * 100, 1)} % Füllung der Tauchzelle.`
              : `Hovers with the ballast tank ${n(hf * 100, 1)} % full.`,
        );
        out('level', null);
      }
    }

    function readoutsArch(): void {
      const st = archState();
      const V = p.V;
      const caught = ov.caught * 1e6;
      const mW = caught * liqRho();
      out(
        'meter',
        `${de ? 'in Luft' : 'in air'}: ${sb('F', 'G')} = ${fN(st.FG)} N · ${de ? 'eingetaucht' : 'immersed'}: ${v('F')} = ${fN(st.F)} N<br>${sb('F', 'A')} = ${sb('F', 'G')} − ${v('F')} = ${fN(st.FA)} N`,
      );
      out(
        'disp',
        `${v('V')} = ${n(caught, 1)} cm³ · ${v('m')} = ${n(caught, 1)} cm³ · ${f(liqRho(), 3)} g/cm³ = ${f(mW, 1)} g<br>${sb('G', de ? 'verdr' : 'displ')} = ${v('m')} · ${v('g')} = ${f(mW / 1000, 4)} kg · ${gStr} ${fmt.rel(weight(mW / 1000), 3)} ${fN(weight(mW / 1000))} N`,
      );
      out(
        'archi',
        `${sb('F', 'A')} = ${sb('ρ', 'Fl')} · ${sb('V', de ? 'verdr' : 'displ')} · ${v('g')}: ${de ? 'Die Auftriebskraft ist so groß wie die Gewichtskraft der verdrängten Flüssigkeit' : 'The buoyant force equals the weight of the displaced liquid'} (${de ? 'hier' : 'here'} ${fN(st.FA)} N ${fmt.rel(st.FA, 3)} ${fN(buoyancy(toSI(liqRho()), (st.depth / Math.cbrt(cm3(V))) * cm3(V)))} N).`,
      );
    }

    function readoutsRho(): void {
      const m = bodyRho() * p.Vp;
      out('mass', weighed ? `${v('m')} = ${f(m, 1)} g` : de ? 'noch nicht gewogen – leg die Probe auf die Waage.' : 'not weighed yet – put the sample on the balance.');
      const V2 = cylinderReading(CYL.V1, displacedInCylinder(bodyRho(), p.Vp, 1, p.push));
      const Vd = V2 - CYL.V1;
      const floatsWrong = !p.push && bodyRho() < 1;
      out(
        'vol',
        measuredV
          ? `${v('V')} = ${sb('V', '2')} − ${sb('V', '1')} = ${n(V2, 1)} ml − ${n(CYL.V1, 0)} ml = ${n(Vd, 1)} ml = ${n(Vd, 1)} cm³${floatsWrong ? (de ? '<br><strong>Achtung:</strong> Die Probe schwimmt und ist nicht ganz untergetaucht – das ist nicht ihr Volumen.' : '<br><strong>Careful:</strong> the sample floats and is not fully under – this is not its volume.') : ''}`
          : de
            ? 'noch nicht gemessen – leg die Probe in den Messzylinder.'
            : 'not measured yet – put the sample into the measuring cylinder.',
      );
      if (weighed && measuredV) {
        const rho = m / Vd;
        out('rho', `${v('ρ')} = ${frac(v('m'), v('V'))} = ${frac(`${f(m, 1)} g`, `${n(Vd, 1)} cm³`)} ${fmt.rel(rho, 2)} ${f(rho, 2)} g/cm³`);
        const id = identify(rho);
        out(
          'ident',
          `${loc(MAT_NAME[id])} (${de ? 'Tabelle' : 'table'}: ${rhoStr(MATERIAL_DENSITY[id])} g/cm³)${probe() !== 'mat' ? (de ? ` – Probe ${probe()} ist ${loc(MAT_NAME[bodyMat()])}.` : ` – sample ${probe()} is ${loc(MAT_NAME[bodyMat()]).toLowerCase()}.`) : ''}`,
        );
      } else {
        out('rho', de ? 'erst wiegen und das Volumen messen' : 'weigh and measure the volume first', false);
        out('ident', null);
      }
      const rows = MATERIALS.map((id) => `<tr${id === bodyMat() && probe() === 'mat' ? ' class="is-current"' : ''}><td>${loc(MAT_NAME[id])}</td><td>${rhoStr(MATERIAL_DENSITY[id])}</td></tr>`).join(
        '',
      );
      const lrows = LIQUIDS.map((id) => `<tr><td>${loc(LIQ_NAME[id])}</td><td>${rhoStr(LIQUID_DENSITY[id])}</td></tr>`).join('');
      out('tab', `<table class="mini-table"><tr><th>${de ? 'Stoff' : 'Material'}</th><th>ρ in g/cm³</th></tr>${rows}${lrows}</table>`);
    }

    function readoutsBall(): void {
      const TOut = KELVIN + p.Ta;
      const TIn = KELVIN + p.Ti;
      const rOut = airDensity(P0, TOut);
      const rIn = airDensity(P0, TIn);
      const num = (x: number, d: number) => (de ? f(x, d) : x.toFixed(d));
      out(
        'air',
        `${v('ρ')} = ${frac(`${v('p')} · ${v('M')}`, `${v('R')} · ${v('T')}`)} · ${de ? 'außen' : 'outside'}: ${frac(`101 325 Pa · ${num(M_AIR, 4)} kg/mol`, `${num(R_GAS, 3)} J/(mol·K) · ${num(TOut, 2)} K`)} ${fmt.rel(rOut, 3)} ${f(rOut, 3)} kg/m³<br>${de ? 'innen' : 'inside'} (${n(p.Ti, 0)} °C = ${num(TIn, 2)} K): ${f(rIn, 3)} kg/m³`.replace(
          '101 325',
          fmt.num(101325, 0),
        ),
      );
      const fo = balloonForces(p.Vb, TOut, TIn, p.ml);
      const mass = balloonEquipment(p.Vb) + p.ml;
      const T0 = liftOffTemperature(p.Vb, TOut, p.ml) - KELVIN;
      out(
        'lift',
        `(${sb('ρ', de ? 'außen' : 'out')} − ${sb('ρ', de ? 'innen' : 'in')}) · ${v('V')} = ${f(rOut - rIn, 3)} kg/m³ · ${fmt.num(p.Vb, 0)} m³ ${fmt.rel(fo.liftKg, 0)} ${fmt.num(Math.round(fo.liftKg), 0)} kg ${fo.liftKg > mass ? '&gt;' : '&lt;'} ${fmt.num(mass, 0)} kg (${de ? 'Ballon' : 'balloon'} ${fmt.num(balloonEquipment(p.Vb), 0)} kg + ${de ? 'Zuladung' : 'payload'} ${fmt.num(p.ml, 0)} kg)<br>${de ? 'Abheben ab' : 'Lift-off from'} ϑ<sub>i</sub> ${fmt.rel(T0, 0)} ${Number.isFinite(T0) ? n(T0, 0) : '—'} °C`,
      );
      const heq = equilibriumAltitude(p.Vb, TOut, TIn, p.ml);
      const H = scaleHeight(TOut);
      out(
        'eq',
        heq > 0
          ? `${v('h')} = ${v('H')} · ln ${frac(de ? 'Tragkraft am Boden' : 'lift at the ground', de ? 'Masse' : 'mass')} = ${fmt.num(Math.round(H), 0)} m · ln ${frac(`${fmt.num(Math.round(fo.liftKg), 0)} kg`, `${fmt.num(mass, 0)} kg`)} ≈ ${fmt.num(Math.round(heq / 10) * 10, 0)} m`
          : de
            ? 'Der Ballon bleibt am Boden: Die warme Luft trägt nicht genug.'
            : 'The balloon stays on the ground: the warm air does not lift enough.',
      );
    }

    function readoutNow(): void {
      if (mode() === 'ball') {
        const TOut = KELVIN + p.Ta;
        const pp = pressureAt(bm.h, TOut);
        const word =
          Math.abs(bm.v) < 0.05
            ? bm.h < 0.01
              ? ctx.t('ground')
              : ctx.t('hovering')
            : tr(bm.v > 0 ? 'nowRising' : 'nowFalling', {
                v: n(Math.abs(bm.v), 1),
              });
        out('now', `${v('h')} = ${fmt.num(Math.round(bm.h), 0)} m · ${v('p')} = ${fmt.num(Math.round(pp / 100), 0)} hPa · ${de ? 'innen' : 'inside'} ${n(bm.TIn - KELVIN, 0)} °C · ${word}`);
      } else if (mode() === 'arch') readoutsArch();
      else out('now', null);
    }

    function updateReadouts(): void {
      const keep = new Set(
        mode() === 'float'
          ? ['cmp', 'forces', 'frac', 'level']
          : mode() === 'arch'
            ? ['meter', 'disp', 'archi']
            : mode() === 'rho'
              ? ['mass', 'vol', 'rho', 'ident', 'tab']
              : ['air', 'lift', 'eq', 'now'],
      );
      for (const key of ALL) if (!keep.has(key)) out(key, null);
      if (mode() === 'float') readoutsFloat();
      else if (mode() === 'arch') readoutsArch();
      else if (mode() === 'rho') readoutsRho();
      else {
        readoutsBall();
        readoutNow();
      }
    }

    /* ================================================================== */
    /* Zeiger und Tastatur                                                 */
    /* ================================================================== */
    const inRect = (r: Rect | null, x: number, y: number) => !!r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

    function hit(px: number, py: number): string | null {
      if (ctx.locked) return null;
      if (mode() === 'float') {
        if (fgeo) {
          const b = fgeo.body;
          const d = floatDims().d * fgeo.k;
          if (px >= b.x - 6 && px <= b.x + b.w + d * OBL[0] + 6 && py >= b.y + d * OBL[1] - 6 && py <= b.y + b.h + 6) return 'body';
        }
        for (const it of ladderItems) if (inRect(it.rect, px, py)) return it.id;
        return null;
      }
      if (mode() === 'arch') return ageo && inRect(ageo.hang, px, py) ? 'hang' : null;
      if (mode() === 'rho') {
        const c = rhoGeoCache;
        if (!c) return null;
        if (inRect(c.bodyRect, px, py)) return 'body';
        if (inRect(c.scaleRect, px, py)) return 'scale';
        if (inRect(c.cylRect, px, py)) return 'cyl';
        if (inRect(c.tableRect, px, py)) return 'table';
        return null;
      }
      if (ballGeo) {
        if (inRect(ballGeo.burner, px, py)) return 'burner';
        if (inRect(ballGeo.vent, px, py)) return 'vent';
      }
      return null;
    }

    function tapLadder(id: string): void {
      if (ctx.locked) return;
      if (id.startsWith('mat:')) {
        const m = id.slice(4) as MaterialId;
        if (obj() !== 'block') ctx.set({ obj: 'block', mat: m });
        else if (p.mat !== m) ctx.set({ mat: m });
      } else if (id.startsWith('liq:')) {
        const l = id.slice(4) as LiquidId;
        if (p.liq !== l) ctx.set({ liq: l });
      }
    }

    let press: { id: string; px: number; py: number; moved: boolean } | null = null;
    surface.addTarget({
      contains: (px: number, py: number) => hit(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hit(q.px, q.py);
        if (!id) return false;
        press = { id, px: q.px, py: q.py, moved: false };
        if (id === 'body' && mode() === 'float' && fgeo) {
          const geo = fgeo;
          const dims = floatDims();
          const xw = (q.px - geo.bodyShift[0] - geo.x0) / geo.k;
          const zw = (geo.y0 + geo.bodyShift[1] - q.py) / geo.k;
          floatDrag = {
            dx: bx - xw,
            dz: mo.z - zw,
            lastX: bx,
            lastZ: mo.z,
            vz: 0,
            t: performance.now(),
          };
          void dims;
          surface.setCursor('grabbing');
        } else if (id === 'hang' && mode() === 'arch') {
          archDrag = { y0: q.py, d0: dAct };
          surface.setCursor('grabbing');
        } else if (id === 'body' && mode() === 'rho' && rhoGeoCache) {
          const c = rhoGeoCache;
          const now = lumpNow();
          rhoDrag = {
            px: q.px,
            py: q.py,
            dx: c.X(now.x) - q.px,
            dy: c.Y(now.z) - q.py,
          };
          surface.setCursor('grabbing');
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!press) return;
        if (!press.moved && Math.hypot(q.px - press.px, q.py - press.py) > 4) press.moved = true;
        if (floatDrag && fgeo) {
          const geo = fgeo;
          const dims = floatDims();
          const xw = (q.px - geo.bodyShift[0] - geo.x0) / geo.k + floatDrag.dx;
          const zw = (geo.y0 + geo.bodyShift[1] - q.py) / geo.k + floatDrag.dz;
          const nowT = performance.now();
          const dtt = Math.max(1e-3, (nowT - floatDrag.t) / 1000);
          const nz = clamp(zw, 0, TANK.H + 0.06);
          floatDrag.vz = 0.6 * floatDrag.vz + 0.4 * ((nz - mo.z) / dtt);
          floatDrag.t = nowT;
          bx = clamp(xw, dims.w / 2 + 0.004, TANK.W - dims.w / 2 - 0.004);
          mo = { z: nz, v: 0 };
        } else if (archDrag && ageo) {
          const a = Math.cbrt(cm3(p.V)) * ageo.k;
          const d = clamp(archDrag.d0 + ((q.py - archDrag.y0) / a) * 100, 0, 100);
          dAct = d;
          ctx.set({ d: Math.round(d) });
        } else if (rhoDrag) {
          rhoDrag.px = q.px;
          rhoDrag.py = q.py;
        }
        ctx.requestRender();
      },
      pointerUp: () => {
        if (floatDrag) {
          mo = { z: mo.z, v: clamp(floatDrag.vz, -1.5, 1.5) };
          floatDrag = null;
        }
        if (archDrag) {
          archDrag = null;
          dAct = p.d;
        }
        if (rhoDrag && rhoGeoCache) {
          const c = rhoGeoCache;
          const nowX = (rhoDrag.px + rhoDrag.dx - c.X(0)) / c.k;
          const nowZ = (c.floorY - (rhoDrag.py + rhoDrag.dy)) / c.k;
          rhoDrag = null;
          const target: Pos = nowX < (RHO_X.scale + RHO_X.table) / 2 ? 'scale' : nowX > (RHO_X.table + RHO_X.cyl) / 2 ? 'cyl' : 'table';
          // vom Loslassort weich an den Zielort
          pathStart = { x: nowX, z: Math.max(0, nowZ) };
          if (target === p.pos || ctx.locked) {
            posFrom = p.pos as Pos;
            posTween.play(700);
          } else ctx.set({ pos: target });
        } else if (press && !press.moved) {
          const id = press.id;
          if (mode() === 'float' && (id.startsWith('mat:') || id.startsWith('liq:'))) tapLadder(id);
          else if (mode() === 'rho' && (id === 'scale' || id === 'cyl' || id === 'table')) setPos(id);
          else if (mode() === 'ball' && !ctx.locked) {
            if (id === 'burner') ctx.set({ Ti: Math.min(120, p.Ti + 5) });
            else if (id === 'vent') ctx.set({ Ti: Math.max(20, p.Ti - 5) });
          }
        }
        press = null;
        surface.setCursor('');
        lastFrame = performance.now();
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        if (!q) return;
        const id = hit(q.px, q.py);
        surface.setCursor(id === 'body' || id === 'hang' ? 'grab' : id ? 'pointer' : '');
      },
      wheel: () => false,
    });

    function updateKeyTargets(): void {
      if (ctx.locked) {
        ctx.setKeyTargets([]);
        return;
      }
      if (mode() === 'float') {
        const list = [
          {
            id: 'drop',
            label: de ? 'Körper hochheben und fallen lassen' : 'Lift the body and drop it',
            activate: () => dropBody(true),
          },
          {
            id: 'dunk',
            label: de ? 'Körper unter Wasser drücken und loslassen' : 'Push the body under and let go',
            activate: () => dunkBody(),
          },
          ...ladderItems.map((it) => ({
            id: it.id,
            label: it.id.startsWith('mat:')
              ? `${de ? 'Stoff' : 'Material'}: ${loc(MAT_NAME[it.id.slice(4) as MaterialId])}`
              : `${de ? 'Flüssigkeit' : 'Liquid'}: ${loc(LIQ_NAME[it.id.slice(4) as LiquidId])}`,
            rect: it.rect,
            activate: () => tapLadder(it.id),
          })),
        ];
        ctx.setKeyTargets(list);
      } else if (mode() === 'arch') {
        ctx.setKeyTargets([
          {
            id: 'deeper',
            label: de ? 'Körper 10 % tiefer eintauchen' : 'Lower the body 10 % deeper',
            activate: () => ctx.set({ d: Math.min(100, p.d + 10) }),
          },
          {
            id: 'higher',
            label: de ? 'Körper 10 % herausziehen' : 'Raise the body by 10 %',
            activate: () => ctx.set({ d: Math.max(0, p.d - 10) }),
          },
        ]);
      } else if (mode() === 'rho') {
        const c = rhoGeoCache;
        ctx.setKeyTargets([
          {
            id: 'scale',
            label: de ? 'Probe auf die Waage legen' : 'Put the sample on the balance',
            ...(c ? { rect: c.scaleRect } : {}),
            activate: () => setPos('scale'),
          },
          {
            id: 'cyl',
            label: de ? 'Probe in den Messzylinder legen' : 'Put the sample into the measuring cylinder',
            ...(c ? { rect: c.cylRect } : {}),
            activate: () => setPos('cyl'),
          },
          {
            id: 'table',
            label: de ? 'Probe auf den Tisch legen' : 'Put the sample on the table',
            ...(c ? { rect: c.tableRect } : {}),
            activate: () => setPos('table'),
          },
        ]);
      } else {
        ctx.setKeyTargets([
          {
            id: 'burner',
            label: de ? 'Brenner: Innentemperatur +5 °C' : 'Burner: inside temperature +5 °C',
            ...(ballGeo ? { rect: ballGeo.burner } : {}),
            activate: () => ctx.set({ Ti: Math.min(120, p.Ti + 5) }),
          },
          {
            id: 'vent',
            label: de ? 'Ventil: Innentemperatur −5 °C' : 'Vent: inside temperature −5 °C',
            ...(ballGeo ? { rect: ballGeo.vent } : {}),
            activate: () => ctx.set({ Ti: Math.max(20, p.Ti - 5) }),
          },
        ]);
      }
    }

    /* ================================================================== */
    /* Ablauf                                                              */
    /* ================================================================== */
    function startMode(fromInit: boolean): void {
      intro.play();
      if (mode() === 'float') {
        resetWaves();
        shipWater = 0;
        fillAct = p.fill / 100;
        bx = obj() === 'ship' ? TANK.W * 0.4 : TANK.W * 0.46;
        dropBody(true);
        if (fromInit && prefersReducedMotion()) mo = { z: floatRest(), v: 0 };
      } else if (mode() === 'arch') resetArch(true);
      else if (mode() === 'rho') {
        posFrom = 'table';
        weighed = p.pos === 'scale' || p.pos === 'cyl';
        measuredV = p.pos === 'cyl';
        if (p.pos !== 'table') posTween.play();
      } else resetBalloon(true);
    }

    let liveTimer = 0;

    return {
      update(changed, source) {
        const full = source === 'init' || source === 'replace';
        if (changed.has('mode') && source === 'input' && p.mode === 'arch' && bodyRho() < liqRho()) ctx.set({ mat: 'alu' });
        if (full || changed.has('mode')) startMode(source === 'init');
        else {
          if (changed.has('liq')) {
            liqFrom = (lastLiq ?? p.liq) as LiquidId;
            liqFade.play();
          }
          if (changed.has('mat') && lastMat) {
            matFrom = lastMat;
            matFade.play();
          }
          if (mode() === 'float') {
            if (changed.has('obj')) {
              resetWaves();
              shipWater = 0;
              fillAct = p.fill / 100;
              bx = obj() === 'ship' ? TANK.W * 0.4 : TANK.W * 0.46;
              dropBody(true);
            }
            if (changed.has('V')) {
              const dims = floatDims();
              bx = clamp(bx, dims.w / 2 + 0.004, TANK.W - dims.w / 2 - 0.004);
              lastSub = floatBody().shape.submerged(floatLevel() - mo.z);
            }
          } else if (mode() === 'arch') {
            if (changed.has('mat') || changed.has('V') || changed.has('liq') || changed.has('rk')) resetArch(true);
          } else if (mode() === 'rho') {
            if (changed.has('pos')) {
              posFrom = (lastPos ?? 'table') as Pos;
              if (source !== 'sim') pathStart = null;
              posTween.play(pathStart ? 800 : p.pos === 'cyl' || posFrom === 'cyl' ? 1400 : 950);
              if (p.pos === 'scale') weighed = true;
              if (p.pos === 'cyl') measuredV = true;
            }
            if (changed.has('probe') || changed.has('mat') || changed.has('Vp') || changed.has('rk')) {
              weighed = p.pos === 'scale';
              measuredV = p.pos === 'cyl';
            }
          } else if (mode() === 'ball') {
            if (changed.has('Vb') || changed.has('ml') || changed.has('Ta')) {
              /* Bewegung läuft mit den neuen Werten weiter */
            }
          }
        }
        lastLiq = p.liq as LiquidId;
        lastMat = p.mat as MaterialId;
        lastPos = p.pos as Pos;
        lastFrame = performance.now();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'drop') dropBody(true);
        else if (id === 'dunk') dunkBody();
        else if (id === 'down') ctx.set({ d: 100 });
        else if (id === 'up') ctx.set({ d: 0 });
        else if (id === 'refill') {
          refill();
          updateReadouts();
        } else if (id === 'next') {
          const order: Pos[] = ['table', 'scale', 'cyl'];
          const i = order.indexOf(p.pos as Pos);
          setPos(order[(i + 1) % 3]!);
        } else if (id === 'new') {
          const ids = Object.keys(PROBES).filter((k) => k !== p.probe) as Exclude<Probe, 'mat'>[];
          const pick = ids[Math.floor(Math.random() * ids.length)]!;
          ctx.set({ probe: pick, pos: 'table' });
        } else if (id === 'land') {
          resetBalloon(true);
          updateReadouts();
        }
        lastFrame = performance.now();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = computeLayout();
        let busy = false;
        if (mode() === 'float') busy = stepFloat(frameDt);
        else if (mode() === 'arch') busy = stepArch(frameDt);
        else if (mode() === 'ball') busy = stepBall(frameDt);
        chart.resize();
        surface.begin();
        const ia = stage(0.2, 0.5);
        if (mode() === 'float') {
          drawFloatScene(lay.scene);
          drawLadder(lay.panel, ia);
        } else if (mode() === 'arch') {
          drawArchScene(lay.scene);
          drawArchChart(ia);
        } else if (mode() === 'rho') {
          drawRhoScene(lay.scene);
          drawProtocol(ia);
        } else {
          drawBalloonScene(lay.scene);
          drawBalloonCard(ia);
        }
        updateKeyTargets();
        if (now - liveTimer > 150) {
          liveTimer = now;
          readoutNow();
        }
        if (busy || animating || intro.running || liqFade.running || matFade.running || posTween.running || !!rhoDrag || !!floatDrag || !!archDrag) ctx.requestRender();
        else if (mode() === 'arch') readoutsArch();
      },

      destroy: () => surface.destroy(),
    };
  },
});
