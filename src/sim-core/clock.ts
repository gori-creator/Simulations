/**
 * Uhr für animierte Simulationen. Der Host ruft bei laufender Uhr in jedem
 * Frame `tick(dt)` der Simulation auf; `dt` ist in Sekunden und bereits mit
 * `speed` (Zeitlupe/Zeitraffer) multipliziert.
 */
export class Clock {
  /** Vergangene Simulationszeit in Sekunden. */
  time = 0;
  /** Zeitfaktor: 1 = Echtzeit, 0,25 = Zeitlupe. */
  speed = 1;
  private running = false;
  private listeners = new Set<(playing: boolean) => void>();

  get playing(): boolean {
    return this.running;
  }

  play(): void {
    this.setRunning(true);
  }

  pause(): void {
    this.setRunning(false);
  }

  toggle(): void {
    this.setRunning(!this.running);
  }

  reset(): void {
    this.time = 0;
  }

  /** Wird bei Start/Stopp benachrichtigt. Gibt eine Abmeldefunktion zurück. */
  onChange(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setRunning(value: boolean): void {
    if (this.running === value) return;
    this.running = value;
    for (const listener of this.listeners) listener(value);
  }
}

/**
 * Feste Zeitschritte für physikalische Simulationen: Unabhängig von der
 * Bildrate wird immer mit derselben Schrittweite `h` gerechnet.
 */
export class FixedStepper {
  private accumulator = 0;

  constructor(readonly h: number) {}

  run(dt: number, step: (h: number) => void, maxSteps = 1000): void {
    this.accumulator += dt;
    let steps = 0;
    while (this.accumulator >= this.h && steps < maxSteps) {
      step(this.h);
      this.accumulator -= this.h;
      steps++;
    }
    if (steps === maxSteps) this.accumulator = 0;
  }

  reset(): void {
    this.accumulator = 0;
  }
}
