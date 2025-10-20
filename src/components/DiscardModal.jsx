import Card from "./Card";

export default function DiscardModal({ cards, onClose, title = 'Vista privada del descarte' }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 className="modal-title">{title}</h3>

        <div className="card-container">
          <div className="discard-row">
            {Array.isArray(cards) && cards.length > 0 ? (
              cards.map((card, index) => (
                <Card key={index} cardname={card.title} faceUp={true} />
              ))
            ) : (
              <p>No hay cartas para mostrar.</p>
            )}
          </div>
        </div>

        <button className="modal-close-bottom" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
