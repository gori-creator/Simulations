import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LANGS } from '../src/i18n/config';
import { defaultValues, sanitize, valuesEqual } from '../src/sim-core/params';
import type { ParamDef, SimulationDefinition } from '../src/sim-core/types';
import { registry } from '../src/simulations/registry';
import { exactTrig, quadrant, tanDefined } from '../src/simulations/mathematik/einheitskreis/model';
import { lineRelation } from '../src/simulations/mathematik/lineare-funktion/model';
import { discriminant, generalToVertex, roots, shapeOf, vertexToGeneral } from '../src/simulations/mathematik/quadratische-funktion/model';
import { evaluate, period, range } from '../src/simulations/mathematik/sinusfunktion/model';

/** Allgemeine Prüfungen, die für jede registrierte Simulation gelten. */
describe.each(Object.entries(registry))('Simulation %s', (id, load) => {
  let def: SimulationDefinition;

  it('lässt sich laden und hat die passende ID', async () => {
    def = await load();
    expect(def.id).toBe(id);
  });

  it('hat eindeutige Parameter mit gültigen Standardwerten', () => {
    const keys = def.params.map((p) => p.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const param of def.params as readonly ParamDef[]) {
      expect(param.key, 'Schlüssel dürfen nicht mit _ beginnen').not.toMatch(/^_/);
      expect(valuesEqual(sanitize(param, param.default), param.default), param.key).toBe(true);
      for (const lang of LANGS) expect(param.label[lang].trim(), param.key).not.toBe('');
      if (param.group) expect(def.groups?.some((g) => g.id === param.group), param.key).toBe(true);
    }
  });

  it('hat Beispiele, die nur gültige Werte setzen', () => {
    const defs = new Map(def.params.map((p) => [p.key, p as ParamDef]));
    for (const preset of def.presets ?? []) {
      for (const [key, value] of Object.entries(preset.values)) {
        const param = defs.get(key);
        expect(param, `${preset.id}: ${key}`).toBeDefined();
        expect(valuesEqual(sanitize(param!, value), value as never), `${preset.id}: ${key}`).toBe(true);
      }
    }
    expect(Object.keys(defaultValues(def.params)).length).toBe(def.params.length);
  });

  it('hat eindeutige Ergebnis-Schlüssel', () => {
    const keys = (def.readouts ?? []).map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('hat eindeutige, beschriftete Aktionen', () => {
    const ids = (def.actions ?? []).map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const action of def.actions ?? []) {
      for (const lang of LANGS) expect(action.label[lang].trim(), action.id).not.toBe('');
    }
  });

  it('führt alle Bilder in docs/BILDER.md auf', () => {
    const doc = readFileSync('docs/BILDER.md', 'utf8');
    const files = Object.values(def.images ?? {});
    for (const file of files) {
      expect(file, 'nur Kleinbuchstaben, Ziffern und Bindestriche').toMatch(/^[a-z0-9-]+\.(webp|png|jpg|svg)$/);
      expect(doc, file).toContain(`src/assets/sims/${id}/${file}`);
    }
    // Abgelegte Bilder müssen auch deklariert sein (sonst werden sie nie geladen).
    const dir = `src/assets/sims/${id}`;
    if (existsSync(dir)) {
      for (const file of readdirSync(dir)) expect(files, `${dir}/${file}`).toContain(file);
    }
  });

  it('setzt in Links im Lernmaterial nur gültige Werte', () => {
    const defs = new Map(def.params.map((p) => [p.key, p as ParamDef]));
    for (const lang of LANGS) {
      const path = `src/content/simulations/${lang}/${id}.md`;
      if (!existsSync(path)) continue;
      const text = readFileSync(path, 'utf8');
      for (const match of text.matchAll(/\]\(\?([^)\s]+)\)/g)) {
        for (const [key, raw] of new URLSearchParams(match[1])) {
          if (key === '_hide' || key === '_lock') continue;
          const param = defs.get(key);
          expect(param, `${path}: ${match[0]}`).toBeDefined();
          const value = param!.type === 'number' ? Number(raw) : param!.type === 'boolean' ? raw === '1' : raw;
          if (param!.type === 'boolean') expect(['0', '1'], `${path}: ${match[0]}`).toContain(raw);
          expect(valuesEqual(sanitize(param!, value), value as never), `${path}: ${match[0]}`).toBe(true);
        }
      }
    }
  });
});

describe('Modell: lineare Funktion', () => {
  it('erkennt Lagebeziehungen', () => {
    expect(lineRelation(1, 2, 1, 2)).toEqual({ kind: 'identical' });
    expect(lineRelation(1, 2, 1, -1)).toEqual({ kind: 'parallel' });
    expect(lineRelation(2, -1, -0.5, 2)).toMatchObject({ kind: 'intersect', perpendicular: true });
    const s = lineRelation(2, 5, 1, 8);
    expect(s).toMatchObject({ kind: 'intersect', x: 3, y: 11, perpendicular: false });
  });
});

describe('Modell: quadratische Funktion', () => {
  it('rechnet zwischen Scheitelpunktform und allgemeiner Form um', () => {
    expect(vertexToGeneral(2, 1, -8)).toEqual({ a: 2, b: -4, c: -6 });
    expect(generalToVertex(2, -4, -6)).toEqual({ d: 1, e: -8 });
    expect(generalToVertex(0, 1, 1)).toBeNull();
  });

  it('bestimmt Nullstellen und Diskriminante', () => {
    expect(roots({ a: 2, b: -4, c: -6 })).toEqual([-1, 3]);
    expect(discriminant({ a: 1, b: 2, c: 3 })).toBe(-8);
    expect(roots({ a: 1, b: 2, c: 3 })).toEqual([]);
  });

  it('beschreibt die Form', () => {
    expect(shapeOf(2)).toBe('stretched');
    expect(shapeOf(-0.5)).toBe('compressed');
    expect(shapeOf(-1)).toBe('normal');
    expect(shapeOf(0)).toBe('none');
  });
});

describe('Modell: Sinusfunktion', () => {
  it('berechnet Werte, Periode und Wertebereich', () => {
    const p = { base: 'sin' as const, a: 2, b: 2, c: Math.PI / 4, d: 1 };
    expect(evaluate(p, Math.PI / 4)).toBeCloseTo(1);
    expect(evaluate(p, Math.PI / 2)).toBeCloseTo(3);
    expect(period(2)).toBeCloseTo(Math.PI);
    expect(range({ a: -2, d: 1 })).toEqual([-1, 3]);
    expect(evaluate({ base: 'cos', a: 1, b: 1, c: 0, d: 0 }, 0)).toBe(1);
  });
});

describe('Modell: Einheitskreis', () => {
  it('kennt exakte Werte', () => {
    expect(exactTrig(30, 'sin')).toBe('1/2');
    expect(exactTrig(120, 'cos')).toBe('−1/2');
    expect(exactTrig(45, 'tan')).toBe('1');
    expect(exactTrig(390, 'sin')).toBe('1/2');
    expect(exactTrig(31, 'sin')).toBeNull();
  });

  it('bestimmt Quadranten und Definitionslücken des Tangens', () => {
    expect(quadrant(30)).toBe(1);
    expect(quadrant(150)).toBe(2);
    expect(quadrant(200)).toBe(3);
    expect(quadrant(300)).toBe(4);
    expect(quadrant(90)).toBe(0);
    expect(tanDefined(90)).toBe(false);
    expect(tanDefined(270)).toBe(false);
    expect(tanDefined(45)).toBe(true);
  });
});
