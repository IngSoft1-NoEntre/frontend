import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SecretModal from '../components/SecretModal.jsx';

// Mock revelado
const ItemRevelado = {
  title: 'secreto 1',
  revealed: true,
  frontImage: 'card_front',
  image: 'card_front',
};

// Mock oculto
const ItemOculto = {
  title: 'secreto 1',
  revealed: false,
  frontImage: 'card_front',
  image: 'card_front',
};

let mockOnClose;
beforeEach(() => {
  mockOnClose = vi.fn();
});

describe('SecretModal', () => {
  it('no renderiza nada si item es null', () => {
    const { container } = render(<SecretModal item={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('no renderiza nada si el item no esta revelado', () => {
    const { container } = render(<SecretModal item={ItemOculto} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });
  
  it('no renderiza nada si falta image y frontImage', () => {
    const mock = { title: 'secreto1', revealed: true };
    const { container } = render(<SecretModal item={mock} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });


  it('renderiza el modal y el contenido correctamente', () => {
    const {container} = render(<SecretModal item={ItemRevelado} onClose={mockOnClose} />);
    const modal = screen.getByRole('dialog', { name: ItemRevelado.title });
    expect(modal).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('secretmodal-overlay');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText(ItemRevelado.title)).toBeInTheDocument();
  });
  
  it('llama a onClose al hacer clic en el botón de cerrar', () => {
    render(<SecretModal item={ItemRevelado} onClose={mockOnClose} />);
    const closeButton = screen.getByRole('button', { name: 'Cerrar' });
    fireEvent.click(closeButton);   
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('llama a onClose al presionar la tecla Escape', () => {
    render(<SecretModal item={ItemRevelado} onClose={mockOnClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  

  
  it('limpia el event listener al desmontar', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<SecretModal item={ItemRevelado} onClose={mockOnClose} />);
    unmount();  
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeSpy.mockRestore();
  });

});