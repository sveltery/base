#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/toolchain.sh
menu_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-menu-consumer.XXXXXX")"
trap 'rm -rf "$menu_consumer"' EXIT
pnpm --filter @sveltery/base pack --pack-destination "$menu_consumer" > /dev/null
node --input-type=module - "$menu_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
pnpm --dir "$menu_consumer" --ignore-workspace install --ignore-scripts > /dev/null
pnpm --dir "$menu_consumer" --ignore-workspace install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$menu_consumer/node_modules/@sveltery/base/LICENSE"
test -f "$menu_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$menu_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Menu, ContextMenu, Menubar } from '@sveltery/base';
  import { Menu as SubMenu } from '@sveltery/base/menu';
  import { ContextMenu as SubContext } from '@sveltery/base/context-menu';
  import { Menubar as SubMenubar } from '@sveltery/base/menubar';
  import type { HTMLAttributes } from 'svelte/elements';
  import type { MenuRootProps, MenuTriggerProps, MenuPositionerProps, MenuCheckboxItemProps, MenuRadioGroupProps, ContextMenuRootProps, MenubarProps } from '@sveltery/base';
  type Payload = { value: number };
  const handle = Menu.createHandle<Payload>();
  let ref = $state<HTMLElement | null | undefined>();
  let actions = $state<Menu.Root.Actions | null>(null);
  const root: MenuRootProps<Payload> = { handle, modal: false, open: undefined, onOpenChange(value, details) { const open: boolean = value; const native: Event = details.event; details.cancel(); details.preventUnmountOnClose(); void [open, native]; } };
  const trigger: MenuTriggerProps<Payload> = { handle, payload: { value: 7 }, disabled: undefined, nativeButton: undefined, class: state => ['trigger', { open: state.open }], style: state => ({ opacity: state.disabled ? 0.5 : 1 }) };
  const positioner: MenuPositionerProps = { side: 'inline-end', sideOffset: data => data.anchor.height + data.positioner.width, alignOffset: undefined, collisionBoundary: undefined };
  const checkbox: MenuCheckboxItemProps = { checked: undefined, defaultChecked: undefined, onCheckedChange: undefined, closeOnClick: undefined };
  const radios: MenuRadioGroupProps = { value: undefined, defaultValue: undefined, onValueChange: undefined };
  const context: ContextMenuRootProps = { open: undefined, actions: undefined, children: undefined };
  const bar: MenubarProps = { orientation: undefined, loopFocus: undefined, disabled: undefined, modal: undefined };
</script>
<Menu.Trigger {...trigger} id="packed-trigger" bind:ref>
  {#snippet render(props, state, children)}<button {...props as HTMLAttributes<HTMLButtonElement>} data-custom={state.open}>{@render children?.()}</button>{/snippet}
</Menu.Trigger>
<Menu.Root {...root} bind:actions>
  {#snippet children({ payload })}
    {const value: number | undefined = payload?.value}
    <Menu.Portal keepMounted><Menu.Backdrop /><Menu.Positioner {...positioner}><Menu.Popup finalFocus={false}><Menu.Arrow />
      <Menu.Viewport><Menu.Group><Menu.GroupLabel>Packed group</Menu.GroupLabel><Menu.Item label="Alpha">Alpha {value}</Menu.Item><Menu.LinkItem href="#target">Link</Menu.LinkItem><Menu.CheckboxItem {...checkbox}>Check<Menu.CheckboxItemIndicator keepMounted>Yes</Menu.CheckboxItemIndicator></Menu.CheckboxItem><Menu.RadioGroup {...radios}><Menu.RadioItem value="one">One<Menu.RadioItemIndicator keepMounted>Yes</Menu.RadioItemIndicator></Menu.RadioItem></Menu.RadioGroup><Menu.Separator /><Menu.SubmenuRoot><Menu.SubmenuTrigger>Sub</Menu.SubmenuTrigger><Menu.Portal keepMounted><Menu.Positioner><Menu.Popup><Menu.Item>Nested</Menu.Item></Menu.Popup></Menu.Positioner></Menu.Portal></Menu.SubmenuRoot></Menu.Group></Menu.Viewport>
    </Menu.Popup></Menu.Positioner></Menu.Portal>
  {/snippet}
</Menu.Root>
<SubMenu.Root><SubMenu.Trigger>Subpath</SubMenu.Trigger></SubMenu.Root>
<ContextMenu.Root {...context}><ContextMenu.Trigger>Context</ContextMenu.Trigger><ContextMenu.Portal keepMounted><ContextMenu.Positioner><ContextMenu.Popup><ContextMenu.Item>Item</ContextMenu.Item></ContextMenu.Popup></ContextMenu.Positioner></ContextMenu.Portal></ContextMenu.Root>
<SubContext.Root><SubContext.Trigger>Subcontext</SubContext.Trigger></SubContext.Root>
<Menubar {...bar}><Menu.Root><Menu.Trigger>File</Menu.Trigger></Menu.Root></Menubar>
<SubMenubar orientation="vertical"><Menu.Root><Menu.Trigger>Edit</Menu.Trigger></Menu.Root></SubMenubar>
SVELTE
cat > "$menu_consumer/Types.ts" <<'TS'
import { Menu, ContextMenu, Menubar } from '@sveltery/base';
import type * as Root from '@sveltery/base';
import type * as Sub from '@sveltery/base/menu';
import type * as Context from '@sveltery/base/context-menu';
import type * as Bar from '@sveltery/base/menubar';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const types: [Equal<Root.MenuRootProps<number>, Sub.Root.Props<number>>, Equal<Root.MenuTriggerProps<number>, Sub.Trigger.Props<number>>, Equal<Root.ContextMenuRootProps, Context.Root.Props>, Equal<Root.ContextMenuPositionerProps, Context.Positioner.Props>, Equal<Root.MenubarProps, Bar.Menubar.Props>] = [true, true, true, true, true];
void [Menu, ContextMenu, Menubar, types];
TS
cat > "$menu_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Menu, ContextMenu, Menubar } from '@sveltery/base';
import { Menu as SubMenu } from '@sveltery/base/menu';
import { ContextMenu as SubContext } from '@sveltery/base/context-menu';
import { Menubar as SubMenubar } from '@sveltery/base/menubar';
import Consumer from './Consumer.svelte';
const menuParts = ['Root', 'Trigger', 'Portal', 'Backdrop', 'Positioner', 'Popup', 'Arrow', 'Group', 'GroupLabel', 'Item', 'LinkItem', 'CheckboxItem', 'CheckboxItemIndicator', 'RadioGroup', 'RadioItem', 'RadioItemIndicator', 'SubmenuRoot', 'SubmenuTrigger', 'Separator', 'Viewport', 'Handle', 'createHandle'];
for (const part of menuParts) assert.equal(Menu[part], SubMenu[part], part);
for (const part of menuParts.filter(part => !['Viewport', 'Handle', 'createHandle'].includes(part))) assert.equal(ContextMenu[part], SubContext[part], part);
for (const part of ['Portal', 'Backdrop', 'Popup', 'Arrow', 'Group', 'GroupLabel', 'Item', 'LinkItem', 'CheckboxItem', 'CheckboxItemIndicator', 'RadioGroup', 'RadioItem', 'RadioItemIndicator', 'SubmenuRoot', 'SubmenuTrigger', 'Separator']) assert.equal(ContextMenu[part], Menu[part], part);
assert.equal(Menubar, SubMenubar);
const body = render(Consumer).body;
assert.match(body, /data-custom="false"/); assert.match(body, /aria-haspopup="menu"/); assert.match(body, /role="menubar"/); assert.match(body, /aria-orientation="vertical"/); assert.match(body, /Context/); assert.match(body, /Subpath/);
console.log('Installed Menu family complete root/subpath identity and native SSR composition: PASS');
JS
cat > "$menu_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":false,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$menu_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$menu_consumer" --tsconfig ./tsconfig.json
cat > "$menu_consumer/Negative.svelte" <<'SVELTE'
<script lang="ts">
  import { Menu, ContextMenu, Menubar } from '@sveltery/base';
  const handle = Menu.createHandle<{ value: number }>();
</script>
<Menu.Trigger {handle} payload={{ value: 'wrong' }} />
<Menu.Root open="true" />
<Menu.Item disabled={null} />
<Menu.CheckboxItem checked="true" />
<Menu.Popup finalFocus="first" />
<Menu.Positioner side="diagonal" />
<Menu.SubmenuTrigger delay="fast" />
<ContextMenu.Root {handle} />
<Menubar orientation="both" />
SVELTE
set +e
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$menu_consumer" --tsconfig ./tsconfig.json --output machine > "$menu_consumer/negative.log"
menu_negative_status=$?
set -e
if [[ "$menu_negative_status" != 1 ]]; then cat "$menu_consumer/negative.log"; exit 1; fi
node --input-type=module - "$menu_consumer/negative.log" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const output = readFileSync(process.argv[2], 'utf8');
const errors = output.split('\n').filter(line => /\bERROR\b/.test(line));
assert.equal(errors.length, 9, output);
assert(errors.every(line => line.includes('Negative.svelte')), output);
console.log('Isolated strict installed Menu family generic/ref/render/actions/optional positives and nine negative diagnostics: PASS');
JS
