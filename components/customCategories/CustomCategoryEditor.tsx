/**
 * CustomCategoryEditor
 * Component for creating and editing custom categories
 * Includes emoji picker and question management
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '../core/Button';
import useTranslation from '../../hooks/useTranslation';
import { 
  addCustomCategory, 
  updateCustomCategory, 
  addQuestionToCategory,
  deleteQuestionFromCategory,
  updateCategoryQuestion
} from '../../lib/customCategories/storage';
import { CustomCategory } from '../../lib/customCategories/types';
import { SupportedLanguage } from '../../types';

interface CustomCategoryEditorProps {
  category: CustomCategory | null;
  isOpen: boolean;
  onClose: () => void;
}

// Common emojis for quick selection
const COMMON_EMOJIS = [
  '😀', '😂', '🤣', '😊', '😎', '🥳', '😍', '🤔', '😱', '🤯',
  '🎉', '🎊', '🎈', '🎁', '🎮', '🎲', '🎯', '🎭', '🎪', '🎨',
  '🏆', '🏅', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🎾',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍', '🤎', '💔',
  '🔥', '⚡', '✨', '💫', '⭐', '🌟', '💥', '💢', '💨', '💦',
  '🍕', '🍔', '🍟', '🌮', '🌯', '🍿', '🧁', '🍰', '🎂', '🍪',
  '☕', '🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🥤', '🧃', '🧋',
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
  '✈️', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥️', '⛴️', '🚢',
  '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪'
];

const CustomCategoryEditor: React.FC<CustomCategoryEditorProps> = ({
  category,
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const isEditing = category !== null;
  
  const [emoji, setEmoji] = useState(category?.emoji || '🎉');
  const [names, setNames] = useState<Record<SupportedLanguage, string>>(
    category?.name || { en: '', de: '', es: '', fr: '' }
  );
  const [questions, setQuestions] = useState(category?.questions || []);
  const [newQuestionText, setNewQuestionText] = useState<Record<SupportedLanguage, string>>({
    en: '', de: '', es: '', fr: ''
  });
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setEmoji(category.emoji);
      setNames(category.name);
      setQuestions(category.questions);
    }
  }, [category]);

  const handleNameChange = (lang: SupportedLanguage, value: string) => {
    setNames(prev => ({ ...prev, [lang]: value }));
  };

  const handleQuestionTextChange = (lang: SupportedLanguage, value: string) => {
    setNewQuestionText(prev => ({ ...prev, [lang]: value }));
  };

  const handleSave = () => {
    // Validate
    const hasName = Object.values(names).some(name => name.trim() !== '');
    if (!hasName) {
      alert(t('custom_categories.error_name_required'));
      return;
    }

    if (!emoji) {
      alert(t('custom_categories.error_emoji_required'));
      return;
    }

    if (isEditing && category) {
      // Update existing category
      updateCustomCategory(category.id, { emoji, name: names });
    } else {
      // Create new category
      addCustomCategory(emoji, names);
    }

    onClose();
  };

  const handleAddQuestion = () => {
    const hasText = Object.values(newQuestionText).some(text => text.trim() !== '');
    if (!hasText) {
      alert(t('custom_categories.error_question_required'));
      return;
    }

    if (isEditing && category) {
      addQuestionToCategory(category.id, newQuestionText);
      setQuestions([...questions, {
        id: `temp_${Date.now()}`,
        text: newQuestionText,
        createdAt: new Date().toISOString()
      }]);
    } else {
      // For new categories, add to local state
      setQuestions([...questions, {
        id: `temp_${Date.now()}`,
        text: newQuestionText,
        createdAt: new Date().toISOString()
      }]);
    }

    setNewQuestionText({ en: '', de: '', es: '', fr: '' });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm(t('custom_categories.confirm_delete_question'))) {
      if (isEditing && category) {
        deleteQuestionFromCategory(category.id, questionId);
      }
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  if (!isOpen) return null;

  const currentLanguage = i18n.language as SupportedLanguage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {isEditing ? t('custom_categories.edit_category') : t('custom_categories.create_new')}
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
        <div className="p-6 space-y-6">
          {/* Emoji Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('custom_categories.emoji')}
            </label>
            <div className="flex items-center space-x-4 mb-3">
              <div className="text-5xl">{emoji}</div>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-200"
                placeholder={t('custom_categories.placeholder_emoji')}
              />
            </div>
            <div className="grid grid-cols-10 gap-2">
              {COMMON_EMOJIS.map((em) => (
                <button
                  key={em}
                  onClick={() => setEmoji(em)}
                  className={`text-2xl p-2 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors ${
                    emoji === em ? 'bg-purple-200 dark:bg-purple-900/50' : ''
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          {/* Category Names */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('custom_categories.category_name')}
            </label>
            <div className="space-y-3">
              {(['en', 'de', 'es', 'fr'] as SupportedLanguage[]).map((lang) => (
                <div key={lang}>
                  <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                    {lang.toUpperCase()}
                  </label>
                  <input
                    type="text"
                    value={names[lang]}
                    onChange={(e) => handleNameChange(lang, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-200"
                    placeholder={t('custom_categories.placeholder_name')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('custom_categories.questions')}
            </h3>

            {/* Add New Question */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="space-y-3">
                {(['en', 'de', 'es', 'fr'] as SupportedLanguage[]).map((lang) => (
                  <div key={lang}>
                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                      {lang.toUpperCase()}
                    </label>
                    <input
                      type="text"
                      value={newQuestionText[lang]}
                      onChange={(e) => handleQuestionTextChange(lang, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-600 dark:text-gray-200"
                      placeholder={t('custom_categories.placeholder_question')}
                    />
                  </div>
                ))}
              </div>
              <Button
                onClick={handleAddQuestion}
                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white flex items-center"
              >
                <Plus size={18} className="mr-2" />
                {t('custom_categories.add_question')}
              </Button>
            </div>

            {/* Question List */}
            {questions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                {t('custom_categories.no_questions')}
              </p>
            ) : (
              <div className="space-y-2">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <span className="text-gray-800 dark:text-gray-200 flex-1">
                      {question.text[currentLanguage] || question.text.en || question.text.de}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            {t('custom_categories.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center"
          >
            <Save size={18} className="mr-2" />
            {t('custom_categories.save')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CustomCategoryEditor;
