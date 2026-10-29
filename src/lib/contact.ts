/**
 * Kontaktformular: Nachricht zusammensetzen, prüfen und als E-Mail-Link
 * (mailto:) bzw. GitHub-Meldung ausgeben.
 *
 * Die Website ist statisch und lädt nichts von fremden Servern. Das Formular
 * schickt deshalb selbst nichts ab: Es öffnet das E-Mail-Programm der
 * Besucherin mit dem fertigen Text. Diese Datei enthält nur reine Funktionen
 * (ohne DOM), damit sie sich testen lassen (tests/contact.test.ts).
 */

export const CONTACT_TYPES = ['feedback', 'question', 'bug', 'idea', 'content', 'school', 'other'] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const CONTACT_ROLES = ['none', 'teacher', 'student', 'parent', 'university', 'other'] as const;
export type ContactRole = (typeof CONTACT_ROLES)[number];

/** Anliegen, die sich auch öffentlich auf GitHub melden lassen. */
export const PUBLIC_TYPES: readonly ContactType[] = ['bug', 'idea', 'content'];

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 4000;
export const SUBJECT_MAX = 120;
/** Ab dieser Länge des mailto-Links schneiden manche E-Mail-Programme ab. */
export const MAILTO_SAFE_LENGTH = 1800;

export interface ContactDraft {
  type: ContactType;
  /** ID der Simulation oder '' (Website allgemein). */
  sim: string;
  role: ContactRole;
  /** 1 … 5, 0 = keine Bewertung. */
  rating: number;
  subject: string;
  message: string;
  /** Nur bei Fehlermeldungen. */
  steps: string;
  expected: string;
  actual: string;
  /** Technische Angaben anhängen. */
  tech: boolean;
  name: string;
  email: string;
  reply: boolean;
}

export function emptyDraft(): ContactDraft {
  return { type: 'feedback', sim: '', role: 'none', rating: 0, subject: '', message: '', steps: '', expected: '', actual: '', tech: false, name: '', email: '', reply: false };
}

/** Gespeicherten oder per Link übergebenen Entwurf vorsichtig übernehmen (unbekannte Werte fallen weg). */
export function sanitizeDraft(raw: unknown): ContactDraft {
  const d = emptyDraft();
  if (!raw || typeof raw !== 'object') return d;
  const r = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '');
  if (CONTACT_TYPES.includes(r.type as ContactType)) d.type = r.type as ContactType;
  if (CONTACT_ROLES.includes(r.role as ContactRole)) d.role = r.role as ContactRole;
  if (typeof r.sim === 'string' && /^[a-z0-9-]{0,60}$/.test(r.sim)) d.sim = r.sim;
  if (typeof r.rating === 'number' && Number.isInteger(r.rating) && r.rating >= 0 && r.rating <= 5) d.rating = r.rating;
  d.subject = str(r.subject, SUBJECT_MAX);
  d.message = str(r.message, MESSAGE_MAX);
  d.steps = str(r.steps, MESSAGE_MAX);
  d.expected = str(r.expected, MESSAGE_MAX);
  d.actual = str(r.actual, MESSAGE_MAX);
  d.name = str(r.name, 120);
  d.email = str(r.email, 200);
  d.tech = r.tech === true;
  d.reply = r.reply === true;
  return d;
}

export type ContactError = 'message' | 'email' | 'emailNeeded';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Inhalt, der für die Mindestlänge zählt (bei Fehlermeldungen auch die Zusatzfelder). */
function content(d: ContactDraft): string {
  const parts = [d.message];
  if (d.type === 'bug') parts.push(d.steps, d.expected, d.actual);
  return parts.map((p) => p.trim()).join(' ').trim();
}

/** Fehler je Feld; leer = alles in Ordnung. */
export function validateDraft(d: ContactDraft): Partial<Record<ContactError, true>> {
  const errors: Partial<Record<ContactError, true>> = {};
  if (content(d).length < MESSAGE_MIN) errors.message = true;
  const email = d.email.trim();
  if (email && !EMAIL.test(email)) errors.email = true;
  else if (d.reply && !email) errors.emailNeeded = true;
  return errors;
}

/** Texte für die Nachricht (aus src/i18n/ui.ts, in der Sprache der Seite). */
export interface MessageLabels {
  types: Record<ContactType, string>;
  roles: Record<ContactRole, string>;
  general: string;
  mailType: string;
  mailSim: string;
  mailRole: string;
  mailRating: string;
  /** mit Platzhalter {n} */
  ratingValue: string;
  mailTech: string;
  mailPage: string;
  mailFrom: string;
  mailReply: string;
  mailNoReply: string;
  bugSteps: string;
  bugExpected: string;
  bugActual: string;
}

export interface MessageContext {
  labels: MessageLabels;
  /** Titel und Adresse der gewählten Simulation. */
  simTitle?: string;
  simUrl?: string;
  /** Seite, von der aus das Formular geöffnet wurde. */
  page?: string;
  /** Technische Angaben (Browser usw.), nur wenn angehängt. */
  techInfo?: string;
  /** Für die öffentliche Meldung: ohne Name und E-Mail. */
  public?: boolean;
}

const RULE = '————————————————';

/** Betreff und Text der Nachricht. */
export function buildMessage(d: ContactDraft, ctx: MessageContext): { subject: string; body: string } {
  const L = ctx.labels;
  const typeLabel = L.types[d.type];
  const what = d.sim ? (ctx.simTitle ?? d.sim) : '';
  const fallback = d.message.trim().split(/\s+/).slice(0, 8).join(' ');
  const short = d.subject.trim() || (fallback.length > 60 ? `${fallback.slice(0, 57)}…` : fallback);
  const subject = ['[Scitura]', `${typeLabel}${what ? ` · ${what}` : ''}${short ? `: ${short}` : ''}`].join(' ');

  const head: string[] = [`${L.mailType}: ${typeLabel}`];
  head.push(`${L.mailSim}: ${what ? `${what}${ctx.simUrl ? ` (${ctx.simUrl})` : ''}` : L.general}`);
  if (d.role !== 'none') head.push(`${L.mailRole}: ${L.roles[d.role]}`);
  if (d.rating > 0) head.push(`${L.mailRating}: ${L.ratingValue.replace('{n}', String(d.rating))}`);

  const text: string[] = [];
  if (d.message.trim()) text.push(d.message.trim());
  if (d.type === 'bug') {
    const field = (label: string, value: string) => {
      if (value.trim()) text.push(`${label}\n${value.trim()}`);
    };
    field(L.bugSteps, d.steps);
    field(L.bugExpected, d.expected);
    field(L.bugActual, d.actual);
  }

  const tail: string[] = [];
  if (ctx.page && ctx.page !== ctx.simUrl) tail.push(`${L.mailPage}: ${ctx.page}`);
  if (d.tech && ctx.techInfo) tail.push(`${L.mailTech}:\n${ctx.techInfo}`);
  if (!ctx.public) {
    const name = d.name.trim();
    const email = d.email.trim();
    if (name) tail.push(`${L.mailFrom}: ${name}`);
    tail.push(d.reply && email ? `${L.mailReply}: ${email}` : L.mailNoReply);
  }

  const body = [head.join('\n'), RULE, text.join('\n\n'), ...(tail.length ? [RULE, tail.join('\n')] : [])].join('\n\n');
  return { subject, body };
}

/** mailto-Link (Zeilenenden nach RFC 6068 als CRLF). */
export function mailtoUrl(to: string, subject: string, body: string): string {
  const enc = (s: string) => encodeURIComponent(s.replace(/\r?\n/g, '\r\n'));
  return `mailto:${to}?subject=${enc(subject)}&body=${enc(body)}`;
}

/** Vorausgefüllte öffentliche Meldung auf GitHub. */
export function githubIssueUrl(repoUrl: string, subject: string, body: string): string {
  const title = subject.replace(/^\[Scitura\]\s*/, '');
  return `${repoUrl.replace(/\/$/, '')}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}
