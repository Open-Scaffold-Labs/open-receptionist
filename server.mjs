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
   service:'@openscaffold/voice-receptionist',
   version:'1.0.0',
   doors:['human-ui','agent-mcp'],
   tools:[
    {name:'receptionist.handle_inbound_call',description:'Answer live SIP/WebRTC voice call with sub-400ms AI voice agent, look up caller in @openscaffold/crm, book slot in @openscaffold/schedule, and send SMS confirmation.'},
    {name:'receptionist.missed_call_textback',description:'Trigger instant <2-second 10DLC SMS text-back with interactive booking/payment link when all lines are busy or caller hangs up.'},
    {name:'receptionist.send_sms_campaign',description:'Send two-way 10DLC SMS appointment reminder, recall notice, or Google review request at $0.004 wholesale carrier rate.'},
    {name:'receptionist.generate_pay_link',description:'Attach @openscaffold/payment $0.15 bank ACH or Apple Pay deposit link directly inside a voice/SMS booking thread.'}
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
 const server=createAppServer();server.listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log(`Open Receptionist OS: http://localhost:${server.address().port}`));
}
