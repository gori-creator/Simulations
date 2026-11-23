import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { monoPowerForm, monoText, monoValue, nodeText, parseTerm, powQ, q, qText, sameTerm, simplify, sup, type Law, type Mono, type Step, checkDrill, makeDrill, type Drill, domainOf, orderRatio, powReal, prefixFor, sciParts, symmetryOf, THINGS } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type LawView = 'mul' | 'div' | 'powpow' | 'prodpow';

const LAWS: Record<Law, { name: Loc; formula: string }> = {
  mulSame: { name: L('Gleiche Basis malnehmen', 'Multiplying, same base'), formula: 'aᵐ · aⁿ = aᵐ⁺ⁿ' },
  divSame: { name: L('Gleiche Basis teilen', 'Dividing, same base'), formula: 'aᵐ : aⁿ = aᵐ⁻ⁿ' },
  powPow: { name: L('Potenz potenzieren', 'Power of a power'), formula: '(aᵐ)ⁿ = aᵐ·ⁿ' },
  prodPow: { name: L('Produkt potenzieren', 'Power of a product'), formula: '(a · b)ⁿ = aⁿ · bⁿ' },
  quotPow: { name: L('Quotient potenzieren', 'Power of a quotient'), formula: '(a : b)ⁿ = aⁿ : bⁿ' },
  root: { name: L('Wurzel als Potenz', 'Root as a power'), formula: 'ⁿ√a = a^(1/n)' },
  neg: { name: L('Negativer Exponent', 'Negative exponent'), formula: 'a⁻ⁿ = 1 / aⁿ' },
  zero: { name: L('Exponent null', 'Exponent zero'), formula: 'a⁰ = 1' },
  factor: { name: L('Primfaktoren', 'Prime factors'), formula: '8 = 2³' },
};

/**
 * Potenz- und Wurzelgesetze: Die Gesetze werden mit Faktor-Kacheln sichtbar
 * (zusammenschieben, kürzen, gruppieren), eine Treppe erklärt a⁰ = 1 und
 * negative Exponenten, der Graph von y = aˣ zeigt gebrochene Exponenten als
 * Wurzeln, und ein Termumformer vereinfacht Terme Schritt für Schritt mit
 * dem jeweils angewandten Gesetz.
 */
export default defineSimulation({
  id: 'potenzgesetze',
  layout: { aspect: 1.6, aspectNarrow: 0.55 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'laws', label: L('Gesetze mit Kacheln', 'Laws with tiles') },
        { value: 'ladder', label: L('Treppe: a⁰ und negative Exponenten', 'Ladder: a⁰ and negative exponents') },
        { value: 'roots', label: L('Gebrochene Exponenten und Wurzeln', 'Fractional exponents and roots') },
        { value: 'terms', label: L('Terme vereinfachen', 'Simplifying terms') },
        { value: 'fn', label: L('Potenzfunktionen y = xⁿ', 'Power functions y = xⁿ') },
        { value: 'sci', label: L('Zehnerpotenzen: vom Atom zur Galaxie', 'Powers of ten: from atom to galaxy') },
        { value: 'drill', label: L('Üben: Kopfrechnen mit Potenzen', 'Practice: mental arithmetic with powers') },
      ],
      default: 'laws',
    },
    {
      key: 'law',
      type: 'choice',
      label: L('Gesetz', 'Law'),
      options: [
        { value: 'mul', label: L('aᵐ · aⁿ = aᵐ⁺ⁿ', 'aᵐ · aⁿ = aᵐ⁺ⁿ') },
        { value: 'div', label: L('aᵐ : aⁿ = aᵐ⁻ⁿ', 'aᵐ : aⁿ = aᵐ⁻ⁿ') },
        { value: 'powpow', label: L('(aᵐ)ⁿ = aᵐ·ⁿ', '(aᵐ)ⁿ = aᵐ·ⁿ') },
        { value: 'prodpow', label: L('(a · b)ⁿ = aⁿ · bⁿ', '(a · b)ⁿ = aⁿ · bⁿ') },
      ],
      default: 'mul',
      visibleIf: (v) => v.mode === 'laws',
    },
    { key: 'a', type: 'number', label: L('Basis a', 'Base a'), min: 2, max: 10, step: 1, default: 2, visibleIf: (v) => v.mode !== 'terms' },
    { key: 'b', type: 'number', label: L('Basis b', 'Base b'), min: 2, max: 10, step: 1, default: 3, visibleIf: (v) => v.mode === 'laws' && v.law === 'prodpow' },
    { key: 'm', type: 'number', label: L('Exponent m', 'Exponent m'), min: 0, max: 8, step: 1, default: 3, visibleIf: (v) => v.mode === 'laws' && v.law !== 'prodpow' },
    { key: 'n', type: 'number', label: L('Exponent n', 'Exponent n'), min: 0, max: 8, step: 1, default: 4, visibleIf: (v) => v.mode === 'laws' },
    { key: 'sym', type: 'boolean', label: L('Mit Buchstaben statt Zahlen', 'With letters instead of numbers'), default: false, visibleIf: (v) => v.mode === 'laws' },
    { key: 'pm', type: 'number', label: L('Zähler des Exponenten', 'Numerator of the exponent'), min: -6, max: 6, step: 1, default: 2, visibleIf: (v) => v.mode === 'roots' },
    { key: 'pn', type: 'number', label: L('Nenner des Exponenten', 'Denominator of the exponent'), min: 1, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'roots' },
    {
      key: 't',
      type: 'text',
      label: L('Term', 'Term'),
      default: '(a^2 · b)^3 : (a^4 · b^2)',
      maxLength: 60,
      placeholder: L('z. B. a^3 · a^4 oder √2 · √8', 'e.g. a^3 · a^4 or √2 · √8'),
      help: L(
        'Potenzen mit ^ (auch ^(2/3) oder ^(-1)), Wurzeln mit √ oder root(3, a), Malpunkt · oder *, geteilt : oder /. Nur Produkte und Quotienten, keine Summen.',
        'Powers with ^ (also ^(2/3) or ^(-1)), roots with √ or root(3, a), times · or *, divided : or /. Only products and quotients, no sums.',
      ),
      visibleIf: (v) => v.mode === 'terms',
    },
    { key: 'g', type: 'text', label: L('Deine Vereinfachung', 'Your simplification'), default: '', maxLength: 40, placeholder: L('z. B. a^2 · b', 'e.g. a^2 · b'), visibleIf: (v) => v.mode === 'terms' },
    { key: 'fm', type: 'number', label: L('Exponent: Zähler', 'Exponent: numerator'), min: -4, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'fn' },
    { key: 'fd', type: 'number', label: L('Exponent: Nenner', 'Exponent: denominator'), min: 1, max: 4, step: 1, default: 1, visibleIf: (v) => v.mode === 'fn' },
    { key: 'fam', type: 'boolean', label: L('Verwandte Exponenten blass zeigen', 'Show related exponents faintly'), default: true, visibleIf: (v) => v.mode === 'fn' },
    { key: 'inv', type: 'boolean', label: L('Umkehrfunktion (an y = x gespiegelt)', 'Inverse function (reflected in y = x)'), default: false, visibleIf: (v) => v.mode === 'fn' },
    { key: 'fx', type: 'number', label: L('Stelle x', 'Point x'), help: L('Oder den Punkt auf dem Graphen ziehen.', 'Or drag the point on the graph.'), min: -3, max: 3, step: 0.05, default: 1.5, visibleIf: (v) => v.mode === 'fn' },
    { key: 'zx', type: 'number', label: L('Bildbreite: 10^k Meter, k =', 'Picture width: 10^k metres, k ='), min: -15, max: 21, step: 0.1, default: 0, visibleIf: (v) => v.mode === 'sci' },
    { key: 'dq', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'drill' },
    { key: 'da', type: 'text', label: L('Deine Antwort für ?', 'Your answer for ?'), default: '', maxLength: 12, placeholder: L('eine Zahl', 'a number'), visibleIf: (v) => v.mode === 'drill' },
    { key: 'show', type: 'boolean', label: L('Ergebnis zeigen', 'Show result'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode !== 'terms' && v.mode !== 'sci' },
    { id: 'dcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'drill' },
    { id: 'dnext', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'drill' },
    { id: 'tour', label: L('Reise vom Proton zur Milchstraße', 'Journey from proton to Milky Way'), primary: true, visibleIf: (v) => v.mode === 'sci' },
    { id: 'in', label: L('10-mal näher', '10 times closer'), visibleIf: (v) => v.mode === 'sci' },
    { id: 'out', label: L('10-mal weiter weg', '10 times farther'), visibleIf: (v) => v.mode === 'sci' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'terms' },
  ],
  readouts: [
    { key: 'term', label: L('Term', 'Term') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'mul', label: L('2³ · 2⁴ = 2⁷', '2³ · 2⁴ = 2⁷'), values: { mode: 'laws', law: 'mul', a: 2, m: 3, n: 4, sym: false } },
    { id: 'div', label: L('a⁶ : a² – kürzen', 'a⁶ : a² – cancelling'), values: { mode: 'laws', law: 'div', a: 2, m: 6, n: 2, sym: true } },
    { id: 'divneg', label: L('a² : a⁵ – negativer Exponent', 'a² : a⁵ – negative exponent'), values: { mode: 'laws', law: 'div', a: 2, m: 2, n: 5, sym: true } },
    { id: 'divzero', label: L('a³ : a³ = a⁰ = 1', 'a³ : a³ = a⁰ = 1'), values: { mode: 'laws', law: 'div', a: 3, m: 3, n: 3, sym: true } },
    { id: 'powpow', label: L('(a²)³ = a⁶', '(a²)³ = a⁶'), values: { mode: 'laws', law: 'powpow', a: 2, m: 2, n: 3, sym: true } },
    { id: 'prodpow', label: L('(2 · 3)³ = 2³ · 3³', '(2 · 3)³ = 2³ · 3³'), values: { mode: 'laws', law: 'prodpow', a: 2, b: 3, n: 3, sym: false } },
    { id: 'ladder', label: L('Treppe für Basis 2', 'Ladder for base 2'), values: { mode: 'ladder', a: 2 } },
    { id: 'root', label: L('8^(2/3) = 4', '8^(2/3) = 4'), values: { mode: 'roots', a: 8, pm: 2, pn: 3 } },
    { id: 'rootneg', label: L('4^(−1/2) = 0,5', '4^(−1/2) = 0.5'), values: { mode: 'roots', a: 4, pm: -1, pn: 2 } },
    { id: 'sqrt', label: L('√2 · √8 = 4', '√2 · √8 = 4'), values: { mode: 'terms', t: '√2 · √8', g: '' } },
    { id: 'term', label: L('(a² · b)³ : (a⁴ · b²)', '(a² · b)³ : (a⁴ · b²)'), values: { mode: 'terms', t: '(a^2 · b)^3 : (a^4 · b^2)', g: '' } },
    { id: 'fn3', label: L('y = x³: punktsymmetrisch', 'y = x³: point-symmetric'), values: { mode: 'fn', fm: 3, fd: 1, fam: true, inv: false, fx: 1.5 } },
    { id: 'fn-2', label: L('y = x⁻²: Hyperbel mit Polstelle', 'y = x⁻²: hyperbola with a pole'), values: { mode: 'fn', fm: -2, fd: 1, fam: true, inv: false, fx: 1 } },
    { id: 'fnroot', label: L('y = x^(1/2) ist die Umkehrung von x²', 'y = x^(1/2) is the inverse of x²'), values: { mode: 'fn', fm: 2, fd: 1, fam: false, inv: true, fx: 1.5 } },
    { id: 'drill', label: L('Üben: zehn Aufgaben im Kopf', 'Practice: ten mental tasks'), values: { mode: 'drill', dq: 1, da: '' } },
    { id: 'sci', label: L('Zehnerpotenzen: Mensch, Ameise, Haar', 'Powers of ten: human, ant, hair'), values: { mode: 'sci', zx: 0 } },
    { id: 'sci2', label: L('Die Erde: 1,27 · 10⁷ m', 'The Earth: 1.27 · 10⁷ m'), values: { mode: 'sci', zx: 7.4 } },
    { id: 'practice', label: L('Übung: (x²)³ : x⁴ selbst vereinfachen', 'Practice: simplify (x²)³ : x⁴'), values: { mode: 'terms', t: '(x^2)^3 : x^4', g: '', show: false } },
  ],
  strings: {
    de: {
      drT: 'Kopfrechnen mit Potenzen',
      drHow: 'Setze für ? die passende Zahl ein und tippe auf „Prüfen“.',
      drOk: 'Richtig!',
      drNo: 'Noch nicht.',
      drScore: '{k} von {n} richtig · Serie: {s}',
      dr_mul: 'Gleiche Basis malnehmen: Exponenten addieren.',
      dr_div: 'Gleiche Basis teilen: Exponenten subtrahieren.',
      dr_powpow: 'Potenz potenzieren: Exponenten multiplizieren.',
      dr_neg: 'Negativer Exponent: a⁻ⁿ = 1 : aⁿ.',
      dr_frac: 'Gebrochener Exponent: a^(m/n) = (ⁿ√a)ᵐ – erst die Wurzel, dann die Potenz.',
      dr_sci: 'Wie viele Stellen wandert das Komma? Nach rechts: negativer Exponent.',
      dr_zero: 'aⁿ : aⁿ = aⁿ⁻ⁿ = a⁰ = 1.',
      fnT: 'Potenzfunktion f(x) = {e}',
      sym_axis: 'Gerader Exponent: achsensymmetrisch zur y-Achse.',
      sym_point: 'Ungerader Exponent: punktsymmetrisch zum Ursprung.',
      sym_none: 'Gerader Wurzelexponent: nur für x ≥ 0 definiert, keine Symmetrie.',
      dom: 'Definitionsbereich',
      dom_R: 'alle reellen Zahlen',
      'dom_R0+': 'x ≥ 0',
      'dom_R+': 'x > 0',
      'dom_R\\0': 'x ≠ 0',
      fnNeg: 'Negativer Exponent: x^(−n) = 1/xⁿ. An x = 0 gibt es eine Polstelle, für große x geht der Graph gegen 0.',
      fnPos: 'Alle Graphen y = xⁿ mit n > 0 gehen durch (0 | 0) und (1 | 1).',
      fnInv: 'Gespiegelt an y = x: Die Umkehrfunktion von xⁿ ist x^(1/n), also die n-te Wurzel.',
      sciT: 'Zehnerpotenzen',
      sciScale: 'Bildbreite: 10{k} m = {v}',
      sciG: 'Jeder Schritt nach rechts macht das Bild zehnmal breiter. Von der Breite eines Protons bis zur Milchstraße sind es 36 Zehnerpotenzen.',
      sciIn: 'Im Bild',
      sciRatio: '{a} ist etwa 10^{k}-mal so groß wie {b}.',
      sciPrefix: 'Vorsilbe',
      canvas: 'Potenzgesetze zum Anschauen: Faktor-Kacheln, die zusammengeschoben, gekürzt oder gruppiert werden, eine Treppe der Exponenten, der Graph von y = aˣ und ein Termumformer mit Schritten.',
      factors: '{k} Faktoren',
      cancel: 'Gleiche Faktoren oben und unten kürzen sich.',
      groups: '{n} Gruppen mit je {m} Faktoren',
      regroup: 'Umsortieren: erst alle a, dann alle b.',
      value: 'Wert',
      ladderTitle: 'Jede Stufe nach unten: durch a teilen',
      ladderWhy: 'Teilen durch a heißt: Exponent um 1 kleiner. So kommt man von a¹ = a zu a⁰ = 1 und weiter zu a⁻¹ = 1/a.',
      rootTitle: 'a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ',
      rootWhy: 'Warum? (a^(1/n))ⁿ = a^(n/n) = a¹ = a – also ist a^(1/n) die n-te Wurzel.',
      exact: 'genau',
      approx: 'ungefähr',
      graph: 'Graph von y = {a}ˣ',
      steps: 'Schritte (von innen nach außen)',
      noSteps: 'Hier ist nichts umzuformen.',
      result: 'Ergebnis',
      powerForm: 'Potenzform',
      rootForm: 'mit Wurzeln',
      yours: 'Deine Vereinfachung',
      right: 'Richtig! Dein Term ist gleichwertig.',
      wrong: 'Noch nicht gleichwertig.',
      typeHere: 'Gib unter „Deine Vereinfachung“ dein Ergebnis ein und drücke „Prüfen“.',
      allLaws: 'Alle Gesetze (farbig: hier benutzt)',
      parseErr: 'Der Term lässt sich ab Zeichen {p} nicht lesen.',
      parseEmpty: 'Bitte einen Term eingeben, z. B. a^3 · a^4.',
      parseZero: 'Durch 0 teilen (oder 0 als Basis) geht nicht.',
      negRoot: 'Wurzeln aus negativen Zahlen gibt es hier nicht.',
      hidden: 'Ergebnis verdeckt',
      check: 'Probe mit Zahlen',
    },
    en: {
      drT: 'Mental arithmetic with powers',
      drHow: 'Replace ? with the right number and tap “Check”.',
      drOk: 'Correct!',
      drNo: 'Not yet.',
      drScore: '{k} of {n} correct · streak: {s}',
      dr_mul: 'Multiplying with the same base: add the exponents.',
      dr_div: 'Dividing with the same base: subtract the exponents.',
      dr_powpow: 'Power of a power: multiply the exponents.',
      dr_neg: 'Negative exponent: a⁻ⁿ = 1 : aⁿ.',
      dr_frac: 'Fractional exponent: a^(m/n) = (ⁿ√a)ᵐ – first the root, then the power.',
      dr_sci: 'How many places does the decimal point move? To the right: negative exponent.',
      dr_zero: 'aⁿ : aⁿ = aⁿ⁻ⁿ = a⁰ = 1.',
      fnT: 'Power function f(x) = {e}',
      sym_axis: 'Even exponent: symmetric about the y-axis.',
      sym_point: 'Odd exponent: symmetric about the origin.',
      sym_none: 'Even root exponent: defined only for x ≥ 0, no symmetry.',
      dom: 'domain',
      dom_R: 'all real numbers',
      'dom_R0+': 'x ≥ 0',
      'dom_R+': 'x > 0',
      'dom_R\\0': 'x ≠ 0',
      fnNeg: 'Negative exponent: x^(−n) = 1/xⁿ. At x = 0 there is a pole; for large x the graph approaches 0.',
      fnPos: 'All graphs y = xⁿ with n > 0 pass through (0 | 0) and (1 | 1).',
      fnInv: 'Reflected in y = x: the inverse of xⁿ is x^(1/n), the n-th root.',
      sciT: 'Powers of ten',
      sciScale: 'picture width: 10{k} m = {v}',
      sciG: 'Each step to the right makes the picture ten times wider. From the width of a proton to the Milky Way there are 36 powers of ten.',
      sciIn: 'In the picture',
      sciRatio: '{a} is about 10^{k} times as large as {b}.',
      sciPrefix: 'prefix',
      canvas: 'Laws of exponents made visible: factor tiles that are pushed together, cancelled or grouped, a ladder of exponents, the graph of y = aˣ and a term simplifier with steps.',
      factors: '{k} factors',
      cancel: 'Equal factors on top and bottom cancel.',
      groups: '{n} groups of {m} factors',
      regroup: 'Reorder: first all a, then all b.',
      value: 'value',
      ladderTitle: 'Each step down: divide by a',
      ladderWhy: 'Dividing by a lowers the exponent by 1. That is how a¹ = a leads to a⁰ = 1 and on to a⁻¹ = 1/a.',
      rootTitle: 'a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ',
      rootWhy: 'Why? (a^(1/n))ⁿ = a^(n/n) = a¹ = a – so a^(1/n) is the n-th root.',
      exact: 'exactly',
      approx: 'approximately',
      graph: 'graph of y = {a}ˣ',
      steps: 'Steps (from inside out)',
      noSteps: 'Nothing to transform here.',
      result: 'Result',
      powerForm: 'power form',
      rootForm: 'with roots',
      yours: 'Your simplification',
      right: 'Correct! Your term is equivalent.',
      wrong: 'Not equivalent yet.',
      typeHere: 'Enter your result under “Your simplification” and press “Check”.',
      allLaws: 'All laws (coloured: used here)',
      parseErr: 'The term cannot be read from character {p} on.',
      parseEmpty: 'Please enter a term, e.g. a^3 · a^4.',
      parseZero: 'Division by 0 (or 0 as a base) is not possible.',
      negRoot: 'Roots of negative numbers are not covered here.',
      hidden: 'result hidden',
      check: 'Check with numbers',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 4) => fmt.num(v, d);
    const S = (n: number) => sup(String(n).replace('-', '−'));
    /** Zahl groß: mit Tausenderpunkten, sehr groß als Zehnerpotenz. */
    const big = (v: number) => (Math.abs(v) < 1e9 ? fmt.num(v, 6) : `${N(v / 10 ** Math.floor(Math.log10(v)), 3)} · 10${S(Math.floor(Math.log10(v)))}`);

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const law = () => p.law as LawView;
    const A = () => (p.sym ? 'a' : String(p.a));
    const B = () => (p.sym ? 'b' : String(p.b));

    type TermState = { ok: true; mono: Mono; steps: Step[]; node: unknown } | { ok: false; msg: string };
    let term: TermState = readTerm();
    let verdict: { ok: boolean } | null = null;

    function readTerm(): TermState {
      const r = parseTerm(p.t);
      if (!r.ok) return { ok: false, msg: r.msg === 'empty' ? tr('parseEmpty') : r.msg === 'zero' ? tr('parseZero') : tr('parseErr', { p: r.pos + 1 }) };
      try {
        const s = simplify(r.node);
        return { ok: true, mono: s.mono, steps: s.steps, node: r.node };
      } catch {
        return { ok: false, msg: tr('negRoot') };
      }
    }

    /* -------------------------------------------------------------- */
    /* Animation, Layout, Farben                                       */
    /* -------------------------------------------------------------- */

    const anim = new Tween(2200, ease.inOutCubic);
    const verdictTw = new Tween(500, ease.outBack);
    anim.play();
    const k = () => anim.value;

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { main: Rect; card: Rect } {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const mw = Math.round(W * 0.6);
        return { main: { x: pad, y: pad, w: mw - pad, h: H - 2 * pad }, card: { x: mw + pad, y: pad, w: W - mw - 2 * pad, h: H - 2 * pad } };
      }
      const mh = Math.round(H * 0.55);
      return { main: { x: pad, y: pad, w: W - 2 * pad, h: mh }, card: { x: pad, y: mh + 2 * pad, w: W - 2 * pad, h: H - mh - 3 * pad } };
    }
    const COL = {
      a: () => th().series[0]!,
      b: () => th().series[1]!,
      res: () => th().series[4]!,
      good: () => th().series[2]!,
      warn: () => th().series[3]!,
      aux: () => th().series[5]!,
    };

    let plotArea: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const plot = new Plot(surface, {
      x: [-3, 3],
      y: [-1, 9],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => plotArea,
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });

    /* -------------------------------------------------------------- */
    /* Text                                                            */
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

    /* -------------------------------------------------------------- */
    /* Kacheln                                                         */
    /* -------------------------------------------------------------- */

    /** Eine Faktor-Kachel mit Beschriftung. */
    function tile(g: CanvasRenderingContext2D, x: number, y: number, s: number, label: string, col: string, alpha = 1, crossed = 0): void {
      const t = th();
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(col, t.dark ? 0.3 : 0.16);
      g.strokeStyle = col;
      g.lineWidth = 2;
      roundRect(g, x - s / 2, y - s / 2, s, s, s * 0.18);
      g.fill();
      g.stroke();
      g.fillStyle = col;
      g.font = `${p.sym ? 'italic ' : ''}700 ${s * (label.length > 1 ? 0.42 : 0.52)}px ${t.font}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, x, y + 1);
      if (crossed > 0) {
        g.strokeStyle = withAlpha(COL.warn(), crossed);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x - s * 0.42, y + s * 0.42);
        g.lineTo(x - s * 0.42 + s * 0.84 * crossed, y + s * 0.42 - s * 0.84 * crossed);
        g.stroke();
      }
      g.restore();
    }

    function drawLaws(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const tt = k();
      const m = p.m;
      const n = p.n;
      const maxTiles = law() === 'powpow' ? m * n : law() === 'prodpow' ? 2 * n : m + n;
      const s = clamp(Math.min((R.w - 60) / Math.max(6, law() === 'powpow' ? m * n + n : maxTiles + 1), R.h / 7), 16, 46);
      const gap = s * 0.18;
      const cx = R.x + R.w / 2;
      const head = (txt: string, y: number, col = t.text) => segLine(g, [{ s: txt, c: col, w: 800 }], R.x + 18, y, R.w - 36, Math.min(22, s * 0.6 + 6));
      if (law() === 'mul') {
        // zwei Reihen → eine Reihe
        const y1 = R.y + R.h * 0.24;
        const y2 = R.y + R.h * 0.4;
        const yRes = R.y + R.h * 0.58;
        head(`${A()}${S(m)} · ${A()}${S(n)}`, R.y + 26);
        const total = m + n;
        const rowW = (c: number) => c * (s + gap) - gap;
        const startRes = cx - rowW(total) / 2 + s / 2;
        for (let i = 0; i < m; i++) {
          const x0 = cx - rowW(m) / 2 + s / 2 + i * (s + gap);
          const x1 = startRes + i * (s + gap);
          tile(g, lerp(x0, x1, tt), lerp(y1, yRes, tt), s, A(), COL.a());
        }
        for (let i = 0; i < n; i++) {
          const x0 = cx - rowW(n) / 2 + s / 2 + i * (s + gap);
          const x1 = startRes + (m + i) * (s + gap);
          tile(g, lerp(x0, x1, tt), lerp(y2, yRes, tt), s, A(), COL.b());
        }
        if (tt < 0.3) {
          segLine(g, [{ s: tr('factors', { k: m }), c: COL.a(), w: 600 }], R.x + 18, y1 - s * 0.9, R.w - 36, 12);
          segLine(g, [{ s: tr('factors', { k: n }), c: COL.b(), w: 600 }], R.x + 18, y2 - s * 0.9, R.w - 36, 12);
        }
        if (tt > 0.95) segLine(g, [{ s: `= ${A()}${S(m)}${S(n) ? '⁺' + S(n).replace('⁻', '') : ''} = ${A()}${S(total)}  (${tr('factors', { k: total })})`, c: COL.res(), w: 800 }], R.x + 18, yRes + s * 1.1, R.w - 36, 16);
        return;
      }
      if (law() === 'div') {
        // Bruch: m oben, n unten, Paare kürzen
        head(`${A()}${S(m)} : ${A()}${S(n)}`, R.y + 26);
        const yTop = R.y + R.h * 0.38;
        const yBot = R.y + R.h * 0.62;
        const rowW = (c: number) => c * (s + gap) - gap;
        const pairs = Math.min(m, n);
        const cut = clamp(tt * 1.6, 0, 1);
        const fade = clamp(tt * 1.6 - 0.6, 0, 1);
        const lineW = Math.max(rowW(Math.max(m, n, 1)), s * 2) + 20;
        g.save();
        g.strokeStyle = t.text;
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(cx - lineW / 2, (yTop + yBot) / 2);
        g.lineTo(cx + lineW / 2, (yTop + yBot) / 2);
        g.stroke();
        g.restore();
        for (let i = 0; i < m; i++) {
          const x = cx - rowW(m) / 2 + s / 2 + i * (s + gap);
          tile(g, x, yTop, s, A(), COL.a(), i < pairs ? 1 - fade * 0.75 : 1, i < pairs ? cut : 0);
        }
        for (let i = 0; i < n; i++) {
          const x = cx - rowW(n) / 2 + s / 2 + i * (s + gap);
          tile(g, x, yBot, s, A(), COL.b(), i < pairs ? 1 - fade * 0.75 : 1, i < pairs ? cut : 0);
        }
        if (m === 0) segLine(g, [{ s: '1', c: t.text, w: 800 }], cx - 5, yTop, 30, 20);
        if (n === 0) segLine(g, [{ s: '1', c: t.text, w: 800 }], cx - 5, yBot, 30, 20);
        if (tt > 0.95) {
          const d = m - n;
          const res = d === 0 ? `${A()}⁰ = 1` : d > 0 ? `${A()}${S(d)}` : `${A()}${S(d)} = 1 / ${A()}${S(-d)}`;
          segLine(g, [{ s: `= ${A()}${S(m)}⁻${S(n).replace('⁻', '')} = ${res}`, c: COL.res(), w: 800 }], R.x + 18, R.y + R.h * 0.84, R.w - 36, 16);
          segLine(g, [{ s: tr('cancel'), c: t.muted }], R.x + 18, R.y + R.h * 0.93, R.w - 36, 12.5);
        }
        return;
      }
      if (law() === 'powpow') {
        head(`(${A()}${S(m)})${S(n)}`, R.y + 26);
        const groupW = m * (s + gap) - gap + 16;
        const totalW = n * groupW + (n - 1) * 10;
        const scaleFit = Math.min(1, (R.w - 40) / Math.max(1, totalW));
        const ss = s * scaleFit;
        const gW = m * (ss + gap * scaleFit) - gap * scaleFit + 16 * scaleFit;
        const y0 = R.y + R.h * 0.42;
        const yRes = R.y + R.h * 0.68;
        const all = n * m;
        const resW = all * (ss + gap * scaleFit) - gap * scaleFit;
        for (let gi = 0; gi < n; gi++) {
          const gx = cx - (n * gW + (n - 1) * 10 * scaleFit) / 2 + gi * (gW + 10 * scaleFit);
          // Klammer um die Gruppe
          g.save();
          g.globalAlpha = 1 - tt;
          g.strokeStyle = withAlpha(t.text, 0.5);
          g.lineWidth = 1.5;
          roundRect(g, gx, y0 - ss * 0.75, gW, ss * 1.5, 8);
          g.stroke();
          g.restore();
          for (let i = 0; i < m; i++) {
            const x0 = gx + 8 * scaleFit + ss / 2 + i * (ss + gap * scaleFit);
            const x1 = cx - resW / 2 + ss / 2 + (gi * m + i) * (ss + gap * scaleFit);
            tile(g, lerp(x0, x1, tt), lerp(y0, yRes, tt), ss, A(), gi % 2 ? COL.b() : COL.a());
          }
        }
        if (tt < 0.3) segLine(g, [{ s: tr('groups', { n, m }), c: t.muted, w: 600 }], R.x + 18, y0 - ss * 1.4, R.w - 36, 12.5);
        if (tt > 0.95) segLine(g, [{ s: `= ${A()}${S(m)}·${S(n).replace('⁻', '')} = ${A()}${S(m * n)}`, c: COL.res(), w: 800 }], R.x + 18, yRes + ss * 1.2, R.w - 36, 16);
        return;
      }
      // (a·b)ⁿ: n Paare → a…a b…b
      head(`(${A()} · ${B()})${S(n)}`, R.y + 26);
      const pairW = 2 * (s + gap) + 12;
      const y0 = R.y + R.h * 0.4;
      const yA = R.y + R.h * 0.62;
      const resW = n * (s + gap) - gap;
      for (let i = 0; i < n; i++) {
        const px = cx - (n * pairW) / 2 + i * pairW + 6;
        g.save();
        g.globalAlpha = 1 - tt;
        g.strokeStyle = withAlpha(t.text, 0.5);
        g.lineWidth = 1.5;
        roundRect(g, px - 4, y0 - s * 0.72, pairW - 4, s * 1.44, 8);
        g.stroke();
        g.restore();
        const xa0 = px + s / 2;
        const xb0 = px + s / 2 + s + gap;
        const xa1 = cx - resW - 10 + s / 2 + i * (s + gap);
        const xb1 = cx + 10 + s / 2 + i * (s + gap);
        tile(g, lerp(xa0, xa1, tt), lerp(y0, yA, tt), s, A(), COL.a());
        tile(g, lerp(xb0, xb1, tt), lerp(y0, yA, tt), s, B(), COL.b());
      }
      if (tt > 0.95) segLine(g, [{ s: `= ${A()}${S(n)} · ${B()}${S(n)}`, c: COL.res(), w: 800 }], R.x + 18, yA + s * 1.2, R.w - 36, 16);
      if (tt > 0.3 && tt < 0.95) segLine(g, [{ s: tr('regroup'), c: t.muted }], R.x + 18, R.y + R.h * 0.9, R.w - 36, 12.5);
    }

    /* -------------------------------------------------------------- */
    /* Treppe                                                          */
    /* -------------------------------------------------------------- */

    function drawLadder(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const a = p.a;
      const rows = [4, 3, 2, 1, 0, -1, -2, -3];
      const top = R.y + 44;
      const h = (R.h - 64) / rows.length;
      const x0 = R.x + 30;
      const reveal = k() * (rows.length + 0.5);
      segLine(g, [{ s: tr('ladderTitle'), c: t.muted, w: 700 }], R.x + 18, R.y + 22, R.w - 36, 13);
      rows.forEach((e, i) => {
        const y = top + h * (i + 0.5);
        const a1 = clamp(reveal - i, 0, 1);
        if (a1 <= 0) return;
        const val = powQ(q(a), q(e)).exact!;
        const stepW = (R.w - 80) * (0.5 + 0.5 * ((rows.length - 1 - i) / (rows.length - 1)));
        g.save();
        g.globalAlpha = a1;
        g.fillStyle = withAlpha(e >= 0 ? COL.a() : COL.b(), t.dark ? 0.22 : 0.12);
        roundRect(g, x0, y - h * 0.42, stepW, h * 0.84, 7);
        g.fill();
        g.restore();
        const col = e === 0 ? COL.res() : e > 0 ? COL.a() : COL.b();
        segLine(g, [{ s: `${a}${S(e)}`, c: col, w: 800 }], x0 + 10, y, 70, Math.min(20, h * 0.5), a1);
        segLine(g, [{ s: `= ${e < 0 ? `1/${a}${S(-e)} = ` : ''}${qText(val)}`, c: t.text, w: 600 }], x0 + 80, y, stepW - 84, Math.min(17, h * 0.45), a1);
        if (i < rows.length - 1 && reveal > i + 1) {
          // Pfeil „: a“
          const ax = x0 + stepW + 14;
          g.save();
          g.strokeStyle = withAlpha(t.text, 0.55);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(ax, y + 4);
          g.quadraticCurveTo(ax + 16, y + h / 2, ax, y + h - 4);
          g.stroke();
          g.restore();
          segLine(g, [{ s: `: ${a}`, c: t.muted, w: 700 }], ax + 14, y + h / 2, 60, 12);
        }
      });
    }

    /* -------------------------------------------------------------- */
    /* Graph y = aˣ mit gebrochenem Exponenten                         */
    /* -------------------------------------------------------------- */

    function drawRoots(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const a = p.a;
      const e = q(p.pm, p.pn);
      const ev = e.n / e.d;
      const val = a ** ev;
      const xMax = Math.max(1.6, Math.abs(ev) + 0.7);
      const yMax = Math.max(val, a, 1) * 1.6;
      plotArea = { x: R.x + 8, y: R.y + 34, w: R.w - 16, h: R.h - 42 };
      plot.setRange([-xMax, xMax], [-yMax * 0.06, yMax]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      plot.fn((x) => a ** x, { color: COL.a(), width: 2.6 });
      // ganze Exponenten als Punkte
      for (let x = -Math.floor(xMax); x <= Math.floor(xMax); x++) plot.point(x, a ** x, { color: withAlpha(COL.a(), 0.7), radius: 3 });
      // n-tel Unterteilung zwischen 0 und 1 (bzw. bis ev)
      const steps = Math.round(Math.abs(ev) * e.d);
      const tt = k();
      for (let j = 1; j <= steps; j++) {
        const x = (Math.sign(ev) * j) / e.d;
        if (j / steps > tt + 1e-9) break;
        plot.point(x, a ** x, { color: withAlpha(COL.b(), 0.8), radius: 3.2 });
        plot.segment([x - Math.sign(ev) / e.d, 0], [x, 0], { color: withAlpha(COL.b(), 0.5), width: 4 });
      }
      if (tt > 0.95) {
        plot.segment([ev, 0], [ev, val], { color: withAlpha(COL.res(), 0.6), width: 1.4, dash: [4, 4] });
        plot.segment([0, val], [ev, val], { color: withAlpha(COL.res(), 0.6), width: 1.4, dash: [4, 4] });
        plot.point(ev, val, { color: COL.res(), radius: 6 });
        plot.text(ev, val, `${a}^(${qText(e)}) = ${N(val, 4)}`, { color: COL.res(), size: 13, weight: 'bold', offset: [ev >= 0 ? -10 : 10, -14], align: ev >= 0 ? 'right' : 'left', halo: true });
      }
      plot.text(Math.min(xMax * 0.9, Math.log(yMax * 0.9) / Math.log(a)), Math.min(a ** (xMax * 0.9), yMax * 0.9), `y = ${a}ˣ`, { color: COL.a(), size: 13, weight: 'bold', align: 'right', offset: [-6, 0], halo: true, math: true });
      plot.end();
      segLine(g, [{ s: tr('graph', { a }), c: t.muted, w: 700 }], R.x + 18, R.y + 18, R.w - 36, 13);
    }

    /* -------------------------------------------------------------- */
    /* Termumformer (Hauptfläche: Schritte als Karten)                 */
    /* -------------------------------------------------------------- */

    function drawTermSteps(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const x = R.x + 18;
      const maxW = R.w - 36;
      let y = R.y + 26;
      const parsed = parseTerm(p.t);
      y += segLine(g, [{ s: parsed.ok ? nodeText(parsed.node) : p.t, c: t.text, w: 800 }], x, y, maxW, 19);
      if (!term.ok) {
        segLine(g, [{ s: term.msg, c: COL.warn(), w: 600 }], x, y + 4, maxW, 14);
        return;
      }
      y += 6;
      y += segLine(g, [{ s: tr('steps'), c: t.muted, w: 700 }], x, y, maxW, 13);
      if (!term.steps.length) y += segLine(g, [{ s: tr('noSteps'), c: t.muted }], x, y, maxW, 13);
      const reveal = k() * (term.steps.length + 0.4);
      term.steps.forEach((st, i) => {
        const a = clamp(reveal - i, 0, 1);
        if (a <= 0 || y > R.y + R.h - 70) return;
        const info = LAWS[st.law];
        const h = 50;
        g.save();
        g.globalAlpha = a;
        g.fillStyle = withAlpha(COL.a(), t.dark ? 0.14 : 0.07);
        roundRect(g, x - 6, y - 4, maxW + 12, h, 10);
        g.fill();
        g.restore();
        segLine(g, [{ s: `${info.name[ctx.lang]}: `, c: COL.a(), w: 700 }, { s: info.formula, c: t.muted }], x, y + 9, maxW, 12.5, a);
        segLine(g, [{ s: `${st.from} = `, c: t.text, w: 600 }, { s: p.show || verdict?.ok ? st.to : '…', c: COL.res(), w: 700 }], x, y + 30, maxW, 14.5, a);
        y += h + 8;
      });
      // Übersicht aller Gesetze, wenn Platz ist
      const used = new Set(term.steps.map((st) => st.law));
      const list: Law[] = ['mulSame', 'divSame', 'powPow', 'prodPow', 'quotPow', 'zero', 'neg', 'root'];
      const lh = 19;
      const boxH = lh * (list.length + 1.4);
      const by = R.y + R.h - boxH - 10;
      if (by < y + 10) return;
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.18);
      g.setLineDash([4, 4]);
      roundRect(g, x - 6, by, maxW + 12, boxH, 10);
      g.stroke();
      g.restore();
      segLine(g, [{ s: tr('allLaws'), c: t.muted, w: 700 }], x, by + lh * 0.75, maxW, 12.5);
      list.forEach((lw, i) => {
        const on = used.has(lw);
        const yy = by + lh * (i + 1.7);
        segLine(g, [{ s: LAWS[lw].formula, c: on ? COL.a() : t.muted, w: on ? 800 : 600 }], x + 4, yy, maxW * 0.42, 13);
        segLine(g, [{ s: LAWS[lw].name[ctx.lang], c: on ? t.text : t.muted, w: on ? 600 : 500 }], x + maxW * 0.45, yy, maxW * 0.55, 12.5);
      });
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.a());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      if (p.mode === 'fn') {
        const e = fe();
        line([{ s: tr('fnT', { e: e.d === 1 ? `x${sup(qText(e).replace('−', '-'))}` : `x^(${qText(e)})` }), c: COL.a(), w: 800 }], 0);
        const sy = symmetryOf(e.n, e.d);
        const dm = domainOf(e.n, e.d);
        line([{ s: `${ctx.t('dom')}: ${ctx.t(`dom_${dm}`)}`, c: t.text, w: 600 }], -1);
        line([{ s: ctx.t(`sym_${sy}`), c: COL.res(), w: 600 }], -1);
        if (p.show) {
          const y2 = powReal(p.fx, e.n, e.d);
          if (y2 !== null) line([{ s: `f(${N(p.fx, 2)}) = ${N(p.fx, 2)}${e.d === 1 ? sup(qText(e).replace('−', '-')) : `^(${qText(e)})`} = ${N(y2, 4)}`, c: t.text }], -1.5);
          if (e.n !== 0 && e.d === 1 && e.n > 0) line([{ s: `f(−x) = ${e.n % 2 === 0 ? 'f(x)' : '−f(x)'}`, c: t.muted }], -1.5);
        }
        y += 4;
        line([{ s: ctx.t(e.n < 0 ? 'fnNeg' : 'fnPos'), c: t.muted }], -2);
        if (p.inv) line([{ s: ctx.t('fnInv'), c: COL.b() }], -2);
        return;
      }
      if (p.mode === 'sci') {
        const zv = sciView();
        const W = Math.pow(10, zv);
        line([{ s: ctx.t('sciT'), c: COL.a(), w: 800 }], 0);
        line([{ s: tr('sciScale', { k: Math.abs(zv - Math.round(zv)) < 0.05 ? sup(String(Math.round(zv))) : `^${fmt.num(zv, 1)}`, v: (() => {
          const pr = prefixFor(W);
          return `${N(W / Math.pow(10, pr.exp), 2)} ${pr.sym}m${pr.de ? ` (${ctx.lang === 'de' ? pr.de : pr.en})` : ''}`;
        })() }), c: t.text, w: 700 }], -0.5);
        const areaW = Math.max(100, regions().main.w - 20);
        const vis = THINGS.filter((o) => (o.size / W) * areaW > 4 && o.size / W < 1.3);
        if (vis.length) {
          line([{ s: `${ctx.t('sciIn')}:`, c: t.muted, w: 600 }], -1.5);
          for (const o of vis.slice(0, 4)) line([{ s: `${ctx.lang === 'de' ? o.de : o.en}: ${lenText(o.size)}`, c: t.text }], -2);
          if (vis.length >= 2) {
            const big = vis[vis.length - 1]!;
            const small = vis[0]!;
            line([{ s: tr('sciRatio', { a: ctx.lang === 'de' ? big.de : big.en, b: ctx.lang === 'de' ? small.de : small.en, k: orderRatio(big.size, small.size) }).replace('10^', '10').replace(/10(\d+)/, (_, d: string) => `10${sup(d)}`), c: COL.res(), w: 600 }], -1.5);
          }
        }
        y += 4;
        line([{ s: ctx.t('sciG'), c: t.muted }], -2);
        return;
      }
      if (p.mode === 'drill') {
        line([{ s: ctx.t('drT'), c: COL.a(), w: 800 }], 0);
        line([{ s: ctx.t('drHow'), c: t.muted }], -1.5);
        if (drScore.all) line([{ s: tr('drScore', { k: drScore.right, n: drScore.all, s: drScore.streak }), c: t.text, w: 700 }], -1);
        if (drRes === false && drTries >= 2) line([{ s: `${ctx.lang === 'de' ? 'Lösung' : 'Solution'}: ? = ${drill.answer}`, c: COL.b(), w: 700 }], -1);
        y += 4;
        for (const r of ['mul', 'div', 'powpow', 'neg', 'frac']) line([{ s: ctx.t(`dr_${r}`), c: t.muted }], -2.5);
        return;
      }
      if (p.mode === 'laws') {
        const m = p.m;
        const n = p.n;
        const a = p.a;
        const map: Record<LawView, Law> = { mul: 'mulSame', div: 'divSame', powpow: 'powPow', prodpow: 'prodPow' };
        const info = LAWS[map[law()]];
        line([{ s: info.name[ctx.lang], c: t.muted, w: 700 }], -1);
        line([{ s: info.formula, c: COL.res(), w: 800 }], 4);
        y += 6;
        if (law() === 'mul') {
          line([{ s: `${A()}${S(m)} · ${A()}${S(n)} = ${A()}${S(m + n)}`, c: t.text, w: 700 }], 1);
          if (!p.sym && p.show) line([{ s: `${big(a ** m)} · ${big(a ** n)} = ${big(a ** (m + n))}`, c: t.muted }], -1);
        } else if (law() === 'div') {
          const d = m - n;
          line([{ s: `${A()}${S(m)} : ${A()}${S(n)} = ${A()}${S(d)}`, c: t.text, w: 700 }], 1);
          if (d < 0) line([{ s: `${A()}${S(d)} = 1 / ${A()}${S(-d)}`, c: COL.b(), w: 700 }]);
          if (d === 0) line([{ s: `${A()}⁰ = 1`, c: COL.res(), w: 700 }]);
          if (!p.sym && p.show) line([{ s: `${big(a ** m)} : ${big(a ** n)} = ${qText(powQ(q(a), q(d)).exact!)}`, c: t.muted }], -1);
        } else if (law() === 'powpow') {
          line([{ s: `(${A()}${S(m)})${S(n)} = ${A()}${S(m * n)}`, c: t.text, w: 700 }], 1);
          line([{ s: `= ${Array.from({ length: n }, () => `${A()}${S(m)}`).join(' · ')}`, c: t.muted }], -1.5);
          if (!p.sym && p.show) line([{ s: `= ${big(a ** (m * n))}`, c: t.muted }], -1);
        } else {
          line([{ s: `(${A()} · ${B()})${S(n)} = ${A()}${S(n)} · ${B()}${S(n)}`, c: t.text, w: 700 }], 1);
          if (!p.sym && p.show) line([{ s: `${big((p.a * p.b) ** n)} = ${big(p.a ** n)} · ${big(p.b ** n)}`, c: t.muted }], -1);
        }
        y += 8;
        line([{ s: ctx.lang === 'de' ? 'Vorsicht, typische Fehler:' : 'Careful, typical mistakes:', c: t.muted, w: 700 }], -2);
        const traps: Record<LawView, string[]> = {
          mul: [`${A()}${S(m)} · ${A()}${S(n)} ≠ ${A()}${S(m * n)}`, `${A()}${S(m)} + ${A()}${S(n)} ≠ ${A()}${S(m + n)}`],
          div: [`${A()}${S(m)} : ${A()}${S(n)} ≠ ${A()}^(${m} : ${n})`, `${A()}⁰ ≠ 0`],
          powpow: [`(${A()}${S(m)})${S(n)} ≠ ${A()}${S(m + n)}`, `${A()}^(${m}${S(n)}) ≠ (${A()}${S(m)})${S(n)}`],
          prodpow: [`(${A()} + ${B()})${S(n)} ≠ ${A()}${S(n)} + ${B()}${S(n)}`],
        };
        for (const tx of traps[law()]) line([{ s: `✗  ${tx}`, c: COL.warn(), w: 600 }], -1.5);
        return;
      }
      if (p.mode === 'ladder') {
        line([{ s: 'a⁰ = 1,   a⁻ⁿ = 1 / aⁿ', c: COL.res(), w: 800 }], 3);
        y += 4;
        line([{ s: tr('ladderWhy'), c: t.text }], -1.5);
        y += 6;
        const a = p.a;
        line([{ s: `${a}² : ${a}⁵ = ${a}⁻³ = 1/${a ** 3}`, c: t.text, w: 600 }], -1);
        line([{ s: `${a}³ : ${a}³ = ${a}⁰ = 1`, c: t.text, w: 600 }], -1);
        line([{ s: `${a}⁻¹ · ${a} = ${a}⁰ = 1`, c: t.text, w: 600 }], -1);
        return;
      }
      if (p.mode === 'roots') {
        const a = p.a;
        const e = q(p.pm, p.pn);
        const r = powQ(q(a), e);
        line([{ s: tr('rootTitle'), c: COL.res(), w: 800 }], 1);
        y += 4;
        const base = `${a}^(${qText(e)})`;
        line([{ s: base, c: t.text, w: 800 }], 3);
        if (e.d > 1) {
          const idx = e.d === 2 ? '√' : `${sup(String(e.d))}√`;
          const m = Math.abs(e.n);
          const inner = m === 1 ? `${idx}${a}` : `${idx}(${a}${S(m)}) = (${idx}${a})${S(m)}`;
          line([{ s: `= ${e.n < 0 ? `1 / ${m === 1 ? `${idx}${a}` : `(${inner})`}` : inner}`, c: t.text }], -0.5);
          const root = powQ(q(a), q(1, e.d));
          line([{ s: `${idx}${a} = ${root.exact ? qText(root.exact) : `≈ ${N(root.value, 4)}`}`, c: COL.b(), w: 600 }], -1);
        }
        if (p.show) line([{ s: r.exact ? `= ${qText(r.exact)}  (${tr('exact')})` : `≈ ${N(r.value, 5)}  (${tr('approx')})`, c: COL.res(), w: 800 }], 2);
        y += 6;
        line([{ s: tr('rootWhy'), c: t.muted }], -2);
        return;
      }
      // Terme
      line([{ s: tr('result'), c: t.muted, w: 700 }], -1);
      if (!term.ok) return void line([{ s: term.msg, c: COL.warn(), w: 600 }], -1);
      const revealRes = p.show || !!verdict?.ok;
      if (revealRes) {
        line([{ s: monoText(term.mono), c: COL.res(), w: 800 }], 4);
        const pf = monoPowerForm(term.mono);
        if (pf !== monoText(term.mono)) line([{ s: `${tr('powerForm')}: ${pf}`, c: t.muted }], -1.5);
        const rf = monoText(term.mono, true);
        if (rf !== monoText(term.mono)) line([{ s: `${tr('rootForm')}: ${rf}`, c: t.muted }], -1.5);
        // Probe mit Zahlen
        const vars = Object.fromEntries([...term.mono.pow.keys()].filter((v) => /[a-z]/.test(v)).map((v, i) => [v, [2, 3, 5][i] ?? 7]));
        const r0 = parseTerm(p.t);
        if (Object.keys(vars).length && r0.ok) {
          const left = monoValue(simplify(r0.node).mono, vars);
          line([{ s: `${tr('check')} (${Object.entries(vars).map(([kk, v]) => `${kk} = ${v}`).join(', ')}): ${N(left, 4)}`, c: t.muted }], -2);
        }
      } else line([{ s: tr('hidden'), c: t.muted }], -1);
      y += 8;
      // eigene Vereinfachung
      line([{ s: tr('yours'), c: t.muted, w: 700 }], -1);
      if (!p.g.trim()) line([{ s: tr('typeHere'), c: t.muted }], -2);
      else {
        const r = parseTerm(p.g);
        line([{ s: p.g, c: r.ok ? t.text : COL.warn(), w: 700 }]);
        if (verdict) {
          const a = verdictTw.running ? clamp(verdictTw.value, 0, 1) : 1;
          const col = verdict.ok ? COL.good() : COL.warn();
          g.save();
          g.globalAlpha = a;
          g.fillStyle = withAlpha(col, t.dark ? 0.2 : 0.1);
          roundRect(g, x - 8, y - size * 0.4, maxW + 16, size * 2.3, 10);
          g.fill();
          g.restore();
          segLine(g, [{ s: verdict.ok ? tr('right') : tr('wrong'), c: col, w: 800 }], x, y + size * 0.75, maxW, size, a);
          y += size * 2.6;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Potenzfunktionen                                                */
    /* -------------------------------------------------------------- */

    const fe = () => q(p.fm, p.fd);
    plot.addHandle({
      get: () => {
        const y = powReal(p.fx, fe().n, fe().d);
        return [p.fx, y ?? 0];
      },
      set: (x) => ctx.set({ fx: Math.round(clamp(x, -3, 3) * 20) / 20 }),
      enabled: () => !ctx.locked && p.mode === 'fn' && powReal(p.fx, fe().n, fe().d) !== null,
      color: () => COL.res(),
      axis: 'x',
    });
    /** Graph von x^(m/n) mit Lücke an Polstellen. */
    function powGraph(m: number, n: number, col: string, width: number, upto: number): void {
      const b = plot.bounds;
      let cur: [number, number][] = [];
      const flush = () => {
        if (cur.length > 1) plot.polyline(cur, { color: col, width });
        cur = [];
      };
      const N2 = 400;
      for (let i = 0; i <= N2; i++) {
        const x = b.xMin + ((b.xMax - b.xMin) * i) / N2;
        if (x > b.xMin + (b.xMax - b.xMin) * upto) break;
        const y = powReal(Math.abs(x) < 1e-9 ? 0 : x, m, n);
        if (y === null || !Number.isFinite(y) || Math.abs(y) > 60) {
          flush();
          continue;
        }
        const last = cur[cur.length - 1];
        if (last && Math.sign(last[0]) !== Math.sign(x) && Math.abs(y - last[1]) > 5) flush();
        cur.push([x, y]);
      }
      flush();
    }
    function drawFn(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      plotArea = { x: R.x + 8, y: R.y + 34, w: R.w - 16, h: R.h - 42 };
      const e = fe();
      const ratio = plotArea.w / plotArea.h;
      const yr = 4;
      plot.setRange([-yr * Math.max(1, ratio * 0.8), yr * Math.max(1, ratio * 0.8)], [-yr, yr]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      const u = k();
      if (p.fam) {
        const fam = e.n > 0 ? [1, 2, 3, 4, 5] : [-1, -2, -3];
        for (const f of fam) if (!(f === e.n && e.d === 1)) powGraph(f, 1, withAlpha(t.muted, 0.35), 1.2, 1);
      }
      if (p.inv) {
        plot.line([0, 0], [1, 1], { color: withAlpha(t.text, 0.35), width: 1.2, dash: [5, 4] });
        // Umkehrung: x^(n/m) (nur sinnvoll für m ≠ 0)
        if (e.n !== 0) powGraph(e.d * Math.sign(e.n), Math.abs(e.n), withAlpha(COL.b(), 0.9), 2.4, u);
      }
      powGraph(e.n, e.d, COL.a(), 3, u);
      plot.point(1, 1, { color: withAlpha(t.text, 0.6), radius: 3 });
      const y = powReal(p.fx, e.n, e.d);
      if (y !== null && Math.abs(y) < 50 && u > 0.98) {
        plot.segment([p.fx, 0], [p.fx, y], { color: withAlpha(COL.res(), 0.6), width: 1.2, dash: [4, 3] });
        plot.point(p.fx, y, { color: COL.res(), radius: 6 });
        if (p.show) plot.text(p.fx, y, `(${N(p.fx, 2)} | ${N(y, 3)})`, { color: COL.res(), size: 12, weight: 'bold', offset: [10, -12], align: 'left', halo: true });
      }
      plot.end();
      segLine(g, [{ s: `f(x) = x${sup(e.d === 1 ? qText(e) : '')}${e.d === 1 ? '' : `^(${qText(e)})`}`, c: COL.a(), w: 800 }], R.x + 18, R.y + 18, R.w - 36, 15);
    }

    /* -------------------------------------------------------------- */
    /* Zehnerpotenzen                                                  */
    /* -------------------------------------------------------------- */

    /** angezeigte Größenordnung (gleitet weich zum eingestellten Wert) */
    let zCur = p.zx;
    const tourTw = new Tween(16000, ease.inOutCubic);
    let touring = false;
    let lastT = performance.now();
    let sciViewEnd = p.zx;
    function sciView(): number {
      return tourTw.running ? -15 + 36 * tourTw.value : zCur;
    }
    function lenText(v: number): string {
      const { a, k: kk } = sciParts(v);
      const pr = prefixFor(v);
      const inPr = v / Math.pow(10, pr.exp);
      return `${N(a, 2)} · 10${sup(String(kk))} m = ${N(inPr, inPr < 10 ? 2 : inPr < 100 ? 1 : 0)} ${pr.sym}m`;
    }
    function thingIcon(g: CanvasRenderingContext2D, id: string, cx: number, cy: number, r: number): void {
      const t = th();
      g.save();
      g.lineWidth = Math.max(1, r * 0.06);
      switch (id) {
        case 'atom': {
          g.strokeStyle = COL.a();
          for (const rot of [0, Math.PI / 3, -Math.PI / 3]) {
            g.beginPath();
            g.ellipse(cx, cy, r, r * 0.35, rot, 0, Math.PI * 2);
            g.stroke();
          }
          g.fillStyle = COL.b();
          g.beginPath();
          g.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
          g.fill();
          break;
        }
        case 'human': {
          g.strokeStyle = t.text;
          g.lineWidth = Math.max(1.5, r * 0.08);
          g.beginPath();
          g.arc(cx, cy - r * 0.75, r * 0.15, 0, Math.PI * 2);
          g.moveTo(cx, cy - r * 0.6);
          g.lineTo(cx, cy + r * 0.2);
          g.lineTo(cx - r * 0.25, cy + r);
          g.moveTo(cx, cy + r * 0.2);
          g.lineTo(cx + r * 0.25, cy + r);
          g.moveTo(cx - r * 0.35, cy - r * 0.3);
          g.lineTo(cx + r * 0.35, cy - r * 0.3);
          g.stroke();
          break;
        }
        case 'earth': {
          const gr = g.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
          gr.addColorStop(0, '#7fb8ff');
          gr.addColorStop(1, '#1f4fa8');
          g.fillStyle = gr;
          g.beginPath();
          g.arc(cx, cy, r, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = 'rgba(90,170,90,0.85)';
          g.beginPath();
          g.ellipse(cx - r * 0.2, cy - r * 0.1, r * 0.35, r * 0.25, 0.5, 0, Math.PI * 2);
          g.fill();
          break;
        }
        case 'sun': {
          const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
          gr.addColorStop(0, '#fff3b0');
          gr.addColorStop(1, '#f0a020');
          g.fillStyle = gr;
          g.beginPath();
          g.arc(cx, cy, r, 0, Math.PI * 2);
          g.fill();
          break;
        }
        case 'galaxy': {
          g.strokeStyle = withAlpha(COL.res(), 0.8);
          for (const arm of [0, Math.PI]) {
            g.beginPath();
            for (let i = 0; i <= 40; i++) {
              const a2 = arm + (i / 40) * 4;
              const rr = r * (0.1 + (0.9 * i) / 40);
              const x = cx + rr * Math.cos(a2);
              const y = cy + rr * Math.sin(a2) * 0.5;
              if (i) g.lineTo(x, y);
              else g.moveTo(x, y);
            }
            g.stroke();
          }
          break;
        }
        case 'virus': {
          g.strokeStyle = COL.good();
          g.fillStyle = withAlpha(COL.good(), 0.3);
          g.beginPath();
          g.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          for (let i = 0; i < 12; i++) {
            const a2 = (i / 12) * Math.PI * 2;
            g.beginPath();
            g.moveTo(cx + Math.cos(a2) * r * 0.7, cy + Math.sin(a2) * r * 0.7);
            g.lineTo(cx + Math.cos(a2) * r, cy + Math.sin(a2) * r);
            g.stroke();
          }
          break;
        }
        case 'bacterium': {
          g.fillStyle = withAlpha(COL.good(), 0.45);
          g.strokeStyle = COL.good();
          roundRect(g, cx - r, cy - r * 0.35, 2 * r, r * 0.7, r * 0.35);
          g.fill();
          g.stroke();
          break;
        }
        default: {
          g.strokeStyle = COL.aux();
          g.fillStyle = withAlpha(COL.aux(), 0.18);
          g.beginPath();
          g.arc(cx, cy, r, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
      }
      g.restore();
    }
    function drawSci(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      zCur += (p.zx - zCur) * Math.min(1, dt * 5);
      if (touring && !tourTw.running) {
        touring = false;
        zCur = 21;
        ctx.set({ zx: 21 });
      }
      sciViewEnd = sciView();
      const zv = sciView();
      const W = Math.pow(10, zv);
      const area: Rect = { x: R.x + 10, y: R.y + 40, w: R.w - 20, h: R.h - 96 };
      // Dinge, die im Bild sichtbar groß sind
      const vis = THINGS.map((th2, i) => ({ th2, i, px: (th2.size / W) * area.w })).filter((o) => o.px > 4 && o.px < area.w * 1.3);
      g.save();
      roundRect(g, area.x, area.y, area.w, area.h, 10);
      g.clip();
      g.fillStyle = t.dark ? '#0d121b' : '#f5f7fb';
      g.fillRect(area.x, area.y, area.w, area.h);
      vis.forEach((o, j) => {
        const r = o.px / 2;
        const cx = area.x + area.w * (0.2 + 0.6 * ((o.i * 0.37) % 1));
        const cy = area.y + area.h * (0.35 + 0.3 * ((o.i * 0.53) % 1));
        thingIcon(g, o.th2.id, cx, cy, r);
        if (r < area.w * 0.6) {
          g.font = `700 12px ${t.font}`;
          g.fillStyle = t.text;
          g.textAlign = 'center';
          g.fillText(ctx.lang === 'de' ? o.th2.de : o.th2.en, cx, Math.min(area.y + area.h - 8, cy + r + 16 + (j % 2) * 14));
        }
      });
      g.restore();
      // Maßstab
      const ly = R.y + R.h - 44;
      g.save();
      g.strokeStyle = t.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(area.x, ly);
      g.lineTo(area.x + area.w, ly);
      g.moveTo(area.x, ly - 6);
      g.lineTo(area.x, ly + 6);
      g.moveTo(area.x + area.w, ly - 6);
      g.lineTo(area.x + area.w, ly + 6);
      g.stroke();
      g.font = `700 13px ${t.font}`;
      g.fillStyle = t.text;
      g.textAlign = 'center';
      g.fillText(lenText(W), area.x + area.w / 2, ly + 22);
      g.restore();
      // Zehnerpotenz-Leiste
      g.save();
      g.font = `800 ${R.w < 420 ? 15 : 18}px ${t.font}`;
      g.fillStyle = COL.a();
      g.textAlign = 'left';
      g.fillText(`10${sup(String(Math.round(zv)))} m`, R.x + 16, R.y + 26);
      g.restore();
      if (Math.abs(p.zx - zCur) > 0.005 || tourTw.running) ctx.requestRender();
    }

    /* -------------------------------------------------------------- */
    /* Übung: Kopfrechnen                                              */
    /* -------------------------------------------------------------- */

    let drill: Drill = makeDrill(1);
    let drRes: boolean | null = null;
    let drTries = 0;
    let drScore = { right: 0, all: 0, streak: 0 };
    const drPop = new Tween(450, ease.outBack);
    function checkDr(): void {
      const r = checkDrill(drill, p.da);
      if (r === null) return;
      drRes = r;
      drTries += 1;
      if (drTries === 1) drScore = { right: drScore.right + (r ? 1 : 0), all: drScore.all + 1, streak: r ? drScore.streak + 1 : 0 };
      drPop.play();
    }
    function drawDrill(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h * 0.4;
      const fs = Math.min(54, R.w / 11);
      g.save();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      const ans = drRes ? String(drill.answer) : p.da.trim() ? p.da.trim().replace('-', '−') : '?';
      const filled = drill.task.includes('^?') && ans !== '?' ? drill.task.replace('^?', sup(ans.replace('−', '-'))) : drill.task.replace('?', ans);
      // Aufgabe groß, die Lücke farbig
      g.font = `800 ${fs}px ${t.font}`;
      const parts = filled.split(/(\^?[−\-]?\d+$|\?$)/);
      const full = g.measureText(filled).width;
      let x = cx - full / 2;
      g.textAlign = 'left';
      const shownAns = drill.task.includes('^?') && ans !== '?' ? sup(ans.replace('−', '-')) : ans;
      const idx = filled.lastIndexOf(shownAns);
      const head = filled.slice(0, idx);
      const tail = filled.slice(idx);
      g.fillStyle = t.text;
      g.fillText(head, x, cy);
      x += g.measureText(head).width;
      const s2 = drPop.running ? drPop.value : 1;
      g.save();
      g.translate(x + g.measureText(tail).width / 2, cy);
      g.scale(s2, s2);
      g.fillStyle = drRes === null ? COL.res() : drRes ? COL.good() : COL.b();
      g.textAlign = 'center';
      g.fillText(tail, 0, 0);
      g.restore();
      void parts;
      // Rückmeldung
      g.textAlign = 'center';
      if (drRes !== null) {
        g.font = `800 ${Math.round(fs * 0.5)}px ${t.font}`;
        g.fillStyle = drRes ? COL.good() : COL.b();
        g.fillText(ctx.t(drRes ? 'drOk' : 'drNo'), cx, cy + fs * 1.3);
        g.font = `500 ${Math.round(fs * 0.32)}px ${t.font}`;
        g.fillStyle = t.muted;
        g.fillText(ctx.t(`dr_${drill.rule}`), cx, cy + fs * 1.95);
      }
      // Fortschrittspunkte
      const n = Math.min(10, drScore.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(cx - 90 + i * 20, R.y + R.h - 30, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < drScore.right ? COL.good() : COL.b()) : withAlpha(t.muted, 0.25);
        g.fill();
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      if (p.mode === 'terms') {
        ctx.readout('term', p.t);
        ctx.readout('res', term.ok ? monoText(term.mono) : term.msg);
        return;
      }
      if (p.mode === 'fn') {
        const y = powReal(p.fx, fe().n, fe().d);
        ctx.readout('term', `f(x) = x^(${qText(fe())})`);
        ctx.readout('res', y === null ? '–' : `f(${N(p.fx, 2)}) = ${N(y, 4)}`);
        return;
      }
      if (p.mode === 'drill') {
        ctx.readout('term', drill.task);
        ctx.readout('res', drRes ? String(drill.answer) : '–');
        return;
      }
      if (p.mode === 'sci') {
        ctx.readout('term', `10^${N(p.zx, 1)} m`);
        ctx.readout('res', lenText(Math.pow(10, p.zx)));
        return;
      }
      if (p.mode === 'roots') {
        const e = q(p.pm, p.pn);
        const r = powQ(q(p.a), e);
        ctx.readout('term', `${p.a}^(${qText(e)})`);
        ctx.readout('res', r.exact ? qText(r.exact) : `≈ ${N(r.value, 5)}`);
        return;
      }
      if (p.mode === 'ladder') {
        ctx.readout('term', `${p.a}⁰, ${p.a}⁻¹, ${p.a}⁻²`);
        ctx.readout('res', `1, 1/${p.a}, 1/${p.a * p.a}`);
        return;
      }
      const m = p.m;
      const n = p.n;
      const txt: Record<LawView, [string, string]> = {
        mul: [`${A()}${S(m)} · ${A()}${S(n)}`, `${A()}${S(m + n)}`],
        div: [`${A()}${S(m)} : ${A()}${S(n)}`, `${A()}${S(m - n)}`],
        powpow: [`(${A()}${S(m)})${S(n)}`, `${A()}${S(m * n)}`],
        prodpow: [`(${A()} · ${B()})${S(n)}`, `${A()}${S(n)} · ${B()}${S(n)}`],
      };
      ctx.readout('term', txt[law()][0]);
      ctx.readout('res', txt[law()][1]);
    }

    function runCheck(): void {
      const a = parseTerm(p.t);
      const b = parseTerm(p.g);
      if (!a.ok || !b.ok) {
        verdict = null;
        ctx.requestRender();
        return;
      }
      verdict = { ok: sameTerm(a.node, b.node) };
      verdictTw.play();
      ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('t') || source === 'init' || source === 'replace') term = readTerm();
        if (changed.has('t') || changed.has('g')) verdict = null;
        if (['mode', 'law', 'm', 'n', 'a', 'b', 'pm', 'pn', 't', 'sym', 'fm', 'fd', 'inv'].some((x) => changed.has(x)) || source === 'init' || source === 'replace') anim.play(changed.has('m') || changed.has('n') ? 1400 : 2200);
        if (changed.has('zx') && source !== 'input') zCur = p.zx;
        if (changed.has('dq') || source === 'init' || source === 'replace') {
          drill = makeDrill(p.dq);
          drRes = null;
          drTries = 0;
        }
        if (changed.has('da') && drRes === false) drRes = null;
        if (changed.has('zx') && source === 'input' && tourTw.running) {
          tourTw.finish();
          touring = false;
          zCur = sciViewEnd;
        }
        updateReadouts();
      },
      action(id) {
        if (id === 'play') anim.play();
        if (id === 'tour') {
          tourTw.play();
          touring = true;
          ctx.requestRender();
        }
        if (id === 'dcheck') {
          checkDr();
          updateReadouts();
          ctx.requestRender();
        }
        if (id === 'dnext') ctx.set({ dq: p.dq >= 999 ? 1 : p.dq + 1, da: '' });
        if (id === 'in') ctx.set({ zx: Math.max(-15, Math.round((p.zx - 1) * 10) / 10) });
        if (id === 'out') ctx.set({ zx: Math.min(21, Math.round((p.zx + 1) * 10) / 10) });
        if (id === 'check') runCheck();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawCard(g, R.main, th());
        if (p.mode === 'laws') drawLaws(g, R.main);
        else if (p.mode === 'ladder') drawLadder(g, R.main);
        else if (p.mode === 'roots') drawRoots(g, R.main);
        else if (p.mode === 'fn') drawFn(g, R.main);
        else if (p.mode === 'sci') drawSci(g, R.main);
        else if (p.mode === 'drill') drawDrill(g, R.main);
        else drawTermSteps(g, R.main);
        drawCardBody(g, R.card);
        if (tourTw.running) ctx.requestRender();
        if (anim.running || verdictTw.running || drPop.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
