/**
 * GameSettingsPanel
 * Configurable game settings component that uses config from game.json
 * Shows available settings like categories per game, questions per category, etc.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Save, RotateCcw } from 'lucide-react';
import { Button } from '../core/Button';
import useTranslation from '../../hooks/useTranslation';
import { GameSettings } from '../../framework/config/game.schema';

interface GameSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameSettings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onReset?: () => void;
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({
  isOpen,
  onClose,
  gameSettings,
  onSave,
  onReset
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<GameSettings>(gameSettings);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
    setSettings(gameSettings);
  };

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Settings className="text-purple-600 dark:text-purple-400 mr-3" size={24} />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {t('settings.game_settings')}
            </h2>
          </div>
          <Button
            variant="outline"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Questions & Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('settings.content_settings')}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="categoriesPerGame" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.categories_per_game')} ({settings.categoriesPerGame})
                </label>
                <input
                  id="categoriesPerGame"
                  type="range"
                  min="1"
                  max="20"
                  aria-label={t('settings.categories_per_game')}
                  value={settings.categoriesPerGame}
                  onChange={(e) => updateSetting('categoriesPerGame', parseInt(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-700 slider"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>20</span>
                </div>
              </div>

              <div>
                <label htmlFor="questionsPerCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.questions_per_category')} ({settings.questionsPerCategory})
                </label>
                <input
                  id="questionsPerCategory"
                  type="range"
                  min="1"
                  max="50" 
                  aria-label={t('settings.questions_per_category')}
                  value={settings.questionsPerCategory}
                  onChange={(e) => updateSetting('questionsPerCategory', parseInt(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-700 slider"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>

              <div>
                <label htmlFor="maxQuestionsTotal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('settings.max_questions_total')} ({settings.maxQuestionsTotal})
                </label>
                <input
                  id="maxQuestionsTotal"
                  type="range"
                  min="1"
                  max="100"
                  aria-label={t('settings.max_questions_total')}
                  value={settings.maxQuestionsTotal}
                  onChange={(e) => updateSetting('maxQuestionsTotal', parseInt(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-700 slider"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Game Behavior */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('settings.game_behavior')}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.allow_repeat_questions')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.allowRepeatQuestions}
                  onChange={(e) => updateSetting('allowRepeatQuestions', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.shuffle_questions')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.shuffleQuestions}
                  onChange={(e) => updateSetting('shuffleQuestions', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.shuffle_categories')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.shuffleCategories}
                  onChange={(e) => updateSetting('shuffleCategories', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.allow_skip_questions')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.allowSkipQuestions}
                  onChange={(e) => updateSetting('allowSkipQuestions', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.show_progress')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.showProgress}
                  onChange={(e) => updateSetting('showProgress', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            </div>
          </div>

          {/* Experience Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
              {t('settings.experience')}
            </h3>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.enable_sounds')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.enableSounds}
                  onChange={(e) => updateSetting('enableSounds', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>

              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('settings.enable_animations')}
                </span>
                <input
                  type="checkbox"
                  checked={settings.enableAnimations}
                  onChange={(e) => updateSetting('enableAnimations', e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-2xl">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            <RotateCcw size={16} className="mr-2" />
            {t('settings.reset')}
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              {t('app.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center"
            >
              <Save size={16} className="mr-2" />
              {t('app.save')}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameSettingsPanel;