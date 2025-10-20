import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import TurnoIndicator from "../components/TurnoIndicator";
import React from "react";

// Mock de los componentes hijos
vi.mock("../components/Player", () => ({
  default: ({ player }) => (
    <div data-testid={`player-${player.id}`}>{player.nombre}</div>
  ),
}));

vi.mock("../components/Hand", () => ({
  default: ({ cards }) => <div data-testid="hand">{cards.length} cartas</div>,
}));

vi.mock("../components/Secret", () => ({
  default: ({ revealed }) => (
    <div data-testid={`secret-${revealed}`}>
      {revealed ? "Revelado" : "Oculto"}
    </div>
  ),
}));

describe("TurnoIndicator", () => {
  const mockOnDescartar = vi.fn();
  const mockOnSaltarTurno = vi.fn();
  const mockOnTerminarTurno = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== CASO: Partida cargando ====================
  describe("Estado de carga", () => {
    it("debe mostrar mensaje de carga cuando no hay jugadores", () => {
      render(
        <TurnoIndicator
          ordenTurnos={[]}
          turnoActualId={null}
          localPlayerId={null}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      expect(screen.getByText("Cargando partida...")).toBeInTheDocument();
      expect(screen.getByText("⏳")).toBeInTheDocument();
    });

    it("debe mostrar mensaje de carga cuando localPlayerId no está en ordenTurnos", () => {
      const ordenTurnos = [
        {
          id: 1,
          nombre: "Jorge",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
        {
          id: 2,
          nombre: "Pedro",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
      ];

      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1}
          localPlayerId={999} // ID que no existe
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      expect(screen.getByText("Cargando partida...")).toBeInTheDocument();
    });
  });

  // ==================== CASO: 2 jugadores ====================
  describe("Partida con 2 jugadores", () => {
    const ordenTurnos = [
      {
        id: 1,
        nombre: "Jorge",
        secretos: [false, false, false],
        isLocal: false,
        cards: [],
      },
      {
        id: 2,
        nombre: "Agustin",
        secretos: [true, false, false],
        isLocal: true,
        cards: [
          { id: 101, title: "hercule_poirot" },
          { id: 102, title: "miss_marple" },
        ],
      },
    ];

    it("debe distribuir jugadores correctamente (otro arriba)", () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1}
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Jorge debe estar en top
      expect(screen.getByTestId("player-1")).toBeInTheDocument();
      expect(screen.getByText("Jorge")).toBeInTheDocument();

      // Agustin es local (mano visible)
      expect(screen.getByTestId("hand")).toHaveTextContent("2 cartas");
    });

    it("debe mostrar corona al jugador con turno", () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1} // Turno de Jorge
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      const coronas = screen.getAllByText("👑");
      expect(coronas.length).toBeGreaterThan(0);
      expect(screen.getByText("Turno de Jorge")).toBeInTheDocument();
    });

    it('debe mostrar "Tu turno" cuando es el turno del jugador local', () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2} // Turno de Agustin (local)
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      expect(screen.getByText("Tu turno")).toBeInTheDocument();
      expect(screen.getByText("🎯")).toBeInTheDocument();
    });
  });

  // ==================== CASO: 3 jugadores ====================
  describe("Partida con 3 jugadores", () => {
    const ordenTurnos = [
      {
        id: 1,
        nombre: "Pedro",
        secretos: [false, false, false],
        isLocal: false,
        cards: [],
      },
      {
        id: 2,
        nombre: "Juan",
        secretos: [false, false, false],
        isLocal: false,
        cards: [],
      },
      {
        id: 3,
        nombre: "Eustaquio",
        secretos: [true, true, false],
        isLocal: true,
        cards: [],
      },
    ];

    it("debe distribuir jugadores correctamente (izquierda y derecha)", () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1}
          localPlayerId={3}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Verificar que los otros jugadores estén presentes
      expect(screen.getByText("Pedro")).toBeInTheDocument();
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    it("debe mostrar los secretos del jugador local correctamente", () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={3}
          localPlayerId={3}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Debe haber 3 secretos
      const secretos = screen.getAllByTestId(/^secret-/);
      expect(secretos).toHaveLength(3);

      // 2 revelados, 1 oculto
      expect(screen.getAllByText("Revelado")).toHaveLength(2);
      expect(screen.getAllByText("Oculto")).toHaveLength(1);
    });
  });

  // ==================== CASO: 4, 5, 6 jugadores ====================
  describe("Partida con 4+ jugadores", () => {
    it("debe manejar 4 jugadores correctamente", () => {
      const ordenTurnos = [
        {
          id: 1,
          nombre: "P1",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
        {
          id: 2,
          nombre: "P2",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
        {
          id: 3,
          nombre: "P3",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
        {
          id: 4,
          nombre: "Local",
          secretos: [false, false, false],
          isLocal: true,
          cards: [],
        },
      ];

      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1}
          localPlayerId={4}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      expect(screen.getByText("P1")).toBeInTheDocument();
      expect(screen.getByText("P2")).toBeInTheDocument();
      expect(screen.getByText("P3")).toBeInTheDocument();
    });

    it("debe manejar 6 jugadores correctamente", () => {
      const ordenTurnos = Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        nombre: `P${i + 1}`,
        secretos: [false, false, false],
        isLocal: i === 5,
        cards: [],
      }));

      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1}
          localPlayerId={6}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Verificar que todos los jugadores estén presentes
      for (let i = 1; i <= 5; i++) {
        expect(screen.getByText(`P${i}`)).toBeInTheDocument();
      }
    });
  });

  // ==================== CASO: Botones de acción ====================
  describe("Botones de acción", () => {
    const ordenTurnos = [
      {
        id: 1,
        nombre: "Pedro",
        secretos: [false, false, false],
        isLocal: false,
        cards: [],
      },
      {
        id: 2,
        nombre: "Local",
        secretos: [false, false, false],
        isLocal: true,
        cards: [],
      },
    ];

    it("debe deshabilitar botones cuando NO es el turno del jugador local", () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1} // Turno de Pedro
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      const btnDescartar = screen.getByTitle("Descartar carta");
      const btnSaltar = screen.getByTitle("Saltar turno");
      const btnTerminar = screen.getByTitle("Terminar turno");

      expect(btnDescartar).toBeDisabled();
      expect(btnSaltar).toBeDisabled();
      expect(btnTerminar).toBeDisabled();
    });

    it("debe habilitar botones cuando ES el turno del jugador local", () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2} // Turno de Local
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      const btnDescartar = screen.getByTitle("Descartar carta");
      const btnSaltar = screen.getByTitle("Saltar turno");
      const btnTerminar = screen.getByTitle("Terminar turno");

      expect(btnDescartar).not.toBeDisabled();
      expect(btnSaltar).not.toBeDisabled();
      expect(btnTerminar).not.toBeDisabled();
    });

    it('debe llamar a onDescartar al hacer clic en "Descartar"', () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2}
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      const btnDescartar = screen.getByTitle("Descartar carta");
      fireEvent.click(btnDescartar);

      expect(mockOnDescartar).toHaveBeenCalledTimes(1);
    });

    it('debe llamar a onSaltarTurno al hacer clic en "Saltar"', () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2}
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      const btnSaltar = screen.getByTitle("Saltar turno");
      fireEvent.click(btnSaltar);

      expect(mockOnSaltarTurno).toHaveBeenCalledTimes(1);
    });

    it('debe llamar a onTerminarTurno al hacer clic en "Terminar"', () => {
      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2}
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      const btnTerminar = screen.getByTitle("Terminar turno");
      fireEvent.click(btnTerminar);

      expect(mockOnTerminarTurno).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== CASO: Rotación de turnos ====================
  describe("Rotación de jugadores en la mesa", () => {
    const ordenTurnos = [
      {
        id: 1,
        nombre: "A",
        secretos: [false, false, false],
        isLocal: false,
        cards: [],
      },
      {
        id: 2,
        nombre: "B",
        secretos: [false, false, false],
        isLocal: false,
        cards: [],
      },
      {
        id: 3,
        nombre: "C",
        secretos: [false, false, false],
        isLocal: true,
        cards: [],
      },
    ];

    it("debe reordenar jugadores con el local al final", () => {
      const { container } = render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={1}
          localPlayerId={3}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // El jugador local debe estar en el área local
      const localArea = container.querySelector(".local-area");
      expect(localArea).toBeInTheDocument();

      // Los otros jugadores deben estar visibles
      expect(screen.getByText("A")).toBeInTheDocument();
      expect(screen.getByText("B")).toBeInTheDocument();
    });
  });

  // ==================== CASO: Edge cases ====================
  describe("Casos extremos", () => {
    it("debe manejar jugador sin secretos definidos", () => {
      const ordenTurnos = [
        { id: 1, nombre: "P1", isLocal: false, cards: [] }, // SIN secretos
        {
          id: 2,
          nombre: "Local",
          secretos: undefined,
          isLocal: true,
          cards: [],
        },
      ];

      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2}
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Debe renderizar con secretos por defecto [false, false, false]
      const secretos = screen.getAllByTestId(/^secret-/);
      expect(secretos).toHaveLength(3);
      expect(screen.getAllByText("Oculto")).toHaveLength(3);
    });

    it("debe manejar jugador sin cartas definidas", () => {
      const ordenTurnos = [
        {
          id: 1,
          nombre: "P1",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
        {
          id: 2,
          nombre: "Local",
          secretos: [false, false, false],
          isLocal: true,
        }, // SIN cards
      ];

      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={2}
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Debe renderizar mano vacía sin errores
      expect(screen.getByTestId("hand")).toHaveTextContent("0 cartas");
    });

    it("debe manejar turnoActualId null", () => {
      const ordenTurnos = [
        {
          id: 1,
          nombre: "P1",
          secretos: [false, false, false],
          isLocal: false,
          cards: [],
        },
        {
          id: 2,
          nombre: "Local",
          secretos: [false, false, false],
          isLocal: true,
          cards: [],
        },
      ];

      render(
        <TurnoIndicator
          ordenTurnos={ordenTurnos}
          turnoActualId={null} // Sin turno definido
          localPlayerId={2}
          onDescartar={mockOnDescartar}
          onSaltarTurno={mockOnSaltarTurno}
          onTerminarTurno={mockOnTerminarTurno}
        />
      );

      // Debe mostrar "..." cuando no hay turno definido
      expect(screen.getByText("Turno de ...")).toBeInTheDocument();
    });
  });
});
