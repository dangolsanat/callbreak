import React, { useState, useEffect } from "react";
import PlayerHand from "./PlayerHand";
import PlayedCards from "./PlayedCards";
import "./GameBoard.css";

const GameBoard = () => {
  const [players, setPlayers] = useState([[], [], [], []]); // Player hands
  const [bids, setBids] = useState([null, null, null, null]); // Player bids
  const [scores, setScores] = useState([0, 0, 0, 0]); // Player scores
  const [playedCards, setPlayedCards] = useState([]); // Cards played in the current trick
  const [currentPlayer, setCurrentPlayer] = useState(0); // Whose turn it is
  const [gamePhase, setGamePhase] = useState("bidding"); // "bidding", "playing", or "gameOver"
  const [biddingComplete, setBiddingComplete] = useState(false); // Tracks if bidding is complete
  const [loading, setLoading] = useState(true); // Loading state for fetching cards

  // Initialize the game and deal cards
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
        );
        const data = await response.json();
        const drawResponse = await fetch(
          `https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=52`
        );
        const drawData = await drawResponse.json();

        const hands = [
          drawData.cards.slice(0, 13),
          drawData.cards.slice(13, 26),
          drawData.cards.slice(26, 39),
          drawData.cards.slice(39, 52),
        ];
        console.log("Dealt Hands:", hands);
        setPlayers(hands);
      } catch (error) {
        console.error("Error initializing the game:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeGame();
  }, []);

  // Debugging
  useEffect(() => {
    console.log("Current Player:", currentPlayer);
    console.log("Bids:", bids);
    console.log("Game Phase:", gamePhase);
    console.log("Bidding Complete:", biddingComplete);
    console.log("Player 1 Hand:", players[0]);
  }, [currentPlayer, bids, gamePhase, biddingComplete, players]);

  // Trigger AI bidding in the bidding phase
  useEffect(() => {
    if (currentPlayer !== 0 && gamePhase === "bidding" && !biddingComplete) {
      console.log(`AI Player ${currentPlayer + 1} turn to bid`);
      handleAIBid();
    }
  }, [currentPlayer, gamePhase, biddingComplete]);

  // Trigger AI card play in the playing phase
  useEffect(() => {
    if (currentPlayer !== 0 && gamePhase === "playing") {
      console.log(`AI Player ${currentPlayer + 1} turn to play`);
      setTimeout(() => handleAIPlay(currentPlayer), 1000);
    }
  }, [currentPlayer, gamePhase]);

  const handleBidding = (bid) => {
    console.log(`Player ${currentPlayer + 1} bids: ${bid}`);
    setBids((prevBids) => {
      const newBids = [...prevBids];
      newBids[currentPlayer] = bid;

      if (newBids.every((b) => b !== null)) {
        checkBiddingComplete(newBids);
      } else {
        setCurrentPlayer((currentPlayer + 1) % 4);
      }

      return newBids;
    });
  };

  const handleAIBid = () => {
    if (bids[currentPlayer] !== null) return;

    const aiBid = calculateAIBid(players[currentPlayer]);
    console.log(`AI Player ${currentPlayer + 1} bids: ${aiBid}`);
    setBids((prevBids) => {
      const newBids = [...prevBids];
      newBids[currentPlayer] = aiBid;

      if (newBids.every((b) => b !== null)) {
        checkBiddingComplete(newBids);
      } else {
        setTimeout(() => setCurrentPlayer((currentPlayer + 1) % 4), 1000);
      }

      return newBids;
    });
  };

  const checkBiddingComplete = (bidsArray) => {
    console.log("Checking if bidding is complete...");
    if (bidsArray.every((bid) => bid !== null)) {
      console.log("All bids complete:", bidsArray);
      setBiddingComplete(true);
      setGamePhase("playing");
      setCurrentPlayer(0); // Player 1 starts the playing phase
    }
  };

  const calculateAIBid = (hand) => {
    const highCards = ["JACK", "QUEEN", "KING", "ACE"];
    let bid = 0;

    hand.forEach((card) => {
      if (card.suit === "SPADES") {
        bid++;
        if (highCards.includes(card.value)) bid++;
      } else if (highCards.includes(card.value)) {
        bid++;
      }
    });

    return Math.max(bid, 1);
  };

  const handlePlayCard = (playerIndex, cardIndex) => {
    const newPlayers = [...players];
    const card = newPlayers[playerIndex].splice(cardIndex, 1)[0];
    setPlayers(newPlayers);

    const newPlayedCards = [...playedCards, { player: playerIndex, card }];
    setPlayedCards(newPlayedCards);

    if (newPlayedCards.length === 4) {
      setTimeout(() => calculateTrickWinner(newPlayedCards), 1000);
    } else {
      setCurrentPlayer((currentPlayer + 1) % 4);
    }
  };

  const handleAIPlay = (aiPlayerIndex) => {
    const aiHand = players[aiPlayerIndex];
    if (!aiHand || aiHand.length === 0) {
      console.log(`AI Player ${aiPlayerIndex + 1} has no cards to play.`);
      return;
    }

    const selectedCardIndex = 0; // For simplicity, AI plays the first card
    console.log(`AI Player ${aiPlayerIndex + 1} plays:`, aiHand[selectedCardIndex]);
    handlePlayCard(aiPlayerIndex, selectedCardIndex);
  };

  const calculateTrickWinner = (trick) => {
    const leadSuit = trick[0].card.suit;
    let winningCard = trick[0];

    trick.forEach((play) => {
      if (
        play.card.suit === leadSuit &&
        parseCardValue(play.card) > parseCardValue(winningCard.card)
      ) {
        winningCard = play;
      } else if (
        play.card.suit === "SPADES" &&
        winningCard.card.suit !== "SPADES"
      ) {
        winningCard = play;
      }
    });

    const winnerIndex = winningCard.player;
    const newScores = [...scores];
    newScores[winnerIndex]++;
    setScores(newScores);

    console.log(`Player ${winnerIndex + 1} wins the trick!`);
    setPlayedCards([]);
    setCurrentPlayer(winnerIndex);
  };

  const parseCardValue = (card) => {
    const values = {
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      JACK: 11,
      QUEEN: 12,
      KING: 13,
      ACE: 14,
    };
    return values[card.value];
  };

  return (
<div className="game-board">
  {loading ? (
    <p>Loading cards...</p>
  ) : (
    <>
      <div className="scores">
        {bids.map((bid, index) => (
          <div key={index}>
            Player {index + 1}: Bid {bid || "?"}, Score {scores[index]}
          </div>
        ))}
      </div>
      <div className="table">
        <PlayedCards playedCards={playedCards} currentPlayer={currentPlayer} />
      </div>
      {(gamePhase === "bidding" || gamePhase === "playing") && (
        <PlayerHand
          cards={players[0]} // Render Player 1's hand
          currentPlayer={currentPlayer}
          playerIndex={0}
          onPlayCard={(index) => handlePlayCard(0, index)}
          gamePhase={gamePhase}
        />
      )}
      {gamePhase === "bidding" && currentPlayer === 0 && (
        <div className="bidding">
          <h3>Your Turn to Bid</h3>
          <input
            type="number"
            placeholder="Enter your bid"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleBidding(parseInt(e.target.value));
                e.target.value = ""; // Clear input
              }
            }}
          />
        </div>
      )}
    </>
  )}
</div>

  );
};

export default GameBoard;
