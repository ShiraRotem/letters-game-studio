import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, RoundData } from './types';
import { generateGameRound } from './services/geminiService';
import { IntroScreen } from './components/IntroScreen';
import { GameCard } from './components/GameCard';
import { Confetti } from './components/Confetti';
import { useAudio } from './hooks/useAudio';
import { Loader2, RefreshCw } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.INTRO);
  const [currentRound, setCurrentRound] = useState<RoundData | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0); // 0, 1, 2
  const [wrongIndex, setWrongIndex] = useState<number | null>(null); // To show X
  const [showConfetti, setShowConfetti] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  
  const { playYay, playTryAgain, speak } = useAudio();
  
  // Used to prevent double fetching
  const isFetching = useRef(false);
  // Track if this is the first round for detailed instructions
  const isFirstRound = useRef(true);

  // Load a round
  const loadRound = useCallback(async (excludeLetter?: string) => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    setGameState(GameState.LOADING);
    setWrongIndex(null);
    setShowConfetti(false);
    
    // Fetch data
    const data = await generateGameRound(excludeLetter);
    
    setCurrentRound(data);
    setSelectedIndex(1); // Default to middle card for keyboard users
    setGameState(GameState.PLAYING);
    
    // Audio instructions logic
    if (isFirstRound.current) {
      speak(`Find the word that starts with ${data.letter}!`);
      isFirstRound.current = false;
    } else {
      speak(`${data.letter}!`);
    }
    
    isFetching.current = false;
  }, [speak]);

  // Handle Game Start
  const handleStart = () => {
    // Initial user interaction needed for AudioContext
    loadRound();
  };

  // Handle Logic when a card is chosen
  const handleChoice = (index: number) => {
    if (gameState !== GameState.PLAYING || !currentRound || wrongIndex !== null) return;

    const chosenOption = currentRound.options[index];

    if (chosenOption.isCorrect) {
      // CORRECT
      playYay();
      
      // Speak the chosen word after a short delay to let the Yay sound play
      setTimeout(() => {
        speak(`${chosenOption.word}!`);
      }, 800);

      setGameState(GameState.SUCCESS);
      setShowConfetti(true);
      
      // Wait 3 seconds then next round (increased to allow spoken word to finish)
      setTimeout(() => {
        loadRound(currentRound.letter);
      }, 3000);
    } else {
      // WRONG
      playTryAgain();
      setWrongIndex(index);
      
      // Remove error after 1 second
      setTimeout(() => {
        setWrongIndex(null);
      }, 1000);
    }
  };

  // Skip Logic
  const handleSkip = useCallback(() => {
    if (gameState === GameState.PLAYING && !isFetching.current && currentRound) {
       loadRound(currentRound.letter);
    }
  }, [gameState, currentRound, loadRound]);


  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === GameState.INTRO) return;

      // Enable visual highlight for keyboard users once they touch a key
      if (!isKeyboardMode) setIsKeyboardMode(true);

      switch (e.key) {
        case 'ArrowLeft':
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 2));
          break;
        case 'ArrowRight':
          setSelectedIndex((prev) => (prev < 2 ? prev + 1 : 0));
          break;
        case 'Enter':
          handleChoice(selectedIndex);
          break;
        case ' ': // Space bar
          e.preventDefault(); // Prevent scrolling
          handleSkip();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, selectedIndex, isKeyboardMode, handleSkip, wrongIndex, currentRound]);

  // Intro Screen
  if (gameState === GameState.INTRO) {
    return <IntroScreen onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-[#F0F9FF] flex flex-col relative overflow-hidden">
      {/* Confetti Overlay */}
      {showConfetti && <Confetti />}

      {/* Header Area */}
      <header className="flex-1 flex flex-col items-center justify-center pt-8 pb-4 relative">
        {/* Skip button for Desktop visual cue (optional but helpful) */}
        <div className="absolute top-4 right-4 hidden md:block text-gray-400 text-sm">
           Press Space to Skip
        </div>

        {gameState === GameState.LOADING ? (
          <div className="animate-spin text-blue-400">
            <Loader2 size={80} />
          </div>
        ) : (
          <div className="animate-pop text-center">
            <h2 className="text-3xl font-bold text-gray-500 mb-2">Find the word starting with:</h2>
            <div className="text-[12rem] leading-none font-bold text-blue-500 drop-shadow-md select-none">
              {currentRound?.letter}
            </div>
          </div>
        )}
      </header>

      {/* Game Area */}
      <main className="flex-1 container mx-auto px-4 pb-8">
        {currentRound && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-center h-full max-w-5xl mx-auto">
            {currentRound.options.map((option, index) => (
              <GameCard
                key={`${option.word}-${index}`}
                option={option}
                isSelected={isKeyboardMode && selectedIndex === index}
                showError={wrongIndex === index}
                disabled={gameState !== GameState.PLAYING}
                onClick={() => {
                  setIsKeyboardMode(false); // Disable keyboard highlight if touch used
                  setSelectedIndex(index);
                  handleChoice(index);
                }}
              />
            ))}
          </div>
        )}
      </main>
      
      {/* Footer / Mobile Help */}
      <footer className="p-4 text-center text-gray-400 text-sm md:hidden">
        Tap the picture that starts with the letter!
      </footer>
    </div>
  );
}

export default App;