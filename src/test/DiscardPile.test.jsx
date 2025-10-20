import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DiscardPile from "../components/DiscardPile";
import "@testing-library/jest-dom";

describe("DiscardPile", () => {
  it("renderiza el contenedor principal con clase discard-pile", () => {
    const { container } = render(
      <DiscardPile cards={['aaa', 'bbb']} currentCount={2} totalCount={50} />
    );
    const containerDiv = container.querySelector(".discard-pile");
    expect(containerDiv).toBeInTheDocument();
  });

  it("renderiza un slot vacío si la pila está vacía", () => {
    const { container } = render(
      <DiscardPile cards={[]} currentCount={0} totalCount={50} />
    );
    const emptySlot = container.querySelector(".discard-pile-empty-slot");
    expect(emptySlot).toBeInTheDocument();
  });

  it("muestra la carta superior si hay cartas", () => {
    render(<DiscardPile cards={['aaa']} currentCount={1} totalCount={50} />);
    // como no hay texto, podemos chequear que el div con la clase exista
    const graphic = document.querySelector(".discard-pile-graphic");
    expect(graphic).toBeInTheDocument();
  });
});
