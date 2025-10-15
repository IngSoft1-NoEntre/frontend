import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import "./GameScreen.css";
import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Secret from "./Secret";
import TurnoIndicator from "./TurnoIndicator";

const TOTAL_CARDS = 64;

export default function GameScreen({ players }) {
  const { partidaId } = useParams();
  const [gameState, setGameState] = useState(null);
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const wsRef = useRef(null);

  // Get local player ID from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        setLocalPlayerId(parseInt(decoded.sub));
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // WebSocket connection
  useEffect(() => {
    if (!partidaId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }

    const wsUrl = `ws://localhost:8000/ws/game/${partidaId}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[GameScreen] Connected to game WebSocket");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[GameScreen] Received:", data);

        switch (data.evento) {
          case "iniciada":
          case "estado_actualizado":
            if (data.payload) {
              setGameState(data.payload);

              // Actualizar orden de turnos del backend
              if (data.payload.orden_turnos) {
                setOrdenTurnos(data.payload.orden_turnos);
              }
            }
            break;

          case "turno_cambiado":
            if (data.payload?.turno_actual_id) {
              setGameState((prev) => ({
                ...prev,
                turno_actual_id: data.payload.turno_actual_id,
              }));
            }
            break;

          case "error":
            console.error("[GameScreen] Game error:", data.payload?.mensaje);
            break;

          default:
            console.log("[GameScreen] Unhandled event:", data.evento);
            break;
        }
      } catch (error) {
        console.error("[GameScreen] Error parsing message:", error);
      }
    };

    ws.onclose = () => {
      console.log("[GameScreen] WebSocket connection closed");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("[GameScreen] WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [partidaId]);

  // Fallback: orden mock para desarrollo
  useEffect(() => {
    if (ordenTurnos.length === 0 && !isConnected) {
      // Mock del orden de turnos (simula respuesta del backend)
      const mockOrden = [
        {
          id: 6,
          nombre: "Lucas",
          secretos: [true, true, true],
          cards: [
            { title: "not_so_fast" },
            { title: "cards_off_the_table" },
            { title: "hercule_poirot" },
            { title: "miss_marple" },
            { title: "cards_off_the_table" },
            { title: "dead_card_folly" },
          ],
        },
        { id: 1, nombre: "Juan", secretos: [false, false, false] },
        { id: 3, nombre: "Veronica", secretos: [false, false, false] },
        { id: 4, nombre: "Emanuel", secretos: [false, false, false] },
        { id: 5, nombre: "Agustin", secretos: [false, false, false] },
      ];

      setOrdenTurnos(mockOrden);
      setLocalPlayerId(6); // Lucas es local

      // Mock del turno inicial
      setTimeout(() => {
        setGameState({
          turno_actual_id: 6, // Empieza Lucas
          mazo_restante: 50,
        });
      }, 500);
    }
  }, [ordenTurnos.length, isConnected]);

  // Simulación del estado del descarte
  const discardPileCards = gameState?.descarte || [
    { title: "hercule_poirot", type: "Detective" },
    { title: "not_so_fast", type: "Instant" },
    { title: "look_into_the_ashes", type: "Event" },
  ];

  const discardCount = discardPileCards.length;
  const deckCount = gameState?.mazo_restante || TOTAL_CARDS - discardCount;

  const handleAccionPrincipal = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "draw_card",
          from: "deck",
        })
      );
    } else {
      console.log("[MOCK] Acción Principal ejecutada");
    }
  };

  const handleAccionSecundaria = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: "pass_turn",
        })
      );
    } else {
      console.log("[MOCK] Acción Secundaria ejecutada");
    }
  };

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
        {isConnected ? "Conectado" : "Modo Mock"}
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

        {/* Indicador de turno - AHORA ORQUESTA TODO */}
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={gameState?.turno_actual_id}
          localPlayerId={localPlayerId}
          onAccionPrincipal={handleAccionPrincipal}
          onAccionSecundaria={handleAccionSecundaria}
        />
      </div>
    </div>
  );
}
