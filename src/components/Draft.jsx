import React, { useState } from "react";
import Card from "./Card";
import "./Draft.css";

/**
 * Draft - Muestra las 3 cartas disponibles del draft
 * Las cartas NO son seleccionables, solo tienen hover/zoom
 */
const Draft = ({ cards = [] }) => {
  const [hoveredCardId, setHoveredCardId] = useState(null);

  return (
    <div className="draft-container">
      <div className="draft-label">Draft</div>
      <div className="draft-cards">
        {cards.length === 0 ? (
          <div className="draft-empty">
            <span>—</span>
          </div>
        ) : (
          cards.map((card) => {
            const isHovered = hoveredCardId === card.id;
            return (
              <div
                key={card.id}
                className={`draft-card ${isHovered ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                title={card.nombre || card.title}
              >
                <Card
                  title={card.title || card.nombre || "card_back"}
                  id={card.id}
                  isSelected={false} // ✅ Nunca seleccionada
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Draft;
