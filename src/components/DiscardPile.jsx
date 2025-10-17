import React from "react";
import "./DiscardPile.css";
import Card from "./Card"; 

//Representa el mazo descarte
export default function DiscardPile({ cards = [], currentCount = 0, totalCount = 64 }) {
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null;
  const countText = `${currentCount} / ${totalCount}`;

  //consumo la carta con el nombre del campo que viene desde backend 
  const cardKeyName = topCard ? topCard.nombre : null;

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