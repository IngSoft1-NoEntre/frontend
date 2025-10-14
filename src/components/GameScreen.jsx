import React from "react";
import { useParams } from "react-router-dom"; // Si usas React Router
import "./GameScreen.css";
import Player from "./Player";
import Deck from "./Deck";
import Hand from "./Hand";
import Controls from "./Controls";
import Secret from "./Secret";
import TurnoIndicator from "./TurnoIndicator"; // NUEVO

const TOTAL_CARDS = 64;

/**
 * GameScreen dinámico con indicador de turno integrado
 */
export default function GameScreen({ players }) {
  const { partidaId } = useParams();

  const samplePlayers = [
    {
      id: 1,
      nombre: "Juan",
      fecha_nacimiento: "1995-08-20", // Aug 20 - ccerca a Sep 15
      secretos: [false, false, false],
      isLocal: false,
    },
    {
      id: 3,
      nombre: "Veronica",
      fecha_nacimiento: "1992-11-12", // Nov 12
      secretos: [false, false, false],
      isLocal: false,
    },
    {
      id: 4,
      nombre: "Emanuel",
      fecha_nacimiento: "1990-09-14", // Sep 14 - muy cerca de Sep 15!
      secretos: [false, false, false],
      isLocal: false,
    },
    {
      id: 5,
      nombre: "Agustin",
      fecha_nacimiento: "1993-03-05", // Mar 5
      secretos: [false, false, false],
      isLocal: false,
    },
    {
      id: 6,
      nombre: "Lucas",
      fecha_nacimiento: "1994-12-25", // Dec 25
      secretos: [true, true, true],
      isLocal: true,
      cards: [
        { title: "not_so_fast" },
        { title: "cards_off_the_table" },
        { title: "hercule_poirot" },
        { title: "miss_marple" },
        { title: "cards_off_the_table" },
        { title: "dead_card_folly" },
      ],
    },
  ];

  // Simulación del estado del descarte
  const discardPileCards = [
    { title: "hercule_poirot", type: "Detective" },
    { title: "not_so_fast", type: "Instant" },
    { title: "look_into_the_ashes", type: "Event" },
  ];

  // Cálculo de los contadores
  const discardCount = discardPileCards.length;
  const deckCount = TOTAL_CARDS - discardCount;

  // Usa players pasados como prop si existen, si no samplePlayers
  const rawList = Array.isArray(players) ? players : samplePlayers;
  const list = rawList.filter(Boolean);

  // Encontrar jugador local
  let local = list.find((p) => p.isLocal);
  let others = list.filter((p) => !p.isLocal);

  if (!local) {
    local = others.length ? others[others.length - 1] : list[list.length - 1];
    others = list.filter((p) => p.id !== local.id);
  }

  // Distribución según cantidad total
  const total = 1 + others.length;
  let left = [],
    right = [],
    top = [];

  switch (total) {
    case 2:
      top = [others[0]];
      break;
    case 3:
      left = [others[0]];
      right = [others[1]];
      break;
    case 4:
      left = [others[0]];
      right = [others[1]];
      top = [others[2]];
      break;
    case 5:
      top = [others[0], others[1]];
      left = [others[2]];
      right = [others[3]];
      break;
    case 6:
    default:
      left = [others[0], others[1]].filter(Boolean);
      right = [others[2], others[3]].filter(Boolean);
      top = [others[4]].filter(Boolean);
      break;
  }
  const handleAccionPrincipal = async () => {
    // Ejemplo: Robar carta
    wsRef.current?.send(
      JSON.stringify({
        action: "draw_card",
        from: "deck",
      })
    );
  };

  const handleAccionSecundaria = async () => {
    // Ejemplo: Pasar turno
    wsRef.current?.send(
      JSON.stringify({
        action: "pass_turn",
      })
    );
  };

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

        {/* fila superior */}
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

        {/* NUEVO: Indicador de turno en esquina inferior derecha */}
        <TurnoIndicator
          partidaId={parseInt(partidaId)}
          players={samplePlayers} // usar samplePlayers o los jugadores reales
        />

        {/*<Controls />*/}
      </div>
    </div>
  );
}
