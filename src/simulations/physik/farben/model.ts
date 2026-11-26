/**
 * Farben: Zerlegung weißen Lichts am Prisma (Dispersion), additive und
 * subtraktive Farbmischung, Farbfilter (Absorption und Transmission).
 */

/** Brechzahl von Kronglas nach Cauchy, λ in nm. */
export function refractiveIndex(lambdaNm: number): number {
  return 1.5046 + 4200 / (lambdaNm * lambdaNm);
}

/**
 * Gesamtablenkung (rad) eines Strahls durch ein Prisma mit brechendem Winkel
 * `apex` (rad) bei Einfallswinkel `alpha1` (rad) an der ersten Fläche.
 * Liefert NaN bei Totalreflexion an der zweiten Fläche.
 */
export function prismDeviation(n: number, apex: number, alpha1: number): number {
  const beta1 = Math.asin(Math.sin(alpha1) / n);
  const beta2 = apex - beta1;
  const s = n * Math.sin(beta2);
  if (Math.abs(s) > 1) return Number.NaN;
  const alpha2 = Math.asin(s);
  return alpha1 + alpha2 - apex;
}

export type Rgb = readonly [number, number, number];

/** Additive Mischung dreier Lichter (Anteile 0…1), begrenzt auf 1. */
export function additiveMix(r: number, g: number, b: number): Rgb {
  const c = (v: number) => Math.max(0, Math.min(1, v));
  return [c(r), c(g), c(b)];
}

/**
 * Subtraktive Mischung: weißes Licht durch Filter Cyan, Magenta, Gelb
 * (Stärke 0…1). Cyan schluckt Rot, Magenta schluckt Grün, Gelb schluckt Blau.
 */
export function subtractiveMix(c: number, m: number, y: number): Rgb {
  const k = (v: number) => 1 - Math.max(0, Math.min(1, v));
  return [k(c), k(m), k(y)];
}

export type ColorName = 'black' | 'white' | 'grey' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'magenta';

/** Ungefährer Farbname für eine Lichtfarbe (Anteile 0…1). */
export function colorName([r, g, b]: Rgb): ColorName {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 0.12) return 'black';
  const sat = (max - min) / max;
  if (sat < 0.15) return max > 0.85 ? 'white' : 'grey';
  // Farbton in Grad (HSV)
  let h: number;
  if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
  else if (max === g) h = 60 * ((b - r) / (max - min)) + 120;
  else h = 60 * ((r - g) / (max - min)) + 240;
  if (h < 20 || h >= 330) return 'red';
  if (h < 45) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 160) return 'green';
  if (h < 200) return 'cyan';
  if (h < 265) return 'blue';
  return 'magenta';
}

export type FilterId = 'none' | 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow';

/** Durchlässigkeit eines idealisierten Farbfilters für die Wellenlänge λ (nm). */
export function filterPasses(filter: FilterId, lambdaNm: number): boolean {
  const R = lambdaNm >= 600;
  const G = lambdaNm >= 495 && lambdaNm < 600;
  const B = lambdaNm < 495;
  switch (filter) {
    case 'none':
      return true;
    case 'red':
      return R;
    case 'green':
      return G;
    case 'blue':
      return B;
    case 'cyan':
      return G || B;
    case 'magenta':
      return R || B;
    case 'yellow':
      return R || G;
  }
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
/* Körperfarben                                                        */
/* ------------------------------------------------------------------ */

export type ObjectId = 'apple' | 'leaf' | 'banana' | 'sky' | 'paper' | 'coal';
export type LightId = 'white' | 'red' | 'green' | 'blue' | 'yellow' | 'sodium';

/** Wie viel Rot, Grün und Blau ein Gegenstand zurückwirft (idealisiert, 0…1). */
export const REFLECT: Record<ObjectId, Rgb> = {
  apple: [0.9, 0.08, 0.06],
  leaf: [0.1, 0.75, 0.12],
  banana: [0.92, 0.85, 0.1],
  sky: [0.06, 0.4, 0.9],
  paper: [0.92, 0.92, 0.92],
  coal: [0.04, 0.04, 0.04],
};

/** Zusammensetzung der Lampen (R, G, B). Natriumdampf: fast nur gelbes Licht um 589 nm. */
export const LIGHTS: Record<LightId, Rgb> = {
  white: [1, 1, 1],
  red: [1, 0, 0],
  green: [0, 1, 0],
  blue: [0, 0, 1],
  yellow: [1, 1, 0],
  sodium: [1, 0.75, 0],
};

/** Gesehene Farbe eines Gegenstands: Licht mal Rückstrahlung, kanalweise. */
export function objectColor(light: Rgb, refl: Rgb): Rgb {
  return [light[0] * refl[0], light[1] * refl[1], light[2] * refl[2]];
}

/* ------------------------------------------------------------------ */
/* Farbensehen: drei Zapfenarten                                       */
/* ------------------------------------------------------------------ */

/** Empfindlichkeit der S-, M- und L-Zapfen (vereinfacht als Glockenkurven, Maximum 1). */
export function coneResponse(lambdaNm: number): Rgb {
  const gauss = (mu: number, sigma: number) => Math.exp(-((lambdaNm - mu) ** 2) / (2 * sigma * sigma));
  return [gauss(564, 50), gauss(534, 42), gauss(420, 28)];
}

/** Wellenlängen, mit denen die drei Leuchtpunkte eines Bildschirms (R, G, B) vereinfacht leuchten. */
export const PRIMARY_NM: readonly [number, number, number] = [610, 545, 450];

/** Zapfenreiz durch eine Mischung der drei Bildschirmfarben (Anteile 0…1). */
export function coneFromMix(r: number, g: number, b: number): Rgb {
  const cr = coneResponse(PRIMARY_NM[0]);
  const cg = coneResponse(PRIMARY_NM[1]);
  const cb = coneResponse(PRIMARY_NM[2]);
  return [r * cr[0] + g * cg[0] + b * cb[0], r * cr[1] + g * cg[1] + b * cb[1], r * cr[2] + g * cg[2] + b * cb[2]];
}

/** Farbbereich einer Wellenlänge (sichtbares Licht 380–780 nm). */
export function spectralName(lambdaNm: number): ColorName | 'uv' | 'ir' {
  if (lambdaNm < 380) return 'uv';
  if (lambdaNm > 780) return 'ir';
  if (lambdaNm < 450) return 'blue';
  if (lambdaNm < 495) return 'cyan';
  if (lambdaNm < 570) return 'green';
  if (lambdaNm < 590) return 'yellow';
  if (lambdaNm < 620) return 'orange';
  return 'red';
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'add' | 'sub' | 'object' | 'filter' | 'pixel' | 'lambda' | 'rainbow' | 'sky';

export interface ColorTask {
  kind: TaskKind;
  text: Loc;
  /** Antwortnummer (Auswahl) oder Zahl */
  answer: number;
  /** Auswahl, falls die Antwort eine Nummer ist */
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

const NAME: Record<ColorName, Loc> = {
  black: { de: 'Schwarz', en: 'black' },
  white: { de: 'Weiß', en: 'white' },
  grey: { de: 'Grau', en: 'grey' },
  red: { de: 'Rot', en: 'red' },
  orange: { de: 'Orange', en: 'orange' },
  yellow: { de: 'Gelb', en: 'yellow' },
  green: { de: 'Grün', en: 'green' },
  cyan: { de: 'Cyan', en: 'cyan' },
  blue: { de: 'Blau', en: 'blue' },
  magenta: { de: 'Magenta', en: 'magenta' },
};

const OBJ: Record<ObjectId, Loc> = {
  apple: { de: 'roter Apfel', en: 'red apple' },
  leaf: { de: 'grünes Blatt', en: 'green leaf' },
  banana: { de: 'gelbe Banane', en: 'yellow banana' },
  sky: { de: 'blaues Heft', en: 'blue exercise book' },
  paper: { de: 'weißes Papier', en: 'white paper' },
  coal: { de: 'Kohle', en: 'coal' },
};
const LIGHT_NAME: Record<LightId, Loc> = {
  white: { de: 'weißem', en: 'white' },
  red: { de: 'rotem', en: 'red' },
  green: { de: 'grünem', en: 'green' },
  blue: { de: 'blauem', en: 'blue' },
  yellow: { de: 'gelbem', en: 'yellow' },
  sodium: { de: 'gelbem Natriumdampf-', en: 'yellow sodium' },
};

/** Übungsaufgabe Nummer n: Auswahl über Nummern 1…4 oder eine Zahl. */
export function makeTask(n: number): ColorTask {
  const r = rng(n * 61 + 29);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['add', 'object', 'sub', 'filter', 'pixel', 'lambda', 'rainbow', 'sky'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const choose = (correct: ColorName, others: ColorName[]) => {
    const opts = [correct, ...others.filter((o) => o !== correct)].slice(0, 4);
    // feste, aber gemischte Reihenfolge
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [opts[i], opts[j]] = [opts[j]!, opts[i]!];
    }
    return { choices: opts.map((o) => NAME[o]), answer: opts.indexOf(correct) + 1 };
  };
  if (kind === 'add') {
    const pairs: [string, string, ColorName, Rgb][] = [
      ['red', 'green', 'yellow', [1, 1, 0]],
      ['red', 'blue', 'magenta', [1, 0, 1]],
      ['green', 'blue', 'cyan', [0, 1, 1]],
    ];
    const [a, b, res] = pick(pairs);
    const c = choose(res, ['yellow', 'magenta', 'cyan', 'white', 'grey']);
    return {
      kind,
      text: {
        de: `Zwei Scheinwerfer, ${NAME[a as ColorName].de} und ${NAME[b as ColorName].de}, leuchten auf dieselbe Stelle einer weißen Wand. Welche Farbe siehst du dort?`,
        en: `Two spotlights, ${NAME[a as ColorName].en} and ${NAME[b as ColorName].en}, shine on the same spot of a white wall. What colour do you see there?`,
      },
      ...c,
      solution: {
        de: `Additive Mischung: ${NAME[a as ColorName].de} + ${NAME[b as ColorName].de} = ${NAME[res].de}.`,
        en: `Additive mixing: ${NAME[a as ColorName].en} + ${NAME[b as ColorName].en} = ${NAME[res].en}.`,
      },
    };
  }
  if (kind === 'sub') {
    const pairs: [ColorName, ColorName, ColorName][] = [
      ['cyan', 'yellow', 'green'],
      ['magenta', 'yellow', 'red'],
      ['cyan', 'magenta', 'blue'],
    ];
    const [a, b, res] = pick(pairs);
    const c = choose(res, ['red', 'green', 'blue', 'black', 'white']);
    return {
      kind,
      text: {
        de: `Weißes Licht geht durch einen ${NAME[a].de}- und einen ${NAME[b].de}-Filter hintereinander. Welche Farbe kommt heraus?`,
        en: `White light passes through a ${NAME[a].en} and a ${NAME[b].en} filter, one after the other. What colour comes out?`,
      },
      ...c,
      solution: {
        de: `Subtraktive Mischung: ${NAME[a].de} und ${NAME[b].de} lassen beide nur ${NAME[res].de} durch.`,
        en: `Subtractive mixing: ${NAME[a].en} and ${NAME[b].en} both let only ${NAME[res].en} through.`,
      },
    };
  }
  if (kind === 'object') {
    const o = pick(['apple', 'leaf', 'banana', 'paper'] as ObjectId[]);
    const l = pick(['red', 'green', 'blue'] as LightId[]);
    const col = colorName(objectColor(LIGHTS[l], REFLECT[o]));
    const c = choose(col, ['black', 'red', 'green', 'blue', 'yellow', 'white']);
    return {
      kind,
      text: { de: `Ein ${OBJ[o].de} wird nur mit ${LIGHT_NAME[l].de} Licht beleuchtet. Wie sieht er aus?`, en: `A ${OBJ[o].en} is lit only with ${LIGHT_NAME[l].en} light. What does it look like?` },
      ...c,
      solution: {
        de: `Ein Gegenstand wirft nur zurück, was im Licht enthalten ist und was er nicht schluckt. Ergebnis: ${NAME[col].de}.`,
        en: `An object only reflects what is in the light and what it does not absorb. Result: ${NAME[col].en}.`,
      },
    };
  }
  if (kind === 'filter') {
    const f = pick(['red', 'green', 'blue'] as const);
    const l = pick(['red', 'green', 'blue'] as const);
    const res: ColorName = f === l ? l : 'black';
    const c = choose(res, ['black', 'red', 'green', 'blue', 'white']);
    return {
      kind,
      text: {
        de: `${NAME[l].de}es Licht fällt auf einen ${NAME[f].de}filter. Was kommt dahinter an?`,
        en: `${NAME[l].en.charAt(0).toUpperCase()}${NAME[l].en.slice(1)} light falls on a ${NAME[f].en} filter. What arrives behind it?`,
      },
      ...c,
      solution: {
        de: f === l ? `Der Filter lässt ${NAME[f].de} durch – es kommt ${NAME[l].de} an.` : `Der ${NAME[f].de}filter schluckt ${NAME[l].de}es Licht – dahinter bleibt es dunkel (Schwarz).`,
        en: f === l ? `The filter lets ${NAME[f].en} through.` : `The ${NAME[f].en} filter absorbs ${NAME[l].en} light – it stays dark (black).`,
      },
    };
  }
  if (kind === 'pixel') {
    const target = pick([
      ['yellow', [100, 100, 0]],
      ['magenta', [100, 0, 100]],
      ['cyan', [0, 100, 100]],
      ['white', [100, 100, 100]],
    ] as [ColorName, [number, number, number]][]);
    const ch = pick([0, 1, 2]);
    const chName: Loc[] = [
      { de: 'Rot', en: 'red' },
      { de: 'Grün', en: 'green' },
      { de: 'Blau', en: 'blue' },
    ];
    return {
      kind,
      text: {
        de: `Ein Bildschirm soll ${NAME[target[0]].de} zeigen. Mit wie viel Prozent leuchten die ${chName[ch]!.de}-Punkte?`,
        en: `A screen is to show ${NAME[target[0]].en}. At what percentage do the ${chName[ch]!.en} dots shine?`,
      },
      answer: target[1][ch]!,
      choices: null,
      solution: {
        de: `${NAME[target[0]].de} = R ${target[1][0]} %, G ${target[1][1]} %, B ${target[1][2]} %.`,
        en: `${NAME[target[0]].en} = R ${target[1][0]} %, G ${target[1][1]} %, B ${target[1][2]} %.`,
      },
    };
  }
  if (kind === 'rainbow') {
    const q = pick([
      [
        { de: 'Welche Farbe steht im Regenbogen ganz außen?', en: 'Which colour is on the very outside of a rainbow?' },
        'red',
        {
          de: 'Rotes Licht wird am wenigsten gebrochen und kommt unter dem größten Winkel (etwa 42°) zurück – es liegt außen.',
          en: 'Red light is refracted least and returns at the largest angle (about 42°) – it is on the outside.',
        },
      ],
      [
        { de: 'Welche Farbe steht im Regenbogen ganz innen?', en: 'Which colour is on the very inside of a rainbow?' },
        'blue',
        {
          de: 'Blaues und violettes Licht wird am stärksten gebrochen und kommt unter dem kleinsten Winkel (etwa 40,5°) zurück – es liegt innen.',
          en: 'Blue and violet light is refracted most and returns at the smallest angle (about 40.5°) – it is on the inside.',
        },
      ],
    ] as [Loc, ColorName, Loc][]);
    const c = choose(q[1], ['red', 'yellow', 'green', 'blue']);
    return { kind, text: q[0], ...c, solution: q[2] };
  }
  if (kind === 'sky') {
    const q = pick([
      [{ de: 'Warum ist der Himmel am Tag blau?', en: 'Why is the sky blue during the day?' }, 1],
      [{ de: 'Warum ist die Sonne beim Untergang rot?', en: 'Why is the Sun red at sunset?' }, 2],
    ] as [Loc, number][]);
    return {
      kind,
      text: q[0],
      answer: q[1],
      choices: [
        { de: 'Die Luft streut blaues Licht viel stärker als rotes.', en: 'Air scatters blue light much more strongly than red.' },
        { de: 'Auf dem langen Weg durch die Luft wird das blaue Licht herausgestreut, rotes bleibt übrig.', en: 'On the long path through the air the blue light is scattered out, red is left.' },
        { de: 'Die Luft ist blau gefärbt wie ein Farbfilter.', en: 'The air is tinted blue like a colour filter.' },
        { de: 'Die Sonne sendet abends nur rotes Licht aus.', en: 'In the evening the Sun only emits red light.' },
      ],
      solution: {
        de: 'Luftmoleküle streuen kurzwelliges Licht viel stärker (Rayleigh-Streuung, etwa mit 1/λ⁴). Das gestreute Blau kommt von überall am Himmel. Steht die Sonne tief, ist der Weg durch die Luft lang: Das Blau ist dann herausgestreut, übrig bleiben Gelb, Orange und Rot.',
        en: 'Air molecules scatter short-wavelength light much more strongly (Rayleigh scattering, roughly 1/λ⁴). The scattered blue comes from all over the sky. When the Sun is low, the path through the air is long: the blue has been scattered out, leaving yellow, orange and red.',
      },
    };
  }
  const l = pick([420, 470, 530, 580, 650]);
  const col = spectralName(l) as ColorName;
  const c = choose(col, ['blue', 'cyan', 'green', 'yellow', 'red']);
  return {
    kind: 'lambda',
    text: { de: `Welche Farbe hat Licht mit ${l} nm Wellenlänge?`, en: `What colour is light with a wavelength of ${l} nm?` },
    ...c,
    solution: {
      de: `${l} nm liegt im Bereich ${NAME[col].de} (blau ≈ 420–450, grün ≈ 495–570, gelb ≈ 570–590, rot ab ≈ 620 nm).`,
      en: `${l} nm lies in the ${NAME[col].en} range (blue ≈ 420–450, green ≈ 495–570, yellow ≈ 570–590, red from ≈ 620 nm).`,
    },
  };
}

export function checkTask(task: ColorTask, input: string): boolean | null {
  const s = input.trim().replace('%', '').replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const x = Number(s);
  return Math.abs(x - task.answer) < 1e-9;
}

/* ------------------------------------------------------------------ */
/* Regenbogen                                                          */
/* ------------------------------------------------------------------ */

/** Brechzahl von Wasser (Näherung nach Cauchy), λ in nm. */
export function waterIndex(lambdaNm: number): number {
  return 1.3247 + 3300 / (lambdaNm * lambdaNm);
}

/**
 * Winkel (°) zwischen Sonnenrichtung und zurückkommendem Licht nach einer
 * Reflexion im Tropfen, für den Stoßparameter b (0…1, Abstand vom Mittelpunkt
 * relativ zum Radius): θ = 4β − 2α mit sin α = b, sin β = b/n.
 */
export function dropAngle(b: number, n: number): number {
  const a = Math.asin(b);
  const be = Math.asin(b / n);
  return ((4 * be - 2 * a) * 180) / Math.PI;
}

/** Regenbogenwinkel (°): größter Rückstreuwinkel, dort häufen sich die Strahlen. */
export function rainbowAngle(lambdaNm: number): number {
  const n = waterIndex(lambdaNm);
  // Maximum bei cos²α = (n² − 1)/3
  const a = Math.acos(Math.sqrt((n * n - 1) / 3));
  return dropAngle(Math.sin(a), n);
}

/* ------------------------------------------------------------------ */
/* Himmelsblau und Abendrot (Rayleigh-Streuung)                        */
/* ------------------------------------------------------------------ */

/** Relative Weglänge durch die Luft bei Sonnenhöhe h (°), begrenzt am Horizont. */
export function airMass(elevDeg: number): number {
  const h = Math.max(0.5, elevDeg);
  // Näherung nach Kasten und Young
  return 1 / (Math.sin((h * Math.PI) / 180) + 0.50572 * (h + 6.07995) ** -1.6364);
}

/** Durchgelassener Anteil bei Wellenlänge λ (nm) und Luftmasse m. */
export function transmission(lambdaNm: number, m: number): number {
  const tau = 0.1 * (550 / lambdaNm) ** 4;
  return Math.exp(-tau * m);
}

/** Farbe der Sonnenscheibe bzw. des Himmels (Rgb 0…1, auf das Maximum normiert). */
export function sunAndSky(elevDeg: number): { sun: Rgb; sky: Rgb; blueShare: number } {
  const m = airMass(elevDeg);
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let kr = 0;
  let kg = 0;
  let kb = 0;
  let blueSun = 0;
  let allSun = 0;
  // Weißabgleich: das unveränderte Spektrum soll Weiß ergeben
  let wr = 0;
  let wg = 0;
  let wb = 0;
  for (let l = 400; l <= 700; l += 10) {
    const [r, g, b] = wavelengthToRgb(l);
    wr += r;
    wg += g;
    wb += b;
  }
  for (let l = 400; l <= 700; l += 10) {
    const [r0, g0, b0] = wavelengthToRgb(l);
    const r = r0 / wr;
    const g = g0 / wg;
    const b = b0 / wb;
    const t = transmission(l, m);
    sr += r * t;
    sg += g * t;
    sb += b * t;
    // gestreutes Licht: ∝ 1/λ⁴, abgeschwächt auf dem Weg
    const sc = (550 / l) ** 4 * Math.sqrt(t);
    kr += r * sc;
    kg += g * sc;
    kb += b * sc;
    allSun += t;
    if (l < 500) blueSun += t;
  }
  const norm = (x: number, y: number, z: number): Rgb => {
    const mx = Math.max(x, y, z, 1e-9);
    return [x / mx, y / mx, z / mx];
  };
  return { sun: norm(sr, sg, sb), sky: norm(kr, kg, kb), blueShare: blueSun / allSun };
}
