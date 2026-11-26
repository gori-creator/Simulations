import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  BREAKDOWN,
  groundField,
  polarization,
  scrapLiftRatio,
  strike,
  checkTask,
  coulomb,
  E_CHARGE,
  electricToGravity,
  electroscopeAngle,
  fieldLine,
  gravity,
  inducedCharge,
  K,
  M_E,
  M_P,
  makeTask,
  rubCharge,
  TRIBO,
  type ChargeTask,
  type Material,
  type PointCharge,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const PER_RUB = 3;
const MAX_RUB = 6;

const MAT_NAMES: Record<Material, [string, string]> = {
  hair: ['Haare', 'hair'],
  glass: ['Glas', 'glass'],
  wool: ['Wolle', 'wool'],
  silk: ['Seide', 'silk'],
  paper: ['Papier', 'paper'],
  wood: ['Holz', 'wood'],
  amber: ['Bernstein', 'amber'],
  rubber: ['Gummi', 'rubber'],
  pvc: ['Kunststoff (PVC)', 'plastic (PVC)'],
};
const matOptions = TRIBO.map((m) => ({ value: m, label: L(MAT_NAMES[m][0], MAT_NAMES[m][1]) }));

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Elektrische Ladungen: Reibungselektrizität mit zwei Stoffen, Elektroskop,
 * Influenz, das Coulomb’sche Gesetz mit Kraftdiagramm, Feldlinien zweier
 * Ladungen, elektrische Kraft und Gravitation im Atom und eine Übung.
 */
export default defineSimulation({
  id: 'ladungen-coulomb',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'reiben', label: L('Reibungselektrizität', 'Charging by friction') },
        { value: 'skop', label: L('Elektroskop', 'Electroscope') },
        { value: 'influenz', label: L('Influenz: laden ohne Berühren', 'Induction: charging without touching') },
        { value: 'coulomb', label: L('Coulomb’sches Gesetz', 'Coulomb’s law') },
        { value: 'feld', label: L('Feldlinien zweier Ladungen', 'Field lines of two charges') },
        { value: 'atom', label: L('Im Atom: elektrische Kraft und Gravitation', 'In the atom: electric force and gravity') },
        { value: 'ballon', label: L('Alltag: Luftballon und Papierschnipsel', 'Everyday: balloon and paper scraps') },
        { value: 'gewitter', label: L('Gewitter und Blitzableiter', 'Thunderstorm and lightning rod') },
        { value: 'ueben', label: L('Üben: Aufgaben zu Ladungen', 'Practice: tasks on charges') },
      ],
      default: 'reiben',
      display: 'menu',
    },
    { key: 'ma', type: 'choice', label: L('Stab aus', 'Rod made of'), options: matOptions, default: 'pvc', visibleIf: (v) => v.mode === 'reiben' || v.mode === 'skop' },
    { key: 'mb', type: 'choice', label: L('Gerieben mit', 'Rubbed with'), options: matOptions, default: 'wool', visibleIf: (v) => v.mode === 'reiben' || v.mode === 'skop' },
    { key: 'q1', type: 'number', label: L('Ladung Q₁', 'Charge Q₁'), min: -5, max: 5, step: 0.5, default: 2, unit: 'µC', visibleIf: (v) => v.mode === 'coulomb' || v.mode === 'feld' },
    { key: 'q2', type: 'number', label: L('Ladung Q₂', 'Charge Q₂'), min: -5, max: 5, step: 0.5, default: -1, unit: 'µC', visibleIf: (v) => v.mode === 'coulomb' || v.mode === 'feld' },
    { key: 'r', type: 'number', label: L('Abstand r', 'Distance r'), min: 5, max: 50, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.mode === 'coulomb' },
    {
      key: 'sgn',
      type: 'choice',
      label: L('Ladung des Stabs', 'Charge of the rod'),
      options: [
        { value: 'minus', label: L('negativ', 'negative') },
        { value: 'plus', label: L('positiv', 'positive') },
      ],
      default: 'minus',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'influenz',
    },
    { key: 'd', type: 'number', label: L('Abstand Stab – Kugel', 'Distance rod – sphere'), min: 5, max: 40, step: 1, default: 12, unit: 'cm', visibleIf: (v) => v.mode === 'influenz' },
    { key: 'rp', type: 'number', label: L('Abstand Elektron – Proton', 'Distance electron – proton'), min: 20, max: 200, step: 1, default: 53, unit: 'pm', visibleIf: (v) => v.mode === 'atom' },
    { key: 'qb', type: 'number', label: L('Ladung des Ballons', 'Charge of the balloon'), min: 0, max: 30, step: 1, default: 15, unit: 'nC', visibleIf: (v) => v.mode === 'ballon' },
    { key: 'db', type: 'number', label: L('Abstand zu den Schnipseln', 'Distance to the scraps'), min: 1, max: 8, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.mode === 'ballon' },
    { key: 'qw', type: 'number', label: L('Ladung der Gewitterwolke', 'Charge of the thundercloud'), min: 5, max: 40, step: 1, default: 20, unit: 'C', visibleIf: (v) => v.mode === 'gewitter' },
    { key: 'hw', type: 'number', label: L('Höhe der Wolke', 'Height of the cloud'), min: 1, max: 4, step: 0.1, default: 2, unit: 'km', visibleIf: (v) => v.mode === 'gewitter' },
    { key: 'stab', type: 'boolean', label: L('Blitzableiter auf dem Haus', 'Lightning rod on the house'), default: true, visibleIf: (v) => v.mode === 'gewitter' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 16, placeholder: L('eine Zahl', 'a number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'reiben'
      ? L('Drücke mehrmals „Reiben“. Beim Reiben wandern Elektronen von einem Stoff zum anderen.', 'Press “Rub” several times. Rubbing moves electrons from one material to the other.')
      : v.mode === 'skop'
        ? L('Reibe den Stab und berühre das Elektroskop. Die Blättchen stoßen sich ab.', 'Rub the rod and touch the electroscope. The leaves repel each other.')
        : v.mode === 'coulomb'
          ? L('Gleiche Ladungen stoßen sich ab, ungleiche ziehen sich an. Wie hängt die Kraft vom Abstand ab?', 'Like charges repel, unlike charges attract. How does the force depend on distance?')
          : v.mode === 'influenz'
            ? L(
                'Nähere den Stab der Metallkugel. Erde die Kugel kurz und nimm dann den Stab weg – sie bleibt geladen.',
                'Bring the rod close to the metal sphere. Earth the sphere briefly, then remove the rod – it stays charged.',
              )
            : v.mode === 'feld'
              ? L(
                  'Feldlinien zeigen, in welche Richtung eine kleine positive Probeladung gezogen würde. Je dichter, desto stärker das Feld.',
                  'Field lines show the direction a small positive test charge would be pulled. The denser they are, the stronger the field.',
                )
              : v.mode === 'atom'
                ? L(
                    'Elektron und Proton ziehen sich elektrisch und durch Gravitation an. Vergleiche die beiden Kräfte.',
                    'Electron and proton attract each other electrically and by gravity. Compare the two forces.',
                  )
                : L('Rechne oder entscheide und gib die Zahl ein. Komma oder Punkt sind beide in Ordnung.', 'Work it out or decide and enter the number. A comma or a point are both fine.'),
  actions: [
    { id: 'rub', label: L('Reiben', 'Rub'), primary: true, visibleIf: (v) => v.mode === 'reiben' || v.mode === 'skop' },
    { id: 'touch', label: L('Elektroskop berühren', 'Touch the electroscope'), visibleIf: (v) => v.mode === 'skop' },
    { id: 'ground', label: L('Entladen (erden)', 'Discharge (earth)'), visibleIf: (v) => v.mode === 'reiben' || v.mode === 'skop' },
    { id: 'earth', label: L('Kugel kurz erden', 'Earth the sphere briefly'), primary: true, visibleIf: (v) => v.mode === 'influenz' },
    { id: 'away', label: L('Stab wegnehmen / zurück', 'Remove rod / bring back'), visibleIf: (v) => v.mode === 'influenz' },
    { id: 'reset', label: L('Neu', 'Reset'), visibleIf: (v) => v.mode === 'influenz' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'charge', label: L('Ladungen', 'Charges'), spoiler: true },
    { key: 'F', label: L('Kraft', 'Force'), spoiler: true },
    { key: 'what', label: L('Was passiert?', 'What happens?') },
  ],
  presets: [
    { id: 'pvc', label: L('Kunststoff an Wolle', 'Plastic on wool'), values: { mode: 'reiben', ma: 'pvc', mb: 'wool' } },
    { id: 'glass', label: L('Glas an Seide', 'Glass on silk'), values: { mode: 'reiben', ma: 'glass', mb: 'silk' } },
    { id: 'skop', label: L('Elektroskop', 'Electroscope'), values: { mode: 'skop', ma: 'pvc', mb: 'wool' } },
    { id: 'attract', label: L('Anziehung', 'Attraction'), values: { mode: 'coulomb', q1: 2, q2: -1, r: 20 } },
    { id: 'repel', label: L('Abstoßung', 'Repulsion'), values: { mode: 'coulomb', q1: 2, q2: 2, r: 20 } },
    { id: 'double', label: L('Doppelter Abstand: ein Viertel', 'Double distance: a quarter'), values: { mode: 'coulomb', q1: 2, q2: 2, r: 40 } },
    { id: 'amber', label: L('Bernstein an Wolle', 'Amber on wool'), values: { mode: 'reiben', ma: 'amber', mb: 'wool' } },
    { id: 'ind', label: L('Influenz: Stab nähern', 'Induction: bring the rod close'), values: { mode: 'influenz', sgn: 'minus', d: 8 } },
    { id: 'ballonNah', label: L('Ballon nah an den Schnipseln', 'Balloon close to the scraps'), values: { mode: 'ballon', qb: 15, db: 2 } },
    { id: 'ballonFern', label: L('Ballon zu weit weg', 'Balloon too far away'), values: { mode: 'ballon', qb: 15, db: 6 } },
    { id: 'mitStab', label: L('Gewitter mit Blitzableiter', 'Thunderstorm with lightning rod'), values: { mode: 'gewitter', qw: 20, hw: 2, stab: true } },
    { id: 'ohneStab', label: L('Gewitter ohne Blitzableiter', 'Thunderstorm without lightning rod'), values: { mode: 'gewitter', qw: 20, hw: 2, stab: false } },
    { id: 'starkes', label: L('Starkes Gewitter: Blitz in den Baum', 'Strong storm: lightning hits the tree'), values: { mode: 'gewitter', qw: 40, hw: 1.5, stab: false } },
    { id: 'indfar', label: L('Influenz: Stab weit weg', 'Induction: rod far away'), values: { mode: 'influenz', sgn: 'minus', d: 40 } },
    { id: 'dipole', label: L('Feld: Dipol (+ und −)', 'Field: dipole (+ and −)'), values: { mode: 'feld', q1: 2, q2: -2 } },
    { id: 'same', label: L('Feld: zwei gleiche Ladungen', 'Field: two equal charges'), values: { mode: 'feld', q1: 2, q2: 2 } },
    { id: 'uneq', label: L('Feld: ungleich stark', 'Field: unequal strength'), values: { mode: 'feld', q1: 4, q2: -1 } },
    { id: 'atom', label: L('Wasserstoffatom (53 pm)', 'Hydrogen atom (53 pm)'), values: { mode: 'atom', rp: 53 } },
    { id: 'quiz', label: L('Üben: acht Aufgaben', 'Practice: eight tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasB: 'Ein geladener Luftballon über Papierschnipseln; in einem vergrößerten Ausschnitt richten sich die Ladungen in den Molekülen aus',
      canvasG: 'Eine Gewitterwolke über einem Haus mit Baum und Blitzableiter; das elektrische Feld am Boden und an den Spitzen wird verglichen',
      bLift: 'Anziehung : Gewicht = {r}',
      bJump: 'Die Schnipsel springen zum Ballon.',
      bStay: 'Die Schnipsel bleiben liegen.',
      bInfo:
        'Papier ist ein Isolator. Der Ballon verschiebt die Ladungen in jedem Molekül ein wenig (Polarisation): Die zugewandte Seite wird entgegengesetzt geladen. Weil sie näher ist, überwiegt die Anziehung.',
      bZoom: 'Moleküle im Papier (vergrößert)',
      gGround: 'Feld am Boden: {e} kV/m',
      gTip: 'an der höchsten Spitze ({t}): {e} kV/m – Durchschlag ab 3000 kV/m',
      gStrike: 'Blitz schlägt ein: {t}',
      gNone: 'noch kein Einschlag',
      gInfo:
        'An Spitzen drängen sich die Feldlinien, das Feld wird viel stärker. Dort beginnt der Blitz. Ein Blitzableiter bietet die höchste Spitze und leitet den Strom über dicke Drähte in die Erde – das Haus bleibt verschont.',
      gTip_dach: 'Dach',
      gTip_baum: 'Baum',
      gTip_stab: 'Blitzableiter',
      canvas: 'Elektrische Ladungen: ein Stab und ein Tuch mit Plus- und Minuszeichen, ein Elektroskop mit Blättchen oder zwei Ladungen mit Kraftpfeilen und Diagramm',
      chargeVal: '{a}: {qa}, {b}: {qb} (je {n} Elektronen verschoben)',
      neutral: 'beide ungeladen',
      same: 'Gleiche Stoffe laden sich nicht auf.',
      rubWhat: '{who} gibt Elektronen ab und wird positiv, der andere Stoff nimmt sie auf und wird negativ. Zusammen bleibt die Ladung null.',
      attract: 'Stab und Tuch ziehen sich an (ungleiche Ladungen).',
      skopVal: 'Elektroskop: {q} Elementarladungen ({s})',
      skopWhat: 'Beide Blättchen tragen gleichnamige Ladung und stoßen sich ab. Ob plus oder minus, sieht man am Ausschlag nicht.',
      Fval: 'F = k · Q₁ · Q₂ / r² ≈ {F} N ({how})',
      repel: 'Abstoßung',
      attr: 'Anziehung',
      none: 'keine Kraft',
      r: 'r in cm',
      F: '|F| in N',
      plus: 'positiv',
      minus: 'negativ',
      neutralShort: 'ungeladen',
      rod: 'Stab',
      cloth: 'Tuch',
      canvasQuiz: 'Übungsaufgabe zu Ladungen mit Rückmeldung',
      indVal: 'Getrennte Ladung in der Kugel: etwa {p} % der Stabladung',
      indWhat0: 'Der Stab zieht die ungleichnamigen Ladungen an die nahe Seite der Kugel, die gleichnamigen werden auf die abgewandte Seite gedrängt. Insgesamt ist die Kugel noch ungeladen.',
      indWhat1: 'Geerdet: Die gleichnamigen Ladungen sind über die Erde abgeflossen. Die Kugel trägt jetzt eine Ladung mit entgegengesetztem Vorzeichen.',
      indWhat2: 'Stab weg: Die Ladung bleibt auf der Kugel und verteilt sich gleichmäßig – geladen durch Influenz, ohne Berührung.',
      indWhat3: 'Stab weg, ohne Erden: Die Ladungen verteilen sich wieder – die Kugel ist ungeladen.',
      sphere: 'Metallkugel',
      earth: 'Erde',
      fieldVal: 'Q₁ = {q1} µC, Q₂ = {q2} µC – {n} Feldlinien zeigen das Feld',
      fieldWhat: 'Feldlinien beginnen an positiven und enden an negativen Ladungen. Sie kreuzen sich nie.',
      atomF: 'F_el = k · e² / r² ≈ {Fe} N, F_G = G · m_e · m_p / r² ≈ {Fg} N',
      atomRatio: 'Die elektrische Kraft ist etwa {x}-mal so groß – bei jedem Abstand.',
      atomWhat: 'Beide Kräfte fallen mit 1/r². Im Atom hält nur die elektrische Kraft das Elektron, die Gravitation ist verschwindend klein.',
      electron: 'Elektron',
      proton: 'Proton',
      rpm: 'r in pm',
      logF: 'F in N (Zehnerpotenzen)',
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
      canvasB: 'A charged balloon above paper scraps; in a magnified detail the charges in the molecules line up',
      canvasG: 'A thundercloud above a house with a tree and a lightning rod; the electric field at the ground and at the points is compared',
      bLift: 'attraction : weight = {r}',
      bJump: 'The scraps jump up to the balloon.',
      bStay: 'The scraps stay where they are.',
      bInfo: 'Paper is an insulator. The balloon shifts the charges in every molecule slightly (polarisation): the near side gets the opposite charge. Because it is closer, attraction wins.',
      bZoom: 'molecules in the paper (magnified)',
      gGround: 'field at the ground: {e} kV/m',
      gTip: 'at the highest point ({t}): {e} kV/m – breakdown from 3000 kV/m',
      gStrike: 'lightning strikes: {t}',
      gNone: 'no strike yet',
      gInfo:
        'Field lines crowd together at points, so the field becomes much stronger. That is where lightning starts. A lightning rod offers the highest point and conducts the current through thick wires to earth – the house is spared.',
      gTip_dach: 'roof',
      gTip_baum: 'tree',
      gTip_stab: 'lightning rod',
      canvas: 'Electric charges: a rod and a cloth with plus and minus signs, an electroscope with leaves, or two charges with force arrows and a graph',
      chargeVal: '{a}: {qa}, {b}: {qb} ({n} electrons moved each)',
      neutral: 'both uncharged',
      same: 'Identical materials do not become charged.',
      rubWhat: '{who} gives off electrons and becomes positive, the other material takes them and becomes negative. In total the charge stays zero.',
      attract: 'Rod and cloth attract each other (unlike charges).',
      skopVal: 'electroscope: {q} elementary charges ({s})',
      skopWhat: 'Both leaves carry like charge and repel. Whether plus or minus cannot be seen from the deflection.',
      Fval: 'F = k · Q₁ · Q₂ / r² ≈ {F} N ({how})',
      repel: 'repulsion',
      attr: 'attraction',
      none: 'no force',
      r: 'r in cm',
      F: '|F| in N',
      plus: 'positive',
      minus: 'negative',
      neutralShort: 'uncharged',
      rod: 'rod',
      cloth: 'cloth',
      canvasQuiz: 'Practice task on charges with feedback',
      indVal: 'Separated charge in the sphere: about {p} % of the rod’s charge',
      indWhat0: 'The rod attracts unlike charges to the near side of the sphere; like charges are pushed to the far side. Overall the sphere is still uncharged.',
      indWhat1: 'Earthed: the like charges have flowed away through the earth. The sphere now carries a charge of the opposite sign.',
      indWhat2: 'Rod removed: the charge stays on the sphere and spreads evenly – charged by induction, without touching.',
      indWhat3: 'Rod removed without earthing: the charges spread again – the sphere is uncharged.',
      sphere: 'metal sphere',
      earth: 'earth',
      fieldVal: 'Q₁ = {q1} µC, Q₂ = {q2} µC – {n} field lines show the field',
      fieldWhat: 'Field lines start at positive and end at negative charges. They never cross.',
      atomF: 'F_el = k · e² / r² ≈ {Fe} N, F_G = G · m_e · m_p / r² ≈ {Fg} N',
      atomRatio: 'The electric force is about {x} times as large – at every distance.',
      atomWhat: 'Both forces fall off as 1/r². In the atom only the electric force holds the electron; gravity is vanishingly small.',
      electron: 'electron',
      proton: 'proton',
      rpm: 'r in pm',
      logF: 'F in N (powers of ten)',
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
    const en = () => ctx.lang === 'en';
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 50],
      y: [0, 10],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    let rubs = 0;
    let skop = 0;
    let anim = 0;
    /* Influenz: 0 = Stab da, 1 = geerdet (Stab da), 2 = Stab weg nach Erden, 3 = Stab weg ohne Erden */
    let indState = 0;

    /* Übung */
    let task: ChargeTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    const name = (m: Material) => MAT_NAMES[m][en() ? 1 : 0];
    const charges = () => rubCharge(p.ma as Material, p.mb as Material, rubs * PER_RUB);
    const signText = (q: number) => (q > 0 ? `+${q}` : q < 0 ? `−${-q}` : '0');

    function setupPlot(): void {
      if (p.mode === 'atom') {
        // y = log₁₀(F) + 50, damit die x-Achse unten liegt; beschriftet als Zehnerpotenz
        plot.setRangePadded([0, 200], [0, 46], { left: 62, right: 14, top: 22, bottom: 24 });
        plot.setAxes({
          x: { label: ctx.t('rpm') },
          y: {
            label: ctx.t('logF'),
            format: (v) =>
              `10${String(Math.round(v - 50))
                .replace('-', '⁻')
                .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!)}`,
          },
        });
        return;
      }
      const F = Math.abs(coulomb(p.q1 * 1e-6, p.q2 * 1e-6, 0.05));
      plot.setRangePadded([0, 50], [0, Math.max(1, F) * 1.1], { left: 52, right: 14, top: 22, bottom: 24 });
      plot.setAxes({ x: { label: ctx.t('r') }, y: { label: ctx.t('F') } });
    }

    function updateReadouts(): void {
      for (const k of ['charge', 'F', 'what']) ctx.readout(k, null);
      if (p.mode === 'ballon') {
        const ratio = scrapLiftRatio(p.qb, p.db);
        ctx.readout('F', tr('bLift', { r: fmt.num(ratio, ratio < 10 ? 2 : 0) }));
        ctx.readout('what', `${ctx.t(ratio >= 1 ? 'bJump' : 'bStay')} ${ctx.t('bInfo')}`);
        return;
      }
      if (p.mode === 'gewitter') {
        const st = strike(p.qw, p.hw * 1000, p.stab);
        const best = p.stab ? 'stab' : 'baum';
        ctx.readout('charge', tr('gGround', { e: fmt.num(groundField(p.qw, p.hw * 1000) / 1000, 0) }));
        ctx.readout('F', tr('gTip', { t: ctx.t(`gTip_${best}`), e: fmt.num(st.field / 1000, 0) }));
        ctx.readout('what', `${st.target ? tr('gStrike', { t: ctx.t(`gTip_${st.target}`) }) : ctx.t('gNone')}. ${ctx.t('gInfo')}`);
        return;
      }
      if (p.mode === 'influenz') {
        const f = inducedCharge(1, p.d / 100);
        ctx.readout('charge', tr('indVal', { p: fmt.num(f * 100, 0) }));
        ctx.readout('what', ctx.t(`indWhat${indState}`));
        return;
      }
      if (p.mode === 'feld') {
        ctx.readout('charge', tr('fieldVal', { q1: fmt.num(p.q1, 1), q2: fmt.num(p.q2, 1), n: fieldSeeds().length }));
        ctx.readout('what', ctx.t('fieldWhat'));
        return;
      }
      if (p.mode === 'atom') {
        const r = p.rp * 1e-12;
        const Fe = (K * E_CHARGE * E_CHARGE) / (r * r);
        const Fg = gravity(M_E, M_P, r);
        ctx.readout('F', tr('atomF', { Fe: sci(Fe), Fg: sci(Fg) }));
        ctx.readout('charge', tr('atomRatio', { x: sci(electricToGravity()) }));
        ctx.readout('what', ctx.t('atomWhat'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('what', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'coulomb') {
        const F = coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100);
        ctx.readout('F', tr('Fval', { F: fmt.num(Math.abs(F), 3), how: ctx.t(F > 0 ? 'repel' : F < 0 ? 'attr' : 'none') }));
        return;
      }
      const c = charges();
      if (p.ma === p.mb) {
        ctx.readout('what', ctx.t('same'));
        return;
      }
      if (rubs === 0) ctx.readout('charge', ctx.t('neutral'));
      else ctx.readout('charge', tr('chargeVal', { a: name(p.ma as Material), qa: signText(c.a), b: name(p.mb as Material), qb: signText(c.b), n: rubs * PER_RUB }));
      if (p.mode === 'reiben') {
        if (rubs > 0) ctx.readout('what', `${tr('rubWhat', { who: name((c.a > 0 ? p.ma : p.mb) as Material) })} ${ctx.t('attract')}`);
      } else {
        ctx.readout('what', `${tr('skopVal', { q: signText(skop), s: ctx.t(skop > 0 ? 'plus' : skop < 0 ? 'minus' : 'neutralShort') })}. ${skop !== 0 ? ctx.t('skopWhat') : ''}`);
      }
    }

    function signs(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, q: number): void {
      const th = ctx.theme;
      const n = Math.min(18, Math.abs(q));
      // Raster passend zum Seitenverhältnis (schmaler Stab: eine Spalte)
      const cols = Math.max(1, Math.min(n, Math.round(Math.sqrt((n * w) / h))));
      const rows = Math.max(1, Math.ceil(n / cols));
      for (let k = 0; k < n; k++) {
        const cx = x + ((k % cols) + 0.5) * (w / cols);
        const cy = y + (Math.floor(k / cols) + 0.5) * (h / rows);
        text(g, q > 0 ? '+' : '−', cx, cy, { font: `800 16px ${th.font}`, color: q > 0 ? th.series[1]! : th.series[0]! });
      }
    }

    function drawRub(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const c = charges();
      const attract = rubs > 0 && c.a !== 0;
      const cx = r.x + r.w / 2;
      const top = r.y + 30;
      // Stab hängt an einem Faden, Tuch daneben
      const tilt = attract ? Math.min(0.35, 0.06 * rubs) : 0;
      const sx = cx - 40;
      const len = Math.min(r.h * 0.55, 220);
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(sx, top);
      g.lineTo(sx + Math.sin(tilt) * len * 0.4, top + len * 0.4);
      g.stroke();
      g.save();
      g.translate(sx + Math.sin(tilt) * len * 0.4, top + len * 0.4);
      g.rotate(-tilt);
      roundRect(g, -14, 0, 28, len * 0.6, 8);
      g.fillStyle = withAlpha(th.series[4]!, 0.55);
      g.fill();
      signs(g, -14, 10, 28, len * 0.5, c.a);
      g.restore();
      text(g, `${ctx.t('rod')}: ${name(p.ma as Material)}`, sx, top - 14, { font: `700 12px ${th.font}`, color: th.text });
      // Tuch
      const tx = cx + 50;
      const ty = top + len * 0.45;
      roundRect(g, tx, ty, 90, 70, 12);
      g.fillStyle = withAlpha(th.series[3]!, 0.45);
      g.fill();
      signs(g, tx + 4, ty + 6, 82, 58, c.b);
      text(g, `${ctx.t('cloth')}: ${name(p.mb as Material)}`, tx + 45, ty + 86, { font: `700 12px ${th.font}`, color: th.text });
    }

    function drawSkop(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w * 0.62;
      const base = r.y + r.h - 30;
      const hgt = Math.min(r.h * 0.7, 260);
      // Gehäuse
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, base - hgt * 0.35, hgt * 0.32, 0, Math.PI * 2);
      g.stroke();
      // Stange und Kugel
      g.fillStyle = th.muted;
      g.fillRect(cx - 3, base - hgt, 6, hgt * 0.75);
      g.beginPath();
      g.arc(cx, base - hgt, 12, 0, Math.PI * 2);
      g.fill();
      // Blättchen
      const ang = electroscopeAngle(skop, MAX_RUB * PER_RUB);
      const pivotY = base - hgt * 0.4;
      const leaf = hgt * 0.22;
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 4;
      for (const sgn of [-1, 1]) {
        g.beginPath();
        g.moveTo(cx, pivotY);
        g.lineTo(cx + sgn * Math.sin(ang) * leaf, pivotY + Math.cos(ang) * leaf);
        g.stroke();
      }
      if (skop !== 0) {
        signs(g, cx - 30, base - hgt - 34, 60, 20, Math.sign(skop) * Math.min(6, Math.ceil(Math.abs(skop) / 3)));
      }
      // Stab links
      const c = charges();
      roundRect(g, r.x + 20, base - hgt - 10, r.w * 0.3, 26, 8);
      g.fillStyle = withAlpha(th.series[4]!, 0.55);
      g.fill();
      signs(g, r.x + 24, base - hgt - 8, r.w * 0.3 - 8, 22, c.a);
      text(g, name(p.ma as Material), r.x + 20 + r.w * 0.15, base - hgt + 30, { font: `700 12px ${th.font}`, color: th.text });
    }

    function drawCoulomb(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cy = r.y + r.h / 2;
      const scale = (r.w - 80) / 50;
      const x1 = r.x + 40;
      const x2 = x1 + p.r * scale;
      const F = coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100);
      const ball = (x: number, q: number) => {
        g.fillStyle = q > 0 ? th.series[1]! : q < 0 ? th.series[0]! : th.muted;
        g.beginPath();
        g.arc(x, cy, 12 + 2 * Math.abs(q), 0, Math.PI * 2);
        g.fill();
        text(g, q > 0 ? '+' : q < 0 ? '−' : '0', x, cy, { font: `800 16px ${th.font}`, color: '#ffffff' });
        text(g, `${fmt.num(q, 1)} µC`, x, cy + 34, { font: `700 12px ${th.font}`, color: th.text });
      };
      // Abstand
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(x1, cy - 50);
      g.lineTo(x2, cy - 50);
      g.stroke();
      g.setLineDash([]);
      text(g, `r = ${fmt.num(p.r, 0)} cm`, (x1 + x2) / 2, cy - 60, { font: `600 12px ${th.font}`, color: th.muted });
      // Kraftpfeile (gleich lang, entgegengesetzt), Länge logarithmisch
      const len = F === 0 ? 0 : Math.min(r.w * 0.25, 18 + 22 * Math.log10(1 + Math.abs(F) * 10));
      const dir = Math.sign(F); // +: Abstoßung
      const arrow = (x: number, d: number) => {
        if (len === 0) return;
        const xe = x + d * len;
        g.strokeStyle = th.series[2]!;
        g.fillStyle = th.series[2]!;
        g.lineWidth = 4;
        g.beginPath();
        g.moveTo(x, cy);
        g.lineTo(xe - d * 8, cy);
        g.stroke();
        g.beginPath();
        g.moveTo(xe, cy);
        g.lineTo(xe - d * 12, cy - 7);
        g.lineTo(xe - d * 12, cy + 7);
        g.closePath();
        g.fill();
      };
      arrow(x1, -dir);
      arrow(x2, dir);
      ball(x1, p.q1);
      ball(x2, p.q2);
    }

    /** Zahl in Zehnerpotenz-Schreibweise, z. B. 8,2 · 10⁻⁸ */
    function sci(x: number): string {
      if (x === 0) return '0';
      const e = Math.floor(Math.log10(Math.abs(x)));
      const m = x / 10 ** e;
      const sup = String(e)
        .replace('-', '⁻')
        .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
      return `${fmt.num(m, 1)} · 10${sup}`;
    }

    /* ---------- Influenz ---------- */
    function drawInfluenz(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const sgn = p.sgn === 'plus' ? 1 : -1;
      const rodThere = indState < 2;
      const cy = r.y + r.h * 0.48;
      const R = Math.min(r.h * 0.26, r.w * 0.16);
      const sx = r.x + r.w * 0.66;
      // Stab links, Abstand nach d
      const ppc = (r.w * 0.36) / 40;
      const rodEnd = sx - R - p.d * ppc;
      if (rodThere) {
        const rw = Math.min(r.w * 0.34, rodEnd - r.x - 10);
        roundRect(g, rodEnd - rw, cy - 12, rw, 24, 10);
        g.fillStyle = withAlpha(sgn > 0 ? th.series[1]! : th.series[0]!, 0.35);
        g.fill();
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        g.stroke();
        for (let k = 0; k < 6; k++) text(g, sgn > 0 ? '+' : '−', rodEnd - rw + 14 + (k * (rw - 20)) / 5, cy, { font: `800 15px ${th.font}`, color: sgn > 0 ? th.series[1]! : th.series[0]! });
      }
      // Kugel
      g.beginPath();
      g.arc(sx, cy, R, 0, Math.PI * 2);
      g.fillStyle = withAlpha(th.muted, 0.18);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      text(g, ctx.t('sphere'), sx, cy - R - 12, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.muted });
      // Ladungen in der Kugel: 10 Paare; getrennt nach Influenz
      const f = rodThere ? inducedCharge(1, p.d / 100) : 0;
      const nSep = Math.round(10 * f);
      const jit = (k: number) => Math.sin(anim * 3 + k * 1.7) * 1.5;
      const mark = (x: number, y: number, q: number, k: number) =>
        text(g, q > 0 ? '+' : '−', x + jit(k), y + jit(k + 3), { font: `800 14px ${th.font}`, color: q > 0 ? th.series[1]! : th.series[0]! });
      // Reihenfolge: bei negativem Stab wandern zuerst die Elektronen der nahen (linken) Seite weg,
      // bei positivem Stab zuerst die der fernen (rechten) Seite heran
      const order = Array.from({ length: 10 }, (_, k) => k).sort((i, j) => (sgn < 0 ? 1 : -1) * (Math.cos((i / 10) * Math.PI * 2) - Math.cos((j / 10) * Math.PI * 2)));
      for (let idx = 0; idx < 10; idx++) {
        const k = order[idx]!;
        const a = (k / 10) * Math.PI * 2;
        const rr = R * 0.45;
        const bx = sx + Math.cos(a) * rr;
        const by = cy + Math.sin(a) * rr;
        // ortsfeste positive Atomrümpfe
        mark(bx + 6, by, 1, k + 20);
        // bewegliche Elektronen
        let ex = bx - 6;
        let ey = by;
        if (idx < nSep && (indState === 0 || indState === 1)) {
          // bei negativem Stab werden Elektronen weggedrückt (nach rechts), sonst angezogen (nach links)
          const side = sgn < 0 ? 1 : -1;
          const t = (idx + 0.5) / nSep;
          ex = sx + side * R * 0.75 + Math.sin(anim * 3 + k) * 1.5;
          ey = cy + (t - 0.5) * R * 1.3;
        }
        // Geerdet bei negativem Stab: weggedrückte Elektronen sind abgeflossen
        const gone = indState >= 1 && indState !== 3 && sgn < 0 && idx < nSep0();
        // Geerdet bei positivem Stab: Elektronen aus der Erde ergänzen (Kugel wird negativ)
        if (!gone) mark(ex, ey, -1, k);
      }
      if (indState >= 1 && indState !== 3 && sgn > 0) {
        for (let k = 0; k < nSep0(); k++) {
          const a = (k / Math.max(1, nSep0())) * Math.PI * 2 + 0.3;
          const ex = indState === 1 ? sx - R * 0.75 : sx + Math.cos(a) * R * 0.75;
          const ey = indState === 1 ? cy + ((k + 0.5) / nSep0() - 0.5) * R * 1.2 : cy + Math.sin(a) * R * 0.75;
          mark(ex, ey, -1, k + 40);
        }
      }
      // Erdung
      if (indState === 1) {
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(sx, cy + R);
        g.lineTo(sx, cy + R + 30);
        for (let k = 0; k < 3; k++) {
          g.moveTo(sx - 14 + k * 4, cy + R + 30 + k * 5);
          g.lineTo(sx + 14 - k * 4, cy + R + 30 + k * 5);
        }
        g.stroke();
        text(g, ctx.t('earth'), sx + 22, cy + R + 36, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      }
      text(g, `d = ${fmt.num(p.d, 0)} cm`, (rodEnd + sx - R) / 2, cy + 30, { font: `600 12px ${th.font}`, color: th.muted });
    }
    /** Anzahl der beim Erden geflossenen Ladungen (fest ab dem Erden). */
    let earthed = 0;
    const nSep0 = () => earthed;

    /* ---------- Feldlinien ---------- */
    function fieldCharges(r: Rect): PointCharge[] {
      return [
        { x: r.x + r.w * 0.33, y: r.y + r.h * 0.5, q: p.q1 },
        { x: r.x + r.w * 0.67, y: r.y + r.h * 0.5, q: p.q2 },
      ].filter((c) => c.q !== 0);
    }
    function fieldSeeds(): { c: number; a: number }[] {
      const out: { c: number; a: number }[] = [];
      const qs = [p.q1, p.q2];
      // Linien starten an positiven Ladungen; gibt es keine, an negativen (rückwärts)
      const anyPos = qs.some((q) => q > 0);
      qs.forEach((q, i) => {
        if (q === 0 || (anyPos ? q < 0 : false)) return;
        const n = Math.min(24, Math.max(4, Math.round(Math.abs(q) * 5)));
        for (let k = 0; k < n; k++) out.push({ c: i, a: (k / n) * Math.PI * 2 + 0.1 });
      });
      return out;
    }
    function drawFeld(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const charges = fieldCharges(r);
      const box = { x0: r.x, y0: r.y, x1: r.x + r.w, y1: r.y + r.h };
      const anyPos = [p.q1, p.q2].some((q) => q > 0);
      const all = [
        { x: r.x + r.w * 0.33, y: r.y + r.h * 0.5, q: p.q1 },
        { x: r.x + r.w * 0.67, y: r.y + r.h * 0.5, q: p.q2 },
      ];
      g.strokeStyle = withAlpha(th.text, 0.55);
      g.lineWidth = 1.4;
      for (const sd of fieldSeeds()) {
        const c = all[sd.c]!;
        const x0 = c.x + Math.cos(sd.a) * 14;
        const y0 = c.y + Math.sin(sd.a) * 14;
        const pts = fieldLine(x0, y0, charges, anyPos ? 1 : -1, 4, 600, box, 10);
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        // Pfeil in der Mitte der Linie
        const m = Math.floor(pts.length / 2);
        if (pts.length > 6) {
          const [ax, ay] = pts[m - 1]!;
          const [bx, by] = pts[m]!;
          const ang = Math.atan2(by - ay, bx - ax) + (anyPos ? 0 : Math.PI);
          g.save();
          g.translate(bx, by);
          g.rotate(ang);
          g.fillStyle = withAlpha(th.text, 0.7);
          g.beginPath();
          g.moveTo(5, 0);
          g.lineTo(-4, -4);
          g.lineTo(-4, 4);
          g.closePath();
          g.fill();
          g.restore();
        }
      }
      for (const c of all) {
        if (c.q === 0) continue;
        g.beginPath();
        g.arc(c.x, c.y, 12, 0, Math.PI * 2);
        g.fillStyle = c.q > 0 ? th.series[1]! : th.series[0]!;
        g.fill();
        text(g, c.q > 0 ? '+' : '−', c.x, c.y + 1, { font: `800 16px ${th.font}`, color: th.bg });
        text(g, `${fmt.num(c.q, 1)} µC`, c.x, c.y + 28, { font: `700 12px ${th.font}`, color: th.text });
      }
    }

    /* ---------- Atom ---------- */
    function drawAtom(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w * 0.2;
      const cy = r.y + r.h * 0.5;
      const ppm = Math.min((r.w * 0.7) / 200, (r.h * 0.8) / 200);
      const ex = cx + p.rp * ppm;
      g.strokeStyle = withAlpha(th.muted, 0.4);
      g.setLineDash([4, 4]);
      g.beginPath();
      g.arc(cx, cy, p.rp * ppm, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.arc(cx, cy, 14, 0, Math.PI * 2);
      g.fillStyle = th.series[1]!;
      g.fill();
      text(g, '+', cx, cy + 1, { font: `800 16px ${th.font}`, color: th.bg });
      text(g, ctx.t('proton'), cx, cy + 30, { font: `600 12px ${th.font}`, color: th.text });
      g.beginPath();
      g.arc(ex, cy, 7, 0, Math.PI * 2);
      g.fillStyle = th.series[0]!;
      g.fill();
      text(g, ctx.t('electron'), ex + 8, cy + 18, { font: `600 12px ${th.font}`, color: th.text });
      // Kraftpfeile: elektrisch dick, Gravitation als winziger Punkt
      g.strokeStyle = th.series[2]!;
      g.fillStyle = th.series[2]!;
      g.lineWidth = 4;
      const L = Math.min(60, p.rp * ppm - 20);
      g.beginPath();
      g.moveTo(ex - 10, cy - 18);
      g.lineTo(ex - 10 - L, cy - 18);
      g.stroke();
      g.beginPath();
      g.moveTo(ex - 16 - L, cy - 18);
      g.lineTo(ex - 6 - L, cy - 24);
      g.lineTo(ex - 6 - L, cy - 12);
      g.closePath();
      g.fill();
      text(g, 'F_el', ex - 10 - L / 2, cy - 32, { font: `700 12px ${th.font}`, color: th.series[2]! });
      text(g, `r = ${fmt.num(p.rp, 0)} pm`, (cx + ex) / 2, cy + 50, { font: `600 12px ${th.font}`, color: th.muted });
    }

    /* ---------- Übung ---------- */
    function wrap(g: CanvasRenderingContext2D, str: string, maxW: number): string[] {
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawQuiz(W: number, H: number): void {
      const g = surface.g;
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
        for (const line of wrap(g, ctx.t(verdict ? 'qOk' : 'qNo'), maxW)) {
          g.fillText(line, pad, y);
          y += narrow ? 26 : 34;
        }
        y += 6;
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
      const n = Math.min(10, score.all);
      const sx = W / 2 - 90;
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(sx + i * 20, H - 24, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
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

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'atom') {
        const lel = (rp: number) => Math.log10((K * E_CHARGE * E_CHARGE) / (rp * 1e-12) ** 2) + 50;
        const lg = (rp: number) => Math.log10(gravity(M_E, M_P, rp * 1e-12)) + 50;
        plot.fn(lel, { color: th.series[2]!, width: 3, from: 20, to: 200 });
        plot.fn(lg, { color: th.muted, width: 3, from: 20, to: 200 });
        plot.point(p.rp, lel(p.rp), { color: th.series[2]!, radius: 6 });
        plot.point(p.rp, lg(p.rp), { color: th.muted, radius: 6 });
        plot.text(195, lel(195), 'F_el', { color: th.series[2]!, size: 12, weight: 'bold', align: 'right', offset: [0, -12] });
        plot.text(195, lg(195), 'F_G', { color: th.text, size: 12, weight: 'bold', align: 'right', offset: [0, -12] });
        plot.end();
        return;
      }
      plot.fn((rc) => Math.abs(coulomb(p.q1 * 1e-6, p.q2 * 1e-6, rc / 100)), { color: th.series[2]!, width: 3, from: 4, to: 50 });
      plot.point(p.r, Math.abs(coulomb(p.q1 * 1e-6, p.q2 * 1e-6, p.r / 100)), { color: th.series[1]!, radius: 6 });
      plot.end();
    }

    /* ---------- Luftballon ---------- */
    function drawBalloon(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const wide = r.w >= 700;
      const scene: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.55, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h * 0.55 };
      const table = scene.y + scene.h * 0.82;
      const pxPerCm = (table - scene.y - 80) / 9;
      const bx = scene.x + scene.w / 2;
      const bR = Math.min(60, scene.w * 0.16);
      const by = table - p.db * pxPerCm - bR;
      const ratio = scrapLiftRatio(p.qb, p.db);
      // Tisch
      g.fillStyle = withAlpha(th.muted, 0.3);
      g.fillRect(scene.x + 10, table, scene.w - 20, 8);
      // Schnipsel: springen bei genügend Kraft hoch (Animation)
      for (let k = 0; k < 9; k++) {
        const x = bx + (k - 4) * (bR * 0.32);
        const lift = ratio >= 1 ? Math.min(1, ((anim * 1.5 + k * 0.13) % 2) * 1.2) : 0.02 * Math.min(1, ratio) * Math.sin(anim * 8 + k);
        const y = table - 3 - lift * (table - (by + bR) - 6);
        g.save();
        g.translate(x, y);
        g.rotate(Math.sin(k * 1.7 + anim * (ratio >= 1 ? 3 : 0)) * 0.6);
        g.fillStyle = withAlpha(th.text, 0.75);
        g.fillRect(-5, -2, 10, 4);
        g.restore();
      }
      // Ballon
      g.beginPath();
      g.ellipse(bx, by, bR * 0.85, bR, 0, 0, Math.PI * 2);
      g.fillStyle = withAlpha(th.series[1]!, 0.7);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(bx, by - bR);
      g.lineTo(bx, scene.y + 6);
      g.stroke();
      const nMinus = Math.round(p.qb / 3);
      for (let k = 0; k < nMinus; k++) {
        const a = Math.PI * 0.15 + (k / Math.max(1, nMinus - 1)) * Math.PI * 0.7;
        text(g, '−', bx + Math.cos(a) * bR * 0.6, by + Math.sin(a) * bR * 0.75, { font: `800 14px ${th.font}`, color: th.bg });
      }
      text(g, `${fmt.num(p.db, 1)} cm`, bx + bR + 12, (by + bR + table) / 2, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      // Vergrößerung: Moleküle als Dipole
      const zr: Rect = wide ? { x: r.x + r.w * 0.58, y: r.y + 30, w: r.w * 0.38, h: r.h * 0.5 } : { x: r.x + 20, y: r.y + r.h * 0.58, w: r.w - 40, h: r.h * 0.3 };
      roundRect(g, zr.x, zr.y, zr.w, zr.h, 10);
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.stroke();
      text(g, ctx.t('bZoom'), zr.x + 10, zr.y + 14, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      const pol = polarization(p.qb, p.db);
      const cols = 6;
      const rows = 3;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cx = zr.x + ((i + 0.5) * zr.w) / cols;
          const cy = zr.y + 26 + ((j + 0.5) * (zr.h - 30)) / rows;
          // zufällige Ausrichtung, mit Ladung nach oben (zum Ballon) gedreht
          const rnd = Math.sin(i * 12.9898 + j * 78.233) * Math.PI;
          const ang = rnd * (1 - pol) - (Math.PI / 2) * pol;
          const dx = Math.cos(ang) * 10;
          const dy = Math.sin(ang) * 10;
          g.beginPath();
          g.ellipse(cx, cy, 15, 9, ang, 0, Math.PI * 2);
          g.fillStyle = withAlpha(th.muted, 0.15);
          g.fill();
          text(g, '+', cx + dx, cy + dy, { font: `800 12px ${th.font}`, color: th.series[1]! });
          text(g, '−', cx - dx, cy - dy, { font: `800 12px ${th.font}`, color: th.series[0]! });
        }
      }
      // Ergebnis
      const ry = wide ? zr.y + zr.h + 30 : r.y + r.h - 30;
      const rx = wide ? zr.x : r.x + 20;
      text(g, tr('bLift', { r: fmt.num(ratio, ratio < 10 ? 2 : 0) }), rx, ry, { font: `700 13px ${th.font}`, color: th.text, align: 'left' });
      text(g, ctx.t(ratio >= 1 ? 'bJump' : 'bStay'), rx, ry + 18, { font: `700 13px ${th.font}`, color: ratio >= 1 ? th.series[2]! : th.muted, align: 'left' });
    }

    /* ---------- Gewitter ---------- */
    function drawStorm(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = r.w < 700;
      const ground = r.y + r.h * 0.78;
      const cloudY = r.y + 20 + (r.h * 0.3 * (p.hw - 1)) / 3;
      // Wolke
      const cw = r.w * 0.7;
      const cx = r.x + r.w / 2;
      g.fillStyle = withAlpha(th.muted, 0.55);
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        g.ellipse(cx - cw / 2 + (k + 0.5) * (cw / 6), cloudY + 26 + Math.sin(k * 2) * 6, cw / 9, 26, 0, 0, Math.PI * 2);
        g.fill();
      }
      const nM = Math.round(p.qw / 4);
      for (let k = 0; k < nM; k++) text(g, '−', cx - cw / 2 + ((k + 0.5) * cw) / nM, cloudY + 44, { font: `800 14px ${th.font}`, color: th.series[0]! });
      // Boden
      g.fillStyle = withAlpha(th.series[2]!, 0.25);
      g.fillRect(r.x, ground, r.w, r.y + r.h - ground);
      // Influenz am Boden: Pluszeichen
      for (let k = 0; k < 10; k++) text(g, '+', r.x + ((k + 0.5) * r.w) / 10, ground + 12, { font: `800 12px ${th.font}`, color: th.series[1]! });
      // Haus
      const hx = r.x + r.w * 0.58;
      const hw = Math.min(110, r.w * 0.2);
      const hh = 60;
      g.fillStyle = withAlpha(th.text, 0.7);
      g.fillRect(hx, ground - hh, hw, hh);
      g.beginPath();
      g.moveTo(hx - 8, ground - hh);
      g.lineTo(hx + hw / 2, ground - hh - 34);
      g.lineTo(hx + hw + 8, ground - hh);
      g.closePath();
      g.fill();
      const roofTop: [number, number] = [hx + hw / 2, ground - hh - 34];
      let rodTop: [number, number] = roofTop;
      if (p.stab) {
        rodTop = [roofTop[0], roofTop[1] - 40];
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(rodTop[0], rodTop[1]);
        g.lineTo(roofTop[0], roofTop[1]);
        g.lineTo(hx + hw + 8, ground - hh);
        g.lineTo(hx + hw + 8, ground);
        g.stroke();
      }
      // Baum
      const tx = r.x + r.w * 0.22;
      g.fillStyle = withAlpha(th.series[2]!, 0.8);
      g.beginPath();
      g.moveTo(tx, ground - 110);
      g.lineTo(tx - 30, ground - 30);
      g.lineTo(tx + 30, ground - 30);
      g.closePath();
      g.fill();
      g.fillStyle = withAlpha(th.text, 0.6);
      g.fillRect(tx - 5, ground - 30, 10, 30);
      const treeTop: [number, number] = [tx, ground - 110];
      // Feldstärke-Balken
      const st = strike(p.qw, p.hw * 1000, p.stab);
      const bx = r.x + 16;
      const bw = Math.min(r.w - 32, 380);
      const by = ground + 26;
      const frac = Math.min(1, st.field / (BREAKDOWN * 1.5));
      roundRect(g, bx, by, bw, 12, 6);
      g.fillStyle = withAlpha(th.muted, 0.25);
      g.fill();
      roundRect(g, bx, by, Math.max(12, bw * frac), 12, 6);
      g.fillStyle = st.target ? th.series[3]! : th.series[0]!;
      g.fill();
      const thrX = bx + bw / 1.5;
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(thrX, by - 4);
      g.lineTo(thrX, by + 16);
      g.stroke();
      const tipText = tr('gTip', { t: ctx.t(`gTip_${p.stab ? 'stab' : 'baum'}`), e: fmt.num(st.field / 1000, 0) });
      (narrow ? tipText.split(' – ') : [tipText]).forEach((pt, k) => text(g, pt, bx, by + 30 + k * 15, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.text, align: 'left' }));
      // Blitz (blinkt in regelmäßigen Abständen)
      if (st.target) {
        const flash = anim % 2.2 < 0.35;
        if (flash) {
          const target = st.target === 'stab' ? rodTop : st.target === 'baum' ? treeTop : roofTop;
          g.strokeStyle = th.series[4] ?? th.series[3]!;
          g.lineWidth = 4;
          g.beginPath();
          let x = target[0] + (cx - target[0]) * 0.3;
          let y = cloudY + 50;
          g.moveTo(x, y);
          const steps = 7;
          for (let k = 1; k <= steps; k++) {
            const f = k / steps;
            x = x + (target[0] - x) / (steps - k + 1) + (k < steps ? Math.sin(k * 3.1 + Math.floor(anim / 2.2)) * 18 : 0);
            y = cloudY + 50 + (target[1] - cloudY - 50) * f;
            g.lineTo(x, y);
          }
          g.stroke();
        }
        text(g, tr('gStrike', { t: ctx.t(`gTip_${st.target}`) }), r.x + r.w - 16, r.y + 18, { font: `800 14px ${th.font}`, color: th.series[3]!, align: 'right' });
      } else text(g, ctx.t('gNone'), r.x + r.w - 16, r.y + 18, { font: `700 14px ${th.font}`, color: th.muted, align: 'right' });
      text(g, `h = ${fmt.num(p.hw, 1)} km`, r.x + 16, cloudY + 70, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
    }

    return {
      update(changed, source) {
        if (changed.has('ma') || changed.has('mb') || changed.has('mode')) {
          rubs = 0;
          skop = 0;
        }
        if (source === 'init' || source === 'replace' || ['mode', 'sgn', 'd'].some((k) => changed.has(k))) {
          if (indState !== 1 || changed.has('mode') || changed.has('sgn')) {
            indState = 0;
            earthed = 0;
          }
        }
        if (source === 'init' || source === 'replace' || changed.has('qn')) {
          task = makeTask(p.qn);
          verdict = null;
          tries = 0;
          badInput = false;
        }
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'ueben' ? 'canvasQuiz' : p.mode === 'ballon' ? 'canvasB' : p.mode === 'gewitter' ? 'canvasG' : 'canvas'));
        setupPlot();
        updateReadouts();
      },
      action(id) {
        if (id === 'earth' || id === 'away' || id === 'reset' || id === 'check' || id === 'next') {
          if (id === 'earth' && indState === 0) {
            indState = 1;
            earthed = Math.round(10 * inducedCharge(1, p.d / 100));
          } else if (id === 'away') indState = indState === 1 ? 2 : indState === 0 ? 3 : 0;
          else if (id === 'reset') {
            indState = 0;
            earthed = 0;
          } else if (id === 'check') runCheck();
          else if (id === 'next') {
            ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
            return;
          }
          if (indState === 0) earthed = 0;
          updateReadouts();
          ctx.requestRender();
          return;
        }
        if (id === 'rub') rubs = Math.min(MAX_RUB, rubs + 1);
        else if (id === 'touch') {
          // Ein Teil der Ladung des Stabs geht aufs Elektroskop
          const c = charges();
          skop += Math.round(c.a / 2);
          rubs = Math.max(0, Math.round(rubs / 2));
        } else {
          rubs = 0;
          skop = 0;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        anim += dt;
        if (p.mode !== 'influenz' && p.mode !== 'ballon' && p.mode !== 'gewitter') ctx.clock.pause();
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        const full: Rect = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'ueben') {
          drawQuiz(surface.width, surface.height);
          return;
        }
        if (p.mode === 'ballon') return drawBalloon(full);
        if (p.mode === 'gewitter') return drawStorm(full);
        if (p.mode === 'influenz') {
          drawInfluenz(full);
          return;
        }
        if (p.mode === 'feld') {
          drawFeld(full);
          return;
        }
        if (p.mode === 'atom') {
          drawAtom(s.scene);
          drawChart();
          return;
        }
        if (p.mode === 'reiben') drawRub(full);
        else if (p.mode === 'skop') drawSkop(full);
        else {
          drawCoulomb(s.scene);
          drawChart();
        }
      },
      destroy: () => surface.destroy(),
    };
  },
});
