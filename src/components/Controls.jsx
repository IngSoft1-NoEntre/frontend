import React, { useContext } from "react"; 
import { GameStateContext } from "../context/GameStateContext"; 
import "./Controls.css";

export default function Controls({ onDiscard, onEndTurn, canEndTurn, onPlayEvent, selectedCard}) {
    // console.log("selectedCard:", selectedCard);
    const { 
        selectedCardIds,      
        discardPileCards,     
        deckCount, // 64
        TOTAL_CARDS 
    } = useContext(GameStateContext);

    // Cantidad de cartas a descartar y reponer
    const cardsToDraw = selectedCardIds.length;
    const hasSelectedCards = cardsToDraw > 0;  //no hace falta

    // Contadores Proyectados (G2: Lo que pasará al presionar el botón)
    const projectedDeckCount = deckCount - cardsToDraw;
    const currentDiscardCount = discardPileCards.length;
    const projectedDiscardCount = currentDiscardCount + cardsToDraw;

    // Lógica para deshabilitar el botón
    const canDrawCards = projectedDeckCount >= 0; 
    // const isDisabled = !hasSelectedCards || !canDrawCards;  //no hace falta

    // Lógica para el texto del botón   //no hace falta.
    // const buttonText = hasSelectedCards 
    //     ? `Descartar ${cardsToDraw} Carta(s)` 
    //     : 'Descartar';

    return (
        <div className="controls">
            {/* <button 
                className="btn secondary"
                onClick={onDiscard}
                disabled={isDisabled}
            >
                {buttonText}
            </button> */}
            {/*<button className="btn medium">Saltar turno</button>*/}
            <button className="btn primary"
                onClick={onEndTurn}
                // 'disabled={!true}' es 'disabled=false' (habilitado)
                // 'disabled={!false}' es 'disabled=true' (deshabilitado)
                disabled={!canEndTurn}
            > 
                Finalizar turno
            </button>
            {/* {selectedCard?.title === "look_into_the_ashes" && (
                <button className="btn event" onClick={onPlayEvent}>
                    Jugar "Look in the Ashes"
                </button>
            )} */}

            {selectedCard?.title === "look_into_the_ashes" ? (
            <button className="btn event" onClick={onPlayEvent}>
                Jugar "Look into the Ashes"
            </button>
            ) : selectedCard ? (
            <button className="btn discard" onClick={onDiscard}>
                Descartar "{selectedCard.title}"
            </button>
            ) : null}
        </div>
    );
}