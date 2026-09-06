(() => {
  'use strict';
  let opener = null;
  let returnHash = '#arbol';
  let switching = false;
  const dialogs = [...document.querySelectorAll('dialog')];
  function closeAll() {
    switching = true;
    dialogs.forEach(d => { if (d.open) d.close(); });
    switching = false;
  }
  function openPerson(id, trigger) {
    const dialog = document.getElementById('p-' + id);
    if (!dialog || typeof dialog.showModal !== 'function') return;
    if (!dialogs.some(d => d.open)) {
      opener = trigger || document.querySelector('[data-person="' + id + '"]');
      returnHash = location.hash.startsWith('#p-') ? '#arbol' : (location.hash || '#arbol');
    }
    closeAll();
    dialog.showModal();
    dialog.scrollTop = 0;
    history.replaceState(null, '', '#p-' + id);
  }
  function revealSource(target) {
    for (let node = target; node; node = node.parentElement) {
      if (node.tagName === 'DETAILS') node.open = true;
    }
  }
  document.addEventListener('click', event => {
    const person = event.target.closest('[data-person]');
    if (person && typeof document.getElementById('p-' + person.dataset.person)?.showModal === 'function') {
      event.preventDefault();
      openPerson(person.dataset.person, person);
    }
    const source = event.target.closest('a[href^="#s-"]');
    if (source) {
      const target = document.getElementById(source.hash.slice(1));
      if (target?.tagName === 'DETAILS') revealSource(target);
    }
  });
  dialogs.forEach(dialog => {
    dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (switching || dialogs.some(d => d.open)) return;
      if (location.hash.startsWith('#p-')) history.replaceState(null, '', returnHash);
      if (opener?.isConnected) opener.focus({preventScroll: true});
    });
  });
  const imageDialog = document.getElementById('image-dialog');
  document.querySelectorAll('[data-image]').forEach(button => {
    button.addEventListener('click', () => {
      if (typeof imageDialog.showModal !== 'function') return;
      opener = button;
      const img = document.getElementById('expanded-image');
      img.src = '/familia/img/' + button.dataset.image;
      img.alt = button.querySelector('img').alt;
      document.getElementById('image-caption').textContent = button.dataset.caption;
      document.getElementById('image-source').href = '#s-' + button.dataset.source;
      imageDialog.showModal();
    });
  });
  document.getElementById('image-source').addEventListener('click', () => imageDialog.close());
  function openHash() {
    if (location.hash.startsWith('#p-')) openPerson(location.hash.slice(3), null);
    if (location.hash.startsWith('#s-')) {
      const target = document.getElementById(location.hash.slice(1));
      if (target?.tagName === 'DETAILS') { revealSource(target); target.scrollIntoView(); }
    }
  }
  window.addEventListener('hashchange', openHash);
  openHash();
  document.getElementById('share-album').addEventListener('click', async () => {
    const status = document.getElementById('share-status');
    const url = 'https://gadi.fm/familia/';
    try { await navigator.clipboard.writeText(url); status.textContent = 'Enlace copiado. Podés compartirlo con la familia.'; }
    catch { status.textContent = 'Copiá este enlace: ' + url; }
  });

  const places = {
    montevideo: {name:'Montevideo', mapName:'Uruguay', eyebrow:'El punto de encuentro', coords:[-56.16,-34.90], dx:12, dy:24, text:'Los matrimonios de 1929 y 1935, los nacimientos de Bernardo y Lucy y buena parte de la vida familiar convergen en esta ciudad. En Villa del Cerro, Efraim y Luisa aparecen domiciliados en la calle Portugal.', source:'mat1929'},
    esmirna: {name:'Esmirna · İzmir', mapName:'Esmirna', eyebrow:'La rama Levy · Caballero', coords:[27.14,38.42], dx:-15, dy:3, anchor:'end', text:'Jacobo nació aquí en 1911 y Catalina en 1917, según su matrimonio de 1935. Los dos formaron su familia en Montevideo: se casaron en 1935 y fueron los padres de Lucy.', source:'mat1935'},
    lituania: {name:'Lituania', eyebrow:'El origen de Efraim', coords:[23.9,55.2], dx:12, dy:-10, text:'El acta matrimonial registra a Efraim como nacido en Lituania en 1894. La semblanza de Bernardo sitúa la llegada de su padre a Uruguay en 1926. El punto representa el país, no una ciudad de origen identificada.', source:'liondas'},
    polonia: {name:'Polonia', eyebrow:'El origen de Luisa', coords:[19.1,52.1], dx:-14, dy:6, anchor:'end', text:'Luisa nació en Polonia en 1907. La semblanza de Bernardo fecha la llegada de su madre a Uruguay en 1928. No conocemos aún la localidad: el punto en el mapa representa el país.', source:'liondas'},
    israel: {name:'Haifa y Jerusalén', mapName:'Israel', eyebrow:'La vida profesional de Bernardo', coords:[35,32], dx:12, dy:18, text:'Bernardo trabajó en Israel desde 1971: en el hospital Rambam de Haifa y en Hadassah, en Jerusalén. Regresó a Uruguay en 1988. Después de esa etapa, volvió a trabajar en Montevideo.', source:'smu'},
    piriapolis: {name:'Piriápolis', eyebrow:'Catalina y Jacobo', mapHidden:true, text:'Una fotografía familiar muestra a Cata y Jacobo juntos frente a una casa en Piriápolis. No conocemos la fecha de la toma. En este mapa continental, Piriápolis y Montevideo se agrupan bajo Uruguay.', source:'piriapolis'}
  };
  const ns='http://www.w3.org/2000/svg';
  const project=([lon,lat])=>[(lon+90)/140*880,(65-lat)/125*475];
  const points=document.getElementById('map-points');
  const routes=document.getElementById('map-routes');
  const pointNodes=new Map();
  function choosePlace(id) {
    const p=places[id]; if(!p) return;
    document.querySelectorAll('[data-place]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===id)));
    pointNodes.forEach((node,key)=>{node.classList.toggle('active',key===id || (key==='montevideo' && id==='piriapolis'));node.setAttribute('aria-pressed',String(key===id || (key==='montevideo' && id==='piriapolis')));});
    routes.querySelectorAll('path').forEach(r=>r.classList.toggle('active',r.dataset.route===id || id==='montevideo'));
    const panel=document.getElementById('place-content');
    panel.replaceChildren();
    const eyebrow=document.createElement('p');eyebrow.className='eyebrow';eyebrow.textContent=p.eyebrow;
    const h=document.createElement('h3');h.textContent=p.name;
    const text=document.createElement('p');text.textContent=p.text;
    const link=document.createElement('a');link.href='#s-'+p.source;link.textContent='Leer más ↗';
    panel.append(eyebrow,h,text,link);
  }
  ['lituania','polonia','israel'].forEach(id=>{
    const [x,y]=project(places[id].coords),[mx,my]=project(places.montevideo.coords);
    const line=document.createElementNS(ns,'path');
    const bend=id==='lituania'?-75:id==='polonia'?5:110;
    line.setAttribute('d',`M ${x},${y} Q ${(x+mx)/2+bend},${(y+my)/2-90} ${mx},${my}`);
    line.setAttribute('class','map-route');line.dataset.route=id;routes.append(line);
  });
  Object.entries(places).forEach(([id,p])=>{
    if(p.mapHidden) return;
    const [x,y]=project(p.coords);
    const g=document.createElementNS(ns,'g');g.setAttribute('class','map-point');g.setAttribute('transform',`translate(${x},${y})`);
    g.setAttribute('role','button');g.setAttribute('tabindex','0');g.setAttribute('aria-label','Explorar '+p.name);
    const hit=document.createElementNS(ns,'circle');hit.setAttribute('r','14');hit.setAttribute('class','map-hit');
    const c=document.createElementNS(ns,'circle');c.setAttribute('r','5');
    const label=document.createElementNS(ns,'text');label.setAttribute('x',p.dx);label.setAttribute('y',p.dy);label.setAttribute('text-anchor',p.anchor||'start');label.textContent=p.mapName||p.name;
    g.append(hit,c,label);g.addEventListener('click',()=>choosePlace(id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choosePlace(id);}});
    points.append(g);pointNodes.set(id,g);
  });
  document.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>choosePlace(b.dataset.place)));
  choosePlace('montevideo');
})();
