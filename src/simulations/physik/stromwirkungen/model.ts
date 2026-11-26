/**
 * Wirkungen des elektrischen Stroms (Wärme, Licht, Magnetismus, Chemie),
 * Schmelzsicherung und Gefahren für den Menschen.
 */

export type Device = 'lampe' | 'heiz' | 'spule' | 'wasser';

/** Widerstände der Geräte in Ohm (vereinfachte Schulwerte). */
export const R_DEVICE: Record<Device, number> = {
  lampe: 12,
  heiz: 4,
  spule: 6,
  wasser: 20,
};

/** Widerstand der Zuleitungen bei Kurzschluss (Ω). */
export const R_SHORT = 0.1;
/** Innenwiderstand der Quelle (Ω). */
export const R_INNER = 0.3;

/** Stromstärke im Kreis in A. */
export function current(U: number, device: Device, short: boolean): number {
  const R = short ? R_SHORT : R_DEVICE[device];
  return U / (R + R_INNER);
}

/** Leistung im Gerät in W (bei Kurzschluss 0: der Strom fließt am Gerät vorbei). */
export function power(U: number, device: Device, short: boolean): number {
  if (short) return 0;
  const I = current(U, device, false);
  return I * I * R_DEVICE[device];
}

/** Brennt die Schmelzsicherung durch? */
export function fuseBlows(I: number, rating: number): boolean {
  return I > rating;
}

/* ------------------------------------------------------------------ */
/* Gefahr für den Menschen                                             */
/* ------------------------------------------------------------------ */

/** Körperwiderstand Hand–Fuß in Ω: trockene Haut etwa 3000 Ω, nasse etwa 1000 Ω. */
export function bodyResistance(wet: boolean): number {
  return wet ? 1000 : 3000;
}

/** Körperstrom in mA. */
export function bodyCurrent(U: number, wet: boolean): number {
  return (U / bodyResistance(wet)) * 1000;
}

export type Danger = 'none' | 'tingle' | 'cramp' | 'deadly';

/** Grobe Einteilung der Wirkung von Wechselstrom auf den Körper (Richtwerte). */
export function danger(mA: number): Danger {
  if (mA < 1) return 'none';
  if (mA < 10) return 'tingle';
  if (mA < 50) return 'cramp';
  return 'deadly';
}

/** FI-Schutzschalter: löst bei Fehlerstrom ab 30 mA aus. */
export const RCD_LIMIT = 30;

/* ------------------------------------------------------------------ */
/* Haushalt: Leistung, Sicherung, Kosten                               */
/* ------------------------------------------------------------------ */

export type HomeDevice = 'kocher' | 'foehn' | 'toaster' | 'heizer' | 'lampe' | 'laden';

/** Typische Leistungen in W. */
export const HOME_POWER: Record<HomeDevice, number> = {
  kocher: 2000,
  foehn: 1800,
  toaster: 900,
  heizer: 2000,
  lampe: 10,
  laden: 20,
};

export const MAINS = 230;
/** Leitungsschutzschalter eines Stromkreises im Haus (A). */
export const BREAKER = 16;
/** Strompreis in Euro pro kWh (Richtwert). */
export const PRICE_KWH = 0.35;

/** Gesamtstrom in A: I = P / U, die Leistungen der eingeschalteten Geräte addieren sich. */
export function householdCurrent(on: readonly HomeDevice[]): number {
  return on.reduce((s, d) => s + HOME_POWER[d], 0) / MAINS;
}

/** Kosten in Euro für eine Leistung P (W) über eine Zahl von Stunden. */
export function cost(P: number, hours: number, price = PRICE_KWH): number {
  return (P / 1000) * hours * price;
}

/* ------------------------------------------------------------------ */
/* Schutzmaßnahmen bei einem defekten Gerät                            */
/* ------------------------------------------------------------------ */

export interface FaultOutcome {
  /** Strom durch den Körper in mA (nur, solange nichts abschaltet) */
  bodyMA: number;
  /** Schmelzsicherung bzw. Leitungsschutzschalter löst aus */
  breaker: boolean;
  /** FI-Schalter löst aus */
  rcd: boolean;
  /** Ist die Person in Gefahr? */
  danger: Danger;
}

/**
 * Ein Draht berührt innen das Metallgehäuse (Körperschluss). Mit Schutzleiter
 * fließt ein großer Fehlerstrom zur Erde – die Sicherung löst sofort aus.
 * Ohne Schutzleiter liegt das Gehäuse unter Spannung; wer es berührt, wird
 * durchströmt (Körper und Schuhe/Boden zusammen etwa 2000 Ω). Ein FI-Schalter
 * erkennt den Fehlerstrom ab 30 mA und schaltet in Sekundenbruchteilen ab.
 */
export function faultOutcome(pe: boolean, rcd: boolean, touching: boolean): FaultOutcome {
  if (pe) return { bodyMA: 0, breaker: true, rcd, danger: 'none' };
  const mA = touching ? (MAINS / 2000) * 1000 : 0;
  const trips = rcd && mA >= RCD_LIMIT;
  return { bodyMA: mA, breaker: false, rcd: trips, danger: trips ? 'tingle' : danger(mA) };
}

/* ------------------------------------------------------------------ */
/* Vogel auf der Leitung                                               */
/* ------------------------------------------------------------------ */

export type Contact = 'eins' | 'zwei' | 'boden';

/**
 * Spannung, die am Körper anliegt: Ein Vogel auf nur einem Seil überbrückt
 * wenige Zentimeter Seil (Widerstand fast null) – praktisch 0 V. Wer zwei
 * Leiter berührt, bekommt die Spannung zwischen ihnen; wer einen Leiter und
 * die Erde berührt, die Spannung gegen Erde.
 */
export function contactVoltage(c: Contact, lineCurrent = 200, gapM = 0.05, ohmPerM = 1e-4): number {
  if (c === 'eins') return lineCurrent * gapM * ohmPerM;
  if (c === 'zwei') return 400;
  return MAINS;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
/** Faraday-Konstante in C/mol */
export const FARADAY = 96485;

export type Metal = 'cu' | 'ag' | 'ni';

/** Molare Masse (g/mol), Ladungszahl der Ionen und Dichte (g/cm³) */
export const METAL: Record<Metal, { M: number; z: number; rho: number }> = {
  cu: { M: 63.55, z: 2, rho: 8.96 },
  ag: { M: 107.87, z: 1, rho: 10.49 },
  ni: { M: 58.69, z: 2, rho: 8.91 },
};

/** Abgeschiedene Masse in g bei Stromstärke I (A) und Zeit t (min): m = I·t·M / (z·F). */
export function platedMass(I: number, tMin: number, metal: Metal): number {
  const { M, z } = METAL[metal];
  return (I * tMin * 60 * M) / (z * FARADAY);
}

/** Schichtdicke in µm, wenn sich die Masse m (g) gleichmäßig auf die Fläche A (cm²) verteilt. */
export function layerThickness(m: number, metal: Metal, areaCm2: number): number {
  return (m / (METAL[metal].rho * areaCm2)) * 1e4;
}

/** Größte Haltekraft des Kranmagneten (N) im vereinfachten Modell */
export const CRANE_FMAX = 12000;
/** Windungen mal Stromstärke, bei der der Eisenkern merklich sättigt */
export const CRANE_NI0 = 2000;

/**
 * Haltekraft eines Lasthebemagneten in N (vereinfachtes Modell): wächst mit
 * Windungszahl · Stromstärke, flacht ab, wenn das Eisen gesättigt ist.
 */
export function holdForce(N: number, I: number): number {
  return CRANE_FMAX * (1 - Math.exp(-(N * I) / CRANE_NI0));
}

export type TaskKind = 'effect' | 'I' | 'fuse' | 'cost' | 'body' | 'safety' | 'plate' | 'magnet';

export interface CurrentTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** Zulässige relative Abweichung (0 = genau) */
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

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const de = (x: number, d = 2) => round(x, d).toString().replace('.', ',');
const en = (x: number, d = 2) => round(x, d).toString();

const HOME_NAME: Record<HomeDevice, Loc> = {
  kocher: { de: 'Wasserkocher', en: 'kettle' },
  foehn: { de: 'Föhn', en: 'hair dryer' },
  toaster: { de: 'Toaster', en: 'toaster' },
  heizer: { de: 'Heizlüfter', en: 'fan heater' },
  lampe: { de: 'LED-Lampe', en: 'LED lamp' },
  laden: { de: 'Ladegerät', en: 'charger' },
};

/** Übungsaufgabe Nummer n. */
export function makeTask(n: number): CurrentTask {
  const r = rng(n * 73 + 41);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['effect', 'I', 'fuse', 'body', 'cost', 'safety', 'plate', 'magnet'];
  const kind = kinds[(n - 1) % kinds.length]!;
  if (kind === 'effect') {
    const items: [Loc, number][] = [
      [{ de: 'Ein Toaster bräunt das Brot.', en: 'A toaster browns the bread.' }, 1],
      [{ de: 'Eine LED leuchtet.', en: 'An LED lights up.' }, 2],
      [{ de: 'Ein Elektromagnet hebt Schrott.', en: 'An electromagnet lifts scrap metal.' }, 3],
      [{ de: 'Ein Löffel wird in einem Bad verkupfert.', en: 'A spoon is copper-plated in a bath.' }, 4],
      [{ de: 'Eine Klingel schlägt an.', en: 'A bell rings.' }, 3],
      [{ de: 'Ein Bügeleisen wird heiß.', en: 'An iron gets hot.' }, 1],
    ];
    const [t, a] = pick(items);
    const choices: Loc[] = [
      { de: 'Wärmewirkung', en: 'heating effect' },
      { de: 'Lichtwirkung', en: 'lighting effect' },
      { de: 'magnetische Wirkung', en: 'magnetic effect' },
      { de: 'chemische Wirkung', en: 'chemical effect' },
    ];
    return {
      kind,
      text: { de: `Welche Wirkung des Stroms wird genutzt? „${t.de}“`, en: `Which effect of current is used? “${t.en}”` },
      answer: a,
      tol: 0,
      choices,
      solution: { de: `${choices[a - 1]!.de}.`, en: `${choices[a - 1]!.en}.` },
    };
  }
  if (kind === 'I') {
    const d = pick(['kocher', 'foehn', 'toaster', 'heizer'] as HomeDevice[]);
    const I = HOME_POWER[d] / MAINS;
    return {
      kind,
      text: {
        de: `Ein ${HOME_NAME[d].de} hat ${HOME_POWER[d]} W und hängt an 230 V. Wie groß ist die Stromstärke in A?`,
        en: `A ${HOME_NAME[d].en} is rated ${HOME_POWER[d]} W and runs on 230 V. What is the current in A?`,
      },
      answer: I,
      tol: 0.03,
      choices: null,
      solution: { de: `I = P : U = ${HOME_POWER[d]} W : 230 V ≈ ${de(I, 1)} A`, en: `I = P / U = ${HOME_POWER[d]} W / 230 V ≈ ${en(I, 1)} A` },
    };
  }
  if (kind === 'fuse') {
    const a = pick(['kocher', 'heizer'] as HomeDevice[]);
    const b = pick(['foehn', 'toaster'] as HomeDevice[]);
    const c = pick(['toaster', 'lampe', 'laden'] as HomeDevice[]);
    const list = [a, b, c];
    const I = householdCurrent(list);
    const ans = I > BREAKER ? 1 : 2;
    return {
      kind,
      text: {
        de: `An einer Mehrfachsteckdose (Stromkreis mit 16-A-Sicherung) laufen ${HOME_NAME[a].de} (${HOME_POWER[a]} W), ${HOME_NAME[b].de} (${HOME_POWER[b]} W) und ${HOME_NAME[c].de} (${HOME_POWER[c]} W). Löst die Sicherung aus?`,
        en: `A power strip (circuit with a 16 A breaker) runs a ${HOME_NAME[a].en} (${HOME_POWER[a]} W), a ${HOME_NAME[b].en} (${HOME_POWER[b]} W) and a ${HOME_NAME[c].en} (${HOME_POWER[c]} W). Does the breaker trip?`,
      },
      answer: ans,
      tol: 0,
      choices: [
        { de: 'ja', en: 'yes' },
        { de: 'nein', en: 'no' },
      ],
      solution: {
        de: `I = ${HOME_POWER[a] + HOME_POWER[b] + HOME_POWER[c]} W : 230 V ≈ ${de(I, 1)} A – ${I > BREAKER ? 'mehr' : 'weniger'} als 16 A.`,
        en: `I = ${HOME_POWER[a] + HOME_POWER[b] + HOME_POWER[c]} W / 230 V ≈ ${en(I, 1)} A – ${I > BREAKER ? 'more' : 'less'} than 16 A.`,
      },
    };
  }
  if (kind === 'body') {
    const U = pick([24, 50, 230]);
    const wet = r() < 0.5;
    const mA = bodyCurrent(U, wet);
    return {
      kind,
      text: {
        de: `Eine Person mit ${wet ? 'nasser' : 'trockener'} Haut (Körperwiderstand ${wet ? '1000' : '3000'} Ω) berührt ${U} V. Wie groß ist der Körperstrom in mA?`,
        en: `A person with ${wet ? 'wet' : 'dry'} skin (body resistance ${wet ? '1000' : '3000'} Ω) touches ${U} V. What is the current through the body in mA?`,
      },
      answer: mA,
      tol: 0.03,
      choices: null,
      solution: {
        de: `I = U : R = ${U} V : ${wet ? '1000' : '3000'} Ω ≈ ${de(mA, 0)} mA${mA >= 50 ? ' – lebensgefährlich' : mA >= 10 ? ' – Muskelkrampf, gefährlich' : ''}`,
        en: `I = U / R = ${U} V / ${wet ? '1000' : '3000'} Ω ≈ ${en(mA, 0)} mA${mA >= 50 ? ' – deadly' : mA >= 10 ? ' – muscle cramp, dangerous' : ''}`,
      },
    };
  }
  if (kind === 'cost') {
    const d = pick(['kocher', 'heizer', 'foehn'] as HomeDevice[]);
    const h = pick([0.5, 1, 2, 3]);
    const c = cost(HOME_POWER[d], h);
    return {
      kind,
      text: {
        de: `Ein ${HOME_NAME[d].de} (${HOME_POWER[d]} W) läuft ${de(h, 1)} Stunden. Was kostet das in Euro bei 0,35 € pro kWh?`,
        en: `A ${HOME_NAME[d].en} (${HOME_POWER[d]} W) runs for ${en(h, 1)} hours. What does that cost in euros at €0.35 per kWh?`,
      },
      answer: c,
      tol: 0.03,
      choices: null,
      solution: {
        de: `E = ${de(HOME_POWER[d] / 1000, 1)} kW · ${de(h, 1)} h = ${de((HOME_POWER[d] / 1000) * h, 2)} kWh; Kosten ≈ ${de(c, 2)} €`,
        en: `E = ${en(HOME_POWER[d] / 1000, 1)} kW · ${en(h, 1)} h = ${en((HOME_POWER[d] / 1000) * h, 2)} kWh; cost ≈ €${en(c, 2)}`,
      },
    };
  }
  if (kind === 'plate') {
    const I = pick([0.5, 1, 1.5, 2]);
    const t = pick([20, 30, 45, 60, 90]);
    const m = platedMass(I, t, 'cu');
    return {
      kind,
      text: {
        de: `Ein Schlüssel wird ${t} Minuten lang mit ${de(I, 1)} A verkupfert. Pro Amperestunde scheiden sich etwa 1,19 g Kupfer ab. Wie viel Gramm Kupfer sind es?`,
        en: `A key is copper-plated for ${t} minutes at ${en(I, 1)} A. About 1.19 g of copper is deposited per ampere-hour. How many grams of copper is that?`,
      },
      answer: m,
      tol: 0.03,
      choices: null,
      solution: {
        de: `Ladung ${de(I, 1)} A · ${de(t / 60, 2)} h = ${de((I * t) / 60, 2)} Ah; m ≈ ${de((I * t) / 60, 2)} · 1,19 g ≈ ${de(m, 2)} g`,
        en: `Charge ${en(I, 1)} A · ${en(t / 60, 2)} h = ${en((I * t) / 60, 2)} Ah; m ≈ ${en((I * t) / 60, 2)} · 1.19 g ≈ ${en(m, 2)} g`,
      },
    };
  }
  if (kind === 'magnet') {
    const N1 = pick([200, 300, 400, 500]);
    const I1 = pick([1, 1.5, 2, 3]);
    const N2 = pick([600, 800, 1000, 1200].filter((x) => x !== N1 * 2));
    const I2 = (N1 * I1) / N2;
    return {
      kind,
      text: {
        de: `Ein Elektromagnet hat ${N1} Windungen und ${de(I1, 1)} A. Ein zweiter, gleich gebauter Magnet hat ${N2} Windungen. Bei welcher Stromstärke in A ist er genauso stark?`,
        en: `An electromagnet has ${N1} turns and ${en(I1, 1)} A. A second magnet of the same build has ${N2} turns. At what current in A is it just as strong?`,
      },
      answer: I2,
      tol: 0.03,
      choices: null,
      solution: {
        de: `Gleich stark bei gleichem Produkt Windungen · Strom: ${N1} · ${de(I1, 1)} A = ${N2} · I, also I ≈ ${de(I2, 2)} A`,
        en: `Equally strong for the same product turns · current: ${N1} · ${en(I1, 1)} A = ${N2} · I, so I ≈ ${en(I2, 2)} A`,
      },
    };
  }
  const items: [Loc, number, Loc][] = [
    [
      { de: 'Das Metallgehäuse eines Geräts ist über den grün-gelben Leiter mit der Erde verbunden.', en: 'The metal casing of a device is connected to earth by the green-yellow wire.' },
      1,
      { de: 'Schutzleiter: Bei einem Fehler fließt der Strom zur Erde, die Sicherung löst aus.', en: 'Protective earth: in a fault the current flows to earth and the fuse trips.' },
    ],
    [
      {
        de: 'Ein Schalter vergleicht den hin- und zurückfließenden Strom und schaltet bei 30 mA Unterschied ab.',
        en: 'A switch compares the outgoing and returning current and switches off at a 30 mA difference.',
      },
      2,
      { de: 'FI-Schutzschalter (Fehlerstrom-Schutzschalter).', en: 'Residual current device (RCD).' },
    ],
    [{ de: 'Ein dünner Draht schmilzt, wenn zu viel Strom fließt.', en: 'A thin wire melts when too much current flows.' }, 3, { de: 'Schmelzsicherung.', en: 'Fuse.' }],
    [
      { de: 'Das Gerät hat ein Gehäuse aus Kunststoff und ein Doppelquadrat-Zeichen.', en: 'The device has a plastic casing and a double-square symbol.' },
      4,
      { de: 'Schutzisolierung.', en: 'Double insulation.' },
    ],
  ];
  const [t, a, sol] = pick(items);
  return {
    kind: 'safety',
    text: { de: `Welche Schutzmaßnahme ist das? „${t.de}“`, en: `Which safety measure is this? “${t.en}”` },
    answer: a,
    tol: 0,
    choices: [
      { de: 'Schutzleiter', en: 'protective earth' },
      { de: 'FI-Schalter', en: 'RCD' },
      { de: 'Schmelzsicherung', en: 'fuse' },
      { de: 'Schutzisolierung', en: 'double insulation' },
    ],
    solution: sol,
  };
}

export function checkTask(task: CurrentTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[a-zA-Z€]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
