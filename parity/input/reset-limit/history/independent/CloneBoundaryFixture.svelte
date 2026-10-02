<script>
 import Candidate from '/tmp/input-clone-reset-proof/InputCandidate.svelte';
 import Current from '/workspace/base/packages/base/src/lib/input/Input.svelte';
 let {kind='candidate',scenario='same-value-after-reset'}=$props();
 function oninput(event){const input=event.currentTarget;document.getElementById('clone-boundary-first').reset();if(scenario==='same-value-after-reset')input.value=input.value;else{input.type='hidden';input.type='text';}}
</script>
<form id="clone-boundary-first"></form><form id="clone-boundary-second"></form>
{#if kind==='native'}<input form={scenario==='same-value-after-reset'?'clone-boundary-first':'clone-boundary-second'} value="owner" defaultValue="seed" {oninput}/>
{:else if kind==='current'}<Current form={scenario==='same-value-after-reset'?'clone-boundary-first':'clone-boundary-second'} value="owner" defaultValue="seed" {oninput}/>
{:else}<Candidate form={scenario==='same-value-after-reset'?'clone-boundary-first':'clone-boundary-second'} value="owner" defaultValue="seed" {oninput}/>{/if}
