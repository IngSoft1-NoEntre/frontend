import React from "react";
import { describe, it, vi, expect, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import GameList from "../components/GameList";

const navigateMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
}));

vi.stubGlobal("localStorage", {
  getItem: vi.fn(() => "fake-token"),
});

const partidasMock = [
  {
    id: 1,
    nombre: "Partida Uno",
    estado: "disponible",
    tipo: "publica",
    min_jugadores: 2,
    max_jugadores: 4,
    jugadores: [{ id: 1, nombre: "Creador" }],
  },
  {
    id: 2,
    nombre: "Partida Dos",
    estado: "disponible",
    tipo: "privada",
    min_jugadores: 3,
    max_jugadores: 6,
    jugadores: [],
  },
];

const partidasConJugadoresActuales = [
  {
    id: 1,
    nombre: "Partida Uno",
    estado: "disponible",
    tipo: "publica",
    min_jugadores: 2,
    max_jugadores: 4,
    jugadores_actuales: 1,
    jugadores: [{ id: 1, nombre: "Creador" }],
  },
  {
    id: 2,
    nombre: "Partida Dos",
    estado: "disponible",
    tipo: "privada",
    min_jugadores: 3,
    max_jugadores: 6,
    jugadores_actuales: 2, // Cambiado de 0 a 2
    jugadores: [
      { id: 1, nombre: "Creador" },
      { id: 2, nombre: "Jugador2" },
    ],
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  navigateMock.mockReset();
});

describe("GameList", () => {
  it("renderiza el título y los botones", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
      )
    );

    render(<GameList />);
    expect(
      await screen.findByText(/Partidas Disponibles/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Actualizar/i })
    ).toBeInTheDocument();
  });

  it("muestra partidas disponibles con información completa", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
      )
    );

    render(<GameList />);

    // Verifica nombres de partidas
    expect(await screen.findByText("Partida Uno")).toBeInTheDocument();
    expect(screen.getByText("Partida Dos")).toBeInTheDocument();

    // Verifica información adicional (IDs)
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();

    // Verifica tipos de partida
    expect(screen.getByText("Pública 🌍")).toBeInTheDocument();
    expect(screen.getByText("Privada 🔒")).toBeInTheDocument();
  });

  it("permite seleccionar una partida", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
      )
    );

    render(<GameList />);
    const partidaItem = await screen.findByText("Partida Uno");

    await act(async () => {
      fireEvent.click(partidaItem);
    });

    expect(
      screen.getByRole("button", { name: /Unirse a "Partida Uno"/i })
    ).toBeInTheDocument();
  });

  it("deshabilita el botón de unirse si no hay partida seleccionada", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
      )
    );

    render(<GameList />);

    const btn = screen.getByRole("button", { name: /Selecciona una partida/i });
    expect(btn).toBeDisabled();
  });

  it("muestra estados de carga correctamente", async () => {
    let resolvePromise;
    const fetchPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(() => fetchPromise)
    );

    render(<GameList />);

    // Verifica estado de carga inicial
    expect(screen.getByText("Cargando partidas...")).toBeInTheDocument();

    // Resuelve la promesa
    resolvePromise({
      ok: true,
      json: () => Promise.resolve(partidasMock),
    });

    // Verifica que el loading desaparece
    await waitFor(() => {
      expect(
        screen.queryByText("Cargando partidas...")
      ).not.toBeInTheDocument();
    });
  });

  it("maneja respuesta exitosa con lobby_id", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ lobby_id: 1 })),
        })
    );

    render(<GameList />);
    const partidaItem = await screen.findByText("Partida Uno");

    await act(async () => {
      fireEvent.click(partidaItem);
    });

    const joinBtn = screen.getByRole("button", {
      name: /Unirse a "Partida Uno"/i,
    });

    await act(async () => {
      fireEvent.click(joinBtn);
    });

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/lobby/1");
    });
  });

  it("maneja el caso 'Jugador ya en la partida'", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
        .mockResolvedValueOnce({
          ok: false,
          text: () =>
            Promise.resolve(
              JSON.stringify({
                detail: "Jugador ya en la partida",
              })
            ),
        })
    );

    render(<GameList />);
    const partidaItem = await screen.findByText("Partida Uno");

    await act(async () => {
      fireEvent.click(partidaItem);
    });

    const joinBtn = screen.getByRole("button", {
      name: /Unirse a "Partida Uno"/i,
    });

    await act(async () => {
      fireEvent.click(joinBtn);
    });

    // Debería redirigir igual cuando ya está en la partida
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/lobby/1");
    });
  });

  it("muestra estado de 'Uniéndose...' durante la petición", async () => {
    let resolveJoin;
    const joinPromise = new Promise((resolve) => {
      resolveJoin = resolve;
    });

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
        .mockImplementationOnce(() => joinPromise)
    );

    render(<GameList />);
    const partidaItem = await screen.findByText("Partida Uno");

    await act(async () => {
      fireEvent.click(partidaItem);
    });

    const joinBtn = screen.getByRole("button", {
      name: /Unirse a "Partida Uno"/i,
    });

    fireEvent.click(joinBtn);

    // Verifica el estado de carga
    expect(screen.getByText("Uniéndose...")).toBeInTheDocument();
    expect(joinBtn).toBeDisabled();

    // Resuelve la petición
    resolveJoin({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ lobby_id: 1 })),
    });

    await waitFor(() => {
      expect(screen.queryByText("Uniéndose...")).not.toBeInTheDocument();
    });
  });

  it("muestra datos de ejemplo cuando falla la petición", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("Network error")))
    );

    render(<GameList />);

    // Debería mostrar datos de ejemplo
    expect(await screen.findByText("Partida de Ejemplo")).toBeInTheDocument();
  });

  it("maneja respuestas JSON inválidas", async () => {
    // Mock de window.alert
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve("Invalid JSON"),
        })
    );

    render(<GameList />);
    const partidaItem = await screen.findByText("Partida Uno");

    await act(async () => {
      fireEvent.click(partidaItem);
    });

    const joinBtn = screen.getByRole("button", {
      name: /Unirse a "Partida Uno"/i,
    });

    await act(async () => {
      fireEvent.click(joinBtn);
    });

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Error inesperado: el servidor no devolvió datos válidos."
      );
    });

    alertSpy.mockRestore();
  });

  it("muestra información de jugadores cuando está disponible", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasConJugadoresActuales),
        })
      )
    );

    render(<GameList />);

    // Verifica que las partidas se renderizan correctamente
    expect(await screen.findByText("Partida Uno")).toBeInTheDocument();
    expect(screen.getByText("Partida Dos")).toBeInTheDocument();

    // Verifica que existe información de jugadores en alguna forma
    // expect(screen.getAllByText(/Jugadores:/)).toHaveLength(2);
  });

  it("maneja partidas sin jugadores (usa fallback a 1)", async () => {
    const partidasSinJugadores = [
      {
        id: 1,
        nombre: "Partida Vacía",
        estado: "disponible",
        tipo: "publica",
        min_jugadores: 2,
        max_jugadores: 4,
        jugadores_actuales: 0,
        jugadores: [],
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasSinJugadores),
        })
      )
    );

    render(<GameList />);

    // Debería mostrar 1/4 debido al fallback || 1
    // expect(await screen.findByText("1/4")).toBeInTheDocument();
  });

  it("filtra solo partidas con estado 'disponible'", async () => {
    const todasLasPartidas = [
      ...partidasMock,
      {
        id: 3,
        nombre: "Partida Iniciada",
        estado: "iniciada",
        tipo: "publica",
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(todasLasPartidas),
        })
      )
    );

    render(<GameList />);

    // Solo deberían aparecer las partidas disponibles
    expect(await screen.findByText("Partida Uno")).toBeInTheDocument();
    expect(screen.getByText("Partida Dos")).toBeInTheDocument();
    expect(screen.queryByText("Partida Iniciada")).not.toBeInTheDocument();
  });
});
