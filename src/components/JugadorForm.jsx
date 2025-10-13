import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import '../components/JugadorForm.css';

function JugadorForm() {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
      //manejo de errores del frontend
      // Validaciones antes de enviar
      if (nombre.trim() === "") {
            setErrorMsg("El nombre no puede estar vacío.");
            return;
        }
      if (nombre.length > 29) {
        setErrorMsg("El nombre no puede tener más de 29 caracteres");
        return;
      }

      if (/^\d+$/.test(nombre)) {
        setErrorMsg("El nombre no puede ser solo números");
        return;
      }
      if (!fechaNacimiento) {
            setErrorMsg("La fecha de nacimiento no puede estar vacía");
            return;
        }
      const today = new Date().toISOString().split('T')[0];
      if (fechaNacimiento > today) {
          setErrorMsg("La fecha de nacimiento debe ser una fecha válida.");
          return;
      }
      // Si pasa las validaciones, limpiar errores
      setErrorMsg("");

    try {
      const res = await fetch('http://localhost:8000/auth/jugadores/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre,
          fecha_nacimiento: fechaNacimiento
        })
      });
      //manejo de errores del backend
      if (!res.ok) {
        const errorData = await res.json();
        let finalErrorMsg = 'Error al crear jugador.';

        if (res.status === 400 || res.status === 409) {
          finalErrorMsg = errorData.detail;
          
        } else if (res.status === 422) {
          if (errorData.detail && Array.isArray(errorData.detail) && errorData.detail.length > 0) {
                finalErrorMsg = `Error de validación: ${errorData.detail[0].msg}`;
            } else {
              finalErrorMsg = `Error de validación (422). Datos no procesables.`;
            }
          } else {
            // Cualquier otro error HTTP
            finalErrorMsg = errorData.detail || `Error del servidor: ${res.status}`;
          }
          throw new Error(finalErrorMsg);
      }
      //exito
      const data = await res.json();
      console.log('Respuesta del backend-JugadorForm:', data);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', nombre);

      navigate('/home');
    } catch (error) {
      console.error('Error en el Registro de Jugador:', error);
      // mostrar un mensaje por pantalla
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="pantalla"
    >
      <h1 className="titulo-agatha">Agatha Christie</h1>
      <div className="card">
        <h2>Registro de Jugador</h2>
        <form onSubmit={handleSubmit} className="game-form">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            
          />
          <input
            type="date"
            value={fechaNacimiento}
            aria-label="Fecha de nacimiento"
            onChange={(e) => setFechaNacimiento(e.target.value)}
            
          />
          {errorMsg && <div className="error-banner">⚠️ {errorMsg}</div>}
          <button type="submit" className="btn-cta">Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default JugadorForm;
