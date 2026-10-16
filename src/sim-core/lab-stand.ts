/**
 * Laborstativ aus dem Foto `stativ.webp` (Fadenpendel, Federpendel,
 * Hookesches Gesetz verwenden dieselbe Datei).
 *
 * Das Foto (183 × 520 px) zeigt Fuß, senkrechte Stange und oben einen kurzen
 * Ausleger nach rechts. Damit es zu jeder Szene passt, wird es in Stücke
 * geteilt: Stange und Ausleger sind gleichförmige Metallstäbe und dürfen in
 * ihrer Längsrichtung gestreckt werden, Fuß und Klemme bleiben unverzerrt.
 * Das fertige Stativ (mit weichem Schatten) wird vorab gerendert und nur bei
 * Größenänderungen neu erzeugt.
 */
import { offscreenCanvas } from './sprites';

type Source = CanvasImageSource & { width: number; height: number };

/** Lage der Teile im Foto (Bildpixel). */
const IMG = {
  w: 183,
  h: 520,
  /** Mitte der Stange */
  rodX: 89.5,
  rodL: 82,
  rodR: 97,
  /** Mitte des Auslegers, Beginn des gleichförmigen Stücks, Beginn der Endkappe */
  armY: 60.5,
  armTop: 48,
  armBot: 76,
  armFrom: 112,
  capFrom: 170,
  /** Ende des Kopfteils (Klemme), Beginn des Fußes */
  headEnd: 76,
  baseTop: 428,
};

export interface LabStandOptions {
  /** x der Stange (CSS-Pixel). */
  rodX: number;
  /** Mitte des Auslegers (y). */
  armY: number;
  /** Ende des Auslegers (x); links der Stange wird das Stativ gespiegelt. */
  armTo: number;
  /** Tischoberfläche (y), auf der der Fuß steht. */
  floorY: number;
  /** Maßstab: CSS-Pixel je Bildpixel (z. B. 0,6 → Stange ≈ 8 px dick). */
  scale: number;
  dpr: number;
  dark: boolean;
}

const cache = new WeakMap<object, Map<string, { canvas: HTMLCanvasElement; ox: number; oy: number; w: number; h: number }>>();

/** Stativ zeichnen; gibt `false` zurück, wenn die Maße nicht passen (dann Ersatzgrafik zeichnen). */
export function drawLabStand(g: CanvasRenderingContext2D, img: Source, o: LabStandOptions): boolean {
  const s = o.scale;
  const flip = o.armTo < o.rodX;
  const arm = Math.abs(o.armTo - o.rodX);
  const height = o.floorY - o.armY;
  if (s <= 0 || height < (IMG.h - IMG.armY) * s * 0.35) return false;
  const key = `${Math.round(s * 100)}|${Math.round(arm)}|${Math.round(height)}|${o.dpr}|${flip ? 1 : 0}|${o.dark ? 1 : 0}`;
  let map = cache.get(img);
  if (!map) {
    map = new Map();
    cache.set(img, map);
  }
  let hit = map.get(key);
  if (!hit) {
    if (map.size > 8) map.clear();
    hit = render(img, s, arm, height, o.dpr, o.dark);
    map.set(key, hit);
  }
  g.save();
  g.translate(o.rodX, o.armY);
  if (flip) g.scale(-1, 1);
  g.drawImage(hit.canvas, hit.ox, hit.oy, hit.w, hit.h);
  g.restore();
  return true;
}

function render(img: Source, s: number, arm: number, height: number, dpr: number, dark: boolean) {
  const pad = 14;
  const left = IMG.rodX * s + pad;
  const right = Math.max(arm + 2, (IMG.w - IMG.rodX) * s) + pad;
  const top = (IMG.armY - 2) * s + pad;
  const bottom = height + pad;
  const w = left + right;
  const h = top + bottom;
  // Erst das Stativ ohne Schatten zusammensetzen …
  const part = offscreenCanvas(w, h, dpr);
  const p = part.g;
  p.translate(left, top);
  const X = (ix: number) => (ix - IMG.rodX) * s;
  const Y = (iy: number) => (iy - IMG.armY) * s;
  const baseH = (IMG.h - IMG.baseTop) * s;
  // Stange (senkrecht gestreckt)
  const rodTop = Y(IMG.headEnd);
  const rodBot = height - baseH + 6 * s;
  if (rodBot > rodTop) p.drawImage(img, IMG.rodL, IMG.headEnd, IMG.rodR - IMG.rodL, IMG.baseTop - IMG.headEnd, X(IMG.rodL), rodTop, (IMG.rodR - IMG.rodL) * s, rodBot - rodTop);
  // Fuß
  p.drawImage(img, 0, IMG.baseTop, IMG.w, IMG.h - IMG.baseTop, X(0), height - baseH, IMG.w * s, baseH);
  // Kopf mit Klemme
  p.drawImage(img, 0, 0, IMG.armFrom, IMG.headEnd, X(0), Y(0), IMG.armFrom * s, IMG.headEnd * s);
  // Ausleger (waagerecht gestreckt) und Endkappe
  const capW = (IMG.w - IMG.capFrom) * s;
  const armStart = X(IMG.armFrom);
  const armEnd = Math.max(armStart, arm - capW + 1 * s);
  const ah = IMG.armBot - IMG.armTop;
  if (armEnd > armStart) p.drawImage(img, IMG.armFrom, IMG.armTop, IMG.capFrom - IMG.armFrom, ah, armStart, Y(IMG.armTop), armEnd - armStart + 0.5, ah * s);
  p.drawImage(img, IMG.capFrom, IMG.armTop, IMG.w - IMG.capFrom, ah, armEnd, Y(IMG.armTop), capW, ah * s);

  if (dark) {
    // Im Dunkelmodus Fuß und Stange leicht aufhellen, damit sie sich vom dunklen Hintergrund abheben
    p.save();
    p.setTransform(1, 0, 0, 1, 0, 0);
    p.globalCompositeOperation = 'source-atop';
    p.fillStyle = 'rgba(190,205,225,0.2)';
    p.fillRect(0, 0, part.canvas.width, part.canvas.height);
    p.restore();
  }

  // … dann mit weichem Schlagschatten und Kontaktschatten auf die endgültige Fläche
  const out = offscreenCanvas(w, h, dpr);
  const q = out.g;
  q.save();
  q.translate(left, top);
  q.fillStyle = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,28,40,0.32)';
  q.filter = `blur(${Math.max(2, 4 * s)}px)`;
  q.beginPath();
  q.ellipse(X(IMG.w / 2) + 2 * s, height - 1, IMG.w * 0.5 * s, 5 * s + 2, 0, 0, Math.PI * 2);
  q.fill();
  q.filter = 'none';
  q.restore();
  q.save();
  q.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,28,40,0.28)';
  q.shadowBlur = 7;
  q.shadowOffsetX = 2;
  q.shadowOffsetY = 3;
  q.setTransform(1, 0, 0, 1, 0, 0);
  q.drawImage(part.canvas, 0, 0);
  q.restore();
  return { canvas: out.canvas, ox: -left, oy: -top, w, h };
}
