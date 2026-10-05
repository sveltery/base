import { docs, groups } from '../../../../../fixtures/src/lib/docs/content.js';
// Native authored metadata replaces the Original Next/MDX createSitemap input.
export const sitemap = { data: Object.fromEntries(groups.map(group => [group, {
  title: group, prefix: '/docs/', pages: docs.filter(doc => doc.group === group).map(doc => ({
    title: doc.slug ? doc.title : 'Introduction', slug: doc.slug, path: '/docs/' + (doc.slug ? doc.slug + '/' : ''), description: doc.description,
    sections: Object.fromEntries(doc.sections.map(section => [section.id, { title: section.title }])),
  })),
}])) };
