import type { SimulationDefinition } from '../sim-core/types';

/**
 * Verzeichnis aller umgesetzten Simulationen.
 *
 * Jeder Ordner `src/simulations/<fach>/<id>/` mit einer `index.ts` wird
 * automatisch eingetragen; der Ordnername ist die ID. Jede Simulation wird
 * erst geladen, wenn ihre Seite geöffnet wird (eigene JavaScript-Datei). Die
 * ID muss der `id` im Lehrplan (src/curriculum/*.ts) entsprechen – ein Test
 * prüft das.
 */
export type SimulationLoader = () => Promise<SimulationDefinition>;

const modules = import.meta.glob<{ default: SimulationDefinition }>('./*/*/index.ts');

export const registry: Record<string, SimulationLoader> = Object.fromEntries(
  Object.entries(modules).map(([file, load]) => {
    const id = file.split('/')[2] ?? file;
    return [id, () => load().then((m) => m.default)];
  }),
);
