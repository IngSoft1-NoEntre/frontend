// Importa hooks, para manejar estado, navegación y parámetros de la URL
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./LobbyContainer.css"; // Estilos personalizados para el lobby
import { jwtDecode } from "jwt-decode";
import lobby from  "../assets/img/lobby.png";

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
  //Estado para errores
  const [lobbyErrorMsg, setLobbyErrorMsg] = useState("");

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
        setLobbyErrorMsg("");
      }
      // Si el backend indica que la partida fue iniciada,
      // redirige automáticamente al componente GameScreen usando el ID de la partida
      if (data.evento === "iniciada") {
          console.log("partida iniciada, redirigiendo...")
          console.log("Estado", data.partida?.estado)
          navigate(`/juego/${partidaId}`);
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
  }, [partidaId, navigate, token]);

  // Acción para iniciar la partida (solo disponible para el owner)
  const handleIniciar = async () => {
    setLobbyErrorMsg("");
    // Validación mínima de jugadores en el frontend (opcional, el backend lo valida)
    if (partida && partida.min_jugadores && jugadores.length < partida.min_jugadores) {
         setLobbyErrorMsg(`Faltan jugadores para iniciar. Mínimo requerido: ${partida.min_jugadores}.`);
         return;
    }

    try {
      const response = await fetch(`http://localhost:8000/partidas/${partidaId}/iniciar`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",  // Indica que se envía JSON
          "Authorization": `Bearer ${token}`, // Token para autenticación
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorDetail = errorData.detail || "No se pudo iniciar la partida por un error desconocido del servidor.";
        console.error("Error al iniciar la partida:", errorData.detail || errorData);
        setLobbyErrorMsg(errorDetail);
        return;
      }

      console.log("Solicitud para iniciar partida enviada correctamente");

    } catch (error) {
      console.error("Error de red al iniciar la partida:", error);
    }
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
          <p><strong>Nombre de la partida:</strong> {partida.nombre}</p>
        </>
      )}

      {lobbyErrorMsg && <div className="error-banner">⚠️ {lobbyErrorMsg}</div>}

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
        <button onClick={handleIniciar}>Iniciar partida</button>
      )}
    </div>
  );
};

export default LobbyContainer;