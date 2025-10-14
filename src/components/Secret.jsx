// src/components/Secret.jsx
import React from "react";
import "./Secret.css";
import backImg from "../assets/img/05-secret_back.png";
import frontImg from "../assets/img/06-secret_front.png";

/**
 * Secret
 * Props:
 *  - revealed: boolean -> si la carta está revelada (el local la verá revelada)
 *  - isLocal: boolean -> ayuda a decidir qué imagen usar por defecto
 *  - onOpen: fn(data) -> se llama solo si revealed === true (abrir modal)
 *  - data: objeto opcional (title, text, image)
 */
export default function Secret({
  revealed = false,
  isLocal = false,
  onOpen = null,
  data = {},
}) {
  // elegir imagen: si está revelada usamos frontImg, si no backImg
  const image = revealed ? data.image || frontImg : data.backImage || backImg;

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
      // no hover reveal para otros: simplemente estilo visual si querés
      style={{ backgroundImage: `url(${image})` }}
    />
  );
}
