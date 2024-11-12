// App.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameBoard from './components/GameBoard';
import './App.css';
import logo from './assets/B.webp';

function App() {
  const [isGameStarted, setIsGameStarted] = useState(false);

  const handleStartGame = () => {
    setIsGameStarted(true);
  };

  // Variants for the logo animation when starting the game
  const logoVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: { 
      scale: 15, 
      opacity: 0,
      transition: { duration: 1.5, ease: 'easeInOut' }
    },
  };

  // Variants for the game board appearance
  const gameBoardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.5 } },
  };

  return (
    <div className="App">
      <AnimatePresence>
        {!isGameStarted && (
          <motion.div
            key="intro"
            initial="initial"
            animate={!isGameStarted ? "initial" : "animate"}
            exit="animate"
            className="introContainer"
            style={{ cursor: 'pointer' }}
            tabIndex={0}
            role="button"
            aria-label="Start Call Break Game"
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleStartGame();
              }
            }}
          >
            <motion.img
              onClick={handleStartGame}
              key="logo"
              className="callBreakLogo"
              src={logo}
              alt="Call Break Logo"
              variants={logoVariants}
              initial="initial"
              animate={!isGameStarted ? "initial" : "animate"}
              // Prevent Framer Motion from handling hover and tap
              whileHover={false}
              whileTap={false}
            />
            
          </motion.div>
          
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameStarted && (
          <motion.div
            className="GameBoard"
            variants={gameBoardVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <GameBoard />
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

export default App;
