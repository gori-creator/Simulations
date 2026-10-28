/** Startseiten-Hülle: Originalmodell, Grafik, Bilder und Ziehbedienung bleiben unverändert. */
import definition from '../../../src/simulations/physik/energieerhaltung/index';
import {defaultValues,sanitize} from '../../../src/sim-core/params';
import {Formatter} from '../../../src/sim-core/format';
import {Clock} from '../../../src/sim-core/clock';
import {readTheme} from '../../../src/sim-core/theme';
import {ImageStore} from '../../../src/sim-core/images';
import {KeyTargetLayer} from '../../../src/sim-core/key-targets';
import type {SimContext,SimInstance,ParamValues,UpdateSource} from '../../../src/sim-core/types';

const preview=(window as any).MintPreview;
const lang=preview.lang as 'de'|'en', L=(de:string,en:string)=>lang==='de'?de:en;
const stage=document.querySelector<HTMLElement>('#energy-stage')!;
const clock=new Clock(),fmt=new Formatter(lang),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const values:ParamValues={...defaultValues(definition.params),track:'looping'};
const readouts:Record<string,unknown>={};
let instance:SimInstance|undefined,frame=0,last=0,visible=false,draws=0,wanted=false,started=false,interacted=false,autoStarted=false;
let globalPaused=preview.paused;
const requestRender=()=>{if(!frame&&visible&&!document.hidden&&!globalPaused)frame=requestAnimationFrame(loop);};
const forceRender=()=>{if(instance&&visible&&!document.hidden){instance.render();draws++;}requestRender();};
const keys=new KeyTargetLayer(stage,L('Achterbahn. Pfeiltasten wählen Messpunkte, Enter setzt oder entfernt sie.','Roller coaster. Use arrow keys to select measuring points and Enter to toggle them.'),()=>forceRender());
const images=new ImageStore('energieerhaltung',definition.images!,forceRender);
function syncControls(){
  for(const key of ['h0','mu','m','p1','p2','p3','p4']){
    (document.getElementById(key) as HTMLInputElement).value=String(values[key]);
    document.getElementById(key+'-value')!.textContent=fmt.fixed(Number(values[key]),key==='mu'?3:key==='m'?0:1)+(key==='mu'?'':key==='m'?' kg':' m');
  }
  (document.getElementById('slow') as HTMLInputElement).checked=!!values.slow;
  document.querySelectorAll<HTMLButtonElement>('[data-track]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.track===values.track)));
  document.getElementById('custom-controls')!.hidden=values.track!=='eigen';
  document.getElementById('live-sentence')!.textContent=values.track==='eigen'?L('Ziehe die Punkte 1–4 und den Wagen vor der Fahrt. Alternativ kannst du alle Höhen mit den Reglern einstellen.','Before starting, drag points 1–4 and the car. You can also adjust every height with the sliders.'):L('Ziehe den Wagen vor der Fahrt nach oben oder unten. Tippe auf die Schiene, um Messpunkte zu setzen.','Before starting, drag the car up or down. Tap the rail to add measuring points.');
  const sim=(window as any).MINT_CATALOG.simulations.find((s:any)=>s.id==='energieerhaltung');
  const target=new URL(preview.siteLink(sim.href[lang]),location.href);
  for(const key of ['track','h0','mu','m','p1','p2','p3','p4','slow'])target.searchParams.set(key,String(values[key]));
  document.querySelector<HTMLAnchorElement>('[data-simulation-link="energieerhaltung"]')!.href=target.href;
  syncButton();(window as any).MintJourney?.refresh();
}
function syncButton(){const b=document.getElementById('experiment-play')!;b.textContent=clock.playing?L('Ⅱ Pause','Ⅱ Pause'):started?L('▶ Weiterfahren','▶ Continue'):L('▶ Losfahren','▶ Go');b.setAttribute('aria-pressed',String(clock.playing));}
function set(next:Partial<ParamValues>,source:UpdateSource='input'){
  interacted=true;const changed=new Set<string>();
  for(const [key,value] of Object.entries(next)){const def=definition.params.find(p=>p.key===key);if(!def||value===undefined)continue;const clean=sanitize(def,value);if(values[key]!==clean){values[key]=clean;changed.add(key);}}
  if(!changed.size)return;
  instance?.update?.(changed,source);
  if([...changed].some(k=>['track','h0','mu','p1','p2','p3','p4'].includes(k))){wanted=false;started=false;clock.pause();}
  syncControls();forceRender();
}
const ctx:SimContext<any>={stage,lang,get params(){return values;},locked:false,get theme(){return readTheme(stage);},fmt,clock,images,hidden:false,isHidden:()=>false,
  setKeyTargets:targets=>keys.setTargets(targets),get keyFocus(){return keys.selectedId;},set:next=>set(next,'sim'),readout:(key,value)=>{readouts[key]=value;},t:key=>(definition.strings?.[lang] as Record<string,string>)?.[key]??key,
  setAction:()=>{},requestRender};
function playback(){if(wanted&&visible&&!document.hidden&&!globalPaused)clock.play();else clock.pause();last=0;syncButton();requestRender();}
function loop(now:number){frame=0;if(!instance||!visible||document.hidden||globalPaused)return;
  if(clock.playing){const dt=last?Math.min((now-last)/1000,.05):0;clock.time+=dt;instance.tick?.(dt);if(!clock.playing){wanted=false;started=false;syncButton();}}
  last=now;instance.render();draws++;if(clock.playing)requestRender();
}
function start(manual:boolean){
  if(manual){interacted=true;if(globalPaused)preview.setPaused(false);}
  mount();
  if(!started)instance?.action?.('start');
  started=true;wanted=true;playback();
  if(manual&&!visible)stage.scrollIntoView({block:'nearest',behavior:reduced.matches?'instant':'smooth'});
}
function mount(){if(instance)return;stage.querySelector('.loading')?.remove();instance=definition.mount(ctx);instance.update?.(new Set(Object.keys(values)),'init');forceRender();}
function maybeAutoStart(){if(visible&&instance&&!autoStarted&&!interacted&&!globalPaused&&!reduced.matches&&(window as any).MintJourney?.inspect().arrived){autoStarted=true;start(false);}}
// Auch direkte Sprungmarken mit ruhender Szene berücksichtigen. Die Prüfung
// benötigt keine laufende Animationsschleife und bleibt pro Scroll-Frame gebündelt.
let visibilityFrame=0;
function refreshVisibility(){visibilityFrame=0;const rect=stage.getBoundingClientRect();const next=rect.width>0&&rect.height>0&&rect.bottom>-60&&rect.top<innerHeight+60;
  if(next===visible&&instance)return;visible=next;if(visible)mount();playback();maybeAutoStart();}
function scheduleVisibility(){if(!visibilityFrame)visibilityFrame=requestAnimationFrame(refreshVisibility);}
const observer=new IntersectionObserver(scheduleVisibility,{rootMargin:'60px 0px',threshold:0});observer.observe(stage);
window.addEventListener('scroll',scheduleVisibility,{passive:true});window.addEventListener('resize',scheduleVisibility);
for(const key of ['h0','mu','m','p1','p2','p3','p4'])document.getElementById(key)!.addEventListener('input',e=>set({[key]:Number((e.target as HTMLInputElement).value)}));
document.querySelectorAll<HTMLButtonElement>('[data-track]').forEach(b=>b.onclick=()=>set({track:b.dataset.track!}));
document.getElementById('slow')!.addEventListener('change',e=>set({slow:(e.target as HTMLInputElement).checked}));
document.getElementById('experiment-play')!.onclick=()=>{if(clock.playing){interacted=true;wanted=false;playback();}else start(true);};
document.getElementById('experiment-reset')!.onclick=()=>{interacted=true;wanted=false;started=false;clock.pause();instance?.resetTime?.();syncButton();forceRender();};
window.addEventListener('mint:arrival',maybeAutoStart);
window.addEventListener('mint:motion',((e:CustomEvent)=>{globalPaused=e.detail.paused;playback();}) as EventListener);
document.addEventListener('visibilitychange',playback);
reduced.addEventListener('change',()=>{wanted=false;playback();});
window.addEventListener('pagehide',e=>{cancelAnimationFrame(frame);frame=0;clock.pause();if(!e.persisted){instance?.destroy?.();observer.disconnect();}});
window.addEventListener('pageshow',()=>{refreshVisibility();playback();forceRender();});
document.querySelector('.track-choices')!.setAttribute('aria-label',L('Bahnform','Track shape'));
document.getElementById('experiment-reset')!.setAttribute('aria-label',L('Zurück zum Start','Back to start'));
document.getElementById('experiment-reset')!.title=L('Zurück zum Start','Back to start');
syncControls();scheduleVisibility();
(window as any).MintEnergy={inspect:()=>({params:{...values},readouts,playing:clock.playing,visible,draws,mounted:!!instance,autoStarted,interacted,keys:keys.nav.list.length,images:['car','sky','land'].map(k=>!!images.get(k))}),set};
