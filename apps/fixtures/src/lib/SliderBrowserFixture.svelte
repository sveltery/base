<script lang="ts">
  // Actual source family fixture; native supplements preserve separate provenance. MIT.
  import { onMount, untrack } from "svelte";
  import {
    Slider,
    Field,
    Form,
    DirectionProvider,
    CSPProvider,
  } from "@sveltery/base";
  import type {
    SliderRootChangeEventDetails,
    SliderRootCommitEventDetails,
  } from "@sveltery/base";
  import type { HTMLAttributes } from "svelte/elements";
  let { scenario: supplied = "default" }: { scenario?: string } = $props();
  const scenario = untrack(() => supplied);
  const range = /range|push|swap|none|dynamic|max-stack/.test(scenario);
  const fractional = scenario.includes("fractional");
  const initial: number | readonly number[] = scenario.includes("max-stack")
    ? [100, 100]
    : range
      ? [
          20,
          scenario.includes("push") ||
          scenario.includes("swap") ||
          scenario.includes("none")
            ? 40
            : 80,
        ]
      : fractional
        ? 0.3
        : scenario.includes("bounds")
          ? 150
          : 40;
  const controlled =
    scenario.includes("controlled") || scenario.includes("dynamic");
  const accepts = !scenario.includes("reject");
  const canceled = scenario.includes("cancel");
  const vertical = scenario.includes("vertical");
  const rtl = scenario.includes("rtl");
  const min = fractional ? -1 : 0;
  const max = fractional ? 2 : 100;
  const step = fractional ? 0.1 : scenario.includes("step") ? 5 : 1;
  const largeStep = fractional ? 0.5 : 10;
  const spacing = scenario.includes("spacing") ? 5 : 0;
  const alignment = scenario.includes("edge-client")
    ? "edge-client-only"
    : scenario.includes("edge")
      ? "edge"
      : "center";
  const collision = scenario.includes("swap")
    ? "swap"
    : scenario.includes("none")
      ? "none"
      : "push";
  const format = scenario.includes("format")
    ? { style: "currency" as const, currency: "USD" }
    : undefined;
  let hydrated = $state(false);
  let owner = $state.raw<number | readonly number[]>(initial);
  let disabled = $state(scenario === "disabled");
  let indexes = $state(range ? [0, 1] : [0]);
  let present = $state(true);
  let hostSpan = $state(false);
  let calls = $state<unknown[]>([]);
  let commits = $state<unknown[]>([]);
  let submissions = $state<unknown[]>([]);
  let validationCalls = $state(0);
  let referenceCalls = $state<string[]>([]);
  let rootRef = $state<HTMLElement | null>(null);
  let controlRef = $state<HTMLElement | null>(null);
  const Root = Slider.Root<number | readonly number[]>;
  function changed(
    value: number | readonly number[],
    details: SliderRootChangeEventDetails,
  ) {
    const eventTarget = details.event.target as unknown as {
      value: unknown;
      name: string;
    };
    calls.push({
      value,
      reason: details.reason,
      type: details.event.type,
      activeThumbIndex: details.activeThumbIndex,
      targetValue: eventTarget.value,
      targetName: eventTarget.name,
      eventClass: details.event.constructor.name,
    });
    if (canceled) details.cancel();
    if (controlled && accepts && !details.isCanceled) owner = value;
  }
  function committed(
    value: number | readonly number[],
    details: SliderRootCommitEventDetails,
  ) {
    commits.push({ value, reason: details.reason, type: details.event.type });
  }
  function validate(value: unknown) {
    validationCalls += 1;
    return Number(Array.isArray(value) ? value[0] : value) < 50
      ? "Too low"
      : null;
  }
  function inputReference(input: HTMLInputElement | null) {
    if (!input) {
      referenceCalls.push("null");
      return;
    }
    referenceCalls.push(`attach:${input.value}`);
    return () => referenceCalls.push(`cleanup:${input.value}`);
  }
  onMount(() => {
    hydrated = true;
  });
</script>

{#snippet host(
  props: Record<string | symbol, unknown>,
  _state: unknown,
  children: import("svelte").Snippet | undefined,
)}
  {#if hostSpan}<span {...props as HTMLAttributes<HTMLSpanElement>}
      >{@render children?.()}</span
    >{:else}<section {...props as HTMLAttributes<HTMLElement>}>
      {@render children?.()}
    </section>{/if}
{/snippet}
<main data-hydrated={hydrated} data-renderer="svelte">
  <CSPProvider nonce="slider-nonce">
    <DirectionProvider direction={rtl ? "rtl" : "ltr"}>
      <Form
        id="slider-form"
        onFormSubmit={(values, details) => {
          details.event.preventDefault();
          submissions.push(values);
        }}
      >
        <Field.Root
          id="slider-field"
          name={scenario.includes("external") ? undefined : "volume"}
          disabled={scenario === "field-disabled"}
          validationMode={scenario.includes("onblur") ? "onBlur" : "onSubmit"}
          validate={scenario.includes("validate") || scenario.includes("onblur")
            ? validate
            : undefined}
        >
          {#if scenario.includes("field-label")}<Field.Label id="field-label"
              >Field volume</Field.Label
            >{/if}
          <Field.Description id="slider-description"
            >Adjust volume</Field.Description
          >
          {#if present && (!scenario.includes("fresh") || hydrated)}
            <Root
              id="slider-root"
              defaultValue={initial}
              value={controlled ? owner : undefined}
              name="fallback"
              form={scenario.includes("external")
                ? "external-slider-form"
                : undefined}
              {disabled}
              orientation={vertical ? "vertical" : "horizontal"}
              {min}
              {max}
              {step}
              {largeStep}
              minStepsBetweenValues={spacing}
              thumbAlignment={alignment}
              thumbCollisionBehavior={collision}
              {format}
              locale={scenario.includes("format") ? "en-US" : undefined}
              onValueChange={changed}
              onValueCommitted={committed}
              bind:ref={rootRef}
              render={scenario.includes("render") ? host : undefined}
            >
              <Slider.Label data-testid="slider-label">Volume</Slider.Label>
              <Slider.Control
                id="slider-control"
                class={vertical ? "vertical" : "horizontal"}
                bind:ref={controlRef}
                onpointerdown={scenario.includes("handler-cancel")
                  ? (event) => event.preventBaseUIHandler()
                  : undefined}
              >
                <Slider.Track id="slider-track"
                  ><Slider.Indicator id="slider-indicator" /></Slider.Track
                >
                {#each indexes as index (index)}
                  <Slider.Thumb
                    data-testid={`thumb-${index}`}
                    id={`thumb-${index}`}
                    {index}
                    disabled={scenario.includes("thumb-disabled") &&
                      index === 0}
                    inputRef={inputReference}
                    render={scenario.includes("render") ? host : undefined}
                    onkeydown={scenario.includes("key-cancel")
                      ? (event) => event.preventDefault()
                      : undefined}
                    getAriaLabel={scenario.includes("aria")
                      ? (index) => `Value ${index + 1}`
                      : undefined}
                    getAriaValueText={scenario.includes("aria")
                      ? (formatted, value, index) =>
                          `${index}:${formatted}:${value}`
                      : undefined}
                  />
                {/each}
              </Slider.Control>
              <Slider.Value id="slider-value" />
              {#if scenario.includes("snippet")}<Slider.Value id="custom-value"
                  >{#snippet children(formatted, values)}{formatted.join(
                      "/",
                    )}/{values.join("/")}{/snippet}</Slider.Value
                >{/if}
            </Root>
          {/if}
          <Field.Error id="slider-error" />
        </Field.Root>
        <button id="slider-submit" type="submit">Submit</button>
      </Form>
      {#if scenario.includes("external")}<form
          id="external-slider-form"
        ></form>{/if}
    </DirectionProvider>
  </CSPProvider>
  <button id="slider-outside">Outside</button>
  <button
    id="set-owner"
    onclick={() => {
      owner = range ? [30, 70] : 60;
    }}>Owner</button
  >
  <button
    id="toggle-disabled"
    onclick={() => {
      disabled = !disabled;
    }}>Disable</button
  >
  <button
    id="toggle-present"
    onclick={() => {
      present = !present;
    }}>Mount</button
  >
  <button
    id="replace-host"
    onclick={() => {
      hostSpan = !hostSpan;
    }}>Replace</button
  >
  <button
    id="shrink"
    onclick={() => {
      owner = [30];
      indexes = [0];
    }}>Shrink</button
  >
  <button
    id="grow"
    onclick={() => {
      owner = [10, 40, 70];
      indexes = [0, 1, 2];
    }}>Grow</button
  >
  <pre id="slider-calls">{JSON.stringify(calls)}</pre>
  <pre id="slider-commits">{JSON.stringify(commits)}</pre>
  <pre id="slider-submissions">{JSON.stringify(submissions)}</pre>
  <pre id="slider-owner">{JSON.stringify(owner)}</pre>
  <pre id="slider-refs">{JSON.stringify(referenceCalls)}</pre>
  <output id="slider-validation-calls">{validationCalls}</output>
  <output id="slider-hosts"
    >{rootRef?.tagName ?? "null"}/{controlRef?.tagName ?? "null"}</output
  >
</main>
