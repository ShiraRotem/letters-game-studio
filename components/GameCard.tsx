import React from 'react';
import { GameOption } from '../types';
import { X } from 'lucide-react';

interface GameCardProps {
  option: GameOption;
  isSelected: boolean;
  onClick: () => void;
  showError: boolean;
  disabled: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  option, 
  isSelected, 
  onClick, 
  showError,
  disabled 
}) => {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        relative
        h-48 md:h-64 
        w-full md:w-1/3
        rounded-3xl 
        bg-white 
        shadow-[0_8px_0_rgba(0,0,0,0.1)] 
        border-4 
        flex flex-col items-center justify-center
        cursor-pointer
        transition-all duration-200
        ${disabled ? 'cursor-default' : 'hover:-translate-y-2 active:translate-y-0 active:shadow-none'}
        ${isSelected 
          ? 'border-blue-500 ring-4 ring-blue-300 scale-105 z-10' 
          : 'border-gray-200 scale-100'}
        ${showError ? 'border-red-500 bg-red-50 shake' : ''}
      `}
    >
      <div className="text-7xl md:text-8xl mb-4 transition-transform hover:scale-110">
        {option.emoji}
      </div>
      <div className="text-2xl md:text-3xl font-bold text-gray-700 uppercase tracking-wider">
        {option.word}
      </div>

      {/* Error Overlay */}
      {showError && (
        <div className="absolute inset-0 bg-red-500/80 rounded-2xl flex items-center justify-center animate-fade-in">
          <X className="text-white w-32 h-32 drop-shadow-lg" strokeWidth={4} />
        </div>
      )}
    </div>
  );
};
