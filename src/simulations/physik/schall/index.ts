import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  addLevels,
  audible,
  band,
  beatFreq,
  C_AIR,
  dbFromAmplitude,
  displacement,
  echoMinDistance,
  echoTime,
  harmonics,
  HEARING,
  hearingRisk,
  hearingThreshold,
  medium,
  MEDIA,
  noteOf,
  pipeFreq,
  stringFreq,
  stringSpeed,
  STRINGS,
  NOISES,
  period,
  pressureDev,
  soundSpeedAir,
  splAtDistance,
  twoTones,
  waveform,
  wavelength,
  type Timbre,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const TAU = 2 * Math.PI;

/**
 * Schall: Tongenerator mit Oszilloskop (Tonhöhe = Frequenz, Lautstärke =
 * Amplitude, Klangfarbe = Obertöne), Ausbreitung als Längswelle in
 * verschiedenen Stoffen, Pegel in dB und Abnahme mit der Entfernung,
 * Hörbereiche und Hörschwelle, Echo und Schwebung. Auf Wunsch ist der Ton
 * zu hören (Web Audio, erst nach Antippen).
 */
export default defineSimulation({
  id: 'schall',
  animated: true,
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  hint: L('Tipp: „Ton anhören“ antippen – Lautsprecher oder Kopfhörer leise stellen.', 'Tip: tap “Play the sound” – turn your speakers or headphones down.'),
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'osc', label: L('Tonhöhe und Lautstärke (Oszilloskop)', 'Pitch and loudness (oscilloscope)') },
        { value: 'wave', label: L('Schallausbreitung', 'How sound travels') },
        { value: 'level', label: L('Lautstärke in Dezibel', 'Loudness in decibels') },
        { value: 'range', label: L('Hörbereich', 'Range of hearing') },
        { value: 'echo', label: L('Echo', 'Echo') },
        { value: 'beat', label: L('Schwebung', 'Beats') },
        { value: 'source', label: L('Schallquellen: Saite und Pfeife', 'Sound sources: string and pipe') },
      ],
      default: 'osc',
    },
    { key: 'f', type: 'number', label: L('Frequenz f', 'Frequency f'), min: 20, max: 2000, step: 1, default: 440, unit: 'Hz', visibleIf: (v) => v.mode === 'osc' || v.mode === 'wave' || v.mode === 'beat' },
    { key: 'amp', type: 'number', label: L('Amplitude', 'Amplitude'), help: L('Bestimmt die Lautstärke.', 'Determines the loudness.'), min: 0, max: 100, step: 1, default: 60, unit: '%', visibleIf: (v) => v.mode === 'osc' || v.mode === 'wave' },
    {
      key: 'tim',
      type: 'choice',
      label: L('Klangfarbe', 'Timbre'),
      options: [
        { value: 'sine', label: L('reiner Ton (Sinus)', 'pure tone (sine)') },
        { value: 'flute', label: L('Flöte', 'flute') },
        { value: 'clarinet', label: L('Klarinette', 'clarinet') },
        { value: 'violin', label: L('Geige', 'violin') },
        { value: 'square', label: L('Rechteck', 'square') },
        { value: 'saw', label: L('Sägezahn', 'sawtooth') },
      ],
      default: 'sine',
      visibleIf: (v) => v.mode === 'osc',
    },
    { key: 'cur', type: 'boolean', group: 'view', label: L('Messmarken (Δt ablesen)', 'Cursors (read off Δt)'), default: false, visibleIf: (v) => v.mode === 'osc' },
    { key: 'ref', type: 'boolean', group: 'view', label: L('Vergleichston 440 Hz zeigen', 'Show reference tone 440 Hz'), default: false, visibleIf: (v) => v.mode === 'osc' },
    {
      key: 'med',
      type: 'choice',
      label: L('Stoff', 'Medium'),
      options: MEDIA.map((m) => ({ value: m.id, label: L(m.de, m.en) })),
      default: 'air',
      visibleIf: (v) => v.mode === 'wave' || v.mode === 'echo',
    },
    { key: 'temp', type: 'number', label: L('Lufttemperatur ϑ', 'Air temperature ϑ'), min: -20, max: 40, step: 1, default: 20, unit: '°C', visibleIf: (v) => (v.mode === 'wave' || v.mode === 'echo') && v.med === 'air' },
    { key: 'L1', type: 'number', label: L('Pegel der Quelle in 1 m', 'Level of the source at 1 m'), min: 30, max: 130, step: 1, default: 90, unit: 'dB', visibleIf: (v) => v.mode === 'level' || v.mode === 'range' },
    { key: 'r', type: 'number', label: L('Entfernung r', 'Distance r'), help: L('Oder das Ohr im Bild ziehen.', 'Or drag the ear in the picture.'), min: 1, max: 200, step: 0.5, default: 4, unit: 'm', visibleIf: (v) => v.mode === 'level' },
    { key: 'n', type: 'number', label: L('Anzahl gleicher Quellen', 'Number of identical sources'), min: 1, max: 10, step: 1, default: 1, visibleIf: (v) => v.mode === 'level' },
    { key: 'fr', type: 'number', label: L('Frequenz (logarithmisch)', 'Frequency (logarithmic)'), help: (v) => L(`f = ${Math.round(Math.pow(10, Number(v.fr))).toLocaleString('de-DE')} Hz`, `f = ${Math.round(Math.pow(10, Number(v.fr))).toLocaleString('en-GB')} Hz`), min: 0.5, max: 5.2, step: 0.01, default: 3, visibleIf: (v) => v.mode === 'range' },
    { key: 'd', type: 'number', label: L('Abstand zur Felswand d', 'Distance to the cliff d'), help: L('Oder die Wand im Bild ziehen.', 'Or drag the wall in the picture.'), min: 5, max: 600, step: 1, default: 170, unit: 'm', visibleIf: (v) => v.mode === 'echo' },
    { key: 'df', type: 'number', label: L('Zweiter Ton: Unterschied Δf', 'Second tone: difference Δf'), min: 0, max: 20, step: 0.5, default: 4, unit: 'Hz', visibleIf: (v) => v.mode === 'beat' },
    {
      key: 'src',
      type: 'choice',
      label: L('Schallquelle', 'Sound source'),
      options: [
        { value: 'string', label: L('Saite', 'string') },
        { value: 'open', label: L('offene Pfeife', 'open pipe') },
        { value: 'closed', label: L('gedackte Pfeife (ein Ende zu)', 'stopped pipe (one end closed)') },
      ],
      default: 'string',
      visibleIf: (v) => v.mode === 'source',
    },
    { key: 'sl', type: 'number', label: L('Länge L', 'Length L'), min: 10, max: 100, step: 1, default: 65, unit: 'cm', visibleIf: (v) => v.mode === 'source' },
    { key: 'ten', type: 'number', label: L('Spannkraft F', 'Tension F'), min: 10, max: 300, step: 1, default: 70, unit: 'N', visibleIf: (v) => v.mode === 'source' && v.src === 'string' },
    {
      key: 'sty',
      type: 'choice',
      label: L('Saite', 'String'),
      options: STRINGS.map((q) => ({ value: q.id, label: L(q.de, q.en) })),
      default: 'e1',
      visibleIf: (v) => v.mode === 'source' && v.src === 'string',
    },
    { key: 'hn', type: 'number', label: L('Schwingungsform (Teilton) n', 'Mode (partial) n'), min: 1, max: 4, step: 1, default: 1, visibleIf: (v) => v.mode === 'source' },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'sound', label: L('Ton anhören', 'Play the sound'), primary: true, visibleIf: (v) => v.mode === 'osc' || v.mode === 'wave' || v.mode === 'beat' || v.mode === 'range' || v.mode === 'source' },
    { id: 'shout', label: L('Rufen', 'Shout'), primary: true, visibleIf: (v) => v.mode === 'echo' },
  ],
  readouts: [
    { key: 'main', label: L('Kennwerte', 'Key values'), spoiler: true },
    { key: 'formula', label: L('Formel', 'Formula') },
    { key: 'extra', label: L('Außerdem', 'Also'), spoiler: true },
  ],
  presets: [
    { id: 'a', label: L('Kammerton a′: 440 Hz', 'Concert pitch A: 440 Hz'), values: { mode: 'osc', f: 440, amp: 60, tim: 'sine' } },
    { id: 'oct', label: L('Eine Oktave höher: 880 Hz', 'One octave higher: 880 Hz'), values: { mode: 'osc', f: 880, amp: 60, tim: 'sine', ref: true } },
    { id: 'loud', label: L('Doppelte Amplitude: +6 dB', 'Double amplitude: +6 dB'), values: { mode: 'osc', f: 440, amp: 100, tim: 'sine', ref: true } },
    { id: 'measure', label: L('Selbst messen: Δt mit den Messmarken', 'Measure yourself: Δt with the cursors'), values: { mode: 'osc', f: 262, amp: 70, tim: 'sine', cur: true, val: false } },
    { id: 'violin', label: L('Klangfarbe: Geige', 'Timbre: violin'), values: { mode: 'osc', f: 330, amp: 70, tim: 'violin' } },
    { id: 'air', label: L('Längswelle in Luft', 'Longitudinal wave in air'), values: { mode: 'wave', f: 440, med: 'air', temp: 20 } },
    { id: 'water', label: L('Schall in Wasser', 'Sound in water'), values: { mode: 'wave', f: 440, med: 'water' } },
    { id: 'vac', label: L('Im Vakuum: kein Schall', 'In a vacuum: no sound'), values: { mode: 'wave', f: 440, med: 'vacuum' } },
    { id: 'dist', label: L('Doppelte Entfernung: −6 dB', 'Double distance: −6 dB'), values: { mode: 'level', L1: 90, r: 2, n: 1 } },
    { id: 'concert', label: L('Rockkonzert vor der Box', 'Rock concert in front of the speaker'), values: { mode: 'level', L1: 125, r: 2, n: 2 } },
    { id: 'bat', label: L('Ultraschall: nur die Fledermaus hört ihn', 'Ultrasound: only the bat hears it'), values: { mode: 'range', fr: 4.6, L1: 80 } },
    { id: 'echo', label: L('Echo an der Felswand', 'Echo at the cliff'), values: { mode: 'echo', d: 170, med: 'air', temp: 20 } },
    { id: 'beat', label: L('Schwebung: 440 Hz und 444 Hz', 'Beats: 440 Hz and 444 Hz'), values: { mode: 'beat', f: 440, df: 4 } },
    { id: 'guitar', label: L('Gitarrensaite: halbe Länge, Oktave höher', 'Guitar string: half the length, an octave higher'), values: { mode: 'source', src: 'string', sl: 65, ten: 70, sty: 'e1', hn: 1 } },
    { id: 'pipe', label: L('Offene und gedackte Pfeife', 'Open and stopped pipe'), values: { mode: 'source', src: 'closed', sl: 50, hn: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Schall: Lautsprecher, Oszilloskop, Teilchen einer Längswelle, Pegel in Dezibel, Hörbereiche, Echo und Schwebung.',
      scope: 'Oszilloskop',
      div: 'pro Kästchen',
      higher: 'Höhere Frequenz: höherer Ton, die Schwingungen liegen dichter.',
      louder: 'Größere Amplitude: lauterer Ton, die Kurve ist höher.',
      timbre: 'Klangfarbe: Zum Grundton kommen Obertöne mit 2f, 3f, … Die Form der Kurve ändert sich, die Tonhöhe bleibt.',
      spectrum: 'Teiltöne (Spektrum)',
      oscT: 'Tonhöhe und Lautstärke',
      note: 'Ton',
      refTone: 'Vergleich 440 Hz',
      waveT: 'Schall ist eine Längswelle',
      waveG: 'Die Teilchen schwingen hin und her, in Ausbreitungsrichtung. Es entstehen Verdichtungen (hoher Druck) und Verdünnungen (niedriger Druck), die weiterwandern.',
      vacuum: 'Ohne Teilchen kein Schall: Im Vakuum schwingt die Membran, aber nichts trägt die Schwingung weiter.',
      pressure: 'Druck',
      xAx: 'x in m',
      levelT: 'Lautstärke in Dezibel',
      levelG: 'Doppelte Entfernung: −6 dB. Doppelt so viele gleiche Quellen: +3 dB. +10 dB empfindet man etwa als doppelt so laut.',
      safe: 'ungefährlich',
      long: 'auf Dauer schädlich (ab 85 dB)',
      danger: 'sofort gefährlich (ab 120 dB)',
      source: 'Quelle',
      ear: 'Ohr',
      rAx: 'r in m (logarithmisch)',
      lAx: 'L in dB',
      rangeT: 'Wer hört was?',
      infra: 'Infraschall',
      ultra: 'Ultraschall',
      audibleTxt: 'Für Menschen hörbar',
      notAudible: 'Für Menschen nicht hörbar',
      threshold: 'Hörschwelle',
      fAx: 'f in Hz',
      echoT: 'Echo: Schall wird zurückgeworfen',
      echoG: 'Aus der Laufzeit t folgt die Entfernung: d = c · t / 2. Unter etwa 17 m (Laufzeit unter 0,1 s) verschmilzt das Echo mit dem Ruf (Nachhall).',
      shout: 'Hallo!',
      wall: 'Felswand',
      beatT: 'Schwebung',
      beatG: 'Zwei fast gleich hohe Töne überlagern sich. Die Lautstärke schwillt im Takt der Differenzfrequenz an und ab. So stimmt man Instrumente.',
      tAx: 't in ms',
      soundOn: 'Ton aus',
      soundOff: 'Ton anhören',
      srcT: 'Schallquellen: Was bestimmt die Tonhöhe?',
      srcString: 'Saite: kürzer, straffer gespannt oder dünner → höherer Ton. Halbe Länge ergibt die Oktave.',
      srcOpen: 'Offene Pfeife: An beiden Enden schwingt die Luft am stärksten. Grundton f = c / (2L).',
      srcClosed: 'Gedackte Pfeife: Am geschlossenen Ende ruht die Luft. Grundton f = c / (4L), eine Oktave tiefer als offen. Es gibt nur ungerade Obertöne.',
      node: 'Knoten',
      antinode: 'Bauch',
      lenAx: 'L in cm',
    },
    en: {
      canvas: 'Sound: loudspeaker, oscilloscope, particles of a longitudinal wave, levels in decibels, ranges of hearing, echo and beats.',
      scope: 'oscilloscope',
      div: 'per division',
      higher: 'Higher frequency: higher pitch, the oscillations are closer together.',
      louder: 'Larger amplitude: louder sound, the curve is taller.',
      timbre: 'Timbre: overtones with 2f, 3f, … are added to the fundamental. The shape of the curve changes, the pitch stays the same.',
      spectrum: 'partials (spectrum)',
      oscT: 'Pitch and loudness',
      note: 'note',
      refTone: 'reference 440 Hz',
      waveT: 'Sound is a longitudinal wave',
      waveG: 'The particles move back and forth along the direction of travel. Compressions (high pressure) and rarefactions (low pressure) form and travel on.',
      vacuum: 'No particles, no sound: in a vacuum the membrane vibrates, but nothing carries the vibration on.',
      pressure: 'pressure',
      xAx: 'x in m',
      levelT: 'Loudness in decibels',
      levelG: 'Double the distance: −6 dB. Twice as many identical sources: +3 dB. +10 dB sounds about twice as loud.',
      safe: 'harmless',
      long: 'harmful in the long run (from 85 dB)',
      danger: 'dangerous at once (from 120 dB)',
      source: 'source',
      ear: 'ear',
      rAx: 'r in m (logarithmic)',
      lAx: 'L in dB',
      rangeT: 'Who hears what?',
      infra: 'infrasound',
      ultra: 'ultrasound',
      audibleTxt: 'Audible for humans',
      notAudible: 'Not audible for humans',
      threshold: 'threshold of hearing',
      fAx: 'f in Hz',
      echoT: 'Echo: sound is reflected',
      echoG: 'The distance follows from the travel time t: d = c · t / 2. Below about 17 m (travel time under 0.1 s) the echo merges with the shout (reverberation).',
      shout: 'Hello!',
      wall: 'cliff',
      beatT: 'Beats',
      beatG: 'Two tones of almost the same pitch overlap. The loudness swells and fades at the difference frequency. This is how instruments are tuned.',
      tAx: 't in ms',
      soundOn: 'Stop the sound',
      soundOff: 'Play the sound',
      srcT: 'Sound sources: what sets the pitch?',
      srcString: 'String: shorter, tighter or thinner → higher pitch. Half the length gives the octave.',
      srcOpen: 'Open pipe: the air vibrates most strongly at both ends. Fundamental f = c / (2L).',
      srcClosed: 'Stopped pipe: the air is at rest at the closed end. Fundamental f = c / (4L), an octave lower than open. There are only odd overtones.',
      node: 'node',
      antinode: 'antinode',
      lenAx: 'L in cm',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 1e-12 ? 0 : v, d) : '–');
    const narrow = () => surface.width < 640;
    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.15;
    const COL = {
      blue: () => th().series[0]!,
      red: () => th().series[1]!,
      green: () => th().series[2]!,
      orange: () => th().series[3]!,
      purple: () => th().series[4]!,
      teal: () => th().series[5]!,
    };
    void tr;

    /* -------------------------------------------------------------- */
    /* Aufteilung                                                      */
    /* -------------------------------------------------------------- */

    interface Lay {
      scene: Rect;
      chart: Rect;
      card: Rect;
    }
    function layout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const sw = Math.round(W * 0.58);
        const ch = Math.round((H - 3 * pad) * 0.47);
        return { scene: { x: pad, y: pad, w: sw - pad, h: H - 2 * pad }, chart: { x: sw + pad, y: pad, w: W - sw - 2 * pad, h: ch }, card: { x: sw + pad, y: 2 * pad + ch, w: W - sw - 2 * pad, h: H - ch - 3 * pad } };
      }
      const sh = Math.round(H * 0.42);
      const ch = Math.round(H * 0.24);
      return { scene: { x: pad, y: pad, w: W - 2 * pad, h: sh }, chart: { x: pad, y: sh + 2 * pad, w: W - 2 * pad, h: ch }, card: { x: pad, y: sh + ch + 3 * pad, w: W - 2 * pad, h: H - sh - ch - 4 * pad } };
    }
    let lay: Lay = layout();
    const inner = (r: Rect, m = 6): Rect => ({ x: r.x + m, y: r.y + m, w: r.w - 2 * m, h: r.h - 2 * m });

    const plotC = new Plot(surface, {
      x: [0, 1],
      y: [-1, 1],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => {
        const r = inner(lay.chart, 8);
        return { x: r.x, y: r.y + 20, w: r.w, h: r.h - 20 };
      },
    });
    function chartTitle(g: CanvasRenderingContext2D, R: Rect, s: string): void {
      g.save();
      g.font = `700 12px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'left';
      g.textBaseline = 'alphabetic';
      g.fillText(s, R.x + 14, R.y + 20);
      g.restore();
    }

    /** Schallgeschwindigkeit im gewählten Stoff (Luft temperaturabhängig). */
    const cNow = () => (p.med === 'air' ? soundSpeedAir(p.temp) : medium(p.med).c);
    /** Frequenz der Ansicht „Hörbereich“. */
    const fRange = () => Math.pow(10, p.fr);
    /** Frequenz der Schallquelle (Saite oder Pfeife, Teilton n). */
    const muNow = () => (STRINGS.find((q) => q.id === p.sty) ?? STRINGS[0]!).mu;
    function srcFreq(Lcm = p.sl, n = p.hn): number {
      if (p.src === 'string') return stringFreq(Lcm / 100, p.ten, muNow(), n);
      return pipeFreq(Lcm / 100, C_AIR, p.src === 'open', n);
    }
    /** Pegelunterschied zur Amplitude 60 %. */
    const relDb = () => (p.amp > 0 ? dbFromAmplitude(p.amp / 60) : -Infinity);

    /* -------------------------------------------------------------- */
    /* Ton (Web Audio, nur nach Antippen)                              */
    /* -------------------------------------------------------------- */

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
      master.gain.value = 0;
      master.connect(ac.destination);
      const osc: OscillatorNode[] = [];
      const gain: GainNode[] = [];
      for (let i = 0; i < 2; i++) {
        const o = ac.createOscillator();
        const gg = ac.createGain();
        gg.gain.value = 0;
        o.connect(gg);
        gg.connect(master);
        o.start();
        osc.push(o);
        gain.push(gg);
      }
      rig = { ac, master, osc, gain };
      void ac.resume();
      master.gain.setTargetAtTime(0.12, ac.currentTime, 0.05);
      updateAudio();
      ctx.setAction('sound', { label: ctx.t('soundOn') });
    }
    function stopAudio(): void {
      if (!rig) return;
      const r = rig;
      rig = null;
      r.master.gain.setTargetAtTime(0, r.ac.currentTime, 0.03);
      window.setTimeout(() => void r.ac.close(), 250);
      ctx.setAction('sound', { label: ctx.t('soundOff') });
    }
    let lastTimbre = '';
    function updateAudio(): void {
      if (!rig) return;
      const now = rig.ac.currentTime;
      const [o0, o1] = rig.osc as [OscillatorNode, OscillatorNode];
      const [g0, g1] = rig.gain as [GainNode, GainNode];
      if (p.mode === 'osc' || p.mode === 'wave') {
        const tim: Timbre = p.mode === 'osc' ? (p.tim as Timbre) : 'sine';
        if (tim !== lastTimbre) {
          const h = harmonics(tim, 16);
          const real = new Float32Array(h.length + 1);
          const imag = new Float32Array(h.length + 1);
          h.forEach((a, k) => (imag[k + 1] = a));
          o0.setPeriodicWave(rig.ac.createPeriodicWave(real, imag));
          lastTimbre = tim;
        }
        o0.frequency.setTargetAtTime(p.f, now, 0.02);
        const silent = p.mode === 'wave' && medium(p.med).c === 0;
        g0.gain.setTargetAtTime(silent ? 0 : Math.pow(p.amp / 100, 2) * 0.9, now, 0.03);
        g1.gain.setTargetAtTime(p.mode === 'osc' && p.ref ? 0.25 : 0, now, 0.03);
        o1.type = 'sine';
        o1.frequency.setTargetAtTime(440, now, 0.02);
      } else if (p.mode === 'beat') {
        if (lastTimbre !== 'beat') {
          o0.type = 'sine';
          lastTimbre = 'beat';
        }
        o1.type = 'sine';
        o0.frequency.setTargetAtTime(p.f, now, 0.02);
        o1.frequency.setTargetAtTime(p.f + p.df, now, 0.02);
        g0.gain.setTargetAtTime(0.45, now, 0.03);
        g1.gain.setTargetAtTime(0.45, now, 0.03);
      } else if (p.mode === 'source') {
        if (lastTimbre !== 'source') {
          const h = p.src === 'closed' ? harmonics('clarinet', 12) : harmonics(p.src === 'string' ? 'violin' : 'flute', 12);
          const real = new Float32Array(h.length + 1);
          const imag = new Float32Array(h.length + 1);
          h.forEach((a, k) => (imag[k + 1] = a));
          o0.setPeriodicWave(rig.ac.createPeriodicWave(real, imag));
          lastTimbre = 'source';
        }
        o0.frequency.setTargetAtTime(clamp(srcFreq(), 20, 18_000), now, 0.02);
        g0.gain.setTargetAtTime(0.45, now, 0.03);
        g1.gain.setTargetAtTime(0, now, 0.03);
      } else if (p.mode === 'range') {
        if (lastTimbre !== 'range') {
          o0.type = 'sine';
          lastTimbre = 'range';
        }
        const f = fRange();
        const ok = f >= 20 && f <= 18_000;
        o0.frequency.setTargetAtTime(clamp(f, 20, 18_000), now, 0.02);
        g0.gain.setTargetAtTime(ok ? 0.5 : 0, now, 0.03);
        g1.gain.setTargetAtTime(0, now, 0.03);
      } else {
        g0.gain.setTargetAtTime(0, now, 0.03);
        g1.gain.setTargetAtTime(0, now, 0.03);
      }
    }

    /* -------------------------------------------------------------- */
    /* Lautsprecher                                                    */
    /* -------------------------------------------------------------- */

    let simT = 0;
    /** Lautsprecher (Seitenansicht) mit schwingender Membran; shift in px. */
    function speaker(g: CanvasRenderingContext2D, x: number, y: number, h: number, shift: number, facingRight = true): void {
      const t = th();
      const s = facingRight ? 1 : -1;
      g.save();
      g.fillStyle = t.dark ? '#3a4250' : '#59616f';
      roundRect(g, x - s * h * 0.38 - (facingRight ? 0 : h * 0.3), y - h * 0.22, h * 0.3, h * 0.44, 4);
      g.fill();
      // Trichter
      g.beginPath();
      g.moveTo(x - s * h * 0.08, y - h * 0.18);
      g.lineTo(x + s * (h * 0.2 + shift), y - h * 0.5);
      g.lineTo(x + s * (h * 0.2 + shift), y + h * 0.5);
      g.lineTo(x - s * h * 0.08, y + h * 0.18);
      g.closePath();
      g.fillStyle = t.dark ? '#555e6d' : '#8a93a1';
      g.fill();
      // Membran
      g.strokeStyle = COL.orange();
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x + s * (h * 0.2 + shift), y - h * 0.5);
      g.quadraticCurveTo(x + s * (h * 0.27 + shift * 1.6), y, x + s * (h * 0.2 + shift), y + h * 0.5);
      g.stroke();
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 1: Oszilloskop                                          */
    /* -------------------------------------------------------------- */

    /** Zeitbasis (s pro Kästchen) so, dass etwa 2 bis 4 Perioden zu sehen sind. */
    function timebase(f: number, divs: number): number {
      const want = (3 / f) / divs;
      const steps = [1e-4, 2e-4, 5e-4, 1e-3, 2e-3, 5e-3, 1e-2, 2e-2, 5e-2];
      return steps.find((s) => s >= want) ?? 5e-2;
    }
    let tbFrom = 0;
    let tbTo = timebase(440, 10);
    const tbTw = new Tween(500, ease.inOutCubic);
    const tbNow = () => (tbTw.running ? tbFrom + (tbTo - tbFrom) * tbTw.value : tbTo);

    function scopeScreen(g: CanvasRenderingContext2D, r: Rect, divX: number, divY: number): void {
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.fillStyle = '#07130c';
      g.fill();
      g.strokeStyle = 'rgba(120,255,170,0.14)';
      g.lineWidth = 1;
      for (let i = 1; i < divX; i++) {
        const x = r.x + (r.w * i) / divX;
        g.beginPath();
        g.moveTo(x, r.y);
        g.lineTo(x, r.y + r.h);
        g.stroke();
      }
      for (let j = 1; j < divY; j++) {
        const y = r.y + (r.h * j) / divY;
        g.beginPath();
        g.moveTo(r.x, y);
        g.lineTo(r.x + r.w, y);
        g.stroke();
      }
      g.strokeStyle = 'rgba(120,255,170,0.32)';
      g.beginPath();
      g.moveTo(r.x, r.y + r.h / 2);
      g.lineTo(r.x + r.w, r.y + r.h / 2);
      g.stroke();
      g.restore();
    }
    function trace(g: CanvasRenderingContext2D, r: Rect, fn: (t: number) => number, span: number, col: string, width = 2.4, dash?: number[]): void {
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.clip();
      g.strokeStyle = col;
      g.lineWidth = width;
      g.shadowColor = col;
      g.shadowBlur = 8;
      if (dash) g.setLineDash(dash);
      g.beginPath();
      const n = Math.max(200, Math.round(r.w * 1.5));
      for (let i = 0; i <= n; i++) {
        const t = (span * i) / n;
        const x = r.x + (r.w * i) / n;
        const y = r.y + r.h / 2 - fn(t) * (r.h * 0.42);
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      g.restore();
    }

    /** Messmarken als Anteil der Bildschirmbreite (0 … 1). */
    const cursors: [number, number] = [0.2, 0.55];
    let scopeRect: Rect = { x: 0, y: 0, w: 1, h: 1 };
    let dragCur = -1;
    const curX = (i: number) => scopeRect.x + cursors[i]! * scopeRect.w;
    const deltaT = () => Math.abs(cursors[1] - cursors[0]) * tbNow() * 10;
    function nearCursor(px: number, py: number): number {
      if (p.mode !== 'osc' || !p.cur || py < scopeRect.y - 6 || py > scopeRect.y + scopeRect.h + 6) return -1;
      const d0 = Math.abs(px - curX(0));
      const d1 = Math.abs(px - curX(1));
      const best = d0 <= d1 ? 0 : 1;
      return Math.min(d0, d1) < (narrow() ? 20 : 12) ? best : -1;
    }
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && nearCursor(px, py) >= 0,
      pointerDown: (q: { px: number; py: number }) => {
        const i = ctx.locked ? -1 : nearCursor(q.px, q.py);
        if (i < 0) return false;
        dragCur = i;
        surface.setCursor('ew-resize');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (dragCur < 0) return;
        cursors[dragCur] = clamp((q.px - scopeRect.x) / scopeRect.w, 0, 1);
        updateReadouts();
        ctx.requestRender();
      },
      pointerUp: () => {
        dragCur = -1;
        surface.setCursor('');
      },
      hover: (q: { px: number; py: number } | null) => surface.setCursor(q && nearCursor(q.px, q.py) >= 0 ? 'ew-resize' : ''),
      wheel: () => false,
    });
    function drawCursors(g: CanvasRenderingContext2D, sr: Rect): void {
      const t = th();
      g.save();
      for (const i of [0, 1]) {
        const x = curX(i);
        g.strokeStyle = i ? '#ff9ad5' : '#ffd27a';
        g.lineWidth = dragCur === i ? 2.6 : 1.8;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(x, sr.y);
        g.lineTo(x, sr.y + sr.h);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = g.strokeStyle;
        g.beginPath();
        g.moveTo(x, sr.y + sr.h);
        g.lineTo(x - 7, sr.y + sr.h + 9);
        g.lineTo(x + 7, sr.y + sr.h + 9);
        g.closePath();
        g.fill();
      }
      const dt = deltaT();
      g.font = `700 12px ${t.font}`;
      g.fillStyle = '#ffffff';
      g.textAlign = 'center';
      const mid = (curX(0) + curX(1)) / 2;
      const txt = `Δt = ${dt >= 1e-3 ? `${N(dt * 1000, 2)} ms` : `${N(dt * 1e6, 0)} µs`}${dt > 0 ? `  →  1/Δt = ${N(1 / dt, 0)} Hz` : ''}`;
      const w = g.measureText(txt).width + 12;
      g.fillStyle = 'rgba(0,0,0,0.6)';
      roundRect(g, clamp(mid - w / 2, sr.x + 2, sr.x + sr.w - w - 2), sr.y + sr.h - 26, w, 20, 5);
      g.fill();
      g.fillStyle = '#ffffff';
      g.fillText(txt, clamp(mid, sr.x + w / 2 + 2, sr.x + sr.w - w / 2 - 2), sr.y + sr.h - 12);
      g.restore();
    }

    function drawOsc(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const spW = narrow() ? 70 : 110;
      const amp = p.amp / 100;
      const h0 = harmonics(p.tim as Timbre);
      // Lautsprecher links, Membran schwingt sichtbar (verlangsamt)
      const shift = Math.sin(simT * TAU * 2.2) * amp * (narrow() ? 4 : 6);
      speaker(g, R.x + spW * 0.45, R.y + R.h / 2, Math.min(spW * 1.1, R.h * 0.4), shift);
      // Schallwellen als Bögen vor dem Lautsprecher
      g.save();
      for (let k = 0; k < 4; k++) {
        const ph = (simT * 0.9 + k / 4) % 1;
        g.strokeStyle = withAlpha(COL.orange(), (1 - ph) * 0.5 * amp + 0.05);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(R.x + spW * 0.55, R.y + R.h / 2, 16 + ph * spW * 0.5, -0.6, 0.6);
        g.stroke();
      }
      g.restore();
      // Bildschirm
      const sr: Rect = { x: R.x + spW + 6, y: R.y + 34, w: R.w - spW - 20, h: R.h - 64 };
      scopeRect = sr;
      const divX = 10;
      const divY = 8;
      scopeScreen(g, sr, divX, divY);
      const tb = tbNow();
      const span = tb * divX;
      if (p.ref) trace(g, sr, (tt) => 0.6 * Math.sin(TAU * 440 * tt), span, 'rgba(150,200,255,0.75)', 1.6, [5, 4]);
      trace(g, sr, (tt) => amp * waveform(p.tim as Timbre, p.f, tt, h0), span, '#7dffa0', 2.6);
      if (p.cur) drawCursors(g, sr);
      // Periodendauer markieren
      if (p.val && p.amp > 0) {
        const T = period(p.f);
        const x0 = sr.x + sr.w * (T * 0.25 / span);
        const x1 = sr.x + sr.w * (T * 1.25 / span);
        if (x1 < sr.x + sr.w - 4) {
          const y = sr.y + 14;
          g.save();
          g.strokeStyle = '#ffd27a';
          g.fillStyle = '#ffd27a';
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(x0, y);
          g.lineTo(x1, y);
          g.moveTo(x0, y - 5);
          g.lineTo(x0, y + 5);
          g.moveTo(x1, y - 5);
          g.lineTo(x1, y + 5);
          g.stroke();
          g.font = `700 12px ${t.font}`;
          g.textAlign = 'center';
          g.fillText(`T = ${N(T * 1000, 2)} ms`, (x0 + x1) / 2, y + 16);
          g.restore();
        }
      }
      g.save();
      g.font = `700 ${narrow() ? 12 : 13}px ${t.font}`;
      g.fillStyle = t.text;
      g.textAlign = 'left';
      g.fillText(ctx.t('scope'), sr.x, R.y + 22);
      g.font = `600 12px ${t.font}`;
      g.fillStyle = t.muted;
      g.textAlign = 'right';
      g.fillText(`${tb >= 1e-3 ? `${N(tb * 1000, 0)} ms` : `${N(tb * 1e6, 0)} µs`} ${ctx.t('div')}`, sr.x + sr.w, R.y + R.h - 12);
      g.restore();
    }

    function drawSpectrum(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const h = harmonics(p.tim as Timbre, 10);
      const fMax = p.f * 10.8;
      plotC.setRange([-fMax * 0.04, fMax], [-0.12, 1.15]);
      plotC.setAxes({ x: { label: ctx.t('fAx') }, y: { label: '', numbers: false } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      const amp = p.amp / 100;
      h.forEach((a, k) => {
        if (a <= 0.001) return;
        const f = p.f * (k + 1);
        const [x0, y0] = plotC.toPx(f, a * amp);
        const [, yb] = plotC.toPx(f, 0);
        g.save();
        g.fillStyle = k === 0 ? COL.green() : withAlpha(COL.blue(), 0.8);
        g.fillRect(x0 - 5, y0, 10, yb - y0);
        g.restore();
        if (k < 4 && p.val) plotC.text(f, a * amp, k === 0 ? 'f' : `${k + 1}f`, { color: th().muted, size: 11, weight: 'bold', offset: [0, -10], halo: true });
      });
      plotC.end();
      chartTitle(g, R, ctx.t('spectrum'));
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 2: Schallausbreitung (Teilchenmodell)                   */
    /* -------------------------------------------------------------- */

    /** Anzeige stark verlangsamt: eine Schwingung in etwa 1,4 s. */
    const F_VIS = 0.7;
    let waveStart = 0;
    const lamAir = () => C_AIR / p.f;
    const lamMed = () => cNow() / p.f;
    const viewLen = () => 3.2 * lamAir();
    function waveGeo(R: Rect) {
      const spW = narrow() ? 52 : 80;
      const x0 = R.x + spW + 14;
      const x1 = R.x + R.w - 14;
      return { spW, x0, x1, top: R.y + 46, bottom: R.y + R.h - 28 };
    }
    function drawWave(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const G = waveGeo(R);
      const med = medium(p.med);
      const amp = p.amp / 100;
      const phase = F_VIS * simT;
      const shift = Math.sin(phase * TAU) * amp * (narrow() ? 4 : 6);
      speaker(g, R.x + G.spW * 0.42, (G.top + G.bottom) / 2, Math.min(G.spW * 1.2, (G.bottom - G.top) * 0.5), shift);
      const Lv = viewLen();
      const toX = (m: number) => G.x0 + (m / Lv) * (G.x1 - G.x0);
      const lam = lamMed();
      const front = med.c > 0 ? lam * F_VIS * (simT - waveStart) : 0;
      if (med.c === 0) {
        g.save();
        g.font = `700 ${narrow() ? 13 : 15}px ${t.font}`;
        g.fillStyle = COL.red();
        g.textAlign = 'center';
        g.fillText(ctx.lang === 'de' ? 'Vakuum: keine Teilchen' : 'vacuum: no particles', (G.x0 + G.x1) / 2, (G.top + G.bottom) / 2);
        g.restore();
      } else {
        const gap = med.phase === 'solid' ? 9 : med.phase === 'liquid' ? 11 : 14;
        const rows = Math.max(4, Math.floor((G.bottom - G.top) / gap));
        const cols = Math.floor((G.x1 - G.x0) / gap);
        const sPx = (narrow() ? 5 : 7) * amp;
        let seed = 7;
        const jitter = () => {
          seed = (seed * 16807) % 2147483647;
          return seed / 2147483647 - 0.5;
        };
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i <= cols; i++) {
            const xr = G.x0 + i * gap + (med.phase === 'gas' ? jitter() * gap * 0.5 : 0);
            const yr = G.top + (j + 0.5) * ((G.bottom - G.top) / rows) + (med.phase === 'gas' ? jitter() * gap * 0.4 : 0);
            const m = ((xr - G.x0) / (G.x1 - G.x0)) * Lv;
            const on = m <= front;
            const s = on ? displacement(m, phase / p.f, p.f, lam, 1) * sPx : 0;
            const pr = on ? pressureDev(m, phase / p.f, p.f, lam) * amp : 0;
            g.fillStyle = pr > 0 ? withAlpha(COL.red(), 0.45 + 0.5 * pr) : withAlpha(COL.blue(), 0.45 - 0.4 * pr);
            g.beginPath();
            g.arc(xr + s, yr, med.phase === 'solid' ? 2.8 : 2.4, 0, TAU);
            g.fill();
            if (i === Math.round(cols * 0.35) && j === Math.floor(rows / 2)) {
              g.strokeStyle = COL.orange();
              g.lineWidth = 2;
              g.beginPath();
              g.arc(xr + s, yr, 6, 0, TAU);
              g.stroke();
            }
          }
        }
        // Wellenlänge zwischen zwei Verdichtungen
        if (p.val && front > lam * 1.3 && lam < Lv * 0.95) {
          const m0 = (((phase % 1) + 1) % 1) * lam;
          const xa = toX(m0);
          const xb = toX(m0 + lam);
          if (xb < G.x1) {
            const y = G.top - 16;
            g.save();
            g.strokeStyle = COL.purple();
            g.fillStyle = COL.purple();
            g.lineWidth = 1.8;
            g.beginPath();
            g.moveTo(xa, y);
            g.lineTo(xb, y);
            g.moveTo(xa, y - 6);
            g.lineTo(xa, y + 6);
            g.moveTo(xb, y - 6);
            g.lineTo(xb, y + 6);
            g.stroke();
            g.font = `700 12px ${t.font}`;
            g.textAlign = 'center';
            g.fillText(`λ = ${lam >= 1 ? `${N(lam, 2)} m` : `${N(lam * 100, 1)} cm`}`, (xa + xb) / 2, y - 8);
            g.restore();
          }
        }
      }
      g.save();
      g.font = `700 ${narrow() ? 12 : 13}px ${t.font}`;
      g.fillStyle = t.text;
      g.textAlign = 'left';
      g.fillText(`${ctx.lang === 'de' ? med.de : med.en}: c = ${N(cNow(), 0)} m/s`, G.x0, R.y + R.h - 8);
      g.restore();
    }
    function drawWaveChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const Lv = viewLen();
      plotC.setRange([-Lv * 0.04, Lv], [-1.3, 1.3]);
      plotC.setAxes({ x: { label: ctx.t('xAx') }, y: { label: ctx.t('pressure'), numbers: false } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      const lam = lamMed();
      const phase = F_VIS * simT;
      const front = medium(p.med).c > 0 ? lam * F_VIS * (simT - waveStart) : 0;
      const amp = p.amp / 100;
      plotC.fn((x) => (x <= front ? amp * pressureDev(x, phase / p.f, p.f, lam) : 0), { color: COL.red(), width: 2.4 });
      plotC.end();
      chartTitle(g, R, ctx.lang === 'de' ? 'Druck entlang der Welle (rot = Verdichtung)' : 'pressure along the wave (red = compression)');
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 3: Pegel und Entfernung                                 */
    /* -------------------------------------------------------------- */

    const levelAt = (r: number) => splAtDistance(addLevels(Array.from({ length: p.n }, () => p.L1)), 1, r);
    const R_MIN = 1;
    const R_MAX = 200;
    function levelGeo(R: Rect) {
      const barW = Math.min(175, R.w * 0.36);
      const x0 = R.x + (narrow() ? 56 : 80);
      const x1 = R.x + R.w - barW - 34;
      const y = R.y + R.h * 0.55;
      return { x0, x1, y, barX: R.x + R.w - barW - 12, barW, rx: (r: number) => x0 + (Math.log10(r / R_MIN) / Math.log10(R_MAX / R_MIN)) * (x1 - x0) };
    }
    let earPos: [number, number] = [0, 0];
    let dragEar = false;
    function drawLevel(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const G = levelGeo(R);
      const Lr = levelAt(p.r);
      // Quellen
      for (let i = 0; i < p.n; i++) {
        const off = (i - (p.n - 1) / 2) * Math.min(28, 120 / p.n);
        speaker(g, R.x + (narrow() ? 26 : 38), G.y + off, narrow() ? 34 : 44, Math.sin(simT * 14 + i) * 2);
      }
      // Wellenfronten, werden mit der Entfernung schwächer
      g.save();
      for (let k = 0; k < 7; k++) {
        const ph = (simT * 0.5 + k / 7) % 1;
        const rr = R_MIN * Math.pow(R_MAX / R_MIN, ph);
        const x = G.rx(rr);
        g.strokeStyle = withAlpha(COL.orange(), clamp((levelAt(rr) - 20) / 120, 0.05, 0.75) * (1 - ph * 0.6));
        g.lineWidth = 2;
        g.beginPath();
        g.arc(G.x0 - 20, G.y, x - G.x0 + 20, -0.55, 0.55);
        g.stroke();
      }
      g.restore();
      // Maßstab
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.35);
      g.fillStyle = t.muted;
      g.font = `500 11px ${t.font}`;
      g.textAlign = 'center';
      g.beginPath();
      g.moveTo(G.x0, G.y + 60);
      g.lineTo(G.x1, G.y + 60);
      g.stroke();
      let lastX = -1e9;
      for (const r of [1, 2, 4, 8, 16, 32, 64, 128]) {
        const x = G.rx(r);
        g.beginPath();
        g.moveTo(x, G.y + 56);
        g.lineTo(x, G.y + 64);
        g.stroke();
        if (x - lastX > 34) {
          g.fillText(`${r} m`, x, G.y + 78);
          lastX = x;
        }
      }
      g.restore();
      // Ohr
      const ex = G.rx(p.r);
      earPos = [ex, G.y];
      g.save();
      g.fillStyle = '#f0c8a8';
      g.strokeStyle = '#a0705a';
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(ex, G.y, 13, 20, 0, 0, TAU);
      g.fill();
      g.stroke();
      g.beginPath();
      g.arc(ex + 2, G.y - 2, 7, -2.2, 1.6);
      g.stroke();
      if (dragEar) {
        g.strokeStyle = COL.purple();
        g.beginPath();
        g.arc(ex, G.y, 26, 0, TAU);
        g.stroke();
      }
      g.restore();
      if (p.val) {
        g.save();
        g.font = `800 ${narrow() ? 14 : 16}px ${t.font}`;
        g.textAlign = 'center';
        const risk = hearingRisk(Lr);
        g.fillStyle = risk === 'danger' ? COL.red() : risk === 'long' ? COL.orange() : COL.green();
        g.fillText(`${N(Lr, 1)} dB`, ex, G.y - 32);
        g.restore();
      }
      // Pegelskala
      const top = R.y + 20;
      const bot = R.y + R.h - 20;
      const Y = (Ld: number) => bot - (clamp(Ld, 0, 140) / 140) * (bot - top);
      g.save();
      const grad = g.createLinearGradient(0, bot, 0, top);
      grad.addColorStop(0, withAlpha(COL.green(), 0.5));
      grad.addColorStop(85 / 140, withAlpha(COL.orange(), 0.55));
      grad.addColorStop(1, withAlpha(COL.red(), 0.7));
      g.fillStyle = grad;
      roundRect(g, G.barX, top, 12, bot - top, 6);
      g.fill();
      g.font = `500 11px ${t.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      let lastY = 1e9;
      for (const nz of NOISES) {
        const y = Y(nz.L);
        if (Math.abs(lastY - y) < 13) continue;
        lastY = y;
        g.fillStyle = t.muted;
        g.fillRect(G.barX + 13, y, 5, 1);
        let label = `${nz.L} ${ctx.lang === 'de' ? nz.de : nz.en}`;
        const room = R.x + R.w - (G.barX + 20) - 8;
        while (label.length > 4 && g.measureText(label).width > room) label = `${label.slice(0, -2)}…`;
        g.fillText(label, G.barX + 20, y);
      }
      const my = Y(Lr);
      g.fillStyle = t.text;
      g.beginPath();
      g.moveTo(G.barX - 2, my);
      g.lineTo(G.barX - 12, my - 6);
      g.lineTo(G.barX - 12, my + 6);
      g.closePath();
      g.fill();
      g.restore();
    }
    surface.addTarget({
      contains: (px: number, py: number) => p.mode === 'level' && !ctx.locked && Math.hypot(px - earPos[0], py - earPos[1]) < 30,
      pointerDown: (q: { px: number; py: number }) => {
        if (p.mode !== 'level' || ctx.locked || Math.hypot(q.px - earPos[0], q.py - earPos[1]) > 30) return false;
        dragEar = true;
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!dragEar) return;
        const G = levelGeo(lay.scene);
        const u = clamp((q.px - G.x0) / (G.x1 - G.x0), 0, 1);
        const r = R_MIN * Math.pow(R_MAX / R_MIN, u);
        ctx.set({ r: r < 10 ? Math.round(r * 2) / 2 : Math.round(r) });
      },
      pointerUp: () => {
        dragEar = false;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = !!q && p.mode === 'level' && Math.hypot(q.px - earPos[0], q.py - earPos[1]) < 30;
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });
    function drawLevelChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const lr = Math.log10(R_MAX);
      plotC.setRange([-lr * 0.22, lr], [-14, 140]);
      plotC.setAxes({ x: { label: ctx.t('rAx'), format: (v) => fmt.num(Math.pow(10, v), v < 1 ? 1 : 0) }, y: { label: ctx.t('lAx') } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      const [x0, y85] = plotC.toPx(0, 85);
      const [x1, y120] = plotC.toPx(lr, 120);
      const [, y140] = plotC.toPx(0, 140);
      g.fillStyle = withAlpha(COL.orange(), 0.1);
      g.fillRect(x0, y120, x1 - x0, y85 - y120);
      g.fillStyle = withAlpha(COL.red(), 0.12);
      g.fillRect(x0, y140, x1 - x0, y120 - y140);
      plotC.axes();
      plotC.fn((u) => levelAt(Math.pow(10, u)), { color: COL.blue(), width: 2.4, from: 0 });
      plotC.point(Math.log10(p.r), levelAt(p.r), { color: COL.purple(), radius: 6 });
      plotC.end();
      chartTitle(g, R, ctx.lang === 'de' ? 'Pegel über der Entfernung: −6 dB je Verdopplung' : 'Level against distance: −6 dB per doubling');
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 4: Hörbereich                                           */
    /* -------------------------------------------------------------- */

    const F_LO = 1;
    const F_HI = 200_000;
    function drawRange(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const x0 = R.x + (narrow() ? 80 : 110);
      const x1 = R.x + R.w - 18;
      const X = (f: number) => x0 + (Math.log10(f / F_LO) / Math.log10(F_HI / F_LO)) * (x1 - x0);
      const top = R.y + 36;
      const bot = R.y + R.h - 42;
      // Infra- und Ultraschall
      g.save();
      g.fillStyle = withAlpha(COL.purple(), 0.08);
      g.fillRect(x0, top - 10, X(20) - x0, bot - top + 14);
      g.fillStyle = withAlpha(COL.teal(), 0.08);
      g.fillRect(X(20_000), top - 10, x1 - X(20_000), bot - top + 14);
      g.font = `700 11px ${t.font}`;
      g.fillStyle = COL.purple();
      g.textAlign = 'center';
      g.fillText(ctx.t('infra'), (x0 + X(20)) / 2, top - 16);
      g.fillStyle = COL.teal();
      g.fillText(ctx.t('ultra'), (X(20_000) + x1) / 2, top - 16);
      g.restore();
      // Balken je Lebewesen
      const rowH = (bot - top) / HEARING.length;
      const f = fRange();
      HEARING.forEach((hh, i) => {
        const y = top + i * rowH + rowH * 0.2;
        const hears = f >= hh.min && f <= hh.max;
        g.save();
        g.fillStyle = withAlpha(i === 0 ? COL.green() : COL.blue(), hears ? 0.8 : 0.35);
        roundRect(g, X(hh.min), y, X(hh.max) - X(hh.min), rowH * 0.6, 5);
        g.fill();
        g.font = `${i === 0 ? 800 : 600} ${narrow() ? 11 : 12}px ${t.font}`;
        g.fillStyle = hears ? t.text : t.muted;
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        g.fillText(ctx.lang === 'de' ? hh.de : hh.en, x0 - 8, y + rowH * 0.3);
        g.restore();
      });
      // Achse
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.4);
      g.fillStyle = t.muted;
      g.font = `500 11px ${t.font}`;
      g.textAlign = 'center';
      g.beginPath();
      g.moveTo(x0, bot + 6);
      g.lineTo(x1, bot + 6);
      g.stroke();
      for (const v of [1, 10, 100, 1000, 10_000, 100_000]) {
        const x = X(v);
        g.beginPath();
        g.moveTo(x, bot + 2);
        g.lineTo(x, bot + 10);
        g.stroke();
        g.fillText(v >= 1000 ? `${N(v / 1000, 0)} kHz` : `${v} Hz`, x, bot + 22);
      }
      // Marke
      const xf = X(f);
      g.strokeStyle = COL.orange();
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(xf, top - 6);
      g.lineTo(xf, bot + 6);
      g.stroke();
      g.fillStyle = COL.orange();
      g.font = `800 12px ${t.font}`;
      g.fillText(`${f >= 1000 ? `${N(f / 1000, 1)} kHz` : `${N(f, 0)} Hz`}`, clamp(xf, x0 + 30, x1 - 30), bot + 36);
      g.restore();
    }
    function drawThreshold(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      plotC.setRange([Math.log10(16), Math.log10(22_000)], [-15, 130]);
      plotC.setAxes({ x: { label: ctx.t('fAx'), format: (v) => (Math.pow(10, v) >= 1000 ? `${fmt.num(Math.pow(10, v) / 1000, 0)}k` : fmt.num(Math.pow(10, v), 0)), minStep: 1 }, y: { label: ctx.t('lAx') } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.fillBetween((u) => Math.min(130, hearingThreshold(Math.pow(10, u))), () => 130, Math.log10(20), Math.log10(20_000), { fill: withAlpha(COL.green(), 0.12) });
      plotC.axes();
      plotC.fn((u) => hearingThreshold(Math.pow(10, u)), { color: COL.green(), width: 2.4, from: Math.log10(16), to: Math.log10(22_000) });
      const f = fRange();
      if (f >= 16 && f <= 22_000) plotC.point(Math.log10(f), p.L1, { color: audible(f, p.L1) ? COL.green() : COL.red(), radius: 6 });
      plotC.end();
      chartTitle(g, R, `${ctx.t('threshold')} (${ctx.lang === 'de' ? 'grün: hörbar' : 'green: audible'})`);
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 5: Echo                                                 */
    /* -------------------------------------------------------------- */

    /** Start des Rufs (Anzeigezeit) oder null. */
    let shoutAt: number | null = null;
    /** Die Animation dauert etwa 2,5 s, die Uhr zeigt echte Sekunden. */
    const echoScale = () => echoTime(p.d, Math.max(cNow(), 1)) / 2.5;
    const echoElapsed = () => (shoutAt === null ? 0 : (simT - shoutAt) * echoScale());
    let wallPos: [number, number] = [0, 0];
    let dragWall = false;
    function echoGeo(R: Rect) {
      const x0 = R.x + (narrow() ? 46 : 70);
      const x1 = R.x + R.w - (narrow() ? 40 : 60);
      const ground = R.y + R.h * 0.72;
      const Lv = Math.max(60, p.d * 1.12);
      return { x0, x1, ground, Lv, X: (m: number) => x0 + (m / Lv) * (x1 - x0) };
    }
    function drawEcho(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const G = echoGeo(R);
      const c = cNow();
      // Boden und Himmel
      g.save();
      const sky = g.createLinearGradient(0, R.y, 0, G.ground);
      sky.addColorStop(0, t.dark ? 'rgba(60,90,140,0.25)' : 'rgba(150,190,240,0.25)');
      sky.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = sky;
      roundRect(g, R.x + 4, R.y + 4, R.w - 8, G.ground - R.y - 4, 10);
      g.fill();
      g.fillStyle = withAlpha(COL.green(), t.dark ? 0.35 : 0.25);
      g.fillRect(R.x + 4, G.ground, R.w - 8, R.y + R.h - G.ground - 6);
      g.restore();
      // Felswand
      const wx = G.X(p.d);
      wallPos = [wx, G.ground - 60];
      g.save();
      g.fillStyle = t.dark ? '#6b6258' : '#9a8f82';
      g.beginPath();
      g.moveTo(wx, G.ground);
      g.lineTo(wx - 6, G.ground - 50);
      g.lineTo(wx + 4, G.ground - 110);
      g.lineTo(wx - 2, G.ground - 160);
      g.lineTo(R.x + R.w - 6, G.ground - 175);
      g.lineTo(R.x + R.w - 6, G.ground);
      g.closePath();
      g.fill();
      if (dragWall) {
        g.strokeStyle = COL.purple();
        g.lineWidth = 3;
        g.stroke();
      }
      g.restore();
      // Person
      const px = G.X(0);
      g.save();
      g.strokeStyle = t.text;
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(px, G.ground - 52, 8, 0, TAU);
      g.moveTo(px, G.ground - 44);
      g.lineTo(px, G.ground - 20);
      g.lineTo(px - 8, G.ground);
      g.moveTo(px, G.ground - 20);
      g.lineTo(px + 8, G.ground);
      g.moveTo(px, G.ground - 36);
      g.lineTo(px + 12, G.ground - 46);
      g.moveTo(px, G.ground - 36);
      g.lineTo(px + 10, G.ground - 28);
      g.stroke();
      g.restore();
      // Schallfronten
      const te = echoElapsed();
      const tEcho = echoTime(p.d, Math.max(c, 1));
      if (shoutAt !== null && c > 0) {
        const s = c * te; // zurückgelegter Weg in m
        g.save();
        g.lineWidth = 3;
        for (let k = 0; k < 3; k++) {
          const sk = s - k * p.d * 0.06;
          if (sk <= 0) continue;
          const alpha = 0.85 - k * 0.25;
          if (sk <= p.d) {
            const rr = G.X(sk) - px;
            g.strokeStyle = withAlpha(COL.orange(), alpha);
            g.beginPath();
            g.arc(px, G.ground - 40, rr, -0.5, 0.5);
            g.stroke();
          } else if (sk <= 2 * p.d) {
            const back = sk - p.d;
            const rr = (back / G.Lv) * (G.x1 - G.x0);
            g.strokeStyle = withAlpha(COL.blue(), alpha);
            g.beginPath();
            g.arc(wx, G.ground - 40, rr, Math.PI - 0.5, Math.PI + 0.5);
            g.stroke();
          }
        }
        g.restore();
        // Sprechblasen
        g.save();
        g.font = `800 ${narrow() ? 13 : 15}px ${t.font}`;
        g.textAlign = 'left';
        if (te < tEcho * 0.4) {
          g.fillStyle = COL.orange();
          g.fillText(ctx.t('shout'), px + 16, G.ground - 74);
        }
        if (te >= tEcho) {
          g.fillStyle = withAlpha(COL.blue(), 0.85);
          g.fillText(`… ${ctx.t('shout').toLowerCase()}`, px + 16, G.ground - 74);
        }
        g.restore();
      }
      // Entfernungspfeil
      g.save();
      g.strokeStyle = t.muted;
      g.fillStyle = t.muted;
      g.lineWidth = 1.4;
      const ay = G.ground + 22;
      g.beginPath();
      g.moveTo(px, ay);
      g.lineTo(wx, ay);
      g.stroke();
      g.font = `700 12px ${t.font}`;
      g.textAlign = 'center';
      g.fillStyle = t.text;
      g.fillText(`d = ${N(p.d, 0)} m`, (px + wx) / 2, ay + 16);
      g.restore();
      // Stoppuhr
      const shown = shoutAt === null ? 0 : Math.min(te, tEcho);
      g.save();
      const sw = narrow() ? 118 : 150;
      const sx = R.x + 14;
      const sy = R.y + 14;
      g.fillStyle = t.dark ? '#222a36' : '#eef1f5';
      roundRect(g, sx, sy, sw, 44, 8);
      g.fill();
      g.font = `800 ${narrow() ? 18 : 22}px ${t.font}`;
      g.fillStyle = te >= tEcho && shoutAt !== null ? COL.green() : t.text;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(`${N(shown, 2)} s`, sx + sw / 2, sy + 22);
      g.restore();
      if (c === 0) {
        g.save();
        g.font = `700 14px ${t.font}`;
        g.fillStyle = COL.red();
        g.textAlign = 'center';
        g.fillText(ctx.t('vacuum'), R.x + R.w / 2, R.y + 80);
        g.restore();
      }
      if (shoutAt !== null && te < tEcho * 1.05) animating = true;
    }
    surface.addTarget({
      contains: (px: number, py: number) => p.mode === 'echo' && !ctx.locked && Math.abs(px - wallPos[0]) < 26 && Math.abs(py - wallPos[1]) < 70,
      pointerDown: (q: { px: number; py: number }) => {
        if (p.mode !== 'echo' || ctx.locked || Math.abs(q.px - wallPos[0]) > 26 || Math.abs(q.py - wallPos[1]) > 70) return false;
        dragWall = true;
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!dragWall) return;
        const G = echoGeo(lay.scene);
        const m = ((q.px - G.x0) / (G.x1 - G.x0)) * G.Lv;
        ctx.set({ d: clamp(Math.round(m), 5, 600) });
      },
      pointerUp: () => {
        dragWall = false;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = !!q && p.mode === 'echo' && Math.abs(q.px - wallPos[0]) < 26 && Math.abs(q.py - wallPos[1]) < 70;
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });
    function drawEchoChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const c = Math.max(cNow(), 1);
      const tMax = Math.max(1, echoTime(600, c)) * 1.05;
      plotC.setRange([-tMax * 0.2, tMax], [-60, 640]);
      plotC.setAxes({ x: { label: 't in s' }, y: { label: 'd in m' } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      const [xa, ya] = plotC.toPx(0, echoMinDistance(c));
      const [xb, yb] = plotC.toPx(0.1, 0);
      g.fillStyle = withAlpha(COL.orange(), 0.15);
      g.fillRect(xa, ya, xb - xa, yb - ya);
      plotC.axes();
      plotC.fn((tt) => (c * tt) / 2, { color: COL.blue(), width: 2.4, from: 0 });
      plotC.point(echoTime(p.d, c), p.d, { color: COL.purple(), radius: 6 });
      plotC.end();
      chartTitle(g, R, ctx.lang === 'de' ? 'd = c · t / 2 (orange: Nachhall, kein getrenntes Echo)' : 'd = c · t / 2 (orange: reverberation, no separate echo)');
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 6: Schwebung                                            */
    /* -------------------------------------------------------------- */

    function drawBeat(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const f1 = p.f;
      const f2 = p.f + p.df;
      const top: Rect = { x: R.x + 14, y: R.y + 34, w: R.w - 28, h: (R.h - 78) * 0.38 };
      const bot: Rect = { x: R.x + 14, y: top.y + top.h + 30, w: R.w - 28, h: (R.h - 78) * 0.62 };
      scopeScreen(g, top, 10, 4);
      scopeScreen(g, bot, 10, 6);
      const spanTop = 4 / f1;
      trace(g, top, (tt) => 0.8 * Math.sin(TAU * f1 * tt), spanTop, '#7dffa0', 2);
      trace(g, top, (tt) => 0.8 * Math.sin(TAU * f2 * tt), spanTop, 'rgba(150,200,255,0.9)', 2, [5, 3]);
      const span = p.df > 0 ? clamp(2.5 / p.df, 0.05, 1.5) : 0.25;
      // verschoben, damit die Kurve wandert
      const off = (simT * 0.25) % (p.df > 0 ? 1 / p.df : 1);
      trace(g, bot, (tt) => 0.95 * twoTones(f1, f2, tt + off), span, '#7dffa0', 1.2);
      if (p.df > 0) {
        trace(g, bot, (tt) => 0.95 * Math.abs(Math.cos(Math.PI * p.df * (tt + off))), span, 'rgba(255,210,122,0.9)', 2, [6, 4]);
        trace(g, bot, (tt) => -0.95 * Math.abs(Math.cos(Math.PI * p.df * (tt + off))), span, 'rgba(255,210,122,0.9)', 2, [6, 4]);
      }
      g.save();
      g.font = `700 12px ${t.font}`;
      g.fillStyle = t.text;
      g.textAlign = 'left';
      g.fillText(`${N(f1, 0)} Hz  ·  ${N(f2, 1)} Hz`, top.x, R.y + 22);
      g.fillText(ctx.lang === 'de' ? `Überlagerung (${N(span * 1000, 0)} ms)` : `superposition (${N(span * 1000, 0)} ms)`, bot.x, bot.y - 8);
      g.restore();
    }
    function drawBeatChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const span = 2;
      plotC.setRange([-0.1, span], [-0.15, 1.38]);
      plotC.setAxes({ x: { label: 't in s' }, y: { label: '', numbers: false } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      plotC.fn((tt) => Math.pow(Math.cos(Math.PI * p.df * tt), 2), { color: COL.orange(), width: 2.4, from: 0 });
      if (p.df > 0 && 1 / p.df < span) {
        const Ts = 1 / p.df;
        plotC.segment([0, 1.08], [Ts, 1.08], { color: COL.purple(), width: 2 });
        plotC.text(Ts / 2, 1.08, `T_S = ${N(Ts, 2)} s`, { color: COL.purple(), size: 11, weight: 'bold', offset: [0, -10], halo: true });
      }
      plotC.end();
      chartTitle(g, R, ctx.lang === 'de' ? 'Lautstärke (an- und abschwellend)' : 'loudness (swelling and fading)');
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 7: Schallquellen (Saite und Pfeife)                     */
    /* -------------------------------------------------------------- */

    function drawSource(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const t = th();
      const n = p.hn;
      const f = srcFreq();
      const x0 = R.x + 40;
      const fullW = R.w - 80;
      const len = fullW * (p.sl / 100);
      const x1 = x0 + len;
      const cy = R.y + R.h * 0.5;
      const amp = Math.min(70, R.h * 0.24);
      const ph = Math.cos(simT * TAU * 1.1);
      if (p.src === 'string') {
        // Steg, Saite und Hüllkurve der stehenden Welle
        g.save();
        g.fillStyle = t.dark ? '#6b5a44' : '#a8875f';
        g.fillRect(x0 - 8, cy - 18, 8, 36);
        g.fillRect(x1, cy - 18, 8, 36);
        g.strokeStyle = withAlpha(COL.blue(), 0.25);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.2;
        for (const sgn of [1, -1]) {
          g.beginPath();
          for (let i = 0; i <= 120; i++) {
            const u = i / 120;
            const x = x0 + u * len;
            const y = cy - sgn * amp * Math.sin(n * Math.PI * u);
            if (i) g.lineTo(x, y);
            else g.moveTo(x, y);
          }
          g.stroke();
        }
        g.setLineDash([]);
        g.strokeStyle = t.dark ? '#e7e9ee' : '#3d4654';
        g.lineWidth = 2.4;
        g.beginPath();
        for (let i = 0; i <= 160; i++) {
          const u = i / 160;
          const x = x0 + u * len;
          const y = cy - amp * Math.sin(n * Math.PI * u) * ph;
          if (i) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
        // Knoten
        for (let k = 0; k <= n; k++) {
          const x = x0 + (k / n) * len;
          g.fillStyle = COL.red();
          g.beginPath();
          g.arc(x, cy, 4, 0, TAU);
          g.fill();
        }
        g.restore();
      } else {
        // Rohr mit Luftsäule
        const open = p.src === 'open';
        const ph2 = Math.sin(simT * TAU * 1.1);
        const tubeH = Math.min(150, R.h * 0.42);
        g.save();
        g.fillStyle = withAlpha(COL.teal(), 0.08);
        g.fillRect(x0, cy - tubeH / 2, len, tubeH);
        g.strokeStyle = t.text;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x0, cy - tubeH / 2);
        g.lineTo(x1, cy - tubeH / 2);
        g.moveTo(x0, cy + tubeH / 2);
        g.lineTo(x1, cy + tubeH / 2);
        if (!open) {
          g.moveTo(x1, cy - tubeH / 2);
          g.lineTo(x1, cy + tubeH / 2);
        }
        g.stroke();
        // Auslenkung: offen cos(nπx/L), gedackt cos((2n−1)πx/(2L)) mit Knoten am geschlossenen Ende
        const kx = open ? n * Math.PI : ((2 * n - 1) * Math.PI) / 2;
        const env = (u: number) => Math.cos(kx * u);
        g.strokeStyle = withAlpha(COL.blue(), 0.6);
        g.lineWidth = 1.6;
        g.setLineDash([5, 4]);
        for (const sgn of [1, -1]) {
          g.beginPath();
          for (let i = 0; i <= 120; i++) {
            const u = i / 120;
            const y = cy - sgn * (tubeH * 0.42) * Math.abs(env(u));
            if (i) g.lineTo(x0 + u * len, y);
            else g.moveTo(x0 + u * len, y);
          }
          g.stroke();
        }
        g.setLineDash([]);
        // Luftteilchen schwingen längs
        const cols = Math.max(8, Math.floor(len / 11));
        for (let j = 0; j < 5; j++) {
          for (let i = 0; i <= cols; i++) {
            const u = i / cols;
            const x = x0 + u * len + env(u) * ph2 * 6;
            const y = cy - tubeH * 0.35 + (j * tubeH * 0.7) / 4;
            g.fillStyle = withAlpha(COL.blue(), 0.7);
            g.beginPath();
            g.arc(x, y, 2.2, 0, TAU);
            g.fill();
          }
        }
        g.restore();
        g.save();
        g.font = `600 11px ${t.font}`;
        g.fillStyle = t.muted;
        g.textAlign = 'center';
        g.fillText(ctx.t('antinode'), x0, cy + tubeH / 2 + 16);
        g.fillText(open ? ctx.t('antinode') : ctx.t('node'), x1, cy + tubeH / 2 + 16);
        g.restore();
      }
      // Längenangabe und Frequenz
      g.save();
      g.strokeStyle = t.muted;
      g.lineWidth = 1.2;
      const ly = R.y + R.h - 30;
      g.beginPath();
      g.moveTo(x0, ly);
      g.lineTo(x1, ly);
      g.stroke();
      g.font = `700 12px ${t.font}`;
      g.fillStyle = t.text;
      g.textAlign = 'center';
      g.fillText(`L = ${N(p.sl, 0)} cm`, (x0 + x1) / 2, ly + 16);
      g.font = `800 ${narrow() ? 15 : 18}px ${t.font}`;
      g.fillStyle = COL.purple();
      g.textAlign = 'left';
      const nt = noteOf(f);
      g.fillText(`f = ${N(f, 1)} Hz  (${ctx.lang === 'de' ? nt.de : nt.en})`, R.x + 16, R.y + 26);
      g.restore();
    }
    function drawSourceChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const fMax = Math.max(srcFreq(10, 1), srcFreq()) * 1.1;
      const yMax = Math.min(fMax, srcFreq(20, p.hn) * 1.1);
      plotC.setRange([-6, 105], [-yMax * 0.1, yMax]);
      plotC.setAxes({ x: { label: ctx.t('lenAx') }, y: { label: 'f in Hz' } });
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      for (let k = 1; k <= 4; k++) plotC.fn((Lc) => srcFreq(Lc, k), { color: k === p.hn ? COL.purple() : withAlpha(th().muted, 0.35), width: k === p.hn ? 2.4 : 1.2, from: 10, to: 100 });
      plotC.point(p.sl, srcFreq(), { color: COL.orange(), radius: 6 });
      plotC.end();
      chartTitle(g, R, ctx.lang === 'de' ? 'Frequenz über der Länge: f ∼ 1/L' : 'frequency against length: f ∝ 1/L');
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number): number {
      g.save();
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${size}px ${th().font}`;
        for (const wd of sg.s.split(/(?<= )/)) {
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 4) {
            cx = x;
            cy += size * 1.35;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + size * 1.45;
    }
    function drawInfo(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.blue());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : 14;
      let y = R.y + 22;
      const bottom = R.y + R.h - 6;
      const line = (segs: Seg[], d = 0) => {
        if (y > bottom) return;
        y += segLine(g, segs, x, y, maxW, size + d);
      };
      const muted = (s: string) => line([{ s, c: t.muted }], -1.5);
      switch (p.mode) {
        case 'osc': {
          const nt = noteOf(p.f);
          line([{ s: ctx.t('oscT'), c: COL.blue(), w: 800 }]);
          if (p.val) {
            line([{ s: `f = ${N(p.f, 0)} Hz  →  T = 1/f = ${N(period(p.f) * 1000, 3)} ms`, w: 700 }], -0.5);
            line([{ s: `λ = c/f = 343 m/s : ${N(p.f, 0)} Hz = ${N(wavelength(C_AIR, p.f), 3)} m`, w: 600 }], -1);
            line([{ s: `${ctx.t('note')}: ${ctx.lang === 'de' ? nt.de : nt.en}${nt.cents ? ` (${nt.cents > 0 ? '+' : '−'}${Math.abs(nt.cents)} Cent)` : ''}`, c: COL.purple(), w: 700 }], -1);
            line([{ s: `${ctx.lang === 'de' ? 'Pegel gegenüber 60 %' : 'level compared with 60 %'}: ${p.amp > 0 ? `${relDb() >= 0 ? '+' : '−'}${N(Math.abs(relDb()), 1)} dB` : '−∞ dB'}`, c: COL.orange(), w: 700 }], -1);
          }
          y += 4;
          if (p.cur) muted(ctx.lang === 'de' ? 'Messmarken auf zwei gleiche Stellen benachbarter Schwingungen ziehen: Δt = T, also f = 1/Δt. Genauer wird es über mehrere Perioden.' : 'Drag the cursors to two matching points of neighbouring oscillations: Δt = T, so f = 1/Δt. It gets more precise over several periods.');
          muted(ctx.t('higher'));
          muted(ctx.t('louder'));
          if (p.tim !== 'sine') muted(ctx.t('timbre'));
          return;
        }
        case 'wave': {
          const c = cNow();
          line([{ s: ctx.t('waveT'), c: COL.blue(), w: 800 }]);
          if (c > 0 && p.val) {
            line([{ s: `c = ${N(c, 0)} m/s,  f = ${N(p.f, 0)} Hz`, w: 700 }], -0.5);
            line([{ s: `λ = c / f = ${N(lamMed(), 3)} m`, c: COL.purple(), w: 800 }], 0);
            if (p.med !== 'air') line([{ s: `${ctx.lang === 'de' ? 'in Luft' : 'in air'}: λ = ${N(lamAir(), 3)} m`, c: t.muted }], -1.5);
          }
          y += 4;
          if (c === 0) line([{ s: ctx.t('vacuum'), c: COL.red(), w: 600 }], -1.5);
          muted(ctx.t('waveG'));
          return;
        }
        case 'level': {
          const Lr = levelAt(p.r);
          const risk = hearingRisk(Lr);
          line([{ s: ctx.t('levelT'), c: COL.blue(), w: 800 }]);
          if (p.val) {
            line([{ s: `L = ${N(p.L1, 0)} dB${p.n > 1 ? ` + 10 · lg ${p.n}` : ''} − 20 · lg(${N(p.r, 1)} m / 1 m) = `, c: t.text }, { s: `${N(Lr, 1)} dB`, c: COL.purple(), w: 800 }], -1);
            line([{ s: ctx.t(risk), c: risk === 'danger' ? COL.red() : risk === 'long' ? COL.orange() : COL.green(), w: 700 }], -1);
          }
          y += 4;
          muted(ctx.t('levelG'));
          return;
        }
        case 'range': {
          const f = fRange();
          const b = band(f);
          line([{ s: ctx.t('rangeT'), c: COL.blue(), w: 800 }]);
          line([{ s: `f = ${f >= 1000 ? `${N(f / 1000, 2)} kHz` : `${N(f, 1)} Hz`}: ${b === 'infra' ? ctx.t('infra') : b === 'ultra' ? ctx.t('ultra') : ctx.lang === 'de' ? 'Hörschall' : 'audible sound'}`, w: 700 }], -0.5);
          const who = HEARING.filter((hh) => f >= hh.min && f <= hh.max).map((hh) => (ctx.lang === 'de' ? hh.de : hh.en));
          line([{ s: who.length ? who.join(', ') : '–', c: COL.green(), w: 700 }], -1);
          if (p.val && f >= 16 && f <= 22_000) line([{ s: `${ctx.t('threshold')}: ${N(hearingThreshold(f), 1)} dB → ${ctx.t(audible(f, p.L1) ? 'audibleTxt' : 'notAudible')} (${N(p.L1, 0)} dB)`, c: t.muted, w: 600 }], -1.5);
          y += 4;
          muted(ctx.lang === 'de' ? 'Ultraschall nutzen Fledermäuse und Delfine zur Orientierung (Echoortung), Ärztinnen und Ärzte für Ultraschallbilder. Elefanten verständigen sich mit Infraschall über Kilometer.' : 'Bats and dolphins use ultrasound to find their way (echolocation), doctors use it for ultrasound images. Elephants communicate over kilometres with infrasound.');
          return;
        }
        case 'echo': {
          const c = cNow();
          line([{ s: ctx.t('echoT'), c: COL.blue(), w: 800 }]);
          if (p.val && c > 0) {
            line([{ s: `c = ${N(c, 1)} m/s,  d = ${N(p.d, 0)} m`, w: 700 }], -0.5);
            line([{ s: `t = 2d / c = ${N(echoTime(p.d, c), 3)} s`, c: COL.purple(), w: 800 }], 0);
          }
          if (p.d < echoMinDistance(Math.max(c, 1))) line([{ s: ctx.lang === 'de' ? 'Zu nah: Echo und Ruf verschmelzen.' : 'Too close: echo and shout merge.', c: COL.orange(), w: 700 }], -1);
          y += 4;
          muted(ctx.t('echoG'));
          return;
        }
        case 'source': {
          const f = srcFreq();
          line([{ s: ctx.t('srcT'), c: COL.blue(), w: 800 }]);
          if (p.src === 'string') {
            line([{ s: `f = n / (2L) · √(F / μ)`, w: 700 }], 0);
            if (p.val) line([{ s: `= ${p.hn} / (2 · ${N(p.sl / 100, 2)} m) · √(${N(p.ten, 0)} N / ${N(muNow() * 1000, 1)} g/m) = `, c: t.text }, { s: `${N(f, 1)} Hz`, c: COL.purple(), w: 800 }], -1.5);
            if (p.val) line([{ s: `c_Saite = √(F/μ) = ${N(stringSpeed(p.ten, muNow()), 0)} m/s`, c: t.muted }], -1.5);
          } else {
            line([{ s: p.src === 'open' ? 'f = n · c / (2L)' : 'f = (2n − 1) · c / (4L)', w: 700 }], 0);
            if (p.val) line([{ s: `= ${N(f, 1)} Hz  (c = 343 m/s)`, c: COL.purple(), w: 800 }], -1);
          }
          y += 4;
          muted(ctx.t(p.src === 'string' ? 'srcString' : p.src === 'open' ? 'srcOpen' : 'srcClosed'));
          return;
        }
        case 'beat':
          line([{ s: ctx.t('beatT'), c: COL.blue(), w: 800 }]);
          if (p.val) {
            line([{ s: `f_S = |f₂ − f₁| = ${N(beatFreq(p.f, p.f + p.df), 1)} Hz`, c: COL.purple(), w: 800 }], 0);
            if (p.df > 0) line([{ s: `T_S = 1 / f_S = ${N(1 / p.df, 3)} s`, w: 600 }], -1);
          }
          y += 4;
          muted(ctx.t('beatG'));
          return;
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      switch (p.mode) {
        case 'osc':
          ctx.readout('main', p.cur ? `Δt = ${N(deltaT() * 1000, 3)} ms, 1/Δt = ${N(1 / Math.max(deltaT(), 1e-9), 0)} Hz` : `f = ${N(p.f, 0)} Hz, T = ${N(period(p.f) * 1000, 3)} ms`);
          ctx.readout('formula', 'T = 1 / f,  λ = c / f');
          ctx.readout('extra', `λ = ${N(wavelength(C_AIR, p.f), 3)} m, ${ctx.lang === 'de' ? noteOf(p.f).de : noteOf(p.f).en}`);
          break;
        case 'wave':
          ctx.readout('main', cNow() > 0 ? `λ = ${N(lamMed(), 3)} m` : '–');
          ctx.readout('formula', 'λ = c / f');
          ctx.readout('extra', `c = ${N(cNow(), 0)} m/s`);
          break;
        case 'level':
          ctx.readout('main', `L = ${N(levelAt(p.r), 1)} dB`);
          ctx.readout('formula', 'L₂ = L₁ − 20 dB · lg(r₂ / r₁)');
          ctx.readout('extra', ctx.t(hearingRisk(levelAt(p.r))));
          break;
        case 'range':
          ctx.readout('main', `f = ${N(fRange(), 0)} Hz`);
          ctx.readout('formula', ctx.lang === 'de' ? 'Mensch: 20 Hz bis 20 kHz' : 'human: 20 Hz to 20 kHz');
          ctx.readout('extra', HEARING.filter((hh) => fRange() >= hh.min && fRange() <= hh.max).map((hh) => (ctx.lang === 'de' ? hh.de : hh.en)).join(', ') || '–');
          break;
        case 'echo':
          ctx.readout('main', cNow() > 0 ? `t = ${N(echoTime(p.d, cNow()), 3)} s` : '–');
          ctx.readout('formula', 'd = c · t / 2');
          ctx.readout('extra', `c = ${N(cNow(), 1)} m/s`);
          break;
        case 'source':
          ctx.readout('main', `f = ${N(srcFreq(), 1)} Hz`);
          ctx.readout('formula', p.src === 'string' ? 'f = n / (2L) · √(F / μ)' : p.src === 'open' ? 'f = n · c / (2L)' : 'f = (2n − 1) · c / (4L)');
          ctx.readout('extra', ctx.lang === 'de' ? noteOf(srcFreq()).de : noteOf(srcFreq()).en);
          break;
        case 'beat':
          ctx.readout('main', `f_S = ${N(p.df, 1)} Hz`);
          ctx.readout('formula', 'f_S = |f₂ − f₁|');
          ctx.readout('extra', p.df > 0 ? `T_S = ${N(1 / p.df, 3)} s` : '–');
          break;
      }
    }

    let animating = false;
    const intro = new Tween(700, ease.outCubic);
    intro.play();
    function keys(): void {
      const de = ctx.lang === 'de';
      if (p.mode === 'osc' && p.cur) {
        const mv = (i: number, d: number) => () => {
          cursors[i] = clamp(cursors[i]! + d, 0, 1);
          updateReadouts();
          ctx.requestRender();
        };
        ctx.setKeyTargets([
          { id: 'c1l', label: de ? 'Gelbe Marke nach links' : 'Yellow cursor left', activate: mv(0, -0.01) },
          { id: 'c1r', label: de ? 'Gelbe Marke nach rechts' : 'Yellow cursor right', activate: mv(0, 0.01) },
          { id: 'c2l', label: de ? 'Rosa Marke nach links' : 'Pink cursor left', activate: mv(1, -0.01) },
          { id: 'c2r', label: de ? 'Rosa Marke nach rechts' : 'Pink cursor right', activate: mv(1, 0.01) },
        ]);
      } else if (p.mode === 'level') {
        ctx.setKeyTargets([
          { id: 'near', label: de ? 'Ohr näher (Entfernung halbieren)' : 'Ear closer (halve the distance)', activate: () => ctx.set({ r: Math.max(1, p.r / 2) }) },
          { id: 'far', label: de ? 'Ohr weiter weg (Entfernung verdoppeln)' : 'Ear farther (double the distance)', activate: () => ctx.set({ r: Math.min(200, p.r * 2) }) },
        ]);
      } else if (p.mode === 'echo') {
        ctx.setKeyTargets([
          { id: 'wn', label: de ? 'Felswand 10 m näher' : 'Cliff 10 m closer', activate: () => ctx.set({ d: Math.max(5, p.d - 10) }) },
          { id: 'wf', label: de ? 'Felswand 10 m weiter weg' : 'Cliff 10 m farther', activate: () => ctx.set({ d: Math.min(600, p.d + 10) }) },
        ]);
      } else if (p.mode === 'source') {
        ctx.setKeyTargets([
          { id: 'half', label: de ? 'Länge halbieren' : 'Halve the length', activate: () => ctx.set({ sl: Math.max(10, Math.round(p.sl / 2)) }) },
          { id: 'dbl', label: de ? 'Länge verdoppeln' : 'Double the length', activate: () => ctx.set({ sl: Math.min(100, p.sl * 2) }) },
        ]);
      } else ctx.setKeyTargets([]);
    }

    return {
      update(changed, source) {
        if (changed.has('mode') || source === 'init' || source === 'replace') {
          intro.play();
          ctx.clock.play();
          if (p.mode === 'echo' || p.mode === 'level') stopAudio();
          shoutAt = null;
        }
        if (changed.has('f') || changed.has('mode') || changed.has('med') || source === 'init') {
          waveStart = simT;
          tbFrom = tbNow();
          tbTo = timebase(p.f, 10);
          if (tbFrom !== tbTo) tbTw.play();
        }
        if (changed.has('d') || changed.has('temp') || changed.has('med')) shoutAt = null;
        if (changed.has('src') || changed.has('mode') || changed.has('tim')) lastTimbre = '';
        keys();
        updateAudio();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'sound') {
          if (rig) stopAudio();
          else startAudio();
          return;
        }
        if (ctx.locked) return;
        if (id === 'shout') {
          shoutAt = simT;
          ctx.clock.play();
          ctx.requestRender();
        }
      },
      tick(dt) {
        simT += dt;
      },
      resetTime() {
        simT = 0;
        waveStart = 0;
        shoutAt = null;
      },
      render() {
        lay = layout();
        animating = false;
        const g = surface.begin();
        switch (p.mode) {
          case 'osc':
            drawOsc(g, lay.scene);
            drawSpectrum(g, lay.chart);
            break;
          case 'wave':
            drawWave(g, lay.scene);
            drawWaveChart(g, lay.chart);
            break;
          case 'level':
            drawLevel(g, lay.scene);
            drawLevelChart(g, lay.chart);
            break;
          case 'range':
            drawRange(g, lay.scene);
            drawThreshold(g, lay.chart);
            break;
          case 'echo':
            drawEcho(g, lay.scene);
            drawEchoChart(g, lay.chart);
            break;
          case 'beat':
            drawBeat(g, lay.scene);
            drawBeatChart(g, lay.chart);
            break;
          case 'source':
            drawSource(g, lay.scene);
            drawSourceChart(g, lay.chart);
            break;
        }
        drawInfo(g, lay.card);
        if (intro.running || tbTw.running || animating) ctx.requestRender();
      },
      destroy: () => {
        stopAudio();
        surface.destroy();
      },
    };
  },
});
