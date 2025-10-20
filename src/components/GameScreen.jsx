import React, { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useParams } from "react-router-dom"
import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import Player from "./Player";    
import Deck from "./Deck";
import Hand from "./Hand";         
import Secret from "./Secret";     
import Controls from "./Controls";
import FinishGameModal from "./FinishGameModal";
import SecretModal from "./SecretModal";
import TurnoIndicator from "./TurnoIndicator";

/**
 * GameScreen dinámico: acepta `players`
 * Filtra entradas vacías / comentadas y distribuye la UI según la cantidad:
 * 2 -> local + 1 arriba
 * 3 -> local + 1 izquierda + 1 derecha
 * 4 -> local + 1 izquierda + 1 derecha + 1 arriba
 * 5 -> local + 1 left + 1 right + 2 arriba
 * 6 -> local + 2 left + 2 right + 1 arriba
 */

const TOTAL_CARDS_FIXED = 64;

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

  // ESTADOS SECUNDARIOS
  const [loading, setLoading] = useState(true);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [openSecret, setOpenSecret] = useState(null);
  const [localPlayerSecrets, setLocalPlayerSecrets] = useState([
    { nombre: "varios" }, 
    { nombre: "varios" }, 
    { nombre: "varios" }
  ]);

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
                
                if (dataWS.evento === "iniciada" || dataWS.evento === "actualizacion" || dataWS.evento === "estado_actualizado") {
                  console.log("Payload recibido (simplificado):", dataWS);
    
                  // 1. CONFÍA en dataWS.payload, que es lo que envían tus logs.
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

                  // OBTENER Y MAPEAR LA MANO
                  const rawMano = payload.mano || [];

                  const mappedMano = rawMano.map(card => ({
                    id: card.id,
                    title: card.nombre || "card_back", 
                    tipo: card.tipo,
                    zona: card.zona
                  }));
    
                  // 3. USAR SETTERS DEL CONTEXTO PARA CARTAS Y ESTADO
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

                  if (payload.secretos && Array.isArray(payload.secretos)) {
                    // Almacena el objeto secreto directamente para usar su 'nombre' y renderizar la imagen
                    setLocalPlayerSecrets(payload.secretos);
                  }

                  setTurnoActualId(payload.turno_actual_id);
                }
                  // Lógica específica para "cartas_descartadas" o "jugador_conectado"
                else if (dataWS.evento === "cartas_descartadas" || dataWS.evento === "jugador_conectado") {
                  // Solo loguear o manejar eventos mínimos que no requieren actualizar el estado completo.
                  console.log(`Notificación recibida: ${dataWS.evento}`);
                }
                // EVENTO: salto_turno
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
  
  // DISTRIBUCIÓN DE JUGADORES
  const list = gamePlayers.filter(Boolean);

  let local = list.find((p) => p.isLocal);
  let others = list.filter((p) => !p.isLocal);

  if (local) {
      // ASIGNAR LOS SECRETOS LOCALES (actualizados por WS o estado inicial)
      local = { ...local, secretos: localPlayerSecrets };
  } else {
    local = list.length > 0 ? list.find(p => p.id === localPlayerId) || list[0] : emptyPlayer;
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
        // NOTA: El backend responderá con "estado_actualizado" que contendrá la mano repuesta
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

        {/* Local: mano + secretos */}
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
        <SecretModal item={openSecret} onClose={closeSecretModal} />
        <div>
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={gameState.turno_actual_id}
          localPlayerId={localPlayerId}
          onDescartar={handleDiscard}
          onSaltarTurno={handleSkipTurn}
          onTerminarTurno={handleEndTurn}
        />
        </div>
      </div>
        {isGameOverModalOpen && (
        <FinishGameModal onClose={closeGameOverModal} partidaId={partidaId} />
        )}
    </div>
  );
}
