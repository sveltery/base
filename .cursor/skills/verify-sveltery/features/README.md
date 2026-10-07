# Component feature map

One row per component in `src/lib`. A run of `scripts/verify-component.sh <name>` covers that component's spec, unit tests and paired fixture. It does not cover anything listed under "Not ported".

| Component | Feature file               | Fixture route                    | Not ported                                                                                                      |
| --------- | -------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Button    | [button.md](button.md)     | `/fixtures/button?case=<case>`   | Composite and Toolbar integration, `nativeButton` host-tag warnings, class/style state callbacks                |
| Fieldset  | [fieldset.md](fieldset.md) | `/fixtures/fieldset?case=<case>` | Field, Checkbox, CheckboxGroup, RadioGroup and Slider disabled integration; `className`/`style` state callbacks |
| Toggle    | [toggle.md](toggle.md)     | `/fixtures/toggle?case=<case>`   | ToggleGroup and Toolbar integration, `nativeButton={false}`, `value`, class/style state callbacks               |
| Avatar    | [avatar.md](avatar.md)     | `/fixtures/avatar?case=<case>`   | Enter/exit transitions and animation completion, `class`/`style` state callbacks                                |
