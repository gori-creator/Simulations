// @ts-check
/**
 * Lernmaterial, Abschnitt „Aufgaben“: Der Knopf „Aufgabe laden“ steht im
 * Markdown am Ende des Aufgabentexts. Beim Build wandert er neben die
 * Aufgabenüberschrift (h3), damit er bei jeder Aufgabe an derselben Stelle
 * steht – statt mal mitten im Satz, mal in einer eigenen Zeile.
 *
 * Ergebnis: <div class="task-head"><h3>…</h3><a class="task-load" href="?…">Aufgabe laden</a></div>
 * Weitere Links im Text (z. B. „Aufgabe b laden“) bleiben, wo sie sind.
 */

const LOAD_TEXT = /^(Aufgabe( \S+)? laden|Aufgabe starten|Load task( \S+)?|Start the task)$/;

/** @param {any} node @returns {string} */
function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

/** @param {any} node */
const isHeading = (node) => node.type === 'element' && /^h[1-3]$/.test(node.tagName);

/**
 * Erster „Aufgabe laden“-Link, der am Ende eines Absatzes steht.
 * @param {any} p
 */
function trailingLoadLink(p) {
  if (p.type !== 'element' || p.tagName !== 'p') return undefined;
  const kids = (p.children ?? []).filter((/** @type {any} */ c) => !(c.type === 'text' && !c.value.trim()));
  const last = kids[kids.length - 1];
  if (!last || last.type !== 'element' || last.tagName !== 'a') return undefined;
  const target = String(last.properties?.href ?? '');
  if (!target.startsWith('?') || !LOAD_TEXT.test(textOf(last).trim())) return undefined;
  return last;
}

export const taskLayoutPlugin = {
  name: 'task-layout',
  element: {
    filter: ['h3'],
    /** @param {any} heading @param {any} ctx */
    visit(heading, ctx) {
      const parent = ctx.parent(heading);
      const index = ctx.indexOf(heading);
      if (!parent || index === undefined) return;
      // Nur der Text dieser Aufgabe: bis zur nächsten Überschrift
      for (const sibling of parent.children.slice(index + 1)) {
        if (isHeading(sibling)) return;
        const link = trailingLoadLink(sibling);
        if (!link) continue;
        ctx.removeNode(link);
        ctx.wrapNode(heading, {
          type: 'element',
          tagName: 'div',
          properties: { className: ['task-head'] },
          children: [
            {
              type: 'element',
              tagName: 'a',
              properties: { href: String(link.properties.href), className: ['task-load'] },
              children: [{ type: 'text', value: textOf(link).trim() }],
            },
          ],
        });
        return;
      }
    },
  },
};
