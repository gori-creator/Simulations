import { describe, expect, it } from 'vitest';
import {
  cascade,
  colorNameOf,
  downFrom,
  ELEMENT_IDS,
  ELEMENTS,
  elementOf,
  energyOf,
  frequencyOf,
  HC_EV_NM,
  hydrogenEnergy,
  hydrogenSeries,
  isAllowed,
  joule,
  lineOf,
  linesOf,
  randomUpper,
  regionOf,
  resolveTransition,
  rydbergWavelength,
  wavelengthOf,
  wavelengthToRgb,
} from '../src/simulations/physik/linienspektren/model';
import { seededRandom } from '../src/sim-core';

/** Wellenlänge des Übergangs u → l eines Elements in nm. */
const lam = (id: keyof typeof ELEMENTS, u: number, l: number) => lineOf(ELEMENTS[id], u, l).lambda;

describe('Modell: Linienspektren und Energieniveaus', () => {
  it('kennt die Konstanten: h · c ≈ 1240 eV · nm, 1 eV = 1,602 · 10⁻¹⁹ J', () => {
    expect(HC_EV_NM).toBeCloseTo(1239.84, 2);
    expect(joule(1)).toBeCloseTo(1.602176634e-19, 28);
  });

  it('Wasserstoff: E_n = −13,6 eV / n²', () => {
    expect(hydrogenEnergy(1)).toBeCloseTo(-13.6, 12);
    expect(hydrogenEnergy(2)).toBeCloseTo(-3.4, 12);
    expect(hydrogenEnergy(3)).toBeCloseTo(-1.5111, 4);
    expect(ELEMENTS.H.levels[2]!.E).toBeCloseTo(-13.6 / 9, 12);
  });

  it('Hα: n = 3 → 2 gibt ΔE ≈ 1,89 eV, f ≈ 4,57 · 10¹⁴ Hz, λ ≈ 656 nm (rot)', () => {
    const l = lineOf(ELEMENTS.H, 3, 2);
    expect(l.dE).toBeCloseTo(1.8889, 4);
    expect(l.f / 1e14).toBeCloseTo(4.567, 2);
    expect(l.lambda).toBeCloseTo(656.4, 0);
    expect(colorNameOf(l.lambda)).toBe('red');
    expect(regionOf(l.lambda)).toBe('vis');
  });

  it('Balmer-Serie: 656, 486, 434, 410 nm; Lyman-α 121,6 nm im UV', () => {
    expect(Math.abs(lam('H', 4, 2) - 486.1)).toBeLessThan(0.6);
    expect(Math.abs(lam('H', 5, 2) - 434.0)).toBeLessThan(0.6);
    expect(Math.abs(lam('H', 6, 2) - 410.2)).toBeLessThan(0.6);
    expect(Math.abs(lam('H', 2, 1) - 121.6)).toBeLessThan(0.2);
    expect(regionOf(lam('H', 2, 1))).toBe('uv');
    expect(regionOf(lam('H', 4, 3))).toBe('ir'); // Paschen-α 1875 nm
    expect(hydrogenSeries(1)).toBe('lyman');
    expect(hydrogenSeries(2)).toBe('balmer');
    expect(hydrogenSeries(3)).toBe('paschen');
  });

  it('Rydberg-Formel stimmt mit ΔE = E_o − E_u überein', () => {
    for (let u = 2; u <= 6; u++) for (let l = 1; l < u; l++) expect(rydbergWavelength(u, l)).toBeCloseTo(lam('H', u, l), 9);
  });

  it('E = h · f und λ = c / f: 2 eV ↔ 4,836 · 10¹⁴ Hz ↔ 619,9 nm', () => {
    expect(frequencyOf(2) / 1e14).toBeCloseTo(4.836, 3);
    expect(wavelengthOf(2)).toBeCloseTo(619.92, 2);
    expect(energyOf(619.92)).toBeCloseTo(2, 4);
    // c = λ · f
    expect(wavelengthOf(2) * 1e-9 * frequencyOf(2)).toBeCloseTo(299792458, -1);
  });

  it('Tabellenwerte: Na-D 589 nm, Hg 546,1 / 435,8 / 404,7 nm, He 587,6 / 667,8 / 501,6 nm', () => {
    expect(Math.abs(lam('Na', 2, 1) - 589.2)).toBeLessThan(0.5);
    expect(Math.abs(lam('Hg', 6, 4) - 546.1)).toBeLessThan(0.5);
    expect(Math.abs(lam('Hg', 6, 3) - 435.8)).toBeLessThan(0.5);
    expect(Math.abs(lam('Hg', 6, 2) - 404.7)).toBeLessThan(0.5);
    expect(Math.abs(lam('Hg', 3, 1) - 253.7)).toBeLessThan(0.5);
    expect(Math.abs(lam('He', 7, 4) - 587.6)).toBeLessThan(0.5);
    expect(Math.abs(lam('He', 8, 5) - 667.8)).toBeLessThan(0.5);
    expect(Math.abs(lam('He', 9, 3) - 501.6)).toBeLessThan(0.5);
    expect(Math.abs(lam('He', 10, 4) - 447.1)).toBeLessThan(0.5);
    // Quecksilber: 6³P₁ liegt 4,89 eV über dem Grundzustand (Franck-Hertz-Versuch)
    expect(ELEMENTS.Hg.levels[2]!.E - ELEMENTS.Hg.levels[0]!.E).toBeCloseTo(4.89, 2);
  });

  it('Ionisierungsenergien: H 13,6 eV, He 24,6 eV, Na 5,14 eV, Hg 10,4 eV', () => {
    expect(-ELEMENTS.H.levels[0]!.E).toBeCloseTo(13.6, 6);
    expect(-ELEMENTS.He.levels[0]!.E).toBeCloseTo(24.587, 3);
    expect(-ELEMENTS.Na.levels[0]!.E).toBeCloseTo(5.139, 3);
    expect(-ELEMENTS.Hg.levels[0]!.E).toBeCloseTo(10.4375, 4);
  });

  it('alle Übergänge führen nach unten und geben positive Photonenenergien', () => {
    for (const id of ELEMENT_IDS) {
      const el = ELEMENTS[id];
      for (let i = 1; i < el.levels.length; i++) expect(el.levels[i]!.E).toBeGreaterThanOrEqual(el.levels[i - 1]!.E);
      for (const ln of linesOf(el)) {
        expect(ln.u).toBeGreaterThan(ln.l);
        expect(ln.dE).toBeGreaterThan(0);
        expect(ln.lambda).toBeGreaterThan(0);
        expect(ln.w).toBeGreaterThan(0);
        expect(ln.w).toBeLessThanOrEqual(1);
      }
      // mindestens eine sichtbare Linie je Element
      expect(linesOf(el).some((ln) => regionOf(ln.lambda) === 'vis')).toBe(true);
    }
  });

  it('wählt bei nicht vorgesehenen Übergängen einen gültigen aus', () => {
    const na = ELEMENTS.Na;
    expect(isAllowed(na, 2, 1)).toBe(true);
    expect(isAllowed(na, 3, 1)).toBe(false); // 4s → 3s kommt nicht vor (Auswahlregel)
    const t = resolveTransition(na, 3, 1);
    expect(isAllowed(na, t.u, t.l)).toBe(true);
    expect(t.u).toBe(3);
    expect(resolveTransition(ELEMENTS.H, 4, 2)).toMatchObject({ u: 4, l: 2 });
    // ungültige Nummern (z. B. aus einem alten Link) → hellste Linie
    const h = resolveTransition(ELEMENTS.H, 9, 8);
    expect(isAllowed(ELEMENTS.H, h.u, h.l)).toBe(true);
    expect(elementOf('xyz').id).toBe('H');
  });

  it('Farben: rot bei 650 nm, grün bei 530 nm, blau bei 450 nm, unsichtbar bei 300 nm', () => {
    const red = wavelengthToRgb(650)!;
    expect(red[0]).toBeGreaterThan(200);
    expect(red[1]).toBeLessThan(30);
    const green = wavelengthToRgb(530)!;
    expect(green[1]).toBeGreaterThan(green[0]);
    expect(green[1]).toBeGreaterThan(green[2]);
    const blue = wavelengthToRgb(450)!;
    expect(blue[2]).toBeGreaterThan(blue[0]);
    expect(blue[2]).toBeGreaterThan(blue[1]);
    expect(wavelengthToRgb(300)).toBeNull();
    expect(wavelengthToRgb(900)).toBeNull();
    expect(colorNameOf(589)).toBe('yellow');
    expect(colorNameOf(410)).toBe('violet');
    expect(colorNameOf(486)).toBe('cyan'); // Hβ: blaugrün wie im Unterricht
    expect(colorNameOf(470)).toBe('blue');
    expect(colorNameOf(434)).toBe('blue'); // Hγ
    expect(colorNameOf(500)).toBe('cyan');
  });

  it('Kaskaden enden im Grundzustand und benutzen nur vorgesehene Übergänge', () => {
    const rand = seededRandom(42);
    for (const id of ELEMENT_IDS) {
      const el = ELEMENTS[id];
      for (let k = 0; k < 200; k++) {
        const u = randomUpper(el, rand);
        const steps = cascade(el, u, rand);
        expect(steps.length).toBeGreaterThan(0);
        let at = u;
        for (const s of steps) {
          expect(s.u).toBe(at);
          expect(isAllowed(el, s.u, s.l)).toBe(true);
          at = s.l;
        }
        expect(downFrom(el, at).length).toBe(0);
      }
    }
  });

  it('Sonderfälle: zu große Nummern, gleiche Niveaus, unteres über oberem', () => {
    const H = ELEMENTS.H;
    // Regler bis 10, Wasserstoff hat 6 Niveaus: höchstes Niveau statt Lyman-α
    expect(resolveTransition(H, 10, 9)).toMatchObject({ u: 6, l: 5 });
    expect(resolveTransition(H, 7, 2)).toMatchObject({ u: 6, l: 2 });
    // gleiche Niveaus bzw. l > u: hellste Linie vom oberen Niveau
    expect(resolveTransition(H, 3, 3)).toMatchObject({ u: 3, l: 2 });
    expect(resolveTransition(H, 3, 5)).toMatchObject({ u: 3, l: 2 });
    for (const id of ELEMENT_IDS) {
      const el = ELEMENTS[id];
      for (let u = 2; u <= 10; u++)
        for (let l = 1; l <= 9; l++) {
          const t = resolveTransition(el, u, l);
          expect(isAllowed(el, t.u, t.l)).toBe(true);
        }
    }
  });

  it('Seriengrenzen und Ionisierung: Balmer 365 nm, Lyman 91 nm, Linien rücken zusammen', () => {
    // n → ∞: ΔE = 0 − E_l
    expect(wavelengthOf(-hydrogenEnergy(2))).toBeCloseTo(364.7, 1);
    expect(wavelengthOf(-hydrogenEnergy(1))).toBeCloseTo(91.2, 1);
    expect(rydbergWavelength(1e9, 2)).toBeCloseTo(364.7, 1);
    // Balmer-Linien werden kürzer und nähern sich der Grenze, Abstände schrumpfen
    const b = [3, 4, 5, 6, 7, 8].map((u) => rydbergWavelength(u, 2));
    for (let i = 1; i < b.length; i++) {
      expect(b[i]!).toBeLessThan(b[i - 1]!);
      expect(b[i]!).toBeGreaterThan(364.7);
    }
    expect(b[4]! - b[5]!).toBeLessThan(b[0]! - b[1]!);
    // Paschen-Grenze im IR
    expect(regionOf(wavelengthOf(-hydrogenEnergy(3)))).toBe('ir');
  });

  it('Lösungen der Aufgaben im Lernmaterial', () => {
    // Aufgabe 1: Hβ
    const hb = lineOf(ELEMENTS.H, 4, 2);
    expect(hb.dE).toBeCloseTo(2.55, 2);
    expect(joule(hb.dE) / 1e-19).toBeCloseTo(4.09, 2);
    expect(hb.f / 1e14).toBeCloseTo(6.17, 2);
    expect(Math.round(hb.lambda)).toBe(486);
    // Aufgabe 2: Lyman-α ≈ 122 nm
    expect(Math.round(lam('H', 2, 1))).toBe(122);
    // Aufgabe 3: Na-D 2,10 eV
    expect(lineOf(ELEMENTS.Na, 2, 1).dE).toBeCloseTo(2.1, 2);
    // Aufgabe 4: Hg 546 nm vom Niveau 7³S₁ (−2,71 eV) nach 6³P₂ (−4,98 eV)
    const hg = ELEMENTS.Hg;
    expect(hg.levels[5]!.label).toBe('7³S₁');
    expect(hg.levels[5]!.E).toBeCloseTo(-2.71, 2);
    expect(hg.levels[3]!.label).toBe('6³P₂');
    expect(hg.levels[3]!.E).toBeCloseTo(-2.71 - energyOf(546), 1);
  });
});
