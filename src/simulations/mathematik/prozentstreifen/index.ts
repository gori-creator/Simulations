import { defineSimulation, drawCard, ease, mixColor, offscreenCanvas, prefersReducedMotion, roundRect, scaledSprite, Surface, TapTarget, textOn, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { asFraction, changeSign, gridFill, isNice, problem, randomTask, ruleOfThree, shareRate, wrongBase, type Find, type Problem, type Sit } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Preisschild-Foto (Pixel in preisschild.webp): Bildbreite/-höhe und Breite des Schilds ohne die Schnur links. */
const TAG_IMG = { w: 1600, h: 615, body: 1275 } as const;
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Rep = 'grid' | 'pie';

/** Ausgangswerte je Situation (beim Umschalten von Hand). */
const START: Record<Sit, { G: number; p: number }> = {
  none: { G: 80, p: 25 },
  rabatt: { G: 60, p: 20 },
  mwst: { G: 50, p: 19 },
  zins: { G: 1200, p: 2.5 },
  klasse: { G: 28, p: 25 },
  erh: { G: 70, p: 20 },
};

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number; e: (t: number) => number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, delay: number, now: number, e: (t: number) => number = ease.inOutCubic): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur: Math.max(1, dur), e };
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, tw.e(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Namen der Situationen (Kopfzeile der Situationskarte). */
const SIT_NAME: Record<Sit, Txt> = {
  none: L('Prozent von einer Zahl', 'Percent of a number'),
  rabatt: L('Rabatt im Schlussverkauf', 'Sale discount'),
  erh: L('Preiserhöhung', 'Price increase'),
  mwst: L('Kassenbon mit Mehrwertsteuer', 'Receipt with VAT'),
  zins: L('Sparbuch mit Zinsen', 'Savings account'),
  klasse: L('Umfrage in der Klasse', 'Class survey'),
};

/** Fragen je Situation und gesuchter Größe; Platzhalter {G} {W} {p} {q}. */
const QUESTIONS: Record<Sit, Record<Find, Txt>> = {
  none: {
    W: L('Wie viel sind {p} von {G}?', 'What is {p} of {G}?'),
    p: L('Wie viel Prozent sind {W} von {G}?', 'What percentage of {G} is {W}?'),
    G: L('{W} sind {q}. Wie groß ist der Grundwert?', '{W} is {q}. What is the base value?'),
  },
  rabatt: {
    W: L('Ein Pullover kostet {G}. Im Schlussverkauf gibt es {p} Rabatt. Wie viel kostet er jetzt?', 'A jumper costs {G}. In the sale there is {p} off. What does it cost now?'),
    p: L('Ein Pullover kostete {G}, jetzt kostet er {W}. Wie viel Prozent Rabatt sind das?', 'A jumper cost {G} and now costs {W}. What percentage discount is that?'),
    G: L('Nach {p} Rabatt kostet ein Pullover {W}. Wie teuer war er vorher?', 'After {p} off, a jumper costs {W}. What did it cost before?'),
  },
  erh: {
    W: L('Ein Fahrrad kostet {G}. Der Preis steigt um {p}. Wie viel kostet es danach?', 'A bike costs {G}. The price goes up by {p}. What does it cost afterwards?'),
    p: L('Ein Fahrrad kostete {G}, jetzt kostet es {W}. Um wie viel Prozent ist der Preis gestiegen?', 'A bike cost {G} and now costs {W}. By what percentage did the price go up?'),
    G: L('Nach einer Preiserhöhung um {p} kostet ein Fahrrad {W}. Wie teuer war es vorher?', 'After a price rise of {p}, a bike costs {W}. What did it cost before?'),
  },
  mwst: {
    W: L('Kopfhörer kosten netto {G}. Dazu kommen {p} Mehrwertsteuer. Welcher Preis steht auf dem Kassenbon?', 'Headphones cost {G} before tax. {p} VAT is added. Which price is on the receipt?'),
    p: L('Netto {G}, auf dem Kassenbon {W}. Wie hoch ist der Steuersatz?', 'Net price {G}, on the receipt {W}. What is the tax rate?'),
    G: L('Auf dem Kassenbon stehen {W} mit {p} Mehrwertsteuer. Wie hoch ist der Nettopreis?', 'The receipt shows {W} including {p} VAT. What is the net price?'),
  },
  zins: {
    W: L('Auf dem Sparbuch liegen {G}. Der Zinssatz beträgt {p} im Jahr. Wie viele Zinsen gibt es nach einem Jahr?', 'There is {G} in a savings account at {p} per year. How much interest is paid after one year?'),
    p: L('Für {G} gibt es nach einem Jahr {W} Zinsen. Wie hoch ist der Zinssatz?', '{G} earns {W} interest in one year. What is the interest rate?'),
    G: L('Bei {p} Zinsen gibt es nach einem Jahr {W}. Wie viel Geld liegt auf dem Sparbuch?', 'At {p} interest, one year brings {W}. How much money is in the account?'),
  },
  klasse: {
    W: L('In der Klasse sind {G}. {p} davon kommen mit dem Rad zur Schule. Wie viele Kinder sind das?', 'There are {G} in the class. {p} come to school by bike. How many children is that?'),
    p: L('{G} wurden befragt, {W} davon kommen mit dem Rad zur Schule. Wie viel Prozent sind das?', '{G} were asked; {W} of them come to school by bike. What percentage is that?'),
    G: L('{W} kommen mit dem Rad, das sind {p} der Klasse. Wie viele Kinder sind in der Klasse?', '{W} come by bike, that is {p} of the class. How many children are in the class?'),
  },
};

/**
 * Prozentstreifen für die Jahrgangsstufen 6/7: oben die Prozentskala, unten die
 * Werte; der Grundwert ≙ 100 % ist der ganze Streifen, der Prozentwert der
 * gefärbte Teil (ziehbarer Griff). Hauptanimation „Dreisatz am Streifen“: Der
 * Streifen zerfällt in 100 Teile (1 % ≙ G : 100), dann werden p Teile gezählt;
 * beim gesuchten Grundwert rückwärts. Dazu gezeichnete Alltagssituationen
 * (Preisschild, Kassenbon, Sparbuch, Umfrage), Hunderterfeld oder Kreis mit
 * Bruch, vermehrter und verminderter Grundwert und der Stolperstein beim
 * Zurückrechnen mit zwei Streifen.
 */
export default defineSimulation({
  id: 'prozentstreifen',
  dragHint: true,
  hint: { de: 'Tipp: Zieh das Ende des gefärbten Streifens.', en: 'Tip: Drag the end of the coloured strip.' },
  layout: { aspect: 1.2, aspectNarrow: 0.36 },
  images: { tag: 'preisschild.webp', receipt: 'kassenbon.webp', book: 'sparbuch.webp' },
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
        { value: 'erh', label: L('Preiserhöhung', 'Price increase') },
        { value: 'mwst', label: L('Mehrwertsteuer', 'VAT') },
        { value: 'zins', label: L('Zinsen', 'Interest') },
        { value: 'klasse', label: L('Umfrage', 'Survey') },
      ],
      default: 'none',
    },
    {
      key: 'find',
      type: 'choice',
      label: L('Gesucht', 'Find'),
      help: L('Bei Rabatt, Preiserhöhung und Mehrwertsteuer ist der Prozentwert der neue Preis.', 'For discount, price increase and VAT the percentage value is the new price.'),
      options: [
        { value: 'W', label: L('Prozentwert W', 'Percentage value W') },
        { value: 'p', label: L('Prozentsatz p %', 'Rate p %') },
        { value: 'G', label: L('Grundwert G', 'Base value G') },
      ],
      default: 'W',
    },
    { key: 'G', type: 'number', group: 'val', label: L('Grundwert G (≙ 100 %)', 'Base value G (≙ 100 %)'), min: 1, max: 2000, step: 1, default: 80 },
    {
      key: 'p',
      type: 'number',
      group: 'val',
      label: L('Prozentsatz p', 'Rate p'),
      help: L('Bei Rabatt, Erhöhung, Steuer und Zinsen: der Satz aus der Aufgabe. Auch den Griff am Streifen ziehen.', 'For discount, increase, tax and interest: the rate from the task. You can also drag the handle on the bar.'),
      min: 0,
      max: 150,
      step: 0.5,
      default: 25,
      unit: '%',
    },
    {
      key: 'rep',
      type: 'choice',
      group: 'view',
      label: L('Zweite Darstellung', 'Second picture'),
      options: [
        { value: 'grid', label: L('Hunderterfeld', 'Hundred square') },
        { value: 'pie', label: L('Kreis', 'Circle') },
      ],
      default: 'grid',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösung zeigen', 'Show the solution'), help: L('Aus: Die gesuchte Größe erscheint als „?“ – im Bild und in den Karten.', 'Off: the unknown appears as “?” – in the picture and on the cards.'), default: true },
  ],
  actions: [
    { id: 'solve', label: L('Dreisatz am Streifen', 'Rule of three on the bar'), primary: true },
    { id: 'task', label: L('Neue Aufgabe', 'New task') },
  ],
  readouts: [
    { key: 'giv', label: L('Gegeben', 'Given') },
    { key: 'calc', label: L('Dreisatz', 'Rule of three'), spoiler: true },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'extra', label: L('Im Sachzusammenhang', 'In context'), spoiler: true },
    { key: 'frac', label: L('Als Bruch und Dezimalzahl', 'As a fraction and decimal'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('25 % von 80 €', '25 % of €80'), values: {} },
    { id: 'umfrage', label: L('12 von 48 – wie viel Prozent?', '12 of 48 – what percentage?'), values: { sit: 'klasse', find: 'p', G: 48, p: 25 } },
    { id: 'rabatt', label: L('20 % Rabatt auf 60 €', '20 % off €60'), values: { sit: 'rabatt', G: 60, p: 20 } },
    { id: 'mwst', label: L('Kassenbon: 19 % MwSt', 'Receipt: 19 % VAT'), values: { sit: 'mwst', G: 50, p: 19 } },
    { id: 'zins', label: L('Sparbuch: 2,5 % Zinsen', 'Savings: 2.5 % interest'), values: { sit: 'zins', G: 1200, p: 2.5 } },
    { id: 'falle', label: L('Stolperstein: 84 € nach +20 %', 'Pitfall: €84 after +20 %'), values: { sit: 'erh', find: 'G', G: 70, p: 20 } },
  ],
  strings: {
    de: {
      canvas:
        'Oben eine gezeichnete Alltagssituation mit Frage (Preisschild, Kassenbon, Sparbuch oder Umfrage). Darunter der Prozentstreifen: oben die Prozentskala, unten die Werte; der ganze Streifen bis 100 % ist der Grundwert, der gefärbte Teil der Prozentwert, sein Ende lässt sich ziehen. Unten der Dreisatz Schritt für Schritt, ein Hunderterfeld oder Kreis mit Bruch und eine Merke-Karte.',
    },
    en: {
      canvas:
        'At the top an everyday situation with a question (price tag, receipt, savings book or survey). Below it the percentage bar: percent scale on top, values underneath; the whole bar up to 100 % is the base value, the coloured part the percentage value, and its end can be dragged. At the bottom the rule of three step by step, a hundred square or circle with the fraction, and a key-fact card.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const pr = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: Txt) => s[lang];
    const sit = () => pr.sit as Sit;
    const find = () => pr.find as Find;
    const rep = () => pr.rep as Rep;
    const sgn = () => changeSign(sit());
    const P = (): Problem => problem(sit(), find(), pr.G, pr.p);

    /* ---------- Farben: gleiche Größe = gleiche Farbe ---------- */
    const col = {
      W: () => th().series[0]!,
      G: () => th().series[4]!,
      p: () => th().series[3]!,
      down: () => th().series[1]!,
      up: () => th().series[2]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
    };
    /** Farbe des Änderungsteils (Rabatt rot, Aufschlag grün) */
    const colD = () => (sgn() < 0 ? col.down() : col.up());

    /* ---------- Zahlen ---------- */
    const money = () => sit() === 'rabatt' || sit() === 'mwst' || sit() === 'zins' || sit() === 'erh';
    const people = () => sit() === 'klasse';
    /** Zahl ohne Einheit: Geld mit Cent (glatte Euro ohne), sonst bis 3 Stellen. */
    function num(v: number): string {
      if (!Number.isFinite(v)) return '–';
      if (money()) return isNice(v, 0) ? fmt.num(v, 0) : fmt.fixed(v, 2);
      return fmt.num(v, 3);
    }
    /** Zahl mit Einheit: „20 €“ / „€20“, „7 Kinder“. */
    function val(v: number): string {
      if (!Number.isFinite(v)) return '–';
      const approx = money() && !isNice(v, 2) ? '≈ ' : '';
      if (money()) return lang === 'de' ? `${approx}${num(v)} €` : `${approx}€${num(v)}`;
      if (people()) return `${num(v)} ${Math.abs(v - 1) < 1e-9 ? say(L('Kind', 'child')) : say(L('Kinder', 'children'))}`;
      return num(v);
    }
    /** Angezeigter (gleitender) Wert: auf Cent gerundet, ohne „≈“. */
    function valS(v: number): string {
      return val(money() ? Math.round(v * 100) / 100 : Math.round(v * 1000) / 1000);
    }
    const pct = (q: number) => (Number.isFinite(q) ? `${fmt.num(q, 2)} %` : '–');
    /** Grundwert nicht bestimmbar: gesucht, aber Prozentsatz des Prozentwerts 0 % (W ist dann immer 0). */
    const gUndef = () => find() === 'G' && !(shareRate(sit(), pr.p) > 0);
    /** Gesuchte Größe verdeckt (Lösung aus) – der unbestimmbare Grundwert immer. */
    const hidden = (k: Find) => (!pr.show && find() === k) || (k === 'G' && gUndef());
    const Q = (k: Find, s: string) => (hidden(k) ? '?' : s);

    /* ---------- angezeigter Zustand ---------- */
    const maxPct = (q: number) => Math.max(100, Math.ceil(q / 10) * 10);
    const QS = new Chan(shareRate(sit(), pr.p));
    const GS = new Chan(pr.G);
    const MX = new Chan(maxPct(shareRate(sit(), pr.p)));
    const TRAP = new Chan(0);
    const allChans = () => [QS, GS, MX, TRAP];

    let intro: number | null = null;
    let sceneFade: number | null = null;
    let cardFade: number | null = null;
    let solve: { t0: number; dur3: number } | null = null;
    let drag = false;
    let hover: 'handle' | 'strip' | null = null;
    let hoverCell = -1;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    const dragging = () => drag || performance.now() - lastDrag < 250;

    const trapWanted = () => sgn() !== 0 && find() === 'G' && pr.show && shareRate(sit(), pr.p) > 0 && !solve;

    /* ---------- Aufteilung ---------- */
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    const isPhone = () => surface.width < 560 && surface.height > surface.width * 1.2;
    /** Viel Platz (Desktop): größere Szene und größerer Streifen; sonst kompakt (Tablet, Handy). */
    const roomy = () => !isPhone() && surface.height >= 600;
    const TRAP_H = () => (roomy() ? 62 : 50);
    function stripBaseH(): number {
      const S = { x: 0, y: 0, w: surface.width, h: 0 };
      return Math.round(geo(S).gPillY + (roomy() ? 22 : 18));
    }
    /** Höhe der Situationskarte auf dem Handy: Bild oben, Frage darunter. */
    function phoneSceneH(): number {
      const lines = wrapText(question(P()), surface.width - 20, `600 13px ${th().font}`).length;
      return Math.round(9 + 100 + 10 + Math.min(5, lines) * 13 * 1.32 + 12);
    }
    function regions(): { scene: Rect; strip: Rect; cards: Rect; cols: number } {
      const w = surface.width;
      const h = surface.height;
      const phone = isPhone();
      const gap = phone ? 8 : 10;
      const sceneH = phone ? phoneSceneH() : roomy() ? 150 : trapWanted() ? 96 : 112;
      const stripH = Math.round(stripBaseH() + TRAP.v * TRAP_H());
      const scene = { x: 0, y: 0, w, h: sceneH };
      const strip = { x: 0, y: sceneH + gap, w, h: stripH };
      const cy = strip.y + stripH + gap;
      const cards = { x: 0, y: cy, w, h: h - cy };
      return { scene, strip, cards, cols: phone ? 1 : w >= 740 ? 3 : 2 };
    }

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({
      W: col.W(),
      G: col.G(),
      p: col.p(),
      d: colD(),
      ok: col.ok(),
      bad: col.bad(),
      m: th().muted,
    });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    /** Text für die Formel-Kurzschrift: Wörter aufrecht, damit einzelne Buchstaben nicht kursiv werden. */
    const up = (s: string) => `\\t{${s}}`;

    /* ---------- Zeichenhilfen ---------- */
    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect, accent?: string): void {
      drawCard(surface.g, r, ctx.theme, accent);
    }

    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      const rb = right ? formula(g, right, fstyle(fs(12.5, 11.5), color, 700)) : null;
      const room0 = R.w - 2 * pad - 15 - (rb ? rb.w + 10 : 0);
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      if (rb) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      for (const para of str.split('\n')) {
        let cur = '';
        // geschützte Leerzeichen: „20 %“, „60 €“ nicht trennen
        for (const w of para.replace(/ (%|€|Kinder|children)/g, ' $1').split(' ')) {
          const test = cur ? `${cur} ${w}` : w;
          if (g.measureText(test).width > maxW && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
      }
      return lines;
    }

    function label(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', halo = false): void {
      const g = surface.g;
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      if (halo) {
        g.lineWidth = 4;
        g.lineJoin = 'round';
        g.strokeStyle = th().dark ? 'rgba(21,28,39,0.92)' : 'rgba(255,255,255,0.95)';
        g.strokeText(str, x, y);
      }
      g.fillStyle = color;
      g.fillText(str, x, y);
    }

    /** Formel-Pille (Hintergrund, Rand) um den Mittelpunkt (x, y); an `bounds` geklemmt. */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; size?: number; alpha?: number; bounds?: Rect; scale?: number; fill?: string } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const box = formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      let left = x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 9, opts.bounds.x + opts.bounds.w - box.w - 9);
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 8, y: base - box.asc - 4, w: box.w + 16, h: box.asc + box.desc + 8 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      const sc = opts.scale ?? 1;
      if (sc !== 1) {
        const cx = rr.x + rr.w / 2;
        g.translate(cx, y);
        g.scale(sc, sc);
        g.translate(-cx, -y);
      }
      g.save();
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.95)' : 'rgba(255,255,255,0.97)');
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 7;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Geschweifte Klammer von x0 bis x1 auf Höhe y; dir = 1: Spitze nach unten, −1: nach oben. */
    function brace(x0: number, x1: number, y: number, dir: 1 | -1, color: string, alpha = 1, prog = 1): void {
      if (x1 - x0 < 4 || alpha <= 0.01) return;
      const g = surface.g;
      const d = 7 * dir;
      const m = (x0 + x1) / 2;
      const c = Math.min(8, (x1 - x0) / 4);
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.9;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      // von der Mitte nach außen „zeichnen“
      const half = (x1 - x0) / 2;
      const reach = half * prog;
      g.beginPath();
      g.moveTo(m, y + d);
      g.quadraticCurveTo(m, y, m - Math.min(c, reach), y);
      g.lineTo(m - Math.max(Math.min(c, reach), reach - c), y);
      if (prog > 0.98) g.quadraticCurveTo(x0, y, x0, y - d);
      g.moveTo(m, y + d);
      g.quadraticCurveTo(m, y, m + Math.min(c, reach), y);
      g.lineTo(m + Math.max(Math.min(c, reach), reach - c), y);
      if (prog > 0.98) g.quadraticCurveTo(x1, y, x1, y - d);
      g.stroke();
      g.restore();
    }

    /** Schraffur (für Rabatt und unbekannte Teile). */
    function hatch(x: number, y: number, w: number, h: number, color: string, gapPx = 7): void {
      if (w <= 0.5) return;
      const g = surface.g;
      g.save();
      g.beginPath();
      g.rect(x, y, w, h);
      g.clip();
      g.strokeStyle = color;
      g.lineWidth = 1.3;
      g.beginPath();
      for (let s = -h; s < w + h; s += gapPx) {
        g.moveTo(x + s, y + h);
        g.lineTo(x + s + h, y);
      }
      g.stroke();
      g.restore();
    }

    /** Beschriftungen in einer Zeile ohne Überlappung (höhere Priorität zuerst). */
    function labelRow(items: { x: number; s: string; font: string; color: string; prio: number }[], y: number, minX: number, maxX: number): void {
      const g = surface.g;
      const placed: [number, number][] = [];
      const sorted = [...items].sort((a, b) => b.prio - a.prio);
      for (const it of sorted) {
        g.font = it.font;
        const w = g.measureText(it.s).width;
        let x0 = it.x - w / 2;
        x0 = clamp(x0, minX, maxX - w);
        const x1 = x0 + w;
        if (placed.some(([a, b]) => x0 < b + 6 && x1 > a - 6)) continue;
        placed.push([x0, x1]);
        label(it.s, x0, y, it.font, it.color, 'left');
      }
    }

    /* =====================================================================
     * Einstieg und Hauptanimation
     * ===================================================================== */
    interface Intro {
      panel: number;
      fill: number;
      labels: number;
      cards: number;
      stagger: number;
      scene: number;
    }
    const DONE: Intro = { panel: 1, fill: 1, labels: 1, cards: 1, stagger: 1, scene: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3000) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        fill: ease.inOutCubic(clamp01((t - 250) / 1100)),
        labels: ease.outCubic(clamp01((t - 900) / 700)),
        cards: clamp01((t - 400) / 900),
        stagger: clamp01((t - 800) / 1500),
        scene: ease.outBack(clamp01((t - 150) / 650)),
      };
    }

    /** Zeitplan „Dreisatz am Streifen“ (ms). */
    const T1 = 700;
    const T2 = 1750;
    const T3 = 2500;
    interface SolveK {
      on: boolean;
      /** ① Startzeile hervorheben */
      a: number;
      /** Teilstriche erscheinen */
      div: number;
      /** ② 1 % herausgehoben */
      one: number;
      /** ③ gezählter Prozentsatz (null außerhalb der Zählphase) */
      count: number | null;
      /** ③ Ergebnis */
      res: number;
      /** Fortschritt der Zählphase 0…1 */
      cnt: number;
    }
    const SOLVE_DONE: SolveK = { on: false, a: 1, div: 0, one: 0, count: null, res: 1, cnt: 1 };
    function solveTarget(): number {
      return find() === 'G' ? 100 : shareRate(sit(), pr.p);
    }
    function solveK(now: number): SolveK {
      if (!solve) return SOLVE_DONE;
      const t = now - solve.t0;
      const end3 = T3 + solve.dur3;
      const target = solveTarget();
      const cnt = clamp01((t - T3) / solve.dur3);
      let count: number | null = null;
      if (t >= T3) {
        const raw = ease.inOutCubic(cnt) * target;
        count = cnt >= 1 ? target : Math.min(target, Math.floor(raw + 1e-9));
      }
      return {
        on: true,
        a: ease.outCubic(clamp01(t / 500)),
        div: clamp01((t - T1) / (T2 - T1)),
        one: ease.outBack(clamp01((t - T2) / 550)),
        count,
        res: ease.outBack(clamp01((t - end3 - 150) / 550)),
        cnt,
      };
    }
    function solveEnd(): number {
      return solve ? T3 + solve.dur3 + 2600 : 0;
    }

    /* =====================================================================
     * Situationskarte mit gezeichneter Szene
     * ===================================================================== */
    /** Foto passend skaliert, optional abgedunkelt (nur das Motiv, nicht der durchsichtige Rand); zwischengespeichert. */
    const photoCache = new Map<string, HTMLCanvasElement>();
    function photoSprite(img: HTMLImageElement, w: number, h: number, dim: number, crop?: Rect): HTMLCanvasElement {
      const base = scaledSprite(img, w, h, surface.dpr, crop ? { crop } : {});
      if (dim <= 0) return base;
      const key = `${img.src}|${Math.round(w * 2)}|${Math.round(h * 2)}|${dim}|${crop ? `${crop.y},${crop.h}` : ''}`;
      const hit = photoCache.get(key);
      if (hit) return hit;
      if (photoCache.size > 12) photoCache.clear();
      const { canvas, g: o } = offscreenCanvas(w, h, surface.dpr);
      o.drawImage(base, 0, 0, w, h);
      o.globalCompositeOperation = 'source-atop';
      o.fillStyle = withAlpha(th().bg, dim);
      o.fillRect(0, 0, w, h);
      photoCache.set(key, canvas);
      return canvas;
    }
    const paperCol = () => (th().dark ? '#232b38' : '#fffdf7');
    const inkCol = () => (th().dark ? '#e6e9ef' : '#2b2f36');

    function drawScene(R: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const pb = P();
      card(R, sceneAccent());
      const phone = isPhone();
      const pad = fs(14, 10);
      const illW = Math.round(phone ? R.w * 0.5 : clamp(R.w * 0.3, 150, 240));
      const ill: Rect = phone ? { x: R.x + pad, y: R.y + 9, w: illW, h: 100 } : { x: R.x + pad, y: R.y + 9, w: illW, h: R.h - 18 };
      // Bild mit kleiner „Pop“-Animation beim Wechsel
      let pop = k.scene;
      if (sceneFade !== null) pop = Math.min(pop, ease.outBack(clamp01((now - sceneFade) / 600)));
      g.save();
      g.globalAlpha *= clamp01(pop * 1.5);
      const cx = ill.x + ill.w / 2;
      const cy = ill.y + ill.h / 2;
      const sc = 0.82 + 0.18 * pop;
      g.translate(cx, cy);
      g.scale(sc, sc);
      g.translate(-cx, -cy);
      const s = sit();
      if (s === 'rabatt' || s === 'erh') drawTag(ill, pb);
      else if (s === 'mwst') drawReceipt(ill, pb);
      else if (s === 'zins') drawBook(ill, pb);
      else if (s === 'klasse') drawBoard(ill, pb);
      else drawPercentBadge(ill, pb);
      g.restore();
      const fade = sceneFade !== null ? ease.outCubic(clamp01((now - sceneFade - 100) / 500)) : 1;
      g.save();
      g.globalAlpha *= fade * clamp01(k.scene * 1.4);
      const tx = ill.x + ill.w + fs(18, 10);
      const tw = R.x + R.w - pad - tx;
      const tsz = fs(12, 11);
      const tFont = `750 ${tsz}px ${th().font}`;
      const titleLines = wrapText(say(SIT_NAME[s]).toUpperCase(), tw, tFont);
      titleLines.slice(0, 2).forEach((ln, i) => label(ln, tx, R.y + pad + 6 + i * (tsz + 3), tFont, sceneAccent(), 'left'));
      const titleBottom = R.y + pad + 6 + (Math.min(2, titleLines.length) - 1) * (tsz + 3) + tsz;
      // Frage: rechts neben dem Bild, auf dem Handy darunter über die ganze Breite
      const qx = phone ? R.x + pad : tx;
      const qw = phone ? R.w - 2 * pad : tw;
      const roomy = !phone && surface.height >= 600;
      const qs = phone ? 13 : roomy ? 16 : 14;
      const qText = question(pb);
      let qsz = qs;
      let lines = wrapText(qText, qw, `600 ${qsz}px ${th().font}`);
      const tooTall = () => !phone && titleBottom + 6 + lines.length * qsz * 1.32 + 30 > R.y + R.h - 4;
      while ((lines.length > (phone ? 5 : 3) || tooTall()) && qsz > 11.5) {
        qsz -= 0.5;
        lines = wrapText(qText, qw, `600 ${qsz}px ${th().font}`);
      }
      const lh = qsz * 1.32;
      const y0 = phone ? ill.y + ill.h + 10 + lh / 2 : titleBottom + 6 + lh / 2;
      lines.forEach((ln, i) => label(ln, qx, y0 + i * lh, `600 ${qsz}px ${th().font}`, th().text, 'left'));
      // Größen als farbige Kärtchen: gegeben mit Wert, gesucht mit „?“
      const f = find();
      const chipSz = fs(roomy ? 13 : 12, 11.5);
      const chips: { src: string; c: string; unknown: boolean }[] = [
        { src: `${roomy ? findGName() : '\\c{G}{G}'} \\c{G}{= ${f === 'G' ? '?' : val(pb.G)}}`, c: col.G(), unknown: f === 'G' },
        { src: `${roomy ? findPName() : '\\c{p}{p}'} \\c{p}{= ${f === 'p' ? '?' : pct(pb.p)}}`, c: col.p(), unknown: f === 'p' },
        { src: `${roomy ? findWName() : '\\c{W}{W}'} \\c{W}{= ${f === 'W' ? '?' : val(pb.W)}}`, c: col.W(), unknown: f === 'W' },
      ];
      if (phone) {
        let cyy = titleBottom + 16;
        for (const ch of chips) {
          const box = formula(g, ch.src, fstyle(chipSz, ch.c, 700));
          fpill(tx + box.w / 2 + 8, cyy, ch.src, { color: ch.c, border: withAlpha(ch.c, ch.unknown ? 1 : 0.5), size: chipSz, fill: ch.unknown ? mixColor(ch.c, th().dark ? '#151c27' : '#ffffff', 0.85) : undefined });
          cyy += 24;
        }
      } else {
        let cxx = tx;
        const py = Math.min(R.y + R.h - 16, y0 + (lines.length - 0.5) * lh + 17);
        for (const ch of chips) {
          const box = formula(g, ch.src, fstyle(chipSz, ch.c, 700));
          if (cxx + box.w + 16 > R.x + R.w - pad) break;
          fpill(cxx + box.w / 2 + 8, py, ch.src, { color: ch.c, border: withAlpha(ch.c, ch.unknown ? 1 : 0.5), size: chipSz, fill: ch.unknown ? mixColor(ch.c, th().dark ? '#151c27' : '#ffffff', 0.85) : undefined });
          cxx += box.w + 16 + 8;
        }
      }
      g.restore();
    }

    function sceneAccent(): string {
      const s = sit();
      if (s === 'rabatt') return col.down();
      if (s === 'erh' || s === 'mwst') return col.up();
      if (s === 'zins') return th().series[5]!;
      return col.W();
    }
    const findWName = () => {
      const s = sit();
      const w = s === 'rabatt' || s === 'erh' ? say(L('neuer Preis', 'new price')) : s === 'mwst' ? say(L('Bruttopreis', 'gross price')) : s === 'zins' ? say(L('Zinsen', 'interest')) : s === 'klasse' ? say(L('Anzahl', 'number')) : say(L('Prozentwert', 'percentage value'));
      return `\\c{W}{${up(w)} W}`;
    };
    const findPName = () => {
      const s = sit();
      const w = s === 'rabatt' ? say(L('Rabatt', 'discount')) : s === 'erh' ? say(L('Erhöhung', 'increase')) : s === 'mwst' ? say(L('Steuersatz', 'tax rate')) : s === 'zins' ? say(L('Zinssatz', 'interest rate')) : say(L('Prozentsatz', 'rate'));
      return `\\c{p}{${up(w)} p}`;
    };
    const findGName = () => {
      const s = sit();
      const w = s === 'rabatt' || s === 'erh' ? say(L('alter Preis', 'old price')) : s === 'mwst' ? say(L('Nettopreis', 'net price')) : s === 'zins' ? say(L('Kapital', 'capital')) : s === 'klasse' ? say(L('ganze Klasse', 'whole class')) : say(L('Grundwert', 'base value'));
      return `\\c{G}{${up(w)} G}`;
    };

    function question(pb: Problem): string {
      const t = say(QUESTIONS[pb.sit][pb.find]);
      return t.replace(/\{(\w+)\}/g, (_m, key: string) => (key === 'G' ? val(pb.G) : key === 'W' ? val(pb.W) : key === 'p' ? pct(pb.p) : key === 'q' ? pct(pb.q) : ''));
    }

    /** Preisschild für Rabatt und Preiserhöhung. */
    function drawTag(R: Rect, pb: Problem): void {
      const g = surface.g;
      const dark = th().dark;
      const tagImg = ctx.images.get('tag');
      // Mit Foto: Schild (ohne Schnur) TAG_IMG.body breit, Höhe aus dem Seitenverhältnis; die Schnur ragt links hinaus
      const T = TAG_IMG;
      const w = tagImg ? Math.min((R.w * 0.94 * T.body) / T.w, (R.h * 0.8 * T.body) / T.h) : Math.min(R.w * 0.86, R.h * 1.55);
      const h = tagImg ? (w * T.h) / T.body : Math.min(R.h * 0.78, w * 0.66);
      const cx = R.x + R.w / 2 + 4 + (tagImg ? (w * (T.w - T.body)) / T.body / 2 : 0);
      const cy = R.y + R.h / 2 + 6;
      g.save();
      g.translate(cx, cy);
      g.rotate(-0.07);
      if (tagImg) {
        const k = w / T.body;
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.2)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        // im Dunkelmodus deutlich abgedunkelt, damit die hellen Schriftfarben lesbar bleiben
        g.drawImage(photoSprite(tagImg, T.w * k, h, dark ? 0.62 : 0), -w / 2 - (T.w - T.body) * k, -h / 2, T.w * k, h);
        g.restore();
      }
      // Schnur
      const tagGA = g.globalAlpha;
      if (tagImg) g.globalAlpha = 0;
      g.strokeStyle = dark ? '#8b7a62' : '#b59a72';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(-w / 2 + h * 0.3, -h * 0.02);
      g.bezierCurveTo(-w / 2 - 6, -h * 0.5, -w / 2 + 6, -h * 0.9, -w / 2 - 8, -h * 0.75);
      g.stroke();
      // Schild mit Spitze links
      const nx = -w / 2;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const grad = g.createLinearGradient(0, -h / 2, 0, h / 2);
      grad.addColorStop(0, dark ? '#3a3326' : '#fff8e6');
      grad.addColorStop(1, dark ? '#2c271e' : '#fbe9c2');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(nx + h * 0.32, -h / 2);
      g.lineTo(w / 2 - 6, -h / 2);
      g.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + 6);
      g.lineTo(w / 2, h / 2 - 6);
      g.quadraticCurveTo(w / 2, h / 2, w / 2 - 6, h / 2);
      g.lineTo(nx + h * 0.32, h / 2);
      g.lineTo(nx, 0);
      g.closePath();
      g.fill();
      g.restore();
      g.strokeStyle = dark ? '#6b5d45' : '#d8bf8e';
      g.lineWidth = 1.2;
      g.stroke();
      // Loch
      g.fillStyle = th().bg;
      g.beginPath();
      g.arc(nx + h * 0.3, 0, Math.max(3, h * 0.07), 0, TAU);
      g.fill();
      g.strokeStyle = dark ? '#8b7a62' : '#c7ab7e';
      g.stroke();
      g.globalAlpha = tagGA;
      // Preise
      const x0 = nx + h * 0.55;
      const fBig = Math.round(clamp(h * 0.3, 15, 26));
      const fSmall = Math.round(clamp(h * 0.17, 11, 15));
      const oldS = Q('G', val(pb.G));
      const newS = Q('W', val(pb.W));
      label(oldS, x0, -h * 0.2, `700 ${fSmall}px ${th().font}`, mixColor(inkCol(), th().bg, 0.35), 'left');
      g.font = `700 ${fSmall}px ${th().font}`;
      const ow = g.measureText(oldS).width;
      if (oldS !== '?') {
        g.strokeStyle = col.G();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0 - 2, -h * 0.2 + 1);
        g.lineTo(x0 + ow + 2, -h * 0.2 - 2);
        g.stroke();
      }
      label(newS, x0, h * 0.17, `800 ${fBig}px ${th().font}`, col.W(), 'left');
      // Plakette
      const br = clamp(h * 0.29, 15, 26);
      const bx = w / 2 - br * 0.55;
      const by = -h / 2 + br * 0.35;
      const bc = colD();
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      const bg = g.createRadialGradient(bx - br * 0.3, by - br * 0.3, 1, bx, by, br);
      bg.addColorStop(0, mixColor(bc, '#ffffff', 0.3));
      bg.addColorStop(1, bc);
      g.fillStyle = bg;
      g.beginPath();
      // gezackter Rand
      for (let i = 0; i <= 24; i++) {
        const a = (i / 24) * TAU;
        const rr = i % 2 === 0 ? br : br * 0.88;
        const px = bx + Math.cos(a) * rr;
        const py = by + Math.sin(a) * rr;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      g.fill();
      g.restore();
      const badge = hidden('p') ? '?' : `${pb.sit === 'rabatt' ? '−' : '+'}${fmt.num(pb.p, 1)} %`;
      g.font = `800 ${Math.round(br * 0.52)}px ${th().font}`;
      let bs = Math.round(br * 0.52);
      while (g.measureText(badge).width > br * 1.6 && bs > 9) {
        bs -= 1;
        g.font = `800 ${bs}px ${th().font}`;
      }
      label(badge, bx, by + 0.5, `800 ${bs}px ${th().font}`, textOn(bc, th()));
      g.restore();
    }

    /** Kassenbon mit Netto, Mehrwertsteuer und Summe. */
    function drawReceipt(R: Rect, pb: Problem): void {
      const g = surface.g;
      const dark = th().dark;
      const w = Math.min(R.w * 0.84, 190);
      const h = R.h - 4;
      const x = R.x + (R.w - w) / 2;
      const y = R.y + 2;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 9;
      g.shadowOffsetY = 3;
      const zz = 7;
      const receiptImg = ctx.images.get('receipt');
      if (receiptImg) {
        // Foto: unterer Teil des langen Bons (mit gezacktem Rand) im Seitenverhältnis des Felds ausgeschnitten, unverzerrt
        const iw = receiptImg.naturalWidth;
        const ih = receiptImg.naturalHeight;
        const ch = Math.min(ih, (iw * h) / w);
        g.drawImage(photoSprite(receiptImg, w, h, dark ? 0.8 : 0, { x: 0, y: ih - ch, w: iw, h: ch }), x, y, w, h);
      } else {
        g.fillStyle = paperCol();
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + w, y);
        const n = Math.max(6, Math.round(w / 12));
        g.lineTo(x + w, y + h - zz);
        for (let i = n; i >= 0; i--) g.lineTo(x + (w * i) / n, y + h - (i % 2 === 0 ? zz : 0));
        g.closePath();
        g.fill();
      }
      g.restore();
      const mono = (wt: number, sz: number) => `${wt} ${sz}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      const fsz = clamp(Math.round(h * 0.11), 10.5, 13);
      const rows = h > 96 ? 4 : 3;
      const lh = (h - zz - 14) / (rows + 0.6);
      let yy = y + 8 + lh * 0.5;
      if (rows === 4) {
        label(say(L('KASSENBON', 'RECEIPT')), x + w / 2, yy, mono(700, fsz - 0.5), mixColor(inkCol(), th().bg, 0.45));
        yy += lh;
      }
      const row = (l: string, r: string, c: string, bold = false) => {
        label(l, x + 10, yy, mono(bold ? 800 : 600, fsz), inkCol(), 'left');
        label(r, x + w - 10, yy, mono(bold ? 800 : 700, fsz), c, 'right');
        yy += lh;
      };
      const eur = (v: number) => (Number.isFinite(v) ? fmt.fixed(v, 2) : '–');
      row(say(L('Netto', 'Net')), Q('G', eur(pb.G)), col.G());
      row(`${say(L('MwSt', 'VAT'))} ${Q('p', fmt.num(pb.p, 1))} %`, Q('W', Q('G', eur(pb.D))), col.up());
      g.strokeStyle = mixColor(inkCol(), th().bg, 0.6);
      g.setLineDash([3, 3]);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x + 8, yy - lh / 2);
      g.lineTo(x + w - 8, yy - lh / 2);
      g.stroke();
      g.setLineDash([]);
      row(say(L('Summe €', 'Total €')), Q('W', eur(pb.W)), col.W(), true);
    }

    /** Aufgeschlagenes Sparbuch mit Guthaben, Zinsen und neuem Stand. */
    function drawBook(R: Rect, pb: Problem): void {
      const g = surface.g;
      const dark = th().dark;
      const w = Math.min(R.w * 0.9, 210);
      const h = R.h - 6;
      const x = R.x + (R.w - w) / 2;
      const y = R.y + 3;
      const cover = th().series[5]!;
      const bookImg = ctx.images.get('book');
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 9;
      g.shadowOffsetY = 3;
      if (bookImg) {
        // Foto: eine linierte Seite mit Einbandrand, im Dunkelmodus abgedunkelt wie der Kassenbon
        g.drawImage(photoSprite(bookImg, w, h, dark ? 0.8 : 0), x, y, w, h);
        g.restore();
      } else {
        g.fillStyle = mixColor(cover, '#000000', dark ? 0.35 : 0.15);
        roundRect(g, x, y, w, h, 6);
        g.fill();
        g.restore();
        // Seite
        g.fillStyle = paperCol();
        roundRect(g, x + 5, y + 4, w - 10, h - 8, 4);
        g.fill();
      }
      // Linien
      const fsz = clamp(Math.round(h * 0.105), 10.5, 12.5);
      const font = (wt: number) => `${wt} ${fsz}px ${th().font}`;
      const rows = 3;
      const headH = fsz + 10;
      label(say(L('SPARBUCH', 'SAVINGS BOOK')), x + w / 2, y + 4 + headH / 2 + 1, `800 ${fsz}px ${th().font}`, cover);
      const lh = (h - 8 - headH - 6) / rows;
      let yy = y + 4 + headH + lh / 2;
      // Linien (das Foto hat eigene)
      g.strokeStyle = withAlpha(cover, 0.3);
      g.lineWidth = 1;
      for (let i = 0; i <= rows && !bookImg; i++) {
        const ly = Math.round(y + 4 + headH + i * lh) + 0.5;
        g.beginPath();
        g.moveTo(x + 9, ly);
        g.lineTo(x + w - 9, ly);
        g.stroke();
      }
      const eur = (v: number) => (Number.isFinite(v) ? `${fmt.fixed(v, 2)}` : '–');
      const row = (l: string, r: string, c: string, bold = false) => {
        label(l, x + 11, yy, font(bold ? 800 : 600), inkCol(), 'left');
        label(r, x + w - 11, yy, font(bold ? 800 : 700), c, 'right');
        yy += lh;
      };
      row(say(L('Guthaben', 'Balance')), Q('G', eur(pb.G)), col.G());
      row(`${say(L('Zinsen', 'Interest'))} ${Q('p', fmt.num(pb.p, 2))} %`, Q('W', Q('G', eur(pb.W))), col.W());
      row(say(L('Neu', 'New')), Q('W', Q('G', eur(pb.G + pb.W))), inkCol(), true);
    }

    /** Tafel mit Umfrage: ein Symbol pro Kind, die mit dem Rad gefärbt. */
    function drawBoard(R: Rect, pb: Problem): void {
      const g = surface.g;
      const dark = th().dark;
      const w = R.w;
      const h = R.h;
      const x = R.x;
      const y = R.y;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 9;
      g.shadowOffsetY = 3;
      g.fillStyle = dark ? '#5a4632' : '#9a7650';
      roundRect(g, x, y, w, h, 6);
      g.fill();
      g.restore();
      const bg = g.createLinearGradient(0, y, 0, y + h);
      bg.addColorStop(0, dark ? '#1f3a30' : '#2f5d4a');
      bg.addColorStop(1, dark ? '#183026' : '#264d3d');
      g.fillStyle = bg;
      roundRect(g, x + 4, y + 4, w - 8, h - 8, 4);
      g.fill();
      const chalk = 'rgba(240,244,236,0.92)';
      const fsz = clamp(Math.round(h * 0.11), 10.5, 12.5);
      label(say(L('Mit dem Rad?', 'By bike?')), x + w / 2, y + 6 + fsz * 0.75, `700 ${fsz}px ${th().font}`, chalk);
      // Symbole im Raster
      const n = Math.round(pb.G);
      const W = pb.W;
      const area = { x: x + 9, y: y + 10 + fsz * 1.3, w: w - 18, h: h - 18 - fsz * 1.3 };
      const showAll = !hidden('G');
      const count = showAll ? n : Math.max(0, Math.floor(W + 1e-9));
      let cols = 1;
      let cell = 1;
      for (let c = 1; c <= Math.max(1, count); c++) {
        const rws = Math.ceil(Math.max(1, count) / c);
        const cs = Math.min(area.w / c, area.h / rws);
        if (cs > cell) {
          cell = cs;
          cols = c;
        }
      }
      const on = hidden('W') ? 0 : Math.floor(W + 1e-9);
      const kidC = th().series[0]!;
      const pale = 'rgba(240,244,236,0.55)';
      for (let i = 0; i < count; i++) {
        const cx = area.x + cell * ((i % cols) + 0.5) + (area.w - cols * cell) / 2;
        const cy = area.y + cell * (Math.floor(i / cols) + 0.5);
        const r = cell * 0.42;
        const c = i < on ? mixColor(kidC, '#ffffff', 0.35) : pale;
        g.fillStyle = c;
        if (r < 3) {
          g.beginPath();
          g.arc(cx, cy, Math.max(1.4, r), 0, TAU);
          g.fill();
          continue;
        }
        g.beginPath();
        g.arc(cx, cy - r * 0.45, r * 0.38, 0, TAU);
        g.fill();
        g.beginPath();
        g.moveTo(cx - r * 0.62, cy + r * 0.85);
        g.quadraticCurveTo(cx - r * 0.62, cy, cx, cy);
        g.quadraticCurveTo(cx + r * 0.62, cy, cx + r * 0.62, cy + r * 0.85);
        g.closePath();
        g.fill();
      }
      if (!showAll) label('+ ?', area.x + area.w - 4, area.y + area.h - 8, `800 ${fsz}px ${th().font}`, chalk, 'right');
    }

    /** Ohne Sachzusammenhang: Plakette „% = Hundertstel“. */
    function drawPercentBadge(R: Rect, pb: Problem): void {
      const g = surface.g;
      const r = Math.min(R.h * 0.44, R.w * 0.3);
      const cx = R.x + r + 6;
      const cy = R.y + R.h / 2;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const grad = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 2, cx, cy, r);
      grad.addColorStop(0, mixColor(col.p(), '#ffffff', 0.35));
      grad.addColorStop(1, col.p());
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, r, 0, TAU);
      g.fill();
      g.restore();
      label('%', cx, cy + 1, `800 ${Math.round(r * 1.05)}px ${th().font}`, textOn(col.p(), th()));
      // „1 % = 1/100“
      const fx = cx + r + 12;
      const box = formula(g, '1 % = \\f{1}{100}', fstyle(clamp(r * 0.42, 12, 16), col.p(), 700));
      if (fx + box.w < R.x + R.w) {
        box.draw(g, fx, cy + (box.asc - box.desc) / 2 - 2);
        const b2 = formula(g, `${Q('p', fmt.num(pb.q, 2))} % = \\f{${Q('p', fmt.num(pb.q, 2))}}{100}`, fstyle(clamp(r * 0.34, 11, 14), th().muted, 650));
        if (fx + b2.w < R.x + R.w) b2.draw(g, fx, cy + box.desc + b2.asc + 14);
      }
    }

    /* =====================================================================
     * Prozentstreifen
     * ===================================================================== */
    interface Geo {
      x0: number;
      k: number;
      y: number;
      h: number;
      wPillY: number;
      wBraceY: number;
      pctY: number;
      valY: number;
      gBraceY: number;
      gPillY: number;
      trapY: number;
    }
    function geo(S: Rect): Geo {
      const big = roomy();
      const padL = fs(30, 20);
      const padR = fs(36, 24);
      const k = (S.w - padL - padR) / MX.v;
      const top = S.y + (big ? 8 : 6);
      const wPillY = top + (big ? 16 : 14);
      const wBraceY = top + (big ? 40 : 34);
      const pctY = wBraceY + (big ? 17 : 14);
      const y = pctY + (big ? 15 : 13);
      const h = big ? 66 : 42;
      const valY = y + h + (big ? 18 : 15);
      const gBraceY = valY + (big ? 14 : 12);
      const gPillY = gBraceY + (big ? 23 : 20);
      return { x0: S.x + padL, k, y, h, wPillY, wBraceY, pctY, valY, gBraceY, gPillY, trapY: gPillY + (big ? 22 : 18) };
    }
    let handleHit = { x: 0, y: 0, h: 0 };
    let stripHit: Rect = { x: 0, y: 0, w: 0, h: 0 };

    function drawStrip(S: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const pb = P();
      const s = sit();
      const sg = sgn();
      const f = find();
      const sk = solveK(now);
      const gm = geo(S);
      const { x0, k: kk, y, h } = gm;
      const X = (q: number) => x0 + q * kk;
      card(S);
      // angezeigte Werte (zählen bei Übergängen)
      const Gs = GS.v;
      let qs = QS.v * k.fill;
      const vOf = (q: number) => (Gs * q) / 100;
      // Zählphase der Hauptanimation (W/p: Füllung wächst Teil für Teil)
      const counting = sk.on && f !== 'G';
      if (counting) qs = sk.count ?? 0;
      const qEnd = Math.max(100, qs);
      const ghostG = (hidden('G') && !sk.on) || (sk.on && f === 'G' && sk.res < 0.5);
      // Papierstreifen 0…100 %
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = dark ? '#1d2633' : '#f3f5f8';
      roundRect(g, X(0), y, X(100) - X(0), h, 7);
      g.fill();
      g.restore();
      // Verlängerung über 100 %
      if (MX.v > 100.5) {
        g.save();
        g.strokeStyle = withAlpha(theme.muted, 0.6);
        g.setLineDash([5, 4]);
        g.lineWidth = 1.2;
        roundRect(g, X(100), y + 0.5, X(qEnd) - X(100), h - 1, 7);
        g.stroke();
        g.restore();
      }
      // Füllung
      const fillSeg = (a: number, b: number, color: string) => {
        if (b <= a + 1e-6) return;
        const grad = g.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, mixColor(color, '#ffffff', dark ? 0.08 : 0.22));
        grad.addColorStop(1, mixColor(color, '#000000', dark ? 0.2 : 0.08));
        g.save();
        g.fillStyle = grad;
        roundRect(g, X(a), y, X(b) - X(a), h, 7);
        g.fill();
        // Glanzkante
        g.fillStyle = 'rgba(255,255,255,0.18)';
        roundRect(g, X(a) + 2, y + 2, Math.max(0, X(b) - X(a) - 4), h * 0.3, 5);
        g.fill();
        g.restore();
      };
      const inside = (str: string, a: number, b: number, color = '#ffffff') => {
        const fnt = `750 ${fs(13, 11.5)}px ${theme.font}`;
        g.font = fnt;
        if (g.measureText(str).width + 14 < X(b) - X(a)) label(str, (X(a) + X(b)) / 2, y + h / 2 + 0.5, fnt, color);
      };
      if (sg < 0 && !counting) {
        // Rabatt: neuer Preis (blau) und abgeschnittener Rabatt (rot schraffiert)
        fillSeg(0, qs, col.W());
        const a = Math.max(0, qs);
        g.save();
        g.fillStyle = withAlpha(col.down(), dark ? 0.25 : 0.14);
        roundRect(g, X(a), y, X(100) - X(a), h, 7);
        g.fill();
        g.restore();
        hatch(X(a), y, X(100) - X(a), h, withAlpha(col.down(), 0.55));
        if (k.labels > 0.5 && !counting) {
          inside(`${say(L('neuer Preis', 'new price'))}`, 0, qs, textOn(col.W(), theme));
          inside(`−${Q('p', fmt.num(100 - QS.v, 1))} %`, qs, 100, col.down());
        }
        // Schnittlinie
        if (qs < 99.5 && qs > 0.5) {
          g.save();
          g.strokeStyle = col.down();
          g.lineWidth = 2;
          g.setLineDash([4, 3]);
          g.beginPath();
          g.moveTo(X(qs), y - 6);
          g.lineTo(X(qs), y + h + 6);
          g.stroke();
          g.restore();
        }
      } else if (sg > 0) {
        fillSeg(0, Math.min(100, qs), col.W());
        if (qs > 100) {
          const grad = g.createLinearGradient(0, y, 0, y + h);
          grad.addColorStop(0, mixColor(col.up(), '#ffffff', dark ? 0.08 : 0.22));
          grad.addColorStop(1, mixColor(col.up(), '#000000', dark ? 0.2 : 0.08));
          g.fillStyle = grad;
          roundRect(g, X(100) - 7, y, X(qs) - X(100) + 7, h, 7);
          g.fill();
          g.fillStyle = mixColor(col.W(), '#000000', dark ? 0.1 : 0.02);
          g.fillRect(X(100) - 7, y, 7, h);
        }
        if (k.labels > 0.5 && !counting) {
          inside(s === 'mwst' ? say(L('netto', 'net')) : say(L('alter Preis', 'old price')), 0, 100, textOn(col.W(), theme));
          inside(`+${Q('p', fmt.num(QS.v - 100, 1))} %`, 100, qs, textOn(col.up(), theme));
        }
      } else {
        fillSeg(0, qs, col.W());
      }
      // Grundwert unbekannt: nur Umriss mit „?“
      if (ghostG && !counting) {
        const a = Math.min(100, Math.max(0, qs));
        if (a < 100) {
          g.save();
          g.fillStyle = dark ? '#151c27' : '#ffffff';
          roundRect(g, X(a), y, X(100) - X(a), h, 7);
          g.fill();
          g.restore();
          hatch(X(a), y, X(100) - X(a), h, withAlpha(col.G(), 0.25), 9);
          label('?', (X(a) + X(100)) / 2, y + h / 2 + 1, `800 ${fs(20, 16)}px ${theme.font}`, col.G(), 'center', true);
        }
      }
      // Hauptanimation, Rückwärts-Zählen (G gesucht): violette Teile bis 100 %
      if (sk.on && f === 'G' && sk.count !== null) {
        const c = sk.count;
        g.save();
        g.fillStyle = withAlpha(col.G(), dark ? 0.42 : 0.3);
        roundRect(g, X(0), y - 3, X(c) - X(0), h + 6, 8);
        g.fill();
        g.restore();
      }
      // Teilstriche: immer Zehntel, in der Animation Hundertstel
      g.save();
      g.lineWidth = 1;
      for (let t = 10; t < qEnd - 0.1; t += 10) {
        const xx = Math.round(X(t)) + 0.5;
        g.strokeStyle = t < qs ? 'rgba(255,255,255,0.55)' : withAlpha(theme.muted, 0.35);
        g.beginPath();
        g.moveTo(xx, y + 3);
        g.lineTo(xx, y + h - 3);
        g.stroke();
      }
      if (sk.on && sk.div > 0) {
        const n = f === 'G' ? Math.max(1, Math.round(Math.min(QS.v, 150))) : 100;
        const reach = f === 'G' ? Math.min(QS.v, MX.v) : 100;
        const step = reach / n;
        for (let i = 1; i < n; i++) {
          // Teilstriche erscheinen von links nach rechts
          const al = clamp01(sk.div * 1.25 - (i / n) * 0.9);
          if (al <= 0.01) continue;
          const xx = X(i * step);
          const inFill = i * step < qs;
          g.strokeStyle = inFill ? `rgba(255,255,255,${0.7 * al})` : withAlpha(theme.muted, 0.5 * al);
          g.beginPath();
          g.moveTo(xx, y + (i % 10 === 0 ? 3 : h * 0.3));
          g.lineTo(xx, y + h - (i % 10 === 0 ? 3 : h * 0.3));
          g.stroke();
        }
      }
      g.restore();
      // Rahmen 0–100 % (Grundwert)
      g.save();
      g.strokeStyle = withAlpha(col.G(), sk.on && sk.a < 1 ? 0.55 + 0.4 * Math.sin(sk.a * Math.PI) : 0.55);
      g.lineWidth = sk.on && f !== 'G' && sk.a < 1 ? 1.6 + 1.6 * Math.sin(sk.a * Math.PI) : 1.6;
      roundRect(g, X(0) + 0.5, y + 0.5, X(100) - X(0) - 1, h - 1, 7);
      g.stroke();
      g.restore();
      stripHit = { x: X(0), y: y - 6, w: X(qEnd) - X(0), h: h + 12 };

      /* --- Skalen --- */
      const lab = k.labels;
      g.save();
      g.globalAlpha *= lab;
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1;
      const pxPerPct = kk;
      const minorStep = pxPerPct >= 5 ? 1 : pxPerPct >= 1.4 ? 5 : 10;
      for (let t = 0; t <= MX.v + 1e-9; t += minorStep) {
        const xx = Math.round(X(t)) + 0.5;
        const major = t % 10 === 0;
        const mid = t % 5 === 0;
        const len = major ? 7 : mid ? 4.5 : 2.5;
        g.beginPath();
        g.moveTo(xx, y - len - 1);
        g.lineTo(xx, y - 1);
        g.moveTo(xx, y + h + 1);
        g.lineTo(xx, y + h + 1 + len);
        g.stroke();
      }
      // Beschriftungsabstand nach Platz
      const fnt = (wt: number) => `${wt} ${roomy() ? 13 : fs(12, 11)}px ${theme.font}`;
      g.font = fnt(600);
      const sample = Math.max(g.measureText(num(vOf(MX.v))).width, g.measureText('100 %').width);
      const every = [10, 20, 25, 50].find((e) => e * pxPerPct >= sample + 10) ?? 50;
      const pctItems: { x: number; s: string; font: string; color: string; prio: number }[] = [];
      const valItems: typeof pctItems = [];
      for (let t = 0; t <= MX.v + 1e-9; t += every) {
        const is100 = Math.abs(t - 100) < 1e-9;
        const hideP = hidden('p') && t !== 0 && !is100;
        if (!hideP) pctItems.push({ x: X(t), s: `${fmt.num(t, 0)} %`, font: fnt(is100 ? 800 : 600), color: is100 ? col.G() : theme.muted, prio: is100 ? 5 : t === 0 ? 4 : 1 });
        const hideV = (hidden('W') && t !== 0 && !is100) || (hidden('G') && t !== 0) || (sk.on && f === 'G' && sk.res < 0.5 && t !== 0);
        if (!hideV) valItems.push({ x: X(t), s: is100 ? num(vOf(100)) : num(vOf(t)), font: fnt(is100 ? 800 : 600), color: is100 ? col.G() : theme.muted, prio: is100 ? 5 : t === 0 ? 4 : 1 });
      }
      // Prozentsatz am Griff (orange) – wichtigste Beschriftung
      const qShown = counting ? qs : QS.v;
      if (qShown > 0.5 && Math.abs(qShown - 100) > 0.3) {
        pctItems.push({ x: X(qShown), s: hidden('p') && !sk.on ? '?' : `${fmt.num(qShown, 1)} %`, font: fnt(800), color: col.p(), prio: 9 });
        if (!hidden('W') || sk.on) valItems.push({ x: X(qShown), s: num(vOf(qShown)), font: fnt(800), color: col.W(), prio: 8 });
      }
      labelRow(pctItems, gm.pctY, S.x + 6, S.x + S.w - 6);
      labelRow(valItems, gm.valY, S.x + 6, S.x + S.w - 6);
      g.restore();

      /* --- Klammern und Pillen --- */
      const bounds = { x: S.x, y: S.y, w: S.w, h: S.h };
      const pz = roomy() ? 14 : fs(13, 12);
      // Grundwert unten
      const gA = sk.on && f === 'G' ? sk.res : 1;
      brace(X(0), X(100), gm.gBraceY, 1, col.G(), lab * Math.max(0.35, gA), sk.on && f === 'G' ? Math.max(0.05, sk.res) : lab);
      const gName = sk.on && S.w < 600 ? '' : s === 'rabatt' || s === 'erh' ? say(L('alter Preis', 'old price')) : s === 'mwst' ? say(L('netto', 'net')) : s === 'zins' ? say(L('Kapital', 'capital')) : s === 'klasse' ? say(L('alle', 'all')) : '';
      const gVal = sk.on && f === 'G' && sk.res < 0.5 ? '?' : Q('G', valS(Gs));
      const gSrc = `\\c{G}{${gName ? `${up(gName)} ` : ''}G = ${gVal}} \\c{m}{≙} \\c{G}{100 %}`;
      fpill(X(50), gm.gPillY, gSrc, { size: pz, border: withAlpha(col.G(), 0.7), alpha: lab * (sk.on && f === 'G' && sk.count !== null && sk.res < 0.99 ? sk.res : 1), bounds, scale: sk.on && f === 'G' ? 0.85 + 0.15 * sk.res : 1 });
      // Prozentwert oben
      let wRect: Rect | null = null;
      if (qShown > 0.2) {
        const wName = sk.on && S.w < 600 ? '' : s === 'rabatt' || s === 'erh' ? say(L('neuer Preis', 'new price')) : s === 'mwst' ? say(L('brutto', 'gross')) : s === 'zins' ? say(L('Zinsen', 'interest')) : s === 'klasse' ? say(L('mit Rad', 'by bike')) : '';
        const wv = counting ? valS(vOf(qs)) : Q('W', valS(vOf(QS.v)));
        const pv = counting ? pct(qs) : Q('p', pct(Math.round(QS.v * 100) / 100));
        const notWhole = people() && !counting && pr.show && !isNice(pb.W, 0) && Math.abs(QS.v - pb.q) < 1e-6;
        const wSrc = `\\c{W}{${wName ? `${up(wName)} ` : ''}W = ${wv}} \\c{m}{≙} \\c{p}{${pv}}${notWhole ? ` \\c{bad}{${up(say(L('– keine ganze Zahl!', '– not a whole number!')))}}` : ''}`;
        const wa = sk.on && f !== 'G' ? Math.max(0.3, sk.count === null ? 0.3 : 1) : 1;
        brace(X(0), X(qShown), gm.wBraceY, -1, col.W(), lab * wa, lab);
        wRect = fpill((X(0) + X(qShown)) / 2, gm.wPillY, wSrc, { size: pz, border: withAlpha(col.W(), 0.7), alpha: lab * wa, bounds, scale: sk.on && f !== 'G' && sk.cnt >= 1 ? 0.9 + 0.1 * sk.res : 1 });
      }
      // „1 %“ herausgehoben: Scheibe im Streifen und Kärtchen oben rechts mit Bezugslinie
      if (sk.on && sk.one > 0.01) {
        const one = f === 'G' ? pb.W / Math.max(1e-9, pb.q) : pb.G / 100;
        const endA = solve ? clamp01((now - solve.t0 - (T3 + solve.dur3 + 1200)) / 600) : 1;
        const al = clamp01(sk.one) * (1 - endA);
        // Scheibe 1 % (in der Zählphase nicht mehr nötig)
        const sliceA = al * (sk.count === null ? 1 : 0.35);
        g.save();
        g.globalAlpha *= sliceA;
        g.fillStyle = col.p();
        roundRect(g, X(0) - 1, y - 5, Math.max(4, X(1) - X(0) + 2), h + 10, 2);
        g.fill();
        g.restore();
        const src = `\\c{p}{1 %} \\c{m}{≙} \\b{${val(one)}}`;
        const csz = roomy() ? 15 : fs(13.5, 12.5);
        const box = formula(g, src, fstyle(csz, th().text, 700));
        const chipX = S.x + S.w - 12 - box.w / 2 - 8;
        const cw = box.w + 16;
        const overlap = !!wRect && wRect.x + wRect.w > chipX - cw / 2 - 6;
        const chipY = overlap ? gm.gPillY : gm.wPillY;
        if (sk.count === null && al > 0.05 && !overlap) {
          // Bezugslinie von der Scheibe zum Kärtchen
          g.save();
          g.globalAlpha *= al * 0.8;
          g.strokeStyle = col.p();
          g.lineWidth = 1.5;
          g.setLineDash([4, 4]);
          g.beginPath();
          g.moveTo(X(0.5), y - 6);
          g.bezierCurveTo(X(0.5), chipY + 4, chipX - box.w / 2 - 60, chipY, chipX - box.w / 2 - 10, chipY);
          g.stroke();
          g.restore();
        }
        fpill(chipX, chipY, src, { size: csz, border: col.p(), alpha: al, scale: 0.6 + 0.4 * Math.min(1, sk.one), bounds, fill: mixColor(col.p(), dark ? '#151c27' : '#ffffff', 0.88) });
      }
      // Zähler beim Rückwärtsrechnen (G gesucht) an der Stelle der Grundwert-Pille
      if (sk.on && f === 'G' && sk.count !== null && sk.res < 0.99) {
        const c = sk.count;
        const one = pb.W / Math.max(1e-9, pb.q);
        const src = `\\c{p}{${fmt.num(c, 1)} %} \\c{m}{≙} \\c{G}{\\b{${val(one * c)}}}`;
        fpill(X(c), gm.gPillY, src, { size: pz, border: col.G(), bounds, alpha: 1 - sk.res });
      }
      // Griff
      const hx = X(counting ? qs : QS.v);
      const cy = y + h / 2;
      if (!ctx.locked && !sk.on) {
        const on = hover === 'handle' || drag;
        g.beginPath();
        g.arc(hx, cy, on ? 17 : 13, 0, TAU);
        g.fillStyle = withAlpha(col.p(), on ? 0.28 : 0.14);
        g.fill();
      }
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 4;
      g.shadowOffsetY = 1;
      g.fillStyle = dark ? '#1b2330' : '#ffffff';
      g.strokeStyle = col.p();
      g.lineWidth = 2.6;
      roundRect(g, hx - 5.5, y - 5, 11, h + 10, 5.5);
      g.fill();
      g.stroke();
      g.restore();
      g.strokeStyle = withAlpha(col.p(), 0.8);
      g.lineWidth = 1.3;
      for (const d of [-2, 2]) {
        g.beginPath();
        g.moveTo(hx + d, cy - 6);
        g.lineTo(hx + d, cy + 6);
        g.stroke();
      }
      handleHit = { x: hx, y: cy, h };

      // Stolperstein: zweiter Streifen
      if (TRAP.v > 0.01) drawTrap(S, gm, pb, X);
    }

    /** Typischer Fehler beim Zurückrechnen, im gleichen Maßstab (Werte!) wie der Hauptstreifen. */
    function drawTrap(S: Rect, gm: Geo, pb: Problem, X: (q: number) => number): void {
      const g = surface.g;
      const theme = th();
      const a = TRAP.v;
      const yT = gm.trapY + 4;
      const h = fs(20, 16);
      const XV = (v: number) => X((v / Math.max(1e-9, pb.G)) * 100);
      const wrong = wrongBase(pb.sit, pb.W, pb.p);
      g.save();
      g.globalAlpha *= a;
      g.beginPath();
      g.rect(S.x, gm.trapY - 4, S.w, S.h - (gm.trapY - 4 - S.y));
      g.clip();
      // Überschrift
      const sz = fs(12.5, 11.5);
      const opS = pb.sit === 'rabatt' ? '+' : '−';
      const txt = `\\c{bad}{${up(say(L('Falsch', 'Wrong')))}: ${val(pb.W)} ${opS} ${fmt.num(pb.p, 1)} % ${up(say(L('von', 'of')))} ${val(pb.W)} = ${val(wrong)} ✗}   \\c{ok}{${up(say(L('richtig', 'right')))}: ${val(pb.G)} ✓}`;
      const box = fit(txt, S.w - 24, sz, theme.text, 700);
      box.draw(surface.g, S.x + 12, yT + box.asc);
      const ys = yT + box.asc + box.desc + 8;
      // Streifen: W als 100 % genommen, p % davon weg bzw. dazu
      const xa = XV(0);
      const xW = XV(pb.W);
      const xWr = XV(wrong);
      g.fillStyle = withAlpha(col.bad(), theme.dark ? 0.35 : 0.2);
      roundRect(g, xa, ys, xW - xa, h, 5);
      g.fill();
      g.fillStyle = withAlpha(col.bad(), 0.8);
      roundRect(g, xa, ys, Math.min(xW, xWr) - xa, h, 5);
      g.fill();
      if (xWr > xW) {
        hatch(xW, ys, xWr - xW, h, withAlpha(col.bad(), 0.7));
      } else hatch(xWr, ys, xW - xWr, h, withAlpha(col.bad(), 0.6));
      label(`${val(pb.W)} ${say(L('als 100 %', 'as 100 %'))}`, xa + 8, ys + h / 2 + 0.5, `700 ${fs(11.5, 11)}px ${theme.font}`, textOn(col.bad(), theme), 'left');
      // senkrechte Linie beim richtigen Grundwert
      const xg = XV(pb.G);
      g.strokeStyle = col.G();
      g.lineWidth = 2;
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(xg, gm.y + gm.h);
      g.lineTo(xg, ys + h + 4);
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = col.bad();
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(xWr, ys - 4);
      g.lineTo(xWr, ys + h + 4);
      g.stroke();
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;

    /** Dreisatz Schritt für Schritt mit Pfeilen und Formel. */
    function stepsCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pb = P();
        const f = find();
        const sk = solveK(now);
        const pad = fs(14, 12);
        const baseRow = roomy() ? 30 : fs(26, 25);
        const rows = ruleOfThree(f, pb.G, pb.q);
        const show = pr.show;
        // Formelzeilen
        const forms: string[] = [];
        const qn = fmt.num(pb.q, 2);
        const fac = fmt.num(pb.q / 100, 4);
        const sgV = sgn();
        if (f === 'W') {
          if (sgV === 0) forms.push(`\\c{W}{W} = \\c{G}{G} · \\f{\\c{p}{p}}{100} = ${val(pb.G)} · \\f{${qn}}{100} = \\c{W}{\\b{${Q('W', val(pb.W))}}}`);
          else forms.push(`\\c{W}{W} = ${val(pb.G)} · \\f{${qn}}{100} = ${val(pb.G)} · ${fac} = \\c{W}{\\b{${Q('W', val(pb.W))}}}`);
        } else if (f === 'p') {
          // Bei Änderungen ist p der Änderungssatz; W : G liefert den Prozentsatz des neuen Preises.
          forms.push(`${sgV === 0 ? '\\c{p}{p %} = ' : ''}\\f{\\c{W}{W}}{\\c{G}{G}} = \\f{${val(pb.W)}}{${val(pb.G)}} = ${show ? fmt.num(pb.q / 100, 4) : '?'} = \\c{p}{\\b{${Q('p', pct(pb.q))}}}`);
          if (sgV !== 0 && show) forms.push(`\\c{m}{${up(sgV < 0 ? say(L('Rabatt', 'Discount')) : say(L('Erhöhung', 'Increase')))}: ${sgV < 0 ? `100 % − ${qn} %` : `${qn} % − 100 %`} =} \\c{d}{\\b{${pct(pb.p)}}}`);
        } else {
          if (!(pb.q > 0)) forms.push(`\\c{bad}{${up(say(L('Bei 0 % ist W immer 0 – G ist nicht bestimmbar.', 'At 0 % W is always 0 – G cannot be found.')))}}`);
          else if (sgV === 0) forms.push(`\\c{G}{G} = \\c{W}{W} · \\f{100}{\\c{p}{p}} = ${val(pb.W)} · \\f{100}{${qn}} = \\c{G}{\\b{${Q('G', val(pb.G))}}}`);
          else forms.push(`\\c{G}{G} = ${val(pb.W)} : ${fac} = \\c{G}{\\b{${Q('G', val(pb.G))}}}`);
        }
        const boxes = forms.map((src, i) => fit(src, R.w - 2 * pad, i === 0 ? fs(14, 12.5) : fs(12.5, 11.5)));
        const formH = boxes.reduce((s, b) => s + b.asc + b.desc + 8, 0);
        const hh = 40 + baseRow * 3 + 10 + formH + 8;
        if (measure) return hh;
        const H = Math.max(hh, R.h);
        const rowH = clamp((H - 40 - 10 - formH - 8) / 3, baseRow, 46);
        card({ ...R, h: H }, f === 'W' ? col.W() : f === 'p' ? col.p() : col.G());
        cardTitle(R, say(L('Dreisatz am Streifen', 'Rule of three on the bar')), f === 'W' ? col.W() : f === 'p' ? col.p() : col.G());
        const top = R.y + 40;
        const colEq = R.x + R.w * 0.46;
        const fz = roomy() ? 16 : fs(15, 13.5);
        const at = [sk.a, sk.one, sk.res].map((a, i) => (sk.on ? a : clamp01(k.stagger * 4 - i)));
        const valColor = (i: number) => {
          if (f === 'G') return i === 0 ? col.W() : i === 2 ? col.G() : theme.text;
          return i === 0 ? col.G() : i === 2 ? col.W() : theme.text;
        };
        const unknownCell = (i: number, which: 'p' | 'v') => {
          if (show) return false;
          if (i === 0) return false;
          if (i === 1) return which === 'v';
          return f === 'p' ? which === 'p' : which === 'v';
        };
        rows.forEach(([pp, vv], i) => {
          const a = ease.outCubic(clamp01(at[i]!));
          if (a <= 0.01) return;
          const cy = top + rowH * (i + 0.5);
          g.save();
          g.globalAlpha *= a;
          g.translate((1 - a) * 12, 0);
          if (i === 2) {
            g.fillStyle = withAlpha(valColor(2), theme.dark ? 0.16 : 0.09);
            roundRect(g, R.x + pad + 18, cy - rowH / 2 + 2, R.w - 2 * pad - 36, rowH - 4, 8);
            g.fill();
          }
          const ps = unknownCell(i, 'p') ? '?' : pct(pp);
          const vs = unknownCell(i, 'v') || !Number.isFinite(vv) || (f === 'G' && !(pb.q > 0) && i > 0) ? '?' : val(vv);
          const pb1 = formula(g, `\\c{p}{\\b{${ps}}}`, fstyle(fz, col.p(), 750));
          pb1.draw(g, colEq - 14 - pb1.w, cy + (pb1.asc - pb1.desc) / 2);
          label('≙', colEq, cy, `700 ${fz}px ${theme.font}`, theme.muted);
          const vb = formula(g, `\\b{${vs}}`, fstyle(fz, valColor(i), 750));
          vb.draw(g, colEq + 14, cy + (vb.asc - vb.desc) / 2);
          g.restore();
          // Pfeile zwischen den Zeilen
          if (i > 0 && a > 0.3) {
            const [p0] = rows[i - 1]!;
            let op: string;
            if (f === 'G') op = i === 1 ? `: ${fmt.num(p0, 2)}` : '· 100';
            else op = i === 1 ? ': 100' : `· ${show || f !== 'p' ? fmt.num(pp, 2) : '?'}`;
            const yA = cy - rowH + 7;
            const yB = cy - 7;
            g.save();
            g.globalAlpha *= clamp01((a - 0.3) / 0.7);
            for (const side of [-1, 1] as const) {
              const x = side < 0 ? R.x + pad + 8 : R.x + R.w - pad - 8;
              g.strokeStyle = theme.muted;
              g.lineWidth = 1.4;
              g.beginPath();
              g.moveTo(x, yA);
              g.quadraticCurveTo(x + side * 9, (yA + yB) / 2, x, yB);
              g.stroke();
              g.fillStyle = theme.muted;
              g.beginPath();
              g.moveTo(x, yB + 1);
              g.lineTo(x + side * 4.5, yB - 5);
              g.lineTo(x - side * 2.5, yB - 5.5);
              g.closePath();
              g.fill();
              label(op, x - side * 10, (yA + yB) / 2, `650 ${fs(11.5, 11)}px ${theme.font}`, theme.muted, side < 0 ? 'left' : 'right');
            }
            g.restore();
          }
        });
        // Formel
        let y = top + rowH * 3 + 10;
        g.strokeStyle = theme.dark ? '#273142' : '#e8ecf2';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y - 4);
        g.lineTo(R.x + R.w - pad, y - 4);
        g.stroke();
        boxes.forEach((b) => {
          const a = ease.outCubic(sk.on ? sk.res : clamp01(k.stagger * 4 - 3));
          g.save();
          g.globalAlpha *= a;
          b.draw(g, R.x + pad, y + b.asc + 2);
          g.restore();
          y += b.asc + b.desc + 8;
        });
        return H;
      };
    }

    /** Hunderterfeld bzw. Kreis mit Bruch und Dezimalzahl. */
    let gridHit: { x: number; y: number; s: number; count: number; gap: number }[] = [];
    function repCard(k: Intro, now: number, maxH: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pb = P();
        const sk = solveK(now);
        const pad = fs(14, 12);
        const q = pb.q;
        const two = q > 100 + 1e-9;
        const avH = Math.max(80, Math.min(maxH, R.h) - 40 - pad);
        // Bruchspalte rechts, wenn Platz
        const fracW = fs(112, 100);
        const sideBySide = R.w - 2 * pad >= fracW + 120;
        const gridAreaW = sideBySide ? R.w - 2 * pad - fracW - 10 : R.w - 2 * pad;
        const isPie = rep() === 'pie';
        const nGrids = two ? 2 : 1;
        let cell = Math.min(avH / (sideBySide ? 10.4 : 13.6), (gridAreaW - (nGrids - 1) * 10) / (10.4 * nGrids));
        cell = clamp(cell, 6, 19);
        const gw = cell * 10.4;
        const contentH = sideBySide ? Math.max(gw, 66) : gw + 50;
        const hh = 40 + contentH + pad;
        if (measure) return hh;
        const H = Math.max(hh, R.h);
        card({ ...R, h: H }, col.W());
        cardTitle(R, isPie ? say(L('Kreisdiagramm', 'Circle')) : say(L('Hunderterfeld', 'Hundred square')), col.W(), isPie ? undefined : `\\c{m}{${up(say(L('1 Kästchen = 1 %', '1 square = 1 %')))}}`);
        const ox = R.x + pad;
        const oy = R.y + 40 + Math.max(0, (H - hh) / 2);
        const a = ease.outCubic(clamp01(k.stagger * 3));
        // gezeigter Prozentsatz (in der Hauptanimation gezählt)
        let qs = QS.v * k.fill;
        if (sk.on && find() !== 'G' && sk.count !== null) qs = sk.count;
        else if (sk.on && find() !== 'G') qs = 0;
        // Rückwärts-Zählen (G gesucht): violett umrandete Kästchen bis 100
        const over = sk.on && find() === 'G' && sk.count !== null && sk.res < 0.99 ? sk.count : 0;
        gridHit = [];
        g.save();
        g.globalAlpha *= a;
        if (isPie) drawPie(ox, oy, sideBySide ? gridAreaW : R.w - 2 * pad, gw, qs);
        else {
          for (let n = 0; n < nGrids; n++) {
            const gx = ox + n * (gw + 10);
            drawGrid(gx, oy, cell, n === 0 ? Math.min(100, qs) : Math.max(0, qs - 100), n, n === 0 ? Math.min(100, over) : Math.max(0, over - 100));
            gridHit.push({ x: gx, y: oy, s: cell * 1.04, count: n, gap: cell * 0.04 });
          }
        }
        g.restore();
        // Bruch
        const fx = sideBySide ? R.x + R.w - pad - fracW : ox;
        const fy = sideBySide ? oy + 2 : oy + gw + 8;
        const [n0, d0] = asFraction(q);
        const hideQ = hidden('p');
        const qn = fmt.num(q, 2);
        const fz = fs(14, 13);
        const l1 = hideQ ? `\\c{p}{? %} = \\f{?}{100}` : `\\c{p}{${qn} %} = \\f{${qn}}{100}`;
        const l2 = hideQ ? '= ?' : d0 !== 100 || n0 !== Math.round(q) ? `= \\f{${n0}}{${d0}} = ${fmt.num(q / 100, 4)}` : `= ${fmt.num(q / 100, 4)}`;
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3 - 1));
        const b1 = fit(l1, sideBySide ? fracW : R.w - 2 * pad, fz, theme.text, 700);
        b1.draw(g, fx, fy + b1.asc);
        const b2 = fit(l2, sideBySide ? fracW : R.w - 2 * pad, fz, theme.text, 700);
        if (sideBySide) b2.draw(g, fx, fy + b1.asc + b1.desc + 8 + b2.asc);
        else b2.draw(g, fx + b1.w + 8, fy + b1.asc);
        if (sideBySide) {
          const note = noteForFraction(q);
          if (note) {
            const lines = wrapText(note, fracW, `550 ${fs(11.5, 11)}px ${theme.font}`);
            let yy = fy + b1.asc + b1.desc + 8 + b2.asc + b2.desc + 14;
            for (const ln of lines.slice(0, 3)) {
              label(ln, fx, yy, `550 ${fs(11.5, 11)}px ${theme.font}`, theme.muted, 'left');
              yy += 15;
            }
          }
        }
        g.restore();
        return H;
      };
    }

    function noteForFraction(q: number): string | null {
      if (hidden('p')) return null;
      const known: [number, Txt][] = [
        [100, L('das Ganze', 'the whole')],
        [50, L('die Hälfte', 'one half')],
        [25, L('ein Viertel', 'one quarter')],
        [75, L('drei Viertel', 'three quarters')],
        [20, L('ein Fünftel', 'one fifth')],
        [10, L('ein Zehntel', 'one tenth')],
        [12.5, L('ein Achtel', 'one eighth')],
        [200, L('das Doppelte', 'double')],
        [150, L('das Anderthalbfache', 'one and a half times')],
      ];
      const hit = known.find(([v]) => Math.abs(v - q) < 1e-9);
      if (hit) return say(hit[1]);
      if (q > 100) return say(L('mehr als das Ganze', 'more than the whole'));
      return null;
    }

    function drawGrid(x: number, y: number, s: number, q: number, n: number, over = 0): void {
      const g = surface.g;
      const theme = th();
      const { full, part } = gridFill(q);
      const gap = s * 0.04;
      const sg = sgn();
      const fillC = n === 0 ? col.W() : col.up();
      for (let i = 0; i < 100; i++) {
        const cx = x + (i % 10) * s * 1.04;
        const cy = y + Math.floor(i / 10) * s * 1.04;
        const on = i < full;
        const isHover = hoverCell === n * 100 + i && !ctx.locked;
        g.fillStyle = theme.dark ? '#1f2834' : '#eef1f5';
        if (sg < 0 && n === 0 && !on && !(solve && find() !== 'G')) g.fillStyle = withAlpha(col.down(), theme.dark ? 0.26 : 0.16);
        roundRect(g, cx, cy, s - gap, s - gap, Math.min(2.5, s * 0.2));
        g.fill();
        if (on) {
          g.fillStyle = mixColor(fillC, '#ffffff', ((i * 7) % 10) * 0.012);
          roundRect(g, cx, cy, s - gap, s - gap, Math.min(2.5, s * 0.2));
          g.fill();
        } else if (i === full && part > 0.001) {
          g.fillStyle = fillC;
          roundRect(g, cx, cy, (s - gap) * part, s - gap, Math.min(2, s * 0.15));
          g.fill();
        }
        if (i < over) {
          g.strokeStyle = col.G();
          g.lineWidth = 1.6;
          roundRect(g, cx + 0.8, cy + 0.8, s - gap - 1.6, s - gap - 1.6, 2);
          g.stroke();
          if (!on) {
            g.fillStyle = withAlpha(col.G(), 0.22);
            g.fill();
          }
        }
        if (isHover) {
          g.strokeStyle = col.p();
          g.lineWidth = 2;
          roundRect(g, cx - 0.5, cy - 0.5, s - gap + 1, s - gap + 1, 3);
          g.stroke();
        }
      }
      // Zehnerstreifen andeuten
      g.strokeStyle = withAlpha(theme.muted, 0.35);
      g.lineWidth = 1;
      roundRect(g, x - 2, y - 2, s * 10.4 - gap + 4, s * 10.4 - gap + 4, 4);
      g.stroke();
    }

    function drawPie(x: number, y: number, w: number, d: number, q: number): void {
      const g = surface.g;
      const theme = th();
      const sg = sgn();
      const two = q > 100 + 1e-9;
      const r = d / 2 - 2;
      const cx = x + (two ? r + 4 : w / 2 > r + 4 ? Math.min(w / 2, r + 30) : r + 4);
      const cy = y + d / 2;
      const ring = (ccx: number, ccy: number, rr: number, frac: number, c: string, rest: string | null) => {
        g.fillStyle = theme.dark ? '#1f2834' : '#eef1f5';
        g.beginPath();
        g.arc(ccx, ccy, rr, 0, TAU);
        g.fill();
        if (rest) {
          g.fillStyle = rest;
          g.beginPath();
          g.moveTo(ccx, ccy);
          g.arc(ccx, ccy, rr, -Math.PI / 2 + frac * TAU, -Math.PI / 2 + TAU);
          g.closePath();
          g.fill();
        }
        if (frac > 0.0005) {
          const grad = g.createRadialGradient(ccx - rr * 0.3, ccy - rr * 0.3, 2, ccx, ccy, rr);
          grad.addColorStop(0, mixColor(c, '#ffffff', 0.25));
          grad.addColorStop(1, c);
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(ccx, ccy);
          g.arc(ccx, ccy, rr, -Math.PI / 2, -Math.PI / 2 + Math.min(1, frac) * TAU);
          g.closePath();
          g.fill();
        }
        // Zehntel-Markierungen
        g.strokeStyle = theme.dark ? 'rgba(21,28,39,0.9)' : 'rgba(255,255,255,0.9)';
        g.lineWidth = 1.2;
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i / 10) * TAU;
          g.beginPath();
          g.moveTo(ccx + Math.cos(a) * rr * 0.62, ccy + Math.sin(a) * rr * 0.62);
          g.lineTo(ccx + Math.cos(a) * rr, ccy + Math.sin(a) * rr);
          g.stroke();
        }
        // Loch (Ring)
        g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
        g.beginPath();
        g.arc(ccx, ccy, rr * 0.5, 0, TAU);
        g.fill();
      };
      ring(cx, cy, r, Math.min(100, q) / 100, col.W(), sg < 0 ? withAlpha(col.down(), theme.dark ? 0.4 : 0.28) : null);
      label(hidden('p') ? '?' : `${fmt.num(Math.min(q, 100), 1)} %`, cx, cy + 1, `800 ${Math.round(clamp(r * 0.3, 11, 17))}px ${theme.font}`, col.p());
      if (two) {
        const r2 = r * 0.62;
        const cx2 = cx + r + 10 + r2;
        ring(cx2, cy + r - r2, r2, (q - 100) / 100, col.up(), null);
        label(`+${fmt.num(q - 100, 1)} %`, cx2, cy + r - r2 + 1, `800 ${Math.round(clamp(r2 * 0.32, 11, 14))}px ${theme.font}`, col.up());
      }
    }

    /** Merke-Karte passend zur Situation; enthält den Stolperstein. */
    function noteCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pb = P();
        const s = sit();
        const f = find();
        const pad = fs(14, 12);
        const size = roomy() ? 13.5 : fs(12.5, 11.5);
        const lh = size * 1.38;
        const paras: { s: string; color?: string; weight?: number }[] = [];
        const fac = fmt.num(pb.q / 100, 4);
        const show = pr.show;
        if (s === 'none') {
          paras.push({ s: say(L('Prozent heißt Hundertstel: 1 % = 1/100. Der ganze Streifen ist der Grundwert, er entspricht 100 %.', 'Percent means hundredths: 1 % = 1/100. The whole bar is the base value; it corresponds to 100 %.')) });
          if (pb.q > 100) paras.push({ s: say(L('Über 100 %: Der Prozentwert ist größer als der Grundwert – der Streifen wird länger.', 'Above 100 %: the percentage value is larger than the base value – the bar gets longer.')), color: col.p(), weight: 650 });
          else paras.push({ s: say(L('Tipp: 10 % ist ein Zehntel, 50 % die Hälfte – damit lässt sich gut überschlagen.', 'Tip: 10 % is one tenth, 50 % one half – handy for estimating.')), color: theme.muted });
        } else if (s === 'rabatt') {
          paras.push({ s: show ? say(L(`Bei ${pct(pb.p)} Rabatt zahlt man noch ${pct(pb.q)} des alten Preises: ${val(pb.G)} · ${fac} = ${val(pb.W)}.`, `With ${pct(pb.p)} off you still pay ${pct(pb.q)} of the old price: ${val(pb.G)} · ${fac} = ${val(pb.W)}.`)) : say(L('Bei Rabatt zahlt man 100 % minus den Rabatt-Satz vom alten Preis.', 'With a discount you pay 100 % minus the discount rate of the old price.')) });
          if (f === 'G' && !show) paras.push({ s: say(L('Stolperstein: Der neue Preis entspricht nicht 100 %. Welchem Prozentsatz dann?', 'Pitfall: the new price is not 100 %. Which rate is it then?')), color: col.bad(), weight: 650 });
          else if (f === 'G') paras.push({ s: say(L(`Zurückrechnen: Der neue Preis entspricht ${pct(pb.q)}, nicht 100 %. Also durch ${fac} teilen – nicht ${pct(pb.p)} aufschlagen!`, `Working back: the new price is ${pct(pb.q)}, not 100 %. So divide by ${fac} – do not add ${pct(pb.p)}!`)), color: col.bad(), weight: 650 });
          else paras.push({ s: say(L('Achtung: Erst +20 %, dann −20 % ergibt nicht den alten Preis: 1,2 · 0,8 = 0,96 – also 4 % weniger.', 'Careful: +20 % and then −20 % does not give the old price: 1.2 · 0.8 = 0.96 – that is 4 % less.')), color: theme.muted });
        } else if (s === 'erh') {
          paras.push({ s: show ? say(L(`Nach +${pct(pb.p)} kostet es ${pct(pb.q)} des alten Preises: ${val(pb.G)} · ${fac} = ${val(pb.W)}. Der Streifen wird länger.`, `After +${pct(pb.p)} it costs ${pct(pb.q)} of the old price: ${val(pb.G)} · ${fac} = ${val(pb.W)}. The bar gets longer.`)) : say(L('Nach einer Erhöhung ist der neue Preis mehr als 100 % des alten Preises.', 'After an increase the new price is more than 100 % of the old price.')) });
          if (f === 'G' && show) paras.push({ s: say(L(`Stolperstein: ${val(pb.W)} ≙ ${pct(pb.q)} – nicht 100 %! Darum ${val(pb.W)} : ${fac}. Wer ${pct(pb.p)} von ${val(pb.W)} abzieht, rechnet mit dem falschen Grundwert.`, `Pitfall: ${val(pb.W)} ≙ ${pct(pb.q)} – not 100 %! So ${val(pb.W)} : ${fac}. Taking ${pct(pb.p)} off ${val(pb.W)} uses the wrong base value.`)), color: col.bad(), weight: 650 });
          else if (f === 'G') paras.push({ s: say(L(`Stolperstein: Der neue Preis entspricht nicht 100 %. Welchem Prozentsatz dann?`, `Pitfall: the new price is not 100 %. Which rate is it then?`)), color: col.bad(), weight: 650 });
          else paras.push({ s: say(L('Erst +20 %, dann −20 %: 1,2 · 0,8 = 0,96 – am Ende 4 % weniger als am Anfang.', '+20 % and then −20 %: 1.2 · 0.8 = 0.96 – in the end 4 % less than at the start.')), color: theme.muted });
        } else if (s === 'mwst') {
          paras.push({ s: say(L('In Deutschland beträgt die Mehrwertsteuer meist 19 %, für Lebensmittel und Bücher 7 %. Bruttopreis = Nettopreis · 1,19.', 'In Germany VAT is usually 19 %, for food and books 7 %. Gross price = net price · 1.19.')) });
          if (f === 'G') paras.push({ s: say(L(`Der Bruttopreis entspricht ${pct(pb.q)}. Nettopreis = Bruttopreis : ${fac}.`, `The gross price corresponds to ${pct(pb.q)}. Net price = gross price : ${fac}.`)), color: col.bad(), weight: 650 });
        } else if (s === 'zins') {
          paras.push({ s: say(L('Zinsen für ein Jahr: Zinsen = Kapital · p/100. Der Zinssatz ist der Prozentsatz, das Kapital der Grundwert.', 'Interest for one year: interest = capital · p/100. The interest rate is the rate, the capital is the base value.')) });
          if (show && !hidden('G')) paras.push({ s: say(L(`Nach einem Jahr: ${val(pb.G)} + ${val(pb.W)} = ${val(pb.G + pb.W)}.`, `After one year: ${val(pb.G)} + ${val(pb.W)} = ${val(pb.G + pb.W)}.`)), color: col.W(), weight: 650 });
        } else {
          paras.push({ s: say(L('Anteil in Prozent = Anzahl : Gesamtzahl. Bei Personen muss der Prozentwert eine ganze Zahl sein.', 'Share in percent = number : total. For people the percentage value must be a whole number.')) });
          if (!isNice(pb.W, 0)) paras.push({ s: say(L(`${val(pb.W)} ist keine ganze Zahl – so viele Kinder gibt es nicht. Wähle einen anderen Prozentsatz.`, `${val(pb.W)} is not a whole number – that cannot be. Choose another rate.`)), color: col.bad(), weight: 650 });
          else if (show && !hidden('G')) paras.push({ s: say(L(`Ohne Rad: ${val(pb.G - pb.W)} (${pct(100 - pb.q)}).`, `Not by bike: ${val(pb.G - pb.W)} (${pct(100 - pb.q)}).`)), color: theme.muted });
        }
        const blocks = paras.map((pp) => ({ lines: wrapText(pp.s, R.w - 2 * pad, `${pp.weight ?? 500} ${size}px ${theme.font}`), pp }));
        const hh = 40 + blocks.reduce((sum, b) => sum + b.lines.length * lh + 6, 0) + 6;
        if (measure) return hh;
        const H = Math.max(hh, R.h);
        card({ ...R, h: H }, col.p());
        cardTitle(R, say(L('Merke', 'Key fact')), col.p());
        let y = R.y + 40;
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3 - 1.2));
        for (const b of blocks) {
          b.lines.forEach((ln, i) => label(ln, R.x + pad, y + lh / 2 + i * lh, `${b.pp.weight ?? 500} ${size}px ${theme.font}`, b.pp.color ?? theme.text, 'left'));
          y += b.lines.length * lh + 6;
        }
        g.restore();
        return hh;
      };
    }

    function drawCards(C: Rect, cols: number, k: Intro, now: number): void {
      const g = surface.g;
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const place = (fn: CardFn, R: Rect, i: number, stretch = false) => {
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate(0, (1 - ease.outCubic(a)) * 14);
        const drawn = fn({ ...R, h: stretch ? R.h : Math.min(hh, R.h) }, false);
        g.restore();
        return drawn;
      };
      gridHit = [];
      if (cols === 3) {
        const w1 = Math.round((C.w - 2 * gap) * 0.37);
        const w2 = Math.round((C.w - 2 * gap) * 0.32);
        const w3 = C.w - 2 * gap - w1 - w2;
        place(stepsCard(k, now), { x: C.x, y: C.y, w: w1, h: C.h }, 0, true);
        place(repCard(k, now, C.h), { x: C.x + w1 + gap, y: C.y, w: w2, h: C.h }, 1, true);
        place(noteCard(k), { x: C.x + w1 + w2 + 2 * gap, y: C.y, w: w3, h: C.h }, 2, true);
        return;
      }
      if (cols === 2) {
        const w1 = Math.round((C.w - gap) * 0.52);
        const w2 = C.w - gap - w1;
        place(stepsCard(k, now), { x: C.x, y: C.y, w: w1, h: C.h }, 0, true);
        const nc = noteCard(k);
        const rx = C.x + w1 + gap;
        const hN = nc({ x: rx, y: C.y, w: w2, h: C.h }, true);
        const room = C.h - hN - gap;
        if (room >= 118) {
          const rc = repCard(k, now, room);
          const hR = place(rc, { x: rx, y: C.y, w: w2, h: room }, 1);
          place(nc, { x: rx, y: C.y + (hR > 0 ? hR + gap : 0), w: w2, h: C.h - (hR > 0 ? hR + gap : 0) }, 2, true);
        } else {
          const hR = place(repCard(k, now, C.h), { x: rx, y: C.y, w: w2, h: C.h }, 1);
          if (hR > 0) place(nc, { x: rx, y: C.y + hR + gap, w: w2, h: C.h - hR - gap }, 2);
        }
        return;
      }
      let y = C.y;
      const list: CardFn[] = [stepsCard(k, now), repCard(k, now, 210), noteCard(k)];
      list.forEach((fn, i) => {
        const hh = place(fn, { x: C.x, y, w: C.w, h: C.y + C.h - y }, i);
        if (hh >= 0) y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    const fr = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    function updateReadouts(): void {
      const pb = P();
      const f = find();
      const s = sit();
      const sg = sgn();
      const vG = val(pb.G);
      const vW = val(pb.W);
      const qn = fmt.num(pb.q, 2);
      const fac = fmt.num(pb.q / 100, 4);
      if (f === 'W') ctx.readout('giv', { html: `<var>G</var> = ${vG}, ${sg === 0 ? `<var>p</var> = ${pct(pb.p)}` : `${sg < 0 ? '−' : '+'}${pct(pb.p)} ⇒ ${qn} %`}` });
      else if (f === 'p') ctx.readout('giv', { html: `<var>G</var> = ${vG}, <var>W</var> = ${vW}` });
      else ctx.readout('giv', { html: `<var>W</var> = ${vW}, ${sg === 0 ? `<var>p</var> = ${pct(pb.p)}` : `${sg < 0 ? '−' : '+'}${pct(pb.p)} ⇒ ${qn} %`}` });
      const rows = ruleOfThree(f, pb.G, pb.q);
      const gNone = f === 'G' && !(pb.q > 0);
      ctx.readout('calc', { html: rows.map(([pp, vv], i) => `${pct(pp)} ≙ ${gNone && i > 0 ? '?' : val(vv)}`).join(' → ') });
      if (f === 'W') ctx.readout('res', { html: `<var>W</var> = ${vG} · ${fr(qn, '100')} = <strong>${vW}</strong>` });
      else if (f === 'p') ctx.readout('res', { html: `${sg === 0 ? '<var>p</var> %' : `<var>W</var> : <var>G</var>`} = ${fr(vW, vG)} = ${fmt.num(pb.q / 100, 4)} = <strong>${pct(pb.q)}</strong>${sg !== 0 ? ` ⇒ ${sg < 0 ? say(L('Rabatt', 'discount')) : say(L('Erhöhung', 'increase'))} <strong>${pct(pb.p)}</strong>` : ''}` });
      else ctx.readout('res', Number.isFinite(pb.result) ? { html: `<var>G</var> = ${vW} · ${fr('100', qn)} = ${vW} : ${fac} = <strong>${vG}</strong>` } : say(L('Bei 0 % lässt sich der Grundwert nicht bestimmen.', 'At 0 % the base value cannot be found.')));
      let extra: string | null = null;
      if (s === 'rabatt') extra = say(L(`Rabatt ${val(pb.D)}, neuer Preis ${vW}`, `Discount ${val(pb.D)}, new price ${vW}`));
      else if (s === 'erh') extra = say(L(`Aufschlag ${val(pb.D)}, neuer Preis ${vW}`, `Increase ${val(pb.D)}, new price ${vW}`));
      else if (s === 'mwst') extra = say(L(`Mehrwertsteuer ${val(pb.D)}, Bruttopreis ${vW}`, `VAT ${val(pb.D)}, gross price ${vW}`));
      else if (s === 'zins') extra = say(L(`Zinsen ${vW}, Kontostand nach einem Jahr ${val(pb.G + pb.W)}`, `Interest ${vW}, balance after one year ${val(pb.G + pb.W)}`));
      else if (s === 'klasse') extra = isNice(pb.W, 0) ? say(L(`Mit dem Rad: ${vW}, ohne Rad: ${val(pb.G - pb.W)}`, `By bike: ${vW}, not by bike: ${val(pb.G - pb.W)}`)) : say(L(`${vW} – keine ganze Zahl, bei Kindern nicht möglich`, `${vW} – not a whole number, impossible for children`));
      ctx.readout('extra', gNone ? null : extra);
      const [n0, d0] = asFraction(pb.q);
      ctx.readout('frac', { html: `${pct(pb.q)} = ${fr(qn, '100')}${d0 !== 100 ? ` = ${fr(String(n0), String(d0))}` : ''} = ${fmt.num(pb.q / 100, 4)}` });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      for (const c of allChans()) if (c.step(now, dt)) anim = true;
      if (solve && now - solve.t0 > solveEnd()) {
        solve = null;
        if (trapWanted() && !reduced()) TRAP.glide(1, 600, 0, now);
        else TRAP.jump(trapWanted() ? 1 : 0);
      }
      if (solve || intro !== null) anim = true;
      if (sceneFade !== null && now - sceneFade > 800) sceneFade = null;
      if (sceneFade !== null || cardFade !== null) anim = true;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawScene(R.scene, k, now);
      drawStrip(R.strip, k, now);
      g.restore();
      drawCards(R.cards, R.cols, k, now);
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retarget(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const q = shareRate(sit(), pr.p);
      const targets: [Chan, number][] = [
        [QS, q],
        [GS, pr.G],
        [MX, maxPct(q)],
      ];
      for (const [c, v] of targets) {
        if (instant) c.jump(v);
        else if (dragging()) c.follow(v, 0.04);
        else if (source === 'replace') c.glide(v, 850, 0, now);
        else if (Math.abs(c.goal - v) > 1e-12) c.follow(v, 0.14);
      }
      const tv = trapWanted() ? 1 : 0;
      if (instant) TRAP.jump(tv);
      else if (TRAP.goal !== tv) TRAP.glide(tv, 600, tv ? 200 : 0, now);
    }

    function startSolve(now: number): void {
      if (reduced()) {
        solve = null;
        return;
      }
      const target = solveTarget();
      solve = { t0: now, dur3: clamp(target * 55, 2200, 4800) };
      if (TRAP.goal !== 0) TRAP.glide(0, 400, 0, now);
    }

    /* ---------- Zeiger ---------- */
    const pStep = () => (sit() === 'zins' ? 0.5 : 1);
    function pFromX(px: number): number {
      const gm = geo(regions().strip);
      const q = (px - gm.x0) / gm.k;
      const sg = sgn();
      const raw = sg < 0 ? 100 - q : sg > 0 ? q - 100 : q;
      const st = pStep();
      return clamp(Math.round(raw / st) * st, 0, sg < 0 ? 100 : 150);
    }
    const onHandle = (px: number, py: number) => Math.abs(px - handleHit.x) < fs(16, 20) && Math.abs(py - handleHit.y) < handleHit.h / 2 + 12;
    const onStrip = (px: number, py: number) => px >= stripHit.x - 6 && px <= stripHit.x + stripHit.w + 6 && py >= stripHit.y && py <= stripHit.y + stripHit.h;
    surface.addTarget({
      contains: (px: number, py: number) => drag || (!ctx.locked && !solve && (onHandle(px, py) || onStrip(px, py))),
      pointerDown: (pt: { px: number; py: number }) => {
        if (ctx.locked || solve) return false;
        if (!onHandle(pt.px, pt.py) && !onStrip(pt.px, pt.py)) return false;
        drag = true;
        surface.setCursor('grabbing');
        if (!onHandle(pt.px, pt.py)) ctx.set({ p: pFromX(pt.px) });
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!drag || ctx.locked) return;
        lastDrag = performance.now();
        const v = pFromX(pt.px);
        if (v !== pr.p) ctx.set({ p: v });
      },
      pointerUp: () => {
        drag = false;
        lastDrag = performance.now();
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt && !ctx.locked && !solve ? (onHandle(pt.px, pt.py) ? 'handle' : onStrip(pt.px, pt.py) ? 'strip' : null) : null;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h === 'handle' ? (drag ? 'grabbing' : 'grab') : h === 'strip' ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /** Kästchen des Hunderterfelds antippen: setzt den Prozentsatz. */
    function cellAt(px: number, py: number): number | null {
      if (rep() !== 'grid') return null;
      for (const gh of gridHit) {
        const i = Math.floor((px - gh.x) / gh.s);
        const j = Math.floor((py - gh.y) / gh.s);
        if (i >= 0 && i < 10 && j >= 0 && j < 10) return gh.count * 100 + j * 10 + i;
      }
      return null;
    }
    new TapTarget(surface, {
      hit: (px, py) => {
        if (ctx.locked || solve) return null;
        const c = cellAt(px, py);
        return c === null ? null : String(c);
      },
      onHover: (id) => {
        const v = id === null ? -1 : Number(id);
        if (v !== hoverCell) {
          hoverCell = v;
          ctx.requestRender();
        }
      },
      onTap: (id) => {
        if (ctx.locked) return;
        const q = Number(id) + 1;
        const sg = sgn();
        const raw = sg < 0 ? 100 - q : sg > 0 ? q - 100 : q;
        if (sg > 0 && raw < 0) return;
        ctx.set({ p: clamp(raw, 0, sg < 0 ? 100 : 150) });
      },
    });

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('sit')) ctx.set({ ...START[sit()] });
        if (sit() === 'klasse' && pr.G > 100) ctx.set({ G: 100 });
        if (sit() === 'rabatt' && pr.p > 100) ctx.set({ p: 100 });
        if ((source === 'input' || source === 'replace' || source === 'sim') && [...changed].some((key) => key !== 'rep')) {
          if (!(source === 'sim' && changed.size === 1 && changed.has('show'))) solve = null;
        }
        retarget(now, source);
        if (source !== 'init' && !reduced()) {
          if (changed.has('sit') || source === 'replace') sceneFade = now;
          if (changed.has('sit') || changed.has('find') || changed.has('show') || changed.has('rep') || source === 'replace') cardFade = now;
        }
        if (source === 'init' && !reduced()) {
          intro = now;
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'solve') {
          if (!pr.show) ctx.set({ show: true });
          startSolve(now);
        } else if (id === 'task') {
          let t = randomTask(sit(), Math.random);
          for (let i = 0; i < 6 && t.G === pr.G && t.p === pr.p && t.find === find(); i++) t = randomTask(sit(), Math.random);
          ctx.set({ find: t.find, G: t.G, p: t.p, show: false });
          if (!reduced()) {
            sceneFade = now;
            cardFade = now;
            QS.glide(shareRate(sit(), t.p), 900, 0, now);
            GS.glide(t.G, 900, 0, now);
          }
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});

