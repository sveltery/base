// Supplemental public API assertions, not upstream type-test ports.
import type { ComponentProps, Snippet } from 'svelte';
import { CSPProvider, type CSPProviderProps, type CSPProviderState } from '../src/lib/index.js';
import {
  CSPProvider as SubpathProvider,
  type CSPProviderProps as SubpathProps,
  type CSPProviderState as SubpathState,
} from '../src/lib/csp-provider/index.js';
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
const equality: Equal<
  [CSPProviderProps, CSPProviderState, ComponentProps<typeof CSPProvider>],
  [SubpathProps, SubpathState, ComponentProps<typeof SubpathProvider>]
> = true;
const children: Equal<CSPProviderProps['children'], Snippet | undefined> = true;
const namespaceEquality: Equal<
  [CSPProvider.Props, CSPProvider.State, SubpathProvider.Props, SubpathProvider.State],
  [CSPProviderProps, CSPProviderState, SubpathProps, SubpathState]
> = true;
const namespaceProps: CSPProvider.Props = { nonce: 'root' };
const subpathNamespaceProps: SubpathProvider.Props = { disableStyleElements: false };
const namespaceStates: [CSPProvider.State, SubpathProvider.State] = [1, {}];
const empty: CSPProviderProps = {};
const explicitUndefined: SubpathProps = {
  nonce: undefined,
  disableStyleElements: undefined,
  children: undefined,
};
const primitiveState: CSPProviderState = 1;
// @ts-expect-error Nonces are strings.
const invalidNonce: CSPProviderProps = { nonce: 1 };
// @ts-expect-error The provider has no DOM host or native attributes.
const invalidHost: SubpathProps = { id: 'host' };
// @ts-expect-error ReactNode text is not a Svelte child snippet.
const invalidChildren: SubpathProps = { children: 'text' };
// @ts-expect-error Flags retain their boolean type.
const invalidFlag: SubpathProps = { disableStyleElements: 'true' };
// @ts-expect-error The pinned empty State alias does not add a state component prop.
const invalidStateProp: SubpathProvider.Props = { state: {} };
void [
  namespaceEquality,
  namespaceProps,
  subpathNamespaceProps,
  namespaceStates,
  invalidStateProp,
  equality,
  children,
  empty,
  explicitUndefined,
  primitiveState,
  invalidNonce,
  invalidHost,
  invalidChildren,
  invalidFlag,
];
