/**
 * Farben für das Zeichnen auf Canvas. Sie stammen aus CSS-Variablen
 * (siehe styles/global.css) und passen sich so automatisch an Hell/Dunkel an.
 */
export interface Theme {
  dark: boolean;
  bg: string;
  grid: string;
  gridMinor: string;
  axis: string;
  text: string;
  muted: string;
  /** Reihenfarben: 0 blau, 1 rot, 2 grün, 3 orange, 4 lila, 5 türkis. */
  series: string[];
  font: string;
  mathFont: string;
}

const FALLBACK: Theme = {
  dark: false,
  bg: '#ffffff',
  grid: '#d9dee7',
  gridMinor: '#eef1f5',
  axis: '#3b4554',
  text: '#1b2330',
  muted: '#5a6577',
  series: ['#2563eb', '#d6336c', '#2f9e44', '#e8590c', '#7048e8', '#0c8599'],
  font: 'system-ui, sans-serif',
  mathFont: '"KaTeX_Math", "Cambria Math", "Times New Roman", serif',
};

export function readTheme(element: Element = document.documentElement): Theme {
  if (typeof getComputedStyle === 'undefined') return FALLBACK;
  const style = getComputedStyle(element);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    dark: read('--plot-scheme', 'light') === 'dark',
    bg: read('--plot-bg', FALLBACK.bg),
    grid: read('--plot-grid', FALLBACK.grid),
    gridMinor: read('--plot-grid-minor', FALLBACK.gridMinor),
    axis: read('--plot-axis', FALLBACK.axis),
    text: read('--plot-text', FALLBACK.text),
    muted: read('--plot-muted', FALLBACK.muted),
    series: FALLBACK.series.map((c, i) => read(`--series-${i + 1}`, c)),
    font: read('--font-sans', FALLBACK.font),
    mathFont: FALLBACK.mathFont,
  };
}

/** Ruft `callback` auf, wenn zwischen hell und dunkel gewechselt wird. */
export function onThemeChange(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  return () => {
    observer.disconnect();
    media.removeEventListener('change', callback);
  };
}
