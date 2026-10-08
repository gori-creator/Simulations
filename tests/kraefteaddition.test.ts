import { describe, expect, it } from 'vitest';
import { addVec, angleBetween, decompose, G, resultant, resultantMagnitude, ropeForce, sagAngle, toForce, toVec } from '../src/simulations/physik/kraefteaddition/model';

describe('Modell: Kräfte addieren und zerlegen', () => {
  it('rechnet zwischen Betrag/Richtung und Komponenten um', () => {
    const [x, y] = toVec({ F: 2, deg: 30 });
    expect(x).toBeCloseTo(Math.sqrt(3), 12);
    expect(y).toBeCloseTo(1, 12);
    expect(toForce([0, -3])).toEqual({ F: 3, deg: -90 });
    expect(toForce([-1, 0]).deg).toBe(180);
    expect(toForce([0, 0])).toEqual({ F: 0, deg: 0 });
    expect(addVec([1, 2], [3, -1], [-0.5, 0])).toEqual([3.5, 1]);
  });

  it('addiert 3 N und 4 N im rechten Winkel zu 5 N', () => {
    const R = resultant([
      { F: 4, deg: 0 },
      { F: 3, deg: 90 },
    ]);
    expect(R.F).toBeCloseTo(5, 12);
    expect(R.deg).toBeCloseTo((Math.atan2(3, 4) * 180) / Math.PI, 10);
    expect(resultantMagnitude(4, 3, 90)).toBeCloseTo(5, 12);
  });

  it('addiert gleich und entgegengesetzt gerichtete Kräfte wie Zahlen', () => {
    expect(resultant([{ F: 4, deg: 20 }, { F: 3, deg: 20 }]).F).toBeCloseTo(7, 12);
    expect(resultant([{ F: 4, deg: 0 }, { F: 3, deg: 180 }]).F).toBeCloseTo(1, 12);
    expect(resultantMagnitude(4, 3, 0)).toBeCloseTo(7, 12);
    expect(resultantMagnitude(4, 3, 180)).toBeCloseTo(1, 12);
    // Kosinussatz-Form stimmt mit der Komponentenrechnung überein
    expect(resultantMagnitude(5, 2, 60)).toBeCloseTo(resultant([{ F: 5, deg: 10 }, { F: 2, deg: 70 }]).F, 12);
  });

  it('erkennt drei Kräfte im Gleichgewicht (geschlossenes Krafteck)', () => {
    const R = resultant([
      { F: 4, deg: 90 },
      { F: 4, deg: -30 },
      { F: 4, deg: -150 },
    ]);
    expect(R.F).toBeCloseTo(0, 12);
  });

  it('misst den Winkel zwischen zwei Richtungen', () => {
    expect(angleBetween(0, 90)).toBe(90);
    expect(angleBetween(170, -170)).toBe(20);
    expect(angleBetween(-30, 150)).toBe(180);
    expect(angleBetween(45, 45)).toBe(0);
  });

  it('zerlegt eine Kraft in zwei Richtungen', () => {
    // senkrecht: F · cos α und F · sin α
    const d = decompose({ F: 5, deg: 40 }, 0, 90)!;
    expect(d.a).toBeCloseTo(5 * Math.cos((40 * Math.PI) / 180), 12);
    expect(d.b).toBeCloseTo(5 * Math.sin((40 * Math.PI) / 180), 12);
    // 6 N nach unten in zwei Richtungen unter 120°: je 6 N (negativ: gegen die gewählte Richtung)
    const e = decompose({ F: 6, deg: -90 }, 150, 30)!;
    expect(Math.abs(e.a)).toBeCloseTo(6, 10);
    expect(Math.abs(e.b)).toBeCloseTo(6, 10);
    // Probe: die Komponenten ergeben wieder die Kraft
    const back = addVec(toVec({ F: e.a, deg: 150 }), toVec({ F: e.b, deg: 30 }));
    expect(back[0]).toBeCloseTo(0, 10);
    expect(back[1]).toBeCloseTo(-6, 10);
    // parallele Richtungen: keine Zerlegung
    expect(decompose({ F: 5, deg: 40 }, 10, 190)).toBeNull();
  });

  it('berechnet die Seilkraft F_S = F_G / (2 · sin α)', () => {
    const FG = 2 * G;
    expect(ropeForce(FG, 30)).toBeCloseTo(FG, 12);
    expect(ropeForce(FG, 90)).toBeCloseTo(FG / 2, 12);
    expect(ropeForce(FG, 5)).toBeCloseTo(FG / (2 * Math.sin((5 * Math.PI) / 180)), 12);
    expect(ropeForce(FG, 5)).toBeGreaterThan(5 * FG);
    expect(ropeForce(FG, 0)).toBe(Infinity);
    // je flacher, desto größer
    expect(ropeForce(FG, 10)).toBeGreaterThan(ropeForce(FG, 20));
    expect(sagAngle(1, 1)).toBeCloseTo(45, 12);
    expect(sagAngle(2, 0)).toBe(0);
  });
});
