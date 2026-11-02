import { L } from '../../../curriculum/helpers';
import { clear, h, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { gaussian, noisy, PICTURES, reverseStep, STEPS, type Pic } from '../../gemeinsam/models/diffusion';

/**
 * Spiel „Bilder aus Rauschen“ (Klasse 5–10): erst ein Bild verrauschen, dann
 * mit Bit aus reinem Rauschen ein Bild „aufräumen“ – Schritt für Schritt. Man
 * wählt vorher, was Bit malen soll (wie ein Prompt).
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 6151);
  const fixed = gaussian(seeded(2));
  let wish = PICTURES[0]!.id;
  let x: Pic | null = null;
  let t = STEPS;
  /** Alle Zwischenbilder des aktuellen Malvorgangs (für den Filmstreifen). */
  let history: Pic[] = [];
  let made = 0;
  let sawNoise = false;
  let finished = false;

  const tile = (pic: Pic, big = false) => {
    const el = h('div', { class: `kdiff ${big ? 'kdiff--big' : 'kdiff--small'}`, attrs: { 'aria-hidden': 'true' } });
    for (const v of pic) {
      const px = h('span', { class: 'kdiff__px' });
      px.style.setProperty('--v', String(Math.max(0, Math.min(1, (v + 1) / 2))));
      el.append(px);
    }
    return el;
  };

  const fwd = h('div', { class: 'kdiff-row' });
  const range = h('input', { class: 'kslider__input', attrs: { type: 'range', min: 0, max: STEPS, step: 1, value: 0, 'aria-label': tx(L('Wie viel Rauschen?', 'How much noise?')) } });
  const wishRow = h('div', { class: 'krow' });
  const canvas = h('div', { class: 'kdiff-row' });
  const strip = h('div', { class: 'kdiff-row kdiff-row--steps', attrs: { 'aria-hidden': 'true' } });
  const startBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🌫️ ${tx(L('Neues Rauschen', 'New noise'))}` });
  const stepBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🧹 ${tx(L('Bit räumt einen Schritt auf', 'Bit cleans up one step'))}` });
  const status = h('p', { class: 'kvote', attrs: { 'aria-live': 'polite' } });
  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('1. Mach ein Bild kaputt: Schieb das Rauschen hoch.', '1. Break a picture: slide the noise up.')) }), fwd, h('label', { class: 'kslider' }, h('span', { class: 'kslider__label', text: tx(L('Rauschen', 'Noise')) }), range)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx(L('2. Was soll Bit malen?', '2. What should Bit paint?')) }), wishRow, h('div', { class: 'krow' }, startBtn, stepBtn), canvas, strip, status),
  );

  const renderFwd = () => {
    clear(fwd);
    const k = Number(range.value);
    fwd.append(tile(PICTURES[1]!.pic), h('span', { class: 'kconv-op', text: '→' }), tile(noisy(PICTURES[1]!.pic, k, fixed), true));
    if (k === STEPS && !sawNoise) {
      sawNoise = true;
      ctx.say(L('Jetzt ist vom Haus nichts mehr übrig – nur noch Kriselkram. Ein Bildgenerator macht genau das rückwärts!', 'Now nothing is left of the house – just fuzz. An image generator does exactly this backwards!'), 'wow');
    }
    check();
  };
  range.addEventListener('input', renderFwd);

  for (const p of PICTURES) {
    const b = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(p.id === wish), 'data-id': p.id }, text: p.icon });
    b.addEventListener('click', () => {
      wish = p.id;
      for (const x2 of wishRow.querySelectorAll<HTMLButtonElement>('button')) x2.setAttribute('aria-pressed', String(x2.dataset.id === wish));
    });
    wishRow.append(b);
  }

  function renderCanvas(): void {
    clear(canvas);
    clear(strip);
    if (x) canvas.append(tile(x, true));
    if (history.length > 1) history.forEach((pic, i) => strip.append(h('div', { class: 'kdiff-step' }, tile(pic), h('small', { text: String(STEPS - i) }))));
    stepBtn.disabled = !x || t <= 0;
    status.textContent = !x ? tx(L('Drück „Neues Rauschen“.', 'Press “New noise”.')) : t > 0 ? tx(L(`Noch ${t} Schritte bis zum fertigen Bild.`, `${t} steps left until the finished picture.`)) : tx(L('Fertig gemalt!', 'Painting finished!'));
  }

  startBtn.addEventListener('click', () => {
    x = gaussian(rnd);
    t = STEPS;
    history = [x];
    renderCanvas();
  });
  stepBtn.addEventListener('click', () => {
    if (!x || t <= 0) return;
    x = reverseStep(x, t, PICTURES.filter((p) => p.id === wish).map((p) => p.pic));
    t -= 1;
    history.push(x);
    renderCanvas();
    if (t === 0) {
      made += 1;
      ctx.say(L(`Aus Rauschen wurde ${PICTURES.find((p) => p.id === wish)!.icon}! Ich habe bei jedem Schritt geschätzt, was zu viel ist, und es weggeräumt.`, `Noise became ${PICTURES.find((p) => p.id === wish)!.icon}! At every step I estimated what was too much and cleaned it away.`), 'wow');
      check();
    }
  });

  function check(): void {
    if (!finished && sawNoise && made >= 2) {
      finished = true;
      host.append(solved(tx(L('Bilder aus Rauschen gemalt!', 'Pictures painted from noise!'))));
      ctx.finish();
    }
  }

  renderFwd();
  renderCanvas();
};

export default game;
