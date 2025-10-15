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

              // FIXED: Update order from backend jugadores list
              if (data.payload.jugadores) {
                console.log(
                  "[GameScreen] Setting orden from backend:",
                  data.payload.jugadores
                );
                setOrdenTurnos(data.payload.jugadores);
              }
            }
            break;

          case "jugador_conectado":
            console.log("[GameScreen] Player connected:", data.payload);
            if (data.payload?.jugador) {
              setOrdenTurnos((prev) => {
                const existing = prev.find(
                  (p) => p.id === data.payload.jugador.id
                );
                if (!existing) {
                  return [...prev, data.payload.jugador];
                }
                return prev;
              });
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

  // FIXED: Only use mock data if NO real data after 3 seconds
  useEffect(() => {
    let mockTimeout;

    if (isConnected && ordenTurnos.length === 0) {
      mockTimeout = setTimeout(() => {
        console.log("[GameScreen] No real data received, using mock");
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
        setLocalPlayerId(6);
        setGameState({
          turno_actual_id: 6,
          mazo_restante: 50,
        });
      }, 3000); // Wait 3 seconds for real data
    }

    return () => {
      if (mockTimeout) clearTimeout(mockTimeout);
    };
  }, [isConnected, ordenTurnos.length]);

  // Simulación del estado del descarte
  const discardPileCards = gameState?.descarte || [
    { title: "hercule_poirot", type: "Detective" },
    { title: "not_so_fast", type: "Instant" },
    { title: "look_into_the_ashes", type: "Event" },
  ];

  const discardCount = discardPileCards.length;
  const deckCount = gameState?.mazo_restante || TOTAL_CARDS - discardCount;

  // FIXED: Send proper backend actions
  const handleJugar = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          tipo: "jugar_carta", // or whatever the backend expects
          jugador_id: localPlayerId,
        })
      );
    } else {
      console.log("[MOCK] Jugar ejecutado");
    }
  };

  const handleSaltarTurno = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          tipo: "saltar_turno",
          jugador_id: localPlayerId,
        })
      );
    } else {
      console.log("[MOCK] Saltar turno ejecutado");
    }
  };

  const handleTerminarTurno = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          tipo: "terminar_turno",
          jugador_id: localPlayerId,
        })
      );
    } else {
      console.log("[MOCK] Terminar turno ejecutado");
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
        {gameState?.turno_actual_id || "N/A"}
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
          onJugar={handleJugar}
          onSaltarTurno={handleSaltarTurno}
          onTerminarTurno={handleTerminarTurno}
        />
      </div>
    </div>
  );
}
