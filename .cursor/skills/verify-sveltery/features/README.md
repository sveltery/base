# Component feature map

One row per component in `src/lib`. A run of `scripts/verify-component.sh <name>` covers that component's spec, unit tests and paired fixture. It does not cover anything listed under "Not ported".

| Component   | Feature file                       | Fixture route                        | Not ported                                                                                                      |
| ----------- | ---------------------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Button      | [button.md](button.md)             | `/fixtures/button?case=<case>`       | Composite and Toolbar integration, `nativeButton` host-tag warnings, class/style state callbacks                |
| Checkbox    | [checkbox.md](checkbox.md)         | `/fixtures/checkbox?case=<case>`     | Field, CheckboxGroup, `parent`, `inputRef`, `className`/`style` callbacks, host-tag warnings                    |
| Collapsible | [collapsible.md](collapsible.md)   | `/fixtures/collapsible?case=<case>`  | Accordion integration, React.Activity animation resume, `className`/`style` callbacks, refs, host-tag warnings  |
| Fieldset    | [fieldset.md](fieldset.md)         | `/fixtures/fieldset?case=<case>`     | Field, Checkbox, CheckboxGroup, RadioGroup and Slider disabled integration; `className`/`style` state callbacks |
| Toggle      | [toggle.md](toggle.md)             | `/fixtures/toggle?case=<case>`       | Toolbar integration, `nativeButton={false}`, class/style state callbacks                                        |
| ToggleGroup | [toggle-group.md](toggle-group.md) | `/fixtures/toggle-group?case=<case>` | Toolbar integration, `className`/`style` state callbacks, grid composite, scroll-into-view                      |
| Avatar      | [avatar.md](avatar.md)             | `/fixtures/avatar?case=<case>`       | Enter/exit transitions and animation completion, `class`/`style` state callbacks                                |
| Separator   | [separator.md](separator.md)       | `/fixtures/separator?case=<case>`    | `className`/`style` state callbacks, React render-element cloning, `ref`, Menu/Select/Toolbar separators        |
| Meter       | [meter.md](meter.md)               | `/fixtures/meter?case=<case>`        | React `ref`, class/style state callbacks, numeric production error codes                                        |
| Progress    | [progress.md](progress.md)         | `/fixtures/progress?case=<case>`     | `className` and `style` state callbacks, refs                                                                   |
| Form        | [form.md](form.md)                 | `/fixtures/form?case=<case>`         | Field, Checkbox, NumberField, Switch and Fieldset integration; `className`/`style` callbacks; `actionsRef`      |
| Switch      | [switch.md](switch.md)             | `/fixtures/switch?case=<case>`       | Field and Form integration, `inputRef`, `className`/`style` callbacks, `nativeButton` host-tag warnings         |
