// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Retained published untyped JavaScript; native render boundary is separately typed.
// @ts-nocheck
/**
 * Light, client-reachable facade over the grammar engine in `./parseSource`.
 *
 * Importing this module must NOT pull `createStarryNight` (the regex engine:
 * vscode-textmate + oniguruma) or any grammar JSON into the bundle — the engine
 * is reached only through the dynamic `import()` in {@link ensureGrammars}. That
 * keeps `CodeHighlighter` (which drives lazy, per-language grammar loading from
 * the client chunk) free of the engine until a block actually needs to
 * highlight, mirroring the `./useCode/transformEngineCache` split.
 */

// Must match STARRY_NIGHT_KEY in ./parseSource. Duplicated intentionally to keep
// this module free of a static `./parseSource` import (which would pull the
// engine into every consumer's bundle).
const STARRY_NIGHT_KEY = '__docs_infra_starry_night_instance__';

// The narrow slice of the Starry Night instance this module reads synchronously.

function getInstance() {
  return globalThis[STARRY_NIGHT_KEY];
}

/**
 * Synchronously reports whether every given scope's grammar is already
 * registered. Reads the shared singleton without importing the engine, so it is
 * safe on the render path (e.g. a `useState` initializer) to decide whether a
 * block can highlight immediately or must wait — avoiding a cold flash.
 */
export function areGrammarsRegistered(scopes) {
  if (scopes.length === 0) {
    return true;
  }
  const instance = getInstance();
  if (!instance) {
    return false;
  }
  const registered = new Set(instance.scopes());
  return scopes.every(scope => registered.has(scope));
}

/**
 * Ensures the grammars for the given scopes (and their dependencies) are
 * registered, loading the engine and the per-scope grammar chunks on demand. A
 * synchronous no-op when the scopes are already registered (warm — e.g. a prior
 * block, the speculative preload, or an eager `CodeProvider` primed them), so it
 * is cheap to call on render or as a speculative preload. Fails open: a failed
 * load leaves the affected scope as plain text.
 */
export async function ensureGrammars(scopes) {
  if (scopes.length === 0 || areGrammarsRegistered(scopes)) {
    return;
  }
  // Cold: pull the engine + registration impl now (this is when a block is about
  // to highlight, so the engine load is expected and runs in parallel with the
  // content via the speculative preload).
  const {
    registerGrammars
  } = await import("./parseSource.mjs");
  await registerGrammars(scopes);
}

/**
 * Registers ALL grammars via the single barrel chunk (~146 KB gzip). Backs the
 * `preloadGrammars: 'all'` provider opt-in — for layouts that will render code
 * in many languages and prefer one upfront fetch over per-language chunks. Fails
 * open.
 */
export async function preloadAllGrammars() {
  const {
    registerAllGrammars
  } = await import("./parseSource.mjs");
  await registerAllGrammars();
}
