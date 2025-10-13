// DiscardPile.jsx (AJUSTADO PARA EL NUEVO COMPONENTE CARD)

import React from "react";
import "./DiscardPile.css";
import Card from "./Card"; 

//Representa el mazo descarte
export default function DiscardPile({ cards = [], currentCount = 0, totalCount = 64 }) {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
  const countText = `${currentCount} / ${totalCount}`;

  // 1. EXTRAER LA CLAVE: Usamos 'title' de GameScreen.jsx como cardname
  const cardKeyName = topCard ? topCard.title : null; // Asumimos que 'title' es la clave

  return (
    <div className="discard-pile">
      <div className="discard-pile-graphic">
        {cardKeyName ? (
          <Card 
            cardname={cardKeyName} //visualiza la imagen
            faceUp={true} 
          /> 
        ) : (
          <div className="discard-pile-empty-slot"></div>
        )}
      </div>
      
      <div className="discard-pile-count">{countText}</div>
    </div>
  );
}