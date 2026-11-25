/**
 * Newton’sche Gesetze: Trägheit (Kiste auf bremsendem Wagen), Grundgleichung
 * F = m · a (Wagen mit Zuggewicht über eine Rolle, mit oder ohne Reibung) und
 * Wechselwirkung (zwei Wagen stoßen sich ab).
 */

export const G = 9.81;

/**
 * Beschleunigung eines Wagens (Masse mc), der von einem hängenden Körper (mh)
 * über eine Rolle gezogen wird; Gleitreibungszahl μ zwischen Wagen und Bahn.
 * Die Zugkraft F = mh · g beschleunigt beide Massen zusammen.
 */
export function pulleyAcceleration(mc: number, mh: number, mu: number, g = G): number {
  const drive = mh * g;
  const friction = mu * mc * g;
  if (drive <= friction) return 0;
  return (drive - friction) / (mc + mh);
}

/** Seilkraft beim Zug über die Rolle: F_S = mh · (g − a). */
export function ropeForce(mh: number, a: number, g = G): number {
  return mh * (g - a);
}

/**
 * Bremsen: Der Wagen verzögert mit `brake` (m/s², positiv). Eine lose Kiste
 * kann höchstens mit μ · g mitgebremst werden (Haft-/Gleitreibung).
 * Liefert die Verzögerung der Kiste.
 */
export function boxDeceleration(brake: number, mu: number, g = G): number {
  return Math.min(brake, mu * g);
}

/** Abstoßen: Kraft F wirkt die Zeit dt auf beide Wagen in Gegenrichtung. */
export function pushOff(m1: number, m2: number, F: number, dt: number): { v1: number; v2: number } {
  return { v1: (-F * dt) / m1, v2: (F * dt) / m2 };
}

/** Gleichmäßig beschleunigte Bewegung aus der Ruhe. */
export function motion(a: number, t: number): { s: number; v: number } {
  return { s: 0.5 * a * t * t, v: a * t };
}

/* ------------------------------------------------------------------ */
/* Kräfte und Bewegung: Schieben gegen Reibung                         */
/* ------------------------------------------------------------------ */

/**
 * Beschleunigung einer Kiste (Masse m), auf die eine waagerechte Schubkraft F
 * wirkt. Ruht sie, hält die Haftreibung bis μ_H · m · g dagegen; gleitet sie,
 * bremst die Gleitreibung μ_G · m · g gegen die Bewegungsrichtung.
 * Liefert Beschleunigung und die tatsächlich wirkende Reibungskraft (mit Vorzeichen).
 */
export function pushedBox(F: number, m: number, muH: number, muG: number, v: number, g = G): { a: number; friction: number; sticking: boolean } {
  const N = m * g;
  if (Math.abs(v) < 1e-9) {
    if (Math.abs(F) <= muH * N) return { a: 0, friction: -F, sticking: true };
    const fr = -Math.sign(F) * muG * N;
    return { a: (F + fr) / m, friction: fr, sticking: false };
  }
  const fr = -Math.sign(v) * muG * N;
  return { a: (F + fr) / m, friction: fr, sticking: false };
}

/**
 * Ein Zeitschritt für die geschobene Kiste. Wechselt die Geschwindigkeit beim
 * Bremsen durch Reibung das Vorzeichen, bleibt die Kiste stehen (Reibung
 * schiebt nie rückwärts an).
 */
export function stepBox(state: { x: number; v: number }, F: number, m: number, muH: number, muG: number, dt: number, g = G): { x: number; v: number } {
  const { a } = pushedBox(F, m, muH, muG, state.v, g);
  let v = state.v + a * dt;
  // Beim Abbremsen bis zum Stillstand nicht über null hinaus (danach entscheidet die Haftreibung)
  if (state.v !== 0 && Math.sign(v) !== Math.sign(state.v)) v = 0;
  return { x: state.x + 0.5 * (state.v + v) * dt, v };
}

/* ------------------------------------------------------------------ */
/* Waage im Aufzug                                                     */
/* ------------------------------------------------------------------ */

/** Fahrplan des Aufzugs: Anfahren, gleichförmig fahren, Bremsen (Dauer in s). */
export const LIFT_PHASES = { start: 1, accel: 1.6, cruise: 3, brake: 1.6, after: 1 } as const;

/**
 * Beschleunigung des Aufzugs zur Zeit t (nach oben positiv). `dir` = +1 aufwärts,
 * −1 abwärts; `acc` Betrag der Beschleunigung beim Anfahren und Bremsen.
 * `fall`: Das Seil reißt nach dem Anfahren – freier Fall mit −g.
 */
export function liftAcceleration(t: number, dir: 1 | -1, acc: number, fall = false, g = G): number {
  const P = LIFT_PHASES;
  const t1 = P.start;
  const t2 = t1 + P.accel;
  const t3 = t2 + P.cruise;
  const t4 = t3 + P.brake;
  if (t < t1) return 0;
  if (t < t2) return dir * acc;
  if (fall) return t < t3 ? -g : 0;
  if (t < t3) return 0;
  if (t < t4) return -dir * acc;
  return 0;
}

/** Gesamtdauer eines Aufzugsversuchs. */
export function liftDuration(): number {
  const P = LIFT_PHASES;
  return P.start + P.accel + P.cruise + P.brake + P.after;
}

/**
 * Anzeige einer Personenwaage (in kg) im beschleunigten Aufzug:
 * Die Waage misst die Normalkraft F_N = m · (g + a) und rechnet durch g.
 */
export function scaleReading(m: number, a: number, g = G): number {
  return Math.max(0, (m * (g + a)) / g);
}

/* ------------------------------------------------------------------ */
/* Messreihe                                                           */
/* ------------------------------------------------------------------ */

/** Steigung der Ausgleichsgeraden durch den Ursprung (kleinste Quadrate). */
export function slopeThroughOrigin(points: readonly (readonly [number, number])[]): number {
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of points) {
    sxy += x * y;
    sxx += x * x;
  }
  return sxx > 0 ? sxy / sxx : 0;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'a' | 'F' | 'm' | 'law' | 'lift' | 'rope' | 'brake' | 'push';

export interface NewtonTask {
  kind: TaskKind;
  text: Loc;
  /** richtige Antwort (Zahl; bei `law` die Nummer des Gesetzes) */
  answer: number;
  unit: string;
  /** zulässige relative Abweichung */
  tol: number;
  solution: Loc;
}

/** Kleiner, reproduzierbarer Zufall (gleiche Aufgabe für gleiche Nummer). */
function rng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const de = (x: number, d = 2) => {
  const s = (Math.round(x * 10 ** d) / 10 ** d).toString();
  return s.replace('.', ',').replace('-', '−');
};
const en = (x: number, d = 2) => (Math.round(x * 10 ** d) / 10 ** d).toString().replace('-', '−');

const LAW_ITEMS: { de: string; en: string; law: 1 | 2 | 3 }[] = [
  { de: 'Im Bus, der scharf bremst, kippst du nach vorn.', en: 'In a bus that brakes hard, you tip forwards.', law: 1 },
  { de: 'Ein Raumschiff fliegt ohne Antrieb geradeaus mit gleicher Geschwindigkeit weiter.', en: 'A spaceship with its engines off keeps flying straight at the same speed.', law: 1 },
  { de: 'Beim Abschlagen eines Tischtuchs bleibt das Geschirr stehen.', en: 'When a tablecloth is pulled away quickly, the dishes stay put.', law: 1 },
  { de: 'Ein leerer Einkaufswagen lässt sich leichter anschieben als ein voller.', en: 'An empty shopping trolley is easier to get moving than a full one.', law: 2 },
  { de: 'Mit doppelter Kraft beschleunigt der gleiche Wagen doppelt so stark.', en: 'With twice the force, the same cart accelerates twice as much.', law: 2 },
  { de: 'Ein Rennwagen ist leicht gebaut, damit er schneller beschleunigt.', en: 'A racing car is built light so that it accelerates faster.', law: 2 },
  { de: 'Eine Rakete stößt Gas nach hinten aus und fliegt nach vorn.', en: 'A rocket pushes gas out backwards and flies forwards.', law: 3 },
  { de: 'Wer im Boot ans Ufer springt, stößt das Boot vom Ufer weg.', en: 'Jumping from a boat to the shore pushes the boat away from the shore.', law: 3 },
  { de: 'Beim Schuss mit einem Gewehr spürt man einen Rückstoß.', en: 'When a rifle is fired, you feel a recoil.', law: 3 },
  { de: 'Du stößt dich mit den Füßen vom Beckenrand ab und gleitest durchs Wasser.', en: 'You push off the pool wall with your feet and glide through the water.', law: 3 },
];

/**
 * Erzeugt Übungsaufgabe Nummer n (1, 2, 3, …). Die Arten wechseln reihum,
 * die Zahlen sind zufällig, aber für dieselbe Nummer immer gleich.
 */
export function makeTask(n: number, g = G): NewtonTask {
  const r = rng(n * 97 + 13);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['a', 'F', 'law', 'm', 'lift', 'rope', 'law', 'brake', 'push'];
  const kind = kinds[(n - 1) % kinds.length]!;
  if (kind === 'a') {
    const m = pick([2, 4, 5, 8, 10, 20, 50, 1200]);
    const F = m === 1200 ? pick([2400, 3600, 6000]) : pick([4, 6, 10, 12, 20, 40]);
    const a = F / m;
    return {
      kind,
      text: { de: `Auf einen Körper mit ${de(m)} kg wirkt die Kraft ${de(F)} N (ohne Reibung). Wie groß ist die Beschleunigung in m/s²?`, en: `A force of ${en(F)} N acts on a body of ${en(m)} kg (no friction). What is the acceleration in m/s²?` },
      answer: a,
      unit: 'm/s²',
      tol: 0.02,
      solution: { de: `a = F : m = ${de(F)} N : ${de(m)} kg = ${de(a)} m/s²`, en: `a = F / m = ${en(F)} N / ${en(m)} kg = ${en(a)} m/s²` },
    };
  }
  if (kind === 'F') {
    const m = pick([0.5, 2, 3, 60, 1000, 1500]);
    const a = pick([0.5, 1.5, 2, 3, 4]);
    const F = m * a;
    return {
      kind,
      text: { de: `Welche Kraft (in N) braucht man, um ${de(m)} kg mit ${de(a)} m/s² zu beschleunigen?`, en: `What force (in N) is needed to accelerate ${en(m)} kg at ${en(a)} m/s²?` },
      answer: F,
      unit: 'N',
      tol: 0.02,
      solution: { de: `F = m · a = ${de(m)} kg · ${de(a)} m/s² = ${de(F)} N`, en: `F = m · a = ${en(m)} kg · ${en(a)} m/s² = ${en(F)} N` },
    };
  }
  if (kind === 'm') {
    const F = pick([30, 60, 90, 120, 600]);
    const a = pick([1.5, 2, 3, 5, 6]);
    const m = F / a;
    return {
      kind,
      text: { de: `Eine Kraft von ${de(F)} N beschleunigt einen Wagen mit ${de(a)} m/s². Welche Masse (in kg) hat er?`, en: `A force of ${en(F)} N accelerates a cart at ${en(a)} m/s². What is its mass (in kg)?` },
      answer: m,
      unit: 'kg',
      tol: 0.02,
      solution: { de: `m = F : a = ${de(F)} N : ${de(a)} m/s² = ${de(m)} kg`, en: `m = F / a = ${en(F)} N / ${en(a)} m/s² = ${en(m)} kg` },
    };
  }
  if (kind === 'law') {
    const it = pick(LAW_ITEMS);
    return {
      kind,
      text: { de: `Welches Newton’sche Gesetz erklärt das? „${it.de}“ (Antwort 1, 2 oder 3)`, en: `Which of Newton’s laws explains this? “${it.en}” (answer 1, 2 or 3)` },
      answer: it.law,
      unit: '',
      tol: 0,
      solution: {
        de: it.law === 1 ? '1. Trägheitsgesetz: Ohne Kraft ändert sich der Bewegungszustand nicht.' : it.law === 2 ? '2. Grundgleichung F = m · a: Kraft, Masse und Beschleunigung hängen zusammen.' : '3. Wechselwirkung: Zu jeder Kraft gibt es eine gleich große Gegenkraft auf den anderen Körper.',
        en: it.law === 1 ? '1st law (inertia): without a force the state of motion does not change.' : it.law === 2 ? '2nd law F = m · a: force, mass and acceleration are linked.' : '3rd law: every force has an equal and opposite force on the other body.',
      },
    };
  }
  if (kind === 'lift') {
    const m = pick([40, 50, 60, 70, 80]);
    const a = pick([1, 1.5, 2]);
    const up = r() < 0.5;
    const reading = scaleReading(m, up ? a : -a, g);
    return {
      kind,
      text: {
        de: `Eine Person (${de(m)} kg) steht im Aufzug auf einer Waage. Der Aufzug ${up ? 'fährt nach oben an' : 'bremst bei der Fahrt nach oben'} mit ${de(a)} m/s². Was zeigt die Waage in kg? (g = 9,81 m/s²)`,
        en: `A person (${en(m)} kg) stands on scales in a lift. The lift ${up ? 'starts moving upwards' : 'brakes while going up'} at ${en(a)} m/s². What do the scales show in kg? (g = 9.81 m/s²)`,
      },
      answer: reading,
      unit: 'kg',
      tol: 0.015,
      solution: {
        de: `F_N = m · (g ${up ? '+' : '−'} a) = ${de(m)} kg · ${de(g + (up ? a : -a))} m/s²; Anzeige = F_N : g ≈ ${de(reading, 1)} kg`,
        en: `F_N = m · (g ${up ? '+' : '−'} a) = ${en(m)} kg · ${en(g + (up ? a : -a))} m/s²; reading = F_N / g ≈ ${en(reading, 1)} kg`,
      },
    };
  }
  if (kind === 'rope') {
    const mc = pick([0.4, 0.5, 0.9, 1.4]);
    const mh = pick([0.05, 0.1, 0.2]);
    const a = pulleyAcceleration(mc, mh, 0, g);
    return {
      kind,
      text: {
        de: `Ein Wagen (${de(mc)} kg) wird reibungsfrei von einem Zuggewicht (${de(mh * 1000, 0)} g) über eine Rolle gezogen. Wie groß ist die Beschleunigung in m/s²? (g = 9,81 m/s²)`,
        en: `A cart (${en(mc)} kg) is pulled without friction by a hanging weight (${en(mh * 1000, 0)} g) over a pulley. What is the acceleration in m/s²? (g = 9.81 m/s²)`,
      },
      answer: a,
      unit: 'm/s²',
      tol: 0.02,
      solution: {
        de: `Die Zugkraft beschleunigt beide Massen: a = m_Z · g : (m_W + m_Z) = ${de(mh * g)} N : ${de(mc + mh)} kg ≈ ${de(a)} m/s²`,
        en: `The pulling force accelerates both masses: a = m_h · g / (m_c + m_h) = ${en(mh * g)} N / ${en(mc + mh)} kg ≈ ${en(a)} m/s²`,
      },
    };
  }
  if (kind === 'brake') {
    const m = pick([800, 1000, 1200, 1500]);
    const v = pick([10, 15, 20]);
    const t = pick([2, 2.5, 4, 5]);
    const F = (m * v) / t;
    return {
      kind,
      text: {
        de: `Ein Auto (${de(m)} kg) bremst gleichmäßig in ${de(t)} s von ${de(v)} m/s auf 0. Wie groß ist die Bremskraft in N?`,
        en: `A car (${en(m)} kg) brakes evenly from ${en(v)} m/s to 0 in ${en(t)} s. How large is the braking force in N?`,
      },
      answer: F,
      unit: 'N',
      tol: 0.02,
      solution: {
        de: `a = Δv : Δt = ${de(v)} : ${de(t)} = ${de(v / t)} m/s²; F = m · a = ${de(F)} N`,
        en: `a = Δv / Δt = ${en(v)} / ${en(t)} = ${en(v / t)} m/s²; F = m · a = ${en(F)} N`,
      },
    };
  }
  // push: Wechselwirkung beim Abstoßen
  const m1 = pick([40, 50, 60]);
  const m2 = pick([20, 30, 80, 100]);
  const v1 = pick([0.5, 1, 1.5, 2]);
  const v2 = (m1 * v1) / m2;
  return {
    kind: 'push',
    text: {
      de: `Zwei Kinder auf Rollbrettern (${de(m1)} kg und ${de(m2)} kg) stoßen sich voneinander ab. Das erste rollt mit ${de(v1)} m/s davon. Wie schnell (in m/s) rollt das zweite?`,
      en: `Two children on skateboards (${en(m1)} kg and ${en(m2)} kg) push off from each other. The first rolls away at ${en(v1)} m/s. How fast (in m/s) does the second roll?`,
    },
    answer: v2,
    unit: 'm/s',
    tol: 0.02,
    solution: {
      de: `Gleiche Kraft, gleiche Zeit → gleich große Impulse: ${de(m1)} · ${de(v1)} = ${de(m2)} · v₂ → v₂ = ${de(v2)} m/s (in die Gegenrichtung)`,
      en: `Equal force for the same time → equal momenta: ${en(m1)} · ${en(v1)} = ${en(m2)} · v₂ → v₂ = ${en(v2)} m/s (in the opposite direction)`,
    },
  };
}

/** Liest eine Zahl mit Komma oder Punkt; null, wenn keine Zahl. */
export function parseAnswer(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace('−', '-').replace(',', '.').replace(/[a-zA-Z/²]+$/, '');
  if (!s || !/^-?\d*\.?\d+(e-?\d+)?$/.test(s)) return null;
  return Number(s);
}

/** Prüft eine Eingabe; null bei leerer oder unlesbarer Eingabe. */
export function checkTask(task: NewtonTask, input: string): boolean | null {
  const x = parseAnswer(input);
  if (x === null) return null;
  if (task.tol === 0) return x === task.answer;
  return Math.abs(Math.abs(x) - Math.abs(task.answer)) <= task.tol * Math.abs(task.answer) + 1e-9;
}
