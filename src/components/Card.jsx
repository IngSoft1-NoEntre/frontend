// Card.jsx (VERSIÓN NUEVA CON CONTEXTO Y ZOOM)

import { useContext, useState, useRef } from "react";
import { GameStateContext } from "../context/GameStateContext";
import "./Card.css";

const Card = ({ cardname, faceUp }) => {

  const { cardPictures } = useContext(GameStateContext);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState("small");
  const cardRef = useRef(null); 

  // --- Lógica de Zoom y Hover ---

  const handleKeyDown = (event) => {
    if (event.ctrlKey && isHovered) {
      setSize("large");
    }
  };

  const handleKeyUp = (event) => {
    if (!event.ctrlKey || !isHovered){
      setSize("small");
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (cardRef.current) {
      cardRef.current.focus();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.blur();
    }
    setSize("small");
  };

  const getDynamicClassName = (isHovered, size) => {
    let className = "cardframe";
    if (size === 'large') {
      className += " cardframe--zoom";
      } else if (isHovered) {
      className += " cardframe--hover";
      }
    return className;
  };
  
  // --- RENDERING ---
  return (
    <div 
      className={getDynamicClassName(isHovered, size)}
      ref={cardRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {faceUp 
        ? <img className="cardpic" src={cardPictures[cardname]} alt={cardname} />
        : <img className="cardpic" src={cardPictures["card_back"]} alt="card_back" />}
    </div>
  );
}

export default Card;