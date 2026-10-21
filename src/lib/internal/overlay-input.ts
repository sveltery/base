// The real input of a Checkbox, Switch or Radio covers its painted box and is invisible, so a
// click anywhere on the box reaches it and the browser draws nothing of its own.
export const overlayInputStyle =
	'position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; padding: 0; opacity: 0; cursor: inherit; appearance: none';
