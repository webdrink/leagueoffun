// This script deploys the Blame Game to its GitHub Pages branch using gh-pages CLI
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const game = 'blamegame';
const distPath = path.join(__dirname, '../games', game, 'dist');
const cnamePath = path.join(distPath, 'CNAME');
const domain = `${game}.leagueoffun.de`;

// Ensure CNAME exists
if (!fs.existsSync(cnamePath)) {
  fs.writeFileSync(cnamePath, domain + '\n');
}

// Deploy using gh-pages
try {
  execSync(`npx gh-pages -d ${distPath} -b gh-pages-${game}`, { stdio: 'inherit' });
  console.log('Deployment successful!');
} catch (e) {
  console.error('Deployment failed:', e);
  process.exit(1);
}
