import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  BATTERY_U,
  DEVICE_R,
  filamentTemperature,
  fuseBlows,
  glowOf,
  LAMP_P_NOMINAL,
  MATERIAL_IDS,
  MATERIALS,
  solveCircuit,
  type CircuitResult,
  type Device,
  type MaterialId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Pt = [number, number];
type Mode = 'circuit' | 'test';
type View = 'both' | 'real' | 'plan';
type Flow = 'e' | 'tech' | 'none';
type ObjChoice = MaterialId | 'none';
type EdgeId = 'w1' | 'sw' | 'w2' | 'dev' | 'br' | 'w3' | 'fu' | 'w4' | 'obj';

/** Stromstärke mit Lampe (Bezug für die Geschwindigkeit der Elektronen). */
const I_REF = BATTERY_U / (DEVICE_R.lamp + 0.7);
/** Abstand der Elektronen und der Pfeile (in Einheiten des Aufbaus). */
const GAP = 12;
const ARROW_GAP = 34;

/* ------------------------------------------------------------------ */
/* Geometrie                                                           */
/* ------------------------------------------------------------------ */

/** Linienzug mit Bogenlänge (für Elektronen, Pfeile und Leitungen). */
class Path {
  readonly cum: number[] = [0];
  readonly length: number;
  constructor(readonly pts: Pt[]) {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1]!;
      const b = pts[i]!;
      this.cum.push(this.cum[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
    }
    this.length = this.cum[this.cum.length - 1]!;
  }

  /** Punkt und Richtung (Winkel) bei der Bogenlänge s. */
  at(s: number): [number, number, number] {
    const pts = this.pts;
    if (pts.length < 2) return [pts[0]?.[0] ?? 0, pts[0]?.[1] ?? 0, 0];
    const t = Math.max(0, Math.min(this.length, s));
    let lo = 0;
    let hi = this.cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (this.cum[mid]! <= t) lo = mid;
      else hi = mid;
    }
    const a = pts[lo]!;
    const b = pts[hi]!;
    const seg = this.cum[hi]! - this.cum[lo]! || 1;
    const u = (t - this.cum[lo]!) / seg;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }

  trace(g: CanvasRenderingContext2D, dx = 0, dy = 0): void {
    g.beginPath();
    this.pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x + dx, y + dy) : g.lineTo(x + dx, y + dy)));
  }
}

function bezier(p0: Pt, c1: Pt, c2: Pt, p3: Pt, n = 28): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

const add = (a: Pt, dx: number, dy: number): Pt => [a[0] + dx, a[1] + dy];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPt = (a: Pt, b: Pt, t: number): Pt => [mix(a[0], b[0], t), mix(a[1], b[1], t)];
const mixRect = (a: Rect, b: Rect, t: number): Rect => ({ x: mix(a.x, b.x, t), y: mix(a.y, b.y, t), w: mix(a.w, b.w, t), h: mix(a.h, b.h, t) });
const inRect = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/** Farbe zwischen zwei Hex-Farben mischen. */
function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(mix((pa >> shift) & 255, (pb >> shift) & 255, Math.max(0, Math.min(1, t))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/** Farbe einer glühenden Wendel bei der Temperatur T (in K). */
function filamentColor(T: number): string {
  const stops: [number, string][] = [
    [600, '#4a4f57'],
    [950, '#7a1d0c'],
    [1300, '#d0400f'],
    [1800, '#ff8a1f'],
    [2300, '#ffd05a'],
    [2800, '#fff4d6'],
  ];
  if (T <= stops[0]![0]) return stops[0]![1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]!;
    const [t0, c0] = stops[i - 1]!;
    if (T <= t1) return mixHex(c0, c1, (T - t0) / (t1 - t0));
  }
  return stops[stops.length - 1]![1];
}

/** Farbe des Lichtscheins (wärmer bei niedriger Temperatur). */
function haloColor(T: number): [number, number, number] {
  if (T < 1500) return [255, 120, 40];
  if (T < 2200) return [255, 176, 70];
  return [255, 222, 140];
}

/** Sichtbare Geschwindigkeit der Elektronen (Einheiten/s): proportional zu I, bei Kurzschluss gestaucht. */
function flowSpeed(I: number): number {
  const r = Math.abs(I) / I_REF;
  return 30 * (r <= 1.5 ? r : 1.5 + 2 * Math.log(r / 1.5));
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Einfacher Stromkreis: Batterie, Schalter und Lampe (oder Motor, Klingel)
 * als Aufbau und als Schaltplan nebeneinander. Elektronen (oder die
 * technische Stromrichtung) fließen sichtbar, sobald der Kreis geschlossen
 * ist. Dazu Kurzschluss mit und ohne Sicherung und ein Leitertest mit
 * Gegenständen in einer Prüfstrecke.
 */
export default defineSimulation({
  id: 'einfacher-stromkreis',
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'circuit', label: L('Stromkreis mit Schalter', 'Circuit with a switch') },
        { value: 'test', label: L('Leiter oder Nichtleiter?', 'Conductor or insulator?') },
      ],
      default: 'circuit',
    },
    {
      key: 'dev',
      type: 'choice',
      label: L('Elektrisches Gerät', 'Electrical device'),
      options: [
        { value: 'lamp', label: L('Glühlampe', 'Light bulb') },
        { value: 'motor', label: L('Elektromotor', 'Electric motor') },
        { value: 'bell', label: L('Klingel', 'Bell') },
      ],
      default: 'lamp',
      visibleIf: (v) => v.mode === 'circuit',
    },
    {
      key: 'on',
      type: 'boolean',
      label: L('Schalter geschlossen', 'Switch closed'),
      help: L('Oder: den Schalter im Bild antippen.', 'Or tap the switch in the picture.'),
      default: false,
      visibleIf: (v) => v.mode === 'circuit',
    },
    {
      key: 'sc',
      type: 'boolean',
      label: L('Leitung direkt über das Gerät legen (Kurzschluss)', 'Wire directly across the device (short circuit)'),
      default: false,
      visibleIf: (v) => v.mode === 'circuit',
    },
    { key: 'fuse', type: 'boolean', label: L('Sicherung im Stromkreis', 'Fuse in the circuit'), default: false, visibleIf: (v) => v.mode === 'circuit' },
    {
      key: 'obj',
      type: 'choice',
      label: L('Gegenstand in der Prüfstrecke', 'Object in the test gap'),
      help: L('Oder: einen Gegenstand im Bild antippen.', 'Or tap an object in the picture.'),
      options: [
        { value: 'none', label: L('keiner', 'none') },
        { value: 'clip', label: L('Büroklammer', 'Paper clip') },
        { value: 'coin', label: L('Münze', 'Coin') },
        { value: 'foil', label: L('Alufolie', 'Aluminium foil') },
        { value: 'lead', label: L('Bleistiftmine', 'Pencil lead') },
        { value: 'wood', label: L('Holzstab', 'Wooden stick') },
        { value: 'eraser', label: L('Radiergummi', 'Eraser') },
        { value: 'ruler', label: L('Kunststofflineal', 'Plastic ruler') },
        { value: 'glass', label: L('Glasstab', 'Glass rod') },
      ],
      default: 'none',
      visibleIf: (v) => v.mode === 'test',
    },
    {
      key: 'flow',
      type: 'choice',
      group: 'view',
      label: L('Strom darstellen als', 'Show the current as'),
      options: [
        { value: 'e', label: L('Elektronen', 'Electrons') },
        { value: 'tech', label: L('technische Stromrichtung', 'Conventional current') },
        { value: 'none', label: L('nicht (wie im Versuch)', 'hidden (as in the lab)') },
      ],
      default: 'e',
    },
    {
      key: 'view',
      type: 'choice',
      group: 'view',
      label: L('Darstellung', 'View'),
      options: [
        { value: 'both', label: L('Aufbau und Schaltplan', 'Set-up and diagram') },
        { value: 'real', label: L('nur Aufbau', 'Set-up only') },
        { value: 'plan', label: L('nur Schaltplan', 'Diagram only') },
      ],
      default: 'both',
    },
    { key: 'lbl', type: 'boolean', group: 'view', label: L('Beschriftungen', 'Labels'), default: true },
  ],
  actions: [
    { id: 'switch', label: L('Schalter betätigen', 'Flip the switch'), primary: true, visibleIf: (v) => v.mode === 'circuit' },
    { id: 'replace', label: L('Neue Sicherung einsetzen', 'Insert a new fuse'), visibleIf: (v) => v.mode === 'circuit' && v.fuse === true },
    { id: 'next', label: L('Nächster Gegenstand', 'Next object'), primary: true, visibleIf: (v) => v.mode === 'test' },
    { id: 'clear', label: L('Prüfprotokoll löschen', 'Clear the record'), visibleIf: (v) => v.mode === 'test' },
  ],
  readouts: [
    { key: 'state', label: L('Beobachtung', 'Observation') },
    { key: 'cur', label: L('Stromstärke', 'Current') },
    { key: 'dir', label: L('Stromrichtung', 'Direction of the current') },
    { key: 'log', label: L('Prüfprotokoll', 'Test record') },
  ],
  presets: [
    { id: 'start', label: L('Lampe mit Schalter', 'Lamp with a switch'), values: {} },
    { id: 'motor', label: L('Elektromotor', 'Electric motor'), values: { dev: 'motor', on: true } },
    { id: 'tech', label: L('Technische Stromrichtung', 'Conventional current'), values: { on: true, flow: 'tech' } },
    { id: 'short', label: L('Kurzschluss', 'Short circuit'), values: { on: true, sc: true } },
    { id: 'fuse', label: L('Kurzschluss mit Sicherung', 'Short circuit with a fuse'), values: { on: true, fuse: true } },
    { id: 'test', label: L('Leiter oder Nichtleiter?', 'Conductor or insulator?'), values: { mode: 'test', obj: 'clip' } },
  ],
  strings: {
    de: {
      canvas: 'Einfacher Stromkreis aus Batterie, Schalter und Glühlampe (oder Motor bzw. Klingel) als Aufbau und als Schaltplan; im Leitertest mit Prüfstrecke und Gegenständen',
      plan: 'Schaltplan',
      battery: 'Batterie 4,5 V',
      batteryShort: 'Batterie',
      switch: 'Schalter',
      lamp: 'Glühlampe',
      motor: 'Elektromotor',
      bell: 'Klingel',
      fuse: 'Sicherung',
      fuseBlown: 'Sicherung durchgeschmolzen',
      wire: 'Leitung',
      looseWire: 'Leitung zum Überbrücken',
      gap: 'Prüfstrecke',
      tap: 'antippen',
      tapSwitch: 'Schalter antippen',
      tapWire: 'antippen: über das Gerät legen',
      tray: 'Gegenstände zum Prüfen – antippen',
      short: 'Kurzschluss!',
      hot: 'Leitung und Batterie werden heiß',
      conductor: 'Leiter',
      insulator: 'Nichtleiter',
      clip: 'Büroklammer',
      coin: 'Münze',
      foil: 'Alufolie',
      lead: 'Bleistiftmine',
      wood: 'Holzstab',
      eraser: 'Radiergummi',
      ruler: 'Lineal',
      glass: 'Glasstab',
      mclip: 'Stahl',
      mcoin: 'Metall',
      mfoil: 'Aluminium',
      mlead: 'Graphit',
      mwood: 'Holz',
      meraser: 'Kunststoff',
      mruler: 'Kunststoff',
      mglass: 'Glas',
      onlamp: 'Die Lampe leuchtet.',
      onmotor: 'Der Motor dreht sich.',
      onbell: 'Die Klingel läutet.',
      offlamp: 'Die Lampe leuchtet nicht.',
      offmotor: 'Der Motor steht still.',
      offbell: 'Die Klingel ist still.',
      theLamp: 'der Lampe',
      theMotor: 'dem Motor',
      theBell: 'der Klingel',
      open: 'Offener Stromkreis: Der Schalter unterbricht den Weg der Elektronen. Es fließt kein Strom. {off}',
      closed: 'Geschlossener Stromkreis: Von einem Pol der Batterie führt ein durchgehender Weg aus Leitern über Schalter und Gerät zum anderen Pol. {on}',
      shortText: 'Kurzschluss! Die Leitung verbindet die Anschlüsse fast ohne Widerstand – der Strom fließt an {dev} vorbei. {off} Die Stromstärke wird sehr groß, Leitung und Batterie werden heiß (Brandgefahr).',
      blown: 'Die Sicherung ist durchgeschmolzen und hat den Stromkreis unterbrochen – so schützt sie vor Überhitzung. Erst die Ursache (den Kurzschluss) beseitigen, dann eine neue Sicherung einsetzen.',
      testNone: 'Die Prüfstrecke ist offen. Tippe einen Gegenstand an, um ihn zwischen die Klemmen zu legen.',
      testYes: '{obj} ({mat}) ist ein Leiter: Der Stromkreis ist geschlossen, die Lampe leuchtet.',
      testLead: '{obj} ({mat}) leitet, aber schlechter als Metall: Die Lampe leuchtet schwächer.',
      testNo: '{obj} ({mat}) ist ein Nichtleiter (Isolator): Der Stromkreis bleibt unterbrochen, die Lampe bleibt dunkel.',
      curNone: 'I = 0 A – kein Strom',
      curOn: 'I ≈ {I} A',
      curShort: 'I ≈ {I} A – etwa {k}-mal so groß wie mit Lampe!',
      dirE: 'Die Elektronen (blaue Punkte) bewegen sich außerhalb der Batterie vom Minuspol (−) durch Leitungen und Gerät zum Pluspol (+). Sie werden dabei nicht verbraucht.',
      dirTech: 'Technische Stromrichtung (rote Pfeile): außerhalb der Batterie vom Pluspol (+) zum Minuspol (−) – also entgegen der Bewegung der Elektronen.',
      dirNone: 'Wie im echten Versuch: Den Strom selbst sieht man nicht, nur seine Wirkungen (Licht, Wärme, Bewegung, Klang).',
      dirStill: 'Die Elektronen sind überall in den Leitern vorhanden – sie bewegen sich aber nur, wenn der Stromkreis geschlossen ist.',
      legend: 'Schaltzeichen',
      sBattery: 'Batterie',
      sSwitch: 'Schalter (offen)',
      sSwitchOn: 'Schalter (geschlossen)',
      sLamp: 'Glühlampe',
      sMotor: 'Elektromotor',
      sBell: 'Klingel',
      sFuse: 'Sicherung',
      sNode: 'Verzweigung',
      sTerm: 'Anschluss',
      thObj: 'Gegenstand',
      thMat: 'Stoff',
      thRes: 'Ergebnis',
      logNone: 'Noch nichts geprüft.',
      leadNote: 'Leiter (schwächer)',
    },
    en: {
      canvas: 'Simple circuit with a battery, a switch and a light bulb (or a motor or a bell) as a set-up and as a circuit diagram; in the conductor test with a test gap and objects',
      plan: 'Circuit diagram',
      battery: 'Battery 4.5 V',
      batteryShort: 'Battery',
      switch: 'Switch',
      lamp: 'Light bulb',
      motor: 'Electric motor',
      bell: 'Bell',
      fuse: 'Fuse',
      fuseBlown: 'Fuse blown',
      wire: 'Wire',
      looseWire: 'Bridging wire',
      gap: 'Test gap',
      tap: 'tap',
      tapSwitch: 'tap the switch',
      tapWire: 'tap: connect across the device',
      tray: 'Objects to test – tap one',
      short: 'Short circuit!',
      hot: 'the wire and the battery get hot',
      conductor: 'conductor',
      insulator: 'insulator',
      clip: 'Paper clip',
      coin: 'Coin',
      foil: 'Foil',
      lead: 'Pencil lead',
      wood: 'Wooden stick',
      eraser: 'Eraser',
      ruler: 'Ruler',
      glass: 'Glass rod',
      mclip: 'steel',
      mcoin: 'metal',
      mfoil: 'aluminium',
      mlead: 'graphite',
      mwood: 'wood',
      meraser: 'plastic',
      mruler: 'plastic',
      mglass: 'glass',
      onlamp: 'The bulb lights up.',
      onmotor: 'The motor turns.',
      onbell: 'The bell rings.',
      offlamp: 'The bulb is off.',
      offmotor: 'The motor stands still.',
      offbell: 'The bell is silent.',
      theLamp: 'the bulb',
      theMotor: 'the motor',
      theBell: 'the bell',
      open: 'Open circuit: the switch interrupts the path of the electrons. No current flows. {off}',
      closed: 'Closed circuit: there is a continuous path of conductors from one terminal of the battery through the switch and the device to the other terminal. {on}',
      shortText: 'Short circuit! The wire connects the terminals with almost no resistance – the current bypasses {dev}. {off} The current becomes very large; the wire and the battery get hot (fire hazard).',
      blown: 'The fuse has melted and broken the circuit – this protects against overheating. First remove the cause (the short circuit), then insert a new fuse.',
      testNone: 'The test gap is open. Tap an object to place it between the clips.',
      testYes: '{obj} ({mat}) is a conductor: the circuit is closed and the bulb lights up.',
      testLead: '{obj} ({mat}) conducts, but less well than metal: the bulb is dimmer.',
      testNo: '{obj} ({mat}) is an insulator: the circuit stays open and the bulb stays dark.',
      curNone: 'I = 0 A – no current',
      curOn: 'I ≈ {I} A',
      curShort: 'I ≈ {I} A – about {k} times as large as with the bulb!',
      dirE: 'The electrons (blue dots) move outside the battery from the negative terminal (−) through the wires and the device to the positive terminal (+). They are not used up.',
      dirTech: 'Conventional current (red arrows): outside the battery from the positive terminal (+) to the negative terminal (−) – opposite to the motion of the electrons.',
      dirNone: 'As in the real experiment: you cannot see the current itself, only its effects (light, heat, motion, sound).',
      dirStill: 'The electrons are present everywhere in the conductors – but they only move when the circuit is closed.',
      legend: 'Circuit symbols',
      sBattery: 'Battery',
      sSwitch: 'Switch (open)',
      sSwitchOn: 'Switch (closed)',
      sLamp: 'Light bulb',
      sMotor: 'Electric motor',
      sBell: 'Bell',
      sFuse: 'Fuse',
      sNode: 'Junction',
      sTerm: 'Terminal',
      thObj: 'Object',
      thMat: 'Material',
      thRes: 'Result',
      logNone: 'Nothing tested yet.',
      leadNote: 'conductor (weaker)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const g = surface.g;
    const tr = (key: string, vars: Record<string, string> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const mode = () => p.mode as Mode;
    const view = () => p.view as View;
    const flow = () => p.flow as Flow;
    const device = (): Device => (mode() === 'test' ? 'lamp' : (p.dev as Device));
    const obj = () => p.obj as ObjChoice;
    const reduced = prefersReducedMotion();

    /* ---------- Zustand ---------- */
    const switchT = new Tween(340, ease.inOutCubic);
    let switchFrom = p.on ? 1 : 0;
    const bridgeT = new Tween(700, ease.inOutCubic);
    let bridgeFrom = p.sc ? 1 : 0;
    const viewT = new Tween(560, ease.inOutCubic);
    let viewFrom: View = view();
    let lastView: View = view();
    const objT = new Tween(620, ease.inOutCubic);
    let objFrom: ObjChoice = obj();
    let lastObj: ObjChoice = obj();
    const sparkT = new Tween(1100, ease.outCubic);
    let fuseBlown = false;
    let overload = 0;
    let heat = 0;
    const phase: Record<EdgeId, number> = { w1: 0, sw: 0, w2: 0, dev: 0, br: 0, w3: 0, fu: 0, w4: 0, obj: 0 };
    let motorAngle = 0;
    let bellTime = 0;
    let tested: MaterialId[] = [];
    let usedSwitch = p.on;
    let hoverId: string | null = null;
    /** Zuletzt angetipptes Bauteil (auf Touch-Geräten statt Überfahren mit der Maus). */
    let focus: { id: string; until: number } | null = null;
    const hoveredNow = () => hoverId ?? (focus && performance.now() < focus.until ? focus.id : null);
    let hovered: string | null = null;
    let lastFrame = performance.now();
    let hits: { id: string; r: Rect }[] = [];

    const switchClosed01 = () => {
      const target = p.on ? 1 : 0;
      return switchT.running ? mix(switchFrom, target, switchT.value) : target;
    };
    const bridge01 = () => {
      const target = p.sc && mode() === 'circuit' ? 1 : 0;
      return bridgeT.running ? mix(bridgeFrom, target, bridgeT.value) : target;
    };
    const fuseActive = () => mode() === 'circuit' && p.fuse;

    function result(): CircuitResult {
      if (mode() === 'test') {
        const o = obj();
        const closed = o !== 'none' && !objT.running;
        return solveCircuit({ device: 'lamp', closed, seriesR: o === 'none' ? Infinity : MATERIALS[o].R });
      }
      return solveCircuit({
        device: device(),
        closed: p.on && !switchT.running,
        bridge: p.sc && !bridgeT.running,
        fuse: !p.fuse ? 'none' : fuseBlown ? 'blown' : 'ok',
      });
    }

    function edgeCurrent(e: EdgeId, res: CircuitResult): number {
      if (e === 'dev') return res.Idevice;
      if (e === 'br') return res.Ibridge;
      return res.I;
    }

    const lampT = (res: CircuitResult) => (device() === 'lamp' ? filamentTemperature(res.Pdevice, LAMP_P_NOMINAL) : 293);

    /* ---------- Ergebnisse ---------- */
    const devKey = () => device();
    function updateReadouts(): void {
      const res = solveTarget();
      const d = devKey();
      const onText = ctx.t(`on${d}`);
      const offText = ctx.t(`off${d}`);
      if (mode() === 'test') {
        const o = obj();
        if (o === 'none') ctx.readout('state', ctx.t('testNone'));
        else {
          const vars = { obj: ctx.t(o), mat: ctx.t(`m${o}`) };
          ctx.readout('state', tr(o === 'lead' ? 'testLead' : MATERIALS[o].conductor ? 'testYes' : 'testNo', vars));
        }
      } else if (p.fuse && fuseBlown) ctx.readout('state', ctx.t('blown'));
      else if (!p.on) ctx.readout('state', tr('open', { off: offText }));
      else if (p.sc) ctx.readout('state', tr('shortText', { off: offText, dev: ctx.t(d === 'lamp' ? 'theLamp' : d === 'motor' ? 'theMotor' : 'theBell') }));
      else ctx.readout('state', tr('closed', { on: onText }));

      if (res.I <= 1e-9) ctx.readout('cur', ctx.t('curNone'));
      else if (res.short) ctx.readout('cur', tr('curShort', { I: fmt.num(res.I, 1), k: fmt.num(Math.round(res.I / I_REF), 0) }));
      else ctx.readout('cur', tr('curOn', { I: fmt.num(res.I, 2) }));

      const moving = res.I > 1e-9;
      const f = flow();
      const base = f === 'e' ? ctx.t('dirE') : f === 'tech' ? ctx.t('dirTech') : ctx.t('dirNone');
      ctx.readout('dir', moving || f === 'none' ? base : `${base} ${ctx.t('dirStill')}`);

      if (mode() === 'test') {
        if (!tested.length) ctx.readout('log', ctx.t('logNone'));
        else {
          const rows = tested
            .map((id) => {
              const m = MATERIALS[id];
              const res2 = id === 'lead' ? ctx.t('leadNote') : ctx.t(m.conductor ? 'conductor' : 'insulator');
              const color = m.conductor ? 'var(--series-3)' : 'var(--series-2)';
              const current = id === obj() ? ' class="is-current"' : '';
              return `<tr${current}><td style="text-align:left">${ctx.t(id)}</td><td style="text-align:left">${ctx.t(`m${id}`)}</td><td style="text-align:left;color:${color};font-weight:650">${res2}</td></tr>`;
            })
            .join('');
          ctx.readout('log', {
            html: `<table class="mini-table"><tr><th style="text-align:left">${ctx.t('thObj')}</th><th style="text-align:left">${ctx.t('thMat')}</th><th style="text-align:left">${ctx.t('thRes')}</th></tr>${rows}</table>`,
          });
        }
      } else ctx.readout('log', null);

      ctx.setAction('switch', { enabled: !ctx.locked });
      ctx.setAction('replace', { enabled: fuseBlown && !ctx.locked });
      ctx.setAction('next', { enabled: !ctx.locked });
      ctx.setAction('clear', { enabled: tested.length > 0 && !ctx.locked });
    }

    /** Zustand ohne laufende Übergänge (für die Ergebnisse). */
    function solveTarget(): CircuitResult {
      if (mode() === 'test') {
        const o = obj();
        return solveCircuit({ device: 'lamp', closed: o !== 'none', seriesR: o === 'none' ? Infinity : MATERIALS[o].R });
      }
      return solveCircuit({ device: device(), closed: p.on, bridge: p.sc, fuse: !p.fuse ? 'none' : fuseBlown ? 'blown' : 'ok' });
    }

    /* ---------- Aufteilung der Bühne ---------- */
    interface Regions {
      real: Rect;
      plan: Rect;
      tray: Rect | null;
    }
    function regionsFor(v: View): Regions {
      const w = surface.width;
      const h = surface.height;
      const gap = 10;
      const test = mode() === 'test';
      const small = narrow();
      const trayH = test ? Math.round(small ? Math.min(150, h * 0.27) : Math.min(132, Math.max(104, h * 0.25))) : 0;
      const areaH = h - (test ? trayH + gap : 0);
      const tray = test ? { x: 0, y: h - trayH, w, h: trayH } : null;
      if (v === 'real') return { real: { x: 0, y: 0, w, h: areaH }, plan: { x: w + gap, y: 0, w: w * 0.4, h: areaH }, tray };
      if (v === 'plan') return { real: { x: -w * 0.6 - gap, y: 0, w: w * 0.6, h: areaH }, plan: { x: 0, y: 0, w, h: areaH }, tray };
      if (!small) {
        const rw = Math.round(w * 0.58);
        return { real: { x: 0, y: 0, w: rw, h: areaH }, plan: { x: rw + gap, y: 0, w: w - rw - gap, h: areaH }, tray };
      }
      const rh = Math.round(areaH * 0.58);
      return { real: { x: 0, y: 0, w, h: rh }, plan: { x: 0, y: rh + gap, w, h: areaH - rh - gap }, tray };
    }

    function regions(): Regions & { showReal: boolean; showPlan: boolean } {
      const to = regionsFor(view());
      if (!viewT.running) return { ...to, showReal: view() !== 'plan', showPlan: view() !== 'real' };
      const from = regionsFor(viewFrom);
      const t = viewT.value;
      return { real: mixRect(from.real, to.real, t), plan: mixRect(from.plan, to.plan, t), tray: to.tray, showReal: true, showPlan: true };
    }

    /* ---------- Geometrie des Aufbaus ---------- */
    interface RealGeo {
      r: Rect;
      s: number;
      bat: Pt;
      minus: Pt;
      plus: Pt;
      sw: Pt;
      s1: Pt;
      s2: Pt;
      dev: Pt;
      d1: Pt;
      d2: Pt;
      fuse: Pt;
      f1: Pt;
      f2: Pt;
      objC: Pt;
      tipA: Pt;
      tipB: Pt;
      tailA: Pt;
      tailB: Pt;
      bulbC: Pt;
      bulbR: number;
      paths: Partial<Record<EdgeId, Path>>;
    }

    function realGeo(r: Rect): RealGeo {
      const s = Math.max(0.6, Math.min(1.6, Math.min(r.w / 340, r.h / 300)));
      const test = mode() === 'test';
      const bat: Pt = [r.x + r.w * 0.5, r.y + r.h - 64 * s];
      const topY = bat[1] - 35 * s - 12 * s;
      const minus: Pt = [bat[0] - 30 * s, topY - 30 * s];
      const plus: Pt = [bat[0] + 30 * s, topY - 14 * s];
      const dev: Pt = [r.x + r.w * (test ? 0.74 : 0.72), r.y + Math.max(108 * s, r.h * 0.37)];
      const d1: Pt = [dev[0] - 38 * s, dev[1]];
      const d2: Pt = [dev[0] + 38 * s, dev[1]];
      const sw: Pt = [r.x + Math.max(62 * s, r.w * 0.23), r.y + r.h * 0.47];
      const s1: Pt = [sw[0] - 34 * s, sw[1]];
      const s2: Pt = [sw[0] + 34 * s, sw[1]];
      // Sicherung senkrecht zwischen Gerät und Batterie (rechts)
      const fuse: Pt = [Math.min(r.x + r.w - 34 * s, dev[0] + 92 * s), (dev[1] + bat[1]) / 2 + 6 * s];
      const f1: Pt = [fuse[0], fuse[1] - 31 * s];
      const f2: Pt = [fuse[0], fuse[1] + 31 * s];
      const objC: Pt = [r.x + Math.max(118 * s, r.w * 0.3), r.y + Math.max(96 * s, r.h * 0.42)];
      const tipA: Pt = [objC[0] - 31 * s, objC[1]];
      const tipB: Pt = [objC[0] + 31 * s, objC[1]];
      const tailA: Pt = [tipA[0] - 52 * s, objC[1]];
      const tailB: Pt = [tipB[0] + 52 * s, objC[1]];
      const bulbR = 22 * s;
      const bulbC: Pt = [dev[0], dev[1] - 11 * s - 16 * s - 14 * s - bulbR * 0.85];
      const paths: Partial<Record<EdgeId, Path>> = {};
      if (test) {
        paths.w1 = new Path(bezier(minus, add(minus, 0, -60 * s), add(tailA, -55 * s, 0), tailA));
        paths.obj = new Path([tipA, tipB]);
        paths.w2 = new Path(bezier(tailB, add(tailB, 50 * s, 0), add(d1, -50 * s, 0), d1));
        paths.w3 = new Path(bezier(d2, add(d2, 60 * s, 0), add(plus, 0, -80 * s), plus));
      } else {
        paths.w1 = new Path(bezier(minus, add(minus, 0, -60 * s), add(s1, -55 * s, 12 * s), s1));
        paths.sw = new Path([s1, s2]);
        paths.w2 = new Path(bezier(s2, add(s2, 55 * s, 0), add(d1, -55 * s, 0), d1));
        if (p.fuse) {
          paths.w3 = new Path(bezier(d2, add(d2, 34 * s, 0), add(f1, 0, -34 * s), f1));
          paths.fu = new Path([f1, f2]);
          paths.w4 = new Path(bezier(f2, add(f2, 0, 40 * s), add(plus, 0, -55 * s), plus));
        } else {
          paths.w3 = new Path(bezier(d2, add(d2, 60 * s, 0), add(plus, 0, -80 * s), plus));
        }
        {
          const b = bridge01();
          const rx = Math.max(r.x + 16 * s, dev[0] - 158 * s);
          const ry = Math.max(r.y + 22 * s, dev[1] - 74 * s);
          const rest: [Pt, Pt, Pt, Pt] = [[rx, ry + 10 * s], [rx + 24 * s, ry - 8 * s], [rx + 64 * s, ry - 6 * s], [rx + 92 * s, ry + 12 * s]];
          const on: [Pt, Pt, Pt, Pt] = [d1, add(d1, -6 * s, 62 * s), add(d2, 6 * s, 62 * s), d2];
          paths.br = new Path(bezier(mixPt(rest[0], on[0], b), mixPt(rest[1], on[1], b), mixPt(rest[2], on[2], b), mixPt(rest[3], on[3], b)));
        }
      }
      // Weg durch die Glühlampe: Anschluss → Sockel → Wendel → Sockel → Anschluss
      const base = dev[1] - 11 * s;
      const neck = bulbC[1] + bulbR * 0.8;
      const fy = bulbC[1] + 2 * s;
      paths.dev = new Path([d1, [dev[0] - 12 * s, base], [dev[0] - 5 * s, neck], [dev[0] - 10 * s, fy], [dev[0] + 10 * s, fy], [dev[0] + 5 * s, neck], [dev[0] + 12 * s, base], d2]);
      return { r, s, bat, minus, plus, sw, s1, s2, dev, d1, d2, fuse, f1, f2, objC, tipA, tipB, tailA, tailB, bulbC, bulbR, paths };
    }

    /* ---------- Geometrie des Schaltplans ---------- */
    interface PlanGeo {
      r: Rect;
      s: number;
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      bx: number;
      ys: number;
      dx: number;
      nl: number;
      nr: number;
      yf: number;
      legendTop: number;
      ta: number;
      tb: number;
      paths: Partial<Record<EdgeId, Path>>;
    }

    function planGeo(r: Rect): PlanGeo {
      const s = Math.max(0.7, Math.min(1.5, Math.min(r.w / 300, r.h / 230)));
      const test = mode() === 'test';
      const x0 = r.x + Math.max(44 * s, r.w * 0.14);
      const x1 = r.x + r.w - Math.max(44 * s, r.w * 0.14);
      const y0 = r.y + 58 * s;
      let y1 = r.y + r.h - 44 * s;
      // Nicht zu hoch: Bleibt Platz, steht darunter die Legende der Schaltzeichen.
      y1 = Math.min(y1, y0 + Math.max(110 * s, (x1 - x0) * 0.8));
      const bx = (x0 + x1) / 2;
      const ys = (y0 + y1) / 2;
      const dx = x0 + (x1 - x0) * (test ? 0.74 : 0.6);
      const nl = dx - 36 * s;
      const nr = dx + 36 * s;
      const yf = ys;
      const ta = x0 + (x1 - x0) * 0.2;
      const tb = ta + 52 * s;
      const B_: Pt = [bx - 5 * s, y1];
      const Bp: Pt = [bx + 5 * s, y1];
      const paths: Partial<Record<EdgeId, Path>> = {};
      if (test) {
        paths.w1 = new Path([B_, [x0, y1], [x0, y0], [ta, y0]]);
        paths.obj = new Path([
          [ta, y0],
          [tb, y0],
        ]);
        paths.w2 = new Path([
          [tb, y0],
          [dx - 14 * s, y0],
        ]);
        paths.dev = new Path([
          [dx - 14 * s, y0],
          [dx + 14 * s, y0],
        ]);
        paths.w3 = new Path([[dx + 14 * s, y0], [x1, y0], [x1, y1], Bp]);
      } else {
        paths.w1 = new Path([B_, [x0, y1], [x0, ys + 15 * s]]);
        paths.sw = new Path([
          [x0, ys + 15 * s],
          [x0, ys - 15 * s],
        ]);
        paths.w2 = new Path([[x0, ys - 15 * s], [x0, y0], [nl, y0]]);
        paths.dev = new Path([
          [nl, y0],
          [nr, y0],
        ]);
        paths.br = new Path([
          [nl, y0],
          [nl, y0 + 34 * s],
          [nr, y0 + 34 * s],
          [nr, y0],
        ]);
        if (p.fuse) {
          paths.w3 = new Path([[nr, y0], [x1, y0], [x1, yf - 15 * s]]);
          paths.fu = new Path([
            [x1, yf - 15 * s],
            [x1, yf + 15 * s],
          ]);
          paths.w4 = new Path([[x1, yf + 15 * s], [x1, y1], Bp]);
        } else paths.w3 = new Path([[nr, y0], [x1, y0], [x1, y1], Bp]);
      }
      return { r, s, x0, x1, y0, y1, bx, ys, dx, nl, nr, yf, ta, tb, paths, legendTop: y1 + 46 * s };
    }

    /* ---------- Zeiger ---------- */
    new TapTarget(surface, {
      hit: (x, y) => {
        for (let i = hits.length - 1; i >= 0; i--) if (inRect(hits[i]!.r, x, y)) return hits[i]!.id;
        return null;
      },
      onTap: (id) => tap(id),
      onHover: (id) => {
        hoverId = id;
      },
    });

    function tap(id: string): void {
      focus = { id, until: performance.now() + 1800 };
      if (id === 'battery' || id === 'device') return;
      if (ctx.locked) return;
      if (id === 'switch') {
        usedSwitch = true;
        ctx.set({ on: !p.on });
      } else if (id === 'bridge') ctx.set({ sc: !p.sc });
      else if (id === 'fuse' && fuseBlown) replaceFuse();
      else if (id === 'gapobj') ctx.set({ obj: 'none' });
      else if (id.startsWith('slot:')) {
        const o = id.slice(5) as MaterialId;
        ctx.set({ obj: obj() === o ? 'none' : o });
      }
    }

    function replaceFuse(): void {
      fuseBlown = false;
      overload = 0;
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Zeichenhilfen ---------- */
    /** Bereich, in dem Beschriftungen bleiben müssen (wird beim Zeichnen gesetzt). */
    let pillBounds: Rect | null = null;
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid = false): Rect {
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
      const h = size + 10;
      let x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      if (pillBounds) x0 = Math.max(pillBounds.x + 6, Math.min(pillBounds.x + pillBounds.w - w - 6, x0));
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = solid ? color : theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!solid) {
        g.strokeStyle = withAlpha(color, 0.5);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: solid ? '#ffffff' : color });
      return { x: x0, y, w, h };
    }

    function labelSize(): number {
      return narrow() ? 11 : 12;
    }

    function shadowOn(blur: number, dy: number, alpha = 1): void {
      const dark = ctx.theme.dark;
      g.shadowColor = dark ? `rgba(0,0,0,${0.55 * alpha})` : `rgba(16,24,40,${0.22 * alpha})`;
      g.shadowBlur = blur;
      g.shadowOffsetY = dy;
    }

    function metalGradient(x0: number, x1: number, light = '#e9edf2', dark = '#7d8693'): CanvasGradient {
      const m = g.createLinearGradient(x0, 0, x1, 0);
      m.addColorStop(0, dark);
      m.addColorStop(0.45, light);
      m.addColorStop(1, dark);
      return m;
    }

    function brassGradient(x0: number, x1: number): CanvasGradient {
      const m = g.createLinearGradient(x0, 0, x1, 0);
      m.addColorStop(0, '#8a6420');
      m.addColorStop(0.4, '#f3d684');
      m.addColorStop(1, '#93691f');
      return m;
    }

    /** Messingschraube von oben (Anschlussklemme). */
    function screw(x: number, y: number, rad: number): void {
      const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.35, rad * 0.1, x, y, rad);
      gr.addColorStop(0, '#fff1c2');
      gr.addColorStop(0.5, '#d6ac4e');
      gr.addColorStop(1, '#7a5718');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(70,45,10,0.75)';
      g.lineWidth = Math.max(1, rad * 0.22);
      g.beginPath();
      g.moveTo(x - rad * 0.55, y + rad * 0.2);
      g.lineTo(x + rad * 0.55, y - rad * 0.2);
      g.stroke();
    }

    /** Kunststoff-Grundplatte eines Bauteils. */
    function baseBoard(cx: number, cy: number, w: number, h: number, s: number): void {
      const dark = ctx.theme.dark;
      g.save();
      shadowOn(10 * s, 4 * s);
      const gr = g.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
      gr.addColorStop(0, dark ? '#4a5463' : '#5b6574');
      gr.addColorStop(1, dark ? '#2c333e' : '#363e4a');
      g.fillStyle = gr;
      roundRect(g, cx - w / 2, cy - h / 2, w, h, 5 * s);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.16)';
      roundRect(g, cx - w / 2 + 2 * s, cy - h / 2 + 1.5 * s, w - 4 * s, 2 * s, s);
      g.fill();
    }

    /* ---------- Leitungen, Elektronen, Pfeile ---------- */
    function cableColors(id: EdgeId): [string, string] {
      const dark = ctx.theme.dark;
      if (id === 'w1') return ['#2f6fd6', '#78a8f5'];
      if (id === 'w2' || id === 'obj') return dark ? ['#6b7482', '#a4adba'] : ['#2b313a', '#68717e'];
      if (id === 'br') return ['#e0b314', '#ffe27a'];
      return ['#d23b32', '#f58a82'];
    }

    function drawCable(path: Path, id: EdgeId, s: number, hot = 0): void {
      const [base, light] = cableColors(id);
      const w = 6.5 * s;
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.lineWidth = w;
      path.trace(g, 1.5 * s, 3.5 * s);
      g.stroke();
      g.strokeStyle = base;
      path.trace(g);
      g.stroke();
      g.strokeStyle = withAlpha(light, 0.55);
      g.lineWidth = w * 0.42;
      path.trace(g);
      g.stroke();
      if (hot > 0.01) {
        g.shadowColor = `rgba(255,120,30,${0.8 * hot})`;
        g.shadowBlur = 14 * s * hot;
        g.strokeStyle = `rgba(255,${Math.round(150 - 60 * hot)},40,${0.85 * hot})`;
        g.lineWidth = w;
        path.trace(g);
        g.stroke();
      }
      g.restore();
    }

    function cableGloss(path: Path, s: number): void {
      g.save();
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(255,255,255,0.32)';
      g.lineWidth = 1.3 * s;
      path.trace(g, -0.6 * s, -1.6 * s);
      g.stroke();
      g.restore();
    }

    /** Elektronen (Punkte) oder Pfeile der technischen Stromrichtung entlang eines Weges. */
    function drawFlow(path: Path, e: EdgeId, s: number, radius: number, options: { clip?: () => void; gap?: number } = {}): void {
      const f = flow();
      if (f === 'none' || path.length < 2) return;
      const theme = ctx.theme;
      g.save();
      options.clip?.();
      if (f === 'e') {
        const n = Math.max(1, Math.round(path.length / ((options.gap ?? GAP) * s)));
        const gap = path.length / n;
        const off = (((phase[e] * s) % gap) + gap) % gap;
        g.fillStyle = theme.series[0]!;
        g.strokeStyle = theme.dark ? 'rgba(10,16,24,0.85)' : 'rgba(255,255,255,0.95)';
        g.lineWidth = Math.max(1, radius * 0.45);
        for (let k = 0; k < n; k++) {
          const [x, y] = path.at(k * gap + off);
          g.beginPath();
          g.arc(x, y, radius, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
        if (reduced) for (let k = 0; k < n; k += 3) chevron(path, k * gap + off + gap / 2, theme.series[0]!, false, radius * 1.6);
      } else {
        const n = Math.max(1, Math.round(path.length / (ARROW_GAP * s)));
        const gap = path.length / n;
        const off = (((phase[e] * s) % gap) + gap) % gap;
        for (let k = 0; k < n; k++) chevron(path, path.length - (k * gap + off), theme.series[1]!, true, radius * 2.1);
      }
      g.restore();
    }

    function chevron(path: Path, at: number, color: string, backwards: boolean, size: number): void {
      const [x, y, a0] = path.at(((at % path.length) + path.length) % path.length);
      const a = backwards ? a0 + Math.PI : a0;
      g.save();
      g.translate(x, y);
      g.rotate(a);
      g.strokeStyle = ctx.theme.dark ? 'rgba(10,16,24,0.9)' : 'rgba(255,255,255,0.95)';
      g.lineWidth = Math.max(2, size * 0.75);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const tri = () => {
        g.beginPath();
        g.moveTo(-size * 0.7, -size * 0.75);
        g.lineTo(size * 0.55, 0);
        g.lineTo(-size * 0.7, size * 0.75);
      };
      tri();
      g.stroke();
      g.strokeStyle = color;
      g.lineWidth = Math.max(1.6, size * 0.42);
      tri();
      g.stroke();
      g.restore();
    }

    /* ---------- Bauteile im Aufbau ---------- */
    function drawBattery(G: RealGeo): void {
      const { s, bat } = G;
      const [cx, cy] = bat;
      const w = 128 * s;
      const h = 70 * s;
      const d = 12 * s;
      const x0 = cx - w / 2;
      const y0 = cy - h / 2;
      // Kontaktfahnen (hinter der Deckfläche beginnend)
      const tab = (x: number, top: number) => {
        g.fillStyle = brassGradient(x - 5 * s, x + 5 * s);
        g.beginPath();
        g.moveTo(x - 5 * s, y0 - d * 0.4);
        g.lineTo(x - 5 * s, top + 3 * s);
        g.quadraticCurveTo(x - 5 * s, top, x - 2 * s, top);
        g.lineTo(x + 5 * s, top);
        g.lineTo(x + 5 * s, y0 - d * 0.4);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.fillRect(x - 3.5 * s, top + 2 * s, 1.2 * s, y0 - d * 0.4 - top - 3 * s);
      };
      tab(G.minus[0], G.minus[1] - 4 * s);
      tab(G.plus[0], G.plus[1] - 4 * s);
      g.save();
      shadowOn(16 * s, 6 * s);
      const body = g.createLinearGradient(x0, 0, x0 + w, 0);
      body.addColorStop(0, '#26303d');
      body.addColorStop(0.5, '#3a4657');
      body.addColorStop(1, '#222a35');
      g.fillStyle = body;
      roundRect(g, x0, y0, w, h, 6 * s);
      g.fill();
      g.restore();
      // Deckfläche
      const top = g.createLinearGradient(0, y0 - d, 0, y0);
      top.addColorStop(0, '#5b6779');
      top.addColorStop(1, '#3d4858');
      g.fillStyle = top;
      g.beginPath();
      g.moveTo(x0 + 2 * s, y0 + 2 * s);
      g.lineTo(x0 + 7 * s, y0 - d);
      g.lineTo(x0 + w - 7 * s, y0 - d);
      g.lineTo(x0 + w - 2 * s, y0 + 2 * s);
      g.closePath();
      g.fill();
      // Banderole
      const band = g.createLinearGradient(0, y0 + h * 0.3, 0, y0 + h * 0.78);
      band.addColorStop(0, '#f49b3f');
      band.addColorStop(1, '#d36b17');
      g.fillStyle = band;
      g.fillRect(x0, y0 + h * 0.3, w, h * 0.46);
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.fillRect(x0, y0 + h * 0.3, w, 1.5 * s);
      text(g, '4,5 V'.replace(',', fmt.decimalSeparator), cx, y0 + h * 0.53, { font: `800 ${Math.round(17 * s)}px ${ctx.theme.font}`, color: '#ffffff' });
      text(g, '−', G.minus[0], y0 + h * 0.15, { font: `800 ${Math.round(15 * s)}px ${ctx.theme.font}`, color: '#ffffff' });
      text(g, '+', G.plus[0], y0 + h * 0.15, { font: `800 ${Math.round(15 * s)}px ${ctx.theme.font}`, color: '#ffffff' });
      // Glanz
      const gloss = g.createLinearGradient(0, y0, 0, y0 + h);
      gloss.addColorStop(0, 'rgba(255,255,255,0.10)');
      gloss.addColorStop(0.5, 'rgba(255,255,255,0)');
      g.fillStyle = gloss;
      roundRect(g, x0, y0, w, h, 6 * s);
      g.fill();
      // Wärme bei Kurzschluss
      if (heat > 0.02) {
        g.save();
        const glow = g.createRadialGradient(cx, cy, 10 * s, cx, cy, 90 * s);
        glow.addColorStop(0, `rgba(255,90,30,${0.38 * heat})`);
        glow.addColorStop(1, 'rgba(255,90,30,0)');
        g.fillStyle = glow;
        g.fillRect(cx - 100 * s, cy - 100 * s, 200 * s, 200 * s);
        // Hitzeflimmern
        g.strokeStyle = `rgba(255,140,60,${0.55 * heat})`;
        g.lineWidth = 1.6 * s;
        g.lineCap = 'round';
        const t = bellTime;
        for (let i = -1; i <= 1; i++) {
          const x = cx + i * 26 * s;
          g.beginPath();
          for (let k = 0; k <= 12; k++) {
            const yy = y0 - d - 14 * s - k * 2.4 * s;
            const xx = x + Math.sin(k * 0.9 - t * 7 + i) * 3 * s;
            if (k === 0) g.moveTo(xx, yy);
            else g.lineTo(xx, yy);
          }
          g.stroke();
        }
        g.restore();
      }
      // Kabelschuhe an den Fahnen
      for (const q of [G.minus, G.plus]) {
        g.fillStyle = metalGradient(q[0] - 4 * s, q[0] + 4 * s);
        roundRect(g, q[0] - 4 * s, q[1] - 3 * s, 8 * s, 9 * s, 2 * s);
        g.fill();
      }
    }

    function drawSwitch(G: RealGeo): void {
      const { s, sw, s1, s2 } = G;
      const [cx, cy] = sw;
      baseBoard(cx, cy, 98 * s, 26 * s, s);
      // fester Gegenkontakt (Messingbügel)
      g.strokeStyle = brassGradient(s2[0] - 6 * s, s2[0] + 6 * s);
      g.lineWidth = 3 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(s2[0] - 7 * s, cy - 2 * s);
      g.lineTo(s2[0] - 7 * s, cy - 11 * s);
      g.moveTo(s2[0] + 1 * s, cy - 2 * s);
      g.lineTo(s2[0] + 1 * s, cy - 11 * s);
      g.stroke();
      screw(s1[0], s1[1], 6.5 * s);
      screw(s2[0], s2[1], 6.5 * s);
      // Hebel
      const closed = switchClosed01();
      const ang = (-34 * (1 - closed) * Math.PI) / 180;
      const pivot: Pt = [s1[0], cy - 6 * s];
      const len = 74 * s;
      g.save();
      g.translate(pivot[0], pivot[1]);
      g.rotate(ang);
      g.save();
      shadowOn(5 * s, 3 * s, 0.8);
      g.fillStyle = metalGradient(0, 0, '#f6f8fb', '#9aa3ae');
      const lever = g.createLinearGradient(0, -3 * s, 0, 3 * s);
      lever.addColorStop(0, '#f2dc98');
      lever.addColorStop(0.5, '#d1a646');
      lever.addColorStop(1, '#8a6420');
      g.fillStyle = lever;
      roundRect(g, -3 * s, -2.6 * s, len - 10 * s, 5.2 * s, 2 * s);
      g.fill();
      g.restore();
      // Griff
      const grip = g.createLinearGradient(0, -6 * s, 0, 6 * s);
      grip.addColorStop(0, '#ff6b5e');
      grip.addColorStop(1, '#b3261e');
      g.fillStyle = grip;
      roundRect(g, len - 14 * s, -5.5 * s, 22 * s, 11 * s, 5 * s);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)';
      roundRect(g, len - 11 * s, -4 * s, 15 * s, 2.4 * s, 1.2 * s);
      g.fill();
      g.restore();
      // Drehpunkt
      g.fillStyle = metalGradient(pivot[0] - 4 * s, pivot[0] + 4 * s);
      g.beginPath();
      g.arc(pivot[0], pivot[1], 3.6 * s, 0, Math.PI * 2);
      g.fill();
    }

    function drawSocketBoard(G: RealGeo): void {
      const { s, dev, d1, d2 } = G;
      baseBoard(dev[0], dev[1], 100 * s, 24 * s, s);
      for (const q of [d1, d2]) {
        // Buchse
        g.fillStyle = '#1a1e24';
        g.beginPath();
        g.arc(q[0], q[1], 6.5 * s, 0, Math.PI * 2);
        g.fill();
        screw(q[0], q[1], 4.6 * s);
      }
    }

    function drawLamp(G: RealGeo, res: CircuitResult): void {
      const { s, dev, bulbC, bulbR } = G;
      const T = lampT(res);
      const glow = glowOf(T);
      const [cx] = dev;
      const baseTop = dev[1] - 11 * s;
      // Fassung
      const fw = 34 * s;
      const fh = 16 * s;
      g.save();
      shadowOn(6 * s, 2 * s, 0.8);
      const fass = g.createLinearGradient(cx - fw / 2, 0, cx + fw / 2, 0);
      fass.addColorStop(0, '#1d2128');
      fass.addColorStop(0.45, '#5a626e');
      fass.addColorStop(1, '#1d2128');
      g.fillStyle = fass;
      roundRect(g, cx - fw / 2, baseTop - fh, fw, fh + 2 * s, 3 * s);
      g.fill();
      g.restore();
      // Gewinde
      const thTop = baseTop - fh - 14 * s;
      g.fillStyle = metalGradient(cx - 11 * s, cx + 11 * s);
      roundRect(g, cx - 11 * s, thTop, 22 * s, 15 * s, 2 * s);
      g.fill();
      g.strokeStyle = 'rgba(60,66,76,0.55)';
      g.lineWidth = 1.1 * s;
      for (let k = 1; k < 4; k++) {
        g.beginPath();
        g.moveTo(cx - 11 * s, thTop + k * 3.8 * s);
        g.lineTo(cx + 11 * s, thTop + k * 3.8 * s - 1.5 * s);
        g.stroke();
      }
      // Lichtschein
      if (glow > 0.005) {
        const [hr, hg, hb] = haloColor(T);
        const R = bulbR * (1.6 + 3.2 * Math.min(1, glow));
        const halo = g.createRadialGradient(bulbC[0], bulbC[1], bulbR * 0.3, bulbC[0], bulbC[1], R);
        halo.addColorStop(0, `rgba(${hr},${hg},${hb},${0.55 * Math.min(1, glow)})`);
        halo.addColorStop(0.35, `rgba(${hr},${hg},${hb},${0.22 * Math.min(1, glow)})`);
        halo.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        g.fillStyle = halo;
        g.fillRect(bulbC[0] - R, bulbC[1] - R, 2 * R, 2 * R);
      }
      // Glaskolben
      const bulbPath = () => {
        g.beginPath();
        g.moveTo(cx - 10 * s, thTop + 1 * s);
        g.bezierCurveTo(cx - 10 * s, thTop - 6 * s, cx - bulbR, bulbC[1] + bulbR * 0.7, cx - bulbR, bulbC[1]);
        g.arc(bulbC[0], bulbC[1], bulbR, Math.PI, 0);
        g.bezierCurveTo(cx + bulbR, bulbC[1] + bulbR * 0.7, cx + 10 * s, thTop - 6 * s, cx + 10 * s, thTop + 1 * s);
        g.closePath();
      };
      const dark = ctx.theme.dark;
      const glass = g.createRadialGradient(bulbC[0] - bulbR * 0.3, bulbC[1] - bulbR * 0.3, bulbR * 0.1, bulbC[0], bulbC[1], bulbR * 1.3);
      if (glow > 0.02) {
        const k = Math.min(1, glow);
        glass.addColorStop(0, `rgba(255,250,225,${0.35 + 0.55 * k})`);
        glass.addColorStop(1, `rgba(255,214,140,${0.18 + 0.4 * k})`);
      } else {
        glass.addColorStop(0, dark ? 'rgba(230,240,255,0.28)' : 'rgba(255,255,255,0.75)');
        glass.addColorStop(1, dark ? 'rgba(160,180,210,0.16)' : 'rgba(190,205,225,0.45)');
      }
      bulbPath();
      g.fillStyle = glass;
      g.fill();
      // Haltedrähte und Wendel
      const fy = bulbC[1] + 2 * s;
      g.strokeStyle = dark ? '#9aa3af' : '#6c7480';
      g.lineWidth = 1.1 * s;
      g.beginPath();
      g.moveTo(cx - 4 * s, thTop + 2 * s);
      g.lineTo(cx - 10 * s, fy);
      g.moveTo(cx + 4 * s, thTop + 2 * s);
      g.lineTo(cx + 10 * s, fy);
      g.stroke();
      const fc = filamentColor(T);
      g.save();
      if (glow > 0.05) {
        g.shadowColor = fc;
        g.shadowBlur = 10 * s * Math.min(1, glow);
      }
      g.strokeStyle = fc;
      g.lineWidth = 1.5 * s;
      g.beginPath();
      for (let k = 0; k <= 40; k++) {
        const u = k / 40;
        const x = cx - 10 * s + 20 * s * u;
        const y = fy - Math.abs(Math.sin(u * Math.PI * 7)) * 2.6 * s;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      g.restore();
      // Elektronen in der Lampe (nur im Glaskolben sichtbar)
      const path = G.paths.dev;
      if (path) drawFlow(path, 'dev', s, 1.8 * s, { clip: () => (bulbPath(), g.clip()) });
      // Glasrand und Glanzlicht
      bulbPath();
      g.strokeStyle = dark ? 'rgba(220,230,245,0.45)' : 'rgba(110,125,145,0.55)';
      g.lineWidth = 1.2 * s;
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.75)';
      g.lineWidth = 2 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(bulbC[0], bulbC[1], bulbR * 0.72, Math.PI * 1.08, Math.PI * 1.38);
      g.stroke();
    }

    function drawMotor(G: RealGeo, res: CircuitResult): void {
      const { s, dev } = G;
      const [cx] = dev;
      const baseTop = dev[1] - 11 * s;
      const rw = 17 * s;
      const top = baseTop - 46 * s;
      // Halterung
      g.fillStyle = ctx.theme.dark ? '#59616d' : '#4a525e';
      roundRect(g, cx - 24 * s, baseTop - 8 * s, 48 * s, 9 * s, 2 * s);
      g.fill();
      g.save();
      shadowOn(8 * s, 3 * s, 0.8);
      g.fillStyle = metalGradient(cx - rw, cx + rw, '#f1f4f8', '#7c8591');
      g.fillRect(cx - rw, top, 2 * rw, baseTop - 6 * s - top);
      g.restore();
      // Farbring und Lüftungsschlitze
      g.fillStyle = '#c0392b';
      g.fillRect(cx - rw, baseTop - 18 * s, 2 * rw, 6 * s);
      g.fillStyle = 'rgba(30,34,40,0.55)';
      for (let k = -1; k <= 1; k++) roundRect(g, cx + k * 9 * s - 2 * s, top + 10 * s, 4 * s, 12 * s, 2 * s), g.fill();
      // Deckel
      g.fillStyle = metalGradient(cx - rw, cx + rw, '#ffffff', '#9aa3ae');
      g.beginPath();
      g.ellipse(cx, top, rw, 5 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#3a404a';
      g.beginPath();
      g.ellipse(cx, top, 6 * s, 2.2 * s, 0, 0, Math.PI * 2);
      g.fill();
      // Welle und Propeller
      const hubY = top - 11 * s;
      g.fillStyle = metalGradient(cx - 1.6 * s, cx + 1.6 * s);
      g.fillRect(cx - 1.6 * s, hubY, 3.2 * s, 11 * s);
      const speed = flowSpeed(res.Idevice) / 30;
      const R = 34 * s;
      if (speed > 0.6 && !reduced) {
        g.fillStyle = withAlpha('#ff9f43', 0.22);
        g.beginPath();
        g.ellipse(cx, hubY, R, R * 0.28, 0, 0, Math.PI * 2);
        g.fill();
      }
      for (let k = 0; k < 2; k++) {
        const a = motorAngle + k * Math.PI;
        const tx = Math.cos(a) * R;
        const ty = Math.sin(a) * R * 0.28;
        const nx = -Math.sin(a) * 6 * s;
        const ny = Math.cos(a) * 6 * s * 0.28 + 1.4 * s;
        const blade = g.createLinearGradient(cx, hubY, cx + tx, hubY + ty);
        blade.addColorStop(0, '#ff8a2a');
        blade.addColorStop(1, '#e8590c');
        g.fillStyle = blade;
        g.globalAlpha = speed > 0.6 && !reduced ? 0.55 : 1;
        g.beginPath();
        g.moveTo(cx, hubY - 1.5 * s);
        g.quadraticCurveTo(cx + tx * 0.6 + nx, hubY + ty * 0.6 + ny, cx + tx, hubY + ty);
        g.quadraticCurveTo(cx + tx * 0.6 - nx * 0.3, hubY + ty * 0.6 - ny * 0.3, cx, hubY + 1.5 * s);
        g.closePath();
        g.fill();
        g.globalAlpha = 1;
      }
      g.fillStyle = '#c94a0c';
      g.beginPath();
      g.ellipse(cx, hubY, 4 * s, 2.2 * s, 0, 0, Math.PI * 2);
      g.fill();
    }

    function drawBell(G: RealGeo, res: CircuitResult): void {
      const { s, dev } = G;
      const [cx] = dev;
      const baseTop = dev[1] - 11 * s;
      const ringing = res.Idevice > 0.05;
      const bx = cx + 10 * s;
      const by = baseTop - 52 * s;
      const R = 23 * s;
      // Elektromagnet (zwei Spulen)
      for (const k of [-1, 1]) {
        const x = cx - 18 * s + k * 7 * s;
        const coil = g.createLinearGradient(x - 5 * s, 0, x + 5 * s, 0);
        coil.addColorStop(0, '#7a3b12');
        coil.addColorStop(0.5, '#e08a45');
        coil.addColorStop(1, '#7a3b12');
        g.fillStyle = coil;
        roundRect(g, x - 5.5 * s, baseTop - 22 * s, 11 * s, 21 * s, 2.5 * s);
        g.fill();
        g.strokeStyle = 'rgba(80,35,10,0.45)';
        g.lineWidth = 0.8 * s;
        for (let j = 1; j < 7; j++) {
          g.beginPath();
          g.moveTo(x - 5.5 * s, baseTop - 22 * s + j * 3 * s);
          g.lineTo(x + 5.5 * s, baseTop - 22 * s + j * 3 * s);
          g.stroke();
        }
      }
      // Glockenträger
      g.fillStyle = metalGradient(bx - 2 * s, bx + 2 * s);
      g.fillRect(bx - 2 * s, by, 4 * s, baseTop - by);
      // Klöppel an der Blattfeder
      const vib = ringing && !reduced ? Math.sin(bellTime * Math.PI * 2 * 11) * 2.6 * s : 0;
      const hx = bx - R - 3 * s + vib;
      const hy = by + 8 * s;
      g.strokeStyle = metalGradient(cx - 30 * s, cx, '#e6eaef', '#7e8792');
      g.lineWidth = 2.2 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - 30 * s, baseTop - 25 * s);
      g.lineTo(cx - 22 * s, baseTop - 25 * s);
      g.quadraticCurveTo(hx - 4 * s, baseTop - 26 * s, hx, hy);
      g.stroke();
      // Glocke
      g.save();
      shadowOn(8 * s, 3 * s, 0.8);
      const bell = g.createLinearGradient(bx - R, 0, bx + R, 0);
      bell.addColorStop(0, '#8b6a24');
      bell.addColorStop(0.35, '#f6dd8f');
      bell.addColorStop(0.6, '#d4a845');
      bell.addColorStop(1, '#7e5c1c');
      g.fillStyle = bell;
      g.beginPath();
      g.moveTo(bx - R, by + 6 * s);
      g.bezierCurveTo(bx - R, by - R * 0.95, bx + R, by - R * 0.95, bx + R, by + 6 * s);
      g.closePath();
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(80,55,15,0.35)';
      g.beginPath();
      g.ellipse(bx, by + 6 * s, R, 3.2 * s, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.beginPath();
      g.ellipse(bx - R * 0.35, by - R * 0.35, R * 0.18, R * 0.08, -0.6, 0, Math.PI * 2);
      g.fill();
      // Klöppelkugel
      const ball = g.createRadialGradient(hx - 1.5 * s, hy - 1.5 * s, 0.5 * s, hx, hy, 4.5 * s);
      ball.addColorStop(0, '#ffffff');
      ball.addColorStop(1, '#6d7682');
      g.fillStyle = ball;
      g.beginPath();
      g.arc(hx, hy, 4.5 * s, 0, Math.PI * 2);
      g.fill();
      // Schallwellen
      if (ringing) {
        const theme = ctx.theme;
        for (let k = 0; k < 3; k++) {
          const u = reduced ? (k + 1) / 4 : (bellTime * 1.6 + k / 3) % 1;
          const rr = R + 8 * s + u * 30 * s;
          g.strokeStyle = withAlpha(theme.series[4]!, (1 - u) * 0.85);
          g.lineWidth = 2.2 * s;
          g.lineCap = 'round';
          g.beginPath();
          g.arc(bx, by - 2 * s, rr, -Math.PI * 0.32, Math.PI * 0.12);
          g.stroke();
          g.beginPath();
          g.arc(bx, by - 2 * s, rr, Math.PI * 0.88, Math.PI * 1.32);
          g.stroke();
        }
      }
    }

    function drawFuseReal(G: RealGeo): void {
      const { s, fuse } = G;
      const [cx, cy] = fuse;
      // Gezeichnet waagerecht, gedreht um 90° (senkrecht im Aufbau)
      g.save();
      g.translate(cx, cy);
      g.rotate(Math.PI / 2);
      g.translate(-cx, -cy);
      baseBoard(cx, cy, 74 * s, 18 * s, s);
      for (const k of [-1, 1]) {
        g.fillStyle = metalGradient(cx + k * 22 * s - 4 * s, cx + k * 22 * s + 4 * s);
        roundRect(g, cx + k * 22 * s - 4 * s, cy - 11 * s, 8 * s, 12 * s, 2 * s);
        g.fill();
        screw(cx + k * 31 * s, cy, 4.5 * s);
      }
      // Glasröhrchen
      const gx0 = cx - 25 * s;
      const gw = 50 * s;
      const gy = cy - 12 * s;
      const gh = 10 * s;
      const dark = ctx.theme.dark;
      g.fillStyle = dark ? 'rgba(200,215,235,0.25)' : 'rgba(255,255,255,0.7)';
      roundRect(g, gx0 + 6 * s, gy, gw - 12 * s, gh, 3 * s);
      g.fill();
      g.strokeStyle = dark ? 'rgba(220,230,245,0.5)' : 'rgba(110,125,145,0.6)';
      g.lineWidth = 1 * s;
      g.stroke();
      for (const x of [gx0, gx0 + gw - 7 * s]) {
        g.fillStyle = metalGradient(x, x + 7 * s);
        roundRect(g, x, gy - 0.5 * s, 7 * s, gh + 1 * s, 1.5 * s);
        g.fill();
      }
      // Schmelzdraht
      const my = gy + gh / 2;
      g.strokeStyle = fuseBlown ? '#5b4a3a' : '#8a929c';
      g.lineWidth = 0.9 * s;
      g.beginPath();
      if (fuseBlown) {
        g.moveTo(gx0 + 7 * s, my);
        g.lineTo(cx - 5 * s, my + 1 * s);
        g.moveTo(cx + 5 * s, my - 1 * s);
        g.lineTo(gx0 + gw - 7 * s, my);
      } else {
        g.moveTo(gx0 + 7 * s, my);
        g.lineTo(gx0 + gw - 7 * s, my);
      }
      g.stroke();
      if (fuseBlown) {
        const soot = g.createRadialGradient(cx, my, 0.5 * s, cx, my, 9 * s);
        soot.addColorStop(0, 'rgba(40,30,20,0.55)');
        soot.addColorStop(1, 'rgba(40,30,20,0)');
        g.fillStyle = soot;
        g.fillRect(cx - 10 * s, gy, 20 * s, gh);
      }
      // Funke beim Durchschmelzen
      if (sparkT.running) {
        const u = sparkT.t;
        const k = 1 - u;
        const flash = g.createRadialGradient(cx, my, 0, cx, my, 40 * s * (0.4 + u));
        flash.addColorStop(0, `rgba(255,255,230,${0.95 * k})`);
        flash.addColorStop(0.3, `rgba(255,200,80,${0.6 * k})`);
        flash.addColorStop(1, 'rgba(255,160,40,0)');
        g.fillStyle = flash;
        g.fillRect(cx - 60 * s, my - 60 * s, 120 * s, 120 * s);
        g.strokeStyle = `rgba(255,220,120,${k})`;
        g.lineWidth = 1.4 * s;
        for (let i = 0; i < 9; i++) {
          const a = (i / 9) * Math.PI * 2 + 0.4;
          const r0 = 6 * s + u * 22 * s;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * r0, my + Math.sin(a) * r0);
          g.lineTo(cx + Math.cos(a) * (r0 + 6 * s), my + Math.sin(a) * (r0 + 6 * s));
          g.stroke();
        }
      }
      g.restore();
    }

    function drawClamp(tail: Pt, tip: Pt, color: string, s: number): void {
      const dir = Math.sign(tip[0] - tail[0]) || 1;
      const y = tail[1];
      const L2 = Math.abs(tip[0] - tail[0]);
      const sl = L2 * 0.5;
      g.save();
      g.translate(tail[0], y);
      g.scale(dir, 1);
      // Kunststoffhülle
      g.save();
      shadowOn(5 * s, 2 * s, 0.8);
      const sleeve = g.createLinearGradient(0, -9 * s, 0, 9 * s);
      sleeve.addColorStop(0, mixHex(color, '#ffffff', 0.25));
      sleeve.addColorStop(0.5, color);
      sleeve.addColorStop(1, mixHex(color, '#000000', 0.45));
      g.fillStyle = sleeve;
      g.beginPath();
      g.moveTo(0, -5 * s);
      g.lineTo(sl, -9 * s);
      g.lineTo(sl + 2 * s, 9 * s);
      g.lineTo(0, 5 * s);
      g.closePath();
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.fillRect(3 * s, -5.5 * s, sl - 6 * s, 1.6 * s);
      // Backen mit Zähnen
      const jaw = g.createLinearGradient(0, -8 * s, 0, 8 * s);
      jaw.addColorStop(0, '#f3f5f8');
      jaw.addColorStop(1, '#8a939f');
      g.fillStyle = jaw;
      for (const k of [-1, 1]) {
        g.beginPath();
        g.moveTo(sl, k * 8 * s);
        g.lineTo(L2, k * 2 * s);
        for (let i = 0; i < 4; i++) {
          const x = L2 - i * 4.5 * s;
          g.lineTo(x - 2.2 * s, k * 0.4 * s);
          g.lineTo(x - 4.5 * s, k * 2 * s);
        }
        g.lineTo(sl, k * 2.5 * s);
        g.closePath();
        g.fill();
      }
      // Feder-Niet
      g.fillStyle = '#6f7884';
      g.beginPath();
      g.arc(sl + 5 * s, 0, 2.2 * s, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    /* ---------- Gegenstände für die Prüfstrecke ---------- */
    /** Natürliche Länge der Gegenstände (Einheiten des Aufbaus). */
    /** Vergrößerung der Gegenstände in der Prüfstrecke. */
    const OBJ_SCALE = 1.15;
    const OBJ_LEN: Record<MaterialId, number> = { clip: 74, coin: 58, foil: 80, lead: 86, wood: 88, eraser: 70, ruler: 96, glass: 88 };
    /** Höhe relativ zur Länge (zum Einpassen in Kästchen und Schaltplan). */
    const OBJ_THICK: Record<MaterialId, number> = { clip: 0.34, coin: 1, foil: 0.3, lead: 0.07, wood: 0.14, eraser: 0.42, ruler: 0.22, glass: 0.11 };

    function drawObject(id: MaterialId, cx: number, cy: number, k: number, alpha = 1): void {
      const len = OBJ_LEN[id] * k;
      const dark = ctx.theme.dark;
      g.save();
      g.globalAlpha = alpha;
      g.translate(cx, cy);
      if (id === 'clip') {
        const H = len * 0.34;
        const t = Math.max(1.2, len * 0.045);
        const y1 = -H / 2;
        const y2 = -H * 0.17;
        const y3 = H * 0.17;
        const y4 = H / 2;
        const rR1 = H / 2;
        const xR1 = len / 2 - rR1;
        const rL = (y4 - y2) / 2;
        const xL1 = -len / 2 + rL;
        const rR2 = y3;
        const xR2 = xR1 - len * 0.07;
        g.beginPath();
        g.moveTo(-len * 0.18, y3);
        g.lineTo(xR2, y3);
        g.arc(xR2, 0, rR2, Math.PI / 2, -Math.PI / 2, true);
        g.lineTo(xL1, y2);
        g.arc(xL1, (y2 + y4) / 2, rL, -Math.PI / 2, Math.PI / 2, true);
        g.lineTo(xR1, y4);
        g.arc(xR1, 0, rR1, Math.PI / 2, -Math.PI / 2, true);
        g.lineTo(-len * 0.3, y1);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.strokeStyle = 'rgba(0,0,0,0.25)';
        g.lineWidth = t + 1;
        g.stroke();
        g.strokeStyle = dark ? '#c9d0d9' : '#a3acb8';
        g.lineWidth = t;
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.lineWidth = t * 0.35;
        g.stroke();
      } else if (id === 'coin') {
        const R = len / 2;
        const gr = g.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R);
        gr.addColorStop(0, '#ffe2a8');
        gr.addColorStop(0.55, '#d99a4a');
        gr.addColorStop(1, '#9a5d22');
        g.fillStyle = gr;
        g.beginPath();
        g.arc(0, 0, R, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = 'rgba(110,60,20,0.6)';
        g.lineWidth = Math.max(1, R * 0.07);
        g.beginPath();
        g.arc(0, 0, R * 0.8, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = 'rgba(120,70,25,0.55)';
        g.beginPath();
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const rr = i % 2 === 0 ? R * 0.42 : R * 0.18;
          if (i === 0) g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
          else g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
      } else if (id === 'foil') {
        const H = len * 0.26;
        const gr = g.createLinearGradient(0, -H, 0, H);
        gr.addColorStop(0, '#f7f9fb');
        gr.addColorStop(0.5, '#aeb6c1');
        gr.addColorStop(1, '#e3e7ec');
        g.fillStyle = gr;
        g.beginPath();
        const n = 9;
        for (let i = 0; i <= n; i++) g.lineTo(-len / 2 + (len * i) / n, -H / 2 + (i % 2 ? 2 : -1) * len * 0.015);
        for (let i = n; i >= 0; i--) g.lineTo(-len / 2 + (len * i) / n, H / 2 + (i % 2 ? -1 : 2) * len * 0.015);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(90,100,115,0.5)';
        g.lineWidth = 0.8;
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.8)';
        g.lineWidth = 0.9;
        for (let i = 1; i < n; i += 2) {
          g.beginPath();
          g.moveTo(-len / 2 + (len * i) / n, -H / 2);
          g.lineTo(-len / 2 + (len * (i + 0.6)) / n, H / 2);
          g.stroke();
        }
      } else if (id === 'lead' || id === 'wood' || id === 'glass') {
        const th = len * (id === 'lead' ? 0.07 : id === 'wood' ? 0.14 : 0.11);
        const gr = g.createLinearGradient(0, -th / 2, 0, th / 2);
        if (id === 'lead') {
          gr.addColorStop(0, '#8a9099');
          gr.addColorStop(0.35, '#4a4f57');
          gr.addColorStop(1, '#23262b');
        } else if (id === 'wood') {
          gr.addColorStop(0, '#f0cf98');
          gr.addColorStop(0.5, '#cf9a5b');
          gr.addColorStop(1, '#94632d');
        } else {
          gr.addColorStop(0, dark ? 'rgba(220,240,255,0.55)' : 'rgba(255,255,255,0.9)');
          gr.addColorStop(0.5, dark ? 'rgba(150,200,230,0.25)' : 'rgba(170,215,235,0.45)');
          gr.addColorStop(1, dark ? 'rgba(200,230,250,0.45)' : 'rgba(140,190,215,0.6)');
        }
        g.fillStyle = gr;
        roundRect(g, -len / 2, -th / 2, len, th, th / 2);
        g.fill();
        if (id === 'glass') {
          g.strokeStyle = dark ? 'rgba(200,230,250,0.7)' : 'rgba(90,140,170,0.65)';
          g.lineWidth = 1;
          g.stroke();
          g.strokeStyle = 'rgba(255,255,255,0.95)';
          g.lineWidth = Math.max(1, th * 0.14);
          g.beginPath();
          g.moveTo(-len / 2 + th, -th * 0.2);
          g.lineTo(len / 2 - th, -th * 0.2);
          g.stroke();
        } else if (id === 'wood') {
          g.strokeStyle = 'rgba(120,75,30,0.45)';
          g.lineWidth = 0.8;
          for (const yy of [-0.2, 0.15]) {
            g.beginPath();
            g.moveTo(-len / 2 + th * 0.6, yy * th);
            g.bezierCurveTo(-len * 0.1, yy * th - th * 0.15, len * 0.1, yy * th + th * 0.15, len / 2 - th * 0.6, yy * th);
            g.stroke();
          }
          g.fillStyle = '#e8c48d';
          g.beginPath();
          g.ellipse(len / 2 - th * 0.3, 0, th * 0.28, th / 2, 0, 0, Math.PI * 2);
          g.fill();
        } else {
          g.fillStyle = 'rgba(255,255,255,0.4)';
          g.fillRect(-len / 2 + th, -th * 0.32, len - 2 * th, th * 0.16);
        }
      } else if (id === 'eraser') {
        const w = len;
        const H = len * 0.42;
        const left = g.createLinearGradient(0, -H / 2, 0, H / 2);
        left.addColorStop(0, '#ff8a80');
        left.addColorStop(1, '#d1453b');
        const right = g.createLinearGradient(0, -H / 2, 0, H / 2);
        right.addColorStop(0, '#7fa7ff');
        right.addColorStop(1, '#3a62c9');
        g.save();
        roundRect(g, -w / 2, -H / 2, w, H, H * 0.22);
        g.clip();
        g.fillStyle = left;
        g.fillRect(-w / 2, -H / 2, w * 0.42, H);
        g.fillStyle = right;
        g.fillRect(-w / 2 + w * 0.42, -H / 2, w * 0.58, H);
        g.fillStyle = 'rgba(255,255,255,0.3)';
        g.fillRect(-w / 2, -H / 2, w, H * 0.16);
        g.restore();
      } else if (id === 'ruler') {
        const H = len * 0.22;
        g.fillStyle = dark ? 'rgba(120,220,180,0.35)' : 'rgba(80,190,150,0.35)';
        roundRect(g, -len / 2, -H / 2, len, H, 2);
        g.fill();
        g.strokeStyle = dark ? 'rgba(150,240,200,0.75)' : 'rgba(30,130,95,0.7)';
        g.lineWidth = 1;
        g.stroke();
        g.beginPath();
        const n = 16;
        for (let i = 1; i < n; i++) {
          const x = -len / 2 + (len * i) / n;
          g.moveTo(x, -H / 2);
          g.lineTo(x, -H / 2 + (i % 4 === 0 ? H * 0.5 : H * 0.28));
        }
        g.stroke();
      }
      g.restore();
    }

    /* ---------- Szene: Aufbau ---------- */
    const bgCache = new Map<string, HTMLCanvasElement>();
    function tableBackground(r: Rect): void {
      const dark = ctx.theme.dark;
      const w = Math.round(r.w);
      const h = Math.round(r.h);
      const key = `${w}x${h}|${dark}|${surface.dpr}`;
      let c = bgCache.get(key);
      if (!c) {
        if (bgCache.size > 4) bgCache.clear();
        c = document.createElement('canvas');
        c.width = Math.max(1, Math.ceil(w * surface.dpr));
        c.height = Math.max(1, Math.ceil(h * surface.dpr));
        const b = c.getContext('2d')!;
        b.scale(surface.dpr, surface.dpr);
        const gr = b.createLinearGradient(0, 0, 0, h);
        gr.addColorStop(0, dark ? '#1b2533' : '#eef2f6');
        gr.addColorStop(1, dark ? '#131b26' : '#dfe6ee');
        b.fillStyle = gr;
        b.fillRect(0, 0, w, h);
        // Lochraster einer Experimentierplatte
        b.fillStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(40,60,90,0.08)';
        const step = 18;
        for (let y = step / 2; y < h; y += step) for (let x = step / 2; x < w; x += step) b.fillRect(x - 1, y - 1, 2, 2);
        const vignette = b.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.2, w / 2, h * 0.45, Math.max(w, h) * 0.75);
        vignette.addColorStop(0, 'rgba(255,255,255,0)');
        vignette.addColorStop(1, dark ? 'rgba(0,0,0,0.25)' : 'rgba(30,50,80,0.06)');
        b.fillStyle = vignette;
        b.fillRect(0, 0, w, h);
        bgCache.set(key, c);
      }
      g.drawImage(c, r.x, r.y, r.w, r.h);
    }

    function hitbox(id: string, x: number, y: number, w: number, h: number): void {
      hits.push({ id, r: { x, y, w, h } });
    }

    function highlight(x: number, y: number, w: number, h: number, active: boolean): void {
      if (!active) return;
      g.save();
      g.fillStyle = withAlpha(ctx.theme.series[0]!, 0.1);
      g.strokeStyle = withAlpha(ctx.theme.series[0]!, 0.55);
      g.lineWidth = 1.5;
      g.setLineDash([5, 4]);
      roundRect(g, x, y, w, h, 10);
      g.fill();
      g.stroke();
      g.restore();
    }

    function drawReal(r: Rect, res: CircuitResult): RealGeo {
      const G = realGeo(r);
      const { s } = G;
      const test = mode() === 'test';
      const theme = ctx.theme;
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      pillBounds = r;
      tableBackground(r);

      // Leitungen
      const order: EdgeId[] = test ? ['w1', 'w2', 'w3'] : ['w1', 'w2', 'w3', 'w4'];
      for (const e of order) {
        const path = G.paths[e];
        if (path) drawCable(path, e, s);
      }
      for (const e of order) {
        const path = G.paths[e];
        if (path) drawFlow(path, e, s, 2.5 * s);
      }
      for (const e of order) {
        const path = G.paths[e];
        if (path) cableGloss(path, s);
      }

      drawBattery(G);
      hitbox('battery', G.bat[0] - 68 * s, G.bat[1] - 84 * s, 136 * s, 122 * s);
      if (test) {
        drawSocketBoard(G);
        // Prüfstrecke
        const o = obj();
        const showObj = o !== 'none' && !objT.running;
        if (showObj) {
          drawObject(o, G.objC[0], G.objC[1], s * OBJ_SCALE);
          const path = G.paths.obj;
          if (path && MATERIALS[o].conductor) drawFlow(path, 'obj', s, 2 * s);
        }
        drawClamp(G.tailA, G.tipA, '#d23b32', s);
        drawClamp(G.tailB, G.tipB, '#3a4250', s);
        hitbox('gapobj', G.tailA[0], G.objC[1] - 26 * s, G.tailB[0] - G.tailA[0], 52 * s);
        highlight(G.tailA[0] - 6, G.objC[1] - 30 * s, G.tailB[0] - G.tailA[0] + 12, 60 * s, hovered === 'gapobj' && o !== 'none');
        if (p.lbl) {
          const lbl = o === 'none' ? ctx.t('gap') : ctx.t(o);
          pill(G.objC[0], G.objC[1] - 40 * s, lbl, theme.muted, 'center', labelSize());
        }
        drawLamp(G, res);
      } else {
        drawSwitch(G);
        if (G.paths.sw && p.on && !switchT.running) drawFlow(G.paths.sw, 'sw', s, 2 * s);
        hitbox('switch', G.sw[0] - 54 * s, G.sw[1] - 44 * s, 108 * s, 66 * s);
        drawSocketBoard(G);
        const d = device();
        if (d === 'lamp') drawLamp(G, res);
        else if (d === 'motor') drawMotor(G, res);
        else drawBell(G, res);
        if (p.fuse) {
          const path = G.paths.fu;
          drawFuseReal(G);
          if (path && !fuseBlown) drawFlow(path, 'fu', s, 1.6 * s);
          hitbox('fuse', G.fuse[0] - 18 * s, G.fuse[1] - 40 * s, 34 * s, 80 * s);
        }
        // Überbrückende Leitung (Kurzschluss)
        const br = G.paths.br;
        if (br) {
          const b = bridge01();
          drawCable(br, 'br', s, b > 0.99 ? heat : 0);
          if (b > 0.99) drawFlow(br, 'br', s, 2.3 * s);
          cableGloss(br, s);
          for (const q of [br.pts[0]!, br.pts[br.pts.length - 1]!]) {
            g.fillStyle = metalGradient(q[0] - 3.5 * s, q[0] + 3.5 * s);
            g.beginPath();
            g.arc(q[0], q[1], 3.6 * s, 0, Math.PI * 2);
            g.fill();
          }
          const xs = br.pts.map((q) => q[0]);
          const ys = br.pts.map((q) => q[1]);
          const bx0 = Math.min(...xs) - 10 * s;
          const by0 = Math.min(...ys) - 8 * s;
          hitbox('bridge', bx0, by0, Math.max(...xs) - bx0 + 10 * s, Math.max(...ys) - by0 + 10 * s);
          if (b < 0.01) {
            const active = !ctx.locked && (hovered === 'bridge' || !p.lbl);
            pill((bx0 + Math.max(...xs)) / 2, Math.max(...ys) + 8 * s, ctx.t(active ? 'tapWire' : 'looseWire'), active ? theme.series[0]! : theme.muted, 'center', labelSize());
          }
        }
      }
      hitbox('device', G.dev[0] - 50 * s, G.bulbC[1] - G.bulbR - 10 * s, 100 * s, G.dev[1] + 14 * s - (G.bulbC[1] - G.bulbR - 10 * s));

      // Hervorhebung und Beschriftungen (dasselbe Bauteil wird in beiden Darstellungen markiert)
      const sz = labelSize();
      highlight(G.bat[0] - 72 * s, G.bat[1] - 88 * s, 144 * s, 128 * s, hovered === 'battery');
      highlight(G.dev[0] - 56 * s, G.bulbC[1] - G.bulbR - 14 * s, 112 * s, G.dev[1] + 18 * s - (G.bulbC[1] - G.bulbR - 14 * s), hovered === 'device');
      if (!test) {
        highlight(G.sw[0] - 56 * s, G.sw[1] - 46 * s, 112 * s, 70 * s, hovered === 'switch' && !ctx.locked);
        highlight(G.fuse[0] - 20 * s, G.fuse[1] - 42 * s, 38 * s, 84 * s, hovered === 'fuse' && p.fuse);
        // Hinweis: Schalter antippen
        if (!usedSwitch && !p.on && !ctx.locked) {
          const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(performance.now() / 260);
          g.save();
          g.strokeStyle = withAlpha(theme.series[0]!, 0.35 + 0.4 * pulse);
          g.lineWidth = 2;
          g.beginPath();
          const ha = (-34 * Math.PI) / 180;
          g.arc(G.s1[0] + Math.cos(ha) * 66 * s, G.sw[1] - 6 * s + Math.sin(ha) * 66 * s, 14 * s + 4 * pulse, 0, Math.PI * 2);
          g.stroke();
          g.restore();
          pill(G.sw[0], G.sw[1] + 20 * s, ctx.t('tapSwitch'), theme.series[0]!, 'center', sz, true);
        } else if (p.lbl) pill(G.sw[0], G.sw[1] + 20 * s, ctx.t('switch'), theme.muted, 'center', sz);
        if (p.lbl) {
          const d = device();
          g.font = `700 ${sz}px ${theme.font}`;
          const lw0 = g.measureText(ctx.t(d)).width + 16;
          const right = G.dev[0] + 30 * s + lw0 < r.x + r.w - 6;
          // rechts neben dem Gerät oder (auf schmalen Bildschirmen) darüber
          if (right) pill(G.dev[0] + 30 * s, G.bulbC[1] - 6 * s, ctx.t(d), theme.muted, 'left', sz);
          else pill(G.dev[0], Math.max(r.y + 4, G.bulbC[1] - G.bulbR - 26 - (d === 'bell' ? 14 * s : 0)), ctx.t(d), theme.muted, 'center', sz);
          if (p.fuse) pill(G.fuse[0] - 16 * s, G.fuse[1] - 11,  ctx.t(fuseBlown ? 'fuseBlown' : 'fuse'), fuseBlown ? theme.series[1]! : theme.muted, 'right', sz);
        }
      }
      if (p.lbl) pill(G.bat[0], G.bat[1] + 39 * s, ctx.t('battery'), theme.muted, 'center', sz);
      // Warnung
      if (res.short) {
        const pulse = reduced ? 1 : 0.75 + 0.25 * Math.sin(performance.now() / 180);
        g.save();
        g.globalAlpha = pulse;
        const w0 = pill(r.x + 12, r.y + 12, `⚠ ${ctx.t('short')}`, theme.series[1]!, 'left', narrow() ? 12 : 13, true);
        g.restore();
        if (!narrow() || r.w > 330) pill(r.x + 12 + w0.w + 6, r.y + 12, ctx.t('hot'), theme.series[1]!, 'left', narrow() ? 11 : 12);
      }
      g.restore();
      return G;
    }

    /* ---------- Szene: Schaltplan ---------- */
    function drawPlan(r: Rect, res: CircuitResult): PlanGeo {
      const P = planGeo(r);
      const { s, x0, x1, y0, y1, bx, ys, dx, nl, nr, yf, ta, tb } = P;
      const theme = ctx.theme;
      const test = mode() === 'test';
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
      g.fillRect(r.x, r.y, r.w, r.h);
      // feines Karopapier
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      g.beginPath();
      const step = 14 * s;
      for (let x = r.x + ((r.w / 2) % step); x < r.x + r.w; x += step) {
        g.moveTo(Math.round(x) + 0.5, r.y);
        g.lineTo(Math.round(x) + 0.5, r.y + r.h);
      }
      for (let y = r.y + ((r.h / 2) % step); y < r.y + r.h; y += step) {
        g.moveTo(r.x, Math.round(y) + 0.5);
        g.lineTo(r.x + r.w, Math.round(y) + 0.5);
      }
      g.stroke();
      text(g, ctx.t('plan'), r.x + 14, r.y + 18, { font: `700 ${narrow() ? 12 : 13}px ${theme.font}`, color: theme.muted, align: 'left' });

      const ink = theme.text;
      const lw = Math.max(1.8, 2.2 * s);
      g.strokeStyle = ink;
      g.fillStyle = ink;
      g.lineWidth = lw;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const line = (pts: Pt[]) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
        g.stroke();
      };
      for (const e of ['w1', 'w2', 'w3', 'w4'] as EdgeId[]) {
        const path = P.paths[e];
        if (path) line(path.pts);
      }
      // Batterie: langer dünner Strich = Pluspol, kurzer dicker Strich = Minuspol
      g.lineWidth = lw;
      line([
        [bx + 5 * s, y1 - 17 * s],
        [bx + 5 * s, y1 + 17 * s],
      ]);
      g.lineWidth = lw * 2.6;
      g.lineCap = 'butt';
      line([
        [bx - 5 * s, y1 - 9 * s],
        [bx - 5 * s, y1 + 9 * s],
      ]);
      g.lineCap = 'round';
      g.lineWidth = lw;
      const fs = Math.round(Math.max(11, 12 * Math.min(1.2, s)));
      text(g, '−', bx - 14 * s, y1 - 15 * s, { font: `700 ${fs + 2}px ${theme.font}`, color: theme.series[0]! });
      text(g, '+', bx + 15 * s, y1 - 15 * s, { font: `700 ${fs + 2}px ${theme.font}`, color: theme.series[1]! });
      if (p.lbl) text(g, ctx.t('battery'), bx, y1 + 28 * s, { font: `600 ${fs}px ${theme.font}`, color: theme.muted });
      hitbox('battery', bx - 24 * s, y1 - 24 * s, 48 * s, 48 * s);
      highlight(bx - 24 * s, y1 - 24 * s, 48 * s, 48 * s, hovered === 'battery');
      highlight(dx - 24 * s, y0 - (mode() === 'circuit' && device() === 'bell' ? 30 : 22) * s, 48 * s, (mode() === 'circuit' && device() === 'bell' ? 44 : 44) * s, hovered === 'device');

      if (test) {
        // Prüfstrecke mit zwei Anschlussklemmen
        for (const x of [ta, tb]) {
          g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
          g.beginPath();
          g.arc(x, y0, 4.2 * s, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = ink;
          g.stroke();
        }
        const o = obj();
        if (o !== 'none' && !objT.running) {
          drawObject(o, (ta + tb) / 2, y0, Math.min((tb - ta + 10 * s) / OBJ_LEN[o], (20 * s) / (OBJ_LEN[o] * OBJ_THICK[o])));
          const path = P.paths.obj;
          if (path && MATERIALS[o].conductor) drawFlow(path, 'obj', s, 2.2 * s, { gap: 17 });
        }
        if (p.lbl) text(g, o === 'none' ? ctx.t('gap') : ctx.t(o), (ta + tb) / 2, y0 - 22 * s, { font: `600 ${fs}px ${theme.font}`, color: theme.muted });
        planLamp(dx, y0, s, res);
        if (p.lbl) text(g, ctx.t('lamp'), dx, y0 - 26 * s, { font: `600 ${fs}px ${theme.font}`, color: theme.muted });
      } else {
        // Schalter (Schließer)
        const c = switchClosed01();
        const a = ((13 + (1 - c) * 27) * Math.PI) / 180;
        const bot: Pt = [x0, ys + 15 * s];
        const L2 = 31 * s;
        g.strokeStyle = ink;
        line([bot, [bot[0] - Math.sin(a) * L2, bot[1] - Math.cos(a) * L2]]);
        line([
          [x0, ys - 15 * s],
          [x0 - 7 * s, ys - 15 * s],
        ]);
        g.beginPath();
        g.arc(bot[0], bot[1], 2.6 * s, 0, Math.PI * 2);
        g.fill();
        hitbox('switch', x0 - 26 * s, ys - 26 * s, 52 * s, 52 * s);
        if (p.lbl) text(g, ctx.t('switch'), x0 + 12 * s, ys, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'left' });
        highlight(x0 - 26 * s, ys - 26 * s, 52 * s, 52 * s, hovered === 'switch' && !ctx.locked);
        // Gerät
        const d = device();
        line([
          [nl, y0],
          [dx - 14 * s, y0],
        ]);
        line([
          [dx + 14 * s, y0],
          [nr, y0],
        ]);
        if (d === 'lamp') planLamp(dx, y0, s, res);
        else if (d === 'motor') {
          g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
          g.beginPath();
          g.arc(dx, y0, 13 * s, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          text(g, 'M', dx, y0 + 0.5, { font: `700 ${Math.round(15 * s)}px ${theme.font}`, color: ink });
          if (res.Idevice > 0) {
            g.strokeStyle = withAlpha(theme.series[3]!, 0.9);
            g.lineWidth = lw * 0.8;
            g.beginPath();
            g.arc(dx, y0, 18 * s, motorAngle * 0.25, motorAngle * 0.25 + Math.PI * 0.6);
            g.stroke();
            g.lineWidth = lw;
          }
        } else {
          // Klingel nach DIN EN 60617: Halbkreis über einem Durchmesser, Anschlüsse am Durchmesser
          g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
          g.fillRect(dx - 14 * s, y0 - lw, 28 * s, 2 * lw);
          line([
            [dx - 14 * s, y0],
            [dx - 7 * s, y0],
            [dx - 7 * s, y0 - 7 * s],
          ]);
          line([
            [dx + 14 * s, y0],
            [dx + 7 * s, y0],
            [dx + 7 * s, y0 - 7 * s],
          ]);
          line([
            [dx - 14 * s, y0 - 7 * s],
            [dx + 14 * s, y0 - 7 * s],
          ]);
          g.beginPath();
          g.arc(dx, y0 - 7 * s, 14 * s, Math.PI, 0);
          g.stroke();
          if (res.Idevice > 0.05) {
            g.strokeStyle = withAlpha(theme.series[4]!, 0.85);
            for (let k = 0; k < 2; k++) {
              g.beginPath();
              g.arc(dx, y0 - 9 * s, 19 * s + k * 5 * s, -Math.PI * 0.75, -Math.PI * 0.25);
              g.stroke();
            }
            g.strokeStyle = ink;
          }
        }
        hitbox('device', dx - 22 * s, y0 - 26 * s, 44 * s, 44 * s);
        if (p.lbl) text(g, ctx.t(d), dx, y0 - (d === 'bell' ? 44 : 26) * s, { font: `600 ${fs}px ${theme.font}`, color: theme.muted });
        // Überbrückung
        const b = bridge01();
        const br = P.paths.br;
        if (br && b > 0.01) {
          g.save();
          g.globalAlpha = b;
          g.strokeStyle = res.short ? theme.series[1]! : ink;
          line(br.pts);
          g.fillStyle = res.short ? theme.series[1]! : ink;
          for (const x of [nl, nr]) {
            g.beginPath();
            g.arc(x, y0, 3.4 * s, 0, Math.PI * 2);
            g.fill();
          }
          g.restore();
          if (b > 0.99) drawFlow(br, 'br', s, 2.6 * s, { gap: 17 });
        }
        hitbox('bridge', nl - 6 * s, y0 + 20 * s, nr - nl + 12 * s, 24 * s);
        highlight(nl - 8 * s, y0 + 18 * s, nr - nl + 16 * s, 26 * s, hovered === 'bridge' && b > 0.5);
        // Sicherung: Rechteck, durch das der Leiter längs verläuft
        if (p.fuse) {
          g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
          g.fillRect(x1 - 5 * s, yf - 15 * s, 10 * s, 30 * s);
          g.strokeStyle = fuseBlown ? theme.series[1]! : ink;
          g.strokeRect(x1 - 5 * s, yf - 15 * s, 10 * s, 30 * s);
          if (fuseBlown) {
            line([
              [x1, yf - 15 * s],
              [x1, yf - 4 * s],
            ]);
            line([
              [x1, yf + 4 * s],
              [x1, yf + 15 * s],
            ]);
          } else {
            line([
              [x1, yf - 15 * s],
              [x1, yf + 15 * s],
            ]);
            const path = P.paths.fu;
            if (path) drawFlow(path, 'fu', s, 2.2 * s, { gap: 17 });
          }
          g.strokeStyle = ink;
          hitbox('fuse', x1 - 18 * s, yf - 22 * s, 36 * s, 44 * s);
          highlight(x1 - 18 * s, yf - 22 * s, 36 * s, 44 * s, hovered === 'fuse');
          if (p.lbl) text(g, ctx.t('fuse'), x1 - 12 * s, yf, { font: `600 ${fs}px ${theme.font}`, color: fuseBlown ? theme.series[1]! : theme.muted, align: 'right' });
        }
      }
      // Strom auf den Leitungen
      for (const e of ['w1', 'sw', 'w2', 'w3', 'w4'] as EdgeId[]) {
        const path = P.paths[e];
        if (!path) continue;
        if (e === 'sw' && (switchClosed01() < 0.999 || !p.on)) continue;
        drawFlow(path, e, s, 2.6 * s, { gap: 17 });
      }
      drawLegend(P);
      g.restore();
      return P;
    }

    /** Legende der verwendeten Schaltzeichen (wenn unter dem Schaltplan Platz ist). */
    function drawLegend(P: PlanGeo): void {
      const r = P.r;
      const theme = ctx.theme;
      const top = P.legendTop;
      const avail = r.y + r.h - top - 8;
      if (avail < 64) return;
      const items: [string, (x: number, y: number) => void][] = [];
      const ink = theme.text;
      const k = 0.85;
      const lw = 1.8;
      const ln = (pts: Pt[]) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
        g.stroke();
      };
      const paper = theme.dark ? '#121a25' : '#fbfcfe';
      items.push([
        'sBattery',
        (x, y) => {
          ln([
            [x - 16, y],
            [x - 3, y],
          ]);
          ln([
            [x + 3, y],
            [x + 16, y],
          ]);
          ln([
            [x + 3, y - 11 * k],
            [x + 3, y + 11 * k],
          ]);
          g.lineWidth = lw * 2.6;
          g.lineCap = 'butt';
          ln([
            [x - 3, y - 6 * k],
            [x - 3, y + 6 * k],
          ]);
          g.lineCap = 'round';
          g.lineWidth = lw;
        },
      ]);
      if (mode() === 'circuit') {
        const closedNow = switchClosed01() > 0.5;
        items.push([
          closedNow ? 'sSwitchOn' : 'sSwitch',
          (x, y) => {
            ln([
              [x - 16, y],
              [x - 7, y],
              closedNow ? [x + 8, y - 3] : [x + 7, y - 7],
            ]);
            ln([
              [x + 8, y],
              [x + 16, y],
            ]);
            g.beginPath();
            g.arc(x - 7, y, 2, 0, Math.PI * 2);
            g.fill();
          },
        ]);
      }
      const d = device();
      items.push([
        d === 'lamp' ? 'sLamp' : d === 'motor' ? 'sMotor' : 'sBell',
        (x, y) => {
          const R = 9;
          if (d === 'bell') {
            ln([
              [x - 16, y + 4],
              [x - 5, y + 4],
              [x - 5, y - 1],
            ]);
            ln([
              [x + 16, y + 4],
              [x + 5, y + 4],
              [x + 5, y - 1],
            ]);
            ln([
              [x - 10, y - 1],
              [x + 10, y - 1],
            ]);
            g.beginPath();
            g.arc(x, y - 1, 10, Math.PI, 0);
            g.stroke();
            return;
          }
          ln([
            [x - 16, y],
            [x - R, y],
          ]);
          ln([
            [x + R, y],
            [x + 16, y],
          ]);
          g.fillStyle = paper;
          g.beginPath();
          g.arc(x, y, R, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          g.fillStyle = ink;
          if (d === 'motor') text(g, 'M', x, y + 0.5, { font: `700 11px ${theme.font}`, color: ink });
          else {
            const q = R * Math.SQRT1_2;
            ln([
              [x - q, y - q],
              [x + q, y + q],
            ]);
            ln([
              [x + q, y - q],
              [x - q, y + q],
            ]);
          }
        },
      ]);
      if (mode() === 'circuit' && p.fuse) {
        items.push([
          'sFuse',
          (x, y) => {
            ln([
              [x - 16, y],
              [x + 16, y],
            ]);
            g.strokeRect(x - 9, y - 4, 18, 8);
          },
        ]);
      }
      if (mode() === 'circuit' && p.sc) {
        items.push([
          'sNode',
          (x, y) => {
            ln([
              [x - 16, y],
              [x + 16, y],
            ]);
            ln([
              [x, y],
              [x, y + 9],
            ]);
            g.beginPath();
            g.arc(x, y, 3, 0, Math.PI * 2);
            g.fill();
          },
        ]);
      }
      if (mode() === 'test') {
        items.push([
          'sTerm',
          (x, y) => {
            ln([
              [x - 16, y],
              [x - 4, y],
            ]);
            g.fillStyle = paper;
            g.beginPath();
            g.arc(x, y, 3.6, 0, Math.PI * 2);
            g.fill();
            g.stroke();
            g.fillStyle = ink;
          },
        ]);
      }
      const fs = narrow() ? 11 : 12;
      text(g, ctx.t('legend'), r.x + 14, top, { font: `700 ${fs}px ${theme.font}`, color: theme.muted, align: 'left' });
      const cols = r.w >= 300 && items.length > 3 ? 2 : 1;
      const rowH = Math.min(30, (avail - 18) / Math.ceil(items.length / cols));
      if (rowH < 20) return;
      const colW = (r.w - 28) / cols;
      g.strokeStyle = ink;
      g.fillStyle = ink;
      g.lineWidth = lw;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      items.forEach(([key, draw], i) => {
        const col = cols === 2 ? i % 2 : 0;
        const row = cols === 2 ? Math.floor(i / 2) : i;
        const x = r.x + 14 + col * colW + 20;
        const y = top + 20 + row * rowH + rowH / 2;
        g.strokeStyle = ink;
        g.fillStyle = ink;
        g.lineWidth = lw;
        draw(x, y);
        text(g, ctx.t(key), x + 26, y, { font: `600 ${fs}px ${theme.font}`, color: theme.text, align: 'left' });
      });
    }

    function planLamp(x: number, y: number, s: number, res: CircuitResult): void {
      const theme = ctx.theme;
      const T = lampT(res);
      const glow = Math.min(1, glowOf(T));
      const R = 13 * s;
      if (glow > 0.01) {
        const [hr, hg, hb] = haloColor(T);
        const halo = g.createRadialGradient(x, y, R * 0.4, x, y, R * 2.6);
        halo.addColorStop(0, `rgba(${hr},${hg},${hb},${0.75 * glow})`);
        halo.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        g.fillStyle = halo;
        g.beginPath();
        g.arc(x, y, R * 2.6, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = glow > 0.01 ? `rgba(255,236,170,${0.25 + 0.6 * glow})` : theme.dark ? '#121a25' : '#fbfcfe';
      g.beginPath();
      g.arc(x, y, R, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = theme.text;
      g.stroke();
      const k = R * Math.SQRT1_2;
      g.beginPath();
      g.moveTo(x - k, y - k);
      g.lineTo(x + k, y + k);
      g.moveTo(x + k, y - k);
      g.lineTo(x - k, y + k);
      g.stroke();
    }

    /* ---------- Gegenstände zum Prüfen ---------- */
    function slotRects(tray: Rect): Rect[] {
      const small = narrow();
      const cols = small ? 4 : 8;
      const rows = small ? 2 : 1;
      const pad = 10;
      const head = 22;
      const gap = small ? 6 : 8;
      const cw = (tray.w - 2 * pad - (cols - 1) * gap) / cols;
      const ch = (tray.h - head - pad - (rows - 1) * gap) / rows;
      return MATERIAL_IDS.map((_, i) => ({ x: tray.x + pad + (i % cols) * (cw + gap), y: tray.y + head + Math.floor(i / cols) * (ch + gap), w: cw, h: ch }));
    }

    function slotObjectPos(rc: Rect, id: MaterialId): { x: number; y: number; k: number } {
      const k = Math.min((rc.w * 0.78) / OBJ_LEN[id], (rc.h * 0.46) / (OBJ_LEN[id] * Math.max(0.42, OBJ_THICK[id])));
      return { x: rc.x + rc.w / 2, y: rc.y + rc.h * 0.4, k };
    }

    function drawTray(tray: Rect): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      g.save();
      g.fillStyle = dark ? '#161f2b' : '#f1f4f8';
      roundRect(g, tray.x, tray.y, tray.w, tray.h, 12);
      g.fill();
      text(g, ctx.t('tray'), tray.x + 12, tray.y + 12, { font: `700 ${narrow() ? 11 : 12}px ${theme.font}`, color: theme.muted, align: 'left' });
      const rects = slotRects(tray);
      const small = narrow();
      MATERIAL_IDS.forEach((id, i) => {
        const rc = rects[i]!;
        const active = obj() === id;
        const hov = hovered === `slot:${id}`;
        g.save();
        if (!active) shadowOn(6, 2, 0.7);
        g.fillStyle = active ? 'rgba(0,0,0,0)' : dark ? '#222c39' : '#ffffff';
        roundRect(g, rc.x, rc.y, rc.w, rc.h, 9);
        g.fill();
        g.restore();
        if (active) {
          g.save();
          g.strokeStyle = withAlpha(theme.muted, 0.55);
          g.setLineDash([4, 4]);
          g.lineWidth = 1.2;
          roundRect(g, rc.x + 0.5, rc.y + 0.5, rc.w - 1, rc.h - 1, 9);
          g.stroke();
          g.restore();
        } else if (hov && !ctx.locked) {
          g.strokeStyle = withAlpha(theme.series[0]!, 0.7);
          g.lineWidth = 1.5;
          roundRect(g, rc.x + 0.5, rc.y + 0.5, rc.w - 1, rc.h - 1, 9);
          g.stroke();
        }
        const flying = objT.running && (id === obj() || id === objFrom);
        if (!active && !flying) {
          const pos = slotObjectPos(rc, id);
          drawObject(id, pos.x, pos.y, pos.k);
        }
        text(g, ctx.t(id), rc.x + rc.w / 2, rc.y + rc.h * 0.76, { font: `600 ${small ? 10.5 : 11.5}px ${theme.font}`, color: theme.text });
        // Ergebnis nach dem Prüfen
        if (tested.includes(id)) {
          const ok = MATERIALS[id].conductor;
          const color = ok ? theme.series[2]! : theme.series[1]!;
          const cx = rc.x + rc.w - 10;
          const cy = rc.y + 10;
          g.fillStyle = color;
          g.beginPath();
          g.arc(cx, cy, 7, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = '#ffffff';
          g.lineWidth = 1.8;
          g.lineCap = 'round';
          g.beginPath();
          if (ok) {
            g.moveTo(cx - 3.2, cy + 0.2);
            g.lineTo(cx - 0.8, cy + 2.6);
            g.lineTo(cx + 3.4, cy - 2.6);
          } else {
            g.moveTo(cx - 2.6, cy - 2.6);
            g.lineTo(cx + 2.6, cy + 2.6);
            g.moveTo(cx + 2.6, cy - 2.6);
            g.lineTo(cx - 2.6, cy + 2.6);
          }
          g.stroke();
        }
        hitbox(`slot:${id}`, rc.x, rc.y, rc.w, rc.h);
      });
      g.restore();
    }

    /** Gegenstand fliegt zwischen Kasten und Prüfstrecke. */
    function drawFlying(tray: Rect, G: RealGeo | null, P: PlanGeo | null): void {
      if (!objT.running) return;
      const rects = slotRects(tray);
      const target = G ? { x: G.objC[0], y: G.objC[1], k: G.s * OBJ_SCALE } : P ? { x: (P.ta + P.tb) / 2, y: P.y0, k: P.s * 0.8 } : null;
      if (!target) return;
      const u = objT.value;
      const fly = (id: MaterialId, toGap: boolean) => {
        const rc = rects[MATERIAL_IDS.indexOf(id)]!;
        const slot = slotObjectPos(rc, id);
        const t = toGap ? u : 1 - u;
        const x = mix(slot.x, target.x, t);
        const y = mix(slot.y, target.y, t) - Math.sin(t * Math.PI) * 40;
        const k = mix(slot.k, target.k, t);
        g.save();
        shadowOn(14, 8 + 10 * Math.sin(t * Math.PI));
        drawObject(id, x, y, k);
        g.restore();
      };
      if (objFrom !== 'none') fly(objFrom, false);
      const o = obj();
      if (o !== 'none') fly(o, true);
    }

    /* ---------- Ablauf ---------- */
    function step(dt: number, res: CircuitResult): void {
      // Sicherung schmilzt nach kurzer Überlast durch
      if (fuseActive() && !fuseBlown && fuseBlows(res.I)) {
        overload += dt;
        if (overload > 0.35) {
          fuseBlown = true;
          sparkT.play();
          updateReadouts();
        }
      } else overload = 0;
      const target = res.short ? 1 : 0;
      heat += (target - heat) * Math.min(1, dt * (res.short ? 0.7 : 1.2));
      if (heat < 0.002) heat = 0;
      if (!reduced) {
        for (const e of Object.keys(phase) as EdgeId[]) phase[e] += flowSpeed(edgeCurrent(e, res)) * dt;
        motorAngle += (flowSpeed(res.Idevice) / 30) * 14 * dt;
      }
      bellTime += dt;
    }

    updateReadouts();

    return {
      update(changed, source) {
        if (changed.has('on')) {
          const before = p.on ? 0 : 1;
          switchFrom = switchT.running ? mix(switchFrom, before, switchT.value) : before;
          if (source !== 'init') switchT.play();
          if (p.on) usedSwitch = true;
        }
        if (changed.has('sc')) {
          const before = p.sc ? 0 : 1;
          bridgeFrom = bridgeT.running ? mix(bridgeFrom, before, bridgeT.value) : before;
          if (source !== 'init') bridgeT.play();
        }
        if (changed.has('view')) {
          viewFrom = lastView;
          lastView = view();
          if (source !== 'init' && viewFrom !== view()) viewT.play();
        }
        if (changed.has('obj')) {
          objFrom = lastObj;
          lastObj = obj();
          if (source !== 'init' && mode() === 'test') objT.play();
          const o = obj();
          if (o !== 'none' && !tested.includes(o)) tested = [...tested, o];
        }
        if (changed.has('fuse') || changed.has('mode') || source === 'replace') {
          fuseBlown = false;
          overload = 0;
        }
        if (source === 'replace' || source === 'init') {
          switchT.finish();
          bridgeT.finish();
          if (source === 'init') objT.finish();
        }
        lastFrame = performance.now();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'switch') {
          usedSwitch = true;
          ctx.set({ on: !p.on });
        }
        else if (id === 'replace') replaceFuse();
        else if (id === 'next') {
          const i = MATERIAL_IDS.indexOf(obj() as MaterialId);
          ctx.set({ obj: MATERIAL_IDS[(i + 1) % MATERIAL_IDS.length]! });
        } else if (id === 'clear') {
          tested = obj() === 'none' ? [] : [obj() as MaterialId];
          updateReadouts();
        }
        lastFrame = performance.now();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        const res = result();
        step(dt, res);
        hits = [];
        hovered = hoveredNow();
        surface.begin();
        const reg = regions();
        let G: RealGeo | null = null;
        let P: PlanGeo | null = null;
        if (reg.showReal) G = drawReal(reg.real, res);
        if (reg.showPlan) P = drawPlan(reg.plan, res);
        if (reg.tray) {
          drawTray(reg.tray);
          drawFlying(reg.tray, reg.showReal && view() !== 'plan' ? G : null, P);
        }
        const moving = res.I > 1e-9 && !reduced && flow() !== 'none';
        const busy = switchT.running || bridgeT.running || viewT.running || objT.running || sparkT.running || heat > 0;
        const devAnim = res.Idevice > 0.01 && device() !== 'lamp' && !reduced;
        const hint = mode() === 'circuit' && !usedSwitch && !p.on && !ctx.locked && !reduced;
        const focusing = !!focus && performance.now() < focus.until + 50;
        if (moving || busy || devAnim || hint || focusing) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
