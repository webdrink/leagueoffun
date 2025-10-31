/**
 * CustomCategoryManager
 * Main component for managing custom categories
 * Provides UI to create, edit, and delete custom categories and questions
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../core/Button';
import useTranslation from '../../hooks/useTranslation';
import { getCustomCategories, deleteCustomCategory } from '../../lib/customCategories/storage';
import { CustomCategory } from '../../lib/customCategories/types';
import CustomCategoryEditor from './CustomCategoryEditor';

interface CustomCategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomCategoryManager: React.FC<CustomCategoryManagerProps> = ({
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<CustomCategory[]>(getCustomCategories());
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const refreshCategories = () => {
    setCategories(getCustomCategories());
  };

  const handleDelete = (categoryId: string) => {
    if (window.confirm(t('custom_categories.confirm_delete_category'))) {
      deleteCustomCategory(categoryId);
      refreshCategories();
    }
  };

  const handleEdit = (category: CustomCategory) => {
    setEditingCategory(category);
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleEditorClose = () => {
    setEditingCategory(null);
    setIsCreating(false);
    refreshCategories();
  };

  if (!isOpen) return null;

  const currentLanguage = i18n.language as 'en' | 'de' | 'es' | 'fr';

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
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {t('custom_categories.no_categories')}
              </p>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center mx-auto"
              >
                <Plus size={20} className="mr-2" />
                {t('custom_categories.create_new')}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button
                  onClick={handleCreate}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center"
                >
                  <Plus size={20} className="mr-2" />
                  {t('custom_categories.add_category')}
                </Button>
              </div>

              <div className="space-y-4">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-3xl">{category.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            {category.name[currentLanguage] || category.name.en || category.name.de}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {t('custom_categories.question_count', { count: category.questions.length })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(category)}
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                        >
                          <Edit2 size={18} />
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Category Editor Modal */}
      <AnimatePresence>
        {(isCreating || editingCategory) && (
          <CustomCategoryEditor
            category={editingCategory}
            isOpen={true}
            onClose={handleEditorClose}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomCategoryManager;
