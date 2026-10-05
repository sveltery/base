// Published @mui/internal-docs-infra 0.12.1-canary.42 pipeline; MIT, copyright 2019 Material-UI SAS.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment -- Retained published untyped JavaScript; native render boundary is separately typed.
// @ts-nocheck
/**
 * Language capabilities derived from a grammar scope or language class.
 *
 * Shared by both `extendSyntaxTokens` (which receives grammar scopes like
 * `'source.tsx'`) and `enhanceCodeTypes` (which reads `language-*` CSS classes).
 */

const BASE_CAPABILITIES = {
  supportsTypes: false,
  supportsJsx: false
};

/**
 * Resolves language capabilities from a starry-night grammar scope string.
 *
 * Note: `.jsx` files map to `source.tsx` via the extension map, so there is
 * no separate `source.jsx` scope. MDX is treated as JS+TS+JSX because it
 * embeds TypeScript JSX.
 */
export function getLanguageCapabilitiesFromScope(grammarScope) {
  switch (grammarScope) {
    case 'source.js':
      return {
        supportsTypes: false,
        supportsJsx: false,
        semantics: 'js'
      };
    case 'source.ts':
      return {
        supportsTypes: true,
        supportsJsx: false,
        semantics: 'js'
      };
    case 'source.tsx':
      return {
        supportsTypes: true,
        supportsJsx: true,
        semantics: 'js'
      };
    case 'source.mdx':
      return {
        supportsTypes: true,
        supportsJsx: true,
        semantics: 'js'
      };
    case 'source.css':
      return {
        supportsTypes: false,
        supportsJsx: false,
        semantics: 'css'
      };
    default:
      return BASE_CAPABILITIES;
  }
}
