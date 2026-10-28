(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const all = s => [...document.querySelectorAll(s)];
  const catalog = window.MINT_CATALOG;
  const url = new URL(location.href);
  const lang = (url.searchParams.get('lang') || (/^\/en(?:\/|$)/.test(url.pathname)?'en':'de')) === 'en' ? 'en' : 'de';
  const L = (de,en) => lang === 'de' ? de : en;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduce.matches, filter = 'all';
  const escaped = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = s => s.toLocaleLowerCase(lang).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss');
  // Die Vorschau liegt neben dem unveränderten Build des übergebenen Projekts.
  const siteLink = path => location.protocol === 'file:' ? 'http://127.0.0.1:4176'+path : path;
  document.documentElement.lang=lang;
  all('[data-de][data-en]').forEach(el=>el.textContent=el.dataset[lang]);
  document.title=L('Scitura · Verstehen durch Ausprobieren','Scitura · Understanding by trying things out');
  $('#language').textContent=lang==='de'?'EN':'DE';
  $('#language').setAttribute('aria-label',L('Switch to English','Auf Deutsch wechseln'));
  $('#language').onclick=()=>{const u=new URL(location.href);u.searchParams.set('lang',lang==='de'?'en':'de');location.href=u.href;};
  $('#navigation').setAttribute('aria-label',L('Hauptnavigation','Main navigation'));
  $('#search').placeholder=L('Simulationen suchen','Search simulations');
  $('#search').setAttribute('aria-label',L('Simulationen durchsuchen','Search simulations'));
  $('#experiment-reset').setAttribute('aria-label',L('Experiment zurücksetzen','Reset experiment'));
  $('#experiment-reset').title=L('Experiment zurücksetzen','Reset experiment');

  window.MintVariants.render(lang);
  all('[data-subject-link]').forEach(a=>a.href=siteLink(catalog.subjects.find(s=>s.id===a.dataset.subjectLink).href[lang]));
  all('[data-simulation-link]').forEach(a=>a.href=siteLink(catalog.simulations.find(s=>s.id===a.dataset.simulationLink).href[lang]));
  all('[data-page]').forEach(a=>a.href=siteLink(catalog.pages[a.dataset.page][lang]));
  all('footer a[href="/varianten/"]').forEach(a=>a.href=siteLink('/varianten/?lang='+lang));
  const menu=$('#menu');
  const closeMenu=()=>{menu.setAttribute('aria-expanded','false');$('#navigation').classList.remove('open');};
  menu.setAttribute('aria-label',L('Menü öffnen','Open menu'));
  menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));$('#navigation').classList.toggle('open',open);};
  all('nav a').forEach(a=>a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});

  function renderCatalog(){
    const needle=normalize($('#search').value.trim());
    const grade=$('#grade').value;
    const rows=catalog.simulations.filter(s=>{
      if(filter!=='all'&&s.subject!==filter)return false;
      if(needle&&!normalize([s.title[lang],s.summary?.[lang],s.areaTitle[lang],s.id].join(' ')).includes(needle))return false;
      if(grade==='uni'&&!s.uni&&s.grades[1]<14)return false;
      if(grade!=='all'&&grade!=='uni'){const [min,max]=grade.split('-').map(Number);if(s.grades[0]>max||s.grades[1]<min)return false;}
      return true;
    });
    $('#simulation-grid').innerHTML=rows.map(s=>{
      const subject=catalog.subjects.find(x=>x.id===s.subject).title[lang];
      const grade=s.grades[0]===s.grades[1]?s.grades[0]:s.grades.join('–');
      return `<a class="sim-card" data-id="${escaped(s.id)}" href="${escaped(siteLink(s.href[lang]))}"><div class="sim-visual">${s.svg}</div><div class="sim-copy"><h3>${escaped(s.title[lang])}</h3><p>${escaped(s.summary?.[lang])}</p><div class="sim-meta"><span>${escaped(subject)}</span><span>${s.uni?L('Universität','University'):L('Klasse','Grades')+' '+grade}</span><span class="available">${L('Verfügbar','Available')}</span></div></div></a>`;
    }).join('');
    $('#result-count').textContent=L(`${rows.length} von 129 Simulationen`,`${rows.length} of 129 simulations`);
    $('#empty').hidden=!!rows.length;
    $('#empty-title').textContent=filter==='chemie'?L('Chemie kommt dazu.','Chemistry is on its way.'):L('Keine Simulation gefunden.','No simulations found.');
    $('#empty-description').textContent=filter==='chemie'?L('Die Chemie-Sammlung ist in Vorbereitung. Bis dahin gibt es viel in Mathematik und Physik zu entdecken.','The chemistry collection is in preparation. Meanwhile, there is plenty to explore in mathematics and physics.'):L('Versuche einen anderen Suchbegriff oder ändere die Klassenstufe.','Try another search term or choose a different grade level.');
  }
  all('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;all('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderCatalog();});
  $('#search').addEventListener('input',renderCatalog);
  $('#grade').addEventListener('change',renderCatalog);
  $('#clear-filters').onclick=()=>{filter='all';$('#search').value='';$('#grade').value='all';all('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.filter==='all')));renderCatalog();};
  renderCatalog();

  function setPaused(value){paused=value;document.body.classList.toggle('motion-paused',value);$('#motion').setAttribute('aria-pressed',String(value));$('#motion').setAttribute('aria-label',value?L('Bewegung fortsetzen','Resume motion'):L('Bewegung pausieren','Pause motion'));$('#motion').innerHTML=`<span aria-hidden="true">${value?'▷':'Ⅱ'}</span>`;window.dispatchEvent(new CustomEvent('mint:motion',{detail:{paused:value}}));}
  $('#motion').onclick=()=>setPaused(!paused);
  reduce.addEventListener('change',()=>setPaused(reduce.matches));
  window.MintPreview={lang,L,siteLink,setPaused,get paused(){return paused;},inspect:()=>({paused,filter,count:$('#simulation-grid').children.length,reduced:reduce.matches})};
  setPaused(paused);
})();
