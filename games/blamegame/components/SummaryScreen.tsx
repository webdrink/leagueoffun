import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { NameBlameEntry } from '../types';
import Confetti from './Confetti';

interface SummaryScreenProps {
  nameBlameMode: boolean;
  nameBlameLog: NameBlameEntry[];
  questionsAnswered: number;
  onRestart: () => void;
}

interface BlameCount {
  name: string;
  count: number;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({
  nameBlameMode,
  nameBlameLog,
  questionsAnswered,
  onRestart,
}) => {
  // Calculate blame statistics
  const calculateBlameStats = (): BlameCount[] => {
    const blameCounts: Record<string, number> = {};

    nameBlameLog.forEach((log) => {
      blameCounts[log.to] = (blameCounts[log.to] || 0) + 1;
    });

    return Object.entries(blameCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const calculateMostBlamed = (log: NameBlameEntry[]) => {
    const stats = calculateBlameStats();
    if (stats.length === 0) return null;

    const maxCount = stats[0].count;
    const players = stats.filter((entry) => entry.count === maxCount).map((entry) => entry.name);

    return { players, count: maxCount };
  };

  const mostBlamed = nameBlameMode ? calculateMostBlamed(nameBlameLog) : null;

  return (
    <>
      <Confetti duration={5000} pieces={150} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-pink-100 text-center"
      >
        <h2 className="text-3xl font-bold text-purple-700 mb-4">Spielzusammenfassung</h2>
        <p className="text-lg text-pink-600 mb-6">
          Ihr habt {questionsAnswered} Fragen beantwortet!
        </p>

        {nameBlameMode && mostBlamed && (
          <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
            <h3 className="text-xl font-semibold text-purple-600 mb-2">Meistbeschuldigter Spieler</h3>
            {mostBlamed.players.length > 0 ? (
              <>
                <p className="text-2xl font-bold text-pink-500">
                  {mostBlamed.players.join(', ')}
                </p>
                <p className="text-purple-600">mit {mostBlamed.count} Beschuldigungen</p>
              </>
            ) : (
              <p className="text-purple-600">Niemand wurde beschuldigt!</p>
            )}
          </div>
        )}

        <Button
          onClick={onRestart}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform hover:scale-105 duration-200"
        >
          Neues Spiel
        </Button>
      </motion.div>
    </>
  );
};

export default SummaryScreen;
