import { defineSimulation, ease, FixedStepper, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  elasticLimitForce,
  ELASTIC_LIMIT,
  equilibrium,
  fitThroughOrigin,
  G,
  isDeformed,
  newSpring,
  settle,
  stiffness,
  type Setup,
  type Spring,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const MAX_PIECES = 10;
/** Dämpfungsgrad beim Nachschwingen (bei der automatischen Messreihe stärker, damit es zügig geht). */
const DAMPING = 0.12;
const DAMPING_AUTO = 0.3;

interface Measurement {
  m: number;
  F: number;
  s: number;
  elastic: boolean;
}

/** Geometrie der Szene (für Zeichnen und Antippen). */
interface Geo {
  r: Rect;
  tableY: number;
  armY: number;
  rodX: number;
  /** x der Lastaufhängung (Haken, an dem die Massestücke hängen). */
  loadX: number;
  springX: number[];
  /** Länge einer ungedehnten Feder in Pixeln. */
  natural: number;
  /** Nullpunkt des Maßstabs (Zeiger bei ungedehnter Feder). */
  zeroY: number;
  scale: number;
  pieceH: number;
  pieceW: number;
  tray: Rect;
  rulerX: number;
}

/**
 * Hookesches Gesetz: Massestücke an eine Schraubenfeder hängen, die
 * Verlängerung am Maßstab ablesen und Messpunkte im F-s-Diagramm sammeln.
 * Mit zwei Federn hintereinander oder nebeneinander und – wenn gewünscht –
 * einer Elastizitätsgrenze, jenseits der die Feder bleibend verformt wird.
 */
export default defineSimulation({
  id: 'hookesches-gesetz',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.56 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'setup',
      type: 'choice',
      label: L('Federn', 'Springs'),
      options: [
        { value: 'one', label: L('eine Feder', 'one spring') },
        { value: 'series', label: L('hintereinander', 'in series') },
        { value: 'parallel', label: L('nebeneinander', 'in parallel') },
      ],
      default: 'one',
    },
    { key: 'D1', type: 'number', label: L('Federhärte D₁', 'Spring constant D₁'), min: 10, max: 100, step: 1, default: 20, unit: 'N/m' },
    { key: 'D2', type: 'number', label: L('Federhärte D₂', 'Spring constant D₂'), min: 10, max: 100, step: 1, default: 20, unit: 'N/m', visibleIf: (v) => v.setup !== 'one' },
    { key: 'mp', type: 'number', label: L('Masse je Massestück', 'Mass per weight'), min: 10, max: 100, step: 10, default: 50, unit: 'g' },
    {
      key: 'n',
      type: 'number',
      label: L('Anzahl der Massestücke', 'Number of weights'),
      help: L('Oder: Kasten antippen zum Anhängen, Massestücke antippen zum Abnehmen.', 'Or tap the box to add a weight and tap the weights to remove one.'),
      min: 0,
      max: MAX_PIECES,
      step: 1,
      default: 0,
    },
    {
      key: 'limit',
      type: 'boolean',
      label: L('Elastizitätsgrenze (Feder kann überdehnt werden)', 'Elastic limit (the spring can be overstretched)'),
      default: true,
    },
    { key: 'fit', type: 'boolean', group: 'view', label: L('Ursprungsgerade durch die Messpunkte', 'Line through the origin and the data'), default: true },
    { key: 'arrows', type: 'boolean', group: 'view', label: L('Kraftpfeile', 'Force arrows'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'add', label: L('Massestück anhängen', 'Add a weight'), primary: true },
    { id: 'remove', label: L('Abnehmen', 'Remove') },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series') },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data') },
    { id: 'fresh', label: L('Neue Feder einsetzen', 'Fit new springs'), visibleIf: (v) => v.limit === true },
  ],
  readouts: [
    { key: 'now', label: L('Momentan', 'Right now') },
    { key: 'law', label: L('Hookesches Gesetz', 'Hooke’s law') },
    { key: 'table', label: L('Messtabelle', 'Table of measurements') },
    { key: 'D', label: L('Federhärte aus den Messwerten', 'Spring constant from the data'), spoiler: true },
    { key: 'comb', label: L('Zwei Federn zusammen', 'Two springs combined'), spoiler: true },
    { key: 'over', label: L('Überdehnt', 'Overstretched') },
  ],
  presets: [
    { id: 'start', label: L('Eine Feder, 50-g-Stücke', 'One spring, 50 g weights'), values: {} },
    { id: 'soft', label: L('Weiche Feder', 'Soft spring'), values: { D1: 10, mp: 20 } },
    { id: 'hard', label: L('Harte Feder, 100-g-Stücke', 'Stiff spring, 100 g weights'), values: { D1: 60, mp: 100 } },
    { id: 'series', label: L('Zwei Federn hintereinander', 'Two springs in series'), values: { setup: 'series', mp: 20 } },
    { id: 'parallel', label: L('Zwei Federn nebeneinander', 'Two springs in parallel'), values: { setup: 'parallel', mp: 100 } },
    { id: 'over', label: L('Feder überdehnen', 'Overstretching a spring'), values: { n: 10, mp: 100 } },
  ],
  strings: {
    de: {
      canvas: 'Stativ mit Schraubenfeder, angehängten Massestücken und Maßstab, daneben das Kraft-Verlängerungs-Diagramm',
      axisS: 's in cm',
      axisF: 'F in N',
      tray: 'Massestücke',
      each: 'je {m} g',
      tapAdd: 'antippen',
      limitBand: 'Elastizitätsgrenze',
      spring1: 'Feder 1',
      spring2: 'Feder 2',
      single: 'einzelne Feder',
      empty: 'Hier erscheinen die Messpunkte.',
      fitLabel: 'D ≈ {D} N/m',
      over: 'Überdehnt!',
      FG: 'F_G = {F} N',
      FF: 'F_Feder = {F} N',
      now: 'm = {m} g · F_G = m · g = {F} N · s = {s} cm',
      law: 'F = D · s: Die Verlängerung s ist proportional zur Kraft F (g = 9,81 N/kg).',
      thM: 'm in g',
      thF: 'F in N',
      thS: 's in cm',
      none: 'Noch keine Messwerte – hänge Massestücke an und warte, bis die Feder ruhig hängt.',
      fit: 'Steigung der Ursprungsgeraden: D ≈ {D} N/m = {Dcm} N/cm',
      fitFew: 'Für die Ursprungsgerade fehlen noch Messwerte.',
      series: '1/D = 1/D₁ + 1/D₂ → D = {D} N/m (weicher als jede einzelne Feder)',
      parallel: 'D = D₁ + D₂ = {D} N/m (härter als jede einzelne Feder)',
      overText: 'Die Elastizitätsgrenze wurde überschritten. Bleibende Verlängerung: {p} cm',
    },
    en: {
      canvas: 'Stand with a coil spring, hanging weights and a scale, next to it the force–extension graph',
      axisS: 's in cm',
      axisF: 'F in N',
      tray: 'Weights',
      each: '{m} g each',
      tapAdd: 'tap',
      limitBand: 'elastic limit',
      spring1: 'spring 1',
      spring2: 'spring 2',
      single: 'single spring',
      empty: 'Your data points will appear here.',
      fitLabel: 'D ≈ {D} N/m',
      over: 'Overstretched!',
      FG: 'F_G = {F} N',
      FF: 'F_spring = {F} N',
      now: 'm = {m} g · F_G = m · g = {F} N · s = {s} cm',
      law: 'F = D · s: the extension s is proportional to the force F (g = 9.81 N/kg).',
      thM: 'm in g',
      thF: 'F in N',
      thS: 's in cm',
      none: 'No data yet – hang weights on the spring and wait until it is at rest.',
      fit: 'Slope of the line through the origin: D ≈ {D} N/m = {Dcm} N/cm',
      fitFew: 'More data are needed for the line through the origin.',
      series: '1/D = 1/D₁ + 1/D₂ → D = {D} N/m (softer than each single spring)',
      parallel: 'D = D₁ + D₂ = {D} N/m (stiffer than each single spring)',
      overText: 'The elastic limit was exceeded. Permanent extension: {p} cm',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const setup = () => p.setup as Setup;
    const narrow = () => surface.width < 640;
    const count = () => (setup() === 'one' ? 1 : 2);

    function regions(): { scene: Rect; chart: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!narrow()) {
        const sw = Math.round(w * 0.47);
        return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw + 10, y: 0, w: w - sw - 10, h } };
      }
      const sh = Math.round(h * 0.58);
      return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }

    const chart = new Plot(surface, {
      x: [0, 30],
      y: [0, 5],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().chart,
      xAxis: { label: ctx.t('axisS') },
      yAxis: { label: ctx.t('axisF') },
    });

    /* ---------- Zustand ---------- */
    let springs: Spring[] = [newSpring(p.D1), newSpring(p.D2)];
    const mass = () => (p.n * p.mp) / 1000;
    const force = () => mass() * G;
    const maxForce = () => (MAX_PIECES * p.mp * G) / 1000;
    let eq = equilibrium(setup(), springs, force(), p.limit);
    /** Momentane Verlängerung (m) und Geschwindigkeit (m/s) der Last. */
    let x = eq.s;
    let v = 0;
    let settled = true;
    let dragging = false;
    let points: Measurement[] = [];
    const pop = new Tween(500, ease.outBack);
    let autoRun = false;
    let autoWait = 0;
    let lastFrame = performance.now();
    const stepper = new FixedStepper(0.001);
    /** Weich nachgeführte größte Verlängerung (für Maßstab und Diagramm). */
    let viewS = 0;
    let geo: Geo | null = null;

    const elasticNow = () => springs.slice(0, count()).every((sp) => !isDeformed(sp));
    const D = () => stiffness(setup(), p.D1, p.D2);
    /** Elastizitätsgrenze der ganzen Anordnung (Kraft). */
    const limitForce = () => {
      if (setup() === 'one') return elasticLimitForce(p.D1);
      if (setup() === 'series') return Math.min(elasticLimitForce(p.D1), elasticLimitForce(p.D2));
      return (p.D1 + p.D2) * ELASTIC_LIMIT;
    };

    /** Größte Verlängerung, die mit 10 Massestücken entsteht (bestimmt den Maßstab). */
    function targetViewS(): number {
      const big = equilibrium(setup(), springs, maxForce(), p.limit).s;
      return Math.max(0.06, big, x);
    }

    function freshSprings(): void {
      springs = [newSpring(p.D1), newSpring(p.D2)];
    }

    /** Last hat sich geändert: Federn belasten (ggf. überdehnen) und neues Gleichgewicht bestimmen. */
    function reload(): void {
      springs = settle(setup(), springs, force(), p.limit);
      eq = equilibrium(setup(), springs, force(), p.limit);
      settled = false;
      if (prefersReducedMotion()) {
        x = eq.s;
        v = 0;
      }
    }

    function record(): void {
      const F = force();
      const s = eq.s;
      if (points.some((q) => Math.abs(q.F - F) < 1e-9 && Math.abs(q.s - s) < 1e-4)) return;
      points = [...points, { m: mass(), F, s, elastic: elasticNow() }].slice(-24);
      pop.play();
      updateReadouts();
    }

    /* ---------- Ergebnisse ---------- */
    const cm = (s: number) => fmt.num(s * 100, 1);

    function updateNow(): void {
      ctx.readout('now', tr('now', { m: fmt.num(mass() * 1000, 0), F: fmt.num(force(), 2), s: cm(x) }));
    }

    function updateReadouts(): void {
      updateNow();
      ctx.readout('law', { html: tr('law', {}).replace('F = D · s', '<var>F</var> = <var>D</var> · <var>s</var>') });
      if (points.length) {
        const rows = points
          .slice(-12)
          .map((q) => `<tr${q.elastic ? '' : ' style="color: var(--series-4)"'}><td>${fmt.num(q.m * 1000, 0)}</td><td>${fmt.num(q.F, 2)}</td><td>${cm(q.s)}</td></tr>`)
          .join('');
        ctx.readout('table', { html: `<table class="mini-table"><tr><th>${ctx.t('thM')}</th><th>${ctx.t('thF')}</th><th>${ctx.t('thS')}</th></tr>${rows}</table>` });
      } else ctx.readout('table', ctx.t('none'));
      const fit = fitThroughOrigin(points.filter((q) => q.elastic && q.s > 1e-6));
      const enough = points.filter((q) => q.elastic && q.s > 1e-6).length >= 2;
      ctx.readout('D', fit && enough ? tr('fit', { D: fmt.num(fit, 1), Dcm: fmt.num(fit / 100, 3) }) : ctx.t('fitFew'));
      if (setup() === 'series') ctx.readout('comb', tr('series', { D: fmt.num(D(), 2) }));
      else if (setup() === 'parallel') ctx.readout('comb', tr('parallel', { D: fmt.num(D(), 0) }));
      else ctx.readout('comb', null);
      const perm = equilibrium(setup(), springs, 0, p.limit).s;
      ctx.readout('over', perm > 1e-6 ? tr('overText', { p: cm(perm) }) : null);
      ctx.setAction('add', { enabled: p.n < MAX_PIECES && !ctx.locked });
      ctx.setAction('remove', { enabled: p.n > 0 && !ctx.locked });
    }

    /* ---------- Zeiger: Kasten antippen, Massestücke antippen oder ziehen ---------- */
    let press: { py: number; x0: number; moved: boolean; onStack: boolean } | null = null;
    const stackRect = (): Rect | null => {
      if (!geo) return null;
      const top = geo.zeroY + x * geo.scale;
      const h = Math.max(1, p.n) * (geo.pieceH + 2) + 10;
      return { x: geo.loadX - geo.pieceW / 2 - 10, y: top - 12, w: geo.pieceW + 20, h: h + 12 };
    };
    const inRect = (r: Rect | null, px: number, py: number) => !!r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    surface.addTarget({
      contains: (px: number, py: number) => inRect(stackRect(), px, py) || inRect(geo?.tray ?? null, px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (inRect(geo?.tray ?? null, q.px, q.py)) {
          if (!ctx.locked && p.n < MAX_PIECES) {
            autoRun = false;
            ctx.set({ n: p.n + 1 });
          }
          return true;
        }
        if (inRect(stackRect(), q.px, q.py)) {
          press = { py: q.py, x0: x, moved: false, onStack: true };
          return true;
        }
        return false;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!press || !geo) return;
        if (!press.moved && Math.abs(q.py - press.py) < 5) return;
        press.moved = true;
        dragging = true;
        autoRun = false;
        const minX = equilibrium(setup(), springs, 0, p.limit).s;
        x = Math.max(minX, Math.min(viewS * 1.15 + 0.02, press.x0 + (q.py - press.py) / geo.scale));
        v = 0;
        settled = false;
        surface.setCursor('grabbing');
        ctx.requestRender();
      },
      pointerUp: () => {
        if (press && !press.moved && p.n > 0 && !ctx.locked) {
          autoRun = false;
          ctx.set({ n: p.n - 1 });
        }
        press = null;
        dragging = false;
        lastFrame = performance.now();
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        if (!q) return;
        surface.setCursor(inRect(geo?.tray ?? null, q.px, q.py) ? 'pointer' : inRect(stackRect(), q.px, q.py) ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Zeichnen ---------- */
    function pill(x0: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): void {
      const gx = surface.g;
      const theme = ctx.theme;
      gx.font = `700 ${size}px ${theme.font}`;
      const w = gx.measureText(label).width + 16;
      const h = size + 11;
      const left = align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2;
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 1;
      gx.fillStyle = theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(gx, left, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      gx.strokeStyle = withAlpha(color, 0.5);
      gx.lineWidth = 1;
      roundRect(gx, left + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      gx.stroke();
      text(gx, label, left + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color });
    }

    /** Schraubenfeder von y0 bis y1 (mit geraden Enden); `heat` 0…1 färbt überdehnte Federn. */
    function drawSpring(cx: number, y0: number, y1: number, coils: number, R: number, heat: number): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const lead = 8;
      const top = y0 + lead;
      const bot = y1 - lead;
      const per = 20;
      const total = coils * per;
      const pos = (i: number): [number, number, number] => {
        const ph = (i / per) * Math.PI * 2;
        return [cx + R * Math.sin(ph), top + ((bot - top) * i) / total + R * 0.22 * Math.cos(ph), Math.cos(ph)];
      };
      const steel = heat > 0 ? `rgb(${Math.round(185 + 50 * heat)},${Math.round(193 - 70 * heat)},${Math.round(203 - 120 * heat)})` : dark ? '#c3cbd6' : '#9aa4b1';
      const back = heat > 0 ? '#8a4a2c' : dark ? '#5b6573' : '#5e6874';
      gx.save();
      gx.lineCap = 'round';
      gx.lineJoin = 'round';
      // gerade Enden
      gx.strokeStyle = steel;
      gx.lineWidth = 2.4;
      gx.beginPath();
      gx.moveTo(cx, y0);
      gx.lineTo(cx, top);
      gx.moveTo(cx, bot);
      gx.lineTo(cx, y1);
      gx.stroke();
      for (const front of [false, true]) {
        gx.strokeStyle = front ? steel : back;
        gx.lineWidth = front ? 2.6 : 1.8;
        gx.beginPath();
        let pen = false;
        for (let i = 0; i <= total; i++) {
          const [px, py, depth] = pos(i);
          const isFront = depth >= 0;
          if (isFront !== front) {
            pen = false;
            continue;
          }
          if (!pen) {
            const [qx, qy] = pos(Math.max(0, i - 1));
            gx.moveTo(qx, qy);
            pen = true;
          }
          gx.lineTo(px, py);
        }
        gx.stroke();
      }
      // Glanzlicht auf den vorderen Windungen
      gx.strokeStyle = 'rgba(255,255,255,0.45)';
      gx.lineWidth = 0.9;
      gx.beginPath();
      for (let i = 0; i <= total; i++) {
        const [px, py, depth] = pos(i);
        if (depth > 0.55) gx.lineTo(px - 0.6, py - 0.8);
        else gx.moveTo(px - 0.6, py - 0.8);
      }
      gx.stroke();
      gx.restore();
    }

    function drawHook(cx: number, y: number, size: number, color: string): void {
      const gx = surface.g;
      gx.strokeStyle = color;
      gx.lineWidth = 2;
      gx.beginPath();
      gx.arc(cx, y + size, size, -Math.PI / 2, Math.PI * 0.85);
      gx.stroke();
    }

    function drawPiece(cx: number, y: number, w: number, h: number, label: string | null): void {
      const gx = surface.g;
      const brass = gx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      brass.addColorStop(0, '#8d6a24');
      brass.addColorStop(0.3, '#f0d27a');
      brass.addColorStop(0.55, '#d4ad4c');
      brass.addColorStop(1, '#7c5b1c');
      gx.fillStyle = brass;
      roundRect(gx, cx - w / 2, y, w, h, 3);
      gx.fill();
      gx.fillStyle = 'rgba(255,255,255,0.25)';
      gx.fillRect(cx - w / 2 + 2, y + 1.5, w - 4, 1.5);
      gx.fillStyle = 'rgba(0,0,0,0.18)';
      gx.fillRect(cx - w / 2 + 2, y + h - 2.5, w - 4, 1.5);
      if (label && h >= 11 && w >= 26) text(gx, label, cx, y + h / 2 + 0.5, { font: `700 ${h >= 13 ? 9.5 : 8.5}px ${ctx.theme.font}`, color: '#3d2a06' });
    }

    function arrow(x0: number, y0: number, y1: number, color: string, label: string, side: 'left' | 'right'): void {
      const gx = surface.g;
      if (Math.abs(y1 - y0) < 4) return;
      const dir = Math.sign(y1 - y0);
      gx.strokeStyle = color;
      gx.fillStyle = color;
      gx.lineWidth = 3;
      gx.lineCap = 'round';
      gx.beginPath();
      gx.moveTo(x0, y0);
      gx.lineTo(x0, y1 - dir * 8);
      gx.stroke();
      gx.beginPath();
      gx.moveTo(x0, y1);
      gx.lineTo(x0 - 5.5, y1 - dir * 10);
      gx.lineTo(x0 + 5.5, y1 - dir * 10);
      gx.closePath();
      gx.fill();
      const theme = ctx.theme;
      const size = narrow() ? 10.5 : 11.5;
      gx.font = `700 ${size}px ${theme.font}`;
      gx.textAlign = side === 'right' ? 'left' : 'right';
      gx.textBaseline = 'middle';
      gx.lineWidth = 3;
      gx.lineJoin = 'round';
      gx.strokeStyle = theme.bg;
      const lx = x0 + (side === 'right' ? 8 : -8);
      const ly = (y0 + y1) / 2;
      gx.strokeText(label, lx, ly);
      gx.fillText(label, lx, ly);
    }

    function buildGeo(r: Rect): Geo {
      const small = narrow();
      const tableY = r.y + r.h - (small ? 20 : 26);
      const armY = r.y + (small ? 30 : 40);
      const rodX = r.x + (small ? 22 : 30);
      const pieceH = small ? 10 : 12;
      const pieceW = small ? 26 : 32;
      const natural = setup() === 'series' ? (small ? 50 : 70) : small ? 70 : 100;
      const springCx = r.x + r.w * (small ? 0.4 : 0.46);
      const springX = setup() === 'parallel' ? [springCx - 24, springCx + 24] : [springCx];
      const chain = setup() === 'series' ? 2 * natural + 10 : natural;
      const zeroY = armY + chain + (setup() === 'parallel' ? 10 : 0);
      const stack = MAX_PIECES * (pieceH + 2) + 16;
      const room = Math.max(40, tableY - 10 - stack - zeroY);
      const scale = room / Math.max(0.05, viewS);
      const loadX = setup() === 'parallel' ? springX[0]! + ((springX[1]! - springX[0]!) * p.D2) / (p.D1 + p.D2) : springCx;
      const trayW = small ? 58 : 70;
      const tray: Rect = { x: r.x + r.w - trayW - (small ? 10 : 14), y: tableY - (small ? 44 : 52), w: trayW, h: small ? 44 : 52 };
      return { r, tableY, armY, rodX, loadX, springX, natural, zeroY, scale, pieceH, pieceW, tray, rulerX: springX[0]! - (small ? 38 : 46) };
    }

    function drawScene(r: Rect): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const g0 = buildGeo(r);
      geo = g0;
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      // Wand und Tisch
      const wall = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f1f4f8');
      wall.addColorStop(1, dark ? '#101824' : '#e1e7ee');
      gx.fillStyle = wall;
      gx.fillRect(r.x, r.y, r.w, r.h);
      const table = gx.createLinearGradient(0, g0.tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
      table.addColorStop(1, dark ? '#33281e' : '#9c7349');
      gx.fillStyle = table;
      gx.fillRect(r.x, g0.tableY, r.w, r.y + r.h - g0.tableY);
      gx.fillStyle = 'rgba(255,255,255,0.22)';
      gx.fillRect(r.x, g0.tableY, r.w, 1.5);

      // Stativ
      const metal = (x0: number, w: number) => {
        const m = gx.createLinearGradient(x0, 0, x0 + w, 0);
        m.addColorStop(0, '#5d6570');
        m.addColorStop(0.45, '#d5dae1');
        m.addColorStop(1, '#5d6570');
        return m;
      };
      gx.fillStyle = dark ? '#2b3340' : '#3c4552';
      roundRect(gx, g0.rodX - 18, g0.tableY - 7, 70, 8, 3);
      gx.fill();
      gx.fillStyle = metal(g0.rodX - 4, 8);
      gx.fillRect(g0.rodX - 4, g0.armY - 14, 8, g0.tableY - 7 - (g0.armY - 14));
      const armEnd = Math.max(...g0.springX) + 26;
      const arm = gx.createLinearGradient(0, g0.armY - 4, 0, g0.armY + 4);
      arm.addColorStop(0, '#d5dae1');
      arm.addColorStop(1, '#5d6570');
      gx.fillStyle = arm;
      gx.fillRect(g0.rodX, g0.armY - 4, armEnd - g0.rodX, 8);
      gx.fillStyle = dark ? '#6b7584' : '#4a5361';
      roundRect(gx, g0.rodX - 9, g0.armY - 9, 18, 18, 3);
      gx.fill();

      // Federn
      const minS = equilibrium(setup(), springs, 0, p.limit).s;
      const heatOf = (i: number) => (p.limit && isDeformed(springs[i]!) ? 1 : 0);
      const coils = setup() === 'series' ? 10 : 14;
      const R = small ? 9 : 12;
      let hookY: number;
      if (setup() === 'one') {
        hookY = g0.zeroY + x * g0.scale;
        drawSpring(g0.springX[0]!, g0.armY + 4, hookY, coils, R, heatOf(0));
      } else if (setup() === 'series') {
        // Gesamtverlängerung im Verhältnis der Gleichgewichtsanteile aufteilen
        const share = eq.s > 1e-9 ? eq.parts[0]! / eq.s : p.D2 / (p.D1 + p.D2);
        const s1 = x * share;
        const midY = g0.armY + 4 + g0.natural + s1 * g0.scale;
        hookY = g0.zeroY + x * g0.scale;
        drawSpring(g0.springX[0]!, g0.armY + 4, midY, coils, R, heatOf(0));
        drawSpring(g0.springX[0]!, midY + 10, hookY, coils, R * 0.9, heatOf(1));
        gx.strokeStyle = dark ? '#c3cbd6' : '#6b7584';
        gx.lineWidth = 2.2;
        gx.beginPath();
        gx.arc(g0.springX[0]!, midY + 5, 5, 0, Math.PI * 2);
        gx.stroke();
        // Zwischenmarke: Verlängerung der oberen Feder
        gx.strokeStyle = withAlpha(theme.series[4]!, 0.85);
        gx.lineWidth = 1.5;
        gx.setLineDash([3, 3]);
        gx.beginPath();
        gx.moveTo(g0.springX[0]! - R - 2, midY + 5);
        gx.lineTo(g0.rulerX + 14, midY + 5);
        gx.stroke();
        gx.setLineDash([]);
      } else {
        const barY = g0.zeroY + x * g0.scale - 10;
        for (const [i, sx] of g0.springX.entries()) drawSpring(sx, g0.armY + 4, barY, coils, R * 0.85, heatOf(i));
        gx.fillStyle = metal(g0.springX[0]! - 10, g0.springX[1]! - g0.springX[0]! + 20);
        roundRect(gx, g0.springX[0]! - 10, barY - 2, g0.springX[1]! - g0.springX[0]! + 20, 6, 2);
        gx.fill();
        hookY = barY + 10;
        gx.strokeStyle = dark ? '#c3cbd6' : '#6b7584';
        gx.lineWidth = 2;
        gx.beginPath();
        gx.moveTo(g0.loadX, barY + 4);
        gx.lineTo(g0.loadX, hookY);
        gx.stroke();
      }

      // Maßstab mit Nullpunkt beim Zeiger der ungedehnten Feder
      const rx = g0.rulerX;
      const rTop = g0.zeroY - 20;
      const rBot = Math.min(g0.tableY - 12, g0.zeroY + viewS * g0.scale + 18);
      const wood = gx.createLinearGradient(rx - 13, 0, rx + 13, 0);
      wood.addColorStop(0, dark ? '#d8c27f' : '#f8e7a8');
      wood.addColorStop(1, dark ? '#b9a25e' : '#e8cd7a');
      // Halter vom Stativ zum Maßstab
      const holder = gx.createLinearGradient(0, rTop + 6, 0, rTop + 12);
      holder.addColorStop(0, '#d5dae1');
      holder.addColorStop(1, '#5d6570');
      gx.fillStyle = holder;
      gx.fillRect(g0.rodX, rTop + 6, rx - g0.rodX, 6);
      gx.fillStyle = dark ? '#6b7584' : '#4a5361';
      roundRect(gx, g0.rodX - 7, rTop + 2, 14, 14, 3);
      gx.fill();
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.2)';
      gx.shadowBlur = 5;
      gx.shadowOffsetX = 1;
      gx.shadowOffsetY = 2;
      gx.fillStyle = wood;
      roundRect(gx, rx - 13, rTop, 26, rBot - rTop, 3);
      gx.fill();
      gx.restore();
      const ink = '#3d2f0c';
      const pxPerCm = g0.scale / 100;
      // Teilung passend zum Maßstab: kleine Striche ≥ 4 px, große ≥ 9 px, Zahlen ≥ 16 px auseinander
      const steps = [0.5, 1, 2, 5, 10, 20, 50, 100, 200];
      const multipleOf = (a: number, b: number) => Math.abs(a / b - Math.round(a / b)) < 1e-9;
      const minor = steps.find((q) => q * pxPerCm >= 4) ?? 200;
      const major = steps.find((q) => q * pxPerCm >= 9 && multipleOf(q, minor)) ?? 200;
      gx.strokeStyle = ink;
      gx.lineWidth = 1;
      gx.beginPath();
      for (let k = 0; k * minor * pxPerCm <= rBot - g0.zeroY - 4; k++) {
        const c = k * minor;
        const y = Math.round(g0.zeroY + c * pxPerCm) + 0.5;
        const isMajor = Math.abs(c / major - Math.round(c / major)) < 1e-6;
        gx.moveTo(rx + 13, y);
        gx.lineTo(rx + 13 - (isMajor ? 9 : 5), y);
      }
      gx.stroke();
      const labelEvery = steps.find((q) => q * pxPerCm >= 16 && multipleOf(q, major)) ?? 200;
      for (let c = 0; c * pxPerCm <= rBot - g0.zeroY - 6; c += labelEvery) {
        text(gx, fmt.num(c, 1), rx - 1, g0.zeroY + c * pxPerCm, { font: `700 ${small ? 9 : 10}px ${theme.font}`, color: ink, align: 'right' });
      }
      text(gx, 'cm', rx, rTop + 7, { font: `700 9px ${theme.font}`, color: ink });
      // Zeiger
      const pointerY = g0.zeroY + x * g0.scale;
      gx.strokeStyle = theme.series[1]!;
      gx.fillStyle = theme.series[1]!;
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(g0.loadX - 4, pointerY);
      gx.lineTo(rx + 16, pointerY);
      gx.stroke();
      gx.beginPath();
      gx.moveTo(rx + 13, pointerY);
      gx.lineTo(rx + 20, pointerY - 4);
      gx.lineTo(rx + 20, pointerY + 4);
      gx.closePath();
      gx.fill();
      // Bleibende Verlängerung andeuten
      if (minS > 1e-6) {
        gx.strokeStyle = theme.series[3]!;
        gx.lineWidth = 1.5;
        gx.setLineDash([3, 3]);
        gx.beginPath();
        gx.moveTo(rx + 13, g0.zeroY);
        gx.lineTo(g0.loadX + 22, g0.zeroY);
        gx.stroke();
        gx.setLineDash([]);
      }

      // Griff: an der Last kann man ziehen (markierter Punkt wie in den anderen Simulationen)
      if (!press || !press.moved) {
        gx.fillStyle = withAlpha(theme.series[0]!, 0.16);
        gx.beginPath();
        gx.arc(g0.loadX, hookY + 2, 12, 0, Math.PI * 2);
        gx.fill();
      } else {
        gx.fillStyle = withAlpha(theme.series[0]!, 0.28);
        gx.beginPath();
        gx.arc(g0.loadX, hookY + 2, 15, 0, Math.PI * 2);
        gx.fill();
      }
      // Massestücke
      const hookColor = dark ? '#c3cbd6' : '#5d6570';
      drawHook(g0.loadX, hookY, 4, hookColor);
      let y = hookY + 7;
      const label = `${fmt.num(p.mp, 0)} g`;
      for (let i = 0; i < p.n; i++) {
        drawPiece(g0.loadX, y, g0.pieceW, g0.pieceH, label);
        y += g0.pieceH + 2;
        if (i < p.n - 1) {
          gx.strokeStyle = hookColor;
          gx.lineWidth = 1.5;
          gx.beginPath();
          gx.moveTo(g0.loadX, y - 2.5);
          gx.lineTo(g0.loadX, y);
          gx.stroke();
        }
      }
      const stackBottom = y;

      // Kraftpfeile
      if (p.arrows && p.n > 0) {
        const F = force();
        const kEl = D();
        const Fs = Math.max(0, F + kEl * (x - eq.s));
        const ax = Math.max(g0.loadX + g0.pieceW / 2 + (small ? 10 : 14), Math.max(...g0.springX) + R + 10);
        const cy = (hookY + 7 + stackBottom) / 2;
        // Pfeillänge proportional zur Kraft, aber nicht unter die Tischkante
        const k = Math.min((small ? 80 : 110) / Math.max(1e-6, maxForce()), Math.max(10, g0.tableY - 8 - cy) / Math.max(F, 1e-6));
        arrow(ax + (small ? 14 : 18), cy, cy + F * k, theme.series[1]!, tr('FG', { F: fmt.num(F, 2) }), 'right');
        arrow(ax, hookY + 6, hookY + 6 - Fs * k, theme.series[0]!, tr('FF', { F: fmt.num(Fs, 2) }), 'right');
      }

      // Kasten mit Massestücken
      const t0 = g0.tray;
      const box = gx.createLinearGradient(0, t0.y, 0, t0.y + t0.h);
      box.addColorStop(0, dark ? '#5a4632' : '#a77b4d');
      box.addColorStop(1, dark ? '#3e3022' : '#7d5a35');
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 2;
      gx.fillStyle = box;
      roundRect(gx, t0.x, t0.y + t0.h * 0.45, t0.w, t0.h * 0.55, 4);
      gx.fill();
      gx.restore();
      const left = MAX_PIECES - p.n;
      const pw = (t0.w - 12) / 5;
      for (let i = 0; i < left; i++) {
        const col = i % 5;
        const row = Math.floor(i / 5);
        drawPiece(t0.x + 6 + pw * (col + 0.5), t0.y + t0.h * 0.45 - (row + 1) * (g0.pieceH - 1) + 2, pw - 2, g0.pieceH - 2, null);
      }
      text(gx, ctx.t('tray'), t0.x + t0.w / 2, t0.y + t0.h * 0.72, { font: `700 ${small ? 8.5 : 9.5}px ${theme.font}`, color: '#fff3df' });
      text(gx, tr('each', { m: fmt.num(p.mp, 0) }), t0.x + t0.w / 2, t0.y + t0.h * 0.72 + (small ? 10 : 11), { font: `600 ${small ? 8 : 9}px ${theme.font}`, color: 'rgba(255,243,223,0.85)' });
      const rows = Math.ceil(left / 5);
      if (!ctx.locked && p.n < MAX_PIECES) text(gx, `+ ${ctx.t('tapAdd')}`, t0.x + t0.w / 2, t0.y + t0.h * 0.45 - rows * (g0.pieceH - 1) - 8, { font: `700 10px ${theme.font}`, color: theme.muted });

      // Hinweise
      const size = small ? 11.5 : 12.5;
      pill(r.x + r.w - 8, r.y + 8, `D = ${fmt.num(D(), setup() === 'series' ? 1 : 0)} N/m`, theme.text, 'right', size);
      if (p.limit && springs.slice(0, count()).some((sp) => isDeformed(sp))) pill(r.x + r.w / 2 + 20, r.y + 8, ctx.t('over'), theme.series[3]!, 'center', size);
      gx.restore();
    }

    function drawChart(): void {
      const theme = ctx.theme;
      const sMax = viewS * 100 * 1.12;
      const Fmax = maxForce() * 1.15;
      chart.setRangePadded([0, sMax], [0, Fmax], { left: narrow() ? 44 : 52, right: narrow() ? 36 : 44, top: 24, bottom: 20 });
      const gx = chart.begin();
      chart.grid({ minor: false });
      // Elastizitätsgrenze
      if (p.limit) {
        const FE = limitForce();
        if (FE < Fmax) {
          chart.polygon(
            [
              [0, FE],
              [sMax * 1.5, FE],
              [sMax * 1.5, Fmax * 1.5],
              [0, Fmax * 1.5],
            ],
            { fill: theme.series[3], alpha: 0.08 },
          );
          chart.hline(FE, { color: theme.series[3], width: 1.5, dash: [6, 4], alpha: 0.8 });
          chart.text(sMax, FE, ctx.t('limitBand'), { color: theme.series[3], size: 11, weight: '600', align: 'right', baseline: 'bottom', offset: [-4, -4] });
        }
      }
      chart.axes();
      // Einzelne Federn zum Vergleich
      if (setup() !== 'one') {
        const single: [number, string][] =
          p.D1 === p.D2
            ? [[p.D1, 'single']]
            : [
                [p.D1, 'spring1'],
                [p.D2, 'spring2'],
              ];
        for (const [Di, key] of single) {
          chart.line([0, 0], [1, Di / 100], { color: theme.muted, width: 1.2, dash: [3, 4], alpha: 0.8 });
          const sEnd = Math.min(sMax * 0.96, (Fmax * 0.92 * 100) / Di);
          chart.text(sEnd, (Di * sEnd) / 100, ctx.t(key), { color: theme.muted, size: 10.5, weight: '600', align: 'right', baseline: 'bottom', offset: [-2, -4] });
        }
      }
      // Ursprungsgerade
      const elastic = points.filter((q) => q.elastic && q.s > 1e-6);
      const fit = fitThroughOrigin(elastic);
      if (p.fit && fit && elastic.length >= 2) {
        chart.line([0, 0], [1, fit / 100], { color: theme.series[0], width: 2, alpha: 0.85 });
        const sEnd = Math.min(sMax * 0.6, (Fmax * 0.75 * 100) / fit);
        chart.text(sEnd, (fit * sEnd) / 100, tr('fitLabel', { D: fmt.num(fit, 1) }), { color: theme.series[0], size: 12, weight: 'bold', align: 'right', baseline: 'bottom', offset: [-6, -6] });
      }
      // Messpunkte
      points.forEach((q, i) => {
        const last = i === points.length - 1;
        const r = last && pop.running ? 5.5 * Math.max(0.2, pop.value) : 5;
        chart.point(q.s * 100, q.F, { color: q.elastic ? theme.series[0] : theme.series[3], radius: r });
      });
      if (!points.length) {
        const r = chart.rect;
        chart.textPx(r.x + r.w / 2 + 20, r.y + r.h * 0.55, ctx.t('empty'), { color: theme.muted, size: 13, weight: '600', align: 'center', baseline: 'middle' });
      }
      // aktueller Zustand
      if (p.n > 0 || !settled) chart.arcPx(x * 100, force(), 8, 0, Math.PI * 2, { stroke: theme.series[1], width: 2.2 });
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
    function step(dt: number): void {
      if (dragging) return;
      const mEff = Math.max(mass(), 0.03);
      const w = Math.sqrt(D() / mEff);
      stepper.run(dt * (p.slow ? 0.25 : 1), (h) => {
        const a = -w * w * (x - eq.s) - 2 * (autoRun ? DAMPING_AUTO : DAMPING) * w * v;
        v += a * h;
        x += v * h;
        // Schraubenfedern lassen sich nicht unter die Ruhelänge zusammendrücken
        const minX = equilibrium(setup(), springs, 0, p.limit).s;
        if (x < minX) {
          x = minX;
          v = Math.max(0, v);
        }
      });
      if (Math.abs(x - eq.s) < 4e-4 && Math.abs(v) < 6e-3) {
        x = eq.s;
        v = 0;
        if (!settled) {
          settled = true;
          record();
          autoWait = performance.now() + 450;
        }
      }
    }

    function startAuto(): void {
      points = [];
      autoRun = true;
      autoWait = performance.now() + 300;
      if (p.n !== 0) ctx.set({ n: 0 });
      else {
        settled = false;
        reload();
      }
      updateReadouts();
    }

    return {
      update(changed, source) {
        const structural = ['setup', 'D1', 'D2', 'limit'].some((k) => changed.has(k));
        if (structural) {
          freshSprings();
          points = [];
        }
        // Bedienung von Hand beendet die automatische Messreihe
        if (source !== 'sim') autoRun = false;
        if (structural || changed.has('n') || changed.has('mp')) reload();
        if (source === 'init') {
          x = eq.s;
          v = 0;
          settled = true;
          if (p.n > 0) record();
          viewS = targetViewS();
        }
        lastFrame = performance.now();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'add' && p.n < MAX_PIECES) {
          autoRun = false;
          ctx.set({ n: p.n + 1 });
        } else if (id === 'remove' && p.n > 0) {
          autoRun = false;
          ctx.set({ n: p.n - 1 });
        } else if (id === 'auto') startAuto();
        else if (id === 'clear') {
          points = [];
          updateReadouts();
        } else if (id === 'fresh') {
          freshSprings();
          reload();
          updateReadouts();
        }
        lastFrame = performance.now();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        step(dt);
        // Automatische Messreihe: nach dem Einschwingen das nächste Massestück anhängen
        if (autoRun && settled && !dragging && now >= autoWait) {
          if (p.n < MAX_PIECES) {
            autoWait = now + 1e9;
            ctx.set({ n: p.n + 1 });
          } else autoRun = false;
        }
        // Maßstab weich nachführen
        const target = targetViewS();
        viewS = viewS + (target - viewS) * Math.min(1, dt * 6);
        if (Math.abs(viewS - target) < 1e-5) viewS = target;
        chart.resize();
        const reg = regions();
        surface.begin();
        drawScene(reg.scene);
        drawChart();
        updateNow();
        if (!settled || dragging || autoRun || pop.running || viewS !== target) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
