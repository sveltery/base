export const cases = ['steps', 'shortcuts', 'optional', 'multiple', 'prevented'] as const;
export type QuestionnaireCase = (typeof cases)[number];
