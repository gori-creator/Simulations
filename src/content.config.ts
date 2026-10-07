import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Lernmaterial zu jeder Simulation: src/content/simulations/<sprache>/<id>.md
 * (z. B. de/lineare-funktion.md). Fehlt die englische Fassung, wird die
 * deutsche mit Hinweis angezeigt.
 */
const simulationTexts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/simulations' }),
  schema: z.object({
    /** Optionale Meta-Beschreibung für Suchmaschinen. */
    description: z.string().optional(),
  }),
});

/** Informationsseiten (Für Lehrkräfte, Über, Impressum, Datenschutz). */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { simulationTexts, pages };
