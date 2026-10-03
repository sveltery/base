<script lang="ts">
  import { useSliderRootContext } from "../../src/lib/slider/root/SliderRootContext.js";
  const context = useSliderRootContext();
  export function installNewerLabel() {
    context.setLabelId("newer-label");
  }
  export function removeNewerLabel() {
    context.setLabelId((current) =>
      current === "newer-label" ? undefined : current,
    );
  }
</script>
