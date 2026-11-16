import http from 'node:http';
import { readFile, realpath } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleArchiveService } from '../server/archive-services.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const objectImageRoot=resolve(root,'../wolfsonian-public-api-research/data/data-images-wolfsonian-archive-dreams-in-public');
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.csv':'text/csv; charset=utf-8','.json':'application/json; charset=utf-8'};
export function objectImageName(urlPath){
  const prefix='/data/object-images/';
  if(!urlPath.startsWith(prefix))return '';
  const name=urlPath.slice(prefix.length);
  if(!name||name.includes('/')||name.includes('\\')||name.includes('\0')||name.startsWith('.'))return '';
  return name;
}
export const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  const api=/^\/api\/archive-society\/(status|lakehouse|voice)$/.exec(url.pathname);
  if(api)return handleArchiveService(api[1],req,res);
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let path;
  try{path=decodeURIComponent(url.pathname);}catch{res.writeHead(400);return res.end();}
  const imageName=objectImageName(path);
  if(imageName){
    try{
      const base=await realpath(objectImageRoot);
      const file=await realpath(resolve(base,imageName));
      if(file!==base&&!file.startsWith(base+sep))throw new Error('outside images');
      const bytes=await readFile(file);
      res.writeHead(200,{'Content-Type':types[extname(file).toLowerCase()]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});
      return res.end(req.method==='HEAD'?undefined:bytes);
    }catch{res.writeHead(404);return res.end('Not found');}
  }
  if(path==='/')path='/demo/archive-society/';
  if(path.endsWith('/'))path+='index.html';
  const allowed=path.startsWith('/demo/archive-society/')||path.startsWith('/demo/discovery-lab/')||path.startsWith('/demo/spatial-atlas/')||path.startsWith('/demo/object-lens/')||path.startsWith('/demo/about/')||path.startsWith('/demo/vendor/')||path==='/demo/force-stage.mjs'||path.startsWith('/node_modules/three/')||path.startsWith('/node_modules/three-forcegraph/')||path.startsWith('/node_modules/d3-force-3d/')||path==='/data/lakehouse/project-matches.json'||/^\/src\/(archive-society|archive-evidence|discovery-graph|discovery-personas|discovery-dialogue|atlas-graph|atlas-scripts|matrix-room|matrix-objects|lakehouse-matches|session-images|force-graph-data|local-images|local-image-index|sprite-fit|presentation-pairs|voice-cast)\.mjs$/.test(path)||['/docs/archive-society.md','/examples/archive-society.synthetic.csv'].includes(path);
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
