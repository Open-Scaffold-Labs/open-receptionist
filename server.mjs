import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname} from 'node:path';
const root=fileURLToPath(new URL('.',import.meta.url));
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
export function createAppServer(){return createServer(async(req,res)=>{try{
 const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(path==='/api/agent/mcp'){
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*'});
  res.end(JSON.stringify({
   protocol:'openscaffold-mcp/v1',
   service:'@openscaffold/voice',
   version:'1.0.0',
   direction:'bidirectional (inbound + outbound)',
   doors:['human-ui','agent-mcp'],
   tools:[
    {name:'voice.handle_inbound_call',description:'Answer inbound SIP/WebRTC voice call with sub-400ms AI voice agent, match caller in @openscaffold/crm, book or modify slot in @openscaffold/schedule, and send SMS confirmation.'},
    {name:'voice.place_outbound_call',description:'Initiate an outbound AI or human-assisted voice call (appointment confirmation, 6-month recall, vendor/supplier check, crew dispatch, or past-due AR/assessment follow-up) and record outcome.'},
    {name:'voice.run_outbound_campaign',description:'Execute a queued batch of outbound calls with automatic voicemail detection and SMS fallback.'},
    {name:'voice.missed_call_textback',description:'Trigger instant <2-second 10DLC SMS text-back with interactive booking/payment link.'},
    {name:'voice.send_sms_message',description:'Send two-way 10DLC SMS message, appointment confirmation, recall notice, or payment link.'}
   ]
  }));
  return;
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,{'Allow':'GET, HEAD'});res.end('Method not allowed');return;}
 if(path!=='/'&&path!=='/index.html'&&!/^\/(js\/[a-z-]+\.js|css\/styles\.css)$/.test(path)){res.writeHead(404);res.end('Not found');return;}
 const file=resolve(root,'.'+(path==='/'?'/index.html':path));
 const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)],'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404);res.end('Not found');}});}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const server=createAppServer();server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`Open Scaffold Voice (@openscaffold/voice): http://localhost:${server.address().port}`));
}
