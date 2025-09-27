import React from "react";
import "./Card.css";

//representa la carta individual
export default function Carta({ carta = {}, faceUp = true, small = false }) {
  const title = carta.title || "Carta";
  return (
    <div className={`carta ${small ? 'small' : ''} ${faceUp ? 'faceup' : 'facedown'}`}>
      {faceUp 
        ? <div className="carta__title">{title}</div> 
        : <div className="carta__back"></div>}
    </div>
  );
}
