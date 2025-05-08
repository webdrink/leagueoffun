import React from 'react';
import { Button } from "../core/Button"; // Adjusted path
import DebugInput from "./DebugInput"; // Adjusted path (same directory)
import type { GameSettings, QuestionStats } from "../../types"; // Path remains correct
import { XIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import useTranslation from '../../hooks/useTranslation';

interface DebugPanelProps {
  gameSettings: GameSettings;
  setGameSettings: (settings: GameSettings | ((prev: GameSettings) => GameSettings)) => void;
  defaultGameSettings: GameSettings;
  onClose: () => void;
  onResetAppData: () => void; // Added for resetting all app data
  questionStats?: QuestionStats;
}

interface SettingConfigBase {
  name: keyof GameSettings;
  label: string;
}

interface SettingConfigTyped extends SettingConfigBase {
  type: 'boolean' | 'number' | 'string';
}

interface SettingConfigSelect extends SettingConfigBase {
  type: 'select';
  options: Array<{ value: string | number; label: string }>;
}

type SettingConfig = SettingConfigTyped | SettingConfigSelect;

interface SectionConfig {
  title: string;
  settings: SettingConfig[];
}

// Define settings configuration (can be moved to a constants file if it grows larger)
const settingsConfig: Record<string, SectionConfig> = {
  gameplay: {
    title: "Gameplay",
    settings: [
      { name: 'questionsPerCategory', label: 'Questions Per Round', type: 'number' },
      { name: 'allowSkip', label: 'Allow Skip Question', type: 'boolean' },
      { name: 'showScore', label: 'Show Score (Future)', type: 'boolean' }, // Example for future use
    ],
  },
  timing: {
    title: "Timing & Durations",
    settings: [
      { name: 'rouletteDurationMs', label: 'Roulette Duration (ms)', type: 'number' },
      { name: 'loadingQuoteIntervalMs', label: 'Loading Quote Interval (ms)', type: 'number' },
      { name: 'timePerQuestion', label: 'Time Per Question (s) (Future)', type: 'number' },
    ],
  },
  animation: {
    title: "Animations & Visuals",
    settings: [
      { name: 'questionCardAnimation', label: 'Card Animation Style', type: 'select', options: [
          { value: 'roulette', label: 'Roulette' },
          { value: 'stack', label: 'Stack' },
          { value: 'fade', label: 'Fade' },
        ]
      },
      { name: 'questionFontSize', label: 'Question Font Size (rem)', type: 'number' },
      { name: 'showIntroAnimation', label: 'Show Intro Animation (Future)', type: 'boolean' },
      { name: 'introAnimationDuration', label: 'Intro Animation Duration (ms) (Future)', type: 'number' },
    ],
  },  theme: {
    title: "Theme (Future)",
    settings: [
        { name: 'dynamicThemeEnabled', label: 'Dynamic Theme (Time-based)', type: 'boolean' },
    ]
  },
  language: {
    title: "Language",
    settings: [
        { name: 'language', label: 'Game Language', type: 'select', options: [
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'Français' },
            { value: 'es', label: 'Español' },
          ]
        },
    ]
  }
  // Add more sections like 'sound', 'advanced', etc.
};


const DebugPanel: React.FC<DebugPanelProps> = ({
  gameSettings,
  setGameSettings,
  defaultGameSettings,
  onClose,
  onResetAppData,
  questionStats
}) => {
  const { t } = useTranslation();

  const handleSectionReset = (sectionKey: string) => {
    const sectionSettings = settingsConfig[sectionKey].settings;
    const updatedSettings = { ...gameSettings };
    
    sectionSettings.forEach(setting => {
      const settingName = setting.name;
      // Type assertion to copy values from defaultGameSettings
      (updatedSettings as any)[settingName] = (defaultGameSettings as any)[settingName];
    });
    
    setGameSettings(updatedSettings);
  };

  const handleResetAllSettings = () => {
    setGameSettings(defaultGameSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-2 sm:p-4">      <div className="bg-gray-800 text-white p-4 sm:p-6 rounded-lg shadow-2xl w-full max-w-lg md:max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl sm:text-2xl font-semibold">{t('debug.panel_title')}</h2>
          <Button onClick={onClose} className="text-gray-400 hover:text-white bg-transparent hover:bg-gray-700 p-2">
            <XIcon size={20} />
          </Button>
        </div>

        {questionStats && (
          <div className="mb-4 p-3 bg-gray-700 rounded-md">
            <h3 className="text-lg font-medium mb-2">{t('debug.question_stats')}</h3>
            <div className="grid grid-cols-3 gap-2 mb-2 text-xs sm:text-sm">
              {/* Stats items */}
              <div className="bg-gray-800 p-2 rounded-md text-center">
                <div className="text-gray-400">{t('debug.total')}</div>
                <div className="text-lg font-bold">{questionStats.totalQuestions}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded-md text-center">
                <div className="text-gray-400">{t('debug.played')}</div>
                <div className="text-lg font-bold">{questionStats.playedQuestions}</div>
              </div>
              <div className="bg-gray-800 p-2 rounded-md text-center">
                <div className="text-gray-400">{t('debug.available')}</div>
                <div className="text-lg font-bold">{questionStats.availableQuestions}</div>
              </div>
            </div>            {questionStats.categories && Object.keys(questionStats.categories).length > 0 && (
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-300 mb-1">{t('debug.categories')}:</h4>
                <div className="max-h-28 overflow-y-auto text-xs pr-1">
                  {Object.entries(questionStats.categories).map(([category, count]) => (
                    <div key={category} className="flex justify-between py-0.5 border-b border-gray-600 last:border-b-0">
                      <span className="truncate max-w-[70%]">{category}</span>
                      <span className="font-medium text-blue-300">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-y-auto flex-grow pr-2 space-y-4 text-sm">
          {Object.keys(settingsConfig).map((sectionKey) => (
            <div key={sectionKey} className="bg-gray-750 p-3 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base sm:text-lg font-medium">{settingsConfig[sectionKey].title}</h3>                <Button
                  onClick={() => handleSectionReset(sectionKey)}
                  className="text-xs bg-gray-600 hover:bg-gray-500 border-gray-500 text-white px-2 py-1"
                >
                  <RotateCcwIcon size={12} className="mr-1" /> {t('debug.reset')}
                </Button>
              </div>
              {settingsConfig[sectionKey].settings.map((setting) => (
                <DebugInput
                  key={setting.name}
                  name={setting.name}
                  label={setting.label}
                  type={(setting as SettingConfigTyped).type} // Type assertion
                  options={(setting as SettingConfigSelect).options} // Type assertion
                  gameSettings={gameSettings}
                  setGameSettings={setGameSettings}
                />
              ))}
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-3">          <Button 
            onClick={handleResetAllSettings} 
            className="w-full sm:w-auto text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2"
          >
            <RotateCcwIcon size={14} className="mr-1.5" /> {t('debug.reset_all_settings')}
          </Button>
          <Button 
            onClick={() => { if(window.confirm(t('debug.confirm_reset_data'))) { onResetAppData(); onClose(); } }}
            className="w-full sm:w-auto text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2"
          >
            <Trash2Icon size={14} className="mr-1.5" /> {t('debug.reset_app_data')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
