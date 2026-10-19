import {readFile,writeFile,rename,stat} from 'node:fs/promises';
import {resolve} from 'node:path';

const pages=new Set(['home','invitation','celebrations','memories','travel','rsvp','general']);
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const text=(value,max,required=false)=>{
  if(typeof value!=='string'||value.length>max||value.includes('\0')||(required&&!value.trim()))fail(400,'Please shorten your review note or select the area again.');
  return value.trim();
};
function note(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||!pages.has(value.page)||typeof value.id!=='string'||!/^[a-z\d-]{16,80}$/i.test(value.id))fail(400,'This review note is invalid. Please select the area again.');
  const size=value.viewport;
  if(!size||![size.width,size.height].every(n=>Number.isInteger(n)&&n>0&&n<=10000))fail(400,'The review screen size is invalid.');
  const point=value.point;
  if(!point||![point.x,point.y].every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=1))fail(400,'The review pin position is invalid.');
  return {id:value.id,page:value.page,selector:text(value.selector,1500),targetText:text(value.targetText,300),tag:text(value.tag,30),heading:text(value.heading,200),text:text(value.text,3000,true),viewport:{width:size.width,height:size.height},point:{x:point.x,y:point.y},day:text(value.day||'all',20),photoFilter:text(value.photoFilter||'all',30)};
}
const empty=()=>({version:1,revision:0,status:'draft',updatedAt:null,completedAt:null,notes:[]});

// A private local review, separate from RSVP records. Revision checks prevent an older tab overwriting newer notes.
export function createReviewStore(directory){
  const file=resolve(directory,'review-notes.json');let queue=Promise.resolve();
  async function load(){
    try{
      if((await stat(file)).size>600000)fail(503,'The review file needs attention. Your existing notes have been preserved.');
      const data=JSON.parse(await readFile(file,'utf8'));
      if(data.version!==1||!Number.isInteger(data.revision)||!Array.isArray(data.notes))throw Error('Invalid review file');
      return data;
    }catch(error){if(error.code==='ENOENT')return empty();fail(503,'The saved review could not be read. Your existing file has been preserved.');}
  }
  return {
    get:async()=>{await queue;return load();},
    update(value){
      const operation=queue.then(async()=>{
        if(!value||!Array.isArray(value.notes)||value.notes.length>100||!['draft','ready'].includes(value.status)||!Number.isInteger(value.revision))fail(400,'Please check your review notes. A review can contain up to 100 notes.');
        const notes=value.notes.map(note);
        if(new Set(notes.map(n=>n.id)).size!==notes.length)fail(400,'Duplicate review notes were not saved.');
        if(value.status==='ready'&&!notes.length)fail(400,'Add at least one note before finishing your review.');
        const previous=await load();
        if(value.revision!==previous.revision)fail(409,'The review changed in another window. Reload the saved review before continuing. Your unsaved text is still here.');
        const now=new Date().toISOString();
        const data={version:1,revision:previous.revision+1,status:value.status,updatedAt:now,completedAt:value.status==='ready'?now:null,notes:notes.map(n=>({...n,createdAt:previous.notes.find(p=>p.id===n.id)?.createdAt||now}))};
        try{await writeFile(file+'.tmp',JSON.stringify(data,null,2)+'\n',{mode:0o600});await rename(file+'.tmp',file);}catch{fail(503,'Your review could not be saved. Keep this window open and try again.');}
        return data;
      });
      queue=operation.catch(()=>{});return operation;
    }
  };
}
