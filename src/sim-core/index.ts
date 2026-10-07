/**
 * Öffentliche Schnittstelle für Simulationen. Neue Simulationen importieren
 * nur von hier:
 *
 *   import { defineSimulation, Surface, Plot } from '../../sim-core';
 */
export { defineSimulation } from './types';
export type {
  BooleanParam,
  ChoiceParam,
  NumberParam,
  ParamDef,
  Preset,
  ReadoutDef,
  ReadoutValue,
  SimContext,
  SimInstance,
  SimulationDefinition,
  ValuesOf,
} from './types';
export { Surface, type Rect } from './surface';
export { Plot, type Handle, type PlotOptions } from './plot';
export { Clock, FixedStepper } from './clock';
export { Formatter, formatNumber, formatPiFraction, MINUS } from './format';
export * as term from './formula';
export * from './numeric';
