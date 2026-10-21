import { describe, expect, it } from 'vitest';
import { Plot, rectsOverlap, segmentHitsRect } from '../src/sim-core/plot';
import type { Surface } from '../src/sim-core/surface';

/** Aufgezeichneter Zeichenbefehl der Attrappe. */
interface Call {
  op: 'fill' | 'stroke';
  text: string;
  x: number;
  y: number;
  font: string;
  align: string;
}

/**
 * Minimale Zeichenfläche: jedes Zeichen ist so breit wie die Schriftgröße × 0,5.
 * Zeichenbefehle für Linien werden ignoriert, Texte aufgezeichnet.
 */
function fakeSurface() {
  const calls: Call[] = [];
  const state = { font: '', textAlign: 'left', textBaseline: 'alphabetic' };
  const stack: (typeof state)[] = [];
  const noop = () => {};
  const g = new Proxy(
    {
      get font() {
        return state.font;
      },
      set font(v: string) {
        state.font = v;
      },
      get textAlign() {
        return state.textAlign;
      },
      set textAlign(v: string) {
        state.textAlign = v;
      },
      get textBaseline() {
        return state.textBaseline;
      },
      set textBaseline(v: string) {
        state.textBaseline = v;
      },
      measureText: (t: string) => ({ width: t.length * Number(/(\d+(?:\.\d+)?)px/.exec(state.font)![1]) * 0.5 }),
      fillText: (text: string, x: number, y: number) => calls.push({ op: 'fill', text, x, y, font: state.font, align: state.textAlign }),
      strokeText: (text: string, x: number, y: number) => calls.push({ op: 'stroke', text, x, y, font: state.font, align: state.textAlign }),
      save: () => stack.push({ ...state }),
      restore: () => Object.assign(state, stack.pop()),
    } as Record<string | symbol, unknown>,
    {
      get: (target, key) => (key in target ? target[key] : noop),
      set: (target, key, value) => {
        if (key === 'font' || key === 'textAlign' || key === 'textBaseline') (state as Record<string, string>)[key] = value;
        else target[key] = value;
        return true;
      },
    },
  ) as unknown as CanvasRenderingContext2D;
  const theme = {
    dark: false,
    bg: '#fff',
    grid: '#ddd',
    gridMinor: '#eee',
    axis: '#333',
    text: '#111',
    muted: '#666',
    series: ['#00f', '#f00', '#0f0', '#f80', '#80f', '#088'],
    font: 'sans',
    mathFont: 'serif',
  };
  const surface = { g, theme, lang: 'de', width: 400, height: 300, addTarget: noop, host: { requestRender: noop } } as unknown as Surface;
  return { surface, calls, state };
}

describe('Plot.text mit tiefgestelltem Index', () => {
  it('zeichnet Text ohne „_“ wie bisher in einem Stück', () => {
    const { surface, calls, state } = fakeSurface();
    const plot = new Plot(surface, { x: [0, 10], y: [0, 10], controls: false });
    plot.textPx(100, 50, 'α in °', { size: 14, align: 'right' });
    expect(calls).toEqual([
      { op: 'stroke', text: 'α in °', x: 100, y: 50, font: 'normal 14px sans', align: 'right' },
      { op: 'fill', text: 'α in °', x: 100, y: 50, font: 'normal 14px sans', align: 'right' },
    ]);
    // Ausrichtung bleibt wie bisher im Kontext gesetzt
    expect(state.textAlign).toBe('right');
  });

  it('setzt den Index tiefer und kleiner, Ausrichtung nach der Gesamtbreite', () => {
    const { surface, calls } = fakeSurface();
    const plot = new Plot(surface, { x: [0, 10], y: [0, 10], controls: false });
    plot.textPx(100, 50, 'F_R,max', { size: 20, align: 'right', halo: false });
    // „F“ 10 px, „R“ in 15 px Schrift → 7,5 px, „,max“ 40 px → gesamt 57,5 px
    expect(calls.map((c) => c.text)).toEqual(['F', 'R', ',max']);
    expect(calls[0]).toMatchObject({ x: 42.5, y: 50, font: 'normal 20px sans', align: 'left' });
    expect(calls[1]!.x).toBeCloseTo(52.5);
    expect(calls[1]!.y).toBeCloseTo(55.6);
    expect(calls[1]!.font).toBe('normal 15px sans');
    expect(calls[2]!.x).toBeCloseTo(60);
    expect(calls[2]!.y).toBe(50);
  });

  it('kennt Klammern, echte Unterstriche, Mathe-Schrift und Rand', () => {
    const { surface, calls } = fakeSurface();
    const plot = new Plot(surface, { x: [0, 10], y: [0, 10], controls: false });
    plot.textPx(0, 0, 'F_{G,1}', { size: 20, math: true });
    expect(calls.filter((c) => c.op === 'stroke').map((c) => c.text)).toEqual(['F', 'G,1']);
    expect(calls.filter((c) => c.op === 'fill').map((c) => c.text)).toEqual(['F', 'G,1']);
    expect(calls[0]!.font).toBe('italic normal 20px serif');
    calls.length = 0;
    plot.textPx(0, 0, 'datei\\_1.csv', { size: 20, halo: false });
    expect(calls.map((c) => c.text)).toEqual(['datei_1.csv']);
    calls.length = 0;
    plot.text(0, 0, 'v_0 = -3', { halo: false });
    expect(calls.map((c) => c.text)).toEqual(['v', '0', ' = −3']);
  });
});

describe('Achsbeschriftung weicht Kurven aus', () => {
  /** Zeichnet ein Diagramm 0…90 und liefert die Aufrufe, die die Achsbeschriftungen füllen. */
  function chart(draw: (plot: Plot) => void) {
    const { surface, calls } = fakeSurface();
    const plot = new Plot(surface, { x: [0, 90], y: [0, 10], equalAspect: false, pan: false, zoom: false, controls: false, xAxis: { label: 'α in °' }, yAxis: { label: 'F in N' } });
    plot.setRangePadded([0, 90], [0, 10], { left: 40, right: 16, top: 30, bottom: 22 });
    plot.begin();
    plot.axes();
    draw(plot);
    plot.end();
    const find = (text: string) => calls.find((c) => c.op === 'fill' && c.text === text)!;
    return { plot, x: find('α in °'), y: find('F in N') };
  }

  it('bleibt ohne Kurven an der gewohnten Stelle', () => {
    const { plot, x, y } = chart(() => {});
    const r = plot.rect;
    expect(x).toMatchObject({ x: r.x + r.w - 6, y: plot.py(0) - 6, align: 'right' });
    expect(y).toMatchObject({ x: plot.px(0) + 9, y: r.y + 4, align: 'left' });
  });

  it('weicht aus, wenn eine Kurve bei x_max auf der Achse endet', () => {
    const { plot, x } = chart((p) => p.fn((a) => 10 * Math.cos((a * Math.PI) / 180), { from: 0, to: 90 }));
    expect(x.y).not.toBe(plot.py(0) - 6);
  });

  it('weicht einem Punkt am Achsenende aus, nicht aber Hilfslinien', () => {
    const moved = chart((p) => p.point(88, 0.3));
    expect(moved.x.y).not.toBe(moved.plot.py(0) - 6);
    const kept = chart((p) => {
      p.vline(85);
      p.hline(0.5);
    });
    expect(kept.x.y).toBe(kept.plot.py(0) - 6);
  });

  it('weicht einem Teilstrich unter der Beschriftung aus (letzte Achsenzahl)', () => {
    // x von 0 bis 21: der Teilstrich bei 20 liegt unter „x in m“ am Achsenende
    const { surface, calls } = fakeSurface();
    const plot = new Plot(surface, { x: [0, 21], y: [0, 10], equalAspect: false, pan: false, zoom: false, controls: false, xAxis: { label: 'x in m' } });
    plot.setRangePadded([0, 21], [0, 10], { left: 40, right: 16, top: 30, bottom: 22 });
    plot.begin();
    plot.axes();
    plot.end();
    const r = plot.rect;
    const label = calls.find((c) => c.op === 'fill' && c.text === 'x in m')!;
    const width = 'x in m'.length * 13 * 0.5;
    const ticks = calls.filter((c) => c.op === 'fill' && c.align === 'center' && /^\d+$/.test(c.text)).map((c) => c.x);
    // Voraussetzung: ein Teilstrich liegt waagerecht unter der gewohnten Stelle
    expect(ticks.some((p) => p > r.x + r.w - 6 - width - 3 && p < r.x + r.w - 3)).toBe(true);
    expect(label.y).toBeLessThan(plot.py(0) - 6);
    // die Achsenzahlen bleiben alle stehen
    expect(ticks.map((p) => Math.round(p))).toContain(Math.round(plot.px(20)));
  });

  it('erkennt Schnitte von Strecke und Rechteck', () => {
    const q = { x: 10, y: 10, w: 20, h: 10 };
    expect(segmentHitsRect(0, 0, 40, 30, q)).toBe(true);
    expect(segmentHitsRect(15, 15, 16, 16, q)).toBe(true);
    expect(segmentHitsRect(0, 0, 40, 0, q)).toBe(false);
    expect(segmentHitsRect(0, 25, 5, 40, q)).toBe(false);
    expect(rectsOverlap(q, { x: 29, y: 19, w: 5, h: 5 })).toBe(true);
    expect(rectsOverlap(q, { x: 30, y: 10, w: 5, h: 5 })).toBe(false);
  });
});

describe('Sperrbereiche für Achsenzahlen', () => {
  function draw(blocked?: { x: number; y: number; w: number; h: number }[]) {
    const { surface, calls } = fakeSurface();
    const plot = new Plot(surface, { x: [-5, 5], y: [-5, 5], equalAspect: false, pan: false, zoom: false, controls: false });
    plot.setRange([-5, 5], [-5, 5]);
    plot.begin();
    plot.axes(blocked ? { blocked } : undefined);
    plot.end();
    const numbers = calls.filter((c) => c.op === 'fill' && /^[−\d]/.test(c.text)).map((c) => `${c.text}@${Math.round(c.x)},${Math.round(c.y)}`);
    return { plot, numbers };
  }

  it('zeichnet ohne Sperrbereich wie bisher', () => {
    expect(draw().numbers).toEqual(draw([]).numbers);
  });

  it('lässt Zahlen im Sperrbereich weg, die anderen bleiben', () => {
    const all = draw();
    const { plot } = all;
    // Bereich oben links neben der y-Achse: dort fallen nur die y-Zahlen über 2,5 weg
    const block = { x: plot.px(0) - 40, y: plot.py(5), w: 38, h: plot.py(2.5) - plot.py(5) };
    const some = draw([block]).numbers;
    const gone = all.numbers.filter((n) => !some.includes(n));
    const yNumbers = all.numbers.filter((n) => Number(n.split('@')[0]) > 2.5 && n.includes(`@${Math.round(plot.px(0) - 6)},`));
    expect(gone.length).toBeGreaterThan(0);
    expect(gone).toEqual(yNumbers);
    expect(some.length).toBe(all.numbers.length - gone.length);
    // x-Zahlen sperren (unterhalb der Achse rechts)
    const xs = draw([{ x: plot.px(2.5), y: plot.py(0), w: 200, h: 30 }]).numbers;
    expect(xs.some((n) => n.startsWith('3@'))).toBe(false);
    expect(xs.some((n) => n.startsWith('2@'))).toBe(true);
  });
});
