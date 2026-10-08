import { describe, expect, it } from 'vitest';
import {
  circleOverlap,
  commonTangents,
  coneRadii,
  illuminatedFraction,
  intersect,
  litFraction,
  localTime,
  lunarEclipse,
  mixLight,
  moonPhase,
  moonPosition,
  observerPosition,
  pointShadowSize,
  shadowCone,
  shadowOnScreen,
  solarView,
  solarZones,
  SPACE,
  visibleFraction,
  type P2,
} from '../src/simulations/physik/licht-schatten/model';

describe('Modell: Licht und Schatten – Geometrie', () => {
  it('berechnet die Schnittfläche zweier Kreise', () => {
    expect(circleOverlap(1, 1, 3)).toBe(0);
    expect(circleOverlap(2, 1, 0.5)).toBeCloseTo(Math.PI, 12);
    // zwei Einheitskreise im Abstand 1: 2π/3 − √3/2
    expect(circleOverlap(1, 1, 1)).toBeCloseTo((2 * Math.PI) / 3 - Math.sqrt(3) / 2, 12);
  });

  it('punktförmige Lichtquelle: entweder ganz sichtbar oder ganz verdeckt', () => {
    expect(visibleFraction(0, 1, 0.5)).toBe(0);
    expect(visibleFraction(0, 1, 1.5)).toBe(1);
    expect(visibleFraction(1, 2, 0)).toBe(0);
    expect(visibleFraction(1, 0.5, 0)).toBeCloseTo(0.75, 12);
  });

  it('Schattengröße nach dem Strahlensatz: S = G · b / a', () => {
    expect(pointShadowSize(10, 30, 90)).toBeCloseTo(30, 12);
    const sh = shadowOnScreen({ x: 10, y: 0, r: 0 }, { x: 40, y: 0, r: 5 }, 100);
    expect(sh.umbra).not.toBeNull();
    expect(sh.umbra!.hi - sh.umbra!.lo).toBeCloseTo(30, 12);
    // punktförmig: kein Halbschatten (äußerer Rand = Kernschattenrand)
    expect(sh.outer.hi).toBeCloseTo(sh.umbra!.hi, 12);
  });

  it('Lage des Schattens bei verschobener Lampe (Zentralprojektion)', () => {
    // Lampe 6 cm unter der Achse: Schattenmitte bei −6 + (0 + 6) · 3 = 12 cm
    const sh = shadowOnScreen({ x: 10, y: -6, r: 0 }, { x: 40, y: 0, r: 5 }, 100);
    expect((sh.umbra!.lo + sh.umbra!.hi) / 2).toBeCloseTo(12, 12);
  });

  it('ausgedehnte Lampe: Kernschatten (G·b − d·(b−a))/a und Halbschatten (G·b + d·(b−a))/a', () => {
    const lamp = { x: 10, y: 0, r: 4 };
    const obj = { x: 40, y: 0, r: 5 };
    const sh = shadowOnScreen(lamp, obj, 100);
    const a = 30;
    const b = 90;
    expect(sh.umbra!.hi - sh.umbra!.lo).toBeCloseTo((10 * b - 8 * (b - a)) / a, 12);
    expect(sh.outer.hi - sh.outer.lo).toBeCloseTo((10 * b + 8 * (b - a)) / a, 12);
    expect(sh.apex).toBeNull();
  });

  it('erkennt den Schirm hinter der Spitze des Kernschattenkegels', () => {
    const lamp = { x: 10, y: 0, r: 8 };
    const obj = { x: 40, y: 0, r: 2 };
    // Spitze bei x = 10 + 30 · 8 / 6 = 50
    expect(shadowOnScreen(lamp, obj, 45).apex).toBeCloseTo(50, 12);
    expect(shadowOnScreen(lamp, obj, 45).umbra).not.toBeNull();
    const far = shadowOnScreen(lamp, obj, 100);
    expect(far.umbra).toBeNull();
    expect(far.beyondApex).toBe(true);
  });

  it('Lichtanteil am Schirm: 0 im Kernschatten, 1 außerhalb, dazwischen im Halbschatten', () => {
    const lamp = { x: 10, y: 0, r: 4 };
    const obj = { x: 40, y: 0, r: 5 };
    const sh = shadowOnScreen(lamp, obj, 100);
    expect(litFraction(lamp, obj, 100, 0)).toBe(0);
    expect(litFraction(lamp, obj, 100, sh.outer.hi + 0.5)).toBe(1);
    const mid = litFraction(lamp, obj, 100, (sh.umbra!.hi + sh.outer.hi) / 2);
    expect(mid).toBeGreaterThan(0.2);
    expect(mid).toBeLessThan(0.8);
    // auch senkrecht zur Zeichenebene (z) ist der Schatten rund
    expect(litFraction(lamp, obj, 100, 0, (sh.umbra!.hi + sh.outer.hi) / 2)).toBeCloseTo(mid, 9);
    // vor dem Gegenstand ist es hell
    expect(litFraction(lamp, obj, 30, 0)).toBe(1);
  });

  it('zwei Lampen: Kernschatten nur in der Überlappung', () => {
    const obj = { x: 40, y: 0, r: 5 };
    const a = shadowOnScreen({ x: 10, y: -5, r: 0 }, obj, 100).outer;
    const b = shadowOnScreen({ x: 10, y: 5, r: 0 }, obj, 100).outer;
    const core = intersect(a, b);
    expect(core!.hi - core!.lo).toBeCloseTo(10, 12);
    expect(intersect({ lo: 0, hi: 1 }, { lo: 2, hi: 3 })).toBeNull();
  });

  it('mischt farbiges Licht additiv (Rot + Grün = Gelb)', () => {
    const y = mixLight([[1, 0, 0], [0, 1, 0]], [1, 1]);
    expect(y).toEqual([1, 1, 0]);
    expect(mixLight([[1, 0, 0], [0, 1, 0]], [0, 1])).toEqual([0, 1, 0]);
  });

  it('gemeinsame Tangenten berühren beide Kreise', () => {
    const c1: P2 = [-110, 0];
    const c2: P2 = [0, 0];
    const t = commonTangents(c1, 16, c2, 6);
    const distToLine = (p: P2, a: P2, b: P2) => Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (const [a, b] of [...t.outer, ...t.inner]) {
      expect(distToLine(c1, a, b)).toBeCloseTo(16, 9);
      expect(distToLine(c2, a, b)).toBeCloseTo(6, 9);
    }
  });
});

describe('Modell: Sonnen- und Mondfinsternis (schematisch)', () => {
  it('ordnet Mondstellung, Phase und beleuchteten Anteil zu', () => {
    const m0 = moonPosition(0);
    expect(m0[0]).toBeCloseTo(-SPACE.orbitR, 9); // Neumond: zwischen Erde und Sonne
    expect(moonPosition(180)[0]).toBeCloseTo(SPACE.orbitR, 9);
    expect(moonPhase(0)).toBe('new');
    expect(moonPhase(90)).toBe('firstQuarter');
    expect(moonPhase(180)).toBe('full');
    expect(moonPhase(270)).toBe('lastQuarter');
    expect(illuminatedFraction(90)).toBeCloseTo(0.5, 12);
    expect(illuminatedFraction(180)).toBeCloseTo(1, 12);
  });

  it('Beobachter und Ortszeit: 15° entsprechen einer Stunde', () => {
    expect(localTime(0)).toBe(12);
    expect(localTime(45)).toBe(15);
    const o = observerPosition(0);
    expect(o[0]).toBeCloseTo(-SPACE.earthR, 12);
  });

  it('Sonne und Mond erscheinen von der Erde aus etwa gleich groß', () => {
    const sv = solarView(0, 0);
    expect(sv.moonR / sv.sunR).toBeGreaterThan(1);
    expect(sv.moonR / sv.sunR).toBeLessThan(1.3);
  });

  it('Neumond, Beobachter mittags: totale Sonnenfinsternis', () => {
    const sv = solarView(0, 0);
    expect(sv.kind).toBe('total');
    expect(sv.covered).toBeCloseTo(1, 12);
  });

  it('etwas neben der Linie: partielle, weiter weg: keine Sonnenfinsternis', () => {
    expect(solarView(6, 0).kind).toBe('partial');
    expect(solarView(6, 0).covered).toBeGreaterThan(0);
    expect(solarView(6, 0).covered).toBeLessThan(1);
    expect(solarView(40, 0).kind).toBe('none');
    expect(solarView(90, 0).covered).toBe(0);
  });

  it('weiter entfernter Beobachter: ringförmige Sonnenfinsternis möglich', () => {
    expect(solarView(13, 64).kind).toBe('annular');
  });

  it('der Kernschatten des Mondes trifft nur ein kleines Gebiet der Erde', () => {
    const zones = solarZones(0, 0.5);
    const total = zones.filter((z) => z.kind === 'total').length;
    const partial = zones.filter((z) => z.kind === 'partial').length;
    expect(total).toBeGreaterThan(0);
    expect(partial).toBeGreaterThan(total * 5);
  });

  it('Schattenkegel der Erde: Kernschatten am Ort des Mondes etwa doppelt so breit wie der Mond', () => {
    const cone = shadowCone(SPACE.sunR, SPACE.earthR, -SPACE.sunX);
    const { umbra, penumbra } = coneRadii(cone, SPACE.orbitR);
    expect(umbra / SPACE.moonR).toBeGreaterThan(1.5);
    expect(umbra / SPACE.moonR).toBeLessThan(2.5);
    expect(penumbra).toBeGreaterThan(umbra);
    // Spitze des Kernschattens: Abstand = r / sin(Öffnungswinkel)
    expect(cone.umbraLength).toBeCloseTo(SPACE.earthR / ((SPACE.sunR - SPACE.earthR) / -SPACE.sunX), 9);
  });

  it('Mondfinsternis: total bei Vollmond, partiell und Halbschatten daneben', () => {
    expect(lunarEclipse(180).kind).toBe('total');
    expect(lunarEclipse(166).kind).toBe('partial');
    expect(lunarEclipse(150).kind).toBe('penumbral');
    expect(lunarEclipse(120).kind).toBe('none');
    expect(lunarEclipse(0).kind).toBe('none');
  });
});
