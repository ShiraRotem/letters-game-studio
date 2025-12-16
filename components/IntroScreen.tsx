import React from 'react';
import { Play } from 'lucide-react';

interface IntroScreenProps {
  onStart: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-blue-400 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_10px_0_rgba(0,0,0,0.1)] text-center max-w-lg w-full transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-6xl md:text-7xl font-bold text-blue-500 mb-6 drop-shadow-sm tracking-wide">
          Letters<br/>Game!
        </h1>
        <div className="flex justify-center mb-8 space-x-4">
          <span className="text-4xl">🅰️</span>
          <span className="text-4xl">🅱️</span>
          <span className="text-4xl">🐋</span>
        </div>
        <button
          onClick={onStart}
          className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-3xl font-bold py-6 px-12 rounded-full shadow-[0_6px_0_#15803d] hover:shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-2 transition-all flex items-center justify-center gap-4 mx-auto w-full md:w-auto"
        >
          <Play size={40} fill="currentColor" />
          Let's Play
        </button>
      </div>
    </div>
  );
};
