import { describe, expect, it } from 'vitest';
import { smoothDamp, type Follower } from '../src/lib/home/smooth';

function run(target: number, frames: number, dt = 1 / 60, smoothTime = 0.25, maxSpeed = 2400) {
  const s: Follower = { value: 0, velocity: 0 };
  const steps: number[] = [];
  for (let i = 0; i < frames; i++) {
    const before = s.value;
    smoothDamp(s, target, smoothTime, maxSpeed, dt);
    steps.push(s.value - before);
  }
  return { s, steps };
}

describe('smoothDamp', () => {
  it('erreicht das Ziel ohne Überschwingen', () => {
    const { s, steps } = run(400, 120);
    expect(s.value).toBeCloseTo(400, 0);
    expect(Math.max(...steps.map((d, i) => steps.slice(0, i + 1).reduce((a, b) => a + b, 0)))).toBeLessThanOrEqual(400 + 1e-9);
  });

  it('springt nicht: kleiner erster Schritt, Tempo begrenzt', () => {
    const { steps } = run(400, 60);
    expect(steps[0]).toBeLessThan(20);
    expect(Math.max(...steps)).toBeLessThanOrEqual(2400 / 60 + 1e-6);
  });

  it('läuft auch rückwärts', () => {
    const s: Follower = { value: 300, velocity: 0 };
    for (let i = 0; i < 120; i++) smoothDamp(s, 0, 0.25, 2400, 1 / 60);
    expect(s.value).toBeCloseTo(0, 0);
  });
});
