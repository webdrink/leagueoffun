import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import VolumeControl from './VolumeControl';
import { GameSettings } from '../types';

interface IntroScreenProps {
  gameSettings: GameSettings;
  isLoading: boolean;
  csvError: string | null;
  nameBlameMode: boolean;
  soundEnabled: boolean;
  onStartGame: () => void;
  onToggleNameBlame: (checked: boolean) => void;
  onResetAppData: () => void;
  onToggleSound: () => void;
  onVolumeChange: (volume: number) => void;
  volume: number;
}

const IntroScreen: React.FC<IntroScreenProps> = ({
  gameSettings,
  isLoading,
  csvError,
  nameBlameMode,
  soundEnabled,
  onStartGame,
  onToggleNameBlame,
  onResetAppData,
  onToggleSound,
  onVolumeChange,
  volume
}) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center mt-10 p-6 bg-white rounded-xl shadow-xl max-w-md w-full"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: gameSettings.introSpringStiffness,
        damping: gameSettings.introSpringDamping,
        duration: gameSettings.introSpringDurationSec
      }}
    >
      <p className="mb-6 text-xl text-gray-800">Wer ist schuld? Finde es heraus!</p>
      <p className="mb-8 text-md text-gray-600">Eine Person liest die Frage, gibt das Handy weiter – und weiter geht's!</p>
      
      <div className="space-y-4 mb-8 max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2 bg-black/20 p-3 rounded-lg">
          <Checkbox
            id="nameBlameMode"
            checked={nameBlameMode}
            onCheckedChange={(checked) => onToggleNameBlame(Boolean(checked))}
          />
          <Label htmlFor="nameBlameMode" className="text-lg">NameBlame Mode (Enter Player Names)</Label>
        </div>
      </div>
      
      <Button
        onClick={onStartGame}
        size="lg"
        disabled={isLoading || !!csvError}
        className="transition-transform hover:scale-105 duration-300 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
      >
        {isLoading ? "Lade Fragen..." : (nameBlameMode ? "Spieler einrichten" : "Spiel starten")}
      </Button>
      
      <div className="mt-4 flex items-center justify-center space-x-4">
        <Checkbox
          id="nameBlameModeToggle"
          checked={nameBlameMode}
          onCheckedChange={(checked) => onToggleNameBlame(checked as boolean)}
          className="mr-2"
        />
        <label htmlFor="nameBlameModeToggle" className="text-sm text-gray-600 cursor-pointer select-none">
          NameBlame Modus
        </label>
      </div>
      
      <div className="mt-4 flex space-x-4">
        <Button
          onClick={onResetAppData}
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
        >
          App-Daten zurücksetzen
        </Button>
        
        <div className="flex flex-col items-center">
          <Button
            onClick={onToggleSound}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            {soundEnabled ? '🔊 Ton An' : '🔇 Ton Aus'}
          </Button>
          
          {soundEnabled && (
            <VolumeControl 
              volume={volume} 
              onChange={onVolumeChange} 
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default IntroScreen;
