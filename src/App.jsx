import "./App.css";
import { Routes, Route } from "react-router-dom";
import GameForm from "./components/GameForm";
import JugadorForm from "./components/JugadorForm";
import LobbyContainer from "./components/LobbyContainer";
import GameList from "./components/GameList";

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
    </Routes>
  );
}

export default App;
