import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import {
  ANODES,
  braggLambda,
  comptonLambda,
  HC,
  lambdaMin,
  lambdaOf,
  LAMBDA_C,
  lineStrength,
  moseleyKa,
  recoilAngle,
  spectrum,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;
const L_MIN = 20;
const L_MAX = 200;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Röntgenstrahlung: Röhre mit Drehkristall (Bremsspektrum, Linien,
 * Bragg-Reflexion) und Compton-Streuung an einem Elektron.
 */
export default defineSimulation({
  id: 'roentgen',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'roehre', label: L('Röntgenröhre und Spektrum', 'X-ray tube and spectrum') },
        { value: 'compton', label: L('Compton-Effekt', 'Compton effect') },
      ],
      default: 'roehre',
      display: 'buttons',
    },
    {
      key: 'anode',
      type: 'choice',
      label: L('Anode', 'Anode'),
      options: [
        { value: 'cu', label: L('Kupfer', 'copper') },
        { value: 'mo', label: L('Molybdän', 'molybdenum') },
      ],
      default: 'mo',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'roehre',
    },
    { key: 'U', type: 'number', label: L('Beschleunigungsspannung', 'Accelerating voltage'), min: 5, max: 35, step: 0.5, default: 30, unit: 'kV', visibleIf: (v) => v.mode === 'roehre' },
    { key: 'th', type: 'number', label: L('Glanzwinkel am Kristall (LiF)', 'Glancing angle at the crystal (LiF)'), min: 3, max: 30, step: 0.1, default: 10, unit: '°', visibleIf: (v) => v.mode === 'roehre' },
    { key: 'l0', type: 'number', label: L('Wellenlänge vor dem Stoß', 'Wavelength before the collision'), min: 5, max: 100, step: 1, default: 20, unit: 'pm', visibleIf: (v) => v.mode === 'compton' },
    { key: 'phi', type: 'number', label: L('Streuwinkel', 'Scattering angle'), min: 0, max: 180, step: 1, default: 90, unit: '°', visibleIf: (v) => v.mode === 'compton' },
  ],
  hint: (v) =>
    v.mode === 'compton'
      ? L('Je weiter das Photon abgelenkt wird, desto mehr Energie gibt es an das Elektron ab – seine Wellenlänge wird länger.', 'The more the photon is deflected, the more energy it gives to the electron – its wavelength gets longer.')
      : L('Drehe den Kristall: Jeder Glanzwinkel lässt nur eine Wellenlänge zum Zählrohr durch. So wird das Spektrum gemessen.', 'Turn the crystal: each glancing angle lets only one wavelength through to the detector. This is how the spectrum is measured.'),
  readouts: [
    { key: 'lmin', label: L('Kürzeste Wellenlänge', 'Shortest wavelength') },
    { key: 'lines', label: L('Kα-Linie', 'Kα line'), spoiler: true },
    { key: 'bragg', label: L('Am Zählrohr', 'At the detector') },
    { key: 'dl', label: L('Verschiebung', 'Shift'), spoiler: true },
    { key: 'lp', label: L('Wellenlänge nach dem Stoß', 'Wavelength after the collision') },
    { key: 'Ee', label: L('Energie des Elektrons', 'Energy of the electron'), spoiler: true },
  ],
  presets: [
    { id: 'mo', label: L('Molybdän, 30 kV', 'Molybdenum, 30 kV'), values: { mode: 'roehre', anode: 'mo', U: 30, th: 10 } },
    { id: 'cu', label: L('Kupfer, 25 kV', 'Copper, 25 kV'), values: { mode: 'roehre', anode: 'cu', U: 25, th: 22.5 } },
    { id: 'schwelle', label: L('Molybdän unter der Schwelle', 'Molybdenum below threshold'), values: { mode: 'roehre', anode: 'mo', U: 18, th: 10 } },
    { id: 'compton', label: L('Compton, 90°', 'Compton, 90°'), values: { mode: 'compton', l0: 20, phi: 90 } },
    { id: 'rueck', label: L('Compton, Rückstreuung', 'Compton, backscattering'), values: { mode: 'compton', l0: 10, phi: 180 } },
  ],
  strings: {
    de: {
      canvasR: 'Röntgenröhre mit Glühkathode und Anode; die Strahlung trifft einen drehbaren Kristall, das Zählrohr steht unter dem doppelten Winkel; daneben das gemessene Spektrum über der Wellenlänge',
      canvasC: 'Ein Röntgenphoton trifft ein ruhendes Elektron, wird abgelenkt und hat danach eine größere Wellenlänge; das Elektron fliegt schräg weg; daneben die Wellenlänge nach dem Stoß über dem Streuwinkel',
      lminVal: 'λ<sub>min</sub> = h·c/(e·U) ≈ {l} pm',
      linesVal: '{l} pm ({E} keV); Moseley: {M} keV',
      linesOff: 'keine Linien: U liegt unter der K-Schwelle ({K} kV)',
      braggVal: 'θ = {t}° → λ = 2d·sin θ ≈ {l} pm',
      braggVal0: 'θ = {t}° → λ ≈ {l} pm (unterhalb λ<sub>min</sub>: nichts)',
      dlVal: 'Δλ = λ<sub>C</sub>·(1 − cos φ) ≈ {d} pm',
      lpVal: "λ' ≈ {l} pm",
      EeVal: 'E ≈ {E} keV (Photon vorher {E0} keV)',
      tube: 'Röntgenröhre',
      cathode: 'Kathode',
      anode: 'Anode',
      crystal: 'Kristall',
      counter: 'Zählrohr',
      lamAx: 'λ in pm',
      IAx: 'Zählrate',
      lpAx: "λ' in pm",
      phiAx: 'φ in °',
      e: 'Elektron',
      before: 'λ',
      after: "λ'",
    },
    en: {
      canvasR: 'X-ray tube with hot cathode and anode; the radiation hits a rotatable crystal, the detector sits at twice the angle; next to it the measured spectrum against wavelength',
      canvasC: 'An X-ray photon hits an electron at rest, is deflected and then has a longer wavelength; the electron flies off at an angle; next to it the wavelength after the collision against scattering angle',
      lminVal: 'λ<sub>min</sub> = h·c/(e·U) ≈ {l} pm',
      linesVal: '{l} pm ({E} keV); Moseley: {M} keV',
      linesOff: 'no lines: U is below the K threshold ({K} kV)',
      braggVal: 'θ = {t}° → λ = 2d·sin θ ≈ {l} pm',
      braggVal0: 'θ = {t}° → λ ≈ {l} pm (below λ<sub>min</sub>: nothing)',
      dlVal: 'Δλ = λ<sub>C</sub>·(1 − cos φ) ≈ {d} pm',
      lpVal: "λ' ≈ {l} pm",
      EeVal: 'E ≈ {E} keV (photon before {E0} keV)',
      tube: 'X-ray tube',
      cathode: 'cathode',
      anode: 'anode',
      crystal: 'crystal',
      counter: 'detector',
      lamAx: 'λ in pm',
      IAx: 'count rate',
      lpAx: "λ' in pm",
      phiAx: 'φ in °',
      e: 'electron',
      before: 'λ',
      after: "λ'",
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasR'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [L_MIN, L_MAX],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });
    let t = 0;
    const anode = () => ANODES[p.anode]!;
    /** Größter Wert des Spektrums bei 35 kV: feste Achse je Anode. */
    const yTop = () => {
      let m = 0;
      for (let l = L_MIN; l <= L_MAX; l += 0.25) m = Math.max(m, spectrum(l, 35, anode()));
      return m * 1.1;
    };

    function updateReadouts(): void {
      const show: Record<string, string | { html: string } | null> = {};
      if (p.mode === 'roehre') {
        const a = anode();
        show.lmin = { html: tr('lminVal', { l: fmt.num(lambdaMin(p.U), 1) }) };
        show.lines = lineStrength(p.U, a) > 0 ? tr('linesVal', { l: fmt.num(lambdaOf(a.Ka), 1), E: fmt.num(a.Ka, 2), M: fmt.num(moseleyKa(a.Z), 2) }) : tr('linesOff', { K: fmt.num(a.K, 1) });
        const lb = braggLambda(p.th);
        show.bragg = { html: tr(lb < lambdaMin(p.U) ? 'braggVal0' : 'braggVal', { t: fmt.num(p.th, 1), l: fmt.num(lb, 1) }) };
      } else {
        const l2 = comptonLambda(p.l0, p.phi);
        show.dl = { html: tr('dlVal', { d: fmt.num(l2 - p.l0, 2) }) };
        show.lp = tr('lpVal', { l: fmt.num(l2, 2) });
        show.Ee = tr('EeVal', { E: fmt.num(HC / p.l0 - HC / l2, 2), E0: fmt.num(HC / p.l0, 1) });
      }
      for (const k of ['lmin', 'lines', 'bragg', 'dl', 'lp', 'Ee']) ctx.readout(k, show[k] ?? null);
    }

    /* ---------------- Röhre mit Drehkristall ---------------- */
    function drawTube(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cy = r.y + r.h * 0.66;
      const tubeL = r.x + 10;
      const tubeR = r.x + r.w * 0.36;
      const tubeH = Math.min(r.h * 0.26, 70);
      const C: [number, number] = [r.x + r.w * 0.6, cy];
      const arm = Math.min(r.w * 0.36, r.h * 0.6);
      // Röhre
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.fillStyle = withAlpha(th.muted, 0.1);
      g.beginPath();
      g.ellipse((tubeL + tubeR) / 2, cy, (tubeR - tubeL) / 2, tubeH / 2, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      // Kathode (Glühwendel)
      const kx = tubeL + 14;
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 2;
      g.beginPath();
      for (let i = 0; i <= 12; i++) {
        const y = cy - 10 + (i / 12) * 20;
        const x = kx + (i % 2 ? 4 : -4);
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      // Anode (schräg)
      const ax = tubeR - 14;
      g.fillStyle = th.text;
      g.beginPath();
      g.moveTo(ax - 6, cy - 14);
      g.lineTo(ax + 8, cy - 14);
      g.lineTo(ax + 8, cy + 14);
      g.lineTo(ax + 6, cy + 14);
      g.closePath();
      g.fill();
      // Elektronen
      g.fillStyle = th.series[0]!;
      const n = 6;
      for (let i = 0; i < n; i++) {
        const u = ((t * (0.4 + p.U / 40) + i / n) % 1) ** 1.6;
        g.beginPath();
        g.arc(kx + 6 + u * (ax - kx - 14), cy + ((i % 3) - 1) * 3, 2.2, 0, Math.PI * 2);
        g.fill();
      }
      // Strahl zum Kristall
      const beam = withAlpha(th.series[1]!, 0.7);
      g.strokeStyle = beam;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(ax + 8, cy);
      g.lineTo(C[0], C[1]);
      g.stroke();
      // Kristall, um θ gedreht
      const half = Math.min(36, r.w * 0.08);
      const a = -p.th * DEG;
      g.strokeStyle = th.text;
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(C[0] - half * Math.cos(a), C[1] - half * Math.sin(a));
      g.lineTo(C[0] + half * Math.cos(a), C[1] + half * Math.sin(a));
      g.stroke();
      // reflektierter Strahl zum Zählrohr
      const D: [number, number] = [C[0] + arm * Math.cos(2 * p.th * DEG), C[1] - arm * Math.sin(2 * p.th * DEG)];
      const I = spectrum(braggLambda(p.th), p.U, anode()) / yTop();
      g.strokeStyle = withAlpha(th.series[1]!, 0.1 + 0.9 * Math.min(1, I * 1.5));
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(C[0], C[1]);
      g.lineTo(D[0], D[1]);
      g.stroke();
      // geradeaus weiter (schwach)
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(C[0], C[1]);
      g.lineTo(C[0] + arm, C[1]);
      g.stroke();
      g.setLineDash([]);
      // Zählrohr
      g.save();
      g.translate(D[0], D[1]);
      g.rotate(-2 * p.th * DEG);
      g.fillStyle = withAlpha(th.text, 0.8);
      g.fillRect(0, -7, 30, 14);
      g.restore();
      // Winkel θ
      g.strokeStyle = th.text;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(C[0], C[1], half * 1.4, -p.th * DEG, 0);
      g.stroke();
      const lab = (s: string, x: number, y: number, align: CanvasTextAlign = 'center', color = th.muted) =>
        subText(g, s, x, y, { size: 12, family: th.font, weight: 600, color, align, halo: th.bg });
      lab(ctx.t('tube'), (tubeL + tubeR) / 2, cy - tubeH / 2 - 12);
      lab(`U = ${fmt.num(p.U, 1)} kV`, (tubeL + tubeR) / 2, cy + tubeH / 2 + 14, 'center', th.text);
      lab(ctx.t('crystal'), C[0], C[1] + 22);
      subText(g, 'θ', C[0] + half * 1.4 + 6, C[1] - 6, { size: 13, family: th.mathFont, weight: 700, color: th.text, align: 'left', halo: th.bg });
      const dl = D[0] + 34 * Math.cos(2 * p.th * DEG);
      const dly = D[1] - 34 * Math.sin(2 * p.th * DEG) - 12;
      lab(ctx.t('counter'), Math.min(dl, r.x + r.w - 40), Math.max(dly, r.y + 12));
    }

    function chartTube(): void {
      const th = ctx.theme;
      const a = anode();
      plot.setRangePadded([L_MIN, L_MAX], [0, yTop()], { left: 28, right: 12, top: 22, bottom: 24 });
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((l) => spectrum(l, p.U, a), { color: th.series[1]!, width: 2.5, from: L_MIN, to: L_MAX });
      const lb = braggLambda(p.th);
      plot.vline(lb, { color: th.text, dash: [5, 4], width: 1 });
      plot.point(lb, spectrum(lb, p.U, a), { color: th.series[1]!, radius: 5 });
      const lm = lambdaMin(p.U);
      if (lm > L_MIN) plot.text(lm, 0, 'λ_min', { color: th.series[3]!, align: 'center', offset: [0, -10], size: 11 });
      if (lineStrength(p.U, a) > 0) {
        plot.text(lambdaOf(a.Ka), spectrum(lambdaOf(a.Ka), p.U, a), 'K_α', { color: th.text, align: 'left', offset: [5, 4], size: 11 });
        plot.text(lambdaOf(a.Kb), spectrum(lambdaOf(a.Kb), p.U, a), 'K_β', { color: th.text, align: 'right', offset: [-5, 4], size: 11 });
      }
      plot.end();
    }

    /* ---------------- Compton ---------------- */
    function drawCompton(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const C: [number, number] = [r.x + r.w * 0.5, r.y + r.h * 0.5];
      const len = Math.min(r.w * 0.45, r.h * 0.46);
      const l2 = comptonLambda(p.l0, p.phi);
      // Darstellung: 20 pm ≙ 26 px (begrenzt)
      const k = Math.min(1.3, 60 / p.l0);
      const wave = (x0: number, y0: number, ang: number, lam: number, length: number, color: string, phase: number) => {
        const lp = Math.max(6, lam * k);
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.beginPath();
        for (let i = 0; i <= 160; i++) {
          const s = (i / 160) * length;
          const y = 7 * Math.sin((2 * Math.PI * s) / lp - phase);
          const x = x0 + s * Math.cos(ang) - y * Math.sin(ang);
          const yy = y0 + s * Math.sin(ang) + y * Math.cos(ang);
          if (i) g.lineTo(x, yy);
          else g.moveTo(x, yy);
        }
        g.stroke();
      };
      const ph = 2 * Math.PI * t * 1.2;
      wave(C[0] - len, C[1], 0, p.l0, len - 10, th.series[1]!, ph);
      const phi = p.phi * DEG;
      wave(C[0] + 10 * Math.cos(-phi), C[1] + 10 * Math.sin(-phi), -phi, l2, len - 10, th.series[3]!, ph);
      // Elektron und Rückstoß
      const ra = recoilAngle(p.l0, p.phi) * DEG;
      const Ee = HC / p.l0 - HC / l2;
      g.fillStyle = th.series[0]!;
      g.beginPath();
      g.arc(C[0], C[1], 7, 0, Math.PI * 2);
      g.fill();
      if (p.phi > 0) {
        const el = Math.min(len * 0.8, 20 + Math.sqrt(Ee) * 18);
        const ex = C[0] + el * Math.cos(-ra);
        const ey = C[1] + el * Math.sin(-ra);
        g.strokeStyle = th.series[0]!;
        g.fillStyle = th.series[0]!;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(C[0], C[1]);
        g.lineTo(ex, ey);
        g.stroke();
        const an = Math.atan2(ey - C[1], ex - C[0]);
        g.beginPath();
        g.moveTo(ex + 8 * Math.cos(an), ey + 8 * Math.sin(an));
        g.lineTo(ex - 5 * Math.cos(an) - 5 * Math.sin(an), ey - 5 * Math.sin(an) + 5 * Math.cos(an));
        g.lineTo(ex - 5 * Math.cos(an) + 5 * Math.sin(an), ey - 5 * Math.sin(an) - 5 * Math.cos(an));
        g.closePath();
        g.fill();
        subText(g, ctx.t('e'), ex, ey + 16, { size: 12, family: th.font, weight: 600, color: th.series[0]!, halo: th.bg });
      }
      // Winkel φ
      g.setLineDash([4, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(C[0], C[1]);
      g.lineTo(C[0] + len * 0.5, C[1]);
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = th.text;
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(C[0], C[1], 30, -phi, 0);
      g.stroke();
      subText(g, 'φ', C[0] + 38 * Math.cos(-phi / 2), C[1] + 38 * Math.sin(-phi / 2), { size: 14, family: th.mathFont, weight: 700, color: th.text, halo: th.bg });
      subText(g, `${ctx.t('before')} = ${fmt.num(p.l0, 0)} pm`, C[0] - len, C[1] + 22, { size: 13, family: th.mathFont, weight: 600, color: th.series[1]!, align: 'left', halo: th.bg });
      const ex2 = C[0] + len * 0.75 * Math.cos(-phi);
      const ey2 = C[1] + len * 0.75 * Math.sin(-phi);
      subText(g, `${ctx.t('after')} = ${fmt.num(l2, 1)} pm`, ex2, ey2 - 18, { size: 13, family: th.mathFont, weight: 600, color: th.series[3]!, align: ex2 > C[0] ? 'right' : 'left', halo: th.bg });
    }

    function chartCompton(): void {
      const th = ctx.theme;
      const top = p.l0 + 2 * LAMBDA_C;
      plot.setRangePadded([0, 180], [p.l0 - 0.5, top + 0.8], { left: 40, right: 12, top: 22, bottom: 24 });
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(p.l0, { color: th.series[1]!, dash: [5, 4], width: 1 });
      plot.fn((f) => comptonLambda(p.l0, f), { color: th.series[3]!, width: 2.5, from: 0, to: 180 });
      plot.point(p.phi, comptonLambda(p.l0, p.phi), { color: th.series[3]!, radius: 5 });
      plot.end();
    }

    return {
      update() {
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'compton' ? 'canvasC' : 'canvasR'));
        if (p.mode === 'compton') plot.setAxes({ x: { label: ctx.t('phiAx') }, y: { label: ctx.t('lpAx') } });
        else plot.setAxes({ x: { label: ctx.t('lamAx') }, y: { label: ctx.t('IAx') } });
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
        const sp = split(surface.width, surface.height);
        plot.resize();
        if (p.mode === 'compton') {
          drawCompton(sp.scene);
          chartCompton();
        } else {
          drawTube(sp.scene);
          chartTube();
        }
      },
      destroy: () => surface.destroy(),
    };
  },
});
