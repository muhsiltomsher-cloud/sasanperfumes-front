/**
 * Build script that preserves old static chunks across deployments.
 *
 * Problem: Each `next build` generates new chunk hashes and deletes old ones.
 * Users with cached HTML pages reference old chunks that no longer exist → 404.
 *
 * Solution: Before building, back up the current .next/static directory.
 * After building, copy old chunk files back (without overwriting new ones).
 * This way both old and new chunks coexist, preventing 404s for cached pages.
 *
 * Old chunks are automatically cleaned up after 3 builds (configurable via
 * MAX_OLD_BUILDS) to prevent unbounded disk growth.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NEXT_DIR = path.join(ROOT, '.next');
const STATIC_DIR = path.join(NEXT_DIR, 'static');
const BACKUP_DIR = path.join(ROOT, '.next-static-backup');
const MANIFEST_FILE = path.join(BACKUP_DIR, 'builds.json');
const MAX_OLD_BUILDS = 3;

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (!fs.existsSync(destPath)) {
      // Only copy if file doesn't already exist (don't overwrite new chunks)
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDirRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Step 1: Back up current static directory if it exists
console.log('[build] Checking for existing static assets...');
const hasExistingBuild = fs.existsSync(STATIC_DIR);

if (hasExistingBuild) {
  console.log('[build] Backing up current static assets...');
  const buildId = Date.now().toString();
  const buildBackupDir = path.join(BACKUP_DIR, buildId);
  fs.mkdirSync(buildBackupDir, { recursive: true });
  copyDirRecursive(STATIC_DIR, buildBackupDir);

  // Update manifest
  let builds = [];
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      builds = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
    } catch (e) {
      builds = [];
    }
  }
  builds.push(buildId);

  // Clean up old builds beyond MAX_OLD_BUILDS
  while (builds.length > MAX_OLD_BUILDS) {
    const oldBuild = builds.shift();
    const oldDir = path.join(BACKUP_DIR, oldBuild);
    console.log(`[build] Cleaning up old build backup: ${oldBuild}`);
    removeDirRecursive(oldDir);
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(builds, null, 2));
  console.log(`[build] Backed up static assets (${builds.length} builds preserved)`);
} else {
  console.log('[build] No existing build found, skipping backup');
}

// Step 2: Run next build
console.log('[build] Running next build...');
try {
  execSync('npx next build --webpack', { stdio: 'inherit', cwd: ROOT });
} catch (e) {
  console.error('[build] Build failed!');
  process.exit(1);
}

// Step 3: Restore old chunks into the new build
if (fs.existsSync(BACKUP_DIR) && fs.existsSync(MANIFEST_FILE)) {
  let builds = [];
  try {
    builds = JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  } catch (e) {
    builds = [];
  }

  if (builds.length > 0) {
    console.log('[build] Restoring old static assets for backward compatibility...');
    for (const buildId of builds) {
      const buildBackupDir = path.join(BACKUP_DIR, buildId);
      if (fs.existsSync(buildBackupDir)) {
        copyDirRecursive(buildBackupDir, STATIC_DIR);
      }
    }
    console.log('[build] Old static assets restored successfully');
  }
}

console.log('[build] Build complete!');
