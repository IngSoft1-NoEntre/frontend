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
  { id: 1, nombre: "Partida Uno", estado: "disponible" },
  { id: 2, nombre: "Partida Dos", estado: "disponible" },
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

  it("muestra partidas disponibles", async () => {
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
    expect(await screen.findByText("Partida Uno")).toBeInTheDocument();
    expect(screen.getByText("Partida Dos")).toBeInTheDocument();
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

  it("llama a fetch y navega al lobby al unirse", async () => {
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
          json: () => Promise.resolve({}),
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
});
