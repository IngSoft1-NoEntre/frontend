import useWebSocket, { ReadyState } from "react-use-websocket";
import { useEffect } from "react";

const useGameSocket = () => {
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
        console.log(`Got a new message: ${JSON.stringify(lastJsonMessage, null, 2)}`);
        
    }, [lastJsonMessage]);



    return {
        sendJsonMessage,
        lastJsonMessage,
        readyState,
        connectionStatus: ReadyState[readyState]
    };
};

export default useGameSocket;