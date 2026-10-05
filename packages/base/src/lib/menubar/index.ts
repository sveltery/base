// Original Menubar public component and erased namespace (MIT).
/* eslint-disable @typescript-eslint/no-namespace -- Preserve Source component type namespace. */
import MenubarComponent from './Menubar.svelte';
import type { MenubarProps, MenubarState } from './types.js';
export const Menubar: typeof MenubarComponent = MenubarComponent;
export namespace Menubar { export type Props = MenubarProps; export type State = MenubarState }
export type { MenubarProps, MenubarState } from './types.js';
