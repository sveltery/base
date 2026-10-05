// Immutable Original fixture bodies from packages/react/src/navigation-menu/root/NavigationMenuRoot.test.tsx at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
// Only renderer entry, callback observation and scenario selection below are native test harness transport.
import * as React from 'react';
import { NavigationMenu } from '@base-ui/react/navigation-menu';
import { DirectionProvider } from '@base-ui/react/direction-provider';
function TestNavigationMenu(
  props: NavigationMenu.Root.Props & {
    keepMountedPortal?: boolean;
  },
) {
  const { keepMountedPortal = false, ...rootProps } = props;

  return (
    <NavigationMenu.Root {...rootProps}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-2">
            <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
            <NavigationMenu.Link href="#link-4">Link 4</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal keepMounted={keepMountedPortal}>
        <NavigationMenu.Positioner data-testid="top-level-positioner">
          <NavigationMenu.Popup data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNavigationMenuWithTopLevelLink(props: NavigationMenu.Root.Props = {}) {
  return (
    <NavigationMenu.Root {...props}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-2">
            <NavigationMenu.Link href="#link-2">Link 2</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">
            Top level link
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner data-testid="top-level-positioner">
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNavigationMenuWithDisabledTrigger(props: NavigationMenu.Root.Props = {}) {
  return (
    <NavigationMenu.Root {...props}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1" disabled>
            Item 1
          </NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNestedNavigationMenu(props: NavigationMenu.Root.Props = {}) {
  return (
    <NavigationMenu.Root {...props}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            <NavigationMenu.Root>
              <NavigationMenu.List>
                <NavigationMenu.Item value="nested-item-1">
                  <NavigationMenu.Trigger data-testid="nested-trigger-1">
                    Nested Item 1
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-1">
                    <NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Portal>
                <NavigationMenu.Positioner side="right" data-testid="nested-positioner">
                  <NavigationMenu.Popup>
                    <NavigationMenu.Viewport />
                  </NavigationMenu.Popup>
                </NavigationMenu.Positioner>
              </NavigationMenu.Portal>
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-2">
            <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner data-testid="top-level-positioner">
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNavigationMenuOrientationAttributes() {
  return (
    <NavigationMenu.Root data-testid="top-level-root" defaultValue="item-1" orientation="vertical">
      <NavigationMenu.List data-testid="top-level-list">
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger>Item 1</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Root
              data-testid="nested-root"
              defaultValue="nested-item-1"
              orientation="vertical"
            >
              <NavigationMenu.List data-testid="nested-list">
                <NavigationMenu.Item value="nested-item-1">
                  <NavigationMenu.Trigger>Nested Item 1</NavigationMenu.Trigger>
                  <NavigationMenu.Content>
                    <NavigationMenu.Link href="#nested-link-1">Nested Link 1</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestInlineNestedNavigationMenu(
  props: {
    nestedDefaultValue?: string | number | boolean | null;
    nestedItem1Value?: string | number | boolean;
    keepMountedContent?: boolean;
    nestedLinkCloseOnClick?: boolean;
  } = {},
) {
  const {
    nestedDefaultValue = 'nested-item-1',
    nestedItem1Value = 'nested-item-1',
    keepMountedContent = false,
    nestedLinkCloseOnClick = false,
  } = props;
  const nestedRootProps =
    nestedDefaultValue == null ? undefined : { defaultValue: nestedDefaultValue };

  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="popup-1" keepMounted={keepMountedContent}>
            <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            <NavigationMenu.Root {...nestedRootProps}>
              <NavigationMenu.List data-testid="inline-nested-list">
                <NavigationMenu.Item value={nestedItem1Value}>
                  <NavigationMenu.Trigger data-testid="nested-trigger-1">
                    Nested Item 1
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content
                    data-testid="nested-popup-1"
                    keepMounted={keepMountedContent}
                  >
                    <NavigationMenu.Link
                      href="#nested-link-1"
                      closeOnClick={nestedLinkCloseOnClick}
                    >
                      Nested Link 1
                    </NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item value="nested-item-2">
                  <NavigationMenu.Trigger data-testid="nested-trigger-2">
                    Nested Item 2
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content
                    data-testid="nested-popup-2"
                    keepMounted={keepMountedContent}
                  >
                    <NavigationMenu.Link href="#nested-link-2">Nested Link 2</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Viewport data-testid="inline-nested-viewport" />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-2">Item 2</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-2" keepMounted={keepMountedContent}>
            <NavigationMenu.Link href="#link-3">Link 3</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner data-testid="positioner">
          <NavigationMenu.Popup data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestInlineNestedNavigationMenuWithDynamicContent({
  initialContentStage = 0,
}: {
  initialContentStage?: number;
} = {}) {
  const [contentStage, setContentStage] = React.useState(initialContentStage);

  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Link href="#link-1">Link 1</NavigationMenu.Link>
            <NavigationMenu.Root defaultValue="nested-item-1">
              <NavigationMenu.List>
                <NavigationMenu.Item value="nested-item-1">
                  <NavigationMenu.Trigger data-testid="nested-trigger-1">
                    Nested Item 1
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-1">
                    <button
                      type="button"
                      data-testid="insert-content"
                      onClick={() => {
                        setContentStage((prev) => Math.min(prev + 1, 2));
                      }}
                    >
                      Insert content
                    </button>
                    {contentStage >= 1 && (
                      <div data-testid="extra-content">
                        <NavigationMenu.Link href="#nested-link-1">
                          Nested Link 1
                        </NavigationMenu.Link>
                        <NavigationMenu.Link href="#nested-link-2">
                          Nested Link 2
                        </NavigationMenu.Link>
                        <NavigationMenu.Link href="#nested-link-3">
                          Nested Link 3
                        </NavigationMenu.Link>
                      </div>
                    )}
                    {contentStage >= 2 && (
                      <div data-testid="extra-content-2">
                        <NavigationMenu.Link href="#nested-link-4">
                          Nested Link 4
                        </NavigationMenu.Link>
                        <NavigationMenu.Link href="#nested-link-5">
                          Nested Link 5
                        </NavigationMenu.Link>
                      </div>
                    )}
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner data-testid="positioner">
          <NavigationMenu.Popup data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

const scopedPopupAnimationStyles = `
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

function TestNavigationMenuWithTopLevelLinkScopedPopupAnimation() {
  return (
    <NavigationMenu.Root>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: scopedPopupAnimationStyles }} />
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
          <NavigationMenu.Content className="test-navigation-menu-content">
            <div style={{ width: 675, height: 220 }}>Product panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link href="#top-level-link" data-testid="top-level-link">
            Top level link
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content className="test-navigation-menu-content">
            <div style={{ width: 500, height: 180 }}>Learn panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal keepMounted>
        <NavigationMenu.Positioner data-testid="positioner">
          <NavigationMenu.Popup className="test-navigation-menu-popup" data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestInlineNestedNavigationMenuTabForwardBoundary() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Product</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Root defaultValue="nested-item-2">
              <NavigationMenu.List>
                <NavigationMenu.Item value="nested-item-1">
                  <NavigationMenu.Trigger data-testid="nested-trigger-1">
                    Engineering Leads
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-1">
                    <NavigationMenu.Link href="#releases">Releases</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item value="nested-item-2">
                  <NavigationMenu.Trigger data-testid="nested-trigger-2">
                    Startups
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-2">
                    <NavigationMenu.Link href="#quick-start">Quick start</NavigationMenu.Link>
                    <NavigationMenu.Link href="#menu">Menu</NavigationMenu.Link>
                    <NavigationMenu.Link href="#select" data-testid="nested-last-link">
                      Select
                    </NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-2">Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content data-testid="popup-2">
            <NavigationMenu.Link href="#learn">Learn link</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestInlineNestedNavigationMenuTabFlow() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="popup-product">
            <NavigationMenu.Root defaultValue="developers" orientation="vertical">
              <NavigationMenu.List>
                <NavigationMenu.Item value="developers">
                  <NavigationMenu.Trigger data-testid="nested-trigger-developers">
                    Developers
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-developers">
                    <NavigationMenu.Link href="#get-started" data-testid="nested-link-get-started">
                      Get started
                    </NavigationMenu.Link>
                    <NavigationMenu.Link href="#composition" data-testid="nested-link-composition">
                      Composition
                    </NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item value="design-systems">
                  <NavigationMenu.Trigger data-testid="nested-trigger-design-systems">
                    Design Systems
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-design-systems">
                    <NavigationMenu.Link
                      href="#styling"
                      data-testid="nested-link-design-systems-styling"
                    >
                      Styling
                    </NavigationMenu.Link>
                    <NavigationMenu.Link href="#accessibility">Accessibility</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item value="engineering-leads">
                  <NavigationMenu.Trigger>Engineering Leads</NavigationMenu.Trigger>
                  <NavigationMenu.Content>
                    <NavigationMenu.Link href="#releases">Releases</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="#learn">Learn link</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNavigationMenuWithKeepMountedContent() {
  return (
    <NavigationMenu.Root defaultValue="item-1">
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
          <NavigationMenu.Content keepMounted>
            <div style={{ width: 675, height: 220 }}>Product panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content keepMounted>
            <div style={{ width: 500, height: 180 }}>Learn panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner data-testid="positioner">
          <NavigationMenu.Popup data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNavigationMenuWithKeepMountedContentClosed() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
          <NavigationMenu.Content keepMounted>
            <div style={{ width: 675, height: 220 }}>Product panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content keepMounted>
            <div style={{ width: 500, height: 180 }}>Learn panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal keepMounted>
        <NavigationMenu.Positioner data-testid="positioner">
          <NavigationMenu.Popup data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNavigationMenuWithScopedPopupExitAnimation(
  props: {
    onOpenChangeComplete?: NavigationMenu.Root.Props['onOpenChangeComplete'];
  } = {},
) {
  const { onOpenChangeComplete } = props;

  return (
    <NavigationMenu.Root onOpenChangeComplete={onOpenChangeComplete}>
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: scopedPopupAnimationStyles }} />
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-product">Product</NavigationMenu.Trigger>
          <NavigationMenu.Content className="test-navigation-menu-content">
            <div style={{ width: 675, height: 220 }}>Product panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>

        <NavigationMenu.Item value="item-2">
          <NavigationMenu.Trigger data-testid="trigger-learn">Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content className="test-navigation-menu-content">
            <div style={{ width: 500, height: 180 }}>Learn panel</div>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup className="test-navigation-menu-popup" data-testid="popup-root">
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestDeeplyNestedNavigationMenu() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="content-1">
            <NavigationMenu.Link href="#link-1" data-testid="link-1">
              Link 1
            </NavigationMenu.Link>
            {/* Level 2 */}
            <NavigationMenu.Root defaultValue="level2-item-1">
              <NavigationMenu.List>
                <NavigationMenu.Item value="level2-item-1">
                  <NavigationMenu.Trigger data-testid="level2-trigger-1">
                    Level 2 Item 1
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="level2-content-1">
                    <NavigationMenu.Link href="#level2-link-1" data-testid="level2-link-1">
                      Level 2 Link 1
                    </NavigationMenu.Link>
                    {/* Level 3 */}
                    <NavigationMenu.Root defaultValue="level3-item-1">
                      <NavigationMenu.List>
                        <NavigationMenu.Item value="level3-item-1">
                          <NavigationMenu.Trigger data-testid="level3-trigger-1">
                            Level 3 Item 1
                          </NavigationMenu.Trigger>
                          <NavigationMenu.Content data-testid="level3-content-1">
                            <NavigationMenu.Link href="#level3-link-1">
                              Level 3 Link 1
                            </NavigationMenu.Link>
                          </NavigationMenu.Content>
                        </NavigationMenu.Item>
                        <NavigationMenu.Item value="level3-item-2">
                          <NavigationMenu.Trigger data-testid="level3-trigger-2">
                            Level 3 Item 2
                          </NavigationMenu.Trigger>
                          <NavigationMenu.Content data-testid="level3-content-2">
                            <NavigationMenu.Link href="#level3-link-2">
                              Level 3 Link 2
                            </NavigationMenu.Link>
                          </NavigationMenu.Content>
                        </NavigationMenu.Item>
                      </NavigationMenu.List>
                      <NavigationMenu.Viewport />
                    </NavigationMenu.Root>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
                <NavigationMenu.Item value="level2-item-2">
                  <NavigationMenu.Trigger data-testid="level2-trigger-2">
                    Level 2 Item 2
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="level2-content-2">
                    <NavigationMenu.Link href="#level2-link-2">Level 2 Link 2</NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestNestedNavigationMenuWithCloseOnClick(props: {
  onValueChange?: NavigationMenu.Root.Props['onValueChange'];
}) {
  return (
    <NavigationMenu.Root onValueChange={props.onValueChange}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="popup-1">
            <NavigationMenu.Link href="#link-1" closeOnClick>
              Link 1
            </NavigationMenu.Link>
            <NavigationMenu.Root>
              <NavigationMenu.List>
                <NavigationMenu.Item value="nested-item-1">
                  <NavigationMenu.Trigger data-testid="nested-trigger-1">
                    Nested Item 1
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="nested-popup-1">
                    <NavigationMenu.Link
                      href="#nested-link-1"
                      closeOnClick
                      data-testid="nested-link-1"
                    >
                      Nested Link 1
                    </NavigationMenu.Link>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>

              <NavigationMenu.Portal>
                <NavigationMenu.Positioner side="right">
                  <NavigationMenu.Popup>
                    <NavigationMenu.Viewport />
                  </NavigationMenu.Popup>
                </NavigationMenu.Positioner>
              </NavigationMenu.Portal>
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

function TestDeeplyNestedNavigationMenuWithCloseOnClick() {
  return (
    <NavigationMenu.Root>
      <NavigationMenu.List>
        <NavigationMenu.Item value="item-1">
          <NavigationMenu.Trigger data-testid="trigger-1">Item 1</NavigationMenu.Trigger>

          <NavigationMenu.Content data-testid="content-1">
            <NavigationMenu.Root defaultValue="level2-item-1">
              <NavigationMenu.List>
                <NavigationMenu.Item value="level2-item-1">
                  <NavigationMenu.Trigger data-testid="level2-trigger-1">
                    Level 2 Item 1
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content data-testid="level2-content-1">
                    <NavigationMenu.Root defaultValue="level3-item-1">
                      <NavigationMenu.List>
                        <NavigationMenu.Item value="level3-item-1">
                          <NavigationMenu.Trigger data-testid="level3-trigger-1">
                            Level 3 Item 1
                          </NavigationMenu.Trigger>
                          <NavigationMenu.Content data-testid="level3-content-1">
                            <NavigationMenu.Link
                              href="#level3-link-1"
                              closeOnClick
                              data-testid="level3-link-1"
                            >
                              Level 3 Link 1
                            </NavigationMenu.Link>
                          </NavigationMenu.Content>
                        </NavigationMenu.Item>
                      </NavigationMenu.List>
                      <NavigationMenu.Viewport />
                    </NavigationMenu.Root>
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              </NavigationMenu.List>
              <NavigationMenu.Viewport />
            </NavigationMenu.Root>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Portal>
        <NavigationMenu.Positioner>
          <NavigationMenu.Popup>
            <NavigationMenu.Viewport />
          </NavigationMenu.Popup>
        </NavigationMenu.Positioner>
      </NavigationMenu.Portal>
    </NavigationMenu.Root>
  );
}

type SourceCall = { value: unknown; reason: string; type: string; canceled: boolean };
export function NavigationMenuSourceOriginal({ scenario, direction = 'ltr', orientation = 'horizontal', side = 'bottom' }: { scenario: string; direction?: 'ltr' | 'rtl'; orientation?: 'horizontal' | 'vertical'; side?: NavigationMenu.Positioner.Props['side'] }) {
  const [value, setValue] = React.useState<unknown>('item-1');
  const calls = React.useRef<SourceCall[]>([]);
  const completions = React.useRef<boolean[]>([]);
  const actions = React.useRef<NavigationMenu.Root.Actions | null>(null);
  const onValueChange: NonNullable<NavigationMenu.Root.Props['onValueChange']> = (next, details) => {
    if (scenario === 'cancel') details.cancel();
    calls.current.push({ value: next, reason: details.reason, type: details.event.type, canceled: details.isCanceled });
    if (scenario === 'controlled' || scenario === 'manual') setValue(next);
  };
  React.useEffect(() => {
    Object.assign(window, { navigationMenuSource: { snapshot: () => ({ calls: [...calls.current], completions: [...completions.current], actionType: typeof actions.current?.unmount }), setValue, unmount: () => actions.current?.unmount() } });
    return () => { delete (window as unknown as { navigationMenuSource?: unknown }).navigationMenuSource; };
  }, []);
  const falsy = scenario.endsWith('zero') ? 0 : scenario.endsWith('false') ? false : '';
  const rootProps: NavigationMenu.Root.Props = { orientation, onValueChange, onOpenChangeComplete: (open) => { completions.current.push(open); },
    ...(['open', 'patient'].includes(scenario) ? { defaultValue: 'item-1' } : {}),
    ...(['controlled', 'controlled-owner', 'manual'].includes(scenario) ? { value } : {}),
    ...(scenario === 'manual' ? { actionsRef: actions } : {}),
    ...(scenario === 'delay' ? { delay: 100 } : {}),
    ...(scenario === 'close-delay' ? { closeDelay: 100 } : {}),
    ...(scenario === 'nested-close-delay' ? { closeDelay: 200 } : {}),
  };
  let node: React.ReactNode;
  if (scenario === 'nested-close') node = <TestNestedNavigationMenuWithCloseOnClick onValueChange={onValueChange} />;
  else if (scenario === 'deep') node = <TestDeeplyNestedNavigationMenu />;
  else if (scenario === 'deep-close') node = <TestDeeplyNestedNavigationMenuWithCloseOnClick />;
  else if (scenario === 'tab-boundary') node = <TestInlineNestedNavigationMenuTabForwardBoundary />;
  else if (scenario === 'tab-flow') node = <TestInlineNestedNavigationMenuTabFlow />;
  else if (scenario === 'kept-content') node = <TestNavigationMenuWithKeepMountedContent />;
  else if (scenario === 'kept-content-closed') node = <TestNavigationMenuWithKeepMountedContentClosed />;
  else if (scenario === 'scoped-exit') node = <TestNavigationMenuWithScopedPopupExitAnimation onOpenChangeComplete={open => { completions.current.push(open); }} />;
  else if (scenario === 'scoped-top-link') node = <TestNavigationMenuWithTopLevelLinkScopedPopupAnimation />;
  else if (scenario === 'keyboard' || scenario === 'side') node = <NavigationMenu.Root orientation={orientation}><NavigationMenu.List><NavigationMenu.Item {...(scenario === 'side' ? { value: 'item-1' } : {})}><NavigationMenu.Trigger data-testid="trigger-1">{scenario === 'side' ? 'Item 1' : 'Overview'}</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href={scenario === 'side' ? '#link-1' : '#quick-start'}>{scenario === 'side' ? 'Link 1' : 'Quick Start'}</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner {...(scenario === 'side' ? { side } : {})}><NavigationMenu.Popup data-testid="popup-root"><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>;
  else if (scenario.startsWith('falsy-')) node = <NavigationMenu.Root onValueChange={onValueChange}><NavigationMenu.List><NavigationMenu.Item value={falsy}><NavigationMenu.Trigger data-testid="trigger-0">Zero</NavigationMenu.Trigger><NavigationMenu.Content data-testid="popup-0"><NavigationMenu.Link href="#link-0">Zero link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>;
  else if (scenario === 'orientation') node = <TestNavigationMenuOrientationAttributes />;
  else if (scenario === 'top-link') node = <TestNavigationMenuWithTopLevelLink {...rootProps} />;
  else if (scenario === 'disabled') node = <TestNavigationMenuWithDisabledTrigger {...rootProps} />;
  else if (scenario === 'nested' || scenario === 'nested-close-delay') node = <TestNestedNavigationMenu {...rootProps} />;
  else if (scenario === 'inline' || scenario === 'inline-outside' || scenario === 'inline-falsy-close' || scenario === 'inline-closed' || scenario === 'inline-keep' || scenario.startsWith('inline-falsy-')) node = <TestInlineNestedNavigationMenu {...(scenario === 'inline-closed' ? { nestedDefaultValue: null } : {})} {...(scenario === 'inline-falsy-close' ? { nestedDefaultValue: false, nestedItem1Value: false, nestedLinkCloseOnClick: true } : scenario.startsWith('inline-falsy-') ? { nestedDefaultValue: falsy, nestedItem1Value: falsy } : {})} keepMountedContent={scenario === 'inline-keep'} />;
  else if (scenario === 'dynamic') node = <TestInlineNestedNavigationMenuWithDynamicContent />;
  else node = <TestNavigationMenu {...rootProps} keepMountedPortal={scenario === 'kept-portal'} />;
  return <DirectionProvider direction={direction}>{scenario.startsWith('focus') && <button data-testid="first" />}{node}{['touch-outside', 'inline-outside'].includes(scenario) && <button data-testid="outside" />}{scenario === 'focus' && <button data-testid="last" />}</DirectionProvider>;
}
