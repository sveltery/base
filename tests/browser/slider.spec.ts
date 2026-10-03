// Pinned source-family paired scenarios and native supplements. MIT: parity/slider/UPSTREAM_LICENSE.
import { expect, test, type Page } from "@playwright/test";
async function list(page: Page, id: string) {
  return JSON.parse(await page.locator(id).innerText()) as Record<
    string,
    unknown
  >[];
}
async function values(page: Page) {
  return page
    .locator('input[type="range"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLInputElement).valueAsNumber),
    );
}
async function nativeInput(page: Page, index: number, value: number) {
  await page
    .locator('input[type="range"]')
    .nth(index)
    .evaluate((input, value) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, String(value));
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
}
async function pointer(page: Page, percentage: number, release = true) {
  const rect = await page.locator("#slider-control").boundingBox();
  expect(rect).not.toBeNull();
  await page.mouse.move(
    rect!.x + rect!.width * percentage,
    rect!.y + rect!.height / 2,
  );
  await page.mouse.down();
  if (release) await page.mouse.up();
}
for (const framework of ["react", "svelte"]) {
  const open = async (page: Page, scenario = "default") => {
    await page.goto(
      `/slider?scenario=${scenario}${framework === "react" ? "&reference=react" : ""}`,
    );
    await expect(page.locator('main[data-hydrated="true"]')).toBeVisible();
    if (framework === "react")
      await expect(page.locator("main")).toHaveAttribute(
        "data-renderer",
        "19.2.8/19.2.8",
      );
  };
  test(`${framework} all Slider parts expose state, labels, registered output and native FormData`, async ({
    page,
  }) => {
    await open(page, "range-field-label-snippet");
    expect(await values(page)).toEqual([20, 80]);
    await expect(page.locator("#slider-root")).toHaveAttribute("role", "group");
    await expect(page.locator("#slider-root")).toHaveAttribute(
      "aria-labelledby",
      "field-label",
    );
    for (const input of await page.locator('input[type="range"]').all()) {
      await expect(input).toHaveAttribute("aria-labelledby", "field-label");
      await expect(input).toHaveAttribute(
        "aria-describedby",
        "slider-description",
      );
      await expect(input).toHaveAttribute("name", "volume");
    }
    await expect(page.locator("#slider-value")).toHaveText("20 – 80");
    await expect(page.locator("#slider-value")).toHaveAttribute(
      "aria-live",
      "off",
    );
    await expect(page.locator("#custom-value")).toHaveText("20/80/20/80");
    const ids = await page
      .locator('input[type="range"]')
      .evaluateAll((nodes) => nodes.map((node) => node.id).join(" "));
    await expect(page.locator("#slider-value")).toHaveAttribute("for", ids);
    expect(
      await page
        .locator("#slider-form")
        .evaluate((form) =>
          new FormData(form as HTMLFormElement).getAll("volume"),
        ),
    ).toEqual(["20", "80"]);
    await page.locator("#slider-submit").click();
    await expect
      .poll(() => list(page, "#slider-submissions"))
      .toEqual([{ volume: [20, 80] }]);
  });
  for (const scenario of ["default", "rtl", "vertical", "fractional", "step"]) {
    test(`${framework} ${scenario} keyboard steps Home End Page and Shift preserve reason/order/target`, async ({
      page,
    }) => {
      await open(page, scenario);
      const input = page.locator('input[type="range"]').first();
      await input.focus();
      await input.press(scenario === "rtl" ? "ArrowLeft" : "ArrowRight");
      const expected =
        scenario === "fractional" ? 0.4 : scenario === "step" ? 45 : 41;
      await expect(input).toHaveValue(String(expected));
      const calls = await list(page, "#slider-calls");
      expect(calls[0]).toMatchObject({
        value: expected,
        reason: "keyboard",
        type: "keydown",
        activeThumbIndex: 0,
        targetValue: expected,
        targetName: "volume",
        eventClass: "KeyboardEvent",
      });
      expect(await list(page, "#slider-commits")).toEqual([
        { value: expected, reason: "keyboard", type: "keydown" },
      ]);
      await input.press("PageUp");
      await expect(input).toHaveValue(
        String(scenario === "fractional" ? 0.9 : expected + 10),
      );
      await input.press("Shift+ArrowUp");
      await expect(input).toHaveValue(
        String(scenario === "fractional" ? 1.4 : expected + 20),
      );
      await input.press("Home");
      await expect(input).toHaveValue(scenario === "fractional" ? "-1" : "0");
      await input.press("End");
      await expect(input).toHaveValue(scenario === "fractional" ? "2" : "100");
    });
  }
  test(`${framework} range keyboard obeys neighbour bounds and minimum steps`, async ({
    page,
  }) => {
    await open(page, "range-spacing");
    const inputs = page.locator('input[type="range"]');
    await inputs.nth(0).press("End");
    expect(await values(page)).toEqual([75, 80]);
    await inputs.nth(1).press("Home");
    expect(await values(page)).toEqual([75, 80]);
    const count = (await list(page, "#slider-calls")).length;
    await inputs.nth(0).press("ArrowRight");
    expect(await values(page)).toEqual([75, 80]);
    expect((await list(page, "#slider-calls")).length).toBe(count);
  });
  for (const scenario of [
    "cancel",
    "controlled",
    "controlled-reject",
    "key-cancel",
  ]) {
    test(`${framework} ${scenario} keyboard ownership cancellation and serialization`, async ({
      page,
    }) => {
      await open(page, scenario);
      await page.locator('input[type="range"]').press("ArrowRight");
      const applied = scenario === "controlled";
      expect(await values(page)).toEqual([applied ? 41 : 40]);
      expect(
        await page
          .locator("#slider-form")
          .evaluate((form) =>
            new FormData(form as HTMLFormElement).get("volume"),
          ),
      ).toBe(applied ? "41" : "40");
      if (scenario === "key-cancel") {
        expect(await list(page, "#slider-calls")).toEqual([]);
        expect(await list(page, "#slider-commits")).toEqual([]);
      } else {
        expect((await list(page, "#slider-calls")).length).toBe(1);
        expect((await list(page, "#slider-commits")).length).toBe(
          scenario === "cancel" ? 0 : 1,
        );
      }
      await page.locator("#set-owner").click();
      if (scenario.startsWith("controlled"))
        expect(await values(page)).toEqual([60]);
    });
  }
  for (const scenario of ["default", "cancel", "controlled-reject"]) {
    test(`${framework} ${scenario} actual hidden input event preserves Source cancellation and FormData`, async ({
      page,
    }) => {
      await open(page, scenario);
      await nativeInput(page, 0, 80);
      const expected = scenario === "default" ? 80 : 40;
      expect(await values(page)).toEqual([expected]);
      expect(
        await page
          .locator("#slider-form")
          .evaluate((form) =>
            new FormData(form as HTMLFormElement).get("volume"),
          ),
      ).toBe(String(expected));
      expect(await list(page, "#slider-calls")).toEqual([
        expect.objectContaining({
          value: 80,
          reason: "input-change",
          activeThumbIndex: 0,
          targetName: "volume",
          targetValue: 80,
        }),
      ]);
      expect((await list(page, "#slider-commits")).length).toBe(
        scenario === "cancel" ? 0 : 1,
      );
    });
  }
  test(`${framework} track press then drag commits only actual last applied pointer value`, async ({
    page,
  }) => {
    await open(page);
    await pointer(page, 0.7, false);
    await expect(page.locator('input[type="range"]')).toHaveValue("70");
    await expect(page.locator("#slider-control")).toHaveAttribute(
      "data-dragging",
      "",
    );
    expect(await list(page, "#slider-commits")).toEqual([]);
    const rect = (await page.locator("#slider-control").boundingBox())!;
    await page.mouse.move(rect.x + rect.width * 0.9, rect.y + rect.height / 2, {
      steps: 4,
    });
    await page.mouse.up();
    await expect(page.locator('input[type="range"]')).toHaveValue("90");
    await expect(page.locator("#slider-control")).not.toHaveAttribute(
      "data-dragging",
    );
    expect((await list(page, "#slider-calls"))[0]).toMatchObject({
      value: 70,
      reason: "track-press",
      type: "pointerdown",
    });
    expect((await list(page, "#slider-calls")).at(-1)).toMatchObject({
      value: 90,
      reason: "drag",
    });
    expect(await list(page, "#slider-commits")).toEqual([
      { value: 90, reason: "drag", type: "pointerup" },
    ]);
  });
  for (const behavior of ["push", "swap", "none"]) {
    test(`${framework} ${behavior} thumb collision preserves source pointer algorithm`, async ({
      page,
    }) => {
      await open(page, behavior);
      const thumb = await page.getByTestId("thumb-0").boundingBox();
      const rect = (await page.locator("#slider-control").boundingBox())!;
      await page.mouse.move(
        thumb!.x + thumb!.width / 2,
        thumb!.y + thumb!.height / 2,
      );
      await page.mouse.down();
      await page.mouse.move(
        rect.x + rect.width * 0.7,
        rect.y + rect.height / 2,
        { steps: 5 },
      );
      await page.mouse.up();
      expect(await values(page)).toEqual(
        behavior === "push"
          ? [70, 70]
          : behavior === "swap"
            ? [40, 70]
            : [40, 40],
      );
      const commits = await list(page, "#slider-commits");
      expect(commits.at(-1)).toMatchObject({ reason: "drag" });
      if (behavior === "swap")
        expect((await list(page, "#slider-calls")).at(-1)).toMatchObject({
          activeThumbIndex: 1,
        });
    });
  }
  for (const scenario of [
    "disabled",
    "field-disabled",
    "thumb-disabled",
    "handler-cancel",
    "cancel",
  ]) {
    test(`${framework} ${scenario} guards pointer/keyboard and suppresses canceled commits`, async ({
      page,
    }) => {
      await open(page, scenario);
      await pointer(page, 0.8);
      expect(await values(page)).toEqual([40]);
      expect(await list(page, "#slider-commits")).toEqual([]);
      if (scenario !== "cancel")
        expect(await list(page, "#slider-calls")).toEqual([]);
    });
  }
  test(`${framework} onBlur validates once outside all thumbs and real Form rejects invalid then accepts valid`, async ({
    page,
  }) => {
    await open(page, "range-onblur");
    const inputs = page.locator('input[type="range"]');
    await inputs.nth(0).focus();
    await inputs.nth(1).focus();
    await expect(page.locator("#slider-validation-calls")).toHaveText("0");
    await page.locator("#slider-outside").focus();
    await expect(page.locator("#slider-field")).toHaveAttribute(
      "data-touched",
      "",
    );
    await expect(page.locator("#slider-validation-calls")).toHaveText("1");
    await expect(page.locator("#slider-error")).toHaveText("Too low");
    await page.locator("#slider-submit").click();
    expect(await list(page, "#slider-submissions")).toEqual([]);
    await inputs.nth(0).press("End");
    await page.locator("#slider-outside").focus();
    await expect(page.locator("#slider-error")).toHaveCount(0);
    await page.locator("#slider-submit").click();
    expect(await list(page, "#slider-submissions")).toEqual([
      { volume: [80, 80] },
    ]);
  });
  test(`${framework} custom rendering, host replacement, ref cleanup and output map update`, async ({
    page,
  }) => {
    await open(page, "range-render-dynamic");
    await expect(page.locator("#slider-root")).toHaveJSProperty(
      "tagName",
      "SECTION",
    );
    await expect(page.getByTestId("thumb-0")).toHaveJSProperty(
      "tagName",
      "SECTION",
    );
    await page.locator("#replace-host").click();
    await expect(page.locator("#slider-root")).toHaveJSProperty(
      "tagName",
      "SPAN",
    );
    await page.locator('input[type="range"]').nth(1).press("ArrowLeft");
    expect(await values(page)).toEqual([20, 79]);
    await page.locator("#shrink").click();
    expect(await values(page)).toEqual([30]);
    const id = await page.locator('input[type="range"]').getAttribute("id");
    await expect(page.locator("#slider-value")).toHaveAttribute("for", id!);
    await page.locator("#grow").click();
    expect(await values(page)).toEqual([10, 40, 70]);
    await expect
      .poll(
        async () =>
          (await page.locator("#slider-value").getAttribute("for"))!.split(" ")
            .length,
      )
      .toBe(3);
    await page.locator("#toggle-present").click();
    await expect(page.locator('input[type="range"]')).toHaveCount(0);
    const refs = JSON.parse(
      await page.locator("#slider-refs").innerText(),
    ) as string[];
    expect(
      refs.filter((value) => value.startsWith("cleanup:")).length,
    ).toBeGreaterThan(0);
    await page.locator("#toggle-present").click();
    expect(await values(page)).toEqual([10, 40, 70]);
  });
  for (const scenario of [
    "edge",
    "range-edge",
    "range-edge-vertical",
    "range-edge-rtl",
    "edge-client",
  ]) {
    test(`${framework} ${scenario} native layout measures inset geometry and resizes without script rerun`, async ({
      page,
    }) => {
      await open(page, scenario);
      const positions = await page
        .locator('[data-testid^="thumb-"]')
        .evaluateAll((nodes) =>
          nodes.map((node) =>
            Number.parseFloat(
              (node as HTMLElement).style.getPropertyValue("--position"),
            ),
          ),
        );
      const initial = scenario.includes("range") ? [20, 80] : [40];
      for (let index = 0; index < positions.length; index += 1)
        expect(positions[index]).toBeCloseTo(
          ((10 + (280 * initial[index]) / 100) / 300) * 100,
          5,
        );
      await expect(page.locator('script[nonce="slider-nonce"]')).toHaveCount(0);
      await page.locator("#slider-control").evaluate((node) => {
        node.style[node.classList.contains("vertical") ? "height" : "width"] =
          "500px";
      });
      await expect
        .poll(async () =>
          Number.parseFloat(
            await page
              .getByTestId("thumb-0")
              .evaluate((node) => node.style.getPropertyValue("--position")),
          ),
        )
        .toBeCloseTo(((10 + (480 * initial[0]) / 100) / 500) * 100, 5);
    });
  }
  test(`${framework} real touchstart/move/end uses source touch id and commits`, async ({
    page,
  }) => {
    await open(page);
    await page.locator("#slider-control").evaluate((control) => {
      const rect = control.getBoundingClientRect();
      const touch = (x: number, identifier = 7) =>
        new Touch({
          identifier,
          target: control,
          clientX: rect.left + rect.width * x,
          clientY: rect.top + rect.height / 2,
        });
      control.dispatchEvent(
        new TouchEvent("touchstart", {
          bubbles: true,
          changedTouches: [touch(0.3)],
          touches: [touch(0.3)],
        }),
      );
      document.dispatchEvent(
        new TouchEvent("touchmove", {
          bubbles: true,
          changedTouches: [touch(0.6)],
          touches: [touch(0.6)],
        }),
      );
      document.dispatchEvent(
        new TouchEvent("touchend", {
          bubbles: true,
          changedTouches: [touch(0.6)],
        }),
      );
    });
    expect(await values(page)).toEqual([60]);
    expect(await list(page, "#slider-commits")).toEqual([
      { value: 60, reason: "drag", type: "touchend" },
    ]);
  });
  for (const scenario of [
    "range-edge",
    "range-edge-vertical",
    "range-edge-rtl",
  ]) {
    test(`${framework} ${scenario} nonce SSR parser positions before application JavaScript and hydrates`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning")
          errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(
        `/slider-ssr?framework=${framework}&scenario=${scenario}`,
      );
      await expect(page.locator("main")).toHaveAttribute(
        "data-hydrated",
        "false",
      );
      await expect(page.locator('script[nonce="slider-nonce"]')).toHaveCount(1);
      const before = await page
        .locator('[data-testid^="thumb-"]')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            position: (node as HTMLElement).style.getPropertyValue(
              "--position",
            ),
            visibility: getComputedStyle(node).visibility,
          })),
        );
      expect(before.map((value) => Number.parseFloat(value.position))).toEqual([
        expect.closeTo(22, 5),
        expect.closeTo(78, 5),
      ]);
      expect(before.map((value) => value.visibility)).toEqual([
        "visible",
        "visible",
      ]);
      expect(errors).toEqual([]);
      await page.goto(
        `/slider-ssr?framework=${framework}&scenario=${scenario}&hydrate=true`,
      );
      await expect(page.locator("main")).toHaveAttribute(
        "data-hydrated",
        "true",
      );
      expect(await values(page)).toEqual([20, 80]);
      await expect(
        page.locator('script[nonce="slider-nonce"]:not([type="module"])'),
      ).toHaveCount(0);
      const after = await page
        .locator('[data-testid^="thumb-"]')
        .evaluateAll((nodes) =>
          nodes.map((node) =>
            Number.parseFloat(
              (node as HTMLElement).style.getPropertyValue("--position"),
            ),
          ),
        );
      expect(after).toEqual([expect.closeTo(22, 5), expect.closeTo(78, 5)]);
      expect(errors).toEqual([]);
    });
  }
}
