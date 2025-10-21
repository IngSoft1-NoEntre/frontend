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
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();
  // Recupera el token JWT desde localStorage (usado para autenticación en el backend)
  const token = localStorage.getItem("token");

  // Maneja cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
  };

  // Maneja el submit
  const handleSubmit = async (e) => {
    e.preventDefault();


    const nombre = formData.nombre;
    const min = parseInt(formData.min_jugadores, 10);
    const max = parseInt(formData.max_jugadores, 10);

    if (!nombre) {
        setErrorMsg("El nombre de la partida no puede estar vacío.");
        return;
    }
    if (nombre.length > 29) {
      setErrorMsg("El nombre no puede tener más de 29 caracteres.");
      return;
    }
    if (isNaN(min) || isNaN(max)) {
      setErrorMsg("Debes ingresar valores válidos para Mín. y Máx. jugadores.");
      return;
    }
    if (min < 2) {
      setErrorMsg("La cantidad mínima de jugadores debe ser al menos 2.");
      return;
    }
    if (max > 6) {
      setErrorMsg("La cantidad máxima de jugadores no puede superar 6.");
      return;
    }
    if (min > max) {
      setErrorMsg("La cantidad mínima no puede ser mayor que la máxima.");
      return;
    }
    if (!token) {
        setErrorMsg("Error de autenticación: No se encontró la sesión. Por favor, regístrese de nuevo.");
        return;
    }

    setErrorMsg(""); 

    try {
      // Envía los datos al backend para crear la partida
      const res = await fetch("http://localhost:8000/partidas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",         // Indica que se envía JSON
          "Authorization": `Bearer ${token}`,         // Token para autenticación
        },
        body: JSON.stringify(formData),               // Convierte el objeto a JSON
      });

      //Si la respuesta no es exitosa, lanza error
      if (!res.ok) {
        const errorData = await res.json();
        let finalErrorMsg = 'Error desconocido al crear partida.';

        if (res.status === 401) {
             finalErrorMsg = "No autorizado. Por favor, regístrese de nuevo (token no válido).";
        } else if (res.status === 400 || res.status === 409) {
             // Maneja errores de Lógica de Negocio (e.g., partida duplicada, 400/409)
             finalErrorMsg = errorData.detail;
        } else if (res.status === 422) {
            // Maneja errores de Validación de Pydantic
            if (errorData.detail && Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                // Extrae el primer mensaje de error de validación
                finalErrorMsg = `Error: ${errorData.detail[0].msg}`;
            } else {
                finalErrorMsg = `Error de validación (422). Datos no procesables.`;
            }
        } else {
             // Cualquier otro error HTTP
             finalErrorMsg = errorData.detail || `Error del servidor: ${res.status}`;
        }

        throw new Error(finalErrorMsg);
      }
      
      // Extrae el ID de la partida creada desde la respuesta
      const data = await res.json();
      const partidaId = data.id;

      // Redirige al lobby de la partida recién creada
      // En esa pantalla se conectará al WebSocket automáticamente
      navigate(`/lobby/${partidaId}`);
    } catch (err) {
      // Muestra el error en consola si algo falla
      setErrorMsg(err.message);
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
        />
        <input
          type="number"
          name="min_jugadores"
          placeholder="Mínima cantidad de jugadores"
          value={formData.min_jugadores}
          onChange={handleChange}
        />
        <input
          type="number"
          name="max_jugadores"
          placeholder="Máxima cantidad de jugadores"
          value={formData.max_jugadores}
          onChange={handleChange}
        />
        <button className="btn-cta" type="submit">Crear</button>
        {errorMsg && <div className="error-banner">⚠️ {errorMsg}</div>}
      </form>
    </div>
  );
};

export default GameForm;
