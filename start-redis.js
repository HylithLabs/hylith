const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const REDIS_DIR = path.join(__dirname, '.redis');
const MEMURAI_EXE = path.join(REDIS_DIR, 'memurai.exe');
const DOWNLOAD_URL = 'https://www.memurai.com/get-memurai';
const PORT = 6379;

// Try to find any redis-server or memurai already on PATH
function findExistingRedis() {
  try {
    const where = execSync('where redis-server 2>nul || where memurai 2>nul', { encoding: 'utf8' }).trim();
    if (where) return where.split('\n')[0].trim();
  } catch {}
  return null;
}

// Check if port is already in use (Redis already running)
function isPortInUse(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const s = new net.Socket();
    s.setTimeout(1000);
    s.on('connect', () => { s.destroy(); resolve(true); });
    s.on('timeout', () => { s.destroy(); resolve(false); });
    s.on('error', () => { s.destroy(); resolve(false); });
    s.connect(port, '127.0.0.1');
  });
}

function startRedis(exePath) {
  console.log(`Starting Redis from: ${exePath}`);
  const child = spawn(exePath, ['--port', String(PORT), '--save', '', '--appendonly', 'no'], {
    stdio: 'inherit',
  });
  child.on('error', (err) => {
    console.error('Failed to start Redis:', err.message);
    process.exit(1);
  });
  child.on('exit', (code) => {
    console.log(`Redis exited with code ${code}`);
    process.exit(code || 0);
  });
  process.on('SIGINT', () => child.kill());
  process.on('SIGTERM', () => child.kill());
}

async function run() {
  // 1. Check if Redis is already running
  if (await isPortInUse(PORT)) {
    console.log(`✓ Redis is already running on port ${PORT}`);
    return;
  }

  // 2. Check for existing redis on PATH
  const existing = findExistingRedis();
  if (existing) {
    startRedis(existing);
    return;
  }

  // 3. Check for previously downloaded binary
  if (fs.existsSync(MEMURAI_EXE)) {
    startRedis(MEMURAI_EXE);
    return;
  }

  // 4. No Redis found — give clear instructions
  console.error('');
  console.error('═══════════════════════════════════════════════════════');
  console.error('  Redis is not installed and not running on port 6379');
  console.error('═══════════════════════════════════════════════════════');
  console.error('');
  console.error('  Install Redis using ONE of these options:');
  console.error('');
  console.error('  Option 1 — WSL (recommended for Windows):');
  console.error('    wsl --install -d Ubuntu');
  console.error('    # Then in WSL:');
  console.error('    sudo apt update && sudo apt install redis-server -y');
  console.error('    sudo service redis-server start');
  console.error('');
  console.error('  Option 2 — Docker:');
  console.error('    docker run -d --name redis -p 6379:6379 redis:alpine');
  console.error('');
  console.error('  Option 3 — Memurai (native Windows):');
  console.error('    Download from https://www.memurai.com/get-memurai');
  console.error('    Install it, then run this script again.');
  console.error('');
  console.error('  Option 4 — Scoop:');
  console.error('    scoop install redis');
  console.error('    redis-server');
  console.error('');
  console.error('═══════════════════════════════════════════════════════');
  process.exit(1);
}

run().catch(console.error);
