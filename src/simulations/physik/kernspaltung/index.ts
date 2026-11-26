import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  chain,
  CHANNELS,
  channelEnergy,
  checkTask,
  coalEquivalent,
  curve,
  fissionEnergy,
  fusionEnergy,
  householdYears,
  makeTask,
  massDefect,
  multiplication,
  REACTIONS,
  uraniumHeat,
  type NuclearTask,
  type ReactionId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const NU = 2.5;
const COLS = 16;
const ROWS = 9;
const MAXGEN = 10;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Kleiner, reproduzierbarer Zufallsgenerator. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Kernspaltung und Kernfusion: Bindungsenergie pro Nukleon mit Spaltung und
 * Fusion, Kettenreaktion Generation für Generation mit Steuerstäben.
 */
export default defineSimulation({
  id: 'kernspaltung',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'bindung', label: L('Bindungsenergie: Spaltung und Fusion', 'Binding energy: fission and fusion') },
        { value: 'kette', label: L('Kettenreaktion', 'Chain reaction') },
        { value: 'spaltung', label: L('Eine Spaltung in Zeitlupe', 'One fission in slow motion') },
        { value: 'masse', label: L('Massendefekt: E = m·c²', 'Mass defect: E = m·c²') },
        { value: 'kraftwerk', label: L('Kraftwerk: Uran oder Kohle?', 'Power plant: uranium or coal?') },
        { value: 'ueben', label: L('Üben: Aufgaben', 'Practice: tasks') },
      ],
      default: 'bindung',
      display: 'menu',
    },
    {
      key: 'ch',
      type: 'choice',
      label: L('Spaltprodukte', 'Fission products'),
      options: [
        { value: 'baKr', label: L('Barium-141 + Krypton-92', 'barium-141 + krypton-92') },
        { value: 'xeSr', label: L('Xenon-140 + Strontium-94', 'xenon-140 + strontium-94') },
        { value: 'csRb', label: L('Cäsium-137 + Rubidium-97', 'caesium-137 + rubidium-97') },
        { value: 'teZr', label: L('Tellur-134 + Zirkonium-100', 'tellurium-134 + zirconium-100') },
      ],
      default: 'baKr',
      display: 'menu',
      visibleIf: (v) => v.mode === 'spaltung',
    },
    {
      key: 're',
      type: 'choice',
      label: L('Reaktion', 'Reaction'),
      options: [
        { value: 'spaltung', label: L('Kernspaltung von Uran', 'fission of uranium') },
        { value: 'dt', label: L('Fusion von Deuterium und Tritium', 'fusion of deuterium and tritium') },
        { value: 'sonne', label: L('Fusion in der Sonne', 'fusion in the Sun') },
      ],
      default: 'spaltung',
      display: 'menu',
      visibleIf: (v) => v.mode === 'masse',
    },
    { key: 'g', type: 'number', label: L('Gespaltenes Uran-235', 'Uranium-235 split'), min: 1, max: 1000, step: 1, default: 1, unit: 'g', visibleIf: (v) => v.mode === 'kraftwerk' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 10, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
    { key: 'A', type: 'number', label: L('Massenzahl A', 'Mass number A'), min: 2, max: 240, step: 1, default: 235, visibleIf: (v) => v.mode === 'bindung' },
    {
      key: 'stab',
      type: 'number',
      label: L('Steuerstäbe: absorbierte Neutronen', 'Control rods: absorbed neutrons'),
      min: 0,
      max: 90,
      step: 5,
      default: 40,
      unit: '%',
      visibleIf: (v) => v.mode === 'kette',
    },
    { key: 'leck', type: 'number', label: L('Neutronen, die entweichen', 'Neutrons escaping'), min: 0, max: 80, step: 5, default: 30, unit: '%', visibleIf: (v) => v.mode === 'kette' },
  ],
  hint: (v) =>
    v.mode === 'spaltung'
      ? L(
          'Drücke Start: Das Neutron wird eingefangen, der Kern schwingt, verformt sich und zerplatzt in zwei Bruchstücke und einige Neutronen.',
          'Press play: the neutron is captured, the nucleus oscillates, deforms and bursts into two fragments and a few neutrons.',
        )
      : v.mode === 'masse'
        ? L(
            'Nach der Reaktion ist die Masse etwas kleiner. Der fehlende Teil steckt in der freigesetzten Energie: E = Δm · c².',
            'After the reaction the mass is slightly smaller. The missing part is in the released energy: E = Δm · c².',
          )
        : v.mode === 'kraftwerk'
          ? L(
              'Wie viel Kohle müsste man verbrennen, um die gleiche Wärme zu erhalten wie aus wenigen Gramm Uran?',
              'How much coal would you have to burn to get the same heat as from a few grams of uranium?',
            )
          : v.mode === 'ueben'
            ? L('Gib die Zahl oder die Nummer der Antwort ein und drücke „Prüfen“.', 'Enter the number or the number of the answer and press “Check”.')
            : v.mode === 'bindung'
              ? L(
                  'Je höher die Kurve, desto fester sind die Nukleonen gebunden. Energie wird frei, wenn Kerne zur Mitte hin „aufsteigen“.',
                  'The higher the curve, the more tightly the nucleons are bound. Energy is released when nuclei “climb” towards the middle.',
                )
              : L(
                  'Jede Spaltung setzt 2–3 Neutronen frei. Wie viele davon eine neue Spaltung auslösen, entscheidet, ob die Reaktion erlischt oder anwächst.',
                  'Each fission releases 2–3 neutrons. How many of them cause a new fission decides whether the reaction dies out or grows.',
                ),
  actions: [
    { id: 'gen', label: L('Nächste Generation', 'Next generation'), primary: true, visibleIf: (v) => v.mode === 'kette' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
    { id: 'reset', label: L('Neu starten', 'Restart'), visibleIf: (v) => v.mode === 'kette' },
  ],
  readouts: [
    { key: 'B', label: L('Bindungsenergie', 'Binding energy'), spoiler: true },
    { key: 'E', label: L('Freigesetzte Energie', 'Energy released'), spoiler: true },
    { key: 'k', label: L('Vermehrungsfaktor', 'Multiplication factor'), spoiler: true },
    { key: 'gen', label: L('Generation', 'Generation') },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'u', label: L('Uran-235', 'Uranium-235'), values: { mode: 'bindung', A: 235 } },
    { id: 'fe', label: L('Eisen-56', 'Iron-56'), values: { mode: 'bindung', A: 56 } },
    { id: 'he', label: L('Helium-4', 'Helium-4'), values: { mode: 'bindung', A: 4 } },
    { id: 'krit', label: L('Kritisch (k = 1)', 'Critical (k = 1)'), values: { mode: 'kette', stab: 40, leck: 30 } },
    { id: 'sub', label: L('Unterkritisch', 'Subcritical'), values: { mode: 'kette', stab: 70, leck: 30 } },
    { id: 'super', label: L('Überkritisch', 'Supercritical'), values: { mode: 'kette', stab: 10, leck: 30 } },
    { id: 'baKr', label: L('Spaltung: Barium und Krypton', 'Fission: barium and krypton'), values: { mode: 'spaltung', ch: 'baKr' } },
    { id: 'csRb', label: L('Spaltung: Cäsium und Rubidium', 'Fission: caesium and rubidium'), values: { mode: 'spaltung', ch: 'csRb' } },
    { id: 'mUran', label: L('Massendefekt bei der Spaltung', 'Mass defect in fission'), values: { mode: 'masse', re: 'spaltung' } },
    { id: 'mDT', label: L('Massendefekt bei der Fusion', 'Mass defect in fusion'), values: { mode: 'masse', re: 'dt' } },
    { id: 'mSonne', label: L('Energiequelle der Sonne', 'Energy source of the Sun'), values: { mode: 'masse', re: 'sonne' } },
    { id: 'gramm', label: L('1 g Uran gegen Kohle', '1 g of uranium versus coal'), values: { mode: 'kraftwerk', g: 1 } },
    { id: 'tag', label: L('Ein Kraftwerk an einem Tag', 'A power plant in one day'), values: { mode: 'kraftwerk', g: 400 } },
    { id: 'quiz', label: L('Üben: sechs Aufgabenarten', 'Practice: six kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasS: 'Ein Neutron trifft einen Urankern, der Kern schwingt, verformt sich und zerfällt in zwei Spaltprodukte und mehrere Neutronen; dazu die Energiebilanz',
      canvasM: 'Balken der Masse vor und nach einer Kernreaktion; die fehlende Masse entspricht der freigesetzten Energie',
      canvasK: 'Schema eines Kernkraftwerks mit Kreislauf; darunter ein Vergleich der Wärme aus Uran mit der Menge Kohle für dieselbe Wärme',
      canvasQ: 'Übungsaufgabe zur Kernspaltung mit Rückmeldung und Punktestand',
      sBal: 'Nukleonen: 235 + 1 = {a} + {b} + {n} · 1',
      sZ: 'Protonen: 92 = {a} + {b}',
      sE: 'frei werdende Energie ≈ {e} MeV (aus den Bindungsenergien)',
      sInfo: 'Fast die ganze Energie steckt in der Bewegung der beiden Bruchstücke. Sie werden im Brennstab abgebremst und erwärmen ihn.',
      mBefore: 'vorher',
      mAfter: 'nachher',
      mDm: 'Massendefekt Δm = {dm} u ({p} % der Masse)',
      mE: 'E = Δm · c² ≈ {e} MeV',
      mInfo: 'Die Masse der Teilchen nach der Reaktion ist kleiner als vorher. Nach Einstein entspricht jede Masse einer Energie: 1 u ≙ 931,5 MeV.',
      kHeat: 'Wärme: {e}',
      kCoal: 'gleich viel Wärme wie {c} Steinkohle',
      kHouse: 'reicht als Strom für {h} Haushaltsjahre',
      kInfo: 'Ein großes Kernkraftwerk spaltet am Tag nur einige Kilogramm Uran-235. Ein Kohlekraftwerk gleicher Leistung verbrennt rund 10 000 t Kohle – dafür bleibt beim Uran radioaktiver Abfall.',
      kReactor: 'Reaktor',
      kSteam: 'Dampferzeuger',
      kTurbine: 'Turbine',
      kGen: 'Generator',
      kCool: 'Kühlung',
      kUran: 'Uran',
      kKohle: 'Kohle',
      qTitle: 'Aufgabe {n}',
      qYour: 'Deine Antwort: {a}',
      qHow: 'Gib die Nummer der richtigen Antwort ein.',
      qHowNum: 'Gib die Zahl ein (ohne Einheit).',
      qBad: 'Bitte eine Zahl eingeben.',
      qOk: 'Richtig!',
      qNo: 'Leider falsch. Versuch es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig, {s} in Folge',
      canvas:
        'Kernphysik: Kurve der Bindungsenergie pro Nukleon mit Spaltung und Fusion, oder ein Gitter aus Urankernen, die durch Neutronen gespalten werden, mit Diagramm der Neutronenzahl je Generation',
      A: 'Massenzahl A',
      BA: 'B/A in MeV',
      Bval: 'A = {A}: etwa {b} MeV pro Nukleon, zusammen etwa {B} MeV',
      Eval: 'Spaltung U-235 → Ba-141 + Kr-92: etwa {f} MeV (≈ 0,85 MeV pro Nukleon); Fusion D + T → He-4: etwa {u} MeV (≈ 3,5 MeV pro Nukleon)',
      kVal: 'k = ν · p = 2,5 · {p} ≈ {k} ({state})',
      sub: 'unterkritisch – die Reaktion erlischt',
      crit: 'kritisch – gleichbleibende Leistung wie im Kraftwerk',
      sup: 'überkritisch – die Reaktion wächst lawinenartig',
      genVal: 'Generation {g}: {n} Neutronen, bisher {s} Spaltungen (erwartet etwa {e} Neutronen)',
      fission: 'Spaltung',
      fusion: 'Fusion',
      g: 'Generation',
      n: 'Neutronen',
    },
    en: {
      canvasS: 'A neutron hits a uranium nucleus, the nucleus oscillates, deforms and splits into two fission products and several neutrons; with the energy balance',
      canvasM: 'Bars of the mass before and after a nuclear reaction; the missing mass corresponds to the released energy',
      canvasK: 'Diagram of a nuclear power plant with its loop; below a comparison of the heat from uranium with the amount of coal for the same heat',
      canvasQ: 'Practice task on nuclear fission with feedback and score',
      sBal: 'nucleons: 235 + 1 = {a} + {b} + {n} · 1',
      sZ: 'protons: 92 = {a} + {b}',
      sE: 'energy released ≈ {e} MeV (from the binding energies)',
      sInfo: 'Almost all the energy is in the motion of the two fragments. They are slowed down in the fuel rod and heat it.',
      mBefore: 'before',
      mAfter: 'after',
      mDm: 'mass defect Δm = {dm} u ({p} % of the mass)',
      mE: 'E = Δm · c² ≈ {e} MeV',
      mInfo: 'The mass of the particles after the reaction is smaller than before. According to Einstein every mass corresponds to an energy: 1 u ≙ 931.5 MeV.',
      kHeat: 'heat: {e}',
      kCoal: 'as much heat as {c} of hard coal',
      kHouse: 'enough electricity for {h} household-years',
      kInfo: 'A large nuclear power plant splits only a few kilograms of uranium-235 a day. A coal plant of the same power burns around 10 000 t of coal – but uranium leaves radioactive waste.',
      kReactor: 'reactor',
      kSteam: 'steam generator',
      kTurbine: 'turbine',
      kGen: 'generator',
      kCool: 'cooling',
      kUran: 'uranium',
      kKohle: 'coal',
      qTitle: 'Task {n}',
      qYour: 'Your answer: {a}',
      qHow: 'Enter the number of the correct answer.',
      qHowNum: 'Enter the number (without unit).',
      qBad: 'Please enter a number.',
      qOk: 'Correct!',
      qNo: 'Not quite. Try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct, {s} in a row',
      canvas: 'Nuclear physics: curve of binding energy per nucleon with fission and fusion, or a grid of uranium nuclei split by neutrons with a graph of the neutron number per generation',
      A: 'mass number A',
      BA: 'B/A in MeV',
      Bval: 'A = {A}: about {b} MeV per nucleon, in total about {B} MeV',
      Eval: 'fission U-235 → Ba-141 + Kr-92: about {f} MeV (≈ 0.85 MeV per nucleon); fusion D + T → He-4: about {u} MeV (≈ 3.5 MeV per nucleon)',
      kVal: 'k = ν · p = 2.5 · {p} ≈ {k} ({state})',
      sub: 'subcritical – the reaction dies out',
      crit: 'critical – constant power as in a power plant',
      sup: 'supercritical – the reaction grows like an avalanche',
      genVal: 'generation {g}: {n} neutrons, {s} fissions so far (expected about {e} neutrons)',
      fission: 'fission',
      fusion: 'fusion',
      g: 'generation',
      n: 'neutrons',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 240],
      y: [0, 10],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = (p.mode === 'bindung' ? { x: 0, y: 0, w, h } : split(w, h).chart) as Rect;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    // Kettenreaktion
    let random = rng(42);
    let split2: boolean[] = [];
    let active: number[] = [];
    let history: number[] = [];
    let fissions = 0;
    const prob = () => (1 - p.stab / 100) * (1 - p.leck / 100);
    const k = () => multiplication(NU, prob());

    function resetChain(): void {
      random = rng(42);
      split2 = Array.from({ length: COLS * ROWS }, () => false);
      // Start: ein Neutron trifft den mittleren Kern
      const mid = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);
      split2[mid] = true;
      fissions = 1;
      active = [mid];
      history = [1];
    }

    function nextGen(): void {
      if (history.length > MAXGEN) return;
      const next: number[] = [];
      let neutrons = 0;
      for (const _ of active) {
        const nu = random() < 0.5 ? 2 : 3;
        for (let i = 0; i < nu; i++) {
          if (random() >= prob()) continue;
          neutrons++;
          // trifft einen zufälligen noch ungespaltenen Kern (wenn es noch welche gibt)
          const free = split2.map((s, idx) => (s ? -1 : idx)).filter((i2) => i2 >= 0);
          if (free.length === 0) continue;
          const idx = free[Math.floor(random() * free.length)]!;
          split2[idx] = true;
          next.push(idx);
        }
      }
      fissions += next.length;
      active = next;
      history.push(neutrons);
    }

    function setupPlot(): void {
      if (p.mode === 'bindung') {
        plot.setRangePadded([0, 240], [0, 10], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('A') }, y: { label: ctx.t('BA') } });
      } else {
        const maxN = Math.max(8, ...history, chain(1, k(), MAXGEN) > 60 ? 60 : chain(1, k(), MAXGEN));
        plot.setRangePadded([0, MAXGEN], [0, Math.min(80, maxN) * 1.1], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('g') }, y: { label: ctx.t('n') } });
      }
    }

    /* Übung und Animation */
    let task: NuclearTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    /** Zeit in der Spaltungs- bzw. Kraftwerksanimation (s). */
    let ta = 0;
    const channel = () => CHANNELS.find((c) => c.id === p.ch) ?? CHANNELS[0]!;

    /** Energie in J mit passender Einheit (kWh, MWh, GWh). */
    function energyText(J: number): string {
      const kWh = J / 3.6e6;
      if (kWh >= 1e6) return `${fmt.num(kWh / 1e6, 2)} GWh`;
      if (kWh >= 1e3) return `${fmt.num(kWh / 1e3, 1)} MWh`;
      return `${fmt.num(kWh, 0)} kWh`;
    }
    function massText(kg: number): string {
      return kg >= 1000 ? `${fmt.num(kg / 1000, kg >= 1e5 ? 0 : 1)} t` : `${fmt.num(kg, 0)} kg`;
    }

    function updateReadouts(): void {
      for (const key of ['B', 'E', 'k', 'gen', 'info']) ctx.readout(key, null);
      if (p.mode === 'spaltung') {
        const c = channel();
        ctx.readout('B', `${tr('sBal', { a: c.a.A, b: c.b.A, n: c.n })}; ${tr('sZ', { a: c.a.Z, b: c.b.Z })}`);
        ctx.readout('E', tr('sE', { e: fmt.num(channelEnergy(c), 0) }));
        ctx.readout('info', ctx.t('sInfo'));
        return;
      }
      if (p.mode === 'masse') {
        const md = massDefect(p.re as ReactionId);
        ctx.readout('B', tr('mDm', { dm: fmt.num(md.dm, 4), p: fmt.num(md.share * 100, 2) }));
        ctx.readout('E', tr('mE', { e: fmt.num(md.E, 1) }));
        ctx.readout('info', ctx.t('mInfo'));
        return;
      }
      if (p.mode === 'kraftwerk') {
        const J = uraniumHeat(p.g);
        ctx.readout('E', tr('kHeat', { e: energyText(J) }));
        ctx.readout('B', tr('kCoal', { c: massText(coalEquivalent(J)) }));
        ctx.readout('gen', tr('kHouse', { h: fmt.num(householdYears(J), householdYears(J) < 10 ? 1 : 0) }));
        ctx.readout('info', ctx.t('kInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'bindung') {
        const b = curve(p.A);
        ctx.readout('B', tr('Bval', { A: p.A, b: fmt.num(b, 2), B: fmt.num(b * p.A, 0) }));
        ctx.readout('E', tr('Eval', { f: fmt.num(fissionEnergy(), 0), u: fmt.num(fusionEnergy(), 1) }));
      } else {
        const kk = k();
        const state = Math.abs(kk - 1) < 0.03 ? 'crit' : kk < 1 ? 'sub' : 'sup';
        ctx.readout('k', tr('kVal', { p: fmt.num(prob(), 2), k: fmt.num(kk, 2), state: ctx.t(state) }));
        const g = history.length - 1;
        ctx.readout('gen', tr('genVal', { g, n: history[g] ?? 0, s: fissions, e: fmt.num(chain(1, kk, g), 1) }));
      }
    }

    function drawGrid(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cw = (r.w - 20) / COLS;
      const ch = (r.h - 20) / ROWS;
      const rad = Math.min(cw, ch) * 0.32;
      const activeSet = new Set(active);
      for (let i = 0; i < COLS * ROWS; i++) {
        const x = r.x + 10 + ((i % COLS) + 0.5) * cw;
        const y = r.y + 10 + (Math.floor(i / COLS) + 0.5) * ch;
        if (!split2[i]) {
          g.fillStyle = withAlpha(th.series[2]!, 0.75);
          g.beginPath();
          g.arc(x, y, rad, 0, Math.PI * 2);
          g.fill();
        } else {
          const hot = activeSet.has(i);
          g.fillStyle = hot ? th.series[1]! : withAlpha(th.muted, 0.5);
          for (const d of [-1, 1]) {
            g.beginPath();
            g.arc(x + d * rad * 0.55, y + d * rad * 0.2, rad * 0.62, 0, Math.PI * 2);
            g.fill();
          }
          if (hot) {
            g.strokeStyle = withAlpha(th.series[3]!, 0.9);
            g.lineWidth = 1.5;
            for (let a = 0; a < 3; a++) {
              const ang = (a / 3) * Math.PI * 2 + i;
              g.beginPath();
              g.moveTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
              g.lineTo(x + Math.cos(ang) * rad * 2, y + Math.sin(ang) * rad * 2);
              g.stroke();
            }
          }
        }
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'bindung') {
        plot.fn((A) => curve(A), { color: th.series[0]!, width: 3, from: 2, to: 240 });
        for (const [A, name] of [
          [2, 'H-2'],
          [4, 'He-4'],
          [56, 'Fe-56'],
          [235, 'U-235'],
        ] as const) {
          plot.point(A, curve(A), { color: th.muted, radius: 4 });
          plot.text(A, curve(A), name, { color: th.muted, size: 11, offset: A === 235 ? [-6, -12] : [6, 14], align: A === 235 ? 'right' : 'left' });
        }
        // Spaltung: U-235 → zwei mittlere Kerne
        plot.arrow([232, curve(232) + 0.35], [140, curve(140) + 0.35], { color: th.series[1]!, width: 2.5 });
        plot.arrow([232, curve(232) + 0.35], [95, curve(95) + 0.35], { color: th.series[1]!, width: 2.5 });
        plot.text(190, curve(190) + 0.75, ctx.t('fission'), { color: th.series[1]!, size: 12, weight: 'bold' });
        // Fusion: H-2 → He-4
        plot.arrow([2, curve(2)], [4, curve(4) - 0.1], { color: th.series[3]!, width: 2.5 });
        plot.text(8, 3.5, ctx.t('fusion'), { color: th.series[3]!, size: 12, weight: 'bold' });
        plot.point(p.A, curve(p.A), { color: th.series[2]!, radius: 7 });
      } else {
        history.forEach((n, gi) => {
          plot.polygon(
            [
              [gi - 0.35, 0],
              [gi + 0.35, 0],
              [gi + 0.35, Math.min(80, n)],
              [gi - 0.35, Math.min(80, n)],
            ],
            { fill: withAlpha(th.series[1]!, 0.7) },
          );
        });
        plot.fn((x) => Math.min(80, chain(1, k(), x)), { color: th.series[0]!, width: 2, dash: [6, 5], from: 0, to: MAXGEN });
      }
      plot.end();
    }

    /* ---------- Eine Spaltung ---------- */
    function drawFission(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const c = channel();
      const cx = W / 2;
      const cy = H * (narrow ? 0.36 : 0.42);
      const R0 = Math.min(W, H) * (narrow ? 0.12 : 0.14);
      // Phasen: 0–1 s Neutron fliegt, 1–2,2 s Kern schwingt, danach Bruchstücke fliegen
      const t = prefersReducedMotion() ? 4 : ta;
      const nucleus = (x: number, y: number, r: number, label: string, col: string, sx = 1, sy = 1) => {
        g.save();
        g.translate(x, y);
        g.scale(sx, sy);
        g.beginPath();
        g.arc(0, 0, r, 0, Math.PI * 2);
        g.fillStyle = withAlpha(col, 0.85);
        g.fill();
        g.restore();
        text(g, label, x, y, { font: `800 ${Math.max(11, Math.min(16, r * 0.35))}px ${th.font}`, color: th.bg });
      };
      const neutron = (x: number, y: number) => {
        g.beginPath();
        g.arc(x, y, 7, 0, Math.PI * 2);
        g.fillStyle = th.muted;
        g.fill();
        text(g, 'n', x, y, { font: `700 10px ${th.font}`, color: th.bg });
      };
      if (t < 1) {
        nucleus(cx, cy, R0, 'U-235', th.series[0]!);
        neutron(20 + (cx - R0 - 20) * t, cy);
      } else if (t < 2.2) {
        const u = (t - 1) / 1.2;
        const wob = Math.sin(u * Math.PI * 6) * 0.08 * (1 - u) + u * 0.45;
        nucleus(cx, cy, R0 * 1.01, 'U-236*', th.series[3]!, 1 + wob, 1 - wob * 0.55);
      } else {
        const u = Math.min(1, (t - 2.2) / 1.6);
        const dist = u * W * 0.3;
        const ra = R0 * Math.cbrt(c.a.A / 236);
        const rb = R0 * Math.cbrt(c.b.A / 236);
        nucleus(cx - dist - ra * 0.3, cy, ra, `${c.a.sym}-${c.a.A}`, th.series[1]!);
        nucleus(cx + dist + rb * 0.3, cy, rb, `${c.b.sym}-${c.b.A}`, th.series[2]!);
        for (let k = 0; k < c.n; k++) {
          const ang = -Math.PI / 2 + (k - (c.n - 1) / 2) * 0.9;
          neutron(cx + Math.cos(ang) * (R0 * 0.4 + u * H * 0.32), cy + Math.sin(ang) * (R0 * 0.4 + u * H * 0.28));
        }
        // Energieblitz
        if (u < 0.5) {
          g.beginPath();
          g.arc(cx, cy, R0 * (0.6 + u * 3), 0, Math.PI * 2);
          g.strokeStyle = withAlpha(th.series[3]!, 0.6 * (1 - u * 2));
          g.lineWidth = 4;
          g.stroke();
        }
      }
      // Bilanz
      const fs = narrow ? 13 : 15;
      let y = H * (narrow ? 0.68 : 0.76);
      const line = (str: string, col: string, weight = 700) => {
        g.font = `${weight} ${fs}px ${th.font}`;
        for (const part of wrap(g, str, W - 32)) {
          text(g, part, 16, y, { font: `${weight} ${fs}px ${th.font}`, color: col, align: 'left' });
          y += fs * 1.45;
        }
        y += fs * 0.2;
      };
      line(`U-235 + n → ${c.a.sym}-${c.a.A} + ${c.b.sym}-${c.b.A} + ${c.n} n`, th.text, 800);
      line(tr('sBal', { a: c.a.A, b: c.b.A, n: c.n }), th.muted, 500);
      if (!ctx.hidden) line(tr('sE', { e: fmt.num(channelEnergy(c), 0) }), th.series[3]!, 700);
    }

    /* ---------- Massendefekt ---------- */
    function drawMass(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const re = REACTIONS[p.re as ReactionId];
      const md = massDefect(p.re as ReactionId);
      const fs = narrow ? 13 : 15;
      text(g, ctx.lang === 'de' ? re.de : re.en, W / 2, 26, { font: `800 ${fs + 2}px ${th.font}`, color: th.text });
      // Balken: volle Breite = Masse vorher; Lupe auf den Unterschied
      const x0 = narrow ? 70 : 110;
      const bw = W - x0 - 24;
      const bh = narrow ? 26 : 34;
      const y1 = 70;
      const y2 = y1 + bh + 22;
      const bar = (y: number, frac: number, col: string, label: string) => {
        text(g, label, x0 - 10, y + bh / 2, { font: `700 ${fs}px ${th.font}`, color: th.text, align: 'right' });
        roundRect(g, x0, y, bw * frac, bh, 6);
        g.fillStyle = col;
        g.fill();
      };
      bar(y1, 1, withAlpha(th.series[0]!, 0.8), ctx.t('mBefore'));
      bar(y2, md.share < 1 ? 1 - md.share : 0, withAlpha(th.series[2]!, 0.8), ctx.t('mAfter'));
      text(g, `${fmt.num(re.before, 4)} u`, x0 + 8, y1 + bh / 2, { font: `700 ${fs - 1}px ${th.font}`, color: th.bg, align: 'left' });
      text(g, `${fmt.num(re.after, 4)} u`, x0 + 8, y2 + bh / 2, { font: `700 ${fs - 1}px ${th.font}`, color: th.bg, align: 'left' });
      // Lupe: Ende der Balken vergrößert
      const zy = y2 + bh + 40;
      const zh = H - zy - 90;
      if (zh > 60) {
        const zx = x0;
        const zw = bw;
        roundRect(g, zx, zy, zw, zh, 8);
        g.strokeStyle = th.muted;
        g.lineWidth = 1;
        g.stroke();
        text(g, ctx.lang === 'de' ? 'Lupe: das Ende der Balken' : 'magnified: the end of the bars', zx + 8, zy + 14, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
        // Darstellung: Δm füllt 40 % der Lupenbreite
        const gapW = zw * 0.4;
        const endX = zx + zw * 0.85;
        g.fillStyle = withAlpha(th.series[0]!, 0.8);
        g.fillRect(zx + 8, zy + 30, endX - zx - 8, (zh - 40) / 2 - 4);
        g.fillStyle = withAlpha(th.series[2]!, 0.8);
        g.fillRect(zx + 8, zy + 30 + (zh - 40) / 2 + 4, endX - gapW - zx - 8, (zh - 40) / 2 - 4);
        // fehlende Masse → Energie
        const pulse = 0.5 + 0.5 * Math.sin(ta * 4);
        g.fillStyle = withAlpha(th.series[3]!, 0.25 + 0.35 * pulse);
        g.fillRect(endX - gapW, zy + 30 + (zh - 40) / 2 + 4, gapW, (zh - 40) / 2 - 4);
        text(g, `Δm → E`, endX - gapW / 2, zy + 30 + ((zh - 40) * 3) / 4, { font: `800 ${fs}px ${th.font}`, color: th.series[3]! });
      }
      let y = H - 60;
      text(g, tr('mDm', { dm: fmt.num(md.dm, 4), p: fmt.num(md.share * 100, 2) }), 16, y, { font: `700 ${fs}px ${th.font}`, color: th.text, align: 'left' });
      y += fs * 1.7;
      if (!ctx.hidden) text(g, tr('mE', { e: fmt.num(md.E, 1) }), 16, y, { font: `800 ${fs + 1}px ${th.font}`, color: th.series[3]!, align: 'left' });
    }

    /* ---------- Kraftwerk ---------- */
    function drawPlant(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const fs = narrow ? 12 : 14;
      // Schema oben
      const top = 20;
      const sh = H * (narrow ? 0.42 : 0.48);
      const boxW = (W - 40) / 4 - 16;
      const boxH = Math.min(70, sh * 0.45);
      const names = ['kReactor', 'kSteam', 'kTurbine', 'kGen'];
      const cols = [th.series[3]!, th.series[1]!, th.series[0]!, th.series[2]!];
      const by = top + sh * 0.25;
      names.forEach((nm, i) => {
        const bx = 20 + i * (boxW + 16 + 16 / 3);
        roundRect(g, bx, by, boxW, boxH, 8);
        g.fillStyle = withAlpha(cols[i]!, 0.2);
        g.fill();
        g.strokeStyle = cols[i]!;
        g.lineWidth = 2;
        g.stroke();
        g.font = `700 ${fs}px ${th.font}`;
        const label = ctx.t(nm);
        text(g, g.measureText(label).width > boxW - 6 ? label.slice(0, 6) + '.' : label, bx + boxW / 2, by + boxH / 2, { font: `700 ${fs}px ${th.font}`, color: th.text });
        if (i < 3) {
          // Fluss zwischen den Blöcken
          const ax = bx + boxW + 2;
          const bx2 = bx + boxW + 16 + 16 / 3 - 2;
          g.strokeStyle = th.muted;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(ax, by + boxH / 2);
          g.lineTo(bx2, by + boxH / 2);
          g.stroke();
          const u = (ta * 0.8 + i * 0.3) % 1;
          g.beginPath();
          g.arc(ax + (bx2 - ax) * u, by + boxH / 2, 3.5, 0, Math.PI * 2);
          g.fillStyle = cols[i]!;
          g.fill();
        }
      });
      // Kühlung unter Dampferzeuger/Turbine
      text(g, `↓ ${ctx.t('kCool')}`, 20 + 2 * (boxW + 16 + 16 / 3) + boxW / 2, by + boxH + 18, { font: `600 ${fs - 1}px ${th.font}`, color: th.muted });
      // Vergleich Uran – Kohle als Mengen
      const J = uraniumHeat(p.g);
      const coal = coalEquivalent(J);
      const cy = top + sh + 20;
      text(g, `${ctx.t('kUran')}: ${fmt.num(p.g, 0)} g U-235`, 20, cy, { font: `800 ${fs + 1}px ${th.font}`, color: th.series[3]!, align: 'left' });
      text(g, `${ctx.t('kKohle')}: ${massText(coal)}`, narrow ? 20 : W / 2, narrow ? cy + fs * 1.8 : cy, { font: `800 ${fs + 1}px ${th.font}`, color: th.text, align: 'left' });
      // Würfel: Uran winzig, Kohle als Stapel von Güterwagen (je 60 t)
      const ry = cy + (narrow ? fs * 3.6 : fs * 2);
      const uSize = Math.max(4, Math.min(40, 4 * Math.cbrt(p.g)));
      g.fillStyle = th.series[3]!;
      g.fillRect(20, ry, uSize, uSize);
      const wagons = coal / 60000;
      const wx0 = narrow ? 20 : W / 2;
      const ww = narrow ? 22 : 30;
      const maxW = Math.floor((W - wx0 - 20) / (ww + 4));
      const rows = Math.max(1, Math.floor((H - ry - 50) / (ww * 0.6 + 6)));
      const per = wagons > maxW * rows ? Math.ceil(wagons / (maxW * rows)) : 1;
      const shown = Math.min(maxW * rows, Math.ceil(wagons / per));
      for (let k = 0; k < shown; k++) {
        const x = wx0 + (k % maxW) * (ww + 4);
        const y = (narrow ? ry + 50 : ry) + Math.floor(k / maxW) * (ww * 0.6 + 6);
        const frac = k === shown - 1 && per === 1 ? wagons - Math.floor(wagons) || 1 : 1;
        roundRect(g, x, y, ww * frac, ww * 0.6, 3);
        g.fillStyle = withAlpha(th.text, 0.75);
        g.fill();
      }
      const note = ctx.lang === 'de' ? `ein Wagen = ${per > 1 ? `${per} × ` : ''}60 t Kohle` : `one wagon = ${per > 1 ? `${per} × ` : ''}60 t of coal`;
      text(g, note, wx0, H - 16, { font: `500 ${fs - 2}px ${th.font}`, color: th.muted, align: 'left' });
      text(g, tr('kHouse', { h: fmt.num(householdYears(J), householdYears(J) < 10 ? 1 : 0) }), 20, H - 36, { font: `600 ${fs}px ${th.font}`, color: th.series[2]!, align: 'left' });
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

    function drawQuiz(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
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
      const cnt = Math.min(10, score.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 22, 6, 0, Math.PI * 2);
        g.fillStyle = i < cnt ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
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

    const canvasKey = () => ({ spaltung: 'canvasS', masse: 'canvasM', kraftwerk: 'canvasK', ueben: 'canvasQ' })[p.mode as string] ?? 'canvas';

    resetChain();

    return {
      update(changed, source) {
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
        if (changed.has('mode') || changed.has('ch')) ta = p.mode === 'spaltung' ? 0 : ta;
        surface.canvas.setAttribute('aria-label', ctx.t(canvasKey()));
        if (source === 'init' || changed.has('mode') || changed.has('stab') || changed.has('leck')) resetChain();
        setupPlot();
        updateReadouts();
      },
      action(id) {
        if (id === 'check' || id === 'next') {
          if (id === 'next') {
            ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
            return;
          }
          runCheck();
          updateReadouts();
          ctx.requestRender();
          return;
        }
        if (id === 'gen') nextGen();
        else resetChain();
        setupPlot();
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        ta += Math.min(dt, 0.05);
        if (p.mode === 'spaltung' && ta > 4.2) {
          ta = 4.2;
          ctx.clock.pause();
        }
      },
      resetTime() {
        ta = 0;
      },
      render() {
        surface.begin();
        if (p.mode === 'spaltung') return drawFission();
        if (p.mode === 'masse') return drawMass();
        if (p.mode === 'kraftwerk') return drawPlant();
        if (p.mode === 'ueben') return drawQuiz();
        plot.resize();
        if (p.mode === 'kette') {
          const s = split(surface.width, surface.height);
          drawGrid(s.scene);
        }
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
