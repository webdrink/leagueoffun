/**
 * CustomCategoryEditor
 * Component for creating and editing custom categories
 * Includes emoji picker and question management
 * Also supports editing built-in categories (adding questions, hiding/unhiding)
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save, EyeOff, Eye, Loader } from 'lucide-react';
import { Button } from '../../framework/ui/components/Button';
import useTranslation from '../../hooks/useTranslation';
import { 
  addCustomCategory, 
  updateCustomCategory, 
  addQuestionToCategory,
  deleteQuestionFromCategory,
  updateCategoryQuestion
} from '../../lib/customCategories/storage';
import {
  addQuestionToBuiltInCategory,
  hideQuestionFromBuiltInCategory,
  unhideQuestionFromBuiltInCategory,
  deleteCustomQuestionFromBuiltInCategory,
  getModificationsForCategory
} from '../../lib/customCategories/builtInModifications';
import { loadQuestionsFromJson, Category } from '../../lib/utils/questionLoaders';
import { CustomCategory } from '../../lib/customCategories/types';
import { SupportedLanguage } from '../../types';
import { isSingleEmoji, sanitizeEmojiInput } from '../../lib/utils/emojiValidation';

interface CustomCategoryEditorProps {
  category: CustomCategory | null;
  builtInCategory?: Category;
  isOpen: boolean;
  onClose: () => void;
}

interface QuestionItem {
  id: string;
  text: Record<SupportedLanguage, string>;
  isBuiltIn: boolean;
  isHidden?: boolean;
  createdAt?: string;
}

// No fixed emoji picker - users can input any emoji from their device keyboard

const CustomCategoryEditor: React.FC<CustomCategoryEditorProps> = ({
  category,
  builtInCategory,
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const isEditingBuiltIn = !!builtInCategory;
  const isEditingCustom = !!category;
  const isCreating = !isEditingBuiltIn && !isEditingCustom;
  
  const currentLanguage = i18n.language as SupportedLanguage;
  
  const [emoji, setEmoji] = useState('🎉');
  const [emojiError, setEmojiError] = useState<string>('');
  const [categoryName, setCategoryName] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  useEffect(() => {
    if (isEditingCustom && category) {
      setEmoji(category.emoji);
      setCategoryName(category.name[currentLanguage] || category.name.en || '');
      setQuestions(category.questions.map(q => ({
        id: q.id,
        text: q.text,
        isBuiltIn: false,
        createdAt: q.createdAt
      })));
    } else if (isEditingBuiltIn && builtInCategory) {
      loadBuiltInQuestions();
    }
  }, [category, builtInCategory, currentLanguage, isEditingCustom, isEditingBuiltIn]);

  const loadBuiltInQuestions = async () => {
    if (!builtInCategory) return;
    
    setIsLoadingQuestions(true);
    try {
      // Load all questions for this built-in category
      const allQuestions = await loadQuestionsFromJson(currentLanguage);
      const categoryQuestions = allQuestions.filter(q => q.categoryId === builtInCategory.id);
      
      // Get modifications for this category
      const modifications = getModificationsForCategory(builtInCategory.id);
      
      // Build question list
      const questionItems: QuestionItem[] = [];
      
      // Add built-in questions (mark hidden ones)
      categoryQuestions.forEach(q => {
        const isHidden = modifications?.hiddenQuestionIds.includes(q.questionId!) || false;
        questionItems.push({
          id: q.questionId!,
          text: {
            en: q.text,
            de: q.text,
            es: q.text,
            fr: q.text
          },
          isBuiltIn: true,
          isHidden
        });
      });
      
      // Add custom questions added to this built-in category
      if (modifications?.addedQuestions) {
        modifications.addedQuestions.forEach(q => {
          questionItems.push({
            id: q.id,
            text: q.text,
            isBuiltIn: false,
            createdAt: q.createdAt
          });
        });
      }
      
      setQuestions(questionItems);
      setEmoji(builtInCategory.emoji);
      setCategoryName(builtInCategory[currentLanguage] || builtInCategory.en);
    } catch (error) {
      console.error('Failed to load built-in questions:', error);
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleEmojiChange = (value: string) => {
    const sanitized = sanitizeEmojiInput(value);
    if (sanitized) {
      setEmoji(sanitized);
      setEmojiError('');
    } else if (value.length > 0) {
      setEmojiError(t('custom_categories.error_emoji_invalid'));
    } else {
      setEmoji(value);
      setEmojiError('');
    }
  };

  const handleSave = () => {
    // For built-in categories, we don't save emoji/name, only modifications
    if (isEditingBuiltIn) {
      onClose();
      return;
    }

    // Validate custom category
    if (!categoryName.trim()) {
      alert(t('custom_categories.error_name_required'));
      return;
    }

    if (!emoji || !isSingleEmoji(emoji)) {
      alert(t('custom_categories.error_emoji_required'));
      return;
    }

    // Populate all languages with the current language value
    const names: Record<SupportedLanguage, string> = {
      en: categoryName,
      de: categoryName,
      es: categoryName,
      fr: categoryName
    };

    if (isEditingCustom && category) {
      // Update existing category
      updateCustomCategory(category.id, { emoji, name: names });
    } else {
      // Create new category with questions
      const newCategory = addCustomCategory(emoji, names);
      
      // Add all accumulated questions to the new category
      questions.forEach(q => {
        if (!q.isBuiltIn) {
          addQuestionToCategory(newCategory.id, q.text);
        }
      });
    }

    onClose();
  };

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) {
      alert(t('custom_categories.error_question_required'));
      return;
    }

    // Populate all languages with the current language value
    const questionText: Record<SupportedLanguage, string> = {
      en: newQuestionText,
      de: newQuestionText,
      es: newQuestionText,
      fr: newQuestionText
    };

    if (isEditingBuiltIn && builtInCategory) {
      // Add question to built-in category
      const questionId = addQuestionToBuiltInCategory(builtInCategory.id, questionText);
      setQuestions([...questions, {
        id: questionId,
        text: questionText,
        isBuiltIn: false,
        createdAt: new Date().toISOString()
      }]);
    } else if (isEditingCustom && category) {
      // Add question to custom category
      addQuestionToCategory(category.id, questionText);
      setQuestions([...questions, {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        text: questionText,
        isBuiltIn: false,
        createdAt: new Date().toISOString()
      }]);
    } else {
      // For new categories, add to local state
      setQuestions([...questions, {
        id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        text: questionText,
        isBuiltIn: false,
        createdAt: new Date().toISOString()
      }]);
    }

    setNewQuestionText('');
  };

  const handleDeleteQuestion = (questionId: string, isBuiltIn: boolean) => {
    if (window.confirm(t('custom_categories.confirm_delete_question'))) {
      if (isEditingCustom && category) {
        deleteQuestionFromCategory(category.id, questionId);
      } else if (isEditingBuiltIn && builtInCategory && !isBuiltIn) {
        // Delete custom question from built-in category
        deleteCustomQuestionFromBuiltInCategory(builtInCategory.id, questionId);
        // Reload to ensure state matches persisted modifications
        // (covers any edge-case where local state may be stale)
        void loadBuiltInQuestions();
      }
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  const handleHideQuestion = (questionId: string) => {
    if (!isEditingBuiltIn || !builtInCategory) return;
    
    // Check if this would hide all questions
    const visibleCount = questions.filter(q => !q.isHidden).length;
    if (visibleCount <= 1) {
      alert(t('custom_categories.cannot_hide_all'));
      return;
    }

    if (window.confirm(t('custom_categories.confirm_hide_question'))) {
      hideQuestionFromBuiltInCategory(builtInCategory.id, questionId);
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, isHidden: true } : q
      ));
    }
  };

  const handleUnhideQuestion = (questionId: string) => {
    if (!isEditingBuiltIn || !builtInCategory) return;
    
    if (window.confirm(t('custom_categories.confirm_unhide_question'))) {
      unhideQuestionFromBuiltInCategory(builtInCategory.id, questionId);
      setQuestions(questions.map(q => 
        q.id === questionId ? { ...q, isHidden: false } : q
      ));
    }
  };

  if (!isOpen) return null;

  const title = isEditingBuiltIn 
    ? t('custom_categories.edit_built_in')
    : isEditingCustom 
    ? t('custom_categories.edit_category') 
    : t('custom_categories.create_new');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
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
            {title}
          </h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            aria-label={t('custom_categories.cancel')}
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Emoji Selection - Read-only for built-in */}
          <div>
            <label htmlFor="emoji-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('custom_categories.emoji')}
            </label>
            <div className="flex items-center space-x-4">
              <div className="text-6xl" role="img" aria-label="Selected emoji">{emoji}</div>
              {!isEditingBuiltIn && (
                <div className="flex-1">
                  <input
                    id="emoji-input"
                    type="text"
                    value={emoji}
                    onChange={(e) => handleEmojiChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-autumn-400 dark:focus:ring-autumn-500 dark:bg-gray-700 dark:text-gray-200 text-lg"
                    placeholder={t('custom_categories.placeholder_emoji')}
                    maxLength={10}
                    inputMode="text"
                    autoComplete="off"
                    aria-describedby="emoji-help"
                  />
                  <p id="emoji-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('custom_categories.emoji_help')}
                  </p>
                  {emojiError && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1" role="alert">
                      {emojiError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Category Name - Read-only for built-in */}
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('custom_categories.category_name')}
            </label>
            <input
              id="category-name"
              type="text"
              value={categoryName}
              onChange={(e) => !isEditingBuiltIn && setCategoryName(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-autumn-400 dark:focus:ring-autumn-500 dark:bg-gray-700 dark:text-gray-200 ${
                isEditingBuiltIn ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''
              }`}
              placeholder={t('custom_categories.placeholder_name')}
              autoComplete="off"
              readOnly={isEditingBuiltIn}
              disabled={isEditingBuiltIn}
            />
            {isEditingBuiltIn && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t('custom_categories.built_in_category')} - {t('custom_categories.edit_built_in')}
              </p>
            )}
          </div>

          {/* Questions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('custom_categories.questions')}
            </h3>

            {/* Add New Question */}
            <div className="bg-autumn-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 border border-autumn-200 dark:border-gray-600">
              <label htmlFor="new-question" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('custom_categories.add_question')}
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="new-question"
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddQuestion();
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-autumn-400 dark:focus:ring-autumn-500 dark:bg-gray-600 dark:text-gray-200"
                  placeholder={t('custom_categories.placeholder_question')}
                  autoComplete="off"
                />
                <Button
                  onClick={handleAddQuestion}
                  className="bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white flex items-center justify-center min-h-[44px] px-6"
                  aria-label={t('custom_categories.add_question')}
                >
                  <Plus size={18} className="mr-2" />
                  {t('custom_categories.add_question')}
                </Button>
              </div>
            </div>

            {/* Question List */}
            {isLoadingQuestions ? (
              <div className="text-center py-8">
                <Loader size={24} className="animate-spin mx-auto text-autumn-500" />
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  {t('custom_categories.loading_questions')}
                </p>
              </div>
            ) : questions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('custom_categories.no_questions')}
              </p>
            ) : (
              <div className="space-y-2">
                {questions.map((question) => {
                  const questionText = question.text[currentLanguage] || question.text.en || question.text.de || '';
                  
                  return (
                    <div
                      key={question.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        question.isHidden 
                          ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex-1 flex items-center space-x-2">
                        <span className={`text-gray-800 dark:text-gray-200 flex-1 ${
                          question.isHidden ? 'line-through opacity-60' : ''
                        }`}>
                          {questionText}
                        </span>
                        {/* Badge for question type */}
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                          question.isHidden 
                            ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : question.isBuiltIn
                            ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                            : 'bg-autumn-200 dark:bg-autumn-800 text-autumn-800 dark:text-autumn-200'
                        }`}>
                          {question.isHidden 
                            ? t('custom_categories.hidden_question')
                            : question.isBuiltIn 
                            ? t('custom_categories.game_question')
                            : t('custom_categories.your_question')
                          }
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {/* Hide/Unhide button for built-in questions */}
                        {isEditingBuiltIn && question.isBuiltIn && (
                          <Button
                            variant="outline"
                            onClick={() => question.isHidden 
                              ? handleUnhideQuestion(question.id) 
                              : handleHideQuestion(question.id)
                            }
                            className={`p-2 min-h-[44px] min-w-[44px] ${
                              question.isHidden
                                ? 'hover:bg-green-50 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400'
                                : 'hover:bg-amber-50 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            }`}
                            title={question.isHidden 
                              ? t('custom_categories.unhide_question') 
                              : t('custom_categories.hide_question')
                            }
                          >
                            {question.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                        )}
                        {/* Delete button for custom questions only */}
                        {!question.isBuiltIn && (
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteQuestion(question.id, question.isBuiltIn)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 min-h-[44px] min-w-[44px]"
                            title={t('custom_categories.delete_question')}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 min-h-[44px] px-6"
          >
            {isEditingBuiltIn ? t('modal.close') : t('custom_categories.cancel')}
          </Button>
          {!isEditingBuiltIn && (
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white flex items-center min-h-[44px] px-6"
            >
              <Save size={18} className="mr-2" />
              {t('custom_categories.save')}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomCategoryEditor;
