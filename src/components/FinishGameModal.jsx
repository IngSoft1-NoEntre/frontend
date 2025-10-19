import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FinishGameModal.css';

// Agregamos 'onClose' a las props
export default function FinishGameModal({ onClose }) {
    
    const navigate = useNavigate(); 
    
    const handlePlayAgain = () => {
        // Cierra el modal localmente antes de navegar (opcional, pero limpio)
        onClose(); 
        
        // Redirecciona al formulario inicial
        navigate('/'); 
    };

    return (
        <div className="modal-backdrop">
            <div className="finish-game-modal">
                <h2>¡El Asesino Escapó! 🏃💨</h2>
                <p>El mazo se ha agotado.</p>
                
                <button 
                    className="btn-play-again"
                    onClick={handlePlayAgain}
                >
                    Volver a Jugar
                </button>
            </div>
        </div>
    );
}