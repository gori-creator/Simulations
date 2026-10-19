import { describe, expect, it } from 'vitest';
import {
  convert,
  conversionText,
  decEquals,
  digitsOf,
  formatDec,
  illustrationPair,
  mixedText,
  mixedTime,
  parseAmount,
  placeDigits,
  placeLabel,
  plain,
  QUANTITIES,
  QUANTITY_IDS,
  randomTask,
  readTable,
  relationText,
  tableResult,
  tableUnits,
  timeChain,
  type Dec,
  type QuantityId,
} from '../src/simulations/mathematik/einheiten/model';

/** Wert aus Text lesen (Test-Hilfe). */
const d = (s: string): Dec => {
  const v = parseAmount(s);
  if (!v) throw new Error(`ungültig: ${s}`);
  return v;
};
/** Ergebnis der Umrechnung in schlichter Schreibweise. */
const conv = (q: QuantityId, v: string, from: string, to: string): string => plain(convert(q, d(v), from, to)!.result);
const NB = ' ';

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

describe('Modell: Einheiten – Zahlen lesen und schreiben', () => {
  it('liest Dezimalkomma, Dezimalpunkt und Gliederung', () => {
    expect(plain(d('3,5'))).toBe('3.5');
    expect(plain(d('3.5'))).toBe('3.5');
    expect(plain(d('3 500'))).toBe('3500');
    expect(plain(d('1.000,25'))).toBe('1000.25');
    expect(plain(d(',5'))).toBe('0.5');
    expect(plain(d('007,500'))).toBe('7.5');
    expect(plain(d('0'))).toBe('0');
  });

  it('lehnt ungültige Eingaben ab', () => {
    for (const s of ['', '  ', 'abc', '3,5,1', '−2', '-2', '2e3', '1,2345678', '1234567890']) expect(parseAmount(s), s).toBeNull();
  });

  it('gliedert in Dreiergruppen mit Dezimalkomma bzw. -punkt', () => {
    expect(formatDec(d('3500'), 'de')).toBe(`3${NB}500`);
    expect(formatDec(d('1000000'), 'de')).toBe(`1${NB}000${NB}000`);
    expect(formatDec(d('1000000'), 'en')).toBe('1,000,000');
    expect(formatDec(d('0,045'), 'de')).toBe('0,045');
    expect(formatDec(d('0.045'), 'en')).toBe('0.045');
    expect(formatDec(d('999'), 'de')).toBe('999');
    expect(digitsOf(d('0,7'))).toEqual({ int: '0', frac: '7' });
  });
});

describe('Modell: Einheiten – Prüfwerte der Leitung', () => {
  it('Länge', () => {
    expect(conv('len', '3,5', 'km', 'm')).toBe('3500');
    expect(conv('len', '250', 'cm', 'm')).toBe('2.5');
    expect(conv('len', '7', 'mm', 'cm')).toBe('0.7');
    expect(conv('len', '1', 'm', 'mm')).toBe('1000');
    expect(conversionText(convert('len', d('3,5'), 'km', 'm')!, 'de')).toBe(`3,5 km = 3${NB}500 m`);
    expect(convert('len', d('3,5'), 'km', 'm')!.shift).toBe(3);
    expect(convert('len', d('250'), 'cm', 'm')!.shift).toBe(-2);
  });

  it('Masse', () => {
    expect(conv('mass', '2,4', 't', 'kg')).toBe('2400');
    expect(conv('mass', '45', 'g', 'kg')).toBe('0.045');
    expect(conv('mass', '1', 'kg', 'mg')).toBe('1000000');
    expect(conversionText(convert('mass', d('45'), 'g', 'kg')!, 'de')).toBe('45 g = 0,045 kg');
  });

  it('Flächeninhalt', () => {
    expect(conv('area', '1', 'm2', 'dm2')).toBe('100');
    expect(conv('area', '1', 'm2', 'cm2')).toBe('10000');
    expect(conv('area', '1', 'a', 'm2')).toBe('100');
    expect(conv('area', '1', 'ha', 'm2')).toBe('10000');
    expect(conv('area', '3,5', 'm2', 'dm2')).toBe('350');
    expect(conv('area', '1', 'km2', 'ha')).toBe('100');
    expect(relationText('area', QUANTITIES.area.units[3]!, QUANTITIES.area.units[2]!, 'de')).toBe('1 m² = 100 dm²');
  });

  it('Volumen mit Liter und Milliliter', () => {
    expect(conv('vol', '1', 'm3', 'dm3')).toBe('1000');
    expect(conv('vol', '1', 'm3', 'l')).toBe('1000');
    expect(conv('vol', '1', 'dm3', 'cm3')).toBe('1000');
    expect(conv('vol', '1', 'cm3', 'ml')).toBe('1');
    expect(conv('vol', '1', 'dm3', 'l')).toBe('1');
    expect(conv('vol', '2,5', 'l', 'ml')).toBe('2500');
    expect(conversionText(convert('vol', d('2,5'), 'l', 'ml')!, 'de')).toBe(`2,5 l = 2${NB}500 ml`);
  });

  it('Zeit (Umrechnungszahlen 60, 60, 24)', () => {
    expect(conv('time', '1', 'h', 'min')).toBe('60');
    expect(conv('time', '1', 'h', 's')).toBe('3600');
    expect(conv('time', '1', 'd', 'h')).toBe('24');
    expect(conv('time', '0,5', 'h', 'min')).toBe('30');
    expect(conv('time', '135', 'min', 'h')).toBe('2.25');
    expect(mixedText(mixedTime(d('135'), 'min', 'h'), 'de')).toBe('2 h 15 min');
    expect(mixedText(mixedTime(d('2,25'), 'h', 'min'), 'de')).toBe('2 h 15 min');
    expect(mixedText(mixedTime(d('150'), 's', 'min'), 'de')).toBe('2 min 30 s');
    expect(mixedText(mixedTime(d('10000'), 's', 'h'), 'de')).toBe('2 h 46 min 40 s');
    expect(mixedText(mixedTime(d('120'), 'min', 'h'), 'de')).toBe('2 h');
    expect(mixedText(mixedTime(d('0'), 'min', 'h'), 'de')).toBe('0 h');
  });

  it('Zeit: Kette über die Nachbareinheiten', () => {
    const chain = timeChain(d('2'), 'd', 's');
    expect(chain.map((s) => [s.to.id, s.factor, s.multiply])).toEqual([
      ['h', 24, true],
      ['min', 60, true],
      ['s', 60, true],
    ]);
    expect(chain.map((s) => s.value.num / s.value.den)).toEqual([BigInt(48), BigInt(2880), BigInt(172800)]);
    const up = timeChain(d('135'), 'min', 'h');
    expect(up).toHaveLength(1);
    expect(up[0]!.multiply).toBe(false);
  });

  it('Zeit: nicht abbrechende Ergebnisse werden als gerundet markiert', () => {
    const c = convert('time', d('100'), 'min', 'h')!;
    expect(c.exact).toBe(false);
    expect(plain(c.result)).toBe('1.666667');
    expect(conversionText(c, 'de')).toBe('100 min ≈ 1,666 667 h');
    expect(mixedText(mixedTime(d('100'), 'min', 'h'), 'de')).toBe('1 h 40 min');
  });
});

describe('Modell: Einheiten – Einheitentafel', () => {
  it('hat die richtigen Spalten je Einheit', () => {
    const len = tableUnits('len').map((t) => [t.unit.id, t.hi, t.lo]);
    expect(len).toEqual([
      ['km', 8, 6],
      ['m', 5, 3],
      ['dm', 2, 2],
      ['cm', 1, 1],
      ['mm', 0, 0],
    ]);
    const area = tableUnits('area');
    expect(area).toHaveLength(7);
    for (const t of area) expect(t.hi - t.lo).toBe(1);
    for (const t of tableUnits('vol')) expect(t.hi - t.lo).toBe(2);
    for (const t of tableUnits('mass')) expect(t.hi - t.lo).toBe(2);
    expect(placeLabel('len', 8, 'de')).toBe('H');
    expect(placeLabel('len', 3, 'de')).toBe('E');
    expect(placeLabel('len', 2, 'de')).toBe('');
    expect(placeLabel('len', 9, 'de')).toBe('T');
    expect(placeLabel('len', -1, 'de')).toBe('z');
    expect(placeLabel('mass', 7, 'en')).toBe('T');
  });

  it('legt Ziffern in die Spalten und ergänzt Nullen', () => {
    // 3,5 km: 3 in km-E (Spalte 6), 5 in m-H (Spalte 5)
    expect(placeDigits(d('3,5'), 6)).toEqual([
      { col: 6, digit: '3' },
      { col: 5, digit: '5' },
    ]);
    const r = tableResult(d('3,5'), 6, 3);
    expect(r.cells.map((c) => c.digit).join('')).toBe('3500');
    expect(r.cells.filter((c) => c.added).map((c) => c.col)).toEqual([4, 3]);
    // 45 g → kg: blasse Nullen vor dem Komma und dahinter
    const g = tableResult(d('45'), 3, 6);
    expect(g.cells.map((c) => (c.added ? `(${c.digit})` : c.digit)).join('')).toBe('(0)(0)45');
    expect(readTable(g.cells, 6)).toEqual(d('0,045'));
    // 0,7 cm → mm: die führende 0 fällt weg
    const z = tableResult(d('0,7'), 1, 0);
    expect(z.dropped).toEqual([{ col: 1, digit: '0' }]);
    expect(plain(readTable(z.cells, 0))).toBe('7');
    // 250 cm → m: die Endnull fällt weg
    expect(plain(readTable(tableResult(d('250'), 1, 3).cells, 3))).toBe('2.5');
  });

  it('Tafel und Rechnung stimmen für viele Zufallswerte überein', () => {
    const rnd = rng(42);
    for (const q of ['len', 'mass', 'area', 'vol'] as const) {
      const units = QUANTITIES[q].units;
      for (let i = 0; i < 300; i++) {
        const v: Dec = { n: BigInt(Math.floor(rnd() * 100000)), k: Math.floor(rnd() * 4) };
        const a = units[Math.floor(rnd() * units.length)]!;
        const b = units[Math.floor(rnd() * units.length)]!;
        const c = convert(q, v, a.id, b.id)!;
        const t = tableResult(v, a.exp, b.exp);
        expect(decEquals(readTable(t.cells, b.exp), c.result), `${plain(v)} ${a.id} → ${b.id}`).toBe(true);
      }
    }
  });
});

describe('Modell: Einheiten – Plausibilität', () => {
  it('Hin- und Rückumrechnung ergibt den Ausgangswert (alle Größen)', () => {
    const rnd = rng(7);
    for (const q of QUANTITY_IDS) {
      const units = QUANTITIES[q].units;
      for (let i = 0; i < 400; i++) {
        const v: Dec = { n: BigInt(Math.floor(rnd() * 1000000)), k: Math.floor(rnd() * 4) };
        const a = units[Math.floor(rnd() * units.length)]!;
        const b = units[Math.floor(rnd() * units.length)]!;
        const there = convert(q, v, a.id, b.id)!;
        if (q === 'time') {
          // Rückweg über den exakten Bruch
          const back = (there.ratio.num * BigInt(b.exp)) * BigInt(10 ** v.k);
          expect(back, `${plain(v)} ${a.id} → ${b.id}`).toBe(v.n * BigInt(a.exp) * there.ratio.den);
          if (there.exact) expect(decEquals(convert(q, there.result, b.id, a.id)!.result, v)).toBe(true);
        } else {
          const back = convert(q, there.result, b.id, a.id)!;
          expect(decEquals(back.result, v), `${plain(v)} ${a.id} → ${b.id}`).toBe(true);
        }
      }
    }
  });

  it('Zufallsaufgaben sind gültig, verschieden und gehen auf', () => {
    const rnd = rng(123);
    for (const q of QUANTITY_IDS) {
      const seen = new Set<string>();
      for (let i = 0; i < 200; i++) {
        const t = randomTask(q, rnd);
        expect(t.from).not.toBe(t.to);
        const c = convert(q, t.value, t.from, t.to)!;
        expect(c, q).not.toBeNull();
        expect(c.exact).toBe(true);
        expect(t.value.n > BigInt(0)).toBe(true);
        expect(parseAmount(plain(t.value))).toEqual(t.value);
        seen.add(`${plain(t.value)} ${t.from} ${t.to}`);
      }
      expect(seen.size, q).toBeGreaterThan(20);
    }
  });

  it('Grenzfall 0 und gleiche Einheit', () => {
    expect(conv('len', '0', 'km', 'mm')).toBe('0');
    expect(conv('time', '0', 'd', 's')).toBe('0');
    expect(conv('mass', '4,2', 'kg', 'kg')).toBe('4.2');
    expect(convert('len', d('1'), 'km', 'xx')).toBeNull();
    const zero = tableResult(d('0'), 6, 3);
    expect(zero.cells).toEqual([{ col: 3, digit: '0', added: true }]);
  });

  it('wählt ein anschauliches Einheitenpaar', () => {
    const pair = (q: QuantityId, a: string, b: string) => {
      const p = illustrationPair(q, a, b);
      return `${p.big.id}/${p.small.id}/${p.factor}`;
    };
    expect(pair('len', 'cm', 'mm')).toBe('cm/mm/10');
    expect(pair('len', 'm', 'cm')).toBe('m/cm/100');
    expect(pair('len', 'km', 'm')).toBe('km/m/1000');
    expect(pair('len', 'km', 'cm')).toBe('dm/cm/10');
    expect(pair('area', 'm2', 'cm2')).toBe('m2/cm2/10000');
    expect(pair('vol', 'l', 'ml')).toBe('dm3/cm3/1000');
    expect(pair('mass', 'kg', 'mg')).toBe('g/mg/1000');
    expect(pair('time', 'h', 's')).toBe('min/s/60');
    expect(pair('time', 'd', 'h')).toBe('d/h/24');
    expect(pair('mass', 't', 't')).toBe('t/kg/1000');
  });
});
