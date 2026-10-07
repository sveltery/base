import noReactRefs from './no-react-refs.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
	meta: {
		name: 'sveltery',
		version: '0.0.0'
	},
	rules: {
		'no-react-refs': noReactRefs
	}
};

export default plugin;
