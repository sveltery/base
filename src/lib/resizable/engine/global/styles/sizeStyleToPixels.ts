import { convertEmToPixels } from './convertEmToPixels.js';
import { convertRemToPixels } from './convertRemToPixels.js';
import { convertVhToPixels } from './convertVhToPixels.js';
import { convertVwToPixels } from './convertVwToPixels.js';
import { parseSizeAndUnit } from './parseSizeAndUnit.js';

export function sizeStyleToPixels({
	groupSize,
	panelElement,
	styleProp
}: {
	groupSize: number;
	panelElement: HTMLElement;
	styleProp: number | string;
}) {
	let pixels: number | undefined = undefined;

	const [size, unit] = parseSizeAndUnit(styleProp);

	switch (unit) {
		case '%': {
			pixels = (size / 100) * groupSize;
			break;
		}
		case 'px': {
			pixels = size;
			break;
		}
		case 'rem': {
			pixels = convertRemToPixels(panelElement, size);
			break;
		}
		case 'em': {
			pixels = convertEmToPixels(panelElement, size);
			break;
		}
		case 'vh': {
			pixels = convertVhToPixels(size);
			break;
		}
		case 'vw': {
			pixels = convertVwToPixels(size);
			break;
		}
	}

	return pixels;
}
