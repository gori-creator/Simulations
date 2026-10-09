import { describe, expect, it } from 'vitest';
import { angleBetween, angleType, dirDiff, dragAngle, idealPose, makeTask, measure, norm, points } from '../src/simulations/mathematik/winkel-messen/model';
import { seededRandom } from '../src/sim-core/anim';

describe('Modell: Winkel – Grundlagen', () => {
  it('rechnet Richtungen modulo 360°', () => {
    expect(norm(-30)).toBe(330);
    expect(norm(725)).toBe(5);
    expect(dirDiff(350, 10)).toBe(20);
    expect(dirDiff(90, 270)).toBe(180);
  });

  it('misst ∢ASB gegen den Uhrzeigersinn von [SA nach [SB', () => {
    expect(angleBetween(20, 70)).toBe(50);
    expect(angleBetween(70, 20)).toBe(310);
    // ∢ASB und ∢BSA ergänzen sich zu 360°
    expect(angleBetween(30, 200) + angleBetween(200, 30)).toBe(360);
  });

  it('ordnet die Winkelarten zu', () => {
    expect(angleType(0)).toBe('null');
    expect(angleType(1)).toBe('spitz');
    expect(angleType(89)).toBe('spitz');
    expect(angleType(90)).toBe('recht');
    expect(angleType(91)).toBe('stumpf');
    expect(angleType(180)).toBe('gestreckt');
    expect(angleType(181)).toBe('ueberstumpf');
    expect(angleType(359)).toBe('ueberstumpf');
    expect(angleType(360)).toBe('voll');
  });

  it('springt beim Ziehen nicht über 0°/360° und rastet bei 90° ein', () => {
    expect(dragAngle(350, 365)).toBe(360);
    expect(dragAngle(10, -5)).toBe(0);
    expect(dragAngle(80, 88.6)).toBe(90);
    expect(dragAngle(100, 133.4)).toBe(133);
    expect(dragAngle(170, 181)).toBe(180);
  });
});

describe('Modell: Winkel – Messen mit dem Geodreieck', () => {
  it('liest spitze und stumpfe Winkel an der äußeren Skala ab, wenn die Kante auf [SA liegt', () => {
    for (const [a1, alpha] of [
      [20, 50],
      [200, 125],
      [0, 90],
      [300, 180],
    ]) {
      const m = measure('geo', { atS: true, phi: a1! }, a1!, alpha!);
      expect(m.ok).toBe(true);
      if (!m.ok) continue;
      expect(m.edge).toBe('A');
      expect(m.scale).toBe('outer');
      expect(m.reading).toBe(alpha);
      expect(m.other).toBe(180 - alpha!);
      expect(m.what).toBe('alpha');
    }
  });

  it('liest an der inneren Skala ab, wenn die Kante andersherum auf dem Schenkel liegt', () => {
    // Kante auf [SB, Nullpunkt der inneren Skala bei B: phi zeigt in die Gegenrichtung von [SB
    const m = measure('geo', { atS: true, phi: norm(20 + 50 + 180) }, 20, 50);
    expect(m.ok && m.edge === 'B' && m.scale === 'inner' && m.reading === 50 && m.what === 'alpha').toBe(true);
  });

  it('misst überstumpfe Winkel über den Ergänzungswinkel', () => {
    const pose = idealPose('geo', 10, 230);
    expect(pose.leg).toBe('B');
    const m = measure('geo', { atS: true, phi: pose.phi }, 10, 230);
    expect(m.ok).toBe(true);
    if (m.ok) {
      expect(m.reading).toBe(130);
      expect(m.what).toBe('complement');
      expect(360 - m.reading).toBe(230);
    }
  });

  it('erkennt falsches Anlegen', () => {
    expect(measure('geo', { atS: false, phi: 20 }, 20, 50)).toEqual({ ok: false, reason: 'notAtS' });
    expect(measure('geo', { atS: true, phi: 35 }, 20, 50)).toEqual({ ok: false, reason: 'noEdge' });
    // Kante auf [SA, aber das Geodreieck liegt auf der falschen Seite
    expect(measure('geo', { atS: true, phi: 200 }, 20, 50)).toEqual({ ok: false, reason: 'notUnder' });
    // überstumpf, an [SA angelegt: [SB liegt nicht unter der Skala
    expect(measure('geo', { atS: true, phi: 10 }, 10, 230)).toEqual({ ok: false, reason: 'notUnder' });
  });
});

describe('Modell: Winkel – Vollkreis-Winkelmesser', () => {
  it('liest überstumpfe Winkel direkt ab', () => {
    const m = measure('voll', { atS: true, phi: 10 }, 10, 230);
    expect(m.ok && m.reading === 230 && m.what === 'alpha').toBe(true);
    const fromB = measure('voll', { atS: true, phi: 240 }, 10, 230);
    expect(fromB.ok && fromB.reading === 130 && fromB.what === 'complement').toBe(true);
    const full = measure('voll', { atS: true, phi: 0 }, 0, 360);
    expect(full.ok && full.reading).toBe(360);
  });
});

describe('Modell: Winkel – Schätzspiel', () => {
  it('vergibt Punkte nach der Abweichung', () => {
    expect(points(0)).toBe(3);
    expect(points(3)).toBe(3);
    expect(points(4)).toBe(2);
    expect(points(10)).toBe(2);
    expect(points(-15)).toBe(1);
    expect(points(21)).toBe(0);
  });

  it('erzeugt abwechslungsreiche Aufgaben', () => {
    const rand = seededRandom(11);
    const kinds = { spitz: 0, stumpf: 0, ueberstumpf: 0 } as Record<string, number>;
    let prev: number | undefined;
    for (let i = 0; i < 400; i++) {
      const t = makeTask(rand, i % 2 ? 'zeichnen' : 'schaetzen', prev);
      expect(t.target).toBeGreaterThan(0);
      expect(t.target).toBeLessThan(360);
      expect(t.target).not.toBe(90);
      expect(t.target).not.toBe(180);
      if (t.kind === 'zeichnen') expect(t.target % 5).toBe(0);
      expect(t.a1).toBeGreaterThanOrEqual(0);
      expect(t.a1).toBeLessThan(360);
      kinds[angleType(t.target)] = (kinds[angleType(t.target)] ?? 0) + 1;
      prev = t.target;
    }
    expect(kinds.spitz).toBeGreaterThan(80);
    expect(kinds.stumpf).toBeGreaterThan(80);
    expect(kinds.ueberstumpf).toBeGreaterThan(60);
  });
});
