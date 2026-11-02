import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { fgsm, minEps, pCross, SIZE, START_CIRCLE, trainLinear, type Img } from '../models/sehen';

/**
 * Spiel „Täuschung für Netze“: Ein trainiertes Modell unterscheidet Kreise
 * und Kreuze. (1) Mit höchstens 6 umgeschalteten Pixeln soll aus „Kreis“
 * „Kreuz“ werden – die Gewichtskarte verrät, wo es sich lohnt. (2) Die
 * gezielte Störung ε·sign(w) verändert jedes Pixel ein wenig, bis das
 * Modell kippt.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const model = trainLinear();
  let img: Img = START_CIRCLE.map((r) => [...r]);
  let flips = 0;
  let showWeights = false;
  let eps = 0;
  const done = { pixels: false, fgsm: false };
  let finished = false;
  const epsNeeded = minEps(model, START_CIRCLE);
  const maxW = Math.max(...model.w.map(Math.abs));

  const grid = h('div', { class: 'kadv', attrs: { role: 'group', 'aria-label': tx({ de: 'Bild 8 × 8 zum Bearbeiten', en: '8 × 8 image to edit' }) } });
  const gauge = meter(tx({ de: 'Das Modell sagt „Kreuz“ mit', en: 'The model says “cross” with' }));
  const flipsEl = h('p', { class: 'khint' });
  const weightsBtn = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: `🔍 ${tx({ de: 'Wo schaut das Modell hin?', en: 'Where does the model look?' })}` });
  const resetBtn = h('button', { class: 'kbtn', attrs: { type: 'button' }, text: `↺ ${tx({ de: 'Kreis zurücksetzen', en: 'Reset circle' })}` });
  const pair = h('div', { class: 'kadv-pair' });
  const range = h('input', { class: 'kslider__input', attrs: { type: 'range', min: 0, max: 0.5, step: 0.01, value: 0, 'aria-label': tx({ de: 'Stärke der Störung ε', en: 'Strength of the perturbation ε' }) } });
  const epsOut = h('output', { text: '0' });
  const fgsmGauge = meter(tx({ de: 'Gestörtes Bild: „Kreuz“ mit', en: 'Perturbed image: “cross” with' }));
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel kgrid-2' }, h('div', {}, h('p', { class: 'kpanel__title', text: tx({ de: 'Teil 1: Pixel antippen (an/aus)', en: 'Part 1: tap pixels (on/off)' }) }), grid, h('div', { class: 'krow' }, weightsBtn, resetBtn)), h('div', {}, h('div', { class: 'khint' }, gauge.el), flipsEl)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Teil 2: Jedes Pixel ein klein wenig verschieben – in die Richtung, die dem Modell am meisten schadet', en: 'Part 2: shift every pixel a tiny bit – in the direction that hurts the model most' }) }), pair, h('div', { class: 'kslider' }, h('span', { class: 'kslider__label' }, h('span', { text: 'ε' }), epsOut), range), h('div', { class: 'khint' }, fgsmGauge.el)),
    h('div', { class: 'kpanel' }, goals),
  );

  const tile = (v: number, w?: number) => {
    const cell = h('span', { class: 'kadv__px' });
    cell.style.setProperty('--v', String(v));
    if (w !== undefined) {
      cell.style.setProperty('--w', String(Math.abs(w) / maxW));
      cell.classList.add(w >= 0 ? 'is-pos' : 'is-neg');
    }
    return cell;
  };

  function render(): void {
    clear(grid);
    img.forEach((row, y) =>
      row.forEach((v, x) => {
        const b = h('button', { class: `kadv__btn${v > 0.5 ? ' is-on' : ''}${showWeights ? ' show-w' : ''}`, attrs: { type: 'button', 'aria-pressed': String(v > 0.5), 'aria-label': tx({ de: `Pixel ${x + 1}, ${y + 1}`, en: `Pixel ${x + 1}, ${y + 1}` }) } });
        if (showWeights) {
          const w = model.w[y * SIZE + x]!;
          b.style.setProperty('--w', String(Math.abs(w) / maxW));
          b.classList.add(w >= 0 ? 'is-pos' : 'is-neg');
        }
        b.addEventListener('click', () => {
          img[y]![x] = v > 0.5 ? 0 : 1;
          flips += 1;
          render();
        });
        grid.append(b);
      }),
    );
    const p = pCross(model, img);
    gauge.set(Math.round(p * 100), 100, ctx.percent(p), p >= 0.5);
    flipsEl.textContent = tx({ de: `Umgeschaltete Pixel: ${flips}`, en: `Pixels switched: ${flips}` });
    if (p >= 0.5 && !done.pixels) {
      if (flips <= 6) {
        done.pixels = true;
        ctx.say({ de: `Gekippt mit ${flips} Pixeln! Für dich ist es noch klar ein Kreis – das Modell sieht ein Kreuz.`, en: `Flipped with ${flips} pixels! To you it’s still clearly a circle – the model sees a cross.` }, 'wow');
      } else ctx.say({ de: 'Gekippt – aber mit mehr als 6 Pixeln. Setz zurück und nutze die Gewichtskarte: Blau zieht Richtung Kreuz.', en: 'Flipped – but with more than 6 pixels. Reset and use the weight map: blue pulls towards cross.' }, 'think');
    }
    renderFgsm();
  }

  function renderFgsm(): void {
    clear(pair);
    const adv = fgsm(model, START_CIRCLE, eps);
    const view = (im: Img, label: string) => h('figure', { class: 'kconv-fig' }, h('div', { class: 'kadv kadv--small', attrs: { role: 'img', 'aria-label': label } }, ...im.flat().map((v) => tile(v))), h('figcaption', { text: label }));
    pair.append(view(START_CIRCLE, tx({ de: 'Original', en: 'original' })), view(adv, tx({ de: `gestört (ε = ${ctx.num(eps, 2)})`, en: `perturbed (ε = ${ctx.num(eps, 2)})` })));
    const p = pCross(model, adv);
    fgsmGauge.set(Math.round(p * 100), 100, ctx.percent(p), p >= 0.5);
    if (p >= 0.5 && !done.fgsm) {
      done.fgsm = true;
      ctx.say({ de: `Bei ε = ${ctx.num(epsNeeded, 2)} kippt das Modell. Jedes Pixel hat sich nur leicht verändert – aber alle in die schädlichste Richtung.`, en: `At ε = ${ctx.num(epsNeeded, 2)} the model flips. Every pixel changed only slightly – but all in the most harmful direction.` }, 'wow');
    }
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.pixels, tx({ de: 'Mach aus dem Kreis ein „Kreuz“ – mit höchstens 6 umgeschalteten Pixeln.', en: 'Turn the circle into a “cross” – with at most 6 switched pixels.' }));
    item(done.fgsm, tx({ de: 'Finde mit dem Regler die kleinste Störung, die das Modell kippt.', en: 'Use the slider to find the smallest perturbation that flips the model.' }));
    if (!finished && done.pixels && done.fgsm) {
      finished = true;
      host.append(solved(tx({ de: 'Schwachstelle gefunden!', en: 'Weak spot found!' })));
      ctx.finish();
    }
  }

  weightsBtn.addEventListener('click', () => {
    showWeights = !showWeights;
    weightsBtn.setAttribute('aria-pressed', String(showWeights));
    if (showWeights) ctx.say({ de: 'Blau: Hier spricht ein helles Pixel für „Kreuz“. Orange: für „Kreis“. Das Modell zählt nur gewichtete Helligkeiten zusammen.', en: 'Blue: a bright pixel here speaks for “cross”. Orange: for “circle”. The model only adds up weighted brightness.' }, 'think');
    render();
  });
  resetBtn.addEventListener('click', () => {
    img = START_CIRCLE.map((r) => [...r]);
    flips = 0;
    render();
  });
  range.addEventListener('input', () => {
    eps = Number(range.value);
    epsOut.textContent = ctx.num(eps, 2);
    renderFgsm();
  });

  render();
};

export default game;
