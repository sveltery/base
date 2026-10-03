// Actual Base UI 1.8.0 Slider source witness on React/ReactDOM19.2.8; MIT.
import {
  createElement as h,
  useCallback,
  useEffect,
  useRef,
  useState,
  version as reactVersion,
  type ReactNode,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { version as reactDomVersion } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  Slider,
  type SliderRootChangeEventDetails,
  type SliderRootCommitEventDetails,
} from "@base-ui/react/slider";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { DirectionProvider } from "@base-ui/react/direction-provider";
import { CSPProvider } from "@base-ui/react/csp-provider";
export function SliderReferenceFixture({
  scenario = "default",
}: {
  scenario?: string;
}) {
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
  const [hydrated, setHydrated] = useState(false);
  const [owner, setOwner] = useState<number | readonly number[]>(initial);
  const [disabled, setDisabled] = useState(scenario === "disabled");
  const [indexes, setIndexes] = useState(range ? [0, 1] : [0]);
  const [present, setPresent] = useState(true);
  const [hostSpan, setHostSpan] = useState(false);
  const [calls, setCalls] = useState<unknown[]>([]);
  const [commits, setCommits] = useState<unknown[]>([]);
  const [submissions, setSubmissions] = useState<unknown[]>([]);
  const [validationCalls, setValidationCalls] = useState(0);
  const [referenceCalls, setReferenceCalls] = useState<string[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const controlReference = useCallback((node: HTMLDivElement | null) => {
    controlRef.current = node;
    if (typeof window !== "undefined")
      (
        window as unknown as {
          sliderLayout?: { event: string; node: string | null }[];
        }
      ).sliderLayout?.push({ event: "control-ref", node: node?.id ?? null });
  }, []);
  useEffect(() => setHydrated(true), []);
  function changed(
    value: number | readonly number[],
    details: SliderRootChangeEventDetails,
  ) {
    const target = details.event.target as unknown as {
      value: unknown;
      name: string;
    };
    setCalls((previous) => [
      ...previous,
      {
        value,
        reason: details.reason,
        type: details.event.type,
        activeThumbIndex: details.activeThumbIndex,
        targetValue: target.value,
        targetName: target.name,
        eventClass: details.event.constructor.name,
      },
    ]);
    if (canceled) details.cancel();
    if (controlled && accepts && !details.isCanceled) setOwner(value);
  }
  function committed(
    value: number | readonly number[],
    details: SliderRootCommitEventDetails,
  ) {
    setCommits((previous) => [
      ...previous,
      { value, reason: details.reason, type: details.event.type },
    ]);
  }
  function validate(value: unknown) {
    setValidationCalls((previous) => previous + 1);
    return Number(Array.isArray(value) ? value[0] : value) < 50
      ? "Too low"
      : null;
  }
  const inputReference = useCallback((input: HTMLInputElement | null) => {
    if (typeof window !== "undefined")
      (
        window as unknown as {
          sliderLayout?: { event: string; node: string | null }[];
        }
      ).sliderLayout?.push({
        event: "input-ref",
        node: input?.parentElement?.id ?? null,
      });
    if (!input) {
      setReferenceCalls((previous) => [...previous, "null"]);
      return;
    }
    setReferenceCalls((previous) => [...previous, `attach:${input.value}`]);
    return () =>
      setReferenceCalls((previous) => [...previous, `cleanup:${input.value}`]);
  }, []);
  const renderer = (props: HTMLAttributes<HTMLElement>) =>
    h(hostSpan ? "span" : "section", props);
  const thumbProps = (index: number) => ({
    key: index,
    "data-testid": `thumb-${index}`,
    id: `thumb-${index}`,
    index,
    disabled: scenario.includes("thumb-disabled") && index === 0,
    inputRef: inputReference,
    render: scenario.includes("render") ? renderer : undefined,
    onKeyDown: scenario.includes("key-cancel")
      ? (event: ReactKeyboardEvent<HTMLInputElement>) => event.preventDefault()
      : undefined,
    getAriaLabel: scenario.includes("aria")
      ? (index: number) => `Value ${index + 1}`
      : undefined,
    getAriaValueText: scenario.includes("aria")
      ? (formatted: string, value: number, index: number) =>
          `${index}:${formatted}:${value}`
      : undefined,
  });
  const slider =
    present && (!scenario.includes("fresh") || hydrated)
      ? h(
          Slider.Root<number | readonly number[]>,
          {
            id: "slider-root",
            defaultValue: initial,
            value: controlled ? owner : undefined,
            name: "fallback",
            form: scenario.includes("external")
              ? "external-slider-form"
              : undefined,
            disabled,
            orientation: vertical ? "vertical" : "horizontal",
            min,
            max,
            step,
            largeStep,
            minStepsBetweenValues: spacing,
            thumbAlignment: alignment,
            thumbCollisionBehavior: collision,
            format,
            locale: scenario.includes("format") ? "en-US" : undefined,
            onValueChange: changed,
            onValueCommitted: committed,
            ref: rootRef,
            render: scenario.includes("render") ? renderer : undefined,
          },
          h(
            Slider.Label,
            { className: "slider-label", ...{ "data-testid": "slider-label" } },
            "Volume",
          ),
          h(
            Slider.Control,
            {
              id: "slider-control",
              className: vertical ? "vertical" : "horizontal",
              ref: controlReference,
              onPointerDown: scenario.includes("handler-cancel")
                ? (event) => event.preventBaseUIHandler()
                : undefined,
            },
            h(
              Slider.Track,
              { id: "slider-track" },
              h(Slider.Indicator, { id: "slider-indicator" }),
            ),
            ...indexes.map((index) => h(Slider.Thumb, thumbProps(index))),
          ),
          h(Slider.Value, { id: "slider-value" }),
          scenario.includes("snippet")
            ? h(Slider.Value, {
                id: "custom-value",
                children: (
                  formatted: readonly string[],
                  values: readonly number[],
                ) => `${formatted.join("/")}/${values.join("/")}`,
              })
            : null,
        )
      : null;
  const contents: ReactNode = h(
    Form,
    {
      id: "slider-form",
      onFormSubmit(values, details) {
        details.event.preventDefault();
        setSubmissions((previous) => [...previous, values]);
      },
    },
    h(
      Field.Root,
      {
        id: "slider-field",
        name: scenario.includes("external") ? undefined : "volume",
        disabled: scenario === "field-disabled",
        validationMode: scenario.includes("onblur") ? "onBlur" : "onSubmit",
        validate:
          scenario.includes("validate") || scenario.includes("onblur")
            ? validate
            : undefined,
      },
      scenario.includes("field-label")
        ? h(
            Field.Label,
            {
              id: "field-label",
              nativeLabel: !scenario.includes("non-native"),
            },
            "Field volume",
          )
        : null,
      h(Field.Description, { id: "slider-description" }, "Adjust volume"),
      slider,
      h(Field.Error, { id: "slider-error" }),
    ),
    h("button", { id: "slider-submit", type: "submit" }, "Submit"),
  );
  return h(
    "main",
    {
      "data-hydrated": hydrated,
      "data-renderer": `${reactVersion}/${reactDomVersion}`,
    },
    h(
      CSPProvider,
      { nonce: "slider-nonce" },
      h(
        DirectionProvider,
        { direction: rtl ? "rtl" : "ltr" },
        contents,
        scenario.includes("external")
          ? h("form", { id: "external-slider-form" })
          : null,
      ),
    ),
    h("button", { id: "slider-outside" }, "Outside"),
    h(
      "button",
      { id: "set-owner", onClick: () => setOwner(range ? [30, 70] : 60) },
      "Owner",
    ),
    h(
      "button",
      {
        id: "toggle-disabled",
        onClick: () => setDisabled((previous) => !previous),
      },
      "Disable",
    ),
    h(
      "button",
      {
        id: "toggle-present",
        onClick: () => setPresent((previous) => !previous),
      },
      "Mount",
    ),
    h(
      "button",
      {
        id: "replace-host",
        onClick: () => setHostSpan((previous) => !previous),
      },
      "Replace",
    ),
    h(
      "button",
      {
        id: "shrink",
        onClick: () => {
          setOwner([30]);
          setIndexes([0]);
        },
      },
      "Shrink",
    ),
    h(
      "button",
      {
        id: "grow",
        onClick: () => {
          setOwner([10, 40, 70]);
          setIndexes([0, 1, 2]);
        },
      },
      "Grow",
    ),
    h("pre", { id: "slider-calls" }, JSON.stringify(calls)),
    h("pre", { id: "slider-commits" }, JSON.stringify(commits)),
    h("pre", { id: "slider-submissions" }, JSON.stringify(submissions)),
    h("pre", { id: "slider-owner" }, JSON.stringify(owner)),
    h("pre", { id: "slider-refs" }, JSON.stringify(referenceCalls)),
    h("output", { id: "slider-validation-calls" }, validationCalls),
    h(
      "output",
      { id: "slider-hosts" },
      `${rootRef.current?.tagName ?? "null"}/${controlRef.current?.tagName ?? "null"}`,
    ),
  );
}
export function mountSliderReference(node: HTMLElement, scenario: string) {
  const root = createRoot(node);
  root.render(h(SliderReferenceFixture, { scenario }));
  return () => root.unmount();
}
