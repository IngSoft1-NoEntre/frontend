import React from "react";
import { describe, it, vi, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameForm from "../components/GameForm";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({ useNavigate: () => mockNavigate }));

describe("GameForm integration", () => {
  beforeEach(() => {
    window.localStorage.setItem("token", "tok");
    global.fetch = vi.fn();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });
  //En el it te describe lo que hace el test
  it("renderiza todos los inputs y el botón", () => {
    render(<GameForm />);
    expect(screen.getByText(/Crea una partida/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Nombre de la partida/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Mínima cantidad de jugadores/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Máxima cantidad de jugadores/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Crear/i })).toBeInTheDocument();
  });

  it("permite escribir en los inputs", () => {
    render(<GameForm />);
    const nombreInput = screen.getByPlaceholderText(/Nombre de la partida/i);
    fireEvent.change(nombreInput, { target: { value: "Los increibles" } });
    expect(nombreInput.value).toBe("Los increibles");

    const minInput = screen.getByPlaceholderText(/Mínima cantidad de jugadores/i);
    fireEvent.change(minInput, { target: { value: "3" } });
    expect(minInput.value).toBe("3");

    const maxInput = screen.getByPlaceholderText(/Máxima cantidad de jugadores/i);
    fireEvent.change(maxInput, { target: { value: "5" } });
    expect(maxInput.value).toBe("5");
  });

  it("valida las reglas del formulario y muestra errores en pantalla", async () => {
    render(<GameForm />);

    // Nombre demasiado largo
    fireEvent.change(screen.getByPlaceholderText(/Nombre de la partida/i), {
      target: { value: "Los increiblesssssssssssssssss" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Mínima cantidad de jugadores/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Máxima cantidad de jugadores/i), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear/i }));
    expect(await screen.findByText(/El nombre no puede tener más de 29 caracteres/i)).toBeInTheDocument();

    // Corregir nombre para siguientes validaciones
    fireEvent.change(screen.getByPlaceholderText(/Nombre de la partida/i), {
      target: { value: "Partida válida" },
    });

    // Mínimo < 2
    fireEvent.change(screen.getByPlaceholderText(/Mínima cantidad de jugadores/i), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Máxima cantidad de jugadores/i), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear/i }));
    expect(await screen.findByText(/La cantidad mínima de jugadores debe ser al menos 2/i)).toBeInTheDocument();

    // Máximo > 6
    fireEvent.change(screen.getByPlaceholderText(/Mínima cantidad de jugadores/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Máxima cantidad de jugadores/i), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear/i }));
    expect(await screen.findByText(/La cantidad máxima de jugadores no puede superar 6/i)).toBeInTheDocument();

    // Mínimo > Máximo
    fireEvent.change(screen.getByPlaceholderText(/Mínima cantidad de jugadores/i), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Máxima cantidad de jugadores/i), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Crear/i }));
    expect(await screen.findByText(/La cantidad mínima no puede ser mayor que la máxima/i)).toBeInTheDocument();
  });


  it("envía fetch y navega cuando todo OK", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 77 }),
    });

    render(<GameForm />);
    fireEvent.change(screen.getByPlaceholderText(/Nombre de la partida/i), { target: { value: "P" } });
    fireEvent.change(screen.getByPlaceholderText(/Mínima cantidad de jugadores/i), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText(/Máxima cantidad de jugadores/i), { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: /Crear/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/lobby/77");
  });
});
