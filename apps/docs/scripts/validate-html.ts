import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { formatterFactory, HtmlValidate, type RuleConfig } from 'html-validate';

const pages = fileURLToPath(new URL('../.svelte-kit/output/prerendered/pages', import.meta.url));

// Upstream's per-page exceptions, for the same causes.
const overrides: Record<string, RuleConfig> = {
	// The hero demo's `Accordion.Header` is an `<h3>` right after the page's `<h1>`.
	'/components/accordion': { 'heading-level': 'off' },
	// `Slider.Label` labels the input through `aria-labelledby` only after hydration.
	'/components/slider': { 'input-missing-label': 'off' },
	// Combobox renders one id on both its input and its trigger during SSR.
	'/handbook/forms': { 'no-dup-id': 'off' },
	// Questionnaire.Input renders `form=""` to keep an unselected draft out of the form, as @shadcn/react does.
	'/extras/questionnaire': { 'attribute-allowed-values': 'off' },
	// InputOTP.Root renders its `<noscript>` fallback `<style>` beside the input, as input-otp does.
	'/extras/input-otp': { 'element-permitted-content': 'off' }
};

// `mui:recommended` from `@mui/internal-code-infra/brokenLinksChecker`, which upstream's
// `docs/scripts/reportBrokenLinks.mts` validates every page with.
const validator = (url: string) =>
	new HtmlValidate({
		extends: ['html-validate:standard', 'html-validate:document', 'html-validate:browser'],
		elements: ['html5'],
		rules: {
			'require-sri': 'off',
			// Popups wire their `aria-controls` targets only after hydration.
			'no-missing-references': 'off',
			...overrides[url]
		}
	});

const files = readdirSync(pages, { recursive: true, encoding: 'utf8' }).filter((file) =>
	file.endsWith('.html')
);
const results = [];
for (const file of files) {
	const url = `/${file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '')}`;
	const report = await validator(url).validateString(readFileSync(`${pages}/${file}`, 'utf8'), url);
	results.push(...report.results);
}

const messages = results.reduce((count, result) => count + result.messages.length, 0);
if (messages > 0) console.log(formatterFactory('stylish')(results));
console.log(`HTML validation: ${messages} messages across ${files.length} pages.`);
process.exit(messages);
