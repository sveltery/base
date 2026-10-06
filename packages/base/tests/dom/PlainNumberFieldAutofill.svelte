<script lang="ts">
  // Authored native-element comparator; zero unchanged Original assertion credit.
  let { prevent = false }: { prevent?: boolean } = $props();
  let value = $state(2);
  export function setOwner(next: number) {
    value = next;
  }
</script>

<form
  ><input
    type="number"
    name="amount"
    {value}
    oninput={(event) => {
      if (prevent) event.preventDefault();
    }}
  /></form
>
