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

  
  return(
  <div>
    <h2>Game Status: {connectionStatus}</h2>
    <Hand />
  </div>)

};

export default GameScreen;