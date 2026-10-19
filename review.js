// Loaded only by the local server when ?review=1 is requested.
const labels={home:'Home',invitation:'Invitation',celebrations:'Events',memories:'Photos',travel:'Venue',rsvp:'Wishes',general:'Whole website'};
const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
const button=(text,handler,className='')=>{const el=make('button',className,text);el.type='button';el.addEventListener('click',handler);return el;};
const compact=(text,max=300)=>String(text||'').replace(/\s+/g,' ').trim().slice(0,max);
let data={revision:0,notes:[],status:'draft'},loaded=false,saving=false,picking=false,draft=null,frame=0;
let pins=[];
const panel=make('aside');panel.id='site-review';panel.dataset.reviewUi='';panel.dataset.collapsed='false';panel.setAttribute('aria-label','Website review');
panel.innerHTML=`<div class="review-panel-head"><div><h2>Website review <span id="review-count"></span></h2><p>Keep feedback from every tab in one place</p></div><button type="button" class="review-collapse" aria-label="Minimise review panel" aria-expanded="true">−</button></div>
<div class="review-panel-body"><p class="review-help">Click <b>Add a pin</b>, choose an area, and write your change. Browse between tabs to keep reviewing.</p><div class="review-add-actions"><button type="button" class="review-primary" id="review-add">＋ Add a pin</button><button type="button" id="review-general">General note</button></div><div class="review-toolbar"><label><input type="checkbox" id="review-show-pins" checked> Show numbered pins</label><button type="button" id="review-reload">Reload notes</button></div><p class="review-save-status" role="status" aria-live="polite" id="review-save-status">Loading your saved notes…</p><p class="review-empty" id="review-empty">No notes yet. Start with anything you would like changed.</p><ol class="review-notes" id="review-notes"></ol><div class="review-ready" id="review-ready" hidden><strong>Your review is ready.</strong>In chat, say: <b>“Apply my review notes.”</b><br>Your saved notes can be read directly from this computer.</div></div><div class="review-footer"><button type="button" id="review-export-button">Copy all notes</button><button type="button" class="review-primary" id="review-finish">Finish review ✓</button></div>`;
const composer=make('dialog');composer.id='review-composer';composer.dataset.reviewUi='';composer.setAttribute('aria-labelledby','review-composer-title');
composer.innerHTML=`<form id="review-note-form"><h2 id="review-composer-title">What would you like changed?</h2><p class="review-composer-target" id="review-target"></p><label for="review-note-text">Your change</label><textarea id="review-note-text" placeholder="For example: Make this heading larger and use a deeper pink." maxlength="3000" required></textarea><p class="review-dialog-status" id="review-note-status" role="status" aria-live="polite"></p><div class="review-dialog-actions"><button type="button" id="review-cancel-note">Cancel</button><button class="review-primary" id="review-save-note" type="submit">Save note</button></div></form>`;
const exportDialog=make('dialog');exportDialog.id='review-export';exportDialog.dataset.reviewUi='';exportDialog.setAttribute('aria-labelledby','review-export-title');
exportDialog.innerHTML=`<h2 id="review-export-title">All your feedback, together</h2><p>You can copy or download these notes. On this computer, just tell me in chat: <b>“Apply my review notes.”</b></p><textarea id="review-export-text" aria-label="Complete review notes" readonly></textarea><p id="review-copy-status" role="status" aria-live="polite"></p><div class="review-dialog-actions"><button type="button" id="review-download">Download</button><button type="button" class="review-primary" id="review-copy">Copy notes</button><button type="button" id="review-close-export">Close</button></div>`;
const outline=make('div','review-outline');outline.hidden=true;outline.dataset.reviewUi='';
const tooltip=make('div','','Click to leave a note');tooltip.id='review-tooltip';tooltip.hidden=true;tooltip.dataset.reviewUi='';
const pickingBar=make('div');pickingBar.id='review-picking-bar';pickingBar.hidden=true;pickingBar.dataset.reviewUi='';pickingBar.setAttribute('role','status');pickingBar.append(make('span','','Choose an area to annotate · Esc to cancel'),button('Cancel',()=>setPicking(false)));
document.body.append(panel,composer,exportDialog,outline,tooltip,pickingBar);
const $=id=>document.getElementById(id);
function status(message,error=false){$('review-save-status').textContent=message;$('review-save-status').classList.toggle('is-error',error);}
function collapse(value){panel.dataset.collapsed=String(value);panel.querySelector('.review-collapse').textContent=value?'＋':'−';panel.querySelector('.review-collapse').setAttribute('aria-expanded',String(!value));panel.querySelector('.review-collapse').setAttribute('aria-label',value?'Open review panel':'Minimise review panel');}
panel.querySelector('.review-collapse').addEventListener('click',()=>collapse(panel.dataset.collapsed!=='true'));
function setPicking(value){picking=value;document.body.classList.toggle('review-is-picking',value);pickingBar.hidden=!value;outline.hidden=true;tooltip.hidden=true;if(value)collapse(true);schedulePins();}
function currentPage(){return document.querySelector('main')?.dataset.currentPage||'home';}
function selectorFor(el){
  const photo=el.closest('.gallery-card');
  if(photo){const src=photo.querySelector('img')?.getAttribute('src');if(src)return '#gallery-grid .gallery-card:has(img[src='+JSON.stringify(src)+'])';}
  const path=[];
  for(let node=el;node&&node.nodeType===1;node=node.parentElement){
    if(node.id){path.unshift('#'+CSS.escape(node.id));break;}
    if(node.hasAttribute('data-event-id')){path.unshift('[data-event-id='+JSON.stringify(node.dataset.eventId)+']');break;}
    let part=node.tagName.toLowerCase();
    const peers=node.parentElement?[...node.parentElement.children].filter(child=>child.tagName===node.tagName):[];
    if(peers.length>1)part+=':nth-of-type('+(peers.indexOf(node)+1)+')';
    path.unshift(part);
  }
  return path.join(' > ');
}
function metadata(el,event){
  const rect=el?.getBoundingClientRect();
  const point=rect?{x:Math.min(1,Math.max(0,(event.clientX-rect.left)/(rect.width||1))),y:Math.min(1,Math.max(0,(event.clientY-rect.top)/(rect.height||1)))}:{x:.5,y:.5};
  return {id:crypto.randomUUID(),page:el?currentPage():'general',selector:el?selectorFor(el):'',targetText:el?compact(el.getAttribute('alt')||el.getAttribute('aria-label')||el.textContent):'General website feedback',tag:el?.tagName.toLowerCase()||'',heading:compact(el?.closest('section,header,footer')?.querySelector('h1,h2,h3')?.textContent,200),viewport:{width:innerWidth,height:innerHeight},point,day:document.querySelector('[data-day][aria-pressed=true]')?.dataset.day||'all',photoFilter:document.querySelector('[data-photo-filter][aria-pressed=true]')?.dataset.photoFilter||'all',text:''};
}
function edit(note){draft={...note};$('review-target').textContent=(labels[note.page]||note.page)+' · '+(note.targetText||'Selected area')+' · '+note.viewport.width+' × '+note.viewport.height;$('review-note-text').value=note.text;$('review-note-status').textContent='';$('review-composer-title').textContent=note.text?'Edit your review note':'What would you like changed?';composer.showModal();$('review-note-text').focus();}
function cancelNote(event){if(saving){event?.preventDefault();return;}if(draft&&$('review-note-text').value!==draft.text&&$('review-note-text').value.trim()&&!confirm('Discard this unsaved note?')){event?.preventDefault();return;}composer.close();draft=null;}
$('review-cancel-note').addEventListener('click',cancelNote);composer.addEventListener('cancel',cancelNote);
$('review-add').addEventListener('click',()=>setPicking(true));$('review-general').addEventListener('click',()=>edit(metadata(null)));
document.addEventListener('pointermove',event=>{
  if(!picking)return;
  if(event.target.closest('[data-review-ui]')){outline.hidden=true;tooltip.hidden=true;return;}
  const el=event.target.closest('svg')||event.target,rect=el.getBoundingClientRect();
  outline.hidden=false;outline.style.left=rect.left+'px';outline.style.top=rect.top+'px';outline.style.width=rect.width+'px';outline.style.height=rect.height+'px';
  tooltip.hidden=false;tooltip.style.left=Math.max(8,Math.min(innerWidth-205,event.clientX+14))+'px';tooltip.style.top=Math.min(innerHeight-50,event.clientY+18)+'px';
},{passive:true});
document.addEventListener('click',event=>{if(!picking||event.target.closest('[data-review-ui]'))return;event.preventDefault();event.stopImmediatePropagation();const el=event.target.closest('svg')||event.target;const note=metadata(el,event);setPicking(false);edit(note);},true);
document.addEventListener('keydown',event=>{if(picking&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();setPicking(false);collapse(false);}},true);
async function request(method,body){
  const response=await fetch('/api/review',{method,headers:body?{'Content-Type':'application/json'}:{},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(12000)});
  const value=await response.json();if(!response.ok)throw Object.assign(new Error(value.error||'Your review could not be saved.'),{status:response.status});return value;
}
function busy(value){saving=value;for(const el of panel.querySelectorAll('button:not(.review-collapse)'))el.disabled=value||!loaded;$('review-save-note').disabled=value;$('review-cancel-note').disabled=value;if(!value){$('review-finish').disabled=!data.notes.length||!loaded;$('review-export-button').disabled=!data.notes.length||!loaded;}}
async function persist(notes,state='draft'){
  busy(true);status('Saving your review…');
  try{data=await request('PUT',{revision:data.revision,status:state,notes});render();status(state==='ready'?'Review ready · all notes saved on this computer.':'Saved on this computer · '+data.notes.length+' note'+(data.notes.length===1?'':'s')+'.');}
  catch(error){if(error.status===409){try{data=await request('GET');render();error.message='Another window changed this review. Saved notes reloaded; your text is still here. Please save again.';}catch{}}status(error.message,true);throw error;}
  finally{busy(false);}
}
$('review-note-form').addEventListener('submit',async event=>{
  event.preventDefault();if(saving||!draft)return;
  const text=$('review-note-text').value.trim();if(!text){$('review-note-text').setCustomValidity('Please write the change you want.');$('review-note-text').reportValidity();return;}
  const saved={...draft,text};const notes=data.notes.some(n=>n.id===saved.id)?data.notes.map(n=>n.id===saved.id?saved:n):[...data.notes,saved];
  try{await persist(notes);composer.close();draft=null;collapse(false);}catch(error){$('review-note-status').textContent=error.message;}
});
$('review-note-text').addEventListener('input',()=>$('review-note-text').setCustomValidity(''));
async function reload(){busy(true);try{data=await request('GET');loaded=true;render();status(data.status==='ready'?'Review ready · all notes saved on this computer.':'Saved on this computer · '+data.notes.length+' notes.');}catch(error){status('Could not load your notes. '+error.message,true);}finally{busy(false);}}
$('review-reload').addEventListener('click',reload);
function target(note){try{return note.selector?document.querySelector(note.selector):null;}catch{return null;}}
function showArea(note){
  if(note.page==='general'){status('This is a general note about the whole website.');return;}
  document.querySelector('#navigation a[href="#'+note.page+'"]')?.click();
  if(note.page==='celebrations')document.querySelector('[data-day='+JSON.stringify(note.day)+']')?.click();
  if(note.page==='memories')document.querySelector('[data-photo-filter='+JSON.stringify(note.photoFilter)+']')?.click();
  const el=target(note);
  if(!el){status('This area is not currently visible. Open its event or photo filter to find it.',true);return;}
  for(let ancestor=el.parentElement;ancestor;ancestor=ancestor.parentElement)if(ancestor.tagName==='DETAILS')ancestor.open=true;
  el.scrollIntoView({block:'center',behavior:'instant'});collapse(true);
  const rect=el.getBoundingClientRect();outline.hidden=false;outline.style.left=rect.left+'px';outline.style.top=rect.top+'px';outline.style.width=rect.width+'px';outline.style.height=rect.height+'px';setTimeout(()=>{if(!picking)outline.hidden=true;},1800);schedulePins();
}
async function remove(note){try{await persist(data.notes.filter(n=>n.id!==note.id));}catch{}}
function render(){
  $('review-count').textContent='('+data.notes.length+')';$('review-empty').hidden=!!data.notes.length;$('review-ready').hidden=data.status!=='ready';
  $('review-notes').replaceChildren(...data.notes.map((note,index)=>{
    const row=make('li');row.dataset.noteId=note.id;
    row.append(make('p','review-note-meta',(index+1)+'. '+labels[note.page]+' · '+note.viewport.width+' × '+note.viewport.height),make('p','review-note-copy',note.text),make('p','review-note-target','Area: '+(note.targetText||'Selected area')));
    const actions=make('div','review-note-actions');actions.append(button('Show area',()=>showArea(note)),button('Edit',()=>edit(note)),button('Remove',()=>remove(note)));row.append(actions);return row;
  }));
  for(const pin of pins)pin.remove();pins=data.notes.map((note,index)=>{
    const pin=button(String(index+1),()=>edit(note),'review-pin');pin.dataset.reviewUi='';pin.setAttribute('aria-label','Edit note '+(index+1)+': '+compact(note.text,80));pin.hidden=true;document.body.append(pin);return pin;
  });schedulePins();
}
function positionPins(){
  frame=0;data.notes.forEach((note,index)=>{
    const pin=pins[index],el=target(note),page=el?.closest('.site-page');
    const rect=el?.getBoundingClientRect();
    if(!pin)return;
    if(!$('review-show-pins').checked||picking||!rect||!rect.width||!rect.height||page?.hidden||!el.getClientRects().length){pin.hidden=true;return;}
    const x=rect.left+rect.width*note.point.x,y=rect.top+rect.height*note.point.y;pin.hidden=x<0||x>innerWidth||y<0||y>innerHeight;
    pin.style.left=x+'px';pin.style.top=y+'px';
  });
}
function schedulePins(){if(!frame)frame=requestAnimationFrame(positionPins);}
addEventListener('scroll',schedulePins,{passive:true});addEventListener('resize',schedulePins);document.addEventListener('wedding:page',schedulePins);document.addEventListener('wedding:events-rendered',schedulePins);$('review-show-pins').addEventListener('change',schedulePins);
new MutationObserver(schedulePins).observe(document.querySelector('main'),{childList:true,subtree:true});
$('review-finish').addEventListener('click',async()=>{try{await persist(data.notes,'ready');$('review-ready').scrollIntoView({block:'nearest'});}catch{}});
function report(){
  return ['# Wedding website review','',`Status: ${data.status==='ready'?'Ready for changes':'Draft'}`,`Saved: ${data.updatedAt||''}`,`Website: ${location.origin}${location.pathname}`,'',...data.notes.flatMap((note,index)=>[
    `## ${index+1}. ${labels[note.page]}`,'',note.text,'',`Area: ${note.targetText||'General feedback'}`,`Heading: ${note.heading||'—'}`,`Selector: ${note.selector||'(whole website)'}`,`Screen: ${note.viewport.width} × ${note.viewport.height}`,`Filters: day=${note.day}; photos=${note.photoFilter}`,''])].join('\n');
}
$('review-export-button').addEventListener('click',()=>{$('review-export-text').value=report();$('review-copy-status').textContent='';exportDialog.showModal();$('review-export-text').focus();$('review-export-text').select();});
$('review-close-export').addEventListener('click',()=>exportDialog.close());
$('review-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('review-export-text').value);$('review-copy-status').textContent='Copied. Paste all your feedback into the chat.';}catch{$('review-export-text').focus();$('review-export-text').select();$('review-copy-status').textContent='Press Ctrl+C to copy the selected notes, or use Download.';}});
$('review-download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([report()],{type:'text/markdown;charset=utf-8'}));const link=make('a');link.href=url;link.download='wedding-website-review.md';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
busy(true);await reload();
