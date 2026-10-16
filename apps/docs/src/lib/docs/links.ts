export const SITE = 'https://base.sveltery.dev';
export const REPOSITORY = 'https://github.com/sveltery/base';

/** Component and util pages link to their library folder, as Base UI's "View source" does. */
export function sourceUrl(href: string): string | undefined {
	const [, section, slug] = href.split('/');
	if (section !== 'components' && section !== 'utils') return undefined;
	return `${REPOSITORY}/tree/main/src/lib/${slug}`;
}
