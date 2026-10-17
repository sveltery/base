declare module 'virtual:docs-markdown' {
	/** Each page's `.md` twin, keyed by its path such as `/components/button`. */
	export const pages: Record<string, string>;
	export const files: import('../../../markdown/llms.ts').LlmsFiles;
}

declare module 'virtual:sitemap' {
	export const sitemap: import('../../../markdown/sitemap.ts').Sitemap;
}
