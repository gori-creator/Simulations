/**
 * Startseite: die Achterbahn im dunkelblauen Bereich.
 *
 * Bettet die vorhandene Simulation „Energieerhaltung“ ein (Modell, Grafik,
 * Bilder und Ziehbedienung unverändert, geladen über die Registry) – ohne den
 * Host der Simulationsseite, mit eigenen Bedienelementen im Entwurf von
 * docs/design/coin-reise-v13/stage.ts. Die Simulation wird erst geladen und
 * gezeichnet, wenn die Bühne in Sichtweite kommt; außerhalb des Bildes, in
 * Hintergrund-Tabs und bei pausierter Bewegung läuft keine Schleife.
 */
import {
  Clock,
  defaultValues,
  Formatter,
  ImageStore,
  KeyTargetLayer,
  onThemeChange,
  readTheme,
  sanitize,
  type ParamValues,
  type SimContext,
  type SimInstance,
  type SimulationDefinition,
  type UpdateSource,
} from '../../sim-core';
import { registry } from '../../simulations/registry';
import type { Lang } from '../../i18n/config';
import { motion } from './motion';
import type { Journey } from './sculpture';

/** Regler auf der Startseite und ihre Nachkommastellen bzw. Einheit in der Anzeige. */
const SLIDERS = { h0: [1, ' m'], mu: [3, ''], m: [0, ' kg'], p1: [1, ' m'], p2: [1, ' m'], p3: [1, ' m'], p4: [1, ' m'] } as const;
type SliderKey = keyof typeof SLIDERS;
/** Änderungen an Bahn, Höhe oder Reibung setzen die Fahrt zurück (wie auf der Simulationsseite). */
const RESETS = new Set(['track', 'h0', 'mu', 'p1', 'p2', 'p3', 'p4']);
/** Parameter, die der Link zur vollständigen Simulation mitnimmt. */
const LINK_KEYS = ['track', 'h0', 'mu', 'm', 'p1', 'p2', 'p3', 'p4', 'slow'];

export interface EnergyStageOptions {
  root: HTMLElement;
  lang: Lang;
  journey: Journey | null;
}

export function initEnergyStage({ root, lang, journey }: EnergyStageOptions): () => void {
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const stage = q<HTMLElement>('[data-energy-stage]');
  const play = q<HTMLButtonElement>('[data-energy-play]');
  const reset = q<HTMLButtonElement>('[data-energy-reset]');
  const custom = q<HTMLElement>('[data-energy-custom]');
  const hint = q<HTMLElement>('[data-energy-hint]');
  const link = q<HTMLAnchorElement>('[data-energy-link]');
  const slow = q<HTMLInputElement>('[data-energy-slow]');
  const tracks = [...root.querySelectorAll<HTMLButtonElement>('[data-track]')];
  const text = (key: string) => root.dataset[key] ?? '';

  const clock = new Clock();
  const fmt = new Formatter(lang);
  const readouts: Record<string, unknown> = {};
  let definition: SimulationDefinition | null = null;
  let values: ParamValues = {};
  let instance: SimInstance | undefined;
  let images: ImageStore | null = null;
  let keys: KeyTargetLayer | null = null;
  let frame = 0, last = 0, visible = false;
  // Farben nur bei Wechsel hell/dunkel neu lesen – getComputedStyle bei jedem Zugriff bremst (Dutzende Male je Bild)
  let theme = readTheme(stage);
  let wanted = false, started = false, interacted = false, autoStarted = false, loading: Promise<void> | null = null, destroyed = false;
  const paused = () => motion.paused || motion.reduced;

  const requestRender = () => {
    if (!frame && visible && !document.hidden && !paused()) frame = requestAnimationFrame(loop);
  };
  const forceRender = () => {
    if (instance && visible && !document.hidden) instance.render();
    requestRender();
  };

  function syncButton(): void {
    play.textContent = clock.playing ? text('pause') : started ? text('continue') : text('go');
    play.setAttribute('aria-pressed', String(clock.playing));
    // Während der Fahrt ruhen die Hintergrund-Effekte (home.css)
    root.classList.toggle('is-running', clock.playing);
  }

  function syncControls(): void {
    for (const [key, [digits, unit]] of Object.entries(SLIDERS) as [SliderKey, (typeof SLIDERS)[SliderKey]][]) {
      const input = root.querySelector<HTMLInputElement>(`[data-param="${key}"]`);
      const output = root.querySelector<HTMLOutputElement>(`[data-output="${key}"]`);
      if (input) input.value = String(values[key]);
      if (output) output.textContent = fmt.fixed(Number(values[key]), digits) + unit;
    }
    slow.checked = !!values.slow;
    for (const button of tracks) button.setAttribute('aria-pressed', String(button.dataset.track === values.track));
    custom.hidden = values.track !== 'eigen';
    hint.textContent = values.track === 'eigen' ? text('hintCustom') : text('hint');
    // Der Link öffnet die vollständige Simulation mit denselben Einstellungen (Basis-Pfad steckt schon im href).
    const target = new URL(link.dataset.href ?? link.href, location.href);
    for (const key of LINK_KEYS) target.searchParams.set(key, String(values[key]));
    link.href = target.pathname + target.search;
    syncButton();
    journey?.refresh();
  }

  function set(next: Partial<ParamValues>, source: UpdateSource = 'input'): void {
    if (!definition) return;
    interacted = true;
    const changed = new Set<string>();
    for (const [key, value] of Object.entries(next)) {
      const def = definition.params.find((p) => p.key === key);
      if (!def || value === undefined) continue;
      const clean = sanitize(def, value);
      if (values[key] !== clean) {
        values[key] = clean;
        changed.add(key);
      }
    }
    if (!changed.size) return;
    instance?.update?.(changed, source);
    if ([...changed].some((k) => RESETS.has(k))) {
      wanted = false;
      started = false;
      clock.pause();
    }
    syncControls();
    forceRender();
  }

  function createContext(def: SimulationDefinition, store: ImageStore, layer: KeyTargetLayer): SimContext<ParamValues> {
    return {
      stage,
      lang,
      get params() {
        return values;
      },
      locked: false,
      get theme() {
        return theme;
      },
      fmt,
      clock,
      images: store,
      hidden: false,
      isHidden: () => false,
      taskMode: false,
      isHiddenByTask: () => false,
      setKeyTargets: (targets) => layer.setTargets(targets),
      setViewKeys: (view) => layer.setView(view),
      get keyFocus() {
        return layer.selectedId;
      },
      set: (next) => set(next, 'sim'),
      readout: (key, value) => {
        readouts[key] = value;
      },
      announce: () => {},
      t: (key) => def.strings?.[lang]?.[key] ?? def.strings?.de?.[key] ?? key,
      setAction: () => {},
      requestRender,
    };
  }

  /** Simulation laden (eigene JavaScript-Datei) und in die Bühne setzen. */
  function mount(): Promise<void> {
    loading ??= (registry.energieerhaltung ? registry.energieerhaltung() : Promise.reject(new Error('energieerhaltung fehlt'))).then((def) => {
      if (destroyed) return;
      definition = def;
      values = { ...defaultValues(def.params), track: 'mega' };
      stage.querySelector('[data-energy-loading]')?.remove();
      keys = new KeyTargetLayer(stage, text('keys'), () => forceRender());
      images = new ImageStore('energieerhaltung', def.images ?? {}, forceRender);
      instance = def.mount(createContext(def, images, keys));
      instance.update?.(new Set(Object.keys(values)), 'init');
      root.classList.add('is-ready');
      syncControls();
      forceRender();
      playback();
      maybeAutoStart();
    });
    return loading;
  }

  function playback(): void {
    if (wanted && visible && !document.hidden && !paused()) clock.play();
    else clock.pause();
    last = 0;
    syncButton();
    requestRender();
  }

  function loop(now: number): void {
    frame = 0;
    if (!instance || !visible || document.hidden || paused()) return;
    if (clock.playing) {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      clock.time += dt;
      instance.tick?.(dt);
      if (!clock.playing) {
        wanted = false;
        started = false;
        syncButton();
      }
    }
    last = now;
    instance.render();
    if (clock.playing) requestRender();
  }

  function start(manual: boolean): void {
    if (manual) {
      interacted = true;
      if (motion.paused) motion.set(false);
    }
    void mount().then(() => {
      if (!instance) return;
      if (!started) instance.action?.('start');
      started = true;
      wanted = true;
      playback();
      if (manual && !visible) stage.scrollIntoView({ block: 'nearest', behavior: motion.reduced ? 'instant' : 'smooth' });
    });
  }

  /** Kommt die Münze an, fährt der Wagen einmal von selbst los – nur ohne vorherige Bedienung und mit Bewegung. */
  function maybeAutoStart(): void {
    if (visible && instance && !autoStarted && !interacted && !paused() && journey?.arrived) {
      autoStarted = true;
      start(false);
    }
  }

  let visibilityFrame = 0;
  function refreshVisibility(): void {
    visibilityFrame = 0;
    const rect = stage.getBoundingClientRect();
    const next = rect.width > 0 && rect.height > 0 && rect.bottom > -60 && rect.top < innerHeight + 60;
    if (next === visible && instance) return;
    visible = next;
    if (visible) void mount();
    playback();
    maybeAutoStart();
  }
  const scheduleVisibility = () => {
    if (!visibilityFrame) visibilityFrame = requestAnimationFrame(refreshVisibility);
  };

  const observer = new IntersectionObserver(scheduleVisibility, { rootMargin: '60px 0px', threshold: 0 });
  observer.observe(stage);
  const listeners: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [];
  const on = (target: EventTarget, type: string, listener: EventListener, options?: AddEventListenerOptions) => {
    target.addEventListener(type, listener, options);
    listeners.push([target, type, listener, options]);
  };
  on(window, 'scroll', scheduleVisibility, { passive: true });
  on(window, 'resize', scheduleVisibility);
  for (const key of Object.keys(SLIDERS)) {
    const input = root.querySelector<HTMLInputElement>(`[data-param="${key}"]`);
    if (input) on(input, 'input', () => set({ [key]: Number(input.value) }));
  }
  for (const button of tracks) on(button, 'click', () => set({ track: button.dataset.track ?? 'huegel' }));
  on(slow, 'change', () => set({ slow: slow.checked }));
  on(play, 'click', () => {
    if (clock.playing) {
      interacted = true;
      wanted = false;
      playback();
    } else start(true);
  });
  on(reset, 'click', () => {
    interacted = true;
    wanted = false;
    started = false;
    clock.pause();
    instance?.resetTime?.();
    syncButton();
    forceRender();
  });
  on(document, 'visibilitychange', playback);
  on(window, 'pageshow', () => {
    refreshVisibility();
    playback();
    forceRender();
  });
  on(window, 'pagehide', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    clock.pause();
  });
  const unArrival = journey?.onArrival(maybeAutoStart);
  const unTheme = onThemeChange(() => {
    theme = readTheme(stage);
    forceRender();
  });
  const unMotion = motion.subscribe(playback);
  const unReduced = motion.onReducedChange(() => {
    wanted = false;
    playback();
  });
  syncButton();
  scheduleVisibility();

  return () => {
    destroyed = true;
    cancelAnimationFrame(frame);
    cancelAnimationFrame(visibilityFrame);
    clock.pause();
    observer.disconnect();
    for (const [target, type, listener, options] of listeners) target.removeEventListener(type, listener, options);
    unArrival?.();
    unTheme();
    unMotion();
    unReduced();
    instance?.destroy?.();
  };
}
