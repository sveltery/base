// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Retained published untyped JavaScript; native render boundary is separately typed.
// @ts-nocheck
/**
 * Heavy TextMate grammar payloads. Importing this module pulls in hundreds of
 * KB of JSON. Prefer `await import('./grammars')` so bundlers can code-split
 * it into its own chunk.
 *
 * Lightweight extension/language maps live in `./grammarMaps.ts`.
 */

import sourceSvelte from '@wooorm/starry-night/source.svelte';
import sourceJs from '@wooorm/starry-night/source.js';
import sourceTs from '@wooorm/starry-night/source.ts';
import sourceTsx from '@wooorm/starry-night/source.tsx';
import textMd from '@wooorm/starry-night/text.md';
import sourceMdx from '@wooorm/starry-night/source.mdx';
import textHtmlBasic from '@wooorm/starry-night/text.html.basic';
import sourceCss from '@wooorm/starry-night/source.css';
import sourceShell from '@wooorm/starry-night/source.shell';
import sourceYaml from '@wooorm/starry-night/source.yaml';
export const grammars = [sourceSvelte, sourceJs, sourceTs, sourceTsx, textMd, sourceMdx,
// needs sourceTsx
textHtmlBasic, sourceCss, sourceShell, sourceYaml];
