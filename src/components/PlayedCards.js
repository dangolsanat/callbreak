// src/components/PlayedCards.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './styles/PlayedCards.css';

const PlayedCards = ({ playedCards, trickWinner, playerAreas }) => {
  const [winnerPosition, setWinnerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (trickWinner !== null && playerAreas[trickWinner]?.current) {
      const winnerRect = playerAreas[trickWinner].current.getBoundingClientRect();
      const tableRect = document.querySelector('.table').getBoundingClientRect();

      const x =
        winnerRect.left +
        winnerRect.width / 2 -
        (tableRect.left + tableRect.width / 2);
      const y =
        winnerRect.top +
        winnerRect.height / 2 -
        (tableRect.top + tableRect.height / 2);

      setWinnerPosition({ x, y });
    }
  }, [trickWinner, playerAreas]);

  return (
    <div className="played-cards">
      <div className="cards">
        {playedCards.map((play, index) => (
          <div
            key={`${play.player}-${play.card.code}-${index}`}
            className={`played-card ${
              trickWinner !== null ? 'winning' : ''
            } player-${play.player}`}
            style={
              trickWinner !== null
                ? {
                    '--winner-x': `${winnerPosition.x}px`,
                    '--winner-y': `${winnerPosition.y}px`,
                  }
                : {}
            }
          >
            <img
              src={play.card.image} // Now uses the local image
              alt={`${play.card.value} of ${play.card.suit}`} // Descriptive alt text
            />
            <div className='playerId'>Player {play.player + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

PlayedCards.propTypes = {
  playedCards: PropTypes.arrayOf(
    PropTypes.shape({
      player: PropTypes.number.isRequired,
      card: PropTypes.shape({
        code: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        suit: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
  trickWinner: PropTypes.number,
  playerAreas: PropTypes.arrayOf(
    PropTypes.shape({
      current: PropTypes.instanceOf(Element),
    })
  ).isRequired,
};

export default PlayedCards;
