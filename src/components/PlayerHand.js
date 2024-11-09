// PlayerHand.js
import React from 'react';
import './PlayerHand.css';

const PlayerHand = ({
  cards,
  currentPlayer,
  playerIndex,
  gamePhase,
  onPlayCard,
}) => {
  const isPlayerTurn = currentPlayer === playerIndex;

  const handleCardClick = (index) => {
    if (isPlayerTurn && gamePhase === 'PLAYING') {
      onPlayCard(playerIndex, index);
    }
  };

  return (
    <div className="player-hand">
      <h3>Your Hand</h3>
      <div className="cards">
        {cards.map((card, index) => (
          <img
            key={card.code}
            src={card.image}
            alt={card.code}
            onClick={() => handleCardClick(index)}
            className={
              isPlayerTurn && gamePhase === 'PLAYING' ? 'clickable' : ''
            }
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
