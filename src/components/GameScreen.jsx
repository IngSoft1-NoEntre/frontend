import React, { useContext,useEffect, useState, useRef} from "react";
import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import { useParams, useNavigate } from "react-router-dom";
import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Secret from "./Secret";
import Controls from "./Controls";
import FinishGameModal from "./FinishGameModal";
import useGameSocket from "./useGameSocket";

export default function GameScreen() {
  const { partidaId } = useParams();
  const { estadoDelJuego } = useContext(GameStateContext);
  const { enviarAccion, wsListo } = useGameSocket()
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
