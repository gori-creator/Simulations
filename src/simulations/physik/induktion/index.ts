import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { brakingForce, coilLinkage, COIL_AREA, current, generatorPeak, MAGNET, magnetVoltage, motionalVoltage, rms } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Widerstand des Stromkreises beim Stab auf Schienen in Ω (Modell). */
const R_RAIL = 2;
/** Bereich des Magneten (Abstand Stirnfläche – Spulenmitte) und des Stabs in m. */
const Z_MIN = -0.03;
const Z_MAX = 0.3;
const X_MIN = 0.06;
const X_MAX = 0.62;
/** Zeitlupe beim Generator. */
const GEN_SLOW = 0.1;
/** Messbereiche des Spannungsmessers in V. */
const RANGES = [0.03, 0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000];

type Mode = 'magnet' | 'rail' | 'gen';

interface Lay {
  side: boolean;
  scene: Rect;
  chart: Rect;
  meter: Rect;
  info: Rect;
}

interface Sample {
  t: number;
  U: number;
  /** Fluss-Kurve (Generator, normiert −1 … 1). */
  f: number;
}

/**
 * Elektromagnetische Induktion in drei Versuchen: Stabmagnet und Spule
 * (Magnet ziehen), Leiterstab auf Schienen im homogenen Feld (Fläche ändert
 * sich), Generator mit rotierender Spule. Spannungsmesser mit Nullpunkt in der
 * Mitte, U(t)-Diagramm live, Lenzsche Regel mit Induktionsstrom, induzierten
 * Polen bzw. bremsender Kraft.
 */
export default defineSimulation({
  id: 'induktion',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.45 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'magnet', label: L('Magnet und Spule', 'Magnet and coil') },
        { value: 'rail', label: L('Leiterschleife im Feld', 'Conducting loop in a field') },
        { value: 'gen', label: L('Generator', 'Generator') },
      ],
      default: 'magnet',
    },
    { key: 'n', type: 'number', label: L('Windungszahl n', 'Number of turns n'), min: 10, max: 500, step: 10, default: 100, visibleIf: (v) => v.mode !== 'rail' },
    { key: 'B', type: 'number', label: L('Flussdichte B', 'Flux density B'), min: 0.05, max: 1, step: 0.05, default: 0.5, unit: 'T', visibleIf: (v) => v.mode !== 'magnet' },
    { key: 'l', type: 'number', label: L('Länge des Stabs l', 'Length of the rod l'), min: 0.05, max: 0.5, step: 0.01, default: 0.2, unit: 'm', visibleIf: (v) => v.mode === 'rail' },
    { key: 'v', type: 'number', label: L('Geschwindigkeit v', 'Speed v'), help: L('Oder: den Stab im Bild ziehen.', 'Or drag the rod in the picture.'), min: 0.5, max: 5, step: 0.1, default: 2, unit: 'm/s', visibleIf: (v) => v.mode === 'rail' },
    { key: 'A', type: 'number', label: L('Spulenfläche A', 'Coil area A'), min: 10, max: 400, step: 10, default: 100, unit: 'cm²', visibleIf: (v) => v.mode === 'gen' },
    { key: 'f', type: 'number', label: L('Drehfrequenz f', 'Rotation frequency f'), help: L('Im Bild zehnfach verlangsamt.', 'Slowed down ten times in the picture.'), min: 0.5, max: 10, step: 0.5, default: 5, unit: 'Hz', visibleIf: (v) => v.mode === 'gen' },
    { key: 'auto', type: 'boolean', label: L('Automatisch hin und her bewegen', 'Move back and forth automatically'), help: L('Aus: Magnet bzw. Stab selbst ziehen.', 'Off: drag the magnet or the rod yourself.'), default: true, visibleIf: (v) => v.mode !== 'gen' },
    { key: 'lines', type: 'boolean', group: 'view', label: L('Feldlinien', 'Field lines'), default: true },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  readouts: [
    { key: 'law', label: L('Induktionsgesetz', 'Law of induction') },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
    { key: 'lenz', label: L('Lenzsche Regel', 'Lenz’s law') },
    { key: 'now', label: L('Momentan', 'Right now'), spoiler: true },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'start', label: L('Magnet in die Spule schieben', 'Push the magnet into the coil'), values: {} },
    { id: 'turns', label: L('Dreifache Windungszahl', 'Three times the turns'), values: { n: 300 } },
    { id: 'rail', label: L('Stab auf Schienen: U = B · l · v', 'Rod on rails: U = B · l · v'), values: { mode: 'rail' } },
    { id: 'railfast', label: L('Doppelte Geschwindigkeit', 'Twice the speed'), values: { mode: 'rail', v: 4 } },
    { id: 'gen', label: L('Generator: Û ≈ 3,14 V', 'Generator: Û ≈ 3.14 V'), values: { mode: 'gen', B: 0.1, n: 100, A: 100, f: 5 } },
    { id: 'gen2', label: L('Generator mit doppelter Frequenz', 'Generator at twice the frequency'), values: { mode: 'gen', B: 0.1, n: 100, A: 100, f: 10 } },
  ],
  strings: {
    de: {
      canvas:
        'Elektromagnetische Induktion: je nach Versuch ein Stabmagnet, der in eine Spule geschoben wird, ein Leiterstab, der auf zwei Schienen durch ein Magnetfeld gleitet, oder eine Spule, die sich zwischen zwei Magnetpolen dreht. Pfeile zeigen den Induktionsstrom, die induzierten Pole bzw. die bremsende Kraft. Daneben ein Spannungsmesser mit Nullpunkt in der Mitte, das U(t)-Diagramm und die Rechnung.',
      tMagnet: 'Magnet und Spule',
      tRail: 'Leiterschleife im Magnetfeld (von oben)',
      tRailS: 'Leiterschleife (von oben)',
      tGen: 'Generator',
      drag: 'Magnet ziehen',
      dragRod: 'Stab ziehen',
      toMeter: 'zum Spannungsmesser',
      repel: 'Abstoßung',
      attract: 'Anziehung',
      lenzPole: 'induzierter Pol',
      area: 'A = l · x',
      slow: 'Zeitlupe 1 : 10',
      intoPage: 'B zeigt in die Ebene',
      chart: 'Induzierte Spannung',
      axisT: 't in s',
      axisU: 'U in V',
      fluxLab: 'Φ (skaliert)',
      meter: 'Spannungsmesser',
      rangeLab: 'Messbereich',
      infoTitle: 'Rechnung',
      law: '<var>U</var><sub>ind</sub> = −<var>n</var> · <span class="frac"><span>Δ<var>Φ</var></span><span>Δ<var>t</var></span></span> mit dem Fluss <var>Φ</var> = <var>B</var> · <var>A</var> · cos <var>φ</var>. Spannung entsteht nur, solange sich der Fluss ändert.',
      calcMagnet: 'Spule: <var>n</var> = {n}, <var>A</var> = π · (2 cm)<sup>2</sup> ≈ {A} cm<sup>2</sup>. Je schneller sich der Magnet bewegt und je mehr Windungen, desto größer die Spannung. Hineinschieben und Herausziehen geben Spannungen mit verschiedenem Vorzeichen.',
      calcRail: '<var>U</var> = <var>B</var> · <var>l</var> · <var>v</var> = {B} T · {l} m · {v} m/s = <strong>{U} V</strong><br>(aus <var>Φ</var> = <var>B</var> · <var>l</var> · <var>x</var>: Δ<var>Φ</var>/Δ<var>t</var> = <var>B</var> · <var>l</var> · <var>v</var>)<br>Mit <var>R</var> = 2 Ω: <var>I</var> = {I} A, bremsende Kraft <var>F</var> = <var>B</var> · <var>I</var> · <var>l</var> = {F} N.',
      calcGen: '<var>Φ</var>(<var>t</var>) = <var>B</var> · <var>A</var> · cos(<var>ω</var> <var>t</var>), <var>U</var>(<var>t</var>) = <var>n</var> · <var>B</var> · <var>A</var> · <var>ω</var> · sin(<var>ω</var> <var>t</var>)<br><var>Û</var> = <var>n</var> · <var>B</var> · <var>A</var> · <var>ω</var> = {n} · {B} T · {A} m<sup>2</sup> · {w} 1/s = <strong>{U} V</strong><br><var>ω</var> = 2π · {f} Hz, Periodendauer <var>T</var> = {T} s, Effektivwert <var>U</var><sub>eff</sub> = <var>Û</var>/√2 = {Ue} V',
      lenzIn: 'Der Magnet nähert sich: Der Induktionsstrom macht das linke Spulenende zum <strong>{p}-Pol</strong> – die Spule stößt den Magneten ab und bremst ihn.',
      lenzOut: 'Der Magnet entfernt sich: Das linke Spulenende wird zum <strong>{p}-Pol</strong> – die Spule zieht den Magneten an und bremst ihn.',
      lenzStill: 'Ruht der Magnet, ändert sich der Fluss nicht: keine Spannung, kein Strom.',
      lenzRail: 'Der Strom im Stab erfährt im Magnetfeld die Kraft <var>F</var> = <var>B</var> · <var>I</var> · <var>l</var>. Sie ist der Bewegung entgegengerichtet: Man muss Arbeit verrichten, die als elektrische Energie im Stromkreis ankommt.',
      lenzGen: 'Der Strom in der Spule erzeugt ein bremsendes Drehmoment: Je mehr Strom entnommen wird, desto schwerer lässt sich der Generator drehen.',
      now: '<var>t</var> = {t} s · <var>U</var> = {U} V',
    },
    en: {
      canvas:
        'Electromagnetic induction: depending on the experiment a bar magnet pushed into a coil, a conducting rod sliding on two rails through a magnetic field, or a coil rotating between two magnetic poles. Arrows show the induced current, the induced poles or the braking force. Next to it a voltmeter with zero in the middle, the U(t) graph and the calculation.',
      tMagnet: 'Magnet and coil',
      tRail: 'Conducting loop in a magnetic field (from above)',
      tRailS: 'Loop (from above)',
      tGen: 'Generator',
      drag: 'drag the magnet',
      dragRod: 'drag the rod',
      toMeter: 'to the voltmeter',
      repel: 'repulsion',
      attract: 'attraction',
      lenzPole: 'induced pole',
      area: 'A = l · x',
      slow: 'slow motion 1 : 10',
      intoPage: 'B points into the page',
      chart: 'Induced voltage',
      axisT: 't in s',
      axisU: 'U in V',
      fluxLab: 'Φ (scaled)',
      meter: 'Voltmeter',
      rangeLab: 'range',
      infoTitle: 'Calculation',
      law: '<var>U</var><sub>ind</sub> = −<var>n</var> · <span class="frac"><span>Δ<var>Φ</var></span><span>Δ<var>t</var></span></span> with the flux <var>Φ</var> = <var>B</var> · <var>A</var> · cos <var>φ</var>. A voltage appears only while the flux changes.',
      calcMagnet: 'Coil: <var>n</var> = {n}, <var>A</var> = π · (2 cm)<sup>2</sup> ≈ {A} cm<sup>2</sup>. The faster the magnet moves and the more turns, the larger the voltage. Pushing in and pulling out give voltages of opposite sign.',
      calcRail: '<var>U</var> = <var>B</var> · <var>l</var> · <var>v</var> = {B} T · {l} m · {v} m/s = <strong>{U} V</strong><br>(from <var>Φ</var> = <var>B</var> · <var>l</var> · <var>x</var>: Δ<var>Φ</var>/Δ<var>t</var> = <var>B</var> · <var>l</var> · <var>v</var>)<br>With <var>R</var> = 2 Ω: <var>I</var> = {I} A, braking force <var>F</var> = <var>B</var> · <var>I</var> · <var>l</var> = {F} N.',
      calcGen: '<var>Φ</var>(<var>t</var>) = <var>B</var> · <var>A</var> · cos(<var>ω</var> <var>t</var>), <var>U</var>(<var>t</var>) = <var>n</var> · <var>B</var> · <var>A</var> · <var>ω</var> · sin(<var>ω</var> <var>t</var>)<br><var>Û</var> = <var>n</var> · <var>B</var> · <var>A</var> · <var>ω</var> = {n} · {B} T · {A} m<sup>2</sup> · {w} 1/s = <strong>{U} V</strong><br><var>ω</var> = 2π · {f} Hz, period <var>T</var> = {T} s, rms value <var>U</var><sub>eff</sub> = <var>Û</var>/√2 = {Ue} V',
      lenzIn: 'The magnet approaches: the induced current makes the left end of the coil a <strong>{p} pole</strong> – the coil repels the magnet and slows it down.',
      lenzOut: 'The magnet moves away: the left end of the coil becomes an <strong>{p} pole</strong> – the coil attracts the magnet and slows it down.',
      lenzStill: 'If the magnet is at rest, the flux does not change: no voltage, no current.',
      lenzRail: 'The current in the rod experiences the force <var>F</var> = <var>B</var> · <var>I</var> · <var>l</var> in the magnetic field. It opposes the motion: you have to do work, which arrives as electrical energy in the circuit.',
      lenzGen: 'The current in the coil produces a braking torque: the more current is drawn, the harder it is to turn the generator.',
      now: '<var>t</var> = {t} s · <var>U</var> = {U} V',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const mode = (): Mode => (p.mode === 'rail' ? 'rail' : p.mode === 'gen' ? 'gen' : 'magnet');
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    /** Polfarben wie in der Schule: Nordpol rot, Südpol grün. */
    const NORTH = '#d63a3a';
    const SOUTH = '#2f9e64';

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, instant = false): number {
      const cur = soft.get(key);
      if (cur === undefined || instant || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-4 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    const swap = new Tween(500, ease.inOutCubic);

    /* ---------- Zustand ---------- */
    let t = 0;
    let z = 0.2;
    let zTarget = 0.2;
    let zVel = 0;
    let x = 0.2;
    let xTarget = 0.2;
    let xVel = 0;
    let railDir = 1;
    let railPause = 0;
    let phi = 0;
    let U = 0;
    let flow = 0;
    let history: Sample[] = [];
    let drag: 'magnet' | 'rod' | null = null;
    let hover: 'magnet' | 'rod' | null = null;

    function resetState(): void {
      t = 0;
      z = zTarget = 0.2;
      zVel = 0;
      x = xTarget = 0.12;
      xVel = 0;
      railDir = 1;
      railPause = 0;
      phi = 0;
      U = 0;
      history = [];
    }

    function voltageNow(): number {
      if (mode() === 'magnet') return magnetVoltage(z, zVel, p.n);
      if (mode() === 'rail') return motionalVoltage(p.B, p.l, xVel);
      return generatorPeak(p.n, p.B, p.A * 1e-4, p.f) * Math.sin(phi);
    }

    function window(): number {
      return mode() === 'gen' ? 3 / p.f : 4;
    }

    function step(dt: number): void {
      // Zeit in der Physik (Generator in Zeitlupe)
      const h = mode() === 'gen' ? dt * GEN_SLOW : dt;
      t += h;
      if (mode() === 'magnet') {
        if (p.auto && !drag) zTarget = 0.155 + 0.125 * Math.cos((TAU * t) / 2.6);
        const z0 = z;
        z += (zTarget - z) * (1 - Math.exp(-h * (drag ? 18 : 40)));
        z = clamp(z, Z_MIN, Z_MAX);
        const v = h > 0 ? (z - z0) / h : 0;
        zVel += (v - zVel) * (1 - Math.exp(-h * 30));
      } else if (mode() === 'rail') {
        if (p.auto && !drag) {
          if (railPause > 0) {
            railPause -= h;
            xTarget = x;
          } else {
            xTarget = x + railDir * p.v * h;
            if (xTarget >= X_MAX || xTarget <= X_MIN) {
              xTarget = clamp(xTarget, X_MIN, X_MAX);
              railDir = -railDir;
              railPause = 0.5;
            }
          }
          const x0 = x;
          x = xTarget;
          xVel = h > 0 ? (x - x0) / h : 0;
        } else {
          const x0 = x;
          x += (xTarget - x) * (1 - Math.exp(-h * 18));
          x = clamp(x, X_MIN, X_MAX);
          const v = h > 0 ? (x - x0) / h : 0;
          xVel += (v - xVel) * (1 - Math.exp(-h * 25));
        }
      } else phi = (TAU * p.f * t) % TAU;
      U = voltageNow();
      flow += h * U * 8 * (mode() === 'gen' ? 1 / Math.max(0.5, generatorPeak(p.n, p.B, p.A * 1e-4, p.f)) : 1 / meterRange());
      const fluxNorm = mode() === 'gen' ? Math.cos(phi) : 0;
      history.push({ t, U, f: fluxNorm });
      const w = window();
      while (history.length && history[0]!.t < t - w * 1.05) history.shift();
      if (history.length > 1500) history = history.filter((_, i) => i % 2 === 0);
    }

    /** Messbereich: kleinster Bereich, der die Spannungen der letzten Sekunden fasst. */
    let peak = 0.05;
    function meterRange(): number {
      return RANGES.find((r) => r >= peak * 1.08) ?? RANGES[RANGES.length - 1]!;
    }
    function updatePeak(): void {
      let m = 0;
      for (const s of history) m = Math.max(m, Math.abs(s.U));
      if (mode() === 'gen') m = generatorPeak(p.n, p.B, p.A * 1e-4, p.f);
      if (mode() === 'rail') m = Math.max(m, motionalVoltage(p.B, p.l, p.v));
      peak = Math.max(m, 0.02);
    }

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.3, 230, 330));
        const lw = w - pw - 12;
        const sh = Math.round(h * 0.6);
        const mh = Math.round((h - 10) * 0.46);
        return { side, scene: { x: 0, y: 0, w: lw, h: sh }, chart: { x: 0, y: sh + 10, w: lw, h: h - sh - 10 }, meter: { x: lw + 12, y: 0, w: pw, h: mh }, info: { x: lw + 12, y: mh + 10, w: pw, h: h - mh - 10 } };
      }
      const sh = Math.round(h * 0.38);
      const ch = Math.round(h * 0.22);
      const rest = h - sh - ch - 20;
      const mh = Math.round(rest * 0.48);
      return { side, scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 10, w, h: ch }, meter: { x: 0, y: sh + ch + 20, w, h: mh }, info: { x: 0, y: sh + ch + 30 + mh, w, h: rest - mh - 10 } };
    }

    /* ---------- Zeichenhilfen ---------- */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }
    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }
    function richText(str: string, x0: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x0 : align === 'right' ? x0 - total : x0 - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${ctx.theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = halo!;
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');

    function pill(x0: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const xa = align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, xa, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.5);
        g.lineWidth = 1;
        roundRect(g, xa + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, xa + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center');
      return { x: xa, y, w, h };
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hh = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hh * 0.7, y1 - uy * hh * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hh - uy * hh * 0.5, y1 - uy * hh + ux * hh * 0.5);
      g.lineTo(x1 - ux * hh + uy * hh * 0.5, y1 - uy * hh - ux * hh * 0.5);
      g.closePath();
      g.fill();
    }

    function drawRoom(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#172131' : '#f4f7fb');
      bg.addColorStop(1, dark ? '#101824' : '#e1e8f0');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
      const gl = g.createRadialGradient(r.x + r.w * 0.3, r.y, 10, r.x + r.w * 0.3, r.y, r.w * 0.9);
      gl.addColorStop(0, dark ? 'rgba(120,160,220,0.08)' : 'rgba(255,255,255,0.7)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, r.h);
    }

    /** Kupferfarbe (Drahtwindungen). */
    const copper = (k = 0) => (ctx.theme.dark ? mixColor('#d08a4e', '#ffffff', k) : mixColor('#b8692f', '#ffffff', k));
    /** Stärke des Induktionsstroms (0 … 1) für Pfeile und Leuchten. */
    const strength = () => clamp(Math.abs(U) / Math.max(1e-6, meterRange()), 0, 1);

    /* ---------- Versuch 1: Magnet und Spule ---------- */
    let magnetBox: Rect | null = null;
    let rodBox: Rect | null = null;

    function drawMagnetScene(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 440;
      const cy = R.y + R.h * 0.5;
      const k = (R.w * 0.62) / (Z_MAX + MAGNET.length);
      const xc = R.x + R.w * 0.74;
      const cr = clamp(R.h * 0.22, 26, 90);
      const cl = clamp(R.w * 0.2, 70, 170);
      const turns = clamp(Math.round(p.n / 12), 6, 26);
      const faceX = xc - z * k;
      const ml = Math.max(MAGNET.length * k, cl * 0.9);
      const mh = Math.max(18, cr * 0.62);
      const s = strength();
      const sgn = Math.sign(U);
      g.save();
      g.globalAlpha *= ik;
      // Feldlinien des Magneten (bewegen sich mit)
      const la = ease2('linesA', p.lines ? 1 : 0, 6);
      if (la > 0.01) {
        g.save();
        g.globalAlpha *= la * 0.55;
        g.strokeStyle = theme.dark ? 'rgba(170,190,230,0.55)' : 'rgba(80,100,140,0.45)';
        g.lineWidth = 1.2;
        const mx = faceX - ml / 2;
        for (const q of [1, 1.8, 2.8, 4]) {
          for (const sy of [-1, 1]) {
            g.beginPath();
            g.ellipse(mx, cy + sy * mh * 0.32 * q, ml * 0.5 + q * mh * 0.9, mh * 0.32 * q, 0, 0, TAU);
            g.stroke();
          }
        }
        g.restore();
      }
      // Spule: hintere Windungshälften
      const x0 = xc - cl / 2;
      const dx = cl / turns;
      g.lineWidth = sm ? 2.6 : 3.2;
      g.lineCap = 'round';
      for (let i = 0; i <= turns; i++) {
        const xx = x0 + i * dx;
        g.strokeStyle = theme.dark ? '#7a4d2a' : '#8a5426';
        g.beginPath();
        g.ellipse(xx, cy, cr * 0.28, cr, 0, -Math.PI / 2, Math.PI / 2, true);
        g.stroke();
      }
      // Spulenkörper (Kunststoff, durchscheinend)
      g.fillStyle = theme.dark ? 'rgba(120,140,170,0.12)' : 'rgba(180,195,215,0.25)';
      g.fillRect(x0, cy - cr, cl, 2 * cr);
      // Magnet
      const mxL = faceX - ml;
      magnetBox = { x: mxL, y: cy - mh / 2, w: ml, h: mh };
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 4;
      for (const [xa, col] of [
        [mxL, SOUTH],
        [mxL + ml / 2, NORTH],
      ] as const) {
        const mg = g.createLinearGradient(0, cy - mh / 2, 0, cy + mh / 2);
        mg.addColorStop(0, mixColor(col, '#ffffff', 0.35));
        mg.addColorStop(0.5, col);
        mg.addColorStop(1, mixColor(col, '#000000', 0.3));
        g.fillStyle = mg;
        g.fillRect(xa, cy - mh / 2, ml / 2, mh);
      }
      g.restore();
      const hot = hover === 'magnet' || drag === 'magnet';
      if (hot) {
        g.strokeStyle = orange();
        g.lineWidth = 2;
        roundRect(g, mxL - 3, cy - mh / 2 - 3, ml + 6, mh + 6, 4);
        g.stroke();
      }
      richText('S', mxL + ml / 4, cy, sm ? 13 : 16, '#ffffff', 'center', 800);
      richText('N', mxL + (3 * ml) / 4, cy, sm ? 13 : 16, '#ffffff', 'center', 800);
      // Spule: vordere Windungshälften mit Induktionsstrom
      for (let i = 0; i <= turns; i++) {
        const xx = x0 + i * dx;
        const cg = g.createLinearGradient(xx - cr * 0.28, 0, xx + cr * 0.28, 0);
        cg.addColorStop(0, copper(0.25));
        cg.addColorStop(1, copper(-0.1));
        g.strokeStyle = cg;
        g.beginPath();
        g.ellipse(xx, cy, cr * 0.28, cr, 0, -Math.PI / 2, Math.PI / 2, false);
        g.stroke();
      }
      // Stromfluss: helle Punkte wandern auf den vorderen Windungen
      if (s > 0.02) {
        g.fillStyle = theme.dark ? 'rgba(255,240,170,0.95)' : 'rgba(255,214,90,0.95)';
        for (let i = 0; i <= turns; i += 2) {
          const xx = x0 + i * dx;
          for (let q = 0; q < 2; q++) {
            const u = (((flow * sgn + q * 0.5) % 1) + 1) % 1;
            const a = -Math.PI / 2 + Math.PI * u;
            g.globalAlpha = ik * Math.min(1, s * 2.2);
            g.beginPath();
            g.arc(xx + Math.cos(a) * cr * 0.28, cy + Math.sin(a) * cr, sm ? 1.8 : 2.2, 0, TAU);
            g.fill();
          }
        }
        g.globalAlpha = ik;
        // Richtung des Stroms auf der Vorderseite
        const ax = x0 + cl + 12;
        arrowPx(ax, cy + (sgn > 0 ? cr * 0.55 : -cr * 0.55), ax, cy + (sgn > 0 ? -cr * 0.55 : cr * 0.55), withAlpha(orange(), Math.min(1, 0.3 + s)), 2.2, 7);
        richText('I', ax + 7, cy, sm ? 11 : 12, orange(), 'left', 800);
      }
      // induzierter Pol am linken Spulenende (Lenz)
      const pa = ease2('poleA', s > 0.04 ? Math.min(1, s * 2) : 0, 7);
      if (pa > 0.02) {
        const sign = Math.abs(zVel) > 1e-3 ? Math.sign(zVel) : (soft.get('poleSign') ?? 1);
        soft.set('poleSign', sign);
        const pole = sign < 0 ? 'N' : 'S';
        g.save();
        g.globalAlpha *= pa;
        const pcol = pole === 'N' ? NORTH : SOUTH;
        pill(x0 - 4, cy - cr - (sm ? 30 : 34), pole, '#ffffff', 'right', sm ? 12 : 13, pcol);
        if (!sm) richText(ctx.t('lenzPole'), x0 + 2, cy - cr - (sm ? 18 : 22), 10.5, theme.muted, 'left', 650, haloCol());
        // Kraft auf den Magneten (bremst)
        const fy = cy + mh / 2 + (sm ? 14 : 18);
        const fxm = mxL + ml / 2;
        const dir = sign < 0 ? -1 : 1;
        arrowPx(fxm, fy, fxm + dir * (18 + 26 * s), fy, red(), 2.6, 8);
        richText(ctx.t(sign < 0 ? 'repel' : 'attract'), fxm, fy + (sm ? 12 : 14), sm ? 10.5 : 11, red(), 'center', 700, haloCol());
        g.restore();
      }
      // Anschlüsse zum Messgerät
      g.strokeStyle = theme.dark ? '#c9a46a' : '#9a6a2f';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, cy + cr);
      g.lineTo(x0, R.y + R.h - 14);
      g.moveTo(x0 + cl, cy + cr);
      g.lineTo(x0 + cl, R.y + R.h - 14);
      g.stroke();
      // Beschriftung nach links schieben, falls sie sonst am rechten Rand abgeschnitten würde
      const tmLab = `${ctx.t('toMeter')} →`;
      const tmX = Math.min(x0 + cl + 8, R.x + R.w - 8 - richWidth(tmLab, sm ? 10 : 11, 650));
      richText(tmLab, tmX, R.y + R.h - 16, sm ? 10 : 11, theme.muted, 'left', 650, haloCol());
      if (!drag && !p.auto && !ctx.locked) richText(`↔ ${ctx.t('drag')}`, mxL + ml / 2, cy - mh / 2 - 12, sm ? 10.5 : 11, orange(), 'center', 700, haloCol());
      g.restore();
    }

    /* ---------- Versuch 2: Stab auf Schienen ---------- */
    function drawRailScene(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 440;
      const k = (R.w - (sm ? 70 : 100)) / 0.72;
      const xl = R.x + (sm ? 44 : 64);
      const lPx = ease2('lpx', p.l, 8) * k * 0.9;
      const cy = R.y + R.h * 0.54;
      const yT = cy - lPx / 2;
      const yB = cy + lPx / 2;
      const s = strength();
      const sgn = Math.sign(U);
      g.save();
      g.globalAlpha *= ik;
      // Feldbereich mit Kreuzen (B in die Zeichenebene)
      const fx0 = xl + 0.02 * k;
      const fx1 = R.x + R.w - 12;
      const fy0 = R.y + (sm ? 34 : 44);
      const fy1 = R.y + R.h - 12;
      g.fillStyle = theme.dark ? 'rgba(112,72,232,0.10)' : 'rgba(112,72,232,0.06)';
      roundRect(g, fx0, fy0, fx1 - fx0, fy1 - fy0, 8);
      g.fill();
      const la = ease2('linesA', p.lines ? 1 : 0, 6);
      if (la > 0.01) {
        g.save();
        g.globalAlpha *= la * (0.3 + 0.5 * (p.B / 1));
        g.strokeStyle = purple();
        g.lineWidth = 1.3;
        const st = sm ? 26 : 34;
        g.beginPath();
        for (let yy = fy0 + st / 2; yy < fy1; yy += st)
          for (let xx = fx0 + st / 2; xx < fx1; xx += st) {
            g.moveTo(xx - 4, yy - 4);
            g.lineTo(xx + 4, yy + 4);
            g.moveTo(xx + 4, yy - 4);
            g.lineTo(xx - 4, yy + 4);
          }
        g.stroke();
        g.restore();
        richText(ctx.t('intoPage'), fx1 - 6, fy1 - 12, sm ? 10 : 11, purple(), 'right', 700, haloCol());
      }
      // Fläche der Leiterschleife
      const xr = xl + x * k;
      const ag = g.createLinearGradient(xl, 0, xr, 0);
      ag.addColorStop(0, withAlpha(blue(), 0.06));
      ag.addColorStop(1, withAlpha(blue(), 0.2));
      g.fillStyle = ag;
      g.fillRect(xl, yT, xr - xl, yB - yT);
      if (p.val && xr - xl > 70) richText(ctx.t('area'), (xl + xr) / 2, cy, sm ? 11 : 12, blue(), 'center', 750, haloCol());
      // Schienen
      for (const yy of [yT, yB]) {
        const rg = g.createLinearGradient(0, yy - 4, 0, yy + 4);
        rg.addColorStop(0, '#e3e7ec');
        rg.addColorStop(0.5, '#a6aeb9');
        rg.addColorStop(1, '#5b636e');
        g.fillStyle = rg;
        roundRect(g, xl - 6, yy - 4, R.x + R.w - xl - 4, 8, 4);
        g.fill();
      }
      // Messgerät links als Schaltzeichen (V im Kreis)
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(xl - 6, yT);
      g.lineTo(xl - 22, yT);
      g.lineTo(xl - 22, cy - 13);
      g.moveTo(xl - 22, cy + 13);
      g.lineTo(xl - 22, yB);
      g.lineTo(xl - 6, yB);
      g.stroke();
      g.fillStyle = theme.bg;
      g.beginPath();
      g.arc(xl - 22, cy, 13, 0, TAU);
      g.fill();
      g.stroke();
      richText('V', xl - 22, cy + 0.5, 13, theme.text, 'center', 800);
      // Stromfluss im Kreis
      if (s > 0.02) {
        const path: [number, number][] = [
          [xr, yT],
          [xl - 22, yT],
          [xl - 22, yB],
          [xr, yB],
        ];
        // Richtung: U > 0 ⇒ Strom im Stab nach oben (im Bild), außen im Uhrzeigersinn
        const segs: [number, number, number, number][] = [];
        for (let i = 0; i < 4; i++) {
          const a = path[i]!;
          const b = path[(i + 1) % 4]!;
          segs.push([a[0], a[1], b[0], b[1]]);
        }
        const total = segs.reduce((acc, q) => acc + Math.hypot(q[2] - q[0], q[3] - q[1]), 0);
        g.fillStyle = theme.dark ? 'rgba(255,240,170,0.95)' : 'rgba(240,170,30,0.95)';
        const nDots = 22;
        for (let i = 0; i < nDots; i++) {
          let d = ((((i / nDots - flow * sgn * 0.6) % 1) + 1) % 1) * total;
          for (const q of segs) {
            const len = Math.hypot(q[2] - q[0], q[3] - q[1]);
            if (d <= len) {
              const u = d / len;
              g.globalAlpha = ik * Math.min(1, s * 2.2);
              g.beginPath();
              g.arc(q[0] + (q[2] - q[0]) * u, q[1] + (q[3] - q[1]) * u, sm ? 2.2 : 2.6, 0, TAU);
              g.fill();
              break;
            }
            d -= len;
          }
        }
        g.globalAlpha = ik;
        const midY = cy;
        arrowPx(xr + 14, midY + (sgn > 0 ? 18 : -18), xr + 14, midY + (sgn > 0 ? -18 : 18), orange(), 2.4, 7);
        richText('I', xr + 22, midY, sm ? 11 : 12, orange(), 'left', 800, haloCol());
      }
      // Stab
      rodBox = { x: xr - 14, y: yT - 18, w: 28, h: yB - yT + 36 };
      const hot = hover === 'rod' || drag === 'rod';
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const rodG = g.createLinearGradient(xr - 5, 0, xr + 5, 0);
      rodG.addColorStop(0, copper(-0.2));
      rodG.addColorStop(0.5, copper(0.35));
      rodG.addColorStop(1, copper(-0.25));
      g.fillStyle = rodG;
      roundRect(g, xr - 5, yT - 12, 10, yB - yT + 24, 4);
      g.fill();
      g.restore();
      if (hot) {
        g.strokeStyle = orange();
        g.lineWidth = 2;
        roundRect(g, xr - 9, yT - 16, 18, yB - yT + 32, 6);
        g.stroke();
      }
      // v und bremsende Kraft F
      const vv = xVel;
      if (Math.abs(vv) > 0.05) {
        const dir = Math.sign(vv);
        const vy = yT - (sm ? 24 : 30);
        arrowPx(xr, vy, xr + dir * (20 + 10 * Math.abs(vv)), vy, green(), 2.6, 8);
        richText(p.val ? `v = ${fx(Math.abs(vv), 1)} m/s` : 'v', xr + dir * (24 + 10 * Math.abs(vv)), vy, sm ? 10.5 : 11.5, green(), dir > 0 ? 'left' : 'right', 750, haloCol());
        const Fv = brakingForce(p.B, current(U, R_RAIL), p.l);
        const fy = yB + (sm ? 24 : 30);
        arrowPx(xr, fy, xr - dir * (18 + Math.min(70, 1200 * Math.abs(Fv))), fy, red(), 2.6, 8);
        richText(p.val ? `F = ${fx(Math.abs(Fv), 3)} N` : 'F', xr - dir * (22 + Math.min(70, 1200 * Math.abs(Fv))), fy, sm ? 10.5 : 11.5, red(), dir > 0 ? 'right' : 'left', 750, haloCol());
      }
      // Maß l
      if (p.val) richText(`l = ${fx(p.l, 2)} m`, xr + 10, yB - 12, sm ? 10.5 : 11, theme.muted, 'left', 650, haloCol());
      if (!drag && !p.auto && !ctx.locked) richText(`↔ ${ctx.t('dragRod')}`, xr, yT - 46, sm ? 10.5 : 11, orange(), 'center', 700, haloCol());
      g.restore();
    }

    /* ---------- Versuch 3: Generator ---------- */
    function drawGenScene(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 440;
      const cx = R.x + R.w * 0.5;
      const cy = R.y + R.h * 0.5 - 4;
      const H = R.h * 0.42;
      const Wl = Math.min(R.w * 0.18, H * 0.75) * Math.sqrt(p.A / 100) * 0.85;
      const poleW = Math.max(40, R.w * 0.12);
      const gap = Math.min(R.w * 0.36, Wl + 40);
      g.save();
      g.globalAlpha *= ik;
      // Feldlinien von N nach S
      const la = ease2('linesA', p.lines ? 1 : 0, 6);
      if (la > 0.01) {
        g.save();
        g.globalAlpha *= la * (0.35 + 0.5 * p.B);
        for (let i = -3; i <= 3; i++) {
          const yy = cy + (i * H) / 3.6;
          g.setLineDash([6, 5]);
          arrowPx(cx - gap + 2, yy, cx + gap - 4, yy, purple(), 1.3, 6);
        }
        g.setLineDash([]);
        g.restore();
      }
      // Polschuhe
      for (const [side, col, lab] of [
        [-1, NORTH, 'N'],
        [1, SOUTH, 'S'],
      ] as const) {
        const xa = side < 0 ? cx - gap - poleW : cx + gap;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = 12;
        g.shadowOffsetY = 4;
        const pg = g.createLinearGradient(xa, 0, xa + poleW, 0);
        pg.addColorStop(0, mixColor(col, '#000000', side < 0 ? 0.3 : 0));
        pg.addColorStop(1, mixColor(col, '#000000', side < 0 ? 0 : 0.3));
        g.fillStyle = pg;
        roundRect(g, xa, cy - H * 1.05, poleW, H * 2.1, 6);
        g.fill();
        g.restore();
        richText(lab, xa + poleW / 2, cy, sm ? 18 : 22, '#ffffff', 'center', 800);
      }
      // rotierende Spule: senkrechte Achse, Projektion der Breite ∝ cos φ (Blick von vorn)
      const c = Math.cos(phi);
      const sn = Math.sin(phi);
      const xa = cx - Wl * c;
      const xb = cx + Wl * c;
      const depth = 0.18;
      const ya = -Wl * sn * depth;
      const yb = Wl * sn * depth;
      const s = strength();
      // Achse und Schleifringe
      g.strokeStyle = theme.dark ? '#9aa3af' : '#6b7480';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(cx, cy - H - 18);
      g.lineTo(cx, cy + H + 34);
      g.stroke();
      for (const k of [0, 1]) {
        const ry = cy + H + 14 + k * 12;
        g.fillStyle = copper(0.1 - k * 0.15);
        g.beginPath();
        g.ellipse(cx, ry, 14, 4.5, 0, 0, TAU);
        g.fill();
      }
      // Bürsten und Leitungen
      g.fillStyle = theme.dark ? '#3a3f47' : '#2b3038';
      g.fillRect(cx + 15, cy + H + 10, 10, 7);
      g.fillRect(cx - 25, cy + H + 22, 10, 7);
      g.strokeStyle = theme.dark ? '#c9a46a' : '#9a6a2f';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx + 25, cy + H + 13);
      g.lineTo(R.x + R.w - 16, cy + H + 13);
      g.moveTo(cx - 25, cy + H + 25);
      g.lineTo(cx - 40, cy + H + 25);
      g.lineTo(cx - 40, R.y + R.h - 10);
      g.lineTo(R.x + R.w - 16, R.y + R.h - 10);
      g.stroke();
      richText(`${ctx.t('toMeter')} →`, R.x + R.w - 18, R.y + R.h - 22, sm ? 10 : 11, theme.muted, 'right', 650, haloCol());
      // Spulenfläche (Fluss: Feld durch die Fläche ∝ |cos φ|)
      g.fillStyle = withAlpha(blue(), 0.1 + 0.18 * Math.abs(c));
      g.beginPath();
      g.moveTo(xa, cy - H + ya);
      g.lineTo(xb, cy - H + yb);
      g.lineTo(xb, cy + H + yb);
      g.lineTo(xa, cy + H + ya);
      g.closePath();
      g.fill();
      // Spulenrahmen: vordere Kante heller (die Seite mit z > 0)
      const front = sn >= 0 ? 'b' : 'a';
      for (const side of ['a', 'b'] as const) {
        const xx = side === 'a' ? xa : xb;
        const yy = side === 'a' ? ya : yb;
        const near = side === front;
        g.strokeStyle = copper(near ? 0.25 : -0.25);
        g.lineWidth = near ? 7 : 5;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(xx, cy - H + yy);
        g.lineTo(xx, cy + H + yy);
        g.stroke();
      }
      g.strokeStyle = copper(0.05);
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(xa, cy - H + ya);
      g.lineTo(xb, cy - H + yb);
      g.moveTo(xa, cy + H + ya);
      g.lineTo(xb, cy + H + yb);
      g.stroke();
      // Strom in den Seiten (Punkte wandern)
      if (s > 0.02) {
        g.fillStyle = theme.dark ? 'rgba(255,240,170,0.95)' : 'rgba(240,170,30,0.95)';
        for (let i = 0; i < 6; i++) {
          const u = ((((i / 6 + flow * Math.sign(U) * 0.4) % 1) + 1) % 1) * 2 - 1;
          g.globalAlpha = ik * Math.min(1, s * 2);
          g.beginPath();
          g.arc(xa, cy + u * H + ya, 2.6, 0, TAU);
          g.arc(xb, cy - u * H + yb, 2.6, 0, TAU);
          g.fill();
        }
        g.globalAlpha = ik;
      }
      // Normalenvektor der Spulenfläche und Winkel φ zum Feld
      const nx = Math.cos(phi);
      const nl = Math.min(56, gap * 0.7);
      arrowPx(cx, cy, cx + nx * nl, cy + sn * nl * depth * 2.5, orange(), 2.4, 8);
      if (p.val) {
        const deg = (((phi * 180) / Math.PI) % 360 + 360) % 360;
        pill(cx + 8, cy + 10, `φ = ${n(Math.round(deg), 0)}°`, orange(), 'left', sm ? 10.5 : 11.5);
      }
      pill(R.x + R.w - 12, R.y + 12, ctx.t('slow'), purple(), 'right', sm ? 10.5 : 11.5);
      g.restore();
    }

    function drawScene(R: Rect): void {
      const g = surface.g;
      const ik = stage(0, 0.5);
      g.save();
      g.beginPath();
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.clip();
      drawRoom(R);
      const a = swap.running ? swap.value : 1;
      g.globalAlpha = a;
      g.translate(0, (1 - a) * 10);
      if (mode() === 'magnet') drawMagnetScene(R, ik);
      else if (mode() === 'rail') drawRailScene(R, ik);
      else drawGenScene(R, ik);
      g.restore();
      const title = mode() === 'magnet' ? 'tMagnet' : mode() === 'rail' ? (R.w < 480 ? 'tRailS' : 'tRail') : 'tGen';
      richText(ctx.t(title), R.x + 14, R.y + (R.w < 440 ? 16 : 19), R.w < 440 ? 12 : 13, ctx.theme.text, 'left', 750, haloCol());
    }

    /* ---------- Spannungsmesser (Nullpunkt in der Mitte) ---------- */
    function drawMeter(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 300 || R.h < 170;
      richText(ctx.t('meter'), R.x + 14, R.y + (sm ? 16 : 19), sm ? 12 : 13, theme.text, 'left', 750);
      const range = ease2('range', meterRange(), 6);
      const rangeLab = meterRange();
      // flache Karte (Handy): Skala links, Werte rechts
      const compact = R.w > R.h * 1.8;
      const dialW = compact ? R.w * 0.55 : R.w;
      const cx = R.x + dialW / 2;
      const top = R.y + (sm ? 30 : 38);
      const bottomSpace = compact ? 10 : sm ? 40 : 48;
      const rad = Math.min((dialW - 44) / 2, (R.y + R.h - top - bottomSpace - 14) / 1.0);
      const cy = top + rad + 8;
      if (rad > 18) {
        const span = 0.95;
        const face = g.createLinearGradient(0, cy - rad, 0, cy);
        face.addColorStop(0, '#fffdf6');
        face.addColorStop(1, '#efe9d8');
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.15)';
        g.shadowBlur = 8;
        g.shadowOffsetY = 2;
        g.fillStyle = face;
        roundRect(g, cx - rad - 14, cy - rad - 8, 2 * rad + 28, rad + 18, 10);
        g.fill();
        g.restore();
        const ink = '#2a2a2a';
        g.strokeStyle = ink;
        g.lineWidth = 1.2;
        g.beginPath();
        g.arc(cx, cy, rad * 0.86, -Math.PI / 2 - span, -Math.PI / 2 + span);
        g.stroke();
        const labelled = rad > 55 ? [-10, -5, 0, 5, 10] : [-10, 0, 10];
        for (let i = -10; i <= 10; i++) {
          const a = -Math.PI / 2 + (i / 10) * span;
          const big = i % 5 === 0;
          g.lineWidth = big ? 1.4 : 0.8;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * rad * 0.86, cy + Math.sin(a) * rad * 0.86);
          g.lineTo(cx + Math.cos(a) * rad * (big ? 0.72 : 0.78), cy + Math.sin(a) * rad * (big ? 0.72 : 0.78));
          g.stroke();
          if (labelled.includes(i)) {
            const v = (i / 10) * rangeLab;
            const lab = v === 0 ? '0' : `${v < 0 ? '−' : ''}${n(Math.abs(v), rangeLab < 0.1 ? 3 : rangeLab < 1 ? 2 : 1)}`;
            g.font = `600 ${clamp(rad * 0.15, 9, 11)}px ${theme.font}`;
            g.fillStyle = ink;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(lab, cx + Math.cos(a) * rad * 0.56, cy + Math.sin(a) * rad * 0.56);
          }
        }
        g.font = `800 ${clamp(rad * 0.2, 10, 15)}px ${theme.font}`;
        g.fillStyle = '#1d4f91';
        g.textAlign = 'center';
        g.fillText('V', cx + rad * 0.82, cy - 2);
        const f = clamp(ease2('needle', U, 14) / range, -1.06, 1.06);
        const a = -Math.PI / 2 + f * span;
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.3)';
        g.shadowBlur = 2;
        g.shadowOffsetX = 1;
        g.shadowOffsetY = 1.5;
        g.strokeStyle = '#c62828';
        g.lineWidth = 1.8;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(a) * rad * 0.92, cy + Math.sin(a) * rad * 0.92);
        g.stroke();
        g.restore();
        g.fillStyle = '#4a525d';
        g.beginPath();
        g.arc(cx, cy, 4, 0, TAU);
        g.fill();
      }
      // Digitalwert und Messbereich
      const val = p.val ? `U = ${fx(U, Math.abs(U) < 1 ? 3 : 2)} V` : 'U = ?';
      const rl = `${ctx.t('rangeLab')} ± ${n(rangeLab, rangeLab < 0.1 ? 2 : rangeLab < 1 ? 1 : 0)} V`;
      if (compact) {
        const tx = R.x + dialW + (R.w - dialW) / 2 - 6;
        richText(val, tx, R.y + R.h * 0.5, sm ? 14 : 16, U >= 0 ? blue() : red(), 'center', 800);
        richText(rl, tx, R.y + R.h * 0.5 + (sm ? 20 : 24), sm ? 10 : 11, theme.muted, 'center', 600);
      } else {
        richText(val, cx, R.y + R.h - (sm ? 30 : 36), sm ? 13 : 15, U >= 0 ? blue() : red(), 'center', 800);
        richText(rl, cx, R.y + R.h - (sm ? 13 : 16), sm ? 10 : 11, theme.muted, 'center', 600);
      }
      g.restore();
    }

    /* ---------- Diagramm U(t) ---------- */
    function drawChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 14);
      card(R);
      const sm = R.w < 440 || R.h < 160;
      const fs = sm ? 10.5 : 11.5;
      richText(ctx.t('chart'), R.x + 14, R.y + (sm ? 16 : 19), sm ? 12 : 13, theme.text, 'left', 750);
      const padL = sm ? 40 : 48;
      const A: Rect = { x: R.x + padL, y: R.y + (sm ? 30 : 36), w: R.w - padL - (sm ? 14 : 18), h: R.h - (sm ? 30 : 36) - (sm ? 22 : 26) };
      if (A.w < 60 || A.h < 30) {
        g.restore();
        return;
      }
      const range = ease2('rangeC', meterRange(), 6);
      const w = window();
      const t1 = t;
      const t0 = t1 - w;
      const X = (tt: number) => A.x + ((tt - t0) / w) * A.w;
      const Y = (u: number) => A.y + A.h / 2 - (u / range) * (A.h / 2);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (const q of [-1, -0.5, 0.5, 1]) {
        g.moveTo(A.x, Math.round(Y(q * range)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(q * range)) + 0.5);
      }
      const ts = mode() === 'gen' ? (w > 3 ? 1 : w > 1 ? 0.2 : 0.1) : 1;
      for (let tt = Math.ceil(t0 / ts) * ts; tt <= t1; tt += ts) {
        g.moveTo(Math.round(X(tt)) + 0.5, A.y);
        g.lineTo(Math.round(X(tt)) + 0.5, A.y + A.h);
      }
      g.stroke();
      const dec = range < 0.1 ? 3 : range < 1 ? 2 : 1;
      for (const q of [-1, 0, 1]) {
        const v = q * range;
        richText(v === 0 ? '0' : `${v < 0 ? '−' : ''}${n(Math.abs(v), dec)}`, A.x - 6, Y(v), fs, theme.muted, 'right', 500);
      }
      const ul = ctx.t('axisU');
      richText(ul, R.x + R.w - (sm ? 14 : 18), R.y + (sm ? 16 : 19), fs, theme.muted, 'right', 600);
      const xt = ctx.t('axisT');
      const xtw = richWidth(xt, fs, 600);
      for (let tt = Math.ceil(t0 / ts) * ts; tt <= t1; tt += ts) {
        const xx = X(tt);
        if (xx > A.x + A.w - xtw - 14 || xx < A.x + 8) continue;
        richText(n(tt, ts < 1 ? 1 : 0), xx, A.y + A.h + 11, fs, theme.muted, 'center', 500);
      }
      richText(xt, A.x + A.w, A.y + A.h + 11, fs, theme.muted, 'right', 600);
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x, Y(0) + 0.5);
      g.lineTo(A.x + A.w, Y(0) + 0.5);
      g.moveTo(A.x + 0.5, A.y);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.stroke();
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 2, A.w + 2, A.h + 4);
      g.clip();
      if (mode() === 'gen') {
        // Fluss (skaliert) gestrichelt: U ist am größten, wo Φ sich am schnellsten ändert
        g.strokeStyle = withAlpha(purple(), 0.75);
        g.lineWidth = 1.6;
        g.setLineDash([5, 4]);
        g.beginPath();
        history.forEach((q, i) => (i ? g.lineTo(X(q.t), Y(q.f * range * 0.85)) : g.moveTo(X(q.t), Y(q.f * range * 0.85))));
        g.stroke();
        g.setLineDash([]);
        if (!sm) richText(ctx.t('fluxLab'), A.x + 8, A.y + 9, fs - 0.5, purple(), 'left', 700, haloCol());

      }
      g.strokeStyle = blue();
      g.lineWidth = sm ? 2.2 : 2.6;
      g.lineJoin = 'round';
      g.beginPath();
      history.forEach((q, i) => (i ? g.lineTo(X(q.t), Y(q.U)) : g.moveTo(X(q.t), Y(q.U))));
      g.stroke();
      g.restore();
      if (history.length) {
        g.fillStyle = blue();
        g.beginPath();
        g.arc(X(t), Y(U), 4.5, 0, TAU);
        g.fill();
      }
      // Scheitelwert beim Generator
      if (mode() === 'gen' && p.val) {
        const Up = generatorPeak(p.n, p.B, p.A * 1e-4, p.f);
        g.strokeStyle = withAlpha(orange(), 0.7);
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(A.x, Y(Up) + 0.5);
        g.lineTo(A.x + A.w, Y(Up) + 0.5);
        g.stroke();
        g.setLineDash([]);
        richText(`Û = ${fx(Up, 2)} V`, A.x + A.w - 4, Y(Up) - 9, fs, orange(), 'right', 750, haloCol());
      }
      g.restore();
    }

    /* ---------- Karte „Rechnung“ ---------- */
    function drawInfo(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      richText(ctx.t('infoTitle'), R.x + pad, R.y + (sm ? 16 : 19), sm ? 12 : 13, theme.text, 'left', 750);
      const v = p.val;
      let rows: [string, string][];
      if (mode() === 'magnet') {
        rows = [
          ['U_[ind] = −n · ΔΦ / Δt', theme.text],
          [`n = ${n(p.n, 0)}, A ≈ ${fx(COIL_AREA * 1e4, 1)} cm²`, theme.muted],
          [`n · Φ = ${v ? fx(coilLinkage(z, p.n) * 1000, 2) : '?'} mWb`, purple()],
          [`U = ${v ? fx(U, 3) : '?'} V`, blue()],
        ];
      } else if (mode() === 'rail') {
        const Uc = motionalVoltage(p.B, p.l, p.v);
        rows = [
          ['U = B · l · v', theme.text],
          [`= ${fx(p.B, 2)} T · ${fx(p.l, 2)} m · ${fx(p.v, 1)} m/s`, theme.muted],
          [`= ${v ? fx(Uc, 3) : '?'} V`, blue()],
          [`I = U / R = ${v ? fx(current(Uc, R_RAIL), 3) : '?'} A (R = 2 Ω)`, orange()],
        ];
      } else {
        const Up = generatorPeak(p.n, p.B, p.A * 1e-4, p.f);
        rows = [
          ['Û = n · B · A · ω', theme.text],
          [`= ${n(p.n, 0)} · ${fx(p.B, 2)} T · ${fx(p.A * 1e-4, 4)} m² · ${fx(TAU * p.f, 1)} 1/s`, theme.muted],
          [`= ${v ? fx(Up, 2) : '?'} V`, blue()],
          [`U_[eff] = Û / √2 = ${v ? fx(rms(Up), 2) : '?'} V`, orange()],
        ];
      }
      const top = R.y + (sm ? 30 : 38);
      const lh = clamp((R.y + R.h - top - (sm ? 8 : 12)) / rows.length, 15, sm ? 22 : 28);
      let y = top + lh / 2;
      for (const [txt, col] of rows) {
        let s = clamp(lh * 0.56, 10.5, sm ? 13 : 14.5);
        while (s > 10 && richWidth(txt, s, 700) > R.w - 2 * pad) s -= 0.5;
        richText(txt, R.x + pad, y, s, col, 'left', 700);
        y += lh;
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    let lastNow = '';
    function updateNow(): void {
      const s = tr('now', { t: fx(t, 2), U: fx(U, Math.abs(U) < 1 ? 3 : 2) });
      if (s !== lastNow) {
        lastNow = s;
        ctx.readout('now', { html: s });
      }
      let lenz: string;
      if (mode() === 'magnet') {
        if (Math.abs(zVel) < 0.01) lenz = ctx.t('lenzStill');
        else lenz = tr(zVel < 0 ? 'lenzIn' : 'lenzOut', { p: zVel < 0 ? 'N' : 'S' });
      } else lenz = ctx.t(mode() === 'rail' ? 'lenzRail' : 'lenzGen');
      if (lenz !== lastLenz) {
        lastLenz = lenz;
        ctx.readout('lenz', { html: lenz });
      }
    }
    let lastLenz = '';

    function updateReadouts(): void {
      ctx.readout('law', { html: ctx.t('law') });
      if (mode() === 'magnet') ctx.readout('calc', { html: tr('calcMagnet', { n: n(p.n, 0), A: fx(COIL_AREA * 1e4, 1) }) });
      else if (mode() === 'rail') {
        const Uc = motionalVoltage(p.B, p.l, p.v);
        const I = current(Uc, R_RAIL);
        ctx.readout('calc', { html: tr('calcRail', { B: fx(p.B, 2), l: fx(p.l, 2), v: fx(p.v, 1), U: fx(Uc, 3), I: fx(I, 3), F: fx(brakingForce(p.B, I, p.l), 4) }) });
      } else {
        const Up = generatorPeak(p.n, p.B, p.A * 1e-4, p.f);
        ctx.readout('calc', { html: tr('calcGen', { n: n(p.n, 0), B: fx(p.B, 2), A: fx(p.A * 1e-4, 4), w: fx(TAU * p.f, 2), U: fx(Up, 2), f: fx(p.f, 1), T: fx(1 / p.f, 3), Ue: fx(rms(Up), 2) }) });
      }
      lastLenz = '';
      lastNow = '';
      updateNow();
    }

    /* ---------- Ziehen von Magnet und Stab ---------- */
    let lastScene: Rect | null = null;
    function hitObj(px: number, py: number): 'magnet' | 'rod' | null {
      if (ctx.locked) return null;
      const inBox = (b: Rect | null) => !!b && px >= b.x - 6 && px <= b.x + b.w + 6 && py >= b.y - 6 && py <= b.y + b.h + 6;
      if (mode() === 'magnet' && inBox(magnetBox)) return 'magnet';
      if (mode() === 'rail' && inBox(rodBox)) return 'rod';
      return null;
    }
    let grabDx = 0;
    function dragTo(px: number): void {
      const R = lastScene;
      if (!R) return;
      if (drag === 'magnet') {
        const k = (R.w * 0.62) / (Z_MAX + MAGNET.length);
        const xc = R.x + R.w * 0.74;
        zTarget = clamp((xc - (px - grabDx)) / k, Z_MIN, Z_MAX);
      } else if (drag === 'rod') {
        const sm = R.w < 440;
        const k = (R.w - (sm ? 70 : 100)) / 0.72;
        const xl = R.x + (sm ? 44 : 64);
        xTarget = clamp((px - grabDx - xl) / k, X_MIN, X_MAX);
      }
      if (!ctx.clock.playing) ctx.clock.play();
    }
    surface.addTarget({
      contains: (px: number, py: number) => hitObj(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const h = hitObj(q.px, q.py);
        if (!h) return false;
        drag = h;
        if (p.auto) ctx.set({ auto: false });
        const R = lastScene!;
        if (h === 'magnet') {
          const k = (R.w * 0.62) / (Z_MAX + MAGNET.length);
          grabDx = q.px - (R.x + R.w * 0.74 - z * k);
          zTarget = z;
        } else {
          const sm = R.w < 440;
          const k = (R.w - (sm ? 70 : 100)) / 0.72;
          grabDx = q.px - (R.x + (sm ? 44 : 64) + x * k);
          xTarget = x;
        }
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (drag) dragTo(q.px);
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitObj(q.px, q.py) : null;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'init') {
          intro.play();
          resetState();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        }
        if (changed.has('mode') && source !== 'init') {
          resetState();
          swap.play();
        }
        if (source === 'replace') {
          resetState();
          if (!prefersReducedMotion()) ctx.clock.play();
        }
        if (mode() === 'gen' || (changed.has('B') || changed.has('n') || changed.has('A') || changed.has('f') || changed.has('l') || changed.has('v'))) updatePeak();
        if (!ctx.clock.playing) {
          // ohne laufende Uhr: Zustand für ein ruhiges Standbild (Generator bei 90°, Stab in Bewegung)
          if (mode() === 'gen' && t === 0) phi = Math.PI / 3;
          U = voltageNow();
        }
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        const h = Math.min(dt, 0.05);
        // feine Schritte für glatte Kurven
        const nSteps = Math.max(1, Math.ceil(h / 0.008));
        for (let i = 0; i < nSteps; i++) step(h / nSteps);
        updatePeak();
        updateNow();
      },

      resetTime() {
        resetState();
        updateReadouts();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        const lay = computeLayout();
        lastScene = lay.scene;
        surface.begin();
        drawScene(lay.scene);
        drawChart(lay.chart, stage(0.2, 0.5));
        drawMeter(lay.meter, stage(0.15, 0.5));
        drawInfo(lay.info, stage(0.3, 0.5));
        if (animating || intro.running || swap.running || drag || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
