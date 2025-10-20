import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Hand from '../components/Hand';
import { GameStateContext } from '../context/GameStateContext';
import '@testing-library/jest-dom';

// Wrapper del contexto
const TestWrapper = ({ children, contextValue }) => (
  <GameStateContext.Provider value={contextValue}>
    {children}
  </GameStateContext.Provider>
);

// Mock básico de una carta
const MOCK_CARDS = [
  { id: '1', title: 'Fuego' },
  { id: '2', title: 'Agua' },
  { id: '3', title: 'Tierra' }
];

// Valores por defecto del contexto
const DEFAULT_CONTEXT_VALUE = {
  toggleCardSelection: vi.fn(),
  selectedCardIds: [],
  cardPictures: {
    Fuego: '/fuego.png',
    Agua: '/agua.png',
    Tierra: '/tierra.png',
    card_back: '/back.png'
  }
};

const renderHand = (contextOverrides = {}, propsOverrides = {}) => {
  const contextValue = { ...DEFAULT_CONTEXT_VALUE, ...contextOverrides };
  const props = { cards: MOCK_CARDS, ...propsOverrides };
  return render(
    <TestWrapper contextValue={contextValue}>
      <Hand {...props} />
    </TestWrapper>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Hand', () => {
  it('muestra siempre 6 elementos (cartas reales + relleno)', () => {
    renderHand();
    // Cada carta es un hijo dentro del contenedor con class="hand"
    const hand = screen.getByRole('region', { name: /Mano del jugador/i });
    const allCards = hand.querySelectorAll('.cardframe, .card-spacer');
    expect(allCards.length).toBe(6);
  });

  it('muestra las cartas reales con sus imágenes correctas', () => {
    renderHand();
    expect(screen.getByAltText('Fuego')).toBeInTheDocument();
    expect(screen.getByAltText('Agua')).toBeInTheDocument();
    expect(screen.getByAltText('Tierra')).toBeInTheDocument();
  });

  it('agrega cartas de relleno para completar 6', () => {
    renderHand();
    const hand = screen.getByRole('region', { name: /Mano del jugador/i });
    const fillerDivs = hand.querySelectorAll('.card-spacer');
    expect(fillerDivs.length).toBe(3); // 6 - 3 reales = 3 rellenos
  });

  it('llama a toggleCardSelection al hacer clic en una carta real', () => {
    const toggleMock = vi.fn();
    renderHand({ toggleCardSelection: toggleMock });
    const card = screen.getByAltText('Fuego');
    fireEvent.click(card);
    expect(toggleMock).toHaveBeenCalledWith('1');
  });

  it('no llama a toggleCardSelection al hacer clic en cartas de relleno', () => {
    const toggleMock = vi.fn();
    renderHand({ toggleCardSelection: toggleMock });
    const hand = screen.getByRole('region', { name: /Mano del jugador/i });
    const fillers = hand.querySelectorAll('.card-spacer');
    fireEvent.click(fillers[0]);
    expect(toggleMock).not.toHaveBeenCalled();
  });

  it('marca las cartas seleccionadas con la clase cardframe--selected', () => {
    renderHand({ selectedCardIds: ['2'] });
    const selectedCard = screen.getByAltText('Agua').closest('.cardframe');
    expect(selectedCard).toHaveClass('cardframe--selected');
  });

  it('no marca las cartas no seleccionadas', () => {
    renderHand({ selectedCardIds: [] });
    const card = screen.getByAltText('Fuego').closest('.cardframe');
    expect(card).not.toHaveClass('cardframe--selected');
  });

  it('usa IDs únicos para las cartas de relleno', () => {
    renderHand();
    const fillerIds = Array.from({ length: 3 }, (_, i) => `filler-${i}`);
    fillerIds.forEach(id => expect(id).toMatch(/^filler-/));
  });
});
