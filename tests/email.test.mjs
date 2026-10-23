import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../site.config.js';
import {createWishEmail,sendWishEmail,wishEmailFallback} from '../wish-email.js';
const wish=changes=>({name:'Family & Friends',contact:'guest@example.com',note:'Wishing you love & laughter. शुभकामनाएँ ♡',consent:true,website:'',...changes});
test('Email request addresses Rahul and preserves the wish without attendance data',()=>{
  const payload=wish(),request=createWishEmail(config,payload);
  assert.equal(request.endpoint,'https://formsubmit.co/ajax/rahulpareek3366%40gmail.com');
  assert.equal(request.fields.name,payload.name);assert.equal(request.fields.message,payload.note);assert.equal(request.fields.contact,payload.contact);assert.equal(request.fields._replyto,payload.contact);
  assert.equal(request.fields._url,'https://hedaprateek.github.io/wedding-celebration/#rsvp');assert.match(request.fields._subject,/Wedding wishes for Prerna & Shubham/);
  assert.equal(request.fields._honey,'');assert.equal(request.fields.guests,undefined);assert.equal(request.fields.attendance,undefined);
  const phone=createWishEmail(config,wish({contact:'+91 90000 00000'}));assert.equal(phone.fields._replyto,undefined);assert.equal(phone.fields.contact,'+91 90000 00000');
  for(const change of [{consent:false},{name:' '},{note:' '},{note:'x'.repeat(601)},{contact:'bad contact'},{website:'bot'}])assert.throws(()=>createWishEmail(config,wish(change)));
});
test('Email delivery accepts only a successful service acknowledgement and sends no credentials',async()=>{
  const request=createWishEmail(config,wish());let seen;
  const accepted=await sendWishEmail(request,async(url,options)=>{seen={url,options};return {ok:true,json:async()=>({success:'true',message:'Form submitted successfully.'})};});
  assert.equal(accepted.state,'accepted');assert.equal(seen.url,request.endpoint);assert.equal(seen.options.credentials,'omit');assert.equal(seen.options.method,'POST');assert.deepEqual(JSON.parse(seen.options.body),request.fields);
  assert.equal((await sendWishEmail(request,async()=>({ok:true,json:async()=>({success:true})}))).state,'accepted');
  for(const mock of [async()=>({ok:false,json:async()=>({success:true})}),async()=>({ok:true,json:async()=>({success:false})}),async()=>({ok:true,json:async()=>({})}),async()=>({ok:true,json:async()=>{throw Error('HTML error page')}}),async()=>{throw Error('Network error')}])await assert.rejects(sendWishEmail(request,mock));
});
test('Unactivated relay is not presented as delivery, and email fallback preserves the complete message',async()=>{
  const payload=wish(),request=createWishEmail(config,payload);
  const pending=await sendWishEmail(request,async()=>({ok:true,json:async()=>({success:true,message:'Please activate the form. Check your email.'})}));assert.equal(pending.state,'activation-needed');
  const url=new URL(wishEmailFallback(config,payload));assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,config.contact.email);assert.ok(url.searchParams.get('body').includes(payload.note));assert.ok(url.searchParams.get('body').includes(payload.contact));
});
