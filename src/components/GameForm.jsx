import { useState } from "react";
import "./GameForm.css";

const GameForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    mincantjugadores: "",
    maxcantjugadores: "",
  });

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Maneja el submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const min = parseInt(formData.mincantjugadores, 10);
    const max = parseInt(formData.maxcantjugadores, 10);

    // Validaciones
    if (min < 2) {
      alert("La cantidad mínima de jugadores debe ser al menos 2.");
      return;
    }
    if (max > 6) {
      alert("La cantidad máxima de jugadores no puede superar 6.");
      return;
    }
    if (min > max) {
      alert("La cantidad mínima no puede ser mayor que la máxima.");
      return;
    }

    console.log("Datos enviados:", formData);

    // acá podrías mandar al backend con fetch:
    fetch("http://localhost:4000/partidas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => console.log("Respuesta del backend:", data))
      .catch((err) => console.error(err));
  };

  return (
    <div className="card">
      <h2>Crea una partida</h2>
      <form className="game-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la partida"
          value={formData.nombre}
          onChange={handleChange}
        />
        <input
          type="number"
          name="mincantjugadores"
          placeholder="Mínima cantidad de jugadores"
          value={formData.mincantjugadores}
          onChange={handleChange}
        />
        <input
          type="number"
          name="maxcantjugadores"
          placeholder="Máxima cantidad de jugadores"
          value={formData.maxcantjugadores}
          onChange={handleChange}
        />
        <button className="btn-cta" type="submit">
          Crear
        </button>
      </form>
    </div>
  );
};

export default GameForm;
