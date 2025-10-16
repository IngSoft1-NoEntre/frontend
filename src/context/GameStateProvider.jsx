import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { GameStateContext } from "./GameStateContext";

import card_00 from "../assets/Cartas/00-help.png";
import card_01 from "../assets/Cartas/01-card_back.png";
import card_02 from "../assets/Cartas/02-murder_escapes.png";
import card_03 from "../assets/Cartas/03-secret_murderer.png";
import card_04 from "../assets/Cartas/04-secret_accomplice.png";
import card_05 from "../assets/Cartas/05-secret_front.png";
import card_06 from "../assets/Cartas/06-secret_back.png";
import card_07 from "../assets/Cartas/07-detective_poirot.png";
import card_08 from "../assets/Cartas/08-detective_marple.png";
import card_09 from "../assets/Cartas/09-detective_satterthwaite.png";
import card_10 from "../assets/Cartas/10-detective_pyne.png";
import card_11 from "../assets/Cartas/11-detective_brent.png";
import card_12 from "../assets/Cartas/12-detective_tommyberesford.png";
import card_13 from "../assets/Cartas/13-detective_tuppenceberesford.png";
import card_14 from "../assets/Cartas/14-detective_quin.png";
import card_15 from "../assets/Cartas/15-detective_oliver.png";
import card_16 from "../assets/Cartas/16-Instant_notsofast.png";
import card_17 from "../assets/Cartas/17-event_cardsonthetable.png";
import card_18 from "../assets/Cartas/18-event_anothervictim.png";
import card_19 from "../assets/Cartas/19-event_deadcardfolly.png";
import card_20 from "../assets/Cartas/20-event_lookashes.png";
import card_21 from "../assets/Cartas/21-event_cardtrade.png";
import card_22 from "../assets/Cartas/22-event_onemore.png";
import card_23 from "../assets/Cartas/23-event_delayescape.png";
import card_24 from "../assets/Cartas/24-event_earlytrain.png";
import card_25 from "../assets/Cartas/25-event_pointsuspicions.png";
import card_26 from "../assets/Cartas/26-devious_blackmailed.png";
import card_27 from "../assets/Cartas/27-devious_fauxpas.png";

const TOTAL_CARDS = 64;

const GameStateProvider = ({ children }) => {
  const [localPlayerCards, setLocalPlayerCards] = useState([
    { id: 101, title: "not_so_fast" },
    { id: 102, title: "cards_off_the_table" },
    { id: 103, title: "hercule_poirot" },
    { id: 104, title: "miss_marple" },
    { id: 105, title: "cards_off_the_table" },
    { id: 106, title: "dead_card_folly" },
  ]);
  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [playersCache, setPlayersCache] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const wsRef = useRef(null);

  // FIXED: Get partidaId from useParams instead of localStorage
  const { partidaId } = useParams();

  //Estado actualizado de todo el juego
  const [gameState, setGameState] = useState({
    turno_actual_id: null,
    mazo_restante: 0,
    descarte: [],
    mano: [],
    secretos: [],
    estado_draft: {},
    acciones_disponibles: [],
    jugador_id: null, // si lo necesitás para validar turno
  });

  //setGameState({ ...gameState, turno_actual_id: 5 }); // IGNORE

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

  // FIXED: Add back the fetchPlayerInfo function (simplified)
  const fetchPlayerInfo = async (playerId) => {
    // Check cache first
    if (playersCache[playerId]) {
      return playersCache[playerId];
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/jugadores/${playerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const playerData = await response.json();

        const playerInfo = {
          id: playerData.id,
          nombre: playerData.nombre,
          fecha_nacimiento: playerData.fecha_nacimiento,
          secretos: [false, false, false],
          cards: playerId === localPlayerId ? localPlayerCards : [],
        };

        // Cache the player info
        setPlayersCache((prev) => ({
          ...prev,
          [playerId]: playerInfo,
        }));

        return playerInfo;
      }
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
    }

    // Fallback if fetch fails
    return {
      id: playerId,
      nombre: `Jugador ${playerId}`,
      fecha_nacimiento: "1990-01-01",
      secretos: [false, false, false],
      cards: playerId === localPlayerId ? localPlayerCards : [],
    };
  };

  /*const fetchPlayerInfo = async (playerId) => {
    if (playersCache[playerId]) {
      return playersCache[playerId];
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8000/jugadores/${playerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const playerData = await response.json();

        setPlayersCache((prev) => ({
          ...prev,
          [playerId]: {
            id: playerData.id,
            nombre: playerData.nombre,
            fecha_nacimiento: playerData.fecha_nacimiento,
            secretos: [false, false, false],
            cards: playerId === localPlayerId ? localPlayerCards : [],
          },
        }));

        return playersCache[playerId];
      }
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
    }

    return {
      id: playerId,
      nombre: `Jugador ${playerId}`,
      fecha_nacimiento: "1990-01-01",
      secretos: [false, false, false],
      cards: playerId === localPlayerId ? localPlayerCards : [],
    };
  };*/

  // WebSocket useEffect
  useEffect(() => {
    if (!partidaId || !localPlayerId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const wsUrl = `ws://localhost:8000/ws/game/${partidaId}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[GameStateProvider] Connected to game WebSocket");
      setIsConnected(true);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[GameStateProvider] Received:", data);

        switch (data.evento) {
          case "conectado":
            console.log("[GameStateProvider] Connected to game:", data.mensaje);
            break;

          case "iniciada":
          case "estado_actualizado":
            if (data.payload) {
              setGameState(data.payload);

              if (data.payload.mano && Array.isArray(data.payload.mano)) {
                const cardsWithIds = data.payload.mano.map((card, index) => ({
                  id: card.id || 1000 + index,
                  title: card.nombre || card.title,
                  type: card.tipo || "Unknown",
                }));
                setLocalPlayerCards(cardsWithIds);
              }
            }
            break;

          // FIXED: Add back jugador_conectado handling
          case "jugador_conectado":
            if (data.game?.jugador_id) {
              const jugadorId = data.game.jugador_id;
              console.log(
                "[GameStateProvider] Processing jugador_conectado for:",
                jugadorId
              );

              // Only add if we don't already have this player
              const existingPlayer = ordenTurnos.find(
                (p) => p.id === jugadorId
              );
              if (!existingPlayer) {
                const playerInfo = await fetchPlayerInfo(jugadorId);
                setOrdenTurnos((prev) => {
                  console.log("[GameStateProvider] Adding player:", playerInfo);
                  return [...prev, playerInfo];
                });
              } else {
                console.log(
                  "[GameStateProvider] Player already exists:",
                  jugadorId
                );
              }
            }
            break;

          case "turno_terminado":
            console.log("[GameStateProvider] Turno terminado");
            if (data.payload) {
              setGameState((prev) => ({
                ...prev,
                turno_actual_id: data.payload.turno_actual_id,
                // Update any other game state from payload
                ...data.payload,
              }));
              console.log(
                "[GameStateProvider] Nuevo turno:",
                data.payload.turno_actual_id
              );
            }
            break;

          // FIXED: Handle turn skipping response
          case "salto_turno":
          case "turno_saltado":
            console.log("[GameStateProvider] Turno saltado");
            if (data.payload) {
              setGameState((prev) => ({
                ...prev,
                turno_actual_id: data.payload.turno_actual_id,
                ...data.payload,
              }));
              console.log(
                "[GameStateProvider] Nuevo turno después de saltar:",
                data.payload.turno_actual_id
              );
            }
            break;

          case "actualizacion":
            if (data.payload) {
              setGameState(data.payload);
            } else {
              console.error("[GameStateProvider] No payload in actualizacion");
            }
            break;

          case "error":
            console.error(
              "[GameStateProvider] Game error:",
              data.payload?.mensaje || data.mensaje
            );
            break;

          default:
            console.log("[GameStateProvider] Unhandled event:", data.evento);
            break;
        }
      } catch (error) {
        console.error("[GameStateProvider] Error parsing message:", error);
      }
    };

    ws.onclose = () => {
      console.log("[GameStateProvider] WebSocket connection closed");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("[GameStateProvider] WebSocket error:", error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [partidaId, localPlayerId]);

  // FIXED: Add back mock data fallback
  useEffect(() => {
    let mockTimeout;

    if (isConnected && ordenTurnos.length === 0) {
      mockTimeout = setTimeout(() => {
        console.log(
          "[GameStateProvider] No real players received, using mock data"
        );

        // Use simple mock data based on the working browser session
        const mockPlayers = [
          {
            id: 4,
            nombre: "Sergio",
            fecha_nacimiento: "2000-03-03",
            secretos: [false, false, false],
            cards: 4 === localPlayerId ? localPlayerCards : [],
          },
          {
            id: 5,
            nombre: "El Cuate",
            fecha_nacimiento: "2005-09-14",
            secretos: [false, false, false],
            cards: 5 === localPlayerId ? localPlayerCards : [],
          },
          {
            id: 6,
            nombre: "Flores",
            fecha_nacimiento: "2003-09-15",
            secretos: [false, false, false],
            cards: 6 === localPlayerId ? localPlayerCards : [],
          },
        ];

        setOrdenTurnos(mockPlayers);

        // Set initial game state if not already set
        if (!gameState.turno_actual_id) {
          setGameState((prev) => ({
            ...prev,
            turno_actual_id: localPlayerId || 6,
            mazo_restante: 50,
          }));
        }
      }, 3000);
    }

    return () => {
      if (mockTimeout) clearTimeout(mockTimeout);
    };
  }, [isConnected, ordenTurnos.length, localPlayerId]);

  const sendGameAction = (action) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          ...action,
          jugador_id: localPlayerId,
        })
      );
      return true;
    }
    return false;
  };

  const handleDescartar = () => {
    if (!sendGameAction({ tipo: "descartar_carta" })) {
      //recordar cambiar jugar_carta por descartar_carta en todas partes
      console.log("[MOCK] descartar carta ejecutado");
    }
  };

  const handleSaltarTurno = () => {
    if (!sendGameAction({ tipo: "saltar_turno" })) {
      console.log("[MOCK] Saltar turno ejecutado");
    }
  };

  const handleTerminarTurno = () => {
    if (!sendGameAction({ tipo: "terminar_turno" })) {
      console.log("[MOCK] Terminar turno ejecutado");
    }
  };

  const [cardPictures, setCardPictures] = useState({
    help: card_00,
    card_back: card_01,
    murder_escapes: card_02,
    youre_the_murderer: card_03,
    varios: card_04,
    secret_front: card_05,
    secret_back: card_06,
    hercule_poirot: card_07,
    miss_marple: card_08,
    mr_satterthwaite: card_09,
    detective_pyne: card_10,
    detective_brent: card_11,
    detective_tommyberesford: card_12,
    detective_tuppenceberesford: card_13,
    detective_quin_wildcard: card_14,
    detective_oliver: card_15,
    not_so_fast: card_16,
    cards_off_the_table: card_17,
    another_victim: card_18,
    dead_card_folly: card_19,
    look_into_the_ashes: card_20,
    card_trade: card_21,
    and_then_there_was_one_more: card_22,
    delay_the_murderer_space: card_23,
    early_train: card_24,
    point_your_suspicions: card_25,
    blackmailed: card_26,
    faux_pas: card_27,
  });

  const [discardPileCards, setDiscardPileCards] = useState([]);

  const drawCardFromDeck = (existingCards) => {
    const remainingCards = Object.keys(cardPictures).filter((key) => {
      const cardId = parseInt(key.split("_")[1]);
      return !existingCards.some((card) => card.id === cardId);
    });

    if (remainingCards.length === 0) {
      return null;
    }

    const randomCardKey =
      remainingCards[Math.floor(Math.random() * remainingCards.length)];
    const cardId = parseInt(randomCardKey.split("_")[1]);

    return {
      id: cardId,
      title: randomCardKey,
      type: "Unknown",
    };
  };

  const toggleCardSelection = (cardId) => {
    setSelectedCardIds((prevSelected) => {
      if (prevSelected.includes(cardId)) {
        return prevSelected.filter((id) => id !== cardId);
      } else {
        return [...prevSelected, cardId];
      }
    });
  };

  const discardSelectedCards = () => {
    setDiscardPileCards((prev) => [
      ...prev,
      ...localPlayerCards.filter((card) => selectedCardIds.includes(card.id)),
    ]);
    setLocalPlayerCards((prev) =>
      prev.filter((card) => !selectedCardIds.includes(card.id))
    );
    setSelectedCardIds([]);
  };

  const deckCount =
    gameState?.mazo_restante || TOTAL_CARDS - discardPileCards.length;

  const contextValue = {
    localPlayerCards,
    cardPictures,
    discardPileCards,
    discardSelectedCards,
    toggleCardSelection,
    selectedCardIds,
    TOTAL_CARDS,
    deckCount,

    gameState,
    ordenTurnos,
    isConnected,
    localPlayerId,
    playersCache,

    handleDescartar,
    handleSaltarTurno,
    handleTerminarTurno,
    sendGameAction,
    fetchPlayerInfo, // Add this back to context
  };

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateProvider;
