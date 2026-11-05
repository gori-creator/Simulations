import { L } from '../../curriculum/helpers';
import type { KitId } from './kit';
import { CHAPTERS, type LevelInfo } from './levels';
import type { Dir } from './model';

/**
 * Eigene Level (Baukasten): klein beschrieben, als Text im Link teilbar
 * (`#eigen=…`). Kein Konto, kein Server – alles steht im Link selbst.
 */
export interface CustomSpec {
  v: 1;
  /** Titel */
  t: string;
  /** Spalten, Reihen */
  c: number;
  r: number;
  /** Quelle: x, y, Richtung */
  s: [number, number, Dir];
  /** Lager: x, y */
  g: [number, number];
  /** Felsen */
  w: [number, number][];
  /** Zahlen der Quelle (eine oder eine Folge) */
  a: number[];
  /** Was das Lager will (eine Zahl oder eine Folge) */
  b: number[];
  /** Höchstens so viele Maschinen (fehlt: keine Grenze) */
  m?: number;
  /** Werkzeugkasten bis einschließlich Kapitel Nummer k (ab 0) */
  k: number;
}

export const SIZE = { minC: 6, maxC: 20, minR: 5, maxR: 14 };

const isInt = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n);
const inBox = (s: CustomSpec, x: number, y: number) => x >= 0 && y >= 0 && x < s.c && y < s.r;

/** Neues, leeres Level zum Bauen. */
export function blankSpec(): CustomSpec {
  return { v: 1, t: '', c: 12, r: 7, s: [1, 3, 0], g: [10, 3], w: [], a: [3], b: [5], k: 1 };
}

/** Prüfen und aufräumen (z. B. nach dem Lesen aus einem Link); null, wenn unbrauchbar. */
export function cleanSpec(raw: unknown): CustomSpec | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Partial<CustomSpec>;
  if (o.v !== 1 || !isInt(o.c) || !isInt(o.r)) return null;
  const c = Math.min(SIZE.maxC, Math.max(SIZE.minC, o.c));
  const r = Math.min(SIZE.maxR, Math.max(SIZE.minR, o.r));
  const nums = (a: unknown) => (Array.isArray(a) ? a.filter((n): n is number => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 1e6).slice(0, 12) : []);
  const s = o.s;
  const g = o.g;
  if (!Array.isArray(s) || !Array.isArray(g) || !isInt(s[0]) || !isInt(s[1]) || !isInt(g[0]) || !isInt(g[1])) return null;
  const spec: CustomSpec = {
    v: 1,
    t: typeof o.t === 'string' ? o.t.slice(0, 60) : '',
    c,
    r,
    s: [s[0], s[1], ([0, 1, 2, 3] as Dir[]).includes(s[2] as Dir) ? (s[2] as Dir) : 0],
    g: [g[0], g[1]],
    w: Array.isArray(o.w) ? o.w.filter((p): p is [number, number] => Array.isArray(p) && isInt(p[0]) && isInt(p[1])).slice(0, 300) : [],
    a: nums(o.a),
    b: nums(o.b),
    k: isInt(o.k) ? Math.min(CHAPTERS.length - 1, Math.max(0, o.k)) : 1,
  };
  if (isInt(o.m) && o.m >= 0 && o.m <= 9) spec.m = o.m;
  if (!spec.a.length || !spec.b.length) return null;
  if (!inBox(spec, ...spec.s.slice(0, 2) as [number, number]) || !inBox(spec, ...spec.g)) return null;
  if (spec.s[0] === spec.g[0] && spec.s[1] === spec.g[1]) return null;
  spec.w = spec.w.filter(([x, y]) => inBox(spec, x, y) && !(x === spec.s[0] && y === spec.s[1]) && !(x === spec.g[0] && y === spec.g[1]));
  return spec;
}

/** Als kurzer Text für den Link (Base64, URL-tauglich). */
export function encodeSpec(spec: CustomSpec): string {
  const json = JSON.stringify(spec);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeSpec(text: string): CustomSpec | null {
  try {
    const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
    const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
    return cleanSpec(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

/** Bauteile bis einschließlich Kapitel k. */
export function kitUpTo(k: number): KitId[] {
  return CHAPTERS.slice(0, k + 1).flatMap((c) => c.teaches).filter((t): t is KitId => t !== 'belt' && t !== 'pick' && t !== 'seq' && t !== 'eq');
}

/** Spielbares Level aus der Beschreibung. */
export function specToLevel(spec: CustomSpec): LevelInfo {
  const seqSource = spec.a.length > 1;
  const seqTarget = spec.b.length > 1;
  const title = spec.t.trim() || `${spec.a.join(', ')} → ${spec.b.join(', ')}`;
  return {
    id: `e-${encodeSpec(spec).slice(0, 40)}`,
    title: L(title, title),
    hint: L('Eigenes Level aus dem Baukasten.', 'Your own level from the level builder.'),
    cols: spec.c,
    rows: spec.r,
    source: { x: spec.s[0], y: spec.s[1], dir: spec.s[2], value: spec.a[0]!, ...(seqSource ? { values: spec.a } : {}) },
    ...(seqTarget
      ? { targets: [{ x: spec.g[0], y: spec.g[1], need: spec.b.length, accept: { kind: 'seq' as const, values: spec.b } }], ...(seqSource ? {} : { emit: spec.b.length }) }
      : { target: { x: spec.g[0], y: spec.g[1], value: spec.b[0]! }, need: Math.max(3, spec.a.length) }),
    walls: spec.w,
    ...(spec.m !== undefined ? { maxMachines: spec.m } : {}),
    kit: kitUpTo(spec.k),
    custom: true,
    par: Math.abs(spec.s[0] - spec.g[0]) + Math.abs(spec.s[1] - spec.g[1]) + 2,
  };
}
