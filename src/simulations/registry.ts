import type { SimulationDefinition } from '../sim-core/types';

/**
 * Verzeichnis aller umgesetzten Simulationen.
 *
 * Jede Simulation wird erst geladen, wenn ihre Seite geöffnet wird (eigene
 * JavaScript-Datei). Der Schlüssel muss der `id` im Lehrplan
 * (src/curriculum/*.ts) entsprechen – ein Test prüft das.
 */
export type SimulationLoader = () => Promise<SimulationDefinition>;

export const registry: Record<string, SimulationLoader> = {
  'lineare-funktion': () => import('./mathematik/lineare-funktion').then((m) => m.default),
  'quadratische-funktion': () => import('./mathematik/quadratische-funktion').then((m) => m.default),
  einheitskreis: () => import('./mathematik/einheitskreis').then((m) => m.default),
  sinusfunktion: () => import('./mathematik/sinusfunktion').then((m) => m.default),
  'binomische-formeln': () => import('./mathematik/binomische-formeln').then((m) => m.default),
  thales: () => import('./mathematik/thales').then((m) => m.default),
  pythagoras: () => import('./mathematik/pythagoras').then((m) => m.default),
  'gesetz-grosse-zahlen': () => import('./mathematik/gesetz-grosse-zahlen').then((m) => m.default),
  ziegenproblem: () => import('./mathematik/ziegenproblem').then((m) => m.default),
  'monte-carlo-pi': () => import('./mathematik/monte-carlo-pi').then((m) => m.default),
  'sekante-tangente': () => import('./mathematik/sekante-tangente').then((m) => m.default),
  galtonbrett: () => import('./mathematik/galtonbrett').then((m) => m.default),
  bruchteile: () => import('./mathematik/bruchteile').then((m) => m.default),
  'kreiszahl-pi': () => import('./mathematik/kreiszahl-pi').then((m) => m.default),
  'exponentielles-wachstum': () => import('./mathematik/exponentielles-wachstum').then((m) => m.default),
  'ober-untersummen': () => import('./mathematik/ober-untersummen').then((m) => m.default),
  'schiefer-wurf': () => import('./physik/schiefer-wurf').then((m) => m.default),
  fadenpendel: () => import('./physik/fadenpendel').then((m) => m.default),
  energieerhaltung: () => import('./physik/energieerhaltung').then((m) => m.default),
  brechung: () => import('./physik/brechung').then((m) => m.default),
};
