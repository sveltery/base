---
title: Accessibility
description: Learn how to make the most of Sveltery Base's accessibility features and guidelines.
order: 2
---

Accessibility is a top priority for Sveltery Base.
Sveltery Base components handle many complex accessibility details including ARIA attributes, role attributes, pointer interactions, keyboard navigation, and focus management.
The goal is to provide an accessible user experience out of the box, with intuitive APIs for configuration.

This page highlights some of the key accessibility features of Sveltery Base, as well as some ways you need to augment the library, to ensure that your application is accessible to everyone.

## Keyboard navigation

Sveltery Base components adhere to the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) to provide basic keyboard accessibility out of the box.
This is critical for users who have difficulty using a pointer device, but it's also important for users who prefer navigating with a keyboard or other input mode.

Many components provide support for arrow keys, alphanumeric keys, <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Enter</kbd>, and <kbd>Esc</kbd>.

## Focus management

Sveltery Base components manage focus automatically following a user interaction.
Additionally, some components provide props like `initialFocus` and `finalFocus`, to configure focus management.
Where Base UI takes a ref for these props, Sveltery Base takes the element itself or a function that returns it, so read the element with `bind:this`.

While Sveltery Base components manage focus, it's the developer's responsibility to visually indicate focus.
This is typically handled by styling the `:focus` or `:focus-visible` CSS pseudo-classes.
WCAG provides [guidelines on focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance).

## Color contrast

When styling elements, it's important to meet the minimum requirements for color contrast between each foreground element and its corresponding background element.
Unless your application has strict requirements around compliance with current standards, consider adhering to [APCA](https://apcacontrast.com/).

## Accessible labels

Sveltery Base provides components like [Form](/components/form), [Input](/components/input), [Field](/components/field), and [Fieldset](/components/fieldset) to automatically associate form controls. Additionally, you can use the native HTML `<label>` element to provide context to corresponding inputs.

Most applications present custom controls that require accessible names provided by markup features such as `alt`, `aria-label`, or `aria-labelledby`.
WAI-ARIA provides guidelines on [providing accessible names](https://www.w3.org/TR/wai-aria-1.2/#namecalculation) to custom controls.

## Testing

Sveltery Base components run the Base UI test suite, ported to Svelte, in real browsers.
Browser tests also compare each component with React Base UI on the same interactions, so the accessibility behavior matches the library it is ported from.
