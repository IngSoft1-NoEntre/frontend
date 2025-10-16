import { useState, createContext } from 'react';
import { GameStateContext } from './GameStateContext';

import card_00 from '../assets/Cartas/00-help.png';
import card_01 from '../assets/Cartas/01-card_back.png';
import card_02 from '../assets/Cartas/02-murder_escapes.png';
import card_03 from '../assets/Cartas/03-secret_murderer.png';
import card_04 from '../assets/Cartas/04-secret_accomplice.png';
import card_05 from '../assets/Cartas/05-secret_front.png';
import card_06 from '../assets/Cartas/06-secret_back.png';
import card_07 from '../assets/Cartas/07-detective_poirot.png';
import card_08 from '../assets/Cartas/08-detective_marple.png';
import card_09 from '../assets/Cartas/09-detective_satterthwaite.png';
import card_10 from '../assets/Cartas/10-detective_pyne.png';
import card_11 from '../assets/Cartas/11-detective_brent.png';
import card_12 from '../assets/Cartas/12-detective_tommyberesford.png';
import card_13 from '../assets/Cartas/13-detective_tuppenceberesford.png';
import card_14 from '../assets/Cartas/14-detective_quin.png';
import card_15 from '../assets/Cartas/15-detective_oliver.png';
import card_16 from '../assets/Cartas/16-Instant_notsofast.png';
import card_17 from '../assets/Cartas/17-event_cardsonthetable.png';
import card_18 from '../assets/Cartas/18-event_anothervictim.png';
import card_19 from '../assets/Cartas/19-event_deadcardfolly.png';
import card_20 from '../assets/Cartas/20-event_lookashes.png';
import card_21 from '../assets/Cartas/21-event_cardtrade.png';
import card_22 from '../assets/Cartas/22-event_onemore.png';
import card_23 from '../assets/Cartas/23-event_delayescape.png';
import card_24 from '../assets/Cartas/24-event_earlytrain.png';
import card_25 from '../assets/Cartas/25-event_pointsuspicions.png';
import card_26 from '../assets/Cartas/26-devious_blackmailed.png';
import card_27 from '../assets/Cartas/27-devious_fauxpas.png';

const TOTAL_CARDS = 64;

// **Listado de cartas a excluir de la mano de los jugadores**
const EXCLUDED_CARD_KEYS = [
    "help",
    "card_back",
    "secret_back", 
    "murder_escapes", 
    "youre_the_murderer", 
    "youre_the_accomplice", 
    "varios" //caras de los secretos
];

const GameStateProvider = ({ children }) => {

  const [localPlayerCards, setLocalPlayerCards] = useState([]); 
  const [selectedCardIds, setSelectedCardIds] = useState([]); // Estado de selección

  // esto es un dict para consultar que imagen tiene que mostrar cada carta
  // formas de hacerlo:
  // 1) con dict, llaves con strings, pero es menos eficiente ?  igual son pocas cartas, debe tener algun cache?
  // 2) con array, mas eficiente ? pero requiere decidir los id unicos para cada carta
  const [cardPictures, setCardPictures] = useState({
    "help" : card_00,
    "card_back" : card_01,
    "murder_escapes" : card_02,
    "youre_the_murderer" : card_03,
    "youre_the_accomplice" : card_04,
    "varios" : card_06,
    "secret_back" : card_05,
    "hercule_poirot" : card_07,
    "miss_marple" : card_08,
    "mr_satterthwhite" : card_09,
    "parker_pyne" : card_10,
    "lady_eileen_brent" : card_11,
    "tommy_beresford" : card_12,
    "tuppence_beresford" : card_13,
    "harley_quin_wildcard" : card_14,
    "ariadne_oliver" : card_15,
    "not_so_fast" : card_16,
    "cards_off_the_table" : card_17,
    "another_victim" : card_18,
    "dead_card_folly" : card_19,
    "look_into_the_ashes" : card_20,
    "card_trade" : card_21,
    "and_then_there_was_one_more" : card_22,
    "delay_the_murderers_space" : card_23,
    "early_train_to_paddington" : card_24,
    "point_your_suspicions" : card_25,
    "blackmailed" : card_26,
    "social_faux_pass" : card_27,
  });

  const [discardPileCards, setDiscardPileCards] = useState([]);

  // Función para simular el robo de una carta del mazo
  const drawCardFromDeck = (existingCards) => {
    // Filtramos las claves que NO están en la lista de excluidas
    const availableKeys = Object.keys(cardPictures).filter(key => 
      !EXCLUDED_CARD_KEYS.includes(key)
    );
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
        
    // Genera un ID realmente único
    let newId;
    do {
        newId = Date.now() + Math.floor(Math.random() * 10000);
    } while (existingCards.some(card => card.id === newId));

    return { 
      id: newId,
      title: randomKey, 
      type: "Simulated" 
    };
  };

  //Funcion para seleccion/deseleccionar una carta
  const toggleCardSelection = (cardId) => {
    setSelectedCardIds(prevIds => {
      if (prevIds.includes(cardId)) {
        return prevIds.filter(id => id !== cardId);
      } else {
        return [...prevIds, cardId];
      }
    });
  };

  //Funcion principal para descartar y reponer(descarte ordenado)
  const discardSelectedCards = () => {
    if (selectedCardIds.length === 0) return;

    // Obtener las cartas a descartar EN ORDEN DE SELECCIÓN
    const cardsToDiscard = selectedCardIds.map(id => 
        localPlayerCards.find(card => card.id === id)
    ).filter(Boolean); // Filtramos por si acaso

    // Mover las cartas descartadas a la pila de descarte
    setDiscardPileCards(prevDiscardPile => {
        // El orden en selectedCardIds es el orden en que se descartaron.
        return [
            ...prevDiscardPile,
            // Las cartas descartadas se añaden en el orden de selección (selectedCardIds)
            ...cardsToDiscard.map(c => ({ title: c.title })) 
        ];
    });

    // Actualizar la mano del jugador
    setLocalPlayerCards(prevHand => {
        const cardsToKeep = prevHand.filter(card => !selectedCardIds.includes(card.id));
        let newHand = [...cardsToKeep];
        const cardsToDrawCount = cardsToDiscard.length;
        let currentDeckCount = TOTAL_CARDS - discardPileCards.length;
        
        // Reponer del mazo (simulado) hasta completar la mano
        for (let i = 0; i < cardsToDrawCount; i++) {
            // Verifica que haya cartas disponibles para robar
            if (currentDeckCount > 0) {
                // Pasamos la mano actual para asegurar que el ID de la nueva carta sea único
                newHand.push(drawCardFromDeck(newHand));
                currentDeckCount--;
            } else {
                break;
            }
        }
        return newHand;
    });
            
    // Limpiar las cartas seleccionadas
    setSelectedCardIds([]);
  };

  const deckCount = TOTAL_CARDS - discardPileCards.length;

  const contextValue = { 
    localPlayerCards,
    setLocalPlayerCards, 
    cardPictures,
    discardPileCards,
    setDiscardPileCards,
    discardSelectedCards,  
    toggleCardSelection,   
    selectedCardIds,       
    TOTAL_CARDS,
    deckCount
  };

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateProvider;