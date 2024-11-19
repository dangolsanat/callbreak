//AIPlayerHand.js 

import React from 'react';
import './styles/AIPlayerHand.css';
import backCard from '../assets/cards/backCards/back_red_basic.png'

const AIPlayerHand = ({ playerIndex, cards }) => {
  return (
    <div className={`ai-player-hand player-${playerIndex}`}>
      <h3>P{playerIndex+1}</h3>
      <div className="cards-container">
        {cards.map((_, index) => (
          <img
            key={index}
            src= {backCard}
            alt="Card Back"
            className="card-back"
          />
        ))}
      </div>
    </div>
  );
};

export default AIPlayerHand;
