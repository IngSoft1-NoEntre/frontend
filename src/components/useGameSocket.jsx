import React, { useContext,useEffect, useState, useRef} from "react";
import { GameStateContext } from "../context/GameStateContext";

export default function useGameSocket() {
  const socketRef = useRef(null); // referencia persistente
  const [wsListo, setWsListo] = useState(false);
  const { setEstadoDelJuego } = useContext(GameStateContext);

  const token = localStorage.getItem("token");
  const partidaId = localStorage.getItem("partidaId");

  const enviarAccion = (accion) => {
    if (wsListo && socketRef.current) {
      socketRef.current.send(JSON.stringify(accion));
    } else {
      console.warn("WebSocket no está listo para enviar acciones");
    }
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

    return {
      enviarAccion,
      wsListo
    }

}
