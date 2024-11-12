// BiddingInterface.js
import React, {useState} from 'react';
import './styles/BiddingInterface.css';

const BiddingInterface = ({ onBid, suggestedBid }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleBidClick = (bid) => {
    setFadeOut(true);
    setTimeout(() => {
      onBid(bid);
      console.log('Bidding interface faded out.');
    }, 1000);
  };

  return (
    <div className={`bidding-interface ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="bid-topBar">
      <h3>Your Turn to Bid</h3>
      </div>

      <div className="bid-options">
        {[...Array(13)].map((_, i) => (
          <button className='pixel-button' key={i} onClick={() => handleBidClick(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
      <h4>Suggested bid: {suggestedBid}</h4>
    </div>
  );
};

export default BiddingInterface;
