import http from 'node:http';
import {readFile,appendFile,mkdir,stat} from 'node:fs/promises';
import {dirname,resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {spawn} from 'node:child_process';
import config from './site.config.js';

const root=dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2','.md':'text/plain; charset=utf-8'};
const publicFiles=new Set(['index.html','app.js','experience.js','navigation.js','invitation-utils.js','runtime.js','site.config.js','styles.css','experience.css','assets/stunity-credit.css','assets/favicon.svg','assets/florals.svg','assets/palace.svg','assets/fonts/fonts.css',...config.gallery.map(p=>p.src)]);
for(let i=1;i<=10;i++)publicFiles.add(`assets/fonts/font-${i}.woff2`);
class RequestError extends Error{constructor(status,message){super(message);this.status=status;}}
const cleanText=(value,max,required=false)=>{if(typeof value!=='string'||value.length>max||value.includes('\0')||(required&&!value.trim()))throw new RequestError(400,'Please check your name, contact details, song suggestion and note.');return value.trim();};
export function validateRsvp(value){
  if(!value||typeof value!=='object'||Array.isArray(value))throw new RequestError(400,'Please complete the RSVP form.');
  if(value.website)throw new RequestError(400,'Please submit the invitation form directly.');
  const name=cleanText(value.name,100,true),contact=cleanText(value.contact,160,true),note=cleanText(value.note??'',600),song=cleanText(value.song??'',160);
  const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact),phone=/^[+\d\s().-]+$/.test(contact)&&contact.replace(/\D/g,'').length>=7&&contact.replace(/\D/g,'').length<=15;
  if(!email&&!phone)throw new RequestError(400,'Please enter a valid email address or mobile number.');
  if(!['yes','no'].includes(value.attendance)||value.consent!==true)throw new RequestError(400,'Please choose your attendance and agree to share your details with the hosts.');
  const guests=value.attendance==='yes'?Number(value.guests):0;
  if(value.attendance==='yes'&&(!['number','string'].includes(typeof value.guests)||!Number.isInteger(guests)||guests<1||guests>8))throw new RequestError(400,'Please choose between 1 and 8 guests.');
  const events=value.attendance==='yes'?value.events:[];
  if(!Array.isArray(events)||events.length>config.events.length||(value.attendance==='yes'&&!events.length)||events.some(id=>!config.events.some(e=>e.id===id)))throw new RequestError(400,'Please choose at least one valid celebration.');
  const requestId=value.requestId||randomUUID();if(typeof requestId!=='string'||!/^[a-z\d-]{16,80}$/i.test(requestId))throw new RequestError(400,'Please reload the invitation and try again.');
  return {name,contact,contactKey:email?'email:'+contact.toLowerCase():'phone:'+contact.replace(/\D/g,''),attendance:value.attendance,guests,events:[...new Set(events)],note,song,consent:true,requestId};
}
const escapeHtml=text=>String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export function csvCell(value){let text=String(value??'').replace(/[\r\n]+/g,' ');if(/^\s*[=+\-@\t]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
export async function createWeddingServer({dataDirectory=resolve(root,'.data'),publicOrigin=process.env.PUBLIC_ORIGIN||'',rateLimit=20,maxRecords=10_000}={}){
  const recordFile=resolve(dataDirectory,'rsvps.jsonl');await mkdir(dataDirectory,{recursive:true});const responses=new Map(),requests=new Set(),rates=new Map();let queued=Promise.resolve();
  try{const existing=await readFile(recordFile,'utf8');for(const line of existing.split('\n').filter(Boolean)){const record=JSON.parse(line);if(!record.contactKey||!record.requestId)throw Error('An RSVP record is incomplete.');responses.set(record.contactKey,record);requests.add(record.requestId);}}catch(error){if(error.code!=='ENOENT')throw Error('The RSVP file could not be loaded. Preserve .data and check its contents before restarting.');}
  const publicUrl=publicOrigin?new URL(publicOrigin):null;
  const json=(response,status,data)=>{response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});response.end(JSON.stringify(data));};
  const message=()=>config.preview?'Thank you! Your preview RSVP has been saved to this computer’s guest list. The family has not been notified.':'Thank you! Your response has been recorded for the wedding hosts. We’re grateful for your warm wishes.';
  const server=http.createServer(async(request,response)=>{
    response.setHeader('X-Content-Type-Options','nosniff');response.setHeader('Referrer-Policy','same-origin');response.setHeader('X-Frame-Options','DENY');
    response.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    try{
      const host=request.headers.host||'';let origin;
      try{origin=new URL('http://'+host);}catch{throw new RequestError(421,'Unknown host.');}
      const localHost=['localhost','127.0.0.1','[::1]'].includes(origin.hostname);
      if(!localHost&&(!publicUrl||origin.host!==publicUrl.host))throw new RequestError(421,'Unknown host.');
      const allowedOrigins=new Set([`http://localhost:${server.address().port}`,`http://127.0.0.1:${server.address().port}`,...(publicUrl?[publicUrl.origin]:[])]);
      if((request.headers.origin&&!allowedOrigins.has(request.headers.origin))||request.headers['sec-fetch-site']==='cross-site')throw new RequestError(403,'Please use the wedding invitation directly.');
      const url=new URL(request.url,origin);const path=decodeURIComponent(url.pathname);
      const loopback=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(request.socket.remoteAddress);
      const adminAllowed=localHost&&loopback&&!publicUrl;
      if(path==='/api/rsvp'){
        if(request.method!=='POST')throw new RequestError(405,'Use the RSVP form to submit your response.');
        const now=Date.now(),ip=request.socket.remoteAddress;let rate=rates.get(ip);if(!rate||now-rate.start>60000){rate={start:now,count:0};rates.set(ip,rate);}if(++rate.count>rateLimit)throw new RequestError(429,'A few too many responses arrived together. Please wait one minute and try again.');
        if(Number(request.headers['content-length']||0)>16384){request.resume();throw new RequestError(413,'Your response is too long. Please shorten your note.');}
        const chunks=[];let size=0;for await(const chunk of request){size+=chunk.length;if(size>16384)throw new RequestError(413,'Your response is too long.');chunks.push(chunk);}const body=Buffer.concat(chunks).toString('utf8');
        const isJson=request.headers['content-type']?.split(';')[0]==='application/json';let value;
        if(isJson){try{value=JSON.parse(body)}catch{throw new RequestError(400,'The RSVP response was not valid. Please try again.')}}
        else if(request.headers['content-type']?.startsWith('application/x-www-form-urlencoded')){const fields=new URLSearchParams(body);value={...Object.fromEntries(fields),events:fields.getAll('events'),consent:fields.get('consent')==='yes'};}
        else throw new RequestError(415,'Please submit the RSVP form directly.');
        const record=validateRsvp(value);
        const saved=queued.then(async()=>{if(requests.has(record.requestId))return {duplicate:true,updated:false};if(responses.size>=maxRecords&&!responses.has(record.contactKey))throw new RequestError(503,'The guest list is temporarily full. Please contact the wedding hosts.');const previous=responses.get(record.contactKey);const stored={...record,id:previous?.id||randomUUID(),createdAt:previous?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),preview:config.preview};const info=await stat(recordFile).catch(error=>{if(error.code==='ENOENT')return {size:0};throw error;});if(info.size>10*1024*1024)throw new RequestError(503,'The guest list needs the host’s attention. Please contact the family.');await appendFile(recordFile,JSON.stringify(stored)+'\n',{mode:0o600});responses.set(record.contactKey,stored);requests.add(record.requestId);return {updated:Boolean(previous),duplicate:false};});
        queued=saved.catch(()=>{});const result=await saved;
        if(isJson){json(response,result.updated||result.duplicate?200:201,{ok:true,...result,message:message()});}
        else{response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Thank you for your RSVP</title><link rel="stylesheet" href="/styles.css"><main class="section-shell padded-section"><p class="eyebrow">YOUR RESPONSE IS SAVED</p><h1>Thank you, ${escapeHtml(record.name)}.</h1><p>${escapeHtml(message())}</p><p><a class="text-button" href="/">Back to the invitation →</a></p></main></html>`);}return;
      }
      if(path==='/api/guest-list'||path==='/api/guest-list.csv'){
        if(!adminAllowed)throw new RequestError(404,'Not found.');if(request.method!=='GET')throw new RequestError(405,'Read-only endpoint.');
        const rows=[...responses.values()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
        if(path.endsWith('.csv')){const headings=['Name','Contact','Attendance','Guests','Celebrations','Note','Song suggestion','Updated','Preview'];const lines=[headings.map(csvCell).join(','),...rows.map(row=>[row.name,row.contact,row.attendance,row.guests,row.events.map(id=>config.events.find(e=>e.id===id)?.title).join('; '),row.note,row.song||'',row.updatedAt,row.preview?'Yes':'No'].map(csvCell).join(','))];response.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="wedding-guest-list.csv"','Cache-Control':'no-store'});response.end('\uFEFF'+lines.join('\r\n'));}
        else json(response,200,{preview:config.preview,rows:rows.map(({contactKey,requestId,...row})=>row),events:config.events.map(({id,title})=>({id,title}))});return;
      }
      if(request.method!=='GET'&&request.method!=='HEAD')throw new RequestError(405,'Method not allowed.');
      let file=path==='/'?'index.html':path.replace(/^\//,'');
      if(path==='/guest-list'){if(!adminAllowed)throw new RequestError(404,'Not found.');file='guest-list.html';}
      if(['guest-list.js','guest-list.css'].includes(file)&&!adminAllowed)throw new RequestError(404,'Not found.');
      if(!publicFiles.has(file)&&!['guest-list.html','guest-list.js','guest-list.css'].includes(file))throw new RequestError(404,'Not found.');
      if(file==='guest-list.html'&&!adminAllowed)throw new RequestError(404,'Not found.');
      let bytes=await readFile(resolve(root,file));
      if(file==='index.html'){const choices=config.events.map(event=>`<label><input type="checkbox" name="events" value="${escapeHtml(event.id)}"${['wedding','reception'].includes(event.id)?' checked':''}>${escapeHtml(event.title)}</label>`).join('');bytes=Buffer.from(bytes.toString('utf8').replace('<!-- server-rsvp-events -->',choices));}
      response.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':file.startsWith('assets/')?'public, max-age=3600':'no-cache'});response.end(request.method==='HEAD'?undefined:bytes);
    }catch(error){if(response.headersSent){response.end();return;}const status=error.status||(error.code==='ENOENT'?404:500);json(response,status,{error:status===500?'Your response was not saved. Please try again or contact the hosts.':error.message});}
  });
  return server;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||process.argv.find(arg=>/^\d+$/.test(arg))||8801);const host=process.env.HOST||'127.0.0.1';const server=await createWeddingServer();
  server.listen(port,host,()=>{const url=`http://localhost:${port}`;console.log(`Wedding invitation: ${url}\nLocal guest list: ${process.env.PUBLIC_ORIGIN?'Disabled for public hosting':url+'/guest-list'}\nPress Ctrl+C to stop.`);if(process.argv.includes('--open')&&process.platform==='win32')spawn('powershell.exe',['-NoProfile','-Command',`Start-Process '${url}'`],{windowsHide:true,stdio:'ignore'});});
  server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Close the previous preview or use another PORT.`:error.message);process.exitCode=1;});
}
