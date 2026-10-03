# First secured Boolean source witness

Head: `8b88b304015203a13a303ce69ca5b5be33fa3751`. Run [37094810306](https://github.com/sveltery/base/actions/runs/37094810306), job `111122453353`, secured official Chromium 153/Playwright 1243, retries 0. The fixture asserts actual React and ReactDOM 19.2.8; the native implementation uses Svelte 5.57.1. Raw observations are retained in [the extracted job log](browser-8b88b30-observation.log); the original [artifact 11264045601](https://github.com/sveltery/base/actions/runs/37094810306/artifacts/11264045601) contains JSON and traces, ZIP SHA256 `10d7c48577b90e6ef8e6c0f1e65701be467e1811771d8835e7e29199919eb018`.

42 of 46 supplemental cases passed. These results establish no final-head acceptance or original assertion credit. Four failed expectations remain evidence:

- Svelte Checkbox/Switch: a reset-button activation canceled by a target-form native listener still leaves the bound owner and input false. Imperative cancellation in JSDOM passed; a literal native Svelte bound-input browser witness is being added before classifying this difference.
- Actual React CheckboxGroup: after native reset, DOM/FormData are initially empty and logical selection remains `a`; submission returns `['a']`. Svelte's source group returns an empty successful-controls array. The before-submit versus validation/render phase must be retained explicitly.
- Actual React Checkbox Enter: a later native window `preventDefault` handler also does not cancel submission in this real browser. The earlier assumption of a React/Svelte difference was incorrect; both observed one submission.

All original immutable test titles, hashes and declaration sites remain unchanged. No failed assertion is counted as ordinary source parity or silently removed.
