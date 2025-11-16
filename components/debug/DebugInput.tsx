import { Switch } from "../../framework/ui/components/Switch"; // Corrected path
import type { GameSettings } from "../../types"; // Import as type

interface DebugInputPropsBase {
  label: string;
  name: keyof GameSettings;
  gameSettings: GameSettings;
  setGameSettings: (settings: GameSettings | ((prev: GameSettings) => GameSettings)) => void;
}

interface DebugInputPropsTyped extends DebugInputPropsBase {
  type: 'boolean' | 'number' | 'string';
  options?: Array<{ value: string | number; label: string }>; // Added optional 'options' property
}

interface DebugInputPropsSelect extends DebugInputPropsBase {
  type: 'select';
  options: Array<{ value: string | number; label: string }>;
}

type DebugInputProps = DebugInputPropsTyped | DebugInputPropsSelect;

const DebugInput: React.FC<DebugInputProps> = (props) => {
  const { label, name, gameSettings, setGameSettings, type } = props;
  const elementName = String(name);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { value } = e.target;
    let newValue: string | number | boolean = value;

    if (type === 'number') {
      newValue = parseFloat(value);
      if (isNaN(newValue)) newValue = 0; // Default to 0 if parsing fails
    } else if (type === 'boolean') {
      // This case is handled by the Switch component directly
      return;
    }
    
    setGameSettings(prev => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setGameSettings(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  if (type === 'select' && 'options' in props) {
    return (
      <div className="flex items-center justify-between py-2">
        <label htmlFor={elementName} className="text-sm text-gray-300">
          {label}
        </label>
        <select
          id={elementName}
          name={elementName}
          value={String(gameSettings[name])}
          onChange={handleChange}
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-1.5 w-48"
        >
          {props.options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-2">
        <label htmlFor={elementName} className="text-sm text-gray-300">
          {label}
        </label>
        <Switch
          id={elementName}
          checked={Boolean(gameSettings[name])}
          onCheckedChange={handleSwitchChange}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      <label htmlFor={elementName} className="text-sm text-gray-300">
        {label}
      </label>
      <input
        type={type === 'string' ? 'text' : type} // Use 'text' for string type
        id={elementName}
        name={elementName}
        value={String(gameSettings[name])}
        onChange={handleChange}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-1.5 w-48"
        min={type === 'number' ? 0 : undefined} // Example: enforce non-negative for numbers
      />
    </div>
  );
};

export default DebugInput;
