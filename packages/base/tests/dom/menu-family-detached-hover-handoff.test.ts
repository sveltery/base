// Authored actual Original/native regression; zero unchanged Original declaration credit.
import { React, createRoot, flushSync, Menu, originalMenuPointerType } from '../../../../apps/fixtures/src/lib/menu-family-probe-original.js';
import { expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';
import Fixture from './fixtures/MenuDetachedHoverHandoff.svelte';
async function settle(){await tick();await new Promise(r=>setTimeout(r,80));await tick();}
for(const source of [true,false])it(`${source?'Original':'native'} public detached trigger shares popup pointer modality`,async()=>{
 const target=document.createElement('div');document.body.append(target);let stop:()=>unknown;let pointerType:()=>unknown;let change:()=>unknown;
 if(source){
  const root=createRoot(target);const first=Menu.createHandle();const second=Menu.createHandle();let handle=first;
  const e=React.createElement;
  const popup=(owner:ReturnType<typeof Menu.createHandle>,label:string)=>e(Menu.Root,{handle:owner,defaultOpen:true},e(Menu.Portal,null,e(Menu.Positioner,null,e(Menu.Popup,null,e(Menu.Item,null,label)))));
  const render=()=>flushSync(()=>root.render(e(React.Fragment,null,e(Menu.Trigger,{handle,id:'detached-hover',openOnHover:true},'Open'),popup(first,'First'),popup(second,'Second'))));
  render();change=()=>{handle=second;render();};pointerType=()=>originalMenuPointerType(handle);stop=()=>flushSync(()=>root.unmount());
 }
 else{const instance=mount(Fixture,{target});pointerType=instance.pointerType;change=instance.switchHandle;stop=()=>unmount(instance);}
 try{await settle();change();await settle();const trigger=document.getElementById('detached-hover')!;const event=new MouseEvent('pointerdown',{bubbles:true});Object.defineProperty(event,'pointerType',{value:'touch'});trigger.dispatchEvent(event);await settle();console.log(JSON.stringify({framework:source?'Original':'native',pointerType:pointerType()??null}));expect(pointerType()).toBe('touch');}finally{await stop();await settle();target.remove();}
});
