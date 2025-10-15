import React, { useContext,useEffect, useState, useRef} from "react";
// import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import { useParams, useNavigate } from "react-router-dom";
import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Secret from "./Secret";
import Controls from "./Controls";
import FinishGameModal from "./FinishGameModal";
import GameSocket from "./GameSocket";

export default function GameScreen() {
  const { partidaId } = useParams();
  const token = localStorage.getItem("token");
  const [wsListo, setWsListo] = useState(false);
  const  { enviarAccion } = GameSocket

  const [estadoDelJuego, setEstadoDelJuego] = useState({
    turno_actual_id: null,
    mazo_restante: 0,
    descarte: [],
    mano: [],
    secretos: [],
    estado_draft: {},
    acciones_disponibles: [],
    jugador_id: null, // si lo necesitás para validar turno
  });

  const [ganadorId, setGanadorId] = useState(null);
  const [mensajeFinal, setMensajeFinal] = useState("");



  const [selectedCardIds, setSelectedCardIds] = useState([]);

  const toggleCardSelection = (cardId) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };


  

  return (
    <div className="game-screen">
      {/* Muestra el mazo y el descarte */}
      <Deck 
        discardCards={estadoDelJuego.descarte}
        deckCount={estadoDelJuego.mazo_restante}
        totalCards={
          estadoDelJuego.mazo_restante 
        } // o estadoDelJuego.total_mazo si lo tenés
      />

      {/* Mano del jugador */}
      <Hand
        partidaId={partidaId}
        estado={estadoDelJuego}
        ganadorId={ganadorId}
        mensajeFinal={mensajeFinal}
        enviarAccion={enviarAccion}
        wsListo={wsListo}
        selectedCardIds={selectedCardIds}
        toggleCardSelection={toggleCardSelection}
      />
    </div>
  );
}
