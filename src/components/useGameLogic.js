// src/hooks/useGameLogic.js
import { useReducer, useEffect } from 'react';
import { GAME_PHASES, SUITS, CARD_VALUES, NUM_PLAYERS } from './constants';
import cardImages from '../assets/cards/cards';
// Define action types as constants to avoid typos
const ACTIONS = {
  INITIALIZE_GAME: 'INITIALIZE_GAME',
  SET_BID: 'SET_BID',
  PLAY_CARD: 'PLAY_CARD',
  RESET_TRICK: 'RESET_TRICK',
  SET_ERROR_MESSAGE: 'SET_ERROR_MESSAGE',
  UPDATE_TRICKS_WON: 'UPDATE_TRICKS_WON',
  SET_GAME_PHASE: 'SET_GAME_PHASE',
  SET_CURRENT_PLAYER: 'SET_CURRENT_PLAYER',
  UPDATE_SCORES: 'UPDATE_SCORES',
  INCREMENT_ROUND: 'INCREMENT_ROUND',
  RESET_GAME: 'RESET_GAME',
  SET_PROCESSING: 'SET_PROCESSING',
};

const initialState = {
  players: Array(NUM_PLAYERS).fill([]),
  bids: Array(NUM_PLAYERS).fill(null),
  tricksWon: Array(NUM_PLAYERS).fill(0),
  scores: Array(NUM_PLAYERS).fill(0),
  overtricks: Array(NUM_PLAYERS).fill(0),
  playedCards: [
    // { player: 0, card: { /* card details */ } },
    // { player: 1, card: { /* card details */ } },
    // { player: 2, card: { /* card details */ } },
    // { player: 3, card: { /* card details */ } },
  ],
  currentPlayer: 0,
  gamePhase: GAME_PHASES.BIDDING,
  leadSuit: null,
  spadesBroken: false,
  roundNumber: 1,
  maxRounds: 5,
  loading: true,
  errorMessage: '',
  playedCardsHistory: [],
  turnNumber: 0,
  gameStarted: false,
  playedCardCodes: [],
  trickWinner: null,
  isProcessing: false, // New flag to prevent multiple AI triggers
};

function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INITIALIZE_GAME:
      return {
        ...state,
        ...action.payload,
        loading: false,
        errorMessage: '',
        playedCardsHistory: [],
        gameStarted: true,
        isProcessing: false, // Reset processing flag
      };
    case ACTIONS.SET_BID:
      const newBids = [...state.bids];
      newBids[action.playerIndex] = action.bid;
      const allBidsSet = newBids.every((bid) => bid !== null);
      return {
        ...state,
        bids: newBids,
        currentPlayer: (state.currentPlayer + 1) % NUM_PLAYERS,
        gamePhase: allBidsSet ? GAME_PHASES.PLAYING : state.gamePhase,
      };
    case ACTIONS.PLAY_CARD:
      return {
        ...state,
        players: action.players,
        playedCards: action.playedCards,
        leadSuit: action.leadSuit,
        spadesBroken: action.spadesBroken,
        currentPlayer: action.currentPlayer,
        playedCardCodes: [
          ...state.playedCardCodes,
          action.playedCards[action.playedCards.length - 1].card.code,
        ],
        turnNumber: state.turnNumber + 1,
      };
    case ACTIONS.RESET_TRICK:
      return {
        ...state,
        players: action.players,
        playedCards: [],
        leadSuit: null,
        currentPlayer: action.currentPlayer,
        trickWinner: null,
        turnNumber: state.turnNumber + 1,
        isProcessing: false, // Reset processing flag
      };
    case ACTIONS.SET_ERROR_MESSAGE:
      return { ...state, errorMessage: action.errorMessage };
    case ACTIONS.UPDATE_TRICKS_WON:
      return {
        ...state,
        tricksWon: action.tricksWon,
        trickWinner: action.winnerIndex,
      };
    case ACTIONS.SET_GAME_PHASE:
      return {
        ...state,
        gamePhase: action.gamePhase,
        currentPlayer:
          action.gamePhase === GAME_PHASES.PLAYING
            ? state.currentPlayer
            : null,
      };
    case ACTIONS.SET_CURRENT_PLAYER:
      return {
        ...state,
        currentPlayer: action.currentPlayer,
      };
    case ACTIONS.UPDATE_SCORES:
      return { ...state, scores: action.scores, overtricks: action.overtricks };
    case ACTIONS.INCREMENT_ROUND:
      return { ...state, roundNumber: state.roundNumber + 1 };
    case ACTIONS.RESET_GAME:
      return initialState;
    case ACTIONS.SET_PROCESSING:
      return { ...state, isProcessing: action.isProcessing };
    default:
      console.warn(`Unhandled action type: ${action.type}`);
      return state;
  }
}

function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const handleDealCards = () => {
    initializeGame();
  };

  const initializeGame = () => {
    try {
      // Initialize the deck without fetching from the API
      const standardDeck = generateStandardDeck(); // Implement this function

      // Shuffle the deck
      const shuffledDeck = shuffleDeck(standardDeck); // Implement this function or use a library

      // Assign local images to each card using the mapping
      const deckWithImages = shuffledDeck.map((card) => ({
        ...card,
        image: cardImages[card.code], // Use the imported image
      }));

      // Distribute the cards to players
      const hands = [
        deckWithImages.slice(0, 13),
        deckWithImages.slice(13, 26),
        deckWithImages.slice(26, 39),
        deckWithImages.slice(39, 52),
      ];

      const sortedHands = hands.map((hand) => sortHand(hand));

      dispatch({
        type: ACTIONS.INITIALIZE_GAME,
        payload: {
          players: sortedHands,
          bids: Array(NUM_PLAYERS).fill(null),
          tricksWon: Array(NUM_PLAYERS).fill(0),
          overtricks: Array(NUM_PLAYERS).fill(0),
          playedCards: [],
          leadSuit: null,
          currentPlayer: 0,
          gamePhase: GAME_PHASES.BIDDING,
          spadesBroken: false,
        },
      });
    } catch (error) {
      console.error('Error initializing game:', error);
      dispatch({
        type: ACTIONS.SET_ERROR_MESSAGE,
        errorMessage: 'Failed to initialize the game. Please try again.',
      });
    }
  };

  // Utility functions (implement these if not already present)
  const generateStandardDeck = () => {
    const suits = ['SPADES', 'HEARTS', 'DIAMONDS', 'CLUBS'];
    const values = [
      'ACE',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'JACK',
      'QUEEN',
      'KING',
    ];
    const codes = [
      'AS', '2S', '3S', '4S', '5S', '6S', '7S', '8S', '9S', '10S', 'JS', 'QS', 'KS',
      'AD', '2D', '3D', '4D', '5D', '6D', '7D', '8D', '9D', '10D', 'JD', 'QD', 'KD',
      'AH', '2H', '3H', '4H', '5H', '6H', '7H', '8H', '9H', '10H', 'JH', 'QH', 'KH',
      'AC', '2C', '3C', '4C', '5C', '6C', '7C', '8C', '9C', '10C', 'JC', 'QC', 'KC',
    ];

    const deck = [];

    suits.forEach((suit, suitIndex) => {
      values.forEach((value, valueIndex) => {
        const code = codes[suitIndex * 13 + valueIndex];
        deck.push({
          code,
          image: '', // Placeholder, will be assigned later
          value,
          suit,
        });
      });
    });

    return deck;
  };

  const shuffleDeck = (deck) => {
    // Implementing Fisher-Yates Shuffle
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const sortHand = (hand) => {
    const suitOrder = [SUITS.SPADES, SUITS.HEARTS, SUITS.CLUBS, SUITS.DIAMONDS];
    return [...hand].sort((a, b) => {
      const suitComparison = suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit);
      if (suitComparison !== 0) {
        return suitComparison;
      }
      return parseCardValue(a) - parseCardValue(b);
    });
  };

  const parseCardValue = (card) => {
    const value = CARD_VALUES[card.value];
    return value || 0;
  };

  const handleBidding = (bid) => {
    dispatch({ type: ACTIONS.SET_BID, playerIndex: state.currentPlayer, bid });

  };

  const handlePlayCard = (playerIndex, cardIndex) => {
    const card = state.players[playerIndex][cardIndex];
    const playerHand = state.players[playerIndex];

    const errorMessage = validateCardPlay(card, playerHand);
    if (errorMessage) {
      dispatch({ type: ACTIONS.SET_ERROR_MESSAGE, errorMessage });
      return;
    }
    dispatch({ type: ACTIONS.SET_ERROR_MESSAGE, errorMessage: '' });

    const newPlayers = state.players.map((hand, index) =>
      index === playerIndex ? hand.filter((_, i) => i !== cardIndex) : hand
    );

    const newPlayedCards = [...state.playedCards, { player: playerIndex, card }];

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

    dispatch({
      type: ACTIONS.PLAY_CARD,
      players: newPlayers,
      playedCards: newPlayedCards,
      leadSuit: newLeadSuit,
      spadesBroken,
      currentPlayer: nextPlayer,
    });

    console.log(`After PLAY_CARD Action:`, {
      players: newPlayers,
      playedCards: newPlayedCards,
      leadSuit: newLeadSuit,
      spadesBroken,
      currentPlayer: nextPlayer,
    });
  };

  useEffect(() => {
    if (state.playedCards.length === NUM_PLAYERS) {
      // Prevent multiple triggers by checking if a trick is already being processed
      if (state.gamePhase === GAME_PHASES.PLAYING && !state.isProcessing) {
        dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: true });
        setTimeout(() => {
          calculateTrickWinner(state.playedCards, state.players);
        }, 0); // Slight delay for UX
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.playedCards]);

  // Refactored Validation Logic
  const validateCardPlay = (card, playerHand) => {
    console.log('Validating card play:', card);

    if (state.leadSuit) {
      return validateFollowSuit(card, playerHand);
    } else {
      return validateLeadCard(card, playerHand);
    }
  };

  const validateFollowSuit = (card, playerHand) => {
    const hasLeadSuit = playerHand.some((c) => c.suit === state.leadSuit);
    if (hasLeadSuit) {
      const playerLeadSuitCards = playerHand.filter(
        (c) => c.suit === state.leadSuit
      );
      const highestCardValue = getHighestCardValueInLeadSuit();
      const higherCards = playerLeadSuitCards.filter(
        (c) => parseCardValue(c) > highestCardValue
      );

      if (higherCards.length > 0) {
        if (
          card.suit !== state.leadSuit ||
          parseCardValue(card) <= highestCardValue
        ) {
          return 'You must play a higher card in the lead suit!';
        }
      } else {
        if (card.suit !== state.leadSuit) {
          return 'You must follow suit!';
        }
      }
    } else {
      return validateSpades(card, playerHand);
    }

    return null;
  };

  const validateSpades = (card, playerHand) => {
    const highestSpadeValueInTrick = state.playedCards
      .filter((play) => play.card.suit === SUITS.SPADES)
      .reduce((max, play) => Math.max(max, parseCardValue(play.card)), 0);

    const playerHasSpades = playerHand.some((c) => c.suit === SUITS.SPADES);
    const playerHasHigherSpades = playerHand.some(
      (c) =>
        c.suit === SUITS.SPADES && parseCardValue(c) > highestSpadeValueInTrick
    );

    if (playerHasSpades) {
      if (playerHasHigherSpades) {
        if (
          card.suit !== SUITS.SPADES ||
          parseCardValue(card) <= highestSpadeValueInTrick
        ) {
          return 'You must play a higher spade if you have one!';
        }
      }
    }

    return null;
  };

  const validateLeadCard = (card, playerHand) => {
    if (!state.spadesBroken) {
      if (card.suit === SUITS.SPADES) {
        const hasOnlySpades = playerHand.every(
          (c) => c.suit === SUITS.SPADES
        );
        if (!hasOnlySpades) {
          return 'You cannot lead with a spade until spades have been broken!';
        }
      }
    }
    return null;
  };

  // Helper function to get the highest card value in the lead suit from played cards
  const getHighestCardValueInLeadSuit = () => {
    const leadSuitCards = state.playedCards
      .filter((play) => play.card.suit === state.leadSuit)
      .map((play) => parseCardValue(play.card));
    return Math.max(0, ...leadSuitCards);
  };

  const calculateTrickWinner = (trick, players) => {
    console.log('Calculating trick winner...');
    console.log('Trick:', trick);
    console.log('Players:', players);

    try {
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
      console.log(`Winner Index: ${winnerIndex}`);

      const newTricksWon = [...state.tricksWon];
      newTricksWon[winnerIndex] += 1;

      setTimeout(() => {
        dispatch({
          type: ACTIONS.UPDATE_TRICKS_WON,
          tricksWon: newTricksWon,
          winnerIndex,
        });
        console.log(`After UPDATE_TRICKS_WON Action:`, {
          tricksWon: newTricksWon,
          trickWinner: winnerIndex,
        });
      }, 1000);

      const resetTrickDelay = 2000 + 1;

      const isRoundOver = players.every((hand) => hand.length === 0);
      if (isRoundOver) {
        setTimeout(() => {
          dispatch({
            type: ACTIONS.SET_GAME_PHASE,
            gamePhase: GAME_PHASES.ROUND_END,
          });
          console.log(`Game Phase set to ROUND_END`);

          calculateScores(newTricksWon);

          dispatch({
            type: ACTIONS.SET_CURRENT_PLAYER,
            currentPlayer: null,
          });
          console.log(`Current Player set to null`);
        }, resetTrickDelay);
      } else {
        setTimeout(() => {
          dispatch({
            type: ACTIONS.RESET_TRICK,
            players,
            currentPlayer: winnerIndex,
          });
          console.log(`After RESET_TRICK Action:`, {
            players,
            currentPlayer: winnerIndex,
          });
        }, resetTrickDelay);
      }
    } catch (error) {
      console.error('Error in calculateTrickWinner:', error);
      dispatch({
        type: ACTIONS.SET_ERROR_MESSAGE,
        errorMessage: 'An error occurred while calculating the trick winner.',
      });
      dispatch({
        type: ACTIONS.SET_PROCESSING,
        isProcessing: false,
      });
    }
  };

  const getCardRank = (card, leadSuit) => {
    let rank = 0;
    if (card.suit === SUITS.SPADES) {
      rank = 2;
    } else if (card.suit === leadSuit) {
      rank = 1;
    }
    return rank;
  };

  // AI bidding logic
  useEffect(() => {
    if (
      state.gamePhase === GAME_PHASES.BIDDING &&
      state.currentPlayer !== 0 &&
      !state.isProcessing
    ) {
      const bidTimeout = setTimeout(() => {
        handleAIBid();
      }, 200); // Adjusted delay for better UX

      return () => clearTimeout(bidTimeout);
    }
  }, [state.currentPlayer, state.gamePhase, state.turnNumber, state.isProcessing]);

  const handleAIBid = () => {
    dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: true });
    const aiHand = state.players[state.currentPlayer];
    const aiBid = calculateAIBid(aiHand);
    handleBidding(aiBid);
    dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
  };

  const calculateAIBid = (hand) => {
    let bid = 0;
    hand.forEach((card) => {
      const value = parseCardValue(card);
      if (card.suit === SUITS.SPADES) {
        if (value >= CARD_VALUES['9']) {
          bid += 1;
        }
      } else if (
        value >= CARD_VALUES['JACK'] ||
        value === CARD_VALUES['ACE'] ||
        value === CARD_VALUES['KING']
      ) {
        bid += 0.5;
      }
    });
    bid = Math.max(1, Math.round(bid));
    return bid;
  };

  useEffect(() => {
    let aiTimeout;

    if (
      state.gamePhase === GAME_PHASES.PLAYING &&
      typeof state.currentPlayer === 'number' &&
      state.currentPlayer !== 0 &&
      state.players[state.currentPlayer] &&
      state.players[state.currentPlayer].length > 0 &&
      !state.isProcessing
    ) {
      aiTimeout = setTimeout(() => {
        handleAIPlay(state.currentPlayer);
      }, 200); // Adjusted delay for better UX
    }

    return () => {
      if (aiTimeout) clearTimeout(aiTimeout);
    };
  }, [state.currentPlayer, state.gamePhase, state.isProcessing]);

  const handleAIPlay = (playerIndex) => {
    try {
      dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: true });

      if (
        typeof playerIndex !== 'number' ||
        playerIndex <= 0 ||
        playerIndex >= NUM_PLAYERS
      ) {
        console.error(`Invalid AI player index: ${playerIndex}`);
        dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
        return;
      }

      console.log(`AI Player ${playerIndex + 1} is about to play.`);

      const aiHand = state.players[playerIndex];
      console.log('AI Hand:', aiHand);

      if (!aiHand || aiHand.length === 0) {
        console.error(`AI Player ${playerIndex + 1} has no cards to play.`);
        dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
        return;
      }

      const leadSuit =
        state.playedCards.length > 0 ? state.playedCards[0].card.suit : null;
      console.log('Lead Suit:', leadSuit);

      const validCards = getValidCards(aiHand);
      console.log('Valid Cards for AI:', validCards);

      if (validCards.length === 0) {
        console.error(
          `No valid cards for AI Player ${playerIndex + 1} to play.`
        );
        dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
        return;
      }

      let selectedCard = null;
      for (let card of validCards) {
        if (canWinTrick(card)) {
          selectedCard = card;
          console.log('AI found a card to win the trick:', selectedCard);
          break;
        }
      }

      if (!selectedCard) {
        selectedCard = validCards.reduce((lowestCard, card) =>
          parseCardValue(card) < parseCardValue(lowestCard) ? card : lowestCard
        );
        console.log(
          'AI could not win the trick. Playing the lowest card:',
          selectedCard
        );
      }

      const cardIndex = aiHand.findIndex(
        (card) => card.code === selectedCard.code
      );
      if (cardIndex === -1) {
        console.error(`Selected card not found in AI hand: ${selectedCard}`);
        dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
        return;
      }

      console.log(
        `AI Player ${playerIndex + 1} is playing card at index ${cardIndex}.`
      );

      handlePlayCard(playerIndex, cardIndex);
      dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
    } catch (error) {
      console.error('Error in handleAIPlay:', error);
      dispatch({
        type: ACTIONS.SET_ERROR_MESSAGE,
        errorMessage: 'An error occurred during AI play.',
      });
      dispatch({ type: ACTIONS.SET_PROCESSING, isProcessing: false });
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
          return higherCards;
        } else {
          return playerLeadSuitCards;
        }
      } else {
        const hasSpades = hand.some((card) => card.suit === SUITS.SPADES);
        if (hasSpades) {
          return hand.filter((card) => card.suit === SUITS.SPADES);
        } else {
          return hand;
        }
      }
    } else {
      if (!state.spadesBroken) {
        const nonSpadeCards = hand.filter((card) => card.suit !== SUITS.SPADES);
        if (nonSpadeCards.length > 0) {
          return nonSpadeCards;
        } else {
          return hand;
        }
      } else {
        return hand;
      }
    }
  };

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
      type: ACTIONS.UPDATE_SCORES,
      scores: newScores,
      overtricks: newOvertricks,
    });
  };

  const startNextRound = () => {
    if (state.roundNumber >= state.maxRounds) {
      dispatch({ type: ACTIONS.SET_GAME_PHASE, gamePhase: GAME_PHASES.GAME_OVER });
    } else {
      dispatch({ type: ACTIONS.INCREMENT_ROUND });
      initializeGame();
    }
  };

  const restartGame = () => {
    dispatch({ type: ACTIONS.RESET_GAME });
    initializeGame();
  };

  const calculateSuggestedBid = (hand) => {
    let bid = 0;
    hand.forEach((card) => {
      const value = parseCardValue(card);
      if (card.suit === SUITS.SPADES) {
        if (value >= CARD_VALUES['9']) {
          bid += 1;
        }
      } else if (
        value >= CARD_VALUES['JACK'] ||
        value === CARD_VALUES['ACE'] ||
        value === CARD_VALUES['KING']
      ) {
        bid += 0.5;
      }
    });
    bid = Math.max(1, Math.round(bid));
    return bid;
  };

  return {
    state,
    handleBidding,
    handlePlayCard,
    startNextRound,
    restartGame,
    handleDealCards,
    calculateSuggestedBid,
    canWinTrick,
  };
}

export default useGameLogic;
