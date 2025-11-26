import React from 'react';
import { Slider } from './Slider'; // Assuming Slider is in the same core directory

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, onChange, soundEnabled, onToggleSound }) => {
  return (
    <div className="mt-2 flex items-center space-x-2 px-2 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow">
      <button onClick={onToggleSound} className="focus:outline-none text-xl p-1 rounded-full hover:bg-pink-100 transition-colors">
        {soundEnabled ? '🔊' : '🔈'}
      </button>
      <Slider
        value={[volume]}
        onValueChange={(value) => onChange(value[0])}
        min={0}
        max={1}
        step={0.01} // Finer control for volume
        className="w-24"
        disabled={!soundEnabled}
      />
    </div>
  );
};

export default VolumeControl;
