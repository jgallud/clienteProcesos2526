// src/game/ia.js
import { simularJugada } from "./goUtils";

export function mejorJugadaIA(tablero, size = 9) {
  let mejor = null;
  let mejorScore = -Infinity;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sim = simularJugada(tablero, y, x, 2);
      if (!sim.valida) continue;

      const centro = Math.abs(y - 4) + Math.abs(x - 4);

      const score =
        sim.capturas * 100 +
        sim.libertades * 2 -
        centro * 1;

      if (score > mejorScore) {
        mejorScore = score;
        mejor = [y, x];
      }
    }
  }

  return mejor;
}
