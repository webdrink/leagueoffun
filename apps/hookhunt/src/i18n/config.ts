import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import de from './locales/de.json';

const es = {
  game: { subtitle: '¡Adivina el gancho de la canción! 🎵' },
  screens: {
    intro: { title: 'Bienvenido a HookHunt', description: 'Prueba tus conocimientos musicales identificando canciones por sus ganchos icónicos.', singleplayer: 'Jugar Solo', hotSeat: 'Hot Seat (Pasen el Control)' },
    playerSetup: { title: 'Ingresa los nombres de los jugadores', addPlayer: 'Añadir jugador', placeholder: 'Jugador {{number}}', continue: 'Continuar', back: 'Atrás' },
    playlistSelect: { title: 'Elige tu playlist', loginSpotify: 'Conectar Spotify', yourPlaylists: 'Tus Playlists', curated: 'Colecciones Seleccionadas', search: 'Buscar Spotify', searchPlaceholder: 'Buscar playlists', select: 'Seleccionar', back: 'Atrás' },
    gameplay: { title: '¡Adivina la canción!', guessPlaceholder: 'Ingresa título, artista o década (ej. 90s)', submit: 'Enviar', skip: 'Saltar', currentPlayer: 'Jugador actual: {{name}}', score: 'Puntos: {{score}}', next: 'Siguiente' },
    summary: { title: '¡Juego terminado!', winner: '¡{{name}} gana!', playAgain: 'Jugar de nuevo', backToHub: 'Volver a League of Fun' }
  },
  footer: { enable_animations: 'Habilitar animaciones', disable_animations: 'Desactivar animaciones', settings: 'Configuración', dark_mode: 'Modo oscuro', light_mode: 'Modo claro', support_message: '¡Apóyanos para desbloquear más juegos!', donation_message: 'Tu donación nos ayuda a crear mejores juegos.' }
};

const fr = {
  game: { subtitle: 'Devinez le meilleur hit du hook ! 🎵' },
  screens: {
    intro: { title: 'Bienvenue à HookHunt', description: 'Testez vos connaissances musicales en identifiant des chansons par leurs crochets iconiques.', singleplayer: 'Jouer seul', hotSeat: 'Hot Seat (Passe le contrôle)' },
    playerSetup: { title: 'Entrez les noms des joueurs', addPlayer: 'Ajouter un joueur', placeholder: 'Joueur {{number}}', continue: 'Continuer', back: 'Retour' },
    playlistSelect: { title: 'Choisissez votre playlist', loginSpotify: 'Connecter Spotify', yourPlaylists: 'Vos playlists', curated: 'Collections sélectionnées', search: 'Rechercher Spotify', searchPlaceholder: 'Recherchez des playlists', select: 'Sélectionner', back: 'Retour' },
    gameplay: { title: 'Devinez la chanson !', guessPlaceholder: 'Entrez le titre, l\'artiste ou la décennie (ex. 90s)', submit: 'Soumettre', skip: 'Passer', currentPlayer: 'Joueur actuel : {{name}}', score: 'Points : {{score}}', next: 'Suivant' },
    summary: { title: 'Fin du jeu !', winner: '{{name}} gagne !', playAgain: 'Rejouer', backToHub: 'Retour à League of Fun' }
  },
  footer: { enable_animations: 'Activer les animations', disable_animations: 'Désactiver les animations', settings: 'Paramètres', dark_mode: 'Mode sombre', light_mode: 'Mode clair', support_message: 'Soutenez-nous pour débloquer plus de jeux !', donation_message: 'Votre don nous aide à créer de meilleurs jeux.' }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { 
      en: { translation: en }, 
      de: { translation: de },
      es: { translation: es },
      fr: { translation: fr }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
