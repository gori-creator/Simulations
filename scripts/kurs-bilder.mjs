#!/usr/bin/env node
/**
 * Bilder der KI-Kurse einbauen (Prompts: docs/KI-KURS-BILDER.md).
 *
 * Aufruf: npm run kurs:bilder            – alle Bilder aus incoming/kurse/ umwandeln
 *         npm run kurs:bilder -- --check – nur zeigen, welche Bilder schon da sind
 *
 * Die Dateien in incoming/kurse/ heißen nach ihrer Nummer aus der Bilderliste,
 * z. B. `B07.png` oder `B07-belohnung.png` (Groß-/Kleinschreibung egal). Das
 * Skript schneidet auf das Zielformat zu, speichert WebP unter
 * src/assets/kurse/… und erzeugt dazu die dunkle Fassung (`-dunkel.webp`):
 * Helligkeit umgekehrt, Farbton und Sättigung bleiben – wie bei den
 * Bereichsbildern („Blaupause“).
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const list = JSON.parse(readFileSync(join(root, 'scripts/kurs-bilder.json'), 'utf8'));
const incoming = join(root, 'incoming/kurse');
const assets = join(root, 'src/assets/kurse');
const MAX_BYTES = 300 * 1024;
const checkOnly = process.argv.includes('--check');

/** HSL-Helligkeit umkehren (L → 0,08 + 0,84 · (1 − L)), Farbton und Sättigung behalten. */
function darken(data, channels) {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0;
    let s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h /= 6;
    }
    // Kräftige Farben (Akzente) behalten ihre Helligkeit fast, Flächen und Linien drehen sich um.
    const target = 0.08 + 0.84 * (1 - l);
    const nl = s > 0.55 && l > 0.3 && l < 0.7 ? Math.min(0.72, l + 0.12) : target;
    const q = nl < 0.5 ? nl * (1 + s) : nl + s - nl * s;
    const p = 2 * nl - q;
    const hue = (t) => {
      let x = t;
      if (x < 0) x += 1;
      if (x > 1) x -= 1;
      if (x < 1 / 6) return p + (q - p) * 6 * x;
      if (x < 1 / 2) return q;
      if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
      return p;
    };
    const [nr, ng, nb] = s === 0 ? [nl, nl, nl] : [hue(h + 1 / 3), hue(h), hue(h - 1 / 3)];
    data[i] = Math.round(nr * 255);
    data[i + 1] = Math.round(ng * 255);
    data[i + 2] = Math.round(nb * 255);
  }
  return data;
}

async function save(pipeline, file) {
  let quality = 82;
  let info;
  do {
    info = await pipeline.clone().webp({ quality, effort: 6 }).toFile(file);
    quality -= 6;
  } while (info.size > MAX_BYTES && quality > 50);
  return info.size;
}

const byId = new Map(list.map((entry) => [entry.id.toUpperCase(), entry]));

if (checkOnly || !existsSync(incoming)) {
  let have = 0;
  for (const entry of list) {
    const ok = existsSync(join(assets, `${entry.path}.webp`));
    if (ok) have += 1;
    else console.log(`fehlt  ${entry.id.padEnd(4)} ${entry.path}`);
  }
  console.log(`\n${have} von ${list.length} Kursbildern vorhanden.${existsSync(incoming) ? '' : ' (Ordner incoming/kurse/ gibt es nicht.)'}`);
  process.exit(0);
}

let done = 0;
for (const name of readdirSync(incoming).sort()) {
  const match = /^([abc]\d{1,2})/i.exec(name);
  if (!match || !/\.(png|jpe?g|webp)$/i.test(name)) continue;
  const id = match[1].toUpperCase().replace(/^([ABC])(\d)$/, '$10$2');
  const entry = byId.get(id) ?? byId.get(match[1].toUpperCase());
  if (!entry) {
    console.log(`übersprungen: ${name} (Nummer ${id} steht nicht in der Liste)`);
    continue;
  }
  const source = join(incoming, name);
  const target = join(assets, `${entry.path}.webp`);
  mkdirSync(dirname(target), { recursive: true });
  const base = sharp(source).resize(entry.width, entry.height, { fit: 'cover', position: entry.position ?? 'centre' }).removeAlpha();
  const size = await save(base, target);
  const { data, info } = await base.clone().raw().toBuffer({ resolveWithObject: true });
  const dark = sharp(darken(data, info.channels), { raw: { width: info.width, height: info.height, channels: info.channels } });
  const darkSize = await save(dark, target.replace(/\.webp$/, '-dunkel.webp'));
  console.log(`${entry.id.padEnd(4)} ${name} → ${entry.path}.webp (${Math.round(size / 1024)} KB, dunkel ${Math.round(darkSize / 1024)} KB)`);
  done += 1;
}
console.log(`\n${done} Bild(er) umgewandelt. Danach: npm run verify, Quellen in incoming/kurse/ löschen, Eintrag in docs/KI-KURS-BILDER.md abhaken.`);
if (done === 0 && statSync(incoming).isDirectory()) console.log('Hinweis: Dateinamen müssen mit der Nummer beginnen, z. B. B07.png.');
