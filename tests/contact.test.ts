import { describe, expect, it } from 'vitest';
import { buildMessage, CONTACT_ROLES, CONTACT_TYPES, emptyDraft, githubIssueUrl, mailtoUrl, sanitizeDraft, validateDraft, type MessageLabels } from '../src/lib/contact';
import { ui } from '../src/i18n/ui';

const labels: MessageLabels = {
  types: Object.fromEntries(CONTACT_TYPES.map((k) => [k, k.toUpperCase()])) as MessageLabels['types'],
  roles: Object.fromEntries(CONTACT_ROLES.map((k) => [k, `R-${k}`])) as MessageLabels['roles'],
  general: 'Allgemein',
  mailType: 'Anliegen',
  mailSim: 'Betrifft',
  mailRole: 'Absender',
  mailRating: 'Bewertung',
  ratingValue: '{n} von 5',
  mailTech: 'Technik',
  mailPage: 'Seite',
  mailFrom: 'Von',
  mailReply: 'Antwort an',
  mailNoReply: 'Keine Antwort nötig',
  bugSteps: 'Schritte',
  bugExpected: 'Erwartet',
  bugActual: 'Passiert',
};

describe('Kontaktformular', () => {
  it('verlangt eine Nachricht mit Mindestlänge', () => {
    expect(validateDraft(emptyDraft()).message).toBe(true);
    expect(validateDraft({ ...emptyDraft(), message: 'Tolle Seite, danke!' })).toEqual({});
  });

  it('zählt bei Fehlermeldungen auch die Zusatzfelder', () => {
    const d = { ...emptyDraft(), type: 'bug' as const, actual: 'Das Pendel bleibt hängen.' };
    expect(validateDraft(d)).toEqual({});
  });

  it('prüft die E-Mail-Adresse und verlangt sie für eine Antwort', () => {
    const d = { ...emptyDraft(), message: 'Eine Frage zum Pendel.' };
    expect(validateDraft({ ...d, email: 'kein-at' }).email).toBe(true);
    expect(validateDraft({ ...d, reply: true }).emailNeeded).toBe(true);
    expect(validateDraft({ ...d, reply: true, email: 'a@schule.de' })).toEqual({});
  });

  it('setzt Betreff und Text zusammen', () => {
    const d = { ...emptyDraft(), type: 'bug' as const, sim: 'fadenpendel', role: 'teacher' as const, rating: 4, message: 'Siehe unten.', steps: 'Start gedrückt', name: 'Frau K.', email: 'k@schule.de', reply: true, tech: true };
    const m = buildMessage(d, { labels, simTitle: 'Fadenpendel', simUrl: 'https://x/fadenpendel/', techInfo: 'Browser: Test' });
    expect(m.subject).toBe('[Scitura] BUG · Fadenpendel: Siehe unten.');
    expect(m.body).toContain('Betrifft: Fadenpendel (https://x/fadenpendel/)');
    expect(m.body).toContain('Absender: R-teacher');
    expect(m.body).toContain('Bewertung: 4 von 5');
    expect(m.body).toContain('Schritte\nStart gedrückt');
    expect(m.body).toContain('Technik:\nBrowser: Test');
    expect(m.body).toContain('Antwort an: k@schule.de');
  });

  it('lässt Name und E-Mail in der öffentlichen Meldung weg', () => {
    const d = { ...emptyDraft(), type: 'idea' as const, message: 'Bitte eine Simulation zum Hebel.', name: 'Max', email: 'max@example.org', reply: true };
    const m = buildMessage(d, { labels, public: true });
    expect(m.body).not.toContain('Max');
    expect(m.body).not.toContain('max@example.org');
    const url = githubIssueUrl('https://github.com/o/r/', m.subject, m.body);
    expect(url.startsWith('https://github.com/o/r/issues/new?title=IDEA')).toBe(true);
  });

  it('kodiert den mailto-Link mit CRLF', () => {
    const url = mailtoUrl('a@b.de', 'Hallo & Tschüss', 'Zeile 1\nZeile 2');
    expect(url).toBe('mailto:a@b.de?subject=Hallo%20%26%20Tsch%C3%BCss&body=Zeile%201%0D%0AZeile%202');
  });

  it('übernimmt nur gültige Werte aus Entwurf oder Link', () => {
    const d = sanitizeDraft({ type: 'hack', role: 'teacher', sim: '../x', rating: 9, message: 42, tech: 'ja' });
    expect(d.type).toBe('feedback');
    expect(d.role).toBe('teacher');
    expect(d.sim).toBe('');
    expect(d.rating).toBe(0);
    expect(d.message).toBe('');
    expect(d.tech).toBe(false);
  });

  it('hat für jedes Anliegen und jede Rolle Texte in beiden Sprachen', () => {
    for (const lang of ['de', 'en'] as const) {
      const dict = ui[lang] as Record<string, string>;
      for (const k of CONTACT_TYPES) {
        expect(dict[`contact.type.${k}`], `${lang} contact.type.${k}`).toBeTruthy();
        expect(dict[`contact.hint.${k}`], `${lang} contact.hint.${k}`).toBeTruthy();
      }
      for (const k of CONTACT_ROLES) expect(dict[`contact.role.${k}`], `${lang} contact.role.${k}`).toBeTruthy();
    }
  });
});
