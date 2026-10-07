/**
 * Öffentliche Schnittstelle für Simulationen. Neue Simulationen importieren
 * nur von hier:
 *
 *   import { defineSimulation, Surface, Plot } from '../../sim-core';
 */
export { defineSimulation } from './types';
export type {
  ActionDef,
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
  UpdateSource,
  ValuesOf,
} from './types';
export { Surface, TapTarget, type Rect } from './surface';
export { Plot, type Handle, type PlotOptions } from './plot';
export { Clock, FixedStepper } from './clock';
export { Formatter, formatNumber, formatPiFraction, MINUS } from './format';
export * as term from './formula';
export * from './numeric';
export { ease, mixPoint, prefersReducedMotion, seededRandom, Tween, type Easing } from './anim';
export { drawImageFit, roundRect, softShadow, text, withAlpha } from './draw';
export { ImageStore, simAssetUrl } from './images';
