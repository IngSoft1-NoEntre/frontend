// GameList.jsx
import { useState } from "react"; // agregar useEffect si incorporo refresh aut
import "./GameList.css";

const GameList = () => {
  const [partidas, setPartidas] = useState([]);
  const [partidaSeleccionada, setPartidaSeleccionada] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar partidas del backend
  const cargarPartidas = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/partidas");
      if (response.ok) {
        const data = await response.json();
        // Solo mostrar partidas que no han iniciado
        const partidasDisponibles = data.filter(
          (partida) => partida.estado === "esperando"
        );
        setPartidas(partidasDisponibles);
      } else {
        console.error("Error al cargar partidas");
        // Datos de ejemplo para desarrollo
        setPartidas([
          {
            id: 1,
            nombre: "Partida de Principiantes",
            mincantjugadores: 2,
            maxcantjugadores: 4,
            jugadores_actuales: 1,
            creador: "JugadorPro",
            estado: "esperando",
          },
          {
            id: 2,
            nombre: "Mesa Rápida",
            mincantjugadores: 2,
            maxcantjugadores: 6,
            jugadores_actuales: 2,
            creador: "CartasLoca",
            estado: "esperando",
          },
          {
            id: 3,
            nombre: "Torneo Amistoso",
            mincantjugadores: 3,
            maxcantjugadores: 5,
            jugadores_actuales: 3,
            creador: "MasterCards",
            estado: "esperando",
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      // Usar datos de ejemplo en caso de error
      setPartidas([
        {
          id: 1,
          nombre: "Partida de Ejemplo",
          mincantjugadores: 2,
          maxcantjugadores: 4,
          jugadores_actuales: 1,
          creador: "Usuario1",
          estado: "esperando",
        },
        {
          id: 2,
          nombre: "Partida de Principiantes",
          mincantjugadores: 2,
          maxcantjugadores: 4,
          jugadores_actuales: 1,
          creador: "JugadorPro",
          estado: "esperando",
        },
        {
          id: 3,
          nombre: "Mesa Rápida",
          mincantjugadores: 2,
          maxcantjugadores: 6,
          jugadores_actuales: 2,
          creador: "CartasLoca",
          estado: "esperando",
        },
        {
          id: 4,
          nombre: "Torneo Amistoso",
          mincantjugadores: 3,
          maxcantjugadores: 5,
          jugadores_actuales: 3,
          creador: "MasterCards",
          estado: "esperando",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* Cargar partidas al montar el componente
  useEffect(() => {
    cargarPartidas();

    // Actualizar cada 10 segundos
    const interval = setInterval(cargarPartidas, 10000);

    return () => clearInterval(interval);
  }, []);*/

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

    try {
      const response = await fetch(
        `http://localhost:4000/partidas/${partidaSeleccionada.id}/unirse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Aquí podrías enviar datos del jugador si es necesario
          body: JSON.stringify({ jugador: "UsuarioActual" }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Partida seleccionada!:", data);
        alert(`Redirigiendo a "${partidaSeleccionada.nombre}"`);

        // Recargar lista para actualizar contadores
        cargarPartidas();
        setPartidaSeleccionada(null);
      } else {
        const error = await response.json();
        alert(error.mensaje || "No se pudo unir a la partida");
      }
    } catch (error) {
      console.error("Error al unirse:", error);
      alert("Error de conexión. Inténtalo de nuevo.");
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
                </div>

                <div className="partida-info">
                  <div className="info-item">
                    <span className="label">Creador:</span>
                    <span className="value">{partida.creador}</span>
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
          disabled={!partidaSeleccionada || isLoading}
        >
          {partidaSeleccionada
            ? `Unirse a "${partidaSeleccionada.nombre}"`
            : "Selecciona una partida"}
        </button>

        <button
          className="btn-secondary"
          onClick={cargarPartidas}
          disabled={isLoading}
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default GameList;
