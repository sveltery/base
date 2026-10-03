// Pinned Base UI 1.8.0 ordinary assertion adapters; line IDs retain provenance.
// Native renderer supplements are explicitly named. MIT: parity/otp-field/UPSTREAM_LICENSE.
import { afterEach, expect, it, vi } from "vitest";
import { flushSync, mount, tick, unmount } from "svelte";
import Fixture from "./OTPFieldFixture.svelte";
const cleanups: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const cleanup of cleanups.splice(0)) await cleanup();
  document.body.replaceChildren();
});
function setup(props: Record<string, unknown> = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const component = mount(Fixture, { target: host, props });
  cleanups.push(() => unmount(component));
  flushSync();
  const slot = (index: number) =>
    host.querySelectorAll<HTMLInputElement>("input[data-slot]")[index];
  const hidden = () =>
    host.querySelector<HTMLInputElement>("input[aria-hidden]")!;
  const root = () => host.querySelector<HTMLElement>('[data-testid="root"]')!;
  const values = () =>
    [...host.querySelectorAll<HTMLInputElement>("input[data-slot]")]
      .map((input) => input.value)
      .join("");
  const input = (index: number, value: string) => {
    slot(index).value = value;
    slot(index).dispatchEvent(
      new Event("input", { bubbles: true, cancelable: true }),
    );
    flushSync();
  };
  const key = (index: number, key: string, options: KeyboardEventInit = {}) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key,
      ...options,
    });
    slot(index).dispatchEvent(event);
    flushSync();
    return event;
  };
  const paste = (index: number, value: string) => {
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: { getData: () => value },
    });
    slot(index).dispatchEvent(event);
    flushSync();
    return event;
  };
  return { host, component, slot, hidden, root, values, input, key, paste };
}
it("Input:73 renders one textbox per slot", () => {
  const s = setup();
  expect(s.host.querySelectorAll("input[data-slot]")).toHaveLength(6);
});
it("Root:60 splits the default value across inputs", () => {
  expect(setup({ initial: "123456" }).values()).toBe("123456");
});
it("Root:67 clamps an overlong default value", () => {
  expect(setup({ initial: "1234567" }).values()).toBe("123456");
});
it("Root:81 assigns slot indexes from render order", () => {
  const s = setup({ initial: "123456" });
  expect(Array.from({ length: 6 }, (_, i) => s.slot(i).value)).toEqual([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
  ]);
});
it("Root:94 supports grouped layouts without affecting slot counting", () => {
  const s = setup({ grouped: true, initial: "123456" });
  expect(s.values()).toBe("123456");
});
it("Root:120 updates the rendered value in controlled mode", () => {
  const s = setup({ controlled: true });
  s.component.setValue("123456");
  flushSync();
  expect(s.values()).toBe("123456");
});
it("Input:79 moves focus with arrow keys", () => {
  const s = setup({ initial: "12" });
  s.slot(1).focus();
  s.key(1, "ArrowRight");
  expect(document.activeElement).toBe(s.slot(2));
  s.key(2, "ArrowLeft");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:97 moves focus with arrow keys in RTL", () => {
  const s = setup({ initial: "12", rtl: true });
  s.slot(1).focus();
  s.key(1, "ArrowLeft");
  expect(document.activeElement).toBe(s.slot(2));
  s.key(2, "ArrowRight");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:113 redirects focus to the first empty slot", () => {
  const s = setup({ initial: "12" });
  s.slot(4).focus();
  expect(document.activeElement).toBe(s.slot(2));
});
it("Input:125 moves focus to the next slot after typing", () => {
  const s = setup();
  s.slot(0).focus();
  s.input(0, "1");
  expect(s.values()).toBe("1");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:139 selects the last slot after first typing", () => {
  const s = setup({ initial: "12345" });
  s.slot(5).focus();
  s.input(5, "6");
  expect(document.activeElement).toBe(s.slot(5));
  expect(s.slot(5).selectionStart).toBe(0);
  expect(s.slot(5).selectionEnd).toBe(1);
});
it("supplement native Input:156 canceled typing retains native edited DOM and source focus/state", () => {
  const s = setup({ cancel: true });
  s.slot(0).focus();
  s.input(0, "1");
  expect(document.activeElement).toBe(s.slot(0));
  expect(s.hidden().value).toBe("");
  expect(s.slot(0).value).toBe("1");
});
it("Input:177 keeps a filled slot selected for invalid input", () => {
  const s = setup({ initial: "1" });
  s.slot(0).focus();
  s.input(0, "a");
  expect(s.slot(0).value).toBe("1");
  expect(s.slot(0).selectionEnd).toBe(1);
});
it("Input:194 selects the slot value on mousedown", () => {
  const s = setup({ initial: "12" });
  s.slot(1).dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  expect(document.activeElement).toBe(s.slot(1));
  expect(s.slot(1).selectionStart).toBe(0);
  expect(s.slot(1).selectionEnd).toBe(1);
});
it("Input:205 composed mousedown prevents internal focus", () => {
  const s = setup({
    slotProps: { onmousedown: (e: Event) => e.preventDefault() },
  });
  s.slot(0).dispatchEvent(
    new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
  );
  expect(document.activeElement).not.toBe(s.slot(0));
});
it("supplement native Input:223 preventBaseUIHandler suppresses noncancelable focus", () => {
  const s = setup({
    slotProps: {
      onfocus: (e: Event & { preventBaseUIHandler(): void }) =>
        e.preventBaseUIHandler(),
    },
  });
  s.slot(0).focus();
  flushSync();
  expect(s.root().hasAttribute("data-focused")).toBe(false);
});
it("supplement native Input:245 preventBaseUIHandler suppresses noncancelable blur", () => {
  const s = setup({
    slotProps: {
      onblur: (e: Event & { preventBaseUIHandler(): void }) =>
        e.preventBaseUIHandler(),
    },
  });
  s.slot(0).focus();
  flushSync();
  s.host.querySelector<HTMLButtonElement>("#after")!.focus();
  flushSync();
  expect(s.root().hasAttribute("data-focused")).toBe(true);
});
it("Input:276 moves focus for a repeated selected character", () => {
  const s = setup({ initial: "12" });
  s.slot(0).focus();
  expect(s.key(0, "1").defaultPrevented).toBe(true);
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:308 stops propagation for ArrowDown", () => {
  const listener = vi.fn();
  const s = setup({ initial: "12", rootProps: { onkeydown: listener } });
  s.slot(0).focus();
  expect(s.key(0, "ArrowDown").defaultPrevented).toBe(true);
  expect(listener).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(s.slot(2));
});
it("Input:328 keeps ArrowDown on empty end slot", () => {
  const s = setup({ initial: "12" });
  s.slot(2).focus();
  s.key(2, "ArrowDown");
  expect(document.activeElement).toBe(s.slot(2));
});
it("Input:341 keeps ArrowDown on complete final slot", () => {
  const s = setup({ initial: "123456" });
  s.slot(5).focus();
  s.key(5, "ArrowDown");
  expect(document.activeElement).toBe(s.slot(5));
});
it("Input:354 does not reselect repeated final character", () => {
  const s = setup({ initial: "123456" });
  s.slot(5).focus();
  const select = vi.spyOn(s.slot(5), "select");
  s.key(5, "6");
  expect(select).not.toHaveBeenCalled();
});
it("Input:376 Home focuses first slot", () => {
  const s = setup({ initial: "12" });
  s.slot(2).focus();
  s.key(2, "Home");
  expect(document.activeElement).toBe(s.slot(0));
});
it("Input:390 End focuses empty end slot", () => {
  const s = setup({ initial: "12" });
  s.slot(0).focus();
  s.key(0, "End");
  expect(document.activeElement).toBe(s.slot(2));
});
for (const modifier of ["ctrlKey", "metaKey"])
  it(`Input modifier ${modifier} navigation and clear`, () => {
    const s = setup({ initial: "123" });
    s.slot(1).focus();
    s.key(1, "ArrowRight", { [modifier]: true });
    expect(document.activeElement).toBe(s.slot(3));
    s.key(3, "ArrowLeft", { [modifier]: true });
    expect(document.activeElement).toBe(s.slot(0));
    s.key(0, "Backspace", { [modifier]: true });
    expect(s.values()).toBe("");
  });
it("Input:446 readonly preserves navigation", () => {
  const s = setup({ initial: "12", rootProps: { readOnly: true } });
  s.slot(1).focus();
  s.key(1, "ArrowRight");
  expect(document.activeElement).toBe(s.slot(2));
  s.key(2, "Home");
  expect(document.activeElement).toBe(s.slot(0));
});
it("Input:471 disabled leaves vertical navigation unhandled", () => {
  const s = setup({ rootProps: { disabled: true } });
  expect(s.key(0, "ArrowDown").defaultPrevented).toBe(false);
});
it("Input:498 readonly blocks deletion", () => {
  const s = setup({ initial: "12", rootProps: { readOnly: true } });
  s.key(0, "Delete");
  s.key(0, "Backspace");
  expect(s.values()).toBe("12");
});
it("Input:516 readonly blocks paste", () => {
  const s = setup({ initial: "12", rootProps: { readOnly: true } });
  expect(s.paste(0, "654321").defaultPrevented).toBe(false);
  expect(s.values()).toBe("12");
});
it("Input:560 ignores unavailable clipboard text", () => {
  const s = setup({ initial: "12" });
  s.slot(0).dispatchEvent(
    new Event("paste", { bubbles: true, cancelable: true }),
  );
  flushSync();
  expect(s.values()).toBe("12");
});
it("Input:594 backspace removes current and focuses previous", () => {
  const s = setup({ initial: "123" });
  s.slot(2).focus();
  s.key(2, "Backspace");
  expect(s.values()).toBe("12");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:609 backspace empty removes previous", () => {
  const s = setup({ initial: "12" });
  s.slot(2).focus();
  s.key(2, "Backspace");
  expect(s.values()).toBe("1");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:639 canceled backspace keeps value and focus", () => {
  const s = setup({ initial: "123", cancel: true });
  s.slot(2).focus();
  s.key(2, "Backspace");
  expect(s.values()).toBe("123");
  expect(document.activeElement).toBe(s.slot(2));
});
it("Input:661 Delete removes current without moving", () => {
  const s = setup({ initial: "123" });
  s.slot(1).focus();
  s.key(1, "Delete");
  expect(s.values()).toBe("13");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:694 canceled paste keeps value and focus", () => {
  const s = setup({ initial: "123", cancel: true });
  s.slot(1).focus();
  s.paste(1, "654");
  expect(s.values()).toBe("123");
  expect(document.activeElement).toBe(s.slot(1));
});
it("Input:715 paste replaces from middle", () => {
  const s = setup({ initial: "123456" });
  s.slot(2).focus();
  s.paste(2, "99");
  expect(s.values()).toBe("129956");
  expect(document.activeElement).toBe(s.slot(4));
});
it("Root:295 emits input-change", () => {
  const changed = vi.fn();
  const s = setup({ onChange: changed });
  s.input(0, "1");
  expect(changed).toHaveBeenCalledTimes(1);
  expect(changed.mock.calls[0][0]).toBe("1");
  expect(changed.mock.calls[0][1].reason).toBe("input-change");
});
it("Root:308 emits input-clear", () => {
  const changed = vi.fn();
  const s = setup({ initial: "1", onChange: changed });
  s.input(0, "");
  expect(s.values()).toBe("");
  expect(changed.mock.calls[0][1].reason).toBe("input-clear");
});
it("Root:323 reports rejected characters before change", () => {
  const calls: unknown[] = [];
  const s = setup({
    onInvalid: (v: string) => calls.push(["invalid", v]),
    onChange: (v: string) => calls.push(["change", v]),
  });
  s.input(0, "1a");
  expect(s.values()).toBe("1");
  expect(calls).toEqual([
    ["invalid", "1a"],
    ["change", "1"],
  ]);
});
it("Root:454 completion follows applied DOM", () => {
  const calls: unknown[] = [];
  const s = setup({
    onChange: (v: string) => calls.push(["change", v]),
    onComplete: (v: string) => calls.push(["complete", v, s.hidden().value]),
  });
  s.input(0, "123456");
  expect(calls).toEqual([
    ["change", "123456"],
    ["complete", "123456", "123456"],
  ]);
});
it("Root:480 repeated complete paste emits completion without repeated change", () => {
  const complete = vi.fn(),
    change = vi.fn();
  const s = setup({ onComplete: complete, onChange: change });
  s.paste(0, "123456");
  s.paste(0, "654321");
  s.paste(0, "654321");
  expect(complete).toHaveBeenCalledTimes(3);
  expect(change).toHaveBeenCalledTimes(2);
});
it("Root:517 canceled completion paste emits no completion", () => {
  const complete = vi.fn();
  const s = setup({ cancel: true, onComplete: complete });
  s.paste(0, "123456");
  expect(complete).not.toHaveBeenCalled();
  expect(s.values()).toBe("");
});
it("Root:535 incomplete input emits no completion", () => {
  const complete = vi.fn();
  setup({ onComplete: complete }).input(0, "12345");
  expect(complete).not.toHaveBeenCalled();
});
it("Root:546 stale controlled completion is discarded", () => {
  const complete = vi.fn();
  const s = setup({ controlled: true, accept: false, onComplete: complete });
  s.input(0, "123456");
  s.component.setValue("654321");
  flushSync();
  expect(complete).not.toHaveBeenCalled();
  expect(s.values()).toBe("654321");
});
it("Root:586 asynchronously accepted controlled completion applies first", () => {
  const complete = vi.fn();
  const s = setup({ controlled: true, deferred: true, onComplete: complete });
  s.input(0, "123456");
  expect(complete).not.toHaveBeenCalled();
  expect(s.hidden().value).toBe("");
  s.component.acceptPending();
  flushSync();
  expect(s.values()).toBe("123456");
  expect(complete).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(s.slot(5));
});
it("Root:625 controlled complete-to-complete owner change does not complete", () => {
  const complete = vi.fn();
  const s = setup({
    controlled: true,
    initial: "123456",
    onComplete: complete,
  });
  s.component.setValue("654321");
  flushSync();
  expect(complete).not.toHaveBeenCalled();
});
it("Root:651 associates Field Label with first slot", () => {
  const s = setup({ withField: true });
  expect(s.host.querySelector<HTMLLabelElement>("#label")!.htmlFor).toBe(
    s.slot(0).id,
  );
  expect(s.slot(5).getAttribute("aria-labelledby")).toBe("label");
});
it("Root:665 puts description on group", () => {
  const s = setup({ withField: true });
  expect(s.root().getAttribute("aria-describedby")).toBe("description");
});
it("Root:682 validates latest value only after leaving in onBlur mode", () => {
  const validate = vi.fn(() => null);
  const s = setup({
    withField: true,
    rootProps: { validationType: "none" },
    fieldProps: { validationMode: "onBlur", validate },
  });
  s.slot(0).focus();
  s.input(0, "12");
  s.slot(0).focus();
  flushSync();
  expect(validate).not.toHaveBeenCalled();
  s.host.querySelector<HTMLButtonElement>("#after")!.focus();
  flushSync();
  expect(validate).toHaveBeenLastCalledWith("12", expect.any(Object));
  expect(
    s.host.querySelector('[data-testid="field"]')!.hasAttribute("data-touched"),
  ).toBe(true);
});
it("Root:722 root aria-labelledby applies to group only", () => {
  const s = setup({ rootProps: { "aria-labelledby": "external" } });
  expect(s.root().getAttribute("aria-labelledby")).toBe("external");
  expect(s.slot(0).hasAttribute("aria-labelledby")).toBe(false);
});
it("Root:740 autocomplete first-only and hidden", () => {
  const s = setup();
  expect(s.slot(0).autocomplete).toBe("one-time-code");
  expect(s.slot(1).autocomplete).toBe("off");
  expect(s.hidden().autocomplete).toBe("one-time-code");
});
it("Root:762 disabled blocks edits", () => {
  const change = vi.fn();
  const s = setup({ rootProps: { disabled: true }, onChange: change });
  s.input(0, "1");
  s.paste(0, "123456");
  expect(s.hidden().disabled).toBe(true);
  expect(change).not.toHaveBeenCalled();
});
it("Root:812 masks visible slots only", () => {
  const s = setup({ rootProps: { mask: true } });
  expect(s.slot(0).type).toBe("password");
  expect(s.hidden().type).toBe("text");
});
it("Root:820 per-slot type override wins", () => {
  const s = setup({ rootProps: { mask: true }, slotProps: { type: "text" } });
  expect(s.slot(0).type).toBe("text");
});
it("Root:892 Delete empty does not call change", () => {
  const change = vi.fn();
  const s = setup({ onChange: change });
  s.key(0, "Delete");
  expect(change).not.toHaveBeenCalled();
});
it("Root:909 Backspace empty does not call change", () => {
  const change = vi.fn();
  const s = setup({ onChange: change });
  s.key(0, "Backspace");
  expect(change).not.toHaveBeenCalled();
});
it("Root:927 stale controlled focus request is discarded", () => {
  const s = setup({ controlled: true, accept: false });
  s.slot(0).focus();
  s.input(0, "12");
  s.component.setValue("3");
  flushSync();
  expect(document.activeElement).toBe(s.slot(0));
});
it("Root:1036 hidden input redirects focus", () => {
  const s = setup();
  s.hidden().focus();
  expect(document.activeElement).toBe(s.slot(0));
});
it("Root:1051 hidden autofill and clear preserve source focus queue", () => {
  const s = setup();
  s.hidden().value = "123456";
  s.hidden().dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  expect(s.values()).toBe("123456");
  expect(document.activeElement).toBe(s.slot(5));
  s.hidden().value = "";
  s.hidden().dispatchEvent(new Event("input", { bubbles: true }));
  flushSync();
  expect(s.values()).toBe("");
  expect(document.activeElement).toBe(s.slot(5));
});
it("Root:1515 data-complete follows all slots", () => {
  const s = setup({ initial: "123456" });
  expect(s.root().hasAttribute("data-complete")).toBe(true);
  expect(s.slot(0).hasAttribute("data-complete")).toBe(true);
  expect(s.root().hasAttribute("data-value")).toBe(false);
  expect(s.root().hasAttribute("data-length")).toBe(false);
});
it("supplement canonical render overrides resolve real hosts/ref registration", () => {
  const s = setup({ customRender: true });
  expect(s.root().tagName).toBe("SECTION");
  s.input(0, "12");
  expect(s.values()).toBe("12");
  expect(document.activeElement).toBe(s.slot(2));
  expect(s.slot(2).getAttribute("data-render-index")).toBe("2");
});
it("supplement Composite keyed reorder and removal update slot indexes", async () => {
  const s = setup({ initial: "123456" });
  s.component.reorder([5, 4, 3, 2, 1, 0]);
  flushSync();
  await tick();
  flushSync();
  expect(s.slot(0).getAttribute("data-slot")).toBe("5");
  expect(s.values()).toBe("123456");
  s.slot(0).focus();
  s.key(0, "ArrowRight");
  expect(document.activeElement).toBe(s.slot(1));
  s.component.reorder([5, 4, 3]);
  flushSync();
  await tick();
  flushSync();
  expect(s.host.querySelectorAll("input[data-slot]")).toHaveLength(3);
});
it("supplement teardown removes actual Field/Form registration", () => {
  const submit = vi.fn();
  const s = setup({ withField: true, initial: "12", onSubmit: submit });
  s.component.remove();
  flushSync();
  s.host
    .querySelector<HTMLFormElement>("#form")!
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  flushSync();
  expect(submit).toHaveBeenLastCalledWith(
    {},
    expect.objectContaining({ reason: "none" }),
  );
});
it("Root:132/148 built-in alpha and alphanumeric value filtering", () => {
  expect(
    setup({
      initial: "1a 2b3C4",
      rootProps: { validationType: "alpha" },
    }).values(),
  ).toBe("abC");
  expect(
    setup({
      initial: "A1-B2 c3!",
      rootProps: { validationType: "alphanumeric" },
    }).values(),
  ).toBe("A1B2c3");
});
it("Root:190/199 none omits native pattern and permits inputMode override", () => {
  const s = setup({
    rootProps: { validationType: "none", inputMode: "numeric" },
  });
  expect(s.hidden().hasAttribute("pattern")).toBe(false);
  expect(s.hidden().getAttribute("inputmode")).toBe("numeric");
});
it("Root:236/258 custom normalization follows filtering and preserves suffix", () => {
  const invalid = vi.fn();
  const s = setup({
    initial: "1303",
    length: 4,
    rootProps: {
      normalizeValue: (value: string) => value.replace(/[^0-3]/g, ""),
    },
    onInvalid: invalid,
  });
  s.slot(1).focus();
  s.paste(1, "29");
  expect(s.values()).toBe("1203");
  expect(invalid.mock.lastCall?.[0]).toBe("29");
});
it("Input:531 warns and ignores unreadable clipboard text", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    const s = setup({ initial: "12" });
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: {
        getData() {
          throw new Error("clipboard");
        },
      },
    });
    s.slot(0).dispatchEvent(event);
    flushSync();
    expect(s.values()).toBe("12");
    expect(event.defaultPrevented).toBe(false);
    expect(warn.mock.lastCall?.[0]).toContain(
      "<OTPField.Input> could not read clipboard text during paste handling.",
    );
  } finally {
    warn.mockRestore();
  }
});
it("Root:1527 mismatched count and singular warnings preserve source wording", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    setup({ count: 5 });
    expect(warn.mock.lastCall?.[0]).toContain(
      "Received `length={6}` but rendered 5 inputs.",
    );
    setup({ count: 1, length: 2 });
    expect(warn.mock.lastCall?.[0]).toContain(
      "Received `length={2}` but rendered 1 input.",
    );
  } finally {
    warn.mockRestore();
  }
});
for (const length of [0, -1, 3.7, Number.NaN, Number.POSITIVE_INFINITY])
  it(`Root:1574 invalid length ${length} omits hidden validation markup and warns`, () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const s = setup({ length, count: 0 });
      expect(s.host.querySelector("input[aria-hidden]")).toBeNull();
      expect(warn.mock.lastCall?.[0]).toContain(
        `\`length\` must be a positive integer. Received \`length={${String(length)}}\`.`,
      );
    } finally {
      warn.mockRestore();
    }
  });
it("supplement hidden autofill default prevention honors source native guard", () => {
  const change = vi.fn();
  const s = setup({ onChange: change });
  s.hidden().value = "123456";
  const event = new Event("input", { bubbles: true, cancelable: true });
  event.preventDefault();
  s.hidden().dispatchEvent(event);
  flushSync();
  expect(change).not.toHaveBeenCalled();
  expect(s.values()).toBe("");
});
it("supplement mounted native Root and Input refs release on teardown", () => {
  const s = setup({ customRender: true });
  const host = s.root(),
    input = s.slot(0);
  s.component.remove();
  flushSync();
  expect(host.isConnected).toBe(false);
  expect(input.isConnected).toBe(false);
  expect(s.host.querySelectorAll("input")).toHaveLength(0);
});

it("supplement native functional binding settles accepted unchanged first character before completion", () => {
  const onChange = vi.fn();
  const s = setup({ initial: "12", onChange });
  s.input(0, "1234");
  expect(s.values()).toBe("1234");
  expect(s.slot(0).value).toBe("1");
  expect(onChange).toHaveBeenCalledTimes(1);
  s.input(0, "12345");
  expect(s.values()).toBe("12345");
  expect(s.slot(0).value).toBe("1");
  expect(onChange).toHaveBeenCalledTimes(2);
});
it("supplement authored input snippet retains caller-owned native value spread", () => {
  const s = setup({ initial: "12", customRender: true });
  s.input(0, "1234");
  expect(s.hidden().value).toBe("1234");
  expect(s.slot(0).value).toBe("1234");
  expect(s.slot(0).getAttribute("data-render-index")).toBe("0");
});
