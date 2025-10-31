// filepath: c:\Users\pbziu\OneDrive\Dokumente\Development\blamegame\components\core\GameContainer.tsx
/**
 * GameContainer Component
 *
 * Purpose: Provides a consistent layout wrapper for all game screens, 
 *          including a gradient background and centering content. It also
 *          now incorporates the GameHeader to display the game title.
 *
 * Props:
 *  - children: React.ReactNode - The content to be rendered within the container.
 *  - onTitleClick?: () => void - Optional callback for title click events.
 *
 * Dependencies:
 *  - React
 *  - ./GameHeader
 *
 * Other components integrating this component or using it:
 *  - App.tsx (implicitly, as it wraps all screen content)
 */
import React from 'react';
import GameHeader from './GameHeader'; // Title component specific to BlameGame
import { GameLayout, GameHeader as LayoutHeader, GameBody, GameFooter } from '../core/GameLayout';

interface GameContainerProps {
  children: React.ReactNode;
  onTitleClick?: () => void; // Add onTitleClick to props
}

/**
 * GameContainer is a layout component that provides a styled container for the game.
 * It applies a vertical gradient background, centers its content, and ensures the minimum height
 * covers the viewport. It also renders the GameHeader and wraps its children within a centered box.
 *
 * @param {GameContainerProps} props - The props for the GameContainer component.
 * @param {React.ReactNode} props.children - The content to be rendered inside the container.
 * @param {() => void} [props.onTitleClick] - Optional callback for title click events.
 * @returns {JSX.Element} The rendered GameContainer component.
 */
const GameContainer: React.FC<GameContainerProps> = ({ children, onTitleClick }) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-gradient-to-b from-autumn-500 to-autumn-300"
    >
      <GameLayout>
        <LayoutHeader>
          <GameHeader onTitleClick={onTitleClick} />
        </LayoutHeader>
        <GameBody>
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex-grow flex flex-col items-center justify-center min-h-0">
            {children}
          </div>
        </GameBody>
        <GameFooter />
      </GameLayout>
    </div>
  );
};

export default GameContainer;
