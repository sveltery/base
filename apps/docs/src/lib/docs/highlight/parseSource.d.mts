import type { ParseSource } from "./types.js";
/**
 * Parses source into a line-guttered HAST **without** syntax highlighting — the
 * raw text wrapped in the same `.line`/`.frame` structure `parseSource` produces,
 * just no starry-night tokenization. It is a `ParseSource` so it can be dropped
 * into the loader in place of the highlighting parser.
 *
 * Used for the deferred (un-highlighted) fallback: the enhancer pipeline needs the
 * line/frame structure to compute focus windows and truncation, but the syntax
 * colors are exactly the part being deferred — so we skip them. Cheap (no grammar,
 * no `getInstance`); the frames it produces collapse back to text via `buildRootFallback`.
 *
 * Takes only `source` (it ignores file name / language since it never highlights) but
 * stays structurally assignable to `ParseSource`, so it drops into the loader in place
 * of the highlighting parser.
 */
export declare const parsePlainText: (source: string) => ReturnType<ParseSource>;
/**
 * Parses source code into a HAST tree with syntax highlighting.
 *
 * @param source - The source code to parse and highlight
 * @param fileName - File name used to detect language via file extension
 * @param language - Optional explicit language override (e.g., 'tsx', 'css', 'typescript')
 * @returns HAST Root node containing highlighted code structure with line gutters
 * @throws Error if `createParseSource()` has not been called first
 */
export declare const parseSource: ParseSource;
/**
 * Registers the grammars for the given scopes (and their dependencies) on the
 * global Starry Night instance, loading the per-scope chunks on demand.
 * Idempotent and deduped. Fails open: a chunk that fails to load leaves its
 * scope as plain text rather than rejecting the batch.
 *
 * This is the heavy implementation (it can create the engine instance). Client
 * code should call the light facade {@link ensureGrammars} from `./grammarCache`
 * instead, so the engine stays out of the client bundle until a block needs it.
 */
export declare function registerGrammars(scopes: string[]): Promise<void>;
export declare function registerAllGrammars(): Promise<void>;
/**
 * Initializes Starry Night and returns a configured `parseSource` function.
 * Only needs to be called once per application; the instance is stored globally
 * for reuse across calls.
 *
 * With no `initialScopes`, loads ALL grammars via the (lazy) `./grammars` barrel
 * — the eager `CodeProvider` / Node / build-time behavior, so the heavy TextMate
 * JSON is split into its own chunk but fully available. Pass `initialScopes`
 * (possibly `[]`) to create a lean instance that registers grammars on demand
 * via {@link registerGrammars} — the `CodeProviderLazy` per-language path.
 *
 * @returns A Promise that resolves to the initialized `parseSource` function
 */
export declare const createParseSource: (initialScopes?: string[]) => Promise<ParseSource>;
/**
 * Clears the global Starry Night singleton and registration state. Intended for
 * tests exercising lazy registration from a known-empty registry.
 */
export declare function resetStarryNight(): void;