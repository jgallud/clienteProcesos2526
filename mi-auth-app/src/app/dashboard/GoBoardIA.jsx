import React from "react";

export default function GoBoardIA({ tablero, onClickCelda }) {
  const size = tablero.length;

  // Hoshi points 9x9
  const hoshiPoints = [
    [2, 2], [2, 6],
    [6, 2], [6, 6],
    [4, 4]
  ];

  return (
    <div
      className="relative rounded-lg mx-auto w-[360px] h-[360px]"
      style={{ backgroundColor: "#DEB887" }} // color madera clara
    >
      {/* Líneas horizontales */}
      {tablero.map((_, y) => (
        <div
          key={`h-${y}`}
          className="absolute left-0 right-0 h-0.5"
          style={{ top: `${(y + 0.5) * (100 / size)}%`, backgroundColor: "#8B5A2B" }}
        />
      ))}

      {/* Líneas verticales */}
      {tablero[0].map((_, x) => (
        <div
          key={`v-${x}`}
          className="absolute top-0 bottom-0 w-0.5"
          style={{ left: `${(x + 0.5) * (100 / size)}%`, backgroundColor: "#8B5A2B" }}
        />
      ))}

      {/* Casillas clicables y piedras */}
      {tablero.map((fila, y) =>
        fila.map((celda, x) => {
          const color = celda === 1 ? "black" : celda === 2 ? "white" : null;

          return (
            <div
              key={`${y}-${x}`}
              onClick={() => onClickCelda(y, x)}
              className="absolute w-10 h-10 cursor-pointer"
              style={{
                top: `${(y + 0.5) * (100 / size)}%`,
                left: `${(x + 0.5) * (100 / size)}%`,
                transform: "translate(-50%, -50%)",
                zIndex: 10,
              }}
            >
              {color && (
                <div
                  className="w-10 h-10 rounded-full shadow-md"
                  style={{
                    backgroundColor: color,
                    border: color === "white" ? "1px solid #333" : "none",
                  }}
                />
              )}
            </div>
          );
        })
      )}

      {/* Hoshi points */}
      {hoshiPoints.map(([y, x], idx) => (
        <div
          key={`hoshi-${idx}`}
          className="absolute w-2 h-2 bg-brown-700 rounded-full"
          style={{
            top: `${(y + 0.5) * (100 / size)}%`,
            left: `${(x + 0.5) * (100 / size)}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 5
          }}
        />
      ))}
    </div>
  );
}
