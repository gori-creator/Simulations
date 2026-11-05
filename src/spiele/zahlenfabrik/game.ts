import { L } from '../../curriculum/helpers';
import type { Lang, Localized } from '../../i18n/config';
import { art, chapterImage, imageFor, IMAGES, machineFile, mergeFile, switchFile, type ArtKind } from './art';
import { icon, setButton, type IconName } from './icons';
import { lessonSeen, showLessons } from './lessons';
import { createSound } from './sound';
import { clampNum, KIT, kitItem, specFor, type KitId, type KitItem, type LessonId } from './kit';
import { ALL_LEVELS, CHAPTERS, chapterOf, kitFor, newIn, PARTS, SPECIAL, type LevelInfo } from './levels';
import { dailyLevel, dayKey, randomLevel } from './daily';
import { blankSpec, decodeSpec, encodeSpec, SIZE, specToLevel, type CustomSpec } from './custom';
import { chainLevel, solveChain } from './solver';
import { accepts, asFraction, emitCount, sourcesOf, canPlace, DX, DY, key, opLabel, outputs, sourceValue, start, starsFor, step, targetsOf, totalNeed, trace, withFixed, type Accept, type Dir, type Grid, type Item, type Op, type Part, type State, type Target } from './model';
import { deliver, newEconomy, orderAt, orderText, unlockedBy, unlockedParts, type Economy, type Order } from './orders';
import { makePart, partId, priceOf, specById, specLabel, specName, testLabel, WORLD_PARTS, type PartSpec } from './parts';
import { BUYERS_FROM, canBuildWorld, inRect, makeWorld, START_OFFSET, worldStart, worldStep, ZONE_PRICES, zoneRect, type Buyer, type OpenWorld, type WorldState } from './world';

/**
 * Zahlenfabrik (Probe, Welt 1): freie Fläche aus Kästchen, die man mit der
 * Hand verschiebt und zoomt. Aus dem Inventar zieht (oder tippt) man Bänder
 * und Maschinen auf die Karte; mit dem Band-Werkzeug zieht man ganze Wege.
 */
const ARROW = ['→', '↓', '←', '↑'];
const STORE = 'spiel:zahlenfabrik';
const WORLD_STORE = 'spiel:zahlenfabrik:welt';
const CELL = 64;
const MIN_ZOOM = 0.2;
const FIT_MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.8;
const SVG_NS = 'http://www.w3.org/2000/svg';
/** Mitte der Feldkante in Richtung d (relativ zur Feldecke). */
const EDGE: [number, number][] = [
  [CELL, CELL / 2],
  [CELL / 2, CELL],
  [0, CELL / 2],
  [CELL / 2, 0],
];

/** Werkzeug; `kit`: einstellbares Bauteil aus dem Werkzeugkasten der Level. */
type Tool = { kind: 'hand' } | { kind: 'part'; spec: PartSpec; kit?: KitId } | { kind: 'erase' } | { kind: 'select' } | { kind: 'paste' };
const BELT: PartSpec = { id: 'belt', kind: 'belt', price: 1 };
const isBelt = (t: Tool) => t.kind === 'part' && t.spec.kind === 'belt';

const T = {
  start: L('Start', 'Start'),
  pause: L('Pause', 'Pause'),
  stepBtn: L('Ein Takt', 'One tick'),
  fast: L('Schnell', 'Fast'),
  stop: L('Stopp', 'Stop'),
  clear: L('Leeren', 'Clear'),
  hand: L('Hand', 'Hand'),
  belt: L('Band', 'Belt'),
  erase: L('Abbauen', 'Remove'),
  source: L('Quelle', 'Source'),
  target: L('Lager', 'Storage'),
  next: L('Nächstes Level', 'Next level'),
  parts: L('Teile', 'Parts'),
  delivered: L('Geliefert', 'Delivered'),
  levels: L('Level', 'Levels'),
  zoomIn: L('Hineinzoomen', 'Zoom in'),
  zoomOut: L('Herauszoomen', 'Zoom out'),
  fit: L('Alles zeigen', 'Show all'),
  inventory: L('Inventar', 'Inventory'),
  howto: L(
    'Hand: Karte verschieben (zwei Finger oder Mausrad: zoomen). Band: über die Kästchen ziehen. Maschinen und Weichen: im Werkzeugkasten wählen, darunter die Zahl einstellen, dann ein Kästchen antippen (oder das Teil hinziehen). Ein Teil mit derselben Zahl nochmal antippen dreht es, mit einer anderen Zahl bekommt es die neue Zahl.',
    'Hand: move the map (two fingers or mouse wheel: zoom). Belt: drag across the squares. Machines and switches: choose them in the toolbox, set the number below, then tap a square (or drag the part there). Tap a part with the same number again to turn it; with another number it gets the new number.',
  ),
  won: L('Auftrag erfüllt!', 'Order complete!'),
  chooseLevel: L('Level', 'Levels'),
  chooseLevelLabel: L('Level wählen', 'Choose a level'),
  worldCard: L('Münzen sammeln, Aufträge erfüllen, Land freikaufen', 'Collect coins, complete orders, unlock land'),
  undo: L('Rückgängig', 'Undo'),
  pro: L('Profi-Level', 'pro level'),
  proShort: L('Profi', 'Pro'),
  task: L('Aufgabe', 'Task'),
  undoNone: L('Es gibt nichts mehr rückgängig zu machen.', 'There is nothing left to undo.'),
  boardLabel: L('Fabrik-Karte. Pfeiltasten: Feld wählen. Leertaste oder Enter: Teil setzen oder drehen. Umschalt + Pfeiltaste: Band ziehen. Entf: abbauen.', 'Factory map. Arrow keys: choose a square. Space or Enter: place or turn a part. Shift + arrow key: draw a belt. Delete: remove.'),
  keys: L(
    'Tastatur: Karte anklicken oder mit Tab hinspringen. Pfeiltasten wählen ein Feld, Leertaste/Enter setzt oder dreht das Teil, Umschalt + Pfeil zieht ein Band, Entf baut ab, H/B/A wählen Hand, Band, Abbauen, Ziffern 1–9 die Teile im Werkzeugkasten, < und > stellen ihre Zahl ein, P startet oder pausiert, + und − zoomen.',
    'Keyboard: click the map or tab to it. Arrow keys choose a square, Space/Enter places or turns the part, Shift + arrow draws a belt, Delete removes, H/B/A choose hand, belt, remove, digits 1–9 the parts in the toolbox, < and > set their number, P starts or pauses, + and − zoom.',
  ),
  cellEmpty: L('Feld {x}, {y}: frei', 'Square {x}, {y}: empty'),
  cellBlocked: L('Feld {x}, {y}: hier kann man nicht bauen', 'Square {x}, {y}: you can’t build here'),
  cellRock: L('Feld {x}, {y}: Fels', 'Square {x}, {y}: rock'),
  cellSource: L('Feld {x}, {y}: Quelle mit {v}', 'Square {x}, {y}: source with {v}'),
  cellTarget: L('Feld {x}, {y}: Lager, will {t}', 'Square {x}, {y}: storage, wants {t}'),
  cellBase: L('Feld {x}, {y}: Basis', 'Square {x}, {y}: base'),
  cellPart: L('Feld {x}, {y}: {p}, Richtung {d}', 'Square {x}, {y}: {p}, direction {d}'),
  dirNames: L('rechts|unten|links|oben', 'right|down|left|up'),
  help: L('Anleitung', 'How to play'),
  soundOn: L('Töne an', 'Sound on'),
  soundOff: L('Töne aus', 'Sound off'),
  soundLabel: L('Töne', 'Sound'),
  pick: L('Startzahl', 'Starting number'),
  pickLess: L('Startzahl kleiner', 'Smaller starting number'),
  pickMore: L('Startzahl größer', 'Bigger starting number'),
  pickFirst: L('Stell zuerst bei „Startzahl“ eine Zahl ein.', 'First set a number at “Starting number”.'),
  sourceSeq: L('Die Quelle gibt aus: {list}', 'The source gives: {list}'),
  sourceSeqN: L('Quelle {n} gibt aus: {list}', 'Source {n} gives: {list}'),
  tableX: L('x', 'x'),
  tableWant: L('Lager will', 'Storage wants'),
  tableGot: L('angekommen', 'arrived'),
  worldLabel: L('Welt {n}: {t}', 'World {n}: {t}'),
  worldGrades: L('Klasse {g}', 'Grade {g}'),
  nextWorld: L('Nächste Welt', 'Next world'),
  fell: L('Die {v} ist vom Band gefallen! Dort fehlt ein Teil oder es zeigt in die falsche Richtung.', 'The {v} fell off the belt! A part is missing there or points the wrong way.'),
  wrong: L('Das Lager will {t}, aber es kam {v} an.', 'The storage wants {t}, but {v} arrived.'),
  wantValue: L('die {n}', 'the {n}'),
  wantNext: L('als Nächstes die {n}', 'the {n} next'),
  divide: L('{v} lässt sich hier nicht glatt teilen.', '{v} can’t be divided evenly here.'),
  root: L('Aus {v} lässt sich keine glatte Wurzel ziehen – {v} ist keine Quadratzahl.', '{v} has no whole square root – {v} is not a square number.'),
  splitHelp: L('Verteiler: Jede Zahl läuft als Kopie in beide Richtungen weiter. Antippen dreht ihn, nach vier Drehungen wechselt die Seite.', 'Splitter: every number continues as a copy in both directions. Tap to turn it; after four turns the side switches.'),
  splitShort: L('Kopie', 'copy'),
  altHelp: L('Wechsel-Weiche: Die Zahlen gehen abwechselnd geradeaus (1.) und zur Seite (2.). Antippen dreht sie, nach vier Drehungen wechselt die Seite.', 'Alternator: the numbers go straight (1st) and to the side (2nd) in turn. Tap to turn it; after four turns the side switches.'),
  altShort: L('Wechsel', 'turns'),
  timeout: L('Die Zahlen kommen nie im Lager an – fahren sie im Kreis?', 'The numbers never reach the storage – are they going round in circles?'),
  starsPar: L('★ 2: höchstens {n} Teile', '★ 2: at most {n} parts'),
  goalPar: L('höchstens {n} Teile', 'at most {n} parts'),
  goalFirst: L('gleich beim 1. Start', 'on the first run'),
  coinsShort: L('Münzen', 'Coins'),
  totalShort: L('Geliefert', 'Delivered'),
  lostShort: L('Verloren', 'Lost'),
  starsFirst: L('★ 3: gleich beim ersten Start', '★ 3: on the first run'),
  machines: L('Maschinen', 'Machines'),
  tooMany: L('Hier sind höchstens {n} Maschinen erlaubt. Bau eine ab oder gib einer Maschine eine andere Zahl.', 'At most {n} machines are allowed here. Remove one or give a machine another number.'),
  noMachines: L('Hier sind keine eigenen Maschinen erlaubt – nur Bänder. Wähle die Startzahl!', 'No machines of your own are allowed here – only belts. Choose the starting number!'),
  noMachinesNote: L('In diesem Level sind keine Maschinen erlaubt.', 'No machines are allowed in this level.'),
  onlyBelts: L('In diesem Level stehen die Maschinen schon fest. Du brauchst nur Bänder.', 'In this level the machines are already fixed. You only need belts.'),
  ruleMax: L('höchstens {n} Maschinen', 'at most {n} machines'),
  numFor: L('Zahl für {p}', 'Number for {p}'),
  numLess: L('Zahl kleiner', 'Smaller number'),
  numMore: L('Zahl größer', 'Bigger number'),
  numTile: L('{p}, eingestellt: {n}', '{p}, set to: {n}'),
  newBadge: L('Neu', 'New'),
  rock: L('Fels', 'Rock'),
  editor: L('Baukasten', 'Level builder'),
  editorTitle: L('Eigenes Level bauen', 'Build your own level'),
  editorCard: L('Eigene Level bauen und als Link teilen', 'Build your own levels and share them as a link'),
  editorHelp: L('Setz Quelle, Lager und Felsen (Quelle nochmal antippen dreht sie). Rechts stellst du die Zahlen ein. Dann „Testen“.', 'Place the source, storage and rocks (tap the source again to turn it). Set the numbers on the right. Then “Test”.'),
  editorName: L('Name', 'Name'),
  editorNamePh: L('z. B. Aus 3 wird 50', 'e.g. 3 becomes 50'),
  editorSource: L('Quelle gibt aus', 'Source gives'),
  editorWant: L('Lager will', 'Storage wants'),
  editorSize: L('Größe', 'Size'),
  editorNarrower: L('schmaler', 'narrower'),
  editorWider: L('breiter', 'wider'),
  editorLower: L('niedriger', 'lower'),
  editorTaller: L('höher', 'taller'),
  editorMax: L('Höchstens Maschinen', 'At most machines'),
  editorNoLimit: L('keine Grenze', 'no limit'),
  editorKit: L('Werkzeugkasten', 'Toolbox'),
  editorUpTo: L('bis Kapitel {n}: {t}', 'up to chapter {n}: {t}'),
  editorNote: L('Eine Zahl beim Lager heißt: diese Zahl dreimal. Mehrere Zahlen heißen: genau diese Folge.', 'One number at the storage means: this number three times. Several numbers mean: exactly this sequence.'),
  editorTest: L('Testen', 'Test'),
  editorShare: L('Link kopieren', 'Copy link'),
  editorNew: L('Neu anfangen', 'Start over'),
  editorCopied: L('Link kopiert! Wer ihn öffnet, spielt dein Level.', 'Link copied! Whoever opens it plays your level.'),
  editorCopyManual: L('Link zum Kopieren:', 'Link to copy:'),
  backToEditor: L('Baukasten', 'Builder'),
  select: L('Auswählen', 'Select'),
  selHelp: L('Auswählen: Zieh einen Rahmen um mehrere Teile. Dann kannst du sie kopieren, verschieben oder löschen.', 'Select: drag a frame around several parts. Then you can copy, move or delete them.'),
  selCount: L('{n} Teile markiert', '{n} parts selected'),
  selEmpty: L('Im markierten Bereich ist nichts gebaut.', 'Nothing is built in the selected area.'),
  selCopy: L('Kopieren', 'Copy'),
  selMove: L('Verschieben', 'Move'),
  selDelete: L('Löschen', 'Delete'),
  selCancel: L('Abbrechen', 'Cancel'),
  selRotate: L('Drehen', 'Rotate'),
  selDone: L('Fertig', 'Done'),
  pasteHint: L('Tipp aufs Feld für die linke obere Ecke – so oft du willst.', 'Tap the square for the top-left corner – as often as you like.'),
  pasteMove: L('Tipp aufs Feld, wohin die Teile sollen (linke obere Ecke).', 'Tap the square where the parts should go (top-left corner).'),
  pasteBlocked: L('Dort ist kein Platz für alle Teile.', 'There is no room for all the parts there.'),
  pasteLocked: L('Ein Teil davon ist noch nicht freigeschaltet.', 'One of these parts is not unlocked yet.'),
  allStars: L('Alle Sterne geholt!', 'All stars collected!'),
  tip: L('Tipp', 'Hint'),
  tipCount: L('Mit {n} Maschinen geht es.', 'It works with {n} machines.'),
  tipOne: L('Mit einer Maschine geht es.', 'It works with one machine.'),
  tipNone: L('Du brauchst gar keine Maschine – nur Bänder.', 'You don’t need any machine – just belts.'),
  tipFirst: L('Die erste Maschine ist {p}.', 'The first machine is {p}.'),
  tipAll: L('Eine Lösung: {p} (in dieser Reihenfolge).', 'One solution: {p} (in this order).'),
  tipGeneral: L('Tipp: Drück „Ein Takt“ und schau, wo eine Zahl falsch abbiegt oder vom Band fällt. Die Aufgabe oben sagt, was jedes Lager will.', 'Hint: press “One tick” and watch where a number turns the wrong way or falls off the belt. The task above says what each storage wants.'),
  tipMore: L('Noch ein Tipp', 'Another hint'),
  traceLabel: L('Rechenweg', 'Calculation path'),
  traceFor: L('für {v}', 'for {v}'),
  traceGap: L('Weg endet hier – Band fehlt', 'path ends here – belt missing'),
  traceBranch: L('weiter an der Weiche …', 'continues at the switch …'),
  traceError: L('Maschine kann nicht rechnen', 'machine can’t calculate'),
  traceStorage: L('Lager', 'storage'),
  continueAt: L('Weiterspielen: Kapitel {c} · Level {l}', 'Continue: chapter {c} · level {l}'),
  starsTotal: L('{n} von {m} Sternen', '{n} of {m} stars'),
  daily: L('Tagesrätsel', 'Daily puzzle'),
  dailyMeta: L('Jeden Tag ein neues Rätsel mit allen Bauteilen · {d}', 'A new puzzle with all parts every day · {d}'),
  random: L('Zufallsrätsel', 'Random puzzle'),
  randomMeta: L('Ein neues Rätsel mit genau einem Weg – so oft du willst', 'A new puzzle with exactly one way – as often as you like'),
  anotherRandom: L('Noch ein Zufallsrätsel', 'Another random puzzle'),
  building: L('Rätsel wird gebaut …', 'Building the puzzle …'),
  groupMachines: L('Maschinen', 'Machines'),
  groupSwitches: L('Weichen', 'Switches'),
  groupFlow: L('Zusammenführen & mehr', 'Merging & more'),
  newIn: L('Neu in diesem Kapitel: {p}', 'New in this chapter: {p}'),
  explain: L('Erklärung', 'Explain'),
  chapterLabel: L('Kapitel {n}: {t}', 'Chapter {n}: {t}'),
  nextChapter: L('Nächstes Kapitel', 'Next chapter'),
  editLocked: L('Erst stoppen, dann umbauen.', 'Stop first, then rebuild.'),
  fixed: L('schon da', 'already here'),
  world: L('Offene Welt', 'Open world'),
  worldTitle: L('Offene Welt', 'Open world'),
  worldHint: L(
    'Leg Bänder von den Zahlenquellen zu deiner Basis. Neue Zahlen entstehen nur, wenn du zwei Ströme aus verschiedenen Quellen zusammenführst (plus, minus, mal, geteilt); Weichen filtern sie. Jede Zahl bringt 1 Münze, eine passende für den Auftrag 5. Aufträge schalten neue Teile frei.',
    'Lay belts from the number sources to your base. New numbers only appear when you merge two streams from different sources (plus, minus, times, divided); switches filter them. Every number earns 1 coin, one that fits the order earns 5. Orders unlock new parts.',
  ),
  eyebrowWorld: L('Zahlenfabrik · Offene Welt', 'Number Factory · Open world'),
  score: L('Gesammelt: {n}', 'Collected: {n}'),
  count: L('{n} Zahlen', '{n} numbers'),
  lost: L('verloren: {n}', 'lost: {n}'),
  base: L('Basis', 'Base'),
  resetWorld: L('↺ Welt neu', '↺ New world'),
  resetConfirm: L('Alle Bänder und Maschinen abbauen? Du bekommst die Münzen dafür zurück.', 'Remove all belts and machines? You get the coins back.'),
  coins: L('{n} Münzen', '{n} coins'),
  total: L('Insgesamt geliefert: {n}', 'Delivered in total: {n}'),
  order: L('Auftrag {n}', 'Order {n}'),
  reward: L('Belohnung: {n} Münzen', 'Reward: {n} coins'),
  rewardNew: L('neu: {p}', 'new: {p}'),
  streakHint: L('Eine andere Zahl setzt auf 0 zurück.', 'Any other number resets to 0.'),
  orderDone: L('Auftrag geschafft! +{n} Münzen.', 'Order complete! +{n} coins.'),
  unlocked: L('Neu im Inventar: {p}', 'New in your inventory: {p}'),
  tooPoor: L('Dafür fehlen dir {n} Münzen. Liefere mehr Zahlen zur Basis!', 'You need {n} more coins. Deliver more numbers to the base!'),
  locked: L('{p} gibt es nach Auftrag {n}.', '{p} unlocks after order {n}.'),
  lockedShort: L('Auftrag {n}', 'Order {n}'),
  price: L('{n} Münzen', '{n} coins'),
  sourceLocked: L('Diese Quelle liegt in einem Gebiet, das du noch freikaufen musst.', 'This source is in an area you still have to unlock.'),
  bridgeHelp: L('Brücke: Zahlen laufen geradeaus darüber – waagerecht und senkrecht, ohne sich zu stören. So kreuzen sich zwei Bänder.', 'Bridge: numbers run straight across – horizontally and vertically, without getting in each other’s way. This is how two belts cross.'),
  expand: L('Neues Gebiet · {n}', 'New area · {n}'),
  fogLabel: L('Mehr Land für {n} Münzen', 'More land for {n} coins'),
  expandDone: L('Neues Land frei! Weiter draußen geben die Quellen größere Zahlen.', 'New land unlocked! Further out, the sources give bigger numbers.'),
  sortHelp: L('Weiche: Was die Frage erfüllt, läuft geradeaus (✓), alles andere biegt ab (✗). Antippen dreht sie, nach vier Drehungen wechselt die Seite.', 'Switch: numbers that pass go straight (✓), all others turn (✗). Tap to turn it; after four turns the side switches.'),
  mergeHelp: L('Zusammenführen: Die erste Zahl wartet, bis aus einer anderen Richtung eine zweite aus einer anderen Quelle kommt (ein Band verbindet sich nicht mit sich selbst). Dann laufen beide als eine Zahl weiter – Summe, Differenz (größere − kleinere), Produkt oder Quotient (größere ÷ kleinere, nur wenn es aufgeht).', 'Merger: the first number waits until a second one arrives from another direction and another source (a belt does not merge with itself). Then both continue as one number – sum, difference (bigger − smaller), product or quotient (bigger ÷ smaller, only if it divides evenly).'),
  buyer: L('Abnehmer', 'Buyer'),
  buyersOpen: L('Neu: Abnehmer am Kartenrand kaufen bestimmte Zahlen und zahlen gut. Kauf Land frei, um sie zu erreichen!', 'New: buyers at the edge of the map buy certain numbers and pay well. Unlock land to reach them!'),
  worldReset: L('Die offene Welt hat neue Regeln (nur noch Zusammenführer und Weichen, Münzen je Zahl) und startet neu.', 'The open world has new rules (only mergers and switches, coins per number) and starts afresh.'),
  worldHowto: L(
    '✋ Hand: Karte verschieben (zwei Finger oder Mausrad: zoomen). → Band: über die Kästchen ziehen. Teile kosten Münzen, Abbauen gibt sie zurück. Ein Teil nochmal antippen dreht es. Was vom Band fällt, ist weg. Du kannst bauen, während die Fabrik läuft.',
    '✋ Hand: move the map (two fingers or mouse wheel: zoom). → Belt: drag across the squares. Parts cost coins; removing them gives the coins back. Tap a part again to turn it. Whatever falls off the belt is gone. You can build while the factory is running.',
  ),
};

/**
 * Gespeicherte offene Welt: gebaute Teile (x, y, Richtung, Kennung, Seite der
 * Weiche) und Münzen/Aufträge. Ältere Spielstände (Teile mit Maschinen-Aufschrift
 * oder null für Bänder, dazu `best`) werden übernommen.
 */
interface SavedWorld {
  v?: number;
  parts: [number, number, Dir, string | null, (1 | 3)?][];
  econ?: Partial<Economy>;
  best?: number;
}

const nonNeg = (v: unknown, fallback: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback);

/** Wurde ein alter Spielstand der offenen Welt verworfen? (einmal melden) */
let worldWasReset = false;

function loadWorld(w: OpenWorld): { grid: Grid; econ: Economy } {
  const grid: Grid = new Map();
  const fresh = newEconomy();
  try {
    const raw = JSON.parse(localStorage.getItem(WORLD_STORE) ?? '{}') as Partial<SavedWorld>;
    // Bis Version 3 galten andere Regeln (Maschinen, Münzen nach Größe): neu anfangen
    if (raw.parts && (raw.v ?? 1) < 4) {
      worldWasReset = true;
      return { grid, econ: fresh };
    }
    // Bis Version 2 war die Karte nur das heutige Startgebiet: Teile dorthin verschieben
    const [ox, oy] = (raw.v ?? 1) < 3 ? START_OFFSET : [0, 0];
    const zone = Math.min(nonNeg(raw.econ?.zone, 0), ZONE_PRICES.length - 1);
    for (const entry of raw.parts ?? []) {
      const [x0, y0, dir, id, side] = entry;
      const x = x0 + ox;
      const y = y0 + oy;
      if (!canBuildWorld(w, x, y, zone) || ![0, 1, 2, 3].includes(dir)) continue;
      const spec = specById(id ?? 'belt');
      if (!spec) continue;
      grid.set(key(x, y), makePart(spec, dir, side === 3 ? 3 : 1));
    }
    const e = raw.econ ?? {};
    const econ: Economy = {
      coins: nonNeg(e.coins, fresh.coins),
      total: nonNeg(e.total, nonNeg(raw.best, 0)),
      order: nonNeg(e.order, 0),
      progress: nonNeg(e.progress, 0),
      zone,
    };
    return { grid, econ };
  } catch {
    return { grid, econ: fresh };
  }
}

function saveWorld(grid: Grid, econ: Economy): void {
  try {
    const parts = [...grid].map(([k, p]): SavedWorld['parts'][number] => {
      const [x, y] = k.split(',').map(Number) as [number, number];
      return p.sort ? [x, y, p.dir, partId(p), p.side ?? 1] : [x, y, p.dir, partId(p)];
    });
    localStorage.setItem(WORLD_STORE, JSON.stringify({ v: 4, parts, econ } satisfies SavedWorld));
  } catch {
    // ohne Speicher: nur für diesen Besuch
  }
}

/**
 * Gemeinsame Sicht auf ein Level oder die offene Welt: Größe, Quellen,
 * Ziel (Lager oder Basis), Felsen, vorgegebene Teile, Werkzeuge.
 */
interface Board {
  cols: number;
  rows: number;
  sources: { x: number; y: number; dir: Dir; value: number }[];
  base: { x: number; y: number; w: number; h: number };
  /** Weitere Lager (Level mit mehreren Lagern). */
  extra: { x: number; y: number; w: number; h: number }[];
  walls: Set<string>;
  fixed: Map<string, Part>;
  /** Teile im Inventar (ohne Band). */
  tools: PartSpec[];
}

function boardOfLevel(l: LevelInfo): Board {
  const [first, ...rest] = targetsOf(l).map((t) => ({ x: t.x, y: t.y, w: 1, h: 1 }));
  return {
    cols: l.cols,
    rows: l.rows,
    sources: sourcesOf(l),
    base: first!,
    extra: rest,
    walls: new Set(l.walls.map(([x, y]) => key(x, y))),
    fixed: new Map((l.fixed ?? []).map((f) => [key(f.x, f.y), f.part])),
    // Im Level kommt das Werkzeug aus dem Werkzeugkasten des Kapitels (kitFor)
    tools: [],
  };
}

function boardOfWorld(w: OpenWorld): Board {
  return { cols: w.cols, rows: w.rows, sources: w.spawners, base: w.base, extra: [...(w.buyers ?? [])], walls: new Set(w.walls.map(([x, y]) => key(x, y))), fixed: new Map(), tools: WORLD_PARTS.filter((p) => p.kind !== 'belt') };
}

function load(): Record<string, number> {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) ?? '{}') as { stars?: Record<string, unknown> };
    const stars: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.stars ?? {})) if (typeof v === 'number' && v >= 1 && v <= 3) stars[k] = v;
    return stars;
  } catch {
    return {};
  }
}

function save(stars: Record<string, number>): void {
  try {
    localStorage.setItem(STORE, JSON.stringify({ stars }));
  } catch {
    // ohne Speicher: nur für diesen Besuch
  }
}

/** Was ein Lager will, als kurzer Satzteil (für Fehlermeldungen und Beschriftungen). */
function acceptText(a: Accept, got: number): Localized {
  if (a.kind === 'value') return L(`die ${fmtNum(a.n, 'de')}`, `the ${fmtNum(a.n, 'en')}`);
  if (a.kind === 'seq') {
    const n = a.values[got % a.values.length]!;
    return L(`als Nächstes die ${fmtNum(n, 'de')}`, `the ${fmtNum(n, 'en')} next`);
  }
  const t = a.test;
  const not = !!a.not;
  switch (t.kind) {
    case 'even':
      return not ? L('ungerade Zahlen', 'odd numbers') : L('gerade Zahlen', 'even numbers');
    case 'div':
      return not ? L(`Zahlen, die keine Vielfachen von ${t.n} sind`, `numbers that are not multiples of ${t.n}`) : L(`Vielfache von ${t.n}`, `multiples of ${t.n}`);
    case 'prime':
      return not ? L('Zahlen, die keine Primzahlen sind', 'numbers that are not prime') : L('Primzahlen', 'primes');
    case 'gt':
      return not ? L(`Zahlen bis ${t.n}`, `numbers up to ${t.n}`) : L(`Zahlen größer als ${t.n}`, `numbers greater than ${t.n}`);
    case 'square':
      return not ? L('Zahlen, die keine Quadratzahlen sind', 'numbers that are not square numbers') : L('Quadratzahlen', 'square numbers');
  }
}

/** Zahl mit echtem Minus (Level-Texte). */
/** Zahl mit echtem Minus; Brüche als „3/4“ (gekürzt), sonst Kommazahl. */
function fmtNum(n: number, lang: Lang): string {
  const nf = new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', { maximumFractionDigits: 4 });
  if (!Number.isInteger(n)) {
    const f = asFraction(n);
    if (f) return `${f.num < 0 ? '−' : ''}${Math.abs(f.num)}/${f.den}`;
  }
  return nf.format(n).replace('-', '−');
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

export function initFactory(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') satisfies Lang;
  const tx = (t: Localized, vars: Record<string, string | number> = {}) => t[lang].replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stars = load();
  const q = <E extends Element>(sel: string) => root.querySelector<E>(sel)!;

  const levelBar = q<HTMLElement>('[data-levels]');
  const title = q<HTMLElement>('[data-title]');
  const hint = q<HTMLElement>('[data-hint]');
  const viewport = q<HTMLElement>('[data-board]');
  const toolsEl = q<HTMLElement>('[data-tools]');
  const controls = q<HTMLElement>('[data-controls]');
  const status = q<HTMLElement>('[data-status]');
  const info = q<HTMLElement>('[data-info]');
  const orderEl = q<HTMLElement>('[data-order]');
  const howto = q<HTMLElement>('[data-howto]');
  const eyebrow = q<HTMLElement>('[data-eyebrow]');
  const barActions = q<HTMLElement>('[data-bar-actions]');
  const picker = q<HTMLElement>('[data-picker]');
  const newEl = q<HTMLElement>('[data-new]');
  howto.textContent = tx(T.howto);

  const world = el('div', 'zf-world');
  const beltLayer = document.createElementNS(SVG_NS, 'svg');
  beltLayer.setAttribute('class', 'zf-belts');
  beltLayer.setAttribute('aria-hidden', 'true');
  const cellsLayer = el('div', 'zf-cells');
  const itemsLayer = el('div', 'zf-items');
  world.append(beltLayer, cellsLayer, itemsLayer);
  // Eigener Boden (optional, Bilder boden/boden-dunkel aus docs/ZAHLENFABRIK-BILDER.md)
  if (IMAGES.boden) {
    world.classList.add('has-floor');
    world.style.setProperty('--zf-floor', `url("${IMAGES.boden}")`);
    world.style.setProperty('--zf-floor-dark', `url("${IMAGES['boden-dunkel'] ?? IMAGES.boden}")`);
  }
  const zoomBar = el('div', 'zf-zoom');
  // Tastatur: Feld-Auswahl (Rahmen auf der Karte) und Ansage für Bildschirmleser
  const cursorEl = el('div', 'zf-cursor');
  cursorEl.setAttribute('aria-hidden', 'true');
  world.append(cursorEl);
  const announce = el('p', 'visually-hidden zf-announce');
  announce.setAttribute('aria-live', 'polite');
  viewport.tabIndex = 0;
  viewport.setAttribute('role', 'application');
  viewport.setAttribute('aria-roledescription', lang === 'de' ? 'Fabrik-Karte' : 'factory map');
  // Anzeige im Spielfeld (offene Welt): Münzen und Stand beim Auftrag
  const hud = el('div', 'zf-hud');
  hud.setAttribute('aria-hidden', 'true');
  hud.hidden = true;
  viewport.append(world, zoomBar, hud);
  viewport.setAttribute('aria-label', tx(T.boardLabel));
  viewport.after(announce);
  const keysHelp = el('p', 'zf-howto zf-keys', tx(T.keys));
  q<HTMLElement>('[data-howto]').after(keysHelp);

  // Start beim ersten Level ohne Stern (in Welt-Reihenfolge)
  let index = Math.max(0, ALL_LEVELS.findIndex((l) => !stars[l.id]));
  let level: LevelInfo = ALL_LEVELS[index]!;
  /** Kapitel des aktuellen Levels. */
  let shownWorld = CHAPTERS.indexOf(chapterOf(level));
  /** Werkzeugkasten des aktuellen Levels und die eingestellten Zahlen je Bauteil. */
  let kit: KitItem[] = [];
  const nums = Object.fromEntries(KIT.map((k) => [k.id, k.start])) as Record<KitId, number>;
  /** Selbst gewählte Startzahl je Level (Welt 2). */
  const picks: Record<string, number> = {};
  const openWorld = makeWorld();
  let mode: 'level' | 'world' = 'level';
  let board: Board = boardOfLevel(level);
  let wstate: WorldState = worldStart();
  let econ: Economy = newEconomy();
  let saveCounter = 0;
  const sourceAt = (x: number, y: number) => board.sources.find((sp) => sp.x === x && sp.y === y);
  const inR = (r: { x: number; y: number; w: number; h: number }, x: number, y: number) => x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
  const baseAt = (x: number, y: number) => inR(board.base, x, y) || board.extra.some((r) => inR(r, x, y));
  const canBuild = (x: number, y: number) => (mode === 'level' ? canPlace(level, x, y) : canBuildWorld(openWorld, x, y, econ.zone));
  const allParts = (): Grid => (mode === 'level' ? withFixed(level, grid) : grid);
  const items = (): Item[] => (mode === 'level' ? state.items : wstate.items);
  let grid: Grid = new Map();
  let tool: Tool = { kind: 'part', spec: BELT };
  let state: State = start();
  let running = false;
  let fast = false;
  let timer = 0;
  let failedRuns = 0;
  let hasRun = false;
  const view = { x: 0, y: 0, s: 1 };

  // ---------- Ansicht (verschieben, zoomen) ----------
  function applyView(): void {
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.s})`;
  }

  function zoomAt(factor: number, cx: number, cy: number): void {
    const s = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.s * factor));
    const k = s / view.s;
    view.x = cx - (cx - view.x) * k;
    view.y = cy - (cy - view.y) * k;
    view.s = s;
    applyView();
  }

  /** Quelle, Lager und vorgegebene Teile ins Bild holen. */
  function fit(): void {
    const box = viewport.getBoundingClientRect();
    // Level: Quelle, Lager, vorgegebene Teile; Welt: die Umgebung der Basis
    const pts =
      mode === 'level'
        ? [...sourcesOf(level).map((sv) => [sv.x, sv.y]), ...targetsOf(level).map((t) => [t.x, t.y]), ...(level.fixed ?? []).map((f) => [f.x, f.y])]
        : [[board.base.x - 5, board.base.y - 4], [board.base.x + board.base.w + 4, board.base.y + board.base.h + 3]];
    const xs = pts.map((p) => p[0]!);
    const ys = pts.map((p) => p[1]!);
    const x0 = Math.max(0, Math.min(...xs) - 1);
    const x1 = Math.min(board.cols, Math.max(...xs) + 2);
    const y0 = Math.max(0, Math.min(...ys) - 1);
    const y1 = Math.min(board.rows, Math.max(...ys) + 2);
    // Handy, Level: Spielfeld nur so hoch wie die Karte (kein leerer Rand oben und unten)
    if (mode === 'level' && innerWidth <= 640) {
      const fitW = Math.min(1.2, Math.max(0.34, box.width / ((x1 - x0) * CELL)));
      const want = Math.round((y1 - y0) * CELL * fitW + 16);
      viewport.style.height = `${Math.max(220, Math.min(Math.round(innerHeight * 0.56), want))}px`;
    } else viewport.style.removeProperty('height');
    const fresh = viewport.getBoundingClientRect();
    // Beim Einpassen nicht zu klein (Felder sollen sich noch antippen lassen); weiter heraus zoomt man selbst
    // (am Handy etwas kleiner, damit ein ganzes Level hineinpasst)
    const minFit = innerWidth <= 640 && mode === 'level' ? 0.34 : FIT_MIN_ZOOM;
    const s = Math.min(MAX_ZOOM, Math.max(minFit, Math.min(box.width / ((x1 - x0) * CELL), fresh.height / ((y1 - y0) * CELL), 1.2)));
    view.s = s;
    view.x = box.width / 2 - ((x0 + x1) / 2) * CELL * s;
    view.y = fresh.height / 2 - ((y0 + y1) / 2) * CELL * s;
    applyView();
  }

  /** Bildschirmpunkt → Kästchen (oder null außerhalb der Karte). */
  function cellAt(clientX: number, clientY: number): [number, number] | null {
    const box = viewport.getBoundingClientRect();
    const x = Math.floor((clientX - box.left - view.x) / (CELL * view.s));
    const y = Math.floor((clientY - box.top - view.y) / (CELL * view.s));
    return x >= 0 && y >= 0 && x < board.cols && y < board.rows ? [x, y] : null;
  }

  const zoomBtn = (name: IconName, aria: string, act: () => void, extra = '') => {
    const b = el('button', `zf-zoom__btn ${extra}`.trim());
    b.append(icon(name));
    b.type = 'button';
    b.setAttribute('aria-label', aria);
    b.title = aria;
    b.addEventListener('click', act);
    zoomBar.append(b);
  };
  const center = () => {
    const box = viewport.getBoundingClientRect();
    return [box.width / 2, box.height / 2] as const;
  };
  zoomBtn('plus', tx(T.zoomIn), () => zoomAt(1.25, ...center()), 'zf-zoom__btn--step');
  zoomBtn('minus', tx(T.zoomOut), () => zoomAt(0.8, ...center()), 'zf-zoom__btn--step');
  zoomBtn('fit', tx(T.fit), fit);

  viewport.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      const box = viewport.getBoundingClientRect();
      zoomAt(event.deltaY < 0 ? 1.12 : 1 / 1.12, event.clientX - box.left, event.clientY - box.top);
    },
    { passive: false },
  );

  // ---------- Zeiger auf der Karte ----------
  const pointers = new Map<number, { x: number; y: number }>();
  let gesture: { mode: 'pan' | 'draw' | 'erase' | 'tap' | 'select'; startX: number; startY: number; moved: boolean; last: [number, number] | null } | null = null;
  let pinch: { dist: number; mx: number; my: number } | null = null;

  viewport.addEventListener('pointerdown', (event) => {
    if ((event.target as Element).closest('.zf-zoom, .zf-selbar')) return;
    viewport.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      gesture = null;
      return;
    }
    const panButton = event.button === 1 || event.button === 2;
    const mode = panButton || tool.kind === 'hand' ? 'pan' : isBelt(tool) ? 'draw' : tool.kind === 'erase' ? 'erase' : tool.kind === 'select' ? 'select' : 'tap';
    gesture = { mode, startX: event.clientX, startY: event.clientY, moved: false, last: cellAt(event.clientX, event.clientY) };
    if (mode === 'select') {
      selStart = gesture.last;
      if (selStart) setSelection(selStart, selStart);
    } else if (mode !== 'pan') remember();
    if (mode === 'erase' && gesture.last) eraseAt(...gesture.last);
    event.preventDefault();
  });

  viewport.addEventListener('pointermove', (event) => {
    // Einfügen: Vorschau unter der Maus
    if (tool.kind === 'paste' && !pointers.size) {
      const c = cellAt(event.clientX, event.clientY);
      if (c) showPasteGhost(...c);
    }
    if (!pointers.has(event.pointerId)) return;
    const prev = pointers.get(event.pointerId)!;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()] as [{ x: number; y: number }, { x: number; y: number }];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const box = viewport.getBoundingClientRect();
      view.x += mx - pinch.mx;
      view.y += my - pinch.my;
      zoomAt(dist / (pinch.dist || 1), mx - box.left, my - box.top);
      pinch = { dist, mx, my };
      return;
    }
    if (!gesture) return;
    if (Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 6) gesture.moved = true;
    if (gesture.mode === 'pan' || (gesture.mode === 'tap' && gesture.moved)) {
      gesture.mode = 'pan';
      view.x += event.clientX - prev.x;
      view.y += event.clientY - prev.y;
      applyView();
      return;
    }
    const cell = cellAt(event.clientX, event.clientY);
    if (!cell || (gesture.last && cell[0] === gesture.last[0] && cell[1] === gesture.last[1])) return;
    if (gesture.mode === 'select' && selStart) setSelection(selStart, cell);
    if (gesture.mode === 'erase') eraseAt(...cell);
    if (gesture.mode === 'draw') drawBelt(gesture.last, cell);
    gesture.last = cell;
  });

  const endPointer = (event: PointerEvent) => {
    pointers.delete(event.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!gesture || pointers.size > 0) return;
    const g = gesture;
    gesture = null;
    if (!g.moved && (g.mode === 'tap' || g.mode === 'draw')) {
      const cell = cellAt(event.clientX, event.clientY);
      if (cell) tap(...cell);
    }
    if (g.mode === 'select') finishSelection();
  };
  viewport.addEventListener('pointerup', endPointer);
  viewport.addEventListener('pointercancel', endPointer);
  viewport.addEventListener('contextmenu', (event) => event.preventDefault());

  // ---------- Rückgängig ----------
  /** Frühere Bauzustände (je Geste einer), in der offenen Welt mit Münzen. */
  let history: { grid: Grid; coins: number }[] = [];
  const copyGrid = (g: Grid): Grid => new Map([...g].map(([k, p]) => [k, { ...p }]));

  /** Zustand vor einer Änderung merken (höchstens 60 Schritte). */
  function remember(): void {
    history.push({ grid: copyGrid(grid), coins: econ.coins });
    if (history.length > 60) history.shift();
    undoBtn.disabled = false;
  }

  const sig = (g: Grid) => JSON.stringify([...g].sort(([a], [b]) => (a < b ? -1 : 1)));

  function undo(): void {
    // Schritte überspringen, die nichts verändert haben (z. B. Antippen eines leeren Feldes)
    const now = sig(grid);
    while (history.length && sig(history[history.length - 1]!.grid) === now && history[history.length - 1]!.coins === econ.coins) history.pop();
    const last = history.pop();
    undoBtn.disabled = history.length === 0;
    if (!last) return say(tx(T.undoNone));
    if (mode === 'level' && running) stopTimer();
    if (mode === 'level' && hasRun) resetRun();
    grid = last.grid;
    if (mode === 'world') econ.coins = last.coins;
    sound.play('remove');
    changed();
    if (mode === 'world') renderTools();
  }

  // ---------- Bauen ----------
  function editable(): boolean {
    if (mode === 'world') return true;
    if (running) {
      say(tx(T.editLocked), 'warn');
      return false;
    }
    if (hasRun) resetRun();
    return true;
  }

  function changed(): void {
    renderCells();
    renderInfo();
    if (mode === 'world') saveWorld(grid, econ);
  }

  /** In der offenen Welt bezahlen (im Level ist alles umsonst); false, wenn das Geld nicht reicht. */
  function pay(price: number): boolean {
    if (mode !== 'world') return true;
    if (price > 0 && econ.coins < price) {
      say(tx(T.tooPoor, { n: ctxNum(price - econ.coins) }), 'warn');
      return false;
    }
    econ.coins -= price;
    return true;
  }

  /** Band-Weg ziehen: das letzte Feld zeigt aufs neue, das neue bekommt dieselbe Richtung. */
  function drawBelt(from: [number, number] | null, to: [number, number]): void {
    if (editing) {
      // Baukasten: beim Ziehen Felsen setzen bzw. abbauen
      if (editTool === 'rock' || editTool === 'erase') {
        const has = editing.w.some(([x, y]) => x === to[0] && y === to[1]);
        if (editTool === 'rock' ? !has : has) editTap(...to);
      }
      return;
    }
    if (!editable()) return;
    if (from) {
      const d = ([0, 1, 2, 3] as Dir[]).find((dd) => from[0] + DX[dd] === to[0] && from[1] + DY[dd] === to[1]);
      if (d === undefined) return;
      const part = grid.get(key(...from));
      if (part) part.dir = d;
      // Auch das Start-Kästchen bekommt ein Band (nicht nur die folgenden)
      else if (canBuild(...from) && pay(BELT.price)) grid.set(key(...from), { op: null, dir: d });
      if (canBuild(...to)) {
        const existing = grid.get(key(...to));
        if (existing) existing.dir = d;
        else if (pay(BELT.price)) {
          grid.set(key(...to), { op: null, dir: d });
          sound.play('place');
        }
      }
    }
    changed();
  }

  function eraseAt(x: number, y: number): void {
    const part = grid.get(key(x, y));
    if (!part || !editable()) return;
    grid.delete(key(x, y));
    if (mode === 'world') econ.coins += priceOf(part);
    sound.play('remove');
    changed();
  }

  /** Teil setzen; steht dort schon dasselbe, wird es gedreht (Weiche: nach vier Drehungen wechselt die Seite). */
  function placeSpec(spec: PartSpec, x: number, y: number): void {
    if (!canBuild(x, y) || !editable()) return;
    const k = key(x, y);
    const part = grid.get(k);
    if (part && partId(part) === spec.id) {
      if (part.sort || part.split || part.alt) {
        const r = (part.dir + (part.side === 3 ? 4 : 0) + 1) % 8;
        part.dir = (r % 4) as Dir;
        part.side = r < 4 ? 1 : 3;
      } else part.dir = ((part.dir + 1) % 4) as Dir;
    } else {
      if (mode === 'world' && !unlockedParts(econ.order).has(spec.id)) return lockedInfo(spec);
      // Level mit Grenze: höchstens so viele eigene Maschinen (umstellen geht immer)
      const max = mode === 'level' ? level.maxMachines : undefined;
      if (spec.kind === 'op' && max !== undefined && !part?.op && machineCount() >= max) {
        say(max === 0 ? tx(T.noMachines) : tx(T.tooMany, { n: max }), 'warn');
        sound.play('error');
        return;
      }
      if (!pay(spec.price - (part && mode === 'world' ? priceOf(part) : 0))) return;
      const dir = part?.dir ?? guessDir(x, y);
      grid.set(k, makePart(spec, dir, part?.side ?? guessSide(x, y, dir)));
      sound.play('place');
      if (spec.kind === 'sort') say(tx(T.sortHelp));
      if (spec.kind === 'split') say(tx(T.splitHelp));
      if (spec.kind === 'alt') say(tx(T.altHelp));
      if (spec.kind === 'merge') say(tx(T.mergeHelp));
      if (spec.kind === 'bridge') say(tx(T.bridgeHelp));
    }
    changed();
  }

  /**
   * Seite für Weiche bzw. Verteiler: dorthin, wo schon ein Band wegführt (oder
   * ein Lager liegt); sonst rechts von der Laufrichtung.
   */
  function guessSide(x: number, y: number, dir: Dir): 1 | 3 {
    const all = allParts();
    const leadsAway = (d: Dir) => {
      const nx = x + DX[d];
      const ny = y + DY[d];
      if (baseAt(nx, ny)) return true;
      const p = all.get(key(nx, ny));
      // ein Band, das nicht in dieses Feld zurückzeigt
      return !!p && !outputs(p).some((o) => nx + DX[o] === x && ny + DY[o] === y);
    };
    const right = leadsAway(((dir + 1) % 4) as Dir);
    const left = leadsAway(((dir + 3) % 4) as Dir);
    return left && !right ? 3 : 1;
  }

  /** Eigene Maschinen im Level (Weichen und Bänder zählen nicht). */
  function machineCount(): number {
    let n = 0;
    for (const p of grid.values()) if (p.op) n += 1;
    return n;
  }

  function lockedInfo(spec: PartSpec): void {
    say(tx(T.locked, { p: tx(specName(spec)), n: unlockedBy(spec.id) + 1 }), 'warn');
  }

  function tap(x: number, y: number): void {
    if (editing) return editTool === 'hand' ? undefined : editTap(x, y);
    if (tool.kind === 'hand' || tool.kind === 'select') return;
    if (tool.kind === 'erase') return eraseAt(x, y);
    if (tool.kind === 'paste') return pasteAt(x, y);
    placeSpec(tool.spec, x, y);
  }

  // ---------- Auswählen, Verschieben, Kopieren ----------
  /** Markierter Bereich (Felder, einschließlich) und Zwischenablage (Teile relativ zur linken oberen Ecke). */
  let sel: { x0: number; y0: number; x1: number; y1: number } | null = null;
  let selStart: [number, number] | null = null;
  let clip: { w: number; h: number; parts: [number, number, Part][] } | null = null;
  /** Beim Verschieben: die herausgenommenen Teile (zurück, wenn man abbricht). */
  let moving: { grid: Grid; coins: number } | null = null;
  const selBox = el('div', 'zf-sel');
  selBox.hidden = true;
  world.append(selBox);
  const selBar = el('div', 'zf-selbar');
  selBar.hidden = true;
  viewport.append(selBar);

  function setSelection(a: [number, number], b: [number, number]): void {
    sel = { x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]) };
    selBox.hidden = false;
    Object.assign(selBox.style, { left: `${sel.x0 * CELL}px`, top: `${sel.y0 * CELL}px`, width: `${(sel.x1 - sel.x0 + 1) * CELL}px`, height: `${(sel.y1 - sel.y0 + 1) * CELL}px` });
    selBox.classList.remove('is-paste');
  }

  /** Eigene Teile im markierten Bereich (vorgegebene bleiben stehen). */
  function selectedParts(): [number, number, Part][] {
    if (!sel) return [];
    const out: [number, number, Part][] = [];
    for (let x = sel.x0; x <= sel.x1; x++) for (let y = sel.y0; y <= sel.y1; y++) {
      const p = grid.get(key(x, y));
      if (p) out.push([x, y, p]);
    }
    return out;
  }

  const barBtn = (name: IconName, label: string, act: () => void, main = false) => {
    const b = ibtn(name, label, `zf-btn${main ? ' zf-btn--main' : ''}`);
    b.addEventListener('click', act);
    return b;
  };

  function finishSelection(): void {
    const parts = selectedParts();
    if (!parts.length) {
      clearSelection();
      say(tx(T.selEmpty));
      return;
    }
    selBar.hidden = false;
    selBar.replaceChildren(
      el('span', 'zf-selbar__text', tx(T.selCount, { n: parts.length })),
      barBtn('copy', tx(T.selCopy), () => takeClip(false), true),
      barBtn('move', tx(T.selMove), () => takeClip(true)),
      barBtn('trash', tx(T.selDelete), deleteSelection),
      barBtn('close', tx(T.selCancel), clearSelection),
    );
  }

  function clearSelection(): void {
    sel = null;
    selStart = null;
    selBox.hidden = true;
    selBar.hidden = true;
  }

  /** In die Zwischenablage (beim Verschieben auch herausnehmen) und zum Einfügen wechseln. */
  function takeClip(cut: boolean): void {
    if (!sel || !editable()) return;
    const parts = selectedParts();
    clip = { w: sel.x1 - sel.x0 + 1, h: sel.y1 - sel.y0 + 1, parts: parts.map(([x, y, p]) => [x - sel!.x0, y - sel!.y0, { ...p }]) };
    remember();
    if (cut) {
      moving = { grid: copyGrid(grid), coins: econ.coins };
      for (const [x, y, p] of parts) {
        grid.delete(key(x, y));
        if (mode === 'world') econ.coins += priceOf(p);
      }
      changed();
    } else moving = null;
    startPaste();
  }

  function startPaste(): void {
    if (!clip) return;
    tool = { kind: 'paste' };
    selBox.hidden = true;
    selBar.hidden = false;
    selBar.replaceChildren(
      el('span', 'zf-selbar__text', tx(moving ? T.pasteMove : T.pasteHint)),
      barBtn('rotate', tx(T.selRotate), rotateClip),
      barBtn('check', tx(T.selDone), endPaste, true),
    );
    renderTools();
  }

  /** Zwischenablage um 90° im Uhrzeigersinn drehen (Lage und Richtung der Teile). */
  function rotateClip(): void {
    if (!clip) return;
    const h = clip.h;
    clip = {
      w: clip.h,
      h: clip.w,
      parts: clip.parts.map(([x, y, p]) => [h - 1 - y, x, { ...p, dir: ((p.dir + 1) % 4) as Dir }]),
    };
    if (pasteAt.last) showPasteGhost(...pasteAt.last);
  }

  function showPasteGhost(x: number, y: number): void {
    if (!clip) return;
    selBox.hidden = false;
    selBox.classList.add('is-paste');
    Object.assign(selBox.style, { left: `${x * CELL}px`, top: `${y * CELL}px`, width: `${clip.w * CELL}px`, height: `${clip.h * CELL}px` });
    pasteAt.last = [x, y];
  }

  /** Einfügen mit der linken oberen Ecke auf (x, y): nur, wenn alle Teile Platz haben (und Münzen bzw. Maschinen reichen). */
  function pasteAt(x: number, y: number): void {
    if (!clip || !editable()) return;
    showPasteGhost(x, y);
    const cells = clip.parts.map(([dx, dy, p]) => [x + dx, y + dy, p] as const);
    if (cells.some(([cx, cy]) => !canBuild(cx, cy) || grid.has(key(cx, cy)))) return say(tx(T.pasteBlocked), 'warn');
    if (mode === 'world') {
      const cost = cells.reduce((a, [, , p]) => a + priceOf(p), 0);
      const lockedPart = cells.find(([, , p]) => !unlockedParts(econ.order).has(partId(p)));
      if (lockedPart) return say(tx(T.pasteLocked), 'warn');
      if (!pay(cost)) return;
    } else if (level.maxMachines !== undefined && machineCount() + cells.filter(([, , p]) => p.op).length > level.maxMachines) {
      return say(tx(T.tooMany, { n: level.maxMachines }), 'warn');
    }
    remember();
    for (const [cx, cy, p] of cells) grid.set(key(cx, cy), { ...p });
    sound.play('place');
    changed();
    // Verschieben: einmal einfügen, dann fertig
    if (moving) {
      moving = null;
      endPaste();
    }
  }
  pasteAt.last = null as [number, number] | null;

  function endPaste(): void {
    // Verschieben abgebrochen: Teile wieder an ihren Platz
    if (moving) {
      grid = moving.grid;
      if (mode === 'world') econ.coins = moving.coins;
      moving = null;
      changed();
    }
    tool = { kind: 'part', spec: BELT };
    clearSelection();
    selBox.classList.remove('is-paste');
    renderTools();
  }

  function deleteSelection(): void {
    if (!editable()) return;
    remember();
    for (const [x, y, p] of selectedParts()) {
      grid.delete(key(x, y));
      if (mode === 'world') econ.coins += priceOf(p);
    }
    sound.play('remove');
    clearSelection();
    changed();
  }

  /** Neue Teile setzen den Weg fort; geht es geradeaus nicht weiter, dann zur Seite Richtung Lager. */
  function guessDir(x: number, y: number): Dir {
    const dirs = [0, 1, 2, 3] as Dir[];
    for (const t of dirs) if (baseAt(x + DX[t], y + DY[t])) return t;
    const all = allParts();
    const tx0 = board.base.x + (board.base.w - 1) / 2;
    const ty0 = board.base.y + (board.base.h - 1) / 2;
    const open = (d: Dir) => canBuild(x + DX[d], y + DY[d]) || baseAt(x + DX[d], y + DY[d]);
    const toward = (d: Dir) => Math.abs(x + DX[d] - tx0) + Math.abs(y + DY[d] - ty0);
    for (const d of dirs) {
      if (!outsAt(all, x - DX[d], y - DY[d]).includes(d)) continue;
      if (open(d)) return d;
      return dirs.filter((t) => t !== (d + 2) % 4 && open(t)).sort((a, c) => toward(a) - toward(c))[0] ?? d;
    }
    return dirs.filter(open).sort((a, c) => toward(a) - toward(c))[0] ?? 0;
  }

  // ---------- Tastatur ----------
  const cursor = { x: 0, y: 0 };

  /** Feld-Auswahl setzen, ins Bild holen und (für Bildschirmleser) ansagen. */
  function placeCursor(x: number, y: number, speak = true): void {
    cursor.x = Math.max(0, Math.min(board.cols - 1, x));
    cursor.y = Math.max(0, Math.min(board.rows - 1, y));
    cursorEl.style.left = `${cursor.x * CELL}px`;
    cursorEl.style.top = `${cursor.y * CELL}px`;
    showCell(cursor.x, cursor.y);
    if (speak) announce.textContent = describe(cursor.x, cursor.y);
  }

  /** Karte so verschieben, dass das Feld sichtbar ist (mit etwas Rand). */
  function showCell(x: number, y: number): void {
    const box = viewport.getBoundingClientRect();
    const size = CELL * view.s;
    const margin = size * 1.2;
    const px = view.x + x * size;
    const py = view.y + y * size;
    if (px < margin) view.x += margin - px;
    else if (px + size > box.width - margin) view.x -= px + size - (box.width - margin);
    if (py < margin) view.y += margin - py;
    else if (py + size > box.height - margin) view.y -= py + size - (box.height - margin);
    applyView();
  }

  /** Was auf einem Feld liegt, als Satz. */
  function describe(x: number, y: number): string {
    const v = { x: x + 1, y: y + 1 };
    const sp = sourceAt(x, y);
    if (sp) return tx(T.cellSource, { ...v, v: sourceLabel(sp) });
    if (mode === 'level') {
      const ti = targetsOf(level).findIndex((t) => t.x === x && t.y === y);
      if (ti >= 0) return tx(T.cellTarget, { ...v, t: tx(acceptText(targetsOf(level)[ti]!.accept, state.got[ti] ?? 0)) });
    } else if (baseAt(x, y)) return tx(T.cellBase, v);
    if (board.walls.has(key(x, y))) return tx(T.cellRock, v);
    const part = allParts().get(key(x, y));
    if (part) {
      const name = part.op ? opLabel(part.op) : part.sort ? `${tx(testLabel(part.sort))}` : part.merge ? `a${part.merge}b` : part.split ? tx(T.splitHelp).split(':')[0]! : part.alt ? tx(T.altHelp).split(':')[0]! : part.bridge ? tx(T.bridgeHelp).split(':')[0]! : tx(T.belt);
      return tx(T.cellPart, { ...v, p: name, d: tx(T.dirNames).split('|')[part.dir]! });
    }
    return tx(canBuild(x, y) ? T.cellEmpty : T.cellBlocked, v);
  }

  /** Erstes sinnvolles Feld für die Tastatur: vor der Quelle. */
  function resetCursor(): void {
    const sp = board.sources.find((q) => mode === 'level' || inRect(zoneRect(openWorld, econ.zone), q.x, q.y)) ?? board.sources[0];
    if (mode === 'world') placeCursor(board.base.x - 1, board.base.y + 1, false);
    else if (sp) placeCursor(sp.x + DX[sp.dir], sp.y + DY[sp.dir], false);
  }

  const KEY_DIR: Record<string, Dir> = { ArrowRight: 0, ArrowDown: 1, ArrowLeft: 2, ArrowUp: 3 };

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && (tool.kind === 'paste' || sel)) {
      event.preventDefault();
      return tool.kind === 'paste' ? endPaste() : clearSelection();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      return undo();
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const d = KEY_DIR[event.key];
    const k = event.key.toLowerCase();
    let handled = true;
    if (d !== undefined) {
      const nx = cursor.x + DX[d];
      const ny = cursor.y + DY[d];
      if (event.shiftKey) {
        // Band ziehen: vom aktuellen Feld ins nächste
        remember();
        if (nx >= 0 && ny >= 0 && nx < board.cols && ny < board.rows) drawBelt([cursor.x, cursor.y], [nx, ny]);
      }
      placeCursor(nx, ny);
    } else if (event.key === 'Enter' || event.key === ' ') {
      if (tool.kind === 'hand') tool = { kind: 'part', spec: BELT };
      remember();
      tap(cursor.x, cursor.y);
      announce.textContent = describe(cursor.x, cursor.y);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      remember();
      eraseAt(cursor.x, cursor.y);
      announce.textContent = describe(cursor.x, cursor.y);
    } else if (k === 'h' || k === 'b' || k === 'a') {
      tool = k === 'h' ? { kind: 'hand' } : k === 'b' ? { kind: 'part', spec: BELT } : { kind: 'erase' };
      renderTools();
      announce.textContent = k === 'h' ? tx(T.hand) : k === 'b' ? tx(T.belt) : tx(T.erase);
    } else if (/^[1-9]$/.test(event.key)) {
      const parts = [...toolsEl.querySelectorAll<HTMLButtonElement>('.zf-tool--op:not(.is-locked)')];
      const b = parts[Number(event.key) - 1];
      if (b) {
        b.click();
        announce.textContent = b.getAttribute('aria-label') ?? '';
      }
    } else if ((event.key === '<' || event.key === '>') && currentKit()?.range) {
      // Zahl des gewählten Bauteils kleiner/größer
      const item = currentKit()!;
      setNum(nums[item.id] + (event.key === '>' ? 1 : -1));
    } else if (k === 'p') runBtn.click();
    else if (event.key === '+' || event.key === '=') zoomAt(1.25, ...center());
    else if (event.key === '-') zoomAt(0.8, ...center());
    else if (k === 'f') fit();
    else handled = false;
    if (handled) event.preventDefault();
  });
  viewport.addEventListener('focus', () => {
    placeCursor(cursor.x, cursor.y);
  });

  /** Ausgänge eines Feldes (Quelle oder Teil). */
  function outsAt(all: Grid, x: number, y: number, depth = 0): Dir[] {
    const sp = sourceAt(x, y);
    if (sp) return [sp.dir];
    const part = all.get(key(x, y));
    if (!part) return [];
    // Brücke: gibt in die Richtungen weiter, aus denen auf der Gegenseite etwas hineinläuft
    if (part.bridge) return depth > 6 ? [] : ([0, 1, 2, 3] as Dir[]).filter((d) => outsAt(all, x - DX[d], y - DY[d], depth + 1).includes(d));
    return outputs(part);
  }

  /** Aus welchen Richtungen kommen Zahlen auf dieses Feld? */
  function insAt(all: Grid, x: number, y: number): Dir[] {
    return ([0, 1, 2, 3] as Dir[]).filter((d) => outsAt(all, x - DX[d], y - DY[d]).includes(d));
  }

  // ---------- Zeichnen ----------
  /**
   * Bänder als schmaler Streifen durch die Feldmitte: von der Kante, aus der
   * die Zahl kommt, zur Kante, in die sie weiterläuft – so entstehen auch
   * Kurven. Die laufenden Streifen (stroke-dashoffset in zahlenfabrik.css)
   * zeigen die Laufrichtung. Jedes Stück ist genau eine Feldbreite lang,
   * damit das Muster nahtlos ins nächste Feld übergeht.
   */
  function renderBelts(all: Grid): void {
    beltLayer.setAttribute('width', String(board.cols * CELL));
    beltLayer.setAttribute('height', String(board.rows * CELL));
    const paths: string[] = [];
    const cx = (x: number) => x * CELL + CELL / 2;
    const cy = (y: number) => y * CELL + CELL / 2;
    const edge = (x: number, y: number, d: Dir) => `${x * CELL + EDGE[d]![0]} ${y * CELL + EDGE[d]![1]}`;
    const over: string[] = [];
    for (const [k, part] of all) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      if (part.bridge) {
        // Brücke: waagerecht unten, senkrecht oben drüber (eigene Ebene)
        paths.push(`M${edge(x, y, 2)}L${edge(x, y, 0)}`);
        over.push(`M${edge(x, y, 3)}L${edge(x, y, 1)}`);
        continue;
      }
      const ins = insAt(all, x, y);
      const outs = outputs(part);
      if (ins.length <= 1 && outs.length === 1) {
        // ein Weg hinein, einer hinaus: ein durchgehender Streifen (auch um die Ecke)
        const from = ((ins[0] ?? part.dir) + 2) % 4;
        paths.push(`M${edge(x, y, from as Dir)}L${cx(x)} ${cy(y)}L${edge(x, y, outs[0]!)}`);
        continue;
      }
      // Weiche oder Zusammenführen: jeder Eingang zur Mitte, von der Mitte zu jedem Ausgang
      for (const d of ins.length ? ins : [part.dir]) paths.push(`M${edge(x, y, ((d + 2) % 4) as Dir)}L${cx(x)} ${cy(y)}`);
      for (const d of outs) paths.push(`M${cx(x)} ${cy(y)}L${edge(x, y, d)}`);
    }
    // Stummel aus den Quellen heraus (nur wenn angeschlossen) und ins Ziel hinein
    for (const { x, y, dir } of board.sources) {
      if (mode === 'world' && !all.has(key(x + DX[dir], y + DY[dir])) && !baseAt(x + DX[dir], y + DY[dir])) continue;
      paths.push(`M${cx(x)} ${cy(y)}L${edge(x, y, dir)}`);
    }
    for (const r of [board.base, ...board.extra]) for (let bx0 = r.x; bx0 < r.x + r.w; bx0++) {
      for (let by0 = r.y; by0 < r.y + r.h; by0++) {
        for (const into of insAt(all, bx0, by0)) {
          const [ax, ay] = EDGE[(into + 2) % 4]!;
          const [ex, ey] = EDGE[into]!;
          paths.push(`M${bx0 * CELL + ax} ${by0 * CELL + ay}L${bx0 * CELL + (ax + ex) / 2 + (ex - ax) * 0.1} ${by0 * CELL + (ay + ey) / 2 + (ey - ay) * 0.1}`);
        }
      }
    }
    const d = paths.join('');
    const mk = (cls: string) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('class', cls);
      p.setAttribute('d', d);
      return p;
    };
    const mkOver = (cls: string) => {
      const p = document.createElementNS(SVG_NS, 'path');
      p.setAttribute('class', `${cls} zf-belt--over`);
      p.setAttribute('d', over.join(''));
      return p;
    };
    beltLayer.replaceChildren(mk('zf-belt__edge'), mk('zf-belt__base'), mk('zf-belt__run'), ...(over.length ? [mkOver('zf-belt__shadow'), mkOver('zf-belt__edge'), mkOver('zf-belt__base'), mkOver('zf-belt__run')] : []));
    beltLayer.classList.toggle('is-running', running);
  }

  /** Schloss an vorgegebenen Teilen (lassen sich nicht abbauen). */
  function addLock(c: HTMLElement): void {
    c.classList.add('zf-cell--fixed');
    const lock = el('span', 'zf-cell__lock');
    lock.append(icon('lock', 12));
    c.append(lock);
  }

  function renderCells(): void {
    world.style.width = `${board.cols * CELL}px`;
    world.style.height = `${board.rows * CELL}px`;
    const all = allParts();
    renderBelts(all);
    const frag = document.createDocumentFragment();
    const at = (x: number, y: number, cls: string) => {
      const c = el('div', `zf-cell ${cls}`);
      c.dataset.cell = key(x, y);
      c.style.left = `${x * CELL}px`;
      c.style.top = `${y * CELL}px`;
      frag.append(c);
      return c;
    };
    const open = mode === 'world' ? zoneRect(openWorld, econ.zone) : null;
    for (const sp of board.sources) {
      const c = at(sp.x, sp.y, 'zf-cell--source');
      const label = el('span', 'zf-cell__big zf-source-value', sourceLabel(sp));
      label.dataset.src = String(board.sources.indexOf(sp));
      c.append(art('source', 52, sp.dir), label);
      c.title = tx(T.source);
      if (open && !inRect(open, sp.x, sp.y)) {
        c.classList.add('is-locked');
        c.title = tx(T.sourceLocked);
      }
    }
    if (mode === 'level') {
      targetsOf(level).forEach((t, i) => {
        const c = at(t.x, t.y, `zf-cell--target${t.accept.kind === 'test' ? ' zf-cell--rule' : ''}`);
        c.dataset.target = String(i);
        c.append(art('target', 52), el('span', 'zf-cell__big zf-target-label', targetLabel(t, state.got[i] ?? 0)), el('span', 'zf-cell__small zf-target-count', `${state.got[i] ?? 0}/${t.need}`));
        c.title = `${tx(T.target)}: ${tx(acceptText(t.accept, state.got[i] ?? 0))}`;
      });
    } else {
      const c = at(board.base.x, board.base.y, 'zf-cell--base');
      c.style.width = `${board.base.w * CELL - 12}px`;
      c.style.height = `${board.base.h * CELL - 12}px`;
      c.append(art('base', board.base.w * CELL - 12), el('span', 'zf-cell__big zf-base-score', baseLine()), el('span', 'zf-cell__small', tx(T.base)));
      c.title = tx(T.base);
      // Abnehmer am Kartenrand
      (openWorld.buyers ?? []).forEach((b, i) => {
        const on = econ.order >= BUYERS_FROM && !!open && inRect(open, b.x, b.y);
        const cell = at(b.x, b.y, `zf-cell--base zf-cell--buyer${on ? '' : ' is-locked'}`);
        cell.style.width = `${b.w * CELL - 12}px`;
        cell.style.height = `${b.h * CELL - 12}px`;
        const pic = IMAGES[`abnehmer-${(i % 3) + 1}`];
        if (pic) {
          const img = el('img', 'zf-art zf-art--img zf-buyer__img');
          img.src = pic;
          img.alt = '';
          cell.append(img);
        } else cell.append(art('target', b.w * CELL - 12));
        cell.append(el('span', 'zf-cell__mid zf-buyer__rule', buyerRule(b)), el('span', 'zf-cell__small zf-buyer__pay', on ? `+${ctxNum(b.pay)}` : tx(T.lockedShort, { n: BUYERS_FROM + 1 })));
        cell.title = `${tx(T.buyer)}: ${buyerRule(b)} · ${tx(T.price, { n: ctxNum(b.pay) })}${on ? '' : ` · ${tx(T.lockedShort, { n: BUYERS_FROM + 1 })}`}`;
      });
    }
    for (const k of board.walls) {
      const [x, y] = k.split(',').map(Number) as [number, number];
      at(x, y, 'zf-cell--rock').append(art('rock', CELL, undefined, (x * 7 + y * 13 + ((x * y) % 5)) % 11));
    }
    for (const [k, part] of all) {
      if (!part.op && !part.sort && !part.merge && !part.bridge && !part.split && !part.alt) continue;
      const [x, y] = k.split(',').map(Number) as [number, number];
      const fixed = board.fixed.has(k);
      if (part.sort) {
        const c = at(x, y, 'zf-cell--op zf-cell--sort');
        const [yes, no] = outputs(part) as [Dir, Dir];
        c.append(art('sort', 52, part.dir, 0, part.side === 3, switchFile(part.sort.kind)), el('span', 'zf-cell__mid', tx(testLabel(part.sort))), el('span', 'zf-cell__small', `✓${ARROW[yes]} ✗${ARROW[no]}`));
        c.title = tx(T.sortHelp);
        if (fixed) addLock(c);
        continue;
      }
      if (part.split || part.alt) {
        const c = at(x, y, `zf-cell--op ${part.alt ? 'zf-cell--alt' : 'zf-cell--split'}`);
        const [a, b] = outputs(part) as [Dir, Dir];
        c.append(art('sort', 52, part.dir, 0, part.side === 3, part.alt ? 'wechselweiche' : undefined), el('span', 'zf-cell__mid', tx(part.alt ? T.altShort : T.splitShort)), el('span', 'zf-cell__small', part.alt ? `1${ARROW[a]} 2${ARROW[b]}` : `${ARROW[a]} ${ARROW[b]}`));
        c.title = tx(part.alt ? T.altHelp : T.splitHelp);
        if (fixed) addLock(c);
        continue;
      }
      if (part.bridge) {
        const c = at(x, y, 'zf-cell--bridge');
        c.title = tx(T.bridgeHelp);
        c.append(art('bridge', 56));
        continue;
      }
      if (part.merge) {
        const c = at(x, y, 'zf-cell--op zf-cell--merge');
        c.append(art('merge', 52, part.dir, 0, false, mergeFile(part.merge)), el('span', 'zf-cell__mid', `a${part.merge}b`));
        c.title = tx(T.mergeHelp);
        continue;
      }
      const c = at(x, y, 'zf-cell--op');
      if (fixed) c.classList.add('zf-cell--fixed');
      c.append(art('machine', 52, part.dir, 0, false, machineFile(part.op!.sym)), el('span', 'zf-cell__big', opLabel(part.op!)));
      if (fixed) addLock(c);
    }
    if (mode === 'level' && state.error) at(state.error.x, state.error.y, 'zf-cell--error');
    // Noch nicht freigekauftes Land: Nebel außerhalb des offenen Gebiets
    if (open && (open.w < board.cols || open.h < board.rows)) {
      // Nebel-Bild über dem gesperrten Land (vier Streifen um das offene Gebiet)
      if (IMAGES.nebel) {
        const W = board.cols * CELL;
        const H = board.rows * CELL;
        const rects = [
          [0, 0, W, open.y * CELL],
          [0, (open.y + open.h) * CELL, W, H - (open.y + open.h) * CELL],
          [0, open.y * CELL, open.x * CELL, open.h * CELL],
          [(open.x + open.w) * CELL, open.y * CELL, W - (open.x + open.w) * CELL, open.h * CELL],
        ];
        for (const [l, t, w, h] of rects) {
          if (w! <= 0 || h! <= 0) continue;
          const f = el('div', 'zf-fog-tex');
          Object.assign(f.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px`, backgroundImage: `url("${IMAGES.nebel}")` });
          frag.append(f);
        }
      }
      const fog = el('div', 'zf-fog');
      Object.assign(fog.style, { left: `${open.x * CELL}px`, top: `${open.y * CELL}px`, width: `${open.w * CELL}px`, height: `${open.h * CELL}px` });
      const price = ZONE_PRICES[econ.zone + 1];
      if (price !== undefined) fog.append(el('span', 'zf-fog__label', tx(T.fogLabel, { n: ctxNum(price) })));
      frag.append(fog);
    }
    cellsLayer.replaceChildren(frag);
    renderExpand();
  }

  function ctxNum(n: number): string {
    return fmtNum(n, lang);
  }

  /** Aufschrift der Quelle: im Level die nächste Zahl (bzw. „?“ ohne gewählte Startzahl). */
  function sourceLabel(sp: { value: number; values?: number[] }): string {
    if (mode !== 'level') return ctxNum(sp.value);
    const i = Math.min(state.emitted, emitCount(level) - 1);
    if (sp !== level.source) {
      if ((sp as { pick?: true }).pick) return picks[level.id] === undefined ? '?' : ctxNum(picks[level.id]!);
      return ctxNum(sp.values?.length ? sp.values[i % sp.values.length]! : sp.value);
    }
    if (level.source.pick) return picks[level.id] === undefined ? '?' : ctxNum(picks[level.id]!);
    return ctxNum(sourceValue(level, i, picks[level.id]));
  }

  /** Aufschrift eines Lagers: Zahl, Regel (✓/✗ mit Frage) oder nächster Wert der Tabelle. */
  function targetLabel(t: Target, got: number): string {
    const a = t.accept;
    if (a.kind === 'value') return ctxNum(a.n);
    if (a.kind === 'seq') return ctxNum(a.values[Math.min(got, a.values.length - 1)]!);
    return `${a.not ? '✗' : '✓'} ${tx(testLabel(a.test))}`;
  }

  /** Was ein Abnehmer kauft, kurz (passt auf die Kachel). */
  function buyerRule(b: Buyer): string {
    const r = b.rule;
    switch (r.kind) {
      case 'exact':
        return ctxNum(r.n!);
      case 'prime':
        return tx(L('Prim', 'prime'));
      case 'square':
        return 'n²';
      case 'multiple':
        return `${ctxNum(r.n!)}·n`;
      case 'greater':
        return `>${ctxNum(r.n!)}`;
    }
  }

  /** Aufschrift der Basis: Stand beim aktuellen Auftrag. */
  function baseLine(): string {
    return `${ctxNum(econ.progress)}/${ctxNum(orderAt(econ.order).count)}`;
  }

  /** Kurz aufleuchten lassen: Maschine rechnet, Quelle gibt aus, Lager empfängt. */
  function pulse(x: number, y: number, cls: string): void {
    if (reduced) return;
    const c = cellsLayer.querySelector<HTMLElement>(`[data-cell="${x},${y}"]`);
    if (!c) return;
    c.classList.remove(cls);
    void c.offsetWidth;
    c.classList.add(cls);
  }

  /** Lager, die seit dem letzten Bild etwas bekommen haben, hüpfen kurz. */
  let lastGot: number[] = [];
  function pulseTargets(): void {
    if (mode !== 'level') return;
    targetsOf(level).forEach((t, i) => {
      if ((state.got[i] ?? 0) > (lastGot[i] ?? 0)) {
        pulse(t.x, t.y, 'is-receiving');
        sound.play('deliver');
      }
    });
    lastGot = [...state.got];
  }

  /** Kurzer Effekt an einem Feld (nur ohne reduzierte Bewegung). */
  function effect(x: number, y: number, text: string, cls: string, ms = 700): void {
    if (reduced) return;
    const e = el('span', cls, text);
    e.style.left = `${x * CELL + CELL / 2}px`;
    e.style.top = `${y * CELL + CELL / 2}px`;
    itemsLayer.append(e);
    setTimeout(() => e.remove(), ms);
  }

  /** Effekt mit eigenem Bild (Staubwolke, Funke), ohne Bild das Zeichen. */
  function effectImg(x: number, y: number, name: string, fallback: string): void {
    if (reduced) return;
    if (!IMAGES[name]) return effect(x, y, fallback, 'zf-poof', 600);
    const e = el('img', 'zf-poof zf-poof--img');
    e.src = IMAGES[name]!;
    e.alt = '';
    e.style.left = `${x * CELL + CELL / 2}px`;
    e.style.top = `${y * CELL + CELL / 2}px`;
    itemsLayer.append(e);
    setTimeout(() => e.remove(), 600);
  }

  function renderItems(): void {
    const old = new Map([...itemsLayer.querySelectorAll<HTMLElement>('.zf-item')].map((e) => [e.dataset.id!, e]));
    for (const item of items()) {
      let e = old.get(String(item.id));
      if (!e) {
        e = el('span', 'zf-item', ctxNum(item.value));
        e.dataset.id = String(item.id);
        e.style.left = `${item.x * CELL + CELL / 2}px`;
        e.style.top = `${item.y * CELL + CELL / 2}px`;
        itemsLayer.append(e);
      }
      old.delete(String(item.id));
      const label = ctxNum(item.value);
      if (e.textContent !== label) {
        e.textContent = label;
        e.classList.remove('zf-item--pop');
        void e.offsetWidth;
        e.classList.add('zf-item--pop');
        pulse(item.x, item.y, 'is-working');
      } else if (!e.dataset.seen) pulse(item.x, item.y, 'is-emitting');
      e.dataset.seen = '1';
      e.classList.toggle('zf-item--wait', !!item.wait);
      // Auf der Brücke liegen zwei Zahlen übereinander: leicht versetzt zeigen
      const onBridge = mode === 'world' && !!grid.get(key(item.x, item.y))?.bridge;
      e.classList.toggle('zf-item--over', onBridge && item.heading !== undefined && item.heading % 2 === 1);
      e.classList.toggle('zf-item--under', onBridge && item.heading !== undefined && item.heading % 2 === 0);
      e.classList.toggle('zf-item--long', label.length > 4);
      e.style.left = `${item.x * CELL + CELL / 2}px`;
      e.style.top = `${item.y * CELL + CELL / 2}px`;
    }
    for (const e of old.values()) e.remove();
    if (mode === 'level') {
      targetsOf(level).forEach((t, i) => {
        const c = cellsLayer.querySelector(`[data-target="${i}"]`);
        if (!c) return;
        c.querySelector('.zf-target-count')!.textContent = `${state.got[i] ?? 0}/${t.need}`;
        // volles Lager: eigenes Bild, falls vorhanden
        const full = (state.got[i] ?? 0) >= t.need;
        c.classList.toggle('is-full', full);
        const img = c.querySelector<HTMLImageElement>('img.zf-art');
        if (img && IMAGES['kiste-voll'] && IMAGES.lager) img.src = full ? IMAGES['kiste-voll'] : IMAGES.lager;
        c.querySelector('.zf-target-label')!.textContent = targetLabel(t, state.got[i] ?? 0);
      });
      for (const sv of cellsLayer.querySelectorAll<HTMLElement>('.zf-source-value')) sv.textContent = sourceLabel(board.sources[Number(sv.dataset.src)] ?? level.source);
      renderTable();
      pulseTargets();
    }
    const score = cellsLayer.querySelector('.zf-base-score');
    if (score) score.textContent = baseLine();
    if (mode !== 'world') return;
    // Verlorene Zahlen: Wölkchen; Zusammenführen: Funke; Münzen an der Basis
    for (const [x, y] of wstate.lostAt.slice(0, 12)) effectImg(x, y, 'puff', '💨');
    for (const [x, y] of wstate.mergedAt.slice(0, 12)) effectImg(x, y, 'funke', '✨');
    const coins = wstate.delivered.length;
    if (wstate.delivered.length) {
      pulse(board.base.x, board.base.y, 'is-receiving');
      sound.play('deliver');
    }
    if (coins > 0) effect(board.base.x + 1, board.base.y, `+${ctxNum(coins)}`, 'zf-coin-float', 900);
  }

  // ---------- Inventar ----------
  /** Merkmal, ob sich Preise/Freischaltungen geändert haben (dann Inventar neu zeichnen). */
  let toolsKey = '';
  function renderTools(): void {
    if (editing) return renderEditTools();
    const world = mode === 'world';
    const open = world ? unlockedParts(econ.order) : null;
    // Gesperrte Teile nur zeigen, wenn der aktuelle Auftrag sie freischaltet (als Vorschau)
    const soon = new Set(world ? orderAt(econ.order).unlock : []);
    const shown: Tool[] = world
      ? board.tools.filter((spec) => !open || open.has(spec.id) || soon.has(spec.id)).map((spec): Tool => ({ kind: 'part', spec }))
      : kit.map((item): Tool => ({ kind: 'part', spec: specFor(item, nums[item.id]), kit: item.id }));
    const fresh = new Set(world ? [] : newIn(chapterOf(level)).map((k) => k.id));
    // Level: erst die Grundwerkzeuge, dann die Bauteile nach Gruppen (Maschinen, Weichen, Verteilen & Kreuzen)
    const list: Tool[] = world ? [{ kind: 'hand' }, { kind: 'part', spec: BELT }, ...shown, { kind: 'erase' }, { kind: 'select' }] : [{ kind: 'hand' }, { kind: 'part', spec: BELT }, { kind: 'erase' }, { kind: 'select' }, ...shown];
    toolsKey = toolsSignature();
    toolsEl.classList.toggle('zf-tools--world', world);
    toolsEl.classList.toggle('zf-tools--many', list.length > 7);
    const groupOf = (t: Tool): string => {
      if (world || t.kind !== 'part' || !t.kit) return 'base';
      const k = kitItem(t.kit).kind;
      return k === 'op' ? 'op' : k === 'sort' ? 'sort' : 'flow';
    };
    const heads: Record<string, Localized> = { op: T.groupMachines, sort: T.groupSwitches, flow: T.groupFlow };
    let lastGroup = 'base';
    toolsEl.replaceChildren(
      ...list.flatMap((t): HTMLElement[] => {
        const g = groupOf(t);
        if (g === lastGroup) return [render(t)];
        lastGroup = g;
        return [el('p', 'zf-tools__group', tx(heads[g]!)), render(t)];
      }),
    );
    if (!world && level.maxMachines === 0) toolsEl.append(el('p', 'zf-tools__note', tx(kit.length ? T.noMachinesNote : T.onlyBelts)));
    renderNum();

    function render(t: Tool): HTMLElement {
      {
        const spec = t.kind === 'part' ? t.spec : null;
        const locked = !!(spec && open && !open.has(spec.id));
        const b = el('button', `zf-tool${spec && spec.kind !== 'belt' ? ` zf-tool--op zf-tool--${spec.kind}` : ''}`);
        b.type = 'button';
        // Bild: Symbol (Hand, Band, Abbauen) oder Vorschau des Teils (eigenes Bild bzw. gezeichnet)
        const pic = el('span', 'zf-tool__pic');
        if (t.kind === 'hand') pic.append(icon('hand', 22));
        else if (t.kind === 'erase') pic.append(icon('erase', 22));
        else if (t.kind === 'select' || t.kind === 'paste') {
          if (IMAGES.auswahl) {
            const img = el('img');
            img.src = IMAGES.auswahl;
            img.alt = '';
            img.draggable = false;
            pic.append(img);
          } else pic.append(icon('select', 22));
        }
        else if (spec!.kind === 'belt') pic.append(icon('belt', 22));
        else {
          const kind: ArtKind = spec!.kind === 'op' ? 'machine' : spec!.kind === 'sort' || spec!.kind === 'split' || spec!.kind === 'alt' ? 'sort' : spec!.kind === 'merge' ? 'merge' : 'bridge';
          const specific = spec!.kind === 'op' ? machineFile(spec!.op.sym) : spec!.kind === 'sort' ? switchFile(spec!.test.kind) : spec!.kind === 'merge' ? mergeFile(spec!.mode) : spec!.kind === 'alt' ? 'wechselweiche' : undefined;
          const src = imageFor(kind, 0, specific);
          if (src) {
            const img = el('img');
            img.src = src;
            img.alt = '';
            img.draggable = false;
            pic.append(img);
          } else pic.classList.add('is-plain');
        }
        const label = t.kind === 'hand' ? tx(T.hand) : t.kind === 'erase' ? tx(T.erase) : t.kind === 'select' || t.kind === 'paste' ? tx(T.select) : spec!.kind === 'belt' ? tx(T.belt) : tx(specLabel(spec!));
        b.append(pic, el('span', `zf-tool__label${spec && spec.kind !== 'belt' && spec.kind !== 'bridge' ? ' zf-tool__label--math' : ''}`, label));
        if (world && spec) {
          const price = el('span', `zf-tool__price${!locked && econ.coins < spec.price ? ' is-poor' : ''}`);
          if (locked) price.append(icon('lock', 12), el('span', '', tx(T.lockedShort, { n: unlockedBy(spec.id) + 1 })));
          else price.append(coinIcon(), el('span', '', ctxNum(spec.price)));
          b.append(price);
        }
        if (locked) b.classList.add('is-locked');
        const kitId = t.kind === 'part' ? t.kit : undefined;
        if (kitId && fresh.has(kitId)) {
          b.classList.add('is-new');
          b.append(el('span', 'zf-tool__new', tx(T.newBadge)));
        }
        const same = t.kind === tool.kind && (t.kind !== 'part' || (tool.kind === 'part' && (kitId ? tool.kit === kitId : !tool.kit && t.spec.id === tool.spec.id)));
        b.setAttribute('aria-pressed', String(same));
        const item = kitId ? kitItem(kitId) : undefined;
        const name = item ? (item.range ? tx(T.numTile, { p: tx(item.name), n: ctxNum(item.pow10 ? 10 ** nums[item.id] : nums[item.id]) }) : tx(item.name)) : spec ? tx(specName(spec)) : label;
        b.setAttribute('aria-label', world && spec ? `${name}, ${locked ? tx(T.lockedShort, { n: unlockedBy(spec.id) + 1 }) : tx(T.price, { n: ctxNum(spec.price) })}` : name);
        b.title = b.getAttribute('aria-label')!;
        if (spec && !locked) bindDrag(b, spec);
        b.addEventListener('click', () => {
          if (spec && locked) return lockedInfo(spec);
          if (tool.kind === 'paste') endPaste();
          clearSelection();
          tool = t;
          if (t.kind === 'select') say(tx(T.selHelp));
          if (spec?.kind === 'sort') say(tx(T.sortHelp));
          else if (spec?.kind === 'merge') say(tx(T.mergeHelp));
          else if (spec?.kind === 'split') say(tx(T.splitHelp));
          else if (spec?.kind === 'alt') say(tx(T.altHelp));
          else if (spec?.kind === 'bridge') say(tx(T.bridgeHelp));
          renderTools();
        });
        return b;
      }
    }
  }

  // ---------- Zahl einstellen (Maschinen und Weichen im Level) ----------
  const numBox = el('div', 'zf-num');
  const numLabel = el('label', 'zf-num__label');
  const numInput = el('input', 'zf-num__input');
  numInput.type = 'number';
  numInput.inputMode = 'numeric';
  numInput.id = 'zf-num';
  numLabel.htmlFor = 'zf-num';
  const numLess = el('button', 'zf-btn zf-num__btn');
  const numMore = el('button', 'zf-btn zf-num__btn');
  numLess.type = 'button';
  numMore.type = 'button';
  numLess.append(icon('minus'));
  numMore.append(icon('plus'));
  numLess.setAttribute('aria-label', tx(T.numLess));
  numMore.setAttribute('aria-label', tx(T.numMore));
  numBox.append(numLabel, numLess, numInput, numMore);
  toolsEl.after(numBox);

  /** Gewähltes, einstellbares Bauteil (oder undefined). */
  const currentKit = (): KitItem | undefined => (mode === 'level' && tool.kind === 'part' && tool.kit ? kitItem(tool.kit) : undefined);

  function renderNum(): void {
    const item = currentKit();
    numBox.hidden = !item?.range;
    if (!item?.range) return;
    numLabel.textContent = tx(T.numFor, { p: tx(item.name) });
    numInput.min = String(item.range[0]);
    numInput.max = String(item.range[1]);
    // Runden: Zehnerpotenz zeigen (nur mit − und + einstellbar)
    numInput.readOnly = !!item.pow10;
    numInput.value = item.pow10 ? ctxNum(10 ** nums[item.id]) : String(nums[item.id]);
    numLess.disabled = nums[item.id] <= item.range[0];
    numMore.disabled = nums[item.id] >= item.range[1];
  }

  function setNum(v: number): void {
    const item = currentKit();
    if (!item?.range) return;
    nums[item.id] = clampNum(item, v);
    tool = { kind: 'part', spec: specFor(item, nums[item.id]), kit: item.id };
    renderTools();
    announce.textContent = tx(T.numTile, { p: tx(item.name), n: ctxNum(item.pow10 ? 10 ** nums[item.id] : nums[item.id]) });
  }
  numLess.addEventListener('click', () => setNum(nums[currentKit()?.id ?? 'plus'] - 1));
  numMore.addEventListener('click', () => setNum(nums[currentKit()?.id ?? 'plus'] + 1));
  numInput.addEventListener('change', () => setNum(Number(numInput.value)));

  /** Was das Aussehen des Inventars bestimmt: freigeschaltet und bezahlbar. */
  function toolsSignature(): string {
    if (mode !== 'world') return 'level';
    return `${econ.order}|${WORLD_PARTS.filter((p) => econ.coins >= p.price).length}`;
  }

  /** Teil aus dem Inventar auf die Karte ziehen. */
  function bindDrag(button: HTMLElement, spec: PartSpec): void {
    let ghost: HTMLElement | null = null;
    let sx = 0;
    let sy = 0;
    button.addEventListener('pointerdown', (event) => {
      sx = event.clientX;
      sy = event.clientY;
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove', (event) => {
      if (!button.hasPointerCapture(event.pointerId)) return;
      if (!ghost && Math.hypot(event.clientX - sx, event.clientY - sy) < 8) return;
      if (!ghost) {
        ghost = el('div', `zf-ghost${spec.kind !== 'belt' ? ` zf-ghost--op zf-ghost--${spec.kind}` : ''}`, spec.kind === 'belt' ? '→' : tx(specLabel(spec)));
        document.body.append(ghost);
      }
      ghost.style.left = `${event.clientX}px`;
      ghost.style.top = `${event.clientY}px`;
    });
    const end = (event: PointerEvent) => {
      if (!ghost) return;
      ghost.remove();
      ghost = null;
      const cell = cellAt(event.clientX, event.clientY);
      const box = viewport.getBoundingClientRect();
      const inside = event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
      if (cell && inside) {
        remember();
        placeSpec(spec, ...cell);
      }
      // Klick nach dem Ziehen nicht als Werkzeugwahl werten
      button.addEventListener('click', (e) => e.stopImmediatePropagation(), { once: true, capture: true });
    };
    button.addEventListener('pointerup', end);
    button.addEventListener('pointercancel', end);
  }

  // ---------- Ablauf ----------
  const btn = (label: string, cls = 'zf-btn') => {
    const b = el('button', cls, label);
    b.type = 'button';
    return b;
  };
  /** Knopf mit Symbol und Beschriftung. */
  const ibtn = (name: IconName, label: string, cls = 'zf-btn') => {
    const b = btn('', cls);
    setButton(b, name, label);
    return b;
  };
  const runBtn = ibtn('play', tx(T.start), 'zf-btn zf-btn--main');
  const stepBtn = ibtn('step', tx(T.stepBtn));
  const fastBtn = ibtn('fast', tx(T.fast));
  const stopBtn = ibtn('stop', tx(T.stop));
  const clearBtn = ibtn('trash', tx(T.clear));
  fastBtn.setAttribute('aria-pressed', 'false');
  const expandBtn = btn('', 'zf-btn zf-btn--expand');
  // Startzahl wählen (Welt 2): − [Zahl] +
  const pickBox = el('div', 'zf-pick');
  const pickLess = btn('−', 'zf-btn zf-pick__btn');
  const pickMore = btn('+', 'zf-btn zf-pick__btn');
  const pickInput = el('input', 'zf-pick__input');
  pickInput.type = 'number';
  pickInput.inputMode = 'numeric';
  const pickLabel = el('label', 'zf-pick__label', tx(T.pick));
  pickInput.id = 'zf-pick';
  pickLabel.htmlFor = 'zf-pick';
  pickLess.setAttribute('aria-label', tx(T.pickLess));
  pickMore.setAttribute('aria-label', tx(T.pickMore));
  pickBox.append(pickLabel, pickLess, pickInput, pickMore);
  const undoBtn = ibtn('undo', tx(T.undo));
  undoBtn.disabled = true;
  undoBtn.addEventListener('click', undo);
  const helpBtn = ibtn('help', tx(T.help));
  const soundBtn = btn('');
  controls.append(pickBox, runBtn, fastBtn, stepBtn, stopBtn, undoBtn, clearBtn, expandBtn);
  // Kopfleiste: Level wählen, Hilfe, Töne
  const levelBtn = ibtn('grid', tx(T.chooseLevel), 'zf-btn zf-btn--bar');
  levelBtn.setAttribute('aria-haspopup', 'dialog');
  helpBtn.className = 'zf-btn zf-btn--bar';
  soundBtn.className = 'zf-btn zf-btn--bar';
  barActions.append(levelBtn, helpBtn, soundBtn);
  // am Handy zeigt die Kopfleiste nur Symbole: Beschriftung für Vorleseprogramme behalten
  levelBtn.setAttribute('aria-label', tx(T.chooseLevelLabel));
  helpBtn.setAttribute('aria-label', tx(T.help));

  // ---------- Level-Auswahl (eigenes Fenster) ----------
  let pickerReturn: HTMLElement | null = null;
  function openPicker(): void {
    renderLevels();
    pickerReturn = document.activeElement as HTMLElement | null;
    picker.hidden = false;
    picker.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus();
  }
  function closePicker(): void {
    if (picker.hidden) return;
    picker.hidden = true;
    pickerReturn?.focus?.();
  }
  levelBtn.addEventListener('click', openPicker);
  picker.querySelector('[data-picker-close]')!.addEventListener('click', closePicker);
  picker.addEventListener('click', (event) => {
    if (event.target === picker) closePicker();
  });
  picker.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePicker();
  });
  const sound = createSound();
  const renderSound = () => {
    setButton(soundBtn, sound.on ? 'sound' : 'mute', tx(sound.on ? T.soundOn : T.soundOff));
    soundBtn.setAttribute('aria-label', tx(sound.on ? T.soundOn : T.soundOff));
    soundBtn.setAttribute('aria-pressed', String(sound.on));
  };
  renderSound();
  soundBtn.addEventListener('click', () => {
    sound.set(!sound.on);
    renderSound();
    sound.play('place');
  });
  helpBtn.addEventListener('click', () => showLessons(root, lang, mode === 'level' ? (['belt', ...chapterOf(level).teaches.filter((t) => t !== 'belt')] as LessonId[]) : ['belt']));

  function setPick(v: number): void {
    const range = level.source.pick;
    if (!range || !Number.isFinite(v)) return;
    const value = Math.min(range.max, Math.max(range.min, Math.round(v)));
    picks[level.id] = value;
    pickInput.value = String(value);
    if (running) stopTimer();
    resetRun();
  }

  function renderPick(): void {
    const range = mode === 'level' ? level.source.pick : undefined;
    pickBox.hidden = !range;
    if (!range) return;
    pickInput.min = String(range.min);
    pickInput.max = String(range.max);
    pickInput.value = picks[level.id] === undefined ? '' : String(picks[level.id]);
    pickInput.placeholder = '?';
  }

  pickLess.addEventListener('click', () => setPick((picks[level.id] ?? (level.source.pick?.min ?? 1) + 1) - 1));
  pickMore.addEventListener('click', () => setPick((picks[level.id] ?? (level.source.pick?.min ?? 1) - 1) + 1));
  pickInput.addEventListener('change', () => setPick(Number(pickInput.value)));

  // Wertetabelle (Welten 5 und 6): unter der Karte
  const tableBox = el('div', 'zf-table');
  q<HTMLElement>('.zf-goal').append(tableBox);

  /** Wertetabelle: x-Werte der Quelle, was das Lager will, was schon angekommen ist. */
  function renderTable(): void {
    const t = mode === 'level' ? targetsOf(level).find((tt) => tt.accept.kind === 'seq') : undefined;
    tableBox.hidden = !t || !level.source.values;
    if (!t || t.accept.kind !== 'seq' || !level.source.values) return;
    const xs = level.source.values;
    const want = t.accept.values;
    const got = state.got[targetsOf(level).indexOf(t)] ?? 0;
    const row = (head: string, cells: string[], cls = '') => {
      const tr = el('tr', cls);
      tr.append(el('th', '', head), ...cells.map((c, i) => {
        const td = el('td', i < got && cls === 'zf-table__got' ? 'is-done' : '', c);
        return td;
      }));
      return tr;
    };
    const table = el('table');
    table.append(
      row(tx(T.tableX), xs.map(ctxNum)),
      row(tx(T.tableWant), want.map(ctxNum)),
      row(tx(T.tableGot), want.map((v, i) => (i < got ? `✓ ${ctxNum(v)}` : '·')), 'zf-table__got'),
    );
    tableBox.replaceChildren(table);
  }

  /** Knopf „Neues Gebiet“: nur in der offenen Welt, solange es noch Land gibt. */
  function renderExpand(): void {
    const next = econ.zone + 1;
    expandBtn.hidden = mode !== 'world' || next >= ZONE_PRICES.length;
    if (expandBtn.hidden) return;
    const price = ZONE_PRICES[next]!;
    setButton(expandBtn, 'map', tx(T.expand, { n: ctxNum(price) }));
    expandBtn.append(coinIcon());
    expandBtn.classList.toggle('is-poor', econ.coins < price);
  }

  expandBtn.addEventListener('click', () => {
    const next = econ.zone + 1;
    const price = ZONE_PRICES[next];
    if (price === undefined || !pay(price)) return;
    econ.zone = next;
    sound.play('buy');
    say(tx(T.expandDone), 'good');
    saveWorld(grid, econ);
    renderCells();
    renderInfo();
    renderTools();
  });

  /** Sterne als Bilder (ohne Bilder: ★/☆). */
  function starRow(n: number, size: number): HTMLElement {
    const box = el('span', 'zf-stars');
    box.setAttribute('aria-hidden', 'true');
    if (!IMAGES['stern-voll'] || !IMAGES['stern-leer']) {
      box.textContent = `${'★'.repeat(n)}${'☆'.repeat(3 - n)}`;
      return box;
    }
    for (let k = 0; k < 3; k++) {
      const img = el('img');
      img.src = k < n ? IMAGES['stern-voll']! : IMAGES['stern-leer']!;
      img.alt = '';
      img.width = size;
      img.height = size;
      box.append(img);
    }
    return box;
  }

  /** Konfetti über dem Spielfeld (nur ohne reduzierte Bewegung). */
  function celebrateWin(): void {
    if (reduced || !IMAGES.konfetti) return;
    const c = el('img', 'zf-confetti');
    c.src = IMAGES.konfetti;
    c.alt = '';
    viewport.append(c);
    setTimeout(() => c.remove(), 1600);
  }

  /** Kleine Kennzahl (Beschriftung oben, Wert groß). */
  function metric(label: string, value: string, lead?: Node): HTMLElement {
    const m = el('span', 'zf-metric');
    const v = el('strong', 'zf-metric__value');
    if (lead) v.append(lead);
    v.append(value);
    m.append(el('span', 'zf-metric__label', label), v);
    return m;
  }

  /** Münz-Symbol: eigenes Bild, sonst ein gezeichneter Kreis. */
  function coinIcon(): HTMLElement {
    const c = el('span', 'zf-coin');
    if (IMAGES.muenze) {
      const img = el('img');
      img.src = IMAGES.muenze;
      img.alt = '';
      c.append(img);
    }
    c.setAttribute('aria-hidden', 'true');
    return c;
  }

  /** Meldung als Einblendung über dem Spielfeld (mit Symbol je nach Art). */
  function say(text: string, kind: 'info' | 'warn' | 'good' | 'bad' = 'info'): void {
    status.dataset.kind = kind;
    if (!text) return status.replaceChildren();
    const name: IconName = kind === 'good' ? 'check' : kind === 'bad' ? 'cross' : kind === 'warn' ? 'alert' : 'info';
    status.replaceChildren(icon(name, 20), el('span', 'zf-status__text', text));
  }

  function renderInfo(): void {
    if (mode === 'world') {
      info.replaceChildren(
        metric(tx(T.coinsShort), ctxNum(econ.coins), coinIcon()),
        metric(tx(T.totalShort), ctxNum(econ.total)),
        metric(tx(T.lostShort), ctxNum(wstate.lost)),
        metric(tx(T.parts), ctxNum(grid.size)),
      );
      renderOrder();
      hud.hidden = false;
      hud.replaceChildren(coinIcon(), el('strong', '', ctxNum(econ.coins)), el('span', 'zf-hud__sep'), icon('target', 16), el('span', '', baseLine()));
      if (!expandBtn.hidden) expandBtn.classList.toggle('is-poor', econ.coins < (ZONE_PRICES[econ.zone + 1] ?? 0));
      if (toolsSignature() !== toolsKey) renderTools();
      return;
    }
    hud.hidden = true;
    // Kennzahlen, dann die Sterne-Ziele als kleine Abzeichen
    const goals = el('div', 'zf-goals');
    const star = (text: string, ok: boolean) => {
      const g = el('span', `zf-goal-chip${ok ? ' is-ok' : ''}`);
      g.append(icon('star', 14), el('span', '', text));
      return g;
    };
    goals.append(star(tx(T.goalPar, { n: level.par }), grid.size <= level.par), star(tx(T.goalFirst), failedRuns === 0));
    const parts: Node[] = [metric(tx(T.parts), `${grid.size}`), metric(tx(T.delivered), `${state.delivered}/${totalNeed(level)}`)];
    // Grenze für Maschinen als Regel (kein Stern, sondern Pflicht)
    if (level.maxMachines) {
      const m = metric(tx(T.machines), `${machineCount()}/${level.maxMachines}`);
      m.classList.add('zf-metric--rule');
      m.title = tx(T.ruleMax, { n: level.maxMachines });
      parts.push(m);
    }
    parts.push(goals);
    if (!level.source.pick) sourcesOf(level).forEach((sv, i) => {
      const list = sv.values?.length ? sv.values : level.more?.length ? [sv.value] : null;
      if (list) parts.push(el('p', 'zf-source-seq', tx(level.more?.length ? T.sourceSeqN : T.sourceSeq, { n: i + 1, list: list.map(ctxNum).join(', ') })));
    });
    info.replaceChildren(...parts);
    renderTable();
    renderTrace();
  }

  /** Aktueller Auftrag mit Fortschritt, Belohnung und dem, was er freischaltet. */
  function renderOrder(): void {
    orderEl.hidden = mode !== 'world';
    if (mode !== 'world') return;
    const o = orderAt(econ.order);
    const pct = Math.min(100, (100 * econ.progress) / o.count);
    const bar = el('span', 'zf-order__bar');
    const fill = el('span', 'zf-order__fill');
    fill.style.width = `${pct}%`;
    bar.append(fill);
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(o.count));
    bar.setAttribute('aria-valuenow', String(econ.progress));
    bar.setAttribute('aria-label', tx(T.order, { n: econ.order + 1 }));
    const unlock = o.unlock.map((id) => tx(specName(specById(id)!))).join(', ');
    const reward = tx(T.reward, { n: ctxNum(o.reward) }) + (unlock ? ` · ${tx(T.rewardNew, { p: unlock })}` : '');
    orderEl.replaceChildren(
      el('span', 'zf-order__tag', tx(T.order, { n: econ.order + 1 })),
      el('strong', 'zf-order__text', tx(orderText(o, ctxNum))),
      el('span', 'zf-order__count', `${ctxNum(econ.progress)}/${ctxNum(o.count)}`),
      bar,
      el('span', 'zf-order__reward', o.streak ? `${reward} · ${tx(T.streakHint)}` : reward),
    );
  }

  /** Geschaffte Aufträge melden: Münzen, neue Teile, kurzer Jubel an der Basis. */
  function celebrate(done: Order[]): void {
    const coins = done.reduce((a, o) => a + o.reward, 0);
    const parts = done.flatMap((o) => o.unlock).map((id) => tx(specName(specById(id)!)));
    say(`${tx(T.orderDone, { n: ctxNum(coins) })}${parts.length ? ` ${tx(T.unlocked, { p: parts.join(', ') })}` : ''}`, 'good');
    const baseEl = cellsLayer.querySelector<HTMLElement>('.zf-cell--base');
    if (baseEl && !reduced) {
      baseEl.classList.remove('is-cheering');
      void baseEl.offsetWidth;
      baseEl.classList.add('is-cheering');
    }
    effect(board.base.x + 1, board.base.y + 1, '★', 'zf-coin-float zf-coin-float--big', 1200);
    sound.play('order');
    renderTools();
    saveWorld(grid, econ);
  }

  function tick(): void {
    if (mode === 'world') {
      wstate = worldStep(openWorld, grid, wstate, econ.zone, econ.order >= BUYERS_FROM);
      if (wstate.delivered.length) {
        const before = econ.order;
        const r = deliver(econ, wstate.delivered);
        econ = r.econ;
        if (r.completed.length) celebrate(r.completed);
        // Abnehmer werden frei
        if (before < BUYERS_FROM && econ.order >= BUYERS_FROM) {
          setTimeout(() => say(tx(T.buyersOpen), 'good'), 2500);
          renderCells();
        }
      }
      // Verkäufe an Abnehmer
      for (const [bi, v] of wstate.sold) {
        const b = openWorld.buyers![bi]!;
        econ.coins += b.pay;
        econ.total += 1;
        if (!reduced) effect(b.x + 1, b.y, `+${ctxNum(b.pay)}`, 'zf-coin-float', 900);
        void v;
      }
      if (wstate.sold.length) {
        sound.play('deliver');
        pulse(openWorld.buyers![wstate.sold[0]![0]]!.x, openWorld.buyers![wstate.sold[0]![0]]!.y, 'is-receiving');
      }
      renderItems();
      renderInfo();
      if (++saveCounter % 25 === 0) saveWorld(grid, econ);
      return;
    }
    state = step(level, withFixed(level, grid), state);
    hasRun = true;
    if (state.error) {
      stopTimer();
      failedRuns += 1;
      const e = state.error;
      const msg = e.kind === 'fell' ? T.fell : e.kind === 'wrong' ? T.wrong : e.kind === 'divide' ? T.divide : e.kind === 'root' ? T.root : T.timeout;
      sound.play('error');
      const want = e.target !== undefined ? tx(acceptText(targetsOf(level)[e.target]!.accept, state.got[e.target] ?? 0)) : '';
      say(tx(msg, { v: ctxNum(e.value), t: want }), 'bad');
      renderItems();
      renderCells();
      return;
    }
    renderItems();
    if (state.won) {
      stopTimer();
      sound.play('win');
      const got = starsFor(level, grid.size, failedRuns);
      stars[level.id] = Math.max(stars[level.id] ?? 0, got);
      save(stars);
      say(tx(T.won), 'good');
      status.append(starRow(got, 22), el('span', 'visually-hidden', `${got}/3 ★`));
      celebrateWin();
      renderLevels();
      if (index < 0) {
        // Tages- oder Zufallsrätsel: gleich ein neues Zufallsrätsel anbieten
        const n = btn('', 'zf-btn zf-btn--main');
        setButton(n, null, tx(T.anotherRandom));
        n.append(icon('arrow'));
        n.addEventListener('click', openRandom);
        status.append(' ', n);
        n.focus();
      } else if (index < ALL_LEVELS.length - 1) {
        const nextWorld = !CHAPTERS[shownWorld]!.levels.includes(ALL_LEVELS[index + 1]!);
        const n = btn('', 'zf-btn zf-btn--main');
        setButton(n, null, tx(nextWorld ? T.nextChapter : T.next));
        n.append(icon('arrow'));
        n.addEventListener('click', () => openLevel(index + 1));
        status.append(' ', n);
        n.focus();
      }
    }
    renderInfo();
  }

  function stopTimer(): void {
    running = false;
    beltLayer.classList.remove('is-running');
    clearInterval(timer);
    timer = 0;
    setButton(runBtn, 'play', tx(T.start));
  }

  /** Level mit Startzahl: erst wählen, dann starten. */
  function needsPick(): boolean {
    if (mode !== 'level' || !level.source.pick || picks[level.id] !== undefined) return false;
    say(tx(T.pickFirst), 'warn');
    pickInput.focus();
    return true;
  }

  function startTimer(): void {
    if (needsPick()) return;
    if (state.error || state.won) resetRun();
    running = true;
    beltLayer.classList.add('is-running');
    beltLayer.classList.toggle('is-fast', fast);
    setButton(runBtn, 'pause', tx(T.pause));
    say('');
    clearInterval(timer);
    timer = window.setInterval(tick, fast ? 120 : reduced ? 500 : 420);
    tick();
  }

  function resetRun(): void {
    stopTimer();
    state = start(picks[level.id]);
    wstate = worldStart();
    hasRun = false;
    say('');
    itemsLayer.replaceChildren();
    renderCells();
    renderInfo();
  }

  runBtn.addEventListener('click', () => (running ? stopTimer() : startTimer()));
  stepBtn.addEventListener('click', () => {
    if (running) stopTimer();
    if (needsPick()) return;
    if (state.error || state.won) resetRun();
    tick();
  });
  fastBtn.addEventListener('click', () => {
    fast = !fast;
    fastBtn.setAttribute('aria-pressed', String(fast));
    if (running) startTimer();
  });
  stopBtn.addEventListener('click', resetRun);
  clearBtn.addEventListener('click', () => {
    if (grid.size) remember();
    if (mode === 'world' && grid.size > 0 && !confirm(tx(T.resetConfirm))) return;
    if (mode === 'world') for (const part of grid.values()) econ.coins += priceOf(part);
    grid = new Map();
    resetRun();
    if (mode === 'world') {
      saveWorld(grid, econ);
      renderTools();
    }
  });

  // ---------- Level ----------
  /** Level-Auswahl: alle Welten als Karten mit ihren Leveln, dazu die offene Welt. */
  function renderLevels(): void {
    const chapterCard = (w: (typeof CHAPTERS)[number]): HTMLElement => {
      const wi = CHAPTERS.indexOf(w);
      const got = w.levels.reduce((a, l) => a + (stars[l.id] ?? 0), 0);
      const card = el('section', 'zf-world-card');
      const head = el('div', 'zf-world-card__head');
      const bar = el('span', 'zf-world-card__bar');
      const fill = el('span');
      fill.style.width = `${(100 * got) / (w.levels.length * 3)}%`;
      bar.append(fill);
      head.append(el('span', 'zf-world-card__num', String(wi + 1)), el('strong', '', tx(w.title)), el('span', 'zf-world-card__meta', `${tx(T.worldGrades, { g: w.grades })} · ${got}/${w.levels.length * 3} ★`), bar);
      // Kapitelbild klein, Pokal bei allen Sternen
      const cover = chapterImage(w.id);
      if (cover) {
        const img = el('img', 'zf-world-card__img');
        img.src = cover;
        img.alt = '';
        img.loading = 'lazy';
        head.append(img);
      }
      if (got === w.levels.length * 3 && IMAGES.pokal) {
        const cup = el('img', 'zf-world-card__cup');
        cup.src = IMAGES.pokal;
        cup.alt = tx(T.allStars);
        cup.title = tx(T.allStars);
        head.append(cup);
      }
      const list = el('div', 'zf-levels__list');
      w.levels.forEach((l, i) => {
        const n = stars[l.id] ?? 0;
        const pro = !!l.pro;
        const b = btn('', `zf-level${pro ? ' zf-level--pro' : ''}${n ? ' is-done' : ''}`);
        const st = starRow(n, 12);
        st.classList.add('zf-level__stars');
        b.append(el('span', 'zf-level__num', String(i + 1)), st);
        if (pro) b.append(el('span', 'zf-level__pro', tx(T.proShort)));
        b.setAttribute('aria-pressed', String(mode === 'level' && l === level));
        b.setAttribute('aria-label', `${tx(T.chapterLabel, { n: wi + 1, t: tx(w.title) })}, ${tx(T.levels)} ${i + 1}: ${tx(l.title)}${pro ? ` (${tx(T.pro)})` : ''}, ${n}/3 ★`);
        b.title = tx(l.title);
        b.addEventListener('click', () => openLevel(ALL_LEVELS.indexOf(l)));
        list.append(b);
      });
      card.append(head, list);
      return card;
    };
    // Oben: Weiterspielen, Sterne gesamt, Tages- und Zufallsrätsel, offene Welt
    const total = ALL_LEVELS.reduce((a, l) => a + (stars[l.id] ?? 0), 0);
    const nextOpen = ALL_LEVELS.find((l) => !stars[l.id]);
    const top = el('div', 'zf-picker__top');
    if (nextOpen) {
      const c = chapterOf(nextOpen);
      const go = ibtn('play', tx(T.continueAt, { c: CHAPTERS.indexOf(c) + 1, l: c.levels.indexOf(nextOpen) + 1 }), 'zf-btn zf-btn--main zf-continue');
      go.addEventListener('click', () => openLevel(nextOpen));
      top.append(go);
    }
    const sum = el('span', 'zf-picker__total');
    sum.append(icon('star', 16), el('span', '', tx(T.starsTotal, { n: total, m: ALL_LEVELS.length * 3 })));
    top.append(sum);
    const today = dayKey(new Date());
    const dailyStars = stars[`t-${today}`] ?? 0;
    const dailyBtn = btn('', 'zf-world-card zf-world-card--open zf-world-card--daily');
    const dailyTitle = el('strong', '', `${tx(T.daily)} `);
    dailyTitle.append(starRow(dailyStars, 16));
    dailyBtn.append(dailyTitle, el('span', 'zf-world-card__meta', tx(T.dailyMeta, { d: new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB') })));
    dailyBtn.setAttribute('aria-pressed', String(mode === 'level' && level.id === `t-${today}`));
    dailyBtn.addEventListener('click', openDaily);
    const randomBtn = btn('', 'zf-world-card zf-world-card--open zf-world-card--random');
    randomBtn.append(el('strong', '', tx(T.random)), el('span', 'zf-world-card__meta', tx(T.randomMeta)));
    randomBtn.addEventListener('click', openRandom);
    const worldBtn = btn('', 'zf-world-card zf-world-card--open');
    worldBtn.append(el('strong', '', tx(T.world)), el('span', 'zf-world-card__meta', tx(T.worldCard)));
    worldBtn.setAttribute('aria-pressed', String(mode === 'world'));
    worldBtn.addEventListener('click', openWorldMode);
    const sections = PARTS.flatMap((part) => {
      const chapters = part.chapters.map((id) => CHAPTERS.find((c) => c.id === id)!);
      const got = chapters.reduce((a, c) => a + c.levels.reduce((b, l) => b + (stars[l.id] ?? 0), 0), 0);
      const max = chapters.reduce((a, c) => a + c.levels.length * 3, 0);
      const h = el('h3', 'zf-levels__part');
      h.append(el('span', '', tx(part.title)), el('span', 'zf-levels__part-meta', `${got}/${max} ★`));
      return [h, ...chapters.map(chapterCard)];
    });
    const editBtn = btn('', 'zf-world-card zf-world-card--open zf-world-card--editor');
    editBtn.append(el('strong', '', tx(T.editor)), el('span', 'zf-world-card__meta', tx(T.editorCard)));
    if (IMAGES.baukasten) {
      const img = el('img', 'zf-world-card__icon');
      img.src = IMAGES.baukasten;
      img.alt = '';
      editBtn.append(img);
    }
    editBtn.addEventListener('click', () => openEditor());
    levelBar.replaceChildren(top, dailyBtn, randomBtn, worldBtn, editBtn, ...sections);
  }

  /** Tages- bzw. Zufallsrätsel bauen (kurz rechnen) und öffnen. */
  function openSpecial(make: () => LevelInfo): void {
    say(tx(T.building));
    if (IMAGES.zahnrad && !reduced) {
      const gear = el('img', 'zf-gear');
      gear.src = IMAGES.zahnrad;
      gear.alt = '';
      status.prepend(gear);
    }
    // erst die Meldung zeichnen lassen, dann rechnen
    setTimeout(() => openLevel(make()), 30);
  }
  function openDaily(): void {
    openSpecial(() => dailyLevel());
  }
  function openRandom(): void {
    openSpecial(() => randomLevel());
  }

  function openWorldMode(): void {
    if (editing) closeEditor();
    backBtn.hidden = true;
    closePicker();
    moving = null;
    clearSelection();
    if (mode === 'world') return;
    history = [];
    undoBtn.disabled = true;
    stopTimer();
    mode = 'world';
    board = boardOfWorld(openWorld);
    const saved = loadWorld(openWorld);
    grid = saved.grid;
    econ = saved.econ;
    wstate = worldStart();
    tool = { kind: 'part', spec: BELT };
    title.textContent = tx(T.worldTitle);
    hint.textContent = tx(T.worldHint);
    if (worldWasReset) {
      worldWasReset = false;
      saveWorld(grid, econ);
      setTimeout(() => say(tx(T.worldReset), 'info'), 0);
    }
    newEl.hidden = true;
    renderTip();
    traceEl.hidden = true;
    howto.textContent = tx(T.worldHowto);
    eyebrow.textContent = tx(T.eyebrowWorld);
    stepBtn.hidden = true;
    renderPick();
    renderTable();
    say('');
    itemsLayer.replaceChildren();
    renderLevels();
    renderTools();
    renderCells();
    renderInfo();
    fit();
    resetCursor();
  }

  function openLevel(which: number | LevelInfo): void {
    if (editing) closeEditor();
    closePicker();
    moving = null;
    clearSelection();
    const i = typeof which === 'number' ? which : ALL_LEVELS.indexOf(which);
    history = [];
    undoBtn.disabled = true;
    stopTimer();
    if (mode === 'world') saveWorld(grid, econ);
    mode = 'level';
    stepBtn.hidden = false;
    index = i;
    level = typeof which === 'number' ? ALL_LEVELS[i]! : which;
    const wInfo = chapterOf(level);
    shownWorld = CHAPTERS.indexOf(wInfo);
    tips = 0;
    tipSolution = undefined;
    board = boardOfLevel(level);
    // Rückwärts-Level: nur Bänder; ohne erlaubte Maschinen: nur Weichen, Verteiler, Zusammenführer, Brücke
    kit = level.source.pick ? [] : level.maxMachines === 0 ? kitFor(level).filter((k) => k.kind !== 'op') : kitFor(level);
    grid = new Map();
    tool = { kind: 'part', spec: BELT };
    state = start(picks[level.id]);
    failedRuns = 0;
    hasRun = false;
    const special = wInfo === SPECIAL;
    title.textContent = special ? tx(level.title) : `${wInfo.levels.indexOf(level) + 1}. ${tx(level.title)}`;
    howto.textContent = tx(T.howto);
    eyebrow.replaceChildren(el('span', '', special ? tx(level.id.startsWith('t-') ? T.daily : T.random) : tx(T.chapterLabel, { n: shownWorld + 1, t: tx(wInfo.title) })), el('span', 'zf-pill', tx(T.worldGrades, { g: wInfo.grades })), ...(level.pro ? [el('span', 'zf-pill zf-pill--pro', tx(T.pro))] : []));
    renderPick();
    renderOrder();
    hint.textContent = tx(level.hint);
    renderNew();
    renderTip();
    say('');
    itemsLayer.replaceChildren();
    renderLevels();
    renderTools();
    renderCells();
    renderInfo();
    fit();
    resetCursor();
    // Neues Bauteil in diesem Kapitel (und beim allerersten Besuch die Einführung): erklären
    const unseen = (['belt', ...wInfo.teaches] as LessonId[]).filter((id, k, all) => all.indexOf(id) === k && !lessonSeen(id));
    if (unseen.length) showLessons(root, lang, unseen, undefined, chapterImage(wInfo.id));
  }

  // ---------- Tipps (mit Löser) ----------
  let tips = 0;
  let tipSolution: Op[] | null | undefined;
  const tipBox = el('div', 'zf-tip');
  const tipBtn = ibtn('help', tx(T.tip), 'zf-btn zf-tip__btn');
  const tipText = el('p', 'zf-tip__text');
  tipText.setAttribute('aria-live', 'polite');
  tipBox.append(tipBtn, tipText);
  hint.after(tipBox);

  /** Nächster Tipp: erst wie viele Maschinen, dann die erste, dann eine ganze Lösung. */
  function renderTip(): void {
    tipBox.hidden = mode !== 'level';
    setButton(tipBtn, 'help', tx(tips ? T.tipMore : T.tip));
    if (!tips) return tipText.replaceChildren();
    if (!chainLevel(level)) {
      tipText.textContent = tx(T.tipGeneral);
      tipBtn.hidden = true;
      return;
    }
    if (tipSolution === undefined) tipSolution = solveChain(level, kit, Math.min(3, level.maxMachines ?? 3), 1)[0] ?? null;
    const sol = tipSolution;
    if (!sol) {
      tipText.textContent = tx(T.tipGeneral);
      tipBtn.hidden = true;
      return;
    }
    const lines = [sol.length === 0 ? tx(T.tipNone) : sol.length === 1 ? tx(T.tipOne) : tx(T.tipCount, { n: sol.length })];
    if (tips >= 2 && sol.length) lines.push(tx(T.tipFirst, { p: opLabel(sol[0]!) }));
    if (tips >= 3 && sol.length > 1) lines.push(tx(T.tipAll, { p: sol.map(opLabel).join(', ') }));
    tipText.replaceChildren(...lines.map((t) => el('span', '', t)));
    tipBtn.hidden = tips >= 3 || (tips >= 2 && sol.length <= 1) || sol.length === 0;
  }
  tipBtn.addEventListener('click', () => {
    tips += 1;
    tipBtn.hidden = false;
    renderTip();
  });

  // ---------- Rechenweg (ohne Ablauf, wird beim Bauen aktualisiert) ----------
  const traceEl = el('div', 'zf-trace');
  tipBox.after(traceEl);

  function renderTrace(): void {
    const sv = level.source;
    const value = sv.pick ? picks[level.id] : sourceValue(level, 0);
    traceEl.hidden = mode !== 'level' || value === undefined;
    if (traceEl.hidden || value === undefined) return;
    const t = trace(level, withFixed(level, grid), value);
    const chips: HTMLElement[] = [el('span', 'zf-trace__label', `${tx(T.traceLabel)} ${tx(T.traceFor, { v: ctxNum(value) })}:`), el('span', 'zf-trace__num', ctxNum(value))];
    for (const st of t.steps) chips.push(el('span', 'zf-trace__op', st.label), el('span', 'zf-trace__num', ctxNum(st.value)));
    if (t.end === 'target') {
      const target = targetsOf(level)[t.target!]!;
      const ok = accepts(target, t.value, 0);
      const end = el('span', `zf-trace__end ${ok ? 'is-ok' : 'is-bad'}`);
      end.append(icon(ok ? 'check' : 'cross', 14), el('span', '', ok ? tx(T.traceStorage) : `${tx(T.traceStorage)}: ${targetLabel(target, 0)}`));
      chips.push(end);
    } else chips.push(el('span', 'zf-trace__end', tx(t.end === 'branch' ? T.traceBranch : t.end === 'error' ? T.traceError : T.traceGap)));
    traceEl.replaceChildren(...chips);
  }

  /** Hinweis „Neu in diesem Kapitel“ mit Knopf zur Erklärung. */
  function renderNew(): void {
    const c = chapterOf(level);
    const items = newIn(c);
    const names = items.length ? items.map((k) => tx(k.name)) : c.teaches.filter((t) => t !== 'belt').map(() => tx(c.title));
    newEl.hidden = !names.length || c.teaches.includes('belt');
    if (newEl.hidden) return;
    const b = ibtn('info', tx(T.explain), 'zf-btn zf-new__btn');
    b.addEventListener('click', () => showLessons(root, lang, c.teaches, undefined, chapterImage(c.id)));
    newEl.replaceChildren(el('span', 'zf-new__tag', tx(T.newBadge)), el('span', 'zf-new__text', names.join(', ')), b);
  }

  // ---------- Baukasten: eigene Level bauen und teilen ----------
  /** Level, das gerade gebaut wird (null: normales Spiel). */
  let editing: CustomSpec | null = null;
  /** Zuletzt gebautes bzw. per Link geöffnetes eigenes Level (für „Zurück zum Baukasten“). */
  let lastSpec: CustomSpec | null = null;
  let editTool: 'hand' | 'source' | 'target' | 'rock' | 'erase' = 'rock';
  const editPanel = el('div', 'zf-edit');
  editPanel.hidden = true;
  q<HTMLElement>('.zf-goal').append(editPanel);
  const editControls = el('div', 'zf-edit-controls');
  editControls.hidden = true;
  controls.after(editControls);
  const backBtn = ibtn('arrow', tx(T.backToEditor), 'zf-btn zf-btn--bar zf-btn--back');
  backBtn.hidden = true;
  barActions.append(backBtn);
  backBtn.addEventListener('click', () => lastSpec && openEditor(lastSpec));

  const parseNums = (text: string) =>
    text
      .split(/[;,\s]+/)
      .map((t) => t.trim().replace('−', '-').replace(',', '.'))
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isFinite(n))
      .slice(0, 12);

  /** Aus der Beschreibung ein Level bauen und zeigen (ohne Ablauf). */
  function applySpec(): void {
    if (!editing) return;
    level = specToLevel(editing);
    board = boardOfLevel(level);
    state = start();
    renderCells();
    renderEditPanel(false);
  }

  function openEditor(spec: CustomSpec = lastSpec ?? blankSpec()): void {
    closePicker();
    stopTimer();
    if (mode === 'world') saveWorld(grid, econ);
    mode = 'level';
    index = -1;
    editing = { ...spec, w: spec.w.map((p) => [...p] as [number, number]) };
    grid = new Map();
    history = [];
    undoBtn.disabled = true;
    title.textContent = tx(T.editorTitle);
    eyebrow.replaceChildren(el('span', '', tx(T.editor)));
    for (const e of [hint, tipBox, traceEl, info, newEl, orderEl]) e.hidden = true;
    tableBox.hidden = true;
    controls.hidden = true;
    editControls.hidden = false;
    backBtn.hidden = true;
    itemsLayer.replaceChildren();
    say(tx(T.editorHelp));
    applySpec();
    renderEditTools();
    renderEditPanel(true);
    renderEditControls();
    fit();
  }

  function closeEditor(): void {
    editing = null;
    hint.hidden = false;
    info.hidden = false;
    controls.hidden = false;
    editControls.hidden = true;
    editPanel.hidden = true;
  }

  function editTap(x: number, y: number): void {
    const sp = editing!;
    const isS = sp.s[0] === x && sp.s[1] === y;
    const isG = sp.g[0] === x && sp.g[1] === y;
    const rockAt = sp.w.findIndex(([wx, wy]) => wx === x && wy === y);
    if (editTool === 'source') {
      if (isS) sp.s = [x, y, ((sp.s[2] + 1) % 4) as Dir];
      else if (!isG) {
        sp.s = [x, y, sp.s[2]];
        if (rockAt >= 0) sp.w.splice(rockAt, 1);
      }
    } else if (editTool === 'target') {
      if (!isS) {
        sp.g = [x, y];
        if (rockAt >= 0) sp.w.splice(rockAt, 1);
      }
    } else if (editTool === 'rock') {
      if (rockAt >= 0) sp.w.splice(rockAt, 1);
      else if (!isS && !isG) sp.w.push([x, y]);
    } else if (editTool === 'erase' && rockAt >= 0) sp.w.splice(rockAt, 1);
    sound.play('place');
    applySpec();
  }

  function renderEditTools(): void {
    const tools: [typeof editTool, IconName | ArtKind, Localized][] = [
      ['hand', 'hand', T.hand],
      ['source', 'source', T.source],
      ['target', 'target', T.target],
      ['rock', 'rock', T.rock],
      ['erase', 'erase', T.erase],
    ];
    toolsEl.classList.remove('zf-tools--many', 'zf-tools--world');
    toolsEl.replaceChildren(
      ...tools.map(([id, pic, label]) => {
        const b = el('button', 'zf-tool');
        b.type = 'button';
        const p = el('span', 'zf-tool__pic');
        if (id === 'hand' || id === 'erase') p.append(icon(pic as IconName, 22));
        else {
          const src = imageFor(pic as ArtKind);
          if (src) {
            const img = el('img');
            img.src = src;
            img.alt = '';
            p.append(img);
          } else p.classList.add('is-plain');
        }
        b.append(p, el('span', 'zf-tool__label', tx(label)));
        b.setAttribute('aria-pressed', String(editTool === id));
        b.addEventListener('click', () => {
          editTool = id;
          tool = id === 'hand' ? { kind: 'hand' } : { kind: 'part', spec: BELT };
          renderEditTools();
        });
        return b;
      }),
    );
    numBox.hidden = true;
  }

  /** Formular: Titel, Zahlen, Größe, Grenze, Werkzeugkasten. */
  function renderEditPanel(full: boolean): void {
    if (!editing) return;
    editPanel.hidden = false;
    if (!full) {
      const sz = editPanel.querySelector('.zf-edit__size-value');
      if (sz) sz.textContent = `${editing.c} × ${editing.r}`;
      return;
    }
    const sp = editing;
    const field = (label: string, input: HTMLElement) => {
      const w = el('label', 'zf-edit__field');
      w.append(el('span', 'zf-edit__label', label), input);
      return w;
    };
    const text = (value: string, on: (v: string) => void, placeholder = '') => {
      const i = el('input', 'zf-edit__input');
      i.type = 'text';
      i.value = value;
      i.placeholder = placeholder;
      i.addEventListener('change', () => on(i.value));
      return i;
    };
    const fmtList = (a: number[]) => a.map((n) => String(n).replace('-', '−')).join(', ');
    const sizeRow = el('div', 'zf-edit__size');
    const step = (labelKey: Localized, d: [number, number]) => {
      const b = btn('', 'zf-btn zf-num__btn');
      b.append(icon(d[0] + d[1] > 0 ? 'plus' : 'minus'));
      b.setAttribute('aria-label', tx(labelKey));
      b.addEventListener('click', () => {
        sp.c = Math.min(SIZE.maxC, Math.max(SIZE.minC, sp.c + d[0]));
        sp.r = Math.min(SIZE.maxR, Math.max(SIZE.minR, sp.r + d[1]));
        const inside = (x: number, y: number) => x < sp.c && y < sp.r;
        if (!inside(sp.s[0], sp.s[1])) sp.s = [Math.min(sp.s[0], sp.c - 1), Math.min(sp.s[1], sp.r - 1), sp.s[2]];
        if (!inside(sp.g[0], sp.g[1])) sp.g = [Math.min(sp.g[0], sp.c - 1), Math.min(sp.g[1], sp.r - 1)];
        if (sp.s[0] === sp.g[0] && sp.s[1] === sp.g[1]) sp.g = [sp.g[0] > 0 ? sp.g[0] - 1 : 1, sp.g[1]];
        sp.w = sp.w.filter(([x, y]) => inside(x, y));
        applySpec();
        fit();
      });
      return b;
    };
    sizeRow.append(
      el('span', 'zf-edit__label', tx(T.editorSize)),
      step(T.editorNarrower, [-1, 0]),
      step(T.editorWider, [1, 0]),
      el('span', 'zf-edit__size-value', `${sp.c} × ${sp.r}`),
      step(T.editorLower, [0, -1]),
      step(T.editorTaller, [0, 1]),
    );
    const maxSel = el('select', 'zf-edit__input');
    [[-1, tx(T.editorNoLimit)], ...[0, 1, 2, 3, 4, 5].map((n) => [n, String(n)])].forEach(([v, label]) => {
      const o = el('option', '', String(label));
      o.value = String(v);
      o.selected = (sp.m ?? -1) === v;
      maxSel.append(o);
    });
    maxSel.addEventListener('change', () => {
      const v = Number(maxSel.value);
      if (v < 0) delete sp.m;
      else sp.m = v;
      applySpec();
    });
    const kitSel = el('select', 'zf-edit__input');
    CHAPTERS.forEach((c, i) => {
      const o = el('option', '', tx(T.editorUpTo, { n: i + 1, t: tx(c.title) }));
      o.value = String(i);
      o.selected = sp.k === i;
      kitSel.append(o);
    });
    kitSel.addEventListener('change', () => {
      sp.k = Number(kitSel.value);
      applySpec();
    });
    editPanel.replaceChildren(
      field(tx(T.editorName), text(sp.t, (v) => ((sp.t = v.slice(0, 60)), applySpec()), tx(T.editorNamePh))),
      field(tx(T.editorSource), text(fmtList(sp.a), (v) => {
        const a = parseNums(v);
        if (a.length) sp.a = a;
        applySpec();
        renderEditPanel(true);
      }, '3  oder  1, 2, 3, 4, 5')),
      field(tx(T.editorWant), text(fmtList(sp.b), (v) => {
        const b = parseNums(v);
        if (b.length) sp.b = b;
        applySpec();
        renderEditPanel(true);
      }, '5  oder  2, 4, 6, 8, 10')),
      sizeRow,
      field(tx(T.editorMax), maxSel),
      field(tx(T.editorKit), kitSel),
      el('p', 'zf-edit__note', tx(T.editorNote)),
    );
  }

  function renderEditControls(): void {
    const test = ibtn('play', tx(T.editorTest), 'zf-btn zf-btn--main');
    test.addEventListener('click', () => {
      if (!editing) return;
      lastSpec = editing;
      window.history.replaceState(null, '', `#eigen=${encodeSpec(editing)}`);
      const l = specToLevel(editing);
      closeEditor();
      openLevel(l);
      backBtn.hidden = false;
    });
    const share = ibtn('copy', tx(T.editorShare));
    share.addEventListener('click', async () => {
      if (!editing) return;
      const url = `${location.origin}${location.pathname}#eigen=${encodeSpec(editing)}`;
      try {
        await navigator.clipboard.writeText(url);
        say(tx(T.editorCopied), 'good');
      } catch {
        prompt(tx(T.editorCopyManual), url);
      }
    });
    const fresh = ibtn('trash', tx(T.editorNew));
    fresh.addEventListener('click', () => openEditor(blankSpec()));
    editControls.replaceChildren(test, share, fresh);
  }

  // Eigenes Level aus dem Link (#eigen=…)
  const fromLink = location.hash.startsWith('#eigen=') ? decodeSpec(location.hash.slice(7)) : null;
  if (fromLink) {
    lastSpec = fromLink;
    openLevel(specToLevel(fromLink));
    backBtn.hidden = false;
  } else openLevel(index);
  addEventListener('resize', () => applyView());
  root.classList.add('is-ready');
}
