#!/usr/bin/env node
const { spawnSync } = require('node:child_process');

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/run-monorepo-script.cjs <script-name> [extra-args...]');
  process.exit(1);
}

const [scriptName, ...extraArgs] = args;
const useNpm = process.env.CI === 'true' || process.env.USE_NPM === 'true' || process.env.USE_NPM === '1';
const manager = useNpm ? 'npm' : 'pnpm';

const managerArgs = useNpm
  ? ['run', scriptName, '--workspaces', '--if-present', ...extraArgs]
  : ['run', '-r', scriptName, '--if-present', ...extraArgs];

const result = spawnSync(manager, managerArgs, {
  stdio: 'inherit',
  shell: true,
});

if (result.error) {
  console.error(`[run-monorepo-script] Failed to launch ${manager}:`, result.error.message);
}

process.exit(result.status ?? 1);
