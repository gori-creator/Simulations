import { defineSimulation, Plot, Surface, withAlpha } from '../../../sim-core';
import { fallAccel, fallExact, integrate, springAccel, springExact, terminalVelocity, type Method, type Step } from './model';

const L = (de: string, en: string) => ({ de, en });
const T_FALL = 20;
const T_SPRING = 12;
const M_SPRING = 1;
const S0 = 1;

/**
 * Methode der kleinen Schritte: Fall mit Luftwiderstand und Federpendel
 * schrittweise berechnen, Schritt für Schritt aufdecken und mit der genauen
 * Lösung vergleichen.
 */
export default defineSimulation({
  id: 'kleine-schritte',
  layout: { aspect: 1.7, aspectNarrow: 0.9 },
  params: [
    {
      key: 'modell',
      type: 'choice',
      label: L('Bewegung', 'Motion'),
      options: [
        { value: 'fall', label: L('Fall mit Luftwiderstand', 'Fall with air resistance') },
        { value: 'feder', label: L('Federpendel', 'Spring pendulum') },
      ],
      default: 'fall',
    },
    {
      key: 'dt',
      type: 'choice',
      label: L('Zeitschritt Δt', 'Time step Δt'),
      options: [
        { value: '2', label: L('2 s', '2 s') },
        { value: '1', label: L('1 s', '1 s') },
        { value: '0.5', label: L('0,5 s', '0.5 s') },
        { value: '0.2', label: L('0,2 s', '0.2 s') },
        { value: '0.05', label: L('0,05 s', '0.05 s') },
      ],
      default: '1',
    },
    {
      key: 'methode',
      type: 'choice',
      label: L('Rechenweg', 'Scheme'),
      options: [
        { value: 'euler', label: L('erst Ort, dann Geschwindigkeit (Euler)', 'position first, then velocity (Euler)') },
        { value: 'cromer', label: L('erst Geschwindigkeit, dann Ort', 'velocity first, then position') },
      ],
      default: 'euler',
    },
    { key: 'm', type: 'number', label: L('Masse', 'Mass'), min: 40, max: 120, step: 5, default: 80, unit: 'kg', visibleIf: (v) => v.modell === 'fall' },
    { key: 'k', type: 'number', label: L('Luftwiderstand k (F = k · v²)', 'Air resistance k (F = k · v²)'), min: 0.05, max: 1, step: 0.05, default: 0.25, unit: 'kg/m', visibleIf: (v) => v.modell === 'fall' },
    { key: 'D', type: 'number', label: L('Federhärte D', 'Spring constant D'), min: 1, max: 16, step: 1, default: 4, unit: 'N/m', visibleIf: (v) => v.modell === 'feder' },
  ],
  hint: L(
    'Drücke „Nächster Schritt“: Aus der Beschleunigung wird die neue Geschwindigkeit, daraus der neue Ort – genau wie in einer Tabelle.',
    'Press “Next step”: the acceleration gives the new velocity, which gives the new position – just like in a spreadsheet.',
  ),
  actions: [
    { id: 'step', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'all', label: L('Alle Schritte', 'All steps') },
    { id: 'reset', label: L('Von vorn', 'Start over') },
  ],
  readouts: [
    { key: 'rule', label: L('Rechenregel', 'Rule') },
    { key: 'table', label: L('Tabelle', 'Table') },
    { key: 'cmp', label: L('Vergleich mit der genauen Lösung', 'Comparison with the exact solution'), spoiler: true },
  ],
  presets: [
    { id: 'coarse', label: L('Fall, Δt = 2 s', 'Fall, Δt = 2 s'), values: { modell: 'fall', dt: '2' } },
    { id: 'fine', label: L('Fall, Δt = 0,2 s', 'Fall, Δt = 0.2 s'), values: { modell: 'fall', dt: '0.2' } },
    { id: 'euler', label: L('Feder mit Euler', 'Spring with Euler'), values: { modell: 'feder', dt: '0.2', methode: 'euler' } },
    { id: 'cromer', label: L('Feder, stabil', 'Spring, stable'), values: { modell: 'feder', dt: '0.2', methode: 'cromer' } },
  ],
  strings: {
    de: {
      canvas: 'Diagramm: genaue Lösung als gestrichelte Kurve und die schrittweise berechneten Werte als Punkte mit Verbindungslinie',
      t: 't in s',
      v: 'v in m/s',
      s: 's in m',
      ruleFall: 'a = g − (k/m) · v²;  v_neu = v + a · Δt;  s_neu = s + v · Δt',
      ruleFeder: 'a = −(D/m) · s;  v_neu = v + a · Δt;  s_neu = s + v · Δt',
      ruleCromerFall: 'a = g − (k/m) · v²;  v_neu = v + a · Δt;  s_neu = s + v_neu · Δt',
      ruleCromerFeder: 'a = −(D/m) · s;  v_neu = v + a · Δt;  s_neu = s + v_neu · Δt',
      cmpFall: 'nach {t} s: gerechnet v ≈ {vn} m/s, genau {ve} m/s (Endgeschwindigkeit {vE} m/s)',
      cmpFeder: 'nach {t} s: gerechnet s ≈ {sn} m, genau {se} m',
      exact: 'genau',
      steps: 'Schritte',
      head: '<tr><th>t in s</th><th>a in m/s²</th><th>v in m/s</th><th>s in m</th></tr>',
      dots: '<tr><td colspan="4">…</td></tr>',
    },
    en: {
      canvas: 'Graph: the exact solution as a dashed curve and the step-by-step values as points joined by a line',
      t: 't in s',
      v: 'v in m/s',
      s: 's in m',
      ruleFall: 'a = g − (k/m) · v²;  v_new = v + a · Δt;  s_new = s + v · Δt',
      ruleFeder: 'a = −(D/m) · s;  v_new = v + a · Δt;  s_new = s + v · Δt',
      ruleCromerFall: 'a = g − (k/m) · v²;  v_new = v + a · Δt;  s_new = s + v_new · Δt',
      ruleCromerFeder: 'a = −(D/m) · s;  v_new = v + a · Δt;  s_new = s + v_new · Δt',
      cmpFall: 'after {t} s: computed v ≈ {vn} m/s, exact {ve} m/s (terminal velocity {vE} m/s)',
      cmpFeder: 'after {t} s: computed s ≈ {sn} m, exact {se} m',
      exact: 'exact',
      steps: 'steps',
      head: '<tr><th>t in s</th><th>a in m/s²</th><th>v in m/s</th><th>s in m</th></tr>',
      dots: '<tr><td colspan="4">…</td></tr>',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, { x: [0, 20], y: [0, 60], equalAspect: false, pan: false, zoom: false, controls: false });

    let steps: Step[] = [];
    /** Anzahl der bereits aufgedeckten Schritte */
    let shown = 1;

    const dt = () => Number(p.dt) || 1;
    const tEnd = () => (p.modell === 'fall' ? T_FALL : T_SPRING);
    const fall = () => p.modell === 'fall';

    function compute(): void {
      steps = fall() ? integrate(fallAccel(p.m, p.k), 0, 0, dt(), tEnd(), p.methode as Method) : integrate(springAccel(M_SPRING, p.D), S0, 0, dt(), tEnd(), p.methode as Method);
    }

    function setupPlot(): void {
      if (fall()) {
        const vE = terminalVelocity(p.m, p.k);
        plot.setRangePadded([0, T_FALL], [0, vE * 1.25], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('v') } });
      } else {
        plot.setRangePadded([0, T_SPRING], [-2.6, 2.6], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('s') } });
      }
    }

    function row(s: Step): string {
      return `<tr><td>${fmt.num(s.t, 2)}</td><td>${fmt.num(s.a, 2)}</td><td>${fmt.num(s.v, 2)}</td><td>${fmt.num(s.s, 2)}</td></tr>`;
    }

    function updateReadouts(): void {
      const key = fall() ? (p.methode === 'euler' ? 'ruleFall' : 'ruleCromerFall') : p.methode === 'euler' ? 'ruleFeder' : 'ruleCromerFeder';
      ctx.readout('rule', ctx.t(key));
      const vis = steps.slice(0, shown);
      const rows = vis.length <= 8 ? vis.map(row).join('') : vis.slice(0, 4).map(row).join('') + ctx.t('dots') + vis.slice(-3).map(row).join('');
      ctx.readout('table', { html: `<table class="mini-table">${ctx.t('head')}${rows}</table>` });
      const last = vis[vis.length - 1]!;
      if (fall()) {
        const e = fallExact(p.m, p.k, last.t);
        ctx.readout('cmp', tr('cmpFall', { t: fmt.num(last.t, 2), vn: fmt.num(last.v, 2), ve: fmt.num(e.v, 2), vE: fmt.num(terminalVelocity(p.m, p.k), 1) }));
      } else {
        const e = springExact(M_SPRING, p.D, S0, last.t);
        ctx.readout('cmp', tr('cmpFeder', { t: fmt.num(last.t, 2), sn: fmt.num(last.s, 3), se: fmt.num(e.s, 3) }));
      }
      ctx.setAction('step', { enabled: shown < steps.length });
    }

    return {
      update(_changed, source) {
        compute();
        if (source !== 'init' || shown > steps.length) shown = 1;
        setupPlot();
        updateReadouts();
      },
      action(id) {
        if (id === 'step') shown = Math.min(steps.length, shown + 1);
        else if (id === 'all') shown = steps.length;
        else shown = 1;
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        const th = ctx.theme;
        plot.resize();
        surface.begin();
        plot.begin();
        plot.grid({ minor: false });
        plot.axes();
        if (fall()) {
          const vE = terminalVelocity(p.m, p.k);
          plot.hline(vE, { color: withAlpha(th.muted, 0.7), width: 1.5, dash: [3, 4] });
          plot.fn((t) => fallExact(p.m, p.k, t).v, { color: th.muted, width: 2, dash: [7, 5], from: 0, to: T_FALL });
        } else plot.fn((t) => springExact(M_SPRING, p.D, S0, t).s, { color: th.muted, width: 2, dash: [7, 5], from: 0, to: T_SPRING });
        const vis = steps.slice(0, shown);
        const pts = vis.map((s) => [s.t, fall() ? s.v : s.s] as [number, number]);
        plot.polyline(pts, { color: th.series[0]!, width: 2.5 });
        const big = steps.length <= 60;
        for (const pt of pts) plot.point(pt[0], pt[1], { color: th.series[0]!, radius: big ? 4.5 : 2 });
        // Nächster Schritt als Pfeil (Steigung = Beschleunigung bzw. Geschwindigkeit)
        const last = vis[vis.length - 1]!;
        if (shown < steps.length) {
          const slope = fall() ? last.a : p.methode === 'euler' ? last.v : last.v + last.a * dt();
          plot.arrow([last.t, fall() ? last.v : last.s], [last.t + dt(), (fall() ? last.v : last.s) + slope * dt()], { color: th.series[1]!, width: 2 });
        }
        plot.end();
      },
      destroy: () => surface.destroy(),
    };
  },
});
