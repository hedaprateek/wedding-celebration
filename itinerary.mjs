import {eventDay,hasDate} from './invitation-utils.js';

// A self-contained, two-page PDF. Generated from the same configuration as the website on every build.
const W=595.28,H=841.89;
const ink=[.13,.25,.22],pink=[.74,.20,.39],gold=[.68,.50,.25],muted=[.39,.43,.38],line=[.86,.83,.75];
const rgb=values=>values.map(n=>n.toFixed(3)).join(' ');
const numeric=n=>Number(n.toFixed(2));
function pdfText(value){
  const substitutions={'—':'\x97','–':'\x96','·':'\xb7','’':'\x92','‘':'\x91','“':'\x93','”':'\x94'};
  return String(value).replace(/[—–·’‘“”]/g,c=>substitutions[c]).replace(/[^\x20-\xff]/g,' ').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');
}
function wrap(value,max){
  const words=String(value).replace(/\s+/g,' ').trim().split(' '),lines=[];let current='';
  for(const word of words){if(current&&(current+' '+word).length>max){lines.push(current);current=word;}else current+=(current?' ':'')+word;}
  if(current)lines.push(current);return lines;
}
export function createItinerary(config){
  const days=[...new Set(config.events.filter(hasDate).map(e=>eventDay(e,config.timezone)))].sort();
  if(days.length!==2)throw Error('The wedding itinerary needs exactly two confirmed programme days.');
  const objects=[];
  const reserve=()=>{objects.push(null);return objects.length;};
  const set=(id,value)=>{objects[id-1]=Buffer.isBuffer(value)?value:Buffer.from(value,'latin1');};
  const catalog=reserve(),pages=reserve(),regular=reserve(),bold=reserve(),serif=reserve(),mono=reserve(),info=reserve();
  for(const [id,name] of [[regular,'Helvetica'],[bold,'Helvetica-Bold'],[serif,'Times-Italic'],[mono,'Courier']])set(id,'<< /Type /Font /Subtype /Type1 /BaseFont /'+name+' /Encoding /WinAnsiEncoding >>');
  const pageIds=[];
  for(const [dayIndex,day] of days.entries()){
    const page=reserve(),content=reserve(),link=reserve();pageIds.push(page);const commands=[];
    const rect=(x,y,w,h,colour)=>commands.push(rgb(colour)+' rg '+[x,y,w,h].map(numeric).join(' ')+' re f');
    const rule=(x1,y1,x2,y2,colour=line)=>commands.push(rgb(colour)+' RG .6 w '+numeric(x1)+' '+numeric(y1)+' m '+numeric(x2)+' '+numeric(y2)+' l S');
    const text=(value,x,y,size=11,font='F1',colour=ink,spacing=0)=>commands.push('BT /'+font+' '+size+' Tf '+rgb(colour)+' rg '+spacing+' Tc 1 0 0 1 '+numeric(x)+' '+numeric(y)+' Tm ('+pdfText(value)+') Tj ET');
    const circle=(x,y,r,colour)=>{
      const k=r*.55228475,p=values=>values.map(numeric).join(' ');commands.push(rgb(colour)+' rg '+p([x+r,y])+' m '+p([x+r,y+k,x+k,y+r,x,y+r])+' c '+p([x-k,y+r,x-r,y+k,x-r,y])+' c '+p([x-r,y-k,x-k,y-r,x,y-r])+' c '+p([x+k,y-r,x+r,y-k,x+r,y])+' c f');
    };
    rect(0,0,W,H,[1,.983,.954]);
    rect(0,H-12,W,12,dayIndex?ink:pink);
    text('PRERNA & SHUBHAM',42,786,10,'F2',pink,1.7);
    text('Two days. So many beautiful moments.',42,751,26,'F3');
    const events=config.events.filter(e=>eventDay(e,config.timezone)===day);
    const date=new Date(events[0].date);
    const dayLabel=new Intl.DateTimeFormat('en-IN',{timeZone:config.timezone,weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date);
    text('DAY '+(dayIndex+1)+' OF 2',42,718,9,'F2',gold,1.4);
    text(dayLabel,42,691,23,'F2');
    text('All times are India Standard Time (IST).',42,670,10,'F1',muted);
    rect(42,568,W-84,77,[.94,.94,.89]);
    text('VENUE FOR ALL CEREMONIES',56,625,8.5,'F2',muted,1.2);
    text(config.venue.name,56,603,17,'F2');
    text(config.venue.address,56,583,10,'F1',muted);
    const xEvent=52,xTime=270,xDress=361,top=535,rowH=62;
    rect(42,top-19,W-84,29,[.91,.85,.80]);
    text('EVENT',xEvent,top-8,9,'F2',ink,1);
    text('TIME · IST',xTime,top-8,9,'F2',ink,.6);
    text('DRESS CODE',xDress,top-8,9,'F2',ink,1);
    events.forEach((event,index)=>{
      const y=top-19-index*rowH;
      if(index%2===0)rect(42,y-rowH,W-84,rowH,[.985,.965,.927]);
      const title=event.title.replace(' · ',' / ');
      wrap(title,28).slice(0,2).forEach((v,i)=>text(v,xEvent,y-22-i*15,12,'F2'));
      const time=new Intl.DateTimeFormat('en-IN',{timeZone:config.timezone,hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(event.date)).replace(/\s+/g,' ');
      text(time,xTime,y-22,12,'F2',pink);
      if(event.id==='reception')text('onwards',xTime,y-38,9,'F1',muted);
      const confirmed=event.dressCode;
      text(confirmed?'Confirmed':'To be confirmed',xDress,y-18,9.5,'F2',confirmed?ink:muted);
      const idea=confirmed||event.dress.split(' · ')[0];
      wrap((confirmed?'':'Idea: ')+idea,28).slice(0,2).forEach((v,i)=>text(v,xDress,y-35-i*12,9,'F1',muted));
      rule(42,y-rowH,W-42,y-rowH);
    });
    text('DRESS NOTE',42,181,8.5,'F2',gold,1.1);
    text('Outfit ideas are suggestions. The family will confirm individual dress codes.',42,164,9.5,'F1',muted);
    text('For the latest details, travel help or an RSVP, contact Rahul.',42,147,9.5,'F1',muted);
    text('View the venue address in Google Maps',42,122,10,'F2',pink);
    rule(42,118,244,118,pink);
    text('Rahul Pareek · '+config.contact.displayPhone,42,95,11,'F2');
    text(config.contact.email,42,77,10,'F1',muted);
    text('With love, from our families.',365,88,14,'F3',pink);
    rule(42,51,W-42,51);
    // The same separate studio footer used on the invitation, preserved in the download.
    text('STUNITY TECH — BY PRATEEK',178,31,7.5,'F4',muted,1.1);
    circle(166.5,30.5,1.8,pink);
    text((dayIndex+1)+' / 2',527,31,8,'F1',muted);
    const bytes=Buffer.from(commands.join('\n')+'\n','latin1');
    set(content,Buffer.concat([Buffer.from('<< /Length '+bytes.length+' >>\nstream\n','latin1'),bytes,Buffer.from('endstream','latin1')]));
    const url=new URL(config.venue.mapsUrl);
    if(url.protocol!=='https:')throw Error('The itinerary venue link must use HTTPS.');
    set(link,'<< /Type /Annot /Subtype /Link /Rect [42 116 250 136] /Border [0 0 0] /A << /S /URI /URI ('+pdfText(url.href)+') >> >>');
    set(page,'<< /Type /Page /Parent '+pages+' 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 '+regular+' 0 R /F2 '+bold+' 0 R /F3 '+serif+' 0 R /F4 '+mono+' 0 R >> >> /Contents '+content+' 0 R /Annots ['+link+' 0 R] >>');
  }
  set(pages,'<< /Type /Pages /Count '+pageIds.length+' /Kids ['+pageIds.map(id=>id+' 0 R').join(' ')+'] >>');
  set(catalog,'<< /Type /Catalog /Pages '+pages+' 0 R >>');
  set(info,'<< /Title (Prerna & Shubham - Wedding Itinerary - 1 & 2 December 2026) /Author (Stunity Tech - by Prateek) /Subject (Two-day programme, venue and dress guidance) >>');
  const chunks=[Buffer.from('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n','latin1')],offsets=[0];let length=chunks[0].length;
  objects.forEach((object,index)=>{
    if(!object)throw Error('Incomplete itinerary PDF');
    offsets.push(length);const chunk=Buffer.concat([Buffer.from((index+1)+' 0 obj\n','latin1'),object,Buffer.from('\nendobj\n','latin1')]);chunks.push(chunk);length+=chunk.length;
  });
  const xref=length,tail='xref\n0 '+(objects.length+1)+'\n0000000000 65535 f \n'+offsets.slice(1).map(offset=>String(offset).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objects.length+1)+' /Root '+catalog+' 0 R /Info '+info+' 0 R >>\nstartxref\n'+xref+'\n%%EOF\n';
  chunks.push(Buffer.from(tail,'latin1'));return Buffer.concat(chunks);
}
