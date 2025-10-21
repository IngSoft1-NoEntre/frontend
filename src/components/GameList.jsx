import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./GameList.css";

const GameList = () => {
  const [partidas, setPartidas] = useState([]);
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unirseCargando, setUnirseCargando] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar partidas del backend
  const cargarPartidas = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/partidas", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Mostrar TODAS las partidas (disponibles e iniciadas)
        setPartidas(data);
      } else {
        setError("Error al cargar partidas del servidor");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar partidas al montar y actualizar cada 5 segundos
  useEffect(() => {
    cargarPartidas();

    // Actualizar cada 5 segundos
    const interval = setInterval(cargarPartidas, 5000);

    return () => clearInterval(interval);
  }, []);

  // Seleccionar partida
  const seleccionarPartida = (partida) => {
    setPartidaSeleccionada(partida);
    setError(null);
  };

  // Unirse a partida seleccionada
  const unirseAPartida = async () => {
    if (!partidaSeleccionada) {
      setError("Selecciona una partida primero");
      return;
    }

    setUnirseCargando(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/partidas/${partidaSeleccionada.id}/unirse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jugador: "UsuarioActual" }),
        }
      );

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (err) {
        setError("Error: el servidor no devolvió datos válidos");
        return;
      }

      if (response.ok && data.lobby_id) {
        navigate(`/lobby/${data.lobby_id}`);
      } else if (data.detail === "Jugador ya en la partida") {
        navigate(`/lobby/${partidaSeleccionada.id}`);
      } else if (response.ok) {
        navigate(`/lobby/${partidaSeleccionada.id}`);
      } else {
        setError(data.detail || data.mensaje || "No se pudo unir a la partida");
      }
    } catch (error) {
      setError("Error de conexión. Intenta nuevamente");
    } finally {
      setUnirseCargando(false);
    }
  };

  return (
    <div className="card list-card">
      <h2>Partidas Disponibles</h2>

      {/* Mostrar errores sin alert */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="partidas-container">
        {isLoading && partidas.length === 0 ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Cargando partidas...</span>
          </div>
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
                } ${partida.estado === "iniciada" ? "iniciada" : ""}`}
                onClick={() => seleccionarPartida(partida)}
              >
                <div className="partida-header">
                  <h3 className="partida-nombre">{partida.nombre}</h3>
                  <span className={`partida-estado ${partida.estado}`}>
                    {partida.estado === "disponible"
                      ? "Disponible"
                      : "Iniciada"}
                  </span>
                </div>

                <div className="partida-info">
                  <div className="info-item">
                    <span className="label">ID:</span>
                    <span className="value">{partida.id}</span>
                  </div>

                  {partida.estado === "iniciada" && (
                    <div className="info-item estado-juego">
                      <span className="value">🎮 En curso</span>
                    </div>
                  )}
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
      </div>
    </div>
  );
};

export default GameList;
