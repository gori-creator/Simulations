/**
 * Startseite: körnige Armillarskulptur (WebGL) und die Münze, die beim Scrollen
 * aus der Skulptur heraus einer durchgehenden Führung folgt.
 *
 * Übernommen aus dem Entwurf docs/design/coin-reise-v13/sculpture.js (Geometrie,
 * Farben, Bewegung und Bahn unverändert), hier mit Typen, Initialisierung und
 * Abbau. Ohne WebGL zeigt die Seite eine gezeichnete SVG-Ersatzgrafik.
 *
 * Bahn der Münze:
 * - ab 1024 px (Desktop): aus der Skulptur nach unten, unter dem Einstieg nach
 *   links und dann als Spur am linken Rand bis zum Seitenende;
 * - darunter: in zwei Bögen bis zur Ablage („Startimpuls“) neben der Achterbahn.
 */
import { motion } from './motion';

type Mat4 = number[];
type Vec3 = [number, number, number];
interface Mesh {
  buffer: WebGLBuffer;
  count: number;
}

const I = (): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a: Mat4, b: Mat4): Mat4 {
  const o: Mat4 = Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r]! += a[k * 4 + r]! * b[c * 4 + k]!;
  return o;
}
const chain = (...ms: Mat4[]): Mat4 => ms.reduce(mul, I());
const T = (x: number, y: number, z: number): Mat4 => {
  const m = I();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
};
const S = (s: number): Mat4 => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
const RX = (a: number): Mat4 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
};
const RY = (a: number): Mat4 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
};
const RZ = (a: number): Mat4 => {
  const c = Math.cos(a), s = Math.sin(a);
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
};
const transform = (m: Mat4, p: readonly number[]): Vec3 =>
  [0, 1, 2].map((r) => m[r]! * p[0]! + m[4 + r]! * p[1]! + m[8 + r]! * p[2]! + m[12 + r]!) as Vec3;
const normalize = (n: readonly number[]): Vec3 => {
  const l = Math.hypot(...n) || 1;
  return n.map((x) => x / l) as Vec3;
};
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const twoPi = Math.PI * 2;
const root = chain(RX(0.16), RY(-0.17));
const center = T(0, 0.45, 0);
/** Begrenzter Schwenk (etwa ±20°), damit der Kopf nie als schmales Oval erscheint. */
const turnAngle = (seconds: number) => 0.34 * Math.sin((seconds * twoPi) / 48);
const blue: Vec3 = [0.08, 0.29, 0.81];
const hoopA = chain(RZ(0.66), RY(1.1), RX(Math.PI / 2));
const hoopB = chain(RZ(-0.64), RY(-1.08), RX(Math.PI / 2));
// Ein dritter Großkreis senkrecht zu den beiden anderen schließt den Rahmen; so wird keine Seitenansicht flach.
const thirdNormal = normalize(cross(transform(hoopA, [0, 1, 0]), transform(hoopB, [0, 1, 0])));
const thirdX = normalize(cross([0, 0, 1], thirdNormal));
const thirdZ = cross(thirdX, thirdNormal);
const hoopC: Mat4 = [...thirdX, 0, ...thirdNormal, 0, ...thirdZ, 0, 0, 0, 0, 1];
/**
 * Fester Meridianring, der immer zum Betrachter zeigt (hebt die Neigung `root` auf):
 * Sein Umriss ist der Umriss der ganzen Kugel. Ohne ihn wirkte der Kopf je nach
 * Schwenk bis zu 9 % breiter als hoch, also oval statt rund.
 */
const facing = chain(RY(0.17), RX(-0.16), RX(Math.PI / 2));
const meridian = chain(center, facing);

/** Außenradius der großen Ringe (Mittellinie 2,65 plus halbe Bandbreite). */
const HEAD_RADIUS = 2.65 + 0.135;

/**
 * Umriss des Kopfs in der Bildebene zur Zeit `seconds`: größte Ausdehnung der
 * großen Ringe je Richtung (Stützfunktion, Abstand vom Kopfmittelpunkt). Für
 * einen runden Kopf sind alle Werte gleich; geprüft in tests/skulptur.test.ts.
 */
export function headOutline(seconds: number, directions = 72): number[] {
  const assembly = RY(turnAngle(seconds));
  const rings: [Mat4, number][] = [
    [chain(root, assembly, hoopA), HEAD_RADIUS],
    [chain(root, assembly, hoopB), HEAD_RADIUS],
    [chain(root, assembly, hoopC), 2.65 + 0.09],
    [chain(root, facing), HEAD_RADIUS],
  ];
  const support = Array<number>(directions).fill(0);
  for (const [m, r] of rings)
    for (let i = 0; i < 720; i++) {
      const a = (i / 720) * twoPi;
      const p = transform(m, [r * Math.cos(a), 0, r * Math.sin(a)]);
      for (let k = 0; k < directions; k++) {
        const d = (k / directions) * twoPi;
        support[k] = Math.max(support[k]!, p[0] * Math.cos(d) + p[1] * Math.sin(d));
      }
    }
  return support;
}

const VERTEX = `attribute vec3 position;attribute vec3 normal;uniform mat4 projection;uniform mat4 model;varying vec3 vNormal;varying vec3 vLocal;varying vec3 vLocalNormal;varying vec3 vWorld;void main(){vec4 p=model*vec4(position,1.);vNormal=normalize(mat3(model)*normal);vLocal=position;vLocalNormal=normal;vWorld=p.xyz;gl_Position=projection*p;}`;
// Das Korn ist eine feste Materialtextur mit Mipmaps: Es dreht sich mit der Oberfläche und wird nicht je Bild neu gewürfelt.
const FRAGMENT = `precision highp float;varying vec3 vNormal;varying vec3 vLocal;varying vec3 vLocalNormal;varying vec3 vWorld;uniform vec3 pigment;uniform sampler2D grainMap;void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-.45,.8,1.));float diffuse=max(dot(n,light),0.);float side=max(dot(n,normalize(vec3(1.,.4,-.2))),0.);float rim=pow(1.-abs(n.z),3.);float spec=pow(max(dot(reflect(-light,n),vec3(0.,0.,1.)),0.),28.);vec3 weights=pow(abs(normalize(vLocalNormal)),vec3(4.));weights/=max(dot(weights,vec3(1.)),.001);float grain=dot(vec3(texture2D(grainMap,vLocal.yz*.34).r,texture2D(grainMap,vLocal.xz*.34).r,texture2D(grainMap,vLocal.xy*.34).r),weights)-.5;vec3 c=pigment*(.27+.94*diffuse)+vec3(.06,.12,.23)*side+vec3(.08,.14,.22)*rim+vec3(.34,.43,.52)*spec;c*=clamp((vWorld.y+4.3)*.075,.72,1.);c+=grain*(.18+.22*diffuse);gl_FragColor=vec4(c,1.);}`;

/** Zeichnet die Skulptur mit WebGL. */
class SculptureRenderer {
  private program!: WebGLProgram;
  private loc!: { position: number; normal: number; model: WebGLUniformLocation | null; projection: WebGLUniformLocation | null; pigment: WebGLUniformLocation | null };
  private meshes!: Record<'outer' | 'crossHoop' | 'meridian' | 'middle' | 'inner' | 'sphere' | 'axis' | 'post' | 'plinth' | 'base' | 'collar' | 'floor', Mesh>;

  constructor(private readonly gl: WebGLRenderingContext) {
    this.setup();
  }

  private geometry(vertices: number[]): Mesh {
    const gl = this.gl;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('WebGL-Puffer nicht verfügbar');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return { buffer, count: vertices.length / 6 };
  }

  private lathe(profile: [number, number][], steps = 112): Mesh {
    const data: number[] = [];
    const point = (i: number, j: number): Vec3 => {
      const [r, y] = profile[j]!;
      const a = (i / steps) * twoPi;
      return [r * Math.cos(a), y, r * Math.sin(a)];
    };
    for (let j = 0; j < profile.length - 1; j++)
      for (let i = 0; i < steps; i++) {
        const dy = profile[j + 1]![1] - profile[j]![1];
        const dr = profile[j + 1]![0] - profile[j]![0];
        const vertex = (u: number, v: number) => {
          const a = (u / steps) * twoPi;
          const n = normalize([dy * Math.cos(a), -dr, dy * Math.sin(a)]);
          data.push(...point(u, v), ...n);
        };
        vertex(i, j);
        vertex(i + 1, j);
        vertex(i + 1, j + 1);
        vertex(i, j);
        vertex(i + 1, j + 1);
        vertex(i, j + 1);
      }
    return this.geometry(data);
  }

  /** Geschlossenes, abgefastes Ringprofil; der Ring liegt zunächst in der XZ-Ebene. */
  private band(radius: number, width: number, depth: number): Mesh {
    const r = radius, w = width / 2, d = depth / 2, b = Math.min(width, depth) * 0.18;
    return this.lathe(
      [[r - w, -d + b], [r - w + b, -d], [r + w - b, -d], [r + w, -d + b], [r + w, d - b], [r + w - b, d], [r - w + b, d], [r - w, d - b], [r - w, -d + b]],
      144,
    );
  }

  private sphere(): Mesh {
    const data: number[] = [];
    const u = 40, v = 24;
    const pt = (i: number, j: number): Vec3 => {
      const a = (i / u) * twoPi, b = (j / v) * Math.PI;
      return [Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)];
    };
    for (let j = 0; j < v; j++)
      for (let i = 0; i < u; i++)
        for (const [a, b] of [[i, j], [i + 1, j], [i + 1, j + 1], [i, j], [i + 1, j + 1], [i, j + 1]] as const) {
          const p = pt(a, b);
          data.push(...p, ...p);
        }
    return this.geometry(data);
  }

  private setup(): void {
    const gl = this.gl;
    const compile = (type: number, code: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error('Shader nicht verfügbar');
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader');
      return shader;
    };
    const program = gl.createProgram();
    if (!program) throw new Error('WebGL-Programm nicht verfügbar');
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? 'Programm');
    gl.useProgram(program);
    this.program = program;
    this.loc = {
      position: gl.getAttribLocation(program, 'position'),
      normal: gl.getAttribLocation(program, 'normal'),
      model: gl.getUniformLocation(program, 'model'),
      projection: gl.getUniformLocation(program, 'projection'),
      pigment: gl.getUniformLocation(program, 'pigment'),
    };
    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(0, 0, 0, 0);
    // Feste Körnung (Xorshift mit festem Startwert), als Textur mit Mipmaps
    const noise = new Uint8Array(256 * 256 * 4);
    let seed = 0x5b1a7;
    for (let i = 0; i < noise.length; i += 4) {
      seed ^= seed << 13;
      seed ^= seed >>> 17;
      seed ^= seed << 5;
      const value = (seed >>> 0) & 255;
      noise[i] = noise[i + 1] = noise[i + 2] = value;
      noise[i + 3] = 255;
    }
    const grainMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, grainMap);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, noise);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.uniform1i(gl.getUniformLocation(program, 'grainMap'), 0);
    this.meshes = {
      outer: this.band(2.65, 0.27, 0.24),
      crossHoop: this.band(2.65, 0.18, 0.18),
      meridian: this.band(2.65, 0.27, 0.16),
      middle: this.band(2.12, 0.045, 0.05),
      inner: this.band(1.43, 0.035, 0.035),
      sphere: this.sphere(),
      axis: this.lathe([[0, -2.9], [0.047, -2.9], [0.047, 2.9], [0, 2.9]]),
      post: this.lathe([[0, -3.65], [0.066, -3.65], [0.066, -1.5], [0, -1.5]]),
      plinth: this.lathe([[0.26, -3.7], [1.16, -3.7], [1.2, -3.65], [0.69, -2.58], [0.61, -2.55], [0.26, -2.55], [0.26, -3.7]]),
      base: this.lathe([[0.26, -4.02], [1.68, -4.02], [1.7, -3.9], [1.6, -3.83], [0.26, -3.83], [0.26, -4.02]]),
      collar: this.band(0.8, 0.14, 0.13),
      floor: this.lathe([[0, -4.17], [1.94, -4.17], [1.94, -4.08], [0, -4.08]]),
    };
  }

  private paint(mesh: Mesh, m: Mat4, color: Vec3 = blue): void {
    const gl = this.gl, loc = this.loc;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.buffer);
    gl.enableVertexAttribArray(loc.position);
    gl.enableVertexAttribArray(loc.normal);
    gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(loc.model, false, chain(root, m));
    gl.uniform3fv(loc.pigment, color);
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  }

  draw(projection: Mat4, width: number, height: number, time: number): void {
    const gl = this.gl, meshes = this.meshes;
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.loc.projection, false, projection);
    this.paint(meshes.floor, I(), [0.79, 0.78, 0.72]);
    this.paint(meshes.base, I());
    this.paint(meshes.plinth, I());
    this.paint(meshes.post, T(-0.8, 0, 0));
    this.paint(meshes.post, T(0.8, 0, 0));
    this.paint(meshes.collar, T(0, -2.05, 0));
    this.paint(meshes.axis, T(0, -0.02, -0.5));
    this.paint(meshes.sphere, chain(T(0, 3.18, -0.5), S(0.17)));
    // Drei feste Ringebenen bilden einen räumlichen Rahmen; der ganze Kopf schwenkt als starres Ganzes.
    this.paint(meshes.meridian, meridian, [0.07, 0.27, 0.78]);
    const assembly = chain(center, RY(turnAngle(time)));
    this.paint(meshes.outer, chain(assembly, hoopA));
    this.paint(meshes.outer, chain(assembly, hoopB), [0.075, 0.32, 0.88]);
    this.paint(meshes.crossHoop, chain(assembly, hoopC), [0.09, 0.33, 0.86]);
    // Die Körper laufen auf festen Bahnebenen und verdecken sich über den gemeinsamen Tiefenpuffer.
    const orbit = chain(assembly, RZ(-0.26), RX(0.36));
    this.paint(meshes.middle, orbit, [0.12, 0.34, 0.8]);
    for (const [offset, size] of [[0, 0.31], [Math.PI, 0.15], [1.8, 0.09]] as const) {
      const a = (time * twoPi) / 22 + offset + 0.5;
      const p = transform(orbit, [2.12 * Math.cos(a), 0, 2.12 * Math.sin(a)]);
      this.paint(meshes.sphere, chain(T(...p), RY(a), S(size)), offset === 0 ? [0.12, 0.38, 0.87] : [0.18, 0.43, 0.93]);
    }
    const inner = chain(assembly, RZ(0.25), RX(1.18));
    this.paint(meshes.inner, inner, [0.13, 0.37, 0.85]);
    const a = (-time * twoPi) / 16 + 2.7;
    const p = transform(inner, [1.43 * Math.cos(a), 0, 1.43 * Math.sin(a)]);
    this.paint(meshes.sphere, chain(T(...p), RY(a), S(0.12)), [0.32, 0.55, 0.9]);
  }

  dispose(): void {
    for (const mesh of Object.values(this.meshes)) this.gl.deleteBuffer(mesh.buffer);
    this.gl.deleteProgram(this.program);
  }
}

export interface Journey {
  /** Ist die Münze an der Achterbahn angekommen? */
  readonly arrived: boolean;
  /** Bei Ankunft benachrichtigen (einmal); gibt das Abmelden zurück. */
  onArrival(listener: () => void): () => void;
  /** Bahn neu vermessen (nach Änderungen am Seitenaufbau). */
  refresh(): void;
  destroy(): void;
}

interface Elements {
  /** Bezugsrahmen der Bahn (position: relative). */
  root: HTMLElement;
  hero: HTMLElement;
  wrap: HTMLElement;
  canvas: HTMLCanvasElement;
  guide: SVGSVGElement;
  path: SVGPathElement;
  anchor: HTMLElement;
  rotor: HTMLElement;
  dock: HTMLElement;
  experiment: HTMLElement;
  footer: HTMLElement | null;
}

export function initSculpture(el: Elements): Journey {
  const { root: base, canvas, wrap, guide, path, anchor, rotor, dock } = el;
  const desktop = matchMedia('(min-width: 1024px)');
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' });
  let renderer: SculptureRenderer | null = null;
  if (gl) {
    try {
      renderer = new SculptureRenderer(gl);
    } catch (error) {
      console.warn('Skulptur: grafische Ersatzansicht aktiv:', (error as Error).message);
    }
  }
  wrap.classList.toggle('webgl-unavailable', !renderer);

  let projection = I(), width = 1, height = 1, viewHeight = 9.2;
  let frame = 0, last = 0, time = 0, progress = 0, targetProgress = 0, arrived = false;
  let startAt = 50, endAt = 800, totalLength = 1;
  let sideJourney = false, joinLength = 0, joinY = 0, railX = 40, mainTop = 0, railEnd = 0, arrivalY = 0, joinAt = 0;
  const arrivalListeners = new Set<() => void>();
  const paused = () => motion.paused || motion.reduced;

  function screen(point: readonly number[]) {
    const p = transform(root, point);
    return { x: width / 2 + (p[0] * height) / viewHeight, y: height / 2 - (p[1] * height) / viewHeight };
  }

  function pinY(): number {
    return clamp(innerHeight * 0.46, 180, innerHeight - 100);
  }

  function desiredProgress(): number {
    if (motion.reduced) return 0;
    if (!sideJourney) return clamp((scrollY - startAt) / (endAt - startAt), 0, 1);
    let distance: number;
    if (scrollY < joinAt) {
      const t = clamp(scrollY / joinAt, 0, 1);
      const slope = Math.min(1, joinAt / joinLength);
      // Sanft aus der Fassung, danach ein Pixel Bahn je Pixel Scrollweg
      distance = joinLength * ((slope - 2) * t * t * t + (3 - slope) * t * t);
    } else {
      distance = joinLength + clamp(scrollY + pinY() - mainTop - joinY, 0, railEnd - joinY);
    }
    return clamp(distance / totalLength, 0, 1);
  }

  function measure(): void {
    const wasSide = sideJourney, oldJoin = joinLength, oldDistance = progress * totalLength, oldTotal = totalLength;
    sideJourney = desktop.matches;
    document.documentElement.classList.toggle('home-journey', sideJourney);
    const r = canvas.getBoundingClientRect(), b = base.getBoundingClientRect(), d = dock.getBoundingClientRect();
    width = r.width;
    height = r.height;
    // Der geneigte Boden reicht unter −4,4: Platz für seine Vorderkante lassen.
    viewHeight = innerWidth < 761 ? Math.max(9.2, (5.6 * height) / (innerWidth - 28)) : innerWidth <= 1150 ? Math.max(9.2, (5.6 * height) / (innerWidth * 0.46)) : 9.2;
    mainTop = b.top + scrollY;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    projection = [2 / ((viewHeight * width) / height), 0, 0, 0, 0, 2 / viewHeight, 0, 0, 0, 0, -0.12, 0, 0, 0, 0, 1];
    const c = screen([0.52, 0.94, 3]), exit = screen([2.4, -2.8, 1]);
    const start = { x: r.left - b.left + c.x, y: r.top - b.top + c.y };
    const end = { x: d.left - b.left + d.width / 2, y: d.top - b.top + d.height - 44 };
    const span = end.y - start.y;
    const gate = { x: Math.min(r.left - b.left + exit.x, b.width - 38), y: Math.min(r.top - b.top + exit.y, end.y - span * 0.22) };
    // Zwei Bézierbögen mit gemeinsamer senkrechter Tangente: aus der Fassung, am Sockel vorbei, in die Ablage.
    let data = `M${start.x},${start.y} C${start.x},${start.y + span * 0.28} ${gate.x},${gate.y - span * 0.14} ${gate.x},${gate.y} C${gate.x},${gate.y + span * 0.14} ${end.x},${end.y - span * 0.17} ${end.x},${end.y}`;
    if (sideJourney) {
      const hero = el.hero.getBoundingClientRect();
      const bottom = (el.footer ?? base).getBoundingClientRect().bottom;
      railX = Math.max(40, (b.width - 1360) / 2 - 20);
      const bendY = hero.bottom - b.top - 38;
      joinY = bendY + 66;
      const exitX = Math.min(b.width - 35, r.left - b.left + width / 2 + (2.2 * height) / viewHeight);
      // Nur den freien Streifen unter dem Einstieg queren, dann der Randspur folgen.
      data = `M${start.x},${start.y} C${exitX},${start.y + 40} ${exitX},${bendY - 55} ${exitX},${bendY - 28} Q${exitX},${bendY} ${exitX - 45},${bendY} L${railX + 66},${bendY} Q${railX},${bendY} ${railX},${joinY}`;
      path.setAttribute('d', data);
      joinLength = path.getTotalLength();
      railEnd = Math.max(joinY + 100, bottom - b.top - 30);
      data += ` L${railX},${railEnd}`;
      startAt = 0;
      joinAt = Math.max(120, joinY + mainTop - pinY());
      endAt = railEnd + mainTop - pinY();
      arrivalY = el.experiment.getBoundingClientRect().top - b.top + 150;
      guide.style.height = `${railEnd + 29}px`;
    } else {
      joinLength = 0;
      joinY = 0;
      guide.style.height = `${end.y + 100}px`;
      startAt = Math.max(40, start.y + mainTop - innerHeight * 0.62);
      endAt = Math.max(startAt + 200, end.y + mainTop - innerHeight * 0.46);
    }
    path.setAttribute('d', data);
    for (const p of guide.querySelectorAll('path[data-guide-line]')) p.setAttribute('d', data);
    totalLength = path.getTotalLength();
    if (wasSide !== sideJourney) progress = desiredProgress();
    else if (sideJourney && oldTotal > 1) {
      // Münze im Blick behalten, wenn Suche/Filter die Seitenlänge ändern
      progress = oldDistance >= oldJoin ? desiredProgress() : (clamp(oldDistance / Math.max(oldJoin, 1), 0, 1) * joinLength) / totalLength;
    }
    layoutFallback();
    request();
  }

  /** Schatten und SVG-Ersatzgrafik an die vermessene Bühne anpassen. */
  function layoutFallback(): void {
    const unit = height / viewHeight, cx = width / 2, cy = height / 2 - 0.45 * unit;
    const shadow = wrap.querySelector<HTMLElement>('.sculpture-shadow');
    if (shadow) Object.assign(shadow.style, { left: `${width / 2 - 2 * unit}px`, top: `${height / 2 + 4.04 * unit}px`, width: `${4 * unit}px`, height: `${0.3 * unit}px`, bottom: 'auto', right: 'auto' });
    const fallback = wrap.querySelector<SVGSVGElement>('.sculpture-fallback');
    if (!fallback || renderer) return;
    fallback.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const ring = (rx: number, ry: number, stroke: number, rotate = 0) =>
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx * unit}" ry="${ry * unit}" stroke-width="${stroke * unit}"${rotate ? ` transform="rotate(${rotate} ${cx} ${cy})"` : ''}/>`;
    fallback.innerHTML =
      `<g fill="none" stroke="currentColor">${ring(2.65, 1.1, 0.27, 53)}${ring(2.65, 1.1, 0.27, -53)}${ring(2.65, 1.7, 0.18)}${ring(2.12, 0.8, 0.045)}${ring(1.43, 1.4, 0.045)}` +
      `<path d="M${cx} ${cy - 3 * unit}V${cy + 2.8 * unit}" stroke-width="${0.045 * unit}"/></g>` +
      `<path d="M${cx - 0.62 * unit} ${height / 2 + 2.55 * unit}h${1.24 * unit}l${0.58 * unit} ${1.1 * unit}h${-2.4 * unit}Z" fill="currentColor"/>` +
      `<ellipse cx="${cx}" cy="${height / 2 + 3.94 * unit}" rx="${1.7 * unit}" ry="${0.22 * unit}" fill="currentColor"/>` +
      `<circle cx="${cx + 1.8 * unit}" cy="${cy + 0.42 * unit}" r="${0.3 * unit}" fill="currentColor"/>`;
  }

  function moveCoin(delta: number): void {
    targetProgress = desiredProgress();
    if (motion.reduced) progress = 0;
    else if (!motion.paused) {
      progress += (targetProgress - progress) * (1 - Math.exp(-delta * 14));
      if (Math.abs(targetProgress - progress) * totalLength < 0.1) progress = targetProgress;
    }
    const distance = progress * totalLength;
    const p = path.getPointAtLength(distance);
    const transfer = sideJourney ? clamp(distance / Math.max(joinLength, 1), 0, 1) : progress;
    const initialSize = (1.07 * height) / viewHeight;
    const coinSize = initialSize * (1 - transfer) + (sideJourney ? 48 : innerWidth < 761 ? 49 : 65) * transfer;
    anchor.style.visibility = 'visible';
    anchor.style.transform = `translate3d(${p.x - 60}px,${p.y - 60}px,0) scale(${coinSize / 120})`;
    const eased = transfer * transfer * (3 - 2 * transfer);
    const sideDistance = Math.max(0, distance - joinLength);
    rotor.style.transform = `rotateY(${Math.sin(transfer * Math.PI) * 22 + (sideJourney ? Math.sin(sideDistance / 220) * 12 : 0)}deg) rotateZ(${eased * 360 + (sideJourney ? sideDistance * 0.4 : 0)}deg)`;
    const atExperiment = sideJourney ? p.y >= arrivalY : progress >= 0.999;
    dock.classList.toggle('is-arrived', !sideJourney && atExperiment);
    if (atExperiment && !arrived && !paused()) {
      arrived = true;
      for (const listener of arrivalListeners) listener();
    }
  }

  function visible(): boolean {
    const rect = wrap.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < innerHeight;
  }

  function tick(now: number): void {
    frame = 0;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    if (!paused()) time += delta;
    const onScreen = visible();
    if (onScreen && renderer) renderer.draw(projection, canvas.width, canvas.height, time);
    moveCoin(delta);
    const unsettled = Math.abs(targetProgress - progress) * totalLength > 0.1;
    if (!paused() && !document.hidden && (onScreen || unsettled)) frame = requestAnimationFrame(tick);
  }

  function request(): void {
    if (!frame && !document.hidden) frame = requestAnimationFrame(tick);
  }

  let measureFrame = 0;
  const scheduleMeasure = () => {
    if (!measureFrame)
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0;
        measure();
      });
  };
  const observer = new ResizeObserver(scheduleMeasure);
  observer.observe(wrap);
  observer.observe(base);
  if (el.footer) observer.observe(el.footer);
  const onVisibility = () => {
    last = 0;
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else request();
  };
  const onPageHide = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    renderer = null;
    wrap.classList.add('webgl-unavailable');
    measure();
  };
  const onContextRestored = () => {
    try {
      renderer = gl ? new SculptureRenderer(gl) : null;
      wrap.classList.toggle('webgl-unavailable', !renderer);
    } catch {
      renderer = null;
    }
    measure();
  };
  addEventListener('resize', scheduleMeasure);
  addEventListener('scroll', request, { passive: true });
  addEventListener('pageshow', request);
  addEventListener('pagehide', onPageHide);
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('webglcontextlost', onContextLost);
  canvas.addEventListener('webglcontextrestored', onContextRestored);
  const unsubscribe = motion.subscribe(() => {
    last = 0;
    request();
  });
  const unReduced = motion.onReducedChange(() => {
    progress = 0;
    measure();
  });
  desktop.addEventListener('change', scheduleMeasure);
  measure();

  return {
    get arrived() {
      return arrived;
    },
    onArrival(listener) {
      arrivalListeners.add(listener);
      return () => arrivalListeners.delete(listener);
    },
    refresh: scheduleMeasure,
    destroy() {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(measureFrame);
      observer.disconnect();
      removeEventListener('resize', scheduleMeasure);
      removeEventListener('scroll', request);
      removeEventListener('pageshow', request);
      removeEventListener('pagehide', onPageHide);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      desktop.removeEventListener('change', scheduleMeasure);
      unsubscribe();
      unReduced();
      arrivalListeners.clear();
      renderer?.dispose();
      document.documentElement.classList.remove('home-journey');
    },
  };
}
