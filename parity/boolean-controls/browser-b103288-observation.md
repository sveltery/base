# Literal native reset diagnostic

Head: `b1032888cbe0e90cf77663aca3ee528abf2fd5c1`. Run [37095624411](https://github.com/sveltery/base/actions/runs/37095624411), job `111124833684`, secured official Chromium 153/Playwright 1243, retries 0. The fixture asserts actual React and ReactDOM 19.2.8; the native implementation uses Svelte 5.57.1. Raw observations are retained in [the extracted job log](browser-b103288-observation.log); the original [artifact 11264166783](https://github.com/sveltery/base/actions/runs/37095624411/artifacts/11264166783) contains JSON and traces, ZIP SHA256 `5c24023cc11f5f1d9153b018be3b6e09601c54df3a4ff04a91799bb0bec21b7c`.

44 of 47 supplemental cases passed. This diagnostic is not final-head acceptance and earns no original assertion credit. The three failed expectations remain evidence:

- Source Svelte Checkbox/Switch still failed the earlier expectation that target-canceling a native reset-button activation preserves checked state. Both actually became unchecked.
- The plain Svelte `<input bind:checked>` baseline also became unchecked after the same target-canceled reset-button activation; both owner and DOM assertions passed. Its later imperative-reset probe failed because the button's `id="reset"` shadows the form's `reset` method. The follow-up uses `HTMLFormElement.prototype.reset.call(form)` to test that separate phase without changing component runtime behavior.

The literal baseline establishes that the target-canceled native-button result follows Svelte's native binding behavior. The follow-up records this measured Svelte/React difference under the user's native-Svelte directive, retaining the original failed evidence. Imperative cancellation in one JavaScript stack is a separate measured case; it must not be inferred from the native-button result.

Both renderers passed the actual hidden-input inline geometry and 1px × 1px browser geometry checks. The source CheckboxGroup post-reset submission result (`['a']` for React, `[]` for Svelte) and later-window Enter cancellation observation (one submission for both) also passed with their actual measured expectations. Original assertion titles, hashes and declaration sites remain unchanged.
