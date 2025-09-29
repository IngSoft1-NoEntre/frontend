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


  test('muestra error si el nombre supera los 29 caracteres', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <JugadorForm />
      </BrowserRouter>
    );

    const nombreLargo = 'A'.repeat(30);
    await user.type(screen.getByPlaceholderText(/nombre/i), nombreLargo);
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2000-09-09');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    const error = await screen.findByText(/el nombre no puede tener más de 29 caracteres/i);
    expect(error).toBeInTheDocument();
  });


  test('muestra error si el nombre es solo números', async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <JugadorForm />
      </BrowserRouter>
    );

    // Simular ingreso de nombre numérico
    await user.type(screen.getByPlaceholderText(/nombre/i), '123');
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2000-09-09');

    // Simular envío del formulario
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    // Verificar que se muestra el mensaje de error
    const error = await screen.findByText(/el nombre no puede ser solo números/i);
    expect(error).toBeInTheDocument();
  });

  test('muestra mensaje de error si el backend responde con error 400', async () => {
    const user = userEvent.setup();

    // Simular respuesta con error
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Ya existe un jugador con ese nombre' }),
      })
    );

    render(
      <BrowserRouter>
        <JugadorForm />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Bianca');
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2000-09-09');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    const error = await screen.findByText(/ya existe un jugador con ese nombre/i);
    expect(error).toBeInTheDocument();
  });

  test('muestra mensaje genérico si el backend no devuelve detail', async () => {
    const user = userEvent.setup();

    // Simular respuesta con error sin detail
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      })
    );

    render(
      <BrowserRouter>
        <JugadorForm />
      </BrowserRouter>
    );

    await user.type(screen.getByPlaceholderText(/nombre/i), 'Bianca');
    await user.type(screen.getByLabelText(/fecha de nacimiento/i), '2000-09-09');
    await user.click(screen.getByRole('button', { name: /enviar/i }));

    const error = await screen.findByText(/error al crear jugador/i);
    expect(error).toBeInTheDocument();
  });
});
