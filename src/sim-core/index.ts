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
export {
  Camera3D,
  closestOnLine,
  convexHull2D,
  foldNet,
  intersectRayPlane,
  lightIntensity,
  mesh3d,
  meshTopology,
  mixColor,
  parseColor,
  pointInPolygon,
  shade,
  vec3,
  View3D,
  type AxesStyle3D,
  type FaceStyle3D,
  type GridStyle3D,
  type Handle3D,
  type LabelStyle3D,
  type Layer3D,
  type LineStyle3D,
  type Mesh3D,
  type NetFace3D,
  type MeshStyle3D,
  type PointStyle3D,
  type Projected,
  type Projection,
  type Vec2,
  type Vec3,
  type View3DOptions,
} from './view3d';
