import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeckPile from '../components/DeckPile';
import '@testing-library/jest-dom';

describe('DeckPile', () => {
  it('renderiza el contenedor principal con clase deck-pile', () => {
    render(<DeckPile currentCount={30} totalCount={50} />);
    const container = screen.getByText('30 / 50').closest('.deck-pile');
    expect(container).toBeInTheDocument();
  });

  it('muestra correctamente el contador con currentCount y totalCount', () => {
    render(<DeckPile currentCount={40} totalCount={50} />);
    expect(screen.getByText('40 / 50')).toBeInTheDocument();
  });

  it('usa totalCount por defecto si no se pasa', () => {
    render(<DeckPile currentCount={20} />);
    expect(screen.getByText('20 / 45')).toBeInTheDocument();
  });

  it('renderiza el div gráfico con clase deck-pile-graphic', () => {
    render(<DeckPile currentCount={10} totalCount={45} />);
    const graphicDiv = screen.getByText(/10 \/ 45/).previousSibling;
    expect(graphicDiv).toHaveClass('deck-pile-graphic');
  });
});
