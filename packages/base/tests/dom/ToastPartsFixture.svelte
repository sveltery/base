<script lang="ts">
  import * as Toast from '../../src/lib/toast/index.js';
  import type { Attachment } from 'svelte/attachments';
  import { untrack } from 'svelte';
  import type { ToastContent, ToastManagerAddOptions, ToastManagerFacade, ToastObject } from '../../src/lib/toast/types.js';
  import type { PreventableEvent } from '../../src/lib/merge-props/index.js';
  import ToastPartsList from './ToastPartsList.svelte';
  let { mode = 'list', options, initialTitle = 'Toast title', initialDescription = 'Toast description', log = () => {}, preventClose = false, disabled = false, actionAttachment, closeAttachment }: {
    mode?: string; options?: ToastManagerAddOptions<object>; initialTitle?: ToastContent; initialDescription?: ToastContent;
    actionAttachment?: Attachment<HTMLButtonElement>; closeAttachment?: Attachment<HTMLButtonElement>;
    log?: (channel: string) => void; preventClose?: boolean; disabled?: boolean;
  } = $props();
  let title = $state<ToastContent>(untrack(() => initialTitle));
  let description = $state<ToastContent>(untrack(() => initialDescription));
  let labelId = $state<string>();
  let titles = $state<'old' | 'both' | 'new'>('old');
  let showContent = $state(true);
  let toast = $state<ToastObject>({id:'test',type:'success'});
  let manager: ToastManagerFacade;
  export function setTitle(value: ToastContent) { title = value; }
  export function setDescription(value: ToastContent) { description = value; }
  export function setId(value?: string) { labelId = value; }
  export function setTitles(value: 'old' | 'both' | 'new') { titles = value; }
  export function setToast(value: ToastObject) { toast = value; }
  export function removeContent() { showContent = false; }
  export function getManager() { return manager; }
  function closeClick(event: MouseEvent & PreventableEvent) { log('close-click'); if (preventClose) event.preventBaseUIHandler(); }
</script>
<Toast.Provider>
  {#if mode === 'outside'}
    <Toast.Viewport><Toast.Title /></Toast.Viewport>
  {:else if mode === 'list'}
    <ToastPartsList {options} expose={value => manager = value} onCloseClick={preventClose ? closeClick : undefined} />
  {:else}
    <Toast.Viewport data-testid="viewport">
      <Toast.Root {toast} swipeDirection={[]} data-testid="root">
        {#if mode === 'older'}
          {#if titles !== 'new'}<Toast.Title id="old-title">Old</Toast.Title>{/if}
          {#if titles !== 'old'}<Toast.Title id="new-title">New</Toast.Title>{/if}
        {:else if mode === 'content'}
          {#if showContent}<Toast.Content data-testid="content"><Toast.Title children={title} /><Toast.Description children={description} /></Toast.Content>{/if}
        {:else if mode === 'snippets'}
          <Toast.Title data-testid="title"><em>Snippet title</em></Toast.Title>
          <Toast.Description data-testid="description"><strong>Snippet description</strong></Toast.Description>
          <Toast.Action data-testid="action"><span>Snippet action</span></Toast.Action>
        {:else if mode === 'buttons'}
          <Toast.Action {@attach actionAttachment} data-testid="action" class={state => `own-${state.type}`} style="color:red" onclick={event => { log('action-part'); if (preventClose) event.preventBaseUIHandler(); }} {disabled}>Own action</Toast.Action>
          <Toast.Close {@attach closeAttachment} data-testid="close" aria-label="close-press" onclick={closeClick} {disabled} />
        {:else}
          <Toast.Title data-testid="title" children={title} id={labelId} />
          <Toast.Description data-testid="description" children={description} />
        {/if}
      </Toast.Root>
    </Toast.Viewport>
    <button type="button" onclick={() => title = null}>clear</button>
  {/if}
</Toast.Provider>
