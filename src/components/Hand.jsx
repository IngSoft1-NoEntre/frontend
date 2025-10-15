import React, { useContext } from "react";
import "./Hand.css";
import Card from "./Card";
import { GameStateContext } from "../context/GameStateContext";

/** muestra las 6 cartas del jugador local (faceUp) */
export default function Hand({ cards = [] }) {
  // Obtener funciones y estados del contexto
  const { toggleCardSelection, selectedCardIds } = useContext(GameStateContext); 
  
  // Lógica de relleno de mano

  // Crear cartas de relleno con IDs ÚNICOS y temporales
  const cardsToFill = Array(Math.max(0, 6 - cards.length)).fill(0).map((_, index) => ({ 
    title: "?",
    id: `filler-${index}`
  }));

  // Unir cartas reales y de relleno
  const view = cards.concat(cardsToFill).slice(0, 6); 
  
  return (
    <div className="hand" role="region" aria-label="Mano del jugador">
      {view.map((c,i)=> {
        const isFiller = c.id && c.id.toString().startsWith('filler');
        const cardId = c.id;

        return (
          <Card 
            key={cardId || i}
            cardname={c.title} 
            faceUp={true}
            cardId={cardId}
            isSelectable={!isFiller} 
            isSelected={cardId && selectedCardIds.includes(cardId)}
            onSelect={!isFiller ? () => toggleCardSelection(cardId) : undefined}
          />
        );
      })}
    </div>
  );
}