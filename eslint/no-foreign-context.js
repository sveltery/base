/**
 * A component reads its own context module. Another component does not import it.
 * Field, form, fieldset, collapsible, toggle group, radio, and checkbox publish
 * context that their controls are meant to read.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
const SHARED = new Set([
	'field',
	'form',
	'fieldset',
	'collapsible',
	'toggle-group',
	'radio',
	'checkbox'
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
				if (SHARED.has(imported)) return;
				context.report({ node, messageId: 'foreignContext' });
			}
		};
	}
};

export default rule;
