import { defaultValues, isVisible, sanitize, valuesEqual } from './params';
import type { ParamDef, ParamValues } from './types';

/**
 * Speichert den Zustand einer Simulation in der Adresse (Query-String), damit
 * Lehrkräfte genau ihre Einstellung per Link oder QR-Code teilen können.
 *
 * Es werden nur Werte gespeichert, die vom Standard abweichen – so bleiben die
 * Links kurz. Steuerparameter beginnen mit "_" (z. B. `_lock=1`).
 */
export interface ShareFlags {
  /** Regler gesperrt (nur anschauen). */
  lock: boolean;
  /** Als „spoiler“ markierte Ergebnisse verdecken. */
  hide: boolean;
}

export const NO_FLAGS: ShareFlags = { lock: false, hide: false };

function encodeValue(value: ParamValues[string]): string {
  if (typeof value === 'boolean') return value ? '1' : '0';
  return String(value);
}

export function encodeState(defs: readonly ParamDef[], values: ParamValues, flags: ShareFlags = NO_FLAGS): string {
  const params = new URLSearchParams();
  for (const def of defs) {
    const value = values[def.key];
    if (value === undefined || !isVisible(def, values)) continue;
    if (valuesEqual(value, def.default)) continue;
    params.set(def.key, encodeValue(value));
  }
  if (flags.lock) params.set('_lock', '1');
  if (flags.hide) params.set('_hide', '1');
  return params.toString();
}

function parseRaw(def: ParamDef, raw: string): unknown {
  switch (def.type) {
    case 'number':
      return Number(raw.trim().replace(',', '.'));
    case 'boolean':
      if (raw === '1' || raw === 'true') return true;
      if (raw === '0' || raw === 'false') return false;
      return undefined;
    case 'choice':
    case 'text':
      return raw;
  }
}

export function decodeState(
  defs: readonly ParamDef[],
  search: string,
): { values: ParamValues; flags: ShareFlags } {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const values = defaultValues(defs);
  for (const def of defs) {
    const raw = params.get(def.key);
    if (raw === null) continue;
    values[def.key] = sanitize(def, parseRaw(def, raw));
  }
  return {
    values,
    flags: { lock: params.get('_lock') === '1', hide: params.get('_hide') === '1' },
  };
}
