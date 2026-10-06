<script lang="ts">
  // Authored literal native-element comparator; no Original assertion credit.
  let value = $state('2');
  export function setOwner(next: string) {
    value = next;
  }
</script>

<input type="text" {value} oninput={() => {}} />
