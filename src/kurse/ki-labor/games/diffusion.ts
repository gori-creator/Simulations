import { clear, h, seeded } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { closest, gaussian, generate, N, noisy, PICTURES, STEPS, type Pic } from '../../gemeinsam/models/diffusion';

/**
 * Spiel „Aus Rauschen wird Bild“: (1) Vorwärts: einem Bild Schritt für
 * Schritt Rauschen beimischen. (2) Rückwärts: aus reinem Rauschen erzeugen,
 * frei oder mit „Prompt“ (nur eine Bildklasse). Missionen: Rauschen bis zum
 * Ende sehen; drei Bilder erzeugen; ein Bild mit Prompt erzeugen.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const rnd = seeded(Date.now() % 7919);
  const fixedNoise = gaussian(seeded(5));
  let fwdPic = 0;
  let t = 0;
  let prompt: string | null = null;
  let generated = 0;
  const done = { forward: false, three: false, prompt: false };
  let finished = false;
  const results: { pic: Pic; label: string }[] = [];

  const tile = (pic: Pic, size: 'big' | 'small' = 'small') => {
    const el = h('div', { class: `kdiff kdiff--${size}`, attrs: { 'aria-hidden': 'true' } });
    for (const v of pic) {
      const px = h('span', { class: 'kdiff__px' });
      px.style.setProperty('--v', String(Math.max(0, Math.min(1, (v + 1) / 2))));
      el.append(px);
    }
    return el;
  };

  const fwdView = h('div', { class: 'kdiff-row' });
  const picRow = h('div', { class: 'krow' });
  const range = h('input', { class: 'kslider__input', attrs: { type: 'range', min: 0, max: STEPS, step: 1, value: 0, 'aria-label': tx({ de: 'Rauschschritt t', en: 'Noise step t' }) } });
  const tOut = h('output', { text: 't = 0' });
  const promptRow = h('div', { class: 'krow' });
  const genBtn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `✨ ${tx({ de: 'Bild erzeugen', en: 'Generate image' })}` });
  const steps = h('div', { class: 'kdiff-row kdiff-row--steps' });
  const gallery = h('div', { class: 'kdiff-row' });
  const goals = h('ul', { class: 'kgoals' });
  host.append(
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Vorwärts: Rauschen beimischen', en: 'Forward: mix in noise' }) }), picRow, fwdView, h('div', { class: 'kslider' }, h('span', { class: 'kslider__label' }, h('span', { text: tx({ de: 'Rauschschritt', en: 'Noise step' }) }), tOut), range)),
    h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: tx({ de: 'Rückwärts: aus reinem Rauschen ein Bild machen', en: 'Backward: turn pure noise into an image' }) }), h('p', { class: 'khint', text: tx({ de: 'Prompt (wählt, welche Bilder der Entrauscher anstrebt):', en: 'Prompt (chooses which images the denoiser aims for):' }) }), promptRow, h('div', { class: 'krow' }, genBtn), steps, h('p', { class: 'kpanel__title', text: tx({ de: 'Deine Bilder', en: 'Your images' }) }), gallery),
    h('div', { class: 'kpanel' }, goals),
  );

  PICTURES.forEach((p, i) => {
    const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': String(i === fwdPic) }, text: p.icon });
    b.addEventListener('click', () => {
      fwdPic = i;
      for (const [k, x] of [...picRow.children].entries()) x.setAttribute('aria-pressed', String(k === fwdPic));
      renderForward();
    });
    picRow.append(b);
  });
  const promptBtn = (id: string | null, label: string) => {
    const b = h('button', { class: 'kbtn kbtn--small', attrs: { type: 'button', 'aria-pressed': String(id === prompt), 'data-id': id ?? '' }, text: label });
    b.addEventListener('click', () => {
      prompt = id;
      for (const x of promptRow.querySelectorAll<HTMLButtonElement>('button')) x.setAttribute('aria-pressed', String((x.dataset.id || null) === prompt));
    });
    promptRow.append(b);
  };
  promptBtn(null, tx({ de: 'ohne Prompt', en: 'no prompt' }));
  for (const p of PICTURES) promptBtn(p.id, `„${p.icon}“`);

  function renderForward(): void {
    clear(fwdView);
    const x0 = PICTURES[fwdPic]!.pic;
    for (const k of [0, Math.round(STEPS / 3), Math.round((2 * STEPS) / 3), STEPS]) fwdView.append(h('figure', { class: 'kconv-fig' }, tile(noisy(x0, k, fixedNoise)), h('figcaption', { text: `t = ${k}` })));
    fwdView.append(h('figure', { class: 'kconv-fig' }, tile(noisy(x0, t, fixedNoise), 'big'), h('figcaption', { text: `t = ${t}` })));
    tOut.textContent = `t = ${t}`;
    if (t === STEPS && !done.forward) {
      done.forward = true;
      ctx.say({ de: 'Bei t = 10 ist vom Bild fast nichts mehr übrig – nur Rauschen. Ein Diffusionsmodell lernt, diesen Weg rückwärts zu gehen.', en: 'At t = 10 almost nothing of the image remains – just noise. A diffusion model learns to walk this path backwards.' }, 'think');
    }
    renderGoals();
  }

  function renderGoals(): void {
    clear(goals);
    const item = (ok: boolean, text: string) => goals.append(h('li', { class: ok ? 'is-done' : '' }, `${ok ? '✅' : '⬜'} ${text}`));
    item(done.forward, tx({ de: 'Schiebe das Rauschen bis t = 10.', en: 'Push the noise up to t = 10.' }));
    item(done.three, tx({ de: `Erzeuge drei Bilder (${Math.min(3, generated)} / 3).`, en: `Generate three images (${Math.min(3, generated)} / 3).` }));
    item(done.prompt, tx({ de: 'Erzeuge ein Bild mit Prompt.', en: 'Generate an image with a prompt.' }));
    if (!finished && done.forward && done.three && done.prompt) {
      finished = true;
      host.append(solved(tx({ de: 'Bilder aus Rauschen erzeugt!', en: 'Images generated from noise!' })));
      ctx.finish();
    }
  }

  genBtn.addEventListener('click', () => {
    const pics = PICTURES.filter((p) => !prompt || p.id === prompt).map((p) => p.pic);
    const path = generate(pics, rnd);
    clear(steps);
    path.forEach((x, k) => {
      if (k % 2 === 0 || k === path.length - 1) steps.append(h('figure', { class: 'kconv-fig' }, tile(x), h('figcaption', { text: `t = ${STEPS - k}` })));
    });
    const final = path.at(-1)!;
    const c = closest(final);
    results.push({ pic: final, label: c.icon });
    clear(gallery);
    for (const r of results.slice(-8)) gallery.append(tile(r.pic));
    generated += 1;
    if (prompt) done.prompt = true;
    if (generated >= 3 && !done.three) {
      done.three = true;
      ctx.say({ de: 'Fällt dir etwas auf? Jedes Ergebnis ist genau eines der vier Trainingsbilder. Mit nur vier Vorlagen kann das Modell nichts Neues erfinden – echte Modelle lernen aus Milliarden Bildern.', en: 'Notice anything? Every result is exactly one of the four training images. With only four examples the model can’t invent anything new – real models learn from billions of images.' }, 'wow');
    } else ctx.say({ de: `Aus Rauschen wurde ${c.icon} – in ${STEPS} Schritten.`, en: `Noise became ${c.icon} – in ${STEPS} steps.` }, 'happy');
    renderGoals();
  });
  range.addEventListener('input', () => {
    t = Number(range.value);
    renderForward();
  });
  renderForward();
};

export default game;
