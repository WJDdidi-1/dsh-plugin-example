# dsh-plugin-example

A DeepSeek Harness plugin in ~70 lines: one sidebar tab that says hello and counts clicks. It exists to be read, copied, and installed in one command.

```sh
dsh plugin add dsh-plugin-example
```

## What it shows

| Piece | Where | Why it is worth copying |
| --- | --- | --- |
| The bundle envelope | `client.js` first and last lines | A client plugin is one file calling `window.__ModuleLoader__.load({ id, factory })`. No bundler, no relative imports. |
| The tab | `apply()` → `sidebarRightTabs.register` | `kind` is what the tab is opened by; `title` is a **function**, because it is re-read when the language changes. |
| The body | `slots.register({ name: 'sidebar.right.pane.tab', key })` | The host injects the pane; you render its contents and inherit its theme. |
| Two languages | `COPY` + `ctx.locale.register` | Keys missing from one language fall back to the other, so a half-translated plugin still renders. |
| The host half | `index.js` | Empty here on purpose: a plugin with nothing to serve does not need routes. |

## Check it

```sh
npm run check
```

`check` runs `dsh-plugin verify .`: it packs the tarball, installs it, imports the
host half and mounts the panel **from the installed copy**. `doctor` reads the
working folder and would still pass if `files` forgot `client.js` — verify is the
one that notices. CI runs the same check through
`WJDdidi-1/dsh-plugin-toolkit@v1` with `version: latest`, so the pin below only
affects your own `npm test`.

## Test it

```sh
npm install
npm test
```

The one test mounts the real `client.js` in jsdom with the real React, through [`dsh-plugin-toolkit`](https://www.npmjs.com/package/dsh-plugin-toolkit):

```js
const panel = await mountClient({ file: 'client.js' });
assert.equal(panel.text(), 'Hello from a plugin');
await panel.click('[data-testid="bump"]');
assert.match(panel.text(), /Clicks: 1/);
```

That is the difference between "the bundle parses" and "the button works".

## Requirements

| | |
| --- | --- |
| Harness | `>=0.2.0` (the version that ships `sidebarRightTabs`) |
| Node | `>=18`, for the test only |
| Permissions | none: no network, no key, no telemetry |

## License

Apache-2.0.
