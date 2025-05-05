import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // since you're deploying to root domain like leagueoffun.de
  // No need for path/alias in this project for now
});
