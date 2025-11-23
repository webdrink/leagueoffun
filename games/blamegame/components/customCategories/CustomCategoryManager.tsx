/**
 * CustomCategoryManager
 * Main component for managing custom categories
 * Provides UI to create, edit, and delete custom categories and questions
 * Also allows editing built-in categories (adding questions, hiding unwanted ones)
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Loader } from 'lucide-react';
import { Button } from '../../framework/ui/components/Button';
import useTranslation from '../../hooks/useTranslation';
import { getCustomCategories, deleteCustomCategory } from '../../lib/customCategories/storage';
import { getCategoryModifications } from '../../lib/customCategories/builtInModifications';
import { loadCategoriesFromJson } from '../../lib/utils/questionLoaders';
import { CustomCategory } from '../../lib/customCategories/types';
import { Category } from '../../lib/utils/questionLoaders';
import CustomCategoryEditor from './CustomCategoryEditor';

interface CustomCategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditingState {
  category: CustomCategory | Category;
  isBuiltIn: boolean;
}

const CustomCategoryManager: React.FC<CustomCategoryManagerProps> = ({
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [builtInCategories, setBuiltInCategories] = useState<Category[]>([]);
  const [isLoadingBuiltIn, setIsLoadingBuiltIn] = useState(false);
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [builtInCollapsed, setBuiltInCollapsed] = useState(true);

  // Load categories on mount
  useEffect(() => {
    refreshCategories();
    loadBuiltInCategories();
  }, []);

  const loadBuiltInCategories = async () => {
    setIsLoadingBuiltIn(true);
    try {
      const categories = await loadCategoriesFromJson();
      // Filter out custom categories (those with 'custom_' prefix)
      const onlyBuiltIn = categories.filter(cat => !cat.id.startsWith('custom_'));
      setBuiltInCategories(onlyBuiltIn);
    } catch (error) {
      console.error('Failed to load built-in categories:', error);
      setBuiltInCategories([]);
    } finally {
      setIsLoadingBuiltIn(false);
    }
  };

  const refreshCategories = () => {
    setCustomCategories(getCustomCategories());
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm(t('custom_categories.confirm_delete_category'))) {
      deleteCustomCategory(categoryId);
      refreshCategories();
    }
  };

  const handleEditCustom = (category: CustomCategory) => {
    setEditingState({ category, isBuiltIn: false });
  };

  const handleEditBuiltIn = (category: Category) => {
    setEditingState({ category, isBuiltIn: true });
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleEditorClose = () => {
    setEditingState(null);
    setIsCreating(false);
    refreshCategories();
    loadBuiltInCategories(); // Reload to update modification indicators
  };

  if (!isOpen) return null;

  const currentLanguage = i18n.language as 'en' | 'de' | 'es' | 'fr';
  const modifications = getCategoryModifications();

  // Helper to get modification counts for a built-in category
  const getModificationCounts = (categoryId: string) => {
    const mod = modifications.find(m => m.categoryId === categoryId);
    if (!mod) return { added: 0, hidden: 0 };
    return {
      added: mod.addedQuestions.length,
      hidden: mod.hiddenQuestionIds.length
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {t('custom_categories.title')}
          </h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Create New Button - Always visible at top */}
          <div className="flex justify-end mb-4">
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white flex items-center min-h-[44px] px-6"
            >
              <Plus size={20} className="mr-2" />
              {t('custom_categories.create_new')}
            </Button>
          </div>

          {/* Custom Categories Section (kept first and expanded) */}

          {customCategories.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                {t('custom_categories.section_custom')}
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({customCategories.length})
                </span>
              </h3>
              <div className="space-y-3">
                {customCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-autumn-300 dark:hover:border-autumn-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-3xl">{category.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {category.name[currentLanguage] || category.name.en || category.name.de}
                            </h3>
                            <span className="text-xs px-2 py-0.5 bg-autumn-200 dark:bg-autumn-800 text-autumn-800 dark:text-autumn-200 rounded-full">
                              {t('custom_categories.custom_category')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('custom_categories.question_count', { count: category.questions.length })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEditCustom(category)}
                          className="p-2 hover:bg-autumn-50 dark:hover:bg-autumn-900/30 min-h-[44px] min-w-[44px]"
                          aria-label={t('custom_categories.edit_category')}
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 min-h-[44px] min-w-[44px]"
                          aria-label={t('custom_categories.delete_category')}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Categories Section (collapsed by default and placed below) */}
          {isLoadingBuiltIn ? (
            <div className="text-center py-8">
              <Loader size={32} className="animate-spin mx-auto text-autumn-500" />
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {t('custom_categories.loading_questions')}
              </p>
            </div>
          ) : builtInCategories.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  {t('custom_categories.section_built_in')}
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({builtInCategories.length})
                  </span>
                </h3>
                <Button
                  variant="outline"
                  onClick={() => setBuiltInCollapsed((v) => !v)}
                  className="px-3 py-2 min-h-[36px]"
                  aria-expanded={!builtInCollapsed}
                >
                  {builtInCollapsed ? t('custom_categories.show') : t('custom_categories.hide')}
                </Button>
              </div>
              <AnimatePresence initial={false}>
                {!builtInCollapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-3">
                      {builtInCategories.map((category) => {
                        const modCounts = getModificationCounts(category.id);
                        const hasModifications = modCounts.added > 0 || modCounts.hidden > 0;
                        
                        return (
                          <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-autumn-300 dark:hover:border-autumn-600 transition-colors bg-amber-50/30 dark:bg-amber-900/10"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <span className="text-3xl">{category.emoji}</span>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                      {category[currentLanguage] || category.en}
                                    </h3>
                                    <span className="text-xs px-2 py-0.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 rounded-full">
                                      {t('custom_categories.built_in_category')}
                                    </span>
                                  </div>
                                  {hasModifications && (
                                    <p className="text-sm text-autumn-600 dark:text-autumn-400 mt-1">
                                      {modCounts.added > 0 && t('custom_categories.added_count', { count: modCounts.added })}
                                      {modCounts.added > 0 && modCounts.hidden > 0 && ', '}
                                      {modCounts.hidden > 0 && t('custom_categories.hidden_count', { count: modCounts.hidden })}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  onClick={() => handleEditBuiltIn(category)}
                                  className="p-2 hover:bg-autumn-50 dark:hover:bg-autumn-900/30 min-h-[44px] min-w-[44px]"
                                  aria-label={t('custom_categories.edit_category')}
                                >
                                  <Edit2 size={18} />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Empty state - only show if no custom categories */}
          {customCategories.length === 0 && !isLoadingBuiltIn && (
            <div className="text-center py-8 mt-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('custom_categories.no_categories')}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Category Editor Modal */}
      <AnimatePresence>
        {(isCreating || editingState) && (
          <CustomCategoryEditor
            category={editingState?.isBuiltIn ? null : (editingState?.category as CustomCategory)}
            builtInCategory={editingState?.isBuiltIn ? (editingState?.category as Category) : undefined}
            isOpen={true}
            onClose={handleEditorClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomCategoryManager;
