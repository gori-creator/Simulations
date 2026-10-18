import { roundRect, shade } from '../../../sim-core';

/** Bildchen für das Piktogramm (gezeichnet, keine Bilddateien). */
export type PictIcon = 'person' | 'vote' | 'phone' | 'sun';

const TAU = Math.PI * 2;

/**
 * Zeichnet ein Bildchen mit Mittelpunkt (cx, cy) in ein Quadrat der Kantenlänge s.
 * `color` ist die Farbe der Kategorie, `dark` der Dunkelmodus.
 */
export function drawPictIcon(g: CanvasRenderingContext2D, kind: PictIcon, color: string, cx: number, cy: number, s: number, dark: boolean): void {
  g.save();
  g.translate(cx, cy);
  switch (kind) {
    case 'person': {
      // Kopf
      const hr = s * 0.17;
      const hy = -s * 0.27;
      const hg = g.createRadialGradient(-hr * 0.35, hy - hr * 0.4, hr * 0.1, 0, hy, hr);
      hg.addColorStop(0, shade(color, 0.35));
      hg.addColorStop(1, shade(color, -0.05));
      g.beginPath();
      g.arc(0, hy, hr, 0, TAU);
      g.fillStyle = hg;
      g.fill();
      // Körper (abgerundeter Rumpf mit Schultern)
      const bw = s * 0.62;
      const top = -s * 0.06;
      const bot = s * 0.46;
      const bg = g.createLinearGradient(-bw / 2, top, bw / 2, bot);
      bg.addColorStop(0, shade(color, 0.22));
      bg.addColorStop(1, shade(color, -0.12));
      g.beginPath();
      g.moveTo(-bw / 2, bot);
      g.lineTo(-bw / 2, top + bw * 0.32);
      g.quadraticCurveTo(-bw / 2, top, -bw * 0.18, top);
      g.lineTo(bw * 0.18, top);
      g.quadraticCurveTo(bw / 2, top, bw / 2, top + bw * 0.32);
      g.lineTo(bw / 2, bot);
      g.closePath();
      g.fillStyle = bg;
      g.fill();
      // Lichtkante
      g.strokeStyle = 'rgba(255,255,255,0.28)';
      g.lineWidth = Math.max(1, s * 0.03);
      g.beginPath();
      g.moveTo(-bw * 0.32, top + s * 0.06);
      g.quadraticCurveTo(-bw * 0.36, top + s * 0.02, -bw * 0.16, top + s * 0.03);
      g.stroke();
      break;
    }
    case 'vote': {
      // Stimmzettel mit Haken
      const w = s * 0.7;
      const h = s * 0.84;
      roundRect(g, -w / 2, -h / 2, w, h, s * 0.08);
      const pg = g.createLinearGradient(0, -h / 2, 0, h / 2);
      pg.addColorStop(0, dark ? '#f2f4f7' : '#ffffff');
      pg.addColorStop(1, dark ? '#c9ced8' : '#e6e9ef');
      g.fillStyle = pg;
      g.fill();
      g.strokeStyle = shade(color, -0.1, 0.55);
      g.lineWidth = Math.max(1, s * 0.035);
      g.stroke();
      // Zeilen
      g.strokeStyle = 'rgba(60,70,90,0.28)';
      g.lineWidth = Math.max(1, s * 0.035);
      for (const y of [-0.22, 0.02, 0.26]) {
        g.beginPath();
        g.moveTo(-w * 0.12, y * h);
        g.lineTo(w * 0.36, y * h);
        g.stroke();
      }
      // Kästchen mit Kreuz
      const b = s * 0.17;
      g.strokeStyle = 'rgba(60,70,90,0.5)';
      g.lineWidth = Math.max(1, s * 0.035);
      g.strokeRect(-w * 0.38, -0.22 * h - b / 2, b, b);
      g.strokeStyle = color;
      g.lineWidth = Math.max(1.6, s * 0.08);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(-w * 0.4, -0.22 * h);
      g.lineTo(-w * 0.31, -0.22 * h + b * 0.55);
      g.lineTo(-w * 0.16, -0.22 * h - b * 0.75);
      g.stroke();
      break;
    }
    case 'phone': {
      const w = s * 0.5;
      const h = s * 0.86;
      roundRect(g, -w / 2, -h / 2, w, h, s * 0.1);
      const cg = g.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      cg.addColorStop(0, dark ? '#59606d' : '#4a505b');
      cg.addColorStop(1, dark ? '#2a2f38' : '#22262d');
      g.fillStyle = cg;
      g.fill();
      // Bildschirm in der Kategoriefarbe
      const m = s * 0.045;
      roundRect(g, -w / 2 + m, -h / 2 + m * 2.2, w - 2 * m, h - m * 4.8, s * 0.05);
      const sg = g.createLinearGradient(0, -h / 2, 0, h / 2);
      sg.addColorStop(0, shade(color, 0.35));
      sg.addColorStop(1, shade(color, -0.1));
      g.fillStyle = sg;
      g.fill();
      // Spiegelung
      g.save();
      g.clip();
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.beginPath();
      g.moveTo(-w / 2, -h / 2);
      g.lineTo(w * 0.1, -h / 2);
      g.lineTo(-w / 2, h * 0.15);
      g.closePath();
      g.fill();
      g.restore();
      g.beginPath();
      g.arc(0, h / 2 - m * 1.3, m * 0.75, 0, TAU);
      g.fillStyle = 'rgba(255,255,255,0.45)';
      g.fill();
      break;
    }
    default: {
      // Sonne: Strahlen und Scheibe mit Verlauf (Naturfarben)
      const r = s * 0.25;
      g.strokeStyle = dark ? '#f2b33d' : '#f0a92e';
      g.lineWidth = Math.max(1.4, s * 0.075);
      g.lineCap = 'round';
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        g.beginPath();
        g.moveTo(Math.cos(a) * r * 1.38, Math.sin(a) * r * 1.38);
        g.lineTo(Math.cos(a) * r * 1.85, Math.sin(a) * r * 1.85);
        g.stroke();
      }
      const sg = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
      sg.addColorStop(0, '#fff3b0');
      sg.addColorStop(0.55, '#ffcf3f');
      sg.addColorStop(1, '#f39c1f');
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.fillStyle = sg;
      g.fill();
    }
  }
  g.restore();
}
