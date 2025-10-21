import React from "react";
import "./Secret.css";

/**
 * Secret
 * Props:
 * - revealed: boolean
 * - isLocal: boolean
 * - onOpen: fn(data)
 * - data: { 
 * title: string, 
 * frontImage: string (URL REAL), 
 * backImage: string (URL REAL) 
 * }
 */
export default function Secret({
  revealed = false,
  isLocal = false,
  onOpen = null,
  data = {},
}) {
  const frontUrl = data.frontImage; 
  const backUrl = data.backImage;

  // Elegir imagen: si está revelada usamos la URL frontal, si no la URL trasera.
  const image = revealed ? frontUrl : backUrl; 
  
  // Si no hay imagen, no renderizamos nada o usamos un placeholder.
  if (!image) return null; 

  return (
    <div
      className={`secret-card-mini ${revealed ? "revealed" : ""}`}
      role={revealed ? "button" : "img"}
      tabIndex={revealed ? 0 : -1}
      aria-label={data.title || "Secreto"}
      onClick={() => revealed && onOpen && onOpen({ ...data, image })}
      onKeyDown={(e) => {
        if (revealed && (e.key === "Enter" || e.key === " "))
          onOpen && onOpen({ ...data, image });
      }}
      // La URL en 'image' es ahora la URL real de la imagen importada en GameScreen.
      style={{ backgroundImage: `url(${image})` }}
    />
  );
}