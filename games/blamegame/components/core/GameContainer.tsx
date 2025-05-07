import React from 'react';

interface GameContainerProps {
  children: React.ReactNode;
}

const GameContainer: React.FC<GameContainerProps> = ({ children }) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between px-2 sm:px-4 py-4 bg-gradient-to-b from-pink-500 to-pink-300"
      style={{ minHeight: '100dvh' }}
    >
      <div className="w-full max-w-md flex-grow flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default GameContainer;
