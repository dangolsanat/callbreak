// PlayerHand.jsx

import React from 'react';
import './styles/PlayerHand.css';

const PlayerHand = ({
  cards,
  currentPlayer,
  playerIndex,
  gamePhase,
  onPlayCard,
  playedCardCodes = [],
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
          <div key={`${card.code}-${index}`}>
          <img
            key={card.code}
            src={card.image}
            alt={`Card ${card.name} of ${card.suit}`} // Descriptive alt text
            onClick={() => handleCardClick(index)}
            className={`card ${
              isPlayerTurn && gamePhase === 'PLAYING' ? 'clickable' : ''
            } ${playedCardCodes.includes(card.code) ? 'played' : ''}`}
            style={{
              zIndex: index + 1, // Higher z-index for later cards
            }}
            tabIndex="0" // Makes the card focusable via keyboard
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleCardClick(index);
              }
            }}
          />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerHand;
