import React, { useContext, useState } from "react";
import { GameStateContext } from "../context/GameStateContext";
import "./GameScreen.css";
import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Secret from "./Secret";
import Controls from "./Controls";
import FinishGameModal from "./FinishGameModal";

/**
 * GameScreen dinámico: acepta `players`
 * Filtra entradas vacías / comentadas y distribuye la UI según la cantidad:
 * 2 -> local + 1 arriba
 * 3 -> local + 1 izquierda + 1 derecha
 * 4 -> local + 1 izquierda + 1 derecha + 1 arriba
 * 5 -> local + 1 left + 1 right + 2 arriba
 * 6 -> local + 2 left + 2 right + 1 arriba
 */
export default function GameScreen({ players }) {
  // Lo inicializamos en 'false'. Se abrirá automáticamente más adelante
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  const { discardPileCards, TOTAL_CARDS } = useContext(GameStateContext);

  // ejemplo de render con jugadores — podés comentar jugadores con "//" de este array para probar:
  const samplePlayers = [
    { id: 1, nombre: "Juan", secretos: [false, false, false], isLocal: false },
    //{ id: 2, nombre: "Jere", secretos: [false, false, false], isLocal: false },
    {
      id: 3,
      nombre: "Veronica",
      secretos: [false, false, false],
      isLocal: false,
    }, // ejemplo comentado
    {
      id: 4,
      nombre: "Emanuel",
      secretos: [false, false, false],
      isLocal: false,
    },
    {
      id: 5,
      nombre: "Agustin",
      secretos: [false, false, false],
      isLocal: false,
    },
    {
      id: 6,
      nombre: "Lucas",
      secretos: [true, true, true],
      isLocal: true,
      cards: [
        // Usar las claves exactas del diccionario
        { title: "not_so_fast" },
        { title: "cards_off_the_table" }, // Asumiendo que "Event" es "cards_off_the_table"
        { title: "hercule_poirot" }, // Asumiendo que "Detective" es "hercule_poirot"
        { title: "miss_marple" }, // Usamos otro detective
        { title: "cards_off_the_table" },
        { title: "dead_card_folly" },
      ],
    },
  ];

  // Cálculo de los contadores:
  const discardCount = discardPileCards.length;
  // El mazo regular es el Total menos las descartadas.
  const deckCount = TOTAL_CARDS - discardCount;
  //condicion de fin de juego
  const isDeckEmpty = deckCount <= 0;

  // Si el mazo está vacío Y el modal no se ha abierto, lo abrimos.
  // Usaremos un efecto para manejar esta apertura automática:
  React.useEffect(() => {
    if (isDeckEmpty && !isGameOverModalOpen) {
      setIsGameOverModalOpen(true);
    }
  }, [isDeckEmpty, isGameOverModalOpen]);

  // La función para cerrar el modal (usada en el botón "Volver a jugar" del modal)
  // Aunque "Volver a jugar" navega, tener esta función de cierre es buena práctica.
  const closeGameOverModal = () => setIsGameOverModalOpen(false);

  // Usa players pasados como prop si existen, si no samplePlayers
  const rawList = Array.isArray(players) ? players : samplePlayers;
  const list = rawList.filter(Boolean); // elimina `undefined`, `null`, etc.

  // Encontrar jugador local (isLocal: true). Si no hay ninguno, usamos el último como local.
  let local = list.find((p) => p.isLocal);
  let others = list.filter((p) => !p.isLocal);

  if (!local) {
    // tomar el último como local por defecto
    local = others.length ? others[others.length - 1] : list[list.length - 1];
    others = list.filter((p) => p.id !== local.id);
  }

  // distribución según cantidad total
  const total = 1 + others.length; // local + otros
  let left = [],
    right = [],
    top = [];

  switch (total) {
    case 2:
      // 1 arriba, local abajo
      top = [others[0]];
      break;
    case 3:
      // left:1, right:1
      left = [others[0]];
      right = [others[1]];
      break;
    case 4:
      // left:1, right:1, top:1
      left = [others[0]];
      right = [others[1]];
      top = [others[2]];
      break;
    case 5:
      // top:2, left:1, right:1
      top = [others[0], others[1]];
      left = [others[2]];
      right = [others[3]];
      break;
    case 6:
    default:
      // left:2, right:2, top:1
      left = [others[0], others[1]].filter(Boolean);
      right = [others[2], others[3]].filter(Boolean);
      top = [others[4]].filter(Boolean);
      break;
  }

  return (
    <div className="game-root">
      <div className="game-table">
        {/* columna izquierda */}
        <div
          className="players-col players-left"
          aria-hidden={left.length === 0}
        >
          {left.map((p) => (
            <Player key={p.id} player={p} />
          ))}
        </div>

        {/* columna derecha */}
        <div
          className="players-col players-right"
          aria-hidden={right.length === 0}
        >
          {right.map((p) => (
            <Player key={p.id} player={p} />
          ))}
        </div>

        {/* fila superior (puede tener 0,1 o 2 jugadores) */}
        <div className="players-top-row">
          {top.map((p) => (
            <Player key={p.id} player={p} />
          ))}
        </div>

        {/* Centro: mazos */}
        <div className="center-area">
          <Deck
            discardCards={discardPileCards}
            deckCount={deckCount}
            totalCards={TOTAL_CARDS}
          />
        </div>

        {/* Local: mano + secretos */}
        <div className="local-area" aria-label="Area local">
          <div className="hand-and-secrets">
            <Hand cards={local.cards || []} />
            <div
              className="local-secrets-horizontal"
              aria-label="Secretos del jugador"
            >
              {(local.secretos || [false, false, false])
                .slice(0, 3)
                .map((s, i) => (
                  <Secret key={i} revealed={Boolean(s)} />
                ))}
            </div>
          </div>
        </div>

        <Controls />
      </div>
      {isGameOverModalOpen && (
        <FinishGameModal
          onClose={closeGameOverModal}
        />
      )}
    </div>
  );
}
