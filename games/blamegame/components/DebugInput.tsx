import React from 'react';
import { Input } from "./ui/input";
import { Switch } from "./ui/switch"; // Corrected path
import { Label } from "./ui/label";
import type { GameSettings } from "../types"; // Import as type

interface DebugInputPropsBase {
  label: string;
  name: keyof GameSettings;
  gameSettings: GameSettings;
  setGameSettings: (settings: GameSettings) => void;
}

interface DebugInputPropsTyped extends DebugInputPropsBase {
  type: 'boolean' | 'number' | 'string';
}

interface DebugInputPropsSelect extends DebugInputPropsBase {
  type: 'select';
  options: Array<{ value: string | number; label: string }>;
}

type DebugInputProps = DebugInputPropsTyped | DebugInputPropsSelect;

const DebugInput: React.FC<DebugInputProps> = (props) => {
  const { label, name, gameSettings, setGameSettings, type } = props;
  const elementName = String(name); // Ensure name is a string for element attributes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const targetName = e.target.name as keyof GameSettings; // Cast back to keyof GameSettings
    const value = e.target.value;
    let processedValue: string | number | boolean = value;

    if (e.target.type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (e.target.type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value); // Default to 0 if empty
      if (isNaN(processedValue)) { // Ensure it's not NaN
        processedValue = 0;
      }
    } else {
      processedValue = value;
    }

    setGameSettings({
      ...gameSettings,
      [targetName]: processedValue,
    });
  };

  const handleSwitchChange = (checked: boolean) => {
    setGameSettings({
      ...gameSettings,
      [name]: checked, // name is already keyof GameSettings here
    });
  };

  const currentValue = gameSettings[name];

  if (type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-2">
        <Label htmlFor={elementName} className="text-sm font-medium text-gray-300">
          {label}
        </Label>
        <Switch
          id={elementName}
          name={elementName} // Use stringified name
          checked={Boolean(currentValue)} // Use Boolean() for safety
          onCheckedChange={handleSwitchChange}
        />
      </div>
    );
  }

  if (type === 'number') {
    return (
      <div className="flex items-center justify-between py-2">
        <Label htmlFor={elementName} className="text-sm font-medium text-gray-300">
          {label}
        </Label>
        <Input
          type="number"
          id={elementName}
          name={elementName} // Use stringified name
          value={currentValue === null || currentValue === undefined || isNaN(currentValue as number) ? '' : String(currentValue)} // Also check for NaN
          onChange={handleChange}
          className="w-24 bg-gray-700 border-gray-600 text-white"
        />
      </div>
    );
  }

  if (type === 'string') {
    return (
      <div className="flex items-center justify-between py-2">
        <Label htmlFor={elementName} className="text-sm font-medium text-gray-300">
          {label}
        </Label>
        <Input
          type="text"
          id={elementName}
          name={elementName} // Use stringified name
          value={currentValue === null || currentValue === undefined ? '' : String(currentValue)} // Handle null/undefined, ensure string for value
          onChange={handleChange}
          className="w-full bg-gray-700 border-gray-600 text-white"
        />
      </div>
    );
  }

  if (type === 'select' && 'options' in props) {
    const selectValue = currentValue;
    // Ensure the value for select is not boolean; this should be guaranteed by settingsConfig
    if (typeof selectValue === 'boolean') {
      console.error(`DebugInput: Setting ${elementName} is a boolean and cannot be used for a select input.`);
      return (
        <div className="text-red-500 py-2">Error: Misconfigured select for {label}</div>
      );
    }
    return (
      <div className="flex items-center justify-between py-2">
        <Label htmlFor={elementName} className="text-sm font-medium text-gray-300">
          {label}
        </Label>
        <select
          id={elementName}
          name={elementName} // Use stringified name
          value={selectValue === null || selectValue === undefined ? '' : String(selectValue)} // Handle null/undefined, ensure string for value
          onChange={handleChange}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
        >
          {props.options.map(option => (
            <option key={String(option.value)} value={String(option.value)}> {/* Ensure key is string or number */}
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return null;
};

export default DebugInput;
