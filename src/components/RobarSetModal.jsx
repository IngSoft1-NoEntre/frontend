import React, { useState } from "react";
import "./RobarSetModal.css";
import Card from "./Card";

export default function RobarSetModal({
  setsDisponibles,
  onConfirm,
  onCancel,
}) {
  const [selectedSetId, setSelectedSetId] = useState(null);

  const handleConfirm = () => {
    if (!selectedSetId) {
      alert("Debes seleccionar un set para robar");
      return;
    }

    const setSeleccionado = setsDisponibles.find((s) => s.id === selectedSetId);
    if (setSeleccionado) {
      onConfirm(setSeleccionado.id, setSeleccionado.owner_id);
    }
  };

  return (
    <div className="modal-overlay-robar" onClick={onCancel}>
      <div className="robar-modal-compact" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title-compact">Robar Set</h3>

        <div className="sets-list-compact">
          {setsDisponibles.length === 0 ? (
            <p className="no-sets-msg">No hay sets disponibles</p>
          ) : (
            setsDisponibles.map((set) => (
              <div
                key={set.id}
                className={`set-compact ${
                  selectedSetId === set.id ? "selected" : ""
                }`}
                onClick={() => setSelectedSetId(set.id)}
              >
                <div className="set-owner-compact"> {set.owner_nombre}</div>

                <div className="set-cards-compact">
                  {set.cartas &&
                    set.cartas.map((carta) => (
                      <div key={carta.id} className="mini-card">
                        <Card
                          cardname={carta.nombre || "card_back"}
                          faceUp={true}
                          isSelectable={false}
                          isSelected={false}
                        />
                      </div>
                    ))}
                </div>

                {selectedSetId === set.id && (
                  <div className="check-compact">✓</div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="buttons-compact">
          <button onClick={onCancel} className="btn-cancel-compact">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="btn-confirm-compact"
            disabled={!selectedSetId}
          >
            Robar
          </button>
        </div>
      </div>
    </div>
  );
}
