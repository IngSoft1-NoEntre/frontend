import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Deck from '../components/Deck';
import '@testing-library/jest-dom';

// Mock de los subcomponentes
vi.mock('../components/DeckPile', () => ({
  default: ({ currentCount, totalCount }) => (
    <div data-testid="deck-pile">{currentCount}/{totalCount}</div>
  )
}));

vi.mock('../components/DiscardPile', () => ({
  default: ({ cards, currentCount, totalCount }) => (
    <div data-testid="discard-pile">{currentCount}/{totalCount} discard</div>
  )
}));

describe('Deck', () => {
  it('renderiza correctamente el DeckPile y DiscardPile con props', () => {
    const mockDiscard = ['Fuego', 'Agua'];
    render(<Deck deckCount={40} totalCards={50} discardCards={mockDiscard} />);

    const deckPile = screen.getByTestId('deck-pile');
    const discardPile = screen.getByTestId('discard-pile');

    // Verificamos que reciba correctamente las props
    expect(deckPile).toHaveTextContent('40/50');
    expect(discardPile).toHaveTextContent('2/50 discard');
  });

  it('maneja el caso de pila de descarte vacía', () => {
    render(<Deck deckCount={30} totalCards={50} discardCards={[]} />);
    const discardPile = screen.getByTestId('discard-pile');
    expect(discardPile).toHaveTextContent('0/50 discard');
  });
});
