import {
  defineSimulation,
  drawImageFit,
  ease,
  Plot,
  roundRect,
  softShadow,
  Surface,
  TapTarget,
  text,
  withAlpha,
  type Rect,
} from '../../../sim-core';
import { openedDoors, playRound, remainingDoor, winProbabilities } from './model';

const L = (de: string, en: string) => ({ de, en });
const OPEN_MS = 650;
const MAX_HISTORY = 100_000;
/** Platz für die Achsenbeschriftungen im Diagramm (Pixel). */
const CHART_PADDING = { left: 50, right: 18, top: 16, bottom: 24 };

type Phase = 'pick' | 'decide' | 'done';

/**
 * Ziegenproblem: Selbst spielen (Türen antippen) oder viele Spiele simulieren.
 * Verallgemeinert auf bis zu 10 Türen – die Moderation öffnet dann alle Türen
 * außer der gewählten und einer weiteren.
 */
export default defineSimulation({
  id: 'ziegenproblem',
  layout: { aspect: 1.75, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'play', label: L('Selbst spielen', 'Play yourself') },
        { value: 'simulate', label: L('Viele Spiele simulieren', 'Simulate many games') },
      ],
      default: 'play',
    },
    { key: 'doors', type: 'number', label: L('Anzahl der Türen', 'Number of doors'), min: 3, max: 10, step: 1, default: 3 },
    { key: 'speed', type: 'number', label: L('Spiele pro Sekunde', 'Games per second'), min: 1, max: 500, step: 1, default: 60, visibleIf: (v) => v.mode === 'simulate' },
  ],
  actions: [
    { id: 'stay', label: L('Bleiben', 'Stay'), primary: true, visibleIf: (v) => v.mode === 'play' },
    { id: 'switch', label: L('Wechseln', 'Switch'), primary: true, visibleIf: (v) => v.mode === 'play' },
    { id: 'new', label: L('Neues Spiel', 'New game'), visibleIf: (v) => v.mode === 'play' },
    { id: 'run100', label: L('100 Spiele', '100 games'), primary: true, visibleIf: (v) => v.mode === 'simulate' },
    { id: 'run1000', label: L('1000 Spiele', '1000 games'), visibleIf: (v) => v.mode === 'simulate' },
    { id: 'auto', label: L('Automatisch spielen', 'Play automatically'), visibleIf: (v) => v.mode === 'simulate' },
    { id: 'clear', label: L('Statistik löschen', 'Clear statistics') },
  ],
  images: {
    stage: 'buehne.webp',
    door: 'tuer.webp',
    goat: 'ziege.webp',
    car: 'auto.webp',
  },
  readouts: [
    { key: 'yours', label: L('Deine Spiele', 'Your games') },
    { key: 'sim', label: L('Simulation', 'Simulation') },
    { key: 'theory', label: L('Theoretische Gewinnchance', 'Theoretical chance of winning'), spoiler: true },
  ],
  presets: [
    { id: 'three', label: L('3 Türen', '3 doors'), values: {} },
    { id: 'ten', label: L('10 Türen', '10 doors'), values: { doors: 10 } },
    { id: 'sim', label: L('Simulation', 'Simulation'), values: { mode: 'simulate' } },
  ],
  strings: {
    de: {
      canvas: 'Spielshow mit Türen: Hinter einer steht ein Auto, hinter den anderen Ziegen',
      pick: 'Wähle eine Tür!',
      decide3: 'Hinter Tür {opened} steht eine Ziege. Bleibst du bei Tür {chosen} oder wechselst du zu Tür {other}?',
      decideN: '{count} Türen mit Ziegen sind offen. Bleibst du bei Tür {chosen} oder wechselst du zu Tür {other}?',
      win: 'Gewonnen – das Auto!',
      lose: 'Leider eine Ziege.',
      again: 'Tippe auf eine Tür für ein neues Spiel.',
      door: 'Tür {n}',
      yourChoice: 'Deine Wahl',
      firstChoice: 'erste Wahl',
      finalChoice: 'endgültige Wahl',
      stayStat: 'Bleiben: {won} von {played} gewonnen{rate}',
      switchStat: 'Wechseln: {won} von {played} gewonnen{rate}',
      none: 'noch keine Spiele',
      games: '{n} Spiele',
      autoOn: 'Automatisch spielen',
      autoOff: 'Anhalten',
      stay: 'Bleiben',
      switch: 'Wechseln',
      rate: 'Gewinnanteil',
      theory: 'Bleiben: 1/{n} ≈ {stay} %, Wechseln: {m}/{n} ≈ {switch} %',
      goat: 'Ziege',
      car: 'Auto',
    },
    en: {
      canvas: 'Game show with doors: a car behind one, goats behind the others',
      pick: 'Pick a door!',
      decide3: 'There is a goat behind door {opened}. Do you stay with door {chosen} or switch to door {other}?',
      decideN: '{count} doors with goats are open. Do you stay with door {chosen} or switch to door {other}?',
      win: 'You win – the car!',
      lose: 'Sorry, a goat.',
      again: 'Tap a door for a new game.',
      door: 'Door {n}',
      yourChoice: 'Your choice',
      firstChoice: 'first choice',
      finalChoice: 'final choice',
      stayStat: 'Stay: won {won} of {played}{rate}',
      switchStat: 'Switch: won {won} of {played}{rate}',
      none: 'no games yet',
      games: '{n} games',
      autoOn: 'Play automatically',
      autoOff: 'Stop',
      stay: 'Stay',
      switch: 'Switch',
      rate: 'Share of wins',
      theory: 'Stay: 1/{n} ≈ {stay} %, switch: {m}/{n} ≈ {switch} %',
      goat: 'Goat',
      car: 'Car',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) =>
      ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));

    // Diagramm für den Simulationsmodus (rechts bzw. unten)
    const chartRegion = (w: number, h: number): Rect =>
      w >= 640 ? { x: w * 0.4 + 8, y: 12, w: w * 0.6 - 20, h: h - 24 } : { x: 8, y: h * 0.45, w: w - 16, h: h * 0.55 - 12 };
    const plot = new Plot(surface, {
      x: [0, 100],
      y: [-0.04, 1.04],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (p.mode === 'simulate' ? chartRegion(w, h) : { x: -10, y: -10, w: 1, h: 1 }),
      xAxis: { label: 'n', minStep: 1, format: (v) => fmt.num(v, 0) },
      yAxis: { label: '', format: (v) => `${fmt.num(v * 100, 0)} %` },
    });

    /* ---------- Spielzustand ---------- */
    let phase: Phase = 'pick';
    let car = 0;
    let chosen = -1;
    let other = -1;
    let finalChoice = -1;
    let openedAt: number[] = [];
    let hovered = -1;
    const yours = { stay: { played: 0, won: 0 }, switch: { played: 0, won: 0 } };

    /* ---------- Simulation ---------- */
    let games = 0;
    let stayWins = 0;
    let switchWins = 0;
    let stayHistory: number[] = [];
    let switchHistory: number[] = [];
    let auto = false;
    let lastFrame = 0;
    let carry = 0;
    let xMax = 100;

    function newGame(): void {
      car = Math.floor(Math.random() * p.doors);
      chosen = -1;
      other = -1;
      finalChoice = -1;
      phase = 'pick';
      openedAt = Array.from({ length: p.doors }, () => -1);
      syncActions();
    }

    function choose(door: number): void {
      chosen = door;
      other = remainingDoor(p.doors, car, chosen, Math.random);
      const now = performance.now();
      openedDoors(p.doors, chosen, other).forEach((d, i) => (openedAt[d] = now + 250 + i * 120));
      phase = 'decide';
      syncActions();
    }

    function decide(stay: boolean): void {
      if (phase !== 'decide') return;
      finalChoice = stay ? chosen : other;
      const now = performance.now();
      openedAt[finalChoice] = now + 150;
      const notChosen = stay ? other : chosen;
      openedAt[notChosen] = now + 650;
      const stat = stay ? yours.stay : yours.switch;
      stat.played++;
      if (finalChoice === car) stat.won++;
      phase = 'done';
      syncActions();
      updateReadouts();
    }

    function runGames(count: number): void {
      for (let i = 0; i < count; i++) {
        const r = playRound(p.doors, Math.random);
        games++;
        if (r.stayWins) stayWins++;
        if (r.switchWins) switchWins++;
        if (stayHistory.length < MAX_HISTORY) {
          stayHistory.push(stayWins / games);
          switchHistory.push(switchWins / games);
        }
      }
      if (games > xMax) {
        const base = 10 ** Math.floor(Math.log10(games));
        xMax = [1, 2, 5, 10].map((m) => m * base).find((v) => v >= games) ?? games;
        plot.setRangePadded([0, xMax], [0, 1], CHART_PADDING);
      }
      updateReadouts();
    }

    function clearSimulation(): void {
      games = 0;
      stayWins = 0;
      switchWins = 0;
      stayHistory = [];
      switchHistory = [];
      xMax = 100;
      plot.setRangePadded([0, xMax], [0, 1], CHART_PADDING);
    }

    function syncActions(): void {
      ctx.setAction('stay', { enabled: phase === 'decide' });
      ctx.setAction('switch', { enabled: phase === 'decide' });
      ctx.setAction('auto', { label: ctx.t(auto ? 'autoOff' : 'autoOn') });
    }

    function percent(won: number, played: number): string {
      return played ? ` (${fmt.num((won / played) * 100, 0)} %)` : '';
    }

    function updateReadouts(): void {
      const parts: string[] = [];
      if (yours.stay.played) parts.push(tr('stayStat', { won: yours.stay.won, played: yours.stay.played, rate: percent(yours.stay.won, yours.stay.played) }));
      if (yours.switch.played) parts.push(tr('switchStat', { won: yours.switch.won, played: yours.switch.played, rate: percent(yours.switch.won, yours.switch.played) }));
      ctx.readout('yours', parts.length ? parts.join(' · ') : ctx.t('none'));
      ctx.readout(
        'sim',
        games === 0
          ? ctx.t('none')
          : `${tr('games', { n: fmt.num(games, 0) })}: ${ctx.t('stay')} ${fmt.num((stayWins / games) * 100, 1)} %, ${ctx.t('switch')} ${fmt.num((switchWins / games) * 100, 1)} %`,
      );
      const th = winProbabilities(p.doors);
      ctx.readout('theory', tr('theory', { n: p.doors, m: p.doors - 1, stay: fmt.num(th.stay * 100, 1), switch: fmt.num(th.switch * 100, 1) }));
    }

    /* ---------- Geometrie der Türen ---------- */
    function doorRects(): Rect[] {
      const w = surface.width;
      const h = surface.height;
      const n = p.doors;
      // Auf schmalen Bildschirmen viele Türen in zwei Reihen
      const cols = w < 600 && n > 4 ? Math.ceil(n / 2) : n;
      const rows = Math.ceil(n / cols);
      const avail = w * 0.92;
      const gap = Math.max(8, Math.min(26, (avail / cols) * 0.16));
      const rowGap = 40;
      let dw = Math.min(170, (avail - gap * (cols - 1)) / cols);
      let dh = dw * 1.75;
      const maxH = (h * 0.66 - rowGap * (rows - 1)) / rows;
      if (dh > maxH) {
        dh = maxH;
        dw = dh / 1.75;
      }
      const bottom = h * 0.86;
      return Array.from({ length: n }, (_, i) => {
        const row = Math.floor(i / cols);
        const inRow = Math.min(cols, n - row * cols);
        const col = i - row * cols;
        const total = dw * inRow + gap * (inRow - 1);
        const x0 = (w - total) / 2;
        const y = bottom - dh - (rows - 1 - row) * (dh + rowGap);
        return { x: x0 + col * (dw + gap), y, w: dw, h: dh };
      });
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'play') return null;
        const i = doorRects().findIndex((r) => px >= r.x && px <= r.x + r.w && py >= r.y - 10 && py <= r.y + r.h);
        return i >= 0 ? String(i) : null;
      },
      onHover: (id) => (hovered = id === null ? -1 : Number(id)),
      onTap: (id) => {
        const door = Number(id);
        if (phase === 'pick') choose(door);
        else if (phase === 'decide') {
          if (door === chosen) decide(true);
          else if (door === other) decide(false);
        } else {
          newGame();
          choose(door);
        }
        ctx.requestRender();
      },
    });

    /* ---------- Zeichnen ---------- */
    function openness(door: number, now: number): number {
      const t0 = openedAt[door] ?? -1;
      if (t0 < 0 || now < t0) return 0;
      return ease.outCubic(Math.min(1, (now - t0) / OPEN_MS));
    }

    function drawPrize(kind: 'goat' | 'car', r: Rect): void {
      const g = surface.g;
      const img = ctx.images.get(kind);
      const box: Rect = { x: r.x + r.w * 0.08, y: r.y + r.h * 0.35, w: r.w * 0.84, h: r.h * 0.6 };
      if (img) {
        drawImageFit(g, img, box, 'contain');
        return;
      }
      const cx = box.x + box.w / 2;
      const base = box.y + box.h * 0.85;
      const s = box.w / 100;
      g.save();
      g.translate(cx, base);
      g.scale(s, s);
      if (kind === 'car') {
        g.fillStyle = ctx.theme.series[1]!;
        g.beginPath();
        g.moveTo(-46, -8);
        g.lineTo(-44, -22);
        g.lineTo(-24, -26);
        g.lineTo(-12, -42);
        g.lineTo(18, -42);
        g.lineTo(32, -26);
        g.lineTo(46, -22);
        g.lineTo(48, -8);
        g.closePath();
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.75)';
        g.beginPath();
        g.moveTo(-8, -38);
        g.lineTo(14, -38);
        g.lineTo(24, -27);
        g.lineTo(-18, -27);
        g.closePath();
        g.fill();
        g.fillStyle = '#20252c';
        for (const x of [-28, 28]) {
          g.beginPath();
          g.arc(x, -6, 10, 0, Math.PI * 2);
          g.fill();
        }
      } else {
        g.fillStyle = '#f1efe9';
        g.strokeStyle = '#6b6258';
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(0, -30, 30, 16, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        for (const x of [-20, -8, 10, 22]) {
          g.beginPath();
          g.moveTo(x, -18);
          g.lineTo(x, 0);
          g.stroke();
        }
        g.beginPath();
        g.ellipse(32, -48, 11, 9, -0.5, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.beginPath();
        g.moveTo(30, -56);
        g.quadraticCurveTo(26, -70, 18, -72);
        g.moveTo(36, -56);
        g.quadraticCurveTo(36, -70, 28, -74);
        g.stroke();
        g.beginPath();
        g.moveTo(38, -40);
        g.lineTo(37, -32);
        g.stroke();
      }
      g.restore();
      text(g, ctx.t(kind), r.x + r.w / 2, r.y + r.h * 0.2, { font: `700 ${Math.max(11, Math.min(18, r.w * 0.13))}px ${ctx.theme.font}`, color: '#ffffff' });
    }

    function drawDoor(i: number, r: Rect, now: number): void {
      const g = surface.g;
      const open = openness(i, now);
      const lift = hovered === i && phase !== 'decide' ? -4 : hovered === i && (i === chosen || i === other) ? -4 : 0;
      const y = r.y + lift;
      // Rahmen und Innenraum
      g.save();
      softShadow(g, ctx.theme.dark, 18, 6);
      roundRect(g, r.x - 6, y - 6, r.w + 12, r.h + 6, 10);
      g.fillStyle = '#3b2a1e';
      g.fill();
      g.restore();
      const inside = g.createLinearGradient(0, y, 0, y + r.h);
      inside.addColorStop(0, '#1b1f27');
      inside.addColorStop(1, '#2e3440');
      g.fillStyle = inside;
      g.fillRect(r.x, y, r.w, r.h);
      if (open > 0.05) drawPrize(i === car ? 'car' : 'goat', { x: r.x, y, w: r.w, h: r.h });

      // Türblatt dreht sich um die linke Kante (Perspektive)
      if (open < 0.999) {
        const width = r.w * (1 - 0.88 * open);
        const shrink = r.h * 0.07 * open;
        g.save();
        g.beginPath();
        g.moveTo(r.x, y);
        g.lineTo(r.x + width, y + shrink);
        g.lineTo(r.x + width, y + r.h - shrink);
        g.lineTo(r.x, y + r.h);
        g.closePath();
        g.clip();
        const img = ctx.images.get('door');
        if (img) {
          g.drawImage(img, r.x, y, width, r.h);
        } else {
          const panel = g.createLinearGradient(r.x, 0, r.x + width, 0);
          panel.addColorStop(0, '#b4442e');
          panel.addColorStop(1, '#8e2f1f');
          g.fillStyle = panel;
          g.fillRect(r.x, y, width, r.h);
          g.strokeStyle = 'rgba(255,255,255,0.18)';
          g.lineWidth = 2;
          const inset = width * 0.14;
          g.strokeRect(r.x + inset, y + r.h * 0.08, width - inset * 2, r.h * 0.36);
          g.strokeRect(r.x + inset, y + r.h * 0.52, width - inset * 2, r.h * 0.4);
          g.fillStyle = '#f2c94c';
          g.beginPath();
          g.arc(r.x + width * 0.84, y + r.h * 0.52, Math.max(3, r.w * 0.04), 0, Math.PI * 2);
          g.fill();
        }
        if (open > 0) {
          g.fillStyle = `rgba(0,0,0,${0.35 * open})`;
          g.fillRect(r.x, y, width, r.h);
        }
        g.restore();
        // Nummer
        if (open < 0.5) {
          const cx = r.x + (r.w * (1 - 0.88 * open)) / 2;
          g.beginPath();
          g.arc(cx, y + r.h * 0.2, Math.max(12, r.w * 0.14), 0, Math.PI * 2);
          g.fillStyle = 'rgba(255,255,255,0.92)';
          g.fill();
          text(g, String(i + 1), cx, y + r.h * 0.2 + 1, { font: `800 ${Math.max(12, r.w * 0.15)}px ${ctx.theme.font}`, color: '#2b2b2b' });
        }
      }
      // Markierungen
      const markColor = i === chosen ? ctx.theme.series[0]! : i === other && phase === 'decide' ? ctx.theme.series[2]! : null;
      if (markColor) {
        g.save();
        g.strokeStyle = markColor;
        g.lineWidth = 5;
        roundRect(g, r.x - 9, y - 9, r.w + 18, r.h + 12, 12);
        g.stroke();
        g.restore();
        if (i === chosen && phase !== 'done') text(g, ctx.t('yourChoice'), r.x + r.w / 2, y + r.h + 22, { font: `700 13px ${ctx.theme.font}`, color: markColor });
      }
      if (phase === 'done') {
        const size = Math.max(10, Math.min(13, r.w * 0.12));
        if (i === finalChoice) text(g, ctx.t('finalChoice'), r.x + r.w / 2, y + r.h + 22, { font: `700 ${size}px ${ctx.theme.font}`, color: '#ffffff' });
        else if (i === chosen) text(g, ctx.t('firstChoice'), r.x + r.w / 2, y + r.h + 22, { font: `600 ${size}px ${ctx.theme.font}`, color: 'rgba(255,255,255,0.7)' });
      }
      if (phase === 'done' && i === finalChoice && openness(i, now) > 0.9) {
        g.save();
        g.strokeStyle = i === car ? ctx.theme.series[2]! : ctx.theme.series[1]!;
        g.lineWidth = 6;
        roundRect(g, r.x - 10, y - 10, r.w + 20, r.h + 14, 12);
        g.stroke();
        g.restore();
      }
    }

    function drawStage(): void {
      const g = surface.g;
      const w = surface.width;
      const h = surface.height;
      const bg = ctx.images.get('stage');
      if (bg) {
        drawImageFit(g, bg, { x: 0, y: 0, w, h }, 'cover');
        g.fillStyle = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.18)';
        g.fillRect(0, 0, w, h);
      } else {
        const grad = g.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#2a1b3d');
        grad.addColorStop(0.7, '#41275e');
        grad.addColorStop(1, '#1d1429');
        g.fillStyle = grad;
        g.fillRect(0, 0, w, h);
        // Scheinwerferkegel
        for (const x of [0.2, 0.5, 0.8]) {
          const spot = g.createRadialGradient(w * x, h * 0.1, 10, w * x, h * 0.55, h * 0.7);
          spot.addColorStop(0, 'rgba(255,240,200,0.18)');
          spot.addColorStop(1, 'rgba(255,240,200,0)');
          g.fillStyle = spot;
          g.fillRect(0, 0, w, h);
        }
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.fillRect(0, h * 0.86, w, h * 0.14);
      }
    }

    function drawMessage(now: number): void {
      const g = surface.g;
      const w = surface.width;
      let message = ctx.t('pick');
      let color = '#ffffff';
      if (phase === 'decide') {
        const opened = openedDoors(p.doors, chosen, other);
        message =
          p.doors === 3
            ? tr('decide3', { opened: opened[0]! + 1, chosen: chosen + 1, other: other + 1 })
            : tr('decideN', { count: opened.length, chosen: chosen + 1, other: other + 1 });
      } else if (phase === 'done') {
        const revealed = openness(finalChoice, now) > 0.6;
        message = revealed ? `${ctx.t(finalChoice === car ? 'win' : 'lose')} ${ctx.t('again')}` : '…';
        if (revealed) color = finalChoice === car ? '#8ce99a' : '#ffc9c9';
      }
      const font = `700 ${w < 600 ? 14 : 17}px ${ctx.theme.font}`;
      g.font = font;
      const maxWidth = w * 0.9;
      // Zeilenumbruch
      const words = message.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (g.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else line = test;
      }
      lines.push(line);
      const lh = w < 600 ? 19 : 23;
      const boxH = lines.length * lh + 18;
      g.save();
      g.fillStyle = 'rgba(0,0,0,0.45)';
      roundRect(g, w * 0.04, 12, w * 0.92, boxH, 12);
      g.fill();
      g.restore();
      lines.forEach((l, i) => text(g, l, w / 2, 12 + 9 + lh / 2 + i * lh, { font, color }));
    }

    function drawSimulation(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const w = surface.width;
      const h = surface.height;
      const wide = w >= 640;
      const bars: Rect = wide ? { x: 16, y: 16, w: w * 0.4 - 24, h: h - 32 } : { x: 16, y: 12, w: w - 32, h: h * 0.42 };
      const th = winProbabilities(p.doors);
      const values = [games ? stayWins / games : 0, games ? switchWins / games : 0];
      const labels = [ctx.t('stay'), ctx.t('switch')];
      const colorsBar = [theme.series[1]!, theme.series[0]!];
      const top = bars.y + 34;
      const bottom = bars.y + bars.h - 34;
      text(g, `${ctx.t('rate')} · ${tr('games', { n: fmt.num(games, 0) })}`, bars.x + bars.w / 2, bars.y + 12, { font: `700 13px ${theme.font}`, color: theme.muted });
      const slot = bars.w / 2;
      values.forEach((v, i) => {
        const x = bars.x + slot * i + slot * 0.2;
        const bw = slot * 0.6;
        const bh = (bottom - top) * v;
        g.fillStyle = colorsBar[i]!;
        roundRect(g, x, bottom - bh, bw, Math.max(1, bh), 6);
        g.fill();
        const ty = bottom - (bottom - top) * (i === 0 ? th.stay : th.switch);
        g.strokeStyle = theme.text;
        g.setLineDash([5, 4]);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x - 6, ty);
        g.lineTo(x + bw + 6, ty);
        g.stroke();
        g.setLineDash([]);
        text(g, games ? `${fmt.num(v * 100, 1)} %` : '–', x + bw / 2, bottom - bh - 12, { font: `800 15px ${theme.font}`, color: theme.text });
        text(g, labels[i]!, x + bw / 2, bottom + 16, { font: `700 14px ${theme.font}`, color: colorsBar[i]! });
      });
      g.strokeStyle = theme.axis;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(bars.x, bottom + 0.5);
      g.lineTo(bars.x + bars.w, bottom + 0.5);
      g.stroke();

      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(th.stay, { color: theme.series[1], width: 1.5, dash: [6, 5] });
      plot.hline(th.switch, { color: theme.series[0], width: 1.5, dash: [6, 5] });
      const n = stayHistory.length;
      if (n > 0) {
        const step = Math.max(1, Math.floor(n / Math.max(50, plot.rect.w)));
        const stayPts: [number, number][] = [];
        const switchPts: [number, number][] = [];
        for (let i = 0; i < n; i += step) {
          stayPts.push([i + 1, stayHistory[i]!]);
          switchPts.push([i + 1, switchHistory[i]!]);
        }
        stayPts.push([n, stayHistory[n - 1]!]);
        switchPts.push([n, switchHistory[n - 1]!]);
        plot.polyline(stayPts, { color: theme.series[1], width: 2.5 });
        plot.polyline(switchPts, { color: theme.series[0], width: 2.5 });
      }
      plot.end();
      if (!wide) {
        g.strokeStyle = withAlpha(theme.muted, 0.3);
        g.beginPath();
        g.moveTo(0, h * 0.45 - 4);
        g.lineTo(w, h * 0.45 - 4);
        g.stroke();
      }
    }

    clearSimulation();
    newGame();

    return {
      update(changed, source) {
        if (changed.has('doors') || (changed.has('mode') && source !== 'init')) {
          newGame();
          if (changed.has('doors') && source !== 'init') clearSimulation();
        }
        if (p.mode !== 'simulate' && auto) auto = false;
        plot.resize();
        syncActions();
        updateReadouts();
      },

      action(id) {
        switch (id) {
          case 'stay':
            decide(true);
            break;
          case 'switch':
            decide(false);
            break;
          case 'new':
            newGame();
            break;
          case 'run100':
            runGames(100);
            break;
          case 'run1000':
            runGames(1000);
            break;
          case 'auto':
            auto = !auto;
            lastFrame = performance.now();
            carry = 0;
            syncActions();
            break;
          case 'clear':
            yours.stay = { played: 0, won: 0 };
            yours.switch = { played: 0, won: 0 };
            clearSimulation();
            newGame();
            updateReadouts();
            break;
        }
      },

      render() {
        const now = performance.now();
        surface.begin();
        if (p.mode === 'simulate') {
          if (auto) {
            carry += ((now - lastFrame) / 1000) * p.speed;
            lastFrame = now;
            const m = Math.min(5000, Math.floor(carry));
            carry -= m;
            if (m > 0) runGames(m);
          }
          drawSimulation();
          if (auto) ctx.requestRender();
          return;
        }
        drawStage();
        doorRects().forEach((r, i) => drawDoor(i, r, now));
        drawMessage(now);
        const animating = openedAt.some((t0) => t0 >= 0 && now < t0 + OPEN_MS);
        if (animating) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
