import React from "react";
import "./PlayedCards.css";

const PlayedCards = ({ playedCards }) => {
  return (
    <div className="played-cards">
      {playedCards.map((played, index) => (
        <div key={index} className="played-card">
          <img src={played.card.image} alt={played.card.code} />
          <p>Player {played.player + 1}</p>
        </div>
      ))}
    </div>
  );
};

export default PlayedCards;
