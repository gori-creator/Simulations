import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, scaledSprite, seededRandom, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  emits,
  fitLine,
  frequencyOf,
  maxKineticEnergy,
  metalOf,
  photoCurrent,
  photonEnergy,
  PLANCK_EV,
  saturationCurrent,
  thresholdFrequency,
  thresholdWavelength,
  wavelengthToRgb,
  zeroVoltage,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Diagramm E_kin über f: f in 10¹⁴ Hz, E in eV. */
const F_AXIS = 12.5;
const E_MIN = -5;
const E_MAX = 3.5;
/** Diagramm I über U. */
const U_AXIS = 4;
const I_AXIS = 2.2;
/** „Strom null“: unter der Anzeigegenauigkeit des Strommessers (0,005 nA, zeigt „0,00 nA“). */
const I_ZERO = 0.005;
/** Wellenlängen der automatischen Messreihe in nm. */
const AUTO_LAM = [250, 280, 320, 360, 400, 450, 500, 550, 600];
/** Elektronen im Bild: Beschleunigung je Volt Gegenspannung (Modelleinheiten). */
const G_EL = 1.4;

type Pt = { x: number; y: number };

interface Lay {
  side: boolean;
  scene: Rect;
  a: Rect;
  b: Rect;
}

interface Geo {
  r: Rect;
  sm: boolean;
  /** Glaskolben. */
  tx: number;
  ty: number;
  tw: number;
  th: number;
  cy: number;
  /** Kathode: Mittelpunkt des Bogens, Radius, halber Öffnungswinkel. */
  kx: number;
  kr: number;
  ka: number;
  /** Anode: x und halbe Höhe. */
  ax: number;
  ah: number;
  /** Runder Glaskolben des Fotos (Mitte, Radius) oder `null` (gezeichnete Röhre). */
  bulb: { x: number; y: number; r: number } | null;
  /** Lampe. */
  lx: number;
  ly: number;
  /** Schaltung. */
  wy: number;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  mx: number;
  my: number;
  mr: number;
}

interface Photon {
  /** Position auf der Kathode (−1 … 1) und Fortschritt. */
  j: number;
  s: number;
}

interface Electron {
  j: number;
  x: number;
  v: number;
  /** Ausblenden nach Ankunft (1 → 0). */
  fade: number;
  hit: boolean;
}

interface Point {
  lam: number;
  U: number;
  born: number;
}

/**
 * Photoeffekt mit der Gegenfeldmethode: Lampe mit wählbarer Wellenlänge und
 * Intensität beleuchtet die Kathode einer Fotozelle; Photonen lösen Elektronen
 * aus (oder nicht), die gegen die Gegenspannung zur Anode laufen oder
 * umkehren. Strommesser und Spannungsquelle mit Drehknopf; Diagramme
 * E_kin über f (Einstein-Gerade mit Messpunkten) und Fotostrom I über U.
 */
export default defineSimulation({
  id: 'photoeffekt',
  animated: true,
  hint: L('Tipp: Am Drehknopf der Spannungsquelle lässt sich die Gegenspannung mit Maus oder Finger einstellen.', 'Tip: turn the knob of the power supply with the mouse or a finger to set the retarding voltage.'),
  layout: { aspect: 1.5, aspectNarrow: 0.45 },
  images: { meter: 'manometer.webp', cell: 'fotozelle.webp', lamp: 'lampe.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'metal',
      type: 'choice',
      label: L('Kathodenmetall', 'Cathode metal'),
      options: [
        { value: 'Cs', label: L('Cäsium', 'Caesium') },
        { value: 'K', label: L('Kalium', 'Potassium') },
        { value: 'Na', label: L('Natrium', 'Sodium') },
        { value: 'Li', label: L('Lithium', 'Lithium') },
        { value: 'Zn', label: L('Zink', 'Zinc') },
        { value: 'Cu', label: L('Kupfer', 'Copper') },
      ],
      default: 'Cs',
    },
    { key: 'lam', type: 'number', label: L('Wellenlänge λ', 'Wavelength λ'), help: L('Unter 380 nm: ultraviolettes Licht (unsichtbar).', 'Below 380 nm: ultraviolet light (invisible).'), min: 250, max: 700, step: 1, default: 400, unit: 'nm' },
    { key: 'P', type: 'number', label: L('Intensität', 'Intensity'), help: L('Mehr Licht: mehr Photonen pro Sekunde – aber jedes hat dieselbe Energie.', 'More light: more photons per second – but each has the same energy.'), min: 0, max: 100, step: 5, default: 60, unit: '%' },
    { key: 'U', type: 'number', label: L('Gegenspannung U', 'Retarding voltage U'), help: L('Oder: am Drehknopf der Spannungsquelle drehen.', 'Or turn the knob of the power supply.'), min: 0, max: 4, step: 0.01, default: 0, unit: 'V' },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  actions: [
    { id: 'zero', label: L('Gegenspannung abgleichen (I = 0)', 'Adjust the voltage (I = 0)'), primary: true },
    { id: 'rec', label: L('Messwert aufnehmen', 'Record a data point') },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series') },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data') },
  ],
  readouts: [
    { key: 'photon', label: L('Photonen', 'Photons'), spoiler: true },
    { key: 'ekin', label: L('Bewegungsenergie der Elektronen', 'Kinetic energy of the electrons'), spoiler: true },
    { key: 'now', label: L('Messgeräte', 'Meters') },
    { key: 'table', label: L('Messtabelle', 'Table of measurements') },
    { key: 'fit', label: L('Auswertung', 'Analysis'), spoiler: true },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'start', label: L('Cäsium, violettes Licht (400 nm)', 'Caesium, violet light (400 nm)'), values: {} },
    { id: 'stop', label: L('Gegenspannung 1,16 V: Strom null', 'Retarding voltage 1.16 V: no current'), values: { U: 1.16 } },
    { id: 'bright', label: L('Volle Intensität (100 %)', 'Full intensity (100 %)'), values: { P: 100, U: 0.6 } },
    { id: 'red', label: L('Rotes Licht: keine Elektronen', 'Red light: no electrons'), values: { lam: 650 } },
    { id: 'zn', label: L('Zink: erst im UV', 'Zinc: only in the UV'), values: { metal: 'Zn', lam: 250 } },
  ],
  strings: {
    de: {
      canvas:
        'Fotozelle: Eine Lampe beleuchtet die gewölbte Kathode mit Licht wählbarer Wellenlänge. Photonen lösen Elektronen aus, die gegen die Gegenspannung zur Anode fliegen oder vorher umkehren. Darunter Spannungsquelle mit Drehknopf und Strommesser. Rechts das Diagramm Bewegungsenergie über Frequenz mit der Einstein-Geraden und das Diagramm Fotostrom über Gegenspannung.',
      Cs: 'Cäsium',
      K: 'Kalium',
      Na: 'Natrium',
      Li: 'Lithium',
      Zn: 'Zink',
      Cu: 'Kupfer',
      cathode: 'Kathode',
      anode: 'Anode',
      none: 'E_[Ph] < W_[A]: keine Elektronen',
      noneS: 'keine Elektronen',
      zeroOk: 'I = 0: e · U = E_[kin,max]',
      dark: 'Lampe aus',
      knob: 'drehen',
      uv: 'UV',
      chartE: 'Bewegungsenergie über Frequenz',
      chartES: 'E_[kin] über f',
      chartI: 'Fotostrom über Gegenspannung',
      chartIS: 'I über U',
      axisF: 'f in 10^14 Hz',
      axisE: 'E_[kin] in eV',
      axisU: 'U in V',
      axisI: 'I in nA',
      full: '100 %',
      empty: '„Gegenspannung abgleichen“, dann „Messwert aufnehmen“.',
      emptyS: 'Messwerte aufnehmen …',
      notZero: 'Erst Gegenspannung abgleichen: I muss null sein.',
      notZeroS: 'Erst I = 0 einstellen!',
      lampOff: 'Lampe aus: Ohne Licht ist der Strom immer null.',
      lampOffS: 'Erst die Lampe einschalten!',
      fitLab: 'Steigung h ≈ {h} · 10^−15 eV·s',
      fitLabS: 'h ≈ {h} · 10^−15 eV·s',
      fG: 'f_[G]',
      WA: '−W_[A]',
      vis: 'sichtbar',
      photon:
        '<var>f</var> = <span class="frac"><span><var>c</var></span><span><var>λ</var></span></span> = <span class="frac"><span>2,998 · 10<sup>8</sup> m/s</span><span>{lam} nm</span></span> = {f} Hz<br><var>E</var><sub>Ph</sub> = <var>h</var> · <var>f</var> = 4,136 · 10<sup>−15</sup> eV · s · {f} Hz = <strong>{E} eV</strong><br>Intensität {P} %: etwa {n} Photonen pro Sekunde im Bild – mehr Licht heißt mehr Photonen, nicht energiereichere.',
      ekinYes:
        '<var>E</var><sub>kin,max</sub> = <var>h</var> · <var>f</var> − <var>W</var><sub>A</sub> = {E} eV − {W} eV = <strong>{K} eV</strong><br>Gegenfeld: Der Strom verschwindet bei <var>U</var><sub>G</sub> = <span class="frac"><span><var>E</var><sub>kin,max</sub></span><span><var>e</var></span></span> = <strong>{K} V</strong>.<br>Grenzfrequenz <var>f</var><sub>G</sub> = <span class="frac"><span><var>W</var><sub>A</sub></span><span><var>h</var></span></span> = {fG} Hz (<var>λ</var><sub>G</sub> = {lG} nm).',
      ekinNo:
        '<var>E</var><sub>Ph</sub> = {E} eV ist kleiner als die Austrittsarbeit <var>W</var><sub>A</sub> = {W} eV: <strong>Es werden keine Elektronen ausgelöst</strong> – auch nicht bei größerer Intensität.<br>Grenzfrequenz <var>f</var><sub>G</sub> = <span class="frac"><span><var>W</var><sub>A</sub></span><span><var>h</var></span></span> = {fG} Hz, also <var>λ</var> &lt; {lG} nm nötig.',
      now: '<var>U</var> = {U} V · <var>I</var> = {I} nA{z}',
      nowZero: ' – Strom null',
      thF: 'f in 10¹⁴ Hz',
      thL: 'λ in nm',
      thU: '<var>U</var><sub>G</sub> in V',
      thE: '<var>E</var><sub>kin,max</sub> in eV',
      tableNone: 'Noch keine Messwerte – Gegenspannung abgleichen und „Messwert aufnehmen“ oder „Messreihe automatisch“.',
      fitFew: 'Für die Auswertung sind mindestens zwei Messpunkte mit Elektronen nötig.',
      fit: 'Ausgleichsgerade <var>E</var><sub>kin</sub> = <var>h</var> · <var>f</var> − <var>W</var><sub>A</sub>: Steigung <strong><var>h</var> ≈ {h} · 10<sup>−15</sup> eV · s</strong> = {hJ} · 10<sup>−34</sup> J · s (Tabellenwert 4,136 · 10<sup>−15</sup> eV · s).<br>Achsenabschnitt −<var>W</var><sub>A</sub> ≈ {b} eV, also <strong><var>W</var><sub>A</sub> ≈ {W} eV</strong>, Grenzfrequenz <var>f</var><sub>G</sub> ≈ {fG} · 10<sup>14</sup> Hz.',
    },
    en: {
      canvas:
        'Photocell: a lamp illuminates the curved cathode with light of selectable wavelength. Photons release electrons which fly against the retarding voltage to the anode or turn back. Below: power supply with a knob and an ammeter. On the right the graph of kinetic energy against frequency with Einstein’s line and the graph of photocurrent against retarding voltage.',
      Cs: 'Caesium',
      K: 'Potassium',
      Na: 'Sodium',
      Li: 'Lithium',
      Zn: 'Zinc',
      Cu: 'Copper',
      cathode: 'cathode',
      anode: 'anode',
      none: 'E_[Ph] < W_[A]: no electrons',
      noneS: 'no electrons',
      zeroOk: 'I = 0: e · U = E_[kin,max]',
      dark: 'lamp off',
      knob: 'turn',
      uv: 'UV',
      chartE: 'Kinetic energy against frequency',
      chartES: 'E_[kin] against f',
      chartI: 'Photocurrent against voltage',
      chartIS: 'I against U',
      axisF: 'f in 10^14 Hz',
      axisE: 'E_[kin] in eV',
      axisU: 'U in V',
      axisI: 'I in nA',
      full: '100 %',
      empty: '“Adjust the voltage”, then “Record a data point”.',
      emptyS: 'Record data …',
      notZero: 'Adjust the voltage first: I must be zero.',
      notZeroS: 'Set I = 0 first!',
      lampOff: 'Lamp off: without light the current is always zero.',
      lampOffS: 'Switch the lamp on first!',
      fitLab: 'slope h ≈ {h} · 10^−15 eV·s',
      fitLabS: 'h ≈ {h} · 10^−15 eV·s',
      fG: 'f_[G]',
      WA: '−W_[A]',
      vis: 'visible',
      photon:
        '<var>f</var> = <span class="frac"><span><var>c</var></span><span><var>λ</var></span></span> = <span class="frac"><span>2.998 · 10<sup>8</sup> m/s</span><span>{lam} nm</span></span> = {f} Hz<br><var>E</var><sub>Ph</sub> = <var>h</var> · <var>f</var> = 4.136 · 10<sup>−15</sup> eV · s · {f} Hz = <strong>{E} eV</strong><br>Intensity {P} %: about {n} photons per second on screen – more light means more photons, not more energetic ones.',
      ekinYes:
        '<var>E</var><sub>kin,max</sub> = <var>h</var> · <var>f</var> − <var>W</var><sub>A</sub> = {E} eV − {W} eV = <strong>{K} eV</strong><br>Retarding field: the current vanishes at <var>U</var><sub>G</sub> = <span class="frac"><span><var>E</var><sub>kin,max</sub></span><span><var>e</var></span></span> = <strong>{K} V</strong>.<br>Threshold frequency <var>f</var><sub>G</sub> = <span class="frac"><span><var>W</var><sub>A</sub></span><span><var>h</var></span></span> = {fG} Hz (<var>λ</var><sub>G</sub> = {lG} nm).',
      ekinNo:
        '<var>E</var><sub>Ph</sub> = {E} eV is smaller than the work function <var>W</var><sub>A</sub> = {W} eV: <strong>no electrons are released</strong> – not even at higher intensity.<br>Threshold frequency <var>f</var><sub>G</sub> = <span class="frac"><span><var>W</var><sub>A</sub></span><span><var>h</var></span></span> = {fG} Hz, so <var>λ</var> &lt; {lG} nm is needed.',
      now: '<var>U</var> = {U} V · <var>I</var> = {I} nA{z}',
      nowZero: ' – no current',
      thF: 'f in 10¹⁴ Hz',
      thL: 'λ in nm',
      thU: '<var>U</var><sub>G</sub> in V',
      thE: '<var>E</var><sub>kin,max</sub> in eV',
      tableNone: 'No data yet – adjust the voltage and “Record a data point”, or “Automatic series”.',
      fitFew: 'The analysis needs at least two data points with electrons.',
      fit: 'Line of best fit <var>E</var><sub>kin</sub> = <var>h</var> · <var>f</var> − <var>W</var><sub>A</sub>: slope <strong><var>h</var> ≈ {h} · 10<sup>−15</sup> eV · s</strong> = {hJ} · 10<sup>−34</sup> J · s (table value 4.136 · 10<sup>−15</sup> eV · s).<br>Intercept −<var>W</var><sub>A</sub> ≈ {b} eV, so <strong><var>W</var><sub>A</sub> ≈ {W} eV</strong>, threshold frequency <var>f</var><sub>G</sub> ≈ {fG} · 10<sup>14</sup> Hz.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const metal = () => metalOf(p.metal);
    const W = () => metal().W;
    const Icur = () => photoCurrent(p.U, p.lam, W(), p.P);

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, instant = false): number {
      const cur = soft.get(key);
      if (cur === undefined || instant || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-3 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    const warn = new Tween(2200, ease.linear);

    /* ---------- Farben ---------- */
    /** Lichtfarbe; UV als blasses Violett (im Bild angedeutet). */
    function lightColor(lam: number): string {
      const c = wavelengthToRgb(lam);
      if (!c) return '#b9a8ff';
      const m = Math.max(c[0], c[1], c[2]);
      const k = m < 160 ? 160 / Math.max(1, m) : 1;
      return `rgb(${Math.min(255, Math.round(c[0] * k))},${Math.min(255, Math.round(c[1] * k))},${Math.min(255, Math.round(c[2] * k))})`;
    }
    const alphaOf = (c: string, a: number) => mixColor(c, c, 0, a);
    /** Lichtfarbe als Textfarbe auf der Karte (gelb/grün auf Weiß abgedunkelt). */
    const inkOf = (lam: number) => {
      if (lam < 380) return purple();
      const c = lightColor(lam);
      return ctx.theme.dark ? mixColor(c, '#ffffff', lam < 450 ? 0.4 : 0.1) : mixColor(c, '#1b2330', lam > 500 && lam < 600 ? 0.4 : 0.15);
    };

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.38, 260, 400));
        const ah = Math.round((h - 10) * 0.56);
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, a: { x: w - pw, y: 0, w: pw, h: ah }, b: { x: w - pw, y: ah + 10, w: pw, h: h - ah - 10 } };
      }
      const sh = Math.round(h * 0.5);
      const ah = Math.round((h - sh - 20) * 0.55);
      return { side, scene: { x: 0, y: 0, w, h: sh }, a: { x: 0, y: sh + 10, w, h: ah }, b: { x: 0, y: sh + 20 + ah, w, h: h - sh - 20 - ah } };
    }

    function geo(r: Rect): Geo {
      const sm = r.w < 440;
      const top = r.y + (sm ? 40 : 50);
      const cb = Math.round(clamp(r.h * 0.3, 96, 170));
      const bot = r.y + r.h - cb;
      const tx = r.x + r.w * (sm ? 0.28 : 0.3);
      const tw = r.x + r.w - (sm ? 12 : 20) - tx;
      const ty = top + (sm ? 6 : 10);
      const th = bot - ty - (sm ? 8 : 14);
      let cy = ty + th / 2;
      let kr = Math.min(th * 0.42, tw * 0.5);
      const ka = 0.85;
      let kx = tx + tw * 0.14 + kr;
      let ax = tx + tw * 0.74;
      let ah = th * 0.3;
      // Foto der Fotozelle: Kolben oben bündig, Sockel ragt unter die Röhre; Elektroden im Kreis
      let bulb: Geo['bulb'] = null;
      if (ctx.images.get('cell')) {
        const R = Math.min(tw, th) * 0.44;
        bulb = { x: tx + tw / 2, y: ty + R * 1.02, r: R };
        cy = bulb.y;
        kr = R * 0.85;
        kx = bulb.x - R * 0.72 + kr;
        ax = bulb.x + R * 0.5;
        ah = R * 0.55;
      }
      const lx = r.x + (sm ? 18 : 26);
      const ly = top + (sm ? 10 : 16);
      const wy = bot + (sm ? 18 : 24);
      const sw = clamp(r.w * 0.26, 96, 150);
      const shh = clamp(cb * 0.62, 58, 100);
      const sx = r.x + r.w * 0.06;
      const sy = r.y + r.h - shh - (sm ? 8 : 12);
      const mr = clamp(cb * 0.36, 32, 56);
      const mx = r.x + r.w - mr - (sm ? 14 : 24);
      const my = r.y + r.h - mr - (sm ? 10 : 14);
      return { r, sm, tx, ty, tw, th, cy, kx, kr, ka, ax, ah, bulb, lx, ly, wy, sx, sy, sw, sh: shh, mx, my, mr };
    }

    /** Punkt auf der Kathodenoberfläche (j von −1 oben bis 1 unten). */
    const cathodePt = (G: Geo, j: number): Pt => ({ x: G.kx - Math.cos(j * G.ka) * G.kr, y: G.cy + Math.sin(j * G.ka) * G.kr });
    /** Zielpunkt an der Anode. */
    const anodePt = (G: Geo, j: number): Pt => ({ x: G.ax, y: G.cy + j * G.ah * 0.85 });

    /* ---------- Teilchen ---------- */
    const rand = seededRandom(20261021);
    let photons: Photon[] = [];
    let electrons: Electron[] = [];
    let photAcc = 0;
    let anodeFlash = 0;

    function tickParticles(dt: number): void {
      const rate = (p.P / 100) * 26;
      photAcc += dt * rate;
      while (photAcc >= 1) {
        photAcc -= 1;
        photons.push({ j: (rand() * 2 - 1) * 0.92, s: 0 });
      }
      const ek = maxKineticEnergy(p.lam, W());
      for (const q of photons) {
        q.s += dt / 0.55;
        if (q.s >= 1 && ek > 0 && rand() < 0.6) {
          // Bewegungsenergie gleichmäßig zwischen 0 und E_kin,max
          const E0 = rand() * ek;
          electrons.push({ j: q.j, x: 0, v: Math.sqrt(2 * G_EL * E0), fade: 1, hit: false });
        }
      }
      photons = photons.filter((q) => q.s < 1);
      for (const e of electrons) {
        if (e.fade < 1 || e.hit) {
          e.fade -= dt * 3;
          continue;
        }
        // Gegenfeld bremst gleichmäßig: a = −G · U (Energie E₀ − U · x)
        const a = -G_EL * p.U;
        e.x += e.v * dt + 0.5 * a * dt * dt;
        e.v += a * dt;
        e.v = Math.max(e.v, -3);
        if (e.x >= 1) {
          e.x = 1;
          e.hit = true;
          anodeFlash = 1;
        } else if (e.x <= 0 && e.v < 0) {
          e.x = 0;
          e.fade = 0.99;
        }
      }
      electrons = electrons.filter((e) => e.fade > 0).slice(-140);
      anodeFlash = Math.max(0, anodeFlash - dt * 3);
      autoTick(dt);
    }

    /* ---------- Abgleich und Messreihe ---------- */
    let zeroing = false;
    let points: Point[] = [];
    let autoRun = false;
    let autoIdx = 0;
    let autoWait = 0;

    /** Kleinste Reglerspannung (0,01-V-Schritte) mit I = 0: U_G aufgerundet. */
    const zeroU = (lam: number) => zeroVoltage(lam, W());

    /** Gegenspannung schrittweise zum Wert mit I = 0 führen (sichtbar am Zeiger). */
    function zeroStep(dt: number): boolean {
      const target = zeroU(p.lam);
      const d = target - p.U;
      if (Math.abs(d) < 0.005) {
        zeroing = false;
        return true;
      }
      const step = Math.sign(d) * Math.max(0.01, Math.min(Math.abs(d), Math.abs(d) * dt * 4 + dt * 0.4));
      ctx.set({ U: Math.round((p.U + step) * 100) / 100 });
      return false;
    }

    let warnKey: 'notZero' | 'lampOff' = 'notZero';
    function record(): boolean {
      if (p.P <= 0 || Icur() > I_ZERO) {
        // Ohne Licht ist der Strom immer null – das ist keine Messung von U_G.
        warnKey = p.P <= 0 ? 'lampOff' : 'notZero';
        warn.play();
        return false;
      }
      const pt: Point = { lam: p.lam, U: emits(p.lam, W()) ? p.U : 0, born: prefersReducedMotion() ? -1e9 : performance.now() };
      points = [...points.filter((q) => q.lam !== p.lam), pt].sort((a, b) => b.lam - a.lam).slice(-12);
      updateTable();
      return true;
    }

    function autoTick(dt: number): void {
      if (zeroing && !autoRun) zeroStep(dt);
      if (!autoRun) return;
      if (p.lam !== AUTO_LAM[autoIdx]) {
        ctx.set({ lam: AUTO_LAM[autoIdx]! });
        return;
      }
      if (!zeroStep(dt)) return;
      autoWait += dt;
      if (autoWait < 0.35) return;
      autoWait = 0;
      record();
      autoIdx++;
      if (autoIdx >= AUTO_LAM.length) {
        autoRun = false;
        return;
      }
      ctx.set({ lam: AUTO_LAM[autoIdx]! });
    }

    /* ---------- Zeichenhilfen ---------- */
    function parts(str: string): { t: string; k: 0 | 1 | 2 }[] {
      const out: { t: string; k: 0 | 1 | 2 }[] = [];
      const re = /_\[([^\]]*)\]|\^(−?\d+)/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), k: 0 });
        if (mm[1] !== undefined) out.push({ t: mm[1], k: 1 });
        else out.push({ t: mm[2]!, k: 2 });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), k: 0 });
      return out;
    }
    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.k ? Math.round(size * 0.72) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.k ? Math.round(size * 0.72) : size;
          g.font = `${weight} ${s}px ${ctx.theme.font}`;
          const yy = y + (q.k === 1 ? size * 0.3 : q.k === 2 ? -size * 0.36 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = halo!;
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
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
        g.strokeStyle = color.startsWith('#') ? withAlpha(color, 0.5) : alphaOf(color, 0.5);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center');
      return { x: x0, y, w, h };
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function cable(pts: Pt[], color: string, width = 4): void {
      const g = surface.g;
      const trace = (dx = 0, dy = 0) => {
        g.beginPath();
        pts.forEach((q, i) => (i ? g.lineTo(q.x + dx, q.y + dy) : g.moveTo(q.x + dx, q.y + dy)));
      };
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.lineWidth = width;
      trace(1, 2.5);
      g.stroke();
      g.strokeStyle = color;
      trace();
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.28)';
      g.lineWidth = Math.max(1, width * 0.25);
      trace(-0.4, -1);
      g.stroke();
      g.restore();
    }

    function socket(x: number, y: number, rr: number, color: string): void {
      const g = surface.g;
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, rr, 0, TAU);
      g.fill();
      g.fillStyle = '#0d0f12';
      g.beginPath();
      g.arc(x, y, rr * 0.45, 0, TAU);
      g.fill();
    }

    /* ---------- Szene ---------- */
    function drawRoom(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#172131' : '#f4f7fb');
      bg.addColorStop(1, dark ? '#101824' : '#e3e9f1');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
      const gl = g.createRadialGradient(r.x + r.w * 0.25, r.y, 10, r.x + r.w * 0.25, r.y, r.w * 0.85);
      gl.addColorStop(0, dark ? 'rgba(120,160,220,0.08)' : 'rgba(255,255,255,0.7)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, r.h);
    }

    function drawLampAndLight(G: Geo, ik: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const lam = ease2('lamShow', p.lam, 8);
      const col = lightColor(lam);
      const on = ease2('lampOn', p.P > 0 ? 1 : 0, 6);
      const Pv = ease2('Pshow', p.P, 7) / 100;
      const { lx, ly, sm } = G;
      const aim = cathodePt(G, 0);
      const ang = Math.atan2(aim.y - ly, aim.x - lx);
      g.save();
      g.globalAlpha *= ik;
      // Lichtkegel auf die Kathode
      if (on > 0.01 && Pv > 0) {
        const a1 = cathodePt(G, -0.95);
        const a2 = cathodePt(G, 0.95);
        const lg = g.createLinearGradient(lx, ly, aim.x, aim.y);
        lg.addColorStop(0, alphaOf(col, (lam < 380 ? 0.18 : 0.42) * Pv * on));
        lg.addColorStop(1, alphaOf(col, (lam < 380 ? 0.06 : 0.16) * Pv * on));
        g.fillStyle = lg;
        g.beginPath();
        g.moveTo(lx + Math.cos(ang - 0.3) * 14, ly + Math.sin(ang - 0.3) * 14);
        g.lineTo(a1.x, a1.y);
        g.lineTo(a2.x, a2.y);
        g.lineTo(lx + Math.cos(ang + 0.3) * 14, ly + Math.sin(ang + 0.3) * 14);
        g.closePath();
        g.fill();
      }
      // Gehäuse (zur Kathode gedreht)
      g.save();
      g.translate(lx, ly);
      g.rotate(ang);
      const L0 = sm ? 34 : 46;
      const H0 = sm ? 22 : 28;
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const lamp = ctx.images.get('lamp');
      if (lamp) {
        // Foto (900 × 487): Lichtaustritt rechts, Mitte des Zylinders bei y = 158
        const w = L0 * 1.5;
        const k = w / lamp.naturalWidth;
        const h = lamp.naturalHeight * k;
        g.drawImage(scaledSprite(lamp, w, h, surface.dpr), L0 * 0.25 - w, -158 * k, w, h);
        g.shadowColor = 'rgba(0,0,0,0)';
        g.fillStyle = alphaOf(col, 0.35 + 0.65 * on);
        roundRect(g, L0 * 0.25 - 3, -150 * k, 4, 300 * k, 1.5);
        g.fill();
        g.restore();
        g.restore();
        return;
      }
      const body = g.createLinearGradient(0, -H0 / 2, 0, H0 / 2);
      body.addColorStop(0, dark ? '#5d6674' : '#6b7583');
      body.addColorStop(0.5, dark ? '#3a414c' : '#454d58');
      body.addColorStop(1, dark ? '#20252d' : '#2b3038');
      g.fillStyle = body;
      roundRect(g, -L0 * 0.75, -H0 / 2, L0, H0, 5);
      g.fill();
      g.shadowColor = 'rgba(0,0,0,0)';
      // Farbfilter vorn
      g.fillStyle = alphaOf(col, 0.35 + 0.65 * on);
      roundRect(g, L0 * 0.25 - 4, -H0 / 2 + 3, 6, H0 - 6, 2);
      g.fill();
      g.restore();
      g.restore();
    }

    function drawTube(G: Geo, ik: number, front: boolean): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const { tx, ty, tw, th } = G;
      const cell = ctx.images.get('cell');
      if (G.bulb && cell) {
        // Foto (504 × 800): Kolbenmitte (252 | 262), Radius 252; Steckerstifte (unter y = 690) abgeschnitten
        if (front) return;
        const k = G.bulb.r / 252;
        const w = cell.naturalWidth * k;
        const h = 690 * k;
        g.save();
        g.globalAlpha *= ik;
        g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.18)';
        g.shadowBlur = 14;
        g.shadowOffsetY = 4;
        g.drawImage(scaledSprite(cell, w, h, surface.dpr, { crop: { x: 0, y: 0, w: cell.naturalWidth, h: 690 } }), G.bulb.x - 252 * k, G.bulb.y - 262 * k, w, h);
        g.restore();
        return;
      }
      g.save();
      g.globalAlpha *= ik;
      if (!front) {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.2)';
        g.shadowBlur = 16;
        g.shadowOffsetY = 5;
        const inner = g.createLinearGradient(tx, ty, tx + tw, ty + th);
        inner.addColorStop(0, dark ? 'rgba(40,56,80,0.75)' : 'rgba(236,243,250,0.95)');
        inner.addColorStop(1, dark ? 'rgba(22,32,48,0.85)' : 'rgba(214,226,240,0.95)');
        g.fillStyle = inner;
        roundRect(g, tx, ty, tw, th, th * 0.32);
        g.fill();
        g.restore();
      } else {
        g.strokeStyle = dark ? 'rgba(200,220,245,0.5)' : 'rgba(110,135,165,0.7)';
        g.lineWidth = 1.6;
        roundRect(g, tx, ty, tw, th, th * 0.32);
        g.stroke();
        g.strokeStyle = 'rgba(255,255,255,0.55)';
        g.lineWidth = 2.5;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(tx + th * 0.36, ty + 5);
        g.lineTo(tx + tw * 0.5, ty + 5);
        g.stroke();
        // Sockel unten
        const bw = tw * 0.5;
        const bx = tx + tw * 0.25;
        const by = ty + th;
        const sg = g.createLinearGradient(bx, 0, bx + bw, 0);
        sg.addColorStop(0, dark ? '#2b3038' : '#4a525d');
        sg.addColorStop(0.5, dark ? '#59616d' : '#7b8592');
        sg.addColorStop(1, dark ? '#2b3038' : '#4a525d');
        g.fillStyle = sg;
        roundRect(g, bx, by - 2, bw, G.sm ? 8 : 11, 3);
        g.fill();
      }
      g.restore();
    }

    function drawElectrodes(G: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const m = metal();
      const { kx, kr, ka, cy, ax, ah, sm } = G;
      g.save();
      g.globalAlpha *= ik;
      // Kathode: gewölbte Metallschale
      const kg = g.createLinearGradient(kx - kr, cy - kr, kx - kr * 0.6, cy + kr);
      kg.addColorStop(0, m.color[0]);
      kg.addColorStop(1, m.color[1]);
      g.strokeStyle = kg;
      g.lineWidth = sm ? 7 : 9;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(kx, cy, kr, Math.PI - ka, Math.PI + ka);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.45)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(kx, cy, kr - (sm ? 2.5 : 3.5), Math.PI - ka * 0.9, Math.PI + ka * 0.9);
      g.stroke();
      // Anode: Drahtring von der Seite (Stab mit Öse)
      const ag = g.createLinearGradient(ax - 3, 0, ax + 3, 0);
      ag.addColorStop(0, '#6f7884');
      ag.addColorStop(0.5, '#e3e7ec');
      ag.addColorStop(1, '#5b636e');
      g.strokeStyle = ag;
      g.lineWidth = sm ? 3 : 4;
      g.beginPath();
      g.ellipse(ax, cy, ah * 0.22, ah, 0, 0, TAU);
      g.stroke();
      if (anodeFlash > 0.02) {
        g.strokeStyle = alphaOf('#9fd0ff', 0.7 * anodeFlash);
        g.lineWidth = 6;
        g.beginPath();
        g.ellipse(ax, cy, ah * 0.22, ah, 0, 0, TAU);
        g.stroke();
      }
      // Zuleitungen bis zum Sockel
      g.strokeStyle = theme.dark ? '#8a929e' : '#5d6570';
      g.lineWidth = 1.6;
      g.beginPath();
      const kb = { x: kx - kr * Math.cos(ka), y: cy + kr * Math.sin(ka) };
      g.moveTo(kb.x, kb.y);
      if (G.bulb) {
        // durch den Hals in den Sockel
        const neck = G.bulb.y + G.bulb.r * 1.02;
        g.lineTo(G.bulb.x - G.bulb.r * 0.08, neck);
        g.moveTo(ax, cy + ah);
        g.lineTo(G.bulb.x + G.bulb.r * 0.08, neck);
      } else {
        g.lineTo(kb.x, G.ty + G.th);
        g.moveTo(ax, cy + ah);
        g.lineTo(ax, G.ty + G.th);
      }
      g.stroke();
      // Beschriftungen
      const fs = sm ? 10.5 : 11.5;
      richText(ctx.t('cathode'), kx - kr - (sm ? 6 : 10), cy - kr * Math.sin(ka) - (sm ? 8 : 10), fs, theme.muted, 'left', 650, haloCol());
      richText(ctx.t('anode'), ax, cy - ah - (sm ? 9 : 11), fs, theme.muted, 'center', 650, haloCol());
      g.restore();
    }

    function drawParticles(G: Geo): void {
      const g = surface.g;
      const lam = p.lam;
      const col = lightColor(lam);
      const uv = lam < 380;
      const { lx, ly, sm } = G;
      // Photonen als kleine Wellenpakete von der Lampe zur Kathode
      g.save();
      g.strokeStyle = col;
      g.lineWidth = sm ? 1.4 : 1.7;
      g.lineCap = 'round';
      if (uv) g.setLineDash([2, 2]);
      const wl = clamp(4 + ((lam - 380) / 400) * 8, 3, 12);
      for (const q of photons) {
        const end = cathodePt(G, q.j);
        const sx = lx + (end.x - lx) * 0.04;
        const sy = ly + (end.y - ly) * 0.04;
        const dx = end.x - sx;
        const dy = end.y - sy;
        const len = Math.hypot(dx, dy);
        const ux = dx / len;
        const uy = dy / len;
        const cx = sx + dx * q.s;
        const cy = sy + dy * q.s;
        const L0 = sm ? 14 : 18;
        g.beginPath();
        for (let i = 0; i <= 12; i++) {
          const d = -L0 / 2 + (L0 * i) / 12;
          const env = Math.exp(-((d / (L0 * 0.35)) ** 2));
          const off = (sm ? 2.4 : 3) * env * Math.sin((TAU * (q.s * len + d)) / wl);
          const x = cx + ux * d - uy * off;
          const y = cy + uy * d + ux * off;
          if (i) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
      }
      g.restore();
      // Elektronen
      const er = sm ? 2.6 : 3.2;
      for (const e of electrons) {
        const a = cathodePt(G, e.j);
        const b = anodePt(G, e.j);
        const x = a.x + (b.x - a.x) * clamp(e.x, 0, 1);
        const y = a.y + (b.y - a.y) * clamp(e.x, 0, 1);
        g.save();
        g.globalAlpha *= clamp(e.fade, 0, 1);
        const eg = g.createRadialGradient(x - er * 0.3, y - er * 0.3, 0.3, x, y, er);
        eg.addColorStop(0, '#e9f3ff');
        eg.addColorStop(0.55, '#5aa0ff');
        eg.addColorStop(1, '#1d4fbf');
        g.fillStyle = eg;
        g.beginPath();
        g.arc(x, y, er, 0, TAU);
        g.fill();
        g.restore();
      }
    }

    /** Gegenfeld zwischen Kathode und Anode als zarte Pfeile (Kraft auf Elektronen zur Kathode hin). */
    function drawField(G: Geo, ik: number): void {
      const g = surface.g;
      const a = ease2('fieldA', clamp(p.U / 1.5, 0, 1), 6) * ik;
      if (a < 0.02) return;
      const x0 = G.kx - G.kr * 0.55;
      const x1 = G.ax - 12;
      g.save();
      g.globalAlpha *= a * 0.55;
      g.strokeStyle = ctx.theme.dark ? '#e0b070' : '#b07020';
      g.fillStyle = g.strokeStyle;
      g.lineWidth = 1.2;
      for (const k of [-0.55, 0, 0.55]) {
        const y = G.cy + k * G.ah;
        g.beginPath();
        g.moveTo(x1, y);
        g.lineTo(x0 + 6, y);
        g.stroke();
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x0 + 7, y - 3.5);
        g.lineTo(x0 + 7, y + 3.5);
        g.closePath();
        g.fill();
      }
      g.restore();
    }

    /* Spannungsquelle mit Drehknopf und digitaler Anzeige */
    let knob: { x: number; y: number; r: number } | null = null;
    let knobHover = false;
    let knobDrag = false;
    const KNOB_A0 = Math.PI * 0.75;
    const KNOB_SPAN = Math.PI * 1.5;

    function drawSupply(G: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const { sx, sy, sw, sh, sm } = G;
      g.save();
      g.globalAlpha *= ik;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.28)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      const body = g.createLinearGradient(0, sy, 0, sy + sh);
      body.addColorStop(0, dark ? '#4a5568' : '#556072');
      body.addColorStop(1, dark ? '#262e3b' : '#2e3644');
      g.fillStyle = body;
      roundRect(g, sx, sy, sw, sh, 9);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(g, sx + 3, sy + 2, sw - 6, 3, 2);
      g.fill();
      // Drehknopf rechts oben, Anzeige links daneben
      const kr = Math.min(sh * 0.27, sw * 0.15);
      const kx = sx + sw - kr - 10;
      const ky = sy + 10 + kr;
      const dw = kx - kr - 10 - (sx + 8);
      const dh = Math.min(sh * 0.4, 30, kr * 2);
      const dx = sx + 8;
      const dy = ky - dh / 2;
      g.fillStyle = '#0f2a1c';
      roundRect(g, dx, dy, dw, dh, 4);
      g.fill();
      const Us = ease2('Ushow', p.U, 14, knobDrag);
      const label = `${fx(Us, 2)} V`;
      let fsz = Math.round(dh * 0.62);
      do {
        g.font = `700 ${fsz}px ui-monospace, Menlo, Consolas, monospace`;
        fsz -= 1;
      } while (fsz > 8 && g.measureText(label).width > dw - 10);
      g.fillStyle = '#7dffb0';
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      g.fillText(label, dx + dw - 5, dy + dh / 2 + 1);
      knob = { x: kx, y: ky, r: kr };
      const hot = knobHover || knobDrag;
      if (hot && !ctx.locked) {
        g.fillStyle = withAlpha(orange(), 0.3);
        g.beginPath();
        g.arc(kx, ky, kr + 6, 0, TAU);
        g.fill();
      }
      const kg = g.createRadialGradient(kx - kr * 0.35, ky - kr * 0.4, kr * 0.1, kx, ky, kr);
      kg.addColorStop(0, '#5b6370');
      kg.addColorStop(1, '#16191e');
      g.fillStyle = kg;
      g.beginPath();
      g.arc(kx, ky, kr, 0, TAU);
      g.fill();
      const ka = KNOB_A0 + (Us / 4) * KNOB_SPAN;
      g.strokeStyle = orange();
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(kx + Math.cos(ka) * kr * 0.3, ky + Math.sin(ka) * kr * 0.3);
      g.lineTo(kx + Math.cos(ka) * kr * 0.85, ky + Math.sin(ka) * kr * 0.85);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(kx, ky, kr + 3, KNOB_A0, KNOB_A0 + KNOB_SPAN);
      g.stroke();
      // Buchsen + (rot) und − (schwarz)
      const by = sy + sh - (sm ? 11 : 13);
      socket(sx + 18, by, sm ? 5 : 6, '#c62828');
      socket(sx + sw * 0.45, by, sm ? 5 : 6, '#1c1f24');
      richText('+', sx + 30, by, sm ? 11 : 12, '#ffb4ab', 'left', 800);
      richText('−', sx + sw * 0.45 + 12, by, sm ? 11 : 12, 'rgba(235,240,248,0.85)', 'left', 800);
      g.restore();
    }

    /** Strommesser (nA) mit Zeiger. */
    /** Zeigerinstrument (manometer.webp, 1011 × 1236): Mitte und Außenradius, Radius des Zifferblatts, Schnitt unter dem Gehäuse (Bildpixel). */
    const METER_IMG = { cx: 505, cy: 505, r: 503, face: 395, cut: 1008 };
    function drawAmmeter(G: Geo, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { mx, my, mr, sm } = G;
      g.save();
      g.globalAlpha *= ik;
      // Gehäuse (Foto des runden Zeigerinstruments; Mitte des Zifferblatts genau auf dem Drehpunkt,
      // der Gewindestutzen unten ist abgeschnitten)
      const photo = ctx.images.get('meter');
      let fr: number;
      if (photo) {
        const M = METER_IMG;
        const k = mr / M.r;
        const w = photo.width * k;
        const h = M.cut * k;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.28)';
        g.shadowBlur = 12;
        g.shadowOffsetY = 4;
        g.drawImage(scaledSprite(photo, w, h, surface.dpr, { crop: { x: 0, y: 0, w: photo.width, h: M.cut } }), mx - M.cx * k, my - M.cy * k, w, h);
        g.restore();
        fr = M.face * k;
      } else {
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.28)';
        g.shadowBlur = 12;
        g.shadowOffsetY = 4;
        const bez = g.createLinearGradient(mx - mr, my - mr, mx + mr, my + mr);
        bez.addColorStop(0, theme.dark ? '#d3d9e1' : '#f4f6f8');
        bez.addColorStop(0.5, theme.dark ? '#7d8693' : '#a8b1bc');
        bez.addColorStop(1, theme.dark ? '#3e4550' : '#68717d');
        g.fillStyle = bez;
        g.beginPath();
        g.arc(mx, my, mr, 0, TAU);
        g.fill();
        g.restore();
        fr = mr * 0.86;
        const face = g.createRadialGradient(mx - fr * 0.3, my - fr * 0.35, fr * 0.1, mx, my, fr);
        face.addColorStop(0, '#fffdf6');
        face.addColorStop(1, '#efe9d8');
        g.fillStyle = face;
        g.beginPath();
        g.arc(mx, my, fr, 0, TAU);
        g.fill();
      }
      const a0 = Math.PI * 0.8;
      const span = Math.PI * 1.4;
      const ink = '#2a2a2a';
      g.strokeStyle = ink;
      for (let i = 0; i <= 20; i++) {
        const a = a0 + (span * i) / 20;
        const big = i % 5 === 0;
        g.lineWidth = big ? 1.4 : 0.8;
        g.beginPath();
        g.moveTo(mx + Math.cos(a) * fr * 0.84, my + Math.sin(a) * fr * 0.84);
        g.lineTo(mx + Math.cos(a) * fr * (big ? 0.68 : 0.75), my + Math.sin(a) * fr * (big ? 0.68 : 0.75));
        g.stroke();
        if (big) {
          g.font = `600 ${Math.max(8.5, fr * 0.2)}px ${theme.font}`;
          g.fillStyle = ink;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(fmt.num(i / 10, 1), mx + Math.cos(a) * fr * 0.5, my + Math.sin(a) * fr * 0.5);
        }
      }
      g.font = `800 ${Math.max(10, fr * 0.24)}px ${theme.font}`;
      g.fillStyle = '#b3261e';
      g.fillText('nA', mx, my + fr * 0.5);
      // Zeiger
      const I = ease2('needle', Icur(), 6);
      const f = clamp(I / 2, -0.02, 1.05);
      const a = a0 + span * f;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 2;
      g.shadowOffsetX = 1;
      g.shadowOffsetY = 1.5;
      g.strokeStyle = '#c62828';
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(mx - Math.cos(a) * fr * 0.15, my - Math.sin(a) * fr * 0.15);
      g.lineTo(mx + Math.cos(a) * fr * 0.82, my + Math.sin(a) * fr * 0.82);
      g.stroke();
      g.restore();
      g.fillStyle = '#4a525d';
      g.beginPath();
      g.arc(mx, my, 3.5, 0, TAU);
      g.fill();
      // Buchsen links am Gehäuse
      const sA = { x: mx - mr * 0.78, y: my + mr * 0.62 };
      socket(sA.x, sA.y, sm ? 4.5 : 5.5, '#c62828');
      const sB = { x: mx + mr * 0.78, y: my + mr * 0.62 };
      socket(sB.x, sB.y, sm ? 4.5 : 5.5, '#1c1f24');
      g.restore();
    }

    function drawWires(G: Geo, ik: number): void {
      const g = surface.g;
      let kb = { x: G.kx - G.kr * Math.cos(G.ka), y: G.ty + G.th };
      let ab = { x: G.ax, y: G.ty + G.th };
      if (G.bulb) {
        // Anschlüsse seitlich am Sockel (Foto: Sockel 1,03 … 1,69 Radien unter der Kolbenmitte, halbe Breite 0,45)
        const { x, y, r: R } = G.bulb;
        const sy = clamp(G.wy - (G.sm ? 3 : 4), y + R * 1.12, y + R * 1.6);
        kb = { x: x - R * 0.43, y: sy };
        ab = { x: x + R * 0.43, y: sy };
      }
      const by = G.sy + G.sh - (G.sm ? 11 : 13);
      const supplyPlus = { x: G.sx + 18, y: by };
      const supplyMinus = { x: G.sx + G.sw * 0.45, y: by };
      const meterIn = { x: G.mx - G.mr * 0.78, y: G.my + G.mr * 0.62 };
      const meterOut = { x: G.mx + G.mr * 0.78, y: G.my + G.mr * 0.62 };
      g.save();
      g.globalAlpha *= ik;
      // Kathode an Plus, Anode über den Strommesser an Minus (Gegenspannung)
      const y1 = G.wy;
      cable([kb, { x: kb.x, y: y1 }, { x: supplyPlus.x, y: y1 }, supplyPlus], '#c62828', G.sm ? 3 : 4);
      const y2 = G.wy + (G.sm ? 10 : 13);
      cable([ab, { x: ab.x, y: y1 - (G.sm ? 6 : 8) }, { x: meterOut.x, y: y1 - (G.sm ? 6 : 8) }, meterOut], '#2b3038', G.sm ? 3 : 4);
      cable([meterIn, { x: meterIn.x, y: y2 }, { x: supplyMinus.x, y: y2 }, supplyMinus], '#2b3038', G.sm ? 3 : 4);
      g.restore();
    }

    function drawScene(r: Rect): Geo {
      const g = surface.g;
      const G = geo(r);
      const ik = stage(0, 0.5);
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawRoom(r);
      drawTube(G, ik, false);
      drawField(G, ik);
      drawElectrodes(G, ik);
      drawParticles(G);
      drawTube(G, ik, true);
      drawLampAndLight(G, ik);
      // Kabel zuerst: sie laufen hinter die Geräte zu den Buchsen
      drawWires(G, stage(0.25, 0.5));
      drawSupply(G, stage(0.15, 0.5));
      drawAmmeter(G, stage(0.2, 0.5));
      // Kopfzeile
      const theme = ctx.theme;
      const fs = G.sm ? 11.5 : 12.5;
      const m = metal();
      const left = p.val ? `${ctx.t(m.id)} · W_[A] = ${fx(m.W, 2)} eV` : ctx.t(m.id);
      const lp = pill(r.x + 12, r.y + 12, left, theme.text, 'left', fs);
      const Eph = photonEnergy(p.lam);
      const right = p.val && !ctx.isHidden('photon') ? `λ = ${n(p.lam, 0)} nm · E_[Ph] = ${fx(Eph, 2)} eV` : `λ = ${n(p.lam, 0)} nm`;
      const rw = richWidth(right, fs) + 16;
      if (lp.x + lp.w + 8 + rw < r.x + r.w - 12) pill(r.x + r.w - 12 - rw, r.y + 12, right, inkOf(p.lam), 'left', fs);
      else pill(r.x + 12, r.y + 12 + fs + 16, right, inkOf(p.lam), 'left', fs);
      // Zustand in der Röhre
      const status = p.P <= 0 ? ctx.t('dark') : !emits(p.lam, W()) ? ctx.t(G.sm ? 'noneS' : 'none') : Icur() <= I_ZERO ? ctx.t('zeroOk') : '';
      const sa = ease2('statusA', status ? 1 : 0, 6);
      if (sa > 0.02 && status) {
        g.save();
        g.globalAlpha *= sa;
        const col = p.P <= 0 ? theme.muted : !emits(p.lam, W()) ? red() : green();
        const sw = richWidth(status, fs - 1) + 16;
        pill(clamp(G.tx + G.tw / 2 - sw / 2, r.x + 8, r.x + r.w - 8 - sw), G.ty + G.th - (fs + 18), status, col, 'left', fs - 1);
        g.restore();
      }
      if (warn.running) {
        const u = warn.t;
        const a = u < 0.1 ? u / 0.1 : u > 0.8 ? (1 - u) / 0.2 : 1;
        g.save();
        g.globalAlpha *= a;
        const msg = ctx.t(G.sm ? `${warnKey}S` : warnKey);
        const w = richWidth(msg, fs) + 16;
        pill(clamp(G.tx + G.tw / 2 - w / 2, r.x + 8, r.x + r.w - 8 - w), G.ty + 8, msg, '#ffffff', 'left', fs, withAlpha(orange(), 0.95));
        g.restore();
      }
      g.restore();
      return G;
    }

    /* ---------- Diagramm E_kin über f ---------- */
    function axisFrame(R: Rect, sm: boolean): Rect {
      const padL = sm ? 38 : 44;
      return { x: R.x + padL, y: R.y + (sm ? 46 : 54), w: R.w - padL - (sm ? 14 : 18), h: R.h - (sm ? 46 : 54) - (sm ? 26 : 30) };
    }

    function drawEChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 210;
      const fs = sm ? 10.5 : 11.5;
      richText(ctx.t(R.w < 340 ? 'chartES' : 'chartE'), R.x + 14, R.y + (sm ? 17 : 20), fs + 1.5, theme.text, 'left', 750);
      const A = axisFrame(R, sm);
      if (A.w < 60 || A.h < 50) {
        g.restore();
        return;
      }
      const X = (f: number) => A.x + (f / F_AXIS) * A.w;
      const Y = (E: number) => A.y + A.h - ((E - E_MIN) / (E_MAX - E_MIN)) * A.h;
      const reveal = stage(0.35, 0.7, ease.inOutCubic);
      // sichtbarer Bereich als Farbband unter der Achse
      const fv0 = frequencyOf(780) / 1e14;
      const fv1 = frequencyOf(380) / 1e14;
      const band = g.createLinearGradient(X(fv0), 0, X(fv1), 0);
      for (let lam = 780; lam >= 380; lam -= 20) band.addColorStop((frequencyOf(lam) / 1e14 - fv0) / (fv1 - fv0), lightColor(lam));
      g.fillStyle = band;
      g.globalAlpha *= 0.85;
      roundRect(g, X(fv0), Y(0) - 2, X(fv1) - X(fv0), 4, 2);
      g.fill();
      g.globalAlpha /= 0.85;
      // Gitter
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let E = -4; E <= 3; E += 1) {
        if (E === 0) continue;
        g.moveTo(A.x, Math.round(Y(E)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(E)) + 0.5);
      }
      const xs = A.w < 240 ? 4 : 2;
      for (let f = xs; f < F_AXIS; f += xs) {
        g.moveTo(Math.round(X(f)) + 0.5, A.y);
        g.lineTo(Math.round(X(f)) + 0.5, A.y + A.h);
      }
      g.stroke();
      for (let E = -4; E <= 3; E += A.h < 150 ? 2 : 1) richText(E < 0 ? `−${-E}` : String(E), A.x - 6, Y(E), fs, theme.muted, 'right', 500);
      const xt = ctx.t('axisF');
      const xtw = richWidth(xt, fs, 600);
      for (let f = 0; f < F_AXIS; f += xs) {
        if (X(f) + 10 > A.x + A.w - xtw - 6) continue;
        richText(String(f), X(f), A.y + A.h + 11, fs, theme.muted, 'center', 500);
      }
      richText(xt, A.x + A.w, A.y + A.h + 11, fs, theme.muted, 'right', 600);
      richText(ctx.t('axisE'), A.x - (sm ? 34 : 40), A.y - 14, fs, theme.muted, 'left', 600);
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.moveTo(A.x, Y(0) + 0.5);
      g.lineTo(A.x + A.w + 4, Y(0) + 0.5);
      g.stroke();
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 4, (A.w + 6) * reveal, A.h + 8);
      g.clip();
      // Einstein-Gerade des gewählten Metalls (unter der Grenzfrequenz gestrichelt)
      const Wv = ease2('Wshow', W(), 7);
      const fG = thresholdFrequency(Wv) / 1e14;
      const line = (f0: number, f1: number) => {
        g.beginPath();
        g.moveTo(X(f0), Y(PLANCK_EV * 1e14 * f0 - Wv));
        g.lineTo(X(f1), Y(PLANCK_EV * 1e14 * f1 - Wv));
        g.stroke();
      };
      g.strokeStyle = withAlpha(blue(), 0.5);
      g.lineWidth = 1.5;
      g.setLineDash([5, 4]);
      line(0, fG);
      g.setLineDash([]);
      g.strokeStyle = withAlpha(blue(), 0.85);
      g.lineWidth = sm ? 2.2 : 2.6;
      line(fG, F_AXIS);
      // Achsenabschnitte
      g.fillStyle = blue();
      g.beginPath();
      g.arc(X(fG), Y(0), 4.5, 0, TAU);
      g.fill();
      g.beginPath();
      g.arc(X(0), Y(-Wv), 4.5, 0, TAU);
      g.fill();
      if (p.val) {
        richText(ctx.t('fG'), X(fG) - 4, Y(0) + 14, fs, blue(), 'right', 750, haloCol());
        richText(ctx.t('WA'), X(0) + 7, Y(-Wv) + (Y(-Wv) > A.y + A.h - 14 ? -10 : 10), fs, blue(), 'left', 750, haloCol());
      }
      // Ausgleichsgerade der Messpunkte
      const fitPts = points.filter((q) => q.U > 0).map((q) => [frequencyOf(q.lam) / 1e14, q.U] as const);
      const fit = fitLine(fitPts);
      if (fit) {
        g.strokeStyle = orange();
        g.lineWidth = 1.6;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.moveTo(X(0), Y(fit.b));
        g.lineTo(X(F_AXIS), Y(fit.m * F_AXIS + fit.b));
        g.stroke();
        g.setLineDash([]);
      }
      // Messpunkte
      const now = performance.now();
      for (const q of points) {
        const pop = ease.outBack(clamp((now - q.born) / 450, 0, 1));
        if (pop < 1) animating = true;
        g.fillStyle = q.U > 0 ? orange() : withAlpha(theme.muted, 0.8);
        g.beginPath();
        g.arc(X(frequencyOf(q.lam) / 1e14), Y(q.U), 4.8 * pop, 0, TAU);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.6;
        g.stroke();
      }
      // aktueller Zustand
      const fNow = frequencyOf(ease2('lamChart', p.lam, 9)) / 1e14;
      const Enow = Math.max(0, PLANCK_EV * 1e14 * fNow - Wv);
      const breathe = prefersReducedMotion() || !ctx.clock.playing ? 0 : 0.5 + 0.5 * Math.sin(now / 320);
      g.fillStyle = withAlpha(theme.text, 0.12 + 0.08 * breathe);
      g.beginPath();
      g.arc(X(fNow), Y(Enow), 10 + 3 * breathe, 0, TAU);
      g.fill();
      g.fillStyle = theme.bg;
      g.beginPath();
      g.arc(X(fNow), Y(Enow), 5.5, 0, TAU);
      g.fill();
      g.strokeStyle = theme.text;
      g.lineWidth = 2.4;
      g.stroke();
      if (breathe > 0) animating = true;
      g.restore();
      // Beschriftung der Steigung
      if (fit) {
        const lab = tr(A.w < 260 ? 'fitLabS' : 'fitLab', { h: fx(fit.m / 1e14 / 1e-15, 2) });
        const w = richWidth(lab, fs) + 16;
        // unten rechts: dort liegt die Einstein-Gerade nie (E > 0 bei großen f)
        pill(A.x + A.w - w, A.y + A.h - fs - 15, lab, orange(), 'left', fs);
      } else if (!points.length) {
        const msg = ctx.t(A.w < 300 ? 'emptyS' : 'empty');
        const w = Math.min(A.w - 8, richWidth(msg, fs, 600) + 22);
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.9)';
        roundRect(g, A.x + 4, A.y + 2, w, fs + 12, (fs + 12) / 2);
        g.fill();
        richText(msg, A.x + 4 + w / 2, A.y + 2 + (fs + 12) / 2 + 0.5, fs, theme.muted, 'center', 600);
      }
      g.restore();
    }

    /* ---------- Diagramm I über U ---------- */
    function drawIChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 330 || R.h < 180;
      const fs = sm ? 10.5 : 11.5;
      richText(ctx.t(R.w < 340 ? 'chartIS' : 'chartI'), R.x + 14, R.y + (sm ? 17 : 20), fs + 1.5, theme.text, 'left', 750);
      const A = axisFrame(R, sm);
      if (A.w < 60 || A.h < 40) {
        g.restore();
        return;
      }
      const X = (U: number) => A.x + (U / U_AXIS) * A.w;
      const Y = (I: number) => A.y + A.h - (I / I_AXIS) * A.h;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let I = 0.5; I < I_AXIS; I += 0.5) {
        g.moveTo(A.x, Math.round(Y(I)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(I)) + 0.5);
      }
      for (let U = 0.5; U < U_AXIS + 1e-9; U += 0.5) {
        g.moveTo(Math.round(X(U)) + 0.5, A.y);
        g.lineTo(Math.round(X(U)) + 0.5, A.y + A.h);
      }
      g.stroke();
      for (let I = 0; I < I_AXIS; I += A.h < 110 ? 1 : 0.5) richText(n(I, 1), A.x - 6, Y(I), fs, theme.muted, 'right', 500);
      const xt = ctx.t('axisU');
      const xtw = richWidth(xt, fs, 600);
      for (let U = 0; U <= U_AXIS; U += 1) {
        if (X(U) + 8 > A.x + A.w - xtw - 6) continue;
        richText(String(U), X(U), A.y + A.h + 11, fs, theme.muted, 'center', 500);
      }
      richText(xt, A.x + A.w, A.y + A.h + 11, fs, theme.muted, 'right', 600);
      richText(ctx.t('axisI'), A.x - (sm ? 34 : 40), A.y - 14, fs, theme.muted, 'left', 600);
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w + 4, A.y + A.h + 0.5);
      g.stroke();
      const lam = ease2('lamI', p.lam, 9);
      const Wv = soft.get('Wshow') ?? W();
      const Pv = ease2('PI', p.P, 8);
      const curve = (P: number, col: string, width: number, dash: number[]) => {
        g.strokeStyle = col;
        g.lineWidth = width;
        g.setLineDash(dash);
        g.lineJoin = 'round';
        g.beginPath();
        for (let i = 0; i <= 80; i++) {
          const U = (U_AXIS * i) / 80;
          const y = Y(photoCurrent(U, lam, Wv, P));
          if (i) g.lineTo(X(U), y);
          else g.moveTo(X(U), y);
        }
        g.stroke();
        g.setLineDash([]);
      };
      curve(100, withAlpha(theme.muted, 0.6), 1.4, [5, 4]);
      curve(Pv, inkOf(p.lam), sm ? 2.4 : 2.8, []);
      if (p.val && A.w > 200) richText(ctx.t('full'), X(0) + 6, Y(saturationCurrent(100)) - 9, fs - 0.5, theme.muted, 'left', 600, haloCol());
      // U_G markieren
      const UG = maxKineticEnergy(lam, Wv);
      if (UG > 0 && UG < U_AXIS) {
        g.fillStyle = inkOf(p.lam);
        g.beginPath();
        g.arc(X(UG), Y(0), 4.5, 0, TAU);
        g.fill();
        if (p.val && !ctx.isHidden('ekin')) richText(`U_[G] = ${fx(UG, 2)} V`, X(UG) + 6, Y(0) - 11, fs, inkOf(p.lam), UG > U_AXIS * 0.7 ? 'right' : 'left', 750, haloCol());
      }
      // aktueller Zustand
      const Us = soft.get('Ushow') ?? p.U;
      const Ip = photoCurrent(Us, lam, Wv, Pv);
      g.strokeStyle = withAlpha(orange(), 0.6);
      g.lineWidth = 1.2;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(X(Us), A.y + A.h);
      g.lineTo(X(Us), Y(Ip) + 8);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = theme.bg;
      g.beginPath();
      g.arc(X(Us), Y(Ip), 5.5, 0, TAU);
      g.fill();
      g.strokeStyle = orange();
      g.lineWidth = 2.6;
      g.stroke();
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = metal();
      const f = frequencyOf(p.lam);
      const E = photonEnergy(p.lam);
      const sci = (v: number, d = 2) => {
        const e = Math.floor(Math.log10(v));
        return `${fx(v / 10 ** e, d)} · 10<sup>${e}</sup>`;
      };
      ctx.readout('photon', { html: tr('photon', { lam: n(p.lam, 0), f: sci(f, 3), E: fx(E, 2), P: n(p.P, 0), n: n(Math.round((p.P / 100) * 26), 0) }) });
      const vars = { E: fx(E, 2), W: fx(m.W, 2), K: fx(maxKineticEnergy(p.lam, m.W), 2), fG: sci(thresholdFrequency(m.W)), lG: n(Math.round(thresholdWavelength(m.W)), 0) };
      ctx.readout('ekin', { html: tr(emits(p.lam, m.W) ? 'ekinYes' : 'ekinNo', vars) });
      updateNow();
      ctx.setAction('zero', { enabled: !ctx.locked });
      ctx.setAction('rec', { enabled: !ctx.locked });
      ctx.setAction('auto', { enabled: !ctx.locked });
    }
    let lastNow = '';
    function updateNow(): void {
      const I = Icur();
      const s = tr('now', { U: fx(p.U, 2), I: fx(I, 2), z: I <= I_ZERO ? ctx.t('nowZero') : '' });
      if (s === lastNow) return;
      lastNow = s;
      ctx.readout('now', { html: s });
    }

    function updateTable(): void {
      if (!points.length) {
        ctx.readout('table', ctx.t('tableNone'));
        ctx.readout('fit', ctx.t('fitFew'));
      } else {
        const head = [ctx.t('thL'), ctx.t('thF'), ctx.t('thU'), ctx.t('thE')];
        const rows = points.map((q) => `<tr><td>${n(q.lam, 0)}</td><td>${fx(frequencyOf(q.lam) / 1e14, 2)}</td><td>${fx(q.U, 2)}</td><td>${fx(q.U, 2)}</td></tr>`);
        ctx.readout('table', { html: `<table class="mini-table"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>` });
        const fit = fitLine(points.filter((q) => q.U > 0).map((q) => [frequencyOf(q.lam) / 1e14, q.U] as const));
        if (!fit) ctx.readout('fit', ctx.t('fitFew'));
        else {
          const h = fit.m / 1e14;
          ctx.readout('fit', { html: tr('fit', { h: fx(h / 1e-15, 2), hJ: fx((h * 1.602176634e-19) / 1e-34, 2), b: fx(fit.b, 2), W: fx(-fit.b, 2), fG: fx(-fit.b / fit.m, 2) }) });
        }
      }
      ctx.setAction('clear', { enabled: points.length > 0 && !ctx.locked });
    }

    /* ---------- Drehknopf ---------- */
    function hitKnob(px: number, py: number): boolean {
      return !!knob && !ctx.locked && Math.hypot(px - knob.x, py - knob.y) < knob.r + 10;
    }
    function knobTo(px: number, py: number): void {
      if (!knob) return;
      let a = Math.atan2(py - knob.y, px - knob.x) - KNOB_A0;
      a = ((a % TAU) + TAU) % TAU;
      if (a > KNOB_SPAN) a = a > KNOB_SPAN + (TAU - KNOB_SPAN) / 2 ? 0 : KNOB_SPAN;
      const U = Math.round((a / KNOB_SPAN) * 4 * 100) / 100;
      autoRun = false;
      zeroing = false;
      if (U !== p.U) ctx.set({ U });
    }
    surface.addTarget({
      contains: (px: number, py: number) => hitKnob(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (!hitKnob(q.px, q.py)) return false;
        knobDrag = true;
        surface.setCursor('grabbing');
        knobTo(q.px, q.py);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (knobDrag) knobTo(q.px, q.py);
      },
      pointerUp: () => {
        knobDrag = false;
        surface.setCursor(knobHover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitKnob(q.px, q.py) : false;
        if (h !== knobHover) {
          knobHover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'init') {
          intro.play();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        }
        if (source !== 'sim') {
          autoRun = false;
          if (source !== 'init') zeroing = false;
        }
        if (changed.has('metal') && source !== 'init') points = [];
        if (source === 'replace') {
          points = [];
          if (!prefersReducedMotion()) ctx.clock.play();
        }
        updateReadouts();
        updateTable();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'zero') {
          autoRun = false;
          if (prefersReducedMotion() || !ctx.clock.playing) ctx.set({ U: zeroU(p.lam) });
          else zeroing = true;
        } else if (id === 'rec') {
          record();
        } else if (id === 'auto') {
          points = [];
          autoIdx = 0;
          autoWait = 0;
          if (prefersReducedMotion()) {
            for (const lam of AUTO_LAM) points.push({ lam, U: zeroU(lam), born: -1e9 });
            ctx.set({ lam: AUTO_LAM[AUTO_LAM.length - 1]!, U: zeroU(AUTO_LAM[AUTO_LAM.length - 1]!) });
          } else {
            autoRun = true;
            if (!ctx.clock.playing) ctx.clock.play();
            ctx.set({ lam: AUTO_LAM[0]! });
          }
          updateTable();
        } else if (id === 'clear') {
          autoRun = false;
          points = [];
          updateTable();
        }
        ctx.requestRender();
      },

      tick(dt) {
        tickParticles(Math.min(dt, 0.05));
        updateNow();
      },

      resetTime() {
        photons = [];
        electrons = [];
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        const lay = computeLayout();
        surface.begin();
        drawScene(lay.scene);
        drawEChart(lay.a, stage(0.2, 0.5));
        drawIChart(lay.b, stage(0.32, 0.5));
        if (animating || intro.running || warn.running || autoRun || zeroing || knobDrag || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});

