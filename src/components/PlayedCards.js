// PlayedCards.js
import React from 'react';
import './PlayedCards.css';

const PlayedCards = ({ playedCards }) => {
  return (
    <div className="played-cards">
      <h3>Cards on the Table</h3>
      <div className="cards">
        {playedCards.map((play, index) => (
          <div key={index} className="played-card">
            <img src={play.card.image} alt={play.card.code} />
            <div>Player {play.player + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayedCards;
