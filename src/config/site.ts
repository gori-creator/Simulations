import type { Localized } from '../i18n/config';

/**
 * Zentrale Projekt-Einstellungen. Der Name der Website ist „Scitura“ (seit
 * 27.10.2026, in beiden Sprachen gleich); er wird nur hier gesetzt.
 */
export const SITE = {
  name: { de: 'Scitura', en: 'Scitura' } satisfies Localized,
  shortName: 'Scitura',
  /**
   * Hauptadresse. Nur ein Build für diese Adresse darf in Suchmaschinen
   * (Sitemap, robots.txt); Kopien (GitHub Pages, Vorschau) bekommen noindex.
   */
  url: 'https://scitura.de',
  /** Titel der Startseite (Suchergebnis, Browser-Tab): Name plus worum es geht. */
  homeTitle: {
    de: 'Scitura – Interaktive Simulationen für Mathe und Physik',
    en: 'Scitura – Interactive simulations for maths and physics',
  } satisfies Localized,
  description: {
    de: 'Scitura: kostenlose, interaktive Simulationen für Mathematik und Physik – Wissenschaft zum Ausprobieren, für den Unterricht und zum Lernen zu Hause. Ohne Anmeldung, ohne Werbung, ohne Tracking.',
    en: 'Scitura: free interactive simulations for mathematics and physics – science to try out, for the classroom and for learning at home. No sign-up, no ads, no tracking.',
  } satisfies Localized,
  repoUrl: 'https://github.com/gori-creator/Simulations',
  /**
   * Knopf „Öffentlich auf GitHub melden“ im Kontaktformular. Aus: Der Code ist
   * nicht Open Source (LICENSE), Rückmeldungen laufen nur per E-Mail.
   */
  publicIssues: false,
  /**
   * Empfangsadresse des Kontaktformulars (öffnet das E-Mail-Programm, siehe
   * src/components/ContactForm.astro); dieselbe wie im Impressum.
   */
  contactEmail: 'kontakt@scitura.de',
  /** Marineblau des Logos (Scitura-Logo 01, siehe docs/design/coin-reise-v13/LOGO-HERKUNFT.md). */
  themeColor: '#183365',
} as const;
