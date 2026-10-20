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

  it('Sonderfälle: Kraft 0, gleich große Kräfte, Gegenkraft', () => {
    // F₁ = 0: Die Resultierende ist F₂
    const R0 = resultant([{ F: 0, deg: 0 }, { F: 3, deg: 90 }]);
    expect(R0.F).toBeCloseTo(3, 12);
    expect(R0.deg).toBeCloseTo(90, 10);
    // gleich groß und entgegengesetzt: F_R = 0
    expect(resultant([{ F: 5, deg: 30 }, { F: 5, deg: -150 }]).F).toBeCloseTo(0, 12);
    expect(resultantMagnitude(5, 5, 180)).toBeCloseTo(0, 6);
    // gleich groß unter 60°: F · √3, unter 120°: F
    expect(resultantMagnitude(4, 4, 60)).toBeCloseTo(4 * Math.sqrt(3), 12);
    expect(resultantMagnitude(4, 4, 120)).toBeCloseTo(4, 12);
    // Gegenkraft −F_R hebt die Resultierende auf
    const R = resultant([{ F: 5, deg: 20 }, { F: 4, deg: 110 }]);
    expect(resultant([{ F: 5, deg: 20 }, { F: 4, deg: 110 }, { F: R.F, deg: R.deg + 180 }]).F).toBeCloseTo(0, 10);
    // Kraft schräg nach links oben (150°) waagerecht/senkrecht zerlegen: Beträge F · cos 30° und F · sin 30°
    const d = decompose({ F: 5, deg: 150 }, 0, 90)!;
    expect(d.a).toBeCloseTo(-5 * Math.cos(Math.PI / 6), 12);
    expect(d.b).toBeCloseTo(2.5, 12);
  });

  it('Aufgaben des Lernmaterials', () => {
    // A1: 6 N und 8 N senkrecht → 10 N unter 53,1°
    const A1 = resultant([{ F: 6, deg: 0 }, { F: 8, deg: 90 }]);
    expect(A1.F).toBeCloseTo(10, 12);
    expect(A1.deg).toBeCloseTo(53.13, 2);
    // A2: zwei Schlepper je 5 kN unter ±30° → 2 · 5 · cos 30° ≈ 8,66
    const A2 = resultant([{ F: 5, deg: 30 }, { F: 5, deg: -30 }]);
    expect(A2.F).toBeCloseTo(8.660254, 6);
    expect(A2.deg).toBeCloseTo(0, 10);
    // A3: Gegenkraft zu 4 N → und 3 N ↑: 5 N bei −143,1°; mit −143° bleibt weniger als 0,05 N übrig
    const R = resultant([{ F: 4, deg: 0 }, { F: 3, deg: 90 }]);
    expect(R.F).toBeCloseTo(5, 12);
    expect(R.deg - 180).toBeCloseTo(-143.13, 2);
    expect(resultant([{ F: 4, deg: 0 }, { F: 3, deg: 90 }, { F: 5, deg: -143 }]).F).toBeLessThan(0.05);
    // A4: 8 N unter 30° → 6,93 N vorwärts, 4 N nach oben
    const A4 = decompose({ F: 8, deg: 30 }, 0, 90)!;
    expect(A4.a).toBeCloseTo(6.928, 3);
    expect(A4.b).toBeCloseTo(4, 12);
    // A5: 2 kg, 10° → F_G = 19,62 N, F_S ≈ 56,5 N
    const FG = 2 * G;
    expect(FG).toBeCloseTo(19.62, 10);
    expect(ropeForce(FG, 10)).toBeCloseTo(56.49, 2);
    // A6: F_S = F_G bei 30°, bei 5° fast das Sechsfache; Wäscheleine 1,5 kg bleibt im Messbereich 100 N
    expect(ropeForce(FG, 30) / FG).toBeCloseTo(1, 12);
    expect(ropeForce(FG, 5) / FG).toBeCloseTo(5.74, 2);
    expect(ropeForce(1.5 * G, 5)).toBeCloseTo(84.42, 2);
  });
});
