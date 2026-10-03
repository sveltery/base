// Strict Source public aliases and native consumer contracts; supplements, zero ordinary credit.
import type { ComponentProps } from 'svelte';
import { TabsRoot, TabsTab, TabsList, TabsPanel, TabsIndicator } from '../src/lib/tabs/index.js';
import type { TabsRoot as RootContract, TabsTab as TabContract } from '../src/lib/tabs/index.js';
const root: ComponentProps<typeof TabsRoot> = { value: undefined, defaultValue: undefined, orientation: undefined, onValueChange: undefined, render: undefined, ref: undefined, class: undefined, style: undefined };
const tab: ComponentProps<typeof TabsTab> = { value: { arbitrary: true }, disabled: undefined, nativeButton: undefined, onclick(event) { event.preventBaseUIHandler(); } };
const list: ComponentProps<typeof TabsList> = { activateOnFocus: undefined, loopFocus: undefined };
const panel: ComponentProps<typeof TabsPanel> = { value: null, keepMounted: undefined };
const indicator: ComponentProps<typeof TabsIndicator> = { renderBeforeHydration: undefined };
const contract: RootContract.Props = root;
const publicNamespace: TabsRoot.Props = root;
const value: TabContract.Value = { arbitrary: true };
void [root, tab, list, panel, indicator, contract, value, publicNamespace];
// @ts-expect-error invalid source orientation
const invalid: ComponentProps<typeof TabsRoot> = { orientation: 'diagonal' };
// @ts-expect-error source Tab requires a value
const missing: ComponentProps<typeof TabsTab> = {};
// @ts-expect-error source Panel requires a value
const missingPanel: ComponentProps<typeof TabsPanel> = {};
void [invalid, missing, missingPanel];
