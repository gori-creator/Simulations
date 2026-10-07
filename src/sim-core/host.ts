import { isLang, type Lang } from '../i18n/config';
import { t } from '../i18n/utils';
import { registry } from '../simulations/registry';
import { Clock } from './clock';
import { Controls } from './controls';
import { exportStagePng } from './export';
import { Formatter } from './format';
import { defaultValues, sanitize, valuesEqual } from './params';
import { onThemeChange, readTheme, type Theme } from './theme';
import type { ParamDef, ParamValue, ParamValues, ReadoutValue, SimContext, SimInstance, SimulationDefinition } from './types';
import { decodeState, encodeState, type ShareFlags } from './url-state';

/**
 * Verbindet eine Simulation mit der Seite: Regler, Ergebnisse, Beispiele,
 * Abspielen, Teilen (Link + QR-Code), Vollbild, Bildexport und die
 * Speicherung des Zustands in der Adresse.
 *
 * Die zugehörige HTML-Struktur kommt aus components/SimulationShell.astro.
 */
export async function mountSimulation(root: HTMLElement): Promise<void> {
  const id = root.dataset.simId ?? '';
  const lang: Lang = isLang(root.dataset.lang) ? root.dataset.lang : 'de';
  const status = root.querySelector<HTMLElement>('[data-sim-status]');
  try {
    const loader = registry[id];
    if (!loader) throw new Error(`Keine Umsetzung für Simulation "${id}" registriert.`);
    const definition = await loader();
    new SimulationHost(root, definition, lang).start();
    status?.remove();
  } catch (error) {
    console.error(error);
    if (status) {
      status.textContent = t(lang, 'sim.loadError');
      status.classList.add('sim__status--error');
    }
  }
}

interface ReadoutRow {
  root: HTMLElement;
  value: HTMLElement;
  reveal?: HTMLButtonElement;
  last?: string;
  spoiler: boolean;
}

class SimulationHost {
  private readonly defs: readonly ParamDef[];
  private readonly defsByKey: Map<string, ParamDef>;
  private values: ParamValues;
  private flags: ShareFlags;
  private locked: boolean;
  private theme: Theme;
  private readonly fmt: Formatter;
  private readonly clock = new Clock();
  private readonly stage: HTMLElement;
  private instance: SimInstance | null = null;
  private controls: Controls | null = null;
  private readouts = new Map<string, ReadoutRow>();
  private revealed = new Set<string>();
  private pending = new Set<string>();
  private flushScheduled = false;
  private flushing = false;
  private frame = 0;
  private lastTime: number | null = null;
  private urlTimer = 0;

  constructor(
    private readonly root: HTMLElement,
    private readonly def: SimulationDefinition,
    private readonly lang: Lang,
  ) {
    this.defs = def.params;
    this.defsByKey = new Map(this.defs.map((d) => [d.key, d]));
    const state = decodeState(this.defs, location.search);
    this.values = state.values;
    this.flags = state.flags;
    this.locked = state.flags.lock;
    this.fmt = new Formatter(lang);
    this.theme = readTheme(root);
    this.stage = this.query('[data-sim-stage]');
  }

  start(): void {
    const { def, root } = this;
    if (def.layout?.aspect) root.style.setProperty('--sim-aspect', String(def.layout.aspect));
    if (def.layout?.aspectNarrow) root.style.setProperty('--sim-aspect-narrow', String(def.layout.aspectNarrow));

    this.buildControls();
    this.buildReadouts();
    this.buildPresets();
    this.bindToolbar();
    this.bindShare();
    this.bindMaterialLinks();
    this.applyLock();

    this.instance = def.mount(this.createContext());
    this.instance.update?.(new Set(this.defs.map((d) => d.key)));
    this.controls?.sync(this.values);
    this.requestRender();

    onThemeChange(() => {
      this.theme = readTheme(root);
      this.requestRender();
    });
    this.clock.onChange((playing) => {
      this.updatePlayButton(playing);
      this.lastTime = null;
      if (playing) this.requestRender();
    });
    root.classList.add('sim--ready');
  }

  /* ---------- Kontext für die Simulation ---------- */

  private createContext(): SimContext<ParamValues> {
    const host = this;
    const strings = this.def.strings;
    return {
      stage: this.stage,
      lang: this.lang,
      get params() {
        return host.values;
      },
      get locked() {
        return host.locked;
      },
      get theme() {
        return host.theme;
      },
      fmt: this.fmt,
      clock: this.clock,
      set: (values) => this.set(values),
      readout: (key, value) => this.readout(key, value),
      t: (key) => strings?.[this.lang]?.[key] ?? strings?.de?.[key] ?? key,
      requestRender: () => this.requestRender(),
    };
  }

  private set(values: Partial<ParamValues>): void {
    for (const [key, raw] of Object.entries(values)) {
      const def = this.defsByKey.get(key);
      if (!def || raw === undefined) continue;
      const value = sanitize(def, raw);
      if (valuesEqual(this.values[key]!, value)) continue;
      this.values[key] = value;
      this.pending.add(key);
    }
    if (this.pending.size) this.scheduleFlush();
  }

  private replaceAll(values: ParamValues): void {
    this.set(values);
  }

  private scheduleFlush(): void {
    if (this.flushScheduled || this.flushing) return;
    this.flushScheduled = true;
    queueMicrotask(() => this.flush());
  }

  private flush(): void {
    this.flushScheduled = false;
    this.flushing = true;
    let guard = 0;
    while (this.pending.size && guard++ < 10) {
      const changed = new Set(this.pending);
      this.pending.clear();
      this.instance?.update?.(changed);
    }
    this.flushing = false;
    this.controls?.sync(this.values);
    this.scheduleUrlUpdate();
    this.requestRender();
  }

  /* ---------- Zeichnen und Animation ---------- */

  private requestRender(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame((now) => this.loop(now));
  }

  private loop(now: number): void {
    this.frame = 0;
    if (this.clock.playing && this.instance?.tick) {
      const dt = this.lastTime === null ? 0 : Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      const simDt = dt * this.clock.speed;
      this.clock.time += simDt;
      this.instance.tick(simDt);
      if (this.pending.size) this.flush();
    }
    this.instance?.render();
    if (this.clock.playing) this.requestRender();
  }

  /* ---------- Regler ---------- */

  private buildControls(): void {
    const container = this.query('[data-sim-controls]');
    this.controls = new Controls({
      container,
      lang: this.lang,
      defs: this.defs,
      groups: this.def.groups,
      idPrefix: `sim-${this.def.id}`,
      onInput: (key: string, value: ParamValue) => this.set({ [key]: value }),
    });
  }

  private buildPresets(): void {
    const presets = this.def.presets ?? [];
    if (!presets.length) return;
    const wrap = this.query('[data-sim-presets]');
    const list = this.query('[data-sim-preset-list]');
    for (const preset of presets) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      button.textContent = preset.label[this.lang];
      button.addEventListener('click', () => {
        if (this.locked) return;
        this.replaceAll({ ...defaultValues(this.defs), ...(preset.values as ParamValues) });
      });
      list.append(button);
    }
    wrap.hidden = false;
  }

  private applyLock(): void {
    this.controls?.setDisabled(this.locked);
    this.root.classList.toggle('sim--locked', this.locked);
    const banner = this.root.querySelector<HTMLElement>('[data-sim-lock]');
    if (banner) banner.hidden = !this.locked;
    for (const chip of this.root.querySelectorAll<HTMLButtonElement>('[data-sim-preset-list] .chip')) chip.disabled = this.locked;
    this.requestRender();
  }

  /* ---------- Ergebnisse ---------- */

  private buildReadouts(): void {
    const defs = this.def.readouts ?? [];
    if (!defs.length) return;
    const list = this.query('[data-sim-readouts]');
    for (const def of defs) {
      const row = document.createElement('div');
      row.className = 'readout';
      row.hidden = true;
      const dt = document.createElement('dt');
      dt.textContent = def.label[this.lang];
      const dd = document.createElement('dd');
      const value = document.createElement('span');
      value.className = 'readout__value';
      dd.append(value);
      const entry: ReadoutRow = { root: row, value, spoiler: !!def.spoiler };
      if (def.spoiler) {
        const reveal = document.createElement('button');
        reveal.type = 'button';
        reveal.className = 'readout__reveal';
        reveal.textContent = t(this.lang, 'sim.reveal');
        reveal.addEventListener('click', () => {
          this.revealed.add(def.key);
          this.applyHide();
        });
        dd.append(reveal);
        entry.reveal = reveal;
      }
      row.append(dt, dd);
      list.append(row);
      this.readouts.set(def.key, entry);
    }
    this.query('[data-sim-readouts-wrap]').hidden = false;
    this.applyHide();
  }

  /** Verdeckt „spoiler“-Ergebnisse, solange der Aufgabenmodus aktiv ist. */
  private applyHide(): void {
    for (const [key, row] of this.readouts) {
      if (!row.reveal) continue;
      const hidden = this.flags.hide && !this.revealed.has(key);
      row.value.hidden = hidden;
      row.reveal.hidden = !hidden;
    }
  }

  private readout(key: string, value: ReadoutValue): void {
    const row = this.readouts.get(key);
    if (!row) return;
    if (value === null) {
      row.root.hidden = true;
      return;
    }
    row.root.hidden = false;
    const text = typeof value === 'string' ? `t:${value}` : `h:${value.html}`;
    if (text === row.last) return;
    row.last = text;
    if (typeof value === 'string') row.value.textContent = value;
    else row.value.innerHTML = value.html;
  }

  /* ---------- Werkzeugleiste ---------- */

  private bindToolbar(): void {
    const on = (action: string, handler: () => void) => {
      for (const el of this.root.querySelectorAll<HTMLButtonElement>(`[data-action="${action}"]`)) {
        el.addEventListener('click', handler);
      }
    };
    if (this.def.animated) this.query('[data-sim-anim]').hidden = false;
    if (this.def.dragHint) this.query('[data-sim-hint]').hidden = false;

    on('play', () => this.clock.toggle());
    on('reset-time', () => {
      this.clock.reset();
      this.instance?.resetTime?.();
      this.requestRender();
    });
    on('reset', () => {
      if (this.locked) return;
      this.clock.pause();
      this.clock.reset();
      this.instance?.resetTime?.();
      this.instance?.resetView?.();
      this.replaceAll(defaultValues(this.defs));
      this.requestRender();
    });
    on('unlock', () => {
      this.locked = false;
      this.flags = { ...this.flags, lock: false };
      this.applyLock();
      this.scheduleUrlUpdate();
    });
    on('image', () => {
      void exportStagePng(this.stage, `${this.def.id}.png`, this.theme.bg);
    });
    on('fullscreen', () => this.toggleFullscreen());

    document.addEventListener('fullscreenchange', () => {
      const active = document.fullscreenElement === this.root;
      this.root.classList.toggle('sim--fullscreen', active);
      this.updateFullscreenButton(active);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.root.classList.contains('sim--maximized')) this.toggleMaximized(false);
    });
  }

  private updatePlayButton(playing: boolean): void {
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="play"]');
    if (!button) return;
    button.setAttribute('aria-pressed', String(playing));
    const label = button.querySelector('[data-label]');
    if (label) label.textContent = t(this.lang, playing ? 'sim.pause' : 'sim.play');
    button.classList.toggle('is-playing', playing);
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (this.root.classList.contains('sim--maximized')) {
      this.toggleMaximized(false);
    } else if (this.root.requestFullscreen && document.fullscreenEnabled) {
      this.root.requestFullscreen().catch(() => this.toggleMaximized(true));
    } else {
      this.toggleMaximized(true);
    }
  }

  /** Ersatz für Geräte ohne Fullscreen-API (z. B. iPhone): Simulation füllt das Fenster. */
  private toggleMaximized(on: boolean): void {
    this.root.classList.toggle('sim--maximized', on);
    this.root.classList.toggle('sim--fullscreen', on);
    document.documentElement.classList.toggle('has-maximized-sim', on);
    this.updateFullscreenButton(on);
  }

  private updateFullscreenButton(active: boolean): void {
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
    if (!button) return;
    const label = t(this.lang, active ? 'sim.exitFullscreen' : 'sim.fullscreen');
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(active));
  }

  /* ---------- Teilen ---------- */

  private shareUrl(flags: ShareFlags): string {
    const query = encodeState(this.defs, this.values, flags);
    return `${location.origin}${location.pathname}${query ? `?${query}` : ''}`;
  }

  private bindShare(): void {
    const dialog = this.root.querySelector<HTMLDialogElement>('[data-sim-share]');
    if (!dialog) return;
    const lock = dialog.querySelector<HTMLInputElement>('[data-share-lock]')!;
    const hide = dialog.querySelector<HTMLInputElement>('[data-share-hide]')!;
    const url = dialog.querySelector<HTMLInputElement>('[data-share-url]')!;
    const copy = dialog.querySelector<HTMLButtonElement>('[data-share-copy]')!;
    const qr = dialog.querySelector<HTMLElement>('[data-share-qr]')!;
    const large = dialog.querySelector<HTMLButtonElement>('[data-share-qr-large]')!;
    const overlay = this.root.querySelector<HTMLElement>('[data-qr-overlay]')!;
    const hasSpoilers = (this.def.readouts ?? []).some((r) => r.spoiler);
    const hideRow = hide.closest<HTMLElement>('.share__option');
    if (hideRow) hideRow.hidden = !hasSpoilers;

    // Der QR-Code-Generator wird erst beim ersten Teilen geladen.
    const loadQr = () => import('./qr').then((m) => m.qrSvg);
    const refresh = () => {
      const link = this.shareUrl({ lock: lock.checked, hide: hide.checked && hasSpoilers });
      url.value = link;
      void loadQr().then((qrSvg) => {
        if (url.value === link) qr.innerHTML = qrSvg(link, { title: t(this.lang, 'share.qr') });
      });
      return link;
    };

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="share"]')) {
      button.addEventListener('click', () => {
        refresh();
        dialog.showModal();
        url.select();
      });
    }
    lock.addEventListener('change', refresh);
    hide.addEventListener('change', refresh);
    copy.addEventListener('click', async () => {
      const link = refresh();
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        // Ohne Zwischenablage-Recht: Link markieren, damit er mit Strg+C kopiert werden kann.
        url.select();
        return;
      }
      const label = copy.querySelector('[data-label]') ?? copy;
      label.textContent = t(this.lang, 'share.copied');
      setTimeout(() => (label.textContent = t(this.lang, 'share.copy')), 1800);
    });
    large.addEventListener('click', async () => {
      const link = refresh();
      const qrSvg = await loadQr();
      overlay.querySelector<HTMLElement>('[data-qr-large]')!.innerHTML = qrSvg(link);
      overlay.querySelector<HTMLElement>('[data-qr-url]')!.textContent = link;
      dialog.close();
      overlay.hidden = false;
      overlay.focus();
    });
    const closeOverlay = () => {
      overlay.hidden = true;
    };
    overlay.addEventListener('click', closeOverlay);
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') closeOverlay();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  /* ---------- Adresse (URL) ---------- */

  private scheduleUrlUpdate(): void {
    clearTimeout(this.urlTimer);
    this.urlTimer = window.setTimeout(() => {
      const query = encodeState(this.defs, this.values, { lock: this.locked, hide: this.flags.hide });
      const next = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
      if (next !== `${location.pathname}${location.search}${location.hash}`) {
        history.replaceState(history.state, '', next);
      }
    }, 250);
  }

  /** Links im Lernmaterial wie `[Beispiel](?m=2&b=1)` laden den Zustand ohne Neuladen. */
  private bindMaterialLinks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as Element | null;
      const link = target?.closest<HTMLAnchorElement>('[data-sim-material] a[href^="?"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      const state = decodeState(this.defs, link.getAttribute('href') ?? '');
      // Steuerparameter des Links übernehmen (z. B. _hide=1 für Ableseaufgaben)
      this.flags = state.flags;
      this.locked = state.flags.lock;
      this.revealed.clear();
      this.applyLock();
      this.applyHide();
      this.replaceAll(state.values);
      this.scheduleUrlUpdate();
      this.root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  }

  private query<T extends HTMLElement = HTMLElement>(selector: string): T {
    const el = this.root.querySelector<T>(selector);
    if (!el) throw new Error(`Element ${selector} fehlt in der Simulations-Hülle.`);
    return el;
  }
}
