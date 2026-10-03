<script lang="ts">
  import { OTPField } from '../../src/lib/otp-field/index.js';
  import { Field } from '../../src/lib/field/index.js';
</script>
<Field.Root name="code"><Field.Label id="code-label">Code</Field.Label><Field.Description id="code-help">Help</Field.Description><OTPField.Root length={4} defaultValue="a1 B2-c3" validationType="alphanumeric" required>{#each [0,1,2,3] as item (item)}<OTPField.Input data-slot={item} />{/each}</OTPField.Root></Field.Root>
<OTPField.Root length={2} defaultValue="12"><OTPField.Input /><OTPField.Input /></OTPField.Root>
<OTPField.Root length={2} defaultValue="😀x" validationType="none"><OTPField.Input /><OTPField.Input /></OTPField.Root>
