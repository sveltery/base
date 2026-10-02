// Base UI 1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/accordion/UPSTREAM_LICENSE. Supplements earn no declaration credit.
export const accordionCss = `
.accordion-motion {overflow:hidden;height:var(--accordion-panel-height);transition:height 300ms linear}
.accordion-motion[data-starting-style],.accordion-motion[data-ending-style] {height:0}
@keyframes accordion-fade {from {opacity:0} to {opacity:1}}
.accordion-mixed {height:var(--accordion-panel-height);transition:height 100ms linear;animation:accordion-fade 100ms linear}
.accordion-mixed[data-starting-style] {height:0}
@keyframes accordion-down {from {height:0} to {height:var(--accordion-panel-height)}}
`;
export function accordionConfig(scenario: string) {
  const initial = ['aria', 'manual-panel', 'manual-trigger', 'trigger-change', 'trigger-remove', 'parts', 'hydration', 'default-custom', 'disabled-root-state', 'disabled-item-state', 'cancel-root-close', 'cancel-multiple-close', 'switch', 'ids', 'indexes', 'replacement', 'ssr-inline', 'no-motion-status', 'remove-close'].includes(scenario);
  const customValues = ['default-custom', 'controlled-custom', 'values-custom', 'values-single'].includes(scenario);
  return {
    initial, customValues,
    values: customValues ? [scenario === 'default-custom' ? 'first' : 'one', scenario === 'default-custom' ? 'second' : 'two'] : [0, 1],
    implicit: ['uncontrolled', 'multiple', 'single', 'custom', 'keyboard-native', 'keyboard-custom', 'item-state', 'timing-native', 'timing-custom'].includes(scenario),
    controlled: scenario.startsWith('controlled') || ['cancel-item-controlled', 'cancel-root-controlled'].includes(scenario),
    multiple: ['multiple', 'values-default', 'values-custom', 'cancel-multiple-open', 'cancel-multiple-close'].includes(scenario),
    custom: ['custom', 'keyboard-custom', 'timing-custom'].includes(scenario),
    rootDisabled: ['disabled-root-state', 'disabled-root'].includes(scenario),
    itemDisabled: ['disabled-item-state', 'disabled-item'].includes(scenario),
    rootKeep: ['root-keep', 'root-hidden', 'root-warning'].includes(scenario),
    rootHidden: ['root-hidden', 'root-warning'].includes(scenario),
    keep: ['switch', 'indexes', 'replacement', 'ids', 'important', 'no-motion-status'].includes(scenario),
    hidden: ['panel-warning', 'beforematch', 'replaced-host'].includes(scenario),
  };
}
