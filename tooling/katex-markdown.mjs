// @ts-check
/**
 * Rendert Formeln in Markdown ($...$ und $$...$$) bereits beim Build mit KaTeX.
 * Dadurch braucht der Browser kein JavaScript für Formeln und es werden keine
 * externen Server (CDNs) kontaktiert.
 */
import katex from 'katex';

/** @param {string} tex @param {boolean} displayMode */
function render(tex, displayMode) {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: 'ignore',
  });
}

export const katexMarkdownPlugin = {
  name: 'katex-markdown',
  /** @param {{ value: string }} node @param {any} ctx */
  inlineMath(node, ctx) {
    ctx.replaceNode(node, { type: 'html', value: render(node.value, false) });
  },
  /** @param {{ value: string }} node @param {any} ctx */
  math(node, ctx) {
    ctx.replaceNode(node, {
      type: 'html',
      value: `<div class="math-display">${render(node.value, true)}</div>`,
    });
  },
};
