import noUnknownDemoColors, {
	ruleName as noUnknownDemoColorsRuleName
} from './scripts/stylelint/no-unknown-demo-colors.mjs';

// Upstream's `stylelint.config.mjs`, with the `@mui/internal-code-infra/stylelint` base inlined.
/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard', 'stylelint-config-tailwindcss'],
	plugins: [noUnknownDemoColors],
	rules: {
		'alpha-value-notation': null,
		'custom-property-pattern': null,
		'media-feature-range-notation': null,
		'no-empty-source': null,
		'selector-class-pattern': null,
		'string-no-newline': null,
		'value-keyword-case': null,
		'import-notation': null,
		'at-rule-empty-line-before': null,
		'comment-empty-line-before': null,
		'custom-property-empty-line-before': null,
		'declaration-empty-line-before': null,
		'rule-empty-line-before': null,
		'property-no-vendor-prefix': null,
		'property-no-deprecated': null,
		'declaration-property-value-keyword-no-deprecated': null,
		'color-hex-length': null,
		'declaration-block-no-redundant-longhand-properties': null,
		'function-no-unknown': true,
		'number-max-precision': 5,
		'no-descending-specificity': null,
		// https://github.com/zhilidali/stylelint-config-tailwindcss/issues/12
		'declaration-property-value-no-unknown': null,
		'keyframes-name-pattern': null,
		'selector-pseudo-class-disallowed-list': ['has']
	},
	overrides: [
		{
			files: ['src/routes/**/demos/**/*.css'],
			rules: {
				[noUnknownDemoColorsRuleName]: true,
				'selector-pseudo-class-disallowed-list': null
			}
		}
	]
};
