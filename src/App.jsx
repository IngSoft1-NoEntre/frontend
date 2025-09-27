import './App.css';
import { Routes, Route } from 'react-router-dom';
import GameForm from './components/GameForm';
import JugadorForm from './components/JugadorForm';
import LobbyContainer from "./components/LobbyContainer";
import GameScreen from "./components/GameScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<JugadorForm/>} />
      <Route path="/home" element={
        <main className="contenedor">
          <section className="izquierda">
            <GameForm />
          </section>
          <section className="derecha">
            {/* componente */}
          </section>
        </main>
      } />
      <Route path="/lobby/:partidaId" element={<LobbyContainer />} />
      <Route path="/juego/:partidaId" element={<GameScreen />} />
    </Routes>
  );
}

export default App;
