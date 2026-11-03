import { describe, expect, it } from 'vitest';
import { pageLinks, sitemapXml } from '../tooling/sitemap.mjs';

const page = (extra: string) =>
  `<html><head>${extra}<link rel="canonical" href="https://scitura.de/de/"><link rel="alternate" hreflang="de" href="https://scitura.de/de/"><link rel="alternate" hreflang="en" href="https://scitura.de/en/"></head></html>`;

describe('Sitemap', () => {
  it('liest kanonische Adresse und Sprachfassungen', () => {
    expect(pageLinks(page(''))).toEqual({
      canonical: 'https://scitura.de/de/',
      alternates: [
        { lang: 'de', href: 'https://scitura.de/de/' },
        { lang: 'en', href: 'https://scitura.de/en/' },
      ],
    });
  });

  it('lässt Seiten mit noindex oder ohne canonical weg', () => {
    expect(pageLinks(page('<meta name="robots" content="noindex">'))).toBeNull();
    expect(pageLinks('<html><head></head></html>')).toBeNull();
  });

  it('schreibt gültiges XML mit maskierten Adressen', () => {
    const out = sitemapXml([{ canonical: 'https://scitura.de/de/?a=1&b=2', alternates: [] }]);
    expect(out).toContain('<loc>https://scitura.de/de/?a=1&amp;b=2</loc>');
    expect(out.startsWith('<?xml')).toBe(true);
  });
});
