/**
 * HookHuntSummaryScreen Component
 * 
 * Displays the final results and statistics after completing a HookHunt game.
 * Shows player scores, achievements, and game statistics.
 * 
 * Props:
 * - onRestart: Function to start a new game
 * - onBack: Function to return to game screen
 * - gameConfig: Configuration object from game.json
 * 
 * Expected behavior:
 * - Display final scores and rankings
 * - Show game statistics (correct guesses, time taken, etc.)
 * - Provide options to play again or return to setup
 * - Display achievements or notable moments
 * 
 * Dependencies:
 * - React, motion (framer-motion)
 * - Button component from framework
 * - Card components from framework
 * - Trophy and celebration animations
 * 
 * Integration:
 * - Used by framework GameHost for summary phase
 * - Displays data collected during gameplay
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../core/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../core/Card';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { useHookHuntPlayers, useHookHuntGame } from '../../store/hookHuntStore';
import { useFrameworkRouter } from '../../framework/core/router/FrameworkRouter';
import { GameAction } from '../../framework/core/actions';

const HookHuntSummaryScreen: React.FC = () => {
  const { players } = useHookHuntPlayers();
  const { endGame } = useHookHuntGame();
  const { dispatch } = useFrameworkRouter();
  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const winner = sortedPlayers[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto p-4 space-y-6"
    >
      {/* Winner Celebration */}
      <Card className="bg-gradient-to-br from-emerald-400/20 via-cyan-400/20 to-blue-400/20 border-emerald-300">
        <CardContent className="text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
            className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center mb-6"
          >
            <Trophy size={40} className="text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="text-4xl font-bold text-gray-800 mb-2"
          >
            🎉 {winner?.name ?? 'Winner'} Wins! 🎉
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="text-xl text-gray-600"
          >
            Final Score: {winner?.score ?? 0} points
          </motion.p>
        </CardContent>
      </Card>

      {/* Final Leaderboard */}
      <Card className="bg-white/90 backdrop-blur-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-500" />
            Final Standings
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  index === 0 ? 'bg-gradient-to-r from-emerald-100 to-cyan-100 border-2 border-emerald-300' :
                  index === 1 ? 'bg-gradient-to-r from-slate-100 to-gray-150 border-2 border-slate-300' :
                  index === 2 ? 'bg-gradient-to-r from-cyan-100 to-blue-100 border-2 border-cyan-300' :
                  'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-300 text-gray-700'
                  }`}>
                    {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800">{player.name}</h3>
                    <div className="text-sm text-gray-600">Streak: {player.streak}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">{player.score ?? 0}</div>
                  <div className="text-sm text-gray-500">points</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
        <CardFooter className="flex justify-center gap-4 p-6">
          <Button onClick={() => dispatch(GameAction.RESTART)} variant="outline" className="flex items-center px-6 py-3">
            <Home size={18} className="mr-2" /> Back to Menu
          </Button>
          <Button onClick={() => { endGame(); dispatch(GameAction.RESTART); }} className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
            <RotateCcw size={18} className="mr-2" /> Play Again
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default HookHuntSummaryScreen;