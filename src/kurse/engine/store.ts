import { emptyProgress, sanitizeProgress, type Progress } from './progress';

/**
 * Ablage des Spielstands. Heute im Browser (Local Storage), ohne Konto.
 * Konten lassen sich später als weitere Umsetzung dieser Schnittstelle
 * ergänzen (z. B. Server mit Klassencode); Karte und Lektionen bleiben gleich.
 */
export interface ProgressStore {
  load(): Progress;
  save(progress: Progress): void;
  clear(): void;
}

/** Spielstand im Local Storage; ohne Speicher (privates Fenster) nur im Arbeitsspeicher. */
export class LocalProgressStore implements ProgressStore {
  private memory: Progress | null = null;
  constructor(private readonly key: string) {}

  load(): Progress {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return sanitizeProgress(JSON.parse(raw));
    } catch {
      // Speicher gesperrt oder Daten kaputt: neu beginnen
    }
    return this.memory ? structuredClone(this.memory) : emptyProgress();
  }

  save(progress: Progress): void {
    this.memory = structuredClone(progress);
    try {
      localStorage.setItem(this.key, JSON.stringify(progress));
    } catch {
      // Speicher voll oder gesperrt: nur für diese Sitzung
    }
  }

  clear(): void {
    this.memory = null;
    try {
      localStorage.removeItem(this.key);
    } catch {
      // nichts zu tun
    }
  }
}

/** Ablage für einen Kurs. */
export function storeFor(courseId: string): ProgressStore {
  return new LocalProgressStore(`kurs:${courseId}`);
}
