import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input'; // Corrected path
import { Checkbox } from './components/ui/checkbox'; // Corrected path
import { Label } from './components/ui/label';
import useLocalStorage from './hooks/useLocalStorage';
import useTheme from './hooks/useTheme';
import useSound from './hooks/useSound';
import DebugPanel from './components/DebugPanel';
import { WrenchIcon } from 'lucide-react';
import './index.css';

// --- Type Definitions ---

export interface GameSettings { // Added export
  categoryCount: number;
  questionsPerCategory: number; // This was already here, but listed in todo as 'questionsPerRound'
  rouletteDurationMs: number;
  loadingQuoteIntervalMs: number;

  introSpringStiffness: number;
  introSpringDamping: number;
  introSpringDurationSec: number;

  questionCardTransitionSec: number;
  questionCardSpringStiffness: number;
  questionCardSpringDamping: number;

  rouletteCardBaseDurationSec: number;
  rouletteCardStaggerDelaySec: number;
  rouletteCardStaggerDurationIncrementSec: number;
  rouletteCardSpringStiffness: number;
  rouletteCardSpringDamping: number;
  rouletteCardSpreadFactor: number;
  rouletteCardRotationAngle: number;

  loadingQuoteSpringStiffness: number;
  loadingQuoteSpringDamping: number;
  loadingQuoteTransitionDurationSec: number;

  numberOfRounds: number;
  timePerQuestion: number; // in seconds
  showScore: boolean;
  allowSkip: boolean;
  showIntroAnimation: boolean;
  introAnimationDuration: number; // in ms
  questionFontSize: number; // in rem
  dynamicThemeEnabled: boolean;
  questionCardAnimation: string; // e.g., 'roulette', 'stack', 'fade'
}

interface Question {
  category: string;
  text: string;
}

interface Player {
  id: string;
  name: string;
}

interface NameBlameEntry {
  from: string;   // Player who blamed
  to: string;     // Player who was blamed
  question: string;
  timestamp: string; // ISO date string
}

// --- Constants ---

// Fallback questions in case loading fails completely
const FALLBACK_QUESTIONS: Question[] = [
  {
    category: "Beim Feiern",
    text: "Wer würde versehentlich eine ganze Bar bezahlen, weil sich niemand traut, die Rechnung zu teilen?"
  },
  {
    category: "In Beziehungen",
    text: "Wer würde vergessen, wichtige Jahrestage zu feiern?"
  },
  {
    category: "Bei der Arbeit",
    text: "Wer würde sich bei einem Vorstellungsgespräch versprechen und es nicht mehr korrigieren können?"
  },
  {
    category: "In der Schule",
    text: "Wer würde einen Tag vor der Prüfung anfangen zu lernen?"
  },
  {
    category: "In peinlichen Momenten",
    text: "Wer würde in der Öffentlichkeit laut furzen und dann so tun, als wäre nichts passiert?"
  }
];

const CATEGORY_EMOJIS: { [key: string]: string } = {
  "Beim Feiern": "🎉",
  "In Beziehungen": "❤️",
  "Bei der Arbeit": "💼",
  "In der Schule": "📚",
  "In peinlichen Momenten": "😳",
  "Im Urlaub": "✈️",
  "Beim Sport": "🏃",
  "In der Freundschaft": "🤝",
  "Im Alltag": "🏠",
  "In der Familie": "👨‍👩‍👧‍👦",
  "In der Zukunft": "🔮",
  "Beim Essen": "🍕",
  "Im Bad": "🛁",
  "Im Internet": "🌐",
  "Im Straßenverkehr": "🚗",
  "Bei Filmen & Serien": "🎬",
  "In der WG": "🛋️",
  "Beim Flirten": "😉",
  "Auf Partys mit Fremden": "🥳",
  "Beim Weltuntergang": "☄️",
  "Im Paralleluniversum": "✨",
  "Im Land der schlechten Entscheidungen": "🤔",
  "Im inneren Monolog": "🧠",
};

const LOADING_QUOTES = [
  "Kalibriere Schuldzuweisung...",
  "Scanne Ausreden...",
  "Berechne Ironie-Level...",
  "Wer hat's wieder getan?",
  "Fingerzeigen initialisiert...",
  "Lade neue Ausreden herunter...",
  "Verstecke Beweise...",
  "Schiebe Schuld auf den Nachbarn...",
  "Zähle leere Versprechungen...",
  "Analysiere peinliche Stille...",
  "Suche nach dem Sündenbock...",
  "Würfle Verantwortlichkeiten...",
  "Lade Alibi-Updates...",
  "Synchronisiere Ausflüchte...",
  "Verteile schwarze Peter...",
  "Finde den, der zuletzt gelacht hat...",
  "Überprüfe Ausreden-Datenbank...",
  "Starte Schuldumkehr-Prozess...",
  "Erstelle Notlügen...",
  "Warte auf Geständnisse...",
  "Zufällige Schuld wird verteilt...",
  "Lade Meme für die Ausrede...",
  "Wer war’s diesmal wirklich?",
  "Schuldfrage wird verschoben...",
  "Lade Kaffee für die Diskussion...",
];

// --- Sound Asset Paths (relative to public folder for Vite) ---
const SOUND_NEW_QUESTION = '/games/blamegame/assets/new_question.mp3';
const SOUND_ROUND_START = '/games/blamegame/assets/round_start.mp3';
const SOUND_SUMMARY_FUN = '/games/blamegame/assets/summary_fun.mp3';

const initialGameSettings: GameSettings = {
  categoryCount: 10,
  questionsPerCategory: 10, // Corresponds to questionsPerRound
  rouletteDurationMs: 2000,
  loadingQuoteIntervalMs: 800,

  introSpringStiffness: 260,
  introSpringDamping: 20,
  introSpringDurationSec: 0.3,

  questionCardTransitionSec: 0.15,
  questionCardSpringStiffness: 120,
  questionCardSpringDamping: 20,

  rouletteCardBaseDurationSec: 0.5,
  rouletteCardStaggerDelaySec: 0.1,
  rouletteCardStaggerDurationIncrementSec: 0.05,
  rouletteCardSpringStiffness: 80,
  rouletteCardSpringDamping: 12,
  rouletteCardSpreadFactor: 60,
  rouletteCardRotationAngle: 10,

  loadingQuoteSpringStiffness: 120,
  loadingQuoteSpringDamping: 10,
  loadingQuoteTransitionDurationSec: 0.5,

  numberOfRounds: 3,
  timePerQuestion: 30, // seconds
  showScore: true,
  allowSkip: true,
  showIntroAnimation: true,
  introAnimationDuration: 1500, // ms
  questionFontSize: 1.5, // rem
  dynamicThemeEnabled: true,
  questionCardAnimation: 'roulette', // default animation
};

// --- Helper Functions ---

function getRandomCategories(allCategories: string[], count: number): string[] {
  const unique = [...new Set(allCategories)];
  const numToSelect = Math.min(count, unique.length);
  return unique.sort(() => 0.5 - Math.random()).slice(0, numToSelect);
}

function getEmoji(category: string): string {
  if (CATEGORY_EMOJIS[category]) {
    return CATEGORY_EMOJIS[category];
  }
  for (const key in CATEGORY_EMOJIS) {
    if (category.includes(key)) return CATEGORY_EMOJIS[key];
  }
  return "❓";
}

// --- Main Component ---

function App() {
  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>('blamegame-settings', initialGameSettings);
  const themeDetails = useTheme();
  const { soundEnabled, toggleSound, playSound } = useSound();
  const [step, setStep] = useState<'intro' | 'playerSetup' | 'roulette' | 'game' | 'summary'>('intro');
  const [index, setIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentRoundQuestions, setCurrentRoundQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [playedQuestions, setPlayedQuestions] = useLocalStorage<string[]>('blamegame-played-questions', []);
  const [nameBlameMode, setNameBlameMode] = useLocalStorage<boolean>('blamegame-nameblame-mode', false);
  const [players, setPlayers] = useLocalStorage<Player[]>('blamegame-player-names', [{ id: 'player1', name: '' }, { id: 'player2', name: '' }]);  const [nameBlameLog, setNameBlameLog] = useLocalStorage<Array<NameBlameEntry>>('blamegame-nameblame-log', []);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [nameInputError, setNameInputError] = useState<string | null>(null);
  const [tempPlayerName, setTempPlayerName] = useState("");  useEffect(() => {
    setIsLoading(true);
    setCsvError(null);
    
    // First try to load questions from JSON
    fetch('questions.json')
      .then(res => {
        if (!res.ok) throw new Error('JSON questions not found, falling back to CSV');
        return res.json();
      })
      .then((data: Question[]) => {
        if (data && data.length > 0) {
          setAllQuestions(data);
          setCsvError(null);
          console.log(`Loaded ${data.length} questions from JSON`);
        } else {
          throw new Error('JSON file empty or invalid');
        }
      })
      .catch(jsonError => {
        console.warn('Failed to load JSON questions, falling back to CSV:', jsonError);
        
        // Fallback to CSV
        fetch('blamegame_questions.csv')
          .then(res => {
            if (!res.ok) throw new Error(`CSV HTTP error! status: ${res.status}`);
            return res.text();
          })
          .then(text => {
            const lines = text.split('\n').filter(line => line.trim() !== '' && !line.startsWith('//'));
            const header = lines.shift();
            if (!header || !header.toLowerCase().includes('kategorie') || !header.toLowerCase().includes('frage')) {
              console.warn("CSV header might be missing or incorrect. Assuming 'Kategorie;Frage;' structure.");
            }
            
            const parsed: Question[] = lines.map(line => {
              const parts = line.split(';');
              const category = parts[0]?.trim() || 'Unbekannt';
              const text = parts[1]?.trim() || 'Keine Frage gefunden';
              return { category, text };
            }).filter(q => q.category !== 'Unbekannt' && q.text !== 'Keine Frage gefunden');

            if (parsed.length > 0) {
              setAllQuestions(parsed);
              setCsvError(null);
              console.log(`Loaded ${parsed.length} questions from CSV`);
            } else {
              throw new Error('No valid questions found in CSV');
            }
          })
          .catch(csvError => {
            console.error('Error loading questions from CSV:', csvError);
            setCsvError('Fehler beim Laden der Fragen. Weder JSON noch CSV konnten geladen werden.');
            setAllQuestions(FALLBACK_QUESTIONS);
          });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);
  const startRoulette = useCallback(() => {
    if (isLoading) {
      return;
    }
    
    if (nameBlameMode && players.filter(p => p.name.trim() !== '').length < 2) {
      setStep('playerSetup');
      return;
    }

    playSound(SOUND_ROUND_START);

    // Handle the case when no questions were loaded
    let questionsToUse = allQuestions;
    if (questionsToUse.length === 0) {
      console.warn("No questions loaded, using fallback questions");
      questionsToUse = FALLBACK_QUESTIONS;
      setCsvError("Konnte keine Fragen laden. Verwende eingeschränkte Notzufragen.");
    }

    let availableQuestions = questionsToUse.filter(q => !playedQuestions.includes(q.text));

    if (availableQuestions.length < 15) {
      setPlayedQuestions([]);
      availableQuestions = questionsToUse;
    }

    setStep('roulette');
    const allCategoryNames = availableQuestions.map(q => q.category);
    const categoriesForRound = getRandomCategories(allCategoryNames, gameSettings.categoryCount);
    setSelectedCategories(categoriesForRound);

    setQuoteIndex(0);
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
    }, gameSettings.loadingQuoteIntervalMs);

    setTimeout(() => {
      clearInterval(quoteTimer);
      if (availableQuestions.length > 0) {
        let filteredAndLimited: Question[] = [];
        categoriesForRound.forEach(cat => {
          const questionsForCat = availableQuestions
            .filter(q => q.category === cat)
            .sort(() => 0.5 - Math.random())
            .slice(0, gameSettings.questionsPerCategory);
          filteredAndLimited = filteredAndLimited.concat(questionsForCat);
        });
        const shuffledRoundQuestions = filteredAndLimited.sort(() => 0.5 - Math.random());
        setCurrentRoundQuestions(shuffledRoundQuestions);
        setIndex(0);
        setCardKey(prev => prev + 1);
        setStep('game');
      } else {
        setCsvError("Konnte das Spiel nicht starten, da keine Fragen geladen wurden.");
        setStep('intro');
      }
    }, gameSettings.rouletteDurationMs);
  }, [isLoading, csvError, allQuestions, gameSettings, playedQuestions, setPlayedQuestions, playSound, nameBlameMode, players]);

  const nextQuestion = useCallback(() => {
    if (index < currentRoundQuestions.length - 1) {
      setIndex(prevIndex => prevIndex + 1);
      setCardKey(prev => prev + 1);
      playSound(SOUND_NEW_QUESTION);
      if (nameBlameMode) {
        setCurrentPlayerIndex(prev => (prev + 1) % players.filter(p => p.name.trim() !== '').length);
      }
    } else {
      const newlyPlayedQuestions = currentRoundQuestions.map(q => q.text);
      setPlayedQuestions(prevPlayed => {
        const updatedPlayed = [...new Set([...prevPlayed, ...newlyPlayedQuestions])];
        return updatedPlayed;
      });
      playSound(SOUND_SUMMARY_FUN);
      setStep('summary');
      setIndex(0);
      setCurrentPlayerIndex(0);
    }
  }, [index, currentRoundQuestions, playSound, setPlayedQuestions, nameBlameMode, players]);  const handlePlayerNameChange = (id: string, newName: string) => {
    setPlayers(prevPlayers => prevPlayers.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const addPlayer = () => {
    if (players.length >= 10) {
      setNameInputError("Maximal 10 Spieler erlaubt!");
      return;
    }
    
    const trimmedName = tempPlayerName.trim();
    
    if (!trimmedName) {
      setNameInputError("Bitte gib einen Namen ein.");
      return;
    }
    
    if (trimmedName.length > 20) {
      setNameInputError("Name darf maximal 20 Zeichen lang sein.");
      return;
    }
    
    const isDuplicate = players.some(p => p.name.trim().toLowerCase() === trimmedName.toLowerCase());
    if (isDuplicate) {
      setNameInputError("Dieser Name existiert bereits.");
      return;
    }
    
    setPlayers(prevPlayers => [...prevPlayers, { id: `player${Date.now()}`, name: trimmedName }]);
    setTempPlayerName(""); // Clear input after adding
    setNameInputError(null); // Clear any error
  };

  const removePlayer = (id: string) => {
    if (players.length > 2) {
      setPlayers(prevPlayers => prevPlayers.filter(p => p.id !== id));
    }
  };

  const startNameBlameGame = () => {
    const validPlayers = players.filter(p => p.name.trim() !== '');
    if (validPlayers.length < 2) {
      alert("Bitte mindestens 2 Spielernamen eingeben.");
      return;
    }
    setPlayers(validPlayers);
    startRoulette();
  };
  const handleBlame = (blamedPlayerName: string) => {
    if (!currentQuestion || !nameBlameMode) return;

    const blamingPlayer = players[currentPlayerIndex];
    if (!blamingPlayer || !blamingPlayer.name) return;

    const entry: NameBlameEntry = {
      from: blamingPlayer.name,
      to: blamedPlayerName,
      question: currentQuestion.text,
      timestamp: new Date().toISOString()
    };

    setNameBlameLog(prevLog => [...prevLog, entry]);
    nextQuestion();
  };

  const goBack = useCallback(() => {
    if (index > 0) {
      setIndex(prevIndex => prevIndex - 1);
      setCardKey(prev => prev - 1);
    }
  }, [index]);

  const restart = useCallback(() => {
    setIndex(0);
    setStep('intro');
    setCurrentRoundQuestions([]);
    setSelectedCategories([]);
    setCsvError(null);
    setCurrentPlayerIndex(0);
  }, []);

  const resetAppData = () => {
    setPlayedQuestions([]);
    setPlayers([{ id: 'player1', name: '' }, { id: 'player2', name: '' }]);
    setNameBlameMode(false);
    setNameBlameLog([]);
    setGameSettings(initialGameSettings);
    alert('App-Daten wurden zurückgesetzt.');
    setStep('intro');
  };

  const currentQuestion = currentRoundQuestions[index];
  const activePlayers = useMemo(() => players.filter(p => p.name.trim() !== ''), [players]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 text-center text-gray-800 transition-colors duration-1000 ${themeDetails.gradient} ${themeDetails.animationClass || ''}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDebugMode(!debugMode)}
        className="fixed top-4 right-4 z-50 text-white bg-black/20 hover:bg-black/40"
        title="Toggle Debug Panel"
      >
        <WrenchIcon size={24} />
      </Button>

      {debugMode && (
        <DebugPanel
          gameSettings={gameSettings}
          setGameSettings={setGameSettings}
          defaultGameSettings={initialGameSettings}
          onClose={() => setDebugMode(false)}
        />
      )}

      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white text-opacity-90 shadow-lg px-4 py-2 rounded-md bg-black bg-opacity-20">
        TheBlameGame
      </h1>

      {step === 'intro' && (
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
                onCheckedChange={(checked) => setNameBlameMode(Boolean(checked))}
              />
              <Label htmlFor="nameBlameMode" className="text-lg">NameBlame Mode (Enter Player Names)</Label>
            </div>
          </div>
          <Button
            onClick={startRoulette}
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
              onCheckedChange={(checked) => setNameBlameMode(checked as boolean)}
              className="mr-2"
            />
            <label htmlFor="nameBlameModeToggle" className="text-sm text-gray-600 cursor-pointer select-none">
              NameBlame Modus
            </label>
          </div>
          <div className="mt-4 flex space-x-4">
            <Button
              onClick={resetAppData}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              App-Daten zurücksetzen
            </Button>
            <Button
              onClick={toggleSound}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              {soundEnabled ? '🔊 Ton An' : '🔇 Ton Aus'}
            </Button>
          </div>
        </motion.div>
      )}      {step === 'playerSetup' && nameBlameMode && (
        <motion.div
          key="playerSetup"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-lg w-full"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center">Spielernamen eingeben</h2>
          
          {/* Existing players list */}
          <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
            {players.map((player, idx) => (
              <div key={player.id} className="flex items-center space-x-2">
                <Input
                  type="text"
                  placeholder={`Spieler ${idx + 1}`}
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(player.id, e.target.value)}
                  className="flex-grow"
                />
                {players.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removePlayer(player.id)} 
                    className="text-red-500 hover:text-red-700"
                    aria-label="Spieler entfernen"
                  >
                    X
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {/* Add new player section */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Neuer Spielername"
                value={tempPlayerName}
                onChange={(e) => setTempPlayerName(e.target.value)}
                className="flex-grow"
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              />
              <Button 
                onClick={addPlayer} 
                disabled={players.length >= 10} 
                variant="outline" 
                className="bg-green-100 hover:bg-green-200 text-green-800"
              >
                +
              </Button>
            </div>
            {nameInputError && (
              <p className="text-red-600 text-sm mt-2">{nameInputError}</p>
            )}
            <div className="flex justify-end mt-2">
              <span className="text-xs text-gray-500">{players.length} / 10 Spieler</span>
            </div>
          </div>
          
          <Button 
            onClick={startNameBlameGame} 
            size="lg" 
            className="w-full transition-transform hover:scale-105 duration-300 bg-green-500 hover:bg-green-600 text-white"
            disabled={players.filter(p => p.name.trim() !== '').length < 2}
          >
            Spiel starten
          </Button>
          <Button variant="link" onClick={() => setStep('intro')} className="mt-3 text-sm text-gray-600 w-full">
            Zurück zum Hauptmenü
          </Button>
        </motion.div>
      )}

      {step === 'roulette' && (
        <div className="flex flex-col items-center justify-center w-full h-full mt-16">
          <motion.div
            className="mb-10 text-3xl font-semibold text-center text-white text-opacity-90"
            key={quoteIndex}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{
              type: "spring",
              stiffness: gameSettings.loadingQuoteSpringStiffness,
              damping: gameSettings.loadingQuoteSpringDamping,
              duration: gameSettings.loadingQuoteTransitionDurationSec,
            }}
          >
            {LOADING_QUOTES[quoteIndex]}
          </motion.div>

          <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
            <AnimatePresence>
              {selectedCategories.map((cat, i) => (
                <motion.div
                  key={cat + i}
                  className="category-card absolute bg-white p-3 rounded-lg shadow-xl w-40 h-52 flex flex-col items-center justify-center text-center transform-gpu"
                  initial={{ opacity: 0, y: 100, scale: 0.8, rotate: (i % 2 === 0 ? -1 : 1) * gameSettings.rouletteCardRotationAngle }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotate: 0,
                    x: (i - Math.floor(selectedCategories.length / 2)) * gameSettings.rouletteCardSpreadFactor,
                  }}
                  exit={{ opacity: 0, y: 50, scale: 0.7 }}
                  transition={{
                    type: 'spring',
                    stiffness: gameSettings.rouletteCardSpringStiffness,
                    damping: gameSettings.rouletteCardSpringDamping,
                    delay: i * gameSettings.rouletteCardStaggerDelaySec,
                    duration: gameSettings.rouletteCardBaseDurationSec + i * gameSettings.rouletteCardStaggerDurationIncrementSec,
                  }}
                >
                  <div className="text-3xl mb-2">{getEmoji(cat)}</div>
                  <div className="w-full overflow-hidden flex-grow flex items-center justify-center">
                    <p
                      className="text-xs font-semibold text-gray-700 leading-tight"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        wordBreak: 'break-word',
                        maxHeight: 'calc(1.25em * 4)',
                      }}
                    >
                      {cat}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {step === 'game' && currentQuestion && (
        <motion.div
          key="game"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-md w-full relative"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={cardKey}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{
                type: 'spring',
                stiffness: gameSettings.questionCardSpringStiffness,
                damping: gameSettings.questionCardSpringDamping,
                duration: gameSettings.questionCardTransitionSec,
              }}
              className="min-h-[150px] flex flex-col justify-between"
            >              <div>
                <div className="text-5xl mb-4">{getEmoji(currentQuestion.category)}</div>
                <p className="text-sm text-gray-500 mb-2">{currentQuestion.category}</p>
                <p 
                  className="text-xl md:text-2xl font-semibold text-gray-800 min-h-[60px] overflow-y-auto max-h-[180px] py-2"
                  style={{
                    fontSize: `${gameSettings.questionFontSize}rem`,
                    lineHeight: '1.4',
                    scrollbarWidth: 'thin'
                  }}
                >
                  {currentQuestion.text}
                </p>
              </div>
              <div className="w-full mt-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <motion.div
                    className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((index + 1) / currentRoundQuestions.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-400 text-right">
                  Frage {index + 1} von {currentRoundQuestions.length}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {nameBlameMode && activePlayers.length > 0 && (
            <div className="mt-6 w-full max-w-md">
              <p className="text-center text-sm text-gray-600 mb-2">
                {activePlayers[currentPlayerIndex]?.name || ''}, wer ist schuld?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {activePlayers.map(player => (
                  <Button
                    key={player.id}
                    variant="outline"
                    onClick={() => handleBlame(player.name)}
                    className="w-full truncate transition-transform hover:scale-105 duration-200"
                    disabled={player.name === activePlayers[currentPlayerIndex]?.name}
                  >
                    {player.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {!nameBlameMode && (
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <Button variant="outline" onClick={goBack} disabled={index === 0} className="transition-transform hover:scale-105 duration-300">Zurück</Button>
              <Button onClick={nextQuestion} className="transition-transform hover:scale-105 duration-300 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white">
                {index === currentRoundQuestions.length - 1 ? "Zusammenfassung" : "Nächste Frage"}
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {step === 'summary' && (
        <motion.div
          key="summary"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="bg-white/80 backdrop-blur-md p-8 rounded-xl shadow-2xl text-center max-w-md w-full"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-700">Spielzusammenfassung!</h2>
            {nameBlameMode && nameBlameLog.length > 0 ? (
            <div className="text-left mb-6 max-h-60 overflow-y-auto pr-2">
              <h3 className="text-xl font-semibold mb-3 text-gray-600 text-center">Blame-O-Meter:</h3>
              {(() => {
                const blameCounts: { [key: string]: number } = {};
                nameBlameLog.forEach(log => {
                  blameCounts[log.to] = (blameCounts[log.to] || 0) + 1;
                });
                const sortedBlames = Object.entries(blameCounts).sort(([,a],[,b]) => b-a);

                if (sortedBlames.length > 0) {
                  const mostBlamed = sortedBlames[0];
                  return (
                    <>
                      <div className="text-lg text-center font-bold text-pink-600 mb-6 p-3 bg-pink-100 rounded-lg shadow-inner">
                        <span className="block text-xs text-pink-400 uppercase tracking-wider mb-1">
                          Most Blamed Award
                        </span>
                        {mostBlamed[0]} ({mostBlamed[1]}x)
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-md font-semibold mb-2 text-gray-500">Blame Ranking:</h4>
                        <div className="space-y-2">
                          {sortedBlames.map(([name, count], index) => (
                            <div key={name} className="flex items-center">
                              <div className="w-6 text-center font-bold text-gray-500">{index + 1}.</div>
                              <div className="flex-grow ml-2 font-medium">{name}</div>
                              <div className="text-right font-bold text-purple-600">{count}x</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                }
                return null;
              })()}
              
              <h4 className="text-md font-semibold mb-2 text-gray-500">Alle Beschuldigungen:</h4>
              <ul className="space-y-1 text-sm text-gray-500 divide-y divide-gray-100">
                {nameBlameLog.map((log, i) => (
                  <li key={i} className="py-1">
                    <strong className="text-blue-600">{log.from}</strong> beschuldigte <strong className="text-pink-600">{log.to}</strong> für: 
                    <p className="italic mt-1 ml-4 text-gray-400">"{log.question}"</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-lg mb-6 text-gray-600">
              Du hast alle {currentRoundQuestions.length} Fragen dieser Runde beantwortet!
            </p>
          )}

          <Button
            onClick={restart}
            size="lg"
            className="transition-transform hover:scale-105 duration-300 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white mt-4"
          >
            Neues Spiel
          </Button>
        </motion.div>
      )}

      {csvError && (
        <motion.div
          className="mt-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md shadow-md max-w-md w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="font-bold">Fehler:</p>
          <p>{csvError}</p>
        </motion.div>
      )}
    </div>
  );
}

export default App;
