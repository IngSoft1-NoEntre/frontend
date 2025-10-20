import React from "react";
import "./Player.css";
import Secret from "./Secret";
import DetectiveSets from "./DetectiveSets"

/**
 * Player minimal: esfera con inicial encima, nombre debajo, secretos en fila horizontal.
 * Props: player = { id, nombre, secretos: [bool,bool,bool], isLocal }
 */
export default function Player({
    player, 
    onOpenSecret, 
    secretFrontUrl, 
    secretBackUrl,
    detectiveSets,
    cardPictures,
    onSetClick
    }) {

  const { nombre = "Esperando", secretos = [false, false, false], isLocal = false } = player;

  const showDetectiveSets = detectiveSets && detectiveSets.length > 0 && !isLocal;

  return (
    <div className="player-wrapper" role="group" aria-label={`Jugador ${nombre}`}>
      <div className="player-minimal">
        <div className="avatar-sphere" aria-hidden>
          {nombre[0]?.toUpperCase() || "?"}
        </div>
        <div className="player-name">{nombre}</div>
      </div>

      {/* secretos alineados debajo del jugador */}
      <div className="player-secrets-row">
        {secretos.slice(0,3).map((s,i) => (
          <Secret
            key={i}
            revealed={Boolean(isLocal && s)}
            hoverReveal={!isLocal}
            data={{
              revealed: Boolean(isLocal && s),
              title: `${nombre} - Secreto ${i+1}`,
              text: isLocal && s ? "Contenido privado" : null,
              frontImage: secretFrontUrl,
              backImage: secretBackUrl,
            }}
            onOpen={(data) => {
              if (data?.revealed) onOpenSecret && onOpenSecret({ ...data, owner: nombre });
            }}
          />
        ))}
      </div>
      {/* Set de Detectives */}
      {/* Renderizar sets de detectives (Solo para jugadores remotos) */}
            {!player.isLocal && detectiveSets && detectiveSets.length > 0 && (
                <div className="player-detective-sets-container">
                    <DetectiveSets 
                        sets={detectiveSets} 
                        cardPictures={cardPictures}
                        onSetClick={(setIndex) => onSetClick(setIndex, player.id)} 
                        isRemote={true}
                    />
                </div>
            )}
    </div>
    );
}