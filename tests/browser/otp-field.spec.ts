// Actual pinned Base UI1.8.0/React19.2.8 and native Svelte OTP Field witnesses (MIT).
import { expect, test, type Page } from "@playwright/test";
for (const framework of ["react", "svelte"]) {
  const open = async (page: Page, scenario = "default") => {
    await page.goto(
      `/otp-field?scenario=${scenario}${framework === "react" ? "&reference=react" : ""}`,
    );
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    if (framework === "react")
      await expect(page.locator("main")).toHaveAttribute(
        "data-renderer",
        "19.2.8/19.2.8",
      );
  };
  const slots = (page: Page) => page.locator("input[data-slot]");
  const hidden = (page: Page) => page.locator("input[aria-hidden]");
  const values = async (page: Page) =>
    slots(page).evaluateAll((inputs) =>
      inputs.map((input) => (input as HTMLInputElement).value).join(""),
    );
  const paste = async (page: Page, index: number, text: string) =>
    slots(page)
      .nth(index)
      .evaluate((node, value) => {
        const event = new Event("paste", { bubbles: true, cancelable: true });
        Object.defineProperty(event, "clipboardData", {
          value: { getData: () => value },
        });
        node.dispatchEvent(event);
      }, text);
  const calls = async (page: Page) =>
    JSON.parse(await page.locator("#calls").innerText()) as {
      phase: string;
      value: string;
      reason: string;
    }[];
  test(`${framework} OTP source defaults, metadata, SSR hydration and shared Separator`, async ({
    page,
  }) => {
    await open(page);
    await expect(slots(page)).toHaveCount(6);
    expect(await values(page)).toBe("12");
    await expect(hidden(page)).toHaveValue("12");
    await expect(hidden(page)).toHaveAttribute("name", "otp");
    await expect(hidden(page)).toHaveAttribute("pattern", "\\d{6}");
    await expect(slots(page).first()).toHaveAttribute(
      "autocomplete",
      "one-time-code",
    );
    await expect(slots(page).nth(1)).toHaveAttribute("autocomplete", "off");
    await expect(slots(page).first()).toHaveAttribute("maxlength", "6");
    await expect(slots(page).nth(1)).not.toHaveAttribute("maxlength");
    await expect(slots(page).last()).toHaveAttribute("enterkeyhint", "done");
    await expect(page.getByTestId("separator")).toHaveAttribute(
      "role",
      "separator",
    );
    const ids = await slots(page).evaluateAll((inputs) =>
      inputs.map((input) => input.id),
    );
    expect(new Set(ids).size).toBe(6);
    expect(ids[1]).toBe(`${ids[0]}-2`);
    await expect(page.locator("#label")).toHaveAttribute("for", ids[0]);
    await expect(slots(page).last()).toHaveAttribute(
      "aria-labelledby",
      "label",
    );
    await expect(page.getByTestId("root")).toHaveAttribute(
      "aria-describedby",
      "description",
    );
    expect(
      await page
        .locator("#form")
        .evaluate((form) =>
          Object.fromEntries(new FormData(form as HTMLFormElement)),
        ),
    ).toEqual({ otp: "12" });
  });
  test(`${framework} OTP native typing advances selected contiguous slots and exits by Tab`, async ({
    page,
  }) => {
    await open(page, "empty");
    await slots(page).first().click();
    await page.keyboard.type("123456");
    expect(await values(page)).toBe("123456");
    await expect(slots(page).last()).toBeFocused();
    expect(
      await slots(page)
        .last()
        .evaluate((input) => [
          (input as HTMLInputElement).selectionStart,
          (input as HTMLInputElement).selectionEnd,
        ]),
    ).toEqual([0, 1]);
    await expect(page.getByTestId("root")).toHaveAttribute("data-complete", "");
    const phases = (await calls(page)).map((call) => call.phase);
    expect(phases).toEqual([
      "change",
      "change",
      "change",
      "change",
      "change",
      "change",
      "complete",
    ]);
    await page.keyboard.press("Tab");
    await expect(page.locator("#submit")).toBeFocused();
  });
  test(`${framework} OTP arrows boundaries RTL and selected duplicate character`, async ({
    page,
  }) => {
    await open(page);
    await slots(page).first().focus();
    await page.keyboard.press("1");
    await expect(slots(page).nth(1)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(slots(page).nth(2)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(slots(page).first()).toBeFocused();
    await page.keyboard.press("End");
    await expect(slots(page).nth(2)).toBeFocused();
    await page.keyboard.press("Control+ArrowLeft");
    await expect(slots(page).first()).toBeFocused();
    await page.keyboard.press("Meta+ArrowRight");
    await expect(slots(page).nth(2)).toBeFocused();
    await open(page, "rtl");
    await slots(page).nth(1).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(slots(page).nth(2)).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(slots(page).nth(1)).toBeFocused();
  });
  test(`${framework} OTP backspace Delete clear and focus`, async ({
    page,
  }) => {
    await open(page, "complete");
    await slots(page).nth(2).focus();
    await page.keyboard.press("Delete");
    expect(await values(page)).toBe("12456");
    await expect(slots(page).nth(2)).toBeFocused();
    await page.keyboard.press("Backspace");
    expect(await values(page)).toBe("1256");
    await expect(slots(page).nth(1)).toBeFocused();
    await page.keyboard.press("Control+Backspace");
    expect(await values(page)).toBe("");
    await expect(slots(page).first()).toBeFocused();
    expect((await calls(page)).map((call) => call.reason)).toEqual([
      "keyboard",
      "keyboard",
      "keyboard",
    ]);
  });
  test(`${framework} OTP normalized paste preserves suffix and callback ordering`, async ({
    page,
  }) => {
    await open(page, "complete");
    await slots(page).nth(2).focus();
    await paste(page, 2, "9a9");
    expect(await values(page)).toBe("129956");
    await expect(slots(page).nth(4)).toBeFocused();
    expect(
      (await calls(page)).map((call) => [call.phase, call.value, call.reason]),
    ).toEqual([
      ["invalid", "9a9", "input-paste"],
      ["change", "129956", "input-paste"],
      ["complete", "129956", "input-paste"],
    ]);
    await paste(page, 0, "129956");
    expect(
      (await calls(page)).filter((call) => call.phase === "change"),
    ).toHaveLength(1);
    expect(
      (await calls(page)).filter((call) => call.phase === "complete"),
    ).toHaveLength(2);
  });
  for (const [scenario, text, expected] of [
    ["alpha", "a1BC!", "aBC"],
    ["alphanumeric", "a1BC!", "a1BC"],
    ["none", "ab!12", "ab!12"],
    ["normalize", "a1bc!", "A1BC"],
    ["restricted", "1209", "120"],
  ]) {
    test(`${framework} OTP ${scenario} filtering normalization`, async ({
      page,
    }) => {
      await open(page, scenario);
      await paste(page, 0, text);
      expect(await values(page)).toBe(expected);
      await expect(hidden(page)).toHaveValue(expected);
      expect((await calls(page)).some((call) => call.phase === "invalid")).toBe(
        scenario !== "none",
      );
    });
  }
  test(`${framework} OTP controlled owner updates and deferred acceptance`, async ({
    page,
  }) => {
    await open(page, "controlled-deferred");
    await slots(page).first().focus();
    await paste(page, 0, "123456");
    await expect(hidden(page)).toHaveValue("");
    await expect(slots(page).first()).toBeFocused();
    expect((await calls(page)).map((call) => call.phase)).toEqual(["change"]);
    await page.locator("#accept").click();
    expect(await values(page)).toBe("123456");
    await expect(slots(page).last()).toBeFocused();
    expect((await calls(page)).map((call) => call.phase)).toEqual([
      "change",
      "complete",
    ]);
    await page.locator("#owner").click();
    expect(await values(page)).toBe("654321");
    expect(
      (await calls(page)).filter((call) => call.phase === "complete"),
    ).toHaveLength(1);
  });
  test(`${framework} OTP rejected controlled and stale completion queues`, async ({
    page,
  }) => {
    await open(page, "controlled-reject");
    await slots(page).first().focus();
    await paste(page, 0, "123456");
    await expect(hidden(page)).toHaveValue("");
    await page.locator("#owner").click();
    expect(await values(page)).toBe("654321");
    expect((await calls(page)).map((call) => call.phase)).toEqual(["change"]);
  });
  test(`${framework} OTP paste cancellation preserves state and focus`, async ({
    page,
  }) => {
    await open(page, "cancel");
    await slots(page).nth(1).focus();
    await paste(page, 1, "654321");
    expect(await values(page)).toBe("12");
    await expect(hidden(page)).toHaveValue("12");
    await expect(slots(page).nth(1)).toBeFocused();
    expect(
      (await calls(page)).filter((call) => call.phase === "complete"),
    ).toHaveLength(0);
  });
  test(`${framework} OTP native canceled typing renderer witness earns zero parity credit`, async ({
    page,
  }) => {
    await open(page, "cancel");
    await slots(page).first().fill("3");
    await expect(hidden(page)).toHaveValue("12");
    expect(await values(page)).toBe(framework === "react" ? "12" : "32");
    await expect(slots(page).first()).toBeFocused();
    expect((await calls(page)).map((call) => [call.phase, call.value])).toEqual(
      [["change", "32"]],
    );
  });
  for (const scenario of ["readonly", "disabled"]) {
    test(`${framework} OTP ${scenario} guards edits and paste`, async ({
      page,
    }) => {
      await open(page, scenario);
      expect(await values(page)).toBe("12");
      await paste(page, 0, "123456");
      await expect(hidden(page)).toHaveValue("12");
      expect(await calls(page)).toEqual([]);
      if (scenario === "disabled")
        await expect(slots(page).first()).toBeDisabled();
      else {
        await slots(page).first().focus();
        await page.keyboard.press("End");
        await expect(slots(page).nth(2)).toBeFocused();
        await page.keyboard.press("Delete");
        expect(await values(page)).toBe("12");
      }
    });
  }
  test(`${framework} OTP hidden autofill and clear source focus behavior`, async ({
    page,
  }) => {
    await open(page, "empty");
    await hidden(page).evaluate((input) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "12a3456");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(await values(page)).toBe("123456");
    await expect(slots(page).last()).toBeFocused();
    expect((await calls(page)).map((call) => call.phase)).toEqual([
      "invalid",
      "change",
      "complete",
    ]);
    await hidden(page).evaluate((input) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "");
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(await values(page)).toBe("");
    await expect(slots(page).last()).toBeFocused();
  });
  test(`${framework} OTP Field focus containment touched validation and Form values`, async ({
    page,
  }) => {
    await open(page, "onblur");
    await slots(page).first().focus();
    await slots(page).first().fill("123");
    await slots(page).nth(1).focus();
    await expect(page.locator("#validations")).toHaveText("[]");
    await page.locator("#after").focus();
    await expect(page.locator("#validations")).toHaveText('["123"]');
    await expect(page.getByTestId("field")).toHaveAttribute("data-touched", "");
    await expect(page.getByTestId("error")).toHaveText("Error: 123");
    await expect(page.getByTestId("root")).not.toHaveAttribute("data-focused");
    await page.locator("#submit").click();
    await expect(page.locator("#submissions")).toHaveText("[]");
    await expect(slots(page).first()).toBeFocused();
  });
  test(`${framework} OTP completion auto-submits settled Form value`, async ({
    page,
  }) => {
    await open(page, "auto-submit");
    await slots(page).first().fill("123456");
    await expect(page.locator("#submissions")).toHaveText('[{"otp":"123456"}]');
    expect((await calls(page)).map((call) => call.phase)).toEqual([
      "change",
      "complete",
    ]);
  });
  test(`${framework} OTP explicit external form owns submission and serialization`, async ({
    page,
  }) => {
    await open(page, "external-form");
    await slots(page).first().fill("123456");
    await expect(page.locator("#submissions")).toHaveText('[{"otp":"123456"}]');
    expect(
      await page
        .locator("#form")
        .evaluate((form) => [
          ...new FormData(form as HTMLFormElement).entries(),
        ]),
    ).toEqual([]);
  });
  test(`${framework} OTP mask, native labels, group-only aria label and slot override`, async ({
    page,
  }) => {
    await open(page, "mask");
    await expect(slots(page).first()).toHaveAttribute("type", "password");
    await expect(hidden(page)).toHaveAttribute("type", "text");
    await open(page, "native-label");
    await expect(slots(page).last()).toHaveAttribute("aria-labelledby", /.+/);
    await page.locator("label").click();
    await expect(slots(page).first()).toBeFocused();
    await open(page, "aria-group");
    await expect(page.getByTestId("root")).toHaveAttribute(
      "aria-labelledby",
      "external-label",
    );
    await expect(slots(page).first()).not.toHaveAttribute("aria-labelledby");
    await open(page, "aria-slot");
    await expect(slots(page).first()).not.toHaveAttribute("aria-label");
    await expect(slots(page).last()).toHaveAttribute("aria-label", "Slot code");
    await expect(slots(page).last()).not.toHaveAttribute("aria-labelledby");
  });
  test(`${framework} OTP grouped slots render host overrides reorder and teardown`, async ({
    page,
  }) => {
    await open(page, "grouped");
    expect(await values(page)).toBe("12");
    await expect(page.locator("[data-group]")).toHaveCount(6);
    await open(page, "render");
    await expect(page.getByTestId("root")).toHaveJSProperty(
      "tagName",
      "SECTION",
    );
    await page.locator("#reorder").click();
    await expect(slots(page).first()).toHaveAttribute("data-slot", "5");
    expect(await values(page)).toBe("12");
    await slots(page).first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(slots(page).nth(1)).toBeFocused();
    await page.locator("#remove").click();
    await expect(slots(page)).toHaveCount(0);
    await page.locator("#submit").click();
    await expect(page.locator("#submissions")).toHaveText("[{}]");
  });
  for (const phase of ["focus", "blur"]) {
    test(`${framework} OTP native ${phase} cancellation witness earns zero parity credit`, async ({
      page,
    }) => {
      await open(page, `${phase}-default`);
      await slots(page).first().focus();
      if (phase === "blur") await page.locator("#after").focus();
      const expectedFocused =
        phase === "focus" ? framework === "svelte" : framework === "react";
      expect(
        await page
          .getByTestId("root")
          .evaluate((root) => root.hasAttribute("data-focused")),
      ).toBe(expectedFocused);
      await open(page, `${phase}-base`);
      await slots(page).first().focus();
      if (phase === "blur") await page.locator("#after").focus();
      expect(
        await page
          .getByTestId("root")
          .evaluate((root) => root.hasAttribute("data-focused")),
      ).toBe(phase === "blur");
    });
  }
  test(`${framework} OTP native composition input preserves pinned filtering without IME engine`, async ({
    page,
  }) => {
    await open(page, "empty");
    await slots(page)
      .first()
      .evaluate((input) => {
        input.dispatchEvent(
          new CompositionEvent("compositionstart", { bubbles: true, data: "" }),
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
    await expect(hidden(page)).toHaveValue("1");
    expect((await calls(page)).map((call) => call.phase)).toEqual([
      "invalid",
      "change",
    ]);
  });
  test(`${framework} OTP required incomplete submit blocks then full value submits`, async ({
    page,
  }) => {
    await open(page, "required");
    await page.locator("#submit").click();
    await expect(page.locator("#submissions")).toHaveText("[]");
    await slots(page).first().fill("123456");
    await page.locator("#submit").click();
    await expect(page.locator("#submissions")).toHaveText('[{"otp":"123456"}]');
  });
}
