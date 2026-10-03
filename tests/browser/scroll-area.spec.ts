// Actual React19.2.8/Base UI1.8.0 paired with native six-part source port. MIT.
import { expect, test, type Page } from '@playwright/test';
import type { ScrollAreaOptions } from '../../apps/fixtures/src/lib/scroll-area-harness.js';
const part = (page: Page, name: string) => page.getByTestId(name);
async function configure(page: Page, patch: Partial<ScrollAreaOptions>) { await page.evaluate(patch => window.scrollAreaHarness!.configure(patch), patch); }
async function scroll(page: Page, x: number, y: number) {
  await part(page,'viewport').evaluate((node, {x,y}) => { node.scrollLeft=x;node.scrollTop=y;node.dispatchEvent(new Event('scroll')); }, {x,y});
}
async function capture(page: Page, name: string) {
  await part(page,name).evaluate(node => {
    let active: number | null = null;
    Object.defineProperties(node, { setPointerCapture: { configurable:true,value:(id:number)=>{active=id;} }, hasPointerCapture:{configurable:true,value:(id:number)=>active===id},releasePointerCapture:{configurable:true,value:()=>{active=null;}},dropCapture:{configurable:true,value:()=>{active=null;}} });
  });
}
async function pointer(page: Page, name: string, type: string, init: PointerEventInit = {}) { return part(page,name).evaluate((node,{type,init}) => node.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:1,button:0,buttons:1,pointerType:'mouse',...init})),{type,init}); }
async function wheel(page: Page, name: string, init: WheelEventInit) { return part(page,name).evaluate((node,init) => node.dispatchEvent(new WheelEvent('wheel',{bubbles:true,cancelable:true,...init})),init); }
for (const framework of ['react','svelte'] as const) {
  const open = async (page:Page, options: Partial<ScrollAreaOptions> = {}) => {
    await page.goto(`/scroll-area?reference=${framework}&options=${encodeURIComponent(JSON.stringify(options))}`);
    await expect(page.locator('main')).toHaveAttribute('data-hydrated','true');
    if(framework==='react')await expect(page.locator('main')).toHaveAttribute('data-renderer','19.2.8/19.2.8');
    await expect.poll(()=>page.evaluate(()=>Boolean(window.scrollAreaHarness))).toBe(true);
  };
  const enter = async (page:Page,name='viewport',pointerType='mouse') => { await pointer(page,name,framework==='react'?'pointerover':'pointerenter',{pointerType}); };
  const leave = async (page:Page) => { await pointer(page,'root',framework==='react'?'pointerout':'pointerleave',{relatedTarget:null}); };
  test(`${framework} R:321/349 initial real geometry, no overlay padding and exact native roles/CSS`,async({page})=>{
    await open(page,{cornerMounted:false});
    for(const name of ['root','viewport','content'])await expect(part(page,name)).toHaveAttribute('role','presentation');
    await expect(part(page,'viewport')).toHaveAttribute('tabindex','0');
    await expect.poll(()=>part(page,'vertical-thumb').evaluate(node=>node.getBoundingClientRect().height)).toBe(40);
    await expect.poll(()=>part(page,'horizontal-thumb').evaluate(node=>node.getBoundingClientRect().width)).toBe(40);
    expect(await part(page,'large').evaluate(node=>{const s=getComputedStyle(node);return[s.paddingLeft,s.paddingRight,s.paddingBottom]})).toEqual(['0px','0px','0px']);
    expect(await part(page,'viewport').evaluate(node=>getComputedStyle(node).scrollbarWidth)).toBe('none');
  });
  test(`${framework} R:374 logical scrollbar padding`,async({page})=>{
    await open(page,{padding:8,cornerMounted:false});
    await expect.poll(()=>part(page,'vertical-thumb').evaluate(node=>node.getBoundingClientRect().height)).toBeCloseTo((200-16)*0.2,1);
    expect(await part(page,'horizontal-thumb').evaluate(node=>node.getBoundingClientRect().width)).toBeCloseTo((200-16)*0.2,1);
  });
  test(`${framework} R:412 scrollbar cross-axis margin leaves source sizing unchanged`,async({page})=>{
    await open(page,{margin:11,viewportSize:390,cornerMounted:false});
    await expect.poll(()=>part(page,'vertical-thumb').evaluate(node=>node.getBoundingClientRect().height)).toBeCloseTo(390*0.39,1);
    expect(await part(page,'horizontal-thumb').evaluate(node=>node.getBoundingClientRect().width)).toBeCloseTo(390*0.39,1);
  });
  test(`${framework} R:451 logical thumb margin`,async({page})=>{
    await open(page,{thumbMargin:8,cornerMounted:false});
    await expect.poll(()=>part(page,'vertical-thumb').evaluate(node=>node.getBoundingClientRect().height)).toBeCloseTo((200-16)*0.2,1);
    expect(await part(page,'horizontal-thumb').evaluate(node=>node.getBoundingClientRect().width)).toBeCloseTo((200-16)*0.2,1);
  });
  test(`${framework} R:103/144/173 initial measurement before ResizeObserver and hidden-to-visible recompute`,async({page})=>{
    await open(page,{hidden:true,keepMounted:true});
    await configure(page,{hidden:false});
    await expect(part(page,'vertical')).toBeVisible();await expect(part(page,'vertical-thumb')).toBeVisible();
    await expect.poll(()=>part(page,'vertical-thumb').evaluate(node=>node.getBoundingClientRect().height)).toBeGreaterThan(0);
  });
  test(`${framework} R:209/256/C:81/Cn:content-resize corner appears and clears with actual Content ResizeObserver`,async({page})=>{
    await open(page,{contentWidth:100,contentHeight:100,keepMounted:true});await expect(part(page,'corner')).toHaveCount(0);await expect(part(page,'viewport')).toHaveAttribute('tabindex','-1');
    await configure(page,{contentWidth:1000,contentHeight:1000});await expect(part(page,'corner')).toHaveCSS('width','10px');await expect(part(page,'corner')).toHaveCSS('height','10px');
    await configure(page,{contentWidth:100,contentHeight:100});await expect(part(page,'corner')).toHaveCount(0);await expect(part(page,'root')).not.toHaveAttribute('data-has-overflow-x');await expect(part(page,'root')).not.toHaveAttribute('data-has-overflow-y');
    expect(await part(page,'viewport').evaluate(node=>['x-start','x-end','y-start','y-end'].map(edge=>node.style.getPropertyValue(`--scroll-area-overflow-${edge}`)))).toEqual(['0px','0px','0px','0px']);
  });
  test(`${framework} R:534 late Content mount updates overflow and tab order`,async({page})=>{
    await open(page,{contentMounted:false});await expect(part(page,'viewport')).toHaveAttribute('tabindex','-1');
    await configure(page,{contentMounted:true});await expect(part(page,'root')).toHaveAttribute('data-has-overflow-y');await expect(part(page,'viewport')).toHaveAttribute('tabindex','0');
  });
  test(`${framework} R:580/V:303/S:933 attributes follow both edges on every source part`,async({page})=>{
    await open(page);
    for(const name of ['root','viewport','content','vertical','horizontal']){
      await expect(part(page,name)).toHaveAttribute('data-has-overflow-x');await expect(part(page,name)).toHaveAttribute('data-has-overflow-y');await expect(part(page,name)).not.toHaveAttribute('data-overflow-x-start');await expect(part(page,name)).toHaveAttribute('data-overflow-x-end');
    }
    await scroll(page,400,400);
    for(const name of ['root','viewport','content','vertical','horizontal'])for(const edge of ['x-start','x-end','y-start','y-end'])await expect(part(page,name)).toHaveAttribute(`data-overflow-${edge}`);
    await scroll(page,800,800);await expect(part(page,'viewport')).not.toHaveAttribute('data-overflow-x-end');await expect(part(page,'viewport')).not.toHaveAttribute('data-overflow-y-end');
  });
  test(`${framework} R:691 near edges normalize within1px`,async({page})=>{
    await open(page);await scroll(page,799.5,799.5);await expect(part(page,'root')).not.toHaveAttribute('data-overflow-x-end');await expect(part(page,'root')).not.toHaveAttribute('data-overflow-y-end');
    await scroll(page,0.5,0.5);await expect(part(page,'root')).not.toHaveAttribute('data-overflow-x-start');await expect(part(page,'root')).not.toHaveAttribute('data-overflow-y-start');
  });
  test(`${framework} R:728/773/820 numeric/object threshold, metrics and reactive threshold`,async({page})=>{
    await open(page,{threshold:{xStart:20,yStart:5}});await scroll(page,15,7);await expect(part(page,'viewport')).not.toHaveAttribute('data-overflow-x-start');await expect(part(page,'viewport')).toHaveAttribute('data-overflow-y-start');
    await scroll(page,35,7);expect(await part(page,'viewport').evaluate(node=>node.style.getPropertyValue('--scroll-area-overflow-x-start'))).toBe('35px');await expect(part(page,'viewport')).toHaveAttribute('data-overflow-x-start');
    await configure(page,{threshold:20});await scroll(page,15,15);await expect(part(page,'viewport')).not.toHaveAttribute('data-overflow-y-start');
    await scroll(page,785,785);await expect(part(page,'viewport')).not.toHaveAttribute('data-overflow-y-end');
    await configure(page,{threshold:5});await scroll(page,10,10);await expect(part(page,'viewport')).toHaveAttribute('data-overflow-y-start');await configure(page,{threshold:20});await expect(part(page,'viewport')).not.toHaveAttribute('data-overflow-y-start');
  });
  test(`${framework} R:850 no overflow has no source overflow attributes`,async({page})=>{
    await open(page,{contentWidth:100,contentHeight:100,keepMounted:true});for(const name of ['root','viewport','content','vertical','horizontal'])for(const edge of ['has-overflow-x','has-overflow-y','overflow-x-start','overflow-x-end','overflow-y-start','overflow-y-end'])await expect(part(page,name)).not.toHaveAttribute(`data-${edge}`);
  });
  test(`${framework} R:899/483 RTL ranges and live direction change`,async({page})=>{
    await open(page,{direction:'rtl'});await scroll(page,0,0);await expect(part(page,'root')).not.toHaveAttribute('data-overflow-x-start');await expect(part(page,'root')).toHaveAttribute('data-overflow-x-end');
    await scroll(page,-400,0);await expect(part(page,'root')).toHaveAttribute('data-overflow-x-start');await scroll(page,-800,0);await expect(part(page,'root')).not.toHaveAttribute('data-overflow-x-end');
    await configure(page,{direction:'ltr'});await scroll(page,0,0);await expect(part(page,'root')).not.toHaveAttribute('data-overflow-x-start');await expect(part(page,'root')).toHaveAttribute('data-overflow-x-end');
  });
  test(`${framework} R:67/V:139/V:270/S:76/T:579 user scroll axis states and500ms expiry`,async({page})=>{
    await open(page,{keepMounted:true});await enter(page);await scroll(page,0,1);
    for(const name of ['root','viewport','vertical','vertical-thumb'])await expect(part(page,name)).toHaveAttribute('data-scrolling');await expect(part(page,'horizontal')).not.toHaveAttribute('data-scrolling');
    await expect(part(page,'root')).not.toHaveAttribute('data-scrolling',{timeout:1500});await enter(page);await scroll(page,1,1);await expect(part(page,'horizontal-thumb')).toHaveAttribute('data-scrolling');await expect(part(page,'vertical-thumb')).not.toHaveAttribute('data-scrolling');
  });
  test(`${framework} V:172/193/220/241 programmatic/touch modality attribution`,async({page})=>{
    await open(page,{keepMounted:true});await scroll(page,0,1);await expect(part(page,'root')).not.toHaveAttribute('data-scrolling');
    await pointer(page,'viewport','pointerdown',{pointerType:'touch'});await scroll(page,0,2);await expect(part(page,'root')).toHaveAttribute('data-scrolling');await expect(part(page,'root')).not.toHaveAttribute('data-scrolling',{timeout:1500});
    await pointer(page,'root','pointermove',{pointerType:'mouse'});await scroll(page,0,3);await expect(part(page,'root')).not.toHaveAttribute('data-scrolling');
  });
  test(`${framework} S:163/179 hover uses event target and touch never enters hover`,async({page})=>{
    await open(page,{keepMounted:true});await leave(page);await enter(page,'root','touch');await expect(part(page,'vertical')).not.toHaveAttribute('data-hovering');await enter(page,'root');await expect(part(page,'vertical')).toHaveAttribute('data-hovering');await leave(page);await expect(part(page,'vertical')).not.toHaveAttribute('data-hovering');
  });
  test(`${framework} S:19/29/39/C:50/65 ARIA overrides and orientation`,async({page})=>{
    await open(page);await expect(part(page,'vertical')).toHaveAttribute('aria-hidden','true');await expect(part(page,'corner')).toHaveAttribute('aria-hidden','true');await expect(part(page,'horizontal')).toHaveAttribute('data-orientation','horizontal');
    await configure(page,{ariaOverride:true});await expect(part(page,'vertical')).not.toHaveAttribute('aria-hidden');await expect(part(page,'corner')).not.toHaveAttribute('aria-hidden');
  });
  for (const orientation of ['vertical','horizontal'] as const) for(const direction of ['ltr','rtl'] as const) {
    test(`${framework} S:550/564/578 track jump ${orientation}/${direction} and T:185/213 drag capture`,async({page})=>{
      await open(page,{direction,keepMounted:true});const thumb=`${orientation}-thumb`;await capture(page,thumb);const rect=await part(page,orientation).boundingBox();expect(rect).not.toBeNull();
      await pointer(page,orientation,'pointerdown',{clientX:rect!.x+(direction==='rtl'?5:rect!.width-5),clientY:rect!.y+rect!.height-5});
      const amount=await part(page,'viewport').evaluate((node,axis)=>axis==='vertical'?node.scrollTop:node.scrollLeft,orientation);expect(orientation==='horizontal'&&direction==='rtl'? -amount:amount).toBeGreaterThan(0);
      await pointer(page,thumb,'pointercancel');await scroll(page,0,0);
      const start=await part(page,thumb).boundingBox();await pointer(page,thumb,'pointerdown',{clientX:start!.x,clientY:start!.y});await pointer(page,thumb,'pointermove',{clientX:start!.x+(direction==='rtl'?-20:20),clientY:start!.y+20});
      const moved=await part(page,'viewport').evaluate((node,axis)=>axis==='vertical'?node.scrollTop:node.scrollLeft,orientation);expect(orientation==='horizontal'&&direction==='rtl'? -moved:moved).toBeGreaterThan(0);await expect(part(page,orientation)).toHaveAttribute('data-scrolling');await pointer(page,thumb,'pointercancel');await expect(part(page,orientation)).not.toHaveAttribute('data-scrolling');
    });
  }
  test(`${framework} T:490/504/518/536/556 pointer latch and snap release source order`,async({page})=>{
    await open(page,{keepMounted:true,snap:'y mandatory'});await capture(page,'vertical-thumb');
    await pointer(page,'vertical-thumb','pointerdown',{button:2});await expect(part(page,'viewport')).toHaveCSS('scroll-snap-type','y mandatory');
    await pointer(page,'vertical-thumb','pointerdown');expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('none');
    await pointer(page,'vertical-thumb','pointerdown',{pointerId:2});await pointer(page,'vertical-thumb','pointerup',{pointerId:2});expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('none');
    await pointer(page,'vertical-thumb','pointerup');expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('y mandatory');
    await pointer(page,'vertical-thumb','pointerdown');await part(page,'vertical-thumb').evaluate(node=>(node as HTMLElement & {dropCapture:()=>void}).dropCapture());await pointer(page,'vertical-thumb','pointerdown',{pointerId:2});await pointer(page,'vertical-thumb','pointercancel',{pointerId:2});expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('y mandatory');
  });
  test(`${framework} T:missed-release/T:236/T:374 buttonless move and stale capture guards`,async({page})=>{
    await open(page,{keepMounted:true,snap:'y mandatory'});await capture(page,'vertical-thumb');await pointer(page,'vertical-thumb','pointerdown');await pointer(page,'vertical-thumb','pointermove',{clientY:20});const amount=await part(page,'viewport').evaluate(node=>node.scrollTop);expect(amount).toBeGreaterThan(0);
    await pointer(page,'vertical-thumb','pointermove',{clientY:60,pointerId:2,buttons:0});expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(amount);
    await part(page,'vertical-thumb').evaluate(node=>(node as HTMLElement & {dropCapture:()=>void}).dropCapture());await pointer(page,'vertical-thumb','pointermove',{clientY:100,buttons:0});expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(amount);await expect(part(page,'vertical-thumb')).not.toHaveAttribute('data-scrolling');
    expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('y mandatory');
  });
  for(const height of [16,10])test(`${framework} S:680/691/701/710 non-positive thumb travel ${height}px`,async({page})=>{
    await open(page,{keepMounted:true,trackHeight:height});await capture(page,'vertical-thumb');await pointer(page,'vertical-thumb','pointerdown');await pointer(page,'vertical-thumb','pointermove',{clientY:20});expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(0);await pointer(page,'vertical-thumb','pointerup');await pointer(page,'vertical','pointerdown',{clientY:20});expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(0);
  });
  test(`${framework} S:224/245/260/T:43 nonprimary and missing viewport/thumb remain inert`,async({page})=>{
    await open(page,{keepMounted:true,snap:'y mandatory'});await pointer(page,'vertical','pointerdown',{button:2,clientY:100});expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(0);expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('y mandatory');
    await configure(page,{thumbMounted:false});await pointer(page,'vertical','pointerdown',{clientY:100});expect(await part(page,'viewport').evaluate(node=>node.style.scrollSnapType)).toBe('y mandatory');
    await configure(page,{viewportMounted:false,thumbMounted:true});await capture(page,'vertical-thumb');await pointer(page,'vertical-thumb','pointerdown');expect(await pointer(page,'vertical-thumb','pointermove',{clientY:20})).toBe(true);await expect(part(page,'vertical')).not.toHaveAttribute('data-scrolling');await pointer(page,'vertical','pointerdown',{clientY:100});
  });
  test(`${framework} S:279 native composed target inside thumb skips track jump`,async({page})=>{
    await open(page,{keepMounted:true});await part(page,'vertical').evaluate(node=>{const thumb=node.querySelector('[data-testid="vertical-thumb"]')!;const event=new PointerEvent('pointerdown',{bubbles:true,button:0,clientY:160});Object.defineProperty(event,'composedPath',{value:()=>[thumb,node]});node.dispatchEvent(event);});expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(0);
  });
  for(const button of [0,1,2])test(`${framework} S:493 parameterized ${button} track mousedown cancels focus default`,async({page})=>{
    await open(page,{keepMounted:true});await page.locator('#outside').focus();const consumed=await part(page,'vertical').evaluate((node,button)=>node.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true,button})),button);expect(consumed).toBe(false);await expect(page.locator('#outside')).toBeFocused();
  });
  test(`${framework} S:509 thumb mousedown preserves active native focus`,async({page})=>{
    await open(page,{keepMounted:true});await page.locator('#outside').focus();expect(await part(page,'vertical-thumb').evaluate(node=>node.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,cancelable:true})))).toBe(false);await expect(page.locator('#outside')).toBeFocused();
  });
  for(const direction of ['ltr','rtl'] as const)for(const orientation of ['vertical','horizontal'] as const)test(`${framework} S:780/788/802/824/838/855/866/877/885/893 wheel ${orientation}/${direction}`,async({page})=>{
    await open(page,{direction,keepMounted:true});const horizontal=orientation==='horizontal';const sign=horizontal&&direction==='rtl'?-1:1;const delta=(amount:number)=>horizontal?{deltaX:amount}:{deltaY:amount};
    expect(await wheel(page,orientation,delta(-sign*50))).toBe(true);expect(await part(page,'viewport').evaluate((node,axis)=>axis==='horizontal'?node.scrollLeft:node.scrollTop,orientation)).toBe(0);
    expect(await wheel(page,orientation,delta(sign*50))).toBe(false);await expect(part(page,orientation)).toHaveAttribute('data-scrolling');
    await scroll(page,horizontal?sign*790:0,horizontal?0:790);expect(await wheel(page,orientation,delta(sign*50))).toBe(false);expect(await part(page,'viewport').evaluate((node,axis)=>axis==='horizontal'?node.scrollLeft:node.scrollTop,orientation)).toBe(sign*800);
    expect(await wheel(page,orientation,delta(sign*50))).toBe(true);expect(await wheel(page,orientation,delta(0))).toBe(true);expect(await wheel(page,orientation,{...delta(-sign*50),ctrlKey:true})).toBe(true);expect(await part(page,'viewport').evaluate((node,axis)=>axis==='horizontal'?node.scrollLeft:node.scrollTop,orientation)).toBe(sign*800);
    await expect(part(page,orientation)).not.toHaveAttribute('data-scrolling',{timeout:1500});expect(await wheel(page,orientation,delta(sign*50))).toBe(true);await expect(part(page,orientation)).not.toHaveAttribute('data-scrolling');
  });
  test(`${framework} S:registers wheel after unkept horizontal track appears`,async({page})=>{
    await open(page,{direction:'rtl',contentWidth:100,contentHeight:100});await expect(part(page,'horizontal')).toHaveCount(0);await configure(page,{contentWidth:1000});await expect(part(page,'horizontal')).toBeVisible();expect(await wheel(page,'horizontal',{deltaX:-50})).toBe(false);expect(await part(page,'viewport').evaluate(node=>node.scrollLeft)).toBe(-50);
  });
  for(const orientation of ['vertical','horizontal'] as const)for(const direction of ['ltr','rtl'] as const)for(const edge of ['start','end'] as const)test(`${framework} V:373/391/421/437/453/470 overscroll ${orientation}/${direction}/${edge}`,async({page})=>{
    await open(page,{direction,keepMounted:true,cornerMounted:false,...(orientation==='vertical'?{contentWidth:200}:{contentHeight:200})});const thumb=`${orientation}-thumb`;const horizontal=orientation==='horizontal';const axis=horizontal?'width':'height';const resting=await part(page,thumb).evaluate((node,axis)=>node.getBoundingClientRect()[axis],axis);const value=edge==='start'?-50:850;const signed=horizontal&&direction==='rtl'?-value:value;
    await part(page,'viewport').evaluate((node,{horizontal,signed})=>{Object.defineProperty(node,horizontal?'scrollLeft':'scrollTop',{configurable:true,get:()=>signed});node.dispatchEvent(new Event('scroll'));},{horizontal,signed});
    await expect.poll(()=>part(page,thumb).evaluate((node,axis)=>node.getBoundingClientRect()[axis],axis)).toBeLessThan(resting);const size=await part(page,thumb).evaluate((node,axis)=>node.getBoundingClientRect()[axis],axis);expect(size).toBeGreaterThan(resting*0.9);
    const rect=await part(page,thumb).boundingBox();const track=await part(page,orientation).boundingBox();const physicalStart=!horizontal||direction==='ltr';const pinned=edge==='start'?physicalStart:!physicalStart;
    expect(horizontal?(pinned?rect!.x-track!.x:rect!.x+rect!.width-track!.x-track!.width):(edge==='start'?rect!.y-track!.y:rect!.y+rect!.height-track!.y-track!.height)).toBeCloseTo(0,0);
    await part(page,'viewport').evaluate((node,horizontal)=>{Object.defineProperty(node,horizontal?'scrollLeft':'scrollTop',{configurable:true,value:100,writable:true});node.dispatchEvent(new Event('scroll'));},horizontal);await expect.poll(()=>part(page,thumb).evaluate((node,axis)=>node.getBoundingClientRect()[axis],axis)).toBeCloseTo(resting,0);
  });
  test(`${framework} V:20/T:75/T:114 user handler synchronous unmount guards`,async({page})=>{
    await open(page,{keepMounted:true,unmountOn:'scroll'});await scroll(page,0,1);await expect(part(page,'viewport')).toHaveCount(0);
    await open(page,{keepMounted:true,unmountOn:'move'});await capture(page,'vertical-thumb');await pointer(page,'vertical-thumb','pointerdown');await pointer(page,'vertical-thumb','pointermove',{clientY:20});await expect(part(page,'vertical')).toHaveCount(0);expect(await part(page,'viewport').evaluate(node=>node.scrollTop)).toBe(0);
    await open(page,{keepMounted:true,unmountOn:'up',snap:'y mandatory'});await capture(page,'vertical-thumb');await pointer(page,'vertical-thumb','pointerdown');await pointer(page,'vertical-thumb','pointerup');await expect(part(page,'viewport')).toHaveCount(0);
  });
  test(`${framework} native/source supplement shared renderer refs, replacement hosts and teardown`,async({page})=>{
    await open(page,{customRender:true,keepMounted:true});expect(await page.evaluate(()=>window.scrollAreaHarness!.refs())).toEqual({root:true,viewport:true,content:true,vertical:true,horizontal:true,thumb:true,corner:true});
    for(const name of ['root','viewport','content','vertical','horizontal','vertical-thumb','corner'])expect(await part(page,name).evaluate(node=>node.tagName)).toBe('ARTICLE');
    await page.evaluate(()=>window.scrollAreaHarness!.destroy());expect(await page.evaluate(()=>window.scrollAreaHarness!.refs())).toEqual({root:false,viewport:false,content:false,vertical:false,horizontal:false,thumb:false,corner:false});
  });
  test(`${framework} native/source supplement CSP nonce and actual scrollbar stylesheet application`,async({page})=>{
    await open(page,{nonce:'scroll-nonce'});const styles=page.locator('style').filter({hasText:'.base-ui-disable-scrollbar{scrollbar-width:none}'});await expect(styles).toHaveCount(1);await expect(styles).toHaveAttribute('nonce','scroll-nonce');await expect(part(page,'viewport')).toHaveCSS('scrollbar-width','none');
    await open(page,{disableStyleElements:true});await expect(page.locator('style').filter({hasText:'.base-ui-disable-scrollbar{scrollbar-width:none}'})).toHaveCount(0);
  });
}
