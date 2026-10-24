import { cases, type QuestionnaireCase } from './cases.js';

export function load({ url }) {
	const requested = url.searchParams.get('case') ?? 'steps';
	return {
		scenario: (cases as readonly string[]).includes(requested)
			? (requested as QuestionnaireCase)
			: 'steps',
		reference: url.searchParams.has('reference')
	};
}
