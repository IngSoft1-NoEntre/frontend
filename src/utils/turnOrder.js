/**
 * Calcula el orden de turnos basado en fecha de nacimiento más cercana al 15 de septiembre
 * y luego por ID de jugador
 */
export function calculateTurnOrder(jugadores) {
  if (!jugadores || jugadores.length === 0) return [];

  // Función para calcular la distancia a septiembre 15
  const getDistanceToSep15 = (fechaNacimiento) => {
    if (!fechaNacimiento) return Infinity;

    const birthDate = new Date(fechaNacimiento);
    const currentYear = new Date().getFullYear();
    const sep15ThisYear = new Date(currentYear, 8, 15); // Septiembre = mes 8 (0-indexed)
    const sep15NextYear = new Date(currentYear + 1, 8, 15);
    
    // Calcular distancia a este año y el próximo
    const distanceThisYear = Math.abs(birthDate.getTime() - sep15ThisYear.getTime());
    const distanceNextYear = Math.abs(birthDate.getTime() - sep15NextYear.getTime());
    
    return Math.min(distanceThisYear, distanceNextYear);
  };

  // Ordenar jugadores
  const sortedJugadores = [...jugadores].sort((a, b) => {
    const distanceA = getDistanceToSep15(a.fecha_nacimiento);
    const distanceB = getDistanceToSep15(b.fecha_nacimiento);
    
    // Primero por distancia a septiembre 15
    if (distanceA !== distanceB) {
      return distanceA - distanceB;
    }
    
    // Si hay empate, ordenar por ID
    return a.id - b.id;
  });

  return sortedJugadores;
}

/**
 * Obtiene el siguiente jugador en el orden de turnos
 */
export function getNextPlayer(jugadores, currentPlayerId) {
  const orderedPlayers = calculateTurnOrder(jugadores);
  const currentIndex = orderedPlayers.findIndex(p => p.id === currentPlayerId);
  
  if (currentIndex === -1) return orderedPlayers[0]; // Si no se encuentra, empezar desde el primero
  
  const nextIndex = (currentIndex + 1) % orderedPlayers.length;
  return orderedPlayers[nextIndex];
}

/**
 * Obtiene el primer jugador (quien empieza)
 */
export function getFirstPlayer(jugadores) {
  const orderedPlayers = calculateTurnOrder(jugadores);
  return orderedPlayers[0] || null;
}