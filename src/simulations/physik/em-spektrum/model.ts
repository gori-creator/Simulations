/**
 * Elektromagnetisches Spektrum: Bereiche, Frequenz und Photonenenergie,
 * Hertz’scher Dipol (λ/2-Antenne) sowie Amplituden- und Frequenzmodulation.
 */

export const C_LIGHT = 299_792_458;
export const PLANCK = 6.626_070_15e-34;
export const E_CHARGE = 1.602_176_634e-19;

export type RegionId = 'radio' | 'micro' | 'ir' | 'visible' | 'uv' | 'xray' | 'gamma';

/** Bereiche mit Wellenlängen-Grenzen in m (von, bis); die Grenzen sind fließend. */
export const REGIONS: readonly { id: RegionId; min: number; max: number }[] = [
  { id: 'gamma', min: 1e-15, max: 1e-11 },
  { id: 'xray', min: 1e-11, max: 1e-8 },
  { id: 'uv', min: 1e-8, max: 380e-9 },
  { id: 'visible', min: 380e-9, max: 780e-9 },
  { id: 'ir', min: 780e-9, max: 1e-3 },
  { id: 'micro', min: 1e-3, max: 1 },
  { id: 'radio', min: 1, max: 1e5 },
];

/** Bereich, zu dem die Wellenlänge λ (m) gehört. */
export function regionOf(lambda: number): RegionId {
  for (const r of REGIONS) if (lambda >= r.min && lambda < r.max) return r.id;
  return lambda < 1e-15 ? 'gamma' : 'radio';
}

/** Frequenz f = c / λ in Hz. */
export function frequencyOf(lambda: number): number {
  return C_LIGHT / lambda;
}

/** Photonenenergie E = h · f in eV. */
export function photonEnergyEv(lambda: number): number {
  return (PLANCK * frequencyOf(lambda)) / E_CHARGE;
}

/** Ionisierend ab etwa 10 eV (fernes UV): genug Energie, um Elektronen aus Atomen zu lösen. */
export function isIonizing(lambda: number): boolean {
  return photonEnergyEv(lambda) >= 10;
}

/** Wellenlänge λ = c / f in m. */
export function wavelengthOf(f: number): number {
  return C_LIGHT / f;
}

/** Länge eines Hertz’schen Dipols in Grundschwingung: l = λ / 2. */
export function dipoleLength(f: number): number {
  return wavelengthOf(f) / 2;
}

/** Amplitudenmodulation: (1 + m · sin(ω_s t)) · sin(ω_t t). */
export function am(t: number, fc: number, fs: number, m: number): number {
  return (1 + m * Math.sin(2 * Math.PI * fs * t)) * Math.sin(2 * Math.PI * fc * t);
}

/** Frequenzmodulation mit Hub Δf: sin(2π fc t − (Δf/fs) · cos(2π fs t)). */
export function fm(t: number, fc: number, fs: number, df: number): number {
  return Math.sin(2 * Math.PI * fc * t - (df / fs) * Math.cos(2 * Math.PI * fs * t));
}

/** Momentane Frequenz der FM-Schwingung. */
export function fmInstantFrequency(t: number, fc: number, fs: number, df: number): number {
  return fc + df * Math.sin(2 * Math.PI * fs * t);
}

/** Spektralfarbe (sRGB, 0–255) für eine Wellenlänge in nm (380–780). */
export function wavelengthToRgb(l: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  if (l < 440) {
    r = -(l - 440) / 60;
    b = 1;
  } else if (l < 490) {
    g = (l - 440) / 50;
    b = 1;
  } else if (l < 510) {
    g = 1;
    b = -(l - 510) / 20;
  } else if (l < 580) {
    r = (l - 510) / 70;
    g = 1;
  } else if (l < 645) {
    r = 1;
    g = -(l - 645) / 65;
  } else r = 1;
  let k = 1;
  if (l < 420) k = 0.3 + (0.7 * (l - 380)) / 40;
  else if (l > 700) k = 0.3 + (0.7 * (780 - l)) / 80;
  const c = (v: number) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v * k)), 0.8));
  return [c(r), c(g), c(b)];
}

/* ------------------------------------------------------------------ */
/* Alltag: Geräte im Spektrum                                          */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type GadgetId = 'mittelwelle' | 'ukw' | 'handy' | 'gps' | 'wlan' | 'mikro' | 'fernbed' | 'lampe' | 'uvlampe' | 'roentgen';

export interface Gadget {
  id: GadgetId;
  /** Frequenz in Hz */
  f: number;
  name: Loc;
  fact: Loc;
}

export const GADGETS: Record<GadgetId, Gadget> = {
  mittelwelle: {
    id: 'mittelwelle',
    f: 1e6,
    name: { de: 'Mittelwellen-Radio', en: 'medium-wave radio' },
    fact: {
      de: 'Die Wellen sind 300 m lang und folgen nachts der Erdkrümmung weit über den Horizont.',
      en: 'The waves are 300 m long and at night follow the curvature of the Earth far beyond the horizon.',
    },
  },
  ukw: {
    id: 'ukw',
    f: 100e6,
    name: { de: 'UKW-Radio', en: 'FM radio' },
    fact: { de: 'Eine Stabantenne ist am besten etwa ein Viertel der Wellenlänge lang: rund 75 cm.', en: 'A rod antenna works best at about a quarter of the wavelength: around 75 cm.' },
  },
  handy: {
    id: 'handy',
    f: 1.8e9,
    name: { de: 'Handy (LTE)', en: 'mobile phone (LTE)' },
    fact: { de: 'Die Antenne steckt als wenige Zentimeter langer Leiterstreifen im Gehäuse.', en: 'The antenna is a conductor strip a few centimetres long inside the case.' },
  },
  gps: {
    id: 'gps',
    f: 1.57542e9,
    name: { de: 'GPS-Satellit', en: 'GPS satellite' },
    fact: {
      de: 'Das Signal braucht vom Satelliten etwa 0,07 s – aus den Laufzeiten berechnet das Handy seinen Ort.',
      en: 'The signal takes about 0.07 s from the satellite – the phone works out its position from the travel times.',
    },
  },
  wlan: {
    id: 'wlan',
    f: 2.4e9,
    name: { de: 'WLAN (2,4 GHz)', en: 'Wi-Fi (2.4 GHz)' },
    fact: {
      de: 'Fast dieselbe Frequenz wie die Mikrowelle – deshalb stört eine laufende Mikrowelle manchmal das WLAN.',
      en: 'Almost the same frequency as a microwave oven – that is why a running microwave sometimes disturbs Wi-Fi.',
    },
  },
  mikro: {
    id: 'mikro',
    f: 2.45e9,
    name: { de: 'Mikrowellenherd', en: 'microwave oven' },
    fact: {
      de: 'Die Wellen bringen Wassermoleküle zum Schwingen, das Essen wird von innen warm. Das Gitter in der Tür hat Löcher, die viel kleiner als 12 cm sind.',
      en: 'The waves make water molecules oscillate and heat food from inside. The mesh in the door has holes much smaller than 12 cm.',
    },
  },
  fernbed: {
    id: 'fernbed',
    f: C_LIGHT / 940e-9,
    name: { de: 'Fernbedienung (Infrarot)', en: 'remote control (infrared)' },
    fact: { de: 'Unsichtbar fürs Auge, aber eine Handykamera zeigt das Blinken der Leuchtdiode.', en: 'Invisible to the eye, but a phone camera shows the LED flashing.' },
  },
  lampe: {
    id: 'lampe',
    f: C_LIGHT / 550e-9,
    name: { de: 'Licht (grün)', en: 'light (green)' },
    fact: {
      de: 'Unser Auge ist bei etwa 550 nm am empfindlichsten – genau dort strahlt die Sonne am stärksten.',
      en: 'Our eyes are most sensitive at about 550 nm – right where the Sun shines most strongly.',
    },
  },
  uvlampe: {
    id: 'uvlampe',
    f: C_LIGHT / 365e-9,
    name: { de: 'UV-Lampe (Geldscheinprüfer)', en: 'UV lamp (banknote checker)' },
    fact: {
      de: 'UV-Licht bringt die Sicherheitsfasern im Geldschein zum Leuchten. Sonnen-UV kann die Haut schädigen.',
      en: 'UV light makes the security fibres in banknotes glow. UV from the Sun can damage skin.',
    },
  },
  roentgen: {
    id: 'roentgen',
    f: C_LIGHT / 0.05e-9,
    name: { de: 'Röntgen beim Arzt', en: 'X-ray at the doctor’s' },
    fact: {
      de: 'Die Photonen haben so viel Energie, dass sie Gewebe durchdringen und Atome ionisieren – deshalb die Bleischürze.',
      en: 'The photons have so much energy that they pass through tissue and ionise atoms – hence the lead apron.',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Laufzeit von Signalen                                               */
/* ------------------------------------------------------------------ */

export type TargetId = 'raum' | 'gps' | 'geo' | 'mond' | 'sonne' | 'mars';

export const TARGETS: Record<TargetId, { d: number; name: Loc }> = {
  raum: { d: 10, name: { de: 'WLAN-Router im Raum (10 m)', en: 'Wi-Fi router in the room (10 m)' } },
  gps: { d: 20_200e3, name: { de: 'GPS-Satellit (20 200 km)', en: 'GPS satellite (20 200 km)' } },
  geo: { d: 35_786e3, name: { de: 'Fernsehsatellit (35 786 km)', en: 'TV satellite (35 786 km)' } },
  mond: { d: 384_400e3, name: { de: 'Mond (384 400 km)', en: 'Moon (384 400 km)' } },
  sonne: { d: 149.6e9, name: { de: 'Sonne (149,6 Mio. km)', en: 'Sun (149.6 million km)' } },
  mars: { d: 225e9, name: { de: 'Mars (im Mittel 225 Mio. km)', en: 'Mars (225 million km on average)' } },
};

/** Laufzeit t = s / c in s. */
export function travelTime(d: number): number {
  return d / C_LIGHT;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type TaskKind = 'freq' | 'lambda' | 'region' | 'energy' | 'dipole' | 'time';

export interface SpecTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** zulässige relative Abweichung (0 = genau) */
  tol: number;
  choices: Loc[] | null;
  solution: Loc;
}

function rng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zahl mit Dezimalkomma (de) bzw. Punkt (en). */
export function numText(x: number, lang: 'de' | 'en', d = 2): string {
  const s = String(Math.round(x * 10 ** d) / 10 ** d);
  return lang === 'de' ? s.replace('.', ',') : s;
}

const REGION_NAMES: Record<RegionId, Loc> = {
  radio: { de: 'Radiowellen', en: 'radio waves' },
  micro: { de: 'Mikrowellen', en: 'microwaves' },
  ir: { de: 'Infrarot', en: 'infrared' },
  visible: { de: 'sichtbares Licht', en: 'visible light' },
  uv: { de: 'Ultraviolett', en: 'ultraviolet' },
  xray: { de: 'Röntgenstrahlung', en: 'X-rays' },
  gamma: { de: 'Gammastrahlung', en: 'gamma rays' },
};

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): SpecTask {
  const r = rng(n * 53 + 17);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['freq', 'region', 'lambda', 'energy', 'dipole', 'time'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const nt = numText;
  const C = 3e8;
  if (kind === 'freq') {
    const [lamM, label] = pick([
      [3, '3 m'],
      [0.12, '12 cm'],
      [300, '300 m'],
      [1.5, '1,5 m'],
      [0.6, '60 cm'],
    ] as [number, string][]);
    const fMHz = C / lamM / 1e6;
    return {
      kind,
      text: {
        de: `Eine Radiowelle hat die Wellenlänge ${label}. Wie groß ist ihre Frequenz in MHz? (c = 3 · 10⁸ m/s)`,
        en: `A radio wave has a wavelength of ${label.replace(',', '.')}. What is its frequency in MHz? (c = 3 · 10⁸ m/s)`,
      },
      answer: fMHz,
      tol: 0.02,
      choices: null,
      solution: { de: `f = c : λ = 3 · 10⁸ m/s : ${label} = ${nt(fMHz, 'de', 1)} MHz`, en: `f = c / λ = 3 · 10⁸ m/s / ${label.replace(',', '.')} = ${nt(fMHz, 'en', 1)} MHz` },
    };
  }
  if (kind === 'lambda') {
    const [fHz, de, en] = pick([
      [2.4e9, '2,4 GHz', '2.4 GHz'],
      [100e6, '100 MHz', '100 MHz'],
      [5e9, '5 GHz', '5 GHz'],
      [900e6, '900 MHz', '900 MHz'],
    ] as [number, string, string][]);
    const cm = (C / fHz) * 100;
    return {
      kind,
      text: { de: `Wie lang ist eine Welle mit ${de} in cm? (c = 3 · 10⁸ m/s)`, en: `How long in cm is a wave at ${en}? (c = 3 · 10⁸ m/s)` },
      answer: cm,
      tol: 0.02,
      choices: null,
      solution: { de: `λ = c : f = ${nt(cm / 100, 'de', 3)} m = ${nt(cm, 'de', 1)} cm`, en: `λ = c / f = ${nt(cm / 100, 'en', 3)} m = ${nt(cm, 'en', 1)} cm` },
    };
  }
  if (kind === 'region') {
    const items: [Loc, RegionId][] = [
      [{ de: 'Eine Wärmebildkamera zeigt die Wärmestrahlung eines Hauses.', en: 'A thermal camera shows the heat radiation of a house.' }, 'ir'],
      [{ de: 'Beim Zahnarzt wird ein Bild der Zähne gemacht.', en: 'The dentist takes a picture of the teeth.' }, 'xray'],
      [{ de: 'Sonnencreme schützt vor Sonnenbrand.', en: 'Sunscreen protects against sunburn.' }, 'uv'],
      [{ de: 'Ein Radarsensor im Auto misst den Abstand.', en: 'A radar sensor in a car measures the distance.' }, 'micro'],
      [{ de: 'Ein Regenbogen am Himmel.', en: 'A rainbow in the sky.' }, 'visible'],
      [{ de: 'Ein Radiosender überträgt Musik.', en: 'A radio station broadcasts music.' }, 'radio'],
    ];
    const [t, reg] = pick(items);
    const opts: RegionId[] = ['radio', 'micro', 'ir', 'visible', 'uv', 'xray'];
    return {
      kind,
      text: { de: `Welcher Bereich des Spektrums ist gemeint? „${t.de}“`, en: `Which part of the spectrum is meant? “${t.en}”` },
      answer: opts.indexOf(reg) + 1,
      tol: 0,
      choices: opts.map((o) => REGION_NAMES[o]),
      solution: { de: `${REGION_NAMES[reg].de}.`, en: `${REGION_NAMES[reg].en[0]!.toUpperCase()}${REGION_NAMES[reg].en.slice(1)}.` },
    };
  }
  if (kind === 'energy') {
    const pairs: [RegionId, RegionId][] = [
      ['uv', 'ir'],
      ['xray', 'visible'],
      ['micro', 'visible'],
      ['radio', 'uv'],
    ];
    const [a, b] = pick(pairs);
    const center: Record<RegionId, number> = { radio: 1, micro: 1e-2, ir: 1e-5, visible: 5.5e-7, uv: 2e-7, xray: 1e-10, gamma: 1e-12 };
    const ans = center[a] < center[b] ? 1 : 2;
    return {
      kind,
      text: {
        de: `Welche Strahlung hat die energiereicheren Photonen: ${REGION_NAMES[a].de} oder ${REGION_NAMES[b].de}?`,
        en: `Which radiation has the more energetic photons: ${REGION_NAMES[a].en} or ${REGION_NAMES[b].en}?`,
      },
      answer: ans,
      tol: 0,
      choices: [REGION_NAMES[a], REGION_NAMES[b]],
      solution: {
        de: 'Kürzere Wellenlänge heißt höhere Frequenz und damit mehr Energie pro Photon (E = h · f).',
        en: 'Shorter wavelength means higher frequency and so more energy per photon (E = h · f).',
      },
    };
  }
  if (kind === 'dipole') {
    const fMHz = pick([100, 150, 300, 500]);
    const l = (C / (fMHz * 1e6) / 2) * 100;
    return {
      kind,
      text: {
        de: `Wie lang (in cm) muss ein Dipol für ${fMHz} MHz sein, damit er in Grundschwingung strahlt? (l = λ/2)`,
        en: `How long (in cm) must a dipole be for ${fMHz} MHz to radiate in its fundamental mode? (l = λ/2)`,
      },
      answer: l,
      tol: 0.02,
      choices: null,
      solution: { de: `λ = ${nt(C / (fMHz * 1e6), 'de', 2)} m, l = λ/2 = ${nt(l, 'de', 0)} cm`, en: `λ = ${nt(C / (fMHz * 1e6), 'en', 2)} m, l = λ/2 = ${nt(l, 'en', 0)} cm` },
    };
  }
  const id = pick(['mond', 'gps', 'geo', 'sonne'] as TargetId[]);
  const d = TARGETS[id].d;
  const sec = d / C;
  return {
    kind: 'time',
    text: {
      de: `Wie viele Sekunden braucht ein Funksignal bis zum Ziel: ${TARGETS[id].name.de}? (c = 3 · 10⁸ m/s)`,
      en: `How many seconds does a radio signal take to reach: ${TARGETS[id].name.en}? (c = 3 · 10⁸ m/s)`,
    },
    answer: sec,
    tol: 0.03,
    choices: null,
    solution: { de: `t = s : c ≈ ${nt(sec, 'de', sec < 1 ? 3 : 1)} s`, en: `t = s / c ≈ ${nt(sec, 'en', sec < 1 ? 3 : 1)} s` },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. */
export function checkTask(task: SpecTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[a-zA-Z]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
