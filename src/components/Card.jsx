import { useContext, useState, useRef } from "react";
import { GameStateContext } from "../context/GameStateContext";
import "./Card.css";

const Card = ({ 
    cardname, 
    faceUp, 
    cardId, 
    isSelectable = false,
    isSelected = false,  
    onSelect,
    className          
}) => {
  // console.log("Renderizando carta:", cardname);

  if (!cardname) {
    //Se establece una className para determinar que la carta
    //fue seleccionada y descartada(efecto de desaparicion)
    return <div className="card-spacer" />;
  }

  const { cardPictures } = useContext(GameStateContext);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState("small");
  const cardRef = useRef(null);
  const isFocusable = faceUp;
  
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

  // Lógica de clases dinámicas
  const getDynamicClassName = (isHovered, size, isSelected, isSelectable) => {
    let className = "cardframe";
    
    // Agrega la clase de SELECCIONADO si aplica
    if (isSelected) {
        className += " cardframe--selected"; 
    }
    // Agrega la clase de SELECCIONABLE si aplica
    if (isSelectable) {
        className += " cardframe--selectable"; 
    }
    
    // Lógica de zoom y hover
    if (size === 'large') {
      className += " cardframe--zoom";
    } else if (isHovered && !isSelected) { 
      // Si está seleccionada, el efecto de hover puede ser menos pronunciado
      className += " cardframe--hover";
    }
    return className;
  };

  // Función para manejar el clic (Selección)
  const handleClick = () => {
    if (isSelectable && onSelect) {
      onSelect();
    }
  };
  
  return (
    <div 
      // Pasar las props de selección al cálculo de clases
      className={`${getDynamicClassName(isHovered, size, isSelected, isSelectable)} ${className || ''}`}
      ref={cardRef}
      tabIndex={isFocusable ? 0 : -1} 
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
     >
      {faceUp 
        ? <img className="cardpic" src={cardPictures[cardname]} alt={cardname} />
        : <img className="cardpic" src={cardPictures["card_back"]} alt="card_back" />}
    </div>
  );
}

export default Card;