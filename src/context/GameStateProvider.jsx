import { useState } from 'react';
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

//ejemplo suponiendo que hay un id unico por carta
const GameStateProvider = ({ children }) => {


  //estado del juego, en un componente separado para ganar eficiencia
  const [ThePlayerCards, setThePlayerCards] = useState([]);

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
    "varios" : card_05,
    "secret_back" : card_06,
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

  // funcion para descartar
    const discardOneCard = () => {
        const currentDiscardCount = discardPileCards.length;
        if (currentDiscardCount < TOTAL_CARDS) {
            
            // --- Lógica de simulación para tomar una carta aleatoria ---
            const availableKeys = Object.keys(cardPictures).filter(key => 
                key !== "card_back" && key !== "secret_back" && key !== "help"
            );
            const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
            
            // Actualiza el estado añadiendo una nueva carta
            setDiscardPileCards(prevCards => [
                ...prevCards,
                { title: randomKey, type: "Simulated" } 
            ]);
        }
    };

    const contextValue = { 
        ThePlayerCards, 
        setThePlayerCards, 
        cardPictures,
        // ESTO ES LO NUEVO:
        discardPileCards,       // El array de cartas descartadas
        discardOneCard,         // La función para descartar
        TOTAL_CARDS             // La constante total
    };

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateProvider;