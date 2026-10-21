import { describe, expect, it } from 'vitest';
import {
  alphaFromGiven,
  ANGLE_IDS,
  anglesFromDirections,
  chainValue,
  crossingAngles,
  doubleAngles,
  doubleLayout,
  explain,
  intersect,
  isParallel,
  makeTask,
  norm180,
  partner,
  relation,
  relationHolds,
  type AngleId,
} from '../src/simulations/mathematik/winkel-geradenkreuzung/model';

/** Reproduzierbarer Zufall für die Plausibilitätsprüfung. */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Modell: Winkel an Geradenkreuzungen – einfache Kreuzung', () => {
  it('Schnittwinkel 65°: Scheitelwinkel 65°, Nebenwinkel 115°, Summe 360°', () => {
    const c = crossingAngles(65)!;
    expect(c.alpha).toBe(65);
    expect(c.gamma).toBe(65);
    expect(c.beta).toBe(115);
    expect(c.delta).toBe(115);
    expect(c.alpha + c.beta + c.gamma + c.delta).toBe(360);
    expect(c.alpha + c.beta).toBe(180);
  });

  it('Schnittwinkel 90°: alle vier Winkel 90°', () => {
    const c = crossingAngles(90)!;
    expect([c.alpha, c.beta, c.gamma, c.delta]).toEqual([90, 90, 90, 90]);
  });

  it('Schnittwinkel 0° bzw. 180°: parallel, kein Schnittpunkt', () => {
    expect(crossingAngles(0)).toBeNull();
    expect(crossingAngles(180)).toBeNull();
    expect(anglesFromDirections(30, 30)).toBeNull();
    expect(anglesFromDirections(30, 210)).toBeNull();
  });

  it('Winkel aus zwei Richtungen: 20° und 85° → 65° und 115°', () => {
    expect(anglesFromDirections(20, 85)).toEqual({ alpha: 65, beta: 115 });
    // Normierung auf 0° … 180°: Gegenrichtung beschreibt dieselbe Gerade
    expect(anglesFromDirections(200, 85)).toEqual({ alpha: 65, beta: 115 });
    expect(anglesFromDirections(20, 265)).toEqual({ alpha: 65, beta: 115 });
    expect(anglesFromDirections(85, 20)).toEqual({ alpha: 115, beta: 65 });
    expect(norm180(-30)).toBe(150);
    expect(norm180(180)).toBe(0);
    expect(norm180(359)).toBe(179);
  });

  it('Grenzfälle: fast parallel (1° und 179°) und senkrecht', () => {
    expect(crossingAngles(1)).toEqual({ alpha: 1, beta: 179, gamma: 1, delta: 179 });
    expect(crossingAngles(179)).toEqual({ alpha: 179, beta: 1, gamma: 179, delta: 1 });
    expect(anglesFromDirections(0, 90)).toEqual({ alpha: 90, beta: 90 });
  });

  it('Plausibilität: Summe immer 360°, Scheitelwinkel gleich, Nebenwinkel 180°', () => {
    const r = lcg(7);
    for (let i = 0; i < 500; i++) {
      const a = r() * 360;
      const b = r() * 360;
      const ab = anglesFromDirections(a, b);
      if (!ab) continue;
      const c = crossingAngles(ab.alpha)!;
      expect(c.alpha + c.beta + c.gamma + c.delta).toBeCloseTo(360, 9);
      expect(c.alpha).toBeCloseTo(c.gamma, 12);
      expect(c.alpha + c.beta).toBeCloseTo(180, 9);
      expect(c.alpha).toBeGreaterThan(0);
      expect(c.alpha).toBeLessThan(180);
    }
  });
});

describe('Modell: Winkel an Geradenkreuzungen – Doppelkreuzung', () => {
  it('g ∥ h, s schneidet g unter 50°: alle acht Winkel 50° oder 130°', () => {
    const v = doubleAngles(50, 50);
    for (const id of ANGLE_IDS) expect([50, 130]).toContain(v[id]);
    expect(isParallel(50, 50)).toBe(true);
  });

  it('Stufenwinkel, Wechselwinkel gleich; Nachbarwinkel ergänzen sich zu 180°', () => {
    const v = doubleAngles(50, 50);
    expect(relation('a1', 'a2')).toBe('stufen');
    expect(relation('c1', 'c2')).toBe('stufen');
    expect(relation('a1', 'c2')).toBe('wechsel');
    expect(relation('b1', 'd2')).toBe('wechsel');
    expect(relation('a1', 'd2')).toBe('nachbar');
    expect(relation('b1', 'c2')).toBe('nachbar');
    expect(v.a1).toBe(v.a2);
    expect(v.a1).toBe(v.c2);
    expect(v.b1).toBe(v.d2);
    expect(v.a1 + v.d2).toBe(180);
    expect(v.b1 + v.c2).toBe(180);
    for (const x of ANGLE_IDS) for (const y of ANGLE_IDS) if (relation(x, y)) expect(relationHolds(x, y, 50, 50)).toBe(true);
  });

  it('nicht parallel (50° und 58°): Stufenwinkel verschieden, Differenz 8°', () => {
    const v = doubleAngles(50, 58);
    expect(v.a1).toBe(50);
    expect(v.a2).toBe(58);
    expect(v.a2 - v.a1).toBe(8);
    expect(isParallel(50, 58)).toBe(false);
    expect(relationHolds('a1', 'a2', 50, 58)).toBe(false);
    expect(relationHolds('a1', 'c2', 50, 58)).toBe(false);
    // Scheitel- und Nebenwinkel gelten trotzdem
    expect(relationHolds('a1', 'c1', 50, 58)).toBe(true);
    expect(relationHolds('a2', 'b2', 50, 58)).toBe(true);
  });

  it('Umkehrung: gilt eine Stufen-, Wechsel- oder Nachbarwinkel-Beziehung, dann g ∥ h', () => {
    // Für alle ganzzahligen Winkelpaare: Beziehung erfüllt ⇔ parallel
    for (let w = 1; w <= 179; w++) {
      for (let v = 1; v <= 179; v++) {
        const par = isParallel(w, v);
        expect(relationHolds('a1', 'a2', w, v)).toBe(par); // Stufenwinkel
        expect(relationHolds('b1', 'd2', w, v)).toBe(par); // Wechselwinkel
        expect(relationHolds('a1', 'd2', w, v)).toBe(par); // Nachbarwinkel
      }
    }
    // Prüfwert aus dem Lernmaterial: α₁ = 75°, δ₂ = 105° ⇒ α₂ = 75° ⇒ parallel
    const a2 = 180 - 105;
    expect(isParallel(75, a2)).toBe(true);
    expect(doubleAngles(75, a2).d2).toBe(105);
  });

  it('fast parallel: 1° Unterschied reicht, damit sich g und h schneiden', () => {
    expect(isParallel(50, 51)).toBe(false);
    const L = doubleLayout(70, 50, 51, 1);
    const X = intersect(L.S1, L.dirG, L.S2, L.dirH);
    expect(X).not.toBeNull();
    // weit entfernt: mehr als 50 Abstände S₁S₂
    expect(Math.hypot(X![0], X![1])).toBeGreaterThan(50);
    const P = doubleLayout(70, 50, 50, 1);
    expect(intersect(P.S1, P.dirG, P.S2, P.dirH)).toBeNull();
  });

  it('senkrechte Querlinie: alle acht Winkel 90°', () => {
    const v = doubleAngles(90, 90);
    for (const id of ANGLE_IDS) expect(v[id]).toBe(90);
  });

  it('Beziehungen sind symmetrisch und vollständig benannt', () => {
    let named = 0;
    for (const x of ANGLE_IDS) {
      for (const y of ANGLE_IDS) {
        expect(relation(x, y)).toBe(relation(y, x));
        if (relation(x, y)) named++;
      }
    }
    // je Winkel: 1 Scheitel, 2 Neben, 1 Stufen, 1 Wechsel, 1 Nachbar
    expect(named).toBe(8 * 6);
    expect(partner('a1', 'stufen')).toBe('a2');
    expect(partner('a1', 'wechsel')).toBe('c2');
    expect(partner('a1', 'nachbar')).toBe('d2');
    expect(partner('d2', 'wechsel')).toBe('b1');
    expect(partner('a1', 'scheitel')).toBe('c1');
    expect(partner('a1', 'neben')).toBe('b1');
  });

  it('Lage: g in Richtung σ − w, h in Richtung σ − v, S₁ und S₂ auf s', () => {
    const L = doubleLayout(70, 50, 50, 2);
    expect(L.dirG).toBe(20);
    expect(L.dirH).toBe(20);
    expect(Math.hypot(L.S2[0] - L.S1[0], L.S2[1] - L.S1[1])).toBeCloseTo(4, 12);
    // Winkel zwischen g und s (gegen den Uhrzeigersinn) ist w
    expect(anglesFromDirections(L.dirG, L.dirS)!.alpha).toBe(50);
  });
});

describe('Modell: Winkel an Geradenkreuzungen – Begründen', () => {
  it('direkte Begründungen', () => {
    expect(explain('a1', 'c1')).toEqual([{ from: 'a1', to: 'c1', rel: 'scheitel' }]);
    expect(explain('a1', 'b1')).toEqual([{ from: 'a1', to: 'b1', rel: 'neben' }]);
    expect(explain('a1', 'a2')).toEqual([{ from: 'a1', to: 'a2', rel: 'stufen' }]);
    expect(explain('a1', 'a1')).toEqual([]);
  });

  it('zweistufig, bevorzugt über bekannte Winkel', () => {
    const s = explain('a1', 'b2');
    expect(s).toHaveLength(2);
    expect(chainValue(s, 50)).toBe(130);
    const viaKnown = explain('a1', 'b2', ['b1']);
    expect(viaKnown[0]!.to).toBe('b1');
    expect(viaKnown[1]).toEqual({ from: 'b1', to: 'b2', rel: 'stufen' });
  });

  it('jede Kette liefert den richtigen Wert (g ∥ h, gegeben 50°)', () => {
    for (const given of ANGLE_IDS) {
      const value = doubleAngles(50, 50)[given];
      for (const target of ANGLE_IDS) {
        const steps = explain(given, target);
        expect(chainValue(steps, value)).toBe(doubleAngles(50, 50)[target]);
      }
    }
  });

  it('α₁ aus dem gegebenen Winkel', () => {
    expect(alphaFromGiven('a2', 50)).toBe(50);
    expect(alphaFromGiven('d1', 130)).toBe(50);
    expect(alphaFromGiven('b2', 70)).toBe(110);
  });

  it('Zufallsaufgaben: gültige Werte, nicht zweimal dieselbe', () => {
    const r = lcg(3);
    let prev = makeTask(r);
    for (let i = 0; i < 200; i++) {
      const t = makeTask(r, prev);
      expect(t.value).toBeGreaterThanOrEqual(25);
      expect(t.value).toBeLessThanOrEqual(155);
      expect(t.value % 5).toBe(0);
      expect(t.value).not.toBe(90);
      expect(ANGLE_IDS as readonly AngleId[]).toContain(t.given);
      expect(t.tilt).toBeGreaterThanOrEqual(-15);
      expect(t.tilt).toBeLessThanOrEqual(15);
      expect(Math.abs(t.tilt % 5)).toBe(0);
      expect(t.given !== prev.given || t.value !== prev.value).toBe(true);
      prev = t;
    }
  });
});
