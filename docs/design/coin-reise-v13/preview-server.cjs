const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const base=__dirname;
const port=Number(process.env.PORT)||4181;
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.woff':'font/woff','.json':'application/json','.webmanifest':'application/manifest+json','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
  let file;
  try{const url=new URL(req.url,'http://127.0.0.1');file=path.resolve(base,'.'+decodeURIComponent(url.pathname));}catch{res.writeHead(400);return res.end();}
  if(file!==base&&!file.startsWith(base+path.sep)){res.writeHead(403);return res.end();}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');}catch{res.writeHead(404);return res.end('Nicht gefunden');}
  if(!fs.existsSync(file)){res.writeHead(404);return res.end('Nicht gefunden');}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')return res.end();
  fs.createReadStream(file).on('error',()=>res.end()).pipe(res);
});
server.on('error',error=>{if(error.code==='EADDRINUSE')console.log('Die Vorschau läuft möglicherweise bereits: http://127.0.0.1:'+port+'/');else console.error(error);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>console.log('Scitura-Vorschau: http://127.0.0.1:'+port+'/'));
