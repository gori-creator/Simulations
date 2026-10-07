/**
 * Rechenlogik „Ziegenproblem“ (verallgemeinert auf n Türen): Nach der ersten
 * Wahl öffnet die Moderation alle Türen außer der gewählten und einer weiteren –
 * und dabei nie die Tür mit dem Auto.
 */

/** Welche Tür bleibt neben der gewählten geschlossen? */
export function remainingDoor(doors: number, car: number, chosen: number, random: () => number): number {
  if (chosen !== car) return car;
  const others = Array.from({ length: doors }, (_, i) => i).filter((i) => i !== chosen);
  return others[Math.floor(random() * others.length)]!;
}

/** Türen, die die Moderation öffnet (alle außer gewählter und verbleibender). */
export function openedDoors(doors: number, chosen: number, remaining: number): number[] {
  return Array.from({ length: doors }, (_, i) => i).filter((i) => i !== chosen && i !== remaining);
}

/** Ein komplettes Spiel: Gewinnt „Bleiben“ bzw. „Wechseln“? */
export function playRound(doors: number, random: () => number): { stayWins: boolean; switchWins: boolean } {
  const car = Math.floor(random() * doors);
  const chosen = Math.floor(random() * doors);
  const remaining = remainingDoor(doors, car, chosen, random);
  return { stayWins: chosen === car, switchWins: remaining === car };
}

/** Theoretische Gewinnwahrscheinlichkeiten. */
export function winProbabilities(doors: number): { stay: number; switch: number } {
  return { stay: 1 / doors, switch: (doors - 1) / doors };
}
