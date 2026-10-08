import { defineSimulation, FixedStepper, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { holdRange, inclineForces, limitAngle, MATERIALS, pullUpForce, ROLLING, slideAcceleration, slideStep, type InclineForces, type MaterialId, type SlideState } from './model';

const L = (de: string, en: string) => ({ de, en });
type Pt = [number, number];
type Mat = MaterialId | 'custom';

/** Länge der Ebene in m. */
const PLANE = 1;
/** Länge des Körpers entlang der Ebene in m. */
const BODY = 0.22;
const S_MIN = BODY / 2 + 0.02;
const S_MAX = PLANE - BODY / 2 - 0.012;
const S_START = 0.42;
const MAX_ANGLE = 70;
const FZ_MAX = 50;
/** Ausschlag des Kraftmessers: voller Auszug bei dieser Kraft. */
const METER_RANGE = 20;
const MAX_POINTS = 16;

interface Measurement {
  a: number;
  F: number;
  body: 'block' | 'cart';
}

/**
 * Schiefe Ebene: Klotz oder Wagen auf einer Ebene mit einstellbarem
 * Neigungswinkel. Zerlegung der Gewichtskraft in Hangabtriebs- und
 * Normalkraft, Haft- und Gleitreibung (Materialpaare), Grenzwinkel,
 * Loslassen mit a = g · (sin α − μ_G · cos α), Zugkraft mit dem Kraftmesser
 * und das Diagramm F(α) mit Messwerten.
 */
export default defineSimulation({
  id: 'schiefe-ebene',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.68 },
  groups: [
    { id: 'meter', label: L('Kraftmesser', 'Spring balance') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'a', type: 'number', label: L('Neigungswinkel α', 'Angle of inclination α'), min: 0, max: MAX_ANGLE, step: 1, default: 20, unit: '°' },
    { key: 'm', type: 'number', label: L('Masse m', 'Mass m'), min: 0.1, max: 5, step: 0.1, default: 1, unit: 'kg' },
    {
      key: 'body',
      type: 'choice',
      label: L('Körper', 'Body'),
      options: [
        { value: 'block', label: L('Klotz (gleitet)', 'Block (slides)') },
        { value: 'cart', label: L('Wagen (rollt)', 'Cart (rolls)') },
      ],
      default: 'block',
    },
    {
      key: 'mat',
      type: 'choice',
      label: L('Materialpaar', 'Pair of materials'),
      help: L('Richtwerte für die Reibungszahlen – sie hängen stark von den Oberflächen ab.', 'Typical values of the coefficients of friction – they depend strongly on the surfaces.'),
      options: [
        { value: 'wood', label: L('Holz auf Holz', 'wood on wood') },
        { value: 'steel', label: L('Stahl auf Stahl', 'steel on steel') },
        { value: 'rubber', label: L('Gummi auf Asphalt', 'rubber on asphalt') },
        { value: 'ice', label: L('Stahl auf Eis', 'steel on ice') },
        { value: 'custom', label: L('eigene Werte', 'own values') },
      ],
      default: 'wood',
      visibleIf: (v) => v.body === 'block',
    },
    { key: 'mh', type: 'number', label: L('Haftreibungszahl μ_H', 'Coefficient of static friction μ_s'), min: 0, max: 1.2, step: 0.01, default: 0.5, visibleIf: (v) => v.body === 'block' && v.mat === 'custom' },
    { key: 'mg', type: 'number', label: L('Gleitreibungszahl μ_G', 'Coefficient of kinetic friction μ_k'), min: 0, max: 1.2, step: 0.01, default: 0.3, visibleIf: (v) => v.body === 'block' && v.mat === 'custom' },
    { key: 'km', type: 'boolean', group: 'meter', label: L('Kraftmesser parallel zur Ebene', 'Spring balance parallel to the slope'), default: false },
    {
      key: 'fz',
      type: 'number',
      group: 'meter',
      label: L('Zugkraft F_Z (hangaufwärts)', 'Pulling force F_Z (up the slope)'),
      help: L('Oder am Ring des Kraftmessers ziehen.', 'Or pull the ring of the spring balance.'),
      min: 0,
      max: FZ_MAX,
      step: 0.1,
      default: 3,
      unit: 'N',
      visibleIf: (v) => v.km === true,
    },
    { key: 'parts', type: 'boolean', group: 'view', label: L('Gewichtskraft zerlegen', 'Resolve the weight'), default: true },
    { key: 'dims', type: 'boolean', group: 'view', label: L('Höhe h und Länge l', 'Height h and length l'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'release', label: L('Loslassen', 'Release'), primary: true },
    { id: 'measure', label: L('Messwert eintragen', 'Record a measurement'), visibleIf: (v) => v.km === true },
    { id: 'clear', label: L('Messwerte löschen', 'Clear measurements'), visibleIf: (v) => v.km === true },
  ],
  readouts: [
    { key: 'fg', label: L('Gewichtskraft', 'Weight') },
    { key: 'parts', label: L('Zerlegung', 'Components'), spoiler: true },
    { key: 'fric', label: L('Reibung', 'Friction'), spoiler: true },
    { key: 'limit', label: L('Grenzwinkel', 'Limiting angle'), spoiler: true },
    { key: 'state', label: L('Was passiert beim Loslassen?', 'What happens on release?'), spoiler: true },
    { key: 'pull', label: L('Zugkraft', 'Pulling force'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
    { key: 'table', label: L('Messwerte', 'Measurements') },
  ],
  presets: [
    { id: 'start', label: L('Holzklotz bei 20°', 'Wooden block at 20°'), values: {} },
    { id: 'slide', label: L('Holzklotz rutscht', 'Wooden block slides'), values: { a: 35 } },
    { id: 'ice', label: L('Stahl auf Eis', 'Steel on ice'), values: { mat: 'ice', a: 10 } },
    { id: 'cart', label: L('Wagen mit Kraftmesser', 'Cart with spring balance'), values: { body: 'cart', km: true, fz: 3, a: 20 } },
    { id: 'pull', label: L('Klotz hochziehen', 'Pulling the block up'), values: { km: true, fz: 8.5 } },
    { id: 'rubber', label: L('Gummi: Grenzwinkel finden', 'Rubber: find the limiting angle'), values: { mat: 'rubber', a: 38, parts: false } },
  ],
  strings: {
    de: {
      canvas: 'Schiefe Ebene mit Klotz oder Wagen, zerlegter Gewichtskraft, Reibungskraft und Kraftmesser, daneben das Diagramm der Kräfte über dem Neigungswinkel',
      axisA: 'α in °',
      axisF: 'F in N',
      block: 'Klotz',
      cart: 'Wagen',
      stuck: 'haftet',
      sliding: 'rutscht',
      rolling: 'rollt',
      up: 'wird hochgezogen',
      bottom: 'unten angekommen',
      top: 'oben angekommen',
      rest: 'ruht',
      limitLine: 'α_G = {a}°',
      fgText: 'F_G = m · g = {m} kg · 9,81 N/kg = {F} N',
      partsText: 'F_H = F_G · sin α = F_G · h/l = {FH} N · F_N = F_G · cos α = {FN} N',
      fricText: 'Haftreibung höchstens F_R,max = μ_H · F_N = {Fmax} N · Gleitreibung F_R = μ_G · F_N = {Fs} N (μ_H = {mh}, μ_G = {mg})',
      fricCart: 'Rollreibung sehr klein (Reibungszahl {mu}) – der Wagen rollt schon bei kleinster Neigung.',
      limitText: 'tan α_G = μ_H = {mh} → α_G ≈ {a}°',
      stateStuck: 'Der Körper bleibt liegen: F_H = {FH} N ist nicht größer als F_R,max = {Fmax} N.',
      stateSlide: 'Der Körper gleitet hinab mit a = g · (sin α − μ_G · cos α) ≈ {acc} m/s².',
      stateRoll: 'Der Wagen rollt hinab mit a ≈ g · sin α ≈ {acc} m/s².',
      statePullUp: 'Die Zugkraft ist größer als F_H + F_R,max – der Körper wird mit a ≈ {acc} m/s² hinaufgezogen.',
      statePullDown: 'Die Zugkraft reicht nicht: Der Körper gleitet mit a ≈ {acc} m/s² hinab.',
      statePullDownCart: 'Die Zugkraft ist kleiner als F_H: Der Wagen rollt mit a ≈ {acc} m/s² hinab.',
      statePullUpCart: 'Die Zugkraft ist größer als F_H: Der Wagen rollt mit a ≈ {acc} m/s² hinauf.',
      statePullHold: 'Die Zugkraft hält den Körper fest (zwischen {lo} N und {hi} N bleibt er liegen).',
      statePullHoldCart: 'Die Zugkraft hält den Wagen fest: Sie ist (fast genau) so groß wie F_H = {FH} N.',
      pullText: 'F_Z = {F} N · Halten: {lo} N bis {hi} N · gleichmäßig hochziehen: F_H + F_R = {up} N',
      pullCart: 'F_Z = {F} N · Zum Halten nötig: F_Z = F_H = {FH} N',
      nowText: 't = {t} s · s = {s} cm · v = {v} m/s',
      none: 'Stell die Zugkraft so ein, dass der Körper ruht, und trage den Wert ein.',
      thA: 'α in °',
      thF: 'F_Z in N',
      moving: 'Erst eintragen, wenn der Körper ruht.',
      notHeld: 'Mit dieser Zugkraft bleibt der Körper nicht liegen.',
      golden: 'Goldene Regel: F_H · l = F_G · h',
      lgG: 'Gewichtskraft',
      lgH: 'Hangabtriebskraft',
      lgN: 'Normalkraft',
      lgRh: 'Haftreibung',
      lgRs: 'Gleitreibung',
      lgZ: 'Zugkraft',
    },
    en: {
      canvas: 'Inclined plane with a block or cart, the weight resolved into components, friction and a spring balance, next to it a graph of the forces against the angle',
      axisA: 'α in °',
      axisF: 'F in N',
      block: 'block',
      cart: 'cart',
      stuck: 'at rest (static friction)',
      sliding: 'slides',
      rolling: 'rolls',
      up: 'is pulled up',
      bottom: 'reached the bottom',
      top: 'reached the top',
      rest: 'at rest',
      limitLine: 'α_G = {a}°',
      fgText: 'F_G = m · g = {m} kg · 9.81 N/kg = {F} N',
      partsText: 'F_H = F_G · sin α = F_G · h/l = {FH} N · F_N = F_G · cos α = {FN} N',
      fricText: 'static friction at most F_R,max = μ_H · F_N = {Fmax} N · kinetic friction F_R = μ_G · F_N = {Fs} N (μ_H = {mh}, μ_G = {mg})',
      fricCart: 'Rolling friction is very small (coefficient {mu}) – the cart rolls even at the smallest incline.',
      limitText: 'tan α_G = μ_H = {mh} → α_G ≈ {a}°',
      stateStuck: 'The body stays put: F_H = {FH} N is not larger than F_R,max = {Fmax} N.',
      stateSlide: 'The body slides down with a = g · (sin α − μ_G · cos α) ≈ {acc} m/s².',
      stateRoll: 'The cart rolls down with a ≈ g · sin α ≈ {acc} m/s².',
      statePullUp: 'The pulling force is larger than F_H + F_R,max – the body is pulled up with a ≈ {acc} m/s².',
      statePullDown: 'The pulling force is too small: the body slides down with a ≈ {acc} m/s².',
      statePullDownCart: 'The pulling force is smaller than F_H: the cart rolls down with a ≈ {acc} m/s².',
      statePullUpCart: 'The pulling force is larger than F_H: the cart rolls up with a ≈ {acc} m/s².',
      statePullHold: 'The pulling force holds the body (it stays put between {lo} N and {hi} N).',
      statePullHoldCart: 'The pulling force holds the cart: it is (almost exactly) as large as F_H = {FH} N.',
      pullText: 'F_Z = {F} N · holding: {lo} N to {hi} N · pulling up steadily: F_H + F_R = {up} N',
      pullCart: 'F_Z = {F} N · needed to hold: F_Z = F_H = {FH} N',
      nowText: 't = {t} s · s = {s} cm · v = {v} m/s',
      none: 'Set the pulling force so that the body stays at rest and record the value.',
      thA: 'α in °',
      thF: 'F_Z in N',
      moving: 'Record only when the body is at rest.',
      notHeld: 'With this pulling force the body does not stay at rest.',
      golden: 'Golden rule: F_H · l = F_G · h',
      lgG: 'weight',
      lgH: 'downhill force',
      lgN: 'normal force',
      lgRh: 'static friction',
      lgRs: 'kinetic friction',
      lgZ: 'pulling force',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const subs = (t: string) => ({ html: t.replace(/([Fμα])_([A-Za-z]+(?:,max)?)/g, '<var>$1</var><sub>$2</sub>') });
    const narrow = () => surface.width < 640;
    const reduced = prefersReducedMotion();

    function regions(): { scene: Rect; chart: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (w >= 640) {
        const sw = Math.round(w * 0.6);
        return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw + 10, y: 0, w: w - sw - 10, h } };
      }
      const sh = Math.round(h * 0.58);
      return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 8, w, h: h - sh - 8 } };
    }

    /** Unsichtbares Koordinatensystem über der Szene (Welt = Pixel, y gespiegelt) für die Griffe. */
    const scene = new Plot(surface, { x: [0, 1], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().scene });
    const chart = new Plot(surface, {
      x: [0, 90],
      y: [0, 10],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().chart,
      xAxis: { label: ctx.t('axisA'), minStep: 10 },
      yAxis: { label: ctx.t('axisF') },
    });

    /* ---------- Zustand ---------- */
    const mu = (): { muH: number; muG: number } => {
      if (p.body === 'cart') return { muH: ROLLING, muG: ROLLING };
      if (p.mat === 'custom') return { muH: p.mh, muG: Math.min(p.mg, p.mh) };
      return MATERIALS[p.mat as MaterialId];
    };
    const forces = (alpha = p.a): InclineForces => {
      const { muH, muG } = mu();
      return inclineForces(p.m, alpha, muH, muG);
    };
    const pull = () => (p.km ? p.fz : 0);
    let state: SlideState = { s: S_START, v: 0 };
    let t = 0;
    let friction = 0;
    let reason: 'stuck' | 'bottom' | 'top' | null = null;
    const stepper = new FixedStepper(0.002);
    let points: Measurement[] = [];
    let hint = '';
    let hintUntil = 0;
    /** Geometrie der Szene (für Griffe). */
    let geo: { P0: Pt; L: number; groundY: number; r: Rect } | null = null;

    /** Ruhezustand ohne Bewegung: hält die Haftreibung (bzw. der Kraftmesser) den Körper? */
    function staticFriction(): { held: boolean; friction: number } {
      const f = forces();
      const D = f.FH - pull();
      return { held: Math.abs(D) <= f.FRmax + 1e-9, friction: -Math.sign(D) * Math.min(Math.abs(D), f.FRmax) };
    }

    function resetMotion(): void {
      state = { s: S_START, v: 0 };
      t = 0;
      reason = null;
      friction = staticFriction().friction;
      stepper.reset();
    }

    /* ---------- Ergebnisse ---------- */
    const N = (v: number) => fmt.num(v, 2);

    function updateNow(): void {
      ctx.readout('now', tr('nowText', { t: fmt.fixed(t, 2), s: fmt.num((state.s - S_START) * 100, 1), v: fmt.num(Math.abs(state.v), 2) }));
    }

    function updateReadouts(): void {
      const f = forces();
      const { muH, muG } = mu();
      const cart = p.body === 'cart';
      ctx.readout('fg', subs(tr('fgText', { m: fmt.num(p.m, 1), F: N(f.FG) })));
      ctx.readout('parts', subs(`${tr('partsText', { FH: N(f.FH), FN: N(f.FN) })}${cart ? ` · ${ctx.t('golden')}` : ''}`));
      if (cart) {
        ctx.readout('fric', ctx.t('fricCart').replace('{mu}', fmt.num(ROLLING, 3)));
        ctx.readout('limit', null);
      } else {
        ctx.readout('fric', subs(tr('fricText', { Fmax: N(f.FRmax), Fs: N(f.FRslide), mh: fmt.num(muH, 2), mg: fmt.num(muG, 2) })));
        ctx.readout('limit', subs(tr('limitText', { mh: fmt.num(muH, 2), a: fmt.num(limitAngle(muH), 1) })));
      }
      // Was passiert beim Loslassen?
      const P = pull();
      const D = f.FH - P;
      let st: string;
      if (Math.abs(D) <= f.FRmax + 1e-9) st = P > 0 ? (cart ? tr('statePullHoldCart', { FH: N(f.FH) }) : tr('statePullHold', holdVars(f))) : tr('stateStuck', { FH: N(f.FH), Fmax: N(f.FRmax) });
      else {
        const acc = (Math.abs(D) - f.FRslide) / p.m;
        if (D < 0) st = tr(cart ? 'statePullUpCart' : 'statePullUp', { acc: fmt.num(acc, 2) });
        else if (P > 0) st = tr(cart ? 'statePullDownCart' : 'statePullDown', { acc: fmt.num(acc, 2) });
        else st = cart ? tr('stateRoll', { acc: fmt.num(slideAcceleration(p.a, ROLLING), 2) }) : tr('stateSlide', { acc: fmt.num(slideAcceleration(p.a, muG), 2) });
      }
      ctx.readout('state', subs(st));
      if (p.km) {
        ctx.readout('pull', subs(cart ? tr('pullCart', { F: fmt.num(P, 1), FH: N(f.FH) }) : tr('pullText', { F: fmt.num(P, 1), ...holdVars(f), up: N(pullUpForce(f)) })));
        if (points.length) {
          const rows = points
            .slice(-10)
            .map((q) => `<tr><td>${fmt.num(q.a, 0)}</td><td>${fmt.num(q.F, 1)}</td></tr>`)
            .join('');
          ctx.readout('table', { html: `<table class="mini-table"><tr><th>${ctx.t('thA')}</th><th>${subs(ctx.t('thF')).html}</th></tr>${rows}</table>` });
        } else ctx.readout('table', ctx.t('none'));
      } else {
        ctx.readout('pull', null);
        ctx.readout('table', null);
      }
      updateNow();
      ctx.setAction('measure', { enabled: !ctx.locked });
      ctx.setAction('clear', { enabled: points.length > 0 && !ctx.locked });
    }

    function holdVars(f: InclineForces): { lo: string; hi: string } {
      const [lo, hi] = holdRange(f);
      return { lo: N(lo), hi: N(hi) };
    }

    function showHint(key: string): void {
      hint = ctx.t(key);
      hintUntil = performance.now() + 2600;
      ctx.requestRender();
    }

    /* ---------- Griffe ---------- */
    const toWorld = (pt: Pt): Pt => [pt[0], -pt[1]];
    // Oberes Ende der Ebene: Neigungswinkel
    scene.addHandle({
      get: () => {
        if (!geo) return [NaN, NaN];
        const a = (p.a * Math.PI) / 180;
        return toWorld([geo.P0[0] + geo.L * Math.cos(a), geo.P0[1] - geo.L * Math.sin(a)]);
      },
      set: (x, y) => {
        if (!geo) return;
        const a = (Math.atan2(geo.P0[1] + y, x - geo.P0[0]) * 180) / Math.PI;
        ctx.set({ a: Math.max(0, Math.min(MAX_ANGLE, Math.round(a))) });
      },
      enabled: () => !ctx.locked && !ctx.clock.playing,
      color: () => ctx.theme.series[3]!,
    });
    // Körper entlang der Ebene verschieben
    scene.addHandle({
      get: () => {
        if (!geo) return [NaN, NaN];
        const c = bodyCenter(geo, state.s);
        return toWorld(c);
      },
      set: (x, y) => {
        if (!geo) return;
        const a = (p.a * Math.PI) / 180;
        const T: Pt = [geo.P0[0] + geo.L * Math.cos(a), geo.P0[1] - geo.L * Math.sin(a)];
        const px = x;
        const py = -y;
        // Projektion auf die Ebene, gemessen vom oberen Ende hangabwärts
        const s = ((px - T[0]) * -Math.cos(a) + (py - T[1]) * Math.sin(a)) / geo.L;
        state = { s: Math.max(S_MIN, Math.min(S_MAX, s)), v: 0 };
        t = 0;
        reason = null;
        friction = staticFriction().friction;
        updateNow();
      },
      enabled: () => !ctx.locked && !ctx.clock.playing,
      color: () => ctx.theme.series[0]!,
    });
    // Ring des Kraftmessers: Zugkraft
    scene.addHandle({
      get: () => {
        if (!geo || !p.km) return [NaN, NaN];
        return toWorld(meterGeo(geo).ring);
      },
      set: (x, y) => {
        if (!geo) return;
        const mg = meterGeo(geo);
        const a = (p.a * Math.PI) / 180;
        const along = (x - mg.start[0]) * Math.cos(a) + (-y - mg.start[1]) * -Math.sin(a);
        let F = ((along - mg.fixed) / mg.ext) * METER_RANGE;
        F = Math.max(0, Math.min(FZ_MAX, F));
        // in der Nähe der Haltekraft einrasten (Wagen: F_H)
        const f = forces();
        const snap = p.body === 'cart' ? f.FH : null;
        if (snap !== null && Math.abs(F - snap) < 0.25) F = snap;
        ctx.set({ fz: F });
      },
      enabled: () => !ctx.locked && p.km && !ctx.clock.playing,
      color: () => ctx.theme.series[4]!,
    });

    /* ---------- Geometrie ---------- */
    const small = () => narrow();
    function sceneGeo(r: Rect): { P0: Pt; L: number; groundY: number; r: Rect } {
      const sm = small();
      // Tischplatte so hoch, dass die Kraftpfeile darunter Platz haben
      const groundY = r.y + r.h * (sm ? 0.76 : 0.72);
      const left = sm ? 40 : 78;
      const sinMax = Math.sin((MAX_ANGLE * Math.PI) / 180);
      const L = Math.min(r.w - left - (sm ? 54 : 70), (groundY - r.y - (sm ? 30 : 40)) / sinMax);
      return { P0: [r.x + left, groundY], L, groundY, r };
    }

    /** Berührpunkt des Körpers auf der Ebene (Mitte der Unterseite). */
    function contactPoint(g0: { P0: Pt; L: number }, s: number): Pt {
      const a = (p.a * Math.PI) / 180;
      const T: Pt = [g0.P0[0] + g0.L * Math.cos(a), g0.P0[1] - g0.L * Math.sin(a)];
      return [T[0] - Math.cos(a) * g0.L * s, T[1] + Math.sin(a) * g0.L * s];
    }

    function bodySize(g0: { L: number }): { bw: number; bh: number } {
      const bw = BODY * g0.L;
      return { bw, bh: p.body === 'cart' ? bw * 0.5 : bw * 0.58 };
    }

    function bodyCenter(g0: { P0: Pt; L: number }, s: number): Pt {
      const a = (p.a * Math.PI) / 180;
      const c = contactPoint(g0, s);
      const { bh } = bodySize(g0);
      // Normale nach außen (weg von der Ebene)
      return [c[0] - Math.sin(a) * (bh / 2), c[1] - Math.cos(a) * (bh / 2)];
    }

    /** Kraftmesser: vom Körper hangaufwärts. */
    function meterGeo(g0: { P0: Pt; L: number }): { start: Pt; u: Pt; ring: Pt; fixed: number; ext: number; hook: number; housing: number; width: number } {
      const a = (p.a * Math.PI) / 180;
      const sm = small();
      const { bw } = bodySize(g0);
      const c = bodyCenter(g0, state.s);
      const u: Pt = [Math.cos(a), -Math.sin(a)];
      const start: Pt = [c[0] + u[0] * (bw / 2), c[1] + u[1] * (bw / 2)];
      const hook = sm ? 8 : 10;
      const housing = sm ? 46 : 62;
      const ext = sm ? 46 : 70;
      const ring = sm ? 6 : 7.5;
      const fixed = hook + housing + ring;
      const len = fixed + (Math.min(p.fz, METER_RANGE) / METER_RANGE) * ext;
      return { start, u, ring: [start[0] + u[0] * len, start[1] + u[1] * len], fixed, ext, hook, housing, width: sm ? 10 : 13 };
    }

    /* ---------- Zeichenhilfen ---------- */
    function pill(x0: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid = false): number {
      const gx = surface.g;
      const theme = ctx.theme;
      gx.font = `700 ${size}px ${theme.font}`;
      const w = gx.measureText(label).width + 16;
      const h = size + 11;
      const left = Math.max(4, Math.min(surface.width - 4 - w, align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2));
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 1;
      gx.fillStyle = solid ? color : theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(gx, left, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      if (!solid) {
        gx.strokeStyle = withAlpha(color, 0.5);
        gx.lineWidth = 1;
        roundRect(gx, left + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        gx.stroke();
      }
      text(gx, label, left + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: solid ? '#ffffff' : color });
      return w;
    }

    function haloText(label: string, x: number, y: number, color: string, size: number, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle'): void {
      const gx = surface.g;
      gx.font = `700 ${size}px ${ctx.theme.font}`;
      const m = gx.getTransform();
      if (m.b === 0 && m.c === 0 && m.e === 0 && m.f === 0) {
        const tw = gx.measureText(label).width;
        const left = align === 'left' ? x : align === 'right' ? x - tw : x - tw / 2;
        x += Math.max(0, 4 - left) - Math.max(0, left + tw - (surface.width - 4));
      }
      gx.textAlign = align;
      gx.textBaseline = baseline;
      gx.lineJoin = 'round';
      gx.lineWidth = 4;
      gx.strokeStyle = ctx.theme.bg;
      gx.strokeText(label, x, y);
      gx.fillStyle = color;
      gx.fillText(label, x, y);
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width = 3.4, head = 13, dash: number[] = []): void {
      const gx = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 3) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hl = Math.min(head, len * 0.55);
      const bx = x1 - ux * hl;
      const by = y1 - uy * hl;
      gx.save();
      gx.lineCap = 'round';
      gx.lineJoin = 'round';
      for (const pass of [0, 1]) {
        const c = pass === 0 ? withAlpha(ctx.theme.bg, 0.85) : color;
        gx.strokeStyle = c;
        gx.fillStyle = c;
        gx.lineWidth = pass === 0 ? width + 3 : width;
        gx.setLineDash(pass === 0 ? [] : dash);
        gx.beginPath();
        gx.moveTo(x0, y0);
        gx.lineTo(bx, by);
        gx.stroke();
        gx.setLineDash([]);
        gx.beginPath();
        gx.moveTo(x1, y1);
        gx.lineTo(bx - uy * hl * 0.45, by + ux * hl * 0.45);
        gx.lineTo(bx + uy * hl * 0.45, by - ux * hl * 0.45);
        gx.closePath();
        gx.fill();
        if (pass === 0) gx.stroke();
      }
      gx.restore();
    }

    function dashed(a: Pt, b: Pt, color: string, width = 1.3, dash = [4, 4]): void {
      const gx = surface.g;
      gx.save();
      gx.strokeStyle = color;
      gx.lineWidth = width;
      gx.setLineDash(dash);
      gx.beginPath();
      gx.moveTo(a[0], a[1]);
      gx.lineTo(b[0], b[1]);
      gx.stroke();
      gx.restore();
    }

    /* ---------- Szene ---------- */
    function surfaceStyle(): { top: string; edge: string; label: string } {
      const mat = p.body === 'cart' ? 'wood' : (p.mat as Mat);
      switch (mat) {
        case 'steel':
          return { top: '#b9c1cc', edge: '#6b7584', label: 'steel' };
        case 'rubber':
          return { top: '#4a4f57', edge: '#2b2f36', label: 'asphalt' };
        case 'ice':
          return { top: '#d6f0ff', edge: '#8cc8ea', label: 'ice' };
        default:
          return { top: '#d9a96a', edge: '#9c6c37', label: 'wood' };
      }
    }

    function drawScene(r: Rect): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = small();
      const g0 = sceneGeo(r);
      geo = g0;
      const a = (p.a * Math.PI) / 180;
      const { P0, L, groundY } = g0;
      const T: Pt = [P0[0] + L * Math.cos(a), P0[1] - L * Math.sin(a)];
      const B: Pt = [T[0], groundY];
      // Raum und Tisch
      const wall = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f2f5f9');
      wall.addColorStop(1, dark ? '#0f1723' : '#e0e6ee');
      gx.fillStyle = wall;
      gx.fillRect(r.x, r.y, r.w, r.h);
      // Labortisch: Platte und Vorderseite
      const top = gx.createLinearGradient(0, groundY, 0, groundY + 12);
      top.addColorStop(0, dark ? '#5a4632' : '#d2a877');
      top.addColorStop(1, dark ? '#4a3a2b' : '#b88a5a');
      gx.fillStyle = top;
      gx.fillRect(r.x, groundY, r.w, 12);
      const front = gx.createLinearGradient(0, groundY + 12, 0, r.y + r.h);
      front.addColorStop(0, dark ? '#3a2d21' : '#a77b4d');
      front.addColorStop(1, dark ? '#2a2018' : '#8a6239');
      gx.fillStyle = front;
      gx.fillRect(r.x, groundY + 12, r.w, r.y + r.h - groundY - 12);
      gx.fillStyle = 'rgba(255,255,255,0.25)';
      gx.fillRect(r.x, groundY, r.w, 1.5);
      gx.fillStyle = 'rgba(0,0,0,0.18)';
      gx.fillRect(r.x, groundY + 12, r.w, 2);

      // Keil
      const st = surfaceStyle();
      gx.save();
      gx.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      gx.shadowBlur = 10;
      gx.shadowOffsetY = 3;
      const wedge = gx.createLinearGradient(P0[0], groundY, T[0], T[1]);
      wedge.addColorStop(0, dark ? '#5a6474' : '#aeb6c2');
      wedge.addColorStop(1, dark ? '#3d4553' : '#8892a0');
      gx.fillStyle = wedge;
      gx.beginPath();
      gx.moveTo(P0[0], P0[1]);
      gx.lineTo(B[0], B[1]);
      gx.lineTo(T[0], T[1]);
      gx.closePath();
      gx.fill();
      gx.restore();
      // Oberfläche (Material)
      const thick = sm ? 4 : 6;
      gx.save();
      gx.beginPath();
      gx.moveTo(P0[0], P0[1]);
      gx.lineTo(T[0], T[1]);
      gx.lineTo(T[0] + Math.sin(a) * thick, T[1] + Math.cos(a) * thick);
      gx.lineTo(P0[0] + Math.sin(a) * thick, P0[1] + Math.cos(a) * thick);
      gx.closePath();
      gx.fillStyle = st.top;
      gx.fill();
      gx.strokeStyle = st.edge;
      gx.lineWidth = 1;
      gx.stroke();
      if (st.label === 'asphalt') {
        gx.fillStyle = 'rgba(255,255,255,0.35)';
        for (let i = 0; i < 60; i++) {
          const f = (i * 0.618) % 1;
          const q = ((i * 0.37) % 1) * thick;
          gx.fillRect(P0[0] + (T[0] - P0[0]) * f + Math.sin(a) * q, P0[1] + (T[1] - P0[1]) * f + Math.cos(a) * q, 1.2, 1.2);
        }
      } else if (st.label === 'ice') {
        gx.strokeStyle = 'rgba(255,255,255,0.8)';
        gx.lineWidth = 1.2;
        gx.beginPath();
        gx.moveTo(P0[0] + (T[0] - P0[0]) * 0.1, P0[1] + (T[1] - P0[1]) * 0.1 + 1.5);
        gx.lineTo(P0[0] + (T[0] - P0[0]) * 0.9, P0[1] + (T[1] - P0[1]) * 0.9 + 1.5);
        gx.stroke();
      }
      gx.restore();

      // Anschlag am unteren Ende der Ebene
      {
        const { bh } = bodySize(g0);
        gx.save();
        gx.translate(P0[0], P0[1]);
        gx.rotate(-a);
        gx.fillStyle = dark ? '#8a929e' : '#4a5361';
        roundRect(gx, -1, -bh * 0.45, (S_MAX + BODY / 2 > PLANE - 0.02 ? (PLANE - S_MAX - BODY / 2) * L : 4) + 2, bh * 0.45, 1.5);
        gx.fill();
        gx.restore();
      }
      // Winkel α
      const ar = sm ? 30 : 42;
      gx.strokeStyle = theme.series[3]!;
      gx.lineWidth = 1.8;
      gx.beginPath();
      gx.arc(P0[0], P0[1], ar, 0, -a, true);
      gx.stroke();
      if (p.a > 0) haloText(`α = ${fmt.num(p.a, 0)}°`, P0[0] + Math.cos(a / 3) * (ar + 26), P0[1] - Math.sin(a / 3) * (ar + 26) + 6, theme.series[3]!, sm ? 11 : 12.5, 'left');

      // Höhe und Länge
      if (p.dims && p.a > 0) {
        const off = sm ? 12 : 16;
        const hx = B[0] + off;
        gx.strokeStyle = theme.muted;
        gx.lineWidth = 1.5;
        gx.beginPath();
        gx.moveTo(hx, B[1]);
        gx.lineTo(hx, T[1]);
        gx.moveTo(hx - 4, B[1]);
        gx.lineTo(hx + 4, B[1]);
        gx.moveTo(hx - 4, T[1]);
        gx.lineTo(hx + 4, T[1]);
        gx.stroke();
        const hcm = PLANE * Math.sin(a) * 100;
        if (B[1] - T[1] > 18) haloText(`h = ${fmt.num(hcm, 0)} cm`, hx + 6, (B[1] + T[1]) / 2, theme.muted, sm ? 10.5 : 12, 'left');
        // l entlang der Ebene, nach außen versetzt
        const n: Pt = [-Math.sin(a), -Math.cos(a)];
        const lo = sm ? 30 : 40;
        const A1: Pt = [P0[0] + n[0] * lo, P0[1] + n[1] * lo];
        const A2: Pt = [T[0] + n[0] * lo, T[1] + n[1] * lo];
        gx.strokeStyle = theme.muted;
        gx.lineWidth = 1.5;
        gx.beginPath();
        gx.moveTo(A1[0], A1[1]);
        gx.lineTo(A2[0], A2[1]);
        gx.moveTo(A1[0] - n[0] * 4, A1[1] - n[1] * 4);
        gx.lineTo(A1[0] + n[0] * 4, A1[1] + n[1] * 4);
        gx.moveTo(A2[0] - n[0] * 4, A2[1] - n[1] * 4);
        gx.lineTo(A2[0] + n[0] * 4, A2[1] + n[1] * 4);
        gx.stroke();
        gx.save();
        // Beschriftung im oberen Teil, damit sie nicht mit den Kräften am Körper kollidiert
        gx.translate(A1[0] + (A2[0] - A1[0]) * 0.78 + n[0] * 10, A1[1] + (A2[1] - A1[1]) * 0.78 + n[1] * 10);
        gx.rotate(-a);
        haloText(`l = ${fmt.num(PLANE, 2)} m`, 0, 0, theme.muted, sm ? 10.5 : 12);
        gx.restore();
      }

      // Kraftmesser
      if (p.km) drawMeter(g0);
      // Körper
      drawBody(g0);
      // Kräfte
      drawForces(g0);
      // Status
      const label = statusLabel();
      const right = `t = ${fmt.fixed(t, 2)} s · v = ${fmt.num(Math.abs(state.v), 2)} m/s`;
      if (sm) {
        if (label) pill(r.x + 8, r.y + 8, label.text, label.color, 'left', 11);
        else pill(r.x + r.w - 8, r.y + 8, right, theme.text, 'right', 11);
      } else {
        const legendRight = T[0] < r.x + r.w / 2;
        drawLegend(r, legendRight);
        if (label) {
          if (legendRight) pill(r.x + 10, r.y + 10, label.text, label.color, 'left', 12.5);
          else pill(r.x + r.w - 10, r.y + 10, label.text, label.color, 'right', 12.5);
        }
      }
      if (performance.now() < hintUntil && hint) pill(r.x + r.w / 2, r.y + r.h - (sm ? 30 : 40), hint, theme.series[3]!, 'center', sm ? 10.5 : 12);
    }

    /** Legende mit Namen und Beträgen der Kräfte. */
    function drawLegend(r: Rect, right: boolean): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const f = forces();
      const block = p.body === 'block';
      const fr = state.v !== 0 ? f.FRslide : Math.abs(friction);
      const rows: [string, string, number, string][] = [[theme.series[1]!, 'F_G', f.FG, ctx.t('lgG')]];
      if (p.parts) rows.push([theme.series[3]!, 'F_H', f.FH, ctx.t('lgH')], [theme.series[0]!, 'F_N', f.FN, ctx.t('lgN')]);
      if (block) rows.push([theme.series[2]!, 'F_R', fr, ctx.t(state.v !== 0 ? 'lgRs' : 'lgRh')]);
      if (p.km) rows.push([theme.series[4]!, 'F_Z', p.fz, ctx.t('lgZ')]);
      const rowH = 21;
      const w = 230;
      const h = rows.length * rowH + 14 + 26;
      const x0 = right ? r.x + r.w - 10 - w : r.x + 10;
      const y0 = r.y + 10;
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      gx.shadowBlur = 8;
      gx.shadowOffsetY = 2;
      gx.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.9)';
      roundRect(gx, x0, y0, w, h, 10);
      gx.fill();
      gx.restore();
      rows.forEach(([color, sym, value, name], i) => {
        const y = y0 + 7 + rowH * i + rowH / 2;
        gx.strokeStyle = color;
        gx.lineWidth = 3;
        gx.lineCap = 'round';
        gx.beginPath();
        gx.moveTo(x0 + 12, y);
        gx.lineTo(x0 + 28, y);
        gx.stroke();
        text(gx, sym, x0 + 36, y, { font: `700 12px ${theme.font}`, color, align: 'left' });
        text(gx, name, x0 + 66, y, { font: `600 11.5px ${theme.font}`, color: theme.muted, align: 'left' });
        text(gx, `${fmt.num(value, 2)} N`, x0 + w - 10, y, { font: `700 12px ${theme.font}`, color: theme.text, align: 'right' });
      });
      // Bewegung
      const yl = y0 + 7 + rowH * rows.length + 4;
      gx.strokeStyle = withAlpha(theme.muted, 0.25);
      gx.lineWidth = 1;
      gx.beginPath();
      gx.moveTo(x0 + 10, yl);
      gx.lineTo(x0 + w - 10, yl);
      gx.stroke();
      const moving = state.v !== 0;
      const motion = `t = ${fmt.fixed(t, 2)} s   v = ${fmt.num(Math.abs(state.v), 2)} m/s${moving ? `   a = ${fmt.num(Math.abs(currentAcc()), 2)} m/s²` : ''}`;
      text(gx, motion, x0 + 12, yl + 12, { font: `600 11.5px ${theme.font}`, color: theme.text, align: 'left' });
    }

    function statusLabel(): { text: string; color: string } | null {
      const theme = ctx.theme;
      const cart = p.body === 'cart';
      const name = ctx.t(cart ? 'cart' : 'block');
      const cap = name.charAt(0).toUpperCase() + name.slice(1);
      if (reason === 'bottom') return { text: `${cap}: ${ctx.t('bottom')}`, color: theme.text };
      if (reason === 'top') return { text: `${cap}: ${ctx.t('top')}`, color: theme.text };
      const acc = narrow() ? ` · a = ${fmt.num(Math.abs(currentAcc()), 2)} m/s²` : '';
      if (state.v > 1e-6) return { text: `${cap} ${ctx.t(cart ? 'rolling' : 'sliding')}${acc}`, color: theme.series[1]! };
      if (state.v < -1e-6) return { text: `${cap} ${ctx.t('up')}${acc}`, color: theme.series[4]! };
      if (reason === 'stuck' || ctx.clock.playing) return { text: `${cap} ${ctx.t(cart ? 'rest' : 'stuck')}`, color: theme.series[2]! };
      return null;
    }

    function currentAcc(): number {
      const f = forces();
      const D = f.FH - pull();
      const dir = state.v !== 0 ? Math.sign(state.v) : Math.sign(D);
      return (D - dir * f.FRslide) / p.m;
    }

    function drawBody(g0: { P0: Pt; L: number }): void {
      const gx = surface.g;
      const a = (p.a * Math.PI) / 180;
      const c = contactPoint(g0, state.s);
      const { bw, bh } = bodySize(g0);
      gx.save();
      gx.translate(c[0], c[1]);
      gx.rotate(-a);
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      if (p.body === 'cart') {
        const wr = bh * 0.32;
        const bodyY = -bh;
        const cg = gx.createLinearGradient(0, bodyY, 0, bodyY + bh * 0.62);
        cg.addColorStop(0, '#5b8def');
        cg.addColorStop(1, '#2a5bc8');
        gx.fillStyle = cg;
        roundRect(gx, -bw / 2, bodyY, bw, bh * 0.62, 4);
        gx.fill();
        gx.shadowColor = 'transparent';
        gx.fillStyle = 'rgba(255,255,255,0.3)';
        gx.fillRect(-bw / 2 + 3, bodyY + 2, bw - 6, 2);
        for (const x of [-bw * 0.3, bw * 0.3]) {
          gx.fillStyle = '#1d2129';
          gx.beginPath();
          gx.arc(x, -wr, wr, 0, Math.PI * 2);
          gx.fill();
          gx.fillStyle = '#c3cad3';
          gx.beginPath();
          gx.arc(x, -wr, wr * 0.45, 0, Math.PI * 2);
          gx.fill();
          // Speichen drehen sich mit dem Weg
          const rot = (state.s * g0.L) / wr;
          gx.strokeStyle = '#7d8794';
          gx.lineWidth = 1;
          gx.beginPath();
          gx.moveTo(x - Math.cos(rot) * wr * 0.4, -wr + Math.sin(rot) * wr * 0.4);
          gx.lineTo(x + Math.cos(rot) * wr * 0.4, -wr - Math.sin(rot) * wr * 0.4);
          gx.stroke();
        }
      } else {
        const mat = p.mat as Mat;
        const grad = gx.createLinearGradient(0, -bh, 0, 0);
        if (mat === 'steel' || mat === 'ice') {
          grad.addColorStop(0, '#e7ebf0');
          grad.addColorStop(0.5, '#a9b2be');
          grad.addColorStop(1, '#6b7584');
        } else if (mat === 'rubber') {
          grad.addColorStop(0, '#4b5058');
          grad.addColorStop(1, '#1f2227');
        } else {
          grad.addColorStop(0, '#e2b77d');
          grad.addColorStop(1, '#a8743c');
        }
        gx.fillStyle = grad;
        roundRect(gx, -bw / 2, -bh, bw, bh, 3);
        gx.fill();
        gx.shadowColor = 'transparent';
        if (mat === 'wood' || mat === 'custom') {
          gx.strokeStyle = 'rgba(110,65,25,0.35)';
          gx.lineWidth = 1;
          for (let i = 1; i < 4; i++) {
            gx.beginPath();
            gx.moveTo(-bw / 2 + 3, -bh + (bh * i) / 4);
            gx.bezierCurveTo(-bw / 6, -bh + (bh * i) / 4 - 2, bw / 6, -bh + (bh * i) / 4 + 2, bw / 2 - 3, -bh + (bh * i) / 4);
            gx.stroke();
          }
        }
        gx.fillStyle = 'rgba(255,255,255,0.25)';
        gx.fillRect(-bw / 2 + 3, -bh + 2, bw - 6, 1.5);
        // Haken für den Kraftmesser
        gx.strokeStyle = ctx.theme.dark ? '#c3cbd6' : '#4a5361';
        gx.lineWidth = 1.6;
        gx.beginPath();
        gx.arc(bw / 2 + 2.5, -bh / 2, 2.5, 0, Math.PI * 2);
        gx.stroke();
      }
      gx.restore();
      // Masse auf dem Körper
      const cc = bodyCenter(g0, state.s);
      gx.save();
      gx.translate(cc[0], cc[1] - (p.body === 'cart' ? bh * 0.12 : 0));
      gx.rotate(-a);
      text(gx, `${fmt.num(p.m, 1)} kg`, 0, p.body === 'cart' ? -bh * 0.12 : 0, { font: `700 ${small() ? 9.5 : 11}px ${ctx.theme.font}`, color: p.mat === 'rubber' && p.body === 'block' ? '#e6eaf0' : p.body === 'cart' ? '#ffffff' : '#3d2a06' });
      gx.restore();
    }

    function drawMeter(g0: { P0: Pt; L: number }): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const mg = meterGeo(g0);
      const color = theme.series[4]!;
      const angle = Math.atan2(mg.u[1], mg.u[0]);
      const ext = (Math.min(p.fz, METER_RANGE) / METER_RANGE) * mg.ext;
      const w = mg.width;
      gx.save();
      gx.translate(mg.start[0], mg.start[1]);
      gx.rotate(angle);
      gx.shadowColor = 'rgba(0,0,0,0.22)';
      gx.shadowBlur = 4;
      gx.shadowOffsetY = 1.5;
      gx.strokeStyle = theme.dark ? '#c3cbd6' : '#5d6570';
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.moveTo(4, 0);
      gx.lineTo(mg.hook, 0);
      gx.stroke();
      gx.fillStyle = '#fbfbf7';
      gx.fillRect(mg.hook, -w * 0.32, ext + 3, w * 0.64);
      gx.shadowColor = 'transparent';
      gx.strokeStyle = '#2a313b';
      gx.lineWidth = 1;
      for (let k = 0; k <= METER_RANGE; k++) {
        const s = mg.hook + ext - (k / METER_RANGE) * mg.ext;
        if (s < mg.hook) break;
        gx.beginPath();
        gx.moveTo(s, -w * 0.32);
        gx.lineTo(s, -w * 0.32 + (k % 5 === 0 ? w * 0.5 : w * 0.26));
        gx.stroke();
      }
      const h0 = mg.hook + ext;
      const tube = gx.createLinearGradient(0, -w / 2, 0, w / 2);
      tube.addColorStop(0, withAlpha(color, 0.55));
      tube.addColorStop(0.35, withAlpha(color, 0.22));
      tube.addColorStop(1, withAlpha(color, 0.75));
      gx.fillStyle = tube;
      roundRect(gx, h0, -w / 2, mg.housing, w, 3);
      gx.fill();
      gx.strokeStyle = color;
      gx.lineWidth = 1.4;
      roundRect(gx, h0, -w / 2, mg.housing, w, 3);
      gx.stroke();
      gx.strokeStyle = withAlpha(theme.dark ? '#e6eaf0' : '#2a313b', 0.5);
      gx.lineWidth = 1;
      gx.beginPath();
      for (let k = 0; k <= 16; k++) {
        const s = h0 + 4 + (k / 16) * (mg.housing - 8);
        const yy = (k % 2 === 0 ? -1 : 1) * w * 0.28;
        if (k === 0) gx.moveTo(s, yy);
        else gx.lineTo(s, yy);
      }
      gx.stroke();
      gx.strokeStyle = color;
      gx.lineWidth = 2.6;
      gx.beginPath();
      gx.arc(h0 + mg.housing + (mg.fixed - mg.hook - mg.housing), 0, mg.fixed - mg.hook - mg.housing, 0, Math.PI * 2);
      gx.stroke();
      gx.restore();
      // Anzeige über dem Gehäuse
      const a = (p.a * Math.PI) / 180;
      const mid = mg.hook + ext + mg.housing / 2;
      const lx = mg.start[0] + mg.u[0] * mid - Math.sin(a) * 22;
      const ly = mg.start[1] + mg.u[1] * mid - Math.cos(a) * 22;
      const label = p.fz > METER_RANGE ? `F_Z = ${fmt.num(p.fz, 1)} N (≥ ${METER_RANGE} N)` : `F_Z = ${fmt.num(p.fz, 1)} N`;
      pill(lx, ly - 11, label, color, 'center', small() ? 10.5 : 12);
    }

    function drawForces(g0: { P0: Pt; L: number }): void {
      const theme = ctx.theme;
      const sm = small();
      const a = (p.a * Math.PI) / 180;
      const f = forces();
      const C = bodyCenter(g0, state.s);
      const lf = Math.min(g0.L * 0.36, sm ? 86 : 140);
      const k = lf / f.FG;
      const down: Pt = [-Math.cos(a), Math.sin(a)];
      const inward: Pt = [Math.sin(a), Math.cos(a)];
      const fs = sm ? 10.5 : 12;
      const G1: Pt = [C[0], C[1] + f.FG * k];
      // Zerlegung: Rechteck aus F_H und F_N mit F_G als Diagonale
      if (p.parts) {
        const H: Pt = [C[0] + down[0] * f.FH * k, C[1] + down[1] * f.FH * k];
        const Nn: Pt = [C[0] + inward[0] * f.FN * k, C[1] + inward[1] * f.FN * k];
        dashed(H, G1, withAlpha(theme.text, 0.45));
        dashed(Nn, G1, withAlpha(theme.text, 0.45));
        arrowPx(C[0], C[1], H[0], H[1], theme.series[3]!, 3.2, 12);
        arrowPx(C[0], C[1], Nn[0], Nn[1], theme.series[0]!, 3.2, 12);
        // neben der Mitte des Pfeils, auf der von der Ebene abgewandten Seite
        if (f.FH * k > 14) haloText('F_H', (C[0] + H[0]) / 2 - Math.sin(a) * 14 - Math.cos(a) * 4, (C[1] + H[1]) / 2 - Math.cos(a) * 14, theme.series[3]!, fs, 'right');
        if (f.FN * k > 14) haloText('F_N', Nn[0] + Math.cos(a) * 12 + 4, Nn[1] - Math.sin(a) * 12 + 6, theme.series[0]!, fs, 'left');
        // Winkel α zwischen F_G und F_N
        if (p.a >= 6) {
          const gx = surface.g;
          const rr = sm ? 18 : 24;
          gx.strokeStyle = theme.series[3]!;
          gx.lineWidth = 1.4;
          gx.beginPath();
          gx.arc(C[0], C[1], rr, Math.PI / 2 - a, Math.PI / 2);
          gx.stroke();
          haloText('α', C[0] + Math.cos(Math.PI / 2 - a / 2) * (rr + 9), C[1] + Math.sin(Math.PI / 2 - a / 2) * (rr + 9), theme.series[3]!, fs);
        }
      }
      arrowPx(C[0], C[1], G1[0], G1[1], theme.series[1]!, 3.6, 13);
      haloText(`F_G = ${fmt.num(f.FG, 1)} N`, G1[0] - 8, G1[1] - 4, theme.series[1]!, fs, 'right');
      // Reibungskraft an der Unterseite (gegen die Bewegung bzw. die Bewegungstendenz)
      if (p.body === 'block') {
        const fr = state.v !== 0 ? -Math.sign(state.v) * f.FRslide : friction;
        if (Math.abs(fr) * k > 3) {
          const c = contactPoint(g0, state.s);
          const base: Pt = [c[0] - inward[0] * 2, c[1] - inward[1] * 2];
          const tip: Pt = [base[0] + down[0] * fr * k, base[1] + down[1] * fr * k];
          arrowPx(base[0], base[1], tip[0], tip[1], theme.series[2]!, 3.2, 12);
          haloText('F_R', tip[0] + inward[0] * 14, tip[1] + inward[1] * 14, theme.series[2]!, fs);
        }
      }
    }

    /* ---------- Diagramm ---------- */
    function drawChart(): void {
      const theme = ctx.theme;
      const sm = small();
      const f = forces();
      const { muH } = mu();
      const block = p.body === 'block';
      const yTop = Math.max(f.FG * 1.15, p.km ? Math.min(p.fz, FZ_MAX) * 1.1 : 0, ...points.map((q) => q.F * 1.1));
      chart.setRangePadded([0, 90], [0, yTop], { left: sm ? 44 : 50, right: sm ? 14 : 16, top: 30, bottom: 22 });
      const gx = chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      const fn = (a: number) => inclineForces(p.m, a, muH, mu().muG);
      chart.hline(f.FG, { color: theme.series[1], width: 1.4, dash: [6, 4] });
      chart.text(40, f.FG, 'F_G', { color: theme.series[1], size: 11.5, weight: 'bold', baseline: 'bottom', offset: [0, -4] });
      if (block) {
        const ag = limitAngle(muH);
        chart.fn((a) => fn(a).FRmax, { color: theme.series[2], width: 2.2, dash: [7, 4], from: 0, to: 90 });
        if (ag < 89) {
          chart.vline(ag, { color: theme.series[2], width: 1.2, dash: [3, 4], alpha: 0.8 });
          chart.text(ag, yTop * 0.97, tr('limitLine', { a: fmt.num(ag, 1) }), { color: theme.series[2], size: 11, weight: '600', align: ag > 60 ? 'right' : 'left', baseline: 'top', offset: [ag > 60 ? -4 : 4, 0] });
        }
      }
      chart.fn((a) => fn(a).FH, { color: theme.series[3], width: 2.6, from: 0, to: 90 });
      chart.fn((a) => fn(a).FN, { color: theme.series[0], width: 2.6, from: 0, to: 90 });
      // Beschriftung der Kurven
      chart.text(84, fn(84).FH, 'F_H', { color: theme.series[3], size: 12, weight: 'bold', align: 'right', baseline: 'bottom', offset: [0, -6] });
      chart.text(8, fn(8).FN, 'F_N', { color: theme.series[0], size: 12, weight: 'bold', baseline: 'top', offset: [2, 8] });
      if (block) chart.text(58, fn(58).FRmax, 'F_R,max', { color: theme.series[2], size: 11.5, weight: 'bold', align: 'right', baseline: 'top', offset: [-4, 6] });
      // aktueller Winkel
      chart.vline(p.a, { color: theme.muted, width: 1.2, dash: [2, 3] });
      chart.point(p.a, f.FH, { color: theme.series[3], radius: 5 });
      chart.point(p.a, f.FN, { color: theme.series[0], radius: 5 });
      if (block) chart.point(p.a, f.FRmax, { color: theme.series[2], radius: 4.5 });
      // Messwerte und aktuelle Zugkraft
      for (const q of points) chart.point(q.a, q.F, { color: q.body === 'cart' ? theme.series[4] : theme.series[5], radius: 4.5, hollow: true });
      if (p.km) chart.point(p.a, p.fz, { color: theme.series[4], radius: 5.5 });
      chart.end();
      const r = chart.rect;
      gx.save();
      gx.strokeStyle = theme.grid;
      gx.lineWidth = 1;
      roundRect(gx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      gx.stroke();
      gx.restore();
    }

    /* ---------- Bewegung ---------- */
    function integrate(dt: number): void {
      const f = forces();
      const P = pull();
      stepper.run(dt, (h) => {
        if (reason === 'bottom' || reason === 'top') return;
        const next = slideStep(state, p.m, f, P, h);
        state = { s: next.s, v: next.v };
        friction = next.friction;
        t += h;
        if (state.s >= S_MAX) {
          state = { s: S_MAX, v: 0 };
          reason = 'bottom';
          friction = staticFriction().friction;
        } else if (state.s <= S_MIN) {
          state = { s: S_MIN, v: 0 };
          reason = 'top';
        } else if (next.resting) reason = 'stuck';
        else reason = null;
      });
      if (reason) ctx.clock.pause();
    }

    function release(): void {
      if (state.s >= S_MAX - 1e-6 || state.s <= S_MIN + 1e-6) state = { s: S_START, v: 0 };
      t = 0;
      reason = null;
      stepper.reset();
      if (reduced) {
        // ohne Animation: Endzustand direkt bestimmen
        for (let i = 0; i < 20000 && !reason; i++) integrate(0.002);
        updateNow();
        return;
      }
      ctx.clock.play();
    }

    resetMotion();

    return {
      update(changed, source) {
        // Bei eigenen Werten darf die Gleitreibungszahl nicht größer als die Haftreibungszahl sein
        if (source === 'input' && p.mat === 'custom') {
          if (changed.has('mg') && p.mg > p.mh) ctx.set({ mh: p.mg });
          else if (changed.has('mh') && p.mg > p.mh) ctx.set({ mg: p.mh });
        }
        if (['body', 'm', 'mat', 'mh', 'mg'].some((key) => changed.has(key)) && source !== 'init') points = [];
        if (source === 'replace' || source === 'init') {
          ctx.clock.pause();
          resetMotion();
        }
        if (!ctx.clock.playing && state.v === 0) {
          friction = staticFriction().friction;
          if (reason === 'stuck') reason = null;
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'release') release();
        else if (id === 'measure') {
          if (ctx.clock.playing && state.v !== 0) showHint('moving');
          else if (!staticFriction().held) showHint('notHeld');
          else {
            points = [...points, { a: p.a, F: p.fz, body: p.body as 'block' | 'cart' }].slice(-MAX_POINTS);
            updateReadouts();
          }
        } else if (id === 'clear') {
          points = [];
          updateReadouts();
        }
        ctx.requestRender();
      },

      tick(dt) {
        integrate(dt * (p.slow ? 0.25 : 1));
        updateNow();
      },

      resetTime() {
        resetMotion();
        updateNow();
      },

      render() {
        const reg = regions();
        scene.resize();
        chart.resize();
        surface.begin();
        scene.setRange([reg.scene.x, reg.scene.x + reg.scene.w], [-(reg.scene.y + reg.scene.h), -reg.scene.y]);
        scene.begin();
        drawScene(reg.scene);
        scene.end();
        drawChart();
        if (performance.now() < hintUntil) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
