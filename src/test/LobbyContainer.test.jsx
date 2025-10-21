import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import LobbyContainer from '../components/LobbyContainer';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mocks globales
const navigateMock = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ partidaId: 1 }),
    useNavigate: () => navigateMock,
  };
});

vi.mock('jwt-decode', () => ({
  jwtDecode: () => ({ sub: 1 }),
}));

vi.stubGlobal('localStorage', {
  getItem: vi.fn(() => 'mock-token'),
});

describe('LobbyContainer - Owner', () => {
  beforeEach(() => {
    vi.clearAllMocks();           // Limpia todos los mocks
    global.fetch = vi.fn();       // Reinicia el mock de fetch
  });
  test('renderiza nombre de la partida y jugadores', async () => {
    global.WebSocket = class {
      constructor() {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              evento: "actualizacion_lobby",
              partida: {
                nombre: "Partida Test",
                owner_id: 1,
                jugadores: [
                  { id: 1, nombre: "Veronica" },
                  { id: 2, nombre: "Bianca" },
                ],
              },
            }),
          });
        }, 100);
      }
      close() {}
    };

    render(
      <BrowserRouter>
        <LobbyContainer />
      </BrowserRouter>
    );

    expect(await screen.findByText(/Partida Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Veronica/i)).toBeInTheDocument();
    expect(screen.getByText(/Bianca/i)).toBeInTheDocument();
    expect(screen.getByText(/👑/)).toBeInTheDocument();
  });

  test('muestra botón de iniciar si el jugador es owner', async () => {
    global.WebSocket = class {
      constructor() {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              evento: "actualizacion_lobby",
              partida: {
                nombre: "Partida Test",
                owner_id: 1,
                jugadores: [{ id: 1, nombre: "Veronica" }],
              },
            }),
          });
        }, 100);
      }
      close() {}
    };

    render(
      <BrowserRouter>
        <LobbyContainer />
      </BrowserRouter>
    );

    const boton = await screen.findByRole('button', { name: /Iniciar partida/i });
    expect(boton).toBeInTheDocument();
  });

  test('redirige al juego cuando se recibe evento iniciada', async () => {
    global.WebSocket = class {
      constructor() {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              evento: "iniciada",
              partida: { estado: "iniciada" },
            }),
          });
        }, 100);
      }
      close() {}
    };

    render(
      <BrowserRouter>
        <LobbyContainer />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/juego/1');
    });
  });

  test('envía PATCH al iniciar partida si el jugador es owner', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true }));
    global.fetch = fetchMock;

    global.WebSocket = class {
      constructor() {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              evento: "actualizacion_lobby",
              partida: {
                nombre: "Partida Test",
                owner_id: 1,
                jugadores: [{ id: 1, nombre: "Veronica" }],
              },
            }),
          });
        }, 100);
      }
      close() {}
    };

    render(
      <BrowserRouter>
        <LobbyContainer />
      </BrowserRouter>
    );

    const boton = await screen.findByRole('button', { name: /Iniciar partida/i });
    await boton.click();
    expect(fetchMock).toHaveBeenCalled();

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/partidas/1/iniciar',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: expect.stringContaining('Bearer'),
        }),
      })
    );
  });

  test("muestra mensaje de error si el backend devuelve error al iniciar partida", async () => {
    // Mock del fetch con error 403
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 403,
        json: async () => ({ detail: "Solo el owner puede iniciar la partida" }),
      })
    );

    // Mock del WebSocket con datos de partida
    global.WebSocket = class {
      constructor() {
        setTimeout(() => {
          this.onmessage?.({
            data: JSON.stringify({
              evento: "actualizacion_lobby",
              partida: {
                nombre: "Partida Test",
                owner_id: 1,
                jugadores: [{ id: 1, nombre: "Veronica" }],
              },
            }),
          });
        }, 100);
      }
      close() {}
    };

    // Mock del token decodificado
    const token = btoa(JSON.stringify({ sub: 1 }));
    vi.spyOn(Storage.prototype, "getItem").mockImplementation((key) =>
      key === "token" ? token : null
    );

    render(
      <BrowserRouter>
        <LobbyContainer />
      </BrowserRouter>
    );

    // Espera a que aparezca el botón
    const boton = await screen.findByRole("button", { name: /Iniciar partida/i });
    fireEvent.click(boton);

    // Verifica que el mensaje de error se renderiza en pantalla
    const error = await screen.findByText(/Solo el owner puede iniciar la partida/i);
    expect(error).toBeInTheDocument();
  });


});
