/**
 * Light-weight grammar metadata maps. These can be statically imported without
 * pulling in the heavy TextMate grammar JSON payloads (which live in
 * `./grammars.ts` and should be loaded via dynamic `import('./grammars')` so
 * the bundler can code-split them into their own chunk).
 */
export declare const extensionMap: Record<string, string>;
/**
 * Maps simplified language names back to grammar scope names.
 * Used when `language` prop is provided instead of fileName.
 */
export declare const languageToGrammarMap: Record<string, string>;
/**
 * Gets the grammar scope from a language name.
 * @param language - The language name (e.g., 'tsx', 'css', 'typescript')
 * @returns The grammar scope or undefined if not recognized
 */
export declare function getGrammarFromLanguage(language: string): string | undefined;
/**
 * Resolves a grammar scope from a file's name and/or explicit language,
 * preferring `language` and falling back to the file extension. This is the
 * single source of truth for how `parseSource` picks a grammar and how
 * `detectGrammarScopes` enumerates the grammars a code block needs, so the two
 * never disagree.
 *
 * @param fileName - File name used to detect language via its extension
 * @param language - Optional explicit language override (e.g., 'tsx', 'css')
 * @returns The grammar scope, or undefined for unsupported / unknown inputs
 */
export declare function resolveGrammarScope(fileName?: string, language?: string): string | undefined;
/**
 * Normalizes a user-supplied list (the `preloadGrammars` provider prop) to
 * grammar scope names, accepting either language names (`'tsx'`, `'typescript'`)
 * or scope names (`'source.tsx'`) and de-duplicating. Entries that match neither
 * are passed through as-is, so an unrecognized scope is simply ignored
 * downstream (it has no loader) rather than throwing.
 */
export declare function normalizeToScopes(entries: string[]): string[];