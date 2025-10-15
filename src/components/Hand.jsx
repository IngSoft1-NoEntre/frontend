import React from "react";
import "./Hand.css";
import Card from "./Card";

/** Muestra las 6 cartas del jugador local (faceUp) */
export default function Hand({ partidaId, estado, enviarAccion, selectedCardIds, toggleCardSelection }) {
  const esMiTurno = estado.turno_actual_id === estado.jugador_id;

  const handleDescartar = (cartasIds) => {
    enviarAccion({ tipo: "descartar_carta", cartas: cartasIds });
  };

  const handleSaltarTurno = () => {
    enviarAccion({ tipo: "saltar_turno" });
  };

  const handleTerminarTurno = () => {
    enviarAccion({ tipo: "terminar_turno" });
  };

  return (
    <div className="hand-container">
      {estado.mano?.map((carta, i) => {
        const cardId = carta.id;
        const isFiller = false; // todas son reales en esta vista

        return (
          <Card 
            key={cardId || i}
            cardname={carta.nombre}
            faceUp={true}
            cardId={cardId}
            isSelectable={esMiTurno}
            isSelected={selectedCardIds.includes(cardId)}
            onSelect={esMiTurno ? () => toggleCardSelection(cardId) : undefined}
          />
        );
      })}

      {esMiTurno && (
        <div className="acciones-turno">
          <button onClick={handleSaltarTurno}>Saltar turno</button>
          <button onClick={handleTerminarTurno}>Terminar turno</button>
          <button 
            onClick={() => {
              if (selectedCardIds.length === 0) {
                alert("Seleccioná al menos una carta para descartar.");
                return;
              }
              handleDescartar(selectedCardIds);
            }}
          >
            Descartar
          </button>

        </div>
      )}
    </div>
  );
}
