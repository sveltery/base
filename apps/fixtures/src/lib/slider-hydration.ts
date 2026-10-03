import { hydrate } from "svelte";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import Fixture from "./SliderBrowserFixture.svelte";
import { SliderReferenceFixture } from "./slider-reference.js";
export function hydrateSlider(framework: string, scenario: string) {
  const target = document.querySelector("#hydration-host")!;
  if (framework === "react")
    hydrateRoot(target, createElement(SliderReferenceFixture, { scenario }));
  else hydrate(Fixture, { target, props: { scenario } });
}
