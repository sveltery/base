import noClonedEvent from './no-cloned-event.js';
import noDirectFieldRegistration from './no-direct-field-registration.js';
import noCopiedHelper from './no-copied-helper.js';
import noDualChangeHandler from './no-dual-change-handler.js';
import noDerivedInlineAttachment from './no-derived-inline-attachment.js';
import noInlineCompositeKeys from './no-inline-composite-keys.js';
import noLateBoundGetter from './no-late-bound-getter.js';
import noUncontrolledBindable from './no-uncontrolled-bindable.js';
import noUnscopedTimer from './no-unscoped-timer.js';
import noComputedStyleDirection from './no-computed-style-direction.js';
import noForeignContext from './no-foreign-context.js';
import noPreviousValueEffect from './no-previous-value-effect.js';
import noProcessEnv from './no-process-env.js';
import noPublicCallbackUntracked from './no-public-callback-untracked.js';
import noPropStateSync from './no-prop-state-sync.js';
import noReactRefs from './no-react-refs.js';
import noSplitEffectLifecycle from './no-split-effect-lifecycle.js';
import noStateUpdater from './no-state-updater.js';
import noVoidSignalRead from './no-void-signal-read.js';

/** @type {import('eslint').ESLint.Plugin} */
const plugin = {
	meta: {
		name: 'sveltery',
		version: '0.0.0'
	},
	rules: {
		'no-cloned-event': noClonedEvent,
		'no-direct-field-registration': noDirectFieldRegistration,
		'no-copied-helper': noCopiedHelper,
		'no-dual-change-handler': noDualChangeHandler,
		'no-derived-inline-attachment': noDerivedInlineAttachment,
		'no-inline-composite-keys': noInlineCompositeKeys,
		'no-late-bound-getter': noLateBoundGetter,
		'no-uncontrolled-bindable': noUncontrolledBindable,
		'no-unscoped-timer': noUnscopedTimer,
		'no-computed-style-direction': noComputedStyleDirection,
		'no-foreign-context': noForeignContext,
		'no-previous-value-effect': noPreviousValueEffect,
		'no-process-env': noProcessEnv,
		'no-public-callback-untracked': noPublicCallbackUntracked,
		'no-prop-state-sync': noPropStateSync,
		'no-react-refs': noReactRefs,
		'no-split-effect-lifecycle': noSplitEffectLifecycle,
		'no-state-updater': noStateUpdater,
		'no-void-signal-read': noVoidSignalRead
	}
};

export default plugin;
