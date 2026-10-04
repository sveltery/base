<script lang="ts">
 import { AlertDialog as RootAlert, Dialog as RootDialog } from '@sveltery/base';
 import * as SubpathAlert from '@sveltery/base/alert-dialog';
 import * as SubpathDialog from '@sveltery/base/dialog';
 const handle = RootAlert.createHandle<number>();
 const NumberTrigger = RootAlert.Trigger<number>;
 const props: RootAlert.Trigger.Props<number> = { handle, payload: 1 };
</script>
<!-- Each of these six invalid calls should be rejected. -->
<RootAlert.Trigger {handle} payload={'invalid'} />
<SubpathAlert.Trigger {handle} payload={'invalid'} />
<RootDialog.Trigger {handle} payload={'invalid'} />
<SubpathDialog.Trigger {handle} payload={'invalid'} />
<NumberTrigger {handle} payload={'invalid'} />
<RootAlert.Trigger {...props} payload={'invalid'} />
