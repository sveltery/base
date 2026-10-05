<script lang="ts">
  import { Checkbox } from '../../src/lib/checkbox/index.js';
  import { CheckboxGroup } from '../../src/lib/checkbox-group/index.js';
  let input = $state<HTMLInputElement | null>();
  const changes: string[][] = [];
  export function snapshot() {
    return { input, changes };
  }
</script>

<CheckboxGroup
  defaultValue={[]}
  onValueChange={(value) => {
    changes.push(value);
  }}
>
  <Checkbox.Root
    value="choice"
    indeterminate
    bind:inputRef={input}
    id="native-mixed-checkbox">Mixed choice</Checkbox.Root
  >
</CheckboxGroup>
