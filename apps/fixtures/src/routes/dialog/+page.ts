export function load({ url }: { url: URL }) {
  const p = url.searchParams;
  return {
    mode: p.get('mode') ?? 'uncontrolled',
    modal:
      p.get('modal') === 'false'
        ? false
        : p.get('modal') === 'trap-focus'
          ? ('trap-focus' as const)
          : true,
    initial: p.has('initial'),
    keep: p.has('keep'),
    cancel: p.get('cancel') ?? '',
    prevent: p.has('prevent'),
    custom: p.has('custom'),
    focus: p.get('focus') ?? 'default',
    animate: p.has('animate'),
    nested: p.has('nested'),
    disabled: p.has('disabled'),
    audit: p.has('audit'),
  };
}
