import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../core/Button'; // Adjusted path
import { Card, CardContent } from '../core/Card'; // Adjusted path
import { getEmoji } from '../../lib/formatters'; // Updated import path
import { Question, Player, GameSettings } from '../../types'; // Path should be correct
import QuestionCard from './QuestionCard'; // Adjusted path (same directory)
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface QuestionScreenProps {
  question: Question;
  index: number;
  totalQuestions: number;
  gameSettings: GameSettings;
  nameBlameMode: boolean;
  activePlayers: Player[];
  currentPlayerIndex: number; // Index of the player whose turn it is (cannot blame themselves)
  onBlame: (blamedPlayerName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  index,
  totalQuestions,
  gameSettings,
  nameBlameMode,
  activePlayers,
  currentPlayerIndex,
  onBlame,
  onNext,
  onBack
}) => {
  const { t } = useTranslation();
  const [direction, setDirection] = useState(0); // 1 for next, -1 for back

  const handleNextWithDirection = () => {
    setDirection(1);
    onNext();
  };

  const handleBackWithDirection = () => {
    setDirection(-1);
    onBack();
  };

  const currentPlayer = nameBlameMode ? activePlayers[currentPlayerIndex] : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between py-4">
      {/* Top area for player turn info or question count */}
      <div className="w-full max-w-md px-4">        {nameBlameMode && currentPlayer && (
          <p className="text-center text-lg text-white mb-1 sm:mb-2">
            <span className="font-semibold">{currentPlayer.name}</span> {t('questions.player_turn')}
          </p>
        )}        <div className="h-2 bg-white/30 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <p className="text-center mt-1 text-xs sm:text-sm text-white/80">
          {t('questions.counter', { current: index + 1, total: totalQuestions })}
        </p>
      </div>

      {/* Question Card Area */}
      <div className="w-full flex-grow flex items-center justify-center overflow-hidden px-2 sm:px-0 my-2 sm:my-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index} // Ensures re-render on question change
            custom={direction}
            initial={{ opacity: 0, x: direction !== 0 ? (direction > 0 ? 200 : -200) : 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -200 : 200 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full h-[45vh] sm:h-[50vh] max-h-[500px] max-w-md flex items-center justify-center"
          >
            <QuestionCard question={question} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Area */}
      <div className="w-full max-w-md px-4">
        {nameBlameMode && activePlayers.length > 0 && (          <div className="mt-2 sm:mt-4">            <p className="text-center text-sm text-white mb-2">
              {t('questions.who_blame')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activePlayers.map((player, i) => (
                <Button
                  key={player.id}
                  onClick={() => onBlame(player.name)}
                  className={`bg-pink-100 hover:bg-pink-200 text-purple-700 font-semibold rounded-lg py-2.5 px-3 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75
                              ${i === currentPlayerIndex ? 'opacity-60 cursor-not-allowed !bg-gray-300 !text-gray-500' : 'hover:scale-105'}`}
                  disabled={i === currentPlayerIndex}                  title={i === currentPlayerIndex ? t('questions.cannot_blame_self') : t('questions.blame_player', { name: player.name })}
                >
                  {player.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {!nameBlameMode && (
          <div className="mt-3 sm:mt-4 flex justify-between items-center space-x-3">
            <Button 
              onClick={handleBackWithDirection} 
              disabled={index === 0} 
              className="bg-white/80 hover:bg-white text-purple-700 border-purple-300 px-4 py-2.5 rounded-lg shadow disabled:opacity-60"              aria-label={t('questions.previous_question')}
            >
              <ChevronLeft size={20} className="mr-1" /> {t('app.back')}
            </Button>
            <Button 
              onClick={handleNextWithDirection} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-lg shadow flex-grow"              aria-label={index === totalQuestions - 1 ? t('questions.show_summary') : t('questions.next_question')}
            >
              {index === totalQuestions - 1 ? t('questions.summary') : t('questions.next')} <ChevronRight size={20} className="ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionScreen;
