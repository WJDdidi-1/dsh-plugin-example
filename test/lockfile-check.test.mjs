import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function fixture(drift) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'example-lockfile-'));
  mkdirSync(path.join(dir, 'scripts'));
  copyFileSync(
    path.join(root, 'scripts', 'check-lockfile.mjs'),
    path.join(dir, 'scripts', 'check-lockfile.mjs'),
  );
  copyFileSync(path.join(root, 'package-lock.json'), path.join(dir, 'package-lock.json'));
  const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  if (drift) pkg.devDependencies['dsh-plugin-toolkit'] = '^0.22.1';
  writeFileSync(path.join(dir, 'package.json'), `${JSON.stringify(pkg, null, 2)}\n`);
  return dir;
}

function runPublicCheck(dir) {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return spawnSync(npm, ['run', 'check:lockfile', '--silent'], {
    cwd: dir, encoding: 'utf8', shell: process.platform === 'win32',
  });
}

test('the public lockfile check passes on the committed files', () => {
  const dir = fixture(false);
  try {
    const result = runPublicCheck(dir);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(`${result.stdout}${result.stderr}`, /agree/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a stale lockfile fails and neither file is rewritten by the check', () => {
  const dir = fixture(true);
  try {
    const pkg = path.join(dir, 'package.json');
    const lock = path.join(dir, 'package-lock.json');
    const before = [sha256(pkg), sha256(lock)];

    const result = runPublicCheck(dir);

    assert.notEqual(result.status, 0, 'a drifted lockfile must fail the check');
    assert.match(`${result.stderr}${result.stdout}`, /disagree/);
    assert.deepEqual(
      [sha256(pkg), sha256(lock)],
      before,
      'the check must not repair the files it verifies',
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
