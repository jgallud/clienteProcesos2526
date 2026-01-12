// src/game/goUtils.js

export function vecinos(y, x, size = 9) {
  return [
    [y - 1, x],
    [y + 1, x],
    [y, x - 1],
    [y, x + 1],
  ].filter(([ny, nx]) =>
    ny >= 0 && ny < size && nx >= 0 && nx < size
  );
}

export function obtenerGrupo(tablero, y, x, visitado = new Set()) {
  const color = tablero[y][x];
  const stack = [[y, x]];
  const grupo = [];

  while (stack.length) {
    const [cy, cx] = stack.pop();
    const key = `${cy},${cx}`;
    if (visitado.has(key)) continue;
    visitado.add(key);

    grupo.push([cy, cx]);

    vecinos(cy, cx).forEach(([ny, nx]) => {
      if (tablero[ny][nx] === color) {
        stack.push([ny, nx]);
      }
    });
  }

  return grupo;
}

export function contarLibertades(tablero, grupo) {
  const libs = new Set();

  grupo.forEach(([y, x]) => {
    vecinos(y, x).forEach(([ny, nx]) => {
      if (tablero[ny][nx] === 0) {
        libs.add(`${ny},${nx}`);
      }
    });
  });

  return libs.size;
}

export function eliminarGrupo(tablero, grupo) {
  grupo.forEach(([y, x]) => {
    tablero[y][x] = 0;
  });
}

export function simularJugada(tablero, y, x, color) {
  if (tablero[y][x] !== 0) return { valida: false };

  const copia = tablero.map(f => [...f]);
  copia[y][x] = color;

  const rival = color === 1 ? 2 : 1;
  let capturas = 0;

  vecinos(y, x).forEach(([ny, nx]) => {
    if (copia[ny][nx] === rival) {
      const grupo = obtenerGrupo(copia, ny, nx);
      const libs = contarLibertades(copia, grupo);

      if (libs === 0) {
        capturas += grupo.length;
        eliminarGrupo(copia, grupo);
      }
    }
  });

  const miGrupo = obtenerGrupo(copia, y, x);
  const misLibs = contarLibertades(copia, miGrupo);

  if (misLibs === 0 && capturas === 0) {
    return { valida: false };
  }

  return {
    valida: true,
    tablero: copia,
    capturas,
    libertades: misLibs,
  };
}
