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
};
