import { defineSimulation, ease, Plot, roundRect, seededRandom, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  dragDistance,
  dragFallTime,
  dragSpeed,
  fallDistance,
  fallSpeed,
  fallTime,
  impactSpeed,
  PLANETS,
  reactionTime,
  stats,
  strobeGaps,
  TERMINAL,
  type PlanetId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'tower' | 'tube' | 'ruler';
type Pt = [number, number];

/** Länge der Fallröhre und des Lineals in m. */
const TUBE = 1.5;
const RULER = 0.5;
const MAX_ATTEMPTS = 12;

/** Kleinste „schöne“ Schrittweite (1, 2, 5 · 10^k) ≥ x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  const m = x / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/** Obere Grenze eines Diagramms: etwas Luft über x, auf runde Werte. */
function niceTop(x: number): number {
  if (!(x > 0)) return 1;
  const step = niceStep(x / 5);
  return Math.ceil((x * 1.06) / step - 1e-9) * step;
}

/**
 * Freier Fall: Stroboskopaufnahme einer fallenden Kugel (auch auf Mond, Mars
 * und Jupiter), die Fallröhre mit Kugel und Feder (mit Luft und luftleer)
 * und ein Reaktionstest mit einem fallenden Lineal.
 */
export default defineSimulation({
  id: 'freier-fall',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.56 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Experiment', 'Experiment'),
      options: [
        { value: 'tower', label: L('Fallturm', 'Drop tower') },
        { value: 'tube', label: L('Fallröhre', 'Feather tube') },
        { value: 'ruler', label: L('Reaktionstest', 'Reaction test') },
      ],
      default: 'tower',
    },
    { key: 'h', type: 'number', label: L('Fallhöhe h', 'Drop height h'), min: 1, max: 100, step: 0.5, default: 20, unit: 'm', visibleIf: (v) => v.mode === 'tower' },
    {
      key: 'planet',
      type: 'choice',
      label: L('Ort', 'Location'),
      options: [
        { value: 'erde', label: L('Erde', 'Earth') },
        { value: 'mond', label: L('Mond', 'Moon') },
        { value: 'mars', label: L('Mars', 'Mars') },
        { value: 'jupiter', label: L('Jupiter', 'Jupiter') },
      ],
      default: 'erde',
      visibleIf: (v) => v.mode !== 'tube',
    },
    {
      key: 'vac',
      type: 'boolean',
      label: L('Luft aus der Röhre gepumpt (Vakuum)', 'Air pumped out of the tube (vacuum)'),
      default: false,
      visibleIf: (v) => v.mode === 'tube',
    },
    {
      key: 'dt',
      type: 'number',
      label: L('Blitzabstand Δt des Stroboskops', 'Stroboscope interval Δt'),
      min: 0.05,
      max: 1,
      step: 0.05,
      default: 0.4,
      unit: 's',
      visibleIf: (v) => v.mode === 'tower',
    },
    { key: 'strobe', type: 'boolean', group: 'view', label: L('Stroboskop (Bilder in gleichen Zeitabständen)', 'Stroboscope (images at equal time intervals)'), default: true, visibleIf: (v) => v.mode !== 'ruler' },
    { key: 'ms', type: 'boolean', group: 'view', label: L('Zeitskala in ms auf dem Lineal', 'Time scale in ms on the ruler'), default: false, visibleIf: (v) => v.mode === 'ruler' },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false, visibleIf: (v) => v.mode !== 'ruler' },
  ],
  actions: [
    { id: 'drop', label: L('Fallen lassen', 'Drop'), primary: true, visibleIf: (v) => v.mode === 'tower' },
    { id: 'flip', label: L('Röhre umdrehen', 'Turn the tube over'), primary: true, visibleIf: (v) => v.mode === 'tube' },
    { id: 'start', label: L('Start', 'Start'), primary: true, visibleIf: (v) => v.mode === 'ruler' },
    { id: 'catch', label: L('Fangen!', 'Catch!'), visibleIf: (v) => v.mode === 'ruler' },
    { id: 'clear', label: L('Messreihe löschen', 'Clear results'), visibleIf: (v) => v.mode === 'ruler' },
  ],
  images: { feather: 'feder.webp' },
  readouts: [
    { key: 'now', label: L('Momentan', 'Right now') },
    { key: 'law', label: L('Fallgesetze', 'Laws of free fall') },
    { key: 'fall', label: L('Fallzeit und Aufprallgeschwindigkeit', 'Fall time and impact speed'), spoiler: true },
    { key: 'ratio', label: L('Abstände der Stroboskopbilder', 'Gaps between the stroboscope images'), spoiler: true },
    { key: 'arrive', label: L('Unten angekommen', 'Arrival at the bottom'), spoiler: true },
    { key: 'last', label: L('Letzter Versuch', 'Last attempt') },
    { key: 'mean', label: L('Messreihe', 'Results'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Fallturm 20 m', 'Drop tower 20 m'), values: {} },
    { id: 'moon', label: L('Auf dem Mond', 'On the Moon'), values: { planet: 'mond' } },
    { id: 'high', label: L('80 m, Blitz alle 0,5 s', '80 m, flash every 0.5 s'), values: { h: 80, dt: 0.5 } },
    { id: 'tube', label: L('Fallröhre mit Luft', 'Feather tube with air'), values: { mode: 'tube' } },
    { id: 'vacuum', label: L('Fallröhre luftleer', 'Feather tube in vacuum'), values: { mode: 'tube', vac: true } },
    { id: 'ruler', label: L('Reaktionstest mit Lineal', 'Reaction test with a ruler'), values: { mode: 'ruler' } },
  ],
  strings: {
    de: {
      canvas: 'Freier Fall: Fallturm mit Stroboskop, Fallröhre mit Kugel und Feder oder fallendes Lineal, daneben t-s- und t-v-Diagramm',
      time: 't in s',
      timeMs: 't in ms',
      fallS: 's in m',
      fallV: 'v in m/s',
      rulerS: 's in cm',
      attempt: 'Versuch',
      scale: 's in m',
      ball: 'Kugel',
      feather: 'Feder',
      air: 'Luft',
      vacuum: 'Vakuum',
      pump: 'Pumpe',
      ground: 'g = {g} m/s² ({p})',
      areaS: 'Fläche = Fallstrecke s = {s}',
      slopeG: 'Steigung: g = Δv / Δt = {g}',
      nowTower: 't = {t} s · s = {s} m · v = {v} m/s ({kmh} km/h)',
      nowTube: 't = {t} s · Kugel: s = {sb} m, v = {vb} m/s · Feder: s = {sf} m, v = {vf} m/s',
      lawTube: 'Im Vakuum fallen beide nach s = ½ · g · t². In Luft bremst der Luftwiderstand die Feder auf etwa {vf} m/s ab.',
      fallTower: 'Fallzeit t = √(2h/g) = {t} s · Aufprallgeschwindigkeit v = √(2·g·h) = {v} m/s ({kmh} km/h)',
      fallTube: 'Kugel unten nach {tb} s, Feder nach {tf} s',
      ratio: '{gaps} → Verhältnis {ratio}',
      idle: 'Tippe auf „Start“ – fange das Lineal, sobald es fällt!',
      armed: 'Achtung …',
      early: 'Zu früh! Warte, bis das Lineal fällt.',
      missed: 'Durchgerutscht – leider zu langsam.',
      caught: 'Gefangen bei {s} cm → {t} ms',
      hint: 'fangen mit Tippen, Klick oder Leertaste',
      lastText: 's = {s} cm → t = √(2s/g) = {t} ms',
      lastNone: 'noch kein Versuch',
      lastMissed: 'durchgerutscht (mehr als {t} ms)',
      lastEarly: 'zu früh losgelassen – ungültig',
      meanText: 'Mittelwert aus {n} {unit}: {m} ms (schnellster {min} ms, langsamster {max} ms)',
      attemptOne: 'Versuch',
      attemptMany: 'Versuchen',
      mean: 'Mittelwert {m} ms',
      noAttempts: 'Hier erscheinen deine Reaktionszeiten.',
    },
    en: {
      canvas: 'Free fall: drop tower with stroboscope, feather tube with a ball and a feather or a falling ruler, next to distance–time and velocity–time graphs',
      time: 't in s',
      timeMs: 't in ms',
      fallS: 's in m',
      fallV: 'v in m/s',
      rulerS: 's in cm',
      attempt: 'Attempt',
      scale: 's in m',
      ball: 'Ball',
      feather: 'Feather',
      air: 'Air',
      vacuum: 'Vacuum',
      pump: 'Pump',
      ground: 'g = {g} m/s² ({p})',
      areaS: 'Area = distance fallen s = {s}',
      slopeG: 'Slope: g = Δv / Δt = {g}',
      nowTower: 't = {t} s · s = {s} m · v = {v} m/s ({kmh} km/h)',
      nowTube: 't = {t} s · ball: s = {sb} m, v = {vb} m/s · feather: s = {sf} m, v = {vf} m/s',
      lawTube: 'In a vacuum both fall with s = ½ · g · t². In air, air resistance limits the feather to about {vf} m/s.',
      fallTower: 'Fall time t = √(2h/g) = {t} s · impact speed v = √(2·g·h) = {v} m/s ({kmh} km/h)',
      fallTube: 'Ball at the bottom after {tb} s, feather after {tf} s',
      ratio: '{gaps} → ratio {ratio}',
      idle: 'Press “Start” – catch the ruler as soon as it falls!',
      armed: 'Get ready …',
      early: 'Too early! Wait until the ruler falls.',
      missed: 'It slipped through – too slow.',
      caught: 'Caught at {s} cm → {t} ms',
      hint: 'catch with a tap, click or the space bar',
      lastText: 's = {s} cm → t = √(2s/g) = {t} ms',
      lastNone: 'no attempt yet',
      lastMissed: 'slipped through (more than {t} ms)',
      lastEarly: 'too early – invalid',
      meanText: 'Mean of {n} {unit}: {m} ms (fastest {min} ms, slowest {max} ms)',
      attemptOne: 'attempt',
      attemptMany: 'attempts',
      mean: 'mean {m} ms',
      noAttempts: 'Your reaction times will appear here.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const mode = () => p.mode as Mode;
    const g = () => (mode() === 'tube' ? PLANETS.erde : PLANETS[p.planet as PlanetId]);
    const planetName = () => {
      const names: Record<PlanetId, [string, string]> = { erde: ['Erde', 'Earth'], mond: ['Mond', 'Moon'], mars: ['Mars', 'Mars'], jupiter: ['Jupiter', 'Jupiter'] };
      return names[p.planet as PlanetId][ctx.lang === 'de' ? 0 : 1];
    };
    const narrow = () => surface.width < 640;

    /* ---------- Aufteilung ---------- */
    function regions(): { scene: Rect; ts: Rect; tv: Rect } {
      const w = surface.width;
      const h = surface.height;
      const gap = 10;
      if (!narrow()) {
        const sw = Math.round(Math.min(w * 0.42, h * 0.72));
        const cw = w - sw - gap;
        const ch = (h - gap) / 2;
        return { scene: { x: 0, y: 0, w: sw, h }, ts: { x: sw + gap, y: 0, w: cw, h: ch }, tv: { x: sw + gap, y: ch + gap, w: cw, h: ch } };
      }
      const sh = Math.round(h * (mode() === 'ruler' ? 0.54 : 0.48));
      const ch = (h - sh - 2 * gap) / 2;
      return { scene: { x: 0, y: 0, w, h: sh }, ts: { x: 0, y: sh + gap, w, h: ch }, tv: { x: 0, y: sh + gap * 2 + ch, w, h: ch } };
    }

    const chart = (key: 'ts' | 'tv') =>
      new Plot(surface, { x: [0, 1], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions()[key] });
    const plotS = chart('ts');
    const plotV = chart('tv');
    /** Unsichtbares Koordinatensystem über der Szene, nur für die ziehbare Kugel (Welt = Pixel, y gespiegelt). */
    const scenePlot = new Plot(surface, { x: [0, 1], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().scene });
    const pad = () => ({ left: narrow() ? 46 : 54, right: narrow() ? 40 : 46, top: 24, bottom: 20 });

    /* ---------- Zustand ---------- */
    let t = 0;
    const landing = new Tween(700, ease.outCubic);
    // Fallröhre
    let tubeState: 'rest' | 'flipping' | 'falling' = 'rest';
    let side = 1;
    const flip = new Tween(900, ease.inOutCubic);
    const pumpTween = new Tween(1100, ease.inOutCubic);
    let vacFrom = p.vac ? 1 : 0;
    // Reaktionstest
    type Phase = 'idle' | 'armed' | 'falling' | 'caught' | 'missed' | 'early';
    let phase: Phase = 'idle';
    let armUntil = 0;
    let releasedAt = 0;
    let caughtS = 0;
    let attempts: number[] = [];
    let lastAttempt: { kind: 'ok'; s: number; t: number } | { kind: 'missed' } | { kind: 'early' } | null = null;
    const grip = new Tween(140, ease.outCubic);

    const T = () => fallTime(p.h, g());
    const vEnd = (obj: 'ball' | 'feather') => (p.vac ? Infinity : TERMINAL[obj]);
    const tubeTime = (obj: 'ball' | 'feather') => dragFallTime(TUBE, PLANETS.erde, vEnd(obj));
    const tubeEnd = () => Math.max(tubeTime('ball'), tubeTime('feather'));
    const tubeS = (obj: 'ball' | 'feather', time: number) => Math.min(TUBE, dragDistance(PLANETS.erde, vEnd(obj), Math.min(time, tubeTime(obj))));
    const tubeV = (obj: 'ball' | 'feather', time: number) => (time >= tubeTime(obj) ? 0 : dragSpeed(PLANETS.erde, vEnd(obj), time));
    const endTime = () => (mode() === 'tube' ? tubeEnd() : T());

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const m = mode();
      if (m === 'tower') {
        const tt = Math.min(t, T());
        const v = fallSpeed(g(), tt);
        ctx.readout('now', tr('nowTower', { t: fmt.fixed(tt, 2), s: fmt.num(fallDistance(g(), tt), 2), v: fmt.num(v, 2), kmh: fmt.num(v * 3.6, 0) }));
      } else if (m === 'tube') {
        const tt = tubeState === 'falling' ? t : 0;
        ctx.readout(
          'now',
          tr('nowTube', { t: fmt.fixed(tt, 2), sb: fmt.num(tubeS('ball', tt), 2), vb: fmt.num(tubeV('ball', tt), 2), sf: fmt.num(tubeS('feather', tt), 2), vf: fmt.num(tubeV('feather', tt), 2) }),
        );
      } else ctx.readout('now', null);
    }

    function updateReadouts(): void {
      updateNow();
      const m = mode();
      const gs = fmt.num(g(), 2);
      if (m === 'tower') {
        ctx.readout('law', {
          html: `<var>s</var> = ½ · <var>g</var> · <var>t</var>²<br><var>v</var> = <var>g</var> · <var>t</var><br><var>a</var> = <var>g</var> = ${gs} m/s² (${planetName()})`,
        });
        const v = impactSpeed(p.h, g());
        ctx.readout('fall', tr('fallTower', { t: fmt.num(T(), 2), v: fmt.num(v, 1), kmh: fmt.num(v * 3.6, 0) }));
        const n = Math.min(6, Math.floor(T() / p.dt + 1e-9));
        if (n >= 2) {
          const gaps = strobeGaps(g(), p.dt, n);
          const unitGap = gaps[0]!;
          const meters = gaps.map((x) => fmt.num(x, x < 0.1 ? 3 : 2)).join(' m; ');
          ctx.readout('ratio', tr('ratio', { gaps: `Δs = ${meters} m`, ratio: gaps.map((x) => fmt.num(x / unitGap, 0)).join(' : ') + ' : …' }));
        } else ctx.readout('ratio', null);
      } else {
        ctx.readout('ratio', null);
      }
      if (m === 'tube') {
        ctx.readout('law', tr('lawTube', { vf: fmt.num(TERMINAL.feather, 1) }));
        ctx.readout('fall', null);
        ctx.readout('arrive', tr('fallTube', { tb: fmt.num(tubeTime('ball'), 2), tf: fmt.num(tubeTime('feather'), 2) }));
      } else {
        ctx.readout('arrive', null);
      }
      if (m === 'ruler') {
        ctx.readout('law', { html: `<var>t</var> = √(2 · <var>s</var> / <var>g</var>) ${ctx.lang === 'de' ? 'mit' : 'with'} <var>g</var> = ${gs} m/s² (${planetName()})` });
        ctx.readout('fall', null);
        updateRulerReadouts();
      } else {
        ctx.readout('last', null);
        ctx.readout('mean', null);
      }
    }

    function updateRulerReadouts(): void {
      if (!lastAttempt) ctx.readout('last', ctx.t('lastNone'));
      else if (lastAttempt.kind === 'ok') ctx.readout('last', tr('lastText', { s: fmt.num(lastAttempt.s * 100, 1), t: fmt.num(lastAttempt.t * 1000, 0) }));
      else if (lastAttempt.kind === 'missed') ctx.readout('last', tr('lastMissed', { t: fmt.num(reactionTime(RULER, g()) * 1000, 0) }));
      else ctx.readout('last', ctx.t('lastEarly'));
      const st = stats(attempts);
      ctx.readout(
        'mean',
        st
          ? tr('meanText', {
              n: String(attempts.length),
              unit: ctx.t(attempts.length === 1 ? 'attemptOne' : 'attemptMany'),
              m: fmt.num(st.mean * 1000, 0),
              min: fmt.num(st.min * 1000, 0),
              max: fmt.num(st.max * 1000, 0),
            })
          : null,
      );
      const active = phase === 'armed' || phase === 'falling';
      ctx.setAction('catch', { enabled: active });
      ctx.setAction('start', { enabled: !active });
    }

    /* ---------- Reaktionstest ---------- */
    function startTrial(): void {
      if (mode() !== 'ruler') return;
      phase = 'armed';
      armUntil = performance.now() + 1200 + Math.random() * 2300;
      grip.finish();
      updateRulerReadouts();
      ctx.requestRender();
    }

    function catchRuler(): void {
      const now = performance.now();
      if (phase === 'armed') {
        phase = 'early';
        lastAttempt = { kind: 'early' };
      } else if (phase === 'falling') {
        const tau = (now - releasedAt) / 1000;
        caughtS = fallDistance(g(), tau);
        if (caughtS > RULER) {
          phase = 'missed';
          lastAttempt = { kind: 'missed' };
        } else {
          phase = 'caught';
          const rt = reactionTime(caughtS, g());
          lastAttempt = { kind: 'ok', s: caughtS, t: rt };
          attempts = [...attempts, rt].slice(-MAX_ATTEMPTS);
          grip.play();
        }
      } else return;
      updateRulerReadouts();
      ctx.requestRender();
    }

    /** Fortschritt des Reaktionstests (in render aufgerufen, Zeitbasis: echte Zeit). */
    function rulerFall(): number {
      const now = performance.now();
      if (phase === 'armed' && now >= armUntil) {
        phase = 'falling';
        releasedAt = armUntil;
      }
      if (phase === 'falling') {
        const s = fallDistance(g(), (now - releasedAt) / 1000);
        if (s > RULER + 0.02) {
          phase = 'missed';
          lastAttempt = { kind: 'missed' };
          caughtS = s;
          updateRulerReadouts();
        }
        return s;
      }
      if (phase === 'caught') return caughtS;
      if (phase === 'missed') return Math.min(fallDistance(g(), (now - releasedAt) / 1000), 4);
      return 0;
    }

    const onKey = (event: KeyboardEvent) => {
      if (mode() !== 'ruler' || (phase !== 'armed' && phase !== 'falling')) return;
      if (event.key !== ' ' && event.code !== 'Space') return;
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
      event.preventDefault();
      catchRuler();
    };
    document.addEventListener('keydown', onKey);

    /* ---------- Zeiger ---------- */
    // Kugel im Fallturm ziehen: Ort wählen, Zeit ablesen
    let sceneMap: { x: number; y0: number; y1: number; h: number } | null = null;
    scenePlot.addHandle({
      get: () => {
        if (!sceneMap) return [NaN, NaN];
        const s = fallDistance(g(), Math.min(t, T()));
        return [sceneMap.x, -(sceneMap.y0 + (s / sceneMap.h) * (sceneMap.y1 - sceneMap.y0))];
      },
      set: (_x, y) => {
        if (!sceneMap) return;
        ctx.clock.pause();
        const s = Math.max(0, Math.min(sceneMap.h, ((-y - sceneMap.y0) / (sceneMap.y1 - sceneMap.y0)) * sceneMap.h));
        t = Math.sqrt((2 * s) / g());
        landing.finish();
        updateNow();
      },
      axis: 'y',
      enabled: () => mode() === 'tower',
      color: () => ctx.theme.series[0]!,
    });
    // Zeitmarke im t-s-Diagramm (auf dem Graphen entlang)
    plotS.addHandle({
      get: () => {
        if (mode() === 'tower') return [Math.min(t, T()), fallDistance(g(), Math.min(t, T()))];
        if (mode() === 'tube' && tubeState === 'falling') return [t, tubeS('ball', t)];
        return [NaN, NaN];
      },
      set: (x) => {
        ctx.clock.pause();
        t = Math.max(0, Math.min(endTime(), x));
        landing.finish();
        updateNow();
      },
      axis: 'x',
      enabled: () => mode() === 'tower' || (mode() === 'tube' && tubeState === 'falling'),
      color: () => ctx.theme.series[0]!,
    });
    new TapTarget(surface, {
      hit: (px, py) => {
        if (mode() !== 'ruler') return null;
        const r = regions().scene;
        if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
        return phase === 'armed' || phase === 'falling' ? 'catch' : 'start';
      },
      onTap: (id) => (id === 'catch' ? catchRuler() : startTrial()),
    });

    /* ---------- Zeichenhilfen ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid = false): number {
      const gx = surface.g;
      const theme = ctx.theme;
      gx.font = `700 ${size}px ${theme.font}`;
      const w = gx.measureText(label).width + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 1;
      gx.fillStyle = solid ? color : theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
      roundRect(gx, x0, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      if (!solid) {
        gx.strokeStyle = withAlpha(color, 0.45);
        gx.lineWidth = 1;
        roundRect(gx, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        gx.stroke();
      }
      text(gx, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: solid ? '#ffffff' : color });
      return w;
    }

    function drawBall(x: number, y: number, r: number, alpha = 1): void {
      const gx = surface.g;
      gx.save();
      gx.globalAlpha = alpha;
      if (alpha >= 1) {
        gx.shadowColor = 'rgba(0,0,0,0.35)';
        gx.shadowBlur = 6;
        gx.shadowOffsetY = 2;
      }
      const grad = gx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#d5dbe3');
      grad.addColorStop(1, '#5d6673');
      gx.fillStyle = grad;
      gx.beginPath();
      gx.arc(x, y, r, 0, Math.PI * 2);
      gx.fill();
      gx.restore();
    }

    function drawFeather(x: number, y: number, len: number, angle: number, alpha = 1): void {
      const gx = surface.g;
      const img = ctx.images.get('feather');
      gx.save();
      gx.translate(x, y);
      gx.rotate(angle);
      gx.globalAlpha = alpha;
      if (img) {
        gx.drawImage(img, -len / 2, (-len * 0.375) / 2, len, len * 0.375);
        gx.restore();
        return;
      }
      const vane = gx.createLinearGradient(0, -len * 0.15, 0, len * 0.1);
      vane.addColorStop(0, '#ffffff');
      vane.addColorStop(1, '#d8dde5');
      gx.fillStyle = vane;
      gx.strokeStyle = 'rgba(70,80,95,0.45)';
      gx.lineWidth = 0.8;
      gx.beginPath();
      gx.moveTo(-len * 0.36, 0);
      gx.bezierCurveTo(-len * 0.25, -len * 0.17, len * 0.2, -len * 0.16, len * 0.5, -len * 0.02);
      gx.bezierCurveTo(len * 0.25, len * 0.1, -len * 0.2, len * 0.11, -len * 0.36, 0);
      gx.closePath();
      gx.fill();
      gx.stroke();
      // Äste der Fahne
      gx.strokeStyle = 'rgba(120,128,140,0.35)';
      gx.lineWidth = 0.7;
      for (let i = 1; i < 9; i++) {
        const u = -0.32 + i * 0.09;
        gx.beginPath();
        gx.moveTo(len * u, -len * 0.003 * i);
        gx.lineTo(len * (u + 0.07), -len * (0.12 - i * 0.008));
        gx.moveTo(len * u, 0);
        gx.lineTo(len * (u + 0.06), len * (0.08 - i * 0.005));
        gx.stroke();
      }
      // Kiel
      gx.strokeStyle = '#a99f8f';
      gx.lineWidth = Math.max(1, len * 0.025);
      gx.lineCap = 'round';
      gx.beginPath();
      gx.moveTo(-len * 0.5, len * 0.015);
      gx.quadraticCurveTo(0, -len * 0.01, len * 0.48, -len * 0.025);
      gx.stroke();
      gx.restore();
    }

    function planetIcon(x: number, y: number, r: number): void {
      const gx = surface.g;
      const id = (mode() === 'tube' ? 'erde' : p.planet) as PlanetId;
      const colors: Record<PlanetId, [string, string]> = {
        erde: ['#6fb7ff', '#1f5fae'],
        mond: ['#e6e6e6', '#8a8a8a'],
        mars: ['#f08a5d', '#9c3a17'],
        jupiter: ['#f3d9b1', '#b07a45'],
      };
      const [c0, c1] = colors[id];
      const grad = gx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
      grad.addColorStop(0, c0);
      grad.addColorStop(1, c1);
      gx.fillStyle = grad;
      gx.beginPath();
      gx.arc(x, y, r, 0, Math.PI * 2);
      gx.fill();
      gx.save();
      gx.beginPath();
      gx.arc(x, y, r, 0, Math.PI * 2);
      gx.clip();
      if (id === 'erde') {
        gx.fillStyle = 'rgba(76,160,80,0.9)';
        gx.beginPath();
        gx.ellipse(x - r * 0.25, y - r * 0.1, r * 0.4, r * 0.28, 0.5, 0, Math.PI * 2);
        gx.ellipse(x + r * 0.45, y + r * 0.35, r * 0.3, r * 0.2, -0.3, 0, Math.PI * 2);
        gx.fill();
      } else if (id === 'jupiter') {
        gx.fillStyle = 'rgba(160,95,50,0.55)';
        for (const k of [-0.45, -0.1, 0.3]) gx.fillRect(x - r, y + k * r, 2 * r, r * 0.16);
      } else if (id === 'mond') {
        gx.fillStyle = 'rgba(110,110,110,0.45)';
        for (const [dx, dy, rr] of [
          [-0.3, -0.2, 0.22],
          [0.35, 0.25, 0.16],
          [0.1, -0.45, 0.1],
        ] as const) {
          gx.beginPath();
          gx.arc(x + dx * r, y + dy * r, rr * r, 0, Math.PI * 2);
          gx.fill();
        }
      }
      gx.restore();
    }

    /** Senkrechte Skala mit Teilstrichen; s wächst nach unten. */
    function verticalScale(x: number, y0: number, y1: number, length: number, color: string, label: string, side: -1 | 1 = -1): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const pxPer = (y1 - y0) / length;
      const step = niceStep(34 / pxPer);
      const mant = Math.round(step / 10 ** Math.floor(Math.log10(step)));
      const minor = step / (mant === 2 ? 4 : 5);
      gx.strokeStyle = color;
      gx.lineWidth = 1;
      gx.beginPath();
      gx.moveTo(x + 0.5, y0);
      gx.lineTo(x + 0.5, y1);
      for (let k = 0; k * minor <= length + 1e-9; k++) {
        const s = k * minor;
        const y = Math.round(y0 + s * pxPer) + 0.5;
        const major = Math.abs(s / step - Math.round(s / step)) < 1e-6;
        gx.moveTo(x, y);
        gx.lineTo(x + side * (major ? 8 : 4), y);
      }
      gx.stroke();
      const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
      for (let k = 0; k * step <= length + 1e-9; k++) {
        const y = y0 + k * step * pxPer;
        text(gx, fmt.num(k * step, decimals), x - (side < 0 ? 12 : 6), y, { font: `600 11px ${theme.font}`, color, align: 'right' });
      }
      text(gx, label, x - (side < 0 ? 12 : 6), y0 - 12, { font: `700 11px ${theme.font}`, color, align: 'right', baseline: 'bottom' });
    }

    /* ---------- Fallturm ---------- */
    function drawTower(r: Rect): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      const bg = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, '#0b1322');
      bg.addColorStop(1, '#1a2438');
      gx.fillStyle = bg;
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.fill();
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      // Lichtkegel des Stroboskops
      const lx = r.x + r.w * 0.5;
      const glow = gx.createRadialGradient(lx, r.y + r.h * 0.45, 10, lx, r.y + r.h * 0.45, r.h * 0.6);
      glow.addColorStop(0, 'rgba(120,160,255,0.10)');
      glow.addColorStop(1, 'rgba(120,160,255,0)');
      gx.fillStyle = glow;
      gx.fillRect(r.x, r.y, r.w, r.h);

      const R = small ? 8 : 9;
      const groundH = 30;
      const y0 = r.y + 56;
      const y1 = r.y + r.h - groundH - R;
      const fx = r.x + r.w * (small ? 0.42 : 0.47);
      sceneMap = { x: fx, y0, y1, h: p.h };
      const yOf = (s: number) => y0 + (s / p.h) * (y1 - y0);
      // Skala
      verticalScale(r.x + (small ? 38 : 42), y0, y1, p.h, 'rgba(225,232,245,0.85)', ctx.t('scale'), 1);
      // Boden
      const gy = y1 + R;
      const ground = gx.createLinearGradient(0, gy, 0, r.y + r.h);
      ground.addColorStop(0, '#5b4a36');
      ground.addColorStop(1, '#3a2f22');
      gx.fillStyle = ground;
      gx.fillRect(r.x, gy, r.w, r.y + r.h - gy);
      gx.fillStyle = 'rgba(255,255,255,0.18)';
      gx.fillRect(r.x, gy, r.w, 1.5);
      text(gx, tr('ground', { g: fmt.num(g(), 2), p: planetName() }), r.x + r.w - 30, gy + (r.y + r.h - gy) / 2 + 1, { font: `700 11px ${theme.font}`, color: 'rgba(240,235,225,0.92)', align: 'right' });
      planetIcon(r.x + r.w - 16, gy + (r.y + r.h - gy) / 2, 8);
      // Haltemagnet
      gx.fillStyle = '#7d8592';
      roundRect(gx, fx - 18, y0 - R - 16, 36, 14, 3);
      gx.fill();
      gx.fillStyle = '#c0703a';
      for (let i = 0; i < 5; i++) gx.fillRect(fx - 14 + i * 6, y0 - R - 14, 3, 10);
      gx.fillStyle = '#4b525c';
      gx.fillRect(fx - 2, r.y, 4, y0 - R - 16 - r.y);

      const tt = Math.min(t, T());
      const s = fallDistance(g(), tt);
      // Stroboskop
      if (p.strobe) {
        const dt = p.dt;
        const n = Math.floor(tt / dt + 1e-9);
        const bx = r.x + r.w * (small ? 0.68 : 0.72);
        let prevY = yOf(0);
        let prevLabel = -Infinity;
        for (let k = 0; k <= n; k++) {
          const sk = fallDistance(g(), k * dt);
          const y = yOf(sk);
          drawBall(fx, y, R, 0.55);
          gx.strokeStyle = 'rgba(160,190,255,0.35)';
          gx.lineWidth = 1;
          gx.setLineDash([2, 3]);
          gx.beginPath();
          gx.moveTo(fx + R + 3, y);
          gx.lineTo(bx, y);
          gx.stroke();
          gx.setLineDash([]);
          if (k > 0) {
            // Abschnitt zwischen zwei Bildern: abwechselnd gefärbt, beschriftet mit dem Vielfachen des ersten Abstands
            gx.fillStyle = withAlpha(theme.series[0]!, k % 2 ? 0.85 : 0.5);
            gx.fillRect(bx, prevY, 10, Math.max(1, y - prevY));
            const mid = (prevY + y) / 2;
            if (y - prevY >= 10 && mid - prevLabel >= 13) {
              text(gx, String(2 * k - 1), bx + 16, mid, { font: `700 ${small ? 11 : 12}px ${theme.font}`, color: '#dbe6ff', align: 'left' });
              prevLabel = mid;
            }
          }
          prevY = y;
        }
        if (n >= 1) text(gx, 'Δs', bx + 5, y0 - 12, { font: `700 11px ${theme.font}`, color: '#dbe6ff', baseline: 'bottom' });
      }
      // Kugel
      drawBall(fx, yOf(s), R);
      // Aufprall
      if (tt >= T() - 1e-9 && landing.running) {
        const u = landing.value;
        gx.strokeStyle = `rgba(255,230,180,${0.7 * (1 - u)})`;
        gx.lineWidth = 2;
        gx.beginPath();
        gx.ellipse(fx, gy, 8 + u * 30, 2 + u * 6, 0, Math.PI, 0);
        gx.stroke();
      }
      // Anzeigen
      const size = small ? 11.5 : 12.5;
      pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(tt, 2)} s`, theme.text, 'left', size);
      pill(r.x + r.w - 8, r.y + 8, `v = ${fmt.num(fallSpeed(g(), tt), 1)} m/s`, theme.series[3]!, 'right', size);
      gx.restore();
    }

    /* ---------- Fallröhre ---------- */
    const rand = seededRandom(7);
    const particles = Array.from({ length: 46 }, () => ({ u: rand() * 0.84 - 0.42, v: rand() * 0.96 + 0.02, ph: rand() * 6.28 }));

    function drawTube(r: Rect): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const bg = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#172030' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0f1621' : '#dde4ec');
      gx.fillStyle = bg;
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.fill();
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      // Tisch
      const tableY = r.y + r.h - 26;
      gx.fillStyle = dark ? '#3a3027' : '#b98e63';
      gx.fillRect(r.x, tableY, r.w, r.h);
      gx.fillStyle = 'rgba(255,255,255,0.2)';
      gx.fillRect(r.x, tableY, r.w, 1.5);

      const cx = r.x + r.w * (small ? 0.4 : 0.44);
      const tw = small ? 52 : 62;
      const capH = 12;
      const top = r.y + 44;
      const bottom = tableY - 22;
      const inner0 = top + capH;
      const inner1 = bottom - capH;
      const R = small ? 7 : 8;
      const featherLen = tw * 0.6;
      const pxPer = (inner1 - inner0 - 2 * R) / TUBE;
      // Skala links der Röhre (s nach unten ab der Startlage oben)
      verticalScale(cx - tw / 2 - 10, inner0 + R, inner0 + R + TUBE * pxPer, TUBE, theme.muted, ctx.t('scale'), -1);

      // Pumpe mit Schlauch und Manometer
      const vacNow = pumpTween.running ? vacFrom + ((p.vac ? 1 : 0) - vacFrom) * pumpTween.value : p.vac ? 1 : 0;
      const pumpX = r.x + r.w - (small ? 64 : 74);
      const pumpY = tableY - 44;
      gx.strokeStyle = dark ? '#566170' : '#6b7684';
      gx.lineWidth = 5;
      gx.lineCap = 'round';
      gx.beginPath();
      gx.moveTo(cx + 8, bottom + 4);
      gx.bezierCurveTo(cx + 10, tableY - 4, pumpX - 30, tableY - 4, pumpX, pumpY + 30);
      gx.stroke();
      const pumpGrad = gx.createLinearGradient(0, pumpY, 0, pumpY + 44);
      pumpGrad.addColorStop(0, dark ? '#4a5568' : '#8d99a8');
      pumpGrad.addColorStop(1, dark ? '#2d3644' : '#5f6b7a');
      gx.fillStyle = pumpGrad;
      roundRect(gx, pumpX, pumpY, small ? 56 : 64, 44, 6);
      gx.fill();
      const mx = pumpX + (small ? 28 : 32);
      const my = pumpY + 20;
      gx.fillStyle = '#f5f7fa';
      gx.beginPath();
      gx.arc(mx, my, 13, 0, Math.PI * 2);
      gx.fill();
      gx.strokeStyle = '#2b3240';
      gx.lineWidth = 1.5;
      gx.beginPath();
      gx.arc(mx, my, 13, 0, Math.PI * 2);
      gx.stroke();
      const needle = Math.PI * (0.8 + 1.4 * (1 - vacNow));
      gx.strokeStyle = '#d6332c';
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(mx, my);
      gx.lineTo(mx + Math.cos(needle) * 10, my + Math.sin(needle) * 10);
      gx.stroke();
      text(gx, ctx.t('pump'), pumpX + (small ? 28 : 32), pumpY + 39, { font: `700 9.5px ${theme.font}`, color: '#ffffff' });

      // Röhre (beim Umdrehen um ihre Mitte gedreht)
      const angle = flip.running ? Math.PI * flip.value : 0;
      const midY = (top + bottom) / 2;
      gx.save();
      gx.translate(cx, midY);
      gx.rotate(angle);
      gx.translate(-cx, -midY);
      // Glas
      gx.fillStyle = dark ? 'rgba(170,210,255,0.08)' : 'rgba(170,210,255,0.22)';
      gx.fillRect(cx - tw / 2, inner0, tw, inner1 - inner0);
      // Luftteilchen
      if (vacNow < 1) {
        const time = performance.now() / 1000;
        const valveX = cx;
        const valveY = bottom;
        gx.fillStyle = dark ? 'rgba(200,220,255,0.45)' : 'rgba(70,100,140,0.4)';
        for (const q of particles) {
          const k = ease.inCubic(Math.min(1, vacNow * 1.15));
          const px0 = cx + (q.u + 0.03 * Math.sin(time * 1.3 + q.ph)) * tw;
          const py0 = inner0 + (q.v + 0.01 * Math.cos(time * 1.1 + q.ph)) * (inner1 - inner0);
          const px1 = px0 + (valveX - px0) * k;
          const py1 = py0 + (valveY - py0) * k;
          gx.globalAlpha = 1 - vacNow;
          gx.beginPath();
          gx.arc(px1, py1, 1.6, 0, Math.PI * 2);
          gx.fill();
        }
        gx.globalAlpha = 1;
      }
      // Objekte
      const resting = tubeState !== 'falling';
      const ballX = cx - side * tw * 0.22;
      const featherX = cx + side * tw * 0.2;
      const yBall = (s: number) => inner0 + R + s * pxPer;
      const strobeOn = p.strobe && tubeState === 'falling';
      if (strobeOn) {
        const dt = 0.1;
        for (let k = 1; k * dt < t; k++) {
          const tk = k * dt;
          if (tk < tubeTime('ball')) drawBall(ballX, yBall(tubeS('ball', tk)), R, 0.35);
          if (tk < tubeTime('feather')) drawFeather(featherX, yBall(tubeS('feather', tk)), featherLen, side > 0 ? 0 : Math.PI, 0.22);
        }
      }
      if (resting) {
        // liegen unten (beim Umdrehen drehen sie mit)
        drawBall(ballX, inner1 - R, R);
        drawFeather(featherX, inner1 - 3, featherLen, side > 0 ? 0 : Math.PI);
      } else {
        const sb = tubeS('ball', t);
        const sf = tubeS('feather', t);
        drawBall(ballX, yBall(sb), R);
        const flutter = p.vac || t >= tubeTime('feather') ? 0 : Math.min(1, t * 2);
        const sway = flutter * Math.sin(t * 5.2) * tw * 0.07;
        const tilt = flutter * Math.sin(t * 5.2 + 0.9) * 0.35;
        drawFeather(featherX + sway, Math.min(yBall(sf), inner1 - 3), featherLen, tilt + (side > 0 ? 0 : Math.PI));
      }
      // Glanzlichter und Rand
      const shine = gx.createLinearGradient(cx - tw / 2, 0, cx + tw / 2, 0);
      shine.addColorStop(0, 'rgba(255,255,255,0.55)');
      shine.addColorStop(0.18, 'rgba(255,255,255,0.05)');
      shine.addColorStop(0.75, 'rgba(255,255,255,0)');
      shine.addColorStop(0.9, 'rgba(255,255,255,0.35)');
      shine.addColorStop(1, 'rgba(255,255,255,0.08)');
      gx.fillStyle = shine;
      gx.fillRect(cx - tw / 2, inner0, tw, inner1 - inner0);
      gx.strokeStyle = dark ? 'rgba(200,220,255,0.55)' : 'rgba(60,90,120,0.55)';
      gx.lineWidth = 1.5;
      gx.strokeRect(cx - tw / 2, inner0, tw, inner1 - inner0);
      // Endkappen
      for (const [y, h] of [
        [top, capH],
        [bottom - capH, capH],
      ] as const) {
        const cap = gx.createLinearGradient(cx - tw / 2 - 5, 0, cx + tw / 2 + 5, 0);
        cap.addColorStop(0, '#6c7480');
        cap.addColorStop(0.4, '#c9ced6');
        cap.addColorStop(1, '#5d6570');
        gx.fillStyle = cap;
        roundRect(gx, cx - tw / 2 - 5, y, tw + 10, h, 3);
        gx.fill();
      }
      gx.fillStyle = '#5d6570';
      gx.fillRect(cx - 4, bottom, 8, 6);
      gx.restore();

      // Beschriftungen
      const label = (x: number, y: number, s: string, color: string, align: CanvasTextAlign) =>
        text(gx, s, x, y, { font: `700 ${small ? 11 : 12}px ${theme.font}`, color, align });
      const lblY = top - 14;
      if (!flip.running) {
        label(cx - side * 4, lblY, ctx.t('ball'), theme.series[0]!, side > 0 ? 'right' : 'left');
        label(cx + side * 4, lblY, ctx.t('feather'), theme.series[2]!, side > 0 ? 'left' : 'right');
      }
      pill(r.x + r.w - 8, r.y + 8, ctx.t(vacNow > 0.5 ? 'vacuum' : 'air'), vacNow > 0.5 ? theme.series[4]! : theme.series[5]!, 'right', small ? 11.5 : 12.5);
      pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(tubeState === 'falling' ? t : 0, 2)} s`, theme.text, 'left', small ? 11.5 : 12.5);
      gx.restore();
    }

    /* ---------- Reaktionstest ---------- */
    function drawFinger(tipX: number, y: number, len: number, thick: number, dir: -1 | 1, nail = true): void {
      const gx = surface.g;
      const x0 = tipX;
      const x1 = tipX + dir * len;
      const skin = gx.createLinearGradient(0, y - thick / 2, 0, y + thick / 2);
      skin.addColorStop(0, '#f3cfb1');
      skin.addColorStop(0.6, '#e2a985');
      skin.addColorStop(1, '#c98a66');
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 5;
      gx.shadowOffsetY = 2;
      gx.fillStyle = skin;
      roundRect(gx, Math.min(x0, x1), y - thick / 2, len, thick, thick / 2);
      gx.fill();
      gx.restore();
      // Fingernagel
      if (nail) {
        gx.fillStyle = 'rgba(255,236,226,0.85)';
        roundRect(gx, dir > 0 ? x0 + 3 : x0 - 3 - thick * 0.75, y - thick * 0.38, thick * 0.75, thick * 0.42, thick * 0.18);
        gx.fill();
      }
      // Gelenkfalte
      gx.strokeStyle = 'rgba(150,90,60,0.35)';
      gx.lineWidth = 1;
      gx.beginPath();
      gx.moveTo(x0 + dir * len * 0.45, y - thick * 0.3);
      gx.lineTo(x0 + dir * len * 0.45, y + thick * 0.3);
      gx.stroke();
    }

    /**
     * Hand, die das Lineal zwischen Daumen (links) und Zeigefinger (rechts)
     * hält. `vert` = +1: Handfläche und gekrümmte Finger liegen darunter.
     */
    function drawHand(rx: number, rw: number, y: number, gap: number, F: number, vert: 1 | -1, curled: number): void {
      const gx = surface.g;
      const L = F * 3.6;
      const right0 = rx + rw + gap;
      const left0 = rx - gap;
      const skinFill = (x: number, yy: number, rxx: number, ryy: number) => {
        const grad = gx.createRadialGradient(x - rxx * 0.3, yy - ryy * 0.3, 2, x, yy, Math.max(rxx, ryy));
        grad.addColorStop(0, '#f3cfb1');
        grad.addColorStop(1, '#d39672');
        gx.save();
        gx.shadowColor = 'rgba(0,0,0,0.22)';
        gx.shadowBlur = 6;
        gx.shadowOffsetY = 2;
        gx.fillStyle = grad;
        gx.beginPath();
        gx.ellipse(x, yy, rxx, ryy, 0, 0, Math.PI * 2);
        gx.fill();
        gx.restore();
      };
      // gekrümmte Finger und Handfläche rechts
      for (let i = curled; i >= 1; i--) drawFinger(right0 + F * (0.3 + 0.18 * i), y + vert * F * 0.88 * i, L * (0.8 - 0.07 * i), F * 0.92, 1, false);
      skinFill(right0 + L * 0.98, y + vert * F * (0.6 + 0.45 * curled), F * 1.45, F * (1.1 + 0.5 * curled));
      drawFinger(right0, y, L, F, 1);
      // Daumen mit Daumenballen links
      skinFill(left0 - L * 0.9, y + vert * F * 0.7, F * 1.25, F * 1.45);
      drawFinger(left0, y, L * 0.82, F * 1.08, -1);
    }

    function drawRulerScene(r: Rect, fall: number): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const bg = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#182131' : '#f2f5f9');
      bg.addColorStop(1, dark ? '#101722' : '#e2e8ef');
      gx.fillStyle = bg;
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.fill();
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();

      const rw = small ? 58 : 64;
      const cx = r.x + r.w * 0.5;
      const catchY = r.y + r.h - (small ? 50 : 64);
      const len = catchY - r.y - (small ? 84 : 100);
      const pxPerM = len / RULER;
      const offset = fall * pxPerM;
      const rx = cx - rw / 2;
      const top = catchY - len + offset;
      // Lineal
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.3)';
      gx.shadowBlur = 8;
      gx.shadowOffsetX = 2;
      gx.shadowOffsetY = 3;
      const wood = gx.createLinearGradient(rx, 0, rx + rw, 0);
      wood.addColorStop(0, '#f6dc8a');
      wood.addColorStop(0.5, '#fbe7a6');
      wood.addColorStop(1, '#e9c76a');
      gx.fillStyle = wood;
      roundRect(gx, rx, top - 20, rw, len + 28, 3);
      gx.fill();
      gx.restore();
      const ink = '#3d2f0c';
      const yOfCm = (cm: number) => top + len - cm * (len / 50);
      const pxPerCm = len / 50;
      gx.strokeStyle = ink;
      gx.lineWidth = 1;
      gx.beginPath();
      for (let mm = 0; mm <= 500; mm++) {
        const cm = mm / 10;
        const y = Math.round(yOfCm(cm)) + 0.5;
        if (y < r.y - 2 || y > r.y + r.h + 2) continue;
        const isCm = mm % 10 === 0;
        const isHalf = mm % 5 === 0;
        if (!isCm && pxPerCm < 18) continue;
        const l = isCm ? (cm % 5 === 0 ? 16 : 11) : isHalf ? 7 : 4;
        gx.moveTo(rx, y);
        gx.lineTo(rx + l, y);
      }
      gx.stroke();
      const every = pxPerCm >= 13 ? 1 : pxPerCm >= 6 ? 5 : 10;
      for (let cm = 0; cm <= 50; cm += every) {
        const y = yOfCm(cm);
        text(gx, String(cm), rx + (every === 1 && cm % 5 !== 0 ? 13 : 18), y, { font: `${cm % 5 === 0 ? 700 : 500} ${every === 1 && cm % 5 !== 0 ? 9 : small ? 10.5 : 11}px ${theme.font}`, color: ink, align: 'left' });
      }
      text(gx, 'cm', rx + 4, top - 11, { font: `700 9px ${theme.font}`, color: ink, align: 'left' });
      // Zeitskala (Reaktionszeit-Lineal)
      if (p.ms) {
        const red = '#c0262d';
        gx.strokeStyle = red;
        gx.beginPath();
        const tMax = reactionTime(RULER, g()) * 1000;
        const stepMs = tMax > 600 ? 100 : 50;
        for (let ms = stepMs; ms <= tMax; ms += stepMs) {
          const cm = fallDistance(g(), ms / 1000) * 100;
          const y = Math.round(yOfCm(cm)) + 0.5;
          gx.moveTo(rx + rw, y);
          gx.lineTo(rx + rw - 9, y);
        }
        gx.stroke();
        let last = Infinity;
        for (let ms = stepMs; ms <= tMax; ms += stepMs) {
          const y = yOfCm(fallDistance(g(), ms / 1000) * 100);
          if (last - y < 12) continue;
          last = y;
          text(gx, String(ms), rx + rw - 10, y, { font: `700 9px ${theme.font}`, color: red, align: 'right' });
        }
        text(gx, 'ms', rx + rw - 4, top - 11, { font: `700 9px ${theme.font}`, color: red, align: 'right' });
      }
      // Hand oben (hält das Lineal bis zum Loslassen)
      const holding = phase === 'idle' || phase === 'armed' || phase === 'early';
      const F = small ? 13 : 15;
      const fL = F * 3.6;
      const holdY = catchY - len - 11;
      drawHand(rx, rw, holdY, holding ? 0 : 12, F * 0.9, -1, 1);
      // Hand unten (fängt)
      const closing = phase === 'caught' ? (grip.running ? grip.value : 1) : 0;
      drawHand(rx, rw, catchY, 14 * (1 - closing), F, 1, 3);
      // Markierung am Fangpunkt
      if (phase === 'caught') {
        gx.strokeStyle = theme.series[1]!;
        gx.lineWidth = 2;
        gx.setLineDash([4, 3]);
        gx.beginPath();
        gx.moveTo(rx - fL - 10, catchY);
        gx.lineTo(rx + rw + fL + 10, catchY);
        gx.stroke();
        gx.setLineDash([]);
      }
      // Status
      const size = small ? 11.5 : 12.5;
      const msg =
        phase === 'idle'
          ? ctx.t('idle')
          : phase === 'armed' || phase === 'falling'
            ? `${ctx.t('armed')} – ${ctx.t('hint')}`
            : phase === 'early'
              ? ctx.t('early')
              : phase === 'missed'
                ? ctx.t('missed')
                : phase === 'caught'
                  ? tr('caught', { s: fmt.num(caughtS * 100, 1), t: fmt.num(reactionTime(caughtS, g()) * 1000, 0) })
                  : '';
      if (msg) {
        const color = phase === 'caught' ? theme.series[1]! : phase === 'early' || phase === 'missed' ? theme.series[3]! : theme.text;
        // lange Hinweise auf schmalen Szenen umbrechen
        gx.font = `700 ${size}px ${theme.font}`;
        if (gx.measureText(msg).width + 24 > r.w && msg.includes('–')) {
          const [a, b] = msg.split('–').map((q) => q.trim());
          pill(r.x + r.w / 2, r.y + 8, a!, color, 'center', size);
          pill(r.x + r.w / 2, r.y + 8 + size + 15, b!, color, 'center', size);
        } else pill(r.x + r.w / 2, r.y + 8, msg, color, 'center', size, phase === 'caught');
      }
      gx.restore();
    }

    /* ---------- Diagramme ---------- */
    function frame(plot: Plot): void {
      const gx = surface.g;
      const r = plot.rect;
      gx.save();
      gx.strokeStyle = ctx.theme.grid;
      gx.lineWidth = 1;
      roundRect(gx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      gx.stroke();
      gx.restore();
    }

    function curve(plot: Plot, f: (x: number) => number, from: number, to: number, style: { color: string; width?: number; dash?: number[]; alpha?: number }): void {
      if (!(to > from)) return;
      const n = Math.max(2, Math.ceil(((to - from) * plot.scale.x) / 3));
      const pts: Pt[] = [];
      for (let i = 0; i <= n; i++) {
        const x = from + ((to - from) * i) / n;
        pts.push([x, f(x)]);
      }
      plot.polyline(pts, style);
    }

    function cornerPill(plot: Plot, label: string, color: string, row = 0, corner: 'left' | 'right' = 'left'): void {
      const r = plot.rect;
      const size = narrow() ? 11 : 12;
      const y = r.y + (corner === 'left' ? 26 : 6) + row * (size + 15);
      if (corner === 'left') pill(r.x + pad().left + 12, y, label, color, 'left', size);
      else pill(r.x + r.w - 10, y, label, color, 'right', size);
    }

    function towerCharts(): void {
      const theme = ctx.theme;
      const Tf = T();
      const tt = Math.min(t, Tf);
      const blue = theme.series[0]!;
      const orange = theme.series[3]!;
      // t-s
      plotS.setAxes({ x: { label: ctx.t('time') }, y: { label: ctx.t('fallS') } });
      plotS.setRangePadded([0, Tf], [0, niceTop(p.h)], pad());
      plotS.begin();
      plotS.grid({ minor: false });
      plotS.axes();
      plotS.hline(p.h, { color: theme.muted, width: 1, dash: [4, 4] });
      plotS.text(0, p.h, `h = ${fmt.num(p.h, 1)} m`, { color: theme.muted, size: 11, weight: '600', align: 'left', offset: [8, -5] });
      curve(plotS, (x) => fallDistance(g(), x), 0, Tf, { color: blue, width: 2, dash: [6, 5], alpha: 0.45 });
      curve(plotS, (x) => fallDistance(g(), x), 0, tt, { color: blue, width: 3 });
      if (p.strobe) for (let k = 0; k * p.dt <= tt + 1e-9; k++) plotS.point(k * p.dt, fallDistance(g(), k * p.dt), { color: blue, radius: 3.5, hollow: true });
      plotS.vline(tt, { color: theme.text, width: 1.5, alpha: 0.35 });
      plotS.point(tt, fallDistance(g(), tt), { color: blue, radius: 6 });
      plotS.end();
      frame(plotS);
      // t-v
      const vmax = impactSpeed(p.h, g());
      plotV.setAxes({ x: { label: ctx.t('time') }, y: { label: ctx.t('fallV') } });
      plotV.setRangePadded([0, Tf], [0, niceTop(vmax)], pad());
      plotV.begin();
      plotV.grid({ minor: false });
      if (tt > 0) plotV.polygon([[0, 0], [tt, fallSpeed(g(), tt)], [tt, 0]], { fill: blue, alpha: 0.2 });
      plotV.axes();
      curve(plotV, (x) => fallSpeed(g(), x), 0, Tf, { color: orange, width: 2, dash: [6, 5], alpha: 0.45 });
      curve(plotV, (x) => fallSpeed(g(), x), 0, tt, { color: orange, width: 3 });
      // Steigungsdreieck: g = Δv/Δt
      const dtS = [0.1, 0.2, 0.25, 0.5, 1, 2, 5].find((d) => d >= Tf / 4) ?? 5;
      // Die Steigung ist überall gleich: Dreieck mittig, damit es frei steht
      const t0 = Math.max(0, (Tf - dtS) / 2);
      const v0 = fallSpeed(g(), t0);
      const purple = theme.series[4]!;
      plotV.polygon([[t0, v0], [t0 + dtS, v0], [t0 + dtS, v0 + g() * dtS]], { fill: purple, alpha: 0.13, stroke: purple, width: 1.8 });
      plotV.text(t0 + dtS / 2, v0, `Δt = ${fmt.num(dtS, 2)} s`, { color: purple, size: 11, weight: '600', align: 'center', baseline: 'top', offset: [0, 4] });
      plotV.text(t0 + dtS, v0 + (g() * dtS) / 2, `Δv = ${fmt.num(g() * dtS, 2)} m/s`, { color: purple, size: 11, weight: '600', align: 'left', baseline: 'middle', offset: [6, 0] });
      plotV.vline(tt, { color: theme.text, width: 1.5, alpha: 0.35 });
      plotV.point(tt, fallSpeed(g(), tt), { color: orange, radius: 6 });
      cornerPill(plotV, tr('slopeG', { g: `${fmt.num(g(), 2)} m/s²` }), purple, 0);
      if (tt > 0) cornerPill(plotV, tr('areaS', { s: `${fmt.num(fallDistance(g(), tt), 2)} m` }), blue, 1);
      plotV.end();
      frame(plotV);
    }

    function tubeCharts(): void {
      const theme = ctx.theme;
      const Te = tubeEnd();
      const tt = tubeState === 'falling' ? Math.min(t, Te) : 0;
      const blue = theme.series[0]!;
      const green = theme.series[2]!;
      const objs: ['ball' | 'feather', string][] = [
        ['ball', blue],
        ['feather', green],
      ];
      plotS.setAxes({ x: { label: ctx.t('time') }, y: { label: ctx.t('fallS') } });
      plotS.setRangePadded([0, Te], [0, niceTop(TUBE)], pad());
      plotS.begin();
      plotS.grid({ minor: false });
      plotS.axes();
      plotS.hline(TUBE, { color: theme.muted, width: 1, dash: [4, 4] });
      for (const [obj, color] of objs) {
        const end = tubeTime(obj);
        const dash = obj === 'feather' && p.vac ? [7, 6] : undefined;
        curve(plotS, (x) => tubeS(obj, x), 0, end, { color, width: 2, dash: [6, 5], alpha: 0.4 });
        curve(plotS, (x) => tubeS(obj, x), 0, Math.min(tt, end), { color, width: 3, dash });
        plotS.point(Math.min(tt, end), tubeS(obj, Math.min(tt, end)), { color, radius: 5.5 });
      }
      // Beschriftung am Ende der Kurven
      const tb = tubeTime('ball');
      const tf = tubeTime('feather');
      if (p.vac) plotS.text(tb, TUBE, `${ctx.t('ball')} = ${ctx.t('feather')}`, { color: theme.text, size: 11, weight: '600', align: 'right', offset: [-6, 14] });
      else {
        plotS.text(tb, TUBE, ctx.t('ball'), { color: blue, size: 11, weight: '600', align: 'left', offset: [6, 14] });
        plotS.text(tf, TUBE, ctx.t('feather'), { color: green, size: 11, weight: '600', align: 'right', offset: [-6, 14] });
      }
      plotS.vline(tt, { color: theme.text, width: 1.5, alpha: 0.35 });
      plotS.end();
      frame(plotS);

      const vb = dragSpeed(PLANETS.erde, vEnd('ball'), tb);
      plotV.setAxes({ x: { label: ctx.t('time') }, y: { label: ctx.t('fallV') } });
      plotV.setRangePadded([0, Te], [0, niceTop(vb)], pad());
      plotV.begin();
      plotV.grid({ minor: false });
      plotV.axes();
      for (const [obj, color] of objs) {
        const end = tubeTime(obj);
        const dash = obj === 'feather' && p.vac ? [7, 6] : undefined;
        const f = (x: number) => dragSpeed(PLANETS.erde, vEnd(obj), x);
        curve(plotV, f, 0, end, { color, width: 2, dash: [6, 5], alpha: 0.4 });
        curve(plotV, f, 0, Math.min(tt, end), { color, width: 3, dash });
        plotV.point(Math.min(tt, end), f(Math.min(tt, end)), { color, radius: 5.5 });
      }
      if (!p.vac) {
        plotV.hline(TERMINAL.feather, { color: green, width: 1, dash: [3, 4], alpha: 0.8 });
        plotV.text(Te, TERMINAL.feather, `v_E ≈ ${fmt.num(TERMINAL.feather, 1)} m/s`, { color: green, size: 11, weight: '600', align: 'right', baseline: 'bottom', offset: [-4, -4] });
      }
      plotV.vline(tt, { color: theme.text, width: 1.5, alpha: 0.35 });
      plotV.end();
      frame(plotV);
    }

    function rulerCharts(fall: number): void {
      const theme = ctx.theme;
      const tMax = reactionTime(RULER, g()) * 1000;
      const blue = theme.series[0]!;
      const pink = theme.series[1]!;
      plotS.setAxes({ x: { label: ctx.t('timeMs') }, y: { label: ctx.t('rulerS') } });
      plotS.setRangePadded([0, niceTop(tMax)], [0, 55], pad());
      plotS.begin();
      plotS.grid({ minor: false });
      plotS.axes();
      plotS.hline(50, { color: theme.muted, width: 1, dash: [4, 4] });
      curve(plotS, (ms) => fallDistance(g(), ms / 1000) * 100, 0, tMax, { color: blue, width: 2.5 });
      attempts.forEach((rt, i) => {
        const last = i === attempts.length - 1 && lastAttempt?.kind === 'ok';
        plotS.point(rt * 1000, fallDistance(g(), rt) * 100, { color: pink, radius: last ? 6 : 4, hollow: !last });
      });
      if (phase === 'falling') plotS.point(reactionTime(fall, g()) * 1000, fall * 100, { color: blue, radius: 6 });
      if (lastAttempt?.kind === 'ok') {
        const x = lastAttempt.t * 1000;
        const y = lastAttempt.s * 100;
        plotS.segment([x, 0], [x, y], { color: pink, width: 1.5, dash: [4, 3] });
        plotS.segment([0, y], [x, y], { color: pink, width: 1.5, dash: [4, 3] });
      }
      plotS.end();
      frame(plotS);

      // Messreihe als Säulen
      const n = Math.max(6, attempts.length);
      const top = Math.max(350, ...attempts.map((x) => x * 1000 * 1.15));
      plotV.setAxes({ x: { label: ctx.t('attempt'), minStep: 1, format: (v) => (Number.isInteger(v) && v >= 1 && v <= n ? String(v) : '') }, y: { label: ctx.t('timeMs') } });
      plotV.setRangePadded([0.4, n + 0.6], [0, niceTop(top)], pad());
      plotV.begin();
      plotV.grid({ minor: false });
      plotV.axes();
      attempts.forEach((rt, i) => {
        const x = i + 1;
        const last = i === attempts.length - 1 && lastAttempt?.kind === 'ok';
        plotV.polygon(
          [
            [x - 0.32, 0],
            [x - 0.32, rt * 1000],
            [x + 0.32, rt * 1000],
            [x + 0.32, 0],
          ],
          { fill: pink, alpha: last ? 0.85 : 0.45, stroke: pink, width: 1.2 },
        );
        // Wert über der Säule, wenn Platz ist
        if (plotV.scale.x >= 28) plotV.text(x, rt * 1000, fmt.num(rt * 1000, 0), { color: theme.text, size: 10.5, weight: '600', align: 'center', baseline: 'bottom', offset: [0, -3] });
      });
      const st = stats(attempts);
      if (st) {
        plotV.hline(st.mean * 1000, { color: theme.text, width: 1.5, dash: [6, 4], alpha: 0.8 });
        cornerPill(plotV, tr('mean', { m: fmt.num(st.mean * 1000, 0) }), theme.text, 0, 'right');
      } else {
        const r = plotV.rect;
        plotV.textPx(r.x + r.w / 2 + pad().left / 2, r.y + r.h / 2, ctx.t('noAttempts'), { color: theme.muted, size: 13, weight: '600', align: 'center', baseline: 'middle' });
      }
      plotV.end();
      frame(plotV);
    }

    /* ---------- Ablauf ---------- */
    function resetTube(): void {
      tubeState = 'rest';
      t = 0;
      flip.finish();
    }

    function startFlip(): void {
      ctx.clock.pause();
      t = 0;
      tubeState = 'flipping';
      flip.play();
      ctx.requestRender();
    }

    function resetRuler(): void {
      phase = 'idle';
      grip.finish();
    }

    return {
      update(changed, source) {
        if (changed.has('mode') || source === 'replace' || source === 'init') {
          ctx.clock.pause();
          t = 0;
          landing.finish();
          resetTube();
          resetRuler();
        }
        if (changed.has('h') || changed.has('planet')) {
          if (source !== 'sim') t = Math.min(t, T());
          if (phase !== 'idle' && mode() === 'ruler') resetRuler();
        }
        if (changed.has('vac')) {
          if (source === 'input') {
            vacFrom = p.vac ? 0 : 1;
            pumpTween.play();
          } else pumpTween.finish();
          if (mode() === 'tube') resetTube();
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'drop') {
          t = 0;
          landing.finish();
          ctx.clock.play();
        } else if (id === 'flip') startFlip();
        else if (id === 'start') {
          (document.activeElement as HTMLElement | null)?.blur?.();
          startTrial();
        } else if (id === 'catch') catchRuler();
        else if (id === 'clear') {
          attempts = [];
          lastAttempt = null;
          resetRuler();
          updateRulerReadouts();
        }
      },

      tick(dt) {
        const m = mode();
        if (m === 'ruler') {
          ctx.clock.pause();
          if (phase !== 'armed' && phase !== 'falling') startTrial();
          return;
        }
        if (m === 'tube' && tubeState !== 'falling') {
          if (tubeState === 'rest') startFlip();
          else ctx.clock.pause();
          return;
        }
        const end = endTime();
        if (t >= end) {
          t = 0;
          if (m === 'tube') {
            startFlip();
            return;
          }
        }
        t = Math.min(end, t + dt * (p.slow ? 0.25 : 1));
        if (t >= end) {
          ctx.clock.pause();
          if (m === 'tower') landing.play();
        }
        updateNow();
      },

      resetTime() {
        t = 0;
        landing.finish();
        if (mode() === 'tube') resetTube();
        if (mode() === 'ruler') {
          resetRuler();
          updateRulerReadouts();
        }
        updateNow();
      },

      render() {
        const reg = regions();
        plotS.resize();
        plotV.resize();
        scenePlot.resize();
        surface.begin();
        const m = mode();
        // Szene unter dem (unsichtbaren) Koordinatensystem für den Kugel-Griff
        scenePlot.setRange([reg.scene.x, reg.scene.x + reg.scene.w], [-(reg.scene.y + reg.scene.h), -reg.scene.y]);
        const gx = scenePlot.begin();
        gx.fillStyle = ctx.theme.bg;
        gx.fillRect(reg.scene.x, reg.scene.y, reg.scene.w, reg.scene.h);
        let fall = 0;
        if (m === 'tower') drawTower(reg.scene);
        else if (m === 'tube') {
          if (tubeState === 'flipping' && !flip.running) {
            // Umdrehen fertig: jetzt fallen lassen, Seiten tauschen
            tubeState = 'falling';
            side = -side;
            t = 0;
            ctx.clock.play();
          }
          drawTube(reg.scene);
        } else {
          fall = rulerFall();
          drawRulerScene(reg.scene, fall);
        }
        scenePlot.end();
        if (m === 'tower') towerCharts();
        else if (m === 'tube') tubeCharts();
        else rulerCharts(fall);

        const busy =
          landing.running ||
          flip.running ||
          tubeState === 'flipping' ||
          pumpTween.running ||
          grip.running ||
          (m === 'tube' && !p.vac && ctx.clock.playing) ||
          (m === 'ruler' && (phase === 'armed' || phase === 'falling' || (phase === 'missed' && fall < 4)));
        if (busy) ctx.requestRender();
      },

      destroy: () => {
        document.removeEventListener('keydown', onKey);
        surface.destroy();
      },
    };
  },
});
