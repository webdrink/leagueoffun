/**
 * Spanish translations
 */
import { Translations } from './types';

const es: Translations = {
  // General app keys
  'app.title': 'Blame Game',
  'app.footer': '© 2025 Blame Game',
  'app.back': 'Atrás',
  'app.next': 'Siguiente',
  'app.save': 'Guardar',
  'app.cancel': 'Cancelar',
  'app.loading': 'Cargando...',
  
  // Intro screen
  'intro.start_game': 'Iniciar juego',
  'intro.player_setup': 'Configurar jugadores',
  'intro.settings': 'Configuración',
  'intro.info': 'Información',
  'intro.sound_toggle': 'Sonido',
  'intro.name_blame_toggle': 'Modo NameBlame',
  'intro.enable_debug': 'Activar modo debug',
  'intro.heading': '¿Quién haría qué?',
  'intro.subheading': '¿Qué piensas? ¿Quién sería más probable que...',
  'intro.error_loading_questions': 'Error al cargar preguntas:',
  'intro.error_check_files': 'Por favor revisa los archivos de preguntas e intenta de nuevo.',
  'intro.loading_questions': 'Cargando preguntas...',
  
  // Settings
  'settings.title': 'Configuración',
  'settings.language': 'Idioma / Language',
  'settings.sound': 'Sonido',
  'settings.volume': 'Volumen',
  'settings.animations': 'Animaciones',
  'settings.reset_data': 'Restablecer datos',
  
  // Player setup
  'players.setup_title': 'Configurar jugadores',
  'players.add_player': 'Añadir jugador',
  'players.player_name': 'Nombre del jugador',
  'players.player_name_input': 'Ingresa el nombre del jugador',
  'players.start_game': 'Iniciar juego',
  'players.back': 'Atrás',
  'players.max_players': '¡Número máximo de jugadores alcanzado!',
  'players.min_players': 'Se requieren al menos 3 jugadores',
  'players.name_required': 'Se requiere un nombre',
  'players.name_exists': 'El nombre ya existe',
  'players.remove': 'Eliminar',
  'players.remove_player': 'Eliminar jugador {name}',
  'players.add_players_to_start': 'Añade jugadores para empezar',
  'players.minimum_players_needed': 'Necesitas al menos 2 jugadores para empezar',

  // Game
  'game.question': 'Pregunta',
  'game.select_player': 'Selecciona un jugador',
  'game.next_question': 'Siguiente pregunta',
  'game.previous_question': 'Pregunta anterior',
  'game.progress': 'Pregunta {current} de {total}',
  'game.blame': 'Culpar',

  // Questions (Added, to be translated)
  'questions.player_turn': 'Tu turno', // Placeholder
  'questions.counter': 'Pregunta {current} de {total}', // Placeholder
  'questions.who_blame': '¿A quién culparías?', // Placeholder
  'questions.cannot_blame_self': 'No puedes culparte a ti mismo', // Placeholder
  'questions.blame_player': 'Culpar a {name}', // Placeholder
  'questions.previous_question': 'Pregunta anterior', // Placeholder (can be same as game.previous_question)
  'questions.next_question': 'Siguiente pregunta', // Placeholder (can be same as game.next_question)
  'questions.summary': 'Resumen', // Placeholder
  'questions.next': 'Siguiente', // Placeholder (can be same as app.next)
  'questions.show_summary': 'Mostrar resumen', // Placeholder
  
  // Summary
  'summary.title': '¡Juego terminado!',
  'summary.questions_answered': '¡Superaste {count} preguntas!',
  'summary.most_blamed': 'El más culpado',
  'summary.play_again': 'Jugar de nuevo',
  'summary.back_to_start': 'Volver al inicio',
  'summary.blame_stats': 'Estadísticas de culpa',
  'summary.no_stats': '¡No se distribuyeron acusaciones!',
  
  // Modal & Info Modal - Merged and clarified
  'modal.info_title': 'Información',
  'modal.info_description': 'Aquí podrían estar las instrucciones del juego, información de privacidad u otras notas.',
  'modal.reset_data_description': 'Actualmente, este modal se utiliza principalmente para restablecer los datos de la aplicación.',
  'modal.close': 'Cerrar',
  'modal.reset_app_data': 'Restablecer datos de la aplicación',
  
  'info.title': 'Instrucciones del Juego',
  'info.how_to_play': 'Cómo jugar a Blame Game',
  'info.name_blame_explanation': 'En el modo NameBlame, puedes culpar a otros jugadores',
  'info.confirm_reset': '¿Estás seguro de que quieres restablecer todos los datos de la aplicación?',

  // Debug panel
  'debug.panel_title': 'Panel de depuración',
  'debug.question_stats': 'Estadísticas de preguntas',
  'debug.total': 'Total',
  'debug.played': 'Jugadas',
  'debug.available': 'Disponibles',
  'debug.reset': 'Restablecer',
  'debug.reset_all_settings': 'Restablecer todas las configuraciones',
  'debug.reset_app_data': 'Restablecer datos de la aplicación',
  'debug.confirm_reset_data': '¿Estás seguro de que deseas restablecer TODOS los datos de la aplicación? Esto incluye configuraciones y preguntas jugadas.',
  'debug.title': 'Panel de Debug',
  'debug.settings': 'Ajustes',
  'debug.categories': 'Categorías',
  'debug.questions': 'Preguntas',
  'debug.animations': 'Animaciones',
  'debug.language': 'Idioma',
  'debug.reset_data': 'Restablecer Datos'
};

export default es;
