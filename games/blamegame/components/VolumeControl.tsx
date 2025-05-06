import React from 'react';

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ volume, onChange }) => {
  return (
    <div className="mt-2 flex items-center space-x-1 px-2">
      <span className="text-xs">🔈</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
      />
      <span className="text-xs">🔊</span>
    </div>
  );
};

export default VolumeControl;
