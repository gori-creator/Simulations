import { defineSimulation, ease, mesh3d, mixColor, roundRect, seededRandom, Surface, Tween, vec3, View3D, type Mesh3D, type Vec3 } from '../../../sim-core';
import { checkSolid, circleBase, polygonBase, regularPolygon, rollCircle, rollPolygon, slices, solid, solidTask, triangleBase, type BaseShape, type Pt, type SolidTask } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Abschnitte des Reglers „Abrollen“: bis 80 % rollt der Körper, danach klappen Grund- und Deckfläche herunter. */
const ROLL_END = 0.8;
const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/**
 * Prisma und Zylinder: Volumen V = G · h durch Stapeln von Schichten,
 * Oberfläche durch Abrollen (jede Seitenfläche hinterlässt ihren Abdruck, der
 * Mantel ist ein Rechteck u × h). Der Zylinder als Grenzfall des n-Eck-Prismas.
 * Dazu Übungsaufgaben (Prisma, Zylinder, Getränkedose).
 */
export default defineSimulation({
  id: 'prisma-zylinder',
  layout: { aspect: 1.6, aspectNarrow: 0.82 },
  groups: [
    { id: 'size', label: L('Maße in cm', 'Dimensions in cm') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'volumen', label: L('Volumen: Schichten', 'Volume: layers') },
        { value: 'oberflaeche', label: L('Oberfläche: abrollen', 'Surface: roll out') },
        { value: 'quiz', label: L('Üben', 'Practice') },
      ],
      default: 'volumen',
    },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'ans', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('z. B. 62,8', 'e.g. 62.8'), visibleIf: (v) => v.mode === 'quiz' },
    {
      key: 'base',
      type: 'choice',
      label: L('Grundfläche', 'Base'),
      options: [
        { value: 'dreieck', label: L('Dreieck', 'Triangle') },
        { value: 'neck', label: L('n-Eck', 'n-gon') },
        { value: 'kreis', label: L('Kreis (Zylinder)', 'Circle (cylinder)') },
      ],
      default: 'neck',
      visibleIf: (v) => v.mode !== 'quiz',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Eckenzahl n', 'Number of vertices n'),
      help: L('Regelmäßiges n-Eck. Je mehr Ecken, desto näher kommt das Prisma dem Zylinder.', 'Regular n-gon. The more vertices, the closer the prism gets to the cylinder.'),
      min: 3,
      max: 40,
      step: 1,
      default: 6,
      visibleIf: (v) => v.base === 'neck' && v.mode !== 'quiz',
    },
    {
      key: 'r',
      type: 'number',
      group: 'size',
      label: L('Radius r', 'Radius r'),
      help: L(
        'Beim n-Eck: Radius des Umkreises. In der Rechnung ist s die Seitenlänge und ρ der Inkreisradius (Höhe der Teildreiecke).',
        'For the n-gon: radius of the circumcircle. In the calculation, s is the side length and ρ the radius of the incircle (height of the small triangles).',
      ),
      min: 1,
      max: 4,
      step: 0.5,
      default: 2,
      unit: 'cm',
      visibleIf: (v) => v.base !== 'dreieck' && v.mode !== 'quiz',
    },
    { key: 'g', type: 'number', group: 'size', label: L('Grundseite g', 'Base side g'), min: 1, max: 8, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.base === 'dreieck' && v.mode !== 'quiz' },
    { key: 'hg', type: 'number', group: 'size', label: L('Dreieckshöhe h_g', 'Triangle height h_g'), min: 1, max: 6, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.base === 'dreieck' && v.mode !== 'quiz' },
    { key: 'h', type: 'number', group: 'size', label: L('Körperhöhe h', 'Height h of the solid'), min: 1, max: 8, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.mode !== 'quiz' },
    { key: 'roll', type: 'number', label: L('Abrollen', 'Rolling out'), min: 0, max: 100, step: 1, default: 0, unit: '%', visibleIf: (v) => v.mode === 'oberflaeche' },
    {
      key: 'ghost',
      type: 'boolean',
      group: 'view',
      label: L('Zylinder zum Vergleich', 'Cylinder for comparison'),
      default: false,
      visibleIf: (v) => v.base === 'neck' && v.mode === 'volumen',
    },
    { key: 'calc', type: 'boolean', group: 'view', label: L('Rechnung im Bild', 'Calculation in the picture'), default: true, visibleIf: (v) => v.mode !== 'quiz' },
  ],
  hint: (v) => {
    if (v.mode === 'quiz') return L('Tipp: Rechne mit Taschenrechner, trag das Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.', 'Tip: Work it out with a calculator, enter the result under “Your answer” and tap “Check”.');
    return null;
  },
  actions: [
    { id: 'stack', label: L('Schichten stapeln', 'Stack layers'), primary: true, visibleIf: (v) => v.mode === 'volumen' },
    { id: 'roll', label: L('Abrollen', 'Roll out'), primary: true, visibleIf: (v) => v.mode === 'oberflaeche' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'verdict', label: L('Rückmeldung', 'Feedback') },
    { key: 'G', label: L('Grundfläche', 'Base area'), spoiler: true },
    { key: 'u', label: L('Umfang der Grundfläche', 'Perimeter of the base'), spoiler: true },
    { key: 'V', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'O', label: L('Oberfläche', 'Surface area'), spoiler: true },
    { key: 'cmp', label: L('Vergleich mit dem Zylinder', 'Compared with the cylinder'), spoiler: true },
  ],
  resultsParam: 'calc',
  presets: [
    { id: 'start', label: L('Sechseckprisma', 'Hexagonal prism'), values: {} },
    { id: 'triangle', label: L('Dreiecksprisma', 'Triangular prism'), values: { base: 'dreieck', g: 4, hg: 3, h: 5 } },
    { id: 'limit', label: L('Fast ein Zylinder', 'Almost a cylinder'), values: { n: 24, ghost: true } },
    { id: 'cylinder', label: L('Zylinder', 'Cylinder'), values: { base: 'kreis', r: 2, h: 4 } },
    { id: 'roll-hex', label: L('Sechseckprisma abrollen', 'Roll a hexagonal prism'), values: { mode: 'oberflaeche', roll: 45 } },
    { id: 'roll-cyl', label: L('Zylindernetz', 'Net of a cylinder'), values: { mode: 'oberflaeche', base: 'kreis', r: 1.5, h: 4, roll: 100 } },
  ],
  strings: {
    de: {
      canvas: 'Prisma oder Zylinder in 3D: aus Schichten gestapelt oder auf dem Boden abgerollt; die Ansicht lässt sich drehen',
      qPrismV: 'Aufgabe {q}: Ein Prisma hat als Grundfläche ein Dreieck mit g = {g} cm und h_g = {hg} cm. Es ist {h} cm hoch. Berechne das Volumen in cm³.',
      qCylV: 'Aufgabe {q}: Ein Zylinder hat den Radius {r} cm und die Höhe {h} cm. Berechne das Volumen in cm³ (eine Nachkommastelle).',
      qCylO: 'Aufgabe {q}: Ein Zylinder hat den Radius {r} cm und die Höhe {h} cm. Berechne die Oberfläche in cm² (eine Nachkommastelle).',
      qCan: 'Aufgabe {q}: In eine Dose mit dem Radius {r} cm sollen {v} ml passen. Wie hoch muss sie innen sein (in cm, eine Nachkommastelle)?',
      hPrismV: 'V = G · h mit G = ½ · g · h_g.',
      hCylV: 'V = π · r² · h',
      hCylO: 'O = 2 · π · r² + 2 · π · r · h (zwei Kreise und der Mantel).',
      hCan: '1 ml = 1 cm³; h = V : (π · r²).',
      okMsg: 'Richtig! {calc}',
      noMsg: 'Noch nicht. Tipp: {hint}',
      emptyMsg: 'Trag dein Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.',
      wait: 'Deine Antwort fehlt noch.',
      layers1: '1 Schicht',
      layersN: '{n} Schichten',
      baseArea: 'Grundfläche G',
      oneLayer: '1 Schicht (1 cm hoch): G · 1 cm',
      allLayers: '{n} Schichten: V = G · h',
      cylinder: 'Zylinder: V = πr² · h',
      rolled: 'abgerollt',
      mantle: 'Mantel: M = u · h',
      mantleShort: 'Mantel: M = u · h',
      bases: 'Grund- und Deckfläche: 2 · G',
      surface: 'O = 2 · G + M',
      surfaceShort: 'O = 2 · G + M',
      net: 'Netz',
      start: 'Startfläche',
      stack: 'Schichten stapeln',
      roll: 'Abrollen',
      again: 'Noch einmal',
      percent: 'Das Prisma hat {p} % des Zylindervolumens.',
    },
    en: {
      canvas: 'Prism or cylinder in 3D: stacked from layers or rolled out on the floor; the view can be rotated',
      qPrismV: 'Task {q}: A prism has a triangular base with g = {g} cm and h_g = {hg} cm. It is {h} cm high. Calculate its volume in cm³.',
      qCylV: 'Task {q}: A cylinder has radius {r} cm and height {h} cm. Calculate its volume in cm³ (one decimal place).',
      qCylO: 'Task {q}: A cylinder has radius {r} cm and height {h} cm. Calculate its surface area in cm² (one decimal place).',
      qCan: 'Task {q}: A can with radius {r} cm is to hold {v} ml. How high must it be inside (in cm, one decimal place)?',
      hPrismV: 'V = B · h with B = ½ · g · h_g.',
      hCylV: 'V = π · r² · h',
      hCylO: 'S = 2 · π · r² + 2 · π · r · h (two circles and the curved surface).',
      hCan: '1 ml = 1 cm³; h = V : (π · r²).',
      okMsg: 'Correct! {calc}',
      noMsg: 'Not yet. Tip: {hint}',
      emptyMsg: 'Enter your result under “Your answer” and tap “Check”.',
      wait: 'Your answer is still missing.',
      layers1: '1 layer',
      layersN: '{n} layers',
      baseArea: 'Base area G',
      oneLayer: '1 layer (1 cm thick): G · 1 cm',
      allLayers: '{n} layers: V = G · h',
      cylinder: 'Cylinder: V = πr² · h',
      rolled: 'rolled out',
      mantle: 'Lateral area: M = u · h (u = perimeter of the base)',
      mantleShort: 'Lateral: M = u · h',
      bases: 'Two bases: 2 · G',
      surface: 'Surface area: O = 2 · G + M (G = base area)',
      surfaceShort: 'Surface area: O = 2 · G + M',
      net: 'Net',
      start: 'starting face',
      stack: 'Stack layers',
      roll: 'Roll out',
      again: 'Once more',
      percent: 'The prism has {p} % of the cylinder’s volume.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const cm = (v: number, d = 2) => `${fmt.num(v, d)} cm`;
    const cm2 = (v: number, d = 2) => `${fmt.num(v, d)} cm²`;
    const cm3 = (v: number, d = 2) => `${fmt.num(v, d)} cm³`;

    const VIEWS = { volumen: { azimuth: 30, elevation: 22 }, oberflaeche: { azimuth: 22, elevation: 38 } } as const;
    const view = new View3D(surface, { ...VIEWS.volumen, elevationLimits: [-20, 88] });

    // Üben: Maße der Aufgabe
    let task: SolidTask = solidTask(1, seededRandom(1));
    let taskState: { ok: boolean; got: number | null } | null = null;
    const quiz = () => p.mode === 'quiz';
    const BASE = () => (quiz() ? task.base : p.base);
    const GG = () => (quiz() ? task.g : p.g);
    const HG = () => (quiz() ? task.hg : p.hg);
    const RAD = () => (quiz() ? task.r : p.r);
    const HEIGHT = () => (quiz() ? task.h : p.h);
    const N = () => p.n;
    let base: BaseShape = polygonBase(6, 2);
    /** Schichten, die gerade sichtbar sind (beim Stapeln wachsend). */
    let stackAnim: { tween: Tween } | null = null;
    let rollShown = p.roll / 100;
    let rollAnim: { tween: Tween; from: number; to: number } | null = null;
    let frame: { target: Vec3; radius: number } | null = null;
    let lastTime = performance.now();

    function rebuild(): void {
      base = BASE() === 'dreieck' ? triangleBase(GG(), HG()) : BASE() === 'kreis' ? circleBase(RAD()) : polygonBase(N(), RAD());
      // Dreieck mit der Spitze zur Kamera drehen, damit zwei Seitenflächen sichtbar sind (Seite 0 bleibt Seite 0)
      if (BASE() === 'dreieck') base = { ...base, points: base.points.map(([x, y]) => [-x, -y] as Pt) };
    }

    /** Querschnitt zum Abrollen (u entlang des Bodens, w nach oben), Seite 0 unten. */
    function crossSection(): Pt[] {
      return base.points.map(([x1, x2]) => [x2, -x1] as Pt);
    }

    /* ---------- Ergebnisse ---------- */

    function taskText(): string {
      const t = task;
      const vars = { q: p.q, g: fmt.num(t.g, 1), hg: fmt.num(t.hg, 1), h: fmt.num(t.h, 1), r: fmt.num(t.r, 1), v: t.volume };
      return tr(t.kind === 'prismV' ? 'qPrismV' : t.kind === 'cylV' ? 'qCylV' : t.kind === 'cylO' ? 'qCylO' : 'qCan', vars);
    }

    function calcText(): string {
      const t = task;
      if (t.kind === 'prismV') return `V = ½ · ${fmt.num(t.g, 1)} · ${fmt.num(t.hg, 1)} · ${fmt.num(t.h, 1)} = ${fmt.num(t.answer, 2)} cm³`;
      if (t.kind === 'cylV') return `V = π · ${fmt.num(t.r, 1)}² · ${fmt.num(t.h, 1)} ≈ ${fmt.num(t.answer, 1)} cm³`;
      if (t.kind === 'cylO') return `${ctx.lang === 'de' ? 'O' : 'S'} = 2π · ${fmt.num(t.r, 1)}² + 2π · ${fmt.num(t.r, 1)} · ${fmt.num(t.h, 1)} ≈ ${fmt.num(t.answer, 1)} cm²`;
      return `h = ${t.volume} : (π · ${fmt.num(t.r, 1)}²) ≈ ${fmt.num(t.answer, 1)} cm`;
    }

    function feedback(): { text: string; color: string } | null {
      if (!taskState) return null;
      if (taskState.got === null) return { text: ctx.t('wait'), color: ctx.theme.muted };
      if (taskState.ok) return { text: tr('okMsg', { calc: calcText() }), color: ctx.theme.series[2]! };
      const hint = task.kind === 'prismV' ? 'hPrismV' : task.kind === 'cylV' ? 'hCylV' : task.kind === 'cylO' ? 'hCylO' : 'hCan';
      return { text: tr('noMsg', { hint: ctx.t(hint) }), color: ctx.theme.series[1]! };
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

    function drawTaskCard(narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const boxW = narrow ? surface.width - 80 : Math.min(380, surface.width * 0.4);
      const size = narrow ? 13 : 15;
      const fb = feedback();
      const lines = wrapText(taskText(), boxW - 28, `600 ${size}px ${th.font}`);
      const fbLines = fb ? wrapText(fb.text, boxW - 28, `700 ${size}px ${th.font}`) : [];
      const lineH = size * 1.35;
      const boxH = 20 + (lines.length + fbLines.length) * lineH + (fb ? 8 : 0);
      g.save();
      g.fillStyle = th.dark ? 'rgba(15,20,30,0.84)' : 'rgba(255,255,255,0.92)';
      roundRect(g, 10, 10, boxW, boxH, 12);
      g.fill();
      g.textAlign = 'left';
      g.textBaseline = 'top';
      let y = 20;
      g.font = `600 ${size}px ${th.font}`;
      g.fillStyle = th.text;
      for (const l of lines) {
        g.fillText(l, 24, y);
        y += lineH;
      }
      if (fb) {
        y += 8;
        g.font = `700 ${size}px ${th.font}`;
        g.fillStyle = fb.color;
        for (const l of fbLines) {
          g.fillText(l, 24, y);
          y += lineH;
        }
      }
      g.restore();
    }

    function updateReadouts(): void {
      ctx.readout('task', null);
      ctx.readout('verdict', null);
      if (quiz()) {
        for (const k of ['G', 'u', 'V', 'O', 'cmp']) ctx.readout(k, null);
        ctx.readout('task', taskText());
        const fb = feedback();
        ctx.readout('verdict', fb ? fb.text : ctx.t('emptyMsg'));
        return;
      }
      const v = (x: string) => `<var>${x}</var>`;
      const s = solid(base, HEIGHT());
      let gHtml = '';
      let uHtml = '';
      if (BASE() === 'dreieck') {
        gHtml = `${v('G')} = ½ · ${v('g')} · ${v('h')}<sub>g</sub> = ½ · ${cm(GG())} · ${cm(HG())} = <strong>${cm2(base.area)}</strong>`;
        // Schenkellänge ist gerundet, daher schon vor der Summe „≈“
        uHtml = `${v('u')} ≈ ${cm(GG())} + 2 · ${cm(base.sides[1]!)} ≈ <strong>${cm(base.perimeter)}</strong>`;
      } else if (BASE() === 'neck') {
        const q = regularPolygon(N(), RAD());
        gHtml = `${v('G')} = ${N()} · ½ · ${v('s')} · ${v('ρ')} ≈ ${N()} · ½ · ${cm(q.side)} · ${cm(q.apothem)} ≈ <strong>${cm2(base.area)}</strong>`;
        uHtml = `${v('u')} = ${N()} · ${v('s')} ≈ ${N()} · ${cm(q.side)} ≈ <strong>${cm(base.perimeter)}</strong>`;
      } else {
        gHtml = `${v('G')} = π · ${v('r')}² = π · (${cm(RAD())})² ≈ <strong>${cm2(base.area)}</strong>`;
        uHtml = `${v('u')} = 2π · ${v('r')} ≈ <strong>${cm(base.perimeter)}</strong>`;
      }
      ctx.readout('G', { html: gHtml });
      ctx.readout('u', { html: uHtml });
      ctx.readout('V', { html: `${v('V')} = ${v('G')} · ${v('h')} ≈ ${cm2(base.area)} · ${cm(HEIGHT())} ≈ <strong>${cm3(s.volume)}</strong>` });
      ctx.readout('O', {
        html: `${v('O')} = 2 · ${v('G')} + ${v('u')} · ${v('h')} ≈ 2 · ${cm2(base.area)} + ${cm(base.perimeter)} · ${cm(HEIGHT())} ≈ <strong>${cm2(s.surface)}</strong>`,
      });
      if (BASE() === 'neck') {
        const cyl = solid(circleBase(RAD()), HEIGHT());
        ctx.readout('cmp', {
          html: `${v('V')}<sub>${ctx.lang === 'de' ? 'Zyl' : 'cyl'}</sub> = π${v('r')}²${v('h')} ≈ ${cm3(cyl.volume)} · ${tr('percent', { p: fmt.num((100 * s.volume) / cyl.volume, 1) })}`,
        });
      } else ctx.readout('cmp', null);
    }

    function syncActions(): void {
      ctx.setAction('roll', { label: ctx.t((rollAnim ? rollAnim.to : rollShown) >= 1 && !rollAnim ? 'again' : 'roll') });
    }

    /* ---------- Farben ---------- */

    const tint = (c: string) => (ctx.theme.dark ? c : mixColor(c, '#ffffff', 0.18));
    const edgeOf = (c: string) => mixColor(c, ctx.theme.dark ? '#000000' : '#0b1220', ctx.theme.dark ? 0.5 : 0.45);

    /* ---------- Zeichnen ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      const narrow = surface.width < 560;
      let animating = false;

      if (rollAnim) {
        rollShown = rollAnim.from + (rollAnim.to - rollAnim.from) * rollAnim.tween.value;
        const percent = Math.round(rollShown * 100);
        if (percent !== p.roll) ctx.set({ roll: percent });
        if (!rollAnim.tween.running) {
          rollShown = rollAnim.to;
          rollAnim = null;
          syncActions();
        } else animating = true;
      }
      if (stackAnim?.tween.running) animating = true;

      const goal = p.mode !== 'oberflaeche' ? volumeFrame() : surfaceFrame();
      if (!frame) frame = goal;
      const k = 1 - Math.exp(-dt / 0.2);
      frame = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k };
      const settling = vec3.distance(frame.target, goal.target) > 0.005 || Math.abs(frame.radius - goal.radius) > 0.005;
      // schmal: Abdruck etwas nach rechts, damit links Platz für die Beschriftung h bleibt
      const ax = narrow ? (p.mode === 'oberflaeche' ? 0.6 : 0.5) : 0.57;
      view.setScene({ target: frame.target, radius: frame.radius, anchor: [ax, narrow ? 0.6 : 0.53] });

      view.begin();
      if (p.mode !== 'oberflaeche') drawVolume();
      else drawSurface();
      view.end();
      if (quiz()) drawTaskCard(narrow);
      else if (p.calc) drawCard(narrow);
      if (animating || settling) ctx.requestRender();
    }

    function baseRadius(): number {
      return Math.max(...base.points.map(([x, y]) => Math.hypot(x, y)));
    }

    function volumeFrame(): { target: Vec3; radius: number } {
      const R = Math.max(baseRadius(), p.ghost && BASE() === 'neck' ? RAD() : 0);
      return { target: [0, -0.35 * R, HEIGHT() * 0.45], radius: Math.hypot(R * 1.15, HEIGHT() / 2) * 1.12 + 0.4 };
    }

    function surfaceFrame(): { target: Vec3; radius: number } {
      const P = base.perimeter;
      const R = baseRadius();
      const narrow = surface.width < 560;
      return { target: [0, 0.12 * R, 0.3 * R], radius: 0.5 * Math.hypot(P + 2 * R, HEIGHT() + 4 * R) * (narrow ? 0.74 : 0.66) + 0.4 };
    }

    /* ---------- Volumen: Schichten ---------- */

    function prismMesh(z0: number, z1: number): Mesh3D {
      return mesh3d.prism(base.points, z0, z1);
    }

    function drawVolume(): void {
      const th = ctx.theme;
      const parts = slices(HEIGHT());
      const R = baseRadius();
      // Bodengitter und Schatten
      const G = Math.ceil(R + 2);
      view.grid({ min: [-G, -G], max: [G, G], step: 1, color: th.gridMinor });
      view.shadow(
        base.points.map(([x, y]) => [x, y, 0] as Vec3),
        { alpha: 0.2, blur: 22, spread: 1.05 },
      );
      // Schichten (beim Stapeln fallen sie nacheinander herunter)
      const t = stackAnim ? (performance.now() - (stackStart ?? 0)) / 1000 : Infinity;
      const smoothEdges = BASE() === 'kreis';
      parts.forEach(([z0, z1], i) => {
        let dz = 0;
        let alpha = 1;
        if (stackAnim) {
          const q = clamp01((t - i * 0.42) / 0.55);
          if (q <= 0) return;
          dz = (1 - ease.outCubic(q)) * 2.2;
          alpha = Math.min(1, q * 3);
        }
        const color = tint(i % 2 === 0 ? th.series[0]! : th.series[5]!);
        const top = i === parts.length - 1;
        view.mesh(prismMesh(z0 + dz, z1 + dz), {
          color,
          alpha,
          edgeColor: edgeOf(color),
          edgeWidth: 1.4,
          edgeAngle: smoothEdges ? 20 : 3,
          gloss: smoothEdges ? 0.3 : 0.16,
          face: (f) =>
            f === 1 && top && !stackAnim && p.calc && !quiz()
              ? { label: { text: `G ≈ ${cm2(base.area, 2)}`, size: surface.width < 560 ? 11 : 13 } }
              : undefined,
        });
      });
      // verdeckte Kanten des ganzen Körpers
      // (bei vielen Ecken nur Unruhe – dann weglassen)
      if (!stackAnim && base.points.length <= 16) view.mesh(prismMesh(0, HEIGHT()), { edges: false, hiddenEdges: true, edgeColor: edgeOf(tint(th.series[0]!)), edgeAngle: smoothEdges ? 20 : 3, face: () => null });
      // Vergleichszylinder
      if (p.ghost && BASE() === 'neck') {
        const cyl = mesh3d.cylinder(RAD(), HEIGHT(), 72);
        view.mesh(cyl, { color: th.series[4], alpha: 0.13, flat: true, edgeColor: th.series[4], edgeWidth: 1.6, edgeAngle: 20, cull: false });
      }
      drawHeight(parts.length);
    }

    let stackStart: number | null = null;

    /** Höhe h mit Zentimeter-Teilung an der rechten Kante. */
    function drawHeight(layers: number): void {
      const th = ctx.theme;
      // Ecke, die im Bild am weitesten rechts liegt
      let best = base.points[0]!;
      let bestX = -Infinity;
      for (const pt of base.points) {
        const x = view.toPx([pt[0], pt[1], 0])[0];
        if (x > bestX) {
          bestX = x;
          best = pt;
        }
      }
      const out = vec3.normalize([best[0], best[1], 0]);
      const off = 0.45;
      const a: Vec3 = [best[0] + out[0] * off, best[1] + out[1] * off, 0];
      const b: Vec3 = [a[0], a[1], HEIGHT()];
      view.segment(a, b, { color: th.muted, width: 1.6, layer: 'front' });
      for (let i = 0; i <= layers; i++) {
        const z = Math.min(HEIGHT(), i);
        const q: Vec3 = [a[0], a[1], z];
        view.custom(
          q,
          (g) => {
            const [x, y] = view.toPx(q);
            g.strokeStyle = th.muted;
            g.lineWidth = 1.4;
            g.beginPath();
            g.moveTo(x - 4, y);
            g.lineTo(x + 4, y);
            g.stroke();
          },
          'front',
        );
      }
      view.label([a[0], a[1], HEIGHT() / 2], quiz() && task.kind === 'can' && !taskState?.ok ? 'h = ?' : `h = ${cm(HEIGHT(), 1)}`, { color: th.text, size: 13, weight: '700', align: 'left', baseline: 'middle', offset: [10, 0] });
    }

    /* ---------- Oberfläche: Abrollen ---------- */

    function drawSurface(): void {
      const th = ctx.theme;
      const s = rollShown;
      const H = HEIGHT() / 2;
      const P = base.perimeter;
      const R = baseRadius();
      const cylinder = BASE() === 'kreis';
      const theta = 2 * Math.PI * smooth(clamp01(s / ROLL_END));
      const fade = clamp01((s - ROLL_END) / 0.06);
      const fold = smooth(clamp01((s - ROLL_END - 0.03) / (1 - ROLL_END - 0.03)));
      const shift = -P / 2;
      const toWorld = (u: number, w: number, x1: number): Vec3 => [x1, u + shift, w];

      // Boden
      view.grid({ min: [-Math.ceil(H + 2 * R + 1), Math.floor(shift - 1)], max: [Math.ceil(H + 2 * R + 1), Math.ceil(-shift + 2 * R + 1)], step: 1, color: th.gridMinor });

      const mantle = tint(th.series[0]!);
      const startColor = tint(mixColor(th.series[0]!, th.series[1]!, 0.55));
      const baseColor = tint(th.series[3]!);

      // Abdrücke auf dem Boden
      let printed: number;
      let pose: Pt[];
      let faces = 0;
      if (cylinder) {
        const c = rollCircle(RAD(), theta);
        printed = c.printed;
        pose = base.points.map(([x1, x2]) => {
          // Kreis-Querschnitt um den Mittelpunkt gedreht (im Uhrzeigersinn)
          const u0 = x2;
          const w0 = -x1;
          const cs = Math.cos(-c.angle);
          const sn = Math.sin(-c.angle);
          return [c.center[0] + u0 * cs - w0 * sn, c.center[1] + u0 * sn + w0 * cs] as Pt;
        });
      } else {
        const r = rollPolygon(crossSection(), theta);
        printed = r.printed;
        pose = r.points;
        faces = r.faces;
      }
      const sides = base.sides;
      const printRect = (u0: number, u1: number, color: string, label?: string) =>
        view.face([toWorld(u0, 0, -H), toWorld(u1, 0, -H), toWorld(u1, 0, H), toWorld(u0, 0, H)], {
          color,
          flat: false,
          stroke: edgeOf(color),
          width: 1.2,
          layer: 'back',
          label: label ? { text: label, size: surface.width < 560 ? 11 : 13 } : undefined,
        });
      if (cylinder) {
        if (printed > 1e-6) {
          // Abdruck der markierten Startstreifen (zwei der 72 Mantelstreifen ab der Mitte des ersten)
          const seam = Math.min(printed, (3 * Math.PI * RAD()) / base.points.length);
          printRect(0, seam, startColor);
          printRect(seam, printed, mantle);
        }
      } else {
        let u = 0;
        for (let j = 0; j < Math.min(faces, sides.length); j++) {
          printRect(u, u + sides[j]!, j === 0 ? startColor : mantle);
          u += sides[j]!;
        }
      }
      const complete = printed >= P - 1e-6;
      if (complete && fold > 0.98 && p.calc) {
        view.label(toWorld(P / 2, 0, 0), `M ≈ ${cm2(P * HEIGHT(), 2)}`, { color: th.text, size: 13, weight: '700', align: 'center', baseline: 'middle', background: th.dark ? 'rgba(15,20,30,0.78)' : 'rgba(255,255,255,0.85)' });
      }

      // rollender Körper (blendet am Ende aus)
      const alpha = 1 - fade;
      if (alpha > 0.01) {
        const m = mesh3d.prism(pose, -H, H);
        const mesh: Mesh3D = { vertices: m.vertices.map(([x, y, z]) => [z, x + shift, y] as Vec3), faces: m.faces };
        view.mesh(mesh, {
          color: mantle,
          alpha,
          edgeColor: edgeOf(mantle),
          edgeWidth: 1.5,
          edgeAngle: cylinder ? 20 : 3,
          gloss: cylinder ? 0.3 : 0.16,
          face: (f) => (f < 2 ? { color: baseColor } : f === 2 || (cylinder && f === 3) ? { color: startColor } : undefined),
        });
      }

      // Grund- und Deckfläche klappen an den Mantel
      if (complete && fade > 0) {
        const j = cylinder ? 0 : Math.floor(sides.length / 2);
        const at = cylinder ? P / 2 : sides.slice(0, j).reduce((a, b) => a + b, 0);
        // Querschnitt so legen, dass seine Seite j bei u = at auf dem Boden liegt
        let flat: Pt[];
        if (cylinder) {
          flat = crossSection().map(([u, w]) => [u + at, w + RAD()] as Pt);
        } else {
          const cs = crossSection();
          const n = cs.length;
          const a = cs[j]!;
          const b = cs[(j + 1) % n]!;
          const ang = -Math.atan2(b[1] - a[1], b[0] - a[0]);
          flat = cs.map(([u, w]) => {
            const x = u - a[0];
            const y = w - a[1];
            return [at + x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)] as Pt;
          });
        }
        const angle = fold * (Math.PI / 2);
        for (const side of [1, -1]) {
          const pts = flat.map(([u, w]) => toWorld(u, w * Math.cos(angle), side * (H + w * Math.sin(angle))));
          view.face(pts, {
            color: baseColor,
            alpha: Math.min(1, fade * 1.5),
            stroke: edgeOf(baseColor),
            width: 1.4,
            gloss: 0.15,
            label: fold > 0.98 && p.calc ? { text: `G ≈ ${cm2(base.area, 2)}`, size: surface.width < 560 ? 11 : 12 } : undefined,
          });
        }
      }

      // Maße am Abdruck: Länge (abgerollt bzw. u) und Höhe h
      if (printed > 0.2) {
        const label = complete ? `u ≈ ${cm(P, 2)}` : `${ctx.t('rolled')}: ${cm(printed, 1)}`;
        const a = toWorld(0, 0, H + 0.35);
        const b = toWorld(printed, 0, H + 0.35);
        view.segment(a, b, { color: th.series[1], width: 2.2, layer: 'back' });
        // Beschriftung im linken Viertel, damit sie nicht unter der angeklappten Grundfläche liegt
        view.label(vec3.lerp(a, b, complete ? 0.22 : 0.5), label, { color: th.series[1], size: 13, weight: '700', align: 'center', baseline: 'top', offset: [0, 8] });
      }
      const ha = toWorld(0, 0, -H);
      const hb = toWorld(0, 0, H);
      view.label(vec3.lerp(ha, hb, 0.5), `h = ${cm(HEIGHT(), 1)}`, { color: th.text, size: 13, weight: '700', align: 'right', baseline: 'middle', offset: [-12, 0] });
    }

    /* ---------- Rechnung im Bild ---------- */

    function drawCard(narrow: boolean): void {
      const th = ctx.theme;
      const g = surface.g;
      const sld = solid(base, HEIGHT());
      const lines: { text: string; color?: string; bold?: boolean }[] = [];
      let head = '';
      if (p.mode !== 'oberflaeche') {
        const parts = slices(HEIGHT());
        const t = stackAnim && stackStart !== null ? (performance.now() - stackStart) / 1000 : Infinity;
        const shown = Math.min(parts.length, Math.max(0, Math.floor((t - 0.55) / 0.42) + 1));
        const count = stackAnim ? shown : parts.length;
        const layersText = fmt.num(Math.min(count, HEIGHT()), 1);
        head = count === 1 ? ctx.t('layers1') : tr('layersN', { n: layersText });
        lines.push({ text: `${ctx.t('baseArea')} ≈ ${cm2(base.area)}`, color: th.series[0]! });
        if (count >= 1) lines.push({ text: `${ctx.t('oneLayer')} ≈ ${cm3(base.area)}`, color: th.series[5]! });
        if (count >= parts.length) lines.push({ text: `${tr('allLayers', { n: fmt.num(HEIGHT(), 1) })} ≈ ${cm3(sld.volume)}`, bold: true });
        if (p.ghost && BASE() === 'neck') lines.push({ text: `${ctx.t('cylinder')} ≈ ${cm3(Math.PI * RAD() * RAD() * HEIGHT())}`, color: th.series[4]! });
      } else {
        const theta = 2 * Math.PI * smooth(clamp01(rollShown / ROLL_END));
        const printed = BASE() === 'kreis' ? rollCircle(RAD(), theta).printed : rollPolygon(crossSection(), theta).printed;
        const complete = printed >= base.perimeter - 1e-6;
        const folded = rollShown >= 0.999;
        head = folded ? ctx.t('net') : `${ctx.t('rolled')}: ${cm(rollShown > 0 ? printed : 0, 1)}`;
        // Schmale Bühne: Erklärung der Formelzeichen weglassen (steht in den Ergebnissen)
        if (complete) lines.push({ text: `${ctx.t(narrow ? 'mantleShort' : 'mantle')} ≈ ${cm(base.perimeter)} · ${cm(HEIGHT(), 1)} ≈ ${cm2(sld.mantle)}`, color: th.series[0]! });
        if (folded) lines.push({ text: `${ctx.t('bases')} ≈ ${cm2(2 * base.area)}`, color: th.series[3]! });
        if (folded) lines.push({ text: `${ctx.t(narrow ? 'surfaceShort' : 'surface')} ≈ ${cm2(sld.surface)}`, bold: true });
      }
      const size = narrow ? 12 : 13;
      g.save();
      let w = 0;
      for (const line of lines) {
        g.font = `${line.bold ? 800 : 600} ${size}px ${th.font}`;
        w = Math.max(w, g.measureText(line.text).width + (line.bold ? 0 : 16));
      }
      g.font = `800 ${narrow ? 17 : 19}px ${th.font}`;
      w = Math.max(w, g.measureText(head).width);
      const lineH = size + 9;
      const boxW = Math.min(surface.width - 20, w + 30);
      const boxH = (narrow ? 38 : 42) + lines.length * lineH;
      g.fillStyle = th.dark ? 'rgba(15,20,30,0.84)' : 'rgba(255,255,255,0.9)';
      roundRect(g, 10, 10, boxW, boxH, 12);
      g.fill();
      g.strokeStyle = th.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
      g.lineWidth = 1;
      g.stroke();
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillStyle = th.text;
      g.font = `800 ${narrow ? 17 : 19}px ${th.font}`;
      const top = narrow ? 34 : 37;
      g.fillText(head, 24, top);
      lines.forEach((line, i) => {
        const y = top + 6 + (i + 1) * lineH - 4;
        if (line.color) {
          g.fillStyle = line.color;
          roundRect(g, 24, y - size + 2, 9, 9, 2);
          g.fill();
        }
        g.fillStyle = th.text;
        g.font = `${line.bold ? 800 : 600} ${size}px ${th.font}`;
        g.fillText(line.text, line.color ? 40 : 24, y);
      });
      g.restore();
    }

    rebuild();

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') {
          task = solidTask(p.q, seededRandom(p.q * 7919 + 101));
          taskState = null;
        }
        if (changed.has('ans') && taskState && !taskState.ok) taskState = null;
        if (['base', 'n', 'r', 'g', 'hg', 'q', 'mode'].some((k) => changed.has(k)) || source === 'init' || source === 'replace') rebuild();
        if (changed.has('roll') && source !== 'sim') {
          rollAnim = null;
          rollShown = p.roll / 100;
        }
        if (changed.has('mode') || source === 'init' || source === 'replace') {
          const v = VIEWS[p.mode === 'oberflaeche' ? 'oberflaeche' : 'volumen'];
          view.setInitialView(v);
          if (source === 'input' || source === 'replace') view.animateTo(v, 700);
          else if (source === 'init') view.setCamera(v);
          stackAnim = null;
        }
        if (changed.has('h') || changed.has('base')) stackAnim = null;
        syncActions();
        updateReadouts();
      },

      action(id) {
        if (id === 'check') {
          taskState = checkSolid(task, p.ans);
          updateReadouts();
          const fb = feedback();
          if (fb) ctx.announce(fb.text);
          ctx.requestRender();
          return;
        }
        if (id === 'newq') {
          ctx.set({ q: p.q >= 999 ? 1 : p.q + 1, ans: '' });
          return;
        }
        if (id === 'stack') {
          stackAnim = { tween: new Tween(slices(HEIGHT()).length * 420 + 600, ease.linear).play() };
          stackStart = performance.now();
          if (!stackAnim.tween.running) stackAnim = null;
        } else if (id === 'roll') {
          const from = rollShown >= 1 ? 0 : rollShown;
          rollAnim = { tween: new Tween(6500 * Math.max(0.2, 1 - from), ease.linear).play(), from, to: 1 };
          syncActions();
        }
        ctx.requestRender();
      },

      resetView: () => view.resetView(false),

      render() {
        if (stackAnim && !stackAnim.tween.running) stackAnim = null;
        render();
      },

      destroy: () => surface.destroy(),
    };
  },
});
