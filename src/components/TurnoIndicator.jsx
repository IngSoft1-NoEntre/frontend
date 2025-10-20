import React from "react";
import "./TurnoIndicator.css";

// El componente reducido TurnoIndicator solo se encarga de mostrar
// quién tiene el turno y los botones de acción del jugador local.
const TurnoIndicator = ({
  ordenTurnos = [],
  turnoActualId,
  localPlayerId,
  onDescartar,
  onSaltarTurno,
  onTerminarTurno,
  onPlaySet,
}) => {
  // 1. Determinar si es el turno del jugador local
  const esMiTurno = turnoActualId === localPlayerId;

  // 2. Encontrar el nombre del jugador con el turno actual
  const jugadorConTurno = ordenTurnos.find((p) => p.id === turnoActualId);
  const nombreTurno = jugadorConTurno?.nombre || "...";

  

  // Muestra un mensaje de carga si no hay datos.
  if (ordenTurnos.length === 0) {
    return (
      <div className="turno-indicator-compact">
        <div className="turno-mensaje-compact">
          <span className="turno-icono-compact">⏳</span>
          <span className="turno-texto-compact">Cargando partida...</span>
        </div>
      </div>
    );
  }

  // Renderiza el indicador de turno y los controles.
  return (
    // Es CRÍTICO que este componente NO renderice las áreas de la mesa (left, right, top, local-area)
    // porque esas áreas ya son renderizadas por GameScreen.
    <div className={`turno-indicator-compact ${esMiTurno ? "mi-turno" : ""}`}>
      
      {/* Indicador de turno: Quién juega */}
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

      {/* Botones de acción (Lógica preservada) */}
      <div className="turno-botones-compact">
        <button 
          className="btn-turno btn-play-game"
          disabled={!esMiTurno}
          onClick={onPlaySet}
        > 
          Jugar
        </button>
        <button
          className="btn-turno btn-principal-turno"
          disabled={!esMiTurno}
          onClick={onDescartar}
          title="Descartar carta"
        >
          Descartar
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
  );
};

export default TurnoIndicator;