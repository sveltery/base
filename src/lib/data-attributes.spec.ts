import { describe, expect, it } from 'vitest';
import * as barrel from './index.js';

// The *DataAttributes and *CssVariables namespaces of Base UI v1.9.0, per component entry,
// copied from packages/react/src/<component>/index.ts (commit ad7ecda5296b0295b41a51ecb01fce6204acd099).
const upstream: Record<string, Record<string, Record<string, string>>> = {
	accordion: {
		AccordionRootDataAttributes: {
			disabled: 'data-disabled',
			orientation: 'data-orientation'
		},
		AccordionItemDataAttributes: {
			disabled: 'data-disabled',
			index: 'data-index',
			open: 'data-open'
		},
		AccordionHeaderDataAttributes: {
			disabled: 'data-disabled',
			index: 'data-index',
			open: 'data-open'
		},
		AccordionTriggerDataAttributes: {
			disabled: 'data-disabled',
			index: 'data-index',
			panelOpen: 'data-panel-open'
		},
		AccordionPanelCssVariables: {
			accordionPanelHeight: '--accordion-panel-height',
			accordionPanelWidth: '--accordion-panel-width'
		},
		AccordionPanelDataAttributes: {
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			index: 'data-index',
			open: 'data-open',
			orientation: 'data-orientation',
			startingStyle: 'data-starting-style'
		}
	},
	'alert-dialog': {
		AlertDialogBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		AlertDialogCloseDataAttributes: {
			disabled: 'data-disabled'
		},
		AlertDialogPopupCssVariables: {
			nestedDialogs: '--nested-dialogs'
		},
		AlertDialogPopupDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			nested: 'data-nested',
			nestedDialogOpen: 'data-nested-dialog-open',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		AlertDialogTriggerDataAttributes: {
			disabled: 'data-disabled',
			popupOpen: 'data-popup-open'
		},
		AlertDialogViewportDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			nested: 'data-nested',
			nestedDialogOpen: 'data-nested-dialog-open',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		}
	},
	autocomplete: {
		AutocompleteTriggerDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			listEmpty: 'data-list-empty',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		AutocompleteInputDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			listEmpty: 'data-list-empty',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		AutocompleteInputGroupDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			listEmpty: 'data-list-empty',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		AutocompleteClearDataAttributes: {
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			popupOpen: 'data-popup-open',
			startingStyle: 'data-starting-style',
			visible: 'data-visible'
		},
		AutocompleteBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		AutocompletePositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			transformOrigin: '--transform-origin'
		},
		AutocompletePositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			empty: 'data-empty',
			open: 'data-open',
			side: 'data-side'
		},
		AutocompletePopupDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			empty: 'data-empty',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		AutocompleteArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		AutocompleteItemDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted'
		},
		AutocompleteSeparatorDataAttributes: {
			orientation: 'data-orientation'
		}
	},
	avatar: {
		AvatarImageDataAttributes: {
			endingStyle: 'data-ending-style',
			error: 'data-error',
			loading: 'data-loading',
			startingStyle: 'data-starting-style'
		}
	},
	button: {
		ButtonDataAttributes: {
			disabled: 'data-disabled'
		}
	},
	checkbox: {
		CheckboxRootDataAttributes: {
			checked: 'data-checked',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			indeterminate: 'data-indeterminate',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			unchecked: 'data-unchecked',
			valid: 'data-valid'
		},
		CheckboxIndicatorDataAttributes: {
			checked: 'data-checked',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			filled: 'data-filled',
			focused: 'data-focused',
			indeterminate: 'data-indeterminate',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			startingStyle: 'data-starting-style',
			touched: 'data-touched',
			unchecked: 'data-unchecked',
			valid: 'data-valid'
		}
	},
	'checkbox-group': {
		CheckboxGroupDataAttributes: {
			disabled: 'data-disabled'
		}
	},
	collapsible: {
		CollapsibleRootDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		CollapsibleTriggerDataAttributes: {
			panelOpen: 'data-panel-open'
		},
		CollapsiblePanelCssVariables: {
			collapsiblePanelHeight: '--collapsible-panel-height',
			collapsiblePanelWidth: '--collapsible-panel-width'
		},
		CollapsiblePanelDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		}
	},
	combobox: {
		ComboboxInputDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			listEmpty: 'data-list-empty',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		ComboboxInputGroupDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			listEmpty: 'data-list-empty',
			placeholder: 'data-placeholder',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		ComboboxTriggerDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			listEmpty: 'data-list-empty',
			placeholder: 'data-placeholder',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		ComboboxBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		ComboboxPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			transformOrigin: '--transform-origin'
		},
		ComboboxPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			empty: 'data-empty',
			open: 'data-open',
			side: 'data-side'
		},
		ComboboxPopupDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			empty: 'data-empty',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		ComboboxArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		ComboboxItemDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			selected: 'data-selected'
		},
		ComboboxItemIndicatorDataAttributes: {
			endingStyle: 'data-ending-style',
			startingStyle: 'data-starting-style'
		},
		ComboboxClearDataAttributes: {
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			popupOpen: 'data-popup-open',
			startingStyle: 'data-starting-style',
			visible: 'data-visible'
		},
		ComboboxSeparatorDataAttributes: {
			orientation: 'data-orientation'
		}
	},
	'context-menu': {
		ContextMenuArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		ContextMenuBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		ContextMenuCheckboxItemDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			unchecked: 'data-unchecked'
		},
		ContextMenuCheckboxItemIndicatorDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			startingStyle: 'data-starting-style',
			unchecked: 'data-unchecked'
		},
		ContextMenuItemDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted'
		},
		ContextMenuLinkItemDataAttributes: {
			highlighted: 'data-highlighted'
		},
		ContextMenuPopupDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			instant: 'data-instant',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		ContextMenuPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			positionerHeight: '--positioner-height',
			positionerWidth: '--positioner-width',
			transformOrigin: '--transform-origin'
		},
		ContextMenuPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side'
		},
		ContextMenuRadioItemDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			unchecked: 'data-unchecked'
		},
		ContextMenuRadioItemIndicatorDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			startingStyle: 'data-starting-style',
			unchecked: 'data-unchecked'
		},
		ContextMenuSeparatorDataAttributes: {
			orientation: 'data-orientation'
		},
		ContextMenuSubmenuTriggerDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			popupOpen: 'data-popup-open'
		},
		ContextMenuTriggerDataAttributes: {
			popupOpen: 'data-popup-open',
			pressed: 'data-pressed'
		}
	},
	dialog: {
		DialogBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		DialogCloseDataAttributes: {
			disabled: 'data-disabled'
		},
		DialogPopupCssVariables: {
			nestedDialogs: '--nested-dialogs'
		},
		DialogPopupDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			nested: 'data-nested',
			nestedDialogOpen: 'data-nested-dialog-open',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		DialogViewportDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			nested: 'data-nested',
			nestedDialogOpen: 'data-nested-dialog-open',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		DialogTriggerDataAttributes: {
			disabled: 'data-disabled',
			popupOpen: 'data-popup-open'
		}
	},
	drawer: {
		DrawerBackdropCssVariables: {
			swipeProgress: '--drawer-swipe-progress'
		},
		DrawerBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		DrawerPopupCssVariables: {
			frontmostHeight: '--drawer-frontmost-height',
			height: '--drawer-height',
			nestedDrawers: '--nested-drawers',
			snapPointOffset: '--drawer-snap-point-offset',
			swipeMovementX: '--drawer-swipe-movement-x',
			swipeMovementY: '--drawer-swipe-movement-y',
			swipeStrength: '--drawer-swipe-strength'
		},
		DrawerPopupDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			expanded: 'data-expanded',
			nestedDrawerOpen: 'data-nested-drawer-open',
			nestedDrawerSwiping: 'data-nested-drawer-swiping',
			open: 'data-open',
			startingStyle: 'data-starting-style',
			swipeDirection: 'data-swipe-direction',
			swipeDismiss: 'data-swipe-dismiss',
			swiping: 'data-swiping'
		},
		DrawerSwipeAreaDataAttributes: {
			closed: 'data-closed',
			disabled: 'data-disabled',
			open: 'data-open',
			swipeDirection: 'data-swipe-direction',
			swiping: 'data-swiping'
		},
		DrawerViewportCssVariables: {
			keyboardInset: '--drawer-keyboard-inset'
		},
		DrawerViewportDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			nested: 'data-nested',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		DrawerTriggerDataAttributes: {
			disabled: 'data-disabled',
			popupOpen: 'data-popup-open'
		},
		DrawerCloseDataAttributes: {
			disabled: 'data-disabled'
		}
	},
	field: {
		FieldRootDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		FieldLabelDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		FieldErrorDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			startingStyle: 'data-starting-style',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		FieldDescriptionDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		FieldControlDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		FieldItemDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			touched: 'data-touched',
			valid: 'data-valid'
		}
	},
	fieldset: {
		FieldsetLegendDataAttributes: {
			disabled: 'data-disabled'
		}
	},
	input: {
		InputDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			touched: 'data-touched',
			valid: 'data-valid'
		}
	},
	menu: {
		MenuArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		MenuBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		MenuCheckboxItemDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			unchecked: 'data-unchecked'
		},
		MenuCheckboxItemIndicatorDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			startingStyle: 'data-starting-style',
			unchecked: 'data-unchecked'
		},
		MenuClearDataAttributes: {
			disabled: 'data-disabled'
		},
		MenuInputDataAttributes: {
			highlighted: 'data-highlighted'
		},
		MenuItemDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted'
		},
		MenuLinkItemDataAttributes: {
			highlighted: 'data-highlighted'
		},
		MenuPopupDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			instant: 'data-instant',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		MenuPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			positionerHeight: '--positioner-height',
			positionerWidth: '--positioner-width',
			transformOrigin: '--transform-origin'
		},
		MenuPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side'
		},
		MenuRadioItemDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			unchecked: 'data-unchecked'
		},
		MenuRadioItemIndicatorDataAttributes: {
			checked: 'data-checked',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			startingStyle: 'data-starting-style',
			unchecked: 'data-unchecked'
		},
		MenuSeparatorDataAttributes: {
			orientation: 'data-orientation'
		},
		MenuSubmenuTriggerDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			popupOpen: 'data-popup-open'
		},
		MenuTriggerDataAttributes: {
			disabled: 'data-disabled',
			popupOpen: 'data-popup-open',
			pressed: 'data-pressed'
		},
		MenuViewportCssVariables: {
			popupHeight: '--popup-height',
			popupWidth: '--popup-width'
		},
		MenuViewportDataAttributes: {
			activationDirection: 'data-activation-direction',
			current: 'data-current',
			instant: 'data-instant',
			previous: 'data-previous',
			transitioning: 'data-transitioning'
		}
	},
	menubar: {
		MenubarDataAttributes: {
			hasSubmenuOpen: 'data-has-submenu-open',
			modal: 'data-modal',
			orientation: 'data-orientation'
		}
	},
	'navigation-menu': {
		NavigationMenuContentDataAttributes: {
			activationDirection: 'data-activation-direction',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		NavigationMenuTriggerDataAttributes: {
			disabled: 'data-disabled',
			popupOpen: 'data-popup-open',
			pressed: 'data-pressed'
		},
		NavigationMenuPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			positionerHeight: '--positioner-height',
			positionerWidth: '--positioner-width',
			transformOrigin: '--transform-origin'
		},
		NavigationMenuPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			instant: 'data-instant',
			open: 'data-open',
			side: 'data-side'
		},
		NavigationMenuBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		NavigationMenuPopupCssVariables: {
			popupHeight: '--popup-height',
			popupWidth: '--popup-width'
		},
		NavigationMenuPopupDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		NavigationMenuArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		NavigationMenuLinkDataAttributes: {
			active: 'data-active'
		},
		NavigationMenuIconDataAttributes: {
			popupOpen: 'data-popup-open'
		}
	},
	'number-field': {
		NumberFieldRootDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		NumberFieldGroupDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		NumberFieldIncrementDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		NumberFieldDecrementDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		NumberFieldInputDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		NumberFieldScrubAreaDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		NumberFieldScrubAreaCursorDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			scrubbing: 'data-scrubbing',
			touched: 'data-touched',
			valid: 'data-valid'
		}
	},
	'otp-field': {
		OTPFieldRootDataAttributes: {
			complete: 'data-complete',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		OTPFieldInputDataAttributes: {
			complete: 'data-complete',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		OTPFieldSeparatorDataAttributes: {
			orientation: 'data-orientation'
		}
	},
	popover: {
		PopoverTriggerDataAttributes: {
			disabled: 'data-disabled',
			popupOpen: 'data-popup-open',
			pressed: 'data-pressed'
		},
		PopoverPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			positionerHeight: '--positioner-height',
			positionerWidth: '--positioner-width',
			transformOrigin: '--transform-origin'
		},
		PopoverPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side'
		},
		PopoverPopupCssVariables: {
			popupHeight: '--popup-height',
			popupWidth: '--popup-width'
		},
		PopoverPopupDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			instant: 'data-instant',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		PopoverArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		PopoverBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		PopoverViewportCssVariables: {
			popupHeight: '--popup-height',
			popupWidth: '--popup-width'
		},
		PopoverViewportDataAttributes: {
			activationDirection: 'data-activation-direction',
			current: 'data-current',
			instant: 'data-instant',
			previous: 'data-previous',
			transitioning: 'data-transitioning'
		}
	},
	'preview-card': {
		PreviewCardTriggerDataAttributes: {
			popupOpen: 'data-popup-open'
		},
		PreviewCardPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			positionerHeight: '--positioner-height',
			positionerWidth: '--positioner-width',
			transformOrigin: '--transform-origin'
		},
		PreviewCardPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side'
		},
		PreviewCardPopupDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		PreviewCardArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		PreviewCardBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		PreviewCardViewportCssVariables: {
			popupHeight: '--popup-height',
			popupWidth: '--popup-width'
		},
		PreviewCardViewportDataAttributes: {
			activationDirection: 'data-activation-direction',
			current: 'data-current',
			instant: 'data-instant',
			previous: 'data-previous',
			transitioning: 'data-transitioning'
		}
	},
	progress: {
		ProgressRootDataAttributes: {
			complete: 'data-complete',
			indeterminate: 'data-indeterminate',
			progressing: 'data-progressing'
		},
		ProgressTrackDataAttributes: {
			complete: 'data-complete',
			indeterminate: 'data-indeterminate',
			progressing: 'data-progressing'
		},
		ProgressIndicatorDataAttributes: {
			complete: 'data-complete',
			indeterminate: 'data-indeterminate',
			progressing: 'data-progressing'
		},
		ProgressValueDataAttributes: {
			complete: 'data-complete',
			indeterminate: 'data-indeterminate',
			progressing: 'data-progressing'
		},
		ProgressLabelDataAttributes: {
			complete: 'data-complete',
			indeterminate: 'data-indeterminate',
			progressing: 'data-progressing'
		}
	},
	radio: {
		RadioRootDataAttributes: {
			checked: 'data-checked',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			unchecked: 'data-unchecked',
			valid: 'data-valid'
		},
		RadioIndicatorDataAttributes: {
			checked: 'data-checked',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			endingStyle: 'data-ending-style',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			startingStyle: 'data-starting-style',
			touched: 'data-touched',
			unchecked: 'data-unchecked',
			valid: 'data-valid'
		}
	},
	'radio-group': {
		RadioGroupDataAttributes: {
			disabled: 'data-disabled'
		}
	},
	'scroll-area': {
		ScrollAreaRootCssVariables: {
			scrollAreaCornerHeight: '--scroll-area-corner-height',
			scrollAreaCornerWidth: '--scroll-area-corner-width'
		},
		ScrollAreaRootDataAttributes: {
			hasOverflowX: 'data-has-overflow-x',
			hasOverflowY: 'data-has-overflow-y',
			overflowXEnd: 'data-overflow-x-end',
			overflowXStart: 'data-overflow-x-start',
			overflowYEnd: 'data-overflow-y-end',
			overflowYStart: 'data-overflow-y-start',
			scrolling: 'data-scrolling'
		},
		ScrollAreaViewportCssVariables: {
			scrollAreaOverflowXEnd: '--scroll-area-overflow-x-end',
			scrollAreaOverflowXStart: '--scroll-area-overflow-x-start',
			scrollAreaOverflowYEnd: '--scroll-area-overflow-y-end',
			scrollAreaOverflowYStart: '--scroll-area-overflow-y-start'
		},
		ScrollAreaViewportDataAttributes: {
			hasOverflowX: 'data-has-overflow-x',
			hasOverflowY: 'data-has-overflow-y',
			overflowXEnd: 'data-overflow-x-end',
			overflowXStart: 'data-overflow-x-start',
			overflowYEnd: 'data-overflow-y-end',
			overflowYStart: 'data-overflow-y-start',
			scrolling: 'data-scrolling'
		},
		ScrollAreaScrollbarCssVariables: {
			scrollAreaThumbHeight: '--scroll-area-thumb-height',
			scrollAreaThumbWidth: '--scroll-area-thumb-width'
		},
		ScrollAreaScrollbarDataAttributes: {
			hasOverflowX: 'data-has-overflow-x',
			hasOverflowY: 'data-has-overflow-y',
			hovering: 'data-hovering',
			orientation: 'data-orientation',
			overflowXEnd: 'data-overflow-x-end',
			overflowXStart: 'data-overflow-x-start',
			overflowYEnd: 'data-overflow-y-end',
			overflowYStart: 'data-overflow-y-start',
			scrolling: 'data-scrolling'
		},
		ScrollAreaContentDataAttributes: {
			hasOverflowX: 'data-has-overflow-x',
			hasOverflowY: 'data-has-overflow-y',
			overflowXEnd: 'data-overflow-x-end',
			overflowXStart: 'data-overflow-x-start',
			overflowYEnd: 'data-overflow-y-end',
			overflowYStart: 'data-overflow-y-start',
			scrolling: 'data-scrolling'
		},
		ScrollAreaThumbDataAttributes: {
			orientation: 'data-orientation',
			scrolling: 'data-scrolling'
		}
	},
	select: {
		SelectTriggerDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			placeholder: 'data-placeholder',
			popupOpen: 'data-popup-open',
			popupSide: 'data-popup-side',
			pressed: 'data-pressed',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		SelectValueDataAttributes: {
			placeholder: 'data-placeholder'
		},
		SelectIconDataAttributes: {
			popupOpen: 'data-popup-open'
		},
		SelectBackdropDataAttributes: {
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			startingStyle: 'data-starting-style'
		},
		SelectPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			transformOrigin: '--transform-origin'
		},
		SelectPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side'
		},
		SelectPopupDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		SelectItemDataAttributes: {
			disabled: 'data-disabled',
			highlighted: 'data-highlighted',
			selected: 'data-selected'
		},
		SelectItemIndicatorDataAttributes: {
			endingStyle: 'data-ending-style',
			startingStyle: 'data-starting-style'
		},
		SelectArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		SelectScrollDownArrowDataAttributes: {
			direction: 'data-direction',
			endingStyle: 'data-ending-style',
			side: 'data-side',
			startingStyle: 'data-starting-style',
			visible: 'data-visible'
		},
		SelectScrollUpArrowDataAttributes: {
			direction: 'data-direction',
			endingStyle: 'data-ending-style',
			side: 'data-side',
			startingStyle: 'data-starting-style',
			visible: 'data-visible'
		},
		SelectSeparatorDataAttributes: {
			orientation: 'data-orientation'
		}
	},
	separator: {
		SeparatorDataAttributes: {
			orientation: 'data-orientation'
		}
	},
	slider: {
		SliderRootDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			dragging: 'data-dragging',
			focused: 'data-focused',
			invalid: 'data-invalid',
			orientation: 'data-orientation',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		SliderValueDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			dragging: 'data-dragging',
			focused: 'data-focused',
			invalid: 'data-invalid',
			orientation: 'data-orientation',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		SliderControlDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			dragging: 'data-dragging',
			focused: 'data-focused',
			invalid: 'data-invalid',
			orientation: 'data-orientation',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		SliderTrackDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			dragging: 'data-dragging',
			focused: 'data-focused',
			invalid: 'data-invalid',
			orientation: 'data-orientation',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		SliderThumbDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			dragging: 'data-dragging',
			focused: 'data-focused',
			index: 'data-index',
			invalid: 'data-invalid',
			orientation: 'data-orientation',
			touched: 'data-touched',
			valid: 'data-valid'
		},
		SliderIndicatorDataAttributes: {
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			dragging: 'data-dragging',
			focused: 'data-focused',
			invalid: 'data-invalid',
			orientation: 'data-orientation',
			touched: 'data-touched',
			valid: 'data-valid'
		}
	},
	switch: {
		SwitchRootDataAttributes: {
			checked: 'data-checked',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			unchecked: 'data-unchecked',
			valid: 'data-valid'
		},
		SwitchThumbDataAttributes: {
			checked: 'data-checked',
			dirty: 'data-dirty',
			disabled: 'data-disabled',
			filled: 'data-filled',
			focused: 'data-focused',
			invalid: 'data-invalid',
			readonly: 'data-readonly',
			required: 'data-required',
			touched: 'data-touched',
			unchecked: 'data-unchecked',
			valid: 'data-valid'
		}
	},
	tabs: {
		TabsRootDataAttributes: {
			activationDirection: 'data-activation-direction',
			orientation: 'data-orientation'
		},
		TabsTabDataAttributes: {
			activationDirection: 'data-activation-direction',
			active: 'data-active',
			disabled: 'data-disabled',
			orientation: 'data-orientation'
		},
		TabsIndicatorCssVariables: {
			activeTabBottom: '--active-tab-bottom',
			activeTabHeight: '--active-tab-height',
			activeTabLeft: '--active-tab-left',
			activeTabRight: '--active-tab-right',
			activeTabTop: '--active-tab-top',
			activeTabWidth: '--active-tab-width'
		},
		TabsIndicatorDataAttributes: {
			activationDirection: 'data-activation-direction',
			orientation: 'data-orientation'
		},
		TabsPanelDataAttributes: {
			activationDirection: 'data-activation-direction',
			endingStyle: 'data-ending-style',
			hidden: 'data-hidden',
			index: 'data-index',
			orientation: 'data-orientation',
			startingStyle: 'data-starting-style'
		},
		TabsListDataAttributes: {
			activationDirection: 'data-activation-direction',
			orientation: 'data-orientation'
		}
	},
	toast: {
		ToastViewportCssVariables: {
			frontmostHeight: '--toast-frontmost-height'
		},
		ToastViewportDataAttributes: {
			expanded: 'data-expanded'
		},
		ToastRootCssVariables: {
			height: '--toast-height',
			index: '--toast-index',
			offsetY: '--toast-offset-y',
			swipeMovementX: '--toast-swipe-movement-x',
			swipeMovementY: '--toast-swipe-movement-y'
		},
		ToastRootDataAttributes: {
			endingStyle: 'data-ending-style',
			expanded: 'data-expanded',
			limited: 'data-limited',
			startingStyle: 'data-starting-style',
			swipeDirection: 'data-swipe-direction',
			swiping: 'data-swiping',
			type: 'data-type'
		},
		ToastContentDataAttributes: {
			behind: 'data-behind',
			expanded: 'data-expanded'
		},
		ToastDescriptionDataAttributes: {
			type: 'data-type'
		},
		ToastTitleDataAttributes: {
			type: 'data-type'
		},
		ToastCloseDataAttributes: {
			type: 'data-type'
		},
		ToastActionDataAttributes: {
			type: 'data-type'
		},
		ToastPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			transformOrigin: '--transform-origin'
		},
		ToastPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			side: 'data-side'
		},
		ToastArrowDataAttributes: {
			align: 'data-align',
			side: 'data-side',
			uncentered: 'data-uncentered'
		}
	},
	toggle: {
		ToggleDataAttributes: {
			disabled: 'data-disabled',
			pressed: 'data-pressed'
		}
	},
	'toggle-group': {
		ToggleGroupDataAttributes: {
			disabled: 'data-disabled',
			multiple: 'data-multiple',
			orientation: 'data-orientation'
		}
	},
	toolbar: {
		ToolbarSeparatorDataAttributes: {
			orientation: 'data-orientation'
		},
		ToolbarRootDataAttributes: {
			disabled: 'data-disabled',
			orientation: 'data-orientation'
		},
		ToolbarGroupDataAttributes: {
			disabled: 'data-disabled',
			orientation: 'data-orientation'
		},
		ToolbarButtonDataAttributes: {
			disabled: 'data-disabled',
			focusable: 'data-focusable',
			orientation: 'data-orientation'
		},
		ToolbarLinkDataAttributes: {
			orientation: 'data-orientation'
		},
		ToolbarInputDataAttributes: {
			disabled: 'data-disabled',
			focusable: 'data-focusable',
			orientation: 'data-orientation'
		}
	},
	tooltip: {
		TooltipTriggerDataAttributes: {
			popupOpen: 'data-popup-open',
			triggerDisabled: 'data-trigger-disabled'
		},
		TooltipPositionerCssVariables: {
			anchorHeight: '--anchor-height',
			anchorWidth: '--anchor-width',
			availableHeight: '--available-height',
			availableWidth: '--available-width',
			positionerHeight: '--positioner-height',
			positionerWidth: '--positioner-width',
			transformOrigin: '--transform-origin'
		},
		TooltipPositionerDataAttributes: {
			align: 'data-align',
			anchorHidden: 'data-anchor-hidden',
			closed: 'data-closed',
			open: 'data-open',
			side: 'data-side'
		},
		TooltipPopupDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			endingStyle: 'data-ending-style',
			instant: 'data-instant',
			open: 'data-open',
			side: 'data-side',
			startingStyle: 'data-starting-style'
		},
		TooltipArrowDataAttributes: {
			align: 'data-align',
			closed: 'data-closed',
			instant: 'data-instant',
			open: 'data-open',
			side: 'data-side',
			uncentered: 'data-uncentered'
		},
		TooltipViewportCssVariables: {
			popupHeight: '--popup-height',
			popupWidth: '--popup-width'
		},
		TooltipViewportDataAttributes: {
			activationDirection: 'data-activation-direction',
			current: 'data-current',
			instant: 'data-instant',
			previous: 'data-previous',
			transitioning: 'data-transitioning'
		}
	}
};

const entries = import.meta.glob<Record<string, unknown>>('./*/index.ts', { eager: true });

describe('data-attribute and CSS-variable namespaces', () => {
	for (const [component, namespaces] of Object.entries(upstream)) {
		const entry = entries[`./${component}/index.ts`];
		for (const [name, values] of Object.entries(namespaces)) {
			it(`@sveltery/base/${component} exports ${name} with upstream values`, () => {
				expect({ ...(entry[name] as object) }).toEqual(values);
			});
			it(`@sveltery/base exports ${name}`, () => {
				expect(entry[name]).toBeDefined();
				expect((barrel as Record<string, unknown>)[name]).toBe(entry[name]);
			});
		}
	}
});
