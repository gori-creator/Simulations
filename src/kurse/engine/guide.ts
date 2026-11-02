import type { GuideId, Mood } from '../types';
import { bitSvg } from './bit';

/**
 * Ada, die Laborassistenz des KI-Labors (Oberstufe), als SVG-Text – benannt
 * nach Ada Lovelace (1843: erste Programmidee für eine Rechenmaschine).
 * Eine schwebende Kugel mit Visier; Stimmungen wie bei Bit über `data-mood`.
 * `level` (1–10) baut Ada aus: ab Stufe 3 Umlaufbahn, ab 5 leuchtender Kern,
 * ab 7 zweite Bahn mit Knoten, ab 10 Lichtkranz.
 */
export function adaSvg(mood: Mood = 'happy', level = 1, label = 'Ada'): string {
  const lv = Math.max(1, Math.min(10, Math.round(level)));
  const orbit = lv >= 3;
  const twin = lv >= 7;
  const halo = lv >= 10;
  return `<svg class="ada" viewBox="0 0 120 140" role="img" aria-label="${label}" data-mood="${mood}" data-level="${lv}">
<ellipse class="ada__shadow" cx="60" cy="134" rx="26" ry="4.5"/>
<g class="ada__all">
${halo ? '<circle class="ada__halo" cx="60" cy="62" r="56"/>' : ''}
${twin ? '<ellipse class="ada__orbit ada__orbit--b" cx="60" cy="62" rx="54" ry="16" transform="rotate(28 60 62)"/><circle class="ada__node" cx="104" cy="85" r="4.5"/>' : ''}
<path class="ada__stem" d="M60 20 V8 M60 8 L48 2 M60 8 L72 2"/>
<circle class="ada__tip" cx="48" cy="2.5" r="3.5"/><circle class="ada__tip ada__tip--mid" cx="60" cy="7" r="4"/><circle class="ada__tip" cx="72" cy="2.5" r="3.5"/>
<circle class="ada__head" cx="60" cy="62" r="42"/>
<path class="ada__shine" d="M30 44 Q38 28 56 24"/>
<rect class="ada__visor" x="24" y="42" width="72" height="40" rx="20"/>
<g class="ada__face ada__face--happy"><circle cx="46" cy="60" r="6"/><circle cx="74" cy="60" r="6"/><path class="ada__line" d="M50 71 Q60 77 70 71"/></g>
<g class="ada__face ada__face--wink"><circle cx="46" cy="60" r="6"/><path class="ada__line" d="M68 61 Q74 55 80 61"/><path class="ada__line" d="M50 71 Q60 77 70 71"/></g>
<g class="ada__face ada__face--think"><rect x="40" y="57" width="13" height="5" rx="2.5"/><circle cx="74" cy="58" r="5.5"/><path class="ada__line" d="M52 73 L68 71"/></g>
<g class="ada__face ada__face--wow"><circle cx="46" cy="59" r="8"/><circle cx="74" cy="59" r="8"/><ellipse cx="60" cy="74" rx="4.5" ry="3.5"/></g>
<g class="ada__face ada__face--sad"><circle cx="46" cy="62" r="5.5"/><circle cx="74" cy="62" r="5.5"/><path class="ada__line" d="M38 53 L50 50 M82 53 L70 50"/><path class="ada__line" d="M51 75 Q60 70 69 75"/></g>
${orbit ? '<ellipse class="ada__orbit" cx="60" cy="62" rx="56" ry="14" transform="rotate(-14 60 62)"/><circle class="ada__node" cx="10" cy="72" r="4"/>' : ''}
<circle class="ada__core" cx="60" cy="112" r="${lv >= 5 ? 7 : 5}"/>
<path class="ada__base" d="M40 118 H80 L72 126 H48 Z"/>
</g>
</svg>`;
}

/** Figur eines Kurses als SVG-Text. */
export function guideSvg(guide: GuideId, mood: Mood = 'happy', level = 1, label = guide === 'ada' ? 'Ada' : 'Bit'): string {
  return guide === 'ada' ? adaSvg(mood, level, label) : bitSvg(mood, level, label);
}

/** Was sich an der Figur ab einer Stufe verändert (für den Stufenaufstieg). */
export const GUIDE_UPGRADES: Record<GuideId, Record<number, { de: string; en: string }>> = {
  bit: {
    3: { de: 'Bit bekommt Ohren – zum besseren Zuhören.', en: 'Bit gets ears – for better listening.' },
    5: { de: 'Bits Brustlicht leuchtet jetzt in Farbe.', en: 'Bit’s chest light now shines in colour.' },
    7: { de: 'Eine zweite Antenne für doppelt so viele Signale!', en: 'A second antenna for twice the signals!' },
    10: { de: 'Die Krone: Bit ist jetzt ein Meister-Roboter.', en: 'The crown: Bit is now a master robot.' },
  },
  ada: {
    3: { de: 'Ada bekommt eine Umlaufbahn.', en: 'Ada gets an orbit.' },
    5: { de: 'Adas Kern leuchtet heller.', en: 'Ada’s core glows brighter.' },
    7: { de: 'Eine zweite Umlaufbahn – Ada rechnet jetzt parallel.', en: 'A second orbit – Ada now computes in parallel.' },
    10: { de: 'Ein Lichtkranz: Ada ist ein Supercomputer.', en: 'A halo: Ada has become a supercomputer.' },
  },
};

/** Die neueste Veränderung zwischen zwei Stufen (oder null). */
export function guideUpgrade(guide: GuideId, before: number, after: number): { de: string; en: string } | null {
  let found: { de: string; en: string } | null = null;
  for (const [level, text] of Object.entries(GUIDE_UPGRADES[guide])) if (Number(level) > before && Number(level) <= after) found = text;
  return found;
}
