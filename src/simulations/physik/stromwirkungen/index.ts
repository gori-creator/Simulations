import { defineSimulation, prefersReducedMotion, roundRect, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import {
  BREAKER,
  bodyCurrent,
  holdForce,
  layerThickness,
  METAL,
  platedMass,
  type Metal,
  checkTask,
  contactVoltage,
  cost,
  current,
  danger,
  faultOutcome,
  fuseBlows,
  HOME_POWER,
  householdCurrent,
  makeTask,
  power,
  RCD_LIMIT,
  type Contact,
  type CurrentTask,
  type Danger,
  type Device,
  type HomeDevice,
} from './model';

const L = (de: string, en: string) => ({ de, en });

const SOURCES: Record<string, number> = { bat: 1.5, block: 9, auto: 12, trafo: 24, netz: 230, stark: 400 };

function hash(i: number): number {
  const v = Math.sin(i * 78.233 + 1.7) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Wirkungen des elektrischen Stroms: Licht, Wärme, Magnetismus und Chemie,
 * Schmelzsicherung und Kurzschluss, Gefahren für den Menschen und FI-Schalter,
 * Haushalt (Mehrfachsteckdose, 16-A-Sicherung, Kosten), Schutzleiter bei einem
 * defekten Gerät, Vogel auf der Leitung und eine Übung.
 */
export default defineSimulation({
  id: 'stromwirkungen',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'wirkungen', label: L('Wirkungen des Stroms', 'Effects of current') },
        { value: 'gefahr', label: L('Gefahr für den Menschen', 'Danger to people') },
        { value: 'haushalt', label: L('Haushalt: Mehrfachsteckdose und Sicherung', 'Home: power strip and breaker') },
        { value: 'schutz', label: L('Schutzleiter und FI-Schalter', 'Protective earth and RCD') },
        { value: 'vogel', label: L('Warum dem Vogel auf der Leitung nichts passiert', 'Why the bird on the wire is safe') },
        { value: 'galvanik', label: L('Verkupfern: chemische Wirkung', 'Copper plating: chemical effect') },
        { value: 'kran', label: L('Schrottkran: Elektromagnet', 'Scrap crane: electromagnet') },
        { value: 'ueben', label: L('Üben: Aufgaben zum Strom', 'Practice: tasks on current') },
      ],
      default: 'wirkungen',
      display: 'menu',
    },
    {
      key: 'geraet',
      type: 'choice',
      label: L('Gerät', 'Device'),
      options: [
        { value: 'lampe', label: L('Glühlampe', 'light bulb') },
        { value: 'heiz', label: L('Heizdraht', 'heating wire') },
        { value: 'spule', label: L('Spule mit Eisenkern', 'coil with iron core') },
        { value: 'wasser', label: L('Salzwasser', 'salt water') },
      ],
      default: 'lampe',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'wirkungen',
    },
    { key: 'U', type: 'number', label: L('Spannung', 'Voltage'), min: 0, max: 12, step: 0.5, default: 6, unit: 'V', visibleIf: (v) => v.mode === 'wirkungen' },
    {
      key: 'sich',
      type: 'choice',
      label: L('Sicherung', 'Fuse'),
      options: [
        { value: '1', label: L('1 A', '1 A') },
        { value: '2', label: L('2 A', '2 A') },
        { value: '5', label: L('5 A', '5 A') },
      ],
      default: '2',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'wirkungen',
    },
    { key: 'kurz', type: 'boolean', label: L('Kurzschluss', 'Short circuit'), default: false, visibleIf: (v) => v.mode === 'wirkungen' },
    {
      key: 'quelle',
      type: 'choice',
      label: L('Spannungsquelle', 'Voltage source'),
      options: [
        { value: 'bat', label: L('Batterie 1,5 V', 'battery 1.5 V') },
        { value: 'block', label: L('9-V-Block', '9 V battery') },
        { value: 'auto', label: L('Autobatterie 12 V', 'car battery 12 V') },
        { value: 'trafo', label: L('Spielzeugtrafo 24 V', 'toy transformer 24 V') },
        { value: 'netz', label: L('Steckdose 230 V', 'mains socket 230 V') },
        { value: 'stark', label: L('Starkstrom 400 V', 'three-phase 400 V') },
      ],
      default: 'netz',
      display: 'menu',
      visibleIf: (v) => v.mode === 'gefahr',
    },
    { key: 'nass', type: 'boolean', label: L('nasse Haut', 'wet skin'), default: false, visibleIf: (v) => v.mode === 'gefahr' },
    { key: 'fi', type: 'boolean', label: L('FI-Schutzschalter', 'residual-current device (RCD)'), default: false, visibleIf: (v) => v.mode === 'gefahr' || v.mode === 'schutz' },
    { key: 'kocher', type: 'boolean', label: L('Wasserkocher 2000 W', 'Kettle 2000 W'), default: true, visibleIf: (v) => v.mode === 'haushalt' },
    { key: 'foehn', type: 'boolean', label: L('Föhn 1800 W', 'Hair dryer 1800 W'), default: false, visibleIf: (v) => v.mode === 'haushalt' },
    { key: 'toaster', type: 'boolean', label: L('Toaster 900 W', 'Toaster 900 W'), default: true, visibleIf: (v) => v.mode === 'haushalt' },
    { key: 'heizer', type: 'boolean', label: L('Heizlüfter 2000 W', 'Fan heater 2000 W'), default: false, visibleIf: (v) => v.mode === 'haushalt' },
    { key: 'lampe', type: 'boolean', label: L('LED-Lampe 10 W', 'LED lamp 10 W'), default: true, visibleIf: (v) => v.mode === 'haushalt' },
    { key: 'laden', type: 'boolean', label: L('Ladegerät 20 W', 'Charger 20 W'), default: true, visibleIf: (v) => v.mode === 'haushalt' },
    { key: 'pe', type: 'boolean', label: L('Schutzleiter angeschlossen', 'Protective earth connected'), default: true, visibleIf: (v) => v.mode === 'schutz' },
    { key: 'fehl', type: 'boolean', label: L('Defekt: Draht berührt das Gehäuse', 'Fault: wire touches the casing'), default: true, visibleIf: (v) => v.mode === 'schutz' },
    {
      key: 'kon',
      type: 'choice',
      label: L('Berührung', 'Contact'),
      options: [
        { value: 'eins', label: L('Vogel auf einem Seil', 'bird on one wire') },
        { value: 'zwei', label: L('großer Vogel berührt zwei Seile', 'big bird touches two wires') },
        { value: 'boden', label: L('Drachenschnur: Seil und Erde', 'kite string: wire and earth') },
      ],
      default: 'eins',
      visibleIf: (v) => v.mode === 'vogel',
    },
    {
      key: 'gmet',
      type: 'choice',
      label: L('Metall', 'Metal'),
      options: [
        { value: 'cu', label: L('Kupfer', 'copper') },
        { value: 'ag', label: L('Silber', 'silver') },
        { value: 'ni', label: L('Nickel', 'nickel') },
      ],
      default: 'cu',
      visibleIf: (v) => v.mode === 'galvanik',
    },
    { key: 'gi', type: 'number', label: L('Stromstärke I', 'Current I'), unit: 'A', min: 0.1, max: 3, step: 0.1, default: 1, visibleIf: (v) => v.mode === 'galvanik' },
    { key: 'gt', type: 'number', label: L('Zeit t', 'Time t'), unit: 'min', min: 5, max: 180, step: 5, default: 30, visibleIf: (v) => v.mode === 'galvanik' },
    { key: 'kn', type: 'number', label: L('Windungen N', 'Turns N'), min: 100, max: 1000, step: 50, default: 500, visibleIf: (v) => v.mode === 'kran' },
    { key: 'ki', type: 'number', label: L('Stromstärke I', 'Current I'), unit: 'A', min: 0, max: 5, step: 0.1, default: 3, visibleIf: (v) => v.mode === 'kran' },
    { key: 'kl', type: 'number', label: L('Schrott', 'Scrap'), unit: 'kg', min: 100, max: 1200, step: 50, default: 600, visibleIf: (v) => v.mode === 'kran' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 10, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'haushalt'
      ? L(
          'Schalte Geräte ein. Ihre Ströme addieren sich – über 16 A schaltet die Sicherung den Stromkreis ab.',
          'Switch devices on. Their currents add up – above 16 A the breaker switches the circuit off.',
        )
      : v.mode === 'schutz'
        ? L(
            'Ein Draht berührt innen das Metallgehäuse. Was passiert mit und ohne Schutzleiter, mit und ohne FI-Schalter?',
            'A wire touches the metal casing inside. What happens with and without protective earth, with and without an RCD?',
          )
        : v.mode === 'vogel'
          ? L('Gefährlich ist nicht die hohe Spannung allein, sondern ein Spannungsunterschied am Körper.', 'What is dangerous is not the high voltage alone but a voltage difference across the body.')
          : v.mode === 'galvanik'
            ? L(
                'Strom zerlegt die Salzlösung: Am Minuspol scheidet sich Metall ab. Je mehr Strom und je länger, desto dicker die Schicht.',
                'Current splits the salt solution: metal is deposited at the negative pole. The more current and the longer, the thicker the layer.',
              )
            : v.mode === 'kran'
              ? L(
                  'Mehr Windungen und mehr Strom machen den Magneten stärker. Schaltest du den Strom ab, fällt der Schrott herunter.',
                  'More turns and more current make the magnet stronger. Switch the current off and the scrap drops.',
                )
              : v.mode === 'ueben'
                ? L('Gib die Nummer der richtigen Antwort oder die Zahl ein und drücke „Prüfen“.', 'Enter the number of the correct answer or the value and press “Check”.')
                : v.mode === 'gefahr'
                  ? L(
                      'Wie viel Strom durch den Körper fließt, hängt von der Spannung und von der Haut ab. Schon wenige Milliampere sind gefährlich.',
                      'How much current flows through the body depends on the voltage and on the skin. Just a few milliamperes are dangerous.',
                    )
                  : L(
                      'Drücke Start, wähle ein Gerät und erhöhe die Spannung. Was passiert bei einem Kurzschluss?',
                      'Press play, choose a device and raise the voltage. What happens in a short circuit?',
                    ),
  actions: [
    { id: 'touch', label: L('Gehäuse berühren', 'Touch the casing'), primary: true, visibleIf: (v) => v.mode === 'schutz' },
    { id: 'reset', label: L('Wieder einschalten', 'Switch back on'), visibleIf: (v) => v.mode === 'schutz' || v.mode === 'haushalt' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'info', label: L('Erklärung', 'Explanation') },
    { key: 'I', label: L('Stromstärke', 'Current') },
    { key: 'P', label: L('Leistung im Gerät', 'Power in the device') },
    { key: 'fuse', label: L('Sicherung', 'Fuse'), spoiler: true },
    { key: 'Ib', label: L('Strom durch den Körper', 'Current through the body') },
    { key: 'eff', label: L('Wirkung', 'Effect'), spoiler: true },
    { key: 'fiS', label: L('FI-Schalter', 'RCD') },
  ],
  presets: [
    { id: 'lampe', label: L('Glühlampe 6 V', 'Light bulb 6 V'), values: { mode: 'wirkungen', geraet: 'lampe', U: 6, sich: '2', kurz: false } },
    { id: 'heiz', label: L('Heizdraht 12 V', 'Heating wire 12 V'), values: { mode: 'wirkungen', geraet: 'heiz', U: 12, sich: '5', kurz: false } },
    { id: 'kurz', label: L('Kurzschluss', 'Short circuit'), values: { mode: 'wirkungen', geraet: 'lampe', U: 6, sich: '2', kurz: true } },
    { id: 'netz', label: L('Steckdose, nasse Hände', 'Socket, wet hands'), values: { mode: 'gefahr', quelle: 'netz', nass: true, fi: false } },
    { id: 'fi', label: L('Steckdose mit FI-Schalter', 'Socket with RCD'), values: { mode: 'gefahr', quelle: 'netz', nass: true, fi: true } },
    { id: 'spule', label: L('Elektromagnet hebt Klammern', 'Electromagnet lifts clips'), values: { mode: 'wirkungen', geraet: 'spule', U: 9, sich: '5', kurz: false } },
    { id: 'wasser', label: L('Strom durch Salzwasser', 'Current through salt water'), values: { mode: 'wirkungen', geraet: 'wasser', U: 12, sich: '2', kurz: false } },
    {
      id: 'kitchen',
      label: L('Frühstück: Kocher + Toaster', 'Breakfast: kettle + toaster'),
      values: { mode: 'haushalt', kocher: true, toaster: true, foehn: false, heizer: false, lampe: true, laden: true },
    },
    {
      id: 'over',
      label: L('Überlast: Kocher, Föhn, Heizlüfter', 'Overload: kettle, dryer, heater'),
      values: { mode: 'haushalt', kocher: true, foehn: true, heizer: true, toaster: false, lampe: true, laden: true },
    },
    { id: 'pe', label: L('Defekt mit Schutzleiter', 'Fault with protective earth'), values: { mode: 'schutz', pe: true, fi: false, fehl: true } },
    { id: 'nope', label: L('Defekt ohne Schutzleiter', 'Fault without protective earth'), values: { mode: 'schutz', pe: false, fi: false, fehl: true } },
    { id: 'rcd', label: L('Ohne Schutzleiter, aber mit FI', 'No earth, but with RCD'), values: { mode: 'schutz', pe: false, fi: true, fehl: true } },
    { id: 'bird', label: L('Vogel auf einem Seil', 'Bird on one wire'), values: { mode: 'vogel', kon: 'eins' } },
    { id: 'kite', label: L('Drachenschnur an der Leitung', 'Kite string on the line'), values: { mode: 'vogel', kon: 'boden' } },
    { id: 'plate', label: L('Schlüssel verkupfern', 'Copper-plate a key'), values: { mode: 'galvanik', gmet: 'cu', gi: 1, gt: 30 } },
    { id: 'silver', label: L('Löffel versilbern', 'Silver-plate a spoon'), values: { mode: 'galvanik', gmet: 'ag', gi: 0.5, gt: 60 } },
    { id: 'crane', label: L('Schrottkran hebt 600 kg', 'Scrap crane lifts 600 kg'), values: { mode: 'kran', kn: 500, ki: 3, kl: 600 } },
    { id: 'weak', label: L('Zu wenig Strom für 1000 kg', 'Too little current for 1000 kg'), values: { mode: 'kran', kn: 300, ki: 2, kl: 1000 } },
    { id: 'quiz', label: L('Üben: acht Aufgabenarten', 'Practice: eight task types'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasW: 'Stromkreis mit Quelle, Schmelzsicherung und einem Gerät; die Wirkung des Stroms ist am Gerät zu sehen',
      canvasG: 'Ein Mensch berührt einen spannungsführenden Draht und steht auf dem Boden; daneben eine Skala, wie gefährlich der Körperstrom ist',
      IVal: 'I ≈ {I} A',
      PVal: 'P ≈ {P} W',
      Pshort: '0 W – der Strom fließt am Gerät vorbei',
      fuseOk: 'hält ({r} A)',
      fuseBlown: 'durchgebrannt! (mehr als {r} A)',
      IbVal: 'I ≈ {I} mA (R ≈ {R} Ω)',
      none: 'nicht spürbar',
      tingle: 'Kribbeln, Schreck',
      cramp: 'Muskeln verkrampfen – Loslassen unmöglich',
      deadly: 'Herzkammerflimmern – Lebensgefahr',
      fiOff: 'nicht eingebaut',
      fiTrip: 'schaltet nach etwa 0,03 s ab – der Mensch überlebt meist',
      fiStay: 'löst erst ab 30 mA Fehlerstrom aus',
      source: 'Quelle',
      fuse: 'Sicherung',
      short: 'Kurzschluss',
      light: 'Licht und Wärme',
      heat: 'Wärme',
      magnet: 'magnetische Wirkung',
      chem: 'chemische Wirkung: Gasbläschen',
      clips: 'Büroklammern',
      ground: 'Erde',
      scale: 'Körperstrom in mA',
      off: 'abgeschaltet',
      canvasQ: 'Übungsaufgabe zum Strom mit Rückmeldung',
      canvasGal: 'Becherglas mit Salzlösung, links eine Metallplatte am Pluspol, rechts ein Schlüssel am Minuspol; Metall-Ionen wandern zum Schlüssel und bilden eine Schicht',
      canvasK: 'Kran mit einem Elektromagneten über einem Schrotthaufen; daneben Balken für Haltekraft und Gewicht',
      gMass: 'm ≈ {m} g {metal} (in {t} min)',
      gLayer: 'Schicht auf 50 cm²: etwa {d} µm',
      gInfo: 'Am Minuspol nehmen die Metall-Ionen Elektronen auf und werden zu Metall. Die Masse wächst mit Stromstärke mal Zeit.',
      gPerAh: 'pro Amperestunde {m} g',
      gAnode: 'Platte (+)',
      gKey: 'Schlüssel (−)',
      gAfter: 'nach {t} min: {m} g',
      cu: 'Kupfer',
      ag: 'Silber',
      ni: 'Nickel',
      kF: 'Haltekraft F ≈ {F} kN',
      kG: 'Gewicht des Schrotts ≈ {G} kN',
      kLift: 'Der Magnet hebt den Schrott.',
      kDrop: 'Zu schwach – der Schrott bleibt liegen.',
      kOff: 'Kein Strom – kein Magnet.',
      kInfo: 'Der Strom in der Spule macht den Eisenkern zum Magneten. Doppelt so viele Windungen wirken wie doppelt so viel Strom – bis das Eisen gesättigt ist.',
      kForce: 'Haltekraft',
      kWeight: 'Gewicht',
      hhI: 'I = P : U = {P} W : 230 V ≈ {I} A',
      hhOk: 'Sicherung hält (unter 16 A)',
      hhTrip: 'Sicherung löst aus – Stromkreis abgeschaltet (über 16 A)',
      hhCost: 'Eine Stunde kostet etwa {c} € (bei 0,35 € pro kWh).',
      hhInfo: 'Jedes Gerät zieht seinen eigenen Strom; in der Zuleitung addieren sich alle. Mehrfachsteckdosen hintereinander sind deshalb gefährlich.',
      pe: 'Schutzleiter',
      casing: 'Gehäuse',
      fault: 'Fehler',
      sPe: 'Der Fehlerstrom fließt über den Schutzleiter zur Erde – die Sicherung löst sofort aus. Das Gehäuse ist spannungsfrei.',
      sNoPe: 'Ohne Schutzleiter steht das Gehäuse unter 230 V. Wer es berührt, wird durchströmt: etwa {mA} mA – Lebensgefahr!',
      sRcd: 'Der FI-Schalter merkt den Fehlerstrom von {mA} mA und schaltet in etwa 0,03 s ab. Ein Schreck, aber meist keine Verletzung.',
      sOk: 'Kein Fehler: Das Gehäuse ist spannungsfrei.',
      sWait: 'Drücke „Gehäuse berühren“.',
      breaker: 'Sicherung',
      vEins: 'Zwischen den Füßen liegen nur {U} V – praktisch kein Strom.',
      vZwei: 'Zwischen zwei Seilen liegen 400 V – der Strom fließt durch den Körper. Lebensgefahr!',
      vBoden: 'Die Schnur verbindet die Leitung mit der Erde: 230 V und mehr am Körper. Niemals Drachen in der Nähe von Leitungen steigen lassen!',
      vInfo: 'Strom fließt nur, wenn zwischen zwei Stellen des Körpers eine Spannung liegt.',
      qTitle: 'Aufgabe {n}',
      qHow: 'Gib die Nummer der richtigen Antwort ein und drücke „Prüfen“.',
      qHowNum: 'Gib die Zahl ein und drücke „Prüfen“.',
      qOk: 'Richtig!',
      qNo: 'Noch nicht – versuche es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig · Serie {s}',
      qYour: 'Deine Antwort: {a}',
      qBad: 'Bitte eine Zahl eingeben.',
    },
    en: {
      canvasW: 'Circuit with a source, a fuse and a device; the effect of the current can be seen at the device',
      canvasG: 'A person touches a live wire while standing on the ground; next to it a scale showing how dangerous the body current is',
      IVal: 'I ≈ {I} A',
      PVal: 'P ≈ {P} W',
      Pshort: '0 W – the current bypasses the device',
      fuseOk: 'holds ({r} A)',
      fuseBlown: 'blown! (more than {r} A)',
      IbVal: 'I ≈ {I} mA (R ≈ {R} Ω)',
      none: 'not noticeable',
      tingle: 'tingling, shock',
      cramp: 'muscles cramp – impossible to let go',
      deadly: 'ventricular fibrillation – danger to life',
      fiOff: 'not installed',
      fiTrip: 'switches off after about 0.03 s – the person usually survives',
      fiStay: 'only trips from 30 mA fault current',
      source: 'source',
      fuse: 'fuse',
      short: 'short circuit',
      light: 'light and heat',
      heat: 'heat',
      magnet: 'magnetic effect',
      chem: 'chemical effect: gas bubbles',
      clips: 'paper clips',
      ground: 'earth',
      scale: 'body current in mA',
      off: 'switched off',
      canvasQ: 'Practice task on current with feedback',
      canvasGal: 'Beaker with salt solution, on the left a metal plate at the positive pole, on the right a key at the negative pole; metal ions move to the key and form a layer',
      canvasK: 'Crane with an electromagnet above a pile of scrap; next to it bars for holding force and weight',
      gMass: 'm ≈ {m} g of {metal} (in {t} min)',
      gLayer: 'Layer on 50 cm²: about {d} µm',
      gInfo: 'At the negative pole the metal ions take up electrons and become metal. The mass grows with current times time.',
      gPerAh: '{m} g per ampere-hour',
      gAnode: 'plate (+)',
      gKey: 'key (−)',
      gAfter: 'after {t} min: {m} g',
      cu: 'copper',
      ag: 'silver',
      ni: 'nickel',
      kF: 'Holding force F ≈ {F} kN',
      kG: 'Weight of the scrap ≈ {G} kN',
      kLift: 'The magnet lifts the scrap.',
      kDrop: 'Too weak – the scrap stays on the ground.',
      kOff: 'No current – no magnet.',
      kInfo: 'The current in the coil turns the iron core into a magnet. Twice as many turns act like twice the current – until the iron is saturated.',
      kForce: 'holding force',
      kWeight: 'weight',
      hhI: 'I = P / U = {P} W / 230 V ≈ {I} A',
      hhOk: 'breaker holds (below 16 A)',
      hhTrip: 'breaker trips – circuit switched off (above 16 A)',
      hhCost: 'One hour costs about €{c} (at €0.35 per kWh).',
      hhInfo: 'Each device draws its own current; in the supply cable they all add up. Daisy-chained power strips are therefore dangerous.',
      pe: 'protective earth',
      casing: 'casing',
      fault: 'fault',
      sPe: 'The fault current flows through the protective earth – the breaker trips at once. The casing carries no voltage.',
      sNoPe: 'Without protective earth the casing is at 230 V. Anyone touching it gets a current of about {mA} mA – deadly!',
      sRcd: 'The RCD detects the fault current of {mA} mA and switches off in about 0.03 s. A shock, but usually no injury.',
      sOk: 'No fault: the casing carries no voltage.',
      sWait: 'Press “Touch the casing”.',
      breaker: 'breaker',
      vEins: 'Only {U} V between the feet – practically no current.',
      vZwei: '400 V between two wires – current flows through the body. Deadly!',
      vBoden: 'The string connects the line to earth: 230 V or more across the body. Never fly kites near power lines!',
      vInfo: 'Current only flows if there is a voltage between two points of the body.',
      qTitle: 'Task {n}',
      qHow: 'Enter the number of the correct answer and press “Check”.',
      qHowNum: 'Enter the number and press “Check”.',
      qOk: 'Correct!',
      qNo: 'Not yet – try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct · streak {s}',
      qYour: 'Your answer: {a}',
      qBad: 'Please enter a number.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasW'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let t = 0;

    const dev = () => p.geraet as Device;
    const rating = () => Number(p.sich);
    const I = () => current(p.U, dev(), p.kurz);
    const blown = () => fuseBlows(I(), rating());
    const flowing = () => (blown() ? 0 : I());

    /* Haushalt und Schutz */
    let tripped = false;
    let touched = false;
    const HOME: HomeDevice[] = ['kocher', 'foehn', 'toaster', 'heizer', 'lampe', 'laden'];
    const onList = () => HOME.filter((d) => (p as unknown as Record<string, boolean>)[d]);
    /* Übung */
    let task: CurrentTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      if (p.mode === 'haushalt') {
        const P = onList().reduce((sum, d) => sum + HOME_POWER[d], 0);
        const Ih = householdCurrent(onList());
        show.I = tr('hhI', { P: fmt.num(P, 0), I: fmt.num(Ih, 1) });
        show.fuse = Ih > BREAKER ? ctx.t('hhTrip') : ctx.t('hhOk');
        show.P = tr('hhCost', { c: fmt.num(cost(P, 1), 2) });
        show.info = ctx.t('hhInfo');
      } else if (p.mode === 'schutz') {
        const o = faultOutcome(p.pe, p.fi, touched);
        show.info = !p.fehl ? ctx.t('sOk') : p.pe ? ctx.t('sPe') : !touched ? ctx.t('sWait') : o.rcd ? tr('sRcd', { mA: fmt.num(o.bodyMA, 0) }) : tr('sNoPe', { mA: fmt.num(o.bodyMA, 0) });
        if (p.fehl && touched && !p.pe) show.Ib = tr('IbVal', { I: fmt.num(o.bodyMA, 0), R: '2000' });
      } else if (p.mode === 'vogel') {
        const U = contactVoltage(p.kon as Contact);
        show.info = p.kon === 'eins' ? tr('vEins', { U: fmt.num(U, 3) }) : ctx.t(p.kon === 'zwei' ? 'vZwei' : 'vBoden');
        show.eff = ctx.t('vInfo');
      } else if (p.mode === 'galvanik') {
        const met = p.gmet as Metal;
        const m = platedMass(p.gi, p.gt, met);
        show.I = tr('gMass', { m: fmt.num(m, 2), metal: ctx.t(met), t: fmt.num(p.gt, 0) });
        show.P = tr('gLayer', { d: fmt.num(layerThickness(m, met, 50), 1) });
        show.eff = tr('gPerAh', { m: fmt.num(platedMass(1, 60, met), 2) });
        show.info = ctx.t('gInfo');
      } else if (p.mode === 'kran') {
        const F = holdForce(p.kn, p.ki);
        const G = p.kl * 9.81;
        show.I = tr('kF', { F: fmt.num(F / 1000, 1) });
        show.P = tr('kG', { G: fmt.num(G / 1000, 1) });
        show.fuse = p.ki <= 0 ? ctx.t('kOff') : F > G ? ctx.t('kLift') : ctx.t('kDrop');
        show.info = ctx.t('kInfo');
      } else if (p.mode === 'ueben') {
        show.info = tr('qScore', { k: score.right, n: score.all, s: score.streak });
      } else if (p.mode === 'wirkungen') {
        show.I = tr('IVal', { I: fmt.num(flowing(), 2) });
        show.P = p.kurz ? ctx.t('Pshort') : tr('PVal', { P: fmt.num(blown() ? 0 : power(p.U, dev(), false), 1) });
        show.fuse = blown() ? tr('fuseBlown', { r: p.sich }) : tr('fuseOk', { r: p.sich });
      } else {
        const U = SOURCES[p.quelle]!;
        const mA = bodyCurrent(U, p.nass);
        show.Ib = tr('IbVal', { I: fmt.num(mA, mA < 10 ? 1 : 0), R: p.nass ? '1000' : '3000' });
        show.eff = ctx.t(danger(mA));
        show.fiS = !p.fi ? ctx.t('fiOff') : mA >= RCD_LIMIT ? ctx.t('fiTrip') : ctx.t('fiStay');
      }
      for (const k of ['info', 'I', 'P', 'fuse', 'Ib', 'eff', 'fiS']) ctx.readout(k, show[k] ?? null);
    }

    /* ---------------- Wirkungen ---------------- */
    function drawCircuit(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + r.w * 0.12;
      const x1 = r.x + r.w * 0.62;
      const y0 = r.y + r.h * 0.22;
      const y1 = r.y + r.h * 0.82;
      const wire = th.text;
      const Iflow = flowing();
      const k = Math.max(0.8, Math.min(1.7, Math.min(r.w, r.h) / 380));
      // Leitungen
      g.strokeStyle = wire;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(x0, (y0 + y1) / 2 - 22);
      g.lineTo(x0, y0);
      g.lineTo(x1, y0);
      g.lineTo(x1, (y0 + y1) / 2 - 40 * k);
      g.moveTo(x1, (y0 + y1) / 2 + 40 * k);
      g.lineTo(x1, y1);
      g.lineTo(x0, y1);
      g.lineTo(x0, (y0 + y1) / 2 + 22);
      g.stroke();
      // Quelle
      const cy = (y0 + y1) / 2;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x0 - 18, cy - 8);
      g.lineTo(x0 + 18, cy - 8);
      g.stroke();
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(x0 - 9, cy + 8);
      g.lineTo(x0 + 9, cy + 8);
      g.stroke();
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(x0, cy - 8);
      g.lineTo(x0, cy - 22);
      g.moveTo(x0, cy + 8);
      g.lineTo(x0, cy + 22);
      g.stroke();
      subText(g, `${fmt.num(p.U, 1)} V`, x0 + 24, cy, { size: 13, family: th.font, weight: 700, color: th.text, align: 'left', halo: th.bg });
      // Sicherung (oben)
      const fx = (x0 + x1) / 2;
      g.fillStyle = th.bg;
      g.fillRect(fx - 26, y0 - 9, 52, 18);
      g.strokeStyle = wire;
      g.lineWidth = 1.5;
      g.strokeRect(fx - 26, y0 - 9, 52, 18);
      g.strokeStyle = blown() ? th.series[3]! : wire;
      g.lineWidth = 1.5;
      g.beginPath();
      if (blown()) {
        g.moveTo(fx - 26, y0);
        g.lineTo(fx - 6, y0);
        g.moveTo(fx + 6, y0 + 2);
        g.lineTo(fx + 26, y0);
      } else {
        g.moveTo(fx - 26, y0);
        g.lineTo(fx + 26, y0);
      }
      g.stroke();
      subText(g, `${ctx.t('fuse')} ${p.sich} A`, fx, y0 - 20, { size: 12, family: th.font, weight: 600, color: blown() ? th.series[3]! : th.muted, halo: th.bg });
      // Kurzschlussbrücke
      if (p.kurz) {
        const bx = x1 - 26 * k;
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(x1, cy - 52 * k);
        g.lineTo(bx, cy - 52 * k);
        g.lineTo(bx, cy + 52 * k);
        g.lineTo(x1, cy + 52 * k);
        g.stroke();
        subText(g, ctx.t('short'), bx - 6, cy, { size: 12, family: th.font, weight: 700, color: th.series[3]!, align: 'right', halo: th.bg });
      }
      // Ladungsträger als Punkte (Stromrichtung Plus → Minus)
      if (Iflow > 0) {
        const path: [number, number][] = [
          [x0, cy - 22],
          [x0, y0],
          [x1, y0],
          [x1, y1],
          [x0, y1],
          [x0, cy + 22],
        ];
        const segs = path.slice(1).map((q, i) => Math.hypot(q[0] - path[i]![0], q[1] - path[i]![1]));
        const total = segs.reduce((a, b) => a + b, 0);
        const n = 22;
        g.fillStyle = th.series[0]!;
        for (let k = 0; k < n; k++) {
          let d = ((k / n) * total + t * 40 * Math.min(Iflow, 6)) % total;
          let i = 0;
          while (d > segs[i]!) {
            d -= segs[i]!;
            i++;
          }
          const a = path[i]!;
          const b = path[i + 1]!;
          const u = d / segs[i]!;
          g.beginPath();
          g.arc(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, 3, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.save();
      g.translate(x1, cy);
      g.scale(k, k);
      drawDevice(0, 0);
      g.restore();
      const labels: Record<Device, string> = { lampe: 'light', heiz: 'heat', spule: 'magnet', wasser: 'chem' };
      subText(g, ctx.t(labels[dev()]), r.x + r.w - 10, r.y + 24, { size: 13, family: th.font, weight: 700, color: th.text, align: 'right', halo: th.bg });
    }

    function drawDevice(x: number, cy: number): void {
      const g = surface.g;
      const th = ctx.theme;
      const P = blown() || p.kurz ? 0 : power(p.U, dev(), false);
      const Id = blown() || p.kurz ? 0 : I();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      if (dev() === 'lampe') {
        const a = Math.min(1, P / 12);
        if (a > 0.02) {
          const grd = g.createRadialGradient(x, cy, 4, x, cy, 70);
          grd.addColorStop(0, withAlpha(th.series[2]!, 0.8 * a));
          grd.addColorStop(1, withAlpha(th.series[2]!, 0));
          g.fillStyle = grd;
          g.beginPath();
          g.arc(x, cy, 70, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = withAlpha(th.series[2]!, 0.15 + 0.7 * a);
        g.beginPath();
        g.arc(x, cy, 24, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.beginPath();
        g.moveTo(x - 17, cy - 17);
        g.lineTo(x + 17, cy + 17);
        g.moveTo(x + 17, cy - 17);
        g.lineTo(x - 17, cy + 17);
        g.stroke();
        g.beginPath();
        g.moveTo(x, cy - 40);
        g.lineTo(x, cy - 24);
        g.moveTo(x, cy + 24);
        g.lineTo(x, cy + 40);
        g.stroke();
      } else if (dev() === 'heiz') {
        const a = Math.min(1, P / 30);
        g.strokeStyle = a > 0.05 ? th.series[3]! : th.text;
        g.lineWidth = 2 + 3 * a;
        g.beginPath();
        for (let i = 0; i <= 16; i++) {
          const y = cy - 40 + (i / 16) * 80;
          const xx = x + (i % 2 ? 12 : -12) * (i === 0 || i === 16 ? 0 : 1);
          if (i) g.lineTo(xx, y);
          else g.moveTo(xx, y);
        }
        g.stroke();
        // Wärmewellen
        g.strokeStyle = withAlpha(th.series[3]!, 0.7 * a);
        g.lineWidth = 2;
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          for (let s = 0; s <= 40; s++) {
            const yy = cy - 46 - s * 1.2 - ((t * 30) % 12);
            const xx = x - 16 + k * 16 + 4 * Math.sin(s / 4 + t * 4);
            if (s) g.lineTo(xx, yy);
            else g.moveTo(xx, yy);
          }
          g.stroke();
        }
      } else if (dev() === 'spule') {
        // Eisenkern waagerecht nach rechts
        g.fillStyle = withAlpha(th.muted, 0.5);
        g.fillRect(x - 10, cy - 12, 80, 24);
        g.strokeStyle = th.series[0]!;
        g.lineWidth = 2;
        for (let i = 0; i < 7; i++) {
          g.beginPath();
          g.ellipse(x + 4 + i * 8, cy, 4, 18, 0, 0, Math.PI * 2);
          g.stroke();
        }
        const n = Math.min(10, Math.floor(Id * 6));
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        for (let k = 0; k < n; k++) {
          const cx = x + 74 + (k % 2) * 6;
          const yy = cy - 6 + k * 9;
          g.beginPath();
          g.roundRect(cx, yy, 16, 6, 3);
          g.stroke();
        }
        for (let k = n; k < 10; k++) {
          g.beginPath();
          g.roundRect(x + 60 + (k - n) * 12 + (k % 3) * 3, cy + 64, 16, 6, 3);
          g.stroke();
        }
      } else {
        // Becher mit Salzwasser und zwei Elektroden
        g.fillStyle = withAlpha(th.series[0]!, 0.12);
        g.fillRect(x - 40, cy - 10, 80, 60);
        g.strokeStyle = th.text;
        g.strokeRect(x - 40, cy - 30, 80, 80);
        g.fillStyle = th.text;
        g.fillRect(x - 22, cy - 40, 6, 80);
        g.fillRect(x + 16, cy - 40, 6, 80);
        const n = Math.round(Id * 20);
        g.strokeStyle = th.series[0]!;
        g.lineWidth = 1.2;
        for (let k = 0; k < n; k++) {
          const side = k % 2 ? 1 : -1;
          const bx = x + side * 19 + (hash(k) - 0.5) * 10;
          const by = cy + 46 - ((t * 25 + hash(k + 9) * 60) % 56);
          g.beginPath();
          g.arc(bx, by, 2 + hash(k + 3) * 1.5, 0, Math.PI * 2);
          g.stroke();
        }
      }
    }

    /* ---------------- Gefahr ---------------- */
    function drawDanger(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const U = SOURCES[p.quelle]!;
      const mA = bodyCurrent(U, p.nass);
      const tripped = p.fi && mA >= RCD_LIMIT;
      const d: Danger = danger(mA);
      const colors: Record<Danger, string> = { none: th.series[2]!, tingle: th.series[1]!, cramp: th.series[3]!, deadly: th.series[3]! };
      const wide = r.w > 560;
      const fig: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.5, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h * 0.55 };
      const sc: Rect = wide ? { x: r.x + r.w * 0.52, y: r.y, w: r.w * 0.46, h: r.h } : { x: r.x, y: r.y + r.h * 0.55, w: r.w, h: r.h * 0.45 };
      // Boden
      const gy = fig.y + fig.h - 24;
      g.strokeStyle = th.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(fig.x + 10, gy);
      g.lineTo(fig.x + fig.w - 10, gy);
      g.stroke();
      text(g, ctx.t('ground'), fig.x + fig.w - 12, gy + 12, { font: `600 11px ${th.font}`, color: th.muted, align: 'right' });
      // Mensch (Strichfigur)
      const H = Math.min(fig.h * 0.72, 220);
      const mx = fig.x + fig.w * 0.55;
      const hipY = gy - H * 0.45;
      const shY = gy - H * 0.8;
      const headR = H * 0.08;
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(mx, shY - headR * 1.4, headR, 0, Math.PI * 2);
      g.moveTo(mx, shY - headR * 0.4);
      g.lineTo(mx, hipY);
      g.lineTo(mx - H * 0.12, gy);
      g.moveTo(mx, hipY);
      g.lineTo(mx + H * 0.12, gy);
      g.moveTo(mx, shY);
      g.lineTo(mx + H * 0.15, shY + H * 0.2);
      g.stroke();
      const hand: [number, number] = [mx - H * 0.3, shY - H * 0.12];
      g.beginPath();
      g.moveTo(mx, shY);
      g.lineTo(hand[0], hand[1]);
      g.stroke();
      // Draht unter Spannung
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(fig.x + 10, hand[1]);
      g.lineTo(hand[0] + 4, hand[1]);
      g.stroke();
      subText(g, `${fmt.num(U, U < 10 ? 1 : 0)} V`, fig.x + 14, hand[1] - 14, { size: 13, family: th.font, weight: 700, color: th.series[3]!, align: 'left', halo: th.bg });
      // Stromweg Hand → Füße
      if (!tripped && d !== 'none') {
        g.strokeStyle = withAlpha(colors[d], 0.8);
        g.lineWidth = 2;
        g.setLineDash([6, 5]);
        g.lineDashOffset = -t * 30;
        g.beginPath();
        g.moveTo(hand[0], hand[1]);
        g.lineTo(mx, shY);
        g.lineTo(mx, hipY);
        g.lineTo(mx - H * 0.12, gy);
        g.stroke();
        g.setLineDash([]);
        g.lineDashOffset = 0;
      }
      if (tripped) subText(g, `FI: ${ctx.t('off')}`, fig.x + fig.w / 2, fig.y + 18, { size: 14, family: th.font, weight: 700, color: th.series[2]!, halo: th.bg });

      // Skala (logarithmisch 0,1 … 1000 mA)
      const sx0 = sc.x + 20;
      const sx1 = sc.x + sc.w - 20;
      const sy = sc.y + sc.h * 0.45;
      const X = (v: number) => sx0 + ((Math.log10(Math.max(v, 0.1)) + 1) / 4) * (sx1 - sx0);
      const zones: [number, number, Danger][] = [
        [0.1, 1, 'none'],
        [1, 10, 'tingle'],
        [10, 50, 'cramp'],
        [50, 1000, 'deadly'],
      ];
      for (const [a, b, z] of zones) {
        g.fillStyle = withAlpha(colors[z], z === 'deadly' ? 0.55 : 0.3);
        g.fillRect(X(a), sy - 14, X(b) - X(a), 28);
      }
      g.strokeStyle = th.text;
      g.lineWidth = 1;
      g.strokeRect(sx0, sy - 14, sx1 - sx0, 28);
      for (const v of [0.1, 1, 10, 100, 1000]) {
        g.beginPath();
        g.moveTo(X(v), sy + 14);
        g.lineTo(X(v), sy + 20);
        g.stroke();
        text(g, fmt.num(v, v < 1 ? 1 : 0), X(v), sy + 30, { font: `500 11px ${th.font}`, color: th.muted });
      }
      text(g, ctx.t('scale'), (sx0 + sx1) / 2, sy + 48, { font: `600 12px ${th.font}`, color: th.muted });
      // Markierung
      const mxp = X(Math.min(mA, 1000));
      g.fillStyle = th.text;
      g.beginPath();
      g.moveTo(mxp, sy - 16);
      g.lineTo(mxp - 7, sy - 28);
      g.lineTo(mxp + 7, sy - 28);
      g.closePath();
      g.fill();
      const label = `${fmt.num(mA, mA < 10 ? 1 : 0)} mA: ${ctx.t(d)}`;
      const align: CanvasTextAlign = mxp < sx0 + 80 ? 'left' : mxp > sx1 - 80 ? 'right' : 'center';
      subText(g, label, align === 'left' ? Math.max(sx0, mxp - 10) : align === 'right' ? Math.min(sx1, mxp + 10) : mxp, sy - 40, {
        size: 12,
        family: th.font,
        weight: 700,
        color: th.text,
        align,
        halo: th.bg,
      });
      // 30-mA-Linie des FI-Schalters
      if (p.fi) {
        g.strokeStyle = th.series[2]!;
        g.lineWidth = 2;
        g.setLineDash([4, 3]);
        g.beginPath();
        g.moveTo(X(30), sy - 20);
        g.lineTo(X(30), sy + 20);
        g.stroke();
        g.setLineDash([]);
        text(g, 'FI 30 mA', X(30), sy + 64, { font: `600 11px ${th.font}`, color: th.series[2]! });
      }
    }

    /* ---------- Haushalt ---------- */
    function drawHome(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = r.w < 600;
      const on = onList();
      const Ih = householdCurrent(on);
      const over = Ih > BREAKER;
      if (over) tripped = true;
      const live = !tripped;
      // Steckdosenleiste
      const sx = r.x + 20;
      const sy = r.y + r.h * 0.18;
      const sw = r.w - 40;
      roundRect(g, sx, sy, sw, 40, 8);
      g.fillStyle = withAlpha(th.muted, 0.25);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.stroke();
      const cols = HOME.length;
      const cw = sw / cols;
      HOME.forEach((d, i) => {
        const cx = sx + cw * (i + 0.5);
        const act = on.includes(d);
        g.beginPath();
        g.arc(cx, sy + 20, 12, 0, Math.PI * 2);
        g.fillStyle = act ? (live ? th.series[2]! : th.muted) : th.bg;
        g.fill();
        g.stroke();
        // Kabel und Gerät
        if (act) {
          g.strokeStyle = th.muted;
          g.beginPath();
          g.moveTo(cx, sy + 32);
          g.lineTo(cx, sy + 70);
          g.stroke();
        }
        const dy = sy + 70;
        roundRect(g, cx - cw * 0.38, dy, cw * 0.76, 44, 8);
        g.fillStyle = act ? withAlpha(live ? th.series[1]! : th.muted, live ? 0.25 : 0.15) : withAlpha(th.muted, 0.08);
        g.fill();
        g.strokeStyle = act ? th.text : withAlpha(th.muted, 0.5);
        g.stroke();
        const name =
          ctx.lang === 'de'
            ? { kocher: 'Kocher', foehn: 'Föhn', toaster: 'Toaster', heizer: 'Heizer', lampe: 'Lampe', laden: 'Laden' }[d]
            : { kocher: 'kettle', foehn: 'dryer', toaster: 'toaster', heizer: 'heater', lampe: 'lamp', laden: 'charger' }[d];
        text(g, name, cx, dy + 15, { font: `700 ${narrow ? 9 : 12}px ${th.font}`, color: th.text });
        text(g, `${HOME_POWER[d]} W`, cx, dy + 32, { font: `500 ${narrow ? 9 : 11}px ${th.font}`, color: th.muted });
      });
      // Stromanzeige als Balken bis 16 A
      const by = r.y + r.h * 0.62;
      const bw = r.w - 80;
      const bx = r.x + 40;
      g.fillStyle = withAlpha(th.muted, 0.15);
      g.fillRect(bx, by, bw, 22);
      const frac = Math.min(1.4, Ih / BREAKER) / 1.4;
      g.fillStyle = over ? th.series[1]! : th.series[2]!;
      g.fillRect(bx, by, bw * frac, 22);
      const lim = bx + bw / 1.4;
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(lim, by - 8);
      g.lineTo(lim, by + 30);
      g.stroke();
      text(g, '16 A', lim, by - 16, { font: `700 12px ${th.font}`, color: th.text });
      text(g, `${fmt.num(Ih, 1)} A`, bx + Math.max(30, bw * frac) - 4, by + 11, { font: `700 12px ${th.font}`, color: th.bg, align: 'right' });
      text(g, `${ctx.t('breaker')}: ${tripped ? ctx.t('off') : 'OK'}`, r.x + r.w / 2, r.y + r.h - 24, { font: `800 ${narrow ? 14 : 16}px ${th.font}`, color: tripped ? th.series[1]! : th.series[2]! });
    }

    /* ---------- Schutzleiter ---------- */
    function drawProtect(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = r.w < 600;
      const o = faultOutcome(p.pe, p.fi, touched && p.fehl);
      const off = p.fehl && (p.pe || o.rcd);
      // Gerät mit Metallgehäuse (Waschmaschine)
      const gx = r.x + r.w * 0.38;
      const gy = r.y + r.h * 0.22;
      const gw = Math.min(r.w * 0.28, 170);
      const gh = Math.min(r.h * 0.5, 160);
      roundRect(g, gx, gy, gw, gh, 8);
      g.fillStyle = withAlpha(th.muted, 0.3);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.stroke();
      g.beginPath();
      g.arc(gx + gw / 2, gy + gh * 0.55, Math.min(gw, gh) * 0.28, 0, Math.PI * 2);
      g.stroke();
      text(g, ctx.t('casing'), gx + gw / 2, gy - 10, { font: `600 12px ${th.font}`, color: th.muted });
      // Zuleitung: L (braun), N (blau), PE (grün-gelb) als Theme-Farben
      const lx = r.x + 16;
      const lines: [string, number, string][] = [
        ['L', gy + 20, th.series[3]!],
        ['N', gy + 44, th.series[0]!],
        ['PE', gy + 68, th.series[2]!],
      ];
      for (const [nm, y, col] of lines) {
        if (nm === 'PE' && !p.pe) continue;
        g.strokeStyle = col;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(lx + 30, y);
        g.lineTo(gx, y);
        g.stroke();
        text(g, nm, lx + 10, y, { font: `700 12px ${th.font}`, color: col });
      }
      // Sicherung / FI-Kästchen
      const fx = lx + 40;
      roundRect(g, fx, gy + 8, 46, 24, 4);
      g.fillStyle = off ? withAlpha(th.series[1]!, 0.25) : withAlpha(th.series[2]!, 0.2);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.stroke();
      text(g, p.fi ? 'FI' : '16 A', fx + 23, gy + 20, { font: `700 11px ${th.font}`, color: th.text });
      if (p.pe) {
        // Schutzleiter zur Erde
        g.strokeStyle = th.series[2]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(lx + 30, gy + 68);
        g.lineTo(lx + 30, r.y + r.h - 30);
        g.stroke();
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          g.moveTo(lx + 18 + k * 4, r.y + r.h - 30 + k * 5);
          g.lineTo(lx + 42 - k * 4, r.y + r.h - 30 + k * 5);
          g.stroke();
        }
      }
      // Fehlerstelle
      if (p.fehl) {
        g.strokeStyle = th.series[3]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(gx + 6, gy + 20);
        g.lineTo(gx + 26, gy + 36);
        g.stroke();
        text(g, '⚡', gx + 30, gy + 44, { font: `700 18px ${th.font}`, color: th.series[3]! });
      }
      // Person
      const px = gx + gw + Math.min(70, r.w * 0.12);
      const floor = r.y + r.h - 30;
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(px, gy + 10, 12, 0, Math.PI * 2);
      g.moveTo(px, gy + 22);
      g.lineTo(px, floor - 50);
      g.lineTo(px - 14, floor);
      g.moveTo(px, floor - 50);
      g.lineTo(px + 14, floor);
      g.moveTo(px, gy + 40);
      g.lineTo(touched ? gx + gw : px + 20, touched ? gy + gh * 0.4 : gy + 70);
      g.stroke();
      g.strokeStyle = th.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x + 10, floor);
      g.lineTo(r.x + r.w - 10, floor);
      g.stroke();
      // Strompfad durch den Körper
      if (touched && p.fehl && !p.pe) {
        const dang = o.rcd ? th.series[3]! : th.series[1]!;
        g.strokeStyle = dang;
        g.setLineDash([6, 4]);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(gx + gw, gy + gh * 0.4);
        g.lineTo(px, gy + 40);
        g.lineTo(px, floor - 50);
        g.lineTo(px, floor);
        g.stroke();
        g.setLineDash([]);
        text(g, `${fmt.num(o.bodyMA, 0)} mA`, px + 24, floor - 70, { font: `800 ${narrow ? 13 : 15}px ${th.font}`, color: dang, align: 'left' });
      }
      const verdictTxt = !p.fehl ? 'OK' : p.pe ? ctx.t('off') : !touched ? '…' : o.rcd ? `FI: ${ctx.t('off')}` : ctx.t('deadly');
      text(g, verdictTxt, r.x + r.w / 2, r.y + 18, { font: `800 ${narrow ? 14 : 16}px ${th.font}`, color: !p.fehl || p.pe || o.rcd ? th.series[2]! : th.series[1]! });
    }

    /* ---------- Vogel ---------- */
    function drawBird(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const y1 = r.y + r.h * 0.32;
      const y2 = r.y + r.h * 0.46;
      const floor = r.y + r.h - 24;
      for (const [y, lab] of [
        [y1, 'L1'],
        [y2, 'L2'],
      ] as const) {
        g.strokeStyle = th.text;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(r.x + 20, y);
        g.quadraticCurveTo(r.x + r.w / 2, y + 12, r.x + r.w - 20, y);
        g.stroke();
        text(g, lab, r.x + 12, y - 10, { font: `700 11px ${th.font}`, color: th.muted, align: 'left' });
      }
      const bx = r.x + r.w * 0.45;
      const k = p.kon as Contact;
      const danger0 = k !== 'eins';
      const col = danger0 ? th.series[1]! : th.series[2]!;
      // Vogel (nicht beim Drachen)
      const by = y1 + 5;
      if (k !== 'boden') {
        g.fillStyle = col;
        g.beginPath();
        g.ellipse(bx, by - 14, k === 'zwei' ? 26 : 14, k === 'zwei' ? 18 : 10, 0, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.arc(bx + (k === 'zwei' ? 22 : 12), by - 24, 6, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(bx - 4, by - 6);
        g.lineTo(bx - 4, by);
        g.moveTo(bx + 4, by - 6);
        g.lineTo(bx + 4, by);
        if (k === 'zwei') {
          g.moveTo(bx - 20, by - 8);
          g.lineTo(bx - 34, y2);
        }
        g.stroke();
      }
      if (k === 'boden') {
        // Drache mit Schnur zur Erde
        g.strokeStyle = th.series[1]!;
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(bx + 60, y1 + 4);
        g.lineTo(bx + 120, floor - 40);
        g.stroke();
        g.setLineDash([]);
        g.strokeStyle = th.text;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(bx + 124, floor - 52, 9, 0, Math.PI * 2);
        g.moveTo(bx + 124, floor - 43);
        g.lineTo(bx + 124, floor - 14);
        g.lineTo(bx + 114, floor);
        g.moveTo(bx + 124, floor - 14);
        g.lineTo(bx + 134, floor);
        g.stroke();
      }
      g.strokeStyle = th.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x + 10, floor);
      g.lineTo(r.x + r.w - 10, floor);
      g.stroke();
      const U = contactVoltage(k);
      text(g, `U ≈ ${fmt.num(U, U < 1 ? 3 : 0)} V`, r.x + r.w / 2, r.y + 20, { font: `800 16px ${th.font}`, color: col });
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

    function drawQuiz(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = r.w;
      const H = r.h;
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
      const fs = narrow ? 16 : 20;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 8;
      if (task.choices) {
        g.font = `600 ${narrow ? 14 : 16}px ${th.font}`;
        task.choices.forEach((c, i) => {
          g.fillStyle = p.qa.trim() === String(i + 1) ? th.series[0]! : th.text;
          g.fillText(`${i + 1}  ${c[ctx.lang]}`, pad + 12, y);
          y += narrow ? 22 : 26;
        });
        y += 6;
      }
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: ans }) : ctx.t(task.choices ? 'qHow' : 'qHowNum'), pad, y);
      y += 28;
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
        y += 4;
        if (verdict || tries >= 2) {
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          for (const line of wrap(g, `${ctx.t('qSol')}: ${task.solution[ctx.lang]}`, maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      const n = Math.min(10, score.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 22, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function runCheck(): void {
      const res = checkTask(task, p.qa);
      if (res === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = res;
      tries += 1;
      if (tries === 1) score = { right: score.right + (res ? 1 : 0), all: score.all + 1, streak: res ? score.streak + 1 : 0 };
    }

    /* ---------- Verkupfern ---------- */
    let animT = 0;
    function drawPlating(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const met = p.gmet as Metal;
      const wide = r.w >= 640;
      const scene: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.62, h: r.h } : r;
      const prog = Math.min(1, animT / 6);
      const m = platedMass(p.gi, p.gt * prog, met);
      const metCol = met === 'cu' ? th.series[3]! : met === 'ag' ? th.muted : (th.series[4] ?? th.muted);
      // Becherglas
      const bw = Math.min(scene.w * 0.75, 380);
      const bh = Math.min(scene.h * 0.5, 220);
      const bx = scene.x + (scene.w - bw) / 2;
      const by = scene.y + scene.h - bh - 30;
      g.fillStyle = withAlpha(th.series[0]!, 0.15);
      g.fillRect(bx, by + bh * 0.15, bw, bh * 0.85);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx, by + bh);
      g.lineTo(bx + bw, by + bh);
      g.lineTo(bx + bw, by);
      g.stroke();
      // Elektroden
      const ax = bx + bw * 0.18;
      const kx = bx + bw * 0.78;
      const top = by - 24;
      const bot = by + bh - 20;
      g.fillStyle = metCol;
      g.fillRect(ax - 8, top, 16, bot - top);
      // Schlüssel mit wachsender Schicht
      const coat = Math.min(6, layerThickness(m, met, 50) / 4);
      const keyBody = (pad: number) => {
        g.beginPath();
        g.arc(kx, top + 22, 16 + pad, 0, Math.PI * 2);
        g.rect(kx - 5 - pad, top + 36, 10 + 2 * pad, bot - top - 40 + pad);
        g.rect(kx + 5, bot - 30 - pad, 12 + pad, 8 + 2 * pad);
        g.rect(kx + 5, bot - 14 - pad, 9 + pad, 7 + 2 * pad);
      };
      if (coat > 0.2) {
        keyBody(coat);
        g.fillStyle = metCol;
        g.fill();
      }
      keyBody(0);
      g.fillStyle = th.dark ? withAlpha(th.muted, 0.8) : withAlpha(th.text, 0.35);
      g.fill();
      g.beginPath();
      g.arc(kx, top + 22, 6, 0, Math.PI * 2);
      g.fillStyle = th.bg;
      g.fill();
      // Quelle und Leitungen
      const sy = scene.y + (wide ? 34 : 62);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(ax, top);
      g.lineTo(ax, sy);
      g.lineTo(scene.x + scene.w / 2 - 14, sy);
      g.moveTo(scene.x + scene.w / 2 + 14, sy);
      g.lineTo(kx, sy);
      g.lineTo(kx, top);
      g.stroke();
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(scene.x + scene.w / 2 - 6, sy - 14);
      g.lineTo(scene.x + scene.w / 2 - 6, sy + 14);
      g.stroke();
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(scene.x + scene.w / 2 + 6, sy - 8);
      g.lineTo(scene.x + scene.w / 2 + 6, sy + 8);
      g.stroke();
      text(g, '+', scene.x + scene.w / 2 - 18, sy - 14, { font: `700 13px ${th.font}`, color: th.muted });
      text(g, '−', scene.x + scene.w / 2 + 18, sy - 14, { font: `700 13px ${th.font}`, color: th.muted });
      text(g, `${fmt.num(p.gi, 1)} A`, scene.x + scene.w / 2, sy + 28, { font: `700 12px ${th.font}`, color: th.muted });
      // Ionen wandern zum Minuspol
      const ion = met === 'cu' ? 'Cu²⁺' : met === 'ag' ? 'Ag⁺' : 'Ni²⁺';
      const n = 14;
      const speed = 0.08 + p.gi * 0.08;
      for (let i = 0; i < n; i++) {
        const f = (hash(i) + animT * speed) % 1;
        const x = ax + 14 + f * (kx - ax - 34);
        const y = by + bh * 0.25 + hash(i + 50) * (bh * 0.65);
        g.beginPath();
        g.arc(x, y, 4, 0, Math.PI * 2);
        g.fillStyle = metCol;
        g.fill();
      }
      text(g, ion, (ax + kx) / 2, by + bh * 0.2, { font: `700 12px ${th.font}`, color: th.text });
      text(g, ctx.t('gAnode'), ax, by + bh + 16, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, ctx.t('gKey'), kx, by + bh + 16, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, tr('gAfter', { t: fmt.num(p.gt * prog, 0), m: fmt.num(m, 2) }), r.x + 14, r.y + 18, { font: `800 15px ${th.font}`, color: th.series[2]!, align: 'left' });
      if (wide) {
        // Masse über der Zeit
        const cx0 = r.x + r.w * 0.66;
        const cw = r.w * 0.3;
        const cy0 = r.y + r.h * 0.25;
        const ch = r.h * 0.5;
        const mMax = platedMass(3, 180, met);
        // Vergleich: größter Strom gestrichelt
        g.strokeStyle = withAlpha(th.muted, 0.6);
        g.lineWidth = 1.5;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(cx0, cy0 + ch);
        g.lineTo(cx0 + cw, cy0);
        g.stroke();
        g.setLineDash([]);
        text(g, '3 A', cx0 + cw - 14, cy0 - 10, { font: `500 11px ${th.font}`, color: th.muted });
        text(g, `${fmt.num(mMax, 1)} g`, cx0 - 26, cy0 + 14, { font: `500 11px ${th.font}`, color: th.muted });
        g.strokeStyle = th.muted;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(cx0, cy0);
        g.lineTo(cx0, cy0 + ch);
        g.lineTo(cx0 + cw, cy0 + ch);
        g.stroke();
        g.strokeStyle = metCol;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(cx0, cy0 + ch);
        g.lineTo(cx0 + (cw * p.gt * prog) / 180, cy0 + ch - (ch * m) / mMax);
        g.stroke();
        const ex = cx0 + (cw * p.gt * prog) / 180;
        const ey = cy0 + ch - (ch * m) / mMax;
        g.beginPath();
        g.arc(ex, ey, 4, 0, Math.PI * 2);
        g.fillStyle = metCol;
        g.fill();
        text(g, `${fmt.num(p.gi, 1)} A`, ex + 8, ey - 10, { font: `700 11px ${th.font}`, color: th.text, align: 'left' });
        text(g, 'm', cx0 - 10, cy0, { font: `700 12px ${th.font}`, color: th.muted });
        text(g, 't', cx0 + cw, cy0 + ch + 14, { font: `700 12px ${th.font}`, color: th.muted });
        text(g, '180 min', cx0 + cw - 20, cy0 + ch + 30, { font: `500 11px ${th.font}`, color: th.muted });
      }
    }

    /* ---------- Schrottkran ---------- */
    let craneY = 0;
    function drawCrane(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const wide = r.w >= 640;
      const scene: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.6, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h * 0.68 };
      const F = holdForce(p.kn, p.ki);
      const G = p.kl * 9.81;
      const lifts = p.ki > 0 && F > G;
      const ground = scene.y + scene.h - 16;
      const sc = Math.max(1, Math.min(1.8, scene.h / 320));
      // Ausleger
      const armY = scene.y + 40;
      const cx = scene.x + scene.w * 0.55;
      g.strokeStyle = th.text;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(scene.x + 24, ground);
      g.lineTo(scene.x + 24, armY);
      g.lineTo(cx + 40, armY);
      g.stroke();
      // Magnet: hängt tiefer, hebt bei genug Kraft
      const pileH = (18 + Math.min(40, p.kl / 30)) * sc;
      const low = ground - pileH - 22;
      const high = armY + 60;
      const magY = low - craneY * (low - high);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx, armY);
      g.lineTo(cx, magY - 10);
      g.stroke();
      const on = Math.min(1, (p.kn * p.ki) / 5000);
      const mw = 90 * sc;
      g.fillStyle = th.dark ? withAlpha(th.muted, 0.7) : withAlpha(th.text, 0.6);
      roundRect(g, cx - mw / 2, magY - 10, mw, 22 * sc, 4);
      g.fill();
      if (p.ki > 0) {
        g.fillStyle = withAlpha(th.series[3]!, 0.25 + 0.6 * on);
        g.fillRect(cx - mw / 2 + 6, magY - 6, mw - 12, 6);
        // Feldlinien
        g.strokeStyle = withAlpha(th.series[0]!, 0.25 + 0.5 * on);
        g.lineWidth = 1;
        for (let k = 1; k <= 3; k++) {
          g.beginPath();
          g.ellipse(cx, magY + 12 * sc, mw / 2 - 6, (6 + k * 6 * on) * sc, 0, 0, Math.PI);
          g.stroke();
        }
      }
      // Schrotthaufen
      const pileTop = lifts ? magY + 12 * sc : ground - pileH;
      for (let i = 0; i < 12; i++) {
        const w = (14 + hash(i) * 22) * sc;
        const h = (6 + hash(i + 9) * 8) * sc;
        const x = cx + (-46 + hash(i + 20) * 76) * sc;
        const y = pileTop + hash(i + 30) * (pileH - h);
        g.save();
        g.translate(x + w / 2, y + h / 2);
        g.rotate((hash(i + 40) - 0.5) * 0.8);
        g.fillStyle = withAlpha(th.series[i % 2 === 0 ? 1 : 3]!, 0.55);
        g.fillRect(-w / 2, -h / 2, w, h);
        g.restore();
      }
      g.strokeStyle = th.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(scene.x + 8, ground);
      g.lineTo(scene.x + scene.w - 8, ground);
      g.stroke();
      text(g, `${fmt.num(p.kl, 0)} kg`, cx + mw / 2 + 14, pileTop + pileH / 2, { font: `700 12px ${th.font}`, color: th.muted, align: 'left' });
      const msg = p.ki <= 0 ? ctx.t('kOff') : lifts ? ctx.t('kLift') : ctx.t('kDrop');
      text(g, msg, r.x + 14, r.y + 18, { font: `800 15px ${th.font}`, color: lifts ? th.series[2]! : th.muted, align: 'left' });
      // Balken Kraft gegen Gewicht
      const bars: Rect = wide ? { x: r.x + r.w * 0.64, y: r.y + r.h * 0.3, w: r.w * 0.32, h: r.h * 0.4 } : { x: r.x + 14, y: r.y + r.h * 0.72, w: r.w - 28, h: r.h * 0.24 };
      const max = Math.max(F, G, 1) * 1.1;
      const rows: [string, number, string][] = [
        [ctx.t('kForce'), F, th.series[0]!],
        [ctx.t('kWeight'), G, th.series[1]!],
      ];
      rows.forEach(([lab, v, col], i) => {
        const y = bars.y + i * (bars.h / 2);
        text(g, `${lab}: ${fmt.num(v / 1000, 1)} kN`, bars.x, y + 10, { font: `600 12px ${th.font}`, color: th.text, align: 'left' });
        g.fillStyle = withAlpha(col, 0.75);
        g.fillRect(bars.x, y + 20, (bars.w * v) / max, Math.min(18, bars.h / 2 - 28));
      });
    }

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || ['mode', 'pe', 'fi', 'fehl'].some((k) => changed.has(k))) {
          touched = false;
          tripped = false;
        }
        if (HOME.some((d) => changed.has(d)) && householdCurrent(onList()) <= BREAKER && !tripped) tripped = false;
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
        surface.canvas.setAttribute(
          'aria-label',
          ctx.t(p.mode === 'ueben' ? 'canvasQ' : p.mode === 'gefahr' ? 'canvasG' : p.mode === 'galvanik' ? 'canvasGal' : p.mode === 'kran' ? 'canvasK' : 'canvasW'),
        );
        if (source === 'init' || source === 'replace' || ['mode', 'gmet', 'gi', 'gt'].some((k) => changed.has(k))) animT = 0;
        if (p.mode === 'galvanik' || p.mode === 'kran') {
          if (prefersReducedMotion()) {
            animT = 100;
            craneY = holdForce(p.kn, p.ki) > p.kl * 9.81 && p.ki > 0 ? 1 : 0;
          } else ctx.clock.play();
        }
        updateReadouts();
      },
      action(id) {
        if (id === 'touch') touched = true;
        else if (id === 'reset') {
          touched = false;
          tripped = householdCurrent(onList()) > BREAKER;
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        const h = Math.min(dt, 0.05);
        t += h;
        animT += h;
        if (p.mode === 'kran') {
          const goal = p.ki > 0 && holdForce(p.kn, p.ki) > p.kl * 9.81 ? 1 : 0;
          craneY += Math.sign(goal - craneY) * Math.min(Math.abs(goal - craneY), h * (goal > craneY ? 0.5 : 2));
        }
      },
      resetTime() {
        t = 0;
      },
      render() {
        surface.begin();
        const r = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'haushalt') return drawHome(r);
        if (p.mode === 'schutz') return drawProtect(r);
        if (p.mode === 'vogel') return drawBird(r);
        if (p.mode === 'ueben') return drawQuiz(r);
        if (p.mode === 'galvanik') return drawPlating(r);
        if (p.mode === 'kran') return drawCrane(r);
        if (p.mode === 'gefahr') drawDanger(r);
        else drawCircuit(r);
      },
      destroy: () => surface.destroy(),
    };
  },
});
