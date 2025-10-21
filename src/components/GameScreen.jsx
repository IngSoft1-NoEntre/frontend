import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useParams } from "react-router-dom"
import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import Player from "./Player";    
import Deck from "./Deck";
import Hand from "./Hand";         
import Secret from "./Secret";
import FinishGameModal from "./FinishGameModal";
import SecretModal from "./SecretModal";
import TurnoIndicator from "./TurnoIndicator";
import DetectiveSets from "./DetectiveSets";
import DiscardModal from './DiscardModal';

const TOTAL_CARDS = 43;

/**
 * GameScreen dinámico: acepta `players`
 * Filtra entradas vacías / comentadas y distribuye la UI según la cantidad:
 * 2 -> local + 1 arriba
 * 3 -> local + 1 izquierda + 1 derecha
 * 4 -> local + 1 izquierda + 1 derecha + 1 arriba
 * 5 -> local + 1 left + 1 right + 2 arriba
 * 6 -> local + 2 left + 2 right + 1 arriba
 */

const emptyPlayer = { id: -1, nombre: "Local", secretos: [false, false, false], isLocal: true, cards: [] };

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
    gameState,
    setGameState,
    ordenTurnos,
    setOrdenTurnos,
  } = useContext(GameStateContext);

// ESTADOS PRINCIPALES (No relacionados con cartas)
  const [ws, setWs] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]); 
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [turnoActualId, setTurnoActualId] = useState(null);
  const [hasDiscarded, setHasDiscarded] = useState(false);
  const [totalCards, setTotalCards] = useState(0)

  // ESTADOS SECUNDARIOS
  const [loading, setLoading] = useState(true);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [openSecret, setOpenSecret] = useState(null);
  const [localPlayerSecrets, setLocalPlayerSecrets] = useState([
    { nombre: "varios" }, 
    { nombre: "varios" }, 
    { nombre: "varios" }
  ]);

  const [activeSetModalIndex, setActiveSetModalIndex] = useState(null);
  const [playSetError, setPlaySetError] = useState(null);
  const [activeSetModalData, setActiveSetModalData] = useState(null);

  // Envía la acción de JUGAR SET o EVENTO al backend (Función Unificada)
  const handlePlayAction = () => {
    const count = selectedCardIds.length;
    const isMyTurn = turnoActualId === localPlayerId;

    if (!isMyTurn || !ws) {
        setPlaySetError("No es tu turno o la conexión está caída.");
        return;
    }
    
    if (count === 0) {
        setPlaySetError("Debes seleccionar al menos una carta para jugar.");
        return;
    }

    setPlaySetError(null);

    let payload;
    let actionName = ""; // Para logging y errores

    if (count === 1 && selectedCard?.title === "look_into_the_ashes") {
        // 1. ES JUGADA DE EVENTO (Look into the Ashes)
        actionName = "Evento";
        payload = {
            tipo: "jugar",
            option: "jugar_event",
            carta_id: selectedCard.id // Solo necesita el ID
        };
    } else if (count === 2 || count === 3) {
        // 2. ES JUGADA DE SET (2 o 3 cartas)
        actionName = "Set";
        const cardsToSend = localPlayerCards
            .filter(card => selectedCardIds.includes(card.id))
            .map(card => ({
                id: card.id,
                nombre: card.title,
                tipo: card.tipo, // Propiedad clave que el backend necesita para validar
                zona: card.zona
            }));

        payload = {
          tipo: "jugar", 
          option: "jugar_set", 
          cartas: cardsToSend
        };
    } else {
        // 3. JUGADA INVÁLIDA (e.g., 1 carta que no es el evento, o 4+ cartas)
        setPlaySetError(`Selección inválida. Juega un Set (${count === 0 ? 'ninguna seleccionada' : `${count} seleccionadas`}) o la carta de Evento 'Look into the Ashes' (1).`);
        return;
    }

    // Envío al backend
    try {
      console.log(`Enviando ${actionName} al backend...`);
      ws.send(JSON.stringify(payload));
      
      // Si es un evento de una sola carta (que se consume), limpiamos la selección aquí.
      if (count === 1) {
        setSelectedCardIds([]);
      }
      
    } catch (error) {
      console.error("Error al enviar la acción de jugar:", error);
      setPlaySetError(`Error de conexión al intentar jugar ${actionName}.`);
    }
  };

  // Estados para ver las primeras cartas del mazo de descarte.  add
  const [privateCards, setPrivateCards] = useState([]);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const selectedCard = localPlayerCards.find(card => selectedCardIds.includes(card.id));

  useEffect(() => {
    if (!partidaId || !token) return;

    let socket; 

    const fetchInitialData = async () => {
      try {
        // ... (PETICIÓN HTTP GET) ...
        const res = await fetch(`http://localhost:8000/partidas/${partidaId}/turno/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        let data;
            
        if (!res.ok) {
          // ... (Manejo de errores HTTP) ...
          let errorMessage = `Error HTTP ${res.status}...`;
          try { const errorData = await res.json(); errorMessage = errorData.detail || errorMessage; } catch (e) { console.error("Error parsing body."); }
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
                    // USAR dataWS.orden_turnos en lugar de data.orden_turnos
                    const jugadoresIniciales = (dataWS.orden_turnos || []).map((p) =>
                      mapPlayerFromBackend(p, localId)
                      );
                    setGamePlayers(jugadoresIniciales);
                    setOrdenTurnos(jugadoresIniciales);
                    setLoading(false);
                    return; // Importante para evitar procesar como estado_actualizado
                }

                if (dataWS.evento === "set_creado") {
                    console.log("EVENTO set_creado RECIBIDO. Data:", dataWS);                   
                    const gameData = dataWS.game;


                    if (!gameData || !gameData.cartas || !Array.isArray(gameData.cartas) || gameData.jugador_id === undefined) {
                        console.error("Error: Evento 'set_creado' recibido sin la estructura esperada (falta 'game.cartas' o 'game.jugador_id').", dataWS);
                        return;
                    }
                    
                    const nuevoSetJugadorId = gameData.jugador_id;
                    const nuevoSetCartasData = gameData.cartas;
                    
                    // Mapeo de cartas para el frontend
                    const nuevoSetCartas = nuevoSetCartasData.map(card => ({
                        id: card.id,
                        title: card.nombre || "card_back", 
                        tipo: card.tipo,
                        zona: "set" 
                    }));

                    // Añadir el nuevo set a los sets del jugador correspondiente en gamePlayers
                    setGamePlayers(prevPlayers => {
                        return prevPlayers.map(p => {
                            if (p.id === nuevoSetJugadorId) {
                                // Se usa 'detectiveSets' para guardar todos los sets
                                const currentSets = p.detectiveSets || [];
                                const updatedSets = [...currentSets, nuevoSetCartas];
                                
                                if (p.id === localPlayerId) {
                                    console.log(`LOG 2 (LOCAL): Nuevo Set agregado. Sets Totales:`, updatedSets.length);
                                }

                                return { 
                                    ...p, 
                                    detectiveSets: updatedSets 
                                };
                            }
                            return p;
                        });
                    });
                    
                    // Detenemos el procesamiento aquí, ya que el evento 'actualizacion' llegará después
                    // para limpiar la mano.
                    return; 
                }
                if (dataWS.evento === "iniciada" || dataWS.evento === "actualizacion" || dataWS.evento === "estado_actualizado") {
                  console.log("Payload recibido (simplificado):", dataWS);
    
                  const payload = dataWS.payload; 

                  // Si por alguna razón crítica no viene, usamos un objeto vacío para evitar crashes.
                  if (!payload) {
                    console.error(`Evento ${dataWS.evento} recibido sin payload.`);
                    return; // Salir si no hay datos.
                  }
                  
                  //Actualizar contexto
                  setGameState((prev) => ({
                    ...prev,
                    turno_actual_id: payload.turno_actual_id ?? prev.turno_actual_id,
                    acciones_disponibles:
                    payload.acciones_disponibles ?? prev.acciones_disponibles,
                  }));

                  // ACTUALIZAR TURNO LOCAL (para sincronización)
                  if (payload.turno_actual_id !== undefined) {
                    setTurnoActualId(payload.turno_actual_id);
                  }
    
                  // Obtener y mapear la mano
                  const rawMano = payload.mano || [];
                  
                  const mappedMano = rawMano.map(card => ({
                    id: card.id,
                    title: card.nombre || "card_back", 
                    tipo: card.tipo,
                    zona: card.zona
                  }));
    
                  // Usar setter del contexto para cartas y estado
                  setLocalPlayerCards(mappedMano); // Esto repone la mano

                  // ACTUALIZAR CARTAS EN ordenTurnos PARA TurnoIndicator
                  setOrdenTurnos((prev) =>
                    prev.map((player) =>
                      player.id === localPlayerId
                      ? { ...player, cards: mappedMano }
                      : player
                    ) 
                  );  

                  setDiscardPileCards(payload.descarte || []); // Esto actualiza el descarte
                
                  setDeckCount(payload.mazo_restante); // Esto actualiza el mazo
    
                  setLocalPlayerId(payload.jugador_id || localPlayerId);
              
                  setTotalCards(payload.mazo_restante) // total de cards en el mazo

                  if (payload.secretos && Array.isArray(payload.secretos)) {
                    // Almacena el objeto secreto directamente para usar su 'nombre' y renderizar la imagen
                    setLocalPlayerSecrets(payload.secretos);
                  }
                  if (payload.mazo_restante !== undefined) {
                    // Solo si es la primera vez (totalCards es 0)
                    setTotalCards(payload.mazo_restante + (payload.descarte?.length || 0)); 
                  } 

                  setTurnoActualId(payload.turno_actual_id);
                  setPlaySetError(null);
                  setSelectedCardIds([]);
                }

                // Manejo de error de jugada (por ejemplo, set inválido)
                else if (dataWS.evento === "jugada_invalida" || dataWS.evento === "error") {
                    const errorMessage = dataWS.detalle || dataWS.mensaje || "La jugada no es válida. Revisa las reglas de combinación de detectives.";
                    setPlaySetError(errorMessage); 
                    // NO limpiamos selectedCardIds para que el usuario pueda corregir su selección.
                }
                // Lógica específica para "cartas_descartadas" o "jugador_conectado"
                else if (dataWS.evento === "cartas_descartadas" || dataWS.evento === "jugador_conectado") {
                  // Solo loguear o manejar eventos mínimos que no requieren actualizar el estado completo.
                  // console.log(`Notificación recibida: ${dataWS.evento}`);
                }
                // Evento: selecciona una al azar y la descarta y luego se le asigna delmazo regular
                else if (dataWS.evento === "salto_turno") {
                  console.log(
                  "[GameScreen] Turno saltado, esperando actualización..."
                );
                }
                // EVENTO: turno_terminado
                else if (dataWS.evento === "turno_terminado") {
                  console.log(
                  "[GameScreen] Turno terminado, esperando actualización..."
                  );
                }
                // Evento: Look into the ashes
                else if (dataWS.evento === "ver_descarte_privado") { // add
                  console.log("Cartas recibidas:", dataWS.payload.cartas);
                  const mappedCartas = dataWS.payload.cartas.map(card => ({
                    id: card.id,
                    title: card.nombre || "card_back", // esto asegura que Card reciba 'title'
                    tipo: card.tipo,
                    zona: "descarte" // o lo que corresponda
                  }));
                  setPrivateCards(mappedCartas); // cartas del descarte
                  setShowDiscardModal(true);
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
  }, [partidaId, token, localPlayerId, setLocalPlayerCards, setDiscardPileCards, setGameState, setOrdenTurnos, setLocalPlayerId, setDeckCount]);

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
      local = { ...local, secretos: localPlayerSecrets, detectiveSets: local.detectiveSets || [],};
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

  const activeSetData = activeSetModalData !== null 
  ? (() => {
      const { setIndex, playerId } = activeSetModalData;
      
      // 1. Encontrar el jugador (local o remoto) por su ID en el estado global
      const targetPlayer = gamePlayers.find(p => p.id === playerId);
      const targetSets = targetPlayer?.detectiveSets || [];

      // 2. Obtener el set con el índice.
      const currentSet = targetSets[setIndex];
      
      // 3. Comprobación crítica
      if (!currentSet || currentSet.length === 0) {
          console.error("Intento de abrir un set que no existe. ID:", playerId, "Index:", setIndex, "Sets disponibles:", targetSets.length);
          return null; 
      }
      
      const cardTitle = currentSet[0]?.title;
      
      // Obtener la URL de la imagen
      const frontImageURL = cardPictures[cardTitle] || cardPictures["card_back"];

      // Devolver el objeto de datos
      return { 
          isSet: true, 
          title: cardTitle ? `Set: ${cardTitle.replace(/_/g, ' ').toUpperCase()}` : "Set de Detective",
          cards: currentSet,
          revealed: true,
          frontImage: frontImageURL, 
      };
  })()
  : null;


  // La función para cerrar el modal (usada en el botón "Volver a jugar" del modal)
  // Aunque "Volver a jugar" navega, tener esta función de cierre es buena práctica.
  const closeGameOverModal = () => setIsGameOverModalOpen(false);
  const openSecretModal = (data) => { if (data?.revealed) setOpenSecret(data); };
  const closeSecretModal = () => setOpenSecret(null);

  // Función para enviar la acción de descarte por WS
  const handleDiscard = () => {
    if (selectedCardIds.length === 0 || !ws) return;

    // Crear el payload con los IDs de las cartas seleccionadas
    const discardPayload = {
      tipo: "descartar_carta",
      cartas: selectedCardIds // Se envían los IDs de las cartas
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
    if (!ws) return;

    if (!hasDiscarded) {
      console.warn("Debe descartar al menos una vez antes de terminar el turno.");
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

  // maneja la carta de evento
  const handlePlayEvent = () => {
    if (!selectedCard || selectedCard.title !== "look_into_the_ashes") {
      console.warn("La carta seleccionada no es 'Look in the Ashes'");
      return;
    }
    if (!ws) return; 

    ws.send(JSON.stringify({
      tipo: "jugar",
      option: "jugar_event",
      carta_id: selectedCard.id
    }));
    // Limpiar selección:
    setSelectedCardIds([]); 
  };




  const secretFrontUrl = cardPictures["varios"];
  const secretBackUrl = cardPictures["secret_back"];

  // useEffect para observar cambios en privateCards
  useEffect(() => {
    console.log("console del useEffect, Cartas privadas actualizadas:", privateCards);
  }, [privateCards]);

  // seEffect para observar cambios en privateCards
  useEffect(() => {
    console.log("Modal de descarte actualizado:", showDiscardModal);
  }, [showDiscardModal]);
  
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
            totalCards={TOTAL_CARDS}
          />
        </div>
        
        {/* Local: mano + secretos + set de detectives*/}
        <div className="sets-independent-position">
          <DetectiveSets 
              sets={local.detectiveSets || []} // Asegúrate de pasar el array
              cardPictures={cardPictures}
              onSetClick={(setIndex) => openSetModal(setIndex, localPlayerId)}          />
        </div>
        
        <div className="local-area" aria-label="Area local">
          <div className="hand-and-secrets">
            <Hand cards={localPlayerCards || []} />
            <div className="local-secrets-horizontal" aria-label="Secretos del jugador">
              
              {(local.secretos || []).slice(0, 3).map((s, i) => {
                const secretName = s.nombre || "varios";
                  // Determinamos la URL de la imagen frontal usando el nombre del secreto
                const secretFrontImage = cardPictures[secretName] || secretFrontUrl;
                return(
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
                )
            })}
            </div>
          </div>
        </div>
      </div>

      {/* Elementos flotantes (Modales, Indicador de Turno, Errores) */}
      <SecretModal item={openSecret} onClose={closeSecretModal} />
      {showDiscardModal && (
          <DiscardModal
            cards={privateCards}
            onClose={() => setShowDiscardModal(false)}
          />
      )}
      <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={gameState.turno_actual_id}
          localPlayerId={localPlayerId}
          onDescartar={handleDiscard}
          onSaltarTurno={handleSkipTurn}
          onTerminarTurno={handleEndTurn}
          onPlaySet={handlePlayAction}
          canPlaySet={selectedCardIds.length > 0} 
          onPlayEvent={handlePlayEvent}
      />
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
      {isGameOverModalOpen && (
        <FinishGameModal onClose={closeGameOverModal} partidaId={partidaId} />
      )}
    </div> 
  );
}
