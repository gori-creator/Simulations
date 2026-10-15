/**
 * Rechenlogik „Stehende Wellen“.
 *
 * 1. Entstehung durch Reflexion: Eine Welle y_h läuft auf ein Ende zu und wird
 *    dort reflektiert. Mit dem Abstand d vom Ende und u = ω · t gilt (ohne Fronten)
 *
 *      festes Ende (Phasensprung π):  y = ŷ·sin(u + k·d) − ŷ·sin(u − k·d) = 2ŷ · sin(k·d) · cos u
 *      loses Ende (kein Phasensprung): y = ŷ·sin(u + k·d) + ŷ·sin(u − k·d) = 2ŷ · cos(k·d) · sin u
 *
 *    mit k = 2π/λ. Am festen Ende liegen die Knoten bei d = k·λ/2, am losen Ende die Bäuche.
 *
 * 2. Eigenschwingungen eines Wellenträgers der Länge L (x = 0 links, x = L rechts):
 *
 *      beide Enden fest bzw. beide lose:  L = n · λ/2        → f_n = n · c/(2L)
 *      ein Ende fest, eines lose:         L = (2n − 1) · λ/4 → f_n = (2n − 1) · c/(4L)
 *
 *    Für eine Luftsäule gilt dasselbe für die Bewegung der Luftteilchen (Schnelle):
 *    Ein geschlossenes Ende ist ein Schnelleknoten (wie ein festes Ende),
 *    ein offenes Ende ein Schnellebauch (wie ein loses Ende). Der Druck hat
 *    seine Knoten genau an den Schnellebäuchen und umgekehrt.
 *
 * 3. Erzwungene Schwingung (Melde-Versuch): Das linke Ende wird mit
 *    y(0, t) = a · sin(ω t) bewegt, das rechte ist fest. Mit schwacher Dämpfung
 *    (y_tt = c² · y_xx − 2γ · y_t) lautet die eingeschwungene Lösung
 *
 *      y(x, t) = Im( Y(x) · e^{iωt} ),   Y(x) = a · sin(k̃ · (L − x)) / sin(k̃ · L),
 *      k̃² = (ω² − 2iγω) / c².
 *
 *    Bei den Eigenfrequenzen f_n = n · c/(2L) wird |Y| groß (Resonanz).
 *
 * Für die Animation wird dimensionslos gerechnet: Länge in Einheiten von L
 * (x̂ = x/L), Zeit in Einheiten von T₁ = 2L/c (Periodendauer der Grundschwingung
 * bei zwei gleichen Enden). Dann ist ĉ = 2, und eine Frequenz f entspricht
 * ν = f / f₁ mit f₁ = c/(2L).
 */

const TAU = 2 * Math.PI;

/** Randbedingungen (für die Auslenkung bzw. Schnelle): fest–fest, fest–lose, lose–lose. */
export type Bc = 'ff' | 'fl' | 'll';
/** Rohr: beidseitig geschlossen, gedackt (links zu, rechts offen), beidseitig offen. */
export type Pipe = 'shut' | 'closed' | 'open';
/** Art des Endes bei der Reflexion. */
export type EndType = 'fix' | 'free';

/** Rohr → Randbedingung für die Bewegung der Luftteilchen. */
export function pipeBc(pipe: Pipe): Bc {
  return pipe === 'shut' ? 'ff' : pipe === 'closed' ? 'fl' : 'll';
}

/** Ordnung der Harmonischen: f_n = h · f₁ mit h = n (gleiche Enden) bzw. h = 2n − 1 (ungleiche Enden). */
export function harmonic(bc: Bc, n: number): number {
  return bc === 'fl' ? 2 * n - 1 : n;
}

/** Wellenlänge der n-ten Eigenschwingung (m). */
export function eigenWavelength(bc: Bc, n: number, L: number): number {
  return bc === 'fl' ? (4 * L) / (2 * n - 1) : (2 * L) / n;
}

/** Eigenfrequenz f_n (Hz) für Länge L (m) und Ausbreitungsgeschwindigkeit c (m/s). */
export function eigenFrequency(bc: Bc, n: number, L: number, c: number): number {
  return c / eigenWavelength(bc, n, L);
}

/** Grundfrequenz f₁ (Hz). */
export function fundamental(bc: Bc, L: number, c: number): number {
  return eigenFrequency(bc, 1, L, c);
}

/** Bezugsfrequenz c/(2L) der dimensionslosen Rechnung (Hz). */
export function refFrequency(L: number, c: number): number {
  return c / (2 * L);
}

/** Dimensionslose Frequenz ν = f / (c/(2L)) der n-ten Eigenschwingung: n bzw. n − ½. */
export function eigenNu(bc: Bc, n: number): number {
  return bc === 'fl' ? n - 0.5 : n;
}

/**
 * Form der n-ten Eigenschwingung an der Stelle x̂ = x/L ∈ [0; 1], Werte in [−1; 1].
 * fest–lose: links fest, rechts lose.
 */
export function modeShape(bc: Bc, n: number, xh: number): number {
  if (bc === 'ff') return Math.sin(n * Math.PI * xh);
  if (bc === 'll') return Math.cos(n * Math.PI * xh);
  return Math.sin((2 * n - 1) * (Math.PI / 2) * xh);
}

/** Steigung der Form (d/dx̂) – für den Druck in der Luftsäule (p ∝ −∂s/∂x). */
export function modeSlope(bc: Bc, n: number, xh: number): number {
  if (bc === 'ff') return n * Math.PI * Math.cos(n * Math.PI * xh);
  if (bc === 'll') return -n * Math.PI * Math.sin(n * Math.PI * xh);
  const k = (2 * n - 1) * (Math.PI / 2);
  return k * Math.cos(k * xh);
}

const clean = (xs: number[]) => xs.map((x) => Math.min(1, Math.max(0, Math.round(x * 1e12) / 1e12)));

/** Knoten (Auslenkung bzw. Schnelle) der n-ten Eigenschwingung als x̂ = x/L, aufsteigend. */
export function nodes(bc: Bc, n: number): number[] {
  const out: number[] = [];
  if (bc === 'ff') for (let k = 0; k <= n; k++) out.push(k / n);
  else if (bc === 'll') for (let k = 0; k < n; k++) out.push((k + 0.5) / n);
  else {
    const q = 1 / (2 * n - 1); // λ/4 in Einheiten von L
    for (let k = 0; k < n; k++) out.push(2 * k * q);
  }
  return clean(out);
}

/** Bäuche der n-ten Eigenschwingung als x̂ = x/L, aufsteigend. */
export function antinodes(bc: Bc, n: number): number[] {
  const out: number[] = [];
  if (bc === 'ff') for (let k = 0; k < n; k++) out.push((k + 0.5) / n);
  else if (bc === 'll') for (let k = 0; k <= n; k++) out.push(k / n);
  else {
    const q = 1 / (2 * n - 1);
    for (let k = 0; k < n; k++) out.push((2 * k + 1) * q);
  }
  return clean(out);
}

/* ---------- Reflexion an einem Ende ---------- */

/** Amplitude der stehenden Welle im Abstand d vom Ende, in Einheiten von ŷ (0 … 2). */
export function reflectionAmplitude(end: EndType, d: number, lambda: number): number {
  const kd = (TAU * d) / lambda;
  return 2 * Math.abs(end === 'fix' ? Math.sin(kd) : Math.cos(kd));
}

/** Abstände der Knoten vom Ende bis zur Entfernung dMax (m). */
export function reflectionNodes(end: EndType, lambda: number, dMax: number): number[] {
  const out: number[] = [];
  const start = end === 'fix' ? 0 : lambda / 4;
  for (let d = start; d <= dMax + 1e-9; d += lambda / 2) out.push(d);
  return out;
}

/** Abstände der Bäuche vom Ende bis zur Entfernung dMax (m). */
export function reflectionAntinodes(end: EndType, lambda: number, dMax: number): number[] {
  return reflectionNodes(end === 'fix' ? 'free' : 'fix', lambda, dMax);
}

/** Weicher Anstieg 0 … 1 (smoothstep). */
export function smooth(q: number): number {
  const v = q <= 0 ? 0 : q >= 1 ? 1 : q;
  return v * v * (3 - 2 * v);
}

/** Breite des weichen Anstiegs der Wellenfront (in L): λ/2 = L/ν, höchstens 0,6 · L. */
export function frontRamp(nu: number): number {
  return Math.min(1 / nu, 0.6);
}

/**
 * Hinlaufende und reflektierte Welle (dimensionslos, Ende bei x̂ = 1, Welle tritt
 * zur Zeit τ = 0 bei x̂ = 0 ein, ĉ = 2). θ ist die Phase des Erregers (θ = 2πν·τ,
 * getrennt geführt, damit ν weich verändert werden kann). Die Fronten steigen auf
 * einer halben Wellenlänge weich an. Ergebnis in Einheiten von ŷ.
 */
export function travelling(end: EndType, nu: number, xh: number, tau: number, theta: number): { yh: number; yr: number } {
  const ramp = frontRamp(nu);
  const eh = smooth((2 * tau - xh) / ramp);
  const er = smooth((2 * tau - (2 - xh)) / ramp);
  const eps = end === 'fix' ? -1 : 1;
  const yh = eh * Math.sin(theta - Math.PI * nu * xh);
  const yr = er * eps * Math.sin(theta - Math.PI * nu * (2 - xh));
  return { yh, yr };
}

/* ---------- Erzwungene Schwingung mit Dämpfung (dimensionslos) ---------- */

/** Dämpfung γ̂ (pro T₁): Resonanzüberhöhung ≈ 1/sinh(γ̂/2) ≈ 9. */
export const DAMPING = 0.222;
/** Dimensionslose Ausbreitungsgeschwindigkeit (L pro T₁). */
export const C_HAT = 2;

interface Cx {
  re: number;
  im: number;
}

const cmul = (a: Cx, b: Cx): Cx => ({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
function cdiv(a: Cx, b: Cx): Cx {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
function csqrt(z: Cx): Cx {
  const r = Math.hypot(z.re, z.im);
  const re = Math.sqrt((r + z.re) / 2);
  const im = Math.sign(z.im || 1) * Math.sqrt(Math.max(0, (r - z.re) / 2));
  return { re, im };
}
const csin = (z: Cx): Cx => ({ re: Math.sin(z.re) * Math.cosh(z.im), im: Math.cos(z.re) * Math.sinh(z.im) });

/** Komplexe Wellenzahl k̃ (pro L) für die Frequenz ν und Dämpfung γ̂. */
export function complexWavenumber(nu: number, gamma = DAMPING): Cx {
  const w = TAU * nu;
  return csqrt({ re: (w * w) / (C_HAT * C_HAT), im: (-2 * gamma * w) / (C_HAT * C_HAT) });
}

/**
 * Eingeschwungenes Profil Y(x̂) (komplex) bei Anregung des linken Endes mit
 * Amplitude 1: y(x̂, θ) = Im(Y · e^{iθ}).
 */
export function drivenProfile(nu: number, xh: number, gamma = DAMPING): Cx {
  if (nu < 1e-6) return { re: 1 - xh, im: 0 };
  const k = complexWavenumber(nu, gamma);
  return cdiv(csin(cmul(k, { re: 1 - xh, im: 0 })), csin(k));
}

/** Auslenkung im eingeschwungenen Zustand (Einheiten der Erregeramplitude). */
export function drivenDisplacement(nu: number, xh: number, theta: number, gamma = DAMPING): number {
  const Y = drivenProfile(nu, xh, gamma);
  return Y.re * Math.sin(theta) + Y.im * Math.cos(theta);
}

/** Größte Amplitude längs des Seils (in Einheiten der Erregeramplitude). */
export function resonanceAmplitude(nu: number, gamma = DAMPING, samples = 96): number {
  let best = 0;
  for (let i = 0; i <= samples; i++) {
    const Y = drivenProfile(nu, i / samples, gamma);
    best = Math.max(best, Math.hypot(Y.re, Y.im));
  }
  return best;
}

/** Nächste Eigenfrequenz (Ordnung n ≥ 1) des beidseitig festen Seils zu ν. */
export function nearestOrder(nu: number): number {
  return Math.max(1, Math.round(nu));
}

/**
 * Seil mit angetriebenem linkem Ende und festem rechtem Ende, gerechnet mit
 * finiten Differenzen (Courant-Zahl 1: ohne Dämpfung exakt). Zeigt Einschwingen,
 * Schwebungen und Resonanz so, wie sie wirklich ablaufen.
 */
export class DrivenString {
  readonly n: number;
  readonly dt: number;
  y: Float64Array;
  yOld: Float64Array;
  private tmp: Float64Array;
  /** Phase des Erregers. */
  theta = 0;
  gamma: number;

  constructor(segments = 120, gamma = DAMPING) {
    this.n = segments;
    this.dt = 1 / (segments * C_HAT);
    this.y = new Float64Array(segments + 1);
    this.yOld = new Float64Array(segments + 1);
    this.tmp = new Float64Array(segments + 1);
    this.gamma = gamma;
  }

  /** Setzt den eingeschwungenen Zustand für ν und die aktuelle Phase. */
  setSteady(nu: number): void {
    const w = TAU * nu;
    for (let j = 0; j <= this.n; j++) {
      const Y = drivenProfile(nu, j / this.n, this.gamma);
      this.y[j] = Y.re * Math.sin(this.theta) + Y.im * Math.cos(this.theta);
      const th = this.theta - w * this.dt;
      this.yOld[j] = Y.re * Math.sin(th) + Y.im * Math.cos(th);
    }
    this.y[this.n] = 0;
    this.yOld[this.n] = 0;
  }

  /** Ruhe. */
  rest(): void {
    this.y.fill(0);
    this.yOld.fill(0);
  }

  /** Ein Zeitschritt dt bei der Erregerfrequenz ν. */
  step(nu: number): void {
    const n = this.n;
    const gd = this.gamma * this.dt;
    const a = 1 / (1 + gd);
    const b = 1 - gd;
    const y = this.y;
    const yo = this.yOld;
    const t = this.tmp;
    this.theta += TAU * nu * this.dt;
    t[0] = Math.sin(this.theta);
    for (let j = 1; j < n; j++) t[j] = (y[j + 1]! + y[j - 1]! - b * yo[j]!) * a;
    t[n] = 0;
    this.yOld = y;
    this.y = t;
    this.tmp = yo;
  }

  /** Größte momentane Auslenkung |y| längs des Seils. */
  maxAbs(): number {
    let m = 0;
    for (let j = 0; j <= this.n; j++) m = Math.max(m, Math.abs(this.y[j]!));
    return m;
  }

  /** Auslenkung an der Stelle x̂ (linear interpoliert). */
  at(xh: number): number {
    const s = Math.min(this.n, Math.max(0, xh * this.n));
    const j = Math.min(this.n - 1, Math.floor(s));
    const q = s - j;
    return this.y[j]! * (1 - q) + this.y[j + 1]! * q;
  }
}
