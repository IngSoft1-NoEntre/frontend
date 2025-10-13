import "./Hand.css";
import Card from "./Card";
import { GameStateContext } from "../context/GameStateContext";
import { useContext } from "react";

/** muestra las 6 cartas del jugador local (faceUp) */
export default function Hand( {cards} ) {
  const { ThePlayerCards } = useContext(GameStateContext);
  console.log("the player cards are: ", cards);

  return (
    <div className="hand" role="region" aria-label="Mano del jugador">
      {ThePlayerCards.map(([i, c]) => <Card key={i} cardname={c} faceUp={true}/>)}
    </div>
  );
}