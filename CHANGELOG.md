## 0.1.7

- `dsh-plugin-toolkit` → `^0.22.0`, tracking the current published toolkit.
  It is a dev-only dependency used by the test and the example, so the shipped
  `client.js` and `index.js` are unchanged.
- `npm run check:lockfile` now runs `npm run lockfile:refresh` itself before
  comparing, replacing the implicit `precheck:lockfile` lifecycle hook from
  0.1.6. The refresh is visible in the script that needs it, and
  `npm run lockfile:refresh` remains available on its own. This is the same
  refresh-then-check behaviour, not a drift detector: `npm ci` (and the publish
  workflow) is what fails on a stale committed lockfile.

## 0.1.6

- `dsh-plugin-toolkit` → `^0.21.0`, tracking the current published toolkit.
  It is a dev-only dependency used by the test and the example, so the shipped
  `client.js` and `index.js` are unchanged.
- `npm run check:lockfile` now refreshes `package-lock.json` from `package.json`
  first through a `precheck:lockfile` step, so bumping a pin no longer fails the
  check just because the lockfile was not regenerated in the same commit.

## 0.1.5

- Added `examples/render.mjs` and `npm run example`: the real `client.js` mounts
  in Node through `dsh-plugin-toolkit/testkit`, prints what the host would
  render, clicks the button once, and prints again. Point it at another bundle
  with `npm run example -- path/to/client.js`. The example is in the package
  `files` list, so the published tarball now ships it.
- README documents the runnable example and answers the questions a first-time
  reader asks (build step, missing tab, click count, custom bundle, network).
- The publish workflow now refuses to ship a tag until every CI job on that
  commit is green; publishing itself still goes through OIDC with provenance.

## 0.1.4

- Added `npm run check:lockfile`: it compares `package.json` with
  `package-lock.json` and names the field that drifted before `npm ci` runs, so
  a release that forgets the lockfile fails with the file to fix instead of
  npm's help text. CI now runs it before installing.

## 0.1.3

- `dsh-plugin-toolkit` → `^0.20.9`, so the dev-only toolkit is current with the
  published release.

## 0.1.2

- `dsh-plugin-toolkit` → `^0.8.3`. The pin had drifted two minor versions behind,
  which is the same way the scaffold drifted.
- `npm run check` is now `dsh-plugin verify .` — the check that notices a tarball
  missing its panel.
- README documents what `check` does and why it is not `doctor`.

# Changelog

## 0.1.0

- First release: one sidebar tab, two languages, one behaviour test.
