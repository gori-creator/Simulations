import { describe, expect, it } from 'vitest';
import { escapeHtml, plainSubText, setSubLabel, setSubReadout, subLabelHtml } from '../src/sim-core/rich-label';
import { NBSP } from '../src/sim-core/format';

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

describe('Ergebnisse aus reinem Text mit Index', () => {
  const element = () => ({ textContent: '', innerHTML: '' }) as unknown as HTMLElement;

  it('setzt „_“ als Index mit Lesefassung und bindet Zahl und Einheit', () => {
    const el = element();
    setSubReadout(el, 'F_max = 3,5 N');
    expect(el.innerHTML).toBe(
      `<span aria-hidden="true">F<sub>max</sub> = 3,5${NBSP}N</span><span class="visually-hidden">F max = 3,5${NBSP}N</span>`,
    );
    expect(el.textContent).toBe('');
  });

  it('lässt Text ohne Index als textContent (mit geschütztem Leerzeichen)', () => {
    const el = element();
    setSubReadout(el, 't = 2,5 s · v = 3 m/s');
    expect(el.textContent).toBe(`t = 2,5${NBSP}s · v = 3${NBSP}m/s`);
    expect(el.innerHTML).toBe('');
    setSubReadout(el, 'x_ bleibt, a\\_b ist ein Unterstrich');
    expect(el.textContent).toBe('x_ bleibt, a_b ist ein Unterstrich');
  });

  it('maskiert HTML im Ergebnistext', () => {
    const el = element();
    setSubReadout(el, '<img src=x onerror=alert(1)> E_kin = 2 J');
    expect(el.innerHTML).not.toContain('<img');
    expect(el.innerHTML).toContain('&lt;img');
    expect(el.innerHTML).toContain(`E<sub>kin</sub> = 2${NBSP}J`);
  });

  it('wandelt die Ergebnisse der Simulationen wie gewünscht um', () => {
    const el = element();
    setSubReadout(el, 'P_A(B) = 10/14 ≈ 71,4 % · P_B(A) = 10/19 ≈ 52,6 %');
    expect(el.innerHTML).toContain('P<sub>A</sub>(B)');
    expect(el.innerHTML).toContain('P<sub>B</sub>(A)');
    expect(el.innerHTML).toContain('P A (B) = 10/14');
  });
});
