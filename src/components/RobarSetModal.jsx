import React, { useState } from "react";
import "./RobarSetModal.css";
import Card from "./Card";

/**
 * Modal para seleccionar un set de detectives a robar con "Another Victim"
 *
 * @param {Array} setsDisponibles - Sets de otros jugadores
 *   [{id, owner_id, owner_nombre, cartas: [{id, nombre, tipo}]}]
 * @param {Function} onConfirm - Callback (setId, ownerId) => void
 * @param {Function} onCancel - Callback () => void
 */
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
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="robar-set-modal">
        <div className="modal-header">
          <h2>🎯 Another Victim</h2>
          <p className="modal-subtitle">
            Selecciona un set de detectives para robar
          </p>
        </div>

        <div className="sets-list">
          {setsDisponibles.length === 0 ? (
            <div className="no-sets-available">
              <p>😔 No hay sets disponibles para robar</p>
              <button onClick={onCancel} className="btn-cancel-solo">
                Cerrar
              </button>
            </div>
          ) : (
            setsDisponibles.map((set) => (
              <div
                key={set.id}
                className={`set-item ${
                  selectedSetId === set.id ? "selected" : ""
                }`}
                onClick={() => setSelectedSetId(set.id)}
              >
                <div className="set-header">
                  <div className="set-info">
                    <strong className="owner-name">{set.owner_nombre}</strong>
                    <span className="set-size">
                      {set.cartas?.length || 0} cartas
                    </span>
                  </div>
                  {selectedSetId === set.id && (
                    <span className="check-icon">✓</span>
                  )}
                </div>

                <div className="set-cards-preview">
                  {set.cartas &&
                    set.cartas.map((carta) => (
                      <div key={carta.id} className="card-mini-wrapper">
                        <Card
                          cardname={carta.nombre || "card_back"}
                          faceUp={true}
                          isSelectable={false}
                          isSelected={false}
                        />
                        <span className="card-name-label">
                          {carta.nombre?.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>

        {setsDisponibles.length > 0 && (
          <div className="modal-actions">
            <button onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="btn-confirm"
              disabled={!selectedSetId}
            >
              Robar Set Seleccionado
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
