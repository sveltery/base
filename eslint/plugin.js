import noClonedEvent from './no-cloned-event.js';
import noDerivedInlineAttachment from './no-derived-inline-attachment.js';
import noLayoutReadInDerived from './no-layout-read-in-derived.js';
import noUnscopedTimer from './no-unscoped-timer.js';
import noPreviousValueEffect from './no-previous-value-effect.js';
import noProcessEnv from './no-process-env.js';
import noPropStateSync from './no-prop-state-sync.js';
import noReactRefs from './no-react-refs.js';
import noSplitEffectLifecycle from './no-split-effect-lifecycle.js';
import noStateUpdater from './no-state-updater.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
	meta: {
		name: 'sveltery',
		version: '0.0.0'
	},
	rules: {
		'no-cloned-event': noClonedEvent,
		'no-derived-inline-attachment': noDerivedInlineAttachment,
		'no-layout-read-in-derived': noLayoutReadInDerived,
		'no-unscoped-timer': noUnscopedTimer,
		'no-previous-value-effect': noPreviousValueEffect,
		'no-process-env': noProcessEnv,
		'no-prop-state-sync': noPropStateSync,
		'no-react-refs': noReactRefs,
		'no-split-effect-lifecycle': noSplitEffectLifecycle,
		'no-state-updater': noStateUpdater
	}
};

export default plugin;
