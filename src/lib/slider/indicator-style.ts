// Derived from getIndicatorStyles in Base UI v1.8.0
// packages/react/src/slider/indicator/SliderIndicator.tsx
// (commit 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c). MIT, see THIRD_PARTY_NOTICES.md.

export function getIndicatorStyles(
	vertical: boolean,
	range: boolean,
	inset: boolean,
	start: number | undefined,
	end: number | undefined,
	forceHidden: boolean
): Record<string, string | number | undefined> {
	const styles: Record<string, string | number | undefined> = {
		visibility:
			forceHidden || (inset && (start === undefined || (range && end === undefined)))
				? 'hidden'
				: undefined,
		position: vertical ? 'absolute' : 'relative',
		[vertical ? 'width' : 'height']: 'inherit'
	};

	let startValue = `${start ?? 0}%`;
	let sizeValue = `${(end ?? 0) - (start ?? 0)}%`;

	if (inset) {
		styles['--start-position'] = startValue;
		startValue = 'var(--start-position)';

		if (range) {
			styles['--relative-size'] = sizeValue;
			sizeValue = 'var(--relative-size)';
		}
	}

	styles[vertical ? 'bottom' : 'insetInlineStart'] = range ? startValue : '0px';
	styles[vertical ? 'height' : 'width'] = range ? sizeValue : startValue;

	return styles;
}
