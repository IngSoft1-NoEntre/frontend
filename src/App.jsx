import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import GameForm from "./components/GameForm";

function App() {
  return (
    <Router>
      <Routes>
        {/*<Route path="/" element={<JugadorForm/>} />*/}
        <Route
          path="/home"
          element={
            <main className="contenedor">
              <section className="izquierda">
                <GameForm />
              </section>
              <section className="derecha">{/*<GameList /> */}</section>
            </main>
          }
        />
        {/*<Route path="/lobby/:partidaId" element={<LobbyContainer />} /> */}
      </Routes>
    </Router>
  );
}
export default App;
