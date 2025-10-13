import "./Hand.css";
import Card from "./Card";

/** muestra las 6 cartas del jugador local (faceUp) */
export default function Hand( {cards} ) {

  console.log(cards);

  return (
    <div className="hand" role="region" aria-label="Mano del jugador">
      {cards.map(([i, c]) => <Card key={i} cardname={c} faceUp={true}/>)}
    </div>
  );
}