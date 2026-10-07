# Third-party notices

Parts of this package derive from [Base UI](https://github.com/mui/base-ui) v1.8.0, commit `47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c`:

- `src/lib/button/Button.svelte` from `packages/react/src/button/Button.tsx`, with the non-composite paths of `packages/react/src/internals/use-button/useButton.ts`, `packages/react/src/utils/useFocusableWhenDisabled.ts`, and `packages/react/src/utils/dispatchClickWithModifiers.ts`
- `src/lib/button/Button.svelte.spec.ts` assertions from `packages/react/src/button/Button.test.tsx`
- `src/lib/toggle/Toggle.svelte` from `packages/react/src/toggle/Toggle.tsx`, standalone (without ToggleGroup)
- `src/lib/toggle/Toggle.svelte.spec.ts` assertions from `packages/react/src/toggle/Toggle.test.tsx`
- `src/lib/internal/event-details.ts` from `packages/react/src/internals/createBaseUIEventDetails.ts`
- `src/lib/internal/state-attributes.ts` from `packages/react/src/internals/getStateAttributesProps.ts`
- `src/lib/avatar/Root.svelte` from `packages/react/src/avatar/root/AvatarRoot.tsx`
- `src/lib/avatar/Image.svelte` from `packages/react/src/avatar/image/AvatarImage.tsx`
- `src/lib/avatar/Fallback.svelte` from `packages/react/src/avatar/fallback/AvatarFallback.tsx`
- `src/lib/avatar/image-loading-status.svelte.ts` from `packages/react/src/avatar/image/useImageLoadingStatus.ts`
- `src/lib/avatar/attributes.ts` from `packages/react/src/avatar/root/stateAttributesMapping.ts`
- `src/lib/avatar/context.ts` from `packages/react/src/avatar/root/AvatarRootContext.ts`
- `src/lib/avatar/Avatar.svelte.spec.ts` assertions from the avatar root, image and fallback tests

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
