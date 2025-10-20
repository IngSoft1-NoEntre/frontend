/* filepath: /home/agustin/CS/ingSoft/2025/Proyecto/frontend/src/components/CardStack.jsx */
import React, { useState, useContext } from "react";
import Card from "./Card";
import "./CardStack.css";
import { GameStateContext } from "../context/GameStateContext";

const CardStack = ({ cards = [], label = null }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // ✅ Obtener del contexto
  const { selectedDraftCardIds = [], setSelectedDraftCardIds } =
    useContext(GameStateContext);

  if (cards.length === 0) {
    return (
      <div className="card-stack-empty">
        <span>—</span>
      </div>
    );
  }

  const handleCardClick = (cardId) => {
    if (!setSelectedDraftCardIds) {
      console.warn("[CardStack] setSelectedDraftCardIds no disponible");
      return;
    }

    console.log("[CardStack] Carta clickeada:", cardId);

    setSelectedDraftCardIds((prev) => {
      if (prev.includes(cardId)) {
        console.log("[CardStack] Deseleccionando carta:", cardId);
        return prev.filter((id) => id !== cardId);
      } else {
        console.log("[CardStack] Seleccionando carta:", cardId);
        return [...prev, cardId];
      }
    });
  };

  return (
    <div className="card-stack-container">
      {label && <div className="card-stack-label">{label}</div>}

      <div
        className={`card-stack ${isExpanded ? "expanded" : ""}`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {cards.map((card, index) => {
          const offset = isExpanded ? index * 60 : index * 20;
          const isSelected = selectedDraftCardIds.includes(card.id);

          return (
            <div
              key={card.id}
              className="card-stack-item"
              style={{
                left: `${offset}px`,
                zIndex: index,
              }}
            >
              <Card
                cardname={card.title || card.nombre || "card_back"}
                faceUp={true}
                cardId={card.id}
                isSelectable={true}
                isSelected={isSelected}
                onSelect={() => handleCardClick(card.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardStack;
