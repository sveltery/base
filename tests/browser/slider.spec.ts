// Pinned source-family paired scenarios and native supplements. MIT: parity/slider/UPSTREAM_LICENSE.
import { expect, test, type Page } from "@playwright/test";
async function observeParser(page: Page) {
  await page.addInitScript(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      Document.prototype,
      "currentScript",
    )!;
    const observations = { executions: 0, nonce: [] as string[] };
    Object.assign(window, { sliderParser: observations });
    Object.defineProperty(Document.prototype, "currentScript", {
      ...descriptor,
      get() {
        const script = descriptor.get!.call(this) as HTMLScriptElement | null;
        if (script?.textContent?.includes("[data-base-ui-slider-control]")) {
          observations.executions += 1;
          observations.nonce.push(script.nonce);
        }
        return script;
      },
    });
  });
}
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
async function plainLogs(page: Page) {
  return page.evaluate(
    () =>
      (
        window as unknown as {
          sliderPlain: {
            calls: Record<string, unknown>[];
            commits: Record<string, unknown>[];
          };
        }
      ).sliderPlain,
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
      "slider-root-label",
    );
    for (const input of await page.locator('input[type="range"]').all()) {
      await expect(input).toHaveAttribute(
        "aria-labelledby",
        "slider-root-label",
      );
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
  test(`${framework} Field label without a nested Slider label supplies Source aria relationship`, async ({
    page,
  }) => {
    await open(page, "range-field-label-non-native-no-local-label");
    await expect(page.locator("#slider-root")).toHaveAttribute(
      "aria-labelledby",
      "field-label",
    );
    for (const input of await page.locator('input[type="range"]').all())
      await expect(input).toHaveAttribute("aria-labelledby", "field-label");
  });
  test(`${framework} label ID change and removal resolve Source cleanup updaters against current ownership`, async ({
    page,
  }) => {
    await open(page);
    await expect(page.locator("#slider-root")).toHaveAttribute(
      "aria-labelledby",
      "slider-root-label",
    );
    await page.locator("#change-root-id").click();
    await expect(page.locator("#updated-slider-root")).toHaveAttribute(
      "aria-labelledby",
      "updated-slider-root-label",
    );
    await expect(page.locator('[data-testid="slider-label"]')).toHaveAttribute(
      "id",
      "updated-slider-root-label",
    );
    await expect(page.locator('input[type="range"]')).toHaveAttribute(
      "aria-labelledby",
      "updated-slider-root-label",
    );
    await page.locator("#toggle-label").click();
    await expect(page.locator("#updated-slider-root")).not.toHaveAttribute(
      "aria-labelledby",
    );
    await expect(page.locator('input[type="range"]')).not.toHaveAttribute(
      "aria-labelledby",
    );
    await page.locator("#toggle-label").click();
    await expect(page.locator("#updated-slider-root")).toHaveAttribute(
      "aria-labelledby",
      "updated-slider-root-label",
    );
  });
  test(`${framework} external native form association keeps Source name and canceled serialization`, async ({
    page,
  }) => {
    await open(page, "external-cancel");
    const input = page.locator('input[type="range"]');
    await expect(input).toHaveAttribute("form", "external-slider-form");
    await expect(input).toHaveAttribute("name", "fallback");
    await nativeInput(page, 0, 80);
    expect(await values(page)).toEqual([40]);
    expect(
      await page
        .locator("#external-slider-form")
        .evaluate((form) =>
          new FormData(form as HTMLFormElement).get("fallback"),
        ),
    ).toBe("40");
    expect(
      await page
        .locator("#slider-form")
        .evaluate((form) =>
          new FormData(form as HTMLFormElement).has("fallback"),
        ),
    ).toBe(false);
    expect((await list(page, "#slider-calls"))[0]).toMatchObject({
      targetName: "fallback",
      value: 80,
    });
    expect(await list(page, "#slider-commits")).toEqual([]);
  });
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
  test(`${framework} actual parent-ref and observer lifetime diagnostic keeps Source geometry separate from native framework timing`, async ({
    page,
  }, testInfo) => {
    await page.addInitScript(() => {
      const records: { event: string; node: string | null }[] = [];
      Object.assign(window, { sliderLayout: records });
      const NativeObserver = ResizeObserver;
      window.ResizeObserver = class extends NativeObserver {
        constructor(callback: ResizeObserverCallback) {
          super((entries, observer) => {
            records.push({
              event: "resize-callback",
              node: entries.map((entry) => entry.target.id).join(","),
            });
            callback(entries, observer);
          });
          records.push({ event: "observer-constructor", node: null });
        }
        observe(target: Element, options?: ResizeObserverOptions) {
          records.push({ event: "observe", node: target.id });
          super.observe(target, options);
        }
        disconnect() {
          records.push({ event: "disconnect", node: null });
          super.disconnect();
        }
      };
      const originalRect = Element.prototype.getBoundingClientRect;
      Element.prototype.getBoundingClientRect = function () {
        if (this.id === "slider-control" || this.id === "thumb-0")
          records.push({ event: "measure", node: this.id });
        return originalRect.call(this);
      };
    });
    await open(page, "edge-fresh-client");
    const initial = await page.evaluate(
      () =>
        (
          window as unknown as {
            sliderLayout: { event: string; node: string | null }[];
          }
        ).sliderLayout,
    );
    const observedControl = initial.filter(
      (record) =>
        record.event === "observe" && record.node === "slider-control",
    );
    expect(observedControl.length).toBe(framework === "react" ? 0 : 1);
    if (framework === "react") {
      expect(
        initial.findIndex(
          (record) => record.event === "input-ref" && record.node === "thumb-0",
        ),
      ).toBeLessThan(
        initial.findIndex(
          (record) =>
            record.event === "control-ref" && record.node === "slider-control",
        ),
      );
      expect(
        initial.findIndex(
          (record) =>
            record.event === "control-ref" && record.node === "slider-control",
        ),
      ).toBeLessThan(
        initial.findIndex(
          (record) => record.event === "measure" && record.node === "thumb-0",
        ),
      );
    }
    await page.locator("#slider-control").evaluate((node) => {
      node.style.width = "500px";
    });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const observation = await page.evaluate(() => ({
      records: (window as unknown as { sliderLayout: unknown }).sliderLayout,
      controlWidth: document
        .querySelector("#slider-control")!
        .getBoundingClientRect().width,
      position: Number.parseFloat(
        (
          document.querySelector("#thumb-0") as HTMLElement
        ).style.getPropertyValue("--position"),
      ),
    }));
    expect(observation.controlWidth).toBe(500);
    expect(observation.position).toBeCloseTo(
      framework === "react" ? 40.666666666666664 : 40.4,
      5,
    );
    await page.locator('input[type="range"]').press("ArrowRight");
    await expect(page.locator('input[type="range"]')).toHaveValue("41");
    const afterValueChange = await page
      .getByTestId("thumb-0")
      .evaluate((node) =>
        Number.parseFloat(node.style.getPropertyValue("--position")),
      );
    expect(afterValueChange).toBeCloseTo(41.36, 5);
    await testInfo.attach("actual-parent-ref-observer-diagnostic", {
      contentType: "application/json",
      body: JSON.stringify({
        framework,
        immutableSource: "47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c",
        initial,
        after: observation,
        afterValueChange,
      }),
    });
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
  for (const shape of ["shrink", "grow"]) {
    test(`${framework} ${shape} during drag drops mismatched cached commit`, async ({
      page,
    }) => {
      await open(page, "range-dynamic");
      await pointer(page, 0.3, false);
      expect(await values(page)).toEqual([30, 80]);
      await page.locator(`#${shape}`).evaluate((node) => node.click());
      const expected = shape === "shrink" ? [30] : [10, 40, 70];
      await expect.poll(() => values(page)).toEqual(expected);
      await page.mouse.up();
      expect(await list(page, "#slider-commits")).toEqual([]);
      expect(await values(page)).toEqual(expected);
    });
  }
  for (const cleanup of ["toggle-disabled", "toggle-present"]) {
    test(`${framework} ${cleanup} during drag removes listeners and cached commit`, async ({
      page,
    }) => {
      await open(page);
      await pointer(page, 0.7, false);
      await page.locator(`#${cleanup}`).evaluate((node) => node.click());
      const count = (await list(page, "#slider-calls")).length;
      const rect =
        cleanup === "toggle-disabled"
          ? (await page.locator("#slider-control").boundingBox())!
          : { x: 0, y: 0, width: 300, height: 20 };
      await page.mouse.move(
        rect.x + rect.width * 0.9,
        rect.y + rect.height / 2,
        { steps: 3 },
      );
      await page.mouse.up();
      expect((await list(page, "#slider-calls")).length).toBe(count);
      expect(await list(page, "#slider-commits")).toEqual([]);
    });
  }
  test(`${framework} RTL and vertical pointer geometry reaches Source bounds`, async ({
    page,
  }) => {
    for (const scenario of ["rtl", "vertical"]) {
      await open(page, scenario);
      const rect = (await page.locator("#slider-control").boundingBox())!;
      await page.mouse.click(
        scenario === "rtl" ? rect.x : rect.x + rect.width / 2,
        scenario === "vertical" ? rect.y : rect.y + rect.height / 2,
      );
      expect(await values(page)).toEqual([100]);
      await page.mouse.click(
        scenario === "rtl" ? rect.x + rect.width - 1 : rect.x + rect.width / 2,
        scenario === "vertical"
          ? rect.y + rect.height - 1
          : rect.y + rect.height / 2,
      );
      expect(await values(page)).toEqual([0]);
    }
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
  test(`${framework} max-stacked thumbs choose Source lower index`, async ({
    page,
  }) => {
    await open(page, "max-stack");
    const thumb = (await page.getByTestId("thumb-1").boundingBox())!;
    const rect = (await page.locator("#slider-control").boundingBox())!;
    await page.mouse.move(
      thumb.x + thumb.width / 2,
      thumb.y + thumb.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * 0.5, rect.y + rect.height / 2, {
      steps: 4,
    });
    await page.mouse.up();
    expect(await values(page)).toEqual([50, 100]);
    expect((await list(page, "#slider-calls")).at(-1)).toMatchObject({
      value: [50, 100],
      activeThumbIndex: 0,
    });
  });
  test(`${framework} canceled swap does not leak active index into later drag moves`, async ({
    page,
  }) => {
    await open(page, "swap-cancel");
    const thumb = (await page.getByTestId("thumb-0").boundingBox())!;
    const rect = (await page.locator("#slider-control").boundingBox())!;
    await page.mouse.move(
      thumb.x + thumb.width / 2,
      thumb.y + thumb.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * 0.7, rect.y + rect.height / 2, {
      steps: 4,
    });
    await page.mouse.move(rect.x + rect.width * 0.3, rect.y + rect.height / 2, {
      steps: 4,
    });
    await page.mouse.up();
    expect(await values(page)).toEqual([20, 40]);
    expect((await list(page, "#slider-calls")).at(-1)).toMatchObject({
      value: [30, 40],
      activeThumbIndex: 0,
    });
    expect(await list(page, "#slider-commits")).toEqual([]);
  });
  test(`${framework} controlled rejected range drag follows authoritative owner feedback after rendered callback`, async ({
    page,
  }) => {
    await open(page, "controlled-reject-push");
    const thumb = (await page.getByTestId("thumb-0").boundingBox())!;
    const rect = (await page.locator("#slider-control").boundingBox())!;
    await page.mouse.move(
      thumb.x + thumb.width / 2,
      thumb.y + thumb.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(rect.x + rect.width * 0.7, rect.y + rect.height / 2);
    await expect
      .poll(() => list(page, "#slider-calls"))
      .toContainEqual(expect.objectContaining({ value: [70, 70] }));
    await page.mouse.move(rect.x + rect.width * 0.3, rect.y + rect.height / 2);
    await page.mouse.up();
    expect(await values(page)).toEqual([20, 40]);
    expect((await list(page, "#slider-calls")).at(-1)).toMatchObject({
      value: [30, 40],
      activeThumbIndex: 0,
    });
    expect(await list(page, "#slider-commits")).toEqual([
      { value: [30, 40], reason: "drag", type: "pointerup" },
    ]);
  });
  for (const collision of ["push", "swap"] as const) {
    for (const plain of [false, true]) {
      test(`${framework} ${collision} rejected owner rapid across-tick drag ${plain ? "plain" : "reactive"} callback cache diagnostic`, async ({
        page,
      }, testInfo) => {
        await open(
          page,
          `controlled-reject-${collision}${plain ? "-plain-callback" : ""}`,
        );
        const rect = (await page.locator("#slider-control").boundingBox())!;
        const thumb = (await page.getByTestId("thumb-0").boundingBox())!;
        await page.mouse.move(
          thumb.x + thumb.width / 2,
          thumb.y + thumb.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(
          rect.x + rect.width * 0.7,
          rect.y + rect.height / 2,
        );
        await page.evaluate(async () => {
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => resolve()),
          );
        });
        await page.mouse.move(
          rect.x + rect.width * 0.3,
          rect.y + rect.height / 2,
        );
        await page.mouse.up();
        const calls = plain
          ? (await plainLogs(page)).calls
          : await list(page, "#slider-calls");
        const commits = plain
          ? (await plainLogs(page)).commits
          : await list(page, "#slider-commits");
        const last = calls.at(-1)!;
        await testInfo.attach("callback-cache-lifetime", {
          body: JSON.stringify({ framework, collision, plain, calls, commits }),
          contentType: "application/json",
        });
        expect(await values(page)).toEqual([20, 40]);
        // The measured Source plain-push callback performs no parent commit. Native tick
        // synchronization is an explicit lifecycle boundary, earning zero Source credit.
        const expected =
          collision === "swap"
            ? [20, 30]
            : framework === "react" && plain
              ? [30, 70]
              : [30, 40];
        expect(last).toMatchObject({
          value: expected,
          activeThumbIndex: collision === "swap" ? 1 : 0,
        });
        expect(commits).toEqual([
          { value: expected, reason: "drag", type: "pointerup" },
        ]);
        const formData = await page
          .locator("#slider-form")
          .evaluate((form) =>
            new FormData(form as HTMLFormElement).getAll("volume"),
          );
        expect(formData).toEqual(["20", "40"]);
      });
    }
    test(`${framework} ${collision} two pointer moves and release within one task preserve Source immediate cache`, async ({
      page,
    }, testInfo) => {
      await open(page, `controlled-reject-${collision}`);
      const rect = (await page.locator("#slider-control").boundingBox())!;
      const thumb = (await page.getByTestId("thumb-0").boundingBox())!;
      await page.mouse.move(
        thumb.x + thumb.width / 2,
        thumb.y + thumb.height / 2,
      );
      await page.mouse.down();
      await page.evaluate(
        ({ x, y, width }) => {
          for (const ratio of [0.7, 0.3])
            document.dispatchEvent(
              new PointerEvent("pointermove", {
                bubbles: true,
                pointerId: 1,
                pointerType: "mouse",
                buttons: 1,
                clientX: x + width * ratio,
                clientY: y,
              }),
            );
          document.dispatchEvent(
            new PointerEvent("pointerup", {
              bubbles: true,
              pointerId: 1,
              pointerType: "mouse",
              buttons: 0,
              clientX: x + width * 0.3,
              clientY: y,
            }),
          );
        },
        { x: rect.x, y: rect.y + rect.height / 2, width: rect.width },
      );
      await page.mouse.up();
      const calls = await list(page, "#slider-calls");
      const commits = await list(page, "#slider-commits");
      await testInfo.attach("same-task-cache", {
        body: JSON.stringify({ framework, collision, calls, commits }),
        contentType: "application/json",
      });
      expect(await values(page)).toEqual([20, 40]);
      const expected = collision === "push" ? [30, 70] : [30, 40];
      expect(calls.at(-1)).toMatchObject({
        value: expected,
        activeThumbIndex: 0,
      });
      expect(commits).toEqual([
        { value: expected, reason: "drag", type: "pointerup" },
      ]);
    });
    for (const controlled of [false, true]) {
      for (const plain of [false, true]) {
        test(`${framework} ${collision} accepted ${controlled ? "controlled" : "uncontrolled"} owner ${plain ? "plain" : "reactive"} callback remains authoritative`, async ({
          page,
        }) => {
          await open(
            page,
            `${controlled ? "controlled-" : ""}${collision}${plain ? "-plain-callback" : ""}`,
          );
          const rect = (await page.locator("#slider-control").boundingBox())!;
          const thumb = (await page.getByTestId("thumb-0").boundingBox())!;
          await page.mouse.move(
            thumb.x + thumb.width / 2,
            thumb.y + thumb.height / 2,
          );
          await page.mouse.down();
          await page.mouse.move(
            rect.x + rect.width * 0.7,
            rect.y + rect.height / 2,
          );
          await expect
            .poll(() => values(page))
            .toEqual(collision === "push" ? [70, 70] : [40, 70]);
          await page.mouse.move(
            rect.x + rect.width * 0.3,
            rect.y + rect.height / 2,
          );
          await page.mouse.up();
          const expected = collision === "push" ? [30, 70] : [30, 40];
          expect(await values(page)).toEqual(expected);
          const calls = plain
            ? (await plainLogs(page)).calls
            : await list(page, "#slider-calls");
          const commits = plain
            ? (await plainLogs(page)).commits
            : await list(page, "#slider-commits");
          expect(calls.at(-1)).toMatchObject({
            value: expected,
            activeThumbIndex: 0,
          });
          expect(commits).toEqual([
            { value: expected, reason: "drag", type: "pointerup" },
          ]);
        });
      }
    }
  }
  test(`${framework} queued owner synchronization cannot commit after same-task disposal`, async ({
    page,
  }) => {
    await open(page, "controlled-reject-push-plain-callback");
    const rect = (await page.locator("#slider-control").boundingBox())!;
    const thumb = (await page.getByTestId("thumb-0").boundingBox())!;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.mouse.move(
      thumb.x + thumb.width / 2,
      thumb.y + thumb.height / 2,
    );
    await page.mouse.down();
    await page.evaluate(
      ({ x, y }) => {
        document.dispatchEvent(
          new PointerEvent("pointermove", {
            bubbles: true,
            pointerId: 1,
            pointerType: "mouse",
            buttons: 1,
            clientX: x,
            clientY: y,
          }),
        );
        (
          document.querySelector("#toggle-present") as HTMLButtonElement
        ).click();
      },
      { x: rect.x + rect.width * 0.7, y: rect.y + rect.height / 2 },
    );
    await expect(page.locator("#slider-control")).toHaveCount(0);
    await page.mouse.up();
    expect((await plainLogs(page)).commits).toEqual([]);
    expect(errors).toEqual([]);
  });
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
        .toBeCloseTo(
          framework === "react"
            ? ((10 + (280 * initial[0]) / 100) / 300) * 100
            : ((10 + (480 * initial[0]) / 100) / 500) * 100,
          5,
        );
      await expect(page.locator("#slider-control")).toHaveJSProperty(
        scenario.includes("vertical") ? "clientHeight" : "clientWidth",
        500,
      );
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
  test(`${framework} trusted browser touch changes and commits through actual native touch boundary`, async ({
    page,
  }) => {
    await open(page);
    const rect = (await page.locator("#slider-control").boundingBox())!;
    await page.evaluate(() =>
      document.addEventListener(
        "touchstart",
        (event) => {
          Object.assign(window, { sliderTrustedTouch: event.isTrusted });
        },
        { once: true },
      ),
    );
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setTouchEmulationEnabled", {
      enabled: true,
      maxTouchPoints: 1,
    });
    const point = (percentage: number) => [
      {
        x: rect.x + rect.width * percentage,
        y: rect.y + rect.height / 2,
        id: 13,
      },
    ];
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: point(0.3),
    });
    for (const percentage of [0.4, 0.5, 0.6])
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: point(percentage),
      });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    expect(
      await page.evaluate(
        () =>
          (window as unknown as { sliderTrustedTouch: boolean })
            .sliderTrustedTouch,
      ),
    ).toBe(true);
    expect(await values(page)).toEqual([60]);
    expect(await list(page, "#slider-commits")).toEqual([
      { value: 60, reason: "drag", type: "pointerup" },
    ]);
    await session.detach();
  });
  for (const scenario of [
    "range-edge",
    "range-edge-vertical",
    "range-edge-rtl",
  ]) {
    test(`${framework} ${scenario} nonce SSR parser positions before application JavaScript and hydrates`, async ({
      page,
    }) => {
      await observeParser(page);
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
      expect(
        await page
          .locator("script")
          .evaluateAll(
            (nodes) =>
              nodes.filter((node) => node.nonce === "slider-nonce").length,
          ),
      ).toBe(1);
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
      expect(
        await page.evaluate(
          () => (window as unknown as { sliderParser: unknown }).sliderParser,
        ),
      ).toEqual({ executions: 1, nonce: ["slider-nonce"] });
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
      expect(
        await page.evaluate(
          () => (window as unknown as { sliderParser: unknown }).sliderParser,
        ),
      ).toEqual({ executions: 1, nonce: ["slider-nonce"] });
    });
  }
  test(`${framework} fresh client native insertion does not execute Source parser script`, async ({
    page,
  }) => {
    await observeParser(page);
    await open(page, "range-edge-fresh-client");
    expect(await values(page)).toEqual([20, 80]);
    expect(
      await page.evaluate(
        () => (window as unknown as { sliderParser: unknown }).sliderParser,
      ),
    ).toEqual({ executions: 0, nonce: [] });
    await expect(
      page
        .locator("script")
        .filter({ hasText: "[data-base-ui-slider-control]" }),
    ).toHaveCount(0);
    const positions = await page
      .locator('[data-testid^="thumb-"]')
      .evaluateAll((nodes) =>
        nodes.map((node) =>
          Number.parseFloat(
            (node as HTMLElement).style.getPropertyValue("--position"),
          ),
        ),
      );
    expect(positions).toEqual([expect.closeTo(22, 5), expect.closeTo(78, 5)]);
  });
}

test("native authored Slider reuses accepted typed remote Field name/as and Source custom registration/render override", async ({
  page,
}) => {
  let posts = 0;
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/_app/remote/"))
      posts += 1;
  });
  await page.goto("/slider-remote");
  await expect(page.locator("main")).toHaveAttribute("data-hydrated", "true");
  const input = page.locator('input[type="range"]');
  await expect(input).toHaveValue("40");
  await expect(input).toHaveAttribute("name", "n:settings.volume");
  await expect(page.locator("#remote-slider")).toHaveJSProperty(
    "tagName",
    "SECTION",
  );
  await page.locator("#remote-slider-disabled").click();
  await expect(input).toBeDisabled();
  expect(
    await page
      .locator("#remote-slider-form")
      .evaluate((form) =>
        new FormData(form as HTMLFormElement).has("n:settings.volume"),
      ),
  ).toBe(false);
  await page.locator("#remote-slider-disabled").click();
  await expect(input).toBeEnabled();
  await page.locator("#remote-slider-submit").click();
  await expect(page.locator("#remote-slider-error")).toHaveText("Too low");
  expect(posts).toBe(0);
  await page.locator("#remote-slider-set").click();
  await expect(input).toHaveValue("70");
  await page.locator("#remote-slider-cancel").click();
  await input.press("ArrowRight");
  await expect(input).toHaveValue("70");
  await expect(page.locator("#remote-slider-changes")).toHaveText(
    JSON.stringify([{ value: 71, name: "settings.volume" }]),
  );
  expect(
    await page
      .locator("form")
      .evaluate((form) =>
        new FormData(form as HTMLFormElement).get("n:settings.volume"),
      ),
  ).toBe("70");
  await page.locator("#remote-slider-cancel").click();
  await input.press("ArrowRight");
  await expect(input).toHaveValue("71");
  await expect(page.locator("#remote-slider-owner")).toHaveText(
    JSON.stringify({ settings: { volume: 71 } }),
  );
  await page.locator("#remote-slider-submit").click();
  await expect(page.locator("#remote-slider-result")).toHaveText(
    JSON.stringify({ values: { settings: { volume: 71 } } }),
  );
  expect(posts).toBe(1);
  await expect(page.locator("#remote-slider-enhancement")).toHaveText(
    JSON.stringify(["caller", "settled"]),
  );
});
