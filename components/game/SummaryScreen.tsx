import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button'; // Adjusted path
import { NameBlameEntry } from '../../types'; // Path should be correct
import Confetti from '../core/Confetti'; // Adjusted path
import { Award, Users, Repeat } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface SummaryScreenProps {
  nameBlameMode: boolean;
  nameBlameLog: NameBlameEntry[];
  questionsAnswered: number;
  onRestart: () => void;
  activePlayersCount: number; // To show how many players participated
}

interface BlameCount {
  name: string;
  count: number;
}

/**
 * SummaryScreen component displays the end-of-game summary, including statistics about blame assignments,
 * number of questions answered, and active players. It also provides an option to restart the game.
 *
 * @param nameBlameMode - Boolean indicating if the blame mode is active.
 * @param nameBlameLog - Array of blame log entries, each representing a blame event.
 * @param questionsAnswered - Number of questions answered during the game.
 * @param onRestart - Callback function to restart the game.
 * @param activePlayersCount - Number of active players in the game.
 *
 * @returns React component rendering the summary screen with confetti animation, statistics, and restart button.
 */
const SummaryScreen: React.FC<SummaryScreenProps> = ({
  nameBlameMode,
  nameBlameLog,
  questionsAnswered,
  onRestart,
  activePlayersCount,
}) => {
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti after a short delay for better visual effect
    const timer = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const calculateBlameStats = (): BlameCount[] => {
    const blameCounts: Record<string, number> = {};
    nameBlameLog.forEach((log) => {
      blameCounts[log.to] = (blameCounts[log.to] || 0) + 1;
    });
    return Object.entries(blameCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getMostBlamed = () => {
    if (!nameBlameMode) return null;
    const stats = calculateBlameStats();
    if (stats.length === 0 || stats[0].count === 0) return { players: [], count: 0, isTie: false };

    const maxCount = stats[0].count;
    const mostBlamedPlayers = stats.filter(player => player.count === maxCount).map(player => player.name);
    
    return { players: mostBlamedPlayers, count: maxCount, isTie: mostBlamedPlayers.length > 1 };
  };

  const mostBlamedResult = getMostBlamed();

  return (
    <>
      {showConfetti && <Confetti duration={6000} pieces={200} />}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.9 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
  className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl p-6 sm:p-8 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border-2 border-rust-100 text-center"
      >        <motion.h2 
          initial={{ opacity:0, y: -10}} animate={{opacity:1, y:0}} transition={{delay: 0.1}}
          className="text-3xl sm:text-4xl font-bold text-autumn-700 mb-3"
        >
          {t('summary.game_over')}
        </motion.h2>        <motion.p 
          initial={{ opacity:0, y: -10}} animate={{opacity:1, y:0}} transition={{delay: 0.2}}
          className="text-base sm:text-lg text-rust-600 mb-6"
        >
          {t('summary.questions_completed', { count: questionsAnswered })}
        </motion.p>

        {nameBlameMode && mostBlamedResult && (
          <motion.div 
            initial={{ opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay: 0.3, type: 'spring', stiffness:120}}
            className="mb-6 sm:mb-8 p-4 sm:p-5 bg-rust-50 rounded-xl border border-rust-200 shadow-inner"
          >            <div className="flex items-center justify-center text-xl sm:text-2xl font-semibold text-autumn-600 mb-2">
              <Award size={28} className="mr-2 text-yellow-500" />
              {mostBlamedResult.isTie ? t('summary.most_blamed_plural') : t('summary.most_blamed_singular')}
            </div>
            {mostBlamedResult.players.length > 0 ? (
              <>
                <p className="text-2xl sm:text-3xl font-bold text-rust-500 truncate px-2">
                  {mostBlamedResult.players.join(', ')}
                </p>
                <p className="text-autumn-600 text-sm sm:text-base">
                  {t('summary.blame_count', { 
                    count: mostBlamedResult.count,
                    s: mostBlamedResult.count === 1 ? '' : t('summary.plural_suffix')
                  })}
                </p>
              </>
            ) : (
              <p className="text-autumn-500 italic">{t('summary.no_blames_given')}</p>
            )}
          </motion.div>
        )}
        
        {!nameBlameMode && activePlayersCount > 0 && (
           <motion.div 
            initial={{ opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} transition={{delay: 0.3}}
            className="mb-6 sm:mb-8 p-4 bg-autumn-50 rounded-xl border border-autumn-200"
          >
            <div className="flex items-center justify-center text-xl font-semibold text-autumn-600 mb-1">
              <Users size={26} className="mr-2 text-autumn-500" />
              {t('summary.team_round')}
            </div>
            <p className="text-autumn-700 text-sm">{t('summary.team_message', { activePlayersCount })}</p>
          </motion.div>
        )}

        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5}}>
          <Button
            onClick={onRestart}
            className="w-full bg-autumn-600 hover:bg-autumn-700 text-white py-3 text-lg sm:text-xl rounded-lg shadow-lg transition-all hover:scale-105 duration-200 focus:ring-autumn-400"
          >
            <Repeat size={20} className="mr-2" /> {t('summary.new_game')}
          </Button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default SummaryScreen;
