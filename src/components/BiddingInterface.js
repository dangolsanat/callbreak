// BiddingInterface.js
import React from 'react';
import './BiddingInterface.css';

const BiddingInterface = ({ onBid }) => {
  const handleBidClick = (bid) => {
    onBid(bid);
  };

  return (
    <div className="bidding-interface">
      <h3>Your Turn to Bid</h3>
      <div className="bid-options">
        {[...Array(13)].map((_, i) => (
          <button key={i} onClick={() => handleBidClick(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BiddingInterface;
