import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FinishGameModal from '../components/FinishGameModal';
import '@testing-library/jest-dom';

/*
  testea string exactos en FinishGameModal

*/

// mock react-router-dom's
const navigateMock = vi.fn();

//cuando un componente intente importar de react-router-dom
//carga todas las funciones reales de react-router-dom en el ...actual
//excepto useNavigate
//importOriginal es una funcion de Vitest
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal(); 
  return {
    ...actual,
    useNavigate: () => navigateMock, 
  };
});

describe('FinishGameModal', () => {
  // mock y clear
  const onCloseMock = vi.fn(); 
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the game over message and play again button correctly', () => {
    render(<FinishGameModal onClose={onCloseMock} />);
    //check que esta todo exacto
    expect(screen.getByText(/Escapó!/i)).toBeInTheDocument();
    expect(screen.getByText(/El mazo se ha agotado./i)).toBeInTheDocument();
    const playAgainButton = screen.getByRole('button', { name: /Volver a Jugar/i });
        expect(playAgainButton).toBeInTheDocument();
    });

    it('se navega a "/" cuando boton "Volver a Jugar" se clickea', () => {
        render(<FinishGameModal onClose={onCloseMock} />);

        const playAgainButton = screen.getByRole('button', { name: /Volver a Jugar/i });
        fireEvent.click(playAgainButton);

        expect(onCloseMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledTimes(1);
        expect(navigateMock).toHaveBeenCalledWith('/');
    });
});
