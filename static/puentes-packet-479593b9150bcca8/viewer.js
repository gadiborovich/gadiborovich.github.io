'use strict';
const decode64 = value => Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
function attachControls(files, standalone) {
  for (const button of document.querySelectorAll('[data-file]')) {
    const file = files[button.dataset.file];
    if (!file) continue;
    button.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([decode64(file.data)], {type:file.type}));
      const a = document.createElement('a'); a.href=url; a.download=file.name;
      a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    });
  }
  for (const anchor of document.querySelectorAll('a[href^="#"]')) {
    anchor.addEventListener('click', event => {
      event.preventDefault();
      document.getElementById(anchor.getAttribute('href').slice(1))?.scrollIntoView({behavior:'smooth'});
    });
  }
  document.getElementById('expand')?.addEventListener('click', event => {
    const all = [...document.querySelectorAll('details')];
    const open = all.some(detail => !detail.open);
    all.forEach(detail => { detail.open=open; });
    event.currentTarget.textContent=open?'Collapse all answers':'Expand all answers';
  });
  let saved=[];
  window.addEventListener('beforeprint', () => { saved=[...document.querySelectorAll('details')].map(d=>d.open); document.querySelectorAll('details').forEach(d=>{d.open=true;}); });
  window.addEventListener('afterprint', () => { document.querySelectorAll('details').forEach((d,i)=>{d.open=saved[i];}); });
  document.getElementById('print')?.addEventListener('click', () => window.print());
}
async function openPacket() {
  try {
    const raw = new URLSearchParams(location.hash.slice(1)).get('k');
    if (!raw) { document.getElementById('status').textContent='This packet needs its complete sharing link. Please open the full URL Gadi sent you.'; return; }
    const keyBytes=decode64(raw);
    if(keyBytes.length!==32) throw new Error('Invalid key');
    const response=await fetch('packet.enc', {cache:'no-store',credentials:'omit'});
    if(!response.ok) throw new Error('Packet unavailable');
    const bytes=new Uint8Array(await response.arrayBuffer());
    const key=await crypto.subtle.importKey('raw',keyBytes,'AES-GCM',false,['decrypt']);
    const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));
    const packet=JSON.parse(new TextDecoder().decode(decoded));
    document.body.innerHTML=packet.html;
    document.title=packet.title;
    attachControls(packet.files,false);
  } catch(error) {
    document.getElementById('status').textContent='The packet could not be opened. Check that the complete link was copied, then reload.';
  }
}
openPacket();
