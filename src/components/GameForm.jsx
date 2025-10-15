import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GameForm.css";

const GameForm = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    min_jugadores: "",
    max_jugadores: "",
  });

  const navigate = useNavigate();
  // Recupera el token JWT desde localStorage (usado para autenticación en el backend)
  const token = localStorage.getItem("token");

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Maneja el submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const nombre = formData.nombre;
    const min = parseInt(formData.min_jugadores, 10);
    const max = parseInt(formData.max_jugadores, 10);

    // Validaciones antes de enviar
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
    if (nombre.length > 29) {
      alert("El nombre no puede tener más de 29 caracteres.");
      return;
    }

    try {
      // Envía los datos al backend para crear la partida
      const res = await fetch("http://localhost:8000/partidas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Indica que se envía JSON
          Authorization: `Bearer ${token}`, // Token para autenticación
        },
        body: JSON.stringify(formData), // Convierte el objeto a JSON
      });

      //Si la respuesta no es exitosa, lanza error
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error inesperado");
      }

      // Extrae el ID de la partida creada desde la respuesta
      const data = await res.json();
      const partidaId = data.id;

      // Redirige al lobby de la partida recién creada
      // En esa pantalla se conectará al WebSocket automáticamente
      navigate(`/lobby/${partidaId}`);
    } catch (err) {
      // Muestra el error en consola si algo falla
      console.error("Error al crear partida:", err);
    }
  };

  return (
    <div className="card">
      <h2>Crea una partida</h2>
      <form className="game-form" role="form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre de la partida"
          value={formData.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="min_jugadores"
          placeholder="Mínima cantidad de jugadores"
          value={formData.min_jugadores}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="max_jugadores"
          placeholder="Máxima cantidad de jugadores"
          value={formData.max_jugadores}
          onChange={handleChange}
          required
        />
        <button className="btn-cta" type="submit">
          Crear
        </button>
      </form>
    </div>
  );
};

export default GameForm;
