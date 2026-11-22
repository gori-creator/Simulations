# Sicherheit

Scitura ist eine statische Website ohne Konten und ohne Server-Datenbank. Trotzdem nehmen wir Sicherheit ernst, besonders weil Simulationen auch von außen beigetragen werden.

## Lücke melden

Bitte **nicht** als öffentliches Issue, sondern vertraulich:

- über GitHub: „Security“ → „Report a vulnerability“ (private Meldung), oder
- per E-Mail an **kontakt@scitura.de** mit dem Betreff „Sicherheit“.

Beschreib kurz, was passiert und wie man es nachstellt. Wir melden uns innerhalb weniger Tage und beheben bestätigte Lücken so schnell wie möglich.

## Was wir schon tun

- Strenge Content-Security-Policy (keine Inline-Skripte, keine fremden Server).
- Simulationen dürfen nur rechnen und zeichnen; `tests/simulations-sicherheit.test.ts` verbietet Netzwerk, Speicherzugriff, `eval`, `innerHTML` und Importe außerhalb des Kerns.
- Jeder Pull Request wird von der Projektleitung geprüft, bevor er online geht.

---

**English:** Please report vulnerabilities privately via GitHub's “Report a vulnerability” or to kontakt@scitura.de (subject “Security”), not as a public issue.
