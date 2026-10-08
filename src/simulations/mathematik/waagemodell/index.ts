import { defineSimulation, ease, FixedStepper, prefersReducedMotion, roundRect, Surface, TapTarget, text, withAlpha, type Rect } from '../../../sim-core';
import {
  canDivide,
  canSubtract,
  divide,
  fracText,
  isSolved,
  LIMITS,
  mergeable,
  modelFit,
  noVariableLeft,
  opText,
  packageWeight,
  pans,
  randomEquation,
  samePans,
  solve,
  stepBetween,
  subtract,
  suggestedDivisor,
  tiltTarget,
  weight,
  type Op,
  type Pans,
  type Side,
} from './model';

const L = (de: string, en: string) => ({ de, en });

type SideId = 'L' | 'R';
type Kind = 'x' | '1';

/** Ein Gegenstand auf einer Waagschale (für Animationen mit eigener Identität). */
interface Item {
  id: number;
  side: SideId;
  kind: Kind;
  /** Lage relativ zur Mitte der Schalenoberfläche (unten Mitte des Gegenstands). */
  rx: number;
  ry: number;
  /** Teilgruppe beim Teilen beider Seiten. */
  group?: number;
  leaving?: { start: number; x: number; y: number; dir: number; delay: number };
  /** Zeitpunkt des Auflegens (für das Hineinfallen). */
  born: number;
}

interface Line {
  eq: Pans;
  op?: Op;
}

interface Snapshot {
  current: Pans;
  balanced: Pans;
  lines: Line[];
  opened: boolean;
}

interface Geo {
  r: Rect;
  pivotX: number;
  pivotY: number;
  arm: number;
  hang: number;
  panW: number;
  floorY: number;
  item: { bw: number; bh: number; ww: number; wh: number };
  labelY: number;
}

/**
 * Waagemodell: Lineare Gleichungen als Balkenwaage mit x-Päckchen und
 * Gewichtsstücken. Wer nur auf einer Seite etwas wegnimmt, sieht die Waage
 * kippen; Äquivalenzumformungen erhalten das Gleichgewicht.
 */
export default defineSimulation({
  id: 'waagemodell',
  layout: { aspect: 1.5, aspectNarrow: 0.66 },
  groups: [
    { id: 'left', label: L('Linke Waagschale', 'Left pan') },
    { id: 'right', label: L('Rechte Waagschale', 'Right pan') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'a', type: 'number', group: 'left', label: L('x-Päckchen links', 'x-boxes on the left'), min: 0, max: LIMITS.x, step: 1, default: 3 },
    { key: 'b', type: 'number', group: 'left', label: L('Gewichtsstücke links', 'Weights on the left'), min: 0, max: LIMITS.c, step: 1, default: 2 },
    { key: 'c', type: 'number', group: 'right', label: L('x-Päckchen rechts', 'x-boxes on the right'), min: 0, max: LIMITS.x, step: 1, default: 1 },
    { key: 'd', type: 'number', group: 'right', label: L('Gewichtsstücke rechts', 'Weights on the right'), min: 0, max: LIMITS.c, step: 1, default: 8 },
    { key: 'labels', type: 'boolean', group: 'view', label: L('Terme unter den Waagschalen', 'Terms below the pans'), default: true },
  ],
  actions: [
    { id: 'subx', label: L('Beide Seiten − x', 'Both sides − x'), primary: true },
    { id: 'sub1', label: L('Beide Seiten − 1', 'Both sides − 1'), primary: true },
    { id: 'div', label: L('Beide Seiten : 2', 'Both sides : 2'), primary: true },
    { id: 'undo', label: L('Rückgängig', 'Undo') },
    { id: 'open', label: L('Päckchen öffnen', 'Open the boxes') },
    { id: 'new', label: L('Neue Gleichung', 'New equation') },
  ],
  readouts: [
    { key: 'eq', label: L('Gleichung', 'Equation') },
    { key: 'chain', label: L('Umformungen', 'Transformations') },
    { key: 'scale', label: L('Waage', 'Balance') },
    { key: 'sol', label: L('Lösung', 'Solution'), spoiler: true },
    { key: 'probe', label: L('Probe', 'Check'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('3x + 2 = x + 8', '3x + 2 = x + 8'), values: {} },
    { id: 'simple', label: L('2x + 3 = 11', '2x + 3 = 11'), values: { a: 2, b: 3, c: 0, d: 11 } },
    { id: 'both', label: L('5x + 2 = 2x + 14', '5x + 2 = 2x + 14'), values: { a: 5, b: 2, c: 2, d: 14 } },
    { id: 'right', label: L('x + 12 = 4x + 3', 'x + 12 = 4x + 3'), values: { a: 1, b: 12, c: 4, d: 3 } },
    { id: 'none', label: L('Keine Lösung', 'No solution'), values: { a: 2, b: 3, c: 2, d: 5 } },
    { id: 'limit', label: L('Grenze des Modells', 'Limit of the model'), values: { a: 1, b: 9, c: 3, d: 13 } },
  ],
  strings: {
    de: {
      canvas: 'Balkenwaage mit x-Päckchen und Gewichtsstücken auf beiden Waagschalen, daneben die Umformungen',
      title: 'Umformungen',
      tap: 'Tippe auf ein Päckchen oder Gewichtsstück, um es wegzunehmen – oder nutze die Knöpfe.',
      oneSide: 'Nur {where} weggenommen – die Waage kippt! Nimm {other} dasselbe weg oder mache es rückgängig.',
      noMatch: 'Auf der anderen Seite fehlt so ein Gegenstand – das Gleichgewicht lässt sich so nicht wiederherstellen. Rückgängig?',
      unequal: 'Links und rechts wurde Verschiedenes weggenommen – das ist keine Äquivalenzumformung. Rückgängig?',
      luck: 'Die Waage ist zufällig im Gleichgewicht – aber links und rechts wurde Verschiedenes weggenommen. Ohne x zu kennen, weiß man das nicht vorher. Rückgängig?',
      ok: 'Auf beiden Seiten {op}: Die Waage bleibt im Gleichgewicht.',
      divided: 'Beide Seiten in {n} gleiche Teile geteilt, je ein Teil bleibt: Die Waage bleibt im Gleichgewicht.',
      solved: 'Gelöst: x = {x}. Öffne die Päckchen zur Probe!',
      all: 'Es bleibt {eq} – das stimmt immer: Jede Zahl ist eine Lösung (L = ℚ).',
      none: 'Es bleibt {eq} – ein Widerspruch: Die Gleichung hat keine Lösung (L = { }).',
      noDiv: '{eq}: {c} Gewichtsstücke lassen sich nicht in {n} gleiche Teile teilen. Rechnerisch: x = {x} – hier stößt das Modell an seine Grenze.',
      negative: 'Für kein Päckchengewicht ist die Waage im Gleichgewicht: Die Lösung x = {x} ist negativ – negative Gewichte gibt es nicht. Grenze des Waagemodells!',
      zero: 'Die Lösung wäre x = 0 – Päckchen ohne Gewicht gibt es nicht. Grenze des Waagemodells!',
      noneStart: 'Links und rechts liegen gleich viele Päckchen, aber verschieden viele Gewichtsstücke: Die Waage kann nie im Gleichgewicht sein.',
      opened: 'Jedes Päckchen wiegt {x}. Probe in der Ausgangsgleichung: links {l}, rechts {r}.',
      left: 'links',
      right: 'rechts',
      balanced: 'im Gleichgewicht',
      tiltL: 'kippt nach links – die linke Seite ist schwerer',
      tiltR: 'kippt nach rechts – die rechte Seite ist schwerer',
      solUnique: 'x = {x}, also L = {{set}}',
      solNone: 'keine Lösung: L = { }',
      solAll: 'jede Zahl ist Lösung: L = ℚ',
      solNegative: 'x = {x}, also L = {{set}} – im Waagemodell nicht darstellbar (negatives Gewicht)',
      solZero: 'x = 0, also L = {0} – im Waagemodell nicht darstellbar',
      probe: 'links: {l} · rechts: {r}',
      divBtn: 'Beide Seiten : {n}',
      divBtnNone: 'Beide Seiten : n',
      close: 'Päckchen schließen',
      openBtn: 'Päckchen öffnen',
      pending: 'nur {where}',
    },
    en: {
      canvas: 'Balance with x-boxes and weights on both pans, next to it the transformations',
      title: 'Transformations',
      tap: 'Tap a box or a weight to remove it – or use the buttons.',
      oneSide: 'Removed on the {where} only – the balance tips! Remove the same on the {other} or undo.',
      noMatch: 'The other side has no such object – the balance cannot be restored this way. Undo?',
      unequal: 'Different things were removed on the two sides – that is not an equivalence transformation. Undo?',
      luck: 'The balance happens to be level – but different things were removed on the two sides. Without knowing x you could not know that. Undo?',
      ok: 'On both sides {op}: the balance stays level.',
      divided: 'Both sides split into {n} equal parts, one part stays: the balance stays level.',
      solved: 'Solved: x = {x}. Open the boxes to check!',
      all: '{eq} remains – always true: every number is a solution.',
      none: '{eq} remains – a contradiction: the equation has no solution.',
      noDiv: '{eq}: {c} weights cannot be split into {n} equal parts. By calculation: x = {x} – the model reaches its limit here.',
      negative: 'The balance is never level: the solution x = {x} is negative – there are no negative weights. Limit of the balance model!',
      zero: 'The solution would be x = 0 – boxes without weight do not exist. Limit of the balance model!',
      noneStart: 'Both pans hold the same number of boxes but different numbers of weights: the balance can never be level.',
      opened: 'Each box weighs {x}. Check in the original equation: left {l}, right {r}.',
      left: 'left',
      right: 'right',
      balanced: 'level',
      tiltL: 'tips to the left – the left side is heavier',
      tiltR: 'tips to the right – the right side is heavier',
      solUnique: 'x = {x}, so the solution set is {{set}}',
      solNone: 'no solution: { }',
      solAll: 'every number is a solution',
      solNegative: 'x = {x}, solution set {{set}} – cannot be shown with a balance (negative weight)',
      solZero: 'x = 0, solution set {0} – cannot be shown with a balance',
      probe: 'left: {l} · right: {r}',
      divBtn: 'Both sides : {n}',
      divBtnNone: 'Both sides : n',
      close: 'Close the boxes',
      openBtn: 'Open the boxes',
      pending: '{where} only',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));

    /* ---------- Zustand ---------- */
    let start = pans(p.a, p.b, p.c, p.d);
    let current = start;
    let balanced = start;
    let lines: Line[] = [{ eq: start }];
    let history: Snapshot[] = [];
    let opened = false;
    let openAt = 0;
    let items: Item[] = [];
    let nextId = 1;
    let status: { text: string; tone: 'info' | 'ok' | 'warn' | 'error' } | null = null;
    let divAnim: { n: number; start: number } | null = null;
    let hovered: number | null = null;
    // Waagebalken: Winkel in Grad (positiv: links unten) und Winkelgeschwindigkeit
    let theta = 0;
    let omega = 0;
    const stepper = new FixedStepper(1 / 240);
    let lastFrame = performance.now();
    let geo: Geo | null = null;

    const w = () => packageWeight(start);
    const pending = () => !samePans(current, balanced);
    const fit = () => modelFit(start);

    /* ---------- Gegenstände ---------- */
    function countOf(side: SideId, kind: Kind): number {
      const s = side === 'L' ? current.left : current.right;
      return kind === 'x' ? s.x : s.c;
    }

    /** Gegenstände an die Anzahlen anpassen (fehlende fallen von oben herein). */
    function syncItems(now: number, stagger = false): void {
      let k = 0;
      for (const side of ['L', 'R'] as const) {
        for (const kind of ['x', '1'] as const) {
          const live = items.filter((it) => it.side === side && it.kind === kind && !it.leaving);
          const want = countOf(side, kind);
          for (let i = live.length; i < want; i++) {
            items.push({ id: nextId++, side, kind, rx: 0, ry: -140, born: now + (stagger ? k++ * 45 : 0) });
          }
          for (let i = want; i < live.length; i++) leave(live[live.length - 1 - (i - want)]!, now, 0);
        }
      }
    }

    function leave(it: Item, now: number, delay: number): void {
      const pos = absPos(it);
      it.leaving = { start: now, x: pos[0], y: pos[1], dir: it.side === 'L' ? -1 : 1, delay };
    }

    /** Oberster Gegenstand einer Art (wird bei „beide Seiten“ weggenommen). */
    function topItem(side: SideId, kind: Kind): Item | undefined {
      const live = items.filter((it) => it.side === side && it.kind === kind && !it.leaving);
      return live.sort((a, b) => a.ry - b.ry || b.id - a.id)[0];
    }

    function resetAll(now: number): void {
      start = pans(p.a, p.b, p.c, p.d);
      current = start;
      balanced = start;
      lines = [{ eq: start }];
      history = [];
      opened = false;
      divAnim = null;
      for (const it of items) if (!it.leaving) leave(it, now, 0);
      items = items.filter((it) => it.leaving);
      syncItems(now + 120, true);
      status = startStatus();
      if (fit() !== 'ok' && fit() !== 'all') {
        theta = 0;
        omega = 0;
      }
    }

    function startStatus(): typeof status {
      const f = fit();
      const s = solve(start);
      if (f === 'negative' && s.kind === 'unique') return { text: tr('negative', { x: fracText(s.x, lang) }), tone: 'error' };
      if (f === 'zero') return { text: ctx.t('zero'), tone: 'error' };
      if (f === 'none') return { text: ctx.t('noneStart'), tone: 'warn' };
      return isolatedHint(start);
    }

    /** k·x = Zahl, aber die Gewichtsstücke lassen sich nicht in k gleiche Teile teilen: Modellgrenze. */
    function isolatedHint(pp: Pans): typeof status {
      const s = solve(pp);
      const iso = (a: Side, b: Side) => a.x > 1 && a.c === 0 && b.x === 0;
      const isoSide = iso(pp.left, pp.right) ? pp.left : iso(pp.right, pp.left) ? pp.right : null;
      if (!isoSide || canDivide(pp, isoSide.x) || s.kind !== 'unique' || s.x.den === 1) return null;
      const other = isoSide === pp.left ? pp.right : pp.left;
      const eq = isoSide === pp.left ? `${isoSide.x}x = ${other.c}` : `${other.c} = ${isoSide.x}x`;
      return { text: tr('noDiv', { eq, c: other.c, n: isoSide.x, x: fracText(s.x, lang) }), tone: 'warn' };
    }

    function snapshot(): void {
      history.push({ current, balanced, lines: [...lines], opened });
      if (history.length > 60) history.shift();
    }

    /* ---------- Umformungen ---------- */
    function pushLine(op: Op): void {
      const last = lines[lines.length - 1]!;
      if (last.op && mergeable(last.op, op) && lines.length > 1) {
        const merged: Op = last.op.kind === 'sub' && op.kind === 'sub' ? { kind: 'sub', x: last.op.x + op.x, c: last.op.c + op.c } : op;
        lines = [...lines.slice(0, -1), { eq: current, op: merged }];
      } else lines = [...lines, { eq: current, op }];
      balanced = current;
    }

    /** Status nach einer gültigen Umformung (gelöst? Widerspruch? Modellgrenze?). */
    function afterStep(base: string): void {
      const s = solve(current);
      if (isSolved(current) && s.kind === 'unique') status = { text: tr('solved', { x: fracText(s.x, lang) }), tone: 'ok' };
      else if (noVariableLeft(current)) {
        const eq = `${current.left.c} = ${current.right.c}`;
        status = { text: tr(current.left.c === current.right.c ? 'all' : 'none', { eq }), tone: current.left.c === current.right.c ? 'ok' : 'warn' };
      } else status = isolatedHint(current) ?? { text: base, tone: 'ok' };
    }

    function bothSides(kind: Kind): void {
      if (pending()) return;
      const x = kind === 'x' ? 1 : 0;
      const c = kind === '1' ? 1 : 0;
      if (!canSubtract(current, x, c)) return;
      snapshot();
      const now = performance.now();
      const l = topItem('L', kind);
      const r = topItem('R', kind);
      if (l) leave(l, now, 0);
      if (r) leave(r, now, 90);
      current = subtract(current, x, c);
      pushLine({ kind: 'sub', x, c });
      afterStep(tr('ok', { op: opText({ kind: 'sub', x, c }) }));
      refresh();
    }

    function divideBoth(): void {
      if (pending() || divAnim) return;
      const n = suggestedDivisor(current);
      if (!n || !canDivide(current, n)) return;
      snapshot();
      const now = performance.now();
      // Gegenstände jeder Art gleichmäßig auf n Gruppen verteilen; Gruppe 0 bleibt liegen
      for (const side of ['L', 'R'] as const) {
        for (const kind of ['x', '1'] as const) {
          const live = items.filter((it) => it.side === side && it.kind === kind && !it.leaving).sort((a, b) => a.id - b.id);
          const per = live.length / n;
          live.forEach((it, i) => (it.group = Math.floor(i / per)));
        }
      }
      divAnim = { n, start: now };
      current = divide(current, n);
      pushLine({ kind: 'div', n });
      afterStep(tr('divided', { n }));
      refresh();
    }

    function removeOne(it: Item): void {
      if (divAnim) return;
      snapshot();
      const now = performance.now();
      leave(it, now, 0);
      const side = it.side === 'L' ? current.left : current.right;
      const changed: Side = it.kind === 'x' ? { x: side.x - 1, c: side.c } : { x: side.x, c: side.c - 1 };
      current = it.side === 'L' ? { left: changed, right: current.right } : { left: current.left, right: changed };
      const step = stepBetween(balanced, current);
      if (step) {
        pushLine(step);
        afterStep(tr('ok', { op: opText(step) }));
      } else {
        const lx = balanced.left.x - current.left.x;
        const lc = balanced.left.c - current.left.c;
        const rx = balanced.right.x - current.right.x;
        const rc = balanced.right.c - current.right.c;
        const onlyLeft = rx === 0 && rc === 0;
        const onlyRight = lx === 0 && lc === 0;
        const physical = Math.abs(weight(current.left, w()) - weight(current.right, w())) < 1e-9;
        if (onlyLeft || onlyRight) {
          const otherSide = onlyLeft ? current.right : current.left;
          const needX = onlyLeft ? lx : rx;
          const needC = onlyLeft ? lc : rc;
          const possible = otherSide.x >= needX && otherSide.c >= needC;
          status = possible
            ? { text: tr('oneSide', { where: ctx.t(onlyLeft ? 'left' : 'right'), other: ctx.t(onlyLeft ? 'right' : 'left') }), tone: 'error' }
            : { text: ctx.t('noMatch'), tone: 'error' };
        } else status = { text: ctx.t(physical ? 'luck' : 'unequal'), tone: 'error' };
      }
      refresh();
    }

    function undo(): void {
      const snap = history.pop();
      if (!snap) return;
      current = snap.current;
      balanced = snap.balanced;
      lines = snap.lines;
      opened = snap.opened;
      divAnim = null;
      for (const it of items) it.group = undefined;
      syncItems(performance.now());
      status = pending() ? { text: ctx.t('unequal'), tone: 'error' } : startStatus();
      refresh();
    }

    function setOpened(on: boolean): void {
      if (on && fit() !== 'ok' && fit() !== 'all') return;
      opened = on;
      openAt = performance.now();
      if (on) {
        const x = w();
        const l = weight(start.left, x);
        const r = weight(start.right, x);
        status = { text: tr('opened', { x: num(x), l: probeText(start.left, x), r: probeText(start.right, x) }), tone: Math.abs(l - r) < 1e-9 ? 'ok' : 'warn' };
      } else status = null;
      refresh();
    }

    /* ---------- Texte ---------- */
    /** Element der Lösungsmenge: abbrechende Dezimalzahl oder Bruch. */
    function setText(f: { num: number; den: number }): string {
      const t = fracText(f, lang);
      return t.includes(' = ') ? t.split(' = ')[1]! : t;
    }
    const num = (v: number) => ctx.fmt.num(v, 2);
    function probeText(s: Side, x: number): string {
      const parts: string[] = [];
      if (s.x > 0) parts.push(s.x === 1 ? num(x) : `${s.x} · ${num(x)}`);
      if (s.c > 0) parts.push(String(s.c));
      const total = weight(s, x);
      const body = parts.length ? parts.join(' + ') : '0';
      return parts.length > 1 || s.x > 1 ? `${body} = ${num(total)}` : body;
    }

    function sideHtml(s: Side): string {
      const parts: string[] = [];
      if (s.x > 0) parts.push(s.x === 1 ? '<var>x</var>' : `${s.x}<var>x</var>`);
      if (s.c > 0) parts.push(String(s.c));
      return parts.length ? parts.join(' + ') : '0';
    }

    function relation(pp: Pans): '=' | '<' | '>' {
      const l = weight(pp.left, w());
      const r = weight(pp.right, w());
      return Math.abs(l - r) < 1e-9 ? '=' : l < r ? '<' : '>';
    }

    function updateReadouts(): void {
      const rel = pending() ? relation(current) : '=';
      ctx.readout('eq', { html: `${sideHtml(current.left)} ${rel === '=' ? '=' : rel === '<' ? '&lt;' : '&gt;'} ${sideHtml(current.right)}` });
      const rows = lines.map((ln, i) => {
        const op = lines[i + 1]?.op;
        return `<tr><td>${sideHtml(ln.eq.left)}</td><td>=</td><td style="text-align: left">${sideHtml(ln.eq.right)}</td><td style="text-align: left; color: var(--series-1)">${op ? `| ${opText(op).replace('x', '<var>x</var>')}` : ''}</td></tr>`;
      });
      if (pending()) rows.push(`<tr style="color: var(--series-2)"><td>${sideHtml(current.left)}</td><td>${rel === '<' ? '&lt;' : rel === '>' ? '&gt;' : '='}</td><td style="text-align: left">${sideHtml(current.right)}</td><td style="text-align: left">✗</td></tr>`);
      ctx.readout('chain', { html: `<table class="mini-table">${rows.join('')}</table>` });
      const t = targetTilt();
      ctx.readout('scale', Math.abs(t) < 1e-6 ? ctx.t('balanced') : t > 0 ? ctx.t('tiltL') : ctx.t('tiltR'));
      const s = solve(start);
      const f = fit();
      if (s.kind === 'none') ctx.readout('sol', ctx.t('solNone'));
      else if (s.kind === 'all') ctx.readout('sol', ctx.t('solAll'));
      else {
        ctx.readout('sol', tr(f === 'negative' ? 'solNegative' : f === 'zero' ? 'solZero' : 'solUnique', { x: fracText(s.x, lang), set: setText(s.x) }));
      }
      if (f === 'ok' || f === 'all') {
        const x = w();
        ctx.readout('probe', `${tr('probe', { l: probeText(start.left, x), r: probeText(start.right, x) })} ✓`);
      } else ctx.readout('probe', null);
    }

    function syncActions(): void {
      const locked = !!divAnim;
      const free = !pending() && !locked;
      ctx.setAction('subx', { enabled: free && canSubtract(current, 1, 0) });
      ctx.setAction('sub1', { enabled: free && canSubtract(current, 0, 1) });
      const n = suggestedDivisor(current);
      const useful = !!n && !noVariableLeft(current) && !isSolved(current);
      ctx.setAction('div', { enabled: free && useful, label: useful ? tr('divBtn', { n }) : ctx.t('divBtnNone') });
      ctx.setAction('undo', { enabled: history.length > 0 });
      const canOpen = (fit() === 'ok' || fit() === 'all') && start.left.x + start.right.x > 0;
      ctx.setAction('open', { enabled: canOpen, label: ctx.t(opened ? 'close' : 'openBtn') });
      ctx.setAction('new', { enabled: !ctx.locked });
    }

    function refresh(): void {
      updateReadouts();
      syncActions();
      lastFrame = performance.now();
      ctx.requestRender();
    }

    const targetTilt = () => tiltTarget(current, w());

    /* ---------- Geometrie ---------- */
    const narrow = () => surface.width < 600;

    function regions(): { scene: Rect; notes: Rect } {
      const W = surface.width;
      const H = surface.height;
      if (!narrow()) {
        const nw = Math.round(Math.min(270, W * 0.32));
        return { scene: { x: 0, y: 0, w: W - nw - 12, h: H }, notes: { x: W - nw, y: 10, w: nw - 10, h: H - 20 } };
      }
      const sh = Math.round(H * 0.64);
      return { scene: { x: 0, y: 0, w: W, h: sh }, notes: { x: 8, y: sh + 4, w: W - 16, h: H - sh - 12 } };
    }

    function buildGeo(r: Rect): Geo {
      const small = narrow();
      const floorY = r.y + r.h - (small ? 40 : 56);
      const pivotY = r.y + Math.max(small ? 70 : 96, r.h * 0.25);
      const panW = Math.min(r.w * 0.42, 250);
      const arm = r.w / 2 - (small ? 8 : 12) - panW / 2;
      const hang = (floorY - pivotY) * 0.68;
      const unit = Math.min(1.3, panW / 180);
      return {
        r,
        pivotX: r.x + r.w / 2,
        pivotY,
        arm,
        hang,
        panW,
        floorY,
        item: { bw: 40 * unit, bh: 34 * unit, ww: 22 * unit, wh: 24 * unit },
        labelY: floorY + (r.y + r.h - floorY) / 2,
      };
    }

    /** Mittelpunkt der Schalenoberfläche (die Schalen hängen senkrecht). */
    function panPos(side: SideId): [number, number] {
      const gg = geo!;
      const t = (theta * Math.PI) / 180;
      const s = side === 'L' ? -1 : 1;
      const ex = gg.pivotX + s * gg.arm * Math.cos(t);
      const ey = gg.pivotY - s * gg.arm * Math.sin(t);
      return [ex, ey + gg.hang];
    }

    function absPos(it: Item): [number, number] {
      if (!geo) return [0, 0];
      const [px, py] = panPos(it.side);
      return [px + it.rx, py + it.ry];
    }

    /** Zielpositionen auf einer Schale: Päckchen links, Gewichtsstücke rechts, gestapelt. */
    function layoutPan(side: SideId, now: number): Map<number, [number, number]> {
      const gg = geo!;
      const out = new Map<number, [number, number]>();
      const live = items.filter((it) => it.side === side && !it.leaving).sort((a, b) => a.id - b.id);
      const grouping = divAnim && now - divAnim.start < (reduced ? 0 : 1300);
      const groups = grouping ? divAnim!.n : 1;
      const width = gg.panW * 0.9;
      const colW = width / groups;
      for (let g = 0; g < groups; g++) {
        const mine = live.filter((it) => !grouping || (it.group ?? 0) === g);
        const xs = mine.filter((it) => it.kind === 'x');
        const ws = mine.filter((it) => it.kind === '1');
        const { bw, bh, ww, wh } = gg.item;
        const pc = xs.length > 4 ? 3 : Math.min(xs.length, 2);
        const wc = ws.length > 9 ? 5 : ws.length > 4 ? 4 : Math.max(1, Math.min(ws.length, 3));
        const gap = xs.length && ws.length ? 8 : 0;
        const need = pc * (bw + 2) + wc * (ww + 2) + gap;
        const s = Math.min(1, (colW - 6) / Math.max(1, need));
        const total = need * s;
        let x0 = -width / 2 + colW * g + (colW - total) / 2;
        // Unvollständige obere Reihen mittig aufsetzen (wie eine Pyramide)
        const place = (list: Item[], cols: number, cw: number, ch: number, left: number) => {
          const rowsN = Math.ceil(list.length / cols);
          list.forEach((it, i) => {
            const row = Math.floor(i / cols);
            const inRow = row === rowsN - 1 ? list.length - row * cols : cols;
            const col = i - row * cols;
            out.set(it.id, [left + ((cols - inRow) / 2 + col + 0.5) * cw * s, -row * ch * s]);
          });
        };
        place(xs, pc, bw + 2, bh + 1, x0);
        x0 += pc * (bw + 2) * s + gap * s;
        place(ws, wc, ww + 2, wh + 1, x0);
      }
      return out;
    }

    function itemScale(side: SideId): number {
      // Gleicher Maßstab wie in layoutPan für alle Gegenstände einer Schale
      const gg = geo!;
      const live = items.filter((it) => it.side === side && !it.leaving);
      const grouping = divAnim ? divAnim.n : 1;
      const colW = (gg.panW * 0.9) / grouping;
      let worst = 1;
      for (let g = 0; g < grouping; g++) {
        const mine = live.filter((it) => grouping === 1 || (it.group ?? 0) === g);
        const nx = mine.filter((it) => it.kind === 'x').length;
        const n1 = mine.length - nx;
        const pc = nx > 4 ? 3 : Math.min(nx, 2);
        const wc = n1 > 9 ? 5 : n1 > 4 ? 4 : Math.max(1, Math.min(n1, 3));
        const need = pc * (gg.item.bw + 2) + wc * (gg.item.ww + 2) + (nx && n1 ? 8 : 0);
        worst = Math.min(worst, (colW - 6) / Math.max(1, need));
      }
      return worst;
    }

    /* ---------- Antippen ---------- */
    const itemRects = new Map<number, Rect>();
    new TapTarget(surface, {
      hit: (px, py) => {
        let best: number | null = null;
        for (const [id, r] of itemRects) {
          if (px >= r.x - 3 && px <= r.x + r.w + 3 && py >= r.y - 3 && py <= r.y + r.h + 3) best = id;
        }
        return best === null ? null : String(best);
      },
      onHover: (id) => (hovered = id === null ? null : Number(id)),
      onTap: (id) => {
        if (ctx.locked) return;
        const it = items.find((q) => q.id === Number(id) && !q.leaving);
        if (it) removeOne(it);
      },
    });

    /* ---------- Zeichnen ---------- */
    function drawTokens(parts: { s: string; italic?: boolean }[], x: number, y: number, size: number, color: string, align: 'left' | 'right' | 'center'): number {
      const g = surface.g;
      const theme = ctx.theme;
      const fonts = parts.map((q) => (q.italic ? `italic ${size * 1.12}px ${theme.mathFont}` : `600 ${size}px ${theme.font}`));
      const widths = parts.map((q, i) => {
        g.font = fonts[i]!;
        return g.measureText(q.s).width + (q.italic ? size * 0.05 : 0);
      });
      const total = widths.reduce((s, v) => s + v, 0);
      let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      parts.forEach((q, i) => {
        text(g, q.s, cx, y, { font: fonts[i]!, color, align: 'left', baseline: 'middle' });
        cx += widths[i]!;
      });
      return total;
    }

    function sideTokens(s: Side): { s: string; italic?: boolean }[] {
      const out: { s: string; italic?: boolean }[] = [];
      if (s.x > 0) {
        if (s.x > 1) out.push({ s: String(s.x) });
        out.push({ s: 'x', italic: true });
      }
      if (s.c > 0) out.push({ s: out.length ? ` + ${s.c}` : String(s.c) });
      if (!out.length) out.push({ s: '0' });
      return out;
    }

    function opTokens(op: Op): { s: string; italic?: boolean }[] {
      const t = `| ${opText(op)}`;
      const i = t.indexOf('x');
      if (i < 0) return [{ s: t }];
      return [{ s: t.slice(0, i) }, { s: 'x', italic: true }, { s: t.slice(i + 1) }];
    }

    function drawBox(cx: number, by: number, bw: number, bh: number, reveal: number, hover: boolean, tag = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      const x0 = cx - bw / 2;
      const y0 = by - bh;
      // Aufdecken: Schachtel dreht sich und wird durchsichtig
      const flip = reveal <= 0 ? 1 : reveal >= 1 ? 1 : Math.abs(Math.cos(reveal * Math.PI));
      const showInside = reveal >= 0.5;
      g.save();
      g.translate(cx, 0);
      g.scale(Math.max(0.05, flip), 1);
      g.translate(-cx, 0);
      if (!showInside) {
        const grad = g.createLinearGradient(x0, y0, x0 + bw, by);
        grad.addColorStop(0, '#d9a866');
        grad.addColorStop(0.55, '#c08a4a');
        grad.addColorStop(1, '#9a6a34');
        g.fillStyle = grad;
        roundRect(g, x0, y0, bw, bh, 3);
        g.fill();
        // Deckel und Klebeband
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(x0 + 1, y0 + 1, bw - 2, bh * 0.18);
        g.fillStyle = 'rgba(90,60,25,0.35)';
        g.fillRect(x0, y0 + bh * 0.18, bw, 1.2);
        g.fillStyle = 'rgba(235,215,170,0.85)';
        g.fillRect(cx - bw * 0.09, y0, bw * 0.18, bh * 0.42);
        // Etikett mit x
        const lw = bw * 0.5;
        const lh = bh * 0.46;
        g.fillStyle = '#fbf7ee';
        roundRect(g, cx - lw / 2, y0 + bh * 0.42, lw, lh, 3);
        g.fill();
        text(g, 'x', cx, y0 + bh * 0.42 + lh / 2, { font: `italic ${lh * 0.95}px ${theme.mathFont}`, color: '#5b3d12' });
      } else {
        // Durchsichtige Schachtel mit dem Inhalt (x Gewichtsstücke)
        g.fillStyle = theme.dark ? 'rgba(200,170,120,0.18)' : 'rgba(192,138,74,0.14)';
        roundRect(g, x0, y0, bw, bh, 3);
        g.fill();
        g.strokeStyle = 'rgba(160,110,50,0.8)';
        g.lineWidth = 1.4;
        g.setLineDash([3, 2]);
        g.stroke();
        g.setLineDash([]);
        const x = w();
        if (Number.isInteger(x) && x <= 9) {
          const cols = x <= 3 ? x : x <= 4 ? 2 : 3;
          const rows = Math.ceil(x / cols);
          const cw = (bw - 6) / cols;
          const ch = (bh - 6) / rows;
          const s = Math.min(cw / 1.05, ch / 1.1);
          for (let i = 0; i < x; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            drawWeight(x0 + 3 + (col + 0.5) * cw, by - 3 - row * ch, s * 0.9, s, false, false);
          }
        } else {
          text(g, ctx.fmt.num(x, 2), cx, y0 + bh / 2, { font: `800 ${bh * 0.42}px ${theme.font}`, color: theme.dark ? '#f4d79b' : '#7a4d14' });
        }
      }
      if (hover) {
        g.strokeStyle = ctx.theme.series[0]!;
        g.lineWidth = 2.5;
        roundRect(g, x0 - 2, y0 - 2, bw + 4, bh + 4, 5);
        g.stroke();
      }
      g.restore();
      if (showInside && tag) {
        // Schildchen mit dem Gewicht eines Päckchens (eines je Schale)
        const label = `x = ${ctx.fmt.num(w(), 2)}`;
        const fs = Math.max(10, bh * 0.3);
        g.font = `800 ${fs}px ${theme.font}`;
        const tw = g.measureText(label).width + 10;
        const ty = y0 - fs * 0.9;
        g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
        roundRect(g, cx - tw / 2, ty - fs * 0.7, tw, fs * 1.4, fs * 0.7);
        g.fill();
        g.strokeStyle = theme.series[2]!;
        g.lineWidth = 1.4;
        g.stroke();
        text(g, label, cx, ty + 0.5, { font: `800 ${fs}px ${theme.font}`, color: theme.series[2]! });
      }
    }

    function drawWeight(cx: number, by: number, ww: number, wh: number, hover: boolean, label = true): void {
      const g = surface.g;
      const bodyH = wh * 0.74;
      const x0 = cx - ww / 2;
      const y0 = by - bodyH;
      const brass = g.createLinearGradient(x0, 0, x0 + ww, 0);
      brass.addColorStop(0, '#8a6a22');
      brass.addColorStop(0.32, '#f1d67e');
      brass.addColorStop(0.6, '#cfa848');
      brass.addColorStop(1, '#7b5a1a');
      g.fillStyle = brass;
      roundRect(g, x0, y0, ww, bodyH, Math.min(4, ww * 0.18));
      g.fill();
      // Griff (Knopf)
      g.beginPath();
      g.ellipse(cx, y0 - wh * 0.08, ww * 0.2, wh * 0.13, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.28)';
      g.fillRect(x0 + 2, y0 + 1.5, ww - 4, 1.2);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(x0 + 2, by - 2.2, ww - 4, 1.2);
      if (label && ww >= 14) text(g, '1', cx, y0 + bodyH * 0.55, { font: `800 ${Math.max(9, bodyH * 0.62)}px ${ctx.theme.font}`, color: '#4a3208' });
      if (hover) {
        g.strokeStyle = ctx.theme.series[0]!;
        g.lineWidth = 2.5;
        roundRect(g, x0 - 2, y0 - wh * 0.25, ww + 4, bodyH + wh * 0.25 + 2, 4);
        g.stroke();
      }
    }

    function drawScene(r: Rect, now: number, dt: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const gg = buildGeo(r);
      geo = gg;
      const small = narrow();
      g.save();
      roundRect(g, r.x + 4, r.y + 4, r.w - 8, r.h - 8, 14);
      g.clip();
      // Wand und Tisch
      const wall = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f2f5f9');
      wall.addColorStop(1, dark ? '#111925' : '#e3e9f0');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, r.h);
      const table = g.createLinearGradient(0, gg.floorY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c99f70');
      table.addColorStop(1, dark ? '#30261c' : '#9d7449');
      g.fillStyle = table;
      g.fillRect(r.x, gg.floorY, r.w, r.y + r.h - gg.floorY);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(r.x, gg.floorY, r.w, 1.5);

      // Fuß und Säule
      const metal = (x0: number, wdt: number) => {
        const m = g.createLinearGradient(x0, 0, x0 + wdt, 0);
        m.addColorStop(0, dark ? '#4c5563' : '#5d6570');
        m.addColorStop(0.45, dark ? '#c9d0da' : '#e3e7ec');
        m.addColorStop(1, dark ? '#4c5563' : '#5d6570');
        return m;
      };
      const colW = small ? 10 : 14;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const baseW = small ? 92 : 132;
      const base = g.createLinearGradient(0, gg.floorY - 22, 0, gg.floorY);
      base.addColorStop(0, dark ? '#5a6474' : '#46505d');
      base.addColorStop(1, dark ? '#2b323d' : '#262d36');
      g.fillStyle = base;
      g.beginPath();
      g.moveTo(gg.pivotX - baseW / 2, gg.floorY);
      g.lineTo(gg.pivotX - baseW / 2 + 14, gg.floorY - (small ? 14 : 20));
      g.lineTo(gg.pivotX + baseW / 2 - 14, gg.floorY - (small ? 14 : 20));
      g.lineTo(gg.pivotX + baseW / 2, gg.floorY);
      g.closePath();
      g.fill();
      g.restore();
      g.fillStyle = metal(gg.pivotX - colW / 2, colW);
      g.fillRect(gg.pivotX - colW / 2, gg.pivotY, colW, gg.floorY - (small ? 14 : 20) - gg.pivotY);

      // Waagebalken (dreht sich um den Drehpunkt)
      const t = (theta * Math.PI) / 180;
      const [lx, ly] = [gg.pivotX - gg.arm * Math.cos(t), gg.pivotY + gg.arm * Math.sin(t)];
      const [rx, ry] = [gg.pivotX + gg.arm * Math.cos(t), gg.pivotY - gg.arm * Math.sin(t)];

      // Zeiger nach unten vor einer kleinen Skala an der Säule
      const scaleR = small ? 34 : 48;
      g.save();
      const plate = g.createLinearGradient(0, gg.pivotY + scaleR * 0.6, 0, gg.pivotY + scaleR + 12);
      plate.addColorStop(0, dark ? '#253041' : '#fbfcfe');
      plate.addColorStop(1, dark ? '#1b2431' : '#e9eef4');
      g.fillStyle = plate;
      g.beginPath();
      g.arc(gg.pivotX, gg.pivotY, scaleR + 10, Math.PI / 2 - 0.5, Math.PI / 2 + 0.5);
      g.arc(gg.pivotX, gg.pivotY, scaleR - 12, Math.PI / 2 + 0.5, Math.PI / 2 - 0.5, true);
      g.closePath();
      g.fill();
      g.strokeStyle = dark ? '#3a4658' : '#c3ccd8';
      g.lineWidth = 1;
      g.stroke();
      for (let k2 = -4; k2 <= 4; k2++) {
        const a = Math.PI / 2 + k2 * 0.1;
        const len = k2 === 0 ? 10 : 5;
        g.strokeStyle = k2 === 0 ? (Math.abs(theta) < 0.6 ? theme.series[2]! : theme.muted) : theme.muted;
        g.lineWidth = k2 === 0 ? 2.5 : 1.2;
        g.beginPath();
        g.moveTo(gg.pivotX + Math.cos(a) * (scaleR + 6), gg.pivotY + Math.sin(a) * (scaleR + 6));
        g.lineTo(gg.pivotX + Math.cos(a) * (scaleR + 6 - len), gg.pivotY + Math.sin(a) * (scaleR + 6 - len));
        g.stroke();
      }
      const pa = Math.PI / 2 - t;
      g.strokeStyle = theme.series[1]!;
      g.lineWidth = 2.5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(gg.pivotX, gg.pivotY);
      g.lineTo(gg.pivotX + Math.cos(pa) * (scaleR + 4), gg.pivotY + Math.sin(pa) * (scaleR + 4));
      g.stroke();
      g.restore();

      // Gehänge und Schalen
      const [plx, ply] = panPos('L');
      const [prx, pry] = panPos('R');
      const drawHanger = (ex: number, ey: number, px: number, py: number) => {
        g.strokeStyle = dark ? 'rgba(200,210,222,0.75)' : 'rgba(70,80,92,0.75)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(ex, ey + 6);
        g.lineTo(px - gg.panW / 2 + 6, py - 2);
        g.moveTo(ex, ey + 6);
        g.lineTo(px + gg.panW / 2 - 6, py - 2);
        g.stroke();
        g.strokeStyle = dark ? '#c9d0da' : '#5d6570';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(ex, ey + 3, 4, 0, Math.PI * 2);
        g.stroke();
      };
      drawHanger(lx, ly, plx, ply);
      drawHanger(rx, ry, prx, pry);

      // Balken
      g.save();
      g.translate(gg.pivotX, gg.pivotY);
      g.rotate(-t);
      const beamH = small ? 8 : 11;
      const beam = g.createLinearGradient(0, -beamH / 2, 0, beamH / 2);
      beam.addColorStop(0, '#f6dc8a');
      beam.addColorStop(0.5, '#c99a35');
      beam.addColorStop(1, '#8a6418');
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = beam;
      g.beginPath();
      g.moveTo(-gg.arm - 6, -beamH * 0.35);
      g.lineTo(0, -beamH * 0.75);
      g.lineTo(gg.arm + 6, -beamH * 0.35);
      g.lineTo(gg.arm + 6, beamH * 0.35);
      g.lineTo(0, beamH * 0.75);
      g.lineTo(-gg.arm - 6, beamH * 0.35);
      g.closePath();
      g.fill();
      g.restore();
      // Drehpunkt
      g.fillStyle = dark ? '#d8dee6' : '#3c4552';
      g.beginPath();
      g.arc(gg.pivotX, gg.pivotY, small ? 6 : 8, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = dark ? '#7b8796' : '#c9d0da';
      g.beginPath();
      g.arc(gg.pivotX, gg.pivotY, small ? 2.5 : 3.2, 0, Math.PI * 2);
      g.fill();

      // Gegenstände (zuerst Schalen-Rückseite, dann Gegenstände, dann Rand)
      const drawPan = (px: number, py: number, front: boolean) => {
        const rx2 = gg.panW / 2;
        const ry2 = small ? 5 : 7;
        if (!front) {
          const dish = g.createLinearGradient(px - rx2, 0, px + rx2, 0);
          dish.addColorStop(0, dark ? '#59636f' : '#7c8590');
          dish.addColorStop(0.45, dark ? '#d2d8e0' : '#eef1f5');
          dish.addColorStop(1, dark ? '#59636f' : '#7c8590');
          g.fillStyle = dish;
          g.beginPath();
          g.ellipse(px, py, rx2, ry2, 0, 0, Math.PI * 2);
          g.fill();
          g.beginPath();
          g.moveTo(px - rx2, py);
          g.quadraticCurveTo(px, py + ry2 * 4.2, px + rx2, py);
          g.closePath();
          g.fill();
        } else {
          g.strokeStyle = dark ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)';
          g.lineWidth = 1.2;
          g.beginPath();
          g.ellipse(px, py, rx2 - 1, ry2 - 1, 0, 0.15, Math.PI - 0.15);
          g.stroke();
        }
      };
      drawPan(plx, ply, false);
      drawPan(prx, pry, false);

      itemRects.clear();
      const targets = new Map([...layoutPan('L', now), ...layoutPan('R', now)]);
      const k = Math.min(1, dt * (reduced ? 60 : 11));
      const scales = { L: itemScale('L'), R: itemScale('R') };
      // Gruppenrahmen beim Teilen
      if (divAnim) {
        const tt = (now - divAnim.start) / 1300;
        if (tt < 1 && !reduced) {
          const alpha = Math.min(1, tt * 4) * Math.min(1, (1 - tt) * 3);
          for (const side of ['L', 'R'] as const) {
            const [px, py] = panPos(side);
            const cw = (gg.panW * 0.9) / divAnim.n;
            const frameH = Math.max(40, -Math.min(0, ...items.filter((it) => it.side === side && !it.leaving).map((it) => it.ry)) + gg.item.bh + 16);
            for (let gi = 0; gi < divAnim.n; gi++) {
              const x0 = px - (gg.panW * 0.9) / 2 + gi * cw;
              g.strokeStyle = withAlpha(gi === 0 ? theme.series[2]! : theme.series[1]!, 0.85 * alpha);
              g.lineWidth = 2;
              g.setLineDash([5, 4]);
              const hgt = Math.min(gg.hang * 0.75, frameH);
              roundRect(g, x0 + 3, py - hgt, cw - 6, hgt - 2, 8);
              g.stroke();
              g.setLineDash([]);
            }
          }
        }
      }
      const order = [...items].sort((a, b) => b.ry - a.ry || a.id - b.id);
      // Das oberste Päckchen jeder Schale trägt beim Öffnen das Schildchen
      const tagged = new Set<number>();
      for (const side of ['L', 'R'] as const) {
        const top = items.filter((it) => it.side === side && it.kind === 'x' && !it.leaving).sort((a, b) => a.ry - b.ry || b.id - a.id)[0];
        if (top) tagged.add(top.id);
      }
      for (const it of order) {
        const s = scales[it.side];
        const { bw, bh, ww, wh } = geo.item;
        if (it.leaving) {
          const lt = Math.max(0, (now - it.leaving.start - it.leaving.delay) / (reduced ? 1 : 650));
          if (lt >= 1) continue;
          const e = ease.inCubic(lt);
          const x = it.leaving.x + it.leaving.dir * 150 * e;
          const y = it.leaving.y - 60 * Math.sin(lt * Math.PI) - 40 * e;
          g.save();
          g.globalAlpha = 1 - lt;
          g.translate(x, y);
          g.rotate(it.leaving.dir * 0.6 * e);
          g.translate(-x, -y);
          if (it.kind === 'x') drawBox(x, y, bw * s, bh * s, opened ? 1 : 0, false);
          else drawWeight(x, y, ww * s, wh * s, false);
          g.restore();
          continue;
        }
        const target = targets.get(it.id) ?? [0, 0];
        if (now < it.born) continue;
        it.rx += (target[0] - it.rx) * k;
        it.ry += (target[1] - it.ry) * Math.min(1, dt * (reduced ? 60 : 9));
        if (Math.abs(it.rx - target[0]) < 0.2) it.rx = target[0];
        if (Math.abs(it.ry - target[1]) < 0.2) it.ry = target[1];
        const [x, y] = absPos(it);
        const reveal = opened ? Math.min(1, Math.max(0, (now - openAt - (it.id % 7) * 60) / (reduced ? 1 : 520))) : 0;
        if (it.kind === 'x') {
          drawBox(x, y, bw * s, bh * s, reveal, hovered === it.id && !ctx.locked, tagged.has(it.id));
          itemRects.set(it.id, { x: x - (bw * s) / 2, y: y - bh * s, w: bw * s, h: bh * s });
        } else {
          drawWeight(x, y, ww * s, wh * s, hovered === it.id && !ctx.locked);
          itemRects.set(it.id, { x: x - (ww * s) / 2, y: y - wh * s, w: ww * s, h: wh * s });
        }
      }
      items = items.filter((it) => !it.leaving || now - it.leaving.start - it.leaving.delay < (reduced ? 1 : 650));
      drawPan(plx, ply, true);
      drawPan(prx, pry, true);

      // Terme unter den Schalen und Relationszeichen
      const rel = relation(current);
      const relColor = rel === '=' ? theme.series[2]! : theme.series[1]!;
      if (p.labels) {
        const fs = small ? 15 : 20;
        const ink = theme.dark ? '#f4f6fa' : '#1b2330';
        const cardY = gg.floorY + (r.y + r.h - gg.floorY) / 2;
        for (const [side, px] of [
          [current.left, gg.pivotX - gg.arm],
          [current.right, gg.pivotX + gg.arm],
        ] as const) {
          g.font = `600 ${fs}px ${theme.font}`;
          const toks = sideTokens(side);
          const tw = toks.reduce((sum, q) => {
            g.font = q.italic ? `italic ${fs * 1.12}px ${theme.mathFont}` : `600 ${fs}px ${theme.font}`;
            return sum + g.measureText(q.s).width;
          }, 0);
          g.fillStyle = theme.dark ? 'rgba(16,22,31,0.82)' : 'rgba(255,255,255,0.88)';
          roundRect(g, px - tw / 2 - 10, cardY - fs * 0.78, tw + 20, fs * 1.56, 8);
          g.fill();
          drawTokens(toks, px, cardY, fs, ink, 'center');
        }
        // Relationszeichen
        const rr = small ? 13 : 17;
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.25)';
        g.shadowBlur = 6;
        g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
        g.beginPath();
        g.arc(gg.pivotX, cardY, rr, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.strokeStyle = relColor;
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(gg.pivotX, cardY, rr, 0, Math.PI * 2);
        g.stroke();
        text(g, rel, gg.pivotX, cardY + 1, { font: `800 ${rr * 1.35}px ${theme.font}`, color: relColor });
      }
      g.restore();

      // Hinweiszeile
      drawStatus(r);
    }

    function drawStatus(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      const msg = status ?? (lines.length === 1 && !pending() ? { text: ctx.t('tap'), tone: 'info' as const } : null);
      if (!msg) return;
      const color = msg.tone === 'error' ? theme.series[1]! : msg.tone === 'warn' ? theme.series[3]! : msg.tone === 'ok' ? theme.series[2]! : theme.muted;
      const fs = small ? 11.5 : 13;
      g.font = `600 ${fs}px ${theme.font}`;
      const maxW = r.w - 40;
      const words = msg.text.split(' ');
      const rows: string[] = [];
      let line = '';
      for (const wd of words) {
        const test = line ? `${line} ${wd}` : wd;
        if (g.measureText(test).width > maxW && line) {
          rows.push(line);
          line = wd;
        } else line = test;
      }
      if (line) rows.push(line);
      const lh = fs * 1.3;
      const bw = Math.min(r.w - 16, Math.max(...rows.map((q) => g.measureText(q).width)) + 30);
      const bh = rows.length * lh + 12;
      const x = r.x + (r.w - bw) / 2;
      const y = r.y + 12;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
      roundRect(g, x, y, bw, bh, 10);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = withAlpha(color, theme.dark ? 0.16 : 0.08);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.55);
      g.lineWidth = 1.2;
      g.stroke();
      g.fillStyle = color;
      roundRect(g, x + 7, y + 7, 3.5, bh - 14, 2);
      g.fill();
      g.restore();
      rows.forEach((q, i) => text(g, q, x + 17, y + 6 + lh * (i + 0.5), { font: `600 ${fs}px ${theme.font}`, color: theme.text, align: 'left' }));
    }

    function drawNotes(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#161e2a' : '#fffdf8';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      // Karopapier
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      g.strokeStyle = theme.dark ? 'rgba(120,150,200,0.08)' : 'rgba(70,110,190,0.1)';
      g.lineWidth = 1;
      const cell = small ? 14 : 16;
      g.beginPath();
      for (let x = r.x + cell; x < r.x + r.w; x += cell) {
        g.moveTo(Math.round(x) + 0.5, r.y);
        g.lineTo(Math.round(x) + 0.5, r.y + r.h);
      }
      for (let y = r.y + cell; y < r.y + r.h; y += cell) {
        g.moveTo(r.x, Math.round(y) + 0.5);
        g.lineTo(r.x + r.w, Math.round(y) + 0.5);
      }
      g.stroke();
      g.restore();
      g.strokeStyle = theme.dark ? '#2b3545' : '#e3dccb';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();

      const pad = small ? 10 : 14;
      text(g, ctx.t('title').toUpperCase(), r.x + pad, r.y + pad + 4, { font: `800 ${small ? 10.5 : 11.5}px ${theme.font}`, color: theme.muted, align: 'left' });
      const fs = small ? 15 : Math.min(19, r.w / 15);
      const lh = fs * 1.75;
      const top = r.y + pad + (small ? 22 : 30);
      const rows: { eq: Pans; op?: Op; bad?: boolean; rel?: string }[] = lines.map((ln) => ({ eq: ln.eq, op: ln.op }));
      if (pending()) rows.push({ eq: current, bad: true, rel: relation(current) });
      const solvedNow = !pending() && isSolved(current);
      const probeOn = opened && (fit() === 'ok' || fit() === 'all');
      const extra = (solvedNow ? 1 : 0) + (probeOn ? 1 : 0);
      const room = Math.max(1, Math.floor((r.y + r.h - pad - top) / lh) - extra);
      const shown = rows.slice(-room);
      const cut = rows.length - shown.length;
      // Ausrichtung am Gleichheitszeichen
      const opW = small ? 58 : 74;
      const eqX = r.x + (r.w - opW) * 0.52;
      shown.forEach((row, i) => {
        const y = top + i * lh + lh / 2;
        const last = i === shown.length - 1;
        const color = row.bad ? theme.series[1]! : theme.text;
        if (last && !row.bad) {
          g.fillStyle = withAlpha(theme.series[0]!, theme.dark ? 0.16 : 0.08);
          roundRect(g, r.x + 6, y - lh / 2 + 3, r.w - 12, lh - 6, 8);
          g.fill();
        }
        g.globalAlpha = cut > 0 && i === 0 ? 0.45 : 1;
        drawTokens(sideTokens(row.eq.left), eqX - fs * 0.55, y, fs, color, 'right');
        text(g, row.rel ?? '=', eqX, y, { font: `700 ${fs}px ${theme.font}`, color: row.bad ? color : theme.muted });
        drawTokens(sideTokens(row.eq.right), eqX + fs * 0.55, y, fs, color, 'left');
        // Umformung steht wie im Heft rechts neben der Gleichung, auf die sie angewendet wird
        const nextOp = shown[i + 1]?.op;
        if (nextOp) drawTokens(opTokens(nextOp), r.x + r.w - pad, y, fs * 0.82, theme.series[0]!, 'right');
        if (row.bad) {
          text(g, '✗', r.x + r.w - pad, y, { font: `800 ${fs}px ${theme.font}`, color, align: 'right' });
        }
        g.globalAlpha = 1;
      });
      if (solvedNow) {
        const s = solve(current);
        const y = top + shown.length * lh + lh / 2;
        if (s.kind === 'unique') {
          const label = `L = {${setText(s.x)}}`;
          g.font = `700 ${fs}px ${theme.font}`;
          const tw = g.measureText(label).width;
          g.strokeStyle = theme.series[2]!;
          g.lineWidth = 2;
          roundRect(g, eqX - tw / 2 - 10, y - fs * 0.75, tw + 20, fs * 1.5, 8);
          g.stroke();
          text(g, label, eqX, y, { font: `700 ${fs}px ${theme.font}`, color: theme.series[2]! });
        }
      }
      if (probeOn) {
        // Probe in der Ausgangsgleichung
        const x = w();
        const y = top + (shown.length + (solvedNow ? 1 : 0)) * lh + lh / 2;
        const l = ctx.fmt.num(weight(start.left, x), 2);
        const rr = ctx.fmt.num(weight(start.right, x), 2);
        const ok = Math.abs(weight(start.left, x) - weight(start.right, x)) < 1e-9;
        text(g, `${lang === 'de' ? 'Probe' : 'Check'}: ${l} = ${rr} ${ok ? '✓' : '✗'}`, eqX, y, { font: `700 ${fs * 0.9}px ${theme.font}`, color: ok ? theme.series[2]! : theme.series[1]! });
      }
    }

    /* ---------- Bewegung des Balkens ---------- */
    function physics(dt: number): boolean {
      const target = targetTilt();
      if (reduced) {
        theta = target;
        omega = 0;
        return false;
      }
      stepper.run(dt, (h) => {
        const acc = -26 * (theta - target) - 4.2 * omega;
        omega += acc * h;
        theta += omega * h;
      });
      if (Math.abs(theta - target) < 0.01 && Math.abs(omega) < 0.02) {
        theta = target;
        omega = 0;
        return false;
      }
      return true;
    }

    resetAll(performance.now());
    theta = targetTilt();

    return {
      update(changed, source) {
        if (['a', 'b', 'c', 'd'].some((k) => changed.has(k))) {
          resetAll(performance.now());
          if (source === 'init') theta = targetTilt();
        }
        refresh();
      },

      action(id) {
        if (id === 'subx') bothSides('x');
        else if (id === 'sub1') bothSides('1');
        else if (id === 'div') divideBoth();
        else if (id === 'undo') undo();
        else if (id === 'open') setOpened(!opened);
        else if (id === 'new' && !ctx.locked) ctx.set(randomEquation(Math.random));
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        const moving = physics(dt);
        if (divAnim && now - divAnim.start >= 1300) {
          // Nach dem Gruppieren: übrige Gruppen wegnehmen
          for (const it of items) {
            if (!it.leaving && (it.group ?? 0) > 0) leave(it, now, (it.id % 5) * 50);
            it.group = undefined;
          }
          divAnim = null;
          syncActions();
        } else if (divAnim && reduced) {
          for (const it of items) if (!it.leaving && (it.group ?? 0) > 0) leave(it, now, 0);
          divAnim = null;
          syncActions();
        }
        const reg = regions();
        surface.begin();
        drawScene(reg.scene, now, dt);
        drawNotes(reg.notes);
        const settling = items.some((it) => it.leaving || now < it.born + 900);
        const revealing = opened && now - openAt < 1200;
        if (moving || settling || divAnim || revealing) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
