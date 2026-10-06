<script lang="ts">
  // Pinned OTP Field assertion fixture; native boundary witnesses are separate (MIT).
  import { onMount, untrack } from 'svelte';
  import Fixture from '../../../../packages/base/tests/dom/OTPFieldFixture.svelte';
  import type { OTPFieldRootProps, OTPFieldInputProps } from '@sveltery/base/otp-field';
  let { scenario: scenarioProp = 'default' }: { scenario?: string } = $props();
  const scenario = untrack(() => scenarioProp);
  let fixture: ReturnType<typeof Fixture>;
  let hydrated = $state(false);
  let calls = $state<unknown[]>([]);
  let submissions = $state<unknown[]>([]);
  let validations = $state<unknown[]>([]);
  const initial =
    scenario === 'normalize-complete'
      ? 'ABCDEF'
      : scenario.includes('complete')
        ? '123456'
        : scenario.includes('empty') ||
            scenario.startsWith('controlled') ||
            scenario === 'auto-submit' ||
            scenario === 'external-form' ||
            scenario === 'unicode'
          ? ''
          : scenario === 'alpha'
            ? 'ab'
            : scenario === 'alphanumeric'
              ? 'A1'
              : '12';
  const rootProps: Partial<OTPFieldRootProps> = {
    ...(scenario === 'alpha' ? { validationType: 'alpha' } : {}),
    ...(scenario === 'alphanumeric' ? { validationType: 'alphanumeric' } : {}),
    ...(scenario === 'none' || scenario === 'onblur' || scenario === 'unicode'
      ? { validationType: 'none' }
      : {}),
    ...(scenario.startsWith('normalize')
      ? {
          validationType: 'alphanumeric',
          normalizeValue: (value) => value.toUpperCase(),
        }
      : {}),
    ...(scenario === 'restricted'
      ? { normalizeValue: (value) => value.replace(/[^0-3]/g, '') }
      : {}),
    disabled: scenario === 'disabled',
    readOnly: scenario === 'readonly',
    mask: scenario === 'mask',
    required: scenario === 'required',
    autoSubmit: scenario === 'auto-submit' || scenario.startsWith('external-form'),
    ...(scenario.startsWith('external-form') ? { form: 'external-form' } : {}),
    ...(scenario === 'native-label' ? { id: 'code' } : {}),
    ...(scenario === 'aria-group' ? { 'aria-labelledby': 'external-label' } : {}),
  };
  const slotProps: OTPFieldInputProps = {
    ...(scenario === 'aria-slot' ? { 'aria-label': 'Slot code' } : {}),
    ...(scenario === 'focus-default' ? { onfocus: (event) => event.preventDefault() } : {}),
    ...(scenario === 'focus-base' ? { onfocus: (event) => event.preventBaseUIHandler() } : {}),
    ...(scenario === 'blur-default' ? { onblur: (event) => event.preventDefault() } : {}),
    ...(scenario === 'blur-base' ? { onblur: (event) => event.preventBaseUIHandler() } : {}),
    ...(scenario === 'mousedown-default' ? { onmousedown: (event) => event.preventDefault() } : {}),
    ...(scenario === 'input-base' ? { oninput: (event) => event.preventBaseUIHandler() } : {}),
  };
  const withField =
    scenario !== 'native-label' &&
    scenario !== 'standalone' &&
    !scenario.startsWith('focus-') &&
    !scenario.startsWith('blur-');
  onMount(() => {
    hydrated = true;
  });
  function record(phase: string, value: string, reason: string, event: Event) {
    calls.push({ phase, value, reason, type: event.type, trusted: event.isTrusted });
  }
</script>

<main data-hydrated={hydrated} data-renderer="svelte">
  <span id="external-label">External group label</span>
  {#if scenario === 'native-label'}<label for="code">Native code</label>{/if}
  <Fixture
    bind:this={fixture}
    length={scenario === 'unicode' ? 2 : 6}
    {rootProps}
    {slotProps}
    {initial}
    {withField}
    controlled={scenario.startsWith('controlled')}
    accept={!scenario.includes('reject')}
    deferred={scenario.includes('deferred')}
    cancel={scenario === 'cancel'}
    rtl={scenario === 'rtl'}
    grouped={scenario === 'grouped'}
    customRender={scenario === 'render'}
    fieldProps={{
      validationMode: scenario === 'onblur' ? 'onBlur' : 'onSubmit',
      validate:
        scenario === 'onblur'
          ? (value) => {
              validations.push(value);
              return `Error: ${String(value)}`;
            }
          : undefined,
    }}
    onChange={(value, details) => record('change', value, details.reason, details.event)}
    onInvalid={(value, details) => record('invalid', value, details.reason, details.event)}
    onComplete={(value, details) => record('complete', value, details.reason, details.event)}
    onSubmit={(value) => submissions.push(value)}
  />
  <button id="accept" onclick={() => fixture.acceptPending()}>Accept pending</button>
  <button id="owner" onclick={() => fixture.setValue('654321')}>Owner update</button>
  <button id="reorder" onclick={() => fixture.reorder([5, 4, 3, 2, 1, 0])}>Reverse</button>
  <button id="remove" onclick={() => fixture.remove()}>Remove</button>
  <form
    id="external-form"
    onsubmit={(event) => {
      event.preventDefault();
      submissions.push(Object.fromEntries(new FormData(event.currentTarget)));
    }}><button>External submit</button></form
  >
  <output id="calls">{JSON.stringify(calls)}</output>
  <output id="submissions">{JSON.stringify(submissions)}</output>
  <output id="validations">{JSON.stringify(validations)}</output>
</main>
