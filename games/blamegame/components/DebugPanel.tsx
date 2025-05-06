import React from 'react';
import { Button } from "./ui/button";
import DebugInput from "./DebugInput";
import type { GameSettings } from "../App"; // Path to App.tsx for GameSettings type
import { XIcon, RotateCcwIcon } from 'lucide-react';

interface DebugPanelProps {
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  defaultGameSettings: GameSettings;
  onClose: () => void;
  questionStats?: {
    totalQuestions: number;
    playedQuestions: number;
    availableQuestions: number;
  };
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

const settingsConfig: Record<string, SectionConfig> = {
  gameRules: {
    title: "Game Rules",
    settings: [      { name: 'numberOfRounds', label: 'Number of Rounds', type: 'number' },
      { name: 'questionsPerCategory', label: 'Questions Per Round', type: 'number' },
      { name: 'timePerQuestion', label: 'Time Per Question (s)', type: 'number' },
      { name: 'showScore', label: 'Show Score', type: 'boolean' },
      { name: 'allowSkip', label: 'Allow Skip Question', type: 'boolean' },
    ],
  },
  introAnimation: {
    title: "Intro Animation",
    settings: [
      { name: 'showIntroAnimation', label: 'Show Intro Animation', type: 'boolean' },
      { name: 'introAnimationDuration', label: 'Intro Animation Duration (ms)', type: 'number' },
    ],
  },
  questionCard: {
    title: "Question Card",
    settings: [
      { name: 'questionCardAnimation', label: 'Card Animation', type: 'select', options: [
          { value: 'roulette', label: 'Roulette' },
          { value: 'stack', label: 'Stack' },
          { value: 'fade', label: 'Fade' },
        ]
      },
      { name: 'questionFontSize', label: 'Question Font Size (rem)', type: 'number' },
    ],
  },
  theme: {
    title: "Theme",
    settings: [
        { name: 'dynamicThemeEnabled', label: 'Dynamic Theme', type: 'boolean' },
    ]
  }
};

const DebugPanel: React.FC<DebugPanelProps> = ({ gameSettings, setGameSettings, defaultGameSettings, onClose }) => {
  const handleSectionReset = (sectionKey: string) => {
    const sectionSettings = settingsConfig[sectionKey].settings;
    const updatedSettings = { ...gameSettings };
    
    // Type-safe way to copy the values
    sectionSettings.forEach(setting => {
      const settingName = setting.name;
      // Using type assertion to avoid TypeScript errors
      (updatedSettings as any)[settingName] = (defaultGameSettings as any)[settingName];
    });
    
    setGameSettings(updatedSettings);
  };

  const handleResetAll = () => {
    setGameSettings(defaultGameSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Debug Panel</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <XIcon size={24} />
          </Button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 space-y-6">
          {Object.keys(settingsConfig).map((sectionKey) => (
            <div key={sectionKey} className="bg-gray-750 p-4 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xl font-medium">{settingsConfig[sectionKey].title}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSectionReset(sectionKey)}
                  className="text-xs bg-gray-600 hover:bg-gray-500 border-gray-500"
                >
                  <RotateCcwIcon size={14} className="mr-1" /> Reset Section
                </Button>
              </div>
              <div className="space-y-2">
                {settingsConfig[sectionKey].settings.map((setting) => {
                  const commonProps = {
                    key: String(setting.name),
                    name: setting.name,
                    label: setting.label,
                    gameSettings: gameSettings,
                    setGameSettings: setGameSettings,
                  };

                  if (setting.type === 'select') {
                    // The 'options' property is guaranteed by the SettingConfigSelect type for 'select'
                    return (
                      <DebugInput
                        {...commonProps}
                        type="select"
                        options={setting.options}
                      />
                    );
                  } else {
                    // Type assertion helps TypeScript understand that 'type' is one of the other literal types
                    return (
                      <DebugInput
                        {...commonProps}
                        type={setting.type as 'boolean' | 'number' | 'string'}
                      />
                    );
                  }
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700 flex justify-end">
          <Button
            variant="destructive"
            onClick={handleResetAll}
            className="bg-red-600 hover:bg-red-700"
          >
            <RotateCcwIcon size={16} className="mr-2" /> Reset All to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
