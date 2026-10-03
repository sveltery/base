// Paired Base UI 1.8.0 navigation scenarios. MIT: parity/toggle-toolbar/UPSTREAM_LICENSE.
export function navigationCase(scenario: string) {
  return {
    toolbar: scenario.startsWith('toolbar-'),
    input: scenario.startsWith('toolbar-input'),
    wrapped: scenario === 'toolbar-wrapped-toggles' || scenario === 'toolbar-wrapped-disabled',
    grouped: scenario.startsWith('group-') || scenario.includes('toggles') || scenario.includes('wrapped'),
    controlled: scenario.includes('controlled'),
    accept: scenario.includes('accept'),
    defaultValue: scenario.includes('default') ? ['two'] : scenario.includes('multiple') ? ['one'] : undefined,
    multiple: scenario.includes('multiple'),
    missingValues: scenario.includes('omitted') || scenario.includes('warning'),
    initialized: scenario.includes('warning'),
    rootDisabled: scenario === 'toolbar-disabled',
    groupDisabled: scenario === 'toolbar-group-disabled' || scenario === 'toolbar-toggles-group-disabled',
    groupRootDisabled: scenario === 'group-disabled',
    nestedGroups: scenario === 'toolbar-nested-groups',
    disabled: scenario.includes('disabled') || scenario === 'toolbar-metadata',
    nonFocusable: scenario === 'toolbar-metadata' || scenario === 'toolbar-input-skip',
    custom: scenario === 'toolbar-custom',
    checkbox: scenario === 'toolbar-input-checkbox',
    loopFocus: !scenario.endsWith('loop-off'),
    ownCancel: scenario === 'group-cancel-own',
    groupCancel: scenario === 'group-cancel-group',
    consumerPrevent: scenario === 'group-prevent-handler',
    consumerDefault: scenario === 'group-prevent-default',
    separatorOverride: scenario === 'toolbar-separator-override',
    inputDisabled: scenario === 'toolbar-input-disabled' || scenario === 'toolbar-input-skip' || scenario === 'toolbar-input-checkbox',
  };
}
export interface NavigationCall { part: string; value: boolean | string[]; same: boolean; reason: string; type: string; canceled: boolean; defaultPrevented: boolean; before: string | null }
