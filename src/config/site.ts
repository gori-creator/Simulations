import type { Localized } from '../i18n/config';

/**
 * Zentrale Projekt-Einstellungen. Der Name der Website ist „Scitura“ (seit
 * 27.10.2026, in beiden Sprachen gleich); er wird nur hier gesetzt.
 */
export const SITE = {
  name: { de: 'Scitura', en: 'Scitura' } satisfies Localized,
  shortName: 'Scitura',
  description: {
    de: 'Kostenlose, interaktive Simulationen für Mathematik und Physik – für den Unterricht und zum Lernen zu Hause. Ohne Anmeldung, ohne Werbung, ohne Tracking.',
    en: 'Free interactive simulations for mathematics and physics – for the classroom and for learning at home. No sign-up, no ads, no tracking.',
  } satisfies Localized,
  repoUrl: 'https://github.com/gori-creator/Simulations',
  /** Marineblau des Logos (Scitura-Logo 01, siehe docs/design/coin-reise-v13/LOGO-HERKUNFT.md). */
  themeColor: '#183365',
} as const;
