import React from "react";
import "./DeckPile.css";

//Representa el mazo regular
export default function DeckPile({ currentCount, totalCount = 45 }) {
  const countText = `${currentCount} / ${totalCount}`;

  return (
    <div className="deck-pile">
      <div className="deck-pile-graphic"></div>
      <div className="deck-pile-count">{countText}</div>
    </div>
  );
}
