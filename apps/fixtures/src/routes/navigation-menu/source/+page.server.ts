import type { NavigationMenu } from '@sveltery/base/navigation-menu';
export function load({ url }: { url: URL }) {
  const scenario = url.searchParams.get('case') ?? 'default';
  const reference = url.searchParams.has('reference');
  const direction = url.searchParams.get('direction') === 'rtl' ? 'rtl' as const : 'ltr' as const;
  const orientation = url.searchParams.get('orientation') === 'vertical' ? 'vertical' as const : 'horizontal' as const;
  const side = (url.searchParams.get('side') ?? 'bottom') as NavigationMenu.Positioner.Props['side'];
  return { side, scenario, reference, direction, orientation };
}
