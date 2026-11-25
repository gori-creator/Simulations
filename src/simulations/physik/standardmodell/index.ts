import { defineSimulation, Surface, subText, TapTarget, text, withAlpha, type Rect } from '../../../sim-core';
import { combine, momentumMeV, PARTICLES, pairKinetic, particle, quarkCharge3, radiusCm, type Particle, type QuarkId } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Magnetfeld der Blasenkammer in Tesla. */
const B_FIELD = 0.2;
/** Energieverlust in der Kammer in MeV pro cm (gasgefüllte Kammer, damit Spiralen sichtbar werden). */
const LOSS = 0.06;

const QUARK_OPTS = [
  { value: '0', label: L('leer', 'empty') },
  { value: 'u', label: L('u', 'u') },
  { value: 'd', label: L('d', 'd') },
  { value: 's', label: L('s', 's') },
  { value: 'ub', label: L('ū (Anti-u)', 'ū (anti-u)') },
  { value: 'db', label: L('d̄ (Anti-d)', 'd̄ (anti-d)') },
  { value: 'sb', label: L('s̄ (Anti-s)', 's̄ (anti-s)') },
] as const;

const QSYM: Record<QuarkId, string> = { u: 'u', d: 'd', s: 's', ub: 'ū', db: 'd̄', sb: 's̄' };

/** Ladung als Bruch: „+2/3“, „−1“, „0“. */
function fracText(num: number, den: number): string {
  if (num === 0) return '0';
  const sign = num > 0 ? '+' : '−';
  const a = Math.abs(num);
  if (a % den === 0) return `${sign}${a / den}`;
  return `${sign}${a}/${den}`;
}

/** Positionen der Teilchen in der Übersicht: [Spalte, Zeile]. */
const GRID: Record<string, [number, number]> = {
  u: [0, 0], c: [1, 0], t: [2, 0],
  d: [0, 1], s: [1, 1], b: [2, 1],
  e: [0, 2], mu: [1, 2], tau: [2, 2],
  ve: [0, 3], vmu: [1, 3], vtau: [2, 3],
  g: [3, 0], gamma: [3, 1], Z: [3, 2], W: [3, 3],
  H: [4, 0],
};

/**
 * Standardmodell: Übersicht der Elementarteilchen, Hadronen aus Quarks und
 * Paarbildung eines Photons in einer Blasenkammer.
 */
export default defineSimulation({
  id: 'standardmodell',
  layout: { aspect: 1.7, aspectNarrow: 1.1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'tabelle', label: L('Elementarteilchen', 'Elementary particles') },
        { value: 'baukasten', label: L('Quark-Baukasten', 'Quark builder') },
        { value: 'paar', label: L('Paarbildung', 'Pair production') },
      ],
      default: 'tabelle',
      display: 'buttons',
    },
    {
      key: 'teil',
      type: 'choice',
      label: L('Teilchen', 'Particle'),
      options: PARTICLES.map((q) => ({ value: q.id, label: q.name })),
      default: 'e',
      display: 'menu',
      visibleIf: (v) => v.mode === 'tabelle',
    },
    { key: 'q1', type: 'choice', label: L('Baustein 1', 'Building block 1'), options: [...QUARK_OPTS], default: 'u', display: 'menu', visibleIf: (v) => v.mode === 'baukasten' },
    { key: 'q2', type: 'choice', label: L('Baustein 2', 'Building block 2'), options: [...QUARK_OPTS], default: 'u', display: 'menu', visibleIf: (v) => v.mode === 'baukasten' },
    { key: 'q3', type: 'choice', label: L('Baustein 3', 'Building block 3'), options: [...QUARK_OPTS], default: 'd', display: 'menu', visibleIf: (v) => v.mode === 'baukasten' },
    { key: 'E', type: 'number', label: L('Energie des Photons', 'Photon energy'), min: 0.5, max: 10, step: 0.1, default: 4, unit: 'MeV', visibleIf: (v) => v.mode === 'paar' },
  ],
  hint: (v) =>
    v.mode === 'baukasten'
      ? L('Setze drei Quarks oder ein Quark und ein Antiquark zusammen. Nur ganzzahlige Ladungen kommen in der Natur vor.', 'Combine three quarks, or one quark and one antiquark. Only whole-number charges occur in nature.')
      : v.mode === 'paar'
        ? L('Ein energiereiches Photon verwandelt sich in Elektron und Positron. Im Magnetfeld laufen beide in entgegengesetzte Spiralen.', 'A high-energy photon turns into an electron and a positron. In the magnetic field both move in opposite spirals.')
        : L('Tippe auf ein Teilchen, um seine Eigenschaften zu sehen.', 'Tap a particle to see its properties.'),
  readouts: [
    { key: 'name', label: L('Teilchen', 'Particle') },
    { key: 'mass', label: L('Masse', 'Mass') },
    { key: 'q', label: L('Ladung', 'Charge') },
    { key: 'f', label: L('Wechselwirkungen', 'Interactions') },
    { key: 'had', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'Q', label: L('Ladung', 'Charge') },
    { key: 'Bz', label: L('Baryonenzahl', 'Baryon number') },
    { key: 'Ek', label: L('Bewegungsenergie', 'Kinetic energy'), spoiler: true },
    { key: 'r', label: L('Bahnradius am Anfang', 'Initial radius'), spoiler: true },
  ],
  presets: [
    { id: 'proton', label: L('Proton', 'Proton'), values: { mode: 'baukasten', q1: 'u', q2: 'u', q3: 'd' } },
    { id: 'pion', label: L('Pion π⁺', 'Pion π⁺'), values: { mode: 'baukasten', q1: 'u', q2: 'db', q3: '0' } },
    { id: 'omega', label: L('Omega Ω⁻', 'Omega Ω⁻'), values: { mode: 'baukasten', q1: 's', q2: 's', q3: 's' } },
    { id: 'top', label: L('Top-Quark', 'Top quark'), values: { mode: 'tabelle', teil: 't' } },
    { id: 'paar', label: L('Paarbildung, 4 MeV', 'Pair production, 4 MeV'), values: { mode: 'paar', E: 4 } },
  ],
  strings: {
    de: {
      canvasT: 'Tabelle der Elementarteilchen: Quarks und Leptonen in drei Generationen, daneben die Austauschteilchen und das Higgs-Boson',
      canvasB: 'Drei Plätze für Quarks oder Antiquarks; darunter das entstehende Teilchen mit seiner Ladung',
      canvasP: 'Ein Photon fliegt von links in eine Blasenkammer und erzeugt ein Elektron und ein Positron, die im Magnetfeld in entgegengesetzte Spiralen laufen',
      quarks: 'Quarks',
      leptons: 'Leptonen',
      bosons: 'Austauschteilchen',
      gen: 'Generation',
      massless: 'masselos',
      nu: 'unter 1 eV',
      fs: 'stark',
      fe: 'elektromagnetisch',
      fw: 'schwach',
      fh: 'gibt anderen Teilchen Masse',
      baryon: 'Baryon',
      antibaryon: 'Antibaryon',
      meson: 'Meson',
      unknown: 'kein bekanntes leichtes Teilchen dieser Art',
      invalid: 'nicht möglich: Ladung oder Farbe passt nicht',
      single: 'einzelne Quarks gibt es nicht frei (Confinement)',
      none: 'wähle Bausteine',
      sum: 'Ladung: {s} = {q}',
      proton: 'Proton',
      neutron: 'Neutron',
      too: 'Zu wenig Energie für ein Paar:',
      too2: 'nötig sind 2·m_e·c² = 1,022 MeV',
      field: 'B = 0,2 T aus der Ebene',
      EkVal: 'je {E} MeV für Elektron und Positron',
      EkNone: 'keine Paarbildung',
      rVal: '{r} cm',
      chamber: 'Blasenkammer',
    },
    en: {
      canvasT: 'Table of elementary particles: quarks and leptons in three generations, next to them the force carriers and the Higgs boson',
      canvasB: 'Three slots for quarks or antiquarks; below them the resulting particle with its charge',
      canvasP: 'A photon flies from the left into a bubble chamber and produces an electron and a positron, which move in opposite spirals in the magnetic field',
      quarks: 'quarks',
      leptons: 'leptons',
      bosons: 'force carriers',
      gen: 'generation',
      massless: 'massless',
      nu: 'below 1 eV',
      fs: 'strong',
      fe: 'electromagnetic',
      fw: 'weak',
      fh: 'gives other particles mass',
      baryon: 'baryon',
      antibaryon: 'antibaryon',
      meson: 'meson',
      unknown: 'no known light particle of this kind',
      invalid: 'not possible: charge or colour does not fit',
      single: 'single quarks do not exist freely (confinement)',
      none: 'choose building blocks',
      sum: 'charge: {s} = {q}',
      proton: 'proton',
      neutron: 'neutron',
      too: 'Not enough energy for a pair:',
      too2: '2·m_e·c² = 1.022 MeV are needed',
      field: 'B = 0.2 T out of the plane',
      EkVal: '{E} MeV each for electron and positron',
      EkNone: 'no pair production',
      rVal: '{r} cm',
      chamber: 'bubble chamber',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasT'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const lang = ctx.lang === 'de' ? 'de' : 'en';
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let cells: { id: string; r: Rect }[] = [];

    const massText = (m: number): string => {
      if (m === 0) return ctx.t('massless');
      if (m < 1e-3) return ctx.t('nu');
      if (m < 1000) return `${fmt.num(m, m < 10 ? 2 : 1)} MeV/c²`;
      return `${fmt.num(m / 1000, m < 10000 ? 2 : 1)} GeV/c²`;
    };
    const forcesText = (f: string): string => (f === '' ? ctx.t('fh') : [...f].map((c) => ctx.t(`f${c}`)).join(', '));
    const quarks = (): QuarkId[] => [p.q1, p.q2, p.q3].filter((q) => q !== '0') as QuarkId[];

    function updateReadouts(): void {
      const show: Record<string, string | { html: string } | null> = {};
      if (p.mode === 'tabelle') {
        const q = particle(p.teil);
        show.name = `${q.name[lang]} (${q.symbol.replace('_', '')})`;
        show.mass = massText(q.mass);
        show.q = q.id === 'W' ? '±1' : fracText(q.charge[0], q.charge[1]);
        show.f = forcesText(q.forces);
      } else if (p.mode === 'baukasten') {
        const qs = quarks();
        const h = combine(qs);
        show.had = hadronText(h.kind, h.name);
        if (qs.length) {
          show.Q = tr('sum', { s: qs.map((q) => fracText(quarkCharge3(q), 3)).join(' '), q: fracText(h.charge3, 3) });
          show.Bz = fracText(h.baryon3, 3);
        }
      } else {
        const Ek = pairKinetic(p.E);
        show.Ek = Ek > 0 ? tr('EkVal', { E: fmt.num(Ek, 2) }) : ctx.t('EkNone');
        if (Ek > 0) show.r = tr('rVal', { r: fmt.num(radiusCm(momentumMeV(Ek), B_FIELD), 1) });
      }
      for (const k of ['name', 'mass', 'q', 'f', 'had', 'Q', 'Bz', 'Ek', 'r']) ctx.readout(k, show[k] ?? null);
    }

    function hadronText(kind: string, name: string | null): string {
      if (kind === 'none') return ctx.t('none');
      if (kind === 'single') return ctx.t('single');
      if (kind === 'invalid') return ctx.t('invalid');
      if (!name) return ctx.t('unknown');
      const pretty = name === 'p' ? `${ctx.t('proton')} p` : name === 'n' ? `${ctx.t('neutron')} n` : name.startsWith('anti-') ? `Anti-${name.slice(5)}` : name;
      return `${pretty} (${ctx.t(kind)})`;
    }

    /* ---------------- Tabelle ---------------- */
    function drawTable(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cols = 5;
      const rows = 4;
      const gap = 6;
      const top = r.y + 30;
      const cw = Math.min((r.w - 24 - gap * (cols - 1)) / cols, 110);
      const ch = Math.min((r.h - 50 - gap * (rows - 1)) / rows, cw * 0.95);
      const x0 = r.x + (r.w - (cw * cols + gap * (cols - 1))) / 2;
      const color = (q: Particle) => (q.kind === 'quark' ? th.series[0]! : q.kind === 'lepton' ? th.series[2]! : q.id === 'H' ? th.series[1]! : th.series[3]!);
      cells = [];
      const big = Math.max(14, Math.min(30, cw * 0.32));
      const small = Math.max(9, Math.min(12, cw * 0.11));
      for (const q of PARTICLES) {
        const [c, rr] = GRID[q.id]!;
        const x = x0 + c * (cw + gap) + (c >= 3 ? 6 : 0);
        const y = top + rr * (ch + gap);
        const sel = q.id === p.teil;
        g.fillStyle = withAlpha(color(q), sel ? 0.4 : 0.16);
        g.strokeStyle = sel ? th.text : withAlpha(color(q), 0.8);
        g.lineWidth = sel ? 2.5 : 1.2;
        g.beginPath();
        g.roundRect(x, y, cw, ch, 8);
        g.fill();
        g.stroke();
        subText(g, q.symbol, x + cw / 2, y + ch * 0.48, { size: big, family: th.mathFont, weight: 700, color: th.text });
        if (cw > 56) {
          text(g, q.id === 'W' ? '±1' : fracText(q.charge[0], q.charge[1]), x + 5, y + 10, { font: `600 ${small}px ${th.font}`, color: th.muted, align: 'left' });
          text(g, massText(q.mass).replace('/c²', ''), x + cw / 2, y + ch - 9, { font: `500 ${small}px ${th.font}`, color: th.muted });
        }
        cells.push({ id: q.id, r: { x, y, w: cw, h: ch } });
      }
      const lab = (s: string, x: number, y: number, align: CanvasTextAlign = 'center') => text(g, s, x, y, { font: `600 12px ${th.font}`, color: th.muted, align });
      lab(`I`, x0 + cw / 2, top - 12);
      lab(`II`, x0 + cw * 1.5 + gap, top - 12);
      lab(`III`, x0 + cw * 2.5 + gap * 2, top - 12);
      if (r.w > 520) lab(ctx.t('bosons'), x0 + cw * 3.5 + gap * 3 + 6, top - 12);
      const yQ = top + ch + gap / 2;
      const yL = top + 3 * ch + 2.5 * gap;
      if (x0 > 40) {
        g.save();
        g.translate(x0 - 12, yQ);
        g.rotate(-Math.PI / 2);
        text(g, ctx.t('quarks'), 0, 0, { font: `600 12px ${th.font}`, color: th.series[0]! });
        g.restore();
        g.save();
        g.translate(x0 - 12, yL);
        g.rotate(-Math.PI / 2);
        text(g, ctx.t('leptons'), 0, 0, { font: `600 12px ${th.font}`, color: th.series[2]! });
        g.restore();
      }
    }

    /* ---------------- Baukasten ---------------- */
    function drawBuilder(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const slots = [p.q1, p.q2, p.q3];
      const qs = quarks();
      const h = combine(qs);
      const R = Math.min(r.w / 9, r.h / 6, 56);
      const cy = r.y + r.h * 0.36;
      const colors = [th.series[3]!, th.series[2]!, th.series[0]!];
      slots.forEach((q, i) => {
        const cx = r.x + r.w / 2 + (i - 1) * R * 2.6;
        g.lineWidth = 2;
        if (q === '0') {
          g.setLineDash([5, 4]);
          g.strokeStyle = th.muted;
          g.beginPath();
          g.arc(cx, cy, R, 0, Math.PI * 2);
          g.stroke();
          g.setLineDash([]);
          return;
        }
        const anti = q.length === 2;
        // Farbladung: Baryon rot/grün/blau, Meson Farbe und passende Antifarbe
        const col = h.kind === 'meson' ? colors[0]! : colors[i % 3]!;
        g.fillStyle = withAlpha(col, anti ? 0.12 : 0.35);
        g.strokeStyle = col;
        g.lineWidth = anti ? 4 : 2;
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        subText(g, QSYM[q as QuarkId], cx, cy - 4, { size: R * 0.75, family: th.mathFont, weight: 700, color: th.text });
        text(g, fracText(quarkCharge3(q as QuarkId), 3), cx, cy + R * 0.55, { font: `600 ${Math.max(11, R * 0.24)}px ${th.font}`, color: th.muted });
      });
      // Ergebnis
      const ok = h.kind === 'baryon' || h.kind === 'antibaryon' || h.kind === 'meson';
      const res = hadronText(h.kind, h.name);
      subText(g, res, r.x + r.w / 2, cy + R * 1.9, { size: Math.max(14, Math.min(22, r.w / 26)), family: th.font, weight: 700, color: ok && h.name ? th.text : th.series[3]!, halo: th.bg });
      if (qs.length) {
        const sum = tr('sum', { s: qs.map((q) => fracText(quarkCharge3(q), 3)).join(' '), q: fracText(h.charge3, 3) });
        subText(g, sum, r.x + r.w / 2, cy + R * 1.9 + 30, { size: 14, family: th.font, weight: 600, color: th.muted, halo: th.bg });
      }
    }

    /* ---------------- Paarbildung ---------------- */
    function drawPair(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = Math.min(r.w / 30, r.h / 18); // px je cm
      const vx = r.x + r.w * 0.3;
      const vy = r.y + r.h * 0.5;
      g.fillStyle = withAlpha(th.series[0]!, 0.05);
      g.fillRect(r.x + 8, r.y + 8, r.w - 16, r.h - 16);
      text(g, ctx.t('chamber'), r.x + 16, r.y + 22, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      subText(g, ctx.t('field'), r.x + r.w - 16, r.y + 22, { size: 12, family: th.font, weight: 600, color: th.muted, align: 'right', halo: th.bg });
      // Photon (wellig, gestrichelt: hinterlässt keine Spur)
      const Ek = pairKinetic(p.E);
      const end = Ek > 0 ? vx : r.x + r.w - 16;
      g.strokeStyle = th.series[1]!;
      g.lineWidth = 2;
      g.setLineDash([6, 4]);
      g.beginPath();
      for (let x = r.x + 16; x <= end; x += 2) {
        const y = vy + 5 * Math.sin((x - r.x) / 6);
        if (x === r.x + 16) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      g.setLineDash([]);
      subText(g, `γ (${fmt.num(p.E, 1)} MeV)`, r.x + 18, vy - 16, { size: 13, family: th.mathFont, weight: 700, color: th.series[1]!, align: 'left', halo: th.bg });
      if (Ek <= 0) {
        subText(g, ctx.t('too'), r.x + r.w / 2, vy + 40, { size: 13, family: th.font, weight: 600, color: th.series[3]!, halo: th.bg });
        subText(g, ctx.t('too2'), r.x + r.w / 2, vy + 60, { size: 13, family: th.font, weight: 600, color: th.series[3]!, halo: th.bg });
        return;
      }
      // Spuren: Spirale mit Energieverlust
      const track = (sign: 1 | -1, color: string, label: string) => {
        let x = 0;
        let y = 0;
        let ang = 0;
        let E = Ek;
        const ds = 0.02;
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(vx, vy);
        let n = 0;
        while (E > 0.02 && n < 20000) {
          const rad = radiusCm(momentumMeV(E), B_FIELD);
          ang += (sign * ds) / rad;
          x += ds * Math.cos(ang);
          y += ds * Math.sin(ang);
          E -= LOSS * ds;
          g.lineTo(vx + x * s, vy + y * s);
          n++;
        }
        g.stroke();
        // Beschriftung neben dem ersten Bogen
        const r0 = radiusCm(momentumMeV(Ek), B_FIELD) * s;
        subText(g, label, vx + r0 * 0.3 - 14, vy + sign * Math.min(r0 * 0.8, r.h * 0.4), { size: 14, family: th.mathFont, weight: 700, color, align: 'right', halo: th.bg });
      };
      // Positron (positiv) wird bei B aus der Ebene nach unten (Bildschirm) abgelenkt
      g.save();
      g.beginPath();
      g.rect(r.x + 8, r.y + 8, r.w - 16, r.h - 16);
      g.clip();
      track(1, th.series[3]!, 'e⁺');
      track(-1, th.series[0]!, 'e⁻');
      g.restore();
      g.fillStyle = th.text;
      g.beginPath();
      g.arc(vx, vy, 3.5, 0, Math.PI * 2);
      g.fill();
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'tabelle' || ctx.locked) return null;
        const c = cells.find((q) => px >= q.r.x && px <= q.r.x + q.r.w && py >= q.r.y && py <= q.r.y + q.r.h);
        return c ? c.id : null;
      },
      onTap: (id) => ctx.set({ teil: id }),
    });

    return {
      update() {
        const lab = p.mode === 'baukasten' ? 'canvasB' : p.mode === 'paar' ? 'canvasP' : 'canvasT';
        surface.canvas.setAttribute('aria-label', ctx.t(lab));
        updateReadouts();
      },
      render() {
        surface.begin();
        const r = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'baukasten') drawBuilder(r);
        else if (p.mode === 'paar') drawPair(r);
        else drawTable(r);
      },
      destroy: () => surface.destroy(),
    };
  },
});
