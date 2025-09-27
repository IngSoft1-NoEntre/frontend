import React from "react";
import "./Deck.css";
import Card from "./Card";
import CardBack from "./CardBack";

//Representar el contenedor de los mazos en el juego.
export default function Deck({ discardTop = { title: "Descartada" } }) {
  return (
    <div className="deck">
      <div className="deck-stack">
        {/* Mazo regular */}
        <div className="deck-pile">
          <CardBack count={64}/>
        </div>

        {/* Pila de descarte como carta */}
        <div className="discard-pile">
          <Card small faceUp={true} carta={{ title: discardTop.title }} />
        </div>
      </div>
    </div>
  );
}
