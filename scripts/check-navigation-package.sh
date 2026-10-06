#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/package-artifacts.sh
navigation_consumer="$(mktemp -d "${TMPDIR:-/tmp}/sveltery-navigation-consumer.XXXXXX")"
trap 'rm -rf "$navigation_consumer"' EXIT
sveltery_pack_package @sveltery/base "$navigation_consumer" > /dev/null
node --input-type=module - "$navigation_consumer" <<'JS'
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const destination = process.argv[2];
const tarball = readdirSync(destination).find(name => name.endsWith('.tgz'));
writeFileSync(join(destination, 'package.json'), JSON.stringify({ private: true, type: 'module', dependencies: { '@sveltery/base': `file:${join(destination, tarball)}`, svelte: '5.57.1' } }));
JS
sveltery_prepare_consumer "$navigation_consumer"
pnpm --dir "$navigation_consumer" install --ignore-scripts > /dev/null
pnpm --dir "$navigation_consumer" install --frozen-lockfile --ignore-scripts > /dev/null
cmp LICENSE "$navigation_consumer/node_modules/@sveltery/base/LICENSE"
test -f "$navigation_consumer/node_modules/@sveltery/base/THIRD_PARTY_NOTICES.md"
cat > "$navigation_consumer/Consumer.svelte" <<'SVELTE'
<script lang="ts">
  import { Toggle, ToggleGroup, Toolbar } from '@sveltery/base';
  import { Toggle as SubToggle } from '@sveltery/base/toggle';
  import { ToggleGroup as SubGroup } from '@sveltery/base/toggle-group';
  import { Toolbar as SubToolbar } from '@sveltery/base/toolbar';
  import type { ToggleProps, ToggleGroupProps, ToolbarButtonProps, ToolbarInputProps, ToolbarLinkProps, ToolbarRootProps, ToolbarGroupProps, ToolbarSeparatorProps } from '@sveltery/base';
  import type { HTMLAttributes } from 'svelte/elements';
  let ref = $state<HTMLElement | null | undefined>();
  const toggle: ToggleProps<'one' | 'two'> = { value: 'one', defaultPressed: true, class: state => ['button', { pressed: state.pressed }], style: state => `opacity:${state.disabled ? 0.5 : 1}`, onPressedChange(pressed, details) { const flag: boolean = pressed; const event: Event = details.event; void [flag, event]; } };
  const group: ToggleGroupProps<'one' | 'two'> = { defaultValue: ['one'] as const, multiple: true, onValueChange(value, details) { const result: Array<'one' | 'two'> = value; void [result, details.reason]; } };
  const button: ToolbarButtonProps = { disabled: true, focusableWhenDisabled: true, nativeButton: false };
  const input: ToolbarInputProps = { defaultValue: 12, type: 'text', name: 'native', onkeydown: event => event.preventBaseUIHandler() };
  const link: ToolbarLinkProps = { href: '#target', target: '_self' };
  const optional: [ToggleProps, ToggleGroupProps, ToolbarRootProps, ToolbarGroupProps, ToolbarButtonProps, ToolbarInputProps, ToolbarLinkProps, ToolbarSeparatorProps] = [
    { value: undefined, pressed: undefined, defaultPressed: undefined, disabled: undefined, nativeButton: undefined, onPressedChange: undefined, class: undefined, style: undefined, render: undefined, ref: undefined, children: undefined },
    { value: undefined, defaultValue: undefined, multiple: undefined, onValueChange: undefined, disabled: undefined, orientation: undefined, loopFocus: undefined },
    { disabled: undefined, orientation: undefined, loopFocus: undefined }, { disabled: undefined },
    { disabled: undefined, focusableWhenDisabled: undefined, nativeButton: undefined },
    { disabled: undefined, focusableWhenDisabled: undefined, defaultValue: undefined }, { href: undefined }, { orientation: undefined },
  ];
  void optional;
</script>
<Toggle {...toggle} bind:ref form="stripped" type="submit" />
<SubToggle pressed={false} />
<ToggleGroup {...group}><Toggle value="one" /><Toggle value="two" /></ToggleGroup>
<SubGroup orientation="vertical" />
<Toolbar.Root disabled><Toolbar.Group><Toolbar.Button {...button}>
  {#snippet render(props, state, children)}<span {...props as HTMLAttributes<HTMLSpanElement>} data-disabled-state={state.disabled}>{@render children?.()}</span>{/snippet}
</Toolbar.Button><Toolbar.Input {...input} /><Toolbar.Link {...link}>
  {#snippet render(props, state, children)}
    {const href: string | null | undefined = props.href}
    <a {...props} href={href} data-direction={state.orientation}>{@render children?.()}</a>
  {/snippet}
</Toolbar.Link><Toolbar.Separator /></Toolbar.Group></Toolbar.Root>
<SubToolbar.Root><SubToolbar.Button /><SubToolbar.Input defaultValue="seed" /><SubToolbar.Separator /></SubToolbar.Root>
SVELTE
cat > "$navigation_consumer/Types.ts" <<'TS'
import type { ComponentProps } from 'svelte';
import { Toggle, ToggleGroup, Toolbar } from '@sveltery/base';
import type * as Root from '@sveltery/base';
import type * as Group from '@sveltery/base/toggle-group';
import type * as Bar from '@sveltery/base/toolbar';
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const props: [Equal<ComponentProps<typeof Toggle>, Root.ToggleProps>, Equal<ComponentProps<typeof ToggleGroup>, Root.ToggleGroupProps>, Equal<ComponentProps<typeof Toolbar.Input>, Root.ToolbarInputProps>] = [true, true, true];
const subpaths: [Equal<Root.ToggleGroupProps<'a'>, Group.ToggleGroupProps<'a'>>, Equal<Root.ToolbarRootOrientation, Bar.Orientation>, Equal<Root.ToolbarLinkProps, Bar.ToolbarLinkProps>] = [true, true, true];
void [props, subpaths];
TS
cat > "$navigation_consumer/check.mjs" <<'JS'
import assert from 'node:assert/strict';
import { render } from 'svelte/server';
import { Toggle, ToggleGroup, Toolbar } from '@sveltery/base';
import { Toggle as SubToggle } from '@sveltery/base/toggle';
import { ToggleGroup as SubGroup } from '@sveltery/base/toggle-group';
import { Toolbar as SubToolbar } from '@sveltery/base/toolbar';
import Consumer from './Consumer.svelte';
assert.equal(Toggle, SubToggle); assert.equal(ToggleGroup, SubGroup);
for (const part of ['Root', 'Group', 'Button', 'Input', 'Link', 'Separator']) assert.equal(Toolbar[part], SubToolbar[part]);
const body = render(Consumer).body;
assert.match(body, /role="toolbar"/); assert.match(body, /role="group"/); assert.match(body, /aria-pressed="true"/); assert.match(body, /data-multiple/); assert.match(body, /data-disabled/); assert.match(body, /value="seed"/); assert.match(body, /aria-orientation="vertical"/);
assert(!body.includes('form="stripped"')); assert(!body.includes('type="submit"'));
JS
cat > "$navigation_consumer/tsconfig.json" <<'JSON'
{"compilerOptions":{"target":"ES2022","module":"ESNext","moduleResolution":"Bundler","strict":true,"exactOptionalPropertyTypes":true,"skipLibCheck":true,"verbatimModuleSyntax":true,"lib":["ES2022","DOM","DOM.Iterable"]},"include":["*.svelte","*.ts"]}
JSON
node --import "$sveltery_repo_root/scripts/svelte-ssr-loader.mjs" "$navigation_consumer/check.mjs"
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$navigation_consumer" --tsconfig ./tsconfig.json
cat > "$navigation_consumer/Negative.svelte" <<'SVELTE'
<script lang="ts">
  import { Toggle, ToggleGroup, Toolbar } from '@sveltery/base';
  import type { ToggleProps, ToggleGroupProps } from '@sveltery/base';
  const badValue: ToggleProps<'one'> = { value: 'two' };
  const badGroup: ToggleGroupProps<'one'> = { value: ['two'] };
  void [badValue, badGroup];
</script>
<Toggle value={3} />
<Toggle pressed="true" />
<Toggle focusableWhenDisabled />
<ToggleGroup value={[1]} />
<ToggleGroup multiple={null} />
<Toolbar.Root orientation="both" />
<Toolbar.Button disabled={null} />
<Toolbar.Input focusableWhenDisabled="false" />
<Toolbar.Link disabled />
<Toolbar.Link>{#snippet render(props)}<a href={props.href as unknown as number}>Invalid</a>{/snippet}</Toolbar.Link>
SVELTE
set +e
node "$sveltery_repo_root/packages/base/node_modules/svelte-check/bin/svelte-check" --workspace "$navigation_consumer" --tsconfig ./tsconfig.json --output machine > "$navigation_consumer/negative.log"
navigation_negative_status=$?
set -e
if [[ "$navigation_negative_status" != 1 ]]; then cat "$navigation_consumer/negative.log"; exit 1; fi
node --input-type=module - "$navigation_consumer/negative.log" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const output = readFileSync(process.argv[2], 'utf8');
const errors = output.split('\n').filter(line => /\bERROR\b/.test(line));
assert.equal(errors.length, 12, output);
assert(errors.every(line => line.includes('Negative.svelte')), output);
console.log('Isolated strict public root/subpath navigation SSR, all six Toolbar parts, exact optional/generic/link render positives and twelve negative diagnostics: PASS');
JS
