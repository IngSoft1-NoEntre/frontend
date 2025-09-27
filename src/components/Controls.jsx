import React from "react";
import "./Controls.css";

//representa los botones de juego
export default function Controls() {
  return (
    <div className="controls">
      <button className="btn primary">Finalizar turno</button>
      <button className="btn medium">Saltar turno</button>
      <button className="btn secondary">Descartar</button>
    </div>
  );
}
