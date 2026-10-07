#!/usr/bin/env node
// @ts-check
/**
 * Legt das Grundgerüst einer neuen Simulation an.
 *
 *   npm run new:sim -- <id> --subject mathematik [--animated]
 *
 * Beispiel:
 *   npm run new:sim -- fadenpendel --subject physik --animated
 *
 * Erzeugt:
 *   src/simulations/<fach>/<id>/index.ts         Umsetzung (Vorlage)
 *   src/content/simulations/de/<id>.md           Lernmaterial (Vorlage)
 * Die Registry (src/simulations/registry.ts) findet den neuen Ordner automatisch.
 *
 * Danach im Lehrplan (src/curriculum/<fach>.ts) den Eintrag mit dieser ID
 * auf `status: 'ready'` setzen und `slug`, `summary` und `thumb` ergänzen.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    subject: { type: 'string', default: 'mathematik' },
    animated: { type: 'boolean', default: false },
  },
});

const id = positionals[0];
const subject = values.subject ?? 'mathematik';
/** @param {string} message @returns {never} */
function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!id) fail('Bitte eine ID angeben, z. B.: npm run new:sim -- fadenpendel --subject physik --animated');
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) fail('Die ID darf nur Kleinbuchstaben, Ziffern und Bindestriche enthalten.');
if (!['mathematik', 'physik', 'chemie'].includes(subject)) fail('--subject muss mathematik, physik oder chemie sein.');

const root = path.resolve(import.meta.dirname, '..');
const simDir = path.join(root, 'src/simulations', subject, id);
const contentFile = path.join(root, 'src/content/simulations/de', `${id}.md`);
const curriculumFile = path.join(root, 'src/curriculum', `${subject}.ts`);

if (existsSync(simDir)) fail(`${path.relative(root, simDir)} existiert bereits.`);

const staticTemplate = `import { defineSimulation, Plot, Surface } from '../../../sim-core';

const L = (de: string, en: string) => ({ de, en });

/**
 * TODO: Kurz beschreiben, was die Simulation zeigt.
 */
export default defineSimulation({
  id: '${id}',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'a', type: 'number', label: L('Parameter a', 'Parameter a'), min: -5, max: 5, step: 0.1, default: 1 },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  readouts: [{ key: 'value', label: L('Wert', 'Value'), spoiler: true }],
  presets: [{ id: 'double', label: L('a = 2', 'a = 2'), values: { a: 2 } }],
  strings: {
    de: { canvas: 'TODO: Beschreibung der Grafik für Screenreader' },
    en: { canvas: 'TODO: description of the graphic for screen readers' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-10, 10], y: [-6, 6] });
    const p = ctx.params;

    // Ziehbarer Punkt: verändert a
    plot.addHandle({
      get: () => [Math.PI / 2, p.a],
      set: (_x, y) => ctx.set({ a: y }),
      axis: 'y',
      enabled: () => !ctx.locked,
    });

    return {
      update() {
        ctx.readout('value', \`a = \${ctx.fmt.num(p.a)}\`);
      },
      render() {
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        plot.fn((x) => p.a * Math.sin(x), { color: ctx.theme.series[0] });
        plot.point(Math.PI / 2, p.a, { color: ctx.theme.series[0] });
        plot.end();
      },
      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
`;

const animatedTemplate = `import { defineSimulation, FixedStepper, Plot, rk4, Surface } from '../../../sim-core';

const L = (de: string, en: string) => ({ de, en });

/**
 * TODO: Kurz beschreiben, was die Simulation zeigt.
 *
 * Vorlage: gedämpfte Federschwingung x'' = −(D/m)·x − (k/m)·x'
 * (numerisch mit Runge-Kutta in festen Zeitschritten gelöst).
 */
export default defineSimulation({
  id: '${id}',
  animated: true,
  params: [
    { key: 'D', type: 'number', label: L('Federkonstante D', 'Spring constant D'), min: 1, max: 50, step: 1, default: 10, unit: 'N/m' },
    { key: 'm', type: 'number', label: L('Masse m', 'Mass m'), min: 0.1, max: 5, step: 0.1, default: 1, unit: 'kg' },
    { key: 'k', type: 'number', label: L('Dämpfung k', 'Damping k'), min: 0, max: 5, step: 0.1, default: 0.3, unit: 'kg/s' },
    { key: 'x0', type: 'number', label: L('Auslenkung zu Beginn', 'Initial displacement'), min: -1, max: 1, step: 0.05, default: 0.8, unit: 'm' },
  ],
  readouts: [
    { key: 't', label: L('Zeit', 'Time') },
    { key: 'x', label: L('Auslenkung', 'Displacement') },
    { key: 'T', label: L('Periodendauer (ungedämpft)', 'Period (undamped)'), spoiler: true },
  ],
  strings: {
    de: { canvas: 'TODO: Beschreibung der Grafik für Screenreader' },
    en: { canvas: 'TODO: description of the graphic for screen readers' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-0.5, 10.5], y: [-1.2, 1.2], equalAspect: false, xAxis: { label: 't in s' }, yAxis: { label: 'x in m' } });
    const p = ctx.params;
    const stepper = new FixedStepper(1 / 240);
    let t = 0;
    let state = [p.x0, 0];
    let trace: [number, number][] = [[0, p.x0]];

    const reset = () => {
      t = 0;
      state = [p.x0, 0];
      trace = [[0, p.x0]];
      stepper.reset();
      ctx.clock.reset();
    };

    const derivative = (_t: number, [x, v]: readonly number[]) => [v!, (-p.D * x! - p.k * v!) / p.m];

    return {
      update(changed) {
        if (changed.has('x0') && !ctx.clock.playing) reset();
        ctx.readout('t', \`t = \${ctx.fmt.fixed(t, 2)} s\`);
        ctx.readout('x', \`x = \${ctx.fmt.fixed(state[0]!, 3)} m\`);
        ctx.readout('T', \`T = 2π·√(m/D) ≈ \${ctx.fmt.num(2 * Math.PI * Math.sqrt(p.m / p.D), 3)} s\`);
      },
      tick(dt) {
        stepper.run(dt, (h) => {
          state = rk4(derivative, t, state, h);
          t += h;
        });
        trace.push([t, state[0]!]);
        if (t > 10) ctx.clock.pause();
        ctx.readout('t', \`t = \${ctx.fmt.fixed(t, 2)} s\`);
        ctx.readout('x', \`x = \${ctx.fmt.fixed(state[0]!, 3)} m\`);
      },
      resetTime: reset,
      render() {
        surface.begin();
        plot.begin();
        plot.grid();
        plot.axes();
        plot.polyline(trace, { color: ctx.theme.series[0], width: 2.5 });
        plot.point(t, state[0]!, { color: ctx.theme.series[1], radius: 6 });
        plot.end();
      },
      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
`;

const contentTemplate = `---
description: TODO – ein Satz für Suchmaschinen.
---

## Worum geht es?

TODO: Fachliche Erklärung mit Formeln, z. B. $f(x) = a \\cdot \\sin(x)$.

## Ausprobieren

1. TODO: Auftrag mit passender Einstellung. [Beispiel laden](?a=2)

## Aufgaben

### Aufgabe 1: TODO

[Aufgabe laden](?a=-1.5&_hide=1) TODO: Aufgabenstellung.

<details>
<summary>Lösung anzeigen</summary>

TODO: Lösung.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** TODO
- **Typische Fehlvorstellungen:** TODO
`;

mkdirSync(simDir, { recursive: true });
writeFileSync(path.join(simDir, 'index.ts'), values.animated ? animatedTemplate : staticTemplate);
if (!existsSync(contentFile)) writeFileSync(contentFile, contentTemplate);

const inCurriculum = existsSync(curriculumFile) && readFileSync(curriculumFile, 'utf8').includes(`'${id}'`);

console.log(`
✔ Simulation „${id}“ angelegt:
   src/simulations/${subject}/${id}/index.ts
   src/content/simulations/de/${id}.md

Nächste Schritte:
 1. ${inCurriculum ? `In src/curriculum/${subject}.ts den Eintrag '${id}'` : `In src/curriculum/${subject}.ts einen Eintrag mit id '${id}' anlegen und`} auf
    status: 'ready' setzen sowie slug, summary und thumb ergänzen.
 2. npm run dev  →  Simulation entwickeln.
 3. npm run verify  →  Typprüfung, Tests und Build.

Anleitung: docs/NEUE-SIMULATION.md
`);
