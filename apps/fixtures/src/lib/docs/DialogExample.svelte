<script lang="ts">
  import { Dialog } from '@sveltery/base';
</script>

<Dialog.Root>
  <Dialog.Trigger class="example-button">Explore a dialog</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop class="example-backdrop" />
    <Dialog.Popup class="example-popup">
      <Dialog.Title class="example-title">A little room to focus</Dialog.Title>
      <Dialog.Description class="example-description">
        This is the experimental Sveltery Dialog. Try Tab, Shift+Tab, and Escape.
      </Dialog.Description>
      <label class="example-label" for="dialog-note">Your note</label>
      <input id="dialog-note" class="example-input" placeholder="Something worth keeping…" />
      <Dialog.Close class="example-button">Done exploring</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>

<style>
  :global(.example-button) {
    border: 1px solid #164f43;
    border-radius: 7px;
    background: #164f43;
    color: white;
    padding: 11px 17px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
  }
  :global(.example-button:focus-visible),
  :global(.example-input:focus-visible) {
    outline: 3px solid #c07433;
    outline-offset: 4px;
  }
  :global(.example-backdrop) {
    position: fixed;
    inset: 0;
    background: #132a2470;
    z-index: 50;
  }
  :global(.example-popup) {
    position: fixed;
    z-index: 51;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(420px, calc(100vw - 40px));
    max-height: calc(100dvh - 40px);
    overflow: auto;
    box-sizing: border-box;
    padding: 28px;
    border: 1px solid #d8ddd5;
    border-radius: 12px;
    background: #fffefb;
    color: #253831;
    box-shadow: 0 24px 80px #132a2440;
    font:
      16px/1.6 system-ui,
      sans-serif;
  }
  :global(.example-title) {
    margin: 0 0 10px;
    font-size: 23px;
    letter-spacing: -0.04em;
  }
  :global(.example-description) {
    margin: 0 0 22px;
    color: #52665b;
  }
  :global(.example-label) {
    display: block;
    font-weight: 600;
    margin-bottom: 7px;
  }
  :global(.example-input) {
    box-sizing: border-box;
    width: 100%;
    padding: 10px;
    border: 1px solid #a7b9ac;
    border-radius: 6px;
    margin-bottom: 24px;
    background: white;
    color: #253831;
    font: inherit;
  }
</style>
