import type { Localized } from '../i18n/config';

/**
 * Zentrale Projekt-Einstellungen. Der Name ist ein Arbeitstitel und kann hier
 * an einer einzigen Stelle geändert werden.
 */
export const SITE = {
  name: { de: 'MINT-Simulationen', en: 'STEM Simulations' } satisfies Localized,
  shortName: 'MINT-Sim',
  description: {
    de: 'Kostenlose, interaktive Simulationen für Mathematik und Physik – für den Unterricht und zum Lernen zu Hause. Ohne Anmeldung, ohne Werbung, ohne Tracking.',
    en: 'Free interactive simulations for mathematics and physics – for the classroom and for learning at home. No sign-up, no ads, no tracking.',
  } satisfies Localized,
  repoUrl: 'https://github.com/gori-creator/Simulations',
  themeColor: '#2b5fd9',
} as const;
