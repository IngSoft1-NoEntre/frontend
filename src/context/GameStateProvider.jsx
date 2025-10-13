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



//ejemplo suponiendo que hay un id unico por carta
const GameStateProvider = ({ children }) => {

  // esto es un dict para consultar que imagen tiene que mostrar cada carta
  // formas de hacerlo:
  // 1) con dict, llaves con strings, pero es menos eficiente ?  igual son pocas cartas, debe tener algun cache?
  // 2) con array, mas eficiente ? pero requiere decidir los id unicos para cada carta
  const [cardPictures, setCardPictures] = useState({
    "help" : card_00,
    "card_back" : card_01,
    "murder_escapes" : card_02,
    "secret_murderer" : card_03,
    "secret_accomplice" : card_04,
    "secret_front" : card_05,
    "secret_back" : card_06,
    "detective_poirot" : card_07,
    "detective_marple" : card_08,
    "detective_satterthwaite" : card_09,
    "detective_pyne" : card_10,
    "detective_brent" : card_11,
    "detective_tommyberesford" : card_12,
    "detective_tuppenceberesford" : card_13,
    "detective_quin" : card_14,
    "detective_oliver" : card_15,
    "Instant_notsofast" : card_16,
    "event_cardsonthetable" : card_17,
    "event_cardsonthetable" : card_18,
    "event_anothervictim" : card_19,
    "event_deadcardfolly" : card_20,
    "event_cardtrade" : card_21,
    "event_onemore" : card_22,
    "event_delayescape" : card_23,
    "event_earlytrain" : card_24,
    "event_pointsuspicions" : card_25,
    "devious_blackmailed" : card_26,
    "devious_fauxpas" : card_27,
  });

  return (
    <GameStateContext.Provider value={{ cardPictures }}>
      {children}
    </GameStateContext.Provider>
  );
};

export default GameStateProvider;

