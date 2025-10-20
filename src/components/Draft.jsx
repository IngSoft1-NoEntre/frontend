import React, { useState } from "react";
import Card from "./Card";
import "./Draft.css";

/**
 * Draft - Muestra las 3 cartas disponibles del draft
 * Las cartas NO son seleccionables, solo tienen hover/zoom
 */
const Draft = ({ cards = [] }) => {
  const [hoveredCardId, setHoveredCardId] = useState(null);

  console.log("[Draft] Renderizando con", cards.length, "cartas:", cards);

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

            console.log(
              "[Draft] Renderizando carta:",
              card.id,
              card.title || card.nombre
            );

            return (
              <div
                key={card.id}
                className={`draft-card ${isHovered ? "hovered" : ""}`}
                onMouseEnter={() => setHoveredCardId(card.id)}
                onMouseLeave={() => setHoveredCardId(null)}
                title={card.nombre || card.title}
              >
                {/* ✅ USAR LAS PROPS CORRECTAS: cardname, faceUp, cardId */}
                <Card
                  cardname={card.title || card.nombre || "card_back"}
                  faceUp={true} // ✅ Las cartas del draft están boca arriba
                  cardId={card.id}
                  isSelectable={false} // ✅ NO seleccionable
                  isSelected={false} // ✅ Nunca seleccionada
                  onSelect={null} // ✅ Sin callback
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
