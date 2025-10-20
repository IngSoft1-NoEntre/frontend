import { useState } from "react";
import React from "react";
import "./DetectiveSets.css";

// Componente individual de la carta
const DetectiveSetCard = ({ card, cardPictures, isSetHovered }) => {
    const title = (card && card.title) || "card_back";
    const img = cardPictures[title] || cardPictures["card_back"] || null;
    
    // Si el set está siendo 'hovered', aplica la clase 'ctrl-active' a la carta.
    const cardClass = `detective-set-card ${isSetHovered ? 'ctrl-active' : ''}`;

    return (
        <div
            className={cardClass}
            style={ img ? { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {} }
            title={title}
            aria-label={`Carta ${title}`}
        />
    );
};

// Representa la visualización de los sets de detectives
export default function DetectiveSets({ sets = [], cardPictures = {}, onSetClick, className="sets-independent-position"}) {
  if (!sets || sets.length === 0) return null;

  // 💡 CAMBIO CLAVE: Rastreamos el índice del set que está activo por hover/CTRL
    const [activeSetIndex, setActiveSetIndex] = useState(null); 

    // Al hacer hover en CUALQUIER carta, activamos todo el set (siIndex)
    const handleSetHover = (setIndex) => {
        setActiveSetIndex(setIndex);
    };

    // Al salir del hover de CUALQUIER carta, desactivamos el set
    const handleSetLeave = () => {
        setActiveSetIndex(null);
    };

    const handleSetClick = (setIndex) => {
      if (onSetClick) {
          onSetClick(setIndex);
      }
    };

    return (
        <div className="detective-sets-container local-sets" aria-label="Sets de detectives">
            {sets.map((set, si) => (
                <div 
                    className="detective-set" 
                    key={si}
                    // 💡 MANEJAMOS EL HOVER A NIVEL DE SET COMPLETO
                    onMouseEnter={() => handleSetHover(si)}
                    onMouseLeave={handleSetLeave}
                    onClick={() => handleSetClick(si)} 
                    role="button"
                    tabIndex={0}
                >
                    {set.map((card, ci) => {
                        // Comprobamos si el índice del set actual (si) coincide con el activo
                        const isSetHovered = activeSetIndex === si; 

                        return (
                            <DetectiveSetCard 
                                key={ci}
                                card={card}
                                cardPictures={cardPictures}
                                isSetHovered={isSetHovered} // Pasamos la bandera al componente de la carta
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
