# Third-party notices

Shared business utilities and native Svelte adapters derive from Base UI v1.8.0, immutable commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`, `packages/utils/src`. Original source correspondence and immutable hashes are retained in `parity/shared-utils` and `parity/utils-package` in the source repository. This package implements the used utility subset; native Svelte setup, runes, lifecycle and subscriptions replace React framework machinery. It does not claim complete upstream utility API or assertion parity.

NumberField additionally consumes the source-owned `Interval` class from pinned `packages/utils/src/useInterval.ts`; native lifecycle cleanup belongs to its PressAndHold consumer.

Floating UI Utils 0.2.12 supplies DOM utilities used by the owner and scroll-lock implementations. Its MIT permission and disclaimer also apply to those derived portions, Copyright (c) 2021-present Floating UI contributors.

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
