import { describe, expect, it } from 'vitest';
import {
  addLevels,
  band,
  beatEnvelope,
  beatFreq,
  dbFromAmplitude,
  dbFromIntensity,
  displacement,
  echoDistance,
  echoMinDistance,
  echoTime,
  freqFromLambda,
  harmonics,
  pipeFreq,
  stringFreq,
  stringSpeed,
  tensionFor,
  hearingThreshold,
  audible,
  hearingRisk,
  intensityFromSpl,
  medium,
  noteOf,
  period,
  pressureDev,
  pressureFromSpl,
  soundSpeedAir,
  splAtDistance,
  splFromPressure,
  twoTones,
  waveform,
  wavelength,
} from '../src/simulations/physik/schall/model';

describe('Schall: Prüfwerte aus dem Auftrag', () => {
  it('f = 440 Hz, c = 343 m/s → λ ≈ 0,780 m, T ≈ 2,27 ms', () => {
    expect(wavelength(343, 440)).toBeCloseTo(0.7795, 4);
    expect(period(440) * 1000).toBeCloseTo(2.273, 3);
  });
  it('doppelte Amplitude → +6 dB Schalldruckpegel', () => {
    expect(dbFromAmplitude(2)).toBeCloseTo(6.02, 2);
    expect(dbFromIntensity(2)).toBeCloseTo(3.01, 2);
  });
});

describe('Schall: Ausbreitung', () => {
  it('Luft bei 20 °C ≈ 343 m/s, bei 0 °C 331,3 m/s', () => {
    expect(soundSpeedAir(20)).toBeCloseTo(343.2, 1);
    expect(soundSpeedAir(0)).toBeCloseTo(331.3, 6);
  });
  it('Wasser ≈ 4,3-mal so schnell wie Luft; Vakuum leitet keinen Schall', () => {
    expect(medium('water').c / medium('air').c).toBeCloseTo(4.33, 1);
    expect(medium('vacuum').c).toBe(0);
    expect(medium('???').id).toBe('air');
  });
  it('λ = c/f umkehrbar: 20 Hz → 17,15 m, 20 kHz → 1,7 cm', () => {
    expect(wavelength(343, 20)).toBeCloseTo(17.15, 2);
    expect(wavelength(343, 20000) * 100).toBeCloseTo(1.715, 3);
    expect(freqFromLambda(343, 0.78)).toBeCloseTo(439.7, 1);
  });
  it('Längswelle: Teilchen um eine Wellenlänge versetzt schwingen gleich; Druck um λ/4 versetzt', () => {
    const lam = 0.78;
    expect(displacement(0.1, 0.002, 440, lam, 1)).toBeCloseTo(displacement(0.1 + lam, 0.002, 440, lam, 1), 10);
    expect(pressureDev(0, 0, 440, lam)).toBeCloseTo(1, 12);
    expect(displacement(0, 0, 440, lam, 1)).toBeCloseTo(0, 12);
  });
});

describe('Schall: Klangfarbe und Töne', () => {
  it('Sinus hat nur den Grundton; Rechteck nur ungerade Teiltöne mit 1/k', () => {
    expect(harmonics('sine', 5)).toEqual([1, 0, 0, 0, 0]);
    const sq = harmonics('square', 6);
    expect(sq[1]).toBe(0);
    expect(sq[2]).toBeCloseTo(1 / 3, 12);
  });
  it('Schwingung ist periodisch mit T = 1/f und bleibt im Bereich ±1,3', () => {
    for (const t of ['sine', 'flute', 'clarinet', 'violin', 'square', 'saw'] as const) {
      expect(waveform(t, 220, 0.0013)).toBeCloseTo(waveform(t, 220, 0.0013 + 1 / 220), 9);
      for (let i = 0; i < 200; i++) expect(Math.abs(waveform(t, 220, i / 44000))).toBeLessThan(1.3);
    }
  });
  it('Tonnamen: 440 Hz = a4, 261,63 Hz = c4, 880 Hz eine Oktave höher', () => {
    expect(noteOf(440)).toMatchObject({ midi: 69, cents: 0, de: 'a4', en: 'A4' });
    expect(noteOf(261.63)).toMatchObject({ midi: 60, cents: 0, de: 'c4' });
    expect(noteOf(880).midi).toBe(81);
    expect(noteOf(450).cents).toBe(39);
  });
});

describe('Schall: Pegel', () => {
  it('Schalldruck ↔ Pegel: 20 µPa = 0 dB, 1 Pa ≈ 94 dB', () => {
    expect(splFromPressure(20e-6)).toBeCloseTo(0, 12);
    expect(splFromPressure(1)).toBeCloseTo(93.98, 2);
    expect(pressureFromSpl(94)).toBeCloseTo(1.0024, 3);
    expect(intensityFromSpl(120)).toBeCloseTo(1, 12);
  });
  it('doppelte Entfernung → −6 dB; zwei gleich laute Quellen → +3 dB', () => {
    expect(splAtDistance(80, 1, 2)).toBeCloseTo(73.98, 2);
    expect(splAtDistance(80, 1, 10)).toBeCloseTo(60, 12);
    expect(addLevels([60, 60])).toBeCloseTo(63.01, 2);
    expect(addLevels([80, 60])).toBeCloseTo(80.04, 2);
  });
  it('Gefahr fürs Gehör: ab 85 dB auf Dauer, ab 120 dB sofort', () => {
    expect(hearingRisk(60)).toBe('safe');
    expect(hearingRisk(90)).toBe('long');
    expect(hearingRisk(125)).toBe('danger');
  });
  it('Infraschall, Hörschall, Ultraschall', () => {
    expect(band(10)).toBe('infra');
    expect(band(440)).toBe('audible');
    expect(band(40000)).toBe('ultra');
  });
});

describe('Schall: Schwebung und Echo', () => {
  it('440 Hz und 444 Hz → 4 Schwebungen pro Sekunde', () => {
    expect(beatFreq(440, 444)).toBe(4);
    expect(beatEnvelope(440, 444, 0.125)).toBeCloseTo(0, 12);
    expect(Math.abs(twoTones(440, 444, 0.125))).toBeLessThan(0.02);
  });
  it('Echo: Wand in 170 m → ≈ 1 s; Mindestabstand für ein getrenntes Echo ≈ 17 m', () => {
    expect(echoTime(171.5, 343)).toBeCloseTo(1, 12);
    expect(echoDistance(1, 343)).toBeCloseTo(171.5, 12);
    expect(echoMinDistance(343)).toBeCloseTo(17.15, 12);
  });
});

describe('Schall: Hörschwelle', () => {
  it('bei 1 kHz etwa 3 dB, am empfindlichsten um 3 – 4 kHz, bei 20 Hz über 70 dB', () => {
    expect(hearingThreshold(1000)).toBeCloseTo(3.37, 1);
    expect(hearingThreshold(3300)).toBeLessThan(-4);
    expect(hearingThreshold(20)).toBeGreaterThan(70);
    expect(audible(1000, 20)).toBe(true);
    expect(audible(50, 20)).toBe(false);
    expect(audible(30000, 100)).toBe(false);
  });
});

describe('Schall: Saite und Pfeife', () => {
  it('Gitarrensaite: L = 0,65 m, F = 70 N, μ = 0,4 g/m → f ≈ 322 Hz; halbe Länge → Oktave', () => {
    const f = stringFreq(0.65, 70, 0.4e-3);
    expect(f).toBeCloseTo(321.8, 0);
    expect(stringFreq(0.325, 70, 0.4e-3) / f).toBeCloseTo(2, 12);
    expect(stringFreq(0.65, 280, 0.4e-3) / f).toBeCloseTo(2, 12);
    expect(stringFreq(0.65, 70, 0.4e-3, 3) / f).toBeCloseTo(3, 12);
    expect(stringSpeed(70, 0.4e-3)).toBeCloseTo(418.3, 1);
    expect(tensionFor(0.65, f, 0.4e-3)).toBeCloseTo(70, 9);
  });
  it('Pfeife 0,5 m in Luft: offen 343 Hz, gedackt 171,5 Hz, gedackt nur ungerade Obertöne', () => {
    expect(pipeFreq(0.5, 343, true)).toBeCloseTo(343, 12);
    expect(pipeFreq(0.5, 343, false)).toBeCloseTo(171.5, 12);
    expect(pipeFreq(0.5, 343, false, 2) / pipeFreq(0.5, 343, false, 1)).toBeCloseTo(3, 12);
    expect(pipeFreq(0.5, 343, true, 2) / pipeFreq(0.5, 343, true, 1)).toBeCloseTo(2, 12);
  });
});
