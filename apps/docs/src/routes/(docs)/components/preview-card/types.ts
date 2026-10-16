import { PreviewCard } from '@sveltery/base/preview-card';
import { createMultipleTypes } from '#lib/docs/create-types.ts';

const { types } = createMultipleTypes(import.meta.url, PreviewCard);

export const TypesPreviewCard = types;
