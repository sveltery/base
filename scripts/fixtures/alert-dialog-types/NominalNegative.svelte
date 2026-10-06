<script lang="ts">
  import { AlertDialog as RootAlert, Dialog as RootDialog } from '@sveltery/base';
  import * as SubpathAlert from '@sveltery/base/alert-dialog';
  const ordinary = RootDialog.createHandle<number>();
</script>

<RootAlert.Trigger handle={ordinary} payload={1} />
<SubpathAlert.Trigger handle={ordinary} payload={1} />
<RootAlert.Root handle={ordinary} />
<SubpathAlert.Root handle={ordinary} />
