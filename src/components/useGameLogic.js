// useGameLogic.js
import { useReducer, useEffect } from 'react';
import { GAME_PHASES, SUITS, CARD_VALUES, NUM_PLAYERS } from './constants';

const initialState = {
  players: Array(NUM_PLAYERS).fill([]),
  bids: Array(NUM_PLAYERS).fill(null),
  tricksWon: Array(NUM_PLAYERS).fill(0),
  scores: Array(NUM_PLAYERS).fill(0),
  overtricks: Array(NUM_PLAYERS).fill(0),
  playedCards: [],
  currentPlayer: 0,
  gamePhase: GAME_PHASES.BIDDING,
  leadSuit: null,
  spadesBroken: false,
  roundNumber: 1,
  maxRounds: 5,
  loading: true,
  errorMessage: '',
  playedCardsHistory: [], // Tracks all played cards
  turnNumber: 0,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'INITIALIZE_GAME':
      return {
        ...state,
        ...action.payload,
        loading: false,
        errorMessage: '',
        playedCardsHistory: [],
      };
    case 'SET_BID':
      const newBids = [...state.bids];
      newBids[action.playerIndex] = action.bid;
      const allBidsSet = newBids.every((bid) => bid !== null);
      return {
        ...state,
        bids: newBids,
        currentPlayer: (state.currentPlayer + 1) % NUM_PLAYERS,
        gamePhase: allBidsSet ? GAME_PHASES.PLAYING : state.gamePhase,
      };
      case 'PLAY_CARD':
        return {
          ...state,
          players: action.players,
          playedCards: action.playedCards,
          leadSuit: action.leadSuit,
          spadesBroken: action.spadesBroken,
          currentPlayer: action.currentPlayer,
          playedCardsHistory: [
            ...state.playedCardsHistory,
            action.playedCards[action.playedCards.length - 1],
          ],
          turnNumber: state.turnNumber + 1, // Increment turnNumber
        };
      case 'RESET_TRICK':
        return {
          ...state,
          players: action.players,
          playedCards: [],
          leadSuit: null,
          currentPlayer: action.currentPlayer,
          turnNumber: state.turnNumber + 1, // Increment turnNumber
        };
    case 'SET_ERROR_MESSAGE':
      return { ...state, errorMessage: action.errorMessage };
    case 'UPDATE_TRICKS_WON':
      return {
        ...state,
        tricksWon: action.tricksWon,
      };
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.gamePhase };
    case 'UPDATE_SCORES':
      return { ...state, scores: action.scores, overtricks: action.overtricks };
    case 'INCREMENT_ROUND':
      return { ...state, roundNumber: state.roundNumber + 1 };
    case 'RESET_GAME':
      return initialState;
    default:
      return state;
  }
}

function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Initialize the game
  useEffect(() => {
    initializeGame();
    // eslint-disable-next-line
  }, []);

  const initializeGame = async () => {
    try {
      const response = await fetch(
        'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
      );
      const data = await response.json();

      const drawResponse = await fetch(
        `https://deckofcardsapi.com/api/deck/${data.deck_id}/draw/?count=52`
      );
      const drawData = await drawResponse.json();

      // Distribute cards to players
      const hands = [
        drawData.cards.slice(0, 13),
        drawData.cards.slice(13, 26),
        drawData.cards.slice(26, 39),
        drawData.cards.slice(39, 52),
      ];

      // Sort each player's hand
      const sortedHands = hands.map((hand) => sortHand(hand));

      dispatch({
        type: 'INITIALIZE_GAME',
        payload: {
          players: sortedHands,
          bids: Array(NUM_PLAYERS).fill(null),
          tricksWon: Array(NUM_PLAYERS).fill(0),
          playedCards: [],
          leadSuit: null,
          currentPlayer: 0,
          gamePhase: GAME_PHASES.BIDDING,
          spadesBroken: false,
        },
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR_MESSAGE',
        errorMessage: 'Failed to initialize the game. Please try again.',
      });
    }
  };

  // Helper function to sort a hand
  const sortHand = (hand) => {
    // Define the suit order
    const suitOrder = [SUITS.SPADES, SUITS.HEARTS, SUITS.DIAMONDS, SUITS.CLUBS];

    hand.sort((a, b) => {
      // Compare suits
      const suitComparison =
        suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      if (suitComparison !== 0) {
        return suitComparison;
      }
      // Suits are the same, compare values
      return parseCardValue(a) - parseCardValue(b);
    });

    return hand;
  };

  // Parse card value to a number
  const parseCardValue = (card) => {
    const value = CARD_VALUES[card.value];
    return value || 0; // Return 0 if value is not found
  };

  // Handle bidding
  const handleBidding = (bid) => {
    dispatch({ type: 'SET_BID', playerIndex: state.currentPlayer, bid });
  };

  // Handle playing a card
  const handlePlayCard = (playerIndex, cardIndex) => {
    const card = state.players[playerIndex][cardIndex];
    const playerHand = state.players[playerIndex];

    // Validate the card play
    const errorMessage = validateCardPlay(card, playerHand);
    if (errorMessage) {
      dispatch({ type: 'SET_ERROR_MESSAGE', errorMessage });
      return;
    }
    dispatch({ type: 'SET_ERROR_MESSAGE', errorMessage: '' });

    const newPlayers = state.players.map((hand, index) =>
      index === playerIndex ? hand.filter((_, i) => i !== cardIndex) : hand
    );

    const newPlayedCards = [
      ...state.playedCards,
      { player: playerIndex, card },
    ];

    let newLeadSuit = state.leadSuit;
    let spadesBroken = state.spadesBroken;

    if (newPlayedCards.length === 1) {
      newLeadSuit = card.suit;
    }

    if (
      card.suit === SUITS.SPADES &&
      !state.spadesBroken &&
      (state.leadSuit !== SUITS.SPADES || !state.leadSuit)
    ) {
      spadesBroken = true;
    }

    let nextPlayer = (state.currentPlayer + 1) % NUM_PLAYERS;

    if (newPlayedCards.length === NUM_PLAYERS) {
      calculateTrickWinner(newPlayedCards, newPlayers);
    } else {
      dispatch({
        type: 'PLAY_CARD',
        players: newPlayers,
        playedCards: newPlayedCards,
        leadSuit: newLeadSuit,
        spadesBroken,
        currentPlayer: nextPlayer,
      });
    }
  };

  const validateCardPlay = (card, playerHand) => {
    console.log('Validating card play:', card); // Debugging
  
    if (state.leadSuit) {
      const hasLeadSuit = playerHand.some((c) => c.suit === state.leadSuit);
      const highestCardValue = getHighestCardValueInLeadSuit();
  
      if (hasLeadSuit) {
        const playerLeadSuitCards = playerHand.filter(
          (c) => c.suit === state.leadSuit
        );
        const higherCards = playerLeadSuitCards.filter(
          (c) => parseCardValue(c) > highestCardValue
        );
  
        if (higherCards.length > 0) {
          // Player has higher cards and must play one
          if (
            card.suit !== state.leadSuit ||
            parseCardValue(card) <= highestCardValue
          ) {
            return 'You must play a higher card in the lead suit!';
          }
        } else {
          // Player has no higher cards, must play any card in the lead suit
          if (card.suit !== state.leadSuit) {
            return 'You must follow suit!';
          }
        }
      } else {
        // Player has no cards of the lead suit
        const hasSpades = playerHand.some((c) => c.suit === SUITS.SPADES);
        if (hasSpades) {
          if (card.suit !== SUITS.SPADES) {
            return 'You must play a spade since you have no cards of the lead suit!';
          }
        } else {
          // Player has no lead suit or spades, can play any card
          return null;
        }
      }
    } else {
      // Leading the trick
      if (!state.spadesBroken) {
        if (card.suit === SUITS.SPADES) {
          const hasOnlySpades = playerHand.every((c) => c.suit === SUITS.SPADES);
          if (!hasOnlySpades) {
            return 'You cannot lead with a spade until spades have been broken!';
          }
        }
      }
    }
  
    // Allow the play if none of the above rules apply
    return null;
  };
  
  // Helper function to get the highest card value in the lead suit from played cards
  const getHighestCardValueInLeadSuit = () => {
    const leadSuitCards = state.playedCards
      .filter((play) => play.card.suit === state.leadSuit)
      .map((play) => parseCardValue(play.card));
    return Math.max(0, ...leadSuitCards);
  };
  

  // Calculate the winner of a trick
  const calculateTrickWinner = (trick, players) => {
    console.log('Calculating trick winner...');
    console.log('Trick:', trick);
    console.log('Players:', players);
  
    try {
      // Derive leadSuit from the first card played in the trick
      const leadSuit = trick[0].card.suit;
      console.log('Lead suit for this trick is:', leadSuit);
  
      const winningCard = trick.reduce((highest, play) => {
        const highestRank = getCardRank(highest.card, leadSuit);
        const currentRank = getCardRank(play.card, leadSuit);
  
        if (currentRank > highestRank) {
          return play;
        } else if (currentRank === highestRank) {
          if (parseCardValue(play.card) > parseCardValue(highest.card)) {
            return play;
          }
        }
        return highest;
      }, trick[0]);
  
      const winnerIndex = winningCard.player;
      console.log(`Player ${winnerIndex + 1} wins the trick.`);
      const newTricksWon = [...state.tricksWon];
      newTricksWon[winnerIndex] += 1;
  
      dispatch({
        type: 'UPDATE_TRICKS_WON',
        tricksWon: newTricksWon,
        winnerIndex,
      });
  
      // Check if the round is over
      const isRoundOver = players.every((hand) => hand.length === 0);
      if (isRoundOver) {
        dispatch({ type: 'SET_GAME_PHASE', gamePhase: GAME_PHASES.ROUND_END });
        calculateScores(newTricksWon);
      } else {
        dispatch({
          type: 'RESET_TRICK',
          players,
          currentPlayer: winnerIndex,
        });
      }
    } catch (error) {
      console.error('Error in calculateTrickWinner:', error);
      // Optionally, you can dispatch an error state or handle the error gracefully
    }
  };
  
  // Get the rank of a card
  const getCardRank = (card, leadSuit) => {
    let rank = 0;
    if (card.suit === SUITS.SPADES) {
      rank = 2; // Spades are trump
    } else if (card.suit === leadSuit) {
      rank = 1; // Lead suit
    }
    return rank;
  };
  

  // AI bidding and playing logic
  useEffect(() => {
    if (
      state.gamePhase === GAME_PHASES.BIDDING &&
      state.currentPlayer !== 0
    ) {
      handleAIBid();
    } else if (
      state.gamePhase === GAME_PHASES.PLAYING &&
      state.currentPlayer !== 0
    ) {
      handleAIPlay();
    }
  }, [state.currentPlayer, state.gamePhase, state.turnNumber]);

  const handleAIBid = () => {
    const aiHand = state.players[state.currentPlayer];
    const aiBid = calculateAIBid(aiHand);
    handleBidding(aiBid);
  };

  const calculateAIBid = (hand) => {
    // Improved AI bidding logic
    let bid = 0;
    hand.forEach((card) => {
      const value = parseCardValue(card);
      if (card.suit === SUITS.SPADES) {
        if (value >= CARD_VALUES['9']) {
          bid += 1;
        }
      } else if (value >= CARD_VALUES['JACK']) {
        bid += 0.5;
      } else if (value === CARD_VALUES['ACE'] || value === CARD_VALUES['KING']) {
        bid += 0.5;
      }
    });
    bid = Math.max(1, Math.round(bid));
    return bid;
  };

  const handleAIPlay = () => {
    try {
      console.log(`AI Player ${state.currentPlayer + 1} is about to play.`);
      const aiHand = state.players[state.currentPlayer];
      console.log('AI Hand:', aiHand);
  
      const validCards = getValidCards(aiHand);
      console.log('Valid Cards for AI:', validCards);
  
      if (validCards.length === 0) {
        console.error('No valid cards for AI to play.');
        return;
      }
  
      const selectedCard = selectAICard(validCards);
      console.log('AI Selected Card:', selectedCard);
  
      if (!selectedCard) {
        console.error('AI could not select a card.');
        return;
      }
  
      const cardIndex = aiHand.findIndex(
        (card) => card.code === selectedCard.code
      );
      if (cardIndex === -1) {
        console.error('Selected card not found in AI hand.');
        return;
      }
  
      console.log(`AI Player ${state.currentPlayer + 1} is playing card at index ${cardIndex}.`);
      handlePlayCard(state.currentPlayer, cardIndex);
    } catch (error) {
      console.error('Error in handleAIPlay:', error);
    }
  };
  

  const getValidCards = (hand) => {
    if (state.leadSuit) {
      const highestCardValue = getHighestCardValueInLeadSuit();
      const hasLeadSuit = hand.some((card) => card.suit === state.leadSuit);
  
      if (hasLeadSuit) {
        const playerLeadSuitCards = hand.filter(
          (card) => card.suit === state.leadSuit
        );
        const higherCards = playerLeadSuitCards.filter(
          (card) => parseCardValue(card) > highestCardValue
        );
  
        if (higherCards.length > 0) {
          // Must play a higher card in the lead suit
          return higherCards;
        } else {
          // No higher cards, must play any card in the lead suit
          return playerLeadSuitCards;
        }
      } else {
        // No cards in lead suit
        const hasSpades = hand.some((card) => card.suit === SUITS.SPADES);
        if (hasSpades) {
          // Must play a spade
          return hand.filter((card) => card.suit === SUITS.SPADES);
        } else {
          // Can play any card
          return hand;
        }
      }
    } else {
      // Leading the trick
      if (!state.spadesBroken) {
        // Cannot lead with spades unless only spades left
        const nonSpadeCards = hand.filter((card) => card.suit !== SUITS.SPADES);
        if (nonSpadeCards.length > 0) {
          return nonSpadeCards;
        } else {
          // Only spades left, can lead with spades
          return hand;
        }
      } else {
        // Spades have been broken, can lead any card
        return hand;
      }
    }
  };
  

  const selectAICard = (validCards) => {
    // AI will select the lowest valid card to minimize overtricks
    const sortedCards = validCards.slice().sort(
      (a, b) => parseCardValue(a) - parseCardValue(b)
    );
  
    return sortedCards[0] || validCards[0] || null;
  };
  


  // Function to determine if a card can potentially win the trick
  const canWinTrick = (card) => {
    console.log('Evaluating if AI can win trick with card:', card);
  
    const leadSuit = state.leadSuit || card.suit;
    let highestRank = getCardRank(card, leadSuit);
    let highestValue = parseCardValue(card);
  
    if (state.playedCards.length === 0) {
      console.log('AI is leading the trick.');
      return true;
    }
  
    for (let play of state.playedCards) {
      const rank = getCardRank(play.card, leadSuit);
      const value = parseCardValue(play.card);
  
      if (rank > highestRank) {
        console.log('Cannot win: another card has higher rank.');
        return false;
      } else if (rank === highestRank && value > highestValue) {
        console.log('Cannot win: another card has same rank but higher value.');
        return false;
      }
    }
    console.log('AI can win the trick with this card.');
    return true;
  };
  

  // Calculate scores at the end of a round
  const calculateScores = (newTricksWon) => {
    const newScores = state.scores.map((score, index) => {
      const bid = state.bids[index];
      const tricks = newTricksWon[index];
      let roundScore = 0;
      let overtricks = tricks - bid;
      let accumulatedOvertricks = state.overtricks[index];

      if (tricks >= bid) {
        roundScore += 10 * bid + overtricks;
        accumulatedOvertricks += overtricks;
        if (accumulatedOvertricks >= 10) {
          roundScore -= 100;
          accumulatedOvertricks -= 10;
        }
      } else {
        roundScore -= 10 * bid;
      }
      return score + roundScore;
    });

    const newOvertricks = state.overtricks.map((overtrick, index) => {
      const tricks = newTricksWon[index];
      const bid = state.bids[index];
      let overtricks = tricks - bid;
      let accumulatedOvertricks = overtrick;

      if (tricks >= bid) {
        accumulatedOvertricks += overtricks;
        if (accumulatedOvertricks >= 10) {
          accumulatedOvertricks -= 10;
        }
      }
      return accumulatedOvertricks;
    });

    dispatch({
      type: 'UPDATE_SCORES',
      scores: newScores,
      overtricks: newOvertricks,
    });
  };

  // Start the next round or end the game
  const startNextRound = () => {
    if (state.roundNumber >= state.maxRounds) {
      dispatch({ type: 'SET_GAME_PHASE', gamePhase: GAME_PHASES.GAME_OVER });
    } else {
      dispatch({ type: 'INCREMENT_ROUND' });
      initializeGame();
    }
  };

  const restartGame = () => {
    dispatch({ type: 'RESET_GAME' });
    initializeGame();
  };

  return {
    state,
    handleBidding,
    handlePlayCard,
    startNextRound,
    restartGame,
  };
}

export default useGameLogic;
