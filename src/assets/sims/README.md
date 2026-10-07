# Bilder für Simulationen

Ablage: `src/assets/sims/<simulations-id>/<datei>` – z. B. `ziegenproblem/ziege.webp`.

- Welche Bilder es gibt und mit welchem Prompt sie erzeugt werden, steht in `docs/BILDER.md`.
- Fehlt eine Datei, zeichnet die Simulation eine einfache Ersatzgrafik. Es gibt also keine Fehler, solange Bilder noch fehlen.
- Format: WebP oder PNG mit transparentem Hintergrund, Größe wie in `docs/BILDER.md` angegeben.
- Beim Build werden die Bilder automatisch mit Hash-Namen nach `dist/_astro/` kopiert und offline zwischengespeichert.
