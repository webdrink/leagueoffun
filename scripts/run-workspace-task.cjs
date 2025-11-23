#!/usr/bin/env node
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
const fs = require('node:fs');

function usageAndExit(message) {
  if (message) {
    console.error(`[run-workspace-task] ${message}`);
  }
  console.error('Usage: node scripts/run-workspace-task.cjs <workspace-path> <script> [args...]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length < 2) {
  usageAndExit('Missing required arguments.');
}

const [workspaceRelPath, scriptName, ...scriptArgs] = args;
const workspacePath = resolve(__dirname, '..', workspaceRelPath);
const packageJsonPath = resolve(workspacePath, 'package.json');

if (!fs.existsSync(packageJsonPath)) {
  usageAndExit(`Workspace path "${workspaceRelPath}" is invalid or missing package.json.`);
}

const useNpm = process.env.CI === 'true' || process.env.USE_NPM === 'true' || process.env.USE_NPM === '1';
const manager = useNpm ? 'npm' : 'pnpm';
const result = spawnSync(manager, ['run', scriptName, ...scriptArgs], {
  cwd: workspacePath,
  stdio: 'inherit',
  shell: true,
});

if (result.error) {
  console.error(`[run-workspace-task] Failed to launch ${manager}:`, result.error.message);
}

process.exit(result.status ?? 1);
