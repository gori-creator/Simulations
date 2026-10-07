import { describe, expect, it } from 'vitest';
import {
  applySteps,
  decidingDigit,
  decrementSteps,
  digitCount,
  digitsOf,
  expandedForm,
  fromDigits,
  groupDigits,
  incrementSteps,
  MAX_NUMBER,
  numberWords,
  placeName,
  roundingNeighbors,
  roundsUp,
  roundTo,
  wordPartsDe,
} from '../src/simulations/mathematik/stellenwerte/model';

describe('Modell: Stellenwerte – Ziffern', () => {
  it('zerlegt Zahlen in Ziffern (Index = Stelle) und setzt sie wieder zusammen', () => {
    expect(digitsOf(4253718).slice(0, 8)).toEqual([8, 1, 7, 3, 5, 2, 4, 0]);
    expect(digitsOf(0)).toHaveLength(12);
    expect(fromDigits(digitsOf(987654321012))).toBe(987654321012);
    expect(fromDigits([0, 10, 0])).toBe(100);
    expect(digitCount(0)).toBe(1);
    expect(digitCount(1000)).toBe(4);
    expect(MAX_NUMBER).toBe(999_999_999_999);
  });

  it('gliedert in Dreiergruppen', () => {
    expect(groupDigits(4253718, 'de')).toBe('4 253 718');
    expect(groupDigits(4253718, 'en')).toBe('4,253,718');
    expect(groupDigits(999, 'de')).toBe('999');
    expect(groupDigits(1000000000, 'en')).toBe('1,000,000,000');
  });

  it('zerlegt in Stellenwerte', () => {
    expect(expandedForm(40506)).toEqual([
      { digit: 4, place: 4, value: 40000 },
      { digit: 5, place: 2, value: 500 },
      { digit: 6, place: 0, value: 6 },
    ]);
    expect(expandedForm(0)).toEqual([]);
  });

  it('kennt die Namen der Stellen', () => {
    expect(placeName(3, 'de')).toBe('Tausender');
    expect(placeName(7, 'de')).toBe('Zehnmillionen');
    expect(placeName(9, 'en')).toBe('billions');
  });
});

describe('Modell: Stellenwerte – Runden', () => {
  it('rundet ab bei 0 bis 4 und auf bei 5 bis 9', () => {
    expect(roundTo(4253718, 3)).toBe(4254000);
    expect(roundTo(4253418, 3)).toBe(4253000);
    expect(roundTo(4253500, 3)).toBe(4254000);
    expect(roundTo(4253499, 3)).toBe(4253000);
    expect(roundTo(347, 1)).toBe(350);
    expect(roundTo(344, 1)).toBe(340);
  });

  it('rundet mit Übertrag über mehrere Stellen', () => {
    expect(roundTo(2996481, 4)).toBe(3000000);
    expect(roundTo(999999999999, 11)).toBe(1_000_000_000_000);
    expect(roundTo(95, 1)).toBe(100);
  });

  it('rundet kleine Zahlen auf hohe Stellen zu 0', () => {
    expect(roundTo(347, 5)).toBe(0);
    expect(roundTo(0, 3)).toBe(0);
    expect(roundTo(50000, 5)).toBe(100000);
  });

  it('bestimmt Nachbarzahlen, Mitte und entscheidende Ziffer', () => {
    expect(roundingNeighbors(4253718, 3)).toEqual({ lower: 4253000, upper: 4254000, mid: 4253500 });
    expect(roundingNeighbors(4253000, 3)).toEqual({ lower: 4253000, upper: 4254000, mid: 4253500 });
    expect(decidingDigit(4253718, 3)).toBe(7);
    expect(decidingDigit(4253718, 1)).toBe(8);
    expect(roundsUp(4253718, 3)).toBe(true);
    expect(roundsUp(4253000, 3)).toBe(false);
    expect(roundsUp(4253418, 3)).toBe(false);
  });
});

describe('Modell: Stellenwerte – Bündeln', () => {
  it('addiert ohne Übertrag', () => {
    const d = digitsOf(4253718);
    expect(incrementSteps(d, 2)).toEqual([{ kind: 'add', place: 2 }]);
  });

  it('bündelt 10 Plättchen zu einem der nächsten Stelle', () => {
    const d = digitsOf(999999);
    const steps = incrementSteps(d, 0)!;
    expect(steps.map((s) => s.kind)).toEqual(['add', 'bundle', 'bundle', 'bundle', 'bundle', 'bundle', 'bundle']);
    expect(fromDigits(applySteps(d, steps))).toBe(1000000);
    expect(applySteps(d, steps).every((c) => c >= 0 && c <= 9)).toBe(true);
  });

  it('entbündelt, wenn die Spalte leer ist', () => {
    const d = digitsOf(1000);
    const steps = decrementSteps(d, 0)!;
    expect(steps).toEqual([
      { kind: 'unbundle', place: 3 },
      { kind: 'unbundle', place: 2 },
      { kind: 'unbundle', place: 1 },
      { kind: 'remove', place: 0 },
    ]);
    expect(fromDigits(applySteps(d, steps))).toBe(999);
    expect(applySteps(d, steps).slice(0, 4)).toEqual([9, 9, 9, 0]);
  });

  it('verhindert negative Zahlen und Überlauf', () => {
    expect(decrementSteps(digitsOf(5), 1)).toBeNull();
    expect(decrementSteps(digitsOf(0), 0)).toBeNull();
    expect(incrementSteps(digitsOf(MAX_NUMBER), 0)).toBeNull();
    expect(incrementSteps(digitsOf(900_000_000_000), 11)).toBeNull();
  });

  it('ergibt bei jedem Schritt n ± Stellenwert', () => {
    for (const n of [0, 7, 99, 1000, 40506, 999999, 123456789]) {
      for (const k of [0, 1, 3, 6]) {
        const up = incrementSteps(digitsOf(n), k);
        if (up) expect(fromDigits(applySteps(digitsOf(n), up))).toBe(n + 10 ** k);
        const down = decrementSteps(digitsOf(n), k);
        if (down) expect(fromDigits(applySteps(digitsOf(n), down))).toBe(n - 10 ** k);
        else expect(n).toBeLessThan(10 ** k);
      }
    }
  });
});

describe('Modell: Stellenwerte – Zahlwörter', () => {
  const de = (n: number) => numberWords(n, 'de');
  const en = (n: number) => numberWords(n, 'en');

  it('schreibt kleine Zahlen richtig', () => {
    expect(de(0)).toBe('null');
    expect(de(1)).toBe('eins');
    expect(de(11)).toBe('elf');
    expect(de(16)).toBe('sechzehn');
    expect(de(17)).toBe('siebzehn');
    expect(de(21)).toBe('einundzwanzig');
    expect(de(30)).toBe('dreißig');
    expect(de(67)).toBe('siebenundsechzig');
    expect(de(100)).toBe('einhundert');
    expect(de(101)).toBe('einhunderteins');
    expect(de(999)).toBe('neunhundertneunundneunzig');
  });

  it('schreibt Zahlen unter einer Million zusammen', () => {
    expect(de(1000)).toBe('eintausend');
    expect(de(1001)).toBe('eintausendeins');
    expect(de(21000)).toBe('einundzwanzigtausend');
    expect(de(101000)).toBe('einhunderteintausend');
    expect(de(253718)).toBe('zweihundertdreiundfünfzigtausendsiebenhundertachtzehn');
  });

  it('schreibt Million und Milliarde getrennt', () => {
    expect(de(4253718)).toBe('vier Millionen zweihundertdreiundfünfzigtausendsiebenhundertachtzehn');
    expect(de(1000000)).toBe('eine Million');
    expect(de(1000001)).toBe('eine Million eins');
    expect(de(21000000)).toBe('einundzwanzig Millionen');
    expect(de(101000000)).toBe('einhunderteine Million');
    expect(de(2500000000)).toBe('zwei Milliarden fünfhundert Millionen');
    expect(de(1000000000)).toBe('eine Milliarde');
    expect(de(1000000000000)).toBe('eine Billion');
  });

  it('ordnet die Teile den Dreiergruppen zu', () => {
    const parts = wordPartsDe(4253718);
    expect(parts.map((p) => p.group)).toEqual([2, 1, 0]);
    expect(parts.map((p) => p.space)).toEqual([false, true, false]);
  });

  it('schreibt englische Zahlwörter (billion = 10⁹)', () => {
    expect(en(0)).toBe('zero');
    expect(en(15)).toBe('fifteen');
    expect(en(42)).toBe('forty-two');
    expect(en(105)).toBe('one hundred and five');
    expect(en(1005)).toBe('one thousand and five');
    expect(en(4253718)).toBe('four million two hundred and fifty-three thousand seven hundred and eighteen');
    expect(en(1000000000)).toBe('one billion');
    expect(en(1000000000000)).toBe('one trillion');
  });
});
