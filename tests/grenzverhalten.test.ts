import { describe, expect, it } from 'vitest';
import {
  approachSide,
  boundThreshold,
  candidateDefault,
  degreeInfo,
  degreeRuleLimit,
  distance,
  EPS_STEPS,
  exactThreshold,
  exceedPoint,
  FN_KEYS,
  FUNCS,
  hasLimit,
  leavePoint,
  limitOf,
  nextEps,
  polyEval,
  runSpan,
  runU,
  runX,
  sciSplit,
  table,
  tableXs,
  threshold,
  yWindow,
} from '../src/simulations/mathematik/grenzverhalten/model';

describe('Modell: Grenzverhalten', () => {
  it('Grenzwerte und bestimmte Divergenz', () => {
    expect(limitOf('rat', 1)).toBe(2);
    expect(limitOf('rat2', -1)).toBe(3);
    expect(limitOf('exp', -1)).toBe(0);
    expect(limitOf('exp', 1)).toBe(Infinity);
    expect(limitOf('poly', -1)).toBe(-Infinity);
    expect(hasLimit('poly', 1)).toBe(false);
  });
  it('x_ε für (2x + 1)/(x − 1) = 2 + 3/(x − 1): x_ε = 1 + 3/ε', () => {
    expect(threshold('rat', 1, 0.5)).toBeCloseTo(7, 4);
    expect(threshold('rat', 1, 0.05)).toBeCloseTo(61, 3);
  });
  it('x_ε für 1/x + 1 (x → −∞): −1/ε', () => {
    expect(threshold('inv', -1, 0.25)).toBeCloseTo(-4, 4);
  });
  it('x_ε für (3x² + 1)/(x² + 1): √(2/ε − 1)', () => {
    expect(threshold('rat2', 1, 0.2)).toBeCloseTo(3, 4);
    expect(threshold('rat2', 1, 0.5)).toBeCloseTo(Math.sqrt(3), 4);
  });
  it('x_ε für 2ˣ (x → −∞): log₂ ε', () => {
    expect(threshold('exp', -1, 0.25)).toBeCloseTo(-2, 4);
  });
  it('sin(x)/x: Hinter x_ε bleibt der Graph im Streifen', () => {
    const xe = threshold('osc', 1, 0.1);
    expect(xe).toBeGreaterThan(8);
    expect(xe).toBeLessThan(10);
    for (let x = xe + 1e-6; x < 400; x += 0.01) expect(Math.abs(FUNCS.osc.f(x))).toBeLessThan(0.1);
    // kurz davor ist der Abstand mindestens ε
    expect(Math.abs(FUNCS.osc.f(xe - 1e-6))).toBeGreaterThanOrEqual(0.0999999);
  });
  it('Wertetabelle: Abstand zur Asymptote wird kleiner', () => {
    const t = table('rat', 1);
    expect(Number.isNaN(t[0]!.y)).toBe(true); // Definitionslücke bei x = 1
    expect(t[1]!.y).toBeCloseTo(21 / 9, 12);
    expect(t[2]!.d).toBeCloseTo(3 / 99, 12);
    expect(t[4]!.d).toBeLessThan(t[3]!.d);
  });
  it('Plausibilität: x_ε passt für viele ε (Bedingung danach erfüllt, davor verletzt)', () => {
    for (const key of ['inv', 'rat', 'rat2', 'osc'] as const) {
      for (const dir of [1, -1] as const) {
        for (let eps = 0.05; eps <= 1; eps += 0.15) {
          const xe = threshold(key, dir, eps);
          const L = limitOf(key, dir);
          for (const off of [1e-4, 0.5, 3, 40]) {
            const x = xe + dir * off;
            const v = FUNCS[key].f(x);
            expect(Math.abs(v - L)).toBeLessThan(eps);
          }
        }
      }
    }
  });

  /* ---------- Ergänzungen (Überarbeitung) ---------- */

  it('Prüfwerte (2x + 1)/(x − 1): x_ε = 7 bzw. 31, f(10) und f(100)', () => {
    expect(threshold('rat', 1, 0.5)).toBeCloseTo(7, 4);
    expect(threshold('rat', 1, 0.1)).toBeCloseTo(31, 3);
    expect(exactThreshold('rat', 1, 0.5)).toBe(7);
    expect(exactThreshold('rat', 1, 0.1)).toBeCloseTo(31, 12);
    expect(FUNCS.rat.f(10)).toBeCloseTo(21 / 9, 12);
    expect(FUNCS.rat.f(10)).toBeCloseTo(2.333, 3);
    expect(FUNCS.rat.f(100)).toBeCloseTo(201 / 99, 12);
    expect(FUNCS.rat.f(100)).toBeCloseTo(2.0303, 4);
    // Umformung 2 + 3/(x − 1) stimmt überall außer an der Lücke
    for (const x of [-50, -3, 0, 0.5, 2, 7, 1234]) expect(FUNCS.rat.f(x)).toBeCloseTo(2 + 3 / (x - 1), 10);
    expect(Number.isNaN(FUNCS.rat.f(1))).toBe(true);
    // x → −∞: x < 1 − 3/ε
    expect(threshold('rat', -1, 0.5)).toBeCloseTo(-5, 4);
  });

  it('Prüfwerte 3 − 2/(x² + 1): x_ε = ±3 für ε = 0,2, Annäherung von unten', () => {
    expect(threshold('rat2', 1, 0.2)).toBeCloseTo(3, 4);
    expect(threshold('rat2', -1, 0.2)).toBeCloseTo(-3, 4);
    expect(exactThreshold('rat2', -1, 0.2)).toBeCloseTo(-3, 12);
    for (let x = -500; x <= 500; x += 0.37) expect(FUNCS.rat2.f(x)).toBeLessThan(3);
    expect(approachSide('rat2', 1)).toBe('below');
    expect(approachSide('rat2', -1)).toBe('below');
  });

  it('Prüfwerte 1/x + 1: |x_ε| = 4 für ε = 0,25, von oben (+∞) bzw. von unten (−∞)', () => {
    expect(threshold('inv', 1, 0.25)).toBeCloseTo(4, 4);
    expect(threshold('inv', -1, 0.25)).toBeCloseTo(-4, 4);
    expect(approachSide('inv', 1)).toBe('above');
    expect(approachSide('inv', -1)).toBe('below');
  });

  it('Prüfwerte 2ˣ: x → −∞ gegen 0 mit x_ε = −2 (ε = 0,25), x → +∞ kein Grenzwert', () => {
    expect(limitOf('exp', -1)).toBe(0);
    expect(threshold('exp', -1, 0.25)).toBeCloseTo(-2, 4);
    expect(exactThreshold('exp', -1, 0.25)).toBe(-2);
    expect(hasLimit('exp', 1)).toBe(false);
    expect(Number.isNaN(threshold('exp', 1, 0.25))).toBe(true);
    expect(approachSide('exp', -1)).toBe('above');
  });

  it('Prüfwerte sin(x)/x: x_ε ≈ 8,4232 (größte Lösung von |sin x| = 0,1 · x), schneidet y = 0 bei kπ', () => {
    const xe = threshold('osc', 1, 0.1);
    expect(Math.abs(xe - 8.4232)).toBeLessThan(0.01);
    expect(Math.abs(Math.abs(Math.sin(xe)) - 0.1 * xe)).toBeLessThan(1e-6);
    expect(threshold('osc', -1, 0.1)).toBeCloseTo(-xe, 6);
    // Nullstellen bei kπ: der Graph schneidet die Asymptote unendlich oft
    for (let k = 1; k <= 200; k++) {
      expect(Math.abs(FUNCS.osc.f(k * Math.PI))).toBeLessThan(1e-12);
      // Vorzeichenwechsel um kπ
      expect(Math.sign(FUNCS.osc.f(k * Math.PI - 0.1))).toBe(-Math.sign(FUNCS.osc.f(k * Math.PI + 0.1)));
    }
    expect(approachSide('osc', 1)).toBe('both');
    // Abschätzung |f(x)| ≤ 1/|x|: sicher ab 1/ε = 10, also nicht früher als die genaue Stelle
    expect(boundThreshold(0.1)).toBe(10);
    expect(boundThreshold(0.1)).toBeGreaterThan(xe);
  });

  it('Prüfwerte 0,1x³ − x: bestimmt divergent, threshold liefert NaN', () => {
    expect(limitOf('poly', 1)).toBe(Infinity);
    expect(limitOf('poly', -1)).toBe(-Infinity);
    expect(Number.isNaN(threshold('poly', 1, 0.5))).toBe(true);
    expect(Number.isNaN(threshold('poly', -1, 0.1))).toBe(true);
    expect(Number.isNaN(exactThreshold('poly', 1, 0.5))).toBe(true);
    expect(approachSide('poly', 1)).toBeNull();
  });

  it('Neue Funktionen: 2x/(x² + 1), x · 2⁻ˣ, 2ˣ/(2ˣ + 1)', () => {
    // 2x/(x² + 1): |x_ε| = (1 + √(1 − ε²))/ε, für ε = 0,5 also 2 + √3
    expect(threshold('low', 1, 0.5)).toBeCloseTo(2 + Math.sqrt(3), 4);
    expect(threshold('low', -1, 0.5)).toBeCloseTo(-2 - Math.sqrt(3), 4);
    expect(approachSide('low', 1)).toBe('above');
    expect(approachSide('low', -1)).toBe('below');
    // x · 2⁻ˣ: ε = 0,5 → 2 (2 · 2⁻² = 0,5), ε = 0,25 → 4 (4/16), ε = 0,1 → ≈ 5,877
    expect(threshold('xexp', 1, 0.5)).toBeCloseTo(2, 4);
    expect(threshold('xexp', 1, 0.25)).toBeCloseTo(4, 4);
    expect(threshold('xexp', 1, 0.1)).toBeCloseTo(5.877, 3);
    expect(FUNCS.xexp.f(10)).toBeCloseTo(10 / 1024, 12);
    expect(limitOf('xexp', -1)).toBe(-Infinity);
    expect(approachSide('xexp', 1)).toBe('above');
    // 2ˣ/(2ˣ + 1): verschiedene Grenzwerte, ε = 0,2 → x_ε = 2 bzw. −2
    expect(limitOf('logi', 1)).toBe(1);
    expect(limitOf('logi', -1)).toBe(0);
    expect(threshold('logi', 1, 0.2)).toBeCloseTo(2, 4);
    expect(threshold('logi', -1, 0.2)).toBeCloseTo(-2, 4);
    expect(exactThreshold('logi', 1, 0.2)).toBeCloseTo(2, 12);
    expect(FUNCS.logi.f(3)).toBeCloseTo(8 / 9, 12);
    expect(approachSide('logi', 1)).toBe('below');
    expect(approachSide('logi', -1)).toBe('above');
    // großes ε: Bedingung gilt schon ab x = 0 (bzw. für alle x)
    expect(threshold('logi', 1, 0.8)).toBe(0);
    expect(exactThreshold('logi', 1, 0.8)).toBeCloseTo(-2, 12);
    expect(exactThreshold('logi', 1, 1)).toBe(-Infinity);
  });

  it('Geschlossene Form und numerische Suche stimmen überein', () => {
    for (const key of ['inv', 'rat', 'rat2', 'low', 'exp', 'logi'] as const) {
      for (const dir of [1, -1] as const) {
        if (!hasLimit(key, dir)) continue;
        for (let k = 1; k <= 20; k++) {
          const eps = k / 20;
          // 2x/(x² + 1) berührt bei ε = 1 den Schlauchrand nur im einzelnen Punkt x = ±1 – den trifft die Rastersuche nicht
          if (key === 'low' && k === 20) continue;
          const ex = exactThreshold(key, dir, eps);
          const num = threshold(key, dir, eps);
          // numerisch wird nur auf der Seite von dir gesucht
          const expected = Number.isFinite(ex) && dir * ex > 0 ? ex : 0;
          expect(Math.abs(num - expected)).toBeLessThan(1e-3);
        }
      }
    }
  });

  it('Zufallsprüfung: jenseits von x_ε im Schlauch, knapp davor eine Verletzung', () => {
    let seed = 12345;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (const key of FN_KEYS) {
      for (const dir of [1, -1] as const) {
        if (!hasLimit(key, dir)) continue;
        const L = limitOf(key, dir);
        for (let i = 0; i < 12; i++) {
          const eps = 0.05 + 0.95 * rnd();
          const xe = threshold(key, dir, eps);
          for (let j = 0; j < 25; j++) {
            const x = xe + dir * (1e-6 + 300 * rnd() ** 3);
            expect(Math.abs(FUNCS[key].f(x) - L)).toBeLessThan(eps);
          }
          if (xe !== 0) {
            // knapp davor: |f − L| ≥ ε (oder Definitionslücke)
            const v = FUNCS[key].f(xe - dir * 1e-6);
            expect(!Number.isFinite(v) || Math.abs(v - L) >= eps - 1e-6).toBe(true);
          }
        }
      }
    }
  });

  it('Gradregel für gebrochen-rationale Funktionen passt zu den Grenzwerten', () => {
    const cases: Record<string, string> = { inv: 'eq', rat: 'eq', rat2: 'eq', low: 'lt', poly: 'gt' };
    for (const key of FN_KEYS) {
      const d = degreeInfo(key);
      if (!d) {
        expect(FUNCS[key].family).not.toBe('rational');
        continue;
      }
      expect(d.case).toBe(cases[key]);
      for (const dir of [1, -1] as const) expect(degreeRuleLimit(d, dir)).toBe(limitOf(key, dir));
      // Zähler/Nenner stellen wirklich die Funktion dar
      const r = FUNCS[key].ratio!;
      for (const x of [-7.5, -2, 0.3, 3, 42]) expect(polyEval(r.num, x) / polyEval(r.den, x)).toBeCloseTo(FUNCS[key].f(x), 10);
    }
    expect(degreeInfo('rat')).toEqual({ zDeg: 1, nDeg: 1, zLead: 2, nLead: 1, case: 'eq' });
    expect(degreeInfo('rat2')!.zLead / degreeInfo('rat2')!.nLead).toBe(3);
  });

  it('Bestimmte Divergenz: Probe-Schlauch wird verlassen, jede Schranke überschritten', () => {
    // 0,1x³ − x = 3,5 bei x ≈ 4,2665: ab dort verlässt der Graph den Schlauch um 3 (ε = 0,5)
    const xl = leavePoint('poly', 1, 3, 0.5);
    expect(xl).toBeCloseTo(4.26654, 4);
    for (let x = xl + 1e-6; x < 200; x += 0.25) expect(Math.abs(FUNCS.poly.f(x) - 3)).toBeGreaterThanOrEqual(0.5);
    // 2ˣ verlässt den Schlauch um 4 bei log₂ 4,5
    expect(leavePoint('exp', 1, 4, 0.5)).toBeCloseTo(Math.log2(4.5), 6);
    // nie im Schlauch: 0,1x³ − x ist für x < 0 nie größer als ≈ 1,22
    expect(Number.isNaN(leavePoint('poly', -1, 3, 0.5))).toBe(true);
    // Schranken
    expect(exceedPoint('exp', 1, 1024)).toBeCloseTo(10, 6);
    expect(exceedPoint('poly', 1, 100)).toBeCloseTo(10.3332, 3);
    expect(exceedPoint('poly', -1, -100)).toBeCloseTo(-10.3332, 3);
    expect(Number.isNaN(exceedPoint('rat', 1, 10))).toBe(true);
    for (const S of [10, 100, 1000]) {
      const xs = exceedPoint('poly', 1, S);
      for (let x = xs + 1e-6; x < 500; x += 0.5) expect(FUNCS.poly.f(x)).toBeGreaterThan(S);
    }
    expect(candidateDefault('poly', -1)).toBeLessThan(0);
    expect(candidateDefault('exp', 1)).toBe(4);
  });

  it('Lauf nach außen: logarithmisch von der ersten bis zur letzten Tabellenstelle', () => {
    expect(runX('rat', 1, 0)).toBe(2);
    expect(runX('inv', -1, 0)).toBe(-1);
    expect(runX('inv', 1, 1)).toBeCloseTo(10000, 8);
    expect(runX('inv', 1, 0.5)).toBeCloseTo(100, 8);
    expect(runX('exp', -1, 1)).toBeCloseTo(-20, 10);
    for (const key of FN_KEYS)
      for (const dir of [1, -1] as const) {
        const s = runSpan(key, dir);
        expect(s.to).toBe(tableXs(key)[tableXs(key).length - 1]);
        for (const u of [0, 0.13, 0.5, 0.92, 1]) expect(runU(key, dir, runX(key, dir, u))).toBeCloseTo(u, 10);
        // Fenster enthält die Asymptote mit einem mittleren Schlauch (breitere zeigt die Ansicht durch Erweitern)
        const [y0, y1] = yWindow(key, dir);
        const L = limitOf(key, dir);
        if (Number.isFinite(L)) {
          expect(y0).toBeLessThan(L - 0.5);
          expect(y1).toBeGreaterThan(L + 0.5);
        }
      }
  });

  it('Hilfsfunktionen: Abstand, ε-Spiel, Zehnerpotenzen, Tabelle', () => {
    expect(distance('rat', 1, 100)).toBeCloseTo(3 / 99, 12);
    expect(Number.isNaN(distance('poly', 1, 3))).toBe(true);
    expect(nextEps(0.5)).toBe(0.25);
    expect(nextEps(0.3)).toBe(0.25);
    expect(nextEps(0.05)).toBe(1);
    expect(EPS_STEPS[0]).toBe(1);
    const s = sciSplit(3.03e-4);
    expect(s.exp).toBe(-4);
    expect(s.mant).toBeCloseTo(3.03, 10);
    expect(sciSplit(9.999e5).exp).toBe(6);
    expect(tableXs('logi')).toEqual([1, 2, 5, 10, 20]);
    const t = table('exp', -1);
    expect(t[4]!.y).toBeCloseTo(2 ** -20, 15);
    expect(t[1]!.d).toBeCloseTo(0.25, 12);
  });
  /* ---------- Prüfrunde Paket 3 ---------- */

  it('Geschlossene Formen: am Rand gilt genau |f(x_ε) − L| = ε (alle Reglerwerte)', () => {
    for (const key of ['inv', 'rat', 'rat2', 'low', 'exp', 'logi'] as const) {
      for (const dir of [1, -1] as const) {
        if (!hasLimit(key, dir)) continue;
        const L = limitOf(key, dir);
        for (let k = 1; k <= 20; k++) {
          const eps = k / 20;
          const xe = exactThreshold(key, dir, eps);
          if (!Number.isFinite(xe)) continue;
          expect(Math.abs(Math.abs(FUNCS[key].f(xe) - L) - eps)).toBeLessThan(1e-9);
          // knapp dahinter im Schlauch
          expect(Math.abs(FUNCS[key].f(xe + dir * 1e-6) - L)).toBeLessThan(eps);
        }
      }
    }
  });

  it('Werte aus Bild und Lernmaterial (nachgerechnet)', () => {
    // (2x + 1)/(x − 1), ε = 0,35: x_ε = 1 + 3/0,35 ≈ 9,5714
    expect(exactThreshold('rat', 1, 0.35)).toBeCloseTo(9.5714, 4);
    // (3x² + 1)/(x² + 1), ε = 0,15: √(2/0,15 − 1) = √12,33… ≈ 3,5119
    expect(exactThreshold('rat2', 1, 0.15)).toBeCloseTo(3.5119, 4);
    // 2ˣ/(2ˣ + 1), ε = 0,15: log₂(1/0,15 − 1) ≈ 2,5025; x → −∞, ε = 0,2: −2
    expect(exactThreshold('logi', 1, 0.15)).toBeCloseTo(2.5025, 4);
    expect(exactThreshold('logi', -1, 0.2)).toBeCloseTo(-2, 12);
    // 2x/(x² + 1), x → −∞, ε = 0,35: −(1 + √(1 − 0,35²))/0,35 ≈ −5,5336
    expect(exactThreshold('low', -1, 0.35)).toBeCloseTo(-5.5336, 4);
    // Aufgabe 6: f(11) = 122,1 > 100, Schranke 100 ab x ≈ 10,33
    expect(FUNCS.poly.f(11)).toBeCloseTo(122.1, 10);
    expect(exceedPoint('poly', 1, 100)).toBeCloseTo(10.33, 2);
    // Ausprobieren 3: 1/x + 1 nähert sich für x → −∞ von unten
    expect(approachSide('inv', -1)).toBe('below');
    // Tabelle 2ˣ/(2ˣ + 1), x → −∞: f(−2) = 0,2 liegt genau auf dem Rand (ε = 0,2 → nicht im Schlauch)
    expect(FUNCS.logi.f(-2)).toBeCloseTo(0.2, 14);
  });

  it('Annäherung von oben/unten für alle Funktionen mit Grenzwert', () => {
    const want: Record<string, string> = {
      'inv|1': 'above', 'inv|-1': 'below', 'rat|1': 'above', 'rat|-1': 'below', 'rat2|1': 'below', 'rat2|-1': 'below',
      'low|1': 'above', 'low|-1': 'below', 'osc|1': 'both', 'osc|-1': 'both', 'exp|-1': 'above', 'xexp|1': 'above',
      'logi|1': 'below', 'logi|-1': 'above',
    };
    for (const key of FN_KEYS)
      for (const dir of [1, -1] as const) {
        const side = approachSide(key, dir);
        if (!hasLimit(key, dir)) expect(side).toBeNull();
        else expect(side).toBe(want[`${key}|${dir}`]);
      }
  });
});
