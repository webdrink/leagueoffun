/**
 * French translations
 */
import { Translations } from './types';

const fr: Translations = {
  // General app keys
  'app.title': 'Blame Game',
  'app.footer': '© 2025 Blame Game',
  'app.back': 'Retour',
  'app.next': 'Suivant',
  'app.save': 'Enregistrer',
  'app.cancel': 'Annuler',
  'app.loading': 'Chargement...',
  
  // Intro screen
  'intro.start_game': 'Commencer le jeu',
  'intro.player_setup': 'Configuration des joueurs',
  'intro.settings': 'Paramètres',
  'intro.info': 'Informations',
  'intro.sound_toggle': 'Son',
  'intro.name_blame_toggle': 'Mode NameBlame',
  'intro.enable_debug': 'Activer le mode débogage',
  'intro.heading': 'Qui ferait quoi?',
  'intro.subheading': 'Qu\'en penses-tu? Qui serait le plus susceptible de...',
  'intro.error_loading_questions': 'Erreur lors du chargement des questions:',
  'intro.error_check_files': 'Veuillez vérifier les fichiers de questions et réessayer.',
  'intro.loading_questions': 'Chargement des questions...',
  'intro.who_would': 'Qui serait le plus susceptible de...',
  
  // Errors
  'error.loadQuestions': 'Erreur lors du chargement des questions. Veuillez vérifier les fichiers de questions et réessayer.',
  'error.noQuestionsLoaded': 'Aucune question chargée. Veuillez vérifier les fichiers de questions et réessayer.',
  
  // Settings
  'settings.title': 'Paramètres',
  'settings.language': 'Langue',
  'settings.sound': 'Son',
  'settings.volume': 'Volume',
  'settings.animations': 'Animations',
  'settings.reset_data': 'Réinitialiser les données',
  // Dynamic UI groups
  'settings.group.content': 'Contenu',
  'settings.group.behavior': 'Comportement',
  'settings.group.experience': 'Expérience',
  'settings.group.general': 'Général',
  'settings.no_dynamic_fields': 'Aucun paramètre dynamique défini. Utilisation des valeurs par défaut.',
  
  // Season/Theme selector
  'season.title': 'Thème',
  'season.auto': 'Auto (Saison Actuelle)',
  'season.auto_desc': 'Suit la vraie saison',
  'season.fall': '🍂 Automne',
  'season.fall_desc': 'Couleurs chaudes d\'automne',
  'season.winter': '❄️ Hiver',
  'season.winter_desc': 'Bleus glacés',
  'season.spring': '🌸 Printemps',
  'season.spring_desc': 'Verts pastels frais',
  'season.summer': '☀️ Été',
  'season.summer_desc': 'Soleil brillant',
  'season.cyber': '⚡ Cyber',
  'season.cyber_desc': 'Thème matrix geek',

  // FAQ
  'faq.title': 'Questions Fréquemment Posées',
  'faq.how_to_play': 'Comment jouer au jeu?',
  'faq.how_to_play_answer': 'Commencez par ajouter au moins 2 joueurs. Répondez ensuite aux questions sur qui serait le plus susceptible de faire certaines choses. En mode NameBlame, le joueur actif sélectionne quelqu\'un à blâmer, et cette personne devient le prochain joueur actif.',
  'faq.what_is_nameblame': 'Qu\'est-ce que le mode NameBlame?',
  'faq.what_is_nameblame_answer': 'NameBlame est un mode de jeu spécial où chaque question est affichée une fois. Le joueur actif sélectionne qui blâmer. Le joueur blâmé lit la question à voix haute et devient le prochain joueur actif.',
  'faq.how_to_change_language': 'Comment changer la langue?',
  'faq.how_to_change_language_answer': 'Cliquez sur le sélecteur de langue dans le pied de page pour choisir votre langue préférée parmi l\'anglais, l\'allemand, l\'espagnol ou le français.',
  'faq.how_to_change_theme': 'Comment changer le thème?',
  'faq.how_to_change_theme_answer': 'Allez dans Paramètres et utilisez le sélecteur de Thème pour choisir parmi les thèmes Automne, Hiver, Printemps, Été ou Cyber. Vous pouvez également le régler sur Auto pour suivre la saison actuelle.',
  'faq.reset_data': 'Comment réinitialiser les données de l\'application?',
  'faq.reset_data_answer': 'Cliquez sur le bouton "Réinitialiser les données" ci-dessous pour effacer toutes les données stockées, y compris les paramètres, les noms des joueurs et l\'historique des jeux. Cette action ne peut pas être annulée.',
  
  // Player setup
  'players.setup_title': 'Configuration des joueurs',
  'players.add_player': 'Ajouter un joueur',
  'players.player_name': 'Nom du joueur',
  'players.player_name_input': 'Saisir le nom du joueur',
  'players.start_game': 'Démarrer le jeu',
  'players.back': 'Retour',
  'players.max_players': 'Nombre maximum de joueurs atteint!',
  'players.min_players': 'Au moins 3 joueurs sont nécessaires',
  'players.min_players_nameblame_hint': 'Vous avez besoin d\'au moins 3 joueurs pour le mode NameBlame.',
  'players.name_required': 'Nom requis',
  'players.name_exists': 'Le nom existe déjà',
  'players.remove': 'Supprimer',
  'players.remove_player': 'Supprimer le joueur {name}',
  'players.add_players_to_start': 'Ajoutez des joueurs pour commencer',
  'players.minimum_players_needed': 'Vous avez besoin d\'au moins 2 joueurs pour commencer',
  
  // Game
  'game.question': 'Question',
  'game.select_player': 'Sélectionner un joueur',
  'game.next_question': 'Question suivante',
  'game.previous_question': 'Question précédente',
  'game.progress': 'Question {current} sur {total}',
  'game.blame': 'Blâmer',
  'game.summary': 'Résumé',
  'game.play_again': 'Rejouer',

  // Questions
  'questions.player_turn': 'À ton tour',
  'questions.counter': 'Question {{current}} sur {{total}}',
  'questions.who_blame': 'Qui blâmerais-tu?',
  'questions.cannot_blame_self': 'Tu ne peux pas te blâmer toi-même',
  'questions.blame_player': 'Blâmer {{name}}',
  'questions.blamed_you_for': '{{name}} t\'a blâmé pour',
  'questions.next_blame': 'Suivant',
  'questions.previous_question': 'Question précédente',
  'questions.next_question': 'Question suivante',
  'questions.summary': 'Résumé',
  'questions.next': 'Suivant',
  'questions.show_summary': 'Afficher le résumé',

  // NameBlame specific
  'question.blame_revealed': 'Blâme Révélé!',
  'question.was_blamed': 'a été blâmé',
  'question.select_player': 'Sélectionner un joueur',
  'question.progress': 'Question {{current}} de {{total}}',
  'question.view_results': 'Voir les Résultats',
  'question.next_question': 'Question Suivante',
  
  // Summary
  'summary.title': 'Partie terminée!',
  'summary.game_over': 'Partie terminée!',
  'summary.questions_answered': 'Vous avez répondu à {count} questions!',
  'summary.questions_completed': 'Vous avez répondu à {count} questions!',
  'summary.most_blamed': 'Le plus blâmé',
  'summary.most_blamed_singular': 'Le plus blâmé',
  'summary.most_blamed_plural': 'Les plus blâmés',
  'summary.blame_count': '{{count}} blâme{{s}}',
  'summary.plural_suffix': 's',
  'summary.no_blames_given': 'Aucune accusation distribuée!',
  'summary.team_round': 'Tour d\'équipe',
  'summary.team_message': 'Bon travail, équipe! {{activePlayersCount}} joueurs ont participé.',
  'summary.new_game': 'Nouveau jeu',
  'summary.play_again': 'Rejouer',
  'summary.back_to_start': 'Retour au début',
  'summary.blame_stats': 'Statistiques de blâme',
  'summary.no_stats': 'Aucune accusation distribuée!',
  
  // Blame notifications
  'blame.notification_title': 'Accusation enregistrée!',
  'blame.blamed_player_for': 'a accusé',
  'blame.notification_for_blamed': 'Vous avez été accusé par {{blamer}}!',
  'blame.continue_to_next': 'Continuer au joueur suivant',
  'blame.continue_to_question': 'Continuer à la question suivante',
  'blame.round_complete': 'Tous les joueurs ont accusé - passage à la question suivante',
  'blame.already_blamed_this_round': '{player} a déjà accusé dans ce tour',
  
  // Modal
  'modal.info_title': 'Informations',
  'modal.info_description': 'Ici pourraient figurer les instructions du jeu, les informations de confidentialité ou d\'autres notes.',
  'modal.reset_data_description': 'Actuellement, cette fenêtre est principalement utilisée pour réinitialiser les données de l\'application.',
  'modal.close': 'Fermer',
  'modal.reset_app_data': 'Réinitialiser les données de l\'application.',
  
  // Info
  'info.title': 'Instructions du Jeu',
  'info.how_to_play': 'Comment jouer à Blame Game',
  'info.name_blame_explanation': 'En mode NameBlame, vous pouvez blâmer d\'autres joueurs',
  'info.confirm_reset': 'Êtes-vous sûr de vouloir réinitialiser toutes les données de l\'application?',
  
  // Debug panel
  'debug.panel_title': 'Panneau de débogage',
  'debug.question_stats': 'Statistiques des questions',
  'debug.total': 'Total',
  'debug.played': 'Jouées',
  'debug.available': 'Disponibles',
  'debug.categories': 'Catégories',
  'debug.reset': 'Réinitialiser',
  'debug.reset_all_settings': 'Réinitialiser tous les paramètres',
  'debug.reset_app_data': 'Réinitialiser les données de l\'application',
  'debug.confirm_reset_data': 'Êtes-vous sûr de vouloir réinitialiser TOUTES les données de l\'application? Cela inclut les paramètres et les questions jouées.',
  'debug.title': 'Panel de Debug',
  'debug.settings': 'Paramètres',
  'debug.questions': 'Questions',
  'debug.animations': 'Animations',
  'debug.language': 'Langue',
  'debug.reset_data': 'Réinitialiser les Données',

  // Footer
  'footer.support_message': 'Soutenez-nous pour plus de jeux !',
  'footer.donate_message': 'Votre don nous aide à créer de meilleurs jeux.'
};

export default fr;
