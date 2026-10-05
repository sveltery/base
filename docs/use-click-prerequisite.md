# Private useClick prerequisite

The canonical private `useClick` now has a bounded native Svelte implementation with its actual RootStore, Store and trigger-map dependencies. It preserves the Base UI 1.8.0 selected callback options and Store identity through composed dispatch and deferred work, while retaining live open/reference/open-event reads. Native derived handler construction and setup-owned timers replace React memo/ref/lifetime machinery.

The [source correspondence and evidence](../parity/use-click/README.md) distinguish the source type graph from actual emitted imports, preserve historical old failures and fixed results, and record the private installed-package diagnostic. There is no new public export or dependency. Existing main production bodies remain unchanged; the bespoke Dialog is not integrated or accepted by this prerequisite.

This helper is preparation for separately reviewed feature migrations. It does not establish whole Dialog, AlertDialog, Menu, NavigationMenu, Popup, hover/tree or ordinary-assertion compatibility. Exact final-head independent source/native/maintainability review, configured automatic review, required CI and explicit PM merge approval remain separate gates.
