import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { XIcon } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetAppData: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, onResetAppData }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full relative border-2 border-pink-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Spiel-Anleitung</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                <XIcon size={24} />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-2">Spielziel</h3>
                <p>Bei "TheBlameGame" geht es darum, die Schuld zuzuweisen - aber alles im Spaß!</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Klassischer Modus</h3>
                <p>Im klassischen Modus liest eine Person die Frage vom Bildschirm vor. Alle diskutieren und entscheiden gemeinsam, wer am ehesten der Beschreibung entspricht.</p>
                <p className="mt-2">Bei jeder Frage wird das Handy herumgereicht, damit jeder mal an der Reihe ist.</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">NameBlame Modus</h3>
                <p>Im NameBlame Modus gibt ihr zu Beginn die Namen aller Spieler ein. Bei jeder Frage entscheidet ein bestimmter Spieler, wem er die "Schuld" gibt. Am Ende seht ihr, wer am häufigsten beschuldigt wurde!</p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Steuerung</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Nächste Frage:</strong> Tippe auf "Nächste Frage"</li>
                  <li><strong>Zurück:</strong> Gehe zur vorherigen Frage</li>
                  <li><strong>Im NameBlame Modus:</strong> Wähle den Namen einer Person aus, die am besten zur Frage passt</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-2">Tipps</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Es geht um Spaß, nicht um echte Anschuldigungen</li>
                  <li>Behaltet einen freundlichen Ton bei</li>
                  <li>Die "Beschuldigungen" können ein guter Anlass für Gespräche und Lacher sein</li>
                  <li>Tipp für Partys: Verwende den NameBlame Modus für eine Statistik am Ende des Abends!</li>
                </ul>
              </section>
            </div>

            <div className="mt-6 text-center flex flex-col gap-2">
              <Button
                onClick={onClose}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-105 duration-200"
              >
                Verstanden!
              </Button>
              <Button
                onClick={onResetAppData}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg shadow-md transition-transform hover:scale-105 duration-200"
              >
                App-Daten zurücksetzen
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InfoModal;
