<script lang="ts">
 import { AlertDialog as RootAlert, Dialog as RootDialog } from '@sveltery/base';
 import * as SubpathAlert from '@sveltery/base/alert-dialog';
 import * as SubpathDialog from '@sveltery/base/dialog';
 const handle = RootAlert.createHandle<number>();
 let node = $state<HTMLElement | null>(null);
 const className: Exclude<RootAlert.Trigger.Props<number>['class'], undefined> = state => ['trigger', { disabled: state.disabled }];
 const props: RootAlert.Trigger.Props<number> = { handle, payload: 1, class: className };
</script>
<RootAlert.Trigger {handle} payload={1} bind:ref={node} class={state => ['trigger', { disabled: state.disabled }]} />
<SubpathAlert.Trigger {handle} payload={1} bind:ref={node} class={state => ['trigger', { disabled: state.disabled }]} />
<RootDialog.Trigger {handle} payload={1} bind:ref={node} class={state => ['trigger', { disabled: state.disabled }]} />
<SubpathDialog.Trigger {handle} payload={1} bind:ref={node} class={state => ['trigger', { disabled: state.disabled }]} />
<RootAlert.Trigger {...props} bind:ref={node} />
<SubpathAlert.Trigger {...props} bind:ref={node} />
