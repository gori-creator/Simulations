# Eine neue Simulation anlegen

Diese Anleitung führt von einer geplanten Simulation im Lehrplan bis zur fertigen Seite.

## 1. Grundgerüst erzeugen

```bash
npm run new:sim -- <id> --subject <mathematik|physik|chemie>            # statisch, mit Koordinatensystem
npm run new:sim -- <id> --subject physik --animated                     # mit Animation (Vorlage: Federschwingung)
```

Die `id` muss mit der ID im Lehrplan übereinstimmen (z. B. `fadenpendel` in `src/curriculum/physik.ts`). Das Skript legt an:

- `src/simulations/<fach>/<id>/index.ts` – die Umsetzung (Vorlage)
- `src/content/simulations/de/<id>.md` – das Lernmaterial (Vorlage)

Die Registry (`src/simulations/registry.ts`) findet jeden Ordner `src/simulations/<fach>/<id>/` mit einer `index.ts` automatisch; der Ordnername ist die ID.

## 2. Im Lehrplan freischalten

In `src/curriculum/<fach>.ts` den `planned(...)`-Eintrag durch einen vollständigen Eintrag ersetzen:

```ts
{
  id: 'fadenpendel',
  status: 'ready',
  slug: L('fadenpendel', 'simple-pendulum'),      // URL-Segment je Sprache
  title: L('Fadenpendel', 'Simple pendulum'),
  summary: L('Ein bis zwei Sätze für die Karte …', 'One or two sentences …'),
  grades: [10, 12],                                 // Klassenstufen; > 13 = Uni
  kmk: ['P-E', 'P-BK-Mathematisieren'],             // IDs aus curriculum/kmk.ts
  keywords: L(['Schwingung', 'Periode'], ['oscillation', 'period']),
  thumb: 'generic',                                 // Vorschaubild; besser: eigene thumb.svg im Simulationsordner
},
```

## 3. Simulation entwickeln

`npm run dev` starten und die Seite öffnen. Das Grundprinzip:

```ts
export default defineSimulation({
  id: 'meine-simulation',
  params: [
    { key: 'a', type: 'number', label: L('Amplitude a', 'Amplitude a'), min: -5, max: 5, step: 0.1, default: 1 },
    { key: 'grid', type: 'boolean', label: L('Gitternetz', 'Grid'), default: true },
    { key: 'mode', type: 'choice', label: L('Modus', 'Mode'), options: [...], default: 'x' },
  ],
  readouts: [{ key: 'value', label: L('Wert', 'Value'), spoiler: true }],
  presets: [{ id: 'big', label: L('Groß', 'Large'), values: { a: 4 } }],

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-10, 10], y: [-6, 6] });
    const p = ctx.params;                       // typisiert: p.a ist number, p.grid boolean

    return {
      update(changed, source) {                 // nach jeder Parameteränderung
        ctx.readout('value', `a = ${ctx.fmt.num(p.a)}`);
      },
      render() {                                // zeichnet alles neu
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        plot.fn((x) => p.a * Math.sin(x), { color: ctx.theme.series[0] });
        plot.end();
      },
      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
```

### Wichtige Bausteine

| Baustein | Verwendung |
| --- | --- |
| `ctx.params` | aktuelle Werte (nur lesen) |
| `ctx.set({ a: 2 })` | Werte ändern, z. B. beim Ziehen; wird automatisch auf `min`/`max`/`step` gerundet |
| `ctx.readout(key, text \| { html } \| null)` | Ergebnis anzeigen (`null` blendet aus) |
| `ctx.fmt` | `num`, `fixed`, `signed`, `pi`, `point` – sprachrichtige Zahlen |
| `term` | `sum`, `polynomial`, `shifted`, `fnDef` – Terme wie `0,5x − 2` |
| `ctx.theme.series[0…5]` | Farben, die in hell und dunkel funktionieren |
| `ctx.locked` | `true`, wenn die Regler gesperrt sind (Ziehpunkte dann deaktivieren) |
| `ctx.clock` | Uhr für animierte Simulationen (`animated: true`) |
| `plot.addHandle({ get, set, axis, enabled })` | ziehbarer Punkt |
| `plot.fn`, `line`, `segment`, `arrow`, `point`, `circle`, `arc`, `polygon`, `fillBetween`, `text` | Zeichnen in Weltkoordinaten |
| `new Plot(surface, { region })` | mehrere Koordinatensysteme auf einer Fläche |
| `FixedStepper`, `rk4` | Physik: feste Zeitschritte und genaue Integration |
| `actions` + `action(id)` | Knöpfe unter der Bühne (z. B. „Würfeln“); `ctx.setAction(id, { enabled, label })` ändert sie zur Laufzeit |
| `new TapTarget(surface, { hit, onTap })` | antippbare Bereiche ohne Koordinatensystem (Türen, Karten …) |
| `Tween`, `ease` | Übergänge, die durch Knöpfe ausgelöst werden; in `render()` abfragen und `ctx.requestRender()` aufrufen, solange `running` |
| `images` + `ctx.images.get(key)` | optionale Bilder; liefert `null`, solange das Bild fehlt → immer eine gezeichnete Ersatzgrafik vorsehen |
| `plot.setRangePadded(x, y, { left, bottom })` | Diagramme mit Platz für Achsenzahlen |

### Regeln

- **Rechenlogik** (ohne Zeichnen) in eine eigene `model.ts` legen und in `tests/simulations.test.ts` testen.
- **Alle Texte zweisprachig** (`L('…', '…')`). Deutsch zuerst, Englisch darf kurz sein.
- **Parameter-Schlüssel** kurz halten (sie stehen in geteilten Links) und **nie** mit `_` beginnen.
- Werte, die durch eine **Umrechnung** entstehen (z. B. beim Wechsel der Darstellungsform), nur setzen, wenn `update(changed, source)` mit `source === 'input'` aufgerufen wird. Bei `init` (geteilter Link) und `replace` (Beispiel, Zurücksetzen, Link im Lernmaterial) bringt der Zustand alle Werte schon mit.
- Ergebnisse, die eine Aufgabe verraten würden, als `spoiler: true` markieren.
- Ziehbare Punkte mit `enabled: () => !ctx.locked` versehen.
- Keine externen Bibliotheken oder Server einbinden, die Daten übertragen.
- **Bilder** (optional): Dateien in `src/assets/sims/<id>/`, in `images` deklarieren und mit Größe, Hintergrund und Bild-Prompt in `docs/BILDER.md` eintragen (ein Test prüft das).

## 4. Lernmaterial schreiben

`src/content/simulations/de/<id>.md` mit den Abschnitten **Worum geht es?**, **Ausprobieren**, **Aufgaben** und **Hinweise für Lehrkräfte**.

- Formeln: `$f(x) = mx + b$` bzw. `$$ … $$`. Im Deutschen Dezimalkomma mit `{,}` schreiben: `$-1{,}5$`.
- Einstellungen laden: `[Beispiel laden](?a=2&b=-1)`. Mit `_hide=1` werden Ergebnisse verdeckt: `[Aufgabe laden](?a=2&_hide=1)`.
- Lösungen in `<details><summary>Lösung anzeigen</summary> … </details>` (Leerzeilen innerhalb beachten).
- Optional eine englische Fassung unter `src/content/simulations/en/<id>.md`.

## 5. Prüfen

```bash
npm run verify
```

Die Konsistenztests melden u. a. fehlende Registrierung, fehlendes Lernmaterial, ungültige Beispiele oder doppelte Adressen.

## Checkliste

- [ ] Lehrplan-Eintrag auf `ready` mit `slug`, `summary`, `thumb`, `kmk`, `keywords`
- [ ] Zuordnung im Länder-Lehrplan (`src/curriculum/lehrplaene/`) geprüft – Klassenstufen müssen passen
- [ ] Simulation funktioniert mit Maus, Touch und Tastatur (Regler)
- [ ] Hell- und Dunkelmodus geprüft
- [ ] Geteilter Link stellt den Zustand exakt wieder her (auch mit `_lock`/`_hide`)
- [ ] Rechenlogik getestet
- [ ] Bilder (falls verwendet) in `docs/BILDER.md` mit Prompt eingetragen; Ersatzgrafik sieht ordentlich aus
- [ ] Lernmaterial (DE) mit Aufgaben und Lösungen; Englisch optional
- [ ] `npm run verify` ist grün
