// Actual pinned Base UI 1.8.0 on React/ReactDOM19.2.8; MIT: OTP upstream license.
import {
  createElement as h,
  useEffect,
  useState,
  version as reactVersion,
} from "react";
import { version as reactDomVersion } from "react-dom";
export { flushSync as flushOTPFieldReference } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  OTPField,
  type OTPFieldRootProps,
  type OTPFieldInputProps,
} from "@base-ui/react/otp-field";
import { Field } from "@base-ui/react/field";
import { Form } from "@base-ui/react/form";
import { DirectionProvider } from "@base-ui/react/direction-provider";
export function mountOTPFieldReference(node: HTMLElement, scenario: string) {
  function Fixture() {
    const initial = scenario === "normalize-complete"
      ? "ABCDEF"
      : scenario.includes("complete")
      ? "123456"
      : scenario.includes("empty") ||
          scenario.startsWith("controlled") ||
          scenario === "auto-submit" ||
          scenario === "external-form" ||
          scenario === "unicode"
        ? ""
        : scenario === "alpha"
          ? "ab"
          : scenario === "alphanumeric"
            ? "A1"
            : "12";
    const [owner, setOwner] = useState(initial);
    const [pending, setPending] = useState<string>();
    const [items, setItems] = useState(
      scenario === "unicode" ? [0, 1] : [0, 1, 2, 3, 4, 5],
    );
    const [alive, setAlive] = useState(true);
    const [hydrated, setHydrated] = useState(false);
    const [calls, setCalls] = useState<unknown[]>([]);
    const [submissions, setSubmissions] = useState<unknown[]>([]);
    const [validations, setValidations] = useState<unknown[]>([]);
    useEffect(() => setHydrated(true), []);
    const record = (
      phase: string,
      value: string,
      reason: string,
      event: Event,
    ) =>
      setCalls((previous) => [
        ...previous,
        { phase, value, reason, type: event.type, trusted: event.isTrusted },
      ]);
    const rootProps: Partial<OTPFieldRootProps> = {
      ...(scenario === "alpha" ? { validationType: "alpha" } : {}),
      ...(scenario === "alphanumeric"
        ? { validationType: "alphanumeric" }
        : {}),
      ...(scenario === "none" || scenario === "onblur" || scenario === "unicode"
        ? { validationType: "none" }
        : {}),
      ...(scenario.startsWith("normalize")
        ? {
            validationType: "alphanumeric",
            normalizeValue: (value) => value.toUpperCase(),
          }
        : {}),
      ...(scenario === "restricted"
        ? { normalizeValue: (value) => value.replace(/[^0-3]/g, "") }
        : {}),
      disabled: scenario === "disabled",
      readOnly: scenario === "readonly",
      mask: scenario === "mask",
      required: scenario === "required",
      autoSubmit:
        scenario === "auto-submit" || scenario.startsWith("external-form"),
      ...(scenario.startsWith("external-form")
        ? { form: "external-form" }
        : {}),
      ...(scenario === "native-label" ? { id: "code" } : {}),
      ...(scenario === "aria-group"
        ? { "aria-labelledby": "external-label" }
        : {}),
    };
    const slotProps: OTPFieldInputProps = {
      ...(scenario === "aria-slot" ? { "aria-label": "Slot code" } : {}),
      ...(scenario === "focus-default"
        ? { onFocus: (event) => event.preventDefault() }
        : {}),
      ...(scenario === "focus-base"
        ? { onFocus: (event) => event.preventBaseUIHandler() }
        : {}),
      ...(scenario === "blur-default"
        ? { onBlur: (event) => event.preventDefault() }
        : {}),
      ...(scenario === "blur-base"
        ? { onBlur: (event) => event.preventBaseUIHandler() }
        : {}),
      ...(scenario === "mousedown-default"
        ? { onMouseDown: (event) => event.preventDefault() }
        : {}),
      ...(scenario === "input-base"
        ? { onChange: (event) => event.preventBaseUIHandler() }
        : {}),
    };
    const withField =
      scenario !== "native-label" &&
      scenario !== "standalone" &&
      !scenario.startsWith("focus-") &&
      !scenario.startsWith("blur-");
    const slots = items.map((item) => {
      const input = h(OTPField.Input, {
        key: item,
        ...{ "data-slot": item },
        ...slotProps,
        ...(scenario === "render"
          ? { render: h("input", { "data-render-host": "input" }) }
          : {}),
      });
      return scenario === "grouped"
        ? h("span", { key: item, "data-group": item }, input)
        : input;
    });
    const otp = h(
      OTPField.Root,
      {
        length: scenario === "unicode" ? 2 : 6,
        name: "fallback",
        defaultValue: initial,
        value: scenario.startsWith("controlled") ? owner : undefined,
        ...rootProps,
        ...{ "data-testid": "root" },
        ...(scenario === "render" ? { render: h("section") } : {}),
        onValueChange(value, details) {
          record("change", value, details.reason, details.event);
          if (scenario === "cancel") details.cancel();
          if (
            scenario.startsWith("controlled") &&
            !scenario.includes("reject") &&
            !details.isCanceled
          ) {
            if (scenario.includes("deferred")) setPending(value);
            else setOwner(value);
          }
        },
        onValueInvalid(value, details) {
          record("invalid", value, details.reason, details.event);
        },
        onValueComplete(value, details) {
          record("complete", value, details.reason, details.event);
        },
      },
      ...slots,
      h(OTPField.Separator, {
        id: "separator",
        ...{ "data-testid": "separator" },
      }),
    );
    const field = withField
      ? h(
          Field.Root,
          {
            name: "otp",
            ...{ "data-testid": "field" },
            validationMode: scenario === "onblur" ? "onBlur" : "onSubmit",
            ...(scenario === "onblur"
              ? {
                  validate: (value: unknown) => {
                    setValidations((previous) => [...previous, value]);
                    return `Error: ${String(value)}`;
                  },
                }
              : {}),
          },
          h(Field.Label, { id: "label" }, "Code"),
          h(Field.Description, { id: "description" }, "Enter the code"),
          otp,
          h(Field.Error, { id: "error", ...{ "data-testid": "error" } }),
        )
      : otp;
    return h(
      "main",
      {
        "data-hydrated": hydrated,
        "data-renderer": `${reactVersion}/${reactDomVersion}`,
      },
      h("span", { id: "external-label" }, "External group label"),
      scenario === "native-label"
        ? h("label", { htmlFor: "code" }, "Native code")
        : null,
      h(
        DirectionProvider,
        { direction: scenario === "rtl" ? "rtl" : "ltr" },
        h(
          Form,
          {
            id: "form",
            onFormSubmit: (value) =>
              setSubmissions((previous) => [...previous, value]),
          },
          alive ? field : null,
          h("button", { type: "submit", id: "submit" }, "Submit"),
          h("button", { type: "button", id: "after" }, "After"),
        ),
      ),
      h(
        "button",
        {
          id: "accept",
          onClick: () => {
            if (pending !== undefined) setOwner(pending);
          },
        },
        "Accept pending",
      ),
      h(
        "button",
        { id: "owner", onClick: () => setOwner("654321") },
        "Owner update",
      ),
      h(
        "button",
        { id: "reorder", onClick: () => setItems([5, 4, 3, 2, 1, 0]) },
        "Reverse",
      ),
      h("button", { id: "remove", onClick: () => setAlive(false) }, "Remove"),
      h(
        "form",
        {
          id: "external-form",
          onSubmit: (event) => {
            event.preventDefault();
            const values = Object.fromEntries(
              new FormData(event.currentTarget as HTMLFormElement),
            );
            setSubmissions((previous) => [...previous, values]);
          },
        },
        h("button", {}, "External submit"),
      ),
      h("output", { id: "calls" }, JSON.stringify(calls)),
      h("output", { id: "submissions" }, JSON.stringify(submissions)),
      h("output", { id: "validations" }, JSON.stringify(validations)),
    );
  }
  const root = createRoot(node);
  root.render(h(Fixture));
  return () => root.unmount();
}
