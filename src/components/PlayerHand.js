import React from "react";
import "./PlayerHand.css";

const PlayerHand = ({ cards, currentPlayer, playerIndex, onPlayCard, gamePhase }) => {
  const isPlayerTurn = currentPlayer === playerIndex && gamePhase === "playing";

  return (
    <div className="player-hand">
      {cards.map((card, index) => (
        <img
          key={card.code}
          src={card.image}
          alt={card.code}
          className={`card ${isPlayerTurn ? "clickable" : "disabled"}`}
          onClick={() => isPlayerTurn && onPlayCard(playerIndex, index)}
        />
      ))}
    </div>
  );
};

export default PlayerHand;
