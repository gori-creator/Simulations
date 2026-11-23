import { offscreenCanvas, defineSimulation, drawCard, ease, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  abs,
  add,
  arg,
  argDeg,
  c,
  conj,
  cText,
  det,
  div,
  expText,
  matMul,
  mul,
  neg,
  nthRoots,
  parseC,
  polar,
  polarText,
  powInt,
  solveQuadratic,
  scale,
  sub,
  toMatrix,
  type C,
  type M2,
  escapeCount,
  evalHigh,
  inSet,
  orbit,
  type SetKind,
  mapZ,
  parseCoeffs,
  polyRoots,
  realCoeffs,
  shapeLines,
  type MapKind,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Op = 'add' | 'sub' | 'mul' | 'div' | 'conj' | 'pow';

/** Buchstabe „F“ als Figur für die Matrixdarstellung (nicht symmetrisch, damit Drehungen sichtbar sind). */
const F_SHAPE: [number, number][] = [
  [0, 0],
  [0.3, 0],
  [0.3, 0.45],
  [0.7, 0.45],
  [0.7, 0.7],
  [0.3, 0.7],
  [0.3, 0.85],
  [0.85, 0.85],
  [0.85, 1.1],
  [0, 1.1],
];

/**
 * Komplexe Zahlen in der Gaußschen Zahlenebene: Rechnen als Verschieben
 * (Addition) und Drehstrecken (Multiplikation), Polarform mit Betrag und
 * Argument, Lösungen von Gleichungen wie z² = −4 oder zⁿ = w als Ecken
 * eines regelmäßigen Vielecks und die Darstellung als 2×2-Matrix.
 */
export default defineSimulation({
  id: 'komplexe-zahlen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'ops', label: L('Rechnen in der Zahlenebene', 'Arithmetic in the plane') },
        { value: 'polar', label: L('Polarform: Betrag und Winkel', 'Polar form: modulus and angle') },
        { value: 'equation', label: L('Gleichungen lösen', 'Solving equations') },
        { value: 'matrix', label: L('Als 2×2-Matrix', 'As a 2×2 matrix') },
        { value: 'practice', label: L('Üben: selbst rechnen', 'Practice: calculate yourself') },
        { value: 'map', label: L('Abbildungen der Ebene', 'Mappings of the plane') },
        { value: 'poly', label: L('Nullstellen von Polynomen', 'Roots of polynomials') },
        { value: 'sets', label: L('Punktmengen in der Ebene', 'Sets of points in the plane') },
        { value: 'iter', label: L('Iteration z² + c (Mandelbrot)', 'Iteration z² + c (Mandelbrot)') },
      ],
      default: 'ops',
    },
    {
      key: 'z',
      type: 'text',
      label: L('Zahl z', 'Number z'),
      default: '2 + i',
      maxLength: 30,
      placeholder: L('z. B. 3 + 4i oder 2∠45°', 'e.g. 3 + 4i or 2∠45°'),
      help: L('Algebraisch (3 + 4i), mit Winkel in Grad (2∠45°) oder als 2·e^(i·0,5). Der Punkt z lässt sich auch ziehen.', 'Algebraic (3 + 4i), with an angle in degrees (2∠45°) or as 2·e^(i·0.5). You can also drag the point z.'),
      visibleIf: (v) => v.mode !== 'equation',
    },
    {
      key: 'op',
      type: 'choice',
      label: L('Rechenart', 'Operation'),
      options: [
        { value: 'add', label: L('z + w (verschieben)', 'z + w (shift)') },
        { value: 'sub', label: L('z − w', 'z − w') },
        { value: 'mul', label: L('z · w (drehstrecken)', 'z · w (rotate and scale)') },
        { value: 'div', label: L('z : w', 'z : w') },
        { value: 'conj', label: L('z̄ (konjugieren, spiegeln)', 'z̄ (conjugate, reflect)') },
        { value: 'pow', label: L('Potenzen z, z², z³, …', 'Powers z, z², z³, …') },
      ],
      default: 'mul',
      visibleIf: (v) => v.mode === 'ops' || v.mode === 'practice',
    },
    {
      key: 'w',
      type: 'text',
      label: L('Zahl w', 'Number w'),
      default: '1 + i',
      maxLength: 30,
      visibleIf: (v) => ((v.mode === 'ops' || v.mode === 'practice') && v.op !== 'conj' && v.op !== 'pow') || v.mode === 'matrix' || (v.mode === 'equation' && v.eq === 'root'),
    },
    {
      key: 'eq',
      type: 'choice',
      label: L('Gleichung', 'Equation'),
      options: [
        { value: 'quad', label: L('z² + p·z + q = 0', 'z² + p·z + q = 0') },
        { value: 'root', label: L('zⁿ = w (n-te Wurzeln)', 'zⁿ = w (n-th roots)') },
      ],
      default: 'quad',
      visibleIf: (v) => v.mode === 'equation',
    },
    { key: 'p', type: 'text', label: L('p', 'p'), default: '0', maxLength: 20, visibleIf: (v) => v.mode === 'equation' && v.eq === 'quad' },
    { key: 'q', type: 'text', label: L('q', 'q'), default: '4', maxLength: 20, visibleIf: (v) => v.mode === 'equation' && v.eq === 'quad' },
    { key: 'n', type: 'number', label: L('n', 'n'), min: 2, max: 12, step: 1, default: 5, visibleIf: (v) => (v.mode === 'ops' && v.op === 'pow') || (v.mode === 'equation' && v.eq === 'root') },
    {
      key: 'g',
      type: 'text',
      label: L('Dein Ergebnis', 'Your result'),
      default: '',
      maxLength: 30,
      placeholder: L('z. B. 1 + 3i', 'e.g. 1 + 3i'),
      visibleIf: (v) => v.mode === 'practice',
    },
    {
      key: 'fmap',
      type: 'choice',
      label: L('Abbildung', 'Mapping'),
      options: [
        { value: 'mulw', label: L('z ↦ w · z (drehstrecken)', 'z ↦ w · z (rotate and scale)') },
        { value: 'sq', label: L('z ↦ z²', 'z ↦ z²') },
        { value: 'inv', label: L('z ↦ 1/z', 'z ↦ 1/z') },
        { value: 'conj', label: L('z ↦ z̄ (spiegeln)', 'z ↦ z̄ (reflect)') },
        { value: 'exp', label: L('z ↦ eᶻ', 'z ↦ eᶻ') },
        { value: 'jouk', label: L('z ↦ z + 1/z (Joukowski)', 'z ↦ z + 1/z (Joukowski)') },
      ],
      default: 'sq',
      visibleIf: (v) => v.mode === 'map',
    },
    {
      key: 'shape',
      type: 'choice',
      label: L('Figur', 'Figure'),
      options: [
        { value: 'grid', label: L('Gitter', 'grid') },
        { value: 'house', label: L('Haus', 'house') },
        { value: 'circle', label: L('Kreise und Strahlen', 'circles and rays') },
        { value: 'sector', label: L('Kreissektor', 'sector') },
      ],
      default: 'house',
      visibleIf: (v) => v.mode === 'map',
    },
    { key: 'mw', type: 'text', label: L('Faktor w', 'Factor w'), default: '1 + i', maxLength: 30, visibleIf: (v) => v.mode === 'map' && v.fmap === 'mulw' },
    { key: 'coef', type: 'text', label: L('Koeffizienten aₙ; …; a₀', 'Coefficients aₙ; …; a₀'), help: L('Höchster zuerst, getrennt mit Semikolon. Beispiel z³ − 1: 1; 0; 0; -1', 'Highest first, separated by semicolons. Example z³ − 1: 1; 0; 0; -1'), default: '1; 0; 0; -1', maxLength: 80, visibleIf: (v) => v.mode === 'poly' },
    {
      key: 'sk',
      type: 'choice',
      label: L('Menge', 'Set'),
      options: [
        { value: 'disk', label: L('|z − a| ≤ r (Kreisscheibe)', '|z − a| ≤ r (disc)') },
        { value: 'ring', label: L('1 ≤ |z − a| ≤ r (Ring)', '1 ≤ |z − a| ≤ r (annulus)') },
        { value: 'bisect', label: L('|z − a| ≤ |z − b| (Halbebene)', '|z − a| ≤ |z − b| (half-plane)') },
        { value: 'sector', label: L('0° ≤ arg(z − a) ≤ φ, |z − a| ≤ r', '0° ≤ arg(z − a) ≤ φ, |z − a| ≤ r') },
        { value: 'half', label: L('Re(z) ≥ Re(a)', 'Re(z) ≥ Re(a)') },
      ],
      default: 'disk',
      visibleIf: (v) => v.mode === 'sets',
    },
    { key: 'sa', type: 'text', label: L('Punkt a', 'Point a'), default: '1 + i', maxLength: 30, visibleIf: (v) => v.mode === 'sets' },
    { key: 'sb', type: 'text', label: L('Punkt b', 'Point b'), default: '-1', maxLength: 30, visibleIf: (v) => v.mode === 'sets' && v.sk === 'bisect' },
    { key: 'sr', type: 'number', label: L('Radius r', 'Radius r'), min: 0.2, max: 5, step: 0.1, default: 1.5, visibleIf: (v) => v.mode === 'sets' && (v.sk === 'disk' || v.sk === 'ring' || v.sk === 'sector') },
    { key: 'sphi', type: 'number', label: L('Winkel φ', 'Angle φ'), min: 10, max: 360, step: 5, default: 90, unit: '°', visibleIf: (v) => v.mode === 'sets' && v.sk === 'sector' },
    { key: 'ic', type: 'text', label: L('Startwert c', 'Value c'), help: L('Oder den Punkt c im Bild ziehen.', 'Or drag the point c in the picture.'), default: '-0,5 + 0,3i', maxLength: 30, visibleIf: (v) => v.mode === 'iter' },
    { key: 'its', type: 'number', label: L('Schritte', 'Steps'), min: 1, max: 60, step: 1, default: 20, visibleIf: (v) => v.mode === 'iter' },
    { key: 'dc', type: 'boolean', label: L('Ebene nach dem Wert einfärben', 'Colour the plane by the value'), default: true, visibleIf: (v) => v.mode === 'poly' },
    { key: 'show', type: 'boolean', label: L('Ergebnis zeigen', 'Show result'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode !== 'practice' && v.mode !== 'poly' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'practice' },
    { id: 'task', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'practice' },
  ],
  readouts: [
    { key: 'z', label: L('z', 'z') },
    { key: 'polar', label: L('Polarform', 'Polar form') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'map-sq', label: L('z²: Das Haus wird verbogen', 'z²: the house gets bent'), values: { mode: 'map', fmap: 'sq', shape: 'house' } },
    { id: 'map-inv', label: L('1/z: Gitter wird zu Kreisen', '1/z: the grid turns into circles'), values: { mode: 'map', fmap: 'inv', shape: 'grid' } },
    { id: 'map-exp', label: L('eᶻ: Gitter wird zu Kreisen und Strahlen', 'eᶻ: the grid becomes circles and rays'), values: { mode: 'map', fmap: 'exp', shape: 'grid' } },
    { id: 'map-jouk', label: L('Joukowski: Kreis wird zur Strecke', 'Joukowski: the circle becomes a segment'), values: { mode: 'map', fmap: 'jouk', shape: 'circle' } },
    { id: 'poly3', label: L('z³ − 1: drei Einheitswurzeln', 'z³ − 1: three roots of unity'), values: { mode: 'poly', coef: '1; 0; 0; -1', dc: true } },
    { id: 'set-disk', label: L('Kreisscheibe |z − (1 + i)| ≤ 1,5', 'Disc |z − (1 + i)| ≤ 1.5'), values: { mode: 'sets', sk: 'disk', sa: '1 + i', sr: 1.5 } },
    { id: 'set-bis', label: L('Gleich weit von a und b: Mittelsenkrechte', 'Equidistant from a and b: perpendicular bisector'), values: { mode: 'sets', sk: 'bisect', sa: '1 + i', sb: '-1' } },
    { id: 'iter-in', label: L('z² + c: Bahn bleibt beschränkt', 'z² + c: the orbit stays bounded'), values: { mode: 'iter', ic: '-0,5 + 0,3i', its: 40 } },
    { id: 'iter-out', label: L('z² + c: Bahn flieht', 'z² + c: the orbit escapes'), values: { mode: 'iter', ic: '0,3 + 0,5i', its: 20 } },
    { id: 'poly4', label: L('z⁴ − 2z² + 2: zwei konjugierte Paare', 'z⁴ − 2z² + 2: two conjugate pairs'), values: { mode: 'poly', coef: '1; 0; -2; 0; 2', dc: true } },
    { id: 'mul', label: L('(1 + i)·(1 − i) = ?', '(1 + i)·(1 − i) = ?'), values: { mode: 'ops', op: 'mul', z: '1 + i', w: '1 - i' } },
    { id: 'sq', label: L('(1 + i)² = ?', '(1 + i)² = ?'), values: { mode: 'ops', op: 'mul', z: '1 + i', w: '1 + i' } },
    { id: 'i', label: L('Mal i: Drehung um 90°', 'Times i: rotation by 90°'), values: { mode: 'ops', op: 'mul', z: '3 + i', w: 'i' } },
    { id: 'add', label: L('Addieren: Pfeile aneinanderhängen', 'Adding: chaining arrows'), values: { mode: 'ops', op: 'add', z: '3 + i', w: '-1 + 2i' } },
    { id: 'div', label: L('Teilen: (2 + 3i) : (1 − i)', 'Dividing: (2 + 3i) : (1 − i)'), values: { mode: 'ops', op: 'div', z: '2 + 3i', w: '1 - i' } },
    { id: 'pow', label: L('Potenzen von 1,1·e^(i·30°): Spirale', 'Powers of 1.1·e^(i·30°): spiral'), values: { mode: 'ops', op: 'pow', z: '1,1∠30°', n: 12 } },
    { id: 'abs', label: L('|3 + 4i| und Winkel', '|3 + 4i| and angle'), values: { mode: 'polar', z: '3 + 4i' } },
    { id: 'm4', label: L('z² = −4', 'z² = −4'), values: { mode: 'equation', eq: 'quad', p: '0', q: '4' } },
    { id: 'quad', label: L('z² − 2z + 5 = 0', 'z² − 2z + 5 = 0'), values: { mode: 'equation', eq: 'quad', p: '-2', q: '5' } },
    { id: 'unity', label: L('Einheitswurzeln z⁶ = 1', 'Roots of unity z⁶ = 1'), values: { mode: 'equation', eq: 'root', w: '1', n: 6 } },
    { id: 'root', label: L('z⁵ = −8 + 8i', 'z⁵ = −8 + 8i'), values: { mode: 'equation', eq: 'root', w: '-8 + 8i', n: 5 } },
    { id: 'matrix', label: L('i als Matrix: Drehung', 'i as a matrix: rotation'), values: { mode: 'matrix', z: 'i', w: '1 + i' } },
    { id: 'practice', label: L('Üben: (2 + i)·(1 − 3i) selbst ausrechnen', 'Practice: compute (2 + i)·(1 − 3i) yourself'), values: { mode: 'practice', op: 'mul', z: '2 + i', w: '1 - 3i', g: '', show: false } },
    { id: 'matrix2', label: L('Matrix von 1 + i', 'Matrix of 1 + i'), values: { mode: 'matrix', z: '1 + i', w: '2 - i' } },
  ],
  strings: {
    de: {
      canvas: 'Gaußsche Zahlenebene mit den Zahlen als Punkte und Pfeile: Rechnen als Verschieben und Drehstrecken, Polarform, Lösungen von Gleichungen und die Wirkung der zugehörigen 2×2-Matrix.',
      re: 'Re',
      im: 'Im',
      bad: 'Die Eingabe „{s}“ lässt sich nicht lesen. Beispiele: 3 + 4i, −2i, 2∠45°.',
      mapT: 'Abbildung der Ebene',
      map_mulw: 'Jeder Punkt wird um arg(w) gedreht und mit |w| gestreckt. Die Figur bleibt formgleich (ähnlich).',
      map_sq: 'Beträge werden quadriert, Winkel verdoppelt. Gerade Linien werden zu Parabeln, rechte Winkel bleiben im Kleinen rechte Winkel.',
      map_inv: 'Spiegelung am Einheitskreis und an der reellen Achse: Was innen war, liegt außen. Geraden werden zu Kreisen durch 0.',
      map_conj: 'Spiegelung an der reellen Achse. Als einzige Abbildung hier dreht sie den Umlaufsinn um.',
      map_exp: 'e^(x + iy) = eˣ · (cos y + i·sin y): Senkrechte Linien werden zu Kreisen, waagerechte zu Strahlen.',
      map_jouk: 'Der Einheitskreis wird zur Strecke von −2 bis 2. Leicht verschobene Kreise werden zu Tragflächenprofilen.',
      mapMorph: 'Die Figur wandert gleichmäßig von z zu f(z).',
      polyT: 'Fundamentalsatz der Algebra',
      polyG: 'Jedes Polynom n-ten Grades hat in ℂ genau n Nullstellen (mit Vielfachheit). Hat es reelle Koeffizienten, kommen nicht reelle Nullstellen als konjugierte Paare.',
      polyDc: 'Farbe = Winkel von p(z), Helligkeit = Betrag. Um jede Nullstelle laufen alle Farben einmal herum.',
      polyRoots: 'Nullstellen',
      polySum: 'Summe der Nullstellen = −aₙ₋₁/aₙ',
      polyConj: 'Reelle Koeffizienten: Nullstellen spiegelbildlich zur reellen Achse.',
      setT: 'Punktmenge in der Zahlenebene',
      set_disk: '|z − a| ist der Abstand von z zu a. Alle Punkte mit Abstand höchstens r bilden eine Kreisscheibe um a.',
      set_ring: 'Abstand zwischen 1 und r: ein Kreisring um a.',
      set_bisect: 'Gleich weit von a und b liegen alle Punkte der Mittelsenkrechten. Näher an a: die Halbebene auf der Seite von a.',
      set_sector: 'Der Winkel von z − a liegt zwischen 0° und φ: ein Kreissektor.',
      set_half: 'Alle Punkte mit Realteil mindestens Re(a): eine Halbebene rechts der senkrechten Geraden.',
      setTry: 'Ziehe a (und b) im Bild.',
      iterT: 'Iteration zₙ₊₁ = zₙ² + c',
      iterIn: 'Die Bahn bleibt beschränkt: c gehört zur Mandelbrot-Menge (schwarz).',
      iterOut: 'Die Bahn flieht nach {k} Schritten über |z| = 2 hinaus: c liegt außerhalb.',
      iterG: 'Jeder Schritt quadriert (Winkel verdoppeln, Betrag quadrieren) und verschiebt um c. Die schwarze Menge aller c mit beschränkter Bahn ist die Mandelbrot-Menge; die Farben zeigen, wie schnell die Bahn flieht.',
      addT: 'Addition: Pfeil von w an die Spitze von z hängen',
      addR: 'Realteile und Imaginärteile werden einzeln addiert.',
      subT: 'Subtraktion: z − w = z + (−w)',
      mulT: 'Multiplikation: drehen und strecken',
      mulR: 'Beträge malnehmen, Winkel addieren:',
      mulA: 'Ausmultiplizieren mit i² = −1:',
      divT: 'Division: rückwärts drehen und stauchen',
      divR: 'Mit dem konjugierten Nenner erweitern:',
      divP: 'Beträge teilen, Winkel abziehen:',
      conjT: 'Konjugieren: an der reellen Achse spiegeln',
      conjR: 'z · z̄ = |z|² ist immer reell.',
      powT: 'Potenzen: jedes Mal um arg z drehen und mit |z| strecken',
      powR: 'Moivre: zⁿ = rⁿ · (cos(nφ) + i · sin(nφ))',
      polarT: 'Polarform: Abstand r und Winkel φ',
      rForm: 'r = |z| = √(a² + b²)',
      phiForm: 'tan φ = b / a',
      back: 'Zurück: a = r · cos φ,  b = r · sin φ',
      quadT: 'z² + p·z + q = 0 mit der p-q-Formel',
      quadD: 'D = (p/2)² − q',
      quadNeg: 'D < 0: In ℝ keine Lösung, in ℂ ist √D = ± i · √|D|.',
      quadConj: 'Bei reellen p und q sind die Lösungen zueinander konjugiert.',
      rootT: 'zⁿ = w hat genau n Lösungen',
      rootR: 'Alle haben den Betrag ⁿ√|w| = {r}; die Winkel unterscheiden sich um 360°/n = {d}°.',
      check: 'Probe',
      matT: 'z = a + bi als Matrix',
      matR: 'Die Matrix dreht um arg z und streckt mit |z|. Determinante = |z|².',
      matP: 'Matrix von z mal Matrix von w = Matrix von z · w:',
      hidden: 'Ergebnis verdeckt',
      unit: 'Einheitskreis',
      task: 'Aufgabe',
      tipAdd: 'Tipp: Realteile und Imaginärteile einzeln rechnen.',
      tipMul: 'Tipp: Ausmultiplizieren wie bei Klammern, dann i² = −1 einsetzen.',
      tipDiv: 'Tipp: Mit dem konjugierten Nenner erweitern – dann ist der Nenner reell.',
      yours: 'deins',
      correct: 'richtig',
      right: 'Richtig! ✓',
      wrong: 'Noch nicht richtig.',
      reOff: 'Der Realteil stimmt nicht – der Imaginärteil schon.',
      imOff: 'Der Imaginärteil stimmt nicht – der Realteil schon. Vorzeichen und i² = −1 prüfen!',
      bothOff: 'Real- und Imaginärteil stimmen nicht. Schau dir den Tipp an.',
      score: '{k} von {n} Aufgaben richtig',
    },
    en: {
      canvas: 'Complex plane with the numbers as points and arrows: arithmetic as shifting and rotating with scaling, polar form, solutions of equations and the effect of the corresponding 2×2 matrix.',
      re: 'Re',
      im: 'Im',
      bad: 'The input “{s}” cannot be read. Examples: 3 + 4i, −2i, 2∠45°.',
      mapT: 'Mapping of the plane',
      map_mulw: 'Every point is rotated by arg(w) and scaled by |w|. The figure keeps its shape (similar).',
      map_sq: 'Moduli are squared, angles doubled. Straight lines turn into parabolas; right angles stay right angles locally.',
      map_inv: 'Reflection in the unit circle and the real axis: what was inside is now outside. Lines become circles through 0.',
      map_conj: 'Reflection in the real axis. It is the only mapping here that reverses orientation.',
      map_exp: 'e^(x + iy) = eˣ · (cos y + i·sin y): vertical lines become circles, horizontal lines become rays.',
      map_jouk: 'The unit circle becomes the segment from −2 to 2. Slightly shifted circles become aerofoil profiles.',
      mapMorph: 'The figure moves evenly from z to f(z).',
      polyT: 'Fundamental theorem of algebra',
      polyG: 'Every polynomial of degree n has exactly n roots in ℂ (counted with multiplicity). With real coefficients, non-real roots come in conjugate pairs.',
      polyDc: 'Colour = angle of p(z), brightness = modulus. All colours go round each root once.',
      polyRoots: 'roots',
      polySum: 'sum of the roots = −aₙ₋₁/aₙ',
      polyConj: 'Real coefficients: roots symmetric about the real axis.',
      setT: 'Set of points in the complex plane',
      set_disk: '|z − a| is the distance from z to a. All points at distance at most r form a disc around a.',
      set_ring: 'Distance between 1 and r: an annulus around a.',
      set_bisect: 'All points equidistant from a and b lie on the perpendicular bisector. Closer to a: the half-plane on a’s side.',
      set_sector: 'The angle of z − a lies between 0° and φ: a sector.',
      set_half: 'All points with real part at least Re(a): a half-plane to the right of the vertical line.',
      setTry: 'Drag a (and b) in the picture.',
      iterT: 'Iteration zₙ₊₁ = zₙ² + c',
      iterIn: 'The orbit stays bounded: c belongs to the Mandelbrot set (black).',
      iterOut: 'The orbit escapes beyond |z| = 2 after {k} steps: c lies outside.',
      iterG: 'Each step squares (double the angle, square the modulus) and shifts by c. The black set of all c with bounded orbit is the Mandelbrot set; the colours show how fast the orbit escapes.',
      addT: 'Addition: attach the arrow of w to the tip of z',
      addR: 'Add real and imaginary parts separately.',
      subT: 'Subtraction: z − w = z + (−w)',
      mulT: 'Multiplication: rotate and scale',
      mulR: 'Multiply the moduli, add the angles:',
      mulA: 'Expand using i² = −1:',
      divT: 'Division: rotate back and shrink',
      divR: 'Multiply by the conjugate of the denominator:',
      divP: 'Divide the moduli, subtract the angles:',
      conjT: 'Conjugation: reflect in the real axis',
      conjR: 'z · z̄ = |z|² is always real.',
      powT: 'Powers: rotate by arg z and scale by |z| each time',
      powR: 'De Moivre: zⁿ = rⁿ · (cos(nφ) + i · sin(nφ))',
      polarT: 'Polar form: distance r and angle φ',
      rForm: 'r = |z| = √(a² + b²)',
      phiForm: 'tan φ = b / a',
      back: 'Back: a = r · cos φ,  b = r · sin φ',
      quadT: 'z² + p·z + q = 0 with the formula',
      quadD: 'D = (p/2)² − q',
      quadNeg: 'D < 0: no solution in ℝ, in ℂ we have √D = ± i · √|D|.',
      quadConj: 'For real p and q the solutions are complex conjugates.',
      rootT: 'zⁿ = w has exactly n solutions',
      rootR: 'All have modulus ⁿ√|w| = {r}; the angles differ by 360°/n = {d}°.',
      check: 'Check',
      matT: 'z = a + bi as a matrix',
      matR: 'The matrix rotates by arg z and scales by |z|. Determinant = |z|².',
      matP: 'Matrix of z times matrix of w = matrix of z · w:',
      hidden: 'result hidden',
      unit: 'unit circle',
      task: 'Task',
      tipAdd: 'Hint: work out real and imaginary parts separately.',
      tipMul: 'Hint: expand the brackets, then use i² = −1.',
      tipDiv: 'Hint: multiply by the conjugate of the denominator – then it is real.',
      yours: 'yours',
      correct: 'correct',
      right: 'Correct! ✓',
      wrong: 'Not quite yet.',
      reOff: 'The real part is wrong – the imaginary part is fine.',
      imOff: 'The imaginary part is wrong – the real part is fine. Check signs and i² = −1!',
      bothOff: 'Both parts are wrong. Have a look at the hint.',
      score: '{k} of {n} tasks correct',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 3) => fmt.num(Math.abs(v) < 5e-11 ? 0 : v, d);
    const T = (z: C, d = 3) => cText(z, (v) => N(v, d));
    /** Zahl, negative in Klammern (für Rechenwege). */
    const Q = (v: number, d = 2) => (v < -5e-11 ? `(${N(v, d)})` : N(v, d));
    /** Winkel in (−180°, 180°]. */
    const sdeg = (d: number) => {
      let x = ((d % 360) + 360) % 360;
      if (x > 180) x -= 360;
      return x;
    };
    const P = (z: C) => polarText(z, (v) => N(v, 3), (v) => N(v, 2));

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    let z = parseC(p.z);
    let w = parseC(p.w);
    let pp = parseC(p.p);
    let qq = parseC(p.q);
    const op = () => p.op as Op;

    /** Ergebnis der letzten Prüfung im Übungsmodus. */
    let verdict: { ok: boolean; mine: C } | null = null;
    const verdictTw = new Tween(520, ease.outBack);

    function readAll(): void {
      z = parseC(p.z);
      w = parseC(p.w);
      pp = parseC(p.p);
      qq = parseC(p.q);
    }

    /** Text für einen gezogenen Punkt (gerundet auf Zehntel, mit Komma). */
    const handleText = (v: C) => {
      const r = (x: number) => Math.round(x * 10) / 10;
      return cText(c(r(v.re), r(v.im)), (x) => fmt.num(x, 1)).replace('−', '-').replace(/ − /g, ' - ');
    };

    /** Ergebnis der gewählten Rechenart. */
    function result(): C | null {
      if (!z) return null;
      switch (op()) {
        case 'add':
          return w ? add(z, w) : null;
        case 'sub':
          return w ? sub(z, w) : null;
        case 'mul':
          return w ? mul(z, w) : null;
        case 'div':
          return w && abs(w) > 1e-12 ? div(z, w) : null;
        case 'conj':
          return conj(z);
        case 'pow':
          return powInt(z, p.n);
      }
    }

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    const anim = new Tween(1700, ease.inOutCubic);
    const build = new Tween(800, ease.outCubic);
    anim.play();
    build.play();
    const k = () => anim.value;

    /* -------------------------------------------------------------- */
    /* Layout und Farben                                               */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { plane: Rect; card: Rect } {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const pw = Math.round(W * 0.6);
        return { plane: { x: pad, y: pad, w: pw - pad, h: H - 2 * pad }, card: { x: pw + pad, y: pad, w: W - pw - 2 * pad, h: H - 2 * pad } };
      }
      const ph = Math.round(H * 0.56);
      return { plane: { x: pad, y: pad, w: W - 2 * pad, h: ph }, card: { x: pad, y: ph + 2 * pad, w: W - 2 * pad, h: H - ph - 3 * pad } };
    }

    const COL = {
      z: () => th().series[0]!,
      w: () => th().series[1]!,
      r: () => th().series[4]!,
      aux: () => th().series[5]!,
      good: () => th().series[2]!,
      ang: () => th().series[3]!,
    };

    let planeRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const plot = new Plot(surface, {
      x: [-4, 4],
      y: [-3, 3],
      equalAspect: true,
      region: () => ({ x: planeRect.x + 4, y: planeRect.y + 4, w: planeRect.w - 8, h: planeRect.h - 8 }),
      xAxis: { label: 'Re' },
      yAxis: { label: 'Im' },
    });

    /** Bereich so wählen, dass alle wichtigen Punkte (und 0) gut sichtbar sind. */
    function fitRange(): void {
      const pts: C[] = [c(0), c(1), c(0, 1), c(-1), c(0, -1)];
      if (p.mode === 'equation') {
        for (const s of solutions()) pts.push(s);
        if (p.eq === 'root' && w) pts.push(w);
      } else {
        if (z) pts.push(z);
        if (w && (p.mode === 'matrix' || (op() !== 'conj' && op() !== 'pow'))) pts.push(w);
        if (p.mode === 'ops' || p.mode === 'practice') {
          const r = result();
          if (r) pts.push(r);
          if (op() === 'pow' && z) for (let j = 1; j <= p.n; j++) pts.push(powInt(z, j));
          if (op() === 'sub' && w) pts.push(neg(w));
        }
        if (p.mode === 'matrix' && z) for (const [x, y] of F_SHAPE) pts.push(mul(z, c(x, y)));
        if (p.mode === 'matrix' && z && w) pts.push(mul(z, w));
        if (p.mode === 'practice' && verdict) pts.push(verdict.mine);
      }
      let m = 1.5;
      for (const q of pts) if (Number.isFinite(q.re) && Number.isFinite(q.im)) m = Math.max(m, Math.abs(q.re), Math.abs(q.im));
      m = Math.min(m * 1.2 + 0.3, 60);
      plot.setRange([-m, m], [-m, m]);
    }

    // Ziehbare Punkte z und w
    plot.addHandle({
      get: () => (z ? [z.re, z.im] : [0, 0]),
      set: (x, y) => ctx.set({ z: handleText(c(x, y)) }),
      enabled: () => !ctx.locked && !!z && ['ops', 'polar', 'matrix', 'practice'].includes(p.mode),
      color: () => COL.z(),
      axis: 'both',
    });
    plot.addHandle({
      get: () => (w ? [w.re, w.im] : [0, 0]),
      set: (x, y) => ctx.set({ w: handleText(c(x, y)) }),
      enabled: () => !ctx.locked && !!w && ((p.mode === 'ops' && op() !== 'conj' && op() !== 'pow') || p.mode === 'matrix' || (p.mode === 'equation' && p.eq === 'root')),
      color: () => COL.w(),
      axis: 'both',
    });

    /* -------------------------------------------------------------- */
    /* Zeichenhilfen                                                   */
    /* -------------------------------------------------------------- */

    function arrow(from: C, to: C, col: string, width = 2.6, dash?: number[]): void {
      if (abs(sub(to, from)) < 1e-9) return;
      plot.arrow([from.re, from.im], [to.re, to.im], { color: col, width, dash, head: 10 });
    }
    function dot(v: C, col: string, label?: string, offset: [number, number] = [10, -12]): void {
      plot.point(v.re, v.im, { color: col, radius: 5 });
      if (label) plot.text(v.re, v.im, label, { color: col, size: 13, weight: 'bold', offset, align: offset[0] >= 0 ? 'left' : 'right', halo: true });
    }
    /** Winkelbogen um 0 von a1 bis a2 (Bogenmaß) mit Radius r. */
    function angleArc(a1: number, a2: number, r: number, col: string, label?: string): void {
      const n = 40;
      const pts: [number, number][] = [];
      for (let j = 0; j <= n; j++) {
        const t = a1 + ((a2 - a1) * j) / n;
        pts.push([r * Math.cos(t), r * Math.sin(t)]);
      }
      plot.polyline(pts, { color: col, width: 2 });
      if (label) {
        const m = (a1 + a2) / 2;
        plot.text(r * 1.25 * Math.cos(m), r * 1.25 * Math.sin(m), label, { color: col, size: 12, weight: 'bold', halo: true });
      }
    }
    function unitCircle(): void {
      const pts: [number, number][] = [];
      for (let j = 0; j <= 90; j++) pts.push([Math.cos((j / 90) * 2 * Math.PI), Math.sin((j / 90) * 2 * Math.PI)]);
      plot.polyline(pts, { color: withAlpha(th().text, 0.25), width: 1.2, dash: [4, 4] });
    }
    const deg = (rad: number) => `${N((((rad * 180) / Math.PI) % 360 + 360) % 360, 1)}°`;

    /** Punkt auf der Drehstreck-Spirale von a nach a·f (t = 0 … 1). */
    function spiral(a: C, f: C, t: number): C {
      const r = abs(a) * abs(f) ** t;
      let da = arg(f);
      if (da > Math.PI) da -= 2 * Math.PI;
      return polar(r, arg(a) + da * t);
    }

    /* -------------------------------------------------------------- */
    /* Ansichten                                                       */
    /* -------------------------------------------------------------- */

    function drawOps(): void {
      const t = th();
      if (!z) return;
      const res = result();
      const tt = k();
      unitCircle();
      switch (op()) {
        case 'add':
        case 'sub': {
          if (!w) return;
          const ww = op() === 'add' ? w : neg(w);
          arrow(c(0), z, COL.z());
          arrow(c(0), w, COL.w());
          dot(z, COL.z(), 'z');
          dot(w, COL.w(), 'w');
          if (op() === 'sub') {
            arrow(c(0), ww, withAlpha(COL.w(), 0.6), 2, [5, 4]);
            dot(ww, withAlpha(COL.w(), 0.8), '−w', [-10, 12]);
          }
          // w (bzw. −w) an die Spitze von z schieben
          const from = c(z.re * tt, z.im * tt);
          arrow(from, add(from, ww), COL.w(), 2.4, [7, 4]);
          if (res && tt > 0.98 && p.show) {
            plot.polygon(
              [
                [0, 0],
                [z.re, z.im],
                [res.re, res.im],
                [ww.re, ww.im],
              ],
              { fill: COL.r(), alpha: t.dark ? 0.12 : 0.08 },
            );
            arrow(c(0), res, COL.r(), 3);
            dot(res, COL.r(), op() === 'add' ? 'z + w' : 'z − w');
          }
          break;
        }
        case 'mul':
        case 'div': {
          if (!w || !res) return;
          const f = op() === 'mul' ? w : div(c(1), w);
          // Winkel von z und w
          const rz = Math.min(abs(z), abs(w), 1) * 0.55;
          angleArc(0, arg(z), rz, COL.z(), 'φ');
          angleArc(0, arg(w), rz * 0.7, COL.w(), 'ψ');
          arrow(c(0), z, COL.z());
          arrow(c(0), w, COL.w());
          dot(z, COL.z(), 'z');
          dot(w, COL.w(), 'w');
          dot(c(1), withAlpha(t.text, 0.6));
          // ähnliche Dreiecke (0, 1, w) und (0, z, z·w)
          plot.polygon(
            [
              [0, 0],
              [1, 0],
              [f.re, f.im],
            ],
            { fill: COL.w(), alpha: t.dark ? 0.14 : 0.1 },
          );
          // Spirale von z zum Ergebnis
          const pts: [number, number][] = [];
          for (let j = 0; j <= 60; j++) {
            const q = spiral(z, f, (j / 60) * tt);
            pts.push([q.re, q.im]);
          }
          plot.polyline(pts, { color: withAlpha(COL.r(), 0.8), width: 2, dash: [5, 4] });
          const cur = spiral(z, f, tt);
          plot.point(cur.re, cur.im, { color: COL.r(), radius: 4 });
          if (tt > 0.98 && p.show) {
            plot.polygon(
              [
                [0, 0],
                [z.re, z.im],
                [res.re, res.im],
              ],
              { fill: COL.r(), alpha: t.dark ? 0.14 : 0.1 },
            );
            arrow(c(0), res, COL.r(), 3);
            dot(res, COL.r(), op() === 'mul' ? 'z · w' : 'z : w');
            const a2 = arg(res);
            angleArc(0, a2 < 0 && arg(z) > 0 && op() === 'mul' ? a2 + 2 * Math.PI : a2, rz * 1.5, withAlpha(COL.r(), 0.9), op() === 'mul' ? 'φ + ψ' : 'φ − ψ');
          }
          break;
        }
        case 'conj': {
          arrow(c(0), z, COL.z());
          dot(z, COL.z(), 'z');
          plot.hline(0, { color: withAlpha(COL.aux(), 0.8), width: 2.4 });
          const cur = c(z.re, lerp(z.im, -z.im, tt));
          plot.segment([z.re, z.im], [cur.re, cur.im], { color: withAlpha(COL.r(), 0.6), width: 1.6, dash: [4, 4] });
          if (tt > 0.98 && p.show && res) {
            arrow(c(0), res, COL.r(), 3);
            dot(res, COL.r(), 'z̄', [10, 14]);
          } else plot.point(cur.re, cur.im, { color: COL.r(), radius: 4 });
          break;
        }
        case 'pow': {
          // z, z², …, zⁿ als Spirale
          const shown = Math.max(1, Math.round(tt * p.n));
          let prev = c(1);
          dot(c(1), withAlpha(t.text, 0.6));
          for (let j = 1; j <= shown; j++) {
            const q = powInt(z, j);
            const pts: [number, number][] = [];
            for (let s = 0; s <= 20; s++) {
              const v = spiral(prev, z, s / 20);
              pts.push([v.re, v.im]);
            }
            plot.polyline(pts, { color: withAlpha(COL.r(), 0.7), width: 1.8 });
            plot.segment([0, 0], [q.re, q.im], { color: withAlpha(COL.r(), 0.25), width: 1 });
            dot(q, j === 1 ? COL.z() : COL.r(), j === 1 ? 'z' : j <= 9 ? `z${'⁰¹²³⁴⁵⁶⁷⁸⁹'[j]}` : `z^${j}`);
            prev = q;
          }
          angleArc(0, arg(z), Math.min(abs(z), 1) * 0.5, COL.ang(), 'φ');
          break;
        }
      }
    }

    function drawPractice(): void {
      if (!z) return;
      unitCircle();
      arrow(c(0), z, COL.z());
      dot(z, COL.z(), 'z');
      if (w && op() !== 'conj' && op() !== 'pow') {
        arrow(c(0), w, COL.w());
        dot(w, COL.w(), 'w');
      }
      if (verdict) {
        const a = verdictTw.running ? clamp01(verdictTw.value) : 1;
        const col = verdict.ok ? COL.good() : COL.w();
        plot.point(verdict.mine.re, verdict.mine.im, { color: withAlpha(col, a), radius: 7 * a + 1 });
        const left = verdict.mine.re > 0;
        plot.text(verdict.mine.re, verdict.mine.im, tr('yours'), { color: col, size: 12, weight: 'bold', offset: [left ? -10 : 10, 14], align: left ? 'right' : 'left', halo: true });
      }
      const res = result();
      if (res && (p.show || verdict?.ok)) {
        arrow(c(0), res, withAlpha(COL.r(), 0.8), 2.4, [6, 4]);
        dot(res, COL.r(), tr('correct'));
      }
    }
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    function drawPolar(): void {
      if (!z) return;
      const t = th();
      unitCircle();
      const r = abs(z);
      // Kreis mit Radius r
      const pts: [number, number][] = [];
      for (let j = 0; j <= 90; j++) pts.push([r * Math.cos((j / 90) * 2 * Math.PI), r * Math.sin((j / 90) * 2 * Math.PI)]);
      plot.polyline(pts, { color: withAlpha(COL.z(), 0.35), width: 1.2 });
      const tt = k();
      const phi = arg(z) < 0 ? arg(z) + 2 * Math.PI : arg(z);
      const cur = polar(r, phi * tt);
      // Projektionen a = r cos φ, b = r sin φ
      plot.segment([z.re, 0], [z.re, z.im], { color: withAlpha(COL.w(), 0.8), width: 2, dash: [5, 4] });
      plot.segment([0, 0], [z.re, 0], { color: COL.good(), width: 3.2 });
      plot.segment([0, z.im], [z.re, z.im], { color: withAlpha(t.text, 0.3), width: 1, dash: [3, 4] });
      plot.text(z.re / 2, 0, `a = ${N(z.re, 2)}`, { color: COL.good(), size: 12, weight: 'bold', offset: [0, z.im >= 0 ? 14 : -14], halo: true });
      plot.text(z.re, z.im / 2, `b = ${N(z.im, 2)}`, { color: COL.w(), size: 12, weight: 'bold', offset: [z.re >= 0 ? 8 : -8, 0], align: z.re >= 0 ? 'left' : 'right', halo: true });
      angleArc(0, phi * tt, Math.min(r, 1.2) * 0.45, COL.ang(), `φ = ${deg(phi * tt)}`);
      arrow(c(0), cur, COL.z(), 3);
      plot.text(cur.re / 2, cur.im / 2, `r = ${N(r, 3)}`, { color: COL.z(), size: 12, weight: 'bold', offset: [-8, -10], align: 'right', halo: true });
      dot(z, COL.z(), 'z');
      // e^(iφ) auf dem Einheitskreis
      const e = polar(1, phi);
      plot.point(e.re, e.im, { color: COL.aux(), radius: 4 });
      plot.text(e.re, e.im, 'e^(iφ)', { color: COL.aux(), size: 11, weight: '600', offset: [8, 12], align: 'left', halo: true });
    }

    function solutions(): C[] {
      if (p.eq === 'quad') {
        if (!pp || !qq) return [];
        return solveQuadratic(pp, qq).roots;
      }
      if (!w || abs(w) < 1e-12) return [];
      return nthRoots(w, p.n);
    }

    function drawEquation(): void {
      const t = th();
      const sols = solutions();
      const tt = k();
      unitCircle();
      if (p.eq === 'quad') {
        if (!pp || !qq) return;
        const h = c(-pp.re / 2, -pp.im / 2);
        dot(h, withAlpha(t.text, 0.7), '−p/2', [-10, -12]);
        if (!p.show) return;
        sols.forEach((s, j) => {
          const cur = c(lerp(h.re, s.re, tt), lerp(h.im, s.im, tt));
          plot.segment([h.re, h.im], [cur.re, cur.im], { color: withAlpha(COL.r(), 0.6), width: 2, dash: [5, 4] });
          dot(cur, COL.r(), tt > 0.98 ? `z${j === 0 ? '₁' : '₂'} = ${T(s, 2)}` : undefined, [10, j === 0 ? -12 : 14]);
        });
        return;
      }
      if (!w) return;
      dot(w, COL.w(), 'w');
      const r = abs(w) ** (1 / p.n);
      const pts: [number, number][] = [];
      for (let j = 0; j <= 90; j++) pts.push([r * Math.cos((j / 90) * 2 * Math.PI), r * Math.sin((j / 90) * 2 * Math.PI)]);
      plot.polyline(pts, { color: withAlpha(COL.r(), 0.35), width: 1.2 });
      if (!p.show) return;
      // Vieleck dreht sich in seine Lage
      const turn = (1 - tt) * (Math.PI / p.n);
      const rot = sols.map((s) => polar(abs(s), arg(s) - turn));
      plot.polygon(
        rot.map((s) => [s.re, s.im] as [number, number]),
        { fill: COL.r(), alpha: t.dark ? 0.14 : 0.1, stroke: COL.r(), width: 1.6 },
      );
      rot.forEach((s, j) => {
        plot.segment([0, 0], [s.re, s.im], { color: withAlpha(COL.r(), 0.3), width: 1 });
        dot(s, COL.r(), tt > 0.98 ? `z${'₀₁₂₃₄₅₆₇₈₉'[j] ?? j}` : undefined, [s.re >= 0 ? 8 : -8, s.im >= 0 ? -10 : 14]);
      });
      if (sols[0]) angleArc(0, arg(sols[0]), r * 0.4, COL.ang(), 'arg w / n');
    }

    function drawMatrix(): void {
      if (!z) return;
      const t = th();
      const tt = k();
      unitCircle();
      // Zwischenschritt: um t·arg z drehen, mit |z|^t strecken
      const m = polar(abs(z) ** tt, arg(z) * tt);
      const orig = F_SHAPE.map(([x, y]) => [x, y] as [number, number]);
      const img = F_SHAPE.map(([x, y]) => {
        const v = mul(m, c(x, y));
        return [v.re, v.im] as [number, number];
      });
      plot.polygon(orig, { fill: withAlpha(t.text, 0.12), stroke: withAlpha(t.text, 0.4), width: 1.2 });
      plot.polygon(img, { fill: COL.z(), alpha: t.dark ? 0.35 : 0.28, stroke: COL.z(), width: 2 });
      // Bilder der Basisvektoren: Spalten der Matrix
      const e1 = mul(m, c(1));
      const e2 = mul(m, c(0, 1));
      arrow(c(0), e1, COL.good(), 2.6);
      arrow(c(0), e2, COL.w(), 2.6);
      plot.text(e1.re, e1.im, `(${N(e1.re, 2)} | ${N(e1.im, 2)})`, { color: COL.good(), size: 11, weight: 'bold', offset: [8, 12], align: 'left', halo: true });
      plot.text(e2.re, e2.im, `(${N(e2.re, 2)} | ${N(e2.im, 2)})`, { color: COL.w(), size: 11, weight: 'bold', offset: [8, -10], align: 'left', halo: true });
      dot(z, COL.z(), 'z');
      if (w) dot(w, COL.w(), 'w');
      if (w && p.show && tt > 0.98) dot(mul(z, w), COL.r(), 'z · w');
      angleArc(0, arg(z) * tt, 0.5, COL.ang(), deg(arg(z) * tt));
    }

    function drawPlane(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      planeRect = R;
      drawCard(g, R, t);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      if (p.mode === 'poly' && p.dc) drawDomain(g);
      if (p.mode === 'sets') drawSets(g);
      if (p.mode === 'iter') drawMandel(g);
      plot.axes();
      if (p.mode === 'map') drawMap();
      else if (p.mode === 'sets') drawSetLines();
      else if (p.mode === 'iter') drawIter();
      else if (p.mode === 'poly') drawPoly(g);
      else if (p.mode === 'ops') drawOps();
      else if (p.mode === 'polar') drawPolar();
      else if (p.mode === 'equation') drawEquation();
      else if (p.mode === 'practice') drawPractice();
      else drawMatrix();
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Abbildungen der Ebene                                           */
    /* -------------------------------------------------------------- */

    const mapW = () => parseC(p.mw) ?? c(1, 1);
    /** Bild einer Figur unter f; Linienzüge werden an Sprüngen (∞) getrennt. */
    function mappedLines(): { from: C[]; to: (C | null)[] }[] {
      return shapeLines(p.shape as 'grid' | 'circle' | 'house' | 'sector', 60).map((ln) => ({ from: ln, to: ln.map((q) => mapZ(p.fmap as MapKind, q, mapW())) }));
    }
    function fitMap(): void {
      let m = 1.6;
      for (const ln of mappedLines()) {
        for (const q of ln.from) m = Math.max(m, Math.abs(q.re), Math.abs(q.im));
        for (const q of ln.to) if (q && abs(q) < 12) m = Math.max(m, Math.abs(q.re), Math.abs(q.im));
      }
      m = Math.min(m * 1.15, p.fmap === 'inv' ? 3.2 : 8);
      plot.setRange([-m, m], [-m, m]);
    }
    function drawMap(): void {
      const t = th();
      const tt = k();
      unitCircle();
      const lines = mappedLines();
      const cols = [COL.z(), COL.w(), COL.good(), COL.r(), COL.aux(), COL.ang()];
      lines.forEach((ln, i) => {
        // Urbild blass
        plot.polyline(ln.from.map((q) => [q.re, q.im] as [number, number]), { color: withAlpha(t.text, 0.22), width: 1.4 });
        // Zwischenstand: gleichmäßig von z nach f(z)
        const col = p.shape === 'house' ? COL.z() : cols[i % cols.length]!;
        let cur: [number, number][] = [];
        const flush = () => {
          if (cur.length > 1) plot.polyline(cur, { color: col, width: 2.6 });
          cur = [];
        };
        ln.from.forEach((q, j) => {
          const im = ln.to[j];
          if (!im || abs(im) > 40) return flush();
          const pt: [number, number] = [q.re + (im.re - q.re) * tt, q.im + (im.im - q.im) * tt];
          const last = cur[cur.length - 1];
          if (last && Math.hypot(pt[0] - last[0], pt[1] - last[1]) > 3) flush();
          cur.push(pt);
        });
        flush();
      });
      if (p.fmap === 'mulw') dot(mapW(), COL.w(), 'w');
      if (p.fmap === 'inv' || p.fmap === 'jouk') dot(c(0), withAlpha(t.text, 0.6));
    }

    /* -------------------------------------------------------------- */
    /* Nullstellen von Polynomen mit eingefärbter Ebene                */
    /* -------------------------------------------------------------- */

    const coeffs = () => parseCoeffs(p.coef);
    let dcCache: { key: string; canvas: HTMLCanvasElement } | null = null;
    function hsl(h: number, s: number, l: number): [number, number, number] {
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k2 = (n + h / 30) % 12;
        return l - a * Math.max(-1, Math.min(k2 - 3, 9 - k2, 1));
      };
      return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
    }
    function drawDomain(g: CanvasRenderingContext2D): void {
      const cs = coeffs();
      if (!cs) return;
      const r = plot.rect;
      const b = plot.bounds;
      const key = `${p.coef}|${b.xMin.toFixed(3)}|${b.xMax.toFixed(3)}|${b.yMin.toFixed(3)}|${b.yMax.toFixed(3)}|${Math.round(r.w)}|${th().dark}`;
      if (!dcCache || dcCache.key !== key) {
        const nx = Math.max(60, Math.min(240, Math.round(r.w / 3)));
        const ny = Math.max(40, Math.round((nx * r.h) / r.w));
        const { canvas: cv, g: cg } = offscreenCanvas(nx, ny, 1);
        const img = cg.createImageData(nx, ny);
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            const zz = c(b.xMin + ((i + 0.5) / nx) * (b.xMax - b.xMin), b.yMax - ((j + 0.5) / ny) * (b.yMax - b.yMin));
            const v = evalHigh(cs, zz);
            const hue = ((Math.atan2(v.im, v.re) * 180) / Math.PI + 360) % 360;
            const m = abs(v);
            // Helligkeit: Ringe für log|p|, dunkel an Nullstellen
            const lg = Math.log2(m + 1e-12);
            const ring = 0.5 + 0.12 * (lg - Math.floor(lg));
            const light = Math.min(ring, 0.25 + 0.5 * (1 - Math.exp(-m * 1.5)));
            const [rr, gg, bb] = hsl(hue, th().dark ? 0.55 : 0.6, light);
            const o = (j * nx + i) * 4;
            img.data[o] = rr;
            img.data[o + 1] = gg;
            img.data[o + 2] = bb;
            img.data[o + 3] = 175;
          }
        }
        cg.putImageData(img, 0, 0);
        dcCache = { key, canvas: cv };
      }
      g.save();
      g.imageSmoothingEnabled = true;
      g.drawImage(dcCache.canvas, r.x, r.y, r.w, r.h);
      g.restore();
    }
    function fitPoly(): void {
      const cs = coeffs();
      let m = 1.6;
      if (cs) for (const q of polyRoots(cs)) m = Math.max(m, Math.abs(q.re), Math.abs(q.im));
      m = Math.min(m * 1.35 + 0.3, 30);
      plot.setRange([-m, m], [-m, m]);
    }
    function drawPoly(g: CanvasRenderingContext2D): void {
      const t = th();
      const cs = coeffs();
      if (!cs) return;
      const roots = polyRoots(cs);
      const tt = build.running ? build.value : 1;
      roots.forEach((q, i) => {
        if (i / Math.max(1, roots.length) > tt) return;
        plot.point(q.re, q.im, { color: t.dark ? '#ffffff' : '#111827', radius: 6 });
        if (p.show) plot.text(q.re, q.im, T(q, 2), { color: t.text, size: 12, weight: 'bold', offset: [10, -12], align: 'left', halo: true });
      });
      void g;
    }

    /* -------------------------------------------------------------- */
    /* Punktmengen                                                     */
    /* -------------------------------------------------------------- */

    const setA = () => parseC(p.sa);
    const setB = () => parseC(p.sb);
    plot.addHandle({
      get: () => {
        const a = setA();
        return a ? [a.re, a.im] : [0, 0];
      },
      set: (x, y) => ctx.set({ sa: handleText(c(x, y)) }),
      enabled: () => !ctx.locked && p.mode === 'sets' && !!setA(),
      color: () => COL.z(),
      axis: 'both',
    });
    plot.addHandle({
      get: () => {
        const b = setB();
        return b ? [b.re, b.im] : [0, 0];
      },
      set: (x, y) => ctx.set({ sb: handleText(c(x, y)) }),
      enabled: () => !ctx.locked && p.mode === 'sets' && p.sk === 'bisect' && !!setB(),
      color: () => COL.w(),
      axis: 'both',
    });
    function drawSets(g: CanvasRenderingContext2D): void {
      const a = setA();
      const b = setB() ?? c(-1);
      if (!a) return;
      const r = plot.rect;
      const bd = plot.bounds;
      const nx = Math.max(60, Math.round(r.w / 3));
      const ny = Math.max(40, Math.round(r.h / 3));
      const { canvas: cv, g: cg } = offscreenCanvas(nx, ny, 1);
      const img = cg.createImageData(nx, ny);
      const col = COL.z();
      const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(col);
      const [cr, cgc, cb] = m ? [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)] : [44, 95, 214];
      const fade = build.running ? build.value : 1;
      for (let j = 0; j < ny; j++) {
        for (let i = 0; i < nx; i++) {
          const zz = c(bd.xMin + ((i + 0.5) / nx) * (bd.xMax - bd.xMin), bd.yMax - ((j + 0.5) / ny) * (bd.yMax - bd.yMin));
          if (!inSet(p.sk as SetKind, zz, a, b, p.sr, p.sphi)) continue;
          const o = (j * nx + i) * 4;
          img.data[o] = cr;
          img.data[o + 1] = cgc;
          img.data[o + 2] = cb;
          img.data[o + 3] = Math.round(70 * fade);
        }
      }
      cg.putImageData(img, 0, 0);
      g.save();
      g.imageSmoothingEnabled = false;
      g.drawImage(cv, r.x, r.y, r.w, r.h);
      g.restore();
    }
    function drawSetLines(): void {
      const a = setA();
      const b = setB() ?? c(-1);
      if (!a) return;
      const circ = (ctr: C, rad: number, from = 0, to = 2 * Math.PI) => {
        const pts: [number, number][] = [];
        for (let j = 0; j <= 120; j++) {
          const t = from + ((to - from) * j) / 120;
          pts.push([ctr.re + rad * Math.cos(t), ctr.im + rad * Math.sin(t)]);
        }
        plot.polyline(pts, { color: COL.z(), width: 2.4 });
      };
      if (p.sk === 'disk') circ(a, p.sr);
      if (p.sk === 'ring') {
        circ(a, 1);
        circ(a, p.sr);
      }
      if (p.sk === 'sector') {
        circ(a, p.sr, 0, (p.sphi * Math.PI) / 180);
        plot.segment([a.re, a.im], [a.re + p.sr, a.im], { color: COL.z(), width: 2.4 });
        const e = polar(p.sr, (p.sphi * Math.PI) / 180);
        plot.segment([a.re, a.im], [a.re + e.re, a.im + e.im], { color: COL.z(), width: 2.4 });
      }
      if (p.sk === 'half') plot.vline(a.re, { color: COL.z(), width: 2.4 });
      if (p.sk === 'bisect') {
        const mid = scale(add(a, b), 0.5);
        const dir = sub(b, a);
        plot.line([mid.re, mid.im], [mid.re - dir.im, mid.im + dir.re], { color: COL.z(), width: 2.4 });
        plot.segment([a.re, a.im], [b.re, b.im], { color: withAlpha(th().text, 0.35), width: 1.2, dash: [4, 4] });
        dot(b, COL.w(), 'b');
      }
      if (p.sk === 'disk' || p.sk === 'ring' || p.sk === 'sector') {
        plot.segment([a.re, a.im], [a.re + p.sr * Math.cos(-0.6), a.im + p.sr * Math.sin(-0.6)], { color: COL.ang(), width: 1.6, dash: [5, 3] });
        plot.text(a.re + p.sr * 0.55 * Math.cos(-0.6), a.im + p.sr * 0.55 * Math.sin(-0.6), `r = ${N(p.sr, 1)}`, { color: COL.ang(), size: 12, weight: 'bold', offset: [8, 10], halo: true });
      }
      dot(a, COL.z(), 'a');
    }

    /* -------------------------------------------------------------- */
    /* Iteration z² + c                                                */
    /* -------------------------------------------------------------- */

    const iterC = () => parseC(p.ic);
    plot.addHandle({
      get: () => {
        const q = iterC();
        return q ? [q.re, q.im] : [0, 0];
      },
      set: (x, y) => {
        const r2 = (v: number) => Math.round(v * 100) / 100;
        ctx.set({ ic: cText(c(r2(x), r2(y)), (v) => fmt.num(v, 2)).replace('−', '-').replace(/ − /g, ' - ') });
      },
      enabled: () => !ctx.locked && p.mode === 'iter' && !!iterC(),
      color: () => COL.w(),
      axis: 'both',
    });
    let mbCache: { key: string; canvas: HTMLCanvasElement } | null = null;
    function drawMandel(g: CanvasRenderingContext2D): void {
      const r = plot.rect;
      const bd = plot.bounds;
      const key = `${bd.xMin.toFixed(3)}|${bd.xMax.toFixed(3)}|${bd.yMin.toFixed(3)}|${bd.yMax.toFixed(3)}|${Math.round(r.w)}|${th().dark}`;
      if (!mbCache || mbCache.key !== key) {
        const nx = Math.max(80, Math.min(300, Math.round(r.w / 2)));
        const ny = Math.max(50, Math.round((nx * r.h) / r.w));
        const { canvas: cv, g: cg } = offscreenCanvas(nx, ny, 1);
        const img = cg.createImageData(nx, ny);
        const maxIt = 60;
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            const cc2 = c(bd.xMin + ((i + 0.5) / nx) * (bd.xMax - bd.xMin), bd.yMax - ((j + 0.5) / ny) * (bd.yMax - bd.yMin));
            const n = escapeCount(cc2, maxIt);
            const o = (j * nx + i) * 4;
            if (n >= maxIt) {
              img.data[o] = 10;
              img.data[o + 1] = 12;
              img.data[o + 2] = 20;
              img.data[o + 3] = 230;
            } else {
              const u = Math.sqrt(n / maxIt);
              img.data[o] = Math.round(40 + 200 * u);
              img.data[o + 1] = Math.round(90 + 120 * u);
              img.data[o + 2] = Math.round(220 - 60 * u);
              img.data[o + 3] = Math.round(30 + 150 * u);
            }
          }
        }
        cg.putImageData(img, 0, 0);
        mbCache = { key, canvas: cv };
      }
      g.save();
      g.imageSmoothingEnabled = true;
      g.drawImage(mbCache.canvas, r.x, r.y, r.w, r.h);
      g.restore();
    }
    function drawIter(): void {
      const cc2 = iterC();
      if (!cc2) return;
      const o = orbit(cc2, p.its);
      const shown = Math.max(1, Math.round(o.length * (anim.running ? anim.value : 1)));
      const pts = o.slice(0, shown).filter((q) => abs(q) < 50);
      plot.polyline(pts.map((q) => [q.re, q.im] as [number, number]), { color: COL.ang(), width: 1.8 });
      pts.forEach((q, i) => plot.point(q.re, q.im, { color: i === 0 ? th().text : COL.ang(), radius: i === 0 ? 4 : 3 }));
      const pts2: [number, number][] = [];
      for (let j = 0; j <= 90; j++) pts2.push([2 * Math.cos((j / 90) * 2 * Math.PI), 2 * Math.sin((j / 90) * 2 * Math.PI)]);
      plot.polyline(pts2, { color: withAlpha(th().text, 0.4), width: 1.2, dash: [5, 4] });
      dot(cc2, COL.w(), 'c');
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
      const width = (q: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${q}px ${th().font}`;
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
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 20) {
            cx = x + 12;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    /** 2×2-Matrix mit Klammern zeichnen; liefert die Breite. */
    function matrixBox(g: CanvasRenderingContext2D, m: M2, x: number, y: number, size: number, col: string): number {
      const cells = [m[0][0], m[0][1], m[1][0], m[1][1]].map((v) => N(v, 2));
      g.save();
      g.font = `600 ${size}px ${th().font}`;
      const cw = Math.max(...cells.map((s) => g.measureText(s).width)) + 10;
      const h = size * 2.6;
      g.strokeStyle = col;
      g.lineWidth = 1.6;
      const w = cw * 2 + 10;
      g.beginPath();
      g.moveTo(x + 5, y - h / 2);
      g.lineTo(x, y - h / 2);
      g.lineTo(x, y + h / 2);
      g.lineTo(x + 5, y + h / 2);
      g.moveTo(x + w - 5, y - h / 2);
      g.lineTo(x + w, y - h / 2);
      g.lineTo(x + w, y + h / 2);
      g.lineTo(x + w - 5, y + h / 2);
      g.stroke();
      g.fillStyle = col;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      g.fillText(cells[0]!, x + 5 + cw, y - size * 0.62);
      g.fillText(cells[1]!, x + 5 + cw * 2, y - size * 0.62);
      g.fillText(cells[2]!, x + 5 + cw, y + size * 0.62);
      g.fillText(cells[3]!, x + 5 + cw * 2, y + size * 0.62);
      g.restore();
      return w;
    }

    /** „z² − 2z + 5“ aus p und q (komplexe Koeffizienten in Klammern). */
    function quadText(pc: C, qc: C): string {
      const term = (v: C, suffix: string) => {
        if (abs(v) < 1e-12) return '';
        if (Math.abs(v.im) < 1e-12) {
          const a = Math.abs(v.re);
          const coef = suffix && Math.abs(a - 1) < 1e-12 ? '' : N(a, 2);
          return ` ${v.re < 0 ? '−' : '+'} ${coef}${suffix}`;
        }
        return ` + (${T(v, 2)})${suffix ? '·' + suffix : ''}`;
      };
      return `z²${term(pc, 'z')}${term(qc, '')}`;
    }

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.z());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const bad = (s: string) => line([{ s: tr('bad', { s }), c: COL.w(), w: 600 }], -1);
      const reveal = p.show;

      if (p.mode === 'map') {
        const names: Record<string, string> = { mulw: `f(z) = ${T(mapW())} · z`, sq: 'f(z) = z²', inv: 'f(z) = 1/z', conj: 'f(z) = z̄', exp: 'f(z) = eᶻ', jouk: 'f(z) = z + 1/z' };
        line([{ s: ctx.t('mapT'), c: COL.z(), w: 800 }], 0);
        line([{ s: names[p.fmap] ?? '', c: t.text, w: 700 }], 2);
        if (p.fmap === 'mulw') line([{ s: `|w| = ${N(abs(mapW()), 3)},  arg(w) = ${N(argDeg(mapW()), 1)}°`, c: COL.w(), w: 600 }], -1);
        y += 4;
        line([{ s: ctx.t(`map_${p.fmap}`), c: t.muted }], -1.5);
        line([{ s: ctx.t('mapMorph'), c: t.muted }], -2);
        return;
      }
      if (p.mode === 'sets') {
        line([{ s: ctx.t('setT'), c: COL.z(), w: 800 }], 0);
        const a = setA();
        if (!a) return void bad(p.sa);
        const label: Record<string, string> = {
          disk: `|z − (${T(a, 2)})| ≤ ${N(p.sr, 1)}`,
          ring: `1 ≤ |z − (${T(a, 2)})| ≤ ${N(p.sr, 1)}`,
          bisect: `|z − (${T(a, 2)})| ≤ |z − (${T(setB() ?? c(-1), 2)})|`,
          sector: `0° ≤ arg(z − (${T(a, 2)})) ≤ ${N(p.sphi, 0)}°`,
          half: `Re(z) ≥ ${N(a.re, 2)}`,
        };
        line([{ s: label[p.sk] ?? '', c: t.text, w: 700 }], 1);
        y += 4;
        line([{ s: ctx.t(`set_${p.sk}`), c: t.muted }], -1.5);
        line([{ s: ctx.t('setTry'), c: t.muted }], -2);
        return;
      }
      if (p.mode === 'iter') {
        line([{ s: ctx.t('iterT'), c: COL.z(), w: 800 }], 0);
        const cc2 = iterC();
        if (!cc2) return void bad(p.ic);
        line([{ s: `c = ${T(cc2, 2)}`, c: COL.w(), w: 700 }], 1);
        const o = orbit(cc2, Math.min(p.its, 6));
        if (reveal) line([{ s: o.slice(0, 5).map((q, i) => `z${['₀', '₁', '₂', '₃', '₄'][i]} = ${T(q, 2)}`).join(',  '), c: t.text }], -2);
        const k = escapeCount(cc2, 200);
        line([{ s: k >= 200 ? ctx.t('iterIn') : tr('iterOut', { k }), c: k >= 200 ? COL.good() : COL.w(), w: 700 }], -1);
        y += 4;
        line([{ s: ctx.t('iterG'), c: t.muted }], -2);
        return;
      }
      if (p.mode === 'poly') {
        const cs = coeffs();
        line([{ s: ctx.t('polyT'), c: COL.z(), w: 800 }], 0);
        if (!cs) return void bad(p.coef);
        const deg2 = cs.length - 1;
        const sup = ['', '', '²', '³', '⁴', '⁵', '⁶'];
        const terms = cs
          .map((a, i) => {
            const e = deg2 - i;
            if (abs(a) < 1e-12) return '';
            const coefTxt = e > 0 && Math.abs(a.re - 1) < 1e-12 && Math.abs(a.im) < 1e-12 ? '' : Math.abs(a.im) > 1e-12 && Math.abs(a.re) > 1e-12 ? `(${T(a, 2)})` : T(a, 2);
            return `${coefTxt}${e > 0 ? `z${sup[e]}` : ''}`;
          })
          .filter((q) => q)
          .join(' + ')
          .replace(/\+ −/g, '− ');
        line([{ s: `p(z) = ${terms}`, c: t.text, w: 700 }], 1);
        const roots = polyRoots(cs);
        if (reveal) {
          line([{ s: `${ctx.t('polyRoots')} (${roots.length}):`, c: t.muted, w: 600 }], -1);
          for (const q of roots) line([{ s: `z = ${T(q, 3)}`, c: t.text, w: 600 }], -1);
          if (deg2 >= 1) {
            const sum = roots.reduce((acc, q) => add(acc, q), c(0));
            line([{ s: `${ctx.t('polySum')} = ${T(sum, 3)}`, c: t.muted }], -2);
          }
        }
        y += 4;
        if (realCoeffs(cs) && roots.some((q) => Math.abs(q.im) > 1e-9)) line([{ s: ctx.t('polyConj'), c: COL.good(), w: 600 }], -1.5);
        line([{ s: ctx.t('polyG'), c: t.muted }], -2);
        if (p.dc) line([{ s: ctx.t('polyDc'), c: t.muted }], -2);
        return;
      }

      if (p.mode === 'equation') {
        if (p.eq === 'quad') {
          line([{ s: tr('quadT'), c: t.muted, w: 700 }], -1);
          if (!pp) return void bad(p.p);
          if (!qq) return void bad(p.q);
          line([{ s: `${quadText(pp, qq)} = 0`, c: t.text, w: 700 }], 1);
          const { disc, roots } = solveQuadratic(pp, qq);
          line([{ s: `${tr('quadD')} = ${T(disc, 3)}`, c: t.text }]);
          if (Math.abs(disc.im) < 1e-12 && disc.re < 0) line([{ s: tr('quadNeg'), c: t.muted }], -1.5);
          line([{ s: `z₁,₂ = −p/2 ± √D = ${T(c(-pp.re / 2, -pp.im / 2), 3)} ± √(${T(disc, 3)})`, c: t.text }], -1);
          y += 4;
          if (!reveal) return void line([{ s: tr('hidden'), c: t.muted }], -1);
          line([{ s: `z₁ = ${T(roots[0], 3)}`, c: COL.r(), w: 800 }], 1);
          line([{ s: `z₂ = ${T(roots[1], 3)}`, c: COL.r(), w: 800 }], 1);
          if (Math.abs(pp.im) < 1e-12 && Math.abs(qq.im) < 1e-12 && Math.abs(roots[0].im) > 1e-12) line([{ s: tr('quadConj'), c: t.muted }], -1.5);
          y += 4;
          // Probe
          const pr = add(add(mul(roots[0], roots[0]), mul(pp, roots[0])), qq);
          line([{ s: `${tr('check')}: z₁² + p·z₁ + q = ${T(pr, 3)} ✓`, c: COL.good(), w: 600 }], -1.5);
          return;
        }
        line([{ s: tr('rootT'), c: t.muted, w: 700 }], -1);
        if (!w) return void bad(p.w);
        line([{ s: `z${'⁰¹²³⁴⁵⁶⁷⁸⁹'[p.n] ?? `^${p.n}`} = ${T(w, 2)}`, c: t.text, w: 700 }], 1);
        line([{ s: `w = ${P(w)}`, c: COL.w() }], -1.5);
        const r = abs(w) ** (1 / p.n);
        line([{ s: tr('rootR', { r: N(r, 3), d: N(360 / p.n, 2) }), c: t.text }], -1.5);
        if (!reveal) return void line([{ s: tr('hidden'), c: t.muted }], -1);
        y += 2;
        const sols = nthRoots(w, p.n);
        for (let j = 0; j < sols.length; j++) {
          if (y > R.y + R.h - size) break;
          line([{ s: `z${'₀₁₂₃₄₅₆₇₈₉'[j] ?? j} = ${N(r, 3)} · e^(i·${N(argDeg(sols[j]!), 1)}°) = ${T(sols[j]!, 3)}`, c: COL.r(), w: 600 }], -1.5);
        }
        return;
      }

      if (!z) return void bad(p.z);
      line([{ s: `z = ${T(z)}`, c: COL.z(), w: 800 }], 1);

      if (p.mode === 'polar') {
        line([{ s: tr('polarT'), c: t.muted, w: 700 }], -1);
        line([{ s: `${tr('rForm')} = √(${N(z.re, 2)}² + ${N(z.im, 2)}²) = ${N(abs(z), 4)}`, c: t.text }], -1);
        line([{ s: `${tr('phiForm')} = ${N(z.im, 2)} / ${N(z.re, 2)}  ⇒  φ = ${N(argDeg(z), 2)}°`, c: COL.ang(), w: 600 }], -1);
        y += 4;
        line([{ s: P(z), c: COL.z(), w: 700 }]);
        line([{ s: expText(z, (v) => N(v, 3)), c: COL.aux(), w: 600 }], -1);
        y += 4;
        line([{ s: tr('back'), c: t.muted }], -1.5);
        const zc = conj(z);
        line([{ s: `z̄ = ${T(zc)},  z · z̄ = ${N(abs(z) ** 2, 3)}`, c: t.text }], -1.5);
        return;
      }

      if (p.mode === 'practice') {
        if (!w) return void bad(p.w);
        const sym = { add: '+', sub: '−', mul: '·', div: ':', conj: '', pow: '' }[op()];
        line([{ s: tr('task'), c: t.muted, w: 700 }], -1);
        line([{ s: `(${T(z)}) ${sym} (${T(w)}) = ?`, c: t.text, w: 800 }], 3);
        y += 4;
        const tips: Record<string, string> = { add: 'tipAdd', sub: 'tipAdd', mul: 'tipMul', div: 'tipDiv' };
        line([{ s: tr(tips[op()] ?? 'tipAdd'), c: t.muted }], -1.5);
        y += 6;
        const mine = p.g.trim() ? parseC(p.g) : null;
        if (p.g.trim() && !mine) line([{ s: tr('bad', { s: p.g }), c: COL.w(), w: 600 }], -1.5);
        else if (mine) line([{ s: `${tr('yours')}: ${T(mine)}`, c: t.text, w: 600 }]);
        if (verdict) {
          const a = verdictTw.running ? clamp01(verdictTw.value) : 1;
          const col = verdict.ok ? COL.good() : COL.w();
          g.save();
          g.globalAlpha = a;
          g.fillStyle = withAlpha(col, t.dark ? 0.2 : 0.1);
          roundRect(g, x - 8, y - size * 0.4, maxW + 16, size * 2.6, 10);
          g.fill();
          g.restore();
          segLine(g, [{ s: verdict.ok ? tr('right') : tr('wrong'), c: col, w: 800 }], x, y + size * 0.9, maxW, size + 1, a);
          y += size * 3;
          const res = result();
          if (!verdict.ok && res) {
            const dRe = Math.abs(verdict.mine.re - res.re) > 1e-6;
            const dIm = Math.abs(verdict.mine.im - res.im) > 1e-6;
            line([{ s: dRe && dIm ? tr('bothOff') : dRe ? tr('reOff') : tr('imOff'), c: t.muted }], -1.5);
          }
        }
        const res = result();
        if (res && (p.show || verdict?.ok)) {
          y += 4;
          line([{ s: `${tr('correct')}: ${T(res)}`, c: COL.r(), w: 800 }], 1);
        }
        if (practiceCount) line([{ s: tr('score', { k: practiceRight, n: practiceCount }), c: t.muted, w: 600 }], -1.5);
        return;
      }
      if (p.mode === 'matrix') {
        line([{ s: tr('matT'), c: t.muted, w: 700 }], -1);
        y += size * 0.9;
        const mw = matrixBox(g, toMatrix(z), x + 40, y, size, COL.z());
        segLine(g, [{ s: 'M(z) =', c: COL.z(), w: 700 }], x - 2, y, 42, size - 1);
        segLine(g, [{ s: `det = ${N(det(toMatrix(z)), 3)} = |z|²`, c: t.muted }], x + 52 + mw, y, maxW - mw - 52, size - 2);
        y += size * 2;
        line([{ s: tr('matR'), c: t.muted }], -1.5);
        if (w) {
          y += 4;
          line([{ s: tr('matP'), c: t.text, w: 600 }], -1.5);
          y += size * 0.9;
          let cx = x;
          cx += matrixBox(g, toMatrix(z), cx, y, size - 2, COL.z()) + 6;
          segLine(g, [{ s: '·', w: 700 }], cx, y, 12, size);
          cx += 12;
          cx += matrixBox(g, toMatrix(w), cx, y, size - 2, COL.w()) + 6;
          segLine(g, [{ s: '=', w: 700 }], cx, y, 14, size);
          cx += 16;
          if (reveal) matrixBox(g, matMul(toMatrix(z), toMatrix(w)), cx, y, size - 2, COL.r());
          y += size * 2;
          if (reveal) line([{ s: `z · w = ${T(mul(z, w))}`, c: COL.r(), w: 700 }], -0.5);
        }
        return;
      }

      // Rechnen
      const res = result();
      if (op() !== 'conj' && op() !== 'pow') {
        if (!w) return void bad(p.w);
        line([{ s: `w = ${T(w)}`, c: COL.w(), w: 800 }], 1);
      }
      y += 4;
      const titles: Record<Op, string> = { add: 'addT', sub: 'subT', mul: 'mulT', div: 'divT', conj: 'conjT', pow: 'powT' };
      line([{ s: tr(titles[op()]), c: t.muted, w: 700 }], -1);
      const zz = z;
      switch (op()) {
        case 'add':
        case 'sub':
          if (!w) break;
          line([{ s: tr('addR'), c: t.muted }], -2);
          line([{ s: `(${N(zz.re, 2)} ${op() === 'add' ? '+' : '−'} ${Q(w.re)}) + (${N(zz.im, 2)} ${op() === 'add' ? '+' : '−'} ${Q(w.im)})·i`, c: t.text }], -1);
          break;
        case 'mul':
          if (!w) break;
          line([{ s: tr('mulA'), c: t.muted }], -2);
          line([{ s: `(${Q(zz.re)}·${Q(w.re)} − ${Q(zz.im)}·${Q(w.im)}) + (${Q(zz.re)}·${Q(w.im)} + ${Q(zz.im)}·${Q(w.re)})·i`, c: t.text }], -1.5);
          line([{ s: tr('mulR'), c: t.muted }], -2);
          line([{ s: `|z|·|w| = ${N(abs(zz), 3)}·${N(abs(w), 3)} = ${N(abs(zz) * abs(w), 3)},  φ + ψ = ${N(argDeg(zz), 1)}° + ${N(argDeg(w), 1)}°`, c: t.text }], -1.5);
          break;
        case 'div':
          if (!w) break;
          line([{ s: tr('divR'), c: t.muted }], -2);
          line([{ s: `(${T(zz, 2)})·(${T(conj(w), 2)}) / (${T(w, 2)})·(${T(conj(w), 2)}) = (${T(mul(zz, conj(w)), 2)}) / ${N(abs(w) ** 2, 3)}`, c: t.text }], -1.5);
          line([{ s: tr('divP'), c: t.muted }], -2);
          line([{ s: `|z| : |w| = ${N(abs(zz) / abs(w), 3)},  φ − ψ = ${N(sdeg(argDeg(zz) - argDeg(w)), 1)}°`, c: t.text }], -1.5);
          break;
        case 'conj':
          line([{ s: tr('conjR'), c: t.muted }], -2);
          line([{ s: `z · z̄ = ${N(abs(zz) ** 2, 3)}`, c: t.text }], -1);
          break;
        case 'pow':
          line([{ s: tr('powR'), c: t.muted }], -2);
          for (let j = 2; j <= p.n; j++) {
            if (y > R.y + R.h - size * 3.5) break;
            const q = powInt(zz, j);
            line([{ s: `z${'⁰¹²³⁴⁵⁶⁷⁸⁹'[j] ?? `^${j}`} = ${T(q, 3)}  (r = ${N(abs(q), 3)}, ${N(argDeg(q), 1)}°)`, c: j === p.n ? COL.r() : t.text, w: j === p.n ? 700 : 500 }], -2);
          }
          break;
      }
      // Ergebnis unten
      const by = Math.max(y + 10, R.y + R.h - size * 3.2);
      g.save();
      g.fillStyle = withAlpha(COL.r(), t.dark ? 0.16 : 0.08);
      roundRect(g, x - 8, by - size * 0.95, maxW + 16, R.y + R.h - by + size * 0.95 - 10, 10);
      g.fill();
      g.restore();
      const label = { add: 'z + w', sub: 'z − w', mul: 'z · w', div: 'z : w', conj: 'z̄', pow: `z${'⁰¹²³⁴⁵⁶⁷⁸⁹'[p.n] ?? `^${p.n}`}` }[op()];
      if (!res) segLine(g, [{ s: '–', c: t.muted }], x, by, maxW, size);
      else if (!reveal) segLine(g, [{ s: `${label} = ?  (${tr('hidden')})`, c: t.muted, w: 600 }], x, by, maxW, size);
      else {
        const h = segLine(g, [{ s: `${label} = ${T(res)}`, c: COL.r(), w: 800 }], x, by, maxW, size + 2);
        segLine(g, [{ s: P(res), c: t.muted }], x, by + h - 2, maxW, size - 2);
      }
    }

    /* -------------------------------------------------------------- */
    /* Übungsmodus                                                     */
    /* -------------------------------------------------------------- */

    let practiceCount = 0;
    let practiceRight = 0;

    function runCheck(): void {
      const mine = parseC(p.g);
      const res = result();
      if (!mine || !res) {
        verdict = null;
        ctx.requestRender();
        return;
      }
      const ok = Math.abs(mine.re - res.re) < 0.005 + 1e-9 && Math.abs(mine.im - res.im) < 0.005 + 1e-9;
      verdict = { ok, mine };
      practiceCount++;
      if (ok) practiceRight++;
      verdictTw.play();
      fitRange();
      ctx.requestRender();
    }

    function newTask(): void {
      const ri = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
      const ops: Op[] = ['add', 'sub', 'mul', 'mul', 'div'];
      const o = ops[ri(0, ops.length - 1)]!;
      let zz = c(ri(-4, 4), ri(-4, 4));
      let ww = c(ri(-3, 3), ri(-3, 3));
      if (abs(ww) < 1e-9) ww = c(1, ri(1, 3));
      if (o === 'div') {
        // ganzzahliges Ergebnis: z = q · w
        const q = c(ri(-3, 3), ri(-3, 3));
        zz = mul(q, ww);
      }
      const txt = (v: C) => cText(v, (x) => fmt.num(x, 0)).replace(/−/g, '-');
      verdict = null;
      ctx.set({ z: txt(zz), w: txt(ww), op: o, g: '', show: false });
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      ctx.readout('z', z && p.mode !== 'equation' ? T(z) : '–');
      ctx.readout('polar', z && p.mode !== 'equation' ? P(z) : '–');
      if (p.mode === 'ops' || p.mode === 'practice') {
        const r = result();
        ctx.readout('res', r ? T(r) : '–');
      } else if (p.mode === 'equation') {
        const s = solutions();
        ctx.readout('res', s.length ? s.map((q) => T(q, 3)).join(';  ') : '–');
      } else if (p.mode === 'matrix') {
        ctx.readout('res', z && w ? `z · w = ${T(mul(z, w))}` : '–');
      } else if (p.mode === 'map' || p.mode === 'sets') {
        ctx.readout('res', null);
      } else if (p.mode === 'iter') {
        const cc2 = iterC();
        ctx.readout('res', cc2 ? (escapeCount(cc2, 200) >= 200 ? ctx.t('iterIn') : tr('iterOut', { k: escapeCount(cc2, 200) })) : '–');
      } else if (p.mode === 'poly') {
        const cs = coeffs();
        ctx.readout('res', cs ? polyRoots(cs).map((q) => T(q, 3)).join(';  ') : '–');
      } else ctx.readout('res', z ? `r = ${N(abs(z), 4)}, φ = ${N(argDeg(z), 2)}°` : '–');
    }

    /* -------------------------------------------------------------- */
    /* Ablauf                                                          */
    /* -------------------------------------------------------------- */

    return {
      update(changed, source) {
        readAll();
        if (['z', 'w', 'op', 'g', 'mode'].some((q) => changed.has(q))) verdict = null;
        const structural = ['mode', 'op', 'eq', 'n'].some((q) => changed.has(q)) || source === 'init' || source === 'replace';
        if (structural || (source !== 'input' && (changed.has('z') || changed.has('w') || changed.has('p') || changed.has('q')))) fitRange();
        if (p.mode === 'map' && (structural || ['fmap', 'shape', 'mw'].some((q) => changed.has(q)))) {
          fitMap();
          anim.play();
        }
        if (p.mode === 'sets' && structural) {
          plot.setRange([-4, 4], [-4, 4]);
          build.play();
        }
        if (p.mode === 'iter' && structural) {
          plot.setRange([-2.3, 1.2], [-1.4, 1.4]);
          anim.play();
        }
        if (p.mode === 'iter' && changed.has('its')) anim.play();
        if (p.mode === 'poly' && (structural || changed.has('coef'))) {
          fitPoly();
          build.play();
        }
        if (structural) {
          anim.play();
          build.play();
        } else if (source === 'input' && (changed.has('p') || changed.has('q'))) {
          fitRange();
          anim.play(900);
        }
        updateReadouts();
      },
      action(id) {
        if (id === 'check') runCheck();
        if (id === 'task') newTask();
        if (id === 'play') {
          if (p.mode === 'map') fitMap();
          else fitRange();
          anim.play();
        }
      },
      resetView() {
        fitRange();
        plot.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawPlane(g, R.plane);
        drawCardBody(g, R.card);
        if (anim.running || build.running || verdictTw.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
