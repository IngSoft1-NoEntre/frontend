import React, { useState, useEffect, useCallback, useContext } from "react";
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
    TOTAL_CARDS: TOTAL_CARDS_CONTEXT,
    cardPictures
  } = useContext(GameStateContext);

// ESTADOS PRINCIPALES (No relacionados con cartas)
  const [ws, setWs] = useState(null);
  const [gamePlayers, setGamePlayers] = useState([]); 
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [turnoActualId, setTurnoActualId] = useState(null);
  const [localPlayerSecrets, setLocalPlayerSecrets] = useState([true, true, true]); 

  // ESTADOS SECUNDARIOS
  const [loading, setLoading] = useState(true);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [openSecret, setOpenSecret] = useState(null);

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
                console.log("Mensaje WS recibido:", dataWS);

                if (dataWS.evento === "conectado") {
                    const localId = dataWS.jugador_id;
                    setLocalPlayerId(localId); 
                    setGamePlayers(data.orden_turnos.map(p => mapPlayerFromBackend(p, localId)));
                    setLoading(false);
                }
                
                if (dataWS.evento === "iniciada" || dataWS.evento === "estado_actualizado" || dataWS.evento === "actualizacion") {
                    const payload = dataWS.payload || {};

                    // Obtener la mano del backend
                    const rawMano = payload.mano || [];

                    // Mapear para asegurar que tengan la clave 'title'
                    const mappedMano = rawMano.map(card => ({
                      id: card.id,
                      title: card.nombre || "card_back",
                      tipo: card.tipo,
                      zona: card.zona
                    }));
                    
                    // USAR SETTERS DEL CONTEXTO PARA CARTAS
                    setLocalPlayerCards(mappedMano);
                    setDiscardPileCards(payload.restante || []); // AQUI CAMBIE: payload.descarte POR payload.restante para que incialice en 0 el discarPile
                    
                    //  ACTUALIZAR SECRETOS LOCALES
                    if (payload.secretos_local) { 
                        setLocalPlayerSecrets(payload.secretos_local);
                    }
                    
                    setTurnoActualId(payload.turno_actual_id);
                }
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
  }, [partidaId, token, setLocalPlayerCards, setDiscardPileCards]);

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
              {(local.secretos || []).slice(0, 3).map((s, i) => (
                <Secret
                  key={i}
                  revealed={Boolean(s)}
                  isLocal={true}
                  data={{
                    title: `Secreto ${i + 1}`,
                    frontImage: secretFrontUrl,
                    backImage: secretBackUrl,
                  }}
                  onOpen={(d) => openSecretModal({ ...d, revealed: true })}
                />
              ))}
            </div>
          </div>
        </div>
        <SecretModal item={openSecret} onClose={closeSecretModal} />
        <Controls />
      </div>
      {isGameOverModalOpen && (
        <FinishGameModal
          onClose={closeGameOverModal}
        />
      )}
    </div>
  );
}
