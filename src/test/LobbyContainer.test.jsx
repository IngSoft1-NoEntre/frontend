import { render, screen, waitFor } from '@testing-library/react';
import LobbyContainer from '../components/LobbyContainer';
import { vi } from 'vitest';

// Mockea react-router-dom para simular navegación y parámetros de URL
vi.mock('react-router-dom', () => ({
  useParams: () => ({ partidaId: '1' }),
  useNavigate: () => vi.fn(),
}));

// Simula que el jugador autenticado tiene ID numérico 1 (es el owner)
vi.mock('jwt-decode', () => ({
  jwtDecode: () => ({ sub: 1 }),
}));

// Mockea imagen de fondo
vi.mock('../../assets/lobby.png', () => 'mocked-image-path');

// Mockea fetch
global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
);

// Simula WebSocket con evento 'actualizacion_lobby' para partida disponible
global.WebSocket = vi.fn(() => ({
  onmessage: null,
  onclose: null,
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: function (event, cb) {
    if (event === 'message') {
      setTimeout(() => {
        cb({
          data: JSON.stringify({
            evento: 'actualizacion_lobby',
            partida: {
              id: 1,
              nombre: 'Partida Test',
              estado: 'disponible',
              owner_id: 1,
              jugadores: [
                {
                  id: 1,
                  nombre: "facundo",
                  fecha_nacimiento: "2000-05-12",
                  es_owner: true
                }
              ],
              mazo: []
            },
          }),
        });
      }, 10); // Simula recepción asincrónica
    }
  },
}));

describe('LobbyContainer - Owner', () => {
  it('renderiza correctamente el título del lobby', () => {
    render(<LobbyContainer />);
    expect(screen.getByText(/Lobby de la partida/i)).toBeInTheDocument();
  });
});
