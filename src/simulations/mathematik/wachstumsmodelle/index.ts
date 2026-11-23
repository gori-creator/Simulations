import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { checkTask, cobweb, logisticBehaviour, makeTask, stepFn, type Task, compound, continuousCompound, coolingTemp, coolingTime, doseCurve, exactDoubling, keepFraction, peakAfter, rule72, rumor, simpleInterest, steadyPeak, steadyTrough, classify, DATASETS, doublingTime, fit, growthFactor, halfGapTime, inflection, parseData, puzzle, rate, recursive, sse, table, timeTo, value, type Dataset, type ModelKind, type Params } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const KINDS: ModelKind[] = ['linear', 'exp', 'bounded', 'logistic'];
const NAMES: Record<ModelKind, Loc> = {
  linear: L('linear', 'linear'),
  exp: L('exponentiell', 'exponential'),
  bounded: L('beschränkt', 'bounded'),
  logistic: L('logistisch', 'logistic'),
};

/**
 * Wachstumsmodelle im Vergleich: linear, exponentiell, beschränkt und
 * logistisch – explizit als Funktion und rekursiv Schritt für Schritt, mit
 * Änderungsrate über dem Bestand, Kennzeichen in Tabellen (Differenzen,
 * Quotienten), Kennwerten und dem Anpassen an Messdaten.
 */
export default defineSimulation({
  id: 'wachstumsmodelle',
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'compare', label: L('Alle vier im Vergleich', 'All four compared') },
        { value: 'single', label: L('Ein Modell genau', 'One model in detail') },
        { value: 'data', label: L('An Messdaten anpassen', 'Fit to data') },
        { value: 'puzzle', label: L('Rätsel: Welches Modell ist das?', 'Puzzle: which model is it?') },
        { value: 'apps', label: L('Anwendungen aus dem Alltag', 'Everyday applications') },
        { value: 'cobweb', label: L('Rekursiv: Spinnwebdiagramm', 'Recursive: cobweb diagram') },
        { value: 'exam', label: L('Üben: Modell aufstellen', 'Practice: set up the model') },
      ],
      default: 'compare',
    },
    {
      key: 'sc',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'interest', label: L('Sparen mit Zinseszins', 'Saving with compound interest') },
        { value: 'drug', label: L('Medikament im Körper', 'Medicine in the body') },
        { value: 'rumor', label: L('Gerücht in der Schule', 'Rumour at school') },
        { value: 'cooling', label: L('Tee kühlt ab', 'Tea cools down') },
      ],
      default: 'interest',
      visibleIf: (v) => v.mode === 'apps',
    },
    { key: 'K0', type: 'number', label: L('Startkapital K₀', 'Starting capital K₀'), min: 100, max: 10000, step: 50, default: 1000, unit: '€', visibleIf: (v) => v.mode === 'apps' && v.sc === 'interest' },
    { key: 'pz', type: 'number', label: L('Zinssatz p', 'Interest rate p'), min: 0.5, max: 12, step: 0.1, default: 5, unit: '%', visibleIf: (v) => v.mode === 'apps' && v.sc === 'interest' },
    { key: 'yrs', type: 'number', label: L('Laufzeit in Jahren', 'Term in years'), min: 1, max: 60, step: 1, default: 20, visibleIf: (v) => v.mode === 'apps' && v.sc === 'interest' },
    { key: 'dose', type: 'number', label: L('Dosis D', 'Dose D'), min: 50, max: 1000, step: 10, default: 400, unit: 'mg', visibleIf: (v) => v.mode === 'apps' && v.sc === 'drug' },
    { key: 'hl', type: 'number', label: L('Halbwertszeit', 'Half-life'), min: 1, max: 24, step: 0.5, default: 8, unit: 'h', visibleIf: (v) => v.mode === 'apps' && v.sc === 'drug' },
    { key: 'tau', type: 'number', label: L('Einnahme alle', 'Taken every'), min: 2, max: 24, step: 1, default: 8, unit: 'h', visibleIf: (v) => v.mode === 'apps' && v.sc === 'drug' },
    { key: 'N', type: 'number', label: L('Personen an der Schule N', 'People at school N'), min: 20, max: 900, step: 10, default: 400, visibleIf: (v) => v.mode === 'apps' && v.sc === 'rumor' },
    { key: 'kr', type: 'number', label: L('Weitererzählen k', 'Passing on k'), help: L('Wie viele erzählt jede wissende Person pro Tag weiter, solange fast niemand es weiß?', 'How many people does each informed person tell per day while almost nobody knows yet?'), min: 0.1, max: 2, step: 0.05, default: 0.8, visibleIf: (v) => v.mode === 'apps' && v.sc === 'rumor' },
    { key: 'T0', type: 'number', label: L('Anfangstemperatur', 'Initial temperature'), min: 40, max: 100, step: 1, default: 90, unit: '°C', visibleIf: (v) => v.mode === 'apps' && v.sc === 'cooling' },
    { key: 'Tr', type: 'number', label: L('Raumtemperatur', 'Room temperature'), min: -10, max: 35, step: 1, default: 20, unit: '°C', visibleIf: (v) => v.mode === 'apps' && v.sc === 'cooling' },
    { key: 'kc', type: 'number', label: L('Abkühlkonstante k', 'Cooling constant k'), help: L('Pro Minute; größer bei dünner Tasse oder Wind.', 'Per minute; larger for a thin cup or wind.'), min: 0.01, max: 0.3, step: 0.005, default: 0.05, visibleIf: (v) => v.mode === 'apps' && v.sc === 'cooling' },
    { key: 'Tt', type: 'number', label: L('Trinktemperatur', 'Drinking temperature'), min: 25, max: 80, step: 1, default: 50, unit: '°C', visibleIf: (v) => v.mode === 'apps' && v.sc === 'cooling' },
    {
      key: 'model',
      type: 'choice',
      label: L('Modell', 'Model'),
      options: KINDS.map((k) => ({ value: k, label: NAMES[k] })),
      default: 'logistic',
      visibleIf: (v) => v.mode === 'single' || v.mode === 'data' || v.mode === 'cobweb' || v.mode === 'exam',
    },
    { key: 'q', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'exam' },
    { key: 'ds', type: 'choice', label: L('Messdaten', 'Data'), options: [...DATASETS.map((d) => ({ value: d.id, label: d.name })), { value: 'own', label: L('Eigene Messwerte', 'Own data') }], default: 'sunflower', visibleIf: (v) => v.mode === 'data' },
    {
      key: 'own',
      type: 'text',
      label: L('Eigene Messwerte (t;B)', 'Own data (t;B)'),
      default: '0;12 | 1;19 | 2;30 | 3;44 | 4;58 | 5;70 | 6;78 | 7;83',
      maxLength: 300,
      help: L('Paare „Zeit;Bestand“, getrennt mit |. Oder nur Bestände mit Leerzeichen (Zeit 0, 1, 2 …).', 'Pairs “time;amount” separated by |. Or just amounts separated by spaces (time 0, 1, 2 …).'),
      visibleIf: (v) => v.mode === 'data' && v.ds === 'own',
    },
    {
      key: 'guess',
      type: 'choice',
      label: L('Dein Tipp', 'Your guess'),
      options: KINDS.map((k) => ({ value: k, label: NAMES[k] })),
      default: 'linear',
      visibleIf: (v) => v.mode === 'puzzle',
    },
    { key: 'B0', type: 'number', label: L('Anfangsbestand B(0)', 'Initial amount B(0)'), min: 0, max: 500, step: 0.5, default: 10, visibleIf: (v) => v.mode !== 'puzzle' && v.mode !== 'apps' },
    { key: 'd', type: 'number', label: L('Zunahme pro Schritt d (linear)', 'Increase per step d (linear)'), min: -50, max: 50, step: 0.5, default: 8, visibleIf: (v) => v.mode === 'compare' || (v.mode !== 'puzzle' && v.mode !== 'apps' && v.model === 'linear') },
    { key: 'k', type: 'number', label: L('Wachstumskonstante k', 'Growth constant k'), min: -2, max: 3, step: 0.01, default: 0.5, visibleIf: (v) => v.mode === 'compare' || (v.mode !== 'puzzle' && v.mode !== 'apps' && v.model !== 'linear') },
    { key: 'S', type: 'number', label: L('Sättigungsgrenze S', 'Limit S'), min: 1, max: 1000, step: 1, default: 100, visibleIf: (v) => v.mode === 'compare' || (v.mode !== 'puzzle' && v.mode !== 'apps' && (v.model === 'bounded' || v.model === 'logistic')) },
    { key: 'tmax', type: 'number', label: L('Zeitraum bis', 'Time span up to'), min: 4, max: 60, step: 1, default: 14, visibleIf: (v) => v.mode === 'compare' || v.mode === 'single' || v.mode === 'cobweb' },
    { key: 'rec', type: 'boolean', group: 'view', label: L('Rekursiv: Schritte zeigen', 'Recursive: show steps'), default: true, visibleIf: (v) => v.mode === 'single' },
    { key: 'rate', type: 'boolean', group: 'view', label: L('Änderungsrate B′ über B', 'Rate B′ against B'), default: true, visibleIf: (v) => v.mode === 'compare' || v.mode === 'single' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Kennwerte zeigen', 'Show key values'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode === 'compare' || v.mode === 'single' || v.mode === 'apps' || v.mode === 'cobweb' },
    { id: 'check2', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'exam' },
    { id: 'newt', label: L('Neue Aufgabe', 'New task'), visibleIf: (v) => v.mode === 'exam' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'puzzle' },
    { id: 'newp', label: L('Neue Tabelle', 'New table'), visibleIf: (v) => v.mode === 'puzzle' },
    { id: 'fit', label: L('Automatisch anpassen', 'Fit automatically'), primary: true, visibleIf: (v) => v.mode === 'data' },
  ],
  readouts: [
    { key: 'formula', label: L('Funktion', 'Function') },
    { key: 'rec', label: L('Rekursiv', 'Recursive') },
    { key: 'dgl', label: L('Differenzialgleichung', 'Differential equation') },
    { key: 'key', label: L('Kennwert', 'Key value'), spoiler: true },
  ],
  presets: [
    { id: 'compare', label: L('Vergleich: B(0) = 10, S = 100', 'Comparison: B(0) = 10, S = 100'), values: { mode: 'compare', B0: 10, d: 8, k: 0.5, S: 100, tmax: 14 } },
    { id: 'log', label: L('Logistisch: 100/(1 + 9·e^(−0,5t))', 'Logistic: 100/(1 + 9·e^(−0.5t))'), values: { mode: 'single', model: 'logistic', B0: 10, k: 0.5, S: 100, tmax: 14 } },
    { id: 'exp', label: L('Exponentiell: Verdopplung', 'Exponential: doubling'), values: { mode: 'single', model: 'exp', B0: 5, k: 0.23, tmax: 15 } },
    { id: 'decay', label: L('Exponentieller Zerfall', 'Exponential decay'), values: { mode: 'single', model: 'exp', B0: 100, k: -0.2, tmax: 20 } },
    { id: 'bounded', label: L('Beschränkt: Abkühlung', 'Bounded: cooling'), values: { mode: 'single', model: 'bounded', B0: 90, k: 0.1, S: 20, tmax: 40 } },
    { id: 'lin', label: L('Linear: Sparschwein', 'Linear: piggy bank'), values: { mode: 'single', model: 'linear', B0: 40, d: 15, tmax: 12 } },
    { id: 'chaos', label: L('Diskret logistisch mit großem k: Schwingen', 'Discrete logistic with large k: oscillation'), values: { mode: 'single', model: 'logistic', B0: 10, k: 2.3, S: 100, tmax: 40, rec: true } },
    { id: 'sun', label: L('Daten: Sonnenblume', 'Data: sunflower'), values: { mode: 'data', ds: 'sunflower', model: 'logistic', B0: 18, k: 0.4, S: 220 } },
    { id: 'tea', label: L('Daten: Tee kühlt ab', 'Data: tea cooling'), values: { mode: 'data', ds: 'tea', model: 'bounded', B0: 90, k: 0.15, S: 25 } },
    { id: 'puzzle', label: L('Rätsel: Modell an der Tabelle erkennen', 'Puzzle: recognise the model from a table'), values: { mode: 'puzzle' } },
    { id: 'own', label: L('Eigene Messwerte anpassen', 'Fit your own data'), values: { mode: 'data', ds: 'own', model: 'logistic', B0: 12, k: 0.6, S: 90 } },
    { id: 'interest', label: L('Zinseszins: 1000 € zu 5 %', 'Compound interest: €1000 at 5 %'), values: { mode: 'apps', sc: 'interest', K0: 1000, pz: 5, yrs: 20 } },
    { id: 'drug', label: L('Medikament: 400 mg alle 8 Stunden', 'Medicine: 400 mg every 8 hours'), values: { mode: 'apps', sc: 'drug', dose: 400, hl: 8, tau: 8 } },
    { id: 'rumor', label: L('Gerücht breitet sich aus', 'A rumour spreads'), values: { mode: 'apps', sc: 'rumor', N: 400, kr: 0.8 } },
    { id: 'tea', label: L('Wann kann ich den Tee trinken?', 'When can I drink my tea?'), values: { mode: 'apps', sc: 'cooling', T0: 90, Tr: 20, kc: 0.05, Tt: 50 } },
    { id: 'cob1', label: L('Spinnweb: logistisch, k = 0,5 – ruhig gegen S', 'Cobweb: logistic, k = 0.5 – calmly towards S'), values: { mode: 'cobweb', model: 'logistic', B0: 10, k: 0.5, S: 100, tmax: 20 } },
    { id: 'cob2', label: L('Spinnweb: k = 2,3 – Zweier-Zyklus', 'Cobweb: k = 2.3 – two-cycle'), values: { mode: 'cobweb', model: 'logistic', B0: 10, k: 2.3, S: 100, tmax: 40 } },
    { id: 'cob3', label: L('Spinnweb: k = 2,8 – Chaos', 'Cobweb: k = 2.8 – chaos'), values: { mode: 'cobweb', model: 'logistic', B0: 10, k: 2.8, S: 100, tmax: 60 } },
    { id: 'exam', label: L('Üben: Modell aus einem Text aufstellen', 'Practice: set up a model from a text'), values: { mode: 'exam', q: 1, model: 'linear', B0: 10, d: 0, k: 0.1, S: 100 } },
    { id: 'bac', label: L('Daten: Bakterien', 'Data: bacteria'), values: { mode: 'data', ds: 'bacteria', model: 'linear', B0: 2, d: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Wachstumsmodelle: Graphen des Bestands über der Zeit, rekursive Schritte, die Änderungsrate über dem Bestand und Messdaten mit angepasstem Modell.',
      t: 't',
      B: 'B',
      rateAxis: 'B′',
      explicit: 'Explizit',
      recursiveL: 'Rekursiv',
      dglL: 'Änderungsrate',
      sign: 'Kennzeichen',
      signLin: 'gleiche Differenzen ΔB',
      signExp: 'gleiche Quotienten B(t+1) : B(t)',
      signBounded: 'ΔB proportional zum Abstand S − B',
      signLog: 'ΔB proportional zu B · (S − B)',
      doubling: 'Verdopplungszeit',
      half: 'Halbwertszeit',
      factor: 'Wachstumsfaktor pro Schritt',
      gap: 'Abstand zu S halbiert nach',
      infl: 'Wendestelle (B = S/2)',
      maxRate: 'größte Zunahme',
      reach90: '90 % von S erreicht nach',
      table: 'Wertetabelle',
      diff: 'ΔB',
      quot: 'Quotient',
      fitTitle: 'Messdaten und Modell',
      sse: 'Summe der Abweichungsquadrate',
      bestFit: 'Bestes Modell für diese Daten',
      guess: 'Die Tabelle sieht aus wie',
      none: 'kein eindeutiges Muster',
      fitted: 'Angepasst – vergleiche die Abweichungen mit den anderen Modellen.',
      rateTitle: 'Änderungsrate über dem Bestand',
      chaos: 'Rekursiv mit großem k springt der Bestand über S hinaus und schwingt – das stetige Modell nicht.',
      hidden: 'Kennwerte verdeckt',
      unitT: 'Zeit',
      puzzleTitle: 'Rätsel: Welches Modell steckt hinter den Punkten?',
      puzzleAsk: 'Welches Wachstum zeigt diese Tabelle?',
      pzHint: 'Tipp: Rechne Differenzen und Quotienten aufeinanderfolgender Werte. Wähle dann deinen Tipp und drücke „Prüfen“.',
      pzRight: 'Richtig! ✓',
      pzWrong: 'Leider nein – das war {m}.',
      pzScore: '{k} von {n} richtig',
      intT: 'Sparen mit Zinseszins (exponentiell)',
      intG: 'Die Zinsen werden mitverzinst: Jedes Jahr wächst das Kapital um denselben Faktor 1 + p/100. Ohne Zinseszins kämen jedes Jahr nur gleich viele Zinsen dazu (linear).',
      int72: 'Faustregel: Verdopplung nach etwa 72 : p Jahren',
      intMonthly: 'monatliche Zinsgutschrift',
      intSimple: 'ohne Zinseszins (linear)',
      intYear: 'Jahr',
      drugT: 'Medikament im Körper',
      drugG: 'Zwischen zwei Einnahmen baut der Körper exponentiell ab. Mit jeder Dosis steigt die Menge, bis Abbau und Nachschub sich die Waage halten (Gleichgewicht, geometrische Reihe).',
      drugPeak: 'Gleichgewicht: höchstens',
      drugTrough: 'mindestens',
      drugKeep: 'nach τ noch übrig',
      drugN: 'nach der 3. Einnahme',
      dose: 'Einnahme',
      rumT: 'Gerücht in der Schule (logistisch)',
      rumG: 'Am Anfang wissen es wenige – es breitet sich fast exponentiell aus. Später kennen es fast alle, kaum jemand Neues ist noch übrig: Das Wachstum bremst. Am schnellsten geht es, wenn die Hälfte Bescheid weiß.',
      rumHalf: 'Die Hälfte weiß es nach',
      rumAll: '99 % wissen es nach',
      day: 'Tag',
      days: 'Tagen',
      knows: 'weiß es',
      coolT: 'Tee kühlt ab (beschränkt)',
      coolG: 'Je größer der Unterschied zur Raumtemperatur, desto schneller kühlt der Tee ab. Der Abstand zur Raumtemperatur halbiert sich immer in derselben Zeit.',
      coolAfter: 'nach 10 min',
      coolReach: 'trinkbar nach',
      coolHalf: 'Abstand halbiert sich alle',
      minutes: 'min',
      never: 'nie (Grenze wird nicht erreicht)',
      cobT: 'Spinnwebdiagramm: B(n+1) über B(n)',
      cobG: 'Senkrecht zum Graphen von f, waagerecht zur Winkelhalbierenden, wieder senkrecht … So entsteht Schritt für Schritt die Folge. Schnittpunkte mit y = x sind Fixpunkte.',
      cobSeq: 'Folge Bₙ',
      b_decline: 'k ≤ 0: Der Bestand nimmt ab.',
      b_monotone: '0 < k ≤ 1: Die Folge nähert sich S ohne Überschießen.',
      b_damped: '1 < k < 2: Die Folge springt über S und pendelt sich gedämpft ein.',
      b_cycle2: '2 < k < 2,45: Die Folge springt dauerhaft zwischen zwei Werten hin und her.',
      b_cycle4: '2,45 < k < 2,57: Zyklen mit 4, 8, … Werten.',
      b_chaos: 'k > 2,57: Chaos – winzige Änderungen am Anfang ergeben einen völlig anderen Verlauf.',
      b_explode: 'k > 3: Die Folge verlässt den sinnvollen Bereich.',
      exT: 'Üben: Stelle das passende Modell auf',
      exHow: 'Wähle das Modell und stelle B(0), d, k und S passend ein. Dann „Prüfen“.',
      exOk: 'Richtig! Dein Modell passt.',
      exKind: 'Die Art des Wachstums stimmt noch nicht.',
      exWrong: 'Noch nicht richtig:',
      exSol: 'Lösung',
      exScore: '{k} von {n} richtig',
      ownBad: 'Die eigenen Messwerte lassen sich nicht lesen (mindestens 3 Werte).',
    },
    en: {
      canvas: 'Growth models: graphs of the amount over time, recursive steps, the rate of change against the amount and data with a fitted model.',
      t: 't',
      B: 'B',
      rateAxis: 'B′',
      explicit: 'Explicit',
      recursiveL: 'Recursive',
      dglL: 'Rate of change',
      sign: 'Characteristic',
      signLin: 'equal differences ΔB',
      signExp: 'equal ratios B(t+1) : B(t)',
      signBounded: 'ΔB proportional to the gap S − B',
      signLog: 'ΔB proportional to B · (S − B)',
      doubling: 'doubling time',
      half: 'half-life',
      factor: 'growth factor per step',
      gap: 'gap to S halves after',
      infl: 'inflection point (B = S/2)',
      maxRate: 'largest increase',
      reach90: '90% of S reached after',
      table: 'Table of values',
      diff: 'ΔB',
      quot: 'ratio',
      fitTitle: 'Data and model',
      sse: 'sum of squared errors',
      bestFit: 'Best model for this data',
      guess: 'The table looks',
      none: 'no clear pattern',
      fitted: 'Fitted – compare the errors with the other models.',
      rateTitle: 'Rate of change against the amount',
      chaos: 'Recursively with large k the amount overshoots S and oscillates – the continuous model does not.',
      hidden: 'key values hidden',
      unitT: 'time',
      puzzleTitle: 'Puzzle: which model is behind the points?',
      puzzleAsk: 'Which growth does this table show?',
      pzHint: 'Hint: work out differences and ratios of successive values. Then pick your guess and press “Check”.',
      pzRight: 'Correct! ✓',
      pzWrong: 'Sorry, that was {m}.',
      pzScore: '{k} of {n} correct',
      intT: 'Saving with compound interest (exponential)',
      intG: 'Interest earns interest: every year the capital grows by the same factor 1 + p/100. Without compound interest the same amount would be added every year (linear).',
      int72: 'Rule of thumb: doubling after about 72 : p years',
      intMonthly: 'monthly interest',
      intSimple: 'without compound interest (linear)',
      intYear: 'year',
      drugT: 'Medicine in the body',
      drugG: 'Between two doses the body breaks the medicine down exponentially. Each dose raises the amount until breakdown and supply balance out (steady state, geometric series).',
      drugPeak: 'Steady state: at most',
      drugTrough: 'at least',
      drugKeep: 'left after τ',
      drugN: 'after the 3rd dose',
      dose: 'dose',
      rumT: 'Rumour at school (logistic)',
      rumG: 'At first only a few know – it spreads almost exponentially. Later nearly everyone knows and hardly anyone new is left: growth slows down. It is fastest when half know.',
      rumHalf: 'Half know it after',
      rumAll: '99 % know it after',
      day: 'day',
      days: 'days',
      knows: 'knows',
      coolT: 'Tea cools down (bounded)',
      coolG: 'The bigger the difference to room temperature, the faster the tea cools. The gap to room temperature always halves in the same time.',
      coolAfter: 'after 10 min',
      coolReach: 'drinkable after',
      coolHalf: 'gap halves every',
      minutes: 'min',
      never: 'never (limit not reached)',
      cobT: 'Cobweb diagram: B(n+1) against B(n)',
      cobG: 'Up to the graph of f, across to the diagonal, up again … step by step the sequence appears. Intersections with y = x are fixed points.',
      cobSeq: 'sequence Bₙ',
      b_decline: 'k ≤ 0: the amount decreases.',
      b_monotone: '0 < k ≤ 1: the sequence approaches S without overshooting.',
      b_damped: '1 < k < 2: the sequence overshoots S and settles down with damped oscillation.',
      b_cycle2: '2 < k < 2.45: the sequence keeps jumping between two values.',
      b_cycle4: '2.45 < k < 2.57: cycles with 4, 8, … values.',
      b_chaos: 'k > 2.57: chaos – tiny changes at the start give a completely different course.',
      b_explode: 'k > 3: the sequence leaves the meaningful range.',
      exT: 'Practice: set up the right model',
      exHow: 'Choose the model and set B(0), d, k and S. Then tap “Check”.',
      exOk: 'Correct! Your model fits.',
      exKind: 'The type of growth is not right yet.',
      exWrong: 'Not right yet:',
      exSol: 'Solution',
      exScore: '{k} of {n} correct',
      ownBad: 'Your data cannot be read (at least 3 values).',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 3) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 5e-12 ? 0 : v, d) : '–');

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const params = (): Params => ({ B0: p.B0, d: p.d, k: p.k, S: p.S });
    const kind = () => p.model as ModelKind;
    const ownSet = (): Dataset | null => {
      const data = parseData(p.own);
      return data ? { id: 'own', name: L('Eigene Messwerte', 'Own data'), unit: L('', ''), time: L('Zeit', 'time'), truth: 'linear', data } : null;
    };
    const dataset = (): Dataset => (p.ds === 'own' ? (ownSet() ?? DATASETS[0]!) : (DATASETS.find((d) => d.id === p.ds) ?? DATASETS[0]!));
    /** Rätsel: aktuelle Tabelle und Ergebnis der Prüfung. */
    let pz = puzzle(Math.random);
    let pzVerdict: boolean | null = null;
    let pzScore = { right: 0, all: 0 };
    /** Ergebnisse der Anpassung aller Modelle (für den Vergleich). */
    let fits: Record<ModelKind, number> | null = null;

    const COLS: Record<ModelKind, () => string> = {
      linear: () => th().series[5]!,
      exp: () => th().series[1]!,
      bounded: () => th().series[2]!,
      logistic: () => th().series[0]!,
    };

    /* -------------------------------------------------------------- */
    /* Animation und Layout                                            */
    /* -------------------------------------------------------------- */

    const grow = new Tween(1600, ease.inOutCubic);
    grow.play();

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { top: Rect; bottom: Rect | null; card: Rect } {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      const twoPlots = ((p.mode === 'compare' || p.mode === 'single') && p.rate) || p.mode === 'cobweb';
      if (wide()) {
        const mw = Math.round(W * 0.6);
        const main: Rect = { x: pad, y: pad, w: mw - pad, h: H - 2 * pad };
        const card: Rect = { x: mw + pad, y: pad, w: W - mw - 2 * pad, h: H - 2 * pad };
        if (!twoPlots) return { top: main, bottom: null, card };
        const th1 = Math.round(main.h * 0.64);
        return { top: { ...main, h: th1 }, bottom: { x: main.x, y: main.y + th1 + pad, w: main.w, h: main.h - th1 - pad }, card };
      }
      const mh = Math.round(H * 0.55);
      const card: Rect = { x: pad, y: mh + 2 * pad, w: W - 2 * pad, h: H - mh - 3 * pad };
      if (!twoPlots) return { top: { x: pad, y: pad, w: W - 2 * pad, h: mh }, bottom: null, card };
      const th1 = Math.round(mh * 0.62);
      return { top: { x: pad, y: pad, w: W - 2 * pad, h: th1 }, bottom: { x: pad, y: pad + th1 + pad, w: W - 2 * pad, h: mh - th1 - pad }, card };
    }

    let topRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    let botRect: Rect = { x: -100, y: -100, w: 10, h: 10 };
    const inset = (R: Rect) => ({ x: R.x + 4, y: R.y + 4, w: R.w - 8, h: R.h - 8 });
    const plot = new Plot(surface, { x: [0, 14], y: [0, 110], equalAspect: false, region: () => inset(topRect), xAxis: { label: 't' }, yAxis: { label: 'B' } });
    const ratePlot = new Plot(surface, { x: [0, 110], y: [0, 15], equalAspect: false, zoom: false, pan: false, controls: false, region: () => inset(botRect), xAxis: { label: 'B' }, yAxis: { label: 'B′' } });

    /* -------------------------------------------------------------- */
    /* Bereiche                                                        */
    /* -------------------------------------------------------------- */

    function kindsShown(): ModelKind[] {
      return p.mode === 'compare' ? KINDS : [kind()];
    }

    function fitRanges(): void {
      const pr = params();
      if (p.mode === 'puzzle') {
        const hi = Math.max(...pz.values) * 1.15;
        plot.setRange([-0.8, 8.5], [-hi * 0.06, hi]);
        return;
      }
      if (p.mode === 'data') {
        const ds = dataset();
        const tMax = Math.max(...ds.data.map((d) => d.t)) * 1.15;
        const bs = ds.data.map((d) => d.B);
        const hi = Math.max(...bs) * 1.2;
        const lo = Math.min(0, Math.min(...bs));
        plot.setRange([-tMax * 0.1, tMax], [lo - hi * 0.06, hi]);
        return;
      }
      const ts = Array.from({ length: 121 }, (_, i) => (i / 120) * p.tmax);
      let hi = Math.max(p.B0, 1);
      let lo = 0;
      for (const kd of kindsShown()) {
        for (const t of ts) {
          const v = value(kd, pr, t);
          if (!Number.isFinite(v)) continue;
          // exponentielles Wachstum nicht alles bestimmen lassen
          const cap = kd === 'exp' && p.mode === 'compare' ? Math.max(pr.S * 1.6, pr.B0 * 3) : Infinity;
          hi = Math.max(hi, Math.min(v, cap));
          lo = Math.min(lo, v);
        }
        if ((kd === 'bounded' || kd === 'logistic') && p.mode !== 'single') hi = Math.max(hi, pr.S);
        if (kd === 'bounded' || kd === 'logistic') hi = Math.max(hi, pr.S);
      }
      if (p.mode === 'single' && p.rec) for (const v of recursive(kind(), pr, Math.floor(p.tmax))) if (Number.isFinite(v)) hi = Math.max(hi, Math.min(v, pr.S * 3 + 10));
      plot.setRange([-p.tmax * 0.1, p.tmax], [lo - (hi - lo) * 0.07, hi * 1.12]);
      // Änderungsrate über B
      let rMax = 0.1;
      let rMin = 0;
      const bHi = hi * 1.05;
      for (const kd of kindsShown()) {
        for (let i = 0; i <= 80; i++) {
          const B = (bHi * i) / 80;
          const r = rate(kd, pr, B);
          if (Number.isFinite(r)) {
            rMax = Math.max(rMax, Math.min(r, kd === 'exp' ? rate('logistic', pr, pr.S / 2) * 2.5 + 1 : Infinity));
            rMin = Math.min(rMin, r);
          }
        }
      }
      ratePlot.setRange([-bHi * 0.1, bHi], [Math.min(rMin * 1.15, -rMax * 0.12), rMax * 1.15]);
    }
    fitRanges();

    /* -------------------------------------------------------------- */
    /* Zeichnen                                                        */
    /* -------------------------------------------------------------- */

    function drawTop(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      topRect = R;
      drawCard(g, R, t);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      const pr = params();
      const reach = grow.value * (plot.bounds.xMax - plot.bounds.xMin);
      if (p.mode === 'puzzle') {
        const kd = pz.kind;
        if (pzVerdict !== null) plot.fn((x) => value(kd, pz.p, x), { color: COLS[kd](), width: 2.4, alpha: 0.85 });
        pz.values.forEach((v, i) => plot.point(i, v, { color: t.text, radius: 4.5 }));
        plot.end();
        textAt(g, tr('puzzleTitle'), R.x + 70, R.y + 18, t.muted);
        return;
      }
      if (p.mode === 'data') {
        const ds = dataset();
        const kd = kind();
        for (const d of ds.data) {
          const m = value(kd, pr, d.t);
          if (Number.isFinite(m)) plot.segment([d.t, d.B], [d.t, m], { color: withAlpha(t.series[3]!, 0.75), width: 2 });
        }
        plot.fn((x) => value(kd, pr, x), { color: COLS[kd](), width: 2.8 });
        for (const d of ds.data) plot.point(d.t, d.B, { color: t.text, radius: 4.5 });
        plot.end();
        const tl = ds.unit[ctx.lang] ? `${ds.name[ctx.lang]} (${ds.unit[ctx.lang]} · ${ds.time[ctx.lang]})` : ds.name[ctx.lang];
        textAt(g, tl, R.x + 70, R.y + 18, t.muted);
        return;
      }
      // Sättigungsgrenze
      if (kindsShown().some((k) => k === 'bounded' || k === 'logistic')) {
        plot.hline(pr.S, { color: withAlpha(t.text, 0.4), width: 1.2, dash: [6, 5] });
        plot.text(plot.bounds.xMax, pr.S, `S = ${N(pr.S, 1)}`, { color: t.muted, size: 11, weight: '600', align: 'right', offset: [-6, -9], halo: true });
      }
      for (const kd of kindsShown()) {
        plot.fn((x) => value(kd, pr, x), { color: COLS[kd](), width: p.mode === 'compare' ? 2.4 : 2.8, to: reach });

      }
      // rekursive Schritte
      if (p.mode === 'single' && p.rec) {
        const n = Math.floor(p.tmax);
        const seq = recursive(kind(), pr, n);
        const shown = Math.ceil(grow.value * n);
        const col = withAlpha(t.series[3]!, 0.95);
        for (let i = 0; i < shown; i++) {
          const a = seq[i]!;
          const b = seq[i + 1]!;
          if (!Number.isFinite(a) || !Number.isFinite(b)) break;
          plot.segment([i, a], [i + 1, a], { color: col, width: 1.6 });
          plot.segment([i + 1, a], [i + 1, b], { color: col, width: 1.6 });
          plot.point(i + 1, b, { color: col, radius: 3 });
        }
        plot.point(0, seq[0]!, { color: col, radius: 3 });
      }
      // Kennwerte im Graphen
      if (p.show && p.mode === 'single' && grow.value > 0.98) {
        const kd = kind();
        if (kd === 'logistic') {
          const w = inflection(pr);
          if (w && w.t < plot.bounds.xMax) {
            plot.point(w.t, w.B, { color: COLS.logistic(), radius: 6 });
            plot.segment([w.t, 0], [w.t, w.B], { color: withAlpha(COLS.logistic(), 0.5), width: 1.2, dash: [4, 4] });
            plot.text(w.t, w.B, `${tr('infl')}: t = ${N(w.t, 3)}`, { color: COLS.logistic(), size: 12, weight: 'bold', offset: [10, 12], align: 'left', halo: true });
            // Wendetangente
            plot.line([w.t, w.B], [w.t + 1, w.B + w.rate], { color: withAlpha(COLS.logistic(), 0.45), width: 1.4, dash: [6, 4] });
          }
        }
        if (kd === 'exp' && pr.k !== 0) {
          const T = doublingTime(pr.k);
          const target = pr.k > 0 ? pr.B0 * 2 : pr.B0 / 2;
          if (T < plot.bounds.xMax) {
            plot.segment([0, target], [T, target], { color: withAlpha(COLS.exp(), 0.5), width: 1.2, dash: [4, 4] });
            plot.segment([T, 0], [T, target], { color: withAlpha(COLS.exp(), 0.5), width: 1.2, dash: [4, 4] });
            plot.point(T, target, { color: COLS.exp(), radius: 5 });
            plot.text(T, target, `${pr.k > 0 ? tr('doubling') : tr('half')} ${N(T, 3)}`, { color: COLS.exp(), size: 12, weight: 'bold', offset: [10, pr.k > 0 ? 12 : -12], align: 'left', halo: true });
          }
        }
        if (kd === 'bounded' && pr.k > 0) {
          const T = halfGapTime(pr.k);
          const B = value('bounded', pr, T);
          if (T < plot.bounds.xMax) {
            plot.point(T, B, { color: COLS.bounded(), radius: 5 });
            plot.text(T, B, `${tr('gap')} ${N(T, 3)}`, { color: COLS.bounded(), size: 12, weight: 'bold', offset: [10, -12], align: 'left', halo: true });
          }
        }
      }
      plot.end();
      // Legende (Vergleich)
      if (p.mode === 'compare') {
        const gg = surface.g;
        let lx = R.x + 70;
        let ly = R.y + 18;
        gg.save();
        gg.font = `700 12px ${t.font}`;
        gg.textBaseline = 'middle';
        for (const kd of KINDS) {
          const w = gg.measureText(NAMES[kd][ctx.lang]).width + 36;
          if (lx + w > R.x + R.w - 60 && lx > R.x + 70) {
            lx = R.x + 70;
            ly += 16;
          }
          gg.fillStyle = COLS[kd]();
          gg.fillRect(lx, ly - 2, 16, 4);
          gg.fillText(NAMES[kd][ctx.lang], lx + 21, ly);
          lx += gg.measureText(NAMES[kd][ctx.lang]).width + 36;
        }
        gg.restore();
      }
    }

    function drawRate(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      botRect = R;
      drawCard(g, R, t);
      ratePlot.resize();
      ratePlot.begin();
      ratePlot.grid({ minor: false });
      ratePlot.axes();
      const pr = params();
      for (const kd of kindsShown()) ratePlot.fn((B) => (kd === 'linear' || B >= 0 ? rate(kd, pr, B) : NaN), { color: COLS[kd](), width: 2.2 });
      // aktueller Zustand am Ende der Animation
      if (p.mode === 'single') {
        const tNow = grow.value * p.tmax;
        const B = value(kind(), pr, tNow);
        if (Number.isFinite(B)) ratePlot.point(B, rate(kind(), pr, B), { color: COLS[kind()](), radius: 5 });
      }
      ratePlot.end();
      textAt(g, tr('rateTitle'), R.x + 70, R.y + 16, t.muted);
    }

    function textAt(g: CanvasRenderingContext2D, s: string, x: number, y: number, col: string): void {
      g.save();
      // Platz bis zu den Zoom-Knöpfen rechts
      const maxW = Math.max(60, surface.width - x - 90);
      let size = 12;
      g.font = `700 ${size}px ${th().font}`;
      while (size > 9 && g.measureText(s).width > maxW) {
        size -= 0.5;
        g.font = `700 ${size}px ${th().font}`;
      }
      if (g.measureText(s).width > maxW) {
        while (s.length > 4 && g.measureText(s + '…').width > maxW) s = s.slice(0, -1);
        s += '…';
      }
      g.fillStyle = col;
      g.textBaseline = 'middle';
      g.fillText(s, x, y);
      g.restore();
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

    /** Formeln eines Modells (explizit, rekursiv, Änderungsrate). */
    function formulas(kd: ModelKind, pr: Params): { ex: string; rec: string; dgl: string; sign: string } {
      const k = N(pr.k, 3);
      const a = N(growthFactor(pr.k), 4);
      switch (kd) {
        case 'linear':
          return { ex: `B(t) = ${N(pr.B0, 2)} ${pr.d < 0 ? '−' : '+'} ${N(Math.abs(pr.d), 2)}·t`, rec: `B(n+1) = B(n) ${pr.d < 0 ? '−' : '+'} ${N(Math.abs(pr.d), 2)}`, dgl: `B′ = ${N(pr.d, 2)}`, sign: tr('signLin') };
        case 'exp':
          return { ex: `B(t) = ${N(pr.B0, 2)} · e^(${k}·t) = ${N(pr.B0, 2)} · ${a}ᵗ`, rec: `B(n+1) = ${a} · B(n)`, dgl: `B′ = ${k} · B`, sign: tr('signExp') };
        case 'bounded':
          return {
            ex: pr.S - pr.B0 >= 0 ? `B(t) = ${N(pr.S, 2)} − ${N(pr.S - pr.B0, 2)} · e^(−${k}·t)` : `B(t) = ${N(pr.S, 2)} + ${N(pr.B0 - pr.S, 2)} · e^(−${k}·t)`,
            rec: `B(n+1) = B(n) + ${N(1 - Math.exp(-pr.k), 4)} · (${N(pr.S, 2)} − B(n))`,
            dgl: `B′ = ${k} · (${N(pr.S, 2)} − B)`,
            sign: tr('signBounded'),
          };
        case 'logistic':
          return {
            ex: `B(t) = ${N(pr.S, 2)} / (1 + ${N((pr.S - pr.B0) / pr.B0, 3)} · e^(−${k}·t))`,
            rec: `B(n+1) = B(n) + ${k} · B(n) · (1 − B(n)/${N(pr.S, 2)})`,
            dgl: `B′ = ${k} · B · (1 − B/${N(pr.S, 2)})`,
            sign: tr('signLog'),
          };
      }
    }

    function keyValues(kd: ModelKind, pr: Params): { label: string; value: string }[] {
      const out: { label: string; value: string }[] = [];
      if (kd === 'exp' && pr.k !== 0) {
        out.push({ label: pr.k > 0 ? tr('doubling') : tr('half'), value: N(doublingTime(pr.k), 3) });
        out.push({ label: tr('factor'), value: `${N(growthFactor(pr.k), 4)} (${pr.k > 0 ? '+' : '−'}${N(Math.abs(growthFactor(pr.k) - 1) * 100, 1)} %)` });
      }
      if (kd === 'bounded' && pr.k > 0) {
        out.push({ label: tr('gap'), value: N(halfGapTime(pr.k), 3) });
        const t90 = timeTo('bounded', pr, pr.B0 + 0.9 * (pr.S - pr.B0));
        if (t90 !== null) out.push({ label: tr('reach90'), value: N(t90, 3) });
      }
      if (kd === 'logistic') {
        const w = inflection(pr);
        if (w) {
          out.push({ label: tr('infl'), value: `t = ${N(w.t, 3)}` });
          out.push({ label: tr('maxRate'), value: `${N(w.rate, 3)} / ${tr('t')}` });
        }
        const t90 = timeTo('logistic', pr, pr.S * 0.9);
        if (t90 !== null) out.push({ label: tr('reach90'), value: N(t90, 3) });
      }
      if (kd === 'linear') out.push({ label: 'B(10)', value: N(value('linear', pr, 10), 3) });
      return out;
    }

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COLS[p.mode === 'compare' ? 'logistic' : kind()]());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 12.5 : R.w < 440 ? 13.5 : 14.5;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const pr = params();

      if (p.mode === 'cobweb') {
        line([{ s: ctx.t('cobT'), c: COLS[kind()](), w: 800 }], 0.5);
        line([{ s: formulas(kind(), pr).rec, w: 700 }], 0);
        const seq = [pr.B0];
        for (let n = 0; n < 6; n++) seq.push(stepFn(kind(), pr, seq[n]!));
        if (p.show) line([{ s: seq.map((v) => fmt.num(v, 1)).join(' → '), c: t.text, w: 600 }], -2);
        y += 4;
        if (kind() === 'logistic') line([{ s: ctx.t(`b_${logisticBehaviour(pr.k)}`), c: t.series[3]!, w: 700 }], -1);
        line([{ s: ctx.t('cobG'), c: t.muted }], -2);
        return;
      }
      if (p.mode === 'exam') {
        line([{ s: ctx.t('exT'), c: t.series[0]!, w: 800 }], 0.5);
        line([{ s: ctx.lang === 'de' ? task.de : task.en, w: 600 }], 0);
        y += 4;
        line([{ s: formulas(kind(), pr).ex, c: COLS[kind()](), w: 700 }], -0.5);
        if (!exVerdict) line([{ s: ctx.t('exHow'), c: t.muted }], -2);
        else if (exVerdict.ok) line([{ s: ctx.t('exOk'), c: t.series[2]!, w: 800 }], 0);
        else if (exVerdict.wrong.includes('kind')) line([{ s: ctx.t('exKind'), c: t.series[1]!, w: 700 }], -1);
        else line([{ s: `${ctx.t('exWrong')} ${exVerdict.wrong.map((w) => (w === 'B0' ? 'B(0)' : w)).join(', ')}`, c: t.series[1]!, w: 700 }], -1);
        if (exVerdict && !exVerdict.ok && exTries >= 2) line([{ s: `${ctx.t('exSol')}: ${NAMES[task.kind][ctx.lang]}, ${formulas(task.kind, task.answer).ex}`, c: t.muted }], -2);
        if (exScore.all) line([{ s: tr('exScore', { k: exScore.right, n: exScore.all }), c: t.muted, w: 600 }], -2);
        return;
      }

      if (p.mode === 'compare') {
        // Tabelle der vier Modelle
        const n = Math.min(8, Math.floor(p.tmax));
        const step = Math.max(1, Math.round(p.tmax / n));
        const cw = maxW / 5;
        const SHORT: Record<ModelKind, Loc> = { linear: L('lin.', 'lin.'), exp: L('exp.', 'exp.'), bounded: L('beschr.', 'bound.'), logistic: L('log.', 'log.') };
        const head = ['t', ...KINDS.map((k) => SHORT[k][ctx.lang])];
        head.forEach((h, i) => segLine(g, [{ s: h, c: i === 0 ? t.muted : COLS[KINDS[i - 1]!](), w: 700 }], x + i * cw, y, cw - 4, size - 2));
        y += size * 1.5;
        for (let i = 0; i <= n; i++) {
          const tt = i * step;
          if (y > R.y + R.h - size * 9) break;
          segLine(g, [{ s: N(tt, 1), c: t.muted }], x, y, cw - 4, size - 1.5);
          KINDS.forEach((kd, j) => segLine(g, [{ s: N(value(kd, pr, tt), 1), c: t.text, w: 500 }], x + (j + 1) * cw, y, cw - 4, size - 1.5));
          y += size * 1.35;
        }
        y += 8;
        line([{ s: tr('sign'), c: t.muted, w: 700 }], -1.5);
        for (const kd of KINDS) {
          if (y > R.y + R.h - size) break;
          line([{ s: `${NAMES[kd][ctx.lang]}: `, c: COLS[kd](), w: 700 }, { s: formulas(kd, pr).sign, c: t.text }], -2);
        }
        return;
      }

      if (p.mode === 'puzzle') {
        line([{ s: tr('puzzleAsk'), c: t.muted, w: 700 }], -1);
        y += 2;
        const reveal = pzVerdict !== null;
        const heads = reveal ? ['t', 'B', tr('diff'), tr('quot')] : ['t', 'B'];
        const cw = maxW / 4;
        heads.forEach((h, i) => segLine(g, [{ s: h, c: t.muted, w: 700 }], x + i * cw, y, cw - 4, size - 1.5));
        y += size * 1.4;
        pz.values.forEach((v, i) => {
          if (y > R.y + R.h - size * 5) return;
          const prev = i > 0 ? pz.values[i - 1]! : null;
          const cells = [String(i), N(v, 2)];
          if (reveal) cells.push(prev === null ? '' : N(v - prev, 2), prev === null ? '' : N(v / prev, 3));
          cells.forEach((c2, j) => segLine(g, [{ s: c2, c: t.text }], x + j * cw, y, cw - 4, size - 1.5));
          y += size * 1.3;
        });
        y += 6;
        if (pzVerdict !== null) {
          const col = pzVerdict ? th().series[2]! : th().series[3]!;
          line([{ s: pzVerdict ? tr('pzRight') : tr('pzWrong', { m: NAMES[pz.kind][ctx.lang] }), c: col, w: 800 }], 1);
          line([{ s: `${tr('sign')}: ${formulas(pz.kind, pz.p).sign}`, c: COLS[pz.kind](), w: 600 }], -1.5);
        } else line([{ s: tr('pzHint'), c: t.muted }], -2);
        if (pzScore.all) line([{ s: tr('pzScore', { k: pzScore.right, n: pzScore.all }), c: t.muted, w: 600 }], -2);
        return;
      }
      if (p.mode === 'data') {
        const ds = dataset();
        if (p.ds === 'own' && !ownSet()) line([{ s: tr('ownBad'), c: th().series[3]!, w: 600 }], -1.5);
        line([{ s: tr('fitTitle'), c: t.muted, w: 700 }], -1);
        const f = formulas(kind(), pr);
        line([{ s: f.ex, c: COLS[kind()](), w: 700 }], -0.5);
        const e = sse(kind(), pr, ds.data);
        line([{ s: `${tr('sse')}: ${N(e, 2)}`, c: t.text, w: 600 }]);
        const guessK = classify(ds.data.every((d, i) => i === 0 || d.t - ds.data[i - 1]!.t === ds.data[1]!.t - ds.data[0]!.t) ? ds.data.map((d) => d.B) : []);
        line([{ s: `${tr('guess')}: `, c: t.muted }, { s: guessK ? NAMES[guessK][ctx.lang] : tr('none'), c: guessK ? COLS[guessK]() : t.muted, w: 700 }], -1.5);
        y += 6;
        if (fits && p.show) {
          const best = KINDS.reduce((a, b) => (fits![a] <= fits![b] ? a : b));
          line([{ s: tr('fitted'), c: t.muted }], -2);
          for (const kd of KINDS) {
            const v = fits[kd];
            const barMax = Math.max(...KINDS.map((k) => fits![k]));
            const w = (maxW * 0.45 * Math.sqrt(v)) / Math.sqrt(barMax || 1);
            segLine(g, [{ s: NAMES[kd][ctx.lang], c: COLS[kd](), w: kd === best ? 800 : 600 }], x, y, maxW * 0.3, size - 1.5);
            g.save();
            g.fillStyle = withAlpha(COLS[kd](), 0.6);
            roundRect(g, x + maxW * 0.32, y - 5, Math.max(2, w), 10, 4);
            g.fill();
            g.restore();
            segLine(g, [{ s: N(v, 1), c: t.text }], x + maxW * 0.32 + w + 6, y, maxW * 0.25, size - 2);
            y += size * 1.45;
          }
          line([{ s: `${tr('bestFit')}: `, c: t.muted }, { s: NAMES[best][ctx.lang], c: COLS[best](), w: 800 }], -1);
        }
        return;
      }

      // ein Modell
      const kd = kind();
      const f = formulas(kd, pr);
      line([{ s: NAMES[kd][ctx.lang], c: COLS[kd](), w: 800 }], 2);
      line([{ s: `${tr('explicit')}: `, c: t.muted }, { s: f.ex, c: t.text, w: 600 }], -1);
      line([{ s: `${tr('recursiveL')}: `, c: t.muted }, { s: f.rec, c: t.series[3], w: 600 }], -1);
      line([{ s: `${tr('dglL')}: `, c: t.muted }, { s: f.dgl, c: t.text, w: 600 }], -1);
      line([{ s: `${tr('sign')}: `, c: t.muted }, { s: f.sign, c: COLS[kd](), w: 600 }], -1.5);
      y += 4;
      if (p.show) {
        for (const kv of keyValues(kd, pr)) line([{ s: `${kv.label}: `, c: t.muted }, { s: kv.value, c: COLS[kd](), w: 700 }], -1);
        if (kd === 'logistic' && p.rec && pr.k > 2) line([{ s: tr('chaos'), c: t.series[3], w: 600 }], -2);
      } else line([{ s: tr('hidden'), c: t.muted }], -1.5);
      y += 6;
      // Tabelle mit Kennzeichen
      const rows = table(kd, pr, Math.min(8, Math.floor(p.tmax)));
      const cols = kd === 'linear' ? ['t', 'B', tr('diff')] : kd === 'exp' ? ['t', 'B', tr('diff'), tr('quot')] : ['t', 'B', tr('diff'), kd === 'bounded' ? 'ΔB/(S−B)' : 'ΔB/(B(S−B))'];
      const cw = maxW / cols.length;
      if (y > R.y + R.h - size * 4) return;
      cols.forEach((h, i) => segLine(g, [{ s: h, c: t.muted, w: 700 }], x + i * cw, y, cw - 4, size - 2));
      y += size * 1.4;
      for (const r of rows) {
        if (y > R.y + R.h - size) break;
        const cells = [N(r.t, 1), N(r.B, 3), r.diff === null ? '' : N(r.diff, 3)];
        if (kd === 'exp') cells.push(r.quot === null ? '' : N(r.quot, 4));
        if (kd === 'bounded' || kd === 'logistic') cells.push(r.ratio === null ? '' : N(r.ratio, 5));
        cells.forEach((c, i) => segLine(g, [{ s: c, c: i === cells.length - 1 && i >= 2 ? COLS[kd]() : t.text, w: i === cells.length - 1 && i >= 2 ? 700 : 500 }], x + i * cw, y, cw - 4, size - 2));
        y += size * 1.3;
      }
    }

    /* -------------------------------------------------------------- */
    /* Anwendungen aus dem Alltag                                      */
    /* -------------------------------------------------------------- */

    /** Ablauf der Anwendungen (Zeit läuft von 0 bis zum Ende). */
    const appTw = new Tween(4200, ease.inOutCubic);
    const appU = () => (appTw.running ? appTw.value : 1);
    const NUMS = (v: number, d = 2) => fmt.num(v, d);

    interface AppData {
      tEnd: number;
      /** Hauptkurve (Zeit, Wert) */
      main: [number, number][];
      /** Vergleichskurven */
      extra: { pts: [number, number][]; col: string; dash?: number[]; label: string }[];
      yMax: number;
      yMin: number;
      xLabel: string;
      yLabel: string;
      col: string;
    }
    function appData(): AppData {
      const t = th();
      switch (p.sc) {
        case 'interest': {
          const n = p.yrs;
          const main: [number, number][] = [];
          const simple: [number, number][] = [];
          const monthly: [number, number][] = [];
          for (let i = 0; i <= n * 4; i++) {
            const yr = i / 4;
            main.push([yr, compound(p.K0, p.pz, Math.floor(yr))]);
            simple.push([yr, simpleInterest(p.K0, p.pz, yr)]);
            monthly.push([yr, compound(p.K0, p.pz, yr, 12)]);
          }
          return {
            tEnd: n,
            main,
            extra: [
              { pts: monthly, col: withAlpha(t.series[1]!, 0.7), dash: [6, 4], label: ctx.t('intMonthly') },
              { pts: simple, col: t.series[5]!, label: ctx.t('intSimple') },
            ],
            yMax: compound(p.K0, p.pz, n, 12) * 1.1,
            yMin: 0,
            xLabel: ctx.lang === 'de' ? 'Jahre' : 'years',
            yLabel: 'K in €',
            col: t.series[1]!,
          };
        }
        case 'drug': {
          const hours = Math.max(48, p.tau * 8);
          const cv = doseCurve(p.dose, p.hl, p.tau, hours, 0.05);
          const main = cv.t.map((tt, i) => [tt, cv.c[i]!] as [number, number]);
          const peak = steadyPeak(p.dose, p.hl, p.tau);
          return {
            tEnd: hours,
            main,
            extra: [
              { pts: [[0, peak], [hours, peak]], col: withAlpha(t.series[3]!, 0.8), dash: [6, 4], label: ctx.t('drugPeak') },
              { pts: [[0, steadyTrough(p.dose, p.hl, p.tau)], [hours, steadyTrough(p.dose, p.hl, p.tau)]], col: withAlpha(t.series[2]!, 0.8), dash: [6, 4], label: ctx.t('drugTrough') },
            ],
            yMax: peak * 1.15,
            yMin: 0,
            xLabel: 't in h',
            yLabel: 'mg',
            col: t.series[4]!,
          };
        }
        case 'rumor': {
          const days = 30;
          const r = rumor(p.N, 2, p.kr, days);
          return {
            tEnd: days,
            main: r.map((v, i) => [i, v] as [number, number]),
            extra: [{ pts: [[0, p.N], [days, p.N]], col: withAlpha(t.muted, 0.7), dash: [6, 4], label: 'N' }],
            yMax: p.N * 1.12,
            yMin: 0,
            xLabel: ctx.lang === 'de' ? 'Tage' : 'days',
            yLabel: ctx.lang === 'de' ? 'Personen' : 'people',
            col: t.series[0]!,
          };
        }
        default: {
          const tEnd = 60;
          const main: [number, number][] = [];
          for (let i = 0; i <= 240; i++) main.push([(tEnd * i) / 240, coolingTemp(p.T0, p.Tr, p.kc, (tEnd * i) / 240)]);
          return {
            tEnd,
            main,
            extra: [
              { pts: [[0, p.Tr], [tEnd, p.Tr]], col: withAlpha(t.series[5]!, 0.8), dash: [6, 4], label: ctx.lang === 'de' ? 'Raum' : 'room' },
              { pts: [[0, p.Tt], [tEnd, p.Tt]], col: withAlpha(t.series[2]!, 0.8), dash: [3, 4], label: ctx.lang === 'de' ? 'trinkbar' : 'drinkable' },
            ],
            yMax: Math.max(p.T0, p.Tt) + 10,
            yMin: Math.min(p.Tr, 0) - 5,
            xLabel: 't in min',
            yLabel: 'T in °C',
            col: t.series[1]!,
          };
        }
      }
    }
    /** Wert der Hauptkurve zur Zeit tt (lineare Interpolation). */
    function valueAt(pts: [number, number][], tt: number): number {
      let last = pts[0]![1];
      for (let i = 0; i < pts.length; i++) {
        if (pts[i]![0] > tt) break;
        last = pts[i]![1];
      }
      return last;
    }

    /** Anschauliche Zeichnung zur Situation im Rechteck R zur Zeit tt. */
    function drawAppScene(g: CanvasRenderingContext2D, R: Rect, A: AppData, tt: number): void {
      const t = th();
      const val = valueAt(A.main, tt);
      g.save();
      if (p.sc === 'interest') {
        // Münzstapel je Jahr: gesamt (Zinseszins) und ohne Zinseszins
        const n = Math.min(p.yrs, 20);
        const step = p.yrs / n;
        const bw = (R.w - 40) / n;
        const maxV = compound(p.K0, p.pz, p.yrs);
        for (let i = 1; i <= n; i++) {
          const yr = i * step;
          if (yr > tt + 1e-9) break;
          const x = R.x + 20 + (i - 1) * bw;
          const hC = ((R.h - 50) * compound(p.K0, p.pz, Math.round(yr))) / maxV;
          const hS = ((R.h - 50) * simpleInterest(p.K0, p.pz, Math.round(yr))) / maxV;
          const hK = ((R.h - 50) * p.K0) / maxV;
          const yb = R.y + R.h - 22;
          g.fillStyle = withAlpha(t.series[1]!, 0.85);
          roundRect(g, x + 2, yb - hC, bw * 0.55, hC, 3);
          g.fill();
          g.fillStyle = withAlpha(t.series[5]!, 0.6);
          g.fillRect(x + 2, yb - hS, bw * 0.55, 2.5);
          g.fillStyle = withAlpha(t.muted, 0.35);
          g.fillRect(x + 2, yb - hK, bw * 0.55, hK);
        }
        g.font = `600 11px ${t.font}`;
        g.fillStyle = t.muted;
        g.textAlign = 'left';
        g.fillText(ctx.lang === 'de' ? 'grau: Startkapital · rot: mit Zinsen · Strich: ohne Zinseszins' : 'grey: start · red: with interest · bar: without compound interest', R.x + 16, R.y + R.h - 6);
      } else if (p.sc === 'drug') {
        // Einnahmen als Kapseln, „Füllstand“ im Körper
        const tankW = Math.min(60, R.w * 0.14);
        const tx = R.x + R.w - tankW - 20;
        const ty = R.y + 14;
        const th2 = R.h - 40;
        const frac = clamp(val / (A.yMax / 1.15), 0, 1.1);
        g.strokeStyle = t.text;
        g.lineWidth = 2;
        roundRect(g, tx, ty, tankW, th2, 10);
        g.stroke();
        g.fillStyle = withAlpha(t.series[4]!, 0.65);
        const fh = th2 * Math.min(frac, 1);
        roundRect(g, tx + 3, ty + th2 - fh + 3, tankW - 6, Math.max(0, fh - 6), 7);
        g.fill();
        g.font = `700 12px ${t.font}`;
        g.fillStyle = t.text;
        g.textAlign = 'center';
        g.fillText(`${NUMS(val, 0)} mg`, tx + tankW / 2, ty + th2 + 16);
        const doses = Math.floor(tt / p.tau) + 1;
        const cap = Math.min(doses, Math.floor((tx - R.x - 30) / 26));
        for (let i = 0; i < cap; i++) {
          const cx = R.x + 24 + i * 26;
          const cy = R.y + R.h / 2;
          g.save();
          g.translate(cx, cy);
          g.rotate(-0.6);
          g.fillStyle = t.series[1]!;
          roundRect(g, -5, -11, 10, 11, 5);
          g.fill();
          g.fillStyle = t.dark ? '#e8edf5' : '#ffffff';
          g.strokeStyle = withAlpha(t.text, 0.4);
          roundRect(g, -5, 0, 10, 11, 5);
          g.fill();
          g.stroke();
          g.restore();
        }
        g.font = `600 12px ${t.font}`;
        g.fillStyle = t.muted;
        g.textAlign = 'left';
        g.fillText(`${doses} × ${ctx.t('dose')} (${NUMS(p.dose, 0)} mg)`, R.x + 16, R.y + 18);
      } else if (p.sc === 'rumor') {
        // Raster aus Personen, gefärbt, wer es schon weiß
        const N = p.N;
        const cols = Math.ceil(Math.sqrt((N * R.w) / R.h));
        const rows = Math.ceil(N / cols);
        const cw = (R.w - 24) / cols;
        const ch = (R.h - 30) / rows;
        const rad = Math.max(1.5, Math.min(cw, ch) * 0.36);
        const know = Math.round(val);
        // feste, aber gemischte Reihenfolge, in der die Personen es erfahren
        for (let i = 0; i < N; i++) {
          const order = (i * 7919) % N;
          const x = R.x + 12 + (i % cols) * cw + cw / 2;
          const y = R.y + 22 + Math.floor(i / cols) * ch + ch / 2;
          g.fillStyle = order < know ? t.series[0]! : withAlpha(t.muted, 0.3);
          g.beginPath();
          g.arc(x, y, rad, 0, Math.PI * 2);
          g.fill();
        }
        g.font = `700 12px ${t.font}`;
        g.fillStyle = t.text;
        g.textAlign = 'left';
        g.fillText(`${ctx.t('day')} ${NUMS(Math.floor(tt), 0)}: ${NUMS(know, 0)} / ${N} ${ctx.t('knows')}`, R.x + 14, R.y + 14);
      } else {
        // Tasse mit Thermometer
        const cx = R.x + R.w * 0.34;
        const cy = R.y + R.h * 0.58;
        const cw = Math.min(110, R.w * 0.3);
        const chh = cw * 0.8;
        const hot = clamp((val - p.Tr) / Math.max(1, p.T0 - p.Tr), 0, 1);
        g.fillStyle = t.dark ? '#c9cfd8' : '#f4f5f7';
        g.strokeStyle = t.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(cx - cw / 2, cy - chh / 2);
        g.lineTo(cx + cw / 2, cy - chh / 2);
        g.lineTo(cx + cw * 0.4, cy + chh / 2);
        g.lineTo(cx - cw * 0.4, cy + chh / 2);
        g.closePath();
        g.fill();
        g.stroke();
        g.beginPath();
        g.arc(cx + cw / 2 + 6, cy - chh * 0.05, chh * 0.22, -Math.PI / 2, Math.PI / 2);
        g.stroke();
        g.fillStyle = `rgba(150,80,30,${0.75})`;
        g.fillRect(cx - cw / 2 + 4, cy - chh / 2 + 6, cw - 8, 8);
        // Dampf je nach Temperatur
        g.strokeStyle = withAlpha(t.muted, 0.6 * hot);
        g.lineWidth = 2.5;
        for (let k = -1; k <= 1; k++) {
          g.beginPath();
          for (let j = 0; j <= 12; j++) {
            const yy = cy - chh / 2 - 6 - j * 3.5;
            const xx = cx + k * cw * 0.25 + Math.sin(j * 0.8 + tt * 0.6 + k) * 5;
            if (j) g.lineTo(xx, yy);
            else g.moveTo(xx, yy);
          }
          g.stroke();
        }
        // Thermometer
        const thx = R.x + R.w * 0.72;
        const thTop = R.y + 20;
        const thBot = R.y + R.h - 34;
        const Tmin = Math.min(p.Tr, 0) - 5;
        const Tmax = Math.max(p.T0, p.Tt) + 10;
        const Y = (T: number) => thBot - ((T - Tmin) / (Tmax - Tmin)) * (thBot - thTop);
        g.strokeStyle = t.text;
        g.lineWidth = 2;
        roundRect(g, thx - 7, thTop, 14, thBot - thTop + 8, 7);
        g.stroke();
        g.fillStyle = hot > 0.5 ? t.series[1]! : t.series[3]!;
        g.fillRect(thx - 4, Y(val), 8, thBot - Y(val) + 4);
        g.beginPath();
        g.arc(thx, thBot + 10, 10, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = t.series[2]!;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.moveTo(thx - 18, Y(p.Tt));
        g.lineTo(thx + 18, Y(p.Tt));
        g.stroke();
        g.setLineDash([]);
        g.font = `800 15px ${t.font}`;
        g.fillStyle = t.text;
        g.textAlign = 'left';
        g.fillText(`${NUMS(val, 1)} °C`, thx + 18, Y(val));
        g.font = `600 12px ${t.font}`;
        g.fillStyle = t.muted;
        g.fillText(`t = ${NUMS(tt, 1)} min`, R.x + 14, R.y + 18);
      }
      g.restore();
    }

    function drawApps(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const A = appData();
      const tt = A.tEnd * appU();
      drawCard(g, R, t);
      const sceneH = Math.round(R.h * 0.42);
      const scene: Rect = { x: R.x + 6, y: R.y + 6, w: R.w - 12, h: sceneH };
      drawAppScene(g, scene, A, tt);
      topRect = { x: R.x, y: R.y + sceneH + 8, w: R.w, h: R.h - sceneH - 8 };
      plot.setAxes({ x: { label: A.xLabel }, y: { label: A.yLabel } });
      plot.setRange([-A.tEnd * 0.13, A.tEnd * 1.02], [A.yMin - (A.yMax - A.yMin) * 0.06, A.yMax]);
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      for (const e of A.extra) {
        const pts = e.pts.filter((q) => q[0] <= Math.max(tt, e.pts.length === 2 ? A.tEnd : tt));
        if (pts.length > 1) plot.polyline(pts, { color: e.col, width: 2, dash: e.dash });
      }
      const shown = A.main.filter((q) => q[0] <= tt + 1e-9);
      if (shown.length > 1) plot.polyline(shown, { color: A.col, width: 3 });
      const v = valueAt(A.main, tt);
      plot.point(tt, v, { color: A.col, radius: 5 });
      plot.end();
    }

    function drawAppCard(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, appData().col);
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 12.5 : R.w < 440 ? 13.5 : 14.5;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const muted = (txt: string) => line([{ s: txt, c: t.muted }], -2);
      switch (p.sc) {
        case 'interest': {
          line([{ s: ctx.t('intT'), c: t.series[1]!, w: 800 }], 0.5);
          line([{ s: `K(n) = ${NUMS(p.K0, 0)} € · ${NUMS(1 + p.pz / 100, 4)}ⁿ`, w: 700 }], 0.5);
          if (p.show) {
            line([{ s: `K(${p.yrs}) = ${NUMS(compound(p.K0, p.pz, p.yrs), 2)} €`, c: t.series[1]!, w: 800 }], 0);
            line([{ s: `${ctx.t('intSimple')}: ${NUMS(simpleInterest(p.K0, p.pz, p.yrs), 2)} €`, c: t.series[5]! }], -1.5);
            line([{ s: `${ctx.t('intMonthly')}: ${NUMS(compound(p.K0, p.pz, p.yrs, 12), 2)} €`, c: t.muted }], -1.5);
            line([{ s: `${ctx.lang === 'de' ? 'stetig' : 'continuous'} (K₀ · e^(p/100 · n)): ${NUMS(continuousCompound(p.K0, p.pz, p.yrs), 2)} €`, c: t.muted }], -1.5);
            line([{ s: `${ctx.t('doubling')}: ${NUMS(exactDoubling(p.pz), 1)} ${ctx.lang === 'de' ? 'Jahre' : 'years'} (72 : ${NUMS(p.pz, 1)} ≈ ${NUMS(rule72(p.pz), 1)})`, w: 600 }], -1);
          }
          y += 4;
          muted(ctx.t('intG'));
          muted(ctx.t('int72'));
          return;
        }
        case 'drug': {
          const q = keepFraction(p.hl, p.tau);
          line([{ s: ctx.t('drugT'), c: t.series[4]!, w: 800 }], 0.5);
          line([{ s: `Bₙ₊₁ = ${NUMS(q, 3)} · Bₙ + ${NUMS(p.dose, 0)} mg`, w: 700 }], 0.5);
          if (p.show) {
            line([{ s: `${ctx.t('drugKeep')}: q = 0,5^(${NUMS(p.tau, 0)}/${NUMS(p.hl, 1)}) = ${NUMS(q * 100, 1)} %`, c: t.muted }], -1.5);
            line([{ s: `${ctx.t('drugN')}: ${NUMS(peakAfter(p.dose, p.hl, p.tau, 3), 0)} mg`, w: 600 }], -1);
            line([{ s: `${ctx.t('drugPeak')} ${NUMS(steadyPeak(p.dose, p.hl, p.tau), 0)} mg, ${ctx.t('drugTrough')} ${NUMS(steadyTrough(p.dose, p.hl, p.tau), 0)} mg`, c: t.series[3]!, w: 700 }], -1);
            line([{ s: `= D / (1 − q)`, c: t.muted }], -2);
          }
          y += 4;
          muted(ctx.t('drugG'));
          return;
        }
        case 'rumor': {
          const r = rumor(p.N, 2, p.kr, 200);
          const half = r.findIndex((v) => v >= p.N / 2);
          const all = r.findIndex((v) => v >= 0.99 * p.N);
          line([{ s: ctx.t('rumT'), c: t.series[0]!, w: 800 }], 0.5);
          line([{ s: `Iₙ₊₁ = Iₙ + ${NUMS(p.kr, 2)} · Iₙ · (${p.N} − Iₙ) / ${p.N}`, w: 700 }], -0.5);
          if (p.show) {
            line([{ s: `${ctx.t('rumHalf')} ${half >= 0 ? `${half} ${ctx.t('days')}` : '–'}`, c: t.series[0]!, w: 700 }], -1);
            line([{ s: `${ctx.t('rumAll')} ${all >= 0 ? `${all} ${ctx.t('days')}` : '–'}`, w: 600 }], -1);
          }
          y += 4;
          muted(ctx.t('rumG'));
          return;
        }
        default: {
          const reach = coolingTime(p.T0, p.Tr, p.kc, p.Tt);
          line([{ s: ctx.t('coolT'), c: t.series[1]!, w: 800 }], 0.5);
          line([{ s: `T(t) = ${NUMS(p.Tr, 0)} + ${NUMS(p.T0 - p.Tr, 0)} · e^(−${NUMS(p.kc, 3)}·t)`, w: 700 }], 0.5);
          if (p.show) {
            line([{ s: `${ctx.t('coolAfter')}: ${NUMS(coolingTemp(p.T0, p.Tr, p.kc, 10), 1)} °C`, w: 600 }], -1);
            line([{ s: `${ctx.t('coolReach')}: ${reach === null ? ctx.t('never') : `${NUMS(reach, 1)} ${ctx.t('minutes')}`}`, c: t.series[2]!, w: 800 }], 0);
            line([{ s: `${ctx.t('coolHalf')} ${NUMS(Math.log(2) / p.kc, 1)} ${ctx.t('minutes')}`, c: t.muted }], -1.5);
          }
          y += 4;
          muted(ctx.t('coolG'));
          return;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Spinnwebdiagramm                                                */
    /* -------------------------------------------------------------- */

    function drawCobweb(g: CanvasRenderingContext2D, top: Rect, bottom: Rect | null): void {
      const t = th();
      const pr = params();
      const kd = kind();
      const steps = Math.round(p.tmax);
      const seq: number[] = [pr.B0];
      for (let n = 0; n < steps; n++) seq.push(stepFn(kd, pr, seq[n]!));
      const finite = seq.filter((v) => Number.isFinite(v) && Math.abs(v) < 1e6);
      const hi = Math.max(10, ...finite, kd === 'logistic' || kd === 'bounded' ? pr.S * (kd === 'logistic' ? Math.max(1.05, (1 + pr.k) ** 2 / (4 * pr.k) * 1.05) : 1.1) : 0) * 1.08;
      const lo = Math.min(0, ...finite) * 1.08;
      drawCard(g, top, t);
      topRect = top;
      plot.setAxes({ x: { label: 'B(n)' }, y: { label: 'B(n+1)' } });
      plot.setRange([lo - hi * 0.1, hi], [lo - hi * 0.06, hi]);
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      plot.line([0, 0], [1, 1], { color: withAlpha(t.muted, 0.7), width: 1.6, dash: [6, 4] });
      plot.fn((x) => stepFn(kd, pr, x), { color: COLS[kd](), width: 2.6 });
      const cw = cobweb(kd, pr, steps);
      const u = grow.running ? grow.value : 1;
      const n = Math.max(2, Math.ceil(cw.length * u));
      plot.polyline(cw.slice(0, n), { color: t.series[3]!, width: 1.6 });
      if (kd === 'logistic' || kd === 'bounded') plot.point(pr.S, pr.S, { color: t.text, radius: 4 });
      plot.point(pr.B0, 0, { color: t.series[3]!, radius: 5 });
      plot.end();
      if (bottom) {
        drawCard(g, bottom, t);
        botRect = bottom;
        ratePlot.setAxes({ x: { label: 'n' }, y: { label: 'B' } });
        ratePlot.setRange([-steps * 0.1, steps], [lo - hi * 0.12, hi]);
        ratePlot.resize();
        ratePlot.begin();
        ratePlot.grid();
        ratePlot.axes();
        const shownN = Math.ceil((seq.length - 1) * u);
        const pts = seq.slice(0, shownN + 1).map((v, i) => [i, clamp(v, lo - hi, hi * 2)] as [number, number]);
        ratePlot.polyline(pts, { color: withAlpha(COLS[kd](), 0.6), width: 1.4 });
        for (const q of pts) ratePlot.point(q[0], q[1], { color: COLS[kd](), radius: 2.6 });
        ratePlot.end();
      }
    }

    /* -------------------------------------------------------------- */
    /* Übung: Modell aufstellen                                        */
    /* -------------------------------------------------------------- */

    let task: Task = makeTask(1);
    let exVerdict: { ok: boolean; wrong: string[] } | null = null;
    let exScore = { right: 0, all: 0 };
    let exTries = 0;
    function drawExam(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t);
      topRect = R;
      const ans = task.answer;
      const tEnd = task.kind === 'linear' ? Math.max(4, Math.min(20, Math.abs(ans.B0 / (ans.d || 1)) * 1.1)) : task.kind === 'exp' ? (ans.k > 0 ? 3 * (Math.log(2) / ans.k) : 4 * (Math.log(2) / -ans.k)) : 4 / Math.max(ans.k, 0.05) + 2;
      const yHi = Math.max(...Array.from({ length: 41 }, (_, i) => value(task.kind, ans, (tEnd * i) / 40)), ...Array.from({ length: 41 }, (_, i) => value(kind(), params(), (tEnd * i) / 40)).filter((v) => Number.isFinite(v) && v < ans.B0 * 50)) * 1.12;
      plot.setAxes({ x: { label: 't' }, y: { label: 'B' } });
      plot.setRange([-tEnd * 0.13, tEnd], [-yHi * 0.08, Math.max(yHi, 1)]);
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      plot.fn((x) => value(kind(), params(), x), { color: COLS[kind()](), width: 2.8, from: 0 });
      if (exVerdict && !exVerdict.ok && exTries >= 2) plot.fn((x) => value(task.kind, ans, x), { color: withAlpha(t.muted, 0.8), width: 2, dash: [6, 4], from: 0 });
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      if (p.mode === 'puzzle') {
        ['formula', 'rec', 'dgl', 'key'].forEach((k) => ctx.readout(k, null));
        return;
      }
      if (p.mode === 'apps') {
        if (p.sc === 'interest') {
          ctx.readout('formula', `K(n) = ${NUMS(p.K0, 0)} · ${NUMS(1 + p.pz / 100, 4)}ⁿ`);
          ctx.readout('rec', `Kₙ₊₁ = ${NUMS(1 + p.pz / 100, 4)} · Kₙ`);
          ctx.readout('dgl', null);
          ctx.readout('key', `K(${p.yrs}) = ${NUMS(compound(p.K0, p.pz, p.yrs), 2)} €`);
        } else if (p.sc === 'drug') {
          ctx.readout('formula', null);
          ctx.readout('rec', `Bₙ₊₁ = ${NUMS(keepFraction(p.hl, p.tau), 3)} · Bₙ + ${NUMS(p.dose, 0)}`);
          ctx.readout('dgl', null);
          ctx.readout('key', `${NUMS(steadyTrough(p.dose, p.hl, p.tau), 0)} … ${NUMS(steadyPeak(p.dose, p.hl, p.tau), 0)} mg`);
        } else if (p.sc === 'rumor') {
          ctx.readout('formula', null);
          ctx.readout('rec', `Iₙ₊₁ = Iₙ + ${NUMS(p.kr, 2)} · Iₙ · (N − Iₙ)/N`);
          ctx.readout('dgl', null);
          const r = rumor(p.N, 2, p.kr, 200);
          ctx.readout('key', `${ctx.t('rumHalf')} ${r.findIndex((v) => v >= p.N / 2)} ${ctx.t('days')}`);
        } else {
          ctx.readout('formula', `T(t) = ${NUMS(p.Tr, 0)} + ${NUMS(p.T0 - p.Tr, 0)} · e^(−${NUMS(p.kc, 3)}·t)`);
          ctx.readout('rec', null);
          ctx.readout('dgl', `T′ = −${NUMS(p.kc, 3)} · (T − ${NUMS(p.Tr, 0)})`);
          const reach = coolingTime(p.T0, p.Tr, p.kc, p.Tt);
          ctx.readout('key', reach === null ? ctx.t('never') : `${ctx.t('coolReach')} ${NUMS(reach, 1)} min`);
        }
        return;
      }
      const pr = params();
      const kd = p.mode === 'compare' ? 'logistic' : kind();
      const f = formulas(kd, pr);
      ctx.readout('formula', f.ex);
      ctx.readout('rec', f.rec);
      ctx.readout('dgl', f.dgl);
      const kv = keyValues(kd, pr)[0];
      ctx.readout('key', kv ? `${kv.label}: ${kv.value}` : '–');
    }

    function autoFit(): void {
      const ds = dataset();
      const start: Params = { ...params(), B0: ds.data[0]!.B };
      const all = {} as Record<ModelKind, number>;
      let chosen: Params | null = null;
      for (const kd of KINDS) {
        const r = fit(kd, ds.data, start);
        all[kd] = r.sse;
        if (kd === kind()) chosen = r.p;
      }
      fits = all;
      if (chosen) {
        const round = (v: number, s: number) => Math.round(v / s) * s;
        ctx.set({ B0: clamp(round(chosen.B0, 0.5), 0, 500), d: clamp(round(chosen.d, 0.5), -50, 50), k: clamp(round(chosen.k, 0.01), -2, 3), S: clamp(round(chosen.S, 1), 1, 1000) });
      }
    }

    return {
      update(changed, source) {
        if (['mode', 'model', 'B0', 'd', 'k', 'S', 'tmax', 'ds', 'rec', 'rate', 'own'].some((q) => changed.has(q)) || source === 'init' || source === 'replace') fitRanges();
        if (changed.has('ds') || changed.has('mode') || changed.has('own')) fits = null;
        if (['mode', 'model', 'tmax', 'ds'].some((q) => changed.has(q)) || source === 'init' || source === 'replace') grow.play();
        if (p.mode === 'apps' && (['mode', 'sc'].some((q) => changed.has(q)) || source === 'init' || source === 'replace')) appTw.play();
        if (changed.has('q') || changed.has('mode') || source === 'init' || source === 'replace') {
          task = makeTask(p.q);
          exVerdict = null;
          exTries = 0;
        }
        if (p.mode === 'exam' && ['model', 'B0', 'd', 'k', 'S'].some((q) => changed.has(q))) exVerdict = null;
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'play') {
          grow.play();
          if (p.mode === 'apps') appTw.play();
        }
        if (id === 'fit') autoFit();
        if (id === 'check' && pzVerdict === null) {
          pzVerdict = p.guess === pz.kind;
          pzScore = { right: pzScore.right + (pzVerdict ? 1 : 0), all: pzScore.all + 1 };
        }
        if (id === 'check2') {
          exVerdict = checkTask(task, kind(), params());
          exTries += 1;
          if (exTries === 1 || exVerdict.ok) exScore = { right: exScore.right + (exVerdict.ok && exTries === 1 ? 1 : 0), all: exScore.all + (exTries === 1 ? 1 : 0) };
        }
        if (id === 'newt') ctx.set({ q: p.q >= 999 ? 1 : p.q + 1 });
        if (id === 'newp') {
          pz = puzzle(Math.random);
          pzVerdict = null;
          fitRanges();
        }
        ctx.requestRender();
      },
      resetView() {
        fitRanges();
        plot.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        if (p.mode === 'cobweb') {
          drawCobweb(g, R.top, R.bottom);
          drawCardBody(g, R.card);
          if (grow.running) ctx.requestRender();
          return;
        }
        if (p.mode === 'exam') {
          botRect = { x: -100, y: -100, w: 10, h: 10 };
          drawExam(g, R.top);
          drawCardBody(g, R.card);
          return;
        }
        if (p.mode === 'apps') {
          botRect = { x: -100, y: -100, w: 10, h: 10 };
          drawApps(g, R.top);
          drawAppCard(g, R.card);
          if (appTw.running) ctx.requestRender();
          return;
        }
        drawTop(g, R.top);
        if (R.bottom) drawRate(g, R.bottom);
        else botRect = { x: -100, y: -100, w: 10, h: 10 };
        drawCardBody(g, R.card);
        if (grow.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
