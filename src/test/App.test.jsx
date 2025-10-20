import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import '@testing-library/jest-dom';

/*
  vemos que se randerizen los componentes correspondientes en cada ruta

  Notas:
    -se podria agregar en App.jsx un <Route path="*" element={<NotFoundPage />} /> para
    manejar las rutas invalidas

*/

// mock de hijos
vi.mock('../components/GameForm',        () => ({ default: () => <div>MockGameForm</div> }));
vi.mock('../components/JugadorForm',     () => ({ default: () => <div>MockJugadorForm</div> }));
vi.mock('../components/LobbyContainer',  () => ({ default: () => <div>MockLobbyContainer</div> }));
vi.mock('../components/GameList',        () => ({ default: () => <div>MockGameList</div> }));
vi.mock('../components/GameScreen',      () => ({ default: () => <div>MockGameScreen</div> }));

describe('App', () => {
    
  //MemoryRouter simula BrowserRouter en memoria, de 'react-router-dom', para testing
  //initialEntries ruta la App va a creer que estamos
  const renderAt = (route) => {
    render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
      );
    };

    it('renderiza JugadorForm en root "/"', () => {
      renderAt('/');
      expect(screen.getByText('MockJugadorForm')).toBeInTheDocument();
    });

    it('renderiza GameForm y GameList en "/home"', () => {
      renderAt('/home');
      expect(screen.getByText('MockGameForm')).toBeInTheDocument();
      expect(screen.getByText('MockGameList')).toBeInTheDocument();
    });

    it('renderiza LobbyContainer en "/lobby/1"', () => {
      //la direccion es dinamica
      renderAt('/lobby/1'); 
      expect(screen.getByText('MockLobbyContainer')).toBeInTheDocument();
    });

    it('renderiza LobbyContainer en "/lobby/333333"', () => {
      renderAt('/juego/333333'); 
      expect(screen.getByText('MockGameScreen')).toBeInTheDocument();
    });

    it('ruta inexistente no renderiza los componentes validos', () => {
      renderAt('/non-existent-route'); 
        
      //si la ruta es invalida no deberia renderizar lo siguiente
      expect(screen.queryByText('MockJugadorForm')).not.toBeInTheDocument();
      expect(screen.queryByText('MockGameForm')).not.toBeInTheDocument();
      expect(screen.queryByText('MockLobbyContainer')).not.toBeInTheDocument();
      expect(screen.queryByText('MockGameList')).not.toBeInTheDocument();
      expect(screen.queryByText('MockGameScreen')).not.toBeInTheDocument();
    });

});