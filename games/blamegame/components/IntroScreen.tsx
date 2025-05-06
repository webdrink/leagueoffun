import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import VolumeControl from './VolumeControl';
import { GameSettings } from '../types';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Volume2, VolumeX } from 'react-feather';

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
  onOpenInfoModal
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
        <h2 className="text-3xl font-bold text-purple-700">Wem traust du was zu?</h2>
        <p className="text-pink-600 mt-2">Was denkst du? Wer würde was tun?</p>
      </div>

      {csvError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold">Fehler beim Laden der Fragen:</p>
          <p className="text-sm">{csvError}</p>
          <p className="text-sm mt-1">Bitte überprüfe die CSV-Datei und versuche es erneut.</p>
        </div>
      )}

      <div className="mt-6 flex flex-col space-y-3">
        <Button
          onClick={onStartGame}
          disabled={isLoading || !!csvError}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg rounded-lg shadow-md transition-transform hover:scale-105 duration-200"
        >
          {isLoading ? 'Lädt...' : 'Spiel starten'}
        </Button>
        <div className="flex items-center justify-between pt-2">
          <label htmlFor="nameBlameModeToggle" className="flex items-center cursor-pointer">
            <Switch
              id="nameBlameModeToggle"
              checked={nameBlameMode}
              onCheckedChange={onToggleNameBlame}
              className="data-[state=checked]:bg-pink-500"
            />
            <span className="ml-2 text-sm text-purple-700">NameBlame Modus</span>
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSound}
            className="text-purple-600 hover:text-purple-800"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </Button>
        </div>
        <div className="mt-1">
          <div className="h-2" />
          <Slider
            value={[volume]}
            onValueChange={(newVolume) => onVolumeChange(newVolume[0])}
            max={1}
            step={0.1}
            className="w-full [&>span:first-child]:h-2 [&>span:first-child>span]:bg-pink-500"
            aria-label="Lautstärkeregler"
            disabled={!soundEnabled}
          />
        </div>
      </div>
      <div className="text-center mb-6">
      </div>

      <div className="flex justify-end gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={onOpenDebugPanel} className="text-purple-600 hover:text-purple-800">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench"><path d="M14.7 6.3a5 5 0 0 0-6.6 6.6l-5.1 5.1a2 2 0 1 0 2.8 2.8l5.1-5.1a5 5 0 0 0 6.6-6.6m-2.8 2.8 2.8-2.8"/></svg>
        </Button>
        <Button variant="ghost" size="icon" onClick={onOpenInfoModal} className="text-purple-600 hover:text-purple-800">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        </Button>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
