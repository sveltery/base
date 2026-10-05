// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c.
// MIT: THIRD_PARTY_NOTICES.md.
import type { StateAttributesMapping } from '../internals/getStateAttributesProps.js';
import * as CollapsiblePanelDataAttributes from '../collapsible/panel/CollapsiblePanelDataAttributes.js';
import * as CollapsibleTriggerDataAttributes from '../collapsible/trigger/CollapsibleTriggerDataAttributes.js';

const PANEL_OPEN_HOOK = {
  [CollapsiblePanelDataAttributes.open]: '',
};

const PANEL_CLOSED_HOOK = {
  [CollapsiblePanelDataAttributes.closed]: '',
};

export const triggerOpenStateMapping: StateAttributesMapping<{
  open: boolean;
}> = {
  open(value) {
    if (value) {
      return {
        [CollapsibleTriggerDataAttributes.panelOpen]: '',
      };
    }
    return null;
  },
};

export const collapsibleOpenStateMapping = {
  open(value) {
    if (value) {
      return PANEL_OPEN_HOOK;
    }
    return PANEL_CLOSED_HOOK;
  },
} satisfies StateAttributesMapping<{
  open: boolean;
}>;
