// Base UI docs/src/components/Search/searchSitemap.ts at47b40521; MIT2019 Material-UI SAS. Preserve singleton+failed-load retry.
let searchSitemapPromise: Promise<typeof import('./sitemap.js')> | undefined;
export function loadSearchSitemap() {
  searchSitemapPromise ??= import('./sitemap.js').catch(error => { searchSitemapPromise = undefined; throw error; });
  return searchSitemapPromise;
}
