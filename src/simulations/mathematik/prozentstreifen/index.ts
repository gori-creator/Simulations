import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { asFraction, baseValue, discounted, gross, isNice, niceTask, percentRate, percentValue, ruleOfThree, upThenDown, type Find } from './model';

const L = (de: string, en: string) => ({ de, en });
type Ctx = 'none' | 'rabatt' | 'mwst' | 'zins' | 'klasse' | 'twice';
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Ausgangswerte je Situation (beim Umschalten von Hand). */
const START: Record<Ctx, { G: number; p: number }> = {
  none: { G: 80, p: 25 },
  rabatt: { G: 60, p: 30 },
  mwst: { G: 200, p: 19 },
  zins: { G: 500, p: 2 },
  klasse: { G: 28, p: 25 },
  twice: { G: 100, p: 20 },
};

/**
 * Prozentstreifen: oben Prozente, unten Werte. Gesucht ist wahlweise der
 * Prozentwert, der Prozentsatz oder der Grundwert; der Dreisatz entsteht
 * Zeile für Zeile, daneben Formel, Bruch und eine Alltagssituation (Rabatt,
 * Mehrwertsteuer, Zinsen, Anteil einer Klasse). Das Ende des Streifens lässt
 * sich ziehen. „Erst plus, dann minus“ zeigt in drei Streifen, dass +p % und
 * danach −p % nicht zum Anfangswert zurückführt, weil sich der Grundwert
 * ändert. „Neue Aufgabe“ würfelt glatte Werte und blendet die Lösung aus.
 */
export default defineSimulation({
  id: 'prozentstreifen',
  dragHint: true,
  layout: { aspect: 1.75, aspectNarrow: 0.56 },
  groups: [
    { id: 'val', label: L('Werte', 'Values') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'none', label: L('Ohne Sachzusammenhang', 'Plain numbers') },
        { value: 'rabatt', label: L('Rabatt', 'Discount') },
        { value: 'mwst', label: L('Mehrwertsteuer', 'Sales tax (VAT)') },
        { value: 'zins', label: L('Zinsen', 'Interest') },
        { value: 'klasse', label: L('Anteil einer Klasse', 'Share of a class') },
        { value: 'twice', label: L('Erst plus, dann minus', 'First up, then down') },
      ],
      default: 'none',
    },
    {
      key: 'find',
      type: 'choice',
      label: L('Gesucht', 'Find'),
      options: [
        { value: 'W', label: L('Prozentwert W', 'Percentage W') },
        { value: 'p', label: L('Prozentsatz p %', 'Rate p %') },
        { value: 'G', label: L('Grundwert G', 'Base value G') },
      ],
      default: 'W',
      visibleIf: (v) => v.sit !== 'twice',
    },
    { key: 'G', type: 'number', group: 'val', label: L('Grundwert G (≙ 100 %)', 'Base value G (≙ 100 %)'), min: 1, max: 1000, step: 1, default: 80 },
    { key: 'p', type: 'number', group: 'val', label: L('Prozentsatz p', 'Rate p'), min: 0, max: 150, step: 1, default: 25, unit: '%', help: L('Auch am Ende des farbigen Streifens ziehen.', 'You can also drag the end of the coloured bar.') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösung zeigen', 'Show the solution'), help: L('Aus: Die gesuchte Größe erscheint als „?“.', 'Off: the unknown appears as “?”.'), default: true },
  ],
  actions: [{ id: 'dice', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.sit !== 'twice' }],
  readouts: [
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('25 % von 80', '25 % of 80'), values: {} },
    { id: 'p', label: L('Wie viel Prozent?', 'What percentage?'), values: { find: 'p', G: 40, p: 35 } },
    { id: 'G', label: L('Grundwert gesucht', 'Find the base value'), values: { find: 'G', G: 250, p: 12 } },
    { id: 'rabatt', label: L('30 % Rabatt', '30 % discount'), values: { sit: 'rabatt', G: 60, p: 30 } },
    { id: 'mwst', label: L('19 % Mehrwertsteuer', '19 % VAT'), values: { sit: 'mwst', G: 200, p: 19 } },
    { id: 'klasse', label: L('7 von 28 Kindern', '7 of 28 children'), values: { sit: 'klasse', find: 'p', G: 28, p: 25 } },
    { id: 'twice', label: L('+20 %, dann −20 %', '+20 %, then −20 %'), values: { sit: 'twice', G: 100, p: 20 } },
    { id: 'twice50', label: L('+50 %, dann −50 %', '+50 %, then −50 %'), values: { sit: 'twice', G: 80, p: 50 } },
  ],
  strings: {
    de: {
      canvas: 'Prozentstreifen mit Prozentskala oben und Werteskala unten; der farbige Teil zeigt den Prozentwert und lässt sich am Ende ziehen. Darunter der Dreisatz Zeile für Zeile, die Formel und eine Alltagssituation.',
      ruleT: 'Dreisatz',
      formT: 'Formel',
      sitT: 'Situation',
      G: 'Grundwert',
      W: 'Prozentwert',
      p: 'Prozentsatz',
      newPrice: 'neuer Preis',
      discount: 'Rabatt',
      net: 'Nettopreis',
      vat: 'MwSt.',
      grossP: 'Bruttopreis',
      capital: 'Kapital',
      interest: 'Zinsen',
      all: 'alle Kinder',
      bikes: 'mit dem Rad',
      children: 'Kinder',
      child1: 'Kind',
      q_none_W: 'Wie viel sind {p} von {G}?',
      q_none_p: 'Wie viel Prozent sind {W} von {G}?',
      q_none_G: '{W} sind {p}. Wie groß ist das Ganze?',
      q_rabatt_W: 'Ein Pullover kostet {G}. Im Sale gibt es {p} Rabatt. Wie viel spart man?',
      q_rabatt_p: 'Ein Pullover kostet {G}. Er wird um {W} billiger. Wie viel Prozent Rabatt sind das?',
      q_rabatt_G: 'Beim Rabatt von {p} spart man {W}. Wie teuer war der Pullover vorher?',
      q_mwst_W: 'Ein Fahrrad kostet netto {G}. Dazu kommen {p} Mehrwertsteuer. Wie viel ist das?',
      q_mwst_p: 'Auf den Nettopreis von {G} kommen {W} Steuer. Wie hoch ist der Steuersatz?',
      q_mwst_G: 'Die Mehrwertsteuer von {p} beträgt {W}. Wie hoch ist der Nettopreis?',
      q_zins_W: 'Auf dem Sparbuch liegen {G}. Der Zinssatz beträgt {p} im Jahr. Wie viele Zinsen gibt es nach einem Jahr?',
      q_zins_p: 'Aus {G} Kapital werden in einem Jahr {W} Zinsen. Wie hoch ist der Zinssatz?',
      q_zins_G: 'Bei {p} Zinsen gibt es nach einem Jahr {W}. Wie viel Geld lag auf dem Konto?',
      q_klasse_W: 'In der Klasse sind {G} Kinder. {p} kommen mit dem Rad. Wie viele Kinder sind das?',
      q_klasse_p: 'Von {G} Kindern kommen {W} mit dem Rad. Wie viel Prozent sind das?',
      q_klasse_G: '{W} Kinder kommen mit dem Rad, das sind {p} der Klasse. Wie viele Kinder sind in der Klasse?',
      a_rabatt: 'Neuer Preis: {v}',
      a_mwst: 'Bruttopreis: {v}',
      a_zins: 'Kontostand nach einem Jahr: {v}',
      a_klasse: 'Ohne Rad: {v}',
      noWhole: 'Kein ganzzahliges Ergebnis – bei Kindern nicht möglich.',
      frac: 'Als Bruch',
      resRead: 'G = {G}, p = {p}, W = {W}',
      shortcut: 'Kurz: W = G · p %',
      tw_start: 'Start',
      tw_up: '+ {p}',
      tw_down: '− {p}',
      tw_q: 'Ein Preis von {G} steigt um {p} und sinkt danach wieder um {p}. Ist er dann wieder {G}?',
      tw_factT: 'Mit Faktoren rechnen',
      tw_f1: 'Erhöhen um {p}: · {q1}',
      tw_f2: 'Senken um {p}: · {q2}',
      tw_f: 'Zusammen: {q1} · {q2} = {q}',
      tw_net: 'Das ist eine Änderung um {n}.',
      tw_whyT: 'Warum nicht wieder {G}?',
      tw_why: 'Beim Senken bezieht sich der Prozentsatz auf den neuen, größeren Grundwert {up}. {p} davon sind {d2} – mehr als die {d1}, die vorher dazugekommen sind.',
      tw_gap: 'fehlt: {v}',
    },
    en: {
      canvas: 'Percentage bar with a percent scale on top and a value scale below; the coloured part shows the percentage and its end can be dragged. Below, the rule of three line by line, the formula and an everyday situation.',
      ruleT: 'Rule of three',
      formT: 'Formula',
      sitT: 'Situation',
      G: 'Base value',
      W: 'Percentage',
      p: 'Rate',
      newPrice: 'new price',
      discount: 'discount',
      net: 'net price',
      vat: 'VAT',
      grossP: 'gross price',
      capital: 'Capital',
      interest: 'Interest',
      all: 'all children',
      bikes: 'by bike',
      children: 'children',
      child1: 'child',
      q_none_W: 'What is {p} of {G}?',
      q_none_p: 'What percentage of {G} is {W}?',
      q_none_G: '{W} is {p}. What is the whole?',
      q_rabatt_W: 'A jumper costs {G}. In the sale there is {p} off. How much do you save?',
      q_rabatt_p: 'A jumper costs {G} and is reduced by {W}. What percentage discount is that?',
      q_rabatt_G: 'With {p} off you save {W}. What did the jumper cost before?',
      q_mwst_W: 'A bike costs {G} before tax. {p} VAT is added. How much is that?',
      q_mwst_p: 'On a net price of {G}, the tax is {W}. What is the tax rate?',
      q_mwst_G: 'The VAT of {p} is {W}. What is the net price?',
      q_zins_W: 'There is {G} in a savings account at {p} per year. How much interest after one year?',
      q_zins_p: '{G} earns {W} interest in a year. What is the interest rate?',
      q_zins_G: 'At {p}, the interest after one year is {W}. How much money was in the account?',
      q_klasse_W: 'There are {G} children in the class. {p} come by bike. How many children is that?',
      q_klasse_p: '{W} of {G} children come by bike. What percentage is that?',
      q_klasse_G: '{W} children come by bike, that is {p} of the class. How many children are in the class?',
      a_rabatt: 'New price: {v}',
      a_mwst: 'Gross price: {v}',
      a_zins: 'Balance after one year: {v}',
      a_klasse: 'Not by bike: {v}',
      noWhole: 'Not a whole number – impossible for children.',
      frac: 'As a fraction',
      resRead: 'G = {G}, p = {p}, W = {W}',
      shortcut: 'Short: W = G · p %',
      tw_start: 'start',
      tw_up: '+ {p}',
      tw_down: '− {p}',
      tw_q: 'A price of {G} rises by {p} and then falls by {p}. Is it {G} again?',
      tw_factT: 'Calculating with factors',
      tw_f1: 'increase by {p}: · {q1}',
      tw_f2: 'decrease by {p}: · {q2}',
      tw_f: 'together: {q1} · {q2} = {q}',
      tw_net: 'That is a change of {n}.',
      tw_whyT: 'Why not {G} again?',
      tw_why: 'When decreasing, the percentage refers to the new, larger base value {up}. {p} of it is {d2} – more than the {d1} that was added before.',
      tw_gap: 'missing: {v}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const pr = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const sit = () => pr.sit as Ctx;
    const find = () => pr.find as Find;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;

    const col = {
      W: () => th().series[0]!,
      G: () => th().series[4]!,
      p: () => th().series[3]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
    };

    /* ---------- Werte ---------- */
    const W = () => percentValue(pr.G, pr.p);
    const money = () => sit() === 'rabatt' || sit() === 'mwst' || sit() === 'zins' || sit() === 'twice';
    /** Zahl mit Einheit, z. B. „20 €“, „7 Kinder“. */
    function val(v: number, unit = true): string {
      if (!Number.isFinite(v)) return '–';
      const s = money() ? fmt.num(v, 2) : fmt.num(Math.round(v * 1000) / 1000, 3);
      if (!unit) return s;
      if (money()) return `${money() && !isNice(v, 2) ? '≈ ' : ''}${s} €`;
      if (sit() === 'klasse') return `${s} ${Math.abs(v - 1) < 1e-9 ? ctx.t('child1') : ctx.t('children')}`;
      return s;
    }
    const pct = (p: number) => `${fmt.num(Math.round(p * 100) / 100, 2)} %`;
    const hidden = (k: Find) => !pr.show && find() === k;
    const Q = (k: Find, s: string) => (hidden(k) ? '?' : s);

    /* ---------- weiche Anzeige ---------- */
    let pShown = pr.p;
    let maxShown = 0;
    let lastFrame = performance.now();
    let dragging = false;
    let hover = false;
    const rows = new Tween(1400, ease.linear);
    const pop = new Tween(500, ease.outBack);
    const maxPct = () => {
      const s = sit();
      const hi = s === 'mwst' ? 100 + pr.p : Math.max(100, pr.p);
      return Math.max(120, Math.ceil((hi + 12) / 10) * 10);
    };
    maxShown = maxPct();

    /* ---------- Aufteilung ---------- */
    type Lay = { strip: Rect; c1: Rect; c2: Rect | null };
    function layout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const gap = F(12, 8);
      if (wideLayout()) {
        const sh = Math.round(clamp(h * 0.5, 190, 300));
        const cw = (w - gap) / 2;
        return { strip: { x: 2, y: 2, w: w - 4, h: sh }, c1: { x: 2, y: sh + gap, w: cw - 2, h: h - sh - gap - 2 }, c2: { x: cw + gap, y: sh + gap, w: cw - 2, h: h - sh - gap - 2 } };
      }
      const sh = Math.round(clamp(h * 0.42, 200, 300));
      return { strip: { x: 2, y: 2, w: w - 4, h: sh }, c1: { x: 2, y: sh + gap, w: w - 4, h: h - sh - gap - 2 }, c2: null };
    }
    /** Geometrie des Streifens: x für 0 % und Pixel pro Prozent. */
    function stripGeo(): { x0: number; k: number; y: number; h: number } {
      const { strip } = layout();
      const padL = F(34, 22);
      const padR = F(30, 18);
      const k = (strip.w - padL - padR) / maxShown;
      const iconRoom = sit() === 'klasse' ? F(52, 40) : 0;
      const h = F(46, 38);
      const y = strip.y + strip.h / 2 - h / 2 + iconRoom / 2 + F(4, 2);
      return { x0: strip.x + padL, k, y, h };
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      if (sit() === 'twice') {
        const r = upThenDown(pr.G, pr.p);
        ctx.readout('res', `${val(pr.G)} → ${val(r.up)} → ${val(r.down)}`);
        ctx.readout('calc', `${fmt.num(1 + pr.p / 100, 2)} · ${fmt.num(1 - pr.p / 100, 2)} = ${fmt.num(r.factor, 4)} (${pct(r.netPct)})`);
        return;
      }
      ctx.readout('res', tr('resRead', { G: val(pr.G), p: pct(pr.p), W: val(W()) }));
      const f = find();
      let calc: string;
      if (f === 'W') calc = `W = ${val(pr.G, false)} · ${fmt.num(pr.p, 0)}/100 = ${val(W())}`;
      else if (f === 'p') calc = `p = ${val(W(), false)} : ${val(pr.G, false)} · 100 % = ${pct(percentRate(pr.G, W()))}`;
      else calc = pr.p === 0 ? '–' : `G = ${val(W(), false)} : ${fmt.num(pr.p, 0)} · 100 = ${val(baseValue(W(), pr.p))}`;
      ctx.readout('calc', calc);
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
      str = str.replace(/ (%|€|Kinder|children)/g, ' $1');
      const rows2: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows2.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows2.push(cur);
      return rows2;
    }
    function pill(cx: number, cy: number, label: string, color: string, filled = false, maxX?: number, minX?: number): Rect {
      const g = surface.g;
      const f = font(700, F(12.5, 11.5));
      g.font = f;
      const w = g.measureText(label).width + 16;
      const h = F(22, 20);
      let x = cx - w / 2;
      if (maxX !== undefined) x = Math.min(x, maxX - w);
      if (minX !== undefined) x = Math.max(x, minX);
      g.save();
      g.fillStyle = filled ? color : th().dark ? '#141b26' : '#ffffff';
      roundRect(g, x, cy - h / 2, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.8);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, x + w / 2, cy + 0.5, { font: f, color: filled ? (th().dark ? '#10161f' : '#ffffff') : color });
      g.restore();
      return { x, y: cy - h / 2, w, h };
    }
    /** Geschweifte Klammer von x0 bis x1 auf Höhe y; dir = −1 nach oben geöffnet (Spitze oben). */
    function brace(x0: number, x1: number, y: number, dir: 1 | -1, color: string): void {
      const g = surface.g;
      const d = 7 * dir;
      const m = (x0 + x1) / 2;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y - d);
      g.quadraticCurveTo(x0, y, x0 + 8, y);
      g.lineTo(m - 8, y);
      g.quadraticCurveTo(m, y, m, y + d);
      g.quadraticCurveTo(m, y, m + 8, y);
      g.lineTo(x1 - 8, y);
      g.quadraticCurveTo(x1, y, x1, y - d);
      g.stroke();
      g.restore();
    }

    /* ---------- Streifen ---------- */
    function drawStrip(): void {
      const g = surface.g;
      const theme = th();
      const { strip } = layout();
      const { x0, k, y, h } = stripGeo();
      const X = (p: number) => x0 + p * k;
      const s = sit();
      const p = pShown;
      // Hintergrundkarte
      card(strip);
      // Papierstreifen bis zum Maximum (leicht), 0–100 % kräftiger
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#1d2633' : '#f4f6f9';
      roundRect(g, X(0), y, X(100) - X(0), h, 6);
      g.fill();
      g.restore();
      // Füllung
      const seg = (a: number, b: number, color: string, label: string | null) => {
        if (b <= a + 1e-6) return;
        const xa = X(a);
        const xb = X(b);
        const grad = g.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, withAlpha(color, theme.dark ? 0.85 : 0.9));
        grad.addColorStop(1, withAlpha(color, theme.dark ? 0.6 : 0.7));
        g.fillStyle = grad;
        roundRect(g, xa, y, xb - xa, h, 6);
        g.fill();
        if (label) {
          g.font = font(700, F(12.5, 11));
          if (g.measureText(label).width + 12 < xb - xa) text(g, label, (xa + xb) / 2, y + h / 2 + 0.5, { font: font(700, F(12.5, 11)), color: '#ffffff' });
        }
      };
      let handleP = p;
      if (s === 'rabatt') {
        seg(0, Math.max(0, 100 - p), col.ok(), ctx.t('newPrice'));
        seg(Math.max(0, 100 - p), 100, col.bad(), ctx.t('discount'));
        handleP = 100 - p;
      } else if (s === 'mwst') {
        seg(0, 100, col.G(), ctx.t('net'));
        seg(100, 100 + p, col.p(), ctx.t('vat'));
        handleP = 100 + p;
      } else seg(0, p, col.W(), null);
      // Rahmen 0–100 %
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.4;
      roundRect(g, X(0) + 0.5, y + 0.5, X(100) - X(0) - 1, h - 1, 6);
      g.stroke();
      // Skalen: oben Prozent, unten Werte
      const every = k * 10 >= F(46, 30) ? 10 : k * 20 >= 30 ? 20 : 25;
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1;
      for (let q = 0; q <= maxShown + 1e-9; q += 5) {
        const x = Math.round(X(q)) + 0.5;
        const major = q % every === 0;
        g.beginPath();
        g.moveTo(x, y - (major ? 8 : 4));
        g.lineTo(x, y);
        g.moveTo(x, y + h);
        g.lineTo(x, y + h + (major ? 8 : 4));
        g.stroke();
        if (major) {
          const show100 = q === 100;
          text(g, `${q} %`, x, y - 17, { font: font(show100 ? 800 : 600, F(11.5, 10.5)), color: show100 ? col.G() : theme.muted });
          const v = (pr.G * q) / 100;
          const lbl = hidden('G') ? (q === 0 ? '0' : '') : fmt.num(Math.round(v * 100) / 100, 2);
          if (lbl) text(g, lbl, x, y + h + 18, { font: font(show100 ? 800 : 600, F(11.5, 10.5)), color: show100 ? col.G() : theme.muted });
        }
      }
      g.restore();
      // Klammern: G unten (0–100 %), W oben (Prozentwert)
      const bY = y + h + F(34, 30);
      brace(X(0), X(100), bY, 1, col.G());
      const gLab = `${s === 'mwst' ? ctx.t('net') : s === 'rabatt' ? (ctx.lang === 'de' ? 'alter Preis' : 'old price') : 'G'} = ${Q('G', val(pr.G))} ≙ 100 %`;
      pill(X(50), bY + F(20, 18), gLab, col.G(), false, strip.x + strip.w - 6, strip.x + 6);
      // Prozentwert-Klammer oben
      const wa = s === 'rabatt' ? 100 - p : s === 'mwst' ? 100 : 0;
      const wb = s === 'rabatt' ? 100 : s === 'mwst' ? 100 + p : p;
      if (wb - wa > 0.5) {
        const tY = y - F(34, 30) - (s === 'klasse' ? F(44, 34) : 0);
        brace(X(wa), X(wb), tY, -1, s === 'rabatt' ? col.bad() : s === 'mwst' ? col.p() : col.W());
        const wName = s === 'rabatt' ? ctx.t('discount') : s === 'mwst' ? ctx.t('vat') : s === 'zins' ? ctx.t('interest') : s === 'klasse' ? ctx.t('bikes') : 'W';
        const lab = `${wName} = ${Q('W', val(W()))} ≙ ${Q('p', pct(pr.p))}`;
        const sc = pop.running ? Math.max(0.6, pop.value) : 1;
        g.save();
        const cx = (X(wa) + X(wb)) / 2;
        const cy = tY - F(20, 18);
        g.translate(cx, cy);
        g.scale(sc, sc);
        g.translate(-cx, -cy);
        pill(cx, cy, lab, s === 'rabatt' ? col.bad() : s === 'mwst' ? col.p() : col.W(), false, strip.x + strip.w - 6, strip.x + 6);
        g.restore();
      }
      // Kinder als Symbole über dem Streifen
      if (s === 'klasse') drawKids(X, y);
      // Griff am Ende des farbigen Teils
      const hx = X(handleP);
      if (!ctx.locked) {
        g.beginPath();
        g.arc(hx, y + h / 2, hover || dragging ? 15 : 12, 0, Math.PI * 2);
        g.fillStyle = withAlpha(col.p(), hover || dragging ? 0.3 : 0.16);
        g.fill();
      }
      g.save();
      g.fillStyle = theme.bg;
      g.strokeStyle = col.p();
      g.lineWidth = 2.6;
      roundRect(g, hx - 5, y + h / 2 - 12, 10, 24, 5);
      g.fill();
      g.stroke();
      g.restore();
      handlePx = [hx, y + h / 2];
    }
    let handlePx: Px = [0, 0];

    function drawKids(X: (p: number) => number, y: number): void {
      const g = surface.g;
      const theme = th();
      const n = Math.round(pr.G);
      const w = W();
      const cw = (X(100) - X(0)) / n;
      const r = clamp(cw * 0.32, 3, 9);
      const base = y - F(30, 27);
      for (let i = 0; i < n; i++) {
        const cx = X(0) + cw * (i + 0.5);
        const on = i < Math.floor(w + 1e-9) && !(hidden('W') || hidden('p'));
        const c = on ? col.W() : withAlpha(theme.text, 0.35);
        // Kopf und Körper
        g.beginPath();
        g.arc(cx, base - r * 2.6, r * 0.75, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
        g.beginPath();
        g.moveTo(cx - r, base);
        g.quadraticCurveTo(cx - r, base - r * 1.8, cx, base - r * 1.8);
        g.quadraticCurveTo(cx + r, base - r * 1.8, cx + r, base);
        g.closePath();
        g.fill();
      }
    }

    /* ---------- Karten ---------- */
    function ruleCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.W(), 0.02);
      title(R.x + pad, R.y + 16, ctx.t('ruleT'), col.W());
      const f = find();
      const rws = ruleOfThree(f, pr.G, pr.p);
      const top = R.y + 34;
      const avail = R.h - 34 - 10;
      const rh = Math.min(F(40, 34), avail / 3);
      const leftX = R.x + R.w * 0.36;
      const rightX = R.x + R.w * 0.64;
      const fs = font(700, F(15, 13.5));
      // Welche Zelle ist die gesuchte?
      const hide = (i: number, which: 'p' | 'v') => {
        if (pr.show) return false;
        if (i !== 2) return false;
        return (f === 'W' && which === 'v') || (f === 'p' && which === 'p') || (f === 'G' && which === 'v');
      };
      rws.forEach(([pp, v], i) => {
        const t = reduced ? 1 : clamp((rows.t * 3.2 - i) / 1, 0, 1);
        if (t <= 0) return;
        const e = ease.outCubic(t);
        const cy = top + rh * (i + 0.5);
        g.save();
        g.globalAlpha = e;
        g.translate(0, (1 - e) * 10);
        const isLast = i === 2;
        if (isLast) {
          g.fillStyle = withAlpha(col.W(), theme.dark ? 0.16 : 0.08);
          roundRect(g, R.x + pad, cy - rh / 2 + 3, R.w - 2 * pad, rh - 6, 8);
          g.fill();
        }
        const pTxt = hide(i, 'p') ? '?' : pct(pp);
        const vTxt = hide(i, 'v') ? '?' : val(v);
        text(g, pTxt, leftX, cy, { font: fs, color: col.p(), align: 'right' });
        text(g, '≙', R.x + R.w * 0.5, cy, { font: fs, color: theme.muted });
        text(g, vTxt, rightX, cy, { font: fs, color: col.W(), align: 'left' });
        g.restore();
        // Pfeile mit Rechenzeichen zwischen den Zeilen
        if (i > 0 && t > 0.3) {
          const [p0, v0] = rws[i - 1]!;
          const opP = pp > p0 ? `· ${fmt.num(pp / p0, 3)}` : `: ${fmt.num(p0 / pp, 3)}`;
          const opV = v > v0 ? `· ${fmt.num(v / v0, 3)}` : `: ${fmt.num(v0 / v, 3)}`;
          const yA = cy - rh + 8;
          const yB = cy - 8;
          g.save();
          g.globalAlpha = clamp((t - 0.3) / 0.7, 0, 1);
          for (const [x, side] of [
            [R.x + pad + 8, -1],
            [R.x + R.w - pad - 8, 1],
          ] as [number, number][]) {
            g.strokeStyle = theme.muted;
            g.lineWidth = 1.4;
            g.beginPath();
            g.moveTo(x, yA);
            g.quadraticCurveTo(x - side * 10, (yA + yB) / 2, x, yB);
            g.stroke();
            g.beginPath();
            g.moveTo(x, yB);
            g.lineTo(x + 3 - side * 1, yB - 6);
            g.lineTo(x - 4 - side * 1, yB - 4);
            g.closePath();
            g.fillStyle = theme.muted;
            g.fill();
            const ok = Number.isFinite(pp) && Number.isFinite(v) && pp > 0 && v > 0 && p0 > 0 && v0 > 0;
            if (ok && !(hide(i, side < 0 ? 'p' : 'v'))) text(g, side < 0 ? opP : opV, x + side * -14, (yA + yB) / 2, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: side < 0 ? 'left' : 'right' });
          }
          g.restore();
        }
      });
    }

    function formCard(R: Rect, compact: boolean): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('sitT'));
      const s = sit();
      const f = find();
      const kl = sit() === 'klasse';
      const qv = { G: val(pr.G, !kl), p: pct(pr.p), W: val(W(), !kl) };
      const q = tr(`q_${s}_${f}`, qv);
      const fq = font(500, F(13, 12));
      const lh = F(17, 16);
      const qRows = wrap(q, R.w - 2 * pad, fq);
      let y = R.y + 34;
      qRows.forEach((r, i) => text(g, r, R.x + pad, y + i * lh, { font: fq, color: theme.text, align: 'left' }));
      y += qRows.length * lh + 6;
      // Formel mit Zahlen
      const fm = font(700, F(14, 13));
      let line: string;
      if (f === 'W') line = `W = ${val(pr.G, false)} · ${fmt.num(pr.p, 0)}/100 = ${Q('W', val(W()))}`;
      else if (f === 'p') line = `p % = ${val(W(), false)} : ${val(pr.G, false)} = ${Q('p', pct(pr.p))}`;
      else line = pr.p === 0 ? 'G = ?' : `G = ${val(W(), false)} · 100/${fmt.num(pr.p, 0)} = ${Q('G', val(pr.G))}`;
      g.font = fm;
      let size = F(14, 13);
      while (g.measureText(line).width > R.w - 2 * pad && size > 10) {
        size -= 0.5;
        g.font = font(700, size);
      }
      text(g, line, R.x + pad, y + 8, { font: font(700, size), color: col.W(), align: 'left' });
      y += F(28, 24);
      // Zusatz: neuer Preis usw.
      const add: Record<Ctx, string | null> = {
        none: null,
        rabatt: tr('a_rabatt', { v: Q('W', val(discounted(pr.G, pr.p))) }),
        mwst: tr('a_mwst', { v: Q('W', val(gross(pr.G, pr.p))) }),
        zins: tr('a_zins', { v: Q('W', val(gross(pr.G, pr.p))) }),
        klasse: tr('a_klasse', { v: Q('W', val(pr.G - W())) }),
        twice: null,
      };
      const extra = s === 'klasse' && !isNice(W(), 0) ? ctx.t('noWhole') : add[s];
      if (extra && pr.show) {
        const bad = s === 'klasse' && !isNice(W(), 0);
        const er = wrap(extra, R.w - 2 * pad, font(600, F(13, 12)));
        er.forEach((row, i) => text(g, row, R.x + pad, y + 4 + i * 16, { font: font(600, F(13, 12)), color: bad ? col.bad() : s === 'rabatt' ? col.ok() : theme.text, align: 'left' }));
        y += F(24, 22) + (er.length - 1) * 16;
      }
      // Bruch
      if (!compact && Number.isInteger(pr.p) && pr.p > 0 && pr.p <= 100 && R.y + R.h - y > 40 && !hidden('p')) {
        const [a, b] = asFraction(pr.p);
        text(g, ctx.t('frac'), R.x + pad, y + 8, { font: font(600, 11.5), color: theme.muted, align: 'left' });
        const fx = R.x + pad + 90;
        const fy = y + 10;
        const ff = font(700, F(14, 13));
        text(g, `${fmt.num(pr.p, 0)} % =`, fx, fy, { font: ff, color: col.p(), align: 'left' });
        g.font = ff;
        const w0 = g.measureText(`${fmt.num(pr.p, 0)} % =`).width + 8;
        const drawFrac = (x: number, n: number, d: number) => {
          g.font = ff;
          const w = Math.max(g.measureText(String(n)).width, g.measureText(String(d)).width) + 6;
          text(g, String(n), x + w / 2, fy - 9, { font: ff, color: col.p() });
          text(g, String(d), x + w / 2, fy + 10, { font: ff, color: col.p() });
          g.fillStyle = col.p();
          g.fillRect(x, fy, w, 1.6);
          return w;
        };
        let x = fx + w0;
        x += drawFrac(x, Math.round(pr.p), 100) + 8;
        if (b !== 100) {
          text(g, '=', x, fy, { font: ff, color: col.p(), align: 'left' });
          x += 14;
          drawFrac(x, a, b);
        }
      }
    }

    /* ---------- Erst plus, dann minus ---------- */
    function drawTwice(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const G = pr.G;
      const pS = pShown;
      const r = upThenDown(G, pS);
      const padL = F(84, 64);
      const padR = F(30, 18);
      const k = (R.w - padL - padR) / Math.max(r.up, G);
      const x0 = R.x + padL;
      const bh = F(34, 28);
      const gapY = F(18, 12);
      const top = R.y + (R.h - (3 * bh + 2 * gapY)) / 2 + 8;
      const t = rows.running ? rows.value : 1;
      const fv = font(700, F(13, 12));
      const lab = font(700, F(12, 11));
      // Hilfslinie beim Anfangswert G
      g.save();
      g.setLineDash([5, 4]);
      g.strokeStyle = withAlpha(col.G(), 0.8);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(x0 + G * k, top - 10);
      g.lineTo(x0 + G * k, top + 3 * bh + 2 * gapY + 8);
      g.stroke();
      g.restore();
      const bar = (i: number, v: number, label: string, base: string, extra?: { from: number; to: number; color: string; txt: string }) => {
        const a = clamp(t * 3 - i, 0, 1);
        if (a <= 0) return;
        const y = top + i * (bh + gapY);
        const w = v * k * ease.outCubic(a);
        g.fillStyle = withAlpha(base, theme.dark ? 0.55 : 0.4);
        roundRect(g, x0, y, w, bh, 6);
        g.fill();
        g.strokeStyle = base;
        g.lineWidth = 1.5;
        roundRect(g, x0 + 0.5, y + 0.5, Math.max(1, w - 1), bh - 1, 6);
        g.stroke();
        if (extra && a >= 1) {
          const xa = x0 + extra.from * k;
          const xb = x0 + extra.to * k;
          g.fillStyle = withAlpha(extra.color, theme.dark ? 0.6 : 0.45);
          g.fillRect(Math.min(xa, xb), y + 3, Math.abs(xb - xa), bh - 6);
          if (Math.abs(xb - xa) > 30) text(g, extra.txt, (xa + xb) / 2, y + bh / 2, { font: font(700, F(11.5, 10.5)), color: theme.text });
          else text(g, extra.txt, Math.max(xa, xb) + 6, y + bh / 2, { font: font(700, F(11.5, 10.5)), color: extra.color, align: 'left' });
        }
        text(g, label, R.x + 10, y + bh / 2, { font: lab, color: theme.muted, align: 'left' });
        if (a >= 1) text(g, val(v), x0 + 10, y + bh / 2, { font: fv, color: theme.text, align: 'left' });
      };
      bar(0, G, ctx.t('tw_start'), col.G());
      bar(1, r.up, tr('tw_up', { p: pct(pS) }), col.ok(), { from: G, to: r.up, color: col.ok(), txt: `+ ${val(r.up - G)}` });
      bar(2, r.down, tr('tw_down', { p: pct(pS) }), col.W(), { from: r.up, to: r.down, color: col.bad(), txt: `− ${val(r.up - r.down)}` });
      // Lücke zum Anfangswert
      if (t >= 1 && G - r.down > 1e-9) {
        const y = top + 2 * (bh + gapY) + bh + 14;
        text(g, tr('tw_gap', { v: Q('W', val(G - r.down)) }), x0 + ((r.down + G) / 2) * k, y, { font: font(700, F(12, 11)), color: col.bad() });
      }
      const q = font(600, F(12.5, 11.5));
      wrap(tr('tw_q', { G: val(G), p: pct(pS) }), R.w - 24, q).forEach((row, i) => text(g, row, R.x + 12, R.y + 14 + i * 16, { font: q, color: theme.text, align: 'left' }));
    }

    function twiceFactCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.ok(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('tw_factT'), col.ok());
      const p = pr.p;
      const r = upThenDown(pr.G, p);
      const q1 = fmt.num(1 + p / 100, 2);
      const q2 = fmt.num(1 - p / 100, 2);
      const fv = font(700, F(14, 12.5));
      const lines: [string, string][] = [
        [tr('tw_f1', { p: pct(p), q1 }), col.ok()],
        [tr('tw_f2', { p: pct(p), q2 }), col.bad()],
        [tr('tw_f', { q1, q2, q: pr.show ? fmt.num(r.factor, 4) : '?' }), theme.text],
        [tr('tw_net', { n: pr.show ? pct(r.netPct).replace('-', '−') : '?' }), theme.text],
      ];
      let y = R.y + 40;
      for (const [str, c] of lines) {
        for (const row of wrap(str, R.w - 2 * pad, fv)) {
          if (y > R.y + R.h - 8) return;
          text(g, row, R.x + pad, y, { font: fv, color: c, align: 'left' });
          y += F(24, 21);
        }
      }
    }

    function twiceWhyCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const r = upThenDown(pr.G, pr.p);
      card(R);
      title(R.x + pad, R.y + 16, tr('tw_whyT', { G: val(pr.G) }));
      const f = font(500, F(12.5, 12));
      const str = tr('tw_why', { up: val(r.up), p: pct(pr.p), d2: Q('W', val(r.up - r.down)), d1: val(r.up - pr.G) });
      wrap(str, R.w - 2 * pad, f).forEach((row, i) => text(g, row, R.x + pad, R.y + 36 + i * 17, { font: f, color: theme.text, align: 'left' }));
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      const k = reduced || dragging ? 1 : 1 - Math.exp(-dt * 10);
      let moving = false;
      if (Math.abs(pShown - pr.p) > 0.01) {
        pShown += (pr.p - pShown) * k;
        moving = true;
      } else pShown = pr.p;
      const mt = maxPct();
      if (Math.abs(maxShown - mt) > 0.05) {
        maxShown += (mt - maxShown) * (reduced ? 1 : 1 - Math.exp(-dt * 5));
        moving = true;
      } else maxShown = mt;
      surface.begin();
      const lay = layout();
      if (sit() === 'twice') {
        drawTwice(lay.strip);
        if (lay.c2) {
          twiceFactCard(lay.c1);
          twiceWhyCard(lay.c2);
        } else {
          const rh = Math.min(F(170, 150), lay.c1.h * 0.55);
          twiceFactCard({ x: lay.c1.x, y: lay.c1.y, w: lay.c1.w, h: rh });
          twiceWhyCard({ x: lay.c1.x, y: lay.c1.y + rh + 8, w: lay.c1.w, h: lay.c1.h - rh - 8 });
        }
        if (moving || rows.running || pop.running) ctx.requestRender();
        return;
      }
      drawStrip();
      if (lay.c2) {
        ruleCard(lay.c1);
        formCard(lay.c2, false);
      } else {
        const rh = Math.min(F(170, 150), lay.c1.h * 0.5);
        ruleCard({ x: lay.c1.x, y: lay.c1.y, w: lay.c1.w, h: rh });
        formCard({ x: lay.c1.x, y: lay.c1.y + rh + 8, w: lay.c1.w, h: lay.c1.h - rh - 8 }, false);
      }
      if (moving || rows.running || pop.running) ctx.requestRender();
    }

    /* ---------- Ziehen ---------- */
    function pFromX(px: number): number {
      const { x0, k } = stripGeo();
      const q = (px - x0) / k;
      const s = sit();
      const p = s === 'rabatt' ? 100 - q : s === 'mwst' ? q - 100 : q;
      return Math.round(clamp(p, 0, s === 'rabatt' ? 100 : 150));
    }
    const near = (px: number, py: number) => Math.hypot(px - handlePx[0], py - handlePx[1]) < (surface.width >= 640 ? 20 : 26);
    surface.addTarget({
      contains: (px: number, py: number) => dragging || (!ctx.locked && sit() !== 'twice' && near(px, py)),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked || sit() === 'twice' || !near(q.px, q.py)) return false;
        dragging = true;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!dragging || ctx.locked) return;
        ctx.set({ p: pFromX(q.px) });
      },
      pointerUp: () => {
        dragging = false;
        surface.setCursor('');
        replay();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = !!q && !ctx.locked && near(q.px, q.py);
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    function replay(): void {
      rows.play();
      pop.play();
      ctx.requestRender();
    }
    replay();

    return {
      update(changed, source) {
        if (changed.has('sit') && source === 'input') ctx.set(START[sit()]);
        if (sit() === 'klasse' && pr.G > 40) ctx.set({ G: 40 });
        if ((sit() === 'rabatt' || sit() === 'twice') && pr.p > 100) ctx.set({ p: 100 });
        if (changed.has('find') || changed.has('sit') || changed.has('show') || source === 'replace') replay();
        else if (!dragging && (changed.has('G') || changed.has('p'))) {
          pop.play();
          ctx.requestRender();
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'dice' || ctx.locked) return;
        // glatte Werte würfeln, Lösung ausblenden
        const t = niceTask(Math.random);
        const G = sit() === 'klasse' ? [20, 24, 25, 28, 30, 32][Math.floor(Math.random() * 6)]! : t.G;
        const p = sit() === 'klasse' ? [25, 50, 75, 10, 20][Math.floor(Math.random() * 5)]! : sit() === 'mwst' ? (Math.random() < 0.5 ? 7 : 19) : t.p;
        const fs: Find[] = ['W', 'p', 'G'];
        ctx.set({ G, p, find: fs[Math.floor(Math.random() * 3)]!, show: false });
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
