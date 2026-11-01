import type { Mood } from '../types';

/**
 * Bit, der Roboter des KI-Abenteuers, als SVG-Text (für Astro mit `set:html`
 * und im Browser). Farben und Stimmungen kommen aus kurs.css: Das Attribut
 * `data-mood` am <svg> blendet die passenden Augen und den Mund ein.
 * `level` (1–10) baut Bit aus: ab Stufe 3 Ohren, ab 5 Brustlicht in Farbe,
 * ab 7 zweite Antenne, ab 10 Krone.
 */
export function bitSvg(mood: Mood = 'happy', level = 1, label = 'Bit'): string {
  const ears = level >= 3;
  const twin = level >= 7;
  const crown = level >= 10;
  return `<svg class="bit" viewBox="0 0 120 140" role="img" aria-label="${label}" data-mood="${mood}" data-level="${Math.max(1, Math.min(10, Math.round(level)))}">
<ellipse class="bit__shadow" cx="60" cy="134" rx="30" ry="5"/>
<g class="bit__all">
${crown ? '<path class="bit__crown" d="M42 14 L48 2 L54 10 L60 0 L66 10 L72 2 L78 14 Z"/>' : ''}
<line class="bit__ant" x1="${twin ? 48 : 60}" y1="20" x2="${twin ? 44 : 60}" y2="8"/>
<circle class="bit__spark" cx="${twin ? 44 : 60}" cy="7" r="6"/>
${twin ? '<line class="bit__ant" x1="72" y1="20" x2="76" y2="8"/><circle class="bit__spark bit__spark--b" cx="76" cy="7" r="6"/>' : ''}
<g class="bit__arm bit__arm--l"><rect x="10" y="88" width="14" height="30" rx="7"/></g>
<g class="bit__arm bit__arm--r"><rect x="96" y="88" width="14" height="30" rx="7"/></g>
<rect class="bit__body" x="28" y="86" width="64" height="42" rx="14"/>
<circle class="bit__core" cx="60" cy="107" r="8"/>
${ears ? '<rect class="bit__ear" x="10" y="40" width="12" height="24" rx="5"/><rect class="bit__ear" x="98" y="40" width="12" height="24" rx="5"/>' : ''}
<rect class="bit__head" x="16" y="18" width="88" height="68" rx="24"/>
<rect class="bit__screen" x="26" y="28" width="68" height="48" rx="15"/>
<g class="bit__face bit__face--happy"><circle cx="45" cy="49" r="7"/><circle cx="75" cy="49" r="7"/><path class="bit__line" d="M48 62 Q60 71 72 62"/></g>
<g class="bit__face bit__face--wink"><circle cx="45" cy="49" r="7"/><path class="bit__line" d="M68 50 Q75 44 82 50"/><path class="bit__line" d="M48 62 Q60 71 72 62"/></g>
<g class="bit__face bit__face--think"><circle cx="48" cy="45" r="6"/><circle cx="78" cy="45" r="6"/><path class="bit__line" d="M50 65 L68 63"/></g>
<g class="bit__face bit__face--wow"><circle cx="45" cy="47" r="9"/><circle cx="75" cy="47" r="9"/><ellipse cx="60" cy="66" rx="6" ry="5"/></g>
<g class="bit__face bit__face--sad"><circle cx="45" cy="51" r="6"/><circle cx="75" cy="51" r="6"/><path class="bit__line" d="M37 41 L50 44 M83 41 L70 44"/><path class="bit__line" d="M49 68 Q60 61 71 68"/></g>
</g>
</svg>`;
}
