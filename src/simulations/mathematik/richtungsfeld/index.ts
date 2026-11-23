import { defineSimulation, drawCard, ease, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, Tween, withAlpha, type Rect } from '../../../sim-core';
import { derivation, detectModel, eulerTable, exact, exactText, fineCurve, parseTerm, solveIVP, system, type Fn3, type Method, type Model, type Sys,
  fallSpeed,
  herdImmunity,
  lvEquilibrium,
  quizRound,
  solveSys,
  sysRhs,
  terminalSpeed,
  type SysKind,
  type SysParams,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const METHODS: Method[] = ['euler', 'heun', 'rk4'];

/**
 * Richtungsfeld und Differenzialgleichungen: Zu y′ = f(x, y) zeigt die
 * Simulation das Richtungsfeld (Striche und fließende Teilchen), die
 * Lösungskurve durch einen ziehbaren Startpunkt und die Näherung mit Euler,
 * Heun oder Runge-Kutta im Vergleich zur exakten Lösung. Für Schwingungen
 * (2. Ordnung, y″ = f(x, y, y′)) kommt die Phasenebene (y, y′) dazu.
 */
export default defineSimulation({
  id: 'richtungsfeld',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.38 },
  groups: [
    { id: 'num', label: L('Näherungsverfahren', 'Numerical method') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'one', label: L('Eine Gleichung mit Richtungsfeld', 'One equation with direction field') },
        { value: 'sys', label: L('Systeme: Räuber-Beute, Epidemie, Fall', 'Systems: predator–prey, epidemic, fall') },
        { value: 'quiz', label: L('Rätsel: Welches Feld passt?', 'Puzzle: which field fits?') },
      ],
      default: 'one',
    },
    {
      key: 'sk',
      type: 'choice',
      label: L('System', 'System'),
      options: [
        { value: 'lv', label: L('Räuber und Beute (Lotka-Volterra)', 'Predator and prey (Lotka–Volterra)') },
        { value: 'sir', label: L('Epidemie (SIR-Modell)', 'Epidemic (SIR model)') },
        { value: 'fall', label: L('Fall mit Luftwiderstand', 'Fall with air resistance') },
      ],
      default: 'lv',
      visibleIf: (v) => v.view === 'sys',
    },
    { key: 'la', type: 'number', label: L('Vermehrung der Beute a', 'Prey growth a'), min: 0.2, max: 2, step: 0.05, default: 1, visibleIf: (v) => v.view === 'sys' && v.sk === 'lv' },
    { key: 'lc', type: 'number', label: L('Sterberate der Räuber c', 'Predator death rate c'), min: 0.2, max: 2, step: 0.05, default: 0.8, visibleIf: (v) => v.view === 'sys' && v.sk === 'lv' },
    { key: 'lx', type: 'number', label: L('Beute am Anfang', 'Prey at the start'), min: 5, max: 150, step: 1, default: 60, visibleIf: (v) => v.view === 'sys' && v.sk === 'lv' },
    { key: 'ly', type: 'number', label: L('Räuber am Anfang', 'Predators at the start'), min: 1, max: 60, step: 1, default: 5, visibleIf: (v) => v.view === 'sys' && v.sk === 'lv' },
    { key: 'r0', type: 'number', label: L('Ansteckungszahl R₀', 'Reproduction number R₀'), help: L('So viele steckt eine kranke Person im Mittel an, solange alle empfänglich sind.', 'How many people one sick person infects on average while everyone is susceptible.'), min: 0.5, max: 6, step: 0.1, default: 2.5, visibleIf: (v) => v.view === 'sys' && v.sk === 'sir' },
    { key: 'imm', type: 'number', label: L('Anteil schon Immuner', 'Share already immune'), min: 0, max: 90, step: 5, default: 0, unit: '%', visibleIf: (v) => v.view === 'sys' && v.sk === 'sir' },
    { key: 'kd', type: 'number', label: L('Luftwiderstand k', 'Air resistance k'), help: L('Pro Meter; Fallschirmspringer ohne Schirm etwa 0,004, mit Schirm etwa 0,3.', 'Per metre; skydiver without parachute about 0.004, with parachute about 0.3.'), min: 0.001, max: 0.4, step: 0.001, default: 0.004, visibleIf: (v) => v.view === 'sys' && v.sk === 'fall' },
    { key: 'qn', type: 'number', label: L('Runde', 'Round'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.view === 'quiz' },
    {
      key: 'qa',
      type: 'choice',
      label: L('Deine Wahl', 'Your choice'),
      options: [
        { value: '0', label: L('A', 'A') },
        { value: '1', label: L('B', 'B') },
        { value: '2', label: L('C', 'C') },
        { value: '3', label: L('D', 'D') },
      ],
      default: '0',
      visibleIf: (v) => v.view === 'quiz',
    },
    {
      key: 'order',
      type: 'choice',
      label: L('Art der Gleichung', 'Type of equation'),
      options: [
        { value: '1', label: L("1. Ordnung: y′ = f(x, y)", "1st order: y′ = f(x, y)") },
        { value: '2', label: L("2. Ordnung: y″ = f(x, y, y′)", "2nd order: y″ = f(x, y, y′)") },
      ],
      default: '1',
      visibleIf: (v) => v.view === 'one',
    },
    {
      key: 'f',
      type: 'text',
      label: L("Rechte Seite: y′ =", "Right side: y′ ="),
      default: '0,5·y',
      maxLength: 60,
      placeholder: L('z. B. 0,5·y oder x − y', 'e.g. 0.5·y or x − y'),
      help: L(
        'Variablen x (oder t) und y, Zahlen mit Komma, Funktionen sin, cos, exp, ln, sqrt. Malpunkte dürfen fehlen: 0,2y(10 − y).',
        'Variables x (or t) and y, decimals, functions sin, cos, exp, ln, sqrt. Multiplication dots may be omitted: 0.2y(10 − y).',
      ),
      visibleIf: (v) => v.view === 'one' && (v.order === '1'),
    },
    {
      key: 'f2',
      type: 'text',
      label: L('Rechte Seite: y″ =', 'Right side: y″ ='),
      default: "-4y - 0,5y'",
      maxLength: 60,
      placeholder: L("z. B. −4y − 0,5y′", "e.g. −4y − 0.5y′"),
      help: L("y′ schreibt man als y' oder v.", "Write y′ as y' or v."),
      visibleIf: (v) => v.view === 'one' && (v.order === '2'),
    },
    { key: 'x0', type: 'number', label: L('Startstelle x₀', 'Start x₀'), min: -20, max: 50, step: 0.1, default: 0, visibleIf: (v) => v.view === 'one' },
    { key: 'y0', type: 'number', label: L('Startwert y(x₀)', 'Start value y(x₀)'), min: -200, max: 200, step: 0.1, default: 2, visibleIf: (v) => v.view === 'one' },
    { key: 'v0', type: 'number', label: L('Startsteigung y′(x₀)', 'Initial slope y′(x₀)'), min: -20, max: 20, step: 0.1, default: 0, visibleIf: (v) => v.view === 'one' && (v.order === '2') },
    { key: 'x1', type: 'number', label: L('Vergleich an der Stelle x₁', 'Compare at x₁'), min: -20, max: 60, step: 0.1, default: 2, visibleIf: (v) => v.view === 'one' },
    {
      key: 'method',
      type: 'choice',
      group: 'num',
      label: L('Verfahren', 'Method'),
      options: [
        { value: 'euler', label: L('Euler (Tangente)', 'Euler (tangent)') },
        { value: 'heun', label: L('Heun (Mittel zweier Steigungen)', 'Heun (average of two slopes)') },
        { value: 'rk4', label: L('Runge-Kutta (4 Steigungen)', 'Runge–Kutta (4 slopes)') },
        { value: 'none', label: L('keins', 'none') },
      ],
      default: 'euler',
      visibleIf: (v) => v.view === 'one',
    },
    { key: 'h', type: 'number', group: 'num', label: L('Schrittweite h', 'Step size h'), min: 0.05, max: 2, step: 0.05, default: 0.5, visibleIf: (v) => v.view === 'one' },
    { key: 'field', type: 'boolean', group: 'view', label: L('Richtungsfeld', 'Direction field'), default: true, visibleIf: (v) => v.view === 'one' },
    { key: 'flow', type: 'boolean', group: 'view', label: L('Fließende Teilchen', 'Flowing particles'), default: true, visibleIf: (v) => v.view === 'one' },
    { key: 'family', type: 'boolean', group: 'view', label: L('Weitere Lösungskurven', 'More solution curves'), default: false, visibleIf: (v) => v.view === 'one' },
    {
      key: 'card',
      type: 'choice',
      group: 'view',
      label: L('Rechts in der Karte', 'Side card'),
      options: [
        { value: 'compare', label: L('Verfahren vergleichen', 'Compare methods') },
        { value: 'derive', label: L('Rechenweg (exakte Lösung)', 'Derivation (exact solution)') },
      ],
      default: 'compare',
      visibleIf: (v) => v.view === 'one',
    },
    { key: 'iso', type: 'boolean', group: 'view', label: L('Waagerechte Stellen (f = 0)', 'Horizontal slopes (f = 0)'), default: false, visibleIf: (v) => v.view === 'one' && (v.order === '1') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösungskurve zeigen', 'Show solution curve'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'qcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.view === 'quiz' },
    { id: 'qnext', label: L('Nächste Runde', 'Next round'), visibleIf: (v) => v.view === 'quiz' },
    { id: 'replay', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.view === 'sys' },
  ],
  readouts: [
    { key: 'type', label: L('Typ', 'Type') },
    { key: 'sol', label: L('Exakte Lösung', 'Exact solution'), spoiler: true },
    { key: 'num', label: L('Näherung an der Stelle x₁', 'Approximation at x₁'), spoiler: true },
    { key: 'err', label: L('Abweichung', 'Error'), spoiler: true },
  ],
  presets: [
    { id: 'growth', label: L("Wachstum y′ = 0,5·y (Euler, h = 0,5)", "Growth y′ = 0.5·y (Euler, h = 0.5)"), values: { order: '1', f: '0,5·y', x0: 0, y0: 2, x1: 2, method: 'euler', h: 0.5 } },
    { id: 'decay', label: L("Zerfall y′ = −0,2·y", "Decay y′ = −0.2·y"), values: { order: '1', f: '-0,2·y', x0: 0, y0: 8, x1: 10, method: 'heun', h: 1 } },
    { id: 'cool', label: L("Abkühlung y′ = 0,1·(20 − y)", "Cooling y′ = 0.1·(20 − y)"), values: { order: '1', f: '0,1·(20 - y)', x0: 0, y0: 90, x1: 30, method: 'euler', h: 2, family: true } },
    { id: 'logistic', label: L("Logistisch y′ = 0,05·y·(10 − y)", "Logistic y′ = 0.05·y·(10 − y)"), values: { order: '1', f: '0,05·y·(10 - y)', x0: 0, y0: 0.5, x1: 15, method: 'rk4', h: 1, family: true } },
    { id: 'xy', label: L("y′ = x − y (ohne Formel)", "y′ = x − y (no formula)"), values: { order: '1', f: 'x - y', x0: -2, y0: 3, x1: 3, method: 'euler', h: 0.5, family: true, iso: true } },
    { id: 'circle', label: L("Kreise: y′ = −x / y", "Circles: y′ = −x / y"), values: { order: '1', f: '-x/y', x0: 0, y0: 3, x1: 2, method: 'euler', h: 0.2, iso: true } },
    { id: 'blow', label: L("y′ = y² – Lösung explodiert", "y′ = y² – solution blows up"), values: { order: '1', f: 'y^2', x0: 0, y0: 1, x1: 0.9, method: 'rk4', h: 0.1 } },
    { id: 'antideriv', label: L("y′ = 2x − 1: Stammfunktionen", "y′ = 2x − 1: antiderivatives"), values: { order: '1', f: '2x - 1', x0: 0, y0: 1, x1: 2, method: 'euler', h: 0.5, family: true } },
    { id: 'derive', label: L('Rechenweg: logistisches Wachstum', 'Derivation: logistic growth'), values: { order: '1', f: '0,05·y·(10 - y)', x0: 0, y0: 0.5, x1: 15, method: 'none', card: 'derive', family: true } },
    { id: 'osc', label: L("Schwingung y″ = −4y", "Oscillation y″ = −4y"), values: { order: '2', f2: '-4y', x0: 0, y0: 2, v0: 0, x1: 6, method: 'euler', h: 0.1 } },
    { id: 'damped', label: L("Gedämpft y″ = −4y − 0,5y′", "Damped y″ = −4y − 0.5y′"), values: { order: '2', f2: "-4y - 0,5y'", x0: 0, y0: 2, v0: 0, x1: 8, method: 'rk4', h: 0.2 } },
    { id: 'lv', label: L('Räuber und Beute: Zyklen', 'Predator and prey: cycles'), values: { view: 'sys', sk: 'lv', la: 1, lc: 0.8, lx: 60, ly: 5 } },
    { id: 'sir', label: L('Epidemie mit R₀ = 2,5', 'Epidemic with R₀ = 2.5'), values: { view: 'sys', sk: 'sir', r0: 2.5, imm: 0 } },
    { id: 'sir2', label: L('Epidemie: 60 % geimpft', 'Epidemic: 60 % vaccinated'), values: { view: 'sys', sk: 'sir', r0: 2.5, imm: 60 } },
    { id: 'fall', label: L('Fallschirmsprung: Endgeschwindigkeit', 'Skydive: terminal velocity'), values: { view: 'sys', sk: 'fall', kd: 0.004 } },
    { id: 'quiz', label: L('Rätsel: Feld und Gleichung zuordnen', 'Puzzle: match field and equation'), values: { view: 'quiz', qn: 1, qa: '0' } },
    { id: 'creep', label: L("Kriechfall y″ = −4y − 5y′", "Overdamped y″ = −4y − 5y′"), values: { order: '2', f2: "-4y - 5y'", x0: 0, y0: 2, v0: 0, x1: 6, method: 'rk4', h: 0.2 } },
  ],
  strings: {
    de: {
      lvT: 'Räuber und Beute (Lotka-Volterra)',
      lvG: 'Viel Beute → die Räuber vermehren sich → die Beute wird weniger → die Räuber hungern → die Beute erholt sich. Im Phasenbild ergibt das geschlossene Bahnen um das Gleichgewicht.',
      lvEq: 'Gleichgewicht: {x} Beutetiere, {y} Räuber',
      prey: 'Beute',
      pred: 'Räuber',
      sirT: 'Epidemie (SIR-Modell)',
      sirG: 'S: empfänglich, I: infiziert, R: genesen. Die Zahl der Infizierten sinkt, sobald weniger als N/R₀ empfänglich sind. Mit genug Immunen beginnt die Welle gar nicht erst.',
      sirPeak: 'Höchstens {i} gleichzeitig krank (Tag {d})',
      sirHerd: 'Herdenimmunität ab {h} immun',
      sirTotal: 'Insgesamt erkrankt: {t}',
      fallT: 'Fall mit Luftwiderstand',
      fallG: 'Je schneller, desto größer die Reibung k·v². Bei der Endgeschwindigkeit ist sie so groß wie die Gewichtskraft: Die Geschwindigkeit wächst nicht mehr.',
      fallVt: 'Endgeschwindigkeit √(g/k) = {v} m/s ≈ {kmh} km/h',
      fall5: 'nach 5 s: {v} m/s (ohne Luft: 49 m/s)',
      time: 't in Tagen',
      timeS: 't in s',
      timeY: 't in Jahren',
      quizT: 'Welches Richtungsfeld gehört zu',
      quizHow: 'Tippe auf A, B, C oder D und dann auf „Prüfen“.',
      quizOk: 'Richtig!',
      quizNo: 'Leider nein – es ist {c}.',
      quizScore: '{k} von {n} richtig',
      quizHint: 'Tipp: Wo ist die Steigung 0? Hängt sie nur von x oder nur von y ab? Wo ist sie positiv?',
      canvas: 'Richtungsfeld der Differenzialgleichung mit fließenden Teilchen, Lösungskurve durch den ziehbaren Startpunkt und Näherung mit dem gewählten Verfahren.',
      eq1: "y′ =",
      eq2: "y″ =",
      start: 'Start',
      exp: 'Exponentielles Wachstum',
      decay: 'Exponentieller Zerfall',
      bounded: 'Beschränktes Wachstum (Schranke {S})',
      logistic: 'Logistisches Wachstum (Schranke {S})',
      linear: 'Nur von x abhängig: Lösungen sind Stammfunktionen',
      osc: 'Ungedämpfte Schwingung (ω = {w})',
      damped: 'Gedämpfte Schwingung',
      creep: 'Kriechfall (keine Schwingung)',
      limit: 'Aperiodischer Grenzfall',
      other: 'Keine Lösungsformel aus der Schule – Näherung und Feld helfen.',
      compare: 'Vergleich bei x₁ = {x}',
      exact: 'exakt',
      fine: 'genau',
      dev: 'Abweichung',
      steps: 'Erste Euler-Schritte: y(n+1) = y(n) + h · f(x(n), y(n))',
      phase: 'Phasenebene: y nach rechts, y′ nach oben',
      parseErr: 'Der Term lässt sich ab Zeichen {p} nicht lesen.',
      parseEmpty: 'Bitte eine rechte Seite eingeben, z. B. 0,5·y.',
      stopped: 'Die Lösung wächst über alle Grenzen – sie existiert nur bis kurz vor x ≈ {x}.',
      none: '–',
      hidden: 'verdeckt',
      tipEuler: 'Euler geht immer ein Stück h auf der Tangente weiter – bei gekrümmten Lösungen landet er daneben.',
      tipHeun: 'Heun mittelt die Steigung am Anfang und am Ende des Schritts.',
      tipRk4: 'Runge-Kutta mittelt vier Steigungen – meist kaum vom Exakten zu unterscheiden.',
      sep: 'Rechenweg: Trennung der Variablen',
      ansatzHead: 'Rechenweg: Exponentialansatz',
      antiHead: 'Rechenweg: Stammfunktion bilden',
      noDerive: 'Für diese Gleichung gibt es keinen Rechenweg aus der Schule. Die Lösungskurve kommt aus einer sehr feinen Näherung.',
      triH: 'h',
      triM: 'h · f',
    },
    en: {
      lvT: 'Predator and prey (Lotka–Volterra)',
      lvG: 'Lots of prey → predators multiply → prey decreases → predators starve → prey recovers. In the phase plane this gives closed orbits around the equilibrium.',
      lvEq: 'equilibrium: {x} prey, {y} predators',
      prey: 'prey',
      pred: 'predators',
      sirT: 'Epidemic (SIR model)',
      sirG: 'S: susceptible, I: infected, R: recovered. The number of infected falls once fewer than N/R₀ are susceptible. With enough immune people, the wave does not even start.',
      sirPeak: 'at most {i} ill at the same time (day {d})',
      sirHerd: 'herd immunity from {h} immune',
      sirTotal: 'ill in total: {t}',
      fallT: 'Fall with air resistance',
      fallG: 'The faster, the larger the friction k·v². At terminal velocity it equals the weight: the speed stops increasing.',
      fallVt: 'terminal velocity √(g/k) = {v} m/s ≈ {kmh} km/h',
      fall5: 'after 5 s: {v} m/s (without air: 49 m/s)',
      time: 't in days',
      timeS: 't in s',
      timeY: 't in years',
      quizT: 'Which direction field belongs to',
      quizHow: 'Tap A, B, C or D, then “Check”.',
      quizOk: 'Correct!',
      quizNo: 'Sorry, no – it is {c}.',
      quizScore: '{k} of {n} correct',
      quizHint: 'Hint: where is the slope 0? Does it depend only on x or only on y? Where is it positive?',
      canvas: 'Direction field of the differential equation with flowing particles, the solution curve through the draggable start point and the approximation with the chosen method.',
      eq1: "y′ =",
      eq2: "y″ =",
      start: 'Start',
      exp: 'Exponential growth',
      decay: 'Exponential decay',
      bounded: 'Bounded growth (limit {S})',
      logistic: 'Logistic growth (limit {S})',
      linear: 'Depends on x only: solutions are antiderivatives',
      osc: 'Undamped oscillation (ω = {w})',
      damped: 'Damped oscillation',
      creep: 'Overdamped (no oscillation)',
      limit: 'Critically damped',
      other: 'No closed formula from school – the approximation and the field help.',
      compare: 'Comparison at x₁ = {x}',
      exact: 'exact',
      fine: 'accurate',
      dev: 'error',
      steps: 'First Euler steps: y(n+1) = y(n) + h · f(x(n), y(n))',
      phase: 'Phase plane: y to the right, y′ upwards',
      parseErr: 'The term cannot be read from character {p} on.',
      parseEmpty: 'Please enter a right side, e.g. 0.5·y.',
      stopped: 'The solution grows beyond all bounds – it only exists up to about x ≈ {x}.',
      none: '–',
      hidden: 'hidden',
      tipEuler: 'Euler always moves a step h along the tangent – on curved solutions it ends up off the curve.',
      tipHeun: 'Heun averages the slopes at the start and the end of the step.',
      tipRk4: 'Runge–Kutta averages four slopes – usually hard to tell apart from the exact solution.',
      sep: 'Derivation: separation of variables',
      ansatzHead: 'Derivation: exponential ansatz',
      antiHead: 'Derivation: antiderivative',
      noDerive: 'There is no school method for this equation. The solution curve comes from a very fine approximation.',
      triH: 'h',
      triM: 'h · f',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 3) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 5e-13 ? 0 : v, d) : '–');
    const reduced = prefersReducedMotion();

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const order = (): 1 | 2 => (p.order === '2' ? 2 : 1);
    type Eq = { ok: true; f: Fn3; F: Sys; model: Model | null } | { ok: false; msg: string };
    let eq: Eq = read();

    function read(): Eq {
      const src = order() === 1 ? p.f : p.f2;
      const r = parseTerm(src);
      if (!r.ok) return { ok: false, msg: r.msg === 'empty' ? tr('parseEmpty') : tr('parseErr', { p: r.pos + 1 }) };
      return { ok: true, f: r.f, F: system(r.f, order()), model: detectModel(r.f, order(), r.uses) };
    }

    const method = (): Method | null => (p.method === 'none' ? null : (p.method as Method));
    const start = (): number[] => (order() === 1 ? [p.y0] : [p.y0, p.v0]);

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    /** Lösungskurve wird von x₀ aus gezeichnet. */
    const drawTw = new Tween(1300, ease.outCubic);
    /** Näherung baut sich Schritt für Schritt auf. */
    const stepTw = new Tween(1600, ease.linear);
    drawTw.play();
    stepTw.play();

    /** Fließende Teilchen (Weltkoordinaten) mit Alter. */
    interface Particle {
      x: number;
      y: number;
      age: number;
      life: number;
      trail: [number, number][];
    }
    let particles: Particle[] = [];
    let lastT = performance.now();

    /* -------------------------------------------------------------- */
    /* Layout                                                          */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { plot: Rect; card: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide() || (p.view !== 'one' && w > h * 1.3)) {
        const pw = Math.round(w * (wide() ? 0.62 : 0.56));
        return { plot: { x: pad, y: pad, w: pw - pad, h: h - 2 * pad }, card: { x: pw + pad, y: pad, w: w - pw - 2 * pad, h: h - 2 * pad } };
      }
      const ph = Math.round(h * (p.view === 'one' ? 0.5 : p.view === 'sys' ? 0.6 : 0.58));
      return { plot: { x: pad, y: pad, w: w - 2 * pad, h: ph }, card: { x: pad, y: ph + 2 * pad, w: w - 2 * pad, h: h - ph - 3 * pad } };
    }

    let plotRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    let phaseRect: Rect = { x: -100, y: -100, w: 10, h: 10 };
    const plot = new Plot(surface, {
      x: [-1, 5],
      y: [-1, 8],
      equalAspect: false,
      region: () => ({ x: plotRect.x + 4, y: plotRect.y + 4, w: plotRect.w - 8, h: plotRect.h - 8 }),
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });
    const phase = new Plot(surface, {
      x: [-3, 3],
      y: [-6, 6],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => phaseRect,
      xAxis: { label: 'y' },
      yAxis: { label: "y′" },
    });

    /* -------------------------------------------------------------- */
    /* Farben                                                          */
    /* -------------------------------------------------------------- */

    const COL = {
      sol: () => th().series[0]!,
      num: () => th().series[1]!,
      fam: () => th().series[5]!,
      field: () => withAlpha(th().text, th().dark ? 0.42 : 0.38),
      iso: () => th().series[3]!,
      start: () => th().series[4]!,
      good: () => th().series[2]!,
    };
    const methodColor = (m: Method) => (m === 'euler' ? th().series[1]! : m === 'heun' ? th().series[3]! : th().series[2]!);

    /* -------------------------------------------------------------- */
    /* Bereich                                                         */
    /* -------------------------------------------------------------- */

    /** Sichtbaren Bereich passend zu Startpunkt, x₁ und Lösung wählen. */
    function fitRange(): void {
      const xa = Math.min(p.x0, p.x1);
      const xb = Math.max(p.x0, p.x1);
      const span = Math.max(2, xb - xa);
      const x0 = xa - span * 0.35;
      const x1 = xb + span * 0.35;
      if (!eq.ok) return plot.setRange([x0, x1], [-5, 5]);
      const c = fineCurve(eq.F, p.x0, start(), x0, x1, Math.max(0.002, (x1 - x0) / 800), 1e4);
      const ys = c.s.map((s) => s[0]!).filter(Number.isFinite);
      ys.push(p.y0, 0);
      const m = method();
      if (m) for (const s of solveIVP(eq.F, m, p.x0, start(), p.x1, p.h, 1e4).s) ys.push(s[0]!);
      ys.sort((a, b) => a - b);
      let lo = ys[Math.floor(ys.length * 0.02)]!;
      let hi = ys[Math.floor(ys.length * 0.98)]!;
      lo = Math.min(lo, p.y0, 0);
      hi = Math.max(hi, p.y0, 0);
      if (hi - lo < 2) {
        hi += 1;
        lo -= 1;
      }
      if (hi - lo > 400) hi = lo + 400;
      const pad = (hi - lo) * 0.14;
      plot.setRange([x0, x1], [lo - pad, hi + pad]);
    }
    fitRange();

    function fitPhase(): void {
      if (!eq.ok || order() !== 2) return;
      const c = solveIVP(eq.F, 'rk4', p.x0, start(), p.x0 + 30, 0.02, 1e4);
      let ym = 1;
      let vm = 1;
      for (const s of c.s) {
        ym = Math.max(ym, Math.abs(s[0]!));
        vm = Math.max(vm, Math.abs(s[1]!));
      }
      phase.setRange([-ym * 1.25, ym * 1.25], [-vm * 1.25, vm * 1.25]);
    }
    fitPhase();

    // Ziehbarer Startpunkt
    plot.addHandle({
      get: () => [p.x0, p.y0],
      set: (x, y) => ctx.set({ x0: Math.round(clamp(x, -20, 50) * 10) / 10, y0: Math.round(clamp(y, -200, 200) * 10) / 10 }),
      enabled: () => !ctx.locked && p.view === 'one',
      color: () => COL.start(),
      axis: 'both',
    });
    // 2. Ordnung: Anfangssteigung über einen Punkt auf der Tangente
    plot.addHandle({
      get: () => {
        const b = plot.bounds;
        const dx = (b.xMax - b.xMin) * 0.12;
        return [p.x0 + dx, p.y0 + p.v0 * dx];
      },
      set: (x, y) => {
        const dx = x - p.x0;
        if (Math.abs(dx) < 1e-6) return;
        ctx.set({ v0: Math.round(clamp((y - p.y0) / dx, -20, 20) * 10) / 10 });
      },
      enabled: () => !ctx.locked && p.view === 'one' && order() === 2,
      color: () => COL.start(),
      axis: 'both',
    });
    // x₁ auf der x-Achse
    plot.addHandle({
      get: () => [p.x1, plot.bounds.yMin + (plot.bounds.yMax - plot.bounds.yMin) * 0.04],
      set: (x) => ctx.set({ x1: Math.round(clamp(x, -20, 60) * 10) / 10 }),
      enabled: () => !ctx.locked && p.view === 'one' && !!method(),
      color: () => COL.num(),
      axis: 'x',
    });

    /* -------------------------------------------------------------- */
    /* Zeichnen: Feld, Teilchen, Kurven                                */
    /* -------------------------------------------------------------- */

    /** Steigung im Feld (1. Ordnung). */
    const slope = (x: number, y: number) => (eq.ok ? eq.f(x, y, 0) : NaN);

    function drawField(): void {
      if (!eq.ok || !p.field || order() !== 1) return;
      const b = plot.bounds;
      const R = plot.rect;
      const nx = clamp(Math.round(R.w / 34), 8, 30);
      const ny = clamp(Math.round(R.h / 34), 6, 24);
      const sx = R.w / (b.xMax - b.xMin);
      const sy = R.h / (b.yMax - b.yMin);
      const len = Math.min(R.w / nx, R.h / ny) * 0.36;
      for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
          const x = b.xMin + ((i + 0.5) * (b.xMax - b.xMin)) / nx;
          const y = b.yMin + ((j + 0.5) * (b.yMax - b.yMin)) / ny;
          const m = slope(x, y);
          if (!Number.isFinite(m)) continue;
          // Richtung in Pixeln (y nach oben)
          const dx = sx;
          const dy = m * sy;
          const l = Math.hypot(dx, dy);
          const ux = (dx / l) * len;
          const uy = (dy / l) * len;
          const [px, py] = plot.toPx(x, y);
          const g = surface.g;
          g.strokeStyle = COL.field();
          g.lineWidth = 1.6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(px - ux, py + uy);
          g.lineTo(px + ux, py - uy);
          g.stroke();
        }
      }
    }

    function spawn(b: { xMin: number; xMax: number; yMin: number; yMax: number }): Particle {
      return {
        x: b.xMin + Math.random() * (b.xMax - b.xMin),
        y: b.yMin + Math.random() * (b.yMax - b.yMin),
        age: 0,
        life: 60 + Math.random() * 90,
        trail: [],
      };
    }

    function stepParticles(dt: number): void {
      if (!eq.ok || !p.flow || order() !== 1 || reduced) {
        particles = [];
        return;
      }
      const b = plot.bounds;
      const R = plot.rect;
      const want = clamp(Math.round((R.w * R.h) / 2600), 60, 320);
      while (particles.length < want) {
        const q = spawn(b);
        q.age = Math.random() * q.life;
        particles.push(q);
      }
      if (particles.length > want) particles.length = want;
      const sx = R.w / (b.xMax - b.xMin);
      const sy = R.h / (b.yMax - b.yMin);
      const speed = 42 * dt; // Pixel je Sekunde → Schritt
      for (let k = 0; k < particles.length; k++) {
        const q = particles[k]!;
        const m = slope(q.x, q.y);
        q.age += dt * 60;
        const out = q.x < b.xMin || q.x > b.xMax || q.y < b.yMin || q.y > b.yMax;
        if (!Number.isFinite(m) || q.age > q.life || out) {
          particles[k] = spawn(b);
          continue;
        }
        // in Pixeln gleich schnell, Richtung (1, m) nach rechts
        const dxp = sx;
        const dyp = m * sy;
        const l = Math.hypot(dxp, dyp);
        q.trail.push([q.x, q.y]);
        if (q.trail.length > 9) q.trail.shift();
        q.x += ((dxp / l) * speed) / sx;
        q.y += ((dyp / l) * speed) / sy;
      }
    }

    function drawParticles(): void {
      if (!particles.length) return;
      const g = surface.g;
      const col = th().series[0]!;
      g.save();
      g.lineCap = 'round';
      for (const q of particles) {
        const fade = Math.min(1, q.age / 12, (q.life - q.age) / 18);
        if (fade <= 0 || q.trail.length < 2) continue;
        g.strokeStyle = withAlpha(col, 0.55 * fade);
        g.lineWidth = 1.8;
        g.beginPath();
        q.trail.forEach(([x, y], i) => {
          const [px, py] = plot.toPx(x, y);
          if (i) g.lineTo(px, py);
          else g.moveTo(px, py);
        });
        const [hx, hy] = plot.toPx(q.x, q.y);
        g.lineTo(hx, hy);
        g.stroke();
      }
      g.restore();
    }

    /** Waagerechte Stellen: f(x, y) = 0 (Nullisokline) als feine Punkte. */
    function drawIso(): void {
      if (!eq.ok || !p.iso || order() !== 1) return;
      const b = plot.bounds;
      const R = plot.rect;
      const nx = Math.round(R.w / 3);
      const ny = Math.round(R.h / 3);
      const g = surface.g;
      g.fillStyle = withAlpha(COL.iso(), 0.85);
      // Vorzeichenwechsel zwischen Nachbarn → Punkt
      const val = (i: number, j: number) => slope(b.xMin + ((b.xMax - b.xMin) * i) / nx, b.yMin + ((b.yMax - b.yMin) * j) / ny);
      let prevRow: number[] = [];
      for (let i = 0; i <= nx; i++) {
        const row: number[] = [];
        for (let j = 0; j <= ny; j++) {
          const v = val(i, j);
          row.push(v);
          const up = j > 0 ? row[j - 1]! : NaN;
          const left = i > 0 ? prevRow[j]! : NaN;
          // Vorzeichenwechsel, aber keine Polstelle (dort wird |f| in der Mitte groß)
          const cross = (a: number, ia: number, ja: number) => {
            if (!Number.isFinite(a) || a * v > 0 || a === v) return false;
            const mid = slope(b.xMin + ((b.xMax - b.xMin) * (i + ia) * 0.5) / nx, b.yMin + ((b.yMax - b.yMin) * (j + ja) * 0.5) / ny);
            return Number.isFinite(mid) && Math.abs(mid) <= Math.max(Math.abs(a), Math.abs(v)) * 1.01;
          };
          if ((j > 0 && cross(up, i, j - 1)) || (i > 0 && cross(left, i - 1, j))) {
            const [px, py] = plot.toPx(b.xMin + ((b.xMax - b.xMin) * i) / nx, b.yMin + ((b.yMax - b.yMin) * j) / ny);
            g.fillRect(px - 1.1, py - 1.1, 2.2, 2.2);
          }
        }
        prevRow = row;
      }
    }

    /** Feine Lösungskurve (RK4) als Punktliste im Bildbereich. */
    function curve(x0: number, s0: number[]): { x: number[]; y: number[] } {
      if (!eq.ok) return { x: [], y: [] };
      const b = plot.bounds;
      const h = Math.max(0.002, (b.xMax - b.xMin) / 700);
      const lim = Math.max(Math.abs(b.yMin), Math.abs(b.yMax)) * 40 + 10;
      const c = fineCurve(eq.F, x0, s0, b.xMin, b.xMax, h, lim);
      return { x: c.x, y: c.s.map((s) => s[0]!) };
    }

    function drawCurves(): void {
      if (!eq.ok) return;
      const t = th();
      const b = plot.bounds;
      // weitere Lösungen (Schar)
      if (p.family) {
        const n = 9;
        for (let k = 0; k < n; k++) {
          const yS = b.yMin + ((k + 0.5) * (b.yMax - b.yMin)) / n;
          const s0 = order() === 1 ? [yS] : [yS, 0];
          const c = curve(p.x0, s0);
          plot.polyline(
            c.x.map((x, i) => [x, c.y[i]!] as [number, number]),
            { color: withAlpha(COL.fam(), 0.55), width: 1.5 },
          );
        }
      }
      // Lösungskurve durch den Startpunkt (wird von x₀ aus nach beiden Seiten gezeichnet)
      if (p.show) {
        const c = curve(p.x0, start());
        const reach = drawTw.value * (b.xMax - b.xMin);
        const pts = c.x.map((x, i) => [x, c.y[i]!] as [number, number]).filter(([x]) => Math.abs(x - p.x0) <= reach);
        plot.polyline(pts, { color: COL.sol(), width: 3 });
        // Abbruch (Polstelle)
        const last = c.x.at(-1)!;
        if (last < b.xMax - 1e-6 && drawTw.value >= 0.999) {
          plot.vline(last, { color: withAlpha(t.text, 0.4), width: 1.2, dash: [4, 4] });
        }
      }
      // Näherung
      const m = method();
      if (m) {
        const tr0 = solveIVP(eq.F, m, p.x0, start(), p.x1, p.h, Math.max(Math.abs(b.yMin), Math.abs(b.yMax)) * 50 + 10);
        const n = tr0.x.length;
        const shown = Math.max(1, Math.ceil(stepTw.value * (n - 1)) + 1);
        const col = methodColor(m);
        const pts = tr0.x.slice(0, shown).map((x, i) => [x, tr0.s[i]![0]!] as [number, number]);
        // Euler: Tangentenstücke sichtbar machen
        plot.polyline(pts, { color: col, width: 2.2, dash: m === 'euler' ? undefined : [7, 4] });
        for (const [x, y] of pts) plot.point(x, y, { color: col, radius: 3.4 });
        // Steigungsdreieck am jeweils neuesten Euler-Schritt (1. Ordnung)
        if (m === 'euler' && order() === 1 && pts.length >= 2) {
          const [xa, ya] = pts[pts.length - 2]!;
          const [xb, yb] = pts[pts.length - 1]!;
          plot.segment([xa, ya], [xb, ya], { color: withAlpha(col, 0.75), width: 1.6 });
          plot.segment([xb, ya], [xb, yb], { color: withAlpha(col, 0.75), width: 1.6 });
          plot.text((xa + xb) / 2, ya, tr('triH'), { color: col, size: 11, weight: '600', offset: [0, yb >= ya ? 11 : -11], halo: true, math: true });
          if (Math.abs(yb - ya) > 1e-9) plot.text(xb, (ya + yb) / 2, tr('triM'), { color: col, size: 11, weight: '600', offset: [6, 0], align: 'left', halo: true });
        }
        if (shown >= n && n > 1) {
          const [xe, ye] = pts[pts.length - 1]!;
          const exY = exactAt(p.x1);
          if (exY !== null && Number.isFinite(exY) && p.show) {
            plot.segment([xe, ye], [xe, exY], { color: withAlpha(col, 0.6), width: 1.4, dash: [3, 3] });
            plot.text(xe, (ye + exY) / 2, `Δ = ${N(Math.abs(exY - ye), 3)}`, { color: col, size: 12, weight: 'bold', offset: [8, 0], align: 'left', halo: true });
          }
        }
      }
      // x₁-Linie
      if (m) plot.vline(p.x1, { color: withAlpha(COL.num(), 0.35), width: 1, dash: [2, 5] });
      // Startpunkt-Beschriftung und Tangente (2. Ordnung)
      if (order() === 2) {
        const dx = (b.xMax - b.xMin) * 0.12;
        plot.segment([p.x0 - dx * 0.4, p.y0 - p.v0 * dx * 0.4], [p.x0 + dx, p.y0 + p.v0 * dx], { color: withAlpha(COL.start(), 0.8), width: 2 });
      }
      plot.text(p.x0, p.y0, `(${N(p.x0, 2)} | ${N(p.y0, 2)})`, { color: COL.start(), size: 12, weight: 'bold', offset: [10, -14], align: 'left', halo: true });
    }

    /** Wert der exakten (oder genauen) Lösung an der Stelle x. */
    function exactAt(x: number): number | null {
      if (!eq.ok) return null;
      if (eq.model) return exact(eq.model, p.x0, p.y0, p.v0)(x);
      const fine = solveIVP(eq.F, 'rk4', p.x0, start(), x, 0.001, 1e9);
      return fine.stopped ? null : fine.s.at(-1)![0]!;
    }

    function drawPlot(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      plotRect = R;
      drawCard(g, R, t);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      if (eq.ok) {
        drawField();
        drawParticles();
        drawIso();
        drawCurves();
      }
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${z}px ${th().font}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 10.5 && width(s) > maxW) s -= 0.5;
      g.save();
      g.globalAlpha *= alpha;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of g.measureText(sg.s).width > maxW * 0.5 ? sg.s.split(/(?<= )/) : [sg.s]) {
          const w = g.measureText(wd).width;
          if (cx + w > x + maxW && cx > x + 20) {
            cx = x + 12;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += w;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    function typeText(): string {
      if (!eq.ok) return eq.msg;
      const m = eq.model;
      if (!m) return tr('other');
      switch (m.kind) {
        case 'exp':
          return m.k >= 0 ? `${tr('exp')} (k = ${N(m.k)})` : `${tr('decay')} (k = ${N(m.k)})`;
        case 'bounded':
          return tr('bounded', { S: N(m.S) });
        case 'logistic':
          return tr('logistic', { S: N(m.S) });
        case 'linear':
          return tr('linear');
        case 'oscillation': {
          const disc = m.delta * m.delta - m.omega * m.omega;
          if (Math.abs(m.delta) < 1e-12) return tr('osc', { w: N(m.omega) });
          return Math.abs(disc) < 1e-12 ? tr('limit') : disc < 0 ? tr('damped') : tr('creep');
        }
      }
    }

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.sol());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], dz: number) => {
        y += segLine(g, segs, x, y, maxW, size + dz);
      };
      if (p.view === 'sys') {
        const kind = p.sk as SysKind;
        if (!sysRun) computeSys();
        const run = sysRun!;
        if (kind === 'lv') {
          const [ex, ey] = lvEquilibrium(sysP());
          line([{ s: ctx.t('lvT'), c: th().series[4]!, w: 800 }], 0);
          line([{ s: `x′ = ${N(p.la, 2)}·x − 0,1·x·y`, w: 700 }], -0.5);
          line([{ s: `y′ = −${N(p.lc, 2)}·y + 0,02·x·y`, w: 700 }], -0.5);
          line([{ s: tr('lvEq', { x: N(ex, 1), y: N(ey, 1) }), c: th().muted, w: 600 }], -1.5);
          y += 4;
          line([{ s: ctx.t('lvG'), c: th().muted }], -2);
        } else if (kind === 'sir') {
          let iMax = 0;
          let dMax = 0;
          run.s.forEach((q, i) => {
            if (q[1]! > iMax) {
              iMax = q[1]!;
              dMax = run.t[i]!;
            }
          });
          const last = run.s.at(-1)!;
          line([{ s: ctx.t('sirT'), c: th().series[1]!, w: 800 }], 0);
          line([{ s: `S′ = −β·S·I/N,  I′ = β·S·I/N − γ·I,  R′ = γ·I`, w: 700 }], -1.5);
          line([{ s: `β = R₀·γ = ${N(p.r0 * 0.1, 3)},  γ = 0,1 (10 ${ctx.lang === 'de' ? 'Tage krank' : 'days ill'})`, c: th().muted }], -1.5);
          if (p.show) {
            line([{ s: tr('sirPeak', { i: N(iMax, 0), d: N(dMax, 0) }), c: th().series[1]!, w: 700 }], -1);
            line([{ s: tr('sirTotal', { t: N(last[2]! - (1000 * p.imm) / 100, 0) }), w: 600 }], -1);
          }
          line([{ s: tr('sirHerd', { h: `${N(herdImmunity(p.r0) * 100, 0)} %` }), c: th().series[2]!, w: 600 }], -1);
          y += 4;
          line([{ s: ctx.t('sirG'), c: th().muted }], -2);
        } else {
          const vt = terminalSpeed(9.81, p.kd);
          line([{ s: ctx.t('fallT'), c: th().series[0]!, w: 800 }], 0);
          line([{ s: `v′ = 9,81 − ${N(p.kd, 3)}·v²`, w: 700 }], 0);
          line([{ s: tr('fallVt', { v: N(vt, 1), kmh: N(vt * 3.6, 0) }), c: th().series[3]!, w: 700 }], -1);
          if (p.show) line([{ s: tr('fall5', { v: N(fallSpeed(9.81, p.kd, 5), 1) }), w: 600 }], -1);
          y += 4;
          line([{ s: ctx.t('fallG'), c: th().muted }], -2);
        }
        return;
      }
      if (p.view === 'quiz') {
        line([{ s: ctx.t('quizT'), c: th().series[0]!, w: 800 }], 0);
        line([{ s: `y′ = ${quiz.eqs[quiz.target]!.replace(/\./g, ',').replace(/-/g, '−')} ?`, w: 800 }], 3);
        line([{ s: ctx.t('quizHow'), c: th().muted }], -1.5);
        if (quizVerdict !== null) line([{ s: quizVerdict ? ctx.t('quizOk') : tr('quizNo', { c: 'ABCD'[quiz.target]! }), c: quizVerdict ? th().series[2]! : th().series[1]!, w: 800 }], 1);
        if (quizScore.all) line([{ s: tr('quizScore', { k: quizScore.right, n: quizScore.all }), c: th().muted, w: 600 }], -1.5);
        y += 4;
        line([{ s: ctx.t('quizHint'), c: th().muted }], -2);
        return;
      }
      const src = order() === 1 ? p.f : p.f2;
      y += segLine(g, [{ s: `${order() === 1 ? tr('eq1') : tr('eq2')} `, c: t.muted, w: 600 }, { s: src, c: COL.sol(), w: 700 }], x, y, maxW, size + 3);
      y += segLine(g, [{ s: typeText(), c: eq.ok ? t.text : t.series[3], w: 600 }], x, y, maxW, size - 1);
      if (!eq.ok) return;
      const sv = order() === 1 ? `${tr('start')}: y(${N(p.x0, 2)}) = ${N(p.y0, 2)}` : `${tr('start')}: y(${N(p.x0, 2)}) = ${N(p.y0, 2)},  y′(${N(p.x0, 2)}) = ${N(p.v0, 2)}`;
      y += segLine(g, [{ s: sv, c: COL.start(), w: 600 }], x, y, maxW, size - 1);
      if (eq.model && p.show) y += segLine(g, [{ s: exactText(eq.model, p.x0, p.y0, (v) => N(v, 3), p.v0), c: COL.sol(), w: 700 }], x, y + 2, maxW, size - 0.5) + 2;
      y += 6;
      if (p.card === 'derive') {
        drawDerivation(g, R, x, y, maxW, size);
        return;
      }
      // Vergleich der Verfahren bei x₁
      y += segLine(g, [{ s: tr('compare', { x: N(p.x1, 2) }), c: t.muted, w: 700 }], x, y, maxW, size - 1);
      const ex = exactAt(p.x1);
      const rows: { name: string; v: number; col: string; cur: boolean }[] = [];
      for (const m of METHODS) {
        const r = solveIVP(eq.F, m, p.x0, start(), p.x1, p.h, 1e12);
        rows.push({ name: m === 'euler' ? 'Euler' : m === 'heun' ? 'Heun' : 'Runge-Kutta', v: r.stopped ? NaN : r.s.at(-1)![0]!, col: methodColor(m), cur: p.method === m });
      }
      const colW = [maxW * 0.42, maxW * 0.29, maxW * 0.29];
      const rowH = size * 1.55;
      const tableRow = (cells: Seg[], hl: boolean) => {
        if (hl) {
          g.save();
          g.fillStyle = withAlpha(cells[0]!.c ?? t.text, t.dark ? 0.18 : 0.1);
          roundRect(g, x - 6, y - rowH / 2, maxW + 12, rowH, 7);
          g.fill();
          g.restore();
        }
        let cx = x;
        cells.forEach((c, i) => {
          segLine(g, [c], cx, y, colW[i]! - 6, size - 1);
          cx += colW[i]!;
        });
        y += rowH;
      };
      tableRow([{ s: `h = ${N(p.h, 2)}`, c: t.muted }, { s: 'y(x₁)', c: t.muted }, { s: tr('dev'), c: t.muted }], false);
      for (const r of rows) tableRow([{ s: r.name, c: r.col, w: 700 }, { s: p.show ? N(r.v, 4) : tr('hidden'), c: t.text, w: 600 }, { s: p.show && ex !== null ? N(Math.abs(r.v - ex), 4) : '', c: r.col, w: 600 }], r.cur);
      tableRow([{ s: eq.model ? tr('exact') : tr('fine'), c: COL.sol(), w: 700 }, { s: p.show && ex !== null ? N(ex, 4) : p.show ? '∞' : tr('hidden'), c: COL.sol(), w: 700 }, { s: '', c: t.muted }], false);
      y += 4;
      // Hinweis zum Verfahren
      const m = method();
      if (m) y += segLine(g, [{ s: m === 'euler' ? tr('tipEuler') : m === 'heun' ? tr('tipHeun') : tr('tipRk4'), c: t.muted }], x, y, maxW, size - 2);
      // Abbruch?
      const fw = solveIVP(eq.F, 'rk4', p.x0, start(), p.x1, 0.002, 1e7);
      if (fw.stopped) y += segLine(g, [{ s: tr('stopped', { x: N(fw.x.at(-1)!, 2) }), c: t.series[3], w: 600 }], x, y + 2, maxW, size - 1.5);
      y += 6;
      // 1. Ordnung: Euler-Tabelle, 2. Ordnung: Phasenebene
      const room = R.y + R.h - y - 12;
      if (order() === 1 && m === 'euler' && room > size * 5) {
        y += segLine(g, [{ s: tr('steps'), c: t.muted, w: 600 }], x, y, maxW, size - 2);
        const n = Math.min(6, Math.floor((room - size * 1.6) / (size * 1.45)));
        const tab = eulerTable(eq.f, p.x0, p.y0, p.h, n);
        const cw = maxW / 4;
        const head = ['xₙ', 'yₙ', 'f(xₙ, yₙ)', 'yₙ₊₁'];
        head.forEach((h, i) => segLine(g, [{ s: h, c: t.muted, w: 700 }], x + i * cw, y, cw - 4, size - 2));
        y += size * 1.4;
        tab.forEach((r, k) => {
          const a = clamp(stepTw.value * tab.length * 1.2 - k, 0, 1);
          [N(r.x, 2), N(r.y, 3), N(r.m, 3), N(r.next, 3)].forEach((v, i) => segLine(g, [{ s: v, c: i === 3 ? COL.num() : t.text, w: i === 3 ? 700 : 500 }], x + i * cw, y, cw - 4, size - 1.5, a));
          y += size * 1.4;
        });
      } else if (order() === 2 && room > 110) {
        y += segLine(g, [{ s: tr('phase'), c: t.muted, w: 600 }], x, y, maxW, size - 2);
        phaseRect = { x: R.x + 8, y, w: R.w - 16, h: R.y + R.h - y - 8 };
        drawPhase();
        return;
      }
      phaseRect = { x: -100, y: -100, w: 10, h: 10 };
    }

    /** Rechenweg der exakten Lösung mit Kennwerten. */
    function drawDerivation(g: CanvasRenderingContext2D, R: Rect, x: number, y0: number, maxW: number, size: number): void {
      const t = th();
      let y = y0;
      phaseRect = { x: -100, y: -100, w: 10, h: 10 };
      if (!eq.ok) return;
      if (!eq.model) {
        y += segLine(g, [{ s: tr('noDerive'), c: t.muted }], x, y, maxW, size - 1);
        return;
      }
      if (!p.show) {
        segLine(g, [{ s: tr('hidden'), c: t.muted }], x, y, maxW, size - 1);
        return;
      }
      const d = derivation(eq.model, p.x0, p.y0, p.v0, (v) => N(v, 3), ctx.lang);
      y += segLine(g, [{ s: eq.model.kind === 'oscillation' ? tr('ansatzHead') : eq.model.kind === 'linear' ? tr('antiHead') : tr('sep'), c: t.muted, w: 700 }], x, y, maxW, size - 1);
      d.lines.forEach((l, k) => {
        const a = clamp(drawTw.value * (d.lines.length + 1) - k, 0, 1);
        y += segLine(g, [{ s: `${k + 1}.  `, c: t.muted, w: 600 }, { s: l, c: k === d.lines.length - 1 ? COL.sol() : t.text, w: k === d.lines.length - 1 ? 700 : 500 }], x + 4, y, maxW - 4, size - 1, a);
      });
      if (!d.facts.length) return;
      y += 8;
      const h = d.facts.length * size * 1.55 + size * 0.8;
      if (y + h > R.y + R.h - 6) return;
      g.save();
      g.fillStyle = withAlpha(COL.sol(), t.dark ? 0.16 : 0.08);
      roundRect(g, x - 8, y - size * 0.8, maxW + 16, h, 10);
      g.fill();
      g.restore();
      for (const f of d.facts) {
        const w1 = segLine(g, [{ s: f.label, c: t.text, w: 600 }], x, y, maxW * (f.value ? 0.66 : 1), size - 1.5);
        if (f.value) segLine(g, [{ s: f.value, c: COL.sol(), w: 800 }], x + maxW * 0.68, y, maxW * 0.32, size - 0.5);
        y += Math.max(w1, size * 1.55);
      }
    }

    function drawPhase(): void {
      if (!eq.ok || order() !== 2) return;
      phase.resize();
      phase.begin();
      phase.grid({ minor: false });
      phase.axes();
      const b = phase.bounds;
      const R = phase.rect;
      const g = surface.g;
      // Feld in der Phasenebene: (y′, y″) an der Stelle (y, v)
      const nx = clamp(Math.round(R.w / 30), 6, 16);
      const ny = clamp(Math.round(R.h / 30), 4, 12);
      const sx = R.w / (b.xMax - b.xMin);
      const sy = R.h / (b.yMax - b.yMin);
      const len = Math.min(R.w / nx, R.h / ny) * 0.34;
      g.strokeStyle = COL.field();
      g.lineWidth = 1.4;
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < ny; j++) {
          const yy = b.xMin + ((i + 0.5) * (b.xMax - b.xMin)) / nx;
          const vv = b.yMin + ((j + 0.5) * (b.yMax - b.yMin)) / ny;
          const a = eq.f(p.x0, yy, vv);
          const dx = vv * sx;
          const dy = a * sy;
          const l = Math.hypot(dx, dy);
          if (!(l > 1e-9)) continue;
          const [px, py] = phase.toPx(yy, vv);
          const ux = (dx / l) * len;
          const uy = (dy / l) * len;
          g.beginPath();
          g.moveTo(px - ux, py + uy);
          g.lineTo(px + ux, py - uy);
          g.stroke();
          // kleine Spitze
          g.beginPath();
          g.arc(px + ux, py - uy, 1.4, 0, Math.PI * 2);
          g.fillStyle = COL.field();
          g.fill();
        }
      if (p.show) {
        const c = solveIVP(eq.F, 'rk4', p.x0, start(), p.x0 + 40, 0.02, 1e6);
        const k = Math.max(2, Math.ceil(drawTw.value * c.s.length));
        phase.polyline(
          c.s.slice(0, k).map((s) => [s[0]!, s[1]!] as [number, number]),
          { color: COL.sol(), width: 2.4 },
        );
        // Zustand bei x₁
        const at = solveIVP(eq.F, 'rk4', p.x0, start(), p.x1, 0.01, 1e6).s.at(-1)!;
        phase.point(at[0]!, at[1]!, { color: COL.num(), radius: 4.5 });
      }
      phase.point(p.y0, p.v0, { color: COL.start(), radius: 5 });
      phase.end();
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      ctx.readout('type', typeText());
      if (!eq.ok) {
        ['sol', 'num', 'err'].forEach((k) => ctx.readout(k, null));
        return;
      }
      ctx.readout('sol', eq.model ? exactText(eq.model, p.x0, p.y0, (v) => N(v, 3), p.v0) : tr('none'));
      const m = method();
      const ex = exactAt(p.x1);
      if (!m) {
        ctx.readout('num', ex !== null ? `y(${N(p.x1, 2)}) = ${N(ex, 4)}` : tr('none'));
        ctx.readout('err', null);
        return;
      }
      const r = solveIVP(eq.F, m, p.x0, start(), p.x1, p.h, 1e12);
      const v = r.stopped ? NaN : r.s.at(-1)![0]!;
      ctx.readout('num', `y(${N(p.x1, 2)}) ≈ ${N(v, 4)}`);
      ctx.readout('err', ex !== null && Number.isFinite(v) ? `${N(Math.abs(v - ex), 4)} (${tr(eq.model ? 'exact' : 'fine')}: ${N(ex, 4)})` : tr('none'));
    }

    /* -------------------------------------------------------------- */
    /* Systeme: Räuber-Beute, Epidemie, Fall                           */
    /* -------------------------------------------------------------- */

    const sysTw = new Tween(5000, ease.inOutCubic);
    const sysP = (): SysParams => ({ a: p.la, c: p.lc, b: 0.1, d: 0.02, R0: p.r0, gamma: 0.1, N: 1000, g: 9.81, k: p.kd });
    interface SysRun {
      t: number[];
      s: number[][];
      tEnd: number;
    }
    let sysRun: SysRun | null = null;
    function computeSys(): void {
      const sp = sysP();
      const kind = p.sk as SysKind;
      if (kind === 'lv') {
        const tEnd = 30;
        const r = solveSys(sysRhs('lv', sp), [p.lx, p.ly], tEnd, 0.02);
        sysRun = { ...r, tEnd };
      } else if (kind === 'sir') {
        const tEnd = 200;
        const R0i = (sp.N * p.imm) / 100;
        const r = solveSys(sysRhs('sir', sp), [sp.N - R0i - 1, 1, R0i], tEnd, 0.1);
        sysRun = { ...r, tEnd };
      } else {
        const tEnd = Math.max(8, 4 * terminalSpeed(sp.g, sp.k) / sp.g);
        const r = solveSys(sysRhs('fall', sp), [0, 0], tEnd, Math.min(0.02, tEnd / 1000));
        sysRun = { ...r, tEnd };
      }
    }
    function drawSys(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t);
      if (!sysRun) computeSys();
      const run = sysRun!;
      const kind = p.sk as SysKind;
      const topH = Math.round(R.h * 0.55);
      plotRect = { x: R.x, y: R.y, w: R.w, h: topH };
      phaseRect = { x: R.x + 8, y: R.y + topH + 8, w: R.w - 16, h: R.h - topH - 14 };
      const u = sysTw.running ? sysTw.value : 1;
      const tNow = run.tEnd * u;
      const nShow = Math.max(2, Math.round(run.t.length * u));
      const cols = [th().series[2]!, th().series[1]!, th().series[0]!];
      // Zeitverlauf
      const yMax = kind === 'fall' ? terminalSpeed(9.81, p.kd) * 1.25 : Math.max(...run.s.flatMap((q) => q.slice(0, kind === 'sir' ? 3 : 2))) * 1.12;
      plot.setAxes({ x: { label: ctx.t(kind === 'sir' ? 'time' : kind === 'fall' ? 'timeS' : 'timeY') }, y: { label: kind === 'fall' ? 'v in m/s' : kind === 'sir' ? (ctx.lang === 'de' ? 'Personen' : 'people') : (ctx.lang === 'de' ? 'Anzahl' : 'count') } });
      plot.setRange([-run.tEnd * (kind === 'sir' ? 0.15 : 0.1), run.tEnd], [-yMax * 0.08, yMax]);
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const comps = kind === 'sir' ? [0, 1, 2] : kind === 'lv' ? [0, 1] : [1];
      comps.forEach((ci, j) => {
        const pts = run.t.slice(0, nShow).map((tt, i) => [tt, run.s[i]![ci]!] as [number, number]);
        plot.polyline(pts, { color: cols[j % 3]!, width: 2.6 });
        const last = pts[pts.length - 1]!;
        plot.point(last[0], last[1], { color: cols[j % 3]!, radius: 4 });
      });
      if (kind === 'fall') {
        const vt = terminalSpeed(9.81, p.kd);
        plot.hline(vt, { color: withAlpha(th().series[3]!, 0.8), width: 1.6, dash: [6, 4] });
        plot.fn((x) => Math.min(9.81 * x, yMax * 2), { color: withAlpha(th().muted, 0.5), width: 1.2, dash: [4, 4], from: 0 });
      }
      if (kind === 'sir') plot.hline(1000 / p.r0, { color: withAlpha(cols[0]!, 0.5), width: 1.2, dash: [5, 4] });
      plot.end();
      // Legende
      g.save();
      g.font = `600 12px ${t.font}`;
      g.textBaseline = 'middle';
      const names = kind === 'lv' ? [ctx.t('prey'), ctx.t('pred')] : kind === 'sir' ? ['S', 'I', 'R'] : ['v'];
      let lx = R.x + Math.max(150, R.w * 0.34);
      names.forEach((nm, j) => {
        g.fillStyle = cols[j % 3]!;
        g.fillRect(lx, R.y + 16, 14, 4);
        g.fillStyle = t.text;
        g.fillText(nm, lx + 18, R.y + 18);
        lx += g.measureText(nm).width + 40;
      });
      g.restore();
      // Phasenbild
      if (kind === 'lv') {
        const [ex, ey] = lvEquilibrium(sysP());
        const xm = Math.max(...run.s.map((q) => q[0]!)) * 1.15;
        const ym = Math.max(...run.s.map((q) => q[1]!)) * 1.15;
        phase.setAxes({ x: { label: ctx.t('prey') }, y: { label: ctx.t('pred') } });
        phase.setRange([-xm * 0.08, xm], [-ym * 0.1, ym]);
        phase.resize();
        phase.begin();
        phase.grid();
        phase.axes();
        // Pfeile des Vektorfelds
        const F = sysRhs('lv', sysP());
        for (let i = 1; i <= 10; i++) {
          for (let j = 1; j <= 6; j++) {
            const x = (xm * i) / 11;
            const y = (ym * j) / 7;
            const [dx, dy] = F(0, [x, y]);
            const L2 = Math.hypot(dx! / xm, dy! / ym) || 1;
            const sx = ((dx! / xm) / L2) * xm * 0.035;
            const sy = ((dy! / ym) / L2) * ym * 0.05;
            phase.arrow([x - sx, y - sy], [x + sx, y + sy], { color: withAlpha(t.text, 0.3), width: 1, head: 5 });
          }
        }
        phase.polyline(run.s.slice(0, nShow).map((q) => [q[0]!, q[1]!] as [number, number]), { color: th().series[4]!, width: 2.2 });
        const cur = run.s[nShow - 1]!;
        phase.point(cur[0]!, cur[1]!, { color: th().series[4]!, radius: 5 });
        phase.point(ex, ey, { color: t.text, radius: 4 });
        phase.end();
      } else if (kind === 'sir') {
        phase.setAxes({ x: { label: 'S' }, y: { label: 'I' } });
        const im = Math.max(...run.s.map((q) => q[1]!)) * 1.2 + 1;
        phase.setRange([-170, 1050], [-im * 0.1, im]);
        phase.resize();
        phase.begin();
        phase.grid();
        phase.axes();
        phase.vline(1000 / p.r0, { color: withAlpha(th().series[2]!, 0.6), width: 1.2, dash: [5, 4] });
        phase.polyline(run.s.slice(0, nShow).map((q) => [q[0]!, q[1]!] as [number, number]), { color: th().series[1]!, width: 2.2 });
        const cur = run.s[nShow - 1]!;
        phase.point(cur[0]!, cur[1]!, { color: th().series[1]!, radius: 5 });
        phase.end();
      } else {
        // Phasenlinie: v′ über v
        const vt = terminalSpeed(9.81, p.kd);
        phase.setAxes({ x: { label: 'v' }, y: { label: "v′" } });
        phase.setRange([-vt * 0.08, vt * 1.25], [-2, 12]);
        phase.resize();
        phase.begin();
        phase.grid();
        phase.axes();
        phase.fn((v) => 9.81 - p.kd * v * v, { color: th().series[3]!, width: 2.2, from: 0 });
        const cur = run.s[nShow - 1]!;
        phase.point(cur[1]!, 9.81 - p.kd * cur[1]! * cur[1]!, { color: th().series[0]!, radius: 5 });
        phase.point(vt, 0, { color: t.text, radius: 4 });
        phase.end();
      }
      void tNow;
    }

    /* -------------------------------------------------------------- */
    /* Rätsel                                                          */
    /* -------------------------------------------------------------- */

    let quiz = quizRound(1);
    let quizVerdict: boolean | null = null;
    let quizScore = { right: 0, all: 0 };
    let quizBoxes: Rect[] = [];
    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.view !== 'quiz') return null;
        const k = quizBoxes.findIndex((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
        return k < 0 ? null : String(k);
      },
      onTap: (id) => {
        if (ctx.locked) return;
        ctx.set({ qa: id as '0' | '1' | '2' | '3' });
      },
    });
    function drawQuiz(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t);
      plotRect = { x: -1000, y: -1000, w: 10, h: 10 };
      plot.resize();
      const pad = 12;
      // quadratische Felder, damit Steigungen unverzerrt erscheinen
      const side = Math.min((R.w - 3 * pad) / 2, (R.h - 3 * pad) / 2);
      const cw = side;
      const ch = side;
      const ox = R.x + (R.w - 2 * side - 3 * pad) / 2;
      const oy = R.y + (R.h - 2 * side - 3 * pad) / 2;
      quizBoxes = [];
      quiz.eqs.forEach((src, k2) => {
        const parsed = parseTerm(src);
        const bx = ox + pad + (k2 % 2) * (cw + pad);
        const by = oy + pad + Math.floor(k2 / 2) * (ch + pad);
        quizBoxes.push({ x: bx, y: by, w: cw, h: ch });
        const chosen = String(k2) === p.qa;
        g.save();
        g.fillStyle = t.dark ? '#0f141c' : '#f7f9fc';
        roundRect(g, bx, by, cw, ch, 8);
        g.fill();
        g.strokeStyle = quizVerdict !== null && k2 === quiz.target ? th().series[2]! : chosen ? th().series[0]! : withAlpha(t.text, 0.2);
        g.lineWidth = chosen || (quizVerdict !== null && k2 === quiz.target) ? 3 : 1;
        g.stroke();
        // Achsen
        const X = (x: number) => bx + ((x + 3) / 6) * cw;
        const Y = (y: number) => by + ch - ((y + 3) / 6) * ch;
        g.strokeStyle = withAlpha(t.text, 0.35);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(X(-3), Y(0));
        g.lineTo(X(3), Y(0));
        g.moveTo(X(0), Y(-3));
        g.lineTo(X(0), Y(3));
        g.stroke();
        if (parsed.ok) {
          g.strokeStyle = withAlpha(t.text, 0.75);
          g.lineWidth = 1.4;
          const seg = Math.min(cw, ch) / 22;
          for (let i = -5; i <= 5; i++) {
            for (let j = -5; j <= 5; j++) {
              const x = (i * 3) / 5.5;
              const y = (j * 3) / 5.5;
              const m2 = parsed.f(x, y, 0);
              if (!Number.isFinite(m2)) continue;
              const ang = Math.atan(m2);
              const px = X(x);
              const py = Y(y);
              g.beginPath();
              g.moveTo(px - Math.cos(ang) * seg, py + Math.sin(ang) * seg);
              g.lineTo(px + Math.cos(ang) * seg, py - Math.sin(ang) * seg);
              g.stroke();
            }
          }
        }
        g.font = `800 16px ${t.font}`;
        g.fillStyle = t.dark ? '#0f141c' : '#f7f9fc';
        roundRect(g, bx + 5, by + 7, 22, 22, 5);
        g.fill();
        g.fillStyle = chosen ? th().series[0]! : t.text;
        g.fillText('ABCD'[k2]!, bx + 10, by + 22);
        if (quizVerdict !== null) {
          g.font = `600 12px ${t.font}`;
          g.fillStyle = t.muted;
          g.textAlign = 'right';
          const lbl = `y′ = ${src.replace(/\./g, ',').replace('-', '−')}`;
          const lw = g.measureText(lbl).width;
          g.fillStyle = t.dark ? '#0f141c' : '#f7f9fc';
          roundRect(g, bx + cw - lw - 16, by + 8, lw + 10, 22, 5);
          g.fill();
          g.fillStyle = t.muted;
          g.fillText(`y′ = ${src.replace(/\./g, ',').replace('-', '−')}`, bx + cw - 10, by + 20);
        }
        g.restore();
      });
    }

    /* -------------------------------------------------------------- */
    /* Ablauf                                                          */
    /* -------------------------------------------------------------- */

    return {
      update(changed, source) {
        const eqChanged = changed.has('f') || changed.has('f2') || changed.has('order');
        if (eqChanged || source === 'init') {
          eq = read();
          particles = [];
        }
        if (eqChanged || source === 'init' || source === 'replace' || (source !== 'input' && (changed.has('x1') || changed.has('x0') || changed.has('y0')))) fitRange();
        if (eqChanged || changed.has('v0') || changed.has('x0') || changed.has('y0') || source === 'init' || source === 'replace') fitPhase();
        if (eqChanged || source === 'replace' || source === 'init') drawTw.play();
        if (eqChanged || changed.has('method') || changed.has('h') || source === 'replace') stepTw.play();
        if (changed.has('field') || changed.has('flow')) particles = [];
        if (['view', 'sk', 'la', 'lc', 'lx', 'ly', 'r0', 'imm', 'kd'].some((k) => changed.has(k)) || source === 'init' || source === 'replace') {
          computeSys();
          if (p.view === 'sys' && (changed.has('view') || changed.has('sk') || source !== 'input')) sysTw.play();
        }
        if (changed.has('qn') || source === 'init' || source === 'replace') {
          quiz = quizRound(p.qn);
          quizVerdict = null;
        }
        if (changed.has('qa')) quizVerdict = null;
        updateReadouts();
      },
      action(id) {
        if (id === 'replay') sysTw.play();
        if (id === 'qcheck' && quizVerdict === null) {
          quizVerdict = +p.qa === quiz.target;
          quizScore = { right: quizScore.right + (quizVerdict ? 1 : 0), all: quizScore.all + 1 };
        }
        if (id === 'qnext') ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1 });
        ctx.requestRender();
      },
      resetView() {
        fitRange();
        plot.resetView();
      },
      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const g = surface.begin();
        const R = regions();
        plotRect = R.plot;
        if (p.view === 'sys') {
          drawSys(g, R.plot);
          drawCardBody(g, R.card);
          if (sysTw.running) ctx.requestRender();
          return;
        }
        if (p.view === 'quiz') {
          phaseRect = { x: -100, y: -100, w: 10, h: 10 };
          drawQuiz(g, R.plot);
          drawCardBody(g, R.card);
          return;
        }
        stepParticles(dt);
        drawPlot(g, R.plot);
        drawCardBody(g, R.card);
        if (drawTw.running || stepTw.running || particles.length) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
