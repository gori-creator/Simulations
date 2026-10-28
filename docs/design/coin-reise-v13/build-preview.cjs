/** Im Projekt: node docs/design/coin-reise-v13/build-preview.cjs */
const path=require('node:path');
const fs=require('node:fs');
const {createRequire}=require('node:module');
const here=__dirname;
const project=path.resolve(here,'../../..');
const req=createRequire(path.join(project,'package.json'));
const esbuild=req('esbuild');
(async()=>{
  const curriculum=path.join(project,'src/curriculum/index.ts').replaceAll('\\','/');
  const routes=path.join(project,'src/lib/routes.ts').replaceAll('\\','/');
  const result=await esbuild.build({stdin:{contents:`import {allSimulations,SUBJECTS,getArea} from '${curriculum}'; import {routePath} from '${routes}'; export const catalog={pages:Object.fromEntries(['teachers','privacy'].map(page=>[page,{de:routePath('de',{kind:'page',page}),en:routePath('en',{kind:'page',page})}])),subjects:SUBJECTS.map(s=>({id:s.id,title:s.title,status:s.status,href:{de:routePath('de',{kind:'subject',subject:s.id}),en:routePath('en',{kind:'subject',subject:s.id})}})),simulations:allSimulations().map(s=>({...s,areaTitle:getArea(s.subject,s.area).title,href:s.status==='ready'?{de:routePath('de',{kind:'simulation',id:s.id}),en:routePath('en',{kind:'simulation',id:s.id})}:null}))};`,resolveDir:project,loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,define:{'import.meta.env.BASE_URL':'"/"'}});
  const virtualModule={exports:{}};
  new Function('module','exports',result.outputFiles[0].text)(virtualModule,virtualModule.exports);
  const {catalog}=virtualModule.exports;
  // SimThumb erzeugt auch Standardmotive und das Originalgitter. Aus dem geprüften
  // Astro-Build übernehmen, statt fehlende thumb.svg-Dateien durch leere Flächen zu ersetzen.
  const original=path.join(project,'dist/de/index.html');
  if(!fs.existsSync(original))throw Error('Zuerst npm run build im Originalprojekt ausführen.');
  const cards=fs.readFileSync(original,'utf8').match(/<article\b[^>]*data-sim-card[\s\S]*?<\/article>/g)||[];
  for(const s of catalog.simulations){
    const card=cards.find(c=>c.includes(`href="${s.href.de}"`));
    s.svg=card?.match(/class="card__thumb"[^>]*>\s*(<svg[\s\S]*?<\/svg>)/)?.[1];
    if(!s.svg)throw Error('Original-Vorschaubild fehlt: '+s.id);
  }
  fs.writeFileSync(path.join(here,'catalog.js'),'window.MINT_CATALOG = '+JSON.stringify(catalog)+';\n');
  const assetMap={};
  for(const file of ['wagen.webp','himmel.webp','landschaft.webp'])assetMap['../assets/sims/energieerhaltung/'+file]='data:image/webp;base64,'+fs.readFileSync(path.join(project,'src/assets/sims/energieerhaltung',file)).toString('base64');
  await esbuild.build({entryPoints:[path.join(here,'stage.ts')],outfile:path.join(here,'stage.js'),bundle:true,format:'iife',target:['es2020'],minify:true,plugins:[{name:'energie-originalbilder',setup(build){
    build.onLoad({filter:/sim-core[/\\]images\.ts$/},args=>({loader:'ts',contents:fs.readFileSync(args.path,'utf8').replace(/const FILES = import\.meta\.glob\([\s\S]*?as Record<string, string>;/,`const FILES: Record<string,string> = ${JSON.stringify(assetMap)};`)}));
  }}]});
  console.log(`V13: ${catalog.simulations.length} Originaleinträge; Original-Energieerhaltung gebündelt.`);
})().catch(e=>{console.error(e);process.exitCode=1;});

