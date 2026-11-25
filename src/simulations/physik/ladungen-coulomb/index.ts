import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { coulomb, electroscopeAngle, rubCharge, TRIBO, type Material } from './model';

const L = (de: string, en: string) => ({ de, en });
const PER_RUB = 3;
const MAX_RUB = 6;

const MAT_NAMES: Record<Material, [string, string]> = {
  hair: ['Haare', 'hair'],
  glass: ['Glas', 'glass'],
  wool: ['Wolle', 'wool'],
  silk: ['Seide', 'silk'],
  paper: ['Papier', 'paper'],
  wood: ['Holz', 'wood'],
  amber: ['Bernstein', 'amber'],
  rubber: ['Gummi', 'rubber'],
  pvc: ['Kunststoff (PVC)', 'plastic (PVC)'],
};
const matOptions = TRIBO.map((m) => ({ value: m, label: L(MAT_NAMES[m][0], MAT_NAMES[m][1]) }));

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Elektrische Ladungen: Reibungselektrizität mit zwei Stoffen, Elektroskop
 * und das Coulomb’sche Gesetz mit Kraftdiagramm.
 */
export default defineSimulation({
  id: 'ladungen-coulomb',
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'reiben', label: L('Reibungselektrizität', 'Charging by friction') },
        { value: 'skop', label: L('Elektroskop', 'Electroscope') },
        { value: 'coulomb', label: L('Coulomb’sches Gesetz', 'Coulomb’s law') },
      ],
      default: 'reiben',
    },
    { key: 'ma', type: 'choice', label: L('Stab aus', 'Rod made of'), options: matOptions, default: 'pvc', visibleIf: (v) => v.mode !== 'coulomb' },
    { key: 'mb', type: 'choice', label: L('Gerieben mit', 'Rubbed with'), options: matOptions, default: 'wool', visibleIf: (v) => v.mode !== 'coulomb' },
    { key: 'q1', type: 'number', label: L('Ladung Q₁', 'Charge Q₁'), min: -5, max: 5, step: 0.5, default: 2, unit: 'µC', visibleIf: (v) => v.mode === 'coulomb' },
    { key: 'q2', type: 'number', label: L('Ladung Q₂', 'Charge Q₂'), min: -5, max: 5, step: 0.5, default: -1, unit: 'µC', visibleIf: (v) => v.mode === 'coulomb' },
    { key: 'r', type: 'number', label: L('Abstand r', 'Distance r'), min: 5, max: 50, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.mode === 'coulomb' },
  ],
  hint: (v) =>
    v.mode === 'reiben'
      ? L('Drücke mehrmals „Reiben“. Beim Reiben wandern Elektronen von einem Stoff zum anderen.', 'Press “Rub” several times. Rubbing moves electrons from one material to the other.')
      : v.mode === 'skop'
        ? L('Reibe den Stab und berühre das Elektroskop. Die Blättchen stoßen sich ab.', 'Rub the rod and touch the electroscope. The leaves repel each other.')
        : L('Gleiche Ladungen stoßen sich ab, ungleiche ziehen sich an. Wie hängt die Kraft vom Abstand ab?', 'Like charges repel, unlike charges attract. How does the force depend on distance?'),
  actions: [
    { id: 'rub', label: L('Reiben', 'Rub'), primary: true, visibleIf: (v) => v.mode !== 'coulomb' },
    { id: 'touch', label: L('Elektroskop berühren', 'Touch the electroscope'), visibleIf: (v) => v.mode === 'skop' },
    { id: 'ground', label: L('Entladen (erden)', 'Discharge (earth)'), visibleIf: (v) => v.mode !== 'coulomb' },
  ],
  readouts: [
    { key: 'charge', label: L('Ladungen', 'Charges'), spoiler: true },
    { key: 'F', label: L('Kraft', 'Force'), spoiler: true },
    { key: 'what', label: L('Was passiert?', 'What happens?') },
  ],
  presets: [
    { id: 'pvc', label: L('Kunststoff an Wolle', 'Plastic on wool'), values: { mode: 'reiben', ma: 'pvc', mb: 'wool' } },
    { id: 'glass', label: L('Glas an Seide', 'Glass on silk'), values: { mode: 'reiben', ma: 'glass', mb: 'silk' } },
    { id: 'skop', label: L('Elektroskop', 'Electroscope'), values: { mode: 'skop', ma: 'pvc', mb: 'wool' } },
    { id: 'attract', label: L('Anziehung', 'Attraction'), values: { mode: 'coulomb', q1: 2, q2: -1, r: 20 } },
    { id: 'repel', label: L('Abstoßung', 'Repulsion'), values: { mode: 'coulomb', q1: 2, q2: 2, r: 20 } },
  ],
  strings: {
    de: {
      canvas: 'Elektrische Ladungen: ein Stab und ein Tuch mit Plus- und Minuszeichen, ein Elektroskop mit Blättchen oder zwei Ladungen mit Kraftpfeilen und Diagramm',
      chargeVal: '{a}: {qa}, {b}: {qb} (je {n} Elektronen verschoben)',
      neutral: 'beide ungeladen',
      same: 'Gleiche Stoffe laden sich nicht auf.',
      rubWhat: '{who} gibt Elektronen ab und wird positiv, der andere Stoff nimmt sie auf und wird negativ. Zusammen bleibt die Ladung null.',
      attract: 'Stab und Tuch ziehen sich an (ungleiche Ladungen).',
      skopVal: 'Elektroskop: {q} Elementarladungen ({s})',
      skopWhat: 'Beide Blättchen tragen gleichnamige Ladung und stoßen sich ab. Ob plus oder minus, sieht man am Ausschlag nicht.',
      Fval: 'F = k · Q₁ · Q₂ / r² ≈ {F} N ({how})',
      repel: 'Abstoßung',
      attr: 'Anziehung',
      none: 'keine Kraft',
      r: 'r in cm',
      F: '|F| in N',
      plus: 'positiv',
      minus: 'negativ',
      neutralShort: 'ungeladen',
      rod: 'Stab',
      cloth: 'Tuch',
    },
    en: {
      canvas: 'Electric charges: a rod and a cloth with plus and minus signs, an electroscope with leaves, or two charges with force arrows and a graph',
      chargeVal: '{a}: {qa}, {b}: {qb} ({n} electrons moved each)',
      neutral: 'both uncharged',
      same: 'Identical materials do not become charged.',
      rubWhat: '{who} gives off electrons and becomes positive, the other material takes them and becomes negative. In total the charge stays zero.',
      attract: 'Rod and cloth attract each other (unlike charges).',
      skopVal: 'electroscope: {q} elementary charges ({s})',
      skopWhat: 'Both leaves carry like charge and repel. Whether plus or minus cannot be seen from the deflection.',
      Fval: 'F = k · Q₁ · Q₂ / r² ≈ {F} N ({how})',
      repel: 'repulsion',
      attr: 'attraction',
      none: 'no force',
      r: 'r in cm',
      F: '|F| in N',
      plus: 'positive',
      minus: 'negative',
      neutralShort: 'uncharged',
      rod: 'rod',
      cloth: 'cloth',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const en = () => ctx.lang === 'en';
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 50],
      y: [0, 10],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    let rubs = 0;
    let skop = 0;
    const name = (m: Material) => MAT_NAMES[m][en() ? 1 : 0];
    const charges = () => rubCharge(p.ma as Material, p.mb as Material, rubs * PER_RUB);
    const signText = (q: number) => (q > 0 ? `+${q}` : q < 0 ? `−${-q}` : '0');

    function setupPlot(): void {
      const F = Math.abs(coulomb(p.q1 * 1e-6, p.q2 * 1e-6, 0.05));
      plot.setRangePadded([0, 50], [0, Math.max(1, F) * 1.1], { left: 52, right: 14, top: 22, bottom: 24 });
      plot.setAxes({ x: { label: ctx.t('r') }, y: { label: ctx.t('F') } });
    }

    function updateReadouts(): void {
      for (const k of ['charge', 'F', 'what']) ctx.readout(k, null);
      if (p.mode === 'coulomb') {
        const F = coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100);
        ctx.readout('F', tr('Fval', { F: fmt.num(Math.abs(F), 3), how: ctx.t(F > 0 ? 'repel' : F < 0 ? 'attr' : 'none') }));
        return;
      }
      const c = charges();
      if (p.ma === p.mb) {
        ctx.readout('what', ctx.t('same'));
        return;
      }
      if (rubs === 0) ctx.readout('charge', ctx.t('neutral'));
      else ctx.readout('charge', tr('chargeVal', { a: name(p.ma as Material), qa: signText(c.a), b: name(p.mb as Material), qb: signText(c.b), n: rubs * PER_RUB }));
      if (p.mode === 'reiben') {
        if (rubs > 0) ctx.readout('what', `${tr('rubWhat', { who: name((c.a > 0 ? p.ma : p.mb) as Material) })} ${ctx.t('attract')}`);
      } else {
        ctx.readout('what', `${tr('skopVal', { q: signText(skop), s: ctx.t(skop > 0 ? 'plus' : skop < 0 ? 'minus' : 'neutralShort') })}. ${skop !== 0 ? ctx.t('skopWhat') : ''}`);
      }
    }

    function signs(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, q: number): void {
      const th = ctx.theme;
      const n = Math.min(18, Math.abs(q));
      // Raster passend zum Seitenverhältnis (schmaler Stab: eine Spalte)
      const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt((n * w) / h))));
      const rows = Math.max(1, Math.ceil(n / cols));
      for (let k = 0; k < n; k++) {
        const cx = x + ((k % cols) + 0.5) * (w / cols);
        const cy = y + (Math.floor(k / cols) + 0.5) * (h / rows);
        text(g, q > 0 ? '+' : '−', cx, cy, { font: `800 16px ${th.font}`, color: q > 0 ? th.series[1]! : th.series[0]! });
      }
    }

    function drawRub(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const c = charges();
      const attract = rubs > 0 && c.a !== 0;
      const cx = r.x + r.w / 2;
      const top = r.y + 30;
      // Stab hängt an einem Faden, Tuch daneben
      const tilt = attract ? Math.min(0.35, 0.06 * rubs) : 0;
      const sx = cx - 40;
      const len = Math.min(r.h * 0.55, 220);
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(sx, top);
      g.lineTo(sx + Math.sin(tilt) * len * 0.4, top + len * 0.4);
      g.stroke();
      g.save();
      g.translate(sx + Math.sin(tilt) * len * 0.4, top + len * 0.4);
      g.rotate(-tilt);
      roundRect(g, -14, 0, 28, len * 0.6, 8);
      g.fillStyle = withAlpha(th.series[4]!, 0.55);
      g.fill();
      signs(g, -14, 10, 28, len * 0.5, c.a);
      g.restore();
      text(g, `${ctx.t('rod')}: ${name(p.ma as Material)}`, sx, top - 14, { font: `700 12px ${th.font}`, color: th.text });
      // Tuch
      const tx = cx + 50;
      const ty = top + len * 0.45;
      roundRect(g, tx, ty, 90, 70, 12);
      g.fillStyle = withAlpha(th.series[3]!, 0.45);
      g.fill();
      signs(g, tx + 4, ty + 6, 82, 58, c.b);
      text(g, `${ctx.t('cloth')}: ${name(p.mb as Material)}`, tx + 45, ty + 86, { font: `700 12px ${th.font}`, color: th.text });
    }

    function drawSkop(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w * 0.62;
      const base = r.y + r.h - 30;
      const hgt = Math.min(r.h * 0.7, 260);
      // Gehäuse
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, base - hgt * 0.35, hgt * 0.32, 0, Math.PI * 2);
      g.stroke();
      // Stange und Kugel
      g.fillStyle = th.muted;
      g.fillRect(cx - 3, base - hgt, 6, hgt * 0.75);
      g.beginPath();
      g.arc(cx, base - hgt, 12, 0, Math.PI * 2);
      g.fill();
      // Blättchen
      const ang = electroscopeAngle(skop, MAX_RUB * PER_RUB);
      const pivotY = base - hgt * 0.4;
      const leaf = hgt * 0.22;
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 4;
      for (const sgn of [-1, 1]) {
        g.beginPath();
        g.moveTo(cx, pivotY);
        g.lineTo(cx + sgn * Math.sin(ang) * leaf, pivotY + Math.cos(ang) * leaf);
        g.stroke();
      }
      if (skop !== 0) {
        signs(g, cx - 30, base - hgt - 34, 60, 20, Math.sign(skop) * Math.min(6, Math.ceil(Math.abs(skop) / 3)));
      }
      // Stab links
      const c = charges();
      roundRect(g, r.x + 20, base - hgt - 10, r.w * 0.3, 26, 8);
      g.fillStyle = withAlpha(th.series[4]!, 0.55);
      g.fill();
      signs(g, r.x + 24, base - hgt - 8, r.w * 0.3 - 8, 22, c.a);
      text(g, name(p.ma as Material), r.x + 20 + r.w * 0.15, base - hgt + 30, { font: `700 12px ${th.font}`, color: th.text });
    }

    function drawCoulomb(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cy = r.y + r.h / 2;
      const scale = (r.w - 80) / 50;
      const x1 = r.x + 40;
      const x2 = x1 + p.r * scale;
      const F = coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100);
      const ball = (x: number, q: number) => {
        g.fillStyle = q > 0 ? th.series[1]! : q < 0 ? th.series[0]! : th.muted;
        g.beginPath();
        g.arc(x, cy, 12 + 2 * Math.abs(q), 0, Math.PI * 2);
        g.fill();
        text(g, q > 0 ? '+' : q < 0 ? '−' : '0', x, cy, { font: `800 16px ${th.font}`, color: '#ffffff' });
        text(g, `${fmt.num(q, 1)} µC`, x, cy + 34, { font: `700 12px ${th.font}`, color: th.text });
      };
      // Abstand
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(x1, cy - 50);
      g.lineTo(x2, cy - 50);
      g.stroke();
      g.setLineDash([]);
      text(g, `r = ${fmt.num(p.r, 0)} cm`, (x1 + x2) / 2, cy - 60, { font: `600 12px ${th.font}`, color: th.muted });
      // Kraftpfeile (gleich lang, entgegengesetzt), Länge logarithmisch
      const len = F === 0 ? 0 : Math.min(r.w * 0.25, 18 + 22 * Math.log10(1 + Math.abs(F) * 10));
      const dir = Math.sign(F); // +: Abstoßung
      const arrow = (x: number, d: number) => {
        if (len === 0) return;
        const xe = x + d * len;
        g.strokeStyle = th.series[2]!;
        g.fillStyle = th.series[2]!;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(x, cy);
        g.lineTo(xe - d * 8, cy);
        g.stroke();
        g.beginPath();
        g.moveTo(xe, cy);
        g.lineTo(xe - d * 12, cy - 7);
        g.lineTo(xe - d * 12, cy + 7);
        g.closePath();
        g.fill();
      };
      arrow(x1, -dir);
      arrow(x2, dir);
      ball(x1, p.q1);
      ball(x2, p.q2);
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((rc) => Math.abs(coulomb(p.q1 * 1e-6, p.q2 * 1e-6, rc / 100)), { color: th.series[2]!, width: 3, from: 4, to: 50 });
      plot.point(p.r, Math.abs(coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100)), { color: th.series[1]!, radius: 6 });
      plot.end();
    }

    return {
      update(changed) {
        if (changed.has('ma') || changed.has('mb') || changed.has('mode')) {
          rubs = 0;
          skop = 0;
        }
        setupPlot();
        updateReadouts();
      },
      action(id) {
        if (id === 'rub') rubs = Math.min(MAX_RUB, rubs + 1);
        else if (id === 'touch') {
          // Ein Teil der Ladung des Stabs geht aufs Elektroskop
          const c = charges();
          skop += Math.round(c.a / 2);
          rubs = Math.max(0, Math.round(rubs / 2));
        } else {
          rubs = 0;
          skop = 0;
        }
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        const full: Rect = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'reiben') drawRub(full);
        else if (p.mode === 'skop') drawSkop(full);
        else {
          drawCoulomb(s.scene);
          drawChart();
        }
      },
      destroy: () => surface.destroy(),
    };
  },
});
