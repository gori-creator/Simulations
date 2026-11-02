import { cloneProgress, emptyProgress, sanitizeProgress, type Progress } from './progress';

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
    return this.memory ? cloneProgress(this.memory) : emptyProgress();
  }

  save(progress: Progress): void {
    this.memory = cloneProgress(progress);
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

/** Erzeugt die Ablage für einen Kurs. */
export type StoreFactory = (courseId: string) => ProgressStore;

let factory: StoreFactory = (courseId) => new LocalProgressStore(`kurs:${courseId}`);

/**
 * Andere Ablage einsetzen, z. B. später ein Konto auf einem Server. Eine
 * solche Umsetzung lädt beim Anmelden den Stand vom Server, führt ihn mit dem
 * lokalen Stand zusammen (`mergeProgress` in progress.ts) und speichert
 * beide. Karte und Lektionen merken davon nichts.
 */
export function setStoreFactory(next: StoreFactory): void {
  factory = next;
}

/** Ablage für einen Kurs. */
export function storeFor(courseId: string): ProgressStore {
  return factory(courseId);
}
