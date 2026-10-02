<script>
 import Input from '/tmp/input-clone-reset-proof/InputCandidate.svelte';
 import {flushSync,untrack} from '/workspace/base/packages/base/node_modules/svelte/src/index-client.js';
 import {createAttachmentKey} from '/workspace/base/packages/base/node_modules/svelte/src/attachments/index.js';
 let {native=false,move='none',stop=false,cancel=false,attachment='none',replacement=false,imperative=false}=$props();
 let form=$state(untrack(()=>move==='in'?'second':'first'));
 const key=createAttachmentKey();
 function associate(next){if(imperative)document.querySelector('input').setAttribute('form',next);else{form=next;flushSync();}}
 function resetHandler(event){
  if(move==='out') associate('second');
  if(move==='in') associate('first');
  if(cancel) event.preventDefault();
  if(stop==='propagation')event.stopPropagation();else if(stop) event.stopImmediatePropagation();
 }
 function run(){document.getElementById('first').reset();if(move==='after')associate('second');}
 function attached(node){const fn=()=>run();const capture=attachment==='capture';node.addEventListener('input',fn,capture);return()=>node.removeEventListener('input',fn,capture);}
 function oninput(){if(attachment==='none')run();}
</script>
{#snippet rendered(props)}<input {...{[key]:attached,...props}}/>{/snippet}
<form id="first" onreset={resetHandler}></form><form id="second"></form>
{#if native}
 <input {form} value="owner" defaultValue="seed" {oninput} {...(attachment==='none'?{}:{[key]:attached})}/>
{:else}
 <Input {form} value="owner" defaultValue="seed" {oninput} render={replacement?rendered:undefined} {...(attachment==='none'||replacement?{}:{[key]:attached})}/>
{/if}
