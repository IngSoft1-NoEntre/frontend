import React, { useContext } from "react";
import "./GameScreen.css";
import Deck from "./Deck";
import TurnoIndicator from "./TurnoIndicator";
import { GameStateContext } from "../context/GameStateContext";

const TOTAL_CARDS = 64;

export default function GameScreen() {
  const {
    gameState,
    ordenTurnos,
    isConnected,
    localPlayerId,
    deckCount,
    discardPileCards,
    handleDescartar,
    handleSaltarTurno,
    handleTerminarTurno,
  } = useContext(GameStateContext);

  return (
    <div className="game-root">
      {/* Connection status indicator */}
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          padding: "5px 10px",
          background: isConnected ? "green" : "orange",
          color: "white",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        {isConnected ? "Conectado" : "Desconectado"}
      </div>

      {/* Debug info */}
      <div
        style={{
          position: "fixed",
          top: "50px",
          right: "10px",
          padding: "5px 10px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          borderRadius: "5px",
          fontSize: "10px",
          zIndex: 1000,
        }}
      >
        Jugadores: {ordenTurnos.length} | Turno:{" "}
        {gameState?.turno_actual_id || "N/A"} | Local: {localPlayerId || "N/A"}
      </div>

      <div className="game-table">
        {/* Centro: mazos */}
        <div className="center-area">
          <Deck
            discardCards={discardPileCards}
            deckCount={deckCount}
            totalCards={TOTAL_CARDS}
          />
        </div>

        {/* Indicador de turno - Uses context data */}
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={gameState?.turno_actual_id}
          localPlayerId={localPlayerId}
          onDescartar={handleDescartar}
          onSaltarTurno={handleSaltarTurno}
          onTerminarTurno={handleTerminarTurno}
        />
      </div>
    </div>
  );
}
