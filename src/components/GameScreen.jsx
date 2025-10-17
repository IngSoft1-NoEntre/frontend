import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams } from "react-router-dom";
import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Secret from "./Secret";
import Controls from "./Controls";
import FinishGameModal from "./FinishGameModal";
import SecretModal from "./SecretModal";
import TurnoIndicator from "./TurnoIndicator"; // ADD THIS IMPORT

const TOTAL_CARDS_FIXED = 64;

const emptyPlayer = {
  id: -1,
  nombre: "Local",
  secretos: [false, false, false],
  isLocal: true,
  cards: [],
};

const mapPlayerFromBackend = (p, localId) => ({
  id: p.id,
  nombre: p.nombre,
  secretos: [false, false, false],
  isLocal: p.id === localId,
  cards: [], // TurnoIndicator agregará las cartas luego
});

export default function GameScreen({ players }) {
  const { partidaId } = useParams();
  const token = localStorage.getItem("token");

  const {
    setLocalPlayerCards,
    setDiscardPileCards,
    localPlayerCards,
    discardPileCards,
    deckCount,
    TOTAL_CARDS: TOTAL_CARDS_CONTEXT,
    cardPictures,
    // Nuevos valores de contexto para TurnoIndicator
    gameState,
    setGameState,
    ordenTurnos,
    setOrdenTurnos,
    localPlayerId,
    setLocalPlayerId,
    handleDescartar,
    handleSaltarTurno,
    handleTerminarTurno,
  } = useContext(GameStateContext);

  // Estados simplificados (sin duplicados en contexto)
  const [ws, setWs] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [localPlayerSecrets, setLocalPlayerSecrets] = useState([
    true,
    true,
    true,
  ]);

  // NUEVO: Guardar el mazo inicial
  const [initialDeckCount, setInitialDeckCount] = useState(null);

  // Estados secundarios
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

        let data;

        if (!res.ok) {
          // ... (Manejo de errores HTTP) ...
          let errorMessage = `Error HTTP ${res.status}...`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.detail || errorMessage;
          } catch (e) {
            console.error("Error parsing body.");
          }
          throw new Error(errorMessage);
        }

        data = await res.json();

        // --- CONEXIÓN AL WEB SOCKET ---
        const wsUrl = `ws://localhost:8000/ws/game/${partidaId}?token=${token}`;
        socket = new WebSocket(wsUrl);
        setWs(socket);

        socket.onmessage = (event) => {
          const dataWS = JSON.parse(event.data);
          console.log("Mensaje WS recibido:", dataWS);

          if (dataWS.evento === "conectado") {
            const localId = dataWS.jugador_id;
            setLocalPlayerId(localId);

            // IMPORTANTE: Crear jugadores con array de cartas vacío
            const jugadoresIniciales = data.orden_turnos.map((p) =>
              mapPlayerFromBackend(p, localId)
            );

            setGamePlayers(jugadoresIniciales);
            setOrdenTurnos(jugadoresIniciales);
            setLoading(false);
            console.log("[GameScreen] LocalPlayerId:", localId);
            console.log(
              "[GameScreen] Jugadores iniciales:",
              jugadoresIniciales
            );
          }
          if (
            dataWS.evento === "iniciada" ||
            dataWS.evento === "estado_actualizado" ||
            dataWS.evento === "actualizacion"
          ) {
            const payload = dataWS.payload || {};

            console.log("[GameScreen] Procesando evento:", dataWS.evento);
            console.log("[GameScreen] Payload mano:", payload.mano);
            console.log("[GameScreen] Mazo restante:", payload.mazo_restante);

            // GUARDAR EL VALOR INICIAL DEL MAZO (solo la primera vez)
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

            // UPDATE CONTEXT gameState
            setGameState((prev) => ({
              ...prev,
              turno_actual_id: payload.turno_actual_id || prev.turno_actual_id,
              mazo_restante:
                payload.mazo_restante !== undefined
                  ? payload.mazo_restante
                  : prev.mazo_restante,
              acciones_disponibles:
                payload.acciones_disponibles || prev.acciones_disponibles,
            }));

            // Obtener la mano del backend
            const rawMano = payload.mano || [];

            // Mapear para asegurar que tengan la clave 'title'
            const mappedMano = rawMano.map((card) => ({
              id: card.id,
              title: card.nombre || "card_back",
              tipo: card.tipo,
              zona: card.zona,
            }));

            console.log("[GameScreen] Cartas mapeadas:", mappedMano);
            console.log("[GameScreen] LocalPlayerId:", localPlayerId);

            // USAR SETTERS DEL CONTEXTO PARA CARTAS
            setLocalPlayerCards(mappedMano);

            // UPDATE CONTEXT ordenTurnos CON LAS CARTAS
            setOrdenTurnos((prev) =>
              prev.map((player) =>
                player.id === localPlayerId
                  ? { ...player, cards: mappedMano }
                  : player
              )
            );
            console.log("[GameScreen] OrdenTurnos actualizado:", ordenTurnos);

            /*setOrdenTurnos((prev) => {
              const updated = prev.map((player) =>
                player.id === localPlayerId
                 ? { ...player, cards: mappedMano }
                 : player
              );
              console.log("[GameScreen] OrdenTurnos actualizado:", updated);
              return updated;
            }); */

            setDiscardPileCards(payload.descarte || []);

            // ACTUALIZAR SECRETOS LOCALES
            if (payload.secretos) {
              setLocalPlayerSecrets(payload.secretos.map(() => true)); // Todos revelados por ahora
            }
          }

          // PROCESAR EVENTO DE ERROR - ESPECIALMENTE "No hay mas cartas en el mazo"
          if (dataWS.evento === "error") {
            const payload = dataWS.payload || {};
            console.error("[GameScreen] Error del backend:", payload.mensaje);

            // Si el error es por falta de cartas, actualizar el mazo a 0 y abrir el modal
            if (payload.mensaje?.includes("No hay mas cartas en el mazo")) {
              console.log(
                "[GameScreen] Mazo agotado, abriendo modal de fin de juego"
              );
              setGameState((prev) => ({
                ...prev,
                mazo_restante: 0,
              }));
              setIsGameOverModalOpen(true);
            }
          }

          // PROCESAR EVENTOS DE SALTO DE TURNO (nombre correcto del backend)
          if (dataWS.evento === "salto_turno") {
            console.log(
              "[GameScreen] Turno saltado, esperando actualización..."
            );
            // No hacer nada aquí, el evento 'actualizacion' siguiente tiene la data
          }

          // PROCESAR EVENTOS DE TERMINAR TURNO
          if (dataWS.evento === "turno_terminado") {
            console.log(
              "[GameScreen] Turno terminado, esperando actualización..."
            );
            // No hacer nada aquí, el evento 'actualizacion' siguiente tiene la data
          }

          /* Manejo consolidado de eventos que actualizan estado/mano/descarte
          if (
            dataWS.evento === "turno_saltado" ||
            dataWS.evento === "turno_terminado" ||
            dataWS.evento === "carta_descartada"
          ) {
            console.log(`Procesando evento: ${dataWS.evento}`, dataWS.payload);
            const payload = dataWS.payload || {};

            // Actualizar el estado completo del juego
            setGameState((prev) => ({
              ...prev,
              turno_actual_id: payload.turno_actual_id || prev.turno_actual_id,
              mazo_restante:
                payload.mazo_restante !== undefined
                  ? payload.mazo_restante
                  : prev.mazo_restante,
              acciones_disponibles:
                payload.acciones_disponibles || prev.acciones_disponibles,
            }));

            // Si viene la mano actualizada, procesarla
            if (payload.mano) {
              const mappedMano = payload.mano.map((card) => ({
                id: card.id,
                title: card.nombre || "card_back",
                tipo: card.tipo,
                zona: card.zona,
              }));

              console.log(
                "[GameScreen] Actualizando cartas tras evento:",
                mappedMano
              );

              setLocalPlayerCards(mappedMano);

              // IMPORTANTE: Actualizar ordenTurnos con las cartas
              setOrdenTurnos((prev) =>
                prev.map((player) =>
                  player.id === localPlayerId
                    ? { ...player, cards: mappedMano }
                    : player
                )
              );
            }

            // Actualizar el descarte si viene en el payload
            if (payload.descarte) {
              setDiscardPileCards(payload.descarte);
            }
          }*/
        };

        socket.onclose = () => console.log("Conexión WS de juego cerrada.");
      } catch (err) {
        console.error("FALLO CRÍTICO EN CARGA DE PARTIDA:", err.message);
        setLoading(false);
        socket?.close();
      }
    };

    fetchInitialData();

    // Cleanup del useEffect
    return () => socket?.close();
  }, [
    partidaId,
    token,
    setLocalPlayerCards,
    setGameState,
    setOrdenTurnos,
    setLocalPlayerId,
  ]);

  // USE gameState from context instead of local turnoActualId
  const isDeckEmpty = gameState.mazo_restante <= 0;

  // DISTRIBUCIÓN DE JUGADORES
  const list = gamePlayers.filter(Boolean);

  let local = list.find((p) => p.isLocal);
  let others = list.filter((p) => !p.isLocal);

  if (local) {
    // ASIGNAR LOS SECRETOS LOCALES (actualizados por WS o estado inicial)
    local = { ...local, secretos: localPlayerSecrets };
  } else {
    local =
      list.length > 0
        ? list.find((p) => p.id === localPlayerId) || list[0]
        : emptyPlayer;
    others = list.filter((p) => p.id !== local.id);
  }

  if (!local) {
    // tomar el último como local por defecto
    local = others.length ? others[others.length - 1] : list[list.length - 1];
    others = list.filter((p) => p.id !== local.id);
  }

  // Si el mazo está vacío Y el modal no se ha abierto, lo abrimos.
  // Usaremos un efecto para manejar esta apertura automática:
  React.useEffect(() => {
    if (isDeckEmpty && !isGameOverModalOpen) {
      setIsGameOverModalOpen(true);
    }
  }, [isDeckEmpty, isGameOverModalOpen]);

  // distribución según cantidad total
  const total = 1 + others.length; // local + otros
  let left = [],
    right = [],
    top = [];

  switch (total) {
    case 2:
      // 1 arriba, local abajo
      top = [others[0]];
      break;
    case 3:
      // left:1, right:1
      left = [others[0]];
      right = [others[1]];
      break;
    case 4:
      // left:1, right:1, top:1
      left = [others[0]];
      right = [others[1]];
      top = [others[2]];
      break;
    case 5:
      // top:2, left:1, right:1
      top = [others[0], others[1]];
      left = [others[2]];
      right = [others[3]];
      break;
    case 6:
    default:
      // left:2, right:2, top:1
      left = [others[0], others[1]].filter(Boolean);
      right = [others[2], others[3]].filter(Boolean);
      top = [others[4]].filter(Boolean);
      break;
  }

  const closeGameOverModal = () => setIsGameOverModalOpen(false);
  const openSecretModal = (data) => {
    if (data?.revealed) setOpenSecret(data);
  };
  const closeSecretModal = () => setOpenSecret(null);

  const secretFrontUrl = cardPictures["varios"];
  const secretBackUrl = cardPictures["secret_back"];

  return (
    <div className="game-root">
      <div className="game-table">
        {/* REPLACE the existing player columns with TurnoIndicator */}
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={gameState.turno_actual_id}
          localPlayerId={localPlayerId}
          onDescartar={handleDescartar}
          onSaltarTurno={() => handleSaltarTurno(ws)}
          onTerminarTurno={() => handleTerminarTurno(ws)}
        />

        {/* Centro: mazos */}
        <div className="center-area">
          <Deck
            discardCards={discardPileCards}
            deckCount={gameState.mazo_restante}
            totalCards={initialDeckCount || gameState.mazo_restante}
          />
        </div>

        <SecretModal item={openSecret} onClose={closeSecretModal} />
        <Controls />
      </div>
      {isGameOverModalOpen && <FinishGameModal onClose={closeGameOverModal} />}
    </div>
  );
}
