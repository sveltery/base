import noClonedEvent from './no-cloned-event.js';
import noCopiedHelper from './no-copied-helper.js';
import noDerivedInlineAttachment from './no-derived-inline-attachment.js';
import noInlineCompositeKeys from './no-inline-composite-keys.js';
import noComputedStyleDirection from './no-computed-style-direction.js';
import noForeignContext from './no-foreign-context.js';
import noPreviousValueEffect from './no-previous-value-effect.js';
import noProcessEnv from './no-process-env.js';
import noPropStateSync from './no-prop-state-sync.js';
import noReactRefs from './no-react-refs.js';
import noSplitEffectLifecycle from './no-split-effect-lifecycle.js';
import noVoidSignalRead from './no-void-signal-read.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
	meta: {
		name: 'sveltery',
		version: '0.0.0'
	},
	rules: {
		'no-cloned-event': noClonedEvent,
		'no-copied-helper': noCopiedHelper,
		'no-derived-inline-attachment': noDerivedInlineAttachment,
		'no-inline-composite-keys': noInlineCompositeKeys,
		'no-computed-style-direction': noComputedStyleDirection,
		'no-foreign-context': noForeignContext,
		'no-previous-value-effect': noPreviousValueEffect,
		'no-process-env': noProcessEnv,
		'no-prop-state-sync': noPropStateSync,
		'no-react-refs': noReactRefs,
		'no-split-effect-lifecycle': noSplitEffectLifecycle,
		'no-void-signal-read': noVoidSignalRead
	}
};

export default plugin;
