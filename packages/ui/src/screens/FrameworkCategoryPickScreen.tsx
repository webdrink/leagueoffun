/**
 * FrameworkCategoryPickScreen
 * Framework-compatible version of CategoryPickScreen for manual category selection.
 * Uses GameShell for consistent layout and integrates with framework architecture.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { useFrameworkRouter } from '../../core/router/FrameworkRouter';
import { GameAction } from '../../core/actions';
import { CATEGORY_EMOJIS } from '../../../constants';
import useTranslation from '../../../hooks/useTranslation';
import { useGameSettings } from '../../../hooks/useGameSettings';

interface CategoryInfo {
  id: string;
  emoji: string;
  name: string;
  questionCount: number;
}

const FrameworkCategoryPickScreen: React.FC = () => {
  const { dispatch } = useFrameworkRouter();
  const { t } = useTranslation();
  const { gameSettings } = useGameSettings();
  
  // Build categories list and enrich with real question counts when available
  const allCategories: CategoryInfo[] = useMemo(() => {
    // Map of counts per localized category name from window.gameCategories if available
    let countsByName: Record<string, number> = {};
    if (typeof window !== 'undefined') {
      const w = window as unknown as { gameCategories?: Array<{ name: string; questions?: string[] }> };
      if (Array.isArray(w.gameCategories)) {
        countsByName = w.gameCategories.reduce<Record<string, number>>((acc, c) => {
          acc[c.name] = (c.questions?.length ?? 0);
          return acc;
        }, {});
      }
    }

    const categories = Object.entries(CATEGORY_EMOJIS).map(([name, emoji]) => {
      const localizedName = t(`categories.${name}`) || name;
      const questionCount = countsByName[localizedName] ?? countsByName[name] ?? 0;
      return {
        id: name,
        emoji,
        name: localizedName,
        questionCount
      };
    });

    // Filter out categories that have zero questions – we don't want to show them
    return categories.filter(c => c.questionCount > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const maxSelectable = gameSettings?.categoryCount ?? 10;

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(prev => prev.filter(c => c !== id));
    } else if (selectedCategories.length < maxSelectable) {
      setSelectedCategories(prev => [...prev, id]);
    }
  };

  const handleBack = () => {
    dispatch(GameAction.BACK);
  };

  const handleConfirm = () => {
    // Store selected categories and proceed to next phase
    // In a full implementation, this would save to the module store
    console.log('Selected categories:', selectedCategories);
    dispatch(GameAction.ADVANCE);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-0 py-3 sm:py-4 px-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="category-container w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl h-full max-h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-autumn-100 dark:border-autumn-800 flex flex-col min-h-0"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-autumn-700 dark:text-autumn-300 text-center mb-4 sm:mb-6 flex-shrink-0">
            {t('category_pick.title')}
          </h2>

          <div className="text-center mb-3 sm:mb-4 flex-shrink-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('category_pick.max_categories', { count: maxSelectable })} • {' '}
              <span className="font-medium text-autumn-600 dark:text-autumn-400">
                {t('category_pick.selected_count', { count: selectedCategories.length })}
              </span>
            </p>
          </div>

          <div className="category-grid grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
            {allCategories.map((cat) => (
              <motion.label
                key={cat.id}
                className={`flex flex-col items-center justify-center p-3 sm:p-3 lg:p-4 border rounded-xl shadow-sm cursor-pointer transition-all duration-200 select-none min-h-[88px] sm:min-h-[100px] lg:min-h-[120px]
                ${selectedCategories.includes(cat.id) 
                  ? 'border-autumn-500 bg-autumn-50 dark:bg-autumn-900/30 dark:border-autumn-400' 
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                role="button"
                aria-pressed={selectedCategories.includes(cat.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleCategory(cat.id);
                  }
                }}
                onClick={() => toggleCategory(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <div className="text-sm font-semibold text-center text-autumn-800 dark:text-autumn-200 mb-1 line-clamp-2 break-words">
                  {cat.name}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {t('category_pick.questions_available', { count: cat.questionCount })}
                </div>
              </motion.label>
            ))}
          </div>

          <div className="flex justify-between items-center gap-3 sm:gap-4 flex-shrink-0 mt-auto pt-3 sm:pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="text-autumn-600 dark:text-autumn-300 hover:bg-autumn-100 dark:hover:bg-autumn-900/30 border-autumn-300 dark:border-autumn-600 px-6 py-3"
            >
              {t('category_pick.back')}
            </Button>
            
            <Button
              onClick={handleConfirm}
              disabled={selectedCategories.length === 0}
              className="bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {t('category_pick.confirm', { count: selectedCategories.length })}
            </Button>
          </div>
        </motion.div>
      </div>
  );
};

export default FrameworkCategoryPickScreen;