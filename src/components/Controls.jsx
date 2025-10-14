import React, { useContext } from "react"; // <-- Importamos useContext
import { GameStateContext } from "../context/GameStateContext"; // <-- Importamos el Contexto
import "./Controls.css";

export default function Controls() {
    const { discardOneCard, discardPileCards, TOTAL_CARDS } = useContext(GameStateContext);

    const deckCount = TOTAL_CARDS - discardPileCards.length;
    const isDeckEmpty = deckCount <= 0;


    const handleDiscard = () => {
        if (!isDeckEmpty) {
            discardOneCard();
        }
    };

    return (
        <div className="controls">
            {/*<button className="btn primary">Finalizar turno</button>*/}
            {/*<button className="btn medium">Saltar turno</button>*/}
            <button 
                className="btn secondary"
                onClick={handleDiscard} // <-- Conexión de la lógica
                disabled={isDeckEmpty} // <-- Deshabilita si el mazo está vacío
            >
                {isDeckEmpty ? 'Mazo Vacío' : 'Descartar'}
            </button>
        </div>
    );
}