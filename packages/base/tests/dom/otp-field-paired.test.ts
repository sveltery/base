// Actual React19.2.8/Base UI1.8.0 and native Svelte runtime probes; supplemental credit only.
import { afterEach, expect, it, vi } from "vitest";
import { flushSync, mount, tick, unmount } from "svelte";
import {
  mountOTPFieldReference,
  flushOTPFieldReference as flushReact,
} from "../../../../apps/fixtures/src/lib/otp-field-reference.js";
import Fixture from "../../../../apps/fixtures/src/lib/OTPFieldBrowserFixture.svelte";
const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});
for (const framework of ["react", "svelte"]) {
  function setup(scenario = "default") {
    const host = document.createElement("div");
    document.body.append(host);
    if (framework === "react")
      flushReact(() => {
        cleanups.push(mountOTPFieldReference(host, scenario));
      });
    else {
      const component = mount(Fixture, { target: host, props: { scenario } });
      cleanups.push(() => unmount(component));
      flushSync();
    }
    const flush = () => {
      if (framework === "react") flushReact(() => {});
      else flushSync();
    };
    const run = (fn: () => void) => {
      if (framework === "react") flushReact(fn);
      else {
        fn();
        flushSync();
      }
    };
    const slots = () => [
      ...host.querySelectorAll<HTMLInputElement>("input[data-slot]"),
    ];
    const hidden = () =>
      host.querySelector<HTMLInputElement>("input[aria-hidden]")!;
    const values = () =>
      slots()
        .map((input) => input.value)
        .join("");
    const calls = () =>
      JSON.parse(host.querySelector("#calls")!.textContent!) as {
        phase: string;
        value: string;
      }[];
    const input = (index: number, value: string) =>
      run(() => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(slots()[index], value);
        slots()[index].dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            cancelable: true,
            inputType: "insertText",
            data: value,
          }),
        );
      });
    const focus = (index: number) => run(() => slots()[index].focus());
    const paste = (index: number, value: string) =>
      run(() => {
        const event = new Event("paste", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "clipboardData", {
          value: { getData: () => value },
        });
        slots()[index].dispatchEvent(event);
      });
    flush();
    return {
      host,
      flush,
      run,
      slots,
      hidden,
      values,
      calls,
      input,
      focus,
      paste,
    };
  }
  it(`${framework} source/native OTP edits completion and metadata`, () => {
    const s = setup("empty");
    s.focus(0);
    s.input(0, "123456");
    expect(s.values()).toBe("123456");
    expect(s.hidden().value).toBe("123456");
    expect(s.calls().map((call) => call.phase)).toEqual(["change", "complete"]);
    expect(document.activeElement).toBe(s.slots()[5]);
    expect(s.hidden().name).toBe("otp");
  });
  it(`${framework} source/native OTP external form sees settled validation value`, () => {
    const s = setup("external-form");
    const snapshots: unknown[] = [];
    const external = s.host.querySelector<HTMLFormElement>("#external-form")!;
    const original = external.requestSubmit.bind(external);
    vi.spyOn(external, "requestSubmit").mockImplementation(() => {
      snapshots.push(
        Array.from(external.elements)
          .filter(
            (element): element is HTMLInputElement =>
              element instanceof HTMLInputElement,
          )
          .map((input) => ({
            value: input.value,
            name: input.name,
            pattern: input.pattern,
            valid: input.validity.valid,
          })),
      );
      original();
    });
    s.input(0, "123456");
    expect(snapshots).toEqual([
      [
        ...Array.from({ length: 6 }, (_, index) => ({
          value: String(index + 1),
          name: "",
          pattern: "\\d{1}",
          valid: true,
        })),
        { value: "123456", name: "otp", pattern: "\\d{6}", valid: true },
      ],
    ]);
    expect(s.host.querySelector("#submissions")!.textContent).toBe(
      '[{"otp":"123456"}]',
    );
  });
  it(`${framework} source/native OTP binding settles an unchanged first slot before submission`, () => {
    const s = setup("external-form-unchanged");
    s.input(0, "123456");
    expect(s.hidden().value).toBe("123456");
    expect(s.slots()[0].value).toBe("1");
    expect(s.slots()[0].validity.patternMismatch).toBe(false);
    expect(s.host.querySelector("#submissions")!.textContent).toBe(
      '[{"otp":"123456"}]',
    );
  });
  it(`${framework} source/native preserves code-point clamp and UTF16 slot/completion bug`, () => {
    const s = setup("unicode");
    s.paste(0, "😀x");
    expect(s.hidden().value).toBe("😀x");
    expect(s.values()).toBe("😀");
    expect(s.calls().map((call) => call.phase)).toEqual(["change"]);
    expect(
      s.host
        .querySelector('[data-testid="root"]')!
        .hasAttribute("data-complete"),
    ).toBe(false);
  });
  it(`${framework} source/native OTP normalized paste preserves suffix`, () => {
    const s = setup("complete");
    s.focus(2);
    s.paste(2, "9a9");
    expect(s.values()).toBe("129956");
    expect(s.calls().map((call) => call.phase)).toEqual([
      "invalid",
      "change",
      "complete",
    ]);
    expect(document.activeElement).toBe(s.slots()[4]);
    s.paste(0, "129956");
    expect(s.calls().filter((call) => call.phase === "complete")).toHaveLength(
      2,
    );
  });
  for (const [scenario, raw, expected, phases, patternMismatch] of [
    ["complete", "123x456", "123456", ["invalid"], false],
    ["cancel", "34", "12", ["change"], true],
  ] as const) {
    it(`${framework} source/native OTP hidden ${scenario} autofill preserves authoritative serialization`, async () => {
      const s = setup(scenario);
      s.run(() => {
        Object.getOwnPropertyDescriptor(
          HTMLInputElement.prototype,
          "value",
        )!.set!.call(s.hidden(), raw);
        s.hidden().dispatchEvent(
          new InputEvent("input", {
            bubbles: true,
            inputType: "insertReplacementText",
            data: raw,
          }),
        );
      });
      await tick();
      expect(s.values()).toBe(expected);
      expect(s.hidden().value).toBe(expected);
      expect(new FormData(s.host.querySelector("form")!).get("otp")).toBe(
        expected,
      );
      expect(s.hidden().validity.patternMismatch).toBe(patternMismatch);
      expect(s.calls().map((call) => call.phase)).toEqual(phases);
      expect(s.calls()[0].value).toBe(raw);
    });
  }
  it(`${framework} source/native OTP canceled typing with native binding`, async () => {
    const s = setup("cancel");
    s.focus(0);
    s.input(0, "3");
    expect(s.hidden().value).toBe("12");
    await tick();
    expect(s.values()).toBe("12");
    expect(document.activeElement).toBe(s.slots()[0]);
  });
  it(`${framework} source/native OTP controlled deferred acceptance and completion`, () => {
    const s = setup("controlled-deferred");
    s.focus(0);
    s.paste(0, "123456");
    expect(s.hidden().value).toBe("");
    expect(s.calls().map((call) => call.phase)).toEqual(["change"]);
    s.run(() => s.host.querySelector<HTMLButtonElement>("#accept")!.click());
    expect(s.values()).toBe("123456");
    expect(s.calls().map((call) => call.phase)).toEqual(["change", "complete"]);
  });
  for (const phase of ["focus", "blur"])
    it(`${framework} source/native OTP ${phase} default prevention boundary`, () => {
      const s = setup(`${phase}-default`);
      s.focus(0);
      if (phase === "blur")
        s.run(() => s.host.querySelector<HTMLButtonElement>("#after")!.focus());
      const focused = s.host
        .querySelector('[data-testid="root"]')!
        .hasAttribute("data-focused");
      expect(focused).toBe(
        phase === "focus" ? framework === "svelte" : framework === "react",
      );
    });
  it(`${framework} source/native OTP composition input retains original filtering`, () => {
    const s = setup("empty");
    s.run(() => {
      const input = s.slots()[0];
      input.dispatchEvent(
        new CompositionEvent("compositionstart", { bubbles: true }),
      );
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "1a");
      input.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          inputType: "insertCompositionText",
          data: "1a",
          isComposing: true,
        }),
      );
      input.dispatchEvent(
        new CompositionEvent("compositionend", { bubbles: true, data: "1a" }),
      );
    });
    expect(s.hidden().value).toBe("1");
    expect(s.calls().map((call) => call.phase)).toEqual(["invalid", "change"]);
  });
}
