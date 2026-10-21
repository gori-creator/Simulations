import { describe, expect, it } from 'vitest';
import {
  a0,
  amplitude,
  coef,
  coefficients,
  energyShare,
  evalSeries,
  features,
  maxOfSeries,
  maxPartial,
  partial,
  polar,
  power,
  powerOf,
  shareOf,
  sigma,
  target,
  targetOf,
  type SeriesSpec,
  type SigKey,
} from '../src/simulations/mathematik/fourier-reihen/model';

const PI = Math.PI;

/** Numerische Integration (Simpson) über eine Periode, für Kontrollrechnungen. */
function integrate(f: (x: number) => number, n = 20000): number {
  const h = (2 * PI) / n;
  let s = f(-PI) + f(PI);
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(-PI + i * h);
  return (s * h) / 3;
}

describe('Modell: Fourier-Reihen', () => {
  it('Rechteck: bₖ = 4/(πk) für ungerade k, sonst 0', () => {
    expect(coef('sq', 1).b).toBeCloseTo(4 / PI, 14);
    expect(coef('sq', 3).b).toBeCloseTo(4 / (3 * PI), 14);
    expect(coef('sq', 2).b).toBe(0);
  });
  it('Leibniz: Rechteck bei π/2 → 1, Sägezahn bei π/2 → 1/2, Dreieck bei 0 → 1', () => {
    expect(partial('sq', 4001, PI / 2)).toBeCloseTo(1, 3);
    expect(partial('saw', 4001, PI / 2)).toBeCloseTo(0.5, 3);
    expect(partial('tri', 2001, 0)).toBeCloseTo(1, 3);
    expect(partial('half', 2000, PI / 2)).toBeCloseTo(1, 3);
  });
  it('Einweggleichrichtung: Mittelwert 1/π, b₁ = 1/2, a₂ = −2/(3π)', () => {
    expect(a0('half') / 2).toBeCloseTo(1 / PI, 14);
    expect(coef('half', 1).b).toBe(0.5);
    expect(coef('half', 2).a).toBeCloseTo(-2 / (3 * PI), 14);
  });
  it('Gibbs-Phänomen: Überschwingen ≈ 1,179 beim Rechteck, auch für großes N', () => {
    expect(maxPartial('sq', 49)).toBeCloseTo(1.179, 2);
    expect(maxPartial('sq', 99)).toBeCloseTo(1.179, 2);
  });
  it('Amplituden fallen: Rechteck wie 1/k, Dreieck wie 1/k²', () => {
    expect(amplitude('sq', 9) / amplitude('sq', 3)).toBeCloseTo(1 / 3, 12);
    expect(amplitude('tri', 9) / amplitude('tri', 3)).toBeCloseTo(1 / 9, 12);
  });
  it('Plausibilität: Partialsumme nähert die Zielfunktion abseits der Sprünge an', () => {
    for (const s of ['sq', 'saw', 'tri', 'half'] as SigKey[]) {
      for (let i = 0; i < 20; i++) {
        const x = -2.6 + Math.random() * 5.2;
        if (Math.abs(x) < 0.3) continue;
        expect(Math.abs(partial(s, 400, x) - target(s, x))).toBeLessThan(0.02);
      }
    }
  });
});

describe('Modell: weitere Signale', () => {
  it('Dreieck (Spitze 1): aₖ = 8/(π²k²) für ungerade k', () => {
    expect(coef('tri', 1).a).toBeCloseTo(8 / PI ** 2, 14);
    expect(coef('tri', 5).a).toBeCloseTo(8 / (25 * PI ** 2), 14);
    expect(coef('tri', 4).a).toBe(0);
  });
  it('Pulsfolge Höhe 1, Tastgrad d: Mittelwert d, Amplitude 2|sin(πkd)|/(πk)', () => {
    const shape = { d: 0.25 };
    expect(a0('pulse', shape) / 2).toBeCloseTo(0.25, 14);
    expect(amplitude('pulse', 1, shape)).toBeCloseTo((2 * Math.sin(PI / 4)) / PI, 14);
    expect(amplitude('pulse', 3, shape)).toBeCloseTo((2 * Math.abs(Math.sin((3 * PI) / 4))) / (3 * PI), 14);
    // d = 0,25: jede vierte Harmonische fehlt
    expect(amplitude('pulse', 4, shape)).toBeLessThan(1e-15);
  });
  it('Pulsfolge mit d = 0,5: ungerade Harmonische 2/(πk), gerade 0', () => {
    const shape = { d: 0.5 };
    expect(amplitude('pulse', 1, shape)).toBeCloseTo(2 / PI, 14);
    expect(amplitude('pulse', 3, shape)).toBeCloseTo(2 / (3 * PI), 14);
    expect(amplitude('pulse', 2, shape)).toBeLessThan(1e-15);
    expect(amplitude('pulse', 6, shape)).toBeLessThan(1e-15);
  });
  it('Zweiweggleichrichtung |sin x|: Mittelwert 2/π ≈ 0,637, a₂ = −4/(3π), keine ungeraden k', () => {
    expect(a0('full') / 2).toBeCloseTo(2 / PI, 14);
    expect(a0('full') / 2).toBeCloseTo(0.637, 3);
    expect(coef('full', 2).a).toBeCloseTo(-4 / (3 * PI), 14);
    expect(coef('full', 4).a).toBeCloseTo(-4 / (15 * PI), 14);
    expect(amplitude('full', 3)).toBe(0);
    expect(partial('full', 2000, PI / 2)).toBeCloseTo(1, 3);
    expect(partial('full', 2000, 0)).toBeCloseTo(0, 3);
  });
  it('Trapez: Grenzfall w = 1 ist das Dreieck (als Sinusreihe um π/2 verschoben)', () => {
    for (const k of [1, 3, 5, 7]) {
      expect(Math.abs(coef('trap', k, { w: 1 }).b)).toBeCloseTo(8 / (PI ** 2 * k ** 2), 12);
    }
    expect(target('trap', PI / 2, { w: 1 })).toBeCloseTo(1, 12);
    expect(target('trap', PI / 4, { w: 1 })).toBeCloseTo(0.5, 12);
    // kleiner Flankenanteil: fast Rechteck
    expect(coef('trap', 1, { w: 0.01 }).b).toBeCloseTo(4 / PI, 3);
  });
  it('Koeffizienten stimmen mit numerischer Integration überein (alle Signale)', () => {
    const shapes: [SigKey, object][] = [
      ['sq', {}],
      ['saw', {}],
      ['tri', {}],
      ['trap', { w: 0.4 }],
      ['pulse', { d: 0.3 }],
      ['half', {}],
      ['full', {}],
      ['own', { c: [1, 0.5, 0.25] }],
    ];
    for (const [s, shape] of shapes) {
      const f = (x: number) => target(s, x, shape);
      expect(integrate(f) / PI, `${s}: a₀`).toBeCloseTo(a0(s, shape), 3);
      for (const k of [1, 2, 3, 5]) {
        const c = coef(s, k, shape);
        expect(integrate((x) => f(x) * Math.cos(k * x)) / PI, `${s}: a${k}`).toBeCloseTo(c.a, 3);
        expect(integrate((x) => f(x) * Math.sin(k * x)) / PI, `${s}: b${k}`).toBeCloseTo(c.b, 3);
      }
      expect(integrate((x) => f(x) ** 2) / (2 * PI), `${s}: P`).toBeCloseTo(power(s, shape), 3);
    }
  });
  it('Sprungstellen: Partialsumme liefert den Mittelwert der einseitigen Grenzwerte', () => {
    expect(partial('sq', 51, 0)).toBeCloseTo(0, 12);
    expect(partial('saw', 51, PI)).toBeCloseTo(0, 12);
    expect(partial('pulse', 2001, PI * 0.3, { d: 0.3 })).toBeCloseTo(0.5, 2);
  });
});

describe('Modell: Parseval (Energieanteil)', () => {
  it('Rechteck: N = 1 → 8/π² ≈ 81,06 %, N = 3 → (8/π²)(1 + 1/9) ≈ 90,06 %', () => {
    expect(energyShare('sq', 1)).toBeCloseTo(8 / PI ** 2, 14);
    expect(energyShare('sq', 1)).toBeCloseTo(0.8106, 4);
    expect(energyShare('sq', 3)).toBeCloseTo((8 / PI ** 2) * (1 + 1 / 9), 14);
    expect(energyShare('sq', 3)).toBeCloseTo(0.9006, 4);
    expect(energyShare('sq', 2)).toBe(energyShare('sq', 1));
  });
  it('Dreieck: N = 1 → 96/π⁴ ≈ 98,55 %', () => {
    expect(energyShare('tri', 1)).toBeCloseTo(96 / PI ** 4, 14);
    expect(energyShare('tri', 1)).toBeCloseTo(0.9855, 4);
  });
  it('Summe aller Glieder ergibt die ganze Leistung', () => {
    for (const s of ['sq', 'saw', 'tri', 'half', 'full'] as SigKey[]) expect(energyShare(s, 20000)).toBeCloseTo(1, 3);
    expect(energyShare('pulse', 20000, { d: 0.2 })).toBeCloseTo(1, 3);
    expect(energyShare('own', 3, { c: [1, 0.5, 0.25] })).toBeCloseTo(1, 14);
  });
  it('Pulsfolge: Gleichanteil allein trägt d² / d = d der Leistung', () => {
    expect(energyShare('pulse', 0, { d: 0.25 })).toBeCloseTo(0.25, 14);
  });
  it('shareOf mit Koeffizienten stimmt mit energyShare überein; Glättung senkt den Anteil', () => {
    const spec: SeriesSpec = { sig: 'sq', A: 2, phi: 0.7 };
    const co = coefficients(spec, 30);
    expect(shareOf(co, powerOf(spec), 3)).toBeCloseTo(energyShare('sq', 3), 12);
    const w = Array.from({ length: 31 }, (_, k) => sigma('fejer', k, 3));
    expect(shareOf(co, powerOf(spec), 3, w)).toBeLessThan(energyShare('sq', 3));
  });
});

describe('Modell: Amplitude, Phasenverschiebung, Glättung', () => {
  it('g(x) = A · f(x − φ): Reihe stimmt mit dem verschobenen Signal überein', () => {
    const spec: SeriesSpec = { sig: 'saw', A: 1.5, phi: PI / 3 };
    const co = coefficients(spec, 400);
    for (const x of [-1, -0.5, 0.4, 2.1]) expect(evalSeries(co, 400, x)).toBeCloseTo(targetOf(spec, x), 2);
  });
  it('Phasenverschiebung ändert die Amplituden nicht, nur die Phasen', () => {
    const co0 = coefficients({ sig: 'sq', A: 1, phi: 0 }, 9);
    const co1 = coefficients({ sig: 'sq', A: 1, phi: PI / 2 }, 9);
    for (let k = 1; k <= 9; k++) expect(Math.hypot(co1.a[k]!, co1.b[k]!)).toBeCloseTo(Math.hypot(co0.a[k]!, co0.b[k]!), 13);
    // Rechteck um π/2 verschoben ist gerade: nur Kosinusglieder
    expect(features({ sig: 'sq', A: 1, phi: PI / 2 }).even).toBe(true);
  });
  it('Sinusform: aₖ cos kx + bₖ sin kx = Âₖ sin(kx + φₖ)', () => {
    const { amp, phase } = polar(0.3, -0.4);
    expect(amp).toBeCloseTo(0.5, 14);
    for (const x of [0, 1, 2.5]) expect(amp * Math.sin(2 * x + phase)).toBeCloseTo(0.3 * Math.cos(2 * x) - 0.4 * Math.sin(2 * x), 13);
    expect(polar(0, 1).phase).toBe(0);
    expect(polar(1, 0).phase).toBeCloseTo(PI / 2, 14);
  });
  it('Gibbs über die ganze Periode: Maximum ≈ 1,179 · A, unabhängig von φ', () => {
    const m = maxOfSeries(coefficients({ sig: 'sq', A: 1, phi: 0 }, 49), 49);
    expect(m.y).toBeCloseTo(1.179, 2);
    expect((m.y - 1) / 2).toBeCloseTo(0.0895, 2);
    const m2 = maxOfSeries(coefficients({ sig: 'sq', A: 2, phi: 1 }, 49), 49);
    expect(m2.y).toBeCloseTo(2 * m.y, 3);
  });
  it('Fejér-Glättung: kein Überschwingen beim Rechteck (Fejér-Kern ist positiv)', () => {
    const N = 30;
    const w = Array.from({ length: N + 1 }, (_, k) => sigma('fejer', k, N));
    const m = maxOfSeries(coefficients({ sig: 'sq', A: 1, phi: 0 }, N), N, w);
    expect(m.y).toBeLessThan(1);
    const wl = Array.from({ length: N + 1 }, (_, k) => sigma('lanczos', k, N));
    const ml = maxOfSeries(coefficients({ sig: 'sq', A: 1, phi: 0 }, N), N, wl);
    expect(ml.y).toBeGreaterThan(1);
    expect(ml.y).toBeLessThan(1.03);
  });
  it('Glättungsfaktoren: σ₀ = 1, außerhalb 0, Fejér linear', () => {
    expect(sigma('fejer', 0, 5)).toBe(1);
    expect(sigma('fejer', 3, 5)).toBeCloseTo(0.5, 14);
    expect(sigma('lanczos', 6, 5)).toBe(0);
    expect(sigma('none', 4, 5)).toBe(1);
  });
  it('Merkmale: Symmetrien und Abfall', () => {
    expect(features({ sig: 'sq', A: 1, phi: 0 })).toMatchObject({ odd: true, halfWave: true, decay: 1 });
    expect(features({ sig: 'tri', A: 1, phi: 0 })).toMatchObject({ even: true, halfWave: true, decay: 2 });
    expect(features({ sig: 'full', A: 1, phi: 0 })).toMatchObject({ even: true, evenOnly: true, halfWave: false });
    expect(features({ sig: 'saw', A: 1, phi: 0 })).toMatchObject({ odd: true, halfWave: false });
    expect(features({ sig: 'pulse', A: 1, phi: 0, shape: { d: 0.5 } })).toMatchObject({ even: true, odd: false, halfWave: false });
  });
  it('eigener Klang: exakt ab der höchsten Ordnung mit cₖ ≠ 0', () => {
    // Synthesizer-Beispiel c₁ … c₄ ≠ 0, Rest 0 → S_N exakt ab N = 4 (nicht fest 8)
    const synth: SeriesSpec = { sig: 'own', A: 1, phi: 0, shape: { c: [1, 0.5, 0.35, 0.25, 0, 0, 0, 0] } };
    expect(features(synth)).toMatchObject({ decay: 0, top: 4 });
    expect(Math.abs(partial('own', 4, 1.3, synth.shape) - targetOf(synth, 1.3))).toBeLessThan(1e-12);
    expect(Math.abs(partial('own', 3, 1.3, synth.shape) - targetOf(synth, 1.3))).toBeGreaterThan(1e-3);
    // nur c₇ ≠ 0 (auch mit Lücken und negativem Vorzeichen) → 7; alle 0 → 0
    expect(features({ sig: 'own', A: 1, phi: 0, shape: { c: [0, 0, 0, 0, 0, 0, -0.4, 0] } }).top).toBe(7);
    expect(features({ sig: 'own', A: 1, phi: 0, shape: { c: [0, 0, 0, 0, 0, 0, 0, 0] } }).top).toBe(0);
    // Phasenverschiebung ändert die höchste Ordnung nicht
    expect(features({ ...synth, phi: Math.PI / 3 }).top).toBe(4);
  });
  it('Lanczos: σₖ = sinc(πk/(N + 1)), höchstes Glied trägt noch bei', () => {
    expect(sigma('lanczos', 1, 1)).toBeCloseTo(Math.sin(Math.PI / 2) / (Math.PI / 2), 14);
    expect(sigma('lanczos', 5, 5)).toBeGreaterThan(0);
  });
});
