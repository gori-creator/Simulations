import { describe, expect, it } from 'vitest';
import {
  approxScientific,
  cameraX,
  commaShift,
  decimalValue,
  digitCount,
  E_MAX,
  E_MIN,
  floorExp,
  formatDecimal,
  fromScientific,
  groupDigits,
  lengthParts,
  mantissaText,
  mantissaValue,
  nearestObject,
  normalizeDecimal,
  OBJECTS,
  objectExp,
  parseDecimal,
  partialProducts,
  power,
  powerLength,
  powerOfTenDecimal,
  powerOfTenName,
  powerReading,
  superscript,
  toScientific,
  trailingZeros,
  unitPower,
  type Decimal,
} from '../src/simulations/mathematik/zehnerpotenzen/model';

const sci = (s: string) => toScientific(parseDecimal(s)!);

describe('Modell: Zehnerpotenzen – Potenzen', () => {
  it('berechnet die Prüfwerte 10³, 10⁶, 10⁰, 2⁵, 3⁴', () => {
    expect(power(10, 3)).toBe(1000);
    expect(power(10, 6)).toBe(1_000_000);
    expect(power(10, 0)).toBe(1);
    expect(power(2, 5)).toBe(32);
    expect(power(3, 4)).toBe(81);
  });

  it('Sonderfälle: Hochzahl 0 und 1, Grundzahl 1', () => {
    expect(power(7, 0)).toBe(1);
    expect(power(10, 1)).toBe(10);
    expect(power(1, 9)).toBe(1);
    expect(() => power(10, -1)).toThrow();
    expect(() => power(10, 1.5)).toThrow();
  });

  it('baut die Potenz als wiederholte Multiplikation auf', () => {
    expect(partialProducts(3, 4)).toEqual([3, 9, 27, 81]);
    expect(partialProducts(10, 6)).toEqual([10, 100, 1000, 10_000, 100_000, 1_000_000]);
    expect(partialProducts(5, 0)).toEqual([]);
    for (let b = 2; b <= 10; b++) for (let n = 1; n <= 9; n++) expect(partialProducts(b, n)[n - 1]).toBe(power(b, n));
  });

  it('10ⁿ hat n Nullen und n + 1 Ziffern', () => {
    for (let n = 0; n <= 12; n++) {
      expect(trailingZeros(power(10, n))).toBe(n);
      expect(digitCount(power(10, n))).toBe(n + 1);
    }
    expect(trailingZeros(81)).toBe(0);
    expect(trailingZeros(35_000)).toBe(3);
  });

  it('benennt die Zehnerpotenzen', () => {
    expect(powerOfTenName(3, 'de')).toBe('tausend');
    expect(powerOfTenName(6, 'de')).toBe('eine Million');
    expect(powerOfTenName(9, 'de')).toBe('eine Milliarde');
    expect(powerOfTenName(9, 'en')).toBe('one billion');
    expect(powerOfTenName(12, 'de')).toBe('eine Billion');
    expect(powerReading(3, 4, 'de')).toBe('drei hoch vier');
  });

  it('gliedert Ziffern in Dreiergruppen und setzt Hochzahlen hoch', () => {
    expect(groupDigits(1_000_000, 'de')).toBe('1 000 000');
    expect(groupDigits(1_000_000, 'en')).toBe('1,000,000');
    expect(groupDigits(999, 'de')).toBe('999');
    expect(superscript(-3)).toBe('⁻³');
    expect(superscript(10)).toBe('¹⁰');
  });
});

describe('Modell: Zehnerpotenzen – wissenschaftliche Schreibweise', () => {
  it('Prüfwerte: 35 000 = 3,5 · 10⁴; 1 270 000 = 1,27 · 10⁶; 0,0042 = 4,2 · 10⁻³', () => {
    expect(sci('35000')).toEqual({ digits: '35', exponent: 4 });
    expect(mantissaText(sci('35 000')!, 'de')).toBe('3,5');
    expect(sci('1 270 000')).toEqual({ digits: '127', exponent: 6 });
    expect(mantissaText(sci('1270000')!, 'de')).toBe('1,27');
    expect(sci('0,0042')).toEqual({ digits: '42', exponent: -3 });
    expect(mantissaText(sci('0,0042')!, 'en')).toBe('4.2');
  });

  it('Grenzfälle: Zahlen zwischen 1 und 10, Zehnerpotenzen, 0', () => {
    expect(sci('1')).toEqual({ digits: '1', exponent: 0 });
    expect(sci('9,99')).toEqual({ digits: '999', exponent: 0 });
    expect(sci('10')).toEqual({ digits: '1', exponent: 1 });
    expect(sci('1000000')).toEqual({ digits: '1', exponent: 6 });
    expect(sci('0,1')).toEqual({ digits: '1', exponent: -1 });
    expect(sci('12 742 000')).toEqual({ digits: '12742', exponent: 7 });
    expect(sci('0')).toBeNull();
    expect(sci('0,000')).toBeNull();
  });

  it('das Komma wandert genau |n| Stellen', () => {
    const a = commaShift(parseDecimal('35000')!)!;
    expect(a.from - a.to).toBe(4);
    const b = commaShift(parseDecimal('0,0042')!)!;
    expect(b.row).toBe('00042');
    expect(b.from - b.to).toBe(-3);
  });

  it('liest verschiedene Schreibweisen', () => {
    expect(parseDecimal('1.270.000')).toEqual({ int: '1270000', frac: '' });
    expect(parseDecimal('2.5')).toEqual({ int: '2', frac: '5' });
    expect(parseDecimal(' 0,50 ')).toEqual({ int: '0', frac: '5' });
    expect(parseDecimal(',5')).toEqual({ int: '0', frac: '5' });
    expect(parseDecimal('007')).toEqual({ int: '7', frac: '' });
    expect(parseDecimal('abc')).toBeNull();
    expect(parseDecimal('1,2,3')).toBeNull();
    expect(parseDecimal('-5')).toBeNull();
    expect(parseDecimal('')).toBeNull();
    expect(parseDecimal('1'.repeat(14))).toBeNull();
  });

  it('schreibt Dezimalzahlen mit Dreiergruppen und Dezimalkomma', () => {
    expect(formatDecimal({ int: '35000', frac: '' }, 'de')).toBe('35 000');
    expect(formatDecimal({ int: '0', frac: '0042' }, 'de')).toBe('0,0042');
    expect(formatDecimal({ int: '0', frac: '000001' }, 'de')).toBe('0,000 001');
    expect(formatDecimal({ int: '1270000', frac: '' }, 'en')).toBe('1,270,000');
  });

  it('10ⁿ als Dezimalzahl, auch mit negativer Hochzahl', () => {
    expect(powerOfTenDecimal(4)).toEqual({ int: '10000', frac: '' });
    expect(powerOfTenDecimal(0)).toEqual({ int: '1', frac: '' });
    expect(powerOfTenDecimal(-1)).toEqual({ int: '0', frac: '1' });
    expect(powerOfTenDecimal(-3)).toEqual({ int: '0', frac: '001' });
  });

  it('Plausibilität: Hin- und Rückweg über viele Zufallszahlen', () => {
    let seed = 12345;
    const rnd = () => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    };
    for (let k = 0; k < 2000; k++) {
      const intLen = Math.floor(rnd() * 10);
      const fracLen = Math.floor(rnd() * 8);
      let int = '';
      for (let i = 0; i < intLen; i++) int += Math.floor(rnd() * 10);
      let frac = '';
      for (let i = 0; i < fracLen; i++) frac += Math.floor(rnd() * 10);
      const d: Decimal = normalizeDecimal({ int: int || '0', frac });
      const s = toScientific(d);
      if (!s) {
        expect(decimalValue(d)).toBe(0);
        continue;
      }
      // 1 ≤ a < 10, keine Endnullen
      const a = mantissaValue(s);
      expect(a).toBeGreaterThanOrEqual(1);
      expect(a).toBeLessThan(10);
      expect(s.digits.endsWith('0') && s.digits.length > 1).toBe(false);
      // exakt zurück
      expect(fromScientific(s)).toEqual(d);
      // Zahlenwert passt
      const v = decimalValue(d);
      expect(Math.abs(a * 10 ** s.exponent - v) / v).toBeLessThan(1e-12);
      // auch über die Texteingabe
      expect(parseDecimal(formatDecimal(d, 'de'))).toEqual(d);
      expect(parseDecimal(formatDecimal(d, 'en').replace(/,/g, ''))).toEqual(d);
    }
  });

  it('nähert Größen als a · 10ⁿ', () => {
    expect(approxScientific(105)).toEqual({ mantissa: 1.05, exponent: 2 });
    expect(approxScientific(12_742_000)).toEqual({ mantissa: 1.27, exponent: 7 });
    expect(approxScientific(0.007)).toEqual({ mantissa: 7, exponent: -3 });
    expect(approxScientific(9996)).toEqual({ mantissa: 1, exponent: 4 });
  });
});

describe('Modell: Zehnerpotenzen – Einheiten und Zoom', () => {
  it('Prüfwerte: 1 km = 10³ m, 1 m = 10³ mm', () => {
    expect(unitPower('km', 'm')).toBe(3);
    expect(unitPower('m', 'mm')).toBe(3);
    expect(unitPower('m', 'cm')).toBe(2);
    expect(unitPower('mm', 'm')).toBe(-3);
    expect(power(10, unitPower('km', 'mm'))).toBe(1_000_000);
  });

  it('wählt eine passende Einheit', () => {
    expect(powerLength(-3)).toEqual({ value: 1, unit: 'mm' });
    expect(powerLength(-2)).toEqual({ value: 1, unit: 'cm' });
    expect(powerLength(-1)).toEqual({ value: 10, unit: 'cm' });
    expect(powerLength(0)).toEqual({ value: 1, unit: 'm' });
    expect(powerLength(2)).toEqual({ value: 100, unit: 'm' });
    expect(powerLength(3)).toEqual({ value: 1, unit: 'km' });
    expect(powerLength(7)).toEqual({ value: 10_000, unit: 'km' });
    expect(lengthParts(0.007)).toEqual({ value: 7, unit: 'mm' });
    expect(lengthParts(0.08)).toEqual({ value: 8, unit: 'cm' });
    expect(lengthParts(105)).toEqual({ value: 105, unit: 'm' });
    expect(lengthParts(2962)).toEqual({ value: 2.962, unit: 'km' });
    expect(floorExp(2.9999999999)).toBe(3);
    expect(floorExp(-0.5)).toBe(-1);
  });

  it('Objekte: der Größe nach geordnet, ohne Überlappung nebeneinander, im Zoombereich', () => {
    for (let i = 1; i < OBJECTS.length; i++) {
      expect(OBJECTS[i]!.size).toBeGreaterThan(OBJECTS[i - 1]!.size);
      // nebeneinander der Größe nach (die Erde liegt als Kugel unter allem)
      if (OBJECTS[i]!.kind !== 'earth') expect(OBJECTS[i]!.x).toBeGreaterThan(OBJECTS[i - 1]!.x);
    }
    expect(objectExp(OBJECTS[0]!)).toBeCloseTo(E_MIN, 9);
    expect(objectExp(OBJECTS[OBJECTS.length - 1]!)).toBeGreaterThan(E_MAX);
    expect(OBJECTS.find((o) => o.id === 'earth')!.size).toBe(12_742_000);
    expect(OBJECTS[nearestObject(2)]!.id).toBe('field');
    expect(OBJECTS[nearestObject(0)]!.id).toBe('child');
    expect(OBJECTS[nearestObject(7)]!.id).toBe('earth');
  });

  it('die Kamera fährt stetig (ohne Sprünge) und endet über der Erde', () => {
    let prev = cameraX(E_MIN);
    for (let e = E_MIN; e <= E_MAX + 1e-9; e += 0.01) {
      const x = cameraX(e);
      const ratio = x / prev;
      expect(ratio).toBeLessThan(1.2);
      expect(ratio).toBeGreaterThan(1 / 1.2);
      prev = x;
    }
    expect(cameraX(E_MAX)).toBe(OBJECTS.find((o) => o.id === 'earth')!.x);
    expect(cameraX(0.146)).toBeCloseTo(0.8, 2);
  });

  it('Prüfrunde: reale Größen plausibel, Faktor 10 pro Zoom-Stufe, Erde–Sonne', () => {
    const size = (id: string) => OBJECTS.find((o) => o.id === id)!.size;
    expect(size('sand')).toBe(0.001); // Sandkorn ≈ 1 mm
    expect(size('child')).toBeGreaterThan(1.2); // Kind der 5. Klasse ≈ 1,4 m
    expect(size('child')).toBeLessThan(1.6);
    expect(size('peak')).toBe(2962); // Zugspitze
    expect(size('earth') / 1000).toBeCloseTo(12_742, 0); // Erde ≈ 12 700 km Durchmesser
    // eine Stufe in der Hochzahl = Faktor 10
    for (let k = E_MIN; k < E_MAX; k++) {
      const a = powerLength(k);
      const b = powerLength(k + 1);
      const toM = (v: { value: number; unit: string }) => v.value * 10 ** ({ mm: -3, cm: -2, dm: -1, m: 0, km: 3 } as Record<string, number>)[v.unit]!;
      expect(toM(b) / toM(a)).toBeCloseTo(10, 9);
    }
    // Entfernung Erde–Sonne ≈ 149 600 000 km = 1,496 · 10⁸ km
    const s = sci('149 600 000')!;
    expect(s).toEqual({ digits: '1496', exponent: 8 });
    expect(mantissaText(s, 'de')).toBe('1,496');
    // 10¹ = 10, 10⁰ = 1
    expect(power(10, 1)).toBe(10);
    expect(power(10, 0)).toBe(1);
  });
});
