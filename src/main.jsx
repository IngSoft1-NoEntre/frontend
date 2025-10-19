import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import GameStateProvider from './context/GameStateProvider';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GameStateProvider>
      <App />
    </GameStateProvider>
  </BrowserRouter>
);
