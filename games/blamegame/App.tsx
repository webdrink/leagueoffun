import React, { useEffect, useState } from 'react';
import { Button } from "./components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import './index.css';

// Define the Question type
interface Question {
  category: string;
  text: string;
}

const CATEGORY_EMOJIS: { [key: string]: string } = {
  Internet: "🌐",
  Sport: "🏃",
  Freundschaft: "🤝",
  Alltag: "🧦",
  Feiern: "🎉",
};

const LOADING_QUOTES = [
  "Kalibriere Schuldzuweisung...",
  "Scanne Ausreden...",
  "Berechne Ironie-Level...",
  "Wer hat's wieder getan?",
  "Fingerzeigen initialisiert..."
];

function getRandomCategories(allCategories: string[], count = 5): string[] {
  const unique = [...new Set(allCategories)];
  return unique.sort(() => 0.5 - Math.random()).slice(0, count);
}

function getEmoji(category: string): string {
  for (const key in CATEGORY_EMOJIS) {
    if (category.includes(key)) return CATEGORY_EMOJIS[key];
  }
  return "❓";
}

function App() {
  const [step, setStep] = useState('intro');
  const [index, setIndex] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [csvError, setCsvError] = useState<string | null>(null);

  useEffect(() => {
    if (questions.length === 0 && step !== 'intro') {
      fetch('blamegame_questions.csv')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.text();
        })
        .then(text => {
          const lines = text.split('\n').filter(Boolean);
          const parsed: Question[] = lines.map(line => {
            const [category, ...textParts] = line.split(',');
            return { category: category.trim(), text: textParts.join(',').trim() };
          });
          if (parsed.length > 0) {
            setQuestions(parsed);
            setCsvError(null);
          } else {
            setCsvError('Keine Fragen im CSV gefunden.');
          }
        })
        .catch((error) => {
          console.error("Error fetching or parsing CSV:", error);
          setCsvError('Fehler beim Laden der Fragen. Prüfe die Konsole für Details.');
        });
    }
  }, [step]);

  const startRoulette = () => {
    if (questions.length === 0) {
      console.warn("Questions not loaded yet, cannot start roulette.");
      return;
    }
    setStep('roulette');
    const allCategories = questions.map(q => q.category);
    const categories = getRandomCategories(allCategories, 5);
    setSelectedCategories(categories);
    setQuoteIndex(0);

    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % LOADING_QUOTES.length);
    }, 800);

    setTimeout(() => {
      clearInterval(interval);
      if (questions.length > 0) {
        const filtered = questions.filter(q => categories.includes(q.category));
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        setQuestions(shuffled);
        setStep('game');
      } else {
        setCsvError("Konnte das Spiel nicht starten, da keine Fragen geladen wurden.");
        setStep('intro');
      }
    }, 4000);
  };

  const nextQuestion = () => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      setCardKey(prev => prev + 1);
    } else {
      setStep('intro');
      setIndex(0);
      setSelectedCategories([]);
    }
  };

  const goBack = () => {
    if (index > 0) {
      setIndex(index - 1);
      setCardKey(prev => prev - 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setStep('intro');
    setQuestions([]);
    setSelectedCategories([]);
    setCsvError(null);
  };

  const currentQuestion = questions[index];

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 text-center bg-gradient-to-b from-blue-100 to-purple-100">
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 shadow-sm">TheBlameGame</h1>

      {step === 'intro' && (
        <motion.div
          className="flex flex-col items-center justify-center mt-10 p-6 bg-white rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="mb-6 text-lg text-gray-700">Wer ist schuld? Finde es heraus!</p>
          <p className="mb-8 text-sm text-gray-500">Eine Person liest die Frage, gibt das Handy weiter – und weiter geht's!</p>
          <Button onClick={startRoulette} size="lg">Spiel starten</Button>
        </motion.div>
      )}

      {step === 'roulette' && (
        <div className="flex flex-col items-center justify-center w-full h-full mt-20">
          <motion.div
            className="mb-8 text-2xl font-semibold text-center text-purple-700"
            key={quoteIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            {LOADING_QUOTES[quoteIndex]}
          </motion.div>

          <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
            {selectedCategories.map((cat, i) => (
              <motion.div
                key={cat + i}
                className="absolute w-40 h-60 bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center text-center text-sm font-medium p-3 border border-gray-200"
                initial={{ rotate: -15, y: -250, opacity: 0, scale: 0.7 }}
                animate={{
                  rotate: (i - (selectedCategories.length - 1) / 2) * 10,
                  y: 0,
                  x: (i - (selectedCategories.length - 1) / 2) * 80,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 120, damping: 15 }}
              >
                <div className="text-5xl mb-3">{getEmoji(cat)}</div>
                <div className="text-lg font-semibold px-2 break-words">{cat}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {step === 'game' && currentQuestion && (
        <div className="flex flex-col items-center justify-center mt-10 w-full max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={cardKey}
              className="w-full min-h-[16rem] bg-white rounded-xl shadow-2xl flex flex-col justify-between items-center p-5 border border-gray-200"
              initial={{ opacity: 0, x: -100, rotate: -5 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={{ opacity: 0, x: 100, rotate: 5 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
            >
              <div className="text-2xl font-bold text-gray-800">{getEmoji(currentQuestion.category)} {currentQuestion.category}</div>
              <div className="text-xl font-medium px-2 mt-4 flex-grow flex items-center text-center text-gray-700">{currentQuestion.text}</div>
              <div className="w-full mt-6">
                <div className="text-xs text-gray-500 text-right mb-1">Frage {index + 1} von {questions.length}</div>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-2.5 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                    initial={{ width: `${(index / questions.length) * 100}%` }}
                    animate={{ width: `${((index + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button onClick={goBack} disabled={index === 0} variant="secondary">Zurück</Button>
            <Button onClick={nextQuestion} size="lg">Weiter</Button>
            <Button variant="outline" onClick={restart}>Neustart</Button>
          </div>
        </div>
      )}

      {csvError && (
        <motion.div
          className="mt-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {csvError}
        </motion.div>
      )}
    </div>
  );
}

export default App;
