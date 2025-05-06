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
  onRestart
}) => {
  // Calculate blame statistics
  const calculateBlameStats = (): BlameCount[] => {
    const blameCounts: Record<string, number> = {};
    
    nameBlameLog.forEach(log => {
      blameCounts[log.to] = (blameCounts[log.to] || 0) + 1;
    });
    
    return Object.entries(blameCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const blameStats = nameBlameMode && nameBlameLog.length > 0 
    ? calculateBlameStats() 
    : [];

  const mostBlamed = blameStats.length > 0 ? blameStats[0] : null;

  return (
    <>
      <Confetti duration={5000} pieces={150} />
      <motion.div
        key="summary"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center max-w-md w-full"
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-700">Spielzusammenfassung!</h2>
        
        {nameBlameMode && nameBlameLog.length > 0 ? (
          <div className="text-left mb-6 max-h-60 overflow-y-auto pr-2">
            <h3 className="text-xl font-semibold mb-3 text-gray-600 text-center">Blame-O-Meter:</h3>
            
            {mostBlamed && (
              <div className="text-lg text-center font-bold text-pink-600 mb-6 p-3 bg-pink-100 rounded-lg shadow-inner">
                <span className="block text-xs text-pink-400 uppercase tracking-wider mb-1">
                  Most Blamed Award
                </span>
                {mostBlamed.name} ({mostBlamed.count}x)
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-2 text-gray-500">Blame Ranking:</h4>
              <div className="space-y-2">
                {blameStats.map(({name, count}, index) => (
                  <div key={name} className="flex items-center">
                    <div className="w-6 text-center font-bold text-gray-500">{index + 1}.</div>
                    <div className="flex-grow ml-2 font-medium">{name}</div>
                    <div className="text-right font-bold text-purple-600">{count}x</div>
                  </div>
                ))}
              </div>
            </div>
            
            <h4 className="text-md font-semibold mb-2 text-gray-500">Alle Beschuldigungen:</h4>
            <ul className="space-y-1 text-sm text-gray-500 divide-y divide-gray-100">
              {nameBlameLog.map((log, i) => (
                <li key={i} className="py-1">
                  <strong className="text-blue-600">{log.from}</strong> beschuldigte <strong className="text-pink-600">{log.to}</strong> für: 
                  <p className="italic mt-1 ml-4 text-gray-400">"{log.question}"</p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-lg mb-6 text-gray-600">
            Du hast alle {questionsAnswered} Fragen dieser Runde beantwortet!
          </p>
        )}

        <Button
          onClick={onRestart}
          size="lg"
          className="transition-transform hover:scale-105 duration-300 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white mt-4"
        >
          Neues Spiel
        </Button>
      </motion.div>
    </>
  );
};

export default SummaryScreen;
