import { CSPProvider } from '@sveltery/base/csp-provider';
import { createTypes } from '#lib/docs/create-types.ts';

export const TypesCSPProvider = createTypes(import.meta.url, CSPProvider);
