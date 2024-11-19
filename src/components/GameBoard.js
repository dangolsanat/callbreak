// GameBoard.js
import React, { useRef } from 'react';
import useGameLogic from './useGameLogic';
import { GAME_PHASES } from './constants';
import PlayerHand from './PlayerHand';
import PlayedCards from './PlayedCards';
import Scoreboard from './Scoreboard';
import BiddingInterface from './BiddingInterface';
import RoundEnd from './RoundEnd';
import './styles/GameBoard.css';
import AIPlayerHand from './AIPlayerHand';
import BidsTricks from './BidsTricks';
import { motion, AnimatePresence } from 'framer-motion';

 
const GameBoard = () => {
  const {
    state,
    handleBidding,
    handlePlayCard,
    startNextRound,
    restartGame,
    handleDealCards,
    calculateSuggestedBid,
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
    playedCardCodes,
    trickWinner,
  } = state;

  const suggestedBid = calculateSuggestedBid(players[0]);

  const playerAreas = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];


  const gameBoardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2 } },
  };

  const biddingVariant ={
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 90, transition: { duration: 1.2 } },
  }

  return (
    <div className="game-board">

      {!state.gameStarted ? (
        <div> 
          <div className="table">
            <div className='insideOne'>
              <div className='insideTwo'>
                <p className='welcome'>
                  CALL BREAK
                  </p>
              <button onClick={handleDealCards} id='dealButton' className='pixel-button b2'>Deal Cards</button>
              </div>
            </div></div>
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : (
        <AnimatePresence>
          <motion.div
            className="GameBoard"
            variants={gameBoardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
          {/* Top Bar: Scoreboard and Bids & Tricks Won */}
          <div className="top-bar">
            {/* Scoreboard on the Top Left */}
            <Scoreboard scores={scores} />

            {/* Bidding and Tricks Won on the Top Right */}
            {gamePhase !== GAME_PHASES.GAME_OVER && (
              <BidsTricks bids={bids} tricksWon={tricksWon} />
            )}
          </div>




          {/* AI Player Areas Positioned Around the Table */}
          <div className="ai-player-positions">
            {/* Player 1 (AI) - Left */}
            <div ref={playerAreas[1]} className="ai-player left">
              <AIPlayerHand playerIndex={1} cards={players[1]} />
            </div>

            {/* Player 2 (AI) - Top */}
            <div ref={playerAreas[2]} className="ai-player top">
              <AIPlayerHand playerIndex={2} cards={players[2]} />
            </div>

            {/* Player 3 (AI) - Right */}
            <div ref={playerAreas[3]} className="ai-player right">
              <AIPlayerHand playerIndex={3} cards={players[3]} />
            </div>
          </div>

          {/* End of Round */}
          {gamePhase === GAME_PHASES.ROUND_END && (
            <RoundEnd
              roundNumber={roundNumber}
              scores={scores}
              onNextRound={startNextRound}
            />
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
              <button className='pixel-button b2' onClick={restartGame}>Restart Game</button>
            </div>
          )}


          {/* Table with Played Cards */}
          <div className="table">
            <div className='insideOne'>
              <div className='insideThree'>
                
              </div>
            </div>
             <PlayedCards
              playedCards={playedCards}
              currentPlayer={currentPlayer}
              trickWinner={trickWinner}
              playerAreas={playerAreas}
            />
          </div>



          {/* Phase Indicator */}
          {/* <div className="phase-indicator">
            <h2>Phase: {(gamePhase || '').replace('_', ' ')}</h2>
          </div> */}


          {/* Current Player Indicator */}
          {gamePhase === GAME_PHASES.PLAYING && (
            <div className="current-player-indicator">
              {currentPlayer === 0 ? (
                <h3>Your Turn</h3>
              ) : (
                <h3>Player {currentPlayer + 1}'s Turn</h3>
              )}
            </div>
          )}

          {/* Error Messages */}
          {errorMessage && (
            <div className="error-message">{errorMessage}</div>
          )}



          {/* Bidding Interface */}
         <AnimatePresence> 
          <motion.div
            variants={biddingVariant}
            initial="hidden"
            animate="visible"
            exit="hidden">

            {gamePhase === GAME_PHASES.BIDDING && currentPlayer === 0 && (
              <BiddingInterface
                onBid={handleBidding}
                suggestedBid={suggestedBid}
              />
            )}
            </motion.div>
          </AnimatePresence>  
          {/* Player's Hand */}
          <div ref={playerAreas[0]} className="player-area player-0">
            {(gamePhase === GAME_PHASES.BIDDING ||
              gamePhase === GAME_PHASES.PLAYING ||
              gamePhase === GAME_PHASES.TRICK_END) && (
              <PlayerHand
                cards={players[0]}
                currentPlayer={currentPlayer}
                playerIndex={0}
                gamePhase={gamePhase}
                onPlayCard={handlePlayCard}
                leadSuit={state.leadSuit}
                spadesBroken={state.spadesBroken}
                playedCardCodes={playedCardCodes}
              />
            )}
          </div>

          </motion.div>
        </AnimatePresence>
      )}




    </div>
  );
};

export default GameBoard;



