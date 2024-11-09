// Scoreboard.js
import React from 'react';
import './Scoreboard.css';

const Scoreboard = ({ scores }) => {
  return (
    <div className="scoreboard">
      <h2>Scores</h2>
      {scores.map((score, index) => (
        <div key={index}>
          Player {index + 1}: {score} points
        </div>
      ))}
    </div>
  );
};

export default Scoreboard;
