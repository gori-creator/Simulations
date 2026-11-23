import { defineSimulation, drawCard, ease, offscreenCanvas, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  coilField,
  commutatorSign,
  compassAngle,
  loopAxisB,
  loopCenterB,
  loopField,
  motorMaxTorque,
  motorStep,
  motorTorque,
  MOTOR,
  RELAY,
  relayForce,
  relayState,
  solenoidAxisB,
  solenoidB,
  traceLine,
  wireB,
  wireForcePerLength,
  wiresField,
  type V2,
  type Wire,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const TAU = 2 * Math.PI;
/** μ_r des Eisenkerns (vereinfacht, weit unter der Sättigung) */
const MU_IRON = 1000;

/**
 * Magnetfeld von Leiter und Spule: gerader Leiter mit Kompassnadeln
 * (Ørsted-Versuch) und Hallsonde, zwei parallele Leiter mit Kraft,
 * Leiterschleife und Spule im Längsschnitt mit berechneten Feldlinien und
 * Feldstärke-Farbbild, Eisenkern, Feld auf der Achse; Anwendungen Relais
 * (Hysterese) und Gleichstrommotor (Stromwender).
 */
export default defineSimulation({
  id: 'magnetfeld-spule',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'wire', label: L('Gerader Leiter', 'Straight wire') },
        { value: 'loop', label: L('Leiterschleife', 'Current loop') },
        { value: 'coil', label: L('Spule', 'Coil') },
        { value: 'relay', label: L('Anwendung: Relais', 'Application: relay') },
        { value: 'motor', label: L('Anwendung: Elektromotor', 'Application: electric motor') },
        { value: 'measure', label: L('Messreihe: Wovon hängt B ab?', 'Experiment: what does B depend on?') },
      ],
      default: 'wire',
    },
    {
      key: 'I',
      type: 'number',
      label: L('Stromstärke I', 'Current I'),
      help: L('Negativ: Strom fließt andersherum.', 'Negative: the current flows the other way.'),
      min: -20,
      max: 20,
      step: 0.5,
      default: 10,
      unit: 'A',
      visibleIf: (v) => v.mode === 'wire' || v.mode === 'loop' || v.mode === 'coil' || v.mode === 'measure',
    },
    {
      key: 'vary',
      type: 'choice',
      label: L('Was wird verändert?', 'What is varied?'),
      options: [
        { value: 'I', label: L('Stromstärke I', 'current I') },
        { value: 'N', label: L('Windungszahl N', 'number of turns N') },
        { value: 'l', label: L('Länge l', 'length l') },
      ],
      default: 'I',
      visibleIf: (v) => v.mode === 'measure',
    },
    {
      key: 'w2',
      type: 'choice',
      label: L('Zweiter Leiter', 'Second wire'),
      options: [
        { value: 'none', label: L('keiner', 'none') },
        { value: 'anti', label: L('Strom entgegengesetzt', 'opposite current') },
        { value: 'same', label: L('Strom gleichgerichtet', 'same direction') },
      ],
      default: 'none',
      visibleIf: (v) => v.mode === 'wire',
    },
    { key: 'dw', type: 'number', label: L('Abstand der Leiter d', 'Distance between the wires d'), min: 2, max: 12, step: 0.5, default: 6, unit: 'cm', visibleIf: (v) => v.mode === 'wire' && v.w2 !== 'none' },
    { key: 'earth', type: 'boolean', label: L('Erdmagnetfeld (Ørsted-Versuch)', 'Earth’s magnetic field (Ørsted’s experiment)'), default: true, visibleIf: (v) => v.mode === 'wire' },
    { key: 'N', type: 'number', label: L('Windungszahl N', 'Number of turns N'), min: 10, max: 1000, step: 10, default: 500, visibleIf: (v) => v.mode === 'coil' || v.mode === 'measure' },
    { key: 'len', type: 'number', label: L('Länge der Spule l', 'Length of the coil l'), min: 4, max: 40, step: 1, default: 25, unit: 'cm', visibleIf: (v) => v.mode === 'coil' || v.mode === 'measure' },
    { key: 'rad', type: 'number', label: L('Radius r', 'Radius r'), min: 1, max: 8, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.mode === 'coil' || v.mode === 'loop' },
    {
      key: 'core',
      type: 'choice',
      label: L('Kern', 'Core'),
      options: [
        { value: 'air', label: L('Luft', 'air') },
        { value: 'iron', label: L('Eisen (μ_r ≈ 1000)', 'iron (μ_r ≈ 1000)') },
      ],
      default: 'air',
      visibleIf: (v) => v.mode === 'coil',
    },
    { key: 'ir', type: 'number', label: L('Strom in der Relaisspule', 'Current in the relay coil'), help: L('Spule mit 400 Windungen.', 'Coil with 400 turns.'), min: 0, max: 300, step: 5, default: 200, unit: 'mA', visibleIf: (v) => v.mode === 'relay' },
    { key: 'im', type: 'number', label: L('Motorstrom', 'Motor current'), min: -4, max: 4, step: 0.1, default: 2, unit: 'A', visibleIf: (v) => v.mode === 'motor' },
    { key: 'comm', type: 'boolean', label: L('Stromwender (Kommutator)', 'Commutator'), default: true, visibleIf: (v) => v.mode === 'motor' },
    {
      key: 'lin',
      type: 'boolean',
      label: L('B über 1/l auftragen (Gerade)', 'Plot B against 1/l (straight line)'),
      help: L('Linearisieren: Aus der Hyperbel wird eine Ursprungsgerade.', 'Linearise: the hyperbola becomes a straight line through the origin.'),
      default: false,
      visibleIf: (v) => v.mode === 'measure' && v.vary === 'l',
    },
    { key: 'lines', type: 'boolean', group: 'view', label: L('Feldlinien', 'Field lines'), default: true, visibleIf: (v) => v.mode !== 'relay' && v.mode !== 'motor' },
    { key: 'heat', type: 'boolean', group: 'view', label: L('Feldstärke als Farbe', 'Field strength as colour'), default: true, visibleIf: (v) => v.mode === 'loop' || v.mode === 'coil' },
    { key: 'needles', type: 'boolean', group: 'view', label: L('Kompassnadeln', 'Compass needles'), default: true, visibleIf: (v) => v.mode === 'wire' || v.mode === 'coil' },
    { key: 'probe', type: 'boolean', group: 'view', label: L('Hallsonde (Messpunkt)', 'Hall probe (measuring point)'), default: true, visibleIf: (v) => v.mode === 'wire' || v.mode === 'loop' || v.mode === 'coil' },
    { key: 'px', type: 'number', label: L('Sonde x', 'Probe x'), min: -20, max: 20, step: 0.1, default: 3, unit: 'cm', visibleIf: () => false },
    { key: 'py', type: 'number', label: L('Sonde y', 'Probe y'), min: -15, max: 15, step: 0.1, default: 0, unit: 'cm', visibleIf: () => false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'flip', label: L('Strom umpolen', 'Reverse the current'), primary: true, visibleIf: (v) => v.mode === 'wire' || v.mode === 'loop' || v.mode === 'coil' || v.mode === 'motor' },
    { id: 'switch', label: L('Taster drücken', 'Press the button'), primary: true, visibleIf: (v) => v.mode === 'relay' },
    { id: 'kick', label: L('Anstoßen', 'Give it a push'), visibleIf: (v) => v.mode === 'motor' },
    { id: 'take', label: L('Messwert aufnehmen', 'Take a reading'), primary: true, visibleIf: (v) => v.mode === 'measure' },
    { id: 'clearm', label: L('Messreihe löschen', 'Clear the readings'), visibleIf: (v) => v.mode === 'measure' },
  ],
  readouts: [
    { key: 'B', label: L('Flussdichte am Messpunkt', 'Flux density at the probe'), spoiler: true },
    { key: 'formula', label: L('Formel', 'Formula') },
    { key: 'extra', label: L('Außerdem', 'Also'), spoiler: true },
  ],
  presets: [
    { id: 'oersted', label: L('Ørsted: Kompass neben dem Draht', 'Ørsted: compass next to the wire'), values: { mode: 'wire', I: 10, w2: 'none', earth: true, needles: true, px: 2, py: 0 } },
    { id: 'probe', label: L('I = 10 A, r = 2 cm → 0,1 mT', 'I = 10 A, r = 2 cm → 0.1 mT'), values: { mode: 'wire', I: 10, w2: 'none', probe: true, px: 2, py: 0 } },
    { id: 'anti', label: L('Zwei Leiter: Ströme entgegengesetzt', 'Two wires: opposite currents'), values: { mode: 'wire', I: 15, w2: 'anti', dw: 6, earth: false, px: 0, py: 0 } },
    { id: 'same', label: L('Zwei Leiter: Ströme gleichgerichtet', 'Two wires: currents in the same direction'), values: { mode: 'wire', I: 15, w2: 'same', dw: 6, earth: false, px: 0, py: 4 } },
    { id: 'loop', label: L('Leiterschleife', 'Current loop'), values: { mode: 'loop', I: 10, rad: 4, px: 0, py: 0 } },
    { id: 'coil', label: L('Spule: N = 500, I = 2 A, l = 25 cm', 'Coil: N = 500, I = 2 A, l = 25 cm'), values: { mode: 'coil', N: 500, I: 2, len: 25, rad: 3, core: 'air', px: 0, py: 0 } },
    { id: 'short', label: L('Kurze, dicke Spule', 'Short, wide coil'), values: { mode: 'coil', N: 200, I: 2, len: 5, rad: 6, core: 'air', px: 0, py: 0 } },
    { id: 'iron', label: L('Elektromagnet mit Eisenkern', 'Electromagnet with iron core'), values: { mode: 'coil', N: 500, I: 2, len: 25, rad: 3, core: 'iron', px: 0, py: 0 } },
    { id: 'relay', label: L('Relais schaltet eine Lampe', 'A relay switches a lamp'), values: { mode: 'relay', ir: 200 } },
    { id: 'weak', label: L('Relais: Strom zu schwach', 'Relay: current too weak'), values: { mode: 'relay', ir: 120 } },
    { id: 'motor', label: L('Elektromotor mit Stromwender', 'Electric motor with commutator'), values: { mode: 'motor', im: 2, comm: true } },
    { id: 'nocomm', label: L('Ohne Stromwender: Der Läufer pendelt', 'Without commutator: the rotor rocks'), values: { mode: 'motor', im: 2, comm: false } },
    { id: 'mI', label: L('Messreihe: B und I', 'Experiment: B and I'), values: { mode: 'measure', vary: 'I', I: 2, N: 500, len: 25 } },
    { id: 'mL', label: L('Messreihe: B und l', 'Experiment: B and l'), values: { mode: 'measure', vary: 'l', I: 2, N: 500, len: 25 } },
  ],
  strings: {
    de: {
      canvas: 'Magnetfeld stromdurchflossener Leiter: Feldlinien, Kompassnadeln und eine Hallsonde um einen geraden Leiter, eine Leiterschleife und eine Spule, dazu ein Relais und ein Elektromotor.',
      probe: 'Sonde',
      out: 'Strom aus der Ebene heraus',
      in: 'Strom in die Ebene hinein',
      wireT: 'Magnetfeld um einen geraden Leiter',
      wireRule: 'Rechte-Faust-Regel: Der Daumen zeigt in Stromrichtung, die gekrümmten Finger zeigen die Richtung der Feldlinien.',
      wireOersted: 'Ørsted 1820: Eine Kompassnadel neben dem Draht schlägt aus, sobald Strom fließt. Je stärker der Strom, desto weiter dreht sie sich weg vom Norden.',
      wireAnti: 'Entgegengesetzte Ströme: Zwischen den Leitern addieren sich die Felder. Die Leiter stoßen sich ab.',
      wireSame: 'Gleichgerichtete Ströme: Zwischen den Leitern heben sich die Felder auf. Die Leiter ziehen sich an.',
      force: 'Kraft pro Meter',
      attract: 'Anziehung',
      repel: 'Abstoßung',
      distance: 'Abstand',
      loopT: 'Magnetfeld einer Leiterschleife',
      loopG: 'Im Inneren laufen die Feldlinien gebündelt in eine Richtung. Außen schließen sie sich – wie bei einem kurzen Stabmagneten.',
      coilT: 'Magnetfeld einer Spule',
      coilG: 'Innen ist das Feld fast homogen (parallele Feldlinien). Außen sieht es aus wie bei einem Stabmagneten: Die Feldlinien treten am Nordpol aus.',
      coilIron: 'Der Eisenkern verstärkt das Feld etwa um den Faktor μ_r. So entsteht ein Elektromagnet. In Wirklichkeit ist Eisen bei etwa 2 T gesättigt, stärker wird es dann kaum.',
      coilShort: 'Diese Spule ist kurz und dick: Die Formel für lange Spulen gilt nur ungefähr.',
      axis: 'B auf der Achse',
      ideal: 'ideale lange Spule',
      xAx: 'x in cm',
      rAx: 'r in cm',
      bAx: 'B in mT',
      relayT: 'Relais: kleiner Strom schaltet großen Strom',
      relayOn: 'Der Anker ist angezogen: Der Arbeitsstromkreis ist geschlossen, die Lampe leuchtet.',
      relayOff: 'Der Anker liegt nicht an: Die Lampe ist aus.',
      relayWeak: 'Die Spule ist eingeschaltet, aber N·I reicht nicht zum Anziehen (60 A nötig).',
      relayHyst: 'Angezogen bleibt der Anker schon ab 35 A, weil der Luftspalt kleiner ist (Hysterese).',
      relayG: 'Steuerstromkreis: Taster, Batterie und Spule mit Eisenkern. Arbeitsstromkreis: Lampe mit eigener Spannungsquelle.',
      control: 'Steuerstromkreis',
      work: 'Arbeitsstromkreis',
      pressed: 'Taster gedrückt',
      released: 'Taster offen',
      thetaAx: 'N·I in A',
      motorT: 'Gleichstrommotor',
      motorG: 'Auf die stromdurchflossenen Seiten der Spule wirken im Feld des Magneten Kräfte (Lorentzkraft). Sie drehen die Spule.',
      motorComm: 'Der Stromwender polt den Strom jede halbe Umdrehung um. So dreht sich die Spule immer weiter.',
      motorNoComm: 'Ohne Stromwender bremst die Kraft nach dem Totpunkt die Drehung: Die Spule pendelt und bleibt stehen.',
      dead: 'Totpunkt',
      torque: 'Drehmoment',
      phiAx: 'Drehwinkel in °',
      mAx: 'M in mN·m',
      rpm: 'Drehzahl',
      measT: 'Messreihe an einer Spule',
      measHow: 'Stelle einen Wert ein und tippe auf „Messwert aufnehmen“. Die Hallsonde misst B in der Mitte der Spule.',
      measI: 'B ist proportional zu I: Doppelte Stromstärke, doppeltes Feld.',
      measN: 'B ist proportional zu N: Doppelt so viele Windungen auf gleicher Länge, doppeltes Feld.',
      measL: 'B ist umgekehrt proportional zu l: Doppelte Länge bei gleicher Windungszahl, halbes Feld.',
      supply: 'Netzgerät',
      meter: 'Teslameter',
      fitK: 'Ausgleichskurve',
      theory: 'Theorie',
      points: 'Messwerte',
    },
    en: {
      canvas: 'Magnetic field of current-carrying conductors: field lines, compass needles and a Hall probe around a straight wire, a current loop and a coil, plus a relay and an electric motor.',
      probe: 'probe',
      out: 'current out of the page',
      in: 'current into the page',
      wireT: 'Magnetic field around a straight wire',
      wireRule: 'Right-hand grip rule: the thumb points along the current, the curled fingers show the direction of the field lines.',
      wireOersted: 'Ørsted 1820: a compass needle next to the wire swings as soon as current flows. The stronger the current, the further it turns away from north.',
      wireAnti: 'Opposite currents: between the wires the fields add up. The wires repel each other.',
      wireSame: 'Currents in the same direction: between the wires the fields cancel. The wires attract each other.',
      force: 'force per metre',
      attract: 'attraction',
      repel: 'repulsion',
      distance: 'distance',
      loopT: 'Magnetic field of a current loop',
      loopG: 'Inside, the field lines run bundled in one direction. Outside they close – like a short bar magnet.',
      coilT: 'Magnetic field of a coil',
      coilG: 'Inside, the field is almost uniform (parallel field lines). Outside it looks like a bar magnet: the field lines leave at the north pole.',
      coilIron: 'The iron core strengthens the field by about the factor μ_r. This makes an electromagnet. In reality iron saturates at about 2 T and hardly gets any stronger.',
      coilShort: 'This coil is short and wide: the formula for long coils only holds roughly.',
      axis: 'B on the axis',
      ideal: 'ideal long coil',
      xAx: 'x in cm',
      rAx: 'r in cm',
      bAx: 'B in mT',
      relayT: 'Relay: a small current switches a large one',
      relayOn: 'The armature is pulled in: the load circuit is closed, the lamp is on.',
      relayOff: 'The armature is released: the lamp is off.',
      relayWeak: 'The coil is switched on, but N·I is not enough to pull in (60 A needed).',
      relayHyst: 'Once pulled in, the armature stays down from 35 A, because the air gap is smaller (hysteresis).',
      relayG: 'Control circuit: button, battery and coil with iron core. Load circuit: lamp with its own power supply.',
      control: 'control circuit',
      work: 'load circuit',
      pressed: 'button pressed',
      released: 'button open',
      thetaAx: 'N·I in A',
      motorT: 'DC motor',
      motorG: 'In the field of the magnet, forces act on the current-carrying sides of the coil (Lorentz force). They turn the coil.',
      motorComm: 'The commutator reverses the current every half turn. That keeps the coil turning.',
      motorNoComm: 'Without a commutator the force brakes the rotation after the dead centre: the coil rocks and stops.',
      dead: 'dead centre',
      torque: 'torque',
      phiAx: 'angle of rotation in °',
      mAx: 'M in mN·m',
      rpm: 'speed',
      measT: 'Measurements on a coil',
      measHow: 'Set a value and tap “Take a reading”. The Hall probe measures B in the centre of the coil.',
      measI: 'B is proportional to I: double the current, double the field.',
      measN: 'B is proportional to N: twice the turns on the same length, double the field.',
      measL: 'B is inversely proportional to l: double the length with the same turns, half the field.',
      supply: 'power supply',
      meter: 'teslameter',
      fitK: 'fitted curve',
      theory: 'theory',
      points: 'readings',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 1e-15 ? 0 : v, d) : '–');
    const narrow = () => surface.width < 640;
    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.15;
    const OFF: Rect = { x: -1000, y: -1000, w: 10, h: 10 };
    const COL = {
      blue: () => th().series[0]!,
      red: () => th().series[1]!,
      green: () => th().series[2]!,
      orange: () => th().series[3]!,
      purple: () => th().series[4]!,
      teal: () => th().series[5]!,
    };
    /** Flussdichte lesbar: µT oder mT oder T. */
    function Bstr(B: number): string {
      const a = Math.abs(B);
      if (a < 1e-3) return `${N(B * 1e6, a < 1e-5 ? 2 : 1)} µT`;
      if (a < 1) return `${N(B * 1e3, a < 1e-2 ? 3 : 2)} mT`;
      return `${N(B, 3)} T`;
    }
    const pointMode = () => p.mode === 'wire' || p.mode === 'loop' || p.mode === 'coil';

    /* -------------------------------------------------------------- */
    /* Aufteilung                                                      */
    /* -------------------------------------------------------------- */

    interface Lay {
      scene: Rect;
      chart: Rect;
      card: Rect;
    }
    function layout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const sw = Math.round(W * 0.58);
        const ch = Math.round((H - 3 * pad) * 0.47);
        return { scene: { x: pad, y: pad, w: sw - pad, h: H - 2 * pad }, chart: { x: sw + pad, y: pad, w: W - sw - 2 * pad, h: ch }, card: { x: sw + pad, y: 2 * pad + ch, w: W - sw - 2 * pad, h: H - ch - 3 * pad } };
      }
      const sh = Math.round(H * 0.44);
      const ch = Math.round(H * 0.22);
      return { scene: { x: pad, y: pad, w: W - 2 * pad, h: sh }, chart: { x: pad, y: sh + 2 * pad, w: W - 2 * pad, h: ch }, card: { x: pad, y: sh + ch + 3 * pad, w: W - 2 * pad, h: H - sh - ch - 4 * pad } };
    }
    let lay: Lay = layout();
    const inner = (r: Rect, m = 6): Rect => ({ x: r.x + m, y: r.y + m, w: r.w - 2 * m, h: r.h - 2 * m });

    const plotS = new Plot(surface, {
      x: [-10, 10],
      y: [-7, 7],
      equalAspect: true,
      zoom: false,
      pan: false,
      controls: false,
      region: () => (pointMode() ? inner(lay.scene, 6) : OFF),
      xAxis: { label: 'x in cm' },
      yAxis: { label: 'y in cm' },
    });
    const plotC = new Plot(surface, {
      x: [-12, 12],
      y: [-1, 1],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => {
        const r = inner(lay.chart, 8);
        return { x: r.x, y: r.y + 20, w: r.w, h: r.h - 20 };
      },
      xAxis: { label: ctx.t('xAx') },
      yAxis: { label: ctx.t('bAx') },
    });

    /* -------------------------------------------------------------- */
    /* Felder (Ort in cm, Ergebnis in T)                               */
    /* -------------------------------------------------------------- */

    const mur = () => (p.mode === 'coil' && p.core === 'iron' ? MU_IRON : 1);
    function wires(): Wire[] {
      if (p.w2 === 'none') return [{ x: 0, y: 0, I: p.I }];
      const d = p.dw / 200;
      return [
        { x: -d, y: 0, I: p.I },
        { x: d, y: 0, I: p.w2 === 'anti' ? -p.I : p.I },
      ];
    }
    function field(x: number, y: number): V2 {
      const xm = x / 100;
      const ym = y / 100;
      if (p.mode === 'wire') return wiresField(wires(), xm, ym);
      if (p.mode === 'loop') {
        const [br, bz] = loopField(p.rad / 100, p.I, ym, xm);
        return [bz, br];
      }
      const [bx, by] = coilField({ N: p.N, I: p.I, l: p.len / 100, R: p.rad / 100, loops: Math.min(p.N, 36) }, xm, ym);
      return [bx * mur(), by * mur()];
    }

    function fitRange(): void {
      if (p.mode === 'wire') {
        const m = p.w2 === 'none' ? 9 : Math.max(9, p.dw * 1.2);
        plotS.setRange([-m, m], [-m * 0.7, m * 0.7]);
      } else if (p.mode === 'loop') {
        const m = Math.max(9, p.rad * 2.8);
        plotS.setRange([-m, m], [-m * 0.72, m * 0.72]);
      } else if (p.mode === 'coil') {
        const hx = p.len / 2 + Math.max(5, p.rad * 2.2);
        const hy = Math.max(p.rad * 2.6, 6);
        plotS.setRange([-hx, hx], [-hy, hy]);
      }
    }

    /* Farbbild der Feldstärke (zwischengespeichert) */
    let heatCache: { key: string; canvas: HTMLCanvasElement } | null = null;
    function hexRGB(c: string): [number, number, number] {
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c.trim());
      if (!m) return [44, 95, 214];
      return [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)];
    }
    function drawHeat(g: CanvasRenderingContext2D): void {
      const r = plotS.rect;
      const b = plotS.bounds;
      const key = `${p.mode}|${p.I}|${p.N}|${p.len}|${p.rad}|${p.core}|${b.xMin.toFixed(2)}|${b.xMax.toFixed(2)}|${b.yMin.toFixed(2)}|${b.yMax.toFixed(2)}|${th().series[0]}`;
      if (!heatCache || heatCache.key !== key) {
        const nx = 90;
        const ny = Math.max(20, Math.round((nx * r.h) / r.w));
        const { canvas, g: hg } = offscreenCanvas(nx, ny, 1);
        const img = hg.createImageData(nx, ny);
        const vals: number[] = [];
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            const x = b.xMin + ((i + 0.5) / nx) * (b.xMax - b.xMin);
            const y = b.yMax - ((j + 0.5) / ny) * (b.yMax - b.yMin);
            const [bx, by] = field(x, y);
            vals.push(Math.log10(Math.hypot(bx, by) + 1e-12));
          }
        }
        const sorted = [...vals].sort((a, c) => a - c);
        const lo = sorted[Math.floor(sorted.length * 0.1)]!;
        const hi = sorted[Math.floor(sorted.length * 0.98)]!;
        const [cr, cg, cb] = hexRGB(th().series[0]!);
        vals.forEach((v, k) => {
          const u = clamp((v - lo) / Math.max(hi - lo, 1e-6), 0, 1);
          img.data[k * 4] = cr;
          img.data[k * 4 + 1] = cg;
          img.data[k * 4 + 2] = cb;
          img.data[k * 4 + 3] = Math.round(255 * (th().dark ? 0.55 : 0.42) * u * u);
        });
        hg.putImageData(img, 0, 0);
        heatCache = { key, canvas };
      }
      g.save();
      g.imageSmoothingEnabled = true;
      g.drawImage(heatCache.canvas, r.x, r.y, r.w, r.h);
      g.restore();
    }

    /* Feldlinien (zwischengespeichert, in cm) */
    let lineCache: { key: string; lines: V2[][] } | null = null;
    function fieldLines(): V2[][] {
      const b = plotS.bounds;
      const key = `${p.mode}|${p.I}|${p.w2}|${p.dw}|${p.N}|${p.len}|${p.rad}|${p.core}|${b.xMin.toFixed(1)}|${b.yMin.toFixed(1)}`;
      if (lineCache && lineCache.key === key) return lineCache.lines;
      const lines: V2[][] = [];
      const box = { x0: b.xMin - 1, x1: b.xMax + 1, y0: b.yMin - 1, y1: b.yMax + 1 };
      const span = b.xMax - b.xMin;
      const f = (x: number, y: number) => field(x, y);
      if (p.mode === 'wire' && p.w2 === 'none') {
        // Kreise, Abstände wachsen geometrisch (Liniendichte ∝ B ∝ 1/r)
        for (let k = 0; k < 9; k++) {
          const r = 0.9 * Math.pow(1.38, k);
          lines.push(Array.from({ length: 97 }, (_, i) => [r * Math.cos((i / 96) * TAU), r * Math.sin((i / 96) * TAU)] as V2));
        }
      } else if (p.mode === 'wire') {
        const ws = wires().map((w) => ({ x: w.x * 100, y: w.y * 100 }));
        const stops = ws.map((w) => ({ x: w.x, y: w.y, r: 0.35 }));
        const seeds: V2[] = [];
        for (const w of ws) for (const r of [0.8, 1.6, 2.6]) seeds.push([w.x + r * (w.x < 0 ? -1 : 1), w.y]);
        if (p.w2 === 'anti') for (const y of [0.5, 1.5, 3, 5]) seeds.push([0, y]);
        else for (const r of [p.dw * 0.75, p.dw * 1.0, p.dw * 1.4]) seeds.push([0, r]);
        for (const s of seeds) {
          const a = traceLine(f, s[0], s[1], { step: span / 400, maxSteps: 3000, box, stops, closeTol: span / 300 }, 1);
          let pts = a.pts;
          if (!a.closed) {
            const bk = traceLine(f, s[0], s[1], { step: span / 400, maxSteps: 3000, box, stops }, -1);
            pts = [...bk.pts.reverse(), ...a.pts.slice(1)];
          }
          lines.push(pts);
        }
      } else {
        const R = p.rad;
        const ys = [-0.75, -0.45, -0.18, 0.18, 0.45, 0.75].map((u) => u * R);
        const outer = [1.35, 1.9, 2.7].flatMap((u) => [u * R, -u * R]);
        const stops = p.mode === 'loop' ? [{ x: 0, y: R, r: 0.2 }, { x: 0, y: -R, r: 0.2 }] : [];
        for (const y0 of [...ys, ...outer]) {
          const a = traceLine(f, 0, y0, { step: span / 450, maxSteps: 4000, box, stops, closeTol: span / 250 }, 1);
          let pts = a.pts;
          if (!a.closed) {
            const bk = traceLine(f, 0, y0, { step: span / 450, maxSteps: 4000, box, stops }, -1);
            pts = [...bk.pts.reverse(), ...a.pts.slice(1)];
          }
          lines.push(pts);
        }
      }
      lineCache = { key, lines };
      return lines;
    }

    /** Fließende Pfeilspitzen entlang einer Linie (zeigen die Feldrichtung). */
    let flow = 0;
    function drawLine(g: CanvasRenderingContext2D, pts: V2[], col: string): void {
      if (pts.length < 2) return;
      const px = pts.map((q) => plotS.toPx(q[0], q[1]));
      g.save();
      g.strokeStyle = col;
      g.lineWidth = 1.8;
      g.lineJoin = 'round';
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      // Pfeile im Abstand von 70 px, wandern mit der Zeit
      const spacing = 70;
      let acc = (flow * 40) % spacing;
      g.fillStyle = col;
      for (let i = 1; i < px.length; i++) {
        const [x0, y0] = px[i - 1]!;
        const [x1, y1] = px[i]!;
        const segL = Math.hypot(x1 - x0, y1 - y0);
        if (segL === 0) continue;
        while (acc <= segL) {
          const t = acc / segL;
          const x = x0 + (x1 - x0) * t;
          const y = y0 + (y1 - y0) * t;
          const ux = (x1 - x0) / segL;
          const uy = (y1 - y0) / segL;
          const r = plotS.rect;
          if (x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h) {
            g.beginPath();
            g.moveTo(x + ux * 5, y + uy * 5);
            g.lineTo(x - ux * 4 - uy * 4, y - uy * 4 + ux * 4);
            g.lineTo(x - ux * 4 + uy * 4, y - uy * 4 - ux * 4);
            g.closePath();
            g.fill();
          }
          acc += spacing;
        }
        acc -= segL;
      }
      g.restore();
    }

    /** Leiterquerschnitt mit Stromrichtung ⊙ (heraus) oder ⊗ (hinein). */
    function conductor(g: CanvasRenderingContext2D, x: number, y: number, I: number, rPx = 11): void {
      const [cx, cy] = plotS.toPx(x, y);
      const out = I >= 0;
      g.save();
      const grad = g.createRadialGradient(cx - rPx * 0.3, cy - rPx * 0.3, 1, cx, cy, rPx);
      grad.addColorStop(0, '#f6c08a');
      grad.addColorStop(1, '#b4632a');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, rPx, 0, TAU);
      g.fill();
      g.strokeStyle = 'rgba(60,30,10,0.8)';
      g.lineWidth = 1.5;
      g.stroke();
      g.strokeStyle = '#2a1a0c';
      g.fillStyle = '#2a1a0c';
      if (Math.abs(I) > 1e-9) {
        if (out) {
          g.beginPath();
          g.arc(cx, cy, rPx * 0.28, 0, TAU);
          g.fill();
        } else {
          const k = rPx * 0.5;
          g.lineWidth = 2.2;
          g.beginPath();
          g.moveTo(cx - k, cy - k);
          g.lineTo(cx + k, cy + k);
          g.moveTo(cx + k, cy - k);
          g.lineTo(cx - k, cy + k);
          g.stroke();
        }
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Kompassnadeln                                                   */
    /* -------------------------------------------------------------- */

    const needleAng = new Map<number, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    function needlePositions(): V2[] {
      const b = plotS.bounds;
      const out: V2[] = [];
      const cols = narrow() ? 6 : 8;
      const stepX = (b.xMax - b.xMin) / cols;
      const rows = Math.max(3, Math.round((b.yMax - b.yMin) / stepX));
      const stepY = (b.yMax - b.yMin) / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = b.xMin + (i + 0.5) * stepX;
          const y = b.yMin + (j + 0.5) * stepY;
          if (p.mode === 'wire' && wires().some((w) => Math.hypot(x - w.x * 100, y - w.y * 100) < 1.3)) continue;
          if (p.mode === 'coil' && Math.abs(x) < p.len / 2 + 0.8 && Math.abs(y) < p.rad + 0.8) continue;
          out.push([x, y]);
        }
      }
      return out;
    }
    function drawNeedles(g: CanvasRenderingContext2D): void {
      const pos = needlePositions();
      const len = narrow() ? 9 : 11;
      pos.forEach((q, i) => {
        const [bx, by] = field(q[0], q[1]);
        const target = p.mode === 'wire' && p.earth ? compassAngle(bx, by) : compassAngle(bx, by, 0);
        let a = needleAng.get(i) ?? 0;
        let d = target - a;
        d = Math.atan2(Math.sin(d), Math.cos(d));
        a += d * Math.min(1, frameDt * 5);
        needleAng.set(i, a);
        if (Math.abs(d) > 0.002) animating = true;
        const [cx, cy] = plotS.toPx(q[0], q[1]);
        // a: Winkel gegen Norden (oben), im Uhrzeigersinn
        const ux = Math.sin(a);
        const uy = -Math.cos(a);
        g.save();
        g.fillStyle = th().dark ? 'rgba(30,38,52,0.85)' : 'rgba(255,255,255,0.85)';
        g.strokeStyle = withAlpha(th().text, 0.25);
        g.lineWidth = 1;
        g.beginPath();
        g.arc(cx, cy, len + 3, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = COL.red();
        g.beginPath();
        g.moveTo(cx + ux * len, cy + uy * len);
        g.lineTo(cx - uy * 3, cy + ux * 3);
        g.lineTo(cx + uy * 3, cy - ux * 3);
        g.closePath();
        g.fill();
        g.fillStyle = withAlpha(th().muted, 0.85);
        g.beginPath();
        g.moveTo(cx - ux * len, cy - uy * len);
        g.lineTo(cx - uy * 3, cy + ux * 3);
        g.lineTo(cx + uy * 3, cy - ux * 3);
        g.closePath();
        g.fill();
        g.fillStyle = th().text;
        g.beginPath();
        g.arc(cx, cy, 1.6, 0, TAU);
        g.fill();
        g.restore();
      });
    }

    /* -------------------------------------------------------------- */
    /* Hallsonde                                                       */
    /* -------------------------------------------------------------- */

    plotS.addHandle({
      get: () => [p.px, p.py],
      set: (x, y) => ctx.set({ px: Math.round(x * 10) / 10, py: Math.round(y * 10) / 10 }),
      enabled: () => pointMode() && p.probe && !ctx.locked,
      color: () => COL.purple(),
      axis: 'both',
    });
    function drawProbe(g: CanvasRenderingContext2D): void {
      const [bx, by] = field(p.px, p.py);
      const B = Math.hypot(bx, by);
      const [cx, cy] = plotS.toPx(p.px, p.py);
      g.save();
      // Stiel der Sonde
      g.strokeStyle = withAlpha(th().text, 0.45);
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx, cy + 8);
      g.lineTo(cx + 18, cy + 38);
      g.stroke();
      g.fillStyle = COL.purple();
      g.beginPath();
      g.arc(cx, cy, 6.5, 0, TAU);
      g.fill();
      // Feldrichtung
      if (B > 0) {
        const L0 = 30;
        const ux = bx / B;
        const uy = -by / B;
        g.strokeStyle = COL.purple();
        g.fillStyle = COL.purple();
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + ux * L0, cy + uy * L0);
        g.stroke();
        g.beginPath();
        g.moveTo(cx + ux * (L0 + 7), cy + uy * (L0 + 7));
        g.lineTo(cx + ux * L0 - uy * 5, cy + uy * L0 + ux * 5);
        g.lineTo(cx + ux * L0 + uy * 5, cy + uy * L0 - ux * 5);
        g.closePath();
        g.fill();
      }
      if (p.val) {
        const txt = `B = ${Bstr(B)}`;
        g.font = `700 13px ${th().font}`;
        const w = g.measureText(txt).width + 14;
        const r = plotS.rect;
        const lx = clamp(cx + 16, r.x + 4, r.x + r.w - w - 4);
        const ly = clamp(cy - 34, r.y + 4, r.y + r.h - 26);
        g.fillStyle = th().dark ? 'rgba(20,27,38,0.92)' : 'rgba(255,255,255,0.94)';
        roundRect(g, lx, ly, w, 22, 6);
        g.fill();
        g.strokeStyle = withAlpha(COL.purple(), 0.6);
        g.lineWidth = 1;
        g.stroke();
        g.fillStyle = COL.purple();
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(txt, lx + 7, ly + 11);
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Szenen: Leiter, Schleife, Spule                                 */
    /* -------------------------------------------------------------- */

    const intro = new Tween(900, ease.outCubic);
    intro.play();
    let animating = false;

    function drawFieldScene(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      plotS.resize();
      plotS.begin();
      plotS.grid({ minor: false });
      if (p.heat && (p.mode === 'loop' || p.mode === 'coil') && Math.abs(p.I) > 1e-9) drawHeat(g);
      plotS.axes();
      // Spulenkörper und Kern
      if (p.mode === 'coil') {
        const [x0, y0] = plotS.toPx(-p.len / 2, p.rad);
        const [x1, y1] = plotS.toPx(p.len / 2, -p.rad);
        g.save();
        g.fillStyle = withAlpha(COL.orange(), th().dark ? 0.1 : 0.07);
        g.fillRect(x0, y0, x1 - x0, y1 - y0);
        if (p.core === 'iron') {
          const [ix0, iy0] = plotS.toPx(-p.len / 2 - 0.6, p.rad * 0.72);
          const [ix1, iy1] = plotS.toPx(p.len / 2 + 0.6, -p.rad * 0.72);
          const grad = g.createLinearGradient(0, iy0, 0, iy1);
          grad.addColorStop(0, th().dark ? '#7a8290' : '#9aa1ad');
          grad.addColorStop(0.5, th().dark ? '#4c535f' : '#c3c8d0');
          grad.addColorStop(1, th().dark ? '#6a717d' : '#8d95a2');
          g.fillStyle = grad;
          g.globalAlpha = 0.75;
          roundRect(g, ix0, iy0, ix1 - ix0, iy1 - iy0, 4);
          g.fill();
          g.globalAlpha = 1;
        }
        g.restore();
      }
      // Feldlinien
      if (p.lines && Math.abs(p.I) > 1e-9) {
        const col = withAlpha(COL.blue(), (th().dark ? 0.85 : 0.75) * (intro.running ? intro.value : 1));
        for (const ln of fieldLines()) drawLine(g, ln.map((q) => [q[0], q[1]] as V2), col);
      }
      if (p.needles && (p.mode === 'wire' || p.mode === 'coil')) drawNeedles(g);
      // Leiter
      if (p.mode === 'wire') {
        for (const w of wires()) conductor(g, w.x * 100, w.y * 100, w.I, narrow() ? 10 : 13);
        if (p.w2 !== 'none' && Math.abs(p.I) > 0) {
          // Kraftpfeile: gleichgerichtet → Anziehung
          const attract = p.w2 === 'same';
          for (const w of wires()) {
            const [cx, cy] = plotS.toPx(w.x * 100, 0);
            const dir = (w.x < 0 ? 1 : -1) * (attract ? 1 : -1);
            const L0 = 22 + Math.min(30, Math.abs(p.I) * 1.5);
            g.save();
            g.strokeStyle = COL.green();
            g.fillStyle = COL.green();
            g.lineWidth = 3;
            const sx = cx + dir * 16;
            const ex = cx + dir * (16 + L0);
            g.beginPath();
            g.moveTo(sx, cy);
            g.lineTo(ex, cy);
            g.stroke();
            g.beginPath();
            g.moveTo(ex + dir * 8, cy);
            g.lineTo(ex, cy - 6);
            g.lineTo(ex, cy + 6);
            g.closePath();
            g.fill();
            g.restore();
          }
        }
      } else if (p.mode === 'loop') {
        conductor(g, 0, p.rad, p.I, narrow() ? 9 : 11);
        conductor(g, 0, -p.rad, -p.I, narrow() ? 9 : 11);
        // Ring angedeutet (perspektivisch)
        const [cx, cy] = plotS.toPx(0, 0);
        const [, ty] = plotS.toPx(0, p.rad);
        g.save();
        g.strokeStyle = withAlpha('#b4632a', 0.45);
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(cx, cy, Math.abs(cy - ty) * 0.28, Math.abs(cy - ty), 0, -Math.PI / 2, Math.PI / 2);
        g.stroke();
        g.setLineDash([4, 4]);
        g.beginPath();
        g.ellipse(cx, cy, Math.abs(cy - ty) * 0.28, Math.abs(cy - ty), 0, Math.PI / 2, (3 * Math.PI) / 2);
        g.stroke();
        g.restore();
      } else {
        const n = clamp(Math.round(p.N / 25), 4, 24);
        const sp = p.len / n;
        const [, ay] = plotS.toPx(0, 0);
        const [, by] = plotS.toPx(0, sp);
        const rPx = clamp(Math.abs(ay - by) * 0.42, 3, 10);
        for (let i = 0; i < n; i++) {
          const x = -p.len / 2 + sp * (i + 0.5);
          conductor(g, x, p.rad, p.I, rPx);
          conductor(g, x, -p.rad, -p.I, rPx);
        }
        // Pole
        if (Math.abs(p.I) > 1e-9) {
          const northRight = p.I > 0;
          const [rx, ry] = plotS.toPx(p.len / 2 + 1.4, 0);
          const [lx] = plotS.toPx(-p.len / 2 - 1.4, 0);
          g.save();
          g.font = `800 ${narrow() ? 16 : 20}px ${th().font}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillStyle = COL.red();
          g.fillText('N', northRight ? rx : lx, ry - (narrow() ? 18 : 24));
          g.fillStyle = COL.green();
          g.fillText('S', northRight ? lx : rx, ry - (narrow() ? 18 : 24));
          g.restore();
        }
      }
      if (p.probe) drawProbe(g);
      plotS.end();
    }

    /* Diagramme zu den Feldern */
    function drawFieldChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      let title = '';
      if (p.mode === 'wire') {
        const m = plotS.bounds.xMax;
        const ys: number[] = [];
        const f = (x: number) => field(x, p.py)[1] * 1000;
        for (let i = 0; i <= 80; i++) ys.push(f(-m + (2 * m * i) / 80));
        const cap = Math.max(0.05, Math.min(Math.max(...ys.map(Math.abs)), wireB(Math.abs(p.I) || 1, 0.008) * 1000) * 1.1);
        plotC.setRange([-m, m], [-cap, cap]);
        plotC.setAxes({ x: { label: ctx.t('xAx') } });
        plotC.resize();
        plotC.begin();
        plotC.grid();
        plotC.axes();
        plotC.fn((x) => clamp(f(x), -cap * 1.5, cap * 1.5), { color: COL.blue(), width: 2.4 });
        if (p.probe) plotC.point(p.px, clamp(f(p.px), -cap, cap), { color: COL.purple(), radius: 5.5 });
        plotC.end();
        title = ctx.lang === 'de' ? `B_y entlang y = ${N(p.py, 1)} cm` : `B_y along y = ${N(p.py, 1)} cm`;
      } else if (p.mode === 'loop') {
        const m = plotS.bounds.xMax;
        const f = (x: number) => loopAxisB(p.rad / 100, p.I, x / 100) * 1000;
        const top = Math.max(1e-4, Math.abs(f(0))) * 1.15;
        plotC.setRange([-m, m], p.I >= 0 ? [-top * 0.15, top] : [-top, top * 0.15]);
        plotC.setAxes({ x: { label: ctx.t('xAx') } });
        plotC.resize();
        plotC.begin();
        plotC.grid();
        plotC.axes();
        plotC.fn(f, { color: COL.blue(), width: 2.4 });
        if (p.probe) plotC.point(p.px, field(p.px, p.py)[0] * 1000, { color: COL.purple(), radius: 5.5 });
        plotC.end();
        title = ctx.t('axis');
      } else {
        const m = plotS.bounds.xMax;
        const f = (x: number) => solenoidAxisB(p.N, p.I, p.len / 100, p.rad / 100, x / 100) * 1000 * mur();
        const ideal = solenoidB(p.N, p.I, p.len / 100, mur()) * 1000;
        const top = Math.max(1e-4, Math.abs(ideal)) * 1.2;
        plotC.setRange([-m, m], p.I >= 0 ? [-top * 0.15, top] : [-top, top * 0.15]);
        plotC.setAxes({ x: { label: ctx.t('xAx') }, y: { label: Math.abs(ideal) >= 1000 ? 'B in T' : ctx.t('bAx'), format: Math.abs(ideal) >= 1000 ? (v) => fmt.num(v / 1000, 1) : undefined } });
        plotC.resize();
        plotC.begin();
        plotC.grid();
        const [sx0, sy0] = plotC.toPx(-p.len / 2, top);
        const [sx1, sy1] = plotC.toPx(p.len / 2, -top);
        g.fillStyle = withAlpha(COL.orange(), 0.08);
        g.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
        plotC.axes();
        plotC.hline(ideal, { color: withAlpha(COL.orange(), 0.85), width: 1.6, dash: [6, 4] });
        plotC.fn(f, { color: COL.blue(), width: 2.4 });
        if (p.val) plotC.text(m * 0.95, ideal, ctx.t('ideal'), { color: COL.orange(), size: 11, weight: 'bold', align: 'right', offset: [0, ideal >= 0 ? -10 : 14], halo: true });
        if (p.probe) plotC.point(p.px, field(p.px, p.py)[0] * 1000, { color: COL.purple(), radius: 5.5 });
        plotC.end();
        title = ctx.t('axis');
      }
      g.save();
      g.font = `700 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(title, R.x + 14, R.y + 20);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Gezeichnete Geräte: gemeinsame Hilfen                           */
    /* -------------------------------------------------------------- */

    /** Virtuelle Zeichenfläche 600 × 380, eingepasst in R. */
    function stage(R: Rect, vw = 600, vh = 380) {
      const s = Math.min(R.w / vw, R.h / vh);
      const ox = R.x + (R.w - vw * s) / 2;
      const oy = R.y + (R.h - vh * s) / 2;
      return { s, T: (x: number, y: number): V2 => [ox + x * s, oy + y * s] };
    }
    type Stage = ReturnType<typeof stage>;
    /** Leitung mit wandernden Ladungsträgern (Punkte), wenn Strom fließt. */
    function wirePath(g: CanvasRenderingContext2D, S: Stage, pts: V2[], on: boolean, speed = 1): void {
      const px = pts.map((q) => S.T(q[0], q[1]));
      g.save();
      g.strokeStyle = th().dark ? '#c9d1de' : '#3d4654';
      g.lineWidth = Math.max(2, 2.6 * S.s);
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      if (on) {
        const spacing = 26 * S.s;
        let acc = (((flow * 60 * speed * S.s) % spacing) + spacing) % spacing;
        g.fillStyle = COL.orange();
        for (let i = 1; i < px.length; i++) {
          const [x0, y0] = px[i - 1]!;
          const [x1, y1] = px[i]!;
          const segL = Math.hypot(x1 - x0, y1 - y0);
          while (acc <= segL) {
            const t = acc / segL;
            g.beginPath();
            g.arc(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, Math.max(2, 2.6 * S.s), 0, TAU);
            g.fill();
            acc += spacing;
          }
          acc -= segL;
        }
      }
      g.restore();
    }
    function stageText(g: CanvasRenderingContext2D, S: Stage, s: string, x: number, y: number, col: string, size = 13, align: CanvasTextAlign = 'center', weight = 700): void {
      const [px, py] = S.T(x, y);
      g.save();
      g.font = `${weight} ${Math.max(11, size * Math.min(1.15, S.s * 1.25))}px ${th().font}`;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.fillStyle = col;
      g.fillText(s, px, py);
      g.restore();
    }
    /** Batterie (Plus oben bzw. links). */
    function battery(g: CanvasRenderingContext2D, S: Stage, x: number, y: number, vertical = true): void {
      g.save();
      g.strokeStyle = th().text;
      g.lineCap = 'butt';
      const [a1, b1] = S.T(x + (vertical ? -16 : -5), y + (vertical ? -5 : -16));
      const [a2, b2] = S.T(x + (vertical ? 16 : -5), y + (vertical ? -5 : 16));
      const [c1, d1] = S.T(x + (vertical ? -9 : 5), y + (vertical ? 5 : -9));
      const [c2, d2] = S.T(x + (vertical ? 9 : 5), y + (vertical ? 5 : 9));
      g.lineWidth = 2.5 * S.s;
      g.beginPath();
      g.moveTo(a1, b1);
      g.lineTo(a2, b2);
      g.stroke();
      g.lineWidth = 6 * S.s;
      g.beginPath();
      g.moveTo(c1, d1);
      g.lineTo(c2, d2);
      g.stroke();
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Relais                                                          */
    /* -------------------------------------------------------------- */

    let pressed = true;
    let relayOn = false;
    let armAng = 0;
    const ARM_OPEN = 0;
    const ARM_CLOSED = 0.3;
    const relayI = () => (pressed ? p.ir / 1000 : 0);
    function updateRelay(): void {
      relayOn = relayState(RELAY, relayI(), relayOn);
    }

    function drawRelay(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const S = stage(inner(R, 10));
      const t = th();
      const coilOn = relayI() > 0;
      const contact = armAng > ARM_CLOSED * 0.92;
      const pivot: V2 = [162, 140];
      const armLen = 230;
      const armEnd: V2 = [pivot[0] + armLen * Math.cos(armAng), pivot[1] + armLen * Math.sin(armAng)];
      // Arbeitsstromkreis
      wirePath(g, S, [pivot, [162, 60], [500, 60], [500, 100]], contact, 1);
      wirePath(g, S, [[500, 160], [500, 270]], contact, 1);
      wirePath(g, S, [[500, 300], [500, 340], [400, 340], [400, 226]], contact, 1);
      battery(g, S, 500, 285);
      // Lampe
      const [lx, ly] = S.T(500, 130);
      g.save();
      if (contact) {
        const glow = g.createRadialGradient(lx, ly, 2, lx, ly, 70 * S.s);
        glow.addColorStop(0, 'rgba(255,230,120,0.95)');
        glow.addColorStop(0.35, 'rgba(255,210,80,0.45)');
        glow.addColorStop(1, 'rgba(255,200,60,0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(lx, ly, 70 * S.s, 0, TAU);
        g.fill();
      }
      g.fillStyle = contact ? '#ffe680' : t.dark ? '#2a313d' : '#f4f5f7';
      g.strokeStyle = t.text;
      g.lineWidth = 2 * S.s;
      g.beginPath();
      g.arc(lx, ly, 24 * S.s, 0, TAU);
      g.fill();
      g.stroke();
      g.beginPath();
      g.moveTo(lx - 17 * S.s, ly - 17 * S.s);
      g.lineTo(lx + 17 * S.s, ly + 17 * S.s);
      g.moveTo(lx + 17 * S.s, ly - 17 * S.s);
      g.lineTo(lx - 17 * S.s, ly + 17 * S.s);
      g.stroke();
      g.restore();
      // Steuerstromkreis: Taster, Batterie, Spule
      wirePath(g, S, [[190, 268], [190, 340], [60, 340], [60, 300]], coilOn, 0.6);
      wirePath(g, S, [[60, 270], [60, 230]], coilOn, 0.6);
      wirePath(g, S, [[60, 180], [60, 120], [110, 120], [110, 300], [300, 300], [300, 268]], coilOn, 0.6);
      battery(g, S, 60, 285);
      // Taster
      const [t0x, t0y] = S.T(60, 230);
      const [t1x, t1y] = S.T(pressed ? 60 : 82, pressed ? 180 : 188);
      g.save();
      g.strokeStyle = COL.purple();
      g.lineWidth = 3.5 * S.s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(t0x, t0y);
      g.lineTo(t1x, t1y);
      g.stroke();
      g.fillStyle = COL.purple();
      for (const q of [S.T(60, 230), S.T(60, 180)]) {
        g.beginPath();
        g.arc(q[0], q[1], 4 * S.s, 0, TAU);
        g.fill();
      }
      g.restore();
      // Joch, Kern und Spule
      const iron = t.dark ? '#69717e' : '#a3aab5';
      const [jx, jy] = S.T(150, 140);
      g.fillStyle = iron;
      g.fillRect(jx, jy, 25 * S.s, 100 * S.s);
      const [kx, ky] = S.T(150, 200);
      g.fillRect(kx, ky, 170 * S.s, 40 * S.s);
      // Wicklung
      g.save();
      const copper = '#c0702f';
      for (let i = 0; i < 12; i++) {
        const x = 192 + i * 9.5;
        const [ax, ay] = S.T(x, 186);
        const [, by] = S.T(x, 254);
        g.strokeStyle = copper;
        g.lineWidth = 5 * S.s;
        g.beginPath();
        g.moveTo(ax, ay);
        g.lineTo(ax + 4 * S.s, by);
        g.stroke();
      }
      g.restore();
      // Feldlinien im Eisen, wenn Strom fließt
      if (coilOn) {
        const strength = clamp((RELAY.N * relayI()) / 80, 0.2, 1);
        g.save();
        g.strokeStyle = withAlpha(COL.blue(), 0.85 * strength);
        g.lineWidth = 2 * S.s;
        g.setLineDash([7 * S.s, 6 * S.s]);
        g.lineDashOffset = -flow * 30 * S.s;
        for (const k of [0, 1]) {
          const path: V2[] = [
            [175 + k * 8, 220],
            [310 - k * 8, 220],
            [310 - k * 8, 190 + armAng * 60],
            [175 + k * 8, 150 + k * 6],
            [175 + k * 8, 220],
          ];
          g.beginPath();
          path.forEach((q, i) => {
            const [x, y] = S.T(q[0], q[1]);
            if (i) g.lineTo(x, y);
            else g.moveTo(x, y);
          });
          g.stroke();
        }
        g.restore();
      }
      // Anker (drehbar um pivot)
      g.save();
      const [px0, py0] = S.T(pivot[0], pivot[1]);
      const [px1, py1] = S.T(armEnd[0], armEnd[1]);
      g.strokeStyle = iron;
      g.lineWidth = 14 * S.s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(px0, py0);
      g.lineTo(px1, py1);
      g.stroke();
      g.fillStyle = t.text;
      g.beginPath();
      g.arc(px0, py0, 4 * S.s, 0, TAU);
      g.fill();
      // Kontakte
      g.fillStyle = '#d9a640';
      g.beginPath();
      g.arc(px1, py1 + 6 * S.s, 5 * S.s, 0, TAU);
      g.fill();
      const [cx2, cy2] = S.T(400, 226);
      g.beginPath();
      g.arc(cx2, cy2, 5 * S.s, 0, TAU);
      g.fill();
      // Rückholfeder
      const [sx, sy] = S.T(250, 140 + Math.sin(armAng) * 88);
      const [, sy2] = S.T(250, 90);
      g.strokeStyle = t.muted;
      g.lineWidth = 1.5 * S.s;
      g.beginPath();
      for (let i = 0; i <= 12; i++) {
        const yy = sy2 + ((sy - sy2) * i) / 12;
        const xx = sx + (i % 2 ? 6 : -6) * S.s * (i > 0 && i < 12 ? 1 : 0);
        if (i) g.lineTo(xx, yy);
        else g.moveTo(xx, yy);
      }
      g.stroke();
      g.restore();
      stageText(g, S, `${ctx.t('control')} · ${ctx.t(pressed ? 'pressed' : 'released')}`, 130, 365, pressed ? COL.purple() : t.muted, 12, 'center', 600);
      stageText(g, S, ctx.t('work'), 450, 30, t.muted, 12, 'center', 600);
      if (p.val) stageText(g, S, `N·I = ${N(RELAY.N * relayI(), 0)} A`, 245, 282, COL.orange(), 13, 'center', 800);
    }

    function drawRelayChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      plotC.setRange([-8, 125], [-0.35, 1.45]);
      plotC.setAxes({ x: { label: ctx.t('thetaAx') }, y: { label: '', numbers: false } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      const c = COL.blue();
      plotC.segment([0, 0], [RELAY.pullIn, 0], { color: c, width: 2.4 });
      plotC.arrow([RELAY.pullIn, 0], [RELAY.pullIn, 1], { color: c, width: 2.4 });
      plotC.segment([RELAY.dropOut, 1], [120, 1], { color: c, width: 2.4 });
      plotC.arrow([RELAY.dropOut, 1], [RELAY.dropOut, 0], { color: withAlpha(c, 0.7), width: 2, dash: [5, 4] });
      plotC.text(RELAY.pullIn, 0.5, `${RELAY.pullIn} A`, { color: c, size: 11, weight: 'bold', align: 'left', offset: [6, 0], halo: true });
      plotC.text(RELAY.dropOut, 0.5, `${RELAY.dropOut} A`, { color: c, size: 11, weight: 'bold', align: 'right', offset: [-6, 0], halo: true });
      plotC.text(118, 1, ctx.lang === 'de' ? 'angezogen' : 'pulled in', { color: th().muted, size: 11, weight: '600', align: 'right', offset: [0, -12], halo: true });
      plotC.text(118, 0, ctx.lang === 'de' ? 'abgefallen' : 'released', { color: th().muted, size: 11, weight: '600', align: 'right', offset: [0, -12], halo: true });
      plotC.point(RELAY.N * relayI(), relayOn ? 1 : 0, { color: COL.orange(), radius: 7 });
      plotC.end();
      g.save();
      g.font = `700 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(ctx.lang === 'de' ? 'Zustand des Ankers über N·I' : 'State of the armature against N·I', R.x + 14, R.y + 20);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Elektromotor                                                    */
    /* -------------------------------------------------------------- */

    /** Anzeigemodell: größere Reibung und Trägheit, damit man zusehen kann. */
    const DM = { ...MOTOR, J: 2e-4, k: 6e-4 };
    const SLOW = 0.25;
    let phi = 0.35;
    let omega = 0;
    const motorI = () => p.im;
    function drawMotor(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const S = stage(inner(R, 10));
      const t = th();
      const c: V2 = [300, 190];
      const [cx, cy] = S.T(c[0], c[1]);
      // Feldlinien zwischen den Polen
      g.save();
      g.strokeStyle = withAlpha(COL.blue(), 0.55);
      g.lineWidth = 1.6 * S.s;
      g.setLineDash([8 * S.s, 7 * S.s]);
      g.lineDashOffset = -flow * 30 * S.s;
      for (let k = -3; k <= 3; k++) {
        const y = 190 + k * 34;
        const [x0, y0] = S.T(170, y);
        const [x1] = S.T(430, y);
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y0);
        g.stroke();
      }
      g.restore();
      // Pole
      const pole = (x0: number, isN: boolean) => {
        const col = isN ? COL.red() : COL.green();
        g.save();
        g.fillStyle = withAlpha(col, t.dark ? 0.75 : 0.85);
        g.beginPath();
        const [a, b] = S.T(x0, 60);
        const [a2, b2] = S.T(x0 + (isN ? 130 : -130), 320);
        const xIn = isN ? x0 + 130 : x0 - 130;
        g.moveTo(a, b);
        g.lineTo(S.T(xIn, 60)[0], b);
        // gewölbte Polfläche
        const [ax, ay] = S.T(xIn, 60);
        const [bx2, by2] = S.T(xIn, 320);
        g.lineTo(ax, ay);
        g.quadraticCurveTo(S.T(xIn + (isN ? -45 : 45), 190)[0], cy, bx2, by2);
        g.lineTo(a, b2);
        g.closePath();
        g.fill();
        g.restore();
        stageText(g, S, isN ? 'N' : 'S', isN ? x0 + 50 : x0 - 50, 190, '#ffffff', 30, 'center', 800);
        void a2;
      };
      pole(40, true);
      pole(560, false);
      // Drehkreis
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.2);
      g.setLineDash([4, 5]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, 92 * S.s, 0, TAU);
      g.stroke();
      g.restore();
      // Spule (von der Seite gesehen als Strecke)
      const th0 = phi + Math.PI / 2;
      const r = 92;
      const A: V2 = [c[0] + r * Math.cos(th0), c[1] - r * Math.sin(th0)];
      const Bp: V2 = [c[0] - r * Math.cos(th0), c[1] + r * Math.sin(th0)];
      const [ax, ay] = S.T(A[0], A[1]);
      const [bx, by] = S.T(Bp[0], Bp[1]);
      g.save();
      g.strokeStyle = '#c0702f';
      g.lineWidth = 7 * S.s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.stroke();
      g.restore();
      const s = p.comm ? commutatorSign(phi) : 1;
      const IA = motorI() * s;
      // Stromwender (geteilter Ring) und Bürsten
      g.save();
      const rc = 20 * S.s;
      g.lineWidth = 6 * S.s;
      for (const k of [0, 1]) {
        g.strokeStyle = k ? '#d9a640' : '#b8862c';
        g.beginPath();
        g.arc(cx, cy, rc, -th0 + k * Math.PI + 0.25, -th0 + k * Math.PI + Math.PI - 0.25);
        g.stroke();
      }
      if (p.comm) {
        g.fillStyle = t.dark ? '#3b4352' : '#59616f';
        g.fillRect(cx - rc - 14 * S.s, cy - 5 * S.s, 10 * S.s, 10 * S.s);
        g.fillRect(cx + rc + 4 * S.s, cy - 5 * S.s, 10 * S.s, 10 * S.s);
      }
      g.fillStyle = t.text;
      g.beginPath();
      g.arc(cx, cy, 4 * S.s, 0, TAU);
      g.fill();
      g.restore();
      // Leiterquerschnitte mit Stromrichtung
      const cond = (x: number, y: number, I: number) => {
        g.save();
        g.fillStyle = '#e8a46a';
        g.strokeStyle = '#5a2e10';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(x, y, 13 * S.s, 0, TAU);
        g.fill();
        g.stroke();
        g.fillStyle = '#2a1a0c';
        g.strokeStyle = '#2a1a0c';
        if (Math.abs(I) > 1e-9) {
          if (I > 0) {
            g.beginPath();
            g.arc(x, y, 3.5 * S.s, 0, TAU);
            g.fill();
          } else {
            const k = 6 * S.s;
            g.lineWidth = 2.4;
            g.beginPath();
            g.moveTo(x - k, y - k);
            g.lineTo(x + k, y + k);
            g.moveTo(x + k, y - k);
            g.lineTo(x - k, y + k);
            g.stroke();
          }
        }
        g.restore();
      };
      cond(ax, ay, IA);
      cond(bx, by, -IA);
      // Kräfte: Strom heraus, Feld nach rechts → Kraft nach oben
      const fL = (20 + 14 * Math.abs(motorI())) * S.s;
      for (const [x, y, I] of [
        [ax, ay, IA],
        [bx, by, -IA],
      ] as const) {
        if (Math.abs(I) < 1e-9) continue;
        const dir = I > 0 ? -1 : 1;
        g.save();
        g.strokeStyle = COL.green();
        g.fillStyle = COL.green();
        g.lineWidth = 3.2 * S.s;
        g.beginPath();
        g.moveTo(x, y + dir * 16 * S.s);
        g.lineTo(x, y + dir * (16 * S.s + fL));
        g.stroke();
        g.beginPath();
        g.moveTo(x, y + dir * (16 * S.s + fL + 9 * S.s));
        g.lineTo(x - 6 * S.s, y + dir * (16 * S.s + fL));
        g.lineTo(x + 6 * S.s, y + dir * (16 * S.s + fL));
        g.closePath();
        g.fill();
        g.restore();
      }
      if (Math.abs(Math.sin(phi)) < 0.12) stageText(g, S, ctx.t('dead'), 300, 350, COL.orange(), 13, 'center', 800);
      if (p.val) stageText(g, S, `${ctx.t('rpm')}: ${N(Math.abs(omega) * 60 / TAU, 0)} min⁻¹`, 300, 30, t.text, 13, 'center', 700);
    }

    function drawMotorChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const Mmax = motorMaxTorque(DM, Math.abs(motorI()) || 1) * 1000;
      plotC.setRange([-25, 370], [-Mmax * 1.25, Mmax * 1.3]);
      plotC.setAxes({ x: { label: ctx.t('phiAx') }, y: { label: ctx.t('mAx') } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      plotC.fn((x) => motorTorque(DM, motorI(), (x * Math.PI) / 180, p.comm) * 1000, { color: COL.green(), width: 2.4, from: 0, to: 360 });
      const deg = ((((phi * 180) / Math.PI) % 360) + 360) % 360;
      plotC.point(deg, motorTorque(DM, motorI(), phi, p.comm) * 1000, { color: COL.orange(), radius: 6 });
      plotC.end();
      g.save();
      g.font = `700 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(ctx.lang === 'de' ? 'Drehmoment über dem Drehwinkel' : 'Torque against the angle of rotation', R.x + 14, R.y + 20);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Messreihe: B in der Mitte einer Spule                           */
    /* -------------------------------------------------------------- */

    const R_MEAS = 0.02;
    let meas: { x: number; B: number }[] = [];
    let measNo = 0;
    const measPop = new Tween(450, ease.outBack);
    /** Wert der veränderten Größe (I in A, N, l in cm). */
    const varValue = () => (p.vary === 'I' ? Math.abs(p.I) : p.vary === 'N' ? p.N : p.len);
    /** Messwert der Hallsonde in der Spulenmitte mit kleinem Messfehler (±1,5 %), in mT. */
    function reading(): number {
      measNo += 1;
      const noise = Math.sin(measNo * 12.9898 + varValue() * 78.233) * 43758.5453;
      const u = (noise - Math.floor(noise)) * 2 - 1;
      return solenoidAxisB(p.N, Math.abs(p.I), p.len / 100, R_MEAS, 0) * 1000 * (1 + 0.015 * u);
    }
    /** Theorie (lange Spule) als Funktion der veränderten Größe, in mT. */
    function theory(x: number): number {
      if (p.vary === 'I') return solenoidB(p.N, x, p.len / 100) * 1000;
      if (p.vary === 'N') return solenoidB(x, Math.abs(p.I), p.len / 100) * 1000;
      return x > 0 ? solenoidB(p.N, Math.abs(p.I), x / 100) * 1000 : NaN;
    }
    /** Ausgleich: B = k·x (I, N) bzw. B = k/x (l). */
    function measFit(): number | null {
      if (meas.length < 2) return null;
      if (p.vary === 'l') {
        let a = 0;
        let b = 0;
        for (const m of meas) {
          a += m.B / m.x;
          b += 1 / (m.x * m.x);
        }
        return a / b;
      }
      let a = 0;
      let b = 0;
      for (const m of meas) {
        a += m.x * m.B;
        b += m.x * m.x;
      }
      return b > 0 ? a / b : null;
    }

    function display(g: CanvasRenderingContext2D, S: Stage, x: number, y: number, w: number, label: string, value: string, col: string): void {
      const [bx, by] = S.T(x, y);
      const W = w * S.s;
      const H = 70 * S.s;
      g.save();
      g.fillStyle = th().dark ? '#2b3240' : '#e7eaef';
      g.strokeStyle = withAlpha(th().text, 0.35);
      g.lineWidth = 1.5;
      roundRect(g, bx, by, W, H, 8 * S.s);
      g.fill();
      g.stroke();
      g.fillStyle = '#0e1a12';
      roundRect(g, bx + 8 * S.s, by + 22 * S.s, W - 16 * S.s, 38 * S.s, 5 * S.s);
      g.fill();
      g.font = `700 ${Math.max(13, 20 * S.s)}px ${th().font}`;
      g.fillStyle = col;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(value, bx + W / 2, by + 41 * S.s);
      g.font = `600 ${Math.max(11, 12 * S.s)}px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(label, bx + W / 2, by + 11 * S.s);
      g.restore();
    }

    function drawMeasure(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const S = stage(inner(R, 10));
      const t = th();
      // Spule: Länge und Windungsdichte sichtbar
      const lenPx = 80 + (p.len / 40) * 300;
      const x0 = 300 - lenPx / 2;
      const x1 = 300 + lenPx / 2;
      const yTop = 150;
      const yBot = 230;
      const [ax0, ay0] = S.T(x0, yTop);
      const [ax1, ay1] = S.T(x1, yBot);
      g.save();
      const body = g.createLinearGradient(0, ay0, 0, ay1);
      body.addColorStop(0, t.dark ? '#3a3226' : '#efe3d0');
      body.addColorStop(0.5, t.dark ? '#2a241b' : '#f8f1e6');
      body.addColorStop(1, t.dark ? '#3a3226' : '#e6d6bd');
      g.fillStyle = body;
      roundRect(g, ax0, ay0, ax1 - ax0, ay1 - ay0, 6 * S.s);
      g.fill();
      const turns = clamp(Math.round(p.N / 12), 4, 80);
      g.strokeStyle = '#c0702f';
      g.lineWidth = Math.max(1, Math.min(4, (lenPx / turns) * 0.55) * S.s);
      for (let i = 0; i < turns; i++) {
        const x = x0 + ((i + 0.5) / turns) * lenPx;
        const [wx, wy] = S.T(x, yTop - 4);
        const [wx2, wy2] = S.T(x + lenPx / turns / 2, yBot + 4);
        g.beginPath();
        g.moveTo(wx, wy);
        g.lineTo(wx2, wy2);
        g.stroke();
      }
      g.restore();
      // Netzgerät und Zuleitungen
      display(g, S, 20, 280, 130, ctx.t('supply'), `${N(Math.abs(p.I), 1)} A`, '#7dffa0');
      wirePath(g, S, [[60, 280], [60, 240], [x0, 240], [x0, yBot]], Math.abs(p.I) > 0, 0.8);
      wirePath(g, S, [[110, 280], [110, 262], [x1, 262], [x1, yBot]], Math.abs(p.I) > 0, -0.8);
      // Hallsonde von rechts bis zur Mitte
      const [hx0, hy] = S.T(560, 190);
      const [hx1] = S.T(300, 190);
      g.save();
      g.strokeStyle = t.dark ? '#9aa3b2' : '#5c6573';
      g.lineWidth = 6 * S.s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(hx0, hy);
      g.lineTo(hx1, hy);
      g.stroke();
      g.fillStyle = COL.purple();
      g.beginPath();
      g.arc(hx1, hy, 7 * S.s, 0, TAU);
      g.fill();
      g.restore();
      wirePath(g, S, [[560, 190], [560, 120], [520, 120]], false);
      const live = solenoidAxisB(p.N, Math.abs(p.I), p.len / 100, R_MEAS, 0) * 1000;
      display(g, S, 420, 50, 150, ctx.t('meter'), `${N(live, 2)} mT`, '#7dd8ff');
      stageText(g, S, `N = ${N(p.N, 0)}`, 300, yTop - 22, t.text, 14, 'center', 700);
      // Maßpfeil für l
      const [lx0, ly] = S.T(x0, yBot + 50);
      const [lx1] = S.T(x1, yBot + 50);
      g.save();
      g.strokeStyle = t.muted;
      g.fillStyle = t.muted;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(lx0, ly);
      g.lineTo(lx1, ly);
      g.stroke();
      for (const [x, d] of [
        [lx0, 1],
        [lx1, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(x, ly);
        g.lineTo(x + d * 8, ly - 4);
        g.lineTo(x + d * 8, ly + 4);
        g.closePath();
        g.fill();
      }
      g.restore();
      stageText(g, S, `l = ${N(p.len, 0)} cm`, 300, yBot + 66, t.text, 13, 'center', 700);
    }

    function drawMeasureChart(g: CanvasRenderingContext2D, R: Rect): void {
      if (p.vary === 'l' && p.lin) return drawLinChart(g, R);
      drawCard(g, R, th());
      const xMax = p.vary === 'I' ? Math.max(5, Math.abs(p.I), ...meas.map((m) => m.x)) * 1.1 : p.vary === 'N' ? 1050 : 42;
      const yMax = Math.max(1, ...meas.map((m) => m.B), p.vary === 'l' ? theory(Math.max(4, Math.min(...meas.map((m) => m.x), p.len))) : theory(xMax)) * 1.15;
      plotC.setRange([-xMax * 0.08, xMax], [-yMax * 0.12, yMax]);
      plotC.setAxes({ x: { label: p.vary === 'I' ? 'I in A' : p.vary === 'N' ? 'N' : 'l in cm' }, y: { label: ctx.t('bAx') } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      plotC.fn((x) => theory(x), { color: withAlpha(COL.orange(), 0.8), width: 1.6, dash: [6, 4], from: p.vary === 'l' ? 2 : 0 });
      const k = measFit();
      if (k !== null) plotC.fn((x) => (p.vary === 'l' ? k / x : k * x), { color: COL.blue(), width: 2.2, from: p.vary === 'l' ? 2 : 0 });
      meas.forEach((m, i) => {
        const s = i === meas.length - 1 && measPop.running ? measPop.value : 1;
        plotC.point(m.x, m.B, { color: COL.purple(), radius: 5 * s });
      });
      plotC.end();
      g.save();
      g.font = `700 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(`${ctx.t('points')}: ${meas.length}  ·  ${ctx.t('theory')} (${ctx.lang === 'de' ? 'gestrichelt' : 'dashed'})`, R.x + 14, R.y + 20);
      g.restore();
    }

    /** B über 1/l: Ursprungsgerade mit Steigung μ₀·N·I. */
    function drawLinChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const xs = meas.map((m) => 100 / m.x);
      const xMax = Math.max(0.3, ...xs, 100 / p.len) * 1.15;
      const yMax = Math.max(1, ...meas.map((m) => m.B), theory(100 / xMax)) * 1.15;
      plotC.setRange([-xMax * 0.08, xMax], [-yMax * 0.12, yMax]);
      plotC.setAxes({ x: { label: '1/l in 1/m' }, y: { label: ctx.t('bAx') } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      // Theorie: B = μ₀·N·I·(1/l)
      const slope = solenoidB(p.N, Math.abs(p.I), 1) * 1000;
      plotC.fn((u) => slope * u, { color: withAlpha(COL.orange(), 0.8), width: 1.6, dash: [6, 4], from: 0 });
      const k = measFit();
      if (k !== null) plotC.fn((u) => (k / 100) * u, { color: COL.blue(), width: 2.2, from: 0 });
      meas.forEach((m, i) => {
        const s = i === meas.length - 1 && measPop.running ? measPop.value : 1;
        plotC.point(100 / m.x, m.B, { color: COL.purple(), radius: 5 * s });
      });
      plotC.end();
      g.save();
      g.font = `700 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(ctx.lang === 'de' ? `Linearisiert: Steigung = μ₀ · N · I` : 'Linearised: slope = μ₀ · N · I', R.x + 14, R.y + 20);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number): number {
      g.save();
      g.textBaseline = 'middle';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${size}px ${th().font}`;
        for (const wd of sg.s.split(/(?<= )/)) {
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 4) {
            cx = x;
            cy += size * 1.35;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + size * 1.45;
    }
    function drawInfo(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.blue());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : 14;
      let y = R.y + 22;
      const bottom = R.y + R.h - 6;
      const line = (segs: Seg[], d = 0) => {
        if (y > bottom) return;
        y += segLine(g, segs, x, y, maxW, size + d);
      };
      const muted = (s: string) => line([{ s, c: t.muted }], -1.5);
      const [bx, by] = pointMode() ? field(p.px, p.py) : [0, 0];
      const Bp = Math.hypot(bx, by);
      switch (p.mode) {
        case 'wire': {
          line([{ s: ctx.t('wireT'), c: COL.blue(), w: 800 }]);
          line([{ s: 'B = μ₀ · I / (2π · r)', w: 700 }], 0.5);
          if (p.val && p.w2 === 'none') {
            const r = Math.hypot(p.px, p.py);
            line([{ s: `I = ${N(p.I, 1)} A,  r = ${N(r, 1)} cm  →  `, c: t.text }, { s: `B = ${Bstr(wireB(Math.abs(p.I), r / 100))}`, c: COL.purple(), w: 800 }], -1);
          } else if (p.val) {
            line([{ s: `${ctx.t('probe')}: `, c: t.text }, { s: `B = ${Bstr(Bp)}`, c: COL.purple(), w: 800 }], -1);
            const F = wireForcePerLength(p.I, p.w2 === 'anti' ? -p.I : p.I, p.dw / 100);
            line([{ s: `F/l = μ₀ · I₁ · I₂ / (2π · d) = ${N(Math.abs(F) * 1000, 3)} mN/m  (${ctx.t(F > 0 ? 'attract' : 'repel')})`, c: COL.green(), w: 700 }], -1.5);
          }
          if (p.earth && p.w2 === 'none' && p.val) {
            const ang = (compassAngle(...field(p.px, p.py)) * 180) / Math.PI;
            line([{ s: `B_Erde ≈ 20 µT → ${ctx.lang === 'de' ? 'Nadel an der Sonde' : 'needle at the probe'}: ${N(Math.abs(ang), 0)}°`, c: t.muted, w: 600 }], -1.5);
          }
          y += 4;
          if (p.w2 === 'anti') muted(ctx.t('wireAnti'));
          else if (p.w2 === 'same') muted(ctx.t('wireSame'));
          else {
            muted(ctx.t('wireRule'));
            if (p.earth) muted(ctx.t('wireOersted'));
          }
          return;
        }
        case 'loop':
          line([{ s: ctx.t('loopT'), c: COL.blue(), w: 800 }]);
          line([{ s: `${ctx.lang === 'de' ? 'Mitte' : 'centre'}: B = μ₀ · I / (2r) = ${Bstr(loopCenterB(p.rad / 100, Math.abs(p.I)))}`, w: 700 }], -0.5);
          if (p.val) line([{ s: `${ctx.t('probe')}: `, c: t.text }, { s: `B = ${Bstr(Bp)}`, c: COL.purple(), w: 800 }], -1);
          y += 4;
          muted(ctx.t('loopG'));
          muted(ctx.t('wireRule'));
          return;
        case 'coil': {
          const Bi = solenoidB(p.N, Math.abs(p.I), p.len / 100, mur());
          line([{ s: ctx.t('coilT'), c: COL.blue(), w: 800 }]);
          line([{ s: `B = μ₀ · ${p.core === 'iron' ? 'μ_r · ' : ''}N · I / l`, w: 700 }], 0.5);
          if (p.val) {
            line([{ s: `= ${p.core === 'iron' ? `${MU_IRON} · ` : ''}1,257·10⁻⁶ · ${N(p.N, 0)} · ${N(Math.abs(p.I), 1)} A / ${N(p.len / 100, 2)} m = `, c: t.text }, { s: Bstr(Bi), c: COL.orange(), w: 800 }], -1);
            line([{ s: `${ctx.t('probe')}: `, c: t.text }, { s: `B = ${Bstr(Bp)}`, c: COL.purple(), w: 800 }], -1);
          }
          y += 4;
          muted(ctx.t('coilG'));
          if (p.core === 'iron') muted(ctx.t('coilIron'));
          if (p.len < 4 * p.rad) line([{ s: ctx.t('coilShort'), c: COL.orange(), w: 600 }], -1.5);
          return;
        }
        case 'relay':
          line([{ s: ctx.t('relayT'), c: COL.blue(), w: 800 }]);
          line([{ s: ctx.t(relayOn ? 'relayOn' : 'relayOff'), c: relayOn ? COL.green() : t.text, w: 700 }], -1);
          if (pressed && !relayOn) line([{ s: ctx.t('relayWeak'), c: COL.orange(), w: 600 }], -1.5);
          if (relayOn && RELAY.N * relayI() < RELAY.pullIn) line([{ s: ctx.t('relayHyst'), c: COL.orange(), w: 600 }], -1.5);
          if (p.val) line([{ s: `N · I = ${RELAY.N} · ${N(relayI() * 1000, 0)} mA = ${N(RELAY.N * relayI(), 0)} A`, w: 600 }], -1);
          y += 4;
          muted(ctx.t('relayG'));
          return;
        case 'measure': {
          line([{ s: ctx.t('measT'), c: COL.blue(), w: 800 }]);
          line([{ s: 'B = μ₀ · N · I / l', w: 700 }], 0.5);
          const k = measFit();
          if (k !== null && p.val) {
            const kTh = p.vary === 'I' ? solenoidB(p.N, 1, p.len / 100) * 1000 : p.vary === 'N' ? solenoidB(1, Math.abs(p.I), p.len / 100) * 1000 : solenoidB(p.N, Math.abs(p.I), 0.01) * 1000;
            const unit = p.vary === 'I' ? 'mT/A' : p.vary === 'N' ? 'mT' : 'mT·cm';
            line([{ s: `${ctx.t('fitK')}: B = ${N(k, p.vary === 'N' ? 5 : 3)} ${unit} ${p.vary === 'l' ? '/ l' : `· ${p.vary}`}`, c: COL.blue(), w: 700 }], -1);
            line([{ s: `${ctx.t('theory')}: ${N(kTh, p.vary === 'N' ? 5 : 3)} ${unit}`, c: COL.orange(), w: 600 }], -1.5);
          }
          y += 4;
          if (meas.length < 2) muted(ctx.t('measHow'));
          muted(ctx.t(p.vary === 'I' ? 'measI' : p.vary === 'N' ? 'measN' : 'measL'));
          return;
        }
        case 'motor':
          line([{ s: ctx.t('motorT'), c: COL.blue(), w: 800 }]);
          line([{ s: `M = N · B · I · A · ${p.comm ? '|sin φ|' : 'sin φ'}`, w: 700 }], 0);
          if (p.val) line([{ s: `M_max = ${DM.N} · ${N(DM.B, 2)} T · ${N(Math.abs(motorI()), 1)} A · ${N(DM.A * 1e4, 0)} cm² = ${N(motorMaxTorque(DM, Math.abs(motorI())) * 1000, 1)} mN·m`, c: COL.green(), w: 700 }], -1.5);
          y += 4;
          muted(ctx.t('motorG'));
          muted(ctx.t(p.comm ? 'motorComm' : 'motorNoComm'));
          return;
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      if (pointMode()) {
        const [bx, by] = field(p.px, p.py);
        ctx.readout('B', p.probe ? `${Bstr(Math.hypot(bx, by))} (x = ${N(p.px, 1)} cm, y = ${N(p.py, 1)} cm)` : '–');
      }
      switch (p.mode) {
        case 'wire':
          ctx.readout('formula', 'B = μ₀ · I / (2π · r)');
          ctx.readout('extra', p.w2 === 'none' ? `r = 2 cm: ${Bstr(wireB(Math.abs(p.I), 0.02))}` : `F/l = ${N(Math.abs(wireForcePerLength(p.I, p.w2 === 'anti' ? -p.I : p.I, p.dw / 100)) * 1000, 3)} mN/m`);
          break;
        case 'loop':
          ctx.readout('formula', 'B = μ₀ · I / (2r)');
          ctx.readout('extra', Bstr(loopCenterB(p.rad / 100, Math.abs(p.I))));
          break;
        case 'coil':
          ctx.readout('formula', p.core === 'iron' ? 'B = μ₀ · μ_r · N · I / l' : 'B = μ₀ · N · I / l');
          ctx.readout('extra', Bstr(solenoidB(p.N, Math.abs(p.I), p.len / 100, mur())));
          break;
        case 'relay':
          ctx.readout('B', `N · I = ${N(RELAY.N * relayI(), 0)} A`);
          ctx.readout('formula', 'Θ = N · I');
          ctx.readout('extra', ctx.t(relayOn ? 'relayOn' : 'relayOff'));
          break;
        case 'measure': {
          const live = solenoidAxisB(p.N, Math.abs(p.I), p.len / 100, R_MEAS, 0);
          ctx.readout('B', Bstr(live));
          ctx.readout('formula', 'B = μ₀ · N · I / l');
          ctx.readout('extra', `${ctx.t('theory')}: ${Bstr(solenoidB(p.N, Math.abs(p.I), p.len / 100))}`);
          break;
        }
        case 'motor':
          ctx.readout('B', `M = ${N(motorTorque(DM, motorI(), phi, p.comm) * 1000, 2)} mN·m`);
          ctx.readout('formula', 'M = N · B · I · A · sin φ');
          ctx.readout('extra', `${N((Math.abs(omega) * 60) / TAU, 0)} min⁻¹`);
          break;
      }
    }

    function keys(): void {
      const de = ctx.lang === 'de';
      if (pointMode() && p.probe) {
        const mv = (dx: number, dy: number) => () => ctx.set({ px: clamp(p.px + dx, -20, 20), py: clamp(p.py + dy, -15, 15) });
        ctx.setKeyTargets([
          { id: 'pl', label: de ? 'Sonde 0,5 cm nach links' : 'Probe 0.5 cm left', activate: mv(-0.5, 0) },
          { id: 'pr', label: de ? 'Sonde 0,5 cm nach rechts' : 'Probe 0.5 cm right', activate: mv(0.5, 0) },
          { id: 'pu', label: de ? 'Sonde 0,5 cm nach oben' : 'Probe 0.5 cm up', activate: mv(0, 0.5) },
          { id: 'pd', label: de ? 'Sonde 0,5 cm nach unten' : 'Probe 0.5 cm down', activate: mv(0, -0.5) },
        ]);
      } else if (p.mode === 'measure') {
        const step = p.vary === 'I' ? { I: clamp(Math.abs(p.I) + 0.5, 0, 20) } : p.vary === 'N' ? { N: clamp(p.N + 100, 10, 1000) } : { len: clamp(p.len + 5, 4, 40) };
        ctx.setKeyTargets([
          { id: 'more', label: de ? 'Veränderte Größe erhöhen' : 'Increase the varied quantity', activate: () => ctx.set(step) },
          { id: 'read', label: de ? 'Messwert aufnehmen' : 'Take a reading', activate: () => takeReading() },
        ]);
      } else if (p.mode === 'relay') {
        ctx.setKeyTargets([{ id: 'btn', label: de ? 'Taster drücken oder loslassen' : 'Press or release the button', activate: () => toggle() }]);
      } else ctx.setKeyTargets([]);
    }
    function takeReading(): void {
      const x = varValue();
      if (x <= 0) return;
      meas = meas.filter((m) => Math.abs(m.x - x) > 1e-9);
      meas.push({ x, B: reading() });
      meas.sort((a, b) => a.x - b.x);
      measPop.play();
      ctx.announce(`${p.vary === 'I' ? 'I' : p.vary === 'N' ? 'N' : 'l'} = ${N(x, 1)}: B = ${N(meas.find((m) => m.x === x)!.B, 2)} mT`);
      updateReadouts();
      ctx.requestRender();
    }
    function toggle(): void {
      pressed = !pressed;
      updateRelay();
      ctx.setAction('switch', { label: ctx.lang === 'de' ? (pressed ? 'Taster loslassen' : 'Taster drücken') : pressed ? 'Release the button' : 'Press the button' });
      updateReadouts();
      ctx.requestRender();
    }

    fitRange();

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || ['mode', 'w2', 'dw', 'len', 'rad'].some((k) => changed.has(k))) fitRange();
        if (changed.has('mode') || source === 'init' || source === 'replace') {
          intro.play();
          needleAng.clear();
          ctx.clock.play();
          if (p.mode === 'motor' && source !== 'init') {
            phi = 0.35;
            omega = 0;
          }
        }
        if (changed.has('ir') || changed.has('mode')) updateRelay();
        if (changed.has('vary') || changed.has('mode') || (p.mode === 'measure' && ((p.vary !== 'I' && changed.has('I')) || (p.vary !== 'N' && changed.has('N')) || (p.vary !== 'l' && changed.has('len'))))) meas = [];
        if (changed.has('mode') && source === 'input') {
          if (p.mode === 'coil' || p.mode === 'measure') ctx.set({ I: 2, px: 0, py: 0 });
          if (p.mode === 'wire' || p.mode === 'loop') ctx.set({ I: 10, px: p.mode === 'wire' ? 3 : 0, py: 0 });
        }
        if (changed.has('comm') && p.mode === 'motor') {
          phi = 0.35;
          omega = 0;
        }
        ctx.setAction('switch', { label: ctx.lang === 'de' ? (pressed ? 'Taster loslassen' : 'Taster drücken') : pressed ? 'Release the button' : 'Press the button' });
        keys();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'flip') {
          if (p.mode === 'motor') ctx.set({ im: -p.im });
          else ctx.set({ I: -p.I });
        }
        if (id === 'switch') toggle();
        if (id === 'take') takeReading();
        if (id === 'clearm') {
          meas = [];
          ctx.requestRender();
        }
        if (id === 'kick') {
          omega += 12 * Math.sign(motorI() || 1);
          ctx.clock.play();
        }
      },
      tick(dt) {
        flow += dt;
        if (p.mode === 'motor') {
          const steps = 20;
          const h = (dt * SLOW) / steps;
          for (let i = 0; i < steps; i++) [phi, omega] = motorStep(DM, motorI(), phi, omega, h, p.comm);
          updateReadouts();
        }
        if (p.mode === 'relay') {
          const target = relayOn ? ARM_CLOSED : ARM_OPEN;
          const F = relayOn ? relayForce(RELAY, relayI(), 0.3e-3) : 0;
          const rate = relayOn ? 4 + Math.min(10, F) : 6;
          armAng += (target - armAng) * Math.min(1, dt * rate);
        }
      },
      resetTime() {
        phi = 0.35;
        omega = 0;
      },
      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = layout();
        const g = surface.begin();
        if (pointMode()) {
          drawFieldScene(g, lay.scene);
          drawFieldChart(g, lay.chart);
        } else if (p.mode === 'relay') {
          drawRelay(g, lay.scene);
          drawRelayChart(g, lay.chart);
        } else if (p.mode === 'measure') {
          drawMeasure(g, lay.scene);
          drawMeasureChart(g, lay.chart);
        } else {
          drawMotor(g, lay.scene);
          drawMotorChart(g, lay.chart);
        }
        drawInfo(g, lay.card);
        if (intro.running || animating || measPop.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
