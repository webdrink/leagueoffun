/**
 * QuestionScreen Component
 * 
 * Purpose: Displays individual questions during the game and handles
 * user interaction for navigating between questions.
 * 
 * Props: 
 * - question: The current question to display
 * - index: Current question index
 * - totalQuestions: Total number of questions
 * - gameSettings: Game configuration
 * - nameBlameMode: Whether name blame mode is active
 * - activePlayers: List of active players
 * - currentPlayerIndex: Index of current player
 * - onBlame: Callback for blaming a player
 * - onNext: Callback for advancing to next question
 * - onBack: Callback for going back to previous question
 * 
 * Dependencies:
 * - react, react-i18next, framer-motion, lucide-react
 * - ./QuestionProgress (New)
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../core/Button';
import { Question, Player, GameSettings, NameBlameState } from '../../types';
import QuestionCard from './QuestionCard';
import QuestionProgress from './QuestionProgress'; // Import the new QuestionProgress component

interface QuestionScreenProps {
  question: Question;
  index: number;
  totalQuestions: number;
  gameSettings: GameSettings;
  nameBlameMode: boolean;
  activePlayers: Player[];
  currentPlayerIndex: number; 
  onBlame: (blamedPlayerName: string) => void;
  onNext: () => void;
  onBack: () => void;
  onNextBlame?: () => void; // Optional prop for handling "Next Blame" in NameBlame mode
  blameState?: NameBlameState; // Optional prop for blame state in NameBlame mode
}

/**
 * Renders the main question screen for the game, displaying the current question,
 * progress, and controls for navigation or blaming other players depending on the mode.
 *
 * @component
 * @param {QuestionScreenProps} props - The props for the QuestionScreen component.
 * @param {Question} props.question - The current question object to display.
 * @param {number} props.index - The index of the current question (zero-based).
 * @param {number} props.totalQuestions - The total number of questions in the game.
 * @param {GameSettings} props.gameSettings - The settings for the current game session.
 * @param {boolean} props.nameBlameMode - Whether the game is in "name blame" mode.
 * @param {Player[]} props.activePlayers - The list of active players in the game.
 * @param {number} props.currentPlayerIndex - The index of the current player.
 * @param {(playerName: string) => void} props.onBlame - Callback when a player is blamed.
 * @param {() => void} props.onNext - Callback to go to the next question.
 * @param {() => void} props.onBack - Callback to go to the previous question.
 *
 * @returns {JSX.Element} The rendered question screen component.
 */
const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  index,
  totalQuestions,
  gameSettings: _gameSettings, // unused in this simplified flow (retained for interface compatibility)
  nameBlameMode,
  activePlayers,
  currentPlayerIndex,
  onBlame,
  onNext,
  onBack,
  onNextBlame,
  blameState
}) => {
  const { t } = useTranslation();
  const [direction, setDirection] = useState(0);
  
  // Get blame round info from store
  // No store helpers needed in simplified single-blame chain flow

  const handleNextWithDirection = () => {
    setDirection(1);
    onNext();
  };

  const handleBackWithDirection = () => {
    setDirection(-1);
    onBack();
  };

  const currentPlayer = nameBlameMode ? activePlayers[currentPlayerIndex] : null;
  
  // Calculate remaining players for better button text
  // Chain flow: always exactly one blame per question, so button always advances to next question.
  const isLastPlayerInRound = true;
  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-4">
      {/* Top area for player turn info and new QuestionProgress component */}
  <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
        {nameBlameMode && currentPlayer && (
          <p className="text-center text-lg text-white mb-1 sm:mb-2 px-4">
            <span className="font-semibold">{currentPlayer.name}</span> {t('questions.player_turn')}
          </p>
        )}
        {/* New QuestionProgress component */}
        <QuestionProgress currentQuestion={index + 1} totalQuestions={totalQuestions} />
      </div>

      {/* Question Card Area */}
      <div className="w-full flex-grow flex items-center justify-center overflow-hidden px-2 sm:px-0 my-2 sm:my-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index} // Re-render on question change
            custom={direction}
            initial={{ opacity: 0, x: direction !== 0 ? (direction > 0 ? 200 : -200) : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-[45vh] sm:h-[50vh] max-h-[500px] max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl flex items-center justify-center"
          >
            <QuestionCard question={question} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Area */}
  <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl px-4">
        {nameBlameMode && activePlayers.length > 0 && (
          <div className="mt-2 sm:mt-4">
            {/* Show blame context when in 'blamed' phase */}
            {blameState?.phase === 'reveal' && blameState.currentBlamer && blameState.currentBlamed && (
              <div className="text-center mb-4 p-3 bg-rust-100 rounded-lg border-2 border-rust-300">
                <p className="text-autumn-700 font-semibold">
                  {t('questions.blamed_you_for', { 
                    name: blameState.currentBlamer
                  })}
                </p>
                <p className="text-autumn-600 text-sm mt-1">
                  &ldquo;{blameState.currentQuestion}&rdquo;
                </p>
              </div>
            )}
            
            {/* Show player selection when in 'selecting' phase or no blame state */}
            {(!blameState || blameState.phase === 'selecting') && (
              <>
                <p className="text-center text-sm text-white mb-2">
                  {t('questions.who_blame')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activePlayers.map((player) => {
                    const currentPlayer = activePlayers[currentPlayerIndex];
                    const isSelf = currentPlayer && player.id === currentPlayer.id;
                    return (
                      <Button
                        key={player.id}
                        onClick={() => onBlame(player.name)}
                        className={`bg-rust-400 hover:bg-rust-200 text-autumn-700 font-semibold rounded-lg py-2.5 px-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-rust-00 focus:ring-opacity-75
                              ${isSelf ? 'opacity-60 cursor-not-allowed !bg-gray-300 !text-gray-500' : 'hover:scale-105'}`}
                        disabled={!!isSelf}
                        title={
                          isSelf
                            ? t('questions.cannot_blame_self')
                            : t('questions.blame_player', { name: player.name })
                        }
                      >
                        {player.name}
                      </Button>
                    );
                  })}
                </div>
              </>
            )}
            
            {/* Show "Next Blame" button when in 'blamed' phase */}
            {blameState?.phase === 'reveal' && onNextBlame && (
              <div className="mt-4 text-center">
                <Button 
                  onClick={onNextBlame} 
                  className="bg-autumn-600 hover:bg-autumn-700 text-white px-6 py-3 rounded-lg shadow font-semibold"
                  aria-label={isLastPlayerInRound ? t('blame.continue_to_question') : t('blame.continue_to_next')}
                >
                  {t('blame.continue_to_question')}
                </Button>
              </div>
            )}
          </div>
        )}

        {!nameBlameMode && (
          <div className="mt-3 sm:mt-4 flex justify-between items-center space-x-3">
            <Button 
              onClick={handleBackWithDirection} 
              disabled={index === 0} 
              className="bg-white/80 hover:bg-white text-autumn-700 border-autumn-300 px-4 py-2.5 rounded-lg shadow disabled:opacity-60"
              aria-label={t('questions.previous_question')}
            >
              {t('app.back')}
            </Button>
            <Button 
              onClick={handleNextWithDirection} 
              className="bg-autumn-600 hover:bg-autumn-700 text-white px-4 py-2.5 rounded-lg shadow flex-grow"
              aria-label={index === totalQuestions - 1 ? t('questions.show_summary') : t('questions.next_question')}
            >
              {index === totalQuestions - 1 ? t('questions.summary') : t('questions.next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionScreen;
