/**
 * CategoryPickScreen
 * 
 * Purpose: Allows users to manually select categories for the game round.
 * 
 * Integrating Components:
 * - App.tsx (in the game flow after intro screen when manual selection is enabled)
 * 
 * This component displays all available categories with their emoji, name, and 
 * question count, allowing users to select which ones to include in the game.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import useTranslation from '../../hooks/useTranslation';

interface CategoryInfo {
  id: string;
  emoji: string;
  name: string;
  questionCount: number;
}

interface CategoryPickScreenProps {
  allCategories: CategoryInfo[];
  selectedCategories: string[];
  onSelectCategory: (categoryIds: string[]) => void;
  onBack: () => void;
  onConfirm: () => void;
  maxSelectable?: number;
}

const CategoryPickScreen: React.FC<CategoryPickScreenProps> = ({
  allCategories,
  selectedCategories,
  onSelectCategory,
  onBack,
  onConfirm,
  maxSelectable = 10,
}) => {
  const { t } = useTranslation();

  // Debug: Log the received categories data
  React.useEffect(() => {
    console.log('🔍 CategoryPickScreen received allCategories:', allCategories);
    console.log('🔍 CategoryPickScreen categories question counts:', 
      allCategories.map(cat => `${cat.name}: ${cat.questionCount} questions`)
    );
  }, [allCategories]);

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onSelectCategory(selectedCategories.filter((c) => c !== id));
    } else if (selectedCategories.length < maxSelectable) {
      onSelectCategory([...selectedCategories, id]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-0 p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
  className="category-container w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl h-full max-h-full bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-pink-100 flex flex-col min-h-0"
      >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-700 text-center mb-3 sm:mb-4 flex-shrink-0">
        {t('category_pick.title')}
      </h2>

      <div className="category-grid grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 overflow-y-auto custom-scrollbar pr-1 flex-1 min-h-0">
        {allCategories
          .filter(cat => cat.questionCount > 0)
          .map((cat) => (
          <label
            key={cat.id}
            className={`flex flex-col items-center justify-center p-3 sm:p-3 border rounded-xl shadow-sm cursor-pointer transition-all duration-150 select-none min-h-[88px] sm:min-h-[100px] lg:min-h-[120px]
            ${selectedCategories.includes(cat.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}`}
            role="button"
            aria-label={cat.name}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCategory(cat.id);
              }
            }}
            onClick={() => toggleCategory(cat.id)}
          >
            <div className="text-3xl sm:text-4xl mb-1">{cat.emoji}</div>
            <div className="text-xs sm:text-sm font-semibold text-center text-purple-800 line-clamp-2 px-1 break-words">
              {cat.name}
            </div>
            <div className="text-xs text-gray-600">
              {t('category_pick.questions_available', { count: cat.questionCount })}
            </div>
          </label>
        ))}
      </div>

      <div className="flex justify-between items-center gap-3 sm:gap-4 flex-shrink-0 mt-auto pt-3 sm:pt-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="text-purple-600 hover:bg-purple-100 border-purple-300 min-h-[44px] px-3 sm:px-4"
        >
          {t('category_pick.back')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={selectedCategories.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 min-h-[44px]"
        >
          {t('category_pick.confirm', { count: selectedCategories.length })}
        </Button>
      </div>
      </motion.div>
    </div>
  );
};

export default CategoryPickScreen;
