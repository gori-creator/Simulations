import { defineSimulation, ease, roundRect, seededRandom, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { checkRead, commonDenominator, compareFractions, decimalExpansion, fractionTask, mixed, reduce, selectedCount, type FractionTask } from './model';

const L = (de: string, en: string) => ({ de, en });
const MAX_WHOLES = 3;

/**
 * Bruchteile darstellen: Pizza, Blechkuchen oder Strecke werden in n gleich
 * große Teile geschnitten, z davon ausgewählt. Erweitern = feiner schneiden.
 * Dazu: zwei Brüche als Streifen vergleichen (auch gleichnamig gemacht) und
 * Übungsaufgaben (Bruch ablesen, Bruch durch Antippen einfärben).
 */
export default defineSimulation({
  id: 'bruchteile',
  layout: { aspect: 1.75, aspectNarrow: 0.8 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'show', label: L('Bruch darstellen', 'Showing a fraction') },
        { value: 'compare', label: L('Brüche vergleichen', 'Comparing fractions') },
        { value: 'quiz', label: L('Üben', 'Practice') },
      ],
      default: 'show',
    },
    {
      key: 'shape',
      type: 'choice',
      label: L('Darstellung', 'Representation'),
      options: [
        { value: 'pizza', label: L('Pizza', 'Pizza') },
        { value: 'kuchen', label: L('Blechkuchen', 'Sheet cake') },
        { value: 'strecke', label: L('Strecke', 'Line segment') },
      ],
      default: 'pizza',
      visibleIf: (v) => v.mode === 'show',
    },
    { key: 'z', type: 'number', label: L('Zähler z (genommene Teile)', 'Numerator z (pieces taken)'), min: 0, max: 36, step: 1, default: 3, visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'n', type: 'number', label: L('Nenner n (Teile pro Ganzes)', 'Denominator n (pieces per whole)'), min: 1, max: 12, step: 1, default: 4, visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'z2', type: 'number', label: L('Zweiter Bruch: Zähler', 'Second fraction: numerator'), min: 0, max: 12, step: 1, default: 2, visibleIf: (v) => v.mode === 'compare' },
    { key: 'n2', type: 'number', label: L('Zweiter Bruch: Nenner', 'Second fraction: denominator'), min: 1, max: 12, step: 1, default: 3, visibleIf: (v) => v.mode === 'compare' },
    { key: 'common', type: 'boolean', label: L('Gleichnamig machen', 'Use a common denominator'), default: false, visibleIf: (v) => v.mode === 'compare' },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'ans', type: 'text', label: L('Deine Antwort (z. B. 3/4)', 'Your answer (e.g. 3/4)'), default: '', maxLength: 12, placeholder: L('3/4', '3/4'), visibleIf: (v) => v.mode === 'quiz' && Number(v.q) % 2 === 1 },
    { key: 'sel', type: 'number', label: L('Gefärbte Stücke', 'Coloured pieces'), min: 0, max: 4095, step: 1, default: 0, visibleIf: () => false },
    {
      key: 'k',
      type: 'number',
      label: L('Erweitern mit k (feiner schneiden)', 'Expand by k (cut finer)'),
      help: L('Jedes Stück wird noch einmal in k gleiche Teile geschnitten.', 'Each piece is cut again into k equal parts.'),
      min: 1,
      max: 5,
      step: 1,
      default: 1,
      visibleIf: (v) => v.mode === 'show',
    },
    { key: 'decimal', type: 'boolean', group: 'view', label: L('Dezimalzahl und Prozent', 'Decimal and percentage'), default: true },
  ],
  hint: (v) => {
    if (v.mode === 'compare') return L('Tipp: „Gleichnamig machen“ schneidet beide Streifen in gleich große Stücke.', 'Tip: “Use a common denominator” cuts both strips into pieces of the same size.');
    if (v.mode === 'quiz')
      return v.q % 2 === 1
        ? L('Tipp: Trag den Bruch als „Zähler/Nenner“ ein und tippe auf „Prüfen“.', 'Tip: Enter the fraction as “numerator/denominator” and tap “Check”.')
        : L('Tipp: Tippe Stücke an, um sie zu färben, dann auf „Prüfen“.', 'Tip: Tap pieces to colour them, then tap “Check”.');
    return null;
  },
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  images: { pizza: 'pizza.webp', cake: 'blechkuchen.webp' },
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'verdict', label: L('Rückmeldung', 'Feedback') },
    { key: 'cmp', label: L('Vergleich', 'Comparison'), spoiler: true },
    { key: 'fraction', label: L('Bruch', 'Fraction') },
    { key: 'reduced', label: L('Vollständig gekürzt', 'Fully reduced'), spoiler: true },
    { key: 'decimal', label: L('Dezimalzahl', 'Decimal'), spoiler: true },
    { key: 'percent', label: L('Prozent', 'Percentage'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Drei Viertel', 'Three quarters'), values: {} },
    { id: 'expand', label: L('Erweitern: 3/4 = 6/8', 'Expand: 3/4 = 6/8'), values: { k: 2 } },
    { id: 'third', label: L('Ein Drittel (periodisch)', 'One third (recurring)'), values: { z: 1, n: 3, shape: 'kuchen' } },
    { id: 'improper', label: L('Mehr als ein Ganzes: 7/4', 'More than a whole: 7/4'), values: { z: 7, n: 4 } },
    { id: 'line', label: L('Auf der Strecke: 5/6', 'On the line: 5/6'), values: { z: 5, n: 6, shape: 'strecke' } },
    { id: 'compare', label: L('3/4 oder 2/3?', '3/4 or 2/3?'), values: { mode: 'compare', z: 3, n: 4, z2: 2, n2: 3 } },
    { id: 'quiz', label: L('Üben', 'Practice'), values: { mode: 'quiz', q: 1, ans: '', sel: 0 } },
  ],
  strings: {
    de: {
      canvas: 'Ein Ganzes (Pizza, Blechkuchen oder Strecke), in n gleich große Teile geschnitten; die z genommenen Teile sind hervorgehoben',
      tap: 'Tippe auf ein Stück, um bis dorthin auszuwählen.',
      of: '{z} von {n} gleich großen Teilen',
      wholes: '{w} Ganze und {r}/{n}',
      wholeOne: '1 Ganzes und {r}/{n}',
      wholesOnly: '{w} Ganze',
      wholeOnlyOne: '1 Ganzes',
      period: 'Periode',
      more: 'weitere Ganze sind nicht gezeichnet',
      bigger: 'ist größer als',
      smaller: 'ist kleiner als',
      equal: 'ist genauso groß wie',
      commonNote: 'Hauptnenner {n}: Beide Streifen in {n} gleich große Stücke geschnitten',
      sameHint: 'Gleicher Nenner: Vergleiche die Zähler. Gleicher Zähler: Der kleinere Nenner gibt größere Stücke.',
      qRead: 'Aufgabe {q}: Welcher Bruchteil ist gefärbt?',
      qColor: 'Aufgabe {q}: Färbe {z}/{n} ein.',
      colored: 'gefärbt: {k} von {p} Stücken',
      okRead: 'Richtig! {z}/{p} = {rz}/{rn}',
      okColor: 'Richtig! {k} von {p} Stücken = {z}/{n}',
      okReadSimple: 'Richtig! {z} von {p} Stücken = {z}/{p}',
      noColor1: 'Noch nicht: {k} von {p} gefärbt. Tipp: Jedes Stück ist 1/{n}.',
      noRead: 'Noch nicht. Zähle alle Stücke (Nenner) und die gefärbten (Zähler).',
      noColor: 'Noch nicht: {k} von {p} gefärbt. Tipp: {p} Stücke sind {n} Gruppen zu je {m} Stücke.',
      emptyRead: 'Trag den Bruch unter „Deine Antwort“ ein, z. B. 3/4.',
      emptyColor: 'Tippe Stücke an, um sie zu färben.',
      waitFrac: 'Bitte als Bruch eintragen, z. B. 3/4.',
    },
    en: {
      canvas: 'A whole (pizza, sheet cake or line segment) cut into n equal parts; the z parts taken are highlighted',
      tap: 'Tap a piece to select up to it.',
      of: '{z} of {n} equal parts',
      wholes: '{w} wholes and {r}/{n}',
      wholeOne: '1 whole and {r}/{n}',
      wholesOnly: '{w} wholes',
      wholeOnlyOne: '1 whole',
      period: 'recurring',
      more: 'further wholes are not drawn',
      bigger: 'is greater than',
      smaller: 'is less than',
      equal: 'is equal to',
      commonNote: 'Common denominator {n}: both strips cut into {n} equal pieces',
      sameHint: 'Same denominator: compare the numerators. Same numerator: the smaller denominator gives bigger pieces.',
      qRead: 'Task {q}: What fraction is coloured?',
      qColor: 'Task {q}: Colour in {z}/{n}.',
      colored: 'coloured: {k} of {p} pieces',
      okRead: 'Correct! {z}/{p} = {rz}/{rn}',
      okColor: 'Correct! {k} of {p} pieces = {z}/{n}',
      okReadSimple: 'Correct! {z} of {p} pieces = {z}/{p}',
      noColor1: 'Not yet: {k} of {p} coloured. Tip: each piece is 1/{n}.',
      noRead: 'Not yet. Count all pieces (denominator) and the coloured ones (numerator).',
      noColor: 'Not yet: {k} of {p} coloured. Tip: {p} pieces are {n} groups of {m} pieces.',
      emptyRead: 'Enter the fraction under “Your answer”, e.g. 3/4.',
      emptyColor: 'Tap pieces to colour them.',
      waitFrac: 'Please enter a fraction, e.g. 3/4.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

    const cut = new Tween(650, ease.outCubic);
    /** Wie weit jedes Stück herausgezogen ist (0…1), weich nachgeführt. */
    let lift: number[] = [];
    let lastFrame = performance.now();
    let hover = -1;

    const wholes = () => Math.max(1, Math.min(MAX_WHOLES, Math.ceil(p.z / p.n)));
    // Nebeneinander auch bei schmaler, aber flacher Bühne (Tablet); untereinander nur hochkant
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;

    function regions(): { visual: Rect; panel: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) return { visual: { x: 0, y: 0, w: w * 0.66, h }, panel: { x: w * 0.66, y: 0, w: w * 0.34, h } };
      return { visual: { x: 0, y: 0, w, h: h * 0.62 }, panel: { x: 0, y: h * 0.62, w, h: h * 0.38 } };
    }

    /** Rechteck für das Ganze Nr. i. */
    function wholeRect(i: number): Rect {
      const { visual } = regions();
      const count = wholes();
      const pad = 18;
      const inner = { x: visual.x + pad, y: visual.y + pad + 10, w: visual.w - pad * 2, h: visual.h - pad * 2 - 30 };
      if (p.shape === 'strecke') return inner;
      const gap = 18;
      const size = Math.min((inner.w - gap * (count - 1)) / count, inner.h);
      const total = size * count + gap * (count - 1);
      const height = p.shape === 'kuchen' ? size * 0.72 : size;
      return { x: inner.x + (inner.w - total) / 2 + i * (size + gap), y: inner.y + (inner.h - height) / 2, w: size, h: height };
    }

    /** Welches Stück (Index in 1/n) liegt unter dem Zeiger? */
    function pieceAt(px: number, py: number): number | null {
      const count = wholes();
      for (let i = 0; i < count; i++) {
        const r = wholeRect(i);
        if (p.shape === 'pizza') {
          const cx = r.x + r.w / 2;
          const cy = r.y + r.h / 2;
          const d = Math.hypot(px - cx, py - cy);
          if (d > r.w / 2 + 8) continue;
          let a = Math.atan2(py - cy, px - cx) + Math.PI / 2;
          if (a < 0) a += Math.PI * 2;
          return i * p.n + Math.min(p.n - 1, Math.floor((a / (Math.PI * 2)) * p.n));
        }
        if (p.shape === 'kuchen') {
          if (px < r.x || px > r.x + r.w || py < r.y - 10 || py > r.y + r.h) continue;
          return i * p.n + Math.min(p.n - 1, Math.floor(((px - r.x) / r.w) * p.n));
        }
        // Strecke
        const line = lineGeometry();
        if (py < line.y - 30 || py > line.y + 30) return null;
        const u = (px - line.x0) / line.unit;
        if (u < 0 || u > line.count) return null;
        return Math.min(line.count * p.n - 1, Math.floor(u * p.n));
      }
      return null;
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'show') return null;
        const i = pieceAt(px, py);
        return i === null ? null : String(i);
      },
      onHover: (id) => (hover = id === null ? -1 : Number(id)),
      onTap: (id) => {
        if (ctx.locked) return;
        const i = Number(id);
        ctx.set({ z: i + 1 === p.z ? i : i + 1 });
      },
    });

    /* ---------- Vergleichen und Üben ---------- */
    let task: FractionTask = fractionTask(1, seededRandom(1));
    let taskState: { ok: boolean; empty: boolean } | null = null;
    const pop = new Tween(500, ease.outBack);

    /** Streifen Nr. row (0, 1) im Vergleich. */
    function stripRect(row: number): Rect {
      const { visual } = regions();
      const w = visual.w - 60;
      const h = Math.min(70, visual.h * 0.2);
      const gap = Math.min(70, visual.h * 0.18);
      const top = visual.y + (visual.h - 2 * h - gap) / 2 - 6;
      return { x: visual.x + 30, y: top + row * (h + gap), w, h };
    }

    /** Geometrie der Übungsfigur: Streifen oder Kreis. */
    function quizGeom(): { strip: Rect; cx: number; cy: number; r: number } {
      const { visual } = regions();
      const r = Math.min(visual.w, visual.h) * 0.36;
      const sw = visual.w - 60;
      const sh = Math.min(90, visual.h * 0.28);
      return { strip: { x: visual.x + 30, y: visual.y + (visual.h - sh) / 2 - 8, w: sw, h: sh }, cx: visual.x + visual.w / 2, cy: visual.y + visual.h / 2 - 8, r };
    }

    function quizPieceAt(px: number, py: number): number | null {
      const gm = quizGeom();
      const n = task.pieces;
      if (task.shape === 'strip') {
        const r = gm.strip;
        if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
        return Math.min(n - 1, Math.floor(((px - r.x) / r.w) * n));
      }
      const d = Math.hypot(px - gm.cx, py - gm.cy);
      if (d > gm.r) return null;
      let a = Math.atan2(py - gm.cy, px - gm.cx) + Math.PI / 2;
      if (a < 0) a += Math.PI * 2;
      return Math.min(n - 1, Math.floor((a / (Math.PI * 2)) * n));
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'quiz' || task.kind !== 'color' || taskState?.ok) return null;
        const i = quizPieceAt(px, py);
        return i === null ? null : `q${i}`;
      },
      onTap: (id) => {
        if (ctx.locked) return;
        const i = Number(id.slice(1));
        taskState = null;
        ctx.set({ sel: p.sel ^ (1 << i) });
      },
    });

    function newTask(): void {
      task = fractionTask(p.q, seededRandom(p.q * 7919 + 53));
      taskState = null;
    }

    /** Ist Stück i gefärbt? Ablesen: die ersten `count` Stücke; einfärben: Auswahl (nach Lösung die richtige Anzahl). */
    function quizColored(i: number): boolean {
      if (task.kind === 'read') return i < task.count;
      return (p.sel & (1 << i)) !== 0;
    }

    function feedback(): { text: string; color: string } | null {
      if (!taskState) return null;
      const t = ctx.theme;
      if (task.kind === 'read') {
        if (taskState.empty) return { text: ctx.t('waitFrac'), color: t.muted };
        if (taskState.ok) return { text: task.target.n === task.pieces ? tr('okReadSimple', { z: task.count, p: task.pieces }) : tr('okRead', { z: task.count, p: task.pieces, rz: task.target.z, rn: task.target.n }), color: t.series[2]! };
        return { text: ctx.t('noRead'), color: t.series[1]! };
      }
      const k = selectedCount(p.sel, task.pieces);
      if (taskState.ok) return { text: tr('okColor', { k, p: task.pieces, z: task.target.z, n: task.target.n }), color: t.series[2]! };
      const m = task.pieces / task.target.n;
      return { text: tr(m === 1 ? 'noColor1' : 'noColor', { k, p: task.pieces, n: task.target.n, m }), color: t.series[1]! };
    }

    function taskText(): string {
      return task.kind === 'read' ? tr('qRead', { q: p.q }) : tr('qColor', { q: p.q, z: task.target.z, n: task.target.n });
    }

    function drawStrip(r: Rect, pieces: number, colored: (i: number) => boolean, color: string, fine = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pw = r.w / pieces;
      for (let i = 0; i < pieces; i++) {
        roundRect(g, r.x + i * pw + 1.5, r.y, pw - 3, r.h, 6);
        g.fillStyle = colored(i) ? withAlpha(color, 0.75) : withAlpha(theme.muted, 0.12);
        g.fill();
        g.strokeStyle = colored(i) ? color : withAlpha(theme.muted, 0.6);
        g.lineWidth = 2;
        g.stroke();
      }
      // feinere Schnitte (gleichnamig gemacht) gestrichelt
      if (fine > pieces) {
        g.save();
        g.setLineDash([4, 4]);
        g.strokeStyle = withAlpha(theme.text, 0.55);
        g.lineWidth = 1.2;
        for (let j = 1; j < fine; j++) {
          if ((j * pieces) % fine === 0) continue;
          const x = r.x + (j * r.w) / fine;
          g.beginPath();
          g.moveTo(x, r.y + 3);
          g.lineTo(x, r.y + r.h - 3);
          g.stroke();
        }
        g.restore();
      }
    }

    function drawCompare(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const c = commonDenominator(p.z, p.n, p.z2, p.n2);
      const rows: [number, number, string][] = [
        [p.z, p.n, theme.series[3]!],
        [p.z2, p.n2, theme.series[0]!],
      ];
      rows.forEach(([z, n, color], row) => {
        const r = stripRect(row);
        drawStrip(r, n, (i) => i < z, color, p.common ? c.n : 0);
        const label = p.common ? `${z}/${n} = ${(z * c.n) / n}/${c.n}` : `${z}/${n}`;
        text(g, label, r.x, r.y - 14, { font: `700 15px ${theme.font}`, color, align: 'left' });
        // Ende des gefärbten Teils als Marke, damit man die Längen vergleichen kann
        const xe = r.x + (r.w * Math.min(z, n)) / n;
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(xe, stripRect(0).y - 4);
        g.lineTo(xe, stripRect(1).y + stripRect(1).h + 4);
        g.stroke();
        g.setLineDash([]);
      });
      if (p.common) {
        const { visual } = regions();
        text(g, tr('commonNote', { n: c.n }), visual.x + visual.w / 2, visual.y + visual.h - 16, { font: `500 12px ${theme.font}`, color: theme.muted });
      }
    }

    function drawComparePanel(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const cmp = compareFractions(p.z, p.n, p.z2, p.n2);
      const c = commonDenominator(p.z, p.n, p.z2, p.n2);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h * 0.38;
      const size = Math.min(46, r.w * 0.16, r.h * 0.22);
      const frac = (x: number, top: string, bottom: string, color: string) => {
        text(g, top, x, cy - size * 0.62, { font: `800 ${size}px ${theme.font}`, color });
        text(g, bottom, x, cy + size * 0.66, { font: `800 ${size}px ${theme.font}`, color });
        g.fillStyle = color;
        g.fillRect(x - size * 0.6, cy - size * 0.06, size * 1.2, Math.max(3, size * 0.07));
      };
      const z1 = p.common ? c.z1 : p.z;
      const n1 = p.common ? c.n : p.n;
      const z2 = p.common ? c.z2 : p.z2;
      const n2 = p.common ? c.n : p.n2;
      frac(cx - size * 1.6, String(z1), String(n1), theme.series[3]!);
      text(g, cmp > 0 ? '>' : cmp < 0 ? '<' : '=', cx, cy, { font: `800 ${size}px ${theme.font}`, color: theme.text });
      frac(cx + size * 1.6, String(z2), String(n2), theme.series[0]!);
      const sentence = `${p.z}/${p.n} ${ctx.t(cmp > 0 ? 'bigger' : cmp < 0 ? 'smaller' : 'equal')} ${p.z2}/${p.n2}`;
      text(g, sentence, cx, cy + size * 1.7, { font: `600 14px ${theme.font}`, color: theme.text });
    }

    function wrapText(value: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let line = '';
      for (const w of value.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    }

    function drawQuiz(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const gm = quizGeom();
      const n = task.pieces;
      const color = theme.series[3]!;
      const grow = taskState?.ok && pop.running ? 1 + 0.06 * Math.sin(Math.PI * Math.min(1, pop.value)) : 1;
      if (task.shape === 'strip') {
        const r = gm.strip;
        const w = r.w * grow;
        drawStrip({ x: r.x - (w - r.w) / 2, y: r.y, w, h: r.h }, n, quizColored, color);
      } else {
        const rad = gm.r * grow;
        for (let i = 0; i < n; i++) {
          const a0 = -Math.PI / 2 + (i * Math.PI * 2) / n;
          const a1 = a0 + (Math.PI * 2) / n;
          g.beginPath();
          g.moveTo(gm.cx, gm.cy);
          g.arc(gm.cx, gm.cy, rad, a0, a1);
          g.closePath();
          g.fillStyle = quizColored(i) ? withAlpha(color, 0.75) : withAlpha(theme.muted, 0.12);
          g.fill();
          g.strokeStyle = theme.bg;
          g.lineWidth = 3;
          g.stroke();
        }
        g.beginPath();
        g.arc(gm.cx, gm.cy, rad, 0, Math.PI * 2);
        g.strokeStyle = withAlpha(theme.muted, 0.8);
        g.lineWidth = 2;
        g.stroke();
      }
      if (task.kind === 'color') {
        const { visual } = regions();
        text(g, tr('colored', { k: selectedCount(p.sel, n), p: n }), visual.x + visual.w / 2, visual.y + visual.h - 16, { font: `600 13px ${theme.font}`, color: theme.muted });
      }
    }

    function drawQuizPanel(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const fb = feedback();
      let size = 18;
      const measure = () => {
        const a = wrapText(taskText(), r.w - 32, `700 ${size}px ${theme.font}`);
        const b = fb ? wrapText(fb.text, r.w - 32, `600 ${Math.round(size * 0.8)}px ${theme.font}`) : [];
        return { a, b, h: a.length * size * 1.3 + b.length * size * 1.05 + (fb ? 12 : 0) };
      };
      let m = measure();
      while (m.h > r.h - 24 && size > 11) {
        size--;
        m = measure();
      }
      let y = r.y + Math.max(12, (r.h - m.h) / 2);
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.font = `700 ${size}px ${theme.font}`;
      g.fillStyle = theme.text;
      for (const l of m.a) {
        g.fillText(l, r.x + r.w / 2, y);
        y += size * 1.3;
      }
      if (fb) {
        y += 12;
        g.font = `600 ${Math.round(size * 0.8)}px ${theme.font}`;
        g.fillStyle = fb.color;
        for (const l of m.b) {
          g.fillText(l, r.x + r.w / 2, y);
          y += size * 1.05;
        }
      }
    }

    function lineGeometry(): { x0: number; y: number; unit: number; count: number } {
      const { visual } = regions();
      const count = Math.max(1, Math.min(MAX_WHOLES, Math.ceil(p.z / p.n)));
      const x0 = visual.x + 40;
      const unit = (visual.w - 80) / count;
      return { x0, y: visual.y + visual.h * 0.5, unit, count };
    }

    function updateReadouts(): void {
      for (const k of ['task', 'verdict', 'cmp']) ctx.readout(k, null);
      if (p.mode === 'quiz') {
        for (const k of ['fraction', 'reduced', 'decimal', 'percent']) ctx.readout(k, null);
        ctx.readout('task', taskText());
        const fb = feedback();
        ctx.readout('verdict', fb ? fb.text : ctx.t(task.kind === 'read' ? 'emptyRead' : 'emptyColor'));
        return;
      }
      if (p.mode === 'compare') {
        for (const k of ['reduced', 'decimal', 'percent']) ctx.readout(k, null);
        const c = commonDenominator(p.z, p.n, p.z2, p.n2);
        const cmp = compareFractions(p.z, p.n, p.z2, p.n2);
        const sign = cmp > 0 ? '>' : cmp < 0 ? '<' : '=';
        ctx.readout('fraction', { html: `${frac(p.z, p.n)} und ${frac(p.z2, p.n2)}`.replace(' und ', ctx.lang === 'de' ? ' und ' : ' and ') });
        ctx.readout('cmp', { html: `${frac(p.z, p.n)} = ${frac(c.z1, c.n)} ${sign} ${frac(c.z2, c.n)} = ${frac(p.z2, p.n2)}` });
        return;
      }
      const z = p.z;
      const n = p.n;
      const k = p.k;
      const red = reduce(z, n);
      ctx.readout('fraction', { html: `${frac(z, n)}${k > 1 ? ` = ${frac(z * k, n * k)}` : ''}${z > n ? ` = ${mixedHtml(z, n)}` : ''}` });
      ctx.readout('reduced', {
        html:
          z === 0
            ? `${frac(z, n)} = 0`
            : red.n === n
            ?`${frac(z, n)} (${ctx.lang === 'de' ? 'nicht kürzbar' : 'cannot be reduced'})`
            : `${frac(z, n)} = ${frac(red.z, red.n)}${red.n === 1 ? ` = ${red.z}` : ''}`,
      });
      ctx.readout('decimal', { html: decimalHtml(z, n) });
      ctx.readout('percent', `${decimalExpansion(z, n).period ? '≈ ' : ''}${fmt.num((z / n) * 100, 2)} %`);
    }

    function frac(z: number, n: number): string {
      return `<span class="frac"><span>${z}</span><span>${n}</span></span>`;
    }

    function mixedHtml(z: number, n: number): string {
      const m = mixed(z, n);
      return m.rest ? `${m.whole}${frac(m.rest, n)}` : String(m.whole);
    }

    function decimalHtml(z: number, n: number): string {
      const d = decimalExpansion(z, n);
      const sep = ctx.lang === 'de' ? ',' : '.';
      if (!d.pre && !d.period) return String(d.integer);
      return `${d.integer}${sep}${d.pre}${d.period ? `<span style="text-decoration: overline">${d.period}</span>` : ''}`;
    }

    /* ---------- Zeichnen ---------- */
    function drawPizza(i: number, r: Rect, cutT: number): void {
      const g = surface.g;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const rad = r.w / 2 - 6;
      const n = p.n;
      const img = ctx.images.get('pizza');
      for (let j = 0; j < n; j++) {
        const index = i * n + j;
        const selected = index < p.z;
        const a0 = -Math.PI / 2 + (j * 2 * Math.PI) / n;
        const a1 = a0 + (2 * Math.PI) / n;
        const mid = (a0 + a1) / 2;
        const off = (lift[index] ?? 0) * rad * (n === 1 ? 0 : 0.12);
        const ox = cx + Math.cos(mid) * off;
        const oy = cy + Math.sin(mid) * off;
        g.save();
        g.beginPath();
        if (n === 1) g.arc(ox, oy, rad, 0, Math.PI * 2);
        else {
          g.moveTo(ox, oy);
          g.arc(ox, oy, rad, a0, a1);
          g.closePath();
        }
        if (selected) {
          g.shadowColor = 'rgba(0,0,0,0.35)';
          g.shadowBlur = 12 * (lift[index] ?? 0);
          g.shadowOffsetY = 4 * (lift[index] ?? 0);
        }
        g.fillStyle = '#d9a35a';
        g.fill();
        g.shadowColor = 'transparent';
        g.clip();
        if (img) g.drawImage(img, ox - rad, oy - rad, rad * 2, rad * 2);
        else drawPizzaVector(g, ox, oy, rad);
        if (!selected) {
          // Clip ist noch aktiv: ganze Fläche abdunkeln
          g.fillStyle = ctx.theme.dark ? 'rgba(20,24,32,0.62)' : 'rgba(255,255,255,0.62)';
          g.fillRect(ox - rad, oy - rad, rad * 2, rad * 2);
        }
        g.restore();
        if (hover === index) {
          g.save();
          g.beginPath();
          g.moveTo(ox, oy);
          g.arc(ox, oy, rad, a0, a1);
          g.closePath();
          g.strokeStyle = ctx.theme.series[0]!;
          g.lineWidth = 3;
          g.stroke();
          g.restore();
        }
      }
      // Schnittlinien (wachsen beim Schneiden vom Mittelpunkt nach außen)
      const sub = n * p.k;
      g.save();
      g.lineCap = 'round';
      for (let j = 0; j < sub && sub > 1; j++) {
        const main = j % p.k === 0;
        const a = -Math.PI / 2 + (j * 2 * Math.PI) / sub;
        const piece = i * n + Math.floor(j / p.k);
        const off = (lift[piece] ?? 0) * rad * 0.12;
        const mid = -Math.PI / 2 + ((Math.floor(j / p.k) + 0.5) * 2 * Math.PI) / n;
        const ox = cx + Math.cos(mid) * off;
        const oy = cy + Math.sin(mid) * off;
        const len = rad * (main ? cutT : Math.max(0, cutT * 1.4 - 0.4));
        g.strokeStyle = main ? (ctx.theme.dark ? '#f5f1e8' : '#ffffff') : withAlpha('#ffffff', 0.85);
        g.lineWidth = main ? 3 : 1.5;
        if (!main) g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(ox, oy);
        g.lineTo(ox + Math.cos(a) * len, oy + Math.sin(a) * len);
        g.stroke();
        g.setLineDash([]);
      }
      g.restore();
    }

    function drawPizzaVector(g: CanvasRenderingContext2D, cx: number, cy: number, rad: number): void {
      const crust = g.createRadialGradient(cx, cy, rad * 0.7, cx, cy, rad);
      crust.addColorStop(0, '#e8b35a');
      crust.addColorStop(1, '#b8732d');
      g.fillStyle = crust;
      g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2);
      g.fillStyle = '#c8402a';
      g.beginPath();
      g.arc(cx, cy, rad * 0.86, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,226,140,0.85)';
      for (let i = 0; i < 26; i++) {
        const a = i * 2.39996;
        const d = rad * 0.8 * Math.sqrt((i + 0.5) / 26);
        g.beginPath();
        g.ellipse(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rad * 0.16, rad * 0.11, a, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#9e2a1c';
      for (let i = 0; i < 9; i++) {
        const a = i * 2.2 + 0.4;
        const d = rad * 0.62 * Math.sqrt((i + 0.6) / 9);
        g.beginPath();
        g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, rad * 0.075, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawCake(i: number, r: Rect, cutT: number): void {
      const g = surface.g;
      const n = p.n;
      const img = ctx.images.get('cake');
      const w = r.w / n;
      for (let j = 0; j < n; j++) {
        const index = i * n + j;
        const selected = index < p.z;
        const up = (lift[index] ?? 0) * 10;
        const x = r.x + j * w;
        g.save();
        if (selected) {
          g.shadowColor = 'rgba(0,0,0,0.35)';
          g.shadowBlur = 10 * (lift[index] ?? 0);
          g.shadowOffsetY = up * 0.6;
        }
        g.beginPath();
        g.rect(x, r.y - up, w, r.h);
        g.fillStyle = '#e9c27a';
        g.fill();
        g.shadowColor = 'transparent';
        g.clip();
        if (img) g.drawImage(img, r.x, r.y - up, r.w, r.h);
        else drawCakeVector(g, { x: r.x, y: r.y - up, w: r.w, h: r.h });
        if (!selected) {
          g.fillStyle = ctx.theme.dark ? 'rgba(20,24,32,0.62)' : 'rgba(255,255,255,0.62)';
          g.fillRect(x, r.y - up, w, r.h);
        }
        g.restore();
        if (hover === index) {
          g.strokeStyle = ctx.theme.series[0]!;
          g.lineWidth = 3;
          g.strokeRect(x + 1.5, r.y - up + 1.5, w - 3, r.h - 3);
        }
      }
      // Schnitte: senkrecht für die n Teile, waagerecht beim Erweitern
      g.save();
      g.strokeStyle = '#ffffff';
      g.lineCap = 'round';
      for (let j = 1; j < n; j++) {
        const x = r.x + j * w;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x, r.y - 10);
        g.lineTo(x, r.y - 10 + (r.h + 10) * cutT);
        g.stroke();
      }
      if (p.k > 1) {
        g.setLineDash([5, 4]);
        g.lineWidth = 1.5;
        for (let j = 0; j < n; j++) {
          const up = (lift[i * n + j] ?? 0) * 10;
          for (let q = 1; q < p.k; q++) {
            const y = r.y - up + (q * r.h) / p.k;
            g.beginPath();
            g.moveTo(r.x + j * w + 3, y);
            g.lineTo(r.x + j * w + 3 + (w - 6) * Math.max(0, cutT * 1.4 - 0.4), y);
            g.stroke();
          }
        }
      }
      g.restore();
      g.strokeStyle = ctx.theme.dark ? 'rgba(255,255,255,0.25)' : 'rgba(80,50,20,0.35)';
      g.lineWidth = 2;
      roundRect(g, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 8);
      g.stroke();
    }

    function drawCakeVector(g: CanvasRenderingContext2D, r: Rect): void {
      const base = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      base.addColorStop(0, '#f2d08f');
      base.addColorStop(1, '#d9a85a');
      g.fillStyle = base;
      g.fillRect(r.x, r.y, r.w, r.h);
      // Streusel
      for (let i = 0; i < 220; i++) {
        const x = r.x + ((i * 73.13) % r.w);
        const y = r.y + ((i * 41.71) % r.h);
        g.fillStyle = i % 3 === 0 ? 'rgba(160,100,40,0.5)' : 'rgba(255,240,200,0.6)';
        g.beginPath();
        g.arc(x, y, 2 + (i % 4), 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawLine(cutT: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { x0, y, unit, count } = lineGeometry();
      const n = p.n;
      // Band
      const total = count * n;
      for (let j = 0; j < total; j++) {
        const selected = j < p.z;
        const up = (lift[j] ?? 0) * 6;
        g.fillStyle = selected ? theme.series[3]! : withAlpha(theme.muted, 0.18);
        g.fillRect(x0 + (j * unit) / n + 1, y - 22 - up, unit / n - 2, 20);
        if (hover === j) {
          g.strokeStyle = theme.series[0]!;
          g.lineWidth = 2.5;
          g.strokeRect(x0 + (j * unit) / n + 1, y - 22 - up, unit / n - 2, 20);
        }
      }
      // Zahlenstrahl
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0 - 10, y);
      g.lineTo(x0 + count * unit + 20, y);
      g.stroke();
      for (let j = 0; j <= total * p.k; j++) {
        const x = x0 + (j * unit) / (n * p.k);
        const whole = j % (n * p.k) === 0;
        const main = j % p.k === 0;
        const len = (whole ? 12 : main ? 8 : 4) * Math.min(1, cutT * 1.5);
        g.lineWidth = whole ? 2.5 : 1.5;
        g.beginPath();
        g.moveTo(x, y - len);
        g.lineTo(x, y + len);
        g.stroke();
        if (whole) text(g, String(j / (n * p.k)), x, y + 24, { font: `700 15px ${theme.font}`, color: theme.text });
        else if (main && n <= 12 && unit / n > 26) text(g, `${j / p.k}/${n}`, x, y + 22, { font: `500 11px ${theme.font}`, color: theme.muted });
      }
      // Markierung bei z/n
      const xz = x0 + (Math.min(p.z, total) * unit) / n;
      g.fillStyle = theme.series[3]!;
      g.beginPath();
      g.moveTo(xz, y - 26);
      g.lineTo(xz - 7, y - 38);
      g.lineTo(xz + 7, y - 38);
      g.closePath();
      g.fill();
    }

    function drawPanel(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const z = p.z;
      const n = p.n;
      const wide = isWide();
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h * (wide ? 0.38 : 0.4);
      const big = wide ? Math.min(64, r.w * 0.22) : Math.min(46, r.h * 0.26);
      const drawFrac = (x: number, top: string, bottom: string, size: number, color: string) => {
        g.font = `800 ${size}px ${theme.font}`;
        const w = Math.max(g.measureText(top).width, g.measureText(bottom).width) + size * 0.3;
        text(g, top, x, cy - size * 0.62, { font: `800 ${size}px ${theme.font}`, color });
        text(g, bottom, x, cy + size * 0.66, { font: `800 ${size}px ${theme.font}`, color });
        g.fillStyle = color;
        g.fillRect(x - w / 2, cy - size * 0.06, w, Math.max(3, size * 0.07));
        return w;
      };
      const parts: { type: 'frac' | 'eq'; top?: string; bottom?: string; color?: string }[] = [{ type: 'frac', top: String(z), bottom: String(n), color: theme.series[3]! }];
      if (p.k > 1) parts.push({ type: 'eq' }, { type: 'frac', top: String(z * p.k), bottom: String(n * p.k), color: theme.series[0]! });
      // Breiten messen, dann mittig zeichnen
      const size = parts.length > 1 ? big * 0.8 : big;
      g.font = `800 ${size}px ${theme.font}`;
      const widths = parts.map((q) => (q.type === 'eq' ? size * 0.9 : Math.max(g.measureText(q.top!).width, g.measureText(q.bottom!).width) + size * 0.3));
      let x = cx - widths.reduce((s, w) => s + w + 10, -10) / 2;
      parts.forEach((q, i) => {
        const w = widths[i]!;
        if (q.type === 'eq') text(g, '=', x + w / 2, cy, { font: `700 ${size * 0.8}px ${theme.font}`, color: theme.muted });
        else drawFrac(x + w / 2, q.top!, q.bottom!, size, q.color!);
        x += w + 10;
      });
      const lines: string[] = [];
      const m = mixed(z, n);
      const wholeKey = m.rest === 0 ? (m.whole === 1 ? 'wholeOnlyOne' : 'wholesOnly') : m.whole === 1 ? 'wholeOne' : 'wholes';
      lines.push(z > n ? tr(wholeKey, { w: m.whole, r: m.rest, n }) : tr('of', { z, n }));
      if (p.decimal) {
        const d = decimalExpansion(z, n);
        const sep = ctx.lang === 'de' ? ',' : '.';
        const dec = !d.pre && !d.period ? String(d.integer) : `${d.integer}${sep}${d.pre}${d.period ? `${d.period}…` : ''}`;
        // Periodische Brüche: Prozentwert ist gerundet, daher „≈“
        lines.push(`= ${dec}${d.period ? ` (${ctx.t('period')} ${d.period})` : ''} ${d.period ? '≈' : '='} ${fmt.num((z / n) * 100, 1)} %`);
      }
      // Schrift so wählen, dass jede Zeile in den Bereich passt
      let fs = wide ? 15 : 13;
      g.font = `600 ${fs}px ${theme.font}`;
      const longest = Math.max(...lines.map((l) => g.measureText(l).width));
      if (longest > r.w - 16) fs = Math.max(10, (fs * (r.w - 16)) / longest);
      lines.forEach((line, i) => text(g, line, cx, cy + size * 1.55 + i * 22, { font: `600 ${fs}px ${theme.font}`, color: theme.text }));
      if (p.z > MAX_WHOLES * n) text(g, `(${ctx.t('more')})`, cx, cy + size * 1.55 + lines.length * 22, { font: `500 12px ${theme.font}`, color: theme.muted });
    }

    function syncLift(): boolean {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastFrame) / 1000);
      lastFrame = now;
      const total = MAX_WHOLES * 12 + 1;
      let moving = false;
      for (let i = 0; i < total; i++) {
        const target = i < p.z ? 1 : 0;
        const cur = lift[i] ?? 0;
        const next = cur + (target - cur) * Math.min(1, dt * 12);
        lift[i] = Math.abs(next - target) < 0.002 ? target : next;
        if (lift[i] !== target) moving = true;
      }
      return moving;
    }

    lift = Array.from({ length: MAX_WHOLES * 12 + 1 }, (_, i) => (i < p.z ? 1 : 0));

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') newTask();
        if (changed.has('ans') && taskState && !taskState.ok) taskState = null;
        if (source === 'input' && p.mode === 'compare' && p.z > p.n) ctx.set({ z: p.n });
        if (source === 'input' && p.mode === 'compare' && p.z2 > p.n2) ctx.set({ z2: p.n2 });
        if (source === 'input' && p.z > MAX_WHOLES * p.n) ctx.set({ z: MAX_WHOLES * p.n });
        if (changed.has('n') || changed.has('k') || changed.has('shape')) cut.play();
        updateReadouts();
      },

      action(id) {
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, ans: '', sel: 0 });
          return;
        }
        if (task.kind === 'read') {
          const r = checkRead(task, p.ans);
          taskState = { ok: r.ok, empty: r.got === null };
        } else {
          taskState = { ok: selectedCount(p.sel, task.pieces) === task.count, empty: false };
        }
        pop.play();
        updateReadouts();
        const fb = feedback();
        if (fb) ctx.announce(fb.text);
        ctx.requestRender();
      },

      render() {
        if (p.mode !== 'show') {
          const { visual, panel } = regions();
          surface.begin();
          const g = surface.g;
          g.fillStyle = ctx.theme.dark ? 'rgba(255,255,255,0.025)' : 'rgba(16,24,40,0.025)';
          roundRect(g, visual.x + 6, visual.y + 6, visual.w - 12, visual.h - 12, 14);
          g.fill();
          if (p.mode === 'compare') {
            drawCompare();
            drawComparePanel(panel);
          } else {
            drawQuiz();
            drawQuizPanel(panel);
          }
          if (pop.running) ctx.requestRender();
          return;
        }
        const moving = syncLift();
        const cutT = cut.value;
        const { visual, panel } = regions();
        surface.begin();
        const g = surface.g;
        g.fillStyle = ctx.theme.dark ? 'rgba(255,255,255,0.025)' : 'rgba(16,24,40,0.025)';
        roundRect(g, visual.x + 6, visual.y + 6, visual.w - 12, visual.h - 12, 14);
        g.fill();
        if (p.shape === 'strecke') drawLine(cutT);
        else for (let i = 0; i < wholes(); i++) (p.shape === 'pizza' ? drawPizza : drawCake)(i, wholeRect(i), cutT);
        text(g, ctx.t('tap'), visual.x + visual.w / 2, visual.y + visual.h - 16, { font: `500 12px ${ctx.theme.font}`, color: ctx.theme.muted });
        drawPanel(panel);
        if (moving || cut.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
