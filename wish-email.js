const clean=(value,max,label)=>{
  if(typeof value!=='string'||!value.trim()||value.length>max||value.includes('\0'))throw Error('Please check '+label+'.');
  return value.trim();
};
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function createWishEmail(config,response){
  if(!emailPattern.test(config.contact.email))throw Error('The family email is not configured.');
  if(response.consent!==true)throw Error('Please agree to share your message with the family.');
  if(response.website)throw Error('Please leave the hidden field empty.');
  const name=clean(response.name,100,'your name'),contact=clean(response.contact,160,'your contact details'),message=clean(response.note,600,'your wishes');
  const phone=/^[+\d\s().-]+$/.test(contact)&&contact.replace(/\D/g,'').length>=7&&contact.replace(/\D/g,'').length<=15;
  if(!emailPattern.test(contact)&&!phone)throw Error('Please enter a valid email address or mobile number.');
  const url=new URL(config.siteUrl);if(!['http:','https:'].includes(url.protocol))throw Error('The website address is not configured.');url.hash='rsvp';
  const subject='Wedding wishes for '+config.couple.first+' & '+config.couple.second;
  const fields={name,contact,message,_subject:subject+' — '+name.replace(/[\r\n]+/g,' '),_template:'table',_captcha:'false',_honey:'',_url:url.href};
  if(emailPattern.test(contact)){fields.email=contact;fields._replyto=contact;}
  return {endpoint:'https://formsubmit.co/ajax/'+encodeURIComponent(config.contact.email),fields};
}
export function wishEmailFallback(config,response){
  const subject='Wedding wishes for '+config.couple.first+' & '+config.couple.second;
  const body='With love, from: '+response.name+'\nContact: '+response.contact+'\n\n'+response.note;
  return 'mailto:'+config.contact.email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
export async function sendWishEmail(request,fetcher=globalThis.fetch){
  const response=await fetcher(request.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},credentials:'omit',body:JSON.stringify(request.fields),signal:AbortSignal.timeout(20000)});
  let result;try{result=await response.json();}catch{throw Error('Email submission was not confirmed. Your message is still here.');}
  const message=typeof result?.message==='string'?result.message:'';
  if(response.ok&&/activat|confirm (?:your|the) (?:email|form)|check your (?:email|inbox)/i.test(message))return {state:'activation-needed'};
  if(!response.ok||![true,'true'].includes(result?.success))throw Error('Email submission was not confirmed. Your message is still here.');
  return {state:'accepted'};
}
