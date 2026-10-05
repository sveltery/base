import { NavigationMenu } from '@base-ui/react/navigation-menu';
export function load({ url }: { url: URL }) {
  const part = url.searchParams.get('part') as keyof typeof NavigationMenu;
  if (!Object.hasOwn(NavigationMenu, part)) throw new Error('Unknown NavigationMenu part');
  const probe = url.searchParams.get('probe') ?? 'props-default';
  const reference = url.searchParams.has('reference');
  return { part, probe, reference };
}
