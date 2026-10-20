import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  angleFromPercent,
  angleFromSides,
  COPY_FACTORS,
  exactNumber,
  exactValue,
  EYE_HEIGHT,
  inverse,
  ladder,
  LADDER_MAX,
  LADDER_MIN,
  percentFromAngle,
  ramp,
  ratio,
  ratioParts,
  roleOf,
  roles,
  scaledRoles,
  sideOf,
  sides,
  SPECIAL_ANGLES,
  tower,
  trig,
  unitCircle,
  type Fn,
  type Ref,
} from '../src/simulations/mathematik/sin-cos-tan-dreieck/model';

const FNS: Fn[] = ['sin', 'cos', 'tan'];

describe('Modell: Seiten und Seitenverhältnisse', () => {
  it('Prüfwert α = 30°, c = 6: a = 3, b = 6·cos 30° ≈ 5,196, tan 30° ≈ 0,5774', () => {
    const s = sides({ alpha: 30, c: 6 });
    expect(s.a).toBeCloseTo(3, 12);
    expect(s.b).toBeCloseTo(3 * Math.sqrt(3), 12);
    expect(s.b).toBeCloseTo(5.196, 3);
    expect(ratio({ alpha: 30, c: 6 }, 'a', 'sin')).toBeCloseTo(0.5, 12);
    expect(trig('tan', 30)).toBeCloseTo(0.5774, 4);
  });

  it('Prüfwert α = 35°, c = 6: a ≈ 3,441, b ≈ 4,915, tan 35° ≈ 0,7002', () => {
    const s = sides({ alpha: 35, c: 6 });
    expect(s.a).toBeCloseTo(3.441, 3);
    expect(s.b).toBeCloseTo(4.915, 3);
    expect(ratio({ alpha: 35, c: 6 }, 'a', 'tan')).toBeCloseTo(0.7002, 4);
  });

  it('Schulbuchwerte: sin 35° ≈ 0,574, cos 35° ≈ 0,819, tan 45° = 1, tan 70° ≈ 2,747', () => {
    expect(trig('sin', 35)).toBeCloseTo(0.5736, 4);
    expect(trig('cos', 35)).toBeCloseTo(0.8192, 4);
    expect(trig('tan', 45)).toBeCloseTo(1, 12);
    expect(trig('tan', 70)).toBeCloseTo(2.7475, 4);
  });

  it('Prüfwerte 45° und 60°: sin 45° = cos 45° = √2/2 ≈ 0,7071; sin 60° = √3/2 ≈ 0,8660; tan 60° = √3 ≈ 1,732', () => {
    expect(trig('sin', 45)).toBeCloseTo(Math.SQRT2 / 2, 12);
    expect(trig('cos', 45)).toBeCloseTo(0.7071, 4);
    expect(trig('sin', 60)).toBeCloseTo(0.866, 4);
    expect(trig('tan', 60)).toBeCloseTo(Math.sqrt(3), 12);
    expect(trig('tan', 60)).toBeCloseTo(1.732, 3);
  });

  it('Bezugswinkel β: Gegenkathete und Ankathete tauschen', () => {
    const t = { alpha: 35, c: 6 };
    const ra = roles(t, 'a');
    const rb = roles(t, 'b');
    expect(rb.opp).toBe(ra.adj);
    expect(rb.adj).toBe(ra.opp);
    expect(rb.angle).toBe(55);
    expect(ratio(t, 'b', 'cos')).toBeCloseTo(trig('cos', 55), 12);
    expect(roleOf('a', 'a')).toBe('opp');
    expect(roleOf('a', 'b')).toBe('adj');
    expect(roleOf('b', 'b')).toBe('opp');
    expect(roleOf('c', 'b')).toBe('hyp');
    for (const ref of ['a', 'b'] as Ref[]) for (const role of ['opp', 'adj', 'hyp'] as const) expect(roleOf(sideOf(role, ref), ref)).toBe(role);
  });

  it('Zähler und Nenner: sin = GK : HY, cos = AK : HY, tan = GK : AK', () => {
    expect(ratioParts('sin')).toEqual({ num: 'opp', den: 'hyp' });
    expect(ratioParts('cos')).toEqual({ num: 'adj', den: 'hyp' });
    expect(ratioParts('tan')).toEqual({ num: 'opp', den: 'adj' });
  });

  it('Ähnliche Dreiecke: Seiten wachsen mit k, das Verhältnis bleibt', () => {
    const t = { alpha: 40, c: 8 };
    for (const f of FNS) {
      const { num, den } = ratioParts(f);
      for (const k of COPY_FACTORS) {
        const r = scaledRoles(t, 'a', k);
        expect(r.hyp).toBeCloseTo(8 * k, 12);
        expect(r[num] / r[den]).toBeCloseTo(trig(f, 40), 12);
      }
      for (const c of [2, 4.5, 10]) expect(ratio({ alpha: 40, c }, 'a', f)).toBeCloseTo(trig(f, 40), 12);
    }
  });
});

describe('Modell: Einheitskreis und besondere Werte', () => {
  it('Einheitskreis: P = (cos α | sin α), T = (1 | tan α), |OP| = 1', () => {
    const u = unitCircle(35);
    expect(u.P[0]).toBeCloseTo(0.8192, 4);
    expect(u.P[1]).toBeCloseTo(0.5736, 4);
    expect(Math.hypot(u.P[0], u.P[1])).toBeCloseTo(1, 12);
    expect(u.T[1]).toBeCloseTo(0.7002, 4);
    // T liegt auf dem Strahl OP (Strahlensatz: tan α : 1 = sin α : cos α)
    expect(u.T[1] / u.T[0]).toBeCloseTo(u.P[1] / u.P[0], 12);
  });

  it('tan 90° ist nicht definiert', () => {
    expect(trig('tan', 90)).toBe(Infinity);
    expect(exactValue('tan', 90)).toBeNull();
  });

  it('exakte Werte: ½, √2/2, √3/2, √3/3, √3 stimmen mit den Dezimalwerten überein', () => {
    for (const f of FNS) {
      for (const a of SPECIAL_ANGLES) {
        const e = exactValue(f, a);
        if (e === null) continue;
        expect(e).toBeDefined();
        expect(exactNumber(e!)).toBeCloseTo(trig(f, a), 12);
      }
    }
    expect(exactValue('sin', 30)).toEqual({ n: 1, d: 2, r: 1 });
    expect(exactValue('tan', 30)).toEqual({ n: 1, d: 3, r: 3 });
    expect(exactValue('tan', 60)).toEqual({ n: 1, d: 1, r: 3 });
    expect(exactValue('sin', 35)).toBeUndefined();
  });
});

describe('Modell: Winkel aus Seiten (rückwärts)', () => {
  it('3-4-5-Dreieck: sin α = 0,6, cos α = 0,8, tan α = 0,75, α ≈ 36,87°', () => {
    const s = angleFromSides('sin', 3, 0, 5);
    expect(s.ok).toBe(true);
    expect(s.value).toBeCloseTo(0.6, 12);
    expect(s.adj).toBeCloseTo(4, 12);
    expect(s.angle).toBeCloseTo(36.87, 2);
    const c = angleFromSides('cos', 0, 4, 5);
    expect(c.value).toBeCloseTo(0.8, 12);
    expect(c.opp).toBeCloseTo(3, 12);
    expect(c.angle).toBeCloseTo(36.87, 2);
    const t = angleFromSides('tan', 3, 4, 0);
    expect(t.value).toBeCloseTo(0.75, 12);
    expect(t.hyp).toBeCloseTo(5, 12);
    expect(t.angle).toBeCloseTo(36.8699, 4);
  });

  it('Umkehrtasten: sin⁻¹(0,5) = 30°, cos⁻¹(0,5) = 60°, tan⁻¹(1) = 45°', () => {
    expect(inverse('sin', 0.5)).toBeCloseTo(30, 10);
    expect(inverse('cos', 0.5)).toBeCloseTo(60, 10);
    expect(inverse('tan', 1)).toBeCloseTo(45, 10);
    expect(inverse('sin', 4.7 / 5)).toBeCloseTo(70.05, 1);
  });

  it('Sonderfall: Kathete so lang wie oder länger als die Hypotenuse → kein Dreieck', () => {
    const r = angleFromSides('sin', 6, 0, 5);
    expect(r.ok).toBe(false);
    expect(r.value).toBeCloseTo(1.2, 12);
    expect(Number.isNaN(r.angle)).toBe(true);
    expect(angleFromSides('cos', 0, 5, 5).ok).toBe(false);
    expect(Number.isNaN(inverse('sin', 1.2))).toBe(true);
    // beim Tangens geht jedes Verhältnis
    expect(angleFromSides('tan', 9, 2, 0).ok).toBe(true);
    expect(angleFromSides('tan', 9, 2, 0).angle).toBeCloseTo(77.47, 2);
  });
});

describe('Modell: Anwendungen', () => {
  it('Rampe: 6 % → α = tan⁻¹ 0,06 ≈ 3,43°; Höhe 0,5 m → waagrecht ≈ 8,33 m', () => {
    expect(angleFromPercent(6)).toBeCloseTo(3.434, 3);
    const r = ramp(6, 0.5);
    expect(r.run).toBeCloseTo(8.333, 3);
    expect(r.slope).toBeCloseTo(Math.hypot(25 / 3, 0.5), 12);
    expect(r.slope).toBeCloseTo(8.348, 3);
    expect(r.tan).toBeCloseTo(0.06, 12);
  });

  it('Prozent und Grad sind verschieden: 6° ≈ 10,5 %, 45° = 100 %', () => {
    expect(percentFromAngle(6)).toBeCloseTo(10.51, 2);
    expect(percentFromAngle(45)).toBeCloseTo(100, 10);
    expect(angleFromPercent(100)).toBeCloseTo(45, 10);
  });

  it('Leiter 4 m bei 70°: Höhe ≈ 3,759 m, Fußabstand ≈ 1,368 m, sicher', () => {
    const l = ladder(4, 70);
    expect(l.height).toBeCloseTo(3.759, 3);
    expect(l.foot).toBeCloseTo(1.368, 3);
    expect(l.safety).toBe('ok');
    expect(ladder(4, 60).safety).toBe('flat');
    expect(ladder(4, 80).safety).toBe('steep');
    expect(ladder(4, LADDER_MIN).safety).toBe('ok');
    expect(ladder(4, LADDER_MAX).safety).toBe('ok');
  });

  it('Turm: d = 50 m, Höhenwinkel 32°, Augenhöhe 1,5 m → h ≈ 32,74 m', () => {
    const t = tower(50, 32);
    expect(t.above).toBeCloseTo(31.24, 2);
    expect(t.height).toBeCloseTo(31.24 + EYE_HEIGHT, 2);
    expect(tower(40, 45, 0).height).toBeCloseTo(40, 10);
  });
});

describe('Plausibilität über viele Zufallswerte', () => {
  it('sin² + cos² = 1, sin α = cos(90° − α), tan = sin : cos, Pythagoras, Umkehrung', () => {
    const rnd = seededRandom(9310);
    for (let i = 0; i < 500; i++) {
      const al = 0.5 + rnd() * 89;
      const c = 0.5 + rnd() * 12;
      const t = { alpha: al, c };
      const s = sides(t);
      const sn = trig('sin', al);
      const cs = trig('cos', al);
      expect(sn * sn + cs * cs).toBeCloseTo(1, 12);
      expect(sn).toBeCloseTo(trig('cos', 90 - al), 12);
      expect(trig('tan', al)).toBeCloseTo(sn / cs, 9);
      expect(s.a ** 2 + s.b ** 2).toBeCloseTo(c * c, 9);
      expect(ratio(t, 'a', 'sin')).toBeCloseTo(ratio(t, 'b', 'cos'), 12);
      for (const f of FNS) {
        expect(inverse(f, ratio(t, 'a', f))).toBeCloseTo(al, 8);
        expect(ratio(t, 'b', f)).toBeCloseTo(trig(f, 90 - al), 9);
      }
      // rückwärts aus zwei Seiten
      const r = roles(t, 'a');
      expect(angleFromSides('sin', r.opp, 0, r.hyp).angle).toBeCloseTo(al, 7);
      expect(angleFromSides('cos', 0, r.adj, r.hyp).angle).toBeCloseTo(al, 7);
      expect(angleFromSides('tan', r.opp, r.adj, 0).angle).toBeCloseTo(al, 8);
      // Prozent ↔ Grad
      expect(angleFromPercent(percentFromAngle(al))).toBeCloseTo(al, 8);
      // sin und cos zwischen 0 und 1, tan > 0
      expect(sn).toBeGreaterThan(0);
      expect(sn).toBeLessThan(1);
      expect(trig('tan', al)).toBeGreaterThan(0);
    }
  });
});

describe('Prüfrunde: Aufgaben, Beispiele und Reglergrenzen', () => {
  it('Aufgabe 2: β = 55°, sin β = b : c ≈ 0,819 = cos 35°, cos β = a : c ≈ 0,574 = sin 35°', () => {
    const t = { alpha: 35, c: 6 };
    const rb = roles(t, 'b');
    expect(rb.angle).toBe(55);
    expect(rb.opp / rb.hyp).toBeCloseTo(0.819, 3);
    expect(rb.adj / rb.hyp).toBeCloseTo(0.574, 3);
    expect(ratio(t, 'b', 'sin')).toBeCloseTo(trig('cos', 35), 12);
    expect(ratio(t, 'b', 'cos')).toBeCloseTo(trig('sin', 35), 12);
  });

  it('Beispiel „Bezugswinkel β“ (α = 35°, c = 8): a ≈ 4,59 (Ankathete), b ≈ 6,55 (Gegenkathete), tan 55° ≈ 1,428', () => {
    const r = roles({ alpha: 35, c: 8 }, 'b');
    expect(r.adj).toBeCloseTo(4.589, 3);
    expect(r.opp).toBeCloseTo(6.553, 3);
    expect(trig('tan', 55)).toBeCloseTo(1.4281, 4);
  });

  it('Ausprobieren 4: tan 85° ≈ 11,43 bei c = 10 (a ≈ 9,96, b ≈ 0,87)', () => {
    const s = sides({ alpha: 85, c: 10 });
    expect(s.a).toBeCloseTo(9.962, 3);
    expect(s.b).toBeCloseTo(0.8716, 4);
    expect(ratio({ alpha: 85, c: 10 }, 'a', 'tan')).toBeCloseTo(11.43, 2);
  });

  it('Reglergrenzen α = 5° … 85°, c = 2 … 10: Dreieck existiert, alle Werte endlich und positiv', () => {
    for (const al of [5, 85]) {
      for (const c of [2, 10]) {
        const s = sides({ alpha: al, c });
        expect(s.a).toBeGreaterThan(0);
        expect(s.b).toBeGreaterThan(0);
        expect(s.a).toBeLessThan(c);
        expect(s.b).toBeLessThan(c);
        for (const f of FNS) expect(Number.isFinite(ratio({ alpha: al, c }, 'a', f))).toBe(true);
      }
    }
  });

  it('Rückwärts an den Reglergrenzen (0,5 … 12 cm): Kathete = Hypotenuse ist kein Dreieck, knapp darunter schon', () => {
    expect(angleFromSides('sin', 12, 0, 12).ok).toBe(false);
    expect(angleFromSides('cos', 0, 0.5, 0.5).ok).toBe(false);
    const r = angleFromSides('sin', 11.9, 0, 12);
    expect(r.ok).toBe(true);
    expect(r.angle).toBeCloseTo(82.598, 3);
    expect(r.adj).toBeCloseTo(Math.sqrt(144 - 141.61), 12);
    expect(angleFromSides('tan', 12, 0.5, 0).angle).toBeCloseTo(87.61, 2);
  });

  it('Rampe an den Reglergrenzen: 2 % → 1,15°, 30 % → 16,70°; h = 1,5 m bei 2 % → 75 m waagrecht', () => {
    expect(angleFromPercent(2)).toBeCloseTo(1.146, 3);
    expect(angleFromPercent(30)).toBeCloseTo(16.699, 3);
    expect(ramp(2, 1.5).run).toBeCloseTo(75, 10);
  });
});
