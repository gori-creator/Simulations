import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  boxDeceleration,
  checkTask,
  G,
  liftAcceleration,
  liftDuration,
  LIFT_PHASES,
  makeTask,
  pulleyAcceleration,
  pushedBox,
  pushOff,
  ropeForce,
  scaleReading,
  slopeThroughOrigin,
  stepBox,
  type NewtonTask,
} from './model';

const L = (de: string, en: string) => ({ de, en });

type Mode = 'traeg' | 'grund' | 'wechsel' | 'kraft' | 'aufzug' | 'mess' | 'ueben';

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  const sh = Math.round(h * (w >= 700 ? 0.52 : 0.5));
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Trägheit: Geschwindigkeit vor dem Bremsen, Bremsverzögerung, Abstand Kiste–Stirnwand. */
const V0 = 6;
const BRAKE = 8;
const T_BRAKE = 0.8;
const GAP = 0.9;
/** Grundgleichung: Länge der Fahrstrecke (m). */
const TRACK = 1.6;
/** Wechselwirkung: Dauer des Abstoßens (s). */
const PUSH = 0.1;
/** Kräfte und Bewegung: Dauer eines Versuchs (s). */
const KRAFT_T = 8;
/** Messreihe: Abstand der Lichtschranken (m). */
const GATE = 1;

/**
 * Newton’sche Gesetze in sieben Ansichten: Trägheit beim Bremsen, Grundgleichung
 * F = m · a mit Zuggewicht über eine Rolle, Wechselwirkung beim Abstoßen,
 * Kräfte und Bewegung (Schieben gegen Haft- und Gleitreibung), Personenwaage
 * im Aufzug, Messreihe a–F und a–1/m sowie eine Übung mit Rechenaufgaben.
 */
export default defineSimulation({
  id: 'newtonsche-gesetze',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'traeg', label: L('1. Trägheitsgesetz: Kiste auf dem Lastwagen', '1st law: box on a truck') },
        { value: 'grund', label: L('2. Grundgleichung F = m · a', '2nd law: F = m · a') },
        { value: 'wechsel', label: L('3. Wechselwirkung: zwei Wagen stoßen sich ab', '3rd law: two carts push apart') },
        { value: 'kraft', label: L('Kräfte und Bewegung: Kiste schieben', 'Forces and motion: pushing a box') },
        { value: 'aufzug', label: L('Alltag: Waage im Aufzug', 'Everyday: scales in a lift') },
        { value: 'mess', label: L('Messreihe: a–F und a–1/m', 'Measurement series: a–F and a–1/m') },
        { value: 'ueben', label: L('Üben: Aufgaben zu Newton', 'Practice: Newton tasks') },
      ],
      default: 'grund',
      display: 'menu',
    },
    { key: 'gurt', type: 'boolean', label: L('Kiste festgeschnallt', 'Box strapped down'), default: false, visibleIf: (v) => v.mode === 'traeg' },
    { key: 'mub', type: 'number', label: L('Reibungszahl Kiste – Ladefläche', 'Friction coefficient box – platform'), min: 0, max: 0.8, step: 0.05, default: 0.3, visibleIf: (v) => v.mode === 'traeg' && !v.gurt },
    { key: 'mc', type: 'number', label: L('Masse des Wagens', 'Mass of the cart'), min: 0.2, max: 2, step: 0.1, default: 0.5, unit: 'kg', visibleIf: (v) => v.mode === 'grund' },
    { key: 'mh', type: 'number', label: L('Masse des Zuggewichts', 'Mass of the hanging weight'), min: 0.01, max: 0.5, step: 0.01, default: 0.1, unit: 'kg', visibleIf: (v) => v.mode === 'grund' },
    { key: 'mu', type: 'number', label: L('Reibungszahl der Bahn', 'Friction coefficient of the track'), min: 0, max: 0.3, step: 0.01, default: 0, visibleIf: (v) => v.mode === 'grund' },
    { key: 'm1', type: 'number', label: L('Masse Wagen links', 'Mass left cart'), min: 0.5, max: 4, step: 0.5, default: 1, unit: 'kg', visibleIf: (v) => v.mode === 'wechsel' },
    { key: 'm2', type: 'number', label: L('Masse Wagen rechts', 'Mass right cart'), min: 0.5, max: 4, step: 0.5, default: 2, unit: 'kg', visibleIf: (v) => v.mode === 'wechsel' },
    { key: 'F', type: 'number', label: L('Kraft der Feder', 'Spring force'), min: 5, max: 40, step: 1, default: 20, unit: 'N', visibleIf: (v) => v.mode === 'wechsel' },
    // Kräfte und Bewegung
    { key: 'fs', type: 'number', label: L('Schubkraft', 'Pushing force'), min: 0, max: 400, step: 5, default: 150, unit: 'N', visibleIf: (v) => v.mode === 'kraft' },
    { key: 'mk', type: 'number', label: L('Masse der Kiste', 'Mass of the box'), min: 5, max: 100, step: 5, default: 40, unit: 'kg', visibleIf: (v) => v.mode === 'kraft' },
    { key: 'muh', type: 'number', label: L('Haftreibungszahl μ_H', 'Static friction coefficient μ_s'), min: 0, max: 1, step: 0.05, default: 0.5, visibleIf: (v) => v.mode === 'kraft' },
    { key: 'mug', type: 'number', label: L('Gleitreibungszahl μ_G', 'Sliding friction coefficient μ_k'), min: 0, max: 1, step: 0.05, default: 0.3, visibleIf: (v) => v.mode === 'kraft' },
    { key: 'toff', type: 'number', label: L('Schieben bis', 'Push until'), min: 0.5, max: 8, step: 0.5, default: 3, unit: 's', visibleIf: (v) => v.mode === 'kraft' },
    // Aufzug
    { key: 'pm', type: 'number', label: L('Masse der Person', 'Mass of the person'), min: 20, max: 120, step: 5, default: 60, unit: 'kg', visibleIf: (v) => v.mode === 'aufzug' },
    {
      key: 'ldir',
      type: 'choice',
      label: L('Fahrtrichtung', 'Direction'),
      options: [
        { value: 'up', label: L('nach oben', 'up') },
        { value: 'down', label: L('nach unten', 'down') },
      ],
      default: 'up',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'aufzug' && !v.fall,
    },
    { key: 'la', type: 'number', label: L('Beschleunigung beim Anfahren und Bremsen', 'Acceleration when starting and braking'), min: 0.5, max: 3, step: 0.1, default: 1.5, unit: 'm/s²', visibleIf: (v) => v.mode === 'aufzug' && !v.fall },
    { key: 'fall', type: 'boolean', label: L('Gedankenexperiment: Seil reißt (freier Fall)', 'Thought experiment: the cable snaps (free fall)'), default: false, visibleIf: (v) => v.mode === 'aufzug' },
    // Messreihe
    {
      key: 'mr',
      type: 'choice',
      label: L('Messreihe', 'Series'),
      options: [
        { value: 'F', label: L('a in Abhängigkeit von F', 'a against F') },
        { value: 'm', label: L('a in Abhängigkeit von m', 'a against m') },
      ],
      default: 'F',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'mess',
    },
    { key: 'mf', type: 'number', label: L('Zugkraft F', 'Pulling force F'), min: 0.1, max: 2, step: 0.1, default: 0.5, unit: 'N', visibleIf: (v) => v.mode === 'mess' },
    { key: 'mw', type: 'number', label: L('Masse des Wagens m', 'Mass of the cart m'), min: 0.2, max: 2, step: 0.1, default: 0.5, unit: 'kg', visibleIf: (v) => v.mode === 'mess' },
    // Übung
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('eine Zahl', 'a number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'traeg'
      ? L('Der Wagen fährt und bremst dann scharf. Was macht die Kiste?', 'The truck drives and then brakes hard. What does the box do?')
      : v.mode === 'grund'
        ? L('Das Zuggewicht zieht den Wagen über die Rolle. Ohne Reibung gilt F = m · a.', 'The hanging weight pulls the cart over the pulley. Without friction F = m · a.')
        : v.mode === 'wechsel'
          ? L('Eine gespannte Feder drückt beide Wagen auseinander – mit gleich großen Kräften.', 'A compressed spring pushes both carts apart – with equal forces.')
          : v.mode === 'kraft'
            ? L('Erst wenn die Schubkraft größer ist als die Haftreibung, setzt sich die Kiste in Bewegung. Danach zählt die resultierende Kraft.', 'Only when the pushing force exceeds static friction does the box start to move. After that, the resultant force counts.')
            : v.mode === 'aufzug'
              ? L('Die Waage misst, wie stark sie gedrückt wird. Beim Anfahren und Bremsen zeigt sie mehr oder weniger als sonst.', 'The scales measure how hard they are pressed. When starting and braking they show more or less than usual.')
              : v.mode === 'mess'
                ? L('Stelle eine Größe ein, drücke „Messen“ und wiederhole mit anderen Werten. Die Punkte liegen auf einer Ursprungsgeraden.', 'Set a value, press “Measure” and repeat with other values. The points lie on a line through the origin.')
                : L('Rechne im Kopf oder auf Papier, gib die Zahl ein und drücke „Prüfen“. Komma oder Punkt sind beide in Ordnung.', 'Work it out in your head or on paper, enter the number and press “Check”. A comma or a point are both fine.'),
  actions: [
    { id: 'go', label: L('Start', 'Start'), primary: true, visibleIf: (v) => v.mode !== 'mess' && v.mode !== 'ueben' },
    { id: 'measure', label: L('Messen', 'Measure'), primary: true, visibleIf: (v) => v.mode === 'mess' },
    { id: 'clear', label: L('Messreihe löschen', 'Clear series'), visibleIf: (v) => v.mode === 'mess' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'a', label: L('Beschleunigung', 'Acceleration'), spoiler: true },
    { key: 'F', label: L('Kräfte', 'Forces'), spoiler: true },
    { key: 'v', label: L('Geschwindigkeit', 'Velocity'), spoiler: true },
    { key: 'now', label: L('Messung', 'Measurement') },
  ],
  presets: [
    { id: 'loose', label: L('Lose Kiste', 'Loose box'), values: { mode: 'traeg', gurt: false } },
    { id: 'belt', label: L('Festgeschnallt', 'Strapped down'), values: { mode: 'traeg', gurt: true } },
    { id: 'rubber', label: L('Gummimatte (μ = 0,8)', 'Rubber mat (μ = 0.8)'), values: { mode: 'traeg', gurt: false, mub: 0.8 } },
    { id: 'base', label: L('F = m · a', 'F = m · a'), values: { mode: 'grund', mc: 0.5, mh: 0.1, mu: 0 } },
    { id: 'double', label: L('Doppelte Wagenmasse', 'Double cart mass'), values: { mode: 'grund', mc: 1, mh: 0.1, mu: 0 } },
    { id: 'fric', label: L('Mit Reibung', 'With friction'), values: { mode: 'grund', mu: 0.1 } },
    { id: 'push', label: L('Abstoßen 1 kg / 2 kg', 'Push-off 1 kg / 2 kg'), values: { mode: 'wechsel', m1: 1, m2: 2 } },
    { id: 'pusheq', label: L('Abstoßen gleich schwer', 'Push-off equal masses'), values: { mode: 'wechsel', m1: 2, m2: 2 } },
    { id: 'stick', label: L('Zu schwach: Haftreibung hält', 'Too weak: static friction holds'), values: { mode: 'kraft', fs: 150, mk: 40, muh: 0.5, mug: 0.3, toff: 3 } },
    { id: 'slide', label: L('Kiste rutscht an', 'Box starts to slide'), values: { mode: 'kraft', fs: 250, mk: 40, muh: 0.5, mug: 0.3, toff: 3 } },
    { id: 'ice', label: L('Auf Eis: ohne Reibung weiter', 'On ice: keeps going without friction'), values: { mode: 'kraft', fs: 40, mk: 40, muh: 0, mug: 0, toff: 2 } },
    { id: 'even', label: L('Gleichförmig: Kräfte im Gleichgewicht', 'Constant speed: forces balanced'), values: { mode: 'kraft', fs: 120, mk: 40, muh: 0.3, mug: 0.3, toff: 8 } },
    { id: 'liftup', label: L('Aufzug nach oben', 'Lift going up'), values: { mode: 'aufzug', pm: 60, ldir: 'up', la: 1.5, fall: false } },
    { id: 'liftdown', label: L('Aufzug nach unten', 'Lift going down'), values: { mode: 'aufzug', pm: 60, ldir: 'down', la: 1.5, fall: false } },
    { id: 'liftfall', label: L('Seil reißt: schwerelos', 'Cable snaps: weightless'), values: { mode: 'aufzug', pm: 60, fall: true } },
    { id: 'messF', label: L('Messreihe a ~ F', 'Series a ∝ F'), values: { mode: 'mess', mr: 'F', mf: 0.5, mw: 0.5 } },
    { id: 'messm', label: L('Messreihe a ~ 1/m', 'Series a ∝ 1/m'), values: { mode: 'mess', mr: 'm', mf: 0.5, mw: 0.5 } },
    { id: 'quiz', label: L('Üben: neun Aufgaben', 'Practice: nine tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvas: 'Versuche zu den Newton’schen Gesetzen: Fahrbahn mit Wagen, Lastwagen mit Kiste, Kiste mit Kraftpfeilen, Aufzug mit Personenwaage oder Messreihe; darunter ein Diagramm',
      canvasQuiz: 'Übungsaufgabe zu den Newton’schen Gesetzen mit Rückmeldung',
      t: 't in s',
      v: 'v in m/s',
      cart: 'Wagen',
      box: 'Kiste',
      start: 'Start',
      again: 'Noch einmal',
      aGrund: 'a = (m_Z · g − μ · m_W · g) / (m_W + m_Z) ≈ {a} m/s²',
      aZero: 'Die Zugkraft reicht nicht gegen die Reibung: Der Wagen bleibt stehen.',
      FGrund: 'Zugkraft F = m_Z · g ≈ {F} N, Seilkraft ≈ {S} N',
      aTraeg: 'Wagen bremst mit {b} m/s², die Kiste {how}',
      boxBelt: 'wird vom Gurt mitgebremst',
      boxLoose: 'nur mit μ · g ≈ {d} m/s² – sie rutscht nach vorn',
      boxSame: 'wird durch Reibung voll mitgebremst',
      FWechsel: 'Beide Wagen erfahren {F} N, aber in entgegengesetzte Richtungen.',
      vWechsel: 'v₁ ≈ {v1} m/s, v₂ ≈ {v2} m/s; m₁ · v₁ + m₂ · v₂ = 0',
      nowGrund: 't ≈ {t} s, s ≈ {s} m, v ≈ {v} m/s',
      nowTraeg: 't ≈ {t} s, Wagen {vc} m/s, Kiste {vb} m/s',
      nowWechsel: 't ≈ {t} s',
      hit: 'Die Kiste prallt gegen die Stirnwand!',
      // Kräfte und Bewegung
      kF: 'F_Schub = {F} N, F_Reib = {R} N, F_res = {res} N',
      kA: 'a = F_res : m ≈ {a} m/s²',
      kV: 'v ≈ {v} m/s, Weg ≈ {s} m',
      kHold: 'Haftreibung hält dagegen (höchstens {max} N): Die Kiste bleibt stehen.',
      kStart: 'Die Schubkraft ist größer als die Haftreibung ({max} N): Die Kiste rutscht los.',
      kStateRest: 'ruht: F_res = 0',
      kStateAcc: 'wird schneller: F_res in Bewegungsrichtung',
      kStateDec: 'wird langsamer: nur noch die Reibung wirkt',
      kStateEven: 'gleichförmig: F_res = 0',
      kStateFree: 'ohne Reibung und ohne Schub: fährt gleichförmig weiter',
      push: 'Schub',
      fric: 'Reibung',
      weight: 'Gewicht',
      normal: 'Normalkraft',
      res: 'resultierend',
      off: 'Schub endet',
      // Aufzug
      lA: 'a = {a} m/s² ({phase})',
      lF: 'F_N = m · (g + a) ≈ {F} N, Gewichtskraft {W} N',
      lV: 'v ≈ {v} m/s',
      lNow: 'Waage zeigt {r} kg (in Ruhe {m} kg)',
      phRest: 'steht',
      phAccUp: 'beschleunigt nach oben',
      phAccDown: 'beschleunigt nach unten',
      phEven: 'fährt gleichförmig',
      phFall: 'freier Fall',
      lift: 'Aufzug',
      reading: 'Anzeige in kg',
      restLine: 'in Ruhe',
      weightless: 'schwerelos',
      // Messreihe
      mA: 'Ausgleichsgerade: a = {k} · {x}',
      mAF: 'Steigung {k} 1/kg ≈ 1 : m (m = {m} kg)',
      mAm: 'Steigung {k} N ≈ F (F = {F} N)',
      mNow: '{n} Messungen; letzte: t = {t} s für {s} m → a = 2s : t² ≈ {a} m/s²',
      mEmpty: 'Noch keine Messung – drücke „Messen“.',
      mHintF: 'Masse fest ({m} kg) – ändere F zwischen den Messungen.',
      mHintm: 'Kraft fest ({F} N) – ändere m zwischen den Messungen.',
      mReset: 'Die feste Größe wurde geändert: neue Messreihe.',
      gate: 'Lichtschranke',
      xF: 'F in N',
      xm: '1/m in 1/kg',
      ya: 'a in m/s²',
      tab: 'Messwerte',
      // Übung
      qTitle: 'Aufgabe {n}',
      qHow: 'Gib deine Antwort ein und drücke „Prüfen“.',
      qOk: 'Richtig!',
      qNo: 'Noch nicht – versuche es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig · Serie {s}',
      qYour: 'Deine Antwort: {a}',
      qBad: 'Bitte eine Zahl eingeben.',
    },
    en: {
      canvas: 'Experiments on Newton’s laws: track with cart, truck with a box, box with force arrows, lift with scales or a measurement series; below a graph',
      canvasQuiz: 'Practice task on Newton’s laws with feedback',
      t: 't in s',
      v: 'v in m/s',
      cart: 'cart',
      box: 'box',
      start: 'Start',
      again: 'Again',
      aGrund: 'a = (m_h · g − μ · m_c · g) / (m_c + m_h) ≈ {a} m/s²',
      aZero: 'The pulling force cannot overcome friction: the cart stays put.',
      FGrund: 'pulling force F = m_h · g ≈ {F} N, rope tension ≈ {S} N',
      aTraeg: 'the truck brakes at {b} m/s², the box {how}',
      boxBelt: 'is braked along by the strap',
      boxLoose: 'only at μ · g ≈ {d} m/s² – it slides forward',
      boxSame: 'is fully braked by friction',
      FWechsel: 'Both carts feel {F} N, but in opposite directions.',
      vWechsel: 'v₁ ≈ {v1} m/s, v₂ ≈ {v2} m/s; m₁ · v₁ + m₂ · v₂ = 0',
      nowGrund: 't ≈ {t} s, s ≈ {s} m, v ≈ {v} m/s',
      nowTraeg: 't ≈ {t} s, truck {vc} m/s, box {vb} m/s',
      nowWechsel: 't ≈ {t} s',
      hit: 'The box crashes into the front wall!',
      kF: 'F_push = {F} N, F_fric = {R} N, F_res = {res} N',
      kA: 'a = F_res / m ≈ {a} m/s²',
      kV: 'v ≈ {v} m/s, distance ≈ {s} m',
      kHold: 'Static friction holds against it (at most {max} N): the box stays put.',
      kStart: 'The pushing force exceeds static friction ({max} N): the box starts to slide.',
      kStateRest: 'at rest: F_res = 0',
      kStateAcc: 'speeding up: F_res points along the motion',
      kStateDec: 'slowing down: only friction acts',
      kStateEven: 'constant speed: F_res = 0',
      kStateFree: 'no friction and no push: keeps moving at constant speed',
      push: 'push',
      fric: 'friction',
      weight: 'weight',
      normal: 'normal force',
      res: 'resultant',
      off: 'push ends',
      lA: 'a = {a} m/s² ({phase})',
      lF: 'F_N = m · (g + a) ≈ {F} N, weight {W} N',
      lV: 'v ≈ {v} m/s',
      lNow: 'scales show {r} kg (at rest {m} kg)',
      phRest: 'at rest',
      phAccUp: 'accelerating upwards',
      phAccDown: 'accelerating downwards',
      phEven: 'moving at constant speed',
      phFall: 'free fall',
      lift: 'lift',
      reading: 'reading in kg',
      restLine: 'at rest',
      weightless: 'weightless',
      mA: 'best-fit line: a = {k} · {x}',
      mAF: 'slope {k} 1/kg ≈ 1 / m (m = {m} kg)',
      mAm: 'slope {k} N ≈ F (F = {F} N)',
      mNow: '{n} measurements; last: t = {t} s for {s} m → a = 2s / t² ≈ {a} m/s²',
      mEmpty: 'No measurement yet – press “Measure”.',
      mHintF: 'Mass fixed ({m} kg) – change F between measurements.',
      mHintm: 'Force fixed ({F} N) – change m between measurements.',
      mReset: 'The fixed quantity was changed: new series.',
      gate: 'light gate',
      xF: 'F in N',
      xm: '1/m in 1/kg',
      ya: 'a in m/s²',
      tab: 'measurements',
      qTitle: 'Task {n}',
      qHow: 'Enter your answer and press “Check”.',
      qOk: 'Correct!',
      qNo: 'Not yet – try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct · streak {s}',
      qYour: 'Your answer: {a}',
      qBad: 'Please enter a number.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const N = (x: number, d = 2) => fmt.num(Math.abs(x) < 1e-9 ? 0 : x, d);
    const plot = new Plot(surface, {
      x: [0, 2],
      y: [0, 2],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    /** Zustand der Bewegung (Weltkoordinaten in m, m/s). */
    let t = 0;
    let running = false;
    let xc = 0;
    let vc = 0;
    let xb = 0;
    let vb = 0;
    let hit = false;
    let hist: [number, number, number][] = [];

    /* ---------- Messreihe ---------- */
    let points: { x: number; a: number; t: number }[] = [];
    let seriesKey = '';
    let seriesReset = false;
    let noiseSeed = 1;
    const noise = () => {
      noiseSeed = (noiseSeed * 16807) % 2147483647;
      return (noiseSeed / 2147483647 - 0.5) * 2;
    };

    /* ---------- Übung ---------- */
    let task: NewtonTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };

    const accel = () => pulleyAcceleration(p.mc, p.mh, p.mu);
    const liftDir = (): 1 | -1 => (p.ldir === 'down' ? -1 : 1);
    const tEnd = () => {
      const m = mode();
      if (m === 'grund') {
        const a = accel();
        return a > 0 ? Math.sqrt((2 * TRACK) / a) : 1;
      }
      if (m === 'traeg') return T_BRAKE + V0 / BRAKE + 1.2;
      if (m === 'kraft') return KRAFT_T;
      if (m === 'aufzug') return liftEnd();
      return 2.5;
    };

    function reset(): void {
      t = 0;
      running = false;
      hit = false;
      hist = [];
      xc = 0;
      vc = 0;
      xb = 0;
      vb = 0;
      if (mode() === 'traeg') {
        vc = V0;
        vb = V0;
      }
      hist.push([0, mode() === 'aufzug' ? scaleReading(p.pm, 0) : vc, vb]);
    }

    function setupPlot(): void {
      const m = mode();
      const pad = { left: 46, right: 14, top: 22, bottom: 24 };
      if (m === 'grund') {
        const a = accel();
        const vmax = Math.max(0.5, Math.sqrt(2 * Math.max(a, 0.01) * TRACK));
        plot.setRangePadded([0, Math.max(1, tEnd())], [0, vmax * 1.15], pad);
      } else if (m === 'traeg') plot.setRangePadded([0, tEnd()], [0, V0 * 1.15], pad);
      else if (m === 'wechsel') {
        const r = pushOff(p.m1, p.m2, p.F, PUSH);
        const mm = Math.max(Math.abs(r.v1), Math.abs(r.v2)) * 1.2;
        plot.setRangePadded([0, tEnd()], [-mm, mm], pad);
      } else if (m === 'kraft') {
        const vmax = Math.max(1, kraftVmax() * 1.15);
        plot.setRangePadded([0, KRAFT_T], [0, vmax], pad);
      } else if (m === 'aufzug') {
        const hi = p.pm * (1 + (p.fall ? 0 : p.la) / G) * 1.12;
        const lo = p.fall ? 0 : p.pm * (1 - p.la / G) * 0.8;
        plot.setRangePadded([0, liftDuration()], [lo, Math.max(hi, p.pm * 1.2)], pad);
      } else if (m === 'mess') {
        const xs = p.mr === 'F' ? [2] : [1 / 0.2];
        const aMax = p.mr === 'F' ? 2 / p.mw : p.mf / 0.2;
        plot.setRangePadded([0, xs[0]! * 1.05], [0, aMax * 1.12], pad);
      }
      if (m === 'aufzug') plot.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('reading') } });
      else if (m === 'mess') plot.setAxes({ x: { label: ctx.t(p.mr === 'F' ? 'xF' : 'xm') }, y: { label: ctx.t('ya') } });
      else plot.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('v') } });
    }

    /** Höchstgeschwindigkeit der Kiste im Kraft-Versuch (für die Achse), vorab durchgerechnet. */
    function kraftVmax(): number {
      let s = { x: 0, v: 0 };
      let vm = 0;
      for (let tt = 0; tt < KRAFT_T; tt += 0.01) {
        s = stepBox(s, tt < p.toff ? p.fs : 0, p.mk, p.muh, p.mug, 0.01);
        vm = Math.max(vm, s.v);
      }
      return vm;
    }

    function step(dt: number): void {
      const m = mode();
      if (m === 'grund') {
        const a = accel();
        vc += a * dt;
        xc += vc * dt;
        if (xc >= TRACK) {
          xc = TRACK;
          running = false;
        }
      } else if (m === 'traeg') {
        const braking = t >= T_BRAKE && vc > 0;
        const ac = braking ? -BRAKE : 0;
        vc = Math.max(0, vc + ac * dt);
        xc += vc * dt;
        if (p.gurt) {
          vb = vc;
          xb = xc;
        } else if (hit) {
          vb = vc;
          xb = xc + GAP;
        } else {
          const db = braking || vb > vc ? boxDeceleration(BRAKE, p.mub) : 0;
          const target = vb - db * dt;
          vb = vb > vc ? Math.max(vc, target) : vc;
          xb += vb * dt;
          if (xb - xc >= GAP) {
            xb = xc + GAP;
            vb = vc;
            hit = true;
          }
        }
        if (vc === 0 && vb === 0 && t > T_BRAKE + 0.3) running = false;
      } else if (m === 'wechsel') {
        const pushing = t < PUSH;
        vc += (pushing ? -p.F / p.m1 : 0) * dt;
        vb += (pushing ? p.F / p.m2 : 0) * dt;
        xc += vc * dt;
        xb += vb * dt;
        if (t > tEnd()) running = false;
      } else if (m === 'kraft') {
        const s = stepBox({ x: xc, v: vc }, t < p.toff ? p.fs : 0, p.mk, p.muh, p.mug, dt);
        xc = s.x;
        vc = s.v;
        if (t > KRAFT_T) running = false;
      } else if (m === 'aufzug') {
        const a = liftAcceleration(t, liftDir(), p.la, p.fall);
        vc += a * dt;
        xc += vc * dt;
        if (t > liftEnd()) running = false;
      }
      t += dt;
    }

    function histValue(): number {
      if (mode() === 'aufzug') return scaleReading(p.pm, liftAcceleration(t, liftDir(), p.la, p.fall));
      return vc;
    }

    /* ---------- Ergebnisse ---------- */
    function liftPhase(a: number): string {
      if (p.fall && t >= LIFT_PHASES.start + LIFT_PHASES.accel && t < LIFT_PHASES.start + LIFT_PHASES.accel + LIFT_PHASES.cruise) return ctx.t('phFall');
      if (Math.abs(a) > 1e-9) return ctx.t(a > 0 ? 'phAccUp' : 'phAccDown');
      return Math.abs(vc) > 1e-6 ? ctx.t('phEven') : ctx.t('phRest');
    }

    function kraftState(): string {
      const F = t < p.toff ? p.fs : 0;
      const r = pushedBox(F, p.mk, p.muh, p.mug, vc);
      if (vc < 1e-6 && r.sticking) return ctx.t('kStateRest');
      if (F === 0 && p.mug === 0) return ctx.t('kStateFree');
      if (Math.abs(r.a) < 1e-6) return ctx.t('kStateEven');
      return ctx.t(r.a > 0 ? 'kStateAcc' : 'kStateDec');
    }

    function updateReadouts(): void {
      for (const k of ['a', 'F', 'v', 'now']) ctx.readout(k, null);
      const m = mode();
      if (m === 'grund') {
        const a = accel();
        ctx.readout('a', a > 0 ? tr('aGrund', { a: N(a, 3) }) : ctx.t('aZero'));
        ctx.readout('F', tr('FGrund', { F: N(p.mh * G, 3), S: N(ropeForce(p.mh, a), 3) }));
        ctx.readout('now', tr('nowGrund', { t: N(t), s: N(xc), v: N(vc) }));
      } else if (m === 'traeg') {
        const d = boxDeceleration(BRAKE, p.mub);
        const how = p.gurt ? ctx.t('boxBelt') : d >= BRAKE ? ctx.t('boxSame') : tr('boxLoose', { d: N(d) });
        ctx.readout('a', tr('aTraeg', { b: N(BRAKE, 0), how }));
        ctx.readout('now', hit ? ctx.t('hit') : tr('nowTraeg', { t: N(t), vc: N(vc, 1), vb: N(vb, 1) }));
      } else if (m === 'wechsel') {
        const r = pushOff(p.m1, p.m2, p.F, PUSH);
        ctx.readout('F', tr('FWechsel', { F: N(p.F, 0) }));
        ctx.readout('v', tr('vWechsel', { v1: N(r.v1), v2: N(r.v2) }));
        ctx.readout('now', tr('nowWechsel', { t: N(t) }));
      } else if (m === 'kraft') {
        const F = t < p.toff ? p.fs : 0;
        const r = pushedBox(F, p.mk, p.muh, p.mug, vc);
        ctx.readout('F', tr('kF', { F: N(F, 0), R: N(Math.abs(r.friction), 0), res: N(F + r.friction, 0) }));
        ctx.readout('a', tr('kA', { a: N(r.a) }));
        ctx.readout('v', tr('kV', { v: N(vc), s: N(xc, 1) }));
        const max = p.muh * p.mk * G;
        ctx.readout('now', `${p.fs <= max ? tr('kHold', { max: N(max, 0) }) : tr('kStart', { max: N(max, 0) })} – ${kraftState()}`);
      } else if (m === 'aufzug') {
        const a = liftAcceleration(t, liftDir(), p.la, p.fall);
        ctx.readout('a', tr('lA', { a: N(a), phase: liftPhase(a) }));
        ctx.readout('F', tr('lF', { F: N(p.pm * (G + a), 0), W: N(p.pm * G, 0) }));
        ctx.readout('v', tr('lV', { v: N(vc) }));
        ctx.readout('now', tr('lNow', { r: N(scaleReading(p.pm, a), 1), m: N(p.pm, 0) }));
      } else if (m === 'mess') {
        if (points.length >= 2) {
          const k = slopeThroughOrigin(points.map((q) => [q.x, q.a] as const));
          ctx.readout('a', tr('mA', { k: N(k), x: p.mr === 'F' ? 'F' : '1/m' }));
          ctx.readout('F', p.mr === 'F' ? tr('mAF', { k: N(k), m: N(p.mw, 1) }) : tr('mAm', { k: N(k), F: N(p.mf, 1) }));
        }
        const last = points[points.length - 1];
        const hint = seriesReset ? ctx.t('mReset') : p.mr === 'F' ? tr('mHintF', { m: N(p.mw, 1) }) : tr('mHintm', { F: N(p.mf, 1) });
        ctx.readout('now', last ? `${tr('mNow', { n: points.length, t: N(last.t, 3), s: N(GATE, 0), a: N(last.a) })} · ${hint}` : `${ctx.t('mEmpty')} ${hint}`);
      } else {
        ctx.readout('now', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
      }
    }

    /* ---------- Zeichnen: Hilfen ---------- */
    function wheels(g: CanvasRenderingContext2D, x: number, y: number, w: number, r: number, color: string): void {
      g.fillStyle = color;
      for (const wx of [x + w * 0.2, x + w * 0.8]) {
        g.beginPath();
        g.arc(wx, y, r, 0, Math.PI * 2);
        g.fill();
      }
    }

    function arrow(g: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, color: string, label: string, labelPos: 'mid' | 'end' = 'mid'): void {
      const len = Math.hypot(dx, dy);
      if (len < 3) return;
      const th = ctx.theme;
      const ux = dx / len;
      const uy = dy / len;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + dx - ux * 10, y + dy - uy * 10);
      g.stroke();
      g.beginPath();
      g.moveTo(x + dx, y + dy);
      g.lineTo(x + dx - ux * 13 - uy * 7, y + dy - uy * 13 + ux * 7);
      g.lineTo(x + dx - ux * 13 + uy * 7, y + dy - uy * 13 - ux * 7);
      g.closePath();
      g.fill();
      if (!label) return;
      const lx = labelPos === 'mid' ? x + dx / 2 : x + dx + ux * 14;
      const ly = labelPos === 'mid' ? y + dy / 2 : y + dy + uy * 14;
      const off = labelPos === 'mid' ? (Math.abs(dx) > Math.abs(dy) ? [0, -14] : [10, 0]) : [0, 0];
      g.font = `700 12px ${th.font}`;
      g.textAlign = labelPos === 'mid' && Math.abs(dy) > Math.abs(dx) ? 'left' : 'center';
      g.textBaseline = 'middle';
      g.fillText(label, lx + off[0]!, ly + off[1]!);
    }

    function forceArrow(g: CanvasRenderingContext2D, x: number, y: number, len: number, color: string, label: string): void {
      arrow(g, x, y, len, 0, color, label);
    }

    function wrap(g: CanvasRenderingContext2D, s: string, maxW: number): string[] {
      const words = s.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function ground(g: CanvasRenderingContext2D, r: Rect, y: number, shift = 0): void {
      const th = ctx.theme;
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(r.x + 10, y);
      g.lineTo(r.x + r.w - 10, y);
      g.stroke();
      // Schraffur, die mit der Kamera wandert (zeigt die Bewegung)
      g.strokeStyle = withAlpha(th.muted, 0.5);
      g.lineWidth = 1.2;
      const step = 26;
      const off = ((shift % step) + step) % step;
      for (let x = r.x + 10 - off; x < r.x + r.w - 10; x += step) {
        if (x < r.x + 10) continue;
        g.beginPath();
        g.moveTo(x, y + 2);
        g.lineTo(x - 8, y + 10);
        g.stroke();
      }
    }

    /* ---------- Szenen ---------- */
    function drawTraeg(g: CanvasRenderingContext2D, r: Rect, gy: number, narrow: boolean): void {
      const th = ctx.theme;
      const total = V0 * T_BRAKE + (V0 * V0) / (2 * BRAKE) + 1.5;
      const sx = (r.w - 40 - 150) / total;
      const cw = Math.min(170, r.w * 0.38);
      const chh = Math.min(50, r.h * 0.2);
      const x = r.x + 20 + xc * sx;
      roundRect(g, x, gy - chh - 14, cw, chh * 0.35, 4);
      g.fillStyle = th.series[0]!;
      g.fill();
      roundRect(g, x + cw, gy - chh * 1.5 - 14, cw * 0.28, chh * 1.5, 6);
      g.fillStyle = th.series[0]!;
      g.fill();
      g.fillStyle = withAlpha(th.bg, 0.85);
      g.fillRect(x + cw + cw * 0.06, gy - chh * 1.35 - 14, cw * 0.16, chh * 0.45);
      wheels(g, x, gy - 9, cw * 1.28, 9, th.text);
      g.fillStyle = th.text;
      g.fillRect(x + cw - 6, gy - chh * 1.3 - 14, 6, chh * 1.3);
      const bw = cw * 0.3;
      const bx = x + 10 + (xb - xc) * ((cw - 16 - bw) / GAP);
      const by = gy - chh - 14 - bw * 0.8;
      roundRect(g, bx, by, bw, bw * 0.8, 4);
      g.fillStyle = th.series[3]!;
      g.fill();
      text(g, ctx.t('box'), bx + bw / 2, by + bw * 0.4, { font: `700 ${narrow ? 10 : 12}px ${th.font}`, color: '#ffffff' });
      if (p.gurt) {
        g.strokeStyle = th.text;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(bx - 4, gy - chh - 14);
        g.lineTo(bx + bw / 2, by);
        g.lineTo(bx + bw + 4, gy - chh - 14);
        g.stroke();
      }
    }

    function drawGrund(g: CanvasRenderingContext2D, r: Rect, gy: number): void {
      const th = ctx.theme;
      const px = r.x + r.w - 60;
      const x0 = r.x + 30;
      const cw = Math.min(110, r.w * 0.2);
      const sx = (px - 20 - cw - x0) / TRACK;
      const chh = Math.min(40, r.h * 0.18);
      const x = x0 + xc * sx;
      roundRect(g, x, gy - chh - 12, cw, chh, 6);
      g.fillStyle = th.series[0]!;
      g.fill();
      text(g, `${N(p.mc, 1)} kg`, x + cw / 2, gy - chh / 2 - 12, { font: `700 13px ${th.font}`, color: '#ffffff' });
      wheels(g, x, gy - 7, cw, 7, th.text);
      const ry = gy - chh / 2 - 12;
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(px, ry + 10, 10, 0, Math.PI * 2);
      g.stroke();
      g.fillStyle = th.text;
      g.fillRect(px - 2, ry + 10, 4, gy - ry - 10);
      const drop = 30 + xc * sx * 0.6;
      const hy = ry + 10 + Math.min(drop, r.y + r.h - ry - 40);
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x + cw, ry);
      g.lineTo(px, ry);
      g.moveTo(px + 10, ry + 10);
      g.lineTo(px + 10, hy);
      g.stroke();
      const hs = 16 + 40 * Math.sqrt(p.mh / 0.5);
      roundRect(g, px + 10 - hs / 2, hy, hs, hs * 0.8, 4);
      g.fillStyle = th.series[3]!;
      g.fill();
      text(g, `${N(p.mh * 1000, 0)} g`, px + 10, hy + hs * 0.4, { font: `700 11px ${th.font}`, color: '#ffffff' });
      forceArrow(g, x + cw / 2, gy - chh - 30, 30 + 120 * (p.mh / 0.5), th.series[1]!, 'F');
    }

    function drawWechsel(g: CanvasRenderingContext2D, r: Rect, gy: number): void {
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cw = Math.min(90, r.w * 0.18);
      const pv = pushOff(p.m1, p.m2, p.F, PUSH);
      const maxDist = Math.max(Math.abs(pv.v1), Math.abs(pv.v2)) * tEnd();
      const sx = Math.min(120, (r.w / 2 - cw * 1.3 - 16) / maxDist);
      const chh = Math.min(40, r.h * 0.18);
      const size = (m: number) => 0.7 + 0.15 * m;
      const x1 = cx - 6 + xc * sx - cw * size(p.m1);
      const x2 = cx + 6 + xb * sx;
      roundRect(g, x1, gy - chh * size(p.m1) - 12, cw * size(p.m1), chh * size(p.m1), 6);
      g.fillStyle = th.series[0]!;
      g.fill();
      text(g, `${N(p.m1, 1)} kg`, x1 + (cw * size(p.m1)) / 2, gy - (chh * size(p.m1)) / 2 - 12, { font: `700 12px ${th.font}`, color: '#ffffff' });
      wheels(g, x1, gy - 7, cw * size(p.m1), 7, th.text);
      roundRect(g, x2, gy - chh * size(p.m2) - 12, cw * size(p.m2), chh * size(p.m2), 6);
      g.fillStyle = th.series[2]!;
      g.fill();
      text(g, `${N(p.m2, 1)} kg`, x2 + (cw * size(p.m2)) / 2, gy - (chh * size(p.m2)) / 2 - 12, { font: `700 12px ${th.font}`, color: '#ffffff' });
      wheels(g, x2, gy - 7, cw * size(p.m2), 7, th.text);
      if (t < PUSH) {
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        const sx0 = x1 + cw * size(p.m1);
        const yy = gy - 30;
        g.moveTo(sx0, yy);
        for (let k = 1; k <= 6; k++) g.lineTo(sx0 + ((x2 - sx0) * k) / 6, yy + (k % 2 ? -6 : 6));
        g.stroke();
        const len = 20 + 3 * p.F;
        forceArrow(g, x1 + (cw * size(p.m1)) / 2, gy - chh * 1.6 - 20, -len, th.series[1]!, 'F₁');
        forceArrow(g, x2 + (cw * size(p.m2)) / 2, gy - chh * 1.6 - 20, len, th.series[1]!, 'F₂');
      }
    }

    function drawKraft(g: CanvasRenderingContext2D, r: Rect, gy: number, narrow: boolean): void {
      const th = ctx.theme;
      // Kamera folgt der Kiste, sobald sie aus dem linken Drittel fährt
      const ppm = narrow ? 30 : 46;
      const homeX = r.x + r.w * (narrow ? 0.34 : 0.3);
      const camera = Math.max(0, xc * ppm - r.w * 0.15);
      ground(g, r, gy, camera);
      const side = Math.min(narrow ? 70 : 96, 46 + 50 * Math.cbrt(p.mk / 100));
      const bx = homeX + xc * ppm - camera - side / 2;
      const by = gy - side;
      roundRect(g, bx, by, side, side, 6);
      g.fillStyle = th.series[3]!;
      g.fill();
      text(g, `${N(p.mk, 0)} kg`, bx + side / 2, by + side / 2, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: '#ffffff' });
      const F = t < p.toff ? p.fs : 0;
      const res = pushedBox(F, p.mk, p.muh, p.mug, vc);
      const W = p.mk * G;
      // Maßstab der waagerechten Pfeile: größte Kraft passt links neben die Kiste
      const big = Math.max(p.fs, p.muh * W, 1);
      const k = Math.min(1.2, (Math.max(40, bx - r.x - 20)) / big);
      const cy = by + side * 0.45;
      if (F > 0) arrow(g, bx - F * k - 4, cy, F * k, 0, th.series[1]!, narrow ? `${N(F, 0)} N` : `${ctx.t('push')} ${N(F, 0)} N`);
      if (Math.abs(res.friction) > 0.5) {
        const fx = bx + side / 2;
        arrow(g, fx, gy - 5, res.friction * k, 0, th.series[0]!, '');
        text(g, `${ctx.t('fric')} ${N(Math.abs(res.friction), 0)} N`, fx + (res.friction * k) / 2, gy + 20, { font: `700 12px ${th.font}`, color: th.series[0]! });
      }
      // resultierende Kraft über der Kiste
      const Fres = F + res.friction;
      const ry = by - 22;
      const cx = bx + side / 2;
      if (Math.abs(Fres) > 0.5) arrow(g, cx, ry, Fres * k, 0, th.series[2]!, `F_res = ${N(Fres, 0)} N`);
      else text(g, 'F_res = 0', cx, ry, { font: `700 13px ${th.font}`, color: th.series[2]! });
      // Kräfteplan oben rechts: alle vier Kräfte an einem Punkt
      const pr = Math.min(narrow ? 46 : 62, r.h * 0.26);
      const px = r.x + r.w - pr - (narrow ? 14 : 30);
      const py = r.y + pr + 34;
      g.fillStyle = withAlpha(th.text, th.dark ? 0.06 : 0.04);
      roundRect(g, px - pr - 12, py - pr - 26, 2 * pr + 24, 2 * pr + 40, 10);
      g.fill();
      text(g, narrow ? '' : (ctx.lang === 'de' ? 'Kräfteplan' : 'Free-body diagram'), px, py - pr - 14, { font: `600 11px ${th.font}`, color: th.muted });
      const kk = pr / Math.max(W, p.fs, 1);
      arrow(g, px, py, 0, W * kk, withAlpha(th.muted, 0.95), '');
      arrow(g, px, py, 0, -W * kk, withAlpha(th.muted, 0.95), '');
      if (F > 0) arrow(g, px, py, F * kk, 0, th.series[1]!, '');
      if (Math.abs(res.friction) > 0.5) arrow(g, px, py, res.friction * kk, 0, th.series[0]!, '');
      g.fillStyle = th.text;
      g.beginPath();
      g.arc(px, py, 4, 0, Math.PI * 2);
      g.fill();
      text(g, 'F_N', px + 16, py - W * kk + 8, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, 'F_G', px + 16, py + W * kk - 8, { font: `600 11px ${th.font}`, color: th.muted });
      // Zustand
      if (narrow) text(g, kraftState(), r.x + r.w / 2, Math.min(r.y + r.h - 10, gy + 42), { font: `600 12px ${th.font}`, color: th.text });
      else text(g, kraftState(), r.x + r.w * 0.38, r.y + 18, { font: `600 14px ${th.font}`, color: th.text });
    }

    function drawAufzug(g: CanvasRenderingContext2D, r: Rect, narrow: boolean): void {
      const th = ctx.theme;
      const a = liftAcceleration(t, liftDir(), p.la, p.fall);
      const reading = scaleReading(p.pm, a);
      // Schacht links, Anzeige rechts
      const shaftW = Math.min(150, r.w * 0.34);
      const sx = r.x + (narrow ? 14 : r.w * 0.12);
      const top = r.y + 12;
      const bottom = r.y + r.h - 12;
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 2;
      g.strokeRect(sx, top, shaftW, bottom - top);
      // Stockwerke
      for (let k = 1; k < 4; k++) {
        const y = top + ((bottom - top) * k) / 4;
        g.beginPath();
        g.moveTo(sx, y);
        g.lineTo(sx + 10, y);
        g.moveTo(sx + shaftW - 10, y);
        g.lineTo(sx + shaftW, y);
        g.stroke();
      }
      // Kabine zwischen tiefstem und höchstem Punkt der ganzen Fahrt
      const [lo, hi] = liftRange();
      const cabH = Math.min(120, (bottom - top) * 0.55);
      const free = bottom - top - cabH - 8;
      const frac = hi - lo > 1e-6 ? Math.max(0, Math.min(1, (xc - lo) / (hi - lo))) : 0;
      const cabY = bottom - 4 - cabH - frac * free;
      // Seil
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      if (!(p.fall && t >= LIFT_PHASES.start + LIFT_PHASES.accel)) {
        g.beginPath();
        g.moveTo(sx + shaftW / 2, top);
        g.lineTo(sx + shaftW / 2, cabY);
        g.stroke();
      }
      roundRect(g, sx + 8, cabY, shaftW - 16, cabH, 6);
      g.fillStyle = withAlpha(th.series[0]!, 0.15);
      g.fill();
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 2;
      g.stroke();
      // Person auf der Waage
      const px = sx + shaftW / 2;
      const floor = cabY + cabH - 6;
      g.fillStyle = th.muted;
      g.fillRect(px - 22, floor - 6, 44, 6);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.lineCap = 'round';
      const h = cabH * 0.62;
      g.beginPath();
      g.arc(px, floor - 6 - h + 8, 8, 0, Math.PI * 2);
      g.moveTo(px, floor - 6 - h + 16);
      g.lineTo(px, floor - 6 - h * 0.42);
      g.lineTo(px - 9, floor - 6);
      g.moveTo(px, floor - 6 - h * 0.42);
      g.lineTo(px + 9, floor - 6);
      g.moveTo(px - 12, floor - 6 - h * 0.72);
      g.lineTo(px, floor - 6 - h * 0.8);
      g.lineTo(px + 12, floor - 6 - h * 0.72);
      g.stroke();
      // Kräfte an der Person (rechts daneben)
      const k = (cabH * 0.38) / (p.pm * G * (1 + 3 / G));
      const ax = sx + shaftW + 18;
      const W = p.pm * G;
      const FN = p.pm * (G + a);
      arrow(g, ax, floor - h * 0.5, 0, W * k, withAlpha(th.muted, 0.95), narrow ? 'F_G' : `F_G ${N(W, 0)} N`);
      if (FN > 1) arrow(g, ax + 28, floor - h * 0.5, 0, -FN * k, th.series[1]!, narrow ? 'F_N' : `F_N ${N(FN, 0)} N`);
      // Große Anzeige
      const dx = r.x + r.w * (narrow ? 0.72 : 0.68);
      const dw = Math.min(200, r.w * (narrow ? 0.48 : 0.36));
      const dh = Math.min(84, r.h * 0.34);
      const dy = r.y + r.h * 0.22;
      roundRect(g, dx - dw / 2, dy, dw, dh, 10);
      g.fillStyle = th.dark ? withAlpha(th.text, 0.08) : withAlpha(th.text, 0.06);
      g.fill();
      g.strokeStyle = withAlpha(th.text, 0.25);
      g.lineWidth = 1.5;
      g.stroke();
      const col = Math.abs(reading - p.pm) < 0.05 ? th.text : reading > p.pm ? th.series[1]! : th.series[2]!;
      text(g, `${N(reading, 1)} kg`, dx, dy + dh * 0.5, { font: `800 ${Math.round(dh * 0.42)}px ${th.font}`, color: col });
      text(g, reading < 0.05 ? ctx.t('weightless') : liftPhase(a), dx, dy + dh + 18, { font: `600 ${narrow ? 12 : 14}px ${th.font}`, color: th.muted });
      text(g, `a = ${N(a)} m/s²`, dx, dy + dh + 38, { font: `600 ${narrow ? 12 : 13}px ${th.font}`, color: th.muted });
    }

    /** Tiefster und höchster Punkt der Kabine während der ganzen Fahrt (m). */
    function liftRange(): [number, number] {
      let x = 0;
      let v = 0;
      let lo = 0;
      let hi = 0;
      for (let tt = 0; tt < liftEnd(); tt += 0.01) {
        v += liftAcceleration(tt, liftDir(), p.la, p.fall) * 0.01;
        x += v * 0.01;
        lo = Math.min(lo, x);
        hi = Math.max(hi, x);
      }
      return [lo, hi];
    }

    /** Ende der Fahrt; beim Seilriss endet der Versuch mit dem freien Fall. */
    function liftEnd(): number {
      const P = LIFT_PHASES;
      return p.fall ? P.start + P.accel + P.cruise : liftDuration();
    }

    function drawMess(g: CanvasRenderingContext2D, r: Rect, gy: number, narrow: boolean): void {
      const th = ctx.theme;
      ground(g, r, gy);
      const x0 = r.x + 24;
      const len = narrow ? r.w * 0.6 : r.w * 0.46;
      const g1 = x0 + len * 0.18;
      const g2 = x0 + len * 0.92;
      for (const [gx, lab] of [
        [g1, '1'],
        [g2, '2'],
      ] as const) {
        g.strokeStyle = th.series[1]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(gx, gy - 70);
        g.lineTo(gx, gy - 4);
        g.stroke();
        g.fillStyle = withAlpha(th.series[1]!, 0.25);
        g.fillRect(gx - 1, gy - 60, 2, 40);
        text(g, narrow ? lab : `${ctx.t('gate')} ${lab}`, gx, gy + 20, { font: `600 11px ${th.font}`, color: th.series[1]! });
      }
      const cw = Math.min(80, len * 0.2);
      const ch = 26 + 20 * Math.sqrt(p.mw / 2);
      const last = points[points.length - 1];
      const cx = last ? g2 + 4 : g1 - cw - 6;
      roundRect(g, cx, gy - ch - 12, cw, ch, 6);
      g.fillStyle = th.series[0]!;
      g.fill();
      text(g, `${N(p.mw, 1)} kg`, cx + cw / 2, gy - ch / 2 - 12, { font: `700 12px ${th.font}`, color: '#ffffff' });
      wheels(g, cx, gy - 7, cw, 7, th.text);
      text(g, `s = ${N(GATE, 0)} m`, (g1 + g2) / 2, gy + 20, { font: `600 12px ${th.font}`, color: th.muted });
      arrow(g, cx + cw / 2, gy - ch - 26, 20 + 50 * (p.mf / 2), 0, th.series[3]!, `F = ${N(p.mf, 1)} N`);
      // Tabelle
      const tx = narrow ? r.x + 12 : x0 + len + 30;
      const align: CanvasTextAlign = 'left';
      g.textAlign = align;
      g.textBaseline = 'top';
      g.font = `700 13px ${th.font}`;
      g.fillStyle = th.text;
      g.fillText(ctx.t('tab'), tx, r.y + 12);
      g.font = `500 ${narrow ? 11 : 12}px ${th.font}`;
      g.fillStyle = th.muted;
      const head = p.mr === 'F' ? 'F in N · t in s · a in m/s²' : 'm in kg · t in s · a in m/s²';
      g.fillText(head, tx, r.y + 30);
      g.fillStyle = th.text;
      const rows = points.slice(narrow ? -2 : -6);
      rows.forEach((q, i) => {
        const xv = p.mr === 'F' ? q.x : 1 / q.x;
        g.fillText(`${N(xv, p.mr === 'F' ? 1 : 2)}   ${N(q.t, 3)}   ${N(q.a, 2)}`, tx, r.y + 48 + i * 17);
      });
    }

    function drawQuiz(g: CanvasRenderingContext2D, W: number, H: number): void {
      const th = ctx.theme;
      const narrow = W < 600;
      const pad = narrow ? 18 : 36;
      const maxW = W - 2 * pad;
      let y = pad;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.series[0]!;
      g.fillText(tr('qTitle', { n: p.qn }), pad, y);
      y += narrow ? 26 : 32;
      const fs = narrow ? 16 : 21;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 12;
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: `${ans}${task.unit ? ` ${task.unit}` : ''}` }) : ctx.t('qHow'), pad, y);
      y += 30;
      if (badInput) {
        g.fillStyle = th.series[3]!;
        g.fillText(ctx.t('qBad'), pad, y);
        y += 26;
      }
      if (verdict !== null) {
        g.font = `800 ${narrow ? 20 : 26}px ${th.font}`;
        g.fillStyle = verdict ? th.series[2]! : th.series[3]!;
        g.fillText(ctx.t(verdict ? 'qOk' : 'qNo'), pad, y);
        y += narrow ? 32 : 40;
        if (verdict || tries >= 2) {
          g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          g.fillText(`${ctx.t('qSol')}:`, pad, y);
          y += 22;
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          for (const line of wrap(g, task.solution[ctx.lang], maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      // Fortschritt: zehn Punkte
      const n = Math.min(10, score.all);
      const dots = 10;
      const gap = 20;
      const sx = W / 2 - ((dots - 1) * gap) / 2;
      for (let i = 0; i < dots; i++) {
        g.beginPath();
        g.arc(sx + i * gap, H - 24, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const narrow = surface.width < 700;
      const gy = r.y + r.h * 0.72;
      const m = mode();
      if (m === 'kraft') return drawKraft(g, r, gy, narrow);
      if (m === 'aufzug') return drawAufzug(g, r, narrow);
      if (m === 'mess') return drawMess(g, r, r.y + r.h * 0.78, narrow);
      ground(g, r, gy);
      if (m === 'traeg') drawTraeg(g, r, gy, narrow);
      else if (m === 'grund') drawGrund(g, r, gy);
      else drawWechsel(g, r, gy);
    }

    function drawChart(): void {
      const th = ctx.theme;
      const m = mode();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (m === 'grund') {
        const a = accel();
        plot.fn((x) => a * x, { color: withAlpha(th.muted, 0.6), width: 1.5, dash: [6, 5], from: 0, to: tEnd() });
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[0]!, width: 3 });
      } else if (m === 'traeg') {
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[0]!, width: 3 });
        plot.polyline(hist.map(([tt, , v]) => [tt, v] as [number, number]), { color: th.series[3]!, width: 3, dash: [7, 5] });
        plot.text(tEnd() * 0.05, V0, ctx.t('cart'), { color: th.series[0]!, size: 12, weight: 'bold', offset: [0, -10] });
        plot.text(tEnd() * 0.25, V0, ctx.t('box'), { color: th.series[3]!, size: 12, weight: 'bold', offset: [0, -10] });
      } else if (m === 'wechsel') {
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[0]!, width: 3 });
        plot.polyline(hist.map(([tt, , v]) => [tt, v] as [number, number]), { color: th.series[2]!, width: 3 });
      } else if (m === 'kraft') {
        plot.vline(p.toff, { color: withAlpha(th.series[1]!, 0.7), dash: [6, 5], width: 1.5 });
        plot.text(p.toff, 0, ctx.t('off'), { color: th.series[1]!, size: 11, align: 'left', offset: [4, -12] });
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[3]!, width: 3 });
      } else if (m === 'aufzug') {
        plot.hline(p.pm, { color: withAlpha(th.muted, 0.7), dash: [6, 5], width: 1.5 });
        plot.text(liftDuration() * 0.98, p.pm, ctx.t('restLine'), { color: th.muted, size: 11, align: 'right', offset: [0, -10] });
        // ganzer Verlauf blass, gemessener Teil kräftig
        const full: [number, number][] = [];
        for (let tt = 0; tt <= liftEnd(); tt += 0.02) full.push([tt, scaleReading(p.pm, liftAcceleration(tt, liftDir(), p.la, p.fall))]);
        plot.polyline(full, { color: withAlpha(th.series[1]!, 0.25), width: 2 });
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[1]!, width: 3 });
      } else if (m === 'mess') {
        const pts = points.map((q) => [q.x, q.a] as const);
        if (pts.length >= 2) {
          const k = slopeThroughOrigin(pts);
          const xMax = p.mr === 'F' ? 2.1 : 5.2;
          plot.fn((x) => k * x, { color: withAlpha(th.series[0]!, 0.7), width: 2, dash: [6, 5], from: 0, to: xMax });
        }
        for (const [x, a] of pts) plot.point(x, a, { color: th.series[3]!, radius: 5 });
      }
      plot.end();
    }

    /* ---------- Messen ---------- */
    function measure(): void {
      const key = p.mr === 'F' ? `F|${p.mw}` : `m|${p.mf}`;
      if (key !== seriesKey) {
        points = [];
        seriesKey = key;
      }
      seriesReset = false;
      const aTrue = p.mf / p.mw;
      // Lichtschranken messen die Zeit für s aus der Ruhe; kleine Messabweichung
      const tTrue = Math.sqrt((2 * GATE) / aTrue);
      const tMeas = tTrue * (1 + 0.012 * noise());
      const a = (2 * GATE) / (tMeas * tMeas);
      points.push({ x: p.mr === 'F' ? p.mf : 1 / p.mw, a, t: tMeas });
      if (points.length > 30) points.shift();
    }

    function newTask(): void {
      task = makeTask(p.qn);
      verdict = null;
      tries = 0;
      badInput = false;
    }

    function runCheck(): void {
      const r = checkTask(task, p.qa);
      if (r === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = r;
      tries += 1;
      if (tries === 1) score = { right: score.right + (r ? 1 : 0), all: score.all + 1, streak: r ? score.streak + 1 : 0 };
    }

    function finishInstantly(): void {
      while (running && t < 30) {
        step(0.002);
        if (Math.round(t / 0.002) % 10 === 0) hist.push([t, histValue(), vb]);
      }
      hist.push([t, histValue(), vb]);
    }

    reset();

    return {
      update(changed, source) {
        const motion = ['mode', 'gurt', 'mub', 'mc', 'mh', 'mu', 'm1', 'm2', 'F', 'fs', 'mk', 'muh', 'mug', 'toff', 'pm', 'ldir', 'la', 'fall'];
        if (source === 'init' || source === 'replace' || motion.some((k) => changed.has(k))) {
          reset();
          ctx.clock.pause();
        }
        if (mode() === 'mess') {
          const key = p.mr === 'F' ? `F|${p.mw}` : `m|${p.mf}`;
          if (seriesKey && key !== seriesKey && points.length) {
            points = [];
            seriesReset = true;
          }
          seriesKey = key;
        }
        if (source === 'init' || source === 'replace' || changed.has('qn')) newTask();
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        surface.canvas.setAttribute('aria-label', ctx.t(mode() === 'ueben' ? 'canvasQuiz' : 'canvas'));
        setupPlot();
        ctx.setAction('go', { label: ctx.t(t > 0 ? 'again' : 'start') });
        updateReadouts();
      },

      action(id) {
        if (id === 'measure') measure();
        else if (id === 'clear') {
          points = [];
          seriesReset = false;
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        } else if (id === 'go') {
          reset();
          running = true;
          ctx.setAction('go', { label: ctx.t('again') });
          if (prefersReducedMotion()) finishInstantly();
          else ctx.clock.play();
        }
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        if (!running) {
          ctx.clock.pause();
          return;
        }
        const n = 20;
        for (let k = 0; k < n; k++) step(Math.min(dt, 0.05) / n);
        hist.push([t, histValue(), vb]);
        updateReadouts();
      },

      resetTime() {
        reset();
        updateReadouts();
      },

      render() {
        const g = surface.begin();
        if (mode() === 'ueben') {
          drawQuiz(g, surface.width, surface.height);
          return;
        }
        const s = split(surface.width, surface.height);
        plot.resize();
        drawScene(s.scene);
        drawChart();
      },

      destroy: () => surface.destroy(),
    };
  },
});
