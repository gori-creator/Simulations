import { clamp, defineSimulation, ease, mixColor, offscreenCanvas, prefersReducedMotion, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  arrivals,
  C_AIR,
  firstArrival,
  isBoom,
  machAngle,
  mainArrival,
  observerPos,
  ringPeriods,
  sampleFrequency,
  sourcePos,
  wavefronts,
  wavelengthAhead,
  wavelengthBehind,
  WORLD_WIDTH,
  type Motion,
  type Sample,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Ab dieser Geschwindigkeit wird statt des Krankenwagens ein Flugzeug gezeichnet (m/s). */
const JET_FROM = 60;
/** Angestrebte Dauer einer Vorbeifahrt in echten Sekunden (daraus folgt die automatische Zeitlupe). */
const PASS_SECONDS = 7;
/** Zahl der Stützstellen für den Verlauf f_B(t). */
const SAMPLES = 480;

interface Layout {
  scene: Rect;
  chart: Rect;
  card: Rect;
  tall: boolean;
}

interface SceneGeo {
  r: Rect;
  sm: boolean;
  /** Pixel pro Meter. */
  k: number;
  /** Bildmitte (x = 0) und Straßenmitte (y = 0) in Pixeln. */
  cx: number;
  roadY: number;
  /** halbe Straßenbreite in Pixeln. */
  rh: number;
}

/** Zustand, aus dem weich übergeblendet wird. */
interface Snap {
  m: Motion;
  t: number;
  N: number;
  src: [number, number];
  obs: [number, number];
  ghost: Sample[];
  jet: number;
}

/**
 * Doppler-Effekt in der Draufsicht: Ein Krankenwagen (bei hoher Geschwindigkeit
 * ein Flugzeug) fährt mit v_Q vorbei und sendet Wellenfronten aus, ein ziehbarer
 * Beobachter steht am Straßenrand oder bewegt sich selbst. Verlauf f_B(t) mit
 * Vorhersage, Wellenlängen vorn/hinten, Schallmauer und Machscher Kegel,
 * Zeitlupe und optional ein leiser Ton, der beim Vorbeifahren gleitet.
 */
export default defineSimulation({
  id: 'doppler-effekt',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.25, aspectNarrow: 0.56 },
  images: { road: 'strasse.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'f', type: 'number', label: L('Frequenz der Quelle f_Q', 'Source frequency f_Q'), min: 200, max: 1000, step: 10, default: 440, unit: 'Hz' },
    {
      key: 'vq',
      type: 'number',
      label: L('Geschwindigkeit der Quelle v_Q', 'Source speed v_Q'),
      help: L('34 m/s ≈ 122 km/h. Ab c = 340 m/s ist die Quelle schneller als ihr Schall.', '34 m/s ≈ 122 km/h. From c = 340 m/s on the source is faster than its sound.'),
      min: 0,
      max: 700,
      step: 1,
      default: 34,
      unit: 'm/s',
    },
    {
      key: 'vb',
      type: 'number',
      label: L('Geschwindigkeit des Beobachters v_B', 'Observer speed v_B'),
      help: L('Positiv: Der Beobachter läuft der heranfahrenden Quelle entgegen (nach links), negativ: von ihr weg.', 'Positive: the observer moves towards the approaching source (to the left), negative: away from it.'),
      min: -40,
      max: 40,
      step: 1,
      default: 0,
      unit: 'm/s',
    },
    {
      key: 'd',
      type: 'number',
      label: L('Abstand des Beobachters zur Straße d', 'Observer’s distance to the road d'),
      help: L('Oder: den Beobachter im Bild ziehen.', 'Or drag the observer in the picture.'),
      min: 6,
      max: 40,
      step: 1,
      default: 20,
      unit: 'm',
    },
    { key: 'bx', type: 'number', label: L('Standort des Beobachters x_B', 'Observer position x_B'), help: L('Lage längs der Straße zu Beginn (0 m = Bildmitte).', 'Position along the road at the start (0 m = centre of the picture).'), min: -110, max: 110, step: 1, default: 40, unit: 'm' },
    { key: 'slow', type: 'boolean', label: L('Zeitlupe', 'Slow motion'), default: false },
    { key: 'lam', type: 'boolean', group: 'view', label: L('Wellenlängen vorn und hinten messen', 'Measure the wavelengths ahead and behind'), default: true },
    { key: 'ghost', type: 'boolean', group: 'view', label: L('Ganzen Verlauf f_B(t) vorhersagen', 'Predict the whole graph f_B(t)'), default: true },
    { key: 'val', type: 'boolean', group: 'view', label: L('Frequenzen im Bild anzeigen', 'Show frequencies in the picture'), default: true },
  ],
  actions: [
    { id: 'go', label: L('Neu starten', 'Restart'), primary: true },
    { id: 'snd', label: L('Ton anhören', 'Play sound') },
  ],
  readouts: [
    { key: 'fb', label: L('Frequenz beim Beobachter', 'Frequency at the observer'), spoiler: true },
    { key: 'lam', label: L('Wellenlängen', 'Wavelengths'), spoiler: true },
    { key: 'mach', label: L('Machzahl', 'Mach number'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now'), spoiler: true },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'start', label: L('Krankenwagen fährt vorbei', 'An ambulance drives past'), values: {} },
    { id: 'near', label: L('Direkt an der Straße: Sprung', 'Right next to the road: a jump'), values: { d: 6, bx: 20 } },
    { id: 'obs', label: L('Beobachter läuft auf ruhende Quelle zu', 'Observer moves towards a source at rest'), values: { vq: 0, vb: 34, d: 6, bx: 110 } },
    { id: 'both', label: L('Beide bewegen sich aufeinander zu', 'Both move towards each other'), values: { vb: 34, d: 6, bx: 100 } },
    { id: 'mach1', label: L('Schallmauer: v_Q = c', 'Sound barrier: v_Q = c'), values: { vq: 340, lam: false } },
    { id: 'mach2', label: L('Überschall: Mach 2', 'Supersonic: Mach 2'), values: { vq: 680, d: 30, bx: 0 } },
  ],
  strings: {
    de: {
      canvas:
        'Draufsicht auf eine Straße: Ein Krankenwagen mit Blaulicht fährt vorbei und sendet kreisförmige Wellenfronten aus, die vorn dichter und hinten weiter auseinander liegen; ein ziehbarer Beobachter am Straßenrand; darunter der Verlauf der gehörten Frequenz f_B(t) und eine Anzeige der Frequenz beim Beobachter',
      axisT: 't in s',
      chipF: 'gehörte Frequenz f_[B] in Hz',
      chipFS: 'f_[B] in Hz',
      tPill: 't = {t} s',
      slowPill: 'Zeitlupe: {k}× langsamer',
      slowPillS: '{k}× langsamer',
      machPill: 'c = 340 m/s · Ma = {m}',
      machPillS: 'Ma = {m}',
      rings: 'Ringe: nur jede {n}. Wellenfront',
      ringsOne: 'Ringe: jede Wellenfront',
      ringsS: 'jede {n}. Front',
      lamV: '{n} λ_[v]',
      lamVv: '{n} λ_[v] = {l} m',
      lamH: '{n} λ_[h]',
      lamHv: '{n} λ_[h] = {l} m',
      lam1V: 'λ_[v]',
      lam1Vv: 'λ_[v] = {l} m',
      lam1H: 'λ_[h]',
      lam1Hv: 'λ_[h] = {l} m',
      vQ: 'v_[Q] = {v} m/s',
      vB: 'v_[B] = {v} m/s',
      observer: 'Beobachter',
      cone: 'Machscher Kegel',
      alpha: 'α = {a}°',
      barrier: 'Schallmauer',
      noAhead: 'kein Schall voraus',
      boom: 'Überschallknall!',
      cardTitle: 'Beim Beobachter',
      silent: 'Stille',
      silentSub: 'Der Schall ist noch unterwegs.',
      silentSubS: 'Die Quelle ist schneller als ihr Schall.',
      higher: '+{d} Hz · höher als f_[Q]',
      lower: '−{d} Hz · tiefer als f_[Q]',
      same: 'genau f_[Q]',
      hidden: '? Hz',
      hiddenSub: 'Wert ausgeblendet',
      second: '+ rückwärts: {f} Hz',
      radial: 'v_[Q,r] = {q} m/s · v_[B,r] = {b} m/s',
      fQ: 'f_[Q]',
      fV: 'f_[v]',
      fH: 'f_[h]',
      silence: 'Stille',
      boomShort: 'Knall',
      rev: 'rückwärts',
      unitM: '{s} m',
      fbText:
        '<var>f</var><sub>B</sub> = <var>f</var><sub>Q</sub> · <span class="frac"><span><var>c</var> + <var>v</var><sub>B,r</sub></span><span><var>c</var> − <var>v</var><sub>Q,r</sub></span></span> = {f} Hz · <span class="frac"><span>{c} m/s + {b} m/s</span><span>{c} m/s − {q} m/s</span></span> = <strong>{r} Hz</strong><br><var>v</var><sub>Q,r</sub> und <var>v</var><sub>B,r</sub> sind die Anteile der Geschwindigkeiten auf der Verbindungslinie (zum anderen hin positiv, für die Quelle beim Aussenden des Schalls).',
      fbSilent: 'Beim Beobachter ist noch kein Schall angekommen.',
      fbTwo: '<br>Zusätzlich kommt früher ausgesandter Schall zeitlich rückwärts an: {r} Hz.',
      lamText:
        'vorn: <var>λ</var><sub>v</sub> = <span class="frac"><span><var>c</var> − <var>v</var><sub>Q</sub></span><span><var>f</var><sub>Q</sub></span></span> = <span class="frac"><span>{c} m/s − {v} m/s</span><span>{f} Hz</span></span> = <strong>{lv} m</strong> → ruhender Beobachter: <var>f</var><sub>v</sub> = <span class="frac"><span><var>c</var></span><span><var>λ</var><sub>v</sub></span></span> = {fv} Hz',
      lamNone: 'vorn: keine Wellen – die Quelle ist mindestens so schnell wie ihr eigener Schall.',
      lamBack:
        '<br>hinten: <var>λ</var><sub>h</sub> = <span class="frac"><span><var>c</var> + <var>v</var><sub>Q</sub></span><span><var>f</var><sub>Q</sub></span></span> = <strong>{lh} m</strong> → <var>f</var><sub>h</sub> = {fh} Hz<br>Ruhende Quelle: <var>λ</var> = <var>c</var>/<var>f</var><sub>Q</sub> = {l0} m.',
      machSub: '<var>Ma</var> = <span class="frac"><span><var>v</var><sub>Q</sub></span><span><var>c</var></span></span> = {m} &lt; 1: Unterschall – die Wellenfronten laufen der Quelle voraus.',
      machOne: '<var>Ma</var> = 1: Die Quelle fährt genau mit Schallgeschwindigkeit. Die Wellenfronten stauen sich vor ihr zur „Schallmauer“.',
      machSuper:
        '<var>Ma</var> = <span class="frac"><span><var>v</var><sub>Q</sub></span><span><var>c</var></span></span> = {m} &gt; 1: Machscher Kegel mit sin <var>α</var> = <span class="frac"><span><var>c</var></span><span><var>v</var><sub>Q</sub></span></span> = {s}, also <var>α</var> = <strong>{a}°</strong>. Wo der Kegel vorbeizieht, hört man den Überschallknall.',
      now: 't = {t} s · Abstand {r} m · f_B = {f} Hz',
      nowSilent: 't = {t} s · noch Stille beim Beobachter',
      sndOn: 'Ton anhören',
      sndOff: 'Ton aus',
    },
    en: {
      canvas:
        'Top view of a road: an ambulance with flashing blue lights drives past and sends out circular wave fronts that are closer together ahead and further apart behind; a draggable observer at the roadside; below it the graph of the frequency heard, f_B(t), and a display of the frequency at the observer',
      axisT: 't in s',
      chipF: 'frequency heard f_[B] in Hz',
      chipFS: 'f_[B] in Hz',
      tPill: 't = {t} s',
      slowPill: 'slow motion: {k}× slower',
      slowPillS: '{k}× slower',
      machPill: 'c = 340 m/s · Ma = {m}',
      machPillS: 'Ma = {m}',
      rings: 'rings: only every {n}th wave front',
      ringsOne: 'rings: every wave front',
      ringsS: 'every {n}th front',
      lamV: '{n} λ_[a]',
      lamVv: '{n} λ_[a] = {l} m',
      lamH: '{n} λ_[b]',
      lamHv: '{n} λ_[b] = {l} m',
      lam1V: 'λ_[a]',
      lam1Vv: 'λ_[a] = {l} m',
      lam1H: 'λ_[b]',
      lam1Hv: 'λ_[b] = {l} m',
      vQ: 'v_[Q] = {v} m/s',
      vB: 'v_[B] = {v} m/s',
      observer: 'observer',
      cone: 'Mach cone',
      alpha: 'α = {a}°',
      barrier: 'sound barrier',
      noAhead: 'no sound ahead',
      boom: 'Sonic boom!',
      cardTitle: 'At the observer',
      silent: 'Silence',
      silentSub: 'The sound is still on its way.',
      silentSubS: 'The source is faster than its sound.',
      higher: '+{d} Hz · higher than f_[Q]',
      lower: '−{d} Hz · lower than f_[Q]',
      same: 'exactly f_[Q]',
      hidden: '? Hz',
      hiddenSub: 'value hidden',
      second: '+ backwards: {f} Hz',
      radial: 'v_[Q,r] = {q} m/s · v_[B,r] = {b} m/s',
      fQ: 'f_[Q]',
      fV: 'f_[a]',
      fH: 'f_[b]',
      silence: 'silence',
      boomShort: 'boom',
      rev: 'backwards',
      unitM: '{s} m',
      fbText:
        '<var>f</var><sub>B</sub> = <var>f</var><sub>Q</sub> · <span class="frac"><span><var>c</var> + <var>v</var><sub>B,r</sub></span><span><var>c</var> − <var>v</var><sub>Q,r</sub></span></span> = {f} Hz · <span class="frac"><span>{c} m/s + {b} m/s</span><span>{c} m/s − {q} m/s</span></span> = <strong>{r} Hz</strong><br><var>v</var><sub>Q,r</sub> and <var>v</var><sub>B,r</sub> are the components of the velocities along the line joining them (positive towards the other one; for the source at the moment the sound was emitted).',
      fbSilent: 'No sound has reached the observer yet.',
      fbTwo: '<br>In addition, sound emitted earlier arrives backwards in time: {r} Hz.',
      lamText:
        'ahead: <var>λ</var><sub>a</sub> = <span class="frac"><span><var>c</var> − <var>v</var><sub>Q</sub></span><span><var>f</var><sub>Q</sub></span></span> = <span class="frac"><span>{c} m/s − {v} m/s</span><span>{f} Hz</span></span> = <strong>{lv} m</strong> → observer at rest: <var>f</var><sub>a</sub> = <span class="frac"><span><var>c</var></span><span><var>λ</var><sub>a</sub></span></span> = {fv} Hz',
      lamNone: 'ahead: no waves – the source is at least as fast as its own sound.',
      lamBack:
        '<br>behind: <var>λ</var><sub>b</sub> = <span class="frac"><span><var>c</var> + <var>v</var><sub>Q</sub></span><span><var>f</var><sub>Q</sub></span></span> = <strong>{lh} m</strong> → <var>f</var><sub>b</sub> = {fh} Hz<br>Source at rest: <var>λ</var> = <var>c</var>/<var>f</var><sub>Q</sub> = {l0} m.',
      machSub: '<var>Ma</var> = <span class="frac"><span><var>v</var><sub>Q</sub></span><span><var>c</var></span></span> = {m} &lt; 1: subsonic – the wave fronts run ahead of the source.',
      machOne: '<var>Ma</var> = 1: the source moves exactly at the speed of sound. The wave fronts pile up in front of it to form the “sound barrier”.',
      machSuper:
        '<var>Ma</var> = <span class="frac"><span><var>v</var><sub>Q</sub></span><span><var>c</var></span></span> = {m} &gt; 1: Mach cone with sin <var>α</var> = <span class="frac"><span><var>c</var></span><span><var>v</var><sub>Q</sub></span></span> = {s}, so <var>α</var> = <strong>{a}°</strong>. Where the cone passes, a sonic boom is heard.',
      now: 't = {t} s · distance {r} m · f_B = {f} Hz',
      nowSilent: 't = {t} s · still silent at the observer',
      sndOn: 'Play sound',
      sndOff: 'Sound off',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const W = WORLD_WIDTH;

    /* ---------- Bewegung und Zeit ---------- */
    const x0Of = (vq: number) => (vq > 0 ? -W / 2 - 14 : -60);
    const motion = (): Motion => ({ f: p.f, c: C_AIR, x0: x0Of(p.vq), vq: p.vq, bx: p.bx, d: p.d, vb: p.vb });

    function tEndOf(m: Motion): number {
      if (m.vq > 0) {
        const exit = (W / 2 + 18 - m.x0) / m.vq;
        return m.vq > m.c ? exit * 1.08 : exit;
      }
      if (m.vb > 0) return (m.bx + W / 2 + 14) / m.vb;
      if (m.vb < 0) return (W / 2 + 14 - m.bx) / -m.vb;
      return 3;
    }

    /** Automatische Zeitlupe: Eine Vorbeifahrt dauert etwa PASS_SECONDS echte Sekunden. */
    const rateOf = (m: Motion) => Math.min(1, W / (PASS_SECONDS * Math.max(m.vq, Math.abs(m.vb), 1)));
    const slowFactor = () => (p.slow ? 0.25 : 1);

    function tInitOf(m: Motion): number {
      if (m.vq > 0) {
        const target = m.vq > m.c ? 0.16 * W : -0.14 * W;
        return clamp((target - m.x0) / m.vq, 0, tEndOf(m));
      }
      return Math.min(m.vb !== 0 ? 1.2 : 1.4, tEndOf(m));
    }

    let model = motion();
    let N = ringPeriods(model.f, model.vq);
    let tEnd = tEndOf(model);
    let ghost: Sample[] = [];
    let tFirst: number | null = null;
    let boom = false;
    let t = tInitOf(model);

    function recompute(): void {
      model = motion();
      N = ringPeriods(model.f, model.vq);
      tEnd = tEndOf(model);
      ghost = sampleFrequency(model, 0, tEnd, SAMPLES);
      tFirst = firstArrival(model, tEnd);
      boom = tFirst !== null && isBoom(model, tFirst);
    }

    /* ---------- Animation ---------- */
    const intro = new Tween(1400, ease.outCubic);
    const morph = new Tween(650, ease.inOutCubic);
    const numTw = new Tween(700, ease.outCubic);
    let numOff = 0;
    let old: Snap | null = null;
    let morphWaves = false;
    let morphSrc = false;
    let morphObs = false;
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    let blink = 0;
    let dragging = false;
    let hoverObs = false;
    let drawnSrc: [number, number] = [0, 0];
    let drawnObs: [number, number] = [0, 0];
    let drawnJet = 0;
    let shownF: number | null = null;
    let boomFlash = -1;
    const soft = new Map<string, number>();

    /** Weich nachgeführter Wert (zählt Zahlen und schwenkt Achsen). */
    function ease2(key: string, target: number, rate = 9): number {
      const cur = soft.get(key);
      if (cur === undefined || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-3 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }

    /** Zeit, die gerade gezeigt wird (in der Einstiegsanimation etwas früher). */
    function viewT(): number {
      if (!intro.running) return t;
      const back = model.vq > 0 ? Math.min(t, (0.1 * W) / model.vq) : Math.min(t, 0.4);
      return Math.max(0, t - back * (1 - intro.value));
    }
    const introK = () => (intro.running ? intro.value : 1);

    /* ---------- Ton (Web Audio, nur nach Klick) ---------- */
    interface Rig {
      ac: AudioContext;
      master: GainNode;
      osc: OscillatorNode[];
      gain: GainNode[];
    }
    let rig: Rig | null = null;

    function startAudio(): void {
      const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
      const AC = w.AudioContext ?? w.webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      const master = ac.createGain();
      master.gain.value = 0.07;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 1800;
      lp.connect(master);
      master.connect(ac.destination);
      const osc: OscillatorNode[] = [];
      const gain: GainNode[] = [];
      for (let i = 0; i < 2; i++) {
        const o = ac.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = p.f;
        const gg = ac.createGain();
        gg.gain.value = 0;
        o.connect(gg);
        gg.connect(lp);
        o.start();
        osc.push(o);
        gain.push(gg);
      }
      rig = { ac, master, osc, gain };
      void ac.resume();
      updateAudio();
    }

    function stopAudio(): void {
      if (!rig) return;
      const r = rig;
      rig = null;
      r.master.gain.setTargetAtTime(0, r.ac.currentTime, 0.03);
      window.setTimeout(() => void r.ac.close(), 200);
    }

    function updateAudio(): void {
      if (!rig) return;
      const now = rig.ac.currentTime;
      const on = ctx.clock.playing;
      const list = on ? arrivals(model, t) : [];
      const main = list.length ? list[list.length - 1]! : null;
      const rev = list.length >= 2 ? list[0]! : null;
      const set = (i: number, a: (typeof list)[number] | null, level: number) => {
        const o = rig!.osc[i]!;
        const gg = rig!.gain[i]!;
        if (a && Number.isFinite(a.f)) {
          o.frequency.setTargetAtTime(clamp(Math.abs(a.f), 30, 4000), now, 0.012);
          gg.gain.setTargetAtTime(level * clamp(30 / Math.max(a.dist, 1), 0.15, 1), now, 0.03);
        } else gg.gain.setTargetAtTime(0, now, 0.03);
      };
      set(0, main, 1);
      set(1, rev, 0.7);
    }

    function bang(): void {
      if (!rig) return;
      const ac = rig.ac;
      const len = Math.round(ac.sampleRate * 0.45);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.07));
      const src = ac.createBufferSource();
      src.buffer = buf;
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 500;
      const gg = ac.createGain();
      gg.gain.value = 3.2;
      src.connect(lp);
      lp.connect(gg);
      gg.connect(rig.master);
      src.start();
    }

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const tall = w < 640 && h > w * 0.9;
      if (!tall) {
        const sh = Math.round(h * 0.62);
        const y = sh + 10;
        const cw = Math.round((w - 10) * (w < 760 ? 0.6 : 0.66));
        return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y, w: cw, h: h - y }, card: { x: cw + 10, y, w: w - cw - 10, h: h - y }, tall };
      }
      const sh = Math.round(h * 0.47);
      const ch = 104;
      return { scene: { x: 0, y: 0, w, h: sh }, card: { x: 0, y: sh + 8, w, h: ch }, chart: { x: 0, y: sh + 16 + ch, w, h: h - sh - 16 - ch }, tall };
    }
    let lay = computeLayout();

    function sceneGeo(r: Rect): SceneGeo {
      const sm = r.w < 640;
      const k = r.w / W;
      const top = r.y + 72;
      const bottom = r.y + r.h - 74 - 40 * k;
      const roadY = Math.max(top, Math.min(r.y + r.h * 0.36, bottom));
      return { r, sm, k, cx: r.x + r.w / 2, roadY, rh: clamp(4.5 * k, 13, 30) };
    }

    const PX = (g0: SceneGeo, x: number) => g0.cx + x * g0.k;
    /** Lage des Beobachters im Bild (auf schmalen Bildschirmen mindestens neben der Fahrbahn). */
    const PY = (g0: SceneGeo, y: number) => g0.roadY + Math.max(y * g0.k, y > 0 ? g0.rh + 10 : 0);

    /* ---------- Zeichenhilfen ---------- */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }

    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): number {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center', false);
      return w;
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    /** Farbe einer Frequenz: höher als f_Q blau, tiefer rot. */
    const fColor = (f: number) => {
      const q = clamp((f - p.f) / (p.f * 0.06), -1, 1);
      const mid = mixColor(blue(), red(), 0.5);
      return q >= 0 ? mixColor(mid, blue(), Math.min(1, q * 1.6)) : mixColor(mid, red(), Math.min(1, -q * 1.6));
    };

    /* ---------- Szene: Hintergrund ---------- */
    /*
     * Untergrund aus dem Foto strasse.webp (Draufsicht, 1800 × 890): Die Wiese
     * (Zeilen GRASS) und eine Fahrspur aus reinem Asphalt (Zeilen LANE) dienen als
     * Texturen und werden gespiegelt gekachelt – so bleibt der Maßstab der Szene
     * (Fahrbahnbreite, Lage der Straße) genau wie gezeichnet. Markierungen
     * zeichnet die Simulation selbst (deutsche Mittellinie, gestrichelt).
     */
    const GRASS = { y: 592, h: 196 };
    const LANE = { y: 357, h: 74 };
    let groundCache: { key: string; c: HTMLCanvasElement } | null = null;

    /** Ausschnitt eines Bildes gespiegelt gekachelt (abwechselnd normal/gespiegelt, damit keine Kanten sichtbar sind). */
    function mirrorTile(q: CanvasRenderingContext2D, img: HTMLImageElement, sy: number, sh: number, x: number, y: number, w: number, h: number, tw: number, th: number, flipRows: boolean): void {
      q.save();
      q.beginPath();
      q.rect(x, y, w, h);
      q.clip();
      for (let row = 0, ty = y; ty < y + h; row++, ty += th) {
        for (let col = 0, tx = x; tx < x + w; col++, tx += tw) {
          q.save();
          q.translate(tx + (col % 2 ? tw : 0), ty + (flipRows && row % 2 ? th : 0));
          q.scale(col % 2 ? -1 : 1, flipRows && row % 2 ? -1 : 1);
          q.drawImage(img, 0, sy, img.width, sh, 0, 0, tw + 0.5, th + 0.5);
          q.restore();
        }
      }
      q.restore();
    }

    function drawGroundPhoto(g0: SceneGeo, img: HTMLImageElement): void {
      const g = surface.g;
      const r = g0.r;
      const dark = ctx.theme.dark;
      const key = `${Math.round(r.w)}x${Math.round(r.h)}|${Math.round(g0.roadY - r.y)}|${g0.rh}|${dark ? 1 : 0}|${surface.dpr}`;
      if (!groundCache || groundCache.key !== key) {
        const o = offscreenCanvas(r.w, r.h, surface.dpr);
        const q = o.g;
        const roadY = g0.roadY - r.y;
        // Wiese: Grundton, darüber das Gras (gedämpft, damit die Wellenfronten gut sichtbar bleiben)
        q.fillStyle = dark ? '#121c17' : '#e3edd8';
        q.fillRect(0, 0, r.w, r.h);
        const gk = clamp(r.w / 1500, 0.36, 0.6);
        q.globalAlpha = dark ? 0.42 : 0.52;
        mirrorTile(q, img, GRASS.y, GRASS.h, 0, 0, r.w, r.h, img.width * gk, GRASS.h * gk, true);
        q.globalAlpha = 1;
        if (dark) {
          q.fillStyle = 'rgba(8,14,12,0.35)';
          q.fillRect(0, 0, r.w, r.h);
        }
        // Gehweg unterhalb der Straße
        const walkH = Math.max(8, g0.rh * 0.45);
        const wy = roadY + g0.rh;
        q.fillStyle = dark ? '#2b333d' : '#d9dde2';
        q.fillRect(0, wy, r.w, walkH);
        q.strokeStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
        q.lineWidth = 1;
        q.beginPath();
        for (let x = 6; x < r.w; x += walkH * 1.6) {
          q.moveTo(Math.round(x) + 0.5, wy);
          q.lineTo(Math.round(x) + 0.5, wy + walkH);
        }
        q.stroke();
        // Fahrbahn: zwei Spuren aus der Asphalt-Textur (Seitenverhältnis wie im Foto)
        q.save();
        q.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.22)';
        q.shadowBlur = 10;
        q.shadowOffsetY = 2;
        q.fillStyle = '#4a4d52';
        q.fillRect(-2, roadY - g0.rh, r.w + 4, 2 * g0.rh);
        q.restore();
        const lk = g0.rh / LANE.h;
        mirrorTile(q, img, LANE.y, LANE.h, -2, roadY - g0.rh, r.w + 4, 2 * g0.rh, img.width * lk, g0.rh, true);
        if (dark) {
          q.fillStyle = 'rgba(10,14,20,0.32)';
          q.fillRect(-2, roadY - g0.rh, r.w + 4, 2 * g0.rh);
        }
        // Randlinien und gestrichelte Mittellinie
        q.strokeStyle = dark ? 'rgba(230,234,240,0.6)' : 'rgba(255,255,255,0.9)';
        q.lineWidth = g0.sm ? 1.2 : 1.6;
        q.beginPath();
        q.moveTo(0, roadY - g0.rh + 3);
        q.lineTo(r.w, roadY - g0.rh + 3);
        q.moveTo(0, roadY + g0.rh - 3);
        q.lineTo(r.w, roadY + g0.rh - 3);
        q.stroke();
        q.setLineDash([Math.max(8, 6 * g0.k), Math.max(8, 6 * g0.k)]);
        q.beginPath();
        q.moveTo(0, roadY);
        q.lineTo(r.w, roadY);
        q.stroke();
        groundCache = { key, c: o.canvas };
      }
      g.drawImage(groundCache.c, r.x, r.y, r.w, r.h);
    }

    function drawGround(g0: SceneGeo): void {
      const g = surface.g;
      const r = g0.r;
      const dark = ctx.theme.dark;
      const photo = ctx.images.get('road');
      if (photo) return drawGroundPhoto(g0, photo);
      // Wiese
      const field = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      field.addColorStop(0, dark ? '#16221d' : '#e6efdc');
      field.addColorStop(1, dark ? '#111a16' : '#d7e4cb');
      g.fillStyle = field;
      g.fillRect(r.x, r.y, r.w, r.h);
      // leichte Struktur (Grasflecken), deterministisch
      g.fillStyle = dark ? 'rgba(120,170,120,0.05)' : 'rgba(90,130,70,0.07)';
      for (let i = 0; i < 46; i++) {
        const fx = ((i * 0.6180339) % 1) * r.w + r.x;
        const fy = ((i * 0.4142135 + 0.13) % 1) * r.h + r.y;
        if (Math.abs(fy - g0.roadY) < g0.rh + 22) continue;
        g.beginPath();
        g.ellipse(fx, fy, 18 + (i % 5) * 7, 7 + (i % 3) * 3, 0, 0, TAU);
        g.fill();
      }
      // Gehweg unterhalb der Straße
      const walkH = Math.max(8, g0.rh * 0.45);
      const wy = g0.roadY + g0.rh;
      g.fillStyle = dark ? '#2b333d' : '#d9dde2';
      g.fillRect(r.x, wy, r.w, walkH);
      g.strokeStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
      g.lineWidth = 1;
      g.beginPath();
      for (let x = r.x + 6; x < r.x + r.w; x += walkH * 1.6) {
        g.moveTo(Math.round(x) + 0.5, wy);
        g.lineTo(Math.round(x) + 0.5, wy + walkH);
      }
      g.stroke();
      // Fahrbahn mit weichem Schatten
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.22)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      const asphalt = g.createLinearGradient(0, g0.roadY - g0.rh, 0, g0.roadY + g0.rh);
      asphalt.addColorStop(0, dark ? '#2a3039' : '#5a6270');
      asphalt.addColorStop(0.5, dark ? '#313844' : '#646d7b');
      asphalt.addColorStop(1, dark ? '#262c35' : '#555d6a');
      g.fillStyle = asphalt;
      g.fillRect(r.x - 2, g0.roadY - g0.rh, r.w + 4, 2 * g0.rh);
      g.restore();
      // Randlinien und Mittellinie
      g.strokeStyle = dark ? 'rgba(230,234,240,0.55)' : 'rgba(255,255,255,0.85)';
      g.lineWidth = g0.sm ? 1.2 : 1.6;
      g.beginPath();
      g.moveTo(r.x, g0.roadY - g0.rh + 3);
      g.lineTo(r.x + r.w, g0.roadY - g0.rh + 3);
      g.moveTo(r.x, g0.roadY + g0.rh - 3);
      g.lineTo(r.x + r.w, g0.roadY + g0.rh - 3);
      g.stroke();
      g.setLineDash([Math.max(8, 6 * g0.k), Math.max(8, 6 * g0.k)]);
      g.beginPath();
      g.moveTo(r.x, g0.roadY);
      g.lineTo(r.x + r.w, g0.roadY);
      g.stroke();
      g.setLineDash([]);
    }

    /* ---------- Szene: Wellen ---------- */
    let conicOk: boolean | null = null;

    function drawWaves(g0: SceneGeo, m: Motion, tt: number, nP: number, alpha: number, labelAlpha: number): void {
      if (alpha <= 0.002) return;
      const g = surface.g;
      const theme = ctx.theme;
      const r = g0.r;
      const dt = nP / m.f;
      const diag = Math.hypot(r.w, r.h);
      const fronts = wavefronts(m, tt, dt, (W + diag / g0.k) * 1.2);
      const s = clamp((m.vq / m.c) * 7, 0, 1);
      const mid = mixColor(blue(), red(), 0.5);
      const cFront = mixColor(mid, blue(), s);
      const cBack = mixColor(mid, red(), s);
      if (conicOk === null) conicOk = typeof (g as unknown as { createConicGradient?: unknown }).createConicGradient === 'function';
      const lw = g0.sm ? 1.6 : 2.1;
      const corners: [number, number][] = [
        [r.x, r.y],
        [r.x + r.w, r.y],
        [r.x, r.y + r.h],
        [r.x + r.w, r.y + r.h],
      ];
      g.save();
      g.lineCap = 'round';
      for (const w of fronts) {
        const cx = PX(g0, w.cx);
        const cy = g0.roadY;
        const rad = w.r * g0.k;
        if (rad < 0.5) continue;
        const far = Math.max(...corners.map(([x, y]) => Math.hypot(x - cx, y - cy)));
        if (rad > far + 4) continue;
        const fade = Math.pow(clamp(1 - rad / (diag * 1.15), 0, 1), 1.15);
        // neu ausgesandte Fronten wachsen weich heraus
        const born = clamp(rad / 10, 0, 1);
        const a = alpha * fade * born;
        if (a < 0.01) continue;
        let stroke: string | CanvasGradient = mid;
        if (s > 0.01 && conicOk) {
          const cg = g.createConicGradient(0, cx, cy);
          cg.addColorStop(0, cFront);
          cg.addColorStop(0.5, cBack);
          cg.addColorStop(1, cFront);
          stroke = cg;
        } else if (s > 0.01) stroke = mid;
        g.strokeStyle = stroke;
        g.globalAlpha = a * (theme.dark ? 0.16 : 0.12);
        g.lineWidth = lw * 4;
        g.beginPath();
        g.arc(cx, cy, rad, 0, TAU);
        g.stroke();
        g.globalAlpha = a * 0.92;
        g.lineWidth = lw;
        g.stroke();
      }
      g.restore();

      // Grenzfälle: Schallmauer und Machscher Kegel
      const [sx] = sourcePos(m, tt);
      const spx = PX(g0, sx);
      const ang = machAngle(m.vq, m.c);
      if (Math.abs(m.vq - m.c) < 0.5 && tt > 0) {
        const hb = Math.min(r.h, 2 * m.c * tt * g0.k);
        const top = Math.max(r.y, g0.roadY - hb / 2);
        const bot = Math.min(r.y + r.h, g0.roadY + hb / 2);
        const glow = g.createLinearGradient(spx - 18, 0, spx + 6, 0);
        glow.addColorStop(0, withAlpha(orange(), 0));
        glow.addColorStop(0.75, withAlpha(orange(), 0.35 * alpha));
        glow.addColorStop(1, withAlpha(orange(), 0));
        g.fillStyle = glow;
        g.fillRect(spx - 18, top, 24, bot - top);
        g.strokeStyle = withAlpha(orange(), 0.9 * alpha);
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(spx + 1, top);
        g.lineTo(spx + 1, bot);
        g.stroke();
        if (labelAlpha > 0.01) {
          g.save();
          g.globalAlpha = labelAlpha;
          const ly = Math.min(bot - 12, g0.roadY + g0.rh + 16);
          richText(ctx.t('barrier'), spx + 8, ly, g0.sm ? 11 : 12, orange(), 'left');
          g.restore();
        }
      }
      if (ang !== null && tt > 0) {
        const len = Math.min(m.vq * tt, W * 2) * g0.k;
        const dx = -Math.cos(ang) * len;
        const dy = Math.sin(ang) * len;
        // Kegelfläche (gestörte Luft) weich getönt
        const grad = g.createLinearGradient(spx, 0, spx + dx, 0);
        grad.addColorStop(0, withAlpha(orange(), 0.16 * alpha));
        grad.addColorStop(1, withAlpha(orange(), 0));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(spx, g0.roadY);
        g.lineTo(spx + dx, g0.roadY - dy);
        g.lineTo(spx + dx, g0.roadY + dy);
        g.closePath();
        g.fill();
        g.lineCap = 'round';
        for (const [wdt, aa] of [
          [8, 0.18],
          [2.8, 0.95],
        ] as const) {
          g.strokeStyle = withAlpha(orange(), aa * alpha);
          g.lineWidth = wdt;
          g.beginPath();
          g.moveTo(spx + dx, g0.roadY - dy);
          g.lineTo(spx, g0.roadY);
          g.lineTo(spx + dx, g0.roadY + dy);
          g.stroke();
        }
        if (labelAlpha > 0.01) {
          g.save();
          g.globalAlpha = labelAlpha;
          // Winkel α an der Spitze (gegen die Bahn, nach hinten gemessen)
          const ra = g0.sm ? 30 : 44;
          g.strokeStyle = orange();
          g.lineWidth = 1.6;
          g.beginPath();
          g.arc(spx, g0.roadY, ra, Math.PI, Math.PI + ang, false);
          g.stroke();
          g.strokeStyle = withAlpha(theme.text, 0.35);
          g.setLineDash([3, 4]);
          g.beginPath();
          g.moveTo(spx, g0.roadY);
          g.lineTo(spx - ra * 1.7, g0.roadY);
          g.stroke();
          g.setLineDash([]);
          if (p.val) {
            richText(tr('alpha', { a: n((ang * 180) / Math.PI, 1) }), spx - ra - 6, g0.roadY - (g0.sm ? 8 : 9), g0.sm ? 11 : 12, orange(), 'right');
          }
          // Beschriftung längs der oberen Kegellinie
          const q = 0.62;
          const lx = spx + dx * q;
          const ly = g0.roadY - dy * q;
          if (lx > r.x + 60 && ly > r.y + 44) {
            g.save();
            g.translate(lx, ly);
            g.rotate(ang);
            richText(ctx.t('cone'), 0, -12, g0.sm ? 11 : 12, orange(), 'center');
            g.restore();
          }
          g.restore();
        }
      }
      if (m.vq >= m.c - 0.5 && tt > 0 && labelAlpha > 0.01 && p.lam) {
        g.save();
        g.globalAlpha = labelAlpha;
        const lx = spx + (g0.sm ? 40 : 56);
        if (lx + 60 < r.x + r.w && m.vq > m.c + 0.5) richText(ctx.t('noAhead'), lx, g0.roadY - g0.rh - 14, g0.sm ? 11 : 12, theme.muted, 'left', true, 650);
        g.restore();
      }

      // Wellenlängen vorn und hinten
      if (p.lam && labelAlpha > 0.01 && m.vq < m.c - 0.5) drawBrackets(g0, m, tt, nP, fronts, sx, labelAlpha);
    }

    function drawBrackets(g0: SceneGeo, m: Motion, tt: number, nP: number, fronts: ReturnType<typeof wavefronts>, sx: number, alpha: number): void {
      const g = surface.g;
      const r = g0.r;
      const sm = g0.sm;
      const y = g0.roadY - g0.rh - (sm ? 12 : 16);
      const minGap = (sm ? 26 : 40) / g0.k;
      const lv = wavelengthAhead(m.f, m.vq, m.c)!;
      const lh = wavelengthBehind(m.f, m.vq, m.c);
      const one = nP === 1;
      g.save();
      g.globalAlpha = alpha;
      const bracket = (a: number, b: number, label: string, color: string) => {
        const pa = PX(g0, a);
        const pb = PX(g0, b);
        if (Math.min(pa, pb) < r.x + 6 || Math.max(pa, pb) > r.x + r.w - 6) return;
        const lo = Math.min(pa, pb);
        const hi = Math.max(pa, pb);
        g.strokeStyle = color;
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(lo, y - 5);
        g.lineTo(lo, y + 5);
        g.moveTo(hi, y - 5);
        g.lineTo(hi, y + 5);
        g.stroke();
        arrowPx((lo + hi) / 2, y, lo + 1, y, color, 1.6, 6);
        arrowPx((lo + hi) / 2, y, hi - 1, y, color, 1.6, 6);
        g.strokeStyle = withAlpha(color, 0.5);
        g.lineWidth = 1;
        g.setLineDash([2, 3]);
        g.beginPath();
        g.moveTo(lo, y + 5);
        g.lineTo(lo, g0.roadY);
        g.moveTo(hi, y + 5);
        g.lineTo(hi, g0.roadY);
        g.stroke();
        g.setLineDash([]);
        const fs = sm ? 11 : 12;
        const lw = richWidth(label, fs);
        const cx = clamp((lo + hi) / 2, r.x + lw / 2 + 6, r.x + r.w - lw / 2 - 6);
        richText(label, cx, y - (sm ? 11 : 13), fs, color, 'center');
      };
      // vorn: die beiden jüngsten Fronten, die deutlich vor der Quelle liegen
      if (tt > 0) {
        const ahead = fronts.map((w) => w.cx + w.r);
        for (let i = 0; i + 1 < ahead.length; i++) {
          if (ahead[i]! - sx >= minGap) {
            const wide = !sm && (ahead[i + 1]! - ahead[i]!) * g0.k > 120;
            const key = one ? (wide ? 'lam1Vv' : 'lam1V') : wide ? 'lamVv' : 'lamV';
            bracket(ahead[i]!, ahead[i + 1]!, tr(key, { n: String(nP), l: n(one ? lv : nP * lv, 2) }), blue());
            break;
          }
        }
        const behind = fronts.map((w) => w.cx - w.r);
        for (let i = 0; i + 1 < behind.length; i++) {
          if (sx - behind[i]! >= minGap) {
            const wide = !sm && (behind[i]! - behind[i + 1]!) * g0.k > 120;
            const key = one ? (wide ? 'lam1Hv' : 'lam1H') : wide ? 'lamHv' : 'lamH';
            bracket(behind[i + 1]!, behind[i]!, tr(key, { n: String(nP), l: n(one ? lh : nP * lh, 2) }), red());
            break;
          }
        }
      }
      g.restore();
    }

    /* ---------- Szene: Fahrzeuge und Beobachter ---------- */
    function drawAmbulance(x: number, y: number, len: number, alpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      const wd = len * 0.44;
      g.save();
      g.globalAlpha = alpha;
      g.translate(x, y);
      // Blaulicht-Schein auf der Straße
      const on = prefersReducedMotion() ? 0.6 : 0.5 + 0.5 * Math.sin(blink * TAU * 2.2);
      for (const [side, k] of [
        [-1, on],
        [1, 1 - on],
      ] as const) {
        const gx = len * 0.1;
        const gy = side * wd * 0.22;
        const rg = g.createRadialGradient(gx, gy, 1, gx, gy, wd * 2.1);
        rg.addColorStop(0, `rgba(80,140,255,${0.42 * k})`);
        rg.addColorStop(1, 'rgba(80,140,255,0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(gx, gy, wd * 2.1, 0, TAU);
        g.fill();
      }
      // Karosserie mit weichem Schatten (Licht von links oben)
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.65)' : 'rgba(20,30,45,0.38)';
      g.shadowBlur = 10;
      g.shadowOffsetX = 2;
      g.shadowOffsetY = 4;
      const body = g.createLinearGradient(0, -wd / 2, 0, wd / 2);
      body.addColorStop(0, '#ffffff');
      body.addColorStop(0.55, '#eef0f3');
      body.addColorStop(1, '#c6ccd4');
      g.fillStyle = body;
      roundRect(g, -len / 2, -wd / 2, len, wd, wd * 0.28);
      g.fill();
      g.restore();
      // Motorhaube (vorn = rechts)
      const hood = g.createLinearGradient(len * 0.3, 0, len / 2, 0);
      hood.addColorStop(0, '#e9ecf0');
      hood.addColorStop(1, '#d3d8df');
      g.fillStyle = hood;
      roundRect(g, len * 0.3, -wd / 2 + 1.2, len * 0.2 - 1.2, wd - 2.4, wd * 0.24);
      g.fill();
      // Frontscheibe
      const glass = g.createLinearGradient(len * 0.18, -wd / 2, len * 0.3, wd / 2);
      glass.addColorStop(0, '#5d7896');
      glass.addColorStop(1, '#22344a');
      g.fillStyle = glass;
      g.beginPath();
      g.moveTo(len * 0.19, -wd * 0.4);
      g.lineTo(len * 0.3, -wd * 0.34);
      g.lineTo(len * 0.3, wd * 0.34);
      g.lineTo(len * 0.19, wd * 0.4);
      g.closePath();
      g.fill();
      // Warnstreifen an den Seiten
      g.fillStyle = '#d8392d';
      g.fillRect(-len / 2 + 2, -wd / 2 + 1, len * 0.66, wd * 0.12);
      g.fillRect(-len / 2 + 2, wd / 2 - 1 - wd * 0.12, len * 0.66, wd * 0.12);
      // Dachaufbau
      g.strokeStyle = 'rgba(40,50,64,0.18)';
      g.lineWidth = 1;
      roundRect(g, -len * 0.44, -wd * 0.3, len * 0.56, wd * 0.6, 3);
      g.stroke();
      // Blaulichtbalken
      g.fillStyle = '#2b3442';
      roundRect(g, len * 0.06, -wd * 0.36, len * 0.08, wd * 0.72, 2);
      g.fill();
      for (const [side, k] of [
        [-1, on],
        [1, 1 - on],
      ] as const) {
        g.fillStyle = mixColor('#1d3f8a', '#9cc4ff', k);
        roundRect(g, len * 0.065, side < 0 ? -wd * 0.33 : wd * 0.03, len * 0.07, wd * 0.3, 2);
        g.fill();
      }
      // Rückleuchten und Spiegel
      g.fillStyle = '#b3261e';
      g.fillRect(-len / 2 + 0.5, -wd * 0.4, 2, wd * 0.16);
      g.fillRect(-len / 2 + 0.5, wd * 0.24, 2, wd * 0.16);
      g.fillStyle = '#dfe3e8';
      g.beginPath();
      g.ellipse(len * 0.22, -wd / 2 - 1.6, 2.4, 1.6, 0, 0, TAU);
      g.ellipse(len * 0.22, wd / 2 + 1.6, 2.4, 1.6, 0, 0, TAU);
      g.fill();
      g.restore();
    }

    function drawJet(x: number, y: number, len: number, alpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      g.save();
      g.globalAlpha = alpha;
      g.translate(x, y);
      const sc = 0.92 + 0.08 * alpha;
      g.scale(sc, sc);
      const silhouette = () => {
        g.beginPath();
        g.moveTo(len * 0.5, 0);
        g.quadraticCurveTo(len * 0.36, -len * 0.06, len * 0.12, -len * 0.065);
        g.lineTo(-len * 0.12, -len * 0.4);
        g.lineTo(-len * 0.26, -len * 0.4);
        g.lineTo(-len * 0.2, -len * 0.08);
        g.lineTo(-len * 0.36, -len * 0.08);
        g.lineTo(-len * 0.46, -len * 0.2);
        g.lineTo(-len * 0.52, -len * 0.2);
        g.lineTo(-len * 0.48, 0);
        g.lineTo(-len * 0.52, len * 0.2);
        g.lineTo(-len * 0.46, len * 0.2);
        g.lineTo(-len * 0.36, len * 0.08);
        g.lineTo(-len * 0.2, len * 0.08);
        g.lineTo(-len * 0.26, len * 0.4);
        g.lineTo(-len * 0.12, len * 0.4);
        g.lineTo(len * 0.12, len * 0.065);
        g.quadraticCurveTo(len * 0.36, len * 0.06, len * 0.5, 0);
        g.closePath();
      };
      // Schatten weit versetzt: das Flugzeug fliegt
      g.save();
      g.translate(len * 0.12, len * 0.3);
      g.fillStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(20,30,45,0.16)';
      g.filter = 'blur(3px)';
      silhouette();
      g.fill();
      g.restore();
      const metal = g.createLinearGradient(0, -len * 0.4, 0, len * 0.4);
      metal.addColorStop(0, '#eef1f5');
      metal.addColorStop(0.5, '#b9c2cd');
      metal.addColorStop(1, '#7f8a97');
      g.fillStyle = metal;
      silhouette();
      g.fill();
      g.strokeStyle = 'rgba(40,50,64,0.35)';
      g.lineWidth = 0.8;
      g.stroke();
      // Rumpfkante und Cockpit
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.beginPath();
      g.moveTo(len * 0.44, -1);
      g.lineTo(-len * 0.44, -1);
      g.stroke();
      const can = g.createLinearGradient(len * 0.18, -len * 0.04, len * 0.36, len * 0.04);
      can.addColorStop(0, '#8fb3d9');
      can.addColorStop(1, '#2f4a6b');
      g.fillStyle = can;
      g.beginPath();
      g.ellipse(len * 0.28, 0, len * 0.1, len * 0.035, 0, 0, TAU);
      g.fill();
      // Positionslichter
      const on = prefersReducedMotion() ? 1 : 0.5 + 0.5 * Math.sin(blink * TAU * 1.4);
      g.fillStyle = `rgba(255,70,60,${0.5 + 0.5 * on})`;
      g.beginPath();
      g.arc(-len * 0.19, -len * 0.39, 1.8, 0, TAU);
      g.fill();
      g.fillStyle = `rgba(70,220,120,${0.5 + 0.5 * on})`;
      g.beginPath();
      g.arc(-len * 0.19, len * 0.39, 1.8, 0, TAU);
      g.fill();
      g.restore();
    }

    function drawPerson(x: number, y: number, s: number, hit: number, hot: boolean): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      // Empfangs-Ring, wenn gerade eine Wellenfront ankommt
      if (hit > 0.02) {
        g.strokeStyle = withAlpha(green(), 0.55 * hit);
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(x, y, s * (0.95 + 0.35 * (1 - hit)), 0, TAU);
        g.stroke();
      }
      if (hot) {
        g.fillStyle = withAlpha(green(), 0.16);
        g.beginPath();
        g.arc(x, y, s * 1.05, 0, TAU);
        g.fill();
      }
      // Schatten
      g.save();
      g.fillStyle = dark ? 'rgba(0,0,0,0.45)' : 'rgba(20,30,45,0.2)';
      g.filter = 'blur(2px)';
      g.beginPath();
      g.ellipse(x + 2, y + 3, s * 0.66, s * 0.36, 0, 0, TAU);
      g.fill();
      g.restore();
      // Schultern (Jacke)
      const jacket = g.createLinearGradient(x, y - s * 0.3, x, y + s * 0.3);
      jacket.addColorStop(0, mixColor(green(), '#ffffff', 0.25));
      jacket.addColorStop(1, mixColor(green(), '#000000', 0.25));
      g.fillStyle = jacket;
      g.beginPath();
      g.ellipse(x, y + s * 0.06, s * 0.62, s * 0.3, 0, 0, TAU);
      g.fill();
      // Ohren
      g.fillStyle = '#e7bf9b';
      g.beginPath();
      g.ellipse(x - s * 0.29, y - s * 0.04, s * 0.06, s * 0.1, 0, 0, TAU);
      g.ellipse(x + s * 0.29, y - s * 0.04, s * 0.06, s * 0.1, 0, 0, TAU);
      g.fill();
      // Kopf (von oben: Haare, Nase zur Straße)
      g.fillStyle = '#e7bf9b';
      g.beginPath();
      g.ellipse(x, y - s * 0.3, s * 0.07, s * 0.06, 0, 0, TAU);
      g.fill();
      const hair = g.createRadialGradient(x - s * 0.08, y - s * 0.12, 1, x, y - s * 0.04, s * 0.3);
      hair.addColorStop(0, '#7a5638');
      hair.addColorStop(1, '#3f2a1b');
      g.fillStyle = hair;
      g.beginPath();
      g.arc(x, y - s * 0.04, s * 0.27, 0, TAU);
      g.fill();
      // Schallbögen am Ohr
      g.strokeStyle = withAlpha(green(), 0.35 + 0.6 * hit);
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      for (let i = 1; i <= 2; i++) {
        g.beginPath();
        g.arc(x - s * 0.29, y - s * 0.04, s * (0.14 + 0.13 * i), Math.PI * 1.08, Math.PI * 1.42);
        g.stroke();
      }
    }

    /* ---------- Szene ---------- */
    /** Wie stark kommt gerade eine (gezeichnete) Wellenfront beim Beobachter an? 0 … 1. */
    function ringHit(g0: SceneGeo, m: Motion, tt: number, nP: number, ox: number, oy: number): number {
      if (tt <= 0) return 0;
      let best = 0;
      for (const w of wavefronts(m, tt, nP / m.f, Math.hypot(ox - m.x0, oy) + m.vq * tt + 50)) {
        const dpx = Math.abs(Math.hypot(ox - w.cx, oy) - w.r) * g0.k;
        best = Math.max(best, Math.exp(-((dpx / 5) ** 2)));
      }
      return best;
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const g0 = sceneGeo(r);
      const sm = g0.sm;
      const vt = viewT();
      const k = morph.running ? morph.value : 1;
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawGround(g0);

      // Wellen (beim Umschalten weich überblendet)
      const ik = introK();
      if (old && morph.running && morphWaves) {
        drawWaves(g0, old.m, old.t, old.N, 1 - k, Math.max(0, 1 - k / 0.45));
        drawWaves(g0, model, vt, N, k * ik, Math.max(0, (k - 0.45) / 0.55));
      } else drawWaves(g0, model, vt, N, ik, ik);

      // Quelle
      const [sx] = sourcePos(model, vt);
      let src: [number, number] = [PX(g0, sx), g0.roadY];
      if (old && morph.running && morphSrc) src = [old.src[0] + (src[0] - old.src[0]) * k, old.src[1] + (src[1] - old.src[1]) * k];
      drawnSrc = src;
      const jet = ease2('jet', p.vq >= JET_FROM ? 1 : 0, 7);
      drawnJet = jet;
      const lenA = clamp(7 * g0.k, 44, 64);
      const lenJ = clamp(15 * g0.k, 48, 88);
      drawAmbulance(src[0], src[1], lenA, (1 - jet) * ik);
      drawJet(src[0], src[1], lenJ, jet * ik);
      // Geschwindigkeitspfeil der Quelle
      const vqShown = ease2('vq', p.vq);
      if (vqShown > 0.5) {
        const front = src[0] + (lenA * (1 - jet) + lenJ * jet) / 2 + 4;
        const al = (sm ? 12 : 16) + (sm ? 30 : 44) * (vqShown / (vqShown + 120));
        g.save();
        g.globalAlpha = ik;
        arrowPx(front, src[1], front + al, src[1], theme.dark ? '#f2f4f7' : '#1b2330', 2.4, 8);
        const vl = tr('vQ', { v: n(vqShown, 0) });
        const vw = richWidth(vl, sm ? 11 : 12) / 2 + 6;
        const vy = sm ? src[1] + g0.rh + 10 + lenJ * 0.25 * jet : src[1] - 28 - lenJ * 0.3 * jet;
        richText(vl, clamp(src[0], r.x + vw, r.x + r.w - vw), vy, sm ? 11 : 12, theme.text, 'center');
        g.restore();
      }

      // Beobachter
      const [ox, oy] = observerPos(model, vt);
      let obs: [number, number] = [PX(g0, ox), PY(g0, oy)];
      if (old && morph.running && morphObs) obs = [old.obs[0] + (obs[0] - old.obs[0]) * k, old.obs[1] + (obs[1] - old.obs[1]) * k];
      drawnObs = obs;
      const s = sm ? 22 : 28;
      const hit = ringHit(g0, model, vt, N, ox, oy);
      g.save();
      g.globalAlpha = ik;
      drawPerson(obs[0], obs[1], s, hit, hoverObs || dragging);
      // Bewegung des Beobachters
      const vbShown = ease2('vb', p.vb);
      if (Math.abs(vbShown) > 0.5) {
        const dir = vbShown > 0 ? -1 : 1;
        const al = (sm ? 12 : 16) + (sm ? 18 : 26) * (Math.abs(vbShown) / (Math.abs(vbShown) + 30));
        const ax = obs[0] + dir * (s * 0.7 + 2);
        arrowPx(ax, obs[1] + s * 0.06, ax + dir * al, obs[1] + s * 0.06, green(), 2.4, 8);
      }
      const lab = Math.abs(vbShown) > 0.5 ? tr('vB', { v: n(Math.abs(vbShown), 0) }) : ctx.t('observer');
      richText(lab, obs[0], obs[1] + s * 0.55 + (sm ? 9 : 11), sm ? 11 : 12, green(), 'center');
      // gehörte Frequenz neben dem Beobachter
      if (p.val && shownF !== null && Number.isFinite(shownF)) {
        const lbl = `${n(shownF, 1)} Hz`;
        const fs = sm ? 11 : 12;
        const wpx = richWidth(lbl, fs) + 16;
        const right = obs[0] + s * 0.75 + wpx < r.x + r.w - 6;
        // Läuft der Beobachter aus dem Bild, bleibt die Anzeige am Rand sichtbar
        const want = right ? obs[0] + s * 0.75 : obs[0] - s * 0.75 - wpx;
        const x0 = Math.max(r.x + 6, Math.min(r.x + r.w - 6 - wpx, want));
        pill(x0, obs[1] - s * 0.62 - 6, lbl, fColor(shownF), 'left', fs);
      }
      g.restore();

      // Überschallknall
      if (boomFlash >= 0) {
        const age = (performance.now() - boomFlash) / 1000;
        if (age < 1.8) {
          const a = 1 - age / 1.8;
          g.strokeStyle = withAlpha(orange(), 0.8 * a);
          g.lineWidth = 3;
          g.beginPath();
          g.arc(obs[0], obs[1], s + 60 * ease.outCubic(Math.min(1, age / 0.9)), 0, TAU);
          g.stroke();
          g.save();
          g.globalAlpha = Math.min(1, a * 2);
          pill(obs[0], obs[1] - s - (sm ? 34 : 42), ctx.t('boom'), orange(), 'center', sm ? 12 : 13, withAlpha(orange(), 0.95));
          g.restore();
          animating = true;
        } else boomFlash = -1;
      }

      // Kopfzeile
      g.save();
      g.globalAlpha = ik;
      const size = sm ? 11 : 12;
      const w1 = pill(r.x + 8, r.y + 8, tr('tPill', { t: fmt.fixed(vt, 2) }), theme.text, 'left', size);
      const rate = rateOf(model) * slowFactor();
      if (rate < 0.95) {
        const kk = 1 / rate;
        const kTxt = kk >= 10 ? n(kk, 0) : n(kk, 1);
        if (sm) pill(r.x + 8, r.y + 8 + size + 17, tr('slowPillS', { k: kTxt }), purple(), 'left', size);
        else pill(r.x + 8 + w1 + 8, r.y + 8, tr('slowPill', { k: kTxt }), purple(), 'left', size);
      }
      const ma = ease2('ma', p.vq / C_AIR);
      pill(r.x + r.w - 8, r.y + 8, tr(sm ? 'machPillS' : 'machPill', { m: n(ma, 2) }), ma > 1.001 ? orange() : theme.text, 'right', size);
      // Fußzeile: Darstellung der Ringe, Maßstab
      const ringTxt = N === 1 ? ctx.t('ringsOne') : tr(sm ? 'ringsS' : 'rings', { n: String(N) });
      pill(r.x + 8, r.y + r.h - size - 19, ringTxt, theme.muted, 'left', size);
      const mScale = [10, 20, 50, 100].find((q) => q * g0.k >= 46) ?? 100;
      const bw = mScale * g0.k;
      const bx = r.x + r.w - 14 - bw;
      const by = r.y + r.h - 16;
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bx, by - 5);
      g.lineTo(bx, by);
      g.lineTo(bx + bw, by);
      g.lineTo(bx + bw, by - 5);
      g.stroke();
      richText(tr('unitM', { s: String(mScale) }), bx + bw / 2, by - 10, size, theme.text, 'center');
      g.restore();
      g.restore();
    }

    /* ---------- Diagramm f_B(t) ---------- */
    function niceStep(range: number, target: number): number {
      const raw = range / target;
      const p10 = 10 ** Math.floor(Math.log10(raw));
      for (const f of [1, 2, 5, 10]) if (f * p10 >= raw) return f * p10;
      return 10 * p10;
    }

    function yTarget(): [number, number] {
      const vals: number[] = [p.f];
      for (const s of ghost) {
        if (s.f !== null) vals.push(s.f);
        if (s.rev !== null) vals.push(s.rev);
      }
      const cap = p.f * 2.4;
      let lo = Math.min(...vals);
      let hi = Math.min(cap, Math.max(...vals));
      if (hi - lo < p.f * 0.04) {
        lo -= p.f * 0.04;
        hi += p.f * 0.04;
      }
      const pad = (hi - lo) * 0.14;
      return [Math.max(0, lo - pad), hi + pad];
    }

    function drawChart(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 520;
      const ik = introK();
      card(R);
      const padL = sm ? 44 : 50;
      const padR = sm ? 12 : 16;
      const padT = sm ? 34 : 38;
      const padB = sm ? 30 : 32;
      const A: Rect = { x: R.x + padL, y: R.y + padT, w: R.w - padL - padR, h: R.h - padT - padB };
      if (A.w < 40 || A.h < 30) return;
      const [yl, yh] = yTarget();
      const y0 = ease2('ylo', yl, 6);
      const y1 = ease2('yhi', yh, 6);
      const x1 = ease2('xhi', tEnd, 6);
      const X = (tt: number) => A.x + (tt / x1) * A.w;
      const Y = (f: number) => A.y + A.h - ((f - y0) / (y1 - y0)) * A.h;
      const vt = viewT();
      const fs = sm ? 11 : 12;

      // Gitter und Achsenzahlen
      const sy = niceStep(y1 - y0, sm ? 3.5 : 4.5);
      const sx = niceStep(x1, Math.max(3, A.w / 80));
      g.lineWidth = 1;
      g.strokeStyle = theme.grid;
      g.beginPath();
      for (let f = Math.ceil(y0 / sy) * sy; f <= y1 + 1e-9; f += sy) {
        const yy = Math.round(Y(f)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      for (let tt = sx; tt <= x1 + 1e-9; tt += sx) {
        const xx = Math.round(X(tt)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      const decY = Math.max(0, -Math.floor(Math.log10(sy) + 1e-9));
      const decX = Math.max(0, -Math.floor(Math.log10(sx) + 1e-9));
      g.font = `${fs}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      if (p.val) {
        for (let f = Math.ceil(y0 / sy) * sy; f <= y1 + 1e-9; f += sy) {
          const yy = Y(f);
          if (yy < A.y + 6 || yy > A.y + A.h - 4) continue;
          g.fillText(fmt.num(f, decY), A.x - 7, yy);
        }
      }
      g.textAlign = 'center';
      g.textBaseline = 'top';
      g.fillText('0', A.x, A.y + A.h + 6);
      for (let tt = sx; tt <= x1 + 1e-9; tt += sx) {
        const xx = X(tt);
        if (xx > A.x + A.w - 44) continue;
        g.fillText(fmt.num(tt, decX), xx, A.y + A.h + 6);
      }
      // Achsen
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w + 4, A.y + A.h + 0.5);
      g.stroke();
      richText(ctx.t('axisT'), A.x + A.w + 4, A.y + A.h + 6 + fs / 2, fs, theme.muted, 'right', true, 600);

      g.save();
      g.beginPath();
      g.rect(A.x + 1, A.y - 2, A.w + 2, A.h + 2);
      g.clip();
      // Stille vor der ersten Ankunft
      const tf = tFirst ?? tEnd;
      if (tf > 0) {
        const xa = X(0);
        const xb = X(Math.min(tf, x1));
        g.fillStyle = withAlpha(theme.muted, theme.dark ? 0.1 : 0.07);
        g.fillRect(xa, A.y, xb - xa, A.h);
        if (xb - xa > 56) richText(ctx.t('silence'), (xa + xb) / 2, A.y + A.h - 14, fs, theme.muted, 'center', true, 600);
      }
      // f_Q als Bezug
      const yq = Y(p.f);
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1.3;
      g.setLineDash([6, 5]);
      g.beginPath();
      g.moveTo(A.x, yq);
      g.lineTo(A.x + A.w, yq);
      g.stroke();
      g.setLineDash([]);
      // Grenzwerte vorn/hinten (ruhender Beobachter auf der Straße)
      if (p.val && p.vq > 0 && p.vq < C_AIR && p.vb === 0) {
        const fv = (p.f * C_AIR) / (C_AIR - p.vq);
        const fh = (p.f * C_AIR) / (C_AIR + p.vq);
        g.lineWidth = 1;
        g.setLineDash([2, 4]);
        for (const [f, c] of [
          [fv, blue()],
          [fh, red()],
        ] as const) {
          g.strokeStyle = withAlpha(c, 0.7);
          g.beginPath();
          g.moveTo(A.x, Y(f));
          g.lineTo(A.x + A.w, Y(f));
          g.stroke();
        }
        g.setLineDash([]);
      }
      // Knall
      if (boom && tFirst !== null) {
        const xb = X(tFirst);
        g.strokeStyle = withAlpha(orange(), 0.85);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(xb, A.y);
        g.lineTo(xb, A.y + A.h);
        g.stroke();
      }
      // Kurven
      const curve = (list: Sample[], key: 'f' | 'rev', until: number): [number, number][][] => {
        const segs: [number, number][][] = [];
        let cur: [number, number][] = [];
        for (const s of list) {
          if (s.t > until) break;
          const v = s[key];
          if (v === null) {
            if (cur.length > 1) segs.push(cur);
            cur = [];
            continue;
          }
          cur.push([X(s.t), Y(Math.min(v, y1 + (y1 - y0)))]);
        }
        if (until < Infinity) {
          const a = arrivals(model, until);
          const main = a.length ? a[a.length - 1]! : null;
          const v = key === 'f' ? (main && Number.isFinite(main.f) ? main.f : null) : a.length >= 2 && Number.isFinite(a[0]!.f) ? Math.abs(a[0]!.f) : null;
          if (v !== null && cur.length) cur.push([X(until), Y(Math.min(v, y1 + (y1 - y0)))]);
        }
        if (cur.length > 1) segs.push(cur);
        return segs;
      };
      const stroke = (segs: [number, number][][], color: string | CanvasGradient, width: number, dash: number[] = [], alpha = 1) => {
        g.save();
        g.globalAlpha *= alpha;
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineJoin = 'round';
        g.lineCap = 'round';
        g.setLineDash(dash);
        for (const s of segs) {
          g.beginPath();
          s.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
        }
        g.restore();
      };
      // Farbverlauf: oberhalb f_Q blau, unterhalb rot
      const span = Math.max(1, A.h);
      const grad = g.createLinearGradient(0, A.y, 0, A.y + span);
      const q = clamp((yq - A.y) / span, 0.001, 0.999);
      const mid = mixColor(blue(), red(), 0.5);
      grad.addColorStop(0, blue());
      grad.addColorStop(Math.max(0, q - 0.06), mixColor(mid, blue(), 0.7));
      grad.addColorStop(q, mid);
      grad.addColorStop(Math.min(1, q + 0.06), mixColor(mid, red(), 0.7));
      grad.addColorStop(1, red());
      const kM = morph.running ? morph.value : 1;
      if (p.ghost) {
        if (old && morph.running) stroke(curve(old.ghost, 'f', Infinity), grad, 2, [5, 5], 0.45 * (1 - kM));
        stroke(curve(ghost, 'f', Infinity), grad, 2, [5, 5], 0.45 * kM * ik);
        if (boom) stroke(curve(ghost, 'rev', Infinity), purple(), 1.6, [2, 4], 0.45 * kM * ik);
      }
      if (boom) stroke(curve(ghost, 'rev', vt), purple(), 2, [5, 3], kM);
      stroke(curve(ghost, 'f', vt), grad, 3, [], kM);
      g.restore();

      // Beschriftungen rechts an den Linien
      const right = A.x + A.w - 4;
      richText(ctx.t('fQ'), right, yq - 9, fs, theme.text, 'right', true, 700);
      if (p.val && p.vq > 0 && p.vq < C_AIR && p.vb === 0) {
        const fv = (p.f * C_AIR) / (C_AIR - p.vq);
        const fh = (p.f * C_AIR) / (C_AIR + p.vq);
        if (Y(fv) > A.y + 8 && yq - Y(fv) > 20) richText(ctx.t('fV'), right, Y(fv) - 9, fs, blue(), 'right', true, 700);
        if (Y(fh) - yq > 20) richText(ctx.t('fH'), A.x + 8, Y(fh) - 9, fs, red(), 'left', true, 700);
      }
      if (boom && tFirst !== null && X(tFirst) < A.x + A.w - 30) richText(ctx.t('boomShort'), X(tFirst) + 5, A.y + 10, fs, orange(), 'left', true, 700);

      // Zeitmarke und aktueller Punkt
      const xv = X(Math.min(vt, x1));
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1.2;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(xv, A.y);
      g.lineTo(xv, A.y + A.h);
      g.stroke();
      g.setLineDash([]);
      if (shownF !== null && Number.isFinite(shownF)) {
        const yv = clamp(Y(shownF), A.y - 2, A.y + A.h);
        g.save();
        g.shadowColor = withAlpha(fColor(shownF), 0.6);
        g.shadowBlur = 8;
        g.fillStyle = fColor(shownF);
        g.beginPath();
        g.arc(xv, yv, 5.5, 0, TAU);
        g.fill();
        g.restore();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(xv, yv, 5.5, 0, TAU);
        g.stroke();
      }
      // Etikett
      const chip = ctx.t(sm ? 'chipFS' : 'chipF');
      richText(chip, R.x + 14, R.y + (sm ? 17 : 19), fs + 1, theme.text, 'left', false);
    }

    /* ---------- Anzeige „Beim Beobachter“ ---------- */
    function drawCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const ik = introK();
      g.save();
      g.globalAlpha = ik;
      g.translate(0, (1 - ik) * 12);
      card(R);
      const flat = R.w > R.h * 2.2;
      const sm = R.w < 300 || flat;
      const pad = sm ? 12 : 16;
      const list = arrivals(model, viewT());
      const rev = list.length >= 2 ? list[0]! : null;
      const main = list.length ? list[list.length - 1]! : null;
      // Titel mit Ohr-Symbol
      const ty = R.y + pad + 7;
      g.strokeStyle = green();
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(R.x + pad + 5, ty, 5, Math.PI * 0.9, Math.PI * 2.3);
      g.stroke();
      for (let i = 1; i <= 2; i++) {
        g.beginPath();
        g.arc(R.x + pad + 5, ty, 5 + 4 * i, -0.5, 0.5);
        g.stroke();
      }
      richText(ctx.t('cardTitle'), R.x + pad + 24, ty, sm ? 12 : 13, theme.text, 'left', false);
      // große Zahl
      const big = flat ? 26 : sm ? 28 : 34;
      const colW = flat ? R.w * 0.46 : R.w;
      const by = flat ? R.y + R.h * 0.6 : R.y + pad + 22 + big * 0.6;
      if (shownF !== null && Number.isFinite(shownF) && main) {
        if (p.val) {
          const txt = n(shownF, 1);
          g.font = `800 ${big}px ${theme.font}`;
          g.fillStyle = fColor(shownF);
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(txt, R.x + pad, by);
          const tw = g.measureText(txt).width;
          g.font = `700 ${Math.round(big * 0.5)}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.fillText('Hz', R.x + pad + tw + 6, by + big * 0.1);
        } else {
          g.font = `800 ${big}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(ctx.t('hidden'), R.x + pad, by);
        }
      } else {
        g.font = `800 ${big}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(ctx.t('silent'), R.x + pad, by);
      }
      // Unterzeile
      const fs = sm ? 11.5 : 12.5;
      const lx = flat ? R.x + colW : R.x + pad;
      let ly = flat ? R.y + pad + 7 : by + big * 0.62 + 6;
      const sub = (str: string, color: string, weight = 700) => {
        if (ly > R.y + R.h - 8) return;
        richText(str, lx, ly, fs, color, 'left', false, weight);
        ly += fs + 8;
      };
      if (!main || shownF === null) sub(ctx.t(p.vq > C_AIR ? 'silentSubS' : 'silentSub'), theme.muted, 600);
      else if (!p.val) sub(ctx.t('hiddenSub'), theme.muted, 600);
      else {
        const dF = shownF - p.f;
        if (Math.abs(dF) < 0.05) sub(ctx.t('same'), theme.muted);
        else sub(tr(dF > 0 ? 'higher' : 'lower', { d: n(Math.abs(dF), 1) }), fColor(shownF));
        if (rev) sub(tr('second', { f: n(Math.abs(rev.f), 1) }), purple());
        else if (!flat || R.h > 90) sub(tr('radial', { q: n(main.vQr, 1), b: n(main.vBr, 1) }), theme.muted, 600);
      }
      // Tonhöhen-Skala
      const gy = flat ? R.y + R.h - pad - 10 : Math.min(R.y + R.h - pad - 18, ly + 14);
      if (gy > ly - 4 && gy < R.y + R.h - 10) {
        const gx0 = lx + 4;
        const gx1 = R.x + R.w - pad - 4;
        const lo = soft.get('ylo') ?? p.f * 0.8;
        const hi = soft.get('yhi') ?? p.f * 1.2;
        const GX = (f: number) => gx0 + clamp((f - lo) / (hi - lo), 0, 1) * (gx1 - gx0);
        const bar = g.createLinearGradient(gx0, 0, gx1, 0);
        bar.addColorStop(0, withAlpha(red(), 0.85));
        bar.addColorStop(clamp((p.f - lo) / (hi - lo), 0.01, 0.99), withAlpha(mixColor(blue(), red(), 0.5), 0.6));
        bar.addColorStop(1, withAlpha(blue(), 0.85));
        g.fillStyle = bar;
        roundRect(g, gx0, gy - 3, gx1 - gx0, 6, 3);
        g.fill();
        const xq = GX(p.f);
        g.strokeStyle = theme.text;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(xq, gy - 8);
        g.lineTo(xq, gy + 8);
        g.stroke();
        if (xq - gx0 > 44 && gx1 - xq > 44) richText(ctx.t('fQ'), xq, gy + 16, 11, theme.muted, 'center', false);
        richText(ctx.lang === 'de' ? 'tiefer' : 'lower', gx0, gy + 16, 11, red(), 'left', false, 650);
        richText(ctx.lang === 'de' ? 'höher' : 'higher', gx1, gy + 16, 11, blue(), 'right', false, 650);
        if (shownF !== null && Number.isFinite(shownF) && main && p.val) {
          const xm = GX(shownF);
          g.save();
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
          g.shadowBlur = 5;
          g.shadowOffsetY = 1;
          g.fillStyle = fColor(shownF);
          g.beginPath();
          g.arc(xm, gy, 7, 0, TAU);
          g.fill();
          g.restore();
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(xm, gy, 7, 0, TAU);
          g.stroke();
        }
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const a = mainArrival(model, t);
      if (!a || !Number.isFinite(a.f)) ctx.readout('now', tr('nowSilent', { t: fmt.fixed(t, 2) }));
      else {
        const [ox, oy] = observerPos(model, t);
        const [sx, sy] = sourcePos(model, t);
        ctx.readout('now', tr('now', { t: fmt.fixed(t, 2), r: n(Math.hypot(ox - sx, oy - sy), 1), f: n(a.f, 1) }));
      }
    }

    function updateReadouts(): void {
      updateLive();
      const lv = wavelengthAhead(p.f, p.vq);
      const lh = wavelengthBehind(p.f, p.vq);
      let lam = lv !== null ? tr('lamText', { c: n(C_AIR, 0), v: n(p.vq, 0), f: n(p.f, 0), lv: n(lv, 3), fv: n(C_AIR / lv, 1) }) : ctx.t('lamNone');
      lam += tr('lamBack', { lh: n(lh, 3), fh: n(C_AIR / lh, 1), l0: n(C_AIR / p.f, 3) });
      ctx.readout('lam', { html: lam });
      const ma = p.vq / C_AIR;
      const ang = machAngle(p.vq);
      if (ang !== null) ctx.readout('mach', { html: tr('machSuper', { m: n(ma, 2), s: n(C_AIR / p.vq, 3), a: n((ang * 180) / Math.PI, 1) }) });
      else if (p.vq === C_AIR) ctx.readout('mach', { html: ctx.t('machOne') });
      else ctx.readout('mach', { html: tr('machSub', { m: n(ma, 3) }) });
      ctx.setAction('go', { enabled: !ctx.locked });
      ctx.setAction('snd', { label: ctx.t(rig ? 'sndOff' : 'sndOn') });
    }

    /** Während des Ablaufs: Ergebnis f_B und „Momentan“ (die übrigen hängen nicht von t ab). */
    function updateLive(): void {
      const a = mainArrival(model, t);
      if (!a || !Number.isFinite(a.f)) ctx.readout('fb', ctx.t('fbSilent'));
      else {
        const list = arrivals(model, t);
        const par = (v: number) => (v < -0.05 ? `(${n(v, 1)})` : n(Math.abs(v) < 0.05 ? 0 : v, 1));
        let html = tr('fbText', { f: n(p.f, 0), c: n(C_AIR, 0), b: par(a.vBr), q: par(a.vQr), r: n(a.f, 1) });
        if (list.length >= 2 && Number.isFinite(list[0]!.f)) html += tr('fbTwo', { r: n(Math.abs(list[0]!.f), 1) });
        ctx.readout('fb', { html });
      }
      updateNow();
    }

    /** Gehörte Frequenz für die Anzeige (zählt nach Änderungen weich zum neuen Wert). */
    function computeShownF(): number | null {
      const a = mainArrival(model, viewT());
      if (!a || !Number.isFinite(a.f)) return null;
      return a.f + (numTw.running ? numOff * (1 - numTw.value) : 0);
    }

    /* ---------- Beobachter ziehen ---------- */
    const nearObs = (px: number, py: number) => Math.hypot(px - drawnObs[0], py - drawnObs[1]) < (surface.width < 640 ? 26 : 30);
    function dragTo(px: number, py: number): void {
      const g0 = sceneGeo(lay.scene);
      const x = (px - g0.cx) / g0.k + p.vb * t;
      const d = (py - g0.roadY) / g0.k;
      ctx.set({ bx: clamp(Math.round(x), -110, 110), d: clamp(Math.round(d), 6, 40) });
    }
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && nearObs(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked || !nearObs(q.px, q.py)) return false;
        dragging = true;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (dragging) dragTo(q.px, q.py);
      },
      pointerUp: () => {
        dragging = false;
        surface.setCursor(hoverObs ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? nearObs(q.px, q.py) && !ctx.locked : false;
        if (h !== hoverObs) {
          hoverObs = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    function snapshot(): Snap {
      return { m: model, t: viewT(), N, src: drawnSrc, obs: drawnObs, ghost, jet: drawnJet };
    }

    function restartRun(): void {
      old = snapshot();
      morphWaves = true;
      morphSrc = true;
      morphObs = true;
      morph.play();
      const before = shownF;
      t = 0;
      boomFlash = -1;
      const now = mainArrival(model, 0);
      numOff = before !== null && now && Number.isFinite(now.f) ? before - now.f : 0;
      if (numOff) numTw.play();
    }

    const offClock = ctx.clock.onChange((playing) => {
      if (playing && t >= tEnd - 1e-9) {
        restartRun();
        updateReadouts();
      }
      updateAudio();
      ctx.requestRender();
    });

    recompute();
    lay = computeLayout();

    return {
      update(changed, source) {
        const physics = ['f', 'vq', 'vb', 'd', 'bx'].some((key) => changed.has(key));
        const before = shownF;
        if (source !== 'init') old = snapshot();
        recompute();
        if (source === 'init') {
          t = tInitOf(model);
          intro.play();
        } else if (source === 'replace') {
          t = tInitOf(model);
          ctx.clock.pause();
          boomFlash = -1;
          morphWaves = morphSrc = morphObs = true;
          morph.play();
        } else if (physics) {
          t = Math.min(t, tEnd);
          morphWaves = changed.has('f') || changed.has('vq');
          morphSrc = changed.has('vq');
          morphObs = !dragging && (changed.has('bx') || changed.has('d') || changed.has('vb'));
          morph.play();
        }
        if (source !== 'init' && physics) {
          const a = mainArrival(model, t);
          numOff = before !== null && a && Number.isFinite(a.f) && !dragging ? before - a.f : 0;
          if (numOff) numTw.play();
        }
        updateReadouts();
        updateAudio();
        ctx.requestRender();
      },

      action(id) {
        if (id === 'snd') {
          if (rig) stopAudio();
          else startAudio();
          updateReadouts();
          return;
        }
        if (ctx.locked) return;
        if (id === 'go') {
          restartRun();
          updateReadouts();
          ctx.clock.play();
        }
      },

      tick(dt) {
        const before = t;
        t += dt * rateOf(model) * slowFactor();
        if (t >= tEnd) {
          t = tEnd;
          ctx.clock.pause();
        }
        if (boom && tFirst !== null && before < tFirst && t >= tFirst) {
          boomFlash = performance.now();
          bang();
        }
        blink += dt;
        updateLive();
        updateAudio();
      },

      resetTime() {
        restartRun();
        updateReadouts();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = computeLayout();
        shownF = computeShownF();
        surface.begin();
        drawScene(lay.scene);
        drawChart(lay.chart);
        drawCard(lay.card);
        if (!morph.running) old = null;
        if (animating || intro.running || morph.running || numTw.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        stopAudio();
        surface.destroy();
      },
    };
  },
});
