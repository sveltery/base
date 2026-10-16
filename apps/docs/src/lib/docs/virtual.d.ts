declare module 'virtual:docs-markdown' {
	const pages: Record<string, import('../../../markdown/llms.ts').MarkdownPage>;
	export default pages;
}
