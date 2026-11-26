import { describe, expect, it } from 'vitest';
import {
  am,
  checkTask,
  dipoleLength,
  fm,
  fmInstantFrequency,
  frequencyOf,
  GADGETS,
  isIonizing,
  makeTask,
  photonEnergyEv,
  regionOf,
  REGIONS,
  TARGETS,
  travelTime,
  wavelengthOf,
} from '../src/simulations/physik/em-spektrum/model';

describe('Elektromagnetisches Spektrum', () => {
  it('Bereiche schließen lückenlos aneinander an', () => {
    for (let k = 1; k < REGIONS.length; k++) expect(REGIONS[k]!.min).toBe(REGIONS[k - 1]!.max);
  });

  it('ordnet Wellenlängen richtig zu', () => {
    expect(regionOf(550e-9)).toBe('visible');
    expect(regionOf(10e-6)).toBe('ir');
    expect(regionOf(0.12)).toBe('micro');
    expect(regionOf(3)).toBe('radio');
    expect(regionOf(250e-9)).toBe('uv');
    expect(regionOf(0.1e-9)).toBe('xray');
    expect(regionOf(1e-13)).toBe('gamma');
  });

  it('Frequenz und Photonenenergie', () => {
    expect(frequencyOf(3)).toBeCloseTo(99.93e6, -4);
    expect(photonEnergyEv(500e-9)).toBeCloseTo(2.48, 2);
    expect(isIonizing(500e-9)).toBe(false);
    expect(isIonizing(50e-9)).toBe(true);
  });

  it('λ/2-Dipol für UKW 100 MHz ist etwa 1,5 m lang', () => {
    expect(dipoleLength(100e6)).toBeCloseTo(1.499, 3);
  });

  it('AM-Hüllkurve und FM-Momentanfrequenz', () => {
    // Bei sin(ω_s t) = 1 ist die Amplitude 1 + m
    const fs = 1;
    const fc = 20;
    const t = 0.25 + 1 / (4 * fc) - (0.25 / fc) * 0; // in der Nähe des Maximums der Hüllkurve
    expect(Math.abs(am(0.2625, fc, fs, 0.5))).toBeLessThanOrEqual(1.5 + 1e-9);
    expect(Math.abs(fm(t, fc, fs, 5))).toBeLessThanOrEqual(1);
    expect(fmInstantFrequency(0.25, fc, fs, 5)).toBeCloseTo(25, 10);
    expect(fmInstantFrequency(0.75, fc, fs, 5)).toBeCloseTo(15, 10);
  });
});

describe('Alltag und Laufzeit', () => {
  it('Geräte liegen im erwarteten Bereich', () => {
    const region = (id: keyof typeof GADGETS) => regionOf(wavelengthOf(GADGETS[id].f));
    expect(region('ukw')).toBe('radio');
    expect(region('mikro')).toBe('micro');
    expect(region('wlan')).toBe('micro');
    expect(region('fernbed')).toBe('ir');
    expect(region('lampe')).toBe('visible');
    expect(region('uvlampe')).toBe('uv');
    expect(region('roentgen')).toBe('xray');
    expect(isIonizing(wavelengthOf(GADGETS.roentgen.f))).toBe(true);
    expect(isIonizing(wavelengthOf(GADGETS.handy.f))).toBe(false);
  });
  it('Mikrowelle hat etwa 12 cm Wellenlänge', () => {
    expect(wavelengthOf(GADGETS.mikro.f)).toBeCloseTo(0.122, 3);
  });
  it('Licht braucht gut 8 Minuten von der Sonne und gut 1 s vom Mond', () => {
    expect(travelTime(TARGETS.sonne.d) / 60).toBeCloseTo(8.3, 1);
    expect(travelTime(TARGETS.mond.d)).toBeCloseTo(1.28, 2);
    expect(travelTime(TARGETS.gps.d)).toBeCloseTo(0.0674, 3);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(7)).toEqual(makeTask(7));
    expect(new Set(Array.from({ length: 12 }, (_, i) => makeTask(i + 1).kind)).size).toBe(6);
  });
  it('erkennt die hinterlegte Antwort', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      const v = t.tol === 0 ? String(t.answer) : String(Math.round(t.answer * 1000) / 1000).replace('.', ',');
      expect(checkTask(t, v)).toBe(true);
      expect(checkTask(t, String(t.answer * 3 + 1))).toBe(false);
      if (t.choices) expect(t.answer).toBeLessThanOrEqual(t.choices.length);
    }
    expect(checkTask(makeTask(1), 'MHz')).toBeNull();
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});
