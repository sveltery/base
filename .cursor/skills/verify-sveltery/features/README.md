# Component feature map

One row per component in `src/lib`. A run of `scripts/verify-component.sh <name>` covers that component's spec, unit tests and paired fixture. It does not cover anything listed under "Not ported".

| Component | Feature file           | Fixture route                  | Not ported                                                                                        |
| --------- | ---------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| Toggle    | [toggle.md](toggle.md) | `/fixtures/toggle?case=<case>` | ToggleGroup and Toolbar integration, `nativeButton={false}`, `value`, class/style state callbacks |
