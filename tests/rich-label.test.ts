import { describe, expect, it } from 'vitest';
import { escapeHtml, plainSubText, setSubLabel, subLabelHtml } from '../src/sim-core/rich-label';

describe('Beschriftungen der Regler mit tiefgestelltem Index', () => {
  it('lässt Texte ohne „_“ unverändert', () => {
    expect(subLabelHtml('Neigungswinkel α')).toBeNull();
    expect(subLabelHtml('Masse m')).toBeNull();
    // nur ein echter Unterstrich bzw. kein gültiger Index → kein HTML nötig
    expect(subLabelHtml('datei\\_1')).toBeNull();
    expect(subLabelHtml('x_ und _')).toBeNull();
  });

  it('setzt den Index als <sub> und liest ihn sinnvoll vor', () => {
    expect(subLabelHtml('Zugkraft F_Z (hangaufwärts)')).toBe(
      '<span aria-hidden="true">Zugkraft F<sub>Z</sub> (hangaufwärts)</span><span class="visually-hidden">Zugkraft F Z (hangaufwärts)</span>',
    );
    expect(subLabelHtml('Haftreibungszahl μ_H')).toBe('<span aria-hidden="true">Haftreibungszahl μ<sub>H</sub></span><span class="visually-hidden">Haftreibungszahl μ H</span>');
    expect(subLabelHtml('F_{G,1}')).toContain('F<sub>G,1</sub>');
    expect(plainSubText('f_k(x) = x³')).toBe('f k (x) = x³');
    expect(plainSubText('v_Q = c')).toBe('v Q = c');
  });

  it('maskiert HTML sicher', () => {
    expect(escapeHtml(`<b>&"'`)).toBe('&lt;b&gt;&amp;&quot;&#39;');
    const html = subLabelHtml('<img src=x onerror=alert(1)> F_Z <i>')!;
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<i>');
    expect(subLabelHtml('x_{<script>}')).toContain('<sub>&lt;script&gt;</sub>');
  });

  it('setzt textContent bzw. innerHTML am Element', () => {
    const el = { textContent: '', innerHTML: '' } as unknown as HTMLElement;
    setSubLabel(el, 'Masse m');
    expect(el.textContent).toBe('Masse m');
    expect(el.innerHTML).toBe('');
    setSubLabel(el, 'a\\_b');
    expect(el.textContent).toBe('a_b');
    setSubLabel(el, 'F_Z');
    expect(el.innerHTML).toContain('F<sub>Z</sub>');
  });
});
