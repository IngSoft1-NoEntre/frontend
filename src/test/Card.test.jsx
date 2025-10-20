import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../components/Card';
import { GameStateContext } from '../context/GameStateContext'; 
import '@testing-library/jest-dom';

/*
  Card toma el string cardname y se fija en GameStateContext que imagen precargada mostrar
  tiene la habilidad de ser seleccionada, siempre y cuando el elemento padre (Hand) le pase IsSelectable true
  esto es para que no puedas seleccionar la carta cuando esta en otro lado, por ejemplo en la mano de otro jugador o etc

  Usamos un .css dinamico, las cartas cambian de clase cuando por ejemplo le ponemos el mouse arriba o le hacemos click.
  Esto es util porque podemos aplicar effectos .css como que
  otro ejemplo, apretar ctrl en una clase aplica la clase zoom, la cual simplemente multimplica el tamaṅo del objeto hmtl

*/

// Mock
const MOCK_CARD_PICTURES = {
  "aaa": "url-aaa.png",
  "bbb": "url-bbb.png",
  "card_back": "url-back.png",
};

const DEFAULT_CONTEXT_VALUE = {
  cardPictures: MOCK_CARD_PICTURES,
};

const TestWrapper = ({ children, contextValue }) => (
  <GameStateContext.Provider value={contextValue}>
    {children}
  </GameStateContext.Provider>
);

describe('Card Component', () => {
  const onSelectMock = vi.fn();
  const defaultProps = {
    cardname: 'aaa',
    faceUp: true,
    cardId: 'card-123',
    isSelectable: false,
    isSelected: false,
    onSelect: onSelectMock,
  };

  const renderCard = (propsOverrides = {}) => {
    const props = { ...defaultProps, ...propsOverrides };
      return render(
        <TestWrapper contextValue={DEFAULT_CONTEXT_VALUE}>
          <Card {...props} />
        </TestWrapper>
      );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza la carta bbb cuando faceUp es true', () => {
    renderCard({ cardname: 'bbb', faceUp: true });

    const component = screen.getByAltText('bbb');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('src', MOCK_CARD_PICTURES['bbb']);
  });

  it('renderiza imagen card_back cuando faceUp es false', () => {
    renderCard({ faceUp: false });

    const component = screen.getByAltText('card_back');
    expect(component).toBeInTheDocument();
    expect(component).toHaveAttribute('src', MOCK_CARD_PICTURES['card_back']);
  });

  it('renderiza null cuando falta el cardname', () => {
    const { container } = renderCard({ cardname: null });

    expect(container.firstChild).toHaveClass('card-spacer');
    expect(container.firstChild).not.toHaveClass('cardframe');
  });

  it('llama a onSelect, cuando isSelectable es true', () => {
    renderCard({ isSelectable: true });

    const component = screen.getByAltText('aaa').closest('div');
    fireEvent.click(component);
    expect(onSelectMock).toHaveBeenCalledTimes(1);
    fireEvent.click(component);
    expect(onSelectMock).toHaveBeenCalledTimes(2);
  });

  it('no llama a onSelect, cuando isSelectable es false, ', () => {
    renderCard({ isSelectable: false });

    const component = screen.getByAltText('aaa').closest('div');
    fireEvent.click(component);
    expect(onSelectMock).not.toHaveBeenCalled();
  });

  it('aplica la clase cardframe--selected cuando es seleccionada', () => {
    renderCard({ isSelected: true });
    
    const component = screen.getByAltText('aaa').closest('div');
    expect(component).toHaveClass('cardframe--selected');
  });
    
  it('aplica la clase cardframe--selectable cuando isSelectable es true', () => {
    renderCard({ isSelectable: true });

    const component = screen.getByAltText('aaa').closest('div');
    expect(component).toHaveClass('cardframe--selectable');
  });

  it('aplica la clase hover y zoom cuando se aprieta ctrl', () => {
    renderCard({ faceUp: true, isSelected: false });
    const component = screen.getByAltText('aaa').closest('div');

    fireEvent.mouseEnter(component);
    expect(component).toHaveClass('cardframe--hover'); // se aplica el hover

    fireEvent.keyDown(component, { key: 'Control', ctrlKey: true });
    expect(component).toHaveClass('cardframe--zoom');
    expect(component).not.toHaveClass('cardframe--hover'); // zoom
    fireEvent.keyUp(component, { key: 'Control' });
    expect(component).not.toHaveClass('cardframe--zoom');
  });
});
