# Farbkonzept der Simulationen (Stand 10/2026)

Die Simulationen zeichnen ihre Graphen, Pfeile, Balken und farbigen Zahlen mit den
sechs **Reihenfarben** `--series-1 … --series-6` (in `src/styles/global.css`, im Code
über `ctx.theme.series[0 … 5]`). Dieses Konzept legt sie fest.

## Leitidee

Klar, ruhig, trotzdem farbig: kühle **Edelsteintöne**, die zur Marke (Scitura-Blau,
Navy) passen, statt greller Signalfarben. Jede Farbe behält ihre Rolle; nur der Ton
ist feiner abgestimmt. Damit sehen alle Simulationen ohne Änderung am Code stimmig aus.

| Platz | Rolle (üblich) | Hell | Dunkel | vorher hell / dunkel |
| --- | --- | --- | --- | --- |
| 1 | Hauptgröße, Funktion f, E_pot | `#2c5fd6` Saphirblau | `#78a0fa` | `#2563eb` / `#6ea0ff` |
| 2 | zweite Größe, Markierungen | `#cc3f76` Himbeere | `#f283ad` | `#d6336c` / `#ff7aa8` |
| 3 | Ableitung, „richtig“, Wachstum | `#0f6544` Smaragd | `#3fae7f` | `#2b8a3e` / `#69db7c` |
| 4 | Gegenstück zu 1, E_kin, Wärme | `#b8600c` Bernstein | `#e8a650` | `#e8590c` / `#ffa94d` |
| 5 | dritte Größe | `#7052dc` Violett | `#a68cf2` | `#7048e8` / `#b197fc` |
| 6 | vierte Größe | `#0a7d96` Petrol | `#4cc0d6` | `#0c8599` / `#66d9e8` |

## Prüfregeln (beim Ändern einhalten)

- **Schrift in Reihenfarben ist lesbar:** hell ≥ 4,5 : 1 auf Weiß (bisher lagen Orange
  und Grün darunter), dunkel ≥ 6 : 1 auf `--plot-bg`.
- **Farbsehschwäche:** Benachbarte Plätze (1–2, 2–3, …) sind bei Protanopie und
  Deuteranopie unterscheidbar (OKLab-ΔE ≥ 7, hell 7,9, dunkel 7,2; vorher 4,3 zwischen
  Grün und Orange). Trotzdem gilt weiter: Graphen und Größen zusätzlich beschriften.
- **Ohne Neon:** Im Dunkelmodus höchstens mittlere Buntheit, damit nichts grell leuchtet.
- Farben von Gegenständen (Widerstandsringe, Kabel, Fotos, Zielscheiben) sind keine
  Reihenfarben und bleiben, wie sie sind.

## Details

- **Pfeilspitzen:** überall dieselbe, leicht eingekerbte Form aus `drawArrowHead`
  (`src/sim-core/draw.ts`), auch an den Achsen von `Plot`. Neue Simulationen
  zeichnen keine eigenen Pfeilspitzen mehr.
- **Bereichssymbole** (Fachseiten): eigene Zeichnungen in `src/components/AreaGlyph.astro`,
  feine Linien in Textfarbe plus ein Akzent in der Fachfarbe. Neue Bereiche bekommen
  ein eigenes Symbol im selben Stil (40 × 40, Linie 1,75, runde Enden).
