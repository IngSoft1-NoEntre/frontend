import React, { useContext,useEffect, useState, useRef} from "react";
// import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import { useParams, useNavigate } from "react-router-dom";

import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Secret from "./Secret";
import Controls from "./Controls";
import FinishGameModal from "./FinishGameModal";

export default function GameScreen() {
  const { partidaId } = useParams();
  const token = localStorage.getItem("token");
  const socketRef = useRef(null); // referencia persistente
  const [wsListo, setWsListo] = useState(false);

  const [estadoDelJuego, setEstadoDelJuego] = useState({
    turno_actual_id: null,
    mazo_restante: 0,
    descarte: [],
    mano: [],
    secretos: [],
    estado_draft: {},
    acciones_disponibles: [],
    jugador_id: null, // si lo necesitás para validar turno
  });

  const [ganadorId, setGanadorId] = useState(null);
  const [mensajeFinal, setMensajeFinal] = useState("");

  const enviarAccion = (accion) => {
    if (wsListo && socketRef.current) {
      socketRef.current.send(JSON.stringify(accion));
    } else {
      console.warn("WebSocket no está listo para enviar acciones");
    }
  };

  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const toggleCardSelection = (cardId) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };


  useEffect(() => {
    const socket = new WebSocket(`ws://localhost:8000/ws/game/${partidaId}?token=${token}`);
    socketRef.current = socket; // guardamos la instancia
    console.log("Estado WebSocket:", socketRef.current?.readyState); // 1 = OPEN

    socket.onopen = () => {
        console.log("WebSocket conectado");
        setWsListo(true); // ahora está listo
    };

    socket.onmessage = (event) => {
      console.log("Mensaje crudo recibido:", event.data);
      const { evento, payload } = JSON.parse(event.data);
      console.log("Evento extraído:", evento);
      switch (evento) {
        case "estado_actualizado":
          console.log("Evento recibido:", evento);
          if (payload) {
              console.log("Payload recibido:", payload);
              setEstadoDelJuego(payload);
          } else {
              console.warn("No se recibió estado_juego en el evento estado_actualizado");
          }
          break;

        case "fin_partida":
          setGanadorId(payload.ganador_id || null);
          setMensajeFinal(payload.mensaje || "La partida ha terminado.");
          break;

        case "cartas_descartadas":
          console.log("Cartas descartadas:", payload);
          break;

        case "conectado":
          console.log("Jugador conectado al juego:", payload);
          break;

        case "iniciada":
            // console.log("Partida ya iniciada:", payload);
        //   setEstadoDelJuego(payload);
          console.log("Partida ya iniciada:", payload);
          if (payload) {
              setEstadoDelJuego(payload);
          } else {
              console.warn("No se recibió estado_juego en el evento iniciada");
          }
          break;

        case "jugador_conectado":
          console.log("Nuevo jugador conectado:", payload);
          break;

        case "evento_jugado":
          console.log("Evento jugado:", payload);
          break;

        case "accion_confirmada":
          console.log("Acción confirmada:", payload.mensaje);
          // Podés mostrar un toast, actualizar UI, etc.
          break;


        case "error":
          alert(payload.mensaje || "Error desconocido");
          break;

        default:
          console.warn("Evento desconocido:", evento);
      }
    };

    socket.onclose = () => {
        console.log("WebSocket cerrado");
        setWsListo(false);
    };

    return () => socket.close();
  }, [partidaId, token]);

  return (
    <div className="game-screen">
      {/* Muestra el mazo y el descarte */}
      <Deck 
        discardCards={estadoDelJuego.descarte}
        deckCount={estadoDelJuego.mazo_restante}
        totalCards={
          estadoDelJuego.mazo_restante 
        } // o estadoDelJuego.total_mazo si lo tenés
      />

      {/* Mano del jugador */}
      <Hand
        partidaId={partidaId}
        estado={estadoDelJuego}
        ganadorId={ganadorId}
        mensajeFinal={mensajeFinal}
        enviarAccion={enviarAccion}
        wsListo={wsListo}
        selectedCardIds={selectedCardIds}
        toggleCardSelection={toggleCardSelection}
      />
    </div>
  );
}
