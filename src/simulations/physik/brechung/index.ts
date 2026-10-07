import { defineSimulation, Plot, roundRect, Surface, text, withAlpha } from '../../../sim-core';
import { criticalAngle, lightSpeed, MEDIA, reflectance, refractionAngle, type MediumId } from './model';

const L = (de: string, en: string) => ({ de, en });
const R = 1;
const MEDIUM_OPTIONS = [
  { value: 'luft', label: L('Luft (n = 1,00)', 'Air (n = 1.00)') },
  { value: 'wasser', label: L('Wasser (n = 1,33)', 'Water (n = 1.33)') },
  { value: 'plexiglas', label: L('Plexiglas (n = 1,49)', 'Acrylic (n = 1.49)') },
  { value: 'glas', label: L('Glas (n = 1,52)', 'Glass (n = 1.52)') },
  { value: 'diamant', label: L('Diamant (n = 2,42)', 'Diamond (n = 2.42)') },
] as const;
const TINT: Record<MediumId, [string, number]> = {
  luft: ['#ffffff', 0],
  wasser: ['#2f8fd8', 0.2],
  plexiglas: ['#9fd6e8', 0.22],
  glas: ['#7fc8b6', 0.24],
  diamant: ['#b9a6f0', 0.28],
};

/**
 * Brechung und Totalreflexion an einer ebenen Grenzfläche – wie auf der
 * optischen Scheibe im Physikraum: Laser drehen, Winkel ablesen,
 * Brechungsgesetz prüfen und den Grenzwinkel der Totalreflexion finden.
 */
export default defineSimulation({
  id: 'brechung',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.45, aspectNarrow: 0.95 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'alpha', type: 'number', label: L('Einfallswinkel α', 'Angle of incidence α'), min: 0, max: 89, step: 1, default: 40, unit: '°' },
    {
      key: 'from',
      type: 'choice',
      label: L('Licht kommt von', 'Light comes from'),
      options: [
        { value: 'top', label: L('oben', 'above') },
        { value: 'bottom', label: L('unten', 'below') },
      ],
      default: 'top',
    },
    { key: 'top', type: 'choice', label: L('Stoff oben', 'Material above'), options: MEDIUM_OPTIONS, default: 'luft' },
    { key: 'bottom', type: 'choice', label: L('Stoff unten', 'Material below'), options: MEDIUM_OPTIONS, default: 'wasser' },
    { key: 'scale', type: 'boolean', group: 'view', label: L('Winkelmesser', 'Protractor'), default: true },
    { key: 'critical', type: 'boolean', group: 'view', label: L('Grenzwinkel einzeichnen', 'Show critical angle'), default: true },
    { key: 'intensity', type: 'boolean', group: 'view', label: L('Helligkeit nach Anteil (Teilreflexion)', 'Brightness by share (partial reflection)'), default: true },
  ],
  images: { laser: 'laser.webp' },
  readouts: [
    { key: 'angles', label: L('Winkel', 'Angles'), spoiler: true },
    { key: 'law', label: L('Brechungsgesetz', 'Law of refraction'), spoiler: true },
    { key: 'critical', label: L('Grenzwinkel der Totalreflexion', 'Critical angle'), spoiler: true },
    { key: 'reflect', label: L('Reflektierter Anteil', 'Reflected share') },
    { key: 'speed', label: L('Lichtgeschwindigkeit', 'Speed of light') },
  ],
  presets: [
    { id: 'start', label: L('Luft → Wasser', 'Air → water'), values: {} },
    { id: 'glass', label: L('Luft → Glas', 'Air → glass'), values: { bottom: 'glas', alpha: 50 } },
    { id: 'reverse', label: L('Wasser → Luft', 'Water → air'), values: { from: 'bottom', alpha: 30 } },
    { id: 'total', label: L('Totalreflexion', 'Total internal reflection'), values: { from: 'bottom', bottom: 'glas', alpha: 50 } },
    { id: 'diamond', label: L('Diamant funkelt', 'Diamond sparkles'), values: { from: 'bottom', bottom: 'diamant', alpha: 30 } },
  ],
  strings: {
    de: {
      canvas: 'Laserstrahl trifft auf die Grenzfläche zweier Stoffe und wird reflektiert und gebrochen',
      total: 'Totalreflexion!',
      normal: 'Lot',
      none: 'keiner – Licht geht ins optisch dichtere Medium',
      reflectText: '{r} % reflektiert, {t} % gebrochen',
      totalText: '100 % reflektiert (Totalreflexion)',
      denser: 'optisch dichter',
      thinner: 'optisch dünner',
      speedText: 'oben {top} km/s · unten {bottom} km/s',
      anglesTotal: 'α = {a}° · Reflexionswinkel α′ = {a}° · kein gebrochener Strahl',
      angles: 'α = {a}° · Reflexionswinkel α′ = {a}° · Brechungswinkel β = {b}°',
    },
    en: {
      canvas: 'A laser beam hits the boundary between two materials and is reflected and refracted',
      total: 'Total internal reflection!',
      normal: 'normal',
      none: 'none – light enters the optically denser medium',
      reflectText: '{r} % reflected, {t} % refracted',
      totalText: '100 % reflected (total internal reflection)',
      denser: 'optically denser',
      thinner: 'optically less dense',
      speedText: 'above {top} km/s · below {bottom} km/s',
      anglesTotal: 'α = {a}° · angle of reflection α′ = {a}° · no refracted ray',
      angles: 'α = {a}° · angle of reflection α′ = {a}° · angle of refraction β = {b}°',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const plot = new Plot(surface, { x: [-1.3, 1.3], y: [-1.15, 1.15], pan: false, zoom: false, controls: false });
    const rad = (d: number) => (d * Math.PI) / 180;

    let alpha = p.alpha;
    let sweepDir = 1;

    const media = () => {
      const top = p.top as MediumId;
      const bottom = p.bottom as MediumId;
      const fromTop = p.from === 'top';
      return { top, bottom, fromTop, n1: MEDIA[fromTop ? top : bottom], n2: MEDIA[fromTop ? bottom : top] };
    };

    function updateReadouts(): void {
      const { n1, n2, top, bottom } = media();
      const beta = refractionAngle(n1, n2, alpha);
      const a = fmt.num(alpha, 0);
      ctx.readout('angles', beta === null ? tr('anglesTotal', { a }) : tr('angles', { a, b: fmt.num(beta, 1) }));
      ctx.readout(
        'law',
        beta === null
          ? { html: `<var>n</var>₁ · sin α = ${fmt.num(n1, 2)} · sin ${a}° ≈ ${fmt.num(n1 * Math.sin(rad(alpha)), 3)} &gt; ${fmt.num(n2, 2)} = <var>n</var>₂ · sin 90°` }
          : { html: `<var>n</var>₁ · sin α = <var>n</var>₂ · sin β: &nbsp;${fmt.num(n1, 2)} · sin ${a}° ≈ ${fmt.num(n1 * Math.sin(rad(alpha)), 3)} ≈ ${fmt.num(n2, 2)} · sin ${fmt.num(beta, 1)}°` },
      );
      const c = criticalAngle(n1, n2);
      ctx.readout('critical', c === null ? ctx.t('none') : `α_G = arcsin(${fmt.num(n2, 2)} / ${fmt.num(n1, 2)}) ≈ ${fmt.num(c, 1)}°`);
      const rr = reflectance(n1, n2, alpha);
      ctx.readout('reflect', beta === null ? ctx.t('totalText') : tr('reflectText', { r: fmt.num(rr * 100, 1), t: fmt.num((1 - rr) * 100, 1) }));
      ctx.readout('speed', tr('speedText', { top: fmt.num(lightSpeed(MEDIA[top]), 0), bottom: fmt.num(lightSpeed(MEDIA[bottom]), 0) }));
    }

    // Laser ziehen: Einfallswinkel und Seite
    plot.addHandle({
      get: () => laserPoint(1.08),
      set: (x, y) => {
        const fromTop = y >= 0;
        const a = Math.round((Math.atan2(Math.abs(x), Math.abs(y)) * 180) / Math.PI);
        ctx.clock.pause();
        ctx.set({ alpha: Math.min(89, a), from: fromTop ? 'top' : 'bottom' });
      },
      enabled: () => !ctx.locked,
      color: () => '#ff3b30',
    });

    ctx.clock.onChange((playing) => {
      if (!playing && Math.round(alpha) !== p.alpha) ctx.set({ alpha: Math.round(alpha) });
    });

    /** Punkt auf dem einfallenden Strahl im Abstand d vom Auftreffpunkt (Laser links). */
    function laserPoint(d: number): [number, number] {
      const s = media().fromTop ? 1 : -1;
      return [-d * Math.sin(rad(alpha)), s * d * Math.cos(rad(alpha))];
    }

    /* ---------- Zeichnen ---------- */
    function beam(from: [number, number], to: [number, number], strength: number): void {
      const g = surface.g;
      const [x1, y1] = plot.toPx(from[0], from[1]);
      const [x2, y2] = plot.toPx(to[0], to[1]);
      const a = Math.max(0.06, Math.min(1, strength));
      g.save();
      g.lineCap = 'round';
      g.shadowColor = `rgba(255,40,40,${0.9 * a})`;
      g.shadowBlur = 14;
      g.strokeStyle = `rgba(255,60,50,${a})`;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.shadowBlur = 0;
      g.strokeStyle = `rgba(255,235,230,${0.85 * a})`;
      g.lineWidth = 1.4;
      g.stroke();
      // Pfeilspitze in der Mitte
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const ang = Math.atan2(y2 - y1, x2 - x1);
      g.fillStyle = `rgba(255,60,50,${a})`;
      g.beginPath();
      g.moveTo(mx + Math.cos(ang) * 8, my + Math.sin(ang) * 8);
      g.lineTo(mx + Math.cos(ang + 2.5) * 8, my + Math.sin(ang + 2.5) * 8);
      g.lineTo(mx + Math.cos(ang - 2.5) * 8, my + Math.sin(ang - 2.5) * 8);
      g.closePath();
      g.fill();
      g.restore();
    }

    function drawMedia(): void {
      const g = surface.g;
      const r = plot.rect;
      const y0 = plot.py(0);
      const { top, bottom } = media();
      const fill = (id: MediumId, y: number, h: number) => {
        const [color, alphaTint] = TINT[id];
        g.fillStyle = withAlpha(color, ctx.theme.dark ? alphaTint * 1.3 : alphaTint);
        g.fillRect(r.x, y, r.w, h);
      };
      fill(top, r.y, y0 - r.y);
      fill(bottom, y0, r.y + r.h - y0);
      g.strokeStyle = ctx.theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x, y0);
      g.lineTo(r.x + r.w, y0);
      g.stroke();
      const label = (id: MediumId, y: number, baseline: CanvasTextBaseline) => {
        const name = MEDIUM_OPTIONS.find((o) => o.value === id)!.label[ctx.lang];
        const other = id === top ? MEDIA[bottom] : MEDIA[top];
        const dens = MEDIA[id] > other ? ` · ${ctx.t('denser')}` : MEDIA[id] < other ? ` · ${ctx.t('thinner')}` : '';
        g.font = `700 13px ${ctx.theme.font}`;
        g.fillStyle = ctx.theme.text;
        g.textAlign = 'right';
        g.textBaseline = baseline;
        g.fillText(name + dens, r.x + r.w - 12, y);
      };
      label(top, r.y + 12, 'top');
      label(bottom, r.y + r.h - 12, 'bottom');
    }

    function drawProtractor(): void {
      const g = surface.g;
      const [cx, cy] = plot.toPx(0, 0);
      const rad0 = R * plot.scale.x;
      g.save();
      g.strokeStyle = withAlpha(ctx.theme.text, 0.55);
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, rad0, 0, Math.PI * 2);
      g.stroke();
      for (let d = 0; d < 360; d += 5) {
        const a = rad(d);
        const len = d % 10 === 0 ? 12 : 6;
        g.beginPath();
        g.moveTo(cx + Math.sin(a) * rad0, cy - Math.cos(a) * rad0);
        g.lineTo(cx + Math.sin(a) * (rad0 - len), cy - Math.cos(a) * (rad0 - len));
        g.stroke();
        if (d % 30 === 0) {
          // Winkel zum Lot (0° oben und unten, 90° an der Grenzfläche)
          const fromNormal = Math.min(d % 180, 180 - (d % 180));
          text(g, `${fromNormal}°`, cx + Math.sin(a) * (rad0 - 24), cy - Math.cos(a) * (rad0 - 24), { font: `600 11px ${ctx.theme.font}`, color: ctx.theme.muted });
        }
      }
      g.restore();
    }

    function angleArc(dirAngle: number, sweep: number, radius: number, color: string, label: string): void {
      // dirAngle: Richtung des Lots (Weltwinkel), sweep: vorzeichenbehafteter Winkel
      const from = Math.min(dirAngle, dirAngle + sweep);
      const to = Math.max(dirAngle, dirAngle + sweep);
      plot.arcPx(0, 0, radius, from, to, { fill: color, alpha: 0.18, sector: true });
      plot.arcPx(0, 0, radius, from, to, { stroke: color, width: 2 });
      const mid = dirAngle + sweep / 2;
      const [cx, cy] = plot.toPx(0, 0);
      plot.textPx(cx + Math.cos(mid) * (radius + 16), cy - Math.sin(mid) * (radius + 16), label, { color, size: 15, math: true, weight: 'bold' });
    }

    function drawLaser(): void {
      const g = surface.g;
      const [x, y] = plot.toPx(...laserPoint(1.12));
      const [tx, ty] = plot.toPx(0, 0);
      const ang = Math.atan2(ty - y, tx - x);
      const len = 70;
      const hgt = 20;
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      const img = ctx.images.get('laser');
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 8;
      if (img) {
        g.drawImage(img, -len, -hgt / 2, len, hgt);
      } else {
        const body = g.createLinearGradient(0, -hgt / 2, 0, hgt / 2);
        body.addColorStop(0, '#5b6270');
        body.addColorStop(0.5, '#a7afbd');
        body.addColorStop(1, '#3d434e');
        g.fillStyle = body;
        roundRect(g, -len, -hgt / 2, len, hgt, 6);
        g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = '#2b2f36';
        g.fillRect(-6, -hgt / 2 + 3, 6, hgt - 6);
        g.fillStyle = '#ff3b30';
        g.beginPath();
        g.arc(-len * 0.6, 0, 3.5, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    return {
      update(changed, source) {
        if (changed.has('alpha') || source !== 'sim') alpha = p.alpha;
        updateReadouts();
      },

      tick(dt) {
        alpha += sweepDir * 12 * dt;
        if (alpha >= 89) [alpha, sweepDir] = [89, -1];
        if (alpha <= 0) [alpha, sweepDir] = [0, 1];
        updateReadouts();
      },

      resetTime() {
        alpha = 0;
        sweepDir = 1;
        updateReadouts();
      },

      render() {
        const theme = ctx.theme;
        const { n1, n2, fromTop } = media();
        const s = fromTop ? 1 : -1;
        plot.begin();
        drawMedia();
        if (p.scale) drawProtractor();
        // Lot
        plot.segment([0, -1.12], [0, 1.12], { color: theme.text, width: 1.5, dash: [6, 5], alpha: 0.8 });
        plot.text(0, 1.1 * 1, ctx.t('normal'), { color: theme.muted, size: 12, offset: [8, 6], align: 'left' });

        const beta = refractionAngle(n1, n2, alpha);
        const rr = beta === null ? 1 : reflectance(n1, n2, alpha);
        const strength = (x: number) => (p.intensity ? 0.15 + 0.85 * x : 1);
        // Grenzwinkel
        const c = criticalAngle(n1, n2);
        if (p.critical && c !== null) {
          for (const side of [-1, 1]) {
            plot.segment([0, 0], [side * Math.sin(rad(c)) * R, s * Math.cos(rad(c)) * R], { color: theme.series[4], width: 1.5, dash: [3, 4] });
          }
          plot.text(Math.sin(rad(c)) * R, s * Math.cos(rad(c)) * R, `α_G ≈ ${fmt.num(c, 1)}°`, { color: theme.series[4], size: 12, offset: [8, s * 10], align: 'left', weight: '600' });
        }
        // Strahlen
        const inc = laserPoint(1.12);
        beam(inc, [0, 0], 1);
        beam([0, 0], [Math.sin(rad(alpha)) * 1.12, s * Math.cos(rad(alpha)) * 1.12], strength(rr));
        if (beta !== null) beam([0, 0], [Math.sin(rad(beta)) * 1.12, -s * Math.cos(rad(beta)) * 1.12], strength(1 - rr));

        // Winkelbögen (Weltwinkel: Lot oben = π/2, unten = −π/2)
        const normalIn = s > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (alpha > 0.5) {
          angleArc(normalIn, s * alpha * (Math.PI / 180), 52, theme.series[3]!, 'α');
          angleArc(normalIn, -s * alpha * (Math.PI / 180), 40, theme.series[0]!, 'α′');
          if (beta !== null && beta > 0.5) angleArc(-normalIn, s * beta * (Math.PI / 180), 52, theme.series[2]!, 'β');
        }
        drawLaser();
        if (beta === null) {
          const r = plot.rect;
          const g = surface.g;
          g.font = `800 16px ${theme.font}`;
          const msg = ctx.t('total');
          const tw = g.measureText(msg).width + 26;
          g.fillStyle = withAlpha(theme.series[4]!, 0.92);
          roundRect(g, r.x + 12, r.y + 12, tw, 32, 10);
          g.fill();
          text(g, msg, r.x + 12 + tw / 2, r.y + 28, { font: `800 16px ${theme.font}`, color: '#ffffff' });
        }
        plot.end();
      },

      destroy: () => surface.destroy(),
    };
  },
});
