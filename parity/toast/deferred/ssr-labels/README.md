# Deferred SSR label relationships

Tracked in [#18](https://github.com/sveltery/base/issues/18). React 1.8.0 and Svelte omit initial Root ARIA references and establish them in client effects. This optional improvement is excluded from the bounded port. The implementation sketch and desired-behavior tests are retained here as evidence; they are not executed, passing parity assertions or declaration credit.
