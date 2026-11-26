import { describe, expect, it } from 'vitest';
import {
  brewster,
  chain,
  checkTask,
  cinemaEye,
  criticalAngle,
  fresnel,
  glareThroughSunglasses,
  lcdBrightness,
  makeTask,
  malus,
  refractionAngle,
  SEGMENTS,
  SKY_PMAX,
  skyPolarization,
  skyThroughFilter,
  wavelengthRatio,
} from '../src/simulations/physik/polarisation/model';

describe('Polarisation', () => {
  it('Gesetz von Malus', () => {
    expect(malus(0)).toBeCloseTo(1, 12);
    expect(malus(60)).toBeCloseTo(0.25, 12);
    expect(malus(90)).toBeCloseTo(0, 12);
    expect(malus(180)).toBeCloseTo(1, 12);
  });

  it('ein Filter halbiert unpolarisiertes Licht', () => {
    expect(chain([30])).toBeCloseTo(0.5, 12);
  });

  it('gekreuzte Filter sperren, ein drittes dazwischen lässt wieder Licht durch', () => {
    expect(chain([0, 90])).toBeCloseTo(0, 12);
    expect(chain([0, 45, 90])).toBeCloseTo(0.125, 12);
  });
});

describe('Brechung im Wellenmodell', () => {
  it('Brechungsgesetz sin α / sin β = n', () => {
    const b = refractionAngle(30, 1.5)!;
    expect(Math.sin((30 * Math.PI) / 180) / Math.sin((b * Math.PI) / 180)).toBeCloseTo(1.5, 10);
    expect(refractionAngle(0, 1.33)).toBeCloseTo(0, 12);
  });

  it('Totalreflexion ab dem Grenzwinkel', () => {
    const g = criticalAngle(1 / 1.5)!;
    expect(g).toBeCloseTo(41.81, 2);
    expect(refractionAngle(g - 1, 1 / 1.5)).not.toBeNull();
    expect(refractionAngle(g + 1, 1 / 1.5)).toBeNull();
    expect(criticalAngle(1.5)).toBeNull();
  });

  it('im langsameren Stoff ist die Wellenlänge kürzer', () => {
    expect(wavelengthRatio(1.5)).toBeCloseTo(2 / 3, 12);
  });
});

describe('Reflexion und Brewster-Winkel', () => {
  it('bei senkrechtem Einfall sind s und p gleich', () => {
    const f = fresnel(0, 1.5);
    expect(f.rs).toBeCloseTo(0.04, 6);
    expect(f.rp).toBeCloseTo(0.04, 6);
  });
  it('beim Brewster-Winkel verschwindet der p-Anteil', () => {
    for (const n of [1.33, 1.5, 2.42]) {
      const b = brewster(n);
      expect(Math.tan((b * Math.PI) / 180)).toBeCloseTo(n, 9);
      expect(fresnel(b, n).rp).toBeLessThan(1e-12);
      expect(glareThroughSunglasses(b, n)).toBeLessThan(1e-9);
    }
    expect(brewster(1.33)).toBeCloseTo(53.1, 1);
  });
  it('streifender Einfall spiegelt fast alles', () => {
    const f = fresnel(89, 1.5);
    expect(f.rs).toBeGreaterThan(0.9);
    expect(f.rp).toBeGreaterThan(0.8);
  });
});

describe('LCD', () => {
  it('ohne Spannung hell, mit voller Spannung dunkel', () => {
    expect(lcdBrightness(0)).toBeCloseTo(0.5, 9);
    expect(lcdBrightness(1)).toBeCloseTo(0, 9);
    expect(lcdBrightness(0.5)).toBeCloseTo(0.25, 9);
  });
  it('jede Ziffer hat gültige Segmente', () => {
    for (let d = 0; d <= 9; d++) expect(SEGMENTS[d]).toMatch(/^[a-g]+$/);
    expect(SEGMENTS[8]).toHaveLength(7);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(4)).toEqual(makeTask(4));
    expect(new Set(Array.from({ length: 16 }, (_, i) => makeTask(i + 1).kind)).size).toBe(8);
  });
  it('erkennt die hinterlegte Antwort', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      const v = t.tol === 0 ? String(t.answer) : String(Math.round(t.answer * 10) / 10).replace('.', ',');
      expect(checkTask(t, v)).toBe(true);
      expect(checkTask(t, String(t.answer + 9))).toBe(false);
      if (t.choices) expect(t.answer).toBeLessThanOrEqual(t.choices.length);
    }
    expect(checkTask(makeTask(1), 'x')).toBeNull();
    expect(checkTask(makeTask(1), `${Math.round(makeTask(1).answer)} %`)).toBe(true);
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});

describe('Himmelslicht und 3D-Kino', () => {
  it('Himmel ist 90° neben der Sonne am stärksten polarisiert', () => {
    expect(skyPolarization(90)).toBeCloseTo(SKY_PMAX, 9);
    expect(skyPolarization(0)).toBeCloseTo(0, 9);
    expect(skyPolarization(180)).toBeCloseTo(0, 9);
    expect(skyPolarization(60)).toBeLessThan(skyPolarization(90));
  });
  it('Polfilter: dunkelste Stellung lässt (1 − P)/2 durch, unpolarisiert die Hälfte', () => {
    expect(skyThroughFilter(0.75, 90)).toBeCloseTo(0.125, 9);
    expect(skyThroughFilter(0.75, 0)).toBeCloseTo(0.875, 9);
    expect(skyThroughFilter(0, 37)).toBeCloseTo(0.5, 9);
  });
  it('3D-Kino: Geisterbild wächst mit der Kopfneigung', () => {
    expect(cinemaEye(0).ghost).toBeCloseTo(0, 9);
    expect(cinemaEye(30).ghost).toBeCloseTo(0.25, 9);
    expect(cinemaEye(-30).ghost).toBeCloseTo(0.25, 9);
    expect(cinemaEye(45).own).toBeCloseTo(0.5, 9);
  });
  it('neue Übungsarten sind lösbar', () => {
    for (let n = 1; n <= 80; n++) {
      const t = makeTask(n);
      if (t.kind === 'sky' || t.kind === 'ghost') expect(checkTask(t, String(Math.round(t.answer * 10) / 10).replace('.', ','))).toBe(true);
    }
  });
});
