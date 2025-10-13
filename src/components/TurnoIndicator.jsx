import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import "./TurnoIndicator.css";

const TurnoIndicator = ({
  partidaId,
  onAccionPrincipal,
  onAccionSecundaria,
}) => {
  const [turnoActualId, setTurnoActualId] = useState(null);
  const [ordenTurnos, setOrdenTurnos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  const jugadorActualId = parseInt(decoded.sub);
  const wsRef = useRef(null);

  // Conectar al WebSocket del juego
  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/game/${partidaId}?token=${token}`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("[TurnoIndicator] WebSocket conectado");
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[TurnoIndicator] Mensaje recibido:", data);

        // Manejar diferentes eventos del backend
        if (data.evento === "conectado") {
          console.log("[TurnoIndicator] Conexión establecida");
        } else if (
          data.evento === "iniciada" ||
          data.evento === "estado_actualizado"
        ) {
          // Estado completo del juego desde serializar_estado_juego
          const payload = data.payload;

          if (payload.turno_actual_id) {
            const turnoAnterior = turnoActualId;
            setTurnoActualId(payload.turno_actual_id);
            setIsLoading(false);

            // Reproducir sonido si cambió el turno y ahora es tu turno
            if (
              turnoAnterior !== null &&
              payload.turno_actual_id === jugadorActualId &&
              turnoAnterior !== jugadorActualId
            ) {
              reproducirSonidoTurno();
            }
          }

          // Orden de turnos desde el backend
          if (payload.orden_turnos) {
            setOrdenTurnos(payload.orden_turnos);
          }
        } else if (data.evento === "turno_cambiado") {
          // Evento específico de cambio de turno
          const turnoAnterior = turnoActualId;
          setTurnoActualId(data.payload.turno_actual_id);

          if (
            data.payload.turno_actual_id === jugadorActualId &&
            turnoAnterior !== jugadorActualId
          ) {
            reproducirSonidoTurno();
          }
        } else if (data.evento === "error") {
          setError(data.mensaje);
        }
      } catch (err) {
        console.error("[TurnoIndicator] Error procesando mensaje:", err);
      }
    };

    socket.onerror = (error) => {
      console.error("[TurnoIndicator] Error WebSocket:", error);
      setError("Error de conexión");
    };

    socket.onclose = () => {
      console.log("[TurnoIndicator] WebSocket cerrado");
      setError("Conexión perdida. Reconectando...");

      // Intentar reconectar después de 3 segundos
      setTimeout(() => {
        console.log("[TurnoIndicator] Intentando reconectar...");
        // El useEffect se volverá a ejecutar al cambiar partidaId
      }, 3000);
    };

    // Cleanup al desmontar
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [partidaId, token]);

  // Cargar orden de turnos inicial desde API REST (fallback)
  useEffect(() => {
    const cargarOrdenTurnos = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/partidas/${partidaId}/turno/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setTurnoActualId(data.jugador_en_turno);
          setOrdenTurnos(data.orden_turnos);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[TurnoIndicator] Error cargando turno:", error);
      }
    };

    cargarOrdenTurnos();
  }, [partidaId, token]);

  // Encontrar el jugador actual en el orden
  const turnoActualJugador = ordenTurnos.find((j) => j.id === turnoActualId);
  const esMiTurno = turnoActualId === jugadorActualId;

  if (isLoading) {
    return (
      <div className="turno-indicator loading-state">
        <div className="spinner-small"></div>
        <span>Cargando información de turnos...</span>
      </div>
    );
  }

  return (
    <div className={`turno-indicator ${esMiTurno ? "mi-turno" : "esperando"}`}>
      {/* Mensaje de error de conexión */}
      {error && (
        <div className="turno-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* Header con turno actual */}
      <div className="turno-header">
        <div className="turno-mensaje">
          {esMiTurno ? (
            <>
              <span className="turno-icono animate-pulse">🎯</span>
              <span className="turno-texto">
                <strong>¡Tu turno!</strong>
              </span>
            </>
          ) : turnoActualJugador ? (
            <>
              <span className="turno-icono">👤</span>
              <span className="turno-texto">
                Turno de <strong>{turnoActualJugador.nombre}</strong>
              </span>
            </>
          ) : (
            <>
              <span className="turno-icono">⏳</span>
              <span className="turno-texto">Esperando turno...</span>
            </>
          )}
        </div>
      </div>

      {/* Lista de orden de turnos */}
      {ordenTurnos.length > 0 && (
        <div className="orden-turnos">
          <div className="orden-title">Orden de juego:</div>
          <div className="jugadores-list">
            {ordenTurnos.map((jugador, index) => (
              <div
                key={jugador.id}
                className={`jugador-item ${
                  jugador.id === turnoActualId ? "activo" : ""
                } ${jugador.id === jugadorActualId ? "yo" : ""}`}
              >
                <span className="jugador-numero">{index + 1}</span>
                <span className="jugador-nombre">
                  {jugador.nombre}
                  {jugador.id === jugadorActualId && " (Tú)"}
                </span>
                {jugador.id === turnoActualId && (
                  <span className="jugador-indicador">▶</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Área de acciones con botones */}
      <div className="turno-acciones">
        {!esMiTurno && (
          <div className="reloj-arena">
            <div className="hourglass">
              <div className="hourglass-top"></div>
              <div className="hourglass-middle"></div>
              <div className="hourglass-bottom"></div>
            </div>
          </div>
        )}

        <div className={`botones-container ${!esMiTurno ? "disabled" : ""}`}>
          <button
            className="btn-accion btn-principal"
            disabled={!esMiTurno}
            onClick={onAccionPrincipal}
          >
            Acción Principal
          </button>

          <button
            className="btn-accion btn-secundaria"
            disabled={!esMiTurno}
            onClick={onAccionSecundaria}
          >
            Acción Secundaria
          </button>
        </div>
      </div>
    </div>
  );
};

export default TurnoIndicator;
