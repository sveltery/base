// Pinned Base UI v1.8.0 Button/useButton fixtures. MIT: parity/button/UPSTREAM_LICENSE.
import { createElement as h, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@base-ui/react/button';
export function mountButtonReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const [becameDisabled, setDisabled] = useState(false);
    const [calls, setCalls] = useState<Record<string, number>>({ click: 0, mouse: 0, pointer: 0, keydown: 0, keyup: 0, hover: 0, focus: 0, blur: 0, render: 0, capture: 0, ancestor: 0, submit: 0, reset: 0 });
    const [clicks, setClicks] = useState<{ shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean; detail: number; type: string }[]>([]);
    const count = (channel: string) => setCalls(previous => ({ ...previous, [channel]: previous[channel] + 1 }));
    const custom = ['link', 'custom', 'modifier', 'custom-disabled', 'custom-focusable', 'cancel-base', 'cancel-enter', 'cancel-space', 'space-order', 'enter-order', 'focus-blur', 'descendant', 'render-cancel', 'click-cancel'].includes(scenario);
    const disabled = ['native-disabled', 'custom-disabled'].includes(scenario) || ['native-focusable', 'custom-focusable', 'hover', 'focus-blur'].includes(scenario) || becameDisabled;
    const focusable = scenario.includes('focusable') || ['hover', 'becomes-disabled', 'focus-blur'].includes(scenario);
    return h('main', { 'data-hydrated': 'true' },
      h('div', { onClick: () => count('ancestor') },
        h('form', { onSubmit: event => { event.preventDefault(); count('submit'); }, onReset: () => count('reset') },
          scenario === 'reset' ? h('input', { 'aria-label': 'Reset field', defaultValue: 'initial' }) : null,
          h(Button, {
            id: 'tested-button', disabled, focusableWhenDisabled: focusable, nativeButton: !custom,
            type: scenario === 'submit' || scenario === 'reset' ? scenario : undefined,
            render: scenario === 'link' ? h('a', { href: '#target' }) : custom ? h('span', {
              onClick: (event: React.MouseEvent & { preventBaseUIHandler(): void }) => { count('render'); if (scenario === 'render-cancel') event.preventBaseUIHandler(); }, onClickCapture: () => count('capture'),
            }) : undefined,
            onClick: event => { count('click'); setClicks(previous => [...previous, { shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey, detail: event.detail, type: event.type }]); if (scenario === 'becomes-disabled') setDisabled(true); if (scenario === 'click-cancel') event.preventDefault(); },
            onMouseDown: () => count('mouse'), onPointerDown: () => count('pointer'),
            onKeyDown: event => { count('keydown'); if (scenario === 'cancel-base') event.preventBaseUIHandler(); if (scenario === 'cancel-enter') event.preventDefault(); },
            onKeyUp: event => { count('keyup'); if (scenario === 'cancel-base') event.preventBaseUIHandler(); if (scenario === 'cancel-space') event.preventDefault(); },
            onMouseMove: () => count('hover'), onFocus: () => count('focus'), onBlur: () => count('blur'),
          }, scenario === 'link' ? 'Go' : 'Save', scenario === 'descendant' ? h('input', { 'aria-label': 'Inner input' }) : null))),
      h('output', { 'data-testid': 'calls' }, JSON.stringify(calls)), h('output', { 'data-testid': 'clicks' }, JSON.stringify(clicks)), h('div', { id: 'target' }, 'Link target'));
  }
  const root = createRoot(node); root.render(h(Fixture)); return () => root.unmount();
}
