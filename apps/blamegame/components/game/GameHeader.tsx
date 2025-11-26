// filepath: c:\Users\pbziu\OneDrive\Dokumente\Development\blamegame\components\core\GameHeader.tsx
/**
 * GameHeader Component
 *
 * Purpose: Displays the main title of the game with responsive design and overflow prevention.
 *
 * Props:
 *  - title: The main title to display (e.g., "BlameGame").
 *  - onTitleClick: Optional click handler for the title.
 *
 * Dependencies:
 *  - React
 *
 * Features:
 *  - Responsive text sizing that prevents overflow
 *  - Consistent height following PWA best practices
 *  - Adaptive layout for different viewport sizes
 *  - Text truncation and wrapping for long titles
 */
import React from 'react';
import { useGameStore } from '../../store/gameStore';

interface GameHeaderProps {
  title?: string;
  onTitleClick?: () => void; // Add optional click handler prop
}

/**
 * Renders the header section for the game, displaying the provided title.
 * Implements responsive design with overflow prevention and PWA-compliant sizing.
 *
 * @param props - The props for the GameHeader component.
 * @param props.title - The title text to display in the header.
 * @param props.onTitleClick - Optional click handler for the title.
 * @returns A styled header element containing the game title.
 */
const GameHeader: React.FC<GameHeaderProps> = ({ title, onTitleClick }) => {
  const storeTitle = useGameStore(state => state.gameInfo?.title);
  const finalTitle = title ?? storeTitle ?? 'BlameGame';
  
  return (
    <div className="w-full flex justify-center flex-shrink-0">
      <div className="
        shadow-2xl rounded-2xl border-rust-200 
        px-3 sm:px-4 md:px-6 lg:px-8 
        py-3 sm:py-3 md:py-4 lg:py-4
        w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl
        min-h-[56px] sm:min-h-[60px] md:min-h-[64px] lg:min-h-[68px]
        flex justify-center items-center 
        bg-white/70 backdrop-blur-md
        overflow-hidden
      ">
        <h1
          className="
            text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl 
            font-extrabold text-autumn-700 text-center 
            cursor-pointer select-none tracking-tight 
            drop-shadow-lg leading-tight
            w-full max-w-full
            break-words hyphens-auto
            overflow-hidden
            line-clamp-2
            game-header-font
            header-text-overflow
          "
          onClick={onTitleClick}
          title={finalTitle} // Tooltip for accessibility
        >
          {finalTitle}
        </h1>
      </div>
    </div>
  );
};

export default GameHeader;
