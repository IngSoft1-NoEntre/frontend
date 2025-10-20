import React, { useContext } from "react"; 
import { GameStateContext } from "../context/GameStateContext"; 
import "./Controls.css";

export default function Controls({ onDiscard, onEndTurn, canEndTurn, onPlaySet, canPlaySet }) {
    const { 
        selectedCardIds,      
        discardPileCards,     
        deckCount, 
        TOTAL_CARDS
    } = useContext(GameStateContext);

    // Cantidad de cartas a descartar y reponer
    const cardsToDraw = selectedCardIds.length;
    const hasSelectedCards = cardsToDraw > 0;

    // Contadores Proyectados
    const projectedDeckCount = deckCount - cardsToDraw;
    const currentDiscardCount = discardPileCards.length;
    const projectedDiscardCount = currentDiscardCount + cardsToDraw;

    // Lógica para deshabilitar el botón
    const canDrawCards = projectedDeckCount >= 0; 
    const isDisabled = !hasSelectedCards || !canDrawCards;

    // Lógica para el texto del botón
    const buttonText = hasSelectedCards 
        ? `Descartar ${cardsToDraw} Carta(s)` 
        : 'Descartar';

    return (
        <div className="controls">
            <button 
                className="btn secondary"
                onClick={onDiscard}
                disabled={isDisabled}
            >
                {buttonText}
            </button>
            <button 
                className={`btn primary game ${canPlaySet ? 'active-set' : ''}`}
                onClick={onPlaySet}
                disabled={!canPlaySet} 
            > 
                Jugar
            </button>
            {/*<button className="btn medium">Saltar turno</button>*/}
            <button className="btn primary"
                onClick={onEndTurn}
                // 'disabled={!true}' es 'disabled=false' (habilitado)
                // 'disabled={!false}' es 'disabled=true' (deshabilitado)
                disabled={!canEndTurn}
            > 
                Finalizar turno
            </button>
        </div>
    );
}