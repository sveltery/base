<script lang="ts">
  // Derived test scenarios: Base UI v1.8.0, 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
  import { untrack, type Snippet } from 'svelte';
  import { mergeProps } from '../../src/lib/merge-props/index.js';
  import type { HTMLImgAttributes, HTMLAttributes } from 'svelte/elements';
  import { Avatar, type AvatarImageProps, type AvatarFallbackProps, type AvatarRootState, type AvatarImageState, type AvatarFallbackState } from '../../src/lib/avatar/index.js';
  let { imageProps = {}, fallbackProps = {}, withImage = true, withFallback = true, fallbackText = 'JD', scenario = 'default', observeProps }: {
    imageProps?: AvatarImageProps; fallbackProps?: AvatarFallbackProps; withImage?: boolean; withFallback?: boolean; fallbackText?: string; scenario?: string;
    observeProps?: (props: Record<string | symbol, unknown>) => void;
  } = $props();
  let image = $state(untrack(() => imageProps));
  let fallback = $state(untrack(() => fallbackProps));
  let imageMounted = $state(untrack(() => withImage));
  let allMounted = $state(true);
  let renderSrc = $state('avatar-1.png');
  let renderClass = $state('initial');
  let rootRef = $state<HTMLElement | null>();
  let imageRef = $state<HTMLElement | null>();
  let fallbackRef = $state<HTMLElement | null>();
  let customTag = $state('section');
  const states: { part: string; status: AvatarRootState['imageLoadingStatus'] }[] = [];
  function record(part: string, state: AvatarRootState) { states.push({ part, status: state.imageLoadingStatus }); return ''; }
  export function updateImage(props: Partial<AvatarImageProps>) { image = { ...image, ...props }; }
  export function updateFallback(props: Partial<AvatarFallbackProps>) { fallback = { ...fallback, ...props }; }
  export function showImage(value: boolean) { imageMounted = value; }
  export function changeRenderSource(value: string) { renderSrc = value; }
  export function changeRenderClass(value: string) { renderClass = value; }
  export function replaceHost() { customTag = 'article'; }
  export function remove() { allMounted = false; }
  export function refs() { return [rootRef, imageRef, fallbackRef]; }
  export function recordedStates() { return states; }
</script>
{#snippet imageReplacement(props: Record<string | symbol, unknown>, state: AvatarImageState)}
  {observeProps?.(props) ?? ''}
  {#if scenario === 'drop-ref'}
    <img alt="" data-testid="image" src={renderSrc} {...mergeProps(Object.fromEntries(Object.entries(props)), { class: renderClass }) as HTMLImgAttributes} />
  {:else}
    <img alt="" data-testid="image" sizes="48px" src={scenario === 'render-props' ? 'avatar.png' : renderSrc} srcset="avatar.png 1x" {...mergeProps(props, { class: renderClass }) as HTMLImgAttributes} data-render-status={state.imageLoadingStatus} />
  {/if}
{/snippet}
{#snippet rootReplacement(props: Record<string | symbol, unknown>, state: AvatarRootState, children: Snippet | undefined)}
  <svelte:element this={customTag} {...props as HTMLAttributes<HTMLElement>} data-render-status={state.imageLoadingStatus}>{@render children?.()}</svelte:element>
{/snippet}
{#snippet fallbackReplacement(props: Record<string | symbol, unknown>, state: AvatarFallbackState, children: Snippet | undefined)}
  <svelte:element this={customTag} {...props as HTMLAttributes<HTMLElement>} data-render-status={state.imageLoadingStatus}>{@render children?.()}</svelte:element>
{/snippet}
{#if allMounted}
  <Avatar.Root data-testid="root" bind:ref={rootRef} render={scenario === 'conformance-root' ? rootReplacement : undefined} class={state => `root-${state.imageLoadingStatus}${record('root', state)}`}>
    {#if imageMounted}
      <Avatar.Image data-testid="image" bind:ref={imageRef} {...image} render={['render-source', 'render-props', 'drop-ref', 'ordered'].includes(scenario) ? imageReplacement : image.render}
        class={image.class ?? (state => `image-${state.imageLoadingStatus}${record('image', state)}`)} />
    {/if}
    {#if withFallback}
      <Avatar.Fallback data-testid="fallback" bind:ref={fallbackRef} {...fallback} render={scenario === 'conformance-fallback' ? fallbackReplacement : fallback.render}
        class={fallback.class ?? (state => `fallback-${state.imageLoadingStatus}${record('fallback', state)}`)}>{fallbackText}</Avatar.Fallback>
    {/if}
  </Avatar.Root>
{/if}
