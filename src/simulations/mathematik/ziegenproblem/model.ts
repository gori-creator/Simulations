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

/**
 * „=“ für Prozentwerte, die beim Runden auf `decimals` Nachkommastellen exakt
 * bleiben (1/4 = 25 %), sonst „≈“ (1/3 ≈ 33,3 %).
 */
export function relationSign(probability: number, decimals = 1): '=' | '≈' {
  const percent = probability * 100;
  const factor = 10 ** decimals;
  return Math.abs(Math.round(percent * factor) / factor - percent) < 1e-9 ? '=' : '≈';
}

/**
 * Variante „Die Moderation weiß nicht, wo das Auto steht“ (Aufgabe 4 im
 * Lernmaterial): Sie öffnet zufällig alle Türen außer der gewählten und einer
 * weiteren. Zeigt sie dabei das Auto, ist das Spiel ungültig (`valid: false`).
 */
export function playRoundUninformed(
  doors: number,
  random: () => number,
): { valid: boolean; stayWins: boolean; switchWins: boolean } {
  const car = Math.floor(random() * doors);
  const chosen = Math.floor(random() * doors);
  const others = Array.from({ length: doors }, (_, i) => i).filter((i) => i !== chosen);
  const remaining = others[Math.floor(random() * others.length)]!;
  const valid = openedDoors(doors, chosen, remaining).every((d) => d !== car);
  return { valid, stayWins: chosen === car, switchWins: remaining === car };
}
