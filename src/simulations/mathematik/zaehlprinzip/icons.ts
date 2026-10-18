import { roundRect, shade } from '../../../sim-core';

/**
 * Gezeichnete Symbole für die Sachsituationen (Kleidung, Eiskugeln, Tasten,
 * Gerichte, Läufer). Jedes Symbol füllt ein Quadrat der Kantenlänge `s` um
 * den Mittelpunkt (x | y). Farben kommen vom Aufrufer (Theme oder
 * Naturfarbe des Gegenstands).
 */
export type IconKind =
  | 'pants'
  | 'shirt'
  | 'hat'
  | 'scoop'
  | 'key'
  | 'soup'
  | 'salad'
  | 'caprese'
  | 'pizza'
  | 'pasta'
  | 'fish'
  | 'burger'
  | 'icecup'
  | 'cake'
  | 'fruit'
  | 'runner';

export interface IconStyle {
  dark: boolean;
  font: string;
  /** Textfarbe (für Ziffern auf Tasten). */
  ink: string;
  /** Hintergrund (für Teller, Tasten). */
  paper: string;
  /** Beschriftung (Ziffer, Anfangsbuchstabe). */
  label?: string;
}

const TAU = Math.PI * 2;

function vGrad(g: CanvasRenderingContext2D, y0: number, y1: number, color: string, light = 0.22, dark = -0.12): CanvasGradient {
  const grad = g.createLinearGradient(0, y0, 0, y1);
  grad.addColorStop(0, shade(color, light));
  grad.addColorStop(1, shade(color, dark));
  return grad;
}

function outline(g: CanvasRenderingContext2D, color: string, s: number, st: IconStyle): void {
  g.strokeStyle = shade(color, st.dark ? 0.35 : -0.35, st.dark ? 0.8 : 0.7);
  g.lineWidth = Math.max(0.8, s * 0.035);
  g.lineJoin = 'round';
  g.stroke();
}

function plate(g: CanvasRenderingContext2D, x: number, y: number, s: number, st: IconStyle): void {
  const r = s * 0.47;
  g.beginPath();
  g.ellipse(x, y + s * 0.04, r, r * 0.92, 0, 0, TAU);
  const grad = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.1, x, y, r);
  grad.addColorStop(0, st.dark ? '#e9edf2' : '#ffffff');
  grad.addColorStop(1, st.dark ? '#b9c0ca' : '#dfe3e8');
  g.fillStyle = grad;
  g.fill();
  g.strokeStyle = st.dark ? 'rgba(255,255,255,0.35)' : 'rgba(30,40,60,0.18)';
  g.lineWidth = Math.max(0.8, s * 0.03);
  g.stroke();
  g.beginPath();
  g.ellipse(x, y + s * 0.04, r * 0.7, r * 0.64, 0, 0, TAU);
  g.strokeStyle = 'rgba(30,40,60,0.10)';
  g.stroke();
}

function bowl(g: CanvasRenderingContext2D, x: number, y: number, s: number, color: string, st: IconStyle): void {
  const w = s * 0.86;
  const top = y - s * 0.02;
  g.beginPath();
  g.moveTo(x - w / 2, top);
  g.quadraticCurveTo(x - w * 0.46, y + s * 0.4, x, y + s * 0.4);
  g.quadraticCurveTo(x + w * 0.46, y + s * 0.4, x + w / 2, top);
  g.closePath();
  g.fillStyle = vGrad(g, top, y + s * 0.4, st.dark ? '#d8dde4' : '#f3f5f8', 0.1, -0.12);
  g.fill();
  outline(g, '#9aa3ad', s, st);
  // Inhalt (Oberfläche)
  g.beginPath();
  g.ellipse(x, top, w / 2 - s * 0.03, s * 0.11, 0, 0, TAU);
  g.fillStyle = vGrad(g, top - s * 0.1, top + s * 0.1, color, 0.18, -0.08);
  g.fill();
}

/** Symbol zeichnen. */
export function drawIcon(g: CanvasRenderingContext2D, kind: IconKind, color: string, x: number, y: number, s: number, st: IconStyle): void {
  g.save();
  switch (kind) {
    case 'pants': {
      const w = s * 0.6;
      const y0 = y - s * 0.44;
      const h = s * 0.88;
      g.beginPath();
      g.moveTo(x - w / 2, y0);
      g.lineTo(x + w / 2, y0);
      g.lineTo(x + w / 2 + s * 0.05, y0 + h);
      g.lineTo(x + s * 0.045, y0 + h);
      g.lineTo(x, y0 + h * 0.34);
      g.lineTo(x - s * 0.045, y0 + h);
      g.lineTo(x - w / 2 - s * 0.05, y0 + h);
      g.closePath();
      g.fillStyle = vGrad(g, y0, y0 + h, color);
      g.fill();
      outline(g, color, s, st);
      g.fillStyle = shade(color, -0.25);
      g.fillRect(x - w / 2, y0, w, h * 0.11);
      if (s >= 14) {
        g.strokeStyle = shade(color, 0.35, 0.55);
        g.lineWidth = Math.max(0.7, s * 0.022);
        g.beginPath();
        g.moveTo(x - w * 0.26, y0 + h * 0.2);
        g.lineTo(x - w * 0.3, y0 + h * 0.95);
        g.moveTo(x + w * 0.26, y0 + h * 0.2);
        g.lineTo(x + w * 0.3, y0 + h * 0.95);
        g.stroke();
      }
      break;
    }
    case 'shirt': {
      const y0 = y - s * 0.36;
      const y1 = y + s * 0.42;
      const bw = s * 0.27;
      g.beginPath();
      g.moveTo(x - s * 0.13, y0);
      g.quadraticCurveTo(x, y0 + s * 0.12, x + s * 0.13, y0);
      g.lineTo(x + s * 0.3, y0 + s * 0.04);
      g.lineTo(x + s * 0.48, y0 + s * 0.24);
      g.lineTo(x + s * 0.36, y0 + s * 0.38);
      g.lineTo(x + bw, y0 + s * 0.3);
      g.lineTo(x + bw, y1);
      g.lineTo(x - bw, y1);
      g.lineTo(x - bw, y0 + s * 0.3);
      g.lineTo(x - s * 0.36, y0 + s * 0.38);
      g.lineTo(x - s * 0.48, y0 + s * 0.24);
      g.lineTo(x - s * 0.3, y0 + s * 0.04);
      g.closePath();
      g.fillStyle = vGrad(g, y0, y1, color);
      g.fill();
      outline(g, color, s, st);
      // Kragen
      g.beginPath();
      g.moveTo(x - s * 0.13, y0);
      g.quadraticCurveTo(x, y0 + s * 0.12, x + s * 0.13, y0);
      g.strokeStyle = shade(color, -0.3);
      g.lineWidth = Math.max(0.8, s * 0.045);
      g.stroke();
      break;
    }
    case 'hat': {
      const by = y + s * 0.22;
      const w = s * 0.78;
      g.beginPath();
      g.moveTo(x - w / 2, by);
      g.bezierCurveTo(x - w / 2, y - s * 0.36, x + w / 2, y - s * 0.36, x + w / 2, by);
      g.closePath();
      g.fillStyle = vGrad(g, y - s * 0.3, by, color);
      g.fill();
      outline(g, color, s, st);
      if (s >= 14) {
        g.strokeStyle = shade(color, -0.18, 0.6);
        g.lineWidth = Math.max(0.7, s * 0.025);
        for (const f of [-0.2, 0, 0.2]) {
          g.beginPath();
          g.moveTo(x + w * f, by);
          g.quadraticCurveTo(x + w * f * 0.8, y - s * 0.05, x + w * f * 0.4, y - s * 0.14);
          g.stroke();
        }
      }
      // Umschlag
      roundRect(g, x - w / 2 - s * 0.04, by - s * 0.04, w + s * 0.08, s * 0.2, s * 0.06);
      g.fillStyle = vGrad(g, by - s * 0.04, by + s * 0.16, shade(color, -0.12));
      g.fill();
      outline(g, color, s, st);
      // Bommel
      g.beginPath();
      g.arc(x, y - s * 0.3, s * 0.11, 0, TAU);
      g.fillStyle = shade(color, 0.45);
      g.fill();
      outline(g, color, s, st);
      break;
    }
    case 'scoop': {
      const r = s * 0.4;
      const cy = y - s * 0.02;
      g.beginPath();
      g.arc(x, cy, r, Math.PI * 0.98, Math.PI * 0.02);
      // tropfender Rand
      const n = 5;
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        const px = x + r - 2 * r * t;
        const py = cy + r * 0.32 + (i % 2 ? s * 0.07 : 0);
        g.lineTo(px, py);
      }
      g.closePath();
      const grad = g.createRadialGradient(x - r * 0.35, cy - r * 0.45, r * 0.1, x, cy, r * 1.1);
      grad.addColorStop(0, shade(color, 0.35));
      grad.addColorStop(1, shade(color, -0.1));
      g.fillStyle = grad;
      g.fill();
      outline(g, color, s, st);
      break;
    }
    case 'key': {
      const w = s * 0.84;
      roundRect(g, x - w / 2, y - w / 2, w, w, s * 0.18);
      const grad = g.createLinearGradient(0, y - w / 2, 0, y + w / 2);
      grad.addColorStop(0, st.dark ? '#4a5260' : '#ffffff');
      grad.addColorStop(1, st.dark ? '#2f3540' : '#e3e7ed');
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = st.dark ? 'rgba(255,255,255,0.22)' : 'rgba(30,40,60,0.22)';
      g.lineWidth = Math.max(0.8, s * 0.035);
      g.stroke();
      if (st.label && s >= 9) {
        g.font = `800 ${Math.round(s * 0.56)}px ${st.font}`;
        g.fillStyle = color;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(st.label, x, y + s * 0.03);
      }
      break;
    }
    case 'runner': {
      const r = s * 0.44;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      grad.addColorStop(0, shade(color, 0.3));
      grad.addColorStop(1, shade(color, -0.15));
      g.fillStyle = grad;
      g.fill();
      outline(g, color, s, st);
      if (st.label && s >= 9) {
        g.font = `800 ${Math.round(s * 0.5)}px ${st.font}`;
        g.fillStyle = '#ffffff';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(st.label, x, y + s * 0.03);
      }
      break;
    }
    case 'soup': {
      bowl(g, x, y + s * 0.04, s, color, st);
      if (s >= 14) {
        g.strokeStyle = st.dark ? 'rgba(255,255,255,0.45)' : 'rgba(90,100,120,0.45)';
        g.lineWidth = Math.max(0.8, s * 0.035);
        g.lineCap = 'round';
        for (const dx of [-0.14, 0.04, 0.2]) {
          g.beginPath();
          g.moveTo(x + s * dx, y - s * 0.12);
          g.bezierCurveTo(x + s * (dx - 0.06), y - s * 0.22, x + s * (dx + 0.06), y - s * 0.3, x + s * dx, y - s * 0.42);
          g.stroke();
        }
      }
      break;
    }
    case 'salad': {
      bowl(g, x, y + s * 0.06, s, '#7fb35a', st);
      const leaves: [number, number, string][] = [
        [-0.2, -0.04, '#5f9b3c'],
        [0.02, -0.12, '#8cc265'],
        [0.2, -0.03, '#4f8a33'],
        [-0.06, 0.0, '#d9473a'],
      ];
      for (const [dx, dy, c] of leaves) {
        g.beginPath();
        g.ellipse(x + s * dx, y + s * dy, s * 0.13, s * 0.09, dx * 2, 0, TAU);
        g.fillStyle = c;
        g.fill();
      }
      break;
    }
    case 'caprese': {
      plate(g, x, y, s, st);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI * 0.9 + (i * Math.PI * 1.8) / 4;
        const px = x + Math.cos(a) * s * 0.2;
        const py = y + s * 0.04 + Math.sin(a) * s * 0.16;
        g.beginPath();
        g.arc(px, py, s * 0.12, 0, TAU);
        g.fillStyle = i % 2 ? '#f7f3e8' : '#d8402f';
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.12)';
        g.lineWidth = 0.8;
        g.stroke();
      }
      g.beginPath();
      g.ellipse(x + s * 0.02, y + s * 0.02, s * 0.07, s * 0.04, 0.6, 0, TAU);
      g.fillStyle = '#3f8a3a';
      g.fill();
      break;
    }
    case 'pizza': {
      const r = s * 0.44;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fillStyle = '#d99a4a';
      g.fill();
      g.beginPath();
      g.arc(x, y, r * 0.84, 0, TAU);
      g.fillStyle = vGrad(g, y - r, y + r, '#f0c050', 0.1, -0.05);
      g.fill();
      g.beginPath();
      g.arc(x, y, r * 0.84, 0, TAU);
      g.fillStyle = 'rgba(214,74,47,0.35)';
      g.fill();
      for (const [dx, dy] of [
        [-0.18, -0.14],
        [0.16, -0.18],
        [0.04, 0.06],
        [-0.16, 0.18],
        [0.2, 0.16],
      ]) {
        g.beginPath();
        g.arc(x + s * dx!, y + s * dy!, s * 0.07, 0, TAU);
        g.fillStyle = '#b8352a';
        g.fill();
      }
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      outline(g, '#d99a4a', s, st);
      break;
    }
    case 'pasta': {
      plate(g, x, y, s, st);
      g.strokeStyle = '#e9c45a';
      g.lineWidth = Math.max(1, s * 0.05);
      g.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        const yy = y - s * 0.1 + i * s * 0.07;
        g.moveTo(x - s * 0.22, yy);
        g.bezierCurveTo(x - s * 0.08, yy - s * 0.1, x + s * 0.06, yy + s * 0.1, x + s * 0.22, yy);
        g.stroke();
      }
      g.beginPath();
      g.arc(x + s * 0.02, y - s * 0.02, s * 0.1, 0, TAU);
      g.fillStyle = '#c8402f';
      g.fill();
      break;
    }
    case 'fish': {
      plate(g, x, y, s, st);
      const cy = y + s * 0.03;
      g.beginPath();
      g.ellipse(x - s * 0.04, cy, s * 0.24, s * 0.12, 0, 0, TAU);
      g.moveTo(x + s * 0.16, cy);
      g.lineTo(x + s * 0.32, cy - s * 0.12);
      g.lineTo(x + s * 0.32, cy + s * 0.12);
      g.closePath();
      g.fillStyle = vGrad(g, cy - s * 0.12, cy + s * 0.12, color, 0.25, -0.1);
      g.fill();
      g.beginPath();
      g.arc(x - s * 0.18, cy - s * 0.02, s * 0.025, 0, TAU);
      g.fillStyle = '#1d2530';
      g.fill();
      g.beginPath();
      g.ellipse(x + s * 0.02, y + s * 0.24, s * 0.08, s * 0.035, 0, 0, TAU);
      g.fillStyle = '#f2dd5a';
      g.fill();
      break;
    }
    case 'burger': {
      const w = s * 0.76;
      // Brötchen oben
      g.beginPath();
      g.moveTo(x - w / 2, y - s * 0.02);
      g.bezierCurveTo(x - w / 2, y - s * 0.42, x + w / 2, y - s * 0.42, x + w / 2, y - s * 0.02);
      g.closePath();
      g.fillStyle = vGrad(g, y - s * 0.34, y, '#d58c3f', 0.2, -0.05);
      g.fill();
      outline(g, '#d58c3f', s, st);
      // Salat, Fleisch, Brötchen unten
      roundRect(g, x - w / 2 - s * 0.03, y - s * 0.01, w + s * 0.06, s * 0.08, s * 0.04);
      g.fillStyle = '#6fae47';
      g.fill();
      roundRect(g, x - w / 2, y + s * 0.06, w, s * 0.13, s * 0.06);
      g.fillStyle = '#6d3d22';
      g.fill();
      roundRect(g, x - w / 2, y + s * 0.2, w, s * 0.14, s * 0.06);
      g.fillStyle = vGrad(g, y + s * 0.2, y + s * 0.34, '#d58c3f', 0.1, -0.1);
      g.fill();
      if (s >= 16) {
        g.fillStyle = '#f7ead0';
        for (const [dx, dy] of [
          [-0.15, -0.2],
          [0.02, -0.26],
          [0.17, -0.18],
        ]) {
          g.beginPath();
          g.ellipse(x + s * dx!, y + s * dy!, s * 0.03, s * 0.015, 0.4, 0, TAU);
          g.fill();
        }
      }
      break;
    }
    case 'icecup': {
      const top = y - s * 0.02;
      g.beginPath();
      g.moveTo(x - s * 0.34, top);
      g.lineTo(x + s * 0.34, top);
      g.lineTo(x + s * 0.2, y + s * 0.4);
      g.lineTo(x - s * 0.2, y + s * 0.4);
      g.closePath();
      g.fillStyle = vGrad(g, top, y + s * 0.4, st.dark ? '#c9d3de' : '#e9eef5', 0.1, -0.15);
      g.fill();
      outline(g, '#9aa3ad', s, st);
      for (const [dx, dy, c] of [
        [-0.14, -0.1, '#f2b6c8'],
        [0.14, -0.1, '#f1e0a8'],
        [0, -0.26, '#8a5534'],
      ] as const) {
        g.beginPath();
        g.arc(x + s * dx, y + s * dy, s * 0.17, 0, TAU);
        const grad = g.createRadialGradient(x + s * (dx - 0.05), y + s * (dy - 0.06), 1, x + s * dx, y + s * dy, s * 0.17);
        grad.addColorStop(0, shade(c, 0.3));
        grad.addColorStop(1, c);
        g.fillStyle = grad;
        g.fill();
      }
      break;
    }
    case 'cake': {
      const y0 = y - s * 0.2;
      g.beginPath();
      g.moveTo(x - s * 0.38, y + s * 0.3);
      g.lineTo(x + s * 0.38, y + s * 0.3);
      g.lineTo(x + s * 0.38, y0 + s * 0.06);
      g.lineTo(x - s * 0.38, y0 - s * 0.12);
      g.closePath();
      g.fillStyle = vGrad(g, y0, y + s * 0.3, '#e9c08a', 0.15, -0.1);
      g.fill();
      outline(g, '#c98b55', s, st);
      // Schichten
      g.fillStyle = '#9b5a34';
      g.fillRect(x - s * 0.38, y + s * 0.04, s * 0.76, s * 0.06);
      // Sahnehaube
      g.beginPath();
      g.moveTo(x - s * 0.4, y0 - s * 0.13);
      g.lineTo(x + s * 0.4, y0 + s * 0.06);
      g.lineTo(x + s * 0.4, y0 + s * 0.13);
      g.lineTo(x - s * 0.4, y0 - s * 0.04);
      g.closePath();
      g.fillStyle = st.dark ? '#f1ece4' : '#fffaf2';
      g.fill();
      g.beginPath();
      g.arc(x + s * 0.06, y0 - s * 0.12, s * 0.09, 0, TAU);
      g.fillStyle = '#d33a3a';
      g.fill();
      break;
    }
    case 'fruit': {
      bowl(g, x, y + s * 0.08, s, '#f4d9a8', st);
      for (const [dx, dy, c, r] of [
        [-0.18, -0.02, '#e8574c', 0.11],
        [0.0, -0.1, '#f2a93b', 0.12],
        [0.18, -0.03, '#7cbf4a', 0.1],
        [0.06, 0.02, '#6a4fb3', 0.08],
      ] as const) {
        g.beginPath();
        g.arc(x + s * dx, y + s * dy, s * r, 0, TAU);
        g.fillStyle = c;
        g.fill();
      }
      break;
    }
  }
  g.restore();
}
