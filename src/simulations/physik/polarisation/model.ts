/**
 * Wellenoptik: Polarisationsfilter (Gesetz von Malus) und Brechung im
 * Wellenmodell (Huygens-Prinzip, Brechungsgesetz, Totalreflexion).
 */

const DEG = Math.PI / 180;

/** Gesetz von Malus: Anteil, der ein Filter passiert, wenn das Licht um Δθ (in °) gedreht dazu schwingt. */
export function malus(deltaDeg: number): number {
  const c = Math.cos(deltaDeg * DEG);
  return c * c;
}

/**
 * Intensität hinter einer Kette von Polarisationsfiltern (Winkel in °),
 * bezogen auf unpolarisiertes Licht: Das erste Filter lässt die Hälfte durch,
 * jedes weitere den Anteil cos²(θᵢ − θᵢ₋₁).
 */
export function chain(angles: readonly number[]): number {
  if (angles.length === 0) return 1;
  let I = 0.5;
  for (let i = 1; i < angles.length; i++) I *= malus(angles[i]! - angles[i - 1]!);
  return I;
}

/** Brechungswinkel in ° für Einfallswinkel α (in °) und n = c₁/c₂; `null` bei Totalreflexion. */
export function refractionAngle(alphaDeg: number, n: number): number | null {
  const s = Math.sin(alphaDeg * DEG) / n;
  if (s > 1) return null;
  return Math.asin(s) / DEG;
}

/** Grenzwinkel der Totalreflexion in ° (nur für n = c₁/c₂ < 1, sonst `null`). */
export function criticalAngle(n: number): number | null {
  return n < 1 ? Math.asin(n) / DEG : null;
}

/** Wellenlänge im zweiten Stoff, bezogen auf λ₁: λ₂/λ₁ = c₂/c₁ = 1/n. */
export function wavelengthRatio(n: number): number {
  return 1 / n;
}

/* ------------------------------------------------------------------ */
/* Polarisation durch Reflexion (Fresnel, Brewster)                    */
/* ------------------------------------------------------------------ */

/**
 * Reflexionsgrade für senkrecht (s) und parallel (p) zur Einfallsebene
 * schwingendes Licht beim Übergang von Luft in einen Stoff mit Brechzahl n.
 */
export function fresnel(alphaDeg: number, n: number): { rs: number; rp: number } {
  const a = alphaDeg * DEG;
  const sb = Math.sin(a) / n;
  if (sb >= 1) return { rs: 1, rp: 1 };
  const b = Math.asin(sb);
  const ca = Math.cos(a);
  const cb = Math.cos(b);
  const rs = (ca - n * cb) / (ca + n * cb);
  const rp = (n * ca - cb) / (n * ca + cb);
  return { rs: rs * rs, rp: rp * rp };
}

/** Brewster-Winkel in °: tan θ_B = n. Dort wird nur s-polarisiertes Licht reflektiert. */
export function brewster(n: number): number {
  return Math.atan(n) / DEG;
}

/**
 * Anteil des reflektierten (unpolarisierten) Lichts, der eine Polarisations-
 * Sonnenbrille mit senkrechter Durchlassrichtung passiert, bezogen auf das
 * reflektierte Licht ohne Brille: Nur der p-Anteil kommt durch.
 */
export function glareThroughSunglasses(alphaDeg: number, n: number): number {
  const { rs, rp } = fresnel(alphaDeg, n);
  return rs + rp === 0 ? 0 : rp / (rs + rp);
}

/* ------------------------------------------------------------------ */
/* Flüssigkristall-Anzeige (LCD)                                       */
/* ------------------------------------------------------------------ */

/**
 * Helligkeit eines LCD-Bildpunkts (bezogen auf unpolarisiertes Licht) zwischen
 * gekreuzten Filtern: Ohne Spannung dreht der Flüssigkristall die Schwingungs-
 * richtung um 90° (hell), mit voller Spannung gar nicht (dunkel).
 * `u` ist die Spannung als Anteil 0…1.
 */
export function lcdBrightness(u: number): number {
  const twist = 90 * (1 - Math.max(0, Math.min(1, u)));
  // nach dem ersten Filter 0,5; Schwingungsrichtung um „twist“ gedreht; Analysator bei 90°
  return 0.5 * malus(90 - twist);
}

/** Segmente einer Sieben-Segment-Anzeige je Ziffer (a b c d e f g). */
export const SEGMENTS: Record<number, string> = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
};

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'malus' | 'chain' | 'crossed' | 'brewster' | 'wave' | 'lcd';

export interface PolTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** zulässige absolute Abweichung (0 = genau) */
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
export function numText(x: number, lang: 'de' | 'en', d = 1): string {
  const s = String(Math.round(x * 10 ** d) / 10 ** d);
  return lang === 'de' ? s.replace('.', ',') : s;
}

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): PolTask {
  const r = rng(n * 61 + 29);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['malus', 'crossed', 'chain', 'wave', 'brewster', 'lcd'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const nt = numText;
  if (kind === 'malus') {
    const d = pick([30, 45, 60]);
    const pc = malus(d) * 100;
    return {
      kind,
      text: {
        de: `Polarisiertes Licht trifft auf ein Filter, das um ${d}° gegen die Schwingungsrichtung gedreht ist. Wie viel Prozent der Helligkeit kommen durch?`,
        en: `Polarised light hits a filter turned by ${d}° against its direction of oscillation. What percentage of the brightness gets through?`,
      },
      answer: pc,
      tol: 1,
      choices: null,
      solution: { de: `cos²(${d}°) = ${nt(pc / 100, 'de', 2)}, also ${nt(pc, 'de', 0)} %`, en: `cos²(${d}°) = ${nt(pc / 100, 'en', 2)}, so ${nt(pc, 'en', 0)} %` },
    };
  }
  if (kind === 'chain') {
    const m = pick([30, 45, 60]);
    const I = chain([0, m, 90]) * 100;
    return {
      kind,
      text: {
        de: `Unpolarisiertes Licht geht durch drei Filter mit 0°, ${m}° und 90°. Wie viel Prozent der ursprünglichen Helligkeit kommen am Ende an?`,
        en: `Unpolarised light passes three filters at 0°, ${m}° and 90°. What percentage of the original brightness arrives at the end?`,
      },
      answer: I,
      tol: 1,
      choices: null,
      solution: {
        de: `0,5 · cos²(${m}°) · cos²(${90 - m}°) ≈ ${nt(I / 100, 'de', 3)}, also etwa ${nt(I, 'de', 1)} %`,
        en: `0.5 · cos²(${m}°) · cos²(${90 - m}°) ≈ ${nt(I / 100, 'en', 3)}, so about ${nt(I, 'en', 1)} %`,
      },
    };
  }
  if (kind === 'crossed') {
    return {
      kind,
      text: {
        de: 'Zwei Polarisationsfilter stehen genau senkrecht zueinander (gekreuzt). Was sieht man hinter dem zweiten Filter?',
        en: 'Two polarising filters are exactly perpendicular to each other (crossed). What do you see behind the second filter?',
      },
      answer: 3,
      tol: 0,
      choices: [
        { de: 'die halbe Helligkeit', en: 'half the brightness' },
        { de: 'ein Viertel der Helligkeit', en: 'a quarter of the brightness' },
        { de: 'Dunkelheit', en: 'darkness' },
        { de: 'die volle Helligkeit', en: 'full brightness' },
      ],
      solution: { de: 'cos²(90°) = 0: Es wird dunkel.', en: 'cos²(90°) = 0: it goes dark.' },
    };
  }
  if (kind === 'wave') {
    const items: [Loc, number][] = [
      [{ de: 'Licht', en: 'light' }, 1],
      [{ de: 'Schall in Luft', en: 'sound in air' }, 2],
      [{ de: 'Radiowellen', en: 'radio waves' }, 1],
      [{ de: 'eine Seilwelle (Seil wird quer ausgelenkt)', en: 'a wave on a rope (rope displaced sideways)' }, 1],
    ];
    const [w, a] = pick(items);
    return {
      kind,
      text: { de: `Lässt sich ${w.de} polarisieren?`, en: `Can ${w.en} be polarised?` },
      answer: a,
      tol: 0,
      choices: [
        { de: 'ja, es ist eine Querwelle', en: 'yes, it is a transverse wave' },
        { de: 'nein, es ist eine Längswelle', en: 'no, it is a longitudinal wave' },
      ],
      solution: {
        de: 'Nur Querwellen haben eine Schwingungsrichtung quer zur Ausbreitung, die ein Filter auswählen kann.',
        en: 'Only transverse waves have a direction of oscillation across the direction of travel that a filter can select.',
      },
    };
  }
  if (kind === 'brewster') {
    const [name, nn]: [Loc, number] = pick([
      [{ de: 'Wasser', en: 'water' }, 1.33],
      [{ de: 'Glas', en: 'glass' }, 1.5],
      [{ de: 'Diamant', en: 'diamond' }, 2.42],
    ] as [Loc, number][]);
    const b = brewster(nn);
    return {
      kind,
      text: {
        de: `Unter welchem Einfallswinkel (in °) ist das an ${name.de} (n = ${nt(nn, 'de', 2)}) reflektierte Licht vollständig polarisiert? (tan θ = n)`,
        en: `At which angle of incidence (in °) is light reflected from ${name.en} (n = ${nt(nn, 'en', 2)}) completely polarised? (tan θ = n)`,
      },
      answer: b,
      tol: 1,
      choices: null,
      solution: { de: `θ = arctan(${nt(nn, 'de', 2)}) ≈ ${nt(b, 'de', 1)}°`, en: `θ = arctan(${nt(nn, 'en', 2)}) ≈ ${nt(b, 'en', 1)}°` },
    };
  }
  const on = r() < 0.5;
  return {
    kind: 'lcd',
    text: {
      de: `Ein LCD-Bildpunkt liegt zwischen gekreuzten Filtern. ${on ? 'Am Flüssigkristall liegt Spannung an.' : 'Am Flüssigkristall liegt keine Spannung an.'} Ist der Bildpunkt hell oder dunkel?`,
      en: `An LCD pixel sits between crossed filters. ${on ? 'A voltage is applied to the liquid crystal.' : 'No voltage is applied to the liquid crystal.'} Is the pixel bright or dark?`,
    },
    answer: on ? 2 : 1,
    tol: 0,
    choices: [
      { de: 'hell', en: 'bright' },
      { de: 'dunkel', en: 'dark' },
    ],
    solution: on
      ? {
          de: 'Mit Spannung richten sich die Kristalle aus und drehen nicht mehr: Das zweite Filter sperrt, der Punkt ist dunkel.',
          en: 'With voltage the crystals line up and no longer twist: the second filter blocks, the pixel is dark.',
        }
      : {
          de: 'Ohne Spannung dreht der Kristall die Schwingungsrichtung um 90°: Das Licht passt durch das zweite Filter, der Punkt ist hell.',
          en: 'Without voltage the crystal twists the direction by 90°: the light passes the second filter, the pixel is bright.',
        },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. */
export function checkTask(task: PolTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[%°a-zA-Z]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  return Math.abs(x - task.answer) <= task.tol + 1e-9;
}
