import { defineSimulation, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { cyclotron, deflection, E, floatVoltage, hallVoltage, MP, speedAfter } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Plattenkondensator der Ablenkung: Länge 5 cm, Abstand 2 cm; Schirm 15 cm hinter dem Ende. */
const PL = 0.05;
const PD = 0.02;
const SCREEN = 0.15;
/** Millikan: Tröpfchenradius 1 µm, Öl 875 kg/m³, Plattenabstand 5 mm. */
const DROP_R = 0.8e-6;
const RHO = 875;
const MD = 0.005;

/**
 * Geladene Teilchen in elektrischen und magnetischen Feldern: Elektronenkanone,
 * Ablenkung im Querfeld, Millikan-Versuch, Zyklotron und Hall-Effekt.
 */
export default defineSimulation({
  id: 'teilchen-felder',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'laengs', label: L('Beschleunigung im Längsfeld', 'Acceleration in a longitudinal field') },
        { value: 'quer', label: L('Ablenkung im Querfeld', 'Deflection in a transverse field') },
        { value: 'millikan', label: L('Millikan-Versuch', 'Millikan experiment') },
        { value: 'zyklotron', label: L('Zyklotron', 'Cyclotron') },
        { value: 'hall', label: L('Hall-Effekt', 'Hall effect') },
      ],
      default: 'quer',
    },
    { key: 'Ua', type: 'number', label: L('Beschleunigungsspannung U_B', 'Accelerating voltage U_B'), min: 100, max: 5000, step: 50, default: 1000, unit: 'V', visibleIf: (v) => v.mode === 'laengs' || v.mode === 'quer' },
    { key: 'Ud', type: 'number', label: L('Ablenkspannung U_y', 'Deflecting voltage U_y'), min: -300, max: 300, step: 10, default: 100, unit: 'V', visibleIf: (v) => v.mode === 'quer' },
    { key: 'n', type: 'number', label: L('Ladung des Tröpfchens (Vielfache von e)', 'Charge of the droplet (multiples of e)'), min: 1, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'millikan', spoiler: true },
    { key: 'Um', type: 'number', label: L('Spannung am Kondensator', 'Voltage across the plates'), min: 0, max: 600, step: 1, default: 200, unit: 'V', visibleIf: (v) => v.mode === 'millikan' },
    { key: 'B', type: 'number', label: L('Magnetische Flussdichte B', 'Magnetic flux density B'), min: 0.1, max: 2, step: 0.1, default: 1, unit: 'T', visibleIf: (v) => v.mode === 'zyklotron' || v.mode === 'hall' },
    { key: 'Uz', type: 'number', label: L('Spannung zwischen den Duanten', 'Voltage between the dees'), min: 5, max: 50, step: 1, default: 20, unit: 'kV', visibleIf: (v) => v.mode === 'zyklotron' },
    { key: 'I', type: 'number', label: L('Stromstärke im Plättchen', 'Current in the plate'), min: 0.1, max: 5, step: 0.1, default: 1, unit: 'A', visibleIf: (v) => v.mode === 'hall' },
    {
      key: 'stoff',
      type: 'choice',
      label: L('Plättchen aus', 'Plate made of'),
      options: [
        { value: 'cu', label: L('Kupfer', 'copper') },
        { value: 'hl', label: L('Halbleiter (dotiert)', 'semiconductor (doped)') },
      ],
      default: 'hl',
      visibleIf: (v) => v.mode === 'hall',
    },
  ],
  hint: (v) =>
    v.mode === 'millikan'
      ? L('Stell die Spannung so ein, dass das Tröpfchen schwebt. Dann ist die elektrische Kraft so groß wie die Gewichtskraft.', 'Set the voltage so that the droplet hovers. Then the electric force equals the weight.')
      : v.mode === 'zyklotron'
        ? L('Bei jedem Spaltdurchgang wird das Proton schneller, die Bahn größer – die Umlaufzeit bleibt gleich.', 'At every gap crossing the proton gets faster and the orbit larger – the period stays the same.')
        : v.mode === 'hall'
          ? L('Das Magnetfeld drückt die Ladungsträger zur Seite. Dort sammeln sie sich und erzeugen die Hall-Spannung.', 'The magnetic field pushes the charge carriers sideways, where they pile up and create the Hall voltage.')
          : L('Elektronen werden von der Glühkathode zur Anode beschleunigt.', 'Electrons are accelerated from the hot cathode to the anode.'),
  readouts: [
    { key: 'v', label: L('Geschwindigkeit', 'Velocity'), spoiler: true },
    { key: 'y', label: L('Ablenkung', 'Deflection'), spoiler: true },
    { key: 'mil', label: L('Tröpfchen', 'Droplet'), spoiler: true },
    { key: 'cyc', label: L('Zyklotron', 'Cyclotron'), spoiler: true },
    { key: 'hall', label: L('Hall-Spannung', 'Hall voltage'), spoiler: true },
  ],
  presets: [
    { id: 'gun', label: L('Elektronenkanone', 'Electron gun'), values: { mode: 'laengs', Ua: 1000 } },
    { id: 'braun', label: L('Ablenkung', 'Deflection'), values: { mode: 'quer', Ua: 1000, Ud: 100 } },
    { id: 'mil', label: L('Millikan', 'Millikan'), values: { mode: 'millikan', n: 3 } },
    { id: 'cyc', label: L('Zyklotron', 'Cyclotron'), values: { mode: 'zyklotron', B: 1, Uz: 20 } },
    { id: 'hall', label: L('Hall-Sonde', 'Hall probe'), values: { mode: 'hall', stoff: 'hl', B: 0.5, I: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Geladene Teilchen in Feldern: Elektronenkanone, Elektronenstrahl zwischen Ablenkplatten, Öltröpfchen im Kondensator, Spiralbahn im Zyklotron oder Hall-Plättchen im Magnetfeld',
      vVal: 'v = √(2 e U_B / m) ≈ {v} m/s ({c} % der Lichtgeschwindigkeit)',
      yVal: 'im Kondensator y = U_y · l² / (4 d U_B) ≈ {y} mm, auf dem Schirm ≈ {Y} mm',
      milFloat: 'Es schwebt: q · U / d = m · g. Daraus q = {q} · 10⁻¹⁹ C = {n} · e.',
      milUp: 'Es steigt (elektrische Kraft größer als die Gewichtskraft).',
      milDown: 'Es sinkt (Gewichtskraft größer als die elektrische Kraft).',
      cycVal: 'f = e B / (2π m) ≈ {f} MHz; pro Umlauf +{dE} keV; nach {n} Umläufen r ≈ {r} cm',
      hallVal: 'U_H = B · I / (n · e · d) ≈ {u} (d = {d} mm)',
      cathode: 'Kathode',
      anode: 'Anode',
      screen: 'Schirm',
      ray: 'Elektronenstrahl',
      dee: 'Duant',
      gap: 'Spalt',
      plate: 'Plättchen',
      Bin: 'B zeigt in die Bildebene hinein',
    },
    en: {
      canvas: 'Charged particles in fields: electron gun, electron beam between deflecting plates, oil droplet in a capacitor, spiral path in a cyclotron or Hall plate in a magnetic field',
      vVal: 'v = √(2 e U_B / m) ≈ {v} m/s ({c} % of the speed of light)',
      yVal: 'inside the plates y = U_y · l² / (4 d U_B) ≈ {y} mm, on the screen ≈ {Y} mm',
      milFloat: 'It hovers: q · U / d = m · g, so q = {q} · 10⁻¹⁹ C = {n} · e.',
      milUp: 'It rises (electric force larger than the weight).',
      milDown: 'It sinks (weight larger than the electric force).',
      cycVal: 'f = e B / (2π m) ≈ {f} MHz; +{dE} keV per turn; after {n} turns r ≈ {r} cm',
      hallVal: 'U_H = B · I / (n · e · d) ≈ {u} (d = {d} mm)',
      cathode: 'cathode',
      anode: 'anode',
      screen: 'screen',
      ray: 'electron beam',
      dee: 'dee',
      gap: 'gap',
      plate: 'plate',
      Bin: 'B points into the page',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let anim = 0;
    let dropY = 0.5;

    const hallN = () => (p.stoff === 'cu' ? 8.5e28 : 1e22);
    const hallD = () => (p.stoff === 'cu' ? 1e-4 : 1e-3);
    const floatU = () => floatVoltage(DROP_R, RHO, p.n, MD);

    function volt(u: number): string {
      const a = Math.abs(u);
      if (a >= 1) return `${fmt.num(u, 2)} V`;
      if (a >= 1e-3) return `${fmt.num(u * 1e3, 2)} mV`;
      return `${fmt.num(u * 1e6, 2)} µV`;
    }

    function updateReadouts(): void {
      for (const k of ['v', 'y', 'mil', 'cyc', 'hall']) ctx.readout(k, null);
      if (p.mode === 'laengs' || p.mode === 'quer') {
        const v = speedAfter(p.Ua);
        ctx.readout('v', tr('vVal', { v: `${fmt.num(v / 1e7, 2)} · 10⁷`, c: fmt.num((100 * v) / 3e8, 1) }));
        if (p.mode === 'quer') {
          const d = deflection(p.Ud, PD, PL, v);
          const Y = d.yEnd + Math.tan(d.angle) * SCREEN;
          ctx.readout('y', tr('yVal', { y: fmt.num(d.yEnd * 1000, 2), Y: fmt.num(Y * 1000, 1) }));
        }
      } else if (p.mode === 'millikan') {
        const Uf = floatU();
        if (Math.abs(p.Um - Uf) < 2) ctx.readout('mil', tr('milFloat', { q: fmt.num((p.n * E) / 1e-19, 2), n: p.n }));
        else ctx.readout('mil', ctx.t(p.Um > Uf ? 'milUp' : 'milDown'));
      } else if (p.mode === 'zyklotron') {
        const turns = 10;
        const Ek = 2 * turns * p.Uz * 1e3 * E;
        const v = Math.sqrt((2 * Ek) / MP);
        const c = cyclotron(p.B, v);
        ctx.readout('cyc', tr('cycVal', { f: fmt.num(c.f / 1e6, 2), dE: fmt.num(2 * p.Uz, 0), n: turns, r: fmt.num(c.r * 100, 1) }));
      } else {
        ctx.readout('hall', tr('hallVal', { u: volt(hallVoltage(p.B, p.I, hallN(), hallD())), d: fmt.num(hallD() * 1000, 1) }));
      }
    }

    function dots(g: CanvasRenderingContext2D, pts: [number, number][], color: string, speed: number): void {
      // Punkte entlang eines Polygonzugs
      const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i]![0], q[1] - pts[i]![1]));
      const total = lens.reduce((s, v) => s + v, 0);
      g.fillStyle = color;
      const n = Math.max(6, Math.floor(total / 28));
      for (let k = 0; k < n; k++) {
        let d = ((k / n) * total + anim * speed) % total;
        let i = 0;
        while (i < lens.length - 1 && d > lens[i]!) {
          d -= lens[i]!;
          i++;
        }
        const f = d / (lens[i] || 1);
        const a = pts[i]!;
        const b = pts[i + 1]!;
        g.beginPath();
        g.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawGun(r: Rect, withPlates: boolean): void {
      const g = surface.g;
      const th = ctx.theme;
      const cy = r.y + r.h / 2;
      const x0 = r.x + 30;
      const xa = r.x + r.w * (withPlates ? 0.22 : 0.45);
      // Kathode und Anode
      g.fillStyle = th.series[1]!;
      g.fillRect(x0, cy - 22, 8, 44);
      g.fillStyle = th.muted;
      g.fillRect(xa, cy - 30, 6, 24);
      g.fillRect(xa, cy + 6, 6, 24);
      text(g, ctx.t('cathode'), x0 + 4, cy + 38, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, ctx.t('anode'), xa + 3, cy + 44, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, `U_B = ${fmt.num(p.Ua, 0)} V`, (x0 + xa) / 2, cy - 40, { font: `700 12px ${th.font}`, color: th.text });
      const speed = 40 + speedAfter(p.Ua) / 2e5;
      if (!withPlates) {
        const xe = r.x + r.w - 20;
        // Feldlinien zwischen Kathode und Anode
        g.strokeStyle = withAlpha(th.series[3]!, 0.4);
        g.lineWidth = 1;
        for (const dy of [-14, 0, 14]) {
          g.beginPath();
          g.moveTo(xa, cy + dy);
          g.lineTo(x0 + 8, cy + dy);
          g.stroke();
        }
        dots(g, [
          [x0 + 10, cy],
          [xe, cy],
        ], th.series[0]!, speed);
        text(g, ctx.t('ray'), (xa + xe) / 2, cy - 16, { font: `600 12px ${th.font}`, color: th.muted });
        return;
      }
      // Ablenkplatten und Schirm, Weltmaßstab
      const xp0 = xa + 30;
      const sc = (r.w - (xp0 - r.x) - 40) / (PL + SCREEN);
      const xp1 = xp0 + PL * sc;
      const xs = xp0 + (PL + SCREEN) * sc;
      const gap = Math.min(r.h * 0.3, PD * sc);
      g.fillStyle = p.Ud >= 0 ? th.series[1]! : th.series[0]!;
      g.fillRect(xp0, cy - gap / 2 - 6, xp1 - xp0, 6);
      g.fillStyle = p.Ud >= 0 ? th.series[0]! : th.series[1]!;
      g.fillRect(xp0, cy + gap / 2, xp1 - xp0, 6);
      text(g, p.Ud >= 0 ? '+' : '−', xp0 - 10, cy - gap / 2 - 3, { font: `800 14px ${th.font}`, color: th.text });
      text(g, p.Ud >= 0 ? '−' : '+', xp0 - 10, cy + gap / 2 + 3, { font: `800 14px ${th.font}`, color: th.text });
      g.fillStyle = th.muted;
      g.fillRect(xs, r.y + 20, 6, r.h - 40);
      text(g, ctx.t('screen'), xs + 3, r.y + 12, { font: `600 11px ${th.font}`, color: th.muted });
      // Bahn: Parabel im Kondensator (nach oben zur Plus-Platte), danach Gerade; Maßstab quer überhöht
      const v = speedAfter(p.Ua);
      const d = deflection(p.Ud, PD, PL, v);
      const yScale = gap / PD;
      const pts: [number, number][] = [[x0 + 10, cy], [xp0, cy]];
      let hit = false;
      for (let k = 1; k <= 30; k++) {
        const x = (PL * k) / 30;
        const y = d.k * x * x;
        if (Math.abs(y) > PD / 2) {
          hit = true;
          pts.push([xp0 + x * sc, cy - Math.sign(y) * (gap / 2)]);
          break;
        }
        pts.push([xp0 + x * sc, cy - y * yScale]);
      }
      if (!hit) {
        const Y = d.yEnd + Math.tan(d.angle) * SCREEN;
        const yPix = Math.max(r.y + 20, Math.min(r.y + r.h - 20, cy - Y * yScale));
        pts.push([xs, yPix]);
        g.fillStyle = th.series[2]!;
        g.beginPath();
        g.arc(xs + 3, yPix, 6, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = withAlpha(th.series[0]!, 0.4);
      g.lineWidth = 2;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      dots(g, pts, th.series[0]!, speed);
    }

    function drawMillikan(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const top = r.y + 40;
      const bot = r.y + r.h - 40;
      const w = Math.min(r.w * 0.7, 360);
      g.fillStyle = th.series[1]!;
      g.fillRect(cx - w / 2, top - 8, w, 8);
      g.fillStyle = th.series[0]!;
      g.fillRect(cx - w / 2, bot, w, 8);
      text(g, '+', cx - w / 2 - 14, top - 4, { font: `800 16px ${th.font}`, color: th.text });
      text(g, '−', cx - w / 2 - 14, bot + 4, { font: `800 16px ${th.font}`, color: th.text });
      text(g, `U = ${fmt.num(p.Um, 0)} V`, cx, bot + 24, { font: `700 13px ${th.font}`, color: th.text });
      const y = top + 14 + dropY * (bot - top - 28);
      g.fillStyle = th.series[3]!;
      g.beginPath();
      g.arc(cx, y, 9, 0, Math.PI * 2);
      g.fill();
      // Kräfte
      const Uf = floatU();
      const fe = (p.Um / Uf) * 40;
      g.strokeStyle = th.series[2]!;
      g.fillStyle = th.series[2]!;
      g.lineWidth = 3;
      const arrow = (dy: number, color: string) => {
        g.strokeStyle = color;
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(cx + (dy > 0 ? 16 : -16), y);
        g.lineTo(cx + (dy > 0 ? 16 : -16), y + dy);
        g.stroke();
        const s = Math.sign(dy);
        g.beginPath();
        g.moveTo(cx + (dy > 0 ? 16 : -16), y + dy + s * 2);
        g.lineTo(cx + (dy > 0 ? 16 : -16) - 6, y + dy - s * 8);
        g.lineTo(cx + (dy > 0 ? 16 : -16) + 6, y + dy - s * 8);
        g.closePath();
        g.fill();
      };
      arrow(40, th.series[1]!);
      if (fe > 1) arrow(-fe, th.series[2]!);
      text(g, 'F_G', cx + 30, y + 30, { font: `700 12px ${th.font}`, color: th.series[1]!, align: 'left' });
      if (fe > 1) text(g, 'F_el', cx - 30, y - Math.min(fe, 60) + 10, { font: `700 12px ${th.font}`, color: th.series[2]!, align: 'right' });
    }

    function drawCyclotron(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const R = Math.min(r.w, r.h) * 0.42;
      const gapW = 14;
      // Duanten
      g.fillStyle = withAlpha(th.series[4]!, 0.18);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      for (const side of [-1, 1]) {
        g.beginPath();
        g.arc(cx + side * gapW / 2, cy, R, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? (3 * Math.PI) / 2 : Math.PI / 2);
        g.closePath();
        g.fill();
        g.stroke();
      }
      text(g, ctx.t('dee'), cx - R * 0.6, cy - R * 0.75, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, ctx.t('dee'), cx + R * 0.6, cy - R * 0.75, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, '⊗ B', cx + R * 0.7, cy + R * 0.8, { font: `700 13px ${th.font}`, color: th.text });
      // Spirale: Halbkreise mit wachsendem Radius (r ∝ √(Anzahl der Spaltdurchgänge)), abwechselnd rechts und links
      const turns = 10;
      const r1 = (0.75 * R) / Math.sqrt(2 * turns);
      g.strokeStyle = withAlpha(th.series[1]!, 0.55);
      g.lineWidth = 1.5;
      g.beginPath();
      const pts: [number, number][] = [];
      let ya = cy;
      for (let k = 0; k < 2 * turns; k++) {
        const rk = r1 * Math.sqrt(k + 1);
        const right = k % 2 === 0;
        const xs = cx + (right ? gapW / 2 : -gapW / 2);
        const yc = right ? ya - rk : ya + rk;
        for (let i = 0; i <= 24; i++) {
          const t = i / 24;
          const ang = right ? Math.PI / 2 - t * Math.PI : -Math.PI / 2 - t * Math.PI;
          pts.push([xs + Math.cos(ang) * rk, yc + Math.sin(ang) * rk]);
        }
        ya = right ? ya - 2 * rk : ya + 2 * rk;
      }
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
      // Teilchen
      const n = pts.length;
      const idx = Math.floor((anim * 60) % n);
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.arc(pts[idx]![0], pts[idx]![1], 6, 0, Math.PI * 2);
      g.fill();
      text(g, ctx.t('gap'), cx, cy + R + 14, { font: `600 11px ${th.font}`, color: th.muted });
    }

    function drawHall(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const w = Math.min(r.w * 0.6, 340);
      const h = Math.min(r.h * 0.45, 160);
      roundRect(g, cx - w / 2, cy - h / 2, w, h, 6);
      g.fillStyle = withAlpha(th.muted, 0.18);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      // B-Feld in die Ebene
      g.strokeStyle = withAlpha(th.text, 0.35);
      g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 3; j++) {
          const x = cx - w / 2 + ((i + 0.5) * w) / 6;
          const y = cy - h / 2 + ((j + 0.5) * h) / 3;
          g.beginPath();
          g.moveTo(x - 5, y - 5);
          g.lineTo(x + 5, y + 5);
          g.moveTo(x + 5, y - 5);
          g.lineTo(x - 5, y + 5);
          g.stroke();
        }
      text(g, ctx.t('Bin'), cx, cy + h / 2 + 50, { font: `600 11px ${th.font}`, color: th.muted });
      // Elektronen fließen von rechts nach links (Strom nach rechts), werden nach oben abgelenkt (Lorentzkraft)
      const shift = Math.min(1, (p.B * p.I) / 5);
      g.fillStyle = th.series[0]!;
      for (let k = 0; k < 14; k++) {
        const f = ((k / 14 + anim * 0.15 * p.I) % 1);
        const x = cx + w / 2 - f * w;
        const y = cy + ((k % 3) - 1) * h * 0.2 - shift * h * 0.25 * Math.min(1, f * 3);
        g.beginPath();
        g.arc(x, y, 4, 0, Math.PI * 2);
        g.fill();
      }
      // angesammelte Ladungen
      const nq = Math.round(shift * 8);
      for (let k = 0; k < nq; k++) {
        const x = cx - w / 2 + ((k + 0.5) * w) / 8;
        text(g, '−', x, cy - h / 2 + 10, { font: `800 14px ${th.font}`, color: th.series[0]! });
        text(g, '+', x, cy + h / 2 - 10, { font: `800 14px ${th.font}`, color: th.series[1]! });
      }
      // Stromrichtung und Hall-Spannung
      text(g, `I = ${fmt.num(p.I, 1)} A →`, cx, cy - h / 2 - 16, { font: `700 12px ${th.font}`, color: th.text });
      text(g, `U_H ≈ ${volt(hallVoltage(p.B, p.I, hallN(), hallD()))}`, cx + w / 2, cy + h / 2 + 18, { font: `700 13px ${th.font}`, color: th.series[2]!, align: 'right' });
      text(g, ctx.t('plate'), cx - w / 2, cy + h / 2 + 18, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
    }

    return {
      update() {
        updateReadouts();
      },
      tick(dt) {
        anim += dt;
        if (p.mode === 'millikan') {
          const Uf = floatU();
          const vel = Math.max(-0.4, Math.min(0.4, ((Uf - p.Um) / Uf) * 0.4));
          dropY = Math.max(0, Math.min(1, dropY + vel * dt));
        }
        updateReadouts();
      },
      resetTime() {
        anim = 0;
        dropY = 0.5;
      },
      render() {
        surface.begin();
        const full: Rect = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'laengs') drawGun(full, false);
        else if (p.mode === 'quer') drawGun(full, true);
        else if (p.mode === 'millikan') drawMillikan(full);
        else if (p.mode === 'zyklotron') drawCyclotron(full);
        else drawHall(full);
      },
      destroy: () => surface.destroy(),
    };
  },
});
