// GameBoard.js
import React from 'react';
import useGameLogic from './useGameLogic';
import { GAME_PHASES } from './constants';
import PlayerHand from './PlayerHand';
import PlayedCards from './PlayedCards';
import Scoreboard from './Scoreboard';
import BiddingInterface from './BiddingInterface';
import RoundEnd from './RoundEnd';
import './GameBoard.css';

const GameBoard = () => {
  const {
    state,
    handleBidding,
    handlePlayCard,
    startNextRound,
    restartGame,
  } = useGameLogic();

  const {
    players,
    bids,
    tricksWon,
    scores,
    playedCards,
    currentPlayer,
    gamePhase,
    loading,
    errorMessage,
    roundNumber,
  } = state;

  return (
    <div className="game-board">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Phase Indicator */}
          <div className="phase-indicator">
            <h2>Phase: {gamePhase.replace('_', ' ')}</h2>
          </div>

          {/* Scoreboard */}
          <Scoreboard scores={scores} />

          {/* Display during the game phases */}
          {gamePhase !== GAME_PHASES.GAME_OVER && (
            <>
              {/* Bids and Tricks Won */}
              <div className="bids">
                <h2>Bids and Tricks Won</h2>
                {bids.map((bid, index) => (
                  <div key={index}>
                    Player {index + 1}: Bid {bid || '?'}, Tricks Won{' '}
                    {tricksWon[index]}
                  </div>
                ))}
              </div>

              {/* Played Cards on Table */}
              <div className="table">
                <PlayedCards
                  playedCards={playedCards}
                  currentPlayer={currentPlayer}
                />
              </div>

              {/* Error Messages */}
              {errorMessage && (
                <div className="error-message">{errorMessage}</div>
              )}

              {/* Turn Indicator */}
              {gamePhase === GAME_PHASES.PLAYING && (
                <div className="current-player-indicator">
                  {currentPlayer === 0 ? (
                    <h3>Your Turn</h3>
                  ) : (
                    <h3>Player {currentPlayer + 1}'s Turn</h3>
                  )}
                </div>
              )}

              {/* Player's Hand */}
              {(gamePhase === GAME_PHASES.BIDDING ||
                gamePhase === GAME_PHASES.PLAYING) && (
                <PlayerHand
                  cards={players[0]}
                  currentPlayer={currentPlayer}
                  playerIndex={0}
                  gamePhase={gamePhase}
                  onPlayCard={handlePlayCard}
                  leadSuit={state.leadSuit}
                  spadesBroken={state.spadesBroken}
                />
              )}

              {/* Bidding Interface */}
              {gamePhase === GAME_PHASES.BIDDING && currentPlayer === 0 && (
                <BiddingInterface onBid={handleBidding} />
              )}

              {/* End of Round */}
              {gamePhase === GAME_PHASES.ROUND_END && (
                <RoundEnd
                  roundNumber={roundNumber}
                  scores={scores}
                  onNextRound={startNextRound}
                />
              )}
            </>
          )}

          {/* Game Over */}
          {gamePhase === GAME_PHASES.GAME_OVER && (
            <div className="game-over">
              <h2>Game Over!</h2>
              <h3>Final Scores:</h3>
              {scores.map((score, index) => (
                <div key={index}>
                  Player {index + 1}: {score} points
                </div>
              ))}
              <h3>
                Winner: Player {scores.indexOf(Math.max(...scores)) + 1}!
              </h3>
              <button onClick={restartGame}>Restart Game</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameBoard;
