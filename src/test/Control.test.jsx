import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Controls from '../components/Controls';
import { GameStateContext } from '../context/GameStateContext';
import '@testing-library/jest-dom';




// wrapper para GameStateContext
const TestWrapper = ({ children, contextValue }) => (
  <GameStateContext.Provider value={contextValue}>
    {children}
  </GameStateContext.Provider>
);

describe('Controls', () => {
  //mock funciones
  const onDiscardMock = vi.fn();
  const onEndTurnMock = vi.fn();


  //esta es la forma que me gusto de mockear el GameStateContext

  // en DEFAULT_CONTEXT_VALUE definir los valores por defecto que va a tener para los test
  // luego contextOverrides y propsOverrides se puede sobrescribir esos valores

  // contextOverrides sobreescribe valores de DEFAULT_CONTEXT_VALUE
  // como esta vacio, no sobreescibe nada
  // pero podriamos usarlo para sobreescribir valores en los test que queramos.
  // ejemplo contextOverrides = { deckCount: 5 } sobre escribiria el valor de deckCount en DEFAULT_CONTEXT_VALUE
  // lo mismo con propsOverrides
  
  const DEFAULT_CONTEXT_VALUE = {
    selectedCardIds: [], 
    discardPileCards: [], 
    deckCount: 40,
    TOTAL_CARDS: 50,
  };

  const renderControls = (contextOverrides = {}, propsOverrides = {}) => {
    const contextValue = { ...DEFAULT_CONTEXT_VALUE, ...contextOverrides };
    const props = {
      onDiscard: onDiscardMock,
      onEndTurn: onEndTurnMock,
        canEndTurn: true,
        ...propsOverrides,
    };
    return render(
      <TestWrapper contextValue={contextValue}>
        <Controls {...props} />
      </TestWrapper>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('boton descartar no hace nada cuando no hay cartas seleccionadas', () => {
    renderControls();
    const discardButton = screen.getByText('Descartar');    
    expect(discardButton).toBeInTheDocument();
    expect(discardButton).toBeDisabled();
    fireEvent.click(discardButton);
    expect(onDiscardMock).not.toHaveBeenCalled();
    });

  it('boton Descartar, se puede llamar a onDiscard cuando hay cartas seleccionadas', () => {
    const SELECTED_COUNT = 3;
    renderControls({ selectedCardIds: ['a', 'b', 'c'] });

    const discardButton = screen.getByText(`Descartar ${SELECTED_COUNT} Carta(s)`);
    expect(discardButton).toBeInTheDocument();
    expect(discardButton).not.toBeDisabled();
    fireEvent.click(discardButton);
    expect(onDiscardMock).toHaveBeenCalledTimes(1);
  });

  it('No se puede descartar mas cartas de las que tengo', () => {
    renderControls({ 
      selectedCardIds: ['a', 'b', 'c', 'd'], //por alguna razon, supongamos que quedaron mas cartas seleccionadas
      deckCount: 3
    });
    //checkeamos que no se pueda llamar a onDiscardMock, ya que resultaria en en un deckCount negativo
    const discardButton = screen.getByText(/Descartar 4 Carta\(s\)/i);
    expect(discardButton).toBeDisabled();
    fireEvent.click(discardButton);
    expect(onDiscardMock).not.toHaveBeenCalled();
  });

  it('el boton Finalizar turno esta desabilitado, cuando canEndTurn es false', () => {
    renderControls({}, { canEndTurn: false });

    const endTurnButton = screen.getByText('Finalizar turno');
    expect(endTurnButton).toBeDisabled();
    fireEvent.click(endTurnButton);
    expect(onEndTurnMock).not.toHaveBeenCalled();
  });

  it('El boton Finalizar turno llama a onEndTurn, cuando canEndTurn es true', () => {
    renderControls({}, { canEndTurn: true });

    const endTurnButton = screen.getByText('Finalizar turno');
    expect(endTurnButton).not.toBeDisabled();  
    fireEvent.click(endTurnButton);
    expect(onEndTurnMock).toHaveBeenCalledTimes(1);
  });
});
