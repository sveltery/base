import { docs, groups } from '../../../../../fixtures/src/lib/docs/content.js';
import dialogApi from '../../../../../fixtures/src/lib/docs/dialog-api.json' with { type: 'json' };
import accordionApi from '../../../../../../parity/accordion/api.json' with { type: 'json' };
import type { Sitemap } from './types.js';
// Native authored metadata and actual extracted declarations replace Original
// Next/MDX createSitemap/useTypes input; IDs stay canonical rather than re-slugged.
function declaredTypeNames(declarations: string) {
  return Array.from(
    declarations.matchAll(/\bexport\s+(?:interface|type)\s+(\w+)/g),
    (match) => match[1],
  );
}
const typesByPage: Record<string, string[]> = {
  'components/dialog': declaredTypeNames(dialogApi.types),
  'components/accordion': declaredTypeNames(accordionApi.types),
};
export const sitemap: Sitemap = {
  data: Object.fromEntries(
    groups.map((group) => [
      group,
      {
        title: group,
        prefix: '/docs/',
        pages: docs
          .filter((doc) => doc.group === group)
          .map((doc) => ({
            title: doc.slug ? doc.title : 'Introduction',
            slug: doc.slug,
            path: '/docs/' + (doc.slug ? doc.slug + '/' : ''),
            description: doc.description,
            types: typesByPage[doc.slug],
            sections: Object.fromEntries(
              doc.sections.map((section) => [
                section.id,
                { title: section.title },
              ]),
            ),
          })),
      },
    ]),
  ),
};
