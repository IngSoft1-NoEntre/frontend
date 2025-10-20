import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Secret from '../components/Secret.jsx'

/*--- Test Suite ---
  idea: podriamos tener una sola carta secret y mostrar el texto del secreto como un string
  esto ahorraria crear un monton de cartas secreto con imagenes distintas

  Notas:
  ¿Que pasa si la carta pasa de revelada a oculta?
    creo que nada, pero seria bueno probarlo cuando se pueda ocultar o revelar
  
*/ 

describe('Secret', () => {

  //mock data, funciones
  let mockOnOpen;
  beforeEach(() => {
    mockOnOpen = vi.fn();
  });

  // Test 1 //
  it('comportamiento cuando la carta no esta revelada', () => {
    //mock
    const title = 'test1'
    const frontImage ='card_front'
    const backImage = 'card_back'
    const mockData = { title, frontImage, backImage };

    //render
    render(<Secret revealed={false} data={mockData} onOpen={mockOnOpen} />);

    const component = screen.getByLabelText('test1');
    expect(component).toBeInTheDocument();

    //checkeando clases
    expect(component).not.toHaveClass('revealed');
    expect(component).toHaveAttribute('role', 'img');
    expect(component).toHaveAttribute('aria-label', 'test1');
    expect(component).toHaveAttribute('tabindex', '-1');
    expect(component).toHaveAttribute('style', expect.stringContaining(`${backImage}`));

    //no se deberia poder llamar a OnOpen, ya que la carta no esta revelada
    fireEvent.click(component);
    expect(mockOnOpen).not.toHaveBeenCalled();

    fireEvent.keyDown(component, { key: 'Enter' });
    expect(mockOnOpen).not.toHaveBeenCalled();
  });

  // Test 2 //
  it('comportamiento cuando la carta carta esta revelada', () => {

    const title = 'test2'
    const frontImage ='card_front'
    const backImage = 'card_back'
    const mockData = { title, frontImage, backImage };
    render(<Secret revealed={true} data={mockData} onOpen={mockOnOpen} />);

    const component = screen.getByLabelText('test2');
    expect(component).toBeInTheDocument();

    //checkeando clases
    expect(component).toHaveClass('secret-card-mini'); 
    expect(component).toHaveAttribute('role', 'button');
    expect(component).toHaveAttribute('aria-label', 'test2');
    expect(component).toHaveAttribute('tabindex', '0');
    expect(component).toHaveAttribute('style', expect.stringContaining(`${frontImage}`));

    //se puede llamar a OnOpen, ya que la carta esta revelada
    fireEvent.click(component);
    expect(mockOnOpen).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(component, { key: 'Enter' });
    expect(mockOnOpen).toHaveBeenCalledTimes(2);
  });

  //test 3
  it('cuando falta la imagen devuelve null', () => {
    const mockData = { title: 'test3' };
    const { container } = render(<Secret data={mockData} revealed={true} />);
    expect(container.firstChild).toBeNull();  
  });

});