import { defineSimulation, drawCard, ease, Plot, prefersReducedMotion, roundRect, Surface, textOn, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  align,
  angDiff,
  compassAngle,
  earthField,
  fieldRatio,
  forceOn,
  inclination,
  induced,
  magnetization,
  makeDomains,
  paperclips,
  poles,
  polesField,
  rng,
  shake,
  THINGS,
  thingOrder,
  traceLine,
  type Domain,
  type Magnet,
  type Pole,
  type Thing,
  type V2,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const TAU = 2 * Math.PI;
const DEG = Math.PI / 180;

/** Magnet A liegt fest links, Magnet B lässt sich auf dem Tisch verschieben. */
const A_X = -7;
const BAR_LEN = 6;
const BAR_W = 1.7;
/** B-Mittelpunkt bei Berührung mit A */
const B_CONTACT = A_X + BAR_LEN + 0.05;
const B_MAX = 14;

/**
 * Magnete und Kompass: Pole ziehen sich an oder stoßen sich ab (mit Kräften
 * und Bewegung auf dem Tisch), Feldlinien mit Kompassnadeln und
 * Eisenfeilspänen, Elementarmagnete in einem Eisennagel (Streichen,
 * Erschüttern, Erhitzen, Zerbrechen), das Erdmagnetfeld mit Inklination und
 * ein Sortierspiel „Was zieht der Magnet an?“.
 */
export default defineSimulation({
  id: 'magnete',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.62 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'poles', label: L('Anziehen und Abstoßen', 'Attract and repel') },
        { value: 'field', label: L('Feldlinien und Kompass', 'Field lines and compass') },
        { value: 'domains', label: L('Elementarmagnete', 'Elementary magnets') },
        { value: 'earth', label: L('Erdmagnetfeld', 'Earth’s magnetic field') },
        { value: 'sort', label: L('Spiel: Was zieht der Magnet an?', 'Game: what does the magnet attract?') },
      ],
      default: 'poles',
    },
    {
      key: 'other',
      type: 'choice',
      label: L('Rechts liegt', 'On the right'),
      options: [
        { value: 'magnet', label: L('ein zweiter Magnet', 'a second magnet') },
        { value: 'iron', label: L('ein Stück Eisen', 'a piece of iron') },
        { value: 'alu', label: L('ein Stück Aluminium', 'a piece of aluminium') },
      ],
      default: 'magnet',
      visibleIf: (v) => v.mode === 'poles',
    },
    { key: 'flip', type: 'boolean', label: L('Rechten Magneten umdrehen', 'Turn the right magnet round'), default: false, visibleIf: (v) => v.mode === 'poles' && v.other === 'magnet' },
    { key: 'bx', type: 'number', label: L('Lage des rechten Körpers', 'Position of the right body'), min: -1, max: 14, step: 0.1, default: 6, unit: 'cm', visibleIf: (v) => v.mode === 'poles' },
    {
      key: 'arr',
      type: 'choice',
      label: L('Anordnung', 'Arrangement'),
      options: [
        { value: 'single', label: L('ein Stabmagnet', 'one bar magnet') },
        { value: 'attract', label: L('Nordpol vor Südpol', 'north pole facing south pole') },
        { value: 'repel', label: L('Nordpol vor Nordpol', 'north pole facing north pole') },
        { value: 'horse', label: L('Hufeisenmagnet', 'horseshoe magnet') },
      ],
      default: 'single',
      visibleIf: (v) => v.mode === 'field',
    },
    { key: 'rot', type: 'number', label: L('Magnet drehen', 'Rotate the magnet'), min: 0, max: 360, step: 5, default: 0, unit: '°', visibleIf: (v) => v.mode === 'field' && v.arr === 'single' },
    { key: 'lines', type: 'boolean', group: 'view', label: L('Feldlinien', 'Field lines'), default: true, visibleIf: (v) => v.mode === 'poles' || v.mode === 'field' || v.mode === 'earth' },
    { key: 'filings', type: 'boolean', group: 'view', label: L('Eisenfeilspäne', 'Iron filings'), default: false, visibleIf: (v) => v.mode === 'field' },
    { key: 'needles', type: 'boolean', group: 'view', label: L('Viele kleine Kompassnadeln', 'Many small compass needles'), default: false, visibleIf: (v) => v.mode === 'field' },
    { key: 'cx', type: 'number', label: L('Kompass x', 'Compass x'), min: -11, max: 11, step: 0.1, default: -6, unit: 'cm', visibleIf: () => false },
    { key: 'cy', type: 'number', label: L('Kompass y', 'Compass y'), min: -7, max: 7, step: 0.1, default: 3, unit: 'cm', visibleIf: () => false },
    {
      key: 'pieces',
      type: 'choice',
      label: L('Nagel zerbrechen', 'Break the nail'),
      options: [
        { value: '1', label: L('ganz', 'whole') },
        { value: '2', label: L('in 2 Teile', 'into 2 pieces') },
        { value: '3', label: L('in 3 Teile', 'into 3 pieces') },
      ],
      default: '1',
      visibleIf: (v) => v.mode === 'domains',
    },
    { key: 'lat', type: 'number', label: L('Kompass an der Breite', 'Compass at latitude'), help: L('Positiv: Nordhalbkugel. Deutschland liegt bei etwa 51°.', 'Positive: northern hemisphere. Germany is at about 51°.'), min: -90, max: 90, step: 1, default: 51, unit: '°', visibleIf: (v) => v.mode === 'earth' },
    { key: 'tilt', type: 'number', label: L('Neigung der Magnetachse', 'Tilt of the magnetic axis'), min: 0, max: 25, step: 1, default: 10, unit: '°', visibleIf: (v) => v.mode === 'earth' },
    { key: 'round', type: 'number', label: L('Runde', 'Round'), min: 1, max: 99, step: 1, default: 1, visibleIf: (v) => v.mode === 'sort' },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'turn', label: L('Umdrehen', 'Turn round'), primary: true, visibleIf: (v) => v.mode === 'poles' && v.other === 'magnet' },
    { id: 'release', label: L('Loslassen', 'Let go'), visibleIf: (v) => v.mode === 'poles' },
    { id: 'sprinkle', label: L('Späne neu streuen', 'Sprinkle the filings again'), primary: true, visibleIf: (v) => v.mode === 'field' },
    { id: 'stroke', label: L('Mit Magnet streichen', 'Stroke with a magnet'), primary: true, visibleIf: (v) => v.mode === 'domains' },
    { id: 'hammer', label: L('Hämmern', 'Hammer it'), visibleIf: (v) => v.mode === 'domains' },
    { id: 'heat', label: L('Stark erhitzen', 'Heat strongly'), visibleIf: (v) => v.mode === 'domains' },
    { id: 'yes', label: L('Wird angezogen', 'Is attracted'), primary: true, visibleIf: (v) => v.mode === 'sort' },
    { id: 'no', label: L('Wird nicht angezogen', 'Is not attracted'), primary: true, visibleIf: (v) => v.mode === 'sort' },
    { id: 'next', label: L('Nächster Gegenstand', 'Next object'), visibleIf: (v) => v.mode === 'sort' },
  ],
  readouts: [
    { key: 'what', label: L('Beobachtung', 'Observation') },
    { key: 'rule', label: L('Regel', 'Rule') },
    { key: 'extra', label: L('Außerdem', 'Also'), spoiler: true },
  ],
  presets: [
    { id: 'attract', label: L('Nordpol und Südpol ziehen sich an', 'North and south pole attract'), values: { mode: 'poles', other: 'magnet', flip: false, bx: 7, lines: true } },
    { id: 'repel', label: L('Zwei Nordpole stoßen sich ab', 'Two north poles repel'), values: { mode: 'poles', other: 'magnet', flip: true, bx: 1, lines: true } },
    { id: 'iron', label: L('Eisen wird von jedem Pol angezogen', 'Iron is attracted by either pole'), values: { mode: 'poles', other: 'iron', bx: 5, lines: true } },
    { id: 'alu', label: L('Aluminium: nichts passiert', 'Aluminium: nothing happens'), values: { mode: 'poles', other: 'alu', bx: 2, lines: true } },
    { id: 'bar', label: L('Feld eines Stabmagneten mit Kompass', 'Field of a bar magnet with compass'), values: { mode: 'field', arr: 'single', rot: 0, lines: true, filings: false, needles: false, cx: -6, cy: 3 } },
    { id: 'filings', label: L('Eisenfeilspäne zeigen das Feld', 'Iron filings show the field'), values: { mode: 'field', arr: 'single', rot: 0, lines: false, filings: true, needles: false } },
    { id: 'needles', label: L('Viele Kompassnadeln', 'Many compass needles'), values: { mode: 'field', arr: 'single', rot: 0, lines: true, filings: false, needles: true } },
    { id: 'fa', label: L('Feld: Nordpol vor Südpol', 'Field: north facing south'), values: { mode: 'field', arr: 'attract', lines: true, filings: true, needles: false, cx: 0, cy: 0 } },
    { id: 'fr', label: L('Feld: Nordpol vor Nordpol', 'Field: north facing north'), values: { mode: 'field', arr: 'repel', lines: true, filings: true, needles: false, cx: 0, cy: 3 } },
    { id: 'horse', label: L('Hufeisenmagnet', 'Horseshoe magnet'), values: { mode: 'field', arr: 'horse', lines: true, filings: true, needles: false, cx: 3, cy: 0 } },
    { id: 'dom', label: L('Nagel magnetisieren', 'Magnetise a nail'), values: { mode: 'domains', pieces: '1' } },
    { id: 'break', label: L('Zerbrochener Magnet', 'Broken magnet'), values: { mode: 'domains', pieces: '3' } },
    { id: 'de', label: L('Kompass in Deutschland', 'Compass in Germany'), values: { mode: 'earth', lat: 51, tilt: 10, lines: true } },
    { id: 'eq', label: L('Kompass am Äquator', 'Compass at the equator'), values: { mode: 'earth', lat: 0, tilt: 10, lines: true } },
    { id: 'sort', label: L('Spiel: Was zieht der Magnet an?', 'Game: what does the magnet attract?'), values: { mode: 'sort', round: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Magnete: zwei Stabmagnete auf einem Tisch mit Kraftpfeilen, Feldlinien mit Kompass und Eisenfeilspänen, Elementarmagnete in einem Eisennagel, die Erde als Magnet und ein Sortierspiel.',
      north: 'Nordpol',
      south: 'Südpol',
      polesT: 'Anziehen und Abstoßen',
      polesHow: 'Ziehe den rechten Körper und lass ihn los. Mit „Umdrehen“ drehst du den rechten Magneten.',
      attract: 'Sie ziehen sich an.',
      repel: 'Sie stoßen sich ab.',
      nothing: 'Nichts passiert.',
      tooFar: 'Zu weit weg: Die Kraft ist zu klein, um die Reibung zu überwinden.',
      touching: 'Die Magnete haften aneinander.',
      ruleP: 'Ungleiche Pole ziehen sich an, gleiche Pole stoßen sich ab.',
      ruleIron: 'Eisen wird von jedem Pol angezogen: Es wird selbst kurz zum Magneten, mit dem ungleichen Pol zum Magneten hin.',
      ruleAlu: 'Aluminium ist ein Metall, aber nicht magnetisch. Nur Eisen, Nickel und Kobalt werden angezogen.',
      force: 'Kraft',
      forceBoth: 'Beide spüren gleich große Kräfte in entgegengesetzte Richtungen.',
      iron: 'Eisen',
      alu: 'Aluminium',
      fieldT: 'Das Magnetfeld',
      fieldHow: 'Ziehe den Kompass durch das Feld. Die rote Spitze (Nordpol der Nadel) zeigt in Richtung der Feldlinien.',
      fieldRule: 'Feldlinien treten am Nordpol aus und am Südpol ein. Wo sie dicht liegen, ist das Feld stark. Sie kreuzen sich nie.',
      fieldA: 'Zwischen Nord- und Südpol laufen die Feldlinien von einem Magneten zum anderen: Anziehung.',
      fieldR: 'Zwischen zwei Nordpolen weichen die Feldlinien sich aus. In der Mitte gibt es eine Stelle ohne Feld: Dort ist der Kompass unentschlossen.',
      fieldH: 'Zwischen den Schenkeln des Hufeisenmagneten ist das Feld stark und fast gleichmäßig.',
      fieldFil: 'Eisenfeilspäne werden zu kleinen Magneten und legen sich wie Kompassnadeln entlang der Feldlinien.',
      compass: 'Kompass',
      strength: 'Feldstärke hier',
      strong: 'stark',
      medium: 'mittel',
      weak: 'schwach',
      zero: 'fast null',
      domT: 'Elementarmagnete im Eisennagel',
      domHow: 'Streiche mit dem Magneten über den Nagel. Dann hämmere ihn oder erhitze ihn.',
      domRule: 'Eisen besteht aus winzigen Elementarmagneten. Sind sie ungeordnet, heben sie sich auf. Zeigen sie in eine Richtung, ist das Eisen ein Magnet.',
      domM: 'Ordnung der Elementarmagnete: {m} %',
      domClips: 'Der Nagel hält {n} Büroklammern.',
      domNo: 'Der Nagel ist (fast) nicht magnetisch.',
      domBreak: 'Jedes Bruchstück ist wieder ein ganzer Magnet mit Nord- und Südpol. Einzelne Pole gibt es nicht.',
      domHot: 'Über 768 °C (Curie-Temperatur) geraten die Elementarmagnete völlig durcheinander.',
      domHam: 'Erschütterungen bringen die Elementarmagnete durcheinander.',
      strokeMag: 'Magnet',
      clips: 'Büroklammern',
      earthT: 'Die Erde ist ein Magnet',
      earthHow: 'Ziehe den Kompass über die Erde (Seitenansicht). Die Nadel zeigt entlang der Feldlinien.',
      earthRule: 'Am geografischen Nordpol liegt ein magnetischer Südpol. Deshalb zeigt der Nordpol der Kompassnadel nach Norden.',
      earthIncl: 'Neigung der Nadel gegen den Boden (Inklination): {i}°',
      earthStr: 'Feld {r}-mal so stark wie am Äquator',
      earthDecl: 'Die Magnetachse ist um {t}° gegen die Erdachse geneigt. Deshalb weicht der Kompass etwas von der genauen Nordrichtung ab.',
      geoN: 'geogr. Nordpol',
      geoS: 'geogr. Südpol',
      magS: 'magn. Südpol',
      magN: 'magn. Nordpol',
      equator: 'Äquator',
      ground: 'Boden',
      sortT: 'Was zieht der Magnet an?',
      sortHow: 'Wird der Gegenstand angezogen? Tippe auf eine Antwort.',
      sortRight: 'Richtig!',
      sortWrong: 'Leider falsch.',
      sortScore: '{k} von {n} richtig',
      sortDone: 'Geschafft! Angezogen wird alles, was Eisen, Nickel oder Kobalt enthält. Andere Metalle wie Aluminium, Kupfer oder Gold nicht.',
      sortYes: 'wird angezogen',
      sortNo: 'wird nicht angezogen',
    },
    en: {
      canvas: 'Magnets: two bar magnets on a table with force arrows, field lines with a compass and iron filings, elementary magnets in an iron nail, the Earth as a magnet and a sorting game.',
      north: 'north pole',
      south: 'south pole',
      polesT: 'Attract and repel',
      polesHow: 'Drag the right body and let go. “Turn round” turns the right magnet.',
      attract: 'They attract each other.',
      repel: 'They repel each other.',
      nothing: 'Nothing happens.',
      tooFar: 'Too far away: the force is too small to overcome friction.',
      touching: 'The magnets stick together.',
      ruleP: 'Unlike poles attract, like poles repel.',
      ruleIron: 'Iron is attracted by either pole: it briefly becomes a magnet itself, with the unlike pole facing the magnet.',
      ruleAlu: 'Aluminium is a metal but not magnetic. Only iron, nickel and cobalt are attracted.',
      force: 'force',
      forceBoth: 'Both feel forces of equal size in opposite directions.',
      iron: 'iron',
      alu: 'aluminium',
      fieldT: 'The magnetic field',
      fieldHow: 'Drag the compass through the field. The red tip (north pole of the needle) points along the field lines.',
      fieldRule: 'Field lines leave at the north pole and enter at the south pole. Where they are dense the field is strong. They never cross.',
      fieldA: 'Between north and south pole the field lines run from one magnet to the other: attraction.',
      fieldR: 'Between two north poles the field lines avoid each other. In the middle there is a spot without field: there the compass cannot decide.',
      fieldH: 'Between the arms of the horseshoe magnet the field is strong and almost uniform.',
      fieldFil: 'Iron filings become tiny magnets and line up along the field lines like compass needles.',
      compass: 'compass',
      strength: 'field strength here',
      strong: 'strong',
      medium: 'medium',
      weak: 'weak',
      zero: 'almost zero',
      domT: 'Elementary magnets in an iron nail',
      domHow: 'Stroke the nail with the magnet. Then hammer it or heat it.',
      domRule: 'Iron is made of tiny elementary magnets. When they are disordered, they cancel out. When they point the same way, the iron is a magnet.',
      domM: 'order of the elementary magnets: {m} %',
      domClips: 'The nail holds {n} paper clips.',
      domNo: 'The nail is (almost) not magnetic.',
      domBreak: 'Every piece is again a complete magnet with a north and a south pole. Single poles do not exist.',
      domHot: 'Above 768 °C (Curie temperature) the elementary magnets get completely mixed up.',
      domHam: 'Shocks mix up the elementary magnets.',
      strokeMag: 'magnet',
      clips: 'paper clips',
      earthT: 'The Earth is a magnet',
      earthHow: 'Drag the compass over the Earth (side view). The needle points along the field lines.',
      earthRule: 'At the geographic North Pole there is a magnetic south pole. That is why the north pole of the needle points north.',
      earthIncl: 'tilt of the needle against the ground (inclination): {i}°',
      earthStr: 'field {r} times as strong as at the equator',
      earthDecl: 'The magnetic axis is tilted by {t}° against the Earth’s axis. That is why the compass differs a little from true north.',
      geoN: 'geogr. North Pole',
      geoS: 'geogr. South Pole',
      magS: 'magn. south pole',
      magN: 'magn. north pole',
      equator: 'equator',
      ground: 'ground',
      sortT: 'What does the magnet attract?',
      sortHow: 'Is the object attracted? Tap an answer.',
      sortRight: 'Correct!',
      sortWrong: 'Sorry, wrong.',
      sortScore: '{k} of {n} correct',
      sortDone: 'Done! Everything that contains iron, nickel or cobalt is attracted. Other metals such as aluminium, copper or gold are not.',
      sortYes: 'is attracted',
      sortNo: 'is not attracted',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 1) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 1e-12 ? 0 : v, d) : '–');
    const reduced = prefersReducedMotion();
    const narrow = () => surface.width < 640;
    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.15;
    const OFF: Rect = { x: -1000, y: -1000, w: 10, h: 10 };
    const COL = {
      blue: () => th().series[0]!,
      north: () => th().series[1]!,
      south: () => th().series[2]!,
      orange: () => th().series[3]!,
      purple: () => th().series[4]!,
      teal: () => th().series[5]!,
    };

    /* -------------------------------------------------------------- */
    /* Aufteilung                                                      */
    /* -------------------------------------------------------------- */

    interface Lay {
      scene: Rect;
      card: Rect;
    }
    function layout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide() || W >= H * 1.3) {
        const sw = Math.round(W * (wide() ? 0.63 : 0.58));
        return { scene: { x: pad, y: pad, w: sw - pad, h: H - 2 * pad }, card: { x: sw + pad, y: pad, w: W - sw - 2 * pad, h: H - 2 * pad } };
      }
      const sh = Math.round(H * 0.6);
      return { scene: { x: pad, y: pad, w: W - 2 * pad, h: sh }, card: { x: pad, y: sh + 2 * pad, w: W - 2 * pad, h: H - sh - 3 * pad } };
    }
    let lay: Lay = layout();
    const inner = (r: Rect, m = 6): Rect => ({ x: r.x + m, y: r.y + m, w: r.w - 2 * m, h: r.h - 2 * m });
    const plotMode = () => p.mode === 'poles' || p.mode === 'field' || p.mode === 'earth';

    const plot = new Plot(surface, {
      x: [-14, 16],
      y: [-7, 7],
      equalAspect: true,
      zoom: false,
      pan: false,
      controls: false,
      region: () => (plotMode() ? inner(lay.scene, 4) : OFF),
      xAxis: { label: 'x in cm' },
      yAxis: { label: 'y in cm' },
    });
    function fitRange(): void {
      if (p.mode === 'poles') plot.setRange([-14, 16.5], [-6, 6]);
      else if (p.mode === 'field') plot.setRange([-12, 12], [-7.5, 7.5]);
      else if (p.mode === 'earth') plot.setRange([-3.3, 3.3], [-2.5, 2.5]);
    }
    fitRange();

    /* -------------------------------------------------------------- */
    /* Zustand: Tisch mit zwei Körpern                                 */
    /* -------------------------------------------------------------- */

    let bPos = p.bx;
    let bVel = 0;
    let lastDrag = -1e9;
    let bAng = p.flip ? Math.PI : 0;
    const turnTw = new Tween(700, ease.inOutCubic);
    let turnFrom = 0;
    let turnTo = 0;
    let stuck = false;
    const magA = (): Magnet => ({ x: A_X, y: 0, ang: 0, len: BAR_LEN, q: 1 });
    /** Der rechte Körper als Magnet (bei Eisen: durch Influenz; bei Aluminium: keiner). */
    function bodyB(): Magnet | null {
      if (p.other === 'alu') return null;
      if (p.other === 'iron') return induced([magA()], bPos, 0, BAR_LEN * 0.8, 60, 0.9);
      return { x: bPos, y: 0, ang: bAng, len: BAR_LEN, q: 1 };
    }
    function tableMagnets(): Magnet[] {
      const b = bodyB();
      return b ? [magA(), b] : [magA()];
    }
    /** Kraft auf B in x-Richtung (positiv: nach rechts). */
    function forceB(): number {
      const ms = tableMagnets();
      return ms.length > 1 ? forceOn(ms, 1).F[0] : 0;
    }
    const FRICTION = 0.0012;
    const bLeftLimit = () => (p.other === 'magnet' ? B_CONTACT : A_X + BAR_LEN / 2 + (BAR_LEN * 0.8) / 2 + 0.05);
    function stepTable(dt: number): void {
      if (p.mode !== 'poles') return;
      if (performance.now() - lastDrag < 350) return;
      const F = forceB();
      const atWall = bPos <= bLeftLimit() + 1e-6;
      if (Math.abs(bVel) < 1e-6 && Math.abs(F) < FRICTION) {
        bVel = 0;
        return;
      }
      if (atWall && F < 0) {
        bVel = 0;
        if (!stuck) {
          stuck = true;
          announceState();
        }
        return;
      }
      stuck = false;
      const m = 0.0015;
      const fr = -Math.sign(bVel || F) * FRICTION;
      bVel += ((F + fr) / m) * dt;
      bVel *= Math.exp(-2.5 * dt);
      bPos += bVel * dt;
      if (bPos < bLeftLimit()) {
        bPos = bLeftLimit();
        bVel = 0;
        stuck = true;
        announceState();
      }
      if (bPos > B_MAX) {
        bPos = B_MAX;
        bVel = 0;
      }
    }
    function announceState(): void {
      ctx.announce(stateText());
      updateReadouts();
    }
    function stateText(): string {
      if (p.other === 'alu') return ctx.t('nothing');
      const F = forceB();
      if (stuck || bPos <= bLeftLimit() + 1e-3) return F < 0 ? ctx.t('touching') : ctx.t('repel');
      if (Math.abs(F) < FRICTION) return ctx.t('tooFar');
      return F < 0 ? ctx.t('attract') : ctx.t('repel');
    }

    plot.addHandle({
      get: () => [bPos, 0],
      set: (x) => {
        lastDrag = performance.now();
        bVel = 0;
        stuck = false;
        ctx.set({ bx: Math.round(clamp(x, bLeftLimit(), B_MAX) * 10) / 10 });
      },
      enabled: () => p.mode === 'poles' && !ctx.locked,
      color: () => COL.purple(),
      axis: 'x',
    });

    /* -------------------------------------------------------------- */
    /* Zustand: Feld und Kompass                                       */
    /* -------------------------------------------------------------- */

    function fieldPoles(): Pole[] {
      if (p.mode === 'poles') return tableMagnets().flatMap((m) => poles(m));
      if (p.arr === 'single') return poles({ x: 0, y: 0, ang: p.rot * DEG, len: 8, q: 1 });
      if (p.arr === 'attract') return [...poles({ x: -6, y: 0, ang: 0, len: 7, q: 1 }), ...poles({ x: 6, y: 0, ang: 0, len: 7, q: 1 })];
      if (p.arr === 'repel') return [...poles({ x: -6, y: 0, ang: 0, len: 7, q: 1 }), ...poles({ x: 6, y: 0, ang: Math.PI, len: 7, q: 1 })];
      // Hufeisen: Pole an den Enden der Schenkel
      return [
        { x: 2.6, y: 2.6, q: 1.3 },
        { x: 2.6, y: -2.6, q: -1.3 },
      ];
    }
    function field(x: number, y: number): V2 {
      if (p.mode === 'earth') {
        if (Math.hypot(x, y) < 0.985) return [0, 0];
        return earthField(x, y, p.tilt * DEG);
      }
      return polesField(fieldPoles(), x, y);
    }
    /** Feldstärke einordnen (bezogen auf 1 cm Abstand von einem Pol ≈ 1). */
    function strengthWord(B: number): string {
      if (B > 0.15) return ctx.t('strong');
      if (B > 0.03) return ctx.t('medium');
      if (B > 0.004) return ctx.t('weak');
      return ctx.t('zero');
    }

    // großer Kompass als gedämpfter Drehschwinger
    let cAng = 0;
    let cOmega = 0;
    plot.addHandle({
      get: () => (p.mode === 'earth' ? earthCompassPos() : [p.cx, p.cy]),
      set: (x, y) => {
        if (p.mode === 'earth') ctx.set({ lat: Math.round(clamp(Math.atan2(y, x) / DEG, -90, 90)) });
        else ctx.set({ cx: Math.round(clamp(x, -11, 11) * 10) / 10, cy: Math.round(clamp(y, -7, 7) * 10) / 10 });
      },
      enabled: () => (p.mode === 'field' || p.mode === 'earth') && !ctx.locked,
      color: () => COL.purple(),
      axis: 'both',
    });
    const EARTH_C = 1.28;
    function earthCompassPos(): V2 {
      const a = clamp(p.lat, -90, 90) * DEG;
      return [EARTH_C * Math.cos(a), EARTH_C * Math.sin(a)];
    }
    /** Zielrichtung der großen Nadel (Winkel gegen oben, im Uhrzeigersinn). */
    function compassTarget(): number {
      if (p.mode === 'earth') {
        const [x, y] = earthCompassPos();
        const [bx, by] = earthField(x, y, p.tilt * DEG);
        return compassAngle(bx, by);
      }
      const [bx, by] = field(p.cx, p.cy);
      return compassAngle(bx, by, 0.0015);
    }
    function stepCompass(dt: number): void {
      const target = compassTarget();
      const steps = 8;
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        const d = angDiff(cAng, target);
        cOmega += (40 * Math.sin(d) - 4.5 * cOmega) * h;
        cAng += cOmega * h;
      }
      if (reduced) {
        cAng = target;
        cOmega = 0;
      }
    }

    // kleine Nadeln (gleiten sanft in die Feldrichtung)
    const needleAng = new Map<number, number>();
    let frameDt = 0.016;

    // Eisenfeilspäne: Zufallsorte, sie drehen sich beim Streuen in Feldrichtung
    interface Filing {
      x: number;
      y: number;
      a0: number;
      len: number;
    }
    let filings: Filing[] = [];
    function makeFilings(): void {
      const r = rng(17 + Math.round(p.rot) * 3 + (p.arr.length << 4));
      const b = plot.bounds;
      filings = [];
      const n = narrow() ? 900 : 1500;
      for (let i = 0; i < n; i++) filings.push({ x: b.xMin + r() * (b.xMax - b.xMin), y: b.yMin + r() * (b.yMax - b.yMin), a0: r() * Math.PI, len: 0.5 + r() * 0.5 });
    }
    const sprinkleTw = new Tween(1600, ease.outCubic);

    /* -------------------------------------------------------------- */
    /* Zustand: Elementarmagnete                                       */
    /* -------------------------------------------------------------- */

    const DOM_COLS = 18;
    const DOM_ROWS = 5;
    let domains: Domain[] = makeDomains(DOM_COLS, DOM_ROWS, 11);
    const domRng = rng(101);
    const strokeTw = new Tween(3600, ease.linear);
    let strokeLast = 1;
    const hammerTw = new Tween(900, ease.outCubic);
    const heatTw = new Tween(2600, ease.inOutCubic);
    let lastEvent: 'stroke' | 'hammer' | 'heat' | null = null;
    const domIntro = new Tween(900, ease.outCubic);
    function stepDomains(): void {
      if (!strokeTw.running && strokeLast >= 1) return;
      // drei Striche von links nach rechts; der Nordpol des Streichmagneten gleitet über den Nagel.
      // Den seit dem letzten Bild überstrichenen Bereich ausrichten (auch über das Ende eines Strichs hinweg).
      const uNow = strokeTw.value * 3;
      let a = strokeLast * 3;
      while (a < uNow - 1e-9) {
        const k = Math.floor(a + 1e-9);
        const b = Math.min(uNow, k + 1);
        align(domains, Math.PI, 0.32, a - k - 0.06, b - k + 0.02, domRng);
        a = b;
      }
      strokeLast = strokeTw.value;
    }

    /* -------------------------------------------------------------- */
    /* Zustand: Sortierspiel                                           */
    /* -------------------------------------------------------------- */

    let order: Thing[] = thingOrder(p.round);
    let idx = 0;
    let answered: boolean | null = null;
    let correct = 0;
    let asked = 0;
    const flyTw = new Tween(900, ease.inOutCubic);
    const popTw = new Tween(500, ease.outBack);
    function resetSort(): void {
      order = thingOrder(p.round);
      idx = 0;
      answered = null;
      correct = 0;
      asked = 0;
      popTw.play();
    }
    function answer(yes: boolean): void {
      if (answered !== null || idx >= order.length) return;
      const t = order[idx]!;
      answered = yes === t.magnetic;
      asked++;
      if (answered) correct++;
      flyTw.play();
      ctx.announce(`${answered ? ctx.t('sortRight') : ctx.t('sortWrong')} ${ctx.lang === 'de' ? t.de : t.en} ${ctx.t(t.magnetic ? 'sortYes' : 'sortNo')}. ${ctx.lang === 'de' ? t.whyDe : t.whyEn}`);
      updateReadouts();
      ctx.requestRender();
    }
    function nextThing(): void {
      if (answered === null && idx < order.length) return;
      idx = Math.min(order.length, idx + 1);
      answered = null;
      popTw.play();
      updateReadouts();
      ctx.requestRender();
    }

    const intro = new Tween(1000, ease.outCubic);
    intro.play();

    /* -------------------------------------------------------------- */
    /* Zeichenhilfen                                                   */
    /* -------------------------------------------------------------- */

    /** Stabmagnet in Pixeln: Mitte (cx | cy), Winkel (Bildschirm, im Uhrzeigersinn), Länge, Dicke. */
    function drawBarPx(g: CanvasRenderingContext2D, cx: number, cy: number, angPx: number, len: number, wid: number, alpha = 1, labels = true): void {
      g.save();
      g.globalAlpha *= alpha;
      g.translate(cx, cy);
      g.rotate(angPx);
      const r = Math.min(6, wid * 0.25);
      // Schatten
      g.fillStyle = 'rgba(0,0,0,0.18)';
      roundRect(g, -len / 2 + 2, -wid / 2 + 4, len, wid, r);
      g.fill();
      // Südhälfte (links) und Nordhälfte (rechts)
      const sCol = COL.south();
      const nCol = COL.north();
      g.save();
      roundRect(g, -len / 2, -wid / 2, len, wid, r);
      g.clip();
      g.fillStyle = sCol;
      g.fillRect(-len / 2, -wid / 2, len / 2, wid);
      g.fillStyle = nCol;
      g.fillRect(0, -wid / 2, len / 2, wid);
      // Glanz
      const gl = g.createLinearGradient(0, -wid / 2, 0, wid / 2);
      gl.addColorStop(0, 'rgba(255,255,255,0.35)');
      gl.addColorStop(0.45, 'rgba(255,255,255,0.05)');
      gl.addColorStop(1, 'rgba(0,0,0,0.18)');
      g.fillStyle = gl;
      g.fillRect(-len / 2, -wid / 2, len, wid);
      g.restore();
      g.strokeStyle = withAlpha(th().text, 0.35);
      g.lineWidth = 1;
      roundRect(g, -len / 2, -wid / 2, len, wid, r);
      g.stroke();
      if (labels && wid > 12) {
        const fs = Math.min(18, wid * 0.62);
        g.font = `800 ${fs}px ${th().font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        // Buchstaben aufrecht halten
        const up = Math.cos(angPx) < -0.01 ? Math.PI : 0;
        for (const [txt, x, col] of [
          ['N', len / 2 - fs * 0.9, nCol],
          ['S', -len / 2 + fs * 0.9, sCol],
        ] as const) {
          g.save();
          g.translate(x, 0);
          g.rotate(up);
          g.fillStyle = textOn(col, th());
          g.fillText(txt, 0, 1);
          g.restore();
        }
      }
      g.restore();
    }
    /** Stabmagnet in Weltkoordinaten. */
    function drawBar(g: CanvasRenderingContext2D, m: Magnet, alpha = 1): void {
      const [cx, cy] = plot.toPx(m.x, m.y);
      const s = plot.scale.x;
      drawBarPx(g, cx, cy, -m.ang, m.len * s, BAR_W * s, alpha);
    }
    /** Block aus Eisen oder Aluminium. */
    function drawBlock(g: CanvasRenderingContext2D, x: number, w: number, kind: 'iron' | 'alu'): void {
      const [cx, cy] = plot.toPx(x, 0);
      const s = plot.scale.x;
      const len = w * s;
      const wid = BAR_W * s * 0.95;
      g.save();
      g.fillStyle = 'rgba(0,0,0,0.18)';
      roundRect(g, cx - len / 2 + 2, cy - wid / 2 + 4, len, wid, 4);
      g.fill();
      const gr = g.createLinearGradient(0, cy - wid / 2, 0, cy + wid / 2);
      if (kind === 'iron') {
        gr.addColorStop(0, '#9aa1ab');
        gr.addColorStop(0.5, '#6b727d');
        gr.addColorStop(1, '#4a5058');
      } else {
        gr.addColorStop(0, '#f1f3f6');
        gr.addColorStop(0.5, '#cdd3da');
        gr.addColorStop(1, '#aab2bc');
      }
      g.fillStyle = gr;
      roundRect(g, cx - len / 2, cy - wid / 2, len, wid, 4);
      g.fill();
      g.strokeStyle = withAlpha(th().text, 0.35);
      g.lineWidth = 1;
      g.stroke();
      g.font = `700 ${Math.min(13, wid * 0.5)}px ${th().font}`;
      g.fillStyle = kind === 'iron' ? '#ffffff' : '#2b3340';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(ctx.t(kind), cx, cy + 1);
      g.restore();
    }

    /** Pfeil in Pixeln. */
    function arrowPx(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, w = 3, head = 10): void {
      const L0 = Math.hypot(x1 - x0, y1 - y0);
      if (L0 < 2) return;
      const ux = (x1 - x0) / L0;
      const uy = (y1 - y0) / L0;
      g.save();
      g.strokeStyle = col;
      g.fillStyle = col;
      g.lineWidth = w;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * head * 0.6, y1 - uy * head * 0.6);
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * head - uy * head * 0.55, y1 - uy * head + ux * head * 0.55);
      g.lineTo(x1 - ux * head + uy * head * 0.55, y1 - uy * head - ux * head * 0.55);
      g.closePath();
      g.fill();
      g.restore();
    }

    /** Beschriftung mit Hintergrund, an den Rand geklemmt. */
    function tag(g: CanvasRenderingContext2D, x: number, y: number, txt: string, col: string, R: Rect, size = 13): void {
      g.save();
      g.font = `700 ${size}px ${th().font}`;
      const w = g.measureText(txt).width + 12;
      const h = size + 9;
      const lx = clamp(x - w / 2, R.x + 4, R.x + R.w - w - 4);
      const ly = clamp(y - h / 2, R.y + 4, R.y + R.h - h - 4);
      g.fillStyle = th().dark ? 'rgba(20,27,38,0.9)' : 'rgba(255,255,255,0.92)';
      roundRect(g, lx, ly, w, h, 6);
      g.fill();
      g.strokeStyle = withAlpha(col, 0.55);
      g.lineWidth = 1;
      g.stroke();
      g.fillStyle = col;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(txt, lx + 6, ly + h / 2 + 0.5);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Feldlinien (mit wandernden Pfeilen)                             */
    /* -------------------------------------------------------------- */

    let flow = 0;
    let lineCache: { key: string; lines: V2[][] } | null = null;
    function fieldLines(): V2[][] {
      const b = plot.bounds;
      const key = p.mode === 'earth' ? `e|${p.tilt}` : `${p.mode}|${p.arr}|${p.rot}|${p.other}|${bPos.toFixed(2)}|${bAng.toFixed(3)}|${b.xMin.toFixed(1)}|${b.xMax.toFixed(1)}`;
      if (lineCache && lineCache.key === key) return lineCache.lines;
      const lines: V2[][] = [];
      const box = { x0: b.xMin - 2, x1: b.xMax + 2, y0: b.yMin - 2, y1: b.yMax + 2 };
      if (p.mode === 'earth') {
        const tilt = p.tilt * DEG;
        // Startpunkte auf der Südhalbkugel, wo die Linien austreten (magnetischer Nordpol)
        for (let k = 0; k < 14; k++) {
          const lat = -86 + k * 6;
          const phi = (lat * DEG) - tilt;
          for (const side of [1, -1]) {
            const x0 = side * Math.cos(phi) * 1.0 + 0.0;
            const y0 = Math.sin(phi) * 1.0;
            const [bx, by] = earthField(x0 * 1.02, y0 * 1.02, tilt);
            if (bx * x0 + by * y0 <= 0) continue;
            lines.push(traceLine(field, x0 * 1.02, y0 * 1.02, { step: 0.02, maxSteps: 2500, box }, 1));
          }
        }
      } else {
        const ps = fieldPoles();
        const stops = ps.filter((q) => q.q < 0).map((q) => ({ x: q.x, y: q.y, r: 0.35 }));
        const per = p.mode === 'poles' ? 14 : p.arr === 'horse' ? 18 : 16;
        for (const pole of ps.filter((q) => q.q > 0)) {
          for (let k = 0; k < per; k++) {
            const a = ((k + 0.5) / per) * TAU;
            const x0 = pole.x + 0.4 * Math.cos(a);
            const y0 = pole.y + 0.4 * Math.sin(a);
            lines.push(traceLine((x, y) => polesField(ps, x, y), x0, y0, { step: 0.08, maxSteps: 1400, box, stops }, 1));
          }
        }
      }
      lineCache = { key, lines };
      return lines;
    }
    function drawLine(g: CanvasRenderingContext2D, pts: V2[], col: string, width = 1.7): void {
      if (pts.length < 2) return;
      const px = pts.map((q) => plot.toPx(q[0], q[1]));
      g.save();
      g.strokeStyle = col;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      const spacing = 80;
      let acc = 30 + ((flow * 30) % spacing);
      g.fillStyle = col;
      const r = plot.rect;
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
    function drawLines(g: CanvasRenderingContext2D, alpha = 0.55): void {
      const col = withAlpha(COL.blue(), alpha * intro.value + (1 - intro.value) * 0.1);
      const lines = fieldLines();
      const show = Math.max(1, Math.round(lines.length * (reduced ? 1 : Math.min(1, intro.value * 1.2))));
      for (let i = 0; i < show; i++) drawLine(g, lines[i]!, col);
    }

    /* -------------------------------------------------------------- */
    /* Kompass                                                         */
    /* -------------------------------------------------------------- */

    /** Kompass in Pixeln; ang: Winkel der Nadel gegen oben, im Uhrzeigersinn. */
    function drawCompassPx(g: CanvasRenderingContext2D, cx: number, cy: number, rad: number, ang: number, rose = true): void {
      g.save();
      g.fillStyle = 'rgba(0,0,0,0.2)';
      g.beginPath();
      g.arc(cx + 2, cy + 4, rad + 3, 0, TAU);
      g.fill();
      // Gehäuse
      const gr = g.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, rad * 0.1, cx, cy, rad + 3);
      gr.addColorStop(0, '#e9d7a6');
      gr.addColorStop(1, '#a5803d');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(cx, cy, rad + 3, 0, TAU);
      g.fill();
      g.fillStyle = th().dark ? '#1c2533' : '#fbfaf6';
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.fill();
      if (rose) {
        g.strokeStyle = withAlpha(th().text, 0.35);
        g.lineWidth = 1;
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * TAU;
          const r0 = k % 4 === 0 ? rad * 0.78 : rad * 0.86;
          g.beginPath();
          g.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0);
          g.lineTo(cx + Math.sin(a) * rad * 0.95, cy - Math.cos(a) * rad * 0.95);
          g.stroke();
        }
      }
      // Nadel
      const len = rad * 0.82;
      const ux = Math.sin(ang);
      const uy = -Math.cos(ang);
      const w = Math.max(3, rad * 0.13);
      g.fillStyle = COL.north();
      g.beginPath();
      g.moveTo(cx + ux * len, cy + uy * len);
      g.lineTo(cx - uy * w, cy + ux * w);
      g.lineTo(cx + uy * w, cy - ux * w);
      g.closePath();
      g.fill();
      g.fillStyle = th().dark ? '#9aa4b2' : '#5b6472';
      g.beginPath();
      g.moveTo(cx - ux * len, cy - uy * len);
      g.lineTo(cx - uy * w, cy + ux * w);
      g.lineTo(cx + uy * w, cy - ux * w);
      g.closePath();
      g.fill();
      g.fillStyle = '#c9a24e';
      g.beginPath();
      g.arc(cx, cy, Math.max(2, rad * 0.08), 0, TAU);
      g.fill();
      // Glas
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, rad * 0.9, -2.6, -1.6);
      g.stroke();
      g.restore();
    }
    function drawSmallNeedles(g: CanvasRenderingContext2D): void {
      const b = plot.bounds;
      const cols = narrow() ? 9 : 13;
      const stepX = (b.xMax - b.xMin) / cols;
      const rows = Math.max(3, Math.round((b.yMax - b.yMin) / stepX));
      const stepY = (b.yMax - b.yMin) / rows;
      const ps = fieldPoles();
      const len = Math.min(11, plot.scale.x * stepX * 0.38);
      let k = 0;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++, k++) {
          const x = b.xMin + (i + 0.5) * stepX;
          const y = b.yMin + (j + 0.5) * stepY;
          if (insideMagnet(x, y, 0.5)) continue;
          const [bx, by] = polesField(ps, x, y);
          const target = compassAngle(bx, by, 0.0015);
          let a = needleAng.get(k) ?? 0;
          const d = angDiff(a, target);
          a += d * Math.min(1, frameDt * 5);
          if (reduced) a = target;
          needleAng.set(k, a);
          const [cx, cy] = plot.toPx(x, y);
          const ux = Math.sin(a);
          const uy = -Math.cos(a);
          g.save();
          g.fillStyle = th().dark ? 'rgba(30,38,52,0.85)' : 'rgba(255,255,255,0.85)';
          g.strokeStyle = withAlpha(th().text, 0.22);
          g.lineWidth = 1;
          g.beginPath();
          g.arc(cx, cy, len + 3, 0, TAU);
          g.fill();
          g.stroke();
          g.fillStyle = COL.north();
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
          g.restore();
        }
      }
    }
    /** Liegt (x | y) in einem der Magnete der Feld-Ansicht? */
    function insideMagnet(x: number, y: number, m = 0): boolean {
      if (p.mode !== 'field') return false;
      const bars: Magnet[] =
        p.arr === 'single'
          ? [{ x: 0, y: 0, ang: p.rot * DEG, len: 8, q: 1 }]
          : p.arr === 'horse'
            ? []
            : [
                { x: -6, y: 0, ang: 0, len: 7, q: 1 },
                { x: 6, y: 0, ang: 0, len: 7, q: 1 },
              ];
      for (const b of bars) {
        const dx = x - b.x;
        const dy = y - b.y;
        const u = dx * Math.cos(b.ang) + dy * Math.sin(b.ang);
        const v = -dx * Math.sin(b.ang) + dy * Math.cos(b.ang);
        if (Math.abs(u) < b.len / 2 + m && Math.abs(v) < BAR_W / 2 + m) return true;
      }
      if (p.arr === 'horse') {
        if (x > -5.2 - m && x < 3.2 + m && Math.abs(y) < 3.6 + m && !(x > -3.2 && Math.abs(y) < 1.6)) return true;
      }
      return false;
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 1: Anziehen und Abstoßen                                */
    /* -------------------------------------------------------------- */

    function drawTable(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      plot.resize();
      plot.begin();
      // Tischplatte
      const r = plot.rect;
      const [, ty] = plot.toPx(0, -BAR_W / 2 - 0.15);
      g.save();
      const wood = g.createLinearGradient(0, ty, 0, r.y + r.h);
      wood.addColorStop(0, th().dark ? '#4a3a2a' : '#e8d3b0');
      wood.addColorStop(1, th().dark ? '#2e241a' : '#cfae7c');
      g.fillStyle = wood;
      g.fillRect(r.x, ty, r.w, r.y + r.h - ty);
      g.strokeStyle = withAlpha(th().text, 0.25);
      g.beginPath();
      g.moveTo(r.x, ty);
      g.lineTo(r.x + r.w, ty);
      g.stroke();
      g.restore();
      if (p.lines) drawLines(g, 0.5);
      // Körper
      drawBar(g, magA());
      if (p.other === 'magnet') {
        const ang = turnTw.running ? turnFrom + (turnTo - turnFrom) * turnTw.value : bAng;
        drawBar(g, { x: bPos, y: 0, ang, len: BAR_LEN, q: 1 });
      } else {
        drawBlock(g, bPos, BAR_LEN * 0.8, p.other === 'iron' ? 'iron' : 'alu');
        // bei Eisen: die durch Influenz entstandenen Pole zart andeuten
        const ib = bodyB();
        if (ib && ib.q > 0.05) {
          const [n, s] = poles(ib);
          for (const [q, lbl, col] of [
            [n, 'N', COL.north()],
            [s, 'S', COL.south()],
          ] as const) {
            const [x, y] = plot.toPx(q.x, q.y);
            g.save();
            g.globalAlpha = Math.min(1, ib.q * 1.5);
            g.font = `800 13px ${th().font}`;
            g.fillStyle = col;
            g.textAlign = 'center';
            g.fillText(lbl, x, y - BAR_W * plot.scale.y * 0.5 - 6);
            g.restore();
          }
        }
      }
      // Kraftpfeile
      const F = forceB();
      if (p.other !== 'alu' && Math.abs(F) > 1e-4) {
        const s = clamp(Math.abs(F) * 3000, 14, Math.min(140, r.w * 0.16));
        const dir = Math.sign(F);
        const [bxp, byp] = plot.toPx(bPos, 0);
        const [axp] = plot.toPx(A_X, 0);
        const yArr = byp - BAR_W * plot.scale.y * 0.5 - 22;
        arrowPx(g, bxp, yArr, bxp + dir * s, yArr, COL.orange(), 3.5, 11);
        arrowPx(g, axp, yArr, axp - dir * s, yArr, COL.orange(), 3.5, 11);
        if (p.val) tag(g, (bxp + axp) / 2, yArr - 22, stateText(), COL.orange(), r, 13);
      } else if (p.other === 'alu') {
        const [bxp, byp] = plot.toPx(bPos, 0);
        tag(g, bxp, byp - BAR_W * plot.scale.y - 18, ctx.t('nothing'), th().muted, r, 13);
      }
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 2: Feldlinien und Kompass                               */
    /* -------------------------------------------------------------- */

    function drawHorseshoe(g: CanvasRenderingContext2D): void {
      const s = plot.scale.x;
      const [x0, y0] = plot.toPx(-3.2, 0);
      const outer = 3.6 * s;
      const innerR = 1.6 * s;
      const armEnd = plot.toPx(3.2, 0)[0];
      g.save();
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.translate(2, 4);
      horsePath(g, x0, y0, outer, innerR, armEnd);
      g.fill();
      g.restore();
      // Nordschenkel oben, Südschenkel unten
      for (const [top, col] of [
        [true, COL.north()],
        [false, COL.south()],
      ] as const) {
        g.save();
        g.beginPath();
        g.rect(0, top ? 0 : y0, surface.width, top ? y0 : surface.height);
        g.clip();
        horsePath(g, x0, y0, outer, innerR, armEnd);
        g.fillStyle = col;
        g.fill();
        g.strokeStyle = withAlpha(th().text, 0.35);
        g.lineWidth = 1;
        g.stroke();
        g.restore();
      }
      g.save();
      g.font = `800 ${Math.min(18, s * 1.1)}px ${th().font}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillStyle = textOn(COL.north(), th());
      g.fillText('N', armEnd - s * 0.9, y0 - (innerR + outer) / 2);
      g.fillStyle = textOn(COL.south(), th());
      g.fillText('S', armEnd - s * 0.9, y0 + (innerR + outer) / 2);
      g.restore();
    }
    function horsePath(g: CanvasRenderingContext2D, x0: number, y0: number, outer: number, innerR: number, armEnd: number): void {
      g.beginPath();
      g.moveTo(armEnd, y0 - outer);
      g.lineTo(x0, y0 - outer);
      g.arc(x0, y0, outer, -Math.PI / 2, Math.PI / 2, true);
      g.lineTo(armEnd, y0 + outer);
      g.lineTo(armEnd, y0 + innerR);
      g.lineTo(x0, y0 + innerR);
      g.arc(x0, y0, innerR, Math.PI / 2, -Math.PI / 2, false);
      g.lineTo(armEnd, y0 - innerR);
      g.closePath();
    }
    function drawFieldView(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      const r = plot.rect;
      const ps = fieldPoles();
      if (p.filings) {
        if (!filings.length) makeFilings();
        const u = reduced ? 1 : sprinkleTw.running ? sprinkleTw.value : 1;
        g.save();
        g.lineCap = 'round';
        const base = th().dark ? '#c8ced8' : '#3b4250';
        for (const f of filings) {
          if (insideMagnet(f.x, f.y, 0.1)) continue;
          const [bx, by] = polesField(ps, f.x, f.y);
          const B = Math.hypot(bx, by);
          const a = Math.atan2(by, bx);
          // beim Streuen fallen die Späne zufällig und drehen sich dann ein
          const ang = f.a0 + angDiff(f.a0, a) * u;
          const L0 = f.len * plot.scale.x * 0.42;
          const [cx, cy] = plot.toPx(f.x, f.y);
          const alpha = clamp(0.25 + Math.log10(B * 400 + 1) * 0.3, 0.2, 0.95);
          g.strokeStyle = withAlpha(base, alpha);
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(cx - Math.cos(ang) * L0, cy + Math.sin(ang) * L0);
          g.lineTo(cx + Math.cos(ang) * L0, cy - Math.sin(ang) * L0);
          g.stroke();
        }
        g.restore();
      }
      if (p.lines) drawLines(g, p.filings ? 0.45 : 0.6);
      if (p.needles) drawSmallNeedles(g);
      // Magnete
      if (p.arr === 'single') drawBar(g, { x: 0, y: 0, ang: p.rot * DEG, len: 8, q: 1 });
      else if (p.arr === 'horse') drawHorseshoe(g);
      else {
        drawBar(g, { x: -6, y: 0, ang: 0, len: 7, q: 1 });
        drawBar(g, { x: 6, y: 0, ang: p.arr === 'repel' ? Math.PI : 0, len: 7, q: 1 });
      }
      // großer Kompass
      const [cx, cy] = plot.toPx(p.cx, p.cy);
      const rad = narrow() ? 24 : 30;
      drawCompassPx(g, cx, cy, rad, cAng);
      if (p.val) {
        const B = Math.hypot(...field(p.cx, p.cy));
        tag(g, cx, cy + rad + 20, `${ctx.t('strength')}: ${strengthWord(B)}`, COL.purple(), r, 12);
      }
      plot.end();
      void ps;
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 3: Elementarmagnete                                     */
    /* -------------------------------------------------------------- */

    function nailRects(R: Rect): Rect[] {
      const n = +p.pieces;
      const w = R.w * 0.82;
      const h = Math.min(R.h * 0.34, w / 3.6);
      const gap = n > 1 ? Math.min(28, w * 0.05) : 0;
      const pw = (w - gap * (n - 1)) / n;
      const x0 = R.x + (R.w - w) / 2;
      const y0 = R.y + R.h * 0.4 - h / 2;
      return Array.from({ length: n }, (_, k) => ({ x: x0 + k * (pw + gap), y: y0, w: pw, h }));
    }
    function drawDomains(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const n = +p.pieces;
      const parts = nailRects(R);
      const whole: Rect = { x: parts[0]!.x, y: parts[0]!.y, w: parts.at(-1)!.x + parts.at(-1)!.w - parts[0]!.x, h: parts[0]!.h };
      const shakeX = hammerTw.running ? Math.sin(hammerTw.value * 60) * 4 * (1 - hammerTw.value) : 0;
      const heat = heatTw.running ? Math.sin(heatTw.value * Math.PI) : 0;
      const mz = magnetization(domains);
      g.save();
      g.translate(shakeX, 0);
      parts.forEach((P, k) => {
        // Nagel: Kopf links, Spitze rechts (nur beim ganzen bzw. an den Enden)
        g.save();
        const gr = g.createLinearGradient(0, P.y, 0, P.y + P.h);
        gr.addColorStop(0, '#b3bac4');
        gr.addColorStop(0.45, '#8a929e');
        gr.addColorStop(1, '#5a616b');
        g.fillStyle = gr;
        g.beginPath();
        const tip = k === n - 1 ? P.h * 0.7 : 0;
        g.moveTo(P.x + 6, P.y);
        g.lineTo(P.x + P.w - tip, P.y);
        g.lineTo(P.x + P.w, P.y + P.h / 2);
        g.lineTo(P.x + P.w - tip, P.y + P.h);
        g.lineTo(P.x + 6, P.y + P.h);
        g.quadraticCurveTo(P.x, P.y + P.h, P.x, P.y + P.h - 6);
        g.lineTo(P.x, P.y + 6);
        g.quadraticCurveTo(P.x, P.y, P.x + 6, P.y);
        g.closePath();
        g.shadowColor = 'rgba(0,0,0,0.25)';
        g.shadowOffsetY = 5;
        g.shadowBlur = 6;
        g.fill();
        g.shadowColor = 'transparent';
        if (heat > 0) {
          g.fillStyle = `rgba(255,${Math.round(120 - 60 * heat)},40,${0.6 * heat})`;
          g.fill();
        }
        g.strokeStyle = withAlpha(th().text, 0.35);
        g.lineWidth = 1;
        g.stroke();
        if (k === 0) {
          // Nagelkopf
          g.fillStyle = '#7c838d';
          roundRect(g, P.x - 8, P.y - P.h * 0.25, 10, P.h * 1.5, 3);
          g.fill();
          g.stroke();
        }
        g.restore();
      });
      // Elementarmagnete
      const cw = whole.w / DOM_COLS;
      const ch = whole.h / DOM_ROWS;
      const len = Math.min(cw, ch) * 0.38;
      const appear = reduced ? 1 : domIntro.value;
      for (const d of domains) {
        const col = Math.min(DOM_COLS - 1, Math.floor(d.x * DOM_COLS));
        const part = Math.min(n - 1, Math.floor((col / DOM_COLS) * n));
        const P = parts[part]!;
        const localX = (d.x * DOM_COLS - (part * DOM_COLS) / n) / (DOM_COLS / n);
        const cx = P.x + localX * (P.w - (part === n - 1 ? P.h * 0.5 : 0));
        const cy = P.y + d.y * P.h;
        const a = d.a + (heat > 0 ? (domRng() - 0.5) * heat * 0.6 : 0);
        const ux = Math.cos(a) * len * appear;
        const uy = -Math.sin(a) * len * appear;
        g.save();
        g.lineCap = 'round';
        g.lineWidth = Math.max(2, len * 0.42);
        g.strokeStyle = COL.north();
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + ux, cy + uy);
        g.stroke();
        g.strokeStyle = COL.south();
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx - ux, cy - uy);
        g.stroke();
        g.restore();
      }
      // Pole an den Enden jedes Stücks
      if (mz.M > 0.25) {
        const nRight = mz.mx > 0;
        parts.forEach((P) => {
          g.save();
          g.font = `800 ${Math.min(18, P.h * 0.5)}px ${th().font}`;
          g.textAlign = 'center';
          g.textBaseline = 'bottom';
          const yL = P.y - 6;
          g.fillStyle = nRight ? COL.south() : COL.north();
          g.fillText(nRight ? 'S' : 'N', P.x + 12, yL);
          g.fillStyle = nRight ? COL.north() : COL.south();
          g.fillText(nRight ? 'N' : 'S', P.x + P.w - 12, yL);
          g.restore();
        });
      }
      g.restore();
      // Streichmagnet
      if (strokeTw.running) {
        const u = strokeTw.value * 3;
        const xs = u - Math.floor(u);
        const lift = Math.sin(xs * Math.PI) < 0.15 ? 0 : 0;
        const mx = whole.x + xs * whole.w;
        const my = whole.y - whole.h * 0.9 - lift;
        const len2 = Math.min(160, whole.w * 0.35);
        const wid = Math.min(30, whole.h * 0.55);
        // Magnet schräg, Nordpol unten am Nagel
        drawBarPx(g, mx - len2 * 0.32, my - len2 * 0.25, Math.PI / 5, len2, wid);
      }
      // Büroklammern an der Spitze
      const clips = n === 1 ? paperclips(mz.M) : 0;
      const last = parts.at(-1)!;
      const tx = last.x + last.w + 6;
      const ty = last.y + last.h / 2;
      for (let k = 0; k < clips; k++) {
        const cx = tx + 6;
        const cy = ty + 8 + k * 17;
        g.save();
        g.strokeStyle = th().dark ? '#c3cad3' : '#6b7380';
        g.lineWidth = 2;
        roundRect(g, cx - 5, cy, 10, 18, 5);
        g.stroke();
        g.restore();
      }
      // Anzeige der Ordnung
      const by = Math.min(R.y + R.h - 34, whole.y + whole.h + 40);
      const bw = Math.min(R.w * 0.6, 340);
      const bx = R.x + (R.w - bw) / 2;
      g.save();
      g.fillStyle = withAlpha(th().text, 0.1);
      roundRect(g, bx, by, bw, 14, 7);
      g.fill();
      g.fillStyle = COL.purple();
      roundRect(g, bx, by, Math.max(14, bw * mz.M), 14, 7);
      g.fill();
      g.font = `700 13px ${th().font}`;
      g.fillStyle = th().text;
      g.textAlign = 'center';
      g.textBaseline = 'bottom';
      g.fillText(tr('domM', { m: N(mz.M * 100, 0) }), bx + bw / 2, by - 4);
      g.restore();
      if (heat > 0 && p.val) tag(g, R.x + R.w / 2, whole.y - 26, `≈ ${N(20 + 900 * heat, 0)} °C`, COL.orange(), R, 13);
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 4: Erde                                                 */
    /* -------------------------------------------------------------- */

    let aurora = 0;
    function drawEarth(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      plot.resize();
      plot.begin();
      const r = plot.rect;
      // Weltraum
      g.save();
      g.fillStyle = th().dark ? '#070b14' : '#101a2e';
      g.fillRect(r.x, r.y, r.w, r.h);
      const sr = rng(5);
      g.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 90; i++) {
        g.beginPath();
        g.arc(r.x + sr() * r.w, r.y + sr() * r.h, sr() * 1.2 + 0.3, 0, TAU);
        g.fill();
      }
      g.restore();
      const tilt = p.tilt * DEG;
      // Feldlinien
      if (p.lines) {
        const col = withAlpha('#7fb3ff', 0.6 * intro.value);
        for (const l of fieldLines()) drawLine(g, l, col, 1.5);
      }
      // Erdkugel
      const [ex, ey] = plot.toPx(0, 0);
      const er = plot.scale.x;
      g.save();
      const gr = g.createRadialGradient(ex - er * 0.35, ey - er * 0.35, er * 0.1, ex, ey, er);
      gr.addColorStop(0, '#5fa8e8');
      gr.addColorStop(0.7, '#2363a8');
      gr.addColorStop(1, '#0f3466');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(ex, ey, er, 0, TAU);
      g.fill();
      // Kontinente angedeutet
      g.save();
      g.beginPath();
      g.arc(ex, ey, er, 0, TAU);
      g.clip();
      const lr = rng(21);
      g.fillStyle = 'rgba(92,160,90,0.85)';
      for (let i = 0; i < 9; i++) {
        const a = lr() * TAU;
        const d = lr() * 0.75;
        g.beginPath();
        g.ellipse(ex + Math.cos(a) * d * er, ey + Math.sin(a) * d * er, er * (0.12 + lr() * 0.18), er * (0.08 + lr() * 0.14), lr() * Math.PI, 0, TAU);
        g.fill();
      }
      g.fillStyle = 'rgba(240,248,255,0.9)';
      g.beginPath();
      g.ellipse(ex, ey - er * 0.96, er * 0.42, er * 0.1, 0, 0, TAU);
      g.ellipse(ex, ey + er * 0.96, er * 0.5, er * 0.12, 0, 0, TAU);
      g.fill();
      g.restore();
      // Polarlichter
      if (!reduced) {
        for (const sgn of [1, -1]) {
          const ax = ex + Math.sin(tilt) * er * sgn * -1;
          const ay = ey - Math.cos(tilt) * er * sgn;
          const gl = g.createRadialGradient(ax, ay, er * 0.05, ax, ay, er * 0.5);
          const k = 0.25 + 0.15 * Math.sin(aurora * 2 + sgn);
          gl.addColorStop(0, `rgba(120,255,170,${k})`);
          gl.addColorStop(1, 'rgba(120,255,170,0)');
          g.fillStyle = gl;
          g.beginPath();
          g.arc(ax, ay, er * 0.5, 0, TAU);
          g.fill();
        }
      }
      // gedachter Stabmagnet im Inneren (Südpol oben!)
      drawBarPx(g, ex, ey, Math.PI / 2 - tilt, er * 1.1, er * 0.22, 0.75);
      // Erdachse
      g.strokeStyle = 'rgba(255,255,255,0.7)';
      g.setLineDash([6, 5]);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(ex, ey - er * 1.35);
      g.lineTo(ex, ey + er * 1.35);
      g.stroke();
      g.setLineDash([]);
      // Äquator
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.beginPath();
      g.moveTo(ex - er, ey);
      g.lineTo(ex + er, ey);
      g.stroke();
      g.restore();
      // Beschriftungen
      const lblCol = '#e8eefc';
      const small = narrow() ? 11 : 12;
      tag(g, narrow() || p.lat > 30 ? ex - er * 0.75 : ex, ey - er * 1.42, ctx.t('geoN'), th().text, r, small);
      tag(g, ex, ey + er * 1.42, ctx.t('geoS'), th().text, r, small);
      const msx = ex + Math.sin(tilt) * er * 1.0;
      const msy = ey - Math.cos(tilt) * er * 1.0;
      g.save();
      g.fillStyle = COL.south();
      g.beginPath();
      g.arc(msx, msy, 5, 0, TAU);
      g.fill();
      g.fillStyle = COL.north();
      g.beginPath();
      g.arc(ex - Math.sin(tilt) * er, ey + Math.cos(tilt) * er, 5, 0, TAU);
      g.fill();
      g.restore();
      if (!narrow()) {
        tag(g, msx - 80, msy - 14, ctx.t('magS'), COL.south(), r, small);
        tag(g, ex - Math.sin(tilt) * er + 70, ey + Math.cos(tilt) * er + 8, ctx.t('magN'), COL.north(), r, small);
        g.save();
        g.font = `600 ${small}px ${th().font}`;
        g.fillStyle = lblCol;
        g.textAlign = 'right';
        g.fillText(ctx.t('equator'), ex - er - 6, ey + 4);
        g.restore();
      }
      // Kompass auf der Oberfläche: Seitenansicht mit Boden-Linie
      const [cpx, cpy] = plot.toPx(...earthCompassPos());
      const rad = narrow() ? 22 : 30;
      const a = clamp(p.lat, -90, 90) * DEG;
      // Boden (Tangente)
      g.save();
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = 1.5;
      g.setLineDash([4, 4]);
      const tx = Math.sin(a);
      const ty = Math.cos(a);
      g.beginPath();
      g.moveTo(cpx - tx * rad * 1.8, cpy - ty * rad * 1.8);
      g.lineTo(cpx + tx * rad * 1.8, cpy + ty * rad * 1.8);
      g.stroke();
      g.restore();
      drawCompassPx(g, cpx, cpy, rad, cAng, false);
      if (p.val) {
        const I = inclination(Math.abs(p.lat));
        tag(g, cpx + (Math.cos(a) >= 0 ? 1 : -1) * (rad + 50), cpy - rad - 10, `${N(I, 0)}°`, COL.purple(), r, 13);
      }
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 5: Sortierspiel                                         */
    /* -------------------------------------------------------------- */

    function drawThing(g: CanvasRenderingContext2D, id: string, cx: number, cy: number, s: number): void {
      g.save();
      g.translate(cx, cy);
      g.lineJoin = 'round';
      g.lineCap = 'round';
      const steel = '#8f98a4';
      const dark = '#4d5560';
      switch (id) {
        case 'nail':
          g.fillStyle = steel;
          g.beginPath();
          g.moveTo(-s, -s * 0.08);
          g.lineTo(s * 0.8, -s * 0.08);
          g.lineTo(s, 0);
          g.lineTo(s * 0.8, s * 0.08);
          g.lineTo(-s, s * 0.08);
          g.fill();
          g.fillStyle = dark;
          g.fillRect(-s * 1.05, -s * 0.25, s * 0.1, s * 0.5);
          break;
        case 'clip':
          g.strokeStyle = steel;
          g.lineWidth = s * 0.07;
          roundRect(g, -s * 0.6, -s * 0.28, s * 1.2, s * 0.56, s * 0.28);
          g.stroke();
          roundRect(g, -s * 0.45, -s * 0.15, s * 0.85, s * 0.3, s * 0.15);
          g.stroke();
          break;
        case 'cent':
        case 'euro': {
          const r = s * (id === 'cent' ? 0.5 : 0.6);
          g.fillStyle = id === 'cent' ? '#b8693a' : '#d8c17a';
          g.beginPath();
          g.arc(0, 0, r, 0, TAU);
          g.fill();
          if (id === 'euro') {
            g.fillStyle = '#c7ccd2';
            g.beginPath();
            g.arc(0, 0, r * 0.68, 0, TAU);
            g.fill();
          }
          g.fillStyle = 'rgba(0,0,0,0.45)';
          g.font = `800 ${r * 0.8}px ${th().font}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText('1', 0, 1);
          break;
        }
        case 'scissors':
          g.strokeStyle = steel;
          g.lineWidth = s * 0.12;
          g.beginPath();
          g.moveTo(-s * 0.2, 0);
          g.lineTo(s, -s * 0.3);
          g.moveTo(-s * 0.2, 0);
          g.lineTo(s, s * 0.3);
          g.stroke();
          g.strokeStyle = '#d24a4a';
          g.lineWidth = s * 0.1;
          g.beginPath();
          g.arc(-s * 0.55, -s * 0.28, s * 0.22, 0, TAU);
          g.arc(-s * 0.55, s * 0.28, s * 0.22, 0, TAU);
          g.stroke();
          break;
        case 'can': {
          const gr = g.createLinearGradient(-s * 0.5, 0, s * 0.5, 0);
          gr.addColorStop(0, '#9aa3ad');
          gr.addColorStop(0.5, '#e2e6ea');
          gr.addColorStop(1, '#8a929c');
          g.fillStyle = gr;
          g.fillRect(-s * 0.5, -s * 0.6, s, s * 1.2);
          g.fillStyle = '#e0a63a';
          g.fillRect(-s * 0.5, -s * 0.25, s, s * 0.5);
          break;
        }
        case 'foil':
          g.fillStyle = '#d5dbe2';
          g.beginPath();
          for (let k = 0; k < 9; k++) {
            const a = (k / 9) * TAU;
            const rr = s * (0.45 + 0.15 * ((k * 37) % 5) / 5);
            g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
          }
          g.closePath();
          g.fill();
          g.strokeStyle = '#aab2bc';
          g.lineWidth = 1;
          g.stroke();
          break;
        case 'wire':
          g.strokeStyle = '#c56a2c';
          g.lineWidth = s * 0.08;
          g.beginPath();
          for (let k = 0; k <= 60; k++) {
            const t = k / 60;
            const x = -s * 0.8 + t * s * 1.6;
            g.lineTo(x, Math.sin(t * 6 * TAU) * s * 0.25);
          }
          g.stroke();
          break;
        case 'ring':
          g.strokeStyle = '#e2b53e';
          g.lineWidth = s * 0.14;
          g.beginPath();
          g.ellipse(0, 0, s * 0.45, s * 0.4, 0, 0, TAU);
          g.stroke();
          break;
        case 'eraser':
          g.fillStyle = '#ef8aa6';
          roundRect(g, -s * 0.6, -s * 0.3, s * 1.2, s * 0.6, s * 0.1);
          g.fill();
          g.fillStyle = '#5a8fd6';
          g.fillRect(-s * 0.1, -s * 0.3, s * 0.7, s * 0.6);
          break;
        case 'pencil':
          g.fillStyle = '#f2c94c';
          g.fillRect(-s, -s * 0.11, s * 1.6, s * 0.22);
          g.fillStyle = '#e8c9a0';
          g.beginPath();
          g.moveTo(s * 0.6, -s * 0.11);
          g.lineTo(s, 0);
          g.lineTo(s * 0.6, s * 0.11);
          g.fill();
          g.fillStyle = '#333';
          g.beginPath();
          g.moveTo(s * 0.88, -s * 0.03);
          g.lineTo(s, 0);
          g.lineTo(s * 0.88, s * 0.03);
          g.fill();
          break;
        case 'glass': {
          const gr = g.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, 0, 0, s * 0.42);
          gr.addColorStop(0, 'rgba(255,255,255,0.95)');
          gr.addColorStop(0.5, 'rgba(110,200,220,0.75)');
          gr.addColorStop(1, 'rgba(40,120,160,0.85)');
          g.fillStyle = gr;
          g.beginPath();
          g.arc(0, 0, s * 0.42, 0, TAU);
          g.fill();
          break;
        }
      }
      g.restore();
    }
    function drawSort(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const cx = R.x + R.w / 2;
      // Hufeisenmagnet oben (Öffnung nach unten)
      const mw = Math.min(R.w * 0.42, 220);
      const mh = Math.min(R.h * 0.3, 120);
      const top = R.y + 16;
      g.save();
      const t = mw * 0.24;
      for (const [side, col] of [
        [-1, COL.north()],
        [1, COL.south()],
      ] as const) {
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(cx, top);
        g.lineTo(cx + side * (mw / 2 - t * 0.0), top);
        g.lineTo(cx + side * (mw / 2), top + mh);
        g.lineTo(cx + side * (mw / 2 - t), top + mh);
        g.lineTo(cx + side * (mw / 2 - t), top + t);
        g.lineTo(cx, top + t);
        g.closePath();
        g.fill();
        g.fillStyle = textOn(col, th());
        g.font = `800 ${Math.min(18, t * 0.6)}px ${th().font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(side < 0 ? 'N' : 'S', cx + side * (mw / 2 - t / 2), top + mh - t * 0.45);
      }
      g.restore();
      if (idx >= order.length) {
        g.save();
        g.font = `800 ${narrow() ? 20 : 26}px ${th().font}`;
        g.fillStyle = COL.purple();
        g.textAlign = 'center';
        g.fillText(tr('sortScore', { k: correct, n: asked }), cx, R.y + R.h * 0.62);
        g.restore();
        // magnetische Gegenstände hängen am Magneten
        const mags = THINGS.filter((q) => q.magnetic);
        mags.forEach((q, k) => drawThing(g, q.id, cx + (k - (mags.length - 1) / 2) * Math.min(56, R.w / 8), top + mh + 22, Math.min(24, R.w / 18)));
        return;
      }
      const thing = order[idx]!;
      const s = Math.min(R.w, R.h) * 0.16;
      const restY = R.y + R.h * 0.72;
      const stickY = top + mh + s * 0.6;
      let y = restY;
      let rot = 0;
      if (answered !== null) {
        const u = reduced ? 1 : flyTw.value;
        if (thing.magnetic) y = restY + (stickY - restY) * ease.inOutCubic(u);
        else {
          y = restY + Math.sin(u * Math.PI) * -s * 0.25;
          rot = Math.sin(u * Math.PI * 3) * 0.08 * (1 - u);
        }
      }
      // Tisch
      g.save();
      g.fillStyle = th().dark ? '#3b3024' : '#e9d6b4';
      g.fillRect(R.x + 10, restY + s * 0.65, R.w - 20, 8);
      g.restore();
      const pop = reduced ? 1 : popTw.value;
      g.save();
      g.translate(cx, y);
      g.rotate(rot);
      g.scale(pop, pop);
      drawThing(g, thing.id, 0, 0, s);
      g.restore();
      g.save();
      g.font = `700 ${narrow() ? 15 : 17}px ${th().font}`;
      g.fillStyle = th().text;
      g.textAlign = 'center';
      g.fillText(ctx.lang === 'de' ? thing.de : thing.en, cx, restY + s * 0.65 + 32);
      g.font = `600 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.fillText(`${idx + 1} / ${order.length}`, R.x + R.w - 34, R.y + R.h - 14);
      g.restore();
      if (answered !== null) {
        tag(g, cx, restY + s * 0.65 + 60, answered ? ctx.t('sortRight') : ctx.t('sortWrong'), answered ? COL.south() : COL.north(), R, 15);
      }
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
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${z}px ${th().font}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 11 && width(s) > maxW) s -= 0.5;
      g.save();
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of sg.s.split(/(?<= )/)) {
          const w = g.measureText(wd).width;
          if (cx + w > x + maxW && cx > x + 20) {
            cx = x;
            cy += s * 1.38;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += w;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }
    function drawInfo(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.blue());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const gap = (h = 5) => (y += h);
      switch (p.mode) {
        case 'poles': {
          line([{ s: ctx.t('polesT'), c: COL.blue(), w: 800 }], 1);
          line([{ s: stateText(), c: COL.orange(), w: 800 }], 1);
          gap();
          line([{ s: ctx.t(p.other === 'iron' ? 'ruleIron' : p.other === 'alu' ? 'ruleAlu' : 'ruleP'), w: 600 }], -1);
          if (p.other !== 'alu') line([{ s: ctx.t('forceBoth'), c: t.muted }], -2);
          gap();
          line([{ s: ctx.t('polesHow'), c: t.muted }], -2);
          break;
        }
        case 'field': {
          line([{ s: ctx.t('fieldT'), c: COL.blue(), w: 800 }], 1);
          line([{ s: ctx.t('fieldRule'), w: 600 }], -1);
          gap();
          if (p.arr === 'attract') line([{ s: ctx.t('fieldA'), c: t.text }], -1.5);
          if (p.arr === 'repel') line([{ s: ctx.t('fieldR'), c: t.text }], -1.5);
          if (p.arr === 'horse') line([{ s: ctx.t('fieldH'), c: t.text }], -1.5);
          if (p.filings) line([{ s: ctx.t('fieldFil'), c: t.text }], -1.5);
          gap();
          line([{ s: ctx.t('fieldHow'), c: t.muted }], -2);
          break;
        }
        case 'domains': {
          const mz = magnetization(domains);
          line([{ s: ctx.t('domT'), c: COL.blue(), w: 800 }], 1);
          const clips = paperclips(mz.M);
          line([{ s: +p.pieces === 1 ? (clips > 0 ? tr('domClips', { n: clips }) : ctx.t('domNo')) : ctx.t('domBreak'), c: COL.purple(), w: 800 }], 0);
          gap();
          line([{ s: ctx.t('domRule'), w: 600 }], -1);
          if (lastEvent === 'heat') line([{ s: ctx.t('domHot'), c: COL.orange() }], -1.5);
          if (lastEvent === 'hammer') line([{ s: ctx.t('domHam'), c: COL.orange() }], -1.5);
          gap();
          line([{ s: ctx.t('domHow'), c: t.muted }], -2);
          break;
        }
        case 'earth': {
          line([{ s: ctx.t('earthT'), c: COL.blue(), w: 800 }], 1);
          line([{ s: ctx.t('earthRule'), w: 600 }], -1);
          gap();
          if (p.val) {
            line([{ s: tr('earthIncl', { i: N(inclination(Math.abs(p.lat)), 0) }), c: COL.purple(), w: 700 }], -1);
            line([{ s: tr('earthStr', { r: N(fieldRatio(p.lat), 2) }), c: t.text, w: 600 }], -1.5);
          }
          if (p.tilt > 0) line([{ s: tr('earthDecl', { t: N(p.tilt, 0) }), c: t.muted }], -2);
          gap();
          if (!narrow()) line([{ s: ctx.t('earthHow'), c: t.muted }], -2);
          break;
        }
        case 'sort': {
          line([{ s: ctx.t('sortT'), c: COL.blue(), w: 800 }], 1);
          if (idx >= order.length) {
            line([{ s: tr('sortScore', { k: correct, n: asked }), c: COL.purple(), w: 800 }], 1);
            gap();
            line([{ s: ctx.t('sortDone'), w: 600 }], -1);
            break;
          }
          const thing = order[idx]!;
          if (answered === null) line([{ s: ctx.t('sortHow'), c: t.text, w: 600 }], -1);
          else {
            line([{ s: answered ? ctx.t('sortRight') : ctx.t('sortWrong'), c: answered ? COL.south() : COL.north(), w: 800 }, { s: `  ${ctx.lang === 'de' ? thing.de : thing.en} ${ctx.t(thing.magnetic ? 'sortYes' : 'sortNo')}.`, w: 600 }], 0);
            line([{ s: ctx.lang === 'de' ? thing.whyDe : thing.whyEn, c: t.text }], -1);
          }
          if (asked) line([{ s: tr('sortScore', { k: correct, n: asked }), c: t.muted, w: 600 }], -1.5);
          break;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Tastatur                                         */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      switch (p.mode) {
        case 'poles':
          ctx.readout('what', stateText());
          ctx.readout('rule', ctx.t(p.other === 'iron' ? 'ruleIron' : p.other === 'alu' ? 'ruleAlu' : 'ruleP'));
          ctx.readout('extra', ctx.t('forceBoth'));
          break;
        case 'field': {
          const B = Math.hypot(...field(p.cx, p.cy));
          ctx.readout('what', `${ctx.t('strength')}: ${strengthWord(B)}`);
          ctx.readout('rule', ctx.t('fieldRule'));
          ctx.readout('extra', ctx.t(p.arr === 'attract' ? 'fieldA' : p.arr === 'repel' ? 'fieldR' : p.arr === 'horse' ? 'fieldH' : 'fieldFil'));
          break;
        }
        case 'domains': {
          const mz = magnetization(domains);
          ctx.readout('what', tr('domM', { m: N(mz.M * 100, 0) }));
          ctx.readout('rule', ctx.t('domRule'));
          ctx.readout('extra', +p.pieces > 1 ? ctx.t('domBreak') : paperclips(mz.M) > 0 ? tr('domClips', { n: paperclips(mz.M) }) : ctx.t('domNo'));
          break;
        }
        case 'earth':
          ctx.readout('what', tr('earthIncl', { i: N(inclination(Math.abs(p.lat)), 0) }));
          ctx.readout('rule', ctx.t('earthRule'));
          ctx.readout('extra', tr('earthStr', { r: N(fieldRatio(p.lat), 2) }));
          break;
        case 'sort':
          ctx.readout('what', asked ? tr('sortScore', { k: correct, n: asked }) : ctx.t('sortHow'));
          ctx.readout('rule', ctx.t('sortDone'));
          ctx.readout('extra', idx < order.length ? `${idx + 1} / ${order.length}` : '–');
          break;
      }
    }
    function keys(): void {
      const de = ctx.lang === 'de';
      if (p.mode === 'poles') {
        const mv = (dx: number) => () => {
          lastDrag = performance.now();
          ctx.set({ bx: Math.round(clamp(bPos + dx, bLeftLimit(), B_MAX) * 10) / 10 });
        };
        ctx.setKeyTargets([
          { id: 'bl', label: de ? 'Rechten Körper 1 cm nach links' : 'Right body 1 cm to the left', activate: mv(-1) },
          { id: 'br', label: de ? 'Rechten Körper 1 cm nach rechts' : 'Right body 1 cm to the right', activate: mv(1) },
        ]);
      } else if (p.mode === 'field') {
        const mv = (dx: number, dy: number) => () => ctx.set({ cx: clamp(p.cx + dx, -11, 11), cy: clamp(p.cy + dy, -7, 7) });
        ctx.setKeyTargets([
          { id: 'cl', label: de ? 'Kompass nach links' : 'Compass left', activate: mv(-1, 0) },
          { id: 'cr', label: de ? 'Kompass nach rechts' : 'Compass right', activate: mv(1, 0) },
          { id: 'cu', label: de ? 'Kompass nach oben' : 'Compass up', activate: mv(0, 1) },
          { id: 'cd', label: de ? 'Kompass nach unten' : 'Compass down', activate: mv(0, -1) },
        ]);
      } else if (p.mode === 'earth') {
        ctx.setKeyTargets([
          { id: 'n', label: de ? 'Kompass nach Norden' : 'Compass to the north', activate: () => ctx.set({ lat: clamp(p.lat + 5, -90, 90) }) },
          { id: 's', label: de ? 'Kompass nach Süden' : 'Compass to the south', activate: () => ctx.set({ lat: clamp(p.lat - 5, -90, 90) }) },
        ]);
      } else ctx.setKeyTargets([]);
    }
    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || changed.has('mode')) {
          fitRange();
          intro.play();
          needleAng.clear();
          lineCache = null;
          ctx.clock.play();
        }
        if (changed.has('bx') || source === 'init' || source === 'replace') {
          bPos = clamp(p.bx, bLeftLimit(), B_MAX);
          bVel = 0;
          stuck = false;
          if (source !== 'input') lastDrag = performance.now() - 200;
        }
        if (changed.has('flip')) {
          if (source === 'input' || source === 'sim') {
            turnFrom = bAng;
            bAng = p.flip ? Math.PI : 0;
            turnTo = turnFrom + angDiff(turnFrom, bAng);
            turnTw.play();
            lastDrag = performance.now() - 200;
            stuck = false;
          } else bAng = p.flip ? Math.PI : 0;
        }
        if (changed.has('other')) {
          stuck = false;
          lastDrag = performance.now() - 200;
          bPos = Math.max(bPos, bLeftLimit());
        }
        if (['arr', 'rot', 'mode'].some((k) => changed.has(k)) || source === 'init' || source === 'replace') {
          filings = [];
          if (p.mode === 'field') sprinkleTw.play();
        }
        if (changed.has('mode') && p.mode === 'domains') domIntro.play();
        if (changed.has('pieces')) domIntro.play();
        if (changed.has('round') || (changed.has('mode') && p.mode === 'sort') || source === 'init' || source === 'replace') resetSort();
        if (changed.has('mode') && p.mode === 'earth') cAng = compassTarget() + 1.2;
        keys();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'turn') {
          ctx.set({ flip: !p.flip });
        }
        if (id === 'release') {
          lastDrag = -1e9;
          stuck = false;
          if (Math.abs(forceB()) < FRICTION) ctx.announce(ctx.t('tooFar'));
        }
        if (id === 'sprinkle') {
          filings = [];
          if (!p.filings) ctx.set({ filings: true });
          sprinkleTw.play();
        }
        if (id === 'stroke') {
          strokeLast = 0;
          strokeTw.play();
          lastEvent = 'stroke';
          if (reduced) {
            for (let i = 0; i < 6; i++) align(domains, Math.PI, 0.5, 0, 1, domRng);
            strokeTw.finish();
          }
        }
        if (id === 'hammer') {
          shake(domains, 0.9, domRng);
          hammerTw.play();
          lastEvent = 'hammer';
        }
        if (id === 'heat') {
          heatTw.play();
          lastEvent = 'heat';
          shake(domains, Math.PI, domRng);
        }
        if (id === 'yes') answer(true);
        if (id === 'no') answer(false);
        if (id === 'next') {
          if (idx >= order.length) ctx.set({ round: p.round >= 99 ? 1 : p.round + 1 });
          else nextThing();
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        // Bei „reduzierter Bewegung“ wandern Feldlinienpfeile und Polarlicht nicht.
        if (!reduced) {
          flow += dt;
          aurora += dt;
        }
        frameDt = Math.min(0.1, dt);
        stepTable(dt);
        if (p.mode === 'field' || p.mode === 'earth') stepCompass(dt);
        if (p.mode === 'domains') {
          const was = strokeTw.running;
          stepDomains();
          if (was) updateReadouts();
        }
        if (p.mode === 'poles') updateReadouts();
      },
      resetView() {
        fitRange();
      },
      render() {
        lay = layout();
        const g = surface.begin();
        if (p.mode === 'poles') drawTable(g, lay.scene);
        else if (p.mode === 'field') drawFieldView(g, lay.scene);
        else if (p.mode === 'domains') drawDomains(g, inner(lay.scene, 0));
        else if (p.mode === 'earth') drawEarth(g, lay.scene);
        else drawSort(g, lay.scene);
        drawInfo(g, lay.card);
      },
      destroy: () => surface.destroy(),
    };
  },
});
