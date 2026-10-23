import config from '../site.config.js';
import {createWishEmail} from '../wish-email.js';
const operation=process.env.EMAIL_SETUP_ACTION||'check';
if(!['check','activate'].includes(operation))throw Error('Choose check or activate.');
async function inspectResponse(response){
  const text=await response.text();
  let result;try{result=JSON.parse(text);}catch{}
  const title=text.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
  console.log(JSON.stringify({operation,httpStatus:response.status,contentType:response.headers.get('content-type'),url:response.url,
    ...(result?{success:result.success,message:String(result.message||'').slice(0,600)}:{pageTitle:title||null})}));
  return result;
}
if(operation==='check'){
  for(const url of ['https://formsubmit.co/','https://formsubmit.co/ajax/'+encodeURIComponent(config.contact.email)]){
    const response=await fetch(url,{signal:AbortSignal.timeout(20000)});
    await inspectResponse(response);
    if(!response.ok)process.exitCode=1;
  }
}else{
  // A manual, single setup request. This workflow never sends guest messages.
  const request=createWishEmail(config,{name:'Wedding website setup',contact:config.contact.email,note:'Setup check for Prerna and Shubham’s wedding wishes form. This is a configuration message, not a guest wish. If this is the first request, use the FormSubmit activation email to enable delivery from the wedding website.',consent:true,website:''});
  request.fields._subject='Wedding wishes email setup — Prerna & Shubham';
  const response=await fetch(request.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(request.fields),signal:AbortSignal.timeout(20000)});
  const result=await inspectResponse(response);
  if(!result)throw Error('The email service returned a non-JSON response. No activation email has been confirmed; see the HTTP status and page title above.');
  if(!response.ok||![true,'true'].includes(result.success))process.exitCode=1;
}
