// Moves each ```svelte demo``` fence out of the pages into `demos/<name>/tailwind/index.svelte`
// beside the page, with a `demos/<name>/index.ts` stub, the way Base UI's docs keep their demos.
// The page imports the stub and renders it where the fence was. Names follow Base UI's demo for
// the same example. Run with `node scripts/move-demos-to-folders.ts` from apps/docs.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const docs = new URL('..', import.meta.url).pathname;
const routes = join(docs, 'src/routes/(docs)');

// Each page's demos in order: the component Base UI names it, and the folder it lives in. Three
// pages show a demo another page owns, as Base UI's do.
const DEMOS: Record<string, Array<[name: string, path: string]>> = {
	'components/accordion': [
		['DemoAccordionHero', './demos/hero'],
		['DemoAccordionMultiple', './demos/multiple'],
		['DemoAccordionHiddenUntilFound', './demos/hidden-until-found']
	],
	'components/alert-dialog': [
		['DemoAlertDialogHero', './demos/hero'],
		['DemoAlertDialogOpenFromMenu', './demos/open-from-menu'],
		['DemoDialogCloseConfirmation', '../dialog/demos/close-confirmation'],
		['DemoAlertDialogDetachedTriggersSimple', './demos/detached-triggers-simple'],
		['DemoAlertDialogDetachedTriggersControlled', './demos/detached-triggers-controlled']
	],
	'components/autocomplete': [
		['DemoAutocompleteHero', './demos/hero'],
		['DemoAutocompleteAsync', './demos/async'],
		['DemoAutocompleteInline', './demos/inline'],
		['DemoAutocompleteGrouped', './demos/grouped'],
		['DemoAutocompleteFuzzyMatching', './demos/fuzzy-matching'],
		['DemoAutocompleteLimit', './demos/limit'],
		['DemoAutocompleteAutoHighlight', './demos/auto-highlight'],
		['DemoAutocompleteCommandPalette', './demos/command-palette'],
		['DemoAutocompleteGrid', './demos/grid'],
		['DemoAutocompleteVirtualized', './demos/virtualized']
	],
	'components/avatar': [['DemoAvatarHero', './demos/hero']],
	'components/button': [
		['DemoButtonHero', './demos/hero'],
		['DemoButtonLoading', './demos/loading']
	],
	'components/checkbox': [['DemoCheckboxBasic', './demos/hero']],
	'components/checkbox-group': [
		['DemoCheckboxGroupHero', './demos/hero'],
		['DemoCheckboxGroupParent', './demos/parent'],
		['DemoCheckboxGroupNested', './demos/nested']
	],
	'components/collapsible': [['DemoCollapsibleHero', './demos/hero']],
	'components/combobox': [
		['DemoComboboxHero', './demos/hero'],
		['DemoComboboxCreateItems', './demos/create-items'],
		['DemoComboboxMultiple', './demos/multiple'],
		['DemoComboboxInputInsidePopup', './demos/input-inside-popup'],
		['DemoComboboxGrouped', './demos/grouped'],
		['DemoComboboxAsyncSingle', './demos/async-single'],
		['DemoComboboxAsyncMultiple', './demos/async-multiple'],
		['DemoComboboxCreatable', './demos/creatable'],
		['DemoComboboxVirtualized', './demos/virtualized']
	],
	'components/context-menu': [
		['DemoContextMenuHero', './demos/hero'],
		['DemoContextMenuWithMenu', './demos/with-menu'],
		['DemoContextMenuSubmenu', './demos/submenu']
	],
	'components/dialog': [
		['DemoDialogHero', './demos/hero'],
		['DemoDialogOpenFromMenu', './demos/open-from-menu'],
		['DemoDialogNested', './demos/nested'],
		['DemoDialogCloseConfirmation', './demos/close-confirmation'],
		['DemoDialogFocusManagement', './demos/focus-management'],
		['DemoDialogOutsideScroll', './demos/outside-scroll'],
		['DemoDialogInsideScroll', './demos/inside-scroll'],
		['DemoDialogUncontained', './demos/uncontained'],
		['DemoDialogDetachedTriggersSimple', './demos/detached-triggers-simple'],
		['DemoDialogDetachedTriggersControlled', './demos/detached-triggers-controlled']
	],
	'components/drawer': [
		['DemoDrawerHero', './demos/hero'],
		['DemoDrawerPosition', './demos/position'],
		['DemoDrawerNested', './demos/nested'],
		['DemoDrawerSnapPoints', './demos/snap-points'],
		['DemoDrawerVirtualKeyboardAware', './demos/virtual-keyboard-aware'],
		['DemoDrawerIndentProvider', './demos/indent-provider'],
		['DemoDrawerNonModal', './demos/non-modal'],
		['DemoDrawerMobileNav', './demos/mobile-nav'],
		['DemoDrawerSwipeArea', './demos/swipe-area'],
		['DemoDrawerCloseConfirmation', './demos/close-confirmation'],
		['DemoDrawerUncontained', './demos/uncontained']
	],
	'components/field': [['DemoFieldHero', './demos/hero']],
	'components/fieldset': [['DemoFieldsetHero', './demos/hero']],
	'components/form': [
		['DemoFormHero', './demos/hero'],
		['DemoFormAction', './demos/form-action'],
		['DemoFormZod', './demos/zod']
	],
	'components/input': [['DemoInputHero', './demos/hero']],
	'components/menu': [
		['DemoMenuHero', './demos/hero'],
		['DemoMenuOpenOnHover', './demos/open-on-hover'],
		['DemoMenuCheckboxItems', './demos/checkbox-items'],
		['DemoMenuRadioItems', './demos/radio-items'],
		['DemoMenuGroupLabels', './demos/group-labels'],
		['DemoMenuSubmenu', './demos/submenu'],
		['DemoMenuDetachedTriggersSimple', './demos/detached-triggers-simple'],
		['DemoMenuDetachedTriggersControlled', './demos/detached-triggers-controlled'],
		['DemoMenuArrow', './demos/arrow'],
		['DemoMenuDetachedTriggersFull', './demos/detached-triggers-full'],
		['DemoMenuFilter', './demos/filter']
	],
	'components/menubar': [['DemoMenubarHero', './demos/hero']],
	'components/meter': [['DemoMeterHero', './demos/hero']],
	'components/navigation-menu': [
		['DemoNavigationMenuHero', './demos/hero'],
		['DemoNavigationMenuNested', './demos/nested'],
		['DemoNavigationMenuNestedInline', './demos/nested-inline']
	],
	'components/number-field': [['DemoNumberFieldHero', './demos/hero']],
	'components/otp-field': [
		['DemoOTPFieldHero', './demos/hero'],
		['DemoOTPFieldAlphanumeric', './demos/alphanumeric'],
		['DemoOTPFieldGrouped', './demos/grouped'],
		['DemoOTPFieldFocusedPlaceholder', './demos/focused-placeholder'],
		['DemoOTPFieldCustomNormalize', './demos/custom-sanitize'],
		['DemoOTPFieldPassword', './demos/password']
	],
	'components/popover': [
		['DemoPopoverHero', './demos/hero'],
		['DemoPopoverOpenOnHover', './demos/open-on-hover'],
		['DemoPopoverDetachedTriggersSimple', './demos/detached-triggers-simple'],
		['DemoPopoverDetachedTriggersControlled', './demos/detached-triggers-controlled'],
		['DemoPopoverDetachedTriggersFull', './demos/detached-triggers-full']
	],
	'components/preview-card': [
		['DemoPreviewCardHero', './demos/hero'],
		['DemoPreviewCardDetachedTriggersSimple', './demos/detached-triggers-simple'],
		['DemoPreviewCardDetachedTriggersControlled', './demos/detached-triggers-controlled'],
		['DemoPreviewCardDetachedTriggersFull', './demos/detached-triggers-full']
	],
	'components/progress': [['DemoProgressHero', './demos/hero']],
	'components/radio-group': [['DemoRadioHero', './demos/hero']],
	'components/scroll-area': [
		['DemoScrollAreaHero', './demos/hero'],
		['DemoScrollAreaBoth', './demos/both'],
		['DemoScrollAreaScrollFade', './demos/scroll-fade']
	],
	'components/select': [
		['DemoSelectHero', './demos/hero'],
		['DemoSelectMultiple', './demos/multiple'],
		['DemoSelectObjectValues', './demos/object-values'],
		['DemoSelectGrouped', './demos/grouped']
	],
	'components/separator': [['DemoSeparatorHero', './demos/hero']],
	'components/slider': [
		['DemoSliderHero', './demos/hero'],
		['DemoSliderRangeSlider', './demos/range-slider'],
		['DemoSliderSteps', './demos/steps'],
		['DemoSliderMarks', './demos/marks'],
		['DemoSliderEdgeAlignment', './demos/edge-alignment'],
		['DemoSliderVertical', './demos/vertical']
	],
	'components/switch': [['DemoSwitchHero', './demos/hero']],
	'components/tabs': [
		['DemoTabsHero', './demos/hero'],
		['DemoTabsAnimatedPanels', './demos/animated-panels']
	],
	'components/toast': [
		['DemoToastHero', './demos/hero'],
		['DemoToastAnchored', './demos/anchored'],
		['DemoToastPosition', './demos/position'],
		['DemoToastUndo', './demos/undo'],
		['DemoToastPromise', './demos/promise'],
		['DemoToastCustom', './demos/custom'],
		['DemoToastDeduplicate', './demos/deduplicate'],
		['DemoToastVaryingHeights', './demos/varying-heights']
	],
	'components/toggle': [['DemoToggleHero', './demos/hero']],
	'components/toggle-group': [
		['DemoToggleGroupHero', './demos/hero'],
		['DemoToggleGroupMultiple', './demos/multiple']
	],
	'components/toolbar': [['DemoToolbarHero', './demos/hero']],
	'components/tooltip': [
		['DemoTooltipHero', './demos/hero'],
		['DemoTooltipDetachedTriggersSimple', './demos/detached-triggers-simple'],
		['DemoTooltipDetachedTriggersControlled', './demos/detached-triggers-controlled'],
		['DemoTooltipDetachedTriggersFull', './demos/detached-triggers-full']
	],
	'handbook/animation': [
		[
			'DemoAnimatedPopoverSvelteTransitionKeepMountedFalse',
			'./demos/animated-popover-svelte-transition-keep-mounted-false'
		],
		[
			'DemoAnimatedPopoverWebAnimationsKeepMountedTrue',
			'./demos/animated-popover-web-animations-keep-mounted-true'
		],
		['DemoAnimatedSelectWebAnimations', './demos/animated-select-web-animations']
	],
	'handbook/forms': [
		['DemoSvelteryBaseForm', './demos/hero'],
		['DemoSuperforms', './demos/superforms'],
		['DemoTanstackForm', './demos/tanstack-form']
	],
	'overview/quick-start': [['DemoPopoverHero', '../../components/popover/demos/hero']],
	'utils/direction-provider': [['DemoDirectionProviderHero', './demos/hero']],
	'utils/merge-props': [['DemoPreventBaseUIHandler', './demos/prevent-base-ui-handler']]
};

// The Forms demos share a toast list, which moves beside them as Base UI's `demos/components/`.
const SHARED = {
	from: 'src/lib/components/ToastList.svelte',
	to: 'handbook/forms/demos/components'
};

const FENCE = /^```svelte demo\n([\s\S]*?)^```\n/gm;

const stub = (name: string) => `import { createDemoWithVariants } from '#lib/docs/create-demo.ts';
import Tailwind from './tailwind/index.svelte';

export const ${name} = createDemoWithVariants(import.meta.url, { Tailwind });
`;

function write(file: string, content: string) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, content);
}

let moved = 0;
for (const [page, demos] of Object.entries(DEMOS)) {
	const file = join(routes, page, '+page.md');
	const source = readFileSync(file, 'utf8');
	const fences = [...source.matchAll(FENCE)];
	if (!fences.length) continue;
	if (fences.length !== demos.length)
		throw new Error(`${page}: ${fences.length} demo fences, but ${demos.length} names`);

	let index = 0;
	let body = source.replace(FENCE, (_fence, code: string) => {
		const [name, path] = demos[index++];
		if (path.startsWith('./')) {
			const folder = join(routes, page, path);
			write(
				join(folder, 'tailwind/index.svelte'),
				code.replace('#lib/components/ToastList.svelte', '../../components/ToastList.svelte')
			);
			write(join(folder, 'index.ts'), stub(name));
		}
		moved++;
		return `<${name} />\n`;
	});

	const imports = [...new Map(demos.map(([name, path]) => [name, path]))].map(
		([name, path]) => `\timport { ${name} } from '${path}';`
	);
	const script = /^<script>\n/m.exec(body);
	body = script
		? `${body.slice(0, script.index + script[0].length)}${imports.join('\n')}\n${body.slice(script.index + script[0].length)}`
		: body.replace(`<${demos[0][0]} />\n`, `<script>\n${imports.join('\n')}\n</script>\n\n$&`);
	writeFileSync(file, body);
}

if (existsSync(join(docs, SHARED.from))) {
	mkdirSync(join(routes, SHARED.to), { recursive: true });
	renameSync(join(docs, SHARED.from), join(routes, SHARED.to, 'ToastList.svelte'));
}
console.log(`Moved ${moved} demos.`);
