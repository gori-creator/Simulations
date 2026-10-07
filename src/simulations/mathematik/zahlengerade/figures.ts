/**
 * Gezeichnete Figuren für die Zahlengerade: Frosch (Laufmodell), Sparschwein
 * (Kontostand) und Pinguin (Höhe über/unter dem Meeresspiegel) sowie kleine
 * Symbole. Alle Figuren werden in Einheiten ihrer Höhe gezeichnet; der
 * Ursprung liegt zwischen den Füßen. `facing` spiegelt waagerecht (1 = Blick
 * nach rechts, −1 = nach links, Zwischenwerte beim Umdrehen).
 */

import { roundRect } from '../../../sim-core';

type G = CanvasRenderingContext2D;

function ellipse(g: G, x: number, y: number, rx: number, ry: number, rot = 0): void {
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}

/** Bodenschatten (nicht gespiegelt, wird beim Hüpfen kleiner). */
export function groundShadow(g: G, x: number, y: number, w: number, lift: number, dark: boolean): void {
  const k = Math.max(0.35, 1 - lift * 0.8);
  g.fillStyle = dark ? `rgba(0,0,0,${0.45 * k})` : `rgba(16,24,40,${0.16 * k})`;
  ellipse(g, x, y, w * k, w * 0.16 * k);
  g.fill();
}

/**
 * Frosch in Seitenansicht. `leap` (0…1) streckt die Hinterbeine beim Sprung.
 */
export function drawFrog(g: G, x: number, y: number, s: number, facing: number, leap: number): void {
  g.save();
  g.translate(x, y);
  g.scale(Math.max(0.04, Math.abs(facing)) * Math.sign(facing || 1) * s, s);
  const dark = '#2f7a2a';
  const mid = '#4caf3f';
  const light = '#8fd46a';
  g.lineCap = 'round';
  g.lineJoin = 'round';

  // Hinterbein: angewinkelt oder beim Sprung gestreckt
  const e = Math.max(0, Math.min(1, leap));
  const knee: [number, number] = [-0.32 - 0.12 * e, -0.16 + 0.04 * e];
  const foot: [number, number] = [-0.12 - 0.5 * e, -0.02 + 0.06 * e];
  g.strokeStyle = dark;
  g.lineWidth = 0.13;
  g.beginPath();
  g.moveTo(-0.14, -0.3);
  g.lineTo(knee[0], knee[1]);
  g.lineTo(foot[0], foot[1]);
  g.stroke();
  g.fillStyle = dark;
  ellipse(g, foot[0] + 0.07, foot[1] + 0.005, 0.11, 0.035, 0);
  g.fill();
  // Oberschenkel
  g.fillStyle = mid;
  ellipse(g, -0.2 - 0.06 * e, -0.24, 0.19, 0.13, -0.5 + 0.5 * e);
  g.fill();

  // Körper
  const body = g.createLinearGradient(0, -0.7, 0, -0.1);
  body.addColorStop(0, light);
  body.addColorStop(0.55, mid);
  body.addColorStop(1, dark);
  g.fillStyle = body;
  ellipse(g, 0.02, -0.4, 0.37, 0.25, -0.38);
  g.fill();
  // Kopf
  ellipse(g, 0.22, -0.55, 0.2, 0.15, -0.2);
  g.fill();
  // Bauch
  g.fillStyle = '#d8f0a8';
  ellipse(g, 0.13, -0.3, 0.2, 0.1, -0.4);
  g.fill();
  // Punkte auf dem Rücken
  g.fillStyle = 'rgba(30,90,30,0.45)';
  for (const [px, py, r] of [
    [-0.14, -0.46, 0.04],
    [-0.02, -0.55, 0.03],
    [-0.22, -0.34, 0.03],
  ] as const) {
    ellipse(g, px, py, r, r * 0.8);
    g.fill();
  }

  // Vorderbein
  g.strokeStyle = mid;
  g.lineWidth = 0.075;
  g.beginPath();
  g.moveTo(0.2, -0.3);
  g.lineTo(0.26 + 0.05 * e, -0.03 - 0.04 * e);
  g.stroke();
  g.fillStyle = dark;
  ellipse(g, 0.3 + 0.05 * e, -0.02 - 0.04 * e, 0.07, 0.028);
  g.fill();

  // Augen
  const eye = (ex: number, ey: number, r: number, shade: string) => {
    g.fillStyle = shade;
    ellipse(g, ex, ey, r, r);
    g.fill();
    g.fillStyle = '#ffffff';
    ellipse(g, ex + 0.01, ey - 0.005, r * 0.72, r * 0.72);
    g.fill();
    g.fillStyle = '#1b1f24';
    ellipse(g, ex + r * 0.3, ey, r * 0.38, r * 0.42);
    g.fill();
    g.fillStyle = '#ffffff';
    ellipse(g, ex + r * 0.38, ey - r * 0.18, r * 0.12, r * 0.12);
    g.fill();
  };
  eye(0.12, -0.7, 0.1, mid);
  eye(0.3, -0.69, 0.115, light);

  // Mund und Wange
  g.strokeStyle = '#1f5a1c';
  g.lineWidth = 0.022;
  g.beginPath();
  g.moveTo(0.27, -0.49);
  g.quadraticCurveTo(0.35, -0.44, 0.41, -0.52);
  g.stroke();
  g.fillStyle = 'rgba(255,120,140,0.55)';
  ellipse(g, 0.31, -0.55, 0.045, 0.028);
  g.fill();
  g.restore();
}

/**
 * Sparschwein in Seitenansicht; `walk` ist die Phase der Beinbewegung.
 */
export function drawPiggy(g: G, x: number, y: number, s: number, facing: number, walk: number): void {
  g.save();
  g.translate(x, y);
  g.scale(Math.max(0.04, Math.abs(facing)) * Math.sign(facing || 1) * s, s);
  const pink = '#f4a3b8';
  const deep = '#d9748f';
  const light = '#ffd3df';
  g.lineCap = 'round';
  g.lineJoin = 'round';

  // Beine (hinten dunkler)
  const legs: [number, number][] = [
    [-0.28, 0],
    [0.2, Math.PI],
    [-0.16, Math.PI],
    [0.32, 0],
  ];
  legs.forEach(([lx, ph], i) => {
    const lift = Math.max(0, Math.sin(walk + ph)) * 0.05;
    g.fillStyle = i < 2 ? deep : pink;
    roundRect(g, lx - 0.05, -0.24, 0.1, 0.24 - lift, 0.04);
    g.fill();
    g.fillStyle = '#b5566f';
    roundRect(g, lx - 0.05, -0.05 - lift, 0.1, 0.05, 0.02);
    g.fill();
  });

  // Ringelschwanz
  g.strokeStyle = deep;
  g.lineWidth = 0.035;
  g.beginPath();
  g.moveTo(-0.47, -0.45);
  g.bezierCurveTo(-0.62, -0.5, -0.6, -0.64, -0.53, -0.62);
  g.bezierCurveTo(-0.46, -0.6, -0.5, -0.5, -0.6, -0.52);
  g.stroke();

  // Körper
  const body = g.createRadialGradient(-0.05, -0.6, 0.05, 0, -0.42, 0.55);
  body.addColorStop(0, light);
  body.addColorStop(0.6, pink);
  body.addColorStop(1, deep);
  g.fillStyle = body;
  ellipse(g, 0, -0.43, 0.5, 0.31);
  g.fill();

  // Münzschlitz mit Münze
  g.fillStyle = '#f2c94c';
  ellipse(g, -0.02, -0.76, 0.09, 0.05);
  g.fill();
  g.strokeStyle = '#b8901f';
  g.lineWidth = 0.015;
  g.stroke();
  g.fillStyle = '#7d3346';
  roundRect(g, -0.12, -0.745, 0.2, 0.035, 0.015);
  g.fill();

  // Ohr
  g.fillStyle = deep;
  g.beginPath();
  g.moveTo(0.18, -0.68);
  g.lineTo(0.28, -0.86);
  g.lineTo(0.36, -0.66);
  g.closePath();
  g.fill();

  // Rüssel
  g.fillStyle = deep;
  ellipse(g, 0.5, -0.45, 0.075, 0.105);
  g.fill();
  g.fillStyle = '#7d3346';
  ellipse(g, 0.515, -0.48, 0.016, 0.026);
  g.fill();
  ellipse(g, 0.515, -0.42, 0.016, 0.026);
  g.fill();

  // Auge und Wange
  g.fillStyle = '#2b1f24';
  ellipse(g, 0.31, -0.55, 0.035, 0.04);
  g.fill();
  g.fillStyle = '#ffffff';
  ellipse(g, 0.322, -0.562, 0.011, 0.011);
  g.fill();
  g.fillStyle = 'rgba(230,80,110,0.35)';
  ellipse(g, 0.34, -0.43, 0.06, 0.035);
  g.fill();
  g.restore();
}

/**
 * Pinguin. `angle` dreht die Figur um ihre Mitte (0 = aufrecht,
 * ±π/2 = schwimmend), `flap` bewegt die Flügel.
 */
export function drawPenguin(g: G, x: number, y: number, s: number, facing: number, angle: number, flap: number): void {
  g.save();
  g.translate(x, y - 0.48 * s);
  g.rotate(angle);
  g.scale(Math.max(0.04, Math.abs(facing)) * Math.sign(facing || 1) * s, s);
  g.translate(0, 0.48);
  g.lineJoin = 'round';

  // Füße
  g.fillStyle = '#f29d38';
  ellipse(g, 0.02, -0.02, 0.11, 0.035);
  g.fill();
  ellipse(g, 0.12, -0.015, 0.1, 0.03);
  g.fill();
  // Körper
  const body = g.createLinearGradient(-0.25, 0, 0.25, 0);
  body.addColorStop(0, '#0f1620');
  body.addColorStop(1, '#2c3a4d');
  g.fillStyle = body;
  ellipse(g, 0, -0.47, 0.25, 0.46);
  g.fill();
  // Bauch
  const belly = g.createLinearGradient(0, -0.85, 0, -0.05);
  belly.addColorStop(0, '#ffffff');
  belly.addColorStop(1, '#e3ebf2');
  g.fillStyle = belly;
  ellipse(g, 0.07, -0.42, 0.16, 0.36);
  g.fill();
  // gelber Halsfleck
  g.fillStyle = 'rgba(255,196,64,0.85)';
  ellipse(g, 0.12, -0.7, 0.07, 0.05, 0.4);
  g.fill();
  // Flügel
  g.fillStyle = '#1a2533';
  ellipse(g, -0.12, -0.48, 0.07, 0.24, 0.25 + flap);
  g.fill();
  // Auge
  g.fillStyle = '#ffffff';
  ellipse(g, 0.1, -0.8, 0.045, 0.045);
  g.fill();
  g.fillStyle = '#10161f';
  ellipse(g, 0.115, -0.8, 0.024, 0.026);
  g.fill();
  // Schnabel
  g.fillStyle = '#f29d38';
  g.beginPath();
  g.moveTo(0.19, -0.79);
  g.quadraticCurveTo(0.33, -0.76, 0.36, -0.73);
  g.quadraticCurveTo(0.28, -0.7, 0.19, -0.72);
  g.closePath();
  g.fill();
  g.restore();
}

/** Sonne (warm). */
export function drawSun(g: G, x: number, y: number, r: number, color: string): void {
  g.save();
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = Math.max(1.5, r * 0.16);
  g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3);
    g.lineTo(x + Math.cos(a) * r * 1.75, y + Math.sin(a) * r * 1.75);
    g.stroke();
  }
  ellipse(g, x, y, r, r);
  g.fill();
  g.restore();
}

/** Schneeflocke (kalt). */
export function drawSnowflake(g: G, x: number, y: number, r: number, color: string): void {
  g.save();
  g.strokeStyle = color;
  g.lineWidth = Math.max(1.5, r * 0.14);
  g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const cx = Math.cos(a);
    const sy = Math.sin(a);
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + cx * r, y + sy * r);
    // Seitenäste
    const bx = x + cx * r * 0.6;
    const by = y + sy * r * 0.6;
    for (const side of [-1, 1]) {
      const b = a + side * 0.7;
      g.moveTo(bx, by);
      g.lineTo(bx + Math.cos(b) * r * 0.32, by + Math.sin(b) * r * 0.32);
    }
    g.stroke();
  }
  g.restore();
}
