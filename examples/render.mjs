#!/usr/bin/env node
/**
 * Run the sidebar tab in Node, without the harness.
 *
 *   npm install
 *   npm run example
 *
 * `mountClient` is the dev-only helper the test uses. It boots a jsdom window,
 * loads `client.js` through the host's module loader, renders the pane the
 * plugin registered, and returns helpers that drive it the way a user would.
 * The test asserts on this; this file prints it.
 *
 * Point it at another bundle with:
 *
 *   npm run example -- path/to/client.js
 *
 * The bundle needs a `[data-testid="bump"]` button for the click below; drop
 * that block to run one without it.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { mountClient } from 'dsh-plugin-toolkit/testkit';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(process.argv[2] ?? path.join(here, '..', 'client.js'));
const shown = path.relative(process.cwd(), file) || file;

const panel = await mountClient({ file });
try {
  console.log(`mounted ${shown}`);
  console.log(`  ${panel.text()}`);

  await panel.click('[data-testid="bump"]');

  console.log('clicked [data-testid="bump"] once');
  console.log(`  ${panel.text()}`);
} finally {
  await panel.unmount();
}
