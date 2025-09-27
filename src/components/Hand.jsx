import React from "react";
import "./Hand.css";
import Card from "./Card";

/** muestra las 6 cartas del jugador local (faceUp) */
export default function Hand({ cards = [] }) {
  const view = cards.concat(Array(Math.max(0, 6-cards.length)).fill({ title: "?" })).slice(0,6);
  return (
    <div className="hand" role="region" aria-label="Mano del jugador">
      {view.map((c,i)=> <Card key={i} carta={c} faceUp={true} small={true} />)}
    </div>
  );
}
