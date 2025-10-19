import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD
=======
import { jwtDecode } from "jwt-decode";
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
import "./GameList.css";

const GameList = () => {
  const [partidas, setPartidas] = useState([]);
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unirseCargando, setUnirseCargando] = useState(false);
<<<<<<< HEAD
=======
  const [error, setError] = useState(null);

>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Cargar partidas del backend
  const cargarPartidas = async () => {
    setIsLoading(true);
<<<<<<< HEAD
    try {
      const response = await fetch("http://localhost:8000/partidas", {
        headers: {
          "Content-Type": "application/json",  // Indica que se envía JSON
=======
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/partidas", {
        headers: {
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
<<<<<<< HEAD
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
=======
        // Mostrar TODAS las partidas (disponibles e iniciadas)
        setPartidas(data);
      } else {
        setError("Error al cargar partidas del servidor");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  // Cargar partidas al montar el componente
  useEffect(() => {
    cargarPartidas();

    // Actualizar cada 10 segundos
    const interval = setInterval(cargarPartidas, 10000);
=======
  // Cargar partidas al montar y actualizar cada 5 segundos
  useEffect(() => {
    cargarPartidas();

    // Actualizar cada 5 segundos
    const interval = setInterval(cargarPartidas, 5000);
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego

    return () => clearInterval(interval);
  }, []);

  // Seleccionar partida
  const seleccionarPartida = (partida) => {
    setPartidaSeleccionada(partida);
<<<<<<< HEAD
=======
    setError(null);
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
  };

  // Unirse a partida seleccionada
  const unirseAPartida = async () => {
    if (!partidaSeleccionada) {
<<<<<<< HEAD
      alert("Por favor selecciona una partida primero.");
=======
      setError("Selecciona una partida primero");
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
      return;
    }

    setUnirseCargando(true);
<<<<<<< HEAD
=======
    setError(null);
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego

    try {
      const response = await fetch(
        `http://localhost:8000/partidas/${partidaSeleccionada.id}/unirse`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
<<<<<<< HEAD
          // Cuerpo con datos necesarios (según backend)
=======
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
          body: JSON.stringify({ jugador: "UsuarioActual" }),
        }
      );

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
    } finally {
      setUnirseCargando(false);
    }
  };

  return (
    <div className="card list-card">
      <h2>Partidas Disponibles</h2>

<<<<<<< HEAD
      <div className="partidas-container">
        {isLoading ? (
          <div className="loading">Cargando partidas...</div>
=======
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
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
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
<<<<<<< HEAD
                }`}
=======
                } ${partida.estado === "iniciada" ? "iniciada" : ""}`}
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
                onClick={() => seleccionarPartida(partida)}
              >
                <div className="partida-header">
                  <h3 className="partida-nombre">{partida.nombre}</h3>
<<<<<<< HEAD
                  <span className="partida-estado">{partida.estado}</span>
=======
                  <span className={`partida-estado ${partida.estado}`}>
                    {partida.estado === "disponible"
                      ? "Disponible"
                      : "Iniciada"}
                  </span>
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
                </div>

                <div className="partida-info">
                  <div className="info-item">
                    <span className="label">ID:</span>
                    <span className="value">{partida.id}</span>
                  </div>

<<<<<<< HEAD
                  {/* Información del tipo de partida */}
                  <div className="info-item">
                    <span className="label">Tipo:</span>
                    <span className="value">
                      {partida.tipo === "privada" ? "Privada 🔒" : "Pública 🌍"}
                    </span>
                  </div>
=======
                  {partida.estado === "iniciada" && (
                    <div className="info-item estado-juego">
                      <span className="value">🎮 En curso</span>
                    </div>
                  )}
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
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
<<<<<<< HEAD

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
=======
      </div>
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
    </div>
  );
};

<<<<<<< HEAD
export default GameList;
=======
export default GameList;
>>>>>>> origin/feature_ING-14_implementar_interfaz_grafica_juego
