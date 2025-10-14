import React, { useState, useEffect } from "react";
import "./TurnoIndicator.css";
import {
  calculateTurnOrder,
  getFirstPlayer,
  getNextPlayer,
} from "../utils/turnOrder";

const TurnoIndicator = ({ players = [] }) => {
  const [currentTurnId, setCurrentTurnId] = useState(null);
  const myPlayerId = 6; // Hard-code Lucas como jugador

  // Inicializar el turno al primer jugador al cargar los jugadores
  useEffect(() => {
    if (players.length > 0 && !currentTurnId) {
      const firstPlayer = getFirstPlayer(players);
      if (firstPlayer) {
        setCurrentTurnId(firstPlayer.id);
      }
    }
  }, [players, currentTurnId]);

  const currentPlayer = players.find((p) => p.id === currentTurnId);
  const isMyTurn = currentTurnId === myPlayerId;

  const advanceTurn = () => {
    const nextPlayer = getNextPlayer(players, currentTurnId);
    if (nextPlayer) {
      setCurrentTurnId(nextPlayer.id);
    }
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    console.log("Drawing card...");
    // Por ahora solo avanzamos el turno
    advanceTurn();
  };

  const handlePassTurn = () => {
    if (!isMyTurn) return;
    console.log("Passing turn...");
    advanceTurn();
  };

  // Mostrar si hay jugadores
  if (players.length === 0) {
    return null;
  }

  return (
    <div className={`turno-indicator-compact ${isMyTurn ? "mi-turno" : ""}`}>
      <div className="turno-mensaje-compact">
        {isMyTurn ? (
          <>
            <span className="turno-icono-compact">🎯</span>
            <span className="turno-texto-compact">Tu turno</span>
          </>
        ) : (
          <>
            <span className="turno-icono-compact">⏳</span>
            <span className="turno-texto-compact">
              Turno de {currentPlayer?.nombre || "..."}
            </span>
          </>
        )}
      </div>

      <div className="turno-botones-compact">
        <button
          className="btn-turno btn-principal-turno"
          disabled={!isMyTurn}
          onClick={handleDrawCard}
        >
          Jugar
        </button>
        <button
          className="btn-turno btn-secundaria-turno"
          disabled={!isMyTurn}
          onClick={handlePassTurn}
        >
          Pasar
        </button>
      </div>
    </div>
  );
};

export default TurnoIndicator;
