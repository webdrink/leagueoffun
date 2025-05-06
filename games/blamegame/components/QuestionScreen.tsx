import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card.tsx'; // Explicitly add .tsx extension
import { getEmoji } from '../utils';
import { Question, Player, GameSettings } from '../types';

interface QuestionScreenProps {
  question: Question;
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
  const [direction, setDirection] = useState(0);

  const handleNextWithDirection = () => {
    setDirection(1);
    onNext();
  };

  const handleBackWithDirection = () => {
    setDirection(-1);
    onBack();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full flex-grow flex items-center justify-center"
        >
          <Card className="h-[70vh] shadow-2xl border-2 border-pink-100 bg-white rounded-3xl flex items-center justify-center w-full">
            <CardContent className="p-8 flex flex-col items-center text-center justify-center h-full">
              <div className="text-8xl md:text-9xl lg:text-10xl mb-4">{getEmoji(question.category)}</div>
              <div className="text-md text-gray-600 mb-10">{question.category}</div>
              <h2 
                className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 leading-snug"
                style={{
                  lineHeight: '1.4',
                }}
              >
                {question.text}
              </h2>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="w-full max-w-md mt-6">
        <div className="h-2 bg-white rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-white">
          Frage {index + 1} von {totalQuestions}
        </div>
      </div>

      {nameBlameMode && activePlayers.length > 0 && (
        <div className="mt-6 w-full max-w-md">
          <p className="text-center text-sm text-white mb-2">
            {activePlayers[currentPlayerIndex]?.name || ''}, wer ist schuld?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {activePlayers.map(player => (
              <Button
                key={player.id}
                variant="outline"
                onClick={() => onBlame(player.name)}
                className="w-full truncate transition-transform hover:scale-105 duration-200 bg-white/80 hover:bg-white text-purple-700 border-purple-300"
                disabled={player.name === activePlayers[currentPlayerIndex]?.name}
              >
                {player.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!nameBlameMode && (
        <div className="mt-4 flex space-x-4">
          <Button variant="outline" onClick={handleBackWithDirection} disabled={index === 0} className="bg-white/80 hover:bg-white text-purple-700 border-purple-300">
            Zurück
          </Button>
          <Button onClick={handleNextWithDirection} className="bg-purple-600 hover:bg-purple-700 text-white">
            {index === totalQuestions - 1 ? "Zusammenfassung" : "Nächste Frage"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestionScreen;
