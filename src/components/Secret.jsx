import React from "react";
import "./Secret.css";

/**
 * Secret: pequeña "carta"
 * Props:
 *  - revealed: boolean (si la querés mostrar distinta)
 */
export default function Secret({ revealed = false }) {
  return (
    <div
      className={`secret-card-mini ${revealed ? "revealed" : ""}`}
      aria-hidden="true"
    ></div>
  );
}
