// Erstellt eine portable lokale Referenz, ohne den Astro-Build zu ändern.
const fs=require('node:fs');
const path=require('node:path');
const here=__dirname;
const project=path.resolve(here,'../../..');
const dist=path.join(project,'dist');
const output=path.resolve(project,process.argv[2]||'.scitura-preview');
if (output===project || output===dist || output.startsWith(dist+path.sep) || output===here || output.startsWith(here+path.sep)) throw Error('Ziel muss außerhalb der Eingabeordner liegen.');
if (!fs.existsSync(path.join(dist,'de/index.html'))) throw Error('Zuerst npm run build im Projekt ausführen.');
if (fs.existsSync(output)) throw Error('Ziel existiert bereits. Einen neuen Zielordner als Argument angeben: '+output);
let html=fs.readFileSync(path.join(here,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+fs.readFileSync(path.join(here,'style.css'),'utf8')+'</style>');
const scripts=[];
for(const name of ['catalog.js','variants.js','app.js','sculpture.js','stage.js']){
 html=html.replace('<script src="'+name+'" defer></script>','');
 scripts.push(fs.readFileSync(path.join(here,name),'utf8').replaceAll('</script','<\\/script'));
}
html=html.replace('</body>','<script>'+scripts.join('\n')+'</script></body>');
for(const name of ['scitura-logo.png','scitura-icon.png']) html=html.replaceAll('assets/'+name,'data:image/png;base64,'+fs.readFileSync(path.join(here,'assets',name)).toString('base64'));
fs.cpSync(dist,output,{recursive:true});
for(const name of ['index.html','de/index.html','en/index.html']){
 const target=path.join(output,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);
}
fs.mkdirSync(path.join(output,'varianten'),{recursive:true});
const variants=fs.readFileSync(path.join(here,'variants.html'),'utf8').replace('<script src="variants.js"></script>','<script>'+fs.readFileSync(path.join(here,'variants.js'),'utf8')+'</script>');
fs.writeFileSync(path.join(output,'varianten/index.html'),variants);
fs.cpSync(path.join(here,'assets/variants'),path.join(output,'vergleich'),{recursive:true});
fs.copyFileSync(path.join(here,'preview-server.cjs'),path.join(output,'preview-server.cjs'));
fs.writeFileSync(path.join(output,'Vorschau-starten.cmd'),'@echo off\r\ncd /d "%~dp0"\r\necho Scitura: http://127.0.0.1:4181/\r\nnode preview-server.cjs\r\nif errorlevel 1 pause\r\n');
fs.writeFileSync(path.join(output,'LIESMICH.md'),'# Scitura – lokale Vorschau\n\nNode.js erforderlich. Im Ordner `node preview-server.cjs` ausführen und http://127.0.0.1:4181/ öffnen. Unter Windows alternativ Vorschau-starten.cmd. Mit Strg+C stoppen. Bei belegtem Port über die Umgebungsvariable PORT einen anderen Port wählen. Nur lokal gebunden (127.0.0.1).\n\nStartseite: aktueller Entwurf mit dunklem Logo 01. Verlinkte Originalsimulationen und Unterseiten: eingefrorener Original-Projektstand; deren alte Markenbeschriftungen muss die produktive Integration ersetzen.\n');
console.log('Scitura-Vorschau erstellt: '+output);
