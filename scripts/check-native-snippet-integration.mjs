// Complete current source comparison; grants no runtime, declaration or compiled-markup credit.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(new URL('../packages/base/package.json', import.meta.url));
const ts = require('typescript');
const compiler = require('svelte/compiler');
const renderer = 'f0dbb89a05f032af1e9aac99461c6eccfa09e0d9';
const native = '168c2717da1834fe728d76a4aeb94cb81b9b8a1f';
const nativeIntegrationParent = '96ade5322d396211cc41609f244803e92dfe0169';
const cleanupPredecessor = 'e5e26961c52d324eb9075fcbff71915f79f7e922';
const focusPredecessor = '42c04c5c4fb1d8a698435fee40e1d2bcb41d30e7';
const registrationPredecessor = 'f2a99979a04a98c8bc60709a75d0db2397ec2470';
const ownershipCommentPredecessor = '336062b3be2dfe90db5899714aed6457f78836ae';
const nativeOwnerPredecessor = 'c39271eaf4f893fc64131b22209dee50e74de657';
const bindingCommentPredecessor = '0d88a4e3fcb0ce57dab9b058b86a85e412f9d07c';
const initialFocusPredecessor = 'ec36fc9cc5a8819260c2c6635e0a128acd563d4a';
const popoverSlotPredecessor = '0ba754026de455a9647c32dde29b024924150cc2';
const buttonDefaultPredecessor = 'd5fabc8d389c7514b0459737d894b00e3618a988';
const buttonDefaultPaths = new Set([
  'packages/base/src/lib/button/Button.svelte',
  'packages/base/src/lib/dialog/Close.svelte',
  'packages/base/src/lib/dialog/Trigger.svelte',
  'packages/base/src/lib/internals/composite/item/CompositeItem.svelte',
  'packages/base/src/lib/menu/Trigger.svelte',
  'packages/base/src/lib/popover/Close.svelte',
  'packages/base/src/lib/popover/Trigger.svelte',
  'packages/base/src/lib/toast/Action.svelte',
  'packages/base/src/lib/toast/Close.svelte',
  'packages/base/src/lib/toggle/Toggle.svelte',
]);
function nativeButtonDefault(path, body) {
  if (!buttonDefaultPaths.has(path)) return body;
  const fallback = '<button {...mergedProps}>';
  assert.equal(body.split(fallback).length, 2, `One intrinsic button fallback: ${path}`);
  return body.replace(fallback, '<button type="button" {...mergedProps}>');
}
const nativeContractPredecessor = 'c0da99c7e01f5d35e2572256df66136fce55cf41';
const nativeContractChanges = {
  'packages/base/src/lib/dialog/store/DialogStore.svelte.ts': [
    [
      '  readonly backdropRef: { current: HTMLDivElement | null };\n',
      '  readonly backdropRef: { current: HTMLElement | null };\n',
    ],
  ],
  'packages/base/src/lib/checkbox-group/types.ts': [
    [
      '    ref?: HTMLDivElement | null | undefined;\n',
      '    ref?: HTMLElement | null | undefined;\n',
    ],
  ],
  'packages/base/src/lib/context-menu/root/ContextMenuRootContext.ts': [
    [
      '  backdropRef: { current: HTMLDivElement | null };\n',
      '  backdropRef: { current: HTMLElement | null };\n',
    ],
  ],
  'packages/base/src/lib/context-menu/Root.svelte': [
    [
      '  const backdropRef = { current: null as HTMLDivElement | null };\n',
      '  const backdropRef = { current: null as HTMLElement | null };\n',
    ],
  ],
  'packages/base/src/lib/context-menu/trigger/createContextMenuTrigger.svelte.ts': [
    [
      '  const triggerRef = { current: null as HTMLDivElement | null };\n',
      '  const triggerRef = { current: null as HTMLElement | null };\n',
    ],
  ],
  'packages/base/src/lib/dialog/types.ts': [
    [
      '  render?: Snippet<[Record<string | symbol, unknown>, State, Snippet | undefined]>;\n',
      "  render?: BaseUIComponentProps<State>['render'];\n",
    ],
  ],
  'packages/base/src/lib/toast/types.ts': [
    [
      'export type ToastActionComponentProps = ToastElementProps<\n  ToastLabelState,\n  HTMLButtonAttributes,\n  ToastContent\n',
      "export type ToastActionComponentProps = Omit<\n  ToastElementProps<ToastLabelState, HTMLButtonAttributes, ToastContent>,\n  'disabled'\n",
    ],
    [
      '  /** Set false when render supplies a non-button host. */\n',
      '  disabled?: boolean | undefined;\n  /** Set false when render supplies a non-button host. */\n',
    ],
    [
      "export type ToastPortalProps = import('../dialog/types.js').ElementProps<\n  ToastPortalState,\n  HTMLAttributes<HTMLDivElement>\n> & {\n",
      'export type ToastPortalProps = ToastElementProps<ToastPortalState> & {\n',
    ],
  ],
  'packages/base/src/lib/toast/Close.svelte': [
    [
      '  const state = $derived({ type: controller.toast.type });\n',
      '  const componentState = $derived({ type: controller.toast.type });\n',
    ],
    [
      '    ...mergeComponentProps(state, { class: classProp, style }, [\n',
      '    ...mergeComponentProps(componentState, { class: classProp, style }, [\n',
    ],
    [
      '  {@render render(mergedProps, state, hostChildren)}\n',
      '  {@render render(mergedProps, componentState, hostChildren)}\n',
    ],
  ],
  'packages/base/src/lib/accordion/Trigger.svelte': [
    [
      "    return getButtonProps(\n      mergeProps(\n        {\n          ...stateAttributes(state, true),\n          'aria-controls': context.open ? context.panelId : undefined,\n          'aria-expanded': context.open,\n          id,\n          onclick: context.handleTrigger,\n        },\n        {\n          ...props,\n          class: classValue === undefined ? undefined : resolveClassValue(classValue),\n        },\n",
      "    const className = classValue === undefined ? undefined : resolveClassValue(classValue);\n    return {\n      ...getButtonProps(\n        mergeProps(\n          {\n            ...stateAttributes(state, true),\n            'aria-controls': context.open ? context.panelId : undefined,\n            'aria-expanded': context.open,\n            id,\n            onclick: context.handleTrigger,\n          },\n          {\n            ...props,\n            class: className,\n          },\n        ),\n        disabled,\n        true,\n        nativeButton,\n",
    ],
    [
      '      disabled,\n      true,\n      nativeButton,\n    );\n',
      '      class: className,\n      style: props.style,\n    };\n',
    ],
  ],
  'packages/base/src/lib/collapsible/Trigger.svelte': [
    [
      "    return getButtonProps(\n      {\n        ...props,\n        ...mergeProps(\n          {\n            ...stateAttributes(state, true),\n            'aria-controls': context.open ? context.panelId : undefined,\n            'aria-expanded': context.open,\n            onclick: context.handleTrigger,\n          },\n          {\n            ...props,\n            class: classValue === undefined ? undefined : resolveClassValue(classValue),\n          },\n        ),\n      },\n      disabled,\n      true,\n      nativeButton,\n    );\n",
      "    const className = classValue === undefined ? undefined : resolveClassValue(classValue);\n    return {\n      ...getButtonProps(\n        {\n          ...props,\n          ...mergeProps(\n            {\n              ...stateAttributes(state, true),\n              'aria-controls': context.open ? context.panelId : undefined,\n              'aria-expanded': context.open,\n              onclick: context.handleTrigger,\n            },\n            {\n              ...props,\n              class: className,\n            },\n          ),\n        },\n        disabled,\n        true,\n        nativeButton,\n      ),\n      class: className,\n      style: props.style,\n    };\n",
    ],
  ],
};
const nativeContractPaths = new Set(Object.keys(nativeContractChanges));
function nativeContract(path, body) {
  for (const [before, after] of nativeContractChanges[path] ?? []) {
    assert.equal(body.split(before).length, 2, `One exact contract producer span: ${path}`);
    body = body.replace(before, after);
  }
  return body;
}
const positionerPublicationPredecessor = 'd390353b69fd9b7761d4256f0a4fd39ef0a66fea';
const positionerPublicationRuntime =
  'packages/base/src/lib/menu/positioner/createMenuPositioner.svelte.ts';
function positionerPublication(path, body) {
  if (path !== positionerPublicationRuntime) return body;
  const before = `  function attachHost(host: HTMLElement) {
    getRef(host);
    setPositionerElement(host);
    return () => {
      getRef(null);
      setPositionerElement(null);
    };
  }
`;
  const after = `  function attachHost(host: HTMLElement) {
    return untrack(() => {
      getRef(host);
      setPositionerElement(host);
      return () =>
        untrack(() => {
          getRef(null);
          setPositionerElement(null);
        });
    });
  }
`;
  assert.equal(body.split(before).length, 2, 'One exact native Positioner publication span');
  return body.replace(before, after);
}
const fieldBusinessPredecessor = 'acdebb8eeb910c48230343324f6284b682bf289b';
const fieldBusinessChanges = {
  'packages/base/src/lib/field/Error.svelte': [
    [
      '  }: FieldErrorProps = $props();\n',
      '  }: FieldErrorProps = $props();\n  let { children, ...hostProps } = $derived(elementProps);\n',
    ],
    ['      [{ id }, elementProps],\n', '      [{ id }, hostProps],\n'],
    [
      '{#if transition.mounted}\n',
      "{#if transition.mounted}\n  {const content = $derived(Object.hasOwn(elementProps, 'children') ? children : errorContent)}\n",
    ],
    [
      '    {@render render(mergedProps, errorState, errorContent)}\n',
      '    {@render render(mergedProps, errorState, content)}\n',
    ],
    [
      '    <div {...mergedProps}>{@render errorContent?.()}</div>\n',
      '    <div {...mergedProps}>{@render content?.()}</div>\n',
    ],
  ],
  'packages/base/src/lib/internals/labelable-provider/createLabelableProvider.svelte.ts': [
    [
      '  let messageIds = $state<string[]>([]);\n',
      '  // Effect cleanup updates the live resource array; native state publishes its current value.\n  let currentMessageIds: string[] = [];\n  let messageIds = $state.raw<string[]>(currentMessageIds);\n',
    ],
    [
      "      messageIds = typeof value === 'function' ? value(messageIds) : value;\n",
      "      currentMessageIds = typeof value === 'function' ? value(currentMessageIds) : value;\n      messageIds = currentMessageIds;\n",
    ],
  ],
};
const fieldBusinessPaths = new Set(Object.keys(fieldBusinessChanges));
assert.equal(fieldBusinessPaths.size, 2);
const panelMotionPredecessor = '826eb1d863a231928c4cc040f894737449563d4b';
const panelMotionRuntime = 'packages/base/src/lib/collapsible/Panel.svelte';
const panelMotionChanges = [
  [
    "\n  // Adapted from mui/base-ui v1.8.0 CollapsiblePanel/useCollapsiblePanel,\n  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.\n  import { onDestroy, untrack } from 'svelte';\n  import { resolveClassValue } from '../internals/resolveClassValue.js';\n  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';\n  import { getCollapsibleContext } from './context.js';\n",
    "\n  // Adapted from mui/base-ui v1.8.0 CollapsiblePanel/useCollapsiblePanel,\n  // 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.\n  import { untrack } from 'svelte';\n  import { toNativeStyle } from '../internals/nativeProps.js';\n  import { resolveClassValue } from '../internals/resolveClassValue.js';\n  import { createChangeEventDetails } from '../internals/createBaseUIEventDetails.js';\n  import { getCollapsibleContext } from './context.js';\n",
  ],
  [
    "  let shouldPreventMountAnimation = $state(untrack(() => context.open));\n  let shouldSkipNextOpen = false;\n  let forcePanelIdle = $state(false);\n  let pendingTemporaryStyleRestore: (() => void) | undefined;\n\n  const hidden = $derived(!context.open && !context.mounted);\n  const panelTransitionStatus = $derived(forcePanelIdle ? 'idle' : context.transitionStatus);\n",
    "  let shouldPreventMountAnimation = $state(untrack(() => context.open));\n  let shouldSkipNextOpen = false;\n  let forcePanelIdle = $state(false);\n  // Accepted beforematch motion suppression belongs to this actual host's open cycle.\n  let skippedOpenMotion = $state.raw<\n    { panel: HTMLElement; type: Exclude<AnimationType, 'none'> } | undefined\n  >();\n\n  const hidden = $derived(!context.open && !context.mounted);\n  const panelTransitionStatus = $derived(forcePanelIdle ? 'idle' : context.transitionStatus);\n",
  ],
  [
    '    if (cache) lastMeasuredDimensions = next;\n    dimensions = next;\n  }\n  function restorePendingTemporaryStyle() {\n    pendingTemporaryStyleRestore?.();\n    pendingTemporaryStyleRestore = undefined;\n  }\n  function setPendingTemporaryStyleRestore(restore: () => void) {\n    restorePendingTemporaryStyle();\n    pendingTemporaryStyleRestore = () => {\n      pendingTemporaryStyleRestore = undefined;\n      restore();\n    };\n  }\n  function attach(element: HTMLElement) {\n    node = element;\n    return () => {\n      restorePendingTemporaryStyle();\n      if (node === element) node = null;\n    };\n  }\n  onDestroy(restorePendingTemporaryStyle);\n\n  const internal = $derived({\n    id,\n',
    '    if (cache) lastMeasuredDimensions = next;\n    dimensions = next;\n  }\n  function attach(element: HTMLElement) {\n    node = element;\n    return () => {\n      if (skippedOpenMotion?.panel === element) skippedOpenMotion = undefined;\n      if (node === element) node = null;\n    };\n  }\n\n  const internal = $derived({\n    id,\n',
  ],
  [
    "  const resolved = $derived.by(() => {\n    const authoredStyle = typeof styleProp === 'function' ? styleProp(panelState) : styleProp;\n    const classValue = typeof classProp === 'function' ? classProp(panelState) : classProp;\n    return {\n      ...props,\n      class: classValue === undefined ? undefined : resolveClassValue(classValue),\n      style: shouldPreventOpenAnimation\n        ? `${authoredStyle ?? ''};animation-name:none`\n        : authoredStyle,\n    };\n  });\n\n",
    "  const resolved = $derived.by(() => {\n    const authoredStyle = typeof styleProp === 'function' ? styleProp(panelState) : styleProp;\n    const classValue = typeof classProp === 'function' ? classProp(panelState) : classProp;\n    const styleValue = shouldPreventOpenAnimation\n      ? `${authoredStyle ?? ''};animation-name:none`\n      : authoredStyle;\n    const skippedMotion =\n      context.open && skippedOpenMotion && skippedOpenMotion.panel === node\n        ? skippedOpenMotion.type\n        : undefined;\n    return {\n      ...props,\n      class: classValue === undefined ? undefined : resolveClassValue(classValue),\n      // Keep the one-shot business override in native markup through dimension commits.\n      // Closing resolves live authored duration before the measurement effect detects motion.\n      style: skippedMotion\n        ? `${toNativeStyle(styleValue) ?? ''};${skippedMotion === 'css-transition' ? 'transition-duration' : 'animation-duration'}:0s`\n        : styleValue,\n    };\n  });\n\n",
  ],
  [
    "    // remains retained. Finalizing here would correct shared source behavior.\n    if (!panel) return;\n    return untrack(() => {\n      if (!open) restorePendingTemporaryStyle();\n      const mode = getAnimationType(panel, preventOpenAnimation);\n      animationType = mode;\n      if (open && status === 'idle' && shouldPreventMountAnimation && mode === 'css-animation') {\n",
    "    // remains retained. Finalizing here would correct shared source behavior.\n    if (!panel) return;\n    return untrack(() => {\n      if (!open) skippedOpenMotion = undefined;\n      const mode = getAnimationType(panel, preventOpenAnimation);\n      animationType = mode;\n      if (open && status === 'idle' && shouldPreventMountAnimation && mode === 'css-animation') {\n",
  ],
  [
    "          const restoreLayout = resetLayoutStyles(panel);\n          setDimensions(getDimensions(panel));\n          if (skipOpen) {\n            setPendingTemporaryStyleRestore(setTemporaryStyle(panel, 'transition-duration', '0s'));\n            forcePanelIdle = true;\n          }\n          return restoreLayout;\n",
    '          const restoreLayout = resetLayoutStyles(panel);\n          setDimensions(getDimensions(panel));\n          if (skipOpen) {\n            skippedOpenMotion = { panel, type: mode };\n            forcePanelIdle = true;\n          }\n          return restoreLayout;\n',
  ],
  [
    "          restoreName();\n          return;\n        }\n        const restoreDuration = setTemporaryStyle(panel, 'animation-duration', '0s');\n        restoreName();\n        setPendingTemporaryStyleRestore(restoreDuration);\n        forcePanelIdle = true;\n        return;\n      }\n",
    '          restoreName();\n          return;\n        }\n        skippedOpenMotion = { panel, type: mode };\n        restoreName();\n        forcePanelIdle = true;\n        return;\n      }\n',
  ],
];
// Append public native style declarations after the frozen historical Panel successor.
const publicStylePredecessor = '4aa4bc8d8d7c17e8dbec781837d56ca56112f9e3';
const publicStyleChanges = {
  'packages/base/src/lib/internals/nativeProps.ts': [
    [
      "import type { ClassValue } from 'svelte/elements';\n",
      "import type { ClassValue, HTMLAttributes } from 'svelte/elements';\n",
    ],
    [
      'export type NativeStyle = string | Record<string, unknown>;\n',
      "// Public styles use Svelte's attribute representation; pure internal records still serialize below.\n" +
        "export type NativeStyle = HTMLAttributes<HTMLElement>['style'];\n",
    ],
  ],
  'packages/base/src/lib/dialog/types.ts': [
    [
      '  style?: string | ((state: State) => string | undefined);\n',
      "  style?: BaseUIComponentProps<State>['style'];\n",
    ],
  ],
  'packages/base/src/lib/avatar/types.ts': [
    [
      "import type { HTMLProps, WithBaseUIEvent } from '../internals/types.js';\n",
      "import type { BaseUIComponentProps, HTMLProps, WithBaseUIEvent } from '../internals/types.js';\n",
    ],
    [
      '  style?: string | ((state: State) => string | undefined);\n',
      "  style?: BaseUIComponentProps<State>['style'];\n",
    ],
  ],
  'packages/base/src/lib/toast/types.ts': [
    [
      "import type { ComponentRenderFn, HTMLProps } from '../internals/types.js';\n",
      "import type { BaseUIComponentProps, ComponentRenderFn, HTMLProps } from '../internals/types.js';\n",
    ],
    [
      '  style?: string | ((state: State) => string | undefined);\n',
      "  style?: BaseUIComponentProps<State>['style'];\n",
    ],
  ],
};
const publicStylePaths = new Set(Object.keys(publicStyleChanges));
assert.equal(publicStylePaths.size, 4);
const hostBusinessPredecessor = 'c04b7ca3c494df0cbe8c6c488dbaa0479b145f7f';
const hostBusinessChanges = {
  'packages/base/src/lib/internals/use-button/useButton.svelte.ts': [
    [
      '  return { getButtonProps, buttonRef };\n',
      '  return {\n    getButtonProps,\n    buttonRef,\n    get element() {\n      return elementRef.current;\n    },\n  };\n',
    ],
  ],
  'packages/base/src/lib/toolbar/button/ToolbarButton.svelte': [
    [
      '  const { getButtonProps, buttonRef } = useButton(() => ({\n',
      '  const button = useButton(() => ({\n',
    ],
    [
      '  const state: ToolbarButtonState = $derived({\n',
      '  const { getButtonProps, buttonRef } = button;\n  const state: ToolbarButtonState = $derived({\n',
    ],
    [
      '    return () => untrack(() => buttonRef(null));\n',
      '    return () =>\n      untrack(() => {\n        if (button.element === host) buttonRef(null);\n      });\n',
    ],
  ],
  'packages/base/src/lib/menu/submenu-trigger/createMenuSubmenuTrigger.svelte.ts': [
    [
      "  // Stable, so the merged ref on the rendered element keeps its identity for the trigger's whole\n  // lifetime; the latest `closeDelay` is read when it runs.\n",
      '  // Publishes the native registration before claiming implicit active ownership.\n  // The latest `closeDelay` is read only in that branch; later changes stay synchronized below.\n',
    ],
    [
      '    baseRegisterTrigger(element);\n',
      '    const owner = store;\n    const id = thisTriggerId;\n    baseRegisterTrigger(element);\n',
    ],
    [
      "    if (element !== null && store.select('open') && store.select('activeTriggerId') == null) {\n      store.update({\n        activeTriggerId: thisTriggerId ?? null,\n        activeTriggerElement: element,\n        closeDelay,\n      });\n    }\n",
      "    untrack(() => {\n      if (element !== null && owner.select('open') && owner.select('activeTriggerId') == null) {\n        owner.update({\n          activeTriggerId: id ?? null,\n          activeTriggerElement: element,\n          closeDelay,\n        });\n      }\n    });\n",
    ],
    [
      '  // The rendered ref keeps its identity; native ID/Store changes migrate its registration.\n',
      '  // Native ID/Store changes migrate the published host registration.\n',
    ],
    [
      '    const disposeItem = attachItem(host);\n',
      '    const disposeItem = untrack(() => attachItem(host));\n',
    ],
  ],
};
const hostBusinessPaths = new Set(Object.keys(hostBusinessChanges));
function hostBusiness(path, body) {
  for (const [before, after] of hostBusinessChanges[path] ?? []) {
    assert.equal(body.split(before).length, 2, `One exact native host business span: ${path}`);
    body = body.replace(before, after);
  }
  return body;
}
const popoverSlotRuntime = 'packages/base/src/lib/popover/store/PopoverStore.svelte.ts';
function reactivePopoverFocusTarget(body) {
  return body
    .replace(
      '    const triggerElements = new PopupTriggerMap();\n    super(',
      '    const triggerElements = new PopupTriggerMap();\n' +
        '    const triggerFocusTargetRef = $state<{ current: HTMLElement | null }>({ current: null });\n    super(',
    )
    .replace(
      '      createInitialContext(triggerElements),',
      '      createInitialContext(triggerElements, triggerFocusTargetRef),',
    )
    .replace(
      'function createInitialContext(triggerElements: PopupTriggerMap): Context {',
      "function createInitialContext(\n  triggerElements: PopupTriggerMap,\n  triggerFocusTargetRef: Context['triggerFocusTargetRef'] = { current: null },\n): Context {",
    )
    .replace('    triggerFocusTargetRef: { current: null },', '    triggerFocusTargetRef,');
}
const initialFocusRuntime =
  'packages/base/src/lib/floating-ui/components/createFloatingFocusManager.svelte.ts';
function disposeQueuedInitialFocus(body) {
  const predicate = '        shouldFocus() {\n';
  assert.equal(body.split(predicate).length, 2);
  return body
    .replace(
      predicate,
      predicate +
        '          // Avoid reading rune-backed state after this owner is destroyed.\n' +
        '          if (disposed) return false;\n',
    )
    .replace(
      '    // Wait for any layout effect state setters to execute to set `tabIndex`.',
      '    // Wait for native state updates to set `tabIndex`.',
    );
}
// Exactly the unused directive paths reported by the actual 9bdc Standards run.
const obsoleteBindingDirectivePaths = new Set([
  'packages/base/src/lib/context-menu/Trigger.svelte',
  'packages/base/src/lib/menu/Arrow.svelte',
  'packages/base/src/lib/menu/Backdrop.svelte',
  'packages/base/src/lib/menu/CheckboxItem.svelte',
  'packages/base/src/lib/menu/CheckboxItemIndicator.svelte',
  'packages/base/src/lib/menu/Item.svelte',
  'packages/base/src/lib/menu/LinkItem.svelte',
  'packages/base/src/lib/menu/Popup.svelte',
  'packages/base/src/lib/menu/Portal.svelte',
  'packages/base/src/lib/menu/RadioItem.svelte',
  'packages/base/src/lib/menu/RadioItemIndicator.svelte',
  'packages/base/src/lib/menubar/Menubar.svelte',
  'packages/base/src/lib/popover/Arrow.svelte',
  'packages/base/src/lib/popover/Backdrop.svelte',
  'packages/base/src/lib/popover/Close.svelte',
  'packages/base/src/lib/popover/Description.svelte',
  'packages/base/src/lib/popover/Popup.svelte',
  'packages/base/src/lib/popover/Positioner.svelte',
  'packages/base/src/lib/popover/Title.svelte',
  'packages/base/src/lib/popover/Trigger.svelte',
  'packages/base/src/lib/popover/Viewport.svelte',
  'packages/base/src/lib/preview-card/Arrow.svelte',
  'packages/base/src/lib/preview-card/Backdrop.svelte',
  'packages/base/src/lib/preview-card/Popup.svelte',
  'packages/base/src/lib/preview-card/Positioner.svelte',
  'packages/base/src/lib/preview-card/Trigger.svelte',
  'packages/base/src/lib/preview-card/Viewport.svelte',
  'packages/base/src/lib/tooltip/Arrow.svelte',
  'packages/base/src/lib/tooltip/Popup.svelte',
  'packages/base/src/lib/tooltip/Positioner.svelte',
  'packages/base/src/lib/tooltip/Trigger.svelte',
  'packages/base/src/lib/tooltip/Viewport.svelte',
]);
const radioBindingPath = 'packages/base/src/lib/radio-group/RadioGroup.svelte';
function bindingDirectiveHygiene(path, body) {
  if (obsoleteBindingDirectivePaths.has(path)) {
    const directive =
      /^ +\/\/ eslint-disable-next-line no-useless-assignment -- (?:Publishes native bindable host\/action outputs to the owner\.|Native bindable ref output is published through the ordered Source ref callback\.)\n/gm;
    assert.equal([...body.matchAll(directive)].length, 1);
    return body.replace(directive, '');
  }
  if (path === radioBindingPath) {
    const property = '    inputRef = $bindable(),';
    assert.equal(body.split(property).length, 2);
    return body.replace(
      property,
      '    // eslint-disable-next-line no-useless-assignment -- Svelte output binding publishes the selected input to its caller.\n' +
        property,
    );
  }
  return body;
}
const hash = (body) => createHash('sha256').update(body).digest('hex');
const git = (...args) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const graph = JSON.parse(
  readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json'), 'utf8'),
);
function clarifyTriggerOwnership(body) {
  return body
    .replace(
      ' * Returns a stable callback ref that registers/unregisters the trigger element in the store.\n *\n' +
        ' * Stable so a downstream ref merger that retains the callback it was first given still reaches the\n' +
        " * trigger's current store. The registration is tracked as a `(store, id, element)` triple, so\n" +
        ' * unregistering targets the store the element was actually registered in.',
      ' * Registers/unregisters the native trigger host in its current Store.\n *\n' +
        ' * Each publication acquires the actual Store and ID. The captured `(store, id, element)`\n' +
        ' * registration targets its installed owner on removal, even after a Store or ID change.',
    )
    .replace(
      '  // Applies trigger-owned state (active-trigger ownership and payload) when the trigger registers.\n' +
        '  // Stable so payload/`stateUpdates` changes do not change the ref identity (which would needlessly\n' +
        '  // churn registration); it reads the latest closure values when invoked.',
      '  // Applies current trigger-owned state when its native host is published.\n' +
        '  // The imperative boundary reads the latest payload only in its business branches;\n' +
        '  // the independent data-forwarding effect below owns later reactive payload changes.',
    )
    .replace(
      "  // Stable, so the merged ref on the rendered element keeps its identity for the trigger's whole\n" +
        '  // lifetime.',
      "  // Publishes the native host's registration before its current trigger-owned data.",
    )
    .replace(
      '  // A stable ref does not re-fire on a store or id change, so migrate here instead: unregister from\n' +
        '  // the previous store, then register the element the trigger still renders into the current one.',
      '  // Store/ID changes migrate the published host independently of attachment setup:\n' +
        '  // remove its captured previous registration, then publish it in the current owner.',
    );
}
function disposeQueuedFocusOutside(body) {
  return body
    .replace(
      'export function createFloatingFocusManager(getProps: () => FloatingFocusManagerProps) {',
      'export function createFloatingFocusManager(getProps: () => FloatingFocusManagerProps) {\n' +
        '  let disposed = false;\n  onDestroy(() => {\n    disposed = true;\n  });',
    )
    .replace(
      '      queueMicrotask(() => {\n        const nodeId = getNodeId();',
      '      queueMicrotask(() => {\n        if (disposed) return;\n        const nodeId = getNodeId();',
    );
}
function reactiveNativeOwners(path, body) {
  if (path.endsWith('useTriggerFocusGuards.svelte.ts'))
    return body.replace(
      '  const preFocusGuardRef = { current: null as HTMLElement | null };',
      '  const preFocusGuardRef = $state<{ current: HTMLElement | null }>({ current: null });',
    );
  if (path.endsWith('DialogStore.svelte.ts'))
    return body
      .replace(
        '    const state = createInitialState<Payload>(initialState, triggerElements, floatingId, nested);',
        '    const state = createInitialState<Payload>(initialState, triggerElements, floatingId, nested);\n' +
          '    const internalBackdropRef = $state<{ current: HTMLDivElement | null }>({ current: null });',
      )
      .replace(
        '    super(state, createInitialContext(triggerElements), selectors);',
        '    super(state, createInitialContext(triggerElements, internalBackdropRef), selectors);',
      )
      .replace(
        'function createInitialContext(triggerElements: PopupTriggerMap): Context {',
        "function createInitialContext(\n  triggerElements: PopupTriggerMap,\n  internalBackdropRef: Context['internalBackdropRef'] = { current: null },\n): Context {",
      )
      .replace('    internalBackdropRef: { current: null },', '    internalBackdropRef,');
  if (path.endsWith('FloatingPortal.svelte')) {
    for (const name of ['beforeOutsideRef', 'afterOutsideRef'])
      body = body.replace(
        `  const ${name}: { current: HTMLSpanElement | null } = {\n    current: null,\n  };`,
        `  const ${name} = $state<{ current: HTMLSpanElement | null }>({\n    current: null,\n  });`,
      );
    return body;
  }
  return body
    .replace(
      '  store.update({ inactiveTriggerProps });',
      '  untrack(() => store.update({ inactiveTriggerProps }));',
    )
    .replace(
      "  // the synchronization effect below doesn't make every trigger render twice in the first commit.",
      "  // the synchronization effect below doesn't make every trigger render twice in the initial update.",
    );
}
const flags =
  ts.NodeFlags.Let |
  ts.NodeFlags.Const |
  ts.NodeFlags.Using |
  ts.NodeFlags.AwaitUsing |
  ts.NodeFlags.Namespace |
  ts.NodeFlags.NestedNamespace |
  ts.NodeFlags.GlobalAugmentation |
  ts.NodeFlags.OptionalChain;
function shape(node, tree) {
  const result = { kind: ts.SyntaxKind[node.kind] };
  if (node.flags & flags) result.flags = node.flags & flags;
  for (const key of ['text', 'rawText', 'isTypeOnly', 'operator', 'isExportEquals', 'isPostfix'])
    if (key in node && !ts.isSourceFile(node)) result[key] = node[key];
  if (ts.isTemplateLiteralToken(node)) result.rawTemplate = node.getText(tree);
  const children = [];
  ts.forEachChild(node, (child) => {
    children.push(shape(child, tree));
  });
  if (children.length) result.children = children;
  return result;
}
function syntax(path, body) {
  const code = path.endsWith('.svelte')
    ? [...body.matchAll(/<script\b(?:[^>"']|"[^"]*"|'[^']*')*>([\s\S]*?)<\/script>/g)]
        .map((match) => match[1])
        .join('\n')
    : body;
  const tree = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  assert.equal(tree.parseDiagnostics.length, 0, `Invalid source syntax: ${path}`);
  if (path.endsWith('.svelte')) compiler.parse(body, { modern: true });
  return tree;
}
function differences(before, after, beforeTree, afterTree, path = 'source') {
  if (before.kind !== after.kind)
    return [
      {
        path,
        beforeKind: ts.SyntaxKind[before.kind],
        afterKind: ts.SyntaxKind[after.kind],
        before: before.getText(beforeTree),
        after: after.getText(afterTree),
      },
    ];
  const left = [],
    right = [];
  ts.forEachChild(before, (child) => {
    left.push(child);
  });
  ts.forEachChild(after, (child) => {
    right.push(child);
  });
  if (left.length !== right.length)
    return [{ path, before: before.getText(beforeTree), after: after.getText(afterTree) }];
  return left.flatMap((child, index) =>
    differences(
      child,
      right[index],
      beforeTree,
      afterTree,
      `${path}.${ts.SyntaxKind[child.kind]}[${index}]`,
    ),
  );
}
const retired = [
  'packages/base/src/lib/dialog/Element.svelte',
  'packages/base/src/lib/internals/RenderElement.svelte',
  'packages/base/src/lib/internals/field-register-control/useFieldControlRegistration.svelte.ts',
  'packages/base/src/lib/internals/nativeRefAttachment.ts',
  'packages/base/src/lib/internals/useRenderElement.ts',
  'packages/base/src/lib/toast/native-button.ts',
  'packages/base/src/lib/use-render/RenderElement.svelte',
  'packages/base/src/lib/use-render/UseRender.svelte',
  'packages/base/src/lib/use-render/index.ts',
  'packages/base/src/lib/use-render/types.ts',
  'packages/utils/src/lib/useMergedRefs.ts',
];
for (const path of retired)
  assert(!existsSync(resolve(root, path)), `Retired module restored: ${path}`);
const exports = JSON.parse(
  readFileSync(resolve(root, 'packages/base/package.json'), 'utf8'),
).exports;
const catalog = JSON.parse(readFileSync(resolve(root, 'parity/catalog.json'), 'utf8'));
const rootEntry = graph.native.modules.find(
  (module) => module.path === 'packages/base/src/lib/index.ts',
);
assert(rootEntry);
assert.equal(hash(readFileSync(resolve(root, rootEntry.path))), rootEntry.sha256);
const sourceApi = {
  scope:
    'Actual package exports and root export AST edges only. Historical catalog module/assertion status is preserved separately; exported source does not establish complete component, type, runtime or parity acceptance.',
  baseManifestSha256: hash(readFileSync(resolve(root, 'packages/base/package.json'))),
  utilsManifestSha256: hash(readFileSync(resolve(root, 'packages/utils/package.json'))),
  rootEntry: { path: rootEntry.path, sha256: rootEntry.sha256 },
  historicalCatalog: {
    path: 'parity/catalog.json',
    sha256: hash(readFileSync(resolve(root, 'parity/catalog.json'))),
    immutableOriginalPin: catalog.upstream.commit,
  },
  originalModuleCorrespondence: catalog.modules.map((module) => {
    const subpath = `./${module.upstreamModule}`;
    const rootExports = rootEntry.imports.filter(
      (edge) => edge.kind === 'runtime' && edge.specifier.startsWith(`${subpath}/`),
    );
    return {
      originalModule: module.upstreamModule,
      currentPackageSubpath: subpath in exports ? subpath : null,
      rootExports,
      currentSourceApiStatus:
        module.upstreamModule === 'use-render'
          ? 'Explicitly retired under the native snippet directive; Original history retained.'
          : subpath in exports || rootExports.length
            ? 'Source export present; broader component acceptance remains separately pending.'
            : 'No current package/root Source export.',
    };
  }),
};
assert(!('./use-render' in exports));
assert(!('./useMergedRefs' in graph.utilsExports));
assert.equal(graph.native.modules.length, 496);
assert.equal(Object.keys(graph.utilsExports).length, 25);
const records = [];
let effectCalls = 0,
  controlledOwners = 0,
  initialFocusAstPreservedBodies = 0,
  popoverSlotAstPreservedBodies = 0,
  buttonDefaultAstPreservedBodies = 0,
  buttonDefaultUnchangedBodies = 0,
  nativeContractAstPreservedBodies = 0,
  hostBusinessAstPreservedBodies = 0,
  positionerPublicationAstPreservedBodies = 0,
  fieldBusinessAstPreservedBodies = 0,
  fieldBusinessUnchangedBodies = 0,
  fieldBusinessCorrectionBodies = 0,
  panelMotionAstPreservedBodies = 0,
  panelMotionUnchangedBodies = 0,
  panelMotionCorrectionBodies = 0,
  publicStyleAstPreservedBodies = 0,
  publicStyleUnchangedBodies = 0,
  publicStyleCorrectionBodies = 0;
for (const module of graph.native.modules) {
  const path = module.path;
  const before = git('show', `${renderer}:${path}`);
  const after = readFileSync(resolve(root, path), 'utf8');
  assert.equal(hash(after), module.sha256, `Stale actual current graph: ${path}`);
  assert(
    !/\b(?:UseRender|createRenderElement|isNativeRefAttachment|preserveUnchangedInlineStyles)\b|<RenderElement\b/.test(
      after,
    ),
    `Retired runtime transport: ${path}`,
  );
  const left = syntax(path, before),
    right = syntax(path, after);
  const equal = JSON.stringify(shape(left, left)) === JSON.stringify(shape(right, right));
  const bindingPreimage = git('show', `${bindingCommentPredecessor}:${path}`);
  const bindingStage = bindingDirectiveHygiene(path, bindingPreimage);
  const initialPreimage = git('show', `${initialFocusPredecessor}:${path}`);
  assert.equal(bindingStage, initialPreimage, `Exact historical binding comment stage: ${path}`);
  const bindingBefore = syntax(path, bindingPreimage);
  const initialBefore = syntax(path, initialPreimage);
  assert.equal(
    JSON.stringify(shape(bindingBefore, bindingBefore)),
    JSON.stringify(shape(initialBefore, initialBefore)),
    `Historical binding comment successor AST changed: ${path}`,
  );
  const initialStage =
    path === initialFocusRuntime ? disposeQueuedInitialFocus(initialPreimage) : initialPreimage;
  const slotPreimage = git('show', `${popoverSlotPredecessor}:${path}`);
  assert.equal(initialStage, slotPreimage, `Exact historical initial-focus owner stage: ${path}`);
  const slotBefore = syntax(path, slotPreimage);
  const initialEqual =
    JSON.stringify(shape(initialBefore, initialBefore)) ===
    JSON.stringify(shape(slotBefore, slotBefore));
  if (path === initialFocusRuntime) assert(!initialEqual);
  else {
    assert(initialEqual);
    initialFocusAstPreservedBodies++;
  }
  const buttonPreimage = git('show', `${buttonDefaultPredecessor}:${path}`);
  assert.equal(
    buttonPreimage,
    path === popoverSlotRuntime ? reactivePopoverFocusTarget(slotPreimage) : slotPreimage,
    `Exact historical real Popover trigger focus-target slot delta: ${path}`,
  );
  const buttonBefore = syntax(path, buttonPreimage);
  const slotEqual =
    JSON.stringify(shape(slotBefore, slotBefore)) ===
    JSON.stringify(shape(buttonBefore, buttonBefore));
  if (path === popoverSlotRuntime) assert(!slotEqual);
  else {
    assert(slotEqual);
    popoverSlotAstPreservedBodies++;
  }
  const contractPreimage = git('show', `${nativeContractPredecessor}:${path}`);
  const contractBefore = syntax(path, contractPreimage);
  assert.equal(
    contractPreimage,
    nativeButtonDefault(path, buttonPreimage),
    `Exact native button default stage: ${path}`,
  );
  assert.equal(
    JSON.stringify(shape(buttonBefore, buttonBefore)),
    JSON.stringify(shape(contractBefore, contractBefore)),
    `Button fallback default leaves the complete script AST unchanged: ${path}`,
  );
  buttonDefaultAstPreservedBodies++;
  if (!buttonDefaultPaths.has(path)) buttonDefaultUnchangedBodies++;
  const hostBusinessPreimage = git('show', `${hostBusinessPredecessor}:${path}`);
  const hostBusinessBefore = syntax(path, hostBusinessPreimage);
  assert.equal(
    hostBusinessPreimage,
    nativeContract(path, contractPreimage),
    `Exact historical native contract successor: ${path}`,
  );
  const contractEqual =
    JSON.stringify(shape(contractBefore, contractBefore)) ===
    JSON.stringify(shape(hostBusinessBefore, hostBusinessBefore));
  if (nativeContractPaths.has(path)) assert(!contractEqual);
  else {
    assert(contractEqual);
    nativeContractAstPreservedBodies++;
  }
  const publicationPreimage = git('show', `${positionerPublicationPredecessor}:${path}`);
  const publicationBefore = syntax(path, publicationPreimage);
  assert.equal(
    publicationPreimage,
    hostBusiness(path, hostBusinessPreimage),
    `Exact historical native host business successor: ${path}`,
  );
  const hostBusinessEqual =
    JSON.stringify(shape(hostBusinessBefore, hostBusinessBefore)) ===
    JSON.stringify(shape(publicationBefore, publicationBefore));
  if (hostBusinessPaths.has(path)) assert(!hostBusinessEqual);
  else {
    assert(hostBusinessEqual);
    hostBusinessAstPreservedBodies++;
  }
  const fieldBusinessPreimage = git('show', `${fieldBusinessPredecessor}:${path}`);
  const fieldBusinessBefore = syntax(path, fieldBusinessPreimage);
  assert.equal(
    fieldBusinessPreimage,
    positionerPublication(path, publicationPreimage),
    `Exact historical native Positioner publication successor: ${path}`,
  );
  const positionerPublicationEqual =
    JSON.stringify(shape(publicationBefore, publicationBefore)) ===
    JSON.stringify(shape(fieldBusinessBefore, fieldBusinessBefore));
  const positionerPublicationCorrection = path === positionerPublicationRuntime;
  if (positionerPublicationCorrection) assert(!positionerPublicationEqual);
  else {
    assert(positionerPublicationEqual);
    positionerPublicationAstPreservedBodies++;
  }
  let fieldBusinessExpected = fieldBusinessPreimage;
  for (const [before, after] of fieldBusinessChanges[path] ?? []) {
    assert.equal(
      fieldBusinessExpected.split(before).length,
      2,
      `One exact reviewed Field business span: ${path}`,
    );
    fieldBusinessExpected = fieldBusinessExpected.replace(before, after);
  }
  const panelMotionPreimage = git('show', `${panelMotionPredecessor}:${path}`);
  const panelMotionBefore = syntax(path, panelMotionPreimage);
  assert.equal(
    panelMotionPreimage,
    fieldBusinessExpected,
    `Exact historical two-body Field business successor: ${path}`,
  );
  const fieldBusinessEqual =
    JSON.stringify(shape(fieldBusinessBefore, fieldBusinessBefore)) ===
    JSON.stringify(shape(panelMotionBefore, panelMotionBefore));
  const fieldBusinessCorrection = fieldBusinessPaths.has(path);
  if (fieldBusinessCorrection) {
    assert(!fieldBusinessEqual);
    fieldBusinessCorrectionBodies++;
  } else {
    assert.equal(
      panelMotionPreimage,
      fieldBusinessPreimage,
      `Unchanged historical complete Field stage body: ${path}`,
    );
    assert(fieldBusinessEqual);
    fieldBusinessUnchangedBodies++;
    fieldBusinessAstPreservedBodies++;
  }
  let panelMotionExpected = panelMotionPreimage;
  if (path === panelMotionRuntime)
    for (const [before, after] of panelMotionChanges) {
      assert.equal(
        panelMotionExpected.split(before).length,
        2,
        'One exact reviewed Collapsible Panel motion span',
      );
      panelMotionExpected = panelMotionExpected.replace(before, after);
    }
  const publicStylePreimage = git('show', `${publicStylePredecessor}:${path}`);
  const publicStyleBefore = syntax(path, publicStylePreimage);
  assert.equal(
    publicStylePreimage,
    panelMotionExpected,
    `Only the exact one-body Collapsible Panel motion successor: ${path}`,
  );
  const panelMotionEqual =
    JSON.stringify(shape(panelMotionBefore, panelMotionBefore)) ===
    JSON.stringify(shape(publicStyleBefore, publicStyleBefore));
  const panelMotionCorrection = path === panelMotionRuntime;
  if (panelMotionCorrection) {
    assert(!panelMotionEqual);
    panelMotionCorrectionBodies++;
  } else {
    assert.equal(
      publicStylePreimage,
      panelMotionPreimage,
      `Unchanged complete Panel motion stage body: ${path}`,
    );
    assert(panelMotionEqual);
    panelMotionUnchangedBodies++;
    panelMotionAstPreservedBodies++;
  }
  let publicStyleExpected = publicStylePreimage;
  for (const [before, after] of publicStyleChanges[path] ?? []) {
    assert.equal(
      publicStyleExpected.split(before).length,
      2,
      `One exact reviewed public style type/import span: ${path}`,
    );
    publicStyleExpected = publicStyleExpected.replace(before, after);
  }
  assert.equal(
    after,
    publicStyleExpected,
    `Only the exact four-body native public style successor: ${path}`,
  );
  const publicStyleEqual =
    JSON.stringify(shape(publicStyleBefore, publicStyleBefore)) ===
    JSON.stringify(shape(right, right));
  const publicStyleCorrection = publicStylePaths.has(path);
  if (publicStyleCorrection) {
    assert(!publicStyleEqual);
    publicStyleCorrectionBodies++;
  } else {
    assert.equal(after, publicStylePreimage, `Unchanged complete public style stage body: ${path}`);
    assert(publicStyleEqual);
    publicStyleUnchangedBodies++;
    publicStyleAstPreservedBodies++;
  }
  const semanticOwnerCorrection = path === 'packages/utils/src/lib/PreviousValue.svelte.ts';
  const labelPublicationCorrection =
    path === 'packages/base/src/lib/utils/useRegisteredLabelId.svelte.ts';
  const installedLabelCorrection = path === 'packages/base/src/lib/menu/GroupLabel.svelte';
  const installedTreeCorrection = [
    'packages/base/src/lib/menu/positioner/createMenuPositioner.svelte.ts',
    'packages/base/src/lib/menu/Popup.svelte',
  ].includes(path);
  const focusMetadataCorrection =
    path === 'packages/base/src/lib/floating-ui/components/createFloatingFocusManager.svelte.ts';
  const triggerPublicationCorrection = [
    'packages/base/src/lib/utils/popups/popupStoreUtils.svelte.ts',
    'packages/base/src/lib/menu/trigger/createMenuTrigger.svelte.ts',
  ].includes(path);
  const popoverSlotCorrection = path === popoverSlotRuntime;
  const nativeOwnerCorrection = [
    'packages/base/src/lib/dialog/store/DialogStore.svelte.ts',
    'packages/base/src/lib/floating-ui/components/FloatingPortal.svelte',
    'packages/base/src/lib/menu/root/createMenuRoot.svelte.ts',
    'packages/base/src/lib/utils/popups/useTriggerFocusGuards.svelte.ts',
  ].includes(path);
  if (nativeOwnerCorrection)
    assert.equal(
      after,
      nativeContract(
        path,
        reactiveNativeOwners(path, git('show', `${nativeOwnerPredecessor}:${path}`)),
      ),
      `Only the authorized complete-body native owner delta: ${path}`,
    );
  if (triggerPublicationCorrection) {
    let expected = git('show', `${registrationPredecessor}:${path}`);
    if (path.endsWith('createMenuTrigger.svelte.ts')) {
      expected = expected.replace('    buttonRef(host);', '    untrack(() => buttonRef(host));');
    } else {
      const indent = (body) => body.replace(/^(.+)$/gm, '  $1');
      const registrationStart = expected.indexOf(
        '    const registration = registrationRef.current;',
      );
      const registrationEnd = expected.indexOf('\n  };\n}', registrationStart);
      assert(registrationStart > 0 && registrationEnd > registrationStart);
      const registrationBody = expected.slice(registrationStart, registrationEnd);
      expected =
        expected.slice(0, registrationStart) +
        '    untrack(() => {\n' +
        indent(registrationBody) +
        '\n    });' +
        expected.slice(registrationEnd);
      const dataStart = expected.indexOf("    const open = store.select('open');");
      const dataEnd = expected.indexOf('\n  };', dataStart);
      assert(dataStart > 0 && dataEnd > dataStart);
      const dataBody = expected
        .slice(dataStart, dataEnd)
        .replaceAll('store.select(', 'owner.select(')
        .replaceAll('store.update(', 'owner.update(')
        .replaceAll('=== triggerId', '=== id')
        .replaceAll('activeTriggerId: triggerId ?? null', 'activeTriggerId: id ?? null');
      expected =
        expected.slice(0, dataStart) +
        '    const owner = store;\n    const id = triggerId;\n    untrack(() => {\n' +
        indent(dataBody) +
        '\n    });' +
        expected.slice(dataEnd);
      expected = clarifyTriggerOwnership(expected);
      const commentPreimage = git('show', `${ownershipCommentPredecessor}:${path}`);
      assert.equal(after, clarifyTriggerOwnership(commentPreimage));
      const commentBefore = syntax(path, commentPreimage);
      assert.equal(
        JSON.stringify(shape(commentBefore, commentBefore)),
        JSON.stringify(shape(right, right)),
      );
    }
    assert.equal(after, expected, `Only the authorized complete-body publication delta: ${path}`);
  }
  if (focusMetadataCorrection) {
    let expected = git('show', `${focusPredecessor}:${path}`)
      .replace(
        "import { onDestroy } from 'svelte';",
        "import { onDestroy, untrack } from 'svelte';",
      )
      .replace(
        '    const preferPreviousFocus = openInteractionTypeRef.current == null;',
        "    // Opening metadata chooses this owner's return priority; later changes do not dispose it.\n" +
          '    const preferPreviousFocus = untrack(() => openInteractionTypeRef.current == null);',
      );
    expected = disposeQueuedInitialFocus(disposeQueuedFocusOutside(expected));
    assert.equal(after, expected, `Only the authorized complete-body metadata delta: ${path}`);
    assert.equal(
      after,
      disposeQueuedInitialFocus(
        disposeQueuedFocusOutside(git('show', `${nativeOwnerPredecessor}:${path}`)),
      ),
      'Only the native owner disposal flag, focus-out queued check and initial-focus predicate/comment stages change',
    );
  }
  if (installedLabelCorrection || installedTreeCorrection) {
    let expected = git('show', `${cleanupPredecessor}:${path}`);
    if (installedLabelCorrection) {
      expected = expected
        .replace('    setLabelId(id);', '    const installedId = id;\n    setLabelId(installedId);')
        .replace('currentId === id ?', 'currentId === installedId ?');
    } else {
      const subscriptions = path.endsWith('Popup.svelte')
        ? [['close', 'handleClose']]
        : [
            ['menuopenchange', 'onMenuOpenChange'],
            ['menuopenchange', 'onParentClose'],
            ['itemhover', 'onItemHover'],
          ];
      for (const [event, callback] of subscriptions)
        expected = expected
          .replace(
            `    floatingTreeRoot.events.on('${event}', ${callback});`,
            `    const installedEvents = floatingTreeRoot.events;\n    installedEvents.on('${event}', ${callback});`,
          )
          .replace(
            `      floatingTreeRoot.events.off('${event}', ${callback});`,
            `      installedEvents.off('${event}', ${callback});`,
          );
    }
    assert.equal(
      publicationPreimage,
      bindingDirectiveHygiene(path, expected),
      `Only the historical complete-body cleanup delta and binding comment: ${path}`,
    );
  }
  if (semanticOwnerCorrection)
    assert.equal(
      after,
      git('show', `${native}:${path}`),
      'Inherit the exact minimal native owner correction',
    );
  if (labelPublicationCorrection)
    assert.equal(
      after,
      git('show', `${nativeIntegrationParent}:${path}`),
      'Inherit the exact narrow native registered-label publication correction',
    );
  const record = {
    path,
    rendererSha256: hash(before),
    currentSha256: hash(after),
    scriptStructuralAstEqual: equal,
    sourceSyntaxValid: true,
    disposition: popoverSlotCorrection
      ? 'Root-authorized actual PopoverStore-owned native reactive trigger focus-target node property; plain inert default and shared DOM/focus/open/cleanup business retained. Candidate execution pending.'
      : nativeOwnerCorrection
        ? 'Root-authorized actual native reactive node properties or narrow one-shot Menu seed publication; complete binding/callback/live synchronization business retained. Candidate execution pending.'
        : triggerPublicationCorrection
          ? 'Root-authorized narrow native registration/data/button publication boundaries; actual Store and ID acquired outside untrack, Original registration/count/data bodies and independent effects retained. Candidate runtime execution pending.'
          : focusMetadataCorrection
            ? 'Root-authorized native untrack of captured opening metadata and component-destroy guards for queued focus-out work and the first initial-focus frame predicate before rune-backed reads; actual node/disabled/bus dependencies, uncanceled frame mechanism, live-owner initial focus, latest returnFocus and intentional captured-target teardown retained. Candidate execution pending.'
            : installedLabelCorrection
              ? 'Root-authorized effect-local installed label ID capture, preserving conditional replacement-label protection; actual DOM witnesses unexecuted.'
              : installedTreeCorrection
                ? 'Root-authorized effect-local installed event bus captures; complete callbacks, live business reads and domain guards retained; actual owner migration/unmount witnesses unexecuted.'
                : labelPublicationCorrection
                  ? 'Exact native76 tracked installed ID with narrow untracked imperative receiver publication; live receiver and conditional cleanup retained. Integrated-head execution pending.'
                  : semanticOwnerCorrection
                    ? 'Exact native76 ordinary tracked getter correction; integrated execution/review pending.'
                    : equal
                      ? 'Complete structural script AST retained; full native markup/compiled-output behavior remains separately pending.'
                      : 'Explicit presentation/grouping changes retained without normalization or structural equality credit; compiled-output disposition pending.',
  };
  if (
    semanticOwnerCorrection ||
    labelPublicationCorrection ||
    installedLabelCorrection ||
    installedTreeCorrection ||
    focusMetadataCorrection ||
    triggerPublicationCorrection ||
    nativeOwnerCorrection ||
    popoverSlotCorrection
  )
    record.sourceBusinessCorrection = true;
  if (buttonDefaultPaths.has(path)) {
    record.sourceHostDefaultCorrection = true;
    record.sourceHostDefaultPredecessor = buttonDefaultPredecessor;
    record.sourceHostDefaultPredecessorSha256 = hash(buttonPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.disposition +=
      ' Native intrinsic fallback restores the pinned non-submit default with literal type="button" before props spread; script AST and custom snippet props are unchanged. Execution pending.';
  }
  if (nativeContractPaths.has(path)) {
    record.sourceNativeContractCorrection = true;
    record.sourceNativeContractPredecessor = nativeContractPredecessor;
    record.sourceNativeContractPredecessorSha256 = hash(contractPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.disposition =
      'Root-authorized native HTMLElement host/output declarations and canonical snippet/Toast button contracts, ToastClose component-state rune-collision rename, or appearance producers retaining their known once-resolved class and consumer style. Existing business, handler composition and native host ownership retained; type/runtime execution pending.';
  }
  if (hostBusinessPaths.has(path)) {
    record.sourceBusinessCorrection = true;
    record.sourceHostBusinessLifetimeCorrection = true;
    record.sourceHostBusinessPredecessor = hostBusinessPredecessor;
    record.sourceHostBusinessPredecessorSha256 = hash(hostBusinessPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
    record.disposition = path.endsWith('useButton.svelte.ts')
      ? 'Root-authorized ordinary native getter over the existing actual useButton node property; no new state/mirror or disabled/prop business change. Execution pending.'
      : path.endsWith('ToolbarButton.svelte')
        ? 'Root-authorized captured-host identity guard for Toolbar cleanup of the existing actual button business node; forwarded disabled, prop sources, updateDisabled and native attachment setup remain. Execution pending.'
        : 'Root-authorized narrow submenu item publication and implicit-active registration boundary with actual Store/ID acquisition outside untrack; tracked list acquisition, conditional closeDelay, migration/disabled synchronization, registration/cleanup order and all callbacks remain. Native owner comments replace merged-ref wording. Execution pending.';
  }
  if (positionerPublicationCorrection) {
    record.sourceBusinessCorrection = true;
    record.sourcePositionerPublicationCorrection = true;
    record.sourcePositionerPublicationPredecessor = positionerPublicationPredecessor;
    record.sourcePositionerPublicationPredecessorSha256 = hash(publicationPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
    record.disposition +=
      ' Root-authorized native untrack only around captured getRef/Store host publication and owned null cleanup; actual Store/host acquisition, publication order, pinned parent propagation and live positioning/effects remain. Candidate runtime execution pending.';
  }
  if (fieldBusinessCorrection) {
    record.sourceBusinessCorrection = true;
    record.sourceFieldBusinessCorrection = true;
    record.sourceFieldBusinessPredecessor = fieldBusinessPredecessor;
    record.sourceFieldBusinessPredecessorSha256 = hash(fieldBusinessPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
    record.disposition = path.endsWith('Error.svelte')
      ? 'Root-reviewed supplied-content precedence: an own children property, including undefined, overrides generated error content in both actual native rendering branches; host props exclude children. Message selection/order, native unkeyed list, registration and transition business remain. Candidate execution pending.'
      : 'Root-reviewed live imperative message-ID resource with native raw publication; functional updates use the current resource through sibling cleanup/setup. Append/filter order, captured cleanup IDs, parent/external descriptions and Set deduplication remain. Candidate execution pending.';
  }
  if (panelMotionCorrection) {
    record.sourceBusinessCorrection = true;
    record.sourceNativePanelMotionCorrection = true;
    record.sourceNativePanelMotionPredecessor = panelMotionPredecessor;
    record.sourceNativePanelMotionPredecessorSha256 = hash(panelMotionPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
    record.disposition =
      'Root-reviewed accepted-beforematch motion state for the actual host/open cycle feeds derived native markup through dimension commits; close resolves live authored duration before motion measurement. Captured host cleanup clears only its state. Detached hosts retain last native markup, and consumer important declarations/custom-host style directives keep native precedence. Public style remains string or state-to-string. Existing cancellation, skip consumption, measurement and observer business remain. Successor execution pending; zero divergent unchanged Original credit.';
  }
  if (publicStyleCorrection) {
    record.sourceNativePublicStyleCorrection = true;
    record.sourceNativePublicStylePredecessor = publicStylePredecessor;
    record.sourceNativePublicStylePredecessorSha256 = hash(publicStylePreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
    record.disposition +=
      ' Native public style type/import successor derives CSS string/null/undefined from Svelte HTMLAttributes and preserves the existing exact state callback across canonical and legacy declarations. Only four complete type/import bodies change against 4aa; pure internal CSS records, serialization, merge/identity, functions/effects, hosts and all earlier runtime business remain exact. Source proof supplies no new type, artifact, runtime or Original assertion acceptance; execution pending.';
  }
  if (installedLabelCorrection || installedTreeCorrection) {
    record.sourceBusinessPredecessor = cleanupPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${cleanupPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
  }
  if (focusMetadataCorrection) {
    record.sourceBusinessPredecessor = focusPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${focusPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
    record.sourceInitialFocusDisposalPredecessor = initialFocusPredecessor;
    record.sourceInitialFocusDisposalPredecessorSha256 = hash(initialPreimage);
    record.sourceInitialFocusDisposalOrdinaryDeclarationCredit = 0;
    record.sourceResourceDisposalPredecessor = nativeOwnerPredecessor;
    record.sourceResourceDisposalPredecessorSha256 = hash(
      git('show', `${nativeOwnerPredecessor}:${path}`),
    );
  }
  if (popoverSlotCorrection) {
    record.sourceBusinessPredecessor = popoverSlotPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(slotPreimage);
    record.exactAuthorizedCompleteBodyDelta = true;
    record.ordinaryDeclarationCredit = 0;
  }
  if (nativeOwnerCorrection) {
    record.sourceBusinessPredecessor = nativeOwnerPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(git('show', `${nativeOwnerPredecessor}:${path}`));
    record.exactAuthorizedCompleteBodyDelta = true;
  }
  if (triggerPublicationCorrection) {
    record.sourceBusinessPredecessor = registrationPredecessor;
    record.sourceBusinessPredecessorSha256 = hash(
      git('show', `${registrationPredecessor}:${path}`),
    );
    record.exactAuthorizedCompleteBodyDelta = true;
    if (path.endsWith('popupStoreUtils.svelte.ts')) {
      record.commentOnlyPredecessor = ownershipCommentPredecessor;
      record.commentOnlyPredecessorSha256 = hash(
        git('show', `${ownershipCommentPredecessor}:${path}`),
      );
      record.commentOnlyStructuralAstEqual = true;
    }
  }
  if (labelPublicationCorrection) {
    record.sourceBusinessPredecessor = '6ec6710c1ec6d62a7b9decf3dfdaa335a76d3ce7';
    record.sourceBusinessPredecessorSha256 = hash(
      git('show', `${record.sourceBusinessPredecessor}:${path}`),
    );
    record.exactInheritedNativeParentBody = nativeIntegrationParent;
  }
  if (obsoleteBindingDirectivePaths.has(path) || path === radioBindingPath) {
    record.commentOnlyPredecessor = bindingCommentPredecessor;
    record.commentOnlyPredecessorSha256 = hash(bindingPreimage);
    record.commentOnlyStructuralAstEqual = true;
    record.commentOnlyDisposition =
      path === radioBindingPath
        ? 'Documents the real Svelte output-binding macro; no value/read/API change. Standards rerun pending.'
        : 'Removes exactly one proven unused no-useless-assignment directive; native host binding unchanged. Standards rerun pending.';
  }
  if (!equal) record.structuralDifferences = differences(left, right, left, right);
  records.push(record);
  function count(node) {
    if (
      ts.isCallExpression(node) &&
      ['$effect', '$effect.pre'].includes(node.expression.getText(right))
    )
      effectCalls++;
    if (ts.isNewExpression(node) && node.expression.getText(right) === 'Controlled')
      controlledOwners++;
    ts.forEachChild(node, count);
  }
  count(right);
}
const preimages = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/integration-predecessors.json'), 'utf8'),
);
for (const checkpoint of preimages.checkpoints)
  for (const file of checkpoint.files) {
    const body = readFileSync(resolve(root, file.archive));
    assert.equal(hash(body), file.sha256, `Changed exact predecessor archive: ${file.archive}`);
    assert.equal(
      body.toString(),
      git('show', `${checkpoint.commit}:${file.predecessorPath}`),
      `Archive differs from immutable object: ${file.archive}`,
    );
  }
const focusLifetime = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/focus-return-lifetime.json'), 'utf8'),
);
assert.equal(focusLifetime.predecessor, focusPredecessor);
assert.equal(focusLifetime.pin, graph.immutableOriginalPin);
assert.equal(hash(readFileSync(resolve(root, focusLifetime.runtime))), focusLifetime.runtimeSha256);
for (const original of focusLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
assert.equal(
  hash(readFileSync(resolve(root, focusLifetime.diagnosis.archive))),
  focusLifetime.diagnosis.sha256,
);
for (const witness of focusLifetime.witnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed focus witness body: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${focusPredecessor}:${witness.path}`));
}
const triggerLifetime = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/trigger-publication-lifetime.json'), 'utf8'),
);
assert.equal(triggerLifetime.predecessor, registrationPredecessor);
assert.equal(triggerLifetime.pin, graph.immutableOriginalPin);
for (const runtime of triggerLifetime.runtime) {
  assert.equal(hash(readFileSync(resolve(root, runtime.path))), runtime.sha256);
  assert.equal(
    hash(git('show', `${registrationPredecessor}:${runtime.path}`)),
    runtime.predecessorSha256,
  );
}
for (const original of triggerLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
assert.equal(
  hash(readFileSync(resolve(root, triggerLifetime.diagnosis.archive))),
  triggerLifetime.diagnosis.sha256,
);
for (const witness of triggerLifetime.witnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed trigger witness body: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${registrationPredecessor}:${witness.path}`));
}
const nativeLifetime = JSON.parse(
  readFileSync(resolve(root, 'parity/native-snippets/native-owner-lifetime.json'), 'utf8'),
);
assert.equal(nativeLifetime.predecessor, nativeOwnerPredecessor);
assert.equal(nativeLifetime.pin, graph.immutableOriginalPin);
for (const runtime of nativeLifetime.runtime) {
  assert.equal(hash(readFileSync(resolve(root, runtime.path))), runtime.sha256);
  assert.equal(
    hash(git('show', `${nativeOwnerPredecessor}:${runtime.path}`)),
    runtime.predecessorSha256,
  );
}
for (const original of nativeLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
for (const diagnosis of nativeLifetime.diagnostics)
  assert.equal(hash(readFileSync(resolve(root, diagnosis.archive))), diagnosis.sha256);
for (const witness of nativeLifetime.witnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed native owner witness: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${nativeOwnerPredecessor}:${witness.path}`));
}
for (const receipt of [focusLifetime, nativeLifetime]) {
  assert.equal(receipt.nativeInitialFocusDisposalStage.predecessor, initialFocusPredecessor);
  assert.equal(receipt.nativeInitialFocusDisposalStage.ordinaryDeclarationCredit, 0);
  assert.equal(
    receipt.nativeInitialFocusDisposalStage.predecessorRuntimeSha256,
    hash(git('show', `${initialFocusPredecessor}:${initialFocusRuntime}`)),
  );
}
assert.equal(initialFocusAstPreservedBodies, 495);
assert.equal(popoverSlotAstPreservedBodies, 495);
const slotStage = nativeLifetime.nativePopoverFocusTargetStage;
assert.equal(slotStage.predecessor, popoverSlotPredecessor);
assert.equal(slotStage.ordinaryDeclarationCredit, 0);
assert.equal(slotStage.runtime.path, popoverSlotRuntime);
assert.equal(hash(readFileSync(resolve(root, slotStage.runtime.path))), slotStage.runtime.sha256);
assert.equal(
  hash(git('show', `${popoverSlotPredecessor}:${popoverSlotRuntime}`)),
  slotStage.runtime.predecessorSha256,
);
assert.equal(
  hash(readFileSync(resolve(root, slotStage.original.archive))),
  slotStage.original.sha256,
);
assert.equal(buttonDefaultAstPreservedBodies, 496);
assert.equal(buttonDefaultUnchangedBodies, 486);
assert.equal(nativeContractAstPreservedBodies, 486);
assert.equal(hostBusinessAstPreservedBodies, 493);
assert.equal(positionerPublicationAstPreservedBodies, 495);
const publicationLifetime = JSON.parse(
  readFileSync(
    resolve(root, 'parity/native-snippets/menu-positioner-publication-lifetime.json'),
    'utf8',
  ),
);
assert.equal(publicationLifetime.predecessor, positionerPublicationPredecessor);
assert.equal(publicationLifetime.pin, graph.immutableOriginalPin);
assert.equal(publicationLifetime.ordinaryDeclarationCredit, 0);
assert.equal(publicationLifetime.runtime.path, positionerPublicationRuntime);
assert.equal(
  hash(readFileSync(resolve(root, publicationLifetime.runtime.path))),
  publicationLifetime.runtime.sha256,
);
assert.equal(
  hash(git('show', `${positionerPublicationPredecessor}:${positionerPublicationRuntime}`)),
  publicationLifetime.runtime.predecessorSha256,
);
for (const original of publicationLifetime.original)
  assert.equal(hash(readFileSync(resolve(root, original.archive))), original.sha256);
for (const witness of publicationLifetime.unchangedWitnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed Positioner witness: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${positionerPublicationPredecessor}:${witness.path}`));
}
assert.equal(fieldBusinessAstPreservedBodies, 494);
assert.equal(fieldBusinessUnchangedBodies, 494);
assert.equal(fieldBusinessCorrectionBodies, 2);
const fieldCorrespondence = JSON.parse(
  readFileSync(resolve(root, 'parity/field-form/source-correspondence.json'), 'utf8'),
);
const fieldStage = fieldCorrespondence.nativeSnippetFieldBusinessRepair;
assert.equal(fieldStage.predecessor, fieldBusinessPredecessor);
assert.equal(fieldStage.historicalSourceSuccessor, panelMotionPredecessor);
assert.equal(fieldStage.pin, graph.immutableOriginalPin);
assert.equal(fieldStage.ordinaryDeclarationCredit, 0);
assert.deepEqual(
  fieldStage.runtime.map((runtime) => runtime.path),
  [...fieldBusinessPaths],
);
for (const runtime of fieldStage.runtime) {
  assert.equal(hash(readFileSync(resolve(root, runtime.path))), runtime.sha256);
  assert.equal(
    hash(git('show', `${fieldBusinessPredecessor}:${runtime.path}`)),
    runtime.predecessorSha256,
  );
}
const fieldOriginalInventory = JSON.parse(
  readFileSync(resolve(root, 'parity/field-form/upstream-inventory.json'), 'utf8'),
);
assert.equal(fieldOriginalInventory.upstream.commit, graph.immutableOriginalPin);
assert.deepEqual(
  fieldStage.original.map((original) => original.path),
  [
    'packages/react/src/field/error/FieldError.tsx',
    'packages/react/src/internals/labelable-provider/LabelableProvider.tsx',
  ],
);
for (const original of fieldStage.original) {
  assert.equal(
    fieldOriginalInventory.sources.find((source) => source.source === original.path).sha256,
    original.sha256,
  );
  assert.equal(
    fieldCorrespondence.records.find((record) => record.source === original.path).sourceSha256,
    original.sha256,
  );
}
assert.deepEqual(
  fieldStage.unchangedWitnesses.map((witness) => witness.path),
  [
    'packages/base/tests/dom/field-validation-source.test.ts',
    'packages/base/tests/dom/FieldValidationSourceFixture.svelte',
    'packages/base/tests/dom/field-error-ownership.test.ts',
    'packages/base/tests/dom/FieldFormFixture.svelte',
    'packages/base/tests/dom/NativeErrorMessagesFixture.svelte',
    'packages/base/tests/dom/field-registration-ids.test.ts',
    'packages/base/tests/dom/FieldRegistrationIdsFixture.svelte',
  ],
);
for (const witness of fieldStage.unchangedWitnesses) {
  const body = readFileSync(resolve(root, witness.path));
  assert.equal(hash(body), witness.sha256, `Changed Field witness body: ${witness.path}`);
  assert.equal(body.toString(), git('show', `${fieldBusinessPredecessor}:${witness.path}`));
}
assert.equal(panelMotionAstPreservedBodies, 495);
assert.equal(panelMotionUnchangedBodies, 495);
assert.equal(panelMotionCorrectionBodies, 1);
assert.equal(publicStyleAstPreservedBodies, 492);
assert.equal(publicStyleUnchangedBodies, 492);
assert.equal(publicStyleCorrectionBodies, 4);
const panelMotionLifetime = JSON.parse(
  readFileSync(
    resolve(root, 'parity/native-snippets/collapsible-panel-motion-lifetime.json'),
    'utf8',
  ),
);
assert.equal(panelMotionLifetime.predecessor, panelMotionPredecessor);
assert.equal(panelMotionLifetime.pin, graph.immutableOriginalPin);
assert.equal(panelMotionLifetime.ordinaryDeclarationCredit, 0);
assert.equal(panelMotionLifetime.runtime.path, panelMotionRuntime);
assert.equal(
  hash(readFileSync(resolve(root, panelMotionRuntime))),
  panelMotionLifetime.runtime.sha256,
);
assert.equal(
  hash(git('show', `${panelMotionPredecessor}:${panelMotionRuntime}`)),
  panelMotionLifetime.runtime.predecessorSha256,
);
const panelOriginalInventory = JSON.parse(
  readFileSync(resolve(root, 'parity/collapsible/upstream-inventory.json'), 'utf8'),
);
assert.equal(panelOriginalInventory.upstream.commit, graph.immutableOriginalPin);
assert.deepEqual(
  panelMotionLifetime.original.map((original) => original.path),
  [
    'packages/react/src/collapsible/panel/CollapsiblePanel.tsx',
    'packages/react/src/collapsible/panel/useCollapsiblePanel.ts',
  ],
);
for (const original of panelMotionLifetime.original)
  assert.equal(
    panelOriginalInventory.sources.find((source) => source.source === original.path).sha256,
    original.sha256,
  );
const buttonDefaultOriginal = {
  pin: graph.immutableOriginalPin,
  path: 'packages/react/src/internals/useRenderElement.tsx',
  archive: 'parity/menu-family/upstream/packages/react/src/internals/useRenderElement.tsx',
  sha256: '0b55dc232a0d630a666a13873213d1bdde040e973031f2b307a64cc157644a4c',
  contract:
    'renderTag(button, props) supplies literal type="button" before the spread only for the intrinsic fallback; a custom render function receives unchanged props.',
};
const originalRendererBody = readFileSync(resolve(root, buttonDefaultOriginal.archive), 'utf8');
assert.equal(hash(originalRendererBody), buttonDefaultOriginal.sha256);
assert(originalRendererBody.includes('<button type="button" {...props} key={props.key} />'));
const output = {
  rendererPredecessor: renderer,
  nativeIntegrationParent,
  nativeGetterPredecessor: native,
  focusMetadataPredecessor: focusPredecessor,
  triggerPublicationPredecessor: registrationPredecessor,
  ownershipCommentPredecessor,
  nativeOwnerPredecessor,
  bindingCommentPredecessor,
  bindingCommentAstPreservedBodies: records.length,
  initialFocusPredecessor,
  initialFocusAstPreservedBodies,
  popoverSlotPredecessor,
  popoverSlotAstPreservedBodies,
  buttonDefaultPredecessor,
  buttonDefaultAstPreservedBodies,
  buttonDefaultUnchangedBodies,
  buttonDefaultOriginal,
  nativeContractPredecessor,
  nativeContractAstPreservedBodies,
  sourceNativeContractCorrectionPaths: records
    .filter((record) => record.sourceNativeContractCorrection)
    .map((record) => record.path),
  hostBusinessPredecessor,
  hostBusinessAstPreservedBodies,
  positionerPublicationPredecessor,
  positionerPublicationAstPreservedBodies,
  sourcePositionerPublicationCorrectionPaths: records
    .filter((record) => record.sourcePositionerPublicationCorrection)
    .map((record) => record.path),
  fieldBusinessPredecessor,
  fieldBusinessAstPreservedBodies,
  fieldBusinessUnchangedBodies,
  fieldBusinessCorrectionBodies,
  sourceFieldBusinessCorrectionPaths: records
    .filter((record) => record.sourceFieldBusinessCorrection)
    .map((record) => record.path),
  panelMotionPredecessor,
  panelMotionAstPreservedBodies,
  panelMotionUnchangedBodies,
  panelMotionCorrectionBodies,
  sourceNativePanelMotionCorrectionPaths: records
    .filter((record) => record.sourceNativePanelMotionCorrection)
    .map((record) => record.path),
  publicStylePredecessor,
  publicStyleAstPreservedBodies,
  publicStyleUnchangedBodies,
  publicStyleCorrectionBodies,
  sourceNativePublicStyleCorrectionPaths: records
    .filter((record) => record.sourceNativePublicStyleCorrection)
    .map((record) => record.path),
  sourceHostBusinessLifetimeCorrectionPaths: records
    .filter((record) => record.sourceHostBusinessLifetimeCorrection)
    .map((record) => record.path),
  sourceHostDefaultCorrectionPaths: records
    .filter((record) => record.sourceHostDefaultCorrection)
    .map((record) => record.path),
  immutableOriginalPin: graph.immutableOriginalPin,
  ordinaryDeclarationCredit: 0,
  mode: 'Source/parser/hash/import evidence only; no type program, runtime, SSR/hydration, compiled markup, artifact, installed consumer, browser, CI or merge acceptance credit.',
  method:
    'Complete current native two-package AST closure, immutable f0 full-body preimages and grouping-preserving script ASTs. Deliberate source/native owner corrections remain separate from formatter presentation changes. Getter/label publication retain exact inherited bodies; full-body Menu cleanup deltas bind e5, captured focus metadata binds42, trigger publication bindsf2, and native ownership comments bind336 with its AST unchanged. The five native node/initial-seed/focus-out disposal owner deltas bindc392 while all earlier stages/history remain distinct. The subsequent 32 obsolete binding directives and one RadioGroup output-binding annotation bind 0d with all 496 complete bodies otherwise unchanged and every script AST identical. The next native initial-focus destroyed-owner predicate and adjacent timing comment bind ec36 as one complete Source-body delta; all other 495 current bodies/ASTs stay exact. This native owner adaptation earns zero unchanged Original credit. The subsequent real Popover trigger focus-target node property binds 0ba as one complete Source-body delta with 495 other current bodies/ASTs exact; earlier stages retain their own immutable preservation counts. The next ten intrinsic button fallback defaults bind d5 as exact literal attributes before props spread; all 496 script ASTs and 486 other full bodies remain unchanged. Custom render branches and merged props remain untouched. The Original fallback default is expressed as native host markup with no shared renderer or new assertion credit. The subsequent ten native declaration/producer contract repairs bind c0 as exact complete-body transforms; the other 486 bodies and script ASTs remain exact. Seven declaration paths, a ToastClose rune-collision identifier rename and two known appearance producers retain their existing business and handler composition. Type/runtime acceptance remains pending. The next three native host-business lifetime deltas bind c04 as exact complete bodies: an ordinary getter over the actual button node, Toolbar captured-host cleanup and narrow submenu imperative item/implicit-active publication. The other 493 current bodies/ASTs are exact, and prior c0/d5 preservation counts remain historical. Disabled/prop/event algorithms, tracked list acquisition and independent migration/closeDelay effects remain. Parse success supplies no behavior equivalence. The next single Positioner imperative publication/cleanup boundary binds the full d390 preimage; the other 495 complete bodies/ASTs stay exact, while all earlier historical stage counts remain unchanged. Actual context Store and host acquisition, pinned parent subscription, synchronous callback order and live positioning/effects remain. This source proof grants no runtime-cause, pass or unchanged Original assertion credit. The subsequent two reviewed Field business repairs bind the complete acde preimages: own supplied-child presence controls Error content and a live imperative message-ID resource publishes through native raw state. Only those exact reviewed spans change; the other 494 complete bodies and script ASTs stay exact. The d390 Menu boundary and every earlier preservation count remain historical. Original inventory/correspondence hashes and all existing Field witness bodies remain unchanged, with zero new declaration or execution credit. The next one-body Collapsible Panel stage binds the complete coherent Field predecessor with 495 other bodies and grouping-preserving script ASTs exact. Accepted-beforematch motion becomes actual-host/open-cycle native state and derived zero-duration markup; close resolves live authored duration. The acde-to-Field two-body 494 stage and d390-to-acde Menu 495 stage remain historical. Detached native markup and consumer important/custom-host overrides are intentional native boundaries with zero divergent unchanged Original credit. Separate favicon and supplemental assertion edits are non-runtime metadata; Source proof grants no successor execution or acceptance credit. The subsequent four-body native public style type/import stage binds the complete 4aa predecessor, preserving all 492 other complete bodies and grouping-preserving script ASTs. The historical one-Panel 495, two-Field 494 and Menu 495 stages are frozen against their exact predecessor/successor bodies rather than rewritten for current declarations. Canonical NativeStyle derives Svelte CSS string/null/undefined, and legacy Dialog/Avatar/Toast reuse the same state-specific style slot. Internal style records, pure serialization and merge/identity function bodies remain; no runtime guard or object-business rewrite is introduced. Earlier authored public object-style API and prior receipts stay historical; this declaration correction earns zero divergent unchanged Original credit and no type/runtime/artifact/acceptance credit before actual gates.',
  parserVersions: { TypeScript: ts.version, Svelte: compiler.VERSION },
  currentGraphSha256: hash(
    readFileSync(resolve(root, 'parity/utils-package/current-source-graph.json')),
  ),
  currentPublicHostGraphSha256: hash(
    readFileSync(resolve(root, 'parity/native-snippets/native-graph.json')),
  ),
  proofToolSha256: hash(readFileSync(new URL(import.meta.url))),
  controlledOwners,
  effectCalls,
  sourceBusinessCorrectionPaths: records
    .filter((record) => record.sourceBusinessCorrection)
    .map((record) => record.path),
  utilsExports: Object.keys(graph.utilsExports),
  baseExports: exports,
  sourceApi,
  retired,
  records,
};
const destination = resolve(root, 'parity/native-snippets/integration-current.json');
const text = JSON.stringify(output, null, 2) + '\n';
if (process.argv.includes('--write')) writeFileSync(destination, text);
else
  assert.equal(
    readFileSync(destination, 'utf8'),
    text,
    'Actual native snippet integration proof is stale',
  );
console.log(
  `Native snippet source proof: ${records.length} complete current bodies; ${controlledOwners} Controlled owners; ${effectCalls} actual effect calls; ${records.filter((record) => !record.scriptStructuralAstEqual).length} explicit script changes; 25 Utils exports; eleven retirements.`,
);
