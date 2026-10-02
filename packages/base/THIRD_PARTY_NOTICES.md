# Third-party notices

Toggle standalone state, callbacks, disabled behavior and assertion ports derive from toggle/Toggle.tsx, toggle/Toggle.test.tsx, utils/useControlled.ts and internals/use-button/useButton.ts at Base UI v1.8.0 commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. Their MIT notice and immutable source/assertion hashes also appear in parity/toggle.

Standalone Input native/control behavior, default state, IDs, value callbacks and conformance adapters derive from input/Input.tsx, input/Input.test.tsx, field/control/FieldControl.tsx, internals/field-root-context/FieldRootContext.ts and label/state helpers at Base UI v1.8.0 commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. Their source hashes and MIT license are retained in parity/input. Field/Form contextual integration remains unimplemented.

Separator orientation, role, state attributes and assertion/conformance ports derive from separator/Separator.tsx, separator/Separator.test.tsx, separator/SeparatorDataAttributes.ts and test conformance helpers at Base UI v1.8.0 commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. Their MIT notice and exact source hashes also appear in parity/separator.

Button native/custom keyboard, disabled and focusability semantics and assertion ports derive from button/Button.tsx, internals/use-button/useButton.ts, utils/useFocusableWhenDisabled.ts and utils/dispatchClickWithModifiers.ts at the pin below. Toast manager/store/promise algorithms and public data option types, event detail utilities, reason constants, selected test bodies/type assertions, and type-equality helpers are derived from mui/base-ui v1.8.0, commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. Composed focus traversal, native tabbable candidate/filter rules, details visibility, and default tab-index normalization derive from upstream floating-ui-react/utils/tabbable.ts and utils/shadowDom.ts at the same pin. Modal focus guards and their Apple WebKit accessibility attributes reference floating-ui-react/components/FloatingFocusManager.tsx, utils/FocusGuard.tsx, and utils/platform at that pin. Native merge behavior references upstream merge-props code and is covered by this notice. Dialog accessibility isolation references upstream FloatingFocusManager and markOthers traversal/attribute ownership behavior; its Svelte-native implementation is also covered by this notice. Source: https://github.com/mui/base-ui/tree/47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c/packages/react/src/internals

MIT License

Copyright (c) 2019 Material-UI SAS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
