import assert from 'node:assert/strict';
import test from 'node:test';
import { remoteFieldPath, remoteFieldSegments, resolveRemoteAccessor, remoteFormErrors } from '../../packages/base/src/lib/remote-forms/runtime.ts';

test('remote names canonicalize actual numeric issue paths without changing native names', () => {
  const path = remoteFieldSegments('rows[00].children[01].title');
  assert.deepEqual(path, ['rows', 0, 'children', 1, 'title']);
  assert.equal(remoteFieldPath(path), 'rows[0].children[1].title');
  const descriptor = { name: 'rows[0].children[1].title' };
  const accessor = { value: () => 'seed', as: () => descriptor };
  const fields = { rows: [{ children: [{}, { title: accessor }] }] };
  assert.equal(resolveRemoteAccessor(fields, 'rows[00].children[01].title'), accessor);
  assert.deepEqual({ ...remoteFormErrors({ allIssues: () => [{ path, message: 'Invalid title' }] }) }, { 'rows[0].children[1].title': ['Invalid title'] });
});

test('public Kit path grammar rejects malformed and protected dynamic paths', () => {
  for (const name of ['rows[-1].title', 'rows[1e2].title', 'rows[].title', 'rows..title', '.title', 'title.', 'rows[1]title']) assert.throws(() => remoteFieldSegments(name), /invalid remote field path/);
  for (const segment of ['__proto__', 'constructor', 'prototype']) for (const name of [segment, `nested.${segment}`, `rows[0].${segment}`]) assert.throws(() => remoteFieldSegments(name), /unsupported remote field path/);
});

test('actual schema method-name fields and similar protected spellings remain resolvable', () => {
  for (const name of ['value', 'set', 'issues', 'allIssues', 'as', 'constructor_', '_prototype', '$constructor']) {
    const accessor = { value: () => name, as: () => ({ name }) };
    assert.equal(resolveRemoteAccessor({ [name]: accessor }, name), accessor);
  }
});
