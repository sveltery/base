import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

test('Slider records immutable original closure and exact helper assertion bodies separately from native supplements', () => {
  const graph = JSON.parse(
    readFileSync(new URL('../../parity/slider/source-graph.json', import.meta.url)),
  );
  assert.equal(graph.pin, '47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c');
  assert.equal(graph.modules.length, 164);
  for (const module of graph.modules) assert.match(module.sha256, /^[a-f0-9]{64}$/);
  const result = execFileSync(process.execPath, ['parity/slider/assertion-ports.mjs', '--check'], {
    encoding: 'utf8',
  });
  assert.match(result, /24 unchanged/);
});

test('Slider entire actual runtime and type closure hashes and source correspondence are current', () => {
  for (const script of ['local-graph.mjs', 'actual-correspondence.mjs']) {
    assert.doesNotThrow(() =>
      execFileSync(process.execPath, [`parity/slider/${script}`, '--check'], {
        encoding: 'utf8',
      }),
    );
  }
});
