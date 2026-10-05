// Immutable Original fixture CSS at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
export const scopedPopupAnimationStyles = `
  .test-navigation-menu-popup {
    transition-property: opacity, transform, width, height;
    transition-duration: 350ms;
    transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
  }

  .test-navigation-menu-popup[data-starting-style],
  .test-navigation-menu-popup[data-ending-style] {
    opacity: 0;
    transform: scale(0.9);
  }

  .test-navigation-menu-popup[data-ending-style] {
    transition-property: opacity, transform;
    transition-duration: 150ms;
    transition-timing-function: ease;
  }

  .test-navigation-menu-content {
    transition:
      opacity 175ms ease,
      transform 350ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .test-navigation-menu-content[data-starting-style],
  .test-navigation-menu-content[data-ending-style] {
    opacity: 0;
  }

  .test-navigation-menu-content[data-starting-style][data-activation-direction='left'] {
    transform: translateX(-2rem);
  }

  .test-navigation-menu-content[data-starting-style][data-activation-direction='right'] {
    transform: translateX(2rem);
  }

  .test-navigation-menu-content[data-ending-style] {
    transition-duration: 175ms;
    transition-timing-function: ease;
  }

  .test-navigation-menu-content[data-ending-style][data-activation-direction='left'] {
    transform: translateX(2rem);
  }

  .test-navigation-menu-content[data-ending-style][data-activation-direction='right'] {
    transform: translateX(-2rem);
  }
`;
