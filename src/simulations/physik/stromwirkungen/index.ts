import { defineSimulation, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { bodyCurrent, current, danger, fuseBlows, power, RCD_LIMIT, type Danger, type Device } from './model';

const L = (de: string, en: string) => ({ de, en });

const SOURCES: Record<string, number> = { bat: 1.5, block: 9, auto: 12, trafo: 24, netz: 230, stark: 400 };

function hash(i: number): number {
  const v = Math.sin(i * 78.233 + 1.7) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Wirkungen des elektrischen Stroms: Licht, Wärme, Magnetismus und Chemie,
 * Schmelzsicherung und Kurzschluss, Gefahren für den Menschen und FI-Schalter.
 */
export default defineSimulation({
  id: 'stromwirkungen',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'wirkungen', label: L('Wirkungen des Stroms', 'Effects of current') },
        { value: 'gefahr', label: L('Gefahr für den Menschen', 'Danger to people') },
      ],
      default: 'wirkungen',
      display: 'buttons',
    },
    {
      key: 'geraet',
      type: 'choice',
      label: L('Gerät', 'Device'),
      options: [
        { value: 'lampe', label: L('Glühlampe', 'light bulb') },
        { value: 'heiz', label: L('Heizdraht', 'heating wire') },
        { value: 'spule', label: L('Spule mit Eisenkern', 'coil with iron core') },
        { value: 'wasser', label: L('Salzwasser', 'salt water') },
      ],
      default: 'lampe',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'wirkungen',
    },
    { key: 'U', type: 'number', label: L('Spannung', 'Voltage'), min: 0, max: 12, step: 0.5, default: 6, unit: 'V', visibleIf: (v) => v.mode === 'wirkungen' },
    {
      key: 'sich',
      type: 'choice',
      label: L('Sicherung', 'Fuse'),
      options: [
        { value: '1', label: L('1 A', '1 A') },
        { value: '2', label: L('2 A', '2 A') },
        { value: '5', label: L('5 A', '5 A') },
      ],
      default: '2',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'wirkungen',
    },
    { key: 'kurz', type: 'boolean', label: L('Kurzschluss', 'Short circuit'), default: false, visibleIf: (v) => v.mode === 'wirkungen' },
    {
      key: 'quelle',
      type: 'choice',
      label: L('Spannungsquelle', 'Voltage source'),
      options: [
        { value: 'bat', label: L('Batterie 1,5 V', 'battery 1.5 V') },
        { value: 'block', label: L('9-V-Block', '9 V battery') },
        { value: 'auto', label: L('Autobatterie 12 V', 'car battery 12 V') },
        { value: 'trafo', label: L('Spielzeugtrafo 24 V', 'toy transformer 24 V') },
        { value: 'netz', label: L('Steckdose 230 V', 'mains socket 230 V') },
        { value: 'stark', label: L('Starkstrom 400 V', 'three-phase 400 V') },
      ],
      default: 'netz',
      display: 'menu',
      visibleIf: (v) => v.mode === 'gefahr',
    },
    { key: 'nass', type: 'boolean', label: L('nasse Haut', 'wet skin'), default: false, visibleIf: (v) => v.mode === 'gefahr' },
    { key: 'fi', type: 'boolean', label: L('FI-Schutzschalter', 'residual-current device (RCD)'), default: false, visibleIf: (v) => v.mode === 'gefahr' },
  ],
  hint: (v) =>
    v.mode === 'gefahr'
      ? L('Wie viel Strom durch den Körper fließt, hängt von der Spannung und von der Haut ab. Schon wenige Milliampere sind gefährlich.', 'How much current flows through the body depends on the voltage and on the skin. Just a few milliamperes are dangerous.')
      : L('Drücke Start, wähle ein Gerät und erhöhe die Spannung. Was passiert bei einem Kurzschluss?', 'Press play, choose a device and raise the voltage. What happens in a short circuit?'),
  readouts: [
    { key: 'I', label: L('Stromstärke', 'Current') },
    { key: 'P', label: L('Leistung im Gerät', 'Power in the device') },
    { key: 'fuse', label: L('Sicherung', 'Fuse'), spoiler: true },
    { key: 'Ib', label: L('Strom durch den Körper', 'Current through the body') },
    { key: 'eff', label: L('Wirkung', 'Effect'), spoiler: true },
    { key: 'fiS', label: L('FI-Schalter', 'RCD') },
  ],
  presets: [
    { id: 'lampe', label: L('Glühlampe 6 V', 'Light bulb 6 V'), values: { mode: 'wirkungen', geraet: 'lampe', U: 6, sich: '2', kurz: false } },
    { id: 'heiz', label: L('Heizdraht 12 V', 'Heating wire 12 V'), values: { mode: 'wirkungen', geraet: 'heiz', U: 12, sich: '5', kurz: false } },
    { id: 'kurz', label: L('Kurzschluss', 'Short circuit'), values: { mode: 'wirkungen', geraet: 'lampe', U: 6, sich: '2', kurz: true } },
    { id: 'netz', label: L('Steckdose, nasse Hände', 'Socket, wet hands'), values: { mode: 'gefahr', quelle: 'netz', nass: true, fi: false } },
    { id: 'fi', label: L('Steckdose mit FI-Schalter', 'Socket with RCD'), values: { mode: 'gefahr', quelle: 'netz', nass: true, fi: true } },
  ],
  strings: {
    de: {
      canvasW: 'Stromkreis mit Quelle, Schmelzsicherung und einem Gerät; die Wirkung des Stroms ist am Gerät zu sehen',
      canvasG: 'Ein Mensch berührt einen spannungsführenden Draht und steht auf dem Boden; daneben eine Skala, wie gefährlich der Körperstrom ist',
      IVal: 'I ≈ {I} A',
      PVal: 'P ≈ {P} W',
      Pshort: '0 W – der Strom fließt am Gerät vorbei',
      fuseOk: 'hält ({r} A)',
      fuseBlown: 'durchgebrannt! (mehr als {r} A)',
      IbVal: 'I ≈ {I} mA (R ≈ {R} Ω)',
      none: 'nicht spürbar',
      tingle: 'Kribbeln, Schreck',
      cramp: 'Muskeln verkrampfen – Loslassen unmöglich',
      deadly: 'Herzkammerflimmern – Lebensgefahr',
      fiOff: 'nicht eingebaut',
      fiTrip: 'schaltet nach etwa 0,03 s ab – der Mensch überlebt meist',
      fiStay: 'löst erst ab 30 mA Fehlerstrom aus',
      source: 'Quelle',
      fuse: 'Sicherung',
      short: 'Kurzschluss',
      light: 'Licht und Wärme',
      heat: 'Wärme',
      magnet: 'magnetische Wirkung',
      chem: 'chemische Wirkung: Gasbläschen',
      clips: 'Büroklammern',
      ground: 'Erde',
      scale: 'Körperstrom in mA',
      off: 'abgeschaltet',
    },
    en: {
      canvasW: 'Circuit with a source, a fuse and a device; the effect of the current can be seen at the device',
      canvasG: 'A person touches a live wire while standing on the ground; next to it a scale showing how dangerous the body current is',
      IVal: 'I ≈ {I} A',
      PVal: 'P ≈ {P} W',
      Pshort: '0 W – the current bypasses the device',
      fuseOk: 'holds ({r} A)',
      fuseBlown: 'blown! (more than {r} A)',
      IbVal: 'I ≈ {I} mA (R ≈ {R} Ω)',
      none: 'not noticeable',
      tingle: 'tingling, shock',
      cramp: 'muscles cramp – impossible to let go',
      deadly: 'ventricular fibrillation – danger to life',
      fiOff: 'not installed',
      fiTrip: 'switches off after about 0.03 s – the person usually survives',
      fiStay: 'only trips from 30 mA fault current',
      source: 'source',
      fuse: 'fuse',
      short: 'short circuit',
      light: 'light and heat',
      heat: 'heat',
      magnet: 'magnetic effect',
      chem: 'chemical effect: gas bubbles',
      clips: 'paper clips',
      ground: 'earth',
      scale: 'body current in mA',
      off: 'switched off',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasW'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let t = 0;

    const dev = () => p.geraet as Device;
    const rating = () => Number(p.sich);
    const I = () => current(p.U, dev(), p.kurz);
    const blown = () => fuseBlows(I(), rating());
    const flowing = () => (blown() ? 0 : I());

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      if (p.mode === 'wirkungen') {
        show.I = tr('IVal', { I: fmt.num(flowing(), 2) });
        show.P = p.kurz ? ctx.t('Pshort') : tr('PVal', { P: fmt.num(blown() ? 0 : power(p.U, dev(), false), 1) });
        show.fuse = blown() ? tr('fuseBlown', { r: p.sich }) : tr('fuseOk', { r: p.sich });
      } else {
        const U = SOURCES[p.quelle]!;
        const mA = bodyCurrent(U, p.nass);
        show.Ib = tr('IbVal', { I: fmt.num(mA, mA < 10 ? 1 : 0), R: p.nass ? '1000' : '3000' });
        show.eff = ctx.t(danger(mA));
        show.fiS = !p.fi ? ctx.t('fiOff') : mA >= RCD_LIMIT ? ctx.t('fiTrip') : ctx.t('fiStay');
      }
      for (const k of ['I', 'P', 'fuse', 'Ib', 'eff', 'fiS']) ctx.readout(k, show[k] ?? null);
    }

    /* ---------------- Wirkungen ---------------- */
    function drawCircuit(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + r.w * 0.12;
      const x1 = r.x + r.w * 0.62;
      const y0 = r.y + r.h * 0.22;
      const y1 = r.y + r.h * 0.82;
      const wire = th.text;
      const Iflow = flowing();
      const k = Math.max(0.8, Math.min(1.7, Math.min(r.w, r.h) / 380));
      // Leitungen
      g.strokeStyle = wire;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(x0, (y0 + y1) / 2 - 22);
      g.lineTo(x0, y0);
      g.lineTo(x1, y0);
      g.lineTo(x1, (y0 + y1) / 2 - 40 * k);
      g.moveTo(x1, (y0 + y1) / 2 + 40 * k);
      g.lineTo(x1, y1);
      g.lineTo(x0, y1);
      g.lineTo(x0, (y0 + y1) / 2 + 22);
      g.stroke();
      // Quelle
      const cy = (y0 + y1) / 2;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x0 - 18, cy - 8);
      g.lineTo(x0 + 18, cy - 8);
      g.stroke();
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(x0 - 9, cy + 8);
      g.lineTo(x0 + 9, cy + 8);
      g.stroke();
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(x0, cy - 8);
      g.lineTo(x0, cy - 22);
      g.moveTo(x0, cy + 8);
      g.lineTo(x0, cy + 22);
      g.stroke();
      subText(g, `${fmt.num(p.U, 1)} V`, x0 + 24, cy, { size: 13, family: th.font, weight: 700, color: th.text, align: 'left', halo: th.bg });
      // Sicherung (oben)
      const fx = (x0 + x1) / 2;
      g.fillStyle = th.bg;
      g.fillRect(fx - 26, y0 - 9, 52, 18);
      g.strokeStyle = wire;
      g.lineWidth = 1.5;
      g.strokeRect(fx - 26, y0 - 9, 52, 18);
      g.strokeStyle = blown() ? th.series[3]! : wire;
      g.lineWidth = 1.5;
      g.beginPath();
      if (blown()) {
        g.moveTo(fx - 26, y0);
        g.lineTo(fx - 6, y0);
        g.moveTo(fx + 6, y0 + 2);
        g.lineTo(fx + 26, y0);
      } else {
        g.moveTo(fx - 26, y0);
        g.lineTo(fx + 26, y0);
      }
      g.stroke();
      subText(g, `${ctx.t('fuse')} ${p.sich} A`, fx, y0 - 20, { size: 12, family: th.font, weight: 600, color: blown() ? th.series[3]! : th.muted, halo: th.bg });
      // Kurzschlussbrücke
      if (p.kurz) {
        const bx = x1 - 26 * k;
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(x1, cy - 52 * k);
        g.lineTo(bx, cy - 52 * k);
        g.lineTo(bx, cy + 52 * k);
        g.lineTo(x1, cy + 52 * k);
        g.stroke();
        subText(g, ctx.t('short'), bx - 6, cy, { size: 12, family: th.font, weight: 700, color: th.series[3]!, align: 'right', halo: th.bg });
      }
      // Ladungsträger als Punkte (Stromrichtung Plus → Minus)
      if (Iflow > 0) {
        const path: [number, number][] = [
          [x0, cy - 22],
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
          [x0, cy + 22],
        ];
        const segs = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i]![0], q[1] - path[i]![1]));
        const total = segs.reduce((a, b) => a + b, 0);
        const n = 22;
        g.fillStyle = th.series[0]!;
        for (let k = 0; k < n; k++) {
          let d = ((k / n) * total + t * 40 * Math.min(Iflow, 6)) % total;
          let i = 0;
          while (d > segs[i]!) {
            d -= segs[i]!;
            i++;
          }
          const a = path[i]!;
          const b = path[i + 1]!;
          const u = d / segs[i]!;
          g.beginPath();
          g.arc(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 3, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.save();
      g.translate(x1, cy);
      g.scale(k, k);
      drawDevice(0, 0);
      g.restore();
      const labels: Record<Device, string> = { lampe: 'light', heiz: 'heat', spule: 'magnet', wasser: 'chem' };
      subText(g, ctx.t(labels[dev()]), r.x + r.w - 10, r.y + 24, { size: 13, family: th.font, weight: 700, color: th.text, align: 'right', halo: th.bg });
    }

    function drawDevice(x: number, cy: number): void {
      const g = surface.g;
      const th = ctx.theme;
      const P = blown() || p.kurz ? 0 : power(p.U, dev(), false);
      const Id = blown() || p.kurz ? 0 : I();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      if (dev() === 'lampe') {
        const a = Math.min(1, P / 12);
        if (a > 0.02) {
          const grd = g.createRadialGradient(x, cy, 4, x, cy, 70);
          grd.addColorStop(0, withAlpha(th.series[2]!, 0.8 * a));
          grd.addColorStop(1, withAlpha(th.series[2]!, 0));
          g.fillStyle = grd;
          g.beginPath();
          g.arc(x, cy, 70, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = withAlpha(th.series[2]!, 0.15 + 0.7 * a);
        g.beginPath();
        g.arc(x, cy, 24, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.beginPath();
        g.moveTo(x - 17, cy - 17);
        g.lineTo(x + 17, cy + 17);
        g.moveTo(x + 17, cy - 17);
        g.lineTo(x - 17, cy + 17);
        g.stroke();
        g.beginPath();
        g.moveTo(x, cy - 40);
        g.lineTo(x, cy - 24);
        g.moveTo(x, cy + 24);
        g.lineTo(x, cy + 40);
        g.stroke();
      } else if (dev() === 'heiz') {
        const a = Math.min(1, P / 30);
        g.strokeStyle = a > 0.05 ? th.series[3]! : th.text;
        g.lineWidth = 2 + 3 * a;
        g.beginPath();
        for (let i = 0; i <= 16; i++) {
          const y = cy - 40 + (i / 16) * 80;
          const xx = x + (i % 2 ? 12 : -12) * (i === 0 || i === 16 ? 0 : 1);
          if (i) g.lineTo(xx, y);
          else g.moveTo(xx, y);
        }
        g.stroke();
        // Wärmewellen
        g.strokeStyle = withAlpha(th.series[3]!, 0.7 * a);
        g.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          for (let s = 0; s <= 40; s++) {
            const yy = cy - 46 - s * 1.2 - ((t * 30) % 12);
            const xx = x - 16 + k * 16 + 4 * Math.sin(s / 4 + t * 4);
            if (s) g.lineTo(xx, yy);
            else g.moveTo(xx, yy);
          }
          g.stroke();
        }
      } else if (dev() === 'spule') {
        // Eisenkern waagerecht nach rechts
        g.fillStyle = withAlpha(th.muted, 0.5);
        g.fillRect(x - 10, cy - 12, 80, 24);
        g.strokeStyle = th.series[0]!;
        g.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
          g.beginPath();
          g.ellipse(x + 4 + i * 8, cy, 4, 18, 0, 0, Math.PI * 2);
          g.stroke();
        }
        const n = Math.min(10, Math.floor(Id * 6));
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        for (let k = 0; k < n; k++) {
          const cx = x + 74 + (k % 2) * 6;
          const yy = cy - 6 + k * 9;
          g.beginPath();
          g.roundRect(cx, yy, 16, 6, 3);
          g.stroke();
        }
        for (let k = n; k < 10; k++) {
          g.beginPath();
          g.roundRect(x + 60 + (k - n) * 12 + (k % 3) * 3, cy + 64, 16, 6, 3);
          g.stroke();
        }
      } else {
        // Becher mit Salzwasser und zwei Elektroden
        g.fillStyle = withAlpha(th.series[0]!, 0.12);
        g.fillRect(x - 40, cy - 10, 80, 60);
        g.strokeStyle = th.text;
        g.strokeRect(x - 40, cy - 30, 80, 80);
        g.fillStyle = th.text;
        g.fillRect(x - 22, cy - 40, 6, 80);
        g.fillRect(x + 16, cy - 40, 6, 80);
        const n = Math.round(Id * 20);
        g.strokeStyle = th.series[0]!;
        g.lineWidth = 1.2;
        for (let k = 0; k < n; k++) {
          const side = k % 2 ? 1 : -1;
          const bx = x + side * 19 + (hash(k) - 0.5) * 10;
          const by = cy + 46 - ((t * 25 + hash(k + 9) * 60) % 56);
          g.beginPath();
          g.arc(bx, by, 2 + hash(k + 3) * 1.5, 0, Math.PI * 2);
          g.stroke();
        }
      }
    }

    /* ---------------- Gefahr ---------------- */
    function drawDanger(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const U = SOURCES[p.quelle]!;
      const mA = bodyCurrent(U, p.nass);
      const tripped = p.fi && mA >= RCD_LIMIT;
      const d: Danger = danger(mA);
      const colors: Record<Danger, string> = { none: th.series[2]!, tingle: th.series[1]!, cramp: th.series[3]!, deadly: th.series[3]! };
      const wide = r.w > 560;
      const fig: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.5, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h * 0.55 };
      const sc: Rect = wide ? { x: r.x + r.w * 0.52, y: r.y, w: r.w * 0.46, h: r.h } : { x: r.x, y: r.y + r.h * 0.55, w: r.w, h: r.h * 0.45 };
      // Boden
      const gy = fig.y + fig.h - 24;
      g.strokeStyle = th.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(fig.x + 10, gy);
      g.lineTo(fig.x + fig.w - 10, gy);
      g.stroke();
      text(g, ctx.t('ground'), fig.x + fig.w - 12, gy + 12, { font: `600 11px ${th.font}`, color: th.muted, align: 'right' });
      // Mensch (Strichfigur)
      const H = Math.min(fig.h * 0.72, 220);
      const mx = fig.x + fig.w * 0.55;
      const hipY = gy - H * 0.45;
      const shY = gy - H * 0.8;
      const headR = H * 0.08;
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(mx, shY - headR * 1.4, headR, 0, Math.PI * 2);
      g.moveTo(mx, shY - headR * 0.4);
      g.lineTo(mx, hipY);
      g.lineTo(mx - H * 0.12, gy);
      g.moveTo(mx, hipY);
      g.lineTo(mx + H * 0.12, gy);
      g.moveTo(mx, shY);
      g.lineTo(mx + H * 0.15, shY + H * 0.2);
      g.stroke();
      const hand: [number, number] = [mx - H * 0.3, shY - H * 0.12];
      g.beginPath();
      g.moveTo(mx, shY);
      g.lineTo(hand[0], hand[1]);
      g.stroke();
      // Draht unter Spannung
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(fig.x + 10, hand[1]);
      g.lineTo(hand[0] + 4, hand[1]);
      g.stroke();
      subText(g, `${fmt.num(U, U < 10 ? 1 : 0)} V`, fig.x + 14, hand[1] - 14, { size: 13, family: th.font, weight: 700, color: th.series[3]!, align: 'left', halo: th.bg });
      // Stromweg Hand → Füße
      if (!tripped && d !== 'none') {
        g.strokeStyle = withAlpha(colors[d], 0.8);
        g.lineWidth = 2;
        g.setLineDash([6, 5]);
        g.lineDashOffset = -t * 30;
        g.beginPath();
        g.moveTo(hand[0], hand[1]);
        g.lineTo(mx, shY);
        g.lineTo(mx, hipY);
        g.lineTo(mx - H * 0.12, gy);
        g.stroke();
        g.setLineDash([]);
        g.lineDashOffset = 0;
      }
      if (tripped) subText(g, `FI: ${ctx.t('off')}`, fig.x + fig.w / 2, fig.y + 18, { size: 14, family: th.font, weight: 700, color: th.series[2]!, halo: th.bg });

      // Skala (logarithmisch 0,1 … 1000 mA)
      const sx0 = sc.x + 20;
      const sx1 = sc.x + sc.w - 20;
      const sy = sc.y + sc.h * 0.45;
      const X = (v: number) => sx0 + ((Math.log10(Math.max(v, 0.1)) + 1) / 4) * (sx1 - sx0);
      const zones: [number, number, Danger][] = [
        [0.1, 1, 'none'],
        [1, 10, 'tingle'],
        [10, 50, 'cramp'],
        [50, 1000, 'deadly'],
      ];
      for (const [a, b, z] of zones) {
        g.fillStyle = withAlpha(colors[z], z === 'deadly' ? 0.55 : 0.3);
        g.fillRect(X(a), sy - 14, X(b) - X(a), 28);
      }
      g.strokeStyle = th.text;
      g.lineWidth = 1;
      g.strokeRect(sx0, sy - 14, sx1 - sx0, 28);
      for (const v of [0.1, 1, 10, 100, 1000]) {
        g.beginPath();
        g.moveTo(X(v), sy + 14);
        g.lineTo(X(v), sy + 20);
        g.stroke();
        text(g, fmt.num(v, v < 1 ? 1 : 0), X(v), sy + 30, { font: `500 11px ${th.font}`, color: th.muted });
      }
      text(g, ctx.t('scale'), (sx0 + sx1) / 2, sy + 48, { font: `600 12px ${th.font}`, color: th.muted });
      // Markierung
      const mxp = X(Math.min(mA, 1000));
      g.fillStyle = th.text;
      g.beginPath();
      g.moveTo(mxp, sy - 16);
      g.lineTo(mxp - 7, sy - 28);
      g.lineTo(mxp + 7, sy - 28);
      g.closePath();
      g.fill();
      const label = `${fmt.num(mA, mA < 10 ? 1 : 0)} mA: ${ctx.t(d)}`;
      const align: CanvasTextAlign = mxp < sx0 + 80 ? 'left' : mxp > sx1 - 80 ? 'right' : 'center';
      subText(g, label, align === 'left' ? Math.max(sx0, mxp - 10) : align === 'right' ? Math.min(sx1, mxp + 10) : mxp, sy - 40, { size: 12, family: th.font, weight: 700, color: th.text, align, halo: th.bg });
      // 30-mA-Linie des FI-Schalters
      if (p.fi) {
        g.strokeStyle = th.series[2]!;
        g.lineWidth = 2;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.moveTo(X(30), sy - 20);
        g.lineTo(X(30), sy + 20);
        g.stroke();
        g.setLineDash([]);
        text(g, 'FI 30 mA', X(30), sy + 64, { font: `600 11px ${th.font}`, color: th.series[2]! });
      }
    }

    return {
      update() {
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'gefahr' ? 'canvasG' : 'canvasW'));
        updateReadouts();
      },
      tick(dt) {
        t += Math.min(dt, 0.05);
      },
      resetTime() {
        t = 0;
      },
      render() {
        surface.begin();
        const r = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'gefahr') drawDanger(r);
        else drawCircuit(r);
      },
      destroy: () => surface.destroy(),
    };
  },
});
