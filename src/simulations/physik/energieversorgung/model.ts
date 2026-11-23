/**
 * Rechenlogik „Energieversorgung“.
 *
 * Vier Teile, alle ohne Zeichencode:
 *  1. Kraftwerke: Umwandlungskette mit Wirkungsgraden je Stufe (η = P_ab / P_zu),
 *     Verluste je Stufe, Kraft-Wärme-Kopplung, CO₂ pro kWh (gerundete Beispielwerte).
 *  2. Strommix über einen Tag: Last, Sonne, Wind, Wasser, Biomasse, Kohle, Speicher
 *     und Gaskraftwerke als Ausgleich – in Viertelstunden-Schritten mit exakter Bilanz.
 *  3. Speicher: Pumpspeicher (E = m · g · h) und Batteriespeicher, Lade- und Entladezeit t = E / P.
 *  4. Übertragung: I = P / U und Leitungsverluste P_V = I² · R, idealer Transformator.
 *
 * Alle Zahlen zum Strommix sind **gerundete Beispielwerte** für ein großes
 * Industrieland (Größenordnung wie Deutschland), keine Messdaten.
 */

const L = (de: string, en: string) => ({ de, en });
export type Text = { de: string; en: string };

/** Ortsfaktor in m/s². */
export const G = 9.81;
/** Dichte von Wasser in kg/m³. */
export const RHO_WATER = 1000;
/** 1 kWh in J. */
export const KWH = 3.6e6;
/** 1 MWh in J. */
export const MWH = 3.6e9;
/** Strombedarf eines Haushalts pro Jahr in kWh (gerundeter Beispielwert, 3 Personen). */
export const HOUSEHOLD_YEAR_KWH = 3500;
/** Strombedarf eines Haushalts pro Tag in kWh. */
export const HOUSEHOLD_DAY_KWH = HOUSEHOLD_YEAR_KWH / 365;

/* ------------------------------------------------------------------ */
/* Grundformeln                                                        */
/* ------------------------------------------------------------------ */

/** Energie E = P · t (Einheiten passen zueinander: kW · h → kWh, MW · h → MWh). */
export function energy(power: number, hours: number): number {
  return power * hours;
}

/** Abgegebene Leistung P_ab = η · P_zu. */
export function outputPower(input: number, eta: number): number {
  return input * eta;
}

/** Wirkungsgrad η = P_ab / P_zu (0, wenn nichts zugeführt wird). */
export function efficiency(output: number, input: number): number {
  return input > 0 ? output / input : 0;
}

/** Gesamtwirkungsgrad einer Kette: Produkt der Einzelwirkungsgrade. */
export function chainEfficiency(etas: readonly number[]): number {
  return etas.reduce((a, b) => a * b, 1);
}

/* ------------------------------------------------------------------ */
/* 1. Kraftwerke                                                       */
/* ------------------------------------------------------------------ */

export type PlantId = 'kohle' | 'gas' | 'kern' | 'wind' | 'pv' | 'wasser' | 'bio';
export const PLANT_IDS: readonly PlantId[] = ['kohle', 'gas', 'kern', 'wind', 'pv', 'wasser', 'bio'];

/** Eine Umwandlungsstufe: Gerät, Energieform danach, Wirkungsgrad und Art des Verlusts. */
export interface Stage {
  /** Gerät, z. B. „Dampfturbine“. */
  device: Text;
  /** Energieform nach der Stufe. */
  to: Text;
  eta: number;
  /** Wohin der Rest geht, z. B. „Abwärme“. */
  loss: Text;
  /** Kurze Erklärung der Stufe. */
  info: Text;
}

export interface Plant {
  id: PlantId;
  name: Text;
  short: Text;
  /** Energieform am Eingang. */
  primary: Text;
  /** Art der Energieform am Eingang (für die Farbe im Energieflussdiagramm). */
  primaryKind: FormKind;
  /** Energieträger bzw. Quelle. */
  carrier: Text;
  renewable: boolean;
  /** Lässt sich nach Bedarf hoch- und herunterfahren (regelbar). */
  dispatchable: boolean;
  /** CO₂-Äquivalente über den Lebenszyklus in g pro kWh (gerundet, Median nach IPCC 2014). */
  co2: number;
  stages: Stage[];
  /** Anteil der Verluste der Hauptstufe, der bei Kraft-Wärme-Kopplung als Heizwärme genutzt wird (0 = keine KWK). */
  chp: number;
  /** Index der Hauptstufe (Turbine bzw. Motor), deren Abwärme bei KWK genutzt wird. */
  chpStage: number;
  /** Kurze Einordnung. */
  note: Text;
}

/** Art einer Energieform (bestimmt die Farbe im Energieflussdiagramm). */
export type FormKind = 'chem' | 'nuc' | 'wind' | 'rad' | 'pot' | 'heat' | 'mech' | 'elec';

const ELEC = L('elektrische Energie', 'electrical energy');
const HEAT = L('thermische Energie', 'thermal energy');
const MECH = L('Rotationsenergie', 'rotational energy');
const GEN = (eta: number): Stage => ({
  device: L('Generator', 'Generator'),
  to: ELEC,
  eta,
  loss: L('Wärme (Reibung, Strom in den Spulen)', 'heat (friction, current in the coils)'),
  info: L('Induktion: Der drehende Läufer erzeugt Wechselspannung.', 'Induction: the rotating rotor generates an alternating voltage.'),
});
const OWN = (eta: number): Stage => ({
  device: L('Eigenbedarf, Transformator', 'Own use, transformer'),
  to: ELEC,
  eta,
  loss: L('Pumpen, Lüfter, Trafo-Wärme', 'pumps, fans, transformer heat'),
  info: L('Das Kraftwerk braucht selbst Strom; der Transformator bringt die Spannung aufs Netzniveau.', 'The plant needs some electricity itself; the transformer raises the voltage to grid level.'),
});

/**
 * Kraftwerkstypen mit gerundeten Beispielwerten. Die Wirkungsgrade sind typische
 * Größenordnungen moderner Anlagen, die CO₂-Werte Lebenszyklus-Mediane nach
 * IPCC (2014), Anhang III, gerundet.
 */
export const PLANTS: Record<PlantId, Plant> = {
  kohle: {
    id: 'kohle',
    name: L('Kohlekraftwerk', 'Coal power plant'),
    short: L('Kohle', 'Coal'),
    primary: L('chemische Energie', 'chemical energy'),
    primaryKind: 'chem',
    carrier: L('Steinkohle', 'hard coal'),
    renewable: false,
    dispatchable: true,
    co2: 820,
    stages: [
      { device: L('Kessel (Verbrennung)', 'Boiler (combustion)'), to: HEAT, eta: 0.9, loss: L('Abgas', 'flue gas'), info: L('Kohle verbrennt, Wasser wird zu heißem Dampf (etwa 600 °C).', 'Coal burns and water turns into hot steam (about 600 °C).') },
      { device: L('Dampfturbine', 'Steam turbine'), to: MECH, eta: 0.47, loss: L('Abwärme (Kühlturm, Fluss)', 'waste heat (cooling tower, river)'), info: L('Der Dampf dreht die Turbine. Danach muss er abgekühlt werden – hier geht die meiste Energie verloren.', 'The steam turns the turbine. Afterwards it has to be cooled – this is where most energy is lost.') },
      GEN(0.98),
      OWN(0.96),
    ],
    chp: 0.55,
    chpStage: 1,
    note: L('erschöpfbar, regelbar, viel CO₂', 'finite, dispatchable, lots of CO₂'),
  },
  gas: {
    id: 'gas',
    name: L('Gas-und-Dampf-Kraftwerk', 'Combined-cycle gas plant'),
    short: L('Gas', 'Gas'),
    primary: L('chemische Energie', 'chemical energy'),
    primaryKind: 'chem',
    carrier: L('Erdgas', 'natural gas'),
    renewable: false,
    dispatchable: true,
    co2: 490,
    stages: [
      { device: L('Brennkammer', 'Combustion chamber'), to: HEAT, eta: 0.97, loss: L('Wärmeverluste (an die Umgebung)', 'heat losses (to the surroundings)'), info: L('Erdgas verbrennt mit Luft zu sehr heißem Abgas.', 'Natural gas burns with air to form very hot exhaust gas.') },
      { device: L('Gas- und Dampfturbine', 'Gas and steam turbine'), to: MECH, eta: 0.62, loss: L('Abwärme', 'waste heat'), info: L('Erst treibt das heiße Gas eine Gasturbine an, seine Restwärme dann noch eine Dampfturbine.', 'First the hot gas drives a gas turbine, then its remaining heat drives a steam turbine.') },
      GEN(0.985),
      OWN(0.98),
    ],
    chp: 0.6,
    chpStage: 1,
    note: L('erschöpfbar, schnell regelbar, mittlerer CO₂-Ausstoß', 'finite, quickly adjustable, medium CO₂'),
  },
  kern: {
    id: 'kern',
    name: L('Kernkraftwerk', 'Nuclear power plant'),
    short: L('Kern', 'Nuclear'),
    primary: L('Kernenergie', 'nuclear energy'),
    primaryKind: 'nuc',
    carrier: L('Uran', 'uranium'),
    renewable: false,
    dispatchable: true,
    co2: 12,
    stages: [
      { device: L('Reaktor (Kernspaltung)', 'Reactor (nuclear fission)'), to: HEAT, eta: 0.99, loss: L('Wärmeverluste (an die Umgebung)', 'heat losses (to the surroundings)'), info: L('Uran-Kerne werden gespalten; die frei werdende Energie erhitzt Wasser.', 'Uranium nuclei are split; the released energy heats water.') },
      { device: L('Dampfturbine', 'Steam turbine'), to: MECH, eta: 0.35, loss: L('Abwärme (Kühlturm, Fluss)', 'waste heat (cooling tower, river)'), info: L('Der Dampf ist kühler als im Kohlekraftwerk – deshalb ist der Wirkungsgrad kleiner.', 'The steam is cooler than in a coal plant – so the efficiency is lower.') },
      GEN(0.98),
      OWN(0.95),
    ],
    chp: 0,
    chpStage: 1,
    note: L('erschöpfbar, kaum CO₂, radioaktiver Abfall', 'finite, hardly any CO₂, radioactive waste'),
  },
  wind: {
    id: 'wind',
    name: L('Windkraftanlage', 'Wind turbine'),
    short: L('Wind', 'Wind'),
    primary: L('Bewegungsenergie des Windes', 'kinetic energy of the wind'),
    primaryKind: 'wind',
    carrier: L('Wind', 'wind'),
    renewable: true,
    dispatchable: false,
    co2: 11,
    stages: [
      { device: L('Rotor', 'Rotor'), to: MECH, eta: 0.46, loss: L('Restwind (hinter dem Rotor)', 'remaining wind (behind the rotor)'), info: L('Der Wind wird abgebremst, aber nicht gestoppt: Höchstens 59 % lassen sich nutzen (Betz-Grenze).', 'The wind is slowed down, not stopped: at most 59 % can be used (Betz limit).') },
      { device: L('Getriebe', 'Gearbox'), to: MECH, eta: 0.97, loss: L('Reibung', 'friction'), info: L('Das Getriebe macht aus der langsamen Rotordrehung eine schnelle Drehung.', 'The gearbox turns the slow rotation of the rotor into a fast one.') },
      GEN(0.96),
      { device: L('Umrichter, Transformator', 'Converter, transformer'), to: ELEC, eta: 0.97, loss: L('Wärme', 'heat'), info: L('Die Spannung wird ans Netz angepasst (Frequenz 50 Hz).', 'The voltage is matched to the grid (frequency 50 Hz).') },
    ],
    chp: 0,
    chpStage: 0,
    note: L('regenerativ, wetterabhängig, kaum CO₂', 'renewable, weather-dependent, hardly any CO₂'),
  },
  pv: {
    id: 'pv',
    name: L('Photovoltaik-Anlage', 'Photovoltaic system'),
    short: L('Sonne', 'Solar'),
    primary: L('Strahlungsenergie der Sonne', 'radiant energy of the sun'),
    primaryKind: 'rad',
    carrier: L('Sonnenlicht', 'sunlight'),
    renewable: true,
    dispatchable: false,
    co2: 48,
    stages: [
      { device: L('Solarzelle', 'Solar cell'), to: L('elektrische Energie (Gleichstrom)', 'electrical energy (direct current)'), eta: 0.21, loss: L('Wärme, Reflexion', 'heat, reflection'), info: L('Licht setzt im Silizium Elektronen frei – ohne bewegte Teile.', 'Light frees electrons in the silicon – without moving parts.') },
      { device: L('Wechselrichter', 'Inverter'), to: ELEC, eta: 0.97, loss: L('Wärme', 'heat'), info: L('Aus Gleichspannung wird Wechselspannung für das Netz.', 'Direct voltage is turned into alternating voltage for the grid.') },
      { device: L('Leitungen, Transformator', 'Cables, transformer'), to: ELEC, eta: 0.98, loss: L('Wärme', 'heat'), info: L('Die Spannung wird angehoben und ins Netz eingespeist.', 'The voltage is raised and fed into the grid.') },
    ],
    chp: 0,
    chpStage: 0,
    note: L('regenerativ, nur tagsüber, wenig CO₂', 'renewable, daytime only, little CO₂'),
  },
  wasser: {
    id: 'wasser',
    name: L('Wasserkraftwerk', 'Hydroelectric power plant'),
    short: L('Wasser', 'Hydro'),
    primary: L('Lage- und Bewegungsenergie des Wassers', 'potential and kinetic energy of water'),
    primaryKind: 'pot',
    carrier: L('Fluss', 'river'),
    renewable: true,
    dispatchable: true,
    co2: 24,
    stages: [
      { device: L('Wasserturbine', 'Water turbine'), to: MECH, eta: 0.92, loss: L('Reibung, Verwirbelung', 'friction, turbulence'), info: L('Das herabströmende Wasser dreht die Turbine.', 'The water flowing down turns the turbine.') },
      GEN(0.97),
      { device: L('Transformator', 'Transformer'), to: ELEC, eta: 0.99, loss: L('Wärme', 'heat'), info: L('Die Spannung wird auf Netzniveau gebracht.', 'The voltage is brought up to grid level.') },
    ],
    chp: 0,
    chpStage: 0,
    note: L('regenerativ, regelbar, aber nur wenige Standorte', 'renewable, dispatchable, but only few sites'),
  },
  bio: {
    id: 'bio',
    name: L('Biogas-Blockheizkraftwerk', 'Biogas combined heat and power plant'),
    short: L('Biomasse', 'Biomass'),
    primary: L('chemische Energie', 'chemical energy'),
    primaryKind: 'chem',
    carrier: L('Biogas aus Pflanzen und Gülle', 'biogas from plants and manure'),
    renewable: true,
    dispatchable: true,
    co2: 230,
    stages: [
      { device: L('Gasmotor', 'Gas engine'), to: MECH, eta: 0.42, loss: L('Abwärme', 'waste heat'), info: L('Biogas verbrennt im Motor und treibt die Welle an.', 'Biogas burns in the engine and drives the shaft.') },
      GEN(0.96),
      OWN(0.93),
    ],
    chp: 0.65,
    chpStage: 0,
    note: L('regenerativ, regelbar, braucht Ackerfläche', 'renewable, dispatchable, needs farmland'),
  },
};

/** Art der Energieform nach einer Stufe. */
export function stageKind(stage: Stage): FormKind {
  return stage.to === HEAT ? 'heat' : stage.to === MECH ? 'mech' : 'elec';
}

/** Ein Abschnitt der Umwandlungskette (für das Energieflussdiagramm). */
export interface ChainStep {
  stage: Stage;
  /** Leistung vor und nach der Stufe in MW. */
  pin: number;
  pout: number;
  /** Verlust der Stufe (pin − pout) in MW. */
  loss: number;
  /** Davon als Heizwärme genutzt (Kraft-Wärme-Kopplung) in MW. */
  heat: number;
}

export interface ChainResult {
  pin: number;
  steps: ChainStep[];
  /** Elektrische Leistung am Ende in MW. */
  pel: number;
  /** Elektrischer Gesamtwirkungsgrad. */
  eta: number;
  /** Genutzte Heizwärme (KWK) in MW. */
  heat: number;
  /** Summe der nicht genutzten Verluste in MW. */
  lost: number;
  /** Gesamtnutzungsgrad (Strom + genutzte Wärme) / zugeführte Leistung. */
  usage: number;
}

/** Umwandlungskette eines Kraftwerks für die zugeführte Leistung pin (MW), wahlweise mit Kraft-Wärme-Kopplung. */
export function plantChain(id: PlantId, pin: number, chp = false): ChainResult {
  const plant = PLANTS[id];
  let p = pin;
  let heat = 0;
  const steps: ChainStep[] = plant.stages.map((stage, i) => {
    const out = outputPower(p, stage.eta);
    const loss = p - out;
    const used = chp && plant.chp > 0 && i === plant.chpStage ? loss * plant.chp : 0;
    heat += used;
    const step = { stage, pin: p, pout: out, loss, heat: used };
    p = out;
    return step;
  });
  const lost = steps.reduce((s, q) => s + q.loss, 0) - heat;
  return { pin, steps, pel: p, eta: efficiency(p, pin), heat, lost, usage: efficiency(p + heat, pin) };
}

/** CO₂ in kg für die elektrische Energie e (in kWh) bei g pro kWh. */
export function co2Kg(eKWh: number, gPerKWh: number): number {
  return (eKWh * gPerKWh) / 1000;
}

/** Wie viele Haushalte ein Jahr lang mit e (in kWh) versorgt werden. */
export function householdsYear(eKWh: number): number {
  return eKWh / HOUSEHOLD_YEAR_KWH;
}

/* ------------------------------------------------------------------ */
/* 2. Strommix über einen Tag                                          */
/* ------------------------------------------------------------------ */

export type Season = 'sommer' | 'winter';

/** Installierte Leistungen und feste Erzeuger im Beispielland (GW, gerundete Beispielwerte). */
export const MIX = {
  pvInstalled: 80,
  windInstalled: 70,
  hydro: 2,
  bio: 4.5,
};

/** Sonnenaufgang, -untergang (Ortszeit, h) und Höchstwert der PV-Leistung (Anteil der installierten) je Jahreszeit. */
export const SUN: Record<Season, { rise: number; set: number; peak: number }> = {
  sommer: { rise: 5.2, set: 21.4, peak: 0.7 },
  winter: { rise: 8.2, set: 16.4, peak: 0.26 },
};

/** Glockenkurve um m mit Breite s, periodisch über 24 h fortgesetzt. */
function bump(h: number, m: number, s: number): number {
  let d = Math.abs(h - m) % 24;
  if (d > 12) d = 24 - d;
  return Math.exp(-0.5 * (d / s) ** 2);
}

/** Last (Strombedarf) in GW um h Uhr: nachts niedrig, mittags und abends Spitzen; im Winter höher. */
export function load(h: number, season: Season): number {
  if (season === 'winter') return 52 + 13 * bump(h, 11.5, 3.6) + 13 * bump(h, 18, 1.9) + 3 * bump(h, 8, 1.2);
  return 46 + 15 * bump(h, 12, 3.9) + 5 * bump(h, 19.5, 1.8) + 2 * bump(h, 8.5, 1.3);
}

/** PV-Leistung in GW um h Uhr bei sun (0 … 1: Anteil ungestörter Einstrahlung). */
export function solar(h: number, season: Season, sun: number): number {
  const s = SUN[season];
  if (h <= s.rise || h >= s.set) return 0;
  const x = Math.sin((Math.PI * (h - s.rise)) / (s.set - s.rise));
  return MIX.pvInstalled * s.peak * sun * x ** 1.35;
}

/**
 * Windleistung in GW um h Uhr bei der Windstärke wind (0 … 1). Ein Wetterwechsel
 * über den Tag und Böen (feste Folge, damit der Tag reproduzierbar ist).
 */
export function windPower(h: number, season: Season, wind: number): number {
  const ph = season === 'winter' ? 1.3 : 0.2;
  const drift = 0.22 * Math.sin((2 * Math.PI * h) / 24 + ph) + 0.1 * Math.sin((2 * Math.PI * h) / 7.3 + 2 * ph);
  const gust = 0.06 * Math.sin(h * 2.9 + ph * 3) + 0.04 * Math.sin(h * 5.3 + 1);
  const cf = wind * 0.86 * (1 + drift + gust);
  return MIX.windInstalled * Math.max(0, Math.min(0.92, cf));
}

export interface MixParams {
  season: Season;
  /** Sonnenschein 0 … 1. */
  sun: number;
  /** Windstärke 0 … 1. */
  wind: number;
  /** Kohle in Grundlast (GW), läuft den ganzen Tag gleichmäßig. */
  base: number;
  /** Speicher: Kapazität in GWh und höchste Lade-/Entladeleistung in GW. */
  cap: number;
  power: number;
  /** Füllstand des Speichers um 0 Uhr (0 … 1). */
  soc0?: number;
}

/** Wirkungsgrad beim Laden bzw. Entladen des Speichers (zusammen 0,9 · 0,9 = 0,81). */
export const STORE_ETA = 0.9;

/** Ein Viertelstunden-Schritt des Tagesmodells (Leistungen in GW, Füllstand in GWh). */
export interface MixStep {
  h: number;
  load: number;
  pv: number;
  wind: number;
  hydro: number;
  bio: number;
  coal: number;
  /** Entladen des Speichers (ins Netz). */
  discharge: number;
  /** Gaskraftwerke als Ausgleich. */
  gas: number;
  /** Laden des Speichers (aus dem Netz). */
  charge: number;
  /** Überschuss, der exportiert oder abgeregelt werden muss. */
  surplus: number;
  /** Füllstand am Ende des Schritts. */
  soc: number;
}

export interface MixDay {
  steps: MixStep[];
  dt: number;
  /** Energien über den Tag in GWh. */
  totals: { load: number; pv: number; wind: number; hydro: number; bio: number; coal: number; discharge: number; gas: number; charge: number; surplus: number };
  /** Anteil erneuerbarer Erzeugung (ohne Überschuss) an der Last. */
  renewShare: number;
  /** CO₂ in t über den Tag (Lebenszyklus-Werte der Erzeuger). */
  co2: number;
  /** Mittlere CO₂-Intensität des verbrauchten Stroms in g/kWh. */
  intensity: number;
  /** Größte Leistung der Gaskraftwerke in GW. */
  gasPeak: number;
}

/** Schritte pro Tag (Viertelstunden). */
export const STEPS_PER_DAY = 96;

/**
 * Tagesverlauf: Erst speisen Sonne, Wind, Wasser, Biomasse und Kohle ein. Ein
 * Überschuss lädt den Speicher (Rest: Export/Abregelung), ein Defizit entlädt
 * ihn; was dann noch fehlt, decken Gaskraftwerke. In jedem Schritt gilt
 *   pv + wind + hydro + bio + coal + discharge + gas − charge − surplus = load.
 */
export function simulateDay(prm: MixParams): MixDay {
  const dt = 24 / STEPS_PER_DAY;
  let soc = Math.max(0, Math.min(1, prm.soc0 ?? 0.5)) * prm.cap;
  const steps: MixStep[] = [];
  const totals = { load: 0, pv: 0, wind: 0, hydro: 0, bio: 0, coal: 0, discharge: 0, gas: 0, charge: 0, surplus: 0 };
  let gasPeak = 0;
  for (let i = 0; i < STEPS_PER_DAY; i++) {
    const h = (i + 0.5) * dt;
    const ld = load(h, prm.season);
    const pv = solar(h, prm.season, prm.sun);
    const wd = windPower(h, prm.season, prm.wind);
    const fixed = pv + wd + MIX.hydro + MIX.bio + prm.base;
    const residual = ld - fixed;
    let charge = 0;
    let discharge = 0;
    let gas = 0;
    let surplus = 0;
    if (residual < 0) {
      const room = (prm.cap - soc) / (STORE_ETA * dt);
      charge = Math.max(0, Math.min(prm.power, -residual, room));
      soc += charge * STORE_ETA * dt;
      surplus = -residual - charge;
    } else {
      const avail = (soc * STORE_ETA) / dt;
      discharge = Math.max(0, Math.min(prm.power, residual, avail));
      soc -= (discharge / STORE_ETA) * dt;
      gas = residual - discharge;
    }
    soc = Math.max(0, Math.min(prm.cap, soc));
    gasPeak = Math.max(gasPeak, gas);
    const st: MixStep = { h, load: ld, pv, wind: wd, hydro: MIX.hydro, bio: MIX.bio, coal: prm.base, discharge, gas, charge, surplus, soc };
    steps.push(st);
    for (const k of Object.keys(totals) as (keyof typeof totals)[]) totals[k] += st[k] * dt;
  }
  // Erneuerbar: Was davon tatsächlich genutzt wird (Überschuss geht ab; anteilig auf die Erzeuger umgelegt)
  const supply = totals.pv + totals.wind + totals.hydro + totals.bio + totals.coal;
  const used = supply > 0 ? 1 - totals.surplus / supply : 1;
  const renew = (totals.pv + totals.wind + totals.hydro + totals.bio) * used;
  const renewShare = totals.load > 0 ? Math.min(1, renew / totals.load) : 0;
  // CO₂: 1 GWh = 10⁶ kWh; g/kWh · 10⁶ kWh = t
  const f = PLANTS;
  const co2 = (totals.pv * f.pv.co2 + totals.wind * f.wind.co2 + totals.hydro * f.wasser.co2 + totals.bio * f.bio.co2 + totals.coal * f.kohle.co2) * used + totals.gas * f.gas.co2;
  const intensity = totals.load > 0 ? co2 / totals.load : 0;
  return { steps, dt, totals, renewShare, co2, intensity, gasPeak };
}

/** Schritt zur Uhrzeit h (0 … 24). */
export function stepAt(day: MixDay, h: number): MixStep {
  const i = Math.max(0, Math.min(day.steps.length - 1, Math.floor(h / day.dt)));
  return day.steps[i]!;
}

/** Bilanzfehler eines Schritts (sollte 0 sein). */
export function balanceError(st: MixStep): number {
  return st.pv + st.wind + st.hydro + st.bio + st.coal + st.discharge + st.gas - st.charge - st.surplus - st.load;
}

/* ------------------------------------------------------------------ */
/* 3. Speicher                                                         */
/* ------------------------------------------------------------------ */

/** Masse von Wasser in kg für das Volumen V in m³. */
export function waterMass(volume: number): number {
  return RHO_WATER * volume;
}

/** Lageenergie E = m · g · h in J. */
export function potentialEnergy(mass: number, height: number): number {
  return mass * G * height;
}

/** Joule in MWh. */
export function toMWh(joule: number): number {
  return joule / MWH;
}

/** Wirkungsgrade eines Pumpspeicherkraftwerks: Pumpen und Turbinieren (zusammen rund 75 %). */
export const PUMP_ETA = { pump: 0.87, turbine: 0.87 };
/** Wirkungsgrade eines Batteriespeichers: Laden und Entladen (zusammen rund 90 %). */
export const BATT_ETA = { charge: 0.95, discharge: 0.95 };

export interface PumpStorage {
  /** Wassermasse in kg. */
  mass: number;
  /** Gespeicherte Lageenergie in J und MWh. */
  joule: number;
  mwh: number;
  /** Beim Entladen abgegebene elektrische Energie in MWh. */
  outMWh: number;
  /** Zum Hochpumpen nötige elektrische Energie in MWh. */
  inMWh: number;
  /** Gesamtwirkungsgrad (Strom raus / Strom rein). */
  roundTrip: number;
}

/** Pumpspeicher mit dem Volumen V (Mio. m³) und der Fallhöhe h (m). */
export function pumpStorage(volumeMio: number, height: number): PumpStorage {
  const mass = waterMass(volumeMio * 1e6);
  const joule = potentialEnergy(mass, height);
  const mwh = toMWh(joule);
  return { mass, joule, mwh, outMWh: mwh * PUMP_ETA.turbine, inMWh: mwh / PUMP_ETA.pump, roundTrip: PUMP_ETA.pump * PUMP_ETA.turbine };
}

export interface Battery {
  /** Gespeicherte Energie (Kapazität) in MWh. */
  mwh: number;
  outMWh: number;
  inMWh: number;
  roundTrip: number;
}

export function battery(capMWh: number): Battery {
  return { mwh: capMWh, outMWh: capMWh * BATT_ETA.discharge, inMWh: capMWh / BATT_ETA.charge, roundTrip: BATT_ETA.charge * BATT_ETA.discharge };
}

/** Dauer t = E / P in h (E in MWh, P in MW). */
export function duration(eMWh: number, powerMW: number): number {
  return powerMW > 0 ? eMWh / powerMW : Infinity;
}

/** Höhe, die für die Energie e (MWh) bei der Wassermenge V (Mio. m³) nötig ist: h = E / (m · g). */
export function heightFor(eMWh: number, volumeMio: number): number {
  return (eMWh * MWH) / (waterMass(volumeMio * 1e6) * G);
}

/* ------------------------------------------------------------------ */
/* 4. Übertragung                                                      */
/* ------------------------------------------------------------------ */

/** Widerstand der Leitung (Hin- und Rückleiter zusammen) pro km in Ω (Beispielwert). */
export const R_PER_KM = 0.1;

/** Übliche Spannungsebenen in kV. */
export const VOLTAGE_LEVELS = [0.4, 10, 20, 110, 220, 380] as const;

/** Stromstärke I = P / U (P in W, U in V → A). */
export function current(power: number, voltage: number): number {
  return voltage > 0 ? power / voltage : Infinity;
}

/** Leitungsverlust P_V = I² · R (in W). */
export function lineLoss(i: number, r: number): number {
  return i * i * r;
}

export interface Transmission {
  /** Stromstärke in A. */
  current: number;
  /** Widerstand der Leitung in Ω. */
  r: number;
  /** Verlustleistung in MW. */
  loss: number;
  /** Anteil der Verluste an der eingespeisten Leistung. */
  share: number;
  /** Am Ende ankommende Leistung in MW. */
  arrive: number;
  /** Spannungsabfall an der Leitung U = I · R in kV. */
  drop: number;
}

/**
 * Übertragung der Leistung P (MW) bei der Spannung U (kV) über len km.
 * Vereinfachte Rechnung wie im Unterricht (eine Leitung mit Widerstand R,
 * Gleich- bzw. Einphasenwechselstrom). Ist der Verlust größer als P, kommt nichts an.
 */
export function transmit(pMW: number, uKV: number, lenKm: number, rPerKm = R_PER_KM): Transmission {
  const r = lenKm * rPerKm;
  const i = current(pMW * 1e6, uKV * 1e3);
  const loss = lineLoss(i, r) / 1e6;
  return { current: i, r, loss, share: pMW > 0 ? loss / pMW : 0, arrive: Math.max(0, pMW - loss), drop: (i * r) / 1e3 };
}

/** Verhältnis der Verluste bei gleicher Leistung und gleichem R: P_V1 / P_V2 = (U2 / U1)². */
export function lossRatio(u1: number, u2: number): number {
  return (u2 / u1) ** 2;
}

/** Idealer Transformator: U2 = U1 · N2 / N1 und I2 = I1 · N1 / N2. */
export function transformer(u1: number, i1: number, n1: number, n2: number): { u2: number; i2: number } {
  return { u2: (u1 * n2) / n1, i2: (i1 * n1) / n2 };
}

/** „Schöne“ Schrittweite (1, 2, 2,5, 5 · 10^k) von mindestens x. */
export function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const q = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
  return 10 * q;
}
