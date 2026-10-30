import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { mountClient } from 'dsh-plugin-toolkit/testkit';

const here = path.dirname(fileURLToPath(import.meta.url));

test('the tab says hello, and the button counts', async () => {
  const panel = await mountClient({ file: path.join(here, '..', 'client.js') });
  try {
    assert.match(panel.text(), /Hello from a plugin/);
    assert.match(panel.text(), /Clicks: 0/);
    await panel.click('[data-testid="bump"]');
    assert.match(panel.text(), /Clicks: 1/);
    await panel.click('[data-testid="bump"]');
    assert.match(panel.text(), /Clicks: 2/);
  } finally {
    await panel.unmount();
  }
});

test('the tab is registered under the kind the host opens it by', async () => {
  const panel = await mountClient({ file: path.join(here, '..', 'client.js') });
  try {
    const definition = panel.host.tabDefinition('dsh-plugin-example');
    assert.equal(definition.kind, 'example');
    assert.equal(definition.title(), 'Example');
  } finally {
    await panel.unmount();
  }
});
