import { describe, expect, it } from 'vitest';
import { combine, momentumMeV, PARTICLES, pairKinetic, particle, radiusCm } from '../src/simulations/physik/standardmodell/model';

describe('Elementarteilchen', () => {
  it('12 Fermionen und 5 Bosonen', () => {
    expect(PARTICLES.filter((p) => p.kind !== 'boson')).toHaveLength(12);
    expect(PARTICLES.filter((p) => p.kind === 'boson')).toHaveLength(5);
  });

  it('Top-Quark ist das schwerste Teilchen', () => {
    const max = PARTICLES.reduce((a, b) => (a.mass > b.mass ? a : b));
    expect(max.id).toBe('t');
    expect(particle('e').charge).toEqual([-1, 1]);
  });
});

describe('Hadronen aus Quarks', () => {
  it('Proton uud, Neutron udd', () => {
    const p = combine(['u', 'u', 'd']);
    expect(p).toMatchObject({ name: 'p', charge3: 3, baryon3: 3, kind: 'baryon' });
    expect(combine(['d', 'u', 'd'])).toMatchObject({ name: 'n', charge3: 0 });
  });

  it('Antiproton', () => {
    expect(combine(['ub', 'ub', 'db'])).toMatchObject({ name: 'anti-p', charge3: -3, baryon3: -3 });
  });

  it('Pionen und Kaonen', () => {
    expect(combine(['u', 'db'])).toMatchObject({ name: 'π⁺', charge3: 3, baryon3: 0 });
    expect(combine(['d', 'ub']).name).toBe('π⁻');
    expect(combine(['u', 'sb']).name).toBe('K⁺');
  });

  it('nicht erlaubte Kombinationen', () => {
    expect(combine(['u', 'd']).kind).toBe('invalid');
    expect(combine(['u', 'u', 'db']).kind).toBe('invalid');
    expect(combine(['u']).kind).toBe('single');
  });
});

describe('Paarbildung', () => {
  it('Schwelle 1,022 MeV', () => {
    expect(pairKinetic(1)).toBe(0);
    expect(pairKinetic(3.022)).toBeCloseTo(1, 10);
  });

  it('Bahnradius: 1 MeV Bewegungsenergie bei 1 T etwa 0,5 cm', () => {
    const r = radiusCm(momentumMeV(1), 1);
    expect(r).toBeGreaterThan(0.4);
    expect(r).toBeLessThan(0.6);
  });
});
