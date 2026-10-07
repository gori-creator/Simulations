import { t } from '../i18n/utils';
import { ease, prefersReducedMotion, Tween } from './anim';
import { MINUS } from './format';
import { clamp } from './numeric';
import type { PointerTarget, Rect, Surface, SurfacePointer } from './surface';

/**
 * 3D-Baustein für Simulationen (nur Canvas 2D, kein WebGL).
 *
 * - `Camera3D`: Kamera auf einer Kugel um einen Zielpunkt (Azimut/Elevation),
 *   perspektivische oder orthografische Projektion, Welt → Bildschirm, Strahl
 *   Bildschirm → Welt. Rein rechnerisch, ohne DOM (testbar).
 * - `View3D`: Zeichenbereich auf einer `Surface` mit Drehen per Ziehen
 *   (Maus, Finger, Stift) inklusive Trägheit, Zoom (Pinch, Strg+Mausrad,
 *   Schaltflächen), Antippen von Flächen und ziehbaren 3D-Punkten. Gezeichnet
 *   wird im „Immediate Mode“ zwischen `begin()` und `end()`: Flächen, Linien,
 *   Punkte und Beschriftungen werden gesammelt, nach Tiefe sortiert
 *   (Maleralgorithmus) und mit einfacher Beleuchtung (Lambert) gezeichnet.
 * - `mesh3d`: Polygonnetze (Quader, Prisma, Pyramide, Zylinder, Kegel, Kugel).
 * - `vec3`: kleine Vektorhilfen.
 *
 * Weltkoordinaten sind rechtshändig mit der x₃-Achse (z) nach oben – wie im
 * Schulunterricht: x₁ zeigt schräg nach vorn, x₂ nach rechts, x₃ nach oben.
 *
 * Beispiel:
 *
 *   const view = new View3D(surface, { radius: 3, azimuth: 32, elevation: 22 });
 *   render() {
 *     view.begin();
 *     view.grid({ min: [-3, -3], max: [3, 3] });
 *     view.axes({ max: 4 });
 *     view.mesh(mesh3d.box([0, 0, 0], [2, 1, 1]), { color: ctx.theme.series[0], hiddenEdges: true });
 *     view.label([2, 1, 1], 'P', { offset: [8, -8] });
 *     view.end();
 *   }
 */

/* ------------------------------------------------------------------ */
/* Vektoren                                                            */
/* ------------------------------------------------------------------ */

export type Vec3 = readonly [number, number, number];
export type Vec2 = readonly [number, number];

/** Vektorhilfen für dreidimensionale Punkte und Richtungen. */
export const vec3 = {
  add: (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  scale: (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a: Vec3, b: Vec3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  length: (a: Vec3): number => Math.hypot(a[0], a[1], a[2]),
  distance: (a: Vec3, b: Vec3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]),
  normalize(a: Vec3): Vec3 {
    const l = Math.hypot(a[0], a[1], a[2]);
    return l > 1e-12 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
  },
  lerp: (a: Vec3, b: Vec3, s: number): Vec3 => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s],
  /** Schwerpunkt der Eckpunkte. */
  centroid(points: readonly Vec3[]): Vec3 {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const p of points) {
      x += p[0];
      y += p[1];
      z += p[2];
    }
    const n = Math.max(1, points.length);
    return [x / n, y / n, z / n];
  },
  /** Normale eines (ebenen) Vielecks nach Newell, Länge 1. Umlauf gegen den Uhrzeigersinn → Normale zeigt zum Betrachter. */
  normal(points: readonly Vec3[]): Vec3 {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < points.length; i++) {
      const a = points[i]!;
      const b = points[(i + 1) % points.length]!;
      x += (a[1] - b[1]) * (a[2] + b[2]);
      y += (a[2] - b[2]) * (a[0] + b[0]);
      z += (a[0] - b[0]) * (a[1] + b[1]);
    }
    return vec3.normalize([x, y, z]);
  },
  /** Flächeninhalt eines ebenen Vielecks. */
  area(points: readonly Vec3[]): number {
    let x = 0;
    let y = 0;
    let z = 0;
    for (let i = 0; i < points.length; i++) {
      const c = vec3.cross(points[i]!, points[(i + 1) % points.length]!);
      x += c[0];
      y += c[1];
      z += c[2];
    }
    return Math.hypot(x, y, z) / 2;
  },
  /** Dreht `p` um die Achse durch `origin` mit Richtung `axis` um `angle` (Bogenmaß, Rechte-Hand-Regel). */
  rotate(p: Vec3, origin: Vec3, axis: Vec3, angle: number): Vec3 {
    const k = vec3.normalize(axis);
    const v = vec3.sub(p, origin);
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const kv = vec3.cross(k, v);
    const d = vec3.dot(k, v) * (1 - c);
    return [
      origin[0] + v[0] * c + kv[0] * s + k[0] * d,
      origin[1] + v[1] * c + kv[1] * s + k[1] * d,
      origin[2] + v[2] * c + kv[2] * s + k[2] * d,
    ];
  },
};

/* ------------------------------------------------------------------ */
/* Farben                                                              */
/* ------------------------------------------------------------------ */

type Rgb = [number, number, number];

/** Liest `#rgb`, `#rrggbb`, `#rrggbbaa` und `rgb()/rgba()`. Unbekanntes wird grau. */
export function parseColor(color: string): Rgb {
  const c = color.trim();
  let m = /^#([0-9a-f]{3})$/i.exec(c);
  if (m) return [...m[1]!].map((h) => parseInt(h + h, 16)) as Rgb;
  m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(c);
  if (m) return [0, 2, 4].map((i) => parseInt(m![1]!.slice(i, i + 2), 16)) as Rgb;
  m = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(c);
  if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
  return [128, 128, 128];
}

function mixRgb(a: Rgb, b: Rgb, s: number): Rgb {
  return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s, a[2] + (b[2] - a[2]) * s];
}

function rgbCss(c: Rgb, alpha = 1): string {
  const r = Math.round(clamp(c[0], 0, 255));
  const g = Math.round(clamp(c[1], 0, 255));
  const b = Math.round(clamp(c[2], 0, 255));
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${Math.max(0, alpha).toFixed(3)})`;
}

/**
 * Farbe aufhellen (`amount` > 0, Richtung Weiß) oder abdunkeln (< 0, Richtung
 * Schwarz). `amount` zwischen −1 und 1. Optional mit Deckkraft.
 */
export function shade(color: string, amount: number, alpha = 1): string {
  const c = parseColor(color);
  return rgbCss(amount >= 0 ? mixRgb(c, [255, 255, 255], Math.min(1, amount)) : mixRgb(c, [0, 0, 0], Math.min(1, -amount)), alpha);
}

/** Mischt zwei Farben (`s` = 0 → a, 1 → b). */
export function mixColor(a: string, b: string, s: number, alpha = 1): string {
  return rgbCss(mixRgb(parseColor(a), parseColor(b), clamp(s, 0, 1)), alpha);
}

/** Lichtrichtung in Kamerakoordinaten (x rechts, y oben, z zum Betrachter): von links oben vorn. */
const LIGHT: Vec3 = vec3.normalize([-0.42, 0.74, 0.52]);
const HALF: Vec3 = vec3.normalize([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);
/** Grundhelligkeit (Flächen im Schatten). */
const AMBIENT = 0.45;

/**
 * Helligkeit einer Fläche (0 … 1) aus ihrer Normalen in Kamerakoordinaten:
 * Grundhelligkeit plus diffuses Licht (Lambert).
 */
export function lightIntensity(normalView: Vec3): number {
  return AMBIENT + (1 - AMBIENT) * Math.max(0, vec3.dot(normalView, LIGHT));
}

/**
 * Beleuchtete Flächenfarbe: Seiten im Schatten etwas dunkler, zum Licht
 * geneigte heller (Farbton bleibt erhalten), dazu ein weicher Glanzpunkt.
 */
function litRgb(base: Rgb, normalView: Vec3, gloss: number): Rgb {
  const i = lightIntensity(normalView);
  const pivot = 0.74;
  let c = i >= pivot ? mixRgb(base, [255, 255, 255], ((i - pivot) / (1 - pivot)) * 0.24) : mixRgb(base, [0, 0, 0], ((pivot - i) / (pivot - AMBIENT)) * 0.27);
  if (gloss > 0) {
    const spec = Math.max(0, vec3.dot(normalView, HALF)) ** 36 * gloss;
    if (spec > 0.004) c = mixRgb(c, [255, 255, 255], Math.min(0.6, spec));
  }
  return c;
}

/* ------------------------------------------------------------------ */
/* Kamera                                                              */
/* ------------------------------------------------------------------ */

export type Projection = 'perspective' | 'orthographic';

/** Ergebnis einer Projektion: Bildschirmpunkt (CSS-Pixel) und Tiefe (Abstand vor der Kamera). */
export interface Projected {
  x: number;
  y: number;
  /** Je größer, desto weiter hinten. */
  depth: number;
  /** Vergrößerungsfaktor der Perspektive an dieser Stelle (1 in der Ebene des Zielpunkts). */
  k: number;
}

const DEG = Math.PI / 180;

/**
 * Kamera auf einer Kugel um den Zielpunkt `target`. Azimut und Elevation in
 * Grad: Azimut 0° blickt aus Richtung der positiven x₁-Achse, positive Werte
 * drehen die Kamera Richtung x₂; Elevation 90° blickt senkrecht von oben.
 * `radius` ist der Radius der Szene, die in den Bildbereich passen soll;
 * `distance` (Vielfache von `radius`) bestimmt die Stärke der Perspektive.
 */
export class Camera3D {
  azimuth = 32;
  elevation = 22;
  zoom = 1;
  target: Vec3 = [0, 0, 0];
  radius = 1;
  projection: Projection = 'perspective';
  distance = 4.6;
  /** Lage des Zielpunkts im Bildbereich (0 … 1). */
  anchor: Vec2 = [0.5, 0.5];
  /** Anteil des Bildbereichs, den die Szenen-Kugel ausfüllt. */
  fill = 0.92;
  rect: Rect = { x: 0, y: 0, w: 1, h: 1 };

  /** Kamera-Achsen in Weltkoordinaten (nach `update()`). */
  right: Vec3 = [0, 1, 0];
  up: Vec3 = [0, 0, 1];
  back: Vec3 = [1, 0, 0];
  /** Pixel pro Längeneinheit in der Ebene des Zielpunkts. */
  scale = 1;
  cx = 0;
  cy = 0;
  /** Abstand der Kamera vom Zielpunkt. */
  dist = 1;

  constructor(init: Partial<Pick<Camera3D, 'azimuth' | 'elevation' | 'zoom' | 'target' | 'radius' | 'projection' | 'distance' | 'anchor' | 'fill' | 'rect'>> = {}) {
    Object.assign(this, init);
    this.update();
  }

  /** Abgeleitete Größen neu berechnen (nach Änderung von Winkeln, Zoom, Bereich …). */
  update(): void {
    const az = this.azimuth * DEG;
    const el = this.elevation * DEG;
    const ca = Math.cos(az);
    const sa = Math.sin(az);
    const ce = Math.cos(el);
    const se = Math.sin(el);
    this.back = [ce * ca, ce * sa, se];
    this.right = [-sa, ca, 0];
    this.up = [-se * ca, -se * sa, ce];
    const r = this.rect;
    this.scale = (Math.min(r.w, r.h) / (2 * Math.max(1e-9, this.radius))) * this.fill * this.zoom;
    this.cx = r.x + r.w * this.anchor[0];
    this.cy = r.y + r.h * this.anchor[1];
    this.dist = Math.max(1.5, this.distance) * this.radius;
  }

  /** Position der Kamera (bei orthografischer Projektion: weit entfernt in Blickrichtung). */
  get position(): Vec3 {
    return vec3.add(this.target, vec3.scale(this.back, this.dist));
  }

  /** Koordinaten relativ zur Kamera: x rechts, y oben, z zum Betrachter. */
  toView(p: Vec3): Vec3 {
    const q: Vec3 = [p[0] - this.target[0], p[1] - this.target[1], p[2] - this.target[2]];
    return [vec3.dot(q, this.right), vec3.dot(q, this.up), vec3.dot(q, this.back)];
  }

  /** Richtung (z. B. Normale) in Kamerakoordinaten. */
  dirToView(d: Vec3): Vec3 {
    return [vec3.dot(d, this.right), vec3.dot(d, this.up), vec3.dot(d, this.back)];
  }

  project(p: Vec3): Projected {
    const [x, y, z] = this.toView(p);
    const depth = this.dist - z;
    const k = this.projection === 'perspective' ? this.dist / Math.max(depth, this.dist * 0.08) : 1;
    return { x: this.cx + x * k * this.scale, y: this.cy - y * k * this.scale, depth, k };
  }

  /** Sichtstrahl durch einen Bildschirmpunkt (Ursprung und Richtung mit Länge 1). */
  ray(px: number, py: number): { origin: Vec3; dir: Vec3 } {
    const x = (px - this.cx) / this.scale;
    const y = -(py - this.cy) / this.scale;
    const onPlane = vec3.add(this.target, vec3.add(vec3.scale(this.right, x), vec3.scale(this.up, y)));
    if (this.projection === 'perspective') {
      const origin = this.position;
      return { origin, dir: vec3.normalize(vec3.sub(onPlane, origin)) };
    }
    return { origin: vec3.add(onPlane, vec3.scale(this.back, this.dist)), dir: vec3.scale(this.back, -1) };
  }

  /** Zeigt die Fläche mit Normale `normal` im Punkt `point` zur Kamera? */
  facing(normal: Vec3, point: Vec3): boolean {
    if (this.projection === 'orthographic') return vec3.dot(normal, this.back) > 0;
    return vec3.dot(normal, vec3.sub(this.position, point)) > 0;
  }
}

/** Schnittpunkt eines Strahls mit der Ebene durch `point` mit Normale `normal` (oder `null`). */
export function intersectRayPlane(ray: { origin: Vec3; dir: Vec3 }, point: Vec3, normal: Vec3): Vec3 | null {
  const d = vec3.dot(normal, ray.dir);
  if (Math.abs(d) < 1e-6) return null;
  const s = vec3.dot(normal, vec3.sub(point, ray.origin)) / d;
  if (s < 0) return null;
  return vec3.add(ray.origin, vec3.scale(ray.dir, s));
}

/** Punkt auf der Geraden (durch `point`, Richtung `dir`), der dem Strahl am nächsten liegt (oder `null`). */
export function closestOnLine(ray: { origin: Vec3; dir: Vec3 }, point: Vec3, dir: Vec3): Vec3 | null {
  const w0 = vec3.sub(point, ray.origin);
  const a = vec3.dot(dir, dir);
  const b = vec3.dot(dir, ray.dir);
  const c = vec3.dot(ray.dir, ray.dir);
  const d = vec3.dot(dir, w0);
  const e = vec3.dot(ray.dir, w0);
  const denom = a * c - b * b;
  if (Math.abs(denom) < 1e-9) return null;
  const s = (b * e - c * d) / denom;
  return vec3.add(point, vec3.scale(dir, s));
}

/** Konvexe Hülle von Punkten in der Ebene (gegen den Uhrzeigersinn, Andrew-Verfahren). */
export function convexHull2D(points: readonly Vec2[]): Vec2[] {
  const pts = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length < 3) return pts;
  const cross = (o: Vec2, a: Vec2, b: Vec2) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Vec2[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Vec2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/* ------------------------------------------------------------------ */
/* Polygonnetze                                                        */
/* ------------------------------------------------------------------ */

/**
 * Polygonnetz: Eckpunkte und Flächen als Indexlisten. Flächen werden von außen
 * gesehen gegen den Uhrzeigersinn umlaufen (Normale zeigt nach außen).
 */
export interface Mesh3D {
  vertices: readonly Vec3[];
  faces: readonly (readonly number[])[];
}

/** Erzeugt Polygonnetze für Standardkörper. */
export const mesh3d = {
  /** Regelmäßiges n-Eck mit Umkreisradius r (gegen den Uhrzeigersinn), eine Seite unten parallel zur ersten Achse. */
  regularPolygon(n: number, r: number, rotation = -Math.PI / 2 - Math.PI / n): Vec2[] {
    return Array.from({ length: n }, (_, i) => {
      const a = rotation + (i * 2 * Math.PI) / n;
      return [r * Math.cos(a), r * Math.sin(a)] as Vec2;
    });
  },

  /** Kreis (als n-Eck) um `center` in der Ebene mit Normale `normal`. */
  circle(center: Vec3, normal: Vec3, r: number, n = 32): Vec3[] {
    const nz = vec3.normalize(normal);
    const helper: Vec3 = Math.abs(nz[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = vec3.normalize(vec3.cross(helper, nz));
    const v = vec3.cross(nz, u);
    return Array.from({ length: n }, (_, i) => {
      const a = (i * 2 * Math.PI) / n;
      return vec3.add(center, vec3.add(vec3.scale(u, r * Math.cos(a)), vec3.scale(v, r * Math.sin(a))));
    });
  },

  /** Quader zwischen zwei gegenüberliegenden Ecken. */
  box(min: Vec3, max: Vec3): Mesh3D {
    const vertices: Vec3[] = [];
    for (let i = 0; i < 8; i++) vertices.push([i & 1 ? max[0] : min[0], i & 2 ? max[1] : min[1], i & 4 ? max[2] : min[2]]);
    return {
      vertices,
      faces: [
        [0, 2, 3, 1], // unten
        [4, 5, 7, 6], // oben
        [1, 3, 7, 5], // +x₁
        [0, 4, 6, 2], // −x₁
        [2, 6, 7, 3], // +x₂
        [0, 1, 5, 4], // −x₂
      ],
    };
  },

  /** Gerades Prisma über einer Grundfläche in der x₁x₂-Ebene (gegen den Uhrzeigersinn) von Höhe z0 bis z1. */
  prism(base: readonly Vec2[], z0: number, z1: number): Mesh3D {
    const n = base.length;
    const vertices: Vec3[] = [...base.map(([x, y]) => [x, y, z0] as Vec3), ...base.map(([x, y]) => [x, y, z1] as Vec3)];
    const faces: number[][] = [Array.from({ length: n }, (_, i) => n - 1 - i), Array.from({ length: n }, (_, i) => n + i)];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      faces.push([i, j, n + j, n + i]);
    }
    return { vertices, faces };
  },

  /** Pyramide über einer Grundfläche in der Höhe z0 mit Spitze `apex`. */
  pyramid(base: readonly Vec2[], apex: Vec3, z0 = 0): Mesh3D {
    const n = base.length;
    const vertices: Vec3[] = [...base.map(([x, y]) => [x, y, z0] as Vec3), apex];
    const faces: number[][] = [Array.from({ length: n }, (_, i) => n - 1 - i)];
    for (let i = 0; i < n; i++) faces.push([i, (i + 1) % n, n]);
    return { vertices, faces };
  },

  /** Zylinder (als Prisma mit `segments` Seiten) mit Radius r, Grundkreis um (0|0|z0). */
  cylinder(r: number, h: number, segments = 48, z0 = 0): Mesh3D {
    return mesh3d.prism(mesh3d.regularPolygon(segments, r, 0), z0, z0 + h);
  },

  /** Kegel mit Radius r und Höhe h, Grundkreis um (0|0|z0). */
  cone(r: number, h: number, segments = 48, z0 = 0): Mesh3D {
    return mesh3d.pyramid(mesh3d.regularPolygon(segments, r, 0), [0, 0, z0 + h], z0);
  },

  /** Kugel (UV-Netz) mit `segments` Längen- und `rings` Breitenabschnitten. */
  sphere(r: number, segments = 32, rings = 18, center: Vec3 = [0, 0, 0]): Mesh3D {
    const vertices: Vec3[] = [[center[0], center[1], center[2] - r]];
    for (let j = 1; j < rings; j++) {
      const phi = -Math.PI / 2 + (j * Math.PI) / rings;
      for (let i = 0; i < segments; i++) {
        const theta = (i * 2 * Math.PI) / segments;
        vertices.push([center[0] + r * Math.cos(phi) * Math.cos(theta), center[1] + r * Math.cos(phi) * Math.sin(theta), center[2] + r * Math.sin(phi)]);
      }
    }
    vertices.push([center[0], center[1], center[2] + r]);
    const top = vertices.length - 1;
    const at = (j: number, i: number) => 1 + (j - 1) * segments + (i % segments);
    const faces: number[][] = [];
    for (let i = 0; i < segments; i++) faces.push([0, at(1, i + 1), at(1, i)]);
    for (let j = 1; j < rings - 1; j++) {
      for (let i = 0; i < segments; i++) faces.push([at(j, i), at(j, i + 1), at(j + 1, i + 1), at(j + 1, i)]);
    }
    for (let i = 0; i < segments; i++) faces.push([at(rings - 1, i), at(rings - 1, i + 1), top]);
    return { vertices, faces };
  },

  /** Verschiebt ein Netz. */
  translate(mesh: Mesh3D, d: Vec3): Mesh3D {
    return { vertices: mesh.vertices.map((p) => vec3.add(p, d)), faces: mesh.faces };
  },
};

/* ------------------------------------------------------------------ */
/* Körpernetze falten                                                  */
/* ------------------------------------------------------------------ */

/** Fläche eines ebenen Körpernetzes in der x₁x₂-Ebene. */
export interface NetFace3D {
  /** Eckpunkte im ebenen Netz (x₁, x₂). */
  points: readonly Vec2[];
  /** Index der Fläche, an der diese hängt (−1: bleibt liegen). */
  parent: number;
  /** Faltkante: gemeinsame Kante mit der Elternfläche (zwei Punkte im Netz). */
  hinge?: readonly [Vec2, Vec2];
  /** Faltwinkel im gefalteten Zustand (Bogenmaß) = 180° − Winkel zwischen den beiden Flächen im Körper. Standard 90°. */
  angle?: number;
}

/** Affine Abbildung p ↦ m·p + t (m zeilenweise). */
interface Affine {
  m: readonly number[];
  t: Vec3;
}

const IDENTITY: Affine = { m: [1, 0, 0, 0, 1, 0, 0, 0, 1], t: [0, 0, 0] };

function applyAffine(a: Affine, p: Vec3): Vec3 {
  const m = a.m;
  return [
    m[0]! * p[0] + m[1]! * p[1] + m[2]! * p[2] + a.t[0],
    m[3]! * p[0] + m[4]! * p[1] + m[5]! * p[2] + a.t[1],
    m[6]! * p[0] + m[7]! * p[1] + m[8]! * p[2] + a.t[2],
  ];
}

function composeAffine(a: Affine, b: Affine): Affine {
  const m: number[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) sum += a.m[r * 3 + k]! * b.m[k * 3 + c]!;
      m.push(sum);
    }
  }
  return { m, t: applyAffine(a, b.t) };
}

function rotationAffine(origin: Vec3, axis: Vec3, angle: number): Affine {
  const [x, y, z] = vec3.normalize(axis);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const q = 1 - c;
  const m = [c + x * x * q, x * y * q - z * s, x * z * q + y * s, y * x * q + z * s, c + y * y * q, y * z * q - x * s, z * x * q - y * s, z * y * q + x * s, c + z * z * q];
  const r = applyAffine({ m, t: [0, 0, 0] }, origin);
  return { m, t: [origin[0] - r[0], origin[1] - r[1], origin[2] - r[2]] };
}

/**
 * Faltet ein Körpernetz: `progress` 0 = eben, 1 = vollständig gefaltet (auch
 * je Fläche als Funktion, z. B. für nacheinander klappende Flächen). Alle
 * Flächen klappen zur Oberseite (Richtung +x₃); die Flächen ohne Eltern
 * bleiben liegen. Liefert die Eckpunkte jeder Fläche in Weltkoordinaten.
 */
export function foldNet(faces: readonly NetFace3D[], progress: number | ((index: number) => number)): Vec3[][] {
  const transforms: (Affine | undefined)[] = new Array(faces.length);
  const transform = (i: number, depth: number): Affine => {
    const cached = transforms[i];
    if (cached) return cached;
    const face = faces[i]!;
    if (face.parent < 0 || !face.hinge || depth > faces.length) return (transforms[i] = IDENTITY);
    const [a, b] = face.hinge;
    let cx = 0;
    let cy = 0;
    for (const p of face.points) {
      cx += p[0] / face.points.length;
      cy += p[1] / face.points.length;
    }
    // Liegt die Fläche links der Kante a → b, hebt eine positive Drehung sie nach oben.
    const side = (b[0] - a[0]) * (cy - a[1]) - (b[1] - a[1]) * (cx - a[0]);
    const s = typeof progress === 'function' ? progress(i) : progress;
    const angle = (face.angle ?? Math.PI / 2) * s * (side >= 0 ? 1 : -1);
    const local = rotationAffine([a[0], a[1], 0], [b[0] - a[0], b[1] - a[1], 0], angle);
    return (transforms[i] = composeAffine(transform(face.parent, depth + 1), local));
  };
  return faces.map((face, i) => {
    const m = transform(i, 0);
    return face.points.map(([x, y]) => applyAffine(m, [x, y, 0]));
  });
}

interface EdgeInfo {
  a: number;
  b: number;
  faces: number[];
}

interface Topology {
  edges: EdgeInfo[];
  closed: boolean;
}

/** Kanten eines Netzes (zwischengespeichert je Flächenliste, die Eckpunkte dürfen sich ändern). */
const topologyCache = new WeakMap<object, Topology>();

export function meshTopology(mesh: Mesh3D): Topology {
  const cached = topologyCache.get(mesh.faces);
  if (cached) return cached;
  const map = new Map<string, EdgeInfo>();
  mesh.faces.forEach((face, f) => {
    for (let i = 0; i < face.length; i++) {
      const a = face[i]!;
      const b = face[(i + 1) % face.length]!;
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      const edge = map.get(key);
      if (edge) edge.faces.push(f);
      else map.set(key, { a: Math.min(a, b), b: Math.max(a, b), faces: [f] });
    }
  });
  const edges = [...map.values()];
  const topology = { edges, closed: edges.every((e) => e.faces.length === 2) };
  topologyCache.set(mesh.faces, topology);
  return topology;
}

/* ------------------------------------------------------------------ */
/* Stile                                                               */
/* ------------------------------------------------------------------ */

/**
 * Ebene, in der gezeichnet wird:
 * - `back`: sofort, hinter allem (z. B. Bodengitter, Schatten)
 * - `scene`: nach Tiefe sortiert (Standard für Flächen, Linien, Punkte)
 * - `front`: nach der Szene, in Aufrufreihenfolge (z. B. Beschriftungen)
 */
export type Layer3D = 'back' | 'scene' | 'front';

export interface FaceStyle3D {
  /** Grundfarbe (Standard: Reihenfarbe 1). Wird je nach Lage zum Licht heller oder dunkler. */
  color?: string;
  alpha?: number;
  /** Ohne Beleuchtung (Grundfarbe unverändert). */
  flat?: boolean;
  /** Stärke des Glanzpunkts (Standard 0,22; 0 = matt). */
  gloss?: number;
  /** Randlinie der Fläche. */
  stroke?: string;
  width?: number;
  dash?: number[];
  /** Nur diese Kanten umranden (Kante i läuft von Ecke i nach Ecke i + 1). */
  strokeEdges?: readonly boolean[];
  /** Rückseite nicht zeichnen. */
  cull?: boolean;
  /** Rückseite um diesen Anteil abdunkeln (0 … 1, Standard 0; bei `mesh` 0,12). */
  backShade?: number;
  /** Kennung für `pick()` (Antippen). */
  id?: string;
  /** Beschriftung in der Flächenmitte (wird mit der Fläche verdeckt). Ohne Farbe: dunkel oder hell, je nach Fläche. */
  label?: { text: string; color?: string; size?: number; weight?: string; at?: Vec3 };
  /** Aufdrucke auf der Fläche (z. B. Würfelaugen), Eckpunkte in Weltkoordinaten. */
  decals?: { points: readonly Vec3[]; color: string }[];
  /** Verschiebung in der Tiefensortierung (Weltlängen, positiv = weiter nach vorn). */
  depthBias?: number;
  layer?: Layer3D;
}

export interface LineStyle3D {
  color?: string;
  width?: number;
  dash?: number[];
  alpha?: number;
  layer?: Layer3D;
  /** In wie viele Stücke die Linie für die Tiefensortierung zerlegt wird (Standard: automatisch). */
  split?: number;
  depthBias?: number;
}

export interface PointStyle3D {
  color?: string;
  /** Radius in Pixeln. */
  radius?: number;
  hollow?: boolean;
  layer?: Layer3D;
  depthBias?: number;
}

export interface LabelStyle3D {
  color?: string;
  size?: number;
  weight?: 'normal' | 'bold' | '600' | '700' | '800';
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Verschiebung in Pixeln (x nach rechts, y nach unten). */
  offset?: Vec2;
  /** Heller Rand um die Schrift (Standard: ja). */
  halo?: boolean;
  /** Kursive Mathe-Schrift. */
  math?: boolean;
  /** Hinterlegtes Schild in dieser Farbe. */
  background?: string;
  /** Standard: `front` (immer sichtbar). Mit `scene` wird die Beschriftung von Körpern verdeckt. */
  layer?: Layer3D;
  depthBias?: number;
}

export interface MeshStyle3D extends Omit<FaceStyle3D, 'label' | 'decals' | 'id' | 'stroke' | 'dash' | 'strokeEdges'> {
  /** Sichtbare Kanten (Knicke, Ränder, Umriss) zeichnen (Standard: ja). */
  edges?: boolean;
  /** Verdeckte Kanten gestrichelt zeichnen (Standard: nein). Exakt für einzelne konvexe Körper. */
  hiddenEdges?: boolean;
  edgeColor?: string;
  edgeWidth?: number;
  /** Knickwinkel in Grad, ab dem eine Kante gezeichnet wird (Standard 20°; glatte Flächen bleiben kantenlos). */
  edgeAngle?: number;
  /** Abweichende Angaben je Fläche (`null` = Fläche weglassen). */
  face?: (index: number) => Partial<FaceStyle3D> | null | undefined;
}

export interface AxesStyle3D {
  /** Anfang der Achsen (Zahl für alle drei oder je Achse), Standard 0. */
  min?: number | Vec3;
  /** Ende der Achsen (Pfeilspitze), Standard 1. */
  max?: number | Vec3;
  /** Beschriftungen an den Pfeilspitzen (Standard x₁, x₂, x₃). */
  labels?: readonly [string, string, string] | false;
  /** Abstand der Teilstriche (Standard 1, `false` = keine). */
  ticks?: number | false;
  /** Zahlen an den Teilstrichen (Standard: ja). */
  numbers?: boolean;
  color?: string;
  width?: number;
  layer?: Layer3D;
}

export interface GridStyle3D {
  /** Ebene des Gitters (Standard: x₁x₂-Ebene). */
  plane?: 'xy' | 'xz' | 'yz';
  /** Bereich in den beiden Koordinaten der Ebene. */
  min: Vec2;
  max: Vec2;
  step?: number;
  /** Lage der Ebene auf der dritten Achse (Standard 0). */
  offset?: number;
  color?: string;
  width?: number;
  /** Zum Rand hin ausblenden (Standard: ja). */
  fade?: boolean;
  layer?: Layer3D;
}

export interface Handle3D {
  /** Aktuelle Position in Weltkoordinaten. */
  get(): Vec3;
  /** Neue Position beim Ziehen. */
  set(p: Vec3): void;
  /** Ziehen in der Ebene durch den Punkt mit dieser Normale (Standard: waagerecht, [0, 0, 1]). */
  plane?: Vec3;
  /** Stattdessen nur entlang dieser Richtung ziehen. */
  axis?: Vec3;
  enabled?: () => boolean;
  color?: () => string;
}

export interface View3DOptions {
  /** Teilbereich der Zeichenfläche in CSS-Pixeln (Standard: alles). */
  region?: (width: number, height: number) => Rect;
  /** Anfangswinkel in Grad. */
  azimuth?: number;
  elevation?: number;
  /** Grenzen der Elevation in Grad (Standard [−80, 85]). */
  elevationLimits?: Vec2;
  /** Grenzen des Azimuts in Grad (Standard: unbegrenzt). */
  azimuthLimits?: Vec2;
  target?: Vec3;
  /** Radius der Szene (passt in den Bildbereich). */
  radius?: number;
  projection?: Projection;
  /** Kameraabstand in Vielfachen von `radius` (Standard 4,6 – mäßige Perspektive). */
  distance?: number;
  /** Lage des Zielpunkts im Bildbereich (Standard Mitte [0,5; 0,5]). */
  anchor?: Vec2;
  /** Drehen per Ziehen (Standard: ja). */
  rotate?: boolean;
  /** Zoomen per Pinch und Strg+Mausrad (Standard: ja). */
  zoom?: boolean;
  zoomLimits?: Vec2;
  /** Schaltflächen für Zoom und Zurücksetzen (Standard: wie `zoom`). */
  controls?: boolean;
  /** Nachlaufen nach dem Loslassen (Standard: ja, außer bei „reduzierter Bewegung“). */
  inertia?: boolean;
  /** Hinweis „Zum Drehen ziehen“, bis zum ersten Drehen (Standard: ja). */
  hint?: boolean;
  /** Hintergrund des Bereichs füllen (Standard: ja). */
  background?: boolean;
  /** Antippen ohne Ziehen (z. B. Fläche auswählen mit `pick`). */
  onTap?: (px: number, py: number) => void;
  /** Zeigt der Mauszeiger hier auf etwas Antippbares? (Zeiger „Hand“) */
  tapCursor?: (px: number, py: number) => boolean;
}

/* ------------------------------------------------------------------ */
/* Ansicht                                                             */
/* ------------------------------------------------------------------ */

interface Item {
  depth: number;
  draw: () => void;
}

type Drag =
  | { mode: 'rotate'; lastX: number; lastY: number; startX: number; startY: number; start: number; rotating: boolean }
  | { mode: 'handle'; handle: Handle3D; offset: Vec3; origin: Vec3 }
  | { mode: 'pinch'; distance: number; zoom: number };

const HINT = { de: 'Zum Drehen ziehen', en: 'Drag to rotate' } as const;

/**
 * Dreidimensionale Ansicht auf einer Zeichenfläche. Drehen per Ziehen ist
 * immer erlaubt (auch bei gesperrten Reglern); ziehbare Punkte sollten
 * `enabled: () => !ctx.locked` setzen.
 *
 * Verträglichkeit: `View3D` ist wie `Plot` ein Zeigerziel der `Surface` für
 * ihren Bereich. Später angelegte Ziele (z. B. `TapTarget`, ein zweiter
 * `Plot`) haben Vorrang, wo sie treffen.
 */
export class View3D implements PointerTarget {
  readonly camera: Camera3D;
  private options: View3DOptions;
  private initial: { azimuth: number; elevation: number };
  private items: Item[] = [];
  private frontItems: (() => void)[] = [];
  private picks: { id: string; pts: Vec2[] }[] = [];
  private handles: Handle3D[] = [];
  private hoveredHandle: Handle3D | null = null;
  private pointers = new Map<number, { px: number; py: number }>();
  private drag: Drag | null = null;
  private velocity: Vec2 = [0, 0];
  private samples: { t: number; az: number; el: number }[] = [];
  private lastFrame = 0;
  private anim: { tween: Tween; from: { az: number; el: number; zoom: number }; to: { az: number; el: number; zoom: number } } | null = null;
  private rotated = false;
  private changed = false;
  private moving = false;
  private controlsEl: HTMLElement | null = null;

  constructor(
    readonly surface: Surface,
    options: View3DOptions = {},
  ) {
    this.options = options;
    this.camera = new Camera3D({
      azimuth: options.azimuth ?? 32,
      elevation: options.elevation ?? 22,
      target: options.target ?? [0, 0, 0],
      radius: options.radius ?? 1,
      projection: options.projection ?? 'perspective',
      distance: options.distance ?? 4.6,
      anchor: options.anchor ?? [0.5, 0.5],
    });
    this.initial = { azimuth: this.camera.azimuth, elevation: this.camera.elevation };
    surface.addTarget(this);
    if (options.controls ?? options.zoom ?? true) this.createControls();
    this.resize();
  }

  /* ---------- Ansicht ---------- */

  get rect(): Rect {
    return this.camera.rect;
  }

  get azimuth(): number {
    return this.camera.azimuth;
  }

  get elevation(): number {
    return this.camera.elevation;
  }

  /** Hat die Person die Ansicht gedreht oder gezoomt? */
  get isViewChanged(): boolean {
    return this.changed;
  }

  resize(): void {
    const { width, height } = this.surface;
    this.camera.rect = this.options.region ? this.options.region(width, height) : { x: 0, y: 0, w: width, h: height };
    this.camera.update();
    this.positionControls();
  }

  /** Zielpunkt und Szenenradius setzen (z. B. wenn der Körper wächst). Darf in `render()` vor `begin()` aufgerufen werden. */
  setScene(scene: { target?: Vec3; radius?: number; anchor?: Vec2 }): void {
    if (scene.target) this.camera.target = scene.target;
    if (scene.radius !== undefined) this.camera.radius = scene.radius;
    if (scene.anchor) this.camera.anchor = scene.anchor;
    this.camera.update();
  }

  setProjection(projection: Projection): void {
    this.camera.projection = projection;
    this.camera.update();
    this.surface.host.requestRender();
  }

  /** Kamera sofort setzen (Winkel in Grad). */
  setCamera(view: { azimuth?: number; elevation?: number; zoom?: number }): void {
    this.anim = null;
    this.velocity = [0, 0];
    if (view.azimuth !== undefined) this.camera.azimuth = this.clampAz(view.azimuth);
    if (view.elevation !== undefined) this.camera.elevation = this.clampEl(view.elevation);
    if (view.zoom !== undefined) this.camera.zoom = this.clampZoom(view.zoom);
    this.camera.update();
    this.surface.host.requestRender();
  }

  /** Kamera weich zu neuen Winkeln (Grad) bzw. Zoom bewegen. */
  animateTo(view: { azimuth?: number; elevation?: number; zoom?: number }, ms = 800): void {
    const cam = this.camera;
    let az = view.azimuth ?? cam.azimuth;
    // kürzester Weg
    if (!this.options.azimuthLimits) az = cam.azimuth + ((((az - cam.azimuth) % 360) + 540) % 360) - 180;
    this.velocity = [0, 0];
    this.anim = {
      tween: new Tween(ms, ease.inOutCubic).play(),
      from: { az: cam.azimuth, el: cam.elevation, zoom: cam.zoom },
      to: { az: this.clampAz(az), el: this.clampEl(view.elevation ?? cam.elevation), zoom: this.clampZoom(view.zoom ?? cam.zoom) },
    };
    this.surface.host.requestRender();
  }

  /** Zur Anfangsansicht zurückkehren (weich). */
  resetView(animated = true): void {
    const target = { azimuth: this.initial.azimuth, elevation: this.initial.elevation, zoom: 1 };
    if (animated) this.animateTo(target, 700);
    else this.setCamera(target);
    this.changed = false;
  }

  /** Neue Anfangsansicht festlegen (z. B. je nach Körper). */
  setInitialView(view: { azimuth: number; elevation: number }): void {
    this.initial = { ...view };
  }

  private clampEl(el: number): number {
    const [lo, hi] = this.options.elevationLimits ?? [-80, 85];
    return clamp(el, lo, hi);
  }

  private clampAz(az: number): number {
    const lim = this.options.azimuthLimits;
    return lim ? clamp(az, lim[0], lim[1]) : az;
  }

  private clampZoom(zoom: number): number {
    const [lo, hi] = this.options.zoomLimits ?? [0.5, 3];
    return clamp(zoom, lo, hi);
  }

  /** Trägheit und Kamerafahrten fortschreiben (in `begin()`). */
  private advance(): void {
    const now = performance.now();
    const dt = this.lastFrame ? clamp((now - this.lastFrame) / 1000, 0, 0.05) : 0;
    this.lastFrame = now;
    this.moving = false;
    const cam = this.camera;
    if (this.anim) {
      const v = this.anim.tween.value;
      const { from, to } = this.anim;
      cam.azimuth = from.az + (to.az - from.az) * v;
      cam.elevation = from.el + (to.el - from.el) * v;
      cam.zoom = from.zoom + (to.zoom - from.zoom) * v;
      if (this.anim.tween.running) this.moving = true;
      else this.anim = null;
    } else if (!this.drag && (this.velocity[0] !== 0 || this.velocity[1] !== 0)) {
      cam.azimuth = this.clampAz(cam.azimuth + this.velocity[0] * dt);
      const el = cam.elevation + this.velocity[1] * dt;
      cam.elevation = this.clampEl(el);
      const decay = Math.exp(-dt / 0.38);
      this.velocity = [this.velocity[0] * decay, cam.elevation === el ? this.velocity[1] * decay : 0];
      if (Math.hypot(this.velocity[0], this.velocity[1]) < 2) this.velocity = [0, 0];
      else this.moving = true;
    }
    // Azimut im Bereich (−180°, 180°] halten
    if (!this.options.azimuthLimits && Math.abs(cam.azimuth) > 180 && !this.anim && !this.drag) cam.azimuth -= 360 * Math.round(cam.azimuth / 360);
    cam.update();
  }

  /* ---------- Umrechnung ---------- */

  project(p: Vec3): Projected {
    return this.camera.project(p);
  }

  /** Bildschirmpunkt eines Weltpunkts. */
  toPx(p: Vec3): [number, number] {
    const q = this.camera.project(p);
    return [q.x, q.y];
  }

  /** Pixel pro Längeneinheit am Weltpunkt `p` (für Größen, die mit der Perspektive skalieren). */
  pixelsPerUnit(p: Vec3 = this.camera.target): number {
    return this.camera.scale * this.camera.project(p).k;
  }

  /* ---------- Rahmen eines Frames ---------- */

  /** Beginnt das Zeichnen: Kamera fortschreiben, Bereich ausschneiden und füllen. */
  begin(): CanvasRenderingContext2D {
    this.advance();
    const g = this.surface.g;
    const r = this.camera.rect;
    g.save();
    g.beginPath();
    g.rect(r.x, r.y, r.w, r.h);
    g.clip();
    if (this.options.background ?? true) {
      g.fillStyle = this.surface.theme.bg;
      g.fillRect(r.x, r.y, r.w, r.h);
    }
    this.items = [];
    this.frontItems = [];
    this.picks = [];
    return g;
  }

  /** Zeichnet die gesammelte Szene (sortiert), Beschriftungen und Griffe; beendet das Zeichnen. */
  end(): void {
    const g = this.surface.g;
    this.items.sort((a, b) => b.depth - a.depth);
    for (const item of this.items) item.draw();
    for (const draw of this.frontItems) draw();
    this.drawHandles();
    if ((this.options.hint ?? true) && !this.rotated && (this.options.rotate ?? true)) this.drawHint();
    g.restore();
    this.items = [];
    this.frontItems = [];
    if (this.moving) this.surface.host.requestRender();
  }

  /** Eigene Zeichenfunktion in die Tiefensortierung einreihen (Tiefe am Punkt `at`). */
  custom(at: Vec3, draw: (g: CanvasRenderingContext2D) => void, layer: Layer3D = 'scene', depthBias = 0): void {
    this.add(layer, this.camera.project(at).depth - depthBias, () => draw(this.surface.g));
  }

  private add(layer: Layer3D, depth: number, draw: () => void): void {
    if (layer === 'back') draw();
    else if (layer === 'front') this.frontItems.push(draw);
    else this.items.push({ depth, draw });
  }

  /* ---------- Flächen ---------- */

  /** Ebenes Vieleck (Eckpunkte in Weltkoordinaten). */
  face(points: readonly Vec3[], style: FaceStyle3D = {}): void {
    if (points.length < 3) return;
    const normal = vec3.normal(points);
    const center = vec3.centroid(points);
    const front = this.camera.facing(normal, center);
    if (!front && style.cull) return;
    const proj = points.map((p) => this.camera.project(p));
    let depth = 0;
    for (const q of proj) depth += q.depth;
    depth /= proj.length;
    this.queueFace(proj, normal, center, front, depth - (style.depthBias ?? 0), style);
  }

  private queueFace(proj: Projected[], normal: Vec3, center: Vec3, front: boolean, depth: number, style: FaceStyle3D): void {
    const theme = this.surface.theme;
    const base = parseColor(style.color ?? theme.series[0]!);
    const alpha = style.alpha ?? 1;
    let nv = this.camera.dirToView(normal);
    if (!front) nv = [-nv[0], -nv[1], -nv[2]];
    let rgb = style.flat ? base : litRgb(base, nv, style.gloss ?? 0.22);
    if (!front && !style.flat && style.backShade) rgb = mixRgb(rgb, [0, 0, 0], style.backShade);
    const fill = rgbCss(rgb, alpha);
    const pts: Vec2[] = proj.map((q) => [q.x, q.y]);
    this.add(style.layer ?? 'scene', depth, () => {
      const g = this.surface.g;
      g.beginPath();
      pathPoly(g, pts);
      g.fillStyle = fill;
      g.fill();
      if (alpha >= 1) {
        // schließt feine Lücken zwischen benachbarten Flächen (Kantenglättung)
        g.strokeStyle = fill;
        g.lineWidth = 1;
        g.lineJoin = 'round';
        g.stroke();
      }
      if (style.decals) {
        for (const decal of style.decals) {
          g.beginPath();
          pathPoly(
            g,
            decal.points.map((p) => this.toPx(p)),
          );
          g.fillStyle = decal.color;
          g.fill();
        }
      }
      if (style.stroke) {
        g.strokeStyle = style.stroke;
        g.lineWidth = style.width ?? 1.5;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.setLineDash(style.dash ?? []);
        const mask = style.strokeEdges;
        if (mask) {
          g.beginPath();
          pts.forEach((p, i) => {
            if (!mask[i]) return;
            const q = pts[(i + 1) % pts.length]!;
            g.moveTo(p[0], p[1]);
            g.lineTo(q[0], q[1]);
          });
        }
        g.stroke();
        g.setLineDash([]);
      }
      if (style.label) {
        const facing = Math.abs(nv[2]);
        const a = clamp((facing - 0.12) / 0.25, 0, 1);
        if (a > 0) {
          const [lx, ly] = this.toPx(style.label.at ?? center);
          g.globalAlpha = a;
          drawText(g, theme, lx, ly, style.label.text, {
            color: style.label.color ?? contrastInk(rgb, theme),
            size: style.label.size ?? 13,
            weight: (style.label.weight as LabelStyle3D['weight']) ?? '700',
            align: 'center',
            baseline: 'middle',
            halo: false,
          });
          g.globalAlpha = 1;
        }
      }
      if (style.id) this.picks.push({ id: style.id, pts });
    });
  }

  /** Polygonnetz mit Beleuchtung, sichtbaren und (optional) verdeckten Kanten. */
  mesh(mesh: Mesh3D, style: MeshStyle3D = {}): void {
    const cam = this.camera;
    const { edges, closed } = meshTopology(mesh);
    const proj = mesh.vertices.map((p) => cam.project(p));
    const alpha = style.alpha ?? 1;
    const cull = style.cull ?? (alpha >= 1 && closed);
    const nFaces = mesh.faces.length;
    const normals: Vec3[] = new Array(nFaces);
    const front: boolean[] = new Array(nFaces);
    const depths: number[] = new Array(nFaces);
    const drawn: boolean[] = new Array(nFaces);
    const bias = style.depthBias ?? 0;
    mesh.faces.forEach((face, f) => {
      const pts = face.map((i) => mesh.vertices[i]!);
      const n = vec3.normal(pts);
      const c = vec3.centroid(pts);
      normals[f] = n;
      front[f] = cam.facing(n, c);
      let d = 0;
      for (const i of face) d += proj[i]!.depth;
      depths[f] = d / face.length - bias;
      const extra = style.face?.(f);
      drawn[f] = extra !== null && (front[f] || !(extra?.cull ?? cull));
      if (!drawn[f]) return;
      this.queueFace(
        face.map((i) => proj[i]!),
        n,
        c,
        front[f],
        depths[f],
        { backShade: 0.12, ...style, ...extra, stroke: extra?.stroke, layer: extra?.layer ?? style.layer },
      );
    });
    if (style.edges === false && !style.hiddenEdges) return;
    const theme = this.surface.theme;
    const edgeColor = style.edgeColor ?? mixColor(style.color ?? theme.series[0]!, theme.dark ? '#000000' : '#0b1220', theme.dark ? 0.55 : 0.5);
    const width = style.edgeWidth ?? 1.6;
    const minCos = Math.cos((style.edgeAngle ?? 20) * DEG);
    const hidden: [Vec2, Vec2][] = [];
    for (const e of edges) {
      const [f1, f2] = e.faces as [number, number | undefined];
      const pa = proj[e.a]!;
      const pb = proj[e.b]!;
      if (f2 === undefined) {
        if (style.edges !== false && drawn[f1]) this.queueEdge(pa, pb, depths[f1]! - 1e-7, edgeColor, width, style.layer);
        continue;
      }
      const feature = vec3.dot(normals[f1]!, normals[f2]!) < minCos;
      const silhouette = front[f1] !== front[f2];
      if (!feature && !silhouette) continue;
      if (front[f1] || front[f2]) {
        // sichtbar: direkt nach der vorderen angrenzenden Fläche zeichnen
        if (style.edges === false) continue;
        const d = Math.min(front[f1] ? depths[f1]! : Infinity, front[f2] ? depths[f2]! : Infinity);
        this.queueEdge(pa, pb, d - 1e-7, edgeColor, width, style.layer);
      } else if (style.hiddenEdges && feature) hidden.push([[pa.x, pa.y], [pb.x, pb.y]]);
    }
    if (hidden.length) {
      this.frontItems.push(() => {
        const g = this.surface.g;
        g.save();
        g.strokeStyle = mixColor(edgeColor, theme.bg, 0.25);
        g.globalAlpha = 0.8;
        g.lineWidth = Math.max(1, width * 0.75);
        g.setLineDash([5, 4]);
        g.lineCap = 'butt';
        g.beginPath();
        for (const [a, b] of hidden) {
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
        }
        g.stroke();
        g.restore();
      });
    }
  }

  private queueEdge(a: Projected, b: Projected, depth: number, color: string, width: number, layer: Layer3D = 'scene'): void {
    this.add(layer, depth, () => {
      const g = this.surface.g;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    });
  }

  /** Weicher Schatten der Punkte auf dem Boden (Höhe `z`), z. B. unter einem Körper. Hinter allem gezeichnet. */
  shadow(points: readonly Vec3[], style: { z?: number; blur?: number; alpha?: number; spread?: number } = {}): void {
    const z = style.z ?? 0;
    const c = vec3.centroid(points);
    const spread = style.spread ?? 1.04;
    const hull = convexHull2D(points.map((p) => [c[0] + (p[0] - c[0]) * spread, c[1] + (p[1] - c[1]) * spread] as Vec2));
    if (hull.length < 3) return;
    const pts = hull.map(([x, y]) => this.toPx([x, y, z]));
    const g = this.surface.g;
    const dpr = this.surface.dpr;
    const far = 10000;
    g.save();
    g.shadowColor = this.surface.theme.dark ? `rgba(0,0,0,${(style.alpha ?? 0.22) * 2.2})` : `rgba(16,24,40,${style.alpha ?? 0.22})`;
    g.shadowBlur = (style.blur ?? 18) * dpr;
    g.shadowOffsetX = far * dpr;
    g.shadowOffsetY = 0;
    g.fillStyle = '#000';
    g.beginPath();
    pathPoly(
      g,
      pts.map(([x, y]) => [x - far, y] as Vec2),
    );
    g.fill();
    g.restore();
  }

  /* ---------- Linien, Punkte, Texte ---------- */

  segment(a: Vec3, b: Vec3, style: LineStyle3D = {}): void {
    this.polyline([a, b], style);
  }

  /** Streckenzug; für die Tiefensortierung in Stücke zerlegt (gestrichelte Linien bleiben gleichmäßig). */
  polyline(points: readonly Vec3[], style: LineStyle3D & { closed?: boolean } = {}): void {
    if (points.length < 2) return;
    const pts = style.closed ? [...points, points[0]!] : points;
    const layer = style.layer ?? 'scene';
    const color = style.color ?? this.surface.theme.text;
    const width = style.width ?? 2;
    const alpha = style.alpha ?? 1;
    const dash = style.dash ?? [];
    const bias = style.depthBias ?? 0;
    if (layer !== 'scene') {
      const proj = pts.map((p) => this.toPx(p));
      this.add(layer, 0, () => {
        const g = this.surface.g;
        strokeStyle(g, color, width, dash, alpha);
        g.beginPath();
        pathPoly(g, proj, false);
        g.stroke();
        resetStroke(g);
      });
      return;
    }
    let offset = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      const n = style.split ?? clamp(Math.ceil(vec3.distance(a, b) / (this.camera.radius * 0.2)), 1, 32);
      let prev = this.camera.project(a);
      for (let k = 1; k <= n; k++) {
        const next = this.camera.project(vec3.lerp(a, b, k / n));
        const p0 = prev;
        const dashOffset = offset;
        offset += Math.hypot(next.x - p0.x, next.y - p0.y);
        this.items.push({
          depth: (p0.depth + next.depth) / 2 - bias,
          draw: () => {
            const g = this.surface.g;
            strokeStyle(g, color, width, dash, alpha);
            g.lineDashOffset = dashOffset;
            g.beginPath();
            g.moveTo(p0.x, p0.y);
            g.lineTo(next.x, next.y);
            g.stroke();
            resetStroke(g);
          },
        });
        prev = next;
      }
    }
  }

  /** Pfeil von a nach b mit Spitze (Größe `head` in Pixeln). */
  arrow(a: Vec3, b: Vec3, style: LineStyle3D & { head?: number } = {}): void {
    const pa = this.camera.project(a);
    const pb = this.camera.project(b);
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y);
    const head = style.head ?? 11;
    const width = style.width ?? 2;
    const color = style.color ?? this.surface.theme.text;
    if (len < 1) return;
    const shorten = Math.min(0.9, (head * 0.75) / len);
    this.polyline([a, vec3.lerp(b, a, shorten)], style);
    const angle = Math.atan2(pb.y - pa.y, pb.x - pa.x);
    const size = Math.min(head, len * 0.9);
    this.add(style.layer ?? 'scene', pb.depth - (style.depthBias ?? 0) - 1e-6, () => {
      const g = this.surface.g;
      g.save();
      g.globalAlpha = style.alpha ?? 1;
      g.translate(pb.x, pb.y);
      g.rotate(angle);
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-size, -size * 0.42 - width * 0.3);
      g.lineTo(-size * 0.82, 0);
      g.lineTo(-size, size * 0.42 + width * 0.3);
      g.closePath();
      g.fillStyle = color;
      g.fill();
      g.restore();
    });
  }

  point(p: Vec3, style: PointStyle3D = {}): void {
    const q = this.camera.project(p);
    const theme = this.surface.theme;
    const color = style.color ?? theme.series[0]!;
    const radius = style.radius ?? 5;
    this.add(style.layer ?? 'scene', q.depth - (style.depthBias ?? this.camera.radius * 0.02), () => {
      const g = this.surface.g;
      g.beginPath();
      g.arc(q.x, q.y, radius, 0, Math.PI * 2);
      if (style.hollow) {
        g.fillStyle = theme.bg;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = color;
        g.stroke();
      } else {
        g.fillStyle = color;
        g.fill();
        g.lineWidth = 1.5;
        g.strokeStyle = theme.bg;
        g.stroke();
      }
    });
  }

  /** Beschriftung an einem Weltpunkt (Standard: über allem). Minuszeichen werden typografisch gesetzt. */
  label(p: Vec3, text: string, style: LabelStyle3D = {}): void {
    const q = this.camera.project(p);
    const theme = this.surface.theme;
    const [dx, dy] = style.offset ?? [0, 0];
    this.add(style.layer ?? 'front', q.depth - (style.depthBias ?? 0), () => drawText(this.surface.g, theme, q.x + dx, q.y + dy, text, style));
  }

  /** Text an einer Pixelposition (über allem, z. B. Infokästen). */
  textPx(px: number, py: number, text: string, style: LabelStyle3D = {}): void {
    this.add(style.layer ?? 'front', 0, () => drawText(this.surface.g, this.surface.theme, px, py, text, style));
  }

  /* ---------- Achsen und Gitter ---------- */

  /** Koordinatenachsen mit Pfeilspitzen, Teilstrichen und Beschriftung x₁, x₂, x₃. */
  axes(style: AxesStyle3D = {}): void {
    const theme = this.surface.theme;
    const lo = typeof style.min === 'object' ? style.min : ([style.min ?? 0, style.min ?? 0, style.min ?? 0] as Vec3);
    const hi = typeof style.max === 'object' ? style.max : ([style.max ?? 1, style.max ?? 1, style.max ?? 1] as Vec3);
    const labels = style.labels === false ? null : (style.labels ?? ['x₁', 'x₂', 'x₃']);
    const color = style.color ?? theme.axis;
    const width = style.width ?? 1.6;
    const layer = style.layer ?? 'scene';
    const step = style.ticks === false ? 0 : (style.ticks ?? 1);
    for (let k = 0; k < 3; k++) {
      const a: [number, number, number] = [0, 0, 0];
      const b: [number, number, number] = [0, 0, 0];
      a[k] = lo[k]!;
      b[k] = hi[k]!;
      this.arrow(a, b, { color, width, head: 10, layer });
      const pb = this.camera.project(b);
      const pa = this.camera.project(a);
      let ux = pb.x - pa.x;
      let uy = pb.y - pa.y;
      const ul = Math.hypot(ux, uy) || 1;
      ux /= ul;
      uy /= ul;
      if (labels) {
        // Beschriftung neben der Pfeilspitze, seitlich versetzt
        const side = uy > 0.5 ? [12, 6] : ux < -0.5 ? [-4, -12] : [6, -12];
        this.label(b, labels[k]!, { color: theme.text, size: 15, math: true, offset: [ux * 10 + side[0]!, uy * 10 + side[1]!], align: 'center', baseline: 'middle' });
      }
      if (step > 0 && ul > 2) {
        // Teilstriche senkrecht zur Achse (im Bild)
        const nx = -uy;
        const ny = ux;
        const pxPerUnit = ul / Math.max(1e-9, hi[k]! - lo[k]!);
        let every = step;
        while (every * pxPerUnit < 22) every += step;
        const first = Math.ceil(lo[k]! / every - 1e-9);
        for (let i = first; i * every < hi[k]! - every * 0.35; i++) {
          const v = i * every;
          if (Math.abs(v) < 1e-9) continue;
          const p: [number, number, number] = [0, 0, 0];
          p[k] = v;
          const q = this.camera.project(p);
          this.add(layer, q.depth - 1e-6, () => {
            const g = this.surface.g;
            g.strokeStyle = color;
            g.lineWidth = 1.4;
            g.beginPath();
            g.moveTo(q.x - nx * 4, q.y - ny * 4);
            g.lineTo(q.x + nx * 4, q.y + ny * 4);
            g.stroke();
          });
          if (style.numbers ?? true) {
            // Zahl auf der Seite, die vom Ursprung weg nach unten/links zeigt
            const sgn = ny > 0 || (Math.abs(ny) < 0.2 && nx < 0) ? 1 : -1;
            const text = this.formatTick(v);
            this.label(p, text, { color: theme.muted, size: 11, offset: [nx * sgn * 13, ny * sgn * 13], align: 'center', baseline: 'middle', layer });
          }
        }
      }
    }
  }

  private formatTick(v: number): string {
    const s = Number.isInteger(v) ? String(Math.abs(v)) : Math.abs(v).toFixed(1);
    const text = this.surface.lang === 'de' ? s.replace('.', ',') : s;
    return v < 0 ? MINUS + text : text;
  }

  /** Gitter in einer Koordinatenebene (Standard: hinter allem, zum Rand hin ausgeblendet). */
  grid(style: GridStyle3D): void {
    const theme = this.surface.theme;
    const plane = style.plane ?? 'xy';
    const step = style.step ?? 1;
    const off = style.offset ?? 0;
    const color = style.color ?? theme.grid;
    const width = style.width ?? 1;
    const fade = style.fade ?? true;
    const toWorld = (u: number, v: number): Vec3 => (plane === 'xy' ? [u, v, off] : plane === 'xz' ? [u, off, v] : [off, u, v]);
    const lines: [Vec3, Vec3][] = [];
    const [u0, v0] = style.min;
    const [u1, v1] = style.max;
    for (let u = Math.ceil(u0 / step - 1e-9) * step; u <= u1 + 1e-9; u += step) lines.push([toWorld(u, v0), toWorld(u, v1)]);
    for (let v = Math.ceil(v0 / step - 1e-9) * step; v <= v1 + 1e-9; v += step) lines.push([toWorld(u0, v), toWorld(u1, v)]);
    const proj = lines.map(([a, b]) => [this.toPx(a), this.toPx(b)] as const);
    this.add(style.layer ?? 'back', 0, () => {
      const g = this.surface.g;
      g.lineWidth = width;
      g.setLineDash([]);
      if (!fade) {
        g.strokeStyle = color;
        g.beginPath();
        for (const [a, b] of proj) {
          g.moveTo(a[0], a[1]);
          g.lineTo(b[0], b[1]);
        }
        g.stroke();
        return;
      }
      const clear = withAlphaRgb(color, 0);
      for (const [a, b] of proj) {
        const grad = g.createLinearGradient(a[0], a[1], b[0], b[1]);
        grad.addColorStop(0, clear);
        grad.addColorStop(0.18, color);
        grad.addColorStop(0.82, color);
        grad.addColorStop(1, clear);
        g.strokeStyle = grad;
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
      }
    });
  }

  /* ---------- Antippen ---------- */

  /** Kennung (`id`) der obersten gezeichneten Fläche unter dem Bildschirmpunkt (aus dem letzten Frame). */
  pick(px: number, py: number): string | null {
    for (let i = this.picks.length - 1; i >= 0; i--) {
      const p = this.picks[i]!;
      if (pointInPolygon(px, py, p.pts)) return p.id;
    }
    return null;
  }

  /* ---------- Ziehbare Punkte ---------- */

  /** Macht einen 3D-Punkt ziehbar. Gibt eine Funktion zum Entfernen zurück. */
  addHandle(handle: Handle3D): () => void {
    this.handles.push(handle);
    return () => {
      this.handles = this.handles.filter((h) => h !== handle);
    };
  }

  private handleAt(px: number, py: number, touch: boolean): Handle3D | null {
    let best: Handle3D | null = null;
    let bestDist = touch ? 26 : 15;
    for (const h of this.handles) {
      if (h.enabled && !h.enabled()) continue;
      const [x, y] = this.toPx(h.get());
      const d = Math.hypot(x - px, y - py);
      if (d <= bestDist) {
        best = h;
        bestDist = d;
      }
    }
    return best;
  }

  private constrain(handle: Handle3D, origin: Vec3, px: number, py: number): Vec3 | null {
    const ray = this.camera.ray(px, py);
    if (handle.axis) return closestOnLine(ray, origin, handle.axis);
    return intersectRayPlane(ray, origin, handle.plane ?? [0, 0, 1]);
  }

  private drawHandles(): void {
    const g = this.surface.g;
    for (const h of this.handles) {
      if (h.enabled && !h.enabled()) continue;
      const [x, y] = this.toPx(h.get());
      const active = this.hoveredHandle === h || (this.drag?.mode === 'handle' && this.drag.handle === h);
      g.beginPath();
      g.arc(x, y, active ? 14 : 11, 0, Math.PI * 2);
      g.globalAlpha = active ? 0.28 : 0.16;
      g.fillStyle = h.color?.() ?? this.surface.theme.series[0]!;
      g.fill();
      g.globalAlpha = 1;
    }
  }

  private drawHint(): void {
    const g = this.surface.g;
    const theme = this.surface.theme;
    const r = this.camera.rect;
    const text = HINT[this.surface.lang];
    g.save();
    g.font = `500 12px ${theme.font}`;
    const x = r.x + 12;
    const y = r.y + r.h - 14;
    g.globalAlpha = 0.85;
    // kleines Dreh-Symbol
    g.strokeStyle = theme.muted;
    g.lineWidth = 1.6;
    g.lineCap = 'round';
    g.beginPath();
    g.ellipse(x + 8, y, 8, 4, 0, Math.PI * 0.15, Math.PI * 1.85);
    g.stroke();
    g.beginPath();
    g.moveTo(x + 15.5, y - 4.5);
    g.lineTo(x + 15.8, y + 0.5);
    g.lineTo(x + 11.5, y - 1.2);
    g.stroke();
    g.fillStyle = theme.muted;
    g.textAlign = 'left';
    g.textBaseline = 'middle';
    g.fillText(text, x + 22, y + 0.5);
    g.restore();
  }

  /* ---------- Zeigerereignisse ---------- */

  contains(px: number, py: number): boolean {
    const r = this.camera.rect;
    return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
  }

  pointerDown(p: SurfacePointer): boolean {
    this.pointers.set(p.id, { px: p.px, py: p.py });
    if (this.pointers.size === 2 && (this.options.zoom ?? true)) {
      const [a, b] = [...this.pointers.values()] as [{ px: number; py: number }, { px: number; py: number }];
      this.drag = { mode: 'pinch', distance: Math.hypot(a.px - b.px, a.py - b.py) || 1, zoom: this.camera.zoom };
      return true;
    }
    if (this.pointers.size > 1) return true;
    const handle = this.handleAt(p.px, p.py, p.type === 'touch');
    if (handle) {
      const origin = handle.get();
      const hit = this.constrain(handle, origin, p.px, p.py);
      this.drag = { mode: 'handle', handle, origin, offset: hit ? vec3.sub(origin, hit) : [0, 0, 0] };
      this.surface.setCursor('grabbing');
      this.surface.host.requestRender();
      return true;
    }
    this.anim = null;
    this.velocity = [0, 0];
    this.samples = [];
    this.drag = { mode: 'rotate', lastX: p.px, lastY: p.py, startX: p.px, startY: p.py, start: performance.now(), rotating: false };
    if (this.options.rotate ?? true) this.surface.setCursor('grabbing');
    return true;
  }

  pointerMove(p: SurfacePointer): void {
    if (!this.pointers.has(p.id)) return;
    this.pointers.set(p.id, { px: p.px, py: p.py });
    const drag = this.drag;
    if (!drag) return;
    if (drag.mode === 'rotate') {
      const threshold = p.type === 'touch' ? 8 : 4;
      if (!drag.rotating && Math.hypot(p.px - drag.startX, p.py - drag.startY) < threshold) return;
      if (!(this.options.rotate ?? true)) return;
      if (!drag.rotating) {
        drag.rotating = true;
        drag.lastX = drag.startX;
        drag.lastY = drag.startY;
      }
      const r = this.camera.rect;
      const sens = (1.55 * 180) / (Math.min(r.w, r.h) + 220);
      const cam = this.camera;
      cam.azimuth = this.clampAz(cam.azimuth - (p.px - drag.lastX) * sens);
      cam.elevation = this.clampEl(cam.elevation + (p.py - drag.lastY) * sens);
      cam.update();
      drag.lastX = p.px;
      drag.lastY = p.py;
      const now = performance.now();
      this.samples.push({ t: now, az: cam.azimuth, el: cam.elevation });
      while (this.samples.length > 2 && now - this.samples[0]!.t > 110) this.samples.shift();
      this.rotated = true;
      this.changed = true;
      this.surface.host.requestRender();
    } else if (drag.mode === 'handle') {
      const hit = this.constrain(drag.handle, drag.origin, p.px, p.py);
      if (hit) drag.handle.set(vec3.add(hit, drag.offset));
      this.surface.host.requestRender();
    } else if (drag.mode === 'pinch' && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()] as [{ px: number; py: number }, { px: number; py: number }];
      const d = Math.hypot(a.px - b.px, a.py - b.py) || 1;
      this.camera.zoom = this.clampZoom((drag.zoom * d) / drag.distance);
      this.camera.update();
      this.changed = true;
      this.surface.host.requestRender();
    }
  }

  pointerUp(p: SurfacePointer): void {
    this.pointers.delete(p.id);
    const drag = this.drag;
    if (this.pointers.size === 0) {
      if (drag?.mode === 'rotate') {
        const now = performance.now();
        if (!drag.rotating) {
          if (now - drag.start < 700) this.options.onTap?.(p.px, p.py);
        } else if ((this.options.inertia ?? true) && !prefersReducedMotion() && this.samples.length >= 2) {
          const first = this.samples[0]!;
          const last = this.samples[this.samples.length - 1]!;
          const span = (last.t - first.t) / 1000;
          if (span > 0.012 && now - last.t < 60) {
            const v: Vec2 = [(last.az - first.az) / span, (last.el - first.el) / span];
            const speed = Math.hypot(v[0], v[1]);
            const max = 540;
            this.velocity = speed > max ? [(v[0] * max) / speed, (v[1] * max) / speed] : v;
            this.lastFrame = now;
          }
        }
      }
      this.drag = null;
      this.hover(p);
      this.surface.host.requestRender();
    } else if (drag?.mode === 'pinch') {
      const [rest] = [...this.pointers.values()];
      this.drag = rest ? { mode: 'rotate', lastX: rest.px, lastY: rest.py, startX: rest.px, startY: rest.py, start: 0, rotating: true } : null;
    }
  }

  hover(p: SurfacePointer | null): void {
    if (this.drag) return;
    const handle = p ? this.handleAt(p.px, p.py, false) : null;
    if (handle !== this.hoveredHandle) {
      this.hoveredHandle = handle;
      this.surface.host.requestRender();
    }
    if (!p) return;
    if (handle) this.surface.setCursor('grab');
    else if (this.options.tapCursor?.(p.px, p.py)) this.surface.setCursor('pointer');
    else this.surface.setCursor((this.options.rotate ?? true) ? 'grab' : '');
  }

  wheel(_px: number, _py: number, deltaY: number): boolean {
    if (!(this.options.zoom ?? true)) return false;
    this.anim = null;
    this.camera.zoom = this.clampZoom(this.camera.zoom * Math.exp(-deltaY * 0.0025));
    this.camera.update();
    this.changed = true;
    this.surface.host.requestRender();
    return true;
  }

  /* ---------- Schaltflächen ---------- */

  private createControls(): void {
    const lang = this.surface.lang;
    const el = document.createElement('div');
    el.className = 'plot-controls';
    const button = (label: string, icon: string, action: () => void) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'plot-controls__btn';
      b.title = label;
      b.setAttribute('aria-label', label);
      b.innerHTML = icon;
      b.addEventListener('click', action);
      el.append(b);
    };
    const svg = (path: string) =>
      `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    if (this.options.zoom ?? true) {
      button(t(lang, 'sim.zoomIn'), svg('M12 5v14M5 12h14'), () => this.animateTo({ zoom: this.camera.zoom * 1.3 }, 250));
      button(t(lang, 'sim.zoomOut'), svg('M5 12h14'), () => this.animateTo({ zoom: this.camera.zoom / 1.3 }, 250));
    }
    button(t(lang, 'sim.viewReset'), svg('M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4'), () => this.resetView());
    this.surface.host.stage.append(el);
    this.controlsEl = el;
  }

  private positionControls(): void {
    if (!this.controlsEl) return;
    const r = this.camera.rect;
    this.controlsEl.style.top = `${r.y + 8}px`;
    this.controlsEl.style.right = `${this.surface.width - (r.x + r.w) + 8}px`;
  }
}

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */

function pathPoly(g: CanvasRenderingContext2D, pts: readonly (readonly [number, number])[], close = true): void {
  pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
  if (close) g.closePath();
}

function strokeStyle(g: CanvasRenderingContext2D, color: string, width: number, dash: number[], alpha: number): void {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.setLineDash(dash);
  g.globalAlpha = alpha;
  g.lineCap = dash.length ? 'butt' : 'round';
  g.lineJoin = 'round';
}

function resetStroke(g: CanvasRenderingContext2D): void {
  g.setLineDash([]);
  g.lineDashOffset = 0;
  g.globalAlpha = 1;
}

/** Gut lesbare Schriftfarbe auf einer Fläche: dunkel auf hellen, hell auf dunklen Flächen. */
function contrastInk(fill: Rgb, theme: { dark: boolean; bg: string; text: string }): string {
  const lum = (0.2126 * fill[0] + 0.7152 * fill[1] + 0.0722 * fill[2]) / 255;
  const darkInk = theme.dark ? theme.bg : theme.text;
  const lightInk = theme.dark ? theme.text : theme.bg;
  return lum > 0.42 ? darkInk : lightInk;
}

function withAlphaRgb(color: string, alpha: number): string {
  return rgbCss(parseColor(color), alpha);
}

/** Liegt der Punkt im Vieleck (Strahlverfahren)? */
export function pointInPolygon(px: number, py: number, pts: readonly Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]!;
    const [xj, yj] = pts[j]!;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function drawText(
  g: CanvasRenderingContext2D,
  theme: { bg: string; text: string; font: string; mathFont: string },
  x: number,
  y: number,
  text: string,
  style: LabelStyle3D,
): void {
  const size = style.size ?? 14;
  const family = style.math ? theme.mathFont : theme.font;
  g.font = `${style.math ? 'italic ' : ''}${style.weight ?? 'normal'} ${size}px ${family}`;
  g.textAlign = style.align ?? 'left';
  g.textBaseline = style.baseline ?? 'alphabetic';
  const content = text.replace(/-(?=[\d.,])/g, MINUS);
  if (style.background) {
    const w = g.measureText(content).width;
    const align = g.textAlign;
    const left = align === 'center' ? x - w / 2 : align === 'right' || align === 'end' ? x - w : x;
    const base = g.textBaseline;
    const top = base === 'middle' ? y - size * 0.5 : base === 'top' ? y : y - size * 0.8;
    const padX = 7;
    const padY = 4;
    const rx = left - padX;
    const ry = top - padY;
    const rw = w + padX * 2;
    const rh = size + padY * 2;
    const rad = Math.min(8, rh / 2);
    g.beginPath();
    g.moveTo(rx + rad, ry);
    g.arcTo(rx + rw, ry, rx + rw, ry + rh, rad);
    g.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
    g.arcTo(rx, ry + rh, rx, ry, rad);
    g.arcTo(rx, ry, rx + rw, ry, rad);
    g.closePath();
    g.fillStyle = style.background;
    g.fill();
  } else if (style.halo ?? true) {
    g.lineWidth = 4;
    g.lineJoin = 'round';
    g.strokeStyle = theme.bg;
    g.strokeText(content, x, y);
  }
  g.fillStyle = style.color ?? theme.text;
  g.fillText(content, x, y);
}
