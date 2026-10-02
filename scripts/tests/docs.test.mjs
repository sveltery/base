import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { docs, groups } from '../../apps/fixtures/src/lib/docs/content.ts';
import { checkDialogApi, extractDialogApi, extractTypeScript } from '../docs-api.mjs';
import { checkAccordionApi, extractAccordionApi } from '../../parity/accordion/docs-api.mjs';
test('docs API matches actual local types and all public parts', () => {
  checkDialogApi();
  const exports = readFileSync(
    new URL('../../packages/base/src/lib/dialog/index.ts', import.meta.url),
    'utf8',
  );
  const names = [...exports.matchAll(/export \{ default as (\w+) \}/g)]
    .map((match) => match[1])
    .sort();
  assert.deepEqual(
    extractDialogApi()
      .parts.map((part) => part.name)
      .sort(),
    names,
  );
});
test('Dialog docs extracts complete TypeScript from valid quoted Svelte generic attributes', () => {
  const body = '\n  let { value }: { value: Payload } = $props();\n';
  for (const attributes of [
    'lang="ts" generics="Payload extends Record<string, number> = Record<string, number>"',
    "generics='Payload extends Record<string, number> = Record<string, number>' lang='ts'",
  ]) {
    assert.equal(extractTypeScript(`<script ${attributes}>${body}</script><p>Example</p>`), body);
  }
  assert.equal(extractTypeScript(`<script lang="js">${body}</script>`), undefined);
});
test('docs metadata, navigation links and fragment targets are valid', () => {
  assert.equal(new Set(docs.map((doc) => doc.slug)).size, docs.length);
  for (const doc of docs) {
    assert.ok(groups.includes(doc.group));
    assert.ok(doc.title && doc.description && doc.sections.length);
    assert.equal(
      new Set(doc.sections.map((section) => section.id)).size,
      doc.sections.length,
    );
    for (const section of doc.sections)
      for (const link of section.links ?? []) {
        if (link.href.startsWith('/docs')) {
          const [path, fragment] = link.href.split('#');
          const target = docs.find(
            (item) => '/docs' + (item.slug ? '/' + item.slug : '') === path,
          );
          assert.ok(target, `Missing page: ${link.href}`);
          if (fragment)
            assert.ok(
              target.sections.some((item) => item.id === fragment),
              `Missing section: ${link.href}`,
            );
        } else assert.equal(new URL(link.href).protocol, 'https:');
      }
  }
});

test('Accordion docs API matches all five local part declarations', () => {
  checkAccordionApi();
  assert.deepEqual(extractAccordionApi().parts.map(part => part.name), ['Root', 'Item', 'Header', 'Trigger', 'Panel']);
});
