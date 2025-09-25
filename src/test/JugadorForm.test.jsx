import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import JugadorForm from '../components/JugadorForm';

describe('JugadorForm', () => {
  beforeEach(() => {
    // Mockear fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access_token: 'mock-token' }),
      })
    );

    // Mockear localStorage
    vi.spyOn(Storage.prototype, 'setItem');

    // Mockear useNavigate
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => vi.fn(),
      };
    });
  });

  test('envía el formulario correctamente', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <JugadorForm />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Bianca');
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2000-09-09');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/auth/jugadores/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: 'Bianca',
            fecha_nacimiento: '2000-09-09',
          }),
        })
      );
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('usuario', 'Bianca');
  });
});
