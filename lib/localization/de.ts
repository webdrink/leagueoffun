/**
 * German translations
 */
import { Translations } from './types';

const de: Translations = {
  // General app keys
  'app.title': 'Blame Game',
  'app.footer': '© 2025 Blame Game',
  'app.back': 'Zurück',
  'app.next': 'Weiter',
  'app.save': 'Speichern',
  'app.cancel': 'Abbrechen',
  'app.loading': 'Wird geladen...',
  
  // Intro screen
  'intro.start_game': 'Spiel starten',
  'intro.player_setup': 'Spieler einrichten',
  'intro.settings': 'Einstellungen',
  'intro.info': 'Info',
  'intro.sound_toggle': 'Sound',
  'intro.name_blame_toggle': 'NameBlame Modus',
  'intro.name_blame_explanation': 'Im NameBlame-Modus wird jede Frage nur einmal gezeigt. Der aktive Spieler wählt wen er beschuldigt. Der beschuldigte Spieler liest die Frage vor und wird zum nächsten aktiven Spieler.',
  'intro.enable_debug': 'Debug-Modus aktivieren',
  'intro.heading': 'Wem traust du was zu?',
  'intro.subheading': 'Was denkst du? Wer würde was tun?',
  'intro.error_loading_questions': 'Fehler beim Laden der Fragen:',
  'intro.error_check_files': 'Bitte überprüfe die Fragen-Datei und versuche es erneut.',
  'intro.loading_questions': 'Fragen werden geladen...',
  'intro.mainTitle': 'Wer würde was tun?',
  'intro.subTitle': 'Was denkst du? Wer würde am ehesten...',
  'intro.who_would': 'Wer würde am ehesten...',
  'intro.select_categories': 'Manuelle Kategorieauswahl',

  // Category pick screen
  'category_pick.title': 'Kategorien auswählen',
  'category_pick.confirm': 'Mit {{count}} Kategorien starten',
  'category_pick.back': 'Zurück',
  'category_pick.questions_available': '{{count}} Fragen',
  'category_pick.max_categories': 'Maximal {{count}} Kategorien',
  'category_pick.selected_count': '{{count}} ausgewählt',

  // Settings
  'settings.title': 'Einstellungen',
  'settings.language': 'Sprache',
  'settings.sound': 'Ton',
  'settings.volume': 'Lautstärke',
  'settings.animations': 'Animationen',
  'settings.reset_data': 'App-Daten zurücksetzen',

  // Player setup
  'players.setup_title': 'Spieler einrichten',
  'players.add_player': 'Spieler hinzufügen',
  'players.player_name': 'Spielername',
  'players.player_name_input': 'Spielername eingeben',
  'players.start_game': 'Spiel starten',
  'players.back': 'Zurück',
  'players.max_players': 'Maximale Spieleranzahl erreicht!',
  'players.min_players': 'Mindestens 3 Spieler erforderlich',
  'players.min_players_nameblame_hint': 'Du brauchst mindestens 3 Spieler für den NameBlame Modus.',
  'players.name_required': 'Name erforderlich',
  'players.name_exists': 'Name existiert bereits',
  'players.remove': 'Entfernen',
  'players.remove_player': 'Spieler {name} entfernen',
  'players.add_players_to_start': 'Füge Spieler hinzu, um zu starten',
  'players.minimum_players_needed': 'Du brauchst mindestens 2 Spieler, um zu starten',
  
  // Loading screen
  'loading.defaultQuote': 'Wird geladen...',
  'loading.preparing': 'Vorbereitung läuft...',
  
  // Game
  'game.question': 'Frage',
  'game.select_player': 'Wähle einen Spieler',
  'game.next_question': 'Nächste Frage',
  'game.previous_question': 'Vorherige Frage',
  'game.progress': 'Frage {current} von {total}',
  'game.blame': 'Schuld geben',
  'game.summary': 'Zusammenfassung',
  'game.play_again': 'Nochmal spielen',

  // Questions (Added missing keys with German placeholders)
  'questions.player_turn': 'Dein Zug',
  'questions.counter': 'Frage {{current}} von {{total}}',
  'questions.who_blame': 'Wen beschuldigst du?',
  'questions.cannot_blame_self': 'Du kannst dich nicht selbst beschuldigen',
  'questions.blame_player': 'Beschuldige {{name}}',
  'questions.blamed_you_for': '{{name}} hat dich beschuldigt für',
  'questions.next_blame': 'Weiter',
  'questions.previous_question': 'Vorherige Frage',
  'questions.next_question': 'Nächste Frage',
  'questions.summary': 'Zusammenfassung',
  'questions.next': 'Weiter',
  'questions.show_summary': 'Zusammenfassung anzeigen',
  
  // Summary
  'summary.title': 'Spiel vorbei!',
  'summary.game_over': 'Spiel vorbei!',
  'summary.questions_answered': 'Ihr habt {count} Fragen gemeistert!',
  'summary.questions_completed': 'Ihr habt {count} Fragen gemeistert!',
  'summary.most_blamed': 'Meistbeschuldigter',
  'summary.most_blamed_singular': 'Meistbeschuldigter',
  'summary.most_blamed_plural': 'Meistbeschuldigte',
  'summary.blame_count': '{count} Beschuldigung{s}',
  'summary.plural_suffix': 'en',
  'summary.no_blames_given': 'Keine Beschuldigungen verteilt!',
  'summary.team_round': 'Team-Runde',
  'summary.team_message': 'Super gemacht, Team! {activePlayersCount} Spieler waren dabei.',
  'summary.new_game': 'Neues Spiel starten',
  'summary.play_again': 'Neues Spiel starten',
  'summary.back_to_start': 'Zurück zum Start',
  'summary.blame_stats': 'Blame-Statistik',
  'summary.no_stats': 'Keine Beschuldigungen verteilt!',
  
  // Blame notifications
  'blame.notification_title': 'Beschuldigung aufgezeichnet!',
  'blame.blamed_player_for': 'beschuldigte',
  'blame.notification_for_blamed': 'Du wurdest von {{blamer}} beschuldigt!',
  'blame.continue_to_next': 'Weiter zum nächsten Spieler',
  'blame.continue_to_question': 'Weiter zur nächsten Frage',
  'blame.round_complete': 'Alle Spieler haben beschuldigt - weiter zur nächsten Frage',
  'blame.already_blamed_this_round': '{player} hat bereits in dieser Runde beschuldigt',
  
  // Modal
  'modal.info_title': 'Information',
  'modal.info_description': 'Das Spielprinzip ist einfach: Du gibst der Person das Handy, welche am besten zur Frage passt. Die Person liest ihre Frage vor, erklärt sich oder gibt das Handy schnell mit der nächsten Karte weiter.',
  'modal.reset_data_description': 'Aktuell dient diese Seite hauptsächlich zum Zurücksetzen der App-Daten. \nMade with ❤️ by bziuk.com.',
  'modal.close': 'Schließen',
  'modal.reset_app_data': 'App-Daten zurücksetzen',

  // Info section/modal (Added missing keys with German placeholders)
  'info.title': 'Spielanleitung',
  'info.how_to_play': 'So spielt man Blame Game',
  'info.name_blame_explanation': 'Im NameBlame-Modus kannst du andere Spieler beschuldigen',
  'info.confirm_reset': 'Bist du sicher, dass du alle App-Daten zurücksetzen möchtest?',

  // Debug panel (Added missing keys with German placeholders)
  'debug.panel_title': 'Debug Panel',
  'debug.title': 'Debug Panel Titel',
  'debug.question_stats': 'Fragen-Statistik',
  'debug.total': 'Gesamt',
  'debug.played': 'Gespielt',
  'debug.available': 'Verfügbar',
  'debug.categories': 'Kategorien',
  'debug.reset': 'Zurücksetzen',
  'debug.reset_all_settings': 'Alle Einstellungen zurücksetzen',
  'debug.reset_app_data': 'App-Daten zurücksetzen',
  'debug.confirm_reset_data': 'Bist du sicher, dass du ALLE App-Daten zurücksetzen möchtest? Dies umfasst Einstellungen und gespielte Fragen.',
  'debug.settings': 'Einstellungen (Debug)',
  'debug.questions': 'Fragen (Debug)',
  'debug.animations': 'Animationen (Debug)',
  'debug.language': 'Sprache (Debug)',
  'debug.reset_data': 'Daten zurücksetzen (Debug)',

  // Additional keys
  'startGame': 'Spiel starten',
  'error.loadQuestions': 'Fehler beim Laden der Fragen. Bitte überprüfen Sie die Fragendateien und versuchen Sie es erneut.',
  'loadingQuestions': 'Fragen werden geladen...',
  'error.noQuestionsLoaded': 'Keine Fragen geladen. Bitte überprüfen Sie die Fragendateien und versuchen Sie es erneut.'
};

export default de;
