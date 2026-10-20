/**
 * Browser-Teil der Einstellung „Bundesland“ (ohne Abhängigkeiten zum Lehrplan,
 * damit das Skript klein bleibt). Die Rechenlogik steht in region.ts.
 *
 * Die sichtbare Reihenfolge stellt CSS (`order` über `--ro-<land>`) schon vor dem
 * ersten Zeichnen her; dieses Skript zieht die DOM-Reihenfolge nach, damit
 * Tastatur und Bildschirmleser dieselbe Reihenfolge erleben.
 */

const KEY = 'region';
const NONE = 100000;

export function readRegion(): string {
  try {
    return localStorage.getItem(KEY) ?? '';
  } catch {
    return '';
  }
}

export function storeRegion(region: string): void {
  try {
    if (region) localStorage.setItem(KEY, region);
    else localStorage.removeItem(KEY);
  } catch {
    /* z. B. privater Modus – dann gilt die Wahl nur bis zum Neuladen */
  }
}

/** Kinder aller `[data-region-sort]`-Behälter nach dem Land ordnen (ohne Land: ursprüngliche Reihenfolge). */
export function applyRegionOrder(region: string | undefined): void {
  for (const container of document.querySelectorAll<HTMLElement>('[data-region-sort]')) {
    const children = [...container.children] as HTMLElement[];
    children.forEach((child, index) => {
      child.dataset.regionIndex ??= String(index);
    });
    const key = (el: HTMLElement): number => {
      if (!region) return 0;
      try {
        const orders = JSON.parse(el.dataset.regionOrder ?? '{}') as Record<string, number>;
        return orders[region] ?? NONE;
      } catch {
        return NONE;
      }
    };
    const sorted = children
      .map((el) => ({ el, key: key(el), index: Number(el.dataset.regionIndex) }))
      .sort((a, b) => a.key - b.key || a.index - b.index);
    if (sorted.some((e, i) => e.el !== children[i])) container.append(...sorted.map((e) => e.el));
  }
}
