import React from "react";
import "./TurnoIndicator.css";
import Player from "./Player";
import Hand from "./Hand";
import Secret from "./Secret";

/**
 * TurnoIndicator - Orquestador visual de la mesa
 * Recibe el orden de turnos del backend y distribuye a los jugadores
 * en la mesa según la cantidad de jugadores
 */
const TurnoIndicator = ({
  ordenTurnos = [],
  turnoActualId,
  localPlayerId,
  onJugar,
  onSaltarTurno,
  onTerminarTurno,
}) => {
  // Encontrar índice del jugador local en el orden
  const localIndex = ordenTurnos.findIndex((p) => p.id === localPlayerId);

  if (localIndex === -1 || ordenTurnos.length === 0) {
    return (
      <div className="turno-indicator-compact">
        <div className="turno-mensaje-compact">
          <span className="turno-icono-compact">⏳</span>
          <span className="turno-texto-compact">Cargando partida...</span>
        </div>
      </div>
    );
  }

  // Reordenar array: jugador local al final, resto en orden desde su izquierda
  const reordenado = [
    ...ordenTurnos.slice(localIndex + 1),
    ...ordenTurnos.slice(0, localIndex + 1),
  ];

  // El jugador local siempre es el último
  const local = reordenado[reordenado.length - 1];
  const others = reordenado.slice(0, -1);

  // Distribución según cantidad
  const total = reordenado.length;
  let left = [],
    right = [],
    top = [];

  switch (total) {
    case 2:
      top = [others[0]];
      break;
    case 3:
      left = [others[0]];
      right = [others[1]];
      break;
    case 4:
      left = [others[0]];
      right = [others[1]];
      top = [others[2]];
      break;
    case 5:
      left = [others[0]];
      right = [others[1]];
      top = [others[2], others[3]];
      break;
    case 6:
      left = [others[0], others[1]];
      right = [others[2], others[3]];
      top = [others[4]];
      break;
    default:
      break;
  }

  // Determinar si es el turno del jugador local
  const esMiTurno = turnoActualId === localPlayerId;

  // Encontrar nombre del jugador con turno
  const jugadorConTurno = ordenTurnos.find((p) => p.id === turnoActualId);
  const nombreTurno = jugadorConTurno?.nombre || "...";

  // Función para agregar corona al jugador con turno
  const agregarCorona = (jugador) => {
    return turnoActualId === jugador.id;
  };

  return (
    <>
      {/* Columna izquierda */}
      <div className="players-col players-left" aria-hidden={left.length === 0}>
        {left.map((p) => (
          <div key={p.id} className="player-with-crown">
            <Player player={p} />
            {agregarCorona(p) && <span className="corona-turno">👑</span>}
          </div>
        ))}
      </div>

      {/* Columna derecha */}
      <div
        className="players-col players-right"
        aria-hidden={right.length === 0}
      >
        {right.map((p) => (
          <div key={p.id} className="player-with-crown">
            <Player player={p} />
            {agregarCorona(p) && <span className="corona-turno">👑</span>}
          </div>
        ))}
      </div>

      {/* Fila superior */}
      <div className="players-top-row">
        {top.map((p) => (
          <div key={p.id} className="player-with-crown">
            <Player player={p} />
            {agregarCorona(p) && <span className="corona-turno">👑</span>}
          </div>
        ))}
      </div>

      {/* Área local: mano + secretos */}
      <div className="local-area" aria-label="Area local">
        <div className="hand-and-secrets">
          {esMiTurno && <span className="corona-turno corona-local">👑</span>}
          <Hand cards={local.cards || []} />
          <div
            className="local-secrets-horizontal"
            aria-label="Secretos del jugador"
          >
            {(local.secretos || [false, false, false])
              .slice(0, 3)
              .map((s, i) => (
                <Secret key={i} revealed={Boolean(s)} />
              ))}
          </div>
        </div>
      </div>

      {/* Indicador de turno compacto con 3 botones */}
      <div className={`turno-indicator-compact ${esMiTurno ? "mi-turno" : ""}`}>
        <div className="turno-mensaje-compact">
          {esMiTurno ? (
            <>
              <span className="turno-icono-compact">🎯</span>
              <span className="turno-texto-compact">Tu turno</span>
            </>
          ) : (
            <>
              <span className="turno-icono-compact">⏳</span>
              <span className="turno-texto-compact">
                Turno de {nombreTurno}
              </span>
            </>
          )}
        </div>

        {/* 3 botones de acción */}
        <div className="turno-botones-compact">
          <button
            className="btn-turno btn-principal-turno"
            disabled={!esMiTurno}
            onClick={onJugar}
            title="Jugar carta"
          >
            Jugar
          </button>
          <button
            className="btn-turno btn-secundaria-turno"
            disabled={!esMiTurno}
            onClick={onSaltarTurno}
            title="Saltar turno"
          >
            Saltar
          </button>
          <button
            className="btn-turno btn-terciaria-turno"
            disabled={!esMiTurno}
            onClick={onTerminarTurno}
            title="Terminar turno"
          >
            Terminar
          </button>
        </div>
      </div>
    </>
  );
};

export default TurnoIndicator;
