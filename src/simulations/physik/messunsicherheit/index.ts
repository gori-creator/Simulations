import { clamp, defineSimulation, drawCard, ease, mixColor, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { axisTicks, calculationSteps, FORMULAS, PENDULUM_T, periodFromStops, simulatedStops, stopUncertainty, monteCarlo, noniusLine, noniusReading, noniusScale, normalDensity, propagate, roundResult, varianceShares, type FormulaId, type NoniusKind, repeatedExperiments, squaredResiduals, combinedUncertainty, dataRange, DEFAULT_DATA, FIT_DATA, fitUncertainty, histogram, instrumentReading, linearFit, MAX_POINTS, parseData, resolutionUncertainty, sampleMeasurements, serializeData, statistics, timedPoints, type LinearFit, type Point, type Statistics } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'measure' | 'series' | 'fit' | 'repeat' | 'caliper' | 'propagate' | 'stopwatch';
interface Chart { rect: Rect; x: (v: number) => number; y: (v: number) => number; inverseY: (v: number) => number }
interface Hit { id: number; x: number; y: number }
interface Layout { main: Rect; side: Rect; foot: Rect; wide: boolean }

/** Vom Ablesen am Lineal über Wiederholungsmessungen zur Ausgleichsgeraden. */
export default defineSimulation({
  id: 'messunsicherheit',
  animated: true,
  dragHint: true,
  hint: L('Ziehe den Ablesezeiger oder einen Messpunkt. Alle Werte lassen sich auch mit den Reglern bearbeiten.', 'Drag the reading pointer or a measured point. All values can also be edited with the controls.'),
  layout: { aspect: 1.5, aspectNarrow: 0.56 },
  resultsParam: 'show',
  groups: [
    { id: 'experiment', label: L('Beispielmessungen erzeugen', 'Generate example measurements') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'mode', type: 'choice', label: L('Ansicht', 'View'), options: [
      { value: 'measure', label: L('1 · Am Lineal messen', '1 · Read the ruler') },
      { value: 'series', label: L('2 · Messreihe auswerten', '2 · Analyse repeated measurements') },
      { value: 'fit', label: L('3 · Ausgleichsgerade', '3 · Best-fit line') },
      { value: 'repeat', label: L('4 · Warum häufiger messen?', '4 · Why repeat measurements?') },
      { value: 'caliper', label: L('5 · Messschieber mit Nonius', '5 · Vernier caliper') },
      { value: 'propagate', label: L('6 · Unsicherheit weitergeben', '6 · Propagating uncertainty') },
      { value: 'stopwatch', label: L('7 · Zeit stoppen: Reaktionszeit', '7 · Timing: reaction time') },
    ], default: 'series' },
    { key: 'data', type: 'text', label: L('Messwerte in cm (mit Semikolon trennen)', 'Measurements in cm (separate with semicolons)'), default: DEFAULT_DATA, maxLength: 240, visibleIf: (v) => v.mode !== 'repeat' && v.mode !== 'caliper' && v.mode !== 'propagate' && v.mode !== 'stopwatch',
      help: L('Bis zu 20 Werte zwischen −100 und 100. Dezimalkomma oder Dezimalpunkt, z. B. 9,8; 10,1; 9,9. Die Eingabe wird im Link gespeichert.', 'Up to 20 values from −100 to 100. Decimal comma or point, e.g. 9.8; 10.1; 9.9. The shared link stores your data.') },
    { key: 'pick', type: 'number', label: L('Messpunkt auswählen', 'Select measurement'), min: 1, max: MAX_POINTS, step: 1, default: 1, visibleIf: (v) => v.mode === 'series' || v.mode === 'fit' },
    { key: 'value', type: 'number', label: L('Ausgewählten Wert bearbeiten', 'Edit selected value'), min: -100, max: 100, step: 0.01, default: 9.8, unit: 'cm', visibleIf: (v) => v.mode === 'series' || v.mode === 'fit',
      help: L('Der Regler ändert den ausgewählten Eintrag der Messreihe. Die Textliste enthält immer alle Messwerte.', 'This control changes the selected entry. The text field always contains all measurements.') },
    { key: 'repn', type: 'number', label: L('Messungen je Versuch', 'Readings per experiment'), min: 1, max: 100, step: 1, default: 5, visibleIf: (v) => v.mode === 'repeat' },
    { key: 'manual', type: 'boolean', label: L('Gerade selbst anpassen', 'Fit a line yourself'), default: false, visibleIf: (v) => v.mode === 'fit' },
    { key: 'a', type: 'number', label: L('Eigene Steigung a', 'Your slope a'), min: -20, max: 20, step: 0.01, default: 1.5, unit: 'cm/s', visibleIf: (v) => v.mode === 'fit' && v.manual === true },
    { key: 'b', type: 'number', label: L('Eigener Achsenabschnitt b', 'Your intercept b'), min: -100, max: 100, step: 0.01, default: 1, unit: 'cm', visibleIf: (v) => v.mode === 'fit' && v.manual === true },
    { key: 'steps', type: 'boolean', group: 'view', label: L('Streuung Schritt für Schritt', 'Scatter step by step'), default: false, visibleIf: (v) => v.mode === 'series' },
    { key: 'step', type: 'number', label: L('Rechenschritt', 'Calculation step'), min: 1, max: 20, step: 1, default: 1, visibleIf: (v) => v.mode === 'series' && v.steps === true },
    { key: 'dt', type: 'number', label: L('Zeitabstand Δt', 'Time interval Δt'), min: 0, max: 5, step: 0.1, default: 1, unit: 's', visibleIf: (v) => v.mode === 'fit',
      help: L('Messzeiten: 0, Δt, 2Δt, …; sie gelten hier als exakt. Bei Δt = 0 ist keine Steigung bestimmbar.', 'Measurement times: 0, Δt, 2Δt, …; treated as exact. At Δt = 0 a slope cannot be determined.') },
    { key: 'bar', type: 'number', label: L('Unsicherheit eines Ortswertes u(y)', 'Uncertainty of a position u(y)'), min: 0, max: 3, step: 0.05, default: 0.2, unit: 'cm', visibleIf: (v) => v.mode === 'fit' },
    { key: 'length', type: 'number', label: L('Referenzlänge', 'Reference length'), min: 2, max: 18, step: 0.01, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'measure' },
    { key: 'cursor', type: 'number', label: L('Ablesezeiger', 'Reading pointer'), min: 0, max: 20, step: 0.01, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'measure' },
    { key: 'res', type: 'choice', label: L('Skalenteilung d', 'Scale division d'), options: [
      { value: '1', label: L('1 cm · grob', '1 cm · coarse') },
      { value: '0.1', label: L('0,1 cm = 1 mm', '0.1 cm = 1 mm') },
      { value: '0.01', label: L('0,01 cm = 0,1 mm · vergrößert', '0.01 cm = 0.1 mm · enlarged') },
    ], default: '0.1', visibleIf: (v) => v.mode === 'series' || v.mode === 'measure' },
    { key: 'offset', type: 'number', group: 'experiment', label: L('Systematische Abweichung', 'Systematic offset'), min: -2, max: 2, step: 0.05, default: 0, unit: 'cm', visibleIf: (v) => v.mode !== 'caliper' && v.mode !== 'propagate' && v.mode !== 'stopwatch',
      help: L('Wirkt auf neue Beispielmessungen, nicht rückwirkend auf die Liste. Häufiges Messen beseitigt diesen Versatz nicht.', 'Affects new example measurements, not existing data. Repetition does not remove this offset.') },
    { key: 'noise', type: 'number', group: 'experiment', label: L('Zufällige Streuung σ', 'Random scatter σ'), min: 0, max: 2, step: 0.05, default: 0.15, unit: 'cm', visibleIf: (v) => v.mode !== 'caliper' && v.mode !== 'propagate' && v.mode !== 'stopwatch' },
    { key: 'count', type: 'number', group: 'experiment', label: L('Anzahl neuer Messungen', 'Number of new measurements'), min: 1, max: MAX_POINTS, step: 1, default: 5, visibleIf: (v) => v.mode !== 'repeat' && v.mode !== 'caliper' && v.mode !== 'propagate' && v.mode !== 'stopwatch' },
    { key: 'seed', type: 'number', group: 'experiment', label: L('Versuchsnummer (reproduzierbar)', 'Experiment number (reproducible)'), min: 1, max: 999, step: 1, default: 17, visibleIf: (v) => v.mode !== 'caliper' },
    { key: 'jaw', type: 'number', label: L('Gemessene Länge (Schieber)', 'Measured length (slider)'), min: 0, max: 60, step: 0.01, default: 23.4, unit: 'mm', visibleIf: (v) => v.mode === 'caliper' },
    { key: 'nonius', type: 'choice', label: L('Nonius', 'Vernier'), options: [
      { value: '0.1', label: L('1/10 mm (10 Teile auf 9 mm)', '1/10 mm (10 parts on 9 mm)') },
      { value: '0.05', label: L('1/20 mm (20 Teile auf 39 mm)', '1/20 mm (20 parts on 39 mm)') },
    ], default: '0.1', visibleIf: (v) => v.mode === 'caliper' },
    { key: 'quiz', type: 'boolean', label: L('Üben: Ablesung selbst eintragen', 'Practice: enter the reading yourself'), default: false, visibleIf: (v) => v.mode === 'caliper' },
    { key: 'guess', type: 'number', label: L('Deine Ablesung', 'Your reading'), min: 0, max: 60, step: 0.05, default: 0, unit: 'mm', visibleIf: (v) => v.mode === 'caliper' && v.quiz === true },
    { key: 'formula', type: 'choice', label: L('Formel', 'Formula'), options: [
      { value: 'area', label: L('Fläche A = l · b', 'Area A = l · b') },
      { value: 'speed', label: L('Geschwindigkeit v = s / t', 'Speed v = s / t') },
      { value: 'density', label: L('Dichte ρ = m / V', 'Density ρ = m / V') },
      { value: 'pendulum', label: L('Fallbeschleunigung g = 4π² · l / T²', 'Gravity g = 4π² · l / T²') },
    ], default: 'pendulum', visibleIf: (v) => v.mode === 'propagate' },
    { key: 'x1', type: 'number', label: L('Erste Messgröße x₁', 'First quantity x₁'), help: L('l, s, m bzw. l – je nach Formel (Einheit steht im Bild).', 'l, s, m or l – depending on the formula (unit shown in the picture).'), min: 0.01, max: 100, step: 0.001, default: 1, visibleIf: (v) => v.mode === 'propagate' },
    { key: 'u1', type: 'number', label: L('Unsicherheit u(x₁)', 'Uncertainty u(x₁)'), min: 0, max: 10, step: 0.001, default: 0.005, visibleIf: (v) => v.mode === 'propagate' },
    { key: 'x2', type: 'number', label: L('Zweite Messgröße x₂', 'Second quantity x₂'), help: L('b, t, V bzw. T – je nach Formel.', 'b, t, V or T – depending on the formula.'), min: 0.01, max: 100, step: 0.001, default: 2.006, visibleIf: (v) => v.mode === 'propagate' },
    { key: 'u2', type: 'number', label: L('Unsicherheit u(x₂)', 'Uncertainty u(x₂)'), min: 0, max: 10, step: 0.001, default: 0.01, visibleIf: (v) => v.mode === 'propagate' },
    { key: 'periods', type: 'choice', label: L('Gestoppte Schwingungen', 'Oscillations timed'), options: [
      { value: '1', label: L('1 Schwingung', '1 oscillation') },
      { value: '10', label: L('10 Schwingungen', '10 oscillations') },
    ], default: '10', visibleIf: (v) => v.mode === 'stopwatch' },
    { key: 'mc', type: 'boolean', group: 'view', label: L('Probe mit 400 simulierten Messungen', 'Check with 400 simulated measurements'), default: true, visibleIf: (v) => v.mode === 'propagate' },
    { key: 'slope', type: 'number', group: 'experiment', label: L('Beispielgeschwindigkeit', 'Example velocity'), min: -3, max: 3, step: 0.1, default: 2, unit: 'cm/s', visibleIf: (v) => v.mode === 'fit' },
    { key: 'hist', type: 'boolean', group: 'view', label: L('Häufigkeiten statt Abweichungen', 'Frequencies instead of deviations'), default: false, visibleIf: (v) => v.mode === 'series' },
    { key: 'band', type: 'boolean', group: 'view', label: L('Unsicherheitsbereiche', 'Uncertainty bands'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Auswertung anzeigen', 'Show results'), default: true },
  ],
  actions: [
    { id: 'next', label: L('Nächster Rechenschritt', 'Next calculation step'), visibleIf: (v) => v.mode === 'series' && v.steps === true },
    { id: 'best', label: L('Beste Gerade zeigen', 'Show best-fit line'), visibleIf: (v) => v.mode === 'fit' && v.manual === true },
    { id: 'record', label: L('Ablesung übernehmen', 'Record reading'), primary: true, visibleIf: (v) => v.mode === 'measure' },
    { id: 'generate', label: L('Neue Beispielmessreihe', 'New example series'), primary: true, visibleIf: (v) => v.mode !== 'repeat' && v.mode !== 'caliper' && v.mode !== 'propagate' && v.mode !== 'stopwatch' },
    { id: 'newobj', label: L('Neuer Gegenstand', 'New object'), primary: true, visibleIf: (v) => v.mode === 'caliper' },
    { id: 'check', label: L('Ablesung prüfen', 'Check reading'), visibleIf: (v) => v.mode === 'caliper' && v.quiz === true },
    { id: 'sw', label: L('Start / Stopp', 'Start / Stop'), primary: true, visibleIf: (v) => v.mode === 'stopwatch' },
    { id: 'swauto', label: L('5 Messungen simulieren', 'Simulate 5 measurements'), visibleIf: (v) => v.mode === 'stopwatch' },
    { id: 'swclear', label: L('Messungen löschen', 'Clear measurements'), visibleIf: (v) => v.mode === 'stopwatch' },
    { id: 'append', label: L('Eine Messung ergänzen', 'Add one measurement'), visibleIf: (v) => v.mode === 'series' || v.mode === 'fit' },
    { id: 'remove', label: L('Ausgewählten Punkt löschen', 'Delete selected point'), visibleIf: (v) => v.mode === 'series' || v.mode === 'fit' },
    { id: 'clear', label: L('Messwerte löschen', 'Clear measurements'), visibleIf: (v) => v.mode !== 'repeat' && v.mode !== 'caliper' && v.mode !== 'propagate' && v.mode !== 'stopwatch' },
  ],
  presets: [
    { id: 'start', label: L('Fünf Längenmessungen', 'Five length measurements'), values: {} },
    { id: 'ruler', label: L('Lineal ablesen', 'Read a ruler'), values: { mode: 'measure', length: 10.37, cursor: 10.4 } },
    { id: 'same', label: L('Alle Werte gleich', 'Identical readings'), values: { data: '10; 10; 10; 10; 10', value: 10 } },
    { id: 'outlier', label: L('Ein auffälliger Messwert', 'One unusual measurement'), values: { data: '9.8; 10.1; 9.9; 10.2; 12', pick: 5, value: 12 } },
    { id: 'fit', label: L('Bewegung mit 2 cm/s', 'Motion at 2 cm/s'), values: { mode: 'fit', data: FIT_DATA, value: 1.1 } },
    { id: 'caliper', label: L('Messschieber: 23,4 mm', 'Caliper: 23.4 mm'), values: { mode: 'caliper', jaw: 23.4, nonius: '0.1', quiz: false } },
    { id: 'caliper20', label: L('Messschieber mit 1/20-Nonius', 'Caliper with 1/20 vernier'), values: { mode: 'caliper', jaw: 12.35, nonius: '0.05', quiz: false } },
    { id: 'caliperq', label: L('Messschieber üben', 'Practise the caliper'), values: { mode: 'caliper', jaw: 37.6, nonius: '0.1', quiz: true, guess: 0 } },
    { id: 'stop1', label: L('Stoppen: eine Schwingung', 'Timing: one oscillation'), values: { mode: 'stopwatch', periods: '1' } },
    { id: 'stop10', label: L('Stoppen: zehn Schwingungen', 'Timing: ten oscillations'), values: { mode: 'stopwatch', periods: '10' } },
    { id: 'pend', label: L('Pendel: g aus l und T', 'Pendulum: g from l and T'), values: { mode: 'propagate', formula: 'pendulum', x1: 1, u1: 0.005, x2: 2.006, u2: 0.01 } },
    { id: 'area', label: L('Fläche eines Rechtecks', 'Area of a rectangle'), values: { mode: 'propagate', formula: 'area', x1: 2, u1: 0.1, x2: 3, u2: 0.1 } },
    { id: 'dens', label: L('Dichte von Aluminium', 'Density of aluminium'), values: { mode: 'propagate', formula: 'density', x1: 27, u1: 0.1, x2: 10, u2: 0.5 } },
    { id: 'offset', label: L('Präzise, aber verschoben', 'Precise but shifted'), values: { data: '10.8; 11.1; 10.9; 11.2; 11', offset: 1, value: 10.8 } },
  ],
  readouts: [
    { key: 'repeat', label: L('40 unabhängige Versuche', '40 independent experiments'), spoiler: true },
    { key: 'caliper', label: L('Ablesung am Messschieber', 'Caliper reading'), spoiler: true },
    { key: 'prop', label: L('Weitergegebene Unsicherheit', 'Propagated uncertainty'), spoiler: true },
    { key: 'stop', label: L('Gestoppte Periodendauer', 'Timed period'), spoiler: true },
    { key: 'manual', label: L('Eigene Gerade im Vergleich', 'Your line compared'), spoiler: true },
    { key: 'calculation', label: L('Rechenweg für die Streuung', 'Calculating the scatter'), spoiler: true },
    { key: 'status', label: L('Messdaten', 'Measurement data') },
    { key: 'table', label: L('Messprotokoll', 'Measurement log') },
    { key: 'reading', label: L('Ablesung', 'Reading') },
    { key: 'mean', label: L('Mittelwert', 'Mean'), spoiler: true },
    { key: 'sd', label: L('Streuung der Einzelwerte', 'Scatter of individual readings'), spoiler: true },
    { key: 'sem', label: L('Statistische Unsicherheit des Mittelwerts', 'Statistical uncertainty of the mean'), spoiler: true },
    { key: 'combined', label: L('Auflösung und Standardunsicherheit', 'Resolution and standard uncertainty'), spoiler: true },
    { key: 'fit', label: L('Ausgleichsgerade', 'Best-fit line'), spoiler: true },
    { key: 'quality', label: L('Abweichungen von der Geraden', 'Residuals'), spoiler: true },
    { key: 'note', label: L('Was das Modell voraussetzt', 'Model assumptions') },
  ],
  strings: {
    de: {
      swT: 'Pendel stoppen', swSide: 'Deine Messungen von T', swRun: 'läuft …', swReady: 'bereit',
      swHow: 'Tippe auf „Start / Stopp“, wenn das Pendel ganz rechts umkehrt, und noch einmal nach {n} Schwingung(en).',
      swWhy: 'Beim Drücken reagierst du etwa 0,2 s zu spät – beim Start und beim Stopp. Was bleibt, ist die Schwankung deiner Reaktion. Stoppst du 10 Schwingungen, verteilt sie sich auf 10 Perioden: T wird etwa zehnmal genauer.',
      swTrue: 'wahre Periodendauer', swCount: 'Schwingungen gezählt: {c}', swNone: 'Noch keine Messung.',
      swOne: '1 Schwingung', swTen: '10 Schwingungen', swRes: 'T = {t} s ± {u} s (aus {n} Messungen)', swTry: 'Versuch Nr.',
      calT: 'Messschieber mit Nonius', calZoom: 'Lupe: Welcher Noniusstrich trifft?',
      calMain: 'Hauptskala: ganze Millimeter links vom Nullstrich', calVern: 'Nonius: Strich {k} trifft einen Hauptskalenstrich → {k} · {r} mm',
      calRead: 'Ablesung', calHow: 'Ziehe den Schieber. Lies erst die ganzen Millimeter vor dem Nullstrich, dann den Noniusstrich, der genau auf einen Strich der Hauptskala fällt.',
      calWhy: 'Warum klappt das? Die Noniusstriche liegen um {d} mm enger als die Millimeterstriche. Schiebt man um k · {d} mm weiter, trifft Strich k.',
      calQuiz: 'Lies den Wert ab und trage ihn bei „Deine Ablesung“ ein.', calOk: 'Richtig abgelesen!', calNo: 'Noch nicht – genauer hinsehen.', calHidden: 'Ablesung verdeckt',
      calObj: 'Gegenstand', jaws: 'Messschnabel', slider: 'Schieber', calRes: 'Auflösung {r} mm: Der Messschieber misst 10- bzw. 20-mal feiner als ein Lineal.',
      propT: 'Unsicherheit weitergeben', propBars: 'Beitrag der Messgrößen (relativ)', propTotal: 'gesamt (Gauß)', propMax: 'Größtfehler',
      propDom: 'Den größten Anteil hat {q}. Diese Messung zuerst verbessern!', propExp: 'Steht eine Größe im Quadrat, zählt ihre relative Unsicherheit doppelt.',
      propRule: 'Bei Produkten und Quotienten addieren sich relative Unsicherheiten – nach Gauß quadratisch: u(f)/f = √[(e₁·u₁/x₁)² + (e₂·u₂/x₂)²].',
      propRound: 'Runden: Unsicherheit auf 1–2 geltende Ziffern, Ergebnis auf dieselbe Stelle.', propMc: 'Probe: 400 simulierte Messungen',
      propMcNote: 'Die Streuung der simulierten Ergebnisse passt zur Formel: s ≈ {s}, u ≈ {u}.', propBad: 'Werte müssen ungleich null sein.',
      canvas: 'Messlabor mit Lineal oder Messpunkten, statistischen Abweichungen, Fehlerbalken und Ausgleichsgerade. Punkte können gezogen und mit Reglern bearbeitet werden.',
      empty: 'Noch keine Messwerte', emptyHint: 'Gib Werte ein oder erzeuge eine Beispielmessreihe.',
      number: 'Bitte Zahlen mit Semikolon trennen, z. B. 9,8; 10,1.', range: 'Messwerte müssen zwischen −100 und 100 cm liegen.', count: 'Höchstens 20 Messwerte sind möglich.',
      series: 'Wiederholt dieselbe Länge messen', fit: 'Bewegung: Ort über Zeit', measure: 'Ein Gegenstand, zwei Maßstäbe',
      deviations: 'Abweichungen vom Mittelwert', histogram: 'Häufigkeit der Messwerte', residuals: 'Abweichungen von der Geraden',
      result: 'Was sagen die Messwerte?', ruler: 'Lineal · cm', zoom: 'Lupenansicht am Ablesezeiger',
      reference: 'Referenzlänge', pointer: 'Ablesezeiger', reading: 'Gerundete Ablesung', division: 'Teilung',
      mean: 'Mittelwert x̄', sd: 'Einzelwerte: s', sem: 'Mittelwert: uₐ',
      hidden: 'Auswertung ausgeblendet', few: 'Mindestens zwei Messwerte nötig.', same: 's = 0: gleiche Anzeigen, nicht perfekte Messung.',
      fitFew: 'Für eine Gerade: mindestens zwei verschiedene Zeiten.', fitTwo: 'Zwei Punkte: Gerade bestimmbar, Streuung nicht schätzbar.',
      fitConstant: 'Konstante Ortswerte: R² ist nicht definiert.',
      cm: 'Ort in cm', time: 'Zeit in s', index: 'Messung Nr.', deviation: 'Abweichung in cm', freq: 'Anzahl',
      seriesNote: 'uₐ = s/√n gilt für unabhängige Wiederholungen. Ein systematischer Versatz bleibt bestehen.',
      fitNote: 'Ungewichtete kleinste Quadrate: Zeiten exakt, gleiche unabhängige Unsicherheit aller Ortswerte. Fehlerbalken zeigen ±u(y), keine Grenzen.',
      measureNote: 'Die Lupe zeigt eine idealisierte Skala. ±d/2 ist hier nur die Rundungsspanne; uᵦ = d/√12 setzt Gleichverteilung voraus.',
      combinedNote: 'Vereinfachtes Budget: uᶜ = √(uₐ² + uᵦ²). Auflösung als unabhängiger Beitrag, ohne 1/√n. Ist sie bereits vollständig in s enthalten, nicht doppelt zählen. Weitere Einflüsse fehlen.',
      offsetNote: 'Der Versatz beeinflusst nur neu erzeugte Messungen. Vorhandene Daten bleiben unverändert.',
      recorded: 'Messwert ergänzt.', removed: 'Messpunkt gelöscht.', generated: 'Neue Beispielmessreihe erzeugt.', cleared: 'Messreihe gelöscht.',
      point: 'Messpunkt', selection: 'Ausgewählt', noSelection: 'Die gewählte Nummer liegt außerhalb der Liste.',
      sample: 'Eingetragene Daten (Beispiele sind simuliert)', zeroTime: 'Δt = 0: alle Messzeiten gleich',
      smallN: 'Bei wenigen Werten ist auch die geschätzte Streuung unsicher.',
      resolution: 'Auch bei s = 0 bleibt die endliche Auflösung.',
      errorBars: 'Balken: ±u(y)', band: 'Band: ±u der geschätzten Geraden',
      notBounds: 'Standardunsicherheiten sind keine sicheren Grenzen.',
      shifted: 'Wiederholen beseitigt keine systematische Abweichung.',
      squares: 'Kleinste Quadrate minimiert Σr².',
    },
    en: {
      swT: 'Timing a pendulum', swSide: 'Your measurements of T', swRun: 'running …', swReady: 'ready',
      swHow: 'Tap “Start / Stop” when the pendulum turns at the far right, and again after {n} oscillation(s).',
      swWhy: 'When pressing you react about 0.2 s late – at start and at stop. What remains is the variation of your reaction. If you time 10 oscillations, it is shared among 10 periods: T becomes about ten times more precise.',
      swTrue: 'true period', swCount: 'oscillations counted: {c}', swNone: 'No measurement yet.',
      swOne: '1 oscillation', swTen: '10 oscillations', swRes: 'T = {t} s ± {u} s (from {n} measurements)', swTry: 'Attempt no.',
      calT: 'Vernier caliper', calZoom: 'Magnifier: which vernier line matches?',
      calMain: 'Main scale: whole millimetres left of the zero line', calVern: 'Vernier: line {k} meets a main-scale line → {k} · {r} mm',
      calRead: 'Reading', calHow: 'Drag the slider. First read the whole millimetres before the zero line, then find the vernier line that coincides with a main-scale line.',
      calWhy: 'Why does it work? The vernier lines are {d} mm closer together than the millimetre lines. Moving k · {d} mm further makes line k match.',
      calQuiz: 'Read the value and enter it under “Your reading”.', calOk: 'Correct reading!', calNo: 'Not yet – look more closely.', calHidden: 'reading hidden',
      calObj: 'object', jaws: 'jaw', slider: 'slider', calRes: 'Resolution {r} mm: the caliper measures 10 or 20 times finer than a ruler.',
      propT: 'Propagating uncertainty', propBars: 'Contribution of the quantities (relative)', propTotal: 'total (Gauss)', propMax: 'maximum error',
      propDom: 'The largest share comes from {q}. Improve this measurement first!', propExp: 'If a quantity is squared, its relative uncertainty counts twice.',
      propRule: 'For products and quotients relative uncertainties add – in quadrature (Gauss): u(f)/f = √[(e₁·u₁/x₁)² + (e₂·u₂/x₂)²].',
      propRound: 'Rounding: uncertainty to 1–2 significant digits, result to the same decimal place.', propMc: 'Check: 400 simulated measurements',
      propMcNote: 'The scatter of the simulated results matches the formula: s ≈ {s}, u ≈ {u}.', propBad: 'Values must be non-zero.',
      canvas: 'Measurement lab with a ruler or data points, statistical deviations, error bars and a best-fit line. Drag points or edit them using controls.',
      empty: 'No measurements yet', emptyHint: 'Enter values or generate an example series.',
      number: 'Separate numbers with semicolons, e.g. 9.8; 10.1.', range: 'Values must be between −100 and 100 cm.', count: 'At most 20 measurements are allowed.',
      series: 'Measure the same length repeatedly', fit: 'Motion: position over time', measure: 'One object, two scales',
      deviations: 'Deviations from the mean', histogram: 'Measurement frequency', residuals: 'Residuals from the fitted line',
      result: 'What do the measurements tell us?', ruler: 'Ruler · cm', zoom: 'Magnified scale at the pointer',
      reference: 'Reference length', pointer: 'Reading pointer', reading: 'Rounded reading', division: 'Division',
      mean: 'Mean x̄', sd: 'Individual values: s', sem: 'Mean: uₐ',
      hidden: 'Results hidden', few: 'At least two readings required.', same: 's = 0: identical displays, not a perfect measurement.',
      fitFew: 'A fit needs at least two different times.', fitTwo: 'Two points: line defined, scatter cannot be estimated.',
      fitConstant: 'Constant positions: R² is undefined.',
      cm: 'Position in cm', time: 'Time in s', index: 'Measurement no.', deviation: 'Deviation in cm', freq: 'Count',
      seriesNote: 'uₐ = s/√n requires independent repetitions. A systematic offset remains.',
      fitNote: 'Unweighted least squares: exact times, equal independent position uncertainty. Error bars show ±u(y), not bounds.',
      measureNote: 'The magnifier shows an idealised scale. ±d/2 is only the rounding interval; uᵦ = d/√12 assumes a uniform distribution.',
      combinedNote: 'Simplified budget: uᶜ = √(uₐ² + uᵦ²). Resolution is an independent contribution without 1/√n. Do not double-count it if already fully included in s. Other effects are omitted.',
      offsetNote: 'The offset affects newly generated measurements only. Existing data remain unchanged.',
      recorded: 'Measurement added.', removed: 'Measurement deleted.', generated: 'New example series generated.', cleared: 'Measurements cleared.',
      point: 'Measurement', selection: 'Selected', noSelection: 'The chosen number is outside the data list.',
      sample: 'Entered data (examples are simulated)', zeroTime: 'Δt = 0: all times identical',
      smallN: 'With few readings, the estimated scatter is uncertain too.',
      resolution: 'Even if s = 0, finite resolution remains.',
      errorBars: 'Bars: ±u(y)', band: 'Band: ±u of the estimated line',
      notBounds: 'Standard uncertainties are not guaranteed bounds.',
      shifted: 'Repetition does not remove a systematic offset.',
      squares: 'Least squares minimises Σr².',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const local = (de: string, en: string) => ctx.lang === 'de' ? de : en;
    const color = (i: number) => ctx.theme.series[i]!;
    const intro = new Tween(850, ease.outCubic);
    const transition = new Tween(400, ease.inOutCubic);
    const pulse = new Tween(450, ease.outCubic);
    let parsed = parseData(p.data);
    let stats = statistics(parsed.values);
    let points = timedPoints(parsed.values, p.dt);
    let fit = linearFit(points);
    let oldValues = [...parsed.values];
    let shownValues = [...parsed.values];
    let previousMode = p.mode as Mode;
    let hits: Hit[] = [];
    let drag: number | 'ruler' | 'repeat' | 'jaw' | null = null;
    let activeChart: Chart | null = null;
    let dragChart: Chart | null = null;
    let rulerArea: Rect | null = null;
    let repeatChart: Chart | null = null;
    let repeatHandle = { x: 0, y: 0 };
    let elapsed = 0;
    let running = false;
    let hover: number | 'ruler' | 'repeat' | 'jaw' | null = null;
    let changeMode = false;
    let caliperArea: Rect | null = null;
    let calScale = { x0: 0, k: 1 };
    let quizVerdict: boolean | null = null;
    const calTw = new Tween(600, ease.outCubic);
    let calFrom = p.jaw;
    let calShown = p.jaw;

    const resolution = () => Number(p.res);
    const visibleResults = () => !ctx.hidden;
    const selected = () => p.pick - 1;
    const centimeters = (v: number, digits = 3) => `${fmt.num(v, digits)} cm`;
    const readNumber = (v: number | null, digits = 4) => v === null ? '—' : fmt.num(v, digits);

    /** Kurze, gut lesbare Texte; Erklärungen umbrechen statt verkleinern. */
    function label(value: string, x: number, y: number, size = 12, ink = ctx.theme.text, align: CanvasTextAlign = 'left', weight = 600): void {
      text(surface.g, value, x, y, { font: `${weight} ${size}px ${ctx.theme.font}`, color: ink, align });
    }
    function paragraph(value: string, r: Rect, size = 12, ink = ctx.theme.muted): void {
      const g = surface.g;
      g.font = `500 ${size}px ${ctx.theme.font}`;
      let line = '';
      let y = r.y;
      for (const word of value.split(' ')) {
        const next = line ? `${line} ${word}` : word;
        if (line && g.measureText(next).width > r.w) {
          if (y <= r.y + r.h) label(line, r.x, y, size, ink, 'left', 500);
          y += size + 6;
          line = word;
        } else line = next;
      }
      if (line && y <= r.y + r.h) label(line, r.x, y, size, ink, 'left', 500);
    }
    function line(x1: number, y1: number, x2: number, y2: number, ink: string, width = 1.5, dash: number[] = []): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = ink;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.restore();
    }
    function dot(x: number, y: number, ink: string, radius = 5, ring = false): void {
      const g = surface.g;
      g.beginPath();
      g.arc(x, y, radius, 0, Math.PI * 2);
      g.fillStyle = ring ? ctx.theme.bg : ink;
      g.fill();
      g.strokeStyle = ink;
      g.lineWidth = 2;
      g.stroke();
    }
    function panel(r: Rect, title: string, accent = color(0)): void {
      drawCard(surface.g, r, ctx.theme, accent);
      label(title, r.x + 14, r.y + 23, r.w < 350 ? 12 : 14, accent);
    }
    function layout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const wide = w >= 640 || w >= h * 1.25;
      if (wide) {
        const sw = Math.round(w * 0.61);
        const footH = Math.max(98, h * 0.26);
        return { main: { x: 0, y: 0, w: sw - 6, h: h - footH - 10 }, side: { x: sw + 6, y: 0, w: w - sw - 6, h: h - footH - 10 }, foot: { x: 0, y: h - footH, w, h: footH }, wide };
      }
      const mh = Math.round(h * 0.44);
      const sh = Math.round(h * 0.31);
      return { main: { x: 0, y: 0, w, h: mh }, side: { x: 0, y: mh + 10, w, h: sh }, foot: { x: 0, y: mh + sh + 20, w, h: h - mh - sh - 20 }, wide };
    }

    /** Koordinatensystem mit Rand für Zahlen und Achsentitel. */
    function chart(r: Rect, xs: [number, number], ys: [number, number], xTitle: string, yTitle: string, nX = 4): Chart {
      const a: Rect = { x: r.x + 49, y: r.y + 62, w: Math.max(20, r.w - 67), h: Math.max(20, r.h - 105) };
      const x = (v: number) => a.x + (v - xs[0]) / (xs[1] - xs[0]) * a.w;
      const y = (v: number) => a.y + a.h - (v - ys[0]) / (ys[1] - ys[0]) * a.h;
      for (const value of axisTicks(ys[0], ys[1])) {
        const py = y(value);
        line(a.x, py, a.x + a.w, py, ctx.theme.grid, 1);
        label(fmt.num(value, 3), a.x - 7, py, 11, ctx.theme.muted, 'right', 500);
      }
      const integerX = xTitle === ctx.t('index') || xTitle === 'n' || xTitle === local('Versuch Nr.', 'Experiment no.');
      for (const value of axisTicks(xs[0], xs[1], nX, integerX)) {
        const px = x(value);
        line(px, a.y, px, a.y + a.h, ctx.theme.grid, 1);
        label(fmt.num(value, 2), px, a.y + a.h + 15, 11, ctx.theme.muted, 'center', 500);
      }
      line(a.x, a.y, a.x, a.y + a.h, ctx.theme.axis);
      line(a.x, a.y + a.h, a.x + a.w, a.y + a.h, ctx.theme.axis);
      label(yTitle, a.x, r.y + 44, 11, ctx.theme.muted);
      label(xTitle, a.x + a.w, r.y + r.h - 12, 11, ctx.theme.muted, 'right');
      return { rect: a, x, y, inverseY: (py) => ys[0] + (a.y + a.h - py) / a.h * (ys[1] - ys[0]) };
    }

    function band(c: Chart, low: number, high: number, ink: string): void {
      const g = surface.g;
      g.fillStyle = withAlpha(ink, 0.12);
      g.fillRect(c.rect.x, c.y(high), c.rect.w, Math.max(1, c.y(low) - c.y(high)));
      line(c.rect.x, c.y(low), c.rect.x + c.rect.w, c.y(low), withAlpha(ink, 0.6), 1, [3, 4]);
      line(c.rect.x, c.y(high), c.rect.x + c.rect.w, c.y(high), withAlpha(ink, 0.6), 1, [3, 4]);
    }

    function drawSeries(r: Rect, values: number[], s: Statistics): void {
      panel(r, ctx.t('series'));
      const extra = s.mean === null ? [] : [s.mean - (s.sampleSD ?? 0), s.mean + (s.sampleSD ?? 0)];
      const range = dataRange([...values, ...(visibleResults() && p.band ? extra : [])], 0.2);
      const c = chart(r, [0.6, Math.max(2, values.length) + 0.4], range, ctx.t('index'), local('Länge in cm', 'Length in cm'), Math.min(4, Math.max(1, values.length - 1)));
      activeChart = c;
      if (visibleResults() && s.mean !== null) {
        if (p.band && s.sampleSD !== null) {
          band(c, s.mean - s.sampleSD, s.mean + s.sampleSD, color(4));
          band(c, s.mean - s.sem!, s.mean + s.sem!, color(2));
        }
        line(c.rect.x, c.y(s.mean), c.rect.x + c.rect.w, c.y(s.mean), color(2), 2.5);
      }
      drawPoints(c, values.map((y, i) => ({ x: i + 1, y })), s.mean);
    }

    function drawPoints(c: Chart, data: Point[], mean: number | null = null): void {
      data.forEach((pt, i) => {
        const x = c.x(pt.x);
        const y = c.y(pt.y);
        const ink = i === selected() ? color(3) : color(0);
        const hot = hover === i || drag === i;
        if (mean !== null && visibleResults()) line(x, c.y(mean), x, y, withAlpha(ink, 0.4), 2);
        if (p.mode === 'fit' && p.band) {
          line(x, c.y(pt.y - p.bar), x, c.y(pt.y + p.bar), withAlpha(ink, 0.7));
          for (const v of [pt.y - p.bar, pt.y + p.bar]) line(x - 4, c.y(v), x + 4, c.y(v), ink);
        }
        if (i === selected() || hot) dot(x, y, withAlpha(ink, 0.14), 12);
        dot(x, y, ink, hot ? 7 : 5.5);
        hits.push({ id: i, x, y });
      });
    }

    function drawDeviations(r: Rect, values: number[], s: Statistics): void {
      panel(r, ctx.t(p.hist ? 'histogram' : 'deviations'), color(4));
      if (!visibleResults()) { paragraph(ctx.t('hidden'), { x: r.x + 16, y: r.y + 70, w: r.w - 32, h: 60 }); return; }
      if (p.hist) {
        const bins = histogram(values, Math.min(6, Math.max(1, values.length)));
        if (!bins.length) return;
        const c = chart(r, [bins[0]!.from, bins.at(-1)!.to], [0, Math.max(1, ...bins.map((b) => b.count))], local('Länge in cm', 'Length in cm'), ctx.t('freq'), 2);
        bins.forEach((b) => {
          const g = surface.g;
          g.fillStyle = withAlpha(color(4), 0.65);
          roundRect(g, c.x(b.from) + 1, c.y(b.count), Math.max(1, c.x(b.to) - c.x(b.from) - 2), c.y(0) - c.y(b.count), 2);
          g.fill();
          if (b.count) label(String(b.count), (c.x(b.from) + c.x(b.to)) / 2, c.y(b.count) - 9, 11, color(4), 'center');
        });
        return;
      }
      const deviations = values.map((v) => v - (s.mean ?? 0));
      const extent = Math.max(0.1, ...deviations.map(Math.abs)) * 1.25;
      const c = chart(r, [1, Math.max(2, values.length)], [-extent, extent], ctx.t('index'), ctx.t('deviation'), 2);
      line(c.rect.x, c.y(0), c.rect.x + c.rect.w, c.y(0), ctx.theme.axis, 2);
      deviations.forEach((v, i) => {
        const x = c.x(i + 1);
        const ink = v >= 0 ? color(0) : color(1);
        line(x, c.y(0), x, c.y(v), ink, Math.max(3, Math.min(12, c.rect.w / Math.max(1, values.length) * 0.4)));
        dot(x, c.y(v), ink, 3);
      });
    }

    function drawFit(r: Rect, values: number[], f: LinearFit | null): void {
      panel(r, ctx.t('fit'));
      const data = timedPoints(values, p.dt);
      const xmax = Math.max(1, (values.length - 1) * p.dt);
      const ys = dataRange(values.flatMap((v) => [v - (p.band ? p.bar : 0), v + (p.band ? p.bar : 0)]), 0.5);
      const c = chart(r, [-xmax * 0.05, xmax * 1.05], ys, ctx.t('time'), ctx.t('cm'));
      activeChart = c;
      if (f && visibleResults()) {
        const g = surface.g;
        g.save();
        g.beginPath();
        g.rect(c.rect.x, c.rect.y, c.rect.w, c.rect.h);
        g.clip();
        if (p.band && f.residualSD !== null) {
          g.beginPath();
          for (let side = 0; side < 2; side++) {
            for (let i = 0; i <= 40; i++) {
              const x = xmax * (side === 0 ? i / 40 : 1 - i / 40);
              const y = f.slope * x + f.intercept + (side === 0 ? 1 : -1) * fitUncertainty(f, values.length, x)!;
              if (!side && !i) g.moveTo(c.x(x), c.y(y)); else g.lineTo(c.x(x), c.y(y));
            }
          }
          g.closePath();
          g.fillStyle = withAlpha(color(2), 0.15);
          g.fill();
        }
        line(c.x(0), c.y(f.intercept), c.x(xmax), c.y(f.intercept + f.slope * xmax), color(2), 2.5);
        data.forEach((q) => line(c.x(q.x), c.y(q.y), c.x(q.x), c.y(f.slope * q.x + f.intercept), withAlpha(color(1), 0.5), 1.5, [3, 3]));
        g.restore();
      }
      if (p.manual) {
        const g = surface.g;
        g.save(); g.beginPath(); g.rect(c.rect.x, c.rect.y, c.rect.w, c.rect.h); g.clip();
        line(c.x(0), c.y(p.b), c.x(xmax), c.y(p.b + p.a * xmax), color(3), 2.5, [6, 4]);
        data.forEach((q) => line(c.x(q.x), c.y(q.y), c.x(q.x), c.y(p.a*q.x+p.b), withAlpha(color(3),0.6), 2));
        g.restore();
      }
      drawPoints(c, data);
    }

    function drawResiduals(r: Rect, values: number[], f: LinearFit | null): void {
      panel(r, p.manual ? local('Abweichungen: eigene Gerade', 'Residuals: your line') : ctx.t('residuals'), color(1));
      if (!visibleResults() || !f) {
        paragraph(ctx.t(!visibleResults() ? 'hidden' : 'fitFew'), { x: r.x + 16, y: r.y + 65, w: r.w - 32, h: r.h - 80 });
        return;
      }
      const residuals = p.manual ? timedPoints(values, p.dt).map((q) => q.y - p.a*q.x - p.b) : f.residuals;
      const extent = Math.max(0.1, ...residuals.map(Math.abs)) * 1.3;
      const c = chart(r, [0, Math.max(1, (values.length - 1) * p.dt)], [-extent, extent], ctx.t('time'), 'r in cm', 2);
      line(c.rect.x, c.y(0), c.rect.x + c.rect.w, c.y(0), ctx.theme.axis, 2);
      residuals.forEach((v, i) => {
        const x = c.x(i * p.dt);
        line(x, c.y(0), x, c.y(v), v < 0 ? color(1) : color(0), 3);
        dot(x, c.y(v), i === selected() ? color(3) : color(1), 4);
      });
    }

    /** Maßstab und Gegenstand: nicht nur ein Diagramm, sondern tatsächliches Ablesen. */
    function drawRuler(r: Rect): void {
      panel(r, ctx.t('measure'));
      const g = surface.g;
      const left = r.x + 24;
      const width = r.w - 48;
      const x = (cm: number) => left + cm / 20 * width;
      const top = r.y + r.h * 0.52;
      const height = Math.min(52, r.h * 0.23);
      const animatedCursor = p.cursor;
      rulerArea = { x: left, y: top - 55, w: width, h: height + 75 };
      // Der Gegenstand ist räumlich leicht modelliert, aber maßstäblich lang.
      const material = g.createLinearGradient(0, top - 38, 0, top - 9);
      material.addColorStop(0, mixColor(color(0), ctx.theme.bg, 0.4));
      material.addColorStop(1, color(0));
      g.fillStyle = material;
      roundRect(g, x(0), top - 38, x(p.length) - x(0), 29, 5);
      g.fill();
      line(x(0) + 4, top - 34, x(p.length) - 4, top - 34, withAlpha(ctx.theme.bg, 0.6), 2);
      label(ctx.t('reference'), left, top - 57, 11, ctx.theme.muted);
      if (visibleResults()) label(centimeters(p.length, 2), left + width, top - 57, 12, color(0), 'right');
      const wood = g.createLinearGradient(0, top, 0, top + height);
      wood.addColorStop(0, mixColor(color(3), ctx.theme.bg, ctx.theme.dark ? 0.72 : 0.86));
      wood.addColorStop(1, mixColor(color(3), ctx.theme.bg, ctx.theme.dark ? 0.84 : 0.72));
      g.fillStyle = wood;
      roundRect(g, left - 8, top, width + 16, height, 5);
      g.fill();
      // Auf der Übersicht maximal Millimeter; feinere Teilung wird in der Lupe gezeigt.
      const minor = width > 360 ? 0.2 : 0.5;
      for (let i = 0; i <= 20 / minor; i++) {
        const v = i * minor;
        const major = Math.abs(v - Math.round(v)) < 1e-6;
        line(x(v), top + 1, x(v), top + (major ? 15 : 8), ctx.theme.text, major ? 1.5 : 1);
        if (Math.round(v) % 2 === 0 && major) label(fmt.num(v, 0), x(v), top + 28, 11, ctx.theme.text, 'center');
      }
      line(x(animatedCursor), top - 45, x(animatedCursor), top + height + 8, color(1), 2);
      dot(x(animatedCursor), top - 47, color(1), 7);
      label(ctx.t('ruler'), r.x + 16, r.y + r.h - 18, 11, ctx.theme.muted);
      label(centimeters(instrumentReading(p.cursor, 0, resolution()), 2), r.x + r.w - 16, r.y + r.h - 18, 14, color(1), 'right');
    }

    function drawMagnifier(r: Rect): void {
      panel(r, ctx.t('zoom'), color(3));
      const g = surface.g;
      const d = resolution();
      const center = instrumentReading(p.cursor, 0, d);
      const left = r.x + 25;
      const width = r.w - 50;
      const y = r.y + r.h * 0.49;
      const x = (value: number) => left + ((value - center) / (d * 8) + 0.5) * width;
      // Jede Teilung bleibt mindestens 20 Pixel auseinander, auch bei 0,01 cm.
      g.fillStyle = withAlpha(color(3), 0.1);
      roundRect(g, left - 8, y - 12, width + 16, 63, 6);
      g.fill();
      for (let i = -4; i <= 4; i++) {
        const value = center + i * d;
        line(x(value), y - 11, x(value), y + 8, ctx.theme.text, 1.5);
        if (i % 2 === 0) label(fmt.num(value, 2), x(value), y + 26, 11, ctx.theme.text, 'center');
      }
      if (visibleResults() && p.band) {
        g.fillStyle = withAlpha(color(1), 0.13);
        g.fillRect(x(center - d / 2), y - 30, x(center + d / 2) - x(center - d / 2), 88);
      }
      line(x(p.cursor), y - 31, x(p.cursor), y + 56, color(1), 2);
      dot(x(p.cursor), y - 34, color(1), 5);
      label(`${ctx.t('division')}: ${centimeters(d, 2)}`, r.x + 16, r.y + r.h - 38, 12, color(3));
      label(`±d/2 = ±${fmt.num(d / 2, 3)} cm`, r.x + 16, r.y + r.h - 18, 12, ctx.theme.muted);
    }

    /** Zusammenfassung in eigenen Bereichen: keine Etiketten über Datenpunkten. */
    function drawSummary(r: Rect, s: Statistics, f: LinearFit | null): void {
      panel(r, ctx.t('result'), color(2));
      if (!visibleResults()) {
        label(ctx.t('hidden'), r.x + 16, r.y + 56, 13, ctx.theme.muted);
        return;
      }
      const wide = r.w >= 500;
      const gap = wide ? r.w / 3 : r.w / 2;
      const columns: [string, string, string][] = p.mode === 'fit'
        ? [[local('Geschwindigkeit a', 'Velocity a'), f ? `${fmt.num(f.slope, 3)} cm/s` : '—', color(2)], [local('Anfangsort b', 'Initial position b'), f ? centimeters(f.intercept) : '—', color(0)], [p.manual ? local('Σr² eigene / beste', 'Σr² yours / best') : 'Σr²', f ? (p.manual ? `${fmt.num(squaredResiduals(points, p.a, p.b), 3)} / ${fmt.num(f.sse, 3)}` : `${fmt.num(f.sse, 4)} cm²`) : '—', color(1)]]
        : p.mode === 'measure'
          ? [[ctx.t('reading'), centimeters(instrumentReading(p.cursor, 0, resolution()), 2), color(1)], ['uᵦ = d/√12', centimeters(resolutionUncertainty(resolution()), 4), color(3)], [local('In der Liste', 'In the list'), `n = ${s.n}`, color(0)]]
          : [[ctx.t('mean'), s.mean === null ? '—' : centimeters(s.mean), color(2)], [ctx.t('sd'), s.sampleSD === null ? '—' : centimeters(s.sampleSD), color(4)], [ctx.t('sem'), s.sem === null ? '—' : centimeters(s.sem), color(0)]];
      columns.slice(0, wide ? 3 : 2).forEach(([title, value, ink], i) => {
        const x = r.x + 16 + gap * i;
        label(title, x, r.y + 49, 11, ctx.theme.muted);
        label(value, x, r.y + 72, wide ? 19 : 17, ink, 'left', 750);
      });
      let note = p.mode === 'fit' ? (!f ? 'fitFew' : s.n === 2 ? 'fitTwo' : 'squares') : p.mode === 'measure' ? 'notBounds' : s.n < 2 ? 'few' : s.sampleSD === 0 ? 'same' : 'seriesNote';
      if (!wide && p.mode === 'series' && s.sem !== null) {
        label(`uₐ = s/√n ${fmt.rel(s.sem, 3)} ${centimeters(s.sem)}`, r.x + 16, r.y + 98, 12, color(0));
      }
      const noteY = r.y + (wide ? 100 : p.mode === 'series' ? 124 : 99);
      if (r.y + r.h - noteY >= 10) paragraph(ctx.t(note), { x: r.x + 16, y: noteY, w: r.w - 32, h: r.y + r.h - noteY - 8 }, 11);
    }

    /** Viele unabhängige Versuche machen die Streuung der Mittelwerte sichtbar. */
    function drawRepeat(main: Rect, side: Rect): void {
      panel(main, local('40 Versuche · je n Einzelmessungen', '40 experiments · n readings each'));
      const experiment = repeatedExperiments(p.repn, p.noise, p.offset, p.seed);
      const sem = experiment.theoreticalSEM;
      const range = dataRange([10, ...experiment.means.flatMap((mean) => [mean - sem, mean + sem])], 0.15);
      const c = chart(main, [1, 40], range, local('Versuch Nr.', 'Experiment no.'), local('Mittelwert in cm', 'Mean in cm'));
      line(c.rect.x, c.y(10), c.rect.x + c.rect.w, c.y(10), color(2), 2, [5, 4]);
      const alpha = transition.running ? transition.value : 1;
      experiment.means.forEach((mean, i) => {
        const covered = Math.abs(mean - 10) <= sem + 1e-12;
        const ink = !visibleResults() || covered ? color(0) : color(1);
        const x = c.x(i + 1);
        const shown = experiment.expectedMean + (mean - experiment.expectedMean) * alpha;
        if (p.band && visibleResults()) line(x, c.y(shown - sem), x, c.y(shown + sem), withAlpha(ink, 0.6), 1.5);
        dot(x, c.y(shown), ink, 2.5);
      });
      panel(side, local('Warum schrumpft der Bereich?', 'Why does the interval shrink?'), color(4));
      if (!visibleResults()) { paragraph(ctx.t('hidden'), { x: side.x + 16, y: side.y + 65, w: side.w - 32, h: 40 }); repeatChart = null; return; }
      const d = chart(side, [1, 100], [0, Math.max(0.1, p.noise * 1.15)], 'n', 'σ/√n in cm', 2);
      for (let i = 1; i < 100; i++) line(d.x(i), d.y(p.noise / Math.sqrt(i)), d.x(i + 1), d.y(p.noise / Math.sqrt(i + 1)), color(4), 2.5);
      dot(d.x(p.repn), d.y(sem), color(3), 6);
      repeatChart = d;
      repeatHandle = { x: d.x(p.repn), y: d.y(sem) };
    }

    function drawRepeatSummary(r: Rect): void {
      panel(r, local('Zufällige Streuung und systematischer Versatz', 'Random scatter and systematic offset'), color(2));
      if (!visibleResults()) { label(ctx.t('hidden'), r.x + 16, r.y + 57); return; }
      const experiment = repeatedExperiments(p.repn, p.noise, p.offset, p.seed);
      const wide = r.w >= 500;
      const top = r.y + 51;
      label(`σ/√n = ${fmt.num(experiment.theoreticalSEM, 4)} cm`, r.x + 16, top, 15, color(4));
      label(`${local('Versatz', 'Offset')}: ${fmt.signed(p.offset, 2)} cm`, wide ? r.x + r.w * 0.38 : r.x + 16, wide ? top : top + 25, 14, color(1));
      label(`${experiment.covered}/40 ${local('treffen 10 cm', 'cover 10 cm')}`, wide ? r.x + r.w * 0.7 : r.x + 16, wide ? top : top + 50, 13, color(0));
      paragraph(ctx.t('shifted'), { x: r.x + 16, y: r.y + (wide ? 84 : 128), w: r.w - 32, h: r.h - (wide ? 94 : 138) }, 11);
    }

    /** Die nächste Zeile liefert den nächsten Summanden für s. */
    function drawCalculation(r: Rect): void {
      panel(r, local('Streuung nachvollziehen', 'Understand the scatter'), color(4));
      if (!visibleResults()) { paragraph(ctx.t('hidden'), { x: r.x + 16, y: r.y + 60, w: r.w - 32, h: 50 }); return; }
      const rows = calculationSteps(parsed.values);
      const n = Math.min(rows.length, p.step);
      const shown = rows[n - 1];
      if (!shown) return;
      const x = r.x + 16;
      const gap = r.h < 250 ? 24 : 32;
      let y = r.y + 55;
      label(`${local('Schritt', 'Step')} ${n}/${rows.length}`, x, y, 12, ctx.theme.muted);
      y += gap;
      label(`x${n} = ${fmt.num(shown.value, 3)} cm`, x, y, 14, color(0));
      y += gap;
      label(`x${n} − x̄ = ${fmt.num(shown.deviation, 3)} cm`, x, y, 13, color(1));
      y += gap;
      label(`(x${n} − x̄)² = ${fmt.num(shown.square, 4)} cm²`, x, y, 12, color(4));
      y += gap;
      if (y < r.y + r.h - 24) {
        line(x, y - gap / 2, x + r.w - 32, y - gap / 2, ctx.theme.grid);
        label(`Σ = ${fmt.num(shown.partialSquareSum, 4)} cm²`, x, y, 14, color(2));
        y += gap;
      }
      if (n === rows.length && stats.sampleSD !== null && y < r.y + r.h - 12) label(`s = √(Σ/${rows.length - 1}) ${fmt.rel(stats.sampleSD, 3)} ${fmt.num(stats.sampleSD, 3)} cm`, x, y, 12, color(4));
    }


    /* -------------------------------------------------------------- */
    /* 5 · Messschieber mit Nonius                                     */
    /* -------------------------------------------------------------- */

    const kind = () => p.nonius as NoniusKind;
    function drawCaliper(r: Rect): void {
      panel(r, ctx.t('calT'));
      const g = surface.g;
      const jaw = calShown;
      const sc = noniusScale(kind());
      // Maßstab: 0 … 75 mm passen in die Breite
      const x0 = r.x + 34;
      const k = (r.w - 60) / 75;
      calScale = { x0, k };
      const X = (mm: number) => x0 + mm * k;
      const barY = r.y + Math.max(64, r.h * 0.34);
      const barH = Math.max(22, Math.min(34, r.h * 0.12));
      // Gegenstand zwischen den Messschnäbeln
      const objTop = barY + barH + 6;
      const jawLen = Math.min(r.h * 0.42, 120);
      if (jaw > 0.3) {
        const grd = g.createLinearGradient(0, objTop, 0, objTop + jawLen * 0.7);
        grd.addColorStop(0, ctx.theme.dark ? '#a77d4f' : '#d9b07a');
        grd.addColorStop(1, ctx.theme.dark ? '#7a5634' : '#b88a55');
        g.fillStyle = grd;
        roundRect(g, X(0) + 1, objTop + jawLen * 0.2, Math.max(1, X(jaw) - X(0) - 2), jawLen * 0.55, 3);
        g.fill();
        if (X(jaw) - X(0) > 70) label(ctx.t('calObj'), (X(0) + X(jaw)) / 2, objTop + jawLen * 0.5, 11, ctx.theme.dark ? '#f4e6d3' : '#4a3520', 'center');
      }
      const steel = (y: number, h: number) => {
        const sg = g.createLinearGradient(0, y, 0, y + h);
        sg.addColorStop(0, ctx.theme.dark ? '#c8cfd8' : '#e7ebf0');
        sg.addColorStop(0.5, ctx.theme.dark ? '#98a2ae' : '#c3cad3');
        sg.addColorStop(1, ctx.theme.dark ? '#6e7783' : '#9aa3ad');
        return sg;
      };
      // Hauptschiene mit festem Schnabel
      g.fillStyle = steel(barY, barH);
      roundRect(g, X(-6), barY, X(72) - X(-6), barH, 4);
      g.fill();
      g.fillStyle = steel(barY, jawLen);
      g.beginPath();
      g.moveTo(X(-6), barY);
      g.lineTo(X(0), barY);
      g.lineTo(X(0), objTop + jawLen);
      g.lineTo(X(-3), objTop + jawLen - 6);
      g.lineTo(X(-6), barY + barH);
      g.closePath();
      g.fill();
      g.strokeStyle = withAlpha(ctx.theme.text, 0.35);
      g.lineWidth = 1;
      g.stroke();
      // Millimeterteilung
      for (let mm = 0; mm <= 70; mm++) {
        const long = mm % 10 === 0 ? 0.62 : mm % 5 === 0 ? 0.45 : 0.3;
        line(X(mm), barY + 1, X(mm), barY + barH * long, '#1d232c', mm % 5 === 0 ? 1.4 : 1);
        if (mm % 10 === 0) label(String(mm / 10), X(mm) + 2, barY + barH * 0.82, 10, '#1d232c', 'left', 700);
      }
      label('cm', X(71), barY + barH * 0.82, 10, '#1d232c', 'right', 700);
      // Schieber mit beweglichem Schnabel und Nonius
      const sx = X(jaw);
      const sw = (sc.length + 6) * k;
      const sTop = barY - 8;
      const sH = barH + 34;
      g.fillStyle = steel(sTop, 8);
      roundRect(g, sx - 8, sTop, sw + 12, 8, 3);
      g.fill();
      g.fillStyle = steel(barY + barH, sH - barH - 8);
      roundRect(g, sx - 8, barY + barH, sw + 12, sH - barH - 8, 4);
      g.fill();
      g.strokeStyle = withAlpha(ctx.theme.text, 0.45);
      g.lineWidth = 1;
      roundRect(g, sx - 8, sTop, sw + 12, sH, 5);
      g.stroke();
      g.fillStyle = steel(sTop, jawLen + barH);
      g.beginPath();
      g.moveTo(sx, sTop + sH - 2);
      g.lineTo(sx, objTop + jawLen);
      g.lineTo(sx + 3 * k, objTop + jawLen - 6);
      g.lineTo(sx + 6 * k, sTop + sH - 2);
      g.closePath();
      g.fill();
      g.stroke();
      // Noniusstriche (unterer Rand des Schiebers, zur Hauptskala hin)
      const nr = noniusReading(jaw, kind());
      const ny = barY + barH + 2;
      for (let i = 0; i <= sc.divisions; i++) {
        const xx = X(noniusLine(jaw, i, kind()));
        const hit = i === nr.k && !p.quiz;
        const long = i % 5 === 0 ? 14 : 9;
        line(xx, ny, xx, ny + long, hit ? color(2) : '#1d232c', hit ? 2.4 : 1.1);
        if (i % (sc.divisions === 10 ? 5 : 10) === 0) label(fmt.num(sc.divisions === 10 ? i : i / 2, 0), xx, ny + long + 9, 9, '#1d232c', 'center', 700);
      }
      // Ziehfläche
      caliperArea = { x: sx - 10, y: sTop - 6, w: sw + 16, h: jawLen + barH + 34 };
      const hot = hover === 'jaw' || drag === 'jaw';
      if (hot) {
        g.strokeStyle = withAlpha(color(4), 0.7);
        g.lineWidth = 2;
        g.setLineDash([5, 4]);
        roundRect(g, caliperArea.x, caliperArea.y, caliperArea.w, caliperArea.h, 6);
        g.stroke();
        g.setLineDash([]);
      }
      // Beschriftungen
      label(ctx.t('slider'), sx + sw / 2, sTop - 10, 11, ctx.theme.muted, 'center');
      const readTxt = p.quiz && quizVerdict !== true ? ctx.t('calHidden') : `${ctx.t('calRead')}: ${fmt.fixed(nr.reading, sc.resolution < 0.1 ? 2 : 1)} mm`;
      label(readTxt, r.x + r.w - 16, r.y + 23, r.w < 350 ? 12 : 14, color(2), 'right', 800);
    }
    function drawNoniusZoom(r: Rect): void {
      panel(r, ctx.t('calZoom'), color(2));
      const g = surface.g;
      const sc = noniusScale(kind());
      const nr = noniusReading(calShown, kind());
      const hitPos = noniusLine(calShown, p.quiz ? 0 : nr.k, kind());
      // Ausschnitt von 6 mm (bzw. 8 mm) rund um den passenden Strich
      const span = sc.divisions === 10 ? 6 : 8;
      const lo = hitPos - span / 2;
      const area: Rect = { x: r.x + 16, y: r.y + 48, w: r.w - 32, h: r.h - 64 };
      const X = (mm: number) => area.x + ((mm - lo) / span) * area.w;
      const mid = area.y + area.h * 0.5;
      g.save();
      g.beginPath();
      g.rect(area.x, area.y, area.w, area.h);
      g.clip();
      g.fillStyle = ctx.theme.dark ? '#c3cad3' : '#e7ebf0';
      g.fillRect(area.x, area.y, area.w, area.h * 0.5);
      g.fillStyle = ctx.theme.dark ? '#aab2bc' : '#d4dae1';
      g.fillRect(area.x, mid, area.w, area.h * 0.5);
      for (let mm = Math.floor(lo) - 1; mm <= lo + span + 1; mm++) {
        const len = mm % 10 === 0 ? 0.42 : mm % 5 === 0 ? 0.32 : 0.22;
        line(X(mm), mid - area.h * len, X(mm), mid, '#1d232c', 1.6);
        if (mm % 5 === 0 && X(mm) > area.x + 12 && X(mm) < area.x + area.w - 12) label(fmt.num(mm, 0), X(mm), mid - area.h * len - 8, 11, '#1d232c', 'center', 700);
      }
      for (let i = 0; i <= sc.divisions; i++) {
        const pos = noniusLine(calShown, i, kind());
        if (pos < lo - 1 || pos > lo + span + 1) continue;
        const hit = i === nr.k && !p.quiz;
        const len = i % 5 === 0 ? 0.36 : 0.24;
        line(X(pos), mid, X(pos), mid + area.h * len, hit ? color(2) : '#1d232c', hit ? 3 : 1.6);
        if (sc.divisions === 10 || i % 2 === 0) label(fmt.num(sc.divisions === 10 ? i : i / 2, 0), X(pos), mid + area.h * len + 10, 10, hit ? color(2) : '#1d232c', 'center', hit ? 800 : 600);
      }
      g.restore();
      if (!p.quiz) {
        const xx = X(hitPos);
        g.save();
        g.strokeStyle = color(2);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(xx, mid, 12, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
      g.strokeStyle = withAlpha(ctx.theme.text, 0.25);
      g.strokeRect(area.x, area.y, area.w, area.h);
    }
    function drawCaliperSummary(r: Rect): void {
      panel(r, ctx.t('result'), color(2));
      const sc = noniusScale(kind());
      const nr = noniusReading(p.jaw, kind());
      const wide = r.w > 600;
      const x = r.x + 16;
      const w = wide ? r.w / 2 - 24 : r.w - 32;
      if (p.quiz && quizVerdict !== true) {
        paragraph(ctx.t('calQuiz'), { x, y: r.y + 50, w, h: 40 }, 13, ctx.theme.text);
        if (quizVerdict === false) label(ctx.t('calNo'), x, r.y + 92, 13, color(1), 'left', 800);
      } else {
        if (r.w < 520) {
          // schmal: kurze Fassung, damit nichts überlappt
          label(`${local('Hauptskala', 'Main scale')}: ${nr.mainMm} mm`, x, r.y + 50, 12, ctx.theme.text);
          label(`${local('Nonius', 'Vernier')}: ${local('Strich', 'line')} ${nr.k} → ${nr.k} · ${fmt.num(sc.resolution, 2)} mm`, x, r.y + 70, 12, color(2));
        } else {
          label(`${ctx.t('calMain')}: ${nr.mainMm} mm`, x, r.y + 50, 12, ctx.theme.text);
          label(ctx.t('calVern').replaceAll('{k}', String(nr.k)).replace('{r}', fmt.num(sc.resolution, 2)), x, r.y + 70, 12, color(2));
        }
        label(`${ctx.t('calRead')}: ${nr.mainMm} mm + ${fmt.num(nr.k * sc.resolution, 2)} mm = ${fmt.fixed(nr.reading, sc.resolution < 0.1 ? 2 : 1)} mm`, x, r.y + 94, r.w < 420 ? 12 : 14, ctx.theme.text, 'left', 800);
        if (quizVerdict === true) label(ctx.t('calOk'), x + w, r.y + 92, 13, color(2), 'right', 800);
      }
      const why = ctx.t('calWhy').replaceAll('{d}', fmt.num(sc.resolution, 2));
      if (wide) paragraph(`${why} ${ctx.t('calRes').replace('{r}', fmt.num(sc.resolution, 2))}`, { x: r.x + r.w / 2 + 8, y: r.y + 50, w: r.w / 2 - 24, h: r.h - 60 }, 12);
      else paragraph(why, { x, y: r.y + 114, w, h: r.h - 120 }, 12);
    }

    /* -------------------------------------------------------------- */
    /* 6 · Unsicherheit weitergeben                                    */
    /* -------------------------------------------------------------- */

    const FORMULA_INFO: Record<FormulaId, { f: string; q: [string, string]; unit: [string, string]; res: string; sym: string }> = {
      area: { f: 'A = l · b', q: ['l', 'b'], unit: ['cm', 'cm'], res: 'cm²', sym: 'A' },
      speed: { f: 'v = s / t', q: ['s', 't'], unit: ['m', 's'], res: 'm/s', sym: 'v' },
      density: { f: 'ρ = m / V', q: ['m', 'V'], unit: ['g', 'cm³'], res: 'g/cm³', sym: 'ρ' },
      pendulum: { f: 'g = 4π² · l / T²', q: ['l', 'T'], unit: ['m', 's'], res: 'm/s²', sym: 'g' },
    };
    const PRESET_VALUES: Record<FormulaId, { x1: number; u1: number; x2: number; u2: number }> = {
      area: { x1: 2, u1: 0.1, x2: 3, u2: 0.1 },
      speed: { x1: 10, u1: 0.2, x2: 2, u2: 0.05 },
      density: { x1: 27, u1: 0.1, x2: 10, u2: 0.5 },
      pendulum: { x1: 1, u1: 0.005, x2: 2.006, u2: 0.01 },
    };
    const fid = () => p.formula as FormulaId;
    const prop = () => propagate(FORMULAS[fid()], [p.x1, p.x2], [p.u1, p.u2]);
    function resultText(): string {
      const r = prop();
      const info = FORMULA_INFO[fid()];
      if (!r) return ctx.t('propBad');
      const rr = roundResult(r.value, r.uGauss);
      return `${info.sym} = (${fmt.num(rr.value, rr.decimals)} ± ${fmt.num(rr.u, rr.decimals)}) ${info.res}`;
    }
    const barGrow = new Tween(700, ease.outCubic);
    let mcNote = '';
    function drawPropagate(r: Rect): void {
      panel(r, ctx.t('propT'), color(0));
      const info = FORMULA_INFO[fid()];
      const pr = prop();
      const narrowP = r.w < 420;
      label(info.f, r.x + 16, r.y + 56, narrowP ? 18 : 22, ctx.theme.text, 'left', 800);
      const xs: [number, number] = [p.x1, p.x2];
      const us: [number, number] = [p.u1, p.u2];
      const exps = FORMULAS[fid()].exps;
      for (let i = 0; i < 2; i++) {
        const rel = xs[i] ? (us[i]! / Math.abs(xs[i]!)) * 100 : NaN;
        label(`${info.q[i]} = (${fmt.num(xs[i]!, 4)} ± ${fmt.num(us[i]!, 4)}) ${info.unit[i]}  ·  ${fmt.num(rel, 2)} %`, r.x + 16, r.y + 86 + i * 20, narrowP ? 11 : 12, i === 0 ? color(0) : color(3));
      }
      if (!pr) {
        paragraph(ctx.t('propBad'), { x: r.x + 16, y: r.y + 140, w: r.w - 32, h: 40 }, 13, color(1));
        return;
      }
      // Balken: Beiträge, gesamt nach Gauß, Größtfehler
      const top = r.y + 136;
      label(ctx.t('propBars'), r.x + 16, top, 11, ctx.theme.muted);
      const rows: [string, number, string][] = [
        [`${Math.abs(exps[0]) === 1 ? '' : `${Math.abs(exps[0])} · `}u(${info.q[0]})/${info.q[0]}`, pr.contributions[0], color(0)],
        [`${Math.abs(exps[1]) === 1 ? '' : `${Math.abs(exps[1])} · `}u(${info.q[1]})/${info.q[1]}`, pr.contributions[1], color(3)],
        [ctx.t('propTotal'), pr.relGauss, color(2)],
        [ctx.t('propMax'), pr.relMax, withAlpha(ctx.theme.text, 0.5)],
      ];
      const maxV = Math.max(...rows.map((q) => q[1]), 1e-9);
      const lw = narrowP ? 92 : 118;
      const bx = r.x + 16 + lw;
      const bw = r.w - 32 - lw - 56;
      const rowH = Math.max(18, Math.min(30, (r.y + r.h - top - 50) / 4));
      const grow = barGrow.running ? barGrow.value : 1;
      rows.forEach(([name, v, ink], i) => {
        const y = top + 14 + i * rowH;
        label(name, r.x + 16, y + rowH / 2 - 2, 11, ctx.theme.text, 'left', i >= 2 ? 800 : 600);
        const g = surface.g;
        g.fillStyle = withAlpha(ctx.theme.text, 0.07);
        roundRect(g, bx, y + 3, bw, rowH - 8, 4);
        g.fill();
        g.fillStyle = ink;
        roundRect(g, bx, y + 3, Math.max(2, (v / maxV) * bw * grow), rowH - 8, 4);
        g.fill();
        label(`${fmt.num(v * 100, 2)} %`, bx + bw + 6, y + rowH / 2 - 2, 11, ctx.theme.text, 'left', 700);
      });
      const yRes = top + 18 + 4 * rowH;
      if (p.show) label(resultText(), r.x + 16, Math.min(yRes + 8, r.y + r.h - 12), narrowP ? 15 : 18, color(2), 'left', 800);
      else label(ctx.t('hidden'), r.x + 16, Math.min(yRes + 8, r.y + r.h - 12), 13, ctx.theme.muted);
    }
    function drawMonteCarlo(r: Rect): void {
      const pr = prop();
      const info = FORMULA_INFO[fid()];
      if (!p.mc || !pr) {
        panel(r, ctx.t('propBars'), color(3));
        if (!pr) return;
        // Anteile an der Varianz als gestapelter Balken
        const sh = varianceShares(pr);
        const g = surface.g;
        const bx = r.x + 16;
        const bw = r.w - 32;
        const by = r.y + 60;
        g.fillStyle = color(0);
        g.fillRect(bx, by, bw * sh[0], 26);
        g.fillStyle = color(3);
        g.fillRect(bx + bw * sh[0], by, bw * sh[1], 26);
        label(`${info.q[0]}: ${fmt.num(sh[0] * 100, 0)} %`, bx, by + 44, 12, color(0));
        label(`${info.q[1]}: ${fmt.num(sh[1] * 100, 0)} %`, bx + bw, by + 44, 12, color(3), 'right');
        paragraph(ctx.t('propExp'), { x: bx, y: by + 70, w: bw, h: r.h - 140 }, 12);
        return;
      }
      panel(r, ctx.t('propMc'), color(3));
      const vals = monteCarlo(FORMULAS[fid()], [p.x1, p.x2], [p.u1, p.u2], 400, p.seed);
      if (vals.length < 10) return;
      const st = statistics(vals);
      const lo = pr.value - 4 * pr.uGauss;
      const hi = pr.value + 4 * pr.uGauss;
      const inside = vals.filter((v) => v >= lo && v <= hi);
      const bins = histogram(inside.length ? inside : vals, 16);
      const width = bins[0] ? bins[0].to - bins[0].from : 1;
      const maxC = Math.max(1, ...bins.map((b) => b.count));
      const c = chart(r, [lo, hi], [0, maxC * 1.15], `${info.sym} in ${info.res}`, ctx.t('freq'), 3);
      const g = surface.g;
      for (const b of bins) {
        g.fillStyle = withAlpha(color(3), 0.55);
        g.fillRect(c.x(b.from) + 0.5, c.y(b.count), Math.max(1, c.x(b.to) - c.x(b.from) - 1), c.y(0) - c.y(b.count));
      }
      // erwartete Normalverteilung mit u nach Gauß
      g.save();
      g.strokeStyle = color(2);
      g.lineWidth = 2.2;
      g.beginPath();
      for (let i = 0; i <= 80; i++) {
        const x = lo + ((hi - lo) * i) / 80;
        const d = normalDensity(x, pr.value, pr.uGauss) ?? 0;
        const y = d * vals.length * width;
        if (i) g.lineTo(c.x(x), c.y(y));
        else g.moveTo(c.x(x), c.y(y));
      }
      g.stroke();
      g.restore();
      for (const v of [pr.value - pr.uGauss, pr.value + pr.uGauss]) line(c.x(v), c.rect.y, c.x(v), c.rect.y + c.rect.h, withAlpha(color(2), 0.7), 1.2, [4, 4]);
      mcNote = p.show ? ctx.t('propMcNote').replace('{s}', fmt.num(st.sampleSD ?? 0, 3)).replace('{u}', fmt.num(pr.uGauss, 3)) : '';
    }
    function drawPropagateSummary(r: Rect): void {
      panel(r, ctx.t('result'), color(2));
      const pr = prop();
      const info = FORMULA_INFO[fid()];
      const wide = r.w > 600;
      const x = r.x + 16;
      const w = wide ? r.w / 2 - 24 : r.w - 32;
      if (pr && p.show) {
        label(resultText(), x, r.y + 52, 15, color(2), 'left', 800);
        const dom = info.q[pr.dominant];
        paragraph(ctx.t('propDom').replace('{q}', dom), { x, y: r.y + 74, w, h: 40 }, 12, ctx.theme.text);
        if (p.mc && mcNote && wide && r.h > 160) paragraph(mcNote, { x, y: r.y + 112, w, h: 36 }, 11);
      }
      const rule = `${ctx.t('propRule')} ${fid() === 'pendulum' ? ctx.t('propExp') : ''} ${ctx.t('propRound')}`;
      if (wide) paragraph(rule, { x: r.x + r.w / 2 + 8, y: r.y + 50, w: r.w / 2 - 24, h: r.h - 60 }, 12);
      else paragraph(ctx.t('propRule'), { x, y: r.y + 110, w, h: r.h - 116 }, 12);
    }
    function checkQuiz(): void {
      const nr = noniusReading(p.jaw, kind());
      quizVerdict = Math.abs(p.guess - nr.reading) < noniusScale(kind()).resolution / 2 - 1e-9;
      ctx.announce(quizVerdict ? ctx.t('calOk') : ctx.t('calNo'));
      updateReadouts();
      ctx.requestRender();
    }


    /* -------------------------------------------------------------- */
    /* 7 · Zeit stoppen: Reaktionszeit                                 */
    /* -------------------------------------------------------------- */

    interface Stop { n: number; T: number; sim: boolean }
    let stops: Stop[] = [];
    let swStart: number | null = null;
    const swT0 = performance.now();
    const swNow = () => (performance.now() - swT0) / 1000;
    const nPer = () => Number(p.periods);
    function pendulumAngle(t: number): number {
      return 0.42 * Math.cos((2 * Math.PI * t) / PENDULUM_T);
    }
    function toggleStop(): void {
      if (ctx.locked) return;
      const t = swNow();
      if (swStart === null) {
        swStart = t;
        ctx.announce(ctx.t('swRun'));
      } else {
        const total = t - swStart;
        swStart = null;
        const T = periodFromStops(total, nPer());
        stops = [...stops, { n: nPer(), T, sim: false }].slice(-30);
        ctx.announce(`T = ${fmt.num(T, 3)} s`);
        pulse.play();
      }
      ctx.setAction('sw', { label: swStart === null ? local('Start', 'Start') : local('Stopp', 'Stop') });
      updateReadouts();
      ctx.requestRender();
    }
    function simulateStops(): void {
      const seed = p.seed * 31 + stops.length * 7 + nPer();
      const totals = simulatedStops(nPer(), 5, seed);
      stops = [...stops, ...totals.map((tot) => ({ n: nPer(), T: periodFromStops(tot, nPer()), sim: true }))].slice(-30);
      pulse.play();
      updateReadouts();
      ctx.requestRender();
    }
    function stopStats(n: number): Statistics {
      return statistics(stops.filter((q) => q.n === n).map((q) => q.T));
    }
    function drawStopwatch(r: Rect): void {
      panel(r, ctx.t('swT'));
      const g = surface.g;
      const t = swNow();
      const pivot = { x: r.x + r.w * (r.w > 420 ? 0.36 : 0.5), y: r.y + 52 };
      const len = r.w > 420 ? Math.min(r.h - 120, r.w * 0.6, 260) : Math.min(r.h - 190, r.w * 0.6, 260);
      const a = prefersReducedMotion() ? 0.42 : pendulumAngle(t);
      const bx = pivot.x + Math.sin(a) * len;
      const by = pivot.y + Math.cos(a) * len;
      // Aufhängung
      g.fillStyle = withAlpha(ctx.theme.text, 0.35);
      g.fillRect(pivot.x - 40, pivot.y - 6, 80, 6);
      // Umkehrpunkte
      for (const s0 of [-1, 1]) {
        const ex = pivot.x + Math.sin(0.42 * s0) * len;
        const ey = pivot.y + Math.cos(0.42 * s0) * len;
        line(ex, ey + 16, ex, ey + 30, withAlpha(color(3), s0 > 0 ? 0.9 : 0.35), 2);
      }
      label('↓', pivot.x + Math.sin(0.42) * len, pivot.y + Math.cos(0.42) * len + 44, 13, color(3), 'center', 800);
      line(pivot.x, pivot.y, bx, by, ctx.theme.text, 1.6);
      const grd = g.createRadialGradient(bx - 5, by - 5, 2, bx, by, 16);
      grd.addColorStop(0, '#f4d38a');
      grd.addColorStop(1, '#b07a1e');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(bx, by, 14, 0, Math.PI * 2);
      g.fill();
      // Stoppuhr
      const cx = r.w > 420 ? r.x + r.w * 0.78 : r.x + r.w * 0.5;
      const cy = r.w > 420 ? r.y + r.h * 0.5 : r.y + r.h - 46;
      const shown = swStart === null ? (stops.at(-1) ? stops.at(-1)!.T * stops.at(-1)!.n : 0) : t - swStart;
      g.fillStyle = ctx.theme.dark ? '#0f141c' : '#1d232c';
      roundRect(g, cx - 74, cy - 30, 148, 60, 12);
      g.fill();
      label(`${fmt.num(shown, 2)} s`, cx, cy + 1, 26, swStart === null ? '#9fe8b0' : '#ffd166', 'center', 800);
      label(swStart === null ? ctx.t('swReady') : `${ctx.t('swRun')}  ${ctx.t('swCount').replace('{c}', String(Math.floor((t - swStart) / PENDULUM_T)))}`, cx, cy + 46, 11, ctx.theme.muted, 'center');
    }
    function drawStopChart(r: Rect): void {
      panel(r, ctx.t('swSide'), color(3));
      if (!stops.length) {
        paragraph(ctx.t('swNone'), { x: r.x + 16, y: r.y + 60, w: r.w - 32, h: 40 }, 13);
        return;
      }
      const Ts = stops.map((q) => q.T);
      const lo = Math.min(PENDULUM_T - 0.25, ...Ts);
      const hi = Math.max(PENDULUM_T + 0.25, ...Ts);
      const c = chart(r, [0.5, Math.max(5, stops.length) + 0.5], [lo, hi], ctx.t('swTry'), 'T in s', 4);
      line(c.rect.x, c.y(PENDULUM_T), c.rect.x + c.rect.w, c.y(PENDULUM_T), color(2), 2, [6, 4]);
      label(`${ctx.t('swTrue')} ${fmt.fixed(PENDULUM_T, 3)} s`, c.rect.x + c.rect.w, c.y(PENDULUM_T) - 9, 10, color(2), 'right');
      stops.forEach((q, i) => {
        const ink = q.n === 1 ? color(1) : color(0);
        const fresh = i === stops.length - 1 && pulse.running;
        dot(c.x(i + 1), c.y(q.T), ink, fresh ? 7 : 5, q.sim);
      });
      label(`● ${ctx.t('swTen')}`, c.rect.x + c.rect.w, r.y + 44, 10, color(0), 'right');
      label(`● ${ctx.t('swOne')}`, c.rect.x + c.rect.w - 112, r.y + 44, 10, color(1), 'right');
    }
    function drawStopSummary(r: Rect): void {
      panel(r, ctx.t('result'), color(2));
      const wide = r.w > 600;
      const x = r.x + 16;
      const w = wide ? r.w / 2 - 24 : r.w - 32;
      let y = r.y + 50;
      for (const n of [1, 10]) {
        const st = stopStats(n);
        if (st.n >= 2 && st.mean !== null && st.sampleSD !== null) {
          label(`${ctx.t(n === 1 ? 'swOne' : 'swTen')}: ${ctx.t('swRes').replace('{t}', fmt.fixed(st.mean, 3)).replace('{u}', fmt.fixed(st.sampleSD, 3)).replace('{n}', String(st.n)).replace(r.w < 520 ? / \(.*\)$/ : /$^/, '')}`, x, y, 12, n === 1 ? color(1) : color(0), 'left', 700);
          y += 20;
        }
      }
      if (y === r.y + 50) {
        paragraph(ctx.t('swHow').replace('{n}', p.periods), { x, y, w, h: 40 }, 12, ctx.theme.text);
        y += 40;
      }
      label(`${local('Erwartet', 'Expected')}: u(T) ≈ √2 · 0,06 s / n = ${fmt.num(stopUncertainty(nPer()), 3)} s`, x, y + 4, 11, ctx.theme.muted);
      if (wide) paragraph(ctx.t('swWhy'), { x: r.x + r.w / 2 + 8, y: r.y + 50, w: r.w / 2 - 24, h: r.h - 60 }, 12);
      else paragraph(ctx.t('swWhy'), { x, y: y + 24, w, h: r.y + r.h - y - 30 }, 12);
    }

    function updateReadouts(): void {
      const values = parsed.values;
      const error = parsed.error;
      ctx.readout('status', p.mode === 'repeat' ? ctx.t('sample') : selected() >= values.length && values.length ? ctx.t('noSelection') : error ? ctx.t(error === 'empty' ? 'emptyHint' : error) : `n = ${values.length} · ${ctx.t('sample')}`);
      ctx.readout('table', p.mode !== 'repeat' && values.length ? { html: `<table class="mini-table"><tr><th>i</th>${p.mode === 'fit' ? '<th>t / s</th>' : ''}<th>${local('Messwert', 'Reading')} / cm</th></tr>${values.map((v, i) => `<tr${i === selected() ? ' class="is-current"' : ''}><td>${i + 1}</td>${p.mode === 'fit' ? `<td>${fmt.num(i * p.dt, 2)}</td>` : ''}<td>${fmt.num(v, 3)}</td></tr>`).join('')}</table>` } : null);
      ctx.readout('reading', p.mode === 'measure' ? `${ctx.t('reading')}: ${centimeters(instrumentReading(p.cursor, 0, resolution()), 2)} · d = ${centimeters(resolution(), 2)}` : null);
      const statMode = p.mode === 'series' || p.mode === 'measure';
      ctx.readout('mean', statMode ? (stats.mean === null ? ctx.t('few') : `x̄ = Σxᵢ/n ${fmt.rel(stats.mean, 4)} ${centimeters(stats.mean, 4)}`) : null);
      ctx.readout('sd', statMode ? (stats.sampleSD === null ? ctx.t('few') : `s = √[Σ(xᵢ − x̄)²/(n − 1)] ${fmt.rel(stats.sampleSD, 4)} ${centimeters(stats.sampleSD, 4)} · Σ(xᵢ − x̄)² ${fmt.rel(stats.sumSquares, 4)} ${fmt.num(stats.sumSquares, 4)} cm²`) : null);
      ctx.readout('sem', statMode ? (stats.sem === null ? ctx.t('few') : `uₐ = s/√n = ${fmt.num(stats.sampleSD!, 4)}/√${stats.n} ${fmt.rel(stats.sem, 4)} ${centimeters(stats.sem, 4)}`) : null);
      const uc = combinedUncertainty(stats.sem, resolution());
      ctx.readout('combined', statMode ? `uᵦ = d/√12 ${fmt.rel(resolutionUncertainty(resolution()), 4)} ${centimeters(resolutionUncertainty(resolution()), 4)}; uᶜ ${uc === null ? '= —' : `${fmt.rel(uc, 4)} ${centimeters(uc, 4)}`}. ${ctx.t('combinedNote')}` : null);
      ctx.readout('fit', p.mode === 'fit' ? (!fit ? ctx.t('fitFew') : `y = a·t + b; a = Σ(tᵢ−t̄)(yᵢ−ȳ)/Σ(tᵢ−t̄)² ${fmt.rel(fit.slope, 4)} ${fmt.num(fit.slope, 4)} cm/s; b = ȳ − a·t̄ ${fmt.rel(fit.intercept, 4)} ${centimeters(fit.intercept, 4)}. u(a) = ${readNumber(fit.slopeSE)} cm/s; u(b) = ${readNumber(fit.interceptSE)} cm.`) : null);
      ctx.readout('quality', p.mode === 'fit' && fit ? `rᵢ = yᵢ − (a·tᵢ+b); Σr² ${fmt.rel(fit.sse, 4)} ${fmt.num(fit.sse, 4)} cm²; sᵣ = √[Σr²/(n−2)] = ${readNumber(fit.residualSD)} cm; R² = ${readNumber(fit.rSquared)}. ${ctx.t(stats.n === 2 ? 'fitTwo' : fit.rSquared === null ? 'fitConstant' : 'notBounds')}` : null);
      ctx.readout('note', `${ctx.t(p.mode === 'fit' ? 'fitNote' : p.mode === 'measure' ? 'measureNote' : 'seriesNote')} ${ctx.t('offsetNote')}`);
      const repeat = repeatedExperiments(p.repn, p.noise, p.offset, p.seed);
      ctx.readout('repeat', p.mode === 'repeat' ? `${local('Bekannte Streuung', 'Known scatter')} σ = ${centimeters(p.noise)}; σ/√n ${fmt.rel(repeat.theoreticalSEM, 4)} ${centimeters(repeat.theoreticalSEM, 4)}. ${repeat.covered}/40 ${local('Intervalle ±σ/√n enthalten die Referenz 10 cm. Bei unverzerrten normalverteilten Messungen erwartet man langfristig rund 68 %, nicht zwingend in diesen 40 Versuchen.', 'intervals ±σ/√n contain the 10 cm reference. Unbiased normal measurements give about 68% coverage in the long run, not necessarily in these 40 experiments.')}` : null);
      ctx.readout('manual', p.mode === 'fit' && p.manual && fit ? `${local('Eigene Gerade', 'Your line')}: y = (${fmt.num(p.a, 2)} cm/s)·t ${fmt.signed(p.b, 2)} cm; Σr² = ${fmt.num(squaredResiduals(points, p.a, p.b), 4)} cm². ${local('Minimum', 'Minimum')}: ${fmt.num(fit.sse, 4)} cm².` : null);
      const steps = calculationSteps(values).slice(0, p.step);
      ctx.readout('calculation', p.mode === 'series' && p.steps ? { html: `<table class="mini-table"><tr><th>i</th><th>xᵢ − x̄ / cm</th><th>(xᵢ − x̄)² / cm²</th></tr>${steps.map((s) => `<tr><td>${s.index + 1}</td><td>${fmt.num(s.deviation, 3)}</td><td>${fmt.num(s.square, 4)}</td></tr>`).join('')}</table>Σ = ${fmt.num(steps.at(-1)?.partialSquareSum ?? 0, 4)} cm²` } : null);
      const nr = noniusReading(p.jaw, kind());
      ctx.readout('caliper', p.mode === 'caliper' ? (p.quiz && quizVerdict !== true ? ctx.t('calHidden') : `${nr.mainMm} mm + ${nr.k} · ${fmt.num(noniusScale(kind()).resolution, 2)} mm = ${fmt.num(nr.reading, 2)} mm`) : null);
      const pr = p.mode === 'propagate' ? prop() : null;
      ctx.readout('prop', p.mode === 'propagate' ? (pr ? `${resultText()} · u/${FORMULA_INFO[fid()].sym} = ${fmt.num(pr.relGauss * 100, 2)} % (${ctx.t('propMax')}: ${fmt.num(pr.relMax * 100, 2)} %)` : ctx.t('propBad')) : null);
      const st10 = stopStats(nPer());
      ctx.readout('stop', p.mode === 'stopwatch' ? (st10.mean === null ? ctx.t('swNone') : `T = t / n; ${local('Mittel', 'mean')} ${fmt.num(st10.mean, 3)} s${st10.sampleSD !== null ? `, s = ${fmt.num(st10.sampleSD, 3)} s` : ''} (n = ${p.periods})`) : null);
      if (p.mode === 'caliper' || p.mode === 'propagate' || p.mode === 'stopwatch') {
        for (const key of ['status', 'table', 'reading', 'mean', 'sd', 'sem', 'combined', 'fit', 'quality', 'repeat', 'manual', 'calculation']) ctx.readout(key, null);
        ctx.readout('note', p.mode === 'caliper' ? ctx.t('calHow') : p.mode === 'stopwatch' ? ctx.t('swWhy') : ctx.t('propRule'));
      }
      ctx.setAction('next', { enabled: !ctx.locked && p.step < values.length });
      ctx.setAction('record', { enabled: !ctx.locked && values.length < MAX_POINTS && (error === null || error === 'empty') });
      ctx.setAction('append', { enabled: !ctx.locked && values.length < MAX_POINTS && (error === null || error === 'empty') });
      ctx.setAction('remove', { enabled: !ctx.locked && selected() < values.length });
    }

    function storeValues(values: number[], pick = Math.min(p.pick, Math.max(1, values.length))): void {
      ctx.set({ data: serializeData(values), pick, value: values[pick - 1] ?? p.value });
    }
    function select(i: number): void {
      if (ctx.locked || i < 0 || i >= parsed.values.length) return;
      ctx.set({ pick: i + 1, value: parsed.values[i]! });
    }
    function movePoint(i: number, value: number): void {
      if (ctx.locked || i < 0 || i >= parsed.values.length) return;
      const values = [...parsed.values];
      values[i] = Math.round(clamp(value, -100, 100) * 100) / 100;
      storeValues(values, i + 1);
    }
    function addReading(fromRuler: boolean): void {
      if (ctx.locked || parsed.values.length >= MAX_POINTS || (parsed.error && parsed.error !== 'empty')) return;
      const index = parsed.values.length;
      const values = sampleMeasurements(index + 1, p.mode === 'fit' ? 1 : p.length, p.noise, p.offset, p.seed, p.mode === 'fit' ? p.slope : 0, p.dt);
      const reading = fromRuler ? instrumentReading(p.cursor, 0, resolution()) : values[index]!;
      storeValues([...parsed.values, reading], index + 1);
      pulse.play();
      ctx.announce(ctx.t('recorded'));
    }

    function hitAt(px: number, py: number): number | 'ruler' | 'repeat' | 'jaw' | null {
      if (ctx.locked) return null;
      if (p.mode === 'caliper' && caliperArea && px >= caliperArea.x && px <= caliperArea.x + caliperArea.w && py >= caliperArea.y && py <= caliperArea.y + caliperArea.h) return 'jaw';
      if (p.mode === 'caliper' || p.mode === 'propagate') return null;
      if (p.mode === 'repeat' && visibleResults() && Math.hypot(px-repeatHandle.x, py-repeatHandle.y) < 20) return 'repeat';
      if (p.mode === 'measure' && rulerArea && px >= rulerArea.x - 12 && px <= rulerArea.x + rulerArea.w + 12 && py >= rulerArea.y && py <= rulerArea.y + rulerArea.h) return 'ruler';
      const hit = hits.reduce<Hit | null>((best, h) => Math.hypot(px - h.x, py - h.y) < 17 && (!best || Math.hypot(px - h.x, py - h.y) < Math.hypot(px - best.x, py - best.y)) ? h : best, null);
      return hit?.id ?? null;
    }
    function dragTo(px: number, py: number): void {
      if (ctx.locked) return;
      if (drag === 'jaw') ctx.set({ jaw: Math.round(clamp((px - calScale.x0) / calScale.k, 0, 60) * 100) / 100 });
      else if (drag === 'repeat' && repeatChart) ctx.set({ repn: Math.round(clamp(1 + (px-repeatChart.rect.x)/repeatChart.rect.w*99, 1, 100)) });
      else if (drag === 'ruler' && rulerArea) ctx.set({ cursor: clamp((px - rulerArea.x) / rulerArea.w * 20, 0, 20) });
      else if (typeof drag === 'number' && dragChart) movePoint(drag, dragChart.inverseY(py));
    }
    surface.addTarget({
      contains: (px, py) => hitAt(px, py) !== null,
      pointerDown: (q) => {
        drag = hitAt(q.px, q.py);
        if (drag === null) return false;
        running = false;
        ctx.clock.pause();
        if (typeof drag === 'number') { dragChart = activeChart; select(drag); }
        dragTo(q.px, q.py);
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q) => { if (drag !== null) dragTo(q.px, q.py); },
      pointerUp: () => { drag = null; dragChart = null; surface.setCursor('grab'); ctx.requestRender(); },
      hover: (q) => { hover = q ? hitAt(q.px, q.py) : null; surface.setCursor(hover === null ? '' : 'grab'); ctx.requestRender(); },
      wheel: () => false,
    });

    function refreshKeyTargets(): void {
      if (p.mode === 'caliper') {
        const res = noniusScale(kind()).resolution;
        ctx.setKeyTargets([
          { id: 'jl', label: local(`Schieber ${fmt.num(res, 2)} mm zurück`, `Slider ${fmt.num(res, 2)} mm back`), disabled: ctx.locked, activate: () => ctx.set({ jaw: clamp(Math.round((p.jaw - res) / res) * res, 0, 60) }) },
          { id: 'jr', label: local(`Schieber ${fmt.num(res, 2)} mm vor`, `Slider ${fmt.num(res, 2)} mm forward`), disabled: ctx.locked, activate: () => ctx.set({ jaw: clamp(Math.round((p.jaw + res) / res) * res, 0, 60) }) },
        ]);
        return;
      }
      if (p.mode === 'propagate' || p.mode === 'stopwatch') {
        ctx.setKeyTargets([]);
        return;
      }
      ctx.setKeyTargets(p.mode === 'repeat' ? [] : p.mode === 'measure' ? [{ id: 'record', label: local('Ablesung übernehmen', 'Record reading'), disabled: ctx.locked || parsed.values.length >= MAX_POINTS, activate: () => addReading(true) }] : hits.map((h) => ({
        id: `point-${h.id}`, label: `${ctx.t('point')} ${h.id + 1}: ${centimeters(parsed.values[h.id]!)}`, rect: { x: h.x - 12, y: h.y - 12, w: 24, h: 24 }, disabled: ctx.locked, activate: () => select(h.id),
      })));
    }

    return {
      update(changed, source) {
        if (source === 'input' && changed.has('value') && !changed.has('data')) {
          movePoint(selected(), p.value);
          return;
        }
        if (source === 'input' && changed.has('pick') && selected() < parsed.values.length) {
          ctx.set({ value: parsed.values[selected()]! });
        }
        if (changed.has('jaw')) {
          calFrom = calShown;
          if (source === 'input' && drag !== 'jaw') calTw.play();
          else calShown = p.jaw;
          quizVerdict = null;
        }
        if (changed.has('nonius') || changed.has('quiz')) quizVerdict = null;
        if (changed.has('guess') && source === 'input') quizVerdict = null;
        if (changed.has('formula') && source === 'input') ctx.set(PRESET_VALUES[fid()]);
        if (['formula', 'x1', 'x2', 'u1', 'u2', 'mode'].some((k) => changed.has(k))) barGrow.play();
        if (source === 'init' || source === 'replace') calShown = p.jaw;
        if (changed.has('data') || source === 'init') {
          oldValues = [...shownValues];
          parsed = parseData(p.data);
          stats = statistics(parsed.values);
          if (source !== 'init') transition.play();
        }
        points = timedPoints(parsed.values, p.dt);
        fit = linearFit(points);
        if ((changed.has('data') || changed.has('pick') || source === 'init' || source === 'replace') && parsed.values[selected()] !== undefined && p.value !== parsed.values[selected()]) ctx.set({ value: parsed.values[selected()]! });
        if (changed.has('mode') && source !== 'init') {
          changeMode = previousMode !== p.mode;
          transition.play();
        }
        if (changed.has('repn') || changed.has('noise') || changed.has('offset') || changed.has('seed') || changed.has('step')) transition.play();
        if (source === 'init') { if (!prefersReducedMotion()) intro.play(); previousMode = p.mode as Mode; }
        if (source === 'input' || source === 'replace') { running = false; ctx.clock.pause(); }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'next') ctx.set({ step: Math.min(parsed.values.length, p.step + 1) });
        else if (id === 'best' && fit) ctx.set({ a: fit.slope, b: fit.intercept });
        else if (id === 'record') addReading(true);
        else if (id === 'newobj') {
          // reproduzierbar aus der Versuchsnummer: neue Länge zwischen 5 und 55 mm
          const nextSeed = (p.seed % 999) + 1;
          const len = 5 + (((nextSeed * 7919) % 5000) / 100);
          ctx.set({ seed: nextSeed, jaw: Math.round(len / noniusScale(kind()).resolution) * noniusScale(kind()).resolution, guess: 0 });
        } else if (id === 'check') checkQuiz();
        else if (id === 'sw') toggleStop();
        else if (id === 'swauto') simulateStops();
        else if (id === 'swclear') {
          stops = [];
          swStart = null;
          ctx.setAction('sw', { label: local('Start', 'Start') });
          updateReadouts();
          ctx.requestRender();
        }
        else if (id === 'append') addReading(false);
        else if (id === 'remove' && selected() < parsed.values.length) {
          storeValues(parsed.values.filter((_, i) => i !== selected()));
          ctx.announce(ctx.t('removed'));
        } else if (id === 'clear') {
          storeValues([]);
          running = false;
          ctx.clock.pause();
          ctx.announce(ctx.t('cleared'));
        } else if (id === 'generate') {
          storeValues(sampleMeasurements(p.count, p.mode === 'fit' ? 1 : p.length, p.noise, p.offset, p.seed, p.mode === 'fit' ? p.slope : 0, p.dt));
          ctx.announce(ctx.t('generated'));
        }
      },
      tick(dt) {
        // Abspielen ergänzt die Messreihe, höchstens bis zur sichtbaren Grenze.
        if (ctx.locked || p.mode === 'measure' || p.mode === 'repeat' || p.mode === 'caliper' || p.mode === 'propagate' || p.mode === 'stopwatch') { ctx.clock.pause(); return; }
        running = true;
        elapsed += dt;
        if (elapsed >= 1) { elapsed %= 1; if (p.steps && p.mode === 'series') { ctx.set({ step: Math.min(parsed.values.length, p.step + 1) }); if (p.step >= parsed.values.length) { running = false; ctx.clock.pause(); } } else addReading(false); }
        if (parsed.values.length >= MAX_POINTS || (parsed.error && parsed.error !== 'empty')) { running = false; ctx.clock.pause(); }
      },
      resetTime() { elapsed = 0; running = false; },
      render() {
        const g = surface.begin();
        hits = [];
        rulerArea = null;
        caliperArea = null;
        activeChart = null;
        if (calTw.running) calShown = calFrom + (p.jaw - calFrom) * calTw.value;
        else calShown = p.jaw;
        const lay = layout();
        const progress = transition.running ? transition.value : 1;
        // Nur Messwerte überblenden; die Auswertung wird aus diesen Werten neu berechnet.
        shownValues = parsed.values.map((value, i) => drag !== null ? value : (oldValues[i] ?? value) + (value - (oldValues[i] ?? value)) * progress);
        const shownStats = statistics(shownValues);
        const shownFit = linearFit(timedPoints(shownValues, p.dt));
        g.save();
        g.globalAlpha = intro.running ? 0.3 + 0.7 * intro.value : 1;
        if (changeMode && transition.running) g.globalAlpha *= 0.35 + 0.65 * progress;
        g.translate(0, intro.running ? (1 - intro.value) * 8 : 0);
        if (p.mode === 'stopwatch') {
          drawStopwatch(lay.main);
          drawStopChart(lay.side);
        } else if (p.mode === 'caliper') {
          drawCaliper(lay.main);
          drawNoniusZoom(lay.side);
        } else if (p.mode === 'propagate') {
          drawPropagate(lay.main);
          drawMonteCarlo(lay.side);
        } else if (p.mode === 'measure') {
          drawRuler(lay.main);
          drawMagnifier(lay.side);
        } else if (p.mode === 'repeat') {
          drawRepeat(lay.main, lay.side);
        } else if (parsed.error) {
          panel(lay.main, ctx.t('empty'));
          paragraph(ctx.t(parsed.error === 'empty' ? 'emptyHint' : parsed.error), { x: lay.main.x + 20, y: lay.main.y + 75, w: lay.main.w - 40, h: lay.main.h - 90 }, 14);
          panel(lay.side, ctx.t('result'), color(2));
        } else if (p.mode === 'series') {
          drawSeries(lay.main, shownValues, shownStats);
          if (p.steps) drawCalculation(lay.side); else drawDeviations(lay.side, shownValues, shownStats);
        } else {
          drawFit(lay.main, shownValues, shownFit);
          drawResiduals(lay.side, shownValues, shownFit);
        }
        if (p.mode === 'repeat') drawRepeatSummary(lay.foot);
        else if (p.mode === 'caliper') drawCaliperSummary(lay.foot);
        else if (p.mode === 'stopwatch') drawStopSummary(lay.foot);
        else if (p.mode === 'propagate') drawPropagateSummary(lay.foot);
        else drawSummary(lay.foot, shownStats, shownFit);
        g.restore();
        refreshKeyTargets();
        if (!transition.running) { changeMode = false; previousMode = p.mode as Mode; }
        if (intro.running || transition.running || pulse.running || calTw.running || barGrow.running || (p.mode === 'stopwatch' && !prefersReducedMotion()) || (running && ctx.clock.playing)) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
