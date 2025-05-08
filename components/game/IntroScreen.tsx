import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Checkbox } from '../core/Checkbox';
import { Label } from '../core/Label';
import VolumeControl from '../core/VolumeControl';
import { GameSettings } from '../../types';
import { Switch } from '../core/Switch';
import { Slider } from '../core/Slider';
import { Volume2, VolumeX, Settings as SettingsIcon, Info as InfoIcon } from 'lucide-react'; // Using lucide-react consistently
import LanguageSelector from '../settings/LanguageSelector';

interface IntroScreenProps {
  gameSettings: GameSettings;
  isLoading: boolean;
  csvError: string | null;
  nameBlameMode: boolean;
  soundEnabled: boolean;
  onStartGame: () => void;
  onToggleNameBlame: (checked: boolean) => void;
  onToggleSound: () => void;
  onVolumeChange: (volume: number) => void;
  volume: number;
  onOpenDebugPanel: () => void;
  onOpenInfoModal: () => void;
  mainButtonLabel?: string;
}

const IntroScreen: React.FC<IntroScreenProps> = ({
  gameSettings,
  isLoading,
  csvError,
  nameBlameMode,
  soundEnabled,
  onStartGame,
  onToggleNameBlame,
  onToggleSound,
  onVolumeChange,
  volume,
  onOpenDebugPanel,
  onOpenInfoModal,
  mainButtonLabel
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md p-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-pink-100"
    >
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-purple-700">Wem traust du was zu?</h1>
        <p className="text-pink-600 mt-2 text-sm sm:text-base">Was denkst du? Wer würde was tun?</p>
      </div>

      {csvError && (
        <motion.div 
          initial={{opacity: 0, height: 0}} 
          animate={{opacity:1, height: 'auto'}}
          className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm"
        >
          <p className="font-semibold">Fehler beim Laden der Fragen:</p>
          <p>{csvError}</p>
          <p className="mt-1">Bitte überprüfe die Fragen-Datei und versuche es erneut.</p>
        </motion.div>
      )}

      <div className="mt-6 flex flex-col space-y-4">
        <Button
          onClick={onStartGame}
          disabled={isLoading || !!csvError}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform hover:scale-105 duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {mainButtonLabel || (isLoading ? 'Lädt Fragen...' : 'Spiel starten')}
        </Button>
        
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="nameBlameModeToggle" className="flex items-center cursor-pointer select-none">
            <Switch
              id="nameBlameModeToggle"
              checked={nameBlameMode}
              onCheckedChange={onToggleNameBlame}
              className="data-[state=checked]:bg-pink-500"
            />
            <span className="ml-2 text-sm text-purple-700">NameBlame Modus</span>
          </Label>
        </div>
      </div>
        <div className="mt-4 pt-4 border-t border-pink-200">
        <VolumeControl 
          volume={volume} 
          onChange={onVolumeChange}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
        />
      </div>
      
      <div className="mt-4 pt-4 border-t border-pink-200">
        <LanguageSelector />
      </div>

      <div className="mt-6 flex justify-end space-x-2">
        <Button variant="outline" onClick={onOpenDebugPanel} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-300 p-2">
          <SettingsIcon size={20} />
        </Button>
        <Button variant="outline" onClick={onOpenInfoModal} className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 border-purple-300 p-2">
          <InfoIcon size={20} />
        </Button>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
