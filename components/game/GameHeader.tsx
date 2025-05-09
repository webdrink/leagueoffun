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
    <div className="w-full py-4">
      <h1 
        className="text-3xl font-bold text-white text-center cursor-pointer" // Add cursor-pointer
        onClick={onTitleClick} // Add onClick handler
      >
        {title}
      </h1>
    </div>
  );
};

export default GameHeader;
