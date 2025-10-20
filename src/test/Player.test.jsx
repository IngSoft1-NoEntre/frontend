import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Player from '../components/Player.jsx';

// mock componente hijo
vi.mock('../components/Secret.jsx', () => {
  return {
    default: vi.fn(({ revealed, hoverReveal, data }) => (
      <div 
        data-testid={`mock-secret-${data.title}`}         //forma util para poner un testid
        data-revealed={revealed ? 'true' : 'false'}
        data-hover-reveal={hoverReveal ? 'true' : 'false'}
      />
    )),
  };
});

describe('Player', () => {
  let mockOnOpenSecret;
  const mockFrontUrl = 'card_front';
  const mockBackUrl = 'card_back';

  beforeEach(() => {
    mockOnOpenSecret = vi.fn();
    vi.clearAllMocks(); 
  });

  const localPlayer = { 
    id: 1, 
    nombre: "Pepito", 
    secretos: [true, false, true], 
    isLocal: true 
  };
  
  const remotePlayer = { 
    id: 2, 
    nombre: "pablito", 
    secretos: [true, true, false], 
    isLocal: false 
  };

  //Test 1

  it('renderizar el nombre del jugador', () => {
    render(
      <Player 
        player={localPlayer} 
        onOpenSecret={mockOnOpenSecret} 
        secretFrontUrl={mockFrontUrl} 
        secretBackUrl={mockBackUrl} 
      />
    );

    // checkear
    expect(screen.getByText('Pepito')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Jugador Pepito' })).toBeInTheDocument();
  });

 
  

});