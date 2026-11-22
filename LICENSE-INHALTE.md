# Lizenz der Inhalte (CC BY-SA 4.0)

Scitura ist eine offene Lernplattform (**OER**, Open Educational Resources). Damit Lehrkräfte die Inhalte frei nutzen, anpassen und weitergeben dürfen, gelten zwei Lizenzen:

| Was | Wo | Lizenz |
| --- | --- | --- |
| Programmcode (Simulationen, Kern, Seite, Spiele, Kurse, Skripte, Tests) | `src/**/*.ts`, `src/**/*.astro`, `src/styles/`, `scripts/`, `tests/`, `tooling/` | [MIT](LICENSE) |
| Lernmaterial, Texte, Aufgaben, Infoseiten | `src/content/` und Texte im Code (`L('…', '…')`) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de) |
| Bilder, Vorschaubilder, Spielbilder | `src/assets/`, `src/simulations/**/thumb.svg`, `public/icons/` | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de) |
| Dokumentation, Prompts, Anleitungen | `docs/`, `*.md` | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de) |

## Was CC BY-SA 4.0 erlaubt

Du darfst die Inhalte **kopieren, verbreiten, verändern und darauf aufbauen**, auch im Unterricht, in Arbeitsblättern, Schulbüchern oder auf anderen Plattformen, solange du:

1. **Namensnennung:** „Scitura (scitura.de), CC BY-SA 4.0“ angibst und auf die Lizenz verlinkst,
2. **Weitergabe unter gleichen Bedingungen:** veränderte Fassungen wieder unter CC BY-SA 4.0 weitergibst.

Beispiel für ein Arbeitsblatt: *„Simulation: Satz des Thales – Scitura (scitura.de), CC BY-SA 4.0“*.

## Ausgenommen

- **Name und Logo „Scitura“** (`public/favicon.svg`, `src/components/Logo.astro`, `public/icons/`): Sie kennzeichnen das Original. Eigene Fassungen der Seite brauchen einen eigenen Namen und ein eigenes Logo.
- **Fremde Bestandteile** (KaTeX, qrcode-generator, Astro): eigene Lizenzen, siehe `public/lizenzen.txt`.

## Hinweis zu den Bildern

Die Bilder in `src/assets/` sind mit KI erzeugt; zu jedem Bild steht der Prompt in `docs/BILDER.md` bzw. `docs/ZAHLENFABRIK-BILDER.md` (Herkunft und Prüfung: `docs/BILDRECHTE.md`). Ob an KI-Bildern überhaupt ein Urheberrecht entsteht, ist rechtlich offen. Soweit Rechte bestehen, gelten sie unter CC BY-SA 4.0.

## Beiträge

Wer etwas beiträgt (Pull Request, Simulation, Text, Bild), stellt es unter dieselben Lizenzen: Code unter MIT, Inhalte unter CC BY-SA 4.0. Details: [CONTRIBUTING.md](CONTRIBUTING.md).

---

**English summary:** Code is MIT-licensed ([LICENSE](LICENSE)). Texts, exercises, images and documentation are licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/): you may share and adapt them, including commercially, if you credit “Scitura (scitura.de), CC BY-SA 4.0” and share adaptations under the same licence. The name and logo “Scitura” are not licensed. Contributions are accepted under the same licences.
