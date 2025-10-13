import { useContext } from "react";
import { GameStateContext } from "../context/GameStateContext";
import useGameSocket from './useGameSocket';
import Hand from './Hand'


const GameScreen = () => {
  //game context
  const { ThePlayerCards } = useContext(GameStateContext);

  //socket
  const { 
    sendJsonMessage, 
    lastJsonMessage, 
    readyState,
    connectionStatus 
  } = useGameSocket();


  return(
  <div>
    <h2>Game Status: {connectionStatus}</h2>
    <Hand cards={ThePlayerCards}/>
  </div>)

};

export default GameScreen;