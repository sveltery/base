// Fixture cases for the Autocomplete port of Base UI v1.9.0
// (commit ad7ecda5296b0295b41a51ecb01fce6204acd099). MIT, see THIRD_PARTY_NOTICES.md.
export const cases = ['plain', 'inline', 'form', 'reset', 'disabled', 'readonly'] as const;
export type AutocompleteCase = (typeof cases)[number];

export const tags = ['feature', 'fix', 'bug', 'docs', 'refactor'];
