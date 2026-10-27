export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(JSON.stringify({
    protocol: 'openscaffold-mcp/v1',
    service: '@openscaffold/voice',
    version: '1.0.0',
    direction: 'bidirectional (inbound + outbound)',
    doors: ['human-ui', 'agent-mcp'],
    tools: [
      {name: 'voice.handle_inbound_call', description: 'Answer inbound SIP/WebRTC voice call with sub-400ms AI voice agent, match caller in @openscaffold/crm, book or modify slot in @openscaffold/schedule, and send SMS confirmation.'},
      {name: 'voice.place_outbound_call', description: 'Initiate an outbound AI or human-assisted voice call (appointment confirmation, 6-month recall, vendor/supplier check, crew dispatch, or past-due AR/assessment follow-up) and record outcome.'},
      {name: 'voice.run_outbound_campaign', description: 'Execute a queued batch of outbound calls (e.g., tomorrow appointment confirmations, overdue hygiene/service recalls, or HOA/event reminders) with automatic voicemail detection and SMS fallback.'},
      {name: 'voice.missed_call_textback', description: 'Trigger instant <2-second 10DLC SMS text-back with interactive booking/payment link when all lines are busy or caller hangs up.'},
      {name: 'voice.send_sms_message', description: 'Send two-way 10DLC SMS message, appointment confirmation, recall notice, or payment link.'}
    ]
  }));
}
