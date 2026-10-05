import type * as Root from '@sveltery/base';
import type * as Parts from '@sveltery/base/collapsible';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
function exact<T extends true>(_value?: T) {}
exact<Equal<Root.CollapsibleRootProps, Parts.CollapsibleRootProps>>();
exact<Equal<Root.CollapsibleRootState, Parts.CollapsibleRootState>>();
exact<Equal<Root.CollapsibleTriggerProps, Parts.CollapsibleTriggerProps>>();
exact<Equal<Root.CollapsibleTriggerState, Parts.CollapsibleTriggerState>>();
exact<Equal<Root.CollapsiblePanelProps, Parts.CollapsiblePanelProps>>();
exact<Equal<Root.CollapsiblePanelState, Parts.CollapsiblePanelState>>();
exact<Equal<Root.CollapsibleTransitionStatus, Parts.CollapsibleTransitionStatus>>();
exact<Equal<Root.CollapsibleRootChangeEventReason, Parts.CollapsibleRootChangeEventReason>>();
exact<Equal<Root.CollapsibleRootChangeEventDetails, Parts.CollapsibleRootChangeEventDetails>>();
const style: Root.CollapsiblePanelProps['style'] = state => ({ opacity: state.open ? 1 : 0.5 });
const event: Root.CollapsibleTriggerProps['onkeydown'] = event => event.preventBaseUIHandler();
void style; void event;
// @ts-expect-error open remains boolean.
const invalidOpen: Parts.CollapsibleRootProps = { open: 'yes' };
// @ts-expect-error refs bind native hosts, not strings.
const invalidRef: Parts.CollapsiblePanelProps = { ref: 'node' };
// @ts-expect-error render is a Svelte snippet, not a host name.
const invalidRender: Parts.CollapsibleTriggerProps = { render: 'button' };
// @ts-expect-error style callbacks produce native style values.
const invalidStyle: Parts.CollapsiblePanelProps = { style: () => false };
// @ts-expect-error button type follows the native HTML union.
const invalidType: Parts.CollapsibleTriggerProps = { type: 'navigation' };
// @ts-expect-error change reasons retain the pinned literal union.
const invalidReason: Parts.CollapsibleRootChangeEventReason = 'hover';
void invalidOpen; void invalidRef; void invalidRender; void invalidStyle; void invalidType; void invalidReason;
