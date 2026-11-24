import { defineSimulation, ease, Plot, roundRect, seededRandom, softShadow, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  checkCircleAnswer,
  circleTask,
  OBJECTS,
  polygonBounds,
  rearrangedWidth,
  sectorTarget,
  slopeThroughOrigin,
  type CircleQuantity,
  type CircleTask,
  type ObjectId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Point = [number, number];

/**
 * Kreisumfang, Kreisfläche und die Zahl π: Ein Rad rollt einmal ab, Sektoren
 * einer Kreisfläche werden zu einem „Rechteck“ umgelegt, Vielecke schließen
 * π ein wie bei Archimedes, Alltagsgegenstände werden mit dem Maßband
 * vermessen, und Übungsaufgaben fragen Umfang, Fläche, Durchmesser und Radius ab.
 */
export default defineSimulation({
  id: 'kreiszahl-pi',
  // Schmal etwas flacher: Die Abrollstrecke ist breit, sonst bliebe auf dem Handy viel Fläche leer
  layout: { aspect: 1.75, aspectNarrow: 1.15 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'umfang', label: L('Umfang: Rad abrollen', 'Circumference: roll a wheel') },
        { value: 'flaeche', label: L('Fläche: Sektoren umlegen', 'Area: rearrange sectors') },
        { value: 'archimedes', label: L('π eingrenzen (Archimedes)', 'Bounding π (Archimedes)') },
        { value: 'messen', label: L('Messen im Alltag', 'Measuring everyday objects') },
        { value: 'ueben', label: L('Üben: Kreise berechnen', 'Practice: circle calculations') },
      ],
      default: 'umfang',
    },
    { key: 'd', type: 'number', label: L('Durchmesser d', 'Diameter d'), min: 1, max: 4, step: 0.5, default: 2, unit: 'cm', visibleIf: (v) => v.mode !== 'messen' && v.mode !== 'ueben' },
    { key: 'n', type: 'number', label: L('Anzahl der Sektoren', 'Number of sectors'), min: 4, max: 48, step: 2, default: 12, visibleIf: (v) => v.mode === 'flaeche' },
    { key: 'm', type: 'number', label: L('Eckenzahl der Vielecke', 'Number of polygon corners'), min: 3, max: 96, step: 1, default: 6, visibleIf: (v) => v.mode === 'archimedes' },
    {
      key: 'obj',
      type: 'choice',
      label: L('Gegenstand', 'Object'),
      options: [
        { value: 'knopf', label: L('Knopf', 'Button') },
        { value: 'dose', label: L('Dose', 'Tin can') },
        { value: 'tasse', label: L('Tasse', 'Cup') },
        { value: 'cd', label: L('CD', 'CD') },
        { value: 'teller', label: L('Teller', 'Plate') },
        { value: 'uhr', label: L('Wanduhr', 'Wall clock') },
      ],
      default: 'knopf',
      visibleIf: (v) => v.mode === 'messen',
    },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'ans', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 20, placeholder: L('z. B. 12,6', 'e.g. 12.6'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) => {
    if (v.mode === 'ueben') return L('Tipp: Rechne mit Stift und Taschenrechner, trag das Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.', 'Tip: Work it out with pen and calculator, enter the result under “Your answer” and tap “Check”.');
    if (v.mode === 'messen') return L('Tipp: Wickle das Maßband ab und lies den Umfang ab. Mit „Nächster Gegenstand“ kommt ein weiterer Punkt ins Diagramm.', 'Tip: Unwind the tape measure and read off the circumference. “Next object” adds another point to the chart.');
    return null;
  },
  actions: [
    { id: 'roll', label: L('Abrollen', 'Roll'), primary: true, visibleIf: (v) => v.mode === 'umfang' },
    { id: 'arrange', label: L('Umlegen', 'Rearrange'), primary: true, visibleIf: (v) => v.mode === 'flaeche' },
    { id: 'double', label: L('Eckenzahl verdoppeln', 'Double the corners'), primary: true, visibleIf: (v) => v.mode === 'archimedes' },
    { id: 'wrap', label: L('Maßband abwickeln', 'Unwind the tape'), primary: true, visibleIf: (v) => v.mode === 'messen' },
    { id: 'next', label: L('Nächster Gegenstand', 'Next object'), visibleIf: (v) => v.mode === 'messen' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'newq', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  images: { wheel: 'rad.webp', pizza: 'pizza.webp' },
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'verdict', label: L('Rückmeldung', 'Feedback') },
    { key: 'formula', label: L('Formel', 'Formula'), spoiler: true },
    { key: 'value', label: L('Mit Zahlen', 'With numbers'), spoiler: true },
    { key: 'approx', label: L('Annäherung', 'Approximation') },
  ],
  presets: [
    { id: 'roll', label: L('Rad abrollen', 'Roll a wheel'), values: {} },
    { id: 'area', label: L('12 Sektoren', '12 sectors'), values: { mode: 'flaeche' } },
    { id: 'area48', label: L('48 Sektoren', '48 sectors'), values: { mode: 'flaeche', n: 48 } },
    { id: 'archimedes', label: L('Sechseck', 'Hexagon'), values: { mode: 'archimedes' } },
    { id: 'archimedes96', label: L('96-Eck wie Archimedes', '96-gon like Archimedes'), values: { mode: 'archimedes', m: 96 } },
    { id: 'measure', label: L('Messen im Alltag', 'Measuring objects'), values: { mode: 'messen', obj: 'knopf' } },
    { id: 'quiz', label: L('Üben', 'Practice'), values: { mode: 'ueben', q: 1, ans: '' } },
  ],
  strings: {
    de: {
      canvas: 'Kreis, dessen Umfang abgerollt, dessen Fläche umgelegt oder der zwischen zwei Vielecke eingeschlossen wird',
      roll: 'Abrollen',
      back: 'Zurück',
      arrange: 'Umlegen',
      undo: 'Zurücklegen',
      halfU: '≈ π · r (halber Umfang)',
      circumference: 'U = π · d ≈ {u} cm',
      inscribed: 'einbeschrieben',
      circumscribed: 'umbeschrieben',
      unwind: 'Maßband abwickeln',
      rewind: 'Aufwickeln',
      knopf: 'Knopf',
      dose: 'Dose',
      tasse: 'Tasse',
      cd: 'CD',
      teller: 'Teller',
      uhr: 'Wanduhr',
      measured: 'U ≈ {u} cm',
      fit: 'Ausgleichsgerade: U ≈ {k} · d',
      fitLabel: 'U ≈ {k} · d',
      ratio: 'U : d = {u} : {d} ≈ {r}',
      objects: '{n} Gegenstände gemessen',
      qText: 'Aufgabe {q}: Ein Kreis hat {given}. Berechne {find}.',
      qRound: 'Runde auf eine Nachkommastelle.',
      gd: 'den Durchmesser d = {v}\u00a0cm',
      gr: 'den Radius r = {v}\u00a0cm',
      gU: 'den Umfang U = {v}\u00a0cm',
      gA: 'den Flächeninhalt A = {v}\u00a0cm²',
      fd: 'den Durchmesser d',
      fr: 'den Radius r',
      fU: 'den Umfang U',
      fA: 'den Flächeninhalt A',
      okMsg: 'Richtig! {x} ≈ {v}',
      noMsg: 'Noch nicht. Tipp: {hint}',
      emptyMsg: 'Trag dein Ergebnis unter „Deine Antwort“ ein und tippe auf „Prüfen“.',
      wait: 'Deine Antwort fehlt noch.',
      h_dU: 'U = π · d',
      h_rU: 'U = 2 · π · r',
      h_rA: 'A = π · r²',
      h_dA: 'Erst r = d : 2, dann A = π · r².',
      h_Ud: 'd = U : π',
      h_Ar: 'r = √(A : π)',
    },
    en: {
      canvas: 'A circle whose circumference is rolled out, whose area is rearranged or which is trapped between two polygons',
      roll: 'Roll',
      back: 'Back',
      arrange: 'Rearrange',
      undo: 'Put back',
      halfU: '≈ π · r (half the circumference)',
      circumference: 'C = π · d ≈ {u} cm',
      inscribed: 'inscribed',
      circumscribed: 'circumscribed',
      unwind: 'Unwind the tape',
      rewind: 'Wind up',
      knopf: 'Button',
      dose: 'Tin can',
      tasse: 'Cup',
      cd: 'CD',
      teller: 'Plate',
      uhr: 'Wall clock',
      measured: 'C ≈ {u} cm',
      fit: 'Line of best fit: C ≈ {k} · d',
      fitLabel: 'C ≈ {k} · d',
      ratio: 'C : d = {u} : {d} ≈ {r}',
      objects: '{n} objects measured',
      qText: 'Task {q}: A circle has {given}. Find {find}.',
      qRound: 'Round to one decimal place.',
      gd: 'the diameter d = {v}\u00a0cm',
      gr: 'the radius r = {v}\u00a0cm',
      gU: 'the circumference C = {v}\u00a0cm',
      gA: 'the area A = {v}\u00a0cm²',
      fd: 'the diameter d',
      fr: 'the radius r',
      fU: 'the circumference C',
      fA: 'the area A',
      okMsg: 'Correct! {x} ≈ {v}',
      noMsg: 'Not yet. Hint: {hint}',
      emptyMsg: 'Enter your result under “Your answer” and tap “Check”.',
      wait: 'Your answer is still missing.',
      h_dU: 'C = π · d',
      h_rU: 'C = 2 · π · r',
      h_rA: 'A = π · r²',
      h_dA: 'First r = d : 2, then A = π · r².',
      h_Ud: 'd = C : π',
      h_Ar: 'r = √(A : π)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    /** Höhe der Aufgabenkarte über der Zeichnung (nur beim Üben). */
    const stripH = () => (p.mode === 'ueben' ? (surface.width < 520 ? 108 : 84) : 0);
    /** Höhe des oberen Teils (Gegenstand mit Maßband) beim Messen; darunter das Diagramm. */
    const topH = (h: number) => Math.round(h * (surface.width < 520 ? 0.38 : 0.44));
    const plot = new Plot(surface, {
      x: [-1, 8],
      y: [-1.5, 3],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        if (p.mode === 'messen') return { x: 0, y: 0, w, h: topH(h) };
        const s = stripH();
        return { x: 0, y: s, w, h: h - s };
      },
    });
    const U_NAME = ctx.lang === 'de' ? 'U' : 'C';
    const chart = new Plot(surface, {
      x: [-4, 33],
      y: [-9, 112],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      xAxis: { label: 'd in cm' },
      yAxis: { label: `${U_NAME} in cm` },
      region: (w, h) => {
        const t = topH(h);
        return { x: 0, y: t, w, h: h - t };
      },
    });
    let task: CircleTask = circleTask(1, seededRandom(1));
    let taskState: { ok: boolean; got: number | null } | null = null;
    const pop = new Tween(450, ease.outBack);

    const tween = new Tween(3600, ease.inOutCubic);
    let from = 0;
    let to = 0;
    const progress = () => from + (to - from) * tween.value;
    let prevM = p.m;
    const morph = new Tween(900, ease.outCubic);

    const wide = () => surface.width / Math.max(1, surface.height) > 1.25;
    const r = () => p.d / 2;

    function fit(): void {
      const rr = r();
      if (p.mode === 'umfang') {
        plot.setRange([-rr - 0.4, Math.PI * p.d + rr + 0.4], [-1.2 * rr - 0.4, p.d + 0.4]);
      } else if (p.mode === 'flaeche') {
        const width = rearrangedWidth(p.n, rr) + 2 * rr * Math.sin(Math.PI / p.n);
        if (wide()) plot.setRange([-2.7 * rr, width + 0.4 * rr], [-0.9 * rr, 1.6 * rr]);
        else plot.setRange([-0.55 * rr, width + 0.3 * rr], [-0.9 * rr, 3.4 * rr]);
      } else if (p.mode === 'messen') {
        const o = current();
        plot.setRange([-0.62 * o.d, o.u + 0.12 * o.d], [-0.34 * o.d, 1.14 * o.d]);
      } else if (p.mode === 'ueben') {
        plot.setRange([-1.5, 1.5], [-1.3, 1.3]);
      } else {
        plot.setRange([-1.35 * rr, 1.35 * rr], [-1.25 * rr, 1.25 * rr]);
      }
    }

    const objIndex = () => Math.max(0, OBJECTS.findIndex((o) => o.id === p.obj));
    const current = () => OBJECTS[objIndex()]!;
    /** Bisher gemessene Gegenstände: alle in der Liste bis einschließlich des gewählten. */
    const measuredSoFar = () => OBJECTS.slice(0, objIndex() + 1);

    function syncActions(): void {
      ctx.setAction('roll', { label: ctx.t(to > 0.5 ? 'back' : 'roll') });
      ctx.setAction('arrange', { label: ctx.t(to > 0.5 ? 'undo' : 'arrange') });
      ctx.setAction('double', { enabled: p.m * 2 <= 96 });
      ctx.setAction('wrap', { label: ctx.t(to > 0.5 ? 'rewind' : 'unwind') });
    }

    function updateReadouts(): void {
      const rr = r();
      ctx.readout('task', null);
      ctx.readout('verdict', null);
      if (p.mode === 'messen') {
        const o = current();
        const pts = measuredSoFar();
        ctx.readout('formula', tr('ratio', { u: fmt.num(o.u, 1), d: fmt.num(o.d, 1), r: fmt.num(o.u / o.d, 3) }));
        ctx.readout('value', pts.length > 1 ? `${tr('fit', { k: fmt.num(slopeThroughOrigin(pts), 3) })} (${tr('objects', { n: pts.length })})` : tr('objects', { n: 1 }));
        ctx.readout('approx', `π ≈ ${fmt.num(Math.PI, 5)}…`);
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('formula', null);
        ctx.readout('value', null);
        ctx.readout('approx', null);
        ctx.readout('task', taskText());
        const fb = feedback();
        ctx.readout('verdict', fb ? fb.text : ctx.t('emptyMsg'));
        return;
      }
      if (p.mode === 'umfang') {
        // Im Englischen heißt der Umfang C (circumference), im Deutschen U.
        const U = ctx.lang === 'de' ? 'U' : 'C';
        ctx.readout('formula', { html: `<var>${U}</var> = π · <var>d</var> = 2π · <var>r</var>` });
        ctx.readout('value', `${U} = π · ${fmt.num(p.d, 1)} cm ≈ ${fmt.num(Math.PI * p.d, 3)} cm`);
        ctx.readout('approx', `${U} : d = π ≈ ${fmt.num(Math.PI, 5)}… (${ctx.lang === 'de' ? 'etwas mehr als 3 Durchmesser' : 'a little more than 3 diameters'})`);
      } else if (p.mode === 'flaeche') {
        ctx.readout('formula', { html: `<var>A</var> = π · <var>r</var>²` });
        ctx.readout('value', `A = π · (${fmt.num(rr, 2)} cm)² ≈ ${fmt.num(Math.PI * rr * rr, 3)} cm²`);
        const w = rearrangedWidth(p.n, rr);
        ctx.readout('approx', `${p.n} ${ctx.lang === 'de' ? 'Sektoren: Breite' : 'sectors: width'} ≈ ${fmt.num(w, 4)} cm, π · r ≈ ${fmt.num(Math.PI * rr, 4)} cm`);
      } else {
        const b = polygonBounds(p.m);
        ctx.readout('formula', { html: `<var>m</var> · sin(180°/<var>m</var>) &lt; π &lt; <var>m</var> · tan(180°/<var>m</var>)` });
        ctx.readout('value', `${fmt.num(b.lower, 5)} < π < ${fmt.num(b.upper, 5)}`);
        const rows = [6, 12, 24, 48, 96]
          .map((m) => {
            const q = polygonBounds(m);
            return `<tr${m === p.m ? ' class="is-current"' : ''}><td>${m}</td><td>${fmt.num(q.lower, 5)}</td><td>${fmt.num(q.upper, 5)}</td></tr>`;
          })
          .join('');
        ctx.readout('approx', { html: `<table class="mini-table"><tr><th><var>m</var></th><th>${ctx.lang === 'de' ? 'untere' : 'lower'}</th><th>${ctx.lang === 'de' ? 'obere Schranke' : 'upper bound'}</th></tr>${rows}</table>` });
      }
    }

    /* ---------- Umfang ---------- */
    function drawWheel(u: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const rr = r();
      const U = Math.PI * p.d;
      const xc = U * u;
      const theta = 2 * Math.PI * u;
      // Boden und abgerollter Umfang
      plot.segment([-0.6 * rr, 0], [U + 0.5, 0], { color: theme.axis, width: 2 });
      if (u > 0) plot.segment([0, 0], [xc, 0], { color: theme.series[1], width: 6 });
      // Durchmesser-Maßstäbe unter dem Boden
      for (let k = 0; k < 3; k++) {
        const y = -0.35 * rr - 0.15;
        plot.segment([k * p.d, y], [(k + 1) * p.d, y], { color: k % 2 ? theme.series[0] : withAlpha(theme.series[0]!, 0.55), width: 8 });
        plot.text((k + 0.5) * p.d, y, 'd', { color: theme.series[0], size: 14, math: true, weight: 'bold', offset: [0, 16] });
      }
      const y2 = -0.35 * rr - 0.15;
      plot.segment([3 * p.d, y2], [U, y2], { color: theme.series[3], width: 8 });
      plot.text(3 * p.d + (U - 3 * p.d) / 2, y2, `${fmt.num(Math.PI - 3, 2)} d`, { color: theme.series[3], size: 12, weight: 'bold', offset: [0, 16] });
      // Rad
      const [cx, cy] = plot.toPx(xc, rr);
      const rp = rr * plot.scale.x;
      const img = ctx.images.get('wheel');
      g.save();
      g.translate(cx, cy);
      g.rotate(theta);
      if (img) {
        g.drawImage(img, -rp, -rp, rp * 2, rp * 2);
      } else {
        g.fillStyle = theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(30,40,60,0.05)';
        g.beginPath();
        g.arc(0, 0, rp, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = theme.dark ? '#c8ced8' : '#4a5160';
        g.lineWidth = 2;
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4;
          g.beginPath();
          g.moveTo(Math.cos(a) * rp * 0.12, Math.sin(a) * rp * 0.12);
          g.lineTo(Math.cos(a) * rp * 0.9, Math.sin(a) * rp * 0.9);
          g.stroke();
        }
        g.lineWidth = Math.max(4, rp * 0.1);
        g.beginPath();
        g.arc(0, 0, rp * 0.94, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = theme.dark ? '#c8ced8' : '#4a5160';
        g.beginPath();
        g.arc(0, 0, rp * 0.12, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      // noch nicht abgerollter Teil des Umfangs (rot)
      if (u < 1) plot.arc(xc, rr, rr, -Math.PI / 2, (3 * Math.PI) / 2 - theta, { stroke: theme.series[1], width: 6 });
      // Startmarke (Ventil)
      const mark = -Math.PI / 2 - theta;
      plot.point(xc + rr * Math.cos(mark), rr + rr * Math.sin(mark), { color: theme.series[1], radius: 6 });
      // Durchmesser im Rad
      if (u === 0) {
        plot.segment([xc - rr, rr], [xc + rr, rr], { color: theme.series[0], width: 3 });
        plot.text(xc, rr, 'd', { color: theme.series[0], size: 16, math: true, weight: 'bold', offset: [0, -14] });
      }
      if (u > 0.999) plot.text(U / 2, 0, ctx.t('circumference').replace('{u}', fmt.num(U, 2)), { color: theme.series[1], size: 15, weight: 'bold', offset: [0, -16] });
    }

    /* ---------- Fläche ---------- */
    function drawSectors(u: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const rr = r();
      const n = p.n;
      const delta = (2 * Math.PI) / n;
      const isWide = wide();
      const center: Point = isWide ? [-1.45 * rr, 0.35 * rr] : [rearrangedWidth(n, rr) / 2, 2.3 * rr];
      const origin: Point = [rr * Math.sin(delta / 2), 0];
      const img = ctx.images.get('pizza');
      // Ziel-Umriss (Rechteck π·r × r) als Hilfe
      const w = rearrangedWidth(n, rr);
      if (u > 0.98) {
        plot.polygon(
          [
            [origin[0] - rr * Math.sin(delta / 2), 0],
            [origin[0] - rr * Math.sin(delta / 2) + Math.PI * rr, 0],
            [origin[0] - rr * Math.sin(delta / 2) + Math.PI * rr, rr],
            [origin[0] - rr * Math.sin(delta / 2), rr],
          ],
          { stroke: theme.text, width: 1.5, dash: [6, 5] },
        );
      }
      for (let i = 0; i < n; i++) {
        const local = Math.min(1, Math.max(0, (u * 1.6 - (i / n) * 0.6) / 1));
        const e = ease.inOutCubic(local);
        const target = sectorTarget(i, n, rr);
        const apex: Point = [center[0] + (origin[0] + target.apex[0] - center[0]) * e, center[1] + (origin[1] + target.apex[1] - center[1]) * e];
        const rot = target.rotation * e;
        const pts: Point[] = [apex];
        for (let k = 0; k <= 10; k++) {
          const a = i * delta + (delta * k) / 10 + rot;
          pts.push([apex[0] + rr * Math.cos(a), apex[1] + rr * Math.sin(a)]);
        }
        const px = pts.map(([x, y]) => plot.toPx(x, y));
        g.save();
        g.beginPath();
        px.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        if (img) {
          g.save();
          g.clip();
          const [ax, ay] = plot.toPx(apex[0], apex[1]);
          const rp = rr * plot.scale.x;
          g.translate(ax, ay);
          g.rotate(-rot);
          g.drawImage(img, -rp, -rp, rp * 2, rp * 2);
          g.restore();
          g.strokeStyle = 'rgba(255,255,255,0.9)';
        } else {
          g.fillStyle = withAlpha(i % 2 === 0 ? theme.series[0]! : theme.series[3]!, 0.55);
          g.fill();
          g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.95)';
        }
        g.lineWidth = 1.5;
        g.stroke();
        g.restore();
      }
      if (u > 0.98) {
        const x0 = origin[0] - rr * Math.sin(delta / 2);
        plot.segment([x0, -0.22 * rr], [x0 + w, -0.22 * rr], { color: theme.series[1], width: 2.5 });
        plot.text(x0 + w / 2, -0.22 * rr, ctx.t('halfU'), { color: theme.series[1], size: 14, weight: 'bold', offset: [0, 16] });
        plot.segment([x0 - 0.12 * rr, 0], [x0 - 0.12 * rr, rr], { color: theme.series[2], width: 2.5 });
        plot.text(x0 - 0.12 * rr, rr / 2, 'r', { color: theme.series[2], size: 16, math: true, weight: 'bold', offset: [-12, 0], align: 'right' });
      } else if (u < 0.02) {
        plot.segment(center, [center[0] + rr, center[1]], { color: theme.series[2], width: 2.5 });
        plot.text(center[0] + rr / 2, center[1], 'r', { color: theme.series[2], size: 16, math: true, weight: 'bold', offset: [0, -12] });
      }
    }

    /* ---------- Archimedes ---------- */
    function drawPolygons(): void {
      const theme = ctx.theme;
      const rr = r();
      const m = p.m;
      plot.circle(0, 0, rr, { stroke: theme.text, width: 2.5, fill: theme.text, alpha: 0.04 });
      plot.circle(0, 0, rr, { stroke: theme.text, width: 2.5 });
      const t = morph.value;
      // einbeschrieben (beim Verdoppeln wachsen die neuen Ecken aus den Seitenmitten)
      const inner: Point[] = [];
      const fresh = morph.running && m === prevM * 2;
      for (let k = 0; k < m; k++) {
        const a = Math.PI / 2 + (2 * Math.PI * k) / m;
        let rad = rr;
        if (fresh && k % 2 === 1) rad = rr * (Math.cos(Math.PI / prevM) + (1 - Math.cos(Math.PI / prevM)) * t);
        inner.push([rad * Math.cos(a), rad * Math.sin(a)]);
      }
      const outerR = rr / Math.cos(Math.PI / m);
      const outer: Point[] = Array.from({ length: m }, (_, k) => {
        const a = Math.PI / 2 + (2 * Math.PI * k) / m;
        return [outerR * Math.cos(a), outerR * Math.sin(a)];
      });
      plot.polygon(outer, { stroke: theme.series[1], width: 2.5, fill: theme.series[1], alpha: 0.08 });
      plot.polygon(outer, { stroke: theme.series[1], width: 2.5 });
      plot.polygon(inner, { stroke: theme.series[0], width: 2.5, fill: theme.series[0], alpha: 0.12 });
      plot.polygon(inner, { stroke: theme.series[0], width: 2.5 });
      plot.segment([0, 0], [0, rr], { color: theme.muted, width: 1.5, dash: [4, 4] });
      plot.text(0, rr / 2, 'r', { color: theme.muted, size: 14, math: true, offset: [8, 0], align: 'left' });
      const b = polygonBounds(m);
      const rect = plot.rect;
      plot.textPx(rect.x + 14, rect.y + 22, `${ctx.t('inscribed')}: ${fmt.num(b.lower, 4)}`, { color: theme.series[0], size: 14, weight: 'bold', align: 'left' });
      plot.textPx(rect.x + 14, rect.y + 44, `${ctx.t('circumscribed')}: ${fmt.num(b.upper, 4)}`, { color: theme.series[1], size: 14, weight: 'bold', align: 'left' });
      plot.textPx(rect.x + 14, rect.y + 66, `π ≈ ${fmt.num(Math.PI, 4)}`, { color: theme.text, size: 14, weight: 'bold', align: 'left' });
    }

    /* ---------- Messen im Alltag ---------- */

    /** Draufsicht eines Gegenstands (Mittelpunkt und Radius in Pixeln). */
    function drawObject(id: ObjectId, cx: number, cy: number, rp: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const ink = theme.text;
      const disc = (rad: number, fill: string | null, stroke: string | null, width = 1.5) => {
        g.beginPath();
        g.arc(cx, cy, Math.max(0.5, rad), 0, Math.PI * 2);
        if (fill) {
          g.fillStyle = fill;
          g.fill();
        }
        if (stroke) {
          g.strokeStyle = stroke;
          g.lineWidth = width;
          g.stroke();
        }
      };
      g.save();
      if (id === 'knopf') {
        disc(rp, withAlpha(theme.series[0]!, 0.55), theme.series[0]!, 2);
        disc(rp * 0.72, null, withAlpha(ink, 0.35), 1.2);
        for (let k = 0; k < 4; k++) {
          const a = Math.PI / 4 + (k * Math.PI) / 2;
          g.beginPath();
          g.arc(cx + Math.cos(a) * rp * 0.3, cy + Math.sin(a) * rp * 0.3, rp * 0.11, 0, Math.PI * 2);
          g.fillStyle = theme.bg;
          g.fill();
        }
      } else if (id === 'dose') {
        disc(rp, withAlpha(theme.muted, 0.35), withAlpha(ink, 0.7), 2);
        disc(rp * 0.9, withAlpha(theme.muted, 0.2), withAlpha(ink, 0.45), 1.2);
        disc(rp * 0.82, null, withAlpha(ink, 0.25), 1);
        // Aufreißlasche
        g.beginPath();
        g.ellipse(cx, cy - rp * 0.45, rp * 0.16, rp * 0.28, 0, 0, Math.PI * 2);
        g.strokeStyle = withAlpha(ink, 0.55);
        g.lineWidth = 1.5;
        g.stroke();
        disc(rp * 0.05, withAlpha(ink, 0.55), null);
      } else if (id === 'tasse') {
        // Henkel oben links, damit er das Maßband nicht stört
        g.beginPath();
        const a = (-3 * Math.PI) / 4;
        g.ellipse(cx + Math.cos(a) * rp * 1.05, cy + Math.sin(a) * rp * 1.05, rp * 0.32, rp * 0.18, a, 0, Math.PI * 2);
        g.strokeStyle = withAlpha(theme.series[4]!, 0.8);
        g.lineWidth = Math.max(3, rp * 0.1);
        g.stroke();
        disc(rp, withAlpha(theme.series[4]!, 0.25), theme.series[4]!, 2);
        disc(rp * 0.84, withAlpha(theme.series[3]!, 0.55), withAlpha(ink, 0.3), 1);
        disc(rp * 0.3, withAlpha(theme.bg, 0.25), null);
      } else if (id === 'cd') {
        disc(rp, withAlpha(theme.muted, 0.18), withAlpha(ink, 0.55), 1.5);
        for (let k = 0; k < 6; k++) {
          g.beginPath();
          g.arc(cx, cy, rp * (0.4 + 0.1 * k), -0.6 + k * 0.5, 0.4 + k * 0.5);
          g.strokeStyle = withAlpha(theme.series[k % theme.series.length]!, 0.35);
          g.lineWidth = Math.max(2, rp * 0.06);
          g.stroke();
        }
        disc(rp * 0.3, withAlpha(theme.muted, 0.25), withAlpha(ink, 0.35), 1);
        disc(rp * 0.12, theme.bg, withAlpha(ink, 0.55), 1.2);
      } else if (id === 'teller') {
        disc(rp, theme.bg, withAlpha(ink, 0.6), 2);
        disc(rp * 0.66, withAlpha(theme.muted, 0.1), withAlpha(ink, 0.3), 1.2);
        disc(rp * 0.93, null, withAlpha(theme.series[5]!, 0.6), Math.max(2, rp * 0.03));
      } else {
        disc(rp, theme.bg, ink, Math.max(3, rp * 0.06));
        for (let k = 0; k < 12; k++) {
          const a = (k * Math.PI) / 6;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * rp * (k % 3 === 0 ? 0.74 : 0.8), cy + Math.sin(a) * rp * (k % 3 === 0 ? 0.74 : 0.8));
          g.lineTo(cx + Math.cos(a) * rp * 0.88, cy + Math.sin(a) * rp * 0.88);
          g.strokeStyle = ink;
          g.lineWidth = k % 3 === 0 ? 3 : 1.5;
          g.stroke();
        }
        g.lineCap = 'round';
        const hand = (a: number, len: number, w: number) => {
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(cx + Math.cos(a) * rp * len, cy + Math.sin(a) * rp * len);
          g.strokeStyle = ink;
          g.lineWidth = w;
          g.stroke();
        };
        hand(-Math.PI / 2 + (10.2 / 12) * 2 * Math.PI, 0.5, Math.max(3, rp * 0.06));
        hand(-Math.PI / 2 + (10 / 60) * 2 * Math.PI, 0.72, Math.max(2, rp * 0.04));
        disc(rp * 0.05, theme.series[1]!, null);
      }
      g.restore();
    }

    function drawMeasure(u: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const o = current();
      const rr = o.d / 2;
      const tape = theme.series[3]!;
      const [cx, cy] = plot.toPx(0, rr);
      const rp = rr * plot.scale.x;
      const band = Math.max(6, Math.min(12, rp * 0.14));
      drawObject(o.id, cx, cy, rp);
      // Durchmesser
      plot.segment([-rr, rr], [rr, rr], { color: theme.series[0], width: 2.5 });
      plot.text(0, rr, `d = ${fmt.num(o.d, 1)} cm`, { color: theme.series[0], size: 14, weight: 'bold', align: 'center', offset: [0, -14], halo: true });
      // noch aufgewickelter Teil des Maßbands (am Rand), abgewickelter Teil gerade nach rechts
      if (u < 1) plot.arc(0, rr, rr + band / 2 / plot.scale.x, -Math.PI / 2 - 2 * Math.PI * (1 - u), -Math.PI / 2, { stroke: tape, width: band });
      const len = o.u * u;
      if (len > 0) {
        const y = plot.py(0) + band / 2;
        const x0 = plot.px(0);
        const x1 = plot.px(len);
        g.save();
        g.fillStyle = tape;
        g.fillRect(x0, y - band / 2, x1 - x0, band);
        // Zentimeter-Striche, beschriftet alle 5 bzw. 10 cm
        const pxPerCm = plot.scale.x;
        const tick = pxPerCm >= 5 ? 1 : 5;
        const labelEvery = pxPerCm * 5 >= 26 ? 5 : 10;
        g.strokeStyle = withAlpha(theme.dark ? theme.bg : theme.text, 0.6);
        g.fillStyle = theme.text;
        g.font = `600 11px ${theme.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'top';
        for (let c = tick; c <= len + 1e-9; c += tick) {
          const x = plot.px(c);
          const major = c % labelEvery === 0;
          g.lineWidth = major ? 1.5 : 1;
          g.beginPath();
          g.moveTo(x, y - band / 2);
          g.lineTo(x, y - band / 2 + band * (major ? 0.8 : 0.45));
          g.stroke();
          if (major) g.fillText(fmt.num(c, 0), x, y + band / 2 + 3);
        }
        g.restore();
      }
      if (u > 0.999) {
        plot.point(o.u, 0, { color: theme.series[1], radius: 5 });
        plot.text(o.u, 0, tr('measured', { u: fmt.num(o.u, 1) }), { color: theme.series[1], size: 14, weight: 'bold', align: 'right', offset: [0, -16], halo: true });
      }
      // Name des Gegenstands
      const rect = plot.rect;
      plot.textPx(rect.x + rect.w - 12, rect.y + 20, ctx.t(o.id), { color: theme.text, size: 15, weight: 'bold', align: 'right' });
    }

    function drawChart(): void {
      const theme = ctx.theme;
      const pts = measuredSoFar();
      const o = current();
      chart.grid();
      chart.axes();
      if (pts.length > 1) {
        const k = slopeThroughOrigin(pts);
        chart.segment([0, 0], [33, 33 * k], { color: theme.series[2], width: 2.5 });
        chart.text(20, 20 * k, tr('fitLabel', { k: fmt.num(k, 2) }), { color: theme.series[2], size: 14, weight: 'bold', align: 'left', offset: [12, 14], halo: true });
      }
      for (const pt of pts) {
        const cur = pt.id === o.id;
        chart.point(pt.d, pt.u, { color: cur ? theme.series[1] : theme.series[0], radius: cur ? 7 : 5 });
      }
      const right = o.d > 20;
      chart.text(o.d, o.u, ctx.t(o.id), { color: theme.series[1], size: 13, weight: 'bold', align: right ? 'right' : 'left', offset: right ? [-12, 2] : [10, 10], halo: true });
    }

    /* ---------- Üben ---------- */

    const qName = (q: CircleQuantity) => (q === 'U' ? U_NAME : q);
    const unitOf = (q: CircleQuantity) => (q === 'A' ? 'cm²' : 'cm');

    function taskText(): string {
      const given = tr(`g${task.given}`, { v: fmt.num(task.value, 1) });
      return `${tr('qText', { q: p.q, given, find: ctx.t(`f${task.find}`) })} ${ctx.t('qRound')}`;
    }

    function feedback(): { text: string; color: string } | null {
      if (!taskState) return null;
      if (taskState.got === null) return { text: ctx.t('wait'), color: ctx.theme.muted };
      if (taskState.ok) return { text: tr('okMsg', { x: qName(task.find), v: `${fmt.num(task.answer, 2)} ${unitOf(task.find)}` }), color: ctx.theme.series[2]! };
      return { text: tr('noMsg', { hint: ctx.t(`h_${task.given}${task.find}`) }), color: ctx.theme.series[1]! };
    }

    function wrapText(textValue: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let line = '';
      for (const w of textValue.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = next;
      }
      if (line) lines.push(line);
      return lines;
    }

    function drawTaskCard(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r: Rect = { x: 8, y: 8, w: surface.width - 16, h: stripH() - 14 };
      g.save();
      softShadow(g, theme.dark, 10, 2);
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.fillStyle = theme.bg;
      g.fill();
      g.restore();
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.stroke();
      const fb = feedback();
      // so viele Zeilen, wie (neben der Rückmeldung) in die Karte passen
      const fits = (sz: number) => Math.floor((r.h - 16) / (sz * 1.3)) - (fb ? 1 : 0);
      let size = 15;
      let lines = wrapText(taskText(), r.w - 24, `normal ${size}px ${theme.font}`);
      while (lines.length > fits(size) && size > 11) {
        size--;
        lines = wrapText(taskText(), r.w - 24, `normal ${size}px ${theme.font}`);
      }
      const maxLines = Math.max(1, fits(size));
      lines = lines.slice(0, maxLines);
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `normal ${size}px ${theme.font}`;
      g.fillStyle = theme.text;
      let y = r.y + 10;
      for (const l of lines) {
        g.fillText(l, r.x + 12, y);
        y += size * 1.3;
      }
      if (fb) {
        g.font = `600 ${size}px ${theme.font}`;
        g.fillStyle = fb.color;
        g.fillText(wrapText(fb.text, r.w - 24, g.font)[0] ?? '', r.x + 12, y + 2);
      }
    }

    function drawQuiz(): void {
      const theme = ctx.theme;
      const solved = taskState?.ok === true;
      const known = (q: CircleQuantity) => q === task.given || solved;
      const value = (q: CircleQuantity) => (q === task.given ? fmt.num(task.value, 1) : fmt.num(task.answer, 2));
      const label = (q: CircleQuantity) => (known(q) ? `${qName(q)} ${q === task.given ? '=' : '≈'} ${value(q)} ${unitOf(q)}` : `${qName(q)} = ?`);
      const s = solved && pop.running ? 1 + 0.2 * Math.sin(Math.PI * Math.min(1, pop.value)) : 1;
      const show = (q: CircleQuantity) => q === task.given || q === task.find;
      // Fläche
      plot.circle(0, 0, 1, { fill: show('A') ? theme.series[0] : theme.text, alpha: show('A') ? (known('A') ? 0.28 : 0.12) : 0.05 });
      // Umfang
      plot.circle(0, 0, 1, {
        stroke: show('U') ? theme.series[1] : theme.text,
        width: show('U') ? 5 : 2,
        dash: show('U') && !known('U') ? [10, 7] : undefined,
      });
      plot.point(0, 0, { color: theme.text, radius: 3 });
      if (show('d')) {
        plot.segment([-1, 0], [1, 0], { color: theme.series[2], width: 3.5, dash: known('d') ? undefined : [8, 6] });
        plot.text(0, 0, label('d'), { color: theme.series[2], size: Math.round(16 * s), weight: 'bold', align: 'center', offset: [0, -16], halo: true });
      }
      if (show('r')) {
        plot.segment([0, 0], [Math.cos(-0.7), Math.sin(-0.7)], { color: theme.series[2], width: 3.5, dash: known('r') ? undefined : [8, 6] });
        plot.text(Math.cos(-0.7) / 2, Math.sin(-0.7) / 2, label('r'), { color: theme.series[2], size: Math.round(16 * s), weight: 'bold', align: 'left', offset: [12, 6], halo: true });
      }
      if (show('U')) plot.text(Math.cos(2.3) * 1.04, Math.sin(2.3) * 1.04, label('U'), { color: theme.series[1], size: Math.round(16 * s), weight: 'bold', align: 'right', offset: [-6, -6], halo: true });
      if (show('A')) plot.text(0, 0.45, label('A'), { color: theme.series[0], size: Math.round(16 * s), weight: 'bold', align: 'center', halo: true });
    }

    function newTask(): void {
      task = circleTask(p.q, seededRandom(p.q * 7919 + 17));
      taskState = null;
    }

    let lastWide = wide();

    return {
      update(changed, source) {
        if (changed.has('q') || source === 'init' || source === 'replace') newTask();
        if (changed.has('ans') && taskState && !taskState.ok) taskState = null;
        if (changed.has('mode') || changed.has('d') || changed.has('n') || changed.has('obj')) {
          from = 0;
          to = 0;
          tween.finish();
        }
        if (changed.has('m') && !morph.running) prevM = p.m;
        fit();
        syncActions();
        updateReadouts();
      },

      action(id) {
        if (id === 'check') {
          taskState = checkCircleAnswer(task, p.ans);
          pop.play();
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
        if (id === 'next') {
          ctx.set({ obj: OBJECTS[(objIndex() + 1) % OBJECTS.length]!.id });
          return;
        }
        if (id === 'double') {
          if (p.m * 2 > 96) return;
          prevM = p.m;
          morph.play();
          ctx.set({ m: p.m * 2 });
          return;
        }
        from = progress();
        to = to > 0.5 ? 0 : 1;
        tween.play(id === 'roll' ? 3600 : id === 'wrap' ? 2400 : 3000);
        syncActions();
      },

      render() {
        if (wide() !== lastWide) {
          lastWide = wide();
          fit();
        }
        plot.resize();
        chart.resize();
        fit();
        const u = progress();
        surface.begin();
        plot.begin();
        if (p.mode === 'umfang') drawWheel(u);
        else if (p.mode === 'flaeche') drawSectors(u);
        else if (p.mode === 'messen') drawMeasure(u);
        else if (p.mode === 'ueben') drawQuiz();
        else drawPolygons();
        plot.end();
        if (p.mode === 'messen') {
          chart.begin();
          drawChart();
          chart.end();
        }
        if (p.mode === 'ueben') drawTaskCard();
        if (tween.running || morph.running || pop.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
