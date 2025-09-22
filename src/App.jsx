import "./App.css";
import GameForm from "./components/GameForm";
import GameList from "./components/GameList";

function App() {
  return (
    <main className="contenedor">
      <section className="izquierda">
        <GameForm />
      </section>
      <section className="derecha">
        <GameList />
      </section>
    </main>
  );
}
export default App;
