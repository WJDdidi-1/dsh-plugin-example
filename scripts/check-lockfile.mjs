#!/usr/bin/env node
/**
 * `npm ci` refuses to install when package.json and package-lock.json disagree,
 * but its failure message is npm's help text rather than the field that drifted.
 *
 * This check compares the parts npm uses to decide that they agree, so a
 * version bump without a regenerated lockfile fails with the file and the
 * dependency to fix. It is deliberately dependency-free: it must run before
 * `npm ci` has installed anything.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SECTIONS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function fail(message) {
  console.error(`lockfile check: ${message}`);
  process.exit(1);
}

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      fail(`${file} is missing; run npm install to create it.`);
    }
    fail(`${file} is not valid JSON: ${error.message}`);
  }
}

const pkg = readJson(join(root, 'package.json'));
const lock = readJson(join(root, 'package-lock.json'));

if (lock.lockfileVersion < 2 || !lock.packages || !lock.packages['']) {
  fail('package-lock.json has no packages[""] record (lockfileVersion 2 or newer); regenerate it with npm install.');
}

const recorded = lock.packages[''];
const problems = [];

for (const field of ['name', 'version']) {
  if (recorded[field] !== pkg[field]) {
    problems.push(
      `packages[""].${field} is ${JSON.stringify(recorded[field])}, `
      + `but package.json says ${JSON.stringify(pkg[field])}`,
    );
  }
}

for (const section of SECTIONS) {
  const expected = pkg[section] ?? {};
  const actual = recorded[section] ?? {};
  const names = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
  for (const name of names) {
    if (expected[name] !== actual[name]) {
      problems.push(
        `${section}.${name}: package.json says ${JSON.stringify(expected[name] ?? null)}, `
        + `but package-lock.json says ${JSON.stringify(actual[name] ?? null)}`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error('lockfile check: package.json and package-lock.json disagree:');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error('Run `npm install` and commit the updated package-lock.json.');
  process.exit(1);
}

console.log('lockfile check: package.json and package-lock.json agree');
