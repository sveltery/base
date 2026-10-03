export * as Tabs from './index.parts.js';
// Base UI v1.8.0 Tabs public names and all types; native Svelte components. MIT.
import TabsRootComponent from './root/TabsRoot.svelte';
export const TabsRoot = TabsRootComponent;
import TabsTabComponent from './tab/TabsTab.svelte';
export const TabsTab = TabsTabComponent;
import TabsIndicatorComponent from './indicator/TabsIndicator.svelte';
export const TabsIndicator = TabsIndicatorComponent;
import TabsPanelComponent from './panel/TabsPanel.svelte';
export const TabsPanel = TabsPanelComponent;
import TabsListComponent from './list/TabsList.svelte';
export const TabsList = TabsListComponent;
export type * from './types.js';

import type { TabsRootProps, TabsRootState, TabsRootOrientation, TabsRootChangeEventReason, TabsRootChangeEventDetails, TabsTabValue, TabsTabActivationDirection, TabsTabPosition, TabsTabSize, TabsTabMetadata, TabsTabState, TabsTabProps, TabsListState, TabsListProps, TabsPanelMetadata, TabsPanelState, TabsPanelProps, TabsIndicatorState, TabsIndicatorProps } from './types.js';
// Source public namespace type names; namespaces contain no runtime values.
/* eslint-disable @typescript-eslint/no-namespace */
export namespace TabsRoot {
  export type State = TabsRootState;
  export type Props = TabsRootProps;
  export type Orientation = TabsRootOrientation;
  export type ChangeEventReason = TabsRootChangeEventReason;
  export type ChangeEventDetails = TabsRootChangeEventDetails;
}
export namespace TabsList {
  export type State = TabsListState;
  export type Props = TabsListProps;
}
export namespace TabsTab {
  export type Value = TabsTabValue;
  export type ActivationDirection = TabsTabActivationDirection;
  export type Position = TabsTabPosition;
  export type Size = TabsTabSize;
  export type Metadata = TabsTabMetadata;
  export type State = TabsTabState;
  export type Props = TabsTabProps;
}
export namespace TabsPanel {
  export type Metadata = TabsPanelMetadata;
  export type State = TabsPanelState;
  export type Props = TabsPanelProps;
}
export namespace TabsIndicator {
  export type State = TabsIndicatorState;
  export type Props = TabsIndicatorProps;
}
