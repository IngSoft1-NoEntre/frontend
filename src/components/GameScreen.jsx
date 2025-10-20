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
import DetectiveSets from "./DetectiveSets";
import RobarSetModal from "./RobarSetModal";

/**
 * GameScreen dinámico: acepta `players`
 * Filtra entradas vacías / comentadas y distribuye la UI según la cantidad:
 * 2 -> local + 1 arriba
 * 3 -> local + 1 izquierda + 1 derecha
 * 4 -> local + 1 izquierda + 1 derecha + 1 arriba
 * 5 -> local + 1 left + 1 right + 2 arriba
 * 6 -> local + 2 left + 2 right + 1 arriba
 */

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
    setDeckCount,
    TOTAL_CARDS: TOTAL_CARDS_CONTEXT,
    cardPictures,
    selectedCardIds,
    setSelectedCardIds,
  } = useContext(GameStateContext);

  // ESTADOS PRINCIPALES (No relacionados con cartas)
  const [ws, setWs] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]);
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [turnoActualId, setTurnoActualId] = useState(null);
  const [hasDiscarded, setHasDiscarded] = useState(false);

  // ESTADOS SECUNDARIOS
  const [loading, setLoading] = useState(true);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [openSecret, setOpenSecret] = useState(null);
  const [localPlayerSecrets, setLocalPlayerSecrets] = useState([
    { nombre: "varios" },
    { nombre: "varios" },
    { nombre: "varios" },
  ]);

  const [activeSetModalIndex, setActiveSetModalIndex] = useState(null);
  const [playSetError, setPlaySetError] = useState(null);
  const [activeSetModalData, setActiveSetModalData] = useState(null);
  const [robarSetModalOpen, setRobarSetModalOpen] = useState(false);
  const [setsDisponiblesParaRobar, setSetsDisponiblesParaRobar] = useState([]);
  const [cartaEventoAnotherVictim, setCartaEventoAnotherVictim] =
    useState(null);

  const canPlaySet = useCallback(() => {
    // Los sets requieren 2 o 3 cartas para ser jugados.
    const count = selectedCardIds.length;
    const isMyTurn = turnoActualId === localPlayerId;
    return (count === 2 || count === 3) && isMyTurn && ws;
  }, [selectedCardIds.length, turnoActualId, localPlayerId, ws]);

  // Envía la acción de JUGAR SET al backend
  const handlePlaySet = () => {
    if (!canPlaySet() || !ws) {
      setPlaySetError("Solo puedes jugar un set de 2 o 3 cartas en tu turno.");
      console.warn("Intento de jugar set sin cumplir requisitos.");
      return;
    }

    setPlaySetError(null);

    // Obtenemos los IDs y los mapeamos para que el backend pueda validarlos
    const cardsToSend = localPlayerCards
      .filter((card) => selectedCardIds.includes(card.id))
      .map((card) => ({
        id: card.id,
        nombre: card.title,
        tipo: card.tipo, // Propiedad clave que el backend necesita para validar
        zona: card.zona,
      }));

    const playSetPayload = {
      tipo: "jugar",
      option: "jugar_set",
      cartas: cardsToSend,
    };

    try {
      ws.send(JSON.stringify(playSetPayload));
      // NOTA: La actualización del estado de la mano y de localDetectiveSets
      // ocurrirá cuando el backend envíe el evento 'actualizacion'.
    } catch (error) {
      console.error("Error al enviar la acción de jugar set:", error);
      setPlaySetError("Error de conexión al intentar jugar el set.");
    }
  };

  useEffect(() => {
    if (!partidaId || !token) return;

    let socket;

    const fetchInitialData = async () => {
      try {
        // ... (PETICIÓN HTTP GET) ...
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
          //console.log("Mensaje WS recibido:", dataWS);

          // Manejo de conexión
          if (dataWS.evento === "conectado") {
            const localId = dataWS.jugador_id;
            setLocalPlayerId(localId);
            setGamePlayers(
              dataWS.orden_turnos.map((p) => mapPlayerFromBackend(p, localId))
            );
            setLoading(false);
            return; // Importante para evitar procesar como estado_actualizado
          }

          if (dataWS.evento === "set_creado") {
            console.log("EVENTO set_creado RECIBIDO. Data:", dataWS);
            const gameData = dataWS.game;

            if (
              !gameData ||
              !gameData.cartas ||
              !Array.isArray(gameData.cartas) ||
              gameData.jugador_id === undefined
            ) {
              console.error(
                "Error: Evento 'set_creado' recibido sin la estructura esperada (falta 'game.cartas' o 'game.jugador_id').",
                dataWS
              );
              return;
            }

            const nuevoSetJugadorId = gameData.jugador_id;
            const nuevoSetCartasData = gameData.cartas;

            // Mapeo de cartas para el frontend
            const nuevoSetCartas = nuevoSetCartasData.map((card) => ({
              id: card.id,
              title: card.nombre || "card_back",
              tipo: card.tipo,
              zona: "set",
            }));

            // Añadir el nuevo set a los sets del jugador correspondiente en gamePlayers
            setGamePlayers((prevPlayers) => {
              return prevPlayers.map((p) => {
                if (p.id === nuevoSetJugadorId) {
                  // Se usa 'detectiveSets' para guardar todos los sets
                  const currentSets = p.detectiveSets || [];
                  const updatedSets = [...currentSets, nuevoSetCartas];

                  if (p.id === localPlayerId) {
                    console.log(
                      `LOG 2 (LOCAL): Nuevo Set agregado. Sets Totales:`,
                      updatedSets.length
                    );
                  }

                  return {
                    ...p,
                    detectiveSets: updatedSets,
                  };
                }
                return p;
              });
            });

            // Detenemos el procesamiento aquí, ya que el evento 'actualizacion' llegará después
            // para limpiar la mano.
            return;
          }
          if (
            dataWS.evento === "iniciada" ||
            dataWS.evento === "actualizacion" ||
            dataWS.evento === "estado_actualizado"
          ) {
            console.log("Payload recibido (simplificado):", dataWS);

            const payload = dataWS.payload;

            // Si por alguna razón crítica no viene, usamos un objeto vacío para evitar crashes.
            if (!payload) {
              console.error(`Evento ${dataWS.evento} recibido sin payload.`);
              return; // Salir si no hay datos.
            }

            // Obtener y mapear la mano
            const rawMano = payload.mano || [];

            const mappedMano = rawMano.map((card) => ({
              id: card.id,
              title: card.nombre || "card_back",
              tipo: card.tipo,
              zona: card.zona,
            }));

            // Usar setter del contexto para cartas y estado
            setLocalPlayerCards(mappedMano); // Esto repone la mano

            setDiscardPileCards(payload.descarte || []); // Esto actualiza el descarte

            setDeckCount(payload.mazo_restante); // Esto actualiza el mazo

            setLocalPlayerId(payload.jugador_id || localPlayerId);

            if (payload.secretos && Array.isArray(payload.secretos)) {
              // Almacena el objeto secreto directamente para usar su 'nombre' y renderizar la imagen
              setLocalPlayerSecrets(payload.secretos);
            }

            setTurnoActualId(payload.turno_actual_id);
            setPlaySetError(null);
            setSelectedCardIds([]);
          }

          // Solicitud de selección de set para robar
          if (dataWS.evento === "solicitar_seleccion_set") {
            console.log("[GameScreen] Solicitud de selección de set:", dataWS);

            const { carta_evento_id, sets } = dataWS;

            setCartaEventoAnotherVictim(carta_evento_id);
            setSetsDisponiblesParaRobar(sets || []);
            setRobarSetModalOpen(true);
          }

          // Confirmación de set robado
          if (dataWS.evento === "set_robado") {
            console.log("[GameScreen] Set robado exitosamente:", dataWS);

            const { set, request_id } = dataWS;

            // Cerrar modal
            setRobarSetModalOpen(false);
            setSetsDisponiblesParaRobar([]);
            setCartaEventoAnotherVictim(null);

            // Actualizar sets del jugador ladrón
            if (set && set.jugador_id) {
              const cartasRobadas = set.cartas.map((c) => ({
                id: c.id,
                title: c.nombre || "card_back",
                tipo: c.tipo,
                zona: "set",
              }));

              setGamePlayers((prevPlayers) => {
                return prevPlayers.map((p) => {
                  if (p.id === set.jugador_id) {
                    const currentSets = p.detectiveSets || [];
                    return {
                      ...p,
                      detectiveSets: [...currentSets, cartasRobadas],
                    };
                  }
                  // Remover el set del jugador víctima
                  if (p.id !== set.jugador_id) {
                    const currentSets = p.detectiveSets || [];
                    const updatedSets = currentSets.filter((s) => {
                      const setIds = s.map((card) => card.id);
                      const robadasIds = cartasRobadas.map((card) => card.id);
                      return !setIds.some((id) => robadasIds.includes(id));
                    });
                    return {
                      ...p,
                      detectiveSets: updatedSets,
                    };
                  }
                  return p;
                });
              });

              // Mostrar notificación
              alert(`¡Set robado con éxito! 🎯`);
            }
          }

          // Manejo de error de jugada (por ejemplo, set inválido)
          else if (
            dataWS.evento === "jugada_invalida" ||
            dataWS.evento === "error"
          ) {
            const errorMessage =
              dataWS.detalle ||
              dataWS.mensaje ||
              "La jugada no es válida. Revisa las reglas de combinación de detectives.";
            setPlaySetError(errorMessage);
            // NO limpiamos selectedCardIds para que el usuario pueda corregir su selección.
          }
          // Lógica específica para "cartas_descartadas" o "jugador_conectado"
          else if (
            dataWS.evento === "cartas_descartadas" ||
            dataWS.evento === "jugador_conectado"
          ) {
            // Solo loguear o manejar eventos mínimos que no requieren actualizar el estado completo.
            console.log(`Notificación recibida: ${dataWS.evento}`);
          }
        };
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
    setDiscardPileCards,
    setDeckCount,
  ]);

  // --- CÁLCULO DE ESTADOS DERIVADOS ---
  // deckCount y discardPileCards vienen del Context
  const isDeckEmpty = deckCount <= 0;

  // Distribucion de jugadores
  const list = gamePlayers.filter(Boolean);

  let local = list.find((p) => p.isLocal);
  let others = list.filter((p) => !p.isLocal);

  if (!local && localPlayerId) {
    local = list.find((p) => p.id === localPlayerId);
  }

  if (local) {
    // ASIGNAR LOS SECRETOS LOCALES (actualizados por WS o estado inicial)
    local = {
      ...local,
      secretos: localPlayerSecrets,
      detectiveSets: local.detectiveSets || [],
    };
    others = list.filter((p) => p.id !== local.id);
  } else {
    local = emptyPlayer;
    local.detectiveSets = [];
    others = [];
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

  const openSetModal = (setIndex, playerId = localPlayerId) => {
    // Guarda tanto el índice como el ID del jugador que posee el set
    setActiveSetModalData({ setIndex, playerId });
  };

  // Funcion para cerrar la modal
  const closeSetModal = () => {
    setActiveSetModalData(null);
  };

  const activeSetData =
    activeSetModalData !== null
      ? (() => {
          const { setIndex, playerId } = activeSetModalData;

          // 1. Encontrar el jugador (local o remoto) por su ID en el estado global
          const targetPlayer = gamePlayers.find((p) => p.id === playerId);
          const targetSets = targetPlayer?.detectiveSets || [];

          // 2. Obtener el set con el índice.
          const currentSet = targetSets[setIndex];

          // 3. Comprobación crítica
          if (!currentSet || currentSet.length === 0) {
            console.error(
              "Intento de abrir un set que no existe. ID:",
              playerId,
              "Index:",
              setIndex,
              "Sets disponibles:",
              targetSets.length
            );
            return null;
          }

          const cardTitle = currentSet[0]?.title;

          // Obtener la URL de la imagen
          const frontImageURL =
            cardPictures[cardTitle] || cardPictures["card_back"];

          // Devolver el objeto de datos
          return {
            isSet: true,
            title: cardTitle
              ? `Set: ${cardTitle.replace(/_/g, " ").toUpperCase()}`
              : "Set de Detective",
            cards: currentSet,
            revealed: true,
            frontImage: frontImageURL,
          };
        })()
      : null;

  // La función para cerrar el modal (usada en el botón "Volver a jugar" del modal)
  // Aunque "Volver a jugar" navega, tener esta función de cierre es buena práctica.
  const closeGameOverModal = () => setIsGameOverModalOpen(false);
  const openSecretModal = (data) => {
    if (data?.revealed) setOpenSecret(data);
  };
  const closeSecretModal = () => setOpenSecret(null);

  // Función para enviar la acción de descarte por WS
  const handleDiscard = () => {
    if (selectedCardIds.length === 0 || !ws) return;

    // Crear el payload con los IDs de las cartas seleccionadas
    const discardPayload = {
      tipo: "descartar_carta",
      cartas: selectedCardIds, // Se envían los IDs de las cartas
    };
    try {
      ws.send(JSON.stringify(discardPayload));
      // NOTA: El backend actualizará el estado (mano, descarte, mazo) y lo enviará de vuelta
      // a través del evento "estado_actualizado" o similar.
      setHasDiscarded(true);
      setSelectedCardIds([]);
    } catch (error) {
      console.error("Error al enviar la acción de descarte:", error);
    }
  };

  // ✅ AGREGAR: Handlers para el modal de robar set
  const handleConfirmRobarSet = async (setId, ownerId) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.error("[GameScreen] WebSocket no conectado");
      alert("Error: No hay conexión con el servidor");
      return;
    }

    // Payload para confirmar el robo
    const payload = {
      tipo: "confirmar_robo_set",
      carta_evento_id: cartaEventoAnotherVictim,
      set_id: setId,
      owner_id: ownerId,
      request_id: `robo_${Date.now()}`,
    };

    try {
      ws.send(JSON.stringify(payload));
      console.log("[GameScreen] Confirmación de robo enviada:", payload);
    } catch (error) {
      console.error("[GameScreen] Error al confirmar robo:", error);
      alert("Error al enviar la confirmación del robo");
    }
  };

  const handleCancelRobarSet = () => {
    setRobarSetModalOpen(false);
    setSetsDisponiblesParaRobar([]);
    setCartaEventoAnotherVictim(null);

    console.log("[GameScreen] Robo de set cancelado por el jugador");

    // Opcional: descartar la carta evento si se cancela
    if (cartaEventoAnotherVictim && ws) {
      const discardPayload = {
        tipo: "descartar_carta",
        cartas: [cartaEventoAnotherVictim],
      };
      ws.send(JSON.stringify(discardPayload));
    }
  };

  const handleEndTurn = () => {
    if (!ws) return;

    if (!hasDiscarded) {
      console.warn(
        "Debe descartar al menos una vez antes de terminar el turno."
      );
      return;
    }

    const endTurnPayload = {
      tipo: "terminar_turno",
    };

    try {
      ws.send(JSON.stringify(endTurnPayload));
      //El backend responderá con "estado_actualizado" que contendrá la mano repuesta
      setHasDiscarded(false);
    } catch (error) {
      console.error("Error al enviar la acción de terminar turno:", error);
    }
  };

  const secretFrontUrl = cardPictures["varios"];
  const secretBackUrl = cardPictures["secret_back"];

  return (
    <div className="game-root">
      <div className="game-table">
        {/* columna izquierda */}
        <div
          className="players-col players-left"
          aria-hidden={left.length === 0}
        >
          {left.map((p) => (
            <Player
              key={p.id}
              player={p}
              onOpenSecret={openSecretModal}
              secretFrontUrl={secretFrontUrl}
              secretBackUrl={secretBackUrl}
              detectiveSets={p.detectiveSets || []}
              cardPictures={cardPictures}
              onSetClick={openSetModal}
            />
          ))}
        </div>

        {/* columna derecha */}
        <div
          className="players-col players-right"
          aria-hidden={right.length === 0}
        >
          {right.map((p) => (
            <Player
              key={p.id}
              player={p}
              onOpenSecret={openSecretModal}
              secretFrontUrl={secretFrontUrl}
              secretBackUrl={secretBackUrl}
              detectiveSets={p.detectiveSets || []}
              cardPictures={cardPictures}
              onSetClick={openSetModal}
            />
          ))}
        </div>

        {/* fila superior (puede tener 0,1 o 2 jugadores) */}
        <div className="players-top-row">
          {top.map((p) => (
            <Player
              key={p.id}
              player={p}
              onOpenSecret={openSecretModal}
              secretFrontUrl={secretFrontUrl}
              secretBackUrl={secretBackUrl}
              detectiveSets={p.detectiveSets || []}
              cardPictures={cardPictures}
              onSetClick={openSetModal}
            />
          ))}
        </div>

        {/* Centro: mazos */}
        <div className="center-area">
          <Deck
            discardCards={discardPileCards}
            deckCount={deckCount}
            totalCards={TOTAL_CARDS_CONTEXT}
          />
        </div>

        {/* Local: mano + secretos + set de detectives*/}
        <div className="sets-independent-position">
          <DetectiveSets
            sets={local.detectiveSets || []} // Asegúrate de pasar el array
            cardPictures={cardPictures}
            onSetClick={(setIndex) => openSetModal(setIndex, localPlayerId)}
          />
        </div>

        {/* ✅ AGREGAR MODAL DE ROBAR SET */}
        {robarSetModalOpen && (
          <RobarSetModal
            setsDisponibles={setsDisponiblesParaRobar}
            onConfirm={handleConfirmRobarSet}
            onCancel={handleCancelRobarSet}
          />
        )}

        <div className="local-area" aria-label="Area local">
          <div className="hand-and-secrets">
            <Hand cards={localPlayerCards || []} />
            <div
              className="local-secrets-horizontal"
              aria-label="Secretos del jugador"
            >
              {(local.secretos || []).slice(0, 3).map((s, i) => {
                const secretName = s.nombre || "varios";
                // Determinamos la URL de la imagen frontal usando el nombre del secreto
                const secretFrontImage =
                  cardPictures[secretName] || secretFrontUrl;
                return (
                  <Secret
                    key={i}
                    revealed={Boolean(s)}
                    isLocal={true}
                    data={{
                      title: `Secreto ${i + 1}`,
                      frontImage: secretFrontImage,
                      backImage: secretBackUrl,
                    }}
                    onOpen={(d) => openSecretModal({ ...d, revealed: true })}
                  />
                );
              })}
            </div>
          </div>
        </div>
        <SecretModal item={openSecret} onClose={closeSecretModal} />
        {/* SecretModal reutilizado para ver el set de detectives */}
        {activeSetData && (
          <SecretModal
            item={activeSetData}
            onClose={closeSetModal}
            cardPictures={cardPictures}
          />
        )}
        {/* Visualización de error de jugada */}
        {playSetError && (
          <div className="game-message error-message">
            <p>⚠️ Error al jugar el set: {playSetError}</p>
            <button
              onClick={() => setPlaySetError(null)}
              className="btn-close-error"
            >
              Cerrar
            </button>
          </div>
        )}
        <Controls
          onDiscard={handleDiscard}
          onEndTurn={handleEndTurn}
          canEndTurn={hasDiscarded}
          onPlaySet={handlePlaySet}
          canPlaySet={canPlaySet()}
        />
      </div>
      {isGameOverModalOpen && <FinishGameModal onClose={closeGameOverModal} />}
    </div>
  );
}
