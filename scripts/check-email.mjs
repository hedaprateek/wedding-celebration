import config from '../site.config.js';
import {createWishEmail} from '../wish-email.js';
const operation=process.env.EMAIL_SETUP_ACTION||'check';
if(!['check','activate'].includes(operation))throw Error('Choose check or activate.');
if(operation==='check'){
  const response=await fetch('https://formsubmit.co/',{signal:AbortSignal.timeout(20000)});
  console.log(JSON.stringify({operation,httpStatus:response.status}));
  await response.body?.cancel();
  if(!response.ok)process.exitCode=1;
}else{
  // A manual, single setup request. This workflow never sends guest messages.
  const request=createWishEmail(config,{name:'Wedding website setup',contact:config.contact.email,note:'Setup check for Prerna and Shubham’s wedding wishes form. This is a configuration message, not a guest wish. If this is the first request, use the FormSubmit activation email to enable delivery from the wedding website.',consent:true,website:''});
  request.fields._subject='Wedding wishes email setup — Prerna & Shubham';
  const response=await fetch(request.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(request.fields),signal:AbortSignal.timeout(20000)});
  let result;try{result=await response.json();}catch{throw Error('The email service did not return a valid acknowledgement.');}
  console.log(JSON.stringify({operation,recipient:config.contact.email,httpStatus:response.status,success:result.success,message:String(result.message||'').slice(0,600)}));
  if(!response.ok||![true,'true'].includes(result.success))process.exitCode=1;
}
