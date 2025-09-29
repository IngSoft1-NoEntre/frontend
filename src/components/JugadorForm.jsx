import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/JugadorForm.css';

function JugadorForm() {
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

      // Validaciones antes de enviar
      if (nombre.length > 29) {
        setErrorMsg("El nombre no puede tener más de 29 caracteres");
        return;
      }

      if (/^\d+$/.test(nombre)) {
        setErrorMsg("El nombre no puede ser solo números");
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Error al crear jugador');
      }

      const data = await res.json();
      console.log('Respuesta del backend-JugadorForm:', data);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', nombre);

      navigate('/home'); // redirige a home
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
            required
          />
          <input
            type="date"
            value={fechaNacimiento}
            aria-label="Fecha de nacimiento"
            onChange={(e) => setFechaNacimiento(e.target.value)}
            required
          />
          {errorMsg && <div className="error-banner">⚠️ {errorMsg}</div>}
          <button type="submit" className="btn-cta">Enviar</button>
        </form>
      </div>
    </div>
  );
}

export default JugadorForm;
