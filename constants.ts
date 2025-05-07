// Game constants and configuration values

import { GameSettings } from './types';

// Category emoji mappings
export const CATEGORY_EMOJIS: { [key: string]: string } = {
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

// Loading quotes for the roulette screen
export const LOADING_QUOTES = [
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
  "Wer war's diesmal wirklich?",
  "Schuldfrage wird verschoben...",
  "Lade Kaffee für die Diskussion...",
];

// Sound Asset Paths (relative to public folder for Vite)
export const SOUND_PATHS = {
  NEW_QUESTION: '/games/blamegame/assets/new_question.mp3',
  ROUND_START: '/games/blamegame/assets/round_start.mp3',
  SUMMARY_FUN: '/games/blamegame/assets/summary_fun.mp3'
};

// Fallback questions in case loading fails completely
export const FALLBACK_QUESTIONS = [
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

// Default game settings
export const initialGameSettings: GameSettings = {
  categoryCount: 10,
  questionsPerCategory: 10,
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
  timePerQuestion: 30,
  showScore: true,
  allowSkip: true,
  showIntroAnimation: true,
  introAnimationDuration: 1500,
  questionFontSize: 1.5,
  dynamicThemeEnabled: true,
  questionCardAnimation: 'roulette',
};
