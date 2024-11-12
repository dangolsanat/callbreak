// BidsTricks.jsx

import React from 'react';
import './styles/BidsTricks.css';

const BidsTricks = ({ bids, tricksWon }) => {
  return (
    <div className="bids-tricks">
      <h4>Bids and Tricks Won</h4>
      {bids.map((bid, index) => (
        <div key={index} className="player-bid-tricks">
          Player {index + 1}: Bid {bid || '?'}, Tricks Won {tricksWon[index]}
        </div>
      ))}
    </div>
  );
};

export default BidsTricks;
