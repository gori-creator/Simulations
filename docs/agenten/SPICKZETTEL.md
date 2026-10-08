# Spickzettel: Simulationen bauen (Kern-API, Muster, Formate)

Ersetzt das Lesen von Kern-Dateien und vielen Vorbildern. Alles hier ist aus dem Code abgeleitet und gilt verbindlich.
Wenn du ein Detail brauchst, das hier fehlt: gezielt mit `grep -n` in der genannten Datei nachsehen, nicht ganze Dateien lesen.

## 1. Import und Grundgerüst

```ts
import { defineSimulation, ease, FixedStepper, Plot, prefersReducedMotion, roundRect, softShadow, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { /* reine Rechenfunktionen */ } from './model';

const L = (de: string, en: string) => ({ de, en });

/** Kurzbeschreibung der Simulation (Deutsch). */
export default defineSimulation({
  id: '<id>',                      // = Ordnername
  dragHint: true,                  // Hinweis „Punkte ziehen“ unter der Bühne, wenn man ziehen kann
  animated: true,                  // nur wenn zeitabhängig: Abspielen/Anhalten + tick(dt)
  layout: { aspect: 1.6, aspectNarrow: 0.75 },   // Breite/Höhe; Handy (<640 px) eigenes Verhältnis
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'mode', type: 'choice', label: L('Modus', 'Mode'), options: [{ value: 'a', label: L('…', '…') }], default: 'a' },
    { key: 'r', type: 'number', label: L('Radius r', 'Radius r'), min: 1, max: 10, step: 0.5, default: 4, unit: 'cm', help: L('…', '…') },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitter', 'Grid'), default: true },
    { key: 'term', type: 'text', label: L('Term', 'Expression'), default: '2x+1', maxLength: 40, placeholder: L('z. B. …', 'e.g. …') },
    { key: 'k', type: 'number', label: L('…', '…'), min: 0, max: 5, step: 1, default: 1, visibleIf: (v) => v.mode === 'a' },
  ],
  actions: [
    { id: 'go', label: L('Starten', 'Start'), primary: true },
    { id: 'clear', label: L('Löschen', 'Clear'), visibleIf: (v) => v.mode === 'a' },
  ],
  readouts: [
    { key: 'now', label: L('Momentan', 'Right now') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },   // verrät Aufgabenlösung → spoiler
  ],
  presets: [   // 3–6 lehrreiche Beispiele; values = Abweichungen vom Standard
    { id: 'start', label: L('…', '…'), values: {} },
    { id: 'big', label: L('…', '…'), values: { r: 9 } },
  ],
  strings: { de: { canvas: 'Alt-Text der Zeichenfläche …', axisX: 'x in cm' }, en: { canvas: '…', axisX: 'x in cm' } },
  images: { photo: 'datei.webp' },   // optional, siehe Brief Abschnitt 5
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;            // typisiert: p.r ist number, p.mode 'a' | …
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;

    function regions(): { scene: Rect; chart: Rect } {   // Desktop nebeneinander, Handy untereinander
      const w = surface.width, h = surface.height;
      if (!narrow()) { const sw = Math.round(w * 0.5); return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw + 10, y: 0, w: w - sw - 10, h } }; }
      const sh = Math.round(h * 0.55);
      return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }

    const plot = new Plot(surface, { x: [-1, 10], y: [-1, 6], region: () => regions().chart /* … */ });
    const pop = new Tween(500, ease.outBack);

    function updateReadouts(): void { /* ctx.readout(...) */ }

    return {
      update(changed, source) {
        // abgeleitete Werte nur bei source === 'input' per ctx.set() umrechnen
        if (changed.has('mode') && source === 'input') ctx.set({ k: 1 });
        updateReadouts();
      },
      action(id) { if (ctx.locked) return; if (id === 'go') { pop.play(); ctx.requestRender(); } },
      tick(dt) { /* nur bei animated: dt in s, schon mit Zeitlupe multipliziert */ },
      resetTime() { /* animierten Zustand auf Anfang */ },
      render() {
        plot.resize();                 // bei region-Plots vor dem Zeichnen
        const g = surface.begin();     // löscht und liefert den 2D-Kontext (CSS-Pixel)
        drawScene(regions().scene);
        drawChart();
        if (pop.running) ctx.requestRender();   // solange etwas animiert, weiterzeichnen
      },
      destroy: () => surface.destroy(),
    };
  },
});
```

`ctx` (SimContext): `stage`, `lang` ('de'|'en'), `params`, `locked` (geteilter Link mit gesperrten Reglern → keine Bedienung, Aktionen ignorieren, Griffe `enabled: () => !ctx.locked`), `theme`, `fmt`, `clock`, `images`, `set(values)` (rundet auf min/max/step; löst `update(changed, 'sim')` aus), `readout(key, string | {html} | null)` (`null` blendet aus), `t(key)`, `setAction(id, { enabled?, label? })`, `requestRender()` (höchstens 1× pro Frame).

`UpdateSource`: `init` (Start/geteilter Link), `input` (Regler bedient), `replace` (Beispiel, Zurücksetzen, Link im Lernmaterial – vollständiger Zustand!), `sim` (eigenes `ctx.set`).

Parameter-Schlüssel: kurz, stabil, nie mit `_` beginnend (`_lock`, `_hide` reserviert). Werte stehen in geteilten Links (`?r=4&mode=a`); `boolean` im Link als `1`/`0`.

## 2. Zeichnen

**Surface** (`new Surface(ctx, altText)`): `canvas`, `g` (2D-Kontext), `width`/`height` (CSS-Pixel), `begin()`, `addTarget(t)`, `setCursor(css)`, `destroy()`. Hochauflösend automatisch.

**Theme** (`ctx.theme`, passt sich Hell/Dunkel an – Farben NUR von hier, plus selbst gemischte über `withAlpha`/`mixColor`):
`dark`, `bg`, `grid`, `gridMinor`, `axis`, `text`, `muted`, `series[0..5]` = blau, rot, grün, orange, lila, türkis, `font`, `mathFont`.
Gegenständliche Objekte (Holz, Metall, Papier …) dürfen eigene Naturfarben/Verläufe haben, müssen aber in beiden Modi gut aussehen (`theme.dark` abfragen).

**draw-Helfer:** `roundRect(g, x, y, w, h, r)` (nur Pfad), `text(g, str, x, y, { font, color, align?, baseline? })` (Standard center/middle), `softShadow(g, dark, blur=14, offY=4)` (zwischen `g.save()`/`g.restore()`), `withAlpha(hex, a)`, `drawImageFit(g, img, rect, 'contain'|'cover')`.
Schrift: `` `600 13px ${theme.font}` ``, Variablen kursiv: `` `italic 14px ${theme.mathFont}` ``. Minuszeichen immer `−` (`MINUS`), Zahlen nur über `fmt`.

**Plot** (Koordinatensystem, `new Plot(surface, options)`):
- Optionen: `x`, `y` (Bereich), `equalAspect` (Std. true; Diagramme: false), `region: () => Rect`, `pan`, `zoom`, `controls` (Zoom-Knöpfe), `xAxis`/`yAxis`: `{ label, pi, degrees, format, minStep, numbers }`.
- Diagramme mit Achsenzahlen: `equalAspect: false, pan: false, zoom: false, controls: false` und `plot.setRangePadded([x0,x1],[y0,y1], { left: 40, bottom: 26, top: 14, right: 16 })`.
- Zeichnen: `plot.begin()` (schneidet auf Region zu, füllt Hintergrund) … `plot.end()` (zeichnet Griffe); dazwischen `grid({ minor })`, `axes()`, `fn(f, { color, width, dash, from, to })`, `parametric(fx, fy, t0, t1, style)`, `polyline(pts, style)`, `segment(a, b, style)`, `line(a, b, style)` (unendlich), `vline(x)`, `hline(y)`, `arrow(a, b, { head })`, `polygon(pts, { fill, stroke, width, alpha })`, `circle(cx, cy, r, fill)`, `arc(cx, cy, r, from, to, { sector })`, `arcPx(…, radiusPx, …)` (Winkelbögen), `fillBetween(f, g, from, to, fill)`, `point(x, y, { color, radius, hollow })`, `text(x, y, str, { color, size, weight, align, baseline, offset: [dx, dy], halo, math })`, `textPx(px, py, str, style)`.
- Umrechnen: `px(x)`, `py(y)`, `toPx(x, y)`, `toWorld(px, py)`, `rect`, `bounds` (`xMin…yMax`), `scale` (`{ x, y }` Pixel pro Einheit), `setRange`, `setAxes`, `resetView()`, `isViewChanged`.
- Ziehen: `plot.addHandle({ get: () => [x, y], set: (x, y) => ctx.set({ … }), enabled: () => !ctx.locked, color: () => theme.series[0], axis: 'x'|'y'|'both' })` → gibt Entfernen-Funktion zurück. Gerundet wird über den `step` des Parameters.
- `resetView()` der Simulation: `plot.resetView()` weiterreichen, wenn Zoom/Verschieben erlaubt ist.

**TapTarget** (Antippen beliebiger Formen): `new TapTarget(surface, { hit: (px, py) => id | null, onTap: (id) => …, onHover: (id | null) => … })`. Für eigenes Ziehen ohne Plot: Objekt mit `PointerTarget`-Methoden (`contains, pointerDown → true wenn übernommen, pointerMove, pointerUp, hover, wheel → false`) und `surface.addTarget(obj)`; Beispiel: `physik/hebelgesetz`, `physik/hookesches-gesetz`.

**3D:** `View3D`, `mesh3d`, `foldNet`, `vec3`, `shade`, `Camera3D` aus `src/sim-core/view3d.ts` (Beschreibung in `docs/ARCHITEKTUR.md` „3D-Ansichten“, Vorbilder `mathematik/koerpernetze`, `quader-volumen`, `prisma-zylinder`).

## 3. Animation und Zeit

- **Tween** (Übergänge): `const tw = new Tween(600, ease.inOutCubic)`; `tw.play()` (bei reduzierter Bewegung sofort fertig), `tw.value` (mit Easing 0…1), `tw.t` (roh), `tw.running`, `tw.finish()`. Im `render()` solange `tw.running` → `ctx.requestRender()`. `ease`: `linear`, `inCubic`, `outCubic`, `inOutCubic`, `outBack`, `outBounce`. `mixPoint(a, b, t)`.
- **Uhr** (`animated: true`): Host ruft bei laufender Uhr `tick(dt)` auf (dt in s, mit Zeitlupe/Zeitraffer). `ctx.clock`: `time`, `speed`, `playing`, `play()`, `pause()`, `toggle()`, `reset()`, `onChange(fn)`. Aktion „Starten“ kann `ctx.clock.play()` aufrufen. Zeitlupe als boolescher Parameter → `ctx.clock.speed = p.slow ? 0.25 : 1`.
- **Physik:** `const stepper = new FixedStepper(0.001); stepper.run(dt, (h) => { … })`, `rk4(f, t, y, h)`; `clamp`, `lerp`, `degToRad`, `radToDeg`, `mod`, `nearlyEqual`, `solveQuadratic`.
- **Zufall reproduzierbar:** `seededRandom(seed)`.
- `prefersReducedMotion()`: dann keine Dauer-Animationen ohne Zutun, Übergänge sofort.

## 4. Zahlen und Ergebnisse

`fmt.num(v, dec=2)` (gekürzte Nullen, Dezimalkomma, `−`), `fmt.fixed(v, dec)`, `fmt.signed(v, dec)`, `fmt.pi(v)` (Vielfache von π), `fmt.point(x, y)` (DE „(1,5 | 2)“), `formatNumber(v, lang, opts)`, `formatPiFraction(x)`. Einheiten mit schmalem Leerzeichen-Gefühl: `` `${fmt.num(s, 1)} cm` ``.

Ergebnisse (`ctx.readout`): kurz, informativ, mit Formel **und** eingesetzten Zahlen. HTML erlaubt (nur aus eigenem Code):
- Variablen `<var>x</var>`, Index `<sub>…</sub>`, Hochzahl `<sup>…</sup>`, fett `<strong>`.
- Bruch: `<span class="frac"><span>Zähler</span><span>Nenner</span></span>`.
- Tabelle: `<table class="mini-table"><tr><th>…</th></tr><tr class="is-current"><td>…</td></tr></table>`.
- `term`-Helfer (`import { term } …`): `term.v('a')`, `term.sup(2)`, `term.polynomial([a,b,c], fmt)`, `term.fnDef('f', rhs)`.
Texte mit Platzhaltern in `strings` ablegen (`'m = {m} g'`) und mit `tr(key, { m: … })` füllen.

## 5. Qualität: was die besten Simulationen auszeichnet (verbindlich)

- Eine durchkomponierte Hauptszene (gegenständlich, wo es passt: Geräte, Tisch, Lineal, Geodreieck …) mit Verläufen, weichen Schatten (`softShadow`), runden Ecken, klarer Farbcodierung (gleiche Größe = gleiche Reihenfarbe in Szene, Diagramm und Text).
- Direkt bedienbar: ziehen, antippen; Rückmeldung durch Hover-Cursor (`surface.setCursor('grab'|'pointer')`), Hervorheben, kleine „Pop“-Animationen (`ease.outBack`).
- Erklärende Ebene: Hilfslinien, Maßpfeile, Beschriftungen mit Halo, Schritt-für-Schritt-Anzeige (z. B. Rechnung entsteht animiert), optional einblendbar über Gruppe „Anzeige“.
- Lehrreiche Modi/Beispiele statt eines einzigen Bildes; Sonderfälle sichtbar machen (z. B. „keine Lösung“, Grenzfall).
- Leere Zustände gestalten („Hier erscheinen die Messpunkte.“).
- Schmale Bildschirme: `narrow()` → Szene über Diagramm, kürzere Beschriftungen, Schrift ≥ 11 px, nichts abgeschnitten.
- Pfade/Geometrie cachen, nicht pro Frame neu berechnen, wenn sich nichts ändert; `requestRender()` nur solange etwas läuft.

## 6. Dateien neben `index.ts`

**model.ts**: reine Funktionen/Typen, deutsch kommentiert, keine DOM-Zugriffe. Alles Fachliche (Formeln, Konstanten, Auswertung) hierhin, damit es testbar ist.

**tests/<id>.test.ts**:
```ts
import { describe, expect, it } from 'vitest';
import { area, perimeter } from '../src/simulations/mathematik/<id>/model';

describe('Modell: <Titel>', () => {
  it('berechnet … (fachlich geprüfter Wert)', () => {
    expect(area(3, 4)).toBeCloseTo(12, 12);
  });
  it('Grenzfall …', () => { /* … */ });
});
```
Die allgemeinen Tests (`tests/simulations.test.ts`, `tests/curriculum.test.ts`) prüfen automatisch: Registry ↔ Lehrplan, Presets/Links nur gültige Werte, Lernmaterial vorhanden (DE/EN), `thumb.svg`-Format, KMK-IDs gültig.

**thumb.svg** (320 × 180, nur `currentColor`, Abstufung über `fill-opacity`/`stroke-opacity`, keine Texte, kein Gitter, Linien 3–5 px mit runden Enden, ein klares Motiv):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><rect x="60" y="40" width="200" height="100" rx="8" fill="currentColor" fill-opacity="0.12"/><path d="M60 140 L260 40" stroke-opacity="0.6"/></g></svg>
```

**Lehrplan** (`src/curriculum/<fach>.ts`): die Zeile `planned('<id>', L('Titel', 'Title'), [7, 8]),` an derselben Stelle ersetzen durch
```ts
{
  id: '<id>',
  status: 'ready',
  slug: L('de-slug', 'en-slug'),
  title: L('Titel', 'Title'),
  summary: L('1–2 Sätze, was man tut und sieht.', '1–2 sentences …'),
  grades: [7, 8],                                   // unverändert aus planned(...)
  kmk: ['…'],                                       // gültige IDs aus src/curriculum/kmk.ts (grep), vorhandene behalten
  keywords: L(['…', '…'], ['…', '…']),
  thumb: 'generic',
},
```

**Lernmaterial** `src/content/simulations/de/<id>.md` (60–110 Zeilen):
```md
---
description: "Ein Satz in doppelten Anführungszeichen."
---

## Worum geht es?

Erklärung mit **Fachbegriffen** und KaTeX: $A = a \cdot b$, Dezimalkomma $2{,}5\,\text{cm}$, abgesetzt:

$$
U = 2 \cdot (a + b)
$$

## Ausprobieren

1. Ziehe … Was fällt dir auf? [Beispiel laden](?mode=a&r=6)
2. …

## Aufgaben

### Aufgabe 1: Kurzer Titel

Aufgabentext. [Aufgabe laden](?r=3&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Lösung mit Rechenweg. [In der Simulation zeigen](?r=3)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe, Lernbereich (LehrplanPLUS Bayern, Gymnasium), Einstieg/Übung/Vertiefung.
- **Modell/Vereinfachungen:** …
- **Typische Fehlvorstellungen:**
  - „…“ – richtig ist …
```
Englisch (`en/<id>.md`): „What is it about?“, „Try it“, „Tasks“ (mit `<summary>Show solution</summary>`), „Notes for teachers“ – kürzer. Links nur mit gültigen Parameterwerten; `_hide=1` verdeckt Spoiler-Ergebnisse, `_lock=1` sperrt Regler.

## 7. Häufige Stolperfallen (aus früheren Gruppen)

- `update` mit `source === 'replace'` darf abgeleitete Werte nicht überschreiben (Beispiele/Links setzen den vollständigen Zustand).
- Bei `ctx.locked` keine Zustandsänderung durch Antippen/Ziehen/Aktionen.
- Beschriftungen kollidieren auf dem Handy → in Screenshots bei 390 px prüfen; Text am Rand mit `align` nach innen.
- Dunkelmodus: helle Naturfarben (Papier, Holz) abdunkeln, Schatten kräftiger; Text immer `theme.text`/`theme.muted`.
- Schalter im Bild und Zustand müssen übereinstimmen (z. B. offener Schalter ⇒ Lampe aus).
- YAML-`description` immer in doppelten Anführungszeichen.
- `npx astro check` muss 0 Hinweise liefern (auch ungenutzte Variablen/Importe).
