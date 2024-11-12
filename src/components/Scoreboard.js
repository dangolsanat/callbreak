// Scoreboard.js
import React from 'react';
import './styles/Scoreboard.css';

const Scoreboard = ({ scores }) => {
  return (
    <div className="scoreboard">
      <h4>Scores</h4>
      {scores.map((score, index) => (
        <div key={index}>
          Player {index + 1}: {score} points
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
