import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { getEmoji } from '../utils';
import { Question, Player, GameSettings } from '../types';

interface QuestionScreenProps {
  question: Question;
  cardKey: number;
  index: number;
  totalQuestions: number;
  gameSettings: GameSettings;
  nameBlameMode: boolean;
  activePlayers: Player[];
  currentPlayerIndex: number;
  onBlame: (playerName: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  cardKey,
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
  return (
    <motion.div
      key="game"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-md w-full relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={cardKey}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: gameSettings.questionCardSpringStiffness,
            damping: gameSettings.questionCardSpringDamping,
            duration: gameSettings.questionCardTransitionSec,
          }}
          className="min-h-[150px] flex flex-col justify-between"
        >
          <div>
            <div className="text-5xl mb-4">{getEmoji(question.category)}</div>
            <p className="text-sm text-gray-500 mb-2">{question.category}</p>
            <p 
              className="text-xl md:text-2xl font-semibold text-gray-800 min-h-[60px] overflow-y-auto max-h-[180px] py-2"
              style={{
                fontSize: `${gameSettings.questionFontSize}rem`,
                lineHeight: '1.4',
                scrollbarWidth: 'thin'
              }}
            >
              {question.text}
            </p>
          </div>
          <div className="w-full mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <motion.div
                className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-400 text-right">
              Frage {index + 1} von {totalQuestions}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {nameBlameMode && activePlayers.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <p className="text-center text-sm text-gray-600 mb-2">
            {activePlayers[currentPlayerIndex]?.name || ''}, wer ist schuld?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activePlayers.map(player => (
              <Button
                key={player.id}
                variant="outline"
                onClick={() => onBlame(player.name)}
                className="w-full truncate transition-transform hover:scale-105 duration-200"
                disabled={player.name === activePlayers[currentPlayerIndex]?.name}
              >
                {player.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!nameBlameMode && (
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Button variant="outline" onClick={onBack} disabled={index === 0} className="transition-transform hover:scale-105 duration-300">Zurück</Button>
          <Button onClick={onNext} className="transition-transform hover:scale-105 duration-300 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white">
            {index === totalQuestions - 1 ? "Zusammenfassung" : "Nächste Frage"}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionScreen;
