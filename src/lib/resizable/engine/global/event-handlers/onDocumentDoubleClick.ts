import { read } from '../mutableState.js';
import { findMatchingHitRegions } from '../utils/findMatchingHitRegions.js';
import { getImperativePanelMethods } from '../utils/getImperativePanelMethods.js';

export function onDocumentDoubleClick(event: MouseEvent) {
	if (event.defaultPrevented) {
		return;
	}

	const { mountedGroups } = read();

	const hitRegions = findMatchingHitRegions(event, mountedGroups);
	hitRegions.forEach((current) => {
		if (current.separator) {
			const panelWithDefaultSize = current.panels.find(
				(panel) => panel.panelConstraints.defaultSize !== undefined
			);
			if (panelWithDefaultSize) {
				const defaultSize = panelWithDefaultSize.panelConstraints.defaultSize;
				const api = getImperativePanelMethods({
					groupId: current.group.id,
					panelId: panelWithDefaultSize.id
				});
				if (api && defaultSize !== undefined) {
					api.resize(defaultSize);

					event.preventDefault();
				}
			}
		}
	});
}
