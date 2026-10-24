import type { Layout } from '../../components/group/types.js';
import type { RegisteredPanel } from '../../components/panel/types.js';

export function validateLayoutKeys(panels: RegisteredPanel[], layout: Layout) {
	const panelIds = panels.map((panel) => panel.id);
	const layoutKeys = Object.keys(layout);

	if (panelIds.length !== layoutKeys.length) {
		return false;
	}

	for (const panelId of panelIds) {
		if (!layoutKeys.includes(panelId)) {
			return false;
		}
	}

	return true;
}
