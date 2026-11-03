/**
 * Gedämpftes Nachführen eines Werts (kritisch gedämpfte Feder, wie
 * „SmoothDamp“ in Spiele-Engines): Der Wert läuft weich an, gleitet zum Ziel
 * und bremst ohne Überschwingen ab. Große Sprünge des Ziels (ein Ruck am
 * Mausrad) werden so zu einer ruhigen Bewegung; `maxSpeed` begrenzt das Tempo.
 */
export interface Follower {
  value: number;
  velocity: number;
}

export function smoothDamp(state: Follower, target: number, smoothTime: number, maxSpeed: number, dt: number): void {
  if (dt <= 0) return;
  const omega = 2 / Math.max(smoothTime, 1e-4);
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const maxChange = maxSpeed * smoothTime;
  const change = Math.max(-maxChange, Math.min(maxChange, state.value - target));
  const goal = state.value - change;
  const temp = (state.velocity + omega * change) * dt;
  let velocity = (state.velocity - omega * temp) * decay;
  let value = goal + (change + temp) * decay;
  // Nicht über das Ziel hinausschießen
  if (target - state.value > 0 === value > target) {
    value = target;
    velocity = (value - target) / dt;
  }
  state.value = value;
  state.velocity = velocity;
}
