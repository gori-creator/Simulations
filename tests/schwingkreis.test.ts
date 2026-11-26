import { describe, expect, it } from 'vitest';
import {
  capacitanceFor,
  checkTask,
  dampedPeriod,
  dampingCase,
  energies,
  feedbackAmplitude,
  lcState,
  makeTask,
  RADIO_L,
  resonanceFrequency,
  resonanceResponse,
  springForSamePeriod,
  STATIONS,
  switchOff,
  switchOn,
  thomsonPeriod,
  timeConstant,
  tuning,
} from '../src/simulations/physik/schwingkreis/model';

describe('Schwingkreis', () => {
  it('Thomson-Gleichung mit Lehrbuchwerten', () => {
    // L = 500 H, C = 40 µF: T = 2π·√(0,02) ≈ 0,889 s
    expect(thomsonPeriod(500, 40e-6)).toBeCloseTo(0.8886, 3);
    // Vierfache Kapazität → doppelte Periode
    expect(thomsonPeriod(500, 160e-6) / thomsonPeriod(500, 40e-6)).toBeCloseTo(2, 9);
  });

  it('ungedämpft: Energie bleibt erhalten und wechselt die Form', () => {
    const L = 500;
    const C = 40e-6;
    const q0 = C * 10;
    const E0 = energies(L, C, q0, 0).el;
    const T = thomsonPeriod(L, C);
    for (const f of [0, 0.1, 0.25, 0.4, 0.5, 0.9]) {
      const s = lcState(L, C, 0, q0, f * T);
      const e = energies(L, C, s.q, s.i);
      expect(e.el + e.mag).toBeCloseTo(E0, 9);
    }
    const quarter = lcState(L, C, 0, q0, T / 4);
    expect(quarter.q).toBeCloseTo(0, 9);
    expect(energies(L, C, quarter.q, quarter.i).mag).toBeCloseTo(E0, 9);
    expect(lcState(L, C, 0, q0, T / 2).q).toBeCloseTo(-q0, 9);
  });

  it('Lösung erfüllt die Schwingungsgleichung (auch Grenz- und Kriechfall)', () => {
    const L = 500;
    const C = 40e-6;
    const q0 = 4e-4;
    const Rc = 2 * Math.sqrt(L / C);
    for (const R of [0, 300, Rc, 3 * Rc]) {
      expect(lcState(L, C, R, q0, 0).q).toBeCloseTo(q0, 12);
      expect(lcState(L, C, R, q0, 0).i).toBeCloseTo(0, 12);
      for (const t of [0.05, 0.3, 0.7]) {
        const h = 1e-5;
        const a = lcState(L, C, R, q0, t - h);
        const b = lcState(L, C, R, q0, t);
        const c = lcState(L, C, R, q0, t + h);
        expect((c.q - a.q) / (2 * h)).toBeCloseTo(b.i, 6);
        const qpp = (c.q - 2 * b.q + a.q) / (h * h);
        expect(L * qpp + R * b.i + b.q / C).toBeCloseTo(0, 3);
      }
    }
    expect(dampingCase(L, C, 0)).toBe('none');
    expect(dampingCase(L, C, 300)).toBe('weak');
    expect(dampingCase(L, C, Rc)).toBe('critical');
    expect(dampingCase(L, C, 3 * Rc)).toBe('strong');
    expect(dampedPeriod(L, C, 300)).toBeGreaterThan(thomsonPeriod(L, C));
    expect(dampedPeriod(L, C, 3 * Rc)).toBe(Infinity);
  });

  it('Federpendel mit gleicher Periode', () => {
    const D = springForSamePeriod(500, 40e-6, 0.5);
    expect(2 * Math.PI * Math.sqrt(0.5 / D)).toBeCloseTo(thomsonPeriod(500, 40e-6), 9);
  });
});

describe('Selbstinduktion', () => {
  it('Einschalten: nach τ etwa 63 %, Spulenspannung anfangs U₀', () => {
    const s = switchOn(10, 100, 500, timeConstant(500, 100));
    expect(s.iCoil / 0.1).toBeCloseTo(1 - Math.exp(-1), 9);
    expect(switchOn(10, 100, 500, 0).uL).toBeCloseTo(10, 9);
    expect(switchOn(10, 100, 500, 0).iRes).toBeCloseTo(0.1, 9);
  });
  it('Ausschalten: Strom läuft weiter, Spannungsstoß 2·R·I₀', () => {
    const s = switchOff(10, 100, 500, 0);
    expect(s.iCoil).toBeCloseTo(0.1, 9);
    expect(s.iRes).toBeCloseTo(-0.1, 9);
    expect(Math.abs(s.uL)).toBeCloseTo(20, 9);
    expect(switchOff(10, 100, 500, 2.5).iCoil).toBeCloseTo(0.1 * Math.exp(-1), 9);
  });
});

describe('Radio abstimmen', () => {
  it('Resonanzfrequenz und passende Kapazität', () => {
    const C = capacitanceFor(1e6, RADIO_L);
    expect(resonanceFrequency(RADIO_L, C)).toBeCloseTo(1e6, 3);
    expect(resonanceFrequency(RADIO_L, 127e-12) / 1e3).toBeCloseTo(999, 0);
  });
  it('bei der Eigenfrequenz ist die Antwort 1, daneben kleiner', () => {
    const C = capacitanceFor(1e6, RADIO_L);
    expect(resonanceResponse(1e6, RADIO_L, C, 20)).toBeCloseTo(1, 9);
    expect(resonanceResponse(0.8e6, RADIO_L, C, 20)).toBeLessThan(0.1);
    // größerer Widerstand: breitere Kurve
    expect(resonanceResponse(0.8e6, RADIO_L, C, 200)).toBeGreaterThan(resonanceResponse(0.8e6, RADIO_L, C, 20));
  });
  it('wählt den passenden Sender', () => {
    for (const st of STATIONS) {
      const t = tuning(capacitanceFor(st.f, RADIO_L), 20);
      expect(t.best.id).toBe(st.id);
      expect(t.level).toBeCloseTo(1, 6);
      expect(t.crosstalk).toBeLessThan(0.3);
    }
  });
});

describe('Rückkopplung', () => {
  it('ohne Rückkopplung klingt die Amplitude ab, mit Rückkopplung geht sie gegen 1', () => {
    expect(feedbackAmplitude(5, 0.5, false)).toBeCloseTo(Math.exp(-2.5), 9);
    expect(feedbackAmplitude(30, 0.5, true, 0.15)).toBeCloseTo(1, 3);
    expect(feedbackAmplitude(0, 0.5, true, 0.15)).toBeCloseTo(0.15, 9);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(9)).toEqual(makeTask(9));
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
    expect(checkTask(makeTask(1), 's')).toBeNull();
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});
