/**
 * FrameworkIntroScreen
 * Config-driven, modular intro screen with proper header/main/footer layout.
 * Features are enabled/disabled based on game.json UI configuration.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFrameworkRouter } from '../../core/router/FrameworkRouter';
import { GameAction } from '../../core/actions';
import { Button } from '../components/Button';
import { Label } from '../components/Label';
import { Switch } from '../components/Switch';
import useTranslation from '../../../hooks/useTranslation';
import { useGameSettings } from '../../../hooks/useGameSettings';
import { GameSettings } from '../../../types';
import { useMultiplayerStore } from '../../network/store';
import { buildQrImageUrl, buildRoomUrl, generateRoomCode } from '../../network/utils/roomLinks';
import { sanitizeRoomCode } from '../../network/protocol';

const FrameworkIntroScreen: React.FC = () => {
  const { dispatch, config, role, multiplayer } = useFrameworkRouter();
  const { t } = useTranslation();
  
  // UI configuration from game.json
  const ui = config.ui;
  const features = ui?.features || {};
  const branding = ui?.branding || {};
  const theme = ui?.theme || {};
  
  // Global game settings (persisted)
  const { gameSettings, updateGameSettings } = useGameSettings();
  // gameMode is a union 'classic' | 'nameBlame'; avoid comparing to lowercase variant to satisfy TS
  const isNameBlame = gameSettings.gameMode === 'nameBlame';
  // Local UI state mirrors store for immediate responsiveness if needed
  const [gameMode, setGameMode] = useState(isNameBlame);

  // Keep local mirror in sync if external change happens (future-proofing)
  useEffect(() => {
    if (isNameBlame !== gameMode) {
      setGameMode(isNameBlame);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNameBlame]);
  const [selectCategories, setSelectCategories] = useState(gameSettings?.selectCategories || false);
  const [roomInput, setRoomInput] = useState('');
  const [manualOfferInput, setManualOfferInput] = useState('');
  const [manualAnswerInput, setManualAnswerInput] = useState('');
  const [displayName, setDisplayName] = useState(() => {
    try {
      return localStorage.getItem('blamegame.multiplayer.displayName') || '';
    } catch {
      return '';
    }
  });

  const multiplayerState = useMultiplayerStore((state) => ({
    enabled: state.enabled,
    roomId: state.roomId,
    status: state.status,
    players: state.players,
    selfPlayerId: state.selfPlayerId,
    fallbackReason: state.fallbackReason,
    manualOfferToken: state.manualOfferToken,
    manualAnswerToken: state.manualAnswerToken
  }));

  const isInMultiplayerRoom = !!multiplayerState.enabled && !!multiplayerState.roomId && !!role;
  const selfPlayer = multiplayerState.players.find((player) => player.id === multiplayerState.selfPlayerId);
  const isSelfReady = !!selfPlayer?.ready;

  const controllerShareUrl = isInMultiplayerRoom
    ? buildRoomUrl(window.location.href, {
      gameId: config.id,
      roomId: multiplayerState.roomId || '',
      role: 'controller'
    })
    : '';

  const manualOfferJoinUrl = isInMultiplayerRoom && multiplayerState.manualOfferToken
    ? buildRoomUrl(window.location.href, {
      gameId: config.id,
      roomId: multiplayerState.roomId || '',
      role: 'controller',
      offerToken: multiplayerState.manualOfferToken
    })
    : '';

  const handleStartGame = () => {
    if (isInMultiplayerRoom && role !== 'host') {
      multiplayer?.sendReady(true).catch(() => undefined);
      return;
    }
    dispatch(GameAction.ADVANCE);
  };

  const handleCreateRoom = () => {
    const roomCode = generateRoomCode(4);
    const name = displayName.trim() || `Player-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    try {
      localStorage.setItem('blamegame.multiplayer.displayName', name);
    } catch {
      // Ignore storage issues.
    }
    window.location.href = buildRoomUrl(window.location.href, {
      gameId: config.id,
      roomId: roomCode,
      role: 'host'
    });
  };

  const handleJoinRoom = () => {
    const normalizedRoom = sanitizeRoomCode(roomInput);
    if (!normalizedRoom) {
      return;
    }

    const name = displayName.trim() || `Player-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    try {
      localStorage.setItem('blamegame.multiplayer.displayName', name);
    } catch {
      // Ignore storage issues.
    }

    window.location.href = buildRoomUrl(window.location.href, {
      gameId: config.id,
      roomId: normalizedRoom,
      role: 'controller'
    });
  };

  const handleLeaveRoom = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('room');
    url.searchParams.delete('roomId');
    url.searchParams.delete('role');
    url.searchParams.delete('offer');
    window.location.href = url.toString();
  };

  const handleReadyToggle = () => {
    if (!multiplayer) {
      return;
    }
    multiplayer.sendReady(!isSelfReady).catch(() => undefined);
  };

  const handleApplyOfferToken = () => {
    if (!multiplayer || !manualOfferInput.trim()) {
      return;
    }
    multiplayer.applyManualOfferToken(manualOfferInput.trim()).catch(() => undefined);
  };

  const handleApplyAnswerToken = () => {
    if (!multiplayer || !manualAnswerInput.trim()) {
      return;
    }
    multiplayer.applyManualAnswerToken(manualAnswerInput.trim()).catch(() => undefined);
  };

  const handleToggleGameMode = (checked: boolean) => {
    // Update local for instant UI response
    setGameMode(checked);
    // Persist to store synchronously so phase transition can read it
    updateGameSettings({ gameMode: checked ? 'nameBlame' : 'classic' } as Partial<GameSettings>);
  };

  const handleToggleCategorySelection = (checked: boolean) => {
    // Update local for instant UI response
    setSelectCategories(checked);
    // Persist to store synchronously so phase transition can read it
    updateGameSettings({ selectCategories: checked } as Partial<GameSettings>);
  };

  return (
  <div className="flex flex-col items-center justify-center min-h-[60vh] py-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${theme.cardBackground || 'bg-white dark:bg-gray-800'} rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl backdrop-blur-sm bg-white/97 dark:bg-slate-900/82 border border-white/80 dark:border-slate-600/60`}
        >

          {/* Main Question */}
          {branding.mainQuestion && (
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                {t(branding.mainQuestion)}
              </h2>
              {branding.subtitle && (
                <p className="
                  text-slate-700 dark:text-slate-200
                  text-sm sm:text-base lg:text-lg
                  w-full max-w-full
                  break-words hyphens-auto
                  overflow-hidden
                  leading-relaxed
                  px-2
                ">
                  {t(branding.subtitle)}
                </p>
              )}
            </div>
          )}

          {/* Multiplayer Lobby */}
          {!isInMultiplayerRoom && (
            <div className="mb-6 rounded-xl border border-autumn-200 bg-autumn-50/90 p-4 dark:border-autumn-600/40 dark:bg-autumn-950/30">
              <h3 className="mb-3 text-sm font-semibold text-autumn-800 dark:text-autumn-200">
                Jackbox-style Lobby
              </h3>
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                className="mb-3 w-full rounded-lg border border-autumn-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-autumn-400 focus:outline-none dark:border-autumn-700 dark:bg-slate-900 dark:text-gray-100"
                maxLength={20}
              />
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  onClick={handleCreateRoom}
                  className="bg-gradient-to-r from-autumn-500 to-rust-500 text-white"
                >
                  Host Room
                </Button>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roomInput}
                    onChange={(event) => setRoomInput(sanitizeRoomCode(event.target.value))}
                    placeholder="Room code"
                    className="w-full rounded-lg border border-autumn-200 bg-white px-3 py-2 text-sm text-gray-800 focus:border-autumn-400 focus:outline-none dark:border-autumn-700 dark:bg-slate-900 dark:text-gray-100"
                    maxLength={6}
                  />
                  <Button onClick={handleJoinRoom} variant="outline">Join</Button>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Host creates a room, players join with code or QR.
              </p>
            </div>
          )}

          {isInMultiplayerRoom && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-600/40 dark:bg-emerald-950/20">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                  Room {multiplayerState.roomId}
                </h3>
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  className="text-xs text-emerald-700 underline dark:text-emerald-300"
                >
                  Leave
                </button>
              </div>
              <p className="mb-3 text-xs text-emerald-700 dark:text-emerald-300">
                Status: {multiplayerState.status}
              </p>
              <div className="mb-3 space-y-1">
                {multiplayerState.players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between rounded bg-white/80 px-2 py-1 text-xs dark:bg-slate-900/70">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {player.isHost ? '👑 ' : ''}{player.name}
                    </span>
                    <span className={player.ready ? 'text-emerald-600' : 'text-gray-500'}>
                      {player.ready ? 'Ready' : 'Not ready'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-3 rounded border border-emerald-300 bg-white p-2 text-xs dark:border-emerald-700 dark:bg-slate-900">
                <p className="mb-1 font-semibold text-gray-800 dark:text-gray-100">Join link</p>
                <p className="break-all text-gray-600 dark:text-gray-300">{controllerShareUrl}</p>
                <div className="mt-2 flex justify-end">
                  <Button
                    variant="outline"
                    className="text-xs"
                    onClick={() => navigator.clipboard.writeText(controllerShareUrl).catch(() => undefined)}
                  >
                    Copy Link
                  </Button>
                </div>
              </div>

              {controllerShareUrl && (
                <div className="mb-2 flex justify-center">
                  <img src={buildQrImageUrl(controllerShareUrl)} alt="Room QR code" className="h-36 w-36 rounded border border-emerald-300 bg-white p-1" />
                </div>
              )}
            </div>
          )}

          {isInMultiplayerRoom && multiplayerState.fallbackReason && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-600/40 dark:bg-amber-900/20">
              <h4 className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
                Manual Signaling Fallback
              </h4>
              <p className="mb-3 text-xs text-amber-700 dark:text-amber-300">
                {multiplayerState.fallbackReason}
              </p>

              {role === 'host' && (
                <div className="space-y-2">
                  {multiplayerState.manualOfferToken && (
                    <textarea
                      readOnly
                      value={multiplayerState.manualOfferToken}
                      className="h-24 w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs dark:border-amber-700 dark:bg-slate-900"
                    />
                  )}
                  {manualOfferJoinUrl && (
                    <p className="break-all text-xs text-amber-800 dark:text-amber-200">{manualOfferJoinUrl}</p>
                  )}
                  <textarea
                    value={manualAnswerInput}
                    onChange={(event) => setManualAnswerInput(event.target.value)}
                    placeholder="Paste answer token from controller"
                    className="h-24 w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs dark:border-amber-700 dark:bg-slate-900"
                  />
                  <Button onClick={handleApplyAnswerToken} variant="outline">Apply Answer Token</Button>
                </div>
              )}

              {role === 'controller' && (
                <div className="space-y-2">
                  <textarea
                    value={manualOfferInput}
                    onChange={(event) => setManualOfferInput(event.target.value)}
                    placeholder="Paste offer token from host"
                    className="h-24 w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs dark:border-amber-700 dark:bg-slate-900"
                  />
                  <Button onClick={handleApplyOfferToken} variant="outline">Apply Offer Token</Button>
                  {multiplayerState.manualAnswerToken && (
                    <textarea
                      readOnly
                      value={multiplayerState.manualAnswerToken}
                      className="h-24 w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs dark:border-amber-700 dark:bg-slate-900"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Start / Ready Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
            {isInMultiplayerRoom && role === 'controller' ? (
              <Button
                onClick={handleReadyToggle}
                className={`w-full font-bold py-4 lg:py-5 px-6 rounded-xl transition-all duration-200 shadow-lg mb-6 text-lg lg:text-xl ${
                  isSelfReady
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white'
                }`}
              >
                {isSelfReady ? 'Set Not Ready' : 'Set Ready'}
              </Button>
            ) : (
              <Button
                onClick={handleStartGame}
                disabled={isInMultiplayerRoom && role === 'host' && multiplayerState.players.length < 2}
                className="w-full bg-gradient-to-r from-autumn-500 to-rust-500 hover:from-autumn-600 hover:to-rust-600 text-white font-bold py-4 lg:py-5 px-6 rounded-xl transition-all duration-200 shadow-lg mb-6 text-lg lg:text-xl relative overflow-hidden disabled:opacity-50"
              >
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-xl"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ type: 'tween', duration: 0.6 }}
                />
                <span className="relative z-10">
                  {isInMultiplayerRoom ? 'Start Room Game' : t('intro.start_game')}
                </span>
              </Button>
            )}
          </motion.div>

          {/* Game-specific Options - Category Selection Toggle */}
          {features.categorySelection && (
            <motion.div 
              className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-sm`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="categorySelectionToggle" className="flex items-center cursor-pointer select-none">
                  <Switch
                    id="categorySelectionToggle"
                    checked={selectCategories}
                    onCheckedChange={handleToggleCategorySelection}
                    className="data-[state=checked]:bg-autumn-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600"
                  />
                  <span className="ml-3 font-medium text-gray-800 dark:text-gray-200">
                    {t('intro.select_categories')}
                  </span>
                </Label>
              </div>
              {selectCategories && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-gray-600 dark:text-gray-400 mt-2 leading-relaxed"
                >
                  Du kannst spezifische Kategorien für das Spiel auswählen.
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Game Mode Toggle - Enhanced NameBlame option */}
          {features.gameMode && (
            <motion.div
              className={`relative overflow-hidden rounded-xl p-4 mb-4 border-2 transition-all duration-300 shadow-lg ${
                gameMode 
                  ? `bg-amber-50 dark:bg-amber-900/25 border-amber-300 dark:border-amber-500 ring-2 ring-amber-200 dark:ring-amber-700/40` 
                  : `bg-white/95 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 hover:border-autumn-400 dark:hover:border-autumn-500`
              }`}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="relative flex items-center justify-between">
                <Label htmlFor="gameModeToggle" className="flex items-center cursor-pointer select-none flex-grow">
                  <Switch
                    id="gameModeToggle"
                    checked={gameMode}
                    onCheckedChange={handleToggleGameMode}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-autumn-500 data-[state=checked]:to-rust-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 shadow-lg"
                  />
                  <div className="ml-3 flex-grow">
                    <span className={`font-semibold text-base ${
                      gameMode 
                        ? 'text-amber-800 dark:text-amber-200' 
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {t('intro.name_blame_mode')}
                    </span>
                    {gameMode && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center mt-1"
                      >
                        <span className="text-xs bg-autumn-500 text-white px-2 py-0.5 rounded-full font-medium">
                          AKTIV
                        </span>
                      </motion.div>
                    )}
                  </div>
                </Label>
              </div>
              {gameMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mt-3 pt-3 border-t border-autumn-200 dark:border-autumn-700"
                >
                  <p className="text-sm text-autumn-700 dark:text-autumn-300 leading-relaxed">
                    {t('intro.name_blame_explanation')}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}


        </motion.div>
      </div>
  );
};

export default FrameworkIntroScreen;
