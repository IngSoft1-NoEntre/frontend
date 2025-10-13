import { useContext, useState, useRef } from "react";
import { GameStateContext } from "../context/GameStateContext";
import "./Card.css";

//representa la carta individual
//uso: Card toma 2 props
// <Card cardname={"nombre de la carta"} faceUP={true} />
// si "nombre de la carta" esta en el dic de imagenes (en el archivo GameStateProvider), muestra esa imagen
// si faceUP es false, muestra el dorso de la carta "card_back"

const Card = ({ cardname, faceUp }) => {

  const { cardPictures } = useContext(GameStateContext);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState("small");
  const cardRef = useRef(null); 

  //zoom+ cuando se presiona ctrl
  const handleKeyDown = (event) => {
    if (event.ctrlKey && isHovered) {
      setSize("large");
    }
  };

  //zoom- cuando se suelta ctrl
  const handleKeyUp = (event) => {
    if (!event.ctrlKey || !isHovered){
      setSize("small");
    }
  };

  //condicion para el zoom: poner mouse arriba de la carta
  const handleMouseEnter = () => {
  setIsHovered(true);
    if (cardRef.current) {
      cardRef.current.focus();
    }
  };

  //condicion para perder el zoom: sacar el mouse de la carta
  const handleMouseLeave = () => {
    setIsHovered(false);
      if (cardRef.current) {
      cardRef.current.blur();
    }
    setSize("small");
  };

  //para aplicar un estilo css dinamico y dar la ilusion de zoom
  const getDynamicClassName = (isHovered, size) => {
    let className = "cardframe";
    if (size === 'large') {
      className += " cardframe--zoom";
      } else if (isHovered) {
      className += " cardframe--hover";
      }
    return className;
  };

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