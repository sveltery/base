<script>
 import Candidate from '/tmp/input-clone-reset-proof/InputCandidate.svelte';
 import Current from '/workspace/base/packages/base/src/lib/input/Input.svelte';
 let {kind='native',direction='out',when='during'}=$props();
 function move(){document.querySelector('input').setAttribute('form',direction==='out'?'clone-second':'clone-first');}
 function onreset(event){if(when==='during')move();event.stopImmediatePropagation();}
 function oninput(event){document.getElementById('clone-first').reset();if(when==='after')move();event.currentTarget.value='post';}
</script>
<form id="clone-first" {onreset}></form><form id="clone-second"></form>
{#if kind==='native'}<input form={direction==='out'?'clone-first':'clone-second'} value="owner" defaultValue="seed" {oninput}/>
{:else if kind==='current'}<Current form={direction==='out'?'clone-first':'clone-second'} value="owner" defaultValue="seed" {oninput}/>
{:else}<Candidate form={direction==='out'?'clone-first':'clone-second'} value="owner" defaultValue="seed" {oninput}/>{/if}
