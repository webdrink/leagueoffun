import { useState, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';
import { Player, NameBlameEntry, NameBlamePhase, NameBlameState } from '../types';
import { validatePlayerName, generatePlayerId } from '../utils';

interface UsePlayerSetupOutput {
  players: Player[];
  nameBlameMode: boolean;
  nameInputError: string | null;
  tempPlayerName: string;
  nameBlameLog: NameBlameEntry[];
  currentPlayerIndex: number;
  blameState: NameBlameState;
  setNameBlameMode: (value: boolean | ((val: boolean) => boolean)) => void;
  setTempPlayerName: (name: string) => void;
  addPlayer: () => void;
  removePlayer: (id: string) => void;
  handlePlayerNameChange: (id: string, newName: string) => void;
  resetPlayers: () => void;
  advancePlayer: () => void;
  recordNameBlame: (from: string, to: string, question: string) => void;
  hasValidPlayerSetup: () => boolean;
  resetNameBlameLog: () => void;
  getActivePlayers: () => Player[];
  setBlamePhase: (phase: NameBlamePhase) => void;
  updateBlameState: (updates: Partial<NameBlameState>) => void;
  resetBlameState: () => void;
}

/**
 * Hook to manage player setup and NameBlame game mode
 */
/**
 * Custom React hook for managing the player setup and name blame logic in the BlameGame application.
 *
 * This hook provides state and utility functions for:
 * - Managing player names and IDs with persistent local storage.
 * - Adding, removing, and updating players (with validation and limits).
 * - Handling temporary player name input and related errors.
 * - Managing the "name blame" mode and log of blame actions.
 * - Advancing the current player in a round-robin fashion.
 * - Resetting players and the blame log to their initial states.
 * - Validating the player setup for minimum requirements.
 * - Retrieving only active players (with non-empty names).
 *
 * @returns {UsePlayerSetupOutput} An object containing player state, blame log, and all related handlers and utilities.
 */
const useNameBlameSetup = (): UsePlayerSetupOutput => {
  const [nameBlameMode, setNameBlameMode] = useLocalStorage<boolean>('blamegame-nameblame-mode', false);
  const [players, setPlayers] = useLocalStorage<Player[]>('blamegame-player-names', [
    { id: 'player1', name: '' }, 
    { id: 'player2', name: '' }
  ]);
  const [nameBlameLog, setNameBlameLog] = useLocalStorage<Array<NameBlameEntry>>('blamegame-nameblame-log', []);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [nameInputError, setNameInputError] = useState<string | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState("");
  
  // NameBlame state management
  const [blameState, setBlameState] = useState<NameBlameState>({
    phase: 'selecting'
  });

  // Add a new player
  const addPlayer = useCallback(() => {
    if (players.length >= 10) {
      setNameInputError("Maximal 10 Spieler erlaubt!");
      return;
    }
    
    const validation = validatePlayerName(tempPlayerName, players);
    
    if (!validation.valid) {
      setNameInputError(validation.error);
      return;
    }
    
    setPlayers(prevPlayers => [...prevPlayers, { id: generatePlayerId(), name: tempPlayerName.trim() }]);
    setTempPlayerName(""); // Clear input after adding
    setNameInputError(null); // Clear any error
  }, [players, tempPlayerName, setPlayers]);

  // Remove a player
  const removePlayer = useCallback((id: string) => {
    if (players.length > 2) {
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== id));
    }
  }, [players.length, setPlayers]);

  // Update a player's name
  const handlePlayerNameChange = useCallback((id: string, newName: string) => {
    setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? { ...p, name: newName } : p));
  }, [setPlayers]);

  // Reset players to initial state
  const resetPlayers = useCallback(() => {
    setPlayers([{ id: 'player1', name: '' }, { id: 'player2', name: '' }]);
    setNameBlameMode(false);
    setCurrentPlayerIndex(0);
  }, [setPlayers, setNameBlameMode]);

  // Move to the next player in rotation
  const advancePlayer = useCallback(() => {
    const activePlayers = players.filter(p => p.name.trim() !== '');
    if (activePlayers.length > 0) {
      setCurrentPlayerIndex(prev => (prev + 1) % activePlayers.length);
    }
  }, [players]);

  // Record a blame action in the log
  const recordNameBlame = useCallback((from: string, to: string, question: string) => {
    const entry: NameBlameEntry = {
      from,
      to,
      question,
      timestamp: new Date().toISOString()
    };

    setNameBlameLog(prevLog => [...prevLog, entry]);
  }, [setNameBlameLog]);

  // Check if we have a valid player setup
  const hasValidPlayerSetup = useCallback(() => {
    const validPlayers = players.filter(p => p.name.trim() !== '');
    return validPlayers.length >= 2;
  }, [players]);

  // Clear the blame log
  const resetNameBlameLog = useCallback(() => {
    setNameBlameLog([]);
  }, [setNameBlameLog]);

  // Get only active players (with non-empty names)
  const getActivePlayers = useCallback(() => {
    return players.filter(p => p.name.trim() !== '');
  }, [players]);

  // Blame state management functions
  const setBlamePhase = useCallback((phase: NameBlamePhase) => {
    setBlameState(prev => ({ ...prev, phase }));
  }, []);

  const updateBlameState = useCallback((updates: Partial<NameBlameState>) => {
    setBlameState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetBlameState = useCallback(() => {
    setBlameState({ phase: 'selecting' });
  }, []);

  return {
    players,
    nameBlameMode,
    nameInputError,
    tempPlayerName,
    nameBlameLog,
    currentPlayerIndex,
    blameState,
    setNameBlameMode,
    setTempPlayerName,
    addPlayer,
    removePlayer,
    handlePlayerNameChange,
    resetPlayers,
    advancePlayer,
    recordNameBlame,
    hasValidPlayerSetup,
    resetNameBlameLog,
    getActivePlayers,
    setBlamePhase,
    updateBlameState,
    resetBlameState
  };
};

export default useNameBlameSetup;
