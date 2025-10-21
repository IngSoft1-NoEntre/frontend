import React from "react";
import "./Deck.css";
import DeckPile from "./DeckPile";
import DiscardPile from "./DiscardPile";

//Representar el contenedor de los mazos en el juego.
export default function Deck({ discardCards = [], deckCount, totalCards }) {
  const discardCount = discardCards.length;
  
  return (
    <div className="deck">
      <div className="deck-stack">
        {/* Mazo regular */}
        <div className="deck-pile-game">
          <DeckPile currentCount={deckCount} totalCount={totalCards} />
        </div>

        {/* Pila de descarte como carta */}
        <div className="discard-pile-game">
          <DiscardPile cards={discardCards} currentCount={discardCount} totalCount={totalCards}/>
        </div>
      </div>
    </div>
  );
}
