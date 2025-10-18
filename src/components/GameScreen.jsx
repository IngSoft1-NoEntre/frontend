import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import Deck from "./Deck";
import FinishGameModal from "./FinishGameModal";
import SecretModal from "./SecretModal";
import TurnoIndicator from "./TurnoIndicator";

const TOTAL_CARDS_FIXED = 64;

const mapPlayerFromBackend = (p, localId) => ({
  id: p.id,
  nombre: p.nombre,
  secretos: [false, false, false],
  isLocal: p.id === localId,
  cards: [],
});

export default function GameScreen({ players }) {
  const { partidaId } = useParams();
  const token = localStorage.getItem("token");

  const {
    setLocalPlayerCards,
    setDiscardPileCards,
    discardPileCards,
    selectedCardIds,
    setSelectedCardIds,
    // AGREGAR ESTOS DEL CONTEXTO
    gameState,
    setGameState,
    ordenTurnos,
    setOrdenTurnos,
    localPlayerId,
    setLocalPlayerId,
  } = useContext(GameStateContext);

  console.log("[GameScreen] Contexto cargado:", {
    hasSetSelectedCardIds: typeof setSelectedCardIds === "function",
    selectedCardIds,
    hasGameState: !!gameState,
  }); // ✅ AGREGAR LOG PARA DEBUG

  // ESTADOS LOCALES (no duplicar los del contexto)
  const [ws, setWs] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [turnoActualId, setTurnoActualId] = useState(null);
  const [localPlayerSecrets, setLocalPlayerSecrets] = useState([
    true,
    true,
    true,
  ]);
  const [hasDiscarded, setHasDiscarded] = useState(false);
  const [initialDeckCount, setInitialDeckCount] = useState(null);

  // ESTADOS SECUNDARIOS
  const [loading, setLoading] = useState(true);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [openSecret, setOpenSecret] = useState(null);

  useEffect(() => {
    if (!partidaId || !token) return;

    let socket;

    const fetchInitialData = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/partidas/${partidaId}/turno/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          let errorMessage = `Error HTTP ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            console.error("Error parsing body.");
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();

        // --- CONEXIÓN AL WEB SOCKET ---
        const wsUrl = `ws://localhost:8000/ws/game/${partidaId}?token=${token}`;
        socket = new WebSocket(wsUrl);
        setWs(socket);

        socket.onmessage = (event) => {
          const dataWS = JSON.parse(event.data);
          console.log("[GameScreen] Mensaje WS recibido:", dataWS);

          // EVENTO: conectado
          if (dataWS.evento === "conectado") {
            const localId = dataWS.jugador_id;
            setLocalPlayerId(localId);

            // ✅ USAR dataWS.orden_turnos en lugar de data.orden_turnos
            const jugadoresIniciales = (dataWS.orden_turnos || []).map((p) =>
              mapPlayerFromBackend(p, localId)
            );

            setGamePlayers(jugadoresIniciales);
            setOrdenTurnos(jugadoresIniciales);
            setLoading(false);
            console.log("[GameScreen] Conectado como jugador:", localId);
            console.log(
              "[GameScreen] Jugadores iniciales:",
              jugadoresIniciales
            );
            return;
          }

          // EVENTOS: iniciada, actualizacion, estado_actualizado
          if (
            dataWS.evento === "iniciada" ||
            dataWS.evento === "actualizacion" ||
            dataWS.evento === "estado_actualizado"
          ) {
            const payload = dataWS.payload;

            if (!payload) {
              console.error(`Evento ${dataWS.evento} recibido sin payload.`);
              return;
            }

            console.log("[GameScreen] Procesando:", dataWS.evento);

            // ✅ GUARDAR MAZO INICIAL (solo la primera vez)
            if (
              initialDeckCount === null &&
              payload.mazo_restante !== undefined
            ) {
              setInitialDeckCount(payload.mazo_restante);
              console.log(
                "[GameScreen] Mazo inicial guardado:",
                payload.mazo_restante
              );
            }

            // ✅ ACTUALIZAR CONTEXTO gameState
            setGameState((prev) => ({
              ...prev,
              turno_actual_id: payload.turno_actual_id ?? prev.turno_actual_id,
              mazo_restante: payload.mazo_restante ?? prev.mazo_restante,
              acciones_disponibles:
                payload.acciones_disponibles ?? prev.acciones_disponibles,
            }));

            // ACTUALIZAR TURNO LOCAL (para sincronización)
            if (payload.turno_actual_id !== undefined) {
              setTurnoActualId(payload.turno_actual_id);
            }

            // ACTUALIZAR MANO
            const rawMano = payload.mano || [];
            const mappedMano = rawMano.map((card) => ({
              id: card.id,
              title: card.nombre || "card_back",
              tipo: card.tipo,
              zona: card.zona,
            }));

            setLocalPlayerCards(mappedMano);

            // ACTUALIZAR CARTAS EN ordenTurnos PARA TurnoIndicator
            setOrdenTurnos((prev) =>
              prev.map((player) =>
                player.id === localPlayerId
                  ? { ...player, cards: mappedMano }
                  : player
              )
            );

            // ACTUALIZAR DESCARTE
            setDiscardPileCards(payload.descarte || []);

            // ACTUALIZAR SECRETOS
            if (payload.secretos) {
              setLocalPlayerSecrets(payload.secretos.map((s) => Boolean(s)));
            }

            console.log("[GameScreen] Estado actualizado correctamente");
          }

          // EVENTO: salto_turno
          if (dataWS.evento === "salto_turno") {
            console.log(
              "[GameScreen] Turno saltado, esperando actualización..."
            );
          }

          // EVENTO: turno_terminado
          if (dataWS.evento === "turno_terminado") {
            console.log(
              "[GameScreen] Turno terminado, esperando actualización..."
            );
          }

          // EVENTO: partida_finalizada
          if (dataWS.evento === "partida_finalizada") {
            console.log("[GameScreen] Partida finalizada, abriendo modal...");
            if (!isGameOverModalOpen) {
              setIsGameOverModalOpen(true);
            }
          }

          // EVENTO: error
          if (dataWS.evento === "error") {
            const payload = dataWS.payload || {};
            console.error("[GameScreen] Error del backend:", payload.mensaje);

            // Manejar específicamente el caso de mazo agotado
            if (payload.mensaje?.includes("No hay mas cartas en el mazo")) {
              setGameState((prev) => ({ ...prev, mazo_restante: 0 }));
              setIsGameOverModalOpen(true);
            } else {
              alert(`Error: ${payload.mensaje}`);
            }
          }

          // OTROS EVENTOS
          if (
            dataWS.evento === "cartas_descartadas" ||
            dataWS.evento === "jugador_conectado"
          ) {
            console.log(`[GameScreen] Notificación: ${dataWS.evento}`);
          }
        };

        socket.onclose = () => console.log("[GameScreen] Conexión WS cerrada.");
      } catch (err) {
        console.error("[GameScreen] Error crítico:", err.message);
        setLoading(false);
        socket?.close();
      }
    };

    fetchInitialData();

    return () => socket?.close();
  }, [
    partidaId,
    token,
    localPlayerId,
    initialDeckCount,
    isGameOverModalOpen,
    setLocalPlayerCards,
    setDiscardPileCards,
    setGameState,
    setOrdenTurnos,
    setLocalPlayerId,
  ]);

  // HANDLERS
  const handleDiscard = () => {
    console.log("[GameScreen] handleDiscard llamado");
    console.log("[GameScreen] selectedCardIds:", selectedCardIds);
    console.log(
      "[GameScreen] setSelectedCardIds tipo:",
      typeof setSelectedCardIds
    );

    if (selectedCardIds.length === 0 || !ws) {
      console.warn(
        "[GameScreen] No hay cartas seleccionadas o WS no conectado"
      );
      return;
    }

    const discardPayload = {
      tipo: "descartar_carta",
      cartas: selectedCardIds,
    };

    try {
      ws.send(JSON.stringify(discardPayload));
      console.log("[GameScreen] Cartas descartadas:", selectedCardIds);
      setHasDiscarded(true);
      // ✅ VERIFICAR SI LA FUNCIÓN EXISTE ANTES DE LLAMARLA
      if (typeof setSelectedCardIds === "function") {
        setSelectedCardIds([]);
        console.log("[GameScreen] Cartas deseleccionadas");
      } else {
        console.error("[GameScreen] setSelectedCardIds NO es una función!");
        console.error("[GameScreen] Tipo:", typeof setSelectedCardIds);
        console.error("[GameScreen] Valor:", setSelectedCardIds);
      }
    } catch (error) {
      console.error("[GameScreen] Error al descartar:", error);
    }
  };

  const handleSkipTurn = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("[GameScreen] WebSocket no conectado");
      return;
    }

    const skipTurnPayload = {
      tipo: "saltar_turno",
    };

    try {
      ws.send(JSON.stringify(skipTurnPayload));
      console.log("[GameScreen] Saltar turno enviado");
      setHasDiscarded(false);
    } catch (error) {
      console.error("[GameScreen] Error al saltar turno:", error);
    }
  };

  const handleEndTurn = () => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("[GameScreen] WebSocket no conectado");
      return;
    }

    if (!hasDiscarded) {
      console.warn("[GameScreen] Debe descartar antes de terminar turno");
      alert("Debes descartar al menos una carta antes de finalizar el turno");
      return;
    }

    const endTurnPayload = {
      tipo: "terminar_turno",
    };

    try {
      ws.send(JSON.stringify(endTurnPayload));
      console.log("[GameScreen] Terminar turno enviado");
      setHasDiscarded(false);
    } catch (error) {
      console.error("[GameScreen] Error al terminar turno:", error);
    }
  };

  const closeGameOverModal = () => setIsGameOverModalOpen(false);
  const openSecretModal = (data) => {
    if (data?.revealed) setOpenSecret(data);
  };
  const closeSecretModal = () => setOpenSecret(null);

  if (loading) {
    return <div className="game-root">Cargando partida...</div>;
  }

  return (
    <div className="game-root">
      <div className="game-table">
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={gameState.turno_actual_id}
          localPlayerId={localPlayerId}
          onDescartar={handleDiscard}
          onSaltarTurno={handleSkipTurn}
          onTerminarTurno={handleEndTurn}
        />

        {/* Centro: mazos */}
        <div className="center-area">
          <Deck
            discardCards={discardPileCards}
            deckCount={gameState.mazo_restante}
            totalCards={initialDeckCount || TOTAL_CARDS_FIXED}
          />
        </div>

        <SecretModal item={openSecret} onClose={closeSecretModal} />
      </div>
      {isGameOverModalOpen && (
        <FinishGameModal onClose={closeGameOverModal} partidaId={partidaId} />
      )}
    </div>
  );
}
