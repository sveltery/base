// Pinned Root SSR contracts and separately named native supplements; MIT.
import { expect, it } from "vitest";
import { render } from "svelte/server";
import Fixture from "./ssr/OTPField.svelte";
it("Root:1439 SSR visible slots have unique IDs and stable suffix relationships", () => {
  const html = render(Fixture).body;
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((match) => match[1]);
  expect(new Set(ids).size).toBe(ids.length);
  const slotIds = ids.filter(
    (id) => id.startsWith("base-ui-") && !id.endsWith("-hidden-input"),
  );
  expect(slotIds.length).toBe(8);
  expect(slotIds[1]).toBe(`${slotIds[0]}-2`);
  expect(html).toContain('for="' + slotIds[0] + '"');
});
it("Root:167/1460 SSR hidden validation markup normalizes whole value and pattern", () => {
  const html = render(Fixture).body;
  expect(html).toContain('name="code"');
  expect(html).toContain('value="a1B2"');
  expect(html).toContain('minlength="4"');
  expect(html).toContain('maxlength="4"');
  expect(html).toContain('pattern="[a-zA-Z0-9]{4}"');
});
it("supplement native React17 substitution generates IDs on server, preserving source UTF16 slot quirk", () => {
  const html = render(Fixture).body;
  expect(html).toContain("-hidden-input");
  // Original normalization clamps code points, but slots use string[index] and completion uses string.length.
  expect(html).toContain('value="😀x"');
  expect(html).not.toContain("data-value=");
  const lastGroup = [...html.matchAll(/<div\b[^>]*role="group"[^>]*>/g)].at(
    -1,
  )![0];
  expect(lastGroup).not.toContain("data-complete");
});
