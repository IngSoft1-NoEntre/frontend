import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./GameList.css";

const GameList = () => {
  const [partidas, setPartidas] = useState([]);
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unirseCargando, setUnirseCargando] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar partidas del backend
  const cargarPartidas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/partidas", {
        headers: {
          "Content-Type": "application/json",  // Indica que se envía JSON
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Solo mostrar partidas disponibles
        const partidasDisponibles = data.filter(
          (partida) => partida.estado === "disponible"
        );
        setPartidas(partidasDisponibles);
      }
    } catch (error) {
      console.error("Error:", error);
      // Usar datos de ejemplo en caso de error (fallback)
      setPartidas([
        {
          id: 1,
          nombre: "Partida de Ejemplo",
          estado: "disponible",
          tipo: "publica",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar partidas al montar el componente
  useEffect(() => {
    cargarPartidas();

    // Actualizar cada 10 segundos
    const interval = setInterval(cargarPartidas, 10000);

    return () => clearInterval(interval);
  }, []);

  // Seleccionar partida
  const seleccionarPartida = (partida) => {
    setPartidaSeleccionada(partida);
  };

  // Unirse a partida seleccionada
  const unirseAPartida = async () => {
    if (!partidaSeleccionada) {
      alert("Por favor selecciona una partida primero.");
      return;
    }

    setUnirseCargando(true);

    try {
      const response = await fetch(
        `http://localhost:8000/partidas/${partidaSeleccionada.id}/unirse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // Cuerpo con datos necesarios (según backend)
          body: JSON.stringify({ jugador: "UsuarioActual" }),
        }
      );

      // Parsing de la respuesta
      const text = await response.text();
      console.log("Texto recibido:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Respuesta no es JSON válido:", err);
        alert("Error inesperado: el servidor no devolvió datos válidos.");
        return;
      }

      console.log("Respuesta parseada:", data);

      // Manejo de respuestas
      if (response.ok && data.lobby_id) {
        console.log("Redirigiendo a:", `/lobby/${data.lobby_id}`);
        navigate(`/lobby/${data.lobby_id}`);
      } else if (data.detail === "Jugador ya en la partida") {
        console.log("Jugador ya estaba en la partida. Redirigiendo igual.");
        navigate(`/lobby/${partidaSeleccionada.id}`);
      } else if (response.ok) {
        // Fallback para respuestas exitosas sin lobby_id
        console.log("Partida seleccionada:", data);
        navigate(`/lobby/${partidaSeleccionada.id}`);
      } else {
        // Usar mensaje de error como fallback
        alert(data.detail || data.mensaje || "No se pudo unir a la partida");
      }

      // Recargar lista para actualizar contadores
      cargarPartidas();
      setPartidaSeleccionada(null);
    } catch (error) {
      console.error("Error al unirse:", error);
      alert("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setUnirseCargando(false);
    }
  };

  return (
    <div className="card list-card">
      <h2>Partidas Disponibles</h2>

      <div className="partidas-container">
        {isLoading ? (
          <div className="loading">Cargando partidas...</div>
        ) : partidas.length === 0 ? (
          <div className="no-partidas">
            <p>No hay partidas disponibles</p>
            <small>Crea una nueva partida para empezar</small>
          </div>
        ) : (
          <div className="partidas-list">
            {partidas.map((partida) => (
              <div
                key={partida.id}
                className={`partida-item ${
                  partidaSeleccionada?.id === partida.id ? "selected" : ""
                }`}
                onClick={() => seleccionarPartida(partida)}
              >
                <div className="partida-header">
                  <h3 className="partida-nombre">{partida.nombre}</h3>
                  <span className="partida-estado">{partida.estado}</span>
                </div>

                <div className="partida-info">
                  <div className="info-item">
                    <span className="label">ID:</span>
                    <span className="value">{partida.id}</span>
                  </div>

                  {/* Información del tipo de partida */}
                  <div className="info-item">
                    <span className="label">Tipo:</span>
                    <span className="value">
                      {partida.tipo === "privada" ? "Privada 🔒" : "Pública 🌍"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón para unirse */}
      <div className="acciones">
        <button
          className="btn-cta"
          onClick={unirseAPartida}
          disabled={!partidaSeleccionada || unirseCargando}
        >
          {unirseCargando
            ? "Uniéndose..."
            : partidaSeleccionada
            ? `Unirse a "${partidaSeleccionada.nombre}"`
            : "Selecciona una partida"}
        </button>

        <button
          className="btn-secondary"
          onClick={cargarPartidas}
          disabled={isLoading || unirseCargando}
        >
          {isLoading ? "Actualizando..." : "🔄 Actualizar"}
        </button>
      </div>

      {/* Info de debug */}
      {process.env.NODE_ENV === "development" && partidaSeleccionada && (
        <div className="debug-info">
          <small>
            Partida seleccionada: ID {partidaSeleccionada.id} - Tipo:{" "}
            {partidaSeleccionada.tipo || "N/A"}
          </small>
        </div>
      )}
    </div>
  );
};

export default GameList;
