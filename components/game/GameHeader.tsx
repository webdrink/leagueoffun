// filepath: c:\Users\pbziu\OneDrive\Dokumente\Development\blamegame\components\core\GameHeader.tsx
/**
 * GameHeader Component
 *
 * Purpose: Displays the main title of the game.
 *
 * Props:
 *  - title: The main title to display (e.g., "BlameGame").
 *  - onTitleClick: Optional click handler for the title.
 *
 * Dependencies:
 *  - React
 */
import React from 'react';

interface GameHeaderProps {
  title: string;
  onTitleClick?: () => void; // Add optional click handler prop
}

/**
 * Renders the header section for the game, displaying the provided title.
 *
 * @param props - The props for the GameHeader component.
 * @param props.title - The title text to display in the header.
 * @param props.onTitleClick - Optional click handler for the title.
 * @returns A styled header element containing the game title.
 */
const GameHeader: React.FC<GameHeaderProps> = ({ title, onTitleClick }) => {
  return (
    <div className="w-full flex justify-center">
      <div className="shadow-2xl rounded-2xl border-pink-200 px-8 py-6 max-w-2xl w-stretch flex justify-center items-center bg-white/70 backdrop-blur-md">
        <h1
          className="text-6xl sm:text-6xl font-extrabold text-purple-700 text-center cursor-pointer select-none font-mono tracking-tight drop-shadow-lg"
          style={{ fontFamily: "'Orbitron', 'Montserrat', 'Segoe UI', monospace" }}
          onClick={onTitleClick}
        >
          {title}
        </h1>
      </div>
    </div>
  );
};

export default GameHeader;
