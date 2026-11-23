import { defineSimulation, drawCard, Plot, roundRect, Surface, term, Tween, ease, withAlpha, type Rect } from '../../../sim-core';
import { clean, CONTEXTS, contextReach, contextValue, hits, isRounded, lineRelation, lineThrough, slopeAngleDeg, tableRows, targetLine, zeroOf, type ContextId } from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Lineare Funktion f(x) = m·x + t
 *
 * Bezeichnung wie in Bayern: y-Achsenabschnitt t (englisch c). Der
 * Parameter-Schlüssel bleibt `b` bzw. `b2`, weil er in geteilten Links steht.
 *
 * Ziehbare Punkte: y-Achsenabschnitt (ändert t) und Spitze des
 * Steigungsdreiecks (ändert m). Optional eine zweite Gerade g zum Vergleich
 * (parallel, senkrecht, Schnittpunkt).
 */
export default defineSimulation({
  id: 'lineare-funktion',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.56 },
  hint: { de: 'Tipp: Zieh den Punkt auf der y-Achse (t) oder am Steigungsdreieck (m).', en: 'Tip: Drag the point on the y-axis (t) or on the slope triangle (m).' },
  groups: [
    { id: 'g', label: L('Zweite Gerade g', 'Second line g') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'explore', label: L('Gerade erkunden', 'Explore the line') },
        { value: 'points', label: L('Gerade durch zwei Punkte', 'Line through two points') },
        { value: 'table', label: L('Wertetabelle', 'Table of values') },
        { value: 'context', label: L('Aus dem Alltag', 'Everyday situations') },
        { value: 'quiz', label: L('Übung: Gerade treffen', 'Practice: hit the line') },
      ],
      default: 'explore',
    },
    {
      key: 'cx',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'taxi', label: L('Taxifahrt', 'Taxi ride') },
        { value: 'candle', label: L('Brennende Kerze', 'Burning candle') },
        { value: 'tariff', label: L('Zwei Handytarife', 'Two phone plans') },
        { value: 'tank', label: L('Wassertank füllen', 'Filling a water tank') },
      ],
      default: 'taxi',
      visibleIf: (v) => v.mode === 'context',
    },
    { key: 'cs', type: 'number', label: L('Ablesestelle x', 'Read-off value x'), min: 0, max: 400, step: 0.5, default: 6, visibleIf: (v) => v.mode === 'context' },
    {
      key: 'qt',
      type: 'choice',
      label: L('Aufgabe', 'Task'),
      options: [
        { value: 'read', label: L('Gleichung ablesen', 'Read the equation') },
        { value: 'draw', label: L('Gerade zeichnen', 'Draw the line') },
      ],
      default: 'read',
      visibleIf: (v) => v.mode === 'quiz',
    },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    { key: 'px1', type: 'number', label: L('P: x', 'P: x'), min: -9, max: 9, step: 0.5, default: -2, visibleIf: (v) => v.mode === 'points' },
    { key: 'py1', type: 'number', label: L('P: y', 'P: y'), min: -6, max: 6, step: 0.5, default: -1, visibleIf: (v) => v.mode === 'points' },
    { key: 'px2', type: 'number', label: L('Q: x', 'Q: x'), min: -9, max: 9, step: 0.5, default: 4, visibleIf: (v) => v.mode === 'points' },
    { key: 'py2', type: 'number', label: L('Q: y', 'Q: y'), min: -6, max: 6, step: 0.5, default: 2, visibleIf: (v) => v.mode === 'points' },
    { key: 'm', type: 'number', label: L('Steigung m', 'Slope m'), min: -5, max: 5, step: 0.1, default: 0.5, visibleIf: (v) => v.mode === 'explore' || v.mode === 'table' || (v.mode === 'quiz' && v.qt === 'read') },
    { key: 'b', type: 'number', label: L('y-Achsenabschnitt t', 'y-intercept c'), min: -8, max: 8, step: 0.1, default: 1, visibleIf: (v) => v.mode === 'explore' || v.mode === 'table' || (v.mode === 'quiz' && v.qt === 'read') },
    { key: 'second', type: 'boolean', group: 'g', label: L('Zweite Gerade g(x) = m₂x + t₂', 'Second line g(x) = m₂x + c₂'), default: false, visibleIf: (v) => v.mode === 'explore' },
    {
      key: 'm2',
      type: 'number',
      group: 'g',
      label: L('Steigung m₂', 'Slope m₂'),
      min: -5,
      max: 5,
      step: 0.1,
      default: -2,
      visibleIf: (v) => v.second === true && v.mode === 'explore',
    },
    {
      key: 'b2',
      type: 'number',
      group: 'g',
      label: L('y-Achsenabschnitt t₂', 'y-intercept c₂'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 3,
      visibleIf: (v) => v.second === true && v.mode === 'explore',
    },
    { key: 'triangle', type: 'boolean', group: 'view', label: L('Steigungsdreieck', 'Slope triangle'), default: true, visibleIf: (v) => v.mode === 'explore' || v.mode === 'quiz' },
    { key: 'zero', type: 'boolean', group: 'view', label: L('Nullstelle', 'Zero (x-intercept)'), default: true, visibleIf: (v) => v.mode === 'explore' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'qcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'qnext', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'f', label: L('Funktionsgleichung', 'Equation'), spoiler: true },
    { key: 'course', label: L('Verlauf', 'Behaviour') },
    { key: 'angle', label: L('Steigungswinkel', 'Angle of inclination'), spoiler: true },
    { key: 'zero', label: L('Nullstelle', 'Zero'), spoiler: true },
    { key: 'g', label: L('Zweite Gerade', 'Second line'), spoiler: true },
    { key: 'relation', label: L('Lage der Geraden', 'Relative position'), spoiler: true },
  ],
  presets: [
    { id: 'origin', label: L('Ursprungsgerade', 'Line through origin'), values: { m: 1, b: 0 } },
    { id: 'falling', label: L('Fallende Gerade', 'Decreasing line'), values: { m: -2, b: 3 } },
    { id: 'constant', label: L('Konstante Funktion', 'Constant function'), values: { m: 0, b: 2 } },
    { id: 'parallel', label: L('Parallele Geraden', 'Parallel lines'), values: { m: 0.5, b: 1, second: true, m2: 0.5, b2: -2 } },
    { id: 'perpendicular', label: L('Senkrechte Geraden', 'Perpendicular lines'), values: { m: 2, b: -1, second: true, m2: -0.5, b2: 2 } },
    { id: 'points', label: L('Gerade durch P und Q', 'Line through P and Q'), values: { mode: 'points', px1: -2, py1: -1, px2: 4, py2: 2 } },
    { id: 'table', label: L('Wertetabelle', 'Table of values'), values: { mode: 'table', m: 1.5, b: -2 } },
    { id: 'taxi', label: L('Taxifahrt', 'Taxi ride'), values: { mode: 'context', cx: 'taxi', cs: 6 } },
    { id: 'tariff', label: L('Handytarife vergleichen', 'Compare phone plans'), values: { mode: 'context', cx: 'tariff', cs: 100 } },
    { id: 'quiz', label: L('Übung: Gerade treffen', 'Practice: hit the line'), values: { mode: 'quiz', qt: 'read', qn: 1, m: 1, b: 0 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen der linearen Funktion f(x) = mx + t, dem Steigungsdreieck und dem Schnittpunkt mit der y-Achse; auf Wunsch eine zweite Gerade g',
      rising: 'steigend (m > 0)',
      falling: 'fallend (m < 0)',
      constant: 'konstant (m = 0), parallel zur x-Achse',
      none: 'keine – die Gerade ist parallel zur x-Achse',
      everywhere: 'unendlich viele – der Graph liegt auf der x-Achse',
      identical: 'identisch (gleiche Steigung und gleicher y-Achsenabschnitt)',
      parallel: 'parallel – kein Schnittpunkt (gleiche Steigung)',
      perpendicular: 'senkrecht zueinander (m · m₂ = −1), Schnittpunkt',
      intersect: 'Schnittpunkt',
      intercept: 't',
      ptsT: 'Gerade durch zwei Punkte', ptsHow: 'Zieh P und Q. Die Steigung ist „Δy durch Δx“ – wie weit es nach oben geht, wenn man nach rechts geht.',
      ptsM: 'm = Δy : Δx = {dy} : {dx} = {m}', ptsT2: 't = y₁ − m · x₁ = {y1} − {m} · {x1} = {t}', ptsVert: 'Δx = 0: Die Gerade ist senkrecht (x = {x}). Sie ist keine Funktion, denn zu einem x gehören viele y.', ptsSame: 'P und Q liegen aufeinander – durch einen Punkt gehen unendlich viele Geraden.',
      tabT: 'Wertetabelle', tabHow: 'Gehst du in der Tabelle eine Zeile weiter (x + 1), ändert sich y immer um denselben Wert: um m.', tabStep: 'jeweils {m}', tabStart: 'Bei x = 0 steht der y-Achsenabschnitt: f(0) = {t}',
      quizRead: 'Welche Gleichung hat die gestrichelte Gerade?', quizReadHow: 'Stelle m und t so ein (Regler oder Punkte ziehen), dass deine Gerade genau auf der gestrichelten liegt. Tipp: t am Schnitt mit der y-Achse ablesen, m mit einem Steigungsdreieck.',
      quizDraw: 'Zeichne die Gerade', quizDrawHow: 'Zieh die beiden Punkte so, dass deine Gerade zur Gleichung passt. Erst t auf der y-Achse, dann vom Punkt aus 1 nach rechts und m nach oben.',
      quizOk: 'Getroffen!', quizNo: 'Noch nicht – gesucht war {eq}.', quizYours: 'Deine Gerade: {eq}', quizScore: '{k} von {n} getroffen',
      cTaxi: 'Taxifahrt', cTaxiD: 'Ein Taxi kostet 3,50 € Grundpreis und 2,00 € pro Kilometer.', cTaxiX: 'Strecke x in km', cTaxiY: 'Preis y in €', cTaxiW: 'Preis = 3,50 € + 2,00 € · Kilometer', cTaxiM: 'm = 2: jeder Kilometer kostet 2,00 € mehr', cTaxiT: 't = 3,50: so viel kostet es schon bei 0 km', cTaxiR: 'Für {x} km zahlst du {y} €.',
      cCandle: 'Brennende Kerze', cCandleD: 'Eine 20 cm hohe Kerze brennt pro Stunde 1,5 cm ab.', cCandleX: 'Zeit x in h', cCandleY: 'Höhe y in cm', cCandleW: 'Höhe = 20 cm − 1,5 cm · Stunden', cCandleM: 'm = −1,5: pro Stunde 1,5 cm weniger (fallende Gerade)', cCandleT: 't = 20: die Höhe am Anfang', cCandleR: 'Nach {x} h ist die Kerze noch {y} cm hoch.', cCandleZ: 'Nullstelle: Nach etwa {z} h ist die Kerze abgebrannt.',
      cTariff: 'Zwei Handytarife', cTariffD: 'Tarif A: 5 € im Monat und 9 ct pro Minute. Tarif B: 15 € im Monat und 4 ct pro Minute.', cTariffX: 'Gesprächszeit x in min', cTariffY: 'Kosten y in €', cTariffW: 'A: y = 0,09x + 5    B: y = 0,04x + 15', cTariffM: 'A ist steiler (teurer pro Minute), B startet höher (teurere Grundgebühr).', cTariffT: 'Schnittpunkt S(200 | 23): bei 200 Minuten sind beide gleich teuer.', cTariffR: 'Bei {x} min: A kostet {a} €, B kostet {b} €.', cTariffA: 'Hier ist Tarif A günstiger.', cTariffB: 'Hier ist Tarif B günstiger.', cTariffE: 'Hier sind beide gleich teuer.',
      cTank: 'Wassertank füllen', cTankD: 'Im Tank sind schon 40 Liter. Pro Minute laufen 15 Liter dazu.', cTankX: 'Zeit x in min', cTankY: 'Menge y in l', cTankW: 'Menge = 40 l + 15 l · Minuten', cTankM: 'm = 15: pro Minute 15 Liter mehr', cTankT: 't = 40: so viel ist am Anfang schon drin', cTankR: 'Nach {x} min sind {y} l im Tank.',
    },
    en: {
      canvas: 'Coordinate system with the graph of the linear function f(x) = mx + c, the slope triangle and the y-intercept; optionally a second line g',
      rising: 'increasing (m > 0)',
      falling: 'decreasing (m < 0)',
      constant: 'constant (m = 0), parallel to the x-axis',
      none: 'none – the line is parallel to the x-axis',
      everywhere: 'infinitely many – the graph lies on the x-axis',
      identical: 'identical (same slope and same y-intercept)',
      parallel: 'parallel – no intersection (same slope)',
      perpendicular: 'perpendicular (m · m₂ = −1), intersection',
      intersect: 'Intersection',
      intercept: 'c',
      ptsT: 'Line through two points', ptsHow: 'Drag P and Q. The slope is “Δy over Δx” – how far you go up when you go to the right.',
      ptsM: 'm = Δy ÷ Δx = {dy} ÷ {dx} = {m}', ptsT2: 'c = y₁ − m · x₁ = {y1} − {m} · {x1} = {t}', ptsVert: 'Δx = 0: the line is vertical (x = {x}). It is not a function, because one x has many y.', ptsSame: 'P and Q coincide – infinitely many lines pass through a single point.',
      tabT: 'Table of values', tabHow: 'Moving one row down (x + 1), y always changes by the same amount: by m.', tabStep: 'each {m}', tabStart: 'At x = 0 you find the y-intercept: f(0) = {t}',
      quizRead: 'What is the equation of the dashed line?', quizReadHow: 'Set m and c (sliders or drag the points) so that your line lies exactly on the dashed one. Hint: read c where it crosses the y-axis, m with a slope triangle.',
      quizDraw: 'Draw the line', quizDrawHow: 'Drag both points so that your line matches the equation. First c on the y-axis, then from there 1 to the right and m up.',
      quizOk: 'Hit!', quizNo: 'Not yet – the answer was {eq}.', quizYours: 'Your line: {eq}', quizScore: '{k} of {n} hit',
      cTaxi: 'Taxi ride', cTaxiD: 'A taxi costs a flat fee of €3.50 plus €2.00 per kilometre.', cTaxiX: 'distance x in km', cTaxiY: 'price y in €', cTaxiW: 'price = €3.50 + €2.00 · kilometres', cTaxiM: 'm = 2: each kilometre costs €2.00 more', cTaxiT: 'c = 3.50: what you pay at 0 km already', cTaxiR: 'For {x} km you pay €{y}.',
      cCandle: 'Burning candle', cCandleD: 'A 20 cm candle burns down 1.5 cm per hour.', cCandleX: 'time x in h', cCandleY: 'height y in cm', cCandleW: 'height = 20 cm − 1.5 cm · hours', cCandleM: 'm = −1.5: 1.5 cm less per hour (decreasing line)', cCandleT: 'c = 20: the height at the start', cCandleR: 'After {x} h the candle is still {y} cm tall.', cCandleZ: 'Zero: after about {z} h the candle has burnt down.',
      cTariff: 'Two phone plans', cTariffD: 'Plan A: €5 a month and 9 cents per minute. Plan B: €15 a month and 4 cents per minute.', cTariffX: 'call time x in min', cTariffY: 'cost y in €', cTariffW: 'A: y = 0.09x + 5    B: y = 0.04x + 15', cTariffM: 'A is steeper (more per minute), B starts higher (higher monthly fee).', cTariffT: 'Intersection S(200 | 23): at 200 minutes both cost the same.', cTariffR: 'At {x} min: A costs €{a}, B costs €{b}.', cTariffA: 'Here plan A is cheaper.', cTariffB: 'Here plan B is cheaper.', cTariffE: 'Here both cost the same.',
      cTank: 'Filling a water tank', cTankD: 'The tank already holds 40 litres. 15 litres flow in per minute.', cTankX: 'time x in min', cTankY: 'volume y in l', cTankW: 'volume = 40 l + 15 l · minutes', cTankM: 'm = 15: 15 litres more per minute', cTankT: 'c = 40: what is in the tank at the start', cTankR: 'After {x} min there are {y} l in the tank.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    // Die Aufteilung wird erst weiter unten definiert; bis dahin die ganze Fläche
    let layoutReady = false;
    const plot = new Plot(surface, { x: [-10, 10], y: [-7, 7], region: (w, h) => (layoutReady ? mainRegion() : { x: 0, y: 0, w, h }) });
    const p = ctx.params;
    const color = {
      f: () => ctx.theme.series[0]!,
      g: () => ctx.theme.series[1]!,
      triangle: () => ctx.theme.series[2]!,
      zero: () => ctx.theme.series[3]!,
    };
    const editable = () => !ctx.locked;

    const lineMode = () => p.mode === 'explore' || p.mode === 'table' || p.mode === 'quiz';
    plot.addHandle({ get: () => [0, p.b], set: (_x, y) => ctx.set({ b: y }), axis: 'y', enabled: () => editable() && lineMode(), color: color.f });
    plot.addHandle({ get: () => [1, p.b + p.m], set: (_x, y) => ctx.set({ m: y - p.b }), axis: 'y', enabled: () => editable() && lineMode(), color: color.triangle });
    plot.addHandle({
      get: () => [0, p.b2],
      set: (_x, y) => ctx.set({ b2: y }),
      axis: 'y',
      enabled: () => editable() && p.second && p.mode === 'explore',
      color: color.g,
    });
    plot.addHandle({
      get: () => [1, p.b2 + p.m2],
      set: (_x, y) => ctx.set({ m2: y - p.b2 }),
      axis: 'y',
      enabled: () => editable() && p.second && p.mode === 'explore',
      color: color.g,
    });

    const fmt = ctx.fmt;
    /** „=“, wenn der gerundete Wert exakt ist, sonst „≈“ (z. B. x₀ ≈ −1,33 statt = −1,33). */
    const relSign = (value: number, decimals: number) => (isRounded(value, decimals) ? '≈' : '=');
    const lineTerm = (name: string, m: number, b: number) =>
      term.fnDef(name, term.sum([{ coef: m, body: term.x }, { coef: b, body: '' }], fmt));

    /** Position für die Beschriftung einer Geraden am Rand des sichtbaren Bereichs. */
    function labelPosition(m: number, b: number): [number, number] {
      const { xMin, xMax, yMin, yMax } = plot.bounds;
      const margin = 34 / plot.scale.x;
      let x = xMax - margin;
      let y = m * x + b;
      const top = yMax - 24 / plot.scale.y;
      const bottom = yMin + 24 / plot.scale.y;
      if (y > top && m !== 0) x = (top - b) / m;
      else if (y < bottom && m !== 0) x = (bottom - b) / m;
      x = Math.max(xMin + margin, Math.min(xMax - margin, x));
      y = m * x + b;
      return [x, y];
    }

    function exploreReadouts(): void {
        ctx.readout('f', { html: lineTerm('f', p.m, p.b) });
        ctx.readout('course', p.m > 0 ? ctx.t('rising') : p.m < 0 ? ctx.t('falling') : ctx.t('constant'));
        const alpha = slopeAngleDeg(p.m);
        ctx.readout('angle', `α ${relSign(alpha, 1)} ${fmt.num(alpha, 1)}°`);

        const x0 = zeroOf(p.m, p.b);
        if (typeof x0 === 'number') {
          ctx.readout('zero', { html: `${term.v('x')}<sub>0</sub> ${relSign(x0, 2)} ${fmt.num(x0)} &nbsp;→&nbsp; N${fmt.point(x0, 0)}` });
        } else {
          ctx.readout('zero', x0 === 'all' ? ctx.t('everywhere') : ctx.t('none'));
        }

        if (p.second) {
          ctx.readout('g', { html: lineTerm('g', p.m2, p.b2) });
          const rel = lineRelation(p.m, p.b, p.m2, p.b2);
          if (rel.kind === 'identical') ctx.readout('relation', ctx.t('identical'));
          else if (rel.kind === 'parallel') ctx.readout('relation', ctx.t('parallel'));
          else {
            const label = rel.perpendicular ? ctx.t('perpendicular') : ctx.t('intersect');
            ctx.readout('relation', `${label} S${fmt.point(rel.x, rel.y)}`);
          }
        } else {
          ctx.readout('g', null);
          ctx.readout('relation', null);
        }
      }

    function drawExplore(): void {
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        const f = (x: number) => p.m * x + p.b;
        const muted = ctx.theme.muted;

        if (p.second) {
          plot.line([0, p.b2], [1, p.b2 + p.m2], { color: color.g(), width: 2.5 });
          const [lx, ly] = labelPosition(p.m2, p.b2);
          plot.text(lx, ly, 'g', { color: color.g(), math: true, size: 18, offset: [6, -8] });
        }

        plot.line([0, p.b], [1, p.b + p.m], { color: color.f(), width: 3 });
        const [lx, ly] = labelPosition(p.m, p.b);
        plot.text(lx, ly, 'f', { color: color.f(), math: true, size: 18, offset: [6, -8] });

        if (p.triangle) {
          const c = color.triangle();
          plot.polygon(
            [
              [0, f(0)],
              [1, f(0)],
              [1, f(1)],
            ],
            { fill: c, alpha: 0.14 },
          );
          plot.segment([0, f(0)], [1, f(0)], { color: c, width: 2 });
          plot.segment([1, f(0)], [1, f(1)], { color: c, width: 2 });
          const below = p.m >= 0;
          plot.text(0.5, f(0), '1', { color: c, align: 'center', baseline: below ? 'top' : 'bottom', offset: [0, below ? 5 : -5], weight: '600' });
          plot.text(1, (f(0) + f(1)) / 2, `m = ${fmt.num(p.m, 1)}`, { color: c, baseline: 'middle', offset: [8, 0], weight: '600' });
          plot.point(1, f(1), { color: c, radius: 5 });
        }

        if (p.second) {
          const rel = lineRelation(p.m, p.b, p.m2, p.b2);
          if (rel.kind === 'intersect') {
            plot.point(rel.x, rel.y, { color: ctx.theme.text, radius: 5 });
            plot.text(rel.x, rel.y, 'S', { math: true, size: 16, offset: [8, -8] });
          }
          plot.point(0, p.b2, { color: color.g(), radius: 5 });
          plot.point(1, p.b2 + p.m2, { color: color.g(), radius: 4, hollow: true });
        }

        const x0 = zeroOf(p.m, p.b);
        if (p.zero && typeof x0 === 'number') {
          plot.point(x0, 0, { color: color.zero(), radius: 5 });
          // Beschriftung auf die Seite, auf der die Gerade nicht verläuft
          const right = p.m < 0;
          plot.text(x0, 0, 'N', { color: color.zero(), math: true, size: 16, align: right ? 'left' : 'right', offset: [right ? 8 : -8, -9] });
        }

        plot.point(0, p.b, { color: color.f(), radius: 6 });
        plot.text(0, p.b, `${ctx.t('intercept')} = ${fmt.num(p.b, 1)}`, { color: muted, offset: [-10, -10], align: 'right', size: 13 });
        plot.end();
      }

    /* -------------------------------------------------------------- */
    /* Aufteilung: Karte + Koordinatensystem                           */
    /* -------------------------------------------------------------- */

    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const OFF: Rect = { x: -2000, y: -2000, w: 10, h: 10 };
    const wide = () => surface.width >= 600 && surface.width >= surface.height * 1.2;
    function regions(): { card: Rect; plot: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide()) {
        const cw = Math.round(w * 0.4);
        return { card: { x: pad, y: pad, w: cw - pad, h: h - 2 * pad }, plot: { x: cw + pad, y: pad, w: w - cw - 2 * pad, h: h - 2 * pad } };
      }
      const ratio = p.mode === 'table' ? 0.52 : p.mode === 'context' ? 0.52 : p.mode === 'points' ? 0.46 : 0.36;
      const ch = Math.round(h * ratio);
      return { card: { x: pad, y: pad, w: w - 2 * pad, h: ch }, plot: { x: pad, y: ch + 2 * pad, w: w - 2 * pad, h: h - ch - 3 * pad } };
    }
    const mainRegion = (): Rect => {
      if (p.mode === 'explore') return { x: 0, y: 0, w: surface.width, h: surface.height };
      if (p.mode === 'context') return OFF;
      const r = regions().plot;
      return { x: r.x + 4, y: r.y + 4, w: r.w - 8, h: r.h - 8 };
    };
    // Sachsituation: eigenes Koordinatensystem mit Einheiten
    const plotC = new Plot(surface, {
      x: [0, 16],
      y: [0, 40],
      equalAspect: false,
      region: () => {
        if (p.mode !== 'context') return OFF;
        const r = regions().plot;
        return { x: r.x + 4, y: r.y + 4, w: r.w - 8, h: r.h - 8 };
      },
    });
    layoutReady = true;
    plot.resize();
    const ctxOf = () => CONTEXTS[p.cx as ContextId];
    const snap = (v: number, st: number) => clean(Math.round(v / st) * st);
    const csClamped = () => {
      const c = ctxOf();
      return Math.max(c.x[0], Math.min(c.x[1], snap(p.cs, c.step)));
    };

    // Ziehpunkte der neuen Ansichten
    const pts = () => p.mode === 'points';
    plot.addHandle({ get: () => [p.px1, p.py1], set: (x, y) => ctx.set({ px1: clampTo(snap(x, 0.5), 9), py1: clampTo(snap(y, 0.5), 6) }), enabled: () => editable() && pts(), color: color.f });
    plot.addHandle({ get: () => [p.px2, p.py2], set: (x, y) => ctx.set({ px2: clampTo(snap(x, 0.5), 9), py2: clampTo(snap(y, 0.5), 6) }), enabled: () => editable() && pts(), color: color.triangle });
    plotC.addHandle({
      get: () => [csClamped(), contextValue(ctxOf(), ctxOf().lines[0]!, csClamped())],
      set: (x) => ctx.set({ cs: snap(Math.max(ctxOf().x[0], Math.min(ctxOf().x[1], x)), ctxOf().step) }),
      axis: 'x',
      enabled: () => editable() && p.mode === 'context',
      color: () => ctx.theme.series[3]!,
    });
    function clampTo(v: number, lim: number): number {
      return Math.max(-lim, Math.min(lim, v));
    }

    /** Gleichung als Text, z. B. „f(x) = 0,5x − 2“. */
    function eqText(name: string, m: number, t: number): string {
      const parts: string[] = [];
      if (m !== 0) parts.push(`${m === 1 ? '' : m === -1 ? '−' : fmt.num(m, 2)}x`);
      if (t !== 0 || m === 0) parts.push(parts.length ? `${t < 0 ? '−' : '+'} ${fmt.num(Math.abs(t), 2)}` : fmt.num(t, 2));
      return `${name}(x) = ${parts.join(' ')}`;
    }

    /* -------------------------------------------------------------- */
    /* Text in der Karte                                               */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function writer(g: CanvasRenderingContext2D, R: Rect) {
      const x = R.x + 18;
      const maxW = R.w - 36;
      const size = Math.max(13, Math.min(17, R.w / 26));
      let y = R.y + 26;
      const font = (w: number, fs: number) => `${w} ${fs}px ${th().font}`;
      return {
        get y() {
          return y;
        },
        set y(v: number) {
          y = v;
        },
        x,
        maxW,
        size,
        line(segs: Seg[], d = 0): void {
          let fs = size + d;
          const width = (f: number) =>
            segs.reduce((acc, sg) => {
              g.font = font(sg.w ?? 500, f);
              return acc + g.measureText(sg.s).width;
            }, 0);
          while (fs > 10.5 && width(fs) > maxW) fs -= 0.5;
          g.save();
          g.textBaseline = 'middle';
          g.textAlign = 'left';
          let cx = x;
          for (const sg of segs) {
            g.font = font(sg.w ?? 500, fs);
            g.fillStyle = sg.c ?? th().text;
            g.fillText(sg.s, cx, y);
            cx += g.measureText(sg.s).width;
          }
          g.restore();
          y += fs * 1.45;
        },
        para(text: string, c: string, d = 0, w = 500): void {
          const fs = Math.max(11, size + d);
          g.save();
          g.font = font(w, fs);
          g.fillStyle = c;
          g.textBaseline = 'middle';
          g.textAlign = 'left';
          let cur = '';
          const flush = () => {
            g.fillText(cur, x, y);
            y += fs * 1.4;
            cur = '';
          };
          for (const word of text.split(' ')) {
            const next = cur ? `${cur} ${word}` : word;
            if (cur && g.measureText(next).width > maxW) {
              flush();
              cur = word;
            } else cur = next;
          }
          if (cur) flush();
          y += fs * 0.15;
          g.restore();
        },
        gap(h = 6): void {
          y += h;
        },
      };
    }

    /* -------------------------------------------------------------- */
    /* Gerade durch zwei Punkte                                        */
    /* -------------------------------------------------------------- */

    function drawPoints(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const W = writer(g, R);
      const { px1: x1, py1: y1, px2: x2, py2: y2 } = p;
      const dx = clean(x2 - x1);
      const dy = clean(y2 - y1);
      const ln = lineThrough(x1, y1, x2, y2);
      W.line([{ s: ctx.t('ptsT'), c: color.f(), w: 800 }], 1);
      W.line([
        { s: `P${fmt.point(x1, y1)}`, c: color.f(), w: 700 },
        { s: '   ' },
        { s: `Q${fmt.point(x2, y2)}`, c: color.triangle(), w: 700 },
      ]);
      W.gap(2);
      W.line([
        { s: `Δx = ${fmt.num(x2)} − ${paren(x1)} = ${fmt.num(dx)}`, c: color.zero(), w: 600 },
      ], -1);
      W.line([{ s: `Δy = ${fmt.num(y2)} − ${paren(y1)} = ${fmt.num(dy)}`, c: color.g(), w: 600 }], -1);
      W.gap(4);
      if (dx === 0 && dy === 0) W.para(ctx.t('ptsSame'), t.muted, -1.5);
      else if (!ln) W.para(tr('ptsVert', { x: fmt.num(x1) }), color.g(), -1.5, 600);
      else {
        const m = clean(ln.m);
        const tt = clean(ln.t);
        W.line([{ s: tr('ptsM', { dy: fmt.num(dy), dx: fmt.num(dx), m: `${isRounded(m, 2) ? '≈ ' : ''}${fmt.num(m, 2)}` }), c: t.text, w: 600 }], -1);
        W.line([{ s: tr('ptsT2', { y1: fmt.num(y1), m: paren(m), x1: paren(x1), t: `${isRounded(tt, 2) ? '≈ ' : ''}${fmt.num(tt, 2)}` }), c: t.text, w: 600 }], -1);
        W.gap(4);
        W.line([{ s: eqText('f', clean(Math.round(m * 100) / 100), clean(Math.round(tt * 100) / 100)), c: color.f(), w: 800 }], 2);
      }
      W.gap(6);
      W.para(ctx.t('ptsHow'), t.muted, -2.5);

      // Koordinatensystem
      plot.resize();
      plot.begin();
      if (p.grid) plot.grid();
      plot.axes();
      if (ln) plot.line([x1, y1], [x2, y2], { color: color.f(), width: 3 });
      else if (dy !== 0) plot.vline(x1, { color: color.g(), width: 3, dash: [8, 6] });
      if (dx !== 0 || dy !== 0) {
        plot.polygon([[x1, y1], [x2, y1], [x2, y2]], { fill: color.triangle(), alpha: 0.1 });
        plot.segment([x1, y1], [x2, y1], { color: color.zero(), width: 2.5 });
        plot.segment([x2, y1], [x2, y2], { color: color.g(), width: 2.5 });
        if (dx !== 0) plot.text((x1 + x2) / 2, y1, `Δx = ${fmt.num(dx)}`, { color: color.zero(), align: 'center', baseline: dy >= 0 ? 'top' : 'bottom', offset: [0, dy >= 0 ? 6 : -6], weight: 'bold' });
        if (dy !== 0) plot.text(x2, (y1 + y2) / 2, `Δy = ${fmt.num(dy)}`, { color: color.g(), align: dx >= 0 ? 'left' : 'right', baseline: 'middle', offset: [dx >= 0 ? 8 : -8, 0], weight: 'bold' });
      }
      if (ln) {
        plot.point(0, ln.t, { color: color.f(), radius: 4, hollow: true });
      }
      plot.point(x1, y1, { color: color.f(), radius: 6 });
      plot.text(x1, y1, 'P', { color: color.f(), math: true, size: 17, offset: [-10, -10], align: 'right' });
      plot.point(x2, y2, { color: color.triangle(), radius: 6 });
      plot.text(x2, y2, 'Q', { color: color.triangle(), math: true, size: 17, offset: [10, -10] });
      plot.end();
    }
    const paren = (v: number) => (v < 0 ? `(${fmt.num(v, 2)})` : fmt.num(v, 2));

    /* -------------------------------------------------------------- */
    /* Wertetabelle                                                    */
    /* -------------------------------------------------------------- */

    function drawTable(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const W = writer(g, R);
      const rows = tableRows(p.m, p.b, -2, 6);
      W.line([{ s: ctx.t('tabT'), c: color.f(), w: 800 }, { s: '   ' }, { s: eqText('f', p.m, p.b), c: color.f(), w: 700 }], 0);
      W.gap(2);
      // Tabelle: waagerecht, wenn die Karte breit ist, sonst senkrecht
      const horiz = R.w > R.h * 1.25;
      const fs = W.size;
      g.save();
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (horiz) {
        const colW = Math.min(64, (W.maxW - 50) / rows.length);
        const rowH = fs * 2;
        const x0 = W.x + 50;
        const y0 = W.y;
        g.fillStyle = withAlpha(color.f(), 0.08);
        g.fillRect(W.x, y0, 50 + colW * rows.length, rowH * 2);
        g.strokeStyle = withAlpha(t.text, 0.25);
        g.lineWidth = 1;
        g.strokeRect(W.x, y0, 50 + colW * rows.length, rowH * 2);
        g.beginPath();
        g.moveTo(W.x, y0 + rowH);
        g.lineTo(W.x + 50 + colW * rows.length, y0 + rowH);
        for (let i = 0; i <= rows.length; i++) {
          g.moveTo(x0 + i * colW, y0);
          g.lineTo(x0 + i * colW, y0 + 2 * rowH);
        }
        g.stroke();
        g.font = `700 ${fs}px ${t.font}`;
        g.fillStyle = t.text;
        g.fillText('x', W.x + 25, y0 + rowH / 2);
        g.fillStyle = color.f();
        g.fillText('f(x)', W.x + 25, y0 + rowH * 1.5);
        rows.forEach((r, i) => {
          g.font = `600 ${fs}px ${t.font}`;
          g.fillStyle = t.text;
          g.fillText(fmt.num(r.x), x0 + (i + 0.5) * colW, y0 + rowH / 2);
          g.fillStyle = r.x === 0 ? color.f() : t.text;
          g.font = `${r.x === 0 ? 800 : 600} ${fs}px ${t.font}`;
          g.fillText(fmt.num(r.y, 2), x0 + (i + 0.5) * colW, y0 + rowH * 1.5);
        });
        // Schritte unter der Tabelle
        g.font = `700 ${fs - 2}px ${t.font}`;
        for (let i = 1; i < rows.length; i++) {
          const cx = x0 + i * colW;
          const cy = y0 + rowH * 2 + fs * 0.9;
          g.fillStyle = color.triangle();
          g.fillText(`${p.m >= 0 ? '+' : '−'}${fmt.num(Math.abs(p.m), 2)}`, cx, cy);
        }
        g.fillStyle = t.muted;
        g.font = `600 ${fs - 2}px ${t.font}`;
        for (let i = 1; i < rows.length; i++) g.fillText('+1', x0 + i * colW, y0 - fs * 0.7);
        W.y = y0 + rowH * 2 + fs * 2.2;
      } else {
        const rowH = Math.min(fs * 1.75, (R.h - 140) / (rows.length + 1));
        const colW = Math.min(90, W.maxW / 3.2);
        const x0 = W.x + 30;
        const y0 = W.y;
        g.fillStyle = withAlpha(color.f(), 0.08);
        g.fillRect(x0, y0, colW * 2, rowH * (rows.length + 1));
        g.strokeStyle = withAlpha(t.text, 0.25);
        g.lineWidth = 1;
        g.strokeRect(x0, y0, colW * 2, rowH * (rows.length + 1));
        g.beginPath();
        g.moveTo(x0 + colW, y0);
        g.lineTo(x0 + colW, y0 + rowH * (rows.length + 1));
        for (let i = 1; i <= rows.length; i++) {
          g.moveTo(x0, y0 + i * rowH);
          g.lineTo(x0 + 2 * colW, y0 + i * rowH);
        }
        g.stroke();
        g.font = `700 ${fs}px ${t.font}`;
        g.fillStyle = t.text;
        g.fillText('x', x0 + colW / 2, y0 + rowH / 2);
        g.fillStyle = color.f();
        g.fillText('f(x)', x0 + colW * 1.5, y0 + rowH / 2);
        rows.forEach((r, i) => {
          const cy = y0 + (i + 1.5) * rowH;
          g.font = `600 ${fs}px ${t.font}`;
          g.fillStyle = t.text;
          g.fillText(fmt.num(r.x), x0 + colW / 2, cy);
          g.fillStyle = r.x === 0 ? color.f() : t.text;
          g.font = `${r.x === 0 ? 800 : 600} ${fs}px ${t.font}`;
          g.fillText(fmt.num(r.y, 2), x0 + colW * 1.5, cy);
          if (i > 0) {
            g.font = `700 ${fs - 2}px ${t.font}`;
            g.textAlign = 'left';
            g.fillStyle = color.triangle();
            g.fillText(`${p.m >= 0 ? '+' : '−'}${fmt.num(Math.abs(p.m), 2)}`, x0 + colW * 2 + 10, cy - rowH / 2);
            g.textAlign = 'right';
            g.fillStyle = t.muted;
            g.fillText('+1', x0 - 6, cy - rowH / 2);
            g.textAlign = 'center';
          }
        });
        W.y = y0 + rowH * (rows.length + 1) + fs;
      }
      g.restore();
      W.para(tr('tabStart', { t: fmt.num(p.b, 2) }), color.f(), -1.5, 600);
      W.para(ctx.t('tabHow'), t.muted, -2);

      plot.resize();
      plot.begin();
      if (p.grid) plot.grid();
      plot.axes();
      plot.line([0, p.b], [1, p.b + p.m], { color: withAlpha(color.f(), 0.55), width: 2.5 });
      for (let i = 1; i < rows.length; i++) {
        const a = rows[i - 1]!;
        const b = rows[i]!;
        plot.segment([a.x, a.y], [b.x, a.y], { color: t.muted, width: 1.6 });
        plot.segment([b.x, a.y], [b.x, b.y], { color: color.triangle(), width: 2.6 });
      }
      for (const r of rows) plot.point(r.x, r.y, { color: color.f(), radius: r.x === 0 ? 6.5 : 5 });
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Sachsituationen                                                 */
    /* -------------------------------------------------------------- */

    const CKEY: Record<ContextId, string> = { taxi: 'cTaxi', candle: 'cCandle', tariff: 'cTariff', tank: 'cTank' };
    let shownCtx = '';
    function syncContextAxes(): void {
      if (shownCtx === p.cx) return;
      shownCtx = p.cx;
      const c = ctxOf();
      const k = CKEY[c.id];
      plotC.setAxes({ x: { label: ctx.t(`${k}X`) }, y: { label: ctx.t(`${k}Y`) } });
      const sx = c.x[1] - c.x[0];
      const sy = c.y[1] - c.y[0];
      plotC.setRange([c.x[0] - 0.09 * sx, c.x[1] + 0.03 * sx], [c.y[0] - 0.1 * sy, c.y[1] + 0.05 * sy]);
    }
    function drawContext(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const c = ctxOf();
      const k = CKEY[c.id];
      const xs = csClamped();
      const y0 = contextValue(c, c.lines[0]!, xs);
      const val = (v: number) => (c.yDec === 2 ? fmt.fixed(v, 2) : fmt.num(v, c.yDec));
      // Platz rechts für das kleine Bild
      const narrow = !wide();
      const picW = Math.min(narrow ? 96 : 130, R.w * 0.3);
      const textR: Rect = { x: R.x, y: R.y, w: R.w - picW - 6, h: R.h };
      const W2 = writer(g, textR);
      W2.line([{ s: ctx.t(k), c: color.f(), w: 800 }], 1);
      if (!narrow) W2.para(ctx.t(`${k}D`), t.text, -1.5);
      W2.para(ctx.t(`${k}W`), color.f(), -2, 700);
      W2.para(ctx.t(`${k}M`), color.triangle(), -2.5, 600);
      W2.para(ctx.t(`${k}T`), color.f(), -2.5, 600);
      W2.gap(2);
      if (c.id === 'tariff') {
        const a = contextValue(c, c.lines[0]!, xs);
        const b = contextValue(c, c.lines[1]!, xs);
        W2.para(tr('cTariffR', { x: fmt.num(xs, 1), a: fmt.fixed(a, 2), b: fmt.fixed(b, 2) }), color.zero(), -1.5, 700);
        W2.para(ctx.t(Math.abs(a - b) < 0.005 ? 'cTariffE' : a < b ? 'cTariffA' : 'cTariffB'), t.text, -2, 600);
      } else {
        W2.para(tr(`${k}R`, { x: fmt.num(xs, 1), y: val(y0) }), color.zero(), -1.5, 700);
        if (c.id === 'candle') W2.para(tr('cCandleZ', { z: fmt.num(contextReach(c.lines[0]!, 0)!, 1) }), t.muted, -2.5);
      }
      drawPicture(g, { x: R.x + R.w - picW - 12, y: R.y + 14, w: picW, h: Math.min(R.h - 28, narrow ? 130 : 170) }, xs);

      syncContextAxes();
      plotC.resize();
      plotC.begin();
      plotC.grid();
      plotC.axes();
      c.lines.forEach((l, i) => {
        const col = i === 0 ? color.f() : color.g();
        if (c.id === 'candle') {
          const z = contextReach(l, 0)!;
          plotC.segment([0, l.t], [z, 0], { color: col, width: 3 });
          plotC.segment([z, 0], [c.x[1], 0], { color: col, width: 3, dash: [6, 5] });
          plotC.point(z, 0, { color: color.g(), radius: 5 });
        } else plotC.line([0, l.t], [1, l.t + l.m], { color: col, width: 3 });
        plotC.point(0, l.t, { color: col, radius: 5, hollow: true });
        if (c.lines.length > 1) {
          const xl = c.x[1] * 0.92;
          plotC.text(xl, contextValue(c, l, xl), i === 0 ? 'A' : 'B', { color: col, size: 16, weight: 'bold', offset: [0, i === 0 ? -14 : 16], align: 'center' });
        }
      });
      if (c.lines.length > 1) {
        const rel = lineRelation(c.lines[0]!.m, c.lines[0]!.t, c.lines[1]!.m, c.lines[1]!.t);
        if (rel.kind === 'intersect') {
          plotC.point(rel.x, rel.y, { color: t.text, radius: 5 });
          plotC.text(rel.x, rel.y, 'S', { math: true, size: 16, offset: [-10, -10], align: 'right' });
        }
      }
      // Ablesen
      const ac = color.zero();
      plotC.segment([xs, 0], [xs, y0], { color: withAlpha(ac, 0.7), width: 1.5, dash: [4, 4] });
      plotC.segment([0, y0], [xs, y0], { color: withAlpha(ac, 0.7), width: 1.5, dash: [4, 4] });
      if (c.lines.length > 1) {
        const yb = contextValue(c, c.lines[1]!, xs);
        plotC.segment([0, yb], [xs, yb], { color: withAlpha(color.g(), 0.6), width: 1.5, dash: [4, 4] });
        plotC.point(xs, yb, { color: color.g(), radius: 5 });
      }
      plotC.point(xs, y0, { color: ac, radius: 6 });
      plotC.end();
    }
    /** Kleines Bild zur Situation: Kerze, Tank, Taxameter bzw. zwei Rechnungen. */
    function drawPicture(g: CanvasRenderingContext2D, r: Rect, xs: number): void {
      const t = th();
      const c = ctxOf();
      const v = contextValue(c, c.lines[0]!, xs);
      g.save();
      g.fillStyle = t.dark ? '#0f141c' : '#f4f6fa';
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.fill();
      const cx = r.x + r.w / 2;
      const base = r.y + r.h - 14;
      if (c.id === 'candle') {
        const full = r.h - 50;
        const h = (full * v) / 20;
        const w = Math.min(34, r.w * 0.32);
        // Teller
        g.fillStyle = withAlpha(t.text, 0.25);
        g.fillRect(cx - w, base, 2 * w, 5);
        if (h > 0.5) {
          const grad = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
          grad.addColorStop(0, '#e9dcc0');
          grad.addColorStop(0.5, '#fbf4e4');
          grad.addColorStop(1, '#ddcfae');
          g.fillStyle = grad;
          g.fillRect(cx - w / 2, base - h, w, h);
          // Docht und Flamme
          g.strokeStyle = '#3a3027';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(cx, base - h);
          g.lineTo(cx, base - h - 7);
          g.stroke();
          const fy = base - h - 16;
          const fg = g.createRadialGradient(cx, fy + 4, 1, cx, fy, 14);
          fg.addColorStop(0, '#fff6c8');
          fg.addColorStop(0.5, '#ffb43c');
          fg.addColorStop(1, 'rgba(255,120,30,0)');
          g.fillStyle = fg;
          g.beginPath();
          g.ellipse(cx, fy, 7, 13, 0, 0, Math.PI * 2);
          g.fill();
        }
        // Skala der Anfangshöhe
        g.strokeStyle = withAlpha(t.text, 0.35);
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(cx - w, base - full);
        g.lineTo(cx + w, base - full);
        g.stroke();
      } else if (c.id === 'tank') {
        const tw = Math.min(70, r.w * 0.66);
        const th2 = r.h - 40;
        const fill = (th2 * v) / 200;
        const x0 = cx - tw / 2;
        g.fillStyle = withAlpha(t.series[5]!, 0.55);
        g.fillRect(x0, base - fill, tw, fill);
        g.strokeStyle = t.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0, base - th2);
        g.lineTo(x0, base);
        g.lineTo(x0 + tw, base);
        g.lineTo(x0 + tw, base - th2);
        g.stroke();
        // Zulauf
        g.strokeStyle = withAlpha(t.series[5]!, 0.8);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x0 + tw * 0.7, base - th2 - 8);
        g.lineTo(x0 + tw * 0.7, base - fill);
        g.stroke();
        g.fillStyle = t.text;
        g.font = `700 13px ${t.font}`;
        g.textAlign = 'center';
        g.fillText(`${fmt.num(v, 0)} l`, cx, base - th2 / 2);
      } else {
        // Anzeige wie ein Taxameter / zwei Rechnungen
        const lines = c.lines.map((l) => contextValue(c, l, xs));
        const boxH = 34;
        lines.forEach((val, i) => {
          const by = r.y + 18 + i * (boxH + 12);
          g.fillStyle = '#10161f';
          roundRect(g, r.x + 8, by, r.w - 16, boxH, 6);
          g.fill();
          g.fillStyle = i === 0 ? '#7cf2a8' : '#ffb3cf';
          const label = lines.length > 1 ? 22 : 0;
          let fs = 16;
          const txt = `${fmt.fixed(val, 2)} €`;
          do {
            g.font = `700 ${fs}px ui-monospace, monospace`;
            fs -= 1;
          } while (fs > 9 && g.measureText(txt).width > r.w - 32 - label);
          g.textAlign = 'right';
          g.textBaseline = 'middle';
          g.fillText(txt, r.x + r.w - 16, by + boxH / 2);
          if (lines.length > 1) {
            g.textAlign = 'left';
            g.fillText(i === 0 ? 'A' : 'B', r.x + 14, by + boxH / 2);
          }
        });
        g.fillStyle = t.muted;
        g.font = `600 13px ${t.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.fillText(`${fmt.num(xs, 1)} ${c.id === 'taxi' ? 'km' : 'min'}`, cx, base);
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Übung „Gerade treffen“                                          */
    /* -------------------------------------------------------------- */

    let target = targetLine(p.qn);
    let verdict: boolean | null = null;
    let score = { right: 0, all: 0 };
    const verdictTw = new Tween(500, ease.outCubic);
    function check(): void {
      if (verdict !== null) return;
      verdict = hits(p.m, p.b, target);
      score = { right: score.right + (verdict ? 1 : 0), all: score.all + 1 };
      ctx.announce(verdict ? ctx.t('quizOk') : tr('quizNo', { eq: eqText('f', target.m, target.t) }));
      verdictTw.play();
      ctx.requestRender();
    }
    function drawQuiz(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const W = writer(g, R);
      const read = p.qt === 'read';
      W.para(ctx.t(read ? 'quizRead' : 'quizDraw'), color.f(), 1, 800);
      if (!read) W.line([{ s: eqText('f', target.m, target.t), c: t.text, w: 800 }], 5);
      W.gap(2);
      if (verdict === null) W.para(ctx.t(read ? 'quizReadHow' : 'quizDrawHow'), t.muted, -2);
      else {
        const k = verdictTw.running ? 1 + 0.25 * (1 - verdictTw.value) : 1;
        W.line([{ s: verdict ? ctx.t('quizOk') : tr('quizNo', { eq: eqText('f', target.m, target.t) }), c: verdict ? color.triangle() : color.g(), w: 800 }], 2 * k);
        W.line([{ s: tr('quizYours', { eq: eqText('f', p.m, p.b) }), c: t.muted, w: 600 }], -2);
      }
      if (score.all) W.line([{ s: tr('quizScore', { k: score.right, n: score.all }), c: t.muted, w: 600 }], -2);

      plot.resize();
      plot.begin();
      if (p.grid) plot.grid();
      plot.axes();
      const showTarget = read || verdict !== null;
      if (showTarget) {
        plot.line([0, target.t], [1, target.t + target.m], { color: withAlpha(t.text, 0.6), width: 4, dash: [10, 8] });
      }
      plot.line([0, p.b], [1, p.b + p.m], { color: color.f(), width: 3 });
      if (p.triangle) {
        const c = color.triangle();
        plot.segment([0, p.b], [1, p.b], { color: c, width: 2 });
        plot.segment([1, p.b], [1, p.b + p.m], { color: c, width: 2 });
      }
      plot.point(0, p.b, { color: color.f(), radius: 6 });
      plot.point(1, p.b + p.m, { color: color.triangle(), radius: 5 });
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Anzeigen                                                         */
    /* -------------------------------------------------------------- */

    /** Passender Ausschnitt je Ansicht (auf dem Handy sonst zu klein). */
    let fitKey = '';
    function fitView(): void {
      plot.resize();
      fitKey = `${surface.width}x${surface.height}|${p.mode}`;
      if (p.mode === 'context') return;
      if (p.mode === 'explore') return plot.setRange([-10, 10], [-7, 7]);
      // gewünschter Bereich; bei gleichen Einheiten bestimmt die knappere Richtung den Maßstab
      const [xr, yr] = p.mode === 'points' ? [9.5, 6.8] : p.mode === 'table' ? [4.5, 4.5] : [6.5, 5.5];
      const reg = mainRegion();
      const k = Math.min(reg.w / (2 * xr), reg.h / (2 * yr));
      const hx = reg.w / (2 * k);
      const hy = reg.h / (2 * k);
      plot.setRange([-hx, hx], [-hy, hy]);
    }

    function readouts(): void {
      if (p.mode === 'explore') return exploreReadouts();
      for (const k of ['course', 'angle', 'zero', 'g', 'relation']) ctx.readout(k, null);
      if (p.mode === 'table') ctx.readout('f', { html: lineTerm('f', p.m, p.b) });
      else if (p.mode === 'points') {
        const ln = lineThrough(p.px1, p.py1, p.px2, p.py2);
        ctx.readout('f', ln ? { html: lineTerm('f', clean(Math.round(ln.m * 100) / 100), clean(Math.round(ln.t * 100) / 100)) } : null);
      } else ctx.readout('f', null);
    }

    return {
      update(changed, source) {
        if (changed.has('qn') || source === 'init' || source === 'replace') {
          target = targetLine(p.qn);
          verdict = null;
        }
        if (changed.has('qt') || changed.has('mode')) verdict = null;
        if (changed.has('mode') || source === 'init' || source === 'replace') fitView();
        if (changed.has('cx') && source === 'input') ctx.set({ cs: CONTEXTS[p.cx as ContextId].x0 });
        readouts();
      },

      action(id) {
        if (id === 'qcheck') check();
        if (id === 'qnext') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, m: 1, b: 0 });
        }
      },

      render() {
        const g = surface.begin();
        if (fitKey !== `${surface.width}x${surface.height}|${p.mode}`) fitView();
        if (p.mode === 'explore') {
          plot.resize();
          drawExplore();
        } else {
          const R = regions();
          drawCard(g, R.card, th());
          if (p.mode === 'points') drawPoints(g, R.card);
          else if (p.mode === 'table') drawTable(g, R.card);
          else if (p.mode === 'context') drawContext(g, R.card);
          else drawQuiz(g, R.card);
        }
        if (verdictTw.running) ctx.requestRender();
      },

      resetView: () => {
        fitView();
        shownCtx = '';
      },
      destroy: () => surface.destroy(),
    };
  },
});
