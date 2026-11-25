import { describe, expect, it } from 'vitest';
import { chain, criticalAngle, malus, refractionAngle, wavelengthRatio } from '../src/simulations/physik/polarisation/model';

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
