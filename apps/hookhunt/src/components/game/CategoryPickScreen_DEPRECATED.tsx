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
import { Checkbox } from '../core/Checkbox';
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

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onSelectCategory(selectedCategories.filter((c) => c !== id));
    } else if (selectedCategories.length < maxSelectable) {
      onSelectCategory([...selectedCategories, id]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-xl mx-auto p-6 sm:p-8 bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl border-2 border-pink-100"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 text-center mb-4">
        {t('category_pick.title')}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
        {allCategories.map((cat) => (
          <label
            key={cat.id}
            className={`flex flex-col items-center justify-center p-3 border rounded-xl shadow-sm cursor-pointer transition-all duration-150 select-none
            ${selectedCategories.includes(cat.id) ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:bg-gray-50'}`}
            onClick={() => toggleCategory(cat.id)}
          >
            <div className="text-4xl mb-1">{cat.emoji}</div>
            <div className="text-sm font-semibold text-center text-purple-800 truncate max-w-[8rem]">
              {cat.name}
            </div>
            <div className="text-xs text-gray-600">
              {t('category_pick.questions_available', { count: cat.questionCount })}
            </div>
            <Checkbox
              checked={selectedCategories.includes(cat.id)}
              onCheckedChange={() => toggleCategory(cat.id)}
              className="mt-2"
              aria-label={cat.name}
            />
          </label>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="text-purple-600 hover:bg-purple-100 border-purple-300"
        >
          {t('category_pick.back')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={selectedCategories.length === 0}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6"
        >
          {t('category_pick.confirm', { count: selectedCategories.length })}
        </Button>
      </div>
    </motion.div>
  );
};

export default CategoryPickScreen;
