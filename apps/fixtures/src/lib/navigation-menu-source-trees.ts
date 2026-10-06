// Literal tree shapes of the selected immutable Original test fixtures; MIT.
import type { NavigationMenu } from '@sveltery/base/navigation-menu';
export type SourceTree = {
  root?: NavigationMenu.Root.Props;
  listTestId?: string;
  portal?: boolean;
  keepPortal?: boolean;
  positionerTestId?: string;
  positionerSide?: NavigationMenu.Positioner.Props['side'];
  popupTestId?: string;
  popupClass?: string;
  viewportTestId?: string;
  scopedStyles?: boolean;
  items: {
    value?: unknown;
    trigger?: string;
    triggerId?: string;
    contentId?: string;
    contentClass?: string;
    keepContent?: boolean;
    links?: { text: string; href: string; id?: string; close?: boolean }[];
    directLink?: { text: string; href: string; id: string };
    children?: SourceTree;
    box?: { width: number; height: number; text: string };
  }[];
};
const link = (text: string, href: string, id?: string, close?: boolean) => ({
  text,
  href,
  id,
  close,
});
export function sourceExtraTree(scenario: string): SourceTree {
  if (scenario === 'nested-close')
    return {
      items: [
        {
          value: 'item-1',
          trigger: 'Item 1',
          triggerId: 'trigger-1',
          contentId: 'popup-1',
          links: [link('Link 1', '#link-1', undefined, true)],
          children: {
            portal: true,
            positionerSide: 'right',
            items: [
              {
                value: 'nested-item-1',
                trigger: 'Nested Item 1',
                triggerId: 'nested-trigger-1',
                contentId: 'nested-popup-1',
                links: [link('Nested Link 1', '#nested-link-1', 'nested-link-1', true)],
              },
            ],
          },
        },
      ],
    };
  if (scenario === 'deep' || scenario === 'deep-close') {
    const close = scenario === 'deep-close';
    const level3: SourceTree = {
      root: { defaultValue: 'level3-item-1' },
      portal: false,
      items: [
        {
          value: 'level3-item-1',
          trigger: 'Level 3 Item 1',
          triggerId: 'level3-trigger-1',
          contentId: 'level3-content-1',
          links: [
            link('Level 3 Link 1', '#level3-link-1', close ? 'level3-link-1' : undefined, close),
          ],
        },
        ...(!close
          ? [
              {
                value: 'level3-item-2',
                trigger: 'Level 3 Item 2',
                triggerId: 'level3-trigger-2',
                contentId: 'level3-content-2',
                links: [link('Level 3 Link 2', '#level3-link-2')],
              },
            ]
          : []),
      ],
    };
    const level2: SourceTree = {
      root: { defaultValue: 'level2-item-1' },
      portal: false,
      items: [
        {
          value: 'level2-item-1',
          trigger: 'Level 2 Item 1',
          triggerId: 'level2-trigger-1',
          contentId: 'level2-content-1',
          ...(!close ? { links: [link('Level 2 Link 1', '#level2-link-1', 'level2-link-1')] } : {}),
          children: level3,
        },
        ...(!close
          ? [
              {
                value: 'level2-item-2',
                trigger: 'Level 2 Item 2',
                triggerId: 'level2-trigger-2',
                contentId: 'level2-content-2',
                links: [link('Level 2 Link 2', '#level2-link-2')],
              },
            ]
          : []),
      ],
    };
    return {
      items: [
        {
          value: 'item-1',
          trigger: 'Item 1',
          triggerId: 'trigger-1',
          contentId: 'content-1',
          ...(!close ? { links: [link('Link 1', '#link-1', 'link-1')] } : {}),
          children: level2,
        },
      ],
    };
  }
  if (scenario === 'tab-boundary')
    return {
      items: [
        {
          value: 'item-1',
          trigger: 'Product',
          triggerId: 'trigger-1',
          contentId: 'popup-1',
          children: {
            root: { defaultValue: 'nested-item-2' },
            portal: false,
            items: [
              {
                value: 'nested-item-1',
                trigger: 'Engineering Leads',
                triggerId: 'nested-trigger-1',
                contentId: 'nested-popup-1',
                links: [link('Releases', '#releases')],
              },
              {
                value: 'nested-item-2',
                trigger: 'Startups',
                triggerId: 'nested-trigger-2',
                contentId: 'nested-popup-2',
                links: [
                  link('Quick start', '#quick-start'),
                  link('Menu', '#menu'),
                  link('Select', '#select', 'nested-last-link'),
                ],
              },
            ],
          },
        },
        {
          value: 'item-2',
          trigger: 'Learn',
          triggerId: 'trigger-2',
          contentId: 'popup-2',
          links: [link('Learn link', '#learn')],
        },
      ],
    };
  if (scenario === 'tab-flow')
    return {
      items: [
        {
          value: 'item-1',
          trigger: 'Product',
          triggerId: 'trigger-product',
          contentId: 'popup-product',
          children: {
            root: { defaultValue: 'developers', orientation: 'vertical' },
            portal: false,
            items: [
              {
                value: 'developers',
                trigger: 'Developers',
                triggerId: 'nested-trigger-developers',
                contentId: 'nested-popup-developers',
                links: [
                  link('Get started', '#get-started', 'nested-link-get-started'),
                  link('Composition', '#composition', 'nested-link-composition'),
                ],
              },
              {
                value: 'design-systems',
                trigger: 'Design Systems',
                triggerId: 'nested-trigger-design-systems',
                contentId: 'nested-popup-design-systems',
                links: [
                  link('Styling', '#styling', 'nested-link-design-systems-styling'),
                  link('Accessibility', '#accessibility'),
                ],
              },
              {
                value: 'engineering-leads',
                trigger: 'Engineering Leads',
                links: [link('Releases', '#releases')],
              },
            ],
          },
        },
        {
          value: 'item-2',
          trigger: 'Learn',
          triggerId: 'trigger-learn',
          links: [link('Learn link', '#learn')],
        },
      ],
    };
  const scoped = scenario.startsWith('scoped');
  return {
    root: scenario === 'kept-content' ? { defaultValue: 'item-1' } : undefined,
    keepPortal: scenario === 'kept-content-closed' || scenario === 'scoped-top-link',
    positionerTestId: 'positioner',
    popupTestId: 'popup-root',
    popupClass: scoped ? 'test-navigation-menu-popup' : undefined,
    scopedStyles: scoped,
    items: [
      {
        value: 'item-1',
        trigger: 'Product',
        triggerId: 'trigger-product',
        contentClass: scoped ? 'test-navigation-menu-content' : undefined,
        keepContent: !scoped,
        box: { width: 675, height: 220, text: 'Product panel' },
      },
      ...(scenario === 'scoped-top-link'
        ? [
            {
              directLink: { text: 'Top level link', href: '#top-level-link', id: 'top-level-link' },
            },
          ]
        : []),
      {
        value: 'item-2',
        trigger: 'Learn',
        triggerId: 'trigger-learn',
        contentClass: scoped ? 'test-navigation-menu-content' : undefined,
        keepContent: !scoped,
        box: { width: 500, height: 180, text: 'Learn panel' },
      },
    ],
  };
}
