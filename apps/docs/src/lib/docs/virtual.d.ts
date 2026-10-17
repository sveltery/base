declare module 'virtual:docs-markdown' {
	export const pages: Record<string, string>;
	export const files: import('../../../markdown/llms.ts').LlmsFiles;
}

declare module 'virtual:sitemap' {
	export const sitemap: import('../../../markdown/sitemap.ts').Sitemap;
}
