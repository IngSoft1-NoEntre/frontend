// Importa hooks, para manejar estado, navegación y parámetros de la URL
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LobbyContainer.css"; // Estilos personalizados para el lobby
import { jwtDecode } from "jwt-decode";
import lobby from "../assets/img/lobby.png";

const LobbyContainer = () => {
  // Obtiene el ID de la partida desde la URL
  const { partidaId } = useParams();

  // Recupera el token JWT desde localStorage para autenticación
  const token = localStorage.getItem("token");
  const decoded = jwtDecode(token);
  console.log(jwtDecode(token));

  const jugadorId = decoded.sub;
  // Hook para redirigir a otra ruta
  const navigate = useNavigate();

  // Estado local para la lista de jugadores conectados
  const [jugadores, setJugadores] = useState([]);

  // Estado local para los datos de la partida (nombre, estado, owner_id, etc.)
  const [partida, setPartida] = useState(null);

  // Conexión al WebSocket cuando se monta el componente
  useEffect(() => {
    // Establece conexión con el backend usando el ID de la partida
    const url = `ws://localhost:8000/ws/lobby/${partidaId}?token=${token}`;
    const socket = new WebSocket(url);
    // Maneja los mensajes recibidos desde el backend
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Respuesta del backend-LobbyContainer:', data);

      // Si el evento recibido indica una actualización del lobby, 
      // actualiza los datos de la partida y los jugadores
      if (data.evento === "actualizacion_lobby") {
        setJugadores(data.partida.jugadores); // Actualiza la lista de jugadores
        setPartida(data.partida);     // Actualiza los datos de la partida
      }      
    };

    // Mensaje en consola si el WebSocket se cierra
    socket.onclose = () => {
      console.log("WebSocket cerrado");
    };

    // Cierra la conexión cuando se desmonta el componente
    return () => {
      socket.close();
    };
  }, [partidaId, navigate]);

  // Acción para iniciar la partida (solo disponible para el owner)
  const handleIniciar = async () => {
    await fetch(`http://localhost:8000/partidas/${partidaId}/iniciar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    // El backend enviará un mensaje por WebSocket que redirige al juego
    navigate(`/juego/${partidaId}`);
  };

  // Renderiza la interfaz del lobby
  return (
    <div className="lobby"
      style={{
        backgroundImage: `url(${lobby})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
      }}
    >
      <h2>Lobby de la partida</h2>

      {/* Muestra los datos de la partida si están disponibles */}
      {partida && (
        <>
          <p><strong>Nombre:</strong> {partida.nombre}</p>
        </>
      )}

      {/* Lista de jugadores conectados */}
      <ul>
        {jugadores.map((j, i) => (
        <li key={i}>
            {j.nombre} {j.id === partida.owner_id && <span>👑</span>}
        </li>
        ))}
      </ul>

      {/* Botón para iniciar la partida,solo visible si el jugador es owner */}
      {partida?.owner_id == jugadorId && (
        <button className="iniciar-partida" onClick={handleIniciar}>Iniciar partida</button>
      )}
    </div>
  );
};

export default LobbyContainer;
