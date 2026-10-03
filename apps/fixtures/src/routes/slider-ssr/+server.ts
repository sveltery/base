import { render } from "svelte/server";
import { renderToString } from "react-dom/server";
import { createElement } from "react";
import Fixture from "../../lib/SliderBrowserFixture.svelte";
import { SliderReferenceFixture } from "../../lib/slider-reference.js";
const styles =
  '#slider-control{position:relative;touch-action:none;margin:30px}#slider-control.horizontal{width:300px;height:20px}#slider-control.vertical{width:20px;height:300px}#slider-track{width:100%;height:100%;background:#ddd}#slider-indicator{background:#88f}[data-testid^="thumb-"]{width:20px;height:20px;background:blue}';
export function GET({ url }: { url: URL }) {
  const framework = url.searchParams.get("framework") ?? "svelte";
  const scenario = url.searchParams.get("scenario") ?? "range-edge";
  const body =
    framework === "react"
      ? renderToString(createElement(SliderReferenceFixture, { scenario }))
      : render(Fixture, { props: { scenario } }).body;
  const hydrate = url.searchParams.get("hydrate") === "true";
  const loader = hydrate
    ? `<script nonce="slider-nonce" type="module">import { hydrateSlider } from '/src/lib/slider-hydration.ts';hydrateSlider(${JSON.stringify(framework)},${JSON.stringify(scenario)});</script>`
    : "";
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><style>${styles}</style></head><body><div id="hydration-host">${body}</div>${loader}</body></html>`,
    {
      headers: {
        "content-type": "text/html",
        "content-security-policy":
          "default-src 'self'; script-src 'nonce-slider-nonce' 'strict-dynamic'; style-src 'unsafe-inline'; connect-src 'self' ws:;",
      },
    },
  );
}
