import { form } from "$app/server";
type Values = { settings: { volume: number } };
const schema = {
  "~standard": {
    version: 1 as const,
    vendor: "slider-remote-fixture",
    types: undefined as unknown as { input: Values; output: Values },
    validate(
      value: unknown,
    ): { value: Values } | { issues: { message: string; path: string[] }[] } {
      const volume = (value as Values | undefined)?.settings?.volume;
      return typeof volume === "number" && volume >= 0 && volume <= 100
        ? { value: { settings: { volume } } }
        : {
            issues: [
              {
                message: "Volume must be numeric",
                path: ["settings", "volume"],
              },
            ],
          };
    },
  },
};
export const volumeForm = form(schema, async (values) => ({ values }));
