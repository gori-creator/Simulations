import { defineSimulation, ease, Plot, Surface, Tween, withAlpha } from '../../../sim-core';
import { polygonBounds, rearrangedWidth, sectorTarget } from './model';

const L = (de: string, en: string) => ({ de, en });
type Point = [number, number];

/**
 * Kreisumfang, Kreisfläche und die Zahl π: Ein Rad rollt einmal ab, Sektoren
 * einer Kreisfläche werden zu einem „Rechteck“ umgelegt, und Vielecke schließen
 * π ein wie bei Archimedes.
 */
export default defineSimulation({
  id: 'kreiszahl-pi',
  layout: { aspect: 1.75, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'umfang', label: L('Umfang: Rad abrollen', 'Circumference: roll a wheel') },
        { value: 'flaeche', label: L('Fläche: Sektoren umlegen', 'Area: rearrange sectors') },
        { value: 'archimedes', label: L('π eingrenzen (Archimedes)', 'Bounding π (Archimedes)') },
      ],
      default: 'umfang',
    },
    { key: 'd', type: 'number', label: L('Durchmesser d', 'Diameter d'), min: 1, max: 4, step: 0.5, default: 2, unit: 'cm' },
    { key: 'n', type: 'number', label: L('Anzahl der Sektoren', 'Number of sectors'), min: 4, max: 48, step: 2, default: 12, visibleIf: (v) => v.mode === 'flaeche' },
    { key: 'm', type: 'number', label: L('Eckenzahl der Vielecke', 'Number of polygon corners'), min: 3, max: 96, step: 1, default: 6, visibleIf: (v) => v.mode === 'archimedes' },
  ],
  actions: [
    { id: 'roll', label: L('Abrollen', 'Roll'), primary: true, visibleIf: (v) => v.mode === 'umfang' },
    { id: 'arrange', label: L('Umlegen', 'Rearrange'), primary: true, visibleIf: (v) => v.mode === 'flaeche' },
    { id: 'double', label: L('Eckenzahl verdoppeln', 'Double the corners'), primary: true, visibleIf: (v) => v.mode === 'archimedes' },
  ],
  images: { wheel: 'rad.webp', pizza: 'pizza.webp' },
  readouts: [
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
  ],
  strings: {
    de: {
      canvas: 'Kreis, dessen Umfang abgerollt bzw. dessen Fläche umgelegt wird',
      roll: 'Abrollen',
      back: 'Zurück',
      arrange: 'Umlegen',
      undo: 'Zurücklegen',
      halfU: '≈ π · r (halber Umfang)',
      circumference: 'U = π · d ≈ {u} cm',
      inscribed: 'einbeschrieben',
      circumscribed: 'umbeschrieben',
    },
    en: {
      canvas: 'A circle whose circumference is rolled out or whose area is rearranged',
      roll: 'Roll',
      back: 'Back',
      arrange: 'Rearrange',
      undo: 'Put back',
      halfU: '≈ π · r (half the circumference)',
      circumference: 'C = π · d ≈ {u} cm',
      inscribed: 'inscribed',
      circumscribed: 'circumscribed',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const plot = new Plot(surface, { x: [-1, 8], y: [-1.5, 3], pan: false, zoom: false, controls: false });

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
      } else {
        plot.setRange([-1.35 * rr, 1.35 * rr], [-1.25 * rr, 1.25 * rr]);
      }
    }

    function syncActions(): void {
      ctx.setAction('roll', { label: ctx.t(to > 0.5 ? 'back' : 'roll') });
      ctx.setAction('arrange', { label: ctx.t(to > 0.5 ? 'undo' : 'arrange') });
      ctx.setAction('double', { enabled: p.m * 2 <= 96 });
    }

    function updateReadouts(): void {
      const rr = r();
      if (p.mode === 'umfang') {
        ctx.readout('formula', { html: `<var>U</var> = π · <var>d</var> = 2π · <var>r</var>` });
        ctx.readout('value', `U = π · ${fmt.num(p.d, 1)} cm ≈ ${fmt.num(Math.PI * p.d, 3)} cm`);
        ctx.readout('approx', `U : d = π ≈ 3,14159… (${ctx.lang === 'de' ? 'etwas mehr als 3 Durchmesser' : 'a little more than 3 diameters'})`.replace('3,14159', fmt.num(Math.PI, 5)));
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

    let lastWide = wide();

    return {
      update(changed) {
        if (changed.has('mode') || changed.has('d') || changed.has('n')) {
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
        if (id === 'double') {
          if (p.m * 2 > 96) return;
          prevM = p.m;
          morph.play();
          ctx.set({ m: p.m * 2 });
          return;
        }
        from = progress();
        to = to > 0.5 ? 0 : 1;
        tween.play(id === 'roll' ? 3600 : 3000);
        syncActions();
      },

      render() {
        if (wide() !== lastWide) {
          lastWide = wide();
          fit();
        }
        const u = progress();
        plot.begin();
        if (p.mode === 'umfang') drawWheel(u);
        else if (p.mode === 'flaeche') drawSectors(u);
        else drawPolygons();
        plot.end();
        if (tween.running || morph.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
