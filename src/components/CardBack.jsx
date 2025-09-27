import React from "react";
import "./CardBack.css";

//Representa el mazo regular
export default function CardBack({ count = 0 }) {
  return (
    <div className="cardback">
      <div className="back-graphic"></div>
      <div className="back-count">{count}</div>
    </div>
  );
}
