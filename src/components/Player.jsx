import React from "react";
import "./Player.css";
import Secret from "./Secret";

/**
 * Player minimal: esfera con inicial encima, nombre debajo, secretos en fila horizontal.
 * Props: player = { id, nombre, secretos: [bool,bool,bool], isLocal }
 */
export default function Player({ player }) {
  const { nombre = "Esperando", secretos = [false, false, false], isLocal = false } = player;

  return (
    <div className="player-wrapper" role="group" aria-label={`Jugador ${nombre}`}>
      <div className="player-minimal">
        <div className="avatar-sphere" aria-hidden>
          {nombre[0]?.toUpperCase() || "?"}
        </div>
        <div className="player-name">{nombre}</div>
      </div>

      {/* secretos alineados debajo del jugador */}
      <div className="player-secrets-row">
        {secretos.slice(0, 3).map((s, i) => (
          <Secret key={i} revealed={Boolean(isLocal && s)} />
        ))}
      </div>
    </div>
  );
}

