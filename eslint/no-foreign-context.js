/**
 * A component reads its own context module. Another component does not import it.
 * The folders that used to be exempt as a group are allowed only for the control
 * that actually reads them.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const ALLOWED = new Set([
	'accordion>collapsible',
	'checkbox-group>checkbox',
	'field>fieldset',
	'field>form',
	'number-field>field',
	'number-field>form',
	'otp-field>field',
	'otp-field>form',
	'radio-group>field',
	'radio-group>fieldset',
	'radio-group>form',
	'radio-group>radio',
	'slider>field',
	'slider>form',
	'toggle>toggle-group'
]);

const CONTEXT_FILE = /^(context|group-context|labelable)(\.|$)/;

/**
 * @param {string} source
 * @returns {string | null}
 */
function contextOwner(source) {
	const parts = source.replaceAll('\\', '/').split('/');
	const file = parts.at(-1) ?? '';
	if (!CONTEXT_FILE.test(file)) return null;
	if (source.startsWith('./')) return 'self';
	const dirs = parts.slice(0, -1).filter((part) => part !== '.' && part !== '..');
	return dirs.at(-1) ?? null;
}

/**
 * @param {string} filename
 */
function isSpecFile(filename) {
	const base = filename.replaceAll('\\', '/').split('/').at(-1) ?? '';
	return /\.spec\.[^./]+$/.test(base);
}

/**
 * @param {string} filename
 * @returns {string | null}
 */
function importerOwner(filename) {
	const normalized = filename.replaceAll('\\', '/');
	const marker = '/src/lib/';
	const at = normalized.lastIndexOf(marker);
	if (at < 0) return null;
	return normalized.slice(at + marker.length).split('/')[0] || null;
}

const rule = {
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow importing another component context module.'
		},
		schema: [],
		messages: {
			foreignContext:
				'Do not import another component context module. Read a shared provider from `src/lib/internal`, or call the hook that component publishes for its controls.'
		}
	},
	create(context) {
		const owner = importerOwner(context.filename);
		if (!owner) return {};

		return {
			ImportDeclaration(node) {
				if (typeof node.source.value !== 'string') return;
				const imported = contextOwner(node.source.value);
				if (!imported || imported === 'self' || imported === owner) return;
				if (ALLOWED.has(`${owner}>${imported}`)) return;
				// Input.svelte does not read form context. The spec counts unprovided fields.
				if (owner === 'input' && imported === 'form' && isSpecFile(context.filename)) {
					return;
				}
				context.report({ node, messageId: 'foreignContext' });
			}
		};
	}
};

export default rule;
