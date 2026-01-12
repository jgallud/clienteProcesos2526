
"use client";
import React from "react";

export default function GoBoard({ tablero, onClickCelda }) {
  return (
    <div className="inline-grid grid-cols-9 gap-0 border-4 border-brown-700 bg-yellow-300 rounded-lg">
      {tablero.map((fila, i) =>
        fila.map((celda, j) => {
          // Convertimos 1 → negro, 2 → blanco, null/0 → vacío
          let color = "transparent";
          if (celda === 1) color = "black";
          if (celda === 2) color = "white";

          return (
            <div
              key={`${i}-${j}`}
              onClick={() => onClickCelda(j, i)}
              className="w-12 h-12 border border-brown-700 flex items-center justify-center cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full`}
                style={{
                  backgroundColor: color,
                  border: color === "white" ? "1px solid #333" : "none",
                }}
              ></div>
            </div>
          );
        })
      )}
    </div>
  );
}
