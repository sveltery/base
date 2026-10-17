# About Sveltery Base

<Subtitle>
  An open-source Svelte component library for building accessible user interfaces.
</Subtitle>

<Meta name="description" content="An overview of Sveltery Base, providing information on its origins, credits, and goals." />

Sveltery Base is an unstyled Svelte component library for building accessible user interfaces, ported from [Base UI](https://base-ui.com) v1.9.0.
Our focus is on accessibility, performance, and developer experience.
Our goal is to bring Base UI's complete set of open-source UI components to Svelte, with the same behavior and a native Svelte developer experience.

## Features

### Headless

Sveltery Base components are unstyled, don't bundle CSS, and don't prescribe a styling solution.
You retain complete control over your application's CSS layer.
Sveltery Base is compatible with Tailwind, scoped Svelte styles, plain CSS, or any other styling engine you prefer.

### Accessible

Poor accessibility can make your application difficult to navigate for all users, not just for users with disabilities.
Accessibility is our primary focus.
Sveltery Base components port Base UI's behavior, which adheres to [WAI-ARIA design patterns](https://www.w3.org/WAI/ARIA/apg/patterns/), and are tested against the matching Base UI components.

### Composable

Component APIs are fully open, so you have direct access to each node, you can easily add or remove parts, and you can wrap them however you prefer.

## Credits

Sveltery Base would not exist without Base UI.
The component behavior, the API design, and much of this documentation come from the [Base UI team](https://base-ui.com/react/overview/about) and its contributors, under the MIT license.
Sveltery Base is not affiliated with or endorsed by MUI or Base UI.

## Browser support

Sveltery Base supports the same browsers as Base UI: all modern browsers that implement features marked as [Baseline Widely Available](https://web.dev/baseline) at the time of Base UI's last major version release.
This means the features we use have been supported across major browsers for at least 30 months, ensuring broad compatibility and stability.

For the full list of supported browsers, refer to Base UI's [.browserslistrc](https://github.com/mui/base-ui/blob/master/.browserslistrc).

## Svelte versions

Sveltery Base supports Svelte 5.57.1 and newer versions.

## Bundler support

Sveltery Base ships Svelte components, so it works with any maintained bundler that compiles Svelte 5, such as Vite with SvelteKit or the Svelte plugin for Vite.

## Community

Visit the [Community](/overview/community) page to learn more about ecosystem projects, support channels, and how to stay up to date and contribute.
