// Collapsible fixture scenarios at Base UI 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: parity/collapsible/UPSTREAM_LICENSE. Supplemental scenarios earn no declaration credit.
export const collapsibleCss = `
.motion { overflow:hidden; height:var(--collapsible-panel-height); transition:height 100ms linear; }
.motion[data-starting-style], .motion[data-ending-style] { height:0; }
.zero { overflow:hidden; width:0; height:0; opacity:1; transition:opacity 10s linear; }
.zero[data-ending-style] { opacity:0; }
@keyframes panel-down { from {height:0} to {height:var(--collapsible-panel-height)} }
@keyframes panel-up { from {height:var(--collapsible-panel-height)} to {height:0} }
@keyframes panel-fade { from {opacity:0} to {opacity:1} }
.keys { overflow:hidden; animation-duration:100ms; animation-timing-function:linear; }
.keys[data-open] { animation-name:panel-down; }
.keys[data-closed] { animation-name:panel-up; }
.keys-open[data-closed] { animation-name:none; }
.keys-close[data-open] { animation-name:none; }
.mixed { height:var(--collapsible-panel-height); transition:height 100ms linear; animation:panel-fade 100ms linear; }
.mixed[data-starting-style] { height:0; }
.hidden-motion { overflow:hidden; height:var(--collapsible-panel-height); opacity:1; transition:height 1000ms linear,opacity 1000ms linear; }
.hidden-motion[data-starting-style], .hidden-motion[data-ending-style] { height:0; opacity:0; }
`;
export function collapsibleConfig(scenario: string) {
  const hidden = scenario.startsWith('beforematch') || scenario.startsWith('hidden') || scenario === 'replaced-host';
  const keys = scenario.startsWith('keys') || scenario === 'beforematch-keys';
  const initialOpen = ['controlled-default', 'initial-transition', 'zero', 'remove-close', 'interrupt', 'race-open', 'race-close', 'keys-initial', 'keys-both', 'keys-close', 'keys-open', 'ids', 'ending-host', 'cancel-close', 'manual-id', 'keys-inline'].includes(scenario);
  return {
    hidden, initialOpen,
    keep: hidden || ['keep', 'controlled-keep', 'keys-both', 'keys-open', 'mixed', 'important', 'race-open', 'state-callbacks'].includes(scenario),
    controlled: scenario.startsWith('controlled'),
    custom: ['custom', 'custom-disabled', 'controlled-render', 'callback-render', 'link'].includes(scenario),
    disabled: ['disabled', 'custom-disabled', 'disabled-override'].includes(scenario),
    motionClass: scenario === 'zero' ? 'zero' : scenario === 'mixed' || scenario === 'important' ? 'mixed' : keys ? `keys ${scenario === 'keys-open' ? 'keys-open' : scenario === 'keys-close' ? 'keys-close' : ''}` : scenario === 'hidden-motion' ? 'hidden-motion' : ['transition', 'initial-transition', 'interrupt', 'beforematch-transition', 'beforematch-cancel', 'beforematch-no-motion', 'remove-close', 'race-open', 'race-close'].includes(scenario) ? 'motion' : '',
    panelStyle: scenario === 'keys-inline' ? 'animation-duration:100ms;animation-name:panel-down;animation-timing-function:linear' : scenario === 'beforematch-keys' ? 'animation-duration:123ms' : ['beforematch-transition', 'beforematch-cancel', 'beforematch-no-motion'].includes(scenario) ? 'transition-duration:123ms' : scenario === 'mixed' ? 'justify-content:center' : scenario === 'important' ? 'justify-content:center!important' : scenario.startsWith('race') ? 'transition:height 10s linear' : '',
  };
}
