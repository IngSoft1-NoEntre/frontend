import useWebSocket, { ReadyState } from "react-use-websocket";
import { GameStateContext } from "../context/GameStateContext";
import { useEffect, useContext } from "react";

const useGameSocket = () => {
  const { setThePlayerCards } = useContext(GameStateContext);

  //localStorage no funciona si el usuario usa uBlockOrigin
  const partidaId = localStorage.getItem("partidaId");
  const token = localStorage.getItem("token");

  const WS_URL = `ws://localhost:8000/ws/game/${partidaId}?token=${token}`

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    WS_URL,
      {
        share: false,
        shouldReconnect: () => true,
      }
  )


  useEffect(() => {
    console.log("Connected to GameScreen: ", ReadyState[readyState]);
  }, [readyState]);

  //Recibir mensajes
  useEffect(() => {
    console.log(`lastJsonMessage received: ${JSON.stringify(lastJsonMessage, null, 2)}`);
    //reparto de cartas inicial
    //todos los mensajes tiene el campo evento? porque .evento me da null
    if (lastJsonMessage && lastJsonMessage.evento === 'iniciada') {
      const newHand = lastJsonMessage.payload.mano;
      console.log("Hand data received:", newHand);

      const parsedHand = newHand.map(card => ([
        card.id,
        card.nombre
      ]));

      console.log("Hand data parsed:", parsedHand);
      setThePlayerCards(parsedHand);
    }

    //otros mensajes aca

  }, [lastJsonMessage])


  return {
    sendJsonMessage,
    lastJsonMessage,
    readyState,
    connectionStatus: ReadyState[readyState]
  };
};

export default useGameSocket;