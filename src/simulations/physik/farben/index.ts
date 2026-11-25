import { defineSimulation, roundRect, Surface, text } from '../../../sim-core';
import { additiveMix, colorName, filterPasses, prismDeviation, refractiveIndex, subtractiveMix, wavelengthToRgb, type FilterId, type Rgb } from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;

const rgbCss = ([r, g, b]: Rgb, a = 1) => `rgba(${Math.round(255 * r)},${Math.round(255 * g)},${Math.round(255 * b)},${a})`;

/**
 * Farben: weißes Licht am Prisma zerlegen, Farbfilter, additive (Licht) und
 * subtraktive (Filter, Farbstoffe) Farbmischung sowie Bildpunkte eines Bildschirms.
 */
export default defineSimulation({
  id: 'farben',
  layout: { aspect: 1.7, aspectNarrow: 0.9 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'prisma', label: L('Prisma und Filter', 'Prism and filter') },
        { value: 'add', label: L('Additive Mischung (Licht)', 'Additive mixing (light)') },
        { value: 'sub', label: L('Subtraktive Mischung (Filter, Farbe)', 'Subtractive mixing (filters, paint)') },
        { value: 'pixel', label: L('Bildschirm: Bildpunkte', 'Screen: pixels') },
      ],
      default: 'prisma',
    },
    {
      key: 'filter',
      type: 'choice',
      label: L('Farbfilter vor dem Schirm', 'Colour filter before the screen'),
      options: [
        { value: 'none', label: L('kein', 'none') },
        { value: 'red', label: L('Rot', 'red') },
        { value: 'green', label: L('Grün', 'green') },
        { value: 'blue', label: L('Blau', 'blue') },
        { value: 'cyan', label: L('Cyan', 'cyan') },
        { value: 'magenta', label: L('Magenta', 'magenta') },
        { value: 'yellow', label: L('Gelb', 'yellow') },
      ],
      default: 'none',
      visibleIf: (v) => v.mode === 'prisma',
    },
    { key: 'r', type: 'number', label: L('Rot', 'Red'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'add' || v.mode === 'pixel' },
    { key: 'g', type: 'number', label: L('Grün', 'Green'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'add' || v.mode === 'pixel' },
    { key: 'b', type: 'number', label: L('Blau', 'Blue'), min: 0, max: 100, step: 5, default: 0, unit: '%', visibleIf: (v) => v.mode === 'add' || v.mode === 'pixel' },
    { key: 'c', type: 'number', label: L('Cyan-Filter', 'Cyan filter'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'sub' },
    { key: 'm', type: 'number', label: L('Magenta-Filter', 'Magenta filter'), min: 0, max: 100, step: 5, default: 0, unit: '%', visibleIf: (v) => v.mode === 'sub' },
    { key: 'y', type: 'number', label: L('Gelb-Filter', 'Yellow filter'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'sub' },
  ],
  hint: (v) =>
    v.mode === 'prisma'
      ? L('Der Farbfächer ist zur Verdeutlichung aufgeweitet. Wähle einen Filter und sieh, welche Farben durchkommen.', 'The colour fan is widened for clarity. Pick a filter and see which colours get through.')
      : v.mode === 'add'
        ? L('Drei farbige Scheinwerfer auf einer dunklen Wand. Wo sie sich überlappen, addiert sich das Licht.', 'Three coloured spotlights on a dark wall. Where they overlap, the light adds up.')
        : v.mode === 'sub'
          ? L('Drei Farbfilter vor weißem Licht. Jeder Filter schluckt einen Teil – übrig bleibt die Mischfarbe.', 'Three colour filters in front of white light. Each filter absorbs a part – what is left is the mixed colour.')
          : L('Von Weitem siehst du eine Farbe, aus der Nähe nur rote, grüne und blaue Leuchtpunkte.', 'From afar you see one colour; close up only red, green and blue dots.'),
  readouts: [
    { key: 'mix', label: L('Mischfarbe', 'Mixed colour'), spoiler: true },
    { key: 'pass', label: L('Durch den Filter', 'Through the filter'), spoiler: true },
  ],
  presets: [
    { id: 'prisma', label: L('Prisma', 'Prism'), values: { mode: 'prisma', filter: 'none' } },
    { id: 'filter', label: L('Gelbfilter', 'Yellow filter'), values: { mode: 'prisma', filter: 'yellow' } },
    { id: 'gelb', label: L('Rot + Grün', 'Red + green'), values: { mode: 'add', r: 100, g: 100, b: 0 } },
    { id: 'weiss', label: L('Weiß aus Licht', 'White from light'), values: { mode: 'add', r: 100, g: 100, b: 100 } },
    { id: 'gruen', label: L('Cyan + Gelb', 'Cyan + yellow'), values: { mode: 'sub', c: 100, m: 0, y: 100 } },
    { id: 'orange', label: L('Bildschirm: Orange', 'Screen: orange'), values: { mode: 'pixel', r: 100, g: 50, b: 0 } },
  ],
  strings: {
    de: {
      canvas: 'Farben: Prisma mit Farbfächer und Schirm, drei farbige Lichtkreise, drei Farbfilter oder vergrößerte Bildpunkte eines Bildschirms',
      black: 'Schwarz',
      white: 'Weiß',
      grey: 'Grau',
      red: 'Rot',
      orange: 'Orange',
      yellow: 'Gelb',
      green: 'Grün',
      cyan: 'Cyan (Blaugrün)',
      blue: 'Blau',
      magenta: 'Magenta (Purpur)',
      mixAdd: '{name} – Licht: R {r} %, G {g} %, B {b} %',
      mixSub: '{name} – übrig bleiben R {r} %, G {g} %, B {b} %',
      passNone: 'Alle Farben erreichen den Schirm: weißes Licht.',
      passSome: 'Durch kommt nur {list}; der Rest wird verschluckt (absorbiert). Auf dem Schirm erscheint {name}.',
      white_light: 'weißes Licht',
      screen: 'Schirm',
      ir: 'IR (unsichtbar)',
      uv: 'UV (unsichtbar)',
      far: 'von Weitem',
      near: 'aus der Nähe',
      filterLabel: 'Filter',
      partR: 'Rot',
      partG: 'Grün',
      partB: 'Blau',
      and: 'und',
    },
    en: {
      canvas: 'Colours: prism with a colour fan and a screen, three coloured light circles, three colour filters or magnified screen pixels',
      black: 'black',
      white: 'white',
      grey: 'grey',
      red: 'red',
      orange: 'orange',
      yellow: 'yellow',
      green: 'green',
      cyan: 'cyan',
      blue: 'blue',
      magenta: 'magenta',
      mixAdd: '{name} – light: R {r} %, G {g} %, B {b} %',
      mixSub: '{name} – remaining R {r} %, G {g} %, B {b} %',
      passNone: 'All colours reach the screen: white light.',
      passSome: 'Only {list} gets through; the rest is absorbed. The screen shows {name}.',
      white_light: 'white light',
      screen: 'screen',
      ir: 'IR (invisible)',
      uv: 'UV (invisible)',
      far: 'from afar',
      near: 'close up',
      filterLabel: 'filter',
      partR: 'red',
      partG: 'green',
      partB: 'blue',
      and: 'and',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const pct = (v: number) => Math.round(v * 100);

    function filterRgb(f: FilterId): Rgb {
      const pass = (l: number) => (filterPasses(f, l) ? 1 : 0);
      return [pass(650), pass(540), pass(450)];
    }

    function updateReadouts(): void {
      ctx.readout('mix', null);
      ctx.readout('pass', null);
      if (p.mode === 'add' || p.mode === 'pixel') {
        const c = additiveMix(p.r / 100, p.g / 100, p.b / 100);
        ctx.readout('mix', tr('mixAdd', { name: ctx.t(colorName(c)), r: pct(c[0]), g: pct(c[1]), b: pct(c[2]) }));
      } else if (p.mode === 'sub') {
        const c = subtractiveMix(p.c / 100, p.m / 100, p.y / 100);
        ctx.readout('mix', tr('mixSub', { name: ctx.t(colorName(c)), r: pct(c[0]), g: pct(c[1]), b: pct(c[2]) }));
      } else {
        const f = p.filter as FilterId;
        if (f === 'none') ctx.readout('pass', ctx.t('passNone'));
        else {
          const c = filterRgb(f);
          const parts = [c[0] ? ctx.t('partR') : '', c[1] ? ctx.t('partG') : '', c[2] ? ctx.t('partB') : ''].filter(Boolean);
          ctx.readout('pass', tr('passSome', { list: parts.join(` ${ctx.t('and')} `), name: ctx.t(colorName(c)) }));
        }
      }
    }

    /* ---------- Prisma ---------- */
    function drawPrism(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      // Dunkler Raum, damit die Farben leuchten
      roundRect(g, 8, 8, W - 16, H - 16, 14);
      g.fillStyle = '#0b0f19';
      g.fill();
      const size = Math.min(H * 0.5, W * 0.3);
      const pcx = W * (narrow ? 0.42 : 0.32);
      const pcy = H * 0.52;
      const apex: [number, number] = [pcx, pcy - size * 0.58];
      const left: [number, number] = [pcx - size / 2, pcy + size * 0.29];
      const right: [number, number] = [pcx + size / 2, pcy + size * 0.29];
      // Eintrittspunkt auf der linken Fläche (40 % von der Spitze)
      const t = 0.45;
      const P: [number, number] = [apex[0] + (left[0] - apex[0]) * t, apex[1] + (left[1] - apex[1]) * t];
      const thIn = 18 * DEG; // Strahl steigt leicht an
      const src: [number, number] = [20, P[1] + Math.tan(thIn) * (P[0] - 20)];
      // Austrittspunkt auf der rechten Fläche (symmetrisch)
      const Q: [number, number] = [apex[0] + (right[0] - apex[0]) * t, apex[1] + (right[1] - apex[1]) * t];
      // Einfallender weißer Strahl
      g.strokeStyle = '#ffffff';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(src[0], src[1]);
      g.lineTo(P[0], P[1]);
      g.stroke();
      text(g, ctx.t('white_light'), src[0] + 6, src[1] + 18, { font: `600 ${narrow ? 10 : 12}px ${th.font}`, color: '#e5e7eb', align: 'left' });
      // Im Glas: helles Band
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(P[0], P[1]);
      g.lineTo(Q[0], Q[1]);
      g.stroke();
      // Prisma
      g.beginPath();
      g.moveTo(apex[0], apex[1]);
      g.lineTo(left[0], left[1]);
      g.lineTo(right[0], right[1]);
      g.closePath();
      g.fillStyle = 'rgba(160,200,255,0.18)';
      g.fill();
      g.strokeStyle = 'rgba(200,220,255,0.85)';
      g.lineWidth = 2;
      g.stroke();
      // Schirm
      const sx = W - (narrow ? 34 : 60);
      const filterX = sx - (narrow ? 50 : 90);
      const f = p.filter as FilterId;
      const mean = prismDeviation(refractiveIndex(550), 60 * DEG, 50 * DEG);
      const spread = 5; // Aufweitung zur Verdeutlichung
      const dirOf = (l: number) => {
        const d = prismDeviation(refractiveIndex(l), 60 * DEG, 50 * DEG);
        return thIn - (mean + (d - mean) * spread);
      };
      const hitY = (ang: number, x: number) => Q[1] - Math.tan(ang) * (x - Q[0]);
      for (let l = 400; l <= 700; l += 4) {
        const [cr, cg, cb] = wavelengthToRgb(l);
        const ang = dirOf(l);
        const pass = filterPasses(f, l);
        const endX = f === 'none' || pass ? sx : filterX;
        g.strokeStyle = `rgb(${cr},${cg},${cb})`;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(Q[0], Q[1]);
        g.lineTo(endX, hitY(ang, endX));
        g.stroke();
        if (endX === sx) {
          g.fillStyle = `rgb(${cr},${cg},${cb})`;
          g.fillRect(sx, hitY(ang, sx) - 3, 12, 6);
        }
      }
      // Unsichtbare Bereiche: IR oberhalb von Rot, UV unterhalb von Violett
      const yIR = hitY(dirOf(700), sx) - 26;
      const yUV = hitY(dirOf(400), sx) + 26;
      g.setLineDash([5, 5]);
      g.strokeStyle = 'rgba(255,255,255,0.4)';
      g.lineWidth = 1.5;
      for (const y of [yIR, yUV]) {
        g.beginPath();
        g.moveTo(Q[0], Q[1]);
        g.lineTo(f === 'none' ? sx : filterX, Q[1] + ((y - Q[1]) * ((f === 'none' ? sx : filterX) - Q[0])) / (sx - Q[0]));
        g.stroke();
      }
      g.setLineDash([]);
      const fs = narrow ? 10 : 12;
      const lx = (f === 'none' ? sx : filterX) - 10;
      const yAt = (yEnd: number, x: number) => Q[1] + ((yEnd - Q[1]) * (x - Q[0])) / (sx - Q[0]);
      text(g, narrow ? 'IR' : ctx.t('ir'), lx, yAt(yIR, lx) - 16, { font: `600 ${fs}px ${th.font}`, color: '#fca5a5', align: 'right' });
      text(g, narrow ? 'UV' : ctx.t('uv'), lx, yAt(yUV, lx) + 18, { font: `600 ${fs}px ${th.font}`, color: '#c4b5fd', align: 'right' });
      // Schirm zeichnen
      g.fillStyle = 'rgba(255,255,255,0.15)';
      g.fillRect(sx + 12, 30, 8, H - 60);
      text(g, ctx.t('screen'), sx + 16, 20, { font: `600 ${fs}px ${th.font}`, color: '#e5e7eb', align: 'right' });
      // Filter
      if (f !== 'none') {
        g.fillStyle = rgbCss(filterRgb(f), 0.45);
        g.fillRect(filterX - 5, 40, 10, H - 80);
        g.strokeStyle = rgbCss(filterRgb(f), 0.9);
        g.lineWidth = 1.5;
        g.strokeRect(filterX - 5, 40, 10, H - 80);
        text(g, ctx.t('filterLabel'), filterX, 28, { font: `600 ${fs}px ${th.font}`, color: '#e5e7eb' });
      }
    }

    /* ---------- Mischung ---------- */
    function drawCircles(sub: boolean): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const boxW = narrow ? W - 16 : W * 0.66;
      roundRect(g, 8, 8, boxW, H - 16, 14);
      g.fillStyle = sub ? '#ffffff' : '#000000';
      g.fill();
      const cx = 8 + boxW / 2;
      const cy = H / 2 + (narrow ? -H * 0.08 : 0);
      const rad = Math.min(boxW, H) * 0.24;
      const d = rad * 0.62;
      const pos: [number, number][] = [
        [cx - d * Math.cos(30 * DEG), cy + d * 0.5],
        [cx + d * Math.cos(30 * DEG), cy + d * 0.5],
        [cx, cy - d],
      ];
      const lights: [Rgb, number][] = sub
        ? [
            [[0, 1, 1], p.c / 100],
            [[1, 0, 1], p.m / 100],
            [[1, 1, 0], p.y / 100],
          ]
        : [
            [[1, 0, 0], p.r / 100],
            [[0, 1, 0], p.g / 100],
            [[0, 0, 1], p.b / 100],
          ];
      // Reihenfolge: oben Rot/Cyan wirkt natürlicher
      const order = [2, 0, 1];
      g.save();
      g.beginPath();
      roundRect(g, 8, 8, boxW, H - 16, 14);
      g.clip();
      g.globalCompositeOperation = sub ? 'multiply' : 'lighter';
      order.forEach((k, i) => {
        const [col, s] = lights[k]!;
        const c: Rgb = sub ? [1 - (1 - col[0]) * s, 1 - (1 - col[1]) * s, 1 - (1 - col[2]) * s] : [col[0] * s, col[1] * s, col[2] * s];
        g.fillStyle = rgbCss(c);
        g.beginPath();
        g.arc(pos[i]![0], pos[i]![1], rad, 0, Math.PI * 2);
        g.fill();
      });
      g.restore();
      // Umrisse, damit auch ein abgeschalteter Kreis zu sehen ist
      g.strokeStyle = sub ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)';
      g.lineWidth = 1.5;
      g.setLineDash([6, 5]);
      for (const [x, y] of pos) {
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.stroke();
      }
      g.setLineDash([]);
      // Beschriftung der Kreise
      const names = sub ? ['cyan', 'magenta', 'yellow'] : ['red', 'green', 'blue'];
      order.forEach((k, i) => {
        const [x, y] = pos[i]!;
        const dx = x - cx;
        const dy = y - cy;
        const len = Math.hypot(dx, dy) || 1;
        const lx = x + (dx / len) * rad * 0.55;
        const ly = y + (dy / len) * rad * 0.55;
        text(g, ctx.t(names[k]!).replace(/ \(.*\)/, ''), lx, ly, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: sub ? '#111827' : '#f9fafb' });
      });
      // Ergebnisfeld
      const mix = sub ? subtractiveMix(p.c / 100, p.m / 100, p.y / 100) : additiveMix(p.r / 100, p.g / 100, p.b / 100);
      const sw = narrow ? { x: 16, y: H - 16 - 64, w: W - 32, h: 52 } : { x: boxW + 24, y: H / 2 - 70, w: W - boxW - 40, h: 140 };
      roundRect(g, sw.x, sw.y, sw.w, sw.h, 12);
      // Im Aufgabenmodus bleibt das Ergebnisfeld grau
      g.fillStyle = ctx.hidden ? th.grid : rgbCss(mix);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.stroke();
      const lum = 0.3 * mix[0] + 0.59 * mix[1] + 0.11 * mix[2];
      const name = ctx.hidden ? '?' : ctx.t(colorName(mix));
      text(g, name, sw.x + sw.w / 2, sw.y + sw.h / 2, { font: `700 ${narrow ? 15 : 18}px ${th.font}`, color: lum > 0.55 ? '#111827' : '#f9fafb' });
    }

    /* ---------- Bildschirm ---------- */
    function drawPixels(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const mix = additiveMix(p.r / 100, p.g / 100, p.b / 100);
      const far = narrow ? { x: 16, y: 34, w: W - 32, h: H * 0.3 } : { x: 20, y: 40, w: W * 0.3, h: H - 80 };
      const near = narrow ? { x: 16, y: far.y + far.h + 40, w: W - 32, h: H - far.h - 90 } : { x: far.x + far.w + 40, y: 40, w: W - far.w - 80, h: H - 80 };
      roundRect(g, far.x, far.y, far.w, far.h, 10);
      g.fillStyle = rgbCss(mix);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.stroke();
      text(g, ctx.t('far'), far.x + far.w / 2, far.y - 14, { font: `600 13px ${th.font}`, color: th.text });
      text(g, ctx.t('near'), near.x + near.w / 2, near.y - 14, { font: `600 13px ${th.font}`, color: th.text });
      roundRect(g, near.x, near.y, near.w, near.h, 10);
      g.fillStyle = '#000000';
      g.fill();
      const cols = narrow ? 4 : 5;
      const rows = Math.max(2, Math.round((cols * near.h) / near.w));
      const cw = near.w / cols;
      const ch = near.h / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = near.x + i * cw;
          const y = near.y + j * ch;
          const sw = cw / 3;
          const parts: Rgb[] = [
            [mix[0], 0, 0],
            [0, mix[1], 0],
            [0, 0, mix[2]],
          ];
          parts.forEach((c, k) => {
            roundRect(g, x + k * sw + sw * 0.15, y + ch * 0.08, sw * 0.7, ch * 0.84, Math.min(6, sw * 0.2));
            g.fillStyle = rgbCss([Math.max(c[0], k === 0 ? 0.08 : 0), Math.max(c[1], k === 1 ? 0.08 : 0), Math.max(c[2], k === 2 ? 0.08 : 0)]);
            g.fill();
          });
        }
      }
    }

    return {
      update() {
        updateReadouts();
      },
      render() {
        surface.begin();
        if (p.mode === 'prisma') drawPrism();
        else if (p.mode === 'add') drawCircles(false);
        else if (p.mode === 'sub') drawCircles(true);
        else drawPixels();
      },
      destroy: () => surface.destroy(),
    };
  },
});
