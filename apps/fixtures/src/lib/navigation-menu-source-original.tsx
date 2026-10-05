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
    Object.assign(window, { navigationMenuSource: { snapshot: () => ({ calls: [...calls.current], completions: [...completions.current] }), setValue, unmount: () => actions.current?.unmount() } });
    return () => { delete (window as unknown as { navigationMenuSource?: unknown }).navigationMenuSource; };
  }, []);
  const falsy = scenario.endsWith('zero') ? 0 : scenario.endsWith('false') ? false : '';
  const rootProps: NavigationMenu.Root.Props = { orientation, onValueChange, onOpenChangeComplete: (open) => { completions.current.push(open); },
    ...(['open', 'patient'].includes(scenario) ? { defaultValue: 'item-1' } : {}),
    ...(['controlled', 'manual'].includes(scenario) ? { value } : {}),
    ...(scenario === 'manual' ? { actionsRef: actions } : {}),
    ...(scenario === 'delay' ? { delay: 100 } : {}),
    ...(scenario === 'close-delay' ? { closeDelay: 100 } : {}),
  };
  let node: React.ReactNode;
  if (scenario === 'keyboard' || scenario === 'side') node = <NavigationMenu.Root><NavigationMenu.List><NavigationMenu.Item {...(scenario === 'side' ? { value: 'item-1' } : {})}><NavigationMenu.Trigger data-testid="trigger-1">{scenario === 'side' ? 'Item 1' : 'Overview'}</NavigationMenu.Trigger><NavigationMenu.Content><NavigationMenu.Link href={scenario === 'side' ? '#link-1' : '#quick-start'}>{scenario === 'side' ? 'Link 1' : 'Quick Start'}</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner {...(scenario === 'side' ? { side } : {})}><NavigationMenu.Popup data-testid="popup-root"><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>;
  else if (scenario.startsWith('falsy-')) node = <NavigationMenu.Root onValueChange={onValueChange}><NavigationMenu.List><NavigationMenu.Item value={falsy}><NavigationMenu.Trigger data-testid="trigger-0">Zero</NavigationMenu.Trigger><NavigationMenu.Content data-testid="popup-0"><NavigationMenu.Link href="#link-0">Zero link</NavigationMenu.Link></NavigationMenu.Content></NavigationMenu.Item></NavigationMenu.List><NavigationMenu.Portal><NavigationMenu.Positioner><NavigationMenu.Popup><NavigationMenu.Viewport /></NavigationMenu.Popup></NavigationMenu.Positioner></NavigationMenu.Portal></NavigationMenu.Root>;
  else if (scenario === 'orientation') node = <TestNavigationMenuOrientationAttributes />;
  else if (scenario === 'top-link') node = <TestNavigationMenuWithTopLevelLink {...rootProps} />;
  else if (scenario === 'disabled') node = <TestNavigationMenuWithDisabledTrigger {...rootProps} />;
  else if (scenario === 'nested') node = <TestNestedNavigationMenu {...rootProps} />;
  else if (scenario === 'inline' || scenario === 'inline-closed' || scenario === 'inline-keep' || scenario.startsWith('inline-falsy-')) node = <TestInlineNestedNavigationMenu {...(scenario === 'inline-closed' ? { nestedDefaultValue: null } : {})} {...(scenario.startsWith('inline-falsy-') ? { nestedDefaultValue: falsy, nestedItem1Value: falsy } : {})} keepMountedContent={scenario === 'inline-keep'} />;
  else if (scenario === 'dynamic') node = <TestInlineNestedNavigationMenuWithDynamicContent />;
  else node = <TestNavigationMenu {...rootProps} keepMountedPortal={scenario === 'kept-portal'} />;
  return <DirectionProvider direction={direction}>{scenario.startsWith('focus') && <button data-testid="first" />}{node}{scenario === 'focus' && <button data-testid="last" />}</DirectionProvider>;
}
