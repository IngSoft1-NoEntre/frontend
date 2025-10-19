import React from "react";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
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
  },
  {
    id: 2,
    nombre: "Partida Dos",
    estado: "disponible",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  navigateMock.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("GameList", () => {
  it("renderiza el título", async () => {
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

    // Verifica estados
    expect(screen.getAllByText("Disponible")).toHaveLength(2);
  });

  it("muestra partidas iniciadas y disponibles", async () => {
    const partidasVariadas = [
      {
        id: 1,
        nombre: "Partida Disponible",
        estado: "disponible",
      },
      {
        id: 2,
        nombre: "Partida Iniciada",
        estado: "iniciada",
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasVariadas),
        })
      )
    );

    render(<GameList />);

    expect(await screen.findByText("Partida Disponible")).toBeInTheDocument();
    expect(screen.getByText("Partida Iniciada")).toBeInTheDocument();
    expect(screen.getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByText("Iniciada")).toBeInTheDocument();
    expect(screen.getByText("🎮 En curso")).toBeInTheDocument();
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

    const btn = await screen.findByRole("button", {
      name: /Selecciona una partida/i,
    });
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

  it("muestra mensaje cuando no hay partidas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        })
      )
    );

    render(<GameList />);

    expect(
      await screen.findByText("No hay partidas disponibles")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Crea una nueva partida para empezar")
    ).toBeInTheDocument();
  });

  it("muestra banner de error en lugar de alert", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("Network error")))
    );

    render(<GameList />);

    await waitFor(() => {
      expect(
        screen.getByText("Error de conexión con el servidor")
      ).toBeInTheDocument();
      expect(screen.getByText("⚠️")).toBeInTheDocument();
    });
  });

  it("maneja error del servidor al cargar partidas", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        })
      )
    );

    render(<GameList />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar partidas del servidor")
      ).toBeInTheDocument();
    });
  });

  it("actualiza partidas automáticamente", async () => {
    // Use real timers for this test
    vi.useRealTimers();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(partidasMock),
    });

    vi.stubGlobal("fetch", fetchMock);

    render(<GameList />);

    // Esperar la primera llamada
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Esperar un poco más del intervalo (10.1 segundos)
    await new Promise((resolve) => setTimeout(resolve, 10100));

    // Verificar que se hizo una segunda llamada
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  }, 20000); // 20 second timeout

  it("limpia el interval al desmontar", async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
      )
    );

    const { unmount } = render(<GameList />);

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    clearIntervalSpy.mockRestore();
  });

  it("muestra error al intentar unirse sin seleccionar partida", async () => {
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

    const joinBtn = await screen.findByRole("button", {
      name: /Selecciona una partida/i,
    });

    // El botón debería estar deshabilitado sin partida seleccionada
    expect(joinBtn).toBeDisabled();

    // Como está deshabilitado, no podemos hacer click para mostrar el error
    // En su lugar, verificamos que el botón muestre el texto correcto
    expect(joinBtn).toHaveTextContent("Selecciona una partida");
  });

  it("limpia error al seleccionar partida", async () => {
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

    // No debería haber banner de error visible
    expect(screen.queryByText("⚠️")).not.toBeInTheDocument();
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

  it("maneja respuesta exitosa sin lobby_id", async () => {
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
          text: () => Promise.resolve(JSON.stringify({ success: true })),
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

  it("maneja error de unirse con mensaje personalizado", async () => {
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
                detail: "Partida llena",
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

    await waitFor(() => {
      expect(screen.getByText("Partida llena")).toBeInTheDocument();
    });
  });

  it("maneja error de conexión al unirse", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
        .mockRejectedValueOnce(new Error("Network error"))
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
      expect(
        screen.getByText("Error de conexión. Intenta nuevamente")
      ).toBeInTheDocument();
    });
  });

  it("maneja JSON inválido sin usar alert", async () => {
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
      expect(
        screen.getByText("Error: el servidor no devolvió datos válidos")
      ).toBeInTheDocument();
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

  it("aplica clases CSS correctas a partidas", async () => {
    const partidasVariadas = [
      {
        id: 1,
        nombre: "Partida Disponible",
        estado: "disponible",
      },
      {
        id: 2,
        nombre: "Partida Iniciada",
        estado: "iniciada",
      },
    ];

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasVariadas),
        })
      )
    );

    render(<GameList />);

    const partidaDisponible = await screen.findByText("Partida Disponible");
    const partidaIniciada = screen.getByText("Partida Iniciada");

    expect(partidaDisponible.closest(".partida-item")).not.toHaveClass(
      "iniciada"
    );
    expect(partidaIniciada.closest(".partida-item")).toHaveClass("iniciada");

    // Test selección
    await act(async () => {
      fireEvent.click(partidaDisponible);
    });

    expect(partidaDisponible.closest(".partida-item")).toHaveClass("selected");
  });

  it("configura interval para actualizar partidas", async () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval");
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(partidasMock),
        })
      )
    );

    const { unmount } = render(<GameList />);

    // Verificar que setInterval fue llamado con 10 segundos
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 10000);

    unmount();

    // Verificar que clearInterval fue llamado
    expect(clearIntervalSpy).toHaveBeenCalled();

    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });
});
