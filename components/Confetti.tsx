import React from 'react';

const COLORS = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#800080'];

export const Confetti: React.FC = () => {
  // Create 50 pieces of confetti with random properties
  const pieces = Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.5}s`,
    backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    transform: `rotate(${Math.random() * 360}deg)`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece rounded-sm"
          style={{
            left: p.left,
            animationDelay: p.animationDelay,
            backgroundColor: p.backgroundColor,
          }}
        />
      ))}
    </div>
  );
};
