import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {createWeddingServer} from '../server.mjs';
const fixtures=resolve(dirname(fileURLToPath(import.meta.url)),'fixtures');await mkdir(fixtures,{recursive:true});
const note=changes=>({id:randomUUID(),page:'home',selector:'#hero-name',targetText:'Prerna Pareek',tag:'span',heading:'Prerna weds Shubham',text:'Make the name larger. प्रेरणा',viewport:{width:1440,height:1000},point:{x:.5,y:.5},day:'all',photoFilter:'all',...changes});
async function fixture(run,options={}){
  const directory=await mkdtemp(resolve(fixtures,'review-'));let server;
  const start=async()=>{server=await createWeddingServer({dataDirectory:directory,...options});await new Promise(done=>server.listen(0,'127.0.0.1',done));return `http://127.0.0.1:${server.address().port}`;};
  const stop=async()=>{server.closeAllConnections();await new Promise(done=>server.close(done));};
  try{const base=await start();await run({base,directory,restart:async()=>{await stop();return start();},put:(value,headers={})=>fetch(base+'/api/review',{method:'PUT',headers:{'Content-Type':'application/json',Origin:base,...headers},body:JSON.stringify(value)})});}
  finally{if(server?.listening)await stop();if(dirname(directory)!==fixtures)throw Error('Unexpected review fixture cleanup target');await rm(directory,{recursive:true,force:true});}
}
test('Local review is opt-in and persists pins and ready status across restarts',async()=>fixture(async({base,put,directory,restart})=>{
  const plain=await(await fetch(base+'/')).text();assert.doesNotMatch(plain,/src="review\.js"/);
  const review=await(await fetch(base+'/?review=1#home')).text();assert.match(review,/src="review\.js"/);assert.match(review,/href="review\.css"/);
  assert.equal((await fetch(base+'/review.js')).status,200);
  const initial=await(await fetch(base+'/api/review')).json();assert.equal(initial.revision,0);assert.deepEqual(initial.notes,[]);
  const first=note();let response=await put({revision:0,status:'draft',notes:[first]});assert.equal(response.status,200);let data=await response.json();assert.equal(data.revision,1);assert.equal(data.notes[0].text,first.text);
  response=await put({revision:1,status:'ready',notes:data.notes});assert.equal(response.status,200);data=await response.json();assert.equal(data.status,'ready');assert.ok(data.completedAt);
  const newBase=await restart();const saved=await(await fetch(newBase+'/api/review')).json();assert.equal(saved.revision,2);assert.equal(saved.notes[0].selector,'#hero-name');assert.equal(saved.status,'ready');assert.equal(JSON.parse(await readFile(resolve(directory,'review-notes.json'),'utf8')).notes[0].text,first.text);
}));
test('Stale or simultaneous reviews cannot overwrite newer feedback',async()=>fixture(async({put,base})=>{
  const n=note();const results=await Promise.all([put({revision:0,status:'draft',notes:[n]}),put({revision:0,status:'draft',notes:[note({text:'Other window'})]})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  const saved=await(await fetch(base+'/api/review')).json();assert.equal(saved.notes.length,1);assert.equal(saved.revision,1);
  assert.equal((await put({revision:1,status:'draft',notes:[]})).status,200);assert.equal((await(await fetch(base+'/api/review')).json()).notes.length,0);
}));
test('Review validation and same-origin writes preserve existing notes',async()=>fixture(async({put,base})=>{
  const n=note();assert.equal((await put({revision:0,status:'draft',notes:[n]})).status,200);
  for(const changes of [{text:''},{text:'a'.repeat(3001)},{page:'unknown'},{point:{x:2,y:0}},{viewport:{width:0,height:900}},{id:'short'},{selector:'a'.repeat(1501)}])assert.equal((await put({revision:1,status:'draft',notes:[note(changes)]})).status,400);
  assert.equal((await put({revision:1,status:'ready',notes:[]})).status,400);
  assert.equal((await put({revision:1,status:'draft',notes:[n,n]})).status,400);
  assert.equal((await put({revision:1,status:'draft',notes:[n]},{Origin:'https://other.example'})).status,403);
  assert.equal((await fetch(base+'/api/review',{method:'PUT',headers:{'Content-Type':'application/json'},body:'{}'})).status,403);
  assert.equal((await put({revision:1,status:'draft',notes:[n]},{'Content-Type':'text/plain'})).status,415);
  assert.equal((await put({revision:1,status:'draft',notes:[note({text:'x'.repeat(600001)})]})).status,413);
  const saved=await(await fetch(base+'/api/review')).json();assert.equal(saved.notes[0].text,n.text);assert.equal(saved.revision,1);
  for(const path of ['/.data/review-notes.json','/review-store.mjs'])assert.equal((await fetch(base+path)).status,404);
}));
test('Hosted invitation disables review assets, API and injection',async()=>fixture(async({base,put})=>{
  for(const path of ['/api/review','/review.js','/review.css'])assert.equal((await fetch(base+path)).status,404,path);
  assert.equal((await put({revision:0,status:'draft',notes:[note()]})).status,404);
  assert.doesNotMatch(await(await fetch(base+'/?review=1')).text(),/src="review\.js"|href="review\.css"/);
},{publicOrigin:'https://wedding.example'}));
test('Unreadable review files are preserved instead of silently replaced',async()=>fixture(async({directory,put})=>{
  const file=resolve(directory,'review-notes.json');await writeFile(file,'{broken review');assert.equal((await put({revision:0,status:'draft',notes:[note()]})).status,503);assert.equal(await readFile(file,'utf8'),'{broken review');
}));
