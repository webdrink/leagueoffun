/**
 * SeasonSelector
 * Component for switching between seasonal themes (fall, winter, spring, summer, cyber)
 */
import React from 'react';
import { Leaf, Snowflake, Flower2, Sun, Zap } from 'lucide-react';
import { useSeasonalTheme, type Season } from '../../hooks/useTheme';
import useTranslation from '../../hooks/useTranslation';

interface SeasonOption {
  id: Season | 'auto';
  name: string;
  icon: React.ReactNode;
  gradient: string;
  description: string;
}

const SeasonSelector: React.FC = () => {
  const { selectedSeason, isAuto, changeSeason } = useSeasonalTheme();
  const { t } = useTranslation();

  const seasons: SeasonOption[] = [
    {
      id: 'auto',
      name: t('season.auto') || 'Auto',
      icon: <Leaf size={20} />,
      gradient: 'from-autumn-400 to-rust-400',
      description: t('season.auto_desc') || 'Follows the real season',
    },
    {
      id: 'fall',
      name: t('season.fall') || '🍂 Fall',
      icon: <Leaf size={20} />,
      gradient: 'from-autumn-500 to-rust-500',
      description: t('season.fall_desc') || 'Warm autumn colors',
    },
    {
      id: 'winter',
      name: t('season.winter') || '❄️ Winter',
      icon: <Snowflake size={20} />,
      gradient: 'from-frost-400 to-ice-400',
      description: t('season.winter_desc') || 'Cool icy blues',
    },
    {
      id: 'spring',
      name: t('season.spring') || '🌸 Spring',
      icon: <Flower2 size={20} />,
      gradient: 'from-bloom-400 to-meadow-400',
      description: t('season.spring_desc') || 'Fresh pastel greens and blooms',
    },
    {
      id: 'summer',
      name: t('season.summer') || '☀️ Summer',
      icon: <Sun size={20} />,
      gradient: 'from-sun-400 to-ocean-400',
      description: t('season.summer_desc') || 'Bright sunshine and ocean',
    },
    {
      id: 'cyber',
      name: t('season.cyber') || '⚡ Cyber',
      icon: <Zap size={20} />,
      gradient: 'from-cyber-500 to-neon-500',
      description: t('season.cyber_desc') || 'Nerdy matrix theme',
    },
  ];

  const currentTheme = isAuto ? 'auto' : selectedSeason;

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {t('season.title') || 'Theme'}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {seasons.map((season) => {
          const isSelected = currentTheme === season.id;
          return (
            <button
              key={season.id}
              onClick={() => changeSeason(season.id)}
              className={`
                relative overflow-hidden rounded-xl p-4 transition-all duration-200
                ${
                  isSelected
                    ? `bg-gradient-to-r ${season.gradient} text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-white dark:ring-gray-800`
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:scale-102 shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-gray-600'
                }
              `}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}>
                  {season.icon}
                </div>
                <span className="font-semibold text-sm">
                  {season.name}
                </span>
                <span className={`text-xs ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                  {season.description}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonSelector;
