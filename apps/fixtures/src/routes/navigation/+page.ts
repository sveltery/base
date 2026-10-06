export function load({ url }: { url: URL }) {
  return {
    scenario: url.searchParams.get('case') ?? 'group-single',
    reference: url.searchParams.has('reference'),
    direction: url.searchParams.get('direction') === 'rtl' ? ('rtl' as const) : ('ltr' as const),
    orientation:
      url.searchParams.get('orientation') === 'vertical'
        ? ('vertical' as const)
        : ('horizontal' as const),
  };
}
