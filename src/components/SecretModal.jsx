import React, { useEffect } from "react";
import "./SecretModal.css";

export default function SecretModal({ item = null, onClose = () => {} }) {
  if (!item || !item.revealed) return null;

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const imageUrl = item.image || item.frontImage; 
  
  // Manejo de URL nula (en caso de que item.frontImage sea undefined)
  if (!imageUrl) return null; 

  return (
    <div className="secretmodal-overlay" role="dialog" aria-modal="true" aria-label={item.title || "Secreto ampliado"}>
      <div className="secretmodal-card">
        <button className="secretmodal-close" aria-label="Cerrar" onClick={onClose}>✕</button>
        <div className="secretmodal-image" style={{ backgroundImage: `url(${imageUrl})` }} aria-hidden="true"></div>
        {item.title && <div className="secretmodal-caption">{item.title}</div>}
      </div>
    </div>
  );
}