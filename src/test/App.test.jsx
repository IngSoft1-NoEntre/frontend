// src/test/App.test.jsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../App";

// Mock simple para no montar la implementación real
vi.mock("../components/JugadorForm", () => ({ default: () => <div>Mock JugadorForm</div> }));
vi.mock("../components/GameForm", () => ({ default: () => <div>Mock GameForm</div> }));
vi.mock("../components/LobbyContainer", () => ({ default: () => <div>Mock LobbyContainer</div> }));

describe("App routes", () => {
  it("renderiza JugadorForm en /", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Mock JugadorForm/i)).toBeInTheDocument();
  });

  it("renderiza GameForm dentro del layout en /home", () => {
    render(
      <MemoryRouter initialEntries={["/home"]}>
        <App />
      </MemoryRouter>
    );

    // Comprueba el layout
    const main = document.querySelector(".contenedor");
    expect(main).toBeTruthy();

    // Comprueba la sección izquierda y que el mock está ahí
    expect(screen.getByText(/Mock GameForm/i)).toBeInTheDocument();
  });

  it("renderiza LobbyContainer en /lobby/:partidaId", () => {
    render(
      <MemoryRouter initialEntries={["/lobby/77"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Mock LobbyContainer/i)).toBeInTheDocument();
  });
});
