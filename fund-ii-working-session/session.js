(() => {
 'use strict';
 const people = JSON.parse(document.getElementById('relationship-data').textContent);
 const byId = new Map(people.map(p => [p.id,p]));
 const key = 'gadi-fm:fund-ii-working-session:2026-10-01:v1';
 let state = {selected:[], decisions:{}, notes:'', review:''};
 let canSave = true;
 try {
  const saved = JSON.parse(localStorage.getItem(key) || 'null');
  if(saved && Array.isArray(saved.selected)) {
   state.selected = [...new Set(saved.selected.filter(id=>byId.has(id)))];
   state.decisions = saved.decisions && typeof saved.decisions==='object' ? saved.decisions : {};
   state.notes = typeof saved.notes==='string' ? saved.notes : '';
   state.review = typeof saved.review==='string' ? saved.review : '';
  }
 } catch {canSave=false;}
 const status = document.getElementById('save-status');
 function save(){
  try{localStorage.setItem(key,JSON.stringify(state));canSave=true;status.textContent='Saved in this browser only. Export to share or keep a copy.';}
  catch{canSave=false;status.textContent='Browser saving is unavailable. Download your notes before leaving this page.';}
 }
 if(!canSave) status.textContent='Browser saving is unavailable. Download your notes before leaving this page.';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function updateDecision(id,field,value){
  if(!state.decisions[id])state.decisions[id]={next:byId.get(id).next,owner:'',date:''};
  state.decisions[id][field]=value;save();
 }
 function render(){
  document.querySelectorAll('[data-selected-count]').forEach(n=>n.textContent=state.selected.length);
  document.querySelectorAll('[data-pick]').forEach(n=>n.checked=state.selected.includes(n.dataset.pick));
  document.getElementById('empty-state').hidden=state.selected.length>0;
  const list=document.getElementById('decision-list');list.replaceChildren();
  state.selected.forEach(id=>{
   const p=byId.get(id), d=state.decisions[id]||{next:p.next,owner:'',date:''};
   const card=el('article','decision-card');card.dataset.decision=id;
   const head=el('div','decision-head'), title=el('div');
   title.append(el('p','eyebrow',p.group),el('h3','',p.name));
   const remove=el('button','remove','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+p.name+' from first pass');
   remove.addEventListener('click',()=>{state.selected=state.selected.filter(v=>v!==id);save();render();});
   head.append(title,remove);card.append(head);
   const label=el('label','','Next work to agree');label.htmlFor='next-'+id;
   const input=el('textarea');input.id='next-'+id;input.rows=3;input.value=typeof d.next==='string'?d.next:p.next;input.addEventListener('input',()=>updateDecision(id,'next',input.value));card.append(label,input);
   const meta=el('div','decision-meta'), ownerlabel=el('label','','Owner'), owner=el('select');owner.setAttribute('aria-label','Owner for '+p.name);
   ['','Gadi','Daniel','Together'].forEach(v=>{const o=el('option','',v||'To agree');o.value=v;owner.append(o);});owner.value=d.owner||'';owner.addEventListener('change',()=>updateDecision(id,'owner',owner.value));ownerlabel.append(owner);
   const datelabel=el('label','','Internal action date'), date=el('input');date.type='date';date.setAttribute('aria-label','Action date for '+p.name);date.value=d.date||'';date.addEventListener('change',()=>updateDecision(id,'date',date.value));datelabel.append(date);meta.append(ownerlabel,datelabel);card.append(meta);list.append(card);
  });
 }
 document.querySelectorAll('[data-pick]').forEach(input=>input.addEventListener('change',()=>{
  const id=input.dataset.pick;
  if(input.checked){if(!state.selected.includes(id))state.selected.push(id);}
  else state.selected=state.selected.filter(v=>v!==id);
  save();render();
 }));
 const notes=document.getElementById('session-notes'),review=document.getElementById('review-date');
 notes.value=state.notes;review.value=state.review;
 notes.addEventListener('input',()=>{state.notes=notes.value;save();});review.addEventListener('change',()=>{state.review=review.value;save();});
 render();
 const search=document.getElementById('search'),searchStatus=document.getElementById('search-status'),clear=document.getElementById('clear-search');
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 function filter(){
  const q=normalize(search.value);let count=0;
  document.querySelectorAll('.person').forEach(p=>{const show=normalize(p.dataset.search).includes(q);p.hidden=!show;if(show)count++;});
  document.querySelectorAll('.bucket').forEach(g=>g.hidden=!Array.from(g.querySelectorAll('.person')).some(p=>!p.hidden));
  document.querySelectorAll('.relationship-section').forEach(s=>s.hidden=q!==''&&!Array.from(s.querySelectorAll('.bucket')).some(g=>!g.hidden));
  document.querySelectorAll('.bucket-nav').forEach(n=>n.hidden=q!=='');
  searchStatus.textContent=q ? (count ? `${count} matching relationship${count===1?'':'s'}` : 'No matching relationships. Try another name.') : 'All relationships in Gadi’s map';
  clear.hidden=!q;
 }
 search.addEventListener('input',filter);clear.addEventListener('click',()=>{search.value='';filter();search.focus();});
 document.getElementById('jump').addEventListener('change',event=>{if(search.value){search.value='';filter();}location.hash=event.target.value;});
 document.querySelectorAll('a[href="#returning"],a[href="#other"]').forEach(a=>a.addEventListener('click',()=>{if(search.value){search.value='';filter();}}));
 function markdown(){
  const lines=['# Fund II — Gadi + Daniel working session','','Page prepared: October 1, 2026','Exported: '+new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles'})+' PT','','## First pass',''];
  if(!state.selected.length)lines.push('No relationships selected yet.','');
  state.selected.forEach((id,i)=>{const p=byId.get(id),d=state.decisions[id]||{};lines.push(`### ${i+1}. ${p.name}`,`Group: ${p.group}`,`Owner: ${d.owner||'To agree'}`,`Internal action date: ${d.date||'To agree'}`,'',d.next??p.next,'');if(p.url)lines.push('CRM: '+p.url,'');});
  lines.push('## Decisions from our conversation','',state.notes||'No session notes yet.','','Next review: '+(state.review||'To agree'),'','Working notes only. No CRM updates or messages were sent by this page.');return lines.join('\n');
 }
 function showExport(){const panel=document.getElementById('export-preview');panel.hidden=false;panel.open=true;document.getElementById('export-text').value=markdown();}
 document.getElementById('export').addEventListener('click',()=>{const blob=new Blob([markdown()],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download='fund-ii-session-notes.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);showExport();document.getElementById('export-status').textContent='Download requested. A text copy is available below.';});
 document.getElementById('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(markdown());document.getElementById('export-status').textContent='Session notes copied.';}catch{showExport();document.getElementById('export-status').textContent='Clipboard access is unavailable. Copy the text below or download it.';}});
 let printState=[];let searchBeforePrint='';
 window.addEventListener('beforeprint',()=>{
  searchBeforePrint=search.value;search.value='';filter();
  printState=Array.from(document.querySelectorAll('details')).map(d=>[d,d.open]);printState.forEach(([d])=>d.open=true);
  document.querySelectorAll('textarea,input[type="date"],.decision-meta select').forEach(input=>{const p=el('div','print-note',input.value||'To agree');input.insertAdjacentElement('afterend',p);});
 });
 window.addEventListener('afterprint',()=>{printState.forEach(([d,open])=>d.open=open);document.querySelectorAll('.print-note').forEach(n=>n.remove());search.value=searchBeforePrint;filter();});
 document.getElementById('print').addEventListener('click',()=>window.print());
 const links=Array.from(document.querySelectorAll('.sidebar nav a'));
 const chapters=Array.from(document.querySelectorAll('.chapter'));
 function onScroll(){
  const height=document.documentElement.scrollHeight-innerHeight;document.getElementById('progress').style.width=(height>0?scrollY/height*100:0)+'%';
  let current='purpose';chapters.forEach(s=>{if(!s.hidden&&s.getBoundingClientRect().top<190)current=s.id;});
  links.forEach(a=>{const active=a.hash==='#'+current;a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
 }
 addEventListener('scroll',onScroll,{passive:true});onScroll();
})();
