// CardSelectionPhase.js
import React from 'react';
import './styles/CardSelectionPhase.css'; // Ensure you have appropriate styles
import PropTypes from 'prop-types';

const CardSelectionPhase = ({
  onCardSelect,
  availableCards = [], // Default to empty array
  playerSelections = [], // Array of { card, cardIndex } or null
  currentSelectionPlayer,
}) => {
    CardSelectionPhase.propTypes = {
        onCardSelect: PropTypes.func.isRequired,
        availableCards: PropTypes.arrayOf(
          PropTypes.shape({
            code: PropTypes.string.isRequired,
            image: PropTypes.string.isRequired,
            value: PropTypes.string.isRequired,
            suit: PropTypes.string.isRequired,
          })
        ).isRequired,
        playerSelections: PropTypes.arrayOf(
          PropTypes.shape({
            card: PropTypes.shape({
              code: PropTypes.string.isRequired,
              image: PropTypes.string.isRequired,
              value: PropTypes.string.isRequired,
              suit: PropTypes.string.isRequired,
            }),
            cardIndex: PropTypes.number,
          })
        ).isRequired,
        currentSelectionPlayer: PropTypes.number.isRequired,
      };
  return (
    <div className="card-selection-phase">
      <h2>Select a Card to Determine Starting Player</h2>

      {/* Display Current Player's Turn */}
      <div className="current-player">
        {currentSelectionPlayer === 0 ? (
          <p>Your Turn: Select a card</p>
        ) : (
          <p>Player {currentSelectionPlayer + 1} is selecting a card...</p>
        )}
      </div>

      {/* Card Grid */}
      <div className="card-grid">
        {availableCards.length > 0 ? (
          availableCards.map((card, index) => (
            <div
              key={card.code}
              className={`card-container ${
                playerSelections.some(
                  (selection) => selection && selection.card.code === card.code
                )
                  ? 'selected'
                  : ''
              }`}
              onClick={() => {
                if (
                  currentSelectionPlayer === 0 &&
                  !playerSelections.some(
                    (selection) => selection && selection.card.code === card.code
                  )
                ) {
                  onCardSelect(currentSelectionPlayer, index);
                }
              }}
            >
              <img
                src="https://deckofcardsapi.com/static/img/back.png" // Card back image
                alt="Card Back"
                className={`card-back ${
                  currentSelectionPlayer === 0 ? 'clickable' : 'disabled'
                }`}
              />
              {/* Optionally, reveal the card face if selected */}
              {playerSelections.some(
                (selection) => selection && selection.card.code === card.code
              ) && (
                <img
                  src={card.image}
                  alt={`${card.value} of ${card.suit}`}
                  className="card-face"
                />
              )}
            </div>
          ))
        ) : (
          <p>No available cards to select.</p>
        )}
      </div>

      {/* Display Selected Cards */}
      <div className="selected-cards">
        <h3>Selected Cards:</h3>
        <div className="selected-cards-grid">
          {playerSelections.map((selection, index) => (
            selection ? (
              <div key={index} className="selected-card">
                <img
                  src={selection.card.image}
                  alt={`${selection.card.value} of ${selection.card.suit}`}
                  className="card-face"
                />
                <p>Player {index + 1}</p>
              </div>
            ) : (
              <div key={index} className="selected-card empty">
                <p>Player {index + 1}</p>
              </div>
            )
          ))}
        </div>
      </div>

      <p>Only the current player can select a card. Selected cards are revealed below.</p>
    </div>
  );
};

export default CardSelectionPhase;
