// RoundEnd.js
import React from 'react';
import './styles/RoundEnd.css';

const RoundEnd = ({ roundNumber, scores, onNextRound }) => {
  return (
    <div className="round-end">
      <h2>Round {roundNumber} Over!</h2>
      <h3>Scores:</h3>
      {scores.map((score, index) => (
        <div key={index}>
          Player {index + 1}: {score} points
        </div>
      ))}
      <button className='pixel-button b2' onClick={onNextRound}>Start Next Round</button>
    </div>
  );
};

export default RoundEnd;
