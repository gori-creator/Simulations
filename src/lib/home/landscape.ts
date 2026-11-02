/**
 * Startseite: Tiefenwirkung der Landschaft im Einstieg (HomeHero.astro,
 * .hero-land). Setzt zwei CSS-Variablen, mit denen Wolken, hintere und vordere
 * Felsen unterschiedlich weit verschoben werden (Parallaxe):
 *  - `--land-x`: Mausposition waagerecht, −1 … 1 (weich nachgezogen),
 *  - `--land-s`: Scrollfortschritt durch den Einstieg, 0 … 1.
 * Ruht bei reduzierter Bewegung, bei pausierter Bewegung (Knopf in der
 * Kopfleiste) und solange der Einstieg nicht zu sehen ist.
 *
 * Außerdem `--sculpt-x`: waagerechte Mitte der Skulptur im Einstieg (px). Die
 * Felsen werden so verschoben, dass ihr Tal genau darunter liegt, auf jedem
 * Bildschirm (die Skulptur sitzt je nach Breite an einer anderen Stelle).
 */
export function initLandscape(hero: HTMLElement, land: HTMLElement): () => void {
  const root = document.documentElement;
  let targetX = 0;
  let x = 0;
  let frame = 0;
  let visible = true;

  const paused = () => root.classList.contains('motion-paused');

  function tick(): void {
    x += (targetX - x) * 0.06;
    land.style.setProperty('--land-x', x.toFixed(3));
    frame = Math.abs(targetX - x) > 0.002 ? requestAnimationFrame(tick) : 0;
  }

  function onPointer(event: PointerEvent): void {
    if (!visible || paused() || event.pointerType === 'touch') return;
    targetX = (event.clientX / window.innerWidth) * 2 - 1;
    if (!frame) frame = requestAnimationFrame(tick);
  }

  function onScroll(): void {
    if (!visible || paused()) return;
    const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(1, hero.offsetHeight)));
    land.style.setProperty('--land-s', progress.toFixed(3));
  }

  const sculpture = hero.querySelector<HTMLElement>('[data-sculpture]');
  /** Waagerechte Mitte der Skulptur relativ zum Einstieg (der Kasten selbst bewegt sich nicht, nur sein Inhalt). */
  function placeValley(): void {
    if (!sculpture) return;
    const s = sculpture.getBoundingClientRect();
    const h = hero.getBoundingClientRect();
    land.style.setProperty('--sculpt-x', `${Math.round(s.left + s.width / 2 - h.left)}px`);
  }
  const resize = new ResizeObserver(placeValley);
  resize.observe(hero);
  if (sculpture) resize.observe(sculpture);
  placeValley();

  const observer = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
  });
  observer.observe(hero);
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    resize.disconnect();
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('scroll', onScroll);
  };
}
