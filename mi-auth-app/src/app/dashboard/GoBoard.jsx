"use client";
import React from "react";

export default function GoBoard({ tablero, onClickCelda }) {
  const size = tablero.length;

  return (
    <div
      className="relative inline-grid border-4 border-black bg-yellow-300 rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${size}, 48px)`,
        gridTemplateRows: `repeat(${size}, 48px)`,
      }}
    >
      {tablero.map((fila, y) =>
        fila.map((celda, x) => {
          const isBlack = celda === 1;
          const isWhite = celda === 2;

          return (
            <div
              key={`${x}-${y}`}
              onClick={() => onClickCelda(x, y)}
              className="relative w-12 h-12 cursor-pointer"
            >
              {/* Línea horizontal */}
              {y < size - 1 && (
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-black" />
              )}

              {/* Línea vertical */}
              {x < size - 1 && (
                <div className="absolute left-1/2 top-0 h-full w-[1px] bg-black" />
              )}

              {/* Ficha */}
              {(isBlack || isWhite) && (
                <div
                  className="absolute w-10 h-10 rounded-full"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: isBlack ? "black" : "white",
                    border: isWhite ? "1px solid #333" : "none",
                  }}
                />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
