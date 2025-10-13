import useWebSocket, { ReadyState } from "react-use-websocket";
import { GameStateContext } from "../context/GameStateContext";
import { useEffect, useContext, useState } from "react";

const useGameSocket = () => {
  const { setThePlayerCards } = useContext(GameStateContext);

  //localStorage no funciona si el usuario usa uBlockOrigin
  const partidaId = localStorage.getItem("partidaId");
  const token = localStorage.getItem("token");

  const [socketUrl, setSocketUrl] = useState(`ws://localhost:8000/ws/game/${partidaId}?token=${token}`);
  
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
      {
        share: false,
        shouldReconnect: () => true,
        onOpen: () => console.log('GameSocket opened'),
      }
  )

  useEffect(() => {
    if (!lastJsonMessage) return;

    const msg = lastJsonMessage.payload;
    const eventType = lastJsonMessage.evento;

    console.log(`[GameSocket] incoming event: ${eventType}`);

    switch (eventType) {
      case 'iniciada':
        const newHand = msg.mano;
        console.log("Hand data received:", newHand);
        const parsedHand = newHand.map(card => ([
          card.id,
          card.nombre
        ]));
        console.log("Hand data parsed:", parsedHand);
        setThePlayerCards(parsedHand);
        break;
                
      case 'turno_cambiado':
        break;
      default:
        console.warn(`[GameSocket] Unkwown event type: ${eventType}`, msg);
        break;
    }

    }, [lastJsonMessage]);


  return {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
    connectionStatus: ReadyState[readyState]
  };
};

export default useGameSocket;