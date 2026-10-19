import { defineSimulation, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, ease, withAlpha, type Rect } from '../../../sim-core';
import { check, product, quizItem, quotient, ruleFactors, value, type Kind, type Relation } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Stellen der Wertetabelle je Art. */
const XS: Record<Kind, number[]> = { dir: [1, 2, 3, 4, 5], ind: [1, 2, 3, 4, 6], lin: [1, 2, 3, 4, 5] };
const START: Record<Kind, Record<string, number>> = { dir: { x: 3 }, ind: { x: 3 }, lin: { x: 3 } };

/**
 * Direkte und indirekte Proportionalität im Vergleich: Graph mit ziehbarem
 * Punkt, Wertetabelle mit Quotient bzw. Produkt, Dreisatz als Pfeilkette und
 * Rechtecke gleicher Fläche bei der indirekten Proportionalität. Ein Taxi mit
 * Grundgebühr zeigt, dass „je mehr – desto mehr“ allein nicht genügt.
 * „x verdoppeln“ zeigt im Graphen, was dabei mit y passiert. Im Übungsmodus
 * „Zuordnung erkennen“ ordnet man Wertetabellen aus dem Alltag ein (darunter
 * die abbrennende Kerze: „je mehr – desto weniger“, aber nicht indirekt
 * proportional); erst nach der Antwort erscheinen Graph, Quotienten und
 * Produkte.
 */
export default defineSimulation({
  id: 'proportional',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [
    { id: 'val', label: L('Werte', 'Values') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'ex', label: L('Erkunden', 'Explore') },
        { value: 'qz', label: L('Zuordnung erkennen (Übung)', 'Identify the relation (practice)') },
      ],
      default: 'ex',
    },
    { key: 'qs', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'qz' },
    {
      key: 'kind',
      type: 'choice',
      label: L('Zuordnung', 'Relation'),
      options: [
        { value: 'dir', label: L('direkt proportional (Äpfel)', 'directly proportional (apples)') },
        { value: 'ind', label: L('indirekt proportional (Beet umgraben)', 'inversely proportional (digging a bed)') },
        { value: 'lin', label: L('weder noch (Taxi)', 'neither (taxi)') },
      ],
      default: 'dir',
      visibleIf: (v) => v.mode !== 'qz',
    },
    { key: 'kd', type: 'number', group: 'val', label: L('Preis pro kg', 'Price per kg'), min: 0.5, max: 5, step: 0.1, default: 2.5, unit: '€', visibleIf: (v) => v.mode !== 'qz' && v.kind === 'dir' },
    { key: 'ki', type: 'number', group: 'val', label: L('Zeit für eine Person', 'Time for one person'), min: 6, max: 48, step: 1, default: 12, unit: 'h', visibleIf: (v) => v.mode !== 'qz' && v.kind === 'ind' },
    { key: 'kt', type: 'number', group: 'val', label: L('Preis pro km', 'Price per km'), min: 0.5, max: 4, step: 0.1, default: 2, unit: '€', visibleIf: (v) => v.mode !== 'qz' && v.kind === 'lin' },
    { key: 'b', type: 'number', group: 'val', label: L('Grundgebühr', 'Base fare'), min: 1, max: 6, step: 0.5, default: 3, unit: '€', visibleIf: (v) => v.mode !== 'qz' && v.kind === 'lin' },
    { key: 'x', type: 'number', group: 'val', label: L('Punkt P: x', 'Point P: x'), min: 0.5, max: 12, step: 0.5, default: 3, help: L('Auch P auf dem Graphen ziehen.', 'You can also drag P along the graph.'), visibleIf: (v) => v.mode !== 'qz' },
    { key: 'rect', type: 'boolean', group: 'view', label: L('Rechtecke unter den Punkten', 'Rectangles under the points'), default: true, visibleIf: (v) => v.mode !== 'qz' && v.kind === 'ind' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Die y-Werte in Tabelle und Rechnung erscheinen als „?“.', 'Off: the y-values in the table and calculation appear as “?”.'), default: true },
  ],
  actions: [
    { id: 'dbl', label: L('x verdoppeln', 'Double x'), primary: true, visibleIf: (v) => v.mode !== 'qz' },
    { id: 'qd', label: L('direkt proportional', 'directly proportional'), visibleIf: (v) => v.mode === 'qz' },
    { id: 'qi', label: L('indirekt proportional', 'inversely proportional'), visibleIf: (v) => v.mode === 'qz' },
    { id: 'qn', label: L('weder noch', 'neither'), visibleIf: (v) => v.mode === 'qz' },
    { id: 'new', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: (v) => v.mode === 'qz' },
  ],
  readouts: [
    { key: 'rule', label: L('Zuordnungsvorschrift', 'Rule'), spoiler: true },
    { key: 'check', label: L('Test', 'Test'), spoiler: true },
  ],
  presets: [
    { id: 'apples', label: L('Äpfel: 2,50 € pro kg', 'Apples: 2.50 € per kg'), values: {} },
    { id: 'cheap', label: L('Günstige Äpfel', 'Cheap apples'), values: { kd: 1.2, x: 5 } },
    { id: 'bed', label: L('Beet: 12 Stunden für 1 Person', 'Bed: 12 hours for 1 person'), values: { kind: 'ind', ki: 12, x: 3 } },
    { id: 'bed24', label: L('Großes Beet: 24 Stunden', 'Big bed: 24 hours'), values: { kind: 'ind', ki: 24, x: 4 } },
    { id: 'taxi', label: L('Taxi mit Grundgebühr', 'Taxi with base fare'), values: { kind: 'lin', kt: 2, b: 3, x: 3 } },
    { id: 'quiz', label: L('Übung: Zuordnung erkennen', 'Practice: identify the relation'), values: { mode: 'qz', qs: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen einer Zuordnung (Ursprungsgerade, Hyperbelast oder Gerade mit Grundgebühr) und einem ziehbaren Punkt P; daneben Situation mit Dreisatz, Wertetabelle mit Quotienten und Produkten und ein Merksatz.',
      sitT: 'Situation',
      tabT: 'Wertetabelle',
      merkeT: 'Merke',
      s_dir: 'Äpfel kosten {k} pro kg. Wie viel kosten {x}?',
      s_ind: 'Eine Person braucht {k}, um ein Beet umzugraben. Wie lange brauchen {x}?',
      s_lin: 'Ein Taxi kostet {b} Grundgebühr und {k} pro km. Wie viel kosten {x}?',
      m_dir: 'Direkt proportional: Zum Doppelten (Dreifachen, …) von x gehört das Doppelte (Dreifache, …) von y. Alle Quotienten y : x sind gleich (quotientengleich). Der Graph ist eine Halbgerade durch den Ursprung.',
      m_ind: 'Indirekt proportional: Zum Doppelten (Dreifachen, …) von x gehört die Hälfte (ein Drittel, …) von y. Alle Produkte x · y sind gleich (produktgleich). Der Graph ist ein Hyperbelast; die Rechtecke unter den Punkten haben gleichen Flächeninhalt.',
      m_lin: 'Je mehr km, desto teurer – aber nicht proportional: Bei doppelter Strecke zahlt man nicht das Doppelte, weil die Grundgebühr gleich bleibt. Die Quotienten sind verschieden, und die Gerade geht nicht durch den Ursprung.',
      q: 'y : x',
      p: 'x · y',
      equal: 'alle gleich ✓',
      differ: 'verschieden ✗',
      notDouble: 'nicht das {f}-fache!',
      unitKg: 'kg',
      unitEur: '€',
      unitPers: 'Personen',
      unitPers1: 'Person',
      unitH: 'h',
      unitKm: 'km',
      ruleDir: 'y = {k} · x',
      ruleInd: 'y = {k} : x',
      ruleLin: 'y = {k} · x + {b} (nicht proportional)',
      checkDir: 'quotientengleich: y : x = {k}',
      checkInd: 'produktgleich: x · y = {k}',
      checkLin: 'weder quotientengleich noch produktgleich',
      xDir: 'Masse in kg',
      yDir: 'Preis in €',
      xInd: 'Personen',
      yInd: 'Zeit in h',
      xLin: 'Strecke in km',
      yLin: 'Preis in €',
      area: 'Fläche {v}',
      m_linq: 'Weder noch: Weder die Quotienten noch die Produkte sind gleich. Der Graph ist zwar eine Gerade, geht aber nicht durch den Ursprung. „Je mehr – desto mehr“ oder „je mehr – desto weniger“ allein reicht nicht.',
      quizT: 'Zuordnung erkennen',
      qQ: 'Direkt proportional, indirekt proportional oder weder noch? Prüfe die Wertetabelle.',
      qPick: 'Wähle unten eine Antwort.',
      qRight: 'Richtig!',
      qWrong: 'Nicht ganz – richtig ist: {k}.',
      qn_dir: 'direkt proportional',
      qn_ind: 'indirekt proportional',
      qn_lin: 'weder noch',
      qr_dir: 'Alle Quotienten y : x sind gleich ({k}).',
      qr_ind: 'Alle Produkte x · y sind gleich ({k}).',
      qr_lin: 'Weder die Quotienten noch die Produkte sind gleich.',
      qr_more: '„Je mehr – desto mehr“ allein heißt noch nicht proportional!',
      qr_less: '„Je mehr – desto weniger“ allein heißt noch nicht indirekt proportional!',
      qScore: '{r} von {n} richtig',
      qz_dir0: 'Beim Tanken: getankte Menge → Preis.',
      qz_dir1: 'Schreibhefte: Anzahl → Preis.',
      qz_dir2: 'Wanderung mit gleichbleibendem Tempo: Zeit → Strecke.',
      qz_ind0: 'Eine Pizza wird gerecht geteilt: Anzahl der Personen → Stücke pro Person.',
      qz_ind1: 'Eine Fahrt über 240 km: Geschwindigkeit → Fahrzeit.',
      qz_ind2: 'Ein Futtervorrat: Anzahl der Tiere → Tage, die er reicht.',
      qz_lin0: 'Handytarif: Gesprächsminuten → Monatsrechnung.',
      qz_lin1: 'Eine Kerze brennt ab: Brenndauer → Länge der Kerze.',
      qz_lin2: 'Taxifahrt: Strecke → Fahrpreis.',
      qx_dir0: 'Benzin in L',
      qy_dir0: 'Preis in €',
      qx_dir1: 'Hefte',
      qy_dir1: 'Preis in €',
      qx_dir2: 'Zeit in h',
      qy_dir2: 'Strecke in km',
      qx_ind0: 'Personen',
      qy_ind0: 'Stücke pro Person',
      qx_ind1: 'Tempo in km/h',
      qy_ind1: 'Fahrzeit in h',
      qx_ind2: 'Tiere',
      qy_ind2: 'Tage',
      qx_lin0: 'Minuten',
      qy_lin0: 'Preis in €',
      qx_lin1: 'Zeit in h',
      qy_lin1: 'Länge in cm',
      qx_lin2: 'Strecke in km',
      qy_lin2: 'Preis in €',
    },
    en: {
      canvas: 'Coordinate system with the graph of a relation (line through the origin, branch of a hyperbola or a line with a base fare) and a draggable point P; next to it the situation with the rule of three, a table with quotients and products and a summary.',
      sitT: 'Situation',
      tabT: 'Table of values',
      merkeT: 'Remember',
      s_dir: 'Apples cost {k} per kg. How much do {x} cost?',
      s_ind: 'One person needs {k} to dig a garden bed. How long do {x} need?',
      s_lin: 'A taxi costs a base fare of {b} plus {k} per km. How much do {x} cost?',
      m_dir: 'Directly proportional: double (triple, …) x gives double (triple, …) y. All quotients y : x are equal. The graph is a ray through the origin.',
      m_ind: 'Inversely proportional: double (triple, …) x gives half (a third, …) of y. All products x · y are equal. The graph is a branch of a hyperbola; the rectangles under the points have equal area.',
      m_lin: 'The further, the more expensive – but not proportional: twice the distance does not cost twice as much, because the base fare stays the same. The quotients differ and the line does not pass through the origin.',
      q: 'y : x',
      p: 'x · y',
      equal: 'all equal ✓',
      differ: 'different ✗',
      notDouble: 'not {f} times as much!',
      unitKg: 'kg',
      unitEur: '€',
      unitPers: 'people',
      unitPers1: 'person',
      unitH: 'h',
      unitKm: 'km',
      ruleDir: 'y = {k} · x',
      ruleInd: 'y = {k} : x',
      ruleLin: 'y = {k} · x + {b} (not proportional)',
      checkDir: 'equal quotients: y : x = {k}',
      checkInd: 'equal products: x · y = {k}',
      checkLin: 'neither equal quotients nor equal products',
      xDir: 'mass in kg',
      yDir: 'price in €',
      xInd: 'people',
      yInd: 'time in h',
      xLin: 'distance in km',
      yLin: 'price in €',
      area: 'area {v}',
      m_linq: 'Neither: neither the quotients nor the products are equal. The graph is a line, but it does not pass through the origin. “The more – the more” or “the more – the less” alone is not enough.',
      quizT: 'Identify the relation',
      qQ: 'Directly proportional, inversely proportional or neither? Check the table.',
      qPick: 'Choose an answer below.',
      qRight: 'Correct!',
      qWrong: 'Not quite – the answer is: {k}.',
      qn_dir: 'directly proportional',
      qn_ind: 'inversely proportional',
      qn_lin: 'neither',
      qr_dir: 'All quotients y : x are equal ({k}).',
      qr_ind: 'All products x · y are equal ({k}).',
      qr_lin: 'Neither the quotients nor the products are equal.',
      qr_more: '“The more – the more” alone does not mean proportional!',
      qr_less: '“The more – the less” alone does not mean inversely proportional!',
      qScore: '{r} of {n} correct',
      qz_dir0: 'Filling up the car: amount of petrol → price.',
      qz_dir1: 'Exercise books: number → price.',
      qz_dir2: 'A hike at a steady pace: time → distance.',
      qz_ind0: 'A pizza is shared fairly: number of people → slices per person.',
      qz_ind1: 'A journey of 240 km: speed → travel time.',
      qz_ind2: 'A supply of food: number of animals → days it lasts.',
      qz_lin0: 'Mobile phone plan: minutes → monthly bill.',
      qz_lin1: 'A candle burns down: burning time → length of the candle.',
      qz_lin2: 'Taxi ride: distance → fare.',
      qx_dir0: 'petrol in L',
      qy_dir0: 'price in €',
      qx_dir1: 'books',
      qy_dir1: 'price in €',
      qx_dir2: 'time in h',
      qy_dir2: 'distance in km',
      qx_ind0: 'people',
      qy_ind0: 'slices per person',
      qx_ind1: 'speed in km/h',
      qy_ind1: 'travel time in h',
      qx_ind2: 'animals',
      qy_ind2: 'days',
      qx_lin0: 'minutes',
      qy_lin0: 'price in €',
      qx_lin1: 'time in h',
      qy_lin1: 'length in cm',
      qx_lin2: 'distance in km',
      qy_lin2: 'price in €',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const kind = () => p.kind as Kind;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;

    const col = {
      g: () => th().series[0]!,
      P: () => th().series[3]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
      rect: () => th().series[4]!,
    };

    /** Merksatz: im Übungsmodus für „weder noch“ allgemein statt Taxi. */
    const mKey = () => (quiz() && rel().kind === 'lin' ? 'm_linq' : `m_${rel().kind}`);

    /* ---------- Übungsmodus ---------- */
    const quiz = () => p.mode === 'qz';
    const QI = () => quizItem(p.qs);
    /** Antwort auf die aktuelle Übungsaufgabe (null: noch offen) und Punktestand dieser Sitzung. */
    let answer: Kind | null = null;
    const score = { r: 0, n: 0 };
    /** „x verdoppeln“: alter und neuer Punkt, als Pfeile im Graphen. */
    let ghost: { x0: number; x1: number } | null = null;
    const ghostT = new Tween(900, ease.outCubic);

    const rel = (): Relation => {
      if (quiz()) {
        const q = QI();
        return { kind: q.kind, k: q.k, b: q.b };
      }
      return { kind: kind(), k: kind() === 'dir' ? p.kd : kind() === 'ind' ? p.ki : p.kt, b: p.b };
    };
    const xP = () => (kind() === 'ind' ? Math.max(1, Math.round(p.x)) : p.x);

    /* ---------- Einheiten ---------- */
    const num = (v: number) => fmt.num(Math.round(v * 100) / 100, 2);
    function xu(v: number): string {
      if (kind() === 'dir') return `${num(v)} ${ctx.t('unitKg')}`;
      if (kind() === 'ind') return `${num(v)} ${Math.abs(v - 1) < 1e-9 ? ctx.t('unitPers1') : ctx.t('unitPers')}`;
      return `${num(v)} ${ctx.t('unitKm')}`;
    }
    function yu(v: number): string {
      if (!Number.isFinite(v)) return '–';
      if (kind() === 'ind') return `${num(v)} ${ctx.t('unitH')}`;
      return `${fmt.fixed(v, 2)} ${ctx.t('unitEur')}`;
    }
    const Y = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.78, 240, h * 0.48));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 8, w: w - 4, h: h - ph - 10 } };
      }
      const cw = Math.round(clamp(w * 0.36, 250, 340));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [0, 10], y: [0, 25], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- weiche Anzeige ---------- */
    let shown = { k: rel().k, b: p.b, x: xP(), y1: 0 };
    let lastFrame = performance.now();
    const intro = new Tween(900, ease.outCubic);
    let dragging = 0;
    const yMaxGoal = () => {
      const r = rel();
      if (kind() === 'dir') return Math.max(4, r.k * 10.5) * 1.08;
      if (kind() === 'ind') return r.k * 1.12;
      return (r.k * 10.5 + r.b) * 1.08;
    };
    const xMax = () => (kind() === 'ind' ? 12.5 : 10.5);
    shown.y1 = yMaxGoal();
    const shownRel = (): Relation => ({ kind: kind(), k: shown.k, b: shown.b });

    /* ---------- Griffe ---------- */
    plot.addHandle({
      get: () => [shown.x, value(shownRel(), shown.x)],
      set: (x) => {
        dragging = performance.now();
        const lo = kind() === 'ind' ? 1 : 0.5;
        const v = kind() === 'ind' ? Math.round(clamp(x, lo, 12)) : Math.round(clamp(x, lo, 10) * 2) / 2;
        ctx.set({ x: v });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !quiz(),
      color: () => col.P(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const r = rel();
      const kk = r.kind;
      if (quiz() && !answer) {
        ctx.readout('rule', null);
        ctx.readout('check', null);
        return;
      }
      if (kk === 'dir') {
        ctx.readout('rule', tr('ruleDir', { k: num(r.k) }));
        ctx.readout('check', tr('checkDir', { k: num(r.k) }));
      } else if (kk === 'ind') {
        ctx.readout('rule', tr('ruleInd', { k: num(r.k) }));
        ctx.readout('check', tr('checkInd', { k: num(r.k) }));
      } else {
        ctx.readout('rule', tr('ruleLin', { k: num(r.k), b: num(r.b) }));
        ctx.readout('check', ctx.t('checkLin'));
      }
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      str = str.replace(/ (€|kg|km|h|Personen|people)\b/g, ' $1');
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function halo(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      const r = plot.rect;
      g.save();
      g.font = f;
      const w = g.measureText(str).width;
      let xx = x;
      if (align === 'center') xx = clamp(x, r.x + w / 2 + 4, r.x + r.w - w / 2 - 4);
      else if (align === 'left') xx = clamp(x, r.x + 4, r.x + r.w - w - 4);
      else xx = clamp(x, r.x + w + 4, r.x + r.w - 4);
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = th().bg;
      g.strokeText(str, xx, y);
      g.fillStyle = color;
      g.fillText(str, xx, y);
      g.restore();
    }

    /* ---------- Plot ---------- */
    function drawQuizPlot(): void {
      const g = surface.g;
      const theme = th();
      const q = QI();
      const id = `${q.kind}${q.ctx}`;
      const xm = Math.max(...q.xs) * 1.1;
      const ys = q.xs.map((x) => value(q, x));
      const ym = Math.max(...ys, q.b) * 1.18;
      plot.setRangePadded([0, xm], [0, ym], { left: F(44, 34), bottom: F(34, 28), top: 12, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const reveal = intro.running ? intro.value : 1;
      if (answer) {
        const ok = answer === q.kind;
        // Graph erst nach der Antwort: Ursprungsgerade, Hyperbelast oder Gerade mit Achsenabschnitt
        const to = q.k < 0 ? Math.min(xm, -q.b / q.k) : xm;
        const from = q.kind === 'ind' ? q.xs[0]! * 0.45 : 0;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.g(), '#ffffff', 0.5, 0.6);
        g.shadowBlur = 5;
        plot.fn((x) => value(q, x), { color: col.g(), width: 2.6, from, to, dash: q.kind === 'dir' ? undefined : [7, 5] });
        g.restore();
        if (q.kind === 'lin') {
          // Vergleich: Ursprungsgerade durch den ersten Punkt
          const x1 = q.xs[0]!;
          plot.line([0, 0], [x1, value(q, x1)], { color: withAlpha(col.bad(), 0.5), width: 1.5, dash: [5, 5] });
          plot.point(0, q.b, { color: col.bad(), radius: 5 });
        }
        if (q.kind === 'ind') {
          for (const x of q.xs)
            plot.polygon(
              [
                [0, 0],
                [x, 0],
                [x, value(q, x)],
                [0, value(q, x)],
              ],
              { stroke: withAlpha(col.rect(), 0.45), width: 1.1 },
            );
        }
        text(g, ctx.t(ok ? 'qRight' : 'qn_' + q.kind), r.x + r.w - 10, r.y + 14, { font: font(800, F(14, 12.5)), color: ok ? col.ok() : col.bad(), align: 'right' });
      }
      // Messpunkte der Tabelle, beim Laden nacheinander
      q.xs.forEach((x, i) => {
        const a = clamp(reveal * (q.xs.length + 1) - i, 0, 1);
        if (a <= 0) return;
        plot.point(x, value(q, x), { color: col.P(), radius: 3 + 2.5 * ease.outBack(a) });
      });
      text(g, ctx.t(`qx_${id}`), r.x + r.w - 8, plot.py(0) - 14, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'right' });
      text(g, ctx.t(`qy_${id}`), plot.px(0) + 12, r.y + 12, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'left' });
      plot.end();
    }

    function drawPlot(): void {
      if (quiz()) {
        drawQuizPlot();
        return;
      }
      const g = surface.g;
      const theme = th();
      const kk = kind();
      plot.setRangePadded([0, xMax()], [0, shown.y1], { left: F(44, 34), bottom: F(34, 28), top: 12, right: 14 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const R = shownRel();
      const reveal = intro.running ? intro.value : 1;
      const to = lerp(0, xMax(), reveal);
      // Rechtecke (indirekt)
      if (kk === 'ind' && p.rect) {
        for (const x of XS.ind) {
          const y = value(R, x);
          plot.polygon(
            [
              [0, 0],
              [x, 0],
              [x, y],
              [0, y],
            ],
            { stroke: withAlpha(col.rect(), 0.45), width: 1.2 },
          );
        }
        const xp = shown.x;
        const yp = value(R, xp);
        plot.polygon(
          [
            [0, 0],
            [xp, 0],
            [xp, yp],
            [0, yp],
          ],
          { fill: withAlpha(col.rect(), theme.dark ? 0.22 : 0.14), stroke: col.rect(), width: 2 },
        );
        const cx = plot.px(xp / 2);
        const cy = plot.py(yp / 2);
        if (plot.px(xp) - plot.px(0) > 80 && plot.py(0) - plot.py(yp) > 34) halo(tr('area', { v: Y(num(xp * yp)) }), cx, cy, font(700, F(12.5, 11.5)), col.rect());
      }
      // Graph
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.g(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      if (kk === 'ind') plot.fn((x) => value(R, x), { color: col.g(), width: 2.4, from: 0.45, to, dash: [7, 5] });
      else plot.fn((x) => value(R, x), { color: col.g(), width: 3, from: 0, to });
      g.restore();
      // Taxi: Vergleichsgerade durch den Ursprung und Grundgebühr
      if (kk === 'lin') {
        const xp = shown.x;
        const yp = value(R, xp);
        plot.line([0, 0], [xp, yp], { color: withAlpha(col.bad(), 0.55), width: 1.6, dash: [5, 5] });
        plot.point(0, R.b, { color: col.bad(), radius: 5 });
        halo(`${ctx.lang === 'de' ? 'Grundgebühr' : 'base fare'} ${yu(R.b)}`, plot.px(0) + 12, plot.py(R.b) + 16, font(700, F(12, 11)), col.bad(), 'left');
      }
      // Tabellenpunkte
      for (const x of XS[kk]) {
        if (x > to) continue;
        plot.point(x, value(R, x), { color: col.g(), radius: 4.5 });
      }
      // Steigungsdreieck (direkt): 1 → k
      if (kk === 'dir' && reveal >= 1) {
        const k = R.k;
        plot.polyline(
          [
            [1, k],
            [2, k],
            [2, 2 * k],
          ],
          { color: withAlpha(col.ok(), 0.9), width: 2 },
        );
        halo('1', plot.px(1.5), plot.py(k) + 12, font(700, 12), col.ok());
        halo(Y(num(k)), plot.px(2) + 8, plot.py(1.5 * k), font(700, 12), col.ok(), 'left');
      }
      // Punkt P mit Hilfslinien
      const xp = shown.x;
      const yp = value(R, xp);
      const px = plot.px(xp);
      const py = plot.py(yp);
      g.save();
      g.strokeStyle = withAlpha(col.P(), 0.8);
      g.lineWidth = 1.5;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(px, plot.py(0));
      g.lineTo(px, py);
      g.lineTo(plot.px(0), py);
      g.stroke();
      g.restore();
      halo(`P(${num(xp)} | ${Y(num(yp))})`, px + 12, py - 16, font(700, F(13, 12)), col.P(), 'left');
      // x verdoppeln: alter Punkt und Pfeile mit den Faktoren
      if (ghost) {
        const a = ghostT.running ? ghostT.value : 1;
        const y0v = value(R, ghost.x0);
        const y1v = value(R, ghost.x1);
        plot.point(ghost.x0, y0v, { color: withAlpha(col.P(), 0.6), radius: 5, hollow: true });
        const ax = plot.py(0) + F(18, 15);
        const ay = plot.px(0) - F(20, 16);
        const fx = ghost.x1 / ghost.x0;
        g.save();
        g.globalAlpha = a;
        g.strokeStyle = theme.muted;
        g.fillStyle = theme.muted;
        g.lineWidth = 1.6;
        // waagerecht unter der x-Achse
        g.beginPath();
        g.moveTo(plot.px(ghost.x0), ax);
        g.lineTo(plot.px(ghost.x1), ax);
        g.stroke();
        const head = (x: number, y: number, dx: number, dy: number, c: string) => {
          g.fillStyle = c;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x - dx * 7 - dy * 4, y - dy * 7 + dx * 4);
          g.lineTo(x - dx * 7 + dy * 4, y - dy * 7 - dx * 4);
          g.closePath();
          g.fill();
        };
        head(plot.px(ghost.x1), ax, Math.sign(ghost.x1 - ghost.x0), 0, theme.muted);
        g.restore();
        halo(fx > 1 ? '· 2' : ': 2', (plot.px(ghost.x0) + plot.px(ghost.x1)) / 2, ax + 1, font(800, F(12, 11)), theme.muted);
        // senkrecht links neben der y-Achse
        const fy = y1v / y0v;
        const yc = kk === 'lin' ? col.bad() : col.ok();
        g.save();
        g.globalAlpha = a;
        g.strokeStyle = yc;
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(ay, plot.py(y0v));
        g.lineTo(ay, plot.py(y1v));
        g.stroke();
        head(ay, plot.py(y1v), 0, Math.sign(plot.py(y1v) - plot.py(y0v)), yc);
        g.restore();
        const lab = !p.show ? '?' : kk === 'dir' ? (fx > 1 ? '· 2' : ': 2') : kk === 'ind' ? (fx > 1 ? ': 2' : '· 2') : `· ${num(fy)}`;
        halo(lab, ay - 6, (plot.py(y0v) + plot.py(y1v)) / 2, font(800, F(12, 11)), yc, 'right');
      }
      // Achsenbeschriftungen
      const xl = ctx.t(kk === 'dir' ? 'xDir' : kk === 'ind' ? 'xInd' : 'xLin');
      const yl = ctx.t(kk === 'dir' ? 'yDir' : kk === 'ind' ? 'yInd' : 'yLin');
      text(g, xl, r.x + r.w - 8, plot.py(0) - 14, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'right' });
      text(g, yl, plot.px(0) + 12, r.y + 12, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'left' });
      plot.end();
    }

    /* ---------- Karten ---------- */
    function sitCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const kk = kind();
      card(R, col.P(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('sitT'), col.P());
      const r = rel();
      const xp = xP();
      const kTxt = kk === 'dir' ? yu(r.k) : kk === 'ind' ? yu(r.k) : yu(r.k);
      const sv = tr(`s_${kk}`, { k: kTxt, b: yu(r.b), x: xu(xp) });
      const f = font(500, F(12.5, 12));
      const rows = wrap(sv, R.w - 2 * pad, f);
      rows.forEach((row, i) => text(g, row, R.x + pad, R.y + 34 + i * 16, { font: f, color: theme.text, align: 'left' }));
      // Dreisatz: 1 ≙ … → x ≙ …
      const y0 = R.y + 34 + rows.length * 16 + 12;
      const rh = F(26, 24);
      const fx = font(700, F(13.5, 12.5));
      const c1 = R.x + R.w * 0.42;
      const c2 = R.x + R.w * 0.58;
      const y1 = value(r, 1);
      const y2 = value(r, xp);
      text(g, xu(1), c1, y0 + rh * 0.5, { font: fx, color: theme.text, align: 'right' });
      text(g, '≙', R.x + R.w * 0.5, y0 + rh * 0.5, { font: fx, color: theme.muted });
      text(g, Y(yu(y1)), c2, y0 + rh * 0.5, { font: fx, color: col.g(), align: 'left' });
      text(g, xu(xp), c1, y0 + rh * 1.6, { font: fx, color: theme.text, align: 'right' });
      text(g, '≙', R.x + R.w * 0.5, y0 + rh * 1.6, { font: fx, color: theme.muted });
      text(g, Y(yu(y2)), c2, y0 + rh * 1.6, { font: fx, color: col.P(), align: 'left' });
      // Pfeile mit Faktoren
      const { fx: kx, fy: ky } = ruleFactors(r, 1, xp);
      const opX = `· ${num(kx)}`;
      const opY = kk === 'ind' ? `: ${num(kx)}` : kk === 'dir' ? `· ${num(kx)}` : `· ${num(ky)}`;
      const ay0 = y0 + rh * 0.5 + 8;
      const ay1 = y0 + rh * 1.6 - 8;
      const arrow = (x: number, side: number, label: string, color: string) => {
        g.save();
        g.strokeStyle = color;
        g.fillStyle = color;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x, ay0);
        g.quadraticCurveTo(x + side * 12, (ay0 + ay1) / 2, x, ay1);
        g.stroke();
        g.beginPath();
        g.moveTo(x, ay1);
        g.lineTo(x + side * 2 + 3, ay1 - 6);
        g.lineTo(x + side * 2 - 4, ay1 - 4);
        g.closePath();
        g.fill();
        text(g, label, x + side * 16, (ay0 + ay1) / 2, { font: font(700, F(12, 11)), color, align: side < 0 ? 'right' : 'left' });
        g.restore();
      };
      if (Math.abs(xp - 1) > 1e-9) {
        arrow(R.x + pad + 56, -1, opX, theme.muted);
        arrow(R.x + R.w - pad - 56, 1, p.show ? opY : '?', kk === 'lin' ? col.bad() : col.ok());
        if (kk === 'lin' && p.show) text(g, tr('notDouble', { f: num(kx) }), R.x + R.w / 2, y0 + rh * 2.5, { font: font(700, F(12, 11)), color: col.bad() });
      }
    }
    const sitH = (w: number) => {
      const f = font(500, F(12.5, 12));
      const kk = kind();
      const r = rel();
      const rows = wrap(tr(`s_${kk}`, { k: yu(r.k), b: yu(r.b), x: xu(xP()) }), w - 2 * F(14, 12), f).length;
      return 34 + rows * 16 + 12 + F(26, 24) * 2.2 + (kk === 'lin' ? 18 : 6);
    };

    function tableCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const kk = kind();
      const r = rel();
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('tabT'));
      const xs = quiz() ? [...QI().xs] : [...XS[kk]];
      const xp = quiz() ? NaN : xP();
      if (!quiz() && !xs.some((x) => Math.abs(x - xp) < 1e-9)) xs.push(xp);
      // Im Übungsmodus sind die y-Werte die Daten; Quotienten und Produkte erst nach der Antwort
      const yS = (v: string) => (quiz() || p.show ? v : '?');
      const qS = (v: string) => (quiz() ? (answer ? v : '…') : Y(v));
      xs.sort((a, b) => a - b);
      const pairs = xs.map((x) => [x, value(r, x)] as [number, number]);
      const ch = check(pairs);
      const qOk = ch.quotient;
      const pOk = ch.product;
      const cols = [R.x + pad, R.x + pad + (R.w - 2 * pad) * 0.24, R.x + pad + (R.w - 2 * pad) * 0.6, R.x + R.w - pad];
      const hy = R.y + 36;
      const fh = font(700, F(12, 11));
      text(g, 'x', cols[0]!, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      text(g, 'y', cols[1]!, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      const rv = !quiz() || !!answer;
      text(g, ctx.t('q'), cols[2]!, hy, { font: fh, color: qOk && rv ? col.ok() : theme.muted, align: 'right' });
      text(g, ctx.t('p'), cols[3]!, hy, { font: fh, color: pOk && rv ? col.ok() : theme.muted, align: 'right' });
      const lh = Math.min(F(22, 20), (R.h - 80) / xs.length);
      const fv = font(600, F(12.5, 11.5));
      xs.forEach((x, i) => {
        const y = hy + 12 + lh * (i + 0.5);
        const isP = Math.abs(x - xp) < 1e-9;
        if (isP) {
          g.fillStyle = withAlpha(col.P(), theme.dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - lh / 2 + 1, R.w - 2 * pad + 12, lh - 2, 6);
          g.fill();
        }
        const yv = value(r, x);
        text(g, num(x), cols[0]!, y, { font: fv, color: theme.text, align: 'left' });
        const reveal = !quiz() || !!answer;
        text(g, yS(num(yv)), cols[1]!, y, { font: fv, color: isP ? col.P() : col.g(), align: 'left' });
        text(g, qS(num(quotient(r, x))), cols[2]!, y, { font: fv, color: qOk && reveal ? col.ok() : theme.text, align: 'right' });
        text(g, qS(num(product(r, x))), cols[3]!, y, { font: fv, color: pOk && reveal ? col.ok() : theme.text, align: 'right' });
      });
      // Urteil
      const vy = R.y + R.h - 16;
      if (quiz() ? !!answer : p.show) {
        text(g, qOk ? ctx.t('equal') : ctx.t('differ'), cols[2]!, vy, { font: font(700, F(11.5, 10.5)), color: qOk ? col.ok() : col.bad(), align: 'right' });
        text(g, pOk ? ctx.t('equal') : ctx.t('differ'), cols[3]!, vy, { font: font(700, F(11.5, 10.5)), color: pOk ? col.ok() : col.bad(), align: 'right' });
      }
    }

    function merkeCard(R: Rect): void {
      const pad = F(14, 12);
      const f = font(500, F(12.5, 12));
      const kk = rel().kind;
      card(R, kk === 'lin' ? col.bad() : col.ok(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('merkeT'), kk === 'lin' ? col.bad() : col.ok());
      wrap(ctx.t(mKey()), R.w - 2 * pad, f).forEach((row, i) => text(surface.g, row, R.x + pad, R.y + 34 + i * 16, { font: f, color: th().text, align: 'left' }));
    }
    const merkeH = (w: number) => 34 + wrap(ctx.t(mKey()), w - 2 * F(14, 12), font(500, F(12.5, 12))).length * 16 + 4;

    /** Übungskarte: Sachzusammenhang, Frage, Rückmeldung mit Begründung, Punktestand. */
    function quizRows(w: number): { s: string; c: string; f: string }[] {
      const theme = th();
      const q = QI();
      const fN = font(500, F(12.5, 12));
      const fB = font(700, F(13, 12));
      const rows: { s: string; c: string; f: string }[] = [];
      const add = (str: string, c: string, f: string) => wrap(str, w - 2 * F(14, 12), f).forEach((row) => rows.push({ s: row, c, f }));
      add(ctx.t(`qz_${q.kind}${q.ctx}`), theme.text, fB);
      if (!answer) {
        add(ctx.t('qQ'), theme.text, fN);
        add(ctx.t('qPick'), theme.muted, fN);
      } else {
        const ok = answer === q.kind;
        add(ok ? ctx.t('qRight') : tr('qWrong', { k: ctx.t(`qn_${q.kind}`) }), ok ? col.ok() : col.bad(), fB);
        add(tr(`qr_${q.kind}`, { k: num(q.k) }), theme.text, fN);
        if (q.kind === 'lin') add(ctx.t(q.k < 0 ? 'qr_less' : 'qr_more'), col.bad(), fN);
      }
      if (score.n) add(tr('qScore', { r: score.r, n: score.n }), theme.muted, font(600, F(11.5, 10.5)));
      return rows;
    }
    const quizH = (w: number) => 34 + quizRows(w).length * 17 + 4;
    function quizCard(R: Rect): void {
      const pad = F(14, 12);
      const q = QI();
      const c = answer ? (answer === q.kind ? col.ok() : col.bad()) : col.P();
      card(R, c, 0.04);
      title(R.x + pad, R.y + 16, `${ctx.t('quizT')} · ${fmt.num(p.qs, 0)}`, c);
      quizRows(R.w).forEach((row, i) => text(surface.g, row.s, R.x + pad, R.y + 34 + i * 17, { font: row.f, color: row.c, align: 'left' }));
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const k = reduced || dragging ? 1 : 1 - Math.exp(-dt * 9);
      const goal = { k: rel().k, b: p.b, x: xP(), y1: yMaxGoal() };
      let moving = false;
      const next = { ...shown };
      for (const key of Object.keys(goal) as (keyof typeof goal)[]) {
        const d = goal[key] - shown[key];
        const kk = key === 'y1' ? (reduced ? 1 : 1 - Math.exp(-dt * 5)) : k;
        if (Math.abs(d) > 1e-4 * (1 + Math.abs(goal[key]))) {
          next[key] = shown[key] + d * kk;
          moving = true;
        } else next[key] = goal[key];
      }
      shown = next;
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const sH = quiz() ? quizH(C.w) : sitH(C.w);
      const mH = merkeH(C.w);
      if (quiz()) quizCard({ x: C.x, y: C.y, w: C.w, h: sH });
      else sitCard({ x: C.x, y: C.y, w: C.w, h: sH });
      const rest = C.h - sH - gap;
      if ((!quiz() || answer) && rest - mH - gap >= 150) {
        tableCard({ x: C.x, y: C.y + sH + gap, w: C.w, h: rest - mH - gap });
        merkeCard({ x: C.x, y: C.y + C.h - mH, w: C.w, h: mH });
      } else tableCard({ x: C.x, y: C.y + sH + gap, w: C.w, h: rest });
      if (moving || intro.running || dragging || ghostT.running) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('qs') || changed.has('mode')) {
          answer = null;
          if (quiz() && source !== 'init') intro.play();
        }
        // die Verdoppeln-Pfeile verschwinden, sobald sich etwas anderes ändert
        if (ghost && ([...changed].some((k) => k !== 'x') || Math.abs(p.x - ghost.x1) > 1e-9)) ghost = null;
        if (changed.has('kind') && source === 'input') ctx.set(START[kind()]!);
        if (kind() === 'ind' && !Number.isInteger(p.x)) ctx.set({ x: Math.max(1, Math.round(p.x)) });
        if (kind() !== 'ind' && p.x > 10) ctx.set({ x: 10 });
        if (changed.has('kind') || source === 'replace') {
          intro.play();
          if (changed.has('kind')) shown = { k: rel().k, b: p.b, x: xP(), y1: yMaxGoal() };
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'dbl') {
          const x0 = xP();
          const max = kind() === 'ind' ? 12 : 10;
          const x1 = 2 * x0 <= max ? 2 * x0 : x0 / 2;
          if (kind() === 'ind' && !Number.isInteger(x1)) return;
          ghost = { x0, x1 };
          ctx.set({ x: x1 });
          ghostT.play(reduced ? 1 : 900);
        } else if (id === 'new') {
          ctx.set({ qs: (p.qs % 999) + 1 });
        } else if ((id === 'qd' || id === 'qi' || id === 'qn') && !answer) {
          answer = id === 'qd' ? 'dir' : id === 'qi' ? 'ind' : 'lin';
          score.n++;
          if (answer === QI().kind) score.r++;
          updateReadouts();
          intro.play(reduced ? 1 : 600);
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
