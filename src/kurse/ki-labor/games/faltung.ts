import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { convolve, detectsHorizontal, IMAGES, KERNELS, type Img, type Kernel } from '../models/sehen';

/**
 * Spiel „Faltung“: Ein 3×3-Filter wandert über ein 16×16-Bild. Links das
 * Bild, in der Mitte der Filter (Voreinstellungen oder eigene Zahlen),
 * rechts die Merkmalskarte (blau positiv, orange negativ).
 * Missionen: senkrechte Kanten finden; einen eigenen Filter für waagerechte
 * Kanten bauen (geprüft an Testbildern mit Linien).
 */
const PRESETS: { id: keyof typeof KERNELS; name: Localized }[] = [
  { id: 'identitaet', name: { de: 'Identität', en: 'Identity' } },
  { id: 'weich', name: { de: 'Weichzeichnen', en: 'Blur' } },
  { id: 'senkrecht', name: { de: 'Kanten senkrecht', en: 'Vertical edges' } },
  { id: 'schaerfen', name: { de: 'Schärfen', en: 'Sharpen' } },
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  let imgId: keyof typeof IMAGES = 'haus';
  let kernel: Kernel = KERNELS.identitaet.map((r) => [...r]);
  let hover = -1;
  const done = { vertical: false, own: false };
  let finished = false;

  let inCells: HTMLElement[] = [];
  let outCells: HTMLElement[] = [];
  let current: { img: Img; out: Img } | null = null;

  const pixels = (img: Img, signed: boolean, label: string, store: HTMLElement[]) => {
    const grid = h('div', { class: 'kconv', attrs: { role: 'img', 'aria-label': label } });
    const max = Math.max(1e-9, ...img.flat().map(Math.abs));
    img.forEach((row, y) =>
      row.forEach((v, x) => {
        const cell = h('span', { class: 'kconv__px' });
        if (signed) {
          cell.style.setProperty('--v', String(Math.min(1, Math.abs(v) / max)));
          cell.classList.add(v >= 0 ? 'is-pos' : 'is-neg');
        } else cell.style.setProperty('--v', String(v));
        cell.addEventListener('pointerenter', () => setHover(y * 16 + x));
        store.push(cell);
        grid.append(cell);
      }),
    );
    grid.addEventListener('pointerleave', () => setHover(-1));
    return grid;
  };

  function setHover(i: number): void {
    hover = i;
    inCells.forEach((c, k) => c.classList.toggle('is-window', i >= 0 && Math.abs((k % 16) - (i % 16)) <= 1 && Math.abs(Math.floor(k / 16) - Math.floor(i / 16)) <= 1));
    outCells.forEach((c, k) => c.classList.toggle('is-window', k === i));
    showCalc();
  }

  function showCalc(): void {
    if (!current) return;
    const { img, out } = current;
    if (hover >= 0) {
      const x = hover % 16;
      const y = Math.floor(hover / 16);
      const terms: string[] = [];
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) terms.push(`${ctx.num(img[y + j]?.[x + i] ?? 0, 1)}·${ctx.num(kernel[j + 1]![i + 1]!, 1)}`);
      readout.textContent = `(${x + 1}|${y + 1}):  ${terms.join(' + ')} = ${ctx.num(out[y]![x]!, 2)}`;
    } else readout.textContent = tx({ de: 'Fahre über das Bild: Dann siehst du die Rechnung für ein Feld.', en: 'Hover over the image to see the calculation for one cell.' });
  }

  const imgRow = h('div', { class: 'krow' });
  const presetRow = h('div', { class: 'krow' });
  const kernelEl = h('div', { class: 'kkernel', attrs: { role: 'group', 'aria-label': tx({ de: 'Filter (3 × 3)', en: 'Filter (3 × 3)' }) } });
  const views = h('div', { class: 'kconv-views' });
  const readout = h('p', { class: 'kformula' });
  const check = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🧪 ${tx({ de: 'Ist mein Filter ein Detektor für waagerechte Kanten?', en: 'Is my filter a horizontal edge detector?' })}` });
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel' }, imgRow, views, readout),
    h('div', { class: 'kpanel kgrid-2' }, h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Filter wählen oder Zahlen selbst eintragen', en: 'Choose a filter or enter numbers yourself' }) }), presetRow, kernelEl), h('div', {}, h('div', { class: 'krow' }, check), goals)),
  );

  for (const id of Object.keys(IMAGES) as (keyof typeof IMAGES)[]) {
    const names = { haus: { de: '🏠 Haus', en: '🏠 House' }, sieben: { de: '7️⃣ Ziffer', en: '7️⃣ Digit' }, gesicht: { de: '🙂 Gesicht', en: '🙂 Face' } };
    const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': String(id === imgId), 'data-img': id }, text: tx(names[id]) });
    b.addEventListener('click', () => {
      imgId = id;
      for (const x of imgRow.querySelectorAll<HTMLButtonElement>('button')) x.setAttribute('aria-pressed', String(x.dataset.img === imgId));
      renderImages();
    });
    imgRow.append(b);
  }
  for (const preset of PRESETS) {
    const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button' }, text: tx(preset.name) });
    b.addEventListener('click', () => {
      kernel = KERNELS[preset.id].map((r) => [...r]);
      if (preset.id === 'senkrecht' && !done.vertical) {
        done.vertical = true;
        ctx.say({ de: 'Links −, rechts +: Der Filter rechnet die Helligkeit rechts minus links. Wo es einen Sprung gibt – an senkrechten Kanten – leuchtet die Karte.', en: 'Left −, right +: the filter computes brightness on the right minus the left. Where there is a jump – at vertical edges – the map lights up.' }, 'wow');
      }
      renderKernel();
      renderImages();
    });
    presetRow.append(b);
  }

  function renderKernel(): void {
    clear(kernelEl);
    kernel.forEach((row, j) =>
      row.forEach((v, i) => {
        const input = h('input', { class: 'input kkernel__in', attrs: { type: 'number', step: 1, min: -4, max: 4, value: String(Math.round(v * 100) / 100), 'aria-label': tx({ de: `Filterzeile ${j + 1}, Spalte ${i + 1}`, en: `Filter row ${j + 1}, column ${i + 1}` }) } });
        input.addEventListener('input', () => {
          const n = Number(input.value.replace(',', '.'));
          kernel[j]![i] = Number.isFinite(n) ? Math.max(-4, Math.min(4, n)) : 0;
          renderImages();
        });
        kernelEl.append(input);
      }),
    );
  }

  function renderImages(): void {
    const img = IMAGES[imgId];
    const out = convolve(img, kernel);
    current = { img, out };
    inCells = [];
    outCells = [];
    clear(views);
    views.append(
      h('figure', { class: 'kconv-fig' }, pixels(img, false, tx({ de: 'Eingabebild', en: 'Input image' }), inCells), h('figcaption', { text: tx({ de: 'Bild', en: 'Image' }) })),
      h('span', { class: 'kconv-op', attrs: { 'aria-hidden': 'true' }, text: '⊛' }),
      h('figure', { class: 'kconv-fig' }, pixels(out, true, tx({ de: 'Merkmalskarte', en: 'Feature map' }), outCells), h('figcaption', { text: tx({ de: 'Merkmalskarte', en: 'Feature map' }) })),
    );
    setHover(hover);
    renderGoals();
  }

  function renderGoals(): void {
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.vertical, tx({ de: 'Probiere den Filter „Kanten senkrecht“ aus.', en: 'Try the “vertical edges” filter.' }));
    item(done.own, tx({ de: 'Trage selbst Zahlen ein: einen Filter für waagerechte Kanten.', en: 'Enter numbers yourself: a filter for horizontal edges.' }));
    if (!finished && done.vertical && done.own) {
      finished = true;
      host.append(solved(tx({ de: 'Filter gebaut!', en: 'Filter built!' })));
      ctx.finish();
    }
  }

  check.addEventListener('click', () => {
    if (detectsHorizontal(kernel)) {
      done.own = true;
      ctx.say({ de: 'Ja! Dein Filter reagiert stark auf waagerechte und kaum auf senkrechte Linien. Ein Faltungsnetz lernt solche Zahlen selbst – Tausende Filter, Schicht für Schicht.', en: 'Yes! Your filter responds strongly to horizontal and hardly to vertical lines. A convolutional network learns such numbers itself – thousands of filters, layer by layer.' }, 'wow');
      renderGoals();
      return;
    }
    ctx.mistake();
    const sum = kernel.flat().reduce((a, b) => a + b, 0);
    ctx.say(Math.abs(sum) > 1e-9 ? { de: `Die Summe deiner Zahlen ist ${ctx.num(sum, 2)}. Ein Kantenfilter sollte auf gleichmäßigen Flächen 0 ergeben – also Summe 0.`, en: `Your numbers add up to ${ctx.num(sum, 2)}. An edge filter should give 0 on flat areas – so the sum should be 0.` } : { de: 'Noch nicht. Tipp: oben negative, unten positive Zahlen – wie „Kanten senkrecht“, nur gedreht.', en: 'Not yet. Tip: negative numbers on top, positive at the bottom – like “vertical edges”, just rotated.' }, 'think');
  });

  renderKernel();
  renderImages();
};

export default game;
