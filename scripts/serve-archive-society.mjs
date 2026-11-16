import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleArchiveService } from '../server/archive-services.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8'};
export const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const api=/^\/api\/archive-society\/(status|lakehouse|voice)$/.exec(url.pathname);
  if(api)return handleArchiveService(api[1],req,res);
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let path;
  try{path=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}
  if(path==='/')path='/demo/archive-society/';
  if(path.endsWith('/'))path+='index.html';
  const allowed=path.startsWith('/demo/archive-society/')||path.startsWith('/demo/discovery-lab/')||path.startsWith('/demo/spatial-atlas/')||path.startsWith('/demo/object-lens/')||path==='/node_modules/three/build/three.module.js'||/^\/src\/(archive-society|archive-evidence|discovery-graph|discovery-personas|discovery-dialogue|atlas-graph|atlas-scripts|matrix-room|matrix-objects)\.mjs$/.test(path)||['/docs/archive-society.md','/examples/archive-society.synthetic.csv'].includes(path);
  if(!allowed||path.split('/').some(p=>p.startsWith('.'))){res.writeHead(404);return res.end('Not found');}
  try{
    const file=await realpath(resolve(root,'.'+path));
    if(!file.startsWith(root+sep))throw new Error('outside root');
    const bytes=await readFile(file);
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
    res.end(req.method==='HEAD'?undefined:bytes);
  }catch{res.writeHead(404);res.end('Not found');}
});
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||8787);
  server.listen(port,'127.0.0.1',()=>console.log('Archive Society: http://127.0.0.1:'+server.address().port+'/demo/archive-society/'));
}
