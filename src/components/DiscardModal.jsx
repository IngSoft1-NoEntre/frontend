import Card from "./Card";

export default function DiscardModal({ cards, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
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
      </div>
    </div>
  );
}
