/**
 * GameSettingsPanel
 * Configurable game settings component that uses config from game.json
 * Shows available settings like categories per game, questions per category, etc.
 */
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Save, RotateCcw } from 'lucide-react';
import { Button } from '../core/Button';
import useTranslation from '../../hooks/useTranslation';
import { GameSettings, UISettingsField } from '../../framework/config/game.schema';

interface GameSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  gameSettings: GameSettings;
  onSave: (settings: GameSettings) => void;
  onReset?: () => void;
  fields?: UISettingsField[]; // optional config-driven fields
}

const GameSettingsPanel: React.FC<GameSettingsPanelProps> = ({
  isOpen,
  onClose,
  gameSettings,
  onSave,
  onReset,
  fields
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<GameSettings>(gameSettings);

  // Group fields for layout (content, behavior, experience)
  const grouped = useMemo(() => {
    const list = (fields || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    const groups = new Map<string, UISettingsField[]>();
    list.forEach(f => {
      const g = f.group || 'general';
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(f);
    });
    return groups; // Map of group -> fields
  }, [fields]);

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
          {fields && fields.length > 0 ? (
            Array.from(grouped.entries()).map(([group, fs]) => (
              <div className="space-y-4" key={group}>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  {t(`settings.group.${group}`) || group}
                </h3>
                <div className="space-y-3">
                  {fs.map(field => {
                    const key = field.key as keyof GameSettings;
                    const label = t(field.label) || field.label;
                    if (field.type === 'number') {
                      const min = field.min ?? 0;
                      const max = field.max ?? 100;
                      const step = field.step ?? 1;
                      const value = Number(settings[key] as unknown as number);
                      return (
                        <div key={field.key}>
                          <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {label} ({value})
                          </label>
                          <input
                            id={field.key}
                            type="range"
                            min={min}
                            max={max}
                            step={step}
                            aria-label={label}
                            value={value}
                            onChange={(e) => updateSetting(key, Number.parseInt(e.target.value, 10) as unknown as GameSettings[typeof key])}
                            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer dark:bg-purple-700 slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <span>{min}</span>
                            <span>{max}</span>
                          </div>
                        </div>
                      );
                    }
                    if (field.type === 'boolean') {
                      const checked = Boolean(settings[key] as unknown as boolean);
                      return (
                        <label key={field.key} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {label}
                          </span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => updateSetting(key, e.target.checked as unknown as GameSettings[typeof key])}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                        </label>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))
          ) : (
            // Backwards-compatibility fallback (static layout)
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {t('settings.no_dynamic_fields') || 'No dynamic settings defined. Using defaults.'}
            </div>
          )}
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