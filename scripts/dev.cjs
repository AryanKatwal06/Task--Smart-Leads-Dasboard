const { spawn } = require('child_process');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const nodeCommand = process.execPath;
const viteCli = path.join(workspaceRoot, 'node_modules', 'vite', 'bin', 'vite.js');
const tsNodeDevCli = path.join(workspaceRoot, 'node_modules', 'ts-node-dev', 'lib', 'bin.js');

const processes = [
  spawn(nodeCommand, [viteCli], {
    cwd: path.join(workspaceRoot, 'client'),
    stdio: 'inherit',
    shell: false,
  }),
  spawn(nodeCommand, [tsNodeDevCli, '--respawn', '--transpile-only', 'src/index.ts'], {
    cwd: path.join(workspaceRoot, 'server'),
    stdio: 'inherit',
    shell: false,
  }),
];

let shuttingDown = false;

function shutdown(code = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const childProcess of processes) {
    if (!childProcess.killed) {
      childProcess.kill();
    }
  }

  process.exit(code);
}

for (const childProcess of processes) {
  childProcess.on('error', (error) => {
    console.error(error);
    shutdown(1);
  });

  childProcess.on('exit', (code, signal) => {
    if (shuttingDown) {
      return;
    }

    if (signal) {
      shutdown(0);
      return;
    }

    if (typeof code === 'number' && code !== 0) {
      shutdown(code);
    }
  });
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
