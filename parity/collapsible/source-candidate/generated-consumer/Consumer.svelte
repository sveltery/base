<script lang="ts">
  import { First, Second, type CollapsibleRootProps, type CollapsibleTriggerProps, type CollapsiblePanelProps } from './imports.js';
  const root: CollapsibleRootProps = { defaultOpen: true, onOpenChange: (_open, details) => details.cancel() };
  const trigger: CollapsibleTriggerProps = { type: 'submit', form: 'external', name: 'collapsible', value: 'sent' };
  const panel: CollapsiblePanelProps = { keepMounted: true };
</script>
<First.Root {...root}><First.Trigger {...trigger}>First</First.Trigger><First.Panel {...panel}>Open content</First.Panel></First.Root>
<Second.Root disabled><Second.Trigger disabled={false}>Second</Second.Trigger><Second.Panel hiddenUntilFound keepMounted={false}>Find content</Second.Panel></Second.Root>
