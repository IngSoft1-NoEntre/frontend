import "./App.css";
import { Routes, Route } from "react-router-dom";
import GameForm from "./components/GameForm";
import JugadorForm from "./components/JugadorForm";
import LobbyContainer from "./components/LobbyContainer";
import GameList from "./components/GameList";
import GameScreen from "./components/GameScreen";
import GameStateProvider from "./context/GameStateProvider";

function App() {
  return (
    <Routes>
      <Route path="/" element={<JugadorForm />} />
      <Route
        path="/home"
        element={
          <main className="contenedor">
            <section className="izquierda">
              <GameForm />
            </section>
            <section className="derecha">
              <GameList />
            </section>
          </main>
        }
      />
      <Route path="/lobby/:partidaId" element={<LobbyContainer />} />

      {/* ONLY wrap the game route with the provider */}
      <Route
        path="/juego/:partidaId"
        element={
          <GameStateProvider>
            <GameScreen />
          </GameStateProvider>
        }
      />
    </Routes>
  );
}

export default App;
