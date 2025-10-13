import { useState, useEffect } from "react";
import useGameSocket from './useGameSocket';
import Hand from './Hand'


const GameScreen = () => {

  //socket
  const { 
    sendJsonMessage, 
    lastJsonMessage, 
    readyState,
    connectionStatus 
  } = useGameSocket();

  

  //mano del jugador
  const [thePlayerCards, setThePlayerCards] = useState([
    [14, "detective_satterthwaite"],
    [7, "detective_poirot"],
    [8, "detective_poirot"],
    [10, "detective_pyne"],
    [9, "detective_poirot"],
  ]);



  return(
  <div>
    <h2>Game Status: {connectionStatus}</h2>
    <Hand cards={thePlayerCards}/>
  </div>)

};

export default GameScreen;