import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { render } from 'svelte/server';
import { Radio, RadioGroup, ToggleGroup, Toolbar, Menu, Menubar } from '@sveltery/base';
import { Radio as SubRadio } from '@sveltery/base/radio';
import { RadioGroup as SubRadioGroup } from '@sveltery/base/radio-group';
import { ToggleGroup as SubToggleGroup } from '@sveltery/base/toggle-group';
import { Toolbar as SubToolbar } from '@sveltery/base/toolbar';
import { Menu as SubMenu } from '@sveltery/base/menu';
import { Menubar as SubMenubar } from '@sveltery/base/menubar';
import Consumer from './Consumer.svelte';
assert.equal(typeof document, 'undefined');
for (const [root, subpath] of [
  [Radio, SubRadio],
  [RadioGroup, SubRadioGroup],
  [ToggleGroup, SubToggleGroup],
  [Toolbar, SubToolbar],
  [Menu, SubMenu],
  [Menubar, SubMenubar],
])
  assert.equal(root, subpath);
const { body } = render(Consumer);
assert.equal((body.match(/role="radio"/g) ?? []).length, 3);
assert.equal((body.match(/aria-pressed=/g) ?? []).length, 3);
assert.match(body, /role="toolbar"/);
assert.match(body, /role="menubar"/);
assert.match(body, /id="radio-a"/);
assert.match(body, /aria-checked="true"/);
assert.match(body, /id="menu-file"/);
writeFileSync(new URL('./ssr.html', import.meta.url), body);
console.log('Packed root/subpath Composite caller identity and no-browser SSR: PASS');
