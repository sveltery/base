// Ported from Base UI v1.8.0 at 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c. MIT: THIRD_PARTY_NOTICES.md.

const visuallyHiddenBase: Record<string, string | number> = {
  clipPath: 'inset(50%)',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  border: 0,
  padding: 0,
  // Native CSS strings require explicit units for the source's nonzero lengths.
  width: '1px',
  height: '1px',
  margin: '-1px',
};

export const visuallyHidden: Record<string, string | number> = {
  ...visuallyHiddenBase,
  position: 'fixed',
  top: 0,
  left: 0,
};

export const visuallyHiddenInput: Record<string, string | number> = {
  ...visuallyHiddenBase,
  position: 'absolute',
};
