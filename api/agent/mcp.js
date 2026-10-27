export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(JSON.stringify({
    protocol: 'openscaffold-mcp/v1',
    service: '@openscaffold/voice-receptionist',
    version: '1.0.0',
    doors: ['human-ui', 'agent-mcp'],
    tools: [
      {name: 'receptionist.handle_inbound_call', description: 'Answer live SIP/WebRTC voice call with sub-400ms AI voice agent, look up caller in @openscaffold/crm, book slot in @openscaffold/schedule, and send SMS confirmation.'},
      {name: 'receptionist.missed_call_textback', description: 'Trigger instant <2-second 10DLC SMS text-back with interactive booking/payment link when all lines are busy or caller hangs up.'},
      {name: 'receptionist.send_sms_campaign', description: 'Send two-way 10DLC SMS appointment reminder, recall notice, or Google review request at $0.004 wholesale carrier rate.'},
      {name: 'receptionist.generate_pay_link', description: 'Attach @openscaffold/payment $0.15 bank ACH or Apple Pay deposit link directly inside a voice/SMS booking thread.'}
    ]
  }));
}
